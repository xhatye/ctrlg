import {hasPro} from './ai-access.mjs';
import {getExam} from './exam-bank.mjs';
import {trainingDay} from './training-time.mjs';
const error=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const validId=id=>{if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{8,80}$/.test(id))error('Session invalide.');return id;};
const completed=(a,now)=>a.status==='finished'||a.mode==='timed'&&now>=Date.parse(a.endsAt);
async function pro(uid,deps,now){const u=await deps.db.collection('users').doc(uid).get();if(!hasPro(u.data(),now))error('Un accès Pro actif est nécessaire.',403);}
export function examResponse(a,now){
 const done=completed(a,now);
 const {paper,...stored}=a,full=paper || getExam(a.examId,{correction:true});
 const exam=done?full:{...full,dossiers:full.dossiers.map(d=>({...d,questions:d.questions.map(({answer,rubric,...q})=>q)}))};
 return {...stored,status:done?(a.status==='finished'?'finished':'expired'):'active',serverNow:new Date(now).toISOString(),exam};
}
function answersFor(exam,answers){
 if(!answers||typeof answers!=='object'||Array.isArray(answers))error('Réponses invalides.');
 const ids=new Set(exam.dossiers.flatMap(d=>d.questions.map(q=>q.id))),result={};let total=0;
 for(const [key,value]of Object.entries(answers)){
  if(!ids.has(key)||typeof value!=='string'||value.length>3000)error('Une réponse dépasse les limites du sujet.');
  total+=value.length;result[key]=value;
 }if(total>24000)error('La copie dépasse 24 000 caractères.');return result;
}
export async function startExam(uid,body,deps,now=Date.now()){
 const id=validId(body.requestId),exam=getExam(body.examId);if(!['timed','practice'].includes(body.mode))error('Mode invalide.');
 const root=deps.db.collection('userExams').doc(uid),ref=root.collection('attempts').doc(id);
 const attempt=await deps.db.runTransaction(async tx=>{
  const u=await tx.get(deps.db.collection('users').doc(uid));if(!hasPro(u.data(),now))error('Un accès Pro actif est nécessaire.',403);
  const old=await tx.get(ref),meta=(await tx.get(root)).data()||{};
  if(old.exists){if(old.data().examId!==body.examId||old.data().mode!==body.mode)error('Identifiant de session déjà utilisé.',409);return old.data();}
  const day=trainingDay(now),used=meta.day===day?meta.startedToday || 0:0;if(used>=20)error('Vous avez déjà commencé 20 sujets aujourd’hui.',429);
  const data={id,examId:exam.id,module:exam.module,paper:getExam(exam.id,{correction:true}),mode:body.mode,status:'active',startedAt:new Date(now).toISOString(),endsAt:body.mode==='timed'?new Date(now+exam.durationMinutes*60000).toISOString():null,answers:{},revision:0};
  tx.set(ref,data);tx.set(root,{day,startedToday:used+1});return data;
 });return examResponse(attempt,now);
}
export async function getAttempt(uid,id,deps,now=Date.now()){
 await pro(uid,deps,now);const ref=deps.db.collection('userExams').doc(uid).collection('attempts').doc(validId(id)),snapshot=await ref.get();if(!snapshot.exists)error('Session introuvable.',404);return examResponse(snapshot.data(),now);
}
export async function listAttempts(uid,deps,now=Date.now()){
 await pro(uid,deps,now);const result=await deps.db.collection('userExams').doc(uid).collection('attempts').orderBy('startedAt','desc').limit(12).get();
 return result.docs.map(doc=>{const a=doc.data();return {id:a.id,examId:a.examId,module:a.module,mode:a.mode,status:completed(a,now)?'finished':'active',startedAt:a.startedAt,endsAt:a.endsAt,selfScore:a.selfScore??null,title:a.paper?.title || getExam(a.examId).title};});
}
export async function updateAttempt(uid,body,deps,now=Date.now()){
 const id=validId(body.attemptId);if(!['save','finish','assess'].includes(body.action))error('Action invalide.');
 const ref=deps.db.collection('userExams').doc(uid).collection('attempts').doc(id);
 const attempt=await deps.db.runTransaction(async tx=>{
  const u=await tx.get(deps.db.collection('users').doc(uid));if(!hasPro(u.data(),now))error('Un accès Pro actif est nécessaire.',403);
  const snapshot=await tx.get(ref);if(!snapshot.exists)error('Session introuvable.',404);const a=snapshot.data(),done=completed(a,now);
  if(body.action==='finish'&&a.status==='finished')return a;
  if(body.revision!==a.revision)error('Une autre fenêtre a modifié la copie. Rechargez la session pour retrouver la version enregistrée.',409);
  let next={...a,revision:a.revision+1,updatedAt:new Date(now).toISOString()};
  if(body.action==='assess'){
   if(!done)error('Rendez votre copie avant de consulter le barème.',409);
   if(!Array.isArray(body.criteria)||body.criteria.length>60||new Set(body.criteria).size!==body.criteria.length)error('Comparaison invalide.');
   const exam=a.paper || getExam(a.examId,{correction:true}),all=exam.dossiers.flatMap(d=>d.questions.flatMap(q=>q.rubric.criteria.map(c=>({id:q.id+'/'+c.id,points:c.points}))));
   if(body.criteria.some(id=>!all.some(c=>c.id===id)))error('Critère inconnu.');
   next.criteria=body.criteria;next.selfScore=all.filter(c=>body.criteria.includes(c.id)).reduce((sum,c)=>sum+c.points,0);next.assessedAt=new Date(now).toISOString();
  }else{
   if(body.action==='save'&&done)error('Le temps est écoulé ou la copie est déjà rendue. Les dernières réponses enregistrées sont conservées.',409);
   if(!done)next.answers=answersFor(a.paper || getExam(a.examId),body.answers);
   if(body.action==='finish'){next.status='finished';next.finishedAt=new Date(now).toISOString();next.expired=done&&a.status!=='finished';}
  }
  tx.set(ref,next);return next;
 });return examResponse(attempt,now);
}
