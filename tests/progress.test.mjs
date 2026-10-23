import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeEvents,applyLearningEvent,learningSteps} from '../lib/learning-progress.mjs';
import {getProgress,writeProgress} from '../lib/progress-service.mjs';
import {MODULES,moduleCatalogue,studyModule} from '../lib/study-content.mjs';
import handler from '../api/progress.js';
const catalogue=Object.fromEntries(Object.keys(MODULES).map(id=>[id,moduleCatalogue(id)]));
const event=(type,extra={})=>({id:'event_'+type+'_12345678',module:'UE9',chapter:'reperes',type,...extra});
function memory(profile={isPro:true}){
 const records=new Map([['users/owner',profile],['users/other',{isPro:true,name:'untouched'}]]);
 const ref=path=>({path,doc:id=>ref(path+'/'+id),collection:name=>ref(path+'/'+name),get:async()=>snapshot(path)});
 const snapshot=path=>({exists:records.has(path),data:()=>structuredClone(records.get(path))});
 let chain=Promise.resolve();
 const db={collection:ref,runTransaction:fn=>{const run=chain.then(async()=>{const writes=[];const result=await fn({get:async r=>snapshot(r.path),set:(r,d)=>writes.push([r.path,structuredClone(d)])});for(const [p,d]of writes)records.set(p,d);return result;});chain=run.catch(()=>{});return run;}};
 return {db,records};
}
test('learning steps distinguish activity, sufficient quiz score and self-review',()=>{
 assert.equal(learningSteps().started,false);
 const attempted=applyLearningEvent({chapters:{}},event('quiz',{total:4,correct:1}),0).chapters['UE9/reperes'];
 assert.equal(learningSteps(attempted).done,0);assert.equal(learningSteps(attempted).started,true);
 let progress={chapters:{}};
 for(const e of [event('lesson'),event('quiz',{total:1,correct:1}),event('cards',{reviewed:3,known:0}),event('case',{variant:0})])progress=applyLearningEvent(progress,e,0);
 assert.equal(learningSteps(progress.chapters['UE9/reperes']).done,2);
 progress=applyLearningEvent(progress,event('quiz',{total:4,correct:4}),1);
 progress=applyLearningEvent(progress,event('cards',{reviewed:1,known:1}),2);
 assert.equal(learningSteps(progress.chapters['UE9/reperes']).done,4);
 assert.equal(progress.chapters['UE9/reperes'].questionsAnswered,5);
});
test('invalid learning events cannot write arbitrary chapters, scores or receipts',()=>{
 for(const module of [null,['UE9'],{id:'UE9'}])assert.throws(()=>normalizeEvents([event('lesson',{module})],catalogue),{status:400});
 for(const e of [event('unknown'),event('lesson',{chapter:'__proto__'}),event('quiz',{total:0,correct:0}),event('quiz',{total:4,correct:5}),event('cards',{reviewed:101,known:1}),event('case',{variant:catalogue.UE9.chapters.find(c=>c.id==='reperes').caseCount}),event('lesson',{id:'a/b'})])assert.throws(()=>normalizeEvents([e],catalogue),{status:400});
 assert.throws(()=>normalizeEvents([event('lesson'),event('lesson')],catalogue),{status:400});
 assert.throws(()=>normalizeEvents(Array.from({length:21},(_,i)=>event('lesson',{id:'abcdefgh'+i})),catalogue),{status:400});
 const clean=normalizeEvents([event('lesson',{uid:'other',isPro:true})],catalogue)[0];assert.equal(clean.uid,undefined);assert.equal(clean.isPro,undefined);
});
test('progress is private, idempotent, concurrency-safe and preserves profile and history',async()=>{
 const profile={isPro:true,history:[{type:'qcm'}],mastery:{UE9:{best:70}}},deps=memory(profile);
 const first=await writeProgress('owner',[event('lesson')],deps,catalogue);
 assert.equal(first.chapters['UE9/reperes'].lessonReads,1);
 const receipt=deps.records.get('userLearning/owner/events/'+event('lesson').id);
 receipt.event=Object.fromEntries(Object.entries(receipt.event).reverse());
 await writeProgress('owner',[event('lesson')],deps,catalogue);
 assert.equal((await getProgress('owner',deps.db)).chapters['UE9/reperes'].lessonReads,1);
 await Promise.all([writeProgress('owner',[event('cards',{id:'cards_receipt_01',reviewed:4,known:2})],deps,catalogue),writeProgress('owner',[event('quiz',{id:'quiz_receipt_01',total:4,correct:4})],deps,catalogue)]);
 assert.equal((await getProgress('owner',deps.db)).chapters['UE9/reperes'].cardsReviewed,4);
 assert.equal((await getProgress('owner',deps.db)).chapters['UE9/reperes'].quizAttempts,1);
 assert.deepEqual(deps.records.get('users/owner'),profile);assert.equal(deps.records.has('userLearning/other'),false);
 await assert.rejects(writeProgress('owner',[event('cards',{id:'cards_receipt_01',reviewed:4,known:3})],deps,catalogue),{status:409});
});
test('free and expired users cannot change progress; existing progress remains readable',async()=>{
 for(const profile of [{isPro:false},{isPro:true,proExpiresAt:'2000-01-01'}]){
  const deps=memory(profile);
  await assert.rejects(writeProgress('owner',[event('lesson')],deps,catalogue),{status:403});
  assert.equal(deps.records.has('userLearning/owner'),false);
  assert.deepEqual(await getProgress('owner',deps.db),{version:1,chapters:{}});
 }
});
test('progress API rejects anonymous calls and unsupported methods without server credentials',async()=>{
 for(const method of ['GET','POST','DELETE']){
  const result={},res={setHeader:(k,v)=>{result[k]=v;},status:s=>{result.status=s;return res;},json:d=>{result.data=d;return res;}};
  await handler({method,headers:{}},res);assert.equal(result.status,method==='DELETE'?405:401);assert.equal(result['Cache-Control'],'private, no-store');
 }
});
test('progress quota blocks new writes but permits idempotent retries',async()=>{
 const deps=memory(),now=Date.parse('2026-10-13T12:00:00Z');
 await writeProgress('owner',[event('lesson')],deps,catalogue,now);
 const p=deps.records.get('userLearning/owner');p.activitiesToday=500;
 await writeProgress('owner',[event('lesson')],deps,catalogue,now);
 await assert.rejects(writeProgress('owner',[event('lesson',{id:'another_event_1234'})],deps,catalogue,now),{status:429});
 assert.equal(deps.records.has('userLearning/owner/events/another_event_1234'),false);
});
test('knowledge and application sessions sample unique questions without materialising the bank',()=>{
 const m=MODULES.UE9;assert.ok(m.notions.length<moduleCatalogue('UE9').questionCount/50);
 const knowledge=studyModule('UE9','qcm',Math.random,{focus:'knowledge',count:20});
 for(const item of knowledge.items){
  const [,chapter,slot]=item.id.split(':'),canonical=m.chapters.find(c=>c.id===chapter).quiz[Number(slot.slice(1))];
  assert.equal(canonical.editorialRevision,'quiz-v2-2026-10-20');
  assert.equal(item.difficulte,{knowledge:'Connaissances',scenario:'Mise en situation',diagnosis:'Analyse',calculation:'Calcul'}[canonical.questionKind]);
 }
 assert.equal(new Set(knowledge.items.map(i=>i.id)).size,20);
 const application=studyModule('UE9','cards',Math.random,{focus:'application',count:100});
 assert.equal(new Set(application.items.map(i=>i.id)).size,100);assert.ok(application.items.every(i=>i.kind==='Exercice de calcul'));
});
