const RATE_LIMIT = 30;
const rateLimitMap = new Map();

export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const dayMs = 86400000;
  const entry = rateLimitMap.get(ip) || { count: 0, reset: now + dayMs };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + dayMs; }
  entry.count++;
  rateLimitMap.set(ip, entry);
  if (entry.count > RATE_LIMIT) return new Response(JSON.stringify({ error: "Rate limit atteint. Revenez demain." }), { status: 429 });

  const body = await req.json();
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status, headers: { "Content-Type": "application/json" } });
}
