import { chapter, notion, SOURCES } from './content-authoring.mjs';

// Parameterised practice is labelled separately from original course chapters.
// No AI generation or provider request runs when a learner opens an exercise.
export const PRACTICE_VARIANTS = 25;
export const formatNumber = value => {
  if (!Number.isFinite(value)) throw new Error('Invalid practice calculation');
  return (Object.is(value,-0)?0:value).toLocaleString('fr-FR', {maximumFractionDigits:2,minimumFractionDigits:2}).replaceAll('\u202f',' ');
};
export const amount = (n,unit='€') => `${formatNumber(n)}${unit?' '+unit:''}`;
export const input = (label,base,step,unit='€') => ({label,base,step,unit});
export const task = (title,rule,calculate,unit='€') => ({title,rule,calculate,unit});

function buildVariant(spec,index) {
  const values=Object.fromEntries(Object.entries(spec.inputs).map(([key,p])=>[key,p.base+p.step*index]));
  const data=Object.entries(spec.inputs).map(([key,p])=>`${p.label} : ${amount(values[key],p.unit)}`).join(' ; ')+'.';
  const context=`${spec.context} ${data} ${spec.assumptions}`;
  const results=spec.tasks.map(t=>t.calculate(values));
  const notions=spec.tasks.map((t,i)=>{
    const correct=amount(results[i],t.unit);
    const delta=Math.max(1,Math.abs(results[i])*.15);
    const wrong=[results[i]+delta,results[i]-delta,results[i]+delta*2].map(n=>amount(n,t.unit));
    if(new Set([correct,...wrong]).size!==4)throw new Error('Ambiguous numeric choices');
    const body=`${t.rule} Avec les données de cette variante, le résultat est ${correct}. ${spec.interpretation} Arrondissez seulement le résultat final à deux décimales et conservez la même unité sur toute la ligne de calcul.`;
    return {...notion(t.title,body,`${context}\n${t.title} : quel résultat obtenez-vous (arrondi à deux décimales) ?`,correct,...wrong),application:true,variant:index,calculation:{family:spec.id,task:i,inputs:values,result:results[i],unit:t.unit}};
  });
  return {id:`variante-${index+1}`,titre:`${spec.title} · variante ${index+1}`,
    contexte:context,questions:spec.tasks.slice(0,3).map((t,i)=>({num:i+1,enonce:t.title+'. Détaillez votre calcul.',answer:`${t.rule} Données utilisées : ${data} Résultat : ${amount(results[i],t.unit)}. ${spec.interpretation}`})),
    duree_estimee:'15 à 25 min',difficulte:'Application',variant:index,notions};
}

export function buildPracticeChapters(specs) {
  const modules={};
  for(const spec of specs) {
    if(spec.tasks.length!==4)throw new Error('A practice family needs four distinct tasks');
    const cases=Array.from({length:PRACTICE_VARIANTS},(_,i)=>buildVariant(spec,i));
    const first=cases[0];
    const lessonNotions=spec.tasks.map((t,i)=>({...first.notions[i],body:`${t.rule} ${spec.interpretation} Dans l’exemple de départ : ${amount(t.calculate(first.notions[i].calculation.inputs),t.unit)}. Pour transposer la méthode à un autre dossier, identifiez d’abord les données utiles et les hypothèses, puis justifiez le signe du résultat. Une égalité numérique ne remplace pas son commentaire économique.`,application:false}));
    const c=chapter(spec.id,spec.title,spec.intro,spec.method,spec.pitfalls,lessonNotions,first.contexte,first.questions.map(q=>[q.enonce,q.answer]),spec.sources||[SOURCES.pcg]);
    c.cases=cases.map(({notions,...cas})=>cas);
    c.practice=cases.flatMap(cas=>cas.notions);
    c.practiceKind='Variantes chiffrées de quatre tâches, avec hypothèses explicites';
    c.lessonNotions=lessonNotions;
    (modules[spec.module] ||= []).push(c);
  }
  return modules;
}
