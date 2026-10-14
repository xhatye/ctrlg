import {useState} from 'react';
import './subject-lessons.css';

export function SubjectLessonGuide({profile}){
 if(!profile)return null;
 return <section className={'panel discipline-guide discipline-'+profile.family}><span className="eyebrow">LA DÉMARCHE DE CETTE MATIÈRE</span><h2>{profile.title}</h2><ol>{profile.steps.map((s,i)=><li key={s.title}><span className="discipline-step-number">{i+1}</span><div><h3>{s.title}</h3><p>{s.text}</p></div></li>)}</ol></section>;
}

export function ReasoningDossier({data,profile}){
 return <section className={'panel course-dossier discipline-'+(profile?.family||'law')} id="lesson-application"><span className="eyebrow">LA SITUATION À ANALYSER</span><h2>{data.titre}</h2><p className="workshop-context">{data.contexte}</p><p className="helper">Lisez la situation avant les notions. Proposez une réponse, puis comparez-la aux éléments attendus.</p>{data.questions.map(q=><details key={q.num}><summary>{q.enonce}</summary><p>{q.answer}</p></details>)}</section>;
}

export function LessonWorkshop({workshop,profile}){
 const [selected,setSelected]=useState({}),[checked,setChecked]=useState({});
 return <section className={'lesson-workshop discipline-'+(profile?.family||'law')} id="lesson-application" aria-label={'Atelier : '+workshop.title}>
  <header className="panel workshop-header"><span className="eyebrow">ATELIER ORIGINAL · APPLICATION COMMENTÉE</span><h2>{workshop.title}</h2><p className="workshop-context">{workshop.context}</p></header>
  {workshop.table&&<section className="panel workshop-data"><h3>{profile?.family==='accounting'?'Du traitement aux montants':profile?.family==='audit'?'Assertions et preuves attendues':profile?.family==='english'?'Read the evidence':'Les données et leur lecture'}</h3><div className="workshop-table-scroll" tabIndex={0} role="region" aria-label="Tableau de l’atelier"><table><caption>{workshop.title}</caption><thead><tr>{workshop.table.headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{workshop.table.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th key={j} scope="row">{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>{workshop.code&&<><h3>Requête correspondant au besoin</h3><pre className="workshop-code"><code>{workshop.code}</code></pre><p className="helper">À examiner avec le jeu de données fourni ; aucune requête n’est exécutée sur une base réelle.</p></>}</section>}
  <div className="workshop-explanations">{workshop.sections.map(s=><article className="panel" key={s.title}><h3>{s.title}</h3>{s.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</article>)}</div>
  <section className="panel workshop-checks"><h3>{profile?.family==='english'?'Check your reasoning':'Vérifiez le raisonnement de l’atelier'}</h3><p className="helper">Autocontrôle de lecture. Pour enregistrer un score dans votre progression, utilisez une série de QCM.</p>
   {workshop.quiz.map((q,i)=>{
    const base=[q.correct,...q.wrong],offset=(i+workshop.title.length)%4,options=[...base.slice(offset),...base.slice(0,offset)],value=selected[i],done=checked[i];
    return <fieldset key={q.q}><legend>{i+1}. {q.q}</legend><div className="workshop-options">{options.map((o,j)=><label key={o} className={done?(o===q.correct?'is-correct':o===value?'is-incorrect':''):''}><input type="radio" name={'workshop-'+i} checked={value===o} onChange={()=>{setSelected(old=>({...old,[i]:o}));setChecked(old=>({...old,[i]:false}));}}/><span>{o}</span></label>)}</div><button className="btn btn-secondary" disabled={!value||done} onClick={()=>setChecked(old=>({...old,[i]:true}))}>Vérifier la réponse {i+1}</button>{done&&<div className="workshop-feedback" role="status"><strong>{value===q.correct?'Réponse juste.':'Un point à reprendre.'}</strong>{value!==q.correct&&<p>{q.wrongReasons[q.wrong.indexOf(value)]}</p>}<p>{q.body}</p><details><summary>Comprendre les autres propositions</summary><ul>{q.wrong.map((o,j)=><li key={o}><strong>{o}</strong> {q.wrongReasons[j]}</li>)}</ul></details></div>}</fieldset>;
   })}
  </section>
 </section>;
}
