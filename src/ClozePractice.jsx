import {useEffect,useRef,useState} from 'react';
import {loadStudy} from './study-client';
import {trainingRequest} from './training-client';
export default function ClozePractice({ue,user,onSaved}){
 const [data,setData]=useState(null),[answers,setAnswers]=useState({}),[corrections,setCorrections]=useState({}),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false),[storage,setStorage]=useState(''),[retry,setRetry]=useState(0);
 const receipts=useRef({}),key='simdcg:cloze:v1:'+user.uid+':'+ue.id+':'+ue.chapter;
 useEffect(()=>{let alive=true;setData(null);setError('');setLoaded(false);setCorrections({});receipts.current={};loadStudy(ue.id,'cloze',{chapter:ue.chapter}).then(d=>{if(!alive)return;setData(d);try{const raw=JSON.parse(localStorage.getItem(key)),clean={};if(raw?.version===1&&raw.answers&&typeof raw.answers==='object')for(const item of d.items){const fields={};item.fields.forEach((_,i)=>{const value=raw.answers[item.id]?.[i];if(typeof value==='string'&&value.length<=300)fields[i]=value;});clean[item.id]=fields;}setAnswers(clean);}catch{setAnswers({});}setLoaded(true);}).catch(e=>{if(alive)setError(e.message);});return()=>{alive=false;};},[ue.id,ue.chapter,key,retry]);
 useEffect(()=>{if(!loaded)return;try{localStorage.setItem(key,JSON.stringify({version:1,answers}));setStorage('Réponses conservées sur cet appareil.');}catch{setStorage('Sauvegarde locale indisponible : conservez vos réponses avant de quitter.');}},[key,answers,loaded]);
 const check=async items=>{
  setBusy(true);setError('');
  try{
   const events=items.map(item=>({receipt:receipts.current[item.id] ||= crypto.randomUUID(),kind:'cloze',itemId:item.id,answers:item.fields.map((_,i)=>answers[item.id]?.[i]??'')}));
   let result;
   if(import.meta.env.DEV&&new URLSearchParams(location.search).has('design')){
    const [{MODULES},{chapterCloze,checkCloze}]=await Promise.all([import('../lib/study-content.mjs'),import('../lib/chapter-formats.mjs')]);
    const c=MODULES[ue.id].chapters.find(c=>c.id===ue.chapter);result={corrections:events.map(e=>({id:e.itemId,...checkCloze(chapterCloze(c).find(x=>e.itemId.endsWith(':cloze:'+x.id)),e.answers)}))};
   }else result=await trainingRequest('cloze-check',{events});
   setCorrections(old=>({...old,...Object.fromEntries(result.corrections.map(c=>[c.id,c]))}));onSaved?.();
  }catch(e){setError(e.message+' Vos réponses restent affichées.');}finally{setBusy(false);}
 };
 const change=(item,index,value)=>{setAnswers(old=>({...old,[item.id]:{...old[item.id],[index]:value}}));setCorrections(old=>{const next={...old};delete next[item.id];return next;});delete receipts.current[item.id];};
 const reset=(errorsOnly=false)=>{if(errorsOnly){const failed=new Set(Object.entries(corrections).filter(([,c])=>!c.correct).map(([id])=>id));setAnswers(old=>Object.fromEntries(Object.entries(old).filter(([id])=>!failed.has(id))));setCorrections(old=>Object.fromEntries(Object.entries(old).filter(([id])=>!failed.has(id))));for(const id of failed)delete receipts.current[id];}else{setCorrections({});receipts.current={};setAnswers({});}setError('');};
 if(!data)return <section className="reading-state" role={error?'alert':'status'}>{error?<><p>{error}</p><button className="btn" onClick={()=>setRetry(n=>n+1)}>Réessayer</button></>:'Chargement des exercices…'}</section>;
 if(!data.items.length)return <section className="reading-state"><h2>Ce format n’est pas encore disponible pour ce chapitre.</h2><p>Utilisez le cours, la fiche et les autres entraînements. Les textes à trous sont proposés uniquement après vérification de leur formulation et de leur correction.</p></section>;
 const checked=Object.values(corrections),readyItems=data.items.filter(item=>item.fields.every((_,i)=>answers[item.id]?.[i]?.trim()));
 return <section className="cloze-practice"><header><span className="eyebrow">RETROUVER SANS REGARDER</span><h2>Complétez le raisonnement.</h2><p>Renseignez les mots ou les nombres attendus. Chaque correction est expliquée.</p><small>{storage}</small></header>
 <div className="cloze-actions"><button className="btn" disabled={busy||!readyItems.length} onClick={()=>check(readyItems)}>{busy?'Vérification…':`Vérifier les réponses complétées (${readyItems.length})`}</button><button className="btn btn-secondary" disabled={busy} onClick={()=>reset()}>Recommencer la série</button>{checked.some(c=>!c.correct)&&<button className="btn btn-secondary" disabled={busy} onClick={()=>reset(true)}>Reprendre mes erreurs</button>}</div>
 {checked.length>0&&<p className="cloze-score" role="status">{checked.filter(c=>c.correct).length}/{checked.length} exercice{checked.length>1?'s':''} réussi{checked.length>1?'s':''}. Les difficultés alimentent vos rappels.</p>}
 {error&&<p className="message error" role="alert">{error}</p>}
 {data.items.map((item,index)=>{const result=corrections[item.id];return <form className={'cloze-exercise'+(result?(result.correct?' correct':' incorrect'):'')} key={item.id} onSubmit={e=>{e.preventDefault();check([item]);}}><span className="eyebrow">EXERCICE {String(index+1).padStart(2,'0')}</span><p className="cloze-prompt">{item.before}</p><div className="cloze-fields">{item.fields.map((field,i)=><label key={i}><span>Réponse {item.fields.length>1?i+1:''}{field.unit?' · '+field.unit:''}</span>{i>0&&item.between[i-1]&&<span>{item.between[i-1]}</span>}<input aria-label={`Exercice ${index+1}, réponse ${i+1}`} value={answers[item.id]?.[i] || ''} onChange={e=>change(item,i,e.target.value)} inputMode={field.type==='number'?'decimal':'text'} autoComplete="off" maxLength={300} disabled={busy} required aria-invalid={result?!result.fields[i].correct:undefined}/>{result&&<span className="cloze-field-feedback">{result.fields[i].correct?'✓ Correct':`À reprendre : ${result.fields[i].expected}${result.fields[i].unit?' '+result.fields[i].unit:''}`}</span>}</label>)}<span>{item.after}</span></div><button className="btn btn-secondary" disabled={busy}>{result?'Vérifier à nouveau':'Vérifier cet exercice'}</button>{result&&<div className="cloze-correction" role="status"><strong>{result.correct?'Raisonnement retrouvé.':'Voici le repère à reprendre.'}</strong><p>{result.explanation}</p></div>}</form>;})}
 </section>;
}
