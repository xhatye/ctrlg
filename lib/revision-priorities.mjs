// Suggestions are drawn from recorded work, never presented as a diagnosis or mastery score.
export function revisionPriorities(catalogue,learning={},allowedIds){
 const results=[];
 for(const [module,bank]of Object.entries(catalogue)){
  if(allowedIds&&!allowedIds.includes(module))continue;
  for(const chapter of bank.chapters){
   const p=learning.chapters?.[module+'/'+chapter.id];if(!p)continue;
   let reason,tool,priority;
   if(p.quizAttempts>0&&Number.isFinite(p.quizLast)&&p.quizLast<80){reason='Votre dernière série comporte des réponses à reprendre.';tool='qcm';priority=4;}
   else if(p.cardsReviewed>0&&p.cardsKnown/p.cardsReviewed<.7){reason='Plusieurs cartes ont été déclarées difficiles.';tool='flashcards';priority=3;}
   else if(p.lessonRead&&!p.quizAttempts){reason='Le chapitre a été lu ; vérifiez maintenant ce que vous retrouvez sans aide.';tool='qcm';priority=2;}
   else if(p.quizAttempts>0&&!p.caseCompared){reason='Passez des questions courtes à un dossier argumenté.';tool='cas-pratique';priority=1;}
   if(reason)results.push({module,chapter:chapter.id,title:chapter.title,reason,tool,priority});
  }
 }
 return results.sort((a,b)=>b.priority-a.priority||a.module.localeCompare(b.module)||a.chapter.localeCompare(b.chapter)).slice(0,5);
}
export function adaptiveMinutes(sessions,priorities){
 if(!sessions.length)return [];
 const total=sessions.reduce((n,s)=>n+s.minutes,0),weighted=sessions.map(s=>({...s,weight:1+(priorities.some(p=>p.module===s.id)?1:0)})),weight=weighted.reduce((n,s)=>n+s.weight,0);
 const allocations=weighted.map(s=>({id:s.id,minutes:Math.floor(total*s.weight/weight)}));
 for(let i=0,left=total-allocations.reduce((n,s)=>n+s.minutes,0);i<left;i++)allocations[i%allocations.length].minutes++;
 return allocations;
}
