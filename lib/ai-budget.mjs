import { hasPro } from "./ai-access.mjs";
export const AI_MODEL = "openai/gpt-oss-20b";
export const DAILY_LIMIT = 20,
  MONTHLY_LIMIT = 300;
export const CASE_DAILY_LIMIT=5, CASE_MONTHLY_LIMIT=60;
// USD micro-units. Groq list price checked 2026-10-12: $0.075/M input,
// $0.30/M output. Reserve an upper bound, including reasoning tokens.
// This is an application budget estimate, not a provider billing guarantee.
export const USER_BUDGET = 1_500_000,
  GLOBAL_BUDGET = 20_000_000;
export function periods(now = new Date()) {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return { day, month: day.slice(0, 7) };
}
export function reserveCost(data) {
  const bytes = data.messages.reduce(
    (n, m) => n + Buffer.byteLength(m.content, "utf8"),
    0,
  );
  return Math.ceil((bytes + 1000) * 0.075 + data.max_tokens * 0.3);
}
export async function reserveTutor(db, uid, data, now = new Date()) {
  const { day, month } = periods(now),
    cost = reserveCost(data);
  const refs = [
    db.collection("users").doc(uid),
    db.collection("aiUsage").doc(`${uid}_${day}`),
    db.collection("aiUsage").doc(`${uid}_month_${month}`),
    db.collection("aiUsage").doc(`global_${month}`),
  ];
  const caseReview=data.purpose==='case-review';
  if(caseReview)refs.push(db.collection('aiUsage').doc(`${uid}_case_${day}`),db.collection('aiUsage').doc(`${uid}_case_month_${month}`));
  return db.runTransaction(async (tx) => {
    const [p, d, m, g, cd, cm] = await Promise.all(refs.map((ref) => tx.get(ref)));
    if (!hasPro(p.data(), now.getTime()))
      throw Object.assign(
        new Error("Un accès Pro actif est nécessaire pour le tuteur."),
        { status: 403 },
      );
    const daily = d.data() || {},
      monthly = m.data() || {},
      global = g.data() || {};
    const caseDaily=cd?.data()||{},caseMonthly=cm?.data()||{};
    if(caseReview&&((caseDaily.count||0)>=CASE_DAILY_LIMIT||(caseMonthly.count||0)>=CASE_MONTHLY_LIMIT))throw Object.assign(new Error('Votre limite de retours IA sur les cas est atteinte. Les exercices guidés et corrigés restent disponibles.'),{status:429});
    if ((daily.count || 0) >= DAILY_LIMIT)
      throw Object.assign(
        new Error(
          "Vos 20 demandes du jour sont utilisées. Les fiches et exercices restent disponibles.",
        ),
        { status: 429 },
      );
    if (
      (monthly.count || 0) >= MONTHLY_LIMIT ||
      (monthly.reservedMicros || 0) + cost > USER_BUDGET
    )
      throw Object.assign(
        new Error(
          "Votre budget mensuel de tuteur est utilisé. Les fiches et exercices restent disponibles.",
        ),
        { status: 429 },
      );
    if ((global.reservedMicros || 0) + cost > GLOBAL_BUDGET)
      throw Object.assign(
        new Error(
          "Le tuteur est momentanément en pause. Les révisions restent disponibles.",
        ),
        { status: 503 },
      );
    if (daily.lastRequestAt && now.getTime() - daily.lastRequestAt < 2500)
      throw Object.assign(
        new Error("Patientez quelques secondes avant une nouvelle demande."),
        { status: 429 },
      );
    tx.set(refs[1], {
      count: (daily.count || 0) + 1,
      lastRequestAt: now.getTime(),
      updatedAt: now.toISOString(),
    });
    tx.set(refs[2], {
      count: (monthly.count || 0) + 1,
      reservedMicros: (monthly.reservedMicros || 0) + cost,
      updatedAt: now.toISOString(),
    });
    tx.set(refs[3], {
      reservedMicros: (global.reservedMicros || 0) + cost,
      updatedAt: now.toISOString(),
    });
    if(caseReview){tx.set(refs[4],{count:(caseDaily.count||0)+1,updatedAt:now.toISOString()});tx.set(refs[5],{count:(caseMonthly.count||0)+1,updatedAt:now.toISOString()});}
    return {
      dailyRemaining: DAILY_LIMIT - (daily.count || 0) - 1,
      monthlyRemaining: MONTHLY_LIMIT - (monthly.count || 0) - 1,
      ...(caseReview?{caseDailyRemaining:CASE_DAILY_LIMIT-(caseDaily.count||0)-1,caseMonthlyRemaining:CASE_MONTHLY_LIMIT-(caseMonthly.count||0)-1}:{}),
    };
  });
}
