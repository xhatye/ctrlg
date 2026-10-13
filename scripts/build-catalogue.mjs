import { writeFileSync } from 'node:fs';
import { MODULES, moduleCatalogue } from '../lib/study-content.mjs';
// Public catalogue contains counts and chapter titles, never course text or answers.
const modules=Object.fromEntries(Object.keys(MODULES).map(id=>[id,moduleCatalogue(id)]));
const totals={subjects:Object.keys(modules).length,chapters:Object.values(modules).reduce((n,m)=>n+m.chapters.length,0),questions:Object.values(modules).reduce((n,m)=>n+m.questionCount,0),cards:Object.values(modules).reduce((n,m)=>n+m.cardCount,0)};
writeFileSync(new URL('../src/catalogue.json',import.meta.url),JSON.stringify({version:'2026-10-13',totals,modules},null,2)+'\n');
console.log(JSON.stringify(totals));
