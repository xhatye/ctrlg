import {useState} from 'react';
import catalogue from './catalogue.json';
import {learningSteps,chapterKey} from '../lib/learning-progress.mjs';
const labels=['Lire le cours','QCM : 80 % sur 4 questions minimum','Réviser au moins 4 cartes','Travailler un cas'];
const screens=['resume_cours','qcm','flashcards','cas_pratique'];
export default function ProgressJourney({ues,learning={},onOpen}){
 const [level,setLevel]=useState('DCG'),[id,setId]=useState('UE9'),[filter,setFilter]=useState('all');
 const options=ues.filter(ue=>ue.level===level),ue=options.find(ue=>ue.id===id)||options[0];
 const chapters=catalogue.modules[ue.id].chapters.map(c=>({...c,progress:learning.chapters?.[chapterKey(ue.id,c.id)]||{}}));
 const totalDone=chapters.reduce((n,c)=>n+learningSteps(c.progress).done,0),possible=chapters.length*4;
 const shown=chapters.filter(c=>{const {done,started}=learningSteps(c.progress);return filter==='all'||filter==='started'&&started&&done<4||filter==='finished'&&done===4||filter==='new'&&!started;});
 return <section className="progress-journey">
  <div className="section-heading compact"><div><span className="eyebrow">VOTRE PARCOURS PAR CHAPITRE</span><h2>Comprendre, pratiquer, retenir.</h2></div><strong className="journey-total">{totalDone}/{possible} étapes en {ue.id}</strong></div>
  <p className="helper">Ce suivi décrit vos activités, pas une estimation de réussite à l’examen. La lecture est déclarative ; le cas est relu par comparaison au corrigé.</p>
  <div className="session-controls">
   <label className="chapter-select">Diplôme<select aria-label="Diplôme du parcours" value={level} onChange={e=>setLevel(e.target.value)}><option>DCG</option><option>DSCG</option></select></label>
   <label className="chapter-select">Matière<select aria-label="Matière du parcours" value={ue.id} onChange={e=>setId(e.target.value)}>{options.map(u=><option key={u.id} value={u.id}>{u.id} · {u.label}</option>)}</select></label>
   <label className="chapter-select">Afficher<select aria-label="État des chapitres" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tous les chapitres</option><option value="new">À commencer</option><option value="started">En cours</option><option value="finished">4 étapes réalisées</option></select></label>
  </div>
  <div className="progress-track journey-track" aria-label="Avancement des étapes"><i style={{width:Math.round(totalDone/possible*100)+'%'}} /></div>
  <div className="journey-grid">{shown.map(c=>{const status=learningSteps(c.progress),next=status.steps.indexOf(false);return <article className="panel journey-chapter" key={c.id}>
   <span className="eyebrow">{ue.id} · {status.done}/4 étapes</span><h3>{c.title}</h3>
   <ul>{labels.map((label,i)=><li className={status.steps[i]?'step-done':''} key={label}><span aria-hidden="true">{status.steps[i]?'✓':'○'}</span><button onClick={()=>onOpen?.(ue,c.id,screens[i])}>{label}</button></li>)}</ul>
   <p className="helper">QCM : {c.progress.quizAttempts||0} série(s){c.progress.quizAttempts?' · meilleur score '+c.progress.quizBest+' %':''}. Cartes révisées : {c.progress.cardsReviewed||0}.</p>
   <button className="btn btn-secondary" onClick={()=>onOpen?.(ue,c.id,screens[next<0?1:next])}>{status.done===4?'Entretenir les acquis':'Continuer ce chapitre'} </button>
  </article>})}</div>
  {!shown.length&&<p className="empty-state">Aucun chapitre dans cet état. Changez le filtre ou commencez une étape.</p>}
 </section>;
}
