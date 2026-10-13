import {MODULES} from './study-content.mjs';
import {CURRICULUM} from './curriculum.mjs';
import {caseRubric} from './case-rubric.mjs';
const names=['Qualifier et résoudre','Croiser les documents','Vérifier et argumenter'];
const selected=(module,index)=>{const chapters=MODULES[module].chapters,start=[0,Math.max(0,Math.floor(chapters.length/2)-1),chapters.length-3][index];return chapters.slice(start,start+3);};
export const EXAM_CATALOGUE=CURRICULUM.flatMap(ue=>Array.from({length:3},(_,i)=>({id:ue.id+'-sujet-'+(i+1),module:ue.id,level:ue.level,title:names[i]+' : '+ue.label,topics:selected(ue.id,i).map(c=>c.title),durationMinutes:ue.level==='DCG'?90:120,points:20,dossiers:3,questions:12,origin:'Composition originale SIMDCG',coverage:'Trois dossiers ciblés. Ce sujet ne couvre pas tout le programme de l’UE.'})));
export function getExam(id,{correction=false}={}) {
  const meta=EXAM_CATALOGUE.find(e=>e.id===id);if(!meta)throw Object.assign(new Error('Sujet introuvable.'),{status:404});
  const chosen=selected(meta.module,Number(id.at(-1))-1);
  const dossiers=chosen.map((chapter,i)=>{
    const original=chapter.variantAt?chapter.variantAt(0):chapter.cas;
    const notions=chapter.variantAt?original.notions:chapter.notions;
    const questionFor=n=>n.q.startsWith(original.contexte)?n.q.slice(original.contexte.length).trim():n.q;
    const documents=[
      {id:'document-'+i+'-1',title:'Annexe '+(i*2+1)+' : '+original.titre,type:'Énoncé original',paragraphs:[original.contexte]},
      {id:'document-'+i+'-2',title:'Annexe '+(i*2+2)+' : note de travail à contrôler',type:'Affirmations à vérifier',paragraphs:["Un brouillon de travail propose les deux réponses suivantes. Elles ne sont pas validées. Votre mission consiste à les contrôler à partir des situations précisées dans chaque question et des notions du chapitre.",'Proposition A. Question étudiée : '+questionFor(notions[0])+' Réponse proposée : '+notions[0].wrong[0],'Proposition B. Question étudiée : '+questionFor(notions[1])+' Réponse proposée : '+notions[1].wrong[0]]}
    ];
    if(chapter.practiceSpec){const input=notions[0].calculation.inputs;documents[0].table={headers:['Donnée','Valeur','Unité'],rows:Object.entries(chapter.practiceSpec.inputs).map(([key,p])=>[p.label,new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(input[key]),p.unit || 'sans unité'])};}
    const weights=[1,2,2,i===0?1:2];
    const questions=original.questions.slice(0,3).map((q,j)=>{
      const item={id:'d'+(i+1)+'-q'+(j+1),chapter:chapter.id,enonce:q.enonce+' Présentez les éléments utiles, votre démarche et une conclusion justifiée. '+(chapter.variantAt?'Faites apparaître les calculs et leurs unités.':'Rattachez votre réponse aux faits précis de l’annexe.'),points:weights[j]};
      if(correction)Object.assign(item,{answer:q.answer,rubric:caseRubric(chapter,q,j,weights[j],notions)});
      return item;
    });
    const critique={id:'d'+(i+1)+'-q4',chapter:chapter.id,enonce:'Contrôlez séparément les propositions A et B de la note de travail. Rectifiez chaque affirmation et expliquez pourquoi la réponse proposée ne convient pas.',points:weights[3]};
    if(correction){critique.answer='A : '+notions[0].correct+' '+notions[0].body+'\n\nB : '+notions[1].correct+' '+notions[1].body;critique.rubric={points:weights[3],kind:'self-comparison',criteria:[{id:'criterion-0',label:'Rectifier A et justifier',expected:notions[0].correct+' '+notions[0].body,points:weights[3]/2},{id:'criterion-1',label:'Rectifier B et justifier',expected:notions[1].correct+' '+notions[1].body,points:weights[3]/2}],commonErrors:chapter.pitfalls,method:chapter.method};}
    return {id:'dossier-'+(i+1),title:'Dossier '+(i+1)+' : '+chapter.title,chapter:chapter.id,points:weights.reduce((a,b)=>a+b),documents,questions:[...questions,critique]};
  });
  return {...meta,instructions:[
    'Vous disposez de '+meta.durationMinutes+' minutes pour travailler les trois dossiers. Répartissez votre temps selon leur poids dans le barème. Toutes les réponses se rédigent dans les espaces prévus ; les documents restent consultables pendant la session.',
    'Lisez chaque annexe avant de répondre. Les notes de travail contiennent volontairement des erreurs à identifier. Ne traitez pas ces affirmations comme des informations validées. Les trois dossiers sont indépendants : ne mélangez pas leurs données ou hypothèses.',
    'Présentez une démarche lisible : éléments utiles, règle ou relation, application et conclusion. Pour les calculs, montrez les étapes, les unités et les arrondis. Pour une réponse argumentée, justifiez vos choix par les faits et distinguez les informations établies des hypothèses.',
    'Les corrections sont accessibles après remise de la copie ou expiration du temps. Le barème est un support de comparaison personnelle, sans note officielle ni validation indépendante par un enseignant. En mode entraînement libre, le temps est indicatif.',
    'Ces 60 compositions réorganisent des dossiers originaux de la bibliothèque. Certains dossiers figurent dans plusieurs sujets. Aucun sujet n’est présenté comme une annale officielle ou une reproduction d’un manuel.'
  ],dossiers,sources:[...new Map(chosen.flatMap(c=>c.sources).map(s=>[s[1],s])).values()]};
}
