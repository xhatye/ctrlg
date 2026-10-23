import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {questionDigest,validateChapterBank,validateBlindReview} from '../lib/quiz-v2-quality.mjs';
const key=process.argv[2];if(!/^(?:UE\d+|DSCG\d+)__[a-z0-9-]+$/.test(key||''))throw Error('Select one chapter key.');
const base=new URL('../content/quiz-v2/',import.meta.url);
const plan=JSON.parse(readFileSync(new URL('plan.json',base),'utf8')),job=plan.jobs.find(j=>j.key===key);if(!job)throw Error('Unknown chapter');
const packet=JSON.parse(readFileSync(new URL('../../../outputs/quiz-5000/blind-review/'+key+'.json',import.meta.url),'utf8'));
const raw=JSON.parse(readFileSync(new URL('review-decisions/'+key+'.json',base),'utf8'));
const expected=JSON.parse(readFileSync(new URL('review-plan.json',base),'utf8')).reviewerByModule[job.module];
if(raw.reviewer!==expected||raw.sourceHash!==job.sourceHash||raw.answers?.length!==job.target)throw Error('Complete decisions by assigned independent reviewer required');
const literal=new Map(raw.answers.map(r=>[r.id,r]));if(literal.size!==job.target)throw Error('Repeated decision ID');
for(const p of packet.questions){const r=literal.get(p.id);if(!r||r.digest!==p.digest||!Number.isInteger(r.selected)||r.selected<0||r.selected>3||typeof r.reason!=='string'||r.reason.trim().length<20)throw Error('Missing independent decision: '+p.id);}
// The authored answer key is opened only after all literal, displayed-option
// decisions exist. Mapping uses chosen text, never the answer key.
const bank=JSON.parse(readFileSync(new URL('drafts/'+key+'.json',base),'utf8'));validateChapterBank(bank,job);
const answers=packet.questions.map(p=>{
 const q=bank.questions.find(q=>q.id===p.id),r=literal.get(p.id);if(!q||questionDigest(q)!==p.digest)throw Error('Question changed since blind packet: '+p.id);
 const selectedText=p.options[r.selected],selected=q.options.indexOf(selectedText);if(selected<0)throw Error('Displayed choice mismatch');
 return {...r,displayedIndex:r.selected,selected,selectedText};
});
if(process.argv.includes('--compare')){
 console.log(JSON.stringify({key,corrections:bank.questions.map(q=>{const r=answers.find(r=>r.id===q.id);return {id:q.id,agrees:r.selected===q.answer,selected:r.selectedText,authoredAnswer:q.options[q.answer],explanation:q.explanation,...(q.optionExplanations?{optionExplanations:q.optionExplanations}:{}),...(q.calculation?{calculation:q.calculation}:{})};})},null,2));
}else{
 const review={sourceHash:job.sourceHash,reviewer:raw.reviewer,presentation:packet.presentation,answers};validateBlindReview(review,bank,job);
 mkdirSync(new URL('reviews/',base),{recursive:true});writeFileSync(new URL('reviews/'+key+'.json',base),JSON.stringify(review,null,2)+'\n');console.log(JSON.stringify({key,accepted:answers.length}));
}
