import GizmoDashboard from './GizmoDashboard';
import { GizmoShell } from './gizmo-ui';
import SubjectIcon from './SubjectIcon';
import { useState, useEffect, useRef } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "./firebase";
import ExamCountdown from "./ExamCountdown";
import { ChapterLibrary } from './chapter-navigation';
import { curriculumFor } from '../lib/curriculum.mjs';
import catalogue from './catalogue.json';
import { HeroAtmosphere } from './interactions';
import ProgressJourney from './ProgressJourney';
import HomeStudyPath from './HomeStudyPath';
import PreviewGallery from './PreviewGallery';

const paths = {
  home: "M3 10 12 3l9 7v10H3z M9 20v-7h6v7",
  book: "M12 5v15 M3 4h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v15h-5a4 4 0 0 0-4 1 4 4 0 0 0-4-1H3z",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z",
  chart: "M4 4v16h16 M8 16v-4 M12 16V8 M16 16V5",
  calendar: "M4 6h16v14H4z M4 10h16 M8 3v5 M16 3v5",
  check: "m5 12 4 4L19 6",
  arrow: "M4 12h16 m-6-6 6 6-6 6",
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
  return (
    <header className="public-nav">
      <div className="container nav-row">
        <Brand onClick={() => onNav("landing")} />
        <button
          className="menu-button"
          aria-expanded={open}
          aria-label="Ouvrir la navigation"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
        <nav
          className={open ? "public-links is-open" : "public-links"}
          aria-label="Navigation principale"
        >
          {[
            ["features", "La méthode"],
            ["dcg", "DCG"],
            ["dscg", "DSCG"],
            ["pricing", "Tarifs"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                onNav(key);
                setOpen(false);
              }}
            >
              {label}
            </button>
          ))}
          <button onClick={() => (onAuth ? onAuth("login") : onNav("auth", {authMode:"login"}))}>
            Connexion
          </button>
          <Button onClick={() => (onAuth ? onAuth("signup") : onNav("auth", {authMode:"signup"}))}>
            Créer mon compte <Icon name="arrow" size={16} />
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
        {[
          ["resources", "Ressources"],
          ["support", "Contact"],
          ["cgu", "Conditions"],
          ["confidentialite", "Confidentialité"],
        ].map(([key, label]) => (
          <button key={key} onClick={() => onNav(key)}>
            {label}
          </button>
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
    "Non. Ce sont des exercices originaux enregistrés, portant sur des fondamentaux. Ils couvrent partiellement chaque matière et complètent vos cours et annales de votre session.",
  ],
  [
    "Quelles matières sont couvertes ?",
    "La bibliothèque propose des contenus dans les 13 matières obligatoires du DCG et les 7 du DSCG. Les chapitres restent une couverture partielle des programmes, avec une liste consultable avant l’achat.",
  ],
  [
    "Que faire si j’ai payé mais que mon compte reste gratuit ?",
    "Connectez-vous au compte utilisé lors de l’achat, puis ouvrez Mon compte et cliquez sur « J’ai déjà payé ». Si la recherche échoue, contactez contact.simdcg@gmail.com avec votre référence de paiement.",
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
          Contacter le support <Icon name="arrow" size={16} />
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
            <span>Comprendre → s’entraîner → retenir</span>
          </div>
          <span className="round-arrow">↗</span>
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
export function Marketing({ onAuth, onNav, ues }) {
  return (
    <div className="marketing">
      <PublicNav onNav={onNav} onAuth={onAuth} />
      <main>
        <section className="container hero hero-campus"><HeroAtmosphere /><div className="hero-subject-orbit" aria-hidden="true">{["UE1","UE6","UE9","UE11","DSCG4","DSCG7"].map((id,i)=><span className={"orbit-item orbit-"+i} key={id}><SubjectIcon id={id} size={68}/><small>{id.replace("DSCG","UE")} · {id.startsWith("DSCG")?"DSCG":"DCG"}</small></span>)}</div>
          <div className="hero-copy">
            <span className="pill">
              <i /> LES RÉVISIONS DES ÉTUDIANTS EN COMPTABILITÉ
            </span>
            <h1>
              Réviser le DCG et le DSCG,
              <br /><span>ça s’apprend aussi.</span>
            </h1>
            <p>
              Une plateforme consacrée aux diplômes de comptabilité et de gestion.
              Retrouvez vos 13 UE de DCG et vos 7 UE de DSCG : cours par chapitre,
              QCM expliqués, flashcards et cas corrigés pour travailler les raisonnements de vos épreuves.
            </p>
            <div className="hero-actions">
              <Button onClick={() => onNav("pricing")}>
                Accéder aux révisions <Icon name="arrow" size={18} />
              </Button>
              <Button
                secondary
                onClick={() =>
                  document
                    .getElementById("methode")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                Voir la méthode DCG / DSCG
              </Button>
            </div>
            <div className="hero-reassurance">
              <span>
                <Icon name="check" size={15} /> 13 UE DCG · 7 UE DSCG
              </span>
              <span>
                <Icon name="check" size={15} /> Pro à 15 € / mois
              </span>
            </div>
          </div>
          <HomeStudyPath ues={ues} onNav={onNav}/>
        </section>
        <section className="container library-numbers" aria-label="Contenu de la bibliothèque">{[[catalogue.totals.subjects,'matières DCG et DSCG'],[catalogue.totals.chapters,'chapitres de cours'],[catalogue.totals.curatedQuestions,'QCM de notions expliqués'],[catalogue.totals.cards,'flashcards'],[catalogue.totals.curatedCases,'modèles de cas corrigés']].map(([count,label])=><div key={label}><strong>{count.toLocaleString('fr-FR')}</strong><span>{label}</span></div>)}<p>Cours, questions de raisonnement et cartes de rappel forment des banques distinctes. Les calculs proposent aussi des variantes chiffrées, affichées séparément dans les chapitres concernés.</p></section>
        <div className="container exam-home"><ExamCountdown /></div>
        <div className="subject-strip">
          <div className="container">
            <span>VOS ÉPREUVES DCG / DSCG</span>
            {[
              "Comptabilité",
              "Droit",
              "Finance",
              "Fiscalité",
              "Management",
            ].map((x) => (
              <strong key={x}>{x}</strong>
            ))}
          </div>
        </div>
        <PreviewGallery onSubscribe={()=>onNav('pricing')}/>
        <section id="methode" className="container section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                UNE MÉTHODE, PAS UN MILLIER D’ONGLETS
              </span>
              <h2>Comprendre vos UE. Préparer vos épreuves.</h2>
            </div>
            <p>
              Apprendre. Pratiquer. Retenir.
              <br />
              Et recommencer, à votre rythme.
            </p>
          </div>
          <div className="feature-grid">
            {features.map(([icon, title, desc, tag], i) => (
              <article className={`feature-card feature-${i}`} key={title}>
                <div className="icon-tile">
                  <Icon name={icon} size={26} />
                </div>
                <span className="card-tag">{tag}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
                <span className="card-number">0{i + 1}</span>
              </article>
            ))}
          </div>
        </section>
        <section className="section navy-section">
          <div className="container roadmap">
            <div>
              <span className="eyebrow">
                DES RÉVISIONS QUI ONT UN FIL CONDUCTEUR
              </span>
              <h2>
                Une matière.
                <br />
                Trois façons
                <br />
                de la maîtriser.
              </h2>
              <p>
                Du premier « je ne comprends pas » au plaisir de répondre sans
                hésiter.
              </p>
              <Button onClick={() => onAuth("signup")}>
                Trouver ma matière <Icon name="arrow" />
              </Button>
            </div>
            <ol>
              {[
                [
                  "Choisissez votre matière",
                  "DCG ou DSCG : retrouvez les outils au même endroit.",
                ],
                [
                  "Travaillez une notion",
                  "Une fiche pour comprendre, un QCM pour tester, une explication pour progresser.",
                ],
                [
                  "Consolidez votre acquis",
                  "Reprenez vos cartes difficiles et consultez vos résultats pour choisir la suite.",
                ],
              ].map(([title, desc], i) => (
                <li key={title}>
                  <span>{i + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="container section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">VOTRE DIPLÔME, VOTRE PARCOURS</span>
              <h2>
                Du droit à la compta.
                <br />
                Chaque matière a sa place.
              </h2>
            </div>
            <Button secondary onClick={() => onNav("dcg")}>
              Voir les matières <Icon name="arrow" />
            </Button>
          </div>
          <div className="marketing-subjects">
            {ues.slice(0, 6).map((ue) => (
              <button
                key={ue.id}
                onClick={() => onNav(ue.level === "DCG" ? "dcg" : "dscg")}
              >
                <div className="programme-identity"><SubjectIcon id={ue.id} size={54}/><span className="ue-code">{ue.id}</span></div>
                <h3>{ue.label}</h3>
                <span>
                  {ue.short}
                  <Icon name="arrow" size={17} />
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="container cta-band">
          <span className="icon-tile">
            <Icon name="spark" size={30} />
          </span>
          <div>
            <span className="eyebrow">LE PLUS DUR, C’EST DE COMMENCER.</span>
            <h2>
              Votre prochaine révision
              <br />
              peut être plus simple.
            </h2>
            <p>Pro à 15 € / mois ou Pack Examen à 29 € pour 90 jours.</p>
          </div>
          <Button onClick={() => onNav("pricing")}>
            Choisir mon offre <Icon name="arrow" />
          </Button>
        </section>
        <FAQ />
      </main>
      <PublicFooter onNav={onNav} />
    </div>
  );
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
              Découvrir Pro <Icon name="arrow" size={16} />
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
function Title({ eyebrow, title, desc, children }) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      {children}
    </div>
  );
}
function UECard({ ue, mastery, onClick }) {
  return (
    <button className="ue-card" onClick={onClick}>
      <div className="ue-card-top">
        <SubjectIcon id={ue.id} size={60}/>
        <span className="ue-code">
          {ue.id.replace("DSCG", "UE")}
          <small>{ue.level}</small>
        </span>
        <span className="ue-arrow">↗</span>
      </div>
      <h3>{ue.label}</h3>
      <p>{ue.desc}</p>
      <span className="ue-content-count">{catalogue.modules[ue.id]?.chapters.length} cours · {catalogue.modules[ue.id]?.curatedQuestionCount} QCM de notions</span>
      <div className="ue-mastery">
        <span>
          {mastery?.attempts
            ? `${mastery.attempts} session${mastery.attempts > 1 ? "s" : ""} · meilleur QCM`
            : "Votre prochain déclic vous attend"}
        </span>
        {mastery?.attempts && <strong>{mastery.best}%</strong>}
      </div>
      <div className="progress-track">
        <i style={{ width: `${mastery?.best || 0}%`, background: ue.color }} />
      </div>
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
              <Icon name="arrow" />
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
          <button className="text-button" onClick={() => onNav("review_today")}>À revoir aujourd’hui <Icon name="arrow" size={16} /></button>
          <button className="text-button" onClick={() => onNav("exams")}>Travailler un sujet d’examen <Icon name="arrow" size={16} /></button>
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
          Ouvrir le tuteur <Icon name="arrow" size={16} />
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
    <div className="page">
      <Title
        eyebrow="VOTRE BIBLIOTHÈQUE DE RÉVISION"
        title="Une matière. Tous vos outils."
        desc="Choisissez votre matière pour retrouver fiches, QCM, flashcards et cas pratiques."
      />
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
        {visible.map((ue) => (
          <UECard
            key={ue.id}
            ue={ue}
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
      <Title eyebrow={`${ue.level} · ${ue.id}`} title={ue.label} desc={ue.desc}>
        <span className="icon-tile large">
          <SubjectIcon id={ue.id} size={72}/>
        </span>
      </Title>
      <section className="course-intro panel">
        <span className="pill">VOTRE PARCOURS DANS CETTE MATIÈRE</span>
        <h2>
          Commencez par comprendre.
          <br />
          Terminez par vous tester.
        </h2>
        <p>
          Des cours par chapitre et des exercices sur les fondamentaux. Ce parcours
          complète vos cours et ne couvre pas tout le programme.
        </p>
      </section>
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
              <Icon
                name={user.isPro ? "arrow" : "lock"}
                size={18}
              />
            </span>
          </button>
        ))}
      </div>
      <ChapterLibrary ue={ue} learning={learning} onOpen={(screen,chapter)=>onNav(user.isPro?screen:'paywall',{chapter})}/>
    </div>
  );
}
export function OfferPage({ user, onCheckout, onNav }) {
  return (
    <div className="marketing">
      <PublicNav onNav={onNav} />
      <main className="container pricing-page">
        <Title
          eyebrow="CHOISISSEZ VOTRE RYTHME"
          title="Un cap clair. Un prix clair."
          desc="Les mêmes outils de révision, deux façons d’y accéder."
        />
        <p className="helper">Consultez les chapitres DCG et DSCG avant de choisir votre accès. Les exercices sont réservés aux abonnés, sans essai gratuit.</p>
        <div className="pricing-grid">
          <article className="pricing-card">
            <span className="card-tag">POUR UN OBJECTIF PRÉCIS</span>
            <h2>Pack Examen</h2>
            <p>Une période de révision intensive.</p>
            <div className="price">
              29 €<span>/ 90 jours</span>
            </div>
            <span className="price-detail">
              Paiement unique · sans renouvellement
            </span>
            <ul>
              {[
                "13 matières DCG + 7 matières DSCG",
                "QCM, fiches et flashcards",
                "Cas pratiques et corrigés enregistrés",
                "Planning et préparation écrite à l’oral sans IA",
                "Tuteur IA : 20 demandes/jour, 300/mois",
                "Accès pendant 90 jours",
              ].map((x) => (
                <li key={x}>
                  <Icon name="check" size={17} />
                  {x}
                </li>
              ))}
            </ul>
            <Button secondary onClick={() => onCheckout("pack_examen")}>
              Choisir le Pack Examen <Icon name="arrow" />
            </Button>
          </article>
          <article className="pricing-card recommended">
            <span className="recommended-label">
              POUR AVANCER TOUTE L’ANNÉE
            </span>
            <span className="card-tag">VOTRE COMPAGNON AU QUOTIDIEN</span>
            <h2>
              SIMDCG Pro <span>✦</span>
            </h2>
            <p>Gardez vos outils à portée de main.</p>
            <div className="price">
              15 €<span>/ mois</span>
            </div>
            <span className="price-detail">
              Abonnement mensuel · résiliable
            </span>
            <ul>
              {[
                "13 matières DCG + 7 matières DSCG",
                "Parcours enregistrés, sans dépendre de l’IA",
                "Tuteur IA : 20 demandes/jour, 300/mois",
                "Suivi de vos scores par matière",
                "Reprise des flashcards difficiles",
                "Accès tant que l’abonnement est actif",
              ].map((x) => (
                <li key={x}>
                  <Icon name="check" size={17} />
                  {x}
                </li>
              ))}
            </ul>
            <Button
              onClick={() =>
                user?.isPro ? onNav("account") : onCheckout("subscription")
              }
            >
              {user?.isPro ? "Voir mon accès" : "Choisir Pro"}
              <Icon name="arrow" />
            </Button>
          </article>
        </div>
        <p className="pricing-footnote">
          Bibliothèque : {catalogue.totals.curatedQuestions.toLocaleString('fr-FR')} QCM, {catalogue.totals.cards.toLocaleString('fr-FR')} flashcards, {catalogue.totals.chapters} chapitres de cours et {catalogue.totals.curatedCases.toLocaleString('fr-FR')} modèles
          de cas corrigés, complétés par des variantes de calcul. Couverture partielle du programme ; ces contenus ne sont
          pas des annales officielles. Le tuteur est optionnel, soumis aux
          quotas et à un budget de génération. Une panne du tuteur ne bloque pas
          les révisions.
        </p>
        <div className="recovery-link">
          <Icon name="lock" />
          <span>Vous avez déjà payé ?</span>
          <button onClick={() => onNav("account")}>
            Retrouver mon accès →
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
      <Title
        eyebrow="VOTRE COMPTE"
        title="Tout est ici."
        desc="Votre profil, votre accès et une aide si vous en avez besoin."
      />
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
          <span className="eyebrow">VOTRE ACCÈS</span>
          <h2>
            {user.isPro
              ? user.proType === "pack_examen"
                ? "Pack Examen"
                : "SIMDCG Pro"
              : "Découvrez votre espace"}
          </h2>
          <p>
            {user.isPro
              ? user.proExpiresAt
                ? `Accès jusqu’au ${new Date(user.proExpiresAt).toLocaleDateString("fr-FR")}.`
                : "Votre abonnement est actif. Les outils de révision sont débloqués."
              : "Choisissez une offre pour utiliser les outils de révision IA."}
          </p>
          <Button onClick={() => onNav(user.isPro ? "library" : "pricing")}>
            {user.isPro ? "Reprendre mes révisions" : "Voir les offres"}
            <Icon name="arrow" />
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
          <span className="icon-tile gold">
            <Icon name="check" />
          </span>
          <h2>Vous avez déjà payé ?</h2>
          <p>
            Vérifiez vos achats pour retrouver votre accès. Les anciens
            paiements sont recherchés avec l’adresse de ce compte.
          </p>
          <Button secondary disabled={busy} onClick={() => recover()}>
            {busy ? "Vérification en cours…" : "J’ai déjà payé"}
            <Icon name="arrow" />
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
            Un autre email utilisé au paiement ? Contactez le support avec votre
            référence.
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
          <strong>Besoin d’un coup de main ?</strong>
          <p>
            Écrivez-nous avec l’adresse de votre compte et votre référence de
            paiement.
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
                  <Icon name="arrow" size={16} />
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
                {!!m.references?.length&&<div className="source-chips" aria-label="Chapitres associés">{m.references.map(ref=><a key={ref.url} href={ref.url}>{ref.title} ↗</a>)}</div>}
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
            <Icon name="arrow" />
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
            Choisir une matière <Icon name="arrow" />
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
              Créer mon espace <Icon name="arrow" />
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
              J’ai payé : vérifier mon accès →
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
