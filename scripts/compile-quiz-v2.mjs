import {readFileSync,writeFileSync,existsSync,renameSync} from 'node:fs';
import {assembleReviewedBank} from '../lib/quiz-v2-quality.mjs';
const root=new URL('../content/quiz-v2/',import.meta.url);
const plan=JSON.parse(readFileSync(new URL('plan.json',root),'utf8'));
const {reviewerByModule}=JSON.parse(readFileSync(new URL('review-plan.json',root),'utf8'));
const banks={},reviews={};
for(const job of plan.jobs)for(const [dir,dest]of [['drafts',banks],['reviews',reviews]]){
 const path=new URL(dir+'/'+job.key+'.json',root);if(existsSync(path))dest[job.key]=JSON.parse(readFileSync(path,'utf8'));
}
for(const job of plan.jobs)if(reviews[job.key]&&reviews[job.key].reviewer!==reviewerByModule[job.module])throw Error('Review is not from the assigned independent reviewer: '+job.key);
// Validation finishes before a single production file is written. An incomplete
// or stale review cannot replace the currently repaired bank.
const result=assembleReviewedBank(plan,banks,reviews);
const dest=new URL('../lib/quiz-v2-data.mjs',import.meta.url),temp=new URL('../lib/quiz-v2-data.mjs.pending',import.meta.url);
writeFileSync(temp,'// Compiled only from complete, independently reviewed chapter records.\nexport const QUIZ_V2 = '+JSON.stringify(result)+';\n');renameSync(temp,dest);
console.log(JSON.stringify({version:result.version,questions:result.total,reviewedChapters:result.proof.length}));
