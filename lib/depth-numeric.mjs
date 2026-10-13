import {formatNumber} from './practice-engine.mjs';
const units=value=>value || 'nombre sans unité';
export function deepenNumeric(c){
 const spec=c.practiceSpec;if(!spec)return c;
 const first=c.variantAt(0),second=c.variantAt(1),values=first.notions[0].calculation.inputs;
 const inputs=Object.entries(spec.inputs).map(([key,p])=>({label:p.label,value:values[key],unit:p.unit}));
 const operation=t=>{
  let formula=t.calculate.toString().split('=>').slice(1).join('=>').trim();
  formula=formula.replace(/d\.([a-zA-Z0-9_]+)/g,(_,key)=>'('+String(values[key]).replace('.',',')+')').replaceAll('Math.max','max').replaceAll('Math.min','min').replaceAll('Math.sqrt','racine').replaceAll('Math.pow','puissance').replaceAll('**','^').replaceAll('*',' × ').replaceAll('/',' ÷ ').replaceAll('-',' − ').replaceAll('+',' + ');
  return /[{};]|=>|d\./.test(formula)||/[a-zA-Z]/.test(formula.replace(/max|min|racine|puissance/g,''))?null:formula;
 };
 c.sections=spec.tasks.map((t,i)=>({
  title:t.title,paragraphs:[c.notions[i].body,
   'Dans ce dossier, la question porte sur « '+t.title.toLocaleLowerCase('fr')+' ». La relation à utiliser est : '+t.rule+' L’unité de la réponse attendue est '+units(t.unit)+'. Une valeur totale et une valeur unitaire ne sont pas interchangeables : conservez la définition de l’indicateur avant de choisir les données à lui affecter.',
   spec.method+' Pour cette étape, séparez les données de départ du résultat demandé. Si une valeur calculée à l’étape précédente est réutilisée, gardez ses décimales intermédiaires. Le corrigé du dossier utilise les valeurs complètes et arrondit le résultat final à deux décimales.',
   'Le résultat de l’exemple est '+first.notions[i].correct+'. '+spec.interpretation+' Cette conclusion n’est valable que dans le cadre des hypothèses de l’énoncé : '+spec.assumptions+' Si une hypothèse change, reprenez la construction du modèle avant d’appliquer la même relation.'
  ],example:{context:first.contexte,analysis:[t.rule,...(operation(t)?['Application numérique : '+operation(t)+'.']:[]),'Résultat : '+first.notions[i].correct+'. '+spec.interpretation]}}));
 c.sections.push({title:'Transférer la méthode à un autre dossier',paragraphs:[second.contexte,...spec.tasks.map((t,i)=>'Étape '+(i+1)+' : '+t.title+'. '+t.rule+' Avec les données de ce second dossier, le résultat est '+second.notions[i].correct+'.'), 'Comparez les deux dossiers : les relations du modèle restent les mêmes, tandis que les valeurs de départ et les résultats changent. Avant de réutiliser un calcul, contrôlez le périmètre, les unités et les hypothèses de chaque énoncé. La concordance arithmétique ne suffit pas à établir que le modèle convient à une autre situation.']});
 c.methodSteps=['Délimiter le modèle : '+spec.assumptions,'Repérer les données utiles : '+inputs.map(p=>p.label+' ('+units(p.unit)+')').join(', ')+'.',...spec.tasks.map(t=>t.title+' : '+t.rule),'Vérifier l’interprétation : '+spec.interpretation,'Relire les hypothèses et les unités, puis arrondir les résultats finaux à deux décimales.'];
 c.glossary=inputs.map(p=>({term:p.label,definition:'Donnée de l’exercice mesurée en '+units(p.unit)+'. Dans le dossier de départ : '+formatNumber(p.value)+(p.unit?' '+p.unit:'')+'. Cette valeur est une hypothèse de l’énoncé.'}));
 c.glossary.push(...spec.tasks.map(t=>({term:t.title,definition:t.rule+' Unité attendue : '+units(t.unit)+'.'})));
 c.checklist=[...spec.pitfalls,'Vérifier les unités de chaque résultat et les décimales intermédiaires.','Relier la conclusion à cette limite : '+spec.interpretation];
 c.quiz=spec.tasks.map((t,i)=>({title:t.title,body:t.rule+' '+spec.interpretation,q:'Dans « '+c.title+' », quelle relation permet de calculer « '+t.title+' » ?',correct:t.rule,wrong:spec.tasks.filter((_,j)=>j!==i).map(other=>other.rule)}));
 for(let i=0;i<4;i++){
  const n=first.notions[i];c.quiz.push({...n,q:'Dossier de référence : '+n.q,application:false});
 }
 c.cards=[...spec.tasks.map(t=>({q:'Relation à retrouver : '+t.title+' ('+c.title+')',a:t.rule+' '+spec.interpretation,tag:c.title})),
  {q:'Hypothèses du modèle : '+c.title,a:spec.assumptions,tag:c.title},
  {q:'Méthode à reconstruire : '+c.title,a:spec.method,tag:c.title},
  ...spec.pitfalls.map((p,i)=>({q:'Point de vigilance '+(i+1)+' : '+c.title,a:p,tag:c.title}))];
 c.numericInputs=inputs;
 c.numericGuide=true;
 return c;
}
