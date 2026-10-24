export const FIRST_SESSION_KEY='simdcg-first-session-v1-';
export function firstSessionSubjects(ues,isPro){return isPro?ues:ues.filter(ue=>ue.id==='UE9');}
export function quizResult(questions,choices,{module,name,sessionId,duration=0}){
 if(!questions.length||questions.length!==choices.length||questions.some((q,i)=>!Number.isInteger(choices[i])||choices[i]<0||choices[i]>=q.options.length))throw Error('Répondez à chaque question avant de terminer.');
 const answers=questions.map((q,i)=>({q:q.q,correct:choices[i]===q.answer,right:q.options[q.answer],expl:q.expl,difficulte:q.difficulte,chapter:q.chapter,itemId:q.id,selected:q.options[choices[i]]}));
 return {ue:module,ueName:name,score:answers.filter(a=>a.correct).length,total:questions.length,duration,answers,sessionId};
}
