import SubjectIcon from './SubjectIcon';
import {useState} from 'react';
import catalogue from './catalogue.json';
const steps=[['Cours','Comprendre la notion','Une méthode claire, des exemples et les points à retenir.'],['QCM','Mettre ses acquis à l’épreuve','Des questions concrètes et des réponses expliquées.'],['Cartes','Retrouver sans regarder','Des rappels pour consolider les notions difficiles.'],['Cas','Appliquer à une situation','Un dossier à travailler, puis un corrigé à comparer.']];
export default function HomeStudyPath({ues,onNav}){
 const [level,setLevel]=useState('DCG'),[id,setId]=useState('UE9'),[step,setStep]=useState(0);
 const subjects=ues.filter(u=>u.level===level),ue=subjects.find(u=>u.id===id)||subjects[0],data=catalogue.modules[ue.id];
 return <section className="home-study-path refined-path" aria-label="Explorer les parcours DCG et DSCG">
  <header className="path-header"><img src="/brand-mark.svg?v=3" width="27" height="27" alt=""/><strong>Votre espace de révision</strong><span>Aperçu interactif</span></header>
  <div className="path-diplomas" role="group" aria-label="Diplôme à explorer">{['DCG','DSCG'].map(d=><button key={d} aria-pressed={level===d} className={level===d?'active':''} onClick={()=>{setLevel(d);setStep(0);}}>{d}<span>{d==='DCG'?13:7} UE</span></button>)}</div>
  <label className="chapter-select">Matière à explorer<select aria-label="Matière à explorer" value={ue.id} onChange={e=>setId(e.target.value)}>{subjects.map(s=><option key={s.id} value={s.id}>{s.id.replace('DSCG','UE')} · {s.label}</option>)}</select></label>
  <div className="path-subject"><SubjectIcon id={ue.id} size={88}/><div><span className="eyebrow">{ue.level} · {ue.id.replace('DSCG','UE')}</span><h2>{ue.label}</h2><p>{data.chapters.length} chapitres · {data.curatedQuestionCount} QCM</p></div></div>
  <div className="path-tools" role="tablist" aria-label="Étapes du parcours">{steps.map(([title],i)=><button key={title} role="tab" id={'path-tab-'+i} aria-selected={step===i} aria-controls="path-description" tabIndex={step===i?0:-1} onClick={()=>setStep(i)} onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?3:(i+(e.key==='ArrowRight'?1:3))%4;setStep(n);document.getElementById('path-tab-'+n)?.focus();}}}><span>{i+1}</span>{title}</button>)}</div>
  <div className="path-description" id="path-description" role="tabpanel" aria-labelledby={'path-tab-'+step}><span className="refined-path-check" aria-hidden="true">✓</span><div><strong>{steps[step][1]}</strong><p>{steps[step][2]}</p></div></div>
  <button className="refined-path-link" onClick={()=>onNav(level==='DCG'?'dcg':'dscg')}>Explorer les chapitres du {level} </button>
 </section>;
}
