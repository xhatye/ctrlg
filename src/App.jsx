import { useState, useRef, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const STRIPE_LINK = "https://buy.stripe.com/YOUR_LINK_HERE";
const FREE_INTERVIEWS = 1;
const PRO_PRICE = "9€";

const SYSTEM_PROMPT = (role, topic) =>
  `Tu es un directeur financier senior qui conduit un entretien de recrutement pour un poste de contrôleur de gestion (niveau : ${role}) dans une grande entreprise française.${topic !== "Général" ? ` Focus sur : ${topic}.` : ""}
Tu maîtrises : tableau de bord, analyse des écarts, méthode ABC/ABM, reporting, clôtures, contrôle budgétaire, coûts de revient, management.
Tu es exigeant. Si la réponse est bonne, tu approfondis. Si faible, tu demandes de développer.
Format : 1) Bref retour (1-2 phrases), 2) Prochaine question. Commence par une ouverture. Ne donne jamais les réponses.`;

const EVAL_PROMPT = `Expert recrutement CdG. Évalue. JSON strict sans markdown :
{"score":<0-100>,"niveau":"<Débutant|Intermédiaire|Avancé|Expert>","points_forts":["...","...","..."],"axes_amelioration":["...","...","..."],"verdict":"<2-3 phrases>","pret_pour_poste":<true|false>,"conseil_prioritaire":"<1 conseil concret>"}`;

const ROLES = [
  { id: "Junior (0-2 ans)", label: "Junior", sub: "0–2 ans", color: "#4ade80" },
  { id: "Confirmé (3-5 ans)", label: "Confirmé", sub: "3–5 ans", color: "#60a5fa" },
  { id: "Senior (5+ ans)", label: "Senior", sub: "5+ ans", color: "#f59e0b" },
];
const TOPICS = [
  { id: "Général", icon: "◈", desc: "Toutes thématiques", free: true },
  { id: "Tableau de bord", icon: "▦", desc: "KPI, pilotage", free: false },
  { id: "Analyse des écarts", icon: "△", desc: "Budget vs réalisé", free: false },
  { id: "ABC / ABM", icon: "◎", desc: "Coûts par activité", free: false },
  { id: "Clôtures & Reporting", icon: "☰", desc: "Clôtures mensuelles", free: false },
  { id: "Management", icon: "◇", desc: "Leadership, soft skills", free: false },
];
const DURATIONS = [
  { id: "5", label: "Flash", sub: "~4 questions", q: 4 },
  { id: "10", label: "Standard", sub: "~7 questions", q: 7 },
  { id: "20", label: "Complet", sub: "~12 questions", q: 12 },
];
const FLASHCARDS = [
  { q: "Qu'est-ce qu'un tableau de bord de gestion ?", a: "Outil de pilotage synthétisant les KPI permettant de mesurer la performance d'une entité par rapport à ses objectifs, et de prendre des décisions correctives rapides.", topic: "Tableau de bord" },
  { q: "Définissez un inducteur de coût en méthode ABC.", a: "Facteur qui explique la consommation d'une activité par les produits. Ex : nombre de commandes, heures machine. Il permet d'affecter le coût des activités aux objets de coût.", topic: "ABC / ABM" },
  { q: "Formule de l'écart sur prix matière.", a: "Écart sur prix = (Prix réel − Prix standard) × Quantité réelle achetée. Favorable si prix réel < prix standard.", topic: "Analyse des écarts" },
  { q: "Formule de l'écart sur quantité matière.", a: "Écart sur quantité = (Quantité réelle − Quantité standard) × Prix standard. Révèle l'efficience de consommation.", topic: "Analyse des écarts" },
  { q: "Comment calcule-t-on le seuil de rentabilité ?", a: "SR = Charges fixes / Taux de marge sur coûts variables. Le taux MCV = MCV / CA.", topic: "Général" },
  { q: "Qu'est-ce que l'imputation rationnelle ?", a: "Technique consistant à imputer les charges fixes au coût de revient en fonction d'un taux d'activité normale, afin d'éliminer l'effet du niveau d'activité sur le coût unitaire.", topic: "Général" },
  { q: "Différence entre centre de coût et centre de profit.", a: "Centre de coût : entité évaluée sur sa maîtrise des dépenses. Centre de profit : responsable à la fois des revenus et des coûts, donc du résultat net.", topic: "Tableau de bord" },
  { q: "Qu'est-ce qu'un budget flexible ?", a: "Budget recalculé pour le niveau d'activité réellement atteint. Permet une comparaison pertinente avec les réalisations en éliminant l'effet volume.", topic: "Analyse des écarts" },
  { q: "Définissez le ROI.", a: "ROI = Résultat net / Capitaux investis × 100. Mesure la rentabilité économique. Un ROI > coût du capital crée de la valeur.", topic: "Tableau de bord" },
  { q: "Les 4 axes du Balanced Scorecard.", a: "1) Financier, 2) Clients, 3) Processus internes, 4) Apprentissage & Innovation. Vision 360° de la performance selon Kaplan & Norton.", topic: "Tableau de bord" },
  { q: "Qu'est-ce que l'EVA ?", a: "EVA = NOPAT − (WACC × Capital investi). Mesure la valeur économique créée après rémunération de tous les apporteurs de capitaux.", topic: "Tableau de bord" },
  { q: "Méthode TDABC vs ABC classique.", a: "TDABC : l'inducteur unique est le temps. Coût par minute × temps réel de chaque transaction. Plus simple à maintenir.", topic: "ABC / ABM" },
  { q: "Comment analyser un écart sur CA ?", a: "Décomposer en écart prix et écart volume/mix. Écart prix = (Prix réel − Budget) × Q réelle. Écart volume = (Q réelle − Q budget) × Prix budget.", topic: "Analyse des écarts" },
  { q: "Qu'est-ce qu'une clôture mensuelle ?", a: "Collecte, validation et consolidation des données financières à fin de mois : provisions, CCA/PCA, réconciliations intercos, marges analytiques.", topic: "Clôtures & Reporting" },
  { q: "Comment présenter un écart défavorable ?", a: "1) Fait (montant, %), 2) Cause, 3) Impact (P&L, cash), 4) Actions correctives avec responsable et délai. Jamais sans solution.", topic: "Management" },
  { q: "Marge sur coûts variables (MCV).", a: "MCV = CA − Charges variables. Le taux de MCV (MCV/CA) mesure la part de chaque € de vente disponible pour les charges fixes et le bénéfice.", topic: "Général" },
  { q: "Point mort en jours.", a: "Point mort = (Seuil de rentabilité / CA annuel) × 365. Indique la date à laquelle l'entreprise commence à être bénéficiaire.", topic: "Général" },
  { q: "Coût direct vs coût complet.", a: "Coût direct : charges directement attribuables. Coût complet : direct + quote-part indirectes après ABC ou clé de répartition.", topic: "Général" },
  { q: "Gérer un conflit avec un opérationnel sur ses chiffres.", a: "1) Écouter sa version, 2) S'appuyer sur les faits, 3) Reconnaître les contraintes terrain, 4) Chercher un consensus, 5) Escalader avec diplomatie.", topic: "Management" },
  { q: "Qu'est-ce que le contrôle budgétaire ?", a: "Comparaison systématique entre réalisations et prévisions, analyse des écarts significatifs et mise en place d'actions correctives. Fréquence mensuelle.", topic: "Général" },
];
const QUIZ_QUESTIONS = [
  { q: "L'écart sur prix matière se calcule avec :", options: ["(Px réel − Px std) × Q std", "(Px réel − Px std) × Q réelle", "(Q réelle − Q std) × Px réel", "(Q réelle − Q std) × Px std"], answer: 1, expl: "On utilise la quantité réelle pour isoler l'effet prix pur." },
  { q: "Dans ABC, les activités sont regroupées en :", options: ["Centres de coût", "Centres analytiques", "Pools d'activités", "Sections auxiliaires"], answer: 2, expl: "Les pools d'activités regroupent des tâches homogènes." },
  { q: "Le seuil de rentabilité est atteint quand :", options: ["CA = Charges variables", "MCV = Charges fixes", "Résultat net = 0", "Les deux dernières réponses"], answer: 3, expl: "Quand MCV = CF, le résultat est nul — équivalent au SR." },
  { q: "Le Balanced Scorecard a été développé par :", options: ["Michael Porter", "Kaplan & Norton", "Johnson & Scholes", "Drucker & Mintzberg"], answer: 1, expl: "Robert Kaplan et David Norton, HBR 1992." },
  { q: "Un budget flexible est recalculé sur la base de :", options: ["L'activité budgétée", "L'activité réelle constatée", "La moyenne des 2 derniers exercices", "L'activité normale"], answer: 1, expl: "Le budget flexible adapte les charges au volume réel." },
  { q: "L'imputation rationnelle vise à éliminer :", options: ["Les charges exceptionnelles", "L'effet des variations d'activité sur le coût unitaire", "Les charges non décaissables", "Les différences de change"], answer: 1, expl: "Elle neutralise l'impact du niveau d'activité sur les charges fixes unitaires." },
  { q: "EVA positive signifie :", options: ["Résultat comptable positif", "Valeur créée > rémunération des capitaux", "ROI > 10%", "Charges financières couvertes"], answer: 1, expl: "EVA = NOPAT − (WACC × Capital). Positive = création de valeur." },
  { q: "Taux MCV 40%, CF = 200k€. Le SR est :", options: ["80k€", "280k€", "500k€", "140k€"], answer: 2, expl: "SR = CF / Taux MCV = 200 000 / 0,40 = 500 000€." },
  { q: "En ABC, 'nombre de lots' est un inducteur de niveau :", options: ["Unité", "Lot", "Produit", "Installation"], answer: 1, expl: "Les inducteurs de niveau lot varient avec le nombre de lots." },
  { q: "Une clôture mensuelle inclut systématiquement :", options: ["La déclaration TVA", "Les provisions annuelles", "Les charges à payer et produits à recevoir", "L'inventaire physique complet"], answer: 2, expl: "CCA/PCA et CAP/PAR sont indispensables pour le principe de rattachement." },
];
const FORMULAS = [
  { cat: "Analyse des écarts", items: [
    { name: "Écart sur prix matière", formula: "(Px réel − Px std) × Q réelle", note: "Favorable si prix réel < standard" },
    { name: "Écart sur quantité matière", formula: "(Q réelle − Q std) × Px std", note: "Favorable si consommation réelle < standard" },
    { name: "Écart budget frais fixes", formula: "Frais fixes réels − Frais fixes budgétés", note: "Indépendant du niveau d'activité" },
    { name: "Écart d'activité", formula: "(Act. réelle − Act. normale) × Taux fixe std", note: "Coût de sous/sur-activité" },
  ]},
  { cat: "Rentabilité", items: [
    { name: "Marge sur coûts variables", formula: "CA − Charges variables", note: "Contribue à la couverture des CF" },
    { name: "Taux de MCV", formula: "MCV / CA × 100", note: "Part de chaque € de CA pour les CF" },
    { name: "Seuil de rentabilité", formula: "Charges fixes / Taux de MCV", note: "CA minimum pour équilibrer" },
    { name: "Point mort (jours)", formula: "SR / (CA annuel / 365)", note: "Date de début de bénéfice" },
    { name: "Marge de sécurité", formula: "CA réel − SR", note: "Coussin avant la perte" },
  ]},
  { cat: "Performance", items: [
    { name: "ROI", formula: "Résultat opérationnel / Capitaux investis × 100", note: "Comparer au WACC" },
    { name: "ROE", formula: "Résultat net / Capitaux propres × 100", note: "Rentabilité actionnaires" },
    { name: "EVA", formula: "NOPAT − (WACC × Capital économique)", note: "Positive = création de valeur" },
    { name: "NOPAT", formula: "EBIT × (1 − taux IS)", note: "Résultat opérationnel après impôt" },
  ]},
  { cat: "Coûts", items: [
    { name: "Coût de revient complet", formula: "Coûts directs + Quote-part charges indirectes", note: "Base prix de vente" },
    { name: "Imputation rationnelle", formula: "CF × (Act. réelle / Act. normale)", note: "Élimine l'effet volume" },
    { name: "Coût unitaire ABC", formula: "Σ (Coût activité / Inducteur) × Conso. inducteur", note: "Plus précis que clés volumiques" },
  ]},
];

// ── HELPERS ────────────────────────────────────────────────────────────────────
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const scoreColor = (s) => s >= 80 ? "#4ade80" : s >= 60 ? "#f59e0b" : "#f87171";
const today = () => new Date().toISOString().split("T")[0];

// ── API CALL — works in both Vite (import.meta.env) and Claude artifact ────────
async function callClaude(system, messages) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || "";
  const headers = { "Content-Type": "application/json" };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
  }
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers,
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages }),
  });
  const d = await r.json();
  return d.content?.[0]?.text || "";
}

// ── STORAGE — uses localStorage in real browser, window.storage in Claude artifact ──
const Store = {
  get: async (key) => {
    try {
      if (window.storage) { const r = await window.storage.get(key); return r ? r.value : null; }
      return localStorage.getItem(key);
    } catch { return localStorage.getItem(key); }
  },
  set: async (key, val) => {
    try {
      if (window.storage) { await window.storage.set(key, val); return; }
      localStorage.setItem(key, val);
    } catch { localStorage.setItem(key, val); }
  },
};

async function saveHistory(email, entry) {
  try {
    const key = `ctrlg:${email}:history`;
    const raw = await Store.get(key);
    let hist = raw ? JSON.parse(raw) : [];
    hist.unshift(entry);
    if (hist.length > 50) hist = hist.slice(0, 50);
    await Store.set(key, JSON.stringify(hist));
  } catch {}
}
async function loadHistory(email) {
  try { const r = await Store.get(`ctrlg:${email}:history`); return r ? JSON.parse(r) : []; } catch { return []; }
}
async function updateStreak(email) {
  try {
    const key = `ctrlg:${email}:streak`;
    const raw = await Store.get(key);
    let streak = raw ? JSON.parse(raw) : { count: 0, lastDate: "" };
    const t = today();
    if (streak.lastDate === t) return streak.count;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split("T")[0];
    const newCount = streak.lastDate === yStr ? streak.count + 1 : 1;
    await Store.set(key, JSON.stringify({ count: newCount, lastDate: t }));
    return newCount;
  } catch { return 1; }
}
async function loadStreak(email) {
  try {
    const raw = await Store.get(`ctrlg:${email}:streak`);
    if (!raw) return 0;
    const s = JSON.parse(raw);
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (s.lastDate !== today() && s.lastDate !== yesterday.toISOString().split("T")[0]) return 0;
    return s.count;
  } catch { return 0; }
}

// ── PARTICLE CANVAS ───────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({ particles: [], mouse: { x: -9999, y: -9999 } });
  const TERMS = ["MCV","ROI","EVA","ABC","EBIT","WACC","KPI","P&L","BSC","SR","CF","CA","DCF","IRR","NPV"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const N = Math.min(55, Math.floor(window.innerWidth / 24));
    stateRef.current.particles = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.4 + 0.4,
      label: Math.random() > 0.62 ? TERMS[Math.floor(Math.random() * TERMS.length)] : null,
      opacity: Math.random() * 0.45 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const onMouse = (e) => { stateRef.current.mouse = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMouse);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { particles, mouse } = stateRef.current;
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.018;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110 && dist > 0) {
          const f = (110 - dist) / 110 * 0.35;
          p.vx += (dx / dist) * f; p.vy += (dy / dist) * f;
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (spd > 1.8) { p.vx = p.vx / spd * 1.8; p.vy = p.vy / spd * 1.8; }
        }
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(226,201,126,${(1 - d / 130) * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        const gs = Math.max(0.1, p.r + Math.sin(p.pulse) * 1.1);
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gs * 5);
        grd.addColorStop(0, `rgba(226,201,126,${p.opacity * 0.35})`);
        grd.addColorStop(1, "rgba(226,201,126,0)");
        ctx.beginPath(); ctx.arc(p.x, p.y, gs * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, gs, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226,201,126,${p.opacity * 0.85})`; ctx.fill();
        if (p.label) {
          ctx.font = "9px 'Courier New'";
          ctx.fillStyle = `rgba(226,201,126,${p.opacity * 0.55})`;
          ctx.fillText(p.label, p.x + 6, p.y - 4);
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

// ── ORBS ──────────────────────────────────────────────────────────────────────
function OrbBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(226,201,126,.04) 0%,transparent 70%)", top:"-150px", left:"-100px", animation:"o1 18s ease-in-out infinite" }} />
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(96,165,250,.04) 0%,transparent 70%)", bottom:"-100px", right:"-80px", animation:"o2 22s ease-in-out infinite" }} />
      <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(226,201,126,.03) 0%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"o3 15s ease-in-out infinite" }} />
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("landing");
  const [authMode, setAuthMode] = useState("signup");
  const [iResult, setIResult] = useState(null);
  const [iCfg, setICfg] = useState(null);

  const canStart = () => user?.isPro || (user?.interviewsUsed || 0) < FREE_INTERVIEWS;
  const goNew = () => { if (!canStart()) setScreen("paywall"); else setScreen("config"); };
  const nav = (s) => setScreen(s);
  const toAuth = (m) => { setAuthMode(m); nav("auth"); };

  const onDone = async (result) => {
    const entry = { ...result, date: new Date().toLocaleString("fr-FR"), dateISO: new Date().toISOString() };
    if (user) {
      await saveHistory(user.email, entry);
      const streak = await updateStreak(user.email);
      setUser(u => ({ ...u, interviewsUsed: (u.interviewsUsed || 0) + 1, streak }));
    }
    setIResult(entry);
    setScreen("results");
  };

  if (screen === "landing")    return <Landing onAuth={toAuth} onPricing={() => nav("pricing")} />;
  if (screen === "pricing")    return <Pricing onAuth={toAuth} onBack={() => nav("landing")} />;
  if (screen === "auth")       return <Auth mode={authMode} setMode={setAuthMode} onDone={(u) => { setUser(u); nav("dashboard"); }} onBack={() => nav("landing")} />;
  if (screen === "dashboard")  return <Dashboard user={user} onNew={goNew} onLogout={() => { setUser(null); nav("landing"); }} onNav={nav} />;
  if (screen === "config")     return <Config user={user} onStart={(cfg) => { setICfg(cfg); nav("interview"); }} onBack={() => nav("dashboard")} />;
  if (screen === "interview")  return <Interview cfg={iCfg} onDone={onDone} />;
  if (screen === "results")    return <Results data={iResult} user={user} onNew={goNew} onDash={() => nav("dashboard")} />;
  if (screen === "paywall")    return <Paywall user={user} onUpgrade={() => { window.open(STRIPE_LINK,"_blank"); setUser(u=>({...u,isPro:true})); }} onBack={() => nav("dashboard")} />;
  if (screen === "flashcards") return <Flashcards onBack={() => nav("dashboard")} />;
  if (screen === "quiz")       return <Quiz onBack={() => nav("dashboard")} />;
  if (screen === "formulas")   return <Formulas onBack={() => nav("dashboard")} />;
  if (screen === "history")    return <History user={user} onBack={() => nav("dashboard")} />;
  if (screen === "progress")   return <Progress user={user} onBack={() => nav("dashboard")} />;
  return null;
}

// ── LANDING ───────────────────────────────────────────────────────────────────
function Landing({ onAuth, onPricing }) {
  return (
    <div style={S.root}>
      <ParticleCanvas /><OrbBg />
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:"100%", height:1, background:"linear-gradient(90deg,transparent,rgba(226,201,126,.06),transparent)", animation:"scan 8s linear infinite" }} />
      </div>
      <nav style={S.nav}>
        <Logo glow />
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button style={S.nl} onClick={onPricing}>Tarifs</button>
          <button style={S.no} onClick={() => onAuth("login")}>Connexion</button>
          <button className="cg" style={{ ...S.nc, transition:"all .2s", animation:"glow 3s ease-in-out infinite" }} onClick={() => onAuth("signup")}>Essai gratuit</button>
        </div>
      </nav>
      <div style={{ position:"relative", zIndex:1, maxWidth:620, margin:"0 auto", padding:"90px 24px 48px", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:18 }}>
        <div style={{ ...S.badge, animation:"fsu .7s ease both" }}>◈ SIMULATEUR IA · CONTRÔLE DE GESTION · DCG · DSCG</div>
        <h1 style={{ fontSize:58, fontWeight:900, margin:0, lineHeight:1.06, letterSpacing:-3, animation:"fsu .7s .1s both" }}>
          Maîtrisez votre<br />
          <span style={{ color:"#e2c97e", position:"relative" }}>
            entretien CdG
            <span style={{ position:"absolute", bottom:-4, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#e2c97e,transparent)", animation:"shim 2s ease-in-out infinite" }} />
          </span>
        </h1>
        <p style={{ fontSize:15, color:"#4b5563", lineHeight:1.75, margin:0, maxWidth:460, animation:"fsu .7s .2s both" }}>
          Un recruteur IA senior simule un vrai entretien. Tableau de bord, analyse des écarts, ABC costing — évaluation instantanée et feedback personnalisé.
        </p>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", animation:"fsu .7s .3s both" }}>
          <button className="cg" style={{ ...S.ctag, animation:"glow 3s ease-in-out infinite", transition:"all .2s" }} onClick={() => onAuth("signup")}>Commencer gratuitement →</button>
          <button className="gh" style={{ ...S.ctagh, transition:"all .2s" }} onClick={onPricing}>Voir les tarifs</button>
        </div>
        <p style={{ fontSize:11, color:"#374151", letterSpacing:".08em", animation:"fi 1s .5s both" }}>1 entretien gratuit · Sans carte bancaire</p>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", padding:"0 24px 48px", position:"relative", zIndex:1 }}>
        {["Tableau de bord","Analyse des écarts","ABC Costing","Clôtures","Reporting","Management"].map((t,i) => (
          <span key={t} style={{ ...S.tag, animation:`fsu .6s ${.4+i*.07}s both` }}>{t}</span>
        ))}
      </div>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"0 24px 100px", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, position:"relative", zIndex:1 }}>
        {[
          {icon:"◈", t:"Entretien IA réaliste", d:"Questions techniques authentiques posées en entretiens DAF / CFO."},
          {icon:"▦", t:"6 thématiques ciblées", d:"Écarts, ABC, Tableau de bord, Clôtures, Reporting, Management."},
          {icon:"◎", t:"Score & coaching IA", d:"Évaluation 0-100 avec points forts, axes d'amélioration et conseil prioritaire."},
          {icon:"△", t:"Flashcards CdG", d:"20 fiches clés pour mémoriser les définitions et concepts essentiels."},
          {icon:"◇", t:"Quiz interactif", d:"10 QCM chronométrés pour tester vos connaissances avant l'entretien."},
          {icon:"☰", t:"Aide-mémoire formules", d:"Toutes les formules de contrôle de gestion organisées par thème."},
        ].map((c,i) => (
          <div key={c.icon} className="fc" style={{ ...S.fc, animation:`fsu .6s ${.6+i*.08}s both`, transition:"all .2s" }}>
            <span style={{ fontSize:22, color:"#e2c97e", marginBottom:10, display:"block", filter:"drop-shadow(0 0 8px rgba(226,201,126,.4))" }}>{c.icon}</span>
            <p style={{ fontSize:13, fontWeight:700, margin:"0 0 6px", color:"#e8e4d9" }}>{c.t}</p>
            <p style={{ fontSize:12, color:"#4b5563", lineHeight:1.6, margin:0 }}>{c.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PRICING ───────────────────────────────────────────────────────────────────
function Pricing({ onAuth, onBack }) {
  return (
    <div style={S.root}><ParticleCanvas /><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Retour</button></nav>
      <div style={{ maxWidth:700, margin:"0 auto", padding:"60px 24px", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ ...S.badge, display:"inline-block", marginBottom:12 }}>TARIFS</div>
          <h2 style={{ fontSize:34, margin:"0 0 8px", color:"#e8e4d9", fontWeight:900 }}>Simple. Transparent.</h2>
          <p style={{ color:"#6b7280", fontSize:14 }}>Commencez gratuitement. Passez Pro quand vous êtes prêt.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {[
            { label:"Gratuit", price:"0€", sub:"", hl:false, cta:"Commencer →", fn:() => onAuth("signup"), feats:["1 entretien complet","Thématique générale","Score & feedback IA","Conseil prioritaire"] },
            { label:"Pro", price:PRO_PRICE, sub:"/mois", hl:true, cta:"Démarrer Pro →", fn:() => window.open(STRIPE_LINK,"_blank"), feats:["Entretiens illimités","6 thématiques ciblées","Historique & progression","Graphique d'évolution","Flashcards (20 fiches)","Quiz (10 QCM)","Aide-mémoire formules","Streak quotidien"] },
          ].map(p => (
            <div key={p.label} style={{ ...S.pc, ...(p.hl?S.phl:{}), ...(p.hl?{animation:"glow 3s ease-in-out infinite"}:{}) }}>
              {p.hl && <div style={S.pb}>RECOMMANDÉ</div>}
              <p style={{ fontSize:11, letterSpacing:".15em", color:p.hl?"#e2c97e":"#6b7280", margin:"0 0 10px" }}>{p.label.toUpperCase()}</p>
              <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:20 }}>
                <span style={{ fontSize:42, fontWeight:900, color:"#e8e4d9" }}>{p.price}</span>
                {p.sub && <span style={{ fontSize:12, color:"#6b7280" }}>{p.sub}</span>}
              </div>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
                {p.feats.map(f => <p key={f} style={{ fontSize:12, color:"#c9c3b5", margin:0 }}>✓ {f}</p>)}
              </div>
              <button className="cg" style={{ ...(p.hl?S.ctag:S.ctagh), width:"100%", padding:12, transition:"all .2s" }} onClick={p.fn}>{p.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
function Auth({ mode, setMode, onDone, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !pass || (mode==="signup" && !name)) { setErr("Tous les champs sont requis."); return; }
    if (pass.length < 6) { setErr("Mot de passe : 6 caractères minimum."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const streak = await loadStreak(email);
    const hist = await loadHistory(email);
    onDone({ name: name||email.split("@")[0], email, isPro:false, interviewsUsed:hist.length, streak });
  };

  return (
    <div style={S.root}><ParticleCanvas /><OrbBg />
      <div style={{ maxWidth:400, margin:"0 auto", padding:"60px 24px", position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:12, animation:"fsu .5s ease both" }}>
        <button style={S.back} onClick={onBack}>← Accueil</button>
        <Logo />
        <h2 style={{ fontSize:22, margin:"12px 0 4px", color:"#e8e4d9" }}>{mode==="signup"?"Créer un compte":"Se connecter"}</h2>
        <p style={{ fontSize:13, color:"#6b7280", marginBottom:12 }}>{mode==="signup"?"1 entretien gratuit inclus. Aucune carte requise.":"Bon retour."}</p>
        {mode==="signup" && <FInput label="Prénom" value={name} set={setName} ph="Jean-Baptiste" />}
        <FInput label="Email" value={email} set={setEmail} ph="jean@exemple.fr" type="email" />
        <FInput label="Mot de passe" value={pass} set={setPass} ph="••••••••" type="password" />
        {err && <p style={{ fontSize:12, color:"#f87171" }}>{err}</p>}
        <button className="cg" style={{ ...S.ctag, width:"100%", opacity:loading?0.6:1, transition:"all .2s", marginTop:4 }} onClick={submit} disabled={loading}>
          {loading
            ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <span style={{ width:13, height:13, border:"2px solid #080b14", borderTop:"2px solid transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }} />
                Chargement…
              </span>
            : mode==="signup" ? "Créer mon compte →" : "Se connecter →"}
        </button>
        <p style={{ fontSize:12, color:"#6b7280", textAlign:"center" }}>
          {mode==="signup" ? "Déjà un compte ? " : "Pas encore de compte ? "}
          <span style={{ color:"#e2c97e", cursor:"pointer" }} onClick={() => { setMode(mode==="signup"?"login":"signup"); setErr(""); }}>
            {mode==="signup" ? "Se connecter" : "S'inscrire"}
          </span>
        </p>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ user, onNew, onLogout, onNav }) {
  const rem = user?.isPro ? "∞" : Math.max(0, FREE_INTERVIEWS-(user?.interviewsUsed||0));
  const mods = [
    {key:"flashcards", icon:"◈", label:"Flashcards", sub:"20 fiches CdG", pro:false},
    {key:"quiz",       icon:"△", label:"Quiz",       sub:"10 QCM",        pro:false},
    {key:"formulas",   icon:"☰", label:"Formules",   sub:"Aide-mémoire",  pro:false},
    {key:"history",    icon:"▦", label:"Historique", sub:"Entretiens passés", pro:true},
    {key:"progress",   icon:"◎", label:"Progression",sub:"Graphique score",   pro:true},
  ];
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}>
        <Logo />
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {!user?.isPro && (
            <button style={{ background:"none", border:"1px solid rgba(226,201,126,.28)", color:"#e2c97e", fontSize:11, padding:"6px 14px", animation:"bglow 2.5s ease-in-out infinite" }} onClick={() => onNav("pricing")}>
              ✦ Pro — {PRO_PRICE}/mois
            </button>
          )}
          <span style={{ fontSize:12, color:"#374151" }}>{user?.name}</span>
          <button style={S.no} onClick={onLogout}>Déconnexion</button>
        </div>
      </nav>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 24px", position:"relative", zIndex:1 }}>
        <div style={{ marginBottom:24, animation:"fsu .5s ease both" }}>
          <h2 style={{ fontSize:20, margin:"0 0 4px", color:"#e8e4d9" }}>Bonjour, {user?.name} 👋</h2>
          <p style={{ fontSize:13, color:"#374151", margin:0 }}>Prêt pour votre prochain entretien ?</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
          {[{v:user?.interviewsUsed||0,l:"Entretiens"},{v:rem,l:"Restants",hl:true},{v:`${user?.streak||0}🔥`,l:"Streak"},{v:user?.isPro?"Pro ✦":"Gratuit",l:"Plan"}].map(s=>(
            <SC key={s.l} v={s.v} l={s.l} hl={s.hl} />
          ))}
        </div>
        <button className="cg" style={{ ...S.ctag, width:"100%", padding:16, fontSize:15, marginBottom:20, animation:"glow 3s ease-in-out infinite", transition:"all .2s" }} onClick={onNew}>
          + Nouveau simulateur d'entretien
        </button>
        <p style={{ fontSize:10, letterSpacing:".15em", color:"#374151", marginBottom:10, textTransform:"uppercase" }}>Outils de préparation</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
          {mods.map((m,i) => {
            const locked = m.pro && !user?.isPro;
            return (
              <button key={m.key} className="mb" onClick={() => locked ? onNav("paywall") : onNav(m.key)}
                style={{ ...S.mb, opacity:locked?0.4:1, animation:`fsu .5s ${i*.06}s both`, transition:"all .2s" }}>
                <span style={{ fontSize:22, marginBottom:5, filter:locked?"none":"drop-shadow(0 0 6px rgba(226,201,126,.3))" }}>{m.icon}</span>
                <span style={{ fontSize:13, fontWeight:700, color:"#e8e4d9" }}>{m.label}</span>
                <span style={{ fontSize:10, color:"#374151" }}>{locked?"🔒 Pro":m.sub}</span>
              </button>
            );
          })}
        </div>
        {!user?.isPro && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(226,201,126,.03)", border:"1px solid rgba(226,201,126,.15)", padding:"14px 18px", gap:12, animation:"bglow 3s ease-in-out infinite" }}>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"#e8e4d9", margin:"0 0 3px" }}>Passez Pro — {PRO_PRICE}/mois</p>
              <p style={{ fontSize:11, color:"#6b7280", margin:0 }}>Entretiens illimités, historique, progression, quiz, formules.</p>
            </div>
            <button className="cg" style={{ ...S.ctag, whiteSpace:"nowrap", fontSize:12, transition:"all .2s" }} onClick={() => onNav("pricing")}>Voir →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CONFIG ────────────────────────────────────────────────────────────────────
function Config({ user, onStart, onBack }) {
  const [role, setRole] = useState(ROLES[1].id);
  const [topic, setTopic] = useState("Général");
  const [dur, setDur] = useState("10");
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Tableau de bord</button></nav>
      <div style={{ maxWidth:580, margin:"0 auto", padding:"40px 24px", position:"relative", zIndex:1, display:"flex", flexDirection:"column", gap:24, animation:"fsu .4s ease both" }}>
        <h2 style={{ fontSize:22, margin:0, color:"#e8e4d9" }}>Configurer l'entretien</h2>
        <Sect label="Niveau du poste">
          <div style={{ display:"flex", gap:10 }}>
            {ROLES.map(r => <OB key={r.id} active={role===r.id} color={r.color} onClick={()=>setRole(r.id)} main={r.label} sub={r.sub} />)}
          </div>
        </Sect>
        <Sect label="Thématique">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {TOPICS.map(t => {
              const locked = !t.free && !user?.isPro;
              return (
                <button key={t.id} onClick={()=>!locked&&setTopic(t.id)}
                  style={{ background:"#0d1117", border:`1px solid ${topic===t.id?"rgba(226,201,126,.3)":"#111827"}`, padding:"10px 14px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:3, opacity:locked?0.4:1, cursor:locked?"default":"pointer", transition:"all .15s" }}>
                  <span style={{ fontSize:16 }}>{t.icon}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:topic===t.id?"#e2c97e":locked?"#374151":"#9ca3af" }}>{t.id}</span>
                  <span style={{ fontSize:10, color:"#374151" }}>{locked?"🔒 Pro":t.desc}</span>
                </button>
              );
            })}
          </div>
        </Sect>
        <Sect label="Durée">
          <div style={{ display:"flex", gap:10 }}>
            {DURATIONS.map(d => <OB key={d.id} active={dur===d.id} color="#e2c97e" onClick={()=>setDur(d.id)} main={d.label} sub={d.sub} />)}
          </div>
        </Sect>
        <button className="cg" style={{ ...S.ctag, padding:14, animation:"glow 3s ease-in-out infinite", transition:"all .2s" }}
          onClick={()=>onStart({role,topic,dur,maxQ:DURATIONS.find(d=>d.id===dur).q})}>
          Lancer la simulation →
        </button>
      </div>
    </div>
  );
}

// ── INTERVIEW ─────────────────────────────────────────────────────────────────
function Interview({ cfg, onDone }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [qCount, setQCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const endRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t+1), 1000);
    boot();
    return () => clearInterval(timerRef.current);
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  const boot = async () => {
    setLoading(true);
    const init = [{role:"user",content:"Bonjour, je suis prêt pour l'entretien."}];
    const reply = await callClaude(SYSTEM_PROMPT(cfg.role,cfg.topic), init);
    setMsgs([...init,{role:"assistant",content:reply}]);
    setQCount(1); setLoading(false);
  };

  const send = async () => {
    if (!input.trim()||loading) return;
    const next = [...msgs,{role:"user",content:input}];
    setMsgs(next); setInput(""); setQCount(q=>q+1); setLoading(true);
    if (qCount+1 > cfg.maxQ) { await finish(next); return; }
    const reply = await callClaude(SYSTEM_PROMPT(cfg.role,cfg.topic), next);
    setMsgs([...next,{role:"assistant",content:reply}]); setLoading(false);
  };

  const finish = async (m) => {
    clearInterval(timerRef.current);
    const t = m||msgs;
    const transcript = t.map(x=>`${x.role==="user"?"Candidat":"Recruteur"}: ${x.content}`).join("\n\n");
    const raw = await callClaude(EVAL_PROMPT,[{role:"user",content:`Transcription:\n\n${transcript}\n\nJSON d'évaluation.`}]);
    let ev;
    try { ev = JSON.parse(raw.replace(/```json|```/g,"").trim()); }
    catch { ev = {score:55,niveau:"Intermédiaire",points_forts:["Participation"],axes_amelioration:["Structurer les réponses"],verdict:"Performance correcte.",conseil_prioritaire:"Approfondissez les formules.",pret_pour_poste:false}; }
    onDone({evaluation:ev, duration:timer, answers:t.filter(x=>x.role==="user").length-1, role:cfg.role, topic:cfg.topic, transcript:t});
  };

  const pct = Math.round((Math.min(qCount,cfg.maxQ)/cfg.maxQ)*100);
  return (
    <div style={{...S.root, display:"flex", flexDirection:"column", height:"100vh"}}>
      <OrbBg />
      <div style={{...S.nav, zIndex:2}}>
        <Logo />
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#374151",border:"1px solid #1f2937",padding:"3px 8px"}}>{cfg.topic}</span>
          <span style={{fontSize:12,color:"#e2c97e",fontFamily:"monospace",filter:"drop-shadow(0 0 5px rgba(226,201,126,.5))"}}>{fmt(timer)}</span>
          <span style={{fontSize:11,color:"#6b7280"}}>{Math.min(qCount,cfg.maxQ)}/{cfg.maxQ}</span>
          <button style={{...S.no,color:"#f87171",borderColor:"#f8717140"}} onClick={()=>finish(msgs)}>Terminer</button>
        </div>
      </div>
      <div style={{height:2,background:"#0d1117"}}>
        <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#e2c97e,#f5e4a0)",transition:"width .5s",boxShadow:"0 0 8px rgba(226,201,126,.5)"}} />
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:14,scrollbarWidth:"none",position:"relative",zIndex:1}}>
        {msgs.map((m,i) => (
          <div key={i} style={{display:"flex",gap:10,justifyContent:m.role==="user"?"flex-end":"flex-start",alignItems:"flex-end",animation:"fsu .3s ease both"}}>
            {m.role==="assistant" && <div style={S.ava}>RH</div>}
            <div style={{maxWidth:"76%",padding:"12px 15px",fontSize:13,lineHeight:1.65,whiteSpace:"pre-wrap",...(m.role==="user"?S.bubu:S.buba)}}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{display:"flex",gap:10,animation:"fi .3s ease"}}>
            <div style={S.ava}>RH</div>
            <div style={{...S.buba,padding:"14px 18px",display:"flex",gap:5,alignItems:"center"}}>
              {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:"#e2c97e",animation:`puls 1.2s ${i*.25}s infinite`}} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{padding:"12px 20px 20px",borderTop:"1px solid #0d1117",display:"flex",gap:10,background:"#080b14",position:"relative",zIndex:1}}>
        <textarea style={S.ta} value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder="Votre réponse… (Entrée pour envoyer)" disabled={loading} rows={3}/>
        <button style={{...S.sb,opacity:loading||!input.trim()?0.3:1,boxShadow:input.trim()?"0 0 16px rgba(226,201,126,.4)":"none",transition:"all .2s"}} onClick={send} disabled={loading||!input.trim()}>→</button>
      </div>
    </div>
  );
}

// ── RESULTS ───────────────────────────────────────────────────────────────────
function Results({ data, user, onNew, onDash }) {
  const {evaluation:ev, duration, answers, role, topic, transcript} = data;
  const sc = scoreColor(ev.score);
  const [copied, setCopied] = useState(false);
  const [anim, setAnim] = useState(0);

  useEffect(()=>{
    let n=0;
    const go=()=>{ n+=2; if(n<=ev.score){setAnim(n);requestAnimationFrame(go);}else setAnim(ev.score); };
    setTimeout(()=>requestAnimationFrame(go),300);
  },[ev.score]);

  const circ = 2*Math.PI*52;
  const copy = ()=>{ navigator.clipboard.writeText(transcript?.map(m=>`[${m.role==="user"?"VOUS":"RECRUTEUR"}]\n${m.content}`).join("\n\n---\n\n")||"").then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}); };

  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onDash}>← Tableau de bord</button></nav>
      <div style={{maxWidth:600,margin:"0 auto",padding:"36px 24px 60px",display:"flex",flexDirection:"column",alignItems:"center",gap:20,position:"relative",zIndex:1}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,animation:"fsu .5s ease both"}}>
          <div style={{position:"relative"}}>
            <div style={{position:"absolute",inset:-8,borderRadius:"50%",background:`radial-gradient(circle,${sc}18 0%,transparent 70%)`,animation:"puls 2s ease-in-out infinite"}} />
            <svg width="140" height="140" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#111827" strokeWidth="8"/>
              <circle cx="60" cy="60" r="52" fill="none" stroke={sc} strokeWidth="8"
                strokeDasharray={`${(anim/100)*circ} ${circ}`} strokeLinecap="round" transform="rotate(-90 60 60)"
                style={{filter:`drop-shadow(0 0 6px ${sc})`,transition:"stroke-dasharray .05s"}}/>
              <text x="60" y="54" textAnchor="middle" fill="white" fontSize="28" fontWeight="900" fontFamily="monospace">{anim}</text>
              <text x="60" y="70" textAnchor="middle" fill="#374151" fontSize="10" fontFamily="monospace">/100</text>
            </svg>
          </div>
          <span style={{fontSize:11,letterSpacing:".15em",color:sc,border:`1px solid ${sc}50`,padding:"4px 16px",fontWeight:700,boxShadow:`0 0 12px ${sc}30`}}>{ev.niveau}</span>
        </div>
        <div style={{background:"#0d1117",border:"1px solid #1a1f2e",padding:"20px 24px",width:"100%",textAlign:"center",animation:"fsu .5s .1s both"}}>
          <p style={{fontSize:14,color:"#c9c3b5",lineHeight:1.7,margin:"0 0 14px"}}>{ev.verdict}</p>
          {ev.conseil_prioritaire && (
            <div style={{background:"#e2c97e08",border:"1px solid #e2c97e25",padding:"10px 16px",marginBottom:14,animation:"bglow 3s ease-in-out infinite"}}>
              <p style={{fontSize:10,color:"#e2c97e",margin:"0 0 4px",letterSpacing:".1em"}}>✦ CONSEIL PRIORITAIRE</p>
              <p style={{fontSize:13,color:"#c9c3b5",margin:0,lineHeight:1.6}}>{ev.conseil_prioritaire}</p>
            </div>
          )}
          <span style={{fontSize:11,padding:"5px 14px",border:`1px solid ${ev.pret_pour_poste?"#4ade80":"#f87171"}`,color:ev.pret_pour_poste?"#4ade80":"#f87171"}}>
            {ev.pret_pour_poste?"✓ Prêt pour le poste":"✗ Nécessite de la préparation"}
          </span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,width:"100%",animation:"fsu .5s .2s both"}}>
          <div style={S.ec}><p style={{...S.et,color:"#4ade80"}}>✦ POINTS FORTS</p>{ev.points_forts?.map((p,i)=><p key={i} style={S.ei}>— {p}</p>)}</div>
          <div style={S.ec}><p style={{...S.et,color:"#f59e0b"}}>↗ À AMÉLIORER</p>{ev.axes_amelioration?.map((a,i)=><p key={i} style={S.ei}>— {a}</p>)}</div>
        </div>
        <div style={{display:"flex",gap:10,width:"100%",animation:"fsu .5s .3s both"}}>
          {[{v:fmt(duration),l:"Durée"},{v:answers,l:"Réponses"},{v:role.split(" ")[0],l:"Niveau"},{v:topic.split(" ")[0],l:"Thème"}].map(s=>(
            <div key={s.l} style={{flex:1,background:"#0d1117",border:"1px solid #1a1f2e",padding:"10px",textAlign:"center"}}>
              <p style={{fontSize:16,fontWeight:900,margin:"0 0 3px",color:"#e8e4d9"}}>{s.v}</p>
              <p style={{fontSize:9,color:"#374151",margin:0}}>{s.l.toUpperCase()}</p>
            </div>
          ))}
        </div>
        {transcript && <button className="gh" style={{...S.ctagh,width:"100%",fontSize:12,padding:10,transition:"all .2s"}} onClick={copy}>{copied?"✓ Copié !":"Copier la transcription"}</button>}
        <button className="cg" style={{...S.ctag,width:"100%",padding:14,animation:"glow 3s ease-in-out infinite",transition:"all .2s"}} onClick={onNew}>+ Nouvel entretien</button>
      </div>
    </div>
  );
}

// ── FLASHCARDS ────────────────────────────────────────────────────────────────
function Flashcards({ onBack }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState("Tous");
  const tops = ["Tous",...new Set(FLASHCARDS.map(f=>f.topic))];
  const cards = filter==="Tous" ? FLASHCARDS : FLASHCARDS.filter(f=>f.topic===filter);
  const card = cards[idx%cards.length];
  const next=()=>{setFlipped(false);setTimeout(()=>setIdx(i=>(i+1)%cards.length),150);};
  const prev=()=>{setFlipped(false);setTimeout(()=>setIdx(i=>(i-1+cards.length)%cards.length),150);};
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Tableau de bord</button></nav>
      <div style={{maxWidth:580,margin:"0 auto",padding:"36px 24px",position:"relative",zIndex:1,animation:"fsu .4s ease both"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{fontSize:20,margin:0,color:"#e8e4d9"}}>◈ Flashcards</h2>
          <span style={{fontSize:12,color:"#4b5563"}}>{(idx%cards.length)+1} / {cards.length}</span>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
          {tops.map(t=><button key={t} style={{...S.fb,...(filter===t?S.fa:{})}} onClick={()=>{setFilter(t);setIdx(0);setFlipped(false);}}>{t}</button>)}
        </div>
        <div style={{perspective:1200,marginBottom:20,cursor:"pointer"}} onClick={()=>setFlipped(f=>!f)}>
          <div style={{position:"relative",transformStyle:"preserve-3d",transition:"transform .55s cubic-bezier(.4,0,.2,1)",transform:flipped?"rotateY(180deg)":"rotateY(0)",height:240}}>
            <div style={{...S.card,backfaceVisibility:"hidden",position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"center"}}>
              <p style={{fontSize:10,color:"#e2c97e",letterSpacing:".12em",margin:"0 0 16px"}}>QUESTION · {card.topic}</p>
              <p style={{fontSize:16,color:"#e8e4d9",lineHeight:1.6,margin:"0 0 20px",fontWeight:600}}>{card.q}</p>
              <p style={{fontSize:11,color:"#374151"}}>Cliquer pour révéler →</p>
            </div>
            <div style={{...S.card,backfaceVisibility:"hidden",position:"absolute",inset:0,transform:"rotateY(180deg)",borderColor:"#4ade8030",display:"flex",flexDirection:"column",justifyContent:"center"}}>
              <p style={{fontSize:10,color:"#4ade80",letterSpacing:".12em",margin:"0 0 16px"}}>RÉPONSE</p>
              <p style={{fontSize:14,color:"#c9c3b5",lineHeight:1.7,margin:0}}>{card.a}</p>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="gh" style={{...S.ctagh,flex:1,transition:"all .2s"}} onClick={prev}>← Précédente</button>
          <button className="cg" style={{...S.ctag,flex:1,transition:"all .2s"}} onClick={next}>Suivante →</button>
        </div>
      </div>
    </div>
  );
}

// ── QUIZ ──────────────────────────────────────────────────────────────────────
function Quiz({ onBack }) {
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [timer, setTimer] = useState(0);
  const [answers, setAnswers] = useState([]);
  const timerRef = useRef(null);
  useEffect(()=>{ timerRef.current=setInterval(()=>setTimer(t=>t+1),1000); return()=>clearInterval(timerRef.current); },[]);
  const q=QUIZ_QUESTIONS[qi];
  const pick=(i)=>{ if(sel!==null)return; setSel(i); if(i===q.answer)setScore(s=>s+1); setAnswers(a=>[...a,{q:q.q,correct:i===q.answer,right:q.options[q.answer]}]); };
  const next=()=>{ if(qi+1>=QUIZ_QUESTIONS.length){clearInterval(timerRef.current);setDone(true);}else{setQi(i=>i+1);setSel(null);} };
  const restart=()=>{ setQi(0);setSel(null);setScore(0);setDone(false);setTimer(0);setAnswers([]); timerRef.current=setInterval(()=>setTimer(t=>t+1),1000); };

  if(done) return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Tableau de bord</button></nav>
      <div style={{maxWidth:520,margin:"0 auto",padding:"40px 24px",position:"relative",zIndex:1,display:"flex",flexDirection:"column",gap:14,animation:"fsu .5s ease both"}}>
        <h2 style={{fontSize:22,color:"#e8e4d9",margin:0}}>Résultats du Quiz</h2>
        <div style={{...S.card,textAlign:"center",borderColor:`${scoreColor(score*10)}30`,boxShadow:`0 0 24px ${scoreColor(score*10)}12`}}>
          <p style={{fontSize:52,fontWeight:900,color:scoreColor(score*10),margin:"0 0 4px",filter:`drop-shadow(0 0 12px ${scoreColor(score*10)})`}}>{score}/{QUIZ_QUESTIONS.length}</p>
          <p style={{fontSize:13,color:"#6b7280",margin:0}}>{fmt(timer)} · {Math.round(score/QUIZ_QUESTIONS.length*100)}% de réussite</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:280,overflowY:"auto"}}>
          {answers.map((a,i)=>(
            <div key={i} style={{background:"#0d1117",border:`1px solid ${a.correct?"#4ade8025":"#f8717125"}`,padding:"10px 14px"}}>
              <p style={{fontSize:11,color:a.correct?"#4ade80":"#f87171",margin:"0 0 4px"}}>{a.correct?"✓ Correct":"✗ Incorrect"}</p>
              <p style={{fontSize:12,color:"#6b7280",margin:0}}>{a.q}</p>
              {!a.correct&&<p style={{fontSize:11,color:"#4b5563",margin:"4px 0 0"}}>Réponse : {a.right}</p>}
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="gh" style={{...S.ctagh,flex:1,transition:"all .2s"}} onClick={restart}>Recommencer</button>
          <button className="cg" style={{...S.ctag,flex:1,transition:"all .2s"}} onClick={onBack}>Tableau de bord</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}>
        <Logo />
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:12,color:"#e2c97e",fontFamily:"monospace",filter:"drop-shadow(0 0 4px rgba(226,201,126,.5))"}}>{fmt(timer)}</span>
          <span style={{fontSize:12,color:"#6b7280"}}>{qi+1}/{QUIZ_QUESTIONS.length}</span>
          <button style={S.nl} onClick={onBack}>Quitter</button>
        </div>
      </nav>
      <div style={{height:2,background:"#0d1117"}}><div style={{height:"100%",width:`${((qi+(sel!==null?1:0))/QUIZ_QUESTIONS.length)*100}%`,background:"linear-gradient(90deg,#e2c97e,#f5e4a0)",transition:"width .3s",boxShadow:"0 0 8px rgba(226,201,126,.5)"}}/></div>
      <div style={{maxWidth:560,margin:"0 auto",padding:"36px 24px",position:"relative",zIndex:1,animation:"fsu .3s ease both"}}>
        <div style={{...S.card,marginBottom:16}}>
          <p style={{fontSize:10,color:"#e2c97e",letterSpacing:".1em",margin:"0 0 12px"}}>QUESTION {qi+1}</p>
          <p style={{fontSize:16,color:"#e8e4d9",lineHeight:1.6,margin:0,fontWeight:600}}>{q.q}</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {q.options.map((opt,i)=>{
            let bg="#0d1117",border="#1a1f2e",color="#9ca3af",shadow="none";
            if(sel!==null){
              if(i===q.answer){bg="#4ade8010";border="#4ade80";color="#4ade80";shadow="0 0 12px rgba(74,222,128,.2)";}
              else if(i===sel&&i!==q.answer){bg="#f8717110";border="#f87171";color="#f87171";}
            }
            return <button key={i} onClick={()=>pick(i)} style={{background:bg,border:`1px solid ${border}`,color,padding:"12px 16px",textAlign:"left",cursor:sel===null?"pointer":"default",fontSize:13,transition:"all .2s",boxShadow:shadow}}>{String.fromCharCode(65+i)}. {opt}</button>;
          })}
        </div>
        {sel!==null&&<div style={{background:"#0d1117",border:"1px solid #1f2937",padding:"12px 16px",marginBottom:16}}><p style={{fontSize:10,color:"#6b7280",margin:"0 0 4px",letterSpacing:".1em"}}>EXPLICATION</p><p style={{fontSize:13,color:"#c9c3b5",margin:0,lineHeight:1.6}}>{q.expl}</p></div>}
        {sel!==null&&<button className="cg" style={{...S.ctag,width:"100%",padding:13,transition:"all .2s"}} onClick={next}>{qi+1>=QUIZ_QUESTIONS.length?"Voir les résultats →":"Question suivante →"}</button>}
      </div>
    </div>
  );
}

// ── FORMULAS ──────────────────────────────────────────────────────────────────
function Formulas({ onBack }) {
  const [open, setOpen] = useState("Analyse des écarts");
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Tableau de bord</button></nav>
      <div style={{maxWidth:660,margin:"0 auto",padding:"36px 24px",position:"relative",zIndex:1,animation:"fsu .4s ease both"}}>
        <h2 style={{fontSize:20,margin:"0 0 20px",color:"#e8e4d9"}}>☰ Formules & Aide-mémoire</h2>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
          {FORMULAS.map(f=><button key={f.cat} style={{...S.fb,...(open===f.cat?S.fa:{})}} onClick={()=>setOpen(f.cat)}>{f.cat}</button>)}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {FORMULAS.filter(f=>f.cat===open)[0]?.items.map((item,i)=>(
            <div key={item.name} style={{background:"#0d1117",border:"1px solid #1a1f2e",padding:"14px 18px",animation:`fsu .3s ${i*.05}s both`,transition:"border-color .2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#e2c97e25"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#1a1f2e"}>
              <p style={{fontSize:11,color:"#4b5563",margin:"0 0 6px"}}>{item.name}</p>
              <p style={{fontSize:14,color:"#e2c97e",margin:"0 0 6px",fontFamily:"monospace",filter:"drop-shadow(0 0 4px rgba(226,201,126,.2))"}}>{item.formula}</p>
              <p style={{fontSize:11,color:"#374151",margin:0,fontStyle:"italic"}}>{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── HISTORY ───────────────────────────────────────────────────────────────────
function History({ user, onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ loadHistory(user.email).then(h=>{setHistory(h);setLoading(false);}); },[]);
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Tableau de bord</button></nav>
      <div style={{maxWidth:620,margin:"0 auto",padding:"36px 24px",position:"relative",zIndex:1}}>
        <h2 style={{fontSize:20,margin:"0 0 20px",color:"#e8e4d9"}}>▦ Historique</h2>
        {loading ? <p style={{color:"#374151"}}>Chargement…</p>
          : history.length===0 ? <p style={{color:"#374151",fontSize:13}}>Aucun entretien pour le moment.</p>
          : <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {history.map((h,i)=>{ const sc=h.evaluation?.score||0; return (
                <div key={i} style={{background:"#0d1117",border:"1px solid #1a1f2e",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",animation:`fsu .3s ${i*.04}s both`}}>
                  <div>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:11,color:scoreColor(sc),border:`1px solid ${scoreColor(sc)}40`,padding:"2px 8px"}}>{h.evaluation?.niveau||"—"}</span>
                      <span style={{fontSize:11,color:"#4b5563"}}>{h.topic||"Général"}</span>
                    </div>
                    <p style={{fontSize:12,color:"#374151",margin:0}}>{h.date}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:26,fontWeight:900,margin:"0 0 2px",color:scoreColor(sc),filter:`drop-shadow(0 0 6px ${scoreColor(sc)}60)`}}>{sc}</p>
                    <p style={{fontSize:10,color:"#374151",margin:0}}>/100</p>
                  </div>
                </div>
              );})}
            </div>
        }
      </div>
    </div>
  );
}

// ── PROGRESS ──────────────────────────────────────────────────────────────────
function Progress({ user, onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ loadHistory(user.email).then(h=>{setHistory(h.slice(0,20).reverse());setLoading(false);}); },[]);
  const chartData = history.map((h,i)=>({n:i+1,score:h.evaluation?.score||0}));
  const avg = history.length ? Math.round(history.reduce((s,h)=>s+(h.evaluation?.score||0),0)/history.length) : 0;
  const best = history.length ? Math.max(...history.map(h=>h.evaluation?.score||0)) : 0;
  return (
    <div style={S.root}><OrbBg />
      <nav style={S.nav}><Logo /><button style={S.nl} onClick={onBack}>← Tableau de bord</button></nav>
      <div style={{maxWidth:660,margin:"0 auto",padding:"36px 24px",position:"relative",zIndex:1,animation:"fsu .4s ease both"}}>
        <h2 style={{fontSize:20,margin:"0 0 20px",color:"#e8e4d9"}}>◎ Progression</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
          <SC v={history.length} l="Entretiens" /><SC v={avg} l="Score moyen" hl /><SC v={best} l="Meilleur" />
        </div>
        {loading ? <p style={{color:"#374151"}}>Chargement…</p>
          : history.length<2 ? <div style={{...S.card,textAlign:"center"}}><p style={{color:"#374151",fontSize:13,margin:0}}>Faites 2+ entretiens pour voir votre progression.</p></div>
          : <div style={{background:"#0d1117",border:"1px solid #1a1f2e",padding:"20px 8px 12px"}}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{top:5,right:20,left:0,bottom:5}}>
                  <CartesianGrid stroke="#111827" strokeDasharray="3 3"/>
                  <XAxis dataKey="n" stroke="#1f2937" tick={{fontSize:10,fill:"#374151"}}/>
                  <YAxis domain={[0,100]} stroke="#1f2937" tick={{fontSize:10,fill:"#374151"}}/>
                  <Tooltip contentStyle={{background:"#0d1117",border:"1px solid #1a1f2e",fontSize:12}} labelStyle={{color:"#6b7280"}} itemStyle={{color:"#e2c97e"}} formatter={v=>[`${v}/100`,"Score"]}/>
                  <Line type="monotone" dataKey="score" stroke="#e2c97e" strokeWidth={2} dot={{fill:"#e2c97e",r:4}} activeDot={{r:7}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
        }
      </div>
    </div>
  );
}

// ── PAYWALL ───────────────────────────────────────────────────────────────────
function Paywall({ user, onUpgrade, onBack }) {
  return (
    <div style={S.root}><ParticleCanvas /><OrbBg />
      <div style={{maxWidth:460,margin:"0 auto",padding:"80px 24px",display:"flex",flexDirection:"column",alignItems:"center",gap:20,textAlign:"center",position:"relative",zIndex:1,animation:"fsu .5s ease both"}}>
        <span style={{fontSize:40,filter:"drop-shadow(0 0 16px rgba(226,201,126,.5))"}}>◈</span>
        <h2 style={{fontSize:26,margin:0,color:"#e8e4d9"}}>Passez à Pro</h2>
        <p style={{fontSize:14,color:"#6b7280",lineHeight:1.7,margin:0}}>
          {user?.interviewsUsed>=FREE_INTERVIEWS?`Votre entretien gratuit a été utilisé, ${user.name}.`:"Fonctionnalité réservée aux membres Pro."}
        </p>
        <div style={{...S.pc,...S.phl,width:"100%",animation:"glow 3s ease-in-out infinite"}}>
          <div style={S.pb}>CTRL·G PRO</div>
          <p style={{fontSize:40,fontWeight:900,color:"#e8e4d9",margin:"12px 0 4px"}}>{PRO_PRICE}<span style={{fontSize:14,color:"#6b7280"}}>/mois</span></p>
          <div style={{display:"flex",flexDirection:"column",gap:7,margin:"14px 0 20px"}}>
            {["Entretiens illimités","6 thématiques ciblées","Historique & progression","Flashcards + Quiz + Formules","Streak quotidien"].map(f=>(
              <p key={f} style={{fontSize:12,color:"#c9c3b5",margin:0}}>✓ {f}</p>
            ))}
          </div>
          <button className="cg" style={{...S.ctag,width:"100%",padding:13,transition:"all .2s"}} onClick={onUpgrade}>Passer à Pro →</button>
        </div>
        <button style={S.back} onClick={onBack}>← Retour</button>
      </div>
    </div>
  );
}

// ── SHARED ATOMS ──────────────────────────────────────────────────────────────
function Logo({ glow }) {
  return <span style={{fontSize:20,fontWeight:900,fontFamily:"monospace",letterSpacing:-1,color:"#e8e4d9"}}>CTRL<span style={{color:"#e2c97e",filter:glow?"drop-shadow(0 0 8px rgba(226,201,126,.6))":"none"}}>·G</span></span>;
}
function SC({ v, l, hl }) {
  return (
    <div style={{background:"#0d1117",border:`1px solid ${hl?"rgba(226,201,126,.2)":"#1a1f2e"}`,padding:"14px 10px",textAlign:"center",boxShadow:hl?"0 0 20px rgba(226,201,126,.05)":"none"}}>
      <p style={{fontSize:22,fontWeight:900,margin:"0 0 3px",color:hl?"#e2c97e":"#e8e4d9"}}>{v}</p>
      <p style={{fontSize:9,color:"#374151",margin:0,letterSpacing:".1em"}}>{l.toUpperCase()}</p>
    </div>
  );
}
function FInput({ label, value, set, ph, type="text" }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <label style={{fontSize:10,letterSpacing:".12em",color:"#6b7280",textTransform:"uppercase"}}>{label}</label>
      <input style={{background:"#0d1117",border:"1px solid #1f2937",color:"#e8e4d9",padding:"10px 12px",fontSize:13,fontFamily:"inherit",outline:"none",transition:"border-color .2s"}}
        type={type} value={value} onChange={e=>set(e.target.value)} placeholder={ph}
        onFocus={e=>e.target.style.borderColor="#e2c97e40"}
        onBlur={e=>e.target.style.borderColor="#1f2937"}/>
    </div>
  );
}
function Sect({ label, children }) {
  return <div><p style={{fontSize:10,letterSpacing:".15em",color:"#6b7280",margin:"0 0 10px",textTransform:"uppercase"}}>{label}</p>{children}</div>;
}
function OB({ active, color, onClick, main, sub }) {
  return (
    <button onClick={onClick} style={{flex:1,background:active?`${color}12`:"#0d1117",border:`2px solid ${active?color:"#1f2937"}`,color:active?color:"#6b7280",padding:"12px 8px",fontSize:13,display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all .15s",boxShadow:active?`0 0 16px ${color}20`:"none"}}>
      <strong>{main}</strong><span style={{fontSize:10,opacity:.6}}>{sub}</span>
    </button>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = {
  root:{minHeight:"100vh",background:"#080b14",color:"#e8e4d9",fontFamily:"'DM Mono','Courier New',monospace",position:"relative",overflow:"hidden"},
  nav:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 24px",borderBottom:"1px solid #0d1117",background:"rgba(8,11,20,.88)",backdropFilter:"blur(12px)",position:"relative",zIndex:2},
  nl:{background:"none",border:"none",color:"#6b7280",fontSize:13,cursor:"pointer"},
  no:{background:"none",border:"1px solid #1f2937",color:"#9ca3af",fontSize:12,padding:"6px 14px",cursor:"pointer"},
  nc:{background:"#e2c97e",border:"none",color:"#080b14",fontSize:12,padding:"7px 16px",cursor:"pointer",fontWeight:700},
  badge:{fontSize:10,letterSpacing:".18em",color:"#e2c97e",border:"1px solid rgba(226,201,126,.2)",padding:"5px 16px",background:"rgba(226,201,126,.04)"},
  ctag:{background:"#e2c97e",border:"none",color:"#080b14",fontSize:14,fontWeight:700,padding:"13px 28px",cursor:"pointer",letterSpacing:".04em"},
  ctagh:{background:"none",border:"1px solid #1f2937",color:"#9ca3af",fontSize:14,padding:"13px 28px",cursor:"pointer"},
  tag:{fontSize:11,color:"#374151",border:"1px solid #0f1520",padding:"5px 12px",background:"rgba(13,17,23,.5)"},
  fc:{background:"rgba(13,17,23,.8)",border:"1px solid #111827",padding:"18px 14px",display:"flex",flexDirection:"column",backdropFilter:"blur(8px)"},
  pc:{background:"#0d1117",border:"1px solid #1a1f2e",padding:"24px 20px",position:"relative",display:"flex",flexDirection:"column"},
  phl:{border:"1px solid rgba(226,201,126,.25)",background:"rgba(226,201,126,.03)"},
  pb:{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:"#e2c97e",color:"#080b14",fontSize:9,padding:"3px 12px",fontWeight:700,letterSpacing:".12em",whiteSpace:"nowrap"},
  back:{background:"none",border:"none",color:"#6b7280",fontSize:12,cursor:"pointer",padding:0,alignSelf:"flex-start"},
  mb:{background:"#0d1117",border:"1px solid #111827",padding:"16px 10px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4},
  fb:{background:"none",border:"1px solid #1f2937",color:"#374151",padding:"5px 12px",fontSize:11,cursor:"pointer",transition:"all .15s"},
  fa:{border:"1px solid rgba(226,201,126,.35)",color:"#e2c97e",background:"rgba(226,201,126,.06)"},
  card:{background:"#0d1117",border:"1px solid #1a1f2e",padding:"20px 22px"},
  ava:{width:30,height:30,background:"#111827",border:"1px solid #1f2937",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#6b7280",flexShrink:0},
  buba:{background:"rgba(13,17,23,.9)",border:"1px solid #1a1f2e",color:"#c9c3b5",borderRadius:"0 8px 8px 8px"},
  bubu:{background:"rgba(226,201,126,.07)",border:"1px solid rgba(226,201,126,.18)",color:"#e8e4d9",borderRadius:"8px 0 8px 8px"},
  ta:{flex:1,background:"#0d1117",border:"1px solid #1f2937",color:"#e8e4d9",padding:"12px 14px",fontSize:13,fontFamily:"inherit",resize:"none",outline:"none",lineHeight:1.6},
  sb:{background:"#e2c97e",border:"none",color:"#080b14",width:44,height:44,fontSize:18,cursor:"pointer",fontWeight:700,flexShrink:0,alignSelf:"flex-end"},
  ec:{background:"#0d1117",border:"1px solid #1a1f2e",padding:"14px 16px"},
  et:{fontSize:9,letterSpacing:".12em",margin:"0 0 10px"},
  ei:{fontSize:12,color:"#4b5563",margin:"4px 0",lineHeight:1.55},
};
