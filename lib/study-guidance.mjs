import {learningSteps} from './learning-progress.mjs';

// Read existing progress only. No migrations, account changes or invented level.
export function recommendSession(module,chapters,learning={}) {
 const entries=chapters.map(c=>({...c,p:learning.chapters?.[module+'/'+c.id]||{}}));
 const weak=entries.filter(c=>c.p.quizAttempts>0&&c.p.quizLast<70).sort((a,b)=>a.p.quizLast-b.p.quizLast||a.id.localeCompare(b.id))[0];
 if(weak)return {chapter:weak.id,title:weak.title,target:'resume_cours',format:'sheet',minutes:8,reason:'Votre dernière série sur ce chapitre contient des erreurs. Reprenez la fiche, puis réessayez.',action:'Reprendre ma fiche'};
 const started=entries.filter(c=>learningSteps(c.p).started).sort((a,b)=>String(b.p.lastActivityAt||'').localeCompare(String(a.p.lastActivityAt||'')))[0];
 const c=started||entries[0];if(!c)return null;
 const step=learningSteps(c.p).steps.indexOf(false);
 return {chapter:c.id,title:c.title,target:['resume_cours','qcm','flashcards','cas_pratique'][step<0?2:step],minutes:[12,7,5,20][step<0?2:step],reason:started?'La prochaine étape de votre chapitre en cours.':'Commencez par les repères du premier chapitre, puis mettez-les en pratique.',action:['Comprendre la notion','Faire un QCM','Réviser mes cartes','Travailler un cas'][step<0?2:step]};
}
export function themeProgress(chapters,learning={},module){
 const groups=new Map();
 for(const c of chapters){const b=c.block||{id:c.id,title:c.title};const g=groups.get(b.id)||{id:b.id,title:b.title,answered:0,chapters:0,evaluated:0,last:[],needsReview:[]};const p=learning.chapters?.[module+'/'+c.id]||{};g.chapters++;g.answered+=p.questionsAnswered||0;
  // Scores are chapter-session aggregates, not individual-question estimates.
  if(p.questionsAnswered>=4&&p.quizAttempts){g.evaluated++;g.last.push(p.quizLast);if(p.quizLast<70)g.needsReview.push(c.id);}
  groups.set(b.id,g);
 }
 return [...groups.values()].map(g=>({...g,average:g.last.length?Math.round(g.last.reduce((a,b)=>a+b,0)/g.last.length):null}));
}
export function diagnosticSummary(questions,answers,chapters){
 const groups=new Map();for(const [i,q] of questions.entries()){const chapter=chapters.find(c=>c.id===q.chapter);const key=chapter?.block?.id||q.chapter;const g=groups.get(key)||{id:key,title:chapter?.block?.title||chapter?.title||'Notions de l’UE',total:0,correct:0,chapter:q.chapter};g.total++;if(answers[i]?.correct)g.correct++;else g.chapter=q.chapter;groups.set(key,g);}
 return [...groups.values()].map(g=>({...g,status:g.correct<g.total?'À retravailler':'À confirmer'}));
}
