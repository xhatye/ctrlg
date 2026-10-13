import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MODULES, moduleCatalogue, studyModule } from '../lib/study-content.mjs';
import { readStudy } from '../lib/study-access.mjs';
import { curriculumFor } from '../lib/curriculum.mjs';
import { retrieveLessons } from '../lib/study-retrieval.mjs';
import { reserveCost } from '../lib/ai-budget.mjs';

test('every chapter provides original prose, a complete correction, provenance and unique options',()=>{
  const questions=new Set();let chapters=0;
  for(const [id,m]of Object.entries(MODULES)){
    assert.equal(new Set(m.chapters.map(c=>c.id)).size,m.chapters.length);
    for(const c of m.chapters){
      chapters++;assert.ok(c.intro&&c.method&&c.pitfalls.length);
      assert.equal(c.verifiedAt,'2026-10-13');assert.ok(c.rights.includes('originaux'));
      assert.ok(c.sources.length);for(const [label,url]of c.sources){assert.ok(label);assert.equal(new URL(url).protocol,'https:');}
      assert.equal(c.cas.questions.length,3);assert.ok(c.cas.contexte);
      for(const q of c.cas.questions)assert.ok(q.enonce&&q.answer);
      const quiz=studyModule(id,'qcm',()=>.37,{chapter:c.id,count:20});
      const pool=c.practice || c.notions;
      assert.equal(quiz.items.length,Math.min(20,pool.length));
      for(const n of pool){assert.ok(n.body.length>60);assert.equal(n.wrong.length,3);assert.equal(new Set([n.correct,...n.wrong]).size,4);assert.ok(!questions.has(n.q),'Duplicate question: '+n.q);questions.add(n.q);}
      for(const q of quiz.items){assert.equal(q.chapter,c.id);const n=m.notions[Number(q.id.split('-')[1])];assert.equal(q.options[q.answer],n.correct);}
      assert.equal(studyModule(id,'cards',Math.random,{chapter:c.id}).items.length,Math.min(40,pool.length));
      assert.equal(studyModule(id,'summary',Math.random,{chapter:c.id}).example.contexte,c.cas.contexte);
    }
  }
  assert.equal(chapters,145);assert.equal(questions.size,6344);
});
test('public catalogue contains counts and titles, never premium answers or lesson bodies',async()=>{
  const published=JSON.parse(readFileSync(new URL('../src/catalogue.json',import.meta.url),'utf8'));
  for(const [id,m]of Object.entries(MODULES)){
    const meta=await readStudy(id,'catalog',undefined,{});
    assert.deepEqual(meta,published.modules[id]);
    const json=JSON.stringify(meta);for(const n of m.notions){assert.ok(!json.includes(n.q));assert.ok(!json.includes(n.body));}
  }
  assert.deepEqual(published.totals,{subjects:20,chapters:145,questions:6344,cards:6344,cases:1585,concepts:584,applications:6000});
});
test('new premium chapters remain protected, and invalid chapters never read user data',async()=>{
  const noAuth={authenticate:async()=>{throw Object.assign(new Error('Connexion requise'),{status:401})}};
  for(const id of ['UE5','UE8','UE11','UE12','UE13','DSCG6','DSCG7'])await assert.rejects(readStudy(id,'summary',undefined,noAuth),{status:401});
  await assert.rejects(readStudy('UE2','summary',undefined,{}, {chapter:'__proto__'}),{status:404});
  await assert.rejects(readStudy('UE9','summary',undefined,noAuth,{chapter:'stocks'}),{status:401});
  for(const count of [0,21,-1,3.2,NaN])assert.throws(()=>studyModule('UE9','qcm',Math.random,{count}),{status:400});
});
test('session labels distinguish the 2026 and 2027 programmes',()=>{
  assert.equal(curriculumFor('2026').find(u=>u.id==='DSCG3').label,'Management et contrôle de gestion');
  assert.equal(curriculumFor('2027').find(u=>u.id==='DSCG3').label,'Contrôle de gestion et stratégie');
  assert.equal(curriculumFor('2027').filter(u=>u.level==='DCG').length,13);
  assert.equal(curriculumFor('2027').filter(u=>u.level==='DSCG').length,7);
});
test('retrieval uses relevant published prose, stays scoped and reserves its input cost',()=>{
  const result=retrieveLessons('Comment calculer le BFR et la trésorerie ?','UE6');
  assert.ok(result.context.includes('BFR'));assert.ok(result.context.length<=5000);assert.ok(result.references.length>0);
  assert.ok(result.references.every(r=>r.url.startsWith('/resume-cours?ue=UE6&chapter=')));
  assert.deepEqual(retrieveLessons('zzzzzzzzzzzz'),{context:'',references:[]});
  assert.deepEqual(retrieveLessons('BFR','__proto__'),{context:'',references:[]});
  const base={messages:[{role:'user',content:'Comment calculer le BFR ?'}],max_tokens:2048};
  assert.ok(reserveCost({...base,messages:[{role:'system',content:result.context},...base.messages]})>reserveCost(base));
});

// Each expected amount below is recomputed from the scenario, not from the bank.
const caseAnswer=(id,chapter,index)=>MODULES[id].chapters.find(c=>c.id===chapter).cas.questions[index].answer;
const check=(id,c,i,value)=>assert.ok(caseAnswer(id,c,i).includes(value),`${id}/${c}: expected ${value}`);
test('independent calculation checks cover the new worked cases',()=>{
  check('UE4','tva',2,String(4000*.2-1500*.2));
  check('UE4','resultat-fiscal',0,(18000+1200-500).toLocaleString('fr-FR').replaceAll('\u202f',' '));
  check('UE4','resultat-fiscal',1,String((18000+1200-500)*.25).replace('4675','4 675'));
  check('UE6','equilibre',2,String(150000-110000-(25000+35000-22000)).replace('2000','2 000'));
  check('UE6','investissement',1,String(11550/1.1-10000));
  check('UE6','financement',2,String((15000+10000+5000)*.04).replace('1200','1 200'));
  check('UE9','stocks',1,String(1200*9/12));
  check('UE9','actifs',2,String(18000-18000/6*2-10000).replace('2000','2 000'));
  check('UE10','evaluation',1,String(24000/8+6000/3).replace('5000','5 000'));
  check('UE10','capitaux',2,String(1000*(14-10)).replace('4000','4 000'));
  check('DSCG2','valorisation',2,String((900000-(250000-70000))/10000));
  check('DSCG2','portefeuille',0,String(.3*4+.7*8).replace('.',','));
  check('DSCG2','risques',0,String(12000/1.2).replace('10000','10 000'));
  check('DSCG4','consolidation',0,String(Math.round(.75*.8*100)));
  check('DSCG4','normes',1,String(160000-Math.max(140000,150000)).replace('10000','10 000'));
  check('UE5','politiques',1,((1.05/1.04-1)*100).toFixed(2).replace('.',','));
  check('UE11','couts',2,String((6000+200*(18000/900))/400));
  check('UE11','rentabilite',0,String(30000/(40-25)).replace('2000','2 000'));
  check('UE11','budgets',2,String(14100-(1200*8+4000)));
  check('DSCG3','couts-activites',1,String(120*(30000/1500)).replace('2400','2 400'));
  check('DSCG5','gouvernance-si',0,String(10000+3*3000).replace('19000','19 000'));
  check('DSCG5','projets',0,String(2+Math.max(4,3)+1));
  check('UE12','donnees',0,String((460000-400000)/400000*100));
  check('UE13','experience',0,String(12/300*100));
  check('DSCG6','documents',1,String((10-8)/10*100));
});

test('numeric quiz answers agree with separately recomputed expressions',()=>{
  const answer=(id,c,title)=>MODULES[id].chapters.find(x=>x.id===c).notions.find(x=>x.title===title).correct;
  const eq=(id,c,title,expected)=>assert.equal(answer(id,c,title),expected,`${id}/${c}/${title}`);
  eq('UE4','tva','Prix hors taxe',`${500*.2} €.`);
  eq('UE4','tva','Retour au hors taxe',`${1200/1.2} €.`.replace('1000','1 000'));
  eq('UE4','tva','Taxe nette',`${3000-1800} € à décaisser.`.replace('1200','1 200'));
  eq('UE4','resultat-fiscal','Passage au fiscal',`${10000+900-400} €.`.replace('10500','10 500'));
  eq('UE4','resultat-fiscal','Taux fourni',`${8000*.25} €.`.replace('2000','2 000'));
  eq('UE6','equilibre','Fonds de roulement',`${120000-90000} €.`.replace('30000','30 000'));
  eq('UE6','equilibre','BFR d’exploitation',`${20000+30000-18000} €.`.replace('32000','32 000'));
  eq('UE6','equilibre','Trésorerie nette',`${40000-25000} €.`.replace('15000','15 000'));
  eq('UE6','investissement','Actualisation',`${Math.round(110/1.1)} €.`);
  eq('UE6','investissement','Valeur actuelle nette',`${Math.round(1155/1.1-1000)} €.`);
  eq('UE6','financement','Intérêt d’une période',`${20000*.05} €.`.replace('1000','1 000'));
  eq('UE6','financement','Annuité',`${4000+600} €.`.replace('4600','4 600'));
  eq('UE9','stocks','Consommation de marchandises',`${5000+30000-7000} €.`.replace('28000','28 000'));
  eq('UE9','actifs','Base amortissable',`${(10000-1000)/5} €.`.replace('1800','1 800'));
  eq('UE9','actifs','Valeur nette comptable',`${12000-4000-500} €.`.replace('7500','7 500'));
  eq('UE10','capitaux','Prime d’émission',`${14-10} €.`);
  eq('DSCG2','valorisation','Valeur terminale',`${Math.round(10000/(.08-.03))} €.`.replace('200000','200 000'));
  eq('DSCG2','portefeuille','Rendement pondéré',`${.6*5+.4*10} %.`);
  eq('DSCG2','portefeuille','Prime de risque',`${3+1.2*5} %.`);
  eq('DSCG2','risques','Cotation de change',`${1200/1.2} €.`.replace('1000','1 000'));
  eq('UE5','production','Volume et prix',`${((1.1/1.05-1)*100).toFixed(2).replace('.',',')} %.`);
  eq('UE5','marches','Demande',`${-10/5}.`.replace('-','−'));
  eq('UE5','politiques','Revenu réel',`${((1.06/1.04-1)*100).toFixed(2).replace('.',',')} %.`);
  eq('UE11','couts','Unité d’œuvre',`${12000/600} €.`);
  eq('UE11','couts','Coût complet',`${(8000+2000)/500} €.`);
  eq('UE11','rentabilite','Taux de marge',`${30000/120000*100} %.`);
  eq('UE11','rentabilite','Seuil en valeur',`${20000/.4} €.`.replace('50000','50 000'));
  eq('UE11','rentabilite','Seuil en quantité',`${10000/(50-30)} unités.`);
  eq('UE11','budgets','Écart sur coût',`+${5200-5000} €.`);
  eq('DSCG3','couts-activites','Coût d’inducteur',`${24000/600} €.`);
});
