import {useEffect,useRef,useState} from 'react';
import catalogue from './catalogue.json';
import SubjectIcon from './SubjectIcon';
import './annals-preview.css';
export default function AnnalsPreview({onNav}){
 const [level,setLevel]=useState('DCG'),[query,setQuery]=useState(''),[selected,setSelected]=useState(null);
 const detail=useRef(null);
 useEffect(()=>{if(selected)detail.current?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});},[selected]);
 const normal=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ue\s+(\d+)/g,'ue$1');
 const subjects=Object.entries(catalogue.modules).filter(([id,m])=>(id.startsWith('DSCG')?'DSCG':'DCG')===level&&normal(`${level} UE${id.replace(/\D/g,'')} ${m.title}`).includes(normal(query)));
 return <div className="page annals-preview"><div className="page-title"><span className="eyebrow">LA BIBLIOTHÈQUE DES ÉPREUVES</span><h1>Mes annales</h1><p>Un espace pour retrouver les sujets et organiser vos entraînements.</p></div>
  <div className="annals-notice"><span>En préparation</span><p>Voici la présentation du futur espace. Les annales et leurs corrections ne sont pas encore importées.</p></div>
  <section className="panel annals-hero"><div><span className="eyebrow">DU SUJET À LA COPIE</span><h2>Une UE. Un dossier.<br/>Votre prochain entraînement.</h2><p>Choisissez votre diplôme et une matière pour découvrir l’organisation prévue.</p><button className="btn" onClick={()=>onNav('exams')}>Ouvrir le mode examen actuel →</button></div><div className="annals-paper" aria-hidden="true"><small>DCG · DSCG</small><strong>SUJET<br/>D’EXAMEN</strong><i/><i/><i/><span>Documents · Questions · Correction</span></div></section>
  <div className="annals-tools"><div className="g-diploma-switch" aria-label="Diplôme">{['DCG','DSCG'].map(v=><button key={v} aria-pressed={level===v} onClick={()=>{setLevel(v);setSelected(null);}}>{v}</button>)}</div><label>Rechercher une UE<input type="search" placeholder="Comptabilité, UE4…" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
  <div className="annals-subjects">{subjects.map(([id,m])=><button className={'panel annals-subject'+(selected===id?' selected':'')} key={id} onClick={()=>setSelected(id)} aria-pressed={selected===id}><SubjectIcon id={id} size={48}/><small>{level} · UE{id.replace(/\D/g,'')}</small><h3>{m.title}</h3><span>Voir l’organisation prévue ↗</span></button>)}</div>
  {!subjects.length&&<p role="status">Aucune UE ne correspond à votre recherche.</p>}
  {selected&&<section ref={detail} className="panel annals-future" aria-live="polite"><span className="eyebrow">{level} · UE{selected.replace(/\D/g,'')}</span><h2>{catalogue.modules[selected].title}</h2><p>Les sessions seront classées ici une fois les sujets vérifiés et leurs conditions de réutilisation contrôlées.</p><ol><li><strong>Le sujet</strong><span>Énoncé, annexes et informations de l’épreuve.</span></li><li><strong>Votre entraînement</strong><span>Lecture du dossier, rédaction et chronomètre.</span></li><li><strong>La correction</strong><span>Attendus, barème et comparaison de votre réponse.</span></li></ol><p className="helper">Les sujets originaux inspirés du format des épreuves et l’assistance IA sont prévus pour une étape ultérieure.</p></section>}
 </div>;
}
