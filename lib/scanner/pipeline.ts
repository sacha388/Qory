import { db } from '@/lib/supabase';
import { crawlSite } from '@/lib/scanner/crawl';
import { generatePrompts } from '@/lib/scanner/prompts';
import { resolvePromptBriefWithAI } from '@/lib/scanner/prompt-brief';
import { queryOpenAI, queryOpenAIFacts, queryOpenAIInsight } from '@/lib/ai/openai';
import { queryAnthropic, queryAnthropicFacts } from '@/lib/ai/anthropic';
import { queryPerplexity, queryPerplexityFacts } from '@/lib/ai/perplexity';
import { analyzeFactResponse, analyzeResponse } from '@/lib/scanner/analyzer';
import { buildInsightResults } from '@/lib/scanner/insight-analyzer';
import { calculateScore } from '@/lib/scanner/scorer';
import { generateReport } from '@/lib/scanner/report-generator';
import { getCompetitorSignalPromptIds } from '@/lib/scanner/competitor-signals';
import { detectSector } from '@/lib/sectors';
import { extractWithGPT } from '@/lib/ai/openai';
import { buildBusinessFactsQuery, buildStructuredInsightPrompt } from '@/lib/ai/audit-format';
import type { MarketContext } from '@/lib/ai/audit-format';
import { getAiRuntimeSummary, getProviderRuntimeSource, shouldUseMockData } from '@/lib/ai/mode';
import { logError, logInfo, logWarn } from '@/lib/logger';
import type {
  AIResponse,
  AnalysisResult,
  Audit,
  FactAnalysisResult,
  PromptProfileSnapshot,
  PromptQuery,
  ScanResults,
  ScoreResult,
} from '@/types';

const PROVIDERS_PER_PROMPT = 3;
const FACT_CHECK_PROVIDER_CALLS = 3;
const SCORING_PROMPT_LIMIT = 10;
const INSIGHT_PROMPT_LIMIT = 2;
const INSIGHT_PROVIDERS_PER_PROMPT = 1;
const REAL_PROVIDER_TIMEOUT_MS = 30000;
const MOCK_PROVIDER_TIMEOUT_MS = 6000;
const CRAWL_REUSE_WINDOW_MS = 15 * 60 * 1000;
const WEB_SEARCH_ENABLED_FOR_SCORING_PROMPTS = true;
const PROMPT_QUERY_CONCURRENCY = 5;
const INSIGHT_PROMPT_QUERY_CONCURRENCY = 2;

const PAID_SCAN_STEPS = {
  phase1: 'Analyse de votre empreinte numérique',
  phase2: 'Profilage sectoriel en cours',
  phase3: 'Scan de visibilité multi-IA',
  phase4: 'Détection des acteurs qui captent votre visibilité',
  phase5: 'Génération de votre score préliminaire',
  phase6: 'Consolidation des résultats',
  phase7: 'Nettoyage des données transitoires',
  phase8: 'Structuration de l’analyse',
  phase9: 'Raffinement des signaux',
  phase10: 'Finalisation du rendu',
  phase11: 'Assemblage du rapport',
} as const;

export function isFullAnalysis(results: ScanResults | null | undefined): boolean {
  return results?.analysisMode === 'full';
}

function isReusablePaidCrawl(crawl: ScanResults['crawl'] | null | undefined): boolean {
  if (!crawl?.crawledAt) {
    return false;
  }

  const crawledAtMs = Date.parse(crawl.crawledAt);
  if (!Number.isFinite(crawledAtMs)) {
    return false;
  }

  return Date.now() - crawledAtMs < CRAWL_REUSE_WINDOW_MS;
}

export async function runScanPipelineForAudit(
  audit: Audit
): Promise<'free' | 'full' | 'noop'> {
  if (isFullAnalysis(audit.results as ScanResults | null | undefined)) {
    logInfo('scan_pipeline_skipped', {
      auditId: audit.id,
      phase: 'pipeline_skip',
      reason: 'already_full',
    });
    return 'noop';
  }

  if (audit.paid) {
    await runPaidScanPipeline(audit);
    return 'full';
  }

  await runFreeScanPipeline(audit);
  return 'free';
}

async function runFreeScanPipeline(audit: Audit): Promise<void> {
  const scanStartedAt = Date.now();
  const aiRuntime = getAiRuntimeSummary();

  logInfo('scan_started', {
    auditId: audit.id,
    phase: 'scan_start',
    mode: 'free',
    ...aiRuntime,
  });

  try {
    await db.updateAudit(audit.id, { status: 'scanning' });

    await db.updateScanProgress(audit.id, 12, 'Audit technique initial...');
    const crawlStartedAt = Date.now();
    const crawl = await crawlSite(audit.url, { useLlmExtraction: false });
    const crawlDurationMs = Date.now() - crawlStartedAt;

    await db.updateScanProgress(
      audit.id,
      45,
      'Vérifications structurelles en cours...'
    );

    const defaultBusinessName =
      crawl.businessInfo.name && crawl.businessInfo.name !== 'unknown'
        ? crawl.businessInfo.name
        : deriveBusinessNameFromUrl(audit.url);
    const defaultSector = detectSector(crawl.businessInfo) || 'Service';
    const defaultCity = extractCity(crawl.businessInfo.address) || null;
    const generatedPrompts = generatePrompts({
      crawl,
      fallbackBusinessName: defaultBusinessName,
      fallbackTopic: defaultSector,
      fallbackCity: normalizePromptFallbackCity(defaultCity),
    });
    const prompts = generatedPrompts.prompts;

    const businessName =
      generatedPrompts.profile.siteName ||
      defaultBusinessName ||
      'Cette entreprise';
    const sector = generatedPrompts.profile.mainTopic || defaultSector;
    const city = generatedPrompts.profile.geoScope || null;

    await db.updateAudit(audit.id, {
      business_name: businessName,
      sector,
      city,
    });

    await db.updateScanProgress(
      audit.id,
      72,
      'Consolidation des signaux détectés...'
    );

    const score = calculateFreePreviewScore(crawl);
    const results: ScanResults = {
      analysisMode: 'free',
      prompts,
      promptProfile: generatedPrompts.profile,
      promptBrief: null,
      aiResponses: [],
      insightResponses: [],
      factResponses: [],
      analyses: [],
      insightResults: null,
      factAnalyses: [],
      crawl,
      score,
    };

    await db.updateScanProgress(
      audit.id,
      95,
      'Préparation de votre aperçu...'
    );

    await db.completeAudit(audit.id, results, null, score.globalScore);

    logInfo('scan_completed', {
      auditId: audit.id,
      phase: 'scan_complete',
      mode: 'free',
      duration_ms: Date.now() - scanStartedAt,
      score: score.globalScore,
    });
  } catch (error) {
    logError('scan_pipeline_error', {
      auditId: audit.id,
      phase: 'pipeline',
      mode: 'free',
      duration_ms: Date.now() - scanStartedAt,
      error_code: getErrorCode(error),
      error_message: getErrorMessage(error, 'Pipeline error'),
    });
    throw error;
  }
}

async function runPaidScanPipeline(audit: Audit): Promise<void> {
  const scanStartedAt = Date.now();
  const useMockMode = shouldUseMockData();
  const aiRuntime = getAiRuntimeSummary();
  const providerTimeoutMs = useMockMode ? MOCK_PROVIDER_TIMEOUT_MS : REAL_PROVIDER_TIMEOUT_MS;

  logInfo('scan_started', {
    auditId: audit.id,
    phase: 'scan_start',
    mode: 'full',
    ...aiRuntime,
  });

  let crawlDurationMs = 0;
  let aiResponses: AIResponse[] = [];
  let analyses: AnalysisResult[] = [];
  let insightResponses: AIResponse[] = [];
  let factResponses: AIResponse[] = [];
  let insightResults: ScanResults['insightResults'] = null;
  let factAnalyses: FactAnalysisResult[] = [];

  try {
    await db.updateAudit(audit.id, { status: 'scanning' });

    await db.updateScanProgress(
      audit.id,
      8,
      PAID_SCAN_STEPS.phase1
    );
    const previousResults = audit.results as ScanResults | null | undefined;
    let crawl = previousResults?.crawl;

    const crawlHasStoredFavicon = Boolean(crawl?.favicon?.dataUrl || crawl?.favicon?.url);
    const crawlIsFresh = isReusablePaidCrawl(crawl);

    if (!crawl || !crawlHasStoredFavicon || !crawlIsFresh) {
      const crawlStartedAt = Date.now();
      crawl = await crawlSite(audit.url, { useLlmExtraction: true });
      crawlDurationMs = Date.now() - crawlStartedAt;
    } else {
      crawlDurationMs = 0;
    }

    logInfo('scan_phase_completed', {
      auditId: audit.id,
      phase: 'crawl',
      mode: 'full',
      duration_ms: crawlDurationMs,
    });

    await db.updateScanProgress(
      audit.id,
      16,
      PAID_SCAN_STEPS.phase2
    );

    const scanContext = audit.scan_context || null;
    let businessName =
      crawl.businessInfo.name && crawl.businessInfo.name !== 'unknown'
        ? crawl.businessInfo.name
        : audit.business_name || deriveBusinessNameFromUrl(audit.url);
    let sector = scanContext ? audit.sector || null : detectSector(crawl.businessInfo) || audit.sector;
    let city = scanContext
      ? scanContext.city || audit.city || null
      : extractCity(crawl.businessInfo.address) || audit.city || null;

    if (!scanContext && (!sector || !city)) {
      const sectorPromise = !sector
        ? extractWithGPT(`Quel est le secteur d'activité de cette entreprise ? Réponds en un seul mot (ex: Restaurant, Hôtel, Dentiste, etc.)

Nom: ${businessName}
Description: ${crawl.businessInfo.description || 'N/A'}
Services: ${crawl.businessInfo.services.join(', ') || 'N/A'}`, undefined, { timeoutMs: providerTimeoutMs })
        : Promise.resolve('');

      const cityPromise = !city
        ? extractWithGPT(`Quelle est la ville de cette entreprise ? Réponds uniquement par le nom de la ville.

Adresse: ${crawl.businessInfo.address || 'N/A'}`, undefined, { timeoutMs: providerTimeoutMs })
        : Promise.resolve('');

      const [rawSector, rawCity] = await Promise.all([sectorPromise, cityPromise]);
      if (!sector) {
        sector = rawSector.trim() || 'Service';
      }
      if (!city) {
        city = rawCity.trim() || null;
      }
    }

    city = normalizePromptFallbackCity(city);

    await db.updateAudit(audit.id, {
      business_name: businessName,
      sector,
      city,
    });

    await db.updateScanProgress(
      audit.id,
      24,
      PAID_SCAN_STEPS.phase3
    );
    const promptBriefResolution = scanContext
      ? { brief: null, repaired: false, validationIssues: [] }
      : await resolvePromptBriefWithAI({
          crawl,
          fallbackBusinessName: businessName,
          fallbackTopic: sector,
          fallbackCity: city,
        });
    const generatedPrompts = generatePrompts({
      crawl,
      fallbackBusinessName: businessName,
      fallbackTopic: sector,
      fallbackCity: city,
      brief: promptBriefResolution.brief,
      scanContext,
    });
    businessName =
      generatedPrompts.profile.siteName ||
      businessName ||
      deriveBusinessNameFromUrl(audit.url) ||
      'Cette entreprise';
    sector = scanContext
      ? audit.sector || sector || generatedPrompts.profile.mainTopic || 'Service'
      : generatedPrompts.profile.mainTopic || sector || 'Service';
    city = scanContext
      ? scanContext.city || city || null
      : generatedPrompts.profile.geoScope || city || null;

    await db.updateAudit(audit.id, {
      business_name: businessName,
      sector,
      city,
    });

    const scoringPrompts = generatedPrompts.prompts
      .filter((prompt) => prompt.analysisTrack !== 'insight')
      .slice(0, SCORING_PROMPT_LIMIT);
    const insightPrompts = generatedPrompts.prompts
      .filter((prompt) => prompt.analysisTrack === 'insight')
      .slice(0, INSIGHT_PROMPT_LIMIT);

    logInfo('paid_prompt_selection', {
      auditId: audit.id,
      phase: 'prompt_selection',
      site_name: businessName,
      discovery_mode: generatedPrompts.profile.discoveryMode,
      site_type: generatedPrompts.profile.siteType,
      site_family: generatedPrompts.profile.siteFamily,
      domain_vertical: generatedPrompts.profile.domainVertical,
      domain_vertical_confidence: generatedPrompts.profile.domainVerticalConfidence,
      domain_vertical_source: generatedPrompts.profile.domainVerticalSource,
      offer_family: generatedPrompts.profile.offerFamily,
      use_case: generatedPrompts.profile.useCase,
      local_actor_singular: generatedPrompts.profile.localActorSingular,
      local_actor_plural: generatedPrompts.profile.localActorPlural,
      target_audience: generatedPrompts.profile.targetAudience,
      capabilities: generatedPrompts.profile.capabilities,
      site_type_confidence: generatedPrompts.profile.confidenceScore,
      site_type_runner_up: generatedPrompts.profile.runnerUpType,
      prompt_generation_level: generatedPrompts.profile.promptGenerationLevel,
      prompt_generation_reason: generatedPrompts.profile.promptGenerationReason,
      crawl_transport_score: generatedPrompts.profile.crawlTransportScore,
      semantic_coverage_score: generatedPrompts.profile.semanticCoverageScore,
      semantic_confidence_score: generatedPrompts.profile.semanticConfidenceScore,
      main_topic: generatedPrompts.profile.mainTopic,
      main_topic_confidence: generatedPrompts.profile.mainTopicConfidence,
      main_topic_source: generatedPrompts.profile.mainTopicSource,
      main_topic_safe: generatedPrompts.profile.mainTopicSafe,
      main_offer: generatedPrompts.profile.mainOffer,
      main_offer_confidence: generatedPrompts.profile.mainOfferConfidence,
      main_offer_source: generatedPrompts.profile.mainOfferSource,
      main_offer_safe: generatedPrompts.profile.mainOfferSafe,
      safe_intent_bucket: generatedPrompts.profile.safeIntentBucket,
      safe_intent_source: generatedPrompts.profile.safeIntentSource,
      prompt_brief_used: Boolean(promptBriefResolution.brief),
      prompt_brief_repaired: promptBriefResolution.repaired,
      prompt_brief_validation_issue_count: promptBriefResolution.validationIssues.length,
      prompt_brief_confidence: promptBriefResolution.brief?.confidence ?? null,
      prompt_brief_level_hint: promptBriefResolution.brief?.promptGenerationLevelHint ?? null,
      generated_prompt_count: generatedPrompts.prompts.length,
      selected_prompt_count: scoringPrompts.length + insightPrompts.length,
      selected_scoring_prompt_count: scoringPrompts.length,
      selected_insight_prompt_count: insightPrompts.length,
      provider_calls_planned:
        scoringPrompts.length * PROVIDERS_PER_PROMPT +
        insightPrompts.length * INSIGHT_PROVIDERS_PER_PROMPT +
        FACT_CHECK_PROVIDER_CALLS,
    });

    const marketContext: MarketContext = {
      sector,
      siteType: generatedPrompts.profile.siteType,
      mainOffer: generatedPrompts.profile.mainOffer,
      domainVertical: generatedPrompts.profile.domainVertical,
      geoScope: city,
    };

    await db.updateScanProgress(
      audit.id,
      32,
      PAID_SCAN_STEPS.phase4
    );

    let completedQueries = 0;
    const totalQueries = Math.max(
      1,
      scoringPrompts.length * PROVIDERS_PER_PROMPT +
        insightPrompts.length * INSIGHT_PROVIDERS_PER_PROMPT +
        FACT_CHECK_PROVIDER_CALLS
    );

    if (scoringPrompts.length > 0 || insightPrompts.length > 0) {
      const updateQueryProgress = async (increment: number) => {
        completedQueries += increment;
        const progress = Math.min(80, 40 + Math.floor((completedQueries / totalQueries) * 40));
        await db.updateScanProgress(audit.id, progress, getPaidScanStepFromProgress(progress));
      };

      const [responsesByPrompt, insightResponseBundle] = await Promise.all([
        scoringPrompts.length > 0
          ? mapWithConcurrency(
              scoringPrompts,
              PROMPT_QUERY_CONCURRENCY,
              async (prompt) => {
                const responses = await queryPromptAcrossProviders({
                  auditId: audit.id,
                  prompt: prompt.prompt,
                  businessName,
                  marketContext,
                  timeoutMs: providerTimeoutMs,
                  searchEnabled: WEB_SEARCH_ENABLED_FOR_SCORING_PROMPTS,
                });

                await updateQueryProgress(PROVIDERS_PER_PROMPT);
                return responses;
              }
            )
          : Promise.resolve([] as Array<[AIResponse, AIResponse, AIResponse]>),
        insightPrompts.length > 0
          ? queryInsightPrompts({
              auditId: audit.id,
              prompts: insightPrompts,
              businessName,
              promptProfile: generatedPrompts.profile,
              marketContext,
              crawl,
              timeoutMs: providerTimeoutMs,
              onComplete: async () => {
                await updateQueryProgress(INSIGHT_PROVIDERS_PER_PROMPT);
              },
            })
          : Promise.resolve({
              allResponses: [] as AIResponse[],
              strengthsResponse: null,
              valueResponse: null,
            }),
      ]);

      aiResponses = responsesByPrompt.flat();
      insightResponses = insightResponseBundle.allResponses;
      insightResults = buildInsightResults({
        strengthsResponse: insightResponseBundle.strengthsResponse,
        valueResponse: insightResponseBundle.valueResponse,
      });
      logInfo('scan_insight_overview', {
        auditId: audit.id,
        phase: 'analysis_debug',
        response_count: insightResponses.length,
        strengths_prompt_available: Boolean(insightResults?.strengthsPrompt),
        value_prompt_available: Boolean(insightResults?.valuePrompt),
        strengths_count: insightResults?.strengthsPrompt?.strengths.length ?? 0,
        weaknesses_count: insightResults?.strengthsPrompt?.weaknesses.length ?? 0,
        alternative_count: insightResults?.strengthsPrompt?.genericAlternatives.length ?? 0,
        comparison_axes_count: insightResults?.valuePrompt?.comparisonAxes.length ?? 0,
        price_signal_present: Boolean(insightResults?.valuePrompt?.pricePositioning),
        trust_signal_present: Boolean(insightResults?.valuePrompt?.trustLevel),
      });
      logInfo('scan_ai_response_overview', {
        auditId: audit.id,
        phase: 'provider_batch_debug',
        scoring_prompt_count: scoringPrompts.length,
        insight_prompt_count: insightPrompts.length,
        total_prompt_count: scoringPrompts.length + insightPrompts.length,
        total_ai_responses: aiResponses.length + insightResponses.length,
        provider_summary: summarizeProviderResponses([...aiResponses, ...insightResponses]),
      });
    } else {
      await db.updateScanProgress(audit.id, 72, PAID_SCAN_STEPS.phase8);
    }

    factResponses = await queryFactCheckAcrossProviders({
      auditId: audit.id,
      businessName,
      timeoutMs: providerTimeoutMs,
    });
    logInfo('scan_fact_response_overview', {
      auditId: audit.id,
      phase: 'provider_batch_debug',
      total_fact_responses: factResponses.length,
      provider_summary: summarizeProviderResponses(factResponses),
    });

    completedQueries += FACT_CHECK_PROVIDER_CALLS;
    const factualProgress = Math.min(
      80,
      40 + Math.floor((completedQueries / totalQueries) * 40)
    );
    await db.updateScanProgress(
      audit.id,
      factualProgress,
      getPaidScanStepFromProgress(factualProgress)
    );

    await db.updateScanProgress(audit.id, 90, PAID_SCAN_STEPS.phase10);
    const promptByText = new Map(scoringPrompts.map((prompt) => [prompt.prompt, prompt]));
    const analysisEntries = await Promise.all(
      aiResponses.map(async (response) => {
        const prompt = promptByText.get(response.prompt);
        if (!prompt) return null;

        return analyzeResponse({
          auditId: audit.id,
          response,
          businessName,
          businessInfo: crawl.businessInfo,
          prompt,
        });
      })
    );
    analyses = analysisEntries.filter((entry): entry is AnalysisResult => entry !== null);
    const factualAnalysisEntries = await Promise.all(
      factResponses.map((response) =>
        analyzeFactResponse({
          auditId: audit.id,
          response,
          businessInfo: crawl.businessInfo,
          canonicalFacts: crawl.canonicalFacts,
        })
      )
    );
    factAnalyses = factualAnalysisEntries.filter(
      (entry): entry is FactAnalysisResult => entry !== null
    );
    logInfo('scan_analysis_overview', {
      auditId: audit.id,
      phase: 'analysis_debug',
      analysis_count: analyses.length,
      fact_analysis_count: factAnalyses.length,
      provider_summary: summarizeAnalyses(analyses),
      fact_provider_summary: summarizeFactAnalyses(factAnalyses),
    });

    const competitorPromptIds = getCompetitorSignalPromptIds(scoringPrompts);
    const promptById = new Map(scoringPrompts.map((prompt) => [prompt.id, prompt]));
    const competitorDiagnostics = analyses
      .filter((analysis) => competitorPromptIds.has(analysis.promptId))
      .map((analysis) => {
        const prompt = promptById.get(analysis.promptId);
        return {
          prompt_id: analysis.promptId,
          prompt: prompt?.prompt ?? analysis.promptId,
          provider: analysis.provider,
          brand_anchored: prompt?.brandAnchored ?? false,
          visibility: prompt?.visibility ?? null,
          benchmark_group: prompt?.benchmarkGroup ?? null,
          mentioned: analysis.mentioned,
          position: analysis.position,
          explicit_competitors: analysis.explicitCompetitors ?? [],
          inferred_competitors: analysis.inferredCompetitors ?? [],
          final_competitors: analysis.competitors,
        };
      });

    if (competitorDiagnostics.length > 0) {
      logInfo('competitor_prompt_diagnostics', {
        auditId: audit.id,
        phase: 'analysis_debug',
        prompt_count: competitorDiagnostics.length,
        diagnostics: competitorDiagnostics,
      });
    }

    await db.updateScanProgress(
      audit.id,
      96,
      PAID_SCAN_STEPS.phase11
    );

    const score = calculateScore(analyses, crawl, generatedPrompts.prompts, factAnalyses);
    const results: ScanResults = {
      analysisMode: 'full',
      prompts: generatedPrompts.prompts,
      promptProfile: generatedPrompts.profile,
      promptBrief: promptBriefResolution.brief,
      aiResponses,
      insightResponses,
      factResponses,
      analyses,
      insightResults,
      factAnalyses,
      crawl,
      score,
    };

    const report = await generateReport(audit.id, results);
    await db.completeAudit(audit.id, results, report, score.globalScore);

    logInfo('scan_completed', {
      auditId: audit.id,
      phase: 'scan_complete',
      mode: 'full',
      duration_ms: Date.now() - scanStartedAt,
      provider_error_rate: report.providerHealth.totalErrorRate,
      query_matrix_count: report.queryMatrix.length,
      fact_snapshot_count: report.factSnapshots.length,
    });
  } catch (error) {
    logError('scan_pipeline_error', {
      auditId: audit.id,
      phase: 'pipeline',
      mode: 'full',
      duration_ms: Date.now() - scanStartedAt,
      error_code: getErrorCode(error),
      error_message: getErrorMessage(error, 'Pipeline error'),
    });
    throw error;
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  };

  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

function deriveBusinessNameFromUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;

  try {
    const { hostname } = new URL(rawUrl);
    const parts = hostname.toLowerCase().split('.').filter(Boolean);
    if (parts.length === 0) return null;

    const commonSubdomains = new Set(['www', 'app', 'go', 'm', 'fr', 'en']);
    const effectiveParts = parts.filter(
      (part, index) => !(index < parts.length - 2 && commonSubdomains.has(part))
    );

    let domainLabel =
      effectiveParts.length >= 2
        ? effectiveParts[effectiveParts.length - 2]
        : effectiveParts[0];

    if (
      effectiveParts.length >= 3 &&
      effectiveParts[effectiveParts.length - 1].length === 2 &&
      ['co', 'com', 'org', 'net', 'gov', 'ac'].includes(
        effectiveParts[effectiveParts.length - 2]
      )
    ) {
      domainLabel = effectiveParts[effectiveParts.length - 3];
    }

    const formatted = domainLabel
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
      .trim();

    return formatted || null;
  } catch {
    return null;
  }
}

type QueryProvidersParams = {
  auditId: string;
  prompt: string;
  businessName: string;
  marketContext?: MarketContext;
  timeoutMs: number;
  searchEnabled?: boolean;
};

type QueryFactProvidersParams = {
  auditId: string;
  businessName: string;
  timeoutMs: number;
};

type QueryInsightPromptsParams = {
  auditId: string;
  prompts: PromptQuery[];
  businessName: string;
  promptProfile?: PromptProfileSnapshot;
  marketContext?: MarketContext;
  crawl: ScanResults['crawl'];
  timeoutMs: number;
  onComplete?: () => Promise<void>;
};

async function queryPromptAcrossProviders(
  params: QueryProvidersParams
): Promise<[AIResponse, AIResponse, AIResponse]> {
  const { auditId, prompt, businessName, marketContext, timeoutMs, searchEnabled } = params;

  const openaiPromise = queryProviderWithTelemetry({
    auditId,
    provider: 'openai',
    model: searchEnabled ? 'gpt-4o-mini-search-preview' : 'gpt-5.4-mini',
    prompt,
    timeoutMs,
    searchEnabled,
    query: () => queryOpenAI(prompt, businessName, marketContext, { searchEnabled, timeoutMs }),
  });

  const anthropicPromise = queryProviderWithTelemetry({
    auditId,
    provider: 'anthropic',
    model: searchEnabled ? 'claude-sonnet-4-20250514' : 'claude-haiku-4-5',
    prompt,
    timeoutMs,
    searchEnabled,
    query: () => queryAnthropic(prompt, businessName, marketContext, { searchEnabled, timeoutMs }),
  });

  const perplexityPromise = queryProviderWithTelemetry({
    auditId,
    provider: 'perplexity',
    model: 'sonar',
    prompt,
    timeoutMs,
    searchEnabled: true,
    query: () => queryPerplexity(prompt, businessName, marketContext, { timeoutMs }),
  });

  return Promise.all([openaiPromise, anthropicPromise, perplexityPromise]);
}

async function queryInsightPrompts(
  params: QueryInsightPromptsParams
): Promise<{
  allResponses: AIResponse[];
  strengthsResponse: AIResponse | null;
  valueResponse: AIResponse | null;
}> {
  const { auditId, prompts, businessName, promptProfile, marketContext, crawl, timeoutMs, onComplete } = params;
  const [strengthsPrompt, valuePrompt] = prompts;

  const promptDescriptors = [
    strengthsPrompt ? { prompt: strengthsPrompt, kind: 'strengths' as const } : null,
    valuePrompt ? { prompt: valuePrompt, kind: 'value' as const } : null,
  ].filter(Boolean) as Array<{ prompt: PromptQuery; kind: 'strengths' | 'value' }>;

  const responses = await mapWithConcurrency(
    promptDescriptors,
    INSIGHT_PROMPT_QUERY_CONCURRENCY,
    async ({ prompt, kind }) => {
      const structuredPrompt = buildStructuredInsightPrompt({
        kind,
        userPrompt: prompt.prompt,
        businessName,
        marketContext,
        targetAudience: promptProfile?.targetAudience || null,
        businessDescription: crawl.businessInfo.description,
        visibleServices: crawl.businessInfo.services,
        trustPages: crawl.previewSignals?.trustPages
          ? {
              about: crawl.previewSignals.trustPages.about,
              contact: crawl.previewSignals.trustPages.contact,
              faq: crawl.previewSignals.trustPages.faq,
              tarifs: crawl.previewSignals.trustPages.tarifs,
            }
          : null,
        language: promptProfile?.language || 'fr',
      });
      const response = await queryProviderWithTelemetry({
        auditId,
        provider: 'openai',
        model: 'gpt-4o-mini-search-preview',
        prompt: prompt.prompt,
        timeoutMs,
        searchEnabled: true,
        query: () => queryOpenAIInsight(prompt.prompt, structuredPrompt, kind, businessName),
      });

      if (onComplete) {
        await onComplete();
      }

      return { kind, response };
    }
  );

  return {
    allResponses: responses.map((entry) => entry.response),
    strengthsResponse: responses.find((entry) => entry.kind === 'strengths')?.response || null,
    valueResponse: responses.find((entry) => entry.kind === 'value')?.response || null,
  };
}

async function queryFactCheckAcrossProviders(
  params: QueryFactProvidersParams
): Promise<[AIResponse, AIResponse, AIResponse]> {
  const { auditId, businessName, timeoutMs } = params;
  const prompt = buildBusinessFactsQuery(businessName);

  const openaiWebPromise = queryProviderWithTelemetry({
    auditId,
    provider: 'openai',
    model: 'gpt-4o-mini-search-preview',
    prompt,
    timeoutMs,
    searchEnabled: true,
    query: () => queryOpenAIFacts(businessName, { searchEnabled: true, timeoutMs }),
  });

  const anthropicWebPromise = queryProviderWithTelemetry({
    auditId,
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    prompt,
    timeoutMs,
    searchEnabled: true,
    query: () => queryAnthropicFacts(businessName, { searchEnabled: true, timeoutMs }),
  });

  const perplexityPromise = queryProviderWithTelemetry({
    auditId,
    provider: 'perplexity',
    model: 'sonar',
    prompt,
    timeoutMs,
    searchEnabled: true,
    query: () => queryPerplexityFacts(businessName, { timeoutMs }),
  });

  return Promise.all([
    openaiWebPromise,
    anthropicWebPromise,
    perplexityPromise,
  ]);
}

type QueryProviderParams = {
  auditId: string;
  provider: AIResponse['provider'];
  model: string;
  prompt: string;
  timeoutMs: number;
  searchEnabled?: boolean;
  query: () => Promise<AIResponse>;
};

async function queryProviderWithTelemetry(params: QueryProviderParams): Promise<AIResponse> {
  const { auditId, provider, model, prompt, timeoutMs, query, searchEnabled } = params;
  const startedAt = Date.now();

  const response =
    provider === 'anthropic'
      ? await query().catch((error: unknown) =>
          buildProviderErrorResponse(
            provider,
            model,
            prompt,
            getErrorMessage(error, `${provider} API error`),
            searchEnabled
          )
        )
      : await withTimeout(
          query().catch((error: unknown) =>
            buildProviderErrorResponse(
              provider,
              model,
              prompt,
              getErrorMessage(error, `${provider} API error`),
              searchEnabled
            )
          ),
          timeoutMs,
          () =>
            buildProviderErrorResponse(
              provider,
              model,
              prompt,
              `${provider} timeout after ${timeoutMs}ms`,
              searchEnabled
            )
        );

  const baseFields = {
    auditId,
    provider,
    provider_source: getProviderRuntimeSource(provider),
    phase: 'provider_query',
    duration_ms: Date.now() - startedAt,
    search_enabled: Boolean(searchEnabled ?? response.searchEnabled),
    provider_status: response.providerStatus ?? (response.error ? 'error' : 'success'),
  };

  if (response.error) {
    logWarn('provider_query_failed', {
      ...baseFields,
      error_code: 'provider_error',
      error_message: response.error,
      response_length: response.response.length,
    });
  } else {
    logInfo('provider_query_succeeded', {
      ...baseFields,
      response_length: response.response.length,
      response_preview: buildTelemetryPreview(response.response),
    });
  }

  return response;
}

function buildTelemetryPreview(value: string, maxLength = 180): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function summarizeProviderResponses(responses: AIResponse[]) {
  const providers = ['openai', 'anthropic', 'perplexity'] as const;

  return providers.map((provider) => {
    const items = responses.filter((response) => response.provider === provider);
    const successCount = items.filter((response) => !response.error && response.response).length;
    const errorCount = items.length - successCount;
    const lengths = items
      .map((response) => response.response.length)
      .filter((length) => Number.isFinite(length) && length > 0);
    const averageLength =
      lengths.length > 0
        ? Math.round(lengths.reduce((sum, value) => sum + value, 0) / lengths.length)
        : 0;

    return {
      provider,
      total: items.length,
      success_count: successCount,
      error_count: errorCount,
      unconfigured_count: items.filter((response) => response.providerStatus === 'unconfigured').length,
      search_enabled_count: items.filter((response) => response.searchEnabled).length,
      average_response_length: averageLength,
      max_response_length: lengths.length > 0 ? Math.max(...lengths) : 0,
      min_response_length: lengths.length > 0 ? Math.min(...lengths) : 0,
      error_messages: Array.from(new Set(items.map((response) => response.error).filter(Boolean))).slice(0, 5),
    };
  });
}

function summarizeAnalyses(analyses: AnalysisResult[]) {
  const providers = ['openai', 'anthropic', 'perplexity'] as const;

  return providers.map((provider) => {
    const items = analyses.filter((analysis) => analysis.provider === provider);
    return {
      provider,
      total: items.length,
      mentioned_count: items.filter((analysis) => analysis.mentioned).length,
      organic_mention_count: items.filter((analysis) => analysis.organicMention).length,
      competitor_signal_count: items.filter((analysis) => (analysis.competitors?.length || 0) > 0).length,
      aspect_signal_count: items.filter((analysis) => (analysis.aspectObservations?.length || 0) > 0).length,
      comparison_signal_count: items.filter((analysis) => (analysis.comparisonObservations?.length || 0) > 0).length,
      price_signal_count: items.filter((analysis) => Boolean(analysis.priceObservation)).length,
      parse_like_count: items.filter((analysis) =>
        Boolean(
          analysis.answerShort ||
          analysis.excerpt ||
          analysis.citation ||
          (analysis.topEntities?.length || 0) > 0
        )
      ).length,
    };
  });
}

function summarizeFactAnalyses(factAnalyses: FactAnalysisResult[]) {
  const providers = ['openai', 'anthropic', 'perplexity'] as const;

  return providers.map((provider) => {
    const items = factAnalyses.filter((analysis) => analysis.provider === provider);
    return {
      provider,
      total: items.length,
      provider_error_count: items.filter((analysis) => Boolean(analysis.providerError)).length,
      search_enabled_count: items.filter((analysis) => analysis.searchEnabled).length,
      memory_known_count: items.filter((analysis) => analysis.memoryKnown).length,
      web_known_count: items.filter((analysis) => analysis.searchEnabled && analysis.known).length,
      detected_field_count: items.reduce((sum, analysis) => sum + analysis.detectedFieldCount, 0),
      possible_field_count: items.reduce((sum, analysis) => sum + analysis.possibleFieldCount, 0),
    };
  });
}

function calculateFreePreviewScore(crawl: ScanResults['crawl']): ScoreResult {
  const preview = crawl.previewSignals;
  const homepage = preview?.pages[0];
  const spaLikely = Boolean(preview?.spaLikely);
  const trustPages = preview?.trustPages ?? {
    about: false,
    contact: false,
    faq: false,
    tarifs: false,
    confidentialite: false,
    cgu: false,
  };

  const technicalChecks = [
    crawl.performance.isHttps,
    crawl.robotsTxt.exists,
    crawl.sitemap.exists,
    crawl.meta.hasCanonical || Boolean(homepage?.canonical),
    Boolean(homepage?.h1) || (spaLikely && Boolean(homepage?.hasOpenGraph)),
    Boolean(crawl.meta.title),
    Boolean(crawl.meta.description),
    crawl.performance.hasMobileViewport,
    crawl.structuredData.hasSchemaOrg,
  ];
  const technicalScore = Math.round(
    (technicalChecks.filter(Boolean).length / technicalChecks.length) * 100
  );

  const accuracyChecks = [
    Boolean(preview?.brandDetected),
    Boolean(preview?.cityDetected),
    Boolean(preview?.sectorDetected),
    Boolean(preview?.phone),
    Boolean(preview?.email),
    Boolean(preview?.address),
    (preview?.coherenceScore ?? 0) >= 70,
  ];
  const accuracyScore = Math.round(
    (accuracyChecks.filter(Boolean).length / accuracyChecks.length) * 100
  );

  const trustCoverage = Object.values(trustPages).filter(Boolean).length;
  const hasKeyPages = trustPages.about && trustPages.contact && (trustPages.faq || trustPages.tarifs);
  const visibilityChecks = [
    preview?.structureReadable ?? false,
    preview?.titlesClear ?? Boolean(crawl.meta.title),
    preview?.descriptiveContent ?? Boolean(crawl.meta.description),
    hasKeyPages,
    preview?.minimalInternalLinking ?? false,
    preview?.entitiesUnderstandable ?? crawl.structuredData.hasSchemaOrg,
  ];
  const visibilityScore = Math.round(
    (visibilityChecks.filter(Boolean).length / visibilityChecks.length) * 100
  );

  const positioningChecks = [
    Boolean(preview?.sectorDetected) || spaLikely,
    Boolean(preview?.cityDetected),
    Boolean(preview?.offerIdentifiable),
    (preview?.replaceabilityRisk ?? 'high') !== 'high',
    trustCoverage >= 3 || spaLikely,
  ];
  let positioningScore = Math.round(
    (positioningChecks.filter(Boolean).length / positioningChecks.length) * 100
  );

  if ((preview?.replaceabilityRisk ?? 'high') === 'high') {
    positioningScore = Math.max(0, positioningScore - 12);
  }
  if (trustCoverage <= 1 && !spaLikely) {
    positioningScore = Math.max(0, positioningScore - 8);
  }

  const globalScoreRaw = clamp(
    Math.round(
      technicalScore * 0.3 +
      accuracyScore * 0.25 +
      visibilityScore * 0.25 +
      positioningScore * 0.2
    ),
    5,
    98
  );
  const globalScore = clamp(globalScoreRaw - 10, 0, 98);

  const technicalDetails =
    technicalScore >= 80
      ? 'Base technique saine pour l’indexation IA (crawl, balises et structure).'
      : 'Base technique à renforcer (crawl, balises ou structure incomplètes).';
  const factualCoverageDetails =
    accuracyScore >= 70
      ? 'Couverture factuelle site globalement bonne sur les pages analysées.'
      : 'Couverture factuelle site encore partielle sur les pages analysées.';
  const visibilityDetails =
    visibilityScore >= 70
      ? 'Signaux de lisibilité web favorables à une bonne découvrabilité IA.'
      : 'Lisibilité web encore limitée pour une bonne reprise par les moteurs IA.';
  const positioningDetails =
    positioningScore >= 70
      ? 'Positionnement perçu comme distinct avec un risque concurrentiel modéré.'
      : 'Positionnement encore fragile, avec un risque concurrentiel élevé.';

  return {
    globalScore,
    visibility: {
      score: visibilityScore,
      details: visibilityDetails,
    },
    factualCoverage: {
      score: accuracyScore,
      details: factualCoverageDetails,
    },
    positioning: {
      score: positioningScore,
      details: positioningDetails,
    },
    sentiment: {
      score: 50,
      details: 'Sentiment non évalué avant l’analyse premium multi-modèles.',
    },
    technical: {
      score: technicalScore,
      details: technicalDetails,
    },
    mentionRate: 0,
    topCompetitors: [],
  };
}

function buildProviderErrorResponse(
  provider: AIResponse['provider'],
  model: string,
  prompt: string,
  message: string,
  searchEnabled?: boolean
): AIResponse {
  const normalizedMessage = message.toLowerCase();
  return {
    model,
    provider,
    prompt,
    response: '',
    error: message,
    providerStatus: normalizedMessage.includes('not configured') ? 'unconfigured' : 'error',
    searchEnabled: Boolean(searchEnabled),
  };
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout: () => T
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => resolve(onTimeout()), timeoutMs);
  });

  const result = await Promise.race([promise, timeoutPromise]);

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  return result;
}

function extractCity(address: string | null): string | null {
  if (!address) return null;

  const match = address.match(/\d{5}\s+([A-Za-zÀ-ÿ\s-]+)/);
  if (match && match[1]) {
    return match[1].trim();
  }

  const parts = address.split(',');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }

  return null;
}

function normalizePromptFallbackCity(city: string | null | undefined): string | null {
  if (!city) return null;
  const trimmed = city.trim();
  if (!trimmed) return null;

  const normalized = trimmed.toLowerCase();
  if (normalized === 'france' || normalized === 'fr' || normalized === 'global') {
    return null;
  }

  return trimmed;
}

function getPaidScanStepFromProgress(progress: number): string {
  if (progress >= 80) return PAID_SCAN_STEPS.phase9;
  if (progress >= 70) return PAID_SCAN_STEPS.phase8;
  if (progress >= 60) return PAID_SCAN_STEPS.phase7;
  if (progress >= 50) return PAID_SCAN_STEPS.phase6;
  return PAID_SCAN_STEPS.phase5;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function getErrorCode(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const value = (error as { code?: unknown }).code;
    if (typeof value === 'string') return value;
  }
  return 'unknown_error';
}
