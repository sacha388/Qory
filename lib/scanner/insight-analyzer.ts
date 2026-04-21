import type {
  AIResponse,
  InsightComparisonAxis,
  InsightConfidence,
  InsightResults,
  InsightStrengthPoint,
  InsightStrengthsResult,
  InsightValueResult,
} from '@/types';

const CONFIDENCE_VALUES = new Set<InsightConfidence>(['high', 'medium', 'low']);
const SENTIMENT_VALUES = new Set(['positive', 'neutral', 'negative']);
const PRICE_VALUES = new Set(['budget', 'accessible', 'mid_market', 'premium', 'high_end', 'unclear']);
const TRUST_VALUES = new Set(['low', 'moderate', 'high', 'unclear']);

export function parseStrengthsInsightResponse(response: AIResponse): InsightStrengthsResult | null {
  if (response.error || !response.response.trim()) return null;
  const parsed = parseJsonObject(response.response);
  if (!parsed || typeof parsed !== 'object') return null;
  const data = parsed as Record<string, unknown>;

  const sentiment = normalizeSentiment(data.sentiment);
  const strengths = normalizeInsightPoints(data.strengths);
  const weaknesses = normalizeInsightPoints(data.weaknesses);
  const genericAlternatives = normalizeAlternatives(data.generic_alternatives);

  if (strengths.length === 0 && weaknesses.length === 0 && genericAlternatives.length === 0 && !sentiment) {
    return null;
  }

  return {
    sentiment,
    strengths,
    weaknesses,
    genericAlternatives,
  };
}

export function parseValueInsightResponse(response: AIResponse): InsightValueResult | null {
  if (response.error || !response.response.trim()) return null;
  const parsed = parseJsonObject(response.response);
  if (!parsed || typeof parsed !== 'object') return null;
  const data = parsed as Record<string, unknown>;

  const pricePositioning = normalizePricePositioning(data.price_positioning);
  const trustLevel = normalizeTrustLevel(data.trust_level);
  const sentiment = normalizeSentimentSummary(data.sentiment);
  const comparisonAxes = normalizeComparisonAxes(data.comparison_axes);

  if (!pricePositioning && !trustLevel && !sentiment && comparisonAxes.length === 0) {
    return null;
  }

  return {
    pricePositioning,
    trustLevel,
    sentiment,
    comparisonAxes,
  };
}

export function buildInsightResults(params: {
  strengthsResponse?: AIResponse | null;
  valueResponse?: AIResponse | null;
}): InsightResults {
  return {
    strengthsPrompt: params.strengthsResponse ? parseStrengthsInsightResponse(params.strengthsResponse) : null,
    valuePrompt: params.valueResponse ? parseValueInsightResponse(params.valueResponse) : null,
  };
}

function parseJsonObject(raw: string): unknown {
  const direct = raw.trim();
  if (!direct) return null;

  try {
    return JSON.parse(direct);
  } catch {}

  const fencedMatch = direct.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    try {
      return JSON.parse(fencedMatch[1]);
    } catch {}
  }

  const start = direct.indexOf('{');
  const end = direct.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(direct.slice(start, end + 1));
    } catch {}
  }

  return null;
}

function normalizeInsightPoints(value: unknown): InsightStrengthPoint[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const category = normalizeString(record.category);
      const label = normalizeString(record.label);
      const evidence = normalizeString(record.evidence);
      const confidence = normalizeConfidence(record.confidence);
      if (!category || !label || !evidence) return null;
      return { category, label, evidence, confidence };
    })
    .filter(Boolean)
    .slice(0, 3) as InsightStrengthPoint[];
}

function normalizeAlternatives(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === 'string') {
        const label = normalizeString(item);
        return label ? { label } : null;
      }
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const label = normalizeString(record.label);
      if (!label) return null;
      return { label };
    })
    .filter(Boolean)
    .slice(0, 4) as InsightStrengthsResult['genericAlternatives'];
}

function normalizeComparisonAxes(value: unknown): InsightComparisonAxis[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const category = normalizeString(record.category);
      const label = normalizeString(record.label);
      if (!category || !label) return null;
      return {
        category,
        label,
        confidence: normalizeConfidence(record.confidence),
      };
    })
    .filter(Boolean)
    .slice(0, 4) as InsightComparisonAxis[];
}

function normalizePricePositioning(value: unknown): InsightValueResult['pricePositioning'] {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const label = normalizeString(record.label);
  if (!label || !PRICE_VALUES.has(label)) return null;
  return {
    label: label as NonNullable<InsightValueResult['pricePositioning']>['label'],
    evidence: normalizeString(record.evidence) || '',
    confidence: normalizeConfidence(record.confidence),
  };
}

function normalizeTrustLevel(value: unknown): InsightValueResult['trustLevel'] {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const level = normalizeString(record.level);
  if (!level || !TRUST_VALUES.has(level)) return null;
  return {
    level: level as NonNullable<InsightValueResult['trustLevel']>['level'],
    evidence: normalizeString(record.evidence) || '',
    confidence: normalizeConfidence(record.confidence),
  };
}

function normalizeSentiment(value: unknown): InsightStrengthsResult['sentiment'] {
  const label = normalizeString(value);
  return label && SENTIMENT_VALUES.has(label)
    ? (label as InsightStrengthsResult['sentiment'])
    : null;
}

function normalizeSentimentSummary(value: unknown): InsightValueResult['sentiment'] {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const label = normalizeString(record.label);
  if (!label || !SENTIMENT_VALUES.has(label)) return null;
  return {
    label: label as NonNullable<InsightValueResult['sentiment']>['label'],
    summary: normalizeString(record.summary) || '',
    confidence: normalizeConfidence(record.confidence),
  };
}

function normalizeConfidence(value: unknown): InsightConfidence {
  const candidate = normalizeString(value);
  return candidate && CONFIDENCE_VALUES.has(candidate as InsightConfidence)
    ? (candidate as InsightConfidence)
    : 'low';
}

function normalizeString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}
