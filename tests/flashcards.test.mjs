import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MODULES,studyModule,moduleCatalogue} from '../lib/study-content.mjs';
import {QUIZ_V2} from '../lib/quiz-v2-data.mjs';
import {FLASHCARD_EDITS,FLASHCARD_EXPLANATIONS,FLASHCARD_VERSION,applyAuthoredCards} from '../lib/flashcard-editorial.mjs';
import {cardPool,cardIndices} from '../lib/question-pool.mjs';
import {resolveReviewItem,normalizeReviewEvents} from '../lib/review-engine.mjs';

const choiceDependent=/which (?:answer|choice|statement|sentence|description|summary|opening|closing|ending|reply|interpretation|wording|response|phrase|option)|quelle[s]? (?:réponse|proposition|formulation|phrase|affirmation)|quel énoncé|ci-dessous|ci-dessus|deux repères|repère à expliquer|relation à retrouver|que faut-il retenir séparément/i;
const optionExplanation=/(?:les autres|other) (?:réponses|propositions|options|phrases|formulations|prépositions|mesures|demandes|liens|choices|answers)/i;
test('all 5000 replacement cards cover 225 chapters with self-contained prompts and short answers',()=>{
 let count=0,chapters=0;const seen=new Set();
 for(const [id,m]of Object.entries(MODULES))for(const c of m.chapters){
  chapters++;assert.equal(c.cardRevision,FLASHCARD_VERSION);
  const source=QUIZ_V2.banks[id+'/'+c.id],indices=cardIndices(c);assert.equal(indices.length,source.length);
  for(const [j,i]of indices.entries()){
   const card=c.cards[i],q=source[j],key=id+'/'+c.id+'#'+q.id;
   assert.equal(card.editorialId,key);assert.equal(card.editorialRevision,FLASHCARD_VERSION);
   assert.equal(card.q,FLASHCARD_EDITS[key]?.q||q.q);assert.equal(card.a,FLASHCARD_EDITS[key]?.a||q.options[q.answer]);
   assert.ok(card.q.length>=15&&card.q.length<=500,key+' prompt length');assert.ok(card.a.length>0&&card.a.length<=200,key+' answer length');assert.ok(card.explanation.length>=20,key+' explanation');
   assert.ok(!choiceDependent.test(card.q),key+' relies on answer choices or course headings');assert.ok(!optionExplanation.test(card.explanation),key+' explanation refers to absent choices');
   const text=card.q.toLocaleLowerCase('fr').replace(/\s+/g,' ').trim();assert.ok(!seen.has(text),key+' duplicate card');seen.add(text);
   assert.equal(card.options,undefined);assert.equal(card.answer,undefined);count++;
  }
 }
 assert.equal(count,5000);assert.equal(chapters,225);assert.equal(Object.keys(MODULES).length,20);
});

test('every editorial correction points to an existing source and has no shadowed duplicate keys',()=>{
 const source=readFileSync(new URL('../lib/flashcard-editorial.mjs',import.meta.url),'utf8');
 const questionPart=source.split('export const FLASHCARD_EXPLANATIONS')[0],keys=[...questionPart.matchAll(/^ '([^']+)':/gm)].map(m=>m[1]);assert.equal(new Set(keys).size,keys.length);
 for(const key of new Set([...Object.keys(FLASHCARD_EDITS),...Object.keys(FLASHCARD_EXPLANATIONS)])){const [chapter,id]=key.split('#');assert.ok(QUIZ_V2.banks[chapter]?.some(q=>q.id===id),key+' missing source');}
});

test('new card IDs resolve to the same answer and explanation across study sessions and spaced review',()=>{
 for(const [id,m]of Object.entries(MODULES)){
  const pool=cardPool(m.chapters);assert.equal(moduleCatalogue(id).cardCount,pool.total);
  for(let i=0;i<pool.total;i++){
   const card=pool.at(i),resolved=resolveReviewItem('card',id+':'+card.id);assert.equal(resolved.q,card.q);assert.equal(resolved.a,card.a);assert.equal(resolved.explanation,card.explanation);assert.equal(resolved.exampleAnswer,card.exampleAnswer);
  }
  for(const focus of ['all','knowledge','application'])for(const seed of [0,.48,.999]){
   const series=studyModule(id,'cards',()=>seed,{count:40,focus});assert.equal(new Set(series.items.map(c=>c.id)).size,series.items.length);
   for(const card of series.items){const resolved=resolveReviewItem('card',card.id);assert.equal(resolved.a,card.a);assert.equal(resolved.explanation,card.explanation);}
  }
 }
});

test('course-heading cards are retired without reassigning historical identifiers',()=>{
 for(const [id,m]of Object.entries(MODULES))for(const c of m.chapters){
  const start=c.cardIndices[0];assert.ok(start>0);
  for(let i=0;i<start;i++){assert.ok(c.cards[i]);assert.ok(c.cardRetired[i]);assert.throws(()=>resolveReviewItem('card',id+':'+c.id+':card'+i),{status:410});}
 }
 assert.throws(()=>normalizeReviewEvents([{receipt:'legacy_card_review_123',kind:'card',itemId:'UE1:reperes:card0',known:true}]),{status:410});
});

test('recall and numerical card pools are separated, including chapters without generated variants',()=>{
 const c=MODULES.UE9.chapters[0],knowledge=cardPool([c],'knowledge'),numbers=cardPool([c],'application');
 assert.ok(!c.variantAt);assert.ok(knowledge.total&&numbers.total);assert.equal(knowledge.total+numbers.total,c.cardIndices.length);
 for(let i=0;i<knowledge.total;i++)assert.notEqual(knowledge.at(i).cardKind,'calculation');
 for(let i=0;i<numbers.total;i++)assert.equal(numbers.at(i).cardKind,'calculation');
 assert.ok(studyModule('UE9','cards',()=>.2,{chapter:c.id,focus:'application'}).items.every(item=>item.kind==='Exercice de calcul'));
 const catalogue=moduleCatalogue('UE9'),meta=catalogue.chapters.find(x=>x.id===c.id);assert.equal(meta.calculationCardCount,numbers.total);assert.equal(meta.recallCardCount,knowledge.total);assert.equal(catalogue.recallCardCount+catalogue.calculationCardCount,catalogue.cardCount);assert.equal(catalogue.cardRevision,FLASHCARD_VERSION);
 assert.throws(()=>studyModule('UE9','cards',()=>.2,{focus:'typo'}),{status:400});
});

test('the screenshot regression and corrected percentage card ask concrete questions',()=>{
 const c=MODULES.UE1.chapters[0],fault=c.cards[c.cardIndices[5]];
 assert.equal(fault.a,'Une faute, un dommage et un lien de causalité.');assert.ok(fault.q.includes('responsabilité extracontractuelle'));
 const chapter=MODULES.UE7.chapters.find(c=>c.id==='productivite-organisation'),card=chapter.cards[chapter.cardIndices[20]];assert.ok(card.a.startsWith('20 %'));assert.ok(card.explanation.includes('125'));
 const english=MODULES.DSCG6.chapters.find(c=>c.id==='english-argument'),writing=english.cards[english.cardIndices[4]];assert.equal(writing.exampleAnswer,true);
});

test('applying the same editorial release twice does not append or renumber cards',()=>{
 const c={id:'reperes',title:'Test',cards:[{q:'Historic',a:'Historic'}]};applyAuthoredCards('UE1',c,QUIZ_V2);const indices=[...c.cardIndices],length=c.cards.length;
 applyAuthoredCards('UE1',c,QUIZ_V2);assert.equal(c.cards.length,length);assert.deepEqual(c.cardIndices,indices);assert.deepEqual(c.cards[0],{q:'Historic',a:'Historic'});
});
