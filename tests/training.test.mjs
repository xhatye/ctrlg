import test from 'node:test';
import assert from 'node:assert/strict';
import {EXAM_CATALOGUE,getExam} from '../lib/exam-bank.mjs';
import {startExam,getAttempt,updateAttempt} from '../lib/exam-service.mjs';
import {normalizeReviewEvents,resolveReviewItem,scheduleReview} from '../lib/review-engine.mjs';
import {recordReviews,reviewQueue} from '../lib/review-service.mjs';
import {saveFeedback,publishedFeedback,ownFeedback,withdrawFeedback} from '../lib/feedback-service.mjs';
import {trainingDay} from '../lib/training-time.mjs';
import {MODULES,studyModule} from '../lib/study-content.mjs';
import handler from '../api/training.js';
const now=Date.parse('2026-10-14T12:00:00Z');
function memory(profile={isPro:true}){
 const records=new Map([['users/owner',profile],['users/other',{isPro:true}]]);
 const snapshot=path=>({exists:records.has(path),id:path.split('/').at(-1),data:()=>structuredClone(records.get(path)),ref:{update:async patch=>records.set(path,{...records.get(path),...patch})}});
 const query=(path,filters=[],sort=null,count=Infinity)=>({
  where:(key,operator,value)=>query(path,[...filters,{key,operator,value}],sort,count),orderBy:(key,direction='asc')=>query(path,filters,{key,direction},count),limit:n=>query(path,filters,sort,n),
  get:async()=>{let docs=[...records.keys()].filter(p=>p.startsWith(path+'/')&&p.slice(path.length+1).split('/').length===1).map(snapshot).filter(d=>filters.every(f=>f.operator==='=='?d.data()[f.key]===f.value:f.operator==='<='?d.data()[f.key]<=f.value:false));if(sort)docs.sort((a,b)=>(a.data()[sort.key]>b.data()[sort.key]?1:-1)*(sort.direction==='desc'?-1:1));docs=docs.slice(0,count);return {docs,size:docs.length};}
 });
 const ref=path=>({...query(path),path,doc:id=>ref(path+'/'+id),collection:name=>ref(path+'/'+name),get:async()=>snapshot(path)});
 let chain=Promise.resolve();const db={collection:path=>({...ref(path),...query(path)}),runTransaction:fn=>{const next=chain.then(async()=>{const writes=[];const result=await fn({get:async r=>snapshot(r.path),set:(r,v)=>writes.push([r.path,structuredClone(v)])});writes.forEach(([p,v])=>records.set(p,v));return result;});chain=next.catch(()=>{});return next;}};
 // Collections below documents also need query semantics without losing doc get.
 const document=path=>({path,doc:id=>document(path+'/'+id),collection:name=>collection(path+'/'+name),get:async()=>snapshot(path)});
 const collection=path=>({...query(path),path,doc:id=>document(path+'/'+id)});db.collection=collection;
 return {db,records};
}

test('60 original compositions have three dossiers, six annexes, twelve questions and an exact barème of 20',()=>{
 assert.equal(EXAM_CATALOGUE.length,60);const unique=new Set();
 for(const meta of EXAM_CATALOGUE){const plain=getExam(meta.id),full=getExam(meta.id,{correction:true});assert.equal(plain.dossiers.length,3);
  const qs=full.dossiers.flatMap(d=>d.questions);assert.equal(qs.length,12);assert.equal(qs.reduce((n,q)=>n+q.points,0),20);assert.equal(full.dossiers.flatMap(d=>d.documents).length,6);
  assert.ok(plain.instructions.some(p=>p.includes('Aucun sujet')));
  assert.ok(plain.dossiers.flatMap(d=>d.questions).every(q=>!Object.hasOwn(q,'answer')&&!Object.hasOwn(q,'rubric')));
  for(const q of qs){assert.ok(q.answer.length>10);assert.ok(q.rubric.criteria.every(c=>c.points>0&&c.expected.length>3));assert.equal(q.rubric.criteria.reduce((n,c)=>n+c.points,0),q.points);}
  const key=plain.module+plain.dossiers.map(d=>d.chapter).join('|');assert.ok(!unique.has(key));unique.add(key);
 }
 for(const module of Object.keys(MODULES))assert.equal(EXAM_CATALOGUE.filter(e=>e.module===module).length,3);
 assert.throws(()=>getExam('__proto__'),{status:404});
});

test('exam copies are private, idempotent, versioned, timed by the server and correction stays locked',async()=>{
 const deps=memory(),body={examId:'UE9-sujet-1',requestId:'exam_receipt_123456',mode:'timed',uid:'other'};
 const started=await startExam('owner',body,deps,now);assert.equal(started.status,'active');assert.ok(started.exam.dossiers.every(d=>d.questions.every(q=>!q.answer)));assert.equal(started.endsAt,new Date(now+90*60000).toISOString());
 const again=await startExam('owner',body,deps,now+1000);assert.equal(again.startedAt,started.startedAt);assert.equal(deps.records.get('userExams/owner').startedToday,1);
 assert.equal(deps.records.has('userExams/other/attempts/'+body.requestId),false);
 await assert.rejects(getAttempt('other',body.requestId,deps,now),{status:404});
 const saved=await updateAttempt('owner',{action:'save',attemptId:started.id,revision:0,answers:{'d1-q1':'Ma réponse argumentée.'}},deps,now+2000);assert.equal(saved.revision,1);
 await assert.rejects(updateAttempt('owner',{action:'save',attemptId:started.id,revision:0,answers:{}},deps,now+3000),{status:409});
 await assert.rejects(updateAttempt('owner',{action:'assess',attemptId:started.id,revision:1,criteria:[]},deps,now+3000),{status:409});
 await assert.rejects(updateAttempt('owner',{action:'save',attemptId:started.id,revision:1,answers:{'d9-q0':'Injection'}},deps,now+3000),{status:400});
 const expired=await getAttempt('owner',started.id,deps,now+91*60000);assert.equal(expired.status,'expired');assert.ok(expired.exam.dossiers[0].questions[0].answer);
 await assert.rejects(updateAttempt('owner',{action:'save',attemptId:started.id,revision:1,answers:{'d1-q1':'Réponse tardive'}},deps,now+91*60000),{status:409});
 const finished=await updateAttempt('owner',{action:'finish',attemptId:started.id,revision:1,answers:{'d1-q1':'Réponse tardive'}},deps,now+91*60000);assert.equal(finished.answers['d1-q1'],'Ma réponse argumentée.');assert.equal(finished.expired,true);
 const criteria=finished.exam.dossiers.flatMap(d=>d.questions.flatMap(q=>q.rubric.criteria.map(c=>q.id+'/'+c.id)));
 const assessed=await updateAttempt('owner',{action:'assess',attemptId:started.id,revision:2,criteria},deps,now+92*60000);assert.equal(assessed.selfScore,20);
 await assert.rejects(updateAttempt('owner',{action:'assess',attemptId:started.id,revision:3,criteria:['fake']},deps,now+93*60000),{status:400});
});

test('free or expired accounts cannot start, save, retrieve private exams or record revisions',async()=>{
 for(const profile of [{isPro:false},{isPro:true,proExpiresAt:'2000-01-01'}]){const deps=memory(profile);await assert.rejects(startExam('owner',{examId:'UE9-sujet-1',requestId:'receipt_123456',mode:'timed'},deps,now),{status:403});await assert.rejects(getAttempt('owner','receipt_123456',deps,now),{status:403});await assert.rejects(recordReviews('owner',[{receipt:'review_123456',kind:'card',itemId:'UE9:reperes:card0',known:false}],deps,now),{status:403});assert.equal(deps.records.size,2);}
});

test('spaced revision checks actual quiz answers, persists dates, deduplicates retries and schedules 1/3/7/14/30/60 days',async()=>{
 const deps=memory(),item=resolveReviewItem('quiz','UE9:reperes:n0');
 const fail={receipt:'quiz_failure_1234',kind:'quiz',itemId:item.id,selected:item.options[1],correct:true,uid:'other'};
 const normalized=normalizeReviewEvents([fail])[0];assert.equal(normalized.correct,false);assert.equal(normalized.uid,undefined);
 await recordReviews('owner',[fail],deps,now);await recordReviews('owner',[fail],deps,now+1000);assert.equal(deps.records.get('userReview/owner').totalItems,1);
 const queue=await reviewQueue('owner',deps,now);assert.equal(queue.items.length,0);assert.equal(queue.mistakeItems.length,1);assert.equal(queue.weakChapters[0].chapter,'reperes');assert.equal((await reviewQueue('owner',deps,now+86400000)).items.length,1);
 await assert.rejects(recordReviews('owner',[{...fail,selected:item.a}],deps,now),{status:409});
 let state={};for(const days of [1,3,7,14,30,60]){state=scheduleReview(state,true,now);assert.equal(Date.parse(state.dueAt)-now,days*86400000);}
 state=scheduleReview(state,false,now);assert.equal(state.streak,0);assert.equal(Date.parse(state.dueAt)-now,86400000);
 for(const kind of ['quiz','card'])for(const id of ['UE99:reperes:n0','UE9:missing:n0','UE9:reperes:n99999','UE9:cmp-periodique:v2650:0','UE9:reperes:card9999','__proto__:x:n0'])assert.throws(()=>resolveReviewItem(kind,id),{status:400});
 const series=studyModule('UE9','cards',()=>.3,{chapter:'cmp-periodique',count:10,focus:'application'});assert.ok(series.items.every(c=>resolveReviewItem('card',c.id).chapter==='cmp-periodique'));
});

test('all 205 case corrections have specific positive-point criteria with complete expected answers',()=>{
 for(const [module,m]of Object.entries(MODULES))for(const c of m.chapters){const cas=studyModule(module,'case',()=>.2,{chapter:c.id});for(const q of cas.questions){assert.equal(q.rubric.points,3);assert.equal(q.rubric.criteria.reduce((n,c)=>n+c.points,0),3);assert.ok(q.rubric.criteria.every(c=>c.expected&&c.points>0));assert.ok(q.rubric.commonErrors.length>0);}}
});

test('feedback requires an actual used account, stays pending, excludes private identities and needs publication consent',async()=>{
 const deps=memory(),input={rating:3,alias:'Étudiant test',level:'DCG',text:'Le cas travaillé est utile, mais je voudrais une explication supplémentaire.',publicationConsent:false,uid:'other',status:'published'};
 await assert.rejects(saveFeedback('owner',input,deps,now),{status:403});deps.records.set('userLearning/owner',{chapters:{'UE9/reperes':{lastActivityAt:new Date(now).toISOString()}}});
 await saveFeedback('owner',input,deps,now);const doc=deps.records.get('studentFeedback/owner');assert.equal(doc.status,'pending');assert.equal(doc.uid,undefined);assert.deepEqual(await publishedFeedback(deps.db),[]);
 doc.status='published';assert.deepEqual(await publishedFeedback(deps.db),[]);doc.publicationConsent=true;
 const pub=await publishedFeedback(deps.db);assert.equal(pub.length,1);assert.equal(pub[0].text,input.text);assert.equal(pub[0].uid,undefined);assert.equal(pub[0].email,undefined);
 await saveFeedback('owner',{...input,publicationConsent:true},deps,now+1000);assert.equal(deps.records.get('studentFeedback/owner').status,'pending');
 await assert.rejects(saveFeedback('owner',{...input,text:'Court'},deps,now),{status:400});
});

test('training endpoint rejects anonymous private actions before loading credentials and public catalogue contains no corrections',async()=>{
 const call=async(method,url,body)=>{const result={},res={setHeader:(k,v)=>{result[k]=v;},status:s=>{result.status=s;return res;},json:data=>{result.data=data;return res;}};await handler({method,url,body,headers:{}},res);return result;};
 for(const type of ['attempt','attempts','queue','own-feedback'])assert.equal((await call('GET','/api/training?type='+type)).status,401);
 for(const action of ['start','save','finish','assess','review','feedback','withdraw-feedback'])assert.equal((await call('POST','/api/training',{action})).status,401);
 const publicCatalogue=await call('GET','/api/training?type=exam-catalog');assert.equal(publicCatalogue.status,200);assert.equal(publicCatalogue.data.items.length,60);assert.ok(!JSON.stringify(publicCatalogue.data).includes('criteria'));
 assert.equal((await call('DELETE','/api/training')).status,405);
});

test('practice sessions have no deadline and simultaneous saves cannot silently replace each other',async()=>{
 const deps=memory(),a=await startExam('owner',{examId:'UE9-sujet-2',requestId:'practice_12345678',mode:'practice'},deps,now);
 assert.equal(a.endsAt,null);assert.equal((await getAttempt('owner',a.id,deps,now+365*86400000)).status,'active');
 const writes=await Promise.allSettled(['première','seconde'].map(text=>updateAttempt('owner',{action:'save',attemptId:a.id,revision:0,answers:{'d1-q1':text}},deps,now+1000)));
 assert.equal(writes.filter(w=>w.status==='fulfilled').length,1);assert.equal(writes.find(w=>w.status==='rejected').reason.status,409);
 const live=await getAttempt('owner',a.id,deps,now+2000);assert.equal(live.revision,1);
 await assert.rejects(updateAttempt('owner',{action:'save',attemptId:a.id,revision:1,answers:{'d1-q1':'x'.repeat(3001)}},deps,now+3000),{status:400});
 const finished=await updateAttempt('owner',{action:'finish',attemptId:a.id,revision:1,answers:live.answers},deps,now+3000);
 const repeat=await updateAttempt('owner',{action:'finish',attemptId:a.id,revision:999,answers:{'d1-q1':'modification interdite'}},deps,now+4000);assert.deepEqual(repeat.answers,finished.answers);
});

test('the most recent self-comparison supersedes older missing criteria for the same chapter',async()=>{
 const deps=memory(),full=getExam('UE9-sujet-1',{correction:true}),criteria=full.dossiers.flatMap(d=>d.questions.flatMap(q=>q.rubric.criteria.map(c=>q.id+'/'+c.id)));
 deps.records.set('userExams/owner/attempts/old_copy',{examId:full.id,startedAt:new Date(now-10000).toISOString(),assessedAt:new Date(now-9000).toISOString(),criteria:[]});
 assert.equal((await reviewQueue('owner',deps,now)).weakChapters.length,3);
 deps.records.set('userExams/owner/attempts/new_copy',{examId:full.id,startedAt:new Date(now-8000).toISOString(),assessedAt:new Date(now).toISOString(),criteria});
 assert.equal((await reviewQueue('owner',deps,now)).weakChapters.length,0);
});

test('review identifiers are canonical, concurrent sessions preserve item counts, and quotas allow idempotent retries',async()=>{
 for(const id of ['UE9:reperes:n00','UE9:reperes:card00','UE9:cmp-periodique:v00:0'])for(const kind of ['quiz','card'])assert.throws(()=>resolveReviewItem(kind,id),{status:400});
 const deps=memory(),first={receipt:'unique_review_1234',kind:'card',itemId:'UE9:reperes:card0',known:false};
 await Promise.all([recordReviews('owner',[first],deps,now),recordReviews('owner',[{...first,receipt:'other_review_12345',known:true}],deps,now)]);
 assert.equal(deps.records.get('userReview/owner').totalItems,1);const record=[...deps.records.entries()].find(([p])=>p.startsWith('userReview/owner/items/'))[1];assert.equal(record.attempts,2);
 deps.records.get('userReview/owner').today=500;await recordReviews('owner',[first],deps,now);
 await assert.rejects(recordReviews('owner',[{...first,receipt:'fresh_review_1234'}],deps,now),{status:429});
 assert.equal(trainingDay(Date.parse('2026-10-14T22:30:00Z')),'2026-10-15');assert.equal(trainingDay(Date.parse('2026-12-14T23:30:00Z')),'2026-12-15');
});

test('publication consent can be withdrawn immediately even after the feedback editing quota',async()=>{
 const deps=memory();deps.records.set('studentFeedback/owner',{alias:'Étudiant',text:'Un avis réel comporte des éléments utiles et vérifiables.',level:'DCG',rating:3,status:'published',publicationConsent:true,day:trainingDay(now),updatesToday:3});
 assert.equal((await publishedFeedback(deps.db)).length,1);assert.equal((await ownFeedback('other',deps)).feedback,null);
 await withdrawFeedback('owner',deps,now);assert.equal((await publishedFeedback(deps.db)).length,0);assert.equal((await ownFeedback('owner',deps)).feedback.publicationConsent,false);
 assert.equal(deps.records.has('studentFeedback/other'),false);
});

test('an attempt preserves its subject version without leaking the stored correction before submission',async()=>{
 const deps=memory(),a=await startExam('owner',{examId:'UE9-sujet-1',requestId:'versioned_paper_1234',mode:'practice'},deps,now);
 const stored=deps.records.get('userExams/owner/attempts/'+a.id);assert.ok(stored.paper.dossiers[0].questions[0].answer);assert.equal(a.paper,undefined);
 // A snapshot differs from a later catalogue edition; retrieval must use the snapshot.
 stored.paper.dossiers[0].title='Version conservée de ce dossier';stored.paper.dossiers[0].questions[0].answer='Corrigé conservé de cette version.';
 const active=await getAttempt('owner',a.id,deps,now+1000);assert.equal(active.exam.dossiers[0].title,'Version conservée de ce dossier');assert.equal(active.paper,undefined);assert.equal(active.exam.dossiers[0].questions[0].answer,undefined);
 const done=await updateAttempt('owner',{action:'finish',attemptId:a.id,revision:0,answers:{}},deps,now+2000);assert.equal(done.exam.dossiers[0].questions[0].answer,'Corrigé conservé de cette version.');assert.equal(done.paper,undefined);
});

test('changed or retired questions cannot produce stale weakness signals or block the due queue',async()=>{
 const deps=memory(),event={receipt:'content_changed_1234',kind:'card',itemId:'UE9:reperes:card0',known:false};await recordReviews('owner',[event],deps,now);
 const [key,state]=[...deps.records.entries()].find(([p])=>p.startsWith('userReview/owner/items/'));state.contentSignature='old-content';state.dueAt=new Date(now-1000).toISOString();
 let queue=await reviewQueue('owner',deps,now);assert.equal(queue.items[0].updatedContent,true);assert.equal(queue.mistakeItems.length,0);
 await recordReviews('owner',[{...event,receipt:'current_content_1234',known:true}],deps,now);assert.equal(deps.records.get(key).streak,1);
 deps.records.set('userReview/owner/items/retired',{kind:'card',itemId:'UE9:retired:card0',lastCorrect:false,dueAt:new Date(now-1000).toISOString()});
 queue=await reviewQueue('owner',deps,now);assert.equal(deps.records.get('userReview/owner/items/retired').archived,true);assert.equal(queue.mistakeItems.length,0);
});
