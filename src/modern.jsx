import {RefinedLanding,RefinedFeatures} from './RefinedPublic';
import './refined-ui.css';
import GizmoDashboard from './GizmoDashboard';
import PlayfulHeading from './PlayfulHeading';
import { GizmoShell } from './gizmo-ui';
import SubjectIcon from './SubjectIcon';
import { useState, useEffect, useRef } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "./firebase";
import ExamCountdown from "./ExamCountdown";
import { ChapterLibrary } from './chapter-navigation';
import { curriculumFor } from '../lib/curriculum.mjs';
import catalogue from './catalogue.json';
import ProgressJourney from './ProgressJourney';
import './landing-motion.css';
import './pricing.css';
import { publicSubjectPath } from '../lib/public-study-pages.mjs';

const paths = {
  home: "M3 10 12 3l9 7v10H3z M9 20v-7h6v7",
  book: "M12 5v15 M3 4h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v15h-5a4 4 0 0 0-4 1 4 4 0 0 0-4-1H3z",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z",
  chart: "M4 4v16h16 M8 16v-4 M12 16V8 M16 16V5",
  calendar: "M4 6h16v14H4z M4 10h16 M8 3v5 M16 3v5",
  check: "m5 12 4 4L19 6",
  cards: "M5 7h14v14H5z M8 3h13v14",
  user: "M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0 M4 21v-2a8 8 0 0 1 16 0v2",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 m5 12 6 6",
  lock: "M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l4 2",
};
export function Icon({ name = "spark", size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.spark} />
    </svg>
  );
}
export function Brand({ onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className="brand" onClick={onClick} aria-label="SIMDCG">
      <img className="brand-mark" src="/brand-mark.svg?v=3" alt="" width="42" height="42" />
      <span>
        SIM<span className="brand-light">DCG</span>
        <small>LES RÉVISIONS DCG ET DSCG</small>
      </span>
    </Tag>
  );
}
const Button = ({ children, onClick, secondary, ...rest }) => (
  <button
    className={`btn ${secondary ? "btn-secondary" : ""}`}
    onClick={onClick}
    {...rest}
  >
    {children}
  </button>
);
function PublicNav({ onNav, onAuth }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = event => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuRef.current?.querySelector('.menu-button')?.focus();
      } else if (event.type === 'pointerdown' && !menuRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('keydown', dismiss);
    document.addEventListener('pointerdown', dismiss);
    return () => {
      document.removeEventListener('keydown', dismiss);
      document.removeEventListener('pointerdown', dismiss);
    };
  }, [open]);
  return (
    <header className="public-nav" ref={menuRef}>
      <div className="container nav-row">
        <a className="public-brand-home" href="/" aria-label="SIMDCG, accueil"><Brand /></a>
        <button
          className="menu-button"
          aria-expanded={open}
          aria-controls="public-navigation"
          aria-label={open ? "Fermer la navigation" : "Ouvrir la navigation"}
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
        <nav
          id="public-navigation"
          className={open ? "public-links is-open" : "public-links"}
          aria-label="Navigation principale"
        >
          {[
            ["features", "La méthode"],
            ["dcg", "DCG"],
            ["dscg", "DSCG"],
            ["pricing", "Tarifs"],
          ].map(([key, label]) => (
            <a
              key={key}
              href={{features:'/fonctionnalites',dcg:'/dcg',dscg:'/dscg',pricing:'/tarifs'}[key]}
            >
              {label}
            </a>
          ))}
          <button onClick={() => (onAuth ? onAuth("login") : onNav("auth", {authMode:"login"}))}>
            Connexion
          </button>
          <Button onClick={() => (onAuth ? onAuth("signup") : onNav("auth", {authMode:"signup"}))}>
            Créer mon compte
          </Button>
        </nav>
      </div>
    </header>
  );
}
function PublicFooter({ onNav }) {
  return (
    <footer className="public-footer container">
      <Brand onClick={() => onNav("landing")} />
      <div>
        <a href="/sources">Sources officielles</a><a href="/annales">Annales</a><a href="/guides">Guides de révision</a>
        {[
          ["resources", "Ressources"],
          ["support", "Contact"],
          ["cgu", "Conditions"],
          ["confidentialite", "Confidentialité"],
        ].map(([key, label]) => (
          <a key={key} href={{resources:'/ressources',support:'/contact',cgu:'/cgu',confidentialite:'/confidentialite'}[key]}>
            {label}
          </a>
        ))}
      </div>
      <small>© {new Date().getFullYear()} SIMDCG</small>
    </footer>
  );
}
const features = [
  [
    "book",
    "Comprendre, vraiment.",
    "Des fiches structurées pour clarifier les notions et retrouver l’essentiel de chaque matière.",
    "Fiches de cours",
  ],
  [
    "cards",
    "Retenir dans la durée.",
    "Des flashcards et une reprise des cartes difficiles pour travailler vos points de blocage.",
    "Flashcards",
  ],
  [
    "check",
    "S’entraîner pour progresser.",
    "Des QCM expliqués et des cas avec corrigés enregistrés, disponibles sans IA.",
    "QCM & cas pratiques",
  ],
  [
    "spark",
    "Débloquer une notion.",
    "Un tuteur IA en complément, avec une limite de 20 demandes par jour et 300 par mois.",
    "Tuteur IA",
  ],
];
const faq = [
  [
    "Peut-on essayer les exercices avant de s’abonner ?",
    "Il n’y a pas d’essai gratuit. Les titres des chapitres et les volumes de la bibliothèque sont consultables avant l’achat. Les cours, QCM, flashcards, cas corrigés et le tuteur nécessitent un accès Pro actif ou un Pack Examen.",
  ],
  [
    "Les exercices sont-ils des annales officielles ?",
    "Les QCM et cas SIMDCG sont originaux. L’espace Annales propose séparément des PDF de sujets d’examen de l’État, avec leur source et un chronomètre. Il ne fournit pas de corrigés réservés aux enseignants.",
  ],
  [
    "Quelles matières sont couvertes ?",
    "La bibliothèque propose des contenus dans les 13 matières obligatoires du DCG et les 7 du DSCG. Les chapitres restent une couverture partielle des programmes, avec une liste consultable avant l’achat.",
  ],
  [
    "Que faire si j’ai payé mais que mon compte reste gratuit ?",
    "Connectez-vous au compte utilisé lors de l’achat, puis ouvrez Mon compte et cliquez sur « Retrouver mon achat ». Si la recherche échoue, contactez contact.simdcg@gmail.com avec votre référence de paiement.",
  ],
];
function FAQ() {
  return (
    <section className="container section faq">
      <div>
        <span className="eyebrow">EN TOUTE CLARTÉ</span>
        <h2>
          Vos questions,
          <br />
          nos réponses.
        </h2>
        <p>Un doute ? Nous sommes là pour vous aider.</p>
        <a href="mailto:contact.simdcg@gmail.com">
          Contacter le support
        </a>
      </div>
      <div>
        {faq.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <span>+</span>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
function PreviewCard() {
  return (
    <div
      className="hero-preview"
      aria-label="Aperçu illustratif du tableau de bord"
    >
      <div className="preview-top">
        <img className="brand-mark" src="/brand-mark.svg?v=3" alt="" width="28" height="28" />
        <span>
          Mon espace de révision<small>Aperçu illustratif</small>
        </span>
        <span className="preview-avatar">JD</span>
      </div>
      <div className="preview-body">
        <div className="preview-title">
          <span>VOTRE PROCHAINE ÉTAPE</span>
          <h3>On avance, une notion à la fois.</h3>
        </div>
        <div className="preview-task">
          <div className="icon-tile gold">
            <Icon name="book" />
          </div>
          <div>
            <small>DCG · UE9</small>
            <strong>Les amortissements</strong>
            <span>Comprendre · s’entraîner · retenir</span>
          </div>

        </div>
        <div className="preview-mini-grid">
          <div>
            <Icon name="check" />
            <strong>QCM expliqués</strong>
            <small>Comprendre chaque réponse</small>
          </div>
          <div>
            <Icon name="cards" />
            <strong>Flashcards</strong>
            <small>Les notions essentielles</small>
          </div>
        </div>
        <div className="preview-chart">
          <span>UN RYTHME QUI VOUS RESSEMBLE</span>
          <div>
            {[27, 45, 34, 61, 50, 77, 86].map((h, i) => (
              <div key={i}>
                <i style={{ height: h }} />
                <small>{["L", "M", "M", "J", "V", "S", "D"][i]}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="floating-note">
        <span>✦</span>
        <div>
          Votre déclic du jour.<small>Un concept devient plus clair.</small>
        </div>
      </div>
    </div>
  );
}
export function Marketing({onAuth,onNav,ues}) {
 return <RefinedLanding Nav={PublicNav} Footer={PublicFooter} Faq={FAQ} onNav={onNav} onAuth={onAuth} ues={ues}/>;
}

export function ProductShell(props) { return <GizmoShell {...props}/>; }
export function LegacyProductShell({ children, screen, user, onNav, onLogout, variant }) {
  const [open, setOpen] = useState(false);
  if (variant === "gizmo") return <GizmoShell screen={screen} user={user} onNav={onNav} onLogout={onLogout}>{children}</GizmoShell>;
  const links = [
    ["dashboard", "home", "Mon espace"],
    ["library", "book", "Mes matières"],
    ["review_today", "clock", "À revoir aujourd’hui"],
    ["exams", "check", "Mes examens"],
    ["planning", "calendar", "Mon planning"],
    ["tutor", "spark", "Tuteur IA"],
    ["interview_config", "user", "Préparer l’oral par écrit"],
    ["progress", "chart", "Ma progression"],
    ["history", "clock", "Historique"],
    ["account", "user", "Mon compte"],
  ];
  return (
    <div className="workspace">
      <aside className={open ? "sidebar sidebar-open" : "sidebar"}>
        <Brand onClick={() => onNav("dashboard")} />
        <span className="sidebar-label">VOTRE PARCOURS</span>
        <nav aria-label="Navigation de l’espace étudiant">
          {links.map(([key, icon, label]) => (
            <button
              key={key}
              className={
                screen === key ||
                (key === "library" &&
                  [
                    "subject_hub",
                    "qcm",
                    "flashcards",
                    "resume_cours",
                    "cas_pratique",
                  ].includes(screen))
                  ? "active"
                  : ""
              }
              onClick={() => {
                onNav(key);
                setOpen(false);
              }}
            >
              <Icon name={icon} />
              {label}
              {key === "tutor" && <small>IA</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <Icon name="spark" />
            <strong>Un peu chaque jour.</strong>
            <p>
              Une notion comprise aujourd’hui, une hésitation en moins demain.
            </p>
          </div>
          {!user.isPro && (
            <Button onClick={() => onNav("pricing")}>
              Découvrir Pro
            </Button>
          )}
          <button className="logout" onClick={()=>onNav('feedback')}>Partager mon retour</button>
          <button className="logout" onClick={onLogout}>
            Se déconnecter
          </button>
        </div>
      </aside>
      <div className="workspace-column">
        <header className="workspace-header">
          <button
            className="menu-button"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
          <span>
            Votre espace de révision{" "}
            <span className="breadcrumb">
              / {links.find(([key]) => key === screen)?.[2] || "Entraînement"}
            </span>
          </span>
          <div>
            <button
              className="search-shortcut"
              onClick={() => onNav("library")}
            >
              <Icon name="search" size={16} />
              <span>Rechercher une matière</span>
            </button>
            <button className="plan-pill" onClick={() => onNav("account")}>
              {user.isPro ? "✦ Pro" : "Sans abonnement"}
            </button>
            <button
              className="avatar"
              aria-label="Mon compte"
              onClick={() => onNav("account")}
            >
              {user.name?.slice(0, 2).toUpperCase()}
            </button>
          </div>
        </header>
        <main className="workspace-main">{children}</main>
        <nav className="mobile-bottom" aria-label="Accès rapides">
          {links.slice(0, 4).map(([key, icon, label]) => (
            <button
              key={key}
              className={key === screen ? "active" : ""}
              onClick={() => onNav(key)}
            >
              <Icon name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
function Title({ eyebrow, title, desc, children, playful=false }) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        {playful?<PlayfulHeading key={title} as="h1" text={title}/>:<h1>{title}</h1>}
        {desc && <p>{desc}</p>}
      </div>
      {children}
    </div>
  );
}
function UECard({ ue, mastery, onClick, reveal=false, order=0 }) {
  return (
    <button className="ue-card" onClick={onClick} style={reveal?{'--heading-delay':Math.min(order,5)*35+'ms'}:undefined}>
      <div className="ue-card-top">
        <SubjectIcon id={ue.id} size={60}/>
        <span className="ue-code">
          {ue.id.replace("DSCG", "UE")}
          <small>{ue.level}</small>
        </span>

      </div>
      {reveal?<PlayfulHeading as="h3" text={ue.label}/>:<h3>{ue.label}</h3>}
      <p>{ue.desc}</p>
      <span className="ue-content-count">{catalogue.modules[ue.id]?.chapters.length} cours · {catalogue.modules[ue.id]?.curatedQuestionCount} QCM de notions</span>
      {mastery?.attempts > 0 && <div className="ue-mastery">
        <span>
          {mastery?.attempts
            ? `${mastery.attempts} session${mastery.attempts > 1 ? "s" : ""} · meilleur QCM`
            : "Votre prochain déclic vous attend"}
        </span>
        {mastery?.attempts && <strong>{mastery.best}%</strong>}
      </div>}
      {mastery?.attempts > 0 && <div className="progress-track">
        <i style={{ width: `${mastery?.best || 0}%`, background: ue.color }} />
      </div>}
    </button>
  );
}
export function StudentHome(props) { return <GizmoDashboard {...props}/>; }
export function LegacyStudentHome({ user, ues, onNav, onSelect }) {
  const [level, setLevel] = useState("DCG");
  const history = user.history || [],
    mastery = user.mastery || {};
  const qcms = history.filter((h) => h.type === "qcm"),
    last = history.at(-1);
  const next =
    ues.find((ue) => ue.id === last?.ue) || ues.find((ue) => ue.id === "UE9");
  const avg = qcms.length
    ? Math.round(
        qcms.reduce((s, h) => s + (h.score / Math.max(h.total, 1)) * 100, 0) /
          qcms.length,
      )
    : null;
  const sessions = qcms.reduce((s, h) => s + (h.duration || 0), 0);
  return (
    <div className="page">
      <Title
        eyebrow="ON AVANCE ENSEMBLE"
        title={`Bonjour ${user.name?.split(" ")[0] || "vous"} 👋`}
        desc="Une matière, une notion, un déclic. Quelle sera votre prochaine étape ?"
      >
        <span className="streak-pill">
          ✦ {user.streak || 0} jour{user.streak !== 1 ? "s" : ""} de série
        </span>
      </Title>
      <div className="dashboard-top">
        <section className="next-session">
          <span className="eyebrow">VOTRE PROCHAINE RÉVISION</span>
          <h2>{next.label}</h2>
          <p>
            {next.level} · {next.id}
            <br />
            Comprenez les notions, puis testez vos acquis.
          </p>
          <div>
            <Button onClick={() => onSelect(next)}>
              {last ? "Reprendre ma matière" : "Commencer ma révision"}

            </Button>
            <span>
              <Icon name="clock" size={16} /> À votre rythme
            </span>
          </div>
          <div className="session-decoration" aria-hidden="true">
            <Icon name="book" size={74} />
            <span>✦</span>
            <small>{next.id}</small>
          </div>
        </section>
        <section className="daily-focus panel">
          <div className="panel-heading">
            <span className="icon-tile gold">
              <Icon name="spark" />
            </span>
            <h3>Votre cap du jour</h3>
          </div>
          <p>
            Pas besoin de tout revoir.
            <br />
            Choisissez une notion à éclaircir.
          </p>
          <ol>
            <li>
              <span>1</span>Une fiche pour comprendre
            </li>
            <li>
              <span>2</span>Un QCM pour vous tester
            </li>
            <li>
              <span>3</span>Vos cartes difficiles à revoir
            </li>
          </ol>
          <button className="text-button" onClick={() => onNav("review_today")}>À revoir aujourd’hui </button>
          <button className="text-button" onClick={() => onNav("exams")}>Travailler un sujet d’examen </button>
        </section>
      </div>
      <ExamCountdown defaultLevel={next.level} />
      <div className="metric-grid">
        {[
          [
            "check",
            history.length,
            "Sessions terminées",
            "Toutes vos activités",
          ],
          [
            "chart",
            avg === null ? "·" : `${avg}%`,
            "Moyenne des QCM",
            qcms.length
              ? "Sur vos résultats enregistrés"
              : "Votre premier QCM vous attend",
          ],
          [
            "clock",
            `${Math.round(sessions / 60)} min`,
            "Temps en QCM",
            "Sessions terminées uniquement",
          ],
          [
            "book",
            Object.keys(mastery).length,
            "Matières travaillées",
            "Un parcours qui prend forme",
          ],
        ].map(([icon, value, label, desc]) => (
          <article className="metric" key={label}>
            <span className="metric-icon">
              <Icon name={icon} />
            </span>
            <strong>{value}</strong>
            <h3>{label}</h3>
            <small>{desc}</small>
          </article>
        ))}
      </div>
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">APPRENDRE · PRATIQUER · RETENIR</span>
          <h2>Vos matières, au même endroit.</h2>
        </div>
        <div className="tabs">
          {["DCG", "DSCG"].map((x) => (
            <button
              key={x}
              className={x === level ? "active" : ""}
              onClick={() => setLevel(x)}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
      <div className="ue-grid">
        {ues
          .filter((ue) => ue.level === level)
          .map((ue) => (
            <UECard
              key={ue.id}
              ue={ue}
              mastery={mastery[ue.id]}
              onClick={() => onSelect(ue)}
            />
          ))}
      </div>
      <section className="bottom-note">
        <Icon name="spark" />
        <div>
          <strong>Un concept qui résiste ? Parlons-en.</strong>
          <p>
            Demandez au tuteur IA un exemple concret ou une explication pas à
            pas.
          </p>
        </div>
        <Button
          secondary
          onClick={() => onNav(user.isPro ? "tutor" : "pricing")}
        >
          Ouvrir le tuteur
        </Button>
      </section>
    </div>
  );
}
export function LibraryPage({ ues, user, onSelect }) {
  const [programme,setProgramme]=useState('2027');
  ues=curriculumFor(programme);
  const [query, setQuery] = useState(""),
    [level, setLevel] = useState("DCG");
  const visible = ues.filter(
    (ue) =>
      ue.level === level &&
      `${ue.label} ${ue.id} ${ue.desc}`
        .toLocaleLowerCase("fr")
        .includes(query.toLocaleLowerCase("fr")),
  );
  return (
    <div className="page library-page">
      <Title playful title="Mes UE" desc="Choisissez la matière que vous préparez." />
      <label className="chapter-select programme-select">Programme<select aria-label="Programme" value={programme} onChange={e=>setProgramme(e.target.value)}><option value="2027">Session 2027, nouveaux intitulés</option><option value="2026">Session 2026</option></select></label>
      <div className="library-toolbar">
        <div className="tabs">
          {["DCG", "DSCG"].map((x) => (
            <button
              key={x}
              className={x === level ? "active" : ""}
              onClick={() => setLevel(x)}
            >
              {x}
            </button>
          ))}
        </div>
        <label className="search-input">
          <Icon name="search" />
          <input
            aria-label="Rechercher une matière"
            placeholder="Comptabilité, UE4, fiscalité…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="ue-grid">
        {visible.map((ue,index) => (
          <UECard
            key={ue.id}
            ue={ue}
            reveal order={index}
            mastery={user?.mastery?.[ue.id]}
            onClick={() => onSelect(ue)}
          />
        ))}
      </div>
      {!visible.length && (
        <div className="empty-state">
          <Icon name="search" size={32} />
          <h3>Aucune matière trouvée</h3>
          <p>Essayez un autre mot ou une autre unité d’enseignement.</p>
        </div>
      )}
      <p className="helper">
        {ues.filter((ue) => ue.level === level).length} matières disponibles en{" "}
        {level}. Les chapitres couvrent une partie du programme.
      </p>
    </div>
  );
}
export function CourseHome({ ue, user, onNav, learning }) {
  return (
    <div className="page course-page">
      <Title playful eyebrow={`${ue.level} · ${ue.id}`} title={ue.label} desc={ue.desc}>
        <span className="icon-tile large">
          <SubjectIcon id={ue.id} size={72}/>
        </span>
      </Title>
      <p className="course-coverage">Cours, entraînements et suivi par chapitre. Un complément à vos cours, avec une couverture partielle du programme.</p>
      <div className="course-tools">
        {[
          [
            "resume_cours",
            "book",
            "01",
            "Comprendre",
            "Cours et exemples",
            "Points clés et pièges fréquents",
          ],
          [
            "qcm",
            "check",
            "02",
            "Pratiquer",
            "QCM expliqué",
            "Séries de 4 à 20 questions, par chapitre ou en mélange",
          ],
          [
            "flashcards",
            "cards",
            "03",
            "Retenir",
            "Flashcards",
            "Séries de 20 à 100 cartes, notions et applications chiffrées",
          ],
          [
            "cas_pratique",
            "calendar",
            "04",
            "Vous tester",
            "Cas pratique",
            "Cas originaux et variantes chiffrées à choisir, avec raisonnement expliqué",
          ],
        ].map(([key, icon, n, tag, title, desc]) => (
          <button
            className="course-tool"
            key={key}
            onClick={() =>
              onNav(user.isPro ? key : "paywall")
            }
          >
            <span className="icon-tile">
              <Icon name={icon} />
            </span>
            <span className="eyebrow">
              {n} · {tag}
            </span>
            <h3>{title}</h3>
            <p>{desc}</p>
            <span className="tool-link">
              {user.isPro ? "Commencer" : "Accéder avec Pro"}
              {!user.isPro && <Icon name="lock" size={18} />}
            </span>
          </button>
        ))}
      </div>
      <ChapterLibrary ue={ue} learning={learning} onOpen={(screen,chapter,format)=>onNav(user.isPro?screen:'paywall',{chapter,format})}/>
    </div>
  );
}
export function OfferPage({ user, onCheckout, onNav }) {
  const [pendingPlan, setPendingPlan] = useState(null);
  const checkout = async (plan) => {
    if (pendingPlan) return;
    setPendingPlan(plan);
    try { await onCheckout(plan); }
    finally { setPendingPlan(null); }
  };
  const plans = [
    {id:'subscription',name:'SIMDCG Pro',tag:'À votre rythme',price:'15',period:'/ mois',description:'Pour réviser au fil des semaines.',terms:'Renouvellement mensuel. Résiliation depuis votre compte.',benefits:['Accès pendant votre abonnement','Renouvellement automatique chaque mois'],button:'Choisir Pro'},
    {id:'pack_examen',name:'Pack Examen',tag:'90 jours pour vous préparer',price:'29',period:'/ 90 jours',description:'Pour une période de révision intensive.',terms:'Un seul paiement. Aucun renouvellement automatique.',benefits:['90 jours d’accès dès le paiement','L’accès prend fin automatiquement'],button:'Choisir le Pack Examen'},
  ];
  return (
    <div className="marketing pricing-marketing">
      <PublicNav onNav={onNav} />
      <main className="container pricing-page">
        <Title
          eyebrow="LES TARIFS SIMDCG"
          title="Vos révisions, à votre rythme."
          desc="Les mêmes outils pour le DCG et le DSCG. Choisissez votre durée."
        />
        <div className="pricing-grid" aria-label="Choisir une offre">
          {plans.map(plan=><article className={'pricing-card'+(plan.id==='pack_examen'?' pricing-card-pack':'')} key={plan.id}>
            <span className="pricing-plan-tag">{plan.tag}</span>
            <h2>{plan.name}</h2>
            <p className="pricing-description">{plan.description}</p>
            <div className="price"><strong>{plan.price} €</strong><span>{plan.period}</span></div>
            <p className="price-detail">{plan.terms}</p>
            <ul>{plan.benefits.map(item=><li key={item}><Icon name="check" size={18}/><span>{item}</span></li>)}</ul>
            <Button secondary={plan.id==='subscription'} disabled={!!pendingPlan} aria-busy={pendingPlan===plan.id} onClick={()=>user?.isPro&&plan.id==='subscription'?onNav('account'):checkout(plan.id)}>
              {pendingPlan===plan.id?'Ouverture du paiement…':user?.isPro&&plan.id==='subscription'?'Voir mon accès':plan.button}
            </Button>
          </article>)}
        </div>
        <p className="pricing-secure"><Icon name="lock" size={16}/> Paiement sécurisé par Stripe · Accès lié à votre compte</p>
        <section className="pricing-included" aria-labelledby="pricing-included-title">
          <div><span className="eyebrow">DANS LES DEUX OFFRES</span><h2 id="pricing-included-title">Tout votre espace de révision.</h2><p>13 matières DCG et 7 matières DSCG.</p></div>
          <ul>{['Cours, fiches et textes à trous','QCM expliqués et flashcards','Cas corrigés et mode examen','Planning et suivi de progression'].map(item=><li key={item}><Icon name="check" size={18}/><span>{item}</span></li>)}</ul>
        </section>
        <div className="pricing-library" aria-label="Contenus disponibles">{[[catalogue.totals.chapters,'chapitres'],[catalogue.totals.curatedQuestions,'QCM expliqués'],[catalogue.totals.cards,'flashcards'],[catalogue.totals.curatedCases,'cas corrigés']].map(([value,label])=><div key={label}><strong>{value.toLocaleString('fr-FR')}</strong><span>{label}</span></div>)}</div>
        <details className="pricing-details"><summary>Avant de choisir votre accès</summary><p>Consultez les chapitres <a href="/dcg">DCG</a> et <a href="/dscg">DSCG</a> : la couverture du programme est partielle. Les exercices nécessitent un accès payant, sans essai gratuit. Les cas SIMDCG sont originaux et distincts des annales officielles.</p><p>Les deux offres comprennent le tuteur IA, avec un maximum de 20 demandes par jour et 300 par mois, sous réserve du budget de génération disponible. Les cours et exercices enregistrés restent accessibles sans génération IA.</p></details>
        <div className="recovery-link">
          <Icon name="lock" />
          <span>Vous avez déjà payé ?</span>
          <button onClick={() => onNav("account")}>
            Retrouver mon accès
          </button>
        </div>
      </main>
      <FAQ />
      <PublicFooter onNav={onNav} />
    </div>
  );
}
export function AccountPage({ user, onNav, onCheckout, request }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(false),
    [confirm, setConfirm] = useState(false);
  const recover = async (sessionId) => {
    setBusy(true);
    setMessage("");
    setError(false);
    try {
      const data = await request(
        "/api/stripe-reconcile",
        sessionId ? { sessionId } : {},
      );
      setMessage(data.message);
      if (sessionId) window.history.replaceState({}, "", "/compte");
    } catch (e) {
      setMessage(e.message);
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  const started = useRef(false);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("session_id");
    if (id && !started.current) {
      started.current = true;
      recover(id);
    }
  }, []);
  const cancel = async () => {
    setBusy(true);
    try {
      const data = await request("/api/stripe-subscription");
      setMessage(data.message);
      setConfirm(false);
    } catch (e) {
      setError(true);
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="page account-page">
      <Title title="Mon compte" />
      <section className="panel profile-card">
        <span className="avatar large">
          {user.name?.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
        <span className="plan-pill">
          {user.isPro ? "✦ Pro actif" : "Compte sans abonnement"}
        </span>
      </section>
      <div className="account-grid">
        <section className="panel">
          <span className="eyebrow">Abonnement</span>
          <h2>
            {user.isPro
              ? user.proType === "pack_examen"
                ? "Pack Examen"
                : "SIMDCG Pro"
              : "Choisir mon accès"}
          </h2>
          <p>
            {user.isPro
              ? user.proExpiresAt
                ? `Accès jusqu’au ${new Date(user.proExpiresAt).toLocaleDateString("fr-FR")}.`
                : "Votre accès Pro est actif."
              : "Cours, QCM, cartes et dossiers DCG et DSCG."}
          </p>
          <Button onClick={() => onNav(user.isPro ? "library" : "pricing")}>
            {user.isPro ? "Reprendre mes révisions" : "Voir les offres"}

          </Button>
          {user.proType === "subscription" && (
            <div className="cancel-sub">
              {confirm ? (
                <>
                  <p>
                    Arrêter le renouvellement ? Votre accès reste actif jusqu’à
                    la fin de la période payée.
                  </p>
                  <Button secondary disabled={busy} onClick={cancel}>
                    Confirmer l’arrêt
                  </Button>
                  <button onClick={() => setConfirm(false)}>
                    Garder mon abonnement
                  </button>
                </>
              ) : (
                <button onClick={() => setConfirm(true)}>
                  Arrêter le renouvellement
                </button>
              )}
            </div>
          )}
        </section>
        <section className="panel recovery-panel">
          <span className="eyebrow">Un achat à retrouver</span>
          <h2>Déjà abonné ?</h2>
          <p>
            Retrouvez vos achats avec l’adresse email de ce compte.
          </p>
          <Button secondary disabled={busy} onClick={() => recover()}>
            {busy ? "Vérification en cours…" : "Retrouver mon achat"}

          </Button>
          {!auth.currentUser?.emailVerified && (
            <button
              className="text-button"
              onClick={async () => {
                try {
                  await sendEmailVerification(auth.currentUser);
                  setMessage(
                    "Email de vérification envoyé. Après validation, reconnectez-vous.",
                  );
                } catch {
                  setError(true);
                  setMessage("Impossible d’envoyer l’email. Réessayez.");
                }
              }}
            >
              Vérifier mon adresse email
            </button>
          )}
          <p className="helper">
            Un autre email au paiement ? Le support peut vous aider.
          </p>
        </section>
      </div>
      {message && (
        <div role="status" className={`message ${error ? "error" : "success"}`}>
          {message}
        </div>
      )}
      <section className="bottom-note">
        <Icon name="user" />
        <div>
          <strong>Une question ?</strong>
          <p>
            Notre support vous répond par email.
          </p>
        </div>
        <a className="btn btn-secondary" href="mailto:contact.simdcg@gmail.com">
          Contacter le support
        </a>
      </section>
    </div>
  );
}
export function TutorPage({ ues, call, user, onNav }) {
  const [ue, setUE] = useState(ues[0]),
    [input, setInput] = useState(""),
    [messages, setMessages] = useState([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [available, setAvailable] = useState(null),
    [remaining, setRemaining] = useState(null);
  useEffect(() => {
    let alive = true;
    if (
      import.meta.env.DEV &&
      new URLSearchParams(location.search).has("design")
    ) {
      setAvailable(true);
      return;
    }
    fetch("/api/tutor-status")
      .then((r) => r.json())
      .then((d) => {
        if (alive) setAvailable(d.available === true);
      })
      .catch(() => {
        if (alive) setAvailable(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  const send = async (text) => {
    if (!text.trim() || busy || available !== true) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const reply = await call(
        `Vous êtes un tuteur pour ${ue.level}, ${ue.label}. Répondez en français, avec des exemples concrets. Signalez les incertitudes et les règles qui doivent être vérifiées dans un cours à jour. Ne prétendez pas fournir une correction officielle.`,
        next.slice(-10),
        2048,
        user,
        ue.id,
      );
      setMessages([
        ...next,
        {
          role: "assistant",
          content: typeof reply === "string" ? reply : reply.text,
          references:typeof reply === 'object'?reply.references:[],
        },
      ]);
      if (typeof reply === "object") setRemaining(reply);
    } catch (e) {
      setError(e.message);
      setMessages(messages);
      setInput(text);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="page tutor-page">
      <Title
        eyebrow="VOTRE TUTEUR IA"
        title="Le déclic commence par une question."
        desc="Une explication, un exemple, un raisonnement pas à pas."
      />
      <p className="study-notice">
        Complément optionnel · 20 demandes par jour · 300 par mois · budget de
        génération limité. Les fiches et exercices fonctionnent sans ce tuteur.
      </p>
      {remaining && (
        <p role="status">
          {remaining.dailyRemaining} demandes restantes aujourd’hui ·{" "}
          {remaining.monthlyRemaining} ce mois-ci.
        </p>
      )}
      {available !== true && (
        <div className="panel" role="status">
          <p>
            {available === null
              ? "Vérification de la disponibilité du tuteur…"
              : "Le tuteur est en pause. Vous pouvez continuer vos révisions."}
          </p>
          {onNav && (
            <Button secondary onClick={() => onNav("library")}>
              Ouvrir mes matières
            </Button>
          )}
        </div>
      )}
      <div className="tutor-toolbar">
        <label>
          Matière
          <select
            value={ue.id}
            disabled={busy}
            onChange={(e) => {
              setUE(ues.find((x) => x.id === e.target.value));
              setMessages([]);
            }}
          >
            {ues.map((x) => (
              <option key={x.id} value={x.id}>
                {x.level} · {x.label}
              </option>
            ))}
          </select>
        </label>
        <button
          className="text-button"
          disabled={busy}
          onClick={() => setMessages([])}
        >
          Nouvelle discussion
        </button>
      </div>
      <section className="panel chat-panel">
        {!messages.length ? (
          <div className="chat-empty">
            <span className="icon-tile large gold">
              <Icon name="spark" size={32} />
            </span>
            <h2>Quelle notion vous résiste ?</h2>
            <p>Précisez le contexte pour obtenir une réponse plus utile.</p>
            <div className="prompt-grid">
              {[
                "Expliquez-moi une notion essentielle de cette matière.",
                "Donnez-moi un exemple concret avec des chiffres.",
                "Posez-moi une question pour vérifier ma compréhension.",
              ].map((x) => (
                <button
                  key={x}
                  disabled={busy || available !== true}
                  onClick={() => send(x)}
                >
                  {x}

                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages" aria-live="polite">
            {messages.map((m, i) => (
              <article key={i} className={`chat-message ${m.role}`}>
                <strong>
                  {m.role === "user" ? "Vous" : "SIMDCG · Tuteur IA"}
                </strong>
                <p>{m.content}</p>
                {!!m.references?.length&&<div className="source-chips" aria-label="Chapitres associés">{m.references.map(ref=><a key={ref.url} href={ref.url}>{ref.title} </a>)}</div>}
              </article>
            ))}
            {busy && <p>Le tuteur prépare son explication…</p>}
          </div>
        )}
        {error && (
          <p role="alert" className="message error">
            {error}
          </p>
        )}
        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            aria-label="Votre question"
            value={input}
            maxLength={4000}
            disabled={busy || available !== true}
            placeholder={`Votre question en ${ue.short.toLowerCase()}…`}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            disabled={busy || !input.trim() || available !== true}
            type="submit"
          >
            Envoyer
          </Button>
        </form>
        <p className="helper">
          L’IA peut se tromper. Vérifiez les règles juridiques et fiscales avec
          vos cours à jour. L’historique de cette discussion reste dans la
          session ouverte.
        </p>
      </section>
    </div>
  );
}
export function LearningProgress({ user, ues, onNav, learning={},learningError,onRetry,onOpen }) {
  const history = user.history || [],
    qcms = history.filter((x) => x.type === "qcm"),
    mastery = user.mastery || {};
  return (
    <div className="page">
      <Title
        eyebrow="LES PETITS PAS DEVIENNENT VISIBLES"
        title="Votre progression, concrètement."
        desc="Vos résultats enregistrés, sans score de réussite à l’examen inventé."
      />
      {learningError&&<p className="message error" role="alert">Impossible de charger le suivi par chapitre. <button className="text-button" onClick={onRetry}>Réessayer</button></p>}
      <ProgressJourney ues={ues} learning={learning} onOpen={onOpen}/>
      <div className="metric-grid">
        <article className="metric">
          <strong>{qcms.length}</strong>
          <h3>Sessions QCM</h3>
        </article>
        <article className="metric">
          <strong>{history.filter((x) => x.type === "cas").length}</strong>
          <h3>Cas pratiques</h3>
        </article>
        <article className="metric">
          <strong>
            {history.filter((x) => x.type === "entretien").length}
          </strong>
          <h3>Entretiens</h3>
        </article>
        <article className="metric">
          <strong>{user.streak || 0}</strong>
          <h3>Jours de série</h3>
        </article>
      </div>
      {!qcms.length ? (
        <section className="panel empty-state">
          <Icon name="chart" size={38} />
          <h2>Votre premier résultat commence ici.</h2>
          <p>Terminez un QCM pour voir votre progression par matière.</p>
          <Button onClick={() => onNav("library")}>
            Choisir une matière
          </Button>
        </section>
      ) : (
        <>
          <section className="panel score-history">
            <h2>Vos derniers QCM</h2>
            <div className="score-bars">
              {qcms.slice(-10).map((h, i) => (
                <div key={i}>
                  <strong>{Math.round((h.score / h.total) * 100)}%</strong>
                  <i
                    style={{
                      height: `${Math.max(8, (h.score / h.total) * 140)}px`,
                    }}
                  />
                  <small>{h.ue}</small>
                </div>
              ))}
            </div>
          </section>
          <div className="ue-grid">
            {ues
              .filter((x) => mastery[x.id])
              .map((ue) => (
                <div className="panel" key={ue.id}>
                  <div className="programme-identity"><SubjectIcon id={ue.id} size={54}/><span className="ue-code">{ue.id}</span></div>
                  <h3>{ue.label}</h3>
                  <strong>{mastery[ue.id].best}%</strong>
                  <p>Meilleur QCM · {mastery[ue.id].attempts} session(s)</p>
                  <div className="progress-track">
                    <i style={{ width: `${mastery[ue.id].best}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
export function PublicInfo({ page, onNav, onAuth, ues }) {
  const [programme,setProgramme]=useState('2027');
  if(page==='features')return <RefinedFeatures Nav={PublicNav} Footer={PublicFooter} onNav={onNav} onAuth={onAuth}/>;
  ues=curriculumFor(programme);
  const isDiploma = ["dcg", "dscg"].includes(page),
    level = page.toUpperCase();
  const title = isDiploma
    ? `Vos révisions ${level}, avec un fil conducteur.`
    : page === "support"
      ? "Besoin d’un coup de main ?"
      : page === "resources"
        ? "Des repères pour mieux réviser."
        : "Un outil pour chaque étape.";
  return (
    <div className="marketing">
      <PublicNav onNav={onNav} onAuth={onAuth} />
      <main className="container info-page">
        <Title
          eyebrow="SIMDCG · VOTRE COMPAGNON DE RÉVISION"
          title={title}
          desc={
            isDiploma
              ? "Découvrez les matières effectivement disponibles dans cette version."
              : undefined
          }
        />
        {isDiploma ? (
          <>
            <label className="chapter-select programme-select">Programme<select aria-label="Programme" value={programme} onChange={e=>setProgramme(e.target.value)}><option value="2027">Session 2027, nouveaux intitulés</option><option value="2026">Session 2026</option></select></label>
            <div className="marketing-subjects">
              {ues
                .filter((x) => x.level === level)
                .map((ue) => (
                  <article className="panel" key={ue.id}>
                    <div className="programme-identity"><SubjectIcon id={ue.id} size={54}/><span className="ue-code">{ue.id}</span></div>
                    <h3>{ue.label}</h3>
                    <p>{ue.desc}</p>
                    <details className="programme-chapters"><summary>Voir les {catalogue.modules[ue.id]?.chapters.length} chapitres et les volumes</summary><p className="helper">{catalogue.modules[ue.id]?.curatedQuestionCount} QCM · {catalogue.modules[ue.id]?.cardCount} cartes · {catalogue.modules[ue.id]?.curatedCaseCount} modèles de cas, hors variantes. Accès aux contenus réservé à Pro.</p><ul>{catalogue.modules[ue.id]?.chapters.map(c=><li key={c.id}><strong>{c.title}</strong><span>{c.curatedQuestionCount} questions de notions · {c.curatedCaseCount} modèle{c.curatedCaseCount>1?"s":""} de cas</span></li>)}</ul></details>
                  </article>
                ))}
            </div>
            <p className="helper">
              {ues.filter((x) => x.level === level).length} matières
              disponibles. Les chapitres couvrent une partie du programme.
            </p>
            <Button onClick={() => onAuth("signup")}>
              Créer mon espace
            </Button>
          </>
        ) : page === "features" ? (
          <div className="feature-grid">
            {features.map(([icon, title, desc, tag]) => (
              <article className="feature-card" key={title}>
                <Icon name={icon} size={30} />
                <span className="card-tag">{tag}</span>
                <h2>{title}</h2>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        ) : page === "support" ? (
          <section className="panel support-card">
            <Icon name="user" size={38} />
            <h2>Écrivez à l’équipe SIMDCG.</h2>
            <p>
              Pour un problème d’accès, indiquez l’email de votre compte, la
              date et la référence du paiement. Ne transmettez pas votre mot de
              passe ou votre numéro de carte.
            </p>
            <a className="btn" href="mailto:contact.simdcg@gmail.com">
              contact.simdcg@gmail.com
            </a>
            <button className="text-button" onClick={() => onNav("account")}>
              J’ai payé : vérifier mon accès
            </button>
          </section>
        ) : (
          <div className="resource-grid">
            {[
              [
                "Comprendre avant de mémoriser",
                "Lisez une fiche. Reformulez les notions sans regarder. Utilisez ensuite le QCM pour repérer les points à reprendre.",
              ],
              [
                "Une erreur est une piste de travail",
                "Reprenez l’explication de chaque réponse. Notez le principe qui vous manquait plutôt que la seule lettre de la bonne réponse.",
              ],
              [
                "S’entraîner avec ses cours à jour",
                "Les outils IA complètent vos supports. Comparez les règles fiscales et juridiques avec les références enseignées pour votre session.",
              ],
            ].map(([title, desc]) => (
              <article className="panel" key={title}>
                <Icon name="book" />
                <h2>{title}</h2>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        )}
      </main>
      <PublicFooter onNav={onNav} />
    </div>
  );
}
export function StudentReviews({ load, onNav }) {
  const [reviews, setReviews] = useState(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  useEffect(() => {
    let active = true;
    setError('');load().then((data) => {
      if (active) setReviews(data);
    }).catch(()=>{if(active)setError('Les retours ne peuvent pas être chargés pour le moment.');});
    return () => {
      active = false;
    };
  }, [load,retry]);
  return (
    <div className="marketing">
      <PublicNav onNav={onNav} />
      <main className="container info-page">
        <Title
          eyebrow="RETOURS D’ÉTUDIANTS"
          title="Vos retours nous font avancer."
        />
        <p>Ces retours proviennent de comptes ayant utilisé la plateforme et sont publiés après vérification, avec l’accord de leur auteur. Aucun témoignage de démonstration n’est ajouté.</p>
        {error?<div role="alert"><p>{error}</p><button className="btn" onClick={()=>setRetry(n=>n+1)}>Réessayer</button></div>:reviews === null ? (
          <p>Chargement…</p>
        ) : reviews.length ? (
          <div className="resource-grid">
            {reviews.map((r, i) => (
              <article className="panel" key={r.id || i}>
                <p>{r.text || r.message}</p>
                <strong>{r.alias}</strong><p>{r.level} · {r.rating}/5</p>
              </article>
            ))}
          </div>
        ) : (
          <section className="panel empty-state">
            <h2>Pas encore de retour publié.</h2>
            <p>Partagez votre expérience avec l’équipe.</p>
            <a className="btn" href="mailto:contact.simdcg@gmail.com">
              Donner mon avis
            </a>
          </section>
        )}
      </main>
      <PublicFooter onNav={onNav} />
    </div>
  );
}
