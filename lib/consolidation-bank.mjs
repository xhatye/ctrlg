// Retrieval activities built from the chapter's authored rules and misconceptions.
// They add new tasks, not new syllabus coverage or extra numerical permutations.
const unique=values=>[...new Set(values)];
const quiz=(title,q,correct,wrong,body,wrongReasons)=>({title,q,correct,wrong,body,wrongReasons,application:false,activity:'Consolidation'});
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const addUnique=(items,additions)=>{const seen=new Set(items.map(x=>normalize(x.q)));for(const item of additions)if(!seen.has(normalize(item.q))){items.push(item);seen.add(normalize(item.q));}};
function choices(correct,wrong,offset){const values=[correct,...wrong],answer=offset%values.length;return {type:'choice',options:[...values.slice(values.length-answer),...values.slice(0,values.length-answer)],answer};}
export function addConsolidation(c){
 const points=c.notions,questions=[],cards=[];
 for(const [i,n] of points.entries()){
  const others=points.filter((_,j)=>i!==j);
  const comments=unique(others.map(o=>o.body)).filter(s=>s!==n.body).slice(0,3);
  if(comments.length===3)questions.push(quiz(n.title,
   `Analyse d’une erreur : ${c.title}.\nQuestion de départ : ${n.q}\nUn élève retient « ${n.wrong[0]} ». Quel commentaire du cours permet de rectifier précisément cette réponse ?`,
   n.body,comments,`La proposition « ${n.wrong[0]} » ne répond pas correctement à la question. ${n.body} La réponse attendue est : ${n.correct}`,
   comments.map(comment=>{const other=others.find(o=>o.body===comment);return `Ce commentaire concerne « ${other.title} ». Pour rectifier la réponse donnée ici, il faut revenir au repère « ${n.title} » et aux données de la question.`;})));
  const trueStatements=unique([n,...others].map(p=>`${p.title} : ${p.correct}`)).slice(0,3);
  if(trueStatements.length===3)questions.push(quiz(n.title,
   `${c.variantAt?'Dossier de référence : '+c.cas.contexte+'\n':''}Contrôle du repère « ${n.title} » et des notions voisines dans « ${c.title} » : quelle affirmation contredit le cours ?`,
   `${n.title} : ${n.wrong[1]}`,trueStatements,`L’affirmation à écarter est « ${n.wrong[1]} ». Pour le repère « ${n.title} », il faut retenir : ${n.correct} ${n.body}`,
   trueStatements.map(s=>`Cette affirmation est cohérente avec les repères du cours. La question demande de repérer l’affirmation erronée, pas de sélectionner une règle correcte. Repère : ${s}`)));
  const next=points[(i+1)%points.length];
  questions.push(quiz(n.title+' et '+next.title,
   `${c.variantAt?'Dossier de référence : '+c.cas.contexte+'\n':''}Relier deux notions de « ${c.title} » : quelle association respecte à la fois « ${n.title} » et « ${next.title} » ?`,
   `${n.title} : ${n.correct}\n${next.title} : ${next.correct}`,
   [`${n.title} : ${n.wrong[0]}\n${next.title} : ${next.correct}`,`${n.title} : ${n.correct}\n${next.title} : ${next.wrong[0]}`,`${n.title} : ${n.wrong[1]}\n${next.title} : ${next.wrong[1]}`],
   `Les deux repères doivent être corrects simultanément. ${n.title} : ${n.body}\n${next.title} : ${next.body}`,
   [`La première partie contredit le repère « ${n.title} ». ${n.body}`,`La seconde partie contredit le repère « ${next.title} ». ${next.body}`,`Les deux parties sont à reprendre. ${n.correct} ${next.correct}`]));
  cards.push({q:`Corrigez cette réponse dans « ${c.title} » :\n${n.q}\n« ${n.wrong[2]} »`,a:n.correct,example:n.body,pitfall:`Ne pas retenir : ${n.wrong[2]}`,tag:c.title});
 }
 for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
  const a=points[i],b=points[j];
  cards.push({q:`Deux repères à distinguer dans « ${c.title} » : que faut-il retenir séparément pour « ${a.title} » et « ${b.title} » ?`,a:`${a.title} : ${c.practiceSpec?.tasks[i].rule || a.correct}\n${b.title} : ${c.practiceSpec?.tasks[j].rule || b.correct}`,example:`${c.variantAt?c.cas.contexte+'\n':''}${a.body}\n${b.body}`,pitfall:'Une réponse correcte pour la première notion ne suffit pas à expliquer la seconde.',tag:c.title});
 }
 addUnique(c.quiz,questions);addUnique(c.cards,cards);
 const selected=points.slice(0,2);
 const correctionCase={
  titre:c.title+' : analyser une copie',format:'Atelier de relecture',
  contexte:`Atelier original de relecture guidée. Deux réponses d’une copie portent sur « ${c.title} ». Les affirmations de l’élève sont à contrôler et ne constituent pas des règles à apprendre.\n\n`+selected.map((n,i)=>`Extrait ${i+1}. Question : ${n.q}\nRéponse proposée par l’élève : « ${n.wrong[i]} ».`).join('\n\n'),
  duree_estimee:'10 à 15 min',difficulte:'Consolidation',
  questions:[...selected.map((n,i)=>({num:i+1,enonce:`Rectifiez l’extrait ${i+1}, puis justifiez la correction à partir du repère « ${n.title} ».`,answer:n.correct+' '+n.body,guide:choices(n.correct,n.wrong,i+1)})),
   {num:3,enonce:'Quelle démarche permet de contrôler les deux réponses avant de conclure ?',answer:c.method,guide:choices(c.method,['Valider les deux réponses parce qu’elles figurent dans une copie.','Conserver les résultats sans contrôler les données ni les notions.','Remplacer les éléments manquants par une hypothèse non annoncée.'],2)}],
 };
 const index=c.variantAt?c.caseCount:c.cases.length;
 c.caseWorkshops=[{variant:index,title:correctionCase.titre,format:correctionCase.format}];
 if(c.variantAt)c.extraCases=[correctionCase];
 else{c.cases.push(correctionCase);c.modelCount=(c.modelCount || 1)+1;}
 return c;
}
