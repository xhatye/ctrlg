import test from 'node:test';
import assert from 'node:assert/strict';
import {MODULES,studyModule} from '../lib/study-content.mjs';
import {studyHelp} from '../lib/study-help.mjs';
import {recruitmentReviewPrompt,RECRUITMENT_TOPICS} from '../lib/recruitment.mjs';
import {caseReviewPrompt} from '../lib/case-review.mjs';
import {reserveCost,USER_BUDGET,DAILY_LIMIT,MONTHLY_LIMIT} from '../lib/ai-budget.mjs';
import {readPersonalCards,savePersonalCard} from '../lib/personal-cards.mjs';
import {revisionPriorities,adaptiveMinutes} from '../lib/revision-priorities.mjs';

test('course help retrieves each real chapter and never accepts client-provided teaching material',()=>{
 for(const [module,bank]of Object.entries(MODULES))for(const chapter of bank.chapters){
  const help=studyHelp({purpose:'lesson-coach',module,chapter:chapter.id,action:'simple',context:'FAKE_CLIENT_TEXT'});
  const data=JSON.parse(help.context.split('\n')[1]);assert.equal(data.chapter,chapter.title);assert.equal(data.notions.length,chapter.notions.length);assert.ok(!help.context.includes('FAKE_CLIENT_TEXT'));
  assert.ok(reserveCost({max_tokens:1200,messages:[{role:'system',content:help.context},{role:'user',content:help.question}]})<USER_BUDGET);
 }
 for(const action of ['unlimited','__proto__',null])assert.throws(()=>studyHelp({purpose:'lesson-coach',module:'UE9',chapter:'reperes',action}),{status:400});
});
test('personal AI cards are grounded in the actual question and the shared AI envelope remains fixed',()=>{
 const q=studyModule('UE9','qcm',()=>.1,{count:5,focus:'knowledge'}).items[0];const help=studyHelp({purpose:'quiz-card',itemId:q.id,selected:q.options[0],correctAnswer:'INJECTED'});
 assert.ok(help.context.includes(q.expl));assert.ok(!help.context.includes('INJECTED'));assert.ok(help.question.includes('JSON'));assert.equal(help.module,'UE9');assert.ok(help.chapter);
 assert.equal(USER_BUDGET,360000);assert.equal(DAILY_LIMIT,20);assert.equal(MONTHLY_LIMIT,300);
});
test('recruitment feedback uses bounded server-owned questions and the existing written-review quota',()=>{
 assert.equal(RECRUITMENT_TOPICS.length,6);
 for(const topic of RECRUITMENT_TOPICS)for(let question=0;question<topic.questions.length;question++){
  const body={purpose:'recruitment-review',topic:topic.id,role:'alternance',question,answer:'Je commence par vérifier la consigne et les pièces, puis je demande une validation.'};
  const prompt=caseReviewPrompt(body),data=JSON.parse(prompt.messages[1].content);
  assert.equal(prompt.purpose,'case-review');assert.equal(data.question,topic.questions[question]);assert.deepEqual(data.criteria,topic.criteria);assert.ok(reserveCost(prompt)<USER_BUDGET);
 }
 for(const extra of [{question:99},{role:'hire-me'},{topic:'__proto__'},{answer:'court'}])assert.throws(()=>recruitmentReviewPrompt({topic:'audit',role:'stage',question:0,answer:'Je vérifie les documents et je pose une question à mon responsable.',...extra}),{status:400});
});
test('personal cards isolate accounts, permit edits at capacity, and never overwrite an unreadable archive',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 const card={module:'UE9',chapter:'reperes',front:'Que contrôle la partie double ?',back:'L’égalité du total des débits et des crédits.'};
 for(let i=0;i<100;i++)savePersonalCard(storage,'student_a',card,'card_'+i);
 assert.equal(readPersonalCards(storage,'student_a').length,100);assert.deepEqual(readPersonalCards(storage,'student_b'),[]);
 assert.throws(()=>savePersonalCard(storage,'student_a',card,'card_101'));
 savePersonalCard(storage,'student_a',{...card,back:'Une égalité, pas l’exhaustivité.'},'card_0');assert.equal(readPersonalCards(storage,'student_a')[0].back,'Une égalité, pas l’exhaustivité.');
 assert.throws(()=>savePersonalCard(storage,'student_a',{...card,front:'x'.repeat(401)},'card_0'));
 values.set('simdcg-personal-cards-v1-broken','broken');assert.throws(()=>savePersonalCard(storage,'broken',card,'card_1'));assert.equal(values.get('simdcg-personal-cards-v1-broken'),'broken');
 assert.throws(()=>readPersonalCards(storage,''));
});
test('revision suggestions use actual last attempts and rebalancing preserves every weekly minute',()=>{
 const catalogue={UE9:{chapters:[{id:'a',title:'Écritures'}]},UE6:{chapters:[{id:'b',title:'Finance'}]}};
 const learning={chapters:{'UE9/a':{quizAttempts:1,quizLast:40,qualifyingQuizBest:100},'UE6/b':{lessonRead:true}}};
 const p=revisionPriorities(catalogue,learning,['UE9','UE6']);assert.equal(p[0].module,'UE9');assert.equal(p[0].tool,'qcm');assert.ok(!p[0].reason.includes('maîtris'));
 assert.deepEqual(revisionPriorities(catalogue,learning,['UE6']).map(p=>p.module),['UE6']);assert.deepEqual(revisionPriorities(catalogue,{}),[]);
 for(let minutes=2;minutes<100;minutes++){
  const sessions=[{id:'UE9',minutes},{id:'UE6',minutes}],next=adaptiveMinutes(sessions,p.slice(0,1));assert.equal(next.reduce((sum,s)=>sum+s.minutes,0),minutes*2);assert.ok(next[0].minutes>=next[1].minutes);assert.ok(next.every(s=>s.minutes>=0));assert.equal(sessions[0].minutes,minutes);
 }
});
