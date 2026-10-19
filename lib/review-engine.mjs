import {chapterCloze,checkCloze} from './chapter-formats.mjs';
import {MODULES} from './study-content.mjs';
const bad=()=>{throw Object.assign(new Error('Révision invalide.'),{status:400});};
export function resolveReviewItem(kind,id){
  if(!['quiz','card','cloze'].includes(kind)||typeof id!=='string'||id.length>150)bad();
  const parts=id.split(':'),module=parts.shift(),chapter=parts.shift();
  const m=Object.hasOwn(MODULES,module)?MODULES[module]:null,c=m?.chapters.find(c=>c.id===chapter);if(!c)bad();
  if(kind==='cloze'){
    if(parts.length!==2||parts[0]!=='cloze')bad();
    const item=chapterCloze(c).find(x=>x.id===parts[1]);if(!item)bad();
    return {id,kind,module,chapter,title:c.title,q:item.before+' […] '+item.after,a:item.fields.map(f=>f.type==='number'?String(f.expected):f.accepted[0]).join(' ; '),explanation:item.explanation,cloze:item};
  }
  let n;
  if(parts.length===1&&/^card(?:0|[1-9]\d*)$/.test(parts[0])&&kind==='card'){
    const index=Number(parts[0].slice(4));n=c.cards?.[index];if(!n)bad();
    return {id,kind,module,chapter,title:c.title,q:n.q,a:n.a,tag:c.title,...(n.example?{example:n.example,pitfall:n.pitfall}:{})};
  }
  if(parts.length===1&&/^n(?:0|[1-9]\d*)$/.test(parts[0]))n=(c.quiz || c.notions)[Number(parts[0].slice(1))];
  if(parts.length===2&&/^v(?:0|[1-9]\d*)$/.test(parts[0])&&/^[0-3]$/.test(parts[1])&&c.variantAt){const v=Number(parts[0].slice(1));if(v>=0&&v<c.caseCount)n=c.variantAt(v).notions[Number(parts[1])];}
  if(!n)bad();
  return {id,kind,module,chapter,title:c.title,q:n.q,a:n.correct,explanation:n.body,...(kind==='quiz'?{options:[n.correct,...n.wrong],...(n.wrongReasons?{optionFeedback:Object.fromEntries(n.wrong.map((o,i)=>[o,n.wrongReasons[i]]))}:{})}:{})};
}
export function normalizeReviewEvents(events){
  if(!Array.isArray(events)||!events.length||events.length>100)bad();
  const seen=new Set();
  return events.map(e=>{
    if(!e||typeof e.receipt!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(e.receipt)||seen.has(e.receipt))bad();seen.add(e.receipt);
    const item=resolveReviewItem(e.kind,e.itemId);
    if(e.kind==='quiz'&&(typeof e.selected!=='string'||!item.options.includes(e.selected)))bad();
    if(e.kind==='card'&&typeof e.known!=='boolean')bad();
    const cloze=e.kind==='cloze'?checkCloze(item.cloze,e.answers):null;
    return {receipt:e.receipt,kind:e.kind,itemId:e.itemId,correct:e.kind==='quiz'?e.selected===item.a:e.kind==='cloze'?cloze.correct:e.known,...(e.kind==='cloze'?{answers:e.answers}:{}),...(e.kind==='quiz'?{selected:e.selected}:{})};
  });
}
export function scheduleReview(old={},correct,now){
  // Calendar intervals are fixed; correctness is server-checked for quizzes, declared for cards.
  const streak=correct?Math.min((old.streak || 0)+1,6):0;
  const days=correct?[0,1,3,7,14,30,60][streak]:1;
  return {...old,streak,attempts:(old.attempts || 0)+1,mistakes:(old.mistakes || 0)+(correct?0:1),lastCorrect:correct,lastReviewedAt:new Date(now).toISOString(),dueAt:new Date(now+days*86400000).toISOString()};
}
