import { hasPro } from "./ai-access.mjs";
import { MODULES, studyModule, selectedChapter } from "./study-content.mjs";
export async function readStudy(id, tool, authHeader, deps, settings = {}) {
  // Reject unknown modules/tools before any database access.
  if (
    !Object.hasOwn(MODULES, id) ||
    !["qcm", "cards", "summary", "case", "catalog", "reading", "sheet", "cloze", "visuals"].includes(tool)
  )
    throw Object.assign(new Error("Contenu introuvable."), { status: 404 });
  selectedChapter(id,settings.chapter);
  if (tool !== 'catalog') {
    const user = await deps.authenticate(
      { headers: { authorization: authHeader } },
      deps.auth,
    );
    const profile = await deps.db.collection("users").doc(user.uid).get();
    if (!hasPro(profile.data()))
      throw Object.assign(
        new Error("Un accès Pro actif est nécessaire pour cette matière."),
        { status: 403 },
      );
  }
  return studyModule(id, tool, Math.random, settings);
}
