import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM } from '../lib/curriculum.mjs';
import { buildPlan, restorePlan } from '../lib/study-plan.mjs';

const ues = CURRICULUM;
const config = { level:'DCG', weeks:4, hours:3, selectedIds:['UE1','UE4'] };

test('planning covers only chosen UEs, with the full weekly time budget', () => {
  for (const level of ['DCG','DSCG']) {
    const ids = ues.filter(ue => ue.level === level).slice(0,3).map(ue => ue.id);
    for (const weeks of [2,4,12]) for (const hours of [1,3,20]) {
      const plan = buildPlan(ues,weeks,level,hours,ids);
      assert.equal(plan.length,weeks);
      for (const week of plan) {
        assert.deepEqual(week.subjects.map(ue => ue.id),ids);
        assert.equal(week.sessions.reduce((sum,session) => sum + session.minutes,0),hours*60);
        assert.ok(week.sessions.every(session => session.minutes > 0));
      }
      assert.match(plan[0].task,/Lire/);
      assert.match(plan.at(-1).task,/cas pratique/);
      assert.ok(plan.some(week => /QCM/.test(week.task)));
    }
  }
});

test('a single UE gets every week and all allocated time', () => {
  const plan = buildPlan(ues,6,'DSCG',5,['DSCG2']);
  assert.ok(plan.every(week => week.subjects.length === 1 && week.subjects[0].id === 'DSCG2' && week.sessions[0].minutes === 300));
});

test('invalid or ambiguous selections and parameters are rejected', () => {
  for (const changed of [
    {selectedIds:[]},{selectedIds:undefined},{selectedIds:['UE1','UE1']},
    {selectedIds:['DSCG2']},{selectedIds:['foreign']},{level:'unknown'},
    {weeks:0},{weeks:13},{weeks:3.5},{hours:0},{hours:21},{hours:NaN},{hours:2.5},
  ]) {
    const c = {...config,...changed};
    assert.throws(() => buildPlan(ues,c.weeks,c.level,c.hours,c.selectedIds));
  }
});

test('versioned storage restores settings and canonical subject data', () => {
  const restored = restorePlan(ues,JSON.parse(JSON.stringify({version:2,config})));
  assert.deepEqual(restored.config,config);
  assert.equal(restored.plan[0].subjects[0],ues.find(ue => ue.id === 'UE1'));
  assert.deepEqual(restored.plan,buildPlan(ues,4,'DCG',3,['UE1','UE4']));
});

test('old saved schedules retain only their actual UEs', () => {
  const saved = Array.from({length:4},(_,i) => ({num:i+1,hours:3,subjects:[{id:i%2?'UE4':'UE1',label:'Outdated label'}]}));
  const restored = restorePlan(ues,saved);
  assert.deepEqual(restored.config,config);
  assert.deepEqual(restored.plan[0].subjects.map(ue => ue.id),['UE1','UE4']);
  assert.notEqual(restored.plan[0].subjects[0].label,'Outdated label');
});

test('malformed, foreign or mixed saved plans cannot create a schedule', () => {
  for (const saved of [null,[],[{}],{version:3,config},{version:2,config:{...config,selectedIds:['foreign']}},
    Array.from({length:4},(_,i)=>({num:i+1,hours:3,subjects:[{id:i%2?'DSCG2':'UE1'}]})),
    Array.from({length:4},(_,i)=>({num:i+1,hours:i===2?5:3,subjects:[{id:'UE1'}]}))]) {
    assert.throws(() => restorePlan(ues,saved));
  }
});
