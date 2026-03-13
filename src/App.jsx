import { useState, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// ── CONFIG ────────────────────────────────────────────────────────────────────
const STRIPE_LINK = "https://buy.stripe.com/3cI4gz9FpbrWfYJ4JH6wE02";
const PRO_PRICE = "15€";
const FREE_INTERVIEWS = 1;
const FREE_QCM_PER_UE = 3;
const FREE_FLASH_PER_UE = 5;
const PRO_FLASH_PER_UE = 12;

// ── UES DATA ──────────────────────────────────────────────────────────────────
const DCG_UES = [
  { id:"UE1", label:"Introduction au droit", short:"Droit général", icon:"⚖", color:"#60a5fa", desc:"Sources du droit, contrats, responsabilité civile et pénale", level:"DCG" },
  { id:"UE2", label:"Droit des sociétés", short:"Droit sociétés", icon:"🏛", color:"#a78bfa", desc:"SARL, SAS, SA, droit commun des sociétés, liquidation", level:"DCG", proOnly:true },
  { id:"UE3", label:"Droit social", short:"Droit social", icon:"🤝", color:"#34d399", desc:"Contrat de travail, conventions collectives, licenciement", level:"DCG", proOnly:true },
  { id:"UE4", label:"Fiscalité", short:"Fiscalité", icon:"📋", color:"#fbbf24", desc:"IS, IR, TVA, droits d'enregistrement, fiscalité internationale", level:"DCG" },
  { id:"UE6", label:"Finance d'entreprise", short:"Finance", icon:"📈", color:"#f87171", desc:"Analyse financière, investissement, financement, valorisation", level:"DCG", proOnly:true },
  { id:"UE7", label:"Management", short:"Management", icon:"◇", color:"#e2c97e", desc:"Stratégie, organisation, RH, direction, leadership", level:"DCG", proOnly:true },
  { id:"UE9", label:"Comptabilité", short:"Compta", icon:"🔢", color:"#38bdf8", desc:"PCG, immobilisations, stocks, provisions, capitaux propres", level:"DCG" },
  { id:"UE10", label:"Comptabilité approfondie", short:"Compta appro", icon:"📊", color:"#fb923c", desc:"Consolidation, fusion, comptes combinés, normes IFRS", level:"DCG", proOnly:true },
];
const DSCG_UES = [
  { id:"DSCG1", label:"Gestion juridique, fiscale et sociale", short:"Juridique/Fiscal", icon:"⚖", color:"#60a5fa", desc:"Droit avancé des affaires, montages juridiques complexes", level:"DSCG" },
  { id:"DSCG2", label:"Finance", short:"Finance avancée", icon:"📈", color:"#f87171", desc:"Marchés financiers, ingénierie financière, gestion de risques", level:"DSCG" },
  { id:"DSCG3", label:"Management et contrôle de gestion", short:"Management/CdG", icon:"◎", color:"#e2c97e", desc:"Stratégie avancée, contrôle de gestion, pilotage de la performance", level:"DSCG" },
  { id:"DSCG4", label:"Comptabilité et audit", short:"Compta/Audit", icon:"🔍", color:"#38bdf8", desc:"Normes IFRS, consolidation avancée, commissariat aux comptes", level:"DSCG" },
  { id:"DSCG5", label:"Systèmes d'information", short:"SI", icon:"💻", color:"#a78bfa", desc:"Architecture SI, sécurité, urbanisation, ERP", level:"DSCG" },
];
const ALL_UES = [...DCG_UES, ...DSCG_UES];

// ── INTERVIEW TOPICS ──────────────────────────────────────────────────────────
const INTERVIEW_TOPICS = [
  { id:"Contrôle de gestion", icon:"◎", desc:"Tableau de bord, écarts, ABC", free:true },
  { id:"Finance d'entreprise", icon:"📈", desc:"Analyse financière, ratios", free:false },
  { id:"Comptabilité", icon:"🔢", desc:"Clôtures, provisions, PCG", free:false },
  { id:"Management", icon:"◇", desc:"Leadership, organisation, stratégie", free:false },
  { id:"Fiscalité", icon:"📋", desc:"IS, TVA, optimisation fiscale", free:false },
  { id:"Général DCG/DSCG", icon:"◈", desc:"Toutes matières confondues", free:false },
];
const ROLES = [
  { id:"Junior (0-2 ans)", label:"Junior", sub:"0–2 ans", color:"#4ade80" },
  { id:"Confirmé (3-5 ans)", label:"Confirmé", sub:"3–5 ans", color:"#60a5fa" },
  { id:"Senior (5+ ans)", label:"Senior", sub:"5+ ans", color:"#f59e0b" },
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

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const scoreColor = (s) => s >= 80 ? "#4ade80" : s >= 60 ? "#f59e0b" : "#f87171";
const noteColor = (n) => n >= 14 ? "#4ade80" : n >= 10 ? "#f59e0b" : "#f87171";
const today = () => new Date().toISOString().split("T")[0];

// ── API ───────────────────────────────────────────────────────────────────────
async function callClaude(system, messages, maxTokens = 1200, user = null) {
  if (user && !user.isPro) {
    const allowed = await checkAndIncrementQuota(user.uid);
    if (!allowed) throw new Error("QUOTA_EXCEEDED");
  }
  const r = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: maxTokens, system, messages }),
  });
  const d = await r.json();
  return d.content?.[0]?.text || "";
}

async function callClaudeJSON(system, prompt, maxTokens = 2500, user = null) {
  const raw = await callClaude(system, [{ role: "user", content: prompt }], maxTokens, user);
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return null; }
}

// ── STORAGE (Firestore) ───────────────────────────────────────────────────────
const getUserDoc = (uid) => doc(db, "users", uid);
const saveHistory = async (uid, entry) => {
  try { await updateDoc(getUserDoc(uid), { history: arrayUnion(entry) }); } catch {}
};
const loadHistory = async (uid) => {
  try { const snap = await getDoc(getUserDoc(uid)); return snap.exists() ? (snap.data().history || []).reverse() : []; } catch { return []; }
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
const FREE_AI_CALLS_PER_DAY = 10;

const checkAndIncrementQuota = async (uid) => {
  // Retourne true si l'appel est autorisé, false si quota dépassé
  try {
    const snap = await getDoc(getUserDoc(uid));
    const data = snap.exists() ? snap.data() : {};
    const t = today();
    const quota = data.aiQuota || { count: 0, date: "" };
    if (quota.date !== t) {
      // Nouveau jour → reset
      await updateDoc(getUserDoc(uid), { aiQuota: { count: 1, date: t } });
      return true;
    }
    if (quota.count >= FREE_AI_CALLS_PER_DAY) return false;
    await updateDoc(getUserDoc(uid), { aiQuota: { count: quota.count + 1, date: t } });
    return true;
  } catch { return true; } // En cas d'erreur on laisse passer
};
// ── PARTICLES ─────────────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({ particles: [], mouse: { x: -9999, y: -9999 } });
  const TERMS = ["DCG","DSCG","UE4","IS","TVA","PCG","IFRS","SAS","SA","SARL","ROI","EVA","ABC","WACC","KPI","BFR","EBE","CAF","TIR","VAN"];
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const N = Math.min(50, Math.floor(window.innerWidth / 26));
    stateRef.current.particles = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: Math.random() * 1.4 + 0.4, label: Math.random() > .6 ? TERMS[Math.floor(Math.random() * TERMS.length)] : null,
      opacity: Math.random() * .4 + .1, pulse: Math.random() * Math.PI * 2,
    }));
    const onMouse = (e) => { stateRef.current.mouse = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMouse);
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { particles, mouse } = stateRef.current;
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.pulse += .018;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110 && dist > 0) { const f = (110 - dist) / 110 * .35; p.vx += (dx / dist) * f; p.vy += (dy / dist) * f; const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy); if (spd > 1.8) { p.vx = p.vx / spd * 1.8; p.vy = p.vy / spd * 1.8; } }
      });
      for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) { ctx.beginPath(); ctx.strokeStyle = `rgba(226,201,126,${(1 - d / 130) * .1})`; ctx.lineWidth = .5; ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); }
      }
      particles.forEach(p => {
        const gs = Math.max(0.1, p.r + Math.sin(p.pulse) * 1.1);
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gs * 5);
        grd.addColorStop(0, `rgba(226,201,126,${p.opacity * .35})`); grd.addColorStop(1, "rgba(226,201,126,0)");
        ctx.beginPath(); ctx.arc(p.x, p.y, gs * 5, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, gs, 0, Math.PI * 2); ctx.fillStyle = `rgba(226,201,126,${p.opacity * .85})`; ctx.fill();
        if (p.label) { ctx.font = "9px 'Courier New'"; ctx.fillStyle = `rgba(226,201,126,${p.opacity * .55})`; ctx.fillText(p.label, p.x + 6, p.y - 4); }
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMouse); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

function OrbBg() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    // Stars
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2, op: Math.random() * 0.7 + 0.15,
      phase: Math.random() * Math.PI * 2, speed: Math.random() * 0.008 + 0.003,
      layer: Math.floor(Math.random() * 3), // 0=far,1=mid,2=near
    }));
    // Nebulae
    const nebulae = [
      { x: 0.15, y: 0.2, r: 300, c: "rgba(96,165,250,0.022)" },
      { x: 0.85, y: 0.75, r: 260, c: "rgba(167,139,250,0.018)" },
      { x: 0.5, y: 0.55, r: 380, c: "rgba(226,201,126,0.012)" },
      { x: 0.1, y: 0.8, r: 200, c: "rgba(52,211,153,0.015)" },
    ];
    let t = 0;
    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw nebulae
      nebulae.forEach(n => {
        const grd = ctx.createRadialGradient(n.x * canvas.width, n.y * canvas.height, 0, n.x * canvas.width, n.y * canvas.height, n.r);
        grd.addColorStop(0, n.c); grd.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(n.x * canvas.width, n.y * canvas.height, n.r, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
      });
      // Draw stars
      stars.forEach(s => {
        const twinkle = 0.5 + 0.5 * Math.sin(s.phase + t * s.speed);
        const op = s.op * (0.6 + 0.4 * twinkle);
        const size = s.r * (0.85 + 0.15 * twinkle);
        ctx.beginPath(); ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
        if (s.layer === 2) {
          // Bright stars get a glow
          const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, size * 4);
          grd.addColorStop(0, `rgba(255,255,255,${op * 0.5})`); grd.addColorStop(1, "transparent");
          ctx.fillStyle = grd; ctx.arc(s.x, s.y, size * 4, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
        }
        ctx.fillStyle = s.layer === 0
          ? `rgba(180,190,210,${op * 0.6})`
          : s.layer === 1
          ? `rgba(220,230,245,${op * 0.8})`
          : `rgba(255,255,255,${op})`;
        ctx.fill();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("landing");
  const [authMode, setAuthMode] = useState("signup");
  const [selectedUE, setSelectedUE] = useState(null);
  const [interviewCfg, setInterviewCfg] = useState(null);
  const [result, setResult] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, { name: firebaseUser.displayName || firebaseUser.email.split("@")[0], email: firebaseUser.email, isPro: false, interviewsUsed: 0, streak: { count: 0, lastDate: "" }, history: [], createdAt: new Date().toISOString() });
        }
        const data = snap.exists() ? snap.data() : {};
        const streak = await loadStreak(firebaseUser.uid);
        const hist = (data.history || []).filter(h => h.type === "entretien");
        setUser({ uid: firebaseUser.uid, name: data.name || firebaseUser.displayName || firebaseUser.email.split("@")[0], email: firebaseUser.email, isPro: data.isPro || false, interviewsUsed: hist.length, streak });
        setScreen(s => s === "landing" ? "dashboard" : s);
      } else {
        setUser(null);
        setScreen("landing");
      }
      setLoadingAuth(false);
    });
    return unsub;
  }, []);

  const isPro = user?.isPro;
  const nav = (s) => setScreen(s);
  const toAuth = (m) => { setAuthMode(m); nav("auth"); };

  const onInterviewDone = async (data) => {
    const entry = { ...data, type: "entretien", date: new Date().toLocaleString("fr-FR"), dateISO: new Date().toISOString() };
    if (user) { await saveHistory(user.uid, entry); const s = await updateStreak(user.uid); setUser(u => ({ ...u, interviewsUsed: (u.interviewsUsed || 0) + 1, streak: s })); }
    setResult(entry); nav("results_interview");
  };
  const onQCMDone = async (data) => {
    const entry = { ...data, type: "qcm", date: new Date().toLocaleString("fr-FR"), dateISO: new Date().toISOString() };
    if (user) { await saveHistory(user.uid, entry); const s = await updateStreak(user.uid); setUser(u => ({ ...u, streak: s })); }
    setResult(entry); nav("results_qcm");
  };
  const onCasDone = async (data) => {
    const entry = { ...data, type: "cas", date: new Date().toLocaleString("fr-FR"), dateISO: new Date().toISOString() };
    if (user) { await saveHistory(user.uid, entry); const s = await updateStreak(user.uid); setUser(u => ({ ...u, streak: s })); }
    setResult(entry); nav("results_cas");
  };

  if (loadingAuth) return <div style={{ background: "#080b14", minHeight: "100vh" }} />;
  if (screen === "landing")          return <Landing onAuth={toAuth} onPricing={() => nav("pricing")} />;
  if (screen === "pricing")          return <Pricing onAuth={toAuth} onBack={() => nav("landing")} />;
  if (screen === "auth")             return <Auth mode={authMode} setMode={setAuthMode} onDone={async (u) => { setUser(u); nav("dashboard"); }} onBack={() => nav("landing")} />;
  if (screen === "dashboard")        return <Dashboard user={user} onLogout={() => { signOut(auth); setUser(null); nav("landing"); }} onNav={nav} onSelectUE={(ue) => { setSelectedUE(ue); nav("subject_hub"); }} isPro={isPro} />;
  if (screen === "subject_hub")      return <SubjectHub ue={selectedUE} user={user} onNav={nav} onBack={() => nav("dashboard")} />;
  if (screen === "qcm")              return <QCMScreen ue={selectedUE} user={user} onDone={onQCMDone} onBack={() => nav("subject_hub")} />;
  if (screen === "flashcards")       return <FlashcardsScreen ue={selectedUE} user={user} onBack={() => nav("subject_hub")} />;
  if (screen === "cas_pratique")     return <CasPratiqueScreen ue={selectedUE} user={user} onDone={onCasDone} onBack={() => nav("subject_hub")} />;
  if (screen === "interview_config") return <InterviewConfig user={user} onStart={(cfg) => { setInterviewCfg(cfg); nav("interview"); }} onBack={() => nav("dashboard")} />;
  if (screen === "interview")        return <InterviewScreen cfg={interviewCfg} onDone={onInterviewDone} />;
  if (screen === "results_interview")return <ResultsInterview data={result} onNew={() => nav("interview_config")} onDash={() => nav("dashboard")} />;
  if (screen === "results_qcm")      return <ResultsQCM data={result} onNew={() => nav("qcm")} onDash={() => nav("subject_hub")} />;
  if (screen === "results_cas")      return <ResultsCas data={result} onNew={() => nav("cas_pratique")} onDash={() => nav("subject_hub")} />;
  if (screen === "paywall")          return <Paywall onUpgrade={() => { window.open(STRIPE_LINK, "_blank"); setUser(u => ({ ...u, isPro: true })); }} onBack={() => nav("dashboard")} />;
  if (screen === "history")          return <History user={user} onBack={() => nav("dashboard")} />;
  if (screen === "progress")         return <ProgressScreen user={user} onBack={() => nav("dashboard")} />;
  return null;
}

// ── LANDING ───────────────────────────────────────────────────────────────────
function Landing({ onAuth, onPricing }) {
  return (
    <div style={S.root}>
      <ParticleCanvas /><OrbBg />
      <nav style={S.nav}>
        <Logo glow />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button style={S.nl} onClick={onPricing}>Tarifs</button>
          <button style={S.no} onClick={() => onAuth("login")}>Connexion</button>
          <button style={{ ...S.nc, animation: "glow 3s ease-in-out infinite" }} onClick={() => onAuth("signup")}>Essai gratuit</button>
        </div>
      </nav>
      <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto", padding: "88px 24px 48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ ...S.badge, animation: "fsu .7s ease both" }}>◈ PRÉPARATION DCG · DSCG · ENTRETIENS</div>
        <h1 style={{ fontSize: 52, fontWeight: 900, margin: 0, lineHeight: 1.06, letterSpacing: -3, animation: "fsu .7s .1s both" }}>
          La plateforme<br />
          <span style={{ color: "#e2c97e" }}>DCG / DSCG</span>
        </h1>
        <p style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.75, margin: 0, maxWidth: 480, animation: "fsu .7s .2s both" }}>
          QCM générés par IA, cas pratiques, flashcards et simulateur d'entretien — tout ce qu'il faut pour décrocher le diplôme et le poste.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", animation: "fsu .7s .3s both" }}>
          <button style={{ ...S.ctag, animation: "glow 3s ease-in-out infinite" }} onClick={() => onAuth("signup")}>Commencer gratuitement →</button>
          <button style={S.ctagh} onClick={onPricing}>Voir les tarifs</button>
        </div>
        <p style={{ fontSize: 11, color: "#374151", letterSpacing: ".08em", animation: "fi 1s .5s both" }}>Accès gratuit · Sans carte bancaire</p>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, position: "relative", zIndex: 1 }}>
        {[
          { icon: "🎓", label: "Mode Diplôme", color: "#60a5fa", items: ["QCM IA illimités par UE", "Cas pratiques style examen", "Flashcards de révision IA", "13 matières DCG + DSCG"] },
          { icon: "💼", label: "Mode Carrière", color: "#e2c97e", items: ["Simulateur d'entretien IA", "6 thématiques Finance/Gestion", "Score et coaching personnalisé", "Feedback recruteur senior"] },
        ].map((m, i) => (
          <div key={m.label} style={{ ...S.fc, borderColor: `${m.color}20`, animation: `fsu .6s ${.4 + i * .1}s both` }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{m.icon}</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: m.color, margin: "0 0 12px", letterSpacing: ".05em" }}>{m.label}</p>
            {m.items.map(it => <p key={it} style={{ fontSize: 12, color: "#4b5563", margin: "3px 0" }}>✓ {it}</p>)}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 10, letterSpacing: ".2em", color: "#374151", marginBottom: 14, textAlign: "center" }}>13 MATIÈRES COUVERTES</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {ALL_UES.map((ue, i) => (
            <span key={ue.id} style={{ ...S.tag, borderColor: `${ue.color}30`, color: ue.color, animation: `fsu .5s ${.5 + i * .03}s both` }}>
              <span style={{ fontSize: 10, opacity: .5, marginRight: 4 }}>{ue.level}</span>{ue.short}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PRICING ───────────────────────────────────────────────────────────────────
function Pricing({ onAuth, onBack }) {
  return (
    <div style={S.root}><ParticleCanvas /><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Retour</button></nav>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "60px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ ...S.badge, display: "inline-block", marginBottom: 12 }}>TARIFS</div>
          <h2 style={{ fontSize: 34, margin: "0 0 8px", color: "#e8e4d9", fontWeight: 900 }}>Simple. Transparent.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { label: "Gratuit", price: "0€", hl: false, cta: "Commencer →", fn: () => onAuth("signup"), feats: ["3 QCM par matière (UE1, UE4, UE9)", "5 flashcards par matière", "1 entretien simulé", "2 matières DCG accessibles"] },
            { label: "Pro", price: PRO_PRICE, hl: true, cta: "Démarrer Pro →", fn: () => window.open(STRIPE_LINK, "_blank"), feats: ["QCM illimités par UE", "Cas pratiques illimités", "12 flashcards par matière", "Entretiens illimités", "13 matières DCG + DSCG", "Historique & progression", "Streak quotidien"] },
          ].map(p => (
            <div key={p.label} style={{ ...S.pc, ...(p.hl ? S.phl : {}), ...(p.hl ? { animation: "glow 3s ease-in-out infinite" } : {}) }}>
              {p.hl && <div style={S.pb}>RECOMMANDÉ</div>}
              <p style={{ fontSize: 11, letterSpacing: ".15em", color: p.hl ? "#e2c97e" : "#6b7280", margin: "0 0 10px" }}>{p.label.toUpperCase()}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20 }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: "#e8e4d9" }}>{p.price}</span>
                {p.hl && <span style={{ fontSize: 12, color: "#6b7280" }}>/mois</span>}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {p.feats.map(f => <p key={f} style={{ fontSize: 12, color: "#c9c3b5", margin: 0 }}>✓ {f}</p>)}
              </div>
              <button style={{ ...(p.hl ? S.ctag : S.ctagh), width: "100%", padding: 12 }} onClick={p.fn}>{p.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
        cred = await createUserWithEmailAndPassword(auth, email, pass);
        const ref = doc(db, "users", cred.user.uid);
        await setDoc(ref, { name, email, isPro: false, interviewsUsed: 0, streak: { count: 0, lastDate: "" }, history: [], createdAt: new Date().toISOString() });
      } else {
        cred = await signInWithEmailAndPassword(auth, email, pass);
      }
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const data = snap.exists() ? snap.data() : {};
      const streak = await loadStreak(cred.user.uid);
      const hist = (data.history || []).filter(h => h.type === "entretien");
      onDone({ uid: cred.user.uid, name: data.name || name || email.split("@")[0], email, isPro: data.isPro || false, interviewsUsed: hist.length, streak });
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
      if (!snap.exists()) {
        await setDoc(ref, { name: cred.user.displayName || cred.user.email.split("@")[0], email: cred.user.email, isPro: false, interviewsUsed: 0, streak: { count: 0, lastDate: "" }, history: [], createdAt: new Date().toISOString() });
      }
      const data = snap.exists() ? snap.data() : {};
      const streak = await loadStreak(cred.user.uid);
      const hist = (data.history || []).filter(h => h.type === "entretien");
      onDone({ uid: cred.user.uid, name: data.name || cred.user.displayName || cred.user.email.split("@")[0], email: cred.user.email, isPro: data.isPro || false, interviewsUsed: hist.length, streak });
    } catch (e) { setErr("Erreur Google. Réessayez."); }
    setLoading(false);
  };
  return (
    <div style={S.root}><ParticleCanvas /><OrbBg />
      <div style={{ maxWidth: 400, margin: "0 auto", padding: "60px 24px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 12, animation: "fsu .5s ease both" }}>
        <button style={S.back} onClick={onBack}>← Accueil</button>
        <Logo />
        <h2 style={{ fontSize: 22, margin: "12px 0 4px", color: "#e8e4d9" }}>{mode === "signup" ? "Créer un compte" : "Se connecter"}</h2>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>{mode === "signup" ? "Accès gratuit inclus. Aucune carte requise." : "Bon retour."}</p>
        <button style={{ background: "#0d1117", border: "1px solid #1f2937", color: "#e8e4d9", padding: "11px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }} onClick={googleSignIn} disabled={loading}>
          <span style={{ fontSize: 16 }}>G</span> Continuer avec Google
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ flex: 1, height: 1, background: "#1f2937" }} /><span style={{ fontSize: 10, color: "#374151" }}>ou</span><div style={{ flex: 1, height: 1, background: "#1f2937" }} /></div>
        {mode === "signup" && <FInput label="Prénom" value={name} set={setName} ph="Jean-Baptiste" />}
        <FInput label="Email" value={email} set={setEmail} ph="jean@exemple.fr" type="email" />
        <FInput label="Mot de passe" value={pass} set={setPass} ph="••••••••" type="password" />
        {err && <p style={{ fontSize: 12, color: "#f87171" }}>{err}</p>}
        <button style={{ ...S.ctag, width: "100%", opacity: loading ? .6 : 1, marginTop: 4 }} onClick={submit} disabled={loading}>
          {loading ? <Spinner /> : mode === "signup" ? "Créer mon compte →" : "Se connecter →"}
        </button>
        <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>
          {mode === "signup" ? "Déjà un compte ? " : "Pas encore ? "}
          <span style={{ color: "#e2c97e", cursor: "pointer" }} onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setErr(""); }}>
            {mode === "signup" ? "Se connecter" : "S'inscrire"}
          </span>
        </p>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ user, onLogout, onNav, onSelectUE, isPro }) {
  const [activeTab, setActiveTab] = useState("diplome");
  const interviewsUsed = user?.interviewsUsed || 0;
  const canInterview = isPro || interviewsUsed < FREE_INTERVIEWS;

  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}>
        <Logo />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {!isPro && <button style={{ ...S.no, borderColor: "rgba(226,201,126,.3)", color: "#e2c97e" }} onClick={() => onNav("pricing")}>✦ Pro — {PRO_PRICE}/mois</button>}
          <span style={{ fontSize: 12, color: "#374151" }}>{user?.name}</span>
          <button style={S.no} onClick={onLogout}>Déconnexion</button>
        </div>
      </nav>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24, animation: "fsu .5s ease both" }}>
          <SC v={user?.streak || 0} l="🔥 Streak" /><SC v={isPro ? "Pro ✦" : "Gratuit"} l="Plan" hl /><SC v={interviewsUsed} l="Entretiens" /><SC v={isPro ? "∞" : Math.max(0, FREE_INTERVIEWS - interviewsUsed)} l="Restants" />
        </div>

        <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid #111827" }}>
          {[{ id: "diplome", label: "🎓 Mode Diplôme", sub: "DCG / DSCG" }, { id: "carriere", label: "💼 Mode Carrière", sub: "Entretiens" }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ background: "none", border: "none", borderBottom: `2px solid ${activeTab === t.id ? "#e2c97e" : "transparent"}`, color: activeTab === t.id ? "#e2c97e" : "#6b7280", padding: "12px 24px", cursor: "pointer", fontSize: 14, fontWeight: activeTab === t.id ? 700 : 400, transition: "all .2s", fontFamily: "inherit" }}>
              {t.label} <span style={{ fontSize: 10, opacity: .6, display: "block" }}>{t.sub}</span>
            </button>
          ))}
        </div>

        {activeTab === "diplome" && (
          <div style={{ animation: "fsu .3s ease both" }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, letterSpacing: ".15em", color: "#374151", marginBottom: 12 }}>DCG — 8 MATIÈRES</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {DCG_UES.map((ue, i) => {
                  const locked = ue.proOnly && !isPro;
                  return (
                    <button key={ue.id} onClick={() => locked ? onNav("paywall") : onSelectUE(ue)}
                      style={{ ...S.uecard, borderColor: `${ue.color}20`, opacity: locked ? .45 : 1, animation: `fsu .4s ${i * .04}s both` }}
                      onMouseEnter={e => { if (!locked) { e.currentTarget.style.borderColor = `${ue.color}50`; e.currentTarget.style.background = `${ue.color}08`; } }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${ue.color}20`; e.currentTarget.style.background = "#0d1117"; }}>
                      <span style={{ fontSize: 20, marginBottom: 6 }}>{ue.icon}</span>
                      <span style={{ fontSize: 10, color: ue.color, fontWeight: 700, letterSpacing: ".08em" }}>{ue.id}</span>
                      <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, lineHeight: 1.3 }}>{locked ? "🔒 Pro" : ue.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 10, letterSpacing: ".15em", color: "#374151", marginBottom: 12 }}>DSCG — 5 MATIÈRES {!isPro && <span style={{ color: "#e2c97e" }}>· Pro requis</span>}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                {DSCG_UES.map((ue, i) => (
                  <button key={ue.id} onClick={() => isPro ? onSelectUE(ue) : onNav("paywall")}
                    style={{ ...S.uecard, borderColor: `${ue.color}20`, opacity: isPro ? 1 : .4, animation: `fsu .4s ${.3 + i * .04}s both` }}>
                    <span style={{ fontSize: 20, marginBottom: 6 }}>{ue.icon}</span>
                    <span style={{ fontSize: 10, color: ue.color, fontWeight: 700, letterSpacing: ".08em" }}>{ue.id.replace("DSCG", "D")}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, lineHeight: 1.3 }}>{isPro ? ue.short : "🔒 Pro"}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "carriere" && (
          <div style={{ animation: "fsu .3s ease both", display: "flex", flexDirection: "column", gap: 12 }}>
            <button style={{ ...S.ctag, padding: 16, fontSize: 15, animation: "glow 3s ease-in-out infinite", width: "100%" }}
              onClick={() => canInterview ? onNav("interview_config") : onNav("paywall")}>
              + Lancer un simulateur d'entretien
            </button>
            {!isPro && <p style={{ fontSize: 12, color: "#374151", textAlign: "center" }}>{interviewsUsed}/{FREE_INTERVIEWS} entretien gratuit utilisé</p>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
              {[{ icon: "▦", label: "Historique", key: "history" }, { icon: "◎", label: "Progression", key: "progress" }].map(m => (
                <button key={m.key} onClick={() => !isPro ? onNav("paywall") : onNav(m.key)} style={{ ...S.mb, opacity: !isPro ? .4 : 1 }}>
                  <span style={{ fontSize: 22 }}>{m.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#e8e4d9" }}>{m.label}</span>
                  <span style={{ fontSize: 10, color: "#374151" }}>{!isPro ? "🔒 Pro" : "Voir →"}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isPro && (
          <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(226,201,126,.03)", border: "1px solid rgba(226,201,126,.15)", padding: "14px 18px", gap: 12 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#e8e4d9", margin: "0 0 3px" }}>Passez Pro — {PRO_PRICE}/mois</p>
              <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>QCM illimités, cas pratiques, DSCG, historique complet.</p>
            </div>
            <button style={{ ...S.ctag, whiteSpace: "nowrap", fontSize: 12 }} onClick={() => onNav("pricing")}>Voir →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SUBJECT HUB ───────────────────────────────────────────────────────────────
function SubjectHub({ ue, user, onNav, onBack }) {
  if (!ue) return null;
  const isPro = user?.isPro;
  const actions = [
    { key: "qcm", icon: "△", label: "QCM", sub: `${isPro ? "10" : FREE_QCM_PER_UE} questions générées par IA`, color: "#60a5fa", free: true },
    { key: "flashcards", icon: "◈", label: "Flashcards", sub: `${isPro ? PRO_FLASH_PER_UE : FREE_FLASH_PER_UE} fiches de révision IA`, color: "#4ade80", free: true },
    { key: "cas_pratique", icon: "📝", label: "Cas pratique", sub: "Style épreuve examen corrigé par IA", color: "#f59e0b", free: false },
  ];
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Toutes les matières</button></nav>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1, animation: "fsu .4s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: `${ue.color}15`, border: `1px solid ${ue.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{ue.icon}</div>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span style={{ ...S.badge, fontSize: 9, padding: "2px 8px" }}>{ue.level}</span>
              <span style={{ fontSize: 12, color: ue.color, fontWeight: 700 }}>{ue.id}</span>
            </div>
            <h2 style={{ fontSize: 20, margin: 0, color: "#e8e4d9" }}>{ue.label}</h2>
            <p style={{ fontSize: 12, color: "#4b5563", margin: "4px 0 0" }}>{ue.desc}</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {actions.map((a, i) => {
            const locked = !a.free && !isPro;
            return (
              <button key={a.key} onClick={() => locked ? onNav("paywall") : onNav(a.key)}
                style={{ background: "#0d1117", border: `1px solid ${locked ? "#1a1f2e" : `${a.color}25`}`, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, cursor: locked ? "default" : "pointer", opacity: locked ? .5 : 1, transition: "all .2s", textAlign: "left", animation: `fsu .4s ${i * .08}s both` }}
                onMouseEnter={e => { if (!locked) e.currentTarget.style.borderColor = `${a.color}50`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = locked ? "#1a1f2e" : `${a.color}25`; }}>
                <span style={{ fontSize: 28, width: 40, textAlign: "center" }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: locked ? "#374151" : a.color, margin: "0 0 3px" }}>{a.label}</p>
                  <p style={{ fontSize: 12, color: "#4b5563", margin: 0 }}>{locked ? "🔒 Réservé Pro" : a.sub}</p>
                </div>
                <span style={{ fontSize: 18, color: locked ? "#1f2937" : a.color }}>→</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── QCM SCREEN ────────────────────────────────────────────────────────────────
function QCMScreen({ ue, user, onDone, onBack }) {
  const isPro = user?.isPro;
  const nQuestions = isPro ? 10 : FREE_QCM_PER_UE;
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
    const gen = async () => {
      setLoading(true);
      const data = await callClaudeJSON(`Tu génères des QCM pour l'examen ${ue.label} (${ue.level}). Réponds UNIQUEMENT en JSON valide.`, QCM_PROMPT(ue, nQuestions), 2500);
      if (Array.isArray(data) && data.length > 0) { setQuestions(data); timerRef.current = setInterval(() => setTimer(t => t + 1), 1000); }
      else setError(true);
      setLoading(false);
    };
    gen();
    return () => clearInterval(timerRef.current);
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
          {questions && <span style={{ fontSize: 12, color: "#e2c97e", fontFamily: "monospace" }}>{fmt(timer)}</span>}
          {questions && <span style={{ fontSize: 11, color: "#6b7280" }}>{qi + 1}/{questions.length}</span>}
          <button style={S.nl} onClick={onBack}>Quitter</button>
        </div>
      </nav>

      {questions && <div style={{ height: 2, background: "#0d1117" }}><div style={{ height: "100%", width: `${((qi + (sel !== null ? 1 : 0)) / questions.length) * 100}%`, background: `linear-gradient(90deg,${ue.color},#e2c97e)`, transition: "width .3s" }} /></div>}

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1 }}>
        {loading && <div style={{ textAlign: "center", padding: "80px 24px" }}><div style={{ width: 40, height: 40, border: "3px solid #1f2937", borderTop: `3px solid ${ue.color}`, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 20px" }} /><p style={{ color: "#6b7280", fontSize: 13 }}>Génération des questions par IA…</p></div>}
        {error && <div style={{ textAlign: "center", padding: 40 }}><p style={{ color: "#f87171" }}>Erreur lors de la génération.</p><button style={S.ctag} onClick={onBack}>Retour</button></div>}
        {!loading && !error && q && (
          <div style={{ animation: "fsu .3s ease both" }}>
            <div style={{ ...S.card, marginBottom: 14, borderColor: `${ue.color}15` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <p style={{ fontSize: 10, color: ue.color, letterSpacing: ".1em", margin: 0 }}>QUESTION {qi + 1}</p>
                {q.difficulte && <span style={{ fontSize: 9, padding: "2px 8px", border: `1px solid ${q.difficulte === "Difficile" ? "#f87171" : q.difficulte === "Moyen" ? "#f59e0b" : "#4ade80"}40`, color: q.difficulte === "Difficile" ? "#f87171" : q.difficulte === "Moyen" ? "#f59e0b" : "#4ade80" }}>{q.difficulte}</span>}
              </div>
              <p style={{ fontSize: 15, color: "#e8e4d9", lineHeight: 1.6, margin: 0, fontWeight: 600 }}>{q.q}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {q.options?.map((opt, i) => {
                let bg = "#0d1117", border = "#1a1f2e", color = "#9ca3af";
                if (sel !== null) { if (i === q.answer) { bg = `${ue.color}10`; border = ue.color; color = ue.color; } else if (i === sel && i !== q.answer) { bg = "#f8717110"; border = "#f87171"; color = "#f87171"; } }
                return <button key={i} onClick={() => pick(i)} style={{ background: bg, border: `1px solid ${border}`, color, padding: "12px 16px", textAlign: "left", cursor: sel === null ? "pointer" : "default", fontSize: 13, transition: "all .2s", fontFamily: "inherit" }}>{String.fromCharCode(65 + i)}. {opt}</button>;
              })}
            </div>
            {sel !== null && <div style={{ background: "#0d1117", border: "1px solid #1f2937", padding: "12px 16px", marginBottom: 14 }}><p style={{ fontSize: 10, color: "#6b7280", margin: "0 0 4px", letterSpacing: ".1em" }}>EXPLICATION</p><p style={{ fontSize: 13, color: "#c9c3b5", margin: 0, lineHeight: 1.6 }}>{q.expl}</p></div>}
            {sel !== null && <button style={{ ...S.ctag, width: "100%", padding: 13 }} onClick={next}>{qi + 1 >= questions.length ? "Voir les résultats →" : "Question suivante →"}</button>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── FLASHCARDS ────────────────────────────────────────────────────────────────
function FlashcardsScreen({ ue, user, onBack }) {
  const isPro = user?.isPro;
  const nCards = isPro ? PRO_FLASH_PER_UE : FREE_FLASH_PER_UE;
  const [cards, setCards] = useState(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tous");

  useEffect(() => {
    callClaudeJSON(`Tu génères des flashcards pour ${ue.label} (${ue.level}). Réponds UNIQUEMENT en JSON valide.`, FLASHCARD_PROMPT(ue, nCards), 2000)
      .then(data => { setCards(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  if (!ue) return null;
  const tags = cards ? ["Tous", ...new Set(cards.map(c => c.tag))] : [];
  const filtered = cards ? (filter === "Tous" ? cards : cards.filter(c => c.tag === filter)) : [];
  const card = filtered[idx % Math.max(filtered.length, 1)];
  const next = () => { setFlipped(false); setTimeout(() => setIdx(i => (i + 1) % filtered.length), 150); };
  const prev = () => { setFlipped(false); setTimeout(() => setIdx(i => (i - 1 + filtered.length) % filtered.length), 150); };

  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← {ue.id}</button></nav>
      <div style={{ maxWidth: 580, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1, animation: "fsu .4s ease both" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, margin: 0, color: "#e8e4d9" }}>◈ Flashcards — {ue.short}</h2>
          {cards && <span style={{ fontSize: 12, color: "#4b5563" }}>{(idx % filtered.length) + 1} / {filtered.length}</span>}
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60 }}><div style={{ width: 36, height: 36, border: "3px solid #1f2937", borderTop: `3px solid ${ue.color}`, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} /><p style={{ color: "#6b7280", fontSize: 13 }}>Génération des flashcards…</p></div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {tags.map(t => <button key={t} style={{ ...S.fb, ...(filter === t ? S.fa : {}) }} onClick={() => { setFilter(t); setIdx(0); setFlipped(false); }}>{t}</button>)}
            </div>
            {card && (
              <>
                <div style={{ perspective: 1200, marginBottom: 20, cursor: "pointer" }} onClick={() => setFlipped(f => !f)}>
                  <div style={{ position: "relative", transformStyle: "preserve-3d", transition: "transform .55s cubic-bezier(.4,0,.2,1)", transform: flipped ? "rotateY(180deg)" : "rotateY(0)", height: 220 }}>
                    <div style={{ ...S.card, backfaceVisibility: "hidden", position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", borderColor: `${ue.color}15` }}>
                      <p style={{ fontSize: 10, color: ue.color, letterSpacing: ".12em", margin: "0 0 14px" }}>{card.tag || ue.short}</p>
                      <p style={{ fontSize: 15, color: "#e8e4d9", lineHeight: 1.6, margin: "0 0 16px", fontWeight: 600 }}>{card.q}</p>
                      <p style={{ fontSize: 11, color: "#374151" }}>Cliquer pour révéler →</p>
                    </div>
                    <div style={{ ...S.card, backfaceVisibility: "hidden", position: "absolute", inset: 0, transform: "rotateY(180deg)", borderColor: "#4ade8030", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <p style={{ fontSize: 10, color: "#4ade80", letterSpacing: ".12em", margin: "0 0 14px" }}>RÉPONSE</p>
                      <p style={{ fontSize: 13, color: "#c9c3b5", lineHeight: 1.7, margin: 0 }}>{card.a}</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ ...S.ctagh, flex: 1 }} onClick={prev}>← Précédente</button>
                  <button style={{ ...S.ctag, flex: 1 }} onClick={next}>Suivante →</button>
                </div>
              </>
            )}
          </>
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
      const data = await callClaudeJSON(`Tu génères des cas pratiques style examen DCG/DSCG. Réponds UNIQUEMENT en JSON valide.`, CAS_PROMPT(ue), 1500);
      if (data) { setCas({ ...data, ue: ue.id, ueName: ue.label, level: ue.level }); timerRef.current = setInterval(() => setTimer(t => t + 1), 1000); }
      setLoading(false);
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
          {cas && <span style={{ fontSize: 12, color: "#e2c97e", fontFamily: "monospace" }}>{fmt(timer)}</span>}
          <button style={S.nl} onClick={onBack}>Quitter</button>
        </div>
      </nav>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1, flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80 }}><div style={{ width: 40, height: 40, border: "3px solid #1f2937", borderTop: `3px solid ${ue.color}`, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 20px" }} /><p style={{ color: "#6b7280", fontSize: 13 }}>Génération du cas pratique…</p></div>
        ) : cas ? (
          <div style={{ animation: "fsu .4s ease both" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
              <span style={{ ...S.badge, fontSize: 9 }}>{ue.level} · {ue.id}</span>
              <span style={{ fontSize: 11, color: "#6b7280" }}>{cas.duree_estimee}</span>
              <span style={{ fontSize: 11, padding: "2px 8px", border: "1px solid #f59e0b40", color: "#f59e0b" }}>{cas.difficulte}</span>
            </div>
            <h2 style={{ fontSize: 18, color: "#e8e4d9", margin: "0 0 16px" }}>{cas.titre}</h2>
            <div style={{ ...S.card, marginBottom: 20, borderColor: `${ue.color}15` }}>
              <p style={{ fontSize: 10, color: ue.color, letterSpacing: ".1em", margin: "0 0 10px" }}>CONTEXTE</p>
              <p style={{ fontSize: 13, color: "#c9c3b5", lineHeight: 1.7, margin: 0 }}>{cas.contexte}</p>
            </div>
            <div style={{ ...S.card, marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: "#e2c97e", letterSpacing: ".1em", margin: "0 0 14px" }}>QUESTIONS ({cas.questions?.reduce((s, q) => s + q.points, 0)} points)</p>
              {cas.questions?.map(q => (
                <div key={q.num} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #111827" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "#e2c97e", fontWeight: 700 }}>Question {q.num}</span>
                    <span style={{ fontSize: 10, color: "#6b7280" }}>{q.points} pts</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#e8e4d9", margin: 0, lineHeight: 1.6 }}>{q.enonce}</p>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, letterSpacing: ".1em" }}>VOTRE RÉPONSE</p>
              <textarea value={reponse} onChange={e => setReponse(e.target.value)} placeholder="Répondez aux questions. Structurez votre réponse par numéro de question…" rows={12}
                style={{ width: "100%", background: "#0d1117", border: "1px solid #1f2937", color: "#e8e4d9", padding: "14px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.65, boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#e2c97e40"} onBlur={e => e.target.style.borderColor = "#1f2937"} />
            </div>
            <button style={{ ...S.ctag, width: "100%", padding: 15, opacity: !reponse.trim() || evaluating ? .5 : 1 }} onClick={submit} disabled={!reponse.trim() || evaluating}>
              {evaluating ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Spinner />Correction en cours…</span> : "Rendre la copie →"}
            </button>
          </div>
        ) : <div style={{ textAlign: "center", padding: 40 }}><p style={{ color: "#f87171" }}>Erreur de génération.</p><button style={S.ctag} onClick={onBack}>Retour</button></div>}
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
        <h2 style={{ fontSize: 22, margin: 0, color: "#e8e4d9" }}>Configurer l'entretien</h2>
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
                  style={{ background: "#0d1117", border: `1px solid ${topic === t.id ? "rgba(226,201,126,.3)" : "#111827"}`, padding: "10px 14px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3, opacity: locked ? .4 : 1, cursor: locked ? "default" : "pointer", transition: "all .15s", fontFamily: "inherit" }}>
                  <span style={{ fontSize: 14 }}>{t.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: topic === t.id ? "#e2c97e" : locked ? "#374151" : "#9ca3af" }}>{t.id}</span>
                  <span style={{ fontSize: 10, color: "#374151" }}>{locked ? "🔒 Pro" : t.desc}</span>
                </button>
              );
            })}
          </div>
        </Sect>
        <Sect label="Durée">
          <div style={{ display: "flex", gap: 10 }}>
            {DURATIONS.map(d => <OB key={d.id} active={dur === d.id} color="#e2c97e" onClick={() => setDur(d.id)} main={d.label} sub={d.sub} />)}
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
    const r = await callClaude(INTERVIEW_SYSTEM(cfg.role, cfg.topic), init);
    setMsgs([...init, { role: "assistant", content: r }]); setQCount(1); setLoading(false);
  };
  const send = async () => {
    if (!input.trim() || loading) return;
    const next = [...msgs, { role: "user", content: input }];
    setMsgs(next); setInput(""); setQCount(q => q + 1); setLoading(true);
    if (qCount + 1 > cfg.maxQ) { await finish(next); return; }
    const r = await callClaude(INTERVIEW_SYSTEM(cfg.role, cfg.topic), next);
    setMsgs([...next, { role: "assistant", content: r }]); setLoading(false);
  };
  const finish = async (m) => {
    clearInterval(timerRef.current);
    const t = m || msgs;
    const transcript = t.map(x => `${x.role === "user" ? "Candidat" : "Recruteur"}: ${x.content}`).join("\n\n");
    const raw = await callClaude(INTERVIEW_EVAL, [{ role: "user", content: `Transcription:\n\n${transcript}\n\nJSON.` }]);
    let ev; try { ev = JSON.parse(raw.replace(/```json|```/g, "").trim()); } catch { ev = { score: 55, niveau: "Intermédiaire", points_forts: ["Participation"], axes_amelioration: ["Structurer"], verdict: "Performance correcte.", conseil_prioritaire: "Approfondissez.", pret_pour_poste: false }; }
    onDone({ evaluation: ev, duration: timer, topic: cfg.topic, role: cfg.role, transcript: t });
  };
  const pct = Math.round((Math.min(qCount, cfg.maxQ) / cfg.maxQ) * 100);
  return (
    <div style={{ ...S.root, display: "flex", flexDirection: "column", height: "100vh" }}><OrbBg />
      <div style={{ ...S.nav, zIndex: 2 }}>
        <Logo />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#374151", border: "1px solid #1f2937", padding: "3px 8px" }}>{cfg.topic}</span>
          <span style={{ fontSize: 12, color: "#e2c97e", fontFamily: "monospace" }}>{fmt(timer)}</span>
          <span style={{ fontSize: 11, color: "#6b7280" }}>{Math.min(qCount, cfg.maxQ)}/{cfg.maxQ}</span>
          <button style={{ ...S.no, color: "#f87171", borderColor: "#f8717140" }} onClick={() => finish(msgs)}>Terminer</button>
        </div>
      </div>
      <div style={{ height: 2, background: "#0d1117" }}><div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#e2c97e,#f5e4a0)", transition: "width .5s" }} /></div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 14, scrollbarWidth: "none", position: "relative", zIndex: 1 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 10, justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", animation: "fsu .3s ease both" }}>
            {m.role === "assistant" && <div style={S.ava}>RH</div>}
            <div style={{ maxWidth: "76%", padding: "12px 15px", fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", ...(m.role === "user" ? S.bubu : S.buba) }}>{m.content}</div>
          </div>
        ))}
        {loading && <div style={{ display: "flex", gap: 10 }}><div style={S.ava}>RH</div><div style={{ ...S.buba, padding: "14px 18px", display: "flex", gap: 5, alignItems: "center" }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#e2c97e", animation: `puls 1.2s ${i * .25}s infinite` }} />)}</div></div>}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "12px 20px 20px", borderTop: "1px solid #0d1117", display: "flex", gap: 10, background: "#080b14", position: "relative", zIndex: 1 }}>
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
            <circle cx="60" cy="60" r="52" fill="none" stroke="#111827" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={sc} strokeWidth="8" strokeDasharray={`${(anim / 100) * circ} ${circ}`} strokeLinecap="round" transform="rotate(-90 60 60)" style={{ filter: `drop-shadow(0 0 6px ${sc})` }} />
            <text x="60" y="54" textAnchor="middle" fill="white" fontSize="28" fontWeight="900" fontFamily="monospace">{anim}</text>
            <text x="60" y="70" textAnchor="middle" fill="#374151" fontSize="10" fontFamily="monospace">/100</text>
          </svg>
          <span style={{ fontSize: 11, letterSpacing: ".15em", color: sc, border: `1px solid ${sc}50`, padding: "4px 16px", fontWeight: 700 }}>{ev.niveau}</span>
        </div>
        <div style={{ background: "#0d1117", border: "1px solid #1a1f2e", padding: "20px 24px", width: "100%", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#c9c3b5", lineHeight: 1.7, margin: "0 0 14px" }}>{ev.verdict}</p>
          {ev.conseil_prioritaire && <div style={{ background: "#e2c97e08", border: "1px solid #e2c97e25", padding: "10px 16px" }}><p style={{ fontSize: 10, color: "#e2c97e", margin: "0 0 4px", letterSpacing: ".1em" }}>✦ CONSEIL PRIORITAIRE</p><p style={{ fontSize: 13, color: "#c9c3b5", margin: 0, lineHeight: 1.6 }}>{ev.conseil_prioritaire}</p></div>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
          <div style={S.ec}><p style={{ ...S.et, color: "#4ade80" }}>✦ POINTS FORTS</p>{ev.points_forts?.map((p, i) => <p key={i} style={S.ei}>— {p}</p>)}</div>
          <div style={S.ec}><p style={{ ...S.et, color: "#f59e0b" }}>↗ À AMÉLIORER</p>{ev.axes_amelioration?.map((a, i) => <p key={i} style={S.ei}>— {a}</p>)}</div>
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
          <p style={{ fontSize: 14, color: "#e8e4d9", fontWeight: 700, margin: "0 0 4px" }}>{pct}% de réussite</p>
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{ueName} · {fmt(duration)}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
          {answers?.map((a, i) => (
            <div key={i} style={{ background: "#0d1117", border: `1px solid ${a.correct ? "#4ade8025" : "#f8717125"}`, padding: "10px 14px" }}>
              <p style={{ fontSize: 11, color: a.correct ? "#4ade80" : "#f87171", margin: "0 0 4px" }}>{a.correct ? "✓ Correct" : "✗ Incorrect"} {a.difficulte && `· ${a.difficulte}`}</p>
              <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{a.q}</p>
              {!a.correct && <p style={{ fontSize: 11, color: "#4b5563", margin: "4px 0 0" }}>Réponse : {a.right}</p>}
              {a.expl && <p style={{ fontSize: 11, color: "#374151", margin: "4px 0 0", fontStyle: "italic" }}>{a.expl}</p>}
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
  if (!ev) return <div style={S.root}><OrbBg /><div style={{ maxWidth: 500, margin: "80px auto", padding: 24, textAlign: "center" }}><p style={{ color: "#f87171" }}>Erreur d'évaluation.</p><button style={S.ctag} onClick={onDash}>Retour</button></div></div>;
  const nc = noteColor(ev.note);
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onDash}>← {data.ue}</button></nav>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "36px 24px 60px", display: "flex", flexDirection: "column", gap: 16, position: "relative", zIndex: 1, animation: "fsu .5s ease both" }}>
        <div style={{ ...S.card, textAlign: "center", borderColor: `${nc}30` }}>
          <p style={{ fontSize: 54, fontWeight: 900, color: nc, margin: "0 0 4px", filter: `drop-shadow(0 0 12px ${nc})` }}>{ev.note}<span style={{ fontSize: 22 }}>/20</span></p>
          <p style={{ fontSize: 14, color: "#e8e4d9", fontWeight: 700, margin: "0 0 4px" }}>{ev.appreciation} · {cas?.titre}</p>
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{ueName} · {fmt(duration)}</p>
        </div>
        {ev.correction_par_question && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 10, letterSpacing: ".15em", color: "#374151" }}>CORRECTION PAR QUESTION</p>
            {ev.correction_par_question.map(q => (
              <div key={q.num} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#e8e4d9" }}>Question {q.num}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: noteColor(q.note / (cas?.questions?.[q.num - 1]?.points || 10) * 20) }}>{q.note}/{cas?.questions?.[q.num - 1]?.points || "?"} pts</span>
                </div>
                <p style={{ fontSize: 13, color: "#c9c3b5", margin: "0 0 8px", lineHeight: 1.6 }}>{q.commentaire}</p>
                {q.elements_attendus && <div style={{ background: "#060810", border: "1px solid #111827", padding: "8px 12px" }}><p style={{ fontSize: 10, color: "#374151", margin: "0 0 4px", letterSpacing: ".1em" }}>ÉLÉMENTS ATTENDUS</p><p style={{ fontSize: 12, color: "#4b5563", margin: 0, lineHeight: 1.6 }}>{q.elements_attendus}</p></div>}
              </div>
            ))}
          </div>
        )}
        {ev.conseil && <div style={{ background: "#e2c97e08", border: "1px solid #e2c97e25", padding: "14px 18px" }}><p style={{ fontSize: 10, color: "#e2c97e", margin: "0 0 6px", letterSpacing: ".1em" }}>✦ CONSEIL</p><p style={{ fontSize: 13, color: "#c9c3b5", margin: 0, lineHeight: 1.6 }}>{ev.conseil}</p></div>}
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
  useEffect(() => { loadHistory(user.email).then(h => { setHistory(h); setLoading(false); }); }, []);
  const typeColor = (t) => t === "entretien" ? "#e2c97e" : t === "cas" ? "#f59e0b" : "#60a5fa";
  const typeIcon = (t) => t === "entretien" ? "💼" : t === "cas" ? "📝" : "△";
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Dashboard</button></nav>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontSize: 20, margin: "0 0 20px", color: "#e8e4d9" }}>▦ Historique</h2>
        {loading ? <p style={{ color: "#374151" }}>Chargement…</p> : history.length === 0 ? <p style={{ color: "#374151", fontSize: 13 }}>Aucune activité pour le moment.</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.map((h, i) => {
              const s = h.evaluation?.score || h.evaluation?.note || 0;
              const isNote = h.type === "cas"; const val = isNote ? `${s}/20` : s > 0 ? `${s}/100` : "—";
              const col = isNote ? noteColor(s) : scoreColor(s);
              return (
                <div key={i} style={{ background: "#0d1117", border: "1px solid #1a1f2e", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", animation: `fsu .3s ${i * .04}s both` }}>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 14 }}>{typeIcon(h.type)}</span>
                      <span style={{ fontSize: 11, color: typeColor(h.type), border: `1px solid ${typeColor(h.type)}30`, padding: "1px 6px" }}>{h.type?.toUpperCase()}</span>
                      <span style={{ fontSize: 11, color: "#4b5563" }}>{h.ueName || h.topic || "—"}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#374151", margin: 0 }}>{h.date}</p>
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
function ProgressScreen({ user, onBack }) {
  const [history, setHistory] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { loadHistory(user.email).then(h => { setHistory(h.slice(0, 30).reverse()); setLoading(false); }); }, []);
  const interviews = history.filter(h => h.type === "entretien");
  const qcms = history.filter(h => h.type === "qcm");
  const cas = history.filter(h => h.type === "cas");
  const chartData = interviews.map((h, i) => ({ n: i + 1, score: h.evaluation?.score || 0 }));
  const avg = interviews.length ? Math.round(interviews.reduce((s, h) => s + (h.evaluation?.score || 0), 0) / interviews.length) : 0;
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Dashboard</button></nav>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 1, animation: "fsu .4s ease both" }}>
        <h2 style={{ fontSize: 20, margin: "0 0 20px", color: "#e8e4d9" }}>◎ Progression</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
          <SC v={interviews.length} l="Entretiens" /><SC v={qcms.length} l="QCM sessions" /><SC v={cas.length} l="Cas pratiques" /><SC v={avg || "—"} l="Score moyen" hl />
        </div>
        {loading ? <p style={{ color: "#374151" }}>Chargement…</p> : interviews.length < 2 ? (
          <div style={{ ...S.card, textAlign: "center" }}><p style={{ color: "#374151", fontSize: 13, margin: 0 }}>Faites 2+ entretiens pour voir votre évolution.</p></div>
        ) : (
          <div style={{ background: "#0d1117", border: "1px solid #1a1f2e", padding: "20px 8px 12px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#111827" strokeDasharray="3 3" />
                <XAxis dataKey="n" stroke="#1f2937" tick={{ fontSize: 10, fill: "#374151" }} />
                <YAxis domain={[0, 100]} stroke="#1f2937" tick={{ fontSize: 10, fill: "#374151" }} />
                <Tooltip contentStyle={{ background: "#0d1117", border: "1px solid #1a1f2e", fontSize: 12 }} itemStyle={{ color: "#e2c97e" }} formatter={v => [`${v}/100`, "Score"]} />
                <Line type="monotone" dataKey="score" stroke="#e2c97e" strokeWidth={2} dot={{ fill: "#e2c97e", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PAYWALL ───────────────────────────────────────────────────────────────────
function Paywall({ onUpgrade, onBack }) {
  return (
    <div style={S.root}><ParticleCanvas /><OrbBg />
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center", position: "relative", zIndex: 1, animation: "fsu .5s ease both" }}>
        <span style={{ fontSize: 40 }}>◈</span>
        <h2 style={{ fontSize: 26, margin: 0, color: "#e8e4d9" }}>Passez à Pro</h2>
        <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>Cette fonctionnalité est réservée aux membres Pro.</p>
        <div style={{ ...S.pc, ...S.phl, width: "100%", animation: "glow 3s ease-in-out infinite" }}>
          <div style={S.pb}>SIMDCG PRO</div>
          <p style={{ fontSize: 40, fontWeight: 900, color: "#e8e4d9", margin: "12px 0 4px" }}>{PRO_PRICE}<span style={{ fontSize: 14, color: "#6b7280" }}>/mois</span></p>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, margin: "14px 0 20px" }}>
            {["QCM illimités par UE", "Cas pratiques corrigés par IA", "13 matières DCG + DSCG", "Entretiens illimités", "12 flashcards par matière", "Historique & progression"].map(f => <p key={f} style={{ fontSize: 12, color: "#c9c3b5", margin: 0 }}>✓ {f}</p>)}
          </div>
          <button style={{ ...S.ctag, width: "100%", padding: 13 }} onClick={onUpgrade}>Passer à Pro →</button>
        </div>
        <button style={S.back} onClick={onBack}>← Retour</button>
      </div>
    </div>
  );
}

// ── ATOMS ─────────────────────────────────────────────────────────────────────
function Logo({ glow }) {
  return <span style={{ fontSize: 20, fontWeight: 900, fontFamily: "monospace", letterSpacing: -1, color: "#e8e4d9" }}>SIM<span style={{ color: "#e2c97e", filter: glow ? "drop-shadow(0 0 8px rgba(226,201,126,.6))" : "none" }}>DCG</span></span>;
}
function SC({ v, l, hl }) {
  return <div style={{ background: "#0d1117", border: `1px solid ${hl ? "rgba(226,201,126,.2)" : "#1a1f2e"}`, padding: "14px 10px", textAlign: "center" }}><p style={{ fontSize: 20, fontWeight: 900, margin: "0 0 3px", color: hl ? "#e2c97e" : "#e8e4d9" }}>{v}</p><p style={{ fontSize: 9, color: "#374151", margin: 0, letterSpacing: ".1em" }}>{l.toUpperCase()}</p></div>;
}
function FInput({ label, value, set, ph, type = "text" }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 5 }}><label style={{ fontSize: 10, letterSpacing: ".12em", color: "#6b7280", textTransform: "uppercase" }}>{label}</label><input style={{ background: "#0d1117", border: "1px solid #1f2937", color: "#e8e4d9", padding: "10px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", transition: "border-color .2s" }} type={type} value={value} onChange={e => set(e.target.value)} placeholder={ph} onFocus={e => e.target.style.borderColor = "#e2c97e40"} onBlur={e => e.target.style.borderColor = "#1f2937"} /></div>;
}
function Sect({ label, children }) {
  return <div><p style={{ fontSize: 10, letterSpacing: ".15em", color: "#6b7280", margin: "0 0 10px", textTransform: "uppercase" }}>{label}</p>{children}</div>;
}
function OB({ active, color, onClick, main, sub }) {
  return <button onClick={onClick} style={{ flex: 1, background: active ? `${color}12` : "#0d1117", border: `2px solid ${active ? color : "#1f2937"}`, color: active ? color : "#6b7280", padding: "12px 8px", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all .15s", boxShadow: active ? `0 0 16px ${color}20` : "none", fontFamily: "inherit" }}><strong>{main}</strong><span style={{ fontSize: 10, opacity: .6 }}>{sub}</span></button>;
}
function Spinner() {
  return <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span style={{ width: 13, height: 13, border: "2px solid #080b14", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} /> Chargement…</span>;
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  root: { minHeight: "100vh", background: "#080b14", color: "#e8e4d9", fontFamily: "'DM Mono','Courier New',monospace", position: "relative", overflow: "hidden" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid #0d1117", background: "rgba(8,11,20,.88)", backdropFilter: "blur(12px)", position: "relative", zIndex: 2 },
  nl: { background: "none", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  no: { background: "none", border: "1px solid #1f2937", color: "#9ca3af", fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" },
  nc: { background: "#e2c97e", border: "none", color: "#080b14", fontSize: 12, padding: "7px 16px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" },
  badge: { fontSize: 10, letterSpacing: ".18em", color: "#e2c97e", border: "1px solid rgba(226,201,126,.2)", padding: "5px 16px", background: "rgba(226,201,126,.04)" },
  ctag: { background: "#e2c97e", border: "none", color: "#080b14", fontSize: 14, fontWeight: 700, padding: "13px 28px", cursor: "pointer", letterSpacing: ".04em", fontFamily: "inherit" },
  ctagh: { background: "none", border: "1px solid #1f2937", color: "#9ca3af", fontSize: 14, padding: "13px 28px", cursor: "pointer", fontFamily: "inherit" },
  tag: { fontSize: 11, border: "1px solid #0f1520", padding: "5px 12px", background: "rgba(13,17,23,.5)" },
  fc: { background: "rgba(13,17,23,.8)", border: "1px solid #111827", padding: "22px 18px", display: "flex", flexDirection: "column" },
  pc: { background: "#0d1117", border: "1px solid #1a1f2e", padding: "24px 20px", position: "relative", display: "flex", flexDirection: "column" },
  phl: { border: "1px solid rgba(226,201,126,.25)", background: "rgba(226,201,126,.03)" },
  pb: { position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#e2c97e", color: "#080b14", fontSize: 9, padding: "3px 12px", fontWeight: 700, letterSpacing: ".12em", whiteSpace: "nowrap" },
  back: { background: "none", border: "none", color: "#6b7280", fontSize: 12, cursor: "pointer", padding: 0, alignSelf: "flex-start", fontFamily: "inherit" },
  mb: { background: "#0d1117", border: "1px solid #111827", padding: "16px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontFamily: "inherit" },
  uecard: { background: "#0d1117", border: "1px solid #111827", padding: "14px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "inherit", transition: "all .15s" },
  fb: { background: "none", border: "1px solid #1f2937", color: "#374151", padding: "5px 12px", fontSize: 11, cursor: "pointer", transition: "all .15s", fontFamily: "inherit" },
  fa: { border: "1px solid rgba(226,201,126,.35)", color: "#e2c97e", background: "rgba(226,201,126,.06)" },
  card: { background: "#0d1117", border: "1px solid #1a1f2e", padding: "20px 22px" },
  ava: { width: 30, height: 30, background: "#111827", border: "1px solid #1f2937", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#6b7280", flexShrink: 0 },
  buba: { background: "rgba(13,17,23,.9)", border: "1px solid #1a1f2e", color: "#c9c3b5", borderRadius: "0 8px 8px 8px" },
  bubu: { background: "rgba(226,201,126,.07)", border: "1px solid rgba(226,201,126,.18)", color: "#e8e4d9", borderRadius: "8px 0 8px 8px" },
  ta: { flex: 1, background: "#0d1117", border: "1px solid #1f2937", color: "#e8e4d9", padding: "12px 14px", fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.6 },
  sb: { background: "#e2c97e", border: "none", color: "#080b14", width: 44, height: 44, fontSize: 18, cursor: "pointer", fontWeight: 700, flexShrink: 0, alignSelf: "flex-end" },
  ec: { background: "#0d1117", border: "1px solid #1a1f2e", padding: "14px 16px" },
  et: { fontSize: 9, letterSpacing: ".12em", margin: "0 0 10px" },
  ei: { fontSize: 12, color: "#4b5563", margin: "4px 0", lineHeight: 1.55 },
};
