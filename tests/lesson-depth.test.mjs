import test from 'node:test';
import assert from 'node:assert/strict';
import {MODULES,studyModule,moduleCatalogue} from '../lib/study-content.mjs';
import {checkCaseStep,parseStudyNumber} from '../lib/case-checks.mjs';
import {caseReviewPrompt,validateCaseFeedback} from '../lib/case-review.mjs';
import handler from '../api/case-review.js';
import {quizIndices} from '../lib/question-pool.mjs';

test('every chapter has a developed lesson, separate recall cards, and usable guided cases',()=>{
 const quizTexts=new Set(),cardTexts=new Set();let quizzes=0,cards=0;
 for(const [id,m] of Object.entries(MODULES))for(const c of m.chapters){
  const lesson=studyModule(id,'summary',()=>.2,{chapter:c.id});
  const words=[lesson.intro,...lesson.sections.flatMap(s=>s.points),...lesson.methodSteps,...lesson.glossary.map(g=>g.definition),...lesson.checklist].join(' ').split(/\s+/).length;
  assert.ok(words>=650,id+'/'+c.id+' shallow lesson: '+words);
  assert.ok(lesson.methodSteps.length>=4);assert.ok(lesson.glossary.length>=4);assert.ok(lesson.checklist.length>=2);
  assert.ok(quizIndices(c).length>=1);assert.ok(c.cards.length>=8);
  for(const i of quizIndices(c)){const n=c.quiz[i];assert.equal(new Set([n.correct,...n.wrong]).size,4);assert.ok(n.body);const key=n.q.trim().toLocaleLowerCase('fr').replace(/\s+/g,' ');assert.ok(!quizTexts.has(key),'Repeated curated question '+key);quizTexts.add(key);quizzes++;}
  for(const card of c.cards){assert.ok(card.q&&card.a);const key=card.q.trim().toLocaleLowerCase('fr').replace(/\s+/g,' ');assert.ok(!cardTexts.has(key),'Repeated recall card '+key);cardTexts.add(key);cards++;}
  for(let variant=0;variant<(c.variantAt?1:c.cases.length);variant++){
   const cas=studyModule(id,'case',()=>.2,{chapter:c.id,variant});
   for(const q of cas.questions){assert.ok(q.guide);const response=q.guide.type==='number'?String(parseStudyNumber(new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(q.guide.expected))):String(q.guide.answer);assert.equal(checkCaseStep(q,response).correct,true);}
  }
 }
 assert.equal(quizzes,1183);assert.equal(cards,4325);
 assert.notEqual(quizzes,cards);
});
test('theory-only mixed card series fill their requested length without duplicates',()=>{
 for(const seed of [0,.37,.99]){
  const result=studyModule('UE1','cards',()=>seed,{count:40,focus:'all'});
  assert.equal(result.items.length,40);assert.equal(new Set(result.items.map(i=>i.id)).size,40);
 }
 for(const id of Object.keys(MODULES)){const meta=moduleCatalogue(id);assert.equal(meta.curatedQuestionCount,MODULES[id].chapters.reduce((n,c)=>n+quizIndices(c).length,0));assert.ok(meta.cardCount>=45);assert.equal(meta.curatedCaseCount,meta.chapters.length*2);}
});
test('guided numbers accept French decimals and round like the displayed correction',()=>{
 assert.equal(parseStudyNumber(' −1\u202f250,50 '),-1250.5);
 for(const input of ['','1 €','1,2,3','NaN','Infinity','1e3',null])assert.equal(parseStudyNumber(input),null);
 for(const expected of [1.005,-1.235,12.345,0]){
  const q={guide:{type:'number',expected}};
  const response=new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(expected);
  assert.equal(checkCaseStep(q,response).correct,true);
  assert.equal(checkCaseStep(q,String(expected+1)).correct,false);
 }
 const q={guide:{type:'choice',options:['a','b','c','d'],answer:2}};
 assert.equal(checkCaseStep(q,'2').correct,true);assert.equal(checkCaseStep(q,'0').correct,false);
 for(const value of ['', ' ', '-1','4','0.0',null])assert.equal(checkCaseStep(q,value).valid,false);
});
test('AI case prompt uses the canonical server correction and limits student input',()=>{
 const body={module:'UE1',chapter:'reperes',variant:0,answer:'Je présente les faits et les conditions de responsabilité dans ce dossier.',expected:'INJECTED_EXPECTED',system:'INJECTED_SYSTEM',uid:'another-account'};
 const data=caseReviewPrompt(body),payload=JSON.parse(data.messages[1].content);
 assert.equal(data.purpose,'case-review');assert.equal(data.max_tokens,1600);
 assert.deepEqual(payload.expected,studyModule('UE1','case',()=>.2,{chapter:'reperes',variant:0}).questions.map(q=>({question:q.enonce,answer:q.answer})));
 assert.ok(!JSON.stringify(data).includes('INJECTED'));
 for(const answer of ['', 'x'.repeat(39),'x'.repeat(6001),null])assert.throws(()=>caseReviewPrompt({...body,answer}),{status:400});
 assert.throws(()=>caseReviewPrompt({...body,variant:2650}),{status:404});
 for(const module of ['__proto__','UE99',null])assert.throws(()=>caseReviewPrompt({...body,module}),{status:400});
});
test('malformed or empty provider feedback is never presented as a successful analysis',()=>{
 assert.deepEqual(validateCaseFeedback({strengths:['Faits — établis'],improvements:[],nextSteps:['Reprendre la méthode']}),{strengths:['Faits : établis'],improvements:[],nextSteps:['Reprendre la méthode']});
 for(const value of [null,{}, {strengths:[],improvements:[],nextSteps:[]},{strengths:[1],improvements:[],nextSteps:[]},{strengths:['x'.repeat(1501)],improvements:[],nextSteps:[]}])assert.throws(()=>validateCaseFeedback(value),{status:503});
});
test('case-review endpoint rejects anonymous requests before accessing credentials',async()=>{
 for(const [method,status] of [['GET',405],['POST',401]]){
  let actual,body;const res={setHeader(){},status(s){actual=s;return this;},json(b){body=b;return this;}};
  await handler({method,headers:{}},res);assert.equal(actual,status);assert.ok(body.error);
 }
});
