// A comparison aid, not an automatic assessment of written reasoning.
export function caseRubric(chapter,question,index=0,points=3,notions=chapter.notions) {
  const calculation=notions?.[index]?.calculation;
  const sentences=question.answer.split(/(?<=[.!?])\s+|;\s+/).map(s=>s.trim()).filter(Boolean);
  const criteria=calculation?[
    {label:'Établir la relation et choisir les données',expected:chapter.practiceSpec.tasks[index].rule},
    {label:'Obtenir le résultat et préciser son unité',expected:question.answer},
    {label:'Justifier le calcul dans les hypothèses du dossier',expected:chapter.practiceSpec.interpretation+' '+chapter.practiceSpec.assumptions}
  ]:sentences.map((expected,i)=>({label:'Élément attendu '+(i+1),expected}));
  const count=Math.min(criteria.length,3,points*2),chosen=criteria.slice(0,count);
  if(criteria.length>count)chosen[count-1]={...chosen[count-1],expected:criteria.slice(count-1).map(c=>c.expected).join(' ')};
  const share=Math.floor(points*2/count)/2;
  return {points,kind:'self-comparison',criteria:chosen.map((c,i)=>({...c,id:'criterion-'+i,points:i===count-1?points-share*(count-1):share})),commonErrors:chapter.pitfalls,method:chapter.method};
}
