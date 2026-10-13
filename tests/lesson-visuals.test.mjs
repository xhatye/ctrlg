import test from 'node:test';
import assert from 'node:assert/strict';
import {MODULES,studyModule,moduleCatalogue} from '../lib/study-content.mjs';
import {VISUAL_MODELS,calculateVisual} from '../lib/visual-calculations.mjs';
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-7,actual+' differs from '+expected);

test('205 lesson maps and tables use canonical course concepts, and private visuals do not enter the catalogue',()=>{
  let chapters=0,numeric=0,models=0;
  for(const [id,m] of Object.entries(MODULES)){
    assert.ok(!JSON.stringify(moduleCatalogue(id)).includes('visuals'));
    for(const c of m.chapters){
      const v=studyModule(id,'summary',()=>.2,{chapter:c.id}).visuals;chapters++;
      assert.equal(v.title,c.title);assert.equal(v.context,c.cas.contexte);
      assert.equal(new Set(v.concepts.map(n=>n.id)).size,c.notions.length);
      assert.deepEqual(v.concepts.map(n=>[n.title,n.summary,n.detail]),c.notions.map(n=>[n.title,n.correct,n.body]));
      assert.deepEqual(v.steps,c.cas.questions.map(q=>({title:q.enonce,detail:q.answer})));
      if(v.datasets){numeric++;assert.equal(v.datasets.length,3);assert.equal(v.assumptions,c.practiceSpec.assumptions);
        for(let i=0;i<3;i++){
          const canonical=c.variantAt(i);assert.equal(v.datasets[i].context,canonical.contexte);
          const inputs=Object.fromEntries(v.datasets[i].inputs.map(p=>[p.key,p.value]));
          for(let j=0;j<4;j++){close(v.datasets[i].results[j].value,c.practiceSpec.tasks[j].calculate(inputs));assert.equal(v.datasets[i].results[j].unit,c.practiceSpec.tasks[j].unit);}
        }
      }
      if(v.model)models++;
      assert.doesNotThrow(()=>JSON.stringify(v));
    }
  }
  assert.equal(chapters,205);assert.equal(numeric,60);assert.equal(models,8);
});

test('eight visual models match independently derived reference results',()=>{
  const expectations={
    'diagnostic-fonctionnel':[40000,39000,1000],
    'van-deux-periodes':[7000/1.08,8000/(1.08*1.08),7000/1.08+8000/(1.08*1.08)-12000],
    'amortissement-prorata':[3200,1600,16400],
    'composants-machines':[4000,3000,7000,34000],
    'cout-variable-seuil':[40,62500,15000],
    'ecart-matiere':[1100,500,1600],
    'wilson-stocks':[Math.sqrt(600000),Math.sqrt(600000),Math.sqrt(600000)],
    'portefeuille-deux-actifs':[70,6.8,221.8,Math.sqrt(221.8)]
  };
  for(const m of Object.values(MODULES))for(const c of m.chapters)if(expectations[c.id]){
    const data=Object.fromEntries(Object.entries(c.practiceSpec.inputs).map(([key,p])=>[key,p.base]));
    const plot=calculateVisual(c.id,data);
    plot.rows.forEach((r,i)=>close(r.value,expectations[c.id][i]));
    // Test domain endpoints and a middle point, including negative plotted values.
    const config=VISUAL_MODELS[c.id];
    for(const change of [config.min,(config.min+config.max)/2,config.max]){
      const p=calculateVisual(c.id,data,change),xs=p.series[0].values.map(v=>v.x);
      assert.ok(p.rows.every(r=>Number.isFinite(r.value)));
      assert.ok(p.series.every(s=>s.values.every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y))));
      assert.ok(xs.every((x,i)=>i===0||xs[i-1]<x));
      for(const [i,s] of p.series.entries()){
        assert.deepEqual(s.values.map(v=>v.x),xs);
        close(s.values.find(v=>v.x===p.focus.x).y,p.focus.ys[i]);
      }
    }
    assert.throws(()=>calculateVisual(c.id,data,config.max+1));
    assert.throws(()=>calculateVisual(c.id,{...data,[config.key]:NaN}));
  }
});

test('interactive changes preserve accounting identities and mathematical boundary cases',()=>{
  const finance={stable:150000,fixed:110000,stocks:24000,clients:37000,suppliers:22000};
  const cash=calculateVisual('diagnostic-fonctionnel',finance,60000);assert.deepEqual(cash.rows.map(r=>r.value),[40000,62000,-22000]);
  const costs={sales:100000,variable:60000,fixed:25000};
  assert.deepEqual(calculateVisual('cout-variable-seuil',costs,0).rows.map(r=>r.value),[40,0,40000]);
  assert.throws(()=>calculateVisual('cout-variable-seuil',{...costs,variable:100000}));
  const material={actualQ:1100,standardQ:1000,actualP:6,standardP:5};
  const variance=calculateVisual('ecart-matiere',material,4);assert.deepEqual(variance.rows.map(r=>r.value),[-1100,500,-600]);
  const amort={structure:32000,component:9000,lifeS:8,lifeC:3};
  const short=calculateVisual('composants-machines',amort,1);
  assert.ok(short.series[1].values.filter(p=>p.x>=1).every(p=>p.y===0));
  const portfolio={weight:30,ra:4,rb:8,sa:10,sb:20,rho:.2};
  for(const [weight,returnRate,risk] of [[0,8,20],[100,4,10]]){const p=calculateVisual('portefeuille-deux-actifs',portfolio,weight);close(p.rows[1].value,returnRate);close(p.rows[3].value,risk);}
  assert.throws(()=>calculateVisual('portefeuille-deux-actifs',{...portfolio,rho:2}));
  assert.throws(()=>calculateVisual('wilson-stocks',{demand:12000,order:50,holding:0}));
  assert.throws(()=>calculateVisual('unknown',{}));
});
