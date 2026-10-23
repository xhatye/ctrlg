import {mkdirSync,writeFileSync,existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MODULES} from '../lib/study-content.mjs';
import {readingFormats} from '../lib/chapter-formats.mjs';
const root=new URL('../content/quiz-v2/',import.meta.url);
const sourceRoot=new URL('../../../outputs/quiz-5000/sources/',import.meta.url);
mkdirSync(root,{recursive:true});mkdirSync(sourceRoot,{recursive:true});
const all=Object.entries(MODULES).flatMap(([module,m])=>m.chapters.map(c=>({module,subject:m.title,c})));
const jobs=all.map(({module,subject,c},index)=>{
 const packet={module,subject,chapter:c.id,title:c.title,intro:c.intro,method:c.method,pitfalls:c.pitfalls,
  notions:c.notions.map((n,i)=>({id:'concept-'+i,title:n.title,rule:n.body})),
  authoredLesson:c.editorial?readingFormats(module,c).sections:[],
  workedCase:c.cas,sources:c.sources,programmes:c.programmes,
  ...(c.practiceSpec?{numericModel:{context:c.practiceSpec.context,assumptions:c.practiceSpec.assumptions,interpretation:c.practiceSpec.interpretation,tasks:c.practiceSpec.tasks.map(t=>({title:t.title,rule:t.rule,unit:t.unit}))}}:{})};
 const sourceHash=createHash('sha256').update(JSON.stringify(packet)).digest('hex');
 const key=module+'__'+c.id;writeFileSync(new URL(key+'.json',sourceRoot),JSON.stringify(packet,null,2)+'\n');
 return {key,module,chapter:c.id,title:c.title,target:Math.floor((index+1)*5000/all.length)-Math.floor(index*5000/all.length),sourceHash,concepts:c.notions.length,language:['UE12','DSCG6'].includes(module)?'en':'fr',numericModel:Boolean(c.practiceSpec)};
});
const plan={version:'quiz-v2-2026-10-20',target:5000,subjects:Object.keys(MODULES).length,chapters:jobs.length,
 policy:'New authored questions only. Parameter changes, answer permutations and label-matching do not count as new questions.',jobs};
const destination=new URL('plan.json',root);
if(existsSync(destination)&&readFileSync(destination,'utf8')!==JSON.stringify(plan,null,2)+'\n')throw Error('Existing plan differs; review source or allocation changes explicitly.');
writeFileSync(destination,JSON.stringify(plan,null,2)+'\n');
const bySubject={};for(const j of jobs){const row=bySubject[j.module]||={chapters:0,questions:0};row.chapters++;row.questions+=j.target;}
console.log(JSON.stringify({target:jobs.reduce((s,j)=>s+j.target,0),chapters:jobs.length,bySubject}));
