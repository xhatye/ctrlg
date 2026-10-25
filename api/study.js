import { firebaseServices, authenticated, fail } from "../lib/admin.mjs";
import { MODULES, selectedChapter } from "../lib/study-content.mjs";
import { readStudy } from "../lib/study-access.mjs";
import { chapterCaseCount } from '../lib/question-pool.mjs';
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const url = new URL(req.url, "https://simdcg.com");
    const id = url.searchParams.get("ue"),
      tool = url.searchParams.get("tool") || "summary";
    if(!Object.hasOwn(MODULES,id)||!['summary','qcm','cards','case','catalog','reading','sheet','cloze','visuals'].includes(tool))throw Object.assign(new Error('Contenu introuvable.'),{status:404});
    const settings={chapter:url.searchParams.get('chapter') || undefined,count:url.searchParams.has('count')?Number(url.searchParams.get('count')):undefined,variant:url.searchParams.has('variant')?Number(url.searchParams.get('variant')):undefined,focus:url.searchParams.get('focus') || 'all'};
    if(!['all','knowledge','application'].includes(settings.focus))throw Object.assign(new Error('Type de série invalide.'),{status:400});
    if(url.searchParams.has('chapters'))settings.chapters=url.searchParams.get('chapters').split(',');
    if(url.searchParams.has('diagnostic')){if(tool!=='qcm'||settings.count!==10||settings.focus!=='knowledge'||url.searchParams.get('diagnostic')!=='1')throw Object.assign(new Error('Diagnostic invalide.'),{status:400});settings.diagnostic=true;}
    const chapter=selectedChapter(id,settings.chapter) || MODULES[id].chapters[0];
    if(['qcm','cards'].includes(tool)&&settings.count!==undefined&&(!Number.isInteger(settings.count)||settings.count<1||settings.count>(tool==='cards'?100:20)))throw Object.assign(new Error('Taille de série invalide.'),{status:400});
    if(tool==='case'&&settings.variant!==undefined&&(!Number.isInteger(settings.variant)||settings.variant<0||settings.variant>=chapterCaseCount(chapter)))throw Object.assign(new Error('Variante de cas introuvable.'),{status:404});
    if(tool!=='catalog'&&!req.headers.authorization?.match(/^Bearer (.+)$/))throw Object.assign(new Error('Connexion requise.'),{status:401});
    const deps =
      tool === 'catalog'
        ? {}
        : { ...firebaseServices(), authenticate: authenticated };
    return res
      .status(200)
      .json(await readStudy(id, tool, req.headers.authorization, deps, settings));
  } catch (error) {
    return fail(res, error);
  }
}
