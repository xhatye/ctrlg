# Examens, révisions et retours : fonctionnement

## Banque d’examens

60 compositions originales SIMDCG, soit trois par UE : fondamentaux, dossiers intermédiaires et synthèse. Chaque composition réunit trois dossiers indépendants, six annexes et douze questions. Le total du barème est exactement 20. Les sujets réorganisent des cas originaux de la bibliothèque ; certains dossiers sont partagés entre compositions. Ils ne sont pas des annales officielles et ne couvrent pas l’intégralité de chaque épreuve. Aucune annale dont les droits sont incertains n’est importée.

Le mode à temps limité propose 90 minutes en DCG et 120 en DSCG. Ces durées sont celles de l’exercice, pas des durées officielles. Toutes les réponses sont écrites, y compris les entraînements aux compétences orales. Le mode libre ne comporte pas de délai. La copie compte au maximum 24 000 caractères et 3 000 par réponse.

Le serveur conserve la session et fixe le délai. Une reprise après fermeture retrouve la même échéance. La copie est sauvegardée après les modifications ; un brouillon local lié au compte et à la session aide à récupérer une modification interrompue. Le numéro de version évite le remplacement silencieux d’une copie ouverte dans deux fenêtres. Après l’échéance, seules les réponses déjà reçues sont retenues. Le corrigé et ses critères sont envoyés uniquement après remise ou expiration.

La comparaison au barème est déclarative. Le score affiché est une estimation personnelle. Aucun texte rédigé n’est automatiquement noté par ces cases. L’impression conserve la copie, ses annexes et ses éléments de correction.

## Révisions personnalisées

Les nouvelles séries de QCM et de cartes alimentent les rappels. Le serveur recalcule la justesse d’un QCM à partir de la réponse canonique ; il n’accepte pas un indicateur de réussite choisi par le client. Pour une carte, le rappel suit la difficulté déclarée par l’élève. Les anciennes activités ne sont pas transformées artificiellement en rappels individuels.

Après une difficulté : rappel à un jour. Après des réussites consécutives : 1, 3, 7, 14, 30 puis 60 jours. Les dates sont enregistrées sur le serveur. La page affiche jusqu’à 40 rappels dus et 40 difficultés à la fois, avec des séries bornées à 20 notions. Après traitement, une actualisation présente les rappels suivants.

Les suggestions de chapitres prennent en compte les réponses encore difficiles et les éléments absents dans les six dernières copies comparées. Pour un chapitre partagé entre plusieurs copies, la comparaison la plus récente prévaut. Ces suggestions ne constituent pas une certification de maîtrise.

Le suivi accepte jusqu’à 500 nouveaux enregistrements par jour et 20 000 notions suivies. Les nouvelles sessions d’examen sont limitées à 20 par jour. Les jours de quota suivent Europe/Paris. Les reprises et tentatives identiques sont idempotentes.

## Données et accès

Firestore existant : projet simdcg-2d8d7, base (default), édition STANDARD, mode natif, europe-west1. Les nouvelles données sont privées, servies par Firebase Admin après contrôle de l’identité :

- userExams/{uid}/attempts/{sessionId} : copie, échéance, version et comparaison.
- userReview/{uid}/items/{hash} : état de rappel, sans recopier toute la banque pédagogique.
- userReview/{uid}/events/{receipt} : reçus d’activité pour éviter les doublons.
- studentFeedback/{uid} : un retour par auteur, son accord et son état de vérification.

Les règles existantes refusent les accès directs à ces collections par le navigateur. Aucun changement de règles, index composé, fournisseur ou facturation IA n’est nécessaire. Les examens et révisions exigent un Pro actif côté serveur. Le catalogue d’examen ne livre que les titres, thèmes, durées et volumes. Le retrait de l’accord de publication reste accessible à l’auteur authentifié sans exiger Pro.

## Retours d’étudiants et modération

Le formulaire exige un compte ayant utilisé un chapitre ou un sujet. Le retour est privé par défaut. L’accord de publication est facultatif. Chaque transmission ou modification passe à l’état pending. Les appréciations favorables comme les critiques doivent pouvoir être publiées ; la note ne doit pas servir à écarter les retours négatifs.

Avant publication, l’équipe vérifie qu’il s’agit d’un retour authentique et pertinent, sans informations personnelles sur d’autres personnes ni données sensibles. Elle publie seulement lorsque publicationConsent est true, en passant status à published dans la console Firebase. L’API publique ne renvoie que le pseudonyme, le diplôme, le texte et l’appréciation. Aucun email ou identifiant de compte n’est exposé. L’auteur peut retirer son accord depuis le formulaire ; le retour passe à withdrawn et disparaît de l’API publique.

Les tests utilisent des comptes synthétiques et des retours explicitement marqués comme tests, privés et supprimés après vérification. Aucun faux témoignage n’est présenté au public. Aucun message n’est envoyé à des étudiants par ces scripts.

La notice du formulaire et la politique de confidentialité décrivent les nouvelles données. Référence pour l’information au moment de la collecte : https://www.cnil.fr/fr/informer-les-personnes. Cette documentation ne constitue pas un audit juridique exhaustif.

## Captures publiques

Trois images montrent de vrais écrans de cours, de dossier et de corrigé, avec une copie illustrative. Il s’agit d’extraits statiques ; aucun parcours d’essai gratuit n’est ajouté. Les captures s’agrandissent dans une fenêtre accessible au clavier et défilable sur téléphone.

Chaque copie d’examen conserve la version de son sujet et de son corrigé au début de la session. Un ajout de chapitres ou une modification ultérieure de la banque ne change donc pas une copie en cours ou terminée. Le corrigé conservé n’est jamais inclus dans la réponse API d’une session active.

Les rappels portent une empreinte du contenu pédagogique. Lorsqu’une question change, le suivi est repris sans attribuer à la nouvelle question les erreurs de l’ancienne. Les références retirées sont archivées sans supprimer leur historique et cessent de bloquer la file des rappels.

## Chapitre offert et première révision

La page publique /exemple-gratuit offre uniquement le chapitre UE9/reperes : cours complet, fiche et dix QCM issus de la banque relue. Le fichier public est construit avec une sélection fixe ; aucun paramètre ne peut étendre cette sélection. Les API de cours et de progression conservent leurs contrôles de compte et d’accès actif. Le test public ne crée aucun historique étudiant et ne déclenche aucun appel IA.

La page privée /premiere-session propose cinq questions avec correction immédiate. Un compte sans accès actif retrouve cinq questions de ce même exemple UE9 ; un membre actif choisit parmi les vingt UE. Les membres actifs enregistrent les réponses avec les mécanismes existants de suivi et de rappels ; un échec partiel reste signalé. Les dates des rappels suivent la logique existante, sans promettre que toute erreur est due immédiatement. La prochaine étape ouvre la fiche du bon chapitre ou les rappels.

Les nouvelles inscriptions accèdent à ce parcours, sauf si un paiement déjà choisi doit être ouvert. Le tableau de bord propose aussi le parcours aux comptes sans activité. Un repère local, séparé par compte, mémorise le choix de masquer ou de terminer cette introduction. Il ne modifie jamais les droits payants ni les résultats scolaires.
