export const chapterKey=(module,chapter)=>module+'/'+chapter;
export function normalizeEvents(events,catalogue){
 const invalid=()=>{throw Object.assign(new Error('Activité de progression invalide.'),{status:400});};
 if(!Array.isArray(events)||!events.length||events.length>20)invalid();
 const ids=new Set();
 return events.map(e=>{
  if(!e||Array.isArray(e)||typeof e.module!=='string'||typeof e.chapter!=='string'||typeof e.id!=='string'||!/^[a-zA-Z0-9_-]{8,80}$/.test(e.id)||ids.has(e.id))invalid();ids.add(e.id);
  const m=Object.hasOwn(catalogue,e.module)?catalogue[e.module]:null;
  const c=m?.chapters.find(c=>c.id===e.chapter);if(!c||!['lesson','quiz','cards','case'].includes(e.type))invalid();
  const result={id:e.id,module:e.module,chapter:e.chapter,type:e.type};
  if(e.type==='quiz'){
   if(!Number.isInteger(e.total)||e.total<1||e.total>20||!Number.isInteger(e.correct)||e.correct<0||e.correct>e.total)invalid();
   result.total=e.total;result.correct=e.correct;
  }
  if(e.type==='cards'){
   if(!Number.isInteger(e.reviewed)||e.reviewed<1||e.reviewed>100||!Number.isInteger(e.known)||e.known<0||e.known>e.reviewed)invalid();
   result.reviewed=e.reviewed;result.known=e.known;
  }
  if(e.type==='case'){if(!Number.isInteger(e.variant)||e.variant<0||e.variant>=c.caseCount)invalid();result.variant=e.variant;}
  return result;
 });
}
export function applyLearningEvent(progress,event,now){
 const next={version:1,chapters:{...(progress.chapters || {})},updatedAt:new Date(now).toISOString()};
 const key=chapterKey(event.module,event.chapter),old=next.chapters[key] || {};
 const c={...old,lastActivityAt:next.updatedAt};
 if(event.type==='lesson'){c.lessonRead=true;c.lessonReads=(c.lessonReads || 0)+1;}
 if(event.type==='quiz'){
  const pct=Math.round(event.correct/event.total*100);
  c.quizAttempts=(c.quizAttempts || 0)+1;c.quizLast=pct;c.questionsAnswered=(c.questionsAnswered || 0)+event.total;
  c.quizBest=Math.max(c.quizBest || 0,pct);
  // Qualification deliberately requires >=4 questions; a 1/1 mixed-chapter
  // fragment is recorded but does not fulfil the quiz step.
  if(event.total>=4)c.qualifyingQuizBest=Math.max(c.qualifyingQuizBest || 0,pct);
 }
 if(event.type==='cards'){c.cardsReviewed=(c.cardsReviewed || 0)+event.reviewed;c.cardsKnown=(c.cardsKnown || 0)+event.known;c.cardSessions=(c.cardSessions || 0)+1;}
 if(event.type==='case'){c.caseCompared=true;c.caseSessions=(c.caseSessions || 0)+1;c.lastCaseVariant=event.variant;}
 next.chapters[key]=c;return next;
}
export function learningSteps(c={}){
 const steps=[Boolean(c.lessonRead),(c.qualifyingQuizBest || 0)>=80,(c.cardsReviewed || 0)>=4,Boolean(c.caseCompared)];
 return {steps,done:steps.filter(Boolean).length,total:4};
}
