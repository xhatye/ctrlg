import {auth} from './firebase';
export async function learningRequest(events){
 const token=await auth.currentUser?.getIdToken();
 if(!token)throw new Error('Reconnectez-vous pour enregistrer votre progression.');
 const response=await fetch('/api/progress',{method:events?'POST':'GET',headers:{Authorization:'Bearer '+token,...(events?{'Content-Type':'application/json'}:{})},...(events?{body:JSON.stringify({events})}:{})});
 const data=await response.json();
 if(!response.ok)throw new Error(data.error || 'Votre progression n’a pas pu être enregistrée.');
 return data;
}
