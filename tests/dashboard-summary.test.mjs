import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardSummary } from '../lib/dashboard-summary.mjs';
const ues=[{id:'UE9'},{id:'UE4'}],catalogue={modules:{UE9:{chapters:[{id:'one'},{id:'two'}]},UE4:{chapters:[{id:'tax'}]}}};
test('dashboard keeps QCM performance, activity and learning steps separate',()=>{
 const user={streak:{count:4},history:[{type:'qcm',ue:'UE9',score:3,total:4,duration:120,dateISO:'2026-10-14T09:00:00Z'},{type:'qcm',ue:'UE4',score:4,total:4,duration:240,dateISO:'2026-10-13T09:00:00Z'}]};
 const learning={chapters:{'UE9/one':{lessonRead:true,qualifyingQuizBest:80,cardsReviewed:4,caseCompared:true},'UE4/tax':{lessonRead:true},'foreign/nope':{lessonRead:true}}};
 const stats=dashboardSummary(user,ues,catalogue,learning,Date.parse('2026-10-14T10:00:00Z'));
 assert.equal(stats.average,88);assert.equal(stats.minutes,6);assert.equal(stats.todayQuestions,4);assert.equal(stats.latest.ue,'UE9');assert.equal(stats.streak,4);
 assert.equal(stats.chaptersStarted,2);assert.equal(stats.progress.UE9.percent,50);assert.equal(stats.progress.UE9.completed,1);assert.equal(stats.progress.UE4.percent,25);
 assert.equal(user.history[0].ue,'UE9');assert.equal(Object.keys(learning.chapters).length,3);
});
test('daily objective uses Paris midnight and excludes invalid or undated scores',()=>{
 const history=[{type:'qcm',ue:'UE9',score:1,total:4,dateISO:'2026-10-13T22:15:00Z'},{type:'qcm',ue:'UE9',score:99,total:4,dateISO:'2026-10-14T03:00:00Z'},{type:'qcm',ue:'UE9',score:1,total:4},{type:'qcm',ue:'foreign',score:4,total:4,dateISO:'2026-10-14T03:00:00Z'}];
 const stats=dashboardSummary({history},ues,catalogue,{},Date.parse('2026-10-14T10:00:00Z'));
 assert.equal(stats.todayQuestions,4);assert.equal(stats.average,25);assert.equal(stats.minutes,0);
});
test('new student has no fabricated mastery, rewards or activity',()=>{
 const stats=dashboardSummary({history:null,streak:-2},ues,catalogue);
 assert.equal(stats.average,null);assert.equal(stats.todayQuestions,0);assert.equal(stats.chaptersStarted,0);assert.equal(stats.latest,undefined);assert.equal(stats.streak,0);
 assert.equal(stats.progress.UE9.percent,0);assert.equal('xp' in stats,false);
});
