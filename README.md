# IA-Check - Audit de Visibilité IA

Application web pour auditer la visibilité d'une entreprise dans les réponses des IA (ChatGPT, Claude, Perplexity).

## Stack Technique

- **Framework**: Next.js 14+ (App Router)
- **Base de données**: Supabase (PostgreSQL + Auth)
- **Paiement**: Stripe Checkout (9,99€)
- **APIs IA**: OpenAI, Anthropic, Perplexity
- **Email**: Resend
- **Hébergement**: Vercel
- **Styling**: Tailwind CSS

## Setup

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Copier `.env.local.example` vers `.env.local` et remplir les valeurs:

```bash
cp .env.local.example .env.local
```

Variables requises:
- `NEXT_PUBLIC_SUPABASE_URL`: URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clé service role Supabase
- `STRIPE_SECRET_KEY`: Clé secrète Stripe (mode test)
- `STRIPE_WEBHOOK_SECRET`: Secret webhook Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Clé publique Stripe
- `OPENAI_API_KEY`: Clé API OpenAI
- `ANTHROPIC_API_KEY`: Clé API Anthropic
- `PERPLEXITY_API_KEY`: Clé API Perplexity
- `RESEND_API_KEY`: Clé API Resend
- `NEXT_PUBLIC_BASE_URL`: URL de base (http://localhost:3000 en dev)
- `APP_BASE_URL`: URL serveur canonique (utilisée pour Stripe success/cancel)
- `AUDIT_ACCESS_SECRET`: secret de signature des tokens d’accès audit (32+ caractères)
- `SCAN_WORKER_TOKEN`: secret pour protéger `/api/internal/scan-worker`

### 3. Créer la base de données Supabase

1. Créer un nouveau projet sur [supabase.com](https://supabase.com)
2. Aller dans l'éditeur SQL
3. Copier-coller le contenu de `supabase-schema.sql`
4. Exécuter le script

### 4. Configurer Stripe

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Activer le mode test
3. Récupérer les clés API dans Dashboard > Developers > API keys
4. Configurer le webhook:
   - URL: `https://votre-domaine.com/api/webhooks/stripe`
   - Événements: `checkout.session.completed`
   - Récupérer le secret du webhook

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Structure du Projet

```
/app
  /page.tsx                    → Hero page (champ URL + bouton scan)
  /scan/[id]/page.tsx          → Page de chargement animée
  /results/[id]/page.tsx       → Page résultats floutés (paywall)
  /checkout/[id]/page.tsx      → Redirection Stripe
  /report/[id]/page.tsx        → Rapport complet (après paiement)
  /api
    /scan/route.ts             → Lance le scan
    /scan/[id]/status/route.ts → Polling du statut
    /webhooks/stripe/route.ts  → Webhook Stripe
    /report/[id]/route.ts      → Retourne le rapport
/lib
  /supabase.ts                 → Client Supabase
  /stripe.ts                   → Client Stripe
  /sectors.ts                  → Liste des secteurs
  /ai
    /openai.ts                 → Appels OpenAI
    /anthropic.ts              → Appels Anthropic
    /perplexity.ts             → Appels Perplexity
  /scanner
    /prompts.ts                → Générateur de prompts
    /analyzer.ts               → Analyse des réponses
    /crawl.ts                  → Crawl technique du site
    /scorer.ts                 → Calcul du score
    /report-generator.ts       → Assemblage du rapport
/types
  /index.ts                    → Types TypeScript
```

## Développement

Le projet est développé en suivant un plan étape par étape:

- **ÉTAPE 0**: Architecture & Setup ✅
- **ÉTAPE 1**: Backend - Système de scan
- **ÉTAPE 2**: Backend - Paiement Stripe
- **ÉTAPE 3**: Pages Frontend
- **ÉTAPE 4**: Tests & Validation

## Coûts Estimés par Audit

- OpenAI (GPT-4o-mini): ~15-20 requêtes × $0.15/1K tokens ≈ $0.10
- Anthropic (Claude Sonnet): ~15-20 requêtes × $0.75/1M tokens ≈ $0.05
- Perplexity (Sonar): ~15-20 requêtes × $0.20/requête ≈ $3.50
- **Total**: ~$3.65 par audit
- **Marge**: 9.99€ - 3.65$ ≈ 6€ par audit

## Notes Importantes

- Pas de mock/placeholder - tout est fonctionnel
- Le scan tourne en background (30-60 secondes)
- Le rapport est une page web partageable (pas de PDF)
- Chaque rapport partagé inclut un bandeau CTA d'acquisition
# Qory
# Qory
