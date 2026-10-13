import {useState} from 'react';
import catalogue from './catalogue.json';
const steps=[['Cours','Comprendre la notion','Objectifs, méthode, exemples et erreurs à éviter.'],['QCM','Vérifier le raisonnement','Choisissez une série de notions, de calculs ou un mélange.'],['Cartes','Retrouver sans regarder','Évaluez vos réponses et reprenez les cartes difficiles.'],['Cas','Appliquer à un dossier','Comparez vos étapes au corrigé, puis essayez une autre variante.']];
export default function HomeStudyPath({ues,onNav}){
 const [level,setLevel]=useState('DCG'),[id,setId]=useState('UE9'),[step,setStep]=useState(0);
 const subjects=ues.filter(u=>u.level===level),ue=subjects.find(u=>u.id===id)||subjects[0],data=catalogue.modules[ue.id];
 return <section className="home-study-path" aria-label="Explorer les parcours DCG et DSCG">
  <div className="path-header"><img src="/favicon.svg?v=2" width="32" height="32" alt=""/><div><strong>Votre diplôme, vos UE.</strong><span>Cours, entraînement et suivi par chapitre.</span></div></div>
  <div className="path-diplomas" role="group" aria-label="Diplôme à explorer">{['DCG','DSCG'].map(d=><button key={d} aria-pressed={level===d} className={level===d?'active':''} onClick={()=>{setLevel(d);setStep(0);}}>{d}<span>{d==='DCG'?13:7} UE</span></button>)}</div>
  <label className="chapter-select">Choisissez votre matière<select aria-label="Matière à explorer" value={ue.id} onChange={e=>setId(e.target.value)}>{subjects.map(s=><option key={s.id} value={s.id}>{s.id} · {s.label}</option>)}</select></label>
  <div className="path-subject"><span className="eyebrow">{ue.level} · {ue.id}</span><h2>{ue.label}</h2><p>{data.chapters.length} chapitres · {data.comprehensionCount} questions de notions</p><ul>{data.chapters.slice(-3).map(c=><li key={c.id}>{c.title}</li>)}</ul></div>
  <div className="path-tools" role="tablist" aria-label="Étapes du parcours">{steps.map(([title],i)=><button key={title} role="tab" id={'path-tab-'+i} aria-selected={step===i} aria-controls="path-description" tabIndex={step===i?0:-1} onClick={()=>setStep(i)} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const n=(i+(e.key==='ArrowRight'?1:3))%4;setStep(n);document.getElementById('path-tab-'+n)?.focus();}}}><span>{i+1}</span>{title}</button>)}</div>
  <div className="path-description" id="path-description" role="tabpanel" aria-labelledby={'path-tab-'+step}><strong>{steps[step][1]}</strong><p>{steps[step][2]}</p><small>Les quatre étapes se retrouvent dans votre suivi par chapitre.</small></div>
  <button className="btn btn-secondary" onClick={()=>onNav(level==='DCG'?'dcg':'dscg')}>Voir les chapitres du {level} <span aria-hidden="true">↗</span></button>
 </section>;
}
