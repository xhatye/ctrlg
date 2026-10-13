# Bibliothèque SIMDCG, version du 13 octobre 2026

## Contenus publiés

20 matières obligatoires : 13 DCG et 7 DSCG. La banque comprend 145 chapitres de cours, 6 344 questions à choix multiples expliquées, 6 344 flashcards et 1 585 cas avec trois questions corrigées chacun. Ces volumes comprennent explicitement des variantes chiffrées d’entraînement.

La première extension proposait 73 chapitres, 296 QCM et cartes, et 73 cas. La deuxième ajoute 60 chapitres d’application chiffrée, 12 chapitres de droit, anglais et méthodologie professionnelle, ainsi que 1 500 variantes de dossiers et 6 000 questions d’application. Les anciens repères sont conservés. Les QCM, cartes et cas dépassent vingt fois les volumes de la première extension. Le nombre de matières reste conforme aux deux diplômes ; les variantes ne sont pas présentées comme des chapitres supplémentaires.

Les 584 repères de cours sont distingués des volumes d’exercices. Une famille d’application comporte quatre tâches de calcul et 25 jeux de données, avec hypothèses, méthode, erreurs à éviter et interprétation. Les cartes d’application reprennent un exercice de rappel ou de calcul : les 6 344 cartes ne correspondent pas à 6 344 concepts théoriques distincts. Les choix chiffrés sont mélangés et les corrections calculées sans appel IA.

Les cours portent sur les fondamentaux et quelques applications. Ils ne constituent pas une couverture intégrale des programmes ni des annales officielles. Les intitulés 2026 et 2027 sont disponibles dans le catalogue. Cela ne signifie pas que deux cours exhaustifs distincts sont proposés. Les principes communs sont conservés et les références de chaque session restent accessibles.

## Origine et droits

Les textes et exemples sont des créations originales SIMDCG. Aucune copie en masse de manuel, cours commercial, Wikiversité ou AUNEGe n’a été importée. Les ressources externes sont proposées comme références de consultation, sans présumer que leur licence autorise la republication de leur contenu.

Les références incluent les programmes officiels, le PCG 2026 de l’ANC, Service Public, la DGFiP et le BOFiP, l’Insee, la Banque de France, l’AMF, la CNIL, l’ANSSI, l’IFRS Foundation et la H2A. Les calculs d’exercice utilisent des données originales. Les taux donnés sont des hypothèses d’énoncé, pas des annonces universelles de taux fiscaux en vigueur.

Le catalogue universitaire contient des métadonnées. Un lien dans ce catalogue n’accorde pas une autorisation de copier le cours. Une ressource sous restriction non commerciale ne doit pas être incorporée à la banque payante. Une adaptation CC BY-SA demanderait une attribution et un traitement du partage à l’identique, à examiner séparément.

La relecture éditoriale, les tests de structure, l’unicité des choix et des questions ainsi que des contrôles arithmétiques ont été réalisés. Une validation indépendante de tous les textes par un enseignant n’a pas été réalisée. `verifiedAt` indique la date de consultation des références ; ce champ n’est pas une certification pédagogique.

## Organisation et évolution

- `lib/content-*.mjs` : cours et exercices par domaine, conservés côté serveur.
- `lib/content-authoring.mjs` : structure, références, date et origine.
- `lib/content-deepening.mjs` : approfondissements droit, anglais, rapport et mémoire.
- `lib/practice-*.mjs` : 60 familles de calcul et moteur déterministe de 25 variantes chacune. Les données et corrections restent côté serveur.
- `lib/curriculum.mjs` : matières et intitulés selon la session.
- `lib/study-content.mjs` : assemblage et sélection par chapitre.
- `src/catalogue.json` : titres et volumes publics, générés avant chaque build ; aucun texte de cours ni correction Pro.
- `scripts/build-catalogue.mjs` : génération du catalogue à partir de la banque.

Pour ajouter un chapitre, rédiger les textes, quatre questions avec un seul bon choix, trois distracteurs distincts et un cas avec trois corrections. Ajouter les références et leur date. Vérifier séparément les calculs, puis lancer les tests et la génération du catalogue. Les évolutions juridiques et fiscales nécessitent une nouvelle lecture des sources de la période concernée. Aucun mécanisme d’actualisation automatique des textes légaux n’est annoncé.

## Consultation et tuteur

Toutes les matières, y compris UE9, demandent un accès Pro actif vérifié côté serveur. Aucun essai gratuit n’est proposé. L’ancien chemin `/decouverte` redirige vers les offres. Le catalogue des titres et volumes est public ; il ne contient pas les réponses. Les comptes sans abonnement peuvent consulter ce catalogue et préparer leur accès ; ils ne peuvent pas charger les leçons ou exercices.

Une série de QCM peut mélanger les chapitres ou cibler un chapitre, avec quatre à vingt questions maximum. Les flashcards sont proposées en séries de 20 à 100 cartes maximum, pour éviter de charger toute une matière. Le nombre réel dépend de la banque disponible. Changer le choix relance la série. Un sélecteur permet de choisir chaque variante de cas ; changer le chapitre ou la variante réinitialise la réponse et le corrigé. Les paramètres hors limites sont refusés.

Les 60 dossiers initiaux ont été recalculés indépendamment, soit 240 résultats de référence. Des identités de bilan, de ventilation et de financement sont contrôlées sur les 1 500 variantes. Cela vérifie la cohérence arithmétique des hypothèses, sans certifier une couverture de programme ni une validation indépendante par enseignant.

Le tuteur recherche jusqu’à trois extraits pertinents de la banque originale, au sein de la matière choisie. Ces extraits sont des données, pas des instructions. Les chapitres associés sont liés dans la réponse. Le contexte est limité à 5 000 caractères et son coût est inclus dans la réservation avant l’appel Groq. Les limites journalières, mensuelles et financières existantes restent actives. Cette recherche locale ne requiert ni abonnement supplémentaire, ni service d’embeddings, ni base vectorielle. Elle ne garantit pas l’exactitude des réponses du modèle.

## Interface

Le fond d’accueil utilise une carte graphique discrète en noir et doré, avec lignes, points et formules. Les mouvements de souris produisent un léger déplacement du décor et un éclairage local des cartes et boutons. Les contrôles restent utilisables au clavier. Les effets de mouvement sont désactivés lorsque la préférence de réduction des animations est active.

L’accueil affiche explicitement DCG et DSCG, leurs UE et les outils dédiés. Les pages de diplômes présentent les titres et volumes des chapitres avant achat, sans exercice public. La navigation, la recherche, les exemples dépliables, les variantes et les deux thèmes sont vérifiés sur ordinateur et mobile avant publication.
