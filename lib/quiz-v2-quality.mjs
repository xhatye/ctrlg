import {createHash} from 'node:crypto';
export const questionDigest=q=>createHash('sha256').update(JSON.stringify(q)).digest('hex');
export const questionKey=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export const choiceKey=s=>(s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[−–]/g,'-').replace(/[’]/g,"'").replace(/(?<=\d)[\s\u00a0\u202f]+(?=\d)/g,'').replace(/(?<=\d),(?=\d)/g,'.').match(/[-+]?\d+(?:\.\d+)?|[\p{L}_][\p{L}\p{N}_]*|!=|<>|<=|>=|[-+*/<>=()%$'"]/gu)||[]).join(' ');
const fail=message=>{throw new Error(message);};
const text=(s,min,max)=>typeof s==='string'&&s.trim().length>=min&&s.length<=max;
const badQuestion=/quel repère correspond|quel raisonnement correspond|quel commentaire du cours|contrôle du repère|relier deux notions|quelle association respecte|dans (ce|cet|cette) (chapitre|cours|leçon)|selon le (cours|texte ci-dessus)|comme indiqué (plus haut|précédemment)|dans le même cas|question précédente|previous question|same case as|texte ci-dessus/i;
const badOption=/toutes les réponses|aucune des réponses|couleur|logo|au hasard|faits inventés|inventer une|police de caractères|marque des téléphones|fabricant du téléphone|cartes de visite|nombre d’abonnés|nationalité du fabricant|marketing slogan/i;
export function evaluateCalculation(node,depth=0){
 if(depth>12||!node||typeof node!=='object')fail('Invalid calculation');
 if(Object.keys(node).length===1&&Number.isFinite(node.value))return node.value;
 if(!['+','-','*','/','pow','min','max'].includes(node.op)||!Array.isArray(node.args)||node.args.length!==2)fail('Invalid calculation operator');
 const [a,b]=node.args.map(x=>evaluateCalculation(x,depth+1));
 const v=node.op==='+'?a+b:node.op==='-'?a-b:node.op==='*'?a*b:node.op==='/'?a/b:node.op==='pow'?a**b:node.op==='min'?Math.min(a,b):Math.max(a,b);
 if(!Number.isFinite(v))fail('Non-finite calculation');return v;
}
export function validateQuestion(q,job){
 if(!q||typeof q!=='object'||Array.isArray(q))fail('Invalid question record');
 if(!/^q\d{2}$/.test(q.id)||Number(q.id.slice(1))<1||Number(q.id.slice(1))>job.target)fail('Invalid question ID');
 if(!['knowledge','scenario','calculation','diagnosis'].includes(q.kind))fail('Invalid question kind');
 if(!['foundation','standard','advanced'].includes(q.difficulty))fail('Invalid difficulty');
 if(!Number.isInteger(q.basis)||q.basis<0||q.basis>=job.concepts)fail('Missing source concept');
 if(!text(q.q,20,850)||badQuestion.test(q.q))fail('Question is not autonomous');
 if(!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!text(x,1,280)||badOption.test(x))||new Set(q.options.map(choiceKey)).size!==4)fail('Four distinct, meaningful choices required');
 if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)fail('Invalid correct option');
 if(!text(q.explanation,60,800))fail('Explained correction required');
 if(q.references!==undefined){
  if(!Array.isArray(q.references)||!q.references.length||q.references.length>10)fail('Invalid additional sources');
  for(const ref of q.references){let url;try{url=new URL(ref.url);}catch{fail('Invalid source URL');}if(!text(ref.title,3,200)||url.protocol!=='https:'||url.username||url.password)fail('Invalid additional source');}
 }
 if(q.optionExplanations!==undefined&&(!Array.isArray(q.optionExplanations)||q.optionExplanations.length!==4||q.optionExplanations.some(s=>!text(s,15,500))))fail('Invalid option explanations');
 if(q.kind==='calculation'){
  if(!q.calculation||!Number.isInteger(q.calculation.digits)||q.calculation.digits<0||q.calculation.digits>4)fail('Independently checkable calculation required');
  const expected=Number(evaluateCalculation(q.calculation.expression).toFixed(q.calculation.digits));
  if(!Number.isFinite(q.calculation.expected)||Math.abs(expected-q.calculation.expected)>1e-8)fail('Incorrect calculation');
  const raw=q.options[q.answer].replace(/[\s\u00a0\u202f]/g,'').replace('−','-').replace(',','.');
  const number=raw.match(/[-+]?\d+(?:\.\d+)?/);
  if(!number||Math.abs(Number(number[0])-expected)>1e-8)fail('Correct choice differs from independent calculation');
 }
 return q;
}
export function validateChapterBank(data,job,{complete=true}={}){
 if(!data||data.module!==job.module||data.chapter!==job.chapter||data.sourceHash!==job.sourceHash)fail('Chapter or source version mismatch');
 if(!text(data.authoredBy,3,150))fail('Author identity required');
 if(!Array.isArray(data.questions)||!data.questions.length||complete&&data.questions.length!==job.target)fail('Question count does not match editorial allocation');
 const ids=new Set(),questions=new Set(),skeletons=new Set(),basis=new Set();
 for(const q of data.questions){validateQuestion(q,job);const key=questionKey(q.q),skeleton=key.replace(/\d+(?: \d+)*/g,'#');if(ids.has(q.id)||questions.has(key)||skeletons.has(skeleton))fail('Repeated question or numerical permutation');ids.add(q.id);questions.add(key);skeletons.add(skeleton);basis.add(q.basis);}
 if(complete){if(basis.size!==job.concepts)fail('All chapter concepts must be covered');const application=data.questions.filter(q=>q.kind!=='knowledge').length;if(application<Math.ceil(job.target/2))fail('At least half of questions must test application or reasoning');}
 return data;
}
export function validateBlindReview(data,bank,job){
 if(data.sourceHash!==job.sourceHash||!text(data.reviewer,3,150)||!Array.isArray(data.answers)||data.answers.length!==bank.questions.length)fail('Complete blind review required');
 if(data.reviewer===bank.authoredBy)fail('Review must be independent from author');
 const rows=new Map(data.answers.map(x=>[x.id,x]));if(rows.size!==bank.questions.length)fail('Repeated review ID');
 for(const q of bank.questions){const r=rows.get(q.id);if(!r||r.digest!==questionDigest(q)||r.selected!==q.answer||r.unambiguous!==true||r.supported!==true||r.distractorsPlausible!==true||r.independentObjective!==true||r.explanationSound!==true||!text(r.reason,20,500))fail('Unresolved review issue: '+q.id);if(r.selectedText!==undefined&&r.selectedText!==q.options[q.answer])fail('Review text/index mismatch: '+q.id);}
 return data;
}
export function assembleReviewedBank(plan,banks,reviews){
 if(plan.target!==5000||plan.subjects!==20||plan.chapters!==225||plan.jobs.length!==225||plan.jobs.reduce((n,j)=>n+j.target,0)!==5000)fail('Complete 5000-question editorial allocation required');
 const output={},questions=new Map(),skeletons=new Map(),proof=[];let total=0;
 for(const job of plan.jobs){
  const bank=banks[job.key],review=reviews[job.key];if(!bank||!review)fail('Missing reviewed chapter: '+job.key);
  validateChapterBank(bank,job);validateBlindReview(review,bank,job);
  for(const q of bank.questions){const key=questionKey(q.q),skeleton=key.replace(/\d+(?: \d+)*/g,'#'),id=job.key+'/'+q.id;if(questions.has(key))fail('Question repeated across chapters: '+questions.get(key)+' and '+id);if(skeletons.has(skeleton))fail('Numerical permutation across chapters: '+skeletons.get(skeleton)+' and '+id);questions.set(key,id);skeletons.set(skeleton,id);}
  output[job.module+'/'+job.chapter]=bank.questions;
  proof.push({key:job.key,sourceHash:job.sourceHash,author:bank.authoredBy,reviewer:review.reviewer,digest:createHash('sha256').update(JSON.stringify(bank.questions)).digest('hex')});total+=bank.questions.length;
 }
 if(total!==5000)fail('Exactly 5000 reviewed questions required');
 return {version:plan.version,total,proof,banks:output};
}
