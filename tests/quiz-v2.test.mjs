import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {questionDigest,validateQuestion,validateChapterBank,validateBlindReview,assembleReviewedBank,choiceKey} from '../lib/quiz-v2-quality.mjs';
import {applyReviewedQuiz,quizTypeLabel} from '../lib/quiz-v2-runtime.mjs';
import {QUIZ_V2} from '../lib/quiz-v2-data.mjs';
const plan=JSON.parse(readFileSync(new URL('../content/quiz-v2/plan.json',import.meta.url),'utf8'));
const job={module:'UE6',chapter:'test',sourceHash:'source-fixture',concepts:1,target:1};
const q={id:'q01',basis:0,kind:'scenario',difficulty:'standard',q:'Un client règle sa facture après la clôture. Que faut-il distinguer ?',options:['Reconnaissance du produit et encaissement','Encaissement et enregistrement nécessairement simultanés','Dette fournisseur et créance client identiques','Résultat comptable et solde bancaire identiques'],answer:0,explanation:'La vente peut être enregistrée avant son règlement. La date du produit ne démontre donc pas que le client a déjà payé.'};
const bank=()=>({...job,authoredBy:'test-author',questions:[structuredClone(q)]});
const review=b=>({sourceHash:b.sourceHash,reviewer:'test-independent-reviewer',answers:b.questions.map(q=>({id:q.id,digest:questionDigest(q),selected:q.answer,unambiguous:true,supported:true,distractorsPlausible:true,independentObjective:true,explanationSound:true,reason:'La date du règlement se distingue de la reconnaissance comptable.'}))});

test('editorial allocation covers all 225 real chapters with exactly 5000 original questions',()=>{
 assert.equal(plan.target,5000);assert.equal(plan.jobs.length,225);assert.equal(new Set(plan.jobs.map(j=>j.module)).size,20);
 assert.equal(plan.jobs.reduce((n,j)=>n+j.target,0),5000);assert.equal(new Set(plan.jobs.map(j=>j.key)).size,225);
 assert.ok(plan.jobs.every(j=>[22,23].includes(j.target)&&j.concepts>=1&&/^[a-f0-9]{64}$/.test(j.sourceHash)));
});
test('calculation checking rejects a wrong key and distinguishes positive from negative choices',()=>{
 const n={...q,kind:'calculation',q:'Un FRNG de 42 000 € couvre un BFR de 50 000 €. Quelle est la trésorerie nette ?',options:['−8 000 €','8 000 €','92 000 €','42 000 €'],calculation:{expression:{op:'-',args:[{value:42000},{value:50000}]},expected:-8000,digits:0}};
 assert.doesNotThrow(()=>validateQuestion(n,job));assert.notEqual(choiceKey(n.options[0]),choiceKey(n.options[1]));
 assert.equal(new Set(['A$2','$A$2','$A2','A2'].map(choiceKey)).size,4);assert.notEqual(choiceKey('x < 2'),choiceKey('x > 2'));
 assert.throws(()=>validateQuestion({...n,answer:1},job),/Correct choice/);
 assert.throws(()=>validateQuestion({...n,calculation:{...n.calculation,expected:8000}},job),/Incorrect calculation/);
 assert.throws(()=>validateQuestion({...n,calculation:{...n.calculation,expression:{op:'eval',args:[]}}},job),/Invalid calculation/);
});
test('meaningless alternatives and missing-context questions are blocked before review',()=>{
 assert.throws(()=>validateQuestion({...q,options:['La marque des téléphones',...q.options.slice(1)]},job),/meaningful/);
 assert.throws(()=>validateQuestion({...q,q:'Dans le même cas, quel montant faut-il retenir ?'},job),/autonomous/);
 const two={...job,target:2};assert.throws(()=>validateChapterBank({...bank(),questions:[q,{...q,id:'q02'}]},two),/Repeated question/);
 assert.throws(()=>validateChapterBank({...bank(),sourceHash:'stale'},job),/source version/);
});
test('a review cannot silently survive an edit or agree with a changed answer key',()=>{
 const b=bank(),r=review(b);assert.doesNotThrow(()=>validateBlindReview(r,b,job));
 b.questions[0].options[1]+='.';assert.throws(()=>validateBlindReview(r,b,job),/Unresolved/);
 const own=review(bank());own.reviewer='test-author';assert.throws(()=>validateBlindReview(own,bank(),job),/independent/);
 for(const flag of ['supported','unambiguous','distractorsPlausible','independentObjective','explanationSound']){
  const rejected=review(bank());rejected.answers[0][flag]=false;assert.throws(()=>validateBlindReview(rejected,bank(),job),/Unresolved/);
 }
 const wrong=review(bank());wrong.answers[0].selected=1;assert.throws(()=>validateBlindReview(wrong,bank(),job),/Unresolved/);
});
test('release gate requires every real chapter review and leaves incomplete drafts inactive',()=>{
 assert.throws(()=>assembleReviewedBank(plan,{},{}),/Missing reviewed chapter/);
 const c={id:'test',quiz:[{q:'Legacy question'}],quizIndices:[0],quizRetired:{},quizRevision:'old'};
 const before=JSON.stringify(c);assert.equal(applyReviewedQuiz('UE6',c,undefined),c);assert.equal(JSON.stringify(c),before);
 assert.throws(()=>applyReviewedQuiz('UE6',c,{version:'incomplete',total:1,banks:{'UE6/test':[q]}}),/Incomplete/);
});
test('adapter appends stable new slots, preserves history and retires previous active items',()=>{
 const legacy=[{q:'Old question 0',correct:'A'},{q:'Old question 1',correct:'B'}];
 const c={id:'test',title:'Test chapter',sources:[['Original source','https://example.com/original']],quiz:structuredClone(legacy),quizIndices:[1],quizRetired:{0:'Previously retired'},quizRevision:'old',practiceSize:8000};
 const questions=Array.from({length:22},(_,i)=>({...q,id:'q'+String(i+1).padStart(2,'0'),q:q.q+' '+i}));
 questions[0].references=[{title:'Verified additional rule',url:'https://example.com/rule'}];
 questions[1].references=[{title:'Verified additional rule',url:'https://example.com/rule'}];
 const release={version:'test-v2',total:5000,banks:{'UE6/test':questions}};applyReviewedQuiz('UE6',c,release);
 assert.deepEqual(c.quiz.slice(0,2),legacy);assert.deepEqual(c.quizIndices,Array.from({length:22},(_,i)=>i+2));
 assert.equal(c.quizRetired[0],'Previously retired');assert.match(c.quizRetired[1],/Replaced/);assert.equal(c.practiceSize,8000);
 assert.equal(c.quiz[2].correct,q.options[q.answer]);assert.deepEqual(c.quiz[2].wrong,q.options.slice(1));
 assert.deepEqual(c.sources,[['Original source','https://example.com/original'],['Verified additional rule','https://example.com/rule']]);
 applyReviewedQuiz('UE6',c,release);assert.equal(c.quiz.length,24);
 assert.equal(quizTypeLabel(c.quiz[2]),'Mise en situation');assert.equal(quizTypeLabel({questionKind:'calculation'}),'Calcul');assert.equal(quizTypeLabel({application:true}),'Application chiffrée');assert.equal(quizTypeLabel({}),'Compréhension');
});
test('every draft present must pass its chapter contract; drafts do not enter public catalogue',()=>{
 for(const job of plan.jobs){const file=new URL('../content/quiz-v2/drafts/'+job.key+'.json',import.meta.url);if(existsSync(file))assert.doesNotThrow(()=>validateChapterBank(JSON.parse(readFileSync(file,'utf8')),job),job.key);}
});

test('compiled release matches every current independent review and authored record',()=>{
 const banks={},reviews={};
 const assignments=JSON.parse(readFileSync(new URL('../content/quiz-v2/review-plan.json',import.meta.url),'utf8')).reviewerByModule;
 for(const job of plan.jobs){
  banks[job.key]=JSON.parse(readFileSync(new URL('../content/quiz-v2/drafts/'+job.key+'.json',import.meta.url),'utf8'));
  reviews[job.key]=JSON.parse(readFileSync(new URL('../content/quiz-v2/reviews/'+job.key+'.json',import.meta.url),'utf8'));
  assert.equal(reviews[job.key].reviewer,assignments[job.module]);
 }
 assert.deepEqual(QUIZ_V2,assembleReviewedBank(plan,banks,reviews));
});
