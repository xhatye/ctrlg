import {useEffect,useMemo,useRef,useState} from 'react';
import catalogue from './catalogue.json';
import {searchCatalogue} from '../lib/catalogue-search.mjs';
import './study-search.css';
export default function StudySearch({open,onClose,onSelect}){
 const dialog=useRef(null),input=useRef(null),opener=useRef(null);
 const [query,setQuery]=useState(''),[active,setActive]=useState(0);
 const results=useMemo(()=>searchCatalogue(catalogue,query),[query]);
 useEffect(()=>{
  if(open){opener.current=document.activeElement;setQuery('');setActive(0);if(!dialog.current.open)dialog.current.showModal();input.current?.focus();}
  else if(dialog.current.open){dialog.current.close();opener.current?.focus();}
 },[open]);
 useEffect(()=>{if(open)document.getElementById('study-search-'+active)?.scrollIntoView({block:'nearest'});},[active,open]);
 const choose=item=>{onClose();onSelect(item);};
 const onKeyDown=e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();return;}
  if(!results.length)return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setActive(i=>(i+(e.key==='ArrowDown'?1:-1)+results.length)%results.length);}
  else if(e.key==='Enter'){e.preventDefault();choose(results[Math.min(active,results.length-1)]);}
 };
 return <dialog ref={dialog} className="study-search-dialog" aria-labelledby="study-search-title" onCancel={onClose} onClose={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className="study-search-heading"><h2 id="study-search-title">Que voulez-vous réviser ?</h2><button onClick={onClose} aria-label="Fermer la recherche">✕</button></div>
  <label className="study-search-label" htmlFor="study-search-input">Une UE, un chapitre, une notion</label>
  <input ref={input} id="study-search-input" type="search" autoComplete="off" placeholder="TVA, amortissement, DSCG UE2…" value={query} onChange={e=>{setQuery(e.target.value);setActive(0);}} onKeyDown={onKeyDown} role="combobox" aria-expanded={query.trim().length>0} aria-controls="study-search-results" aria-autocomplete="list" aria-activedescendant={results.length?'study-search-'+Math.min(active,results.length-1):undefined}/>
  <p className="study-search-status" role="status">{query.trim()?results.length?`${results.length} résultat${results.length>1?'s':''} affiché${results.length>1?'s':''}`:'Aucun résultat. Essayez une autre notion ou un numéro d’UE.':'Recherchez dans les 20 UE et leurs chapitres.'}</p>
  {!query.trim()&&<div className="study-search-suggestions">{['Comptabilité','Droit social','DSCG UE2','TVA'].map(s=><button key={s} onClick={()=>{setQuery(s);setActive(0);input.current?.focus();}}>{s}</button>)}</div>}
  <div id="study-search-results" className="study-search-results" role="listbox" aria-label="Résultats de recherche">{results.map((item,i)=><div key={item.id} id={'study-search-'+i} role="option" aria-selected={i===active} onMouseMove={()=>setActive(i)}><button tabIndex={-1} onClick={()=>choose(item)}><span><small>{item.subject} · {item.kind==='subject'?'Matière':'Chapitre'}</small><strong>{item.title}</strong></span><span aria-hidden="true">↗</span></button></div>)}</div>
  <div className="study-search-footer">↑ ↓ pour choisir · Entrée pour ouvrir · Échap pour fermer</div>
 </dialog>;
}
