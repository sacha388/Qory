import type { CrawlResult, PromptBrief, PromptProfileSnapshot, PageRole } from '@/types';
import { extractWithGPT } from '@/lib/ai/openai';
import { logWarn } from '@/lib/logger';
import {
  getSiteTypeVerticalDefaultOfferLabel,
  getSiteTypeVerticalTopicLabel,
  isDomainVerticalAllowedForSiteType,
  SITE_TYPE_TO_FAMILY,
  VALID_DOMAIN_VERTICALS,
  VALID_SITE_TYPES,
} from '@/lib/scanner/prompt-taxonomy';

type SiteType = PromptProfileSnapshot['siteType'];
type SiteFamily = PromptProfileSnapshot['siteFamily'];
type DomainVertical = PromptProfileSnapshot['domainVertical'];
type PromptGenerationLevel = PromptProfileSnapshot['promptGenerationLevel'];
type DiscoveryMode = PromptProfileSnapshot['discoveryMode'];

type ResolvePromptBriefParams = {
  crawl: CrawlResult;
  fallbackBusinessName?: string | null;
  fallbackTopic?: string | null;
  fallbackCity?: string | null;
};

type PromptEvidencePage = {
  path: string;
  pageRole: PageRole;
  title: string;
  metaDescription: string;
  h1: string;
  schemaTypes: string[];
  invalidReason: string | null;
  textLength: number;
};

type PromptEvidencePack = {
  url: string | null;
  fallbackBusinessName: string | null;
  fallbackTopic: string | null;
  fallbackCity: string | null;
  meta: CrawlResult['meta'];
  businessInfo: CrawlResult['businessInfo'];
  structuredData: CrawlResult['structuredData'];
  crawlStatus: CrawlResult['crawlStatus'] | null;
  previewSignals: {
    brandDetected: string | null;
    sectorDetected: string | null;
    cityDetected: string | null;
    replaceabilityRisk: string | null;
    coherenceScore: number | null;
    trustPages: Record<string, boolean> | null;
  };
  validPages: PromptEvidencePage[];
  invalidPages: Array<{
    path: string;
    title: string;
    invalidReason: string | null;
  }>;
  knownPaths: string[];
};

type PromptBriefValidation = {
  valid: boolean;
  issues: string[];
};

export type ResolvePromptBriefResult = {
  brief: PromptBrief | null;
  repaired: boolean;
  validationIssues: string[];
};

const VALID_LEVELS: PromptGenerationLevel[] = ['exact', 'controlled', 'family', 'brand'];
const VALID_DISCOVERY_MODES: DiscoveryMode[] = [
  'local_places',
  'digital_crawl',
  'hybrid_brand',
];
const VALID_REASONING_QUALITY = new Set(['high', 'medium', 'low']);
const MAX_VALID_PAGES = 6;
const MAX_INVALID_PAGES = 4;
const MAX_KNOWN_PATHS = 18;
const INVALID_TEXT_PATTERN =
  /(?:just a moment|attention required|access denied|forbidden|page not found|not found|enable javascript|checking your browser|verify you are human|404|403|500)/i;
const PROMOTIONAL_PATTERN =
  /\b(?:gratuit|gratuite|free trial|essai gratuit|best-in-class|leader|leading|no\.?1|n°1|revolutionary|révolutionnaire|world['’]s best|boost|scale faster)\b/i;
const GEO_JUNK_PATTERN =
  /\b(?:conditions? générales?|conditions of use|conditions of sale|terms(?: of service| of use)?|privacy|politique(?: de)? confidentialité|confidentialité|mentions? légales?|cookies?|cookie policy|cgu|cgv|all rights reserved|copyright)\b/i;
const BRAND_NOISE_PATTERN =
  /\b(?:logo(?:\s+de|\s+du|\s+des|\s+of)?(?:\s+la|\s+le|\s+les)?|documentation|docs?|help center|centre d[’']aide|knowledge base|base de connaissances)\b/gi;
const ROLE_PRIORITY: PageRole[] = [
  'home',
  'about',
  'pricing',
  'services',
  'product',
  'docs',
  'faq',
  'contact',
  'directory',
  'community',
  'jobs',
  'generic',
  'blog_news',
  'legal',
  'error',
];
const HIGH_TRUST_EVIDENCE_ROLES = new Set<PageRole>([
  'home',
  'about',
  'pricing',
  'services',
  'product',
  'docs',
  'faq',
  'contact',
  'directory',
  'community',
]);

export async function resolvePromptBriefWithAI(
  params: ResolvePromptBriefParams
): Promise<ResolvePromptBriefResult> {
  const evidencePack = buildPromptEvidencePack(params);
  const rawBrief = await requestPromptBrief(evidencePack);
  const normalizedBrief = normalizePromptBrief(rawBrief);
  const validation = validatePromptBrief(normalizedBrief);

  if (validation.valid) {
    return {
      brief: finalizePromptBrief(normalizedBrief, false, []),
      repaired: false,
      validationIssues: [],
    };
  }

  const repairedRawBrief = await requestPromptBriefRepair(
    evidencePack,
    normalizedBrief,
    validation.issues
  );
  const repairedBrief = normalizePromptBrief(repairedRawBrief);
  const repairedValidation = validatePromptBrief(repairedBrief);

  if (repairedValidation.valid) {
    return {
      brief: finalizePromptBrief(repairedBrief, true, validation.issues),
      repaired: true,
      validationIssues: validation.issues,
    };
  }

  logWarn('prompt_brief_resolution_failed', {
    phase: 'prompt_brief',
    validation_issues: validation.issues.join(' | '),
    repair_issues: repairedValidation.issues.join(' | '),
  });

  return {
    brief: null,
    repaired: false,
    validationIssues: Array.from(new Set([...validation.issues, ...repairedValidation.issues])),
  };
}

function buildPromptEvidencePack(params: ResolvePromptBriefParams): PromptEvidencePack {
  const { crawl, fallbackBusinessName, fallbackTopic, fallbackCity } = params;
  const pages = crawl.previewSignals?.pages ?? [];
  const validPages = selectEvidencePages(
    pages.filter((page) => !page.isInvalidPage).map((page) => ({
      path: page.path,
      pageRole: page.pageRole,
      title: truncate(page.title, 120) || '',
      metaDescription: truncate(page.metaDescription, 220) || '',
      h1: truncate(page.h1, 120) || '',
      schemaTypes: page.schemaTypes.slice(0, 6),
      invalidReason: page.invalidReason,
      textLength: page.textLength,
    }))
  );
  const invalidPages = pages
    .filter((page) => page.isInvalidPage)
    .slice(0, MAX_INVALID_PAGES)
    .map((page) => ({
      path: page.path,
      title: truncate(page.title, 120) || '',
      invalidReason: page.invalidReason,
    }));
  const knownPaths = Array.from(
    new Set([
      ...pages.map((page) => page.path),
      ...pages.flatMap((page) => page.internalLinks),
      ...(crawl.sitemap.discoveredUrls || []),
    ])
  )
    .map((path) => normalizePath(path))
    .filter((path): path is string => Boolean(path))
    .slice(0, MAX_KNOWN_PATHS);

  return {
    url: crawl.previewSignals?.fetchedUrls?.[0] || null,
    fallbackBusinessName: sanitizeSiteName(fallbackBusinessName),
    fallbackTopic: sanitizeLabel(fallbackTopic, 60),
    fallbackCity: sanitizeGeoScope(fallbackCity),
    meta: crawl.meta,
    businessInfo: {
      ...crawl.businessInfo,
      name: sanitizeSiteName(crawl.businessInfo.name),
      address: truncate(crawl.businessInfo.address, 180),
      phone: truncate(crawl.businessInfo.phone, 40),
      email: truncate(crawl.businessInfo.email, 80),
      openingHours: truncate(crawl.businessInfo.openingHours, 120),
      services: (crawl.businessInfo.services || [])
        .slice(0, 8)
        .map((value) => truncate(value, 80))
        .filter((value): value is string => Boolean(value)),
      description: truncate(crawl.businessInfo.description, 260),
    },
    structuredData: {
      hasSchemaOrg: crawl.structuredData.hasSchemaOrg,
      types: crawl.structuredData.types.slice(0, 10),
    },
    crawlStatus: crawl.crawlStatus || null,
    previewSignals: {
      brandDetected: sanitizeSiteName(crawl.previewSignals?.brandDetected),
      sectorDetected: sanitizeLabel(crawl.previewSignals?.sectorDetected, 60),
      cityDetected: sanitizeGeoScope(crawl.previewSignals?.cityDetected),
      replaceabilityRisk: crawl.previewSignals?.replaceabilityRisk || null,
      coherenceScore: crawl.previewSignals?.coherenceScore ?? null,
      trustPages: crawl.previewSignals?.trustPages || null,
    },
    validPages,
    invalidPages,
    knownPaths,
  };
}

function selectEvidencePages(pages: PromptEvidencePage[]): PromptEvidencePage[] {
  const uniquePages = Array.from(
    new Map(
      pages.map((page) => [page.path, page])
    ).values()
  );

  const preferredPages = uniquePages.filter((page) => HIGH_TRUST_EVIDENCE_ROLES.has(page.pageRole));
  const pool = preferredPages.length > 0 ? preferredPages : uniquePages;
  const selected: PromptEvidencePage[] = [];
  const selectedPaths = new Set<string>();

  for (const role of ROLE_PRIORITY) {
    if (selected.length >= MAX_VALID_PAGES) break;
    const candidate = pool
      .filter((page) => !selectedPaths.has(page.path) && page.pageRole === role)
      .sort(compareEvidencePages)[0];
    if (!candidate) continue;
    selected.push(candidate);
    selectedPaths.add(candidate.path);
  }

  const remaining = pool
    .filter((page) => !selectedPaths.has(page.path))
    .sort(compareEvidencePages);
  for (const page of remaining) {
    if (selected.length >= MAX_VALID_PAGES) break;
    selected.push(page);
    selectedPaths.add(page.path);
  }

  return selected;
}

function compareEvidencePages(a: PromptEvidencePage, b: PromptEvidencePage): number {
  const aRolePriority = ROLE_PRIORITY.indexOf(a.pageRole);
  const bRolePriority = ROLE_PRIORITY.indexOf(b.pageRole);
  if (aRolePriority !== bRolePriority) return aRolePriority - bRolePriority;

  const aRichness = getEvidenceRichness(a);
  const bRichness = getEvidenceRichness(b);
  if (aRichness !== bRichness) return bRichness - aRichness;

  const aDepth = a.path.split('/').filter(Boolean).length;
  const bDepth = b.path.split('/').filter(Boolean).length;
  if (aDepth !== bDepth) return aDepth - bDepth;

  return a.path.length - b.path.length;
}

function getEvidenceRichness(page: PromptEvidencePage): number {
  let score = 0;
  if (page.title.length >= 12) score += 12;
  if (page.metaDescription.length >= 70) score += 14;
  if (page.h1.length >= 8) score += 10;
  if (page.schemaTypes.length > 0) score += 8;
  score += Math.min(18, Math.round(page.textLength / 160));
  return score;
}

async function requestPromptBrief(evidencePack: PromptEvidencePack): Promise<unknown> {
  try {
    const raw = await extractWithGPT(
      JSON.stringify(evidencePack, null, 2),
      buildPromptBriefSystemPrompt()
    );
    return parseJsonObject(raw);
  } catch {
    return null;
  }
}

async function requestPromptBriefRepair(
  evidencePack: PromptEvidencePack,
  invalidBrief: Partial<PromptBrief>,
  issues: string[]
): Promise<unknown> {
  try {
    const raw = await extractWithGPT(
      JSON.stringify(
        {
          evidencePack,
          invalidBrief,
          issues,
        },
        null,
        2
      ),
      buildPromptBriefRepairSystemPrompt()
    );
    return parseJsonObject(raw);
  } catch {
    return null;
  }
}

function buildPromptBriefSystemPrompt(): string {
  return [
    'Tu normalises un profil de site web pour génération de prompts d’audit.',
    'Travaille UNIQUEMENT à partir du JSON fourni.',
    'N’invente rien.',
    'Ignore toute page listée comme invalide, ainsi que les signaux de challenge, 404, consentement, footer légal, logo ou documentation bruitée.',
    'Les pages ont un champ pageRole. Fais davantage confiance à home, about, pricing, services, product, docs, faq, contact et directory.',
    'Évite de te baser sur legal, blog_news ou generic si des rôles plus fiables existent.',
    'Retourne STRICTEMENT un JSON valide, sans markdown, sans texte avant ou après.',
    'Contraintes :',
    '- discoveryMode: local_places, digital_crawl ou hybrid_brand.',
    '- siteName: nom de marque propre, court, sans 404, sans .fr, sans docs, sans logo.',
    '- siteType: une valeur parmi: local_service, saas, ai_native, streaming_entertainment, marketplace, education_training, documentation_knowledge, community_forum, travel_booking, jobs_recruitment, public_service_nonprofit, ecommerce, media, portfolio, brand_site, generic.',
    '- domainVertical: une valeur parmi: accounting_finance, legal_compliance, hr_payroll, sales_crm, marketing_communication, developer_tools, it_cyber_data, ai_automation, ecommerce_retail, real_estate, healthcare_wellness, education_training, recruitment_jobs, travel_hospitality, food_restaurants, construction_home_services, logistics_mobility, public_sector_associations, general_business.',
    '- Respecte l’entonnoir: siteType -> domainVertical compatible -> offerFamily -> useCase.',
    '- domainVertical doit être cohérent avec le siteType détecté. Ne mélange pas un type de site et une verticale métier incompatibles.',
    '- offerFamily: famille d’offre courte, neutre, 2 à 5 mots, compatible avec siteType + domainVertical.',
    '- useCase: besoin utilisateur concret, 3 à 10 mots, formulé naturellement, compatible avec siteType + domainVertical.',
    '- localActorSingular / localActorPlural: uniquement si siteType=local_service. Exemples: restaurant/restaurants, hôtel/hôtels, dentiste/dentistes, boutique/boutiques, agence/agences. Sinon null.',
    '- targetAudience: cible principale courte ou null.',
    '- capabilities: 0 à 4 capacités / tâches précises, courtes et propres.',
    '- mainTopic: catégorie courte, neutre, 2 à 6 mots, pas de slogan marketing.',
    '- mainOffer: besoin utilisateur naturel, formulé proprement, 3 à 8 mots, pas de slogan marketing, et compatible avec le couple siteType + domainVertical.',
    '- geoScope: ville propre ou null.',
    '- confidence: entier de 0 à 100.',
    '- promptGenerationLevelHint: exact, controlled, family ou brand.',
    '- reasoningQuality: high, medium ou low.',
    '- excludedSignals: liste courte des signaux ignorés.',
    'Si tu hésites, choisis un libellé plus large et baisse confidence.',
    'Format attendu :',
    '{',
    '  "discoveryMode": string|null,',
    '  "siteName": string|null,',
    '  "siteType": string|null,',
    '  "siteFamily": string|null,',
    '  "domainVertical": string|null,',
    '  "offerFamily": string|null,',
    '  "useCase": string|null,',
    '  "localActorSingular": string|null,',
    '  "localActorPlural": string|null,',
    '  "targetAudience": string|null,',
    '  "capabilities": [string, string],',
    '  "mainTopic": string|null,',
    '  "mainOffer": string|null,',
    '  "geoScope": string|null,',
    '  "confidence": number|null,',
    '  "promptGenerationLevelHint": string|null,',
    '  "reasoningQuality": string|null,',
    '  "excludedSignals": [string, string]',
    '}',
  ].join('\n');
}

function buildPromptBriefRepairSystemPrompt(): string {
  return [
    'Tu corriges un prompt brief invalide.',
    'Travaille UNIQUEMENT à partir du JSON fourni.',
    'Le champ issues liste les erreurs à corriger.',
    'Retourne STRICTEMENT un JSON valide, sans markdown, sans texte avant ou après.',
    'Tu dois corriger les labels sales, trop marketing, trop longs, ou contaminés par 404/challenge/legal/footer.',
    'Si une information reste incertaine, remets un libellé plus large et baisse confidence.',
    'Conserve exactement le même format JSON que demandé.',
    'Format attendu :',
    '{',
    '  "discoveryMode": string|null,',
    '  "siteName": string|null,',
    '  "siteType": string|null,',
    '  "siteFamily": string|null,',
    '  "domainVertical": string|null,',
    '  "offerFamily": string|null,',
    '  "useCase": string|null,',
    '  "localActorSingular": string|null,',
    '  "localActorPlural": string|null,',
    '  "targetAudience": string|null,',
    '  "capabilities": [string, string],',
    '  "mainTopic": string|null,',
    '  "mainOffer": string|null,',
    '  "geoScope": string|null,',
    '  "confidence": number|null,',
    '  "promptGenerationLevelHint": string|null,',
    '  "reasoningQuality": string|null,',
    '  "excludedSignals": [string, string]',
    '}',
  ].join('\n');
}

function normalizePromptBrief(raw: unknown): Partial<PromptBrief> {
  const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const rawSiteType = normalizeEnumValue<SiteType>(data.siteType, VALID_SITE_TYPES);
  const rawSiteFamily = normalizeSiteFamily(data.siteFamily, rawSiteType);
  const normalized: Partial<PromptBrief> = {
    discoveryMode: normalizeEnumValue<DiscoveryMode>(data.discoveryMode, VALID_DISCOVERY_MODES),
    siteName: sanitizeSiteName(asString(data.siteName)),
    siteType: rawSiteType,
    siteFamily: rawSiteFamily,
    domainVertical: normalizeEnumValue<DomainVertical>(data.domainVertical, VALID_DOMAIN_VERTICALS),
    offerFamily: sanitizeLabel(asString(data.offerFamily), 80),
    useCase: sanitizeLabel(asString(data.useCase), 100),
    localActorSingular: sanitizeLabel(asString(data.localActorSingular), 60),
    localActorPlural: sanitizeLabel(asString(data.localActorPlural), 60),
    targetAudience: sanitizeLabel(asString(data.targetAudience), 80),
    capabilities: normalizeStringArray(data.capabilities, 4, 80),
    mainTopic: sanitizeLabel(asString(data.mainTopic), 60),
    mainOffer: sanitizeLabel(asString(data.mainOffer), 80),
    geoScope: sanitizeGeoScope(asString(data.geoScope)),
    confidence: normalizeConfidence(data.confidence),
    promptGenerationLevelHint: normalizeEnumValue<PromptGenerationLevel>(
      data.promptGenerationLevelHint,
      VALID_LEVELS
    ),
    reasoningQuality: normalizeReasoningQuality(data.reasoningQuality),
    excludedSignals: normalizeStringArray(data.excludedSignals, 6, 120),
  };

  if (
    normalized.promptGenerationLevelHint === 'brand' &&
    normalized.confidence !== null &&
    normalized.confidence !== undefined &&
    normalized.confidence >= 75 &&
    normalized.siteType &&
    normalized.siteType !== 'generic' &&
    normalized.siteType !== 'brand_site' &&
    normalized.domainVertical &&
    normalized.domainVertical !== 'general_business'
  ) {
    normalized.promptGenerationLevelHint = null;
  }

  return normalized;
}

function validatePromptBrief(brief: Partial<PromptBrief>): PromptBriefValidation {
  const issues: string[] = [];

  if (!brief.siteType) issues.push('siteType manquant ou invalide');
  if (!brief.domainVertical) issues.push('domainVertical manquant ou invalide');
  if (!brief.offerFamily && !brief.mainTopic) issues.push('offerFamily manquant ou invalide');
  if (!brief.useCase && !brief.mainOffer) issues.push('useCase manquant ou invalide');
  if (brief.siteName !== null && brief.siteName !== undefined && !brief.siteName) {
    issues.push('siteName vide après nettoyage');
  }
  if (brief.geoScope !== null && brief.geoScope !== undefined && !brief.geoScope) {
    issues.push('geoScope vide après nettoyage');
  }
  if (
    (brief.offerFamily || brief.mainTopic) &&
    (brief.useCase || brief.mainOffer) &&
    normalizeKey(brief.offerFamily || brief.mainTopic || '') ===
      normalizeKey(brief.useCase || brief.mainOffer || '')
  ) {
    issues.push('offerFamily et useCase identiques');
  }
  if (
    brief.siteFamily &&
    brief.siteType &&
    SITE_TYPE_TO_FAMILY[brief.siteType] !== brief.siteFamily
  ) {
    issues.push('siteFamily incompatible avec siteType');
  }
  if (
    brief.siteType &&
    brief.domainVertical &&
    !isDomainVerticalAllowedForSiteType(brief.siteType, brief.domainVertical)
  ) {
    issues.push('domainVertical incompatible avec siteType');
  }
  if (
    brief.siteType === 'local_service' &&
    ((brief.localActorSingular && !brief.localActorPlural) ||
      (!brief.localActorSingular && brief.localActorPlural))
  ) {
    issues.push('libellé acteur local incomplet');
  }
  if (brief.confidence !== null && brief.confidence !== undefined && brief.confidence < 0) {
    issues.push('confidence invalide');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

function finalizePromptBrief(
  brief: Partial<PromptBrief>,
  repaired: boolean,
  validationIssues: string[]
): PromptBrief {
  const siteType = brief.siteType || 'generic';
  const domainVertical = brief.domainVertical || 'general_business';
  const discoveryMode = brief.discoveryMode || defaultDiscoveryModeForSiteType(siteType);
  const offerFamily =
    brief.offerFamily ||
    brief.mainTopic ||
    getSiteTypeVerticalTopicLabel(siteType, domainVertical, 'fr') ||
    null;
  const useCase =
    brief.useCase ||
    brief.mainOffer ||
    getSiteTypeVerticalDefaultOfferLabel(siteType, domainVertical, 'fr') ||
    null;

  return {
    discoveryMode,
    siteName: brief.siteName || null,
    siteType,
    siteFamily: brief.siteFamily || SITE_TYPE_TO_FAMILY[siteType],
    domainVertical,
    offerFamily,
    useCase,
    localActorSingular: brief.localActorSingular || null,
    localActorPlural: brief.localActorPlural || null,
    targetAudience: brief.targetAudience || null,
    capabilities: brief.capabilities || [],
    mainTopic: brief.mainTopic || offerFamily,
    mainOffer: brief.mainOffer || useCase,
    geoScope: brief.geoScope || null,
    confidence: brief.confidence ?? null,
    promptGenerationLevelHint: brief.promptGenerationLevelHint || null,
    reasoningQuality: brief.reasoningQuality || null,
    excludedSignals: brief.excludedSignals || [],
    repaired,
    validationIssues,
  };
}

function defaultDiscoveryModeForSiteType(siteType: SiteType): DiscoveryMode {
  if (siteType === 'local_service') return 'local_places';
  if (siteType === 'brand_site') return 'hybrid_brand';
  return 'digital_crawl';
}

function parseJsonObject(raw: string): unknown {
  const direct = raw.trim();

  try {
    return JSON.parse(direct);
  } catch {
    // Continue below.
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

function truncate(value: string | null | undefined, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;
  return cleaned.length <= maxLength ? cleaned : cleaned.slice(0, maxLength).trim();
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function normalizeStringArray(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => truncate(item, maxLength))
    .filter((item): item is string => Boolean(item))
    .slice(0, maxItems);
}

function normalizeEnumValue<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase() as T;
  return allowed.includes(normalized) ? normalized : null;
}

function normalizeSiteFamily(
  value: unknown,
  siteType: SiteType | null
): SiteFamily | null {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase() as SiteFamily;
    const allowedFamilies = new Set<SiteFamily>([
      'software_family',
      'content_family',
      'commerce_family',
      'service_family',
      'institutional_family',
      'learning_family',
      'generic_family',
    ]);
    if (allowedFamilies.has(normalized)) {
      return normalized;
    }
  }

  if (!siteType) return null;
  return SITE_TYPE_TO_FAMILY[siteType];
}

function normalizeConfidence(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeReasoningQuality(value: unknown): PromptBrief['reasoningQuality'] {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return VALID_REASONING_QUALITY.has(normalized) ? (normalized as PromptBrief['reasoningQuality']) : null;
}

function sanitizeSiteName(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;

  const cleaned = dedupeAdjacentTokens(
    value
      .replace(/([a-zà-ÿ])([A-ZÀ-Ÿ])/g, '$1 $2')
      .replace(/\.(?:fr|com|io|ai|net|org|app|co|dev)\b/gi, '')
      .replace(/\b(?:404|403|500)\b/gi, ' ')
      .replace(BRAND_NOISE_PATTERN, ' ')
      .replace(/[“”"']/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );

  if (!cleaned || cleaned.length < 2 || cleaned.length > 60) return null;
  if (INVALID_TEXT_PATTERN.test(cleaned)) return null;
  if (GEO_JUNK_PATTERN.test(cleaned)) return null;
  if (cleaned.split(/\s+/).filter(Boolean).length > 6) return null;

  return cleaned;
}

function sanitizeLabel(value: string | null | undefined, maxLength: number): string | null {
  if (typeof value !== 'string') return null;

  const cleaned = value
    .replace(/\s+/g, ' ')
    .replace(/[“”"']/g, '')
    .replace(/[.!]+$/g, '')
    .trim();

  if (!cleaned || cleaned.length < 3 || cleaned.length > maxLength) return null;
  if (INVALID_TEXT_PATTERN.test(cleaned)) return null;
  if (PROMOTIONAL_PATTERN.test(cleaned)) return null;
  if (GEO_JUNK_PATTERN.test(cleaned)) return null;

  return cleaned;
}

function sanitizeGeoScope(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;

  const cleaned = value
    .replace(/([a-zà-ÿ-])([A-ZÀ-Ÿ])/g, '$1 $2')
    .replace(/\d{5}/g, '')
    .replace(GEO_JUNK_PATTERN, '')
    .replace(/[|•/].*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || cleaned.length < 2 || cleaned.length > 60) return null;
  if (/\d/.test(cleaned)) return null;
  if (INVALID_TEXT_PATTERN.test(cleaned)) return null;
  if (cleaned.split(/\s+/).filter(Boolean).length > 5) return null;

  const normalized = cleaned.toLowerCase();
  if (
    normalized === 'france' ||
    normalized === 'fr' ||
    normalized === 'global' ||
    normalized === 'worldwide' ||
    normalized === 'international'
  ) {
    return null;
  }

  return cleaned;
}

function dedupeAdjacentTokens(value: string): string {
  const tokens = value.split(/\s+/).filter(Boolean);
  const deduped: string[] = [];

  tokens.forEach((token) => {
    if (deduped[deduped.length - 1]?.toLowerCase() === token.toLowerCase()) {
      return;
    }
    deduped.push(token);
  });

  return deduped.join(' ');
}

function normalizePath(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const noTrailingSlash = trimmed.length > 1 ? trimmed.replace(/\/+$/, '') : trimmed;
  return noTrailingSlash.toLowerCase();
}

function normalizeKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .toLowerCase();
}
