// Coefficients and rules: BO 2019 articles 3-6, 10-11; BO 2025 articles 3-6, 10-11.
// Both schedules apply the same weights. Names are supplied by the selected curriculum.
export const GRADE_SOURCES={
 '2026':'https://www.enseignementsup-recherche.gouv.fr/fr/bo/19/Hebdo26/ESRS1900135A.htm',
 '2027':'https://www.enseignementsup-recherche.gouv.fr/fr/bo/2025/Hebdo32/MENS2523324A',
};
export const GRADE_WEIGHTS={DCG:Array(13).fill(1),DSCG:[1.5,1,1.5,1.5,1,1,1]};
export function gradeValue(value){
 if(value===null||value===undefined||String(value).trim()==='')return null;
 const text=String(value).trim();if(!/^\d{1,2}(?:[.,]\d{1,2})?$/.test(text))return NaN;
 const n=Number(text.replace(',','.'));return n>=0&&n<=20?n:NaN;
}
export function calculateGrades(level,entries,optional=''){
 const weights=GRADE_WEIGHTS[level];if(!weights||!Array.isArray(entries)||entries.length!==weights.length)throw Error('Périmètre du calcul invalide.');
 let points=0,weight2=0,count=0,pending=0;const errors=[],low=[];
 entries.forEach((entry,i)=>{
  if(['dispense','vae'].includes(entry.mode)){
   if(entry.mode==='dispense'&&level==='DSCG'&&[0,3].includes(i))errors.push(i+1);
   return;
  }
  if(entry.mode!=='note'){errors.push(i+1);return;}
  const grade=gradeValue(entry.value);if(grade===null){pending++;return;}
  if(!Number.isFinite(grade)){errors.push(i+1);return;}
  const centi=Math.round(grade*100),w2=weights[i]*2;points+=centi*w2;weight2+=w2;count++;if(centi<600)low.push(i+1);
 });
 const option=gradeValue(optional),invalidOptional=option!==null&&!Number.isFinite(option);
 const bonus=count>=4&&Number.isFinite(option)?Math.max(0,Math.round(option*100)-1000):0;
 const average=weight2?(points+bonus*2)/(100*weight2):null;
 return {average,count,pending,errors,low,invalidOptional,bonus:bonus/100,bonusEligible:count>=4,weight:weight2/2,complete:pending===0&&errors.length===0&&!invalidOptional&&count>0,thresholdsMet:pending===0&&errors.length===0&&!invalidOptional&&count>0&&low.length===0&&points+bonus*2>=1000*weight2};
}
export function straightLine(cost,residual,years,elapsed){
 if(![cost,residual,years,elapsed].every(Number.isFinite)||cost<0||residual<0||residual>cost||years<=0||!Number.isInteger(years)||years>100||!Number.isInteger(elapsed)||elapsed<0||elapsed>years)throw Error('Vérifiez le coût, la valeur résiduelle, la durée et les années écoulées.');
 const annual=(cost-residual)/years;return {base:cost-residual,annual,cumulative:annual*elapsed,net:cost-annual*elapsed};
}
export function netPresentValue(investment,rate,flows){
 if(!Number.isFinite(investment)||investment<0||!Number.isFinite(rate)||rate<=-100||!Array.isArray(flows)||!flows.length||flows.length>30||flows.some(n=>!Number.isFinite(n)))throw Error('Saisissez un investissement positif, un taux supérieur à −100 % et de un à trente flux annuels.');
 const discounted=flows.map((amount,i)=>amount/(1+rate/100)**(i+1));const value=discounted.reduce((s,n)=>s+n,0)-investment;
 if(!Number.isFinite(value))throw Error('Ces hypothèses dépassent la précision du calcul.');return {discounted,rawValue:value,value:Math.round(value*100)/100||0};
}
