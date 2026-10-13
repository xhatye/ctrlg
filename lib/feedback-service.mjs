import {trainingDay} from './training-time.mjs';
const bad=()=>{throw Object.assign(new Error('Indiquez une note, votre diplôme, un prénom ou pseudonyme et un retour de 30 à 2 000 caractères.'),{status:400});};
export function feedbackInput(body){
 if(!body||!Number.isInteger(body.rating)||body.rating<1||body.rating>5||!['DCG','DSCG'].includes(body.level)||typeof body.text!=='string'||body.text.trim().length<30||body.text.length>2000||typeof body.alias!=='string'||body.alias.trim().length<2||body.alias.length>40||typeof body.publicationConsent!=='boolean')bad();
 return {rating:body.rating,level:body.level,text:body.text.trim(),alias:body.alias.trim(),publicationConsent:body.publicationConsent};
}
export async function saveFeedback(uid,body,deps,now=Date.now()){
 const input=feedbackInput(body),ref=deps.db.collection('studentFeedback').doc(uid);
 await deps.db.runTransaction(async tx=>{
  const profile=await tx.get(deps.db.collection('users').doc(uid)),learning=await tx.get(deps.db.collection('userLearning').doc(uid)),exams=await tx.get(deps.db.collection('userExams').doc(uid)),old=await tx.get(ref);
  if(!profile.exists)throw Object.assign(new Error('Compte introuvable.'),{status:403});
  if(!Object.values(learning.data()?.chapters || {}).some(c=>c.lastActivityAt)&&!exams.exists)throw Object.assign(new Error('Travaillez d’abord un chapitre ou un sujet pour partager votre expérience.'),{status:403});
  const day=trainingDay(now),used=old.data()?.day===day?old.data().updatesToday || 0:0;
  if(used>=3)throw Object.assign(new Error('Votre retour est enregistré. Vous pourrez le modifier demain.'),{status:429});
  tx.set(ref,{...input,status:'pending',createdAt:old.data()?.createdAt || new Date(now).toISOString(),updatedAt:new Date(now).toISOString(),day,updatesToday:used+1});
 });return {saved:true,message:'Merci. Votre retour est transmis à l’équipe. Il sera publié uniquement après vérification et si vous avez donné votre accord.'};
}
export async function publishedFeedback(db){
 const result=await db.collection('studentFeedback').where('status','==','published').limit(12).get();
 return result.docs.filter(d=>{try{feedbackInput(d.data());return d.data().publicationConsent===true;}catch{return false;}}).map(d=>{const v=d.data();return {alias:v.alias,text:v.text,rating:v.rating,level:v.level};});
}
export async function ownFeedback(uid,deps){const snapshot=await deps.db.collection('studentFeedback').doc(uid).get();if(!snapshot.exists)return {feedback:null};const v=snapshot.data();return {feedback:{alias:v.alias,text:v.text,rating:v.rating,level:v.level,publicationConsent:v.publicationConsent,status:v.status}};}
export async function withdrawFeedback(uid,deps,now=Date.now()){
 const ref=deps.db.collection('studentFeedback').doc(uid);await deps.db.runTransaction(async tx=>{const snapshot=await tx.get(ref);if(!snapshot.exists)throw Object.assign(new Error('Aucun retour enregistré pour ce compte.'),{status:404});tx.set(ref,{...snapshot.data(),publicationConsent:false,status:'withdrawn',updatedAt:new Date(now).toISOString()});});return {saved:true,message:'Votre accord de publication est retiré. Le retour reste privé et destiné à l’équipe.'};
}
