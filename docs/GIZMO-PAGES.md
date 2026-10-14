# SIMDCG : extension du design aux autres pages

Le tableau de bord a été validé par l’utilisateur, qui a demandé la refonte des autres pages. Cette version étend le système blanc, violet et pastel à l’accueil, aux pages d’information, aux tarifs, aux avis, aux formulaires d’accès, à la bibliothèque, aux chapitres, aux cours, aux QCM, aux cartes, aux cas, aux examens, aux rappels, au planning, à la progression, à l’historique, au compte, au tuteur et à la préparation de l’oral par écrit. Les anciens écrans de résultats et d’accès Pro utilisent également les nouveaux rôles de couleur.

## Comportements conservés et améliorations

- Navigation étudiante unifiée, navigation mobile au clavier et liens vers les routes existantes.
- Mode clair par défaut et mode sombre violet/anthracite disponible. Nouvelle clé `simdcg-theme-v2` ; l’ancienne préférence reste stockée sous sa clé originale et n’est pas effacée. Aucun planning ou brouillon n’est réinitialisé.
- Nouveau logo d’onglet, icône téléphone et image de partage. Les anciens assets restent dans le dépôt. Vingt nouvelles variantes pastel des icônes d’UE gardent la forme et les symboles SIMDCG existants ; aucun asset Gizmo n’est réutilisé.
- Contrôles QCM et cartes regroupés dans une section repliable sur téléphone, sans changement des options ni du contenu. La modification des paramètres relance toujours la série comme auparavant.
- Révélation des cartes avec une transition courte, faces cachées correctement exposées à l’accessibilité, raccourcis clavier inchangés.
- Bonnes et mauvaises réponses QCM identifiées par texte et couleur. Choix verrouillés après réponse ; correction originale et calcul du score conservés.
- Liens d’inscription et de mot de passe oublié accessibles et fonctionnels dans l’aperçu.
- Nouvelles captures du cours sur l’amortissement, d’un sujet original de comptabilité et de son corrigé, prises dans l’interface réelle de l’aperçu. La copie est explicitement illustrative ; aucun témoignage étudiant n’est inventé.
- Mouvement réduit respecté et impression des copies adaptée à la nouvelle navigation.

## Intégrité, coûts et limites

Les 94 fichiers protégés de contenus, d’API, d’assets originaux et de clients de données sont identiques à la sauvegarde de base. Les 20 UE et 205 chapitres, les QCM, les cartes, les corrigés, les références et les variantes restent inchangés. Aucun compte, abonnement, historique ou document Firebase de production n’a été consulté ou modifié pour développer cette refonte. Aucune migration, dépendance ou API IA payante n’a été ajoutée. Les services de facturation, leurs autorisations et leurs quotas restent inchangés.

Cette livraison concerne la refonte des pages et les interactions existantes. Elle n’annonce pas de nouveau système XP, de nouvel algorithme FSRS, de classement ou de nouveaux types de questions. La répétition espacée et le suivi actuels restent opérationnels. Les tests de connexion et de paiement concernent les contrôles existants automatisés ; aucune transaction réelle ni création de compte de production n’a été réalisée dans l’aperçu isolé.

## Validation

- 101 tests automatisés réussis et build de production réussi.
- 120 affichages de 30 écrans : 1440/390 px, modes clair/sombre, sans débordement horizontal ni erreur JavaScript.
- 28 vérifications finales supplémentaires couvrant les formulaires, les exercices, les avis, l’accès Pro, les états de résultats historiques et l’accueil des nouveaux comptes.
- QCM terminé, bilan mis à jour, retournement et auto-évaluation des cartes, planning par UE enregistré/rechargé, galerie agrandie/fermée, menu mobile au clavier et mouvement réduit vérifiés.
- Capture des QCM après stabilisation de l’animation pour éviter de confondre un état transitoire avec un défaut de contraste.
- Les services locaux utilisent une base de test en mémoire et bloquent les accès externes. Aucun appel IA ou paiement lors des vérifications.

La version est enregistrée sur la branche isolée `codex/simdcg-gizmo-dashboard`. Aucune publication n’a été effectuée : le prompt utilisateur exige une autorisation explicite pour la mise en ligne. Aperçu : `http://127.0.0.1:5175/?design=landing` ; commande de lancement : `npm run preview:dashboard`.
