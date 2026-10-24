import {writeFileSync} from 'node:fs';
import {studyModule} from '../lib/study-content.mjs';

// A fixed editorial sample. Never export a whole module or accept URL selectors.
const module='UE9',chapter='reperes';
let seed=20261024;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const reading=studyModule(module,'reading',random,{chapter});
const quiz=studyModule(module,'qcm',random,{chapter,count:10,focus:'knowledge'});
if(quiz.items.length!==10||new Set(quiz.items.map(q=>q.id)).size!==10)throw Error('The free sample requires ten distinct reviewed questions.');
const {title,intro,method,sections,application,comparison,sheet,sources,programmeNote}=reading;
const sample={version:1,module,chapter,title,intro,method,sections,application,comparison,sheet,sources,programmeNote,questions:quiz.items};
writeFileSync(new URL('../src/sample-lesson.json',import.meta.url),JSON.stringify(sample,null,2)+'\n');
console.log('Free sample: one UE9 chapter, its revision sheet and ten reviewed questions.');
