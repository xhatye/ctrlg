import { chapter, notion, SOURCES } from './content-authoring.mjs';
import {PRACTICE_SALTS} from './practice-salts.mjs';

// Parameterised practice is labelled separately from original course chapters.
// No AI generation or provider request runs when a learner opens an exercise.
export const PRACTICE_VARIANTS = 2650;
const SAMPLE_VARIANTS=25;
const numberFormat=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2,minimumFractionDigits:2});
const inputFormat=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:6});
export const formatNumber = value => {
  if (!Number.isFinite(value)) throw new Error('Invalid practice calculation');
  return numberFormat.format(Object.is(value,-0)?0:value).replaceAll('\u202f',' ');
};
export const amount = (n,unit='€') => `${formatNumber(n)}${unit?' '+unit:''}`;
export const input = (label,base,step,unit='€') => ({label,base,step,unit});
export const task = (title,rule,calculate,unit='€') => ({title,rule,calculate,unit});

const integerUnit=new Set(['unités','titres','personnes','actions','factures','lignes/facture','commandes','réglages','jours-personnes']);
function valid(spec,d){
  switch(spec.id){
    case 'fifo-deux-lots':return d.out>d.q0&&d.out<d.q0+d.q1;
    case 'cmp-periodique':return d.out<d.q0+d.q1;
    case 'creance-douteuse':return d.ttc/(1+d.tax/100)*d.loss/100>d.old;
    case 'provision-evolution':return d.required>d.old&&d.settlement<d.old;
    case 'reintegration-amort':return d.amort>d.limit;
    case 'augmentation-capital':return d.price>d.nominal;
    case 'elimination-intragroupe':return d.price>d.cost;
    case 'ecart-acquisition-donne':return d.price>=(d.assets-d.debts)*d.share/100;
    case 'cout-variable-seuil':return d.sales>d.variable;
    case 'cout-cible':return d.estimated>=d.price*(1-d.margin/100);
    case 'capital-votes-clauses':return d.yes<=d.present&&d.present<=d.shares;
    case 'marche-travail-ratios':return d.employed+d.unemployed<=d.population;
    case 'tableau-bord-qualite':return d.defects>d.qty*d.target/100;
    default:return true;
  }
}
function parameters(spec,index,salt){
  if(index<SAMPLE_VARIANTS)return Object.fromEntries(Object.entries(spec.inputs).map(([key,p])=>[key,p.base+p.step*index]));
  const varying=Object.entries(spec.inputs).filter(([,p])=>p.step!==0);
  if(varying.length===1){
    const [key,p]=varying[0],d=Object.fromEntries(Object.entries(spec.inputs).map(([k,v])=>[k,v.base]));
    d[key]=p.unit==='€'?p.base+Math.floor(index/2)+.37+(index%2)*.5:Number((p.base+p.step*24*(index+1)/(PRACTICE_VARIANTS+1)).toFixed(6));
    return d;
  }
  for(let attempt=0;attempt<100;attempt++){
    let seed=2166136261;
    for(const char of [spec.id,index,attempt,...(salt?['salt',salt]:[])].join(':'))seed=Math.imul(seed^char.charCodeAt(0),16777619)>>>0;
    const d=Object.fromEntries(Object.entries(spec.inputs).map(([key,p])=>{
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      let v=p.base+p.step*24*(seed/4294967296);
      v=integerUnit.has(p.unit)?Math.round(v):Number(v.toFixed(2));
      return [key,v];
    }));
    if(spec.id==='sql-jointure-cardinalite')d.header=Number((spec.inputs.header.base+Math.floor(index/10)*.5+(index%10+1)*.01).toFixed(2));
    if(valid(spec,d))return d;
  }
  throw new Error('Could not create a valid practice dossier');
}
export function buildVariant(spec,index,saltOverride) {
  if(!Number.isInteger(index)||index<0||index>=PRACTICE_VARIANTS)throw Object.assign(new Error('Variante introuvable.'),{status:404});
  const values=parameters(spec,index,saltOverride ?? PRACTICE_SALTS[spec.id]?.[index] ?? 0);
  const data=Object.entries(spec.inputs).map(([key,p])=>`${p.label} : ${inputFormat.format(values[key]).replaceAll('\u202f',' ')}${p.unit?' '+p.unit:''}`).join(' ; ')+'.';
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
    const cases=Array.from({length:SAMPLE_VARIANTS},(_,i)=>buildVariant(spec,i));
    const first=cases[0];
    const lessonNotions=spec.tasks.map((t,i)=>({...first.notions[i],body:`${t.rule} ${spec.interpretation} Dans l’exemple de départ : ${amount(t.calculate(first.notions[i].calculation.inputs),t.unit)}. Pour transposer la méthode à un autre dossier, identifiez d’abord les données utiles et les hypothèses, puis justifiez le signe du résultat. Une égalité numérique ne remplace pas son commentaire économique.`,application:false}));
    const c=chapter(spec.id,spec.title,spec.intro,spec.method,spec.pitfalls,lessonNotions,first.contexte,first.questions.map(q=>[q.enonce,q.answer]),spec.sources||[SOURCES.pcg]);
    c.cases=cases.map(({notions,...cas})=>cas);
    c.practice=cases.flatMap(cas=>cas.notions);
    c.practiceSize=PRACTICE_VARIANTS*4;
    c.caseCount=PRACTICE_VARIANTS;
    c.variantAt=index=>buildVariant(spec,index);
    c.practiceKind='Variantes chiffrées de quatre tâches, avec hypothèses explicites';
    c.lessonNotions=lessonNotions;
    (modules[spec.module] ||= []).push(c);
  }
  return modules;
}
