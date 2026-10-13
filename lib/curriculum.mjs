// Labels follow the programme of the selected session. Topic coverage remains partial.
const d = (id, label, label2026, short, icon, color, desc) => ({ id, label, label2026: label2026 || label, short, icon, color, desc, level: id.startsWith('DSCG') ? 'DSCG' : 'DCG', proOnly: id !== 'UE9' });
export const CURRICULUM = [
  d('UE1','Fondamentaux du droit',null,'Droit','⚖','#376cac','Sources, preuve, personnes, contrats et responsabilité'),
  d('UE2','Droit des affaires','Droit des sociétés et des groupements d’affaires','Droit des affaires','🏛','#7658a9','Formes sociales, décisions, financement et risques'),
  d('UE3','Droit social',null,'Droit social','🤝','#258262','Contrat de travail, exécution et relations collectives'),
  d('UE4','Droit fiscal',null,'Fiscalité','📋','#a47b2e','TVA, résultat fiscal et méthode de déclaration'),
  d('UE5','Économie contemporaine',null,'Économie','◈','#a47b2e','Production, marchés et politiques économiques'),
  d('UE6','Finance d’entreprise',null,'Finance','📈','#b84646','Diagnostic, investissement et financement'),
  d('UE7','Management',null,'Management','◇','#a47b2e','Organisation, stratégie et décisions'),
  d('UE8','Systèmes d’information de gestion',null,'SI de gestion','💻','#7658a9','Données, bases relationnelles et sécurité'),
  d('UE9','Comptabilité',null,'Comptabilité','🔢','#257b9f','Écritures, opérations courantes et clôture'),
  d('UE10','Comptabilité approfondie',null,'Compta approfondie','📊','#ab682e','Actifs, passifs, capitaux propres et analyse'),
  d('UE11','Contrôle de gestion',null,'Contrôle de gestion','◎','#258262','Coûts, seuil de rentabilité et budgets'),
  d('UE12','Anglais des affaires',null,'Anglais','Aa','#a47b2e','Vocabulaire économique, compréhension et rédaction'),
  d('UE13','Communication professionnelle',null,'Communication','✎','#7658a9','Analyse d’une expérience, rapport et soutenance'),
  d('DSCG1','Gestion juridique, fiscale et sociale',null,'Juridique et fiscal','⚖','#376cac','Diagnostic des risques, restructuration et gouvernance'),
  d('DSCG2','Finance',null,'Finance avancée','📈','#b84646','Valorisation, marchés et gestion des risques'),
  d('DSCG3','Contrôle de gestion et stratégie','Management et contrôle de gestion','Stratégie et pilotage','◎','#a47b2e','Performance, budgets, stratégie et changements'),
  d('DSCG4','Comptabilité et audit',null,'Compta et audit','🔍','#257b9f','Consolidation, analyse des normes et démarche d’audit'),
  d('DSCG5','Management des systèmes d’information',null,'Management du SI','💻','#7658a9','Gouvernance, projets, sécurité et qualité des données'),
  d('DSCG6','Anglais des affaires',null,'Anglais oral','Aa','#a47b2e','Analyse de documents et argumentation à l’oral'),
  d('DSCG7','Mémoire professionnel','Mémoire','Mémoire','✎','#7658a9','Problématique, enquête, analyse et soutenance'),
];
export function curriculumFor(programme = '2027') {
  return CURRICULUM.map(x => ({ ...x, label: programme === '2026' ? x.label2026 : x.label }));
}
