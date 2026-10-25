import test from 'node:test';
import assert from 'node:assert/strict';
import {studyModule,MODULES} from '../lib/study-content.mjs';
import {recommendSession,themeProgress,diagnosticSummary} from '../lib/study-guidance.mjs';
import {buildDatedRevisionPlan} from '../lib/revision-planner.mjs';
import {plannerPdf} from '../lib/planner-pdf.mjs';
import {applyLearningEvent} from '../lib/learning-progress.mjs';

test('diagnostic samples distinct questions across chapters and retains valid answer references',()=>{
 for(const id of ['UE1','UE9','DSCG2','DSCG7']){const q=studyModule(id,'qcm',Math.random,{count:10,focus:'knowledge',diagnostic:true}).items;assert.equal(q.length,10);assert.equal(new Set(q.map(q=>q.id)).size,10);assert.equal(new Set(q.map(q=>q.chapter)).size,Math.min(10,MODULES[id].chapters.length));assert.ok(q.every(q=>q.references.length>0&&q.references.every(r=>/^https:\/\//.test(r.url))));}
});
test('multi-topic training never leaks in a question from an unselected chapter',()=>{
 const chosen=['reperes','operations'];for(let i=0;i<10;i++){const r=studyModule('UE9','qcm',Math.random,{chapters:chosen,count:20,focus:'all'});assert.equal(r.items.length,20);assert.ok(r.items.every(q=>chosen.includes(q.chapter)));assert.equal(new Set(r.items.map(q=>q.id)).size,20);}
 for(const chapters of [[],['reperes','reperes'],['all'],['missing']])assert.throws(()=>studyModule('UE9','qcm',Math.random,{chapters}));
});
test('recommendation reads existing progress without altering it; insufficient evidence is labelled',()=>{
 const chapters=[{id:'a',title:'A',block:{id:'g',title:'G'}},{id:'b',title:'B',block:{id:'g',title:'G'}}],learning={chapters:{'UE9/a':{quizAttempts:2,quizLast:40,questionsAnswered:8},'UE9/b':{lessonRead:true}}},before=structuredClone(learning);
 assert.equal(recommendSession('UE9',chapters,learning).chapter,'a');assert.equal(recommendSession('UE9',chapters,learning).format,'sheet');assert.deepEqual(learning,before);assert.equal(themeProgress(chapters,{},'UE9')[0].average,null);assert.equal(themeProgress(chapters,learning,'UE9')[0].evaluated,1);
 const updated=applyLearningEvent(learning,{module:'UE9',chapter:'b',type:'quiz',total:5,correct:5},Date.now());assert.deepEqual(updated.chapters['UE9/a'],learning.chapters['UE9/a']);assert.equal(updated.chapters['UE9/b'].lessonRead,true);
 assert.equal(diagnosticSummary([{chapter:'a'}],[{correct:true}],chapters)[0].status,'À confirmer');
});
const settings={startDate:'2026-10-25',endDate:'2026-11-02',dailyHours:[1,.5,0,0,2,0,0],subjects:[{id:'UE9',weight:2},{id:'UE1',weight:1}]};
test('dated planner respects daily budgets, real weekdays and excludes the target date across DST',()=>{
 const plan=buildDatedRevisionPlan(settings);assert.equal(plan.totalMinutes,210);assert.equal(plan.sessionCount,7);const dates=plan.schedule.flatMap(w=>w.days);assert.deepEqual(dates.map(d=>d.date),['2026-10-26','2026-10-27','2026-10-30']);assert.ok(dates.every(d=>d.sessions.length===settings.dailyHours[d.day]*2));assert.equal(plan.allocation.reduce((n,s)=>n+s.minutes,0),plan.totalMinutes);
 const leap=buildDatedRevisionPlan({...settings,startDate:'2028-02-28',endDate:'2028-03-01'});assert.ok(leap.schedule.flatMap(w=>w.days).some(d=>d.date==='2028-02-29'));
 for(const patch of [{endDate:'2026-10-25'},{startDate:'2026-02-30'},{dailyHours:[0,0,0,0,0,0,0]},{dailyHours:[1.2,0,0,0,0,0,0]},{subjects:[]}])assert.throws(()=>buildDatedRevisionPlan({...settings,...patch}));
});
test('planner export is an actual PDF with byte-accurate cross references',()=>{
 const bytes=plannerPdf(buildDatedRevisionPlan(settings)),text=Buffer.from(bytes).toString('latin1');assert.ok(text.startsWith('%PDF-1.4'));const xref=Number(text.match(/startxref\n(\d+)/)[1]);assert.equal(text.slice(xref,xref+4),'xref');const offsets=[...text.matchAll(/(\d{10}) 00000 n/g)].map(m=>Number(m[1]));offsets.forEach((offset,i)=>assert.ok(text.slice(offset).startsWith((i+1)+' 0 obj')));assert.ok(text.includes('2026-10-26')||text.includes('octobre'));
});
