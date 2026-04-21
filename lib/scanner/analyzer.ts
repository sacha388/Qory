import type {
  AnalysisTopEntity,
  AIResponse,
  AnalysisResult,
  AspectObservation,
  BusinessInfo,
  ComparisonObservation,
  DetectedBusinessFacts,
  FactAnalysisResult,
  PriceObservation,
  PromptQuery,
} from '@/types';
import {
  areLikelySameCompetitorName,
  canonicalizeCompetitorKey,
  canonicalizeCompetitorName,
  dedupeDistinctCompetitorNames,
  pickPreferredCompetitorName,
} from '@/lib/scanner/competitor-normalization';
import { classifyCompetitorEntity } from '@/lib/scanner/competitor-entities';
import { logInfo, logWarn } from '@/lib/logger';

interface AnalyzeResponseParams {
  auditId?: string;
  response: AIResponse;
  businessName: string;
  businessInfo: BusinessInfo;
  prompt: PromptQuery;
}

interface AnalyzeFactResponseParams {
  auditId?: string;
  response: AIResponse;
  businessInfo: BusinessInfo;
  canonicalFacts?: unknown;
}

type StructuredDetected = {
  address: string | null;
  phone: string | null;
  email: string | null;
  openingHours: string | null;
  city: string | null;
};

type StructuredAuditResponse = {
  answerShort: string;
  mentioned: boolean;
  position: number | null;
  topEntities: AnalysisTopEntity[];
  sentiment: 'positive' | 'neutral' | 'negative';
  competitors: string[];
  genericAlternatives: string[];
  aspects: AspectObservation[];
  comparisons: ComparisonObservation[];
  pricePositioning: PriceObservation | null;
  detected: StructuredDetected;
  excerpt: string;
  citation: string;
};

type StructuredFactResponse = {
  known: boolean;
  detected: StructuredDetected;
};

const NON_COMPETITOR_TOKENS = new Set([
  'the',
  'a',
  'an',
  'this',
  'that',
  'these',
  'those',
  'what',
  'which',
  'who',
  'where',
  'when',
  'why',
  'how',
  'best',
  'top',
  'great',
  'good',
  'new',
  'official',
  'home',
  'about',
  'contact',
  'faq',
  'pricing',
  'price',
  'results',
  'review',
  'reviews',
  'website',
  'web',
  'site',
  'company',
  'business',
  'solution',
  'solutions',
  'tool',
  'tools',
  'platform',
  'platforms',
  'provider',
  'providers',
  'hotel',
  'restaurant',
  'agency',
  'service',
  'services',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
  'chatgpt',
  'claude',
  'perplexity',
  'openai',
  'anthropic',
  'google',
  'bing',
  'maps',
  'trustpilot',
  'yelp',
  'france',
  'paris',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
  'service',
  'services',
  'entreprise',
  'restaurant',
  'agence',
  'hotel',
  'hôtel',
  'selon',
  'entre',
  'parmi',
  'notamment',
  'aussi',
  'autre',
  'autres',
  'plusieurs',
  'certains',
  'certaines',
  'différents',
  'différentes',
  'voici',
  'cependant',
  'toutefois',
  'donc',
  'alors',
  'est',
  'estce',
  'quel',
  'quelle',
  'quels',
  'quelles',
  'comment',
  'pourquoi',
  'question',
  'questions',
  'reponse',
  'réponse',
  'response',
  'responses',
  'answer',
  'answers',
  'excerpt',
  'citation',
  'prompt',
  'requete',
  'requêtes',
  'request',
  'requests',
  'utilisateur',
  'user',
  'assistant',
  'qui',
  'que',
  'où',
  'ou',
  'when',
  'where',
  'what',
  'which',
  'who',
  'why',
  'how',
  'aucun',
  'aucune',
  'none',
  'n/a',
  'na',
  'dautre',
  'dautres',
  'autrui',
  'importance',
  'important',
  'importante',
]);

const FACT_PLACEHOLDER_PATTERNS = [
  /\bn\/a\b/i,
  /\bna\b/i,
  /\baucun\b/i,
  /\binconnu\b/i,
  /\bunknown\b/i,
  /\bnon disponible\b/i,
  /\bnon renseign[ée]\b/i,
  /\bpas (?:de )?donn[ée]e?\b/i,
  /\bpas trouv[ée]\b/i,
  /\bvoir site\b/i,
  /\bsite web\b/i,
  /\bwebsite\b/i,
  /\bcontactez\b/i,
  /\bcontact us\b/i,
  /\bappelez\b/i,
  /\bcall\b/i,
];

const NON_CITY_VALUES = new Set([
  'france',
  'belgique',
  'belgium',
  'suisse',
  'switzerland',
  'luxembourg',
  'europe',
  'union europeenne',
  'union européenne',
  'ile-de-france',
  'île-de-france',
  'provence-alpes-cote d azur',
  'provence-alpes-côte d’azur',
  'provence-alpes-côte d azur',
]);

const COMPETITOR_NOISE_PREFIX_PATTERN =
  /^(?:dans\s+quels?\s+cas|est[\s-]?ce|quel(?:le)?s?|quels?|quelles?|qui|que|comment|pourquoi|o[uù]|selon|entre|parmi|notamment|voici|cependant|toutefois|plusieurs|certains?|certaines?|diff[ée]rents?|diff[ée]rentes?|question|questions|r[ée]ponse|response|answer|answers|excerpt|citation|prompt|requ[êe]te|request|what|which|who|where|when|why|how|according|among|between|however|several|various|comparez?|comparer|demandez?|v[ée]rifiez?|v[ée]rifier|cherchez?|chercher|consultez?|consulter|privil[ée]giez|privil[ée]gier|choisissez?|choisir|contactez|regardez|recherchez?)\b/i;

const GENERIC_ALTERNATIVE_PATTERN =
  /\b(?:artisans?|entreprises?|plateformes?|annuaires?|r[ée]seaux?|services?|d[ée]pannage|mise en relation|franchises?|professionnels?|acteurs?|options?|alternatives?)\b/i;

const DISPLAYABLE_COMPETITOR_STOPWORDS = new Set([
  'allo',
  'sos',
]);

const GENERIC_COMPETITOR_TOKENS = new Set([
  'artisan',
  'artisans',
  'entreprise',
  'entreprises',
  'plateforme',
  'plateformes',
  'annuaire',
  'annuaires',
  'service',
  'services',
  'depannage',
  'mise',
  'relation',
  'reseau',
  'reseaux',
  'franchise',
  'franchises',
  'professionnel',
  'professionnels',
  'acteur',
  'acteurs',
  'option',
  'options',
  'alternative',
  'alternatives',
  'local',
  'locaux',
  'locale',
  'locales',
  'bien',
  'note',
  'notes',
  'notes',
  '24',
  '24h',
  '24h24',
  'urgence',
  'rapide',
  'rapides',
  'devis',
  'tarifs',
  'prix',
  'pro',
]);

const POSITIVE_MARKERS = [
  'recommended',
  'reliable',
  'trustworthy',
  'high quality',
  'very good',
  'great',
  'professional',
  'best',
  'top',
  'leading',
  'strong reputation',
  'excellent',
  'excellente',
  'recommandé',
  'recommandée',
  'fiable',
  'qualité',
  'très bon',
  'très bonne',
  'professionnel',
  'professionnelle',
  'réputé',
  'réputée',
  'meilleur',
  'meilleure',
];

const NEGATIVE_MARKERS = [
  'bad',
  'poor',
  'avoid',
  'issue',
  'issues',
  'problem',
  'problems',
  'expensive',
  'overpriced',
  'error',
  'incorrect',
  'wrong',
  'critical',
  'unreliable',
  'mauvais',
  'mauvaise',
  'décevant',
  'décevante',
  'éviter',
  'problème',
  'problèmes',
  'faible',
  'cher',
  'chère',
  'erreur',
  'incorrect',
  'incorrecte',
  'critique',
];

const COMPETITOR_FOCUSED_CATEGORIES = new Set<PromptQuery['category']>([
  'alternative',
  'recommendation',
  'comparison',
  'listing',
  'situation',
]);

const NON_ANSWER_PATTERNS = [
  /je n(?:e|')ai pas d['’]information/i,
  /je ne sais pas/i,
  /je n(?:e|')ai pas assez d['’]information/i,
  /impossible de trouver/i,
  /aucune information fiable/i,
  /i do not have information/i,
  /i don't have information/i,
  /i don't know/i,
  /not enough information/i,
  /unable to determine/i,
  /cannot determine/i,
];

export async function analyzeResponse(params: AnalyzeResponseParams): Promise<AnalysisResult> {
  const { auditId, response, businessName, businessInfo, prompt } = params;
  void businessInfo;

  if (response.error || !response.response) {
    return {
      promptId: prompt.id,
      provider: response.provider,
      mentioned: false,
      position: null,
      sentiment: null,
      competitors: [],
      confidence: 0,
      providerError: response.error || 'Provider unavailable',
    };
  }

  const structured = parseStructuredAuditResponse(response.response);
  const heuristicMentioned = isMentioned(response.response, businessName);
  const structuredMentioned = resolveStructuredMentioned(structured, businessName);
  const contextualMentioned = inferMentionedFromPromptContext(
    prompt,
    businessName,
    response.response,
    structured
  );
  const explicitTargetPresence = hasExplicitTargetPresence(structured, response.response, businessName);
  const minimalStructuredPayload = usesMinimalStructuredAuditPayload(structured);
  const mentioned = isBrandAnchoredPrompt(prompt, businessName)
    ? structuredMentioned === true || heuristicMentioned || contextualMentioned
    : structured
    ? minimalStructuredPayload
      ? structuredMentioned === true || heuristicMentioned || contextualMentioned
      : explicitTargetPresence && (structuredMentioned === true || heuristicMentioned)
    : heuristicMentioned;
  const position = mentioned
    ? structured?.position ?? (!structured ? findPosition(response.response, businessName) : null)
    : null;
  const resolvedCompetitors = await resolveCompetitors({
    sourceText: buildCompetitorSourceText(response.response, structured),
    businessName,
    prompt,
    primary: structured?.competitors ?? [],
    genericPrimary: structured?.genericAlternatives ?? [],
    allowHeuristicFallback: !structured,
  });
  const competitors = resolvedCompetitors.all.slice(0, 5);
  const genericAlternatives = resolvedCompetitors.generic.slice(0, 5);
  const competitorEntityTypes = resolvedCompetitors.entityTypes.slice(0, 8);
  const sentiment = mentioned
    ? structured?.sentiment ?? analyzeSentimentHeuristic(response.response, businessName)
    : null;

  const confidence = calculateConfidence(mentioned, position, sentiment);

  const organicMention = structured?.answerShort
    ? isMentioned(structured.answerShort, businessName)
    : undefined;
  const structuredCompetitors = structured?.competitors ?? [];
  const topEntityCompetitors =
    structured?.topEntities
      ?.filter((entity) => entity.role === 'competitor')
      .map((entity) => entity.name) ?? [];

  if (!structured) {
    logWarn('analysis_response_parse_failed', {
      auditId,
      phase: 'analysis_debug',
      provider: response.provider,
      prompt_id: prompt.id,
      prompt_category: prompt.category,
      prompt_track: prompt.analysisTrack ?? 'scoring',
      benchmark_group: prompt.benchmarkGroup ?? null,
      brand_anchored: prompt.brandAnchored ?? false,
      search_enabled: Boolean(response.searchEnabled),
      raw_response_length: response.response.length,
      raw_response_preview: buildDebugPreview(response.response),
      heuristic_mentioned: heuristicMentioned,
      contextual_mentioned: contextualMentioned,
      final_mentioned: mentioned,
    });
  }

  logInfo('analysis_response_diagnostics', {
    auditId,
    phase: 'analysis_debug',
    provider: response.provider,
    prompt_id: prompt.id,
    prompt_category: prompt.category,
    prompt_track: prompt.analysisTrack ?? 'scoring',
    benchmark_group: prompt.benchmarkGroup ?? null,
    brand_anchored: prompt.brandAnchored ?? false,
    search_enabled: Boolean(response.searchEnabled),
    parse_success: Boolean(structured),
    raw_response_length: response.response.length,
    answer_short_present: Boolean(structured?.answerShort),
    excerpt_present: Boolean(structured?.excerpt),
    citation_present: Boolean(structured?.citation),
    top_entities_count: structured?.topEntities?.length ?? 0,
    top_entity_competitors: topEntityCompetitors,
    structured_competitors_count: structuredCompetitors.length,
    structured_competitors: structuredCompetitors,
    generic_alternatives_count: genericAlternatives.length,
    generic_alternatives: genericAlternatives,
    competitor_entity_types: competitorEntityTypes,
    final_competitors_count: competitors.length,
    final_competitors: competitors,
    mentioned,
    organic_mentioned: organicMention,
    position,
    sentiment,
    aspect_count: structured?.aspects?.length ?? 0,
    comparison_count: structured?.comparisons?.length ?? 0,
    price_signal_present: Boolean(structured?.pricePositioning),
    confidence,
  });

  return {
    promptId: prompt.id,
    provider: response.provider,
    mentioned,
    organicMention,
    position,
    sentiment,
    competitors,
    explicitCompetitors: resolvedCompetitors.explicit.slice(0, 5),
    inferredCompetitors: resolvedCompetitors.inferred.slice(0, 5),
    competitorEntityTypes,
    genericAlternatives,
    answerShort: structured?.answerShort ?? '',
    excerpt: structured?.excerpt ?? '',
    citation: structured?.citation ?? '',
    topEntities: structured?.topEntities ?? [],
    aspectObservations: structured?.aspects ?? [],
    comparisonObservations: structured?.comparisons ?? [],
    priceObservation:
      structured?.pricePositioning ?? derivePriceObservationHeuristic(response.response),
    confidence,
    providerError: null,
  };
}

export async function analyzeFactResponse(
  params: AnalyzeFactResponseParams
): Promise<FactAnalysisResult> {
  const { auditId, response } = params;

  if (response.error || !response.response) {
    return {
      provider: response.provider,
      prompt: response.prompt,
      searchEnabled: response.searchEnabled,
      detected: emptyDetectedFacts(),
      detectedFieldCount: 0,
      possibleFieldCount: 5,
      confidence: 0,
      known: false,
      memoryKnown: false,
      providerError: response.error || 'Provider unavailable',
    };
  }

  const structured = parseStructuredFactResponse(response.response);
  if (!structured) {
    logWarn('fact_analysis_parse_failed', {
      auditId,
      phase: 'analysis_debug',
      provider: response.provider,
      search_enabled: Boolean(response.searchEnabled),
      raw_response_length: response.response.length,
      raw_response_preview: buildDebugPreview(response.response),
    });
    return {
      provider: response.provider,
      prompt: response.prompt,
      searchEnabled: response.searchEnabled,
      detected: emptyDetectedFacts(),
      detectedFieldCount: 0,
      possibleFieldCount: 5,
      confidence: 0,
      known: false,
      memoryKnown: false,
      providerError: 'Malformed fact extraction response',
    };
  }

  const confidence = calculateFactConfidence(structured.detected, structured.known);
  const detectedFieldCount = Object.values(structured.detected).filter(Boolean).length;

  logInfo('fact_analysis_diagnostics', {
    auditId,
    phase: 'analysis_debug',
    provider: response.provider,
    search_enabled: Boolean(response.searchEnabled),
    parse_success: true,
    raw_response_length: response.response.length,
    known: structured.known,
    detected_address: Boolean(structured.detected.address),
    detected_phone: Boolean(structured.detected.phone),
    detected_email: Boolean(structured.detected.email),
    detected_opening_hours: Boolean(structured.detected.openingHours),
    detected_city: Boolean(structured.detected.city),
    detected_field_count: detectedFieldCount,
    possible_field_count: 5,
    confidence,
  });

  return {
    provider: response.provider,
    prompt: response.prompt,
    searchEnabled: response.searchEnabled,
    detected: structured.detected,
    detectedFieldCount,
    possibleFieldCount: 5,
    confidence,
    known: structured.known,
    memoryKnown: !response.searchEnabled ? structured.known : false,
    providerError: null,
  };
}

function buildDebugPreview(value: string, maxLength = 220): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function resolveStructuredMentioned(
  structured: StructuredAuditResponse | null,
  businessName: string
): boolean | null {
  if (!structured) return null;

  const answerMentioned = isMentioned(structured.answerShort, businessName);
  const excerptMentioned = isMentioned(structured.excerpt, businessName);
  const citationMentioned = isMentioned(structured.citation, businessName);
  const topEntityMentioned = structured.topEntities.some((entity) =>
    entity.role === 'target' || isMentioned(entity.name, businessName)
  );

  if (!structured.mentioned && (answerMentioned || excerptMentioned || citationMentioned || topEntityMentioned)) {
    return true;
  }

  return structured.mentioned;
}

function hasExplicitTargetPresence(
  structured: StructuredAuditResponse | null,
  rawResponse: string,
  businessName: string
): boolean {
  if (structured) {
    if (isMentioned(structured.answerShort, businessName)) return true;
    if (isMentioned(structured.excerpt, businessName)) return true;
    if (isMentioned(structured.citation, businessName)) return true;
    if (
      structured.topEntities.some(
        (entity) => entity.role === 'target' || isMentioned(entity.name, businessName)
      )
    ) {
      return true;
    }
  }

  return isMentioned(rawResponse, businessName);
}

function usesMinimalStructuredAuditPayload(
  structured: StructuredAuditResponse | null
): boolean {
  if (!structured) return false;

  return (
    !structured.answerShort &&
    !structured.excerpt &&
    structured.topEntities.length === 0 &&
    structured.aspects.length === 0 &&
    structured.comparisons.length === 0 &&
    !structured.pricePositioning
  );
}

function inferMentionedFromPromptContext(
  prompt: PromptQuery,
  businessName: string,
  rawResponse: string,
  structured: StructuredAuditResponse | null
): boolean {
  if (!isBrandAnchoredPrompt(prompt, businessName)) {
    return false;
  }

  const responseText = [rawResponse, structured?.excerpt || '', structured?.citation || '']
    .concat(structured?.answerShort || '')
    .filter(Boolean)
    .join(' ');

  if (!responseText.trim() || looksLikeNonAnswer(responseText)) {
    return false;
  }

  if (structured?.position !== null) return true;
  if (structured?.topEntities.some((entity) => entity.role === 'target')) return true;
  if (structured?.competitors.length) return true;
  if ((structured?.answerShort || '').trim().length >= 40) return true;
  if ((structured?.excerpt || '').trim().length >= 32) return true;
  if ((structured?.citation || '').trim().length >= 24) return true;
  if (structured?.sentiment && structured.sentiment !== 'neutral') return true;

  return responseText.trim().length >= 80;
}

function parseStructuredAuditResponse(raw: string): StructuredAuditResponse | null {
  const parsed = parseJsonObject(raw);
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const data = parsed as Record<string, unknown>;
  const mentioned = typeof data.mentioned === 'boolean' ? data.mentioned : null;
  if (mentioned === null) return null;

  const answerShort = normalizeLimitedText(data.answer_short, 320);
  const sentiment = normalizeSentiment(data.sentiment);
  const topEntities = normalizeTopEntities(data.top_entities);
  const position = resolveStructuredPosition(data.position, topEntities, mentioned);
  const competitors = mergeStructuredCompetitors(
    normalizeCompetitors(data.competitors),
    topEntities
      .filter((entity) => entity.role === 'competitor')
      .map((entity) => entity.name)
  );
  const genericAlternatives = normalizeGenericAlternatives(data.generic_alternatives);
  const aspects = normalizeAspectObservations(data.aspects);
  const comparisons = normalizeComparisonObservations(data.comparisons);
  const pricePositioning =
    normalizePriceObservation(data.price_positioning) ||
    derivePriceObservationHeuristic(
      [answerShort, normalizeLimitedText(data.excerpt, 180), normalizeLimitedText(data.citation, 120)]
        .filter(Boolean)
        .join(' ')
    );
  const detected = normalizeDetected(data.detected);
  const excerpt = normalizeLimitedText(data.excerpt, 180);
  const citation = normalizeLimitedText(data.citation, 120);

  return {
    answerShort,
    mentioned,
    position,
    topEntities,
    sentiment,
    competitors,
    genericAlternatives,
    aspects,
    comparisons,
    pricePositioning,
    detected,
    excerpt,
    citation,
  };
}

function parseStructuredFactResponse(raw: string): StructuredFactResponse | null {
  const parsed = parseJsonObject(raw);
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const data = parsed as Record<string, unknown>;
  const detected = normalizeDetected(data.detected);
  const hasDetectedFacts = Object.values(detected).some(Boolean);
  const known = typeof data.known === 'boolean' ? data.known && hasDetectedFacts : hasDetectedFacts;

  return {
    known,
    detected,
  };
}

function parseJsonObject(raw: string): unknown {
  const direct = raw.trim();

  try {
    return JSON.parse(direct);
  } catch {
    // Continue with fallback extraction.
  }

  const fencedMatch = direct.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    try {
      return JSON.parse(fencedMatch[1]);
    } catch {
      // Continue below.
    }
  }

  const start = direct.indexOf('{');
  const end = direct.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const candidate = direct.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }

  return null;
}

async function resolveCompetitors(params: {
  sourceText: string;
  businessName: string;
  prompt: PromptQuery;
  primary: string[];
  genericPrimary: string[];
  allowHeuristicFallback: boolean;
}): Promise<{
  all: string[];
  explicit: string[];
  inferred: string[];
  generic: string[];
  entityTypes: Array<NonNullable<AnalysisResult['competitorEntityTypes']>[number]>;
}> {
  const { sourceText, businessName, prompt, primary, genericPrimary, allowHeuristicFallback } = params;
  const merged = mergeCompetitorCandidates(primary, [], genericPrimary, businessName, prompt);

  if (merged.displayable.length > 0 || !shouldExpectCompetitors(prompt) || !allowHeuristicFallback) {
    return {
      all: merged.displayable,
      explicit: merged.displayable,
      inferred: [],
      generic: merged.generic,
      entityTypes: merged.entityTypes,
    };
  }

  const heuristicExtraction = extractCompetitorsHeuristic(
    sourceText,
    businessName,
    prompt
  );
  const extractedMerged = mergeCompetitorCandidates(
    primary,
    heuristicExtraction,
    genericPrimary,
    businessName,
    prompt
  );

  return {
    all: extractedMerged.displayable,
    explicit: extractedMerged.displayable,
    inferred: [],
    generic: extractedMerged.generic,
    entityTypes: extractedMerged.entityTypes,
  };
}

function normalizeSentiment(value: unknown): 'positive' | 'neutral' | 'negative' {
  if (value === 'positive' || value === 'neutral' || value === 'negative') {
    return value;
  }
  return 'neutral';
}

function normalizeTopEntities(value: unknown): AnalysisTopEntity[] {
  if (!Array.isArray(value)) return [];

  const result: AnalysisTopEntity[] = [];
  const seen = new Set<string>();

  value.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const data = item as Record<string, unknown>;
    const name = normalizeNullableText(data.name);
    if (!name) return;
    const key = normalizeMentionText(name);
    if (!key || seen.has(key)) return;
    seen.add(key);

    const rank = normalizePosition(data.rank);
    const role =
      data.role === 'target' || data.role === 'competitor' || data.role === 'other'
        ? data.role
        : 'other';

    result.push({ name, rank, role });
  });

  return result.slice(0, 5);
}

function normalizePosition(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  const rounded = Math.round(value);
  if (rounded <= 0 || rounded > 50) return null;
  return rounded;
}

function resolveStructuredPosition(
  rawPosition: unknown,
  topEntities: AnalysisTopEntity[],
  mentioned: boolean
): number | null {
  const direct = normalizePosition(rawPosition);
  if (direct !== null) return direct;

  const targetEntity = topEntities.find((entity) => entity.role === 'target' && entity.rank !== null);
  if (targetEntity && targetEntity.rank !== null) {
    return targetEntity.rank;
  }

  const targetIndex = topEntities.findIndex((entity) => entity.role === 'target');
  if (targetIndex >= 0) {
    return targetIndex + 1;
  }

  void mentioned;
  return null;
}

function normalizeCompetitors(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const split = value
    .filter((item): item is string => typeof item === 'string')
    .flatMap(splitMultiBrandEntry);
  const cleaned = split
    .map((item) => canonicalizeCompetitorName(item.replace(/\s+/g, ' ').trim()))
    .filter((item) => item.length >= 2);
  return dedupeDistinctCompetitorNames(cleaned, 5);
}

function normalizeGenericAlternatives(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const cleaned = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => canonicalizeCompetitorName(item.replace(/\s+/g, ' ').trim()))
    .filter((item) => item.length >= 2)
    .filter((item) => isLikelyGenericAlternativeCandidate(item));
  return dedupeDistinctCompetitorNames(cleaned, 5);
}

const MULTI_BRAND_SEPARATOR = /\s*[.\/]\s+|\s*[,;]\s*|\s+(?:et|and|vs\.?|versus)\s+/i;

function splitMultiBrandEntry(entry: string): string[] {
  const trimmed = entry.trim();
  if (!trimmed) return [];
  const parts = trimmed.split(MULTI_BRAND_SEPARATOR).map((p) => p.trim()).filter((p) => p.length >= 2);
  return parts.length >= 2 ? parts : [trimmed];
}

function mergeStructuredCompetitors(primary: string[], secondary: string[]): string[] {
  const merged = [...primary, ...secondary]
    .flatMap(splitMultiBrandEntry)
    .map((item) => canonicalizeCompetitorName(item.replace(/\s+/g, ' ').trim()))
    .filter((item) => item.length >= 2);
  return dedupeDistinctCompetitorNames(merged, 5);
}

function normalizeCompetitorCandidate(candidate: string, businessName: string): string | null {
  const classification = classifyCompetitorEntity(candidate, businessName);
  const cleaned =
    classification.type === 'brand' || classification.type === 'marketplace'
      ? classification.name
      : null;
  if (!cleaned) return null;
  const normalized = canonicalizeCompetitorKey(cleaned);
  const sanitizedBusinessName = canonicalizeCompetitorKey(businessName);

  if (!cleaned || (sanitizedBusinessName && normalized === sanitizedBusinessName)) {
    return null;
  }

  if (
    sanitizedBusinessName &&
    (sanitizedBusinessName.includes(normalized) || normalized.includes(sanitizedBusinessName))
  ) {
    return null;
  }

  const tokenCount = normalized.split(' ').length;
  if (tokenCount === 1 && normalized.length < 3) {
    return null;
  }

  if (isLikelyNoiseCompetitorCandidate(cleaned)) {
    return null;
  }

  return cleaned;
}

function mergeCompetitorCandidates(
  primary: string[],
  secondary: string[],
  genericPrimary: string[],
  businessName: string,
  prompt: PromptQuery
): {
  displayable: string[];
  generic: string[];
  entityTypes: Array<NonNullable<AnalysisResult['competitorEntityTypes']>[number]>;
} {
  const result: string[] = [];
  const generic: string[] = [];
  const entityTypes: Array<NonNullable<AnalysisResult['competitorEntityTypes']>[number]> = [];
  const seen = new Set<string>();
  const genericSeen = new Set<string>();
  const entitySeen = new Set<string>();
  const prioritizedSecondary = shouldExpectCompetitors(prompt) ? secondary : secondary.slice(0, 1);

  const pushGeneric = (candidate: string) => {
    const cleaned = canonicalizeCompetitorName(candidate.replace(/\s+/g, ' ').trim());
    if (!cleaned || !isLikelyGenericAlternativeCandidate(cleaned)) return;
    const key = canonicalizeCompetitorKey(cleaned);
    if (!key || genericSeen.has(key)) return;
    genericSeen.add(key);
    generic.push(cleaned);
  };

  const pushCandidate = (candidate: string) => {
    const classification = classifyCompetitorEntity(candidate, businessName);
    if (classification.name) {
      const entityKey = `${classification.type}::${classification.normalizedKey || classification.name}`;
      if (!entitySeen.has(entityKey)) {
        entitySeen.add(entityKey);
        entityTypes.push({
          name: classification.name,
          type: classification.type,
        });
      }
    }
    if (classification.type === 'generic_actor' && classification.name) pushGeneric(classification.name);
    const normalized =
      classification.type === 'brand' || classification.type === 'marketplace'
        ? classification.name
        : null;
    if (!normalized) return;
    const existingIndex = result.findIndex((entry) => areLikelySameCompetitorName(entry, normalized));
    if (existingIndex !== -1) {
      result[existingIndex] = pickPreferredCompetitorName(result[existingIndex], normalized);
      return;
    }

    const key = canonicalizeCompetitorKey(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(normalized);
  };

  genericPrimary.forEach(pushGeneric);
  primary.forEach(pushCandidate);
  prioritizedSecondary.forEach(pushCandidate);

  return {
    displayable: result.slice(0, 5),
    generic: generic.slice(0, 5),
    entityTypes,
  };
}

function normalizeAspectKey(value: unknown): AspectObservation['aspect'] | null {
  if (typeof value !== 'string') return null;
  const normalized = normalizeMentionText(value);

  switch (normalized) {
    case 'price':
    case 'prix':
    case 'pricing':
      return 'price';
    case 'value':
    case 'rapport qualite prix':
    case 'rapport qualite prix valeur':
    case 'perceived value':
      return 'value';
    case 'quality':
    case 'qualite':
      return 'quality';
    case 'reliability':
    case 'fiabilite':
      return 'reliability';
    case 'support':
    case 'service client':
    case 'customer support':
    case 'sav':
      return 'support';
    case 'ease of use':
    case 'ease_of_use':
    case 'facilite d usage':
    case 'facilite d utilisation':
    case 'simplicite':
    case 'usability':
      return 'ease_of_use';
    case 'selection':
    case 'catalogue':
    case 'variety':
    case 'choix':
      return 'selection';
    case 'delivery':
    case 'livraison':
      return 'delivery';
    case 'returns':
    case 'return':
    case 'retours':
    case 'return policy':
      return 'returns';
    case 'availability':
    case 'disponibilite':
      return 'availability';
    case 'expertise':
    case 'expertise metier':
      return 'expertise';
    case 'authority':
    case 'autorite':
      return 'authority';
    case 'clarity':
    case 'clarte':
      return 'clarity';
    case 'speed':
    case 'rapidite':
    case 'vitesse':
      return 'speed';
    case 'trust':
    case 'confiance':
      return 'trust';
    case 'accessibility':
    case 'accessibilite':
      return 'accessibility';
    default:
      return null;
  }
}

function normalizeAspectObservations(value: unknown): AspectObservation[] {
  if (!Array.isArray(value)) return [];

  const result: AspectObservation[] = [];

  value.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const data = item as Record<string, unknown>;
    const aspect = normalizeAspectKey(data.aspect);
    if (!aspect) return;

    const entity =
      data.entity === 'target' || data.entity === 'competitor' || data.entity === 'market'
        ? data.entity
        : 'market';
    const sentiment = normalizeSentiment(data.sentiment);
    const evidence = normalizeLimitedText(data.evidence, 160);
    if (!evidence) return;

    const rawIntensity =
      typeof data.intensity === 'number' && Number.isFinite(data.intensity)
        ? Math.round(data.intensity)
        : 1;
    const intensity = rawIntensity >= 3 ? 3 : rawIntensity <= 1 ? 1 : 2;

    result.push({
      aspect,
      entity,
      sentiment,
      intensity: intensity as 1 | 2 | 3,
      evidence,
    });
  });

  return result.slice(0, 6);
}

function normalizeComparisonObservations(value: unknown): ComparisonObservation[] {
  if (!Array.isArray(value)) return [];

  const result: ComparisonObservation[] = [];
  const seen = new Set<string>();

  value.forEach((item) => {
    if (!item || typeof item !== 'object') return;
    const data = item as Record<string, unknown>;
    const competitor = normalizeNullableText(data.competitor);
    const aspect = normalizeAspectKey(data.aspect);
    const evidence = normalizeLimitedText(data.evidence, 160);
    const normalizedCompetitor = competitor ? normalizeCompetitorCandidate(competitor, '') : null;
    if (!normalizedCompetitor || !aspect || !evidence) return;

    const winner =
      data.winner === 'target' ||
      data.winner === 'competitor' ||
      data.winner === 'tie' ||
      data.winner === 'mixed' ||
      data.winner === 'unclear'
        ? data.winner
        : 'unclear';

    const dedupeKey = `${normalizeMentionText(normalizedCompetitor)}::${aspect}::${winner}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);

      result.push({
      competitor: normalizedCompetitor,
      aspect,
      winner,
      evidence,
    });
  });

  return result.slice(0, 5);
}

function normalizePriceObservation(value: unknown): PriceObservation | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;

  const label =
    data.label === 'budget' ||
    data.label === 'value' ||
    data.label === 'premium' ||
    data.label === 'mixed' ||
    data.label === 'unknown'
      ? data.label
      : 'unknown';
  const direction =
    data.direction === 'cheaper' ||
    data.direction === 'similar' ||
    data.direction === 'more_expensive' ||
    data.direction === 'mixed' ||
    data.direction === 'unknown'
      ? data.direction
      : 'unknown';
  const evidence = normalizeLimitedText(data.evidence, 160);

  if (label === 'unknown' && direction === 'unknown' && !evidence) {
    return null;
  }

  return {
    label,
    direction,
    evidence,
  };
}

function derivePriceObservationHeuristic(text: string): PriceObservation | null {
  const normalized = normalizeMentionText(text);
  if (!normalized) return null;

  const signals = {
    cheaper:
      /moins cher|abordable|budget|economique|competitive pricing|cheaper|affordable|low cost/.test(
        normalized
      ),
    premium:
      /plus cher|premium|haut de gamme|expensive|overpriced|costly/.test(normalized),
    value:
      /bon rapport qualite prix|good value|value for money|worth the price|bon rapport/.test(
        normalized
      ),
  };

  if (!signals.cheaper && !signals.premium && !signals.value) {
    return null;
  }

  if (signals.cheaper && !signals.premium) {
    return {
      label: signals.value ? 'value' : 'budget',
      direction: 'cheaper',
      evidence: truncateForExtraction(text, 160),
    };
  }

  if (signals.premium && !signals.cheaper) {
    return {
      label: 'premium',
      direction: 'more_expensive',
      evidence: truncateForExtraction(text, 160),
    };
  }

  return {
    label: 'mixed',
    direction: 'mixed',
    evidence: truncateForExtraction(text, 160),
  };
}

function normalizeDetected(value: unknown): StructuredDetected {
  const data = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    address: normalizeFactAddress(data.address),
    phone: normalizeFactPhone(data.phone),
    email: normalizeFactEmail(data.email),
    openingHours: normalizeFactOpeningHours(data.openingHours),
    city: normalizeFactCity(data.city),
  };
}

function emptyDetectedFacts(): DetectedBusinessFacts {
  return {
    address: null,
    phone: null,
    email: null,
    openingHours: null,
    city: null,
  };
}

function normalizeNullableText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeFactAddress(value: unknown): string | null {
  return normalizeFactText(value, {
    maxLength: 250,
  });
}

function normalizeFactPhone(value: unknown): string | null {
  const cleaned = normalizeFactText(value);
  if (!cleaned) return null;

  const digits = cleaned.match(/\d/g);
  return digits && digits.length >= 8 ? cleaned : null;
}

function normalizeFactEmail(value: unknown): string | null {
  const cleaned = normalizeFactText(value);
  if (!cleaned) return null;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned) ? cleaned : null;
}

function normalizeFactOpeningHours(value: unknown): string | null {
  return normalizeFactText(value, {
    maxLength: 200,
  });
}

function normalizeFactCity(value: unknown): string | null {
  const cleaned = normalizeFactText(value, {
    maxLength: 80,
  });
  if (!cleaned) return null;

  const normalizedCity = cleaned
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  if (
    NON_CITY_VALUES.has(normalizedCity) ||
    /\b(region|région|departement|département|country|pays)\b/i.test(cleaned)
  ) {
    return null;
  }

  return cleaned;
}

function normalizeFactText(
  value: unknown,
  options: {
    maxLength?: number;
  } = {}
): string | null {
  const cleaned = normalizeNullableText(value);
  if (!cleaned) return null;
  if (FACT_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(cleaned))) return null;
  if (options.maxLength && cleaned.length > options.maxLength) return null;
  return cleaned;
}

function normalizeLimitedText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function truncateForExtraction(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

function buildCompetitorSourceText(
  rawResponse: string,
  structured: StructuredAuditResponse | null
): string {
  const structuredText = [
    structured?.answerShort || '',
    structured?.excerpt || '',
    structured?.citation || '',
    ...(structured?.topEntities.map((entity) => entity.name) || []),
    ...(structured?.competitors || []),
    ...(structured?.aspects.map((item) => item.evidence) || []),
    ...(structured?.comparisons.map((item) => `${item.competitor} ${item.evidence}`) || []),
    structured?.pricePositioning?.evidence || '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
  return [structuredText, rawResponse].filter(Boolean).join('\n').trim();
}

function isBrandAnchoredPrompt(prompt: PromptQuery, businessName: string): boolean {
  const normalizedPrompt = normalizeMentionText(prompt.prompt);
  const normalizedBusinessName = normalizeMentionText(businessName);
  if (!normalizedPrompt || !normalizedBusinessName) return false;
  return normalizedPrompt.includes(normalizedBusinessName);
}

function looksLikeNonAnswer(text: string): boolean {
  return NON_ANSWER_PATTERNS.some((pattern) => pattern.test(text));
}

function isMentioned(text: string, businessName: string): boolean {
  const normalizedText = normalizeMentionText(text);
  const normalizedName = normalizeMentionText(businessName);

  if (!normalizedText || !normalizedName) {
    return false;
  }

  if (normalizedText.includes(normalizedName)) {
    return true;
  }

  const nameWords = normalizedName.split(/\s+/).filter((word) => word.length > 2);
  if (nameWords.length > 1) {
    const allWordsPresent = nameWords.every((word) => normalizedText.includes(word));
    if (allWordsPresent) {
      return true;
    }
  }

  return false;
}

function normalizeMentionText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findPosition(text: string, businessName: string): number | null {
  const lines = text.split('\n');
  let position = 1;

  for (const line of lines) {
    const trimmed = line.trim();

    const numberedMatch = trimmed.match(/^(\d+)[\.\)]\s/);
    if (numberedMatch) {
      position = parseInt(numberedMatch[1], 10);
    }

    if (isMentioned(trimmed, businessName)) {
      return position;
    }

    if (numberedMatch || trimmed.startsWith('-') || trimmed.startsWith('•')) {
      position += 1;
    }
  }

  return null;
}

function shouldExpectCompetitors(prompt: PromptQuery): boolean {
  return (
    COMPETITOR_FOCUSED_CATEGORIES.has(prompt.category) ||
    /alternatives?|concurrents?|comparables?|compare|recommander|meilleures?|quel (?:outil|logiciel|site|acteur|prestataire) choisir/i.test(
      prompt.prompt
    )
  );
}

function extractCompetitorsHeuristic(
  text: string,
  businessName: string,
  prompt: PromptQuery
): string[] {
  const sanitizedBusinessName = businessName.toLowerCase().trim();
  const candidates = new Map<string, number>();

  const matches = text.match(/\b[A-ZÀ-Ý][\wÀ-ÿ'’.-]+(?:\s+[A-ZÀ-Ý0-9][\wÀ-ÿ'’.-]+){0,4}\b/g) || [];

  for (const rawMatch of matches) {
    const candidate = rawMatch.replace(/\s+/g, ' ').trim();
    const normalized = candidate.toLowerCase();

    if (!candidate || normalized === sanitizedBusinessName) {
      continue;
    }

    if (normalized.length < 3) {
      continue;
    }

    if (NON_COMPETITOR_TOKENS.has(normalized)) {
      continue;
    }

    if (sanitizedBusinessName.includes(normalized) || normalized.includes(sanitizedBusinessName)) {
      continue;
    }

    const tokenCount = normalized.split(' ').length;
    if (tokenCount === 1 && normalized.length < 5) {
      continue;
    }

    if (isLikelyNoiseCompetitorCandidate(candidate)) {
      continue;
    }

    candidates.set(candidate, (candidates.get(candidate) || 0) + 1);
  }

  if (shouldExpectCompetitors(prompt)) {
    const listLikeLines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => /^(\d+[\.\)]\s+|[-•]\s+)/.test(line));

    for (const line of listLikeLines) {
      const stripped = line.replace(/^(\d+[\.\)]\s+|[-•]\s+)/, '').trim();
      const head = stripped.split(/\s[-–:,(]/)[0]?.trim() || stripped;
      const normalizedHead = normalizeCompetitorCandidate(head, businessName);
      if (!normalizedHead) continue;
      candidates.set(normalizedHead, (candidates.get(normalizedHead) || 0) + 2);
    }
  }

  return Array.from(candidates.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
    .slice(0, 6);
}

function isLikelyNoiseCompetitorCandidate(candidate: string): boolean {
  if (COMPETITOR_NOISE_PREFIX_PATTERN.test(candidate)) return true;
  const normalizedTokens = candidate
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean);

  if (normalizedTokens.length === 0) return true;

  if (normalizedTokens.every((token) => NON_COMPETITOR_TOKENS.has(token))) {
    return true;
  }

  if (normalizedTokens.length === 1) {
    return NON_COMPETITOR_TOKENS.has(normalizedTokens[0]);
  }

  const meaningfulTokens = normalizedTokens.filter(
    (token) => !NON_COMPETITOR_TOKENS.has(token)
  );
  return meaningfulTokens.length === 0;
}

function isLikelyGenericAlternativeCandidate(candidate: string): boolean {
  if (!GENERIC_ALTERNATIVE_PATTERN.test(candidate)) return false;
  const normalizedTokens = candidate
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean);

  const distinctiveTokens = normalizedTokens.filter(
    (token) =>
      !GENERIC_COMPETITOR_TOKENS.has(token) &&
      !NON_COMPETITOR_TOKENS.has(token) &&
      !DISPLAYABLE_COMPETITOR_STOPWORDS.has(token) &&
      token.length >= 3
  );

  if (distinctiveTokens.length > 1) return false;
  return true;
}

function analyzeSentimentHeuristic(
  text: string,
  businessName: string
): 'positive' | 'neutral' | 'negative' {
  const lowerText = text.toLowerCase();
  const lowerBusiness = businessName.toLowerCase();

  const focusWindow = extractBusinessContext(lowerText, lowerBusiness) || lowerText;

  const positiveScore = POSITIVE_MARKERS.reduce(
    (sum, marker) => sum + countOccurrences(focusWindow, marker),
    0
  );
  const negativeScore = NEGATIVE_MARKERS.reduce(
    (sum, marker) => sum + countOccurrences(focusWindow, marker),
    0
  );

  if (positiveScore >= negativeScore + 1) return 'positive';
  if (negativeScore >= positiveScore + 1) return 'negative';
  return 'neutral';
}

function extractBusinessContext(text: string, businessName: string): string {
  const index = text.indexOf(businessName);
  if (index < 0) return '';

  const start = Math.max(0, index - 180);
  const end = Math.min(text.length, index + businessName.length + 180);
  return text.slice(start, end);
}

function countOccurrences(text: string, fragment: string): number {
  let from = 0;
  let count = 0;
  while (from < text.length) {
    const idx = text.indexOf(fragment, from);
    if (idx === -1) break;
    count += 1;
    from = idx + fragment.length;
  }
  return count;
}

function normalizeSemanticToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isLikelySameCity(a: string, b: string): boolean {
  const left = normalizeSemanticToken(a);
  const right = normalizeSemanticToken(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

function calculateConfidence(
  mentioned: boolean,
  position: number | null,
  sentiment: 'positive' | 'neutral' | 'negative' | null
): number {
  if (!mentioned) return 0;

  let confidence = 0.5;

  if (position !== null) {
    if (position === 1) confidence += 0.3;
    else if (position <= 3) confidence += 0.2;
    else if (position <= 5) confidence += 0.1;
  }

  if (sentiment === 'positive') confidence += 0.2;
  else if (sentiment === 'negative') confidence -= 0.2;

  return Math.max(0, Math.min(1, confidence));
}

function calculateFactConfidence(
  detected: DetectedBusinessFacts,
  known: boolean
): number {
  const detectedFactsCount = Object.values(detected).filter(Boolean).length;
  let confidence = known ? 0.35 : 0.2;

  if (detectedFactsCount >= 4) confidence += 0.45;
  else if (detectedFactsCount === 3) confidence += 0.35;
  else if (detectedFactsCount === 2) confidence += 0.25;
  else if (detectedFactsCount === 1) confidence += 0.15;

  return Math.max(0, Math.min(1, confidence));
}
