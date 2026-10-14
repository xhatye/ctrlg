import { useState } from 'react';
import { dashboardSummary } from '../lib/dashboard-summary.mjs';
import { restorePlan } from '../lib/study-plan.mjs';
import catalogue from './catalogue.json';
import SubjectIcon from './SubjectIcon';
import ExamCountdown from './ExamCountdown';
import { StudyArt, StudyIcon } from './gizmo-ui';

function savedPlan(ues,uid) {
  try { const raw=localStorage.getItem('simdcg-plan-'+uid);return raw?restorePlan(ues,JSON.parse(raw)).config:null; } catch { return null; }
}
export default function GizmoDashboard(props) {
  return <Dashboard key={props.user.uid} {...props}/>;
}
function Dashboard({user,ues,onNav,onSelect,onOpen,learning={},learningError,learningLoading,onRetry}) {
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
  const nextUE = lastUE || ues.find(ue=>plan?.selectedIds.includes(ue.id)) || available[0];
  const module = catalogue.modules[nextUE.id];
  const chapter = module.chapters.find(c=>c.id===stats.latest?.chapter) || module.chapters[0];
  const open = target => onOpen ? onOpen(nextUE,chapter.id,target) : onSelect(nextUE);
  const goalPercent = Math.min(100,Math.round(stats.todayQuestions/goal*100));
  const changeGoal = value => {setGoal(value);try{localStorage.setItem('simdcg-daily-goal-'+user.uid,String(value));setGoalMessage('Objectif enregistré dans ce navigateur.');}catch{setGoalMessage('Objectif ajusté pour cette visite. La sauvegarde locale est indisponible.');}};

  return <div className="g-dashboard">
    <div className="g-dashboard-main">
      <div className="g-greeting"><span>MON ESPACE · DCG & DSCG</span><h1>Bonjour {user.name?.split(' ')[0] || 'à vous'} <span aria-hidden="true">✧</span></h1><p>Votre prochaine réussite commence par une notion.</p></div>
      <section className="g-welcome" aria-labelledby="g-welcome-title">
        <div><span className="g-eyebrow">UN PEU CHAQUE JOUR</span><h2 id="g-welcome-title">On révise quoi<br/>aujourd’hui ?</h2><p>Vos cours, vos QCM, vos cartes.<br/>Tout votre DCG et DSCG, au même endroit.</p>
          <button className="g-button" onClick={()=>onNav('review_today')}>À revoir aujourd’hui <StudyIcon name="arrow" size={18}/></button></div><StudyArt/>
      </section>
      <div className="g-quick-actions" aria-label="Choisir un entraînement">
        {[
          ['book','Un cours','Comprendre la notion','resume_cours','lavender'],
          ['check','Un QCM','Tester mes acquis','qcm','mint'],
          ['cards','Mes cartes','Retrouver sans regarder','flashcards','peach'],
        ].map(([icon,title,desc,target,color])=><button key={target} className={'g-action g-'+color} onClick={()=>open(target)} aria-label={`${title} · ${nextUE.label}`}>
          <span className="g-action-icon"><StudyIcon name={icon} size={24}/></span><strong>{title}</strong><small>{desc}</small><span className="g-action-arrow"><StudyIcon name="arrow" size={15}/></span>
        </button>)}
      </div>
      <small className="g-action-context">Matière de reprise : {nextUE.level} {nextUE.id.replace('DSCG','UE')} · {nextUE.label}. <button onClick={()=>onNav('library')}>Changer de matière</button></small>
      <section className="g-resume" aria-label="Reprendre mon parcours">
        <span className="g-resume-icon"><StudyIcon name="book" size={25}/></span><div><span className="g-eyebrow">{lastUE?'CONTINUER SUR MA LANCÉE':'MON PREMIER PAS'}</span><h3>{lastUE?lastUE.label:'Une UE à la fois, à votre rythme.'}</h3><p>{lastUE?`${lastUE.level} · ${lastUE.id.replace('DSCG','UE')} · Cours, QCM, cartes et cas`:'Choisissez les matières que vous préparez cette session.'}</p></div>
        <button className="g-icon-button" aria-label={lastUE?'Reprendre '+lastUE.label:'Choisir mes UE'} onClick={()=>lastUE?onSelect(lastUE):onNav('library')}><StudyIcon name="arrow"/></button>
      </section>

      <section className="g-subject-section" aria-labelledby="g-subject-title">
        <div className="g-section-title"><div><h2 id="g-subject-title">Mes matières</h2><p>Des parcours conçus pour vos UE.</p></div><div className="g-diploma-switch" role="group" aria-label="Diplôme à réviser">
          {['DCG','DSCG'].map(d=><button key={d} aria-pressed={level===d} onClick={()=>{setLevel(d);setMine(Boolean(plan&&plan.level===d));setExpanded(false);setQuery('');}}>{d}</button>)}
        </div></div>
        <div className="g-subject-tools"><label className="g-subject-search"><StudyIcon name="search" size={18}/><input aria-label="Rechercher une UE" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Une matière, un numéro d’UE…" type="search"/></label>
          {plan?.level===level&&<label className="g-my-ues"><input type="checkbox" checked={mine} onChange={e=>setMine(e.target.checked)}/>UE de mon planning</label>}
          <button className="g-text-button" onClick={()=>onNav('planning')}>Choisir mes UE <StudyIcon name="arrow" size={15}/></button></div>
        {learningError&&<p className="g-alert" role="alert">Le suivi par chapitre ne peut pas être chargé. {onRetry&&<button onClick={onRetry}>Réessayer</button>}</p>}
        {learningLoading&&<p className="g-metric-note" role="status">Chargement de votre suivi par chapitre…</p>}
        <div className="g-subject-grid">{subjects.map((ue,i)=>{
          const m=catalogue.modules[ue.id],progress=stats.progress[ue.id],best=user.mastery?.[ue.id];
          return <button key={ue.id} className={'g-subject g-subject-tone-'+i%6} onClick={()=>onSelect(ue)}>
            <div className="g-subject-top"><span className="g-subject-illustration"><SubjectIcon id={ue.id} size={48}/></span><span className="g-subject-code">{ue.id.replace('DSCG','UE')}<small>{ue.level}</small></span><span className="g-subject-link"><StudyIcon name="arrow" size={18}/></span></div>
            <h3>{ue.label}</h3><p>{m.chapters.length} chapitres · {m.curatedQuestionCount} QCM de notions</p>
            <div className="g-subject-progress"><span>{learningLoading?'Chargement…':learningError?'Suivi indisponible':progress.started?`${progress.started} chapitre${progress.started>1?'s':''} commencé${progress.started>1?'s':''}`:'Prêt à commencer'}</span><strong>{learningError||learningLoading?'':progress.done?progress.percent+' %':''}</strong></div>
            {!learningError&&!learningLoading&&<div className="g-progress-track" role="progressbar" aria-label={`Étapes du parcours ${ue.id}`} aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done} aria-valuetext={`${progress.done} étapes réalisées sur ${progress.total}`}><i style={{width:progress.percent+'%'}}/></div>}
            {best?.attempts>0&&Number.isFinite(best.best)&&<small className="g-qcm-best">Meilleur QCM : {best.best} %</small>}
          </button>;
        })}</div>
        {!visible.length&&<div className="g-empty"><StudyIcon name="search" size={28}/><h3>Aucune UE trouvée</h3><p>Essayez son numéro ou un autre mot.</p><button className="g-button g-button-secondary" onClick={()=>{setQuery('');setMine(false);}}>Afficher les UE du {level}</button></div>}
        {visible.length>6&&!query&&<button className="g-show-all" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>{expanded?'Réduire la liste':`Voir les ${visible.length} UE du ${level}`} <StudyIcon name="arrow" size={17}/></button>}
        <p className="g-metric-note">La barre suit les quatre étapes de chaque chapitre. Elle reste distincte des résultats aux QCM et d’une note d’examen.</p>
      </section>
      <section className="g-exam-card"><span className="g-exam-icon"><StudyIcon name="check" size={30}/></span><div><span className="g-eyebrow">PASSER DU COURS AU DOSSIER</span><h2>Un entraînement en conditions d’examen.</h2><p>Sujets originaux, documents, chronomètre et corrigé détaillé.</p></div><button className="g-button g-button-secondary" onClick={()=>onNav('exams')}>Ouvrir le mode examen <StudyIcon name="arrow" size={17}/></button></section>
    </div>

    <aside className="g-dashboard-rail" aria-label="Objectifs et bilan personnel">
      <section className="g-goal-card"><div className="g-rail-heading"><span className="g-rail-icon"><StudyIcon name="spark"/></span><h2>Mon objectif du jour</h2></div>
        <div className="g-goal-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50"/><circle cx="60" cy="60" r="50" style={{strokeDasharray:314.16,strokeDashoffset:314.16*(1-goalPercent/100)}}/></svg><div><strong>{stats.todayQuestions}<span>/{goal}</span></strong><small>questions en QCM</small></div></div>
        <p>{goalPercent===100?'Objectif atteint. Chaque effort compte !':'Un petit rendez-vous avec vos révisions.'}</p>
        <label>Mon cap<select aria-label="Objectif quotidien en questions" value={goal} onChange={e=>changeGoal(Number(e.target.value))}>{[5,10,20].map(n=><option key={n} value={n}>{n} questions par jour</option>)}</select></label>
        <small>QCM terminés et enregistrés aujourd’hui, heure de Paris.</small>{goalMessage&&<p role="status" className="g-goal-message">{goalMessage}</p>}
      </section>
      <section className="g-balance-card"><div className="g-rail-heading"><span className="g-rail-icon mint"><StudyIcon name="chart"/></span><h2>Mes petits progrès</h2></div>
        <dl><div><dt>Sessions enregistrées</dt><dd>{stats.history.length}</dd></div><div><dt>Moyenne des QCM</dt><dd>{stats.average===null?'À venir':stats.average+' %'}</dd></div><div><dt>Temps en QCM</dt><dd>{stats.minutes} min</dd></div><div><dt>Chapitres commencés</dt><dd>{learningLoading?'En cours…':learningError?'Indisponible':stats.chaptersStarted}</dd></div></dl>
        <button className="g-text-button" onClick={()=>onNav('progress')}>Voir ma progression <StudyIcon name="arrow" size={16}/></button>
      </section>
      <section className="g-tip-card"><span aria-hidden="true">✧</span><h2>Comprendre avant<br/>de mémoriser.</h2><p>Après un QCM, prenez une minute pour expliquer votre erreur avec vos propres mots.</p><button className="g-text-button" onClick={()=>onNav('review_today')}>Retrouver mes notions à revoir <StudyIcon name="arrow" size={16}/></button></section>
      <ExamCountdown key={level} defaultLevel={level}/>
    </aside>
  </div>;
}
