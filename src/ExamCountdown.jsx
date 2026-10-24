import { useEffect, useId, useState } from 'react';
import { examStatus } from '../lib/exam-calendar.mjs';

export default function ExamCountdown({ defaultLevel = 'DSCG' }) {
  const [level, setLevel] = useState(defaultLevel);
  const [now, setNow] = useState(Date.now);
  const titleId = useId();
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 15000);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick); };
  }, []);
  const exam = examStatus(level, now);
  const title = exam.phase === 'upcoming' ? 'Votre prochain rendez-vous.' : exam.phase === 'ongoing' ? 'La session est en cours.' : exam.phase === 'finished' ? 'Cap sur la prochaine session.' : 'Votre prochain objectif.';
  return <section className="exam-countdown" aria-labelledby={titleId}>
    <div className="exam-copy">
      <span className="eyebrow">LE CAP À GARDER EN VUE</span>
      <h2 id={titleId}>{title}</h2>
      <p>{exam.phase === 'upcoming' || exam.phase === 'ongoing' ? <>DSCG 2026 · premières épreuves écrites le <time dateTime={exam.startsAt}>20 octobre à 9 h 30</time> (heure de Paris).</> : `${level} ${exam.phase === 'finished' ? exam.year + 1 : exam.year} · calendrier officiel à venir.`}</p>
      <a href={exam.source} target="_blank" rel="noreferrer">Voir le calendrier officiel </a>
      <small>Votre convocation précise la date et l’heure de vos épreuves.</small>
    </div>
    <div className="exam-display">
      <div className="exam-switch" role="group" aria-label="Diplôme du compte à rebours">
        {['DCG', 'DSCG'].map(value => <button key={value} aria-pressed={level === value} onClick={() => setLevel(value)}>{value}</button>)}
      </div>
      {exam.phase === 'upcoming' ? <div className="exam-digits" role="timer" aria-label={`${exam.days} jours, ${exam.hours} heures et ${exam.minutes} minutes avant les premières épreuves écrites du DSCG`}>
        {[[exam.days, 'jours'], [exam.hours, 'heures'], [exam.minutes, 'minutes']].map(([value, label]) => <div key={label}><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>)}
      </div> : <div className="exam-pending"><span aria-hidden="true">✦</span><strong>{exam.phase === 'ongoing' ? 'Bon courage pour vos épreuves !' : 'Le calendrier se prépare.'}</strong><p>{exam.phase === 'ongoing' ? 'Continuez à réviser entre vos épreuves.' : 'La date sera affichée après confirmation officielle.'}</p></div>}
    </div>
  </section>;
}
