import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildRevisionPlan,planAsText,PLANNER_PAGE,PLANNER_SUBJECTS} from '../lib/revision-planner.mjs';
import {seoForPath,structuredData} from '../lib/public-seo.mjs';
import {publicShareUrl} from '../lib/public-sharing.mjs';
const settings={weeks:4,hours:6,subjects:[{id:'UE9',weight:2},{id:'UE1',weight:1}],days:[0,2,5]};
test('revision planner respects the exact weekly budget and selected days for all supported bounds',()=>{
 for(const weeks of [1,4,12])for(const hours of [1,6,20])for(const days of [[6],[0,2,5],[0,1,2,3,4,5,6]]){const p=buildRevisionPlan({...settings,weeks,hours,days});assert.equal(p.sessionCount,weeks*hours*2);assert.equal(p.totalMinutes,weeks*hours*60);assert.equal(p.allocation.reduce((n,s)=>n+s.minutes,0),p.totalMinutes);for(const w of p.schedule){assert.equal(w.days.flatMap(d=>d.sessions).reduce((n,s)=>n+s.minutes,0),hours*60);assert.ok(w.days.every(d=>days.includes(d.day)));assert.ok(w.days.flatMap(d=>d.sessions).every(s=>['UE1','UE9'].includes(s.ue)));}}
});
test('priority receives more time without starving the other subject; output is reproducible',()=>{
 const p=buildRevisionPlan(settings);assert.deepEqual(p,buildRevisionPlan(settings));assert.equal(p.allocation[0].count,32);assert.equal(p.allocation[1].count,16);assert.deepEqual(p.uncovered,[]);assert.equal(p.schedule[0].days[0].sessions[0].title,'Comprendre');assert.ok(planAsText(p).includes('SEMAINE 4'));assert.ok(planAsText(p).includes('https://www.simdcg.com/test-gratuit'));
});
test('short plans report unallocated subjects and reject malformed or unbounded settings',()=>{
 const p=buildRevisionPlan({...settings,weeks:1,hours:1,subjects:PLANNER_SUBJECTS.map(s=>({id:s.id,weight:1}))});assert.equal(p.uncovered.length,18);
 for(const patch of [{weeks:0},{weeks:13},{hours:21},{hours:1.5},{days:[]},{days:[0,0]},{days:[7]},{subjects:[]},{subjects:[{id:'UE99',weight:1}]},{subjects:[{id:'UE1',weight:3}]},{subjects:[{id:'UE1',weight:1},{id:'UE1',weight:2}]}])assert.throws(()=>buildRevisionPlan({...settings,...patch}));
});
test('planner has public HTML, truthful free markup and links while sharing excludes all personal choices',async()=>{
 assert.equal(seoForPath(PLANNER_PAGE.path).index,true);assert.ok(structuredData(PLANNER_PAGE.path).some(s=>s['@type']==='WebApplication'&&s.offers?.price==='0'));assert.equal(publicShareUrl(PLANNER_PAGE.path+'?hours=8&ue=UE9#result'),'https://www.simdcg.com'+PLANNER_PAGE.path);
 const html=await readFile(new URL('../dist/public-pages/outils__planning-revision.html',import.meta.url),'utf8');assert.ok(html.includes('Créer mon planning gratuit'));assert.ok(html.includes('Mes UE à travailler'));assert.ok(html.includes('Lundi'));assert.ok(html.includes('index, follow'));
 const home=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(home.includes('href="'+PLANNER_PAGE.path+'"'));
 const source=await readFile(new URL('../src/PublicRevisionPlanner.jsx',import.meta.url),'utf8');assert.ok(!/fetch\(|localStorage|firebase|sessionStorage/.test(source));
});
