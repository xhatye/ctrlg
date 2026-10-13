import { useState, useRef, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { onSnapshot, doc, getDoc, setDoc, updateDoc, arrayUnion, collection, addDoc, getDocs, query, orderBy, limit, increment } from "firebase/firestore";

import { auth, db, googleProvider } from './firebase';
import { ensureProfile } from './profile';
import { launchCheckout, billingRequest } from './billing-client';
import { Brand, Marketing, StudentHome, OfferPage, CourseHome, ProductShell, AccountPage, TutorPage, LibraryPage, LearningProgress, PublicInfo, StudentReviews } from './modern';
import './design.css';
import {loadStudy} from './study-client';
import { curriculumFor } from '../lib/curriculum.mjs';
import { StudySession } from './chapter-navigation';
import Flashcard from './Flashcard';
import {learningRequest} from './learning-client';
import {StudyNotice, SavedLesson, CasePractice, StudyPlanner, OralPractice, OralSummary, OralSetup as InterviewConfig} from './study';

const upgrade = (plan = 'subscription') => launchCheckout(plan).catch(error => toast.error(error.message));

// ── CONFIG ────────────────────────────────────────────────────────────────────
const PRO_PRICE = "15€";
const PACK_EXAMEN_PRICE = "29€";

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
  if (path === "/decouverte") return "pricing";
  if (path === "/inscription") return "auth";
  if (URL_TO_SCREEN[path]) return URL_TO_SCREEN[path];
  // Prefix match for dynamic sub-paths like /entretien/*
  const found = Object.entries(URL_TO_SCREEN).find(([url]) => path.startsWith(url) && url !== "/");
  return found ? found[1] : "landing";
};

// ── UES DATA ──────────────────────────────────────────────────────────────────
const ALL_UES = curriculumFor('2027');
const DCG_UES = ALL_UES.filter(ue=>ue.level==='DCG');
const DSCG_UES = ALL_UES.filter(ue=>ue.level==='DSCG');

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const scoreColor = (s) => s >= 80 ? "var(--success)" : s >= 60 ? "var(--gold-text)" : "var(--danger)";
const noteColor = (n) => n >= 14 ? "var(--success)" : n >= 10 ? "var(--gold-text)" : "var(--danger)";
const today = () => new Date().toISOString().split("T")[0];

// Checks isPro AND proExpiresAt · returns true only if access is active
const resolveIsPro = (data) => {
  if (!data?.isPro) return false;
  if (!data?.proExpiresAt) return true; // subscription, no expiry
  return new Date(data.proExpiresAt) > new Date(); // pack examen · check expiry
};

// ── API ───────────────────────────────────────────────────────────────────────
async function callClaude(system, messages, maxTokens = 1200, user = null, module = undefined) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s hard timeout
  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await auth.currentUser?.getIdToken() || ""}` },
      body: JSON.stringify({ max_tokens: maxTokens, system, messages, module }),
      signal: controller.signal,
    });
    if (!r.ok) { const error = await r.json().catch(() => ({})); throw new Error(error.error || `API ${r.status}`); }
    const d = await r.json();
    return {text:d.content?.[0]?.text || '',dailyRemaining:d.dailyRemaining,monthlyRemaining:d.monthlyRemaining,references:d.references || []};
  } catch (e) {
    if (e.name === "AbortError") console.error("callClaude timeout after 30s");
    else console.error("callClaude error:", e);
    throw new Error(e.name === "AbortError" ? "La réponse prend trop de temps. Réessayez." : e.message);
  } finally {
    clearTimeout(timeout);
  }
}

// ── STORAGE (Firestore) ───────────────────────────────────────────────────────
const getUserDoc = (uid) => doc(db, "users", uid);

const saveHistory = async (uid, entry) => {
  await updateDoc(getUserDoc(uid), { history: arrayUnion(entry) });
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
          background: t.type === "success" ? "var(--success-soft)" : t.type === "error" ? "var(--danger-soft)" : "var(--gold-soft)",
          border: `1px solid ${t.type === "success" ? "color-mix(in srgb, var(--success) 25%, transparent)" : t.type === "error" ? "color-mix(in srgb, var(--danger) 25%, transparent)" : "rgba(226,201,126,.3)"}`,
          color: t.type === "success" ? "var(--success)" : t.type === "error" ? "var(--danger)" : "var(--gold-text)",
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
  { icon: "🎓", title: "Mode Diplôme", desc: "Choisissez une matière DCG ou DSCG et lancez un QCM, des flashcards ou un cas pratique, disponibles sans génération IA.", cta: "Suivant →" },
  { icon: "◈", title: "Vos fiches de révision", desc: "Chaque matière dispose d'un cours original avec exemples, méthodes et pièges fréquents, accessible avec Pro.", cta: "Suivant →" },
  { icon: "💼", title: "Préparer l’oral par écrit", desc: "Entraînez-vous à structurer une réponse, puis comparez-la aux éléments attendus. Cet entraînement autonome ne dépend pas du tuteur IA.", cta: "Suivant →" },
  { icon: "✦", title: "Pro pour aller plus loin", desc: `Débloquez les 20 matières, cours par chapitre et QCM expliqués, cas avec corrigés, reprise des cartes difficiles et planning sans IA pour ${PRO_PRICE}/mois. Résiliation en 1 clic.`, cta: "Commencer →" },
];

function OnboardingModal({ onClose, onUpgrade }) {
  const [step, setStep] = useState(0);
  const s = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "var(--surface)", border: "1px solid rgba(226,201,126,.2)", padding: "32px 28px", maxWidth: 420, width: "100%", animation: "fsu .35s ease both", textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>{s.icon}</div>
        <p style={{ fontSize: 10, letterSpacing: ".15em", color: "var(--gold-text)", margin: "0 0 8px" }}>ÉTAPE {step + 1} / {ONBOARDING_STEPS.length}</p>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--ink)", margin: "0 0 12px" }}>{s.title}</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.75, margin: "0 0 24px" }}>{s.desc}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
          {ONBOARDING_STEPS.map((_, i) => (
            <div key={i} style={{ width: i === step ? 20 : 6, height: 6, background: i === step ? "var(--gold-text)" : "var(--line)", borderRadius: 3, transition: "all .3s" }} />
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
  const [selectedUE, setSelectedUE] = useState(() => (() => {const params=new URLSearchParams(window.location.search), ue=ALL_UES.find(ue=>ue.id===params.get('ue'));return ue?{...ue,chapter:params.get('chapter') || undefined}:null;})());
  const [interviewCfg, setInterviewCfg] = useState(null);
  const [result, setResult] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [learning,setLearning]=useState({chapters:{}}),[learningError,setLearningError]=useState(false);
  useEffect(()=>{
    let alive=true;setLearning({chapters:{}});setLearningError(false);
    if(user?.uid)learningRequest().then(data=>{if(alive&&auth.currentUser?.uid===user.uid)setLearning(previous=>previous.updatedAt&&previous.updatedAt>data.updatedAt?previous:data);}).catch(()=>{if(alive&&auth.currentUser?.uid===user.uid)setLearningError(true);});
    return()=>{alive=false;};
  },[user?.uid]);
  const onLearning=async events=>{const uid=auth.currentUser?.uid,data=await learningRequest(events);if(uid&&auth.currentUser?.uid===uid){setLearning(data);setLearningError(false);}return data;};
  const reloadLearning=()=>{const uid=auth.currentUser?.uid;return learningRequest().then(data=>{if(uid&&auth.currentUser?.uid===uid){setLearning(data);setLearningError(false);}}).catch(()=>{if(uid&&auth.currentUser?.uid===uid)setLearningError(true);});};
  const openLearning=(ue,chapter,target)=>{
    setSelectedUE({...ue,chapter});window.history.pushState({},'',SCREEN_TO_URL[target]+'?ue='+ue.id+'&chapter='+encodeURIComponent(chapter));setScreen(target);
  };

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
      setSelectedUE((() => {const params=new URLSearchParams(window.location.search), ue=ALL_UES.find(ue=>ue.id===params.get('ue'));return ue?{...ue,chapter:params.get('chapter') || undefined}:null;})());
      setScreen(s);
      if (s === "auth") setAuthMode(window.location.pathname === "/inscription" ? "signup" : "login");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const nav = (s, opts = {}) => {
    const chapter = opts.chapter || selectedUE?.chapter;
    if(opts.chapter)setSelectedUE(ue=>({...ue,chapter:opts.chapter}));
    let url = SCREEN_TO_URL[s] || "/";
    if (s === "auth") url = (opts.mode === "signup") ? "/inscription" : "/connexion";
    if (["subject_hub", "qcm", "flashcards", "resume_cours", "cas_pratique"].includes(s) && selectedUE) url += `?ue=${selectedUE.id}${chapter?"&chapter="+encodeURIComponent(chapter):""}`;
    window.history.pushState({}, "", url);
    setScreen(s);
  };

  const isPro = user?.isPro;
  const toAuth = (m) => { setAuthMode(m); nav("auth", { mode: m }); };

  const onInterviewDone = async (data) => {
    const entry = { ...data, type: "entretien", date: new Date().toLocaleString("fr-FR"), dateISO: new Date().toISOString() };
    try { if (user) { await saveHistory(user.uid, entry); const s = await updateStreak(user.uid); setUser(u => ({ ...u, interviewsUsed: (u.interviewsUsed || 0) + 1, streak: s })); } }
    catch { toast.error('Vos notes restent affichées. L’enregistrement a échoué ; réessayez.'); return; }
    incrementStat("totalInterviews");
    toast.success("Entretien terminé ! Résultats disponibles.");
    setResult(entry); nav("results_interview");
  };
  const onQCMDone = async (data) => {
    const pct = Math.round(data.score / data.total * 100);
    const entry = { ...data, type: "qcm", date: new Date().toLocaleString("fr-FR"), dateISO: new Date().toISOString() };
    const groups={};for(const answer of data.answers){if(!answer.chapter)continue;const group=groups[answer.chapter] ||= {total:0,correct:0};group.total++;if(answer.correct)group.correct++;}
    const events=Object.entries(groups).map(([chapter,g],i)=>({id:data.sessionId+'_'+i,module:data.ue,chapter,type:'quiz',...g}));
    if(events.length)try{await onLearning(events);}catch{entry.pendingLearning=events;}
    let saved = true;
    try { if (user) {
      await saveHistory(user.uid, entry);
      await saveMastery(user.uid, data.ue, pct);
      const s = await updateStreak(user.uid);
      setUser(u => ({ ...u, streak: s }));
    } } catch { saved=false; }
    incrementStat("totalQCMs");
    if(saved) toast.success("QCM terminé ! Voir les résultats.");
    else toast.error('Le résultat est affiché, mais l’enregistrement dans votre historique a échoué.');
    setResult(entry); nav("results_qcm");
  };
  const onCasDone = async (data) => {
    const entry = { ...data, cas:{titre:data.cas.titre,contexte:data.cas.contexte,questions:data.cas.questions},type: "cas", date: new Date().toLocaleString("fr-FR"), dateISO: new Date().toISOString() };
    if (user) { await saveHistory(user.uid, entry); const s = await updateStreak(user.uid); setUser(u => ({ ...u, streak: s })); }
    toast.success("Votre travail et le corrigé sont enregistrés.");
  };

  if (loadingAuth) return <div className="app-loading"><span className="brand-mark">S</span><p>Préparation de votre espace…</p></div>;
  const publicScreens = ['landing', 'pricing', 'testimonials', 'auth', 'cgu', 'confidentialite', 'forgot_password', 'features', 'dcg', 'dscg', 'resources', 'support'];
  const privateScreen = !publicScreens.includes(screen);
  const selectUE = ue => { setSelectedUE(ue); window.history.pushState({}, '', `/matiere?ue=${ue.id}`); setScreen('subject_hub'); };
  const logout = () => { signOut(auth); setUser(null); nav('landing'); };
  const renderScreen = () => {
    if (privateScreen && !user) return <Auth mode="login" setMode={setAuthMode} onDone={u => { setUser(u); nav(screen); }} onBack={() => nav('landing')} />;
    if (['subject_hub', 'qcm', 'flashcards', 'resume_cours', 'cas_pratique'].includes(screen) && !selectedUE) return <LibraryPage ues={ALL_UES} user={user} onSelect={selectUE} />;
    if (['interview', 'interview_config', 'tutor', 'qcm', 'flashcards', 'resume_cours', 'cas_pratique'].includes(screen) && !isPro) return <Paywall onUpgrade={() => upgrade()} onBack={() => nav('dashboard')} />;
    if (screen === 'interview' && !interviewCfg) return <InterviewConfig user={user} onStart={cfg => { setInterviewCfg(cfg); nav('interview'); }} onBack={() => nav('dashboard')} />;
    if (screen.startsWith('results_') && !result) return <History user={user} onBack={() => nav('dashboard')} />;
    if (screen === 'landing') return <Marketing onAuth={toAuth} onNav={nav} ues={ALL_UES} />;
    if (screen === 'pricing') return <OfferPage user={user} onCheckout={upgrade} onNav={nav} />;
    if (['features', 'dcg', 'dscg', 'resources', 'support'].includes(screen)) return <PublicInfo page={screen} onNav={nav} onAuth={toAuth} ues={ALL_UES} />;
    if (screen === 'testimonials') return <StudentReviews load={loadTestimonials} onNav={nav} />;
    if (screen === 'auth') return <Auth mode={authMode} setMode={setAuthMode} onDone={u => { setUser(u); if (u.isNew) setShowOnboarding(true); const plan = sessionStorage.getItem('simdcg-plan'); sessionStorage.removeItem('simdcg-plan'); nav('dashboard'); if (plan) upgrade(plan); }} onBack={() => nav('landing')} />;
    if (screen === 'dashboard') return <StudentHome user={user} ues={ALL_UES} onNav={nav} onSelect={selectUE} />;
    if (screen === 'library') return <LibraryPage ues={ALL_UES} user={user} onSelect={selectUE} />;
    if (screen === 'subject_hub') return <CourseHome ue={selectedUE} user={user} onNav={nav} learning={learning} />;
    if (screen === 'account') return <AccountPage user={user} onNav={nav} onCheckout={upgrade} request={billingRequest} />;
    if (screen === 'tutor') return <TutorPage ues={ALL_UES} call={callClaude} user={user} onNav={nav} />;
    if (screen === 'qcm') return <QCMScreen key={selectedUE.id} ue={selectedUE} user={user} onDone={onQCMDone} onBack={() => nav('subject_hub')} />;
    if (screen === 'flashcards') return <FlashcardsScreen key={selectedUE.id} ue={selectedUE} user={user} onLearning={onLearning} onBack={() => nav('subject_hub')} onUpgrade={() => upgrade()} />;
    if (screen === 'resume_cours') return <SavedLesson key={selectedUE.id} ue={selectedUE} user={user} onLearning={onLearning} learning={learning} onBack={() => nav('subject_hub')} />;
    if (screen === 'cas_pratique') return <CasePractice key={selectedUE.id} ue={selectedUE} user={user} onLearning={onLearning} onDone={onCasDone} onBack={() => nav('subject_hub')} />;
    if (screen === 'planning') return <StudyPlanner ues={ALL_UES} user={user} onBack={() => nav('dashboard')} onUpgrade={() => upgrade()} />;
    if (screen === 'interview_config') return <InterviewConfig user={user} onStart={cfg => { setInterviewCfg(cfg); nav('interview'); }} onBack={() => nav('dashboard')} />;
    if (screen === 'interview') return <OralPractice cfg={interviewCfg} onDone={onInterviewDone} onBack={() => nav('interview_config')} />;
    if (screen === 'results_interview' && result.mode === 'self-review') return <OralSummary data={result} onBack={() => nav('interview_config')} />;
    if (screen === 'results_interview') return <ResultsInterview data={result} onNew={() => nav('interview_config')} onDash={() => nav('dashboard')} />;
    if (screen === 'results_qcm') return <><ResultsQCM data={result} onNew={() => nav('qcm')} onDash={() => nav('subject_hub')} />{result.pendingLearning&&<p className="message error" role="alert">Le résultat est affiché ; le suivi par chapitre reste à enregistrer. <button className="text-button" onClick={()=>onLearning(result.pendingLearning).then(()=>setResult(r=>({...r,pendingLearning:undefined}))).catch(()=>toast.error('Enregistrement encore indisponible.'))}>Réessayer la progression</button></p>}</>;
    if (screen === 'results_cas') return <ResultsCas data={result} onNew={() => nav('cas_pratique')} onDash={() => nav('subject_hub')} />;
    if (screen === 'paywall') return <Paywall onUpgrade={() => upgrade()} onBack={() => nav('dashboard')} />;
    if (screen === 'history') return <History user={user} onBack={() => nav('dashboard')} />;
    if (screen === 'progress') return <LearningProgress user={user} ues={ALL_UES} onNav={nav} learning={learning} learningError={learningError} onRetry={reloadLearning} onOpen={openLearning} />;
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
        <h2 style={{ fontSize: 22, margin: "12px 0 4px", color: "var(--ink)" }}>{mode === "signup" ? "Créer un compte" : "Se connecter"}</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>{mode === "signup" ? "Créez votre compte. Choisissez votre plan après." : "Bon retour."}</p>
        <button style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)", padding: "11px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} onClick={googleSignIn} disabled={loading}>
          <span style={{ fontSize: 16 }}>G</span> Continuer avec Google
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ flex: 1, height: 1, background: "var(--line)" }} /><span style={{ fontSize: 10, color: "var(--muted)" }}>ou</span><div style={{ flex: 1, height: 1, background: "var(--line)" }} /></div>
        {mode === "signup" && <FInput label="Prénom" value={name} set={setName} ph="Jean-Baptiste" />}
        <FInput label="Email" value={email} set={setEmail} ph="jean@exemple.fr" type="email" />
        <FInput label="Mot de passe" value={pass} set={setPass} ph="••••••••" type="password" />
        {err && <p style={{ fontSize: 12, color: "var(--danger)" }}>{err}</p>}
        <button style={{ ...S.ctag, width: "100%", opacity: loading ? .6 : 1, marginTop: 4 }} onClick={submit} disabled={loading}>
          {loading ? <Spinner /> : mode === "signup" ? "Créer mon compte →" : "Se connecter →"}
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>
            {mode === "signup" ? "Déjà un compte ? " : "Pas encore ? "}
            <span style={{ color: "var(--gold-text)", cursor: "pointer" }} onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setErr(""); }}>
              {mode === "signup" ? "Se connecter" : "S'inscrire"}
            </span>
          </p>
          {mode === "login" && (
            <a href="/mot-de-passe-oublie" onClick={e => { e.preventDefault(); window.history.pushState({}, "", "/mot-de-passe-oublie"); window.dispatchEvent(new PopStateEvent("popstate")); }}
              style={{ fontSize: 11, color: "var(--muted)", cursor: "pointer", textDecoration: "none" }}>
              Mot de passe oublié ?
            </a>
          )}
        </div>
      </div>
    </section></div>
  );
}

// ── QCM SCREEN ────────────────────────────────────────────────────────────────
function QCMScreen(props) {
  return <StudySession ue={props.ue} kind="qcm">{ue=><QCMSession {...props} ue={ue}/>}</StudySession>;
}
function QCMSession({ ue, user, onDone, onBack }) {
  const isPro = user?.isPro;
  const [questions, setQuestions] = useState(null);
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const timerRef = useRef(null);
  const sessionId=useRef(crypto.randomUUID());
  const [finishing,setFinishing]=useState(false),finishingRef=useRef(false);

  useEffect(() => {
    let cancelled = false;
    const gen = async () => {
      setLoading(true);
      try {
        const {items:data} = await loadStudy(ue.id, 'qcm', {chapter:ue.chapter,count:ue.count,focus:ue.focus});
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
    setAnswers(a => [...a, { q: q.q, correct: i === q.answer, right: q.options[q.answer], expl: q.expl, difficulte: q.difficulte,chapter:q.chapter }]);
  };
  const next = async () => {
    if(finishingRef.current)return;
    if (qi + 1 >= questions.length) {finishingRef.current=true;setFinishing(true);clearInterval(timerRef.current);try{await onDone({ ue: ue.id, ueName: ue.label, score, total: questions.length, duration: timer, answers,sessionId:sessionId.current });}catch{finishingRef.current=false;setFinishing(false);toast.error('Le résultat reste affiché. Réessayez l’enregistrement.');} }
    else { setQi(i => i + 1); setSel(null); }
  };

  return (
    <div style={S.root}><OrbBg />
      <StudyNotice /><nav style={S.nav}>
        <Logo />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--ink)", border: `1px solid ${ue.color}30`, padding: "3px 8px" }}>{ue.id}</span>
          {questions && <span style={{ fontSize: 12, color: "var(--gold-text)", fontVariantNumeric: "tabular-nums" }}>{fmt(timer)}</span>}
          {questions && <span style={{ fontSize: 11, color: "var(--muted)" }}>{qi + 1}/{questions.length}</span>}
          <button style={S.nl} onClick={onBack}>Quitter</button>
        </div>
      </nav>

      {questions && <div style={{ height: 2, background: "var(--surface)" }}><div style={{ height: "100%", width: `${((qi + (sel !== null ? 1 : 0)) / questions.length) * 100}%`, background: `linear-gradient(90deg,${ue.color},var(--gold-text))`, transition: "width .3s" }} /></div>}

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1 }}>
        {loading && <div style={{ textAlign: "center", padding: "80px 24px" }}><div style={{ width: 40, height: 40, border: "3px solid var(--line)", borderTop: `3px solid ${ue.color}`, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 20px" }} /><p style={{ color: "var(--muted)", fontSize: 13 }}>Chargement du QCM…</p></div>}
        {error && <div style={{ textAlign: "center", padding: 40 }}><p style={{ color: "var(--danger)" }}>Le QCM ne peut pas être chargé.</p><button style={S.ctag} onClick={onBack}>Retour</button></div>}
        {!loading && !error && q && (
          <div style={{ animation: "fsu .3s ease both" }}>
            <div style={{ ...S.card, marginBottom: 14, borderColor: `${ue.color}15` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <p style={{ fontSize: 10, color: "var(--link)", letterSpacing: ".1em", margin: 0 }}>QUESTION {qi + 1}</p>
                {q.difficulte && <span style={{ fontSize: 9, padding: "2px 8px", border: `1px solid ${q.difficulte === "Difficile" ? "var(--danger)" : q.difficulte === "Moyen" ? "var(--gold-text)" : "var(--success)"}`, color: q.difficulte === "Difficile" ? "var(--danger)" : q.difficulte === "Moyen" ? "var(--gold-text)" : "var(--success)" }}>{q.difficulte}</span>}
              </div>
              <p style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.6, margin: 0, fontWeight: 600 }}>{q.q}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {q.options?.map((opt, i) => {
                let bg = "var(--surface)", border = "var(--line)", color = "var(--muted)";
                if (sel !== null) { if (i === q.answer) { bg = `${ue.color}10`; border = ue.color; color = "var(--success)"; } else if (i === sel && i !== q.answer) { bg = "color-mix(in srgb, var(--danger) 6%, transparent)"; border = "var(--danger)"; color = "var(--danger)"; } }
                return <button key={i} onClick={() => pick(i)} className="answer-option" style={{ background: bg, border: `1px solid ${border}`, color, padding: "12px 16px", textAlign: "left", cursor: sel === null ? "pointer" : "default", fontSize: 13, transition: "all .2s", fontFamily: "inherit" }}>{String.fromCharCode(65 + i)}. {opt}</button>;
              })}
            </div>
            {sel !== null && <div style={{ background: "var(--surface)", border: "1px solid var(--line)", padding: "12px 16px", marginBottom: 14 }}><p style={{ fontSize: 10, color: "var(--muted)", margin: "0 0 4px", letterSpacing: ".1em" }}>EXPLICATION</p><p style={{ fontSize: 13, color: "var(--ink)", margin: 0, lineHeight: 1.6 }}>{q.expl}</p></div>}
            {sel !== null && <button disabled={finishing} style={{ ...S.ctag, width: "100%", padding: 13 }} onClick={next}>{finishing?'Enregistrement…':qi + 1 >= questions.length ? "Voir les résultats →" : "Question suivante →"}</button>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── FLASHCARDS ────────────────────────────────────────────────────────────────
function FlashcardsScreen(props) {
  return <StudySession ue={props.ue} kind="cards">{ue=><FlashcardsSession {...props} ue={ue}/>}</StudySession>;
}
function FlashcardsSession({ ue, user, onBack, onUpgrade, onLearning }) {
  const isPro = user?.isPro;
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
  const [progressStatus,setProgressStatus]=useState(''),receipt=useRef(crypto.randomUUID()),outcomes=useRef({}),marked=useRef(new Set());
  const saveCardProgress=async()=>{if(!onLearning)return;setProgressStatus('saving');try{await onLearning(Object.entries(outcomes.current).map(([chapter,g],i)=>({id:receipt.current+'_'+i,type:'cards',module:ue.id,chapter,...g})));setProgressStatus('done');}catch{setProgressStatus('error');}};

  useEffect(() => {
    let alive=true;
    loadStudy(ue.id,'cards',{chapter:ue.chapter,count:ue.count,focus:ue.focus}).then(({items}) => { if(alive){setCards(items);setLoading(false);} }).catch(error => {if(alive){toast.error(error.message);setCards([]);setLoading(false);}});
    return()=>{alive=false;};
  }, []);

  if (!ue) return null;
  const tags = cards ? ["Tous", ...new Set(cards.map(c => c.tag))] : [];
  const filtered = cards ? (filter === "Tous" ? cards : cards.filter(c => c.tag === filter)) : [];
  const card = filtered[idx % Math.max(filtered.length, 1)];
  const isLast = idx >= filtered.length - 1;

  const recordCard=known=>{if(marked.current.has(card.id))return;marked.current.add(card.id);const key=card.chapter,entry=outcomes.current[key] ||= {reviewed:0,known:0};entry.reviewed++;if(known)entry.known++;};
  const markKnown = () => {recordCard(true);setFlipped(false); if (isLast) { setSessionDone(true);saveCardProgress(); } else { setTimeout(() => setIdx(i => i + 1), 150); } };
  const markDifficult = () => {
    recordCard(false);
    setDifficult(d => d.some(c=>c.id===card.id)?d:[...d, card]);
    setFlipped(false);
    if (isLast) { setSessionDone(true);saveCardProgress(); }
    else { setTimeout(() => setIdx(i => i + 1), 150); }
  };
  const next = () => { setFlipped(false); setTimeout(() => setIdx(i => (i + 1) % filtered.length), 150); };
  const prev = () => { setFlipped(false); setTimeout(() => setIdx(i => (i - 1 + filtered.length) % filtered.length), 150); };

  // Review mode (Pro)
  if (reviewMode && difficult.length > 0) {
    const rCard = difficult[reviewIdx];
    return (
      <div style={S.root}><OrbBg />
        <StudyNotice /><nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← {ue.id}</button></nav>
        <div style={{ maxWidth: 580, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1, animation: "fsu .4s ease both" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, margin: 0, color: "var(--danger)" }}>◈ Révision des cartes difficiles</h2>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{reviewIdx + 1} / {difficult.length}</span>
          </div>
          <Flashcard card={rCard} flipped={reviewFlipped} onFlip={()=>setReviewFlipped(f=>!f)} review />
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
          <h2 style={{ fontSize: 22, color: "var(--ink)" }}>Session terminée</h2>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>{marked.current.size} cartes évaluées sur {filtered.length} · {difficult.length} marquées difficiles</p>
          {progressStatus==='done'&&<p role="status">Progression des cartes enregistrée.</p>}
          {progressStatus==='saving'&&<p role="status">Enregistrement de la progression…</p>}
          {progressStatus==='error'&&<p role="alert">La progression n’a pas été enregistrée. <button className="text-button" onClick={saveCardProgress}>Réessayer</button></p>}
          {difficult.length > 0 && (
            isPro ? (
              <button style={{ ...S.ctag, width: "100%", padding: 13 }} onClick={() => { setReviewMode(true); setReviewIdx(0); }}>
                Réviser les {difficult.length} cartes difficiles →
              </button>
            ) : (
              <div style={{ background: "rgba(226,201,126,.04)", border: "1px solid rgba(226,201,126,.2)", padding: "16px 20px", width: "100%" }}>
                <p style={{ fontSize: 13, color: "var(--ink)", margin: "0 0 8px", fontWeight: 700 }}>✦ Cartes difficiles · Pro</p>
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 12px" }}>Passez Pro pour revoir automatiquement vos {difficult.length} cartes difficiles et consolider votre mémoire.</p>
                <button style={{ ...S.ctag, width: "100%", padding: 10, fontSize: 12 }} onClick={onUpgrade}>Passer Pro · {PRO_PRICE}/mois →</button>
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
          <h2 style={{ fontSize: 18, margin: 0, color: "var(--ink)" }}>◈ Flashcards · {ue.short}</h2>
          {cards && <span style={{ fontSize: 12, color: "var(--muted)" }}>{idx + 1} / {filtered.length}</span>}
        </div>
        {!loading && cards?.length === 0 && <div role="alert"><p>Les flashcards n’ont pas pu être chargées.</p><button style={S.ctag} onClick={onBack}>Retour à la matière</button></div>}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}><div style={{ width: 36, height: 36, border: "3px solid var(--line)", borderTop: `3px solid ${ue.color}`, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} /><p style={{ color: "var(--muted)", fontSize: 13 }}>Chargement des flashcards…</p></div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {tags.map(t => <button key={t} style={{ ...S.fb, ...(filter === t ? S.fa : {}) }} onClick={() => { setFilter(t); setIdx(0); setFlipped(false); }}>{t}</button>)}
            </div>
            {card && (
              <>
                <Flashcard card={card} flipped={flipped} onFlip={()=>setFlipped(f=>!f)} />
                {flipped ? (
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <button style={{ flex: 1, background: "color-mix(in srgb, var(--danger) 7%, transparent)", border: "1px solid color-mix(in srgb, var(--danger) 25%, transparent)", color: "var(--danger)", padding: "12px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }} onClick={markDifficult}>✗ À revoir</button>
                    <button style={{ flex: 1, background: "color-mix(in srgb, var(--success) 7%, transparent)", border: "1px solid color-mix(in srgb, var(--success) 25%, transparent)", color: "var(--success)", padding: "12px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }} onClick={markKnown}>✓ Je savais</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={{ ...S.ctagh, flex: 1 }} onClick={prev}>← Précédente</button>
                    <button style={{ ...S.ctag, flex: 1 }} onClick={next}>Suivante →</button>
                  </div>
                )}
                {isPro && difficult.length > 0 && <p style={{ fontSize: 11, color: "var(--danger)", textAlign: "center" }}>{difficult.length} carte{difficult.length > 1 ? "s" : ""} marquée{difficult.length > 1 ? "s" : ""} difficile{difficult.length > 1 ? "s" : ""}</p>}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── RÉSUMÉ DE COURS ───────────────────────────────────────────────────────────
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
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-soft)" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={sc} strokeWidth="8" strokeDasharray={`${(anim / 100) * circ} ${circ}`} strokeLinecap="round" transform="rotate(-90 60 60)" style={{ filter: `drop-shadow(0 0 6px ${sc})` }} />
            <text x="60" y="54" textAnchor="middle" fill="var(--ink)" fontSize="28" fontWeight="900" fontFamily="monospace">{anim}</text>
            <text x="60" y="70" textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="monospace">/100</text>
          </svg>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>{topic} · {fmt(duration)}</p>
          <span style={{ fontSize: 11, letterSpacing: ".15em", color: sc, border: `1px solid color-mix(in srgb, ${sc} 31%, transparent)`, padding: "4px 16px", fontWeight: 700 }}>{ev.niveau}</span>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", padding: "20px 24px", width: "100%", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.7, margin: "0 0 14px" }}>{ev.verdict}</p>
          {ev.conseil_prioritaire && <div style={{ background: "color-mix(in srgb, var(--gold-text) 3%, transparent)", border: "1px solid color-mix(in srgb, var(--gold-text) 15%, transparent)", padding: "10px 16px" }}><p style={{ fontSize: 10, color: "var(--gold-text)", margin: "0 0 4px", letterSpacing: ".1em" }}>✦ CONSEIL PRIORITAIRE</p><p style={{ fontSize: 13, color: "var(--ink)", margin: 0, lineHeight: 1.6 }}>{ev.conseil_prioritaire}</p></div>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
          <div style={S.ec}><p style={{ ...S.et, color: "var(--success)" }}>✦ POINTS FORTS</p>{ev.points_forts?.map((p, i) => <p key={i} style={S.ei}>· {p}</p>)}</div>
          <div style={S.ec}><p style={{ ...S.et, color: "var(--gold-text)" }}>↗ À AMÉLIORER</p>{ev.axes_amelioration?.map((a, i) => <p key={i} style={S.ei}>· {a}</p>)}</div>
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
        <div style={{ ...S.card, textAlign: "center", borderColor: `color-mix(in srgb, ${sc} 19%, transparent)` }}>
          <p style={{ fontSize: 52, fontWeight: 900, color: sc, margin: "0 0 4px", filter: `drop-shadow(0 0 12px ${sc})` }}>{score}/{total}</p>
          <p style={{ fontSize: 14, color: "var(--ink)", fontWeight: 700, margin: "0 0 4px" }}>{pct}% de réussite</p>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>{ueName} · {fmt(duration)}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
          {answers?.map((a, i) => (
            <div key={i} style={{ background: "var(--surface)", border: `1px solid ${a.correct ? "color-mix(in srgb, var(--success) 15%, transparent)" : "color-mix(in srgb, var(--danger) 15%, transparent)"}`, padding: "10px 14px" }}>
              <p style={{ fontSize: 11, color: a.correct ? "var(--success)" : "var(--danger)", margin: "0 0 4px" }}>{a.correct ? "✓ Correct" : "✗ Incorrect"} {a.difficulte && `· ${a.difficulte}`}</p>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>{a.q}</p>
              {!a.correct && <p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0 0" }}>Réponse : {a.right}</p>}
              {a.expl && <p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0 0", fontStyle: "italic" }}>{a.expl}</p>}
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
  if (!ev) return <div style={S.root}><OrbBg /><div style={{ maxWidth: 500, margin: "80px auto", padding: 24, textAlign: "center" }}><p style={{ color: "var(--danger)" }}>Erreur d'évaluation.</p><button style={S.ctag} onClick={onDash}>Retour</button></div></div>;
  const nc = noteColor(ev.note);
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onDash}>← {data.ue}</button></nav>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "36px 24px 60px", display: "flex", flexDirection: "column", gap: 16, position: "relative", zIndex: 1, animation: "fsu .5s ease both" }}>
        <div style={{ ...S.card, textAlign: "center", borderColor: `color-mix(in srgb, ${nc} 19%, transparent)` }}>
          <p style={{ fontSize: 54, fontWeight: 900, color: nc, margin: "0 0 4px", filter: `drop-shadow(0 0 12px ${nc})` }}>{ev.note}<span style={{ fontSize: 22 }}>/20</span></p>
          <p style={{ fontSize: 14, color: "var(--ink)", fontWeight: 700, margin: "0 0 4px" }}>{ev.appreciation} · {cas?.titre}</p>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>{ueName} · {fmt(duration)}</p>
        </div>
        {ev.correction_par_question && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 10, letterSpacing: ".15em", color: "var(--muted)" }}>CORRECTION PAR QUESTION</p>
            {ev.correction_par_question.map(q => (
              <div key={q.num} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>Question {q.num}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: noteColor(q.note / (cas?.questions?.[q.num - 1]?.points || 10) * 20) }}>{q.note}/{cas?.questions?.[q.num - 1]?.points || "?"} pts</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--ink)", margin: "0 0 8px", lineHeight: 1.6 }}>{q.commentaire}</p>
                {q.elements_attendus && <div style={{ background: "var(--surface-soft)", border: "1px solid var(--surface-soft)", padding: "8px 12px" }}><p style={{ fontSize: 10, color: "var(--muted)", margin: "0 0 4px", letterSpacing: ".1em" }}>ÉLÉMENTS ATTENDUS</p><p style={{ fontSize: 12, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>{q.elements_attendus}</p></div>}
              </div>
            ))}
          </div>
        )}
        {ev.conseil && <div style={{ background: "color-mix(in srgb, var(--gold-text) 3%, transparent)", border: "1px solid color-mix(in srgb, var(--gold-text) 15%, transparent)", padding: "14px 18px" }}><p style={{ fontSize: 10, color: "var(--gold-text)", margin: "0 0 6px", letterSpacing: ".1em" }}>✦ CONSEIL</p><p style={{ fontSize: 13, color: "var(--ink)", margin: 0, lineHeight: 1.6 }}>{ev.conseil}</p></div>}
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
  const typeColor = (t) => t === "entretien" ? "var(--gold-text)" : t === "cas" ? "var(--gold-text)" : "var(--link)";
  const typeIcon = (t) => t === "entretien" ? "💼" : t === "cas" ? "📝" : "△";
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Dashboard</button></nav>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontSize: 20, margin: "0 0 20px", color: "var(--ink)" }}>▦ Historique</h2>
        {loading ? <p style={{ color: "var(--muted)" }}>Chargement…</p> : history.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>Aucune activité pour le moment.</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.map((h, i) => {
              const s = h.evaluation?.score || h.evaluation?.note || 0;
              const isNote = h.type === "cas"; const val = ["self-review","guided-review","written-review"].includes(h.mode) ? (h.mode === "guided-review" ? "Guidé" : "Comparé") : h.type === "qcm" ? `${h.score}/${h.total}` : isNote ? `${s}/20` : `${s}/100`;
              const col = ["self-review","guided-review","written-review"].includes(h.mode) ? "var(--gold-text)" : isNote ? noteColor(s) : scoreColor(s);
              return (
                <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--line)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", animation: `fsu .3s ${i * .04}s both` }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 14 }}>{typeIcon(h.type)}</span>
                      <span style={{ fontSize: 11, color: typeColor(h.type), border: `1px solid color-mix(in srgb, ${typeColor(h.type)} 19%, transparent)`, padding: "1px 6px" }}>{h.type?.toUpperCase()}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{h.ueName || h.topic || "·"}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>{h.date}</p>
                  </div>
                  <p style={{ fontSize: 24, fontWeight: 900, margin: 0, color: col, filter: `drop-shadow(0 0 6px color-mix(in srgb, ${col} 38%, transparent))` }}>{val}</p>
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
        <h2 style={{ fontSize: 26, margin: 0, color: "var(--ink)" }}>Passez à Pro</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>Cette fonctionnalité est réservée aux membres Pro.</p>
        <div style={{ ...S.pc, ...S.phl, width: "100%", animation: "glow 3s ease-in-out infinite" }}>
          <div style={S.pb}>SIMDCG PRO</div>
          <p style={{ fontSize: 40, fontWeight: 900, color: "var(--ink)", margin: "12px 0 4px" }}>{PRO_PRICE}<span style={{ fontSize: 14, color: "var(--muted)" }}>/mois</span></p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, margin: "14px 0 20px" }}>
            {["13 matières DCG + 7 matières DSCG", "Cas pratiques avec corrigés à comparer soi-même", "Flashcards enregistrées et reprise des cartes difficiles", "Planning de révision sans IA", "Préparer l’oral par écrit autonome et tuteur IA limité", "Historique complet & progression"].map(f => <p key={f} style={{ fontSize: 12, color: "var(--ink)", margin: 0 }}>✓ {f}</p>)}
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
  return <div style={{ background: "var(--surface)", border: `1px solid ${hl ? "rgba(226,201,126,.2)" : "var(--line)"}`, padding: "14px 10px", textAlign: "center" }}><p style={{ fontSize: 20, fontWeight: 900, margin: "0 0 3px", color: hl ? "var(--gold-text)" : "var(--ink)" }}>{v}</p><p style={{ fontSize: 9, color: "var(--muted)", margin: 0, letterSpacing: ".1em" }}>{l.toUpperCase()}</p></div>;
}
function FInput({ label, value, set, ph, type = "text" }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 5 }}><label style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--muted)", textTransform: "uppercase" }}>{label}</label><input aria-label={label} style={{ background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)", padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", transition: "border-color .2s" }} type={type} value={value} onChange={e => set(e.target.value)} placeholder={ph} onFocus={e => e.target.style.borderColor = "color-mix(in srgb, var(--gold-text) 25%, transparent)"} onBlur={e => e.target.style.borderColor = "var(--line)"} /></div>;
}
function Sect({ label, children }) {
  return <div><p style={{ fontSize: 10, letterSpacing: ".15em", color: "var(--muted)", margin: "0 0 10px", textTransform: "uppercase" }}>{label}</p>{children}</div>;
}
function OB({ active, color, onClick, main, sub }) {
  return <button onClick={onClick} style={{ flex: 1, background: active ? `color-mix(in srgb, ${color} 7%, transparent)` : "var(--surface)", border: `2px solid ${active ? color : "var(--line)"}`, color: active ? color : "var(--muted)", padding: "12px 8px", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all .15s", boxShadow: active ? `0 0 16px color-mix(in srgb, ${color} 13%, transparent)` : "none", fontFamily: "inherit" }}><strong>{main}</strong><span style={{ fontSize: 10, opacity: .6 }}>{sub}</span></button>;
}
function Spinner() {
  return <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span style={{ width: 13, height: 13, border: "2px solid var(--paper)", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} /> Chargement…</span>;
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
            <h2 style={{ fontSize: 20, color: "var(--success)", margin: 0 }}>Email envoyé !</h2>
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
              Un lien de réinitialisation a été envoyé à <strong style={{ color: "var(--ink)" }}>{email}</strong>. Vérifiez vos spams si vous ne le voyez pas.
            </p>
            <button style={{ ...S.ctag, marginTop: 8 }} onClick={onBack}>Retour à la connexion →</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 22, margin: "12px 0 4px", color: "var(--ink)" }}>Mot de passe oublié ?</h2>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>
            <FInput label="Email" value={email} set={setEmail} ph="jean@exemple.fr" type="email" />
            {err && <p style={{ fontSize: 12, color: "var(--danger)" }}>{err}</p>}
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
    { title: "2. Description du service", body: `SIMDCG est une plateforme de préparation aux examens DCG (Diplôme de Comptabilité et de Gestion) et DSCG (Diplôme Supérieur de Comptabilité et de Gestion). Le service propose une bibliothèque de cours par chapitre, QCM, flashcards et cas originaux avec corrigés, un planning et une préparation écrite à l’oral autonomes. Le contenu couvre partiellement les matières affichées. Un tuteur IA optionnel est soumis à des limites : 20 demandes par jour et 300 par mois, ainsi qu’un budget de génération et aux disponibilités du fournisseur.` },
    { title: "3. Accès et compte", body: `L'accès au service nécessite la création d'un compte via adresse email ou compte Google. L'utilisateur est responsable de la confidentialité de ses identifiants. Les titres et volumes de la bibliothèque sont consultables avant l'achat. Les cours et exercices nécessitent un accès payant actif, sans essai gratuit. Le plan Pro à ${PRO_PRICE}/mois donne accès aux contenus effectivement disponibles, au planning et au tuteur dans les limites indiquées. Le Pack Examen donne accès pendant 90 jours, sans renouvellement.` },
    { title: "4. Abonnement Pro", body: `Le plan Pro est facturé mensuellement via Stripe, prestataire de paiement sécurisé. L'abonnement est sans engagement et résiliable à tout moment depuis votre espace client Stripe. Aucun remboursement ne sera effectué pour la période en cours au moment de la résiliation.` },
    { title: "5. Propriété intellectuelle", body: `Les fiches et exercices originaux sont des supports de révision complémentaires. Les réponses du tuteur IA peuvent contenir des erreurs et doivent être comparées aux références applicables à votre session. L'interface, le logo et les éléments visuels sont la propriété exclusive de Marcus Bonnafis.` },
    { title: "6. Limitation de responsabilité", body: `SIMDCG est un outil de préparation et ne constitue pas un engagement de réussite aux examens. Les parcours couvrent partiellement les programmes et complètent les cours et annales de votre formation. SIMDCG ne saurait être tenu responsable des décisions prises sur la base des informations fournies.` },
    { title: "7. Modification et résiliation", body: `SIMDCG se réserve le droit de modifier les CGU à tout moment avec préavis de 30 jours. Les comptes inactifs depuis plus de 24 mois peuvent être supprimés après notification. Tout manquement aux présentes CGU peut entraîner la suspension du compte.` },
    { title: "8. Droit applicable", body: `Les présentes CGU sont régies par le droit français. Tout litige relève de la compétence exclusive des tribunaux français. Pour toute réclamation : contact.simdcg@gmail.com` },
  ];
  const confidentialiteContent = [
    { title: "1. Responsable du traitement", body: `Marcus Bonnafis (simdcg.com) est responsable du traitement de vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD · Règlement UE 2016/679).` },
    { title: "2. Données collectées", body: `Lors de l'inscription : prénom, adresse email, date d'inscription. Lors de l'utilisation : historique des sessions (QCM, entretiens, cas pratiques), scores obtenus, matières étudiées, streak quotidien. Données techniques : adresse IP, type de navigateur (via Firebase Analytics).` },
    { title: "3. Finalités du traitement", body: `Vos données sont utilisées pour : (a) la gestion de votre compte et authentification, (b) la personnalisation de votre expérience de révision, (c) le suivi de votre progression, (d) la facturation via Stripe pour les abonnés Pro, (e) l'amélioration du service.` },
    { title: "4. Base légale", body: `Le traitement de vos données repose sur votre consentement (art. 6.1.a RGPD) lors de la création de compte, et sur l'exécution du contrat (art. 6.1.b RGPD) pour les fonctionnalités du service.` },
    { title: "5. Sous-traitants", body: `SIMDCG utilise les prestataires suivants : Firebase (Google) pour l’authentification et la base de données, Stripe pour les paiements et Groq pour le tuteur IA et le retour optionnel sur les cas écrits. Lorsque vous demandez une analyse de cas, votre réponse et le corrigé de référence sont transmis à Groq. Lorsque vous utilisez le tuteur, le texte de votre question et le contexte récent de la conversation sont transmis à Groq. Le traitement par chaque prestataire suit ses conditions et sa politique de confidentialité.` },
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
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--ink)", margin: "0 0 6px" }}>
            {isCgu ? "Conditions Générales d'Utilisation" : "Politique de Confidentialité"}
          </h1>
          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>Dernière mise à jour : {today}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {content.map((sec, i) => (
            <div key={i} style={{ ...S.card, animation: `fsu .4s ${i * .05}s both` }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--gold-text)", letterSpacing: ".08em", margin: "0 0 10px" }}>{sec.title}</p>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.75, margin: 0 }}>{sec.body}</p>
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
    <div style={{ borderTop: "1px solid var(--surface)", padding: "28px 24px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Logo />
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <button style={{ ...S.nl, fontSize: 11, color: "var(--muted)" }} onClick={onCgu}>Conditions d'utilisation</button>
          <button style={{ ...S.nl, fontSize: 11, color: "var(--muted)" }} onClick={onConfidentialite}>Confidentialité</button>
          <a href="mailto:contact.simdcg@gmail.com" style={{ fontSize: 11, color: "var(--muted)", textDecoration: "none", fontFamily: "inherit" }}>contact.simdcg@gmail.com</a>
        </div>
        <p style={{ fontSize: 10, color: "var(--line)", margin: 0 }}>© {new Date().getFullYear()} SIMDCG · Tous droits réservés</p>
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  root: { minHeight: "100vh", background: "var(--paper)", color: "var(--ink)", fontFamily: "'Inter',system-ui,sans-serif", position: "relative", overflow: "hidden" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid var(--surface)", background: "var(--surface-translucent)", backdropFilter: "blur(12px)", position: "relative", zIndex: 2 },
  nl: { background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  no: { borderRadius: 14, background: "none", border: "1px solid var(--line)", color: "var(--muted)", fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" },
  nc: { borderRadius: 14, background: "var(--navy)", border: "none", color: "var(--on-accent)", fontSize: 12, padding: "7px 16px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" },
  badge: { borderRadius: 14, fontSize: 10, letterSpacing: ".18em", color: "var(--gold-text)", border: "1px solid rgba(226,201,126,.2)", padding: "5px 16px", background: "rgba(226,201,126,.04)" },
  ctag: { borderRadius: 14, background: "var(--navy)", border: "none", color: "var(--on-accent)", fontSize: 14, fontWeight: 700, padding: "13px 28px", cursor: "pointer", letterSpacing: ".04em", fontFamily: "inherit" },
  ctagh: { borderRadius: 14, background: "none", border: "1px solid var(--line)", color: "var(--muted)", fontSize: 14, padding: "13px 28px", cursor: "pointer", fontFamily: "inherit" },
  tag: { borderRadius: 14, fontSize: 11, border: "1px solid var(--line)", padding: "5px 12px", background: "var(--surface-soft)" },
  fc: { borderRadius: 14, background: "var(--surface)", border: "1px solid var(--surface-soft)", padding: "22px 18px", display: "flex", flexDirection: "column" },
  pc: { borderRadius: 14, background: "var(--surface)", border: "1px solid var(--line)", padding: "24px 20px", position: "relative", display: "flex", flexDirection: "column" },
  phl: { border: "1px solid rgba(226,201,126,.25)", background: "rgba(226,201,126,.03)" },
  pb: { position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "var(--gold-text)", color: "var(--paper)", fontSize: 9, padding: "3px 12px", fontWeight: 700, letterSpacing: ".12em", whiteSpace: "nowrap" },
  back: { background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer", padding: 0, alignSelf: "flex-start", fontFamily: "inherit" },
  mb: { borderRadius: 14, background: "var(--surface)", border: "1px solid var(--surface-soft)", padding: "16px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontFamily: "inherit" },
  uecard: { borderRadius: 14, background: "var(--surface)", border: "1px solid var(--surface-soft)", padding: "14px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "inherit", transition: "all .15s" },
  fb: { borderRadius: 14, background: "none", border: "1px solid var(--line)", color: "var(--muted)", padding: "5px 12px", fontSize: 11, cursor: "pointer", transition: "all .15s", fontFamily: "inherit" },
  fa: { border: "1px solid rgba(226,201,126,.35)", color: "var(--gold-text)", background: "rgba(226,201,126,.06)" },
  card: { borderRadius: 14, background: "var(--surface)", border: "1px solid var(--line)", padding: "20px 22px" },
  ava: { width: 30, height: 30, background: "var(--surface-soft)", border: "1px solid var(--line)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "var(--muted)", flexShrink: 0 },
  buba: { background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)", borderRadius: "0 8px 8px 8px" },
  bubu: { background: "rgba(226,201,126,.07)", border: "1px solid rgba(226,201,126,.18)", color: "var(--ink)", borderRadius: "8px 0 8px 8px" },
  ta: { borderRadius: 14, flex: 1, background: "var(--surface)", border: "1px solid var(--line)", color: "var(--ink)", padding: "12px 14px", fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.6 },
  sb: { borderRadius: 14, background: "var(--navy)", border: "none", color: "var(--on-accent)", width: 44, height: 44, fontSize: 18, cursor: "pointer", fontWeight: 700, flexShrink: 0, alignSelf: "flex-end" },
  ec: { borderRadius: 14, background: "var(--surface)", border: "1px solid var(--line)", padding: "14px 16px" },
  et: { fontSize: 9, letterSpacing: ".12em", margin: "0 0 10px" },
  ei: { fontSize: 12, color: "var(--muted)", margin: "4px 0", lineHeight: 1.55 },
};

export { ResultsQCM, History, LegalScreen, ForgotPasswordScreen, OnboardingModal, DCG_UES, DSCG_UES, QCMScreen, FlashcardsScreen, StudyPlanner as PlanningScreen, SavedLesson as ResumeCoursScreen, CasePractice as CasPratiqueScreen, Auth, InterviewConfig };
