const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ue\s*(\d+)/g,'ue$1').replace(/[^a-z0-9]+/g,' ').trim();
export function searchCatalogue(catalogue,query,limit=30){
 const terms=normalize(query).split(' ').filter(Boolean);if(!terms.length)return [];
 const results=[];
 for(const [id,module] of Object.entries(catalogue.modules)){
  const level=id.startsWith('DSCG')?'DSCG':'DCG',code='UE'+id.replace(/\D/g,''),subject=`${level} ${code} ${module.title}`;
  const add=(kind,title,chapter,keywords=[])=>{
   const primary=normalize(subject+' '+title),all=normalize(primary+' '+keywords.join(' '));
   if(!terms.every(term=>term==='dcg'||term==='dscg'?term===level.toLowerCase():/^ue\d+$/.test(term)?term===code.toLowerCase():all.includes(term)))return;
   const score=terms.reduce((s,t)=>s+(normalize(title).includes(t)?8:primary.includes(t)?3:1),0)+(kind==='subject'&&terms.some(t=>/^ue\d+$/.test(t))?8:0);
   results.push({id:id+(chapter?'/'+chapter:''),module:id,chapter,kind,title,subject:level+' '+code,score});
  };
  add('subject',module.title);
  for(const c of module.chapters)add('chapter',c.title,c.id,c.searchTerms || []);
 }
 return results.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,limit);
}
