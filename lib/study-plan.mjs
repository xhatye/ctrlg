const stages = [
  'Lire les repères et reformuler les notions.',
  'Tester les notions avec les QCM et expliquer les erreurs.',
  'Revoir les cartes difficiles puis travailler le cas pratique.',
];

export function validatePlanConfig(ues, config) {
  const { level, weeks, hours, selectedIds } = config || {};
  if (!['DCG', 'DSCG'].includes(level) || !Number.isInteger(weeks) || weeks < 2 || weeks > 12
    || !Number.isInteger(hours) || hours < 1 || hours > 20
    || !Array.isArray(selectedIds) || !selectedIds.length || selectedIds.length > ues.length
    || new Set(selectedIds).size !== selectedIds.length
    || selectedIds.some(id => !ues.some(ue => ue.id === id && ue.level === level))) {
    throw new Error('Choisissez au moins une UE et des paramètres de planning valides.');
  }
  return { level, weeks, hours, selectedIds: [...selectedIds] };
}

export function buildPlan(ues, weeks, level, hours, selectedIds) {
  const config = validatePlanConfig(ues, { weeks, level, hours, selectedIds });
  const selected = ues.filter(ue => config.selectedIds.includes(ue.id));
  const minutes = hours * 60;
  return Array.from({ length: weeks }, (_, i) => ({
    num: i + 1,
    subjects: selected,
    sessions: selected.map((ue, j) => ({
      id: ue.id,
      minutes: Math.floor(minutes / selected.length) + (j < minutes % selected.length ? 1 : 0),
    })),
    task: weeks === 2
      ? (i === 0 ? 'Lire les repères puis tester les notions avec les QCM.' : stages[2])
      : stages[Math.min(2, Math.floor(i * 3 / weeks))],
    hours,
  }));
}

// Restore old schedules from their actual subjects, never expand them to a whole diploma.
export function restorePlan(ues, saved) {
  let config;
  if (Array.isArray(saved)) {
    if (saved.length < 2 || saved.length > 12 || saved.some((week, i) =>
      !week || week.num !== i + 1 || !Array.isArray(week.subjects) || !week.subjects.length
      || week.hours !== saved[0].hours || week.subjects.some(ue => !ue || typeof ue.id !== 'string'))) {
      throw new Error('Ancien planning invalide.');
    }
    const selectedIds = [...new Set(saved.flatMap(week => week.subjects.map(ue => ue.id)))];
    const level = ues.find(ue => ue.id === selectedIds[0])?.level;
    config = validatePlanConfig(ues, { level, weeks: saved.length, hours: saved[0].hours, selectedIds });
  } else {
    if (saved?.version !== 2) throw new Error('Planning invalide.');
    config = validatePlanConfig(ues, saved.config);
  }
  return { config, plan: buildPlan(ues, config.weeks, config.level, config.hours, config.selectedIds) };
}
