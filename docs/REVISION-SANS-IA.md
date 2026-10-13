# Révisions autonomes et budget du tuteur

## Contenus livrés

La version du 13 octobre 2026 contient 20 matières (13 DCG, 7 DSCG), 73 chapitres de cours, 296 QCM, 296 flashcards et 73 cas originaux. L’ancienne banque de 56 notions est conservée dans des chapitres de repères. Les nouveaux chapitres comportent une introduction, une méthode, quatre notions et un cas à trois questions corrigées. Ces contenus couvrent partiellement les programmes ; ce ne sont pas des annales officielles. Les calculs sont contrôlés séparément. Voir [Bibliothèque et sources](BIBLIOTHEQUE-ET-SOURCES.md) pour la provenance et les limites de validation.

Le contenu est stocké dans `lib/study-content.mjs` côté serveur. `/api/study` fournit les données ; les matières Pro exigent un jeton Firebase valide et un accès actif relu dans Firestore. UE9 est un parcours gratuit, disponible sans connexion sur `/decouverte`. Les autres contenus ne sont pas intégrés au bundle JavaScript public. Les QCM mélangent les questions et les réponses sans modifier la solution. Le planning utilise une répartition déterministe et se conserve dans le navigateur du compte. Les cas et la préparation orale utilisent une comparaison avec un corrigé enregistré, sans note automatique inventée.

## Tuteur optionnel

Le tuteur utilise `openai/gpt-oss-20b` chez Groq. Prix de référence vérifié le 12 octobre 2026 : 0,075 USD par million de tokens entrants, 0,30 USD par million de tokens sortants. Aucun changement de clé n’est nécessaire. La disponibilité du modèle pour la clé configurée est vérifiée par `/api/tutor-status`, en lecture seule et avec un cache de cinq minutes. Ce contrôle ne prouve pas à lui seul qu’une génération est autorisée par le budget du fournisseur.

Limites serveur : 20 demandes/jour (Europe/Paris), 300/mois, 12 messages, 12 000 caractères au total, 4 000 par message et 2 048 tokens de complétion maximum (raisonnement inclus). Avant l’appel, une transaction réserve une estimation conservatrice en dollars : coût entrant majoré à partir des octets UTF-8 et marge de protocole, plus le maximum sortant. Plafonds de réservation : 1,50 USD par utilisateur et 20 USD pour toute l’application par mois. Ce sont des plafonds estimés dans l’application, pas une garantie de facturation Groq : surveiller aussi le compte fournisseur et réviser les prix en cas de changement. Les requêtes échouées après réservation la conservent par prudence ; une clé absente ne consomme pas le quota.

Les compteurs restent dans `aiUsage`, interdite aux clients par les règles déjà publiées. Les révisions enregistrées, le planning et la préparation orale n’appellent jamais `/api/chat` et restent utilisables en cas d’indisponibilité ou de budget épuisé du tuteur.

## Paiements

La notification Checkout du paiement d’octobre a été renvoyée depuis Stripe le 12 octobre 2026 à 13:58 CEST. L’endpoint production a répondu HTTP 200 avec `received: true` et `isPro: true`. Il s’agit d’un événement réel signé, sans nouveau débit. Le code accepte aussi l’ancien événement `invoice.payment_succeeded`, en complément de `invoice.paid` ; chacun relit l’abonnement canonique.

La configuration recommandée est limitée aux événements traités par SIMDCG : checkout.session.completed, checkout.session.async_payment_succeeded, customer.subscription.created/updated/deleted/paused/resumed, invoice.paid, invoice.payment_succeeded, invoice.payment_failed, charge.refunded, charge.dispute.created et charge.dispute.closed. Le filtrage des offres reste côté serveur pour le compte Stripe partagé avec Evidstack.
