import { useEffect, useState } from "react";
import { loadStudy } from "./study-client";

export function StudyNotice() {
  return (
    <p className="study-notice">
      Parcours de départ · exercices originaux · couverture partielle du
      programme. Aucun appel IA pour ces révisions.
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
function useModule(id, tool) {
  const [state, setState] = useState({ loading: true, data: null, error: "" }),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    setState({ loading: true, data: null, error: "" });
    loadStudy(id, tool)
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
  }, [id, tool, retry]);
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
export function SavedLesson({ ue, onBack }) {
  const state = useModule(ue.id, "summary");
  return (
    <Frame title={state.data?.title || ue.label} ue={ue} onBack={onBack}>
      <LoadState {...state} />
      {state.data && (
        <>
          <div className="saved-grid">
            {state.data.sections.map((s, i) => (
              <article className="panel" key={s.titre}>
                <span className="eyebrow">REPÈRE {i + 1}</span>
                <h2>{s.titre}</h2>
                {s.points.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </article>
            ))}
          </div>
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
        </>
      )}
    </Frame>
  );
}
export function CasePractice({ ue, user, onDone, onBack }) {
  const state = useModule(ue.id, "case"),
    [answer, setAnswer] = useState(""),
    [shown, setShown] = useState(false),
    [saving, setSaving] = useState(false),
    [saved, setSaved] = useState(false),
    [saveError, setSaveError] = useState("");
  useEffect(() => {
    setAnswer("");
    setShown(false);
    setSaved(false);
  }, [ue.id]);
  const record = async () => {
    if (saving || saved) return;
    setSaving(true);
    setSaveError("");
    try {
      await onDone({
        ue: ue.id,
        ueName: ue.label,
        cas: state.data,
        reponse: answer,
        mode: "self-review",
      });
      setSaved(true);
    } catch {
      setSaveError(
        "Votre réponse reste affichée. L’enregistrement a échoué, réessayez.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <Frame title={state.data?.titre || "Cas pratique"} ue={ue} onBack={onBack}>
      <LoadState {...state} />
      {state.data && (
        <>
          <article className="panel">
            <span className="eyebrow">
              EXERCICE ORIGINAL · {state.data.duree_estimee}
            </span>
            <p>{state.data.contexte}</p>
            {state.data.questions.map((q) => (
              <p key={q.num}>
                <strong>{q.num}. </strong>
                {q.enonce}
              </p>
            ))}
          </article>
          <label className="study-answer">
            Votre réponse
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={9}
              maxLength={12000}
              placeholder="Posez les hypothèses, détaillez le raisonnement puis concluez."
            />
          </label>
          <button
            className="btn"
            onClick={() => setShown(true)}
            disabled={!answer.trim()}
          >
            Comparer avec le corrigé
          </button>
          {shown && (
            <section className="panel" aria-live="polite">
              <h2>Corrigé à comparer avec votre réponse</h2>
              <p>
                Aucune note automatique : vérifiez vos étapes et vos calculs.
              </p>
              {state.data.questions.map((q) => (
                <div key={q.num}>
                  <h3>Question {q.num}</h3>
                  <p>{q.answer}</p>
                </div>
              ))}
              {onDone && (
                <button
                  className="btn"
                  disabled={saving || saved}
                  onClick={record}
                >
                  {saved
                    ? "Réponse enregistrée"
                    : saving
                      ? "Enregistrement…"
                      : "Enregistrer dans mon historique"}
                </button>
              )}
              {saveError && <p role="alert">{saveError}</p>}
            </section>
          )}
          <SourceLinks sources={state.data.sources} />
        </>
      )}
    </Frame>
  );
}

export function buildPlan(ues, weeks, level, hours) {
  const selected = ues.filter((x) => x.level === level);
  if (
    !selected.length ||
    !Number.isInteger(weeks) ||
    weeks < 2 ||
    weeks > 12 ||
    !Number.isFinite(hours) ||
    hours < 1 ||
    hours > 20
  )
    throw new Error("Paramètres de planning invalides.");
  const stages = [
    "Lire les repères et reformuler les notions.",
    "Tester les notions avec les QCM et expliquer les erreurs.",
    "Revoir les cartes difficiles puis travailler le cas pratique.",
  ];
  const count = Math.max(1, Math.ceil(selected.length / weeks));
  return Array.from({ length: weeks }, (_, i) => ({
    num: i + 1,
    subjects: Array.from(
      { length: count },
      (_, j) => selected[(i * count + j) % selected.length],
    ),
    task: stages[Math.min(2, Math.floor((i * 3) / weeks))],
    hours,
  }));
}
export function StudyPlanner({ ues, user, onBack }) {
  const [weeks, setWeeks] = useState(4),
    [level, setLevel] = useState("DCG"),
    [hours, setHours] = useState(3),
    [plan, setPlan] = useState(null);
  const scheduleKey = `simdcg-plan-${user?.uid || "preview"}`;
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(scheduleKey));
      if (
        Array.isArray(saved) &&
        saved.length <= 12 &&
        saved.every(
          (x) =>
            Array.isArray(x.subjects) &&
            x.subjects.every((y) => ues.some((u) => u.id === y.id)),
        )
      )
        setPlan(saved);
    } catch {}
  }, [scheduleKey, ues]);
  const create = () => {
    const next = buildPlan(ues, weeks, level, hours);
    setPlan(next);
    try {
      localStorage.setItem(scheduleKey, JSON.stringify(next));
    } catch {}
  };
  return (
    <Frame title="Un rythme de révision réaliste" onBack={onBack}>
      <p>
        Un planning simple, calculé sans IA. Il répartit les matières ;
        adaptez-le à vos échéances et aux chapitres de votre cours.
      </p>
      <section className="panel plan-settings">
        <label>
          Diplôme
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option>DCG</option>
            <option>DSCG</option>
          </select>
        </label>
        <label>
          Durée
          <select
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
          >
            {[2, 4, 6, 8, 10, 12].map((x) => (
              <option key={x} value={x}>
                {x} semaines
              </option>
            ))}
          </select>
        </label>
        <label>
          Heures par semaine
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          >
            {[2, 3, 5, 8, 10].map((x) => (
              <option key={x} value={x}>
                {x} heures
              </option>
            ))}
          </select>
        </label>
        <button className="btn" onClick={create}>
          Créer mon planning
        </button>
      </section>
      {plan && (
        <>
          <p className="helper">
            Enregistré dans ce navigateur pour votre compte. Ce planning ne
            garantit pas la couverture de tout le programme.
          </p>
          <div className="saved-grid">
            {plan.map((p) => (
              <article className="panel" key={p.num}>
                <span className="eyebrow">
                  SEMAINE {p.num} · {p.hours} H
                </span>
                <h2>
                  {p.subjects.map((x) => x.id + " · " + x.label).join(" / ")}
                </h2>
                <p>{p.task}</p>
                <p>
                  Complétez avec les chapitres et annales prévus par votre
                  formation.
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </Frame>
  );
}
export function OralSetup({ onStart, onBack }) {
  const [topic, setTopic] = useState("Comptabilité");
  return (
    <Frame title="Préparer un raisonnement à l’oral" onBack={onBack}>
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
    <Frame title="Préparer une réponse à l’oral" onBack={onBack}>
      <p>
        Entraînement autonome : exposez votre raisonnement à voix haute ou par
        écrit, puis comparez avec les éléments attendus. Aucune notation IA.
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
    <Frame title="Votre entraînement oral" onBack={onBack}>
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
