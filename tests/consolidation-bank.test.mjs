import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MODULES,moduleCatalogue,studyModule} from '../lib/study-content.mjs';
import {checkCaseStep} from '../lib/case-checks.mjs';
import {resolveReviewItem} from '../lib/review-engine.mjs';
const baseline=JSON.parse(readFileSync(new URL('./fixtures/activity-baseline-2026-10-15.json',import.meta.url)));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
test('new retrieval tasks preserve every old quiz/card prefix and numeric variant boundary',()=>{
 let oldQuiz=0,oldCards=0,newQuiz=0,newCards=0,cases=0;
 for(const [key,old]of Object.entries(baseline.chapters)){
  const [id,chapter]=key.split('/'),c=MODULES[id]?.chapters.find(c=>c.id===chapter);assert.ok(c,'Legacy chapter must remain addressable: '+key);oldQuiz+=old.quizCount;oldCards+=old.cardCount;newQuiz+=c.quiz.length;newCards+=c.cards.length;
  assert.equal(hash(c.quiz.slice(0,old.quizCount)),old.quizHash,id+'/'+c.id+' quiz IDs must retain their meaning');
  assert.equal(hash(c.cards.slice(0,old.cardCount)),old.cardHash,id+'/'+c.id+' card IDs must retain their meaning');
  for(const item of c.quiz.slice(old.quizCount)){assert.equal(item.wrongReasons.length,3);assert.equal(new Set([item.correct,...item.wrong]).size,4);assert.ok(item.body.length>40);}
  assert.ok(c.quiz.length>old.quizCount&&c.cards.length>old.cardCount,id+'/'+c.id);
  const w=c.caseWorkshops[0],dossier=studyModule(id,'case',()=>.2,{chapter:c.id,variant:w.variant});assert.equal(dossier.format,'Atelier de relecture');assert.equal(dossier.questions.length,3);
  for(const q of dossier.questions){assert.equal(checkCaseStep(q,String(q.guide.answer)).correct,true);assert.ok(q.rubric.criteria.length);}
  if(old.numericVariants){assert.equal(w.variant,old.numericVariants);assert.equal(studyModule(id,'case',()=>.2,{chapter:c.id,variant:old.numericVariants-1}).questions[0].guide.type,'number');for(const n of c.quiz.slice(old.quizCount))assert.ok(n.q.includes(c.cas.contexte),'numeric question must state its input data');}
  const lastQuiz=resolveReviewItem('quiz',id+':'+c.id+':n'+(c.quiz.length-1));assert.equal(lastQuiz.q,c.quiz.at(-1).q);
  const lastCard=resolveReviewItem('card',id+':'+c.id+':card'+(c.cards.length-1));assert.equal(lastCard.a,c.cards.at(-1).a);
  cases+=moduleCatalogue(id).chapters.find(ch=>ch.id===c.id).curatedCaseCount;
 }
 assert.ok(newQuiz>=oldQuiz*2,`${newQuiz} quizzes vs ${oldQuiz}`);assert.ok(newCards>=oldCards*2,`${newCards} cards vs ${oldCards}`);assert.equal(cases,Object.keys(baseline.chapters).length*2);
});
