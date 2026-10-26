import {useEffect,useRef,useState} from 'react';
import {auth} from './firebase';
import {PersonalCardEditor} from './PersonalCards';
export default function StudyAIHelp({request,label}){
 const [busy,setBusy]=useState(false),[reply,setReply]=useState(null),[source,setSource]=useState('ai'),[error,setError]=useState(''),[card,setCard]=useState(null);
 const controller=useRef(null),locked=useRef(false);
 useEffect(()=>()=>controller.current?.abort(),[]);
 const ask=async()=>{
  if(locked.current||reply)return;locked.current=true;setBusy(true);setError('');controller.current=new AbortController();
  try{
   const owner=auth.currentUser?.uid,token=await auth.currentUser?.getIdToken();if(!token)throw Error('Connectez-vous avec un accès actif pour cette aide.');
   const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(request),signal:AbortSignal.any([controller.current.signal,AbortSignal.timeout(30000)])});
   const data=await r.json();if(!r.ok)throw Error(data.error||'L’aide IA est indisponible. Le corrigé reste accessible.');
   if(auth.currentUser?.uid!==owner)return;setReply(data.content?.[0]?.text||'Aucune explication disponible.');setSource(data.helpSource||'ai');if(data.card)setCard({...data.card,uid:owner});
  }catch(e){if(!controller.current?.signal.aborted)setError(e.name==='TimeoutError'?'L’aide prend trop de temps. Votre exercice reste accessible.':e.message);}
  finally{locked.current=false;if(!controller.current?.signal.aborted)setBusy(false);}
 };
 return <aside className="study-ai-help"><button className="btn btn-secondary" type="button" disabled={busy||!!reply} onClick={ask}>{busy?'Préparation de l’aide…':reply?'Aide affichée':label}</button><small>Facultatif · utilise la même enveloppe IA que le tuteur. Le contexte utile est envoyé à Groq uniquement à votre demande.</small>{reply&&<div className="study-ai-reply" role="status"><strong>{source==='support'?(request.purpose==='case-hint'?'Indice de méthode du support':'Repères du support'):'Coup de pouce IA'}</strong>{source==='support'&&<small>La réponse IA n’a pas été retenue. Voici les éléments du support, sans nouvelle demande IA.</small>}<p className="preserve-lines">{card?'Relisez et adaptez cette proposition avant de la garder.':reply}</p>{card&&auth.currentUser?.uid===card.uid&&<PersonalCardEditor card={card} uid={card.uid}/>}<small>Vérifiez cette explication avec le support et le corrigé.</small></div>}{error&&<p role="alert">{error}</p>}</aside>;
}
