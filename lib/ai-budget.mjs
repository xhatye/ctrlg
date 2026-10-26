import { hasPro } from "./ai-access.mjs";
export const AI_MODEL = "openai/gpt-oss-120b";
export const DAILY_LIMIT = 20,
  MONTHLY_LIMIT = 300;
export const CASE_DAILY_LIMIT=5, CASE_MONTHLY_LIMIT=60;
// USD micro-units, on-demand Groq pricing checked 2026-10-26:
// $0.15/M input and $0.60/M output (including hidden reasoning).
// Never refund reservations: failures/timeouts may still be billed by Groq.
// Keep historical usage in the same documents; a new release never resets it.
export const USER_BUDGET = 360_000,
  GLOBAL_BUDGET = 20_000_000;
export const MAX_COMPLETION_TOKENS = 2048;
function counter(value) {
  if (value === undefined) return 0;
  if (!Number.isSafeInteger(value) || value < 0)
    throw Object.assign(new Error('Le suivi du tuteur est indisponible. Vos cours restent accessibles.'), {status:503});
  return value;
}
function usageView(daily={}, monthly={}, global={}, now=new Date()) {
  const dailyRemaining=Math.max(0,DAILY_LIMIT-counter(daily.count));
  const monthlyRemaining=Math.max(0,MONTHLY_LIMIT-counter(monthly.count));
  const budgetRemainingMicros=Math.max(0,USER_BUDGET-counter(monthly.reservedMicros));
  const globallyPaused=counter(global.reservedMicros)>=GLOBAL_BUDGET;
  return {dailyRemaining,monthlyRemaining,budgetRemainingMicros,budgetLimitMicros:USER_BUDGET,
    budgetPercentRemaining:Math.floor(100*budgetRemainingMicros/USER_BUDGET),
    budgetCurrency:'USD',budgetPeriod:periods(now).month,
    canRequest:dailyRemaining>0&&monthlyRemaining>0&&budgetRemainingMicros>0&&!globallyPaused};
}
export async function tutorUsage(db,uid,now=new Date()) {
  const {day,month}=periods(now);
  return db.runTransaction(async tx=>{
    const [profile,daily,monthly,global]=await Promise.all([
      db.collection('users').doc(uid),db.collection('aiUsage').doc(`${uid}_${day}`),
      db.collection('aiUsage').doc(`${uid}_month_${month}`),db.collection('aiUsage').doc(`global_${month}`),
    ].map(ref=>tx.get(ref)));
    if(!hasPro(profile.data(),now.getTime()))throw Object.assign(new Error('Un accès Pro actif est nécessaire pour le tuteur.'),{status:403});
    return usageView(daily.data(),monthly.data(),global.data(),now);
  });
}
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
  if(!Array.isArray(data?.messages)||!data.messages.length||data.messages.length>13||
    data.messages.some(m=>!m||typeof m.content!=='string'||!['system','user','assistant'].includes(m.role))||
    !Number.isInteger(data.max_tokens)||data.max_tokens<128||data.max_tokens>MAX_COMPLETION_TOKENS)
    throw Object.assign(new Error('Demande IA invalide.'),{status:400});
  const bytes = data.messages.reduce(
    (n, m) => n + Buffer.byteLength(m.content, "utf8"),
    0,
  );
  if(bytes>80_000)throw Object.assign(new Error('Raccourcissez votre question ou ouvrez une nouvelle discussion.'),{status:400});
  // Byte-level tokenization cannot exceed one token per UTF-8 byte of text.
  // A deliberately generous extra 4096 tokens covers chat framing/control tokens.
  // Integer arithmetic rounds UP. No tools, images, retries or premium tier.
  return Math.ceil(((bytes + 4096) * 15 + data.max_tokens * 60) / 100);
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
    const dailyCount=counter(daily.count),monthlyCount=counter(monthly.count),
      monthlyCost=counter(monthly.reservedMicros),globalCost=counter(global.reservedMicros);
    if(caseReview&&(counter(caseDaily.count)>=CASE_DAILY_LIMIT||counter(caseMonthly.count)>=CASE_MONTHLY_LIMIT))throw Object.assign(new Error('Votre limite de retours IA sur les cas est atteinte. Les exercices guidés et corrigés restent disponibles.'),{status:429});
    if (dailyCount >= DAILY_LIMIT)
      throw Object.assign(
        new Error(
          "Vos 20 demandes du jour sont utilisées. Les fiches et exercices restent disponibles.",
        ),
        { status: 429 },
      );
    if (
      monthlyCount >= MONTHLY_LIMIT ||
      monthlyCost + cost > USER_BUDGET
    )
      throw Object.assign(
        new Error(
          "Votre budget mensuel de tuteur est utilisé. Les fiches et exercices restent disponibles.",
        ),
        { status: 429 },
      );
    if (globalCost + cost > GLOBAL_BUDGET)
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
      ...daily,
      count: dailyCount + 1,
      lastRequestAt: now.getTime(),
      updatedAt: now.toISOString(),
    });
    tx.set(refs[2], {
      ...monthly,
      count: monthlyCount + 1,
      reservedMicros: monthlyCost + cost,
      updatedAt: now.toISOString(),
    });
    tx.set(refs[3], {
      ...global,
      reservedMicros: globalCost + cost,
      updatedAt: now.toISOString(),
    });
    if(caseReview){tx.set(refs[4],{count:(caseDaily.count||0)+1,updatedAt:now.toISOString()});tx.set(refs[5],{count:(caseMonthly.count||0)+1,updatedAt:now.toISOString()});}
    return {
      ...usageView({count:dailyCount+1},{count:monthlyCount+1,reservedMicros:monthlyCost+cost},{reservedMicros:globalCost+cost},now),
      ...(caseReview?{caseDailyRemaining:CASE_DAILY_LIMIT-(caseDaily.count||0)-1,caseMonthlyRemaining:CASE_MONTHLY_LIMIT-(caseMonthly.count||0)-1}:{}),
    };
  });
}
