import {useId,useState} from 'react';
import {calculateVisual,VISUAL_MODELS} from '../lib/visual-calculations.mjs';

const number=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2});
const compact=new Intl.NumberFormat('fr-FR',{notation:'compact',maximumFractionDigits:1});
const value=(n,unit)=>number.format(n)+(unit?' '+unit:'');

function DataTable({caption,headers,rows}) {
  return <div className="lesson-table-scroll" tabIndex={0} role="region" aria-label={caption}><table className="lesson-data-table"><caption>{caption}</caption><thead><tr>{headers.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th scope="row" key={j}>{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function LessonChart({plot}) {
  const id=useId(),left=64,right=660,top=24,bottom=280;
  const points=plot.series.flatMap(s=>s.values),xs=points.map(p=>p.x),ys=points.map(p=>p.y);
  const xmin=Math.min(...xs),xmax=Math.max(...xs),low=Math.min(0,...ys),high=Math.max(0,...ys),padding=(high-low||1)*.06;
  const ymin=low<0?low-padding:0,ymax=high+padding;
  const px=x=>left+(x-xmin)/(xmax-xmin||1)*(right-left),py=y=>bottom-(y-ymin)/(ymax-ymin)*(bottom-top);
  const dash=['','8 5','2 5'];
  return <figure className="lesson-chart"><figcaption>{plot.title}</figcaption><div className="chart-canvas" tabIndex={0} role="region" aria-label={plot.title+' : graphique défilable'}><svg viewBox="0 0 700 342" role="img" aria-labelledby={id+'-title '+id+'-description'}><title id={id+'-title'}>{plot.title}</title><desc id={id+'-description'}>{plot.reading} Les valeurs précises sont disponibles dans le tableau sous le graphique.</desc>
    {Array.from({length:5},(_,i)=>{const y=ymin+(ymax-ymin)*i/4;return <g key={i}><line className="chart-grid" x1={left} y1={py(y)} x2={right} y2={py(y)}/><text x={left-9} y={py(y)+4} textAnchor="end">{compact.format(y)}</text></g>;})}
    <line className="chart-zero" x1={left} y1={py(0)} x2={right} y2={py(0)}/>
    <line className="chart-focus" x1={px(plot.focus.x)} y1={top} x2={px(plot.focus.x)} y2={bottom}/>
    {Array.from({length:5},(_,i)=>{const x=xmin+(xmax-xmin)*i/4;return <text key={i} x={px(x)} y={bottom+22} textAnchor="middle">{compact.format(x)}</text>;})}
    {plot.series.map((s,i)=><g key={s.name} className={'chart-series chart-series-'+i}><polyline fill="none" strokeWidth="3" strokeDasharray={dash[i%3]} points={s.values.map(p=>px(p.x)+','+py(p.y)).join(' ')}/>{s.values.map((p,j)=><circle key={j} cx={px(p.x)} cy={py(p.y)} r="3"><title>{s.name+' : '+plot.xLabel+' = '+number.format(p.x)+' ; '+plot.yLabel+' = '+number.format(p.y)}</title></circle>)}<circle className="chart-current" cx={px(plot.focus.x)} cy={py(plot.focus.ys[i])} r="6"/></g>)}
    <text x={left} y="13">{plot.yLabel}</text><text x={(left+right)/2} y="331" textAnchor="middle">{plot.xLabel}</text>
  </svg></div><ul className="chart-legend">{plot.series.map((s,i)=><li key={s.name}><span className={'chart-key chart-series-'+i} aria-hidden="true">{i===0?'━':i===1?'┄':'┈'}</span>{s.name}</li>)}</ul><p>Les grands points repèrent {plot.title.startsWith('Valeur nette')?'la fin de la première année':plot.title.startsWith('Chiffre')?'le seuil de rentabilité':plot.title.startsWith('Coûts annuels')?'la quantité optimale':'la valeur sélectionnée'}. Sur un petit écran, le graphique peut défiler horizontalement.</p><p>{plot.reading}</p>
  <details className="chart-values"><summary>Consulter les valeurs du graphique</summary><DataTable caption={plot.title+' : valeurs tracées'} headers={[plot.xLabel,...plot.series.map(s=>s.name+' · '+plot.yLabel)]} rows={plot.series[0].values.map((p,i)=>[number.format(p.x),...plot.series.map(s=>number.format(s.values[i].y))])}/></details></figure>;
}

function CalculationLab({visuals}) {
  const model=VISUAL_MODELS[visuals.model],inputs=visuals.datasets[0].inputs;
  const original=Object.fromEntries(inputs.map(p=>[p.key,p.value]));
  const input=inputs.find(p=>p.key===model.key),[changed,setChanged]=useState(input.value),id=useId();
  const plot=calculateVisual(visuals.model,original,changed);
  return <section className="panel lesson-lab" aria-labelledby={id+'-title'}><span className="eyebrow">COMPRENDRE EN FAISANT VARIER</span><h2 id={id+'-title'}>{model.title}</h2><p>Exploration du dossier de référence. Modifiez une seule hypothèse et observez son effet sur les résultats.</p><p className="visual-assumptions"><strong>Cadre du modèle : </strong>{visuals.assumptions}</p>
    <div className="lab-control"><label htmlFor={id+'-range'}>{input.label}<output htmlFor={id+'-range'}>{value(changed,input.unit)}</output></label><input id={id+'-range'} type="range" min={model.min} max={model.max} step={model.step} value={changed} onChange={e=>setChanged(Number(e.target.value))} aria-valuetext={value(changed,input.unit)}/><div className="lab-control-limits"><span>{value(model.min,input.unit)}</span><span>{value(model.max,input.unit)}</span></div><button className="btn btn-secondary" onClick={()=>setChanged(input.value)}>Revenir au dossier de référence</button></div>
    <div className="lab-results" aria-live="polite" aria-atomic="true">{plot.rows.map(r=><div key={r.label}><span>{r.label}</span><strong>{value(r.value,r.unit)}</strong></div>)}</div>
    <LessonChart plot={plot}/><details className="chart-values"><summary>Retrouver les autres données du dossier</summary><DataTable caption="Hypothèses maintenues constantes" headers={['Donnée','Valeur']} rows={inputs.filter(p=>p.key!==model.key).map(p=>[p.label,value(p.value,p.unit)])}/></details>
  </section>;
}

export default function LessonVisuals({visuals}) {
  const [tab,setTab]=useState('map'),[selected,setSelected]=useState(0),[step,setStep]=useState(0),[dataset,setDataset]=useState(0),id=useId();
  if(!visuals?.concepts?.length)return null;
  const tabs=[['map','Carte mentale'],['table','Tableau de repères'],['case',visuals.datasets?'Dossiers chiffrés':'Raisonnement pas à pas']];
  const current=visuals.concepts[selected];
  const changeTab=event=>{const keys=['ArrowRight','ArrowLeft','Home','End'];if(!keys.includes(event.key))return;event.preventDefault();const i=tabs.findIndex(t=>t[0]===tab),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;setTab(tabs[next][0]);document.getElementById(id+'-tab-'+tabs[next][0])?.focus();};
  return <div className="lesson-visuals" id="lesson-visuals"><section className="panel lesson-visual-overview"><span className="eyebrow">LE CHAPITRE EN IMAGES</span><h2>Reliez les idées, puis explorez le dossier</h2><div className="lesson-visual-tabs" role="tablist" aria-label="Vues du chapitre" onKeyDown={changeTab}>{tabs.map(([key,label])=><button type="button" key={key} role="tab" id={id+'-tab-'+key} aria-selected={tab===key} aria-controls={id+'-panel-'+key} tabIndex={tab===key?0:-1} onClick={()=>setTab(key)}>{label}</button>)}</div>
    {tabs.map(([key])=><div key={key} role="tabpanel" id={id+'-panel-'+key} aria-labelledby={id+'-tab-'+key} hidden={tab!==key} tabIndex={0}>
      {key==='map'&&<><p>Choisissez une branche pour retrouver la notion et son explication.</p><div className="lesson-mind-map"><div className="mind-map-root"><span>LE SUJET CENTRAL</span><strong>{visuals.title}</strong></div><div className="mind-map-branches">{visuals.concepts.map((c,i)=><button key={c.id} type="button" aria-pressed={selected===i} aria-controls={id+'-concept'} onClick={()=>setSelected(i)}><span>{String(i+1).padStart(2,'0')}</span><strong>{c.title}</strong><span aria-hidden="true">↗</span></button>)}</div></div><article className="mind-map-detail" id={id+'-concept'} aria-live="polite"><h3>{current.title}</h3><strong>{current.summary}</strong><p>{current.detail}</p></article></>}
      {key==='table'&&<DataTable caption="Les notions du chapitre, côte à côte" headers={['Notion','Repère à retenir']} rows={visuals.concepts.map(c=>[c.title,c.summary])}/>}
      {key==='case'&&(visuals.datasets?<><label className="visual-dataset-label">Dossier à comparer<select value={dataset} onChange={e=>setDataset(Number(e.target.value))}>{visuals.datasets.map((_,i)=><option value={i} key={i}>Dossier {i+1}{i===0?' · référence':''}</option>)}</select></label><p>{visuals.datasets[dataset].context}</p><p className="visual-assumptions"><strong>Hypothèses : </strong>{visuals.assumptions}</p><DataTable caption="Données de départ" headers={['Donnée','Valeur et unité']} rows={visuals.datasets[dataset].inputs.map(p=>[p.label,value(p.value,p.unit)])}/><DataTable caption="Des données au résultat" headers={['Résultat recherché','Relation à appliquer','Valeur et unité']} rows={visuals.datasets[dataset].results.map(p=>[p.label,p.rule,value(p.value,p.unit)])}/></>:<><p>{visuals.context}</p><p>Avancez dans les questions du cas commenté. Chaque étape révèle la réponse attendue dans ce dossier.</p><ol className="lesson-reasoning-path">{visuals.steps.map((s,i)=><li key={i}><button type="button" aria-pressed={step===i} aria-controls={id+'-step'} onClick={()=>setStep(i)}><span>ÉTAPE {i+1}</span><strong>{s.title}</strong></button></li>)}</ol><article className="mind-map-detail" id={id+'-step'} aria-live="polite"><h3>{visuals.steps[step].title}</h3><p>{visuals.steps[step].detail}</p></article></>)}
    </div>)}
  </section>{visuals.model&&<CalculationLab visuals={visuals}/>}</div>;
}
