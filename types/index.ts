// Core Audit Types
export type AuditRetentionState = 'active' | 'anonymized';
export type AiProviderId = 'openai' | 'anthropic' | 'perplexity';

export type PaidScanBusinessType =
  | 'commerce_restauration'
  | 'prestataire_local'
  | 'agence_studio'
  | 'saas_application'
  | 'ia_assistants'
  | 'plateforme_annuaire'
  | 'ecommerce'
  | 'etablissement_institution';

export type PaidScanPromptFamily =
  | 'local_service'
  | 'agency_service'
  | 'software_tool'
  | 'ai_tool'
  | 'platform'
  | 'ecommerce_shop'
  | 'institutional_actor';

export type PaidScanGeoMode = 'required' | 'optional' | 'forbidden';

export interface AuditUserContext {
  type: PaidScanBusinessType;
  activity: string;
  activityDetail?: string | null;
  city: string | null;
}

export interface AuditScanContext {
  type: PaidScanBusinessType;
  activity: string;
  activityDetail?: string | null;
  city: string | null;
  promptFamily: PaidScanPromptFamily;
  geoMode: PaidScanGeoMode;
  discoveryMode: 'local_places' | 'digital_crawl';
  siteTypeHint: PromptProfileSnapshot['siteType'];
  domainVerticalHint: PromptProfileSnapshot['domainVertical'] | null;
  actorSingular: string;
  actorPlural: string;
  providerSelection?: AiProviderId[];
}

export interface Audit {
  id: string;
  created_at: string;
  last_used_at?: string | null;
  retention_applied_at?: string | null;
  retention_state?: AuditRetentionState | null;
  url: string;
  business_name: string | null;
  sector: string | null;
  city: string | null;
  user_context?: AuditUserContext | null;
  scan_context?: AuditScanContext | null;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  scan_progress: number;
  scan_step: string | null;
  score: number | null;
  results: ScanResults | null;
  report: Report | null;
  paid: boolean;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  email: string | null;
  report_sent: boolean;
  crawlStatus?: {
    homepageStatus: number;
    failedFetchCount: number;
    failedUrls: string[];
    homepageFailed?: boolean;
    subpageFailureCount?: number;
    truncatedFetchCount?: number;
    truncatedUrls?: string[];
    crawlFailed?: boolean;
    crawlPartial?: boolean;
  } | null;
}

// Prompt Generation
export interface PromptQuery {
  id: string;
  prompt: string;
  category: 'recommendation' | 'listing' | 'comparison' | 'info' | 'reputation' | 'situation' | 'alternative';
  language: 'fr' | 'en';
  visibility?: 'visible' | 'hidden';
  benchmarkGroup?: 'visibility' | 'competitor';
  brandAnchored?: boolean;
  analysisTrack?: 'scoring' | 'insight';
  affectsVisibilityScore?: boolean;
  affectsCitationMatrix?: boolean;
}

export interface PromptProfileSnapshot {
  discoveryMode: 'local_places' | 'digital_crawl' | 'hybrid_brand';
  siteName: string;
  siteType:
    | 'local_service'
    | 'saas'
    | 'ai_native'
    | 'streaming_entertainment'
    | 'marketplace'
    | 'education_training'
    | 'documentation_knowledge'
    | 'community_forum'
    | 'travel_booking'
    | 'jobs_recruitment'
    | 'public_service_nonprofit'
    | 'ecommerce'
    | 'media'
    | 'portfolio'
    | 'brand_site'
    | 'generic';
  siteFamily:
    | 'software_family'
    | 'content_family'
    | 'commerce_family'
    | 'service_family'
    | 'institutional_family'
    | 'learning_family'
    | 'generic_family';
  domainVertical:
    | 'accounting_finance'
    | 'legal_compliance'
    | 'hr_payroll'
    | 'sales_crm'
    | 'marketing_communication'
    | 'developer_tools'
    | 'it_cyber_data'
    | 'ai_automation'
    | 'ecommerce_retail'
    | 'real_estate'
    | 'healthcare_wellness'
    | 'education_training'
    | 'recruitment_jobs'
    | 'travel_hospitality'
    | 'food_restaurants'
    | 'construction_home_services'
    | 'logistics_mobility'
    | 'public_sector_associations'
    | 'general_business';
  domainVerticalConfidence: number;
  domainVerticalSource: string;
  promptGenerationLevel: 'exact' | 'controlled' | 'family' | 'brand';
  promptGenerationReason: string;
  offerFamily: string;
  useCase: string | null;
  localActorSingular: string | null;
  localActorPlural: string | null;
  targetAudience: string | null;
  capabilities: string[];
  mainTopic: string;
  mainOffer: string;
  mainTopicConfidence: number;
  mainOfferConfidence: number;
  mainTopicSource: string;
  mainOfferSource: string;
  mainTopicCandidates: string[];
  mainOfferCandidates: string[];
  mainTopicSafe: boolean;
  mainOfferSafe: boolean;
  safeIntentBucket: string;
  safeIntentSource: string;
  geoScope: string | null;
  language: 'fr' | 'en';
  crawlTransportScore: number;
  semanticCoverageScore: number;
  semanticConfidenceScore: number;
  confidenceScore: number;
  runnerUpType:
    | 'local_service'
    | 'saas'
    | 'ai_native'
    | 'streaming_entertainment'
    | 'marketplace'
    | 'education_training'
    | 'documentation_knowledge'
    | 'community_forum'
    | 'travel_booking'
    | 'jobs_recruitment'
    | 'public_service_nonprofit'
    | 'ecommerce'
    | 'media'
    | 'portfolio'
    | 'brand_site'
    | 'generic';
  signalsMatched: string[];
  classificationReason: string;
  siteTypeScores: Record<string, number>;
}

export interface PromptBrief {
  discoveryMode: PromptProfileSnapshot['discoveryMode'] | null;
  siteName: string | null;
  siteType: PromptProfileSnapshot['siteType'] | null;
  siteFamily: PromptProfileSnapshot['siteFamily'] | null;
  domainVertical: PromptProfileSnapshot['domainVertical'] | null;
  offerFamily: string | null;
  useCase: string | null;
  localActorSingular: string | null;
  localActorPlural: string | null;
  targetAudience: string | null;
  capabilities: string[];
  mainTopic: string | null;
  mainOffer: string | null;
  geoScope: string | null;
  confidence: number | null;
  promptGenerationLevelHint: PromptProfileSnapshot['promptGenerationLevel'] | null;
  reasoningQuality: 'high' | 'medium' | 'low' | null;
  excludedSignals: string[];
  repaired?: boolean;
  validationIssues?: string[];
}

export type PageRole =
  | 'home'
  | 'about'
  | 'pricing'
  | 'services'
  | 'product'
  | 'docs'
  | 'faq'
  | 'contact'
  | 'legal'
  | 'blog_news'
  | 'community'
  | 'jobs'
  | 'directory'
  | 'generic'
  | 'error';

// AI Response Types
export interface AIResponse {
  model: string;
  provider: AiProviderId;
  prompt: string;
  response: string;
  error?: string;
  searchEnabled?: boolean;
  providerStatus?: 'success' | 'error' | 'unconfigured' | 'skipped';
}

// Analysis Results
export type AspectKey =
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
  | 'trust'
  | 'accessibility';

export interface AnalysisTopEntity {
  name: string;
  rank: number | null;
  role: 'target' | 'competitor' | 'other';
}

export interface AspectObservation {
  aspect: AspectKey;
  entity: 'target' | 'competitor' | 'market';
  sentiment: 'positive' | 'neutral' | 'negative';
  intensity: 1 | 2 | 3;
  evidence: string;
}

export interface ComparisonObservation {
  competitor: string;
  aspect: AspectKey;
  winner: 'target' | 'competitor' | 'tie' | 'mixed' | 'unclear';
  evidence: string;
}

export interface PriceObservation {
  label: 'budget' | 'value' | 'premium' | 'mixed' | 'unknown';
  direction: 'cheaper' | 'similar' | 'more_expensive' | 'mixed' | 'unknown';
  evidence: string;
}

export interface AnalysisResult {
  promptId: string;
  provider: string;
  mentioned: boolean;
  organicMention?: boolean;
  position: number | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  competitors: string[];
  explicitCompetitors?: string[];
  inferredCompetitors?: string[];
  competitorEntityTypes?: Array<{
    name: string;
    type: 'brand' | 'directory' | 'marketplace' | 'generic_actor' | 'noise';
  }>;
  genericAlternatives?: string[];
  answerShort?: string;
  excerpt?: string;
  citation?: string;
  topEntities?: AnalysisTopEntity[];
  aspectObservations?: AspectObservation[];
  comparisonObservations?: ComparisonObservation[];
  priceObservation?: PriceObservation | null;
  confidence: number;
  providerError?: string | null;
}

export interface DetectedBusinessFacts {
  address: string | null;
  phone: string | null;
  email: string | null;
  openingHours: string | null;
  city: string | null;
}

export type BusinessFactSource = 'llm' | 'preview' | 'heuristic' | 'derived';
export type BusinessFactConfidence = 'high' | 'medium' | 'low';

export interface CanonicalBusinessFact {
  value: string | null;
  source: BusinessFactSource | null;
  confidence: BusinessFactConfidence | null;
  evidence: string | null;
}

export interface CanonicalBusinessFacts {
  address: CanonicalBusinessFact;
  phone: CanonicalBusinessFact;
  email: CanonicalBusinessFact;
  openingHours: CanonicalBusinessFact;
  city: CanonicalBusinessFact;
}

export interface FactAnalysisResult {
  provider: string;
  prompt: string;
  searchEnabled?: boolean;
  detected: DetectedBusinessFacts;
  detectedFieldCount: number;
  possibleFieldCount: number;
  confidence: number;
  known?: boolean;
  memoryKnown?: boolean;
  providerError?: string | null;
}

export type InsightConfidence = 'high' | 'medium' | 'low';

export interface InsightStrengthPoint {
  category: string;
  label: string;
  evidence: string;
  confidence: InsightConfidence;
}

export interface InsightAlternative {
  label: string;
}

export interface InsightComparisonAxis {
  category: string;
  label: string;
  confidence: InsightConfidence;
}

export interface InsightStrengthsResult {
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  strengths: InsightStrengthPoint[];
  weaknesses: InsightStrengthPoint[];
  genericAlternatives: InsightAlternative[];
}

export interface InsightValueResult {
  pricePositioning: {
    label: 'budget' | 'accessible' | 'mid_market' | 'premium' | 'high_end' | 'unclear';
    evidence: string;
    confidence: InsightConfidence;
  } | null;
  trustLevel: {
    level: 'low' | 'moderate' | 'high' | 'unclear';
    evidence: string;
    confidence: InsightConfidence;
  } | null;
  sentiment: {
    label: 'positive' | 'neutral' | 'negative';
    summary: string;
    confidence: InsightConfidence;
  } | null;
  comparisonAxes: InsightComparisonAxis[];
}

export interface InsightResults {
  strengthsPrompt: InsightStrengthsResult | null;
  valuePrompt: InsightValueResult | null;
}

// Crawl Results
export interface CrawledPageSnapshot {
  url: string;
  path: string;
  pageRole: PageRole;
  title: string;
  brandHint: string | null;
  isInvalidPage: boolean;
  invalidReason: string | null;
  metaDescription: string;
  h1: string;
  canonical: string | null;
  metaRobots: string | null;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  schemaTypes: string[];
  schemaMethods?: Array<'jsonld' | 'microdata' | 'rdfa'>;
  language: string;
  internalLinks: string[];
  detectedPhone: string | null;
  detectedEmail: string | null;
  detectedAddress: string | null;
  detectedOpeningHours: string | null;
  hasViewport: boolean;
  textLength: number;
  likelySpaShell: boolean;
}

export interface FreePreviewSignals {
  fetchedUrls: string[];
  pages: CrawledPageSnapshot[];
  trustPages: {
    about: boolean;
    contact: boolean;
    faq: boolean;
    tarifs: boolean;
    confidentialite: boolean;
    cgu: boolean;
  };
  brandDetected: string | null;
  sectorDetected: string | null;
  cityDetected: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  openingHours: string | null;
  coherenceScore: number;
  structureReadable: boolean;
  titlesClear: boolean;
  descriptiveContent: boolean;
  minimalInternalLinking: boolean;
  entitiesUnderstandable: boolean;
  offerIdentifiable: boolean;
  replaceabilityRisk: 'low' | 'medium' | 'high';
  spaLikely: boolean;
}

export interface CrawlFavicon {
  url: string | null;
  dataUrl: string | null;
  mimeType: string | null;
}

export interface CrawlResult {
  crawledAt?: string;
  robotsTxt: {
    exists: boolean;
    blocksGPTBot: boolean;
    blocksClaude: boolean;
    blocksPerplexity: boolean;
    blocksGoogleExtended: boolean;
    rawContent: string;
    probeStatus?: number | null;
    fetchError?: string | null;
  };
  sitemap: {
    exists: boolean;
    url: string | null;
    pageCount: number | null;
    discoveredUrls?: string[];
    source?: 'default_path' | 'robots_txt' | 'both' | null;
    probes?: Array<{
      url: string;
      status: number | null;
      ok: boolean;
      error?: string | null;
      source?: 'default_path' | 'robots_txt' | 'both' | null;
    }>;
  };
  structuredData: {
    hasSchemaOrg: boolean;
    types: string[];
    methods?: Array<'jsonld' | 'microdata' | 'rdfa'>;
  };
  meta: {
    title: string;
    description: string;
    hasCanonical: boolean;
    language: string;
  };
  businessInfo: BusinessInfo;
  canonicalFacts?: CanonicalBusinessFacts;
  performance: {
    responseTime: number;
    isHttps: boolean;
    hasMobileViewport: boolean;
  };
  crawlStatus?: {
    homepageStatus: number;
    failedFetchCount: number;
    failedUrls: string[];
    homepageFailed?: boolean;
    subpageFailureCount?: number;
    truncatedFetchCount?: number;
    truncatedUrls?: string[];
    crawlFailed?: boolean;
    crawlPartial?: boolean;
  };
  previewSignals?: FreePreviewSignals;
  favicon?: CrawlFavicon | null;
}

export interface BusinessInfo {
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  openingHours: string | null;
  services: string[];
  description: string | null;
}

// Score Results
export interface ScoreResult {
  globalScore: number;
  visibility: {
    score: number;
    details: string;
  };
  factualCoverage: {
    score: number;
    details: string;
    measurable?: boolean;
  };
  positioning: {
    score: number;
    details: string;
  };
  sentiment?: {
    score: number;
    details: string;
  };
  technical: {
    score: number;
    details: string;
  };
  mentionRate: number;
  topCompetitors: Array<{
    name: string;
    mentionCount: number;
  }>;
}

// Complete Scan Results
export interface ScanResults {
  analysisMode?: 'free' | 'full';
  prompts: PromptQuery[];
  promptProfile?: PromptProfileSnapshot;
  promptBrief?: PromptBrief | null;
  aiResponses: AIResponse[];
  insightResponses?: AIResponse[];
  factResponses?: AIResponse[];
  analyses: AnalysisResult[];
  insightResults?: InsightResults | null;
  factAnalyses?: FactAnalysisResult[];
  crawl: CrawlResult;
  score: ScoreResult;
}

export type RecommendationAxis = 'readable' | 'offer' | 'citable' | 'credible';

export type RecommendationPhase = 'this_week' | 'this_month' | 'later';

export interface RecommendationEvidence {
  label: string;
  value?: string | number | boolean | string[] | null;
  reason: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  benefit?: string;
  whyNow?: string;
  steps?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'high' | 'medium' | 'low';
  priority: number;
  axis: RecommendationAxis;
  phase: RecommendationPhase;
  evidence: RecommendationEvidence[];
}

export interface RecommendationPlan {
  sectionIntro: string;
  quickWinId: string | null;
  primaryBlocker: string;
  mainAxis: RecommendationAxis;
  phaseSummaries: {
    this_week: string;
    this_month: string;
    later: string;
  };
}

// Report Structure
export interface Report {
  auditId: string;
  generatedAt: string;
  synthesis: string; // Summary paragraph shown under the global score
  dataQuality: 'good' | 'partial' | 'poor';
  providerHealth: {
    openai: number;
    anthropic: number;
    perplexity: number;
    totalErrorRate: number;
    configuredProviders: number;
    activeProviders: number;
    unconfiguredProviders: string[];
  };
  summary: {
    globalScore: number;
    visibility: number;
    factualCoverage: number | null;
    positioning: number;
    technical: number;
  };
  queryMatrix: Array<{
    query: string;
    category: string;
    openai: 'cited_first' | 'cited' | 'not_cited' | 'unavailable';
    anthropic: 'cited_first' | 'cited' | 'not_cited' | 'unavailable';
    perplexity: 'cited_first' | 'cited' | 'not_cited' | 'unavailable';
  }>;
  visibilityByModel: {
    openai: {
      mentionRate: number;
      totalQueries: number;
    };
    anthropic: {
      mentionRate: number;
      totalQueries: number;
    };
    perplexity: {
      mentionRate: number;
      totalQueries: number;
    };
  };
  factSnapshots: Array<{
    provider: string;
    model?: string;
    searchEnabled?: boolean;
    known?: boolean;
    detected: DetectedBusinessFacts;
  }>;
  competitors: Array<{
    name: string;
    mentionCount: number;
    appearsInQueries: string[];
  }>;
  marketInsights?: {
    pricePositioning: {
      label: 'budget' | 'accessible' | 'mid_market' | 'premium' | 'high_end' | 'unclear';
      confidence: 'high' | 'medium' | 'low';
      summary: string;
    };
    marketSentiment: {
      label:
        | 'very_positive'
        | 'positive'
        | 'mixed_positive'
        | 'mixed'
        | 'mixed_negative'
        | 'negative'
        | 'insufficient_signal';
      confidence: 'high' | 'medium' | 'low';
      summary: string;
    };
    polarization: {
      level: 'low' | 'moderate' | 'high' | 'insufficient_signal';
      confidence: 'high' | 'medium' | 'low';
      summary: string;
    };
    trustLevel: {
      level: 'low' | 'moderate' | 'high' | 'unclear';
      confidence: 'high' | 'medium' | 'low';
      summary: string;
    };
    signalStrength: 'weak' | 'medium' | 'strong';
    strengths: Array<{
      category: string;
      label: string;
      evidence: string;
      confidence: 'high' | 'medium' | 'low';
    }>;
    weaknesses: Array<{
      category: string;
      label: string;
      evidence: string;
      confidence: 'high' | 'medium' | 'low';
    }>;
    comparisonAxes: Array<{
      category: string;
      label: string;
      confidence: 'high' | 'medium' | 'low';
    }>;
    alternativeFamilies: Array<{
      label: string;
      description: string;
    }>;
    sourceMix: Array<{
      type:
        | 'reviews'
        | 'directories'
        | 'comparison_content'
        | 'community_discussions'
        | 'official_pages'
        | 'editorial_mentions'
        | 'other';
      label: string;
      weight: 'low' | 'medium' | 'high';
    }>;
    executiveSummary: string;
    provider: 'openai' | 'fallback';
    model?: string;
    genericAlternatives: Array<{
      label: string;
    }>;
  };
  competitorBenchmark?: {
    youMentionCount: number;
    totalQueries: number;
  };
  technicalAudit: {
    robotsTxt: {
      status: 'good' | 'warning' | 'critical' | 'unknown';
      details: string;
      exists?: boolean;
      verdict?: 'authorized' | 'blocked' | 'unknown';
      bots?: {
        gptbot: { blocked: boolean; verdict?: 'authorized' | 'blocked' | 'unknown' };
        claudebot: { blocked: boolean; verdict?: 'authorized' | 'blocked' | 'unknown' };
        perplexitybot: { blocked: boolean; verdict?: 'authorized' | 'blocked' | 'unknown' };
        googleExtended: { blocked: boolean; verdict?: 'authorized' | 'blocked' | 'unknown' };
      };
    };
    structuredData: {
      status: 'good' | 'warning' | 'critical' | 'unknown';
      details: string;
      verdict?: 'present' | 'absent' | 'unknown';
      methods?: Array<'jsonld' | 'microdata' | 'rdfa'>;
    };
    sitemap: {
      status: 'good' | 'warning' | 'critical' | 'unknown';
      details: string;
      verdict?: 'present' | 'absent' | 'unknown';
      exists?: boolean;
      url?: string | null;
      pageCount?: number | null;
      source?: 'default_path' | 'robots_txt' | 'both' | null;
    };
  };
  recommendations: Recommendation[];
  recommendationPlan?: RecommendationPlan;
  globalExecutiveSummary?: string;
}

// Waitlist
export interface WaitlistEntry {
  id: string;
  created_at: string;
  email: string;
  email_normalized?: string;
  audit_id: string | null;
  source: string;
}

export interface ScanJob {
  id: string;
  created_at: string;
  updated_at: string;
  audit_id: string;
  status: 'pending' | 'processing' | 'failed' | 'done';
  attempts: number;
  next_retry_at: string;
  processing_started_at: string | null;
  completed_at: string | null;
  last_error: string | null;
}
