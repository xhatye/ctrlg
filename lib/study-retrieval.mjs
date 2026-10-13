import { MODULES } from './study-content.mjs';

const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const stop=new Set('les des une pour dans avec comment pourquoi quelle quelles quel quels est sont sur que qui aux ces vous nous plus moins peux peut faire explique expliquer exemple donne donner'.split(' '));
export function retrieveLessons(question, module) {
  const terms=[...new Set(normalize(String(question).slice(0,4000)).match(/[a-z0-9]+/g)||[])].filter(t=>t.length>2&&!stop.has(t));
  if(!terms.length)return {context:'',references:[]};
  const candidates=[];
  for(const [id,m] of Object.entries(MODULES)) {
    if(module&&id!==module)continue;
    for(const c of m.chapters)for(const n of c.notions) {
      const title=normalize(c.title+' '+n.title),text=normalize(n.body+' '+n.q);
      const score=terms.reduce((sum,t)=>sum+(title.includes(t)?4:0)+(text.includes(t)?1:0),0);
      if(score)candidates.push({score,id,c,n});
    }
  }
  candidates.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  const chosen=candidates.slice(0,3),references=[],seen=new Set();
  const context=chosen.map(({id,c,n},i)=>{
    const url=`/resume-cours?ue=${id}&chapter=${encodeURIComponent(c.id)}`;
    if(!seen.has(url)){seen.add(url);references.push({title:`${id} · ${c.title}`,url});}
    return `[${i+1}] ${id}, ${c.title}, ${n.title}. Références consultées le ${c.verifiedAt}.\n${n.body}\nSources externes : ${c.sources.map(([title,url])=>title+' : '+url).join('; ')}`;
  }).join('\n\n').slice(0,5000);
  return {context,references};
}
