import './public-ai.css';

export const AI_LIMITS_COPY='Les aides IA partagent une même enveloppe : jusqu’à 20 demandes par jour et 300 par mois, dans la limite du budget disponible. Les retours écrits sur les cas, l’oral et le recrutement sont aussi limités à 5 par jour et 60 par mois.';
const uses=[
 ['library','Un cours plus clair','Demandez une reformulation simple, un résumé en cinq points ou un exemple expliqué à partir du chapitre.'],
 ['review','Une erreur qui devient un repère','Faites expliquer votre réponse à un QCM et demandez une carte personnelle, à relire et modifier avant de la garder.'],
 ['exams','Un retour sur votre raisonnement','Rédigez votre réponse à un cas ou à un entraînement écrit à l’oral, puis demandez des pistes pour l’améliorer.'],
 ['account','Un entretien mieux préparé','Entraînez-vous par écrit pour un stage, une alternance ou un premier emploi, dans six thématiques de recrutement.'],
];

export function AILimits({id}){return <div className="public-ai-limits" id={id}><strong>IA incluse, usage encadré.</strong><p>{AI_LIMITS_COPY}</p><p>Les réponses restent à vérifier avec le cours et les références. Vos supports enregistrés restent accessibles sans génération IA.</p></div>;}

export default function PublicAI({compact=false,showLimits=true}){
 return <section className={'public-ai-section'+(compact?' public-ai-compact':'')} aria-label="Les aides d’intelligence artificielle incluses">
  <div className="public-ai-heading"><span className="eyebrow">L’INTELLIGENCE ARTIFICIELLE, AU BON MOMENT</span><h2>Un coup de pouce précis.<br/>Pour avancer dans vos révisions.</h2><p>Le cours vous donne les bases. L’IA vous aide à éclaircir un point, comprendre une erreur ou améliorer une réponse. Ces aides sont incluses dans Pro et le Pack Examen, sans option supplémentaire.</p></div>
  <div className="public-ai-grid">{uses.map(([art,title,text])=><article key={title}><img src={'/navigation-3d-v1/'+art+'.webp'} width="64" height="64" alt="" loading="lazy"/><h3>{title}</h3><p>{text}</p></article>)}</div>
  {showLimits&&<AILimits/>}
  {!compact&&<a className="public-ai-link" href="/tarifs">Découvrir les offres avec IA</a>}
 </section>;
}
