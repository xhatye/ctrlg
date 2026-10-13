import {auth} from './firebase';
export async function trainingRequest(type,body){
 const token=await auth.currentUser?.getIdToken();
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch('/api/training'+(body?'':'?'+new URLSearchParams(typeof type==='object'?type:{type})),{method:body?'POST':'GET',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify({action:type,...body})}:{}),signal:controller.signal});
  const data=await response.json();if(!response.ok){const error=new Error(data.error || 'Enregistrement indisponible. Réessayez.');error.status=response.status;throw error;}return data;
 }catch(e){if(e.name==='AbortError')throw new Error('La réponse prend trop de temps. Vérifiez la connexion, puis réessayez.');throw e;}finally{clearTimeout(timeout);}
}
