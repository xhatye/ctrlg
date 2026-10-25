import {writeFileSync} from 'node:fs';
import {MODULES} from '../lib/study-content.mjs';
import {QUIZ_V2} from '../lib/quiz-v2-data.mjs';
import {CURRICULUM} from '../lib/curriculum.mjs';
import {publicSubjectPath} from '../lib/public-study-pages.mjs';
// Fixed, bounded editorial previews. Never export a whole bank or select by request.
const questionsAt=[0,3,6,10,15],cardsAt=[1,8,18];
const subjects=CURRICULUM.map(ue=>{
 const c=MODULES[ue.id].chapters[0],source=QUIZ_V2.banks[ue.id+'/'+c.id];
 if(source.length<19)throw Error('Incomplete trial source '+ue.id);
 const questions=questionsAt.map(i=>{const q=source[i];return {id:ue.id+':trial:'+q.id,chapter:c.id,q:q.q,options:q.options,answer:q.answer,expl:q.explanation,...(q.optionExplanations?{optionExplanations:q.optionExplanations}:{})};});
 const cards=cardsAt.map(i=>{const n=c.cards[c.cardIndices[i]];return {q:n.q,a:n.a,explanation:n.explanation,exampleAnswer:n.exampleAnswer,tag:c.title,kind:'Rappel actif'};});
 return {id:ue.id,level:ue.level,label:ue.label,chapter:c.id,chapterTitle:c.title,path:publicSubjectPath(ue.id),questions,cards};
});
writeFileSync(new URL('../src/trial-samples.json',import.meta.url),JSON.stringify({version:'2026-10-25',subjects},null,2)+'\n');
console.log('Public trial: five fixed questions and three cards per UE; 20 UE, no student data or AI.');
