import {resolveReviewItem} from '../lib/review-engine.mjs';
import {checkCloze} from '../lib/chapter-formats.mjs';
import {firebaseServices,authenticated,fail} from '../lib/admin.mjs';
import {EXAM_CATALOGUE} from '../lib/exam-bank.mjs';
import {startExam,getAttempt,listAttempts,updateAttempt} from '../lib/exam-service.mjs';
import {reviewQueue,recordReviews} from '../lib/review-service.mjs';
import {publishedFeedback,saveFeedback,ownFeedback,withdrawFeedback} from '../lib/feedback-service.mjs';
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method Not Allowed'});
 try{
  const url=new URL(req.url,'https://simdcg.com'),type=url.searchParams.get('type');
  if(req.method==='GET'&&type==='exam-catalog')return res.status(200).json({items:EXAM_CATALOGUE});
  if(req.method==='GET'&&type==='feedback')return res.status(200).json({items:await publishedFeedback(firebaseServices().db)});
  const allowed=req.method==='GET'?['attempt','attempts','queue','own-feedback']:['start','save','finish','assess','review','feedback','withdraw-feedback','cloze-check'];
  const action=req.method==='GET'?type:req.body?.action;
  if(!allowed.includes(action))throw Object.assign(new Error('Action introuvable.'),{status:404});
  if(!req.headers.authorization?.match(/^Bearer (.+)$/))throw Object.assign(new Error('Connexion requise.'),{status:401});
  const deps=firebaseServices(),user=await authenticated(req,deps.auth);let result;
  if(action==='attempt')result=await getAttempt(user.uid,url.searchParams.get('id'),deps);
  if(action==='attempts')result={items:await listAttempts(user.uid,deps)};
  if(action==='queue')result=await reviewQueue(user.uid,deps);
  if(action==='start')result=await startExam(user.uid,req.body,deps);
  if(['save','finish','assess'].includes(action))result=await updateAttempt(user.uid,req.body,deps);
  if(action==='cloze-check'){
    if(!Array.isArray(req.body?.events)||req.body.events.length>20||req.body.events.some(e=>!e||e.kind!=='cloze'))throw Object.assign(Error('Série invalide.'),{status:400});
    result=await recordReviews(user.uid,req.body.events,deps);
    result.corrections=req.body.events.map(e=>({id:e.itemId,...checkCloze(resolveReviewItem('cloze',e.itemId).cloze,e.answers)}));
  }
  if(action==='review')result=await recordReviews(user.uid,req.body?.events,deps);
  if(action==='feedback')result=await saveFeedback(user.uid,req.body,deps);
  if(action==='own-feedback')result=await ownFeedback(user.uid,deps);
  if(action==='withdraw-feedback')result=await withdrawFeedback(user.uid,deps);
  return res.status(200).json(result);
 }catch(e){return fail(res,e);}
}
