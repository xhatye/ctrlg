import { AI_MODEL, DAILY_LIMIT, MONTHLY_LIMIT, USER_BUDGET, tutorUsage } from "../lib/ai-budget.mjs";
import { firebaseServices, authenticated, fail } from '../lib/admin.mjs';
let cache;
export default async function handler(req, res) {
  const privateRequest=!!req.headers.authorization;
  res.setHeader("Cache-Control", privateRequest ? "private, no-store" : "public, max-age=0, s-maxage=300");
  if (req.method !== "GET") return res.status(405).json({ available: false });
  let usage;
  if(privateRequest){
    try{
      const deps=firebaseServices(), user=await authenticated(req,deps.auth);
      usage=await tutorUsage(deps.db,user.uid);
    }catch(error){return fail(res,error);}
  }
  if (cache && cache.until > Date.now())
    return res.status(200).json({...cache.result,...(usage?{usage}:{})});
  let available = false;
  if (process.env.GROQ_API_KEY) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        signal: AbortSignal.timeout(7000),
      });
      if (response.ok)
        available =
          (await response.json()).data?.some((x) => x.id === AI_MODEL) === true;
    } catch {}
  }
  const result = { available, model:AI_MODEL, dailyLimit: DAILY_LIMIT, monthlyLimit: MONTHLY_LIMIT, budgetLimitMicros:USER_BUDGET, budgetCurrency:'USD' };
  cache = { result, until: Date.now() + 300000 };
  return res.status(200).json({...result,...(usage?{usage}:{})});
}
