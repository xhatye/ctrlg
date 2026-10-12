# SIMDCG — correction et mise en ligne

Cette version est préparée à partir de `ctrlg-main.zip`, puis du dépôt `xhatye/ctrlg`. Le 12 octobre 2026, la première version corrigée a été publiée avec l’autorisation de l’utilisateur. Un événement Checkout réel signé a ensuite été renvoyé depuis Stripe : HTTP 200, `received: true`, `isPro: true`. Aucun nouveau débit n’a été créé. Voir `REVISION-SANS-IA.md` pour les contenus enregistrés et le budget du tuteur.

## Ce qui a changé

- Les nouveaux achats passent par `/api/stripe-checkout`, après vérification du jeton Firebase. Le serveur ajoute l’identifiant utilisateur dans les métadonnées de la session et de l’abonnement. Le navigateur ne choisit ni l’utilisateur à activer, ni le prix Stripe.
- Les anciens achats sont retrouvés à partir de l’adresse normalisée et de Firebase Authentication. La casse de l’email ne conditionne plus le rapprochement. Une adresse réellement différente nécessite une recherche par le support.
- Le webhook utilise les octets originaux de la requête avec le SDK Stripe. Un paiement non confirmé n’active pas de droit. Un problème de traitement renvoie 500, au lieu d’un succès silencieux. Les écritures et reçus sont transactionnels ; les doublons sont ignorés.
- Les événements ne concernent que les identifiants de prix SIMDCG. Une métadonnée `app` explicitement différente de `simdcg` est ignorée. Un abonnement est relu chez Stripe pour éviter qu’un ancien événement ne réactive un abonnement annulé.
- Les Packs Examen sont suivis séparément des abonnements. L’annulation de l’un ne supprime pas un autre accès encore valide. Rejouer un ancien achat ne redémarre pas sa période de 90 jours. Les remboursements et litiges des packs sont pris en compte.
- Le navigateur écoute les droits Firestore en direct. L’inscription ne remplace plus un document utilisateur qui aurait déjà été créé par le webhook.
- « Mon compte » permet de rechercher un paiement existant. La récupération par email exige un email vérifié ; un retour Checkout utilise la référence de session et vérifie que l’achat appartient au compte connecté.
- La génération IA exige un compte authentifié et un accès Pro actif. Le quota du tuteur optionnel est réservé par transaction côté serveur : 20 demandes par jour, fuseau Europe/Paris, 300 par mois, avec réservations de coût limitées. Les révisions enregistrées, le planning et la préparation orale fonctionnent sans IA. Le contenu entrant et le budget de réponse sont limités. Une erreur de génération n’est plus remplacée par un score d’entretien inventé.
- L’arrêt du renouvellement agit sur les abonnements SIMDCG enregistrés pour le compte connecté, sans passer par un portail générique pouvant afficher les abonnements Evidstack du même client.

## Installation locale

Utiliser Node.js 22 ou 24. Exécuter `npm ci`, puis `npm test` et `npm run build`. `npm run dev` démarre la prévisualisation de l’interface ; les fonctions serveur nécessitent un environnement Vercel pour être invoquées réellement.

Créer `.env.local` à partir de `.env.example` avec la configuration du projet SIMDCG. Aucun secret n’est fourni dans l’archive. Le projet Firebase du navigateur et `FIREBASE_PROJECT_ID` doivent être le même projet SIMDCG.

Les routes `?design=landing` et `?design=dashboard` sont des aperçus de développement. Elles sont explicitement illustratives et ne sont pas compilées dans la version de production. Elles ne doivent pas servir de preuve d’un paiement ou d’un apprentissage réel.

## Prix et clé Stripe

Les offres attendues sont 15 € par mois et 29 € pour 90 jours. Deux moyens de configuration :

1. Renseigner `STRIPE_SIMDCG_MONTHLY_PRICE_ID` et `STRIPE_SIMDCG_PACK_PRICE_ID` avec les prix précis de SIMDCG dans le même environnement Stripe que la clé.
2. À défaut, le serveur retrouve les prix associés aux deux liens de paiement déjà présents dans l’ancien projet. Ces URLs figurent dans `lib/billing.mjs`. L’outil refuse un prix, une devise ou une périodicité inattendus.

Le mode test doit utiliser des prix de test et son propre secret de webhook. Les URLs de paiement historiques sont celles de l’ancien projet ; elles ne constituent pas une configuration de test. Une clé restreinte doit avoir les droits nécessaires sur Checkout, les prix et liens de paiement, les clients, abonnements, PaymentIntents, charges et litiges. Pour récupérer un ancien achat, la recherche de clients doit aussi être autorisée.

## Avant une mise en production

1. Identifier le projet Vercel relié à `xhatye/ctrlg`, sa branche de production, le projet Firebase SIMDCG, l’édition de la base et les règles réellement déployées. L’archive seule ne permet pas de vérifier ces éléments.
2. Vérifier les variables serveur et publiques sans afficher leurs secrets. `SIMDCG_SITE_URL` doit être l’origine HTTPS réellement utilisée, par défaut `https://simdcg.com`.
3. Examiner `docs/firestore.rules.candidate` et l’adapter aux règles existantes. Il protège notamment `isPro`, les dates Pro, `simdcgBilling`, `billingRecoveryAt`, les reçus Stripe et les quotas. Ne pas remplacer aveuglément les règles existantes : conserver les autres fonctions réellement utilisées. Les compteurs publics anciens sont désactivés en écriture dans cette proposition.
4. Faire un paiement de test sur un déploiement de préproduction connecté à un projet Firebase de test. Vérifier le même parcours avec email et connexion Google. Une prévisualisation d’interface seule ne teste pas les fonctions Stripe/Firebase.
5. Après validation, mettre le code en production et vérifier la bonne URL du webhook, son secret dédié et ses événements. Le secret appartient à ce point de terminaison SIMDCG, pas à celui d’Evidstack.

## Événements à écouter sur `/api/stripe-webhook`

`checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`, `invoice.paid`, `invoice.payment_succeeded`, `invoice.payment_failed`, `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`.

Un événement d’une autre offre est ignoré après contrôle du prix. Le compte Stripe peut rester partagé, mais les endpoints et secrets de webhook doivent être identifiés séparément. Un échec de paiement relit le statut courant de l’abonnement : il ne retire pas arbitrairement un autre achat valide.

## Paiements déjà concernés

Pour le paiement d’octobre signalé par Zaid : vérifier la session Checkout, son état de paiement et son prix, retrouver le compte Firebase correspondant, puis utiliser la récupération ou rejouer l’événement après déploiement du correctif. Confirmer ensuite `isPro`, la présence du reçu de traitement, puis le déblocage dans une session utilisateur. La capture et le mail seuls ne confirment pas l’état actuel de son abonnement.

Pour le paiement de 29 € du 25 juin : confirmer d’abord l’offre et la date. Si c’est bien un Pack Examen de 90 jours, sa période d’origine serait expirée au 12 octobre. Une compensation ou un remboursement éventuels sont une décision distincte ; le correctif ne crée pas un nouvel accès de sa propre initiative.

Une récupération échoue si l’email de paiement est réellement différent du compte, si aucun utilisateur n’existe, si le prix historique a été remplacé, si l’achat n’est pas une session Checkout, ou si les droits Stripe de la clé sont insuffisants. Dans ces cas, examiner l’achat précis avant toute correction manuelle. Ne jamais activer un accès uniquement à partir d’un montant.

## Vérifications réalisées

44 tests automatisés locaux : normalisation d’email, contrôle des prix et de l’app, paiement non réglé, doublons, droits cumulés, expiration, abonnement annulé, propriété d’un achat, quota et taille des conversations, signature Stripe sur corps UTF-8, altération de signature, échec avec réponse 500, activation d’un utilisateur simulé et nouvelle tentative après un échec de transaction.

Compilation de production réussie. 40 vues visuelles contrôlées aux largeurs 1440 et 390 pixels, sans erreur JavaScript ni débordement horizontal détecté. Interactions contrôlées : filtrage des matières, QCM jusqu’au résultat, discussion avec un tuteur simulé. Les données d’aperçu, les réponses IA et les services de paiement/base de données de ces tests sont simulés.

Vérifié en production le 12 octobre : lecture Firestore, correspondance des projets, lecture des offres Stripe et traitement d’un événement Checkout réel signé avec `isPro: true`. Le parcours d’un nouvel achat complet et une génération réelle du tuteur après changement de modèle restent à vérifier. Les captures de règles publiées proviennent de l’utilisateur ; aucune règle supplémentaire n’est nécessaire pour la nouvelle collection de compteurs, qui reste `aiUsage`.

## Sources techniques

- [Stripe — Checkout Sessions](https://docs.stripe.com/api/checkout/sessions/create)
- [Stripe — paramètres de Payment Links](https://docs.stripe.com/payment-links/url-parameters)
- [Vercel — Node.js et Web Request handlers](https://vercel.com/docs/functions/runtimes/node-js)
- [Vercel — corps original d’une requête](https://vercel.com/kb/guide/how-do-i-get-the-raw-body-of-a-serverless-function)

Le contrôle GET /api/health vérifie en lecture seule la correspondance des projets Firebase, l’accès à la base et les deux offres Stripe. Il ne crée aucun achat et ne modifie aucun utilisateur.
