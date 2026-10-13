import {hasPro} from './ai-access.mjs';
import {applyLearningEvent,normalizeEvents} from './learning-progress.mjs';
const fingerprint=e=>JSON.stringify(Object.keys(e).sort().map(key=>[key,e[key]]));
const dayFormat=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'});
export async function getProgress(uid,db){
 const snapshot=await db.collection('userLearning').doc(uid).get();
 return snapshot.exists?snapshot.data():{version:1,chapters:{}};
}
export async function writeProgress(uid,rawEvents,deps,catalogue,now=Date.now()){
 const events=normalizeEvents(rawEvents,catalogue),ref=deps.db.collection('userLearning').doc(uid);
 return deps.db.runTransaction(async tx=>{
  const user=await tx.get(deps.db.collection('users').doc(uid));
  if(!hasPro(user.data(),now))throw Object.assign(new Error('Un accès Pro actif est nécessaire.'),{status:403});
  const snapshot=await tx.get(ref);
  const receipts=[];
  for(const event of events){const receipt=ref.collection('events').doc(event.id);receipts.push({event,ref:receipt,snapshot:await tx.get(receipt)});}
  let progress=snapshot.exists?snapshot.data():{version:1,chapters:{}};
  for(const receipt of receipts)if(receipt.snapshot.exists){
   if(fingerprint(receipt.snapshot.data().event)!==fingerprint(receipt.event))throw Object.assign(new Error('Identifiant d’activité déjà utilisé.'),{status:409});
  }
  const day=dayFormat.format(now),fresh=receipts.filter(r=>!r.snapshot.exists).length,used=progress.activityDay===day?progress.activitiesToday || 0:0;
  if(used+fresh>500)throw Object.assign(new Error('Limite quotidienne de suivi atteinte. Votre travail reste disponible ; réessayez demain.'),{status:429});
  for(const receipt of receipts)if(!receipt.snapshot.exists){
   progress=applyLearningEvent(progress,receipt.event,now);
   tx.set(receipt.ref,{event:receipt.event,createdAt:new Date(now).toISOString()});
  }
  progress={...progress,activityDay:day,activitiesToday:used+fresh};
  tx.set(ref,progress);return progress;
 });
}
