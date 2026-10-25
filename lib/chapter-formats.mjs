import {COURSE_SUPPLEMENTS} from './course-supplements.mjs';
// Server-side semantic reading formats. Existing chapter/quiz/card IDs stay unchanged.
export const FORMATS_VERSION='2026-10-19';
export const normalizeRecall=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,' ').replace(/[-–−]/g,' ').replace(/\s+/g,' ').trim().replace(/[.!?;:]$/,'').trim();
export function chapterCloze(c){
 return c.cloze || c.notions.flatMap((n,i)=>n.calculation?[{
  id:'recall-'+i,before:c.cas.contexte+'\n\n'+n.q+'\nRéponse : ',after:n.calculation.unit || '',
  fields:[{type:'number',expected:n.calculation.result,tolerance:.005001,unit:n.calculation.unit || ''}],explanation:n.body,
 }]:[]);
}
export function readingWordCount(module,c){
 const r=readingFormats(module,c),text=value=>typeof value==='string'?value:Array.isArray(value)?value.map(text).join(' '):value&&typeof value==='object'?Object.values(value).map(text).join(' '):'';
 return text([r.intro,r.method,r.sections.map(s=>[s.title,s.blocks.map(b=>b.type==='table'?[b.caption,b.headers,b.rows]:b.type==='chart'?[b.caption,b.xLabel,b.yLabel,b.notes]:b.type==='list'?b.items:[b.title,b.text,b.caption])]),r.comparison,r.application]).trim().split(/\s+/).filter(Boolean).length;
}
export function checkCloze(item,answers){
 if(!Array.isArray(answers)||answers.length!==item.fields.length||answers.some(v=>typeof v!=='string'||v.length>300))throw Object.assign(Error('Complétez chaque réponse avec un texte de moins de 300 caractères.'),{status:400});
 const fields=item.fields.map((f,i)=>{
  let correct=false;
  if(f.type==='number'){
   const raw=answers[i].trim().replace(/[\s\u00a0\u202f]/g,'').replace('−','-').replace(',','.');
   correct=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)&&Math.abs(Number(raw)-f.expected)<=(f.tolerance??.005);
  }else correct=f.accepted.some(a=>normalizeRecall(a)===normalizeRecall(answers[i]));
  return {correct,expected:f.type==='number'?String(f.expected).replace('.',','):f.accepted[0],unit:f.unit || ''};
 });
 return {correct:fields.every(f=>f.correct),fields,explanation:item.explanation};
}
export function publicCloze(module,c){return {module,chapter:c.id,title:c.title,items:chapterCloze(c).map(x=>({id:`${module}:${c.id}:cloze:${x.id}`,before:x.before,after:x.after,between:x.between || [],fields:x.fields.map(f=>({type:f.type,unit:f.unit || ''}))})),sources:c.sources};}
export function readingFormats(module,c){
 const concepts=c.notions.map((n,i)=>({id:'notion-'+i,title:n.title,paragraphs:n.body.split('\n\n'),answer:n.correct,question:n.q}));
 const supplement=COURSE_SUPPLEMENTS[module+'/'+c.id];
 const authored=supplement?{...c.editorial,sections:[...(c.editorial?.sections||c.notions.map((n,i)=>({id:'base-'+i,title:n.title,blocks:[{type:'paragraph',text:n.body}]}))),...supplement.sections]}:c.editorial;
 return {
  version:FORMATS_VERSION,module,chapter:c.id,title:c.title,intro:supplement?.intro||c.intro,method:supplement?.method||c.method,learningGoals:supplement?.goals||[],
  sections:authored?.sections || [
   ...(c.sections || concepts.map(n=>({title:n.title,paragraphs:n.paragraphs}))).filter(s=>!s.title.startsWith('Atelier commenté :')).map((s,i)=>({id:'part-'+i,title:s.title,blocks:[...s.paragraphs.filter(p=>!p.startsWith('Vérification de la compréhension :')).map(text=>({type:'paragraph',text})),...(s.example?[{type:'callout',kind:'example',title:'Application numérique',text:s.example.context},...s.example.analysis.map(text=>({type:'paragraph',text}))]:[])]})),
   ...(c.workshop?c.workshop.sections.map((s,i)=>({id:'workshop-'+i,title:s.title,blocks:s.paragraphs.map(text=>({type:'paragraph',text}))})):[]),
  ],
  // The reference dossier is a worked application, not another artificial chapter.
  application:{title:c.cas.titre,context:c.cas.contexte,steps:c.cas.questions.map(q=>({question:q.enonce,answer:q.answer}))},
  comparison:authored?.comparison || {caption:'Les repères du chapitre',headers:['Notion','Explication','Question de contrôle'],rows:concepts.map(n=>[n.title,n.paragraphs.join(' '),n.question])},
  sheet:authored?.sheet || {title:'Fiche de révision · '+c.title,essentials:concepts.map(n=>({label:n.title,text:n.paragraphs.join(' ')})),method:[c.method],pitfalls:c.pitfalls,example:{context:c.cas.contexte,steps:c.cas.questions.map(q=>({question:q.enonce,answer:q.answer}))}},
  clozeCount:chapterCloze(c).length,
 };
}
