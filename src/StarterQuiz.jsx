import {useEffect,useRef,useState} from 'react';
import {quizResult} from '../lib/first-session.mjs';

export default function StarterQuiz({questions,module='UE9',name='Comptabilité',onFinish}){
 const [index,setIndex]=useState(0),[choice,setChoice]=useState(null),[checked,setChecked]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const choices=useRef([]),receipt=useRef(null),started=useRef(Date.now()),finishing=useRef(false),heading=useRef(null);
 if(!receipt.current)receipt.current=crypto.randomUUID();
 useEffect(()=>{if(index>0)heading.current?.focus();},[index]);
 const q=questions[index];
 const next=async()=>{
  if(!checked||finishing.current)return;
  if(index<questions.length-1){setIndex(n=>n+1);setChoice(null);setChecked(false);return;}
  finishing.current=true;setBusy(true);setError('');
  try{await onFinish(quizResult(questions,choices.current,{module,name,sessionId:receipt.current,duration:Math.max(0,Math.round((Date.now()-started.current)/1000))}));}
  catch{setError('Votre résultat reste disponible. Réessayez pour terminer.');finishing.current=false;setBusy(false);}
 };
 return <section className="starter-quiz" aria-label="QCM expliqué"><div className="starter-quiz-meta"><span>Question {index+1} / {questions.length}</span><span>Une seule bonne réponse</span></div><progress aria-label="Questions vérifiées" max={questions.length} value={index+(checked?1:0)}/><h2 ref={heading} tabIndex={-1}>{q.q}</h2><fieldset disabled={checked||busy}><legend className="sr-only">Choisissez votre réponse</legend>{q.options.map((option,i)=><label key={i} className={'starter-option'+(choice===i?' selected':'')+(checked&&i===q.answer?' correct':'')+(checked&&choice===i&&i!==q.answer?' incorrect':'')}><input type="radio" name="starter-answer" value={i} checked={choice===i} onChange={()=>setChoice(i)}/><span className="starter-letter" aria-hidden="true">{'ABCD'[i]}</span><span>{option}</span>{checked&&i===q.answer&&<small>Bonne réponse</small>}</label>)}</fieldset>{checked&&<div className="starter-explanation" role="status"><strong>{choice===q.answer?'Bonne réponse.':'Voici le raisonnement.'}</strong><p>{q.expl}</p>{choice!==q.answer&&q.optionExplanations?.[choice]&&<p>{q.optionExplanations[choice]}</p>}</div>}<div className="starter-quiz-actions">{!checked?<button className="btn" disabled={choice===null} onClick={()=>{choices.current[index]=choice;setChecked(true);}}>Vérifier ma réponse</button>:<button className="btn" disabled={busy} onClick={next}>{busy?'Enregistrement…':index===questions.length-1?'Voir mon bilan':'Question suivante'}</button>}</div>{error&&<p role="alert">{error}</p>}</section>;
}
