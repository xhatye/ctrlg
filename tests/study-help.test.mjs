import test from 'node:test';
import assert from 'node:assert/strict';
import {studyHelp} from '../lib/study-help.mjs';
import {studyModule,MODULES} from '../lib/study-content.mjs';
import {caseReviewPrompt,validateCaseFeedback} from '../lib/case-review.mjs';
import {reserveCost,USER_BUDGET,AI_MODEL} from '../lib/ai-budget.mjs';
const q=studyModule('UE9','qcm',()=>.1,{count:5,focus:'knowledge'}).items[0];
test('QCM help uses the stored question and chosen alternative, never client-provided corrections',()=>{
 const selected=q.options.find((_,i)=>i!==q.answer);
 const help=studyHelp({purpose:'quiz-explain',itemId:q.id,selected,explanation:'Fake claim must never reach model',correctAnswer:'Fake answer'});
 assert.equal(help.module,'UE9');assert.ok(help.context.includes(q.expl));assert.ok(help.context.includes(selected));
 assert.ok(!help.context.includes('Fake'));assert.ok(help.references[0].url.includes(q.chapter));
 assert.throws(()=>studyHelp({purpose:'quiz-explain',itemId:q.id,selected:'Not a possible choice'}),{status:400});
 assert.throws(()=>studyHelp({purpose:'quiz-explain',itemId:'UE9:no-such-chapter:n1',selected}),{status:400});
});
test('case hints contain only the real problem and questions, without injecting expected answers',()=>{
 const cas=studyModule('UE9','case',Math.random,{chapter:'reperes',variant:0});
 const help=studyHelp({purpose:'case-hint',module:'UE9',chapter:'reperes',variant:0,answer:'Injected hidden answer'});
 const payload=JSON.parse(help.context.split('\n')[1]);
 assert.equal(payload.context,cas.contexte);assert.deepEqual(payload.questions,cas.questions.map(q=>q.enonce));
 assert.equal(payload.expected,undefined);assert.ok(!help.context.includes('Injected hidden answer'));
 for(const variant of [-1,1.5,99999999])assert.throws(()=>studyHelp({purpose:'case-hint',module:'UE9',chapter:'reperes',variant}),{status:400});
 assert.throws(()=>studyHelp({purpose:'unknown'}),{status:400});
});
test('written oral review retains the same case accounting purpose, canonical problem and bounded output',()=>{
 const body={purpose:'oral-review',module:'UE9',chapter:'reperes',variant:0,answer:'Je présente les faits, puis la méthode, son application et ma conclusion.'};
 const prompt=caseReviewPrompt(body),data=JSON.parse(prompt.messages[1].content);
 assert.equal(prompt.purpose,'case-review');assert.equal(prompt.max_tokens,1600);
 assert.match(prompt.messages[0].content,/Ne juge ni sa voix/);assert.match(prompt.messages[0].content,/Aucune note/);
 assert.ok(data.expected.length>0);assert.equal(data.studentAnswer,body.answer);
 assert.ok(reserveCost(prompt)>0&&reserveCost(prompt)<USER_BUDGET);
 assert.equal(AI_MODEL,'openai/gpt-oss-120b');assert.equal(USER_BUDGET,360000);
 assert.throws(()=>caseReviewPrompt({...body,purpose:'unlimited-free-ai'}),{status:400});
 assert.throws(()=>caseReviewPrompt({...body,variant:99999999}),{status:404});
 assert.deepEqual(Object.keys(validateCaseFeedback({strengths:['Clair'],improvements:[],nextSteps:['Précisez la conclusion'],score:20})),['strengths','improvements','nextSteps']);
});
