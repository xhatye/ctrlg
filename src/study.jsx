import { useEffect, useState, useRef } from "react";
import { loadStudy } from "./study-client";
import {reviewCase} from "./case-client";
import {checkCaseStep} from "../lib/case-checks.mjs";
import { ChapterSelect } from './chapter-navigation';
import LessonVisuals from './LessonVisuals';
import CaseRubric from './CaseRubric';

export function StudyNotice() {
  return (
    <p className="study-notice">
      Cours et exercices originaux · couverture partielle du programme.
      Vérifiez les règles de votre session dans les références proposées.
    </p>
  );
}
function SourceLinks({ sources = [] }) {
  return (
    sources.length > 0 && (
      <aside className="study-sources">
        <strong>Références pour approfondir</strong>
        {sources.map(([title, url]) => (
          <a key={url} href={url} target="_blank" rel="noreferrer">
            {title} ↗
          </a>
        ))}
      </aside>
    )
  );
}
function useModule(id, tool, chapter, variant) {
  const [state, setState] = useState({ loading: true, data: null, error: "" }),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    setState({ loading: true, data: null, error: "" });
    loadStudy(id, tool, {chapter,variant})
      .then((data) => {
        if (alive) setState({ loading: false, data, error: "" });
      })
      .catch((error) => {
        if (alive)
          setState({ loading: false, data: null, error: error.message });
      });
    return () => {
      alive = false;
    };
  }, [id, tool, chapter, variant, retry]);
  return { ...state, retry: () => setRetry((x) => x + 1) };
}
function Frame({ title, ue, onBack, children }) {
  return (
    <div className="page saved-study">
      <header className="page-title">
        <div>
          <span className="eyebrow">
            {ue?.level} {ue?.id} · RÉVISIONS
          </span>
          <h1>{title}</h1>
        </div>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Retour
        </button>
      </header>
      <StudyNotice />
      {children}
    </div>
  );
}
function LoadState({ loading, error, retry }) {
  return loading ? (
    <p role="status">Chargement du contenu…</p>
  ) : error ? (
    <div role="alert" className="panel">
      <p>{error}</p>
      <button className="btn" onClick={retry}>
        Réessayer
      </button>
    </div>
  ) : null;
}
export function SavedLesson({ ue, onBack, onLearning, learning={} }) {
  const [chapter,setChapter]=useState(ue.chapter || '');
  useEffect(()=>setChapter(ue.chapter || ''),[ue.id,ue.chapter]);
  const state = useModule(ue.id, "summary", chapter);
  const [saved,setSaved]=useState(''),receipt=useRef(crypto.randomUUID());
  useEffect(()=>{setSaved('');receipt.current=crypto.randomUUID();},[ue.id,chapter]);
  const markRead=async()=>{setSaved('saving');try{await onLearning?.([{id:receipt.current,module:ue.id,chapter:state.data.chapter,type:'lesson'}]);setSaved('done');}catch{setSaved('error');}};
  const read=learning.chapters?.[ue.id+'/'+state.data?.chapter]?.lessonRead;
  return (
    <Frame title={state.data?.title || ue.label} ue={ue} onBack={onBack}>
      <ChapterSelect id={ue.id} value={chapter} onChange={setChapter} disabled={saved==='saving'} />
      <LoadState {...state} />
      {state.data && (
        <>
          <article className="lesson-intro panel"><span className="eyebrow">LE POINT DE DÉPART</span><p>{state.data.intro}</p><h3>Comment travailler ce chapitre</h3><p>{state.data.method}</p></article>
          <section className="panel lesson-objectives"><h2>Ce que vous allez travailler</h2><ul>{state.data.learningGoals.map(g=><li key={g}>{g}</li>)}</ul><p className="helper">Prérequis : {state.data.prerequisites.join(' ')}</p></section>
          <LessonVisuals key={ue.id+'/'+state.data.chapter} visuals={state.data.visuals}/>
          <div className="lesson-reading-layout">
            <details className="lesson-toc" open><summary>Plan du chapitre</summary><nav aria-label="Sections du cours">{state.data.sections.map((s,i)=><a key={s.titre} href={'#lesson-section-'+(i+1)}><span>{String(i+1).padStart(2,'0')}</span>{s.titre}</a>)}</nav></details>
          <div className="lesson-sections">
            {state.data.sections.map((s, i) => (
              <article className="panel lesson-section" id={'lesson-section-'+(i+1)} key={s.titre}>
                <span className="eyebrow">REPÈRE {i + 1}</span>
                <h2>{s.titre}</h2>
                {s.points.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {s.example&&<div className="lesson-worked-example"><span className="eyebrow">EXEMPLE COMMENTÉ</span><p>{s.example.context}</p><ol>{s.example.analysis.map((point,j)=><li key={j}>{point}</li>)}</ol></div>}
              </article>
            ))}
          </div>
          </div>
          {state.data.selfChecks?.length>0&&<section className="panel lesson-self-check"><span className="eyebrow">SANS REGARDER LE COURS</span><h2>Vérifiez ce que vous pouvez expliquer</h2><p>Formulez votre réponse, puis ouvrez l’explication. Ces repères de lecture ne remplacent pas votre série de QCM.</p>{state.data.selfChecks.map((check,i)=><details key={i}><summary>{check.question}</summary><div><strong>{check.answer}</strong><p>{check.explanation}</p></div></details>)}</section>}
          <section className="panel lesson-method"><h2>Résoudre un dossier sur ce chapitre</h2><ol>{state.data.methodSteps.map((step,i)=><li key={i}>{step}</li>)}</ol></section>
          {state.data.glossary.length>0&&<section className="panel lesson-glossary"><h2>Les termes à savoir expliquer</h2><dl>{state.data.glossary.map(g=><div key={g.term}><dt>{g.term}</dt><dd>{g.definition}</dd></div>)}</dl></section>}

          <section className="panel lesson-pitfalls"><h2>Les erreurs à éviter</h2><ul>{state.data.pieges_frequents.map(p=><li key={p}>{p}</li>)}</ul></section>
          <section className="panel lesson-checklist"><h2>Avant de rendre votre copie</h2><ul>{state.data.checklist.map((check,i)=><li key={i}>{check}</li>)}</ul></section>
          <div className="panel">
            <h2>Votre méthode</h2>
            <p>
              Lisez un repère, reformulez-le sans regarder, puis testez-le dans
              le QCM. Notez ce qui reste incertain pour le reprendre dans vos
              cours.
            </p>
            <p>{state.data.conseil_exam}</p>
          </div>
          <SourceLinks sources={state.data.sources} />
          <p className="helper">Texte et exercices originaux SIMDCG.</p>
          {onLearning&&<section className="panel learning-check"><h2>Votre étape de lecture</h2><p>Marquez le chapitre après l’avoir lu et reformulé. Cette étape est déclarative ; les exercices vous permettent ensuite de vérifier votre compréhension.</p><button className="btn" disabled={saved==='saving'||saved==='done'||read} onClick={markRead}>{read||saved==='done'?'Chapitre marqué comme lu':saved==='saving'?'Enregistrement…':'Marquer ce chapitre comme lu'}</button>{saved==='error'&&<p role="alert">La progression n’a pas été enregistrée. Vous pouvez réessayer.</p>}</section>}
        </>
      )}
    </Frame>
  );
}
export function CasePractice({ ue, user, onDone, onBack, onLearning }) {
  const [chapter,setChapter]=useState(ue.chapter || ''),[variant,setVariant]=useState(0),[variantDraft,setVariantDraft]=useState('1');
  const [dossierOpen,setDossierOpen]=useState(false);
  const [mode,setMode]=useState('guided'),[responses,setResponses]=useState({}),[checked,setChecked]=useState({}),[answer,setAnswer]=useState(''),[shown,setShown]=useState(false);
  const [busy,setBusy]=useState(false),[feedback,setFeedback]=useState(null),[aiError,setAiError]=useState(''),[remaining,setRemaining]=useState(null);
  const [saving,setSaving]=useState(false),[saved,setSaved]=useState(false),[saveError,setSaveError]=useState(''),receipt=useRef(crypto.randomUUID());
  useEffect(()=>{setChapter(ue.chapter || '');setVariant(0);},[ue.id,ue.chapter]);
  const state=useModule(ue.id,'case',chapter,variant);
  useEffect(()=>{setVariantDraft(String(variant+1));setResponses({});setChecked({});setAnswer('');setShown(false);setFeedback(null);setAiError('');setSaved(false);setSaveError('');receipt.current=crypto.randomUUID();},[ue.id,chapter,variant]);
  const questions=state.data?.questions || [],completed=questions.filter(q=>checked[q.num]?.valid).length;
  const change=(num,value)=>{setResponses(old=>({...old,[num]:value}));setChecked(old=>{const next={...old};delete next[num];return next;});setSaved(false);};
  const check=q=>setChecked(old=>({...old,[q.num]:q.guide?checkCaseStep(q,responses[q.num]??''):{valid:true,correct:null,message:'Comparez les éléments attendus à votre raisonnement.'}}));
  const analyse=async()=>{
    setBusy(true);setAiError('');setFeedback(null);
    try{const data=await reviewCase({module:ue.id,chapter:state.data.chapter,variant,answer});setFeedback(data.feedback);setRemaining(data.caseDailyRemaining);}
    catch(error){setAiError(error.name==='TimeoutError'?'L’analyse prend trop de temps. Votre réponse est conservée ; le corrigé reste accessible.':error.message);}
    finally{setBusy(false);}
  };
  const record=async()=>{
    if(saving||saved)return;setSaving(true);setSaveError('');
    try{
      await onLearning?.([{id:receipt.current,type:'case',module:ue.id,chapter:state.data.chapter,variant}]);
      await onDone?.({ue:ue.id,ueName:ue.label,cas:state.data,reponse:mode==='written'?answer:questions.map(q=>q.num+'. '+(q.guide?.type==='choice'?q.guide.options[Number(responses[q.num])]:responses[q.num]??'Corrigé étudié')).join('\n'),mode:mode==='written'?'written-review':'guided-review',...(feedback?{feedback}:{})});
      setSaved(true);
    }catch{setSaveError('La progression n’a pas pu être enregistrée. Votre travail reste affiché. Réessayez.');}
    finally{setSaving(false);}
  };
  return <Frame title={state.data?.titre || 'Cas pratique'} ue={ue} onBack={onBack}>
    <ChapterSelect id={ue.id} value={chapter} disabled={saving||busy} onChange={value=>{setChapter(value);setVariant(0);setDossierOpen(false);}}/>
    <LoadState {...state}/>
    {state.data&&<>
      {state.data.variantCount>1&&<details className="panel case-dossier" open={dossierOpen} onToggle={e=>setDossierOpen(e.currentTarget.open)}><summary>Choisir un autre dossier · {variant+1} sur {state.data.variantCount.toLocaleString('fr-FR')}</summary><div className="session-controls"><label className="chapter-select">Numéro du dossier<input aria-label="Dossier d’entraînement" type="number" min="1" max={state.data.variantCount} value={variantDraft} disabled={busy||saving} onChange={e=>setVariantDraft(e.target.value)}/></label><button className="btn" disabled={busy||saving||!Number.isInteger(Number(variantDraft))||Number(variantDraft)<1||Number(variantDraft)>state.data.variantCount} onClick={()=>setVariant(Number(variantDraft)-1)}>Ouvrir le dossier</button><button className="btn btn-secondary" disabled={busy||saving||variant===0} onClick={()=>setVariant(v=>v-1)}>Précédent</button><button className="btn btn-secondary" disabled={busy||saving||variant+1>=state.data.variantCount} onClick={()=>setVariant(v=>v+1)}>Suivant</button><p className="helper">Un nouveau dossier remet vos réponses à zéro.</p></div></details>}
      <div className="case-modes" role="group" aria-label="Mode du cas"><button aria-pressed={mode==='guided'} disabled={busy||saving} onClick={()=>setMode('guided')}>Exercice guidé<span>Une question, une vérification, une explication.</span></button><button aria-pressed={mode==='written'} disabled={busy||saving} onClick={()=>setMode('written')}>Réponse écrite + retour IA<span>Facultatif · jusqu’à 5 demandes/jour · 60/mois.</span></button></div>
      <article className="panel case-context"><span className="eyebrow">LE DOSSIER · {state.data.duree_estimee}</span><p>{state.data.contexte}</p></article>
      {mode==='guided'?<>
        <div className="case-step-progress"><strong>{completed}/{questions.length} étapes travaillées</strong><div className="progress-track"><i style={{width:(completed/questions.length*100)+'%'}}/></div><span className="helper">Le suivi enregistre votre travail. Il ne constitue pas une note d’examen.</span></div>
        <div className="case-steps">{questions.map(q=>{const result=checked[q.num];return <article className="panel case-step" key={q.num}>
          <span className="eyebrow">ÉTAPE {q.num}</span><h2>{q.enonce}</h2>
          {q.guide?.type==='number'?<label className="study-answer">Votre résultat ({q.guide.unit || 'sans unité'})<input inputMode="decimal" aria-label={'Résultat de l’étape '+q.num} value={responses[q.num]??''} onChange={e=>change(q.num,e.target.value)} placeholder="Exemple : 1 250,50"/></label>:q.guide?.type==='choice'?<fieldset className="case-choices"><legend>Choisissez le raisonnement adapté au dossier.</legend>{q.guide.options.map((option,i)=><label key={i}><input type="radio" name={'case-step-'+q.num} checked={responses[q.num]===String(i)} onChange={()=>change(q.num,String(i))}/><span>{option}</span></label>)}</fieldset>:<p>Préparez les faits utiles et votre conclusion, puis ouvrez les éléments attendus pour vérifier vos étapes.</p>}
          <button className="btn btn-secondary" onClick={()=>check(q)}>{q.guide?'Vérifier cette étape':'Étudier le corrigé de cette étape'}</button>
          {result&&<div className={'case-feedback '+(result.correct===false?'needs-review':'')} role="status"><strong>{result.message}</strong>{result.valid&&<><h3>Raisonnement attendu</h3><p>{q.answer}</p><CaseRubric key={state.data.chapter+'/'+variant+'/'+q.num} question={q}/></>}</div>}
        </article>})}</div>
        <button className="btn" disabled={completed!==questions.length||saving||saved} onClick={record}>{saved?'Cas enregistré dans votre parcours':saving?'Enregistrement…':'Terminer et enregistrer ce cas'}</button>
      </>:<>
        <section className="panel"><h2>Votre raisonnement, question par question</h2><ol>{questions.map(q=><li key={q.num}>{q.enonce}</li>)}</ol><p className="helper">Le retour IA compare votre réponse au corrigé du dossier. Vérifiez ses remarques ; il ne remplace pas une correction par un enseignant. Votre réponse est envoyée à Groq pour cette analyse. Elle utilise aussi votre quota et budget de tuteur.</p><label className="study-answer">Votre réponse<textarea aria-label="Votre réponse" rows={9} maxLength={6000} disabled={busy} value={answer} onChange={e=>{setAnswer(e.target.value);setFeedback(null);setSaved(false);}} placeholder="Question 1 : faits utiles, méthode, application et conclusion…"/></label><div className="written-case-actions"><button className="btn" disabled={busy||answer.trim().length<40||remaining===0} onClick={analyse}>{busy?'Analyse de votre réponse…':'Obtenir un retour IA'}</button><button className="btn btn-secondary" onClick={()=>setShown(true)}>Voir le corrigé sans IA</button></div><p className="helper">{answer.length}/6 000 caractères · minimum 40 pour l’analyse.{remaining!==null?' '+remaining+' analyse(s) encore disponibles aujourd’hui.':''}</p>{aiError&&<p role="alert" className="message error">{aiError}</p>}</section>
        {feedback&&<section className="panel written-case-feedback" aria-live="polite"><h2>Retour sur votre réponse écrite</h2>{[['strengths','Ce qui est étayé'],['improvements','Ce qui est à reprendre'],['nextSteps','Votre prochaine étape']].map(([key,title])=><div key={key}><h3>{title}</h3><ul>{feedback[key].map((item,i)=><li key={i}>{item}</li>)}</ul></div>)}<button className="btn" disabled={saving||saved} onClick={record}>{saved?'Cas enregistré':saving?'Enregistrement…':'Enregistrer ce travail'}</button></section>}
        {shown&&<section className="panel"><h2>Corrigé du dossier</h2>{questions.map(q=><div key={q.num}><h3>Question {q.num}</h3><p>{q.answer}</p><CaseRubric question={q}/></div>)}<button className="btn" disabled={saving||saved||!answer.trim()} onClick={record}>{saved?'Cas enregistré':saving?'Enregistrement…':'Enregistrer ce travail'}</button></section>}
      </>}
      {saveError&&<p role="alert" className="message error">{saveError}</p>}
      <SourceLinks sources={state.data.sources}/>
    </>}
  </Frame>;
}

export { buildPlan } from '../lib/study-plan.mjs';
export { default as StudyPlanner } from './StudyPlanner';
export function OralSetup({ onStart, onBack }) {
  const [topic, setTopic] = useState("Comptabilité");
  return (
    <Frame title="Préparer l’oral par écrit" onBack={onBack}>
      <section className="panel">
        <p>
          Un exercice de départ, trois questions et des éléments de réponse pour
          vous comparer, sans notation automatique.
        </p>
        <label className="study-answer">
          Thématique
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {Object.keys(topicModule).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <button
          className="btn"
          onClick={() => onStart({ topic, role: "Entraînement autonome" })}
        >
          Commencer l’entraînement
        </button>
      </section>
    </Frame>
  );
}
const topicModule = {
  "Contrôle de gestion": "DSCG3",
  "Finance d'entreprise": "UE6",
  Comptabilité: "UE9",
  Management: "UE7",
  Fiscalité: "UE4",
  "Général DCG/DSCG": "UE9",
};
export function OralPractice({ cfg, onDone, onBack }) {
  const state = useModule(topicModule[cfg.topic] || "UE9", "case"),
    [answer, setAnswer] = useState(""),
    [revealed, setRevealed] = useState(false);
  return (
    <Frame title="Préparer sa réponse par écrit" onBack={onBack}>
      <p>
        Entraînement par écrit : préparez votre raisonnement par
        écrit, puis comparez avec les éléments attendus. Aucun micro ni analyse de votre voix.
      </p>
      <LoadState {...state} />
      {state.data && (
        <>
          <article className="panel">
            <h2>{cfg.topic}</h2>
            <p>{state.data.contexte}</p>
            {state.data.questions.map((q) => (
              <p key={q.num}>
                {q.num}. {q.enonce}
              </p>
            ))}
          </article>
          <label className="study-answer">
            Vos notes
            <textarea
              rows={7}
              maxLength={12000}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </label>
          <button
            className="btn"
            disabled={!answer.trim()}
            onClick={() => setRevealed(true)}
          >
            Voir les éléments attendus
          </button>
          {revealed && (
            <section className="panel">
              <h2>Points de comparaison</h2>
              {state.data.questions.map((q) => (
                <p key={q.num}>
                  <strong>{q.num}. </strong>
                  {q.answer}
                </p>
              ))}
              <p>
                Vérifiez la clarté de votre introduction, les étapes et la
                conclusion. Le niveau du poste ne modifie pas cet exercice de
                départ.
              </p>
              <button
                className="btn"
                onClick={() =>
                  onDone({
                    topic: cfg.topic,
                    role: cfg.role,
                    mode: "self-review",
                    reponse: answer,
                    expected: state.data.questions.map((q) => q.answer),
                  })
                }
              >
                Terminer l’entraînement
              </button>
            </section>
          )}
        </>
      )}
    </Frame>
  );
}
export function OralSummary({ data, onBack }) {
  return (
    <Frame title="Votre entraînement écrit" onBack={onBack}>
      <section className="panel">
        <h2>{data.topic}</h2>
        <p>Aucun score n’a été attribué à cette comparaison autonome.</p>
        <h3>Vos notes</h3>
        <p className="preserve-lines">{data.reponse}</p>
        <h3>Éléments attendus</h3>
        {data.expected?.map((x, i) => (
          <p key={i}>{x}</p>
        ))}
      </section>
    </Frame>
  );
}
