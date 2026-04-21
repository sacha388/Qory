import type { Recommendation, Report } from '@/types';

export type FactRowKey = 'address' | 'phone' | 'email' | 'openingHours' | 'city';

export const FACT_ROWS: Array<{ label: string; key: FactRowKey }> = [
  { label: 'Adresse', key: 'address' },
  { label: 'Téléphone', key: 'phone' },
  { label: 'Email', key: 'email' },
  { label: 'Horaires', key: 'openingHours' },
  { label: 'Ville', key: 'city' },
];

export function getDisplayDomain(rawUrl: string) {
  const fallbackDomain = rawUrl
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0];

  try {
    const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    return new URL(normalizedUrl).hostname.replace(/^www\./i, '') || fallbackDomain;
  } catch {
    return fallbackDomain;
  }
}

export function getProviderLabel(source: string) {
  switch (source) {
    case 'openai':
      return 'ChatGPT';
    case 'anthropic':
      return 'Claude';
    case 'perplexity':
      return 'Perplexity';
    default:
      return source;
  }
}

export function getProviderIconSrc(source: string) {
  switch (source) {
    case 'openai':
      return '/openai.svg?v=3';
    case 'anthropic':
      return '/claude.svg?v=3';
    case 'perplexity':
      return '/perplexity.svg?v=3';
    default:
      return null;
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case 'cited_first':
    case 'cited':
      return 'Cité';
    case 'not_cited':
      return 'Non cité';
    case 'unavailable':
      return 'Indisponible';
    default:
      return status;
  }
}

export function getStatusClass(status: string) {
  switch (status) {
    case 'cited_first':
    case 'cited':
      return 'bg-success/10 text-success';
    case 'not_cited':
      return 'bg-error/10 text-error';
    case 'unavailable':
      return 'bg-elevated/60 text-tertiary';
    default:
      return 'bg-elevated/60 text-tertiary';
  }
}

export function getTechnicalStatusClass(status: string) {
  if (status === 'Bloqué' || status === 'Absent' || status === 'Non') {
    return 'bg-error/10 text-error';
  }
  if (status === 'Autorisé' || status === 'Présent' || status === 'Oui') {
    return 'bg-success/10 text-success';
  }
  return 'bg-warning/10 text-warning';
}

export function getTechnicalImpactClass(impact: string) {
  if (impact === 'Élevé') return 'bg-error/10 text-error';
  if (impact === 'Moyen') return 'bg-warning/10 text-warning';
  if (impact === 'Faible') return 'bg-success/10 text-success';
  return 'bg-elevated/60 text-tertiary';
}

export function getScoreToneClass(value: number) {
  if (value >= 70) return 'text-success';
  if (value >= 40) return 'text-warning';
  return 'text-error';
}

export function getScoreFillClass(value: number) {
  if (value >= 70) return 'bg-success';
  if (value >= 40) return 'bg-warning';
  return 'bg-error';
}

export function getScoreLabel(value: number) {
  if (value >= 70) return 'Bonne';
  if (value >= 40) return 'Moyenne';
  return 'Faible';
}

export function getDataQualityLabel(value: 'good' | 'partial' | 'poor') {
  if (value === 'good') return 'Bonne';
  if (value === 'partial') return 'Partielle';
  return 'Limitée';
}

export function getDataQualityClass(value: 'good' | 'partial' | 'poor') {
  if (value === 'good') return 'bg-success/10 text-success';
  if (value === 'partial') return 'bg-warning/10 text-warning';
  return 'bg-error/10 text-error';
}

export type MarketTone = 'success' | 'warning' | 'error' | 'brand' | 'neutral';

export function getMarketToneTextClass(tone: MarketTone) {
  if (tone === 'success') return 'text-success';
  if (tone === 'warning') return 'text-warning';
  if (tone === 'error') return 'text-error';
  if (tone === 'brand') return 'text-[#4BA7F5]';
  return 'text-[#6B7280]';
}

export function getMarketToneCardClass(tone: MarketTone) {
  if (tone === 'success') return 'pdf-metric-card--tone-success';
  if (tone === 'warning') return 'pdf-metric-card--tone-warning';
  if (tone === 'error') return 'pdf-metric-card--tone-error';
  if (tone === 'brand') return 'pdf-metric-card--tone-brand';
  return 'pdf-metric-card--tone-neutral';
}

export function getPricePositionLabel(value: NonNullable<Report['marketInsights']>['pricePositioning']['label']) {
  if (value === 'budget') return 'Accessible';
  if (value === 'accessible') return 'Bonne valeur';
  if (value === 'mid_market') return 'Intermédiaire';
  if (value === 'premium') return 'Premium';
  if (value === 'high_end') return 'Très premium';
  return 'Peu lisible';
}

export function getPricePositionTone(value: NonNullable<Report['marketInsights']>['pricePositioning']['label']): MarketTone {
  if (value === 'budget') return 'success';
  if (value === 'accessible') return 'brand';
  if (value === 'premium' || value === 'high_end' || value === 'mid_market') return 'warning';
  return 'neutral';
}

export function getMarketSentimentLabel(value: NonNullable<Report['marketInsights']>['marketSentiment']['label']) {
  if (value === 'very_positive') return 'Très positif';
  if (value === 'positive') return 'Positif';
  if (value === 'negative') return 'Négatif';
  if (value === 'mixed_positive') return 'Plutôt positif';
  if (value === 'mixed_negative') return 'Plutôt fragile';
  if (value === 'mixed') return 'Mitigé';
  return 'Signal faible';
}

export function getMarketSentimentTone(value: NonNullable<Report['marketInsights']>['marketSentiment']['label']): MarketTone {
  if (value === 'very_positive' || value === 'positive') return 'success';
  if (value === 'negative') return 'error';
  if (value === 'mixed' || value === 'mixed_positive' || value === 'mixed_negative') return 'warning';
  return 'neutral';
}

export function getPolarizationLabel(value: NonNullable<Report['marketInsights']>['polarization']['level']) {
  if (value === 'insufficient_signal') return 'Signal faible';
  if (value === 'low') return 'Stable';
  if (value === 'moderate') return 'Modérée';
  return 'Instable';
}

export function getPolarizationTone(value: NonNullable<Report['marketInsights']>['polarization']['level']): MarketTone {
  if (value === 'insufficient_signal') return 'neutral';
  if (value === 'low') return 'success';
  if (value === 'moderate') return 'warning';
  return 'error';
}

export function getTrustLevelLabel(value: NonNullable<Report['marketInsights']>['trustLevel']['level']) {
  if (value === 'high') return 'Élevée';
  if (value === 'moderate') return 'Moyenne';
  if (value === 'unclear') return 'Peu lisible';
  return 'Fragile';
}

export function getTrustLevelTone(value: NonNullable<Report['marketInsights']>['trustLevel']['level']): MarketTone {
  if (value === 'high') return 'success';
  if (value === 'moderate') return 'warning';
  if (value === 'unclear') return 'neutral';
  return 'error';
}

export function getSignalStrengthLabel(value: NonNullable<Report['marketInsights']>['signalStrength']) {
  if (value === 'strong') return 'Fort';
  if (value === 'medium') return 'Moyen';
  return 'Faible';
}

export function getSignalStrengthTone(value: NonNullable<Report['marketInsights']>['signalStrength']): MarketTone {
  if (value === 'strong') return 'success';
  if (value === 'medium') return 'warning';
  return 'neutral';
}

export function getRecommendationDifficultyLabel(value: Recommendation['difficulty']) {
  if (value === 'easy') return 'Facile';
  if (value === 'medium') return 'Technique';
  return 'Complexe';
}

export function getRecommendationDifficultyClass(value: Recommendation['difficulty']) {
  if (value === 'easy') return 'bg-success/10 text-success';
  if (value === 'medium') return 'bg-warning/10 text-warning';
  return 'bg-error/10 text-error';
}

export function getRecommendationImpactLabel(value: Recommendation['impact']) {
  if (value === 'high') return 'Élevé';
  if (value === 'medium') return 'Moyen';
  return 'Faible';
}

export function getRecommendationImpactClass(value: Recommendation['impact']) {
  if (value === 'high') return 'bg-error/10 text-error';
  if (value === 'medium') return 'bg-warning/10 text-warning';
  return 'bg-success/10 text-success';
}

export function getCompetitiveBarColor(mentionsOnThirty: number) {
  if (mentionsOnThirty >= 20) return '#FF3B30';
  if (mentionsOnThirty >= 10) return '#FF9F0A';
  if (mentionsOnThirty >= 1) return '#34C759';
  return '#8A919D';
}

export function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (items.length === 0) {
    return [[]];
  }

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}
