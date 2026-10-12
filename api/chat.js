import { firebaseServices, authenticated, fail } from "../lib/admin.mjs";
import { validateChat } from "../lib/ai-access.mjs";
import { reserveTutor, AI_MODEL } from "../lib/ai-budget.mjs";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const deps = firebaseServices(),
      user = await authenticated(req, deps.auth);
    const data = validateChat(
      typeof req.body === "string" ? JSON.parse(req.body) : req.body,
    );
    if (!process.env.GROQ_API_KEY)
      throw Object.assign(
        new Error(
          "Le tuteur est indisponible. Les fiches et exercices restent accessibles.",
        ),
        { status: 503 },
      );
    data.messages.unshift({
      role: "system",
      content:
        "Vous êtes un tuteur DCG/DSCG. Répondez en français, de façon concise. Distinguez faits, hypothèses et règles à vérifier pour la session. Ne prétendez jamais donner une correction officielle. Pour une question hors révisions, invitez à revenir aux études.",
    });
    const remaining = await reserveTutor(deps.db, user.uid, data);
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          temperature: 0.5,
          messages: data.messages,
          max_completion_tokens: data.max_tokens,
          reasoning_effort: "low",
          include_reasoning: false,
        }),
        signal: AbortSignal.timeout(25000),
      },
    );
    if (!response.ok) {
      console.error("SIMDCG tutor provider", response.status);
      throw Object.assign(
        new Error(
          response.status === 429
            ? "Le tuteur est occupé. Réessayez plus tard ; vos révisions restent accessibles."
            : "Le tuteur est indisponible. Continuez avec les fiches et exercices.",
        ),
        { status: 503 },
      );
    }
    const result = await response.json();
    const text = result.choices?.[0]?.message?.content;
    if (!text)
      throw Object.assign(
        new Error(
          "Le tuteur n’a pas pu terminer sa réponse. Essayez une question plus courte.",
        ),
        { status: 503 },
      );
    return res
      .status(200)
      .json({
        content: [{ type: "text", text }],
        role: "assistant",
        ...remaining,
      });
  } catch (error) {
    if (error instanceof SyntaxError)
      error = Object.assign(new Error("Requête invalide."), { status: 400 });
    if (error.name === "TimeoutError")
      error = Object.assign(
        new Error(
          "Le tuteur met trop de temps à répondre. Vos révisions restent accessibles.",
        ),
        { status: 503 },
      );
    return fail(res, error);
  }
}
