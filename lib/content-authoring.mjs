export const VERIFIED_AT = '2026-10-13';
export const PROGRAM_SOURCE = ['Programmes officiels DCG et DSCG', 'https://www.enseignementsup-recherche.gouv.fr/fr/bo/2025/Hebdo32/MENS2523324A'];
export const PREVIOUS_PROGRAM_SOURCE = ['Programmes applicables à la session 2026', 'https://www.enseignementsup-recherche.gouv.fr/fr/bo/19/Hebdo26/ESRS1900135A.htm'];
// All lesson prose and exercises in this library are original SIMDCG material.
// External resources are references, not copied course texts or imported dumps.
export const SOURCES = {
  pcg: ['Plan comptable général 2026, ANC', 'https://www.anc.gouv.fr/plan-comptable-general-0'],
  civil: ['Code civil, Légifrance', 'https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070721/'],
  company: ['SARL, Service Public Entreprendre', 'https://entreprendre.service-public.gouv.fr/vosdroits/F37411'],
  work: ['CDD, Service Public', 'https://www.service-public.gouv.fr/particuliers/vosdroits/F36'],
  tax: ['Charges déductibles, Service Public Entreprendre', 'https://entreprendre.service-public.gouv.fr/vosdroits/F31973'],
  vat: ['Déduction de TVA, DGFiP', 'https://www.impots.gouv.fr/professionnel/questions/comment-deduire-la-tva-sur-mes-achats'],
  bofip: ['BOFiP, doctrine fiscale de la DGFiP', 'https://bofip.impots.gouv.fr/'],
  economy: ['PIB et composantes, Insee', 'https://www.insee.fr/fr/statistiques/8334266'],
  monetary: ['Transmission de la politique monétaire, Banque de France', 'https://www.banque-france.fr/fr/publications-et-statistiques/publications/la-transmission-de-la-politique-monetaire'],
  finance: ['Rendement et risque, AMF', 'https://www.amf-france.org/fr/espace-epargnants/savoir-bien-investir/cadrer-son-projet/rendement-et-risque-deux-inseparables'],
  diversification: ['Diversification, AMF', 'https://www.amf-france.org/fr/diversification'],
  privacy: ['Minimisation, CNIL', 'https://www.cnil.fr/fr/definition/minimisation'],
  cyber: ['Guide d’hygiène informatique, ANSSI', 'https://messervices.cyber.gouv.fr/guides/guide-dhygiene-informatique'],
};

export function notion(title, body, q, correct, ...wrong) {
  return { title, body, q, correct, wrong };
}
export function chapter(id, title, intro, method, pitfalls, notions, scenario, questions, sources = []) {
  return {
    id, title, intro, method, pitfalls, notions,
    sources: [PROGRAM_SOURCE, PREVIOUS_PROGRAM_SOURCE, ...sources],
    verifiedAt: VERIFIED_AT,
    review: 'Relecture éditoriale et contrôles automatisés. Validation indépendante par un enseignant non réalisée.',
    rights: 'Texte et exercices originaux SIMDCG. Références externes consultables auprès de leurs éditeurs.',
    programmes: ['2026', '2027'],
    cas: {
      titre: title + ' : mise en pratique', contexte: scenario,
      questions: questions.map(([enonce, answer], i) => ({ num: i + 1, enonce, answer })),
      duree_estimee: '20 à 30 min', difficulte: 'Progressif',
    },
  };
}
