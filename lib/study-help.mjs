import {MODULES,selectedChapter,studyModule} from './study-content.mjs';
import {resolveReviewItem} from './review-engine.mjs';
import {chapterCaseCount} from './question-pool.mjs';
const invalid=()=>{throw Object.assign(new Error('Choisissez un exercice disponible pour cette aide.'),{status:400});};
export function studyHelp(body){
  if(!body||!['quiz-explain','quiz-card','lesson-coach','case-hint'].includes(body.purpose))invalid();
  let module,chapter,context,question;
  if(['quiz-explain','quiz-card'].includes(body.purpose)){
    const item=resolveReviewItem('quiz',body.itemId);
    if(typeof body.selected!=='string'||!item.options.includes(body.selected))invalid();
    module=item.module;chapter=item.chapter;
    context=JSON.stringify({chapter:item.title,question:item.q,studentChoice:body.selected,correctAnswer:item.a,explanation:item.explanation,alternativeExplanation:item.optionFeedback?.[body.selected]||''});
    question=body.purpose==='quiz-card'?'Crée une seule flashcard de rappel actif fondée sur cette correction. Réponds uniquement en JSON {"front":"question autonome sans choix A/B/C/D, 400 caractères maximum","back":"réponse claire avec sa condition essentielle, 1500 caractères maximum"}. Une seule notion, aucune formule vague ni référence au titre du cours. Conserve les hypothèses nécessaires. Aucun fait, montant ou seuil nouveau.':'Explique cette correction en t’adressant directement à l’étudiant avec « vous ». Identifie la confusion précise dans sa réponse, donne une illustration qualitative courte puis une action concrète pour vérifier sa compréhension. Si sa réponse est juste, approfondis la distinction. Ne crée ni nouvelle règle ni nouveaux chiffres.';
  }else if(body.purpose==='lesson-coach'){
    if(typeof body.module!=='string'||!Object.hasOwn(MODULES,body.module)||typeof body.chapter!=='string')invalid();
    const c=selectedChapter(body.module,body.chapter);
    const prompts={simple:'Explique les notions de ce chapitre en langage simple, en deux courts paragraphes. Préserve les conditions et les limites.',summary:'Résume le chapitre en cinq points brefs, sans numérotation ni perte des conditions essentielles.',example:'Reprends un exemple du support et explique son raisonnement étape par étape. Si le support ne contient pas d’exemple adapté, donne une illustration qualitative sans nouveau chiffre.'};
    if(!c||!Object.hasOwn(prompts,body.action))invalid();
    module=body.module;chapter=c.id;question=prompts[body.action];
    context=JSON.stringify({chapter:c.title,intro:c.intro,method:c.method,notions:c.notions.map(n=>({title:n.title,explanation:n.body,question:n.q,answer:n.correct})),pitfalls:c.pitfalls}).slice(0,14000);
  }else{
    if(typeof body.module!=='string'||!Object.hasOwn(MODULES,body.module)||typeof body.chapter!=='string')invalid();
    const c=selectedChapter(body.module,body.chapter);
    if(!c||!Number.isInteger(body.variant)||body.variant<0||body.variant>=chapterCaseCount(c))invalid();
    const cas=studyModule(body.module,'case',Math.random,{chapter:c.id,variant:body.variant});
    module=body.module;chapter=c.id;
    // No expected answers or financial results are exposed to the hint prompt.
    context=JSON.stringify({chapter:c.title,title:cas.titre,context:cas.contexte,questions:cas.questions.map(q=>q.enonce)});
    question='Donne seulement un indice de méthode en deux phrases, sans résoudre le cas, annoncer les résultats ou donner les écritures attendues. Ne répète aucun nombre, même ceux de l’énoncé. Aide à repérer les données utiles et la première étape.';
  }
  return {module,chapter,purpose:body.purpose,question,context:'[1] Support SIMDCG du chapitre ouvert.\n'+context,
    fallback:'Repérez d’abord les données utiles à la première question, puis écrivez la méthode que vous comptez appliquer. Comparez cette méthode aux notions de la fiche du chapitre avant de calculer ou de conclure.',
    references:[{title:module+' · '+MODULES[module].chapters.find(c=>c.id===chapter).title,url:'/resume-cours?ue='+module+'&chapter='+encodeURIComponent(chapter)}]};
}
