import {deepenNumeric} from './depth-numeric.mjs';
import {SUBJECT_METHODS} from './depth-methods.mjs';
const unique=items=>[...new Set(items)];
function choices(correct,otherAnswers,fallback){
 const distractors=unique([...otherAnswers,...fallback]).filter(s=>s!==correct).slice(0,3);
 if(distractors.length!==3)throw new Error('Three distinct distractors required');
 return [correct,...distractors];
}
export function deepenChapter(module,c){
 if(c.variantAt)return deepenNumeric(c);
 const approach=SUBJECT_METHODS[module];if(!approach)throw new Error('Missing subject method '+module);
 const cas=c.cas;
 // Preserve the original rules and canonical case; supplements teach how to use them.
 c.sections=c.notions.map((n,i)=>({title:n.title,paragraphs:[...n.body.split('\n\n'),
  'Vérification de la compréhension : '+n.q+' La réponse attendue est : « '+n.correct+' » Cette réponse doit être replacée dans la situation précise de la question. Pour une autre situation, reprenez les faits et les conditions exposées dans le cours avant de généraliser.']}));
 c.sections.push({title:'Construire le raisonnement dans cette matière',paragraphs:[...approach,'Pour ce chapitre, le raisonnement attendu suit cette démarche : '+c.method]});
 c.sections.push({title:'Atelier commenté : '+cas.titre,paragraphs:[cas.contexte,...cas.questions.map(q=>q.enonce+'\n\n'+q.answer),
  'Reprise autonome : cachez les réponses et reconstruisez la solution à partir des seuls éléments du dossier. Pour chaque étape, rattachez votre conclusion à un fait, une relation ou une condition du cours. Comparez ensuite les éléments présents et manquants avec le corrigé. Une comparaison est une activité de révision ; elle ne constitue pas une note officielle.']});
 c.methodSteps=['Délimiter la question : '+c.intro,c.method,...cas.questions.map(q=>'Dans le dossier : '+q.enonce),'Vérifier les limites : '+c.pitfalls.join(' ')];
 c.glossary=c.notions.map(n=>({term:n.title,definition:n.body}));
 c.checklist=[...c.pitfalls,'Relier chaque conclusion aux faits du dossier et à la notion concernée.','Reprendre sans le corrigé les étapes qui ont demandé une aide.'];
 // Distinct tasks: understanding a rule, identifying a concept, and applying the case.
 const identification=c.notions.map(n=>({title:n.title,q:'Dans « '+c.title+' », quel repère correspond à cette explication ?\n'+n.body,
  correct:n.title,wrong:c.notions.filter(other=>other!==n).slice(0,3).map(other=>other.title),body:n.title+' : '+n.body,application:false}));
 const caseQuiz=cas.questions.map(q=>{const options=choices(q.answer,cas.questions.filter(other=>other!==q).map(other=>other.answer),['Conclure sans utiliser les faits ni les règles du dossier.','Remplacer les éléments manquants par des faits inventés.','Choisir une réponse sans examiner la question.']);return {title:cas.titre,q:cas.contexte+'\n'+q.enonce,correct:q.answer,wrong:options.slice(1),body:q.answer+'\nMéthode : '+c.method,application:false};});
 c.quiz=[...c.notions,...identification,...caseQuiz];
 c.cards=[...c.notions.map(n=>({q:'Repère à expliquer : '+n.title+' ('+c.title+')',a:n.body,tag:c.title})),
 ...cas.questions.map(q=>({q:'Dossier « '+cas.titre+' » : '+cas.contexte+'\n'+q.enonce,a:q.answer,tag:c.title})),
 {q:'Comment organiser le raisonnement dans « '+c.title+' » ?',a:c.method,tag:c.title},
 {q:'Quelles confusions éviter dans « '+c.title+' » ?',a:c.pitfalls.join('\n'),tag:c.title}];
 const rotate=(options,offset)=>{const answer=offset%options.length;return {options:[...options.slice(options.length-answer),...options.slice(0,options.length-answer)],answer};};
 const guided={...cas,questions:cas.questions.map(q=>({...q,guide:{type:'choice',...rotate(choices(q.answer,cas.questions.filter(other=>other!==q).map(other=>other.answer),['Conclure sans analyser les informations données.','Inventer un fait pour obtenir la conclusion souhaitée.','Répondre sans distinguer les notions du chapitre.']),q.num+c.id.length)}}))};
 const remediation={titre:cas.titre+' : atelier de révision',contexte:'Reprise du même dossier pour vérifier les repères du raisonnement.\n'+cas.contexte,duree_estimee:'10 à 20 min',difficulte:'Consolidation',questions:c.notions.map((n,i)=>({num:i+1,enonce:n.q,answer:n.correct+' '+n.body,guide:{type:'choice',...rotate([n.correct,...n.wrong],i+c.id.length)}}))};
 c.cases=[guided,remediation];
 c.modelCount=1;
 return c;
}
