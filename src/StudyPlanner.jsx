import catalogue from './catalogue.json';
import {revisionPriorities,adaptiveMinutes} from '../lib/revision-priorities.mjs';
import RevisionPriorities from './RevisionPriorities';
import { useEffect, useState } from 'react';
import { buildPlan, restorePlan } from '../lib/study-plan.mjs';

export default function StudyPlanner(props) {
  return <Planner key={props.user?.uid || 'preview'} {...props} />;
}

function Planner({ ues, user, onBack,learning={} }) {
  const [weeks, setWeeks] = useState(4);
  const [level, setLevel] = useState('DCG');
  const [hours, setHours] = useState(3);
  const [selectedIds, setSelectedIds] = useState([]);
  const [plan, setPlan] = useState(null);
  const [adaptive,setAdaptive]=useState(()=>{try{return localStorage.getItem(`simdcg-plan-${user?.uid || 'preview'}-adaptive`)==='true';}catch{return false;}});
  const priorities=revisionPriorities(catalogue.modules,learning,selectedIds);
  const [message, setMessage] = useState('');
  const scheduleKey = `simdcg-plan-${user?.uid || 'preview'}`;
  const available = ues.filter(ue => ue.level === level);
  const selected = available.filter(ue => selectedIds.includes(ue.id));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(scheduleKey);
      if (!raw) return;
      const restored = restorePlan(ues, JSON.parse(raw));
      setWeeks(restored.config.weeks);
      setLevel(restored.config.level);
      setHours(restored.config.hours);
      setSelectedIds(restored.config.selectedIds);
      setPlan(restored.plan);
    } catch {
      setMessage('Le planning enregistré ne peut pas être repris. Choisissez vos UE pour en créer un nouveau.');
    }
  }, [scheduleKey, ues]);

  const change = (update) => {
    update();
    setPlan(null);
    setMessage('');
  };
  const create = (event) => {
    event.preventDefault();
    try {
      const ids = selected.map(ue => ue.id);
      const next = buildPlan(ues, weeks, level, hours, ids);
      setPlan(next);
      try {
        localStorage.setItem(scheduleKey, JSON.stringify({
          version: 2, config: { weeks, level, hours, selectedIds: ids },
        }));
        setMessage('Planning enregistré dans ce navigateur pour votre compte.');
      } catch {
        setMessage('Votre planning est prêt, mais ce navigateur ne permet pas sa sauvegarde. Gardez cette page ouverte.');
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  return <div className="page saved-study planner-page">
    <header className="page-title">
      <div><span className="eyebrow">VOTRE PARCOURS · VOTRE RYTHME</span><h1>Mon planning par UE</h1></div>
      <button className="btn btn-secondary" onClick={onBack}>← Retour</button>
    </header>
    <p><a href="/outils/planning-revision" target="_blank" rel="noopener noreferrer">Créer un calendrier daté et télécharger son PDF</a></p>
    <p>Vous préparez une seule UE, une année ou plusieurs matières ? Choisissez uniquement les épreuves que vous travaillez cette session.</p>
    <form onSubmit={create}>
      <section className="panel plan-settings" aria-label="Paramètres du planning">
        <label>Diplôme<select aria-label="Diplôme du planning" value={level} onChange={e => change(() => {
          setLevel(e.target.value); setSelectedIds([]);
        })}><option>DCG</option><option>DSCG</option></select></label>
        <label>Durée<select aria-label="Durée du planning" value={weeks} onChange={e => change(() => setWeeks(Number(e.target.value)))}>
          {Array.from({ length: 11 }, (_, i) => i + 2).map(n => <option key={n} value={n}>{n} semaines</option>)}
        </select></label>
        <label>Heures par semaine<select aria-label="Heures par semaine" value={hours} onChange={e => change(() => setHours(Number(e.target.value)))}>
          {Array.from({ length: 20 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} {n === 1 ? 'heure' : 'heures'}</option>)}
        </select></label>
      </section>
      <fieldset className="panel planner-ues">
        <legend>Les UE que je prépare</legend>
        <div className="planner-selection-tools">
          <p aria-live="polite">{selected.length} UE {selected.length > 1 ? 'sélectionnées' : 'sélectionnée'} sur {available.length}</p>
          <div><button type="button" className="btn btn-secondary" onClick={() => change(() => setSelectedIds(available.map(ue => ue.id)))}>Tout sélectionner</button>
            <button type="button" className="btn btn-secondary" onClick={() => change(() => setSelectedIds([]))}>Tout désélectionner</button></div>
        </div>
        <div className="planner-ue-grid">
          {available.map(ue => <label className="planner-ue" key={ue.id}>
            <input type="checkbox" checked={selectedIds.includes(ue.id)} onChange={e => change(() => setSelectedIds(ids =>
              e.target.checked ? [...ids, ue.id] : ids.filter(id => id !== ue.id)))} />
            <span><strong>{ue.id.replace('DSCG', 'UE')} · {ue.label}</strong><small>{ue.level}</small></span>
          </label>)}
        </div>
      </fieldset>
      <div className="planner-create">
        <p id="planner-selection-help">{selected.length
          ? `${hours} h au total chaque semaine, réparties entre vos ${selected.length} UE. Vous pourrez ajuster ce rythme selon vos difficultés.`
          : 'Sélectionnez au moins une UE pour créer votre planning.'}</p>
        <button className="btn" disabled={!selected.length} aria-describedby="planner-selection-help">Créer mon planning</button>
      </div>
    </form>
    {message && <p role="status" className="helper">{message}</p>}
<RevisionPriorities learning={learning} ids={selectedIds.length?selectedIds:available.map(ue=>ue.id)}/>{plan&&<label className="panel adaptive-toggle"><input type="checkbox" checked={adaptive} onChange={e=>{setAdaptive(e.target.checked);try{localStorage.setItem(scheduleKey+'-adaptive',String(e.target.checked));}catch{setMessage('La répartition est affichée mais ne peut pas être sauvegardée dans ce navigateur.');}}}/> Donner davantage de temps aux UE à reprendre, à durée hebdomadaire identique.</label>}
    {plan && <section className="planner-result" aria-label="Votre planning de révision">
      <h2>{level} · {selected.length} UE · {weeks} semaines</h2>
      <p>Chaque UE suit le même parcours : comprendre, s’entraîner, puis consolider. Le temps indiqué est une suggestion ; adaptez les chapitres à vos échéances.</p>
      <div className="saved-grid">{plan.map(week => <article className="panel" key={week.num}>
        <span className="eyebrow">SEMAINE {week.num} · {week.hours} H AU TOTAL</span>
        <h3>{week.task}</h3>
        <ul className="planner-sessions">{week.subjects.map((ue, i) => <li key={ue.id}>
          <span><strong>{ue.id.replace('DSCG', 'UE')}</strong> · {ue.label}</span>
          <span>{(adaptive?adaptiveMinutes(week.sessions,priorities):week.sessions)[i].minutes} min</span>
        </li>)}</ul>
      </article>)}</div>
    </section>}
  </div>;
}
