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
- `docs/firestore.rules.candidate` : proposition de protection des champs d’abonnement. Examiner l’édition de la base et les règles actuelles avant toute publication.

## Fichiers principaux

- `src/App.jsx` : routage, compte en direct et outils de révision.
- `src/modern.jsx`, `src/design.css` : refonte publique et espace étudiant.
- `src/profile.js` : création transactionnelle du profil sans écraser des droits.
- `src/billing-client.js` : paiement et récupération authentifiés.
- `api/stripe-checkout.js`, `api/stripe-webhook.js`, `api/stripe-reconcile.js`, `api/stripe-subscription.js` : parcours d’achat et gestion ciblée de SIMDCG.
- `lib/billing.mjs`, `lib/webhook.mjs` : validation des offres, droits et signatures.
- `api/chat.js`, `lib/ai-access.mjs` : IA avec authentification et quota côté serveur.
- `tests/` : 29 tests locaux, comprenant un parcours webhook signé avec une base simulée.

## Aperçu du design

En développement seulement, `/?design=landing` et `/?design=dashboard` affichent des données illustratives avec un bandeau explicite. Les paiements y sont désactivés. Une configuration Firebase publique factice non secrète peut être utilisée uniquement pour cet aperçu : les appels IA doivent être simulés pour les écrans pédagogiques. Le code d’aperçu est exclu du build de production.

## État de livraison

Compilation et tests locaux vérifiés. Cette archive n’a pas été mise en ligne et ne prouve pas l’activation des abonnés existants. La vérification Stripe → Firebase en environnement réel reste nécessaire, avec les règles et variables de SIMDCG. L’archive ne modifie pas le service Evidstack.
