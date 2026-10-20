import test from 'node:test';
import assert from 'node:assert/strict';
import {MODULES,moduleCatalogue,studyModule} from '../lib/study-content.mjs';
import {questionPool,quizIndices} from '../lib/question-pool.mjs';
import {resolveReviewItem,normalizeReviewEvents} from '../lib/review-engine.mjs';
import {DISTRACTOR_REWRITES,QUIZ_REPLACEMENTS,WORKSHOP_REWRITES} from '../lib/quiz-rewrites.mjs';

test('all served course questions are explicit editorial selections; retired slots never enter a pool',()=>{
 let total=0,retired=0;
 const banned=/quel repère correspond|quel raisonnement correspond|quel commentaire du cours|contrôle du repère|relier deux notions|quelle association respecte/i;
 for(const [id,m]of Object.entries(MODULES)){
  const pool=questionPool(m.chapters,'knowledge');let expected=0;
  for(const c of m.chapters){
   assert.ok(c.quizIndices.length>0,id+'/'+c.id);
   assert.equal(new Set(c.quizIndices).size,c.quizIndices.length);
   for(const index of c.quizIndices){const n=c.quiz[index];assert.ok(!Object.hasOwn(c.quizRetired,index));assert.ok(!banned.test(n.q),n.q);assert.equal(n.wrong.length,3);assert.equal(new Set([n.correct,...n.wrong]).size,4);assert.ok(n.q.length>12&&n.body.length>30);assert.ok(!n.wrong.some(o=>/couleur|logo|police de caract|au hasard/.test(o)));}
   expected+=c.quizIndices.length;retired+=Object.keys(c.quizRetired).length;
  }
  assert.equal(pool.total,expected);assert.equal(moduleCatalogue(id).curatedQuestionCount,expected);total+=expected;
  for(let i=0;i<pool.total;i++){const n=pool.at(i),review=resolveReviewItem('quiz',id+':'+n.id);assert.equal(review.q,n.q);assert.equal(review.a,n.correct);assert.ok(!banned.test(n.q));}
 }
 assert.equal(total,1183);assert.ok(retired>4000);
});
test('the reported title-matching question is retired, and its replacement tests contract formation',()=>{
 assert.throws(()=>resolveReviewItem('quiz','UE1:offre-acceptation:n4'),{status:410});
 assert.throws(()=>normalizeReviewEvents([{receipt:'old_heading_1234',kind:'quiz',itemId:'UE1:offre-acceptation:n4',selected:'Proposition et engagement'}]),{status:410});
 const c=MODULES.UE1.chapters.find(c=>c.id==='offre-acceptation');assert.equal(quizIndices(c).length,8);
 const price=QUIZ_REPLACEMENTS['UE1/offre-acceptation'].find(n=>n.q.includes('900 €'));assert.ok(price.correct.includes('offre nouvelle'));assert.ok(price.body.includes('1118'));
 for(const seed of [0,.27,.67,.99]){const session=studyModule('UE1','qcm',()=>seed,{chapter:c.id,focus:'knowledge',count:8});assert.equal(session.items.length,8);for(const n of session.items){assert.ok(!n.q.includes('quel repère'));const canonical=resolveReviewItem('quiz',n.id);assert.equal(n.options[n.answer],canonical.a);assert.equal(n.expl,canonical.explanation);}}
});
test('rewritten alternatives use new IDs and never silently change an old question receipt',()=>{
 for(const slot of Object.keys(DISTRACTOR_REWRITES)){const [key,index]=slot.split('#'),[id,chapter]=key.split('/'),c=MODULES[id].chapters.find(c=>c.id===chapter);assert.throws(()=>resolveReviewItem('quiz',id+':'+chapter+':n'+index),{status:410});if(key==='UE1/offre-acceptation')continue;const replacement=quizIndices(c).map(i=>c.quiz[i]).find(n=>n.q===c.quiz[index].q);assert.ok(replacement);assert.deepEqual(replacement.wrong,DISTRACTOR_REWRITES[slot]);}
});
test('workshop inputs accompany mixed-session questions and original answer-specific feedback',()=>{
 for(const [id,m]of Object.entries(MODULES))for(const c of m.chapters)if(c.workshop){
  for(const [i,n] of c.workshop.quiz.entries()){const active=quizIndices(c).map(i=>c.quiz[i]).find(x=>x.q.endsWith(n.q));assert.ok(active.q.startsWith(c.workshop.context));assert.equal(active.correct,n.correct);assert.deepEqual(active.wrongReasons,WORKSHOP_REWRITES[id+'#'+i]?.wrongReasons || n.wrongReasons);}
 }
});
test('revised calculation answers are independently reconstructed from their explicit inputs',()=>{
 const first=key=>QUIZ_REPLACEMENTS[key][0];
 assert.equal(first('UE4/dossier-synthese').correct,(1000*1.2-100*1.2).toLocaleString('fr-FR').replaceAll('\u202f',' ')+' €.');
 assert.equal(first('UE5/dossier-synthese').correct,((1500/600/(1200/600)-1)*100)+' %.');
 assert.equal(first('DSCG2/dossier-synthese').correct,(.6*10+.4*-5)+' €.');
 assert.equal(first('UE11/dossier-synthese').correct,(40/2000*100)+' %.');
 assert.equal(first('UE4/bareme-progressif').correct,(10000*.1+5000*.2).toLocaleString('fr-FR').replaceAll('\u202f',' ')+' €.');
 assert.ok(first('UE4/bareme-progressif').q.includes('0 % jusqu’à 10 000 €'));
});
