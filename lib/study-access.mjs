import { hasPro } from "./ai-access.mjs";
import { FREE_MODULE, MODULES, studyModule } from "./study-content.mjs";
export async function readStudy(id, tool, authHeader, deps) {
  // Reject unknown modules/tools before any database access.
  if (
    !Object.hasOwn(MODULES, id) ||
    !["qcm", "cards", "summary", "case"].includes(tool)
  )
    throw Object.assign(new Error("Contenu introuvable."), { status: 404 });
  if (id !== FREE_MODULE) {
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
  return studyModule(id, tool);
}
