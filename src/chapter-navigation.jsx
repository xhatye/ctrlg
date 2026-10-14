import { useEffect, useState, useRef } from 'react';
import catalogue from './catalogue.json';
import {learningSteps,chapterKey} from '../lib/learning-progress.mjs';

export function ChapterSelect({id,value,onChange,all=false,disabled=false}) {
  const chapters=catalogue.modules[id]?.chapters || [];
  const [open,setOpen]=useState(false),[query,setQuery]=useState(''),trigger=useRef(),dialog=useRef(),search=useRef();
  const current=chapters.find(c=>c.id===value),title=current?.title || (all?'Tous les chapitres':chapters[0]?.title);
  const filtered=chapters.filter(c=>c.title.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(query.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'')));
  const close=()=>{setOpen(false);trigger.current?.focus();};
  useEffect(()=>{if(!open)return;const before=document.body.style.overflow;document.body.style.overflow='hidden';search.current?.focus();return()=>{document.body.style.overflow=before;};},[open]);
  useEffect(()=>{setOpen(false);setQuery('');},[id]);
  const choose=id=>{onChange(id);close();};
  const keyboard=e=>{
    if(e.key==='Escape'){e.preventDefault();close();}
    if(e.key==='Tab'){const items=[...dialog.current.querySelectorAll('button:not(:disabled),input')];const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  };
  return <div className="chapter-select chapter-picker"><span>Chapitre</span>
    <button ref={trigger} type="button" className="chapter-trigger" aria-label="Choisir un chapitre" aria-haspopup="dialog" aria-expanded={open} disabled={disabled} onClick={()=>{setQuery('');setOpen(true);}}><span><small>{id} · {chapters.length} chapitres</small><strong>{title}</strong></span><span aria-hidden="true">⌄</span></button>
    {open&&<div className="chapter-picker-overlay" onClick={e=>{if(e.target===e.currentTarget)close();}}>
      <section className="chapter-picker-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="chapter-picker-title" onKeyDown={keyboard}>
        <header><div><span className="eyebrow">{id} · VOTRE PROGRAMME</span><h2 id="chapter-picker-title">Choisissez votre chapitre</h2></div><button className="picker-close" aria-label="Fermer le choix de chapitre" onClick={close}>×</button></header>
        <label className="search-input"><input ref={search} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Un thème, une notion…" aria-label="Rechercher dans les chapitres"/></label>
        <p className="helper" role="status">{filtered.length} chapitre{filtered.length>1?'s':''} trouvé{filtered.length>1?'s':''}. Changer le choix relance l’activité.</p>
        <div className="chapter-picker-list">
          {all&&!query&&<button className={value==='all'?'selected':''} onClick={()=>choose('all')}><span className="picker-index">∑</span><span><strong>Tous les chapitres</strong><small>Une série répartie dans cette matière</small></span><span aria-hidden="true">↗</span></button>}
          {filtered.map(c=><button key={c.id} className={value===c.id?'selected':''} onClick={()=>choose(c.id)}><span className="picker-index">{String(chapters.indexOf(c)+1).padStart(2,'0')}</span><span><strong>{c.title}</strong><small>{c.minutes} min · {c.curatedQuestionCount ?? c.comprehensionCount} questions de notions{c.applicationCount?' · calculs disponibles':''}</small></span><span aria-hidden="true">{value===c.id?'✓':'↗'}</span></button>)}
          {!filtered.length&&<p className="empty-state">Aucun résultat. Essayez un autre mot ou effacez votre recherche.</p>}
        </div>
      </section>
    </div>}
  </div>;
}

export function StudySession({ue,kind,children}) {
  const [settingsOpen,setSettingsOpen]=useState(()=>window.innerWidth>760);
  const [chapter,setChapter]=useState(ue.chapter || 'all'),[count,setCount]=useState(kind==='cards'?40:8),[focus,setFocus]=useState('knowledge');
  useEffect(()=>setChapter(ue.chapter || 'all'),[ue.id,ue.chapter]);
  const stats=catalogue.modules[ue.id];
  const selected=stats?.chapters.find(c=>c.id===chapter);
  const knowledge=(selected?selected.comprehensionCount:stats?.comprehensionCount)>0;
  const applications=(selected?selected.applicationCount:stats?.applicationCount)>0;
  const effectiveFocus=focus==='knowledge'&&!knowledge?'application':focus==='application'&&!applications?'knowledge':focus;
  return <div className="chapter-session">
    <details className="session-settings" open={settingsOpen} onToggle={e=>setSettingsOpen(e.currentTarget.open)}>
      <summary>Réglages de la série <span>{ue.id.replace('DSCG','UE')} · {count} {kind==='cards'?'cartes':'questions'} maximum</span></summary>
    <div className="session-controls">
      <ChapterSelect id={ue.id} value={chapter} onChange={setChapter} all />
      <label className="chapter-select">Objectif de la série<select aria-label="Objectif de la série" value={effectiveFocus} onChange={e=>setFocus(e.target.value)}><option value="knowledge" disabled={!knowledge}>Comprendre les notions</option><option value="application" disabled={!applications}>Appliquer les calculs</option><option value="all">Mixer les deux</option></select></label>
      <label className="chapter-select">Longueur de la série<select aria-label="Longueur de la série" value={count} onChange={e=>setCount(Number(e.target.value))}>{(kind==='cards'?[4,20,40,60,100]:[4,8,12,20]).map(n=><option key={n} value={n}>{n} {kind==='cards'?'cartes':'questions'} maximum</option>)}</select></label>
      <span className="helper">Séries de notions et exercices de calcul sont séparés. Changer le choix relance la série.</span>
    </div></details>
    <div key={[ue.id,chapter,count,effectiveFocus].join('-')}>{children({...ue,chapter,count,focus:effectiveFocus})}</div>
  </div>;
}

export function ChapterLibrary({ue,onOpen,learning={}}) {
  const [query,setQuery]=useState('');
  const stats=catalogue.modules[ue.id];
  const chapters=stats?.chapters.filter(c=>c.title.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr'))) || [];
  return <section className="chapter-library">
    <div className="section-heading compact"><div><span className="eyebrow">À VOTRE RYTHME</span><h2>Les chapitres de cette matière</h2></div><span className="helper">{stats?.chapters.length} cours · {stats?.curatedQuestionCount ?? stats?.comprehensionCount} QCM de notions · {stats?.cardCount} cartes de rappel</span></div>
    <label className="search-input"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Trouver un chapitre" aria-label="Rechercher un chapitre" /></label>
    <div className="chapter-grid">{chapters.map((c,i)=>{const status=learningSteps(learning.chapters?.[chapterKey(ue.id,c.id)]);return <article className="chapter-card" key={c.id}>
      <span className="chapter-number">{String(stats.chapters.indexOf(c)+1).padStart(2,'0')}</span><h3>{c.title}</h3><p>{c.minutes} min de lecture et révision</p><div className="chapter-content-tags"><span>{c.curatedQuestionCount ?? c.comprehensionCount} QCM de notions</span><span>{c.cardCount ?? 0} cartes de rappel</span><span>{c.curatedCaseCount ?? 1} modèle{(c.curatedCaseCount ?? 1)>1?"s":""} de cas</span>{c.applicationCount>0&&<span>Calculs à variantes</span>}</div>
      <span className="chapter-progress">{status.done}/4 étapes réalisées</span><div className="progress-track"><i style={{width:status.done*25+'%'}} /></div>
      <div className="chapter-actions">{[['resume_cours','Lire le cours'],['qcm','Faire un QCM'],['flashcards','Réviser les cartes'],['cas_pratique','Travailler un cas']].map(([key,label])=><button key={key} onClick={()=>onOpen(key,c.id)}>{label}<span aria-hidden="true">↗</span></button>)}</div>
    </article>})}</div>
    {!chapters.length&&<p className="empty-state">Aucun chapitre ne correspond à cette recherche.</p>}
  </section>;
}
