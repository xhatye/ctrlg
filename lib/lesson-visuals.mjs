// Built only for authenticated lesson responses; never included in the public catalogue.
export function lessonVisuals(c) {
  const concepts=c.notions.map((n,i)=>({id:'concept-'+i,title:n.title,summary:n.correct,detail:n.body}));
  const result={title:c.title,context:c.cas.contexte,concepts,steps:c.cas.questions.map(q=>({title:q.enonce,detail:q.answer}))};
  if(c.practiceSpec) {
    const spec=c.practiceSpec;
    result.assumptions=spec.assumptions;
    result.datasets=[0,1,2].map(index=>{
      const dossier=c.variantAt(index),values=dossier.notions[0].calculation.inputs;
      return {context:dossier.contexte,inputs:Object.entries(spec.inputs).map(([key,p])=>({key,label:p.label,value:values[key],unit:p.unit})),results:spec.tasks.map((t,i)=>({label:t.title,rule:t.rule,value:dossier.notions[i].calculation.result,unit:t.unit}))};
    });
    const models=['diagnostic-fonctionnel','van-deux-periodes','amortissement-prorata','composants-machines','cout-variable-seuil','ecart-matiere','wilson-stocks','portefeuille-deux-actifs'];
    if(models.includes(c.id))result.model=c.id;
  }
  return result;
}
