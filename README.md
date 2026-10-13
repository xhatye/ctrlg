# SIMDCG — version corrigée et refonte

Préparation DCG/DSCG, React + Vite, Firebase Authentication et Firestore, Stripe, Groq, fonctions Vercel.

Cette archive contient les sources corrigées. Elle ne contient ni secrets, ni comptes clients, ni dépendances installées, ni build prêt à déployer avec une configuration de production.

## Installation

1. Utiliser Node.js 22 ou 24.
2. Exécuter `npm ci`.
3. Créer `.env.local` à partir de `.env.example`, avec la configuration SIMDCG.
4. Exécuter `npm test`, puis `npm run build`.
5. `npm run dev` permet d’ouvrir l’interface. Les fonctions API doivent être testées avec Vercel.

## Documents à lire

- `docs/DEPLOIEMENT.md` : correction de paiement, variables, événements Stripe, règles Firebase à examiner, tests et limites de vérification.
- `docs/DESIGN.md` : spécification complète en 18 parties, pages, composants, mobile et fonctionnalités futures distinctes de celles livrées.
- `docs/REVISION-SANS-IA.md` : banque de départ, limites de couverture, planning autonome et budgets du tuteur optionnel.
- `docs/firestore.rules.candidate` : proposition de protection des champs d’abonnement. Examiner l’édition de la base et les règles actuelles avant toute publication.

## Fichiers principaux

- `src/App.jsx` : routage, compte en direct et outils de révision.
- `src/modern.jsx`, `src/design.css` : refonte publique et espace étudiant.
- `src/profile.js` : création transactionnelle du profil sans écraser des droits.
- `src/billing-client.js` : paiement et récupération authentifiés.
- `api/stripe-checkout.js`, `api/stripe-webhook.js`, `api/stripe-reconcile.js`, `api/stripe-subscription.js` : parcours d’achat et gestion ciblée de SIMDCG.
- `lib/billing.mjs`, `lib/webhook.mjs` : validation des offres, droits et signatures.
- `lib/study-content.mjs`, `api/study.js`, `src/study.jsx` : 20 matières, 185 chapitres, 1 863 QCM de notions, 1 609 cartes de rappel et 185 modèles de cas servis sans IA, avec contrôle Pro côté serveur.
- `api/case-review.js`, `lib/case-review.mjs`, `lib/case-checks.mjs` : vérification locale des étapes et retour IA écrit facultatif, limité à 5 demandes par jour et 60 par mois dans le budget du tuteur.
- `api/chat.js`, `lib/ai-budget.mjs` : tuteur optionnel avec authentification et réservations de budget transactionnelles.
- `tests/` : 73 tests locaux, comprenant un parcours webhook signé avec une base simulée et les limites de budget.

## Aperçu du design

En développement seulement, `/?design=landing` et `/?design=dashboard` affichent des données illustratives avec un bandeau explicite. Les paiements y sont désactivés. Une configuration Firebase publique factice non secrète peut être utilisée uniquement pour cet aperçu : les appels IA doivent être simulés pour les écrans pédagogiques. Le code d’aperçu est exclu du build de production.

## État de livraison

Compilation, 73 tests locaux et 40 vues ordinateur/mobile vérifiés. Le 12 octobre 2026, le renvoi d’un événement Checkout réel signé a reçu une réponse HTTP 200 avec `isPro: true` sur le site de production. Cela confirme le traitement de cet achat existant ; aucun nouveau paiement n’a été créé. La banque de révision couvre partiellement les matières et devra être enrichie et relue pédagogiquement. Le service Evidstack conserve son propre endpoint et ses déploiements.
