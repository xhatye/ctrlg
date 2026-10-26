import {MODULES,selectedChapter,studyModule} from './study-content.mjs';
import {resolveReviewItem} from './review-engine.mjs';
import {chapterCaseCount} from './question-pool.mjs';
const invalid=()=>{throw Object.assign(new Error('Choisissez un exercice disponible pour cette aide.'),{status:400});};
export function studyHelp(body){
  if(!body||!['quiz-explain','case-hint'].includes(body.purpose))invalid();
  let module,chapter,context,question;
  if(body.purpose==='quiz-explain'){
    const item=resolveReviewItem('quiz',body.itemId);
    if(typeof body.selected!=='string'||!item.options.includes(body.selected))invalid();
    module=item.module;chapter=item.chapter;
    context=JSON.stringify({chapter:item.title,question:item.q,studentChoice:body.selected,correctAnswer:item.a,explanation:item.explanation,alternativeExplanation:item.optionFeedback?.[body.selected]||''});
    question='Explique cette correction en quelques phrases. Relie la réponse de l’élève au raisonnement attendu, sans inventer de nouvelle règle ni de nouveaux chiffres. Si sa réponse est juste, explique pourquoi.';
  }else{
    if(typeof body.module!=='string'||!Object.hasOwn(MODULES,body.module)||typeof body.chapter!=='string')invalid();
    const c=selectedChapter(body.module,body.chapter);
    if(!c||!Number.isInteger(body.variant)||body.variant<0||body.variant>=chapterCaseCount(c))invalid();
    const cas=studyModule(body.module,'case',Math.random,{chapter:c.id,variant:body.variant});
    module=body.module;chapter=c.id;
    // No expected answers or financial results are exposed to the hint prompt.
    context=JSON.stringify({chapter:c.title,title:cas.titre,context:cas.contexte,questions:cas.questions.map(q=>q.enonce)});
    question='Donne seulement un indice de méthode en deux phrases, sans résoudre le cas, annoncer les résultats ou donner les écritures attendues. Aide à repérer les données utiles et la première étape.';
  }
  return {module,question,context:'[1] Support SIMDCG de l’exercice ouvert.\n'+context,references:[{title:module+' · '+MODULES[module].chapters.find(c=>c.id===chapter).title,url:'/resume-cours?ue='+module+'&chapter='+encodeURIComponent(chapter)}]};
}
