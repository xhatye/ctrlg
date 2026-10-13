import fs from 'node:fs';
import {buildVariant,PRACTICE_VARIANTS} from '../lib/practice-engine.mjs';
import {ACCOUNTING_PRACTICE} from '../lib/practice-accounting.mjs';
import {FINANCE_PRACTICE} from '../lib/practice-finance.mjs';
import {MANAGEMENT_PRACTICE} from '../lib/practice-management.mjs';
import {DATA_PRACTICE} from '../lib/practice-data.mjs';
const salts={};let repairs=0;
for(const spec of [...ACCOUNTING_PRACTICE,...FINANCE_PRACTICE,...MANAGEMENT_PRACTICE,...DATA_PRACTICE]){
 const seen=new Set();
 for(let index=0;index<PRACTICE_VARIANTS;index++){
  let salt=0,context;
  do{context=buildVariant(spec,index,salt).contexte;if(!seen.has(context))break;salt++;if(salt>100)throw new Error('Too many collisions');}while(true);
  seen.add(context);if(salt){(salts[spec.id] ||= {})[index]=salt;repairs++;}
 }
}
fs.writeFileSync(new URL('../lib/practice-salts.mjs',import.meta.url),'// Sparse deterministic collision repairs, generated and checked offline.\nexport const PRACTICE_SALTS='+JSON.stringify(salts)+';\n');
console.log(JSON.stringify({families:60,variants:60*PRACTICE_VARIANTS,repairs}));
