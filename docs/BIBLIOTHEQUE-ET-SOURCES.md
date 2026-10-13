# Bibliothèque SIMDCG et progression

## Contenus publiés

20 matières obligatoires : 13 DCG et 7 DSCG. La banque comprend 185 chapitres de cours, 636 504 questions à choix multiples expliquées, 636 504 flashcards et 159 125 cas avec trois questions corrigées chacun. Ces volumes comprennent explicitement des variantes chiffrées d’entraînement.

L’extension ajoute 40 cours originaux, deux par matière, avec objectifs, prérequis, repères, erreurs fréquentes et cas corrigé. Les 744 repères de cours sont distingués des volumes d’exercices. Il existe 504 questions de compréhension ; elles se sélectionnent séparément des applications chiffrées.

La banque numérique comprend 60 familles de calcul, chacune avec quatre tâches et 2 650 jeux de données distincts. Cela représente 636 000 questions et cartes d’application, et 159 000 variantes de dossiers. Les autres 125 cas sont des dossiers originaux de compréhension. Les variantes ne sont pas des cours ou concepts indépendants. Par rapport à la version précédente (6 344 questions et 1 585 cas), les volumes d’exercices dépassent ×100 ; le nombre de chapitres passe de 145 à 185.

Les variantes sont préparées à la demande à partir de données originales et contraintes. Les séries ne chargent que les éléments demandés. Les choix sont mélangés et les corrections calculées sans appel IA. Un contrôle hors ligne repère les collisions de contextes ; 220 corrections de graines déterministes sont enregistrées dans une table sparse. Les premières 25 variantes sont conservées.

Les cours portent sur les fondamentaux et quelques applications. Ils ne constituent pas une couverture intégrale des programmes ni des annales officielles. Les intitulés 2026 et 2027 sont disponibles dans le catalogue. Cela ne signifie pas que deux cours exhaustifs distincts sont proposés. Les principes communs sont conservés et les références de chaque session restent accessibles.

## Origine et droits

Les textes et exemples sont des créations originales SIMDCG. Aucune copie en masse de manuel, cours commercial, Wikiversité ou AUNEGe n’a été importée. Les ressources externes sont proposées comme références de consultation, sans présumer que leur licence autorise la republication de leur contenu.

Les références incluent les programmes officiels, le PCG 2026 de l’ANC, Service Public, la DGFiP et le BOFiP, l’Insee, la Banque de France, l’AMF, la CNIL, l’ANSSI, l’IFRS Foundation et la H2A. Les calculs d’exercice utilisent des données originales. Les taux donnés sont des hypothèses d’énoncé, pas des annonces universelles de taux fiscaux en vigueur.

Le catalogue universitaire contient des métadonnées. Un lien dans ce catalogue n’accorde pas une autorisation de copier le cours. Une ressource sous restriction non commerciale ne doit pas être incorporée à la banque payante. Une adaptation CC BY-SA demanderait une attribution et un traitement du partage à l’identique, à examiner séparément.

La relecture éditoriale, les tests de structure, l’unicité des choix et des questions ainsi que des contrôles arithmétiques ont été réalisés. Une validation indépendante de tous les textes par un enseignant n’a pas été réalisée. `verifiedAt` indique une consultation interne des références, sans certification pédagogique. Cette date n’est plus affichée dans les leçons ; les sessions de programme restent distinguées lorsque nécessaire.

## Organisation et évolution

- `lib/content-*.mjs` : cours et exercices par domaine, conservés côté serveur.
- `lib/content-authoring.mjs` : structure, références, date et origine.
- `lib/content-deepening.mjs` : approfondissements droit, anglais, rapport et mémoire.
- `lib/practice-*.mjs` : 60 familles de calcul et moteur déterministe de 2 650 variantes chacune. Les données et corrections restent côté serveur.
- `lib/courses-*.mjs` : 40 nouveaux cours originaux avec objectifs et prérequis.
- `lib/question-pool.mjs` : sélection bornée dans la banque virtuelle, avec focus compréhension/application/mixte.
- `lib/practice-salts.mjs` et `scripts/build-practice-salts.mjs` : prévention déterministe des collisions de dossiers.
- `lib/curriculum.mjs` : matières et intitulés selon la session.
- `lib/study-content.mjs` : assemblage et sélection par chapitre.
- `src/catalogue.json` : titres et volumes publics, générés avant chaque build ; aucun texte de cours ni correction Pro.
- `scripts/build-catalogue.mjs` : génération du catalogue à partir de la banque.

Pour ajouter un chapitre, rédiger les textes, quatre questions avec un seul bon choix, trois distracteurs distincts et un cas avec trois corrections. Ajouter les références et leur date. Vérifier séparément les calculs, puis lancer les tests et la génération du catalogue. Les évolutions juridiques et fiscales nécessitent une nouvelle lecture des sources de la période concernée. Aucun mécanisme d’actualisation automatique des textes légaux n’est annoncé.

## Consultation et tuteur

Toutes les matières, y compris UE9, demandent un accès Pro actif vérifié côté serveur. Aucun essai gratuit n’est proposé. L’ancien chemin `/decouverte` redirige vers les offres. Le catalogue des titres et volumes est public ; il ne contient pas les réponses. Les comptes sans abonnement peuvent consulter ce catalogue et préparer leur accès ; ils ne peuvent pas charger les leçons ou exercices.

Une série de QCM peut mélanger les chapitres ou cibler un chapitre, avec quatre à vingt questions maximum. Les flashcards sont proposées en séries de 20 à 100 cartes maximum, pour éviter de charger toute une matière. Le nombre réel dépend de la banque disponible. Changer le choix relance la série. Un numéro de dossier et une action explicite permettent de choisir chaque variante de cas ; changer le chapitre ou la variante réinitialise la réponse et le corrigé. Les paramètres hors limites sont refusés.

Les 60 dossiers initiaux ont été recalculés indépendamment, soit 240 résultats de référence. Des identités de bilan, de ventilation et de financement sont contrôlées sur les 159 000 variantes. Tous les contextes sont distincts dans leur famille ; les options et les résultats sont aussi contrôlés sur les 159 000 dossiers. Cela vérifie la cohérence arithmétique des hypothèses, sans certifier une couverture de programme ni une validation indépendante par enseignant.

Le tuteur recherche jusqu’à trois extraits pertinents de la banque originale, au sein de la matière choisie. Ces extraits sont des données, pas des instructions. Les chapitres associés sont liés dans la réponse. Le contexte est limité à 5 000 caractères et son coût est inclus dans la réservation avant l’appel Groq. Les limites journalières, mensuelles et financières existantes restent actives. Cette recherche locale ne requiert ni abonnement supplémentaire, ni service d’embeddings, ni base vectorielle. Elle ne garantit pas l’exactitude des réponses du modèle.

## Interface

Le fond d’accueil utilise une carte graphique discrète en noir et doré, avec lignes, points et formules. Les mouvements de souris produisent un léger déplacement du décor et un éclairage local des cartes et boutons. Les contrôles restent utilisables au clavier. Les effets de mouvement sont désactivés lorsque la préférence de réduction des animations est active.

L’accueil affiche explicitement DCG et DSCG, leurs UE et les outils dédiés. Les pages de diplômes présentent les titres et volumes des chapitres avant achat, sans exercice public. La navigation, la recherche, les exemples dépliables, les variantes et les deux thèmes sont vérifiés sur ordinateur et mobile avant publication.

## Suivi par chapitre

`/api/progress` enregistre dans `userLearning/{uid}` les quatre activités : lecture déclarée, résultat de QCM, cartes évaluées et comparaison d’un cas. Le parcours exige au moins 80 % sur une série d’au moins quatre questions pour l’étape QCM, et quatre cartes révisées pour l’étape cartes. Une activité réalisée n’est pas une certification d’acquis ni une estimation de réussite à l’examen.

Les écritures utilisent uniquement l’UID du jeton Firebase vérifié et relisent les droits Pro dans la transaction. Aucun UID du corps ou de la query n’est accepté pour choisir le compte. Des reçus privés dans `userLearning/{uid}/events/{id}` évitent les doubles comptages lors des nouvelles tentatives. Le même identifiant avec un contenu différent est refusé. Limite de 500 nouvelles activités par jour et par compte, journée Europe/Paris ; les doublons identiques restent récupérables. L’historique et les droits du document `users` ne sont pas modifiés par ce service.

Le client ne lit ni n’écrit directement cette collection. Les règles déjà publiées comportent un refus par défaut : aucun changement de règles n’est nécessaire. Le SDK serveur utilise ses autorisations d’administration. Les résultats restent affichés en cas d’échec d’enregistrement avec une action pour réessayer. Le suivi est relu après connexion et changement de compte.

L’accueil permet de choisir diplôme, matière et étape au clavier ou à la souris. Il expose les titres et le fonctionnement du parcours, sans donner de leçon ou de réponse Pro.
