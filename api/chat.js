import { firebaseServices, authenticated, fail } from "../lib/admin.mjs";
import { validateChat } from "../lib/ai-access.mjs";
import { reserveTutor } from "../lib/ai-budget.mjs";
import { requestTutor } from '../lib/tutor-provider.mjs';
import { tutorInstructions, validateTutorReply } from '../lib/tutor-grounding.mjs';
import { retrieveLessons } from '../lib/study-retrieval.mjs';
import { MODULES } from '../lib/study-content.mjs';
import {studyHelp} from '../lib/study-help.mjs';
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const deps = firebaseServices(),
      user = await authenticated(req, deps.auth);
    const body=typeof req.body === 'string'?JSON.parse(req.body):req.body;
    const help=body?.purpose!==undefined?studyHelp(body):null;
    const data = validateChat(help?{messages:[{role:'user',content:help.question}],max_tokens:1200}:body);
    // The server owns tutoring instructions; client prose is not a system policy.
    data.messages=data.messages.filter(m=>m.role!=='system');
    const lastQuestion=[...data.messages].reverse().find(m=>m.role==='user')?.content || '';
    const retrieved=help?{context:help.context,references:help.references}:retrieveLessons(lastQuestion,typeof body.module==='string'?body.module:undefined);
    if (!process.env.GROQ_API_KEY)
      throw Object.assign(
        new Error(
          "Le tuteur est indisponible. Les fiches et exercices restent accessibles.",
        ),
        { status: 503 },
      );
    data.messages.unshift({
      role: "system",
      content:tutorInstructions(help?.module || (typeof body.module==='string'&&Object.hasOwn(MODULES,body.module)?body.module+' '+MODULES[body.module].title:'DCG et DSCG'),retrieved.context),
    });
    const remaining = await reserveTutor(deps.db, user.uid, data);
    const response = await requestTutor(data);
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
    const rawText = result.choices?.[0]?.message?.content;
    // The conversation uses escaped plain text; remove Markdown decoration.
    const text = typeof rawText==='string' ? rawText.replace(/\*\*([^*\n]+)\*\*/g,'$1').replace(/^\s*[*-]\s+/gm,'• ') : rawText;
    if (!text || result.choices?.[0]?.finish_reason === 'length')
      throw Object.assign(
        new Error(
          "Le tuteur n’a pas pu terminer sa réponse. Essayez une question plus courte.",
        ),
        { status: 503 },
      );
    validateTutorReply(text,retrieved.context+'\n'+lastQuestion);
    return res
      .status(200)
      .json({
        content: [{ type: "text", text }],
        role: "assistant",
        ...remaining,
        references:retrieved.references,
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
