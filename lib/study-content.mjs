import {chapterBlock} from './chapter-blocks.mjs';
import {attachEditorial} from './editorial-pilots.mjs';
import {WORKBENCH_COURSES} from './workbench-courses.mjs';
import {WORKBENCH_DCG} from './workbench-courses-dcg.mjs';
import {WORKBENCH_DSCG} from './workbench-courses-dscg.mjs';
import {readingFormats,publicCloze,chapterCloze,readingWordCount,FORMATS_VERSION} from './chapter-formats.mjs';
import {SYNTHESIS_COURSES} from './synthesis-courses.mjs';
import {lessonVisuals} from './lesson-visuals.mjs';
import {caseRubric} from './case-rubric.mjs';
import { LAW_CHAPTERS } from './content-law.mjs';
import { ACCOUNTING_CHAPTERS } from './content-accounting.mjs';
import { MANAGEMENT_CHAPTERS } from './content-management.mjs';
import { SYSTEM_CHAPTERS } from './content-systems.mjs';
import { COMMUNICATION_CHAPTERS } from './content-communication.mjs';
import { DEEPENING_CHAPTERS } from './content-deepening.mjs';
import { buildPracticeChapters } from './practice-engine.mjs';
import { ACCOUNTING_PRACTICE } from './practice-accounting.mjs';
import { FINANCE_PRACTICE } from './practice-finance.mjs';
import { MANAGEMENT_PRACTICE } from './practice-management.mjs';
import { DATA_PRACTICE } from './practice-data.mjs';
import { chapterQuestionCount, chapterCaseCount, curatedQuestionCount, chapterCardCount, cardPool, questionPool, sampleQuestions } from './question-pool.mjs';
import {deepenChapter} from './lesson-depth.mjs';
import {SUBJECT_PEDAGOGY} from './subject-pedagogy.mjs';
import {enrichSubjectChapter} from './subject-workshops.mjs';
import {addConsolidation} from './consolidation-bank.mjs';
import {editQuiz} from './quiz-editorial.mjs';
import {quizTypeLabel,applyReviewedQuiz} from './quiz-v2-runtime.mjs';
import {QUIZ_V2} from './quiz-v2-data.mjs';
import { LEGAL_COURSES } from './courses-legal.mjs';
import { BUSINESS_COURSES } from './courses-business.mjs';
import { ACCOUNTING_COURSES } from './courses-accounting.mjs';
import { ADVANCED_COURSES } from './courses-advanced.mjs';
import { COMMUNICATION_COURSES } from './courses-communication.mjs';
import { CURRICULUM } from './curriculum.mjs';
import { VERIFIED_AT, PROGRAM_SOURCE, PREVIOUS_PROGRAM_SOURCE } from './content-authoring.mjs';
// Original exercises, not official past papers or a full syllabus.
// Keep this bank server-side; production clients receive only permitted modules.
const pcg = [
  "Plan comptable général — ANC",
  "https://www.anc.gouv.fr/plan-comptable-general-0",
];
const civil = [
  "Code civil, article 1103",
  "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032040777",
];
const liability = [
  "Code civil, article 1240",
  "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032041571",
];
const company = [
  "SARL — Service Public",
  "https://entreprendre.service-public.gouv.fr/vosdroits/F37411",
];
const work = [
  "Salarié et indépendant — Service Public",
  "https://entreprendre.service-public.gouv.fr/vosdroits/F1691",
];
const vat = [
  "Déduction de TVA — DGFiP",
  "https://www.impots.gouv.fr/professionnel/questions/comment-deduire-la-tva-sur-mes-achats",
];
const privacy = [
  "Minimisation — CNIL",
  "https://www.cnil.fr/fr/definition/minimisation",
];
const audit = [
  "Normes internationales d’audit — IAASB",
  "https://www.iaasb.org/standards-pronouncements",
];
const impairment = [
  "IAS 36 — IFRS Foundation",
  "https://www.ifrs.org/projects/completed-projects/2013/recoverable-amount-disclosures-for-non-financial-assets/",
];
// Each concept: title, explanation, question, correct answer, three distractors.
const n = (title, body, q, correct, ...wrong) => ({
  title,
  body,
  q,
  correct,
  wrong,
});
const c = (titre, contexte, questions) => ({
  titre,
  contexte,
  questions: questions.map(([enonce, answer], i) => ({
    num: i + 1,
    enonce,
    answer,
  })),
  duree_estimee: "20 à 30 min",
  difficulte: "Fondamentaux",
});
const STARTER_MODULES = {
  UE1: {
    title: "Contrat et responsabilité",
    sources: [civil, liability],
    notions: [
      n(
        "Force obligatoire",
        "Un contrat valablement formé engage les parties. Pour un cas, commencez par qualifier la relation, puis recherchez les obligations applicables et les faits qui établissent leur exécution ou leur inexécution.",
        "Un contrat légalement formé produit quel effet entre les parties ?",
        "Il les oblige à respecter leurs engagements.",
        "Il autorise toute modification unilatérale.",
        "Il exclut toujours la responsabilité.",
        "Il s’applique uniquement aux contrats écrits.",
      ),
      n(
        "Responsabilité pour faute",
        "Dans un raisonnement de responsabilité extracontractuelle pour faute, établissez une faute, un dommage et un lien causal. Le montant d’une réparation se justifie par les préjudices démontrés.",
        "Quel ensemble faut-il établir dans une responsabilité extracontractuelle pour faute ?",
        "Une faute, un dommage et un lien de causalité.",
        "Un contrat, un bénéfice et une facture.",
        "Un dommage uniquement.",
        "Une intention de nuire dans tous les cas.",
      ),
      n(
        "Qualification juridique",
        "Qualifier consiste à traduire les faits dans des catégories juridiques avant de choisir la règle. Une conclusion sans qualification et sans application aux faits ne suffit pas.",
        "Quelle étape précède l’application d’une règle aux faits ?",
        "La qualification juridique des faits.",
        "Le calcul systématique d’une pénalité.",
        "La copie intégrale de l’énoncé.",
        "La conclusion sans justification.",
      ),
      n(
        "Méthode du cas",
        "Organisez la réponse : faits pertinents, problème juridique, règle, application et conclusion. Écartez les faits sans lien avec le problème.",
        "Quelle réponse est la mieux structurée ?",
        "Règle applicable, application aux faits, conclusion motivée.",
        "Une opinion personnelle seule.",
        "Une liste d’articles sans application.",
        "Une conclusion suivie de faits inventés.",
      ),
    ],
    cas: c(
      "Un meuble endommagé",
      "Pendant une visite, Lina bouscule imprudemment une étagère appartenant à Paul. Un meuble est cassé. Paul justifie 300 € de frais de réparation. On raisonne uniquement sur la responsabilité extracontractuelle pour faute, sans cause d’exonération.",
      [
        [
          "Qualifiez la situation.",
          "Dommage matériel causé à autrui hors relation contractuelle : responsabilité extracontractuelle pour faute.",
        ],
        [
          "Appliquez les trois conditions aux faits.",
          "L’imprudence de Lina est la faute, la détérioration est le dommage et le choc explique directement la détérioration.",
        ],
        [
          "Formulez une conclusion motivée.",
          "Sous les hypothèses de l’énoncé, les conditions sont réunies. Les 300 € de frais justifiés peuvent fonder la réparation du dommage matériel ; aucun préjudice supplémentaire ne doit être inventé.",
        ],
      ],
    ),
  },
  UE2: {
    title: "Société et gouvernance",
    sources: [company],
    notions: [
      n(
        "Associé et dirigeant",
        "L’associé détient des droits sociaux ; le dirigeant assure une fonction de gestion et de représentation. Une même personne peut cumuler ces qualités, mais elles ne se confondent pas.",
        "Un associé est-il nécessairement le dirigeant ?",
        "Non, les deux qualités sont distinctes.",
        "Oui, dans toute société.",
        "Oui, dès qu’il reçoit un dividende.",
        "Non, un associé ne peut jamais diriger.",
      ),
      n(
        "Apports et chiffre d’affaires",
        "Le capital correspond aux apports retenus pour sa formation. Le chiffre d’affaires correspond aux ventes et prestations de l’activité. Un apport n’est pas une vente.",
        "Un apport en numéraire constitue-t-il du chiffre d’affaires ?",
        "Non, il finance la société par un apport.",
        "Oui, car il augmente la banque.",
        "Oui, s’il est versé par un associé.",
        "Oui, mais seulement en SARL.",
      ),
      n(
        "Statuts",
        "Les statuts organisent le fonctionnement de la société dans les limites des règles applicables à sa forme. Il faut identifier la forme sociale avant d’étudier la décision et l’organe compétent.",
        "Quel document organise le fonctionnement d’une société ?",
        "Les statuts, dans le cadre légal applicable.",
        "Une facture fournisseur.",
        "Le bulletin de paie d’un associé.",
        "Le relevé bancaire uniquement.",
      ),
      n(
        "Personne morale",
        "Une société dotée de personnalité morale est juridiquement distincte de ses associés. Les conséquences exactes sur leur responsabilité dépendent notamment de la forme et des garanties consenties.",
        "Pourquoi séparer société et associé dans le raisonnement ?",
        "Ce sont des sujets de droit distincts lorsque la société a la personnalité morale.",
        "Leur patrimoine est toujours identique.",
        "L’associé est systématiquement salarié.",
        "La société ne peut jamais avoir de dettes.",
      ),
    ],
    cas: c(
      "Création d’une SARL",
      "Deux associés apportent respectivement 6 000 € et 4 000 € en numéraire à une SARL. La première est nommée gérante. La société réalise ensuite 12 000 € de ventes. Aucun autre apport ni vente n’est mentionné.",
      [
        [
          "Calculez le capital issu de ces apports.",
          "6 000 + 4 000 = 10 000 €.",
        ],
        [
          "Distinguez les qualités des deux personnes.",
          "Les deux sont associées ; seule la première est gérante selon l’énoncé. Détenir des parts ne donne pas automatiquement la fonction de gérant.",
        ],
        [
          "Distinguez capital et chiffre d’affaires.",
          "Capital : 10 000 €. Chiffre d’affaires : 12 000 €. Les apports ne s’ajoutent pas aux ventes pour calculer le chiffre d’affaires.",
        ],
      ],
    ),
  },
  UE3: {
    title: "Relation de travail",
    sources: [work],
    notions: [
      n(
        "Subordination",
        "La qualification dépend des conditions réelles d’activité. Donner des directives, contrôler leur exécution et pouvoir sanctionner sont des indices centraux de subordination.",
        "Quel indice est central pour caractériser la subordination ?",
        "Le pouvoir de donner des directives, contrôler et sanctionner.",
        "La seule possession d’un ordinateur.",
        "Le seul paiement d’une facture.",
        "La seule ancienneté de la relation.",
      ),
      n(
        "Qualification réelle",
        "Le nom donné à un contrat ne suffit pas à déterminer la relation. Il faut examiner concrètement l’autonomie et les pouvoirs exercés par le donneur d’ordre.",
        "L’intitulé « prestataire » suffit-il à exclure le salariat ?",
        "Non, il faut examiner les conditions réelles.",
        "Oui, sans autre examen.",
        "Oui, si le contrat comporte une signature.",
        "Oui, si le travail est à distance.",
      ),
      n(
        "Rémunération brute et nette",
        "Le brut et le net ne sont pas interchangeables. Pour un exercice, utilisez les retenues fournies : les taux ne doivent pas être supposés.",
        "Un salaire brut de 2 000 € avec 440 € de retenues donne quel net avant impôt, sous ces seules hypothèses ?",
        "1 560 €.",
        "2 440 €.",
        "440 €.",
        "2 000 €.",
      ),
      n(
        "Analyse des faits",
        "Pour comparer autonomie et subordination, relevez les faits observables : horaires imposés, contrôle, sanction, organisation de la mission. Une conclusion doit rester proportionnée aux éléments fournis.",
        "Quel élément est le plus utile pour qualifier une relation ?",
        "Les conditions concrètes d’exécution de la mission.",
        "La couleur du logo de l’entreprise.",
        "Le secteur seul.",
        "Le montant du capital seul.",
      ),
    ],
    cas: c(
      "Une prestation très encadrée",
      "Une personne facture chaque mois une entreprise. Celle-ci lui impose les horaires, contrôle quotidiennement son travail et peut sanctionner ses manquements. On ne dispose pas d’autres faits.",
      [
        [
          "Relevez les indices pertinents.",
          "Horaires imposés, contrôle de l’exécution et pouvoir de sanction : ces faits indiquent un lien de subordination.",
        ],
        [
          "L’émission de factures règle-t-elle la qualification ?",
          "Non. L’étiquette commerciale et la facturation ne suffisent pas à exclure une relation de travail subordonnée.",
        ],
        [
          "Concluez sans dépasser les faits.",
          "Les indices décrits peuvent soutenir une qualification de salariat. Il faut examiner l’ensemble des conditions réelles ; on ne déduit pas automatiquement les montants de cotisations ou d’indemnités.",
        ],
      ],
    ),
  },
  UE4: {
    title: "Calculs de TVA",
    sources: [vat],
    notions: [
      n(
        "HT et TTC",
        "Avec un taux expressément fourni, TVA = base HT × taux ; TTC = HT + TVA. Pour retrouver le HT depuis le TTC, divisez par 1 + taux.",
        "Pour 1 000 € HT au taux de 20 % donné par l’énoncé, quel est le TTC ?",
        "1 200 €.",
        "800 €.",
        "1 020 €.",
        "5 000 €.",
      ),
      n(
        "TVA à payer",
        "Sous réserve des conditions de déduction et des régularisations applicables, la TVA nette est la TVA collectée diminuée de la TVA déductible.",
        "Avec 800 € collectés et 300 € déductibles, quelle TVA nette faut-il payer ?",
        "500 €.",
        "1 100 €.",
        "300 €.",
        "800 €.",
      ),
      n(
        "Crédit de TVA",
        "Si la TVA déductible dépasse la TVA collectée, la différence forme un crédit. Son remboursement éventuel suit des conditions ; il n’est pas automatiquement de la trésorerie reçue.",
        "Avec 200 € collectés et 350 € déductibles, quelle est la situation ?",
        "Un crédit de TVA de 150 €.",
        "Une TVA à payer de 550 €.",
        "Une TVA à payer de 150 €.",
        "Un crédit de 350 €.",
      ),
      n(
        "Déduction conditionnelle",
        "Toute TVA figurant sur une dépense n’est pas automatiquement déductible. Il faut contrôler l’opération, les justificatifs, l’usage et les conditions de période.",
        "La TVA sur un achat est-elle toujours déductible ?",
        "Non, la déduction est soumise à des conditions.",
        "Oui, si le paiement est en espèces.",
        "Oui, dès qu’il y a une dépense.",
        "Oui, sans justificatif.",
      ),
    ],
    cas: c(
      "La déclaration du mois",
      "Pour cet exercice simplifié, toutes les opérations sont exigibles et déductibles sur le même mois, sans restriction ni régularisation. Ventes : 8 000 € HT. Achats : 3 000 € HT. Le taux fourni est de 20 %.",
      [
        ["Calculez la TVA collectée.", "8 000 × 20 % = 1 600 €."],
        [
          "Calculez la TVA déductible sous les hypothèses données.",
          "3 000 × 20 % = 600 €.",
        ],
        [
          "Calculez le montant net et expliquez son sens.",
          "1 600 − 600 = 1 000 € de TVA à payer. La TVA nette n’est ni le chiffre d’affaires ni le bénéfice.",
        ],
      ],
    ),
  },
  UE6: {
    title: "Équilibre financier et investissement",
    sources: [],
    notions: [
      n(
        "Besoin en fonds de roulement",
        "Dans un exercice simplifié d’exploitation : BFR = stocks + créances d’exploitation − dettes d’exploitation. Le BFR mesure un décalage de financement, pas un bénéfice.",
        "Stocks 40, clients 60, fournisseurs 35 : quel BFR simplifié ?",
        "65.",
        "135.",
        "25.",
        "−65.",
      ),
      n(
        "Trésorerie nette",
        "Dans l’analyse fonctionnelle : trésorerie nette = fonds de roulement net global − besoin en fonds de roulement. Les grandeurs doivent provenir du même cadre de calcul.",
        "FRNG 90 et BFR 65 : quelle trésorerie nette ?",
        "25.",
        "155.",
        "65.",
        "−25.",
      ),
      n(
        "Actualisation",
        "Un flux futur se ramène à aujourd’hui par division par (1 + taux) puissance période. Ne confondez pas actualisation et capitalisation.",
        "110 € reçus dans un an, au taux de 10 % : quelle valeur actuelle ?",
        "100 €.",
        "121 €.",
        "110 €.",
        "10 €.",
      ),
      n(
        "Valeur actuelle nette",
        "VAN = somme des flux nets actualisés − investissement initial. Une VAN positive indique une création de valeur au taux et aux hypothèses retenus.",
        "Investissement 100, flux unique de 110 dans un an, taux 10 % : quelle VAN ?",
        "0.",
        "10.",
        "21.",
        "−10.",
      ),
    ],
    cas: c(
      "Le cycle d’exploitation",
      "Les données fonctionnelles simplifiées sont : stocks 40 000 €, clients 60 000 €, fournisseurs 35 000 € et FRNG 90 000 €. On ne considère aucun autre poste.",
      [
        ["Calculez le BFR.", "40 000 + 60 000 − 35 000 = 65 000 €."],
        ["Calculez la trésorerie nette.", "90 000 − 65 000 = 25 000 €."],
        [
          "Que se passe-t-il si les créances clients augmentent de 10 000 €, toutes choses égales par ailleurs ?",
          "Le BFR devient 75 000 € et la trésorerie nette 15 000 €. Une hausse des créances immobilise davantage de financement.",
        ],
      ],
    ),
  },
  UE7: {
    title: "Diagnostic et décisions",
    sources: [],
    notions: [
      n(
        "Diagnostic interne",
        "Une force ou une faiblesse relève de l’organisation : compétences, ressources, processus. Une opportunité ou une menace relève de son environnement.",
        "Une équipe expérimentée constitue, dans un SWOT, quel élément ?",
        "Une force interne.",
        "Une menace externe.",
        "Une opportunité externe.",
        "Une faiblesse externe.",
      ),
      n(
        "Environnement",
        "Le diagnostic externe observe notamment marché, concurrents et évolution de la demande. Un événement externe n’est pas une ressource de l’entreprise.",
        "L’arrivée d’un concurrent puissant constitue généralement quel élément dans un SWOT ?",
        "Une menace externe.",
        "Une force interne.",
        "Une faiblesse interne.",
        "Un apport en capital.",
      ),
      n(
        "Objectif et indicateur",
        "Un objectif indique une cible ; un indicateur permet de mesurer une évolution. Précisez la formule, l’unité, la période et la cible pour interpréter le résultat.",
        "Quel objectif est mesurable ?",
        "Réduire le délai moyen de 10 à 7 jours d’ici trois mois.",
        "Être meilleur bientôt.",
        "Réussir sans mesure.",
        "Améliorer quelque chose.",
      ),
      n(
        "Décision stratégique",
        "Une décision stratégique engage durablement l’orientation et des ressources importantes. Une décision opérationnelle organise l’activité courante.",
        "Ouvrir durablement une nouvelle activité dans un pays relève principalement de quelle décision ?",
        "Stratégique.",
        "D’un simple classement de facture.",
        "D’une correction de saisie.",
        "D’un pointage quotidien.",
      ),
    ],
    cas: c(
      "Un atelier veut grandir",
      "Un atelier possède un savoir-faire reconnu, mais son suivi des commandes est lent. La demande locale progresse et un concurrent à bas prix arrive. Le délai moyen actuel est de 10 jours.",
      [
        [
          "Classez les quatre faits dans un SWOT.",
          "Force : savoir-faire. Faiblesse : suivi lent. Opportunité : demande en hausse. Menace : concurrent à bas prix.",
        ],
        [
          "Proposez un objectif mesurable.",
          "Exemple : passer de 10 à 7 jours de délai moyen de traitement en trois mois. D’autres cibles justifiées sont possibles.",
        ],
        [
          "Proposez une action et un indicateur cohérents.",
          "Organiser un suivi partagé des commandes et mesurer chaque semaine le délai moyen, avec une définition stable du début et de la fin du traitement.",
        ],
      ],
    ),
  },
  UE9: {
    title: "Premiers mécanismes comptables",
    sources: [pcg],
    notions: [
      n(
        "Partie double",
        "Pour une écriture, le total des montants au débit doit égaler le total au crédit. Cela ne garantit pas à lui seul que les bons comptes sont utilisés.",
        "Quelle égalité doit respecter une écriture ?",
        "Total des débits = total des crédits.",
        "Actif = chiffre d’affaires.",
        "Débit = bénéfice.",
        "Charges = trésorerie.",
      ),
      n(
        "Amortissement linéaire",
        "Avec une consommation constante, l’annuité d’une année complète est la base amortissable divisée par la durée. La base tient compte de la valeur résiduelle lorsqu’elle doit être retenue.",
        "Un équipement de 12 000 €, valeur résiduelle nulle, utilisé 4 ans : quelle annuité linéaire complète ?",
        "3 000 €.",
        "4 000 €.",
        "12 000 €.",
        "48 000 €.",
      ),
      n(
        "Valeur nette comptable",
        "Dans le cas simplifié sans dépréciation, VNC = valeur brute − amortissements cumulés. Si une dépréciation existe, elle doit aussi être prise en compte.",
        "Valeur brute 12 000 €, amortissements cumulés 6 000 €, sans dépréciation : quelle VNC ?",
        "6 000 €.",
        "18 000 €.",
        "12 000 €.",
        "0 €.",
      ),
      n(
        "Vente à crédit",
        "Une vente à crédit crée une créance avant l’encaissement. Le résultat et la trésorerie ne suivent donc pas nécessairement le même calendrier.",
        "Une vente à crédit signifie-t-elle que le client a déjà payé ?",
        "Non, une créance reste à encaisser.",
        "Oui, automatiquement.",
        "Oui, si la facture est datée.",
        "Non, elle n’est jamais comptabilisée.",
      ),
      n(
        "Bilan",
        "Le bilan présente les actifs et les sources de financement à une date. Le compte de résultat décrit les produits et charges d’une période.",
        "Quel document décrit principalement le patrimoine à une date ?",
        "Le bilan.",
        "Le compte de résultat uniquement.",
        "Le journal des congés.",
        "Le seul budget des ventes.",
      ),
      n(
        "Résultat",
        "Dans un calcul simplifié, résultat = produits − charges. Un bénéfice n’est pas le solde bancaire, notamment en présence de crédits et d’investissements.",
        "Produits 25 000 € et charges 21 000 € : quel résultat ?",
        "Un bénéfice de 4 000 €.",
        "Une perte de 4 000 €.",
        "Un bénéfice de 46 000 €.",
        "Une trésorerie certaine de 4 000 €.",
      ),
      n(
        "Encaissement client",
        "L’encaissement d’une créance déjà enregistrée augmente la banque et diminue la créance ; il ne crée pas une seconde vente.",
        "Un client règle une facture déjà comptabilisée : que devient la créance ?",
        "Elle diminue à hauteur du règlement.",
        "Elle augmente du règlement.",
        "Elle devient une charge.",
        "Elle crée une deuxième vente.",
      ),
      n(
        "Charge et paiement",
        "Une charge décrit une consommation rattachée à une période ; un paiement décrit un mouvement de trésorerie. Un règlement peut porter sur une dette antérieure.",
        "Charge et paiement ont-ils nécessairement la même date ?",
        "Non, il peut y avoir un décalage.",
        "Oui, toujours.",
        "Oui, pour toute facture.",
        "Non, une charge n’est jamais payée.",
      ),
    ],
    cas: c(
      "Une machine sur deux ans",
      "Une machine coûte 12 000 €. Elle est mise en service le premier jour de l’exercice et utilisée quatre ans. La consommation est constante, la valeur résiduelle est nulle et aucune dépréciation n’est constatée. On ignore la TVA et les financements.",
      [
        [
          "Calculez l’annuité linéaire d’un exercice complet.",
          "Base 12 000 € / 4 ans = 3 000 € par exercice complet.",
        ],
        [
          "Calculez les amortissements cumulés après deux exercices complets.",
          "2 × 3 000 = 6 000 €.",
        ],
        [
          "Calculez la VNC et distinguez-la d’un prix de vente.",
          "VNC = 12 000 − 6 000 = 6 000 €. Cette valeur comptable n’est pas nécessairement la valeur de marché de la machine.",
        ],
      ],
    ),
  },
  UE10: {
    title: "Estimation et dépréciation",
    sources: [pcg],
    notions: [
      n(
        "Changement d’estimation",
        "Une révision d’estimation fondée sur une nouvelle information se distingue d’une erreur. Son traitement suppose d’identifier la nature du changement et le référentiel.",
        "Une nouvelle information sur la durée d’utilisation évoque d’abord quoi ?",
        "Un changement d’estimation à analyser.",
        "Une fraude certaine.",
        "Une annulation de toutes les écritures.",
        "Une vente automatiquement.",
      ),
      n(
        "Provision pour risques",
        "Une provision n’est pas une réserve de trésorerie. Il faut analyser l’obligation et la sortie de ressources probable, ainsi que l’estimation, selon le référentiel applicable.",
        "Une provision pour risques représente-t-elle des espèces mises à part ?",
        "Non, c’est un traitement comptable d’une obligation estimée.",
        "Oui, toujours un compte bancaire séparé.",
        "Oui, toujours un dividende.",
        "Non, c’est forcément un produit.",
      ),
      n(
        "VNC avant dépréciation",
        "Avant un test de dépréciation, calculez la valeur nette après amortissement. Ne déduisez pas deux fois les mêmes amortissements.",
        "Brut 50 000 €, amortissements 20 000 € : quelle valeur nette avant dépréciation ?",
        "30 000 €.",
        "70 000 €.",
        "20 000 €.",
        "50 000 €.",
      ),
      n(
        "Dépréciation, hypothèse donnée",
        "Lorsque le référentiel de l’exercice impose de ramener une valeur nette de 30 000 € à une valeur test de 24 000 €, la réduction à constater est 6 000 €. Le choix de la valeur test doit être justifié séparément.",
        "Sous cette hypothèse, quelle réduction pour passer de 30 000 € à 24 000 € ?",
        "6 000 €.",
        "24 000 €.",
        "54 000 €.",
        "30 000 €.",
      ),
    ],
    cas: c(
      "Un actif à réexaminer",
      "Un actif a une valeur brute de 50 000 € et 20 000 € d’amortissements cumulés. L’énoncé impose, après le test approprié au référentiel retenu, une valeur de 24 000 €. Il n’y a pas de dépréciation antérieure.",
      [
        ["Calculez la VNC avant le test.", "50 000 − 20 000 = 30 000 €."],
        [
          "Calculez la dépréciation sous les hypothèses données.",
          "30 000 − 24 000 = 6 000 €.",
        ],
        [
          "Quelle est la valeur nette après constatation et quelle limite faut-il rappeler ?",
          "24 000 €. Le calcul ne justifie pas seul la valeur retenue : le test et ses hypothèses doivent être documentés selon le référentiel.",
        ],
      ],
    ),
  },
  DSCG1: {
    title: "Analyse d’un dossier transversal",
    sources: [civil, company, work, vat],
    notions: [
      n(
        "Qualification préalable",
        "Un dossier transversal nécessite d’identifier les personnes, opérations et relations avant de mobiliser le droit des sociétés, le droit social ou la fiscalité.",
        "Quel réflexe adopter avant de choisir les règles ?",
        "Qualifier les personnes et opérations du dossier.",
        "Appliquer le même taux à tout.",
        "Confondre société et dirigeant.",
        "Conclure sans lire les faits.",
      ),
      n(
        "Mandat et contrat",
        "La qualité de mandataire social ne démontre pas à elle seule l’existence d’un contrat de travail. Il faut analyser les conditions propres à chaque relation.",
        "Un mandat social suffit-il à prouver un contrat de travail ?",
        "Non, les qualifications sont distinctes.",
        "Oui, pour tout dirigeant.",
        "Oui, dès qu’il y a rémunération.",
        "Oui, dès qu’il y a des associés.",
      ),
      n(
        "Hypothèses fiscales",
        "Un calcul fiscal doit annoncer ses bases, ses conditions et ses périodes. Si le taux n’est pas donné ou vérifié, n’inventez pas un montant définitif.",
        "Que faire si une donnée indispensable au calcul manque ?",
        "Signaler la donnée manquante et poser une hypothèse explicite si nécessaire.",
        "Choisir arbitrairement un taux.",
        "Affirmer une exonération automatique.",
        "Confondre TVA et impôt sur le bénéfice.",
      ),
      n(
        "Traçabilité",
        "Une conclusion professionnelle distingue faits établis, pièces manquantes et hypothèses. Une recommandation doit pouvoir être reliée à ces éléments.",
        "Quelle conclusion est la plus rigoureuse ?",
        "Une conclusion motivée précisant les hypothèses et pièces à vérifier.",
        "Une réponse certaine malgré les pièces absentes.",
        "Un montant sans calcul.",
        "Une liste de sanctions sans fondement.",
      ),
    ],
    cas: c(
      "Une dirigeante et une mission distincte",
      "Une dirigeante rémunérée pour son mandat souhaite aussi un contrat de travail pour une mission technique. L’énoncé ne précise ni ses pouvoirs dans la société, ni les conditions de contrôle de cette mission.",
      [
        [
          "Quelles relations faut-il distinguer ?",
          "Le mandat social et l’éventuel contrat de travail pour la mission technique.",
        ],
        [
          "Quelles informations rechercher ?",
          "Les fonctions réellement distinctes, la rémunération correspondante, les pouvoirs détenus et les conditions permettant d’établir ou d’exclure la subordination, ainsi que les règles propres à la forme sociale.",
        ],
        [
          "Peut-on conclure définitivement au cumul ?",
          "Non. Les données sont insuffisantes pour établir que les conditions du cumul sont réunies. Une conclusion conditionnelle et la liste des vérifications sont attendues.",
        ],
      ],
    ),
  },
  DSCG2: {
    title: "Actualisation et coût du capital",
    sources: [],
    notions: [
      n(
        "Flux et taux cohérents",
        "Le taux d’actualisation doit être cohérent avec les flux : devise, risque, horizon et nature. Des flux pour l’entreprise et des flux pour les actionnaires ne se valorisent pas mécaniquement avec le même taux.",
        "Quel principe doit guider le choix du taux ?",
        "La cohérence du taux avec la nature et le risque des flux.",
        "Le taux le plus faible disponible.",
        "Un taux sans rapport avec les flux.",
        "Le seul taux de TVA.",
      ),
      n(
        "Coût moyen pondéré",
        "Sous les hypothèses usuelles de l’exercice : CMPC = poids des capitaux propres × leur coût + poids de la dette × coût de la dette après impôt. Les poids doivent être cohérents avec la valorisation.",
        "Poids propres 60 % à 10 %, dette 40 % à 5 % après impôt : quel CMPC ?",
        "8 %.",
        "15 %.",
        "6 %.",
        "5 %.",
      ),
      n(
        "Valeur terminale",
        "Dans un modèle à croissance perpétuelle, VT = flux de la période suivante / (taux − croissance), avec taux supérieur à croissance. Elle est ensuite actualisée à la date de valorisation.",
        "Flux suivant 100, taux 10 %, croissance 2 % : quelle valeur terminale à la date de fin de prévision ?",
        "1 250.",
        "1 000.",
        "5 000.",
        "800.",
      ),
      n(
        "Sensibilité",
        "Une valorisation dépend des hypothèses. Présenter une sensibilité au taux et à la croissance permet d’expliquer une fourchette plutôt qu’une précision artificielle.",
        "Pourquoi réaliser une analyse de sensibilité ?",
        "Pour mesurer l’effet des hypothèses sur la valeur.",
        "Pour garantir une valeur certaine.",
        "Pour supprimer le risque de l’entreprise.",
        "Pour remplacer toutes les données historiques.",
      ),
    ],
    cas: c(
      "Un flux et une décision",
      "Un projet exige 100 000 € immédiatement et rapporte un flux net unique de 110 000 € dans un an. Aucun autre flux n’est attendu. Le taux retenu est 10 %.",
      [
        ["Actualisez le flux.", "110 000 / 1,10 = 100 000 €."],
        [
          "Calculez la VAN.",
          "100 000 − 100 000 = 0 €. Le projet atteint juste la rémunération exigée sous ces hypothèses.",
        ],
        [
          "Calculez la VAN avec un taux de 5 % et commentez.",
          "110 000 / 1,05 − 100 000 ≈ 4 761,90 €. Une baisse du taux augmente la valeur actuelle ; elle doit rester justifiée par le risque du projet.",
        ],
      ],
    ),
  },
  DSCG3: {
    title: "Marges, seuil et pilotage",
    sources: [],
    notions: [
      n(
        "Marge sur coût variable",
        "MSCV = chiffre d’affaires − coûts variables. Le taux de MSCV divise cette marge par le chiffre d’affaires pour la même période et le même périmètre.",
        "CA 100 000 €, coûts variables 60 000 € : quel taux de MSCV ?",
        "40 %.",
        "60 %.",
        "160 %.",
        "4 %.",
      ),
      n(
        "Seuil de rentabilité",
        "Dans un modèle linéaire à structure stable, seuil de CA = charges fixes / taux de MSCV positif. En dehors de ces hypothèses, le calcul doit être adapté.",
        "Charges fixes 30 000 €, taux de MSCV 40 % : quel seuil de CA ?",
        "75 000 €.",
        "12 000 €.",
        "30 000 €.",
        "120 000 €.",
      ),
      n(
        "Écart et convention",
        "Un écart se calcule avec une convention annoncée. Pour un coût, réel − budget positif est défavorable, à périmètre et volume comparables.",
        "Coût réel 12 000 €, budget comparable 10 000 € : quel écart réel moins budget ?",
        "2 000 € défavorables.",
        "2 000 € favorables.",
        "22 000 € défavorables.",
        "0 €.",
      ),
      n(
        "Indicateurs complémentaires",
        "Un pilotage utile combine résultat, moyens et qualité. Optimiser un seul indicateur peut déplacer le problème vers une dimension non mesurée.",
        "Quel tableau de bord est le plus équilibré ?",
        "Des indicateurs financiers, de délai et de qualité reliés aux objectifs.",
        "Le chiffre d’affaires seul dans tous les cas.",
        "Le nombre d’emails seul.",
        "Un maximum d’indicateurs sans objectif.",
      ),
    ],
    cas: c(
      "L’activité et son seuil",
      "CA : 100 000 €. Coûts variables : 60 000 €. Charges fixes : 30 000 €. Le modèle est linéaire, les prix et la structure de coûts restent constants.",
      [
        [
          "Calculez MSCV et son taux.",
          "MSCV = 40 000 € ; taux = 40 000 / 100 000 = 40 %.",
        ],
        [
          "Calculez le seuil de rentabilité en chiffre d’affaires.",
          "30 000 / 0,40 = 75 000 €.",
        ],
        [
          "Calculez le résultat et la marge de sécurité en CA.",
          "Résultat = 40 000 − 30 000 = 10 000 €. Marge de sécurité = 100 000 − 75 000 = 25 000 € de CA, soit 25 % du CA actuel.",
        ],
      ],
    ),
  },
  DSCG4: {
    title: "Audit et valeur recouvrable",
    sources: [audit, impairment],
    notions: [
      n(
        "Assertions",
        "Les procédures d’audit visent des assertions précises. L’existence d’un actif n’établit pas automatiquement son évaluation correcte ni l’exhaustivité des enregistrements.",
        "L’observation d’un stock prouve-t-elle seule que sa valeur comptable est correcte ?",
        "Non, existence et évaluation sont distinctes.",
        "Oui, toujours.",
        "Oui, si le stock est volumineux.",
        "Non, elle ne peut fournir aucun élément.",
      ),
      n(
        "Éléments probants",
        "Il faut obtenir des éléments suffisants et appropriés en fonction des risques. Leur quantité et leur qualité ne se remplacent pas mécaniquement.",
        "Comment apprécier les éléments probants ?",
        "Par leur suffisance et leur caractère approprié face au risque.",
        "Par leur quantité uniquement.",
        "Par leur couleur.",
        "Par le nombre de signatures uniquement.",
      ),
      n(
        "Valeur recouvrable IAS 36",
        "Selon IAS 36, la valeur recouvrable retient le plus élevé de la valeur d’utilité et de la juste valeur diminuée des coûts de sortie. La norme applicable doit être identifiée.",
        "Valeur d’utilité 90 et juste valeur nette des coûts de sortie 85 : quelle valeur recouvrable IAS 36 ?",
        "90.",
        "85.",
        "175.",
        "5.",
      ),
      n(
        "Perte de valeur",
        "Dans l’exercice simplifié IAS 36, si une valeur comptable de 100 dépasse une valeur recouvrable de 90, une perte de valeur de 10 est à constater, sous réserve des règles de la norme.",
        "Valeur comptable 100, recouvrable 90 : quelle perte de valeur simplifiée ?",
        "10.",
        "90.",
        "190.",
        "0.",
      ),
    ],
    cas: c(
      "Tester une perte de valeur",
      "Dans un exercice IAS 36 simplifié portant sur un actif isolé, valeur comptable : 100 000 €. Valeur d’utilité justifiée : 90 000 €. Juste valeur diminuée des coûts de sortie : 85 000 €. Pas de traitement de réévaluation particulier.",
      [
        [
          "Déterminez la valeur recouvrable.",
          "Maximum de 90 000 et 85 000 : 90 000 €.",
        ],
        ["Calculez la perte de valeur.", "100 000 − 90 000 = 10 000 €."],
        [
          "Quelles vérifications d’audit proposer sur la valeur d’utilité ?",
          "Contrôler les hypothèses de flux, leur cohérence avec les budgets et les faits disponibles, le taux d’actualisation et les calculs. La présence matérielle de l’actif ne suffit pas à valider ces hypothèses.",
        ],
      ],
    ),
  },
  DSCG5: {
    title: "Contrôle et sécurité du SI",
    sources: [privacy],
    notions: [
      n(
        "Moindre privilège",
        "Attribuez seulement les accès nécessaires à une fonction et retirez ceux devenus inutiles. Un accès administrateur universel augmente l’exposition.",
        "Quelle attribution respecte le moindre privilège ?",
        "Les seuls accès nécessaires aux tâches autorisées.",
        "Administrateur pour tous.",
        "Le même mot de passe partagé.",
        "Des droits permanents sans revue.",
      ),
      n(
        "Séparation des tâches",
        "Séparer création d’un fournisseur et validation de son paiement réduit le risque qu’une même personne réalise une opération indue sans contrôle.",
        "Quel contrôle réduit le risque de faux fournisseur payé ?",
        "Séparer création du fournisseur et validation du paiement.",
        "Supprimer tous les journaux.",
        "Partager un compte unique.",
        "Désactiver les validations.",
      ),
      n(
        "Sauvegarde testée",
        "Une sauvegarde n’est utile que si une restauration est possible dans les conditions attendues. Testez la récupération, l’intégrité et les délais.",
        "Quel contrôle vérifie réellement l’utilité d’une sauvegarde ?",
        "Un test de restauration documenté.",
        "La seule présence d’une icône.",
        "Le nombre de fichiers sans ouverture.",
        "L’achat d’un disque seul.",
      ),
      n(
        "Minimisation",
        "La collecte de données personnelles doit être proportionnée à la finalité. Ne collectez pas des informations simplement parce qu’elles pourraient servir un jour.",
        "Quel principe doit guider les données personnelles collectées ?",
        "Limiter la collecte aux données pertinentes et nécessaires à la finalité.",
        "Collecter systématiquement tout.",
        "Conserver toujours sans limite.",
        "Publier toutes les données internes.",
      ),
    ],
    cas: c(
      "Un compte partagé en comptabilité",
      "Une équipe utilise un compte administrateur partagé pour créer les fournisseurs et valider les paiements. Des sauvegardes sont faites, mais aucune restauration n’a été testée.",
      [
        [
          "Identifiez deux risques.",
          "Absence de traçabilité individuelle et possibilité de créer puis payer un faux fournisseur sans séparation des tâches. La capacité de restauration reste aussi non démontrée.",
        ],
        [
          "Proposez des contrôles adaptés.",
          "Comptes individuels, droits adaptés, revue périodique des accès, validation du paiement par une personne distincte et journalisation protégée.",
        ],
        [
          "Décrivez un test de sauvegarde utile.",
          "Restaurer un jeu de données dans un environnement isolé, vérifier intégrité et utilisabilité, mesurer le délai de reprise et consigner les résultats sans écraser la production.",
        ],
      ],
    ),
  },
};

const expanded = { ...LAW_CHAPTERS, ...ACCOUNTING_CHAPTERS, ...MANAGEMENT_CHAPTERS, ...SYSTEM_CHAPTERS, ...COMMUNICATION_CHAPTERS };
const practiceChapters=buildPracticeChapters([...ACCOUNTING_PRACTICE,...FINANCE_PRACTICE,...MANAGEMENT_PRACTICE,...DATA_PRACTICE]);
export const MODULES = Object.fromEntries(CURRICULUM.map(ue => {
  const starter = STARTER_MODULES[ue.id];
  const chapters = starter ? [{
    id: 'reperes', title: starter.title,
    intro: 'Les repères essentiels pour commencer cette matière.',
    method: 'Expliquez chaque notion avec vos propres mots, puis vérifiez votre compréhension dans les exercices.',
    pitfalls: ['Distinguez les hypothèses du cas des règles générales.','Justifiez chaque résultat.'],
    notions: starter.notions, cas: starter.cas, sources: [PROGRAM_SOURCE, PREVIOUS_PROGRAM_SOURCE, ...starter.sources],
    verifiedAt: VERIFIED_AT, programmes: ['2026','2027'],
    rights: 'Texte et exercices originaux SIMDCG.',
    review: 'Relecture éditoriale et contrôles automatisés. Validation indépendante par un enseignant non réalisée.',
  }, ...expanded[ue.id]] : expanded[ue.id];
  chapters.push(...(DEEPENING_CHAPTERS[ue.id] || []),...(practiceChapters[ue.id] || []));
  for(const group of [LEGAL_COURSES,BUSINESS_COURSES,ACCOUNTING_COURSES,ADVANCED_COURSES,COMMUNICATION_COURSES,SYNTHESIS_COURSES,WORKBENCH_COURSES,WORKBENCH_DCG,WORKBENCH_DSCG])chapters.push(...(group[ue.id] || []));
  const reviewedChapters=chapters.map(c=>{
    const editorial=editQuiz(ue.id,attachEditorial(ue.id,addConsolidation(enrichSubjectChapter(ue.id,deepenChapter(ue.id,c)))));
    return applyReviewedQuiz(ue.id,editorial,QUIZ_V2);
  });
  return [ue.id, {
    title: ue.label, chapters:reviewedChapters,
    notions: chapters.flatMap(c => (c.practice || c.notions).map(n=>({...n,chapterId:c.id}))), cas: chapters[0].cas,
    sources: [...new Map(reviewedChapters.flatMap(c=>c.sources).map(source=>[source[1],source])).values()],
  }];
}));

export function moduleCatalogue(id) {
  if (!Object.hasOwn(MODULES,id)) throw Object.assign(new Error('Contenu introuvable.'),{status:404});
  const m=MODULES[id];
  return {module:id,title:m.title,version:FORMATS_VERSION,scope:'Contenus originaux, couverture partielle du programme',
    questionCount:m.chapters.reduce((n,c)=>n+chapterQuestionCount(c),0),cardCount:m.chapters.reduce((n,c)=>n+chapterCardCount(c),0),
    curatedQuestionCount:m.chapters.reduce((n,c)=>n+curatedQuestionCount(c),0),curatedCaseCount:m.chapters.reduce((n,c)=>n+(c.variantAt?1+(c.extraCases?.length || 0):c.modelCount || c.cases?.length || 1),0),
    caseCount:m.chapters.reduce((n,c)=>n+chapterCaseCount(c),0),
    conceptCount:m.chapters.reduce((n,c)=>n+c.notions.length,0),
    clozeCount:m.chapters.reduce((n,c)=>n+chapterCloze(c).length,0),
    sheetCount:m.chapters.length,
    applicationCount:m.chapters.reduce((n,c)=>n+(c.practiceSize || 0),0),
    comprehensionCount:m.chapters.reduce((n,c)=>n+curatedQuestionCount(c),0),
    chapters:m.chapters.map(c=>{const words=readingWordCount(id,c);return {id:c.id,title:c.title,block:chapterBlock(id,c.id),programmes:c.programmes,programmeNote:c.programmeNote || null,clozeCount:chapterCloze(c).length,sheet:true,reading:true,searchTerms:c.notions.map(n=>n.title),caseWorkshops:c.caseWorkshops || [],questionCount:chapterQuestionCount(c),curatedQuestionCount:curatedQuestionCount(c),cardCount:chapterCardCount(c),caseCount:chapterCaseCount(c),curatedCaseCount:c.variantAt?1+(c.extraCases?.length || 0):c.modelCount || c.cases?.length || 1,applicationCount:c.practiceSize || 0,comprehensionCount:curatedQuestionCount(c),practiceKind:c.variantAt?'Notions, relations et calculs à variantes':'Notions, mises en situation et cas argumentés',words,minutes:Math.max(8,Math.ceil(words/160)+8)};})};
}
export function selectedChapter(id,chapter) {
  if (!Object.hasOwn(MODULES,id)) throw Object.assign(new Error('Contenu introuvable.'),{status:404});
  if (!chapter || chapter==='all') return null;
  const selected=MODULES[id].chapters.find(c=>c.id===chapter);
  if (!selected) throw Object.assign(new Error('Chapitre introuvable.'),{status:404});
  return selected;
}
export function studyModule(id, tool = 'summary', random = Math.random, settings = {}) {
  if (!Object.hasOwn(MODULES,id) || !['summary','qcm','cards','case','catalog','reading','sheet','cloze','visuals'].includes(tool))
    throw Object.assign(new Error('Contenu introuvable.'),{status:404});
  if(tool==='catalog')return moduleCatalogue(id);
  const m=MODULES[id], selected=selectedChapter(id,settings.chapter);
  const c=selected || m.chapters[0];
  const cases=c.cases || [c.cas],variantCount=chapterCaseCount(c);
  const variant=settings.variant===undefined?0:Number(settings.variant);
  if(tool==='case'&&(!Number.isInteger(variant)||variant<0||variant>=variantCount))throw Object.assign(new Error('Variante de cas introuvable.'),{status:404});
  const meta={title:c.title,module:id,chapter:c.id,version:FORMATS_VERSION,programmes:c.programmes,programmeNote:c.programmeNote || null,
    scope:'Contenus originaux, couverture partielle du programme',sources:c.sources,
    verifiedAt:c.verifiedAt,rights:c.rights,review:c.review,
    chapters:moduleCatalogue(id).chapters};
  if(tool==='cloze')return publicCloze(id,c);
  if(tool==='reading'||tool==='sheet')return {...meta,...readingFormats(id,c),pedagogy:SUBJECT_PEDAGOGY[id],visuals:tool==='reading'?lessonVisuals(c):undefined};
  if(tool==='visuals')return {...meta,visuals:lessonVisuals(c)};
  if(tool==='summary')return {...meta,pedagogy:SUBJECT_PEDAGOGY[id],workshop:c.workshop,selfChecks:c.notions.map(n=>({question:n.q,answer:n.correct,explanation:n.body})),intro:c.intro,method:c.method,learningGoals:c.learningGoals || c.notions.map(n=>n.title),prerequisites:c.prerequisites || ['Les repères de cette matière.'],
    sections:(c.sections || c.notions.map(n=>({title:n.title,paragraphs:n.body.split('\n\n')}))).map(s=>({titre:s.title,points:s.paragraphs,example:s.example})),
    methodSteps:c.methodSteps || [c.method],glossary:c.glossary || [],checklist:c.checklist || c.pitfalls,
    points_cles:c.notions.map(n=>n.correct),pieges_frequents:c.pitfalls,
    example:c.cas,visuals:lessonVisuals(c),
    conseil_exam:'Ces cours complètent votre formation. Vérifiez le cadre et les règles de votre session dans les références officielles.'};
  if(tool==='case') {
    const numeric=Boolean(c.variantAt)&&variant<c.caseCount;
    const workshop=c.caseWorkshops?.some(w=>w.variant===variant);
    const {notions,...cas}=numeric?c.variantAt(variant):c.variantAt?c.extraCases[variant-c.caseCount]:cases[variant];
    const questions=numeric?cas.questions.map((q,i)=>({...q,guide:{type:'number',expected:notions[i].calculation.result,unit:notions[i].calculation.unit}})):cas.questions;
    return {...meta,...cas,questions:questions.map((q,i)=>({...q,rubric:caseRubric(c,q,i,3,workshop?[]:notions || c.notions)})),variant,variantCount,practiceKind:workshop?'Atelier de relecture':c.practiceKind || 'Cas original'};
  }
  const chapters=selected?[selected]:m.chapters,pool=questionPool(chapters,settings.focus || 'all');
  const count=settings.count===undefined?(tool==='cards'?40:8):Number(settings.count);
  if(!Number.isInteger(count)||count<1||count>(tool==='cards'?100:20))throw Object.assign(new Error('Taille de série invalide.'),{status:400});
  if(tool==='cards') {
    const recall=cardPool(chapters),applications=questionPool(chapters,'application'),focus=settings.focus || 'knowledge';
    const recallItem=n=>({id:id+':'+n.id,chapter:n.chapterId,q:n.q,a:n.a,tag:n.tag,kind:'Rappel de cours',...(n.example?{example:n.example,pitfall:n.pitfall}:{})});
    const basics=sampleQuestions(recall,focus==='application'?0:focus==='all'?Math.ceil(count/2):count,random).map(recallItem);
    if(focus==='all'&&applications.total<count-basics.length){const used=new Set(basics.map(n=>n.id));for(const n of sampleQuestions(recall,count,random)){const item=recallItem(n);if(!used.has(item.id)&&basics.length+applications.total<count){used.add(item.id);basics.push(item);}}}
    const numbers=sampleQuestions(applications,focus==='knowledge'?0:count-basics.length,random).map(n=>({id:id+':'+n.id,chapter:n.chapterId,q:n.q,a:n.correct+' '+n.body,tag:m.chapters.find(c=>c.id===n.chapterId).title,kind:'Exercice de calcul'}));
    return {...meta,chapter:selected?.id || 'all',sources:selected?.sources || m.sources,poolSize:focus==='application'?applications.total:focus==='all'?recall.total+applications.total:recall.total,items:[...basics,...numbers]};
  }
  const focus=settings.focus || 'all';
  const picked=focus==='all'?(()=>{const knowledge=sampleQuestions(questionPool(chapters,'knowledge'),Math.ceil(count/2),random),application=sampleQuestions(questionPool(chapters,'application'),count-knowledge.length,random);if(application.length<count-knowledge.length){const used=new Set(knowledge.map(n=>n.id));for(const n of sampleQuestions(questionPool(chapters,'knowledge'),count,random))if(!used.has(n.id)&&knowledge.length+application.length<count){used.add(n.id);knowledge.push(n);}}return [...knowledge,...application];})():sampleQuestions(pool,count,random);
  const items=picked.map(n=>{
    const options=[n.correct,...n.wrong];
    for(let j=options.length-1;j>0;j--){const k=Math.floor(random()*(j+1));[options[j],options[k]]=[options[k],options[j]];}
    return {id:id+':'+n.id,q:n.q,options,answer:options.indexOf(n.correct),expl:n.body,...(n.wrongReasons?{optionExplanations:options.map(o=>o===n.correct?n.body:n.wrongReasons[n.wrong.indexOf(o)])}:{}),difficulte:quizTypeLabel(n),chapter:n.chapterId};
  });
  for(let j=items.length-1;j>0;j--){const k=Math.floor(random()*(j+1));[items[j],items[k]]=[items[k],items[j]];}
  return {...meta,chapter:selected?.id || 'all',sources:selected?.sources || m.sources,items,poolSize:pool.total};
}
