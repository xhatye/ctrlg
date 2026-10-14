import { learningSteps } from './learning-progress.mjs';

const parisDay = new Intl.DateTimeFormat('sv-SE', { timeZone:'Europe/Paris', year:'numeric', month:'2-digit', day:'2-digit' });
export function dashboardSummary(user, ues, catalogue, learning = {}, now = Date.now()) {
  const ids = new Set(ues.map(ue => ue.id));
  const history = (Array.isArray(user?.history) ? user.history : []).filter(item => item && ids.has(item.ue));
  const quizzes = history.filter(item => item.type === 'qcm' && Number.isInteger(item.total) && item.total > 0
    && Number.isInteger(item.score) && item.score >= 0 && item.score <= item.total);
  const dated = history.filter(item => typeof item.dateISO === 'string' && Number.isFinite(Date.parse(item.dateISO)));
  const latest = [...dated].sort((a,b) => Date.parse(b.dateISO) - Date.parse(a.dateISO))[0] || history.at(-1);
  const day = parisDay.format(now);
  const todayQuestions = quizzes.filter(item => typeof item.dateISO === 'string' && Number.isFinite(Date.parse(item.dateISO))
    && parisDay.format(Date.parse(item.dateISO)) === day).reduce((sum,item) => sum + item.total,0);
  const progress = Object.fromEntries(ues.map(ue => {
    const chapters = catalogue.modules[ue.id]?.chapters || [];
    const states = chapters.map(chapter => learningSteps(learning.chapters?.[ue.id+'/'+chapter.id]));
    const done = states.reduce((sum,state) => sum + state.done,0);
    return [ue.id, { done, total:chapters.length*4, started:states.filter(state => state.started).length,
      completed:states.filter(state => state.done === 4).length, percent:chapters.length ? Math.round(done/(chapters.length*4)*100) : 0 }];
  }));
  return {
    history, latest, progress, todayQuestions,
    average: quizzes.length ? Math.round(quizzes.reduce((sum,item) => sum + item.score/item.total*100,0)/quizzes.length) : null,
    minutes: Math.round(quizzes.reduce((sum,item) => sum + (Number.isFinite(item.duration) && item.duration > 0 ? item.duration : 0),0)/60),
    chaptersStarted: Object.values(progress).reduce((sum,item) => sum + item.started,0),
    streak: Number.isInteger(user?.streak) ? Math.max(0,user.streak) : Math.max(0,Number.isInteger(user?.streak?.count) ? user.streak.count : 0),
  };
}
