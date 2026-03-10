# CTRL·G — Simulateur d'entretien Contrôle de Gestion

Simulateur IA pour préparer les entretiens CdG (DCG, DSCG, Bac+5 finance).

## Déploiement en 3 étapes (5 minutes)

### Prérequis
- [Node.js](https://nodejs.org) installé
- [Git](https://git-scm.com) installé
- Compte [GitHub](https://github.com) (gratuit)
- Compte [Vercel](https://vercel.com) (gratuit)
- Clé API [Anthropic](https://console.anthropic.com) (pay-as-you-go, ~0.10€/entretien)

---

### Étape 1 — Installer et tester en local

```bash
npm install
npm run dev
```
Ouvrir http://localhost:5173 — l'app tourne en local.

### Étape 2 — Pousser sur GitHub

```bash
git init
git add .
git commit -m "init ctrlg"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/ctrlg.git
git push -u origin main
```

### Étape 3 — Déployer sur Vercel

1. Aller sur [vercel.com](https://vercel.com) → "Add New Project"
2. Importer le repo GitHub `ctrlg`
3. Dans **Environment Variables**, ajouter :
   - `VITE_ANTHROPIC_API_KEY` = votre clé `sk-ant-...`
4. Cliquer **Deploy** → votre app est live sur `ctrlg.vercel.app` en 60 secondes

---

## Configuration post-déploiement

### Stripe (paiement)
1. Créer un produit sur [stripe.com](https://stripe.com) → "9€/mois, abonnement"
2. Copier le Payment Link
3. Dans `src/App.jsx` ligne 8, remplacer `https://buy.stripe.com/YOUR_LINK_HERE` par votre vrai lien

### Domaine personnalisé
Dans Vercel → Settings → Domains → ajouter `ctrlg.fr` ou votre domaine.

---

## Stack technique
- **Frontend** : React + Vite
- **IA** : Claude Sonnet (Anthropic API)
- **Graphiques** : Recharts
- **Déploiement** : Vercel (CDN global)
- **Paiement** : Stripe (Payment Links)

## Structure
```
ctrlg/
├── src/
│   ├── App.jsx      # Application complète
│   └── main.jsx     # Entry point React
├── index.html       # Template HTML + meta SEO
├── vite.config.js   # Config Vite
└── package.json
```
