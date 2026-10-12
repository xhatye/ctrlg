import { useState, useRef, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { onSnapshot, doc, getDoc, setDoc, updateDoc, arrayUnion, collection, addDoc, getDocs, query, orderBy, limit, increment } from "firebase/firestore";

import { auth, db, googleProvider } from './firebase';
import { ensureProfile } from './profile';
import { launchCheckout, billingRequest } from './billing-client';
import { Brand, Marketing, StudentHome, OfferPage, CourseHome, ProductShell, AccountPage, TutorPage, LibraryPage, LearningProgress, PublicInfo, StudentReviews } from './modern';
import './design.css';

const upgrade = (plan = 'subscription') => launchCheckout(plan).catch(error => toast.error(error.message));

// ── CONFIG ────────────────────────────────────────────────────────────────────
const PRO_PRICE = "15€";
const PACK_EXAMEN_PRICE = "29€";
const FREE_INTERVIEWS = 0; // No free tier
const FREE_QCM_PER_UE = 0;
const FREE_FLASH_PER_UE = 0;
const PRO_FLASH_PER_UE = 12;
const FREE_AI_CALLS_PER_DAY = 0;

// ── ROUTING ───────────────────────────────────────────────────────────────────
const SCREEN_TO_URL = {
  landing:            "/",
  pricing:            "/tarifs",
  testimonials:       "/avis",
  auth:               "/connexion",
  dashboard:          "/interface",
  subject_hub:        "/matiere",
  qcm:                "/qcm",
  flashcards:         "/flashcards",
  resume_cours:       "/resume-cours",
  cas_pratique:       "/cas-pratique",
  planning:           "/planning",
  interview_config:   "/entretien/config",
  interview:          "/entretien/simulation",
  results_interview:  "/resultats/entretien",
  results_qcm:        "/resultats/qcm",
  results_cas:        "/resultats/cas",
  paywall:            "/pro",
  account: "/compte",
  tutor: "/tuteur",
  library: "/matieres",
  features: "/fonctionnalites",
  dcg: "/dcg",
  dscg: "/dscg",
  resources: "/ressources",
  support: "/contact",
  history:            "/historique",
  progress:           "/progression",
  cgu:                "/cgu",
  confidentialite:    "/confidentialite",
  forgot_password:    "/mot-de-passe-oublie",
};
const URL_TO_SCREEN = Object.fromEntries(Object.entries(SCREEN_TO_URL).map(([k,v]) => [v,k]));

const getScreenFromPath = (path) => {
  // Exact match first
  if (path === "/inscription") return "auth";
  if (URL_TO_SCREEN[path]) return URL_TO_SCREEN[path];
  // Prefix match for dynamic sub-paths like /entretien/*
  const found = Object.entries(URL_TO_SCREEN).find(([url]) => path.startsWith(url) && url !== "/");
  return found ? found[1] : "landing";
};

// ── UES DATA ──────────────────────────────────────────────────────────────────
const DCG_UES = [
  { id:"UE1", label:"Introduction au droit", short:"Droit général", icon:"⚖", color:"#376cac", desc:"Sources du droit, contrats, responsabilité civile et pénale", level:"DCG", proOnly:true },
  { id:"UE2", label:"Droit des sociétés", short:"Droit sociétés", icon:"🏛", color:"#7658a9", desc:"SARL, SAS, SA, droit commun des sociétés, liquidation", level:"DCG", proOnly:true },
  { id:"UE3", label:"Droit social", short:"Droit social", icon:"🤝", color:"#258262", desc:"Contrat de travail, conventions collectives, licenciement", level:"DCG", proOnly:true },
  { id:"UE4", label:"Fiscalité", short:"Fiscalité", icon:"📋", color:"#a47b2e", desc:"IS, IR, TVA, droits d'enregistrement, fiscalité internationale", level:"DCG", proOnly:true },
  { id:"UE6", label:"Finance d'entreprise", short:"Finance", icon:"📈", color:"#b84646", desc:"Analyse financière, investissement, financement, valorisation", level:"DCG", proOnly:true },
  { id:"UE7", label:"Management", short:"Management", icon:"◇", color:"#a47b2e", desc:"Stratégie, organisation, RH, direction, leadership", level:"DCG", proOnly:true },
  { id:"UE9", label:"Comptabilité", short:"Compta", icon:"🔢", color:"#257b9f", desc:"PCG, immobilisations, stocks, provisions, capitaux propres", level:"DCG", proOnly:true },
  { id:"UE10", label:"Comptabilité approfondie", short:"Compta appro", icon:"📊", color:"#ab682e", desc:"Consolidation, fusion, comptes combinés, normes IFRS", level:"DCG", proOnly:true },
];
const DSCG_UES = [
  { id:"DSCG1", label:"Gestion juridique, fiscale et sociale", short:"Juridique/Fiscal", icon:"⚖", color:"#376cac", desc:"Droit avancé des affaires, montages juridiques complexes", level:"DSCG" },
  { id:"DSCG2", label:"Finance", short:"Finance avancée", icon:"📈", color:"#b84646", desc:"Marchés financiers, ingénierie financière, gestion de risques", level:"DSCG" },
  { id:"DSCG3", label:"Management et contrôle de gestion", short:"Management/CdG", icon:"◎", color:"#a47b2e", desc:"Stratégie avancée, contrôle de gestion, pilotage de la performance", level:"DSCG" },
  { id:"DSCG4", label:"Comptabilité et audit", short:"Compta/Audit", icon:"🔍", color:"#257b9f", desc:"Normes IFRS, consolidation avancée, commissariat aux comptes", level:"DSCG" },
  { id:"DSCG5", label:"Systèmes d'information", short:"SI", icon:"💻", color:"#7658a9", desc:"Architecture SI, sécurité, urbanisation, ERP", level:"DSCG" },
];
const ALL_UES = [...DCG_UES, ...DSCG_UES];

// ── INTERVIEW TOPICS ──────────────────────────────────────────────────────────
const INTERVIEW_TOPICS = [
  { id:"Contrôle de gestion", icon:"◎", desc:"Tableau de bord, écarts, ABC", free:false },
  { id:"Finance d'entreprise", icon:"📈", desc:"Analyse financière, ratios", free:false },
  { id:"Comptabilité", icon:"🔢", desc:"Clôtures, provisions, PCG", free:false },
  { id:"Management", icon:"◇", desc:"Leadership, organisation, stratégie", free:false },
  { id:"Fiscalité", icon:"📋", desc:"IS, TVA, optimisation fiscale", free:false },
  { id:"Général DCG/DSCG", icon:"◈", desc:"Toutes matières confondues", free:false },
];
const ROLES = [
  { id:"Junior (0-2 ans)", label:"Junior", sub:"0–2 ans", color:"#2c8061" },
  { id:"Confirmé (3-5 ans)", label:"Confirmé", sub:"3–5 ans", color:"#376cac" },
  { id:"Senior (5+ ans)", label:"Senior", sub:"5+ ans", color:"#996724" },
];
const DURATIONS = [
  { id:"flash", label:"Flash", sub:"~4 questions", q:4 },
  { id:"standard", label:"Standard", sub:"~7 questions", q:7 },
  { id:"complet", label:"Complet", sub:"~12 questions", q:12 },
];

// ── PROMPTS ───────────────────────────────────────────────────────────────────
const INTERVIEW_SYSTEM = (role, topic) =>
  `Tu es un directeur financier senior conduisant un entretien de recrutement pour un poste en ${topic} (niveau : ${role}) dans une grande entreprise française. Tu es exigeant, professionnel. Si la réponse est bonne tu approfondis, si faible tu demandes de développer. Format : 1) Bref retour (1-2 phrases) 2) Prochaine question. Ne donne jamais les réponses.`;

const INTERVIEW_EVAL = `Expert recrutement finance/gestion. Évalue. JSON strict sans markdown :
{"score":<0-100>,"niveau":"<Débutant|Intermédiaire|Avancé|Expert>","points_forts":["...","...","..."],"axes_amelioration":["...","...","..."],"verdict":"<2-3 phrases>","pret_pour_poste":<true|false>,"conseil_prioritaire":"<1 conseil concret>"}`;

const QCM_PROMPT = (ue, n) =>
  `Tu es un expert en ${ue.label} (${ue.level}). Génère exactement ${n} QCM de niveau examen. JSON strict sans markdown, tableau de ${n} objets :
[{"q":"question","options":["A","B","C","D"],"answer":<0-3>,"expl":"explication courte","difficulte":"<Facile|Moyen|Difficile>"}]`;

const FLASHCARD_PROMPT = (ue, n) =>
  `Expert ${ue.label} (${ue.level}). Génère ${n} flashcards de révision. JSON strict sans markdown :
[{"q":"question précise","a":"réponse complète 2-3 phrases","tag":"sous-thème"}]`;

const CAS_PROMPT = (ue) =>
  `Expert ${ue.label} (${ue.level}). Génère un cas pratique style épreuve DCG/DSCG. JSON strict :
{"titre":"titre du cas","contexte":"description entreprise et situation (4-6 phrases)","questions":[{"num":1,"enonce":"question 1","points":4},{"num":2,"enonce":"question 2","points":6},{"num":3,"enonce":"question 3","points":10}],"duree_estimee":"45 min","difficulte":"Moyen"}`;

const CAS_EVAL_PROMPT = (cas, reponse) =>
  `Expert correcteur examen. Cas : ${JSON.stringify(cas)}\nRéponse candidat : ${reponse}\nJSON strict :
{"note":<0-20>,"appreciation":"<TB|B|AB|P|I>","correction_par_question":[{"num":1,"note":<0-4>,"commentaire":"...","elements_attendus":"..."},{"num":2,"note":<0-6>,"commentaire":"...","elements_attendus":"..."},{"num":3,"note":<0-10>,"commentaire":"...","elements_attendus":"..."}],"conseil":"conseil pour progresser"}`;

const RESUME_PROMPT = (ue) =>
  `Expert ${ue.label} (${ue.level}). Résumé de révision examen. JSON strict sans markdown, sois concis :
{"sections":[{"titre":"...","points":["...","...","..."]}],"points_cles":["...","...","...","..."],"pieges_frequents":["...","..."],"conseil_exam":"..."}
Génère 3 sections maximum, 3 points par section, 4 points clés, 2 pièges. Réponse courte et précise.`;

const PLANNING_PROMPT = (weeks, level, subjects) =>
  `Tu es un coach DCG/DSCG expert. Planning de révision sur ${weeks} semaines pour ${level} (matières : ${subjects}). JSON strict sans markdown :
{"semaines":[{"num":1,"focus":"thème principal de la semaine","ues":["UE1"],"objectifs":["objectif précis 1","objectif précis 2","objectif précis 3"],"conseil":"1 conseil pratique pour cette semaine"}],"conseil_global":"conseil général pour réussir","rythme_conseille":"X heures par jour"}
Génère exactement ${weeks} semaines avec une progression logique du général vers le spécifique.`;

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const scoreColor = (s) => s >= 80 ? "#2c8061" : s >= 60 ? "#996724" : "#b84646";
const noteColor = (n) => n >= 14 ? "#2c8061" : n >= 10 ? "#996724" : "#b84646";
const today = () => new Date().toISOString().split("T")[0];

// Checks isPro AND proExpiresAt — returns true only if access is active
const resolveIsPro = (data) => {
  if (!data?.isPro) return false;
  if (!data?.proExpiresAt) return true; // subscription, no expiry
  return new Date(data.proExpiresAt) > new Date(); // pack examen — check expiry
};

// ── API ───────────────────────────────────────────────────────────────────────
async function callClaude(system, messages, maxTokens = 1200, user = null) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s hard timeout
  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await auth.currentUser?.getIdToken() || ""}` },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system, messages }),
      signal: controller.signal,
    });
    if (!r.ok) { const error = await r.json().catch(() => ({})); throw new Error(error.error || `API ${r.status}`); }
    const d = await r.json();
    return d.content?.[0]?.text || "";
  } catch (e) {
    if (e.name === "AbortError") console.error("callClaude timeout after 30s");
    else console.error("callClaude error:", e);
    throw new Error(e.name === "AbortError" ? "La réponse prend trop de temps. Réessayez." : e.message);
  } finally {
    clearTimeout(timeout);
  }
}

async function callClaudeJSON(system, prompt, maxTokens = 2500, user = null) {
  try {
    const raw = await callClaude(system, [{ role: 'user', content: prompt }], maxTokens, user);
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch (error) { toast.error(error.message || 'Le contenu n’a pas pu être généré. Réessayez.'); return null; }
}

// ── STORAGE (Firestore) ───────────────────────────────────────────────────────
const getUserDoc = (uid) => doc(db, "users", uid);

const saveHistory = async (uid, entry) => {
  try { await updateDoc(getUserDoc(uid), { history: arrayUnion(entry) }); } catch {}
};

const loadHistory = async (uid) => {
  try {
    const snap = await getDoc(getUserDoc(uid));
    return snap.exists() ? (snap.data().history || []).reverse() : [];
  } catch { return []; }
};

const updateStreak = async (uid) => {
  try {
    const snap = await getDoc(getUserDoc(uid));
    const data = snap.exists() ? snap.data() : {};
    const s = data.streak || { count: 0, lastDate: "" };
    const t = today();
    if (s.lastDate === t) return s.count;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const ys = y.toISOString().split("T")[0];
    const n = s.lastDate === ys ? s.count + 1 : 1;
    await updateDoc(getUserDoc(uid), { streak: { count: n, lastDate: t } });
    return n;
  } catch { return 1; }
};

const loadStreak = async (uid) => {
  try {
    const snap = await getDoc(getUserDoc(uid));
    if (!snap.exists()) return 0;
    const s = snap.data().streak;
    if (!s) return 0;
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (s.lastDate !== today() && s.lastDate !== y.toISOString().split("T")[0]) return 0;
    return s.count;
  } catch { return 0; }
};

const saveMastery = async (uid, ueId, pct) => {
  try {
    const snap = await getDoc(getUserDoc(uid));
    const data = snap.exists() ? snap.data() : {};
    const mastery = data.mastery || {};
    const existing = mastery[ueId] || { best: 0, attempts: 0 };
    const updated = {
      best: Math.max(existing.best, pct),
      attempts: (existing.attempts || 0) + 1,
      lastDate: today(),
    };
    await updateDoc(getUserDoc(uid), { [`mastery.${ueId}`]: updated });
  } catch {}
};

const loadMastery = async (uid) => {
  try {
    const snap = await getDoc(getUserDoc(uid));
    return snap.exists() ? (snap.data().mastery || {}) : {};
  } catch { return {}; }
};

// ── TESTIMONIALS & STATS ──────────────────────────────────────────────────────
const saveTestimonial = async (data) => {
  try {
    await addDoc(collection(db, "testimonials"), {
      ...data,
      date: new Date().toISOString(),
      dateDisplay: new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    });
    return true;
  } catch { return false; }
};

const loadTestimonials = async () => {
  try {
    const q = query(collection(db, "testimonials"), orderBy("date", "desc"), limit(20));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { return []; }
};

const loadStats = async () => {
  try {
    const snap = await getDoc(doc(db, "meta", "stats"));
    return snap.exists() ? snap.data() : { totalQCMs: 0, totalUsers: 0, totalInterviews: 0, totalFlashcards: 0 };
  } catch { return { totalQCMs: 0, totalUsers: 0, totalInterviews: 0, totalFlashcards: 0 }; }
};

const incrementStat = async (field) => {
  try {
    const ref = doc(db, "meta", "stats");
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { totalQCMs: 0, totalUsers: 0, totalInterviews: 0, totalFlashcards: 0, [field]: 1 });
    } else {
      await updateDoc(ref, { [field]: increment(1) });
    }
  } catch {}
};

// ── PARTICLES ─────────────────────────────────────────────────────────────────
// Disabled on mobile (< 768px) to protect TBT / Lighthouse score
const IS_MOBILE = typeof window !== "undefined" && window.innerWidth < 768;

function ParticleCanvas() { return null; }
function OrbBg() { return <div className="study-ambient" aria-hidden="true" />; }

// ── CSS now in index.html (critical CSS inline for LCP) ──────────────────────


// ── TOAST SYSTEM ─────────────────────────────────────────────────────────────
let _toastListeners = [];
const toast = {
  _emit(msg) { _toastListeners.forEach(fn => fn(msg)); },
  success(text, duration = 3000) { this._emit({ id: Date.now(), text, type: "success", duration }); },
  error(text, duration = 4000)   { this._emit({ id: Date.now(), text, type: "error",   duration }); },
  info(text, duration = 3000)    { this._emit({ id: Date.now(), text, type: "info",    duration }); },
};

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handler = (msg) => {
      setToasts(prev => [...prev, msg]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== msg.id)), msg.duration);
    };
    _toastListeners.push(handler);
    return () => { _toastListeners = _toastListeners.filter(fn => fn !== handler); };
  }, []);
  if (!toasts.length) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, maxWidth: 340 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === "success" ? "rgba(74,222,128,.12)" : t.type === "error" ? "rgba(248,113,113,.12)" : "rgba(226,201,126,.1)",
          border: `1px solid ${t.type === "success" ? "#2c806140" : t.type === "error" ? "#b8464640" : "rgba(226,201,126,.3)"}`,
          color: t.type === "success" ? "#2c8061" : t.type === "error" ? "#b84646" : "#a47b2e",
          padding: "12px 16px", fontSize: 13, fontFamily: "inherit",
          animation: "fsu .25s ease both", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "✗" : "◈"}</span>
          {t.text}
        </div>
      ))}
    </div>
  );
}

// ── ONBOARDING ────────────────────────────────────────────────────────────────
const ONBOARDING_STEPS = [
  { icon: "🎓", title: "Mode Diplôme", desc: "Choisissez une matière DCG ou DSCG et lancez un QCM, des flashcards ou un cas pratique — tout généré par IA en temps réel.", cta: "Suivant →" },
  { icon: "◈", title: "Vos fiches de révision", desc: "Chaque matière dispose d'un résumé de cours IA structuré avec points clés, pièges fréquents et conseil d'examinateur — inclus avec Pro.", cta: "Suivant →" },
  { icon: "💼", title: "Mode Carrière", desc: "Simulez un entretien d'embauche en finance/gestion avec un recruteur IA. Score, feedback détaillé et conseils personnalisés.", cta: "Suivant →" },
  { icon: "✦", title: "Pro pour aller plus loin", desc: `Débloquez les 13 matières, QCM illimités, cas pratiques, reprise des cartes difficiles et planning IA pour ${PRO_PRICE}/mois. Résiliation en 1 clic.`, cta: "Commencer →" },
];

function OnboardingModal({ onClose, onUpgrade }) {
  const [step, setStep] = useState(0);
  const s = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#ffffff", border: "1px solid rgba(226,201,126,.2)", padding: "32px 28px", maxWidth: 420, width: "100%", animation: "fsu .35s ease both", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>{s.icon}</div>
        <p style={{ fontSize: 10, letterSpacing: ".15em", color: "#a47b2e", margin: "0 0 8px" }}>ÉTAPE {step + 1} / {ONBOARDING_STEPS.length}</p>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#18233e", margin: "0 0 12px" }}>{s.title}</h2>
        <p style={{ fontSize: 13, color: "#64718b", lineHeight: 1.75, margin: "0 0 24px" }}>{s.desc}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
          {ONBOARDING_STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 20 : 6, height: 6, background: i === step ? "#a47b2e" : "#d9e0ec", borderRadius: 3, transition: "all .3s" }} />
          ))}
        </div>
        <button style={{ ...S.ctag, width: "100%", padding: 13 }}
          onClick={() => { if (isLast) { onClose(); if (step === ONBOARDING_STEPS.length - 1) {} } else setStep(s => s + 1); }}>
          {s.cta}
        </button>
        <button style={{ ...S.nl, fontSize: 11, marginTop: 12 }} onClick={onClose}>Passer l'introduction</button>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState(() => getScreenFromPath(window.location.pathname));
  const [authMode, setAuthMode] = useState(() => window.location.pathname === "/inscription" ? "signup" : "login");
  const [selectedUE, setSelectedUE] = useState(() => ALL_UES.find(ue => ue.id === new URLSearchParams(window.location.search).get("ue")) || null);
  const [interviewCfg, setInterviewCfg] = useState(null);
  const [result, setResult] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    let stopProfile = () => {}, generation = 0;
    const unsub = onAuthStateChanged(auth, async firebaseUser => {
      const current = ++generation;
      stopProfile();
      if (!firebaseUser) {
        setUser(null); setLoadingAuth(false);
        return;
      }
      try {
        const ref = await ensureProfile(firebaseUser);
        if (current !== generation) return;
        stopProfile = onSnapshot(ref, snapshot => {
          const data = snapshot.data() || {};
          setUser({ ...data, uid: firebaseUser.uid, name: data.name || firebaseUser.displayName || 'Étudiant', email: firebaseUser.email, isPro: resolveIsPro(data), interviewsUsed: (data.history || []).filter(h => h.type === 'entretien').length, streak: data.streak?.count || 0 });
          setLoadingAuth(false);
        }, () => { setLoadingAuth(false); toast.error('Impossible de charger les droits du compte. Réessayez.'); });
        if (['/', '/connexion', '/inscription'].includes(window.location.pathname)) { window.history.replaceState({}, '', '/interface'); setScreen('dashboard'); }
      } catch { setLoadingAuth(false); toast.error('Impossible de charger votre compte.'); }
    });
    return () => { generation++; stopProfile(); unsub(); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setUser(u => u ? { ...u, isPro: resolveIsPro(u) } : u), 60000);
    return () => clearInterval(timer);
  }, []);

  // Sync URL -> screen on browser back/forward
  useEffect(() => {
    const onPop = () => {
      const s = getScreenFromPath(window.location.pathname);
      setSelectedUE(ALL_UES.find(ue => ue.id === new URLSearchParams(window.location.search).get("ue")) || null);
      setScreen(s);
      if (s === "auth") setAuthMode(window.location.pathname === "/inscription" ? "signup" : "login");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const nav = (s, opts = {}) => {
    let url = SCREEN_TO_URL[s] || "/";
    if (s === "auth") url = (opts.mode === "signup") ? "/inscription" : "/connexion";
    if (["subject_hub", "qcm", "flashcards", "resume_cours", "cas_pratique"].includes(s) && selectedUE) url += `?ue=${selectedUE.id}`;
    window.history.pushState({}, "", url);
    setScreen(s);
  };

  const isPro = user?.isPro;
  const toAuth = (m) => { setAuthMode(m); nav("auth", { mode: m }); };

  const onInterviewDone = async (data) => {
    const entry = { ...data, type: "entretien", date: new Date().toLocaleString("fr-FR"), dateISO: new Date().toISOString() };
    if (user) { await saveHistory(user.uid, entry); const s = await updateStreak(user.uid); setUser(u => ({ ...u, interviewsUsed: (u.interviewsUsed || 0) + 1, streak: s })); }
    incrementStat("totalInterviews");
    toast.success("Entretien terminé ! Résultats disponibles.");
    setResult(entry); nav("results_interview");
  };
  const onQCMDone = async (data) => {
    const pct = Math.round(data.score / data.total * 100);
    const entry = { ...data, type: "qcm", date: new Date().toLocaleString("fr-FR"), dateISO: new Date().toISOString() };
    if (user) {
      await saveHistory(user.uid, entry);
      await saveMastery(user.uid, data.ue, pct);
      const s = await updateStreak(user.uid);
      setUser(u => ({ ...u, streak: s }));
    }
    incrementStat("totalQCMs");
    toast.success("QCM terminé ! Voir les résultats.");
    setResult(entry); nav("results_qcm");
  };
  const onCasDone = async (data) => {
    const entry = { ...data, type: "cas", date: new Date().toLocaleString("fr-FR"), dateISO: new Date().toISOString() };
    if (user) { await saveHistory(user.uid, entry); const s = await updateStreak(user.uid); setUser(u => ({ ...u, streak: s })); }
    toast.success("Cas pratique rendu ! Correction en cours…");
    setResult(entry); nav("results_cas");
  };

  if (loadingAuth) return <div className="app-loading"><span className="brand-mark">S</span><p>Préparation de votre espace…</p></div>;
  const publicScreens = ['landing', 'pricing', 'testimonials', 'auth', 'cgu', 'confidentialite', 'forgot_password', 'features', 'dcg', 'dscg', 'resources', 'support'];
  const privateScreen = !publicScreens.includes(screen);
  const selectUE = ue => { setSelectedUE(ue); window.history.pushState({}, '', `/matiere?ue=${ue.id}`); setScreen('subject_hub'); };
  const logout = () => { signOut(auth); setUser(null); nav('landing'); };
  const renderScreen = () => {
    if (privateScreen && !user) return <Auth mode="login" setMode={setAuthMode} onDone={u => { setUser(u); nav(screen); }} onBack={() => nav('landing')} />;
    if (['subject_hub', 'qcm', 'flashcards', 'resume_cours', 'cas_pratique'].includes(screen) && !selectedUE) return <LibraryPage ues={ALL_UES} user={user} onSelect={selectUE} />;
    if (['qcm', 'flashcards', 'resume_cours', 'cas_pratique', 'interview', 'interview_config', 'tutor'].includes(screen) && !isPro) return <Paywall onUpgrade={() => upgrade()} onBack={() => nav('dashboard')} />;
    if (screen === 'interview' && !interviewCfg) return <InterviewConfig user={user} onStart={cfg => { setInterviewCfg(cfg); nav('interview'); }} onBack={() => nav('dashboard')} />;
    if (screen.startsWith('results_') && !result) return <History user={user} onBack={() => nav('dashboard')} />;
    if (screen === 'landing') return <Marketing onAuth={toAuth} onNav={nav} ues={ALL_UES} />;
    if (screen === 'pricing') return <OfferPage user={user} onCheckout={upgrade} onNav={nav} />;
    if (['features', 'dcg', 'dscg', 'resources', 'support'].includes(screen)) return <PublicInfo page={screen} onNav={nav} onAuth={toAuth} ues={ALL_UES} />;
    if (screen === 'testimonials') return <StudentReviews load={loadTestimonials} onNav={nav} />;
    if (screen === 'auth') return <Auth mode={authMode} setMode={setAuthMode} onDone={u => { setUser(u); if (u.isNew) setShowOnboarding(true); const plan = sessionStorage.getItem('simdcg-plan'); sessionStorage.removeItem('simdcg-plan'); nav('dashboard'); if (plan) upgrade(plan); }} onBack={() => nav('landing')} />;
    if (screen === 'dashboard') return <StudentHome user={user} ues={ALL_UES} onNav={nav} onSelect={selectUE} />;
    if (screen === 'library') return <LibraryPage ues={ALL_UES} user={user} onSelect={selectUE} />;
    if (screen === 'subject_hub') return <CourseHome ue={selectedUE} user={user} onNav={nav} />;
    if (screen === 'account') return <AccountPage user={user} onNav={nav} onCheckout={upgrade} request={billingRequest} />;
    if (screen === 'tutor') return <TutorPage ues={ALL_UES} call={callClaude} user={user} />;
    if (screen === 'qcm') return <QCMScreen ue={selectedUE} user={user} onDone={onQCMDone} onBack={() => nav('subject_hub')} />;
    if (screen === 'flashcards') return <FlashcardsScreen ue={selectedUE} user={user} onBack={() => nav('subject_hub')} onUpgrade={() => upgrade()} />;
    if (screen === 'resume_cours') return <ResumeCoursScreen ue={selectedUE} user={user} onBack={() => nav('subject_hub')} />;
    if (screen === 'cas_pratique') return <CasPratiqueScreen ue={selectedUE} user={user} onDone={onCasDone} onBack={() => nav('subject_hub')} />;
    if (screen === 'planning') return <PlanningScreen user={user} onBack={() => nav('dashboard')} onUpgrade={() => upgrade()} />;
    if (screen === 'interview_config') return <InterviewConfig user={user} onStart={cfg => { setInterviewCfg(cfg); nav('interview'); }} onBack={() => nav('dashboard')} />;
    if (screen === 'interview') return <InterviewScreen cfg={interviewCfg} onDone={onInterviewDone} />;
    if (screen === 'results_interview') return <ResultsInterview data={result} onNew={() => nav('interview_config')} onDash={() => nav('dashboard')} />;
    if (screen === 'results_qcm') return <ResultsQCM data={result} onNew={() => nav('qcm')} onDash={() => nav('subject_hub')} />;
    if (screen === 'results_cas') return <ResultsCas data={result} onNew={() => nav('cas_pratique')} onDash={() => nav('subject_hub')} />;
    if (screen === 'paywall') return <Paywall onUpgrade={() => upgrade()} onBack={() => nav('dashboard')} />;
    if (screen === 'history') return <History user={user} onBack={() => nav('dashboard')} />;
    if (screen === 'progress') return <LearningProgress user={user} ues={ALL_UES} onNav={nav} />;
    if (screen === 'forgot_password') return <ForgotPasswordScreen onBack={() => toAuth('login')} />;
    if (screen === 'cgu' || screen === 'confidentialite') return <LegalScreen type={screen} onBack={() => nav('landing')} />;
    return null;
  };
  return <><ToastContainer />{showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} onUpgrade={() => upgrade()} />}{privateScreen && user ? <ProductShell screen={screen} user={user} onNav={nav} onLogout={logout}>{renderScreen()}</ProductShell> : renderScreen()}</>;
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function Auth({ mode, setMode, onDone, onBack }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!email || !pass || (mode === "signup" && !name)) { setErr("Tous les champs sont requis."); return; }
    if (pass.length < 6) { setErr("Mot de passe : 6 caractères minimum."); return; }
    setLoading(true); setErr("");
    try {
      let cred;
      if (mode === "signup") {
        cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), pass);
        const ref = doc(db, "users", cred.user.uid);
        await ensureProfile(cred.user, name);
        incrementStat("totalUsers");
      } else {
        cred = await signInWithEmailAndPassword(auth, email, pass);
      }
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const data = snap.exists() ? snap.data() : {};
      const streak = await loadStreak(cred.user.uid);
      const hist = (data.history || []).filter(h => h.type === "entretien");
      const isNew = mode === "signup";
      onDone({ uid: cred.user.uid, name: data.name || name || email.split("@")[0], email, isPro: resolveIsPro(data), proType: data.proType || null, proExpiresAt: data.proExpiresAt || null, interviewsUsed: hist.length, streak, isNew });
    } catch (e) {
      const msgs = { "auth/email-already-in-use": "Email déjà utilisé.", "auth/user-not-found": "Compte introuvable.", "auth/wrong-password": "Mot de passe incorrect.", "auth/invalid-credential": "Email ou mot de passe incorrect." };
      setErr(msgs[e.code] || "Erreur. Réessayez.");
    }
    setLoading(false);
  };
  const googleSignIn = async () => {
    setLoading(true); setErr("");
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const ref = doc(db, "users", cred.user.uid);
      const snap = await getDoc(ref);
      const isNew = !snap.exists();
      if (isNew) {
        await ensureProfile(cred.user);
        incrementStat("totalUsers");
      }
      const data = snap.exists() ? snap.data() : {};
      const streak = await loadStreak(cred.user.uid);
      const hist = (data.history || []).filter(h => h.type === "entretien");
      onDone({ uid: cred.user.uid, name: data.name || cred.user.displayName || cred.user.email.split("@")[0], email: cred.user.email, isPro: resolveIsPro(data), proType: data.proType || null, proExpiresAt: data.proExpiresAt || null, interviewsUsed: hist.length, streak, isNew });
    } catch (e) { setErr("Erreur Google. Réessayez."); }
    setLoading(false);
  };
  return (
    <div className="auth-layout"><aside className="auth-story"><Brand /><span className="eyebrow">VOTRE PROCHAIN DÉCLIC COMMENCE ICI</span><h1>Un espace clair.<br /><span>Un cap pour vos révisions.</span></h1><p>Comptabilité, droit, finance : retrouvez vos matières et avancez une notion à la fois.</p><small>QCM · Flashcards · Fiches · Tuteur IA</small></aside><section className="auth-form-panel">
      <div style={{ maxWidth: 400, margin: "0 auto", padding: "60px 24px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 12, animation: "fsu .5s ease both" }}>
        <button style={S.back} onClick={onBack}>← Accueil</button>
        <Logo />
        <h2 style={{ fontSize: 22, margin: "12px 0 4px", color: "#18233e" }}>{mode === "signup" ? "Créer un compte" : "Se connecter"}</h2>
        <p style={{ fontSize: 13, color: "#64718b", marginBottom: 12 }}>{mode === "signup" ? "Créez votre compte. Choisissez votre plan après." : "Bon retour."}</p>
        <button style={{ background: "#ffffff", border: "1px solid #d9e0ec", color: "#18233e", padding: "11px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} onClick={googleSignIn} disabled={loading}>
          <span style={{ fontSize: 16 }}>G</span> Continuer avec Google
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ flex: 1, height: 1, background: "#d9e0ec" }} /><span style={{ fontSize: 10, color: "#64718b" }}>ou</span><div style={{ flex: 1, height: 1, background: "#d9e0ec" }} /></div>
        {mode === "signup" && <FInput label="Prénom" value={name} set={setName} ph="Jean-Baptiste" />}
        <FInput label="Email" value={email} set={setEmail} ph="jean@exemple.fr" type="email" />
        <FInput label="Mot de passe" value={pass} set={setPass} ph="••••••••" type="password" />
        {err && <p style={{ fontSize: 12, color: "#b84646" }}>{err}</p>}
        <button style={{ ...S.ctag, width: "100%", opacity: loading ? .6 : 1, marginTop: 4 }} onClick={submit} disabled={loading}>
          {loading ? <Spinner /> : mode === "signup" ? "Créer mon compte →" : "Se connecter →"}
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 12, color: "#64718b" }}>
            {mode === "signup" ? "Déjà un compte ? " : "Pas encore ? "}
            <span style={{ color: "#a47b2e", cursor: "pointer" }} onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setErr(""); }}>
              {mode === "signup" ? "Se connecter" : "S'inscrire"}
            </span>
          </p>
          {mode === "login" && (
            <a href="/mot-de-passe-oublie" onClick={e => { e.preventDefault(); window.history.pushState({}, "", "/mot-de-passe-oublie"); window.dispatchEvent(new PopStateEvent("popstate")); }}
              style={{ fontSize: 11, color: "#64718b", cursor: "pointer", textDecoration: "none" }}>
              Mot de passe oublié ?
            </a>
          )}
        </div>
      </div>
    </section></div>
  );
}

// ── QCM SCREEN ────────────────────────────────────────────────────────────────
function QCMScreen({ ue, user, onDone, onBack }) {
  const isPro = user?.isPro;
  const nQuestions = 10;
  const [questions, setQuestions] = useState(null);
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const gen = async () => {
      setLoading(true);
      try {
        const data = await callClaudeJSON(`Tu génères des QCM pour l'examen ${ue.label} (${ue.level}). Réponds UNIQUEMENT en JSON valide.`, QCM_PROMPT(ue, nQuestions), 2500);
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0 && data.every(q => typeof q.q === "string" && Array.isArray(q.options) && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length)) { setQuestions(data); timerRef.current = setInterval(() => setTimer(t => t + 1), 1000); }
        else setError(true);
      } catch { setError(true); } finally { setLoading(false); }
    };
    gen();
    return () => { cancelled = true; clearInterval(timerRef.current); };
  }, []);

  if (!ue) return null;
  const q = questions?.[qi];
  const pick = (i) => {
    if (sel !== null) return;
    setSel(i);
    if (i === q.answer) setScore(s => s + 1);
    setAnswers(a => [...a, { q: q.q, correct: i === q.answer, right: q.options[q.answer], expl: q.expl, difficulte: q.difficulte }]);
  };
  const next = () => {
    if (qi + 1 >= questions.length) { clearInterval(timerRef.current); onDone({ ue: ue.id, ueName: ue.label, score, total: questions.length, duration: timer, answers }); }
    else { setQi(i => i + 1); setSel(null); }
  };

  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}>
        <Logo />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: ue.color, border: `1px solid ${ue.color}30`, padding: "3px 8px" }}>{ue.id}</span>
          {questions && <span style={{ fontSize: 12, color: "#a47b2e", fontVariantNumeric: "tabular-nums" }}>{fmt(timer)}</span>}
          {questions && <span style={{ fontSize: 11, color: "#64718b" }}>{qi + 1}/{questions.length}</span>}
          <button style={S.nl} onClick={onBack}>Quitter</button>
        </div>
      </nav>

      {questions && <div style={{ height: 2, background: "#ffffff" }}><div style={{ height: "100%", width: `${((qi + (sel !== null ? 1 : 0)) / questions.length) * 100}%`, background: `linear-gradient(90deg,${ue.color},#a47b2e)`, transition: "width .3s" }} /></div>}

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1 }}>
        {loading && <div style={{ textAlign: "center", padding: "80px 24px" }}><div style={{ width: 40, height: 40, border: "3px solid #d9e0ec", borderTop: `3px solid ${ue.color}`, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 20px" }} /><p style={{ color: "#64718b", fontSize: 13 }}>Génération des questions par IA…</p></div>}
        {error && <div style={{ textAlign: "center", padding: 40 }}><p style={{ color: "#b84646" }}>Erreur lors de la génération.</p><button style={S.ctag} onClick={onBack}>Retour</button></div>}
        {!loading && !error && q && (
          <div style={{ animation: "fsu .3s ease both" }}>
            <div style={{ ...S.card, marginBottom: 14, borderColor: `${ue.color}15` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <p style={{ fontSize: 10, color: ue.color, letterSpacing: ".1em", margin: 0 }}>QUESTION {qi + 1}</p>
                {q.difficulte && <span style={{ fontSize: 9, padding: "2px 8px", border: `1px solid ${q.difficulte === "Difficile" ? "#b84646" : q.difficulte === "Moyen" ? "#996724" : "#2c8061"}40`, color: q.difficulte === "Difficile" ? "#b84646" : q.difficulte === "Moyen" ? "#996724" : "#2c8061" }}>{q.difficulte}</span>}
              </div>
              <p style={{ fontSize: 15, color: "#18233e", lineHeight: 1.6, margin: 0, fontWeight: 600 }}>{q.q}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {q.options?.map((opt, i) => {
                let bg = "#ffffff", border = "#e4e8f1", color = "#63728c";
                if (sel !== null) { if (i === q.answer) { bg = `${ue.color}10`; border = ue.color; color = ue.color; } else if (i === sel && i !== q.answer) { bg = "#b8464610"; border = "#b84646"; color = "#b84646"; } }
                return <button key={i} onClick={() => pick(i)} style={{ background: bg, border: `1px solid ${border}`, color, padding: "12px 16px", textAlign: "left", cursor: sel === null ? "pointer" : "default", fontSize: 13, transition: "all .2s", fontFamily: "inherit" }}>{String.fromCharCode(65 + i)}. {opt}</button>;
              })}
            </div>
            {sel !== null && <div style={{ background: "#ffffff", border: "1px solid #d9e0ec", padding: "12px 16px", marginBottom: 14 }}><p style={{ fontSize: 10, color: "#64718b", margin: "0 0 4px", letterSpacing: ".1em" }}>EXPLICATION</p><p style={{ fontSize: 13, color: "#36425b", margin: 0, lineHeight: 1.6 }}>{q.expl}</p></div>}
            {sel !== null && <button style={{ ...S.ctag, width: "100%", padding: 13 }} onClick={next}>{qi + 1 >= questions.length ? "Voir les résultats →" : "Question suivante →"}</button>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── FLASHCARDS ────────────────────────────────────────────────────────────────
function FlashcardsScreen({ ue, user, onBack, onUpgrade }) {
  const isPro = user?.isPro;
  const nCards = PRO_FLASH_PER_UE;
  const [cards, setCards] = useState(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");
  const [difficult, setDifficult] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [reviewFlipped, setReviewFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => {
    callClaudeJSON(`Tu génères des flashcards pour ${ue.label} (${ue.level}). Réponds UNIQUEMENT en JSON valide.`, FLASHCARD_PROMPT(ue, nCards), 2000)
      .then(data => { setCards(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  if (!ue) return null;
  const tags = cards ? ["Tous", ...new Set(cards.map(c => c.tag))] : [];
  const filtered = cards ? (filter === "Tous" ? cards : cards.filter(c => c.tag === filter)) : [];
  const card = filtered[idx % Math.max(filtered.length, 1)];
  const isLast = idx >= filtered.length - 1;

  const markKnown = () => { setFlipped(false); if (isLast) { setSessionDone(true); } else { setTimeout(() => setIdx(i => i + 1), 150); } };
  const markDifficult = () => {
    setDifficult(d => [...d, card]);
    setFlipped(false);
    if (isLast) { setSessionDone(true); }
    else { setTimeout(() => setIdx(i => i + 1), 150); }
  };
  const next = () => { setFlipped(false); setTimeout(() => setIdx(i => (i + 1) % filtered.length), 150); };
  const prev = () => { setFlipped(false); setTimeout(() => setIdx(i => (i - 1 + filtered.length) % filtered.length), 150); };

  // Review mode (Pro)
  if (reviewMode && difficult.length > 0) {
    const rCard = difficult[reviewIdx];
    return (
      <div style={S.root}><OrbBg />
        <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← {ue.id}</button></nav>
        <div style={{ maxWidth: 580, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1, animation: "fsu .4s ease both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, margin: 0, color: "#b84646" }}>◈ Révision des cartes difficiles</h2>
            <span style={{ fontSize: 12, color: "#64718b" }}>{reviewIdx + 1} / {difficult.length}</span>
          </div>
          <div style={{ perspective: 1200, marginBottom: 20, cursor: "pointer" }} role="button" tabIndex={0} aria-label="Retourner la flashcard" onKeyDown={e => { if (["Enter", " "].includes(e.key)) { e.preventDefault(); setReviewFlipped(f => !f); } }} onClick={() => setReviewFlipped(f => !f)}>
            <div style={{ position: "relative", transformStyle: "preserve-3d", transition: "transform .55s cubic-bezier(.4,0,.2,1)", transform: reviewFlipped ? "rotateY(180deg)" : "rotateY(0)", height: 220 }}>
              <div style={{ ...S.card, backfaceVisibility: "hidden", position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", borderColor: "#b8464625" }}>
                <p style={{ fontSize: 10, color: "#b84646", letterSpacing: ".12em", margin: "0 0 14px" }}>{rCard?.tag || ue.short} · À REVOIR</p>
                <p style={{ fontSize: 15, color: "#18233e", lineHeight: 1.6, margin: "0 0 16px", fontWeight: 600 }}>{rCard?.q}</p>
                <p style={{ fontSize: 11, color: "#64718b" }}>Cliquer pour révéler →</p>
              </div>
              <div style={{ ...S.card, backfaceVisibility: "hidden", position: "absolute", inset: 0, transform: "rotateY(180deg)", borderColor: "#2c806130", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <p style={{ fontSize: 10, color: "#2c8061", letterSpacing: ".12em", margin: "0 0 14px" }}>RÉPONSE</p>
                <p style={{ fontSize: 13, color: "#36425b", lineHeight: 1.7, margin: 0 }}>{rCard?.a}</p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {reviewIdx > 0 && <button style={{ ...S.ctagh, flex: 1 }} onClick={() => { setReviewFlipped(false); setReviewIdx(i => i - 1); }}>← Précédente</button>}
            {reviewIdx < difficult.length - 1
              ? <button style={{ ...S.ctag, flex: 1 }} onClick={() => { setReviewFlipped(false); setReviewIdx(i => i + 1); }}>Suivante →</button>
              : <button style={{ ...S.ctag, flex: 1 }} onClick={onBack}>Terminer ✓</button>
            }
          </div>
        </div>
      </div>
    );
  }

  // Session done screen
  if (sessionDone) {
    return (
      <div style={S.root}><OrbBg />
        <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← {ue.id}</button></nav>
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "80px 24px", textAlign: "center", position: "relative", zIndex: 1, animation: "fsu .5s ease both", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 40 }}>◈</span>
          <h2 style={{ fontSize: 22, color: "#18233e" }}>Session terminée</h2>
          <p style={{ fontSize: 14, color: "#64718b" }}>{filtered.length} cartes révisées · {difficult.length} marquées difficiles</p>
          {difficult.length > 0 && (
            isPro ? (
              <button style={{ ...S.ctag, width: "100%", padding: 13 }} onClick={() => { setReviewMode(true); setReviewIdx(0); }}>
                Réviser les {difficult.length} cartes difficiles →
              </button>
            ) : (
              <div style={{ background: "rgba(226,201,126,.04)", border: "1px solid rgba(226,201,126,.2)", padding: "16px 20px", width: "100%" }}>
                <p style={{ fontSize: 13, color: "#18233e", margin: "0 0 8px", fontWeight: 700 }}>✦ Cartes difficiles — Pro</p>
                <p style={{ fontSize: 12, color: "#64718b", margin: "0 0 12px" }}>Passez Pro pour revoir automatiquement vos {difficult.length} cartes difficiles et consolider votre mémoire.</p>
                <button style={{ ...S.ctag, width: "100%", padding: 10, fontSize: 12 }} onClick={onUpgrade}>Passer Pro — {PRO_PRICE}/mois →</button>
              </div>
            )
          )}
          <button style={{ ...S.ctagh, width: "100%" }} onClick={onBack}>← Retour à la matière</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← {ue.id}</button></nav>
      <div style={{ maxWidth: 580, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1, animation: "fsu .4s ease both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, margin: 0, color: "#18233e" }}>◈ Flashcards — {ue.short}</h2>
          {cards && <span style={{ fontSize: 12, color: "#64718b" }}>{idx + 1} / {filtered.length}</span>}
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}><div style={{ width: 36, height: 36, border: "3px solid #d9e0ec", borderTop: `3px solid ${ue.color}`, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} /><p style={{ color: "#64718b", fontSize: 13 }}>Génération des flashcards…</p></div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {tags.map(t => <button key={t} style={{ ...S.fb, ...(filter === t ? S.fa : {}) }} onClick={() => { setFilter(t); setIdx(0); setFlipped(false); }}>{t}</button>)}
            </div>
            {card && (
              <>
                <div style={{ perspective: 1200, marginBottom: 16, cursor: "pointer" }} role="button" tabIndex={0} aria-label="Retourner la flashcard" onKeyDown={e => { if (["Enter", " "].includes(e.key)) { e.preventDefault(); setFlipped(f => !f); } }} onClick={() => setFlipped(f => !f)}>
                  <div style={{ position: "relative", transformStyle: "preserve-3d", transition: "transform .55s cubic-bezier(.4,0,.2,1)", transform: flipped ? "rotateY(180deg)" : "rotateY(0)", height: 220 }}>
                    <div style={{ ...S.card, backfaceVisibility: "hidden", position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", borderColor: `${ue.color}15` }}>
                      <p style={{ fontSize: 10, color: ue.color, letterSpacing: ".12em", margin: "0 0 14px" }}>{card.tag || ue.short}</p>
                      <p style={{ fontSize: 15, color: "#18233e", lineHeight: 1.6, margin: "0 0 16px", fontWeight: 600 }}>{card.q}</p>
                      <p style={{ fontSize: 11, color: "#64718b" }}>Cliquer pour révéler →</p>
                    </div>
                    <div style={{ ...S.card, backfaceVisibility: "hidden", position: "absolute", inset: 0, transform: "rotateY(180deg)", borderColor: "#2c806130", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <p style={{ fontSize: 10, color: "#2c8061", letterSpacing: ".12em", margin: "0 0 14px" }}>RÉPONSE</p>
                      <p style={{ fontSize: 13, color: "#36425b", lineHeight: 1.7, margin: 0 }}>{card.a}</p>
                    </div>
                  </div>
                </div>
                {flipped ? (
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <button style={{ flex: 1, background: "#b8464612", border: "1px solid #b8464640", color: "#b84646", padding: "12px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }} onClick={markDifficult}>✗ À revoir</button>
                    <button style={{ flex: 1, background: "#2c806112", border: "1px solid #2c806140", color: "#2c8061", padding: "12px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }} onClick={markKnown}>✓ Je savais</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={{ ...S.ctagh, flex: 1 }} onClick={prev}>← Précédente</button>
                    <button style={{ ...S.ctag, flex: 1 }} onClick={next}>Suivante →</button>
                  </div>
                )}
                {isPro && difficult.length > 0 && <p style={{ fontSize: 11, color: "#b84646", textAlign: "center" }}>{difficult.length} carte{difficult.length > 1 ? "s" : ""} marquée{difficult.length > 1 ? "s" : ""} difficile{difficult.length > 1 ? "s" : ""}</p>}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── RÉSUMÉ DE COURS ───────────────────────────────────────────────────────────
function ResumeCoursScreen({ ue, user, onBack }) {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState(0);

  useEffect(() => {
    const gen = async () => {
      setLoading(true);
      try {
        const data = await callClaudeJSON(
          `Tu es un professeur expert en ${ue.label} (${ue.level}). Réponds UNIQUEMENT en JSON valide, sois bref.`,
          RESUME_PROMPT(ue),
          1800
        );
        setResume(data);
      } catch { setResume(null); } finally { setLoading(false); }
    };
    gen();
  }, []);

  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}>
        <Logo />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#7658a9", border: "1px solid #7658a930", padding: "3px 8px" }}>📖 RÉSUMÉ</span>
          <button style={S.nl} onClick={onBack}>← {ue.id}</button>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, animation: "fsu .4s ease both" }}>
          <div style={{ width: 48, height: 48, background: `${ue.color}15`, border: `1px solid ${ue.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{ue.icon}</div>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
              <span style={{ ...S.badge, fontSize: 9, padding: "2px 8px" }}>{ue.level}</span>
              <span style={{ fontSize: 10, color: "#2c8061", border: "1px solid #2c806130", padding: "2px 8px" }}>PRO</span>
            </div>
            <h2 style={{ fontSize: 19, margin: 0, color: "#18233e" }}>{ue.label}</h2>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #d9e0ec", borderTop: "3px solid #7658a9", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 20px" }} />
            <p style={{ color: "#64718b", fontSize: 13 }}>Génération du résumé par IA…</p>
          </div>
        )}

        {!loading && resume && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fsu .4s ease both" }}>
            {/* Sections accordion */}
            {resume.sections?.map((sec, i) => (
              <div key={i} style={{ background: "#ffffff", border: `1px solid ${openSection === i ? "#7658a930" : "#e9edf5"}`, transition: "border-color .2s" }}>
                <button onClick={() => setOpenSection(openSection === i ? -1 : i)}
                  style={{ width: "100%", background: "none", border: "none", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontFamily: "inherit" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: openSection === i ? "#7658a9" : "#18233e" }}>{sec.titre}</span>
                  <span style={{ color: "#64718b", fontSize: 12 }}>{openSection === i ? "▲" : "▼"}</span>
                </button>
                {openSection === i && (
                  <div style={{ padding: "0 18px 16px", display: "flex", flexDirection: "column", gap: 7, animation: "fsu .2s ease both" }}>
                    {sec.points?.map((pt, j) => (
                      <p key={j} style={{ fontSize: 13, color: "#36425b", margin: 0, lineHeight: 1.65, paddingLeft: 12, borderLeft: "2px solid #7658a930" }}>
                        {pt}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Points clés */}
            {resume.points_cles && (
              <div style={{ background: "rgba(96,165,250,.04)", border: "1px solid rgba(96,165,250,.15)", padding: "18px 20px" }}>
                <p style={{ fontSize: 10, letterSpacing: ".15em", color: "#376cac", margin: "0 0 12px" }}>✦ POINTS CLÉS À RETENIR</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {resume.points_cles.map((pt, i) => (
                    <p key={i} style={{ fontSize: 13, color: "#36425b", margin: 0, lineHeight: 1.6, display: "flex", gap: 10 }}>
                      <span style={{ color: "#376cac", flexShrink: 0 }}>→</span>{pt}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Pièges fréquents */}
            {resume.pieges_frequents && (
              <div style={{ background: "rgba(248,113,113,.04)", border: "1px solid rgba(248,113,113,.15)", padding: "18px 20px" }}>
                <p style={{ fontSize: 10, letterSpacing: ".15em", color: "#b84646", margin: "0 0 12px" }}>⚠ PIÈGES FRÉQUENTS À L'EXAMEN</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {resume.pieges_frequents.map((p, i) => (
                    <p key={i} style={{ fontSize: 13, color: "#36425b", margin: 0, lineHeight: 1.6, display: "flex", gap: 10 }}>
                      <span style={{ color: "#b84646", flexShrink: 0 }}>✗</span>{p}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Conseil examen */}
            {resume.conseil_exam && (
              <div style={{ background: "rgba(226,201,126,.04)", border: "1px solid rgba(226,201,126,.2)", padding: "16px 20px" }}>
                <p style={{ fontSize: 10, letterSpacing: ".15em", color: "#a47b2e", margin: "0 0 8px" }}>◈ CONSEIL EXAMINATEUR</p>
                <p style={{ fontSize: 13, color: "#36425b", margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>{resume.conseil_exam}</p>
              </div>
            )}

            <button style={{ ...S.ctag, width: "100%", padding: 13, marginTop: 4 }} onClick={onBack}>← Retour à la matière</button>
          </div>
        )}

        {!loading && !resume && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: "#b84646" }}>Erreur de génération.</p>
            <button style={S.ctag} onClick={onBack}>Retour</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PLANNING ──────────────────────────────────────────────────────────────────
function PlanningScreen({ user, onBack, onUpgrade }) {
  const isPro = user?.isPro;
  const [weeks, setWeeks] = useState(6);
  const [level, setLevel] = useState("DCG");
  const [planning, setPlanning] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setPlanning(null);
    const subjects = level === "DCG"
      ? DCG_UES.map(u => u.id).join(", ")
      : [...DCG_UES, ...DSCG_UES].map(u => u.id).join(", ");
    const data = await callClaudeJSON(
      `Tu es un coach expert DCG/DSCG. Réponds UNIQUEMENT en JSON valide.`,
      PLANNING_PROMPT(weeks, level, subjects),
      3500
    );
    setPlanning(data);
    if (data) toast.success("Planning généré avec succès !");
    setLoading(false);
  };

  if (!isPro) {
    return (
      <div style={S.root}><OrbBg />
        <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Dashboard</button></nav>
        <div style={{ maxWidth: 460, margin: "0 auto", padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center", position: "relative", zIndex: 1, animation: "fsu .5s ease both" }}>
          <span style={{ fontSize: 40 }}>◈</span>
          <h2 style={{ fontSize: 22, margin: 0, color: "#18233e" }}>Planning de révision IA</h2>
          <p style={{ fontSize: 14, color: "#64718b", lineHeight: 1.7 }}>Générez un planning personnalisé sur 2 à 12 semaines, avec objectifs hebdomadaires et conseils adaptés à votre niveau.</p>
          <div style={{ ...S.pc, ...S.phl, width: "100%" }}>
            <div style={S.pb}>PRO REQUIS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, margin: "20px 0" }}>
              {["Planning sur 2 à 12 semaines", "Objectifs hebdomadaires précis", "Répartition intelligente par UE", "Conseils personnalisés semaine par semaine"].map(f => <p key={f} style={{ fontSize: 12, color: "#36425b", margin: 0 }}>✓ {f}</p>)}
            </div>
            <button style={{ ...S.ctag, width: "100%", padding: 13 }} onClick={onUpgrade}>Passer Pro — {PRO_PRICE}/mois →</button>
          </div>
          <button style={S.back} onClick={onBack}>← Retour</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Dashboard</button></nav>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, animation: "fsu .4s ease both" }}>
          <div>
            <h2 style={{ fontSize: 20, margin: "0 0 4px", color: "#18233e" }}>◈ Planning de révision IA</h2>
            <p style={{ fontSize: 13, color: "#64718b", margin: 0 }}>Générez un programme sur-mesure pour votre préparation.</p>
          </div>
        </div>

        {!planning && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fsu .4s ease both" }}>
            <Sect label="Niveau de préparation">
              <div style={{ display: "flex", gap: 10 }}>
                <OB active={level === "DCG"} color="#376cac" onClick={() => setLevel("DCG")} main="DCG" sub="8 matières" />
                <OB active={level === "DCG+DSCG"} color="#7658a9" onClick={() => setLevel("DCG+DSCG")} main="DCG + DSCG" sub="13 matières" />
              </div>
            </Sect>
            <Sect label="Durée du planning">
              <div className="m-col2" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {[2, 4, 6, 8, 10, 12].map(w => (
                  <OB key={w} active={weeks === w} color="#a47b2e" onClick={() => setWeeks(w)} main={`${w} sem.`} sub={w <= 4 ? "Sprint" : w <= 8 ? "Standard" : "Long terme"} />
                ))}
              </div>
            </Sect>
            <button style={{ ...S.ctag, padding: 15, fontSize: 14, animation: "glow 3s ease-in-out infinite" }} onClick={generate}>
              Générer mon planning →
            </button>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #d9e0ec", borderTop: "3px solid #a47b2e", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 20px" }} />
            <p style={{ color: "#64718b", fontSize: 13 }}>Génération du planning en cours…</p>
          </div>
        )}

        {planning && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fsu .4s ease both" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
              {planning.rythme_conseille && <span style={{ fontSize: 11, color: "#a47b2e", border: "1px solid rgba(226,201,126,.2)", padding: "4px 12px" }}>⏱ {planning.rythme_conseille}</span>}
              <span style={{ fontSize: 11, color: "#376cac", border: "1px solid rgba(96,165,250,.2)", padding: "4px 12px" }}>{level} · {weeks} semaines</span>
            </div>

            {planning.conseil_global && (
              <div style={{ background: "rgba(226,201,126,.04)", border: "1px solid rgba(226,201,126,.15)", padding: "14px 18px" }}>
                <p style={{ fontSize: 10, letterSpacing: ".15em", color: "#a47b2e", margin: "0 0 6px" }}>◈ STRATÉGIE GLOBALE</p>
                <p style={{ fontSize: 13, color: "#36425b", margin: 0, lineHeight: 1.7 }}>{planning.conseil_global}</p>
              </div>
            )}

            <div style={{ position: "relative" }}>
              {/* Ligne verticale */}
              <div style={{ position: "absolute", left: 18, top: 0, bottom: 0, width: 1, background: "#d9e0ec", zIndex: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {planning.semaines?.map((sem, i) => (
                  <div key={i} style={{ display: "flex", gap: 0, animation: `fsu .3s ${i * .06}s both` }}>
                    <div style={{ width: 37, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 18 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#a47b2e", border: "2px solid #f7f8fc", zIndex: 1, flexShrink: 0 }} />
                    </div>
                    <div style={{ flex: 1, background: "#ffffff", border: "1px solid #e9edf5", padding: "14px 16px", marginBottom: 8, marginLeft: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#a47b2e" }}>Semaine {sem.num}</span>
                        <span style={{ fontSize: 10, color: "#64718b", background: "#e9edf5", padding: "2px 8px" }}>{sem.ues?.join(", ")}</span>
                      </div>
                      <p style={{ fontSize: 13, color: "#18233e", fontWeight: 700, margin: "0 0 8px" }}>{sem.focus}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: sem.conseil ? 10 : 0 }}>
                        {sem.objectifs?.map((obj, j) => (
                          <p key={j} style={{ fontSize: 12, color: "#64718b", margin: 0, display: "flex", gap: 8 }}>
                            <span style={{ color: "#2c8061", flexShrink: 0 }}>→</span>{obj}
                          </p>
                        ))}
                      </div>
                      {sem.conseil && (
                        <p style={{ fontSize: 11, color: "#64718b", margin: 0, paddingTop: 8, borderTop: "1px solid #e9edf5", fontStyle: "italic" }}>
                          💡 {sem.conseil}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button style={{ ...S.ctagh, flex: 1 }} onClick={() => { setPlanning(null); }}>← Modifier</button>
              <button style={{ ...S.ctag, flex: 1 }} onClick={generate}>↺ Regénérer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CAS PRATIQUE ──────────────────────────────────────────────────────────────
function CasPratiqueScreen({ ue, user, onDone, onBack }) {
  const [cas, setCas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [reponse, setReponse] = useState("");
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const gen = async () => {
      try {
        const data = await callClaudeJSON(`Tu génères des cas pratiques style examen DCG/DSCG. Réponds UNIQUEMENT en JSON valide.`, CAS_PROMPT(ue), 1500);
        if (data) { setCas({ ...data, ue: ue.id, ueName: ue.label, level: ue.level }); timerRef.current = setInterval(() => setTimer(t => t + 1), 1000); }
      } catch {} finally { setLoading(false); }
    };
    gen();
    return () => clearInterval(timerRef.current);
  }, []);

  const submit = async () => {
    if (!reponse.trim() || evaluating) return;
    clearInterval(timerRef.current); setEvaluating(true);
    const eval_ = await callClaudeJSON(`Tu es un correcteur d'examen ${ue.label} (${ue.level}). Réponds UNIQUEMENT en JSON valide.`, CAS_EVAL_PROMPT(cas, reponse), 2000);
    onDone({ cas, reponse, evaluation: eval_, duration: timer, ue: ue.id, ueName: ue.label });
  };

  return (
    <div style={{ ...S.root, display: "flex", flexDirection: "column", minHeight: "100vh" }}><OrbBg />
      <nav style={S.nav}>
        <Logo />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {cas && <span style={{ fontSize: 12, color: "#a47b2e", fontVariantNumeric: "tabular-nums" }}>{fmt(timer)}</span>}
          <button style={S.nl} onClick={onBack}>Quitter</button>
        </div>
      </nav>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1, flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80 }}><div style={{ width: 40, height: 40, border: "3px solid #d9e0ec", borderTop: `3px solid ${ue.color}`, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 20px" }} /><p style={{ color: "#64718b", fontSize: 13 }}>Génération du cas pratique…</p></div>
        ) : cas ? (
          <div style={{ animation: "fsu .4s ease both" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
              <span style={{ ...S.badge, fontSize: 9 }}>{ue.level} · {ue.id}</span>
              <span style={{ fontSize: 11, color: "#64718b" }}>{cas.duree_estimee}</span>
              <span style={{ fontSize: 11, padding: "2px 8px", border: "1px solid #99672440", color: "#996724" }}>{cas.difficulte}</span>
            </div>
            <h2 style={{ fontSize: 18, color: "#18233e", margin: "0 0 16px" }}>{cas.titre}</h2>
            <div style={{ ...S.card, marginBottom: 20, borderColor: `${ue.color}15` }}>
              <p style={{ fontSize: 10, color: ue.color, letterSpacing: ".1em", margin: "0 0 10px" }}>CONTEXTE</p>
              <p style={{ fontSize: 13, color: "#36425b", lineHeight: 1.7, margin: 0 }}>{cas.contexte}</p>
            </div>
            <div style={{ ...S.card, marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: "#a47b2e", letterSpacing: ".1em", margin: "0 0 14px" }}>QUESTIONS ({cas.questions?.reduce((s, q) => s + q.points, 0)} points)</p>
              {cas.questions?.map(q => (
                <div key={q.num} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #e9edf5" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "#a47b2e", fontWeight: 700 }}>Question {q.num}</span>
                    <span style={{ fontSize: 10, color: "#64718b" }}>{q.points} pts</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#18233e", margin: 0, lineHeight: 1.6 }}>{q.enonce}</p>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: "#64718b", marginBottom: 8, letterSpacing: ".1em" }}>VOTRE RÉPONSE</p>
              <textarea value={reponse} onChange={e => setReponse(e.target.value)} placeholder="Répondez aux questions. Structurez votre réponse par numéro de question…" rows={12}
                style={{ width: "100%", background: "#ffffff", border: "1px solid #d9e0ec", color: "#18233e", padding: "14px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.65, boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#a47b2e40"} onBlur={e => e.target.style.borderColor = "#d9e0ec"} />
            </div>
            <button style={{ ...S.ctag, width: "100%", padding: 15, opacity: !reponse.trim() || evaluating ? .5 : 1 }} onClick={submit} disabled={!reponse.trim() || evaluating}>
              {evaluating ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Spinner />Correction en cours…</span> : "Rendre la copie →"}
            </button>
          </div>
        ) : <div style={{ textAlign: "center", padding: 40 }}><p style={{ color: "#b84646" }}>Erreur de génération.</p><button style={S.ctag} onClick={onBack}>Retour</button></div>}
      </div>
    </div>
  );
}

// ── INTERVIEW CONFIG ──────────────────────────────────────────────────────────
function InterviewConfig({ user, onStart, onBack }) {
  const [role, setRole] = useState(ROLES[1].id);
  const [topic, setTopic] = useState(INTERVIEW_TOPICS[0].id);
  const [dur, setDur] = useState("standard");
  const isPro = user?.isPro;
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Dashboard</button></nav>
      <div style={{ maxWidth: 580, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 24, animation: "fsu .4s ease both" }}>
        <h2 style={{ fontSize: 22, margin: 0, color: "#18233e" }}>Configurer l'entretien</h2>
        <Sect label="Niveau du poste">
          <div style={{ display: "flex", gap: 10 }}>
            {ROLES.map(r => <OB key={r.id} active={role === r.id} color={r.color} onClick={() => setRole(r.id)} main={r.label} sub={r.sub} />)}
          </div>
        </Sect>
        <Sect label="Thématique">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {INTERVIEW_TOPICS.map(t => {
              const locked = !t.free && !isPro;
              return (
                <button key={t.id} onClick={() => !locked && setTopic(t.id)}
                  style={{ background: "#ffffff", border: `1px solid ${topic === t.id ? "rgba(226,201,126,.3)" : "#e9edf5"}`, padding: "10px 14px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3, opacity: locked ? .4 : 1, cursor: locked ? "default" : "pointer", transition: "all .15s", fontFamily: "inherit" }}>
                  <span style={{ fontSize: 14 }}>{t.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: topic === t.id ? "#a47b2e" : locked ? "#64718b" : "#63728c" }}>{t.id}</span>
                  <span style={{ fontSize: 10, color: "#64718b" }}>{locked ? "🔒 Pro" : t.desc}</span>
                </button>
              );
            })}
          </div>
        </Sect>
        <Sect label="Durée">
          <div style={{ display: "flex", gap: 10 }}>
            {DURATIONS.map(d => <OB key={d.id} active={dur === d.id} color="#a47b2e" onClick={() => setDur(d.id)} main={d.label} sub={d.sub} />)}
          </div>
        </Sect>
        <button style={{ ...S.ctag, padding: 14, animation: "glow 3s ease-in-out infinite" }} onClick={() => onStart({ role, topic, dur, maxQ: DURATIONS.find(d => d.id === dur).q })}>
          Lancer la simulation →
        </button>
      </div>
    </div>
  );
}

// ── INTERVIEW SCREEN ──────────────────────────────────────────────────────────
function InterviewScreen({ cfg, onDone }) {
  const [msgs, setMsgs] = useState([]); const [input, setInput] = useState(""); const [loading, setLoading] = useState(false);
  const [qCount, setQCount] = useState(0); const [timer, setTimer] = useState(0);
  const endRef = useRef(null); const timerRef = useRef(null);
  useEffect(() => { timerRef.current = setInterval(() => setTimer(t => t + 1), 1000); boot(); return () => clearInterval(timerRef.current); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const boot = async () => {
    setLoading(true);
    const init = [{ role: "user", content: "Bonjour, je suis prêt pour l'entretien." }];
    let r; try { r = await callClaude(INTERVIEW_SYSTEM(cfg.role, cfg.topic), init); } catch (e) { toast.error(e.message); setLoading(false); return; }
    setMsgs([...init, { role: "assistant", content: r }]); setQCount(1); setLoading(false);
  };
  const send = async () => {
    if (!input.trim() || loading) return;
    const next = [...msgs, { role: "user", content: input }];
    setMsgs(next); setInput(""); setQCount(q => q + 1); setLoading(true);
    if (qCount + 1 > cfg.maxQ) { await finish(next); return; }
    let r; try { r = await callClaude(INTERVIEW_SYSTEM(cfg.role, cfg.topic), next); } catch (e) { toast.error(e.message); setLoading(false); return; }
    setMsgs([...next, { role: "assistant", content: r }]); setLoading(false);
  };
  const finish = async (m) => {
    clearInterval(timerRef.current);
    const t = m || msgs;
    const transcript = t.map(x => `${x.role === "user" ? "Candidat" : "Recruteur"}: ${x.content}`).join("\n\n");
    let raw; try { raw = await callClaude(INTERVIEW_EVAL, [{ role: "user", content: `Transcription:\n\n${transcript}\n\nJSON.` }]); } catch (e) { toast.error(e.message); setLoading(false); return; }
    let ev; try { ev = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { toast.error("L’évaluation a échoué. Réessayez ; aucun score n’a été attribué."); setLoading(false); return; }
    onDone({ evaluation: ev, duration: timer, topic: cfg.topic, role: cfg.role, transcript: t });
  };
  const pct = Math.round((Math.min(qCount, cfg.maxQ) / cfg.maxQ) * 100);
  return (
    <div style={{ ...S.root, display: "flex", flexDirection: "column", height: "100vh" }}><OrbBg />
      <div style={{ ...S.nav, zIndex: 2 }}>
        <Logo />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#64718b", border: "1px solid #d9e0ec", padding: "3px 8px" }}>{cfg.topic}</span>
          <span style={{ fontSize: 12, color: "#a47b2e", fontVariantNumeric: "tabular-nums" }}>{fmt(timer)}</span>
          <span style={{ fontSize: 11, color: "#64718b" }}>{Math.min(qCount, cfg.maxQ)}/{cfg.maxQ}</span>
          <button style={{ ...S.no, color: "#b84646", borderColor: "#b8464640" }} onClick={() => finish(msgs)}>Terminer</button>
        </div>
      </div>
      <div style={{ height: 2, background: "#ffffff" }}><div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#a47b2e,#f5e4a0)", transition: "width .5s" }} /></div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 14, scrollbarWidth: "none", position: "relative", zIndex: 1 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 10, justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", animation: "fsu .3s ease both" }}>
            {m.role === "assistant" && <div style={S.ava}>RH</div>}
            <div style={{ maxWidth: "76%", padding: "12px 15px", fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", ...(m.role === "user" ? S.bubu : S.buba) }}>{m.content}</div>
          </div>
        ))}
        {loading && <div style={{ display: "flex", gap: 10 }}><div style={S.ava}>RH</div><div style={{ ...S.buba, padding: "14px 18px", display: "flex", gap: 5, alignItems: "center" }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#a47b2e", animation: `puls 1.2s ${i * .25}s infinite` }} />)}</div></div>}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "12px 20px 20px", borderTop: "1px solid #ffffff", display: "flex", gap: 10, background: "#f7f8fc", position: "relative", zIndex: 1 }}>
        <textarea style={S.ta} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Votre réponse… (Entrée pour envoyer)" disabled={loading} rows={3} />
        <button style={{ ...S.sb, opacity: loading || !input.trim() ? .3 : 1 }} onClick={send} disabled={loading || !input.trim()}>→</button>
      </div>
    </div>
  );
}

// ── RESULTS INTERVIEW ─────────────────────────────────────────────────────────
function ResultsInterview({ data, onNew, onDash }) {
  const { evaluation: ev, duration, topic, transcript } = data;
  const sc = scoreColor(ev.score); const [anim, setAnim] = useState(0); const [copied, setCopied] = useState(false);
  useEffect(() => { let n = 0; const go = () => { n += 2; if (n <= ev.score) { setAnim(n); requestAnimationFrame(go); } else setAnim(ev.score); }; setTimeout(() => requestAnimationFrame(go), 300); }, []);
  const circ = 2 * Math.PI * 52;
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onDash}>← Dashboard</button></nav>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "36px 24px 60px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, animation: "fsu .5s ease both" }}>
          <svg width="140" height="140" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e9edf5" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={sc} strokeWidth="8" strokeDasharray={`${(anim / 100) * circ} ${circ}`} strokeLinecap="round" transform="rotate(-90 60 60)" style={{ filter: `drop-shadow(0 0 6px ${sc})` }} />
            <text x="60" y="54" textAnchor="middle" fill="white" fontSize="28" fontWeight="900" fontFamily="monospace">{anim}</text>
            <text x="60" y="70" textAnchor="middle" fill="#64718b" fontSize="10" fontFamily="monospace">/100</text>
          </svg>
          <p style={{ fontSize: 14, color: "#64718b", margin: 0 }}>{topic} · {fmt(duration)}</p>
          <span style={{ fontSize: 11, letterSpacing: ".15em", color: sc, border: `1px solid ${sc}50`, padding: "4px 16px", fontWeight: 700 }}>{ev.niveau}</span>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #e4e8f1", padding: "20px 24px", width: "100%", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#36425b", lineHeight: 1.7, margin: "0 0 14px" }}>{ev.verdict}</p>
          {ev.conseil_prioritaire && <div style={{ background: "#a47b2e08", border: "1px solid #a47b2e25", padding: "10px 16px" }}><p style={{ fontSize: 10, color: "#a47b2e", margin: "0 0 4px", letterSpacing: ".1em" }}>✦ CONSEIL PRIORITAIRE</p><p style={{ fontSize: 13, color: "#36425b", margin: 0, lineHeight: 1.6 }}>{ev.conseil_prioritaire}</p></div>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
          <div style={S.ec}><p style={{ ...S.et, color: "#2c8061" }}>✦ POINTS FORTS</p>{ev.points_forts?.map((p, i) => <p key={i} style={S.ei}>— {p}</p>)}</div>
          <div style={S.ec}><p style={{ ...S.et, color: "#996724" }}>↗ À AMÉLIORER</p>{ev.axes_amelioration?.map((a, i) => <p key={i} style={S.ei}>— {a}</p>)}</div>
        </div>
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button style={{ ...S.ctagh, flex: 1, fontSize: 12 }} onClick={() => { navigator.clipboard.writeText(transcript?.map(m => `[${m.role === "user" ? "VOUS" : "RECRUTEUR"}]\n${m.content}`).join("\n\n---\n\n") || "").then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}>
            {copied ? "✓ Copié !" : "Copier la transcription"}
          </button>
          <button style={{ ...S.ctag, flex: 1, animation: "glow 3s ease-in-out infinite" }} onClick={onNew}>+ Nouvel entretien</button>
        </div>
      </div>
    </div>
  );
}

// ── RESULTS QCM ───────────────────────────────────────────────────────────────
function ResultsQCM({ data, onNew, onDash }) {
  const { score, total, duration, answers, ueName } = data;
  const pct = Math.round(score / total * 100);
  const sc = scoreColor(pct);
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onDash}>← {data.ue}</button></nav>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 60px", display: "flex", flexDirection: "column", gap: 16, position: "relative", zIndex: 1, animation: "fsu .5s ease both" }}>
        <div style={{ ...S.card, textAlign: "center", borderColor: `${sc}30` }}>
          <p style={{ fontSize: 52, fontWeight: 900, color: sc, margin: "0 0 4px", filter: `drop-shadow(0 0 12px ${sc})` }}>{score}/{total}</p>
          <p style={{ fontSize: 14, color: "#18233e", fontWeight: 700, margin: "0 0 4px" }}>{pct}% de réussite</p>
          <p style={{ fontSize: 12, color: "#64718b", margin: 0 }}>{ueName} · {fmt(duration)}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
          {answers?.map((a, i) => (
            <div key={i} style={{ background: "#ffffff", border: `1px solid ${a.correct ? "#2c806125" : "#b8464625"}`, padding: "10px 14px" }}>
              <p style={{ fontSize: 11, color: a.correct ? "#2c8061" : "#b84646", margin: "0 0 4px" }}>{a.correct ? "✓ Correct" : "✗ Incorrect"} {a.difficulte && `· ${a.difficulte}`}</p>
              <p style={{ fontSize: 12, color: "#64718b", margin: 0 }}>{a.q}</p>
              {!a.correct && <p style={{ fontSize: 11, color: "#64718b", margin: "4px 0 0" }}>Réponse : {a.right}</p>}
              {a.expl && <p style={{ fontSize: 11, color: "#64718b", margin: "4px 0 0", fontStyle: "italic" }}>{a.expl}</p>}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...S.ctagh, flex: 1 }} onClick={onDash}>← Matière</button>
          <button style={{ ...S.ctag, flex: 1 }} onClick={onNew}>Nouveau QCM</button>
        </div>
      </div>
    </div>
  );
}

// ── RESULTS CAS ───────────────────────────────────────────────────────────────
function ResultsCas({ data, onNew, onDash }) {
  const { cas, evaluation: ev, duration, ueName } = data;
  if (!ev) return <div style={S.root}><OrbBg /><div style={{ maxWidth: 500, margin: "80px auto", padding: 24, textAlign: "center" }}><p style={{ color: "#b84646" }}>Erreur d'évaluation.</p><button style={S.ctag} onClick={onDash}>Retour</button></div></div>;
  const nc = noteColor(ev.note);
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onDash}>← {data.ue}</button></nav>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "36px 24px 60px", display: "flex", flexDirection: "column", gap: 16, position: "relative", zIndex: 1, animation: "fsu .5s ease both" }}>
        <div style={{ ...S.card, textAlign: "center", borderColor: `${nc}30` }}>
          <p style={{ fontSize: 54, fontWeight: 900, color: nc, margin: "0 0 4px", filter: `drop-shadow(0 0 12px ${nc})` }}>{ev.note}<span style={{ fontSize: 22 }}>/20</span></p>
          <p style={{ fontSize: 14, color: "#18233e", fontWeight: 700, margin: "0 0 4px" }}>{ev.appreciation} · {cas?.titre}</p>
          <p style={{ fontSize: 12, color: "#64718b", margin: 0 }}>{ueName} · {fmt(duration)}</p>
        </div>
        {ev.correction_par_question && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 10, letterSpacing: ".15em", color: "#64718b" }}>CORRECTION PAR QUESTION</p>
            {ev.correction_par_question.map(q => (
              <div key={q.num} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#18233e" }}>Question {q.num}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: noteColor(q.note / (cas?.questions?.[q.num - 1]?.points || 10) * 20) }}>{q.note}/{cas?.questions?.[q.num - 1]?.points || "?"} pts</span>
                </div>
                <p style={{ fontSize: 13, color: "#36425b", margin: "0 0 8px", lineHeight: 1.6 }}>{q.commentaire}</p>
                {q.elements_attendus && <div style={{ background: "#060810", border: "1px solid #e9edf5", padding: "8px 12px" }}><p style={{ fontSize: 10, color: "#64718b", margin: "0 0 4px", letterSpacing: ".1em" }}>ÉLÉMENTS ATTENDUS</p><p style={{ fontSize: 12, color: "#64718b", margin: 0, lineHeight: 1.6 }}>{q.elements_attendus}</p></div>}
              </div>
            ))}
          </div>
        )}
        {ev.conseil && <div style={{ background: "#a47b2e08", border: "1px solid #a47b2e25", padding: "14px 18px" }}><p style={{ fontSize: 10, color: "#a47b2e", margin: "0 0 6px", letterSpacing: ".1em" }}>✦ CONSEIL</p><p style={{ fontSize: 13, color: "#36425b", margin: 0, lineHeight: 1.6 }}>{ev.conseil}</p></div>}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...S.ctagh, flex: 1 }} onClick={onDash}>← Matière</button>
          <button style={{ ...S.ctag, flex: 1 }} onClick={onNew}>Nouveau cas</button>
        </div>
      </div>
    </div>
  );
}

// ── HISTORY ───────────────────────────────────────────────────────────────────
function History({ user, onBack }) {
  const [history, setHistory] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { loadHistory(user.uid).then(h => { setHistory(h); setLoading(false); }); }, []);
  const typeColor = (t) => t === "entretien" ? "#a47b2e" : t === "cas" ? "#996724" : "#376cac";
  const typeIcon = (t) => t === "entretien" ? "💼" : t === "cas" ? "📝" : "△";
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Dashboard</button></nav>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontSize: 20, margin: "0 0 20px", color: "#18233e" }}>▦ Historique</h2>
        {loading ? <p style={{ color: "#64718b" }}>Chargement…</p> : history.length === 0 ? <p style={{ color: "#64718b", fontSize: 13 }}>Aucune activité pour le moment.</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.map((h, i) => {
              const s = h.evaluation?.score || h.evaluation?.note || 0;
              const isNote = h.type === "cas"; const val = isNote ? `${s}/20` : s > 0 ? `${s}/100` : "—";
              const col = isNote ? noteColor(s) : scoreColor(s);
              return (
                <div key={i} style={{ background: "#ffffff", border: "1px solid #e4e8f1", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", animation: `fsu .3s ${i * .04}s both` }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 14 }}>{typeIcon(h.type)}</span>
                      <span style={{ fontSize: 11, color: typeColor(h.type), border: `1px solid ${typeColor(h.type)}30`, padding: "1px 6px" }}>{h.type?.toUpperCase()}</span>
                      <span style={{ fontSize: 11, color: "#64718b" }}>{h.ueName || h.topic || "—"}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#64718b", margin: 0 }}>{h.date}</p>
                  </div>
                  <p style={{ fontSize: 24, fontWeight: 900, margin: 0, color: col, filter: `drop-shadow(0 0 6px ${col}60)` }}>{val}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PROGRESS ──────────────────────────────────────────────────────────────────
// ── PAYWALL ───────────────────────────────────────────────────────────────────
function Paywall({ onUpgrade, onBack }) {
  return (
    <div style={S.root}><ParticleCanvas /><OrbBg />
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center", position: "relative", zIndex: 1, animation: "fsu .5s ease both" }}>
        <span style={{ fontSize: 40 }}>◈</span>
        <h2 style={{ fontSize: 26, margin: 0, color: "#18233e" }}>Passez à Pro</h2>
        <p style={{ fontSize: 14, color: "#64718b", lineHeight: 1.7, margin: 0 }}>Cette fonctionnalité est réservée aux membres Pro.</p>
        <div style={{ ...S.pc, ...S.phl, width: "100%", animation: "glow 3s ease-in-out infinite" }}>
          <div style={S.pb}>SIMDCG PRO</div>
          <p style={{ fontSize: 40, fontWeight: 900, color: "#18233e", margin: "12px 0 4px" }}>{PRO_PRICE}<span style={{ fontSize: 14, color: "#64718b" }}>/mois</span></p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, margin: "14px 0 20px" }}>
            {["QCM illimités — 13 matières DCG + DSCG", "Cas pratiques illimités corrigés par IA", "Flashcards 12/UE + reprise des cartes difficiles", "Planning de révision IA personnalisé", "Entretiens illimités (6 thématiques)", "Historique complet & progression"].map(f => <p key={f} style={{ fontSize: 12, color: "#36425b", margin: 0 }}>✓ {f}</p>)}
          </div>
          <button style={{ ...S.ctag, width: "100%", padding: 13 }} onClick={onUpgrade}>Passer à Pro →</button>
        </div>
        <button style={S.back} onClick={onBack}>← Retour</button>
      </div>
    </div>
  );
}

// ── ATOMS ─────────────────────────────────────────────────────────────────────
function Logo() { return <Brand />; }
function SC({ v, l, hl }) {
  return <div style={{ background: "#ffffff", border: `1px solid ${hl ? "rgba(226,201,126,.2)" : "#e4e8f1"}`, padding: "14px 10px", textAlign: "center" }}><p style={{ fontSize: 20, fontWeight: 900, margin: "0 0 3px", color: hl ? "#a47b2e" : "#18233e" }}>{v}</p><p style={{ fontSize: 9, color: "#64718b", margin: 0, letterSpacing: ".1em" }}>{l.toUpperCase()}</p></div>;
}
function FInput({ label, value, set, ph, type = "text" }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 5 }}><label style={{ fontSize: 10, letterSpacing: ".12em", color: "#64718b", textTransform: "uppercase" }}>{label}</label><input aria-label={label} style={{ background: "#ffffff", border: "1px solid #d9e0ec", color: "#18233e", padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", transition: "border-color .2s" }} type={type} value={value} onChange={e => set(e.target.value)} placeholder={ph} onFocus={e => e.target.style.borderColor = "#a47b2e40"} onBlur={e => e.target.style.borderColor = "#d9e0ec"} /></div>;
}
function Sect({ label, children }) {
  return <div><p style={{ fontSize: 10, letterSpacing: ".15em", color: "#64718b", margin: "0 0 10px", textTransform: "uppercase" }}>{label}</p>{children}</div>;
}
function OB({ active, color, onClick, main, sub }) {
  return <button onClick={onClick} style={{ flex: 1, background: active ? `${color}12` : "#ffffff", border: `2px solid ${active ? color : "#d9e0ec"}`, color: active ? color : "#64718b", padding: "12px 8px", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all .15s", boxShadow: active ? `0 0 16px ${color}20` : "none", fontFamily: "inherit" }}><strong>{main}</strong><span style={{ fontSize: 10, opacity: .6 }}>{sub}</span></button>;
}
function Spinner() {
  return <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span style={{ width: 13, height: 13, border: "2px solid #f7f8fc", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} /> Chargement…</span>;
}

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
function ForgotPasswordScreen({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const submit = async () => {
    if (!email) { setErr("Entrez votre adresse email."); return; }
    setLoading(true); setErr("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success("Email envoyé ! Vérifiez votre boîte mail.");
    } catch (e) {
      const msgs = { "auth/user-not-found": "Aucun compte avec cet email.", "auth/invalid-email": "Adresse email invalide." };
      setErr(msgs[e.code] || "Erreur. Réessayez.");
    }
    setLoading(false);
  };
  return (
    <div style={S.root}><ParticleCanvas /><OrbBg />
      <div style={{ maxWidth: 400, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 14, animation: "fsu .5s ease both" }}>
        <button style={S.back} onClick={onBack}>← Connexion</button>
        <Logo />
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 44 }}>✉</span>
            <h2 style={{ fontSize: 20, color: "#2c8061", margin: 0 }}>Email envoyé !</h2>
            <p style={{ fontSize: 13, color: "#64718b", lineHeight: 1.7, margin: 0 }}>
              Un lien de réinitialisation a été envoyé à <strong style={{ color: "#18233e" }}>{email}</strong>. Vérifiez vos spams si vous ne le voyez pas.
            </p>
            <button style={{ ...S.ctag, marginTop: 8 }} onClick={onBack}>Retour à la connexion →</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 22, margin: "12px 0 4px", color: "#18233e" }}>Mot de passe oublié ?</h2>
            <p style={{ fontSize: 13, color: "#64718b" }}>Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>
            <FInput label="Email" value={email} set={setEmail} ph="jean@exemple.fr" type="email" />
            {err && <p style={{ fontSize: 12, color: "#b84646" }}>{err}</p>}
            <button style={{ ...S.ctag, width: "100%", opacity: loading ? .6 : 1 }} onClick={submit} disabled={loading}>
              {loading ? <Spinner /> : "Envoyer le lien →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── LEGAL SCREEN (CGU + Confidentialité) ──────────────────────────────────────
function LegalScreen({ type, onBack }) {
  const isCgu = type === "cgu";
  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const cguContent = [
    { title: "1. Objet", body: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme SIMDCG (simdcg.com), éditée par Marcus Bonnafis, entrepreneur individuel. En accédant à SIMDCG, vous acceptez sans réserve les présentes CGU.` },
    { title: "2. Description du service", body: `SIMDCG est une plateforme de préparation aux examens DCG (Diplôme de Comptabilité et de Gestion) et DSCG (Diplôme Supérieur de Comptabilité et de Gestion). Le service propose des QCM générés par intelligence artificielle, des flashcards, des résumés de cours, des cas pratiques corrigés et un simulateur d'entretien professionnel.` },
    { title: "3. Accès et compte", body: `L'accès au service nécessite la création d'un compte via adresse email ou compte Google. L'utilisateur est responsable de la confidentialité de ses identifiants. Un plan gratuit avec fonctionnalités limitées est disponible sans engagement. Un plan Pro à ${PRO_PRICE}/mois offre un accès complet à l'ensemble des fonctionnalités.` },
    { title: "4. Abonnement Pro", body: `Le plan Pro est facturé mensuellement via Stripe, prestataire de paiement sécurisé. L'abonnement est sans engagement et résiliable à tout moment depuis votre espace client Stripe. Aucun remboursement ne sera effectué pour la période en cours au moment de la résiliation.` },
    { title: "5. Propriété intellectuelle", body: `Le contenu généré par l'IA (questions, corrections, résumés) est fourni à titre de support pédagogique. SIMDCG ne garantit pas l'exactitude absolue des contenus générés. L'interface, le logo et les éléments visuels sont la propriété exclusive de Marcus Bonnafis.` },
    { title: "6. Limitation de responsabilité", body: `SIMDCG est un outil de préparation et ne constitue pas un engagement de réussite aux examens. Les contenus sont générés par IA à titre indicatif. SIMDCG ne saurait être tenu responsable des décisions prises sur la base des informations fournies.` },
    { title: "7. Modification et résiliation", body: `SIMDCG se réserve le droit de modifier les CGU à tout moment avec préavis de 30 jours. Les comptes inactifs depuis plus de 24 mois peuvent être supprimés après notification. Tout manquement aux présentes CGU peut entraîner la suspension du compte.` },
    { title: "8. Droit applicable", body: `Les présentes CGU sont régies par le droit français. Tout litige relève de la compétence exclusive des tribunaux français. Pour toute réclamation : contact.simdcg@gmail.com` },
  ];
  const confidentialiteContent = [
    { title: "1. Responsable du traitement", body: `Marcus Bonnafis (simdcg.com) est responsable du traitement de vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679).` },
    { title: "2. Données collectées", body: `Lors de l'inscription : prénom, adresse email, date d'inscription. Lors de l'utilisation : historique des sessions (QCM, entretiens, cas pratiques), scores obtenus, matières étudiées, streak quotidien. Données techniques : adresse IP, type de navigateur (via Firebase Analytics).` },
    { title: "3. Finalités du traitement", body: `Vos données sont utilisées pour : (a) la gestion de votre compte et authentification, (b) la personnalisation de votre expérience de révision, (c) le suivi de votre progression, (d) la facturation via Stripe pour les abonnés Pro, (e) l'amélioration du service.` },
    { title: "4. Base légale", body: `Le traitement de vos données repose sur votre consentement (art. 6.1.a RGPD) lors de la création de compte, et sur l'exécution du contrat (art. 6.1.b RGPD) pour les fonctionnalités du service.` },
    { title: "5. Sous-traitants", body: `SIMDCG utilise les prestataires suivants : Firebase (Google LLC) pour l'authentification et la base de données — serveurs en Europe, Stripe Inc. pour le traitement des paiements — conforme PCI-DSS, Anthropic PBC pour la génération de contenu IA — données non stockées.` },
    { title: "6. Conservation des données", body: `Vos données sont conservées pendant la durée de vie de votre compte. En cas de suppression de compte, vos données personnelles sont effacées sous 30 jours. Les données de facturation sont conservées 10 ans conformément aux obligations comptables légales.` },
    { title: "7. Vos droits", body: `Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement, de portabilité et d'opposition au traitement de vos données. Pour exercer ces droits : contact.simdcg@gmail.com. Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).` },
    { title: "8. Cookies", body: `SIMDCG utilise uniquement les cookies techniques nécessaires au fonctionnement du service (authentification, session). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.` },
  ];
  const content = isCgu ? cguContent : confidentialiteContent;
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Retour</button></nav>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 32, animation: "fsu .4s ease both" }}>
          <div style={{ ...S.badge, display: "inline-block", marginBottom: 12 }}>{isCgu ? "CGU" : "CONFIDENTIALITÉ"}</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#18233e", margin: "0 0 6px" }}>
            {isCgu ? "Conditions Générales d'Utilisation" : "Politique de Confidentialité"}
          </h1>
          <p style={{ fontSize: 12, color: "#64718b", margin: 0 }}>Dernière mise à jour : {today}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {content.map((sec, i) => (
            <div key={i} style={{ ...S.card, animation: `fsu .4s ${i * .05}s both` }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#a47b2e", letterSpacing: ".08em", margin: "0 0 10px" }}>{sec.title}</p>
              <p style={{ fontSize: 13, color: "#63728c", lineHeight: 1.75, margin: 0 }}>{sec.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer({ onCgu, onConfidentialite }) {
  return (
    <div style={{ borderTop: "1px solid #ffffff", padding: "28px 24px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Logo />
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <button style={{ ...S.nl, fontSize: 11, color: "#64718b" }} onClick={onCgu}>Conditions d'utilisation</button>
          <button style={{ ...S.nl, fontSize: 11, color: "#64718b" }} onClick={onConfidentialite}>Confidentialité</button>
          <a href="mailto:contact.simdcg@gmail.com" style={{ fontSize: 11, color: "#64718b", textDecoration: "none", fontFamily: "inherit" }}>contact.simdcg@gmail.com</a>
        </div>
        <p style={{ fontSize: 10, color: "#d9e0ec", margin: 0 }}>© {new Date().getFullYear()} SIMDCG — Tous droits réservés</p>
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  root: { minHeight: "100vh", background: "#f7f8fc", color: "#18233e", fontFamily: "'Inter',system-ui,sans-serif", position: "relative", overflow: "hidden" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #ffffff", background: "rgba(8,11,20,.88)", backdropFilter: "blur(12px)", position: "relative", zIndex: 2 },
  nl: { background: "none", border: "none", color: "#64718b", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  no: { borderRadius: 14, background: "none", border: "1px solid #d9e0ec", color: "#63728c", fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" },
  nc: { borderRadius: 14, background: "#182d52", border: "none", color: "#ffffff", fontSize: 12, padding: "7px 16px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" },
  badge: { borderRadius: 14, fontSize: 10, letterSpacing: ".18em", color: "#a47b2e", border: "1px solid rgba(226,201,126,.2)", padding: "5px 16px", background: "rgba(226,201,126,.04)" },
  ctag: { borderRadius: 14, background: "#182d52", border: "none", color: "#ffffff", fontSize: 14, fontWeight: 700, padding: "13px 28px", cursor: "pointer", letterSpacing: ".04em", fontFamily: "inherit" },
  ctagh: { borderRadius: 14, background: "none", border: "1px solid #d9e0ec", color: "#63728c", fontSize: 14, padding: "13px 28px", cursor: "pointer", fontFamily: "inherit" },
  tag: { borderRadius: 14, fontSize: 11, border: "1px solid #0f1520", padding: "5px 12px", background: "rgba(13,17,23,.5)" },
  fc: { borderRadius: 14, background: "#ffffff", border: "1px solid #e9edf5", padding: "22px 18px", display: "flex", flexDirection: "column" },
  pc: { borderRadius: 14, background: "#ffffff", border: "1px solid #e4e8f1", padding: "24px 20px", position: "relative", display: "flex", flexDirection: "column" },
  phl: { border: "1px solid rgba(226,201,126,.25)", background: "rgba(226,201,126,.03)" },
  pb: { position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#a47b2e", color: "#f7f8fc", fontSize: 9, padding: "3px 12px", fontWeight: 700, letterSpacing: ".12em", whiteSpace: "nowrap" },
  back: { background: "none", border: "none", color: "#64718b", fontSize: 12, cursor: "pointer", padding: 0, alignSelf: "flex-start", fontFamily: "inherit" },
  mb: { borderRadius: 14, background: "#ffffff", border: "1px solid #e9edf5", padding: "16px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontFamily: "inherit" },
  uecard: { borderRadius: 14, background: "#ffffff", border: "1px solid #e9edf5", padding: "14px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "inherit", transition: "all .15s" },
  fb: { borderRadius: 14, background: "none", border: "1px solid #d9e0ec", color: "#64718b", padding: "5px 12px", fontSize: 11, cursor: "pointer", transition: "all .15s", fontFamily: "inherit" },
  fa: { border: "1px solid rgba(226,201,126,.35)", color: "#a47b2e", background: "rgba(226,201,126,.06)" },
  card: { borderRadius: 14, background: "#ffffff", border: "1px solid #e4e8f1", padding: "20px 22px" },
  ava: { width: 30, height: 30, background: "#e9edf5", border: "1px solid #d9e0ec", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#64718b", flexShrink: 0 },
  buba: { background: "#ffffff", border: "1px solid #e4e8f1", color: "#36425b", borderRadius: "0 8px 8px 8px" },
  bubu: { background: "rgba(226,201,126,.07)", border: "1px solid rgba(226,201,126,.18)", color: "#18233e", borderRadius: "8px 0 8px 8px" },
  ta: { borderRadius: 14, flex: 1, background: "#ffffff", border: "1px solid #d9e0ec", color: "#18233e", padding: "12px 14px", fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.6 },
  sb: { borderRadius: 14, background: "#182d52", border: "none", color: "#ffffff", width: 44, height: 44, fontSize: 18, cursor: "pointer", fontWeight: 700, flexShrink: 0, alignSelf: "flex-end" },
  ec: { borderRadius: 14, background: "#ffffff", border: "1px solid #e4e8f1", padding: "14px 16px" },
  et: { fontSize: 9, letterSpacing: ".12em", margin: "0 0 10px" },
  ei: { fontSize: 12, color: "#64718b", margin: "4px 0", lineHeight: 1.55 },
};

export { DCG_UES, DSCG_UES, QCMScreen, FlashcardsScreen, PlanningScreen, ResumeCoursScreen, CasPratiqueScreen, Auth, InterviewConfig };
