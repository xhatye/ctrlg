import {firebaseServices,authenticated,fail} from '../lib/admin.mjs';
import {MODULES,moduleCatalogue} from '../lib/study-content.mjs';
import {getProgress,writeProgress} from '../lib/progress-service.mjs';
const catalogue=Object.fromEntries(Object.keys(MODULES).map(id=>[id,moduleCatalogue(id)]));
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method Not Allowed'});
 try{
  if(!req.headers.authorization?.match(/^Bearer (.+)$/))throw Object.assign(new Error('Connexion requise.'),{status:401});
  const deps=firebaseServices(),user=await authenticated(req,deps.auth);
  const result=req.method==='GET'?await getProgress(user.uid,deps.db):await writeProgress(user.uid,req.body?.events,deps,catalogue);
  return res.status(200).json(result);
 }catch(error){return fail(res,error);}
}
