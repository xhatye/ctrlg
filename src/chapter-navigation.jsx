import { useEffect, useState } from 'react';
import catalogue from './catalogue.json';
import {learningSteps,chapterKey} from '../lib/learning-progress.mjs';

export function ChapterSelect({id,value,onChange,all=false,disabled=false}) {
  const chapters=catalogue.modules[id]?.chapters || [];
  return <label className="chapter-select">Chapitre
    <select aria-label="Chapitre" disabled={disabled} value={chapters.some(c=>c.id===value)||all&&value==='all'?value:(all?'all':chapters[0]?.id || '')} onChange={e=>onChange(e.target.value)}>
      {all&&<option value="all">Tous les chapitres</option>}
      {chapters.map(c=><option value={c.id} key={c.id}>{c.title}</option>)}
    </select>
  </label>;
}

export function StudySession({ue,kind,children}) {
  const [chapter,setChapter]=useState(ue.chapter || 'all'),[count,setCount]=useState(kind==='cards'?40:8),[focus,setFocus]=useState('knowledge');
  useEffect(()=>setChapter(ue.chapter || 'all'),[ue.id,ue.chapter]);
  const stats=catalogue.modules[ue.id];
  const selected=stats?.chapters.find(c=>c.id===chapter);
  const knowledge=(selected?selected.comprehensionCount:stats?.comprehensionCount)>0;
  const applications=selected?selected.questionCount>selected.comprehensionCount:stats?.applicationCount>0;
  const effectiveFocus=focus==='knowledge'&&!knowledge?'application':focus==='application'&&!applications?'knowledge':focus;
  return <div className="chapter-session">
    <div className="session-controls">
      <ChapterSelect id={ue.id} value={chapter} onChange={setChapter} all />
      <label className="chapter-select">Objectif de la série<select aria-label="Objectif de la série" value={effectiveFocus} onChange={e=>setFocus(e.target.value)}><option value="knowledge" disabled={!knowledge}>Comprendre les notions</option><option value="application" disabled={!applications}>Appliquer les calculs</option><option value="all">Mixer les deux</option></select></label>
      <label className="chapter-select">Longueur de la série<select aria-label="Longueur de la série" value={count} onChange={e=>setCount(Number(e.target.value))}>{(kind==='cards'?[20,40,60,100]:[4,8,12,20]).map(n=><option key={n} value={n}>{n} {kind==='cards'?'cartes':'questions'} maximum</option>)}</select></label>
      <span className="helper">{stats?.questionCount} questions · {stats?.chapters.length} chapitres. Changer le choix relance la série.</span>
    </div>
    <div key={[ue.id,chapter,count,effectiveFocus].join('-')}>{children({...ue,chapter,count,focus:effectiveFocus})}</div>
  </div>;
}

export function ChapterLibrary({ue,onOpen,learning={}}) {
  const [query,setQuery]=useState('');
  const stats=catalogue.modules[ue.id];
  const chapters=stats?.chapters.filter(c=>c.title.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr'))) || [];
  return <section className="chapter-library">
    <div className="section-heading compact"><div><span className="eyebrow">À VOTRE RYTHME</span><h2>Les chapitres de cette matière</h2></div><span className="helper">{stats?.chapters.length} cours · {stats?.questionCount} QCM · {stats?.cardCount} cartes · {stats?.caseCount} cas</span></div>
    <label className="search-input"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Trouver un chapitre" aria-label="Rechercher un chapitre" /></label>
    <div className="chapter-grid">{chapters.map((c,i)=>{const status=learningSteps(learning.chapters?.[chapterKey(ue.id,c.id)]);return <article className="chapter-card" key={c.id}>
      <span className="chapter-number">{String(i+1).padStart(2,'0')}</span><h3>{c.title}</h3><p>{c.minutes} min de lecture et révision · {c.questionCount} questions · {c.caseCount} cas</p><p className="helper">{c.practiceKind}</p>
      <span className="chapter-progress">{status.done}/4 étapes réalisées</span><div className="progress-track"><i style={{width:status.done*25+'%'}} /></div>
      <div>{[['resume_cours','Cours'],['qcm','QCM'],['flashcards','Cartes'],['cas_pratique','Cas']].map(([key,label])=><button key={key} onClick={()=>onOpen(key,c.id)}>{label}<span aria-hidden="true">↗</span></button>)}</div>
    </article>})}</div>
    {!chapters.length&&<p className="empty-state">Aucun chapitre ne correspond à cette recherche.</p>}
  </section>;
}
