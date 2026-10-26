import catalogue from './catalogue.json';
import {revisionPriorities} from '../lib/revision-priorities.mjs';
export default function RevisionPriorities({learning={},ids}){
 const priorities=revisionPriorities(catalogue.modules,learning,ids);
 return <section className="panel revision-priorities"><h2>Votre prochaine séance</h2><p>Suggestions d’après les activités enregistrées. Elles ne constituent pas une mesure de maîtrise et n’utilisent pas l’IA.</p>{priorities.length?<ul>{priorities.map(p=><li key={p.module+'/'+p.chapter}><strong>{p.module.replace('DSCG','DSCG UE')} · {p.title}</strong><p>{p.reason}</p><a href={'/'+p.tool+'?ue='+p.module+'&chapter='+encodeURIComponent(p.chapter)}>Travailler cette priorité</a></li>)}</ul>:<p>Après une lecture ou une série enregistrée, vos prochaines étapes apparaîtront ici. Commencez par une matière que vous préparez cette session.</p>}</section>;
}
