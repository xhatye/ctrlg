# Bibliothèque SIMDCG, version du 13 octobre 2026

## Contenus publiés

20 matières obligatoires : 13 DCG et 7 DSCG. La banque comprend 73 chapitres de cours, 296 questions à choix multiples expliquées, 296 flashcards et 73 cas originaux avec trois questions corrigées chacun. Les textes de cours, méthodes, mises en situation et corrections représentent environ 15 450 mots hors questions et distracteurs.

Les sept matières ajoutées sont DCG UE5, UE8, UE11, UE12, UE13 et DSCG UE6, UE7. Les matières déjà présentes reçoivent chacune trois chapitres supplémentaires. Les anciens repères sont conservés dans un chapitre distinct.

Les cours portent sur les fondamentaux et quelques applications. Ils ne constituent pas une couverture intégrale des programmes ni des annales officielles. Les intitulés 2026 et 2027 sont disponibles dans le catalogue. Cela ne signifie pas que deux cours exhaustifs distincts sont proposés. Les principes communs sont conservés et les références de chaque session restent accessibles.

## Origine et droits

Les textes et exemples sont des créations originales SIMDCG. Aucune copie en masse de manuel, cours commercial, Wikiversité ou AUNEGe n’a été importée. Les ressources externes sont proposées comme références de consultation, sans présumer que leur licence autorise la republication de leur contenu.

Les références incluent les programmes officiels, le PCG 2026 de l’ANC, Service Public, la DGFiP et le BOFiP, l’Insee, la Banque de France, l’AMF, la CNIL, l’ANSSI, l’IFRS Foundation et la H2A. Les calculs d’exercice utilisent des données originales. Les taux donnés sont des hypothèses d’énoncé, pas des annonces universelles de taux fiscaux en vigueur.

Le catalogue universitaire contient des métadonnées. Un lien dans ce catalogue n’accorde pas une autorisation de copier le cours. Une ressource sous restriction non commerciale ne doit pas être incorporée à la banque payante. Une adaptation CC BY-SA demanderait une attribution et un traitement du partage à l’identique, à examiner séparément.

La relecture éditoriale, les tests de structure, l’unicité des choix et des questions ainsi que des contrôles arithmétiques ont été réalisés. Une validation indépendante de tous les textes par un enseignant n’a pas été réalisée. `verifiedAt` indique la date de consultation des références ; ce champ n’est pas une certification pédagogique.

## Organisation et évolution

- `lib/content-*.mjs` : cours et exercices par domaine, conservés côté serveur.
- `lib/content-authoring.mjs` : structure, références, date et origine.
- `lib/curriculum.mjs` : matières et intitulés selon la session.
- `lib/study-content.mjs` : assemblage et sélection par chapitre.
- `src/catalogue.json` : titres et volumes publics, générés avant chaque build ; aucun texte de cours ni correction Pro.
- `scripts/build-catalogue.mjs` : génération du catalogue à partir de la banque.

Pour ajouter un chapitre, rédiger les textes, quatre questions avec un seul bon choix, trois distracteurs distincts et un cas avec trois corrections. Ajouter les références et leur date. Vérifier séparément les calculs, puis lancer les tests et la génération du catalogue. Les évolutions juridiques et fiscales nécessitent une nouvelle lecture des sources de la période concernée. Aucun mécanisme d’actualisation automatique des textes légaux n’est annoncé.

## Consultation et tuteur

La comptabilité UE9 est accessible gratuitement : quatre chapitres, vingt QCM, vingt cartes et quatre cas. Les autres matières demandent un accès Pro actif vérifié côté serveur. Le catalogue des titres est public ; il ne contient pas les réponses.

Une série de QCM peut mélanger les chapitres ou cibler un chapitre, avec quatre à vingt questions maximum. Le nombre réel dépend du nombre de questions disponibles. Changer le choix relance la série. Les flashcards se filtrent par chapitre et les cas réinitialisent la réponse et l’affichage du corrigé lors d’un changement de chapitre.

Le tuteur recherche jusqu’à trois extraits pertinents de la banque originale, au sein de la matière choisie. Ces extraits sont des données, pas des instructions. Les chapitres associés sont liés dans la réponse. Le contexte est limité à 5 000 caractères et son coût est inclus dans la réservation avant l’appel Groq. Les limites journalières, mensuelles et financières existantes restent actives. Cette recherche locale ne requiert ni abonnement supplémentaire, ni service d’embeddings, ni base vectorielle. Elle ne garantit pas l’exactitude des réponses du modèle.

## Interface

Le fond d’accueil utilise une carte graphique discrète en noir et doré, avec lignes, points et formules. Les mouvements de souris produisent un léger déplacement du décor et un éclairage local des cartes et boutons. Les contrôles restent utilisables au clavier. Les effets de mouvement sont désactivés lorsque la préférence de réduction des animations est active.

La navigation par chapitre, la recherche, les exemples dépliables, les deux thèmes et le parcours gratuit sont vérifiés sur ordinateur et mobile avant publication.
