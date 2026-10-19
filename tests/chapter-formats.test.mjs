import test from 'node:test';
import assert from 'node:assert/strict';
import {MODULES,studyModule,moduleCatalogue} from '../lib/study-content.mjs';
import {chapterCloze,checkCloze,publicCloze,readingWordCount} from '../lib/chapter-formats.mjs';
import {readStudy} from '../lib/study-access.mjs';
import {CHAPTER_BLOCKS} from '../lib/chapter-blocks.mjs';
import {normalizeReviewEvents,resolveReviewItem} from '../lib/review-engine.mjs';
import {recordReviews,reviewQueue} from '../lib/review-service.mjs';
import handler from '../api/training.js';
const now=Date.parse('2026-10-19T12:00:00Z');
function memory(profile={isPro:true}){
 const records=new Map([['users/test',profile],['userLearning/test',{version:1,chapters:{'UE9/chaine-comptable':{lessonRead:true,quizBest:80,cardsReviewed:5}},legacyField:'keep'}]]);
 const snapshot=path=>({exists:records.has(path),id:path.split('/').at(-1),data:()=>structuredClone(records.get(path)),ref:document(path)});
 function document(path){return {path,get:async()=>snapshot(path),collection:name=>collection(path+'/'+name),update:async value=>records.set(path,{...records.get(path),...value})};}
 function collection(path,filters=[],order=null,limit=Infinity){return {doc:id=>document(path+'/'+id),where:(key,op,value)=>collection(path,[...filters,{key,op,value}],order,limit),orderBy:(key,direction='asc')=>collection(path,filters,{key,direction},limit),limit:n=>collection(path,filters,order,n),get:async()=>{let docs=[...records.keys()].filter(k=>k.startsWith(path+'/')&&!k.slice(path.length+1).includes('/')).map(snapshot).filter(d=>filters.every(f=>f.op==='=='?d.data()[f.key]===f.value:d.data()[f.key]<=f.value));if(order)docs.sort((a,b)=>(a.data()[order.key]>b.data()[order.key]?1:-1)*(order.direction==='desc'?-1:1));docs=docs.slice(0,limit);return {docs,size:docs.length};}};}
 let chain=Promise.resolve();return {records,db:{collection,runTransaction:fn=>{const run=chain.then(async()=>{const writes=[];let writing=false;const result=await fn({get:async r=>{assert.equal(writing,false,'Firestore reads must precede writes');return snapshot(r.path);},set:(r,data)=>{writing=true;writes.push([r.path,structuredClone(data)]);}});writes.forEach(([p,v])=>records.set(p,v));return result;});chain=run.catch(()=>{});return run;}}};
}
test('all reading documents and sheets have semantic structure and accurate public counts; gaps only appear when authored or numerical',()=>{
 let chapters=0,gaps=0,editorial=0;
 for(const [id,m]of Object.entries(MODULES)){
  const classified=CHAPTER_BLOCKS[id].flatMap(b=>b.chapters);assert.equal(new Set(classified).size,m.chapters.length);assert.equal(classified.length,m.chapters.length);
  for(const c of m.chapters){chapters++;const reading=studyModule(id,'reading',()=>.2,{chapter:c.id}),meta=moduleCatalogue(id).chapters.find(x=>x.id===c.id);
   assert.ok(reading.sections.length>=4);assert.ok(reading.sections.every(s=>s.title&&s.blocks.length));assert.ok(reading.sheet.essentials.length>=4);assert.ok(reading.sheet.method.length);assert.ok(reading.sheet.pitfalls.length);
   assert.equal(meta.words,readingWordCount(id,c));assert.ok(meta.words>300);assert.equal(meta.clozeCount,chapterCloze(c).length);
   assert.notEqual(reading.sheet.essentials.map(e=>e.text).join(' '),reading.sections.flatMap(s=>s.blocks.map(b=>b.text||'')).join(' '));
   if(c.editorial){editorial++;assert.ok(reading.comparison.rows.length>=3);assert.ok(reading.sheet.example.steps.length>=2);}
   if(!c.cloze&&!c.variantAt)assert.deepEqual(chapterCloze(c),[],'No automatic definition-label fill-ins');
   const payload=publicCloze(id,c);gaps+=payload.items.length;assert.equal(new Set(payload.items.map(x=>x.id)).size,payload.items.length);
   for(const item of payload.items){assert.ok(item.fields.every(f=>Object.keys(f).every(k=>['type','unit'].includes(k))));assert.equal(item.explanation,undefined);assert.equal(item.accepted,undefined);assert.equal(item.expected,undefined);const canonical=resolveReviewItem('cloze',item.id);assert.equal(canonical.chapter,c.id);}
  }
 }
 assert.equal(chapters,225);assert.equal(editorial,23);assert.equal(gaps,338);
});
test('gap correction accepts explicit equivalents and French numbers, never a mere substring or wrong unit',()=>{
 const item={fields:[{type:'text',accepted:['contre-offre','contre-proposition']}],explanation:'Test'};
 for(const value of ['CONTRE-OFFRE',' contre offre ','contre proposition'])assert.equal(checkCloze(item,[value]).correct,true);
 for(const value of ['une contre-offre peut-être','pas une contre-offre','offre',''])assert.equal(checkCloze(item,[value]).correct,false);
 assert.equal(checkCloze({fields:[{type:'text',accepted:['créance']}],explanation:''},['CREANCE']).correct,true);
 const n={fields:[{type:'number',expected:-1250.5,unit:'€',tolerance:.005001}],explanation:''};
 for(const value of ['−1 250,50','-1250.5','-1\u202f250,50'])assert.equal(checkCloze(n,[value]).correct,true);
 for(const value of ['1250,5','-1250,51','-1,250.50','-1250,50 kg','Infinity','1e3',''])assert.equal(checkCloze(n,[value]).correct,false);
 for(const value of [null,[],[null],['x'.repeat(301)],['1','2']])assert.throws(()=>checkCloze(n,value),{status:400});
});
test('new formats remain server-Pro protected for every subject, including free and expired accounts',async()=>{
 for(const id of Object.keys(MODULES))for(const tool of ['reading','sheet','cloze','visuals']){
  await assert.rejects(readStudy(id,tool,null,{authenticate:async()=>{throw Object.assign(Error('auth'),{status:401});}}),{status:401});
  for(const profile of [{isPro:false},{isPro:true,proExpiresAt:'2000-01-01'}])await assert.rejects(readStudy(id,tool,'token',{authenticate:async()=>({uid:'test'}),db:memory(profile).db}),{status:403});
 }
 const out={},res={setHeader(){},status(s){out.status=s;return this;},json(data){out.data=data;return this;}};await handler({method:'POST',url:'/api/training',headers:{},body:{action:'cloze-check',events:[]}},res);assert.equal(out.status,401);assert.equal(out.data.corrections,undefined);
});
test('gap results and learning are atomic, canonical, idempotent and feed spaced difficulty without overwriting old progress',async()=>{
 const deps=memory(),itemId='UE9:chaine-comptable:cloze:recall-0',event={receipt:'cloze_receipt_1234',itemId,kind:'cloze',answers:['crédit'],correct:true,uid:'other'};
 assert.equal(normalizeReviewEvents([event])[0].correct,false);
 await Promise.all([recordReviews('test',[event],deps,now),recordReviews('test',[event],deps,now+100)]);
 let learning=deps.records.get('userLearning/test');assert.equal(learning.legacyField,'keep');let c=learning.chapters['UE9/chaine-comptable'];assert.equal(c.lessonRead,true);assert.equal(c.quizBest,80);assert.equal(c.cardsReviewed,5);assert.equal(c.clozeAttempts,1);assert.equal(c.clozeAnswered,1);assert.equal(c.clozeCorrect,0);assert.equal(c.clozeLast,0);
 let q=await reviewQueue('test',deps,now);assert.equal(q.mistakeItems.length,1);assert.equal(q.mistakeItems[0].kind,'cloze');assert.equal(q.weakChapters[0].chapter,'chaine-comptable');assert.equal(q.items.length,0);q=await reviewQueue('test',deps,now+86400000);assert.equal(q.items.length,1);
 await assert.rejects(recordReviews('test',[{...event,answers:['débit']}],deps,now),{status:409});
 await recordReviews('test',[{...event,receipt:'cloze_correct_1234',answers:['DEBIT']}],deps,now+86400000);c=deps.records.get('userLearning/test').chapters['UE9/chaine-comptable'];assert.equal(c.clozeAnswered,2);assert.equal(c.clozeCorrect,1);assert.equal(c.clozeLast,100);assert.equal(deps.records.get('userReview/test').totalItems,1);assert.equal((await reviewQueue('test',deps,now+86400000)).mistakeItems.length,0);
 for(const profile of [{isPro:false},{isPro:true,proExpiresAt:'2000-01-01'}]){const denied=memory(profile),before=structuredClone([...denied.records]);await assert.rejects(recordReviews('test',[event],denied,now),{status:403});assert.deepEqual([...denied.records],before);}
});
test('new worked calculations are independently reconstructed from the stated assumptions',()=>{
 const answer=(id,c,i)=>MODULES[id].chapters.find(x=>x.id===c).cas.questions[i].answer;
 assert.ok(answer('UE3','temps-travail-decompte',1).includes(String(4*15*1.25)));
 assert.ok(answer('UE4','bareme-progressif',0).includes('4 000'));
 const jan=3000+12000-4000-14000,feb=jan+15000+4000-13000;assert.equal(jan,-3000);assert.equal(feb,3000);assert.ok(answer('UE6','tresorerie-glissante',1).includes('−3 000'));
 assert.equal(3000+900,(3000-600-100)+(600+900)+100);assert.ok(answer('UE9','paie-dettes-reglement',1).includes('3 900'));
 assert.equal(5000-2*5000/5,3000);assert.ok(answer('UE10','subvention-investissement',1).includes('3 000'));
 const initial=4000+8*1000,flexible=4000+8*1200,actual=14100;assert.equal(actual-initial,(flexible-initial)+(actual-flexible));assert.ok(answer('UE11','budget-flexible',1).includes('+500'));
 const price=y=>50/(1+y)+1050/(1+y)**2,duration=(50/1.05+2*1050/1.05**2)/price(.05);assert.ok(Math.abs(duration-1.95238095238)<1e-9);assert.equal(price(.06).toFixed(2),'981.67');assert.ok(answer('DSCG2','duration-sensibilite',2).includes('981,67'));
 const plot=MODULES.DSCG2.chapters.find(c=>c.id==='duration-sensibilite').editorial.sections.flatMap(s=>s.blocks).find(b=>b.type==='chart');assert.equal(plot.points.find(p=>p.x===5).y,1000);for(let i=0;i<plot.points.length;i++){const p=plot.points[i];assert.equal(p.y,Number(price(p.x/100).toFixed(2)));if(i)assert.ok(p.y<plot.points[i-1].y);}
 assert.equal((110-100)*50+(48-50)*110,110*48-100*50);assert.ok(answer('DSCG3','prevision-glissante',0).includes('+280'));
 assert.equal((100000-80000)*.25,5000);assert.ok(answer('DSCG4','impot-differe-differences',0).includes('5 000'));
 assert.equal(80/200*100,40);assert.equal(30/60*100,50);assert.ok(answer('DSCG7','questionnaire-non-reponse',0).includes('40 %'));
});
