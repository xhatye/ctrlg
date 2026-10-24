import {useEffect,useRef,useState} from 'react';
import catalogue from './catalogue.json';
import sample from './sample-lesson.json';
import {loadStudy} from './study-client';
import {FIRST_SESSION_KEY,firstSessionSubjects} from '../lib/first-session.mjs';
import SubjectIcon from './SubjectIcon';
import StarterQuiz from './StarterQuiz';
import './starter.css';

export default function FirstSession({user,ues,onNav,onComplete}){
 const available=firstSessionSubjects(ues,user.isPro);
 const [module,setModule]=useState(available.find(u=>u.id==='UE9')?.id||available[0].id),[questions,setQuestions]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState(null),[saved,setSaved]=useState(null);
 const heading=useRef(null),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 useEffect(()=>{if(result)heading.current?.focus();},[result]);
 const ue=available.find(u=>u.id===module)||available[0],chapter=catalogue.modules[ue.id].chapters[0];
 useEffect(()=>{if(!user.isPro&&module!=='UE9'){setModule('UE9');setQuestions(null);setResult(null);setError('Votre accès actif a changé. Le chapitre offert reste disponible.');}},[user.isPro,module]);
 const start=async()=>{
  setBusy(true);setError('');
  try{const items=user.isPro?(await loadStudy(module,'qcm',{chapter:chapter.id,count:5,focus:'knowledge'})).items:sample.questions.slice(0,5);if(items?.length!==5)throw Error('incomplete');if(mounted.current)setQuestions(items);}
  catch{if(mounted.current)setError('La série ne peut pas être ouverte. Réessayez dans un instant.');}
  finally{if(mounted.current)setBusy(false);}
 };
 const finish=async data=>{
  const receipt=user.isPro?await onComplete(data):null;
  if(!mounted.current)return;
  setSaved(receipt);setResult(data);
  try{localStorage.setItem(FIRST_SESSION_KEY+user.uid,'completed');}catch{}
 };
 const pending=saved&&(saved.pendingLearning||saved.pendingReviews||saved.historySaved===false);
 return <div className="page first-session"><header className="first-session-heading"><div><span className="eyebrow">UNE NOTION À LA FOIS</span><h1>Votre première révision.</h1><p>Une UE, cinq questions et une prochaine étape claire.</p></div><button className="btn btn-secondary" onClick={()=>onNav('dashboard')}>Mon espace</button></header><ol className="first-session-steps" aria-label="Parcours de démarrage">{['Choisir','Pratiquer','Continuer'].map((label,i)=><li key={label} aria-current={i===(result?2:questions?1:0)?'step':undefined}><span>{i+1}</span>{label}</li>)}</ol>
 {!questions?<section className="panel first-session-choose"><SubjectIcon id={module} size={84}/><h2>Par quelle matière commence-t-on ?</h2>{user.isPro?<><label htmlFor="first-subject">Mon UE</label><select id="first-subject" value={module} disabled={busy} onChange={e=>setModule(e.target.value)}>{['DCG','DSCG'].map(level=><optgroup label={level} key={level}>{available.filter(u=>u.level===level).map(u=><option key={u.id} value={u.id}>{u.id.replace('DSCG','UE')} · {u.label}</option>)}</optgroup>)}</select><p>Premier chapitre : <strong>{chapter.title}</strong>. Vos réponses alimenteront vos révisions.</p></>:<p>Commencez par cinq questions offertes en <strong>DCG UE9 · Comptabilité</strong>. Les autres UE et le suivi personnalisé sont inclus avec un accès actif.</p>}<button className="btn" onClick={start} disabled={busy}>{busy?'Ouverture…':'Commencer mes 5 questions'}</button>{error&&<p role="alert">{error}</p>}{user.isPro?<button className="text-button" onClick={()=>onNav('resume_cours',{module,chapter:chapter.id})}>Lire ce chapitre avant de commencer</button>:<a className="text-button" href="/exemple-gratuit">Lire le chapitre gratuit avant de commencer</a>}</section>:result?<section className="panel starter-result"><span className="eyebrow">PREMIÈRE SÉRIE TERMINÉE</span><h2 ref={heading} tabIndex={-1}>{result.score} {result.score>1?'bonnes réponses':'bonne réponse'} sur 5.</h2><p>{result.score===5?'Vous avez retrouvé les cinq notions de cette série.':'Vos hésitations vous donnent un point de départ pour la prochaine révision.'} Ce bilan ne constitue pas une note de maîtrise de l’UE.</p>{pending?<p role="alert">Le bilan reste affiché ; une partie de l’enregistrement a échoué. <button className="text-button" onClick={()=>onNav('results_qcm')}>Vérifier l’enregistrement</button></p>:user.isPro?<p className="starter-saved">Vos réponses sont enregistrées. Les questions à retravailler rejoignent vos rappels.</p>:<p>Cette découverte gratuite n’est pas enregistrée dans votre progression personnelle.</p>}<div className="first-next"><img src="/navigation-3d-v1/review.webp" alt="" width="60" height="60"/><div><h3>{user.isPro?'Gardez une place pour la prochaine révision.':'Continuez avec les chapitres de vos UE.'}</h3><p>{user.isPro?'Les erreurs de cette série reviennent dans « À revoir aujourd’hui » à leur date prévue. Vous pouvez déjà reprendre la fiche du chapitre.':'Choisissez Pro à 15 € par mois ou le Pack Examen à 29 € pour 90 jours pour accéder à la bibliothèque et au suivi.'}</p></div></div><div className="first-next-actions">{user.isPro?<><button className="btn" onClick={()=>onNav('resume_cours',{module,chapter:chapter.id,format:'sheet'})}>Retrouver ma fiche</button><button className="btn btn-secondary" onClick={()=>onNav('review_today')}>Mes notions à revoir</button></>:<><button className="btn" onClick={()=>onNav('pricing')}>Choisir mon accès</button><a className="btn btn-secondary" href="/exemple-gratuit">Continuer le chapitre offert</a></>}</div></section>:<><div className="first-session-context"><SubjectIcon id={module} size={48}/><div><strong>{ue.label}</strong><span>{chapter.title}</span></div></div><StarterQuiz questions={questions} module={module} name={ue.label} onFinish={finish}/></>}
 </div>;
}
