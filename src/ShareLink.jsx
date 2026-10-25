import {useEffect,useRef,useState} from 'react';
import {publicShareUrl} from '../lib/public-sharing.mjs';
export default function ShareLink({path,title}){
 const [message,setMessage]=useState(''),[manual,setManual]=useState(false),input=useRef(null);
 // Share a canonical public resource only, never a student's results or URL parameters.
 const url=publicShareUrl(path);
 useEffect(()=>{setMessage('');setManual(false);},[url]);
 useEffect(()=>{if(manual){input.current?.focus();input.current?.select();}},[manual]);
 const share=async()=>{setMessage('');try{if(navigator.share){await navigator.share({title,url});setMessage('Partage terminé.');}else{await navigator.clipboard.writeText(url);setMessage('Lien copié.');}}catch(e){if(e.name==='AbortError')setMessage('Partage annulé.');else{setManual(true);setMessage('Copiez ce lien pour partager la ressource.');}}};
 return <div className="growth-share"><button type="button" className="btn btn-secondary" aria-label={'Partager : '+title} onClick={share}>Partager la ressource</button>{message&&<span role="status">{message}</span>}{manual&&<label>Lien public à copier<input ref={input} readOnly value={url} aria-label="Lien public à copier"/></label>}</div>;
}
