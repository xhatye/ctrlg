import { firebaseServices, authenticated, fail } from "../lib/admin.mjs";
import { FREE_MODULE, MODULES, selectedChapter } from "../lib/study-content.mjs";
import { readStudy } from "../lib/study-access.mjs";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const url = new URL(req.url, "https://simdcg.com");
    const id = url.searchParams.get("ue"),
      tool = url.searchParams.get("tool") || "summary";
    if(!Object.hasOwn(MODULES,id)||!['summary','qcm','cards','case','catalog'].includes(tool))throw Object.assign(new Error('Contenu introuvable.'),{status:404});
    const settings={chapter:url.searchParams.get('chapter') || undefined,count:url.searchParams.has('count')?Number(url.searchParams.get('count')):undefined};
    selectedChapter(id,settings.chapter);
    if(tool==='qcm'&&settings.count!==undefined&&(!Number.isInteger(settings.count)||settings.count<1||settings.count>20))throw Object.assign(new Error('Taille de série invalide.'),{status:400});
    const deps =
      id === FREE_MODULE || tool === 'catalog' || !Object.hasOwn(MODULES,id)
        ? {}
        : { ...firebaseServices(), authenticate: authenticated };
    return res
      .status(200)
      .json(await readStudy(id, tool, req.headers.authorization, deps, settings));
  } catch (error) {
    return fail(res, error);
  }
}
