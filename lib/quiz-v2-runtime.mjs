// Pure adapter: it does not create questions or answer alternatives. The caller
// supplies the compiled bank after the editorial release gate has passed.
export function quizTypeLabel(question){
 if(question.application)return 'Application chiffrée';
 return {knowledge:'Connaissances',scenario:'Mise en situation',diagnosis:'Analyse',calculation:'Calcul'}[question.questionKind]||'Compréhension';
}
export function applyReviewedQuiz(module,chapter,release){
 const questions=release?.banks?.[module+'/'+chapter.id];if(!questions)return chapter;
 if(release.total!==5000||!release.version||questions.length<22||questions.length>23)throw Error('Incomplete authored quiz release');
 if(chapter.quizRevision===release.version)return chapter;
 const sources=[...(chapter.sources||[]),...questions.flatMap(q=>(q.references||[]).map(r=>[r.title,r.url]))];
 chapter.sources=[...new Map(sources.map(s=>[s[1],s])).values()];
 const retired={...chapter.quizRetired};
 for(const i of chapter.quizIndices||chapter.quiz.map((_,i)=>i))retired[i]='Replaced by independently reviewed quiz bank '+release.version;
 const start=chapter.quiz.length;
 for(const q of questions){
  chapter.quiz.push({title:chapter.title,q:q.q,correct:q.options[q.answer],wrong:q.options.filter((_,i)=>i!==q.answer),body:q.explanation,...(q.optionExplanations?{wrongReasons:q.optionExplanations.filter((_,i)=>i!==q.answer)}:{}),editorialRevision:release.version,editorialId:q.id,sourceConcept:q.basis,questionKind:q.kind,questionLevel:q.difficulty,application:false});
 }
 chapter.quizIndices=questions.map((_,i)=>start+i);chapter.quizRetired=retired;chapter.quizRevision=release.version;
 return chapter;
}
