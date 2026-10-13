import {MODULES} from '../lib/study-content.mjs';
export function sourceQuestion(item){
 const [module,chapter,key,task]=item.id.split(':');
 const c=MODULES[module].chapters.find(c=>c.id===chapter);
 return key.startsWith('v')?c.variantAt(Number(key.slice(1))).notions[Number(task)]:c.notions[Number(key.slice(1))];
}
