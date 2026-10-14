# SIMDCG : audit et première étape de refonte

## Périmètre et validation

Demande du 14 octobre 2026 : nouvelle direction blanc, violet et pastel. Cette préférence remplace la précédente direction noir et or pour cette refonte. Le document de recherche Gizmo est une référence visuelle, pas une source de code ou d’assets. Les captures desktop et mobile ont été inspectées. Le code, l’illustration SVG et le logo du tableau de bord sont écrits indépendamment, avec les polices système. Aucun asset ou fichier de police Gizmo n’est distribué.

Cette étape couvre les phases A à D : audit, environnement récupérable, premiers composants et tableau de bord fonctionnel. Les autres écrans restent disponibles dans leur version existante. Leur refonte, l’extension de la gamification et une publication nécessitent la validation du tableau de bord demandée dans le prompt utilisateur. Aucun déploiement ni push n’a été effectué pour cette branche.

## Sources des contenus

| Catégorie | Emplacement et usage existant |
|---|---|
| Diplômes, UE et libellés de session | `lib/curriculum.mjs`, 13 UE DCG et 7 UE DSCG |
| Chapitres, cours et repères | `lib/study-content.mjs`, `content-*.mjs`, `courses-*.mjs`, `course-builder.mjs`, `lesson-depth.mjs`, `synthesis-courses.mjs` |
| QCM, choix, réponses et explications | Modules pédagogiques existants, `question-pool.mjs`, `practice-*.mjs`, `practice-engine.mjs`, `depth-*.mjs` |
| Flashcards | Collections de notions des chapitres existants, servies par `studyModule` ; aucune carte remplacée |
| Cas et corrigés | Questions de cas des modules existants, familles chiffrées, `case-checks.mjs`, `case-rubric.mjs` |
| Sujets d’examen | `exam-bank.mjs`, 60 compositions originales ; accès et copies dans `exam-service.mjs` |
| Tableaux, cartes mentales et graphiques | `lesson-visuals.mjs`, `visual-calculations.mjs`, `src/LessonVisuals.jsx` |
| Références et images | Références déjà présentes dans les modules, fichiers existants dans `public/` |
| Catalogue public | `src/catalogue.json` : métadonnées et volumes, pas les réponses ou les cours privés |

Volumes conservés : 20 UE, 205 chapitres, 2 083 QCM de notions, 1 789 cartes de rappel, 205 modèles de cas, 824 repères. La banque existante contient aussi des variantes calculées : 638 083 questions et 159 290 cas au total. Ces variantes ne sont pas présentées comme autant de questions ou dossiers éditoriaux indépendants. Aucun contenu n’a été enrichi ou régénéré pour remplir les nouvelles cartes du tableau de bord.

Le bucket Firebase figure dans la configuration cliente. Aucun flux actif d’importation ou de sauvegarde via le SDK Storage n’a été trouvé dans le dépôt. Cela ne constitue pas un inventaire de tous les fichiers externes possédés par le propriétaire.

## Données personnelles et services

| Emplacement | Données conservées |
|---|---|
| Firebase Auth | Comptes, connexions, identifiants utilisateurs et réinitialisation du mot de passe |
| `users/{uid}` | Profil, droits Pro, historique, résultats par UE, série quotidienne et données d’abonnement |
| `userLearning/{uid}` et événements | Suivi des quatre étapes par chapitre, avec reçus idempotents |
| `userReview/{uid}/items` et événements | Rappels espacés, erreurs et historique des réponses |
| `userExams/{uid}/attempts` | Copies, horodatages, sujets figés et auto-comparaisons au barème |
| `stripeEvents` | Reçus des événements Stripe et traitement sans doublon |
| `aiUsage` | Quotas et plafonds des fonctions Groq existantes |
| `studentFeedback` | Retours privés, consentement et modération |
| `testimonials`, `meta` | Collections historiques d’avis et de statistiques |
| Stockage du navigateur | Thème existant, planning par compte et sauvegarde des brouillons de copie |

Les 11 fonctions API, les règles Firebase, les accès et les intégrations Stripe/Groq sont inchangés. Le compte Stripe partagé avec Evidstack n’a pas été utilisé. Aucune migration, lecture de compte client, export de données personnelles ou écriture de production n’a été nécessaire.

## Sauvegarde et isolation

Base : commit `29b4be88a700370674067abbff19177abfa555cd`. Archive de 154 fichiers suivis, vérifiée contre les objets Git en tenant compte des fins de ligne Windows. Archive et empreintes sont conservées dans le dossier `outputs` du chat parent. Les 94 fichiers existants protégés, comprenant le contenu, les assets, les API et les clients de données, ont été comparés par SHA-256 après restauration de leur représentation originale des fins de ligne. Tous sont identiques à la base.

Le checkout de production reste propre et inchangé. La copie isolée se trouve dans `work/simdcg-gizmo-dashboard`, branche `codex/simdcg-gizmo-dashboard`. Le Git lié à Vercel déploie automatiquement les pushes de `main` ; aucun push n’est prévu avant validation. Les changements peuvent être retirés en revenant au commit de base. Aucun export complet Firestore n’a été effectué : cette phase ne modifie pas les documents, les schémas ou les collections de production.

## Routes conservées

Public : `/`, `/tarifs`, `/avis`, `/connexion`, `/inscription`, `/fonctionnalites`, `/dcg`, `/dscg`, `/ressources`, `/contact`, `/cgu`, `/confidentialite`, `/mot-de-passe-oublie`. `/decouverte` conserve sa redirection vers les tarifs.

Étudiant : `/interface`, `/matieres`, `/matiere`, `/resume-cours`, `/qcm`, `/flashcards`, `/cas-pratique`, `/planning`, `/entretien/config`, `/entretien/simulation`, `/resultats/entretien`, `/resultats/qcm`, `/resultats/cas`, `/pro`, `/compte`, `/tuteur`, `/historique`, `/progression`, `/examens`, `/a-revoir`, `/mon-retour`.

Les paramètres d’UE et de chapitre, les garde-fous Pro et les fonctions de navigation sont conservés. Les boutons du nouveau tableau de bord appellent ces fonctions, ils ne remplacent pas les parcours par des maquettes statiques.

## Tableau de bord livré

- Coque de navigation blanche, violet principal `#7c3aed`, surfaces pastel, illustration SVG originale et interactions légères.
- Reprise de matière, accès direct au cours, QCM et cartes de la matière indiquée, changement de matière, recherche et bascule DCG/DSCG.
- Affichage des UE du planning enregistré, lorsque ce planning existe ; accès au choix des UE.
- Objectif réglable de 5, 10 ou 20 questions : comptage uniquement des QCM valides terminés aujourd’hui selon le fuseau Europe/Paris. Préférence locale sous une nouvelle clé liée au compte, sans écraser le planning ou le thème.
- Moyenne des QCM, activité et suivi par chapitre affichés séparément. Pas de XP, de badge ou de réussite à l’examen inventés à partir des anciennes données.
- États nouveau compte, chargement et erreur, reprise après erreur, navigation mobile au clavier, focus visible et respect du mouvement réduit.

## Aperçu sans production

Commande : `npm run preview:dashboard`. URL : `http://127.0.0.1:5175/?design=dashboard`.

Le serveur écoute uniquement sur l’interface locale. Il utilise un profil explicitement illustratif et les contenus existants. Les sessions d’examen et rappels passent par les fonctions existantes avec une base en mémoire. Les exercices et cours utilisent le mécanisme de développement déjà présent. Les données de démonstration ne représentent pas un élève réel et sont perdues au redémarrage du serveur ; l’objectif local reste dans ce navigateur.

La politique réseau de l’aperçu bloque les services distants. Les routes IA et paiement sont désactivées localement. Aucun compte Firebase, paiement Stripe ou quota Groq n’a été utilisé pour vérifier le tableau de bord. Le serveur d’aperçu et sa base en mémoire ne sont pas des remplacements du backend de production.

## Coût et prochaines phases

Aucun package, service payant ou appel IA nouveau. Le tableau de bord réutilise l’historique et le suivi déjà chargés ; il n’ajoute pas de requête Firestore ou d’appel de file de rappels au chargement. Les rappels sont consultés par le parcours existant lorsque l’utilisateur les ouvre. Le poids comprimé du nouveau code et de ses styles est de quelques kilo-octets ; les assets pédagogiques restent inchangés.

Après validation : étendre le design aux écrans restants, améliorer les modes d’entraînement et la répétition espacée, puis construire les récompenses avec des événements idempotents distincts des mesures académiques. Ces phases ne sont pas annoncées comme terminées dans cet aperçu.
