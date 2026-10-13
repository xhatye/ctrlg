import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {SYNTHESIS_COURSES} from '../lib/synthesis-courses.mjs';
import {MODULES,studyModule} from '../lib/study-content.mjs';
test('the twenty subject illustrations share a frame and retain distinct original symbols',()=>{
 const icons=readdirSync(new URL('../public/subjects/',import.meta.url));assert.equal(icons.length,20);const paths=new Set();
 for(const id of Object.keys(MODULES)){const svg=readFileSync(new URL('../public/subjects/'+id+'.svg',import.meta.url),'utf8');assert.ok(svg.includes('viewBox="0 0 64 64"'));assert.ok(svg.includes('rx="18"'));assert.ok(!/script|foreignObject|https?:\/\//.test(svg.replace('http://www.w3.org/2000/svg','')));const path=svg.match(/<path d="([^"]+)"/)[1];assert.ok(!paths.has(path));paths.add(path);}
});
test('each subject has a synthesis dossier, four original concepts and protected reading checks',()=>{
 assert.equal(Object.keys(SYNTHESIS_COURSES).length,20);
 for(const id of Object.keys(MODULES)){const chapter=MODULES[id].chapters.find(c=>c.id==='dossier-synthese');assert.ok(chapter);assert.equal(chapter.notions.length,4);const lesson=studyModule(id,'summary',()=>.2,{chapter:chapter.id});assert.equal(lesson.selfChecks.length,4);assert.ok(lesson.sections.length>=6);assert.ok(chapter.cas.questions.every(q=>q.answer.length>40));}
});
test('the new synthesis calculations are independently reconstructed from given hypotheses',()=>{
 const answer=(id,i)=>SYNTHESIS_COURSES[id][0].cas.questions[i].answer;
 assert.ok(answer('UE4',0).includes(String(100*.2)));assert.ok(answer('UE4',1).includes((1000*1.2-100*1.2).toLocaleString('fr-FR').replaceAll('\u202f',' ')));
 assert.ok(answer('UE5',0).includes(String(1200/600)));assert.ok(answer('UE5',1).includes(String((1500/600/(1200/600)-1)*100)));
 assert.ok(answer('UE6',0).includes((20000+30000-18000).toLocaleString('fr-FR').replaceAll('\u202f',' ')));assert.ok(answer('UE6',1).includes(((25000+40000-20000)-(20000+30000-18000)).toLocaleString('fr-FR').replaceAll('\u202f',' ')));
 assert.ok(answer('UE11',0).includes(String(20/1000*100)));assert.ok(answer('UE11',1).includes(String(20*30)));
 assert.ok(answer('UE13',0).includes(String(12/300*100)));assert.ok(answer('UE13',0).includes(String((12-6)/12*100)));
 assert.ok(answer('DSCG2',1).includes(String(.6*10+.4*-5)));assert.ok(answer('DSCG5',0).includes('deux heures'));
});
