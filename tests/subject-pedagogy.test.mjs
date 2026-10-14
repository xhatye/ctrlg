import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {MODULES,studyModule,moduleCatalogue} from '../lib/study-content.mjs';
import {SUBJECT_PEDAGOGY} from '../lib/subject-pedagogy.mjs';
import {SUBJECT_WORKSHOPS} from '../lib/subject-workshops.mjs';
import {resolveReviewItem} from '../lib/review-engine.mjs';
const baseline=JSON.parse(readFileSync(new URL('./fixtures/study-prefix-2e75783.json',import.meta.url),'utf8'));
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

test('all existing review item prefixes remain identical after course enrichment',()=>{
 for(const [id,chapters] of Object.entries(baseline))for(const [chapter,b]of Object.entries(chapters)){
  const c=MODULES[id].chapters.find(c=>c.id===chapter);assert.ok(c,id+'/'+chapter);
  assert.equal(hash(c.quiz.slice(0,b.quizLength)),b.quizHash,id+'/'+chapter+' old quiz changed');
  assert.equal(hash(c.cards.slice(0,b.cardLength)),b.cardHash,id+'/'+chapter+' old cards changed');
  assert.equal(resolveReviewItem('card',id+':'+chapter+':card0').q,c.cards[0].q);
 }
});
test('all 205 chapters receive a discipline approach, and all 20 UEs have an authored workshop',()=>{
 assert.equal(Object.keys(SUBJECT_PEDAGOGY).length,20);assert.equal(Object.keys(SUBJECT_WORKSHOPS).length,20);
 const families=new Set();let chapters=0;
 for(const [id,m]of Object.entries(MODULES)){
  const p=SUBJECT_PEDAGOGY[id];assert.ok(p);families.add(p.family);assert.equal(p.steps.length,4);
  for(const c of m.chapters){const lesson=studyModule(id,'summary',()=>.2,{chapter:c.id});assert.equal(lesson.pedagogy.title,p.title);assert.equal(lesson.pedagogy.sectionLabel,p.sectionLabel);chapters++;}
  const w=SUBJECT_WORKSHOPS[id];assert.ok(m.chapters.some(c=>c.id===w.chapter));assert.equal(m.chapters.filter(c=>c.workshop).length,1);
  assert.equal(w.quiz.length,4);assert.equal(w.cards.length,4);assert.ok(w.sections.length>=2);
  assert.ok(w.sections.flatMap(s=>s.paragraphs).join(' ').split(/\s+/).length>=120,id+' workshop too brief');
  assert.ok(w.table.rows.every(row=>row.length===w.table.headers.length));
  assert.ok(!JSON.stringify(moduleCatalogue(id)).includes(w.context));
 }
 assert.equal(chapters,205);assert.ok(families.size>=10);assert.notEqual(SUBJECT_PEDAGOGY.UE1.title,SUBJECT_PEDAGOGY.UE3.title);
});
test('new explained alternatives survive shuffling and enriched cards survive mixed sampling and review',()=>{
 for(const [id,w]of Object.entries(SUBJECT_WORKSHOPS)){
  const c=MODULES[id].chapters.find(c=>c.id===w.chapter);
  assert.equal(c.quiz.length,baseline[id][c.id].quizLength+4);assert.equal(c.cards.length,baseline[id][c.id].cardLength+4);
  for(const seed of [.02,.41,.93]){
   const q=studyModule(id,'qcm',()=>seed,{chapter:c.id,count:20,focus:'knowledge'});
   for(const item of q.items.filter(i=>i.optionExplanations)){
    const canonical=c.quiz.find(n=>n.q===item.q);assert.ok(canonical);assert.equal(item.options[item.answer],canonical.correct);
    assert.equal(item.optionExplanations[item.answer],canonical.body);
    for(let j=0;j<4;j++)if(j!==item.answer)assert.equal(item.optionExplanations[j],canonical.wrongReasons[canonical.wrong.indexOf(item.options[j])]);
   }
  }
  const cards=studyModule(id,'cards',()=>.2,{chapter:c.id,count:100,focus:'all'}).items;
  for(const card of w.cards){const item=cards.find(n=>n.q===card.q);assert.ok(item,id+' missing recall item');assert.equal(item.example,card.example);assert.equal(item.pitfall,card.pitfall);assert.equal(resolveReviewItem('card',item.id).example,card.example);}
  for(const n of w.quiz){assert.equal(new Set([n.correct,...n.wrong]).size,4);assert.equal(n.wrongReasons.length,3);assert.ok(n.wrongReasons.every(s=>s.length>12));assert.ok(!/[—–]/.test(n.q+n.body));}
 }
});
test('new numerical workshop answers match independent calculations',()=>{
 const answer=(id,i)=>SUBJECT_WORKSHOPS[id].quiz[i].correct;
 assert.equal(answer('UE3',0),((2000-1800)/2000*100)+' %.');
 assert.equal(answer('UE4',0),(2400*.2)+' €.');assert.equal(answer('UE4',1),(2400*.2-200-80)+' € à payer.');
 assert.equal(answer('UE5',0),(360000-144000).toLocaleString('fr-FR').replaceAll('\u202f',' ')+' €.');assert.equal(answer('UE5',1),((360000/300000-1)*100).toFixed(0)+' %.');
 assert.ok(answer('UE5',2).startsWith((120/108*100).toFixed(2).replace('.',',')));
 assert.equal(answer('UE6',1),(6000/1.1+6000/1.1**2-10000).toFixed(2).replace('.',',')+' €.');
 assert.equal(answer('UE8',0),(100+200)+' €.');assert.equal(answer('UE9',0),(1000+200).toLocaleString('fr-FR').replaceAll('\u202f',' ')+' €.');
 assert.equal(answer('UE10',0),(20000+1000).toLocaleString('fr-FR').replaceAll('\u202f',' ')+' €.');
 assert.equal(answer('UE10',1),((20000+1000)/5).toLocaleString('fr-FR').replaceAll('\u202f',' ')+' €.');
 assert.equal(answer('UE11',0),(80-50)+' €.');assert.equal(answer('UE11',1),(24000/(80-50))+' unités.');
 const terminal=11000*1.02/(.10-.02),enterprise=(11000+terminal)/1.1,equity=enterprise-20000;
 assert.equal(answer('DSCG2',1),Math.round(terminal).toLocaleString('fr-FR').replaceAll('\u202f',' ')+' €.');
 assert.equal(answer('DSCG2',2),(equity/10000).toFixed(2).replace('.',',')+' €.');
 assert.equal(answer('DSCG5',1),(75000+15000+10000+3*12000).toLocaleString('fr-FR').replaceAll('\u202f',' ')+' €.');
});
