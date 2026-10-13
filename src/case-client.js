import {auth} from './firebase';
export async function reviewCase(body){
 if(import.meta.env.DEV&&new URLSearchParams(location.search).has('design'))return {feedback:{strengths:['Votre réponse aborde le sujet du dossier.'],improvements:['Reliez chaque étape aux faits fournis.'],nextSteps:['Comparez votre conclusion au corrigé.']},caseDailyRemaining:4,caseMonthlyRemaining:59};
 const token=await auth.currentUser?.getIdToken();
 const response=await fetch('/api/case-review',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+(token||'')},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
 const data=await response.json();if(!response.ok)throw new Error(data.error||'L’analyse est indisponible. Le corrigé reste disponible.');return data;
}
