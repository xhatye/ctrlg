import {useState} from 'react';
export default function CaseRubric({question,onCompare,initialChecked=[]}){
 const [checked,setChecked]=useState(initialChecked),rubric=question.rubric;
 if(!rubric)return null;
 const score=rubric.criteria.filter(c=>checked.includes(c.id)).reduce((sum,c)=>sum+c.points,0);
 return <section className="case-rubric"><h3>Ce qui est attendu dans votre réponse</h3><p>Comparez votre copie aux éléments ci-dessous. Cochez uniquement ce que vous avez expliqué : cette estimation personnelle n’est pas une note attribuée par un correcteur.</p><div className="rubric-criteria">{rubric.criteria.map(c=><label key={c.id}><input type="checkbox" checked={checked.includes(c.id)} onChange={()=>{const next=checked.includes(c.id)?checked.filter(id=>id!==c.id):[...checked,c.id];setChecked(next);onCompare?.(next);}}/><span><strong>{c.label} · {c.points.toLocaleString('fr-FR')} point{c.points>1?'s':''}</strong><span>{c.expected}</span></span></label>)}</div><p className="rubric-score">Comparaison personnelle : {score.toLocaleString('fr-FR')} / {rubric.points}</p><h4>Erreurs fréquentes à rechercher dans votre copie</h4><ul>{rubric.commonErrors.map((e,i)=><li key={i}>{e}</li>)}</ul><details><summary>Reprendre la démarche</summary><p>{rubric.method}</p></details></section>;
}
