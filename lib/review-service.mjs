import {createHash} from 'node:crypto';
import {hasPro} from './ai-access.mjs';
import {normalizeReviewEvents,resolveReviewItem,scheduleReview} from './review-engine.mjs';
import {trainingDay as day} from './training-time.mjs';
import {getExam} from './exam-bank.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const signature=item=>hash(JSON.stringify([item.q,item.a,item.explanation || '']));
export async function recordReviews(uid,raw,deps,now=Date.now()){
 const events=normalizeReviewEvents(raw),root=deps.db.collection('userReview').doc(uid);
 if(new Set(events.map(e=>e.kind+e.itemId)).size!==events.length)throw Object.assign(new Error('Une question ne peut être enregistrée deux fois dans la même série.'),{status:400});
 return deps.db.runTransaction(async tx=>{
  const profile=await tx.get(deps.db.collection('users').doc(uid));if(!hasPro(profile.data(),now))throw Object.assign(new Error('Un accès Pro actif est nécessaire.'),{status:403});
  const meta=(await tx.get(root)).data() || {};
  const records=[];
  for(const e of events){const receipt=root.collection('events').doc(e.receipt),item=root.collection('items').doc(hash(e.kind+'|'+e.itemId));records.push({e,receipt,item,seen:await tx.get(receipt),old:await tx.get(item)});}
  for(const r of records)if(r.seen.exists&&JSON.stringify(r.seen.data().event)!==JSON.stringify(r.e))throw Object.assign(new Error('Cette révision a déjà été enregistrée avec une autre réponse.'),{status:409});
  const fresh=records.filter(r=>!r.seen.exists),used=meta.day===day(now)?meta.today || 0:0;
  if(used+fresh.length>500)throw Object.assign(new Error('Limite quotidienne de suivi atteinte.'),{status:429});
  const total=(meta.totalItems || 0)+fresh.filter(r=>!r.old.exists).length;if(total>20000)throw Object.assign(new Error('Votre suivi contient déjà 20 000 notions. Les révisions enregistrées restent disponibles ; contactez l’équipe pour étendre ce suivi.'),{status:429});
  for(const r of fresh){const item=resolveReviewItem(r.e.kind,r.e.itemId),stamp=signature(item),old=r.old.data();tx.set(r.item,{...scheduleReview(old?.archived||old?.contentSignature&&old.contentSignature!==stamp?{}:old,r.e.correct,now),contentSignature:stamp,kind:r.e.kind,itemId:r.e.itemId,module:item.module,chapter:item.chapter});tx.set(r.receipt,{event:r.e,at:new Date(now).toISOString()});}
  tx.set(root,{...meta,day:day(now),today:used+fresh.length,totalItems:total,updatedAt:new Date(now).toISOString()});
  return {recorded:fresh.length,totalItems:total};
 });
}
export async function reviewQueue(uid,deps,now=Date.now()){
 const user=await deps.db.collection('users').doc(uid).get();if(!hasPro(user.data(),now))throw Object.assign(new Error('Un accès Pro actif est nécessaire.'),{status:403});
 const root=deps.db.collection('userReview').doc(uid),meta=await root.get();
 // Single-field queries require no composite index. Bounds cap payload and reads.
 const due=await root.collection('items').where('dueAt','<=',new Date(now).toISOString()).orderBy('dueAt').limit(40).get();
 const weak=await root.collection('items').where('lastCorrect','==',false).limit(40).get();
 const obsolete=new Map(),current=doc=>{try{const d=doc.data(),item=resolveReviewItem(d.kind,d.itemId);return d.contentSignature&&d.contentSignature!==signature(item)?{...item,...d,lastCorrect:null,streak:0,mistakes:0,updatedContent:true}:{...item,...d};}catch{obsolete.set(doc.id,doc);return null;}};
 const items=due.docs.map(current).filter(Boolean),mistakeItems=weak.docs.map(current).filter(i=>i&&i.lastCorrect===false);
 // Retain obsolete history, but stop it blocking the bounded queue forever.
 for(const doc of obsolete.values())await doc.ref.update({archived:true,lastCorrect:null,dueAt:'9999-12-31T00:00:00.000Z'});
 const chapters=new Map();for(const item of mistakeItems){const key=item.module+'/'+item.chapter,c=chapters.get(key)||{module:item.module,chapter:item.chapter,title:item.title,mistakes:0};c.mistakes++;chapters.set(key,c);}
 const copies=await deps.db.collection('userExams').doc(uid).collection('attempts').orderBy('assessedAt','desc').limit(6).get(),compared=new Set();
 for(const doc of copies.docs){const attempt=doc.data();if(!attempt.assessedAt)continue;const exam=attempt.paper || getExam(attempt.examId,{correction:true});for(const dossier of exam.dossiers){const key=exam.module+'/'+dossier.chapter;if(compared.has(key))continue;compared.add(key);const missing=dossier.questions.filter(q=>q.rubric.criteria.some(c=>!attempt.criteria.includes(q.id+'/'+c.id))).length;if(!missing)continue;const c=chapters.get(key)||{module:exam.module,chapter:dossier.chapter,title:dossier.title.replace(/^Dossier \d+ : /,''),mistakes:0};c.mistakes+=missing;chapters.set(key,c);}}
 return {serverNow:new Date(now).toISOString(),items,mistakeItems,weakChapters:[...chapters.values()].sort((a,b)=>b.mistakes-a.mistakes),totalItems:meta.data()?.totalItems || 0,limited:due.size===40,mistakesLimited:weak.size===40};
}
