import { QUIZ_REPLACEMENTS, DISTRACTOR_REWRITES, WORKSHOP_REWRITES } from './quiz-rewrites.mjs';

// Stable legacy slots are retained for historical receipts. Only the explicitly
// selected indices enter new sessions, counts and the spaced-review queue.
// Never turn lesson headings or unrelated paragraphs into answer options.
export const QUIZ_REVISION = '2026-10-20';
const implicitContext = /\b(?:ce barème|le barème|ce seul barème|cet atelier|cette étude|ce dossier|dans cet|dans ce|dans le dossier|dans l’exemple|ici|ce cas|ce modèle|ces données|cette annuité|schéma donné|données limitées)\b/i;
const unrelated = /couleur|logo|police de caract|au hasard|nationalité|chez un voisin|richesse|adresse d.un concurrent|bénéfices des concurrents|pages du site|domicile|taille du fichier|météo|décoration|prénom|nom du dirigeant|nom du comptable|nombre de banques|nombre de salariés|prix du contrat d.une société tierce/i;
export function editQuiz(module, c) {
  const key = module+'/'+c.id;
  const originalLength = c.variantAt ? 8 : c.notions.length;
  const indices = [];
  const removed = {};
  const append = item => {
    const i = c.quiz.length;
    c.quiz.push({...item, editorialRevision:QUIZ_REVISION, application:false});
    indices.push(i);
  };
  for (let i=0; i<c.quiz.length; i++) {
    const n = c.quiz[i];
    if (i>=originalLength) { removed[i]='Assemblage automatique de repères ou de réponses de cas'; continue; }
    if (c.id==='dossier-synthese' || /Quel raisonnement correspond/.test(n.q)) { removed[i]='Association à un intitulé du cours'; continue; }
    if (key==='UE1/offre-acceptation') { removed[i]='Remplacée par une question autonome sur offre et acceptation'; continue; }
    if (DISTRACTOR_REWRITES[key+'#'+i]) { removed[i]='Choix sans rapport avec la notion, réécrits'; continue; }
    if (unrelated.test(n.wrong.join(' '))) { removed[i]='Choix hors sujet, en attente de réécriture'; continue; }
    if (!c.variantAt && implicitContext.test(n.q)) { removed[i]='Contexte implicite insuffisant dans une série mélangée'; continue; }
    indices.push(i);
  }
  // Workshop questions must travel with their data outside the workshop page.
  if (c.workshop) for (const [i,n] of c.workshop.quiz.entries()) {
    const oldIndex=c.quiz.findIndex(q=>q.q===n.q);
    removed[oldIndex]='Remplacée par la même question accompagnée de son dossier';
    append({...n,...WORKSHOP_REWRITES[module+'#'+i],title:c.workshop.title,q:c.workshop.context+'\n\n'+n.q});
  }
  for (const [slot,wrong] of Object.entries(DISTRACTOR_REWRITES)) {
    if (!slot.startsWith(key+'#') || key==='UE1/offre-acceptation') continue;
    const n=c.quiz[Number(slot.split('#')[1])];
    append({...n,wrong,wrongReasons:undefined});
  }
  for (const n of QUIZ_REPLACEMENTS[key] || []) append(n);
  c.quizIndices=indices;
  c.quizRetired=removed;
  c.quizRevision=QUIZ_REVISION;
  if (!indices.length) throw new Error('Chapter needs an authored quiz: '+key);
  return c;
}
