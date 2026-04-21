# Plan d'enrichissement du rapport IA

## Contexte actuel

Le pipeline actuel est deja bien structure:

- generation des prompts dans `lib/scanner/prompts.ts`
- execution multi-providers dans `lib/scanner/pipeline.ts`
- extraction structuree minimale dans `lib/ai/audit-format.ts`
- normalisation par reponse dans `lib/scanner/analyzer.ts`
- calcul des scores dans `lib/scanner/scorer.ts`
- assemblage du rapport dans `lib/scanner/report-generator.ts`
- rendu du rapport dans `app/report/[id]/page.tsx`

Le schema Supabase n'impose pas de migration SQL bloquante pour cette evolution, car `results` et `report` sont deja stockes en `JSONB` dans `supabase-schema.sql`.

## Objectif produit

Ajouter des insights plus utiles pour l'utilisateur final sans rendre le rapport "magique" ou fragile:

- positionnement prix / valeur percue
- forces et faiblesses recurrentes
- ressenti du marche
- polarisation
- consensus ou divergence entre IA
- resume executif long
- recommandations plus contextuelles

## Principes de conception

1. Ne pas toucher au score global dans un premier temps.
2. Toute nouvelle metrique doit remonter a des observations stockees.
3. Eviter les faux chiffres precis: preferer labels + confiance.
4. Ne montrer un insight que s'il atteint un seuil minimal de confiance.
5. Adapter les aspects analyses au `siteFamily` / `siteType`, pas un schema unique pour tout le monde.

## Ce qu'il manque aujourd'hui

Le pipeline conserve surtout:

- presence
- rang
- sentiment global
- concurrents
- hallucinations factuelles

Mais il perd plusieurs signaux deja disponibles dans les reponses:

- `answer_short`
- `excerpt`
- `citation`
- `top_entities`

Et il n'extrait pas encore:

- criteres de comparaison
- gagnant/perdant par critere
- signaux de prix / valeur
- motifs "recommande dans quels cas / deconseille dans quels cas"
- accord entre providers

## Strategie recommandee

Je recommande une approche en 2 etages.

### Etage 1: enrichir legerement chaque reponse

On garde le modele actuel "1 prompt -> 3 providers -> 1 analyse par reponse", mais on stocke plus de matiere utile.

Changements:

- Conserver dans `AnalysisResult` les champs structurels `answerShort`, `excerpt`, `citation`, `topEntities`.
- Ajouter un petit bloc d'observations standardisees:
  - `aspectObservations`
  - `comparisonObservations`
  - `priceObservation`

Important:

- ne pas demander un "grand resume" a chaque provider
- ne pas calculer les scores finaux a ce niveau
- ne pas ajouter 15 champs libres qui vont destabiliser le JSON

### Etage 2: faire une seule passe d'agregation par audit

Apres les 30 reponses, lancer une seule passe d'agregation LLM a partir d'un paquet d'observations normalisees.

Cette passe produit:

- positionnement marche
- prix / valeur percue
- forces / points de friction
- consensus / divergence entre IA
- polarisation
- resume executif long
- plan d'action plus fin

Avantage:

- cout controle
- logique robuste
- output plus stable
- plus facile a valider

## Nouveau schema de donnees propose

### Extensions de `AnalysisResult`

Ajouter dans `types/index.ts`:

```ts
type AspectKey =
  | 'price'
  | 'value'
  | 'quality'
  | 'reliability'
  | 'support'
  | 'ease_of_use'
  | 'selection'
  | 'delivery'
  | 'returns'
  | 'availability'
  | 'expertise'
  | 'authority'
  | 'clarity'
  | 'speed'
  | 'trust';

interface AspectObservation {
  aspect: AspectKey;
  entity: 'target' | 'competitor' | 'market';
  sentiment: 'positive' | 'neutral' | 'negative';
  intensity: 1 | 2 | 3;
  evidence: string;
}

interface ComparisonObservation {
  competitor: string;
  aspect: AspectKey;
  winner: 'target' | 'competitor' | 'tie' | 'mixed' | 'unclear';
  evidence: string;
}

interface PriceObservation {
  label: 'budget' | 'value' | 'premium' | 'mixed' | 'unknown';
  direction: 'cheaper' | 'similar' | 'more_expensive' | 'mixed' | 'unknown';
  evidence: string;
}
```

Puis etendre `AnalysisResult` avec:

- `answerShort?: string`
- `excerpt?: string`
- `citation?: string`
- `topEntities?: Array<{ name: string; rank: number | null; role: 'target' | 'competitor' | 'other' }>`
- `aspectObservations?: AspectObservation[]`
- `comparisonObservations?: ComparisonObservation[]`
- `priceObservation?: PriceObservation | null`

### Nouveau bloc `report.marketInsights`

Ajouter dans `Report`:

```ts
marketInsights?: {
  pricePositioning: {
    label: 'budget' | 'value' | 'premium' | 'mixed' | 'undetermined';
    confidence: 'high' | 'medium' | 'low';
    summary: string;
  };
  marketSentiment: {
    label: 'positive' | 'mixed' | 'negative' | 'undetermined';
    confidence: 'high' | 'medium' | 'low';
    summary: string;
  };
  polarization: {
    level: 'low' | 'medium' | 'high';
    confidence: 'high' | 'medium' | 'low';
    summary: string;
  };
  aiConsensus: {
    level: 'strong' | 'partial' | 'fragmented';
    confidence: 'high' | 'medium' | 'low';
    summary: string;
  };
  strengths: Array<{ label: string; confidence: 'high' | 'medium' | 'low' }>;
  weaknesses: Array<{ label: string; confidence: 'high' | 'medium' | 'low' }>;
  comparisonCriteria: Array<{
    aspect: string;
    outcome: 'advantage' | 'mixed' | 'weakness';
    confidence: 'high' | 'medium' | 'low';
    summary: string;
  }>;
  executiveSummaryLong: string;
}
```

## Adaptation des prompts

### Ne pas toucher au socle des 10 prompts du score

Le pack actuel `10 prompts x 3 providers` doit rester stable.

Raison:

- il alimente la lecture "citation / visibilite"
- il alimente le benchmark concurrentiel
- il doit rester comparable dans le temps
- si on injecte trop de prompts qui citent explicitement la marque, on biaise la couche de visibilite

Conclusion:

- ne pas remplacer les 10 prompts existants pour cette evolution
- ne pas faire entrer les nouveaux prompts dans le calcul du score global
- ne pas faire entrer les nouveaux prompts dans la matrice de citation

### Ajouter un pack separe d'insight prompts

Les nouveaux besoins doivent passer par un second petit pack, distinct du score:

1. un prompt `pros/cons`
2. un prompt `prix/valeur`
3. optionnellement un prompt `quand recommande / quand non`

### Pack d'insight recommande

Version recommandee:

- conserver `10 prompts x 3 providers` inchanges pour la visibilite
- ajouter `2 prompts x 3 providers` pour les insights
- ajouter `1 passe d'agregation` ensuite

Ainsi:

- la couche "score/citation" reste propre
- la couche "analyse narrative" devient plus riche
- on peut afficher `consensus / divergence entre IA` aussi sur les nouveaux signaux

### Nouveaux prompts a introduire dans le pack insight

Pour les familles `software_family`, `commerce_family`, `service_family`, `learning_family`:

- `Quels sont les principaux avantages et limites des options les plus citees pour {mainOffer} ?`
- `Comment {siteName} se positionne-t-il sur le prix et la valeur percue face aux alternatives ?`

Fallback pour `content_family` et `institutional_family`:

- `Quels sont les principaux avantages et limites des options les plus citees pour {mainOffer} ?`
- `Comment {siteName} est-il percu en termes d'accessibilite, fiabilite et valeur percue face aux alternatives ?`

### Changement de schema JSON dans `buildStructuredAuditPrompt`

Le JSON attendu peut etre etendu prudemment avec:

- `aspects`
- `comparisons`
- `price_positioning`

Format recommande:

```json
{
  "answer_short": "...",
  "mentioned": true,
  "position": 2,
  "sentiment": "positive",
  "top_entities": [],
  "competitors": [],
  "aspects": [
    {
      "aspect": "price",
      "entity": "target",
      "sentiment": "positive",
      "intensity": 2,
      "evidence": "..."
    }
  ],
  "comparisons": [
    {
      "competitor": "Competitor A",
      "aspect": "support",
      "winner": "target",
      "evidence": "..."
    }
  ],
  "price_positioning": {
    "label": "value",
    "direction": "similar",
    "evidence": "..."
  },
  "excerpt": "...",
  "citation": "..."
}
```

### Nouveau routage recommande dans `PromptQuery`

Ajouter dans `types/index.ts`:

- `analysisTrack?: 'scoring' | 'insight'`
- `affectsVisibilityScore?: boolean`
- `affectsCitationMatrix?: boolean`

Valeurs recommandees:

- prompts actuels: `analysisTrack: 'scoring'`
- nouveaux prompts de marque: `analysisTrack: 'insight'`
- prompts insight: `affectsVisibilityScore: false`
- prompts insight: `affectsCitationMatrix: false`

Important:

le flag `brandAnchored` ne suffit pas a lui seul.

Aujourd'hui, il est deja utilise pour certains calculs de benchmark, mais pas comme garde-fou global sur toute la couche de score. Si on ajoute des prompts marques, il faut une separation explicite entre:

- donnees de score
- donnees d'insight

## Taxonomie d'aspects par famille

Le plus important: ne pas analyser les memes aspects pour tout le monde.

### `software_family`

- price
- value
- ease_of_use
- reliability
- support
- speed

### `commerce_family`

- price
- value
- selection
- delivery
- returns
- support

### `service_family`

- price
- availability
- expertise
- trust
- speed
- support

### `learning_family`

- price
- value
- quality
- selection
- support
- reliability

### `content_family`

- quality
- authority
- clarity
- reliability
- accessibility

### `institutional_family`

- clarity
- reliability
- trust
- accessibility
- authority

## Regles de robustesse

### 1. Regles d'affichage

Un insight ne doit pas etre affiche si:

- moins de 2 observations soutiennent le point
- ou un seul provider le porte
- ou l'evidence textuelle est vide / generique

### 2. Confiance

- `high`: au moins 3 observations, au moins 2 providers, faible contradiction
- `medium`: 2 observations, ou accord partiel entre providers
- `low`: 1 observation ou contradiction forte

Si la confiance est `low`, afficher `Non determine` ou masquer le bloc.

### 3. Polarisation

Ne pas inventer une polarisation globale.

Calcul recommande:

- compter les observations positives et negatives par aspect
- polarisation elevee si un meme aspect a des signaux positifs ET negatifs significatifs
- polarisation faible si un pole domine nettement

### 4. Prix

Ne montrer un verdict prix que pour les familles/secteurs eligibles.

Sinon afficher:

- `Positionnement prix non determine`
- ou basculer sur `valeur percue`

### 5. Resume long

Le resume long doit etre genere a partir d'un input structure, jamais directement depuis les reponses brutes.

Template recommande:

- position actuelle
- perception dominante
- points forts recurrents
- points de friction recurrents
- lecture du prix / valeur
- niveau d'accord entre IA
- priorites d'action

## Agregation proposee

Creer un nouveau module, par exemple `lib/report/market-insights.ts`.

Responsabilites:

1. construire un paquet compact d'observations a partir de `results.analyses`
2. lancer une passe d'agregation LLM unique
3. normaliser le JSON de sortie
4. appliquer les garde-fous de confiance
5. fournir un fallback heuristique si l'agregation echoue

Fonctions cibles:

- `buildMarketInsightsInput(results)`
- `generateMarketInsights(input, profile)`
- `normalizeMarketInsights(raw, input)`
- `buildExecutiveSummaryLong(marketInsights, score, crawl)`

## Evolution du rendu

### Ordre de lecture recommande

1. Score global
2. Fiabilite + sous-scores
3. Visibilite par modele
4. Positionnement marche
5. Forces et points de friction
6. Criteres de comparaison
7. Resume executif long
8. Hallucinations
9. Analyse concurrentielle
10. Audit technique
11. Plan d'action

### Nouvelles sections UI

#### Bloc `Positionnement marche`

4 cartes compactes:

- prix / valeur percue
- ressenti marche
- polarisation
- accord entre IA

#### Bloc `Forces et points de friction`

Deux colonnes:

- `Ce qui vous aide a etre recommande`
- `Ce qui freine la recommandation`

Chaque item affiche:

- un libelle court
- un badge de confiance

#### Bloc `Criteres de comparaison`

Table simple:

- critere
- lecture du marche
- verdict
- confiance

#### Bloc `Resume executif`

Texte long, 2 a 3 paragraphes max, structure narrative stable.

## Recommandations d'implementation par phase

### Phase 1 - Fondations de donnees

Fichiers:

- `types/index.ts`
- `lib/ai/audit-format.ts`
- `lib/scanner/analyzer.ts`
- `lib/ai/mock.ts`

Livrables:

- nouveaux champs dans `AnalysisResult`
- parsing des nouveaux champs
- conservation de `answer_short`, `excerpt`, `citation`

### Phase 2 - Pack insight separe

Fichier:

- `lib/scanner/prompts.ts`

Livrables:

- ajout d'un second pack `insight`
- ajout des angles `pros/cons` et `prix/valeur`
- fallback intelligent selon `siteFamily`
- separation claire `scoring` vs `insight`

### Phase 3 - Moteur d'insights

Fichiers:

- nouveau `lib/report/market-insights.ts`
- `lib/scanner/report-generator.ts`

Livrables:

- agregation
- score de confiance
- resume executif long
- nouveaux blocs `report.marketInsights`

### Phase 4 - Rendu UI

Fichier:

- `app/report/[id]/page.tsx`

Livrables:

- nouvelles cartes "positionnement marche"
- bloc "forces / points de friction"
- table "criteres de comparaison"
- bloc "resume executif"

### Phase 5 - Recommandations enrichies

Fichier:

- `lib/scanner/report-generator.ts`

Livrables:

- recommandations qui referencent les nouveaux signaux
- ex: prix mal percu, fiabilite floue, manque de clarte, absence sur certains criteres

## Ce que je ferais maintenant

Ordre optimal:

1. Etendre les types et stocker les evidences deja produites
2. Ajouter un pack insight separe de 2 prompts
3. Isoler techniquement `scoring` et `insight`
4. Construire le moteur `marketInsights`
5. Integrer l'UI
6. Rebrancher les recommandations sur ces nouveaux signaux

## Decision produit recommandee

Pour la premiere version:

- oui aux nouveaux blocs narratifs et labels
- oui a la confiance visible
- oui au resume long
- non a un nouveau score global
- non a trop de decimales
- non a une section "sources externes" tant que `AIResponse` ne stocke pas de citations fiables

## Phase 2 optionnelle apres la V1

Si on veut aller plus loin ensuite:

- etendre `AIResponse` pour stocker les citations renvoyees par Perplexity
- ajouter un bloc "sources qui faconnent la perception"
- calculer un score de fraicheur des preuves
- separer "ce que disent les IA" de "ce que citent les sources"
