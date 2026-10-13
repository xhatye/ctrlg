# Révisions autonomes et budget du tuteur

## Contenus livrés

La bibliothèque comprend 20 matières (13 DCG, 7 DSCG), 205 chapitres, 2 083 QCM de notions expliqués, 1 789 flashcards de rappel et 205 modèles de cas. Les variantes sont comptées séparément : 60 familles numériques, 636 000 questions de calcul et 159 000 variantes de dossiers. Chaque chapitre dispose d’un cours développé, d’une méthode, d’un glossaire et d’un atelier corrigé. Les cas de compréhension proposent aussi un atelier de révision du même dossier ; cet atelier ne compte pas comme un nouveau modèle. La couverture du programme reste partielle. Voir [Bibliothèque et sources](BIBLIOTHEQUE-ET-SOURCES.md).

Le contenu est assemblé par `lib/study-content.mjs` côté serveur. `/api/study` fournit les données ; toutes les matières exigent un jeton Firebase valide et un accès Pro actif relu dans Firestore. Aucun essai gratuit ne subsiste ; `/decouverte` redirige vers `/tarifs`. Les titres et volumes restent publics, sans intégrer les leçons ou réponses au bundle public. Les QCM mélangent les questions et les réponses sans modifier la solution. Les cartes sont servies en séries bornées. Les élèves choisissent compréhension, calculs ou mélange ; le mode compréhension évite qu’une grande banque numérique masque les notions. Les variantes de cas se choisissent explicitement. Le planning utilise une répartition déterministe et se conserve dans le navigateur du compte. Les cas guidés vérifient une étape chiffrée ou un choix de raisonnement puis montrent l’explication. Les cas écrits proposent un retour IA facultatif. La préparation de l’oral reste entièrement écrite, sans microphone ni analyse de voix. Aucun de ces parcours ne produit une note officielle.

## Tuteur optionnel

Le tuteur utilise `openai/gpt-oss-20b` chez Groq. Prix de référence vérifié le 12 octobre 2026 : 0,075 USD par million de tokens entrants, 0,30 USD par million de tokens sortants. Aucun changement de clé n’est nécessaire. La disponibilité du modèle pour la clé configurée est vérifiée par `/api/tutor-status`, en lecture seule et avec un cache de cinq minutes. Ce contrôle ne prouve pas à lui seul qu’une génération est autorisée par le budget du fournisseur.

Limites serveur : 20 demandes/jour (Europe/Paris), 300/mois, 12 messages, 12 000 caractères au total, 4 000 par message et 2 048 tokens de complétion maximum (raisonnement inclus). Avant l’appel, une transaction réserve une estimation conservatrice en dollars : coût entrant majoré à partir des octets UTF-8 et marge de protocole, plus le maximum sortant. Plafonds de réservation : 1,50 USD par utilisateur et 20 USD pour toute l’application par mois. Ce sont des plafonds estimés dans l’application, pas une garantie de facturation Groq : surveiller aussi le compte fournisseur et réviser les prix en cas de changement. Les requêtes échouées après réservation la conservent par prudence ; une clé absente ne consomme pas le quota.

Les compteurs restent dans `aiUsage`, interdite aux clients par les règles déjà publiées. Les révisions enregistrées, le planning et la préparation orale n’appellent jamais `/api/chat` et restent utilisables en cas d’indisponibilité ou de budget épuisé du tuteur.

## Paiements

La notification Checkout du paiement d’octobre a été renvoyée depuis Stripe le 12 octobre 2026 à 13:58 CEST. L’endpoint production a répondu HTTP 200 avec `received: true` et `isPro: true`. Il s’agit d’un événement réel signé, sans nouveau débit. Le code accepte aussi l’ancien événement `invoice.payment_succeeded`, en complément de `invoice.paid` ; chacun relit l’abonnement canonique.

La configuration recommandée est limitée aux événements traités par SIMDCG : checkout.session.completed, checkout.session.async_payment_succeeded, customer.subscription.created/updated/deleted/paused/resumed, invoice.paid, invoice.payment_succeeded, invoice.payment_failed, charge.refunded, charge.dispute.created et charge.dispute.closed. Le filtrage des offres reste côté serveur pour le compte Stripe partagé avec Evidstack.

## Progression autonome

Le suivi par chapitre est enregistré côté serveur dans une collection privée `userLearning`, sans réinitialiser l’historique précédent. Lecture, quiz, cartes et cas forment quatre étapes explicitement définies. Les cas restent des comparaisons au corrigé, sans note IA inventée. Rechargement et reconnexion relisent le suivi ; les échecs peuvent être réessayés sans doubler les activités. Ni cette progression, ni la création des variantes n’utilisent Groq.

## Retour facultatif sur les cas écrits

`/api/case-review` exige une authentification et un accès Pro actif. Le serveur choisit le corrigé canonique ; le client ne peut pas remplacer les attendus. Réponse : 40 à 6 000 caractères. Le modèle reste `openai/gpt-oss-20b`, avec 1 600 tokens de sortie maximum. Limites supplémentaires : 5 demandes par jour et 60 par mois, incluses dans les 20 demandes par jour et 300 par mois ainsi que les budgets existants. Une réservation est conservée même si le fournisseur échoue ensuite. Le retour est facultatif, sans note, et peut être indisponible avec les quotas gratuits. Les exercices guidés et le corrigé restent accessibles. Aucun Developer Tier Groq n’a été activé pour cette mise à jour.
