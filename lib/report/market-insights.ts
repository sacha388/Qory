import type { InsightResults, Report } from '@/types';

type MarketInsights = NonNullable<Report['marketInsights']>;

const CATEGORY_LABELS: Record<string, string> = {
  pricing: 'Prix',
  value_for_money: 'Rapport qualité-prix',
  quality: 'Qualité perçue',
  reliability: 'Fiabilité',
  support: 'Support',
  ease_of_use: "Facilité d'utilisation",
  specialization: 'Spécialisation',
  brand_image: 'Image de marque',
  trust: 'Confiance',
  feature_depth: 'Profondeur fonctionnelle',
  innovation: 'Innovation',
  service_quality: 'Qualité de service',
};

export function buildFallbackMarketInsights(params: {
  insightResults?: InsightResults | null;
  topCompetitorName?: string | null;
}): MarketInsights {
  const strengthsPrompt = params.insightResults?.strengthsPrompt || null;
  const valuePrompt = params.insightResults?.valuePrompt || null;

  const pricePositioning = buildFallbackPricePositioning(valuePrompt);
  const trustLevel = buildFallbackTrustLevel(valuePrompt);
  const marketSentiment = buildFallbackSentiment(strengthsPrompt, valuePrompt);
  const polarization = buildFallbackPolarization(strengthsPrompt, valuePrompt);
  const strengths = normalizeStrengths(strengthsPrompt?.strengths || []);
  const weaknesses = normalizeStrengths(strengthsPrompt?.weaknesses || []);
  const comparisonAxes = normalizeComparisonAxes(valuePrompt?.comparisonAxes || []);
  const alternativeFamilies = (strengthsPrompt?.genericAlternatives || []).slice(0, 3).map((item) => ({
    label: item.label,
    description:
      'Cette famille d’alternatives revient dans le signal insight comme groupe de comparaison crédible.',
  })) as MarketInsights['alternativeFamilies'];
  const signalStrength = computeSignalStrength({
    strengthsCount: strengths.length,
    weaknessesCount: weaknesses.length,
    comparisonAxesCount: comparisonAxes.length,
    hasPriceSignal: Boolean(valuePrompt?.pricePositioning),
    hasTrustSignal: Boolean(valuePrompt?.trustLevel),
    hasSentiment: Boolean(valuePrompt?.sentiment || strengthsPrompt?.sentiment),
    alternativeCount: alternativeFamilies.length,
  });

  const executiveSummary = buildFallbackExecutiveSummary({
    marketSentiment: marketSentiment.summary,
    pricePositioning: pricePositioning.summary,
    trustLevel: trustLevel.summary,
    topCompetitorName: params.topCompetitorName,
    signalStrength,
  });

  return {
    pricePositioning,
    marketSentiment,
    polarization,
    trustLevel,
    signalStrength,
    strengths,
    weaknesses,
    comparisonAxes,
    alternativeFamilies,
    sourceMix: [
      {
        type: 'other',
        label: 'Prompts insight web-grounded',
        weight: signalStrength === 'strong' ? 'high' : signalStrength === 'medium' ? 'medium' : 'low',
      },
    ],
    executiveSummary,
    provider: 'fallback',
    model: undefined,
    genericAlternatives: alternativeFamilies.map((item) => ({
      label: item.label,
    })),
  };
}

function buildFallbackSentiment(
  strengthsPrompt: InsightResults['strengthsPrompt'],
  valuePrompt: InsightResults['valuePrompt']
): MarketInsights['marketSentiment'] {
  const labels = [valuePrompt?.sentiment?.label, strengthsPrompt?.sentiment].filter(Boolean);

  if (labels.length === 0) {
    return {
      label: 'insufficient_signal',
      confidence: 'low',
      summary: "Les prompts insight ne suffisent pas à dégager un ressenti marché stable.",
    };
  }

  if (labels.every((label) => label === labels[0])) {
    const label = labels[0];
    return {
      label:
        label === 'positive'
          ? 'positive'
          : label === 'negative'
          ? 'negative'
          : 'mixed',
      confidence: labels.length === 2 ? 'medium' : 'low',
      summary:
        label === 'positive'
          ? 'Le ressenti global ressort plutôt favorable dans les insights collectés.'
          : label === 'negative'
          ? 'Le ressenti global ressort plutôt défavorable dans les insights collectés.'
          : 'Le ressenti global reste plutôt neutre ou peu marqué.',
    };
  }

  return {
    label: 'mixed',
    confidence: 'medium',
    summary: 'Les insights remontent un ressenti partagé selon les angles de lecture.',
  };
}

function buildFallbackPolarization(
  strengthsPrompt: InsightResults['strengthsPrompt'],
  valuePrompt: InsightResults['valuePrompt']
): MarketInsights['polarization'] {
  const sentiments = [strengthsPrompt?.sentiment, valuePrompt?.sentiment?.label].filter(Boolean);
  if (sentiments.length === 0) {
    return {
      level: 'insufficient_signal',
      confidence: 'low',
      summary: "La polarisation ne peut pas être estimée proprement faute de signal insight suffisant.",
    };
  }

  const level = sentiments.length === 2 && sentiments[0] !== sentiments[1] ? 'moderate' : 'low';
  return {
    level,
    confidence: sentiments.length === 2 ? 'medium' : 'low',
    summary:
      level === 'moderate'
        ? 'Les deux prompts insight ne racontent pas exactement la même histoire.'
        : 'Les signaux insight donnent une lecture plutôt stable et peu contradictoire.',
  };
}

function buildFallbackTrustLevel(
  valuePrompt: InsightResults['valuePrompt']
): MarketInsights['trustLevel'] {
  const level = valuePrompt?.trustLevel?.level || 'unclear';
  return {
    level,
    confidence: valuePrompt?.trustLevel?.confidence || 'low',
    summary:
      valuePrompt?.trustLevel?.evidence ||
      (level === 'high'
        ? 'Le niveau de confiance perçu ressort plutôt solide.'
        : level === 'moderate'
        ? 'Le niveau de confiance perçu est correct, sans être totalement stabilisé.'
        : level === 'low'
        ? 'Le niveau de confiance perçu reste fragile.'
        : "Le niveau de confiance perçu ne peut pas être établi clairement."),
  };
}

function buildFallbackPricePositioning(
  valuePrompt: InsightResults['valuePrompt']
): MarketInsights['pricePositioning'] {
  const label = valuePrompt?.pricePositioning?.label || 'unclear';
  return {
    label,
    confidence: valuePrompt?.pricePositioning?.confidence || 'low',
    summary:
      valuePrompt?.pricePositioning?.evidence ||
      (label === 'budget'
        ? 'Le positionnement prix semble plutôt budget.'
        : label === 'accessible'
        ? 'Le rapport qualité-prix perçu paraît plutôt favorable.'
        : label === 'premium'
        ? 'Le positionnement prix semble plutôt premium.'
        : label === 'high_end'
        ? 'Le positionnement semble haut de gamme.'
        : label === 'mid_market'
        ? 'Le positionnement prix paraît intermédiaire.'
        : "Le positionnement prix ne ressort pas assez clairement."),
  };
}

function normalizeStrengths(points: Array<{
  category: string;
  label: string;
  evidence: string;
  confidence: 'high' | 'medium' | 'low';
}>): MarketInsights['strengths'] {
  return points.slice(0, 3).map((item) => ({
    category: item.category,
    label: item.label || CATEGORY_LABELS[item.category] || item.category,
    evidence: item.evidence,
    confidence: item.confidence,
  })) as MarketInsights['strengths'];
}

function normalizeComparisonAxes(
  axes: Array<{
    category: string;
    label: string;
    confidence: 'high' | 'medium' | 'low';
  }>
): MarketInsights['comparisonAxes'] {
  return axes.slice(0, 4).map((item) => ({
    category: item.category,
    label: item.label || CATEGORY_LABELS[item.category] || item.category,
    confidence: item.confidence,
  })) as MarketInsights['comparisonAxes'];
}

function computeSignalStrength(params: {
  strengthsCount: number;
  weaknessesCount: number;
  comparisonAxesCount: number;
  hasPriceSignal: boolean;
  hasTrustSignal: boolean;
  hasSentiment: boolean;
  alternativeCount: number;
}): MarketInsights['signalStrength'] {
  const signalUnits =
    params.strengthsCount +
    params.weaknessesCount +
    params.comparisonAxesCount +
    params.alternativeCount +
    (params.hasPriceSignal ? 1 : 0) +
    (params.hasTrustSignal ? 1 : 0) +
    (params.hasSentiment ? 1 : 0);

  if (signalUnits >= 7) return 'strong';
  if (signalUnits >= 3) return 'medium';
  return 'weak';
}

function buildFallbackExecutiveSummary(params: {
  marketSentiment: string;
  pricePositioning: string;
  trustLevel: string;
  topCompetitorName?: string | null;
  signalStrength: MarketInsights['signalStrength'];
}): string {
  const competitorSentence = params.topCompetitorName
    ? ` Les comparaisons remontent souvent face à ${params.topCompetitorName}.`
    : '';
  const cautionSentence =
    params.signalStrength === 'weak'
      ? ' Cette lecture reste prudente car le signal insight reste encore limité.'
      : '';

  return `${params.marketSentiment} ${params.pricePositioning} ${params.trustLevel}${competitorSentence}${cautionSentence}`.trim();
}
