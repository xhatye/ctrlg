import {firebaseServices,authenticated,fail} from '../lib/admin.mjs';
import {caseReviewPrompt,validateCaseFeedback} from '../lib/case-review.mjs';
import {reserveTutor,AI_MODEL} from '../lib/ai-budget.mjs';
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Method Not Allowed'});
 try{
  if(!req.headers.authorization?.match(/^Bearer (.+)$/))throw Object.assign(new Error('Connexion requise.'),{status:401});
  const deps=firebaseServices(),user=await authenticated(req,deps.auth);
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body,data=caseReviewPrompt(body);
  if(!process.env.GROQ_API_KEY)throw Object.assign(new Error('Le retour IA est indisponible. Les cas guidés restent accessibles.'),{status:503});
  const remaining=await reserveTutor(deps.db,user.uid,data);
  const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${process.env.GROQ_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:AI_MODEL,temperature:.2,messages:data.messages,max_completion_tokens:data.max_tokens,reasoning_effort:'low',include_reasoning:false,response_format:{type:'json_object'}}),signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw Object.assign(new Error(response.status===429?'L’analyse est occupée. Réessayez plus tard ; le corrigé reste disponible.':'L’analyse est indisponible. Utilisez le corrigé du dossier.'),{status:503});
  const result=await response.json();let feedback;
  try{feedback=validateCaseFeedback(JSON.parse(result.choices?.[0]?.message?.content||''));}catch{throw Object.assign(new Error('Le retour IA est incomplet. Utilisez le corrigé ou réessayez plus tard.'),{status:503});}
  return res.status(200).json({feedback,...remaining});
 }catch(error){if(error instanceof SyntaxError)error=Object.assign(new Error('Requête invalide.'),{status:400});if(error.name==='TimeoutError')error=Object.assign(new Error('L’analyse prend trop de temps. Le corrigé reste disponible.'),{status:503});return fail(res,error);}
}
