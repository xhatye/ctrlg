import { writeFileSync } from 'node:fs';
import { MODULES, moduleCatalogue } from '../lib/study-content.mjs';
// Public catalogue contains counts and chapter titles, never course text or answers.
const modules=Object.fromEntries(Object.keys(MODULES).map(id=>[id,moduleCatalogue(id)]));
const total=key=>Object.values(modules).reduce((n,m)=>n+m[key],0);
const totals={subjects:Object.keys(modules).length,chapters:Object.values(modules).reduce((n,m)=>n+m.chapters.length,0),questions:total('questionCount'),curatedQuestions:total('curatedQuestionCount'),cards:total('cardCount'),cases:total('caseCount'),curatedCases:total('curatedCaseCount'),concepts:total('conceptCount'),applications:total('applicationCount'),sheets:total('sheetCount'),cloze:total('clozeCount')};
writeFileSync(new URL('../src/catalogue.json',import.meta.url),JSON.stringify({version:'2026-10-19',totals,modules},null,2)+'\n');
console.log(JSON.stringify(totals));
