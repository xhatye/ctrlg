import test from 'node:test';
import assert from 'node:assert/strict';
import { MODULES, studyModule, moduleCatalogue } from '../lib/study-content.mjs';
import { readStudy } from '../lib/study-access.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<=Math.max(1,Math.abs(b))*1e-10,`${a} differs from ${b}`);
const families=Object.values(MODULES).flatMap(m=>m.chapters.filter(c=>c.practice));
// Independently worked starting dossiers: expectations are fixed, not calls to
// the production calculation functions. Other variants have balance checks below.
const fixtures={
 'facture-remises':[1140,1117.2,223.44,1340.64],
 'escompte-reglement':[36,1764,352.8,2116.8],
 'cmp-periodique':[3200,32/3,1600,1600],
 'fifo-deux-lots':[3060,40,1240,1820],
 'amortissement-prorata':[16000,3200,1600,16400],
 'rapprochement-banque':[8100,8180,-80,0],
 'charges-constatees-avance':[200,800,1600,2400],
 'creance-douteuse':[5000,2000,1000,3000],
 'composants-machines':[4000,3000,7000,34000],
 'cession-immobilisation':[8000,1500,1900,11400],
 'augmentation-capital':[10000,16000,6000,6],
 'provision-evolution':[1500,5500,800,2300],
 'tva-credit-report':[3600,2400,-500,500],
 'is-taux-fourni':[1300,25300,6325,17675],
 'reintegration-amort':[1500,16500,4125,375],
 'elimination-intragroupe':[4000,5600,1600,4000],
 'ecart-acquisition-donne':[90000,72000,18000,18000],
 'test-depreciation-ias':[72000,72000,8000,72000],
 'diagnostic-fonctionnel':[40000,39000,1000,61000],
 'delais-rotation':[30,30,30,30],
 'caf-additive':[5800,27000,22000,5000],
 'rentabilite-levier':[120000,12000,10400,13],
 'van-deux-periodes':[6481.481481481481,6858.710562414266,1340.192043895747,3000],
 'investissement-bfr':[12000,15500,14090.90909090909,2090.90909090909],
 'emprunt-constant':[6000,1200,6960,3600],
 'emprunt-annuite':[7050.295815086569,1250,5800.295815086569,19199.70418491343],
 'cmpp-ponderation':[60,3.75,8.7,7.2],
 'medaf-beta':[5,4,7,-1],
 'dcf-croissance':[20400,7,291428.5714285714,225036.32847493873],
 'valeur-actions':[180000,720000,72,90],
 'obligation-coupon':[40,37.73584905660377,963.3321466714131,36.6678533285869],
 'portefeuille-deux-actifs':[70,6.8,221.8,14.892951352905172],
 'change-devises':[10000,10169.49152542373,169.49152542373,1200],
 'options-intrinseque':[10,4,400,106],
 'cout-complet-centre':[20,4000,10000,25],
 'abc-deux-activites':[40,100,1200,2000],
 'cout-variable-seuil':[40000,40,62500,15000],
 'securite-point-mort':[40000,100/3,240,800],
 'commande-supplementaire':[12500,7500,3800,17.4],
 'contrainte-goulot':[20,21,10,14],
 'ecart-matiere':[6600,1100,500,1600],
 'budget-ventes':[20000,24000,22400,9600],
 'budget-production':[2200,200,4400,17600],
 'wilson-stocks':[774.5966692414834,15.49193338482967,774.5966692414834,774.5966692414834],
 'prix-transfert-division':[15000,13000,28000,35000],
 'cout-cible':[25,75,10,1000/85],
 'tableau-bord-qualite':[4,6000,3000,3000],
 'choix-sous-traitance':[36000,45000,48000,3000],
 'productivite-organisation':[5,40/7,100/7,20],
 'pilotage-commercial':[8,60,15,4.8],
 'croissance-reelle':[8,103846.15384615384,3.84615384615384,4],
 'indices-pouvoir-achat':[5,2377.3584905660377,-.943396226415095,-22.6415094339623],
 'marche-travail-ratios':[9000,100/9,75,200/3],
 'multiplicateur-simple':[450,4,1800,80],
 'tableur-aggregation':[960,2160,3120,15.6],
 'sql-jointure-cardinalite':[300,100,60000,20000],
 'projet-si-budget':[48000,60000,6000,66000],
 'disponibilite-si':[716,99.44444444444444,3.6,.4],
 'capital-votes-clauses':[10000,70,480/7,60/7],
 'cession-dette-prix':[120000,20000,-20000,480000],
};

test('all sixty numeric families match independent worked starting dossiers',()=>{
 assert.equal(families.length,60);assert.equal(Object.keys(fixtures).length,60);
 for(const c of families){const expected=fixtures[c.id];assert.ok(expected,c.id);c.practice.slice(0,4).forEach((q,i)=>near(q.calculation.result,expected[i]));}
});

test('all 1500 variants conserve balances and have unique data and unambiguous answers',()=>{
 let count=0;
 for(const c of families){
  assert.equal(c.cases.length,25);assert.equal(new Set(c.cases.map(v=>v.contexte)).size,25);
  for(let k=0;k<25;k++){
   const items=c.practice.slice(k*4,k*4+4),d=items[0].calculation.inputs,r=items.map(q=>q.calculation.result);
   count++;
   for(const q of items){assert.ok(Number.isFinite(q.calculation.result));assert.equal(q.variant,k);assert.equal(new Set([q.correct,...q.wrong]).size,4);assert.ok(q.body.includes(q.correct));}
   switch(c.id){
    case 'facture-remises':near(r[1]+r[2],r[3]);assert.ok(r[1]<r[0]);break;
    case 'escompte-reglement':near(r[0]+r[1],d.net);near(r[1]+r[2],r[3]);break;
    case 'cmp-periodique':near(r[2]+r[3],r[0]);assert.ok(r[1]>=Math.min(d.c0,d.c1)&&r[1]<=Math.max(d.c0,d.c1));break;
    case 'fifo-deux-lots':near(r[2]+r[3],r[0]);assert.ok(d.out>d.q0&&d.out<d.q0+d.q1);break;
    case 'amortissement-prorata':near(r[2]+r[3],d.cost);assert.ok(r[1]*d.life<=d.cost);break;
    case 'rapprochement-banque':near(r[1]+r[2],r[0]);near(r[3],0);break;
    case 'charges-constatees-avance':near(r[1]+r[2],r[3]);break;
    case 'creance-douteuse':near(r[1]+r[3],r[0]);near(r[2]+d.old,r[1]);break;
    case 'composants-machines':near(r[0]+r[1],r[2]);near(r[2]+r[3],d.structure+d.component);break;
    case 'cession-immobilisation':near(r[0]+r[1],d.sale);near(d.sale+r[2],r[3]);break;
    case 'augmentation-capital':near(r[0]+r[2],r[1]);near(r[3]*d.shares,r[2]);break;
    case 'provision-evolution':near(d.old+r[0],r[1]);near(r[3],r[0]+r[2]);break;
    case 'tva-credit-report':near(r[2],r[0]-r[1]-d.credit);assert.ok(r[3]>=0);break;
    case 'is-taux-fourni':near(r[1],d.profit+r[0]);near(r[2]+r[3],d.profit);break;
    case 'reintegration-amort':near(r[1]-r[0],d.profit);near(r[2]-r[3],d.profit*d.rate/100);break;
    case 'elimination-intragroupe':near(r[1]-r[2],r[3]);assert.ok(r[2]>=0);break;
    case 'ecart-acquisition-donne':near(r[1]+r[3],r[0]);near(r[1]+r[2],d.price);break;
    case 'test-depreciation-ias':near(r[2]+r[3],d.book);assert.ok(r[1]>=r[0]&&r[1]>=d.use);break;
    case 'diagnostic-fonctionnel':near(r[0]-r[1],r[2]);near(r[3]-d.suppliers,r[1]);break;
    case 'delais-rotation':near(r[2]+r[0]-r[1],r[3]);break;
    case 'caf-additive':near(r[1]-d.dividend,r[2]);near(r[1]-d.profit,r[3]);break;
    case 'rentabilite-levier':near(r[2]+d.debt*d.rd/100,r[1]);near(r[3]*d.equity/100,r[2]);break;
    case 'van-deux-periodes':near(r[0]+r[1]-d.initial,r[2]);assert.ok(r[2]<r[3]);break;
    case 'investissement-bfr':near(r[2]-r[0],r[3]);near(r[1]-d.bfr,d.flow);break;
    case 'emprunt-constant':near(r[0]*d.years,d.capital);near(r[3],Array.from({length:d.years},(_,i)=>(d.capital-i*r[0])*d.rate/100).reduce((s,v)=>s+v,0));break;
    case 'emprunt-annuite':{let balance=d.capital;for(let year=0;year<d.years;year++)balance=balance*(1+d.rate/100)-r[0];near(balance,0);near(r[0]-r[1],r[2]);near(d.capital-r[2],r[3]);break;}
    case 'cmpp-ponderation':assert.ok(r[2]>=r[1]&&r[2]<=d.ke);near(r[0]+d.debt/(d.equity+d.debt)*100,100);break;
    case 'medaf-beta':near(d.rf+r[1],r[2]);near(r[2]-d.market,r[3]);break;
    case 'dcf-croissance':assert.ok(d.rate>d.growth);near(r[2]/r[3],(1+d.rate/100)**d.years);break;
    case 'valeur-actions':near(r[0]+r[1],d.enterprise);near(r[2]*d.shares,r[1]);break;
    case 'obligation-coupon':near(r[2]+r[3],d.nominal);assert.ok(r[2]<d.nominal);break;
    case 'portefeuille-deux-actifs':near(r[3]**2,r[2]);assert.ok(r[1]>=d.ra&&r[1]<=d.rb);assert.ok(r[3]<=d.weight/100*d.sa+(1-d.weight/100)*d.sb);break;
    case 'change-devises':near(r[0]*d.spot,d.usd);near(r[1]*d.forward,d.usd);near(r[1]-r[0],r[2]);break;
    case 'options-intrinseque':near(r[1]*d.qty,r[2]);near(r[0]-r[1],d.premium);near(r[3]-d.strike,d.premium);break;
    case 'cout-complet-centre':near(r[1]+d.direct,r[2]);near(r[3]*d.qty,r[2]);break;
    case 'abc-deux-activites':near(r[0]*d.orders,d.ordersCost);near(r[1]*d.sets,d.setCost);near(r[2]+r[1]*d.useS,r[3]);break;
    case 'cout-variable-seuil':near(r[0]-d.fixed,r[3]);near(r[2]*r[1]/100,d.fixed);break;
    case 'securite-point-mort':near(d.sales-r[0],d.threshold);near(r[3]*d.price,d.threshold);break;
    case 'commande-supplementaire':near(r[0]-r[1]-d.specific,r[2]);near(d.qty*r[3],r[1]+d.specific);break;
    case 'contrainte-goulot':near(r[2]*d.ha,r[0]);near(r[3]*d.hb,r[1]);break;
    case 'ecart-matiere':near(r[1]+r[2],r[3]);near(r[0]-r[3],d.standardQ*d.standardP);break;
    case 'budget-ventes':near(r[2]+r[3],r[1]+r[0]*(1-d.immediate/100));break;
    case 'budget-production':near(d.initial+r[0]-d.sales,d.target);near(r[2]*d.cost,r[3]);break;
    case 'wilson-stocks':near(r[0]*r[1],d.demand);near(r[2],r[3]);break;
    case 'prix-transfert-division':near(r[0]+r[1],r[2]);near(d.qty*d.internal,r[3]);break;
    case 'cout-cible':near(r[0]+r[1],d.price);near(r[1]+r[2],d.estimated);break;
    case 'tableau-bord-qualite':near(r[2]+r[3],r[1]);near(r[0]*d.qty/100,d.defects);break;
    case 'choix-sous-traitance':near(r[0]+d.fixed,r[1]);near(r[1]+r[3],r[2]);break;
    case 'productivite-organisation':near(r[0]*d.h0,d.q0);near(r[1]*d.h1,d.q1);break;
    case 'pilotage-commercial':near(r[1]*d.buyers,d.sales);near(r[2]*d.buyers,d.cost);near(r[3]*d.prospects,d.sales);break;
    case 'croissance-reelle':near(r[1]*(1+r[3]/100),d.v1);near((1+r[2]/100)*(1+r[3]/100),1+r[0]/100);break;
    case 'indices-pouvoir-achat':near(d.income0+r[3],r[1]);near(r[1]*d.price/100,d.income1);break;
    case 'marche-travail-ratios':near(r[0],d.employed+d.unemployed);near(r[3]+d.unemployed/d.population*100,r[2]);break;
    case 'multiplicateur-simple':near(r[0]*r[1],r[2]);near(r[3],r[1]*d.delta);break;
    case 'tableur-aggregation':near(r[0]+r[1],r[2]);near(r[3]*(d.qa+d.qb),r[2]);break;
    case 'sql-jointure-cardinalite':near(r[2]/d.lines,r[3]);near(r[0]/d.lines,r[1]);break;
    case 'projet-si-budget':near(r[0]+d.licenses,r[1]);near(r[1]+r[2],r[3]);break;
    case 'disponibilite-si':near(r[0]+d.down,d.window);near(r[2]+r[3],d.down);break;
    case 'capital-votes-clauses':assert.ok(d.yes<=d.present&&d.present<=d.shares);near(r[2]-d.threshold,r[3]);break;
    case 'cession-dette-prix':near(r[0]-d.target,r[1]);near(r[1],-r[2]);near(d.price+r[2],r[3]);break;
    default:assert.fail('Missing independent balance check for '+c.id);
   }
  }
 }
 assert.equal(count,1500);
});

test('twentyfold practice is labelled, addressable and bounded per request',()=>{
 const totals=Object.keys(MODULES).map(moduleCatalogue);
 assert.ok(totals.reduce((n,m)=>n+m.questionCount,0)>=296*20);
 assert.ok(totals.reduce((n,m)=>n+m.caseCount,0)>=73*20);
 const m=MODULES.UE9,c=m.chapters.find(c=>c.id==='cmp-periodique');
 const first=studyModule('UE9','case',Math.random,{chapter:c.id,variant:0});
 const last=studyModule('UE9','case',Math.random,{chapter:c.id,variant:24});
 assert.notEqual(first.contexte,last.contexte);assert.equal(last.caseVariants.length,25);
 assert.throws(()=>studyModule('UE9','case',Math.random,{chapter:c.id,variant:25}),{status:404});
 assert.throws(()=>studyModule('UE9','case',Math.random,{variant:-1}),{status:404});
 const cards=studyModule('UE9','cards',Math.random,{chapter:c.id,count:100});assert.equal(cards.items.length,100);assert.equal(new Set(cards.items.map(i=>i.id)).size,100);
 assert.equal(studyModule('UE9','cards',Math.random,{chapter:c.id,count:20}).items.length,20);
 assert.ok(cards.items.every(i=>i.kind==='Application chiffrée'));
});

test('no anonymous or unpaid account can read any of the 20 subjects',async()=>{
 const unauthenticated={authenticate:async()=>{throw Object.assign(new Error('sign in'),{status:401})}};
 const unpaid={authenticate:async()=>({uid:'u'}),db:{collection:()=>({doc:()=>({get:async()=>({data:()=>({isPro:false})})})})}};
 for(const id of Object.keys(MODULES))for(const tool of ['summary','qcm','cards','case']){
  await assert.rejects(readStudy(id,tool,undefined,unauthenticated),{status:401});
  await assert.rejects(readStudy(id,tool,'Bearer token',unpaid),{status:403});
 }
});
