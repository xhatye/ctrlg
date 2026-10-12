import { services, authenticated, fail } from "../lib/admin.mjs";
import { hasPro, validateChat } from "../lib/ai-access.mjs";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const deps = services(),
      user = await authenticated(req, deps.auth);
    const data = validateChat(
      typeof req.body === "string" ? JSON.parse(req.body) : req.body,
    );
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" })
      .format(new Date())
      .replaceAll("/", "-");
    const usage = deps.db.collection("aiUsage").doc(`${user.uid}_${date}`);
    await deps.db.runTransaction(async (tx) => {
      const [profile, daily] = await Promise.all([
        tx.get(deps.db.collection("users").doc(user.uid)),
        tx.get(usage),
      ]);
      if (!hasPro(profile.data()))
        throw Object.assign(
          new Error(
            "Un accès Pro actif est nécessaire pour utiliser cet outil.",
          ),
          { status: 403 },
        );
      if ((daily.data()?.count || 0) >= 150)
        throw Object.assign(
          new Error("Votre limite quotidienne est atteinte. Reprenez demain."),
          { status: 429 },
        );
      tx.set(usage, {
        count: (daily.data()?.count || 0) + 1,
        updatedAt: new Date().toISOString(),
      });
    });
    if (!process.env.GROQ_API_KEY) throw new Error("Missing AI configuration");
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          ...data,
        }),
        signal: AbortSignal.timeout(25000),
      },
    );
    const result = await response.json();
    if (!response.ok) throw new Error("AI provider unavailable");
    const text = result.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty AI response");
    return res
      .status(200)
      .json({ content: [{ type: "text", text }], role: "assistant" });
  } catch (error) {
    return fail(res, error);
  }
}
