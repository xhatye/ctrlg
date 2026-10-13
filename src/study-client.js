import { auth } from "./firebase";
export async function loadStudy(id, tool, settings = {}) {
  if (
    import.meta.env.DEV &&
    new URLSearchParams(location.search).has("design")
  ) {
    const { studyModule } = await import("../lib/study-content.mjs");
    return studyModule(id, tool, Math.random, settings);
  }
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const response = await fetch(
    `/api/study?ue=${encodeURIComponent(id)}&tool=${encodeURIComponent(tool)}${settings.chapter?'&chapter='+encodeURIComponent(settings.chapter):''}${settings.count?'&count='+settings.count:''}${settings.variant!==undefined?'&variant='+encodeURIComponent(settings.variant):''}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.error || "Le contenu ne peut pas être chargé. Réessayez.",
    );
  return data;
}
