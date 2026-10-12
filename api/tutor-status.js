import { AI_MODEL } from "../lib/ai-budget.mjs";
let cache;
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300");
  if (req.method !== "GET") return res.status(405).json({ available: false });
  if (cache && cache.until > Date.now())
    return res.status(200).json(cache.result);
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
  const result = { available, dailyLimit: 20, monthlyLimit: 300 };
  cache = { result, until: Date.now() + 300000 };
  return res.status(200).json(result);
}
