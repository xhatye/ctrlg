import {useState} from 'react';
import StudyAIHelp from './StudyAIHelp';
export default function LessonCoach({module,chapter,onTest}){
 const [action,setAction]=useState(null),[opened,setOpened]=useState([]);
 const actions=[['simple','Plus simplement'],['summary','Résumer en cinq points'],['example','Un exemple expliqué']];
 return <section className="panel lesson-coach"><span className="eyebrow">UN COUP DE POUCE SUR CE CHAPITRE</span><h2>Une autre façon de comprendre.</h2><p>Choisissez une aide fondée sur les repères du chapitre. Une réponse IA reste à vérifier avec le cours.</p><div className="coach-actions">{actions.map(([id,label])=><button type="button" className="btn btn-secondary" key={id} aria-pressed={action===id} onClick={()=>{setAction(id);setOpened(old=>old.includes(id)?old:[...old,id]);}}>{label}</button>)}{onTest&&<button type="button" className="btn btn-secondary" onClick={onTest}>Me tester sur ce chapitre</button>}</div>{opened.map(id=><div key={id} hidden={action!==id}><StudyAIHelp request={{purpose:'lesson-coach',module,chapter,action:id}} label="Demander cette aide IA"/></div>)}<p className="helper">Le test utilise les QCM déjà disponibles, sans demande IA.</p></section>;
}
