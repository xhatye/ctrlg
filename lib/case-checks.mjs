import {formatNumber} from './practice-engine.mjs';
export function parseStudyNumber(value){
 if(typeof value!=='string')return null;
 const s=value.trim().replace(/[\s\u00a0\u202f]/g,'').replace('−','-').replace(',','.');
 if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;
 const n=Number(s);return Number.isFinite(n)?n:null;
}
export function checkCaseStep(question,response){
 if(question.guide?.type==='number'){
  const n=parseStudyNumber(response);if(n===null)return {valid:false,correct:false,message:'Saisissez un nombre, sans unité. Vous pouvez utiliser une virgule.'};
  const expected=parseStudyNumber(formatNumber(question.guide.expected)),correct=parseStudyNumber(formatNumber(n))===expected;
  return {valid:true,correct:correct,message:correct?'Résultat correct à deux décimales.':'Reprenez la relation et les valeurs du corrigé.'};
 }
 if(question.guide?.type==='choice'){
  const choice=Number(response);if(typeof response!=='string'||!/^\d+$/.test(response)||!Number.isInteger(choice)||choice<0||choice>=question.guide.options.length||response==='')return {valid:false,correct:false,message:'Choisissez une proposition avant de vérifier.'};
  return {valid:true,correct:choice===question.guide.answer,message:choice===question.guide.answer?'Le raisonnement correspond aux éléments attendus.':'Cette proposition ne correspond pas aux éléments attendus. Consultez l’explication.'};
 }
 return {valid:false,correct:false,message:'Comparez votre raisonnement aux éléments du corrigé.'};
}
