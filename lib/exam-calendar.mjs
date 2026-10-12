// Dates confirmed by the SIEC and the Bulletin officiel, session 2026.
// Do not extrapolate annual exam dates. Add a future session only after publication.
export const EXAM_CALENDAR = {
  DCG: { year: 2027, startsAt: null, source: 'https://siec.education.fr/candidats/agenda/examens/DCG' },
  DSCG: {
    year: 2026,
    startsAt: '2026-10-20T09:30:00+02:00',
    writtenEndsAt: '2026-10-22T18:00:00+02:00',
    source: 'https://siec.education.fr/candidats/agenda/dscg-calendrier-des-epreuves-session-2026',
  },
};

export function examStatus(level, now = Date.now()) {
  const exam = EXAM_CALENDAR[level] || EXAM_CALENDAR.DCG;
  const start = Date.parse(exam.startsAt), end = Date.parse(exam.writtenEndsAt);
  if (!Number.isFinite(start)) return { ...exam, phase: 'pending' };
  if (now >= start) return { ...exam, phase: now <= end ? 'ongoing' : 'finished' };
  const minutes = Math.max(1, Math.ceil((start - now) / 60000));
  return { ...exam, phase: 'upcoming', days: Math.floor(minutes / 1440), hours: Math.floor(minutes / 60) % 24, minutes: minutes % 60 };
}
