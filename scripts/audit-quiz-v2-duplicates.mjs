import {readFileSync,existsSync,writeFileSync,mkdirSync} from 'node:fs';
import {questionKey,choiceKey} from '../lib/quiz-v2-quality.mjs';
const base=new URL('../content/quiz-v2/',import.meta.url),plan=JSON.parse(readFileSync(new URL('plan.json',base),'utf8'));
const maps={exact:new Map(),numerical:new Map(),sameChoices:new Map()},rows=[];
const add=(map,key,row)=>{if(!map.has(key))map.set(key,[]);map.get(key).push(row);};
for(const job of plan.jobs){const path=new URL('drafts/'+job.key+'.json',base);if(!existsSync(path))continue;const b=JSON.parse(readFileSync(path,'utf8'));
 for(const q of b.questions){const row={key:job.key,id:q.id,q:q.q,author:b.authoredBy},stem=questionKey(q.q);rows.push(row);add(maps.exact,stem,row);add(maps.numerical,stem.replace(/\d+(?: \d+)*/g,'#'),row);add(maps.sameChoices,q.options.map(choiceKey).sort().join('|')+'|correct:'+choiceKey(q.options[q.answer]),row);}
}
const duplicateGroups=Object.fromEntries(Object.entries(maps).map(([k,m])=>[k,[...m.values()].filter(a=>a.length>1)]));
const report={questions:rows.length,counts:Object.fromEntries(Object.entries(duplicateGroups).map(([k,a])=>[k,a.length])),groups:duplicateGroups,note:'Same-choice groups are review warnings, not automatic semantic-equivalence decisions. Numerical and exact stem duplicates block compilation.'};
if(process.argv.includes('--save')){const out=new URL('../../../outputs/quiz-5000/',import.meta.url);mkdirSync(out,{recursive:true});writeFileSync(new URL('duplicate-audit.json',out),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report,null,2));
if(process.argv.includes('--strict')&&(duplicateGroups.exact.length||duplicateGroups.numerical.length))process.exitCode=1;
