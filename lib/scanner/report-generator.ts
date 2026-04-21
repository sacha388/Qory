import type {
  Report,
  ScanResults,
  AnalysisResult,
  FactAnalysisResult,
  PromptQuery,
  CrawlResult,
} from '@/types';
import { shouldUseMockData } from '@/lib/ai/mode';
import { buildRecommendations } from '@/lib/report/action-plan';
import { buildGlobalExecutiveSummary, buildReportSynthesis } from '@/lib/report/synthesis';
import { buildMarketInsights } from '@/lib/report/market-positioning';
import { logInfo } from '@/lib/logger';
import { getSitemapVerdict, getStructuredDataVerdict } from '@/lib/scanner/crawl-status';
import {
  areLikelySameCompetitorName,
  canonicalizeCompetitorKey,
  canonicalizeCompetitorName,
  collapseBareCompetitorAliases,
  computeCompositeSplitPlan,
  pickPreferredCompetitorName,
} from '@/lib/scanner/competitor-normalization';
import {
  classifyCompetitorEntity,
  shouldIncludeCompetitiveEntity,
} from '@/lib/scanner/competitor-entities';
import {
  classifyCompetitorCandidatesWithGemini,
  isGeminiConfigured,
  type GeminiCompetitorClassification,
  type GeminiCompetitorCandidate,
  type GeminiCompetitorEntityType,
} from '@/lib/ai/gemini';
import { affectsCitationMatrix, affectsVisibilityScore } from '@/lib/scanner/prompt-tracks';

function inspectCompetitorDisplayName(name: string, businessName?: string | null): {
  accepted: boolean;
  sanitized: string | null;
  type: 'brand' | 'directory' | 'marketplace' | 'generic_actor' | 'noise';
  reason:
    | 'too_short'
    | 'noise'
    | 'directory'
    | 'generic_actor'
    | 'ok';
} {
  const classified = classifyCompetitorEntity(name, businessName);
  if (!classified.name && classified.type === 'noise') {
    return { accepted: false, sanitized: null, type: 'noise', reason: 'too_short' };
  }
  if (classified.type === 'directory') {
    return { accepted: false, sanitized: classified.name, type: 'directory', reason: 'directory' };
  }
  if (classified.type === 'generic_actor') {
    return { accepted: false, sanitized: classified.name, type: 'generic_actor', reason: 'generic_actor' };
  }
  if (classified.type === 'noise' || !classified.name) {
    return { accepted: false, sanitized: null, type: 'noise', reason: 'noise' };
  }

  return {
    accepted: true,
    sanitized: classified.name,
    type: classified.type,
    reason: 'ok',
  };
}

export async function generateReport(auditId: string, results: ScanResults): Promise<Report> {
  const { score, analyses, crawl, prompts } = results;
  const factAnalyses = results.factAnalyses ?? [];
  const scoringPrompts = prompts.filter((prompt) => affectsVisibilityScore(prompt));
  const citationPrompts = prompts.filter((prompt) => affectsCitationMatrix(prompt));
  const scoringPromptIds = new Set(scoringPrompts.map((prompt) => prompt.id));
  const positioningScore = score.positioning?.score ?? score.sentiment?.score ?? 50;
  const normalizedGlobalScore = calculateUnifiedGlobalScore({
    technical: score.technical.score,
    factualCoverage: score.factualCoverage.score,
    visibility: score.visibility.score,
    positioning: positioningScore,
  }, score.mentionRate);
  const promptById = new Map(prompts.map(p => [p.id, p.prompt]));
  const availableAnalyses = analyses.filter((analysis) => !analysis.providerError);
  const availableScoringAnalyses = availableAnalyses.filter((analysis) =>
    scoringPromptIds.has(analysis.promptId)
  );
  const providerHealthInputs = mergeProviderHealthAnalyses(analyses, factAnalyses);
  const providerHealth = calculateProviderHealth(providerHealthInputs);
  const dataQuality = calculateDataQuality(crawl, providerHealth, providerHealthInputs);
  
  const synthesis = buildReportSynthesis({
    language: detectReportLanguage(crawl, prompts),
    globalScore: normalizedGlobalScore,
    mentionRate: score.mentionRate,
    topCompetitorName: score.topCompetitors[0]?.name,
    factualCoverageScore: score.factualCoverage.score,
    blocksAICrawlers: Boolean(crawl?.robotsTxt?.blocksGPTBot || crawl?.robotsTxt?.blocksClaude),
    dataQuality,
    crawlStatus: crawl?.crawlStatus,
  });
  
  // Calculate visibility by model
  const visibilityByModel = calculateVisibilityByModel(availableScoringAnalyses);
  
  // Generate query matrix (first 5 queries)
  let queryMatrix = generateQueryMatrix(availableScoringAnalyses, citationPrompts);
  let factSnapshots = buildFactSnapshots(factAnalyses);
  
  const triageCandidates = collectCompetitorTriageCandidates(availableScoringAnalyses, promptById);
  const geminiTriage = shouldUseMockData()
    ? {
        configured: false,
        used: false,
        model: 'gemini-2.5-flash-lite',
        entities: [] as GeminiCompetitorClassification[],
        error: 'mock_mode',
      }
    : await classifyCompetitorCandidatesWithGemini({
        auditId,
        businessName: crawl.businessInfo.name,
        promptProfile: results.promptProfile,
        candidates: triageCandidates,
      });
  const geminiClassificationMap = buildGeminiClassificationMap(geminiTriage.entities);
  const geminiCandidateMap = buildGeminiCandidateMap(triageCandidates);

  // Process competitors: each AI response counts individually
  // (10 prompts × active providers, each citation = 1)
  const competitorGroups: Array<{ name: string; analysisKeys: Set<string>; appearsInQueries: Set<string> }> = [];
  const competitorRejections: Array<{
    provider: string;
    promptId: string;
    raw: string;
    reason: string;
  }> = [];
  availableScoringAnalyses.forEach(analysis => {
    const query = promptById.get(analysis.promptId) || analysis.promptId;
    const analysisKey = `${analysis.promptId}::${analysis.provider}`;
    const reportCompetitors = gatherAnalysisCompetitorCandidates(analysis);
    reportCompetitors.forEach(rawCompetitor => {
      const inspection = resolveCompetitorInspection({
        rawName: rawCompetitor || '',
        businessName: crawl.businessInfo.name,
        promptProfile: results.promptProfile,
        geminiClassificationMap,
        geminiCandidateMap,
      });
      const competitor = inspection.sanitized;
      const shouldKeep = inspection.accepted;
      if (!shouldKeep) {
        competitorRejections.push({
          provider: analysis.provider,
          promptId: analysis.promptId,
          raw: rawCompetitor,
          reason: inspection.reason === 'ok' ? inspection.type : inspection.reason,
        });
      }
      if (!competitor || !shouldKeep) return;

      const existingGroup = competitorGroups.find((entry) =>
        areLikelySameCompetitorName(entry.name, competitor)
      );

      if (existingGroup) {
        existingGroup.name = pickPreferredCompetitorName(existingGroup.name, competitor);
        existingGroup.analysisKeys.add(analysisKey);
        existingGroup.appearsInQueries.add(query);
        return;
      }

      competitorGroups.push({
        name: competitor,
        analysisKeys: new Set<string>([analysisKey]),
        appearsInQueries: new Set<string>([query]),
      });
    });
  });

  applyCompositeSplitOnQueryGroups(competitorGroups);

  let competitors = competitorGroups
    .map((entry) => ({
      name: entry.name,
      mentionCount: entry.analysisKeys.size,
      appearsInQueries: Array.from(entry.appearsInQueries),
    }))
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, 5);

  // For "Vous", exclude brand-anchored prompts (e.g. "Que sais-tu sur X?")
  // which trivially mention the target site. Each AI response counts individually.
  const nonBrandAnchoredPromptIds = new Set(
    scoringPrompts.filter((p) => !p.brandAnchored).map((p) => p.id)
  );
  const targetAliasAnalysisKeys = new Set<string>();
  availableScoringAnalyses.forEach((analysis) => {
    if (!nonBrandAnchoredPromptIds.has(analysis.promptId)) return;
    const analysisKey = `${analysis.promptId}::${analysis.provider}`;
    const reportCompetitors = gatherAnalysisCompetitorCandidates(analysis);
    if (
      reportCompetitors.some((candidate) =>
        isGeminiTargetAlias(
          candidate,
          geminiClassificationMap,
          crawl.businessInfo.name,
          results.promptProfile
        )
      )
    ) {
      targetAliasAnalysisKeys.add(analysisKey);
    }
  });
  const yourMentionCount = availableScoringAnalyses
    .filter((analysis) => {
      if (!nonBrandAnchoredPromptIds.has(analysis.promptId)) return false;
      const analysisKey = `${analysis.promptId}::${analysis.provider}`;
      return (analysis.organicMention ?? analysis.mentioned) || targetAliasAnalysisKeys.has(analysisKey);
    })
    .length;
  let competitorBenchmark = {
    youMentionCount: yourMentionCount,
    totalQueries: scoringPrompts.length * Math.max(providerHealth.activeProviders, 1),
  };

  const marketInsights = await buildMarketInsights({
    auditId,
    insightResults: results.insightResults,
    promptProfile: results.promptProfile,
    crawl,
    topCompetitorName: competitors[0]?.name ?? score.topCompetitors[0]?.name ?? null,
  });

  if (shouldUseMockData()) {
    const mockSections = buildMockSections(prompts, crawl.businessInfo);
    competitors = mockSections.competitors;
    competitorBenchmark = mockSections.benchmark;
    factSnapshots = mockSections.factSnapshots;
  }
  
  // Generate technical audit details
  const technicalAudit = generateTechnicalAudit(crawl);
  
  // Generate recommendations
  const recommendations = buildRecommendations({
    auditId,
    score,
    crawl,
    analyses: availableAnalyses,
    marketInsights,
    promptProfile: results.promptProfile,
    positioningScore,
  });
  const blockedBots = [
    crawl.robotsTxt.blocksGPTBot ? 'GPTBot' : null,
    crawl.robotsTxt.blocksClaude ? 'ClaudeBot' : null,
    crawl.robotsTxt.blocksPerplexity ? 'PerplexityBot' : null,
  ].filter(Boolean) as string[];
  const globalExecutiveSummary = buildGlobalExecutiveSummary({
    globalScore: normalizedGlobalScore,
    visibilityScore: score.visibility.score,
    positioningScore,
    technicalScore: score.technical.score,
    mentionRate: score.mentionRate,
    topCompetitorName: competitors[0]?.name ?? score.topCompetitors[0]?.name ?? null,
    factualCoverageScore: score.factualCoverage.score,
    blockedBots,
    hasSchema: crawl.structuredData.hasSchemaOrg,
    hasSitemap: crawl.sitemap.exists,
    hasHttps: crawl.performance.isHttps,
    marketInsights,
    recommendations,
    dataQuality,
    crawlStatus: crawl?.crawlStatus,
  });

  logInfo('report_generation_diagnostics', {
    auditId,
    phase: 'report_debug',
    prompt_count: prompts.length,
    scoring_prompt_count: scoringPrompts.length,
    citation_prompt_count: citationPrompts.length,
    total_analysis_count: analyses.length,
    available_analysis_count: availableAnalyses.length,
    scoring_analysis_count: availableScoringAnalyses.length,
    provider_health: providerHealth,
    data_quality: dataQuality,
    summary_scores: {
      global: normalizedGlobalScore,
      visibility: score.visibility.score,
      factual_coverage: score.factualCoverage.score,
      positioning: positioningScore,
      technical: score.technical.score,
      mention_rate: score.mentionRate,
    },
    query_matrix_rows: queryMatrix.length,
    fact_snapshot_count: factSnapshots.length,
    competitor_count: competitors.length,
    competitor_benchmark: competitorBenchmark,
    gemini_triage: {
      configured: isGeminiConfigured(),
      used: geminiTriage.used,
      model: geminiTriage.model,
      candidate_count: triageCandidates.length,
      classified_count: geminiTriage.entities.length,
      type_counts: summarizeGeminiTriage(geminiTriage.entities),
      error: geminiTriage.error ?? null,
    },
    competitor_rejection_count: competitorRejections.length,
    competitor_rejections: competitorRejections.slice(0, 20),
    competitor_groups: competitors,
    technical_audit: technicalAudit,
    recommendation_count: recommendations.length,
    recommendation_titles: recommendations.map((recommendation) => recommendation.title),
    market_insights_present: Boolean(marketInsights),
    market_insight_snapshot: marketInsights
      ? {
          price_positioning: marketInsights.pricePositioning.label,
          market_sentiment: marketInsights.marketSentiment.label,
          polarization: marketInsights.polarization.level,
          trust_level: marketInsights.trustLevel.level,
          signal_strength: marketInsights.signalStrength,
          strengths_count: marketInsights.strengths.length,
          weaknesses_count: marketInsights.weaknesses.length,
          comparison_axes_count: marketInsights.comparisonAxes.length,
          alternative_families_count: marketInsights.alternativeFamilies.length,
        }
      : null,
  });
  
  return {
    auditId,
    generatedAt: new Date().toISOString(),
    synthesis,
    dataQuality,
    providerHealth,
    summary: {
      globalScore: normalizedGlobalScore,
      visibility: score.visibility.score,
      factualCoverage: score.factualCoverage.measurable === false ? null : score.factualCoverage.score,
      positioning: positioningScore,
      technical: score.technical.score,
    },
    queryMatrix,
    visibilityByModel,
    factSnapshots,
    competitors,
    marketInsights,
    competitorBenchmark,
    technicalAudit,
    recommendations,
    globalExecutiveSummary,
  };
}

function gatherAnalysisCompetitorCandidates(analysis: AnalysisResult): string[] {
  const rawCandidates = [
    ...(analysis.explicitCompetitors ?? []),
    ...(analysis.competitors ?? []),
    ...(analysis.inferredCompetitors ?? []),
    ...((analysis.topEntities ?? [])
      .filter((entity) => entity.role === 'competitor')
      .map((entity) => entity.name)),
    ...((analysis.competitorEntityTypes ?? []).map((entry) => entry.name)),
  ];

  const result: string[] = [];
  const seen = new Set<string>();

  rawCandidates.forEach((candidate) => {
    const cleaned = canonicalizeCompetitorName(candidate || '');
    const key = canonicalizeCompetitorKey(cleaned);
    if (!cleaned || !key || seen.has(key)) return;
    seen.add(key);
    result.push(cleaned);
  });

  return result;
}

function collectCompetitorTriageCandidates(
  analyses: AnalysisResult[],
  promptById: Map<string, string>
): GeminiCompetitorCandidate[] {
  const candidateMap = new Map<
    string,
    {
      raw: string;
      providers: Set<string>;
      querySamples: Set<string>;
      sourceKinds: Set<string>;
      occurrences: number;
    }
  >();

  analyses.forEach((analysis) => {
    const query = promptById.get(analysis.promptId) || analysis.promptId;
    const push = (raw: string, sourceKind: string) => {
      const cleaned = canonicalizeCompetitorName(raw || '');
      const key = canonicalizeCompetitorKey(cleaned);
      if (!cleaned || !key) return;
      const existing = candidateMap.get(key);
      if (existing) {
        existing.providers.add(analysis.provider);
        if (existing.querySamples.size < 3) existing.querySamples.add(query);
        existing.sourceKinds.add(sourceKind);
        existing.occurrences += 1;
        return;
      }

      candidateMap.set(key, {
        raw: cleaned,
        providers: new Set([analysis.provider]),
        querySamples: new Set([query]),
        sourceKinds: new Set([sourceKind]),
        occurrences: 1,
      });
    };

    (analysis.explicitCompetitors ?? []).forEach((candidate) => push(candidate, 'explicit'));
    (analysis.competitors ?? []).forEach((candidate) => push(candidate, 'competitor'));
    (analysis.inferredCompetitors ?? []).forEach((candidate) => push(candidate, 'inferred'));
    (analysis.genericAlternatives ?? []).forEach((candidate) => push(candidate, 'generic_alternative'));
    (analysis.topEntities ?? [])
      .filter((entity) => entity.role === 'competitor')
      .forEach((entity) => push(entity.name, 'top_entity'));
    (analysis.competitorEntityTypes ?? []).forEach((entity) => push(entity.name, `typed:${entity.type}`));
  });

  return Array.from(candidateMap.values())
    .map((candidate, index) => ({
      id: `c${index + 1}`,
      raw: candidate.raw,
      providers: Array.from(candidate.providers),
      querySamples: Array.from(candidate.querySamples),
      sourceKinds: Array.from(candidate.sourceKinds),
      occurrences: candidate.occurrences,
    }))
    .slice(0, 60);
}

function buildGeminiClassificationMap(
  entities: GeminiCompetitorClassification[]
): Map<string, GeminiCompetitorClassification> {
  const map = new Map<string, GeminiCompetitorClassification>();
  entities.forEach((entity) => {
    const key = canonicalizeCompetitorKey(entity.raw);
    if (!key) return;
    map.set(key, entity);
  });
  return map;
}

function buildGeminiCandidateMap(
  candidates: GeminiCompetitorCandidate[]
): Map<string, GeminiCompetitorCandidate> {
  const map = new Map<string, GeminiCompetitorCandidate>();
  candidates.forEach((candidate) => {
    const key = canonicalizeCompetitorKey(candidate.raw);
    if (!key) return;
    map.set(key, candidate);
  });
  return map;
}

function buildTargetReferenceKeys(params: {
  businessName?: string | null;
  promptProfile?: ScanResults['promptProfile'];
}): Set<string> {
  const keys = new Set<string>();
  const push = (value?: string | null) => {
    const key = canonicalizeCompetitorKey(value || '');
    if (key) keys.add(key);
  };

  push(params.businessName);
  push(params.promptProfile?.siteName);

  return keys;
}

function isValidatedGeminiTargetAlias(params: {
  rawName: string;
  geminiClassificationMap: Map<string, GeminiCompetitorClassification>;
  businessName?: string | null;
  promptProfile?: ScanResults['promptProfile'];
}): boolean {
  const key = canonicalizeCompetitorKey(params.rawName || '');
  const classification = key ? params.geminiClassificationMap.get(key) : null;
  if (!classification || classification.type !== 'target_alias') return false;

  const targetKeys = buildTargetReferenceKeys({
    businessName: params.businessName,
    promptProfile: params.promptProfile,
  });
  if (targetKeys.size === 0) return false;

  const candidateKeys = [
    canonicalizeCompetitorKey(params.rawName || ''),
    canonicalizeCompetitorKey(classification.label || ''),
    canonicalizeCompetitorKey(classification.reason || ''),
  ].filter(Boolean) as string[];

  return candidateKeys.some((candidateKey) =>
    Array.from(targetKeys).some(
      (targetKey) =>
        candidateKey === targetKey ||
        candidateKey.includes(targetKey) ||
        targetKey.includes(candidateKey)
    )
  );
}

function isManifestlyWeakBrandCandidate(params: {
  candidate: GeminiCompetitorCandidate | null;
  geminiClassification: GeminiCompetitorClassification;
  promptProfile?: ScanResults['promptProfile'];
}): boolean {
  if (params.geminiClassification.type !== 'brand') return false;

  const siteType = params.promptProfile?.siteType || null;
  const isProductMarket = Boolean(
    siteType &&
      [
        'saas',
        'ai_native',
        'marketplace',
        'ecommerce',
        'documentation_knowledge',
        'streaming_entertainment',
        'travel_booking',
        'jobs_recruitment',
      ].includes(siteType)
  );
  if (!isProductMarket) return false;

  const label = canonicalizeCompetitorName(params.geminiClassification.label || params.candidate?.raw || '');
  if (!label) return false;

  const descriptiveServicePattern =
    /\b(?:formateur|formation|coach|coaching|consult(?:ant|ing)?|agence|studio|freelance|freelancer|service|services|integrat(?:eur|or)|implementation|impl[ée]mentation)\b/i;
  const lowEvidence =
    (params.candidate?.occurrences || 0) <= 1 &&
    params.geminiClassification.confidence !== 'high';

  return descriptiveServicePattern.test(label) && lowEvidence;
}

function isGeminiTargetAlias(
  rawName: string,
  geminiClassificationMap: Map<string, GeminiCompetitorClassification>,
  businessName?: string | null,
  promptProfile?: ScanResults['promptProfile']
): boolean {
  return isValidatedGeminiTargetAlias({
    rawName,
    geminiClassificationMap,
    businessName,
    promptProfile,
  });
}

function resolveCompetitorInspection(params: {
  rawName: string;
  businessName?: string | null;
  promptProfile?: ScanResults['promptProfile'];
  geminiClassificationMap: Map<string, GeminiCompetitorClassification>;
  geminiCandidateMap: Map<string, GeminiCompetitorCandidate>;
}): {
  accepted: boolean;
  sanitized: string | null;
  type: GeminiCompetitorEntityType;
  reason:
    | 'too_short'
    | 'noise'
    | 'directory'
    | 'generic_actor'
    | 'marketplace_excluded'
    | 'target_alias'
    | 'weak_brand'
    | 'self'
    | 'ok';
} {
  const key = canonicalizeCompetitorKey(params.rawName || '');
  const geminiClassification = key ? params.geminiClassificationMap.get(key) : null;
  const geminiCandidate = key ? params.geminiCandidateMap.get(key) || null : null;
  const label = canonicalizeCompetitorName(geminiClassification?.label || params.rawName || '');
  const candidateKey = canonicalizeCompetitorKey(label);
  const businessKey = canonicalizeCompetitorKey(params.businessName || '');

  if (!label || label.length < 2) {
    return { accepted: false, sanitized: null, type: 'noise', reason: 'too_short' };
  }

  if (
    businessKey &&
    candidateKey &&
    (candidateKey === businessKey ||
      candidateKey.includes(businessKey) ||
      businessKey.includes(candidateKey))
  ) {
    return { accepted: false, sanitized: null, type: 'noise', reason: 'self' };
  }

  if (geminiClassification) {
    const isValidatedTargetAlias =
      geminiClassification.type === 'target_alias' &&
      isValidatedGeminiTargetAlias({
        rawName: params.rawName,
        geminiClassificationMap: params.geminiClassificationMap,
        businessName: params.businessName,
        promptProfile: params.promptProfile,
      });

    if (isValidatedTargetAlias) {
      return { accepted: false, sanitized: label, type: 'target_alias', reason: 'target_alias' };
    }
    if (
      (geminiClassification.type === 'brand' || geminiClassification.type === 'target_alias') &&
      isManifestlyWeakBrandCandidate({
        candidate: geminiCandidate,
        geminiClassification: {
          ...geminiClassification,
          type: 'brand',
        },
        promptProfile: params.promptProfile,
      })
    ) {
      return { accepted: false, sanitized: label, type: 'generic_actor', reason: 'weak_brand' };
    }
    if (geminiClassification.type === 'directory') {
      return { accepted: false, sanitized: label, type: 'directory', reason: 'directory' };
    }
    if (geminiClassification.type === 'generic_actor') {
      return { accepted: false, sanitized: label, type: 'generic_actor', reason: 'generic_actor' };
    }
    if (geminiClassification.type === 'noise') {
      return { accepted: false, sanitized: null, type: 'noise', reason: 'noise' };
    }
    if (
      geminiClassification.type === 'marketplace' &&
      !shouldIncludeCompetitiveEntity('marketplace', params.promptProfile)
    ) {
      return {
        accepted: false,
        sanitized: label,
        type: 'marketplace',
        reason: 'marketplace_excluded',
      };
    }

    return {
      accepted: true,
      sanitized: label,
      type: geminiClassification.type === 'target_alias' ? 'brand' : geminiClassification.type,
      reason: 'ok',
    };
  }

  const fallback = inspectCompetitorDisplayName(params.rawName || '', params.businessName);
  if (
    fallback.accepted &&
    fallback.type === 'marketplace' &&
    !shouldIncludeCompetitiveEntity('marketplace', params.promptProfile)
  ) {
    return {
      accepted: false,
      sanitized: fallback.sanitized,
      type: 'marketplace',
      reason: 'marketplace_excluded',
    };
  }
  return fallback;
}

function summarizeGeminiTriage(entities: GeminiCompetitorClassification[]) {
  return entities.reduce<Record<string, number>>((acc, entity) => {
    acc[entity.type] = (acc[entity.type] || 0) + 1;
    return acc;
  }, {});
}

function calculateUnifiedGlobalScore(pillars: {
  technical: number;
  factualCoverage: number;
  visibility: number;
  positioning: number;
}, mentionRate: number): number {
  const rawScore =
    pillars.technical * 0.15 +
    pillars.factualCoverage * 0.15 +
    pillars.visibility * 0.45 +
    pillars.positioning * 0.25;

  let score = Math.round(rawScore);
  if (mentionRate < 20) {
    score -= 8;
  }

  return Math.max(0, Math.min(100, score));
}

function mapProviderToModel(provider: string): string {
  switch (provider) {
    case 'openai':
      return 'ChatGPT';
    case 'anthropic':
      return 'Claude';
    case 'perplexity':
      return 'Perplexity';
    default:
      return provider;
  }
}

function mergeProviderHealthAnalyses(
  analyses: AnalysisResult[],
  factAnalyses: FactAnalysisResult[]
): AnalysisResult[] {
  if (factAnalyses.length === 0) {
    return analyses;
  }

  const syntheticFactAnalyses: AnalysisResult[] = factAnalyses.map((analysis) => ({
    promptId: '__facts__',
    provider: analysis.provider,
    mentioned: false,
    position: null,
    sentiment: null,
    competitors: [],
    confidence: analysis.confidence,
    providerError: analysis.providerError ?? null,
  }));

  return [...analyses, ...syntheticFactAnalyses];
}

function buildFactSnapshots(factAnalyses: FactAnalysisResult[]) {
  const bestByProvider = new Map<string, FactAnalysisResult>();

  factAnalyses
    .filter((analysis) => !analysis.providerError)
    .forEach((analysis) => {
      const current = bestByProvider.get(analysis.provider);
      if (!current) {
        bestByProvider.set(analysis.provider, analysis);
        return;
      }

      const analysisHasWebPriority = Boolean(analysis.searchEnabled) && !current.searchEnabled;
      const sameSearchTier = Boolean(analysis.searchEnabled) === Boolean(current.searchEnabled);
      const analysisHasMoreFacts = analysis.detectedFieldCount > current.detectedFieldCount;
      const analysisHasHigherConfidence = analysis.confidence > current.confidence;

      if (
        analysisHasWebPriority ||
        (sameSearchTier && analysisHasMoreFacts) ||
        (sameSearchTier &&
          analysis.detectedFieldCount === current.detectedFieldCount &&
          analysisHasHigherConfidence)
      ) {
        bestByProvider.set(analysis.provider, analysis);
      }
    });

  return Array.from(bestByProvider.values())
    .map((analysis) => ({
      provider: analysis.provider,
      model: mapProviderToModel(analysis.provider),
      known: analysis.known,
      detected: analysis.detected,
    }))
    .filter((snapshot) => Object.values(snapshot.detected).some(Boolean));
}

function buildMockSections(prompts: PromptQuery[], businessInfo: any) {
  const queries = prompts.map(p => p.prompt);
  const totalQueries = prompts.length || 18;
  const safeQuery = (index: number) =>
    queries.length > 0 ? queries[index % queries.length] : `Requête ${index + 1}`;

  const address = businessInfo?.address || '12 Rue de la République, 75001 Paris';
  const phone = businessInfo?.phone || '01 23 45 67 89';
  const openingHours = businessInfo?.openingHours || 'Lun-Ven: 9h-18h';

  const competitorNames = [
    'La Taverna',
    'Il Vicoletto',
    'Osteria Nova',
    'Chez Marco',
    'Bistro Verona',
  ];
  const mentionRatios = [0.78, 0.61, 0.5, 0.39, 0.28];
  const mentionCounts = mentionRatios.map((ratio) =>
    Math.max(1, Math.min(totalQueries, Math.round(totalQueries * ratio)))
  );

  const competitors = competitorNames.map((name, index) => {
    const appearsInQueries = buildQueryList(queries, mentionCounts[index], index * 3);
    return {
      name,
      mentionCount: appearsInQueries.length,
      appearsInQueries,
    };
  });

  const youMentionCount = Math.max(1, Math.min(totalQueries, Math.round(totalQueries * 0.22)));

  return {
    factSnapshots: [
      {
        provider: 'openai',
        model: mapProviderToModel('openai'),
        known: true,
        detected: {
          address,
          phone,
          email: businessInfo?.email || 'contact@example.com',
          openingHours,
          city: businessInfo?.address?.includes('Paris') ? 'Paris' : businessInfo?.city || 'Paris',
        },
      },
      {
        provider: 'anthropic',
        model: mapProviderToModel('anthropic'),
        known: true,
        detected: {
          address,
          phone: null,
          email: null,
          openingHours: openingHours,
          city: businessInfo?.city || 'Paris',
        },
      },
      {
        provider: 'perplexity',
        model: mapProviderToModel('perplexity'),
        known: true,
        detected: {
          address: null,
          phone,
          email: null,
          openingHours: null,
          city: businessInfo?.city || 'Paris',
        },
      },
    ],
    competitors,
    benchmark: {
      youMentionCount,
      totalQueries,
    },
  };
}

function buildQueryList(queries: string[], targetCount: number, offset: number): string[] {
  if (queries.length === 0) {
    return [];
  }

  const count = Math.min(targetCount, queries.length);
  const result: string[] = [];
  const seen = new Set<string>();

  for (let i = 0; result.length < count && i < queries.length * 2; i++) {
    const query = queries[(offset + i) % queries.length];
    if (seen.has(query)) continue;
    seen.add(query);
    result.push(query);
  }

  return result;
}

function detectReportLanguage(crawl: any, prompts: PromptQuery[]): 'fr' | 'en' {
  // Product choice: final report wording is always French.
  void crawl;
  void prompts;
  return 'fr';
}

function generateQueryMatrix(analyses: AnalysisResult[], prompts: PromptQuery[]): Array<{
  query: string;
  category: string;
  openai: 'cited_first' | 'cited' | 'not_cited' | 'unavailable';
  anthropic: 'cited_first' | 'cited' | 'not_cited' | 'unavailable';
  perplexity: 'cited_first' | 'cited' | 'not_cited' | 'unavailable';
}> {
  type QueryStatus = 'cited_first' | 'cited' | 'not_cited' | 'unavailable';

  const visiblePrompts = prompts.some((prompt) => prompt.visibility)
    ? prompts.filter((prompt) => prompt.visibility !== 'hidden').slice(0, 5)
    : prompts.slice(0, 5);

  // Keep matrix deterministic from visible prompts even when providers fail.
  return visiblePrompts.map((prompt) => {
    const promptId = prompt.id;
    const promptAnalyses = analyses.filter(a => a.promptId === promptId);
    
    const getStatus = (provider: string): QueryStatus => {
      const analysis = promptAnalyses.find(a => a.provider === provider);
      if (!analysis) return 'not_cited';
      if (analysis.providerError) return 'unavailable';

      const effectiveMentioned = analysis.organicMention ?? analysis.mentioned;
      if (!effectiveMentioned) return 'not_cited';
      if (analysis.position === 1) return 'cited_first';
      return 'cited';
    };
    
    return {
      query: prompt?.prompt || 'Requête inconnue',
      category: prompt?.category || 'info',
      openai: getStatus('openai'),
      anthropic: getStatus('anthropic'),
      perplexity: getStatus('perplexity'),
    };
  });
}

function calculateVisibilityByModel(analyses: AnalysisResult[]) {
  const byProvider = {
    openai: analyses.filter(a => a.provider === 'openai'),
    anthropic: analyses.filter(a => a.provider === 'anthropic'),
    perplexity: analyses.filter(a => a.provider === 'perplexity'),
  };
  
  const result = {
    openai: {
      mentionRate: 0,
      totalQueries: byProvider.openai.length,
    },
    anthropic: {
      mentionRate: 0,
      totalQueries: byProvider.anthropic.length,
    },
    perplexity: {
      mentionRate: 0,
      totalQueries: byProvider.perplexity.length,
    },
  };
  
  // Calculate for each provider
  for (const [provider, providerAnalyses] of Object.entries(byProvider)) {
    const availableAnalyses = providerAnalyses.filter((analysis) => !analysis.providerError);
    const mentioned = availableAnalyses.filter(a => a.organicMention ?? a.mentioned);
    const mentionRate = availableAnalyses.length > 0
      ? (mentioned.length / availableAnalyses.length) * 100
      : 0;
    
    result[provider as keyof typeof result].mentionRate = Math.round(mentionRate);
    result[provider as keyof typeof result].totalQueries = availableAnalyses.length;
  }
  
  return result;
}

function calculateProviderHealth(analyses: AnalysisResult[]) {
  const providerStats = {
    openai: { total: 0, configured: 0, unavailable: 0, unconfigured: 0 },
    anthropic: { total: 0, configured: 0, unavailable: 0, unconfigured: 0 },
    perplexity: { total: 0, configured: 0, unavailable: 0, unconfigured: 0 },
  };

  for (const analysis of analyses) {
    const provider = analysis.provider as keyof typeof providerStats;
    if (!providerStats[provider]) continue;

    providerStats[provider].total += 1;
    if (analysis.providerError && /not configured/i.test(analysis.providerError)) {
      providerStats[provider].unconfigured += 1;
    } else {
      providerStats[provider].configured += 1;
    }
    if (analysis.providerError && !/not configured/i.test(analysis.providerError)) {
      providerStats[provider].unavailable += 1;
    }
  }

  const healthScore = (configured: number, unavailable: number): number => {
    if (configured <= 0) return 0;
    return Math.round(((configured - unavailable) / configured) * 100);
  };

  const openai = healthScore(providerStats.openai.configured, providerStats.openai.unavailable);
  const anthropic = healthScore(providerStats.anthropic.configured, providerStats.anthropic.unavailable);
  const perplexity = healthScore(providerStats.perplexity.configured, providerStats.perplexity.unavailable);
  const totalCalls =
    providerStats.openai.configured +
    providerStats.anthropic.configured +
    providerStats.perplexity.configured;
  const totalUnavailable =
    providerStats.openai.unavailable +
    providerStats.anthropic.unavailable +
    providerStats.perplexity.unavailable;
  const unconfiguredProviders = Object.entries(providerStats)
    .filter(([, stats]) => stats.configured === 0 && stats.unconfigured > 0)
    .map(([provider]) => provider);
  const configuredProviders = Object.values(providerStats).filter((stats) => stats.configured > 0).length;

  return {
    openai,
    anthropic,
    perplexity,
    totalErrorRate: totalCalls > 0 ? Math.round((totalUnavailable / totalCalls) * 100) : 0,
    configuredProviders,
    activeProviders: configuredProviders,
    unconfiguredProviders,
  };
}

function calculateDataQuality(
  crawl: any,
  providerHealth: {
    openai: number;
    anthropic: number;
    perplexity: number;
    totalErrorRate: number;
    configuredProviders: number;
    activeProviders: number;
    unconfiguredProviders: string[];
  },
  analyses: AnalysisResult[]
): 'good' | 'partial' | 'poor' {
  const criticalBusinessFields = [
    crawl?.businessInfo?.name,
    crawl?.businessInfo?.address,
    crawl?.businessInfo?.phone,
  ];
  const missingBusinessFields = criticalBusinessFields.filter(
    (field) => !field || String(field).trim() === '' || String(field).toLowerCase() === 'unknown'
  ).length;

  const availableResponses = analyses.filter((analysis) => !analysis.providerError).length;
  const failedFetchCount = Number(crawl?.crawlStatus?.failedFetchCount || 0);
  const truncatedFetchCount = Number(crawl?.crawlStatus?.truncatedFetchCount || 0);
  const activeProviderScores = [
    providerHealth.unconfiguredProviders.includes('openai') ? null : providerHealth.openai,
    providerHealth.unconfiguredProviders.includes('anthropic') ? null : providerHealth.anthropic,
    providerHealth.unconfiguredProviders.includes('perplexity') ? null : providerHealth.perplexity,
  ].filter((value): value is number => value !== null);
  const providerAverageHealth =
    activeProviderScores.length > 0
      ? Math.round(
          activeProviderScores.reduce((sum, value) => sum + value, 0) / activeProviderScores.length
        )
      : 0;
  const providerMinHealth = activeProviderScores.length > 0 ? Math.min(...activeProviderScores) : 0;
  const crawlLooksEmpty =
    (!crawl?.meta?.title || !crawl?.meta?.description) &&
    (!crawl?.businessInfo?.description || crawl?.businessInfo?.description === 'unknown');

  if (
    availableResponses === 0 ||
    crawlLooksEmpty ||
    failedFetchCount >= 2 ||
    providerHealth.configuredProviders === 0 ||
    providerHealth.totalErrorRate >= 80 ||
    providerAverageHealth < 35 ||
    providerMinHealth < 15
  ) {
    return 'poor';
  }

  if (
    providerHealth.totalErrorRate >= 40 ||
    providerAverageHealth < 70 ||
    missingBusinessFields >= 2 ||
    failedFetchCount >= 1 ||
    truncatedFetchCount >= 1
  ) {
    return 'partial';
  }

  return 'good';
}

function generateTechnicalAudit(crawl: CrawlResult) {
  const robotsTxt = crawl?.robotsTxt ?? {
    exists: false,
    blocksGPTBot: false,
    blocksClaude: false,
    blocksPerplexity: false,
    blocksGoogleExtended: false,
    rawContent: '',
    fetchError: null,
  };
  const structuredData = crawl?.structuredData ?? {
    hasSchemaOrg: false,
    types: [],
    methods: [],
  };
  const sitemap = crawl?.sitemap ?? {
    exists: false,
    url: null,
    pageCount: null,
    discoveredUrls: [],
    source: null,
    probes: [],
  };
  const robotsExists = Boolean(robotsTxt.exists);
  const blockedBots = {
    gptbot: Boolean(robotsTxt.blocksGPTBot),
    claudebot: Boolean(robotsTxt.blocksClaude),
    perplexitybot: Boolean(robotsTxt.blocksPerplexity),
    googleExtended: Boolean(robotsTxt.blocksGoogleExtended),
  };
  const robotsFetchError = robotsTxt.fetchError || null;
  const robotsVerdict: 'authorized' | 'blocked' | 'unknown' =
    robotsFetchError
      ? 'unknown'
      : blockedBots.gptbot || blockedBots.claudebot || blockedBots.perplexitybot || blockedBots.googleExtended
        ? 'blocked'
        : 'authorized';
  const robotsStatus =
    robotsVerdict === 'unknown'
      ? 'unknown'
      : robotsVerdict === 'authorized'
        ? 'good'
        : blockedBots.gptbot || blockedBots.claudebot
          ? 'critical'
          : 'warning';
  
  const blockedBotNames = [
    blockedBots.gptbot ? 'GPTBot' : null,
    blockedBots.claudebot ? 'ClaudeBot' : null,
    blockedBots.perplexitybot ? 'PerplexityBot' : null,
    blockedBots.googleExtended ? 'Google-Extended' : null,
  ].filter(Boolean);
  const robotsDetails = robotsVerdict === 'unknown'
    ? 'Impossible de confirmer les règles robots.txt de façon fiable'
    : blockedBotNames.length === 0
      ? robotsExists
        ? 'Aucun blocage détecté pour les bots IA dans robots.txt'
        : 'Aucun robots.txt détecté, accès autorisé par défaut aux bots IA'
      : `Bots IA bloqués: ${blockedBotNames.join(', ')}`;
  const gptVerdict: 'authorized' | 'blocked' | 'unknown' =
    robotsFetchError ? 'unknown' : blockedBots.gptbot ? 'blocked' : 'authorized';
  const claudeVerdict: 'authorized' | 'blocked' | 'unknown' =
    robotsFetchError ? 'unknown' : blockedBots.claudebot ? 'blocked' : 'authorized';
  const perplexityVerdict: 'authorized' | 'blocked' | 'unknown' =
    robotsFetchError ? 'unknown' : blockedBots.perplexitybot ? 'blocked' : 'authorized';
  const googleExtendedVerdict: 'authorized' | 'blocked' | 'unknown' =
    robotsFetchError ? 'unknown' : blockedBots.googleExtended ? 'blocked' : 'authorized';
  
  const structuredDataVerdict = getStructuredDataVerdict(crawl);
  const structuredDataStatus =
    structuredDataVerdict === 'present'
      ? 'good'
      : structuredDataVerdict === 'unknown'
        ? 'unknown'
        : 'warning';
  const structuredDataMethods = Array.isArray(structuredData.methods)
    ? structuredData.methods
    : [];
  
  const structuredDataDetails = structuredDataVerdict === 'present'
    ? `Données structurées présentes via ${structuredDataMethods.join(', ') || 'schema.org'}: ${structuredData.types.join(', ')}`
    : structuredDataVerdict === 'unknown'
      ? 'Impossible de confirmer la présence de données structurées sur le site'
      : 'Aucune donnée structurée Schema.org détectée';
  
  const sitemapVerdict = getSitemapVerdict(crawl);
  const sitemapStatus =
    sitemapVerdict === 'present'
      ? 'good'
      : sitemapVerdict === 'unknown'
        ? 'unknown'
        : 'warning';
  const sitemapSource = sitemap.source;
  const sitemapDetails = sitemapVerdict === 'present'
    ? `Sitemap trouvé${sitemapSource === 'robots_txt' ? ' via robots.txt' : sitemapSource === 'both' ? ' via robots.txt et chemin standard' : ''} avec ${sitemap.pageCount || 'plusieurs'} pages`
    : sitemapVerdict === 'unknown'
      ? 'Impossible de confirmer la présence d’un sitemap de façon fiable'
      : 'Aucun sitemap.xml trouvé';
  
  return {
    robotsTxt: {
      status: robotsStatus as 'good' | 'warning' | 'critical' | 'unknown',
      details: robotsDetails,
      exists: robotsExists,
      verdict: robotsVerdict,
      bots: {
        gptbot: {
          blocked: blockedBots.gptbot,
          verdict: gptVerdict,
        },
        claudebot: {
          blocked: blockedBots.claudebot,
          verdict: claudeVerdict,
        },
        perplexitybot: {
          blocked: blockedBots.perplexitybot,
          verdict: perplexityVerdict,
        },
        googleExtended: {
          blocked: blockedBots.googleExtended,
          verdict: googleExtendedVerdict,
        },
      },
    },
    structuredData: {
      status: structuredDataStatus as 'good' | 'warning' | 'critical' | 'unknown',
      details: structuredDataDetails,
      verdict: structuredDataVerdict,
      methods: structuredDataMethods,
    },
    sitemap: {
      status: sitemapStatus as 'good' | 'warning' | 'critical' | 'unknown',
      details: sitemapDetails,
      verdict: sitemapVerdict,
      exists: sitemap.exists,
      url: sitemap.url,
      pageCount: sitemap.pageCount,
      source: sitemapSource,
    },
  };
}

function applyCompositeSplitOnQueryGroups(
  groups: Array<{ name: string; analysisKeys: Set<string>; appearsInQueries: Set<string> }>
): void {
  const splitPlan = computeCompositeSplitPlan(groups.map((g) => g.name));
  if (splitPlan.size > 0) {
    const toRemove: number[] = [];
    const toAdd: Array<{ name: string; analysisKeys: Set<string>; appearsInQueries: Set<string> }> = [];

    for (let i = 0; i < groups.length; i++) {
      const parts = splitPlan.get(groups[i].name);
      if (!parts) continue;
      toRemove.push(i);
      for (const part of parts) {
        toAdd.push({
          name: part,
          analysisKeys: new Set(groups[i].analysisKeys),
          appearsInQueries: new Set(groups[i].appearsInQueries),
        });
      }
    }

    for (let i = toRemove.length - 1; i >= 0; i--) {
      groups.splice(toRemove[i], 1);
    }

    for (const entry of toAdd) {
      const existing = groups.find((g) => areLikelySameCompetitorName(g.name, entry.name));
      if (existing) {
        existing.name = pickPreferredCompetitorName(existing.name, entry.name);
        for (const k of entry.analysisKeys) existing.analysisKeys.add(k);
        for (const q of entry.appearsInQueries) existing.appearsInQueries.add(q);
      } else {
        groups.push(entry);
      }
    }
  }

  collapseBareCompetitorAliases(groups, (target, source) => {
    for (const key of source.analysisKeys) target.analysisKeys.add(key);
    for (const query of source.appearsInQueries) target.appearsInQueries.add(query);
  });
}
