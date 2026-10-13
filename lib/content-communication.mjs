import { chapter as ch, notion as n, SOURCES as S } from './content-authoring.mjs';
const english=['Anglais professionnel, British Council','https://learnenglish.britishcouncil.org/business-english'];
const anonymisation=['Anonymisation et pseudonymisation, CNIL','https://www.cnil.fr/fr/technologies/lanonymisation-de-donnees-personnelles'];
export const COMMUNICATION_CHAPTERS = {
UE12:[
 ch('vocabulaire','Lire les chiffres d’une entreprise en anglais',
 'Une traduction professionnelle doit préserver le sens économique. Certains mots proches en français et en anglais désignent des réalités différentes, notamment revenue, profit et turnover.',
 'Repérez le contexte avant de traduire. Distinguez ventes, dépenses et bénéfice. Vérifiez les unités, la devise et la période lorsque le texte contient des chiffres.',
 ['Revenue ne signifie pas systématiquement bénéfice.','Turnover peut désigner le chiffre d’affaires ou la rotation selon le contexte.'],[
 n('Revenue and profit','Dans un compte de résultat, revenue désigne les revenus ou le chiffre d’affaires selon le contexte. Profit correspond à un résultat après les charges considérées.','Dans « revenue increased but profit fell », quelle distinction est essentielle ?','Les ventes peuvent augmenter alors que le bénéfice diminue.','Revenue et profit sont toujours identiques.','Les charges ont nécessairement disparu.','Le chiffre d’affaires est forcément nul.'),
 n('Expenses','Expenses désigne des charges ou dépenses selon le contexte. Le texte doit préciser si l’on parle de comptabilité ou de paiements.','Comment comprendre « operating expenses » ?','Charges ou dépenses d’exploitation selon le contexte.','Capitaux propres uniquement.','Créances clients uniquement.','Actions émises uniquement.'),
 n('Assets and liabilities','Assets désigne les actifs. Liabilities désigne les dettes et autres passifs reconnus, hors capitaux propres. Equity désigne les capitaux propres.','Quel mot correspond aux capitaux propres dans une présentation financière ?','Equity.','Revenue.','Expenses.','Customers.'),
 n('Cash flow','Cash flow renvoie aux flux de trésorerie. Il ne doit pas être assimilé automatiquement au résultat comptable.','Une entreprise profitable peut-elle avoir un negative cash flow ?','Oui, bénéfice et flux de trésorerie sont distincts.','Non, les deux sont toujours identiques.','Non, cash flow signifie capital social.','Oui, uniquement si elle n’a aucun client.'),
 ],'Texte original : « Revenue reached €200,000. Operating expenses amounted to €170,000. Customers paid some invoices after year-end. » Le cas ne donne aucun autre produit ou charge.',[
 ['Calculez le résultat du schéma donné.','€200,000 − €170,000 = €30,000, soit 30 000 €.'],
 ['Proposez une phrase de synthèse en anglais.','The company reported a profit of €30,000 under the assumptions provided.'],
 ['Peut-on calculer le cash flow à partir de ces seules données ?','Non. Les dates d’encaissement et décaissement ainsi que les autres flux manquent.'],
 ],[english]),
 ch('redaction','Écrire un message professionnel clair',
 'Un message professionnel expose une situation, une demande et une suite attendue. Une formulation courte et précise vaut mieux qu’une accumulation de mots complexes.',
 'Définissez destinataire, objet et action demandée. Utilisez un ton adapté, vérifiez les dates et montants, puis relisez la phrase de demande.',
 ['Actual signifie souvent réel ou effectif, pas actuel.','Une formule polie ne doit pas rendre la demande incompréhensible.'],[
 n('Demande polie','Could you suivi d’un verbe permet une demande polie. Le contenu doit préciser ce que le destinataire doit fournir ou vérifier.','Quelle phrase demande poliment une facture ?','Could you send us the invoice?','You invoice yesterday now.','Invoice is could sent you.','Could sending invoice was?'),
 n('Pièce jointe','Attached désigne un fichier joint dans le contexte d’un email. La phrase doit identifier le document et éviter une référence ambiguë.','Quelle phrase signale clairement une pièce jointe ?','The revised report is attached.','The report is a meeting.','We attachment yesterday send.','The report has no words sent.'),
 n('Date limite','By Monday indique une limite au plus tard lundi dans le contexte donné. On Monday désigne le jour où l’action a lieu.','Que signifie « Please reply by Friday » ?','Répondez au plus tard vendredi.','Répondez uniquement après vendredi.','Répondez tous les vendredis nécessairement.','Ne répondez pas vendredi.'),
 n('Faux ami','Actual signifie réel ou effectif dans de nombreux contextes. Current convient pour actuel. Le choix reste lié au sens de la phrase.','Comment traduire « the actual cost » dans un budget ?','Le coût réel.','Le coût actuel dans tous les cas.','Le coût futur obligatoire.','Le coût fictif.'),
 ],'Vous devez demander à un fournisseur une facture corrigée pour une commande de 1 250 €. La réponse est attendue au plus tard jeudi. Rédigez un email bref, sans inventer de numéro de commande.',[
 ['Proposez un objet.','Request for a corrected invoice.'],
 ['Proposez la demande.','Could you send us a corrected invoice for our €1,250 order by Thursday?'],
 ['Ajoutez une conclusion adaptée.','Thank you for your help. Please let us know if you need further details. Les formulations proposées sont des exemples, pas les seules réponses possibles.'],
 ],[english]),
 ch('donnees','Décrire une évolution sans déformer les chiffres',
 'Décrire des données en anglais demande de distinguer niveau, variation relative et points de pourcentage. Une comparaison doit indiquer les périodes et la mesure.',
 'Lisez les unités. Calculez la variation sur la base initiale. Choisissez increased, decreased ou remained stable, puis indiquez clairement la période et l’ampleur.',
 ['Une hausse de 10 % à 12 % représente deux points, pas deux pour cent de hausse relative.','From et to indiquent les niveaux ; by indique la variation.'],[
 n('From and to','From indique le point de départ et to le niveau d’arrivée. La phrase doit préciser ce qui est mesuré.','Quelle phrase décrit une hausse de ventes de 100 à 120 ?','Sales increased from 100 to 120.','Sales decreased from 120 to 100.','Sales remained at 100.','Sales increased by 120 percent.'),
 n('By','By exprime l’ampleur de la variation. Pour passer de 100 à 120, la hausse relative est 20 % sur la base initiale.','Comment exprimer la hausse relative de 100 à 120 ?','Sales increased by 20%.','Sales increased by 120%.','Sales decreased by 20%.','Sales remained unchanged.'),
 n('Percentage points','Une différence entre deux pourcentages s’exprime en points de pourcentage. La variation relative constitue un autre calcul.','Une marge passe de 20 % à 25 %. Quel écart en points ?','Five percentage points.','Twenty-five percentage points.','Five percent relative increase exactly.','Zero percentage points.'),
 n('Prudence causale','Des évolutions conjointes ne suffisent pas à établir une cause. Une analyse doit distinguer ce que les données montrent et ce qu’elle suppose.','Quelle phrase reste prudente sur une cause non démontrée ?','The change may be linked to higher demand.','The data prove every possible cause.','Higher demand is certain without any evidence.','No other factor can exist.'),
 ],'Texte à produire à partir de données originales : ventes de 400 000 € à 460 000 € ; taux de marge de 18 % à 20 %. Aucune cause n’est fournie.',[
 ['Calculez la hausse relative des ventes.','(460 000 − 400 000) / 400 000 = 15 %.'],
 ['Décrivez les deux évolutions en anglais.','Sales increased by 15%. The margin rate rose by two percentage points, from 18% to 20%.'],
 ['Faut-il affirmer que la publicité explique la hausse ?','Non, aucune donnée causale n’est fournie. Il faut présenter cette explication comme une hypothèse éventuelle.'],
 ],[english]),
],
UE13:[
 ch('experience','Analyser une expérience professionnelle',
 'Une analyse d’expérience explique une mission, son contexte et ce qu’elle permet de comprendre. Elle ne se limite pas à un journal de tâches ou à une présentation publicitaire.',
 'Décrivez le contexte nécessaire, votre rôle exact, le problème rencontré, les actions et leurs résultats. Distinguez ce que vous avez réalisé de ce que l’équipe a réalisé.',
 ['Ne vous attribuez pas une action que vous avez seulement observée.','Un outil cité ne remplace pas l’analyse de son usage.'],[
 n('Contexte utile','Le contexte sert à comprendre la mission et ses contraintes. Les informations sans lien avec l’analyse peuvent être écartées.','Quel contexte inclure dans un rapport ?','Celui qui éclaire la mission et ses contraintes.','Tous les détails disponibles sans tri.','Uniquement le slogan commercial.','Des données personnelles sans utilité.'),
 n('Rôle personnel','Le rôle doit être décrit précisément pour distinguer observation, participation et autonomie. Il ne faut pas amplifier les responsabilités exercées.','Comment présenter une tâche réalisée sous supervision ?','Indiquer l’action personnelle et la supervision.','Affirmer une responsabilité totale inexistante.','Supprimer tout rôle de l’équipe.','Inventer une décision de direction.'),
 n('Analyse et description','La description dit ce qui s’est passé. L’analyse explique les raisons, les difficultés et les conséquences à partir des éléments observés.','Quelle phrase relève davantage de l’analyse ?','Le contrôle a réduit les doublons identifiés, sous ces conditions.','J’ai ouvert le logiciel à neuf heures.','Le bureau possède deux écrans.','Le dossier contient dix pages.'),
 n('Preuve professionnelle','Une affirmation sur un résultat doit être reliée à un élément vérifiable et autorisé. Les données confidentielles doivent être protégées.','Quel élément soutient un résultat annoncé ?','Un indicateur ou une pièce adaptée et autorisée.','Un chiffre inventé.','Une information sans source.','Le seul intitulé du stage.'),
 ],'Vous avez rapproché des factures sous supervision. Un contrôle avant/après montre 12 doublons dans 300 dossiers avant la procédure, puis 3 dans 300 dossiers après.',[
 ['Calculez les deux taux observés.','Avant : 12 / 300 = 4 %. Après : 3 / 300 = 1 %.'],
 ['Quel résultat présenter ?','Une baisse de trois points de pourcentage dans les échantillons observés, en précisant la méthode et les limites.'],
 ['Comment décrire votre rôle ?','Présenter les rapprochements réalisés, la supervision et votre contribution à la procédure, sans vous attribuer seul tout le résultat.'],
 ]),
 ch('rapport','Structurer un rapport et ses références',
 'Un rapport doit permettre de suivre une question et un raisonnement. Les sources et annexes sont utiles lorsqu’elles soutiennent l’analyse, pas lorsqu’elles gonflent le document.',
 'Définissez une question directrice et un plan. Pour chaque partie, reliez idée, preuve et interprétation. Référencez les emprunts et choisissez les annexes vraiment nécessaires.',
 ['Reformuler ne dispense pas de citer l’idée empruntée.','Une annexe non expliquée peut rester inutilisable pour le lecteur.'],[
 n('Question directrice','La question directrice délimite l’objet de l’analyse. Un thème trop vaste ne donne pas encore un problème exploitable.','Quel sujet est mieux délimité ?','Comment fiabiliser le rapprochement de factures dans ce service ?','La comptabilité dans le monde.','Toutes les entreprises.','Le travail en général.'),
 n('Plan argumenté','Le plan organise la réponse à la question. Chaque partie doit apporter un élément de raisonnement, pas seulement une liste chronologique.','Quel critère évalue un plan ?','Sa contribution à la réponse à la question.','Le nombre de titres seul.','La longueur maximale seule.','La couleur des pages.'),
 n('Citation','Une citation ou une idée empruntée doit être attribuée. Une reformulation personnelle doit rester fidèle et distincte du travail original.','Que faire lorsqu’une idée vient d’une source ?','La référencer même si elle est reformulée.','La présenter comme une observation personnelle.','Supprimer l’auteur systématiquement.','Modifier deux mots puis ignorer la source.'),
 n('Annexe','Une annexe complète un argument et doit être appelée dans le texte. Sa confidentialité et son utilité doivent être vérifiées.','Quand ajouter une annexe ?','Quand elle éclaire un point identifié et peut être diffusée.','Pour augmenter le volume sans raison.','Quand elle contient toute donnée privée sans accord.','Pour remplacer toute explication.'),
 ],'Le projet de rapport contient une longue présentation commerciale, des captures de factures nominatives et aucune question directrice.',[
 ['Quelle amélioration de structure prioritaire ?','Définir une question liée à la mission et réorganiser le plan pour y répondre.'],
 ['Comment traiter les factures ?','Examiner l’autorisation de diffusion, retirer les informations inutiles et protéger les données avant toute intégration.'],
 ['Comment utiliser les sources ?','Distinguer observations personnelles, données de l’organisation et idées externes, puis attribuer chaque emprunt pertinent.'],
 ],[S.privacy]),
 ch('soutenance','Préparer une soutenance professionnelle',
 'Une soutenance rend visible le raisonnement et le travail personnel. Elle ne consiste pas à lire le rapport intégralement ni à réciter un texte sans comprendre les choix.',
 'Préparez le fil de la présentation : problème, méthode, résultats, limites et suites. Entraînez-vous aux questions en justifiant chaque choix à partir de votre expérience.',
 ['Un support chargé ne rend pas l’analyse plus solide.','Une question critique n’exige pas d’inventer une réponse certaine.'],[
 n('Fil conducteur','La présentation doit garder un fil cohérent entre problème, démarche et résultats. Une sélection argumentée vaut mieux qu’un résumé exhaustif.','Quel fil convient à une présentation analytique ?','Problème, démarche, résultats et limites.','Toutes les pages dans l’ordre sans tri.','Uniquement la description des locaux.','Une suite de slogans.'),
 n('Support','Le support aide à suivre des idées ou données. Il doit rester lisible et ne pas remplacer l’explication orale.','Quel usage du support est le plus adapté ?','Soutenir les idées clés avec des éléments lisibles.','Afficher tout le texte du rapport.','Cacher les unités des graphiques.','Présenter des chiffres sans titre.'),
 n('Question critique','Une réponse critique expose les raisons du choix et ses limites. Reconnaître une information manquante est préférable à inventer un résultat.','Une question dépasse les données recueillies. Quelle réponse retenir ?','Préciser la limite et ce qu’il faudrait vérifier.','Inventer une valeur.','Affirmer une certitude non démontrée.','Changer de sujet sans explication.'),
 n('Appropriation','Le candidat doit comprendre et justifier son travail personnel. Un texte généré ou préparé par autrui ne remplace pas cette appropriation.','Quel entraînement vérifie l’appropriation ?','Expliquer ses choix sans lire un texte préparé.','Réciter sans comprendre.','Demander à un outil de répondre à sa place.','Mémoriser uniquement les titres.'),
 ],'Un candidat prépare dix diapositives très chargées et ne peut pas expliquer pourquoi il a retenu son indicateur de qualité.',[
 ['Comment alléger le support ?','Conserver les idées et données indispensables, avec titres, unités et schémas lisibles.'],
 ['Quelle question préparer ?','Pourquoi cet indicateur répond-il au problème, comment est-il calculé et quelles sont ses limites ?'],
 ['Quelle démarche d’entraînement proposer ?','Présenter le raisonnement à voix haute, répondre à des objections et vérifier la cohérence avec les données réellement recueillies.'],
 ]),
],
DSCG6:[
 ch('presenter','Présenter une analyse en anglais',
 'Une présentation en anglais doit être structurée et compréhensible. Le vocabulaire spécialisé sert le raisonnement ; il ne doit pas masquer une idée incertaine.',
 'Préparez une introduction, deux ou trois idées soutenues par des faits, puis une conclusion. Annoncez clairement les transitions et les limites des informations.',
 ['Un mot compliqué n’améliore pas une idée vague.','Ne présentez pas une hypothèse comme un résultat établi.'],[
 n('Introduction','Une introduction présente le thème et la question. Elle peut annoncer la structure sans raconter tout le document.','Quelle phrase introduit une question de travail ?','This presentation examines how the company can improve cash collection.','This company examination yesterday improve.','How company cash is did?','All companies are always identical.'),
 n('Transition','Une transition indique la relation entre les idées. Furthermore ajoute ; however marque une opposition ou une réserve.','Quel mot convient pour introduire une réserve ?','However.','Furthermore dans tous les cas.','Because pour toute opposition.','Yesterday.'),
 n('Exemple','Un exemple illustre un argument mais ne démontre pas automatiquement une règle générale. Il faut préciser son périmètre.','Quelle formulation présente un exemple ?','For example, one department reduced processing time.','Therefore every department must be identical.','The example proves all future cases.','No evidence is ever needed.'),
 n('Conclusion','Une conclusion reprend la réponse et les limites. Elle ne doit pas introduire une affirmation importante sans élément de soutien.','Quelle conclusion reste mesurée ?','The results suggest an improvement, but further evidence is needed.','The results guarantee every future profit.','No limitation can exist.','All companies will necessarily improve.'),
 ],'Préparez une présentation originale sur une procédure qui réduit les retards de paiement dans un service. Les seules données sont un délai moyen passé de 45 à 38 jours.',[
 ['Calculez la baisse du délai en jours.','45 − 38 = 7 jours.'],
 ['Proposez une phrase anglaise sur le résultat.','The average payment delay fell from 45 to 38 days.'],
 ['Ajoutez une limite en anglais.','The comparison does not by itself prove that the new procedure caused the entire change.'],
 ],[english]),
 ch('argumenter','Argumenter et répondre aux questions',
 'Une argumentation distingue affirmation, justification et exemple. Répondre à une question suppose de vérifier ce qui est demandé avant d’accumuler des éléments.',
 'Reformulez si nécessaire. Donnez une réponse directe, puis une raison et un exemple. Comparez les options selon les mêmes critères et exposez les limites.',
 ['Une opinion personnelle doit être présentée comme telle.','Évitez les certitudes universelles sur un dossier limité.'],[
 n('Clarification','Une demande de clarification permet de confirmer le sens d’une question. Elle doit rester courte et polie.','Quelle phrase demande une précision ?','Could you clarify what you mean by operating risk?','You risk what yesterday?','I clarify you must.','The question is always wrong.'),
 n('Opinion argumentée','Une opinion peut être introduite puis justifiée par une raison et un élément pertinent. La raison ne doit pas être une simple répétition.','Quelle formule introduit une opinion personnelle ?','In my view, the main issue is data quality.','It is universally proven without evidence.','Every view is necessarily identical.','Data quality can never matter.'),
 n('Comparaison','Une comparaison utile repose sur les mêmes critères et périodes. Un prix de licence ne suffit pas à comparer deux solutions de périmètres différents.','Que préciser dans une comparaison de solutions ?','The criteria and the scope of comparison.','Only the logo size.','No information about costs or use.','An unrelated company name.'),
 n('Incertitude','May et might peuvent exprimer une possibilité. Ils ne doivent pas être remplacés par will lorsqu’un effet reste incertain.','Quelle phrase exprime une possibilité ?','The project may improve efficiency.','The project will certainly solve every problem.','The project always guarantees profit.','No other outcome is possible.'),
 ],'À l’oral, on vous demande si externaliser le système informatique garantit une baisse des coûts. Aucune comparaison complète n’est disponible.',[
 ['Répondez directement en anglais.','Not necessarily. Outsourcing can change the cost structure, but savings depend on the scope and conditions.'],
 ['Ajoutez deux critères.','We should compare total costs, service quality and the conditions for recovering our data.'],
 ['Exprimez la limite.','We cannot conclude without a consistent comparison of the two options.'],
 ],[english]),
 ch('documents','Analyser un document économique en anglais',
 'Une analyse de document sépare la thèse, les faits et les arguments. Elle doit identifier la source, la date et les limites sans transformer un extrait en preuve universelle.',
 'Repérez auteur, date, contexte, question et données. Reformulez la thèse, distinguez preuve et commentaire, puis préparez une discussion structurée.',
 ['Ne confondez pas la position de l’auteur et un fait établi.','Un taux moyen ne décrit pas automatiquement chaque entreprise.'],[
 n('Thèse','La thèse est l’idée principale soutenue par le document. Elle doit être reformulée fidèlement, sans ajouter une conclusion absente.','Que représente la main claim d’un document ?','Son affirmation principale.','Sa bibliographie uniquement.','Sa police de caractères.','Le nombre de pages uniquement.'),
 n('Éléments de preuve','Evidence désigne les éléments qui soutiennent une affirmation. Leur qualité dépend de la source, de la méthode et du périmètre.','Que faut-il examiner dans une evidence chiffrée ?','La source, la méthode et le périmètre.','Le seul nombre de décimales.','La couleur du tableau uniquement.','La taille du titre.'),
 n('Moyenne et dispersion','Une moyenne résume des observations sans donner leur dispersion. Une conclusion sur chaque cas nécessite davantage d’informations.','Un average cost prouve-t-il le coût de chaque entreprise ?','No, individual costs may differ.','Yes, every cost must be identical.','Yes, averages remove all variation.','No, because averages never have any use.'),
 n('Points et pourcentages','Les percentage points expriment l’écart entre deux taux. La relative change rapporte cet écart au taux initial.','Un taux passe de 10 % à 12 %. Quelle variation relative ?','20 %.','2 % exactement.','12 %.','120 %.'),
 ],'Texte original : « In the surveyed firms, the share of late invoices fell from 10% to 8%. The report suggests that reminders may have helped, but no control group was used. »',[
 ['Calculez la baisse en points.','10 % − 8 % = deux points de pourcentage.'],
 ['Calculez la baisse relative.','(10 − 8) / 10 = 20 %.'],
 ['Présentez une limite en anglais.','Without a control group, the report cannot establish that reminders caused the whole decrease.'],
 ],[english]),
],
DSCG7:[
 ch('problematique','Construire une problématique de mémoire',
 'Une problématique transforme un thème professionnel en question analysable. Elle doit articuler un problème, un contexte, des concepts et une possibilité d’enquête.',
 'Partir d’une difficulté observée. Délimiter les acteurs et le périmètre. Formuler une question précise, puis identifier les données qui permettraient réellement d’y répondre.',
 ['Un titre ne constitue pas toujours une problématique.','Une question orientée ne doit pas présupposer le résultat de l’enquête.'],[
 n('Thème et question','Un thème désigne un domaine. Une question problématisée indique ce qu’on cherche à comprendre ou résoudre dans un contexte délimité.','Quel énoncé est le mieux problématisé ?','Comment le contrôle des factures réduit-il les doublons dans ce service ?','Les factures dans le monde.','La comptabilité.','Les entreprises en général.'),
 n('Délimitation','La délimitation précise l’organisation, la période, le processus et les acteurs étudiés. Elle rend l’enquête réalisable et la portée des résultats identifiable.','Pourquoi délimiter le terrain ?','Pour rendre l’enquête réalisable et préciser la portée des résultats.','Pour garantir une conclusion universelle.','Pour éviter toute collecte.','Pour supprimer le contexte.'),
 n('Concept','Un concept structure l’analyse et doit être défini. Son usage doit être cohérent avec les observations et indicateurs choisis.','Quel rôle joue un concept défini ?','Organiser l’analyse et guider les observations.','Remplacer toutes les données.','Garantir la réponse sans enquête.','Augmenter seulement la longueur du texte.'),
 n('Question ouverte','Une question d’enquête ne doit pas supposer que la solution fonctionne déjà. Les résultats peuvent confirmer, nuancer ou contredire les attentes.','Quelle formulation évite de présupposer le succès ?','Quels effets observe-t-on après la mise en place du contrôle ?','Pourquoi le contrôle est-il toujours parfait ?','Comment prouver nécessairement le succès déjà certain ?','Pourquoi aucune limite n’existe-t-elle ?'),
 ],'Un candidat propose le thème « digitalisation de la comptabilité ». Il a travaillé sur une procédure de rapprochement de factures dans une équipe de huit personnes.',[
 ['Proposez une question plus délimitée.','Comment la nouvelle procédure de rapprochement affecte-t-elle la qualité et le délai de traitement des factures dans cette équipe ?'],
 ['Quels axes d’observation envisager ?','Erreurs ou doublons, délais, charge de travail, usages réels et perception des acteurs.'],
 ['Pourquoi conserver une formulation ouverte ?','Pour permettre des effets positifs, négatifs ou contrastés, plutôt que forcer les données vers une conclusion annoncée.'],
 ]),
 ch('enquete','Choisir une méthode et protéger le terrain',
 'Une méthode doit correspondre à la question et aux données accessibles. Entretiens, observations et données chiffrées produisent des éléments différents, qu’il faut analyser avec leurs limites.',
 'Justifier la sélection des observations et participants. Définir les outils de collecte, les autorisations et le traitement des données. Conserver des traces exploitables du travail personnel.',
 ['Un petit échantillon ciblé n’est pas automatiquement représentatif.','Retirer un nom ne garantit pas l’anonymisation d’un témoignage.'],[
 n('Méthode qualitative','Les entretiens permettent d’explorer les pratiques et représentations. Ils ne prouvent pas automatiquement la fréquence d’un phénomène dans toute une population.','Quel objectif convient à des entretiens exploratoires ?','Comprendre des pratiques et perceptions.','Mesurer avec certitude toute une population sans échantillon adapté.','Remplacer tous les calculs comptables.','Garantir une causalité unique.'),
 n('Méthode quantitative','Une analyse quantitative nécessite des mesures définies et des données cohérentes. La qualité du calcul ne corrige pas une collecte biaisée.','Quel contrôle précède une analyse chiffrée ?','La définition des mesures et la qualité des données.','Le nombre de graphiques uniquement.','La couleur du tableau.','Le résultat souhaité.'),
 n('Triangulation','Croiser différentes sources aide à confronter les résultats. Des désaccords doivent être analysés, pas supprimés pour rendre le récit plus simple.','Pourquoi croiser entretiens et observations ?','Pour confronter et préciser les constats.','Pour supprimer toute contradiction automatiquement.','Pour garantir un résultat universel.','Pour éviter la lecture des données.'),
 n('Protection du terrain','La diffusion dépend des autorisations, finalités et risques d’identification. Un pseudonyme peut laisser une personne identifiable par son rôle ou son contexte.','Une personne unique est identifiable par sa fonction malgré un pseudonyme. Que retenir ?','Le risque de réidentification persiste.','La donnée est forcément anonyme.','L’autorisation devient toujours inutile.','La confidentialité ne s’applique jamais.'),
 ],'Le candidat interroge les trois volontaires de son équipe et observe cinq dossiers. Il remplace les noms, mais cite la fonction du seul directeur financier.',[
 ['Quelle limite d’échantillon signaler ?','La sélection de volontaires et le petit nombre d’observations limitent la portée des conclusions et peuvent créer des biais.'],
 ['Quelle limite de confidentialité identifier ?','La fonction unique peut rendre le directeur identifiable malgré le remplacement du nom.'],
 ['Quelle amélioration proposer ?','Justifier la sélection, compléter les sources lorsque c’est possible et adapter la diffusion des détails avec les autorisations et protections nécessaires.'],
 ],[anonymisation,S.privacy]),
 ch('restitution','Interpréter, référencer et défendre le mémoire',
 'Le mémoire met en relation observations et cadre d’analyse. Une recommandation doit découler des résultats et exposer ses conditions de faisabilité, ses limites et son périmètre.',
 'Relier chaque conclusion à ses éléments de preuve. Distinguer constat, interprétation et recommandation. Attribuer les sources et préparer la défense des choix méthodologiques.',
 ['Un résultat attendu ne doit pas conduire à écarter les données qui le contredisent.','La génération de texte ne remplace pas l’enquête et l’appropriation personnelles.'],[
 n('Constat et interprétation','Un constat présente l’observation. Une interprétation propose un sens à partir du cadre et des données. Les deux doivent rester identifiables.','Quelle distinction améliore la rigueur ?','Séparer observation, interprétation et recommandation.','Confondre toute opinion avec un fait.','Masquer les données contradictoires.','Présenter une hypothèse comme un résultat certain.'),
 n('Limites','Les limites concernent notamment terrain, sélection, mesure et période. Elles situent la portée des résultats sans rendre tout le travail inutile.','Pourquoi expliquer les limites ?','Pour préciser ce que les résultats permettent de conclure.','Pour affirmer qu’aucune conclusion n’est possible.','Pour garantir une généralisation totale.','Pour remplacer toute méthode.'),
 n('Référencement','Le référencement permet de retrouver les idées et documents utilisés. Une source doit être identifiée de manière cohérente avec les exigences de la session.','Quel usage du référencement est correct ?','Attribuer les idées et documents empruntés de manière traçable.','Supprimer les auteurs pour raccourcir le texte.','Attribuer toute idée à une source non lue.','Citer seulement les titres inventés.'),
 n('Travail personnel','Le candidat doit justifier son terrain, ses données et son raisonnement. Une assistance technique ne dispense pas du travail personnel et des exigences de l’examen.','Que faut-il pouvoir défendre à la soutenance ?','Les choix, les données et le raisonnement du travail personnel.','Uniquement la mise en page.','Les réponses préparées par un tiers sans compréhension.','Un résultat inventé sans terrain.'),
 ],'Le mémoire annonce que le nouvel outil réduit les erreurs de toutes les entreprises, à partir d’une observation de vingt dossiers dans un seul cabinet.',[
 ['Quelle généralisation est excessive ?','L’affirmation portant sur toutes les entreprises dépasse le terrain et les données recueillies.'],
 ['Quelle conclusion plus rigoureuse proposer ?','Dans les dossiers et conditions étudiés, décrire les effets observés et préciser les limites de transfert à d’autres contextes.'],
 ['Comment préparer la soutenance ?','Justifier la sélection des dossiers, le calcul des résultats, les limites et les conditions des recommandations, sans inventer de nouvelles observations.'],
 ]),
],
};
