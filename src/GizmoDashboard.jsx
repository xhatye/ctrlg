import {revisionPriorities} from '../lib/revision-priorities.mjs';
import {recommendSession} from '../lib/study-guidance.mjs';
import {FIRST_SESSION_KEY} from '../lib/first-session.mjs';
import './starter.css';
import { useState } from 'react';
import { dashboardSummary } from '../lib/dashboard-summary.mjs';
import { restorePlan } from '../lib/study-plan.mjs';
import catalogue from './catalogue.json';
import SubjectIcon from './SubjectIcon';
import ExamCountdown from './ExamCountdown';
import { StudyIcon, useStudySearch } from './gizmo-ui';
import PlayfulHeading from './PlayfulHeading';

function savedPlan(ues,uid) {
  try { const raw=localStorage.getItem('simdcg-plan-'+uid);return raw?restorePlan(ues,JSON.parse(raw)).config:null; } catch { return null; }
}
export default function GizmoDashboard(props) { return <Dashboard key={props.user.uid} {...props}/>; }
function Dashboard({user,ues,onNav,onSelect,onOpen,learning={},learningError,learningLoading,onRetry}) {
  const search = useStudySearch();
  const [starterDismissed,setStarterDismissed]=useState(()=>{try{return !!localStorage.getItem(FIRST_SESSION_KEY+user.uid);}catch{return false;}});
  const dismissStarter=()=>{setStarterDismissed(true);try{localStorage.setItem(FIRST_SESSION_KEY+user.uid,'dismissed');}catch{}};
  const [plan] = useState(()=>savedPlan(ues,user.uid));
  const stats = dashboardSummary(user,ues,catalogue,learning);
  const lastUE = ues.find(ue=>ue.id===stats.latest?.ue);
  const [level,setLevel] = useState(plan?.level || lastUE?.level || 'DCG');
  const [query,setQuery] = useState('');
  const [mine,setMine] = useState(Boolean(plan));
  const [expanded,setExpanded] = useState(false);
  const [goal,setGoal] = useState(()=>{try{const n=Number(localStorage.getItem('simdcg-daily-goal-'+user.uid));return [5,10,20].includes(n)?n:10;}catch{return 10;}});
  const [goalMessage,setGoalMessage] = useState('');
  const available = ues.filter(ue=>ue.level===level);
  const visible = available.filter(ue=>(!mine || !plan || plan.selectedIds.includes(ue.id))
    && `${ue.id.replace('DSCG','UE')} ${ue.label} ${ue.desc}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')));
  const subjects = expanded || query ? visible : visible.slice(0,6);
  const priority=revisionPriorities(catalogue.modules,learning,plan?.selectedIds)[0];
  const nextUE = ues.find(ue=>ue.id===priority?.module) || lastUE || ues.find(ue=>plan?.selectedIds.includes(ue.id)) || available[0];
  const module = catalogue.modules[nextUE.id];
  const chapter = module.chapters.find(c=>c.id===stats.latest?.chapter) || module.chapters[0];
  const recommendation = recommendSession(nextUE.id,module.chapters,learning);
  const open = target => onOpen ? onOpen(nextUE,chapter.id,target) : onSelect(nextUE);
  const goalPercent = Math.min(100,Math.round(stats.todayQuestions/goal*100));
  const changeGoal = value => {setGoal(value);try{localStorage.setItem('simdcg-daily-goal-'+user.uid,String(value));setGoalMessage('Objectif enregistré.');}catch{setGoalMessage('Objectif ajusté pour cette visite. La sauvegarde locale est indisponible.');}};

  return <div className="g-dashboard g-dashboard-refresh">
    <div className="g-home-heading"><h1>Bonjour {user.name?.split(' ')[0] || 'à vous'}.</h1><span>Votre espace DCG & DSCG</span></div>
    {!learningLoading&&!learningError&&!stats.history.length&&!stats.chaptersStarted&&!starterDismissed&&<section className="g-first-session-card" aria-label="Commencer ma première révision"><img src="/navigation-3d-v1/library.webp" width="54" height="54" alt=""/><div><h2>Cinq questions pour commencer.</h2><p>{user.isPro?'Choisissez votre UE, comprenez vos réponses et retrouvez la suite de votre parcours.':'Découvrez la méthode avec cinq questions offertes de comptabilité DCG UE9.'}</p></div><button className="btn" onClick={()=>onNav('first_session')}>Ma première révision</button><button className="text-button" onClick={dismissStarter}>Plus tard</button></section>}
    <section className="g-study-start audit-next-session" aria-labelledby="g-start-title"><div className="g-start-intro"><div><span className="eyebrow">VOTRE PROCHAINE SÉANCE</span><h2 id="g-start-title">{recommendation?.title||'Une notion à la fois'}</h2><p>{nextUE.level} {nextUE.id.replace('DSCG','UE')} · {nextUE.label}</p></div><img className="g-floating-companion" src="/illustrations/study-companion-v1.webp" width="104" height="104" alt=""/></div>{learningLoading?<p role="status">Recherche de votre prochaine étape…</p>:learningError?<p>Choisissez une activité pendant le chargement de votre suivi.</p>:<><p className="audit-next-reason">{recommendation?.reason}</p><div className="audit-next-actions"><button className="btn" onClick={()=>onNav(recommendation.target,{module:nextUE.id,chapter:recommendation.chapter,format:recommendation.format})}>{recommendation.action}</button><span>Environ {recommendation.minutes} min</span><button className="text-button" onClick={()=>onNav('library')}>Changer d’UE</button></div></>}<div className="g-start-actions" aria-label="Choisir un entraînement">{[['check','QCM','qcm'],['cards','Flashcards','flashcards'],['book','Cours','resume_cours']].map(([icon,label,target])=><button key={target} onClick={()=>open(target)} aria-label={label+' · '+nextUE.label}><StudyIcon name={icon} size={20}/>{label}</button>)}<button onClick={()=>onNav(user.isPro?'diagnostic':'first_session',{module:nextUE.id})}><StudyIcon name="chart" size={20}/>Faire le point</button></div></section>
    <section className="g-today-strip" aria-label="Mes révisions du jour">
      <button className="g-review-link" onClick={()=>onNav('review_today')}><span className="g-nav-icon"><StudyIcon name="cards"/></span><span><strong>À revoir aujourd’hui</strong><small>Retrouver les notions à consolider</small></span></button>
      <details className="g-daily-goal"><summary><span className="g-mini-ring" style={{'--goal-angle':goalPercent*3.6+'deg'}} aria-hidden="true"/><span><strong>{stats.todayQuestions}/{goal} questions</strong><small>Mon objectif du jour</small></span><span aria-hidden="true">⌄</span></summary><div className="g-goal-options"><label>Objectif quotidien<select aria-label="Objectif quotidien en questions" value={goal} onChange={e=>changeGoal(Number(e.target.value))}>{[5,10,20].map(n=><option key={n} value={n}>{n} questions</option>)}</select></label><small>QCM enregistrés aujourd’hui, heure de Paris.</small>{goalMessage&&<p role="status">{goalMessage}</p>}</div></details>
    </section>
    {lastUE&&<section className="g-continue-section" aria-label="Reprendre mon parcours"><h2>Reprendre</h2><button className="g-continue" onClick={()=>onSelect(lastUE)}><SubjectIcon id={lastUE.id} size={48}/><span><strong>{lastUE.label}</strong><small>{lastUE.level} {lastUE.id.replace('DSCG','UE')} · {chapter.title}</small></span></button></section>}
    <section className="g-subject-section" aria-labelledby="g-subject-title">
      <div className="g-section-title"><h2 id="g-subject-title">Mes UE</h2><div className="g-diploma-switch" role="group" aria-label="Diplôme à réviser">{['DCG','DSCG'].map(d=><button key={d} aria-pressed={level===d} onClick={()=>{setLevel(d);setMine(Boolean(plan&&plan.level===d));setExpanded(false);setQuery('');}}>{d}</button>)}</div></div>
      <div className="g-subject-tools"><label className="g-subject-search"><StudyIcon name="search" size={18}/><input aria-label="Rechercher une UE" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Filtrer mes UE" type="search"/></label>{plan?.level===level&&<label className="g-my-ues"><input type="checkbox" checked={mine} onChange={e=>setMine(e.target.checked)}/>UE de mon planning</label>}<button className="g-text-button" onClick={()=>onNav('planning')}>Choisir mes UE </button></div>
      {learningError&&<p className="g-alert" role="alert">Le suivi par chapitre ne peut pas être chargé. {onRetry&&<button onClick={onRetry}>Réessayer</button>}</p>}
      {learningLoading&&<p className="g-metric-note" role="status">Chargement de votre suivi par chapitre…</p>}
      <div className="g-subject-grid">{subjects.map((ue,i)=>{const m=catalogue.modules[ue.id],progress=stats.progress[ue.id],best=user.mastery?.[ue.id];return <button key={ue.id} className={'g-subject g-subject-tone-'+i%6} onClick={()=>onSelect(ue)}>
        <SubjectIcon id={ue.id} size={50}/><div className="g-subject-body"><span className="g-subject-code">{ue.level} {ue.id.replace('DSCG','UE')}</span><h3>{ue.label}</h3><p>{m.chapters.length} chapitres · {m.curatedQuestionCount} QCM</p>
        {!learningError&&!learningLoading&&progress.started>0&&<div className="g-progress-track" role="progressbar" aria-label={`Étapes du parcours ${ue.id}`} aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done} aria-valuetext={`${progress.done} étapes réalisées sur ${progress.total}`}><i style={{width:progress.percent+'%'}}/></div>}
        {best?.attempts>0&&Number.isFinite(best.best)&&<small className="g-qcm-best">Meilleur QCM : {best.best} %</small>}</div>
      </button>;})}</div>
      {!visible.length&&<div className="g-empty"><StudyIcon name="search" size={28}/><h3>Aucune UE trouvée</h3><p>Essayez son numéro ou un autre mot.</p><button className="g-button g-button-secondary" onClick={()=>{setQuery('');setMine(false);}}>Afficher les UE du {level}</button></div>}
      {visible.length>6&&!query&&<button className="g-show-all" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'Réduire la liste':`Voir les ${visible.length} UE du ${level}`} </button>}
    </section>
    <div className="g-home-secondary"><button onClick={()=>onNav('exams')}><StudyIcon name="check"/><span><strong>Mode examen</strong><small>Un dossier, un chrono, un corrigé.</small></span></button><button onClick={()=>onNav('progress')}><StudyIcon name="chart"/><span><strong>Ma progression</strong><small>{stats.history.length} sessions · {stats.average===null?'Premier QCM à venir':stats.average+' % de moyenne'}</small></span></button></div>
    <details className="g-calendar-details"><summary><StudyIcon name="calendar" size={19}/> Calendrier des examens <span aria-hidden="true">⌄</span></summary><ExamCountdown key={level} defaultLevel={level}/></details>
  </div>;
}
