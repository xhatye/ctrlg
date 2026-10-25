import {curriculumFor} from './curriculum.mjs';
export const PLANNER_PAGE={kind:'revision-planner',path:'/outils/planning-revision',title:'Planning de révision DCG et DSCG gratuit : vos UE, votre rythme',summary:'Créez un planning de révision DCG ou DSCG gratuit selon vos UE, vos priorités et vos heures disponibles. Séances de 30 minutes, téléchargement sans compte.'};
export const PLANNER_SUBJECTS=curriculumFor('2027').map(({id,label,level})=>({id,label,level}));
export const STUDY_DAYS=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
const activities=[{title:'Comprendre',instruction:'Choisissez une notion de votre cours. Lisez-la, puis expliquez-la avec vos propres mots.'},{title:'Retrouver sans regarder',instruction:'Fermez le cours. Répondez à quelques questions ou cartes, puis vérifiez vos réponses.'},{title:'Appliquer',instruction:'Traitez une question ou une partie de cas adaptée à l’UE, sans regarder le corrigé.'},{title:'Corriger et refaire',instruction:'Comparez votre raisonnement au corrigé. Notez une erreur, puis refaites l’étape concernée.'}];

// A time allocation aid, not a claim to cover an official programme or assess mastery.
export function buildRevisionPlan({weeks,hours,subjects,days}){
 if(!Number.isInteger(weeks)||weeks<1||weeks>12||!Number.isInteger(hours)||hours<1||hours>20)throw Error('Choisissez de 1 à 12 semaines et de 1 à 20 heures par semaine.');
 if(!Array.isArray(days)||!days.length||new Set(days).size!==days.length||days.some(d=>!Number.isInteger(d)||d<0||d>6))throw Error('Choisissez au moins un jour de révision.');
 if(!Array.isArray(subjects)||!subjects.length||subjects.length>20||new Set(subjects.map(s=>s.id)).size!==subjects.length)throw Error('Choisissez au moins une UE, sans doublon.');
 const pool=subjects.map(s=>{const ue=PLANNER_SUBJECTS.find(u=>u.id===s.id);if(!ue||![1,2].includes(s.weight))throw Error('Vérifiez vos UE et leurs priorités.');return {...ue,weight:s.weight,balance:0,count:0};});
 const totalWeight=pool.reduce((sum,s)=>sum+s.weight,0),orderedDays=[...days].sort((a,b)=>a-b),weeklySlots=hours*2;
 const schedule=Array.from({length:weeks},(_,i)=>{const buckets=orderedDays.map(day=>({day,label:STUDY_DAYS[day],sessions:[]}));
  for(let slot=0;slot<weeklySlots;slot++){
   pool.forEach(s=>{s.balance+=s.weight;});const chosen=pool.reduce((best,s)=>s.balance>best.balance?s:best);chosen.balance-=totalWeight;
   const activity=activities[chosen.count%activities.length];chosen.count++;
   buckets[Math.floor(slot*orderedDays.length/weeklySlots)].sessions.push({ue:chosen.id,label:chosen.label,level:chosen.level,minutes:30,...activity});
  }
  return {week:i+1,days:buckets.filter(d=>d.sessions.length)};
 });
 return {weeks,hours,totalMinutes:weeks*hours*60,sessionCount:weeks*weeklySlots,schedule,allocation:pool.map(({id,label,level,count,weight})=>({id,label,level,count,weight,minutes:count*30})),uncovered:pool.filter(s=>s.count===0).map(s=>s.id)};
}
export function planAsText(plan){return ['MON PLANNING DE RÉVISION · SIMDCG',`${plan.weeks} semaines · ${plan.hours} h par semaine · ${plan.sessionCount} séances de 30 min`,'Choisissez les chapitres adaptés à votre session dans vos cours. Ce planning répartit du temps et ne garantit pas la couverture du programme.','',...plan.schedule.flatMap(w=>[`SEMAINE ${w.week}`,...w.days.flatMap(d=>[d.label,...d.sessions.map(s=>`  ${s.level} ${s.ue.replace('DSCG','UE')} · ${s.label} · 30 min · ${s.title}\n    ${s.instruction}`)]),'']),'Ressources gratuites : https://www.simdcg.com/outils/planning-revision','Tester une UE : https://www.simdcg.com/test-gratuit'].join('\n');}

export function parsePlanDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw Error('Choisissez une date valide.');
 const time=Date.parse(value+'T00:00:00Z');if(!Number.isFinite(time)||new Date(time).toISOString().slice(0,10)!==value)throw Error('Choisissez une date valide.');return time;
}
export function buildDatedRevisionPlan({startDate,endDate,dailyHours,subjects}){
 const start=parsePlanDate(startDate),end=parsePlanDate(endDate),dayCount=(end-start)/86400000;
 if(dayCount<1||dayCount>366)throw Error('La date cible doit suivre le début de 1 à 366 jours.');
 if(!Array.isArray(dailyHours)||dailyHours.length!==7||dailyHours.some(h=>!Number.isFinite(h)||h<0||h>6||h*2!==Math.round(h*2))||dailyHours.every(h=>h===0))throw Error('Prévoyez au moins un créneau, de 0 à 6 heures par jour, par demi-heure.');
 // Reuse the existing catalogue and priority validation; this plan writes no user data.
 buildRevisionPlan({weeks:1,hours:1,days:[0],subjects});
 const pool=subjects.map(s=>({...PLANNER_SUBJECTS.find(u=>u.id===s.id),weight:s.weight,balance:0,count:0})),totalWeight=pool.reduce((n,s)=>n+s.weight,0),schedule=[];
 const format=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
 for(let offset=0;offset<dayCount;offset++){
  const date=new Date(start+offset*86400000),day=(date.getUTCDay()+6)%7,slots=dailyHours[day]*2;if(!slots)continue;
  const week=Math.floor(offset/7)+1;let bucket=schedule.find(w=>w.week===week);if(!bucket){bucket={week,days:[]};schedule.push(bucket);}
  const sessions=[];for(let i=0;i<slots;i++){pool.forEach(s=>s.balance+=s.weight);const chosen=pool.reduce((a,b)=>b.balance>a.balance?b:a);chosen.balance-=totalWeight;const activity=activities[chosen.count%4];chosen.count++;sessions.push({ue:chosen.id,label:chosen.label,level:chosen.level,minutes:30,...activity});}
  bucket.days.push({day,date:date.toISOString().slice(0,10),label:format.format(date),sessions});
 }
 const sessionCount=pool.reduce((n,s)=>n+s.count,0);if(!sessionCount)throw Error('Aucun créneau entre ces dates. Ajustez les jours disponibles.');
 return {startDate,endDate,weeks:Math.ceil(dayCount/7),hours:dailyHours.reduce((a,b)=>a+b,0),dailyHours:[...dailyHours],totalMinutes:sessionCount*30,sessionCount,schedule,allocation:pool.map(({id,label,level,count,weight})=>({id,label,level,count,weight,minutes:count*30})),uncovered:pool.filter(s=>!s.count).map(s=>s.id)};
}
