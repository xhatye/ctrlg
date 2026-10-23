import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {validateChapterBank,validateBlindReview} from '../lib/quiz-v2-quality.mjs';
const base=new URL('../content/quiz-v2/',import.meta.url);
const plan=JSON.parse(readFileSync(new URL('plan.json',base),'utf8'));
const {reviewerByModule}=JSON.parse(readFileSync(new URL('review-plan.json',base),'utf8'));
const report={target:plan.target,authored:0,validDrafts:0,reviewed:0,chaptersAuthored:0,bySubject:{},issues:[]};
for(const job of plan.jobs){
 const row=report.bySubject[job.module]||={target:0,authored:0,validated:0,reviewed:0};row.target+=job.target;
 const file=new URL('drafts/'+job.key+'.json',base);if(!existsSync(file))continue;
 try{
  const bank=JSON.parse(readFileSync(file,'utf8'));const n=bank.questions?.length||0;report.authored+=n;row.authored+=n;report.chaptersAuthored++;
  validateChapterBank(bank,job);report.validDrafts+=n;row.validated+=n;
  const review=new URL('reviews/'+job.key+'.json',base);if(existsSync(review)){const r=JSON.parse(readFileSync(review,'utf8'));if(r.reviewer!==reviewerByModule[job.module])throw Error('Review from unassigned reviewer');validateBlindReview(r,bank,job);report.reviewed+=n;row.reviewed+=n;}
 }catch(e){report.issues.push({key:job.key,error:e.message});}
}
console.log(JSON.stringify(report,null,2));
if(process.argv.includes('--require-complete')&&(report.reviewed!==5000||report.issues.length))process.exitCode=1;
