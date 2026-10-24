import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {studyModule,MODULES} from '../lib/study-content.mjs';
import {questionPool} from '../lib/question-pool.mjs';
import {firstSessionSubjects,quizResult} from '../lib/first-session.mjs';
import {curriculumFor} from '../lib/curriculum.mjs';
const sample=JSON.parse(await readFile(new URL('../src/sample-lesson.json',import.meta.url),'utf8'));

test('public sample contains precisely one real chapter, its sheet and ten distinct reviewed questions',()=>{
 assert.equal(sample.module,'UE9');assert.equal(sample.chapter,'reperes');
 const lesson=studyModule('UE9','reading',()=>.5,{chapter:'reperes'});
 assert.deepEqual(sample.sections,lesson.sections);assert.deepEqual(sample.sheet,lesson.sheet);assert.deepEqual(sample.application,lesson.application);
 assert.equal(sample.questions.length,10);assert.equal(new Set(sample.questions.map(q=>q.id)).size,10);
 assert.ok(!Object.hasOwn(sample,'chapters'));assert.ok(!Object.hasOwn(sample,'modules'));
 const pool=questionPool([MODULES.UE9.chapters.find(c=>c.id==='reperes')],'knowledge');
 const canonical=Array.from({length:pool.total},(_,i)=>pool.at(i));
 for(const q of sample.questions){const real=canonical.find(r=>'UE9:'+r.id===q.id);assert.ok(real,q.id);assert.equal(q.chapter,'reperes');assert.equal(q.q,real.q);assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.equal(q.options[q.answer],real.correct);assert.equal(q.expl,real.body);}
});

test('free guided session is limited to the sample subject while active members choose all 20 subjects',()=>{
 const ues=curriculumFor('2027');assert.deepEqual(firstSessionSubjects(ues,false).map(u=>u.id),['UE9']);assert.equal(firstSessionSubjects(ues,true).length,20);assert.equal(ues.length,20);
});

test('guided result scores actual answers and keeps canonical identifiers for review recording',()=>{
 const questions=sample.questions.slice(0,5),choices=questions.map(q=>q.answer);choices[1]=(choices[1]+1)%4;
 const result=quizResult(questions,choices,{module:'UE9',name:'Comptabilité',sessionId:'starter-test-123',duration:31});
 assert.equal(result.score,4);assert.equal(result.total,5);assert.equal(result.duration,31);assert.equal(result.sessionId,'starter-test-123');assert.equal(result.answers[1].correct,false);assert.equal(result.answers[1].itemId,questions[1].id);assert.equal(result.answers[1].selected,questions[1].options[choices[1]]);
 for(const choices of [[],[0,0,0,0],[0,0,0,0,9],[0,0,0,0,null]])assert.throws(()=>quizResult(questions,choices,{module:'UE9'}),/chaque question/);
});

test('free chapter has public prerendering while first-session route remains a private noindex shell',async()=>{
 const html=await readFile(new URL('../dist/public-pages/exemple-gratuit.html',import.meta.url),'utf8');assert.ok(html.includes('Essayez une vraie révision.'));assert.ok(html.includes('Premiers mécanismes comptables'));assert.ok(html.includes('index, follow'));assert.ok(html.includes('href="/tarifs"'));assert.ok(!html.includes('Connexion requise'));
 const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));assert.equal(config.rewrites.find(r=>r.source==='/premiere-session').destination,'/app.html');assert.equal(config.rewrites.find(r=>r.source==='/exemple-gratuit').destination,'/public-pages/exemple-gratuit.html');
 const sitemap=await readFile(new URL('../dist/sitemap.xml',import.meta.url),'utf8');assert.ok(sitemap.includes('/exemple-gratuit'));assert.ok(!sitemap.includes('/premiere-session'));
});
