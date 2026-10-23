import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {questionDigest,validateChapterBank,validateBlindReview} from '../lib/quiz-v2-quality.mjs';
const base=new URL('../content/quiz-v2/',import.meta.url);
const plan=JSON.parse(readFileSync(new URL('plan.json',base),'utf8'));
const selected=process.argv.slice(2);if(!selected.length)throw Error('Select one or more modules or chapter keys.');
const out=new URL('../../../outputs/quiz-5000/blind-review/',import.meta.url);mkdirSync(out,{recursive:true});
let count=0;
for(const job of plan.jobs){
 if(!selected.includes(job.module)&&!selected.includes(job.key))continue;
 const path=new URL('drafts/'+job.key+'.json',base);if(!existsSync(path))continue;
 const bank=JSON.parse(readFileSync(path,'utf8'));validateChapterBank(bank,job);
 const accepted=new URL('reviews/'+job.key+'.json',base);if(existsSync(accepted)){try{validateBlindReview(JSON.parse(readFileSync(accepted,'utf8')),bank,job);continue;}catch{}}
 const source=new URL('../../../outputs/quiz-5000/sources/'+job.key+'.json',import.meta.url);
 const packet={module:job.module,chapter:job.chapter,sourceHash:job.sourceHash,authoredBy:bank.authoredBy,presentation:'alphabetical-v1',instructions:'Solve each question independently. Do not inspect drafts or answer keys. Options are reordered independently from their authored answer position. Save literal decisions in content/quiz-v2/review-decisions/KEY.json. Return id,digest,selected (0-3 in THESE displayed options),unambiguous,supported,distractorsPlausible,independentObjective,explanationSound:false,reason. Flag ambiguity, weak distractors, repeated objectives or unsupported claims. Only after saving every independent decision may you run reconcile-blind-quiz-review.mjs KEY --compare, examine the explanations and set explanationSound:true when warranted. Unresolved issues must remain false.',source:JSON.parse(readFileSync(source,'utf8')),questions:bank.questions.map(q=>({id:q.id,digest:questionDigest(q),q:q.q,options:[...q.options].sort((a,b)=>a.localeCompare(b,'fr')),...(q.references?{references:q.references}:{})}))};
 writeFileSync(new URL(job.key+'.json',out),JSON.stringify(packet,null,2)+'\n');count+=bank.questions.length;
}
console.log(JSON.stringify({questions:count,output:'outputs/quiz-5000/blind-review'}));
