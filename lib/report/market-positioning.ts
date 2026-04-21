import type {
  CrawlResult,
  InsightResults,
  PromptProfileSnapshot,
  Report,
} from '@/types';
import { queryOpenAIMarketPositioning } from '@/lib/ai/openai';
import { logInfo, logWarn } from '@/lib/logger';
import { buildFallbackMarketInsights } from './market-insights';

type MarketInsights = NonNullable<Report['marketInsights']>;

const MARKET_POSITIONING_MAX_TOKENS = 1200;
const CONFIDENCE_VALUES = new Set(['high', 'medium', 'low']);
const SENTIMENT_VALUES = new Set([
  'very_positive',
  'positive',
  'mixed_positive',
  'mixed',
  'mixed_negative',
  'negative',
  'insufficient_signal',
]);
const POLARIZATION_VALUES = new Set(['low', 'moderate', 'high', 'insufficient_signal']);
const PRICE_VALUES = new Set(['budget', 'accessible', 'mid_market', 'premium', 'high_end', 'unclear']);
const TRUST_VALUES = new Set(['low', 'moderate', 'high', 'unclear']);
const SIGNAL_VALUES = new Set(['weak', 'medium', 'strong']);
const SOURCE_TYPE_VALUES = new Set([
  'reviews',
  'directories',
  'comparison_content',
  'community_discussions',
  'official_pages',
  'editorial_mentions',
  'other',
]);
const SOURCE_WEIGHT_VALUES = new Set(['low', 'medium', 'high']);

export async function buildMarketInsights(params: {
  auditId?: string;
  insightResults?: InsightResults | null;
  promptProfile?: PromptProfileSnapshot;
  crawl: CrawlResult;
  topCompetitorName?: string | null;
}): Promise<MarketInsights> {
  const fallback = buildFallbackMarketInsights({
    insightResults: params.insightResults,
    topCompetitorName: params.topCompetitorName,
  });
  const prompt = buildMarketPositioningQuery(params);
  const structuredPrompt = buildStructuredMarketPositioningPrompt(params);
  const response = await queryOpenAIMarketPositioning(
    prompt,
    structuredPrompt,
    MARKET_POSITIONING_MAX_TOKENS
  );

  if (response.providerStatus !== 'success' || !response.response.trim()) {
    logWarn('market_positioning_fallback', {
      auditId: params.auditId,
      phase: 'report_market_positioning',
      provider_status: response.providerStatus || 'unknown',
      error: response.error || 'empty_response',
    });
    return fallback;
  }

  const parsed = parseMarketPositioningResponse(response.response);
  if (!parsed) {
    logWarn('market_positioning_parse_failed', {
      auditId: params.auditId,
      phase: 'report_market_positioning',
      model: response.model,
      response_preview: response.response.slice(0, 500),
    });
    return fallback;
  }

  const normalized = normalizeMarketInsights(parsed, {
    fallback,
    model: response.model,
  });

  logInfo('market_positioning_built', {
    auditId: params.auditId,
    phase: 'report_market_positioning',
    provider: normalized.provider,
    model: normalized.model || null,
    market_sentiment: normalized.marketSentiment.label,
    price_positioning: normalized.pricePositioning.label,
    polarization: normalized.polarization.level,
    trust_level: normalized.trustLevel.level,
    signal_strength: normalized.signalStrength,
    strengths_count: normalized.strengths.length,
    weaknesses_count: normalized.weaknesses.length,
    comparison_axes_count: normalized.comparisonAxes.length,
    alternative_families_count: normalized.alternativeFamilies.length,
  });

  return normalized;
}

function buildMarketPositioningQuery(params: {
  promptProfile?: PromptProfileSnapshot;
  crawl: CrawlResult;
}): string {
  const company = params.crawl.businessInfo.name?.trim() || params.promptProfile?.siteName || 'cette entreprise';
  const offer = params.promptProfile?.mainOffer || params.promptProfile?.mainTopic || 'son marché';
  return `Quel est le positionnement marché perçu de ${company} pour ${offer} ?`;
}

function buildStructuredMarketPositioningPrompt(params: {
  insightResults?: InsightResults | null;
  promptProfile?: PromptProfileSnapshot;
  crawl: CrawlResult;
  topCompetitorName?: string | null;
}): string {
  const company = params.crawl.businessInfo.name?.trim() || params.promptProfile?.siteName || 'Cette entreprise';
  const description = params.crawl.businessInfo.description?.trim() || 'N/A';
  const services = params.crawl.businessInfo.services.slice(0, 8);
  const priorities = getSourcePriorities(params.promptProfile);
  const signals = summarizeInternalSignals(params.insightResults, params.topCompetitorName);

  return [
    'Tu produis une fiche "Positionnement Marché" pour un rapport d’audit IA.',
    'Utilise la recherche web pour trouver des signaux publics récents et plausibles.',
    'Ne te limite pas au site officiel.',
    'Privilégie des signaux synthétiques plutôt que des citations longues d’avis.',
    'N’invente rien. Si le signal est insuffisant, retourne insufficient_signal, unclear ou des listes vides.',
    'Tu dois privilégier les familles de sources ci-dessous avant de conclure.',
    `Entreprise cible: "${company}"`,
    params.promptProfile
      ? `Contexte marché: type=${params.promptProfile.siteType}; famille=${params.promptProfile.siteFamily}; vertical=${params.promptProfile.domainVertical}; offre=${params.promptProfile.mainOffer}; sujet=${params.promptProfile.mainTopic}; zone=${params.promptProfile.geoScope || 'n/a'}`
      : 'Contexte marché: inconnu',
    `Description du site: ${description}`,
    services.length > 0 ? `Services ou offres visibles: ${services.join(', ')}` : 'Services ou offres visibles: n/a',
    params.topCompetitorName ? `Concurrent le plus cité en interne: ${params.topCompetitorName}` : 'Concurrent le plus cité en interne: n/a',
    'Indices internes déjà observés par le système:',
    JSON.stringify(signals, null, 2),
    'Priorités de recherche par ordre décroissant:',
    ...priorities.map((item, index) => `${index + 1}. ${item}`),
    'Format JSON STRICT attendu:',
    '{',
    '  "market_sentiment": { "label": "very_positive|positive|mixed_positive|mixed|mixed_negative|negative|insufficient_signal", "confidence": "high|medium|low", "summary": string },',
    '  "polarization": { "level": "low|moderate|high|insufficient_signal", "confidence": "high|medium|low", "summary": string },',
    '  "price_positioning": { "label": "budget|accessible|mid_market|premium|high_end|unclear", "confidence": "high|medium|low", "summary": string },',
    '  "trust_level": { "level": "low|moderate|high|unclear", "confidence": "high|medium|low", "summary": string },',
    '  "signal_strength": "weak|medium|strong",',
    '  "strengths": [{ "category": string, "label": string, "evidence": string, "confidence": "high|medium|low" }],',
    '  "weaknesses": [{ "category": string, "label": string, "evidence": string, "confidence": "high|medium|low" }],',
    '  "comparison_axes": [{ "category": string, "label": string, "confidence": "high|medium|low" }],',
    '  "alternative_families": [{ "label": string, "description": string }],',
    '  "source_mix": [{ "type": "reviews|directories|comparison_content|community_discussions|official_pages|editorial_mentions|other", "label": string, "weight": "low|medium|high" }],',
    '  "executive_summary": string',
    '}',
    'Règles obligatoires:',
    '- strengths, weaknesses: maximum 3 items chacun.',
    '- comparison_axes: maximum 4 items.',
    '- alternative_families: maximum 3 items.',
    '- source_mix: maximum 5 items.',
    '- Chaque summary ou evidence doit rester en 1 phrase courte et concrète.',
    '- Utilise des catégories stables et lisibles comme pricing, value_for_money, quality, reliability, support, ease_of_use, specialization, brand_image, clarity, trust, authority, feature_depth, visibility, proof, customer_fit, innovation, service_quality.',
    '- Ne reproduis pas de texte d’avis mot pour mot.',
    '- Si le signal est faible, l’executive_summary doit le dire explicitement.',
    '- Pas de markdown, pas de prose hors JSON.',
  ].join('\n');
}

function getSourcePriorities(promptProfile?: PromptProfileSnapshot): string[] {
  const siteType = promptProfile?.siteType;
  const domainVertical = promptProfile?.domainVertical;

  if (
    (siteType === 'saas' || siteType === 'ai_native') &&
    (domainVertical === 'developer_tools' || domainVertical === 'it_cyber_data')
  ) {
    return [
      'Documentation technique officielle, changelog, pages produit et docs développeur',
      'GitHub public si pertinent, issues et exemples d’intégration visibles',
      'Discussions communautaires type Hacker News, Reddit technique, forums spécialisés',
      'Product Hunt et comparatifs éditoriaux spécialisés pour outils développeurs',
    ];
  }

  if (
    siteType === 'saas' &&
    [
      'hr_payroll',
      'accounting_finance',
      'legal_compliance',
      'sales_crm',
      'marketing_communication',
    ].includes(domainVertical || '')
  ) {
    return [
      'Comparateurs logiciels et avis produits type G2, Capterra',
      'Comparatifs logiciels métiers et contenus éditoriaux sectoriels',
      'Pages officielles pricing, features, comparatifs concurrents',
      'Avis clients B2B et retours d’usage publics crédibles',
    ];
  }

  if (
    (siteType === 'saas' || siteType === 'public_service_nonprofit') &&
    ['legal_compliance', 'accounting_finance', 'healthcare_wellness'].includes(domainVertical || '')
  ) {
    return [
      'Sources institutionnelles et documentation officielle du secteur',
      'Pages conformité, sécurité, certifications, méthodologie',
      'Comparatifs spécialisés métier et presse sectorielle',
      'Communautés métier en appui seulement si elles apportent un vrai signal',
    ];
  }

  if (siteType === 'saas' || siteType === 'ai_native') {
    return [
      'Sites de comparaison logiciels et avis produits type G2, Capterra, Product Hunt',
      'Discussions communautaires publiques type Reddit, Hacker News, forums spécialisés',
      'Pages officielles pricing, product, docs et comparatifs concurrents',
      'Articles comparatifs et contenus éditoriaux sectoriels',
    ];
  }

  if (siteType === 'local_service' && domainVertical === 'healthcare_wellness') {
    return [
      'Google Business Profile et annuaires santé pertinents',
      'Pages praticien, cabinet, spécialités, prise de rendez-vous et informations pratiques',
      'Avis publics visibles et citations locales crédibles',
      'Presse locale ou mentions institutionnelles si elles existent',
    ];
  }

  if (siteType === 'local_service' && domainVertical === 'construction_home_services') {
    return [
      'Google Business Profile, PagesJaunes et annuaires métier',
      'Avis locaux visibles et citations locales crédibles',
      'Pages services, devis, intervention, zone desservie',
      'Presse locale ou annuaires professionnels sectoriels',
    ];
  }

  if (siteType === 'local_service') {
    return [
      'Annuaires locaux et profils publics type Google Business Profile, PagesJaunes, Yelp si pertinent',
      'Avis publics visibles et annuaires métier',
      'Presse locale ou citations locales crédibles',
      'Site officiel et pages contact/services',
    ];
  }

  if (siteType === 'ecommerce') {
    return [
      'Avis et réputation publics type Trustpilot et comparatifs d’achat',
      'Discussions communautaires publiques type Reddit, forums consommateurs',
      'Marketplaces et comparateurs si la marque y apparaît',
      'Site officiel, catalogues, FAQ et pages livraison/retours',
    ];
  }

  if (siteType === 'marketplace' || siteType === 'travel_booking' || siteType === 'jobs_recruitment') {
    return [
      'Comparatifs et annuaires de plateformes',
      'Avis publics et discussions communautaires d’utilisateurs',
      'Contenus éditoriaux et presse spécialisée',
      'Pages officielles de pricing, fonctionnement, frais, garanties et support',
    ];
  }

  if (
    (siteType === 'education_training' || siteType === 'public_service_nonprofit') &&
    domainVertical === 'education_training'
  ) {
    return [
      'Sources institutionnelles, pages programmes, admissions et certifications',
      'Classements, annuaires ou comparatifs reconnus si pertinents',
      'Presse éducative et mentions tierces crédibles',
      'Discussions communautaires seulement en complément',
    ];
  }

  if (siteType === 'media') {
    return [
      'Mentions presse tierces, citations et reprises éditoriales',
      'Pages auteurs, rubriques, ligne éditoriale et archives',
      'Newsletters, fréquence de publication et signaux d’autorité éditoriale',
      'Discussions communautaires si elles portent sur la réputation éditoriale',
    ];
  }

  if (siteType === 'public_service_nonprofit') {
    return [
      'Sources institutionnelles ou éditoriales crédibles',
      'Mentions presse et relais tiers fiables',
      'Pages officielles de mission, services et informations publiques',
      'Discussions communautaires publiques si elles apportent un signal clair',
    ];
  }

  return [
    'Comparatifs éditoriaux et annuaires du marché',
    'Discussions communautaires publiques',
    'Pages officielles de l’entreprise',
    'Mentions presse ou contenus tiers crédibles',
  ];
}

function summarizeInternalSignals(
  insightResults: InsightResults | null | undefined,
  topCompetitorName?: string | null
) {
  const strengthsPrompt = insightResults?.strengthsPrompt || null;
  const valuePrompt = insightResults?.valuePrompt || null;
  const sentiments = [strengthsPrompt?.sentiment, valuePrompt?.sentiment?.label].filter(Boolean);

  return {
    usable_insight_count: [strengthsPrompt, valuePrompt].filter(Boolean).length,
    sentiment:
      sentiments.length === 0
        ? null
        : sentiments.every((entry) => entry === sentiments[0])
        ? sentiments[0]
        : 'mixed',
    strengths: strengthsPrompt?.strengths ?? [],
    weaknesses: strengthsPrompt?.weaknesses ?? [],
    generic_alternatives: strengthsPrompt?.genericAlternatives ?? [],
    price_positioning: valuePrompt?.pricePositioning?.label ?? null,
    price_evidence: valuePrompt?.pricePositioning?.evidence ?? null,
    trust_level: valuePrompt?.trustLevel?.level ?? null,
    trust_evidence: valuePrompt?.trustLevel?.evidence ?? null,
    comparison_axes: valuePrompt?.comparisonAxes ?? [],
    top_competitor_name: topCompetitorName || null,
  };
}

function parseMarketPositioningResponse(raw: string): Record<string, unknown> | null {
  const direct = raw.trim();
  if (!direct) return null;

  try {
    return JSON.parse(direct);
  } catch {}

  const fencedMatch = direct.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    try {
      return JSON.parse(fencedMatch[1]);
    } catch {}
  }

  const start = direct.indexOf('{');
  const end = direct.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(direct.slice(start, end + 1));
    } catch {}
  }

  return null;
}

function normalizeMarketInsights(
  raw: Record<string, unknown>,
  params: { fallback: MarketInsights; model: string }
): MarketInsights {
  const fallback = params.fallback;
  const strengths = normalizePointList(raw.strengths, fallback.strengths);
  const weaknesses = normalizePointList(raw.weaknesses, fallback.weaknesses);
  const comparisonAxes = normalizeComparisonAxes(raw.comparison_axes, fallback.comparisonAxes);
  const alternativeFamilies = normalizeAlternativeFamilies(
    raw.alternative_families,
    fallback.alternativeFamilies
  );
  const sourceMix = normalizeSourceMix(raw.source_mix, fallback.sourceMix);

  return {
    pricePositioning: normalizePricePositioning(raw.price_positioning, fallback.pricePositioning),
    marketSentiment: normalizeMarketSentiment(raw.market_sentiment, fallback.marketSentiment),
    polarization: normalizePolarization(raw.polarization, fallback.polarization),
    trustLevel: normalizeTrustLevel(raw.trust_level, fallback.trustLevel),
    signalStrength: normalizeSignalStrength(raw.signal_strength, fallback.signalStrength),
    strengths,
    weaknesses,
    comparisonAxes,
    alternativeFamilies,
    sourceMix,
    executiveSummary:
      getNonEmptyString(raw.executive_summary) ||
      fallback.executiveSummary,
    provider: 'openai',
    model: params.model,
    genericAlternatives:
      alternativeFamilies.length > 0
        ? alternativeFamilies.map((item) => ({ label: item.label }))
        : fallback.genericAlternatives,
  };
}

function normalizeMarketSentiment(
  value: unknown,
  fallback: MarketInsights['marketSentiment']
): MarketInsights['marketSentiment'] {
  return {
    label: readEnumFromObject(value, 'label', SENTIMENT_VALUES, fallback.label),
    confidence: readEnumFromObject(value, 'confidence', CONFIDENCE_VALUES, fallback.confidence),
    summary: readStringFromObject(value, 'summary', fallback.summary),
  };
}

function normalizePolarization(
  value: unknown,
  fallback: MarketInsights['polarization']
): MarketInsights['polarization'] {
  return {
    level: readEnumFromObject(value, 'level', POLARIZATION_VALUES, fallback.level),
    confidence: readEnumFromObject(value, 'confidence', CONFIDENCE_VALUES, fallback.confidence),
    summary: readStringFromObject(value, 'summary', fallback.summary),
  };
}

function normalizePricePositioning(
  value: unknown,
  fallback: MarketInsights['pricePositioning']
): MarketInsights['pricePositioning'] {
  return {
    label: readEnumFromObject(value, 'label', PRICE_VALUES, fallback.label),
    confidence: readEnumFromObject(value, 'confidence', CONFIDENCE_VALUES, fallback.confidence),
    summary: readStringFromObject(value, 'summary', fallback.summary),
  };
}

function normalizeTrustLevel(
  value: unknown,
  fallback: MarketInsights['trustLevel']
): MarketInsights['trustLevel'] {
  return {
    level: readEnumFromObject(value, 'level', TRUST_VALUES, fallback.level),
    confidence: readEnumFromObject(value, 'confidence', CONFIDENCE_VALUES, fallback.confidence),
    summary: readStringFromObject(value, 'summary', fallback.summary),
  };
}

function normalizeSignalStrength(
  value: unknown,
  fallback: MarketInsights['signalStrength']
): MarketInsights['signalStrength'] {
  return typeof value === 'string' && SIGNAL_VALUES.has(value) ? (value as MarketInsights['signalStrength']) : fallback;
}

function normalizePointList(
  value: unknown,
  fallback: MarketInsights['strengths']
): MarketInsights['strengths'] {
  if (!Array.isArray(value)) return fallback;

  const items = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const label = getNonEmptyString(record.label);
      const evidence = getNonEmptyString(record.evidence);
      const category = getNonEmptyString(record.category);
      const confidence =
        typeof record.confidence === 'string' && CONFIDENCE_VALUES.has(record.confidence)
          ? (record.confidence as 'high' | 'medium' | 'low')
          : 'low';
      if (!label || !evidence || !category) return null;
      return { category, label, evidence, confidence };
    })
    .filter(Boolean)
    .slice(0, 3) as MarketInsights['strengths'];

  return items.length > 0 ? items : fallback;
}

function normalizeComparisonAxes(
  value: unknown,
  fallback: MarketInsights['comparisonAxes']
): MarketInsights['comparisonAxes'] {
  if (!Array.isArray(value)) return fallback;

  const items = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const label = getNonEmptyString(record.label);
      const category = getNonEmptyString(record.category);
      const confidence =
        typeof record.confidence === 'string' && CONFIDENCE_VALUES.has(record.confidence)
          ? (record.confidence as 'high' | 'medium' | 'low')
          : 'low';
      if (!label || !category) return null;
      return { category, label, confidence };
    })
    .filter(Boolean)
    .slice(0, 4) as MarketInsights['comparisonAxes'];

  return items.length > 0 ? items : fallback;
}

function normalizeAlternativeFamilies(
  value: unknown,
  fallback: MarketInsights['alternativeFamilies']
): MarketInsights['alternativeFamilies'] {
  if (!Array.isArray(value)) return fallback;

  const items = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const label = getNonEmptyString(record.label);
      const description = getNonEmptyString(record.description);
      if (!label || !description) return null;
      return { label, description };
    })
    .filter(Boolean)
    .slice(0, 3) as MarketInsights['alternativeFamilies'];

  return items.length > 0 ? items : fallback;
}

function normalizeSourceMix(
  value: unknown,
  fallback: MarketInsights['sourceMix']
): MarketInsights['sourceMix'] {
  if (!Array.isArray(value)) return fallback;

  const items = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const type =
        typeof record.type === 'string' && SOURCE_TYPE_VALUES.has(record.type)
          ? (record.type as MarketInsights['sourceMix'][number]['type'])
          : null;
      const label = getNonEmptyString(record.label);
      const weight =
        typeof record.weight === 'string' && SOURCE_WEIGHT_VALUES.has(record.weight)
          ? (record.weight as MarketInsights['sourceMix'][number]['weight'])
          : null;
      if (!type || !label || !weight) return null;
      return { type, label, weight };
    })
    .filter(Boolean)
    .slice(0, 5) as MarketInsights['sourceMix'];

  return items.length > 0 ? items : fallback;
}

function normalizeConfidenceNotes(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value.map((item) => getNonEmptyString(item)).filter(Boolean).slice(0, 3) as string[];
  return items.length > 0 ? items : fallback;
}

function readEnumFromObject<T extends string>(
  value: unknown,
  key: string,
  allowed: Set<string>,
  fallback: T
): T {
  if (!value || typeof value !== 'object') return fallback;
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === 'string' && allowed.has(candidate) ? (candidate as T) : fallback;
}

function readStringFromObject(value: unknown, key: string, fallback: string): string {
  if (!value || typeof value !== 'object') return fallback;
  const candidate = getNonEmptyString((value as Record<string, unknown>)[key]);
  return candidate || fallback;
}

function getNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}
