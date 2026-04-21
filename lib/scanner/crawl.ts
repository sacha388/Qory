import type {
  CrawlResult,
  BusinessInfo,
  CanonicalBusinessFact,
  CanonicalBusinessFacts,
  BusinessFactConfidence,
  BusinessFactSource,
  CrawledPageSnapshot,
  FreePreviewSignals,
  PageRole,
} from '@/types';
import { extractWithGPT } from '@/lib/ai/openai';
import { detectSector } from '@/lib/sectors';
import * as cheerio from 'cheerio';
import {
  assertSafeExternalUrl,
  readBytesWithLimit,
  readTextWithLimit,
  safeFetchUrl,
} from '@/lib/security/ssrf';
import { logInfo, logWarn } from '@/lib/logger';
import { gunzipSync } from 'node:zlib';

const HOMEPAGE_FETCH_TIMEOUT_MS = 7000;
const ADDITIONAL_PAGE_FETCH_TIMEOUT_MS = 4500;
const STRUCTURED_FETCH_TIMEOUT_MS = 4500;
const FAVICON_FETCH_TIMEOUT_MS = 3500;
const HOMEPAGE_MAX_BYTES = 5_000_000;
const ADDITIONAL_PAGE_MAX_BYTES = 2_000_000;
const STRUCTURED_FILE_MAX_BYTES = 1_000_000;
const FAVICON_MAX_BYTES = 262_144;
const INITIAL_ADDITIONAL_PAGE_BUDGET = 5;
const MAX_ADDITIONAL_PAGES = 8;
const MAX_FAVICON_CANDIDATES = 8;

type FetchPageResult = {
  html: string;
  status: number;
  truncated: boolean;
};

type CrawlCandidate = {
  path: string;
  roleHint: PageRole;
  score: number;
  depth: number;
  source: 'homepage' | 'sitemap' | 'both';
};

type FaviconCandidate = {
  url: string;
  rel: string;
  sizes: string;
  type: string;
  score: number;
};

type SitemapCheckResult = {
  exists: boolean;
  url: string | null;
  pageCount: number | null;
  discoveredUrls: string[];
  source: 'default_path' | 'robots_txt' | 'both' | null;
  probes?: Array<{
    url: string;
    status: number | null;
    ok: boolean;
    error?: string | null;
    source?: 'default_path' | 'robots_txt' | 'both' | null;
  }>;
};

type ExtractedStructuredData = {
  hasSchemaOrg: boolean;
  types: string[];
  names: string[];
  addresses: string[];
  methods: Array<'jsonld' | 'microdata' | 'rdfa'>;
};

const PAGE_ROLE_PATH_HINTS: Record<Exclude<PageRole, 'home' | 'generic' | 'error'>, readonly string[]> = {
  about: ['/about', '/a-propos', '/about-us', '/company', '/team', '/mission', '/who-we-are'],
  pricing: ['/pricing', '/tarifs', '/prices', '/plans', '/plan'],
  services: ['/services', '/service', '/prestations', '/booking', '/book', '/reserve', '/rendez-vous'],
  product: ['/product', '/products', '/features', '/feature', '/solution', '/solutions', '/platform', '/app', '/software'],
  docs: ['/docs', '/documentation', '/doc', '/guides', '/guide', '/reference', '/help-center', '/knowledge-base'],
  faq: ['/faq', '/help', '/support', '/questions', '/answers'],
  contact: ['/contact', '/locations', '/stores', '/store-locator'],
  legal: ['/privacy', '/confidentialite', '/politique-de-confidentialite', '/terms', '/conditions', '/legal', '/mentions-legales', '/cookies', '/cgu', '/cgv'],
  blog_news: ['/blog', '/news', '/press', '/article', '/articles', '/media', '/magazine'],
  community: ['/community', '/forum', '/forums', '/discuss', '/discussion', '/questions', '/q', '/answers'],
  jobs: ['/jobs', '/careers', '/career', '/recruitment', '/hiring'],
  directory: ['/shop', '/store', '/catalog', '/categories', '/category', '/browse', '/marketplace', '/collection', '/collections', '/courses', '/listings'],
};

const HIGH_VALUE_ROLES: PageRole[] = [
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
];

const LOW_SIGNAL_ROLE_PENALTIES: Partial<Record<PageRole, number>> = {
  legal: 60,
  blog_news: 22,
  generic: 10,
  error: 100,
};

const PATH_REJECTION_PATTERNS = [
  /\/(?:wp-admin|wp-content|cdn-cgi|_next|api|assets?|static|images?|img|fonts?|js|css)(?:\/|$)/i,
  /\/(?:login|sign-in|signin|sign-up|signup|register|account|cart|checkout|search)(?:\/|$)/i,
  /\.(?:xml|json|rss|txt|jpg|jpeg|png|gif|svg|webp|pdf|zip)$/i,
] as const;

const ROLE_SELECTION_BASE_ORDER: PageRole[] = [
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
];

const ADDRESS_PATTERNS: RegExp[] = [
  // FR: "12 rue de la Paix, 75002 Paris"
  /\b\d{1,6}[\s,]+(?:rue|avenue|av\.?|boulevard|bd\.?|chemin|ch\.?|impasse|imp\.?|route|rte\.?|place|pl\.?|allée|passage|cours|quai|square|voie|faubourg|fbg\.?)\s+[A-Za-zÀ-ÿ0-9\s''\-,]{2,80}(?:,?\s*\d{5}\s+[A-Za-zÀ-ÿ\s\-']{2,40})?/iu,
  // FR: "Rue de la Paix, 75002 Paris" (no leading number)
  /(?:rue|avenue|av\.?|boulevard|bd\.?|chemin|ch\.?|impasse|imp\.?|route|rte\.?|place|pl\.?|allée|passage|cours|quai|square|voie|faubourg|fbg\.?)\s+[A-Za-zÀ-ÿ0-9\s''\-]{2,60}(?:,?\s*\d{5}\s+[A-Za-zÀ-ÿ\s\-']{2,40})/iu,
  // FR: Standalone zip+city "75002 Paris" / "13100 Aix-en-Provence"
  /\b\d{5}\s+[A-ZÀ-Ÿ][A-Za-zÀ-ÿ\s\-']{2,40}\b/u,
  // Generic: "number street, zipcode city"
  /\b\d{1,4}\s+[A-Za-zÀ-ÿ0-9\s,'\-]{4,80},?\s*\d{5}\s+[A-Za-zÀ-ÿ\s\-]{2,40}\b/u,
  // US: "123 Main Street, City, ST 12345"
  /\b\d{1,6}\s+[A-Za-z0-9.'\- ]{3,80}\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Circle|Cir|Terrace|Ter|Parkway|Pkwy|Highway|Hwy|Pike|Trail|Trl)\b(?:,?\s*[A-Za-z.\- ]+){0,3}\s*[A-Z]{2}\s*\d{5}(?:-\d{4})?\b/i,
  // UK: "123 Main Street, City AB1 2CD"
  /\b\d{1,6}\s+[A-Za-z0-9.'\- ]{3,80}\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Close|Crescent|Gardens|Grove|Mews|Terrace|Place)\b(?:,?\s*[A-Za-z.\- ]+){0,3}\s*[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i,
  // DE/AT/CH: "Hauptstraße 12, 10115 Berlin" or "Bahnhofstrasse 7, CH-8001 Zürich"
  /\b[A-Za-zÀ-ÿäöüÄÖÜß]{3,40}(?:straße|strasse|str\.?|weg|gasse|platz|allee)\s+\d{1,6}\b[^\n]{0,60}/iu,
  // BE/LU/IT/ES/PT: zip formats (4-5 digits, sometimes with prefix)
  /\b\d{1,6}[\s,]+[A-Za-zÀ-ÿ0-9.'\- ]{3,80}(?:,?\s*(?:[A-Z]{1,2}[\-\s]?)?\d{4,5}\s+[A-Za-zÀ-ÿ\s\-']{2,40})/iu,
];

const TRUST_PAGE_PATTERNS = {
  about: ['/about', '/a-propos', '/qui-sommes-nous'],
  contact: ['/contact'],
  faq: ['/faq'],
  tarifs: ['/tarifs', '/pricing', '/prices'],
  confidentialite: ['/confidentialite', '/privacy', '/politique-de-confidentialite'],
  cgu: ['/cgu', '/conditions-generales', '/terms', '/conditions'],
} as const;
const GENERIC_BRAND_LABEL_PATTERN =
  /^(home|accueil|about(?: us)?|a propos|contact|pricing|tarifs|features?|docs|documentation|faq|support|help|login|sign in|sign up|register|careers?|jobs?|blog|news)$/i;
const INVALID_BRAND_LABEL_PATTERN =
  /^(just a moment|attention required|access denied|forbidden|page not found|not found|erreur|error|enable javascript|checking your browser|verify you are human|404|403|500)\b/i;
const BRAND_NOISE_PREFIX_PATTERN =
  /^(?:logo(?:\s+de|\s+du|\s+des|\s+of)?(?:\s+la|\s+le|\s+les)?\s+|documentation\s+|docs?\s+|help center\s+|centre d[’']aide\s+|knowledge base\s+|base de connaissances\s+|welcome to\s+|accueil(?:\s+de)?\s+)/i;
const BRAND_NOISE_FRAGMENT_PATTERN =
  /\b(?:logo(?:\s+de|\s+du|\s+des|\s+of)?(?:\s+la|\s+le|\s+les)?|documentation|docs?|help center|centre d[’']aide|knowledge base|base de connaissances)\b/gi;
const INVALID_PAGE_TITLE_PATTERNS = [
  /\bjust a moment\b/i,
  /\battention required\b/i,
  /\baccess denied\b/i,
  /\bforbidden\b/i,
  /\bpage not found\b/i,
  /\b404\b/i,
  /\b403\b/i,
  /\b500\b/i,
  /\benable javascript\b/i,
  /\bverify you are human\b/i,
  /\bchecking your browser\b/i,
] as const;
const INVALID_PAGE_BODY_PATTERNS = [
  /\bcloudflare\b/i,
  /\bverify you are human\b/i,
  /\bchecking (?:if )?the site connection is secure\b/i,
  /\benable javascript(?: and cookies)? to continue\b/i,
  /\baccess denied\b/i,
  /\bpage not found\b/i,
  /\berror 404\b/i,
] as const;
const CONSENT_SHELL_PATTERNS = [
  /\bcookie(?:s)? settings\b/i,
  /\bmanage consent\b/i,
  /\bconsent preferences\b/i,
  /\bwe value your privacy\b/i,
  /\baccept all cookies\b/i,
] as const;
const LEGAL_OR_FOOTER_JUNK_PATTERN =
  /\b(?:conditions? générales?|conditions of use|conditions of sale|terms(?: of service| of use)?|privacy|politique(?: de)? confidentialité|confidentialité|mentions? légales?|cookies?|cookie policy|cgu|cgv|all rights reserved|copyright)\b/i;
const OPENING_HOURS_DAY_PATTERN =
  /\b(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|lun(?:di)?|mar(?:di)?|mer(?:credi)?|jeu(?:di)?|ven(?:dredi)?|sam(?:edi)?|dim(?:anche)?|monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i;
const OPENING_HOURS_TIME_PATTERN =
  /\b(?:\d{1,2}\s*(?:h|:)\s*\d{2}|\d{1,2}\s*h\b|24\s*[h:\/-]\s*24|24\/7|7j\/7|7j-?7|fermé|closed|ouvert|open)\b/i;
const OPENING_HOURS_NOISE_PATTERN =
  /\b(?:plombier|plomberie|services?|contact|avis|blog)\b/i;

type CrawlOptions = {
  useLlmExtraction?: boolean;
};

export async function crawlSite(url: string, options: CrawlOptions = {}): Promise<CrawlResult> {
  const useLlmExtraction = options.useLlmExtraction ?? true;
  const startTime = Date.now();
  
  // Normalize URL
  const normalizedUrl = await assertSafeExternalUrl(
    url.startsWith('http') ? url : `https://${url}`
  );
  const urlObj = new URL(normalizedUrl);
  const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;

  const homepagePromise = fetchPage(normalizedUrl, HOMEPAGE_FETCH_TIMEOUT_MS, HOMEPAGE_MAX_BYTES);
  const robotsPromise = crawlRobotsTxt(baseUrl);
  
  // Fetch homepage
  const homepage = await homepagePromise;
  const responseTime = Date.now() - startTime;
  const failedUrls: string[] = [];
  const truncatedUrls: string[] = [];
  const homepageFailed = isFailedPageFetch(homepage);
  const registerFetchOutcome = (fetchedUrl: string, page: FetchPageResult) => {
    const { truncated } = page;
    const failed = isFailedPageFetch(page);
    if (failed) {
      failedUrls.push(fetchedUrl);
      return;
    }

    if (truncated) {
      truncatedUrls.push(fetchedUrl);
    }
  };
  
  // Parse HTML
  const $ = cheerio.load(homepage.html || '');
  const homepageStructuredData = extractStructuredData($);
  const homepageSnapshot = extractPageSnapshot(
    normalizedUrl,
    $,
    homepage.html,
    baseUrl,
    homepageStructuredData
  );
  const faviconPromise = resolveFaviconAsset($, normalizedUrl, baseUrl);
  
  // Crawl robots.txt + sitemap in parallel while homepage is parsed
  const [robotsTxt, favicon] = await Promise.all([robotsPromise, faviconPromise]);
  const sitemap = await checkSitemap(baseUrl, robotsTxt.rawContent);

  if (homepageFailed) {
    const pages = [homepageSnapshot];
    const previewSignals = buildFreePreviewSignals(pages, sitemap.discoveredUrls || []);
    const businessInfo = sanitizeBusinessInfo(null);
    const canonicalFacts = buildCanonicalBusinessFacts(null, businessInfo, previewSignals);

    const result = {
      crawledAt: new Date().toISOString(),
      robotsTxt,
      sitemap,
      structuredData: {
        hasSchemaOrg: false,
        types: [],
        methods: [],
      },
      meta: {
        title: '',
        description: '',
        hasCanonical: false,
        language: '',
      },
      businessInfo,
      canonicalFacts,
      performance: {
        responseTime,
        isHttps: normalizedUrl.startsWith('https'),
        hasMobileViewport: homepageSnapshot.hasViewport,
      },
      crawlStatus: {
        homepageStatus: homepage.status,
        homepageFailed: true,
        subpageFailureCount: 0,
        failedFetchCount: 0,
        failedUrls,
        truncatedFetchCount: 0,
        truncatedUrls: [],
        crawlFailed: true,
        crawlPartial: false,
      },
      previewSignals,
      favicon,
    };

    logInfo('crawl_diagnostics', {
      phase: 'crawl',
      url: normalizedUrl,
      use_llm_extraction: useLlmExtraction,
      response_time_ms: responseTime,
      pages_crawled: pages.length,
      page_diagnostics: pages.map((page) => ({
        path: page.path,
        role: page.pageRole,
        invalid: page.isInvalidPage,
        invalid_reason: page.invalidReason,
        likely_spa_shell: page.likelySpaShell,
        text_length: page.textLength,
        schema_type_count: page.schemaTypes.length,
        has_viewport: page.hasViewport,
      })),
      homepage_failed: result.crawlStatus.homepageFailed,
      crawl_failed: result.crawlStatus.crawlFailed,
      crawl_partial: result.crawlStatus.crawlPartial,
      subpage_failure_count: result.crawlStatus.subpageFailureCount,
      failed_fetch_count: result.crawlStatus.failedFetchCount,
      truncated_fetch_count: result.crawlStatus.truncatedFetchCount,
      failed_urls: result.crawlStatus.failedUrls,
      truncated_urls: result.crawlStatus.truncatedUrls,
      robots_exists: robotsTxt.exists,
      robots_blocks: {
        gptbot: robotsTxt.blocksGPTBot,
        claudebot: robotsTxt.blocksClaude,
        perplexitybot: robotsTxt.blocksPerplexity,
        google_extended: robotsTxt.blocksGoogleExtended,
      },
      robots_preview: buildRobotsPreview(robotsTxt.rawContent),
      sitemap_exists: sitemap.exists,
      sitemap_url: sitemap.url,
      sitemap_page_count: sitemap.pageCount,
      sitemap_discovered_url_count: sitemap.discoveredUrls.length,
      sitemap_source: sitemap.source,
      structured_data_detected: false,
      structured_data_types: [],
      structured_data_methods: [],
      business_info_detected: {
        name: false,
        address: false,
        phone: false,
        email: false,
        opening_hours: false,
        service_count: 0,
        description: false,
      },
      preview_signals: {
        brand_detected: result.previewSignals.brandDetected,
        sector_detected: result.previewSignals.sectorDetected,
        city_detected: result.previewSignals.cityDetected,
        coherence_score: result.previewSignals.coherenceScore,
        opening_hours_detected: Boolean(result.previewSignals.openingHours),
        entities_understandable: result.previewSignals.entitiesUnderstandable,
        offer_identifiable: result.previewSignals.offerIdentifiable,
        replaceability_risk: result.previewSignals.replaceabilityRisk,
        structure_readable: result.previewSignals.structureReadable,
        titles_clear: result.previewSignals.titlesClear,
        descriptive_content: result.previewSignals.descriptiveContent,
      },
    });

    return result;
  }

  const discoveredCandidates = buildCrawlCandidates({
    homepageSnapshot,
    sitemapPaths: sitemap.discoveredUrls || [],
  });
  const initialSelection = selectAdditionalPaths({
    candidates: discoveredCandidates,
    maxPaths: INITIAL_ADDITIONAL_PAGE_BUDGET,
    existingPages: [homepageSnapshot],
  });

  const initialSnapshots: CrawledPageSnapshot[] = await Promise.all(
    initialSelection.map(async (path) => {
      const pageUrl = `${baseUrl}${path}`;
      const page = await fetchPage(
        pageUrl,
        ADDITIONAL_PAGE_FETCH_TIMEOUT_MS,
        ADDITIONAL_PAGE_MAX_BYTES
      );
      registerFetchOutcome(pageUrl, page);
      const page$ = cheerio.load(page.html || '');
      return extractPageSnapshot(pageUrl, page$, page.html, baseUrl);
    })
  );

  const secondarySelection = selectAdditionalPaths({
    candidates: discoveredCandidates,
    maxPaths: MAX_ADDITIONAL_PAGES,
    existingPages: [homepageSnapshot, ...initialSnapshots],
    alreadySelectedPaths: initialSelection,
  });
  const remainingPaths = secondarySelection.filter((path) => !initialSelection.includes(path));

  const secondarySnapshots: CrawledPageSnapshot[] = await Promise.all(
    remainingPaths.map(async (path) => {
      const pageUrl = `${baseUrl}${path}`;
      const page = await fetchPage(
        pageUrl,
        ADDITIONAL_PAGE_FETCH_TIMEOUT_MS,
        ADDITIONAL_PAGE_MAX_BYTES
      );
      registerFetchOutcome(pageUrl, page);
      const page$ = cheerio.load(page.html || '');
      return extractPageSnapshot(pageUrl, page$, page.html, baseUrl);
    })
  );

  const pages = [homepageSnapshot, ...initialSnapshots, ...secondarySnapshots];

  // Extract business info (LLM only for premium mode)
  const heuristicBusinessInfo = extractBusinessInfoHeuristic($, homepageStructuredData);
  const llmBusinessInfo = useLlmExtraction
    ? await extractBusinessInfo($, true, homepageStructuredData)
    : null;
  const previewSignals = buildFreePreviewSignals(pages, sitemap.discoveredUrls || []);
  const canonicalFacts = buildCanonicalBusinessFacts(
    llmBusinessInfo,
    heuristicBusinessInfo,
    previewSignals
  );
  const businessInfo = mergeBusinessInfo(
    llmBusinessInfo,
    heuristicBusinessInfo,
    previewSignals,
    canonicalFacts
  );

  // Extract meta/structured data from the scanned pages
  const allSchemaTypes = Array.from(
    new Set(pages.flatMap((page) => page.schemaTypes).filter(Boolean))
  );
  const structuredData = {
    hasSchemaOrg: allSchemaTypes.length > 0,
    types: allSchemaTypes,
    methods: Array.from(
      new Set(
        pages.flatMap((page) => page.schemaMethods || [])
      )
    ),
  };

  const meta = homepageSnapshot.isInvalidPage
    ? {
        title: '',
        description: '',
        hasCanonical: false,
        language: '',
      }
    : {
        title: homepageSnapshot.title,
        description: homepageSnapshot.metaDescription,
        hasCanonical: Boolean(homepageSnapshot.canonical),
        language: homepageSnapshot.language || '',
      };
  
  // Performance checks
  const performance = {
    responseTime,
    isHttps: normalizedUrl.startsWith('https'),
    hasMobileViewport: homepageSnapshot.hasViewport,
  };
  
  const result = {
    crawledAt: new Date().toISOString(),
    robotsTxt,
    sitemap,
    structuredData,
    meta,
    businessInfo,
    canonicalFacts,
    performance,
    crawlStatus: {
      homepageStatus: homepage.status,
      homepageFailed,
      subpageFailureCount: failedUrls.length,
      failedFetchCount: failedUrls.length,
      failedUrls,
      truncatedFetchCount: truncatedUrls.length,
      truncatedUrls,
      crawlFailed: homepageFailed,
      crawlPartial: failedUrls.length + truncatedUrls.length > 0,
    },
    previewSignals,
    favicon,
  };

  logInfo('crawl_diagnostics', {
    phase: 'crawl',
    url: normalizedUrl,
    use_llm_extraction: useLlmExtraction,
    response_time_ms: responseTime,
    pages_crawled: pages.length,
    page_diagnostics: pages.map((page) => ({
      path: page.path,
      role: page.pageRole,
      invalid: page.isInvalidPage,
      invalid_reason: page.invalidReason,
      likely_spa_shell: page.likelySpaShell,
      text_length: page.textLength,
      schema_type_count: page.schemaTypes.length,
      has_viewport: page.hasViewport,
    })),
    homepage_failed: result.crawlStatus.homepageFailed,
    crawl_failed: result.crawlStatus.crawlFailed,
    crawl_partial: result.crawlStatus.crawlPartial,
    subpage_failure_count: result.crawlStatus.subpageFailureCount,
    failed_fetch_count: result.crawlStatus.failedFetchCount,
    truncated_fetch_count: result.crawlStatus.truncatedFetchCount,
    failed_urls: result.crawlStatus.failedUrls,
    truncated_urls: result.crawlStatus.truncatedUrls,
    robots_exists: robotsTxt.exists,
    robots_blocks: {
      gptbot: robotsTxt.blocksGPTBot,
      claudebot: robotsTxt.blocksClaude,
      perplexitybot: robotsTxt.blocksPerplexity,
      google_extended: robotsTxt.blocksGoogleExtended,
    },
    robots_preview: buildRobotsPreview(robotsTxt.rawContent),
    sitemap_exists: sitemap.exists,
    sitemap_url: sitemap.url,
    sitemap_page_count: sitemap.pageCount,
    sitemap_discovered_url_count: sitemap.discoveredUrls.length,
    sitemap_source: sitemap.source,
    structured_data_detected: structuredData.hasSchemaOrg,
    structured_data_types: structuredData.types.slice(0, 15),
    structured_data_methods: structuredData.methods,
    business_info_detected: {
      name: result.businessInfo.name !== 'unknown',
      address: Boolean(result.businessInfo.address),
      phone: Boolean(result.businessInfo.phone),
      email: Boolean(result.businessInfo.email),
      opening_hours: Boolean(result.businessInfo.openingHours),
      service_count: result.businessInfo.services.length,
      description: Boolean(result.businessInfo.description),
    },
    preview_signals: {
      brand_detected: result.previewSignals.brandDetected,
      sector_detected: result.previewSignals.sectorDetected,
      city_detected: result.previewSignals.cityDetected,
      coherence_score: result.previewSignals.coherenceScore,
      opening_hours_detected: Boolean(result.previewSignals.openingHours),
      replaceability_risk: result.previewSignals.replaceabilityRisk,
      structure_readable: result.previewSignals.structureReadable,
      descriptive_content: result.previewSignals.descriptiveContent,
      entities_understandable: result.previewSignals.entitiesUnderstandable,
      offer_identifiable: result.previewSignals.offerIdentifiable,
      spa_likely: result.previewSignals.spaLikely,
      trust_pages: result.previewSignals.trustPages,
    },
  });

  return result;
}

function buildRobotsPreview(content: string): string[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.startsWith('#'))
    .slice(0, 12)
    .map((line) => line.slice(0, 140));
}

async function fetchPage(
  url: string,
  timeoutMs: number,
  maxBytes: number
): Promise<FetchPageResult> {
  try {
    const response = await safeFetchUrl(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IA-Check/1.0; +https://ia-check.com)',
      },
    }, {
      timeoutMs,
    });
    
    const { text, truncated } = await readTextWithLimit(response, maxBytes, {
      truncate: true,
    });
    return { html: text, status: response.status, truncated };
  } catch (error) {
    logWarn('crawl_page_fetch_error', {
      phase: 'crawl',
      error: error instanceof Error ? error.message : 'unknown_crawl_fetch_error',
    });
    return { html: '', status: 0, truncated: false };
  }
}

async function crawlRobotsTxt(baseUrl: string) {
  try {
    const response = await safeFetchUrl(
      `${baseUrl}/robots.txt`,
      undefined,
      { timeoutMs: STRUCTURED_FETCH_TIMEOUT_MS }
    );
    
    if (!response.ok) {
      logInfo('robots_probe_result', {
        phase: 'crawl',
        url: `${baseUrl}/robots.txt`,
        ok: false,
        status: response.status,
      });
      return {
        exists: false,
        blocksGPTBot: false,
        blocksClaude: false,
        blocksPerplexity: false,
        blocksGoogleExtended: false,
        rawContent: '',
        probeStatus: response.status,
        fetchError: null,
      };
    }
    
    const { text: content } = await readTextWithLimit(response, STRUCTURED_FILE_MAX_BYTES, {
      truncate: true,
    });
    
    // Check for AI bot blocks
    const blocksGPTBot = checkBotBlocked(content, 'GPTBot');
    const blocksClaude = checkBotBlocked(content, 'ClaudeBot') || checkBotBlocked(content, 'Claude-Web');
    const blocksPerplexity = checkBotBlocked(content, 'PerplexityBot');
    const blocksGoogleExtended = checkBotBlocked(content, 'Google-Extended');

    logInfo('robots_probe_result', {
      phase: 'crawl',
      url: `${baseUrl}/robots.txt`,
      ok: true,
      status: response.status,
      content_length: content.length,
      blocks: {
        gptbot: blocksGPTBot,
        claudebot: blocksClaude,
        perplexitybot: blocksPerplexity,
        google_extended: blocksGoogleExtended,
      },
      preview: buildRobotsPreview(content),
    });
    
    return {
      exists: true,
      blocksGPTBot,
      blocksClaude,
      blocksPerplexity,
      blocksGoogleExtended,
      rawContent: content,
      probeStatus: response.status,
      fetchError: null,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'unknown_robots_fetch_error';
    logWarn('robots_probe_failed', {
      phase: 'crawl',
      url: `${baseUrl}/robots.txt`,
      error: errorMessage,
    });
    return {
      exists: false,
      blocksGPTBot: false,
      blocksClaude: false,
      blocksPerplexity: false,
      blocksGoogleExtended: false,
      rawContent: '',
      probeStatus: null,
      fetchError: errorMessage,
    };
  }
}

function checkBotBlocked(robotsTxt: string, botName: string): boolean {
  const groups = parseRobotsGroups(robotsTxt);
  const matchingGroups = selectMatchingRobotsGroups(groups, botName);
  const rules = matchingGroups.flatMap((group) => group.rules);

  if (rules.length === 0) {
    return false;
  }

  const rootRule = resolveRobotsAccessForPath('/', rules);
  return rootRule === 'disallow';
}

function parseRobotsGroups(robotsTxt: string): Array<{
  userAgents: string[];
  rules: Array<{ directive: 'allow' | 'disallow'; path: string }>;
}> {
  const groups: Array<{
    userAgents: string[];
    rules: Array<{ directive: 'allow' | 'disallow'; path: string }>;
  }> = [];
  let currentGroup: {
    userAgents: string[];
    rules: Array<{ directive: 'allow' | 'disallow'; path: string }>;
  } | null = null;

  for (const rawLine of robotsTxt.split('\n')) {
    const trimmed = rawLine.replace(/#.*$/, '').trim();
    if (!trimmed) continue;

    const separatorIndex = trimmed.indexOf(':');
    if (separatorIndex < 0) continue;
    const directive = trimmed.slice(0, separatorIndex).trim().toLowerCase();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (directive === 'user-agent') {
      if (!currentGroup || currentGroup.rules.length > 0) {
        currentGroup = { userAgents: [], rules: [] };
        groups.push(currentGroup);
      }
      if (value) {
        currentGroup.userAgents.push(value.toLowerCase());
      }
      continue;
    }

    if (!currentGroup) continue;

    if (directive === 'allow' || directive === 'disallow') {
      currentGroup.rules.push({
        directive,
        path: value,
      });
    }
  }

  return groups;
}

function selectMatchingRobotsGroups(
  groups: Array<{
    userAgents: string[];
    rules: Array<{ directive: 'allow' | 'disallow'; path: string }>;
  }>,
  botName: string
) {
  const normalizedBot = botName.toLowerCase();
  let bestSpecificity = -1;
  let matchedGroups: typeof groups = [];

  for (const group of groups) {
    const specificity = group.userAgents.reduce((best, userAgent) => {
      if (userAgent === '*') return Math.max(best, 0);
      if (normalizedBot === userAgent || normalizedBot.startsWith(userAgent)) {
        return Math.max(best, userAgent.length);
      }
      return best;
    }, -1);

    if (specificity < 0) continue;
    if (specificity > bestSpecificity) {
      bestSpecificity = specificity;
      matchedGroups = [group];
      continue;
    }
    if (specificity === bestSpecificity) {
      matchedGroups.push(group);
    }
  }

  return matchedGroups;
}

function resolveRobotsAccessForPath(
  path: string,
  rules: Array<{ directive: 'allow' | 'disallow'; path: string }>
): 'allow' | 'disallow' {
  let bestRule: { directive: 'allow' | 'disallow'; path: string } | null = null;

  for (const rule of rules) {
    if (!rule.path) {
      continue;
    }
    if (!matchesRobotsPath(path, rule.path)) {
      continue;
    }
    if (
      !bestRule ||
      rule.path.length > bestRule.path.length ||
      (rule.path.length === bestRule.path.length &&
        rule.directive === 'allow' &&
        bestRule.directive === 'disallow')
    ) {
      bestRule = rule;
    }
  }

  return bestRule?.directive ?? 'allow';
}

function matchesRobotsPath(path: string, rulePath: string): boolean {
  if (!rulePath) return false;
  if (rulePath === '/') return true;
  if (rulePath.endsWith('$')) {
    return path === rulePath.slice(0, -1);
  }
  return path.startsWith(rulePath);
}

function buildSitemapCandidateUrls(
  baseUrl: string,
  robotsContent: string
): Array<{ url: string; source: 'default_path' | 'robots_txt' | 'both' }> {
  const defaultUrls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/sitemap-index.xml`,
    `${baseUrl}/sitemap.xml.gz`,
    `${baseUrl}/sitemap_index.xml.gz`,
    `${baseUrl}/sitemap-index.xml.gz`,
  ];
  const candidates = new Map<string, 'default_path' | 'robots_txt' | 'both'>();

  const register = (rawUrl: string, source: 'default_path' | 'robots_txt') => {
    try {
      const normalized = new URL(rawUrl, baseUrl).toString();
      const existing = candidates.get(normalized);
      if (!existing || existing === source) {
        candidates.set(normalized, source);
        return;
      }
      candidates.set(normalized, 'both');
    } catch {
      // Ignore invalid sitemap URL.
    }
  };

  defaultUrls.forEach((url) => register(url, 'default_path'));

  for (const line of robotsContent.split('\n')) {
    const trimmed = line.replace(/#.*$/, '').trim();
    if (!/^sitemap:/i.test(trimmed)) continue;
    const sitemapUrl = trimmed.slice(trimmed.indexOf(':') + 1).trim();
    if (sitemapUrl) {
      register(sitemapUrl, 'robots_txt');
    }
  }

  return Array.from(candidates.entries()).map(([url, source]) => ({ url, source }));
}

function decodeSitemapPayload(
  bytes: Uint8Array,
  url: string,
  contentTypeHeader: string | null
): string {
  const isGzip =
    /\.gz(?:$|\?)/i.test(url) ||
    /\bgzip\b/i.test(contentTypeHeader || '') ||
    (bytes[0] === 0x1f && bytes[1] === 0x8b);

  let decodedBytes = bytes;
  if (isGzip) {
    try {
      decodedBytes = gunzipSync(Buffer.from(bytes));
    } catch (error) {
      logWarn('sitemap_gunzip_failed', {
        phase: 'crawl',
        url,
        content_type: contentTypeHeader,
        error: error instanceof Error ? error.message : 'unknown_sitemap_gunzip_error',
      });
    }
  }

  return Buffer.from(decodedBytes).toString('utf8');
}

async function parseSitemapDocument(
  content: string,
  params: {
    baseUrl: string;
    source: 'default_path' | 'robots_txt' | 'both';
    visited: Set<string>;
    depth?: number;
  }
): Promise<{
  pageCount: number | null;
  discoveredUrls: string[];
  source: 'default_path' | 'robots_txt' | 'both';
}> {
  const { baseUrl, source, visited, depth = 0 } = params;
  const discoveredUrls = extractSitemapPaths(content, baseUrl);
  const directUrlCount = (content.match(/<url>/gi) || []).length;
  const nestedSitemapUrls = extractNestedSitemapUrls(content, baseUrl);

  if (nestedSitemapUrls.length === 0 || depth >= 2) {
    return {
      pageCount: directUrlCount > 0 ? directUrlCount : discoveredUrls.length || null,
      discoveredUrls,
      source,
    };
  }

  let nestedPageCount = directUrlCount;
  const nestedDiscoveredUrls = new Set(discoveredUrls);

  for (const sitemapUrl of nestedSitemapUrls) {
    if (visited.has(sitemapUrl)) continue;
    visited.add(sitemapUrl);

    try {
      const response = await safeFetchUrl(
        sitemapUrl,
        undefined,
        { timeoutMs: STRUCTURED_FETCH_TIMEOUT_MS }
      );
      if (!response.ok) continue;

      const { bytes } = await readBytesWithLimit(response, STRUCTURED_FILE_MAX_BYTES, {
        truncate: true,
      });
      const nestedContent = decodeSitemapPayload(
        bytes,
        sitemapUrl,
        response.headers.get('content-type')
      );
      const nested = await parseSitemapDocument(nestedContent, {
        baseUrl,
        source,
        visited,
        depth: depth + 1,
      });

      nested.pageCount && (nestedPageCount += nested.pageCount);
      nested.discoveredUrls.forEach((path) => nestedDiscoveredUrls.add(path));
    } catch {
      continue;
    }
  }

  return {
    pageCount: nestedPageCount > 0 ? nestedPageCount : nestedDiscoveredUrls.size || null,
    discoveredUrls: Array.from(nestedDiscoveredUrls).slice(0, 120),
    source,
  };
}

function extractNestedSitemapUrls(content: string, baseUrl: string): string[] {
  const base = new URL(baseUrl);
  const urls = new Set<string>();

  const $ = cheerio.load(content, { xmlMode: true });
  $('sitemap > loc').each((_, element) => {
    const rawLoc = $(element).text().trim();
    if (!rawLoc) return;

    try {
      const resolved = new URL(rawLoc, baseUrl);
      if (resolved.hostname !== base.hostname) return;
      urls.add(resolved.toString());
    } catch {
      // Ignore invalid nested sitemap URL.
    }
  });

  if (urls.size === 0) {
    const sitemapMatches = Array.from(
      content.matchAll(/<sitemap\b[^>]*>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/sitemap>/gi)
    );

    for (const match of sitemapMatches) {
      const rawLoc = (match[1] || '').trim();
      if (!rawLoc) continue;

      try {
        const resolved = new URL(rawLoc, baseUrl);
        if (resolved.hostname !== base.hostname) continue;
        urls.add(resolved.toString());
      } catch {
        continue;
      }
    }
  }

  return Array.from(urls).slice(0, 12);
}

async function checkSitemap(baseUrl: string, robotsContent = ''): Promise<SitemapCheckResult> {
  const sitemapCandidates = buildSitemapCandidateUrls(baseUrl, robotsContent);
  const visited = new Set<string>();
  const probes: NonNullable<SitemapCheckResult['probes']> = [];

  for (const candidate of sitemapCandidates) {
    try {
      const response = await safeFetchUrl(
        candidate.url,
        undefined,
        { timeoutMs: STRUCTURED_FETCH_TIMEOUT_MS }
      );
      logInfo('sitemap_probe_result', {
        phase: 'crawl',
        url: candidate.url,
        ok: response.ok,
        status: response.status,
      });
      probes.push({
        url: candidate.url,
        status: response.status,
        ok: response.ok,
        source: candidate.source,
      });
      if (response.ok) {
        const { bytes } = await readBytesWithLimit(response, STRUCTURED_FILE_MAX_BYTES, {
          truncate: true,
        });
        const content = decodeSitemapPayload(bytes, candidate.url, response.headers.get('content-type'));
        const parsed = await parseSitemapDocument(content, {
          baseUrl,
          source: candidate.source,
          visited,
        });
        logInfo('sitemap_probe_content', {
          phase: 'crawl',
          url: candidate.url,
          content_length: content.length,
          discovered_url_count: parsed.discoveredUrls.length,
          page_count: parsed.pageCount,
          source: parsed.source,
        });

        return {
          exists: true,
          url: candidate.url,
          pageCount: parsed.pageCount,
          discoveredUrls: parsed.discoveredUrls,
          source: parsed.source,
          probes,
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'unknown_sitemap_fetch_error';
      logWarn('sitemap_probe_failed', {
        phase: 'crawl',
        url: candidate.url,
        error: errorMessage,
      });
      probes.push({
        url: candidate.url,
        status: null,
        ok: false,
        error: errorMessage,
        source: candidate.source,
      });
    }
  }

  return {
    exists: false,
    url: null,
    pageCount: null,
    discoveredUrls: [],
    source: null,
    probes,
  };
}

async function resolveFaviconAsset(
  $: cheerio.CheerioAPI,
  pageUrl: string,
  baseUrl: string
) {
  const candidates = extractFaviconCandidates($, pageUrl, baseUrl).slice(0, MAX_FAVICON_CANDIDATES);

  for (const candidate of candidates) {
    try {
      if (candidate.url.startsWith('data:image/')) {
        return {
          url: null,
          dataUrl: candidate.url,
          mimeType: candidate.url.slice(5, candidate.url.indexOf(';') > 0 ? candidate.url.indexOf(';') : candidate.url.indexOf(',')),
        };
      }

      const response = await safeFetchUrl(
        candidate.url,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; IA-Check/1.0; +https://ia-check.com)',
            Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          },
        },
        {
          timeoutMs: FAVICON_FETCH_TIMEOUT_MS,
          maxRedirects: 3,
        }
      );

      if (!response.ok) {
        continue;
      }

      const mimeType = detectFaviconMimeType(response.headers.get('content-type'), candidate.url);
      if (!mimeType) {
        continue;
      }

      const { bytes } = await readBytesWithLimit(response, FAVICON_MAX_BYTES);
      if (!bytes.byteLength) {
        continue;
      }

      if (looksLikeHtmlPayload(bytes)) {
        continue;
      }

      return {
        url: candidate.url,
        dataUrl: `data:${mimeType};base64,${Buffer.from(bytes).toString('base64')}`,
        mimeType,
      };
    } catch {
      continue;
    }
  }

  return null;
}

function extractFaviconCandidates(
  $: cheerio.CheerioAPI,
  pageUrl: string,
  baseUrl: string
): FaviconCandidate[] {
  const deduped = new Map<string, FaviconCandidate>();

  $('link[href]').each((_, element) => {
    const rel = ($(element).attr('rel') || '').toLowerCase().trim();
    if (!rel || !rel.includes('icon')) {
      return;
    }

    const href = ($(element).attr('href') || '').trim();
    const resolvedUrl = normalizeFaviconHref(href, pageUrl);
    if (!resolvedUrl) {
      return;
    }

    const sizes = ($(element).attr('sizes') || '').trim().toLowerCase();
    const type = ($(element).attr('type') || '').trim().toLowerCase();
    const candidate: FaviconCandidate = {
      url: resolvedUrl,
      rel,
      sizes,
      type,
      score: scoreFaviconCandidate(rel, sizes, type, resolvedUrl),
    };

    const existing = deduped.get(resolvedUrl);
    if (!existing || existing.score < candidate.score) {
      deduped.set(resolvedUrl, candidate);
    }
  });

  const fallbackUrl = new URL('/favicon.ico', baseUrl).toString();
  if (!deduped.has(fallbackUrl)) {
    deduped.set(fallbackUrl, {
      url: fallbackUrl,
      rel: 'fallback',
      sizes: '',
      type: 'image/x-icon',
      score: 12,
    });
  }

  return [...deduped.values()].sort((left, right) => right.score - left.score);
}

function normalizeFaviconHref(href: string, pageUrl: string): string | null {
  if (!href) return null;
  if (href.startsWith('data:image/')) return href;
  if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return null;
  }

  try {
    const normalized = new URL(href, pageUrl).toString();
    return /^https?:\/\//i.test(normalized) ? normalized : null;
  } catch {
    return null;
  }
}

function scoreFaviconCandidate(rel: string, sizes: string, type: string, url: string): number {
  let score = 0;

  if (rel.includes('shortcut icon')) score += 100;
  else if (rel.includes('apple-touch-icon')) score += 88;
  else if (rel.includes('mask-icon')) score += 54;
  else if (rel.includes('icon')) score += 96;

  if (type.includes('svg')) score += 18;
  else if (type.includes('png')) score += 14;
  else if (type.includes('icon')) score += 10;

  if (/\bfavicon\b/i.test(url)) {
    score += 6;
  }

  if (sizes === 'any') {
    score += 8;
  } else {
    const parsedSizes = sizes
      .split(/\s+/)
      .map((value) => value.match(/^(\d+)x(\d+)$/i))
      .filter((value): value is RegExpMatchArray => Boolean(value))
      .map((value) => Number(value[1]))
      .filter((value) => Number.isFinite(value));

    if (parsedSizes.length > 0) {
      const closestSize = parsedSizes.reduce((best, current) => {
        const bestDistance = Math.abs(best - 48);
        const currentDistance = Math.abs(current - 48);
        return currentDistance < bestDistance ? current : best;
      }, parsedSizes[0]);

      score += Math.max(0, 16 - Math.abs(closestSize - 48));
    }
  }

  return score;
}

function detectFaviconMimeType(contentTypeHeader: string | null, url: string): string | null {
  const normalizedHeader = contentTypeHeader?.split(';')[0]?.trim().toLowerCase() || '';
  if (normalizedHeader.startsWith('image/')) {
    return normalizedHeader;
  }

  if (normalizedHeader === 'application/octet-stream') {
    const inferred = inferMimeTypeFromUrl(url);
    if (inferred) {
      return inferred;
    }
  }

  return inferMimeTypeFromUrl(url);
}

function inferMimeTypeFromUrl(url: string): string | null {
  const pathname = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  })();

  if (pathname.endsWith('.svg')) return 'image/svg+xml';
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.webp')) return 'image/webp';
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
  if (pathname.endsWith('.gif')) return 'image/gif';
  if (pathname.endsWith('.ico')) return 'image/x-icon';
  return null;
}

function looksLikeHtmlPayload(bytes: Uint8Array): boolean {
  const preview = new TextDecoder()
    .decode(bytes.slice(0, 256))
    .trim()
    .toLowerCase();

  return (
    preview.startsWith('<!doctype html') ||
    preview.startsWith('<html') ||
    preview.includes('<html')
  );
}

function extractStructuredData($: cheerio.CheerioAPI): ExtractedStructuredData {
  const scripts = $('script[type="application/ld+json"]');
  const types: string[] = [];
  const names: string[] = [];
  const addresses: string[] = [];
  const methods = new Set<'jsonld' | 'microdata' | 'rdfa'>();

  const formatPostalAddress = (record: Record<string, unknown>): string | null => {
    const parts = [
      record.streetAddress,
      record.addressLocality,
      record.postalCode,
      record.addressRegion,
      record.addressCountry,
    ]
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
      .map((v) => v.trim());
    return parts.length >= 2 ? parts.join(', ') : null;
  };

  const collectAddress = (value: unknown) => {
    if (typeof value === 'string' && value.trim().length >= 5) {
      addresses.push(value.trim());
      return;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const addressRecord = value as Record<string, unknown>;
      const formatted = formatPostalAddress(addressRecord);
      if (formatted) {
        addresses.push(formatted);
      }
    }
  };

  const collect = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(collect);
      return;
    }

    if (!node || typeof node !== 'object') {
      return;
    }

    const record = node as Record<string, unknown>;
    const rawType = record['@type'];
    const rawNames = [record.name, record.alternateName];
    const normalizedTypes = Array.isArray(rawType)
      ? rawType.filter((value): value is string => typeof value === 'string')
      : typeof rawType === 'string'
        ? [rawType]
        : [];

    normalizedTypes.forEach((type) => types.push(type));
    if (normalizedTypes.length > 0) {
      methods.add('jsonld');
    }

    const shouldCollectName =
      normalizedTypes.length === 0 ||
      normalizedTypes.some((type) =>
        /(organization|localbusiness|brand|website|softwareapplication|product|corporation)/i.test(
          type
        )
      );

    if (shouldCollectName) {
      rawNames.forEach((value) => {
        if (typeof value === 'string' && value.trim()) {
          names.push(value.trim());
        }
      });
    }

    if (record.address !== undefined) {
      collectAddress(record.address);
    }
    if (record.location !== undefined) {
      const loc = record.location;
      if (loc && typeof loc === 'object' && !Array.isArray(loc)) {
        const locRecord = loc as Record<string, unknown>;
        if (locRecord.address !== undefined) {
          collectAddress(locRecord.address);
        } else {
          collectAddress(loc);
        }
      } else if (typeof loc === 'string') {
        collectAddress(loc);
      }
    }

    Object.values(record).forEach((value) => {
      if (value && typeof value === 'object') {
        collect(value);
      }
    });
  };
  
  scripts.each((_, el) => {
    try {
      const content = $(el).html();
      if (content) {
        const data = JSON.parse(content);
        collect(data);
      }
    } catch {
      // Invalid JSON, skip
    }
  });

  $('[itemtype]').each((_, el) => {
    const itemType = ($(el).attr('itemtype') || '').trim();
    const extractedTypes = extractSchemaTypesFromAttribute(itemType);
    if (extractedTypes.length > 0) {
      methods.add('microdata');
      extractedTypes.forEach((type) => types.push(type));
    }
  });

  $('[typeof], [vocab]').each((_, el) => {
    const typeofValue = ($(el).attr('typeof') || '').trim();
    const vocabValue = ($(el).attr('vocab') || '').trim();
    const extractedTypes = extractSchemaTypesFromAttribute(typeofValue).concat(
      extractSchemaTypesFromAttribute(vocabValue)
    );
    if (extractedTypes.length > 0) {
      methods.add('rdfa');
      extractedTypes.forEach((type) => types.push(type));
    }
  });
  
  return {
    hasSchemaOrg: types.length > 0,
    types: Array.from(new Set(types)),
    names,
    addresses,
    methods: Array.from(methods),
  };
}

function extractSchemaTypesFromAttribute(value: string): string[] {
  if (!value) return [];

  return value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter(
      (part) =>
        /schema\.org/i.test(part) ||
        /^schema:/i.test(part)
    )
    .map((part) => {
      if (/^schema:/i.test(part)) {
        return part.split(':').pop() || '';
      }
      return part.split('/').filter(Boolean).pop() || '';
    })
    .map((part) => part.replace(/[#?].*$/, '').trim())
    .filter(Boolean);
}

async function extractBusinessInfo(
  $: cheerio.CheerioAPI,
  useLlmExtraction: boolean,
  structuredDataOverride?: ExtractedStructuredData
): Promise<BusinessInfo> {
  const title =
    $('title').text().replace(/\s+/g, ' ').trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    '';
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';
  const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
  const normalizedText = $('body').text().replace(/\s+/g, ' ').trim();
  const invalidPageReason = detectInvalidPageReason({
    title,
    metaDescription,
    h1,
    normalizedText,
  });

  if (invalidPageReason) {
    return sanitizeBusinessInfo(null);
  }

  if (!useLlmExtraction) {
    return extractBusinessInfoHeuristic($, structuredDataOverride);
  }

  const bodyText = normalizedText.substring(0, 4000);

  const footerText = $('footer, [role="contentinfo"], .footer, #footer')
    .first()
    .text()
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 1500);

  const addressTagText = $('address').map((_, el) => $(el).text().replace(/\s+/g, ' ').trim()).get().join(' | ').substring(0, 500);

  const structuredData = structuredDataOverride || extractStructuredData($);
  const jsonLdAddresses = structuredData.addresses.length > 0
    ? `Adresses trouvées dans les données structurées JSON-LD : ${structuredData.addresses.join(' | ')}`
    : '';

  const prompt = `Tu es un expert en extraction d'informations de contact depuis des pages web.
Extrais les informations suivantes. Retourne STRICTEMENT un objet JSON valide, sans texte avant/après, sans markdown.

RÈGLES POUR L'ADRESSE :
- Cherche l'adresse physique/postale complète du siège ou de l'établissement principal
- L'adresse peut se trouver dans le footer, une balise <address>, les données structurées, ou le corps de page
- Formats courants : "12 rue de la Paix, 75002 Paris", "123 Main St, City, ST 12345", etc.
- Si tu trouves un code postal et une ville, c'est probablement une adresse
- Si plusieurs adresses existent, choisis le siège principal
- Ne confonds PAS une adresse email avec une adresse postale

CONTENU DE LA PAGE :
${bodyText}
${footerText ? `\nFOOTER :\n${footerText}` : ''}
${addressTagText ? `\nBALISES <address> :\n${addressTagText}` : ''}
${jsonLdAddresses ? `\n${jsonLdAddresses}` : ''}

Format JSON attendu :
{
  "name": "nom de l'entreprise ou null",
  "address": "adresse physique complète ou null",
  "phone": "numéro de téléphone ou null",
  "email": "email ou null",
  "openingHours": "horaires d'ouverture ou null",
  "services": ["service1", "service2"],
  "description": "description courte de l'activité ou null"
}`;

  try {
    const result = await extractWithGPT(prompt);
    const parsed = parseJsonObject(result);

    return sanitizeBusinessInfo(parsed);
  } catch (error) {
    logWarn('crawl_business_info_extract_error', {
      phase: 'crawl',
      error: error instanceof Error ? error.message : 'unknown_business_extract_error',
    });
    return sanitizeBusinessInfo(null);
  }
}

function extractBusinessInfoHeuristic(
  $: cheerio.CheerioAPI,
  structuredDataOverride?: ExtractedStructuredData
): BusinessInfo {
  const title = $('title').text().trim();
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';
  const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
  const normalizedText = $('body').text().replace(/\s+/g, ' ').trim();
  const invalidPageReason = detectInvalidPageReason({
    title,
    metaDescription,
    h1,
    normalizedText,
  });

  if (invalidPageReason) {
    return {
      name: 'unknown',
      address: null,
      phone: null,
      email: null,
      openingHours: null,
      services: [],
      description: null,
    };
  }

  const structuredData = structuredDataOverride || extractStructuredData($);
  const siteName = selectBestBrandCandidate([
    $('meta[property="og:site_name"]').attr('content')?.trim() || null,
    $('meta[name="application-name"]').attr('content')?.trim() || null,
    $('meta[name="apple-mobile-web-app-title"]').attr('content')?.trim() || null,
    ...structuredData.names,
    splitTitleForName(title),
  ]);
  const description = metaDescription || null;
  const contactSearchText = buildVisibleContactText($, normalizedText);
  const emailMatch = extractEmailCandidateFromDocument($, contactSearchText);
  const phoneMatch = extractPhoneCandidate(contactSearchText);
  const addressMatch = extractAddressCandidate(normalizedText, $, structuredData.addresses);
  const openingHoursMatch = extractOpeningHoursCandidate($, normalizedText);

  const services = $('h2, h3')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter((text) => text.length >= 4 && text.length <= 80)
    .filter((text) => !looksLikeDynamicHeading(text))
    .slice(0, 6);

  return {
    name: siteName || splitTitleForName(title) || 'unknown',
    address: addressMatch,
    phone: phoneMatch,
    email: emailMatch,
    openingHours: openingHoursMatch,
    services,
    description,
  };
}

function looksLikeDynamicHeading(value: string): boolean {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return false;

  if (/[?？]/.test(normalized)) return true;
  if (/\b[\p{Lu}][\p{L}'’-]+\s+(?:vs\.?|x)\s+[\p{Lu}][\p{L}'’-]+\b/u.test(normalized)) return true;
  if (
    /\b(?:19|20)\d{2}\b.*\b(?:winner|winners|election|elections|tournament|tournaments|playoff|playoffs|championship|championships|primary|primaries|final|finale)\b/i.test(
      normalized
    )
  ) {
    return true;
  }

  const hasEventTerm =
    /\b(?:ceasefire|war|conflict|winner|winners|election|elections|tournament|tournaments|playoff|playoffs|championship|championships|primary|primaries|odds|poll|polls)\b/i.test(
      normalized
    );
  const hasTemporalTerm =
    /\b(?:breaking|latest|live|today|tonight|tomorrow|this week|this month|right now)\b/i.test(
      normalized
    );

  return hasEventTerm && hasTemporalTerm;
}

function cleanBrandNoise(value: string): string {
  return dedupeAdjacentTokens(
    value
      .replace(/([a-zà-ÿ])([A-ZÀ-Ÿ])/g, '$1 $2')
      .replace(/\.(?:fr|com|io|ai|net|org|app|co|dev)\b/gi, '')
      .replace(/\b(?:404|403|500)\b/gi, ' ')
      .replace(BRAND_NOISE_PREFIX_PATTERN, '')
      .replace(BRAND_NOISE_FRAGMENT_PATTERN, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
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

function detectInvalidPageReason(params: {
  title: string;
  metaDescription: string;
  h1: string;
  normalizedText: string;
}): string | null {
  const summary = [params.title, params.h1, params.metaDescription]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  const summaryLower = summary.toLowerCase();
  const bodyLower = params.normalizedText.toLowerCase();
  const combined = `${summaryLower} ${bodyLower}`.trim();

  if (
    INVALID_PAGE_TITLE_PATTERNS.some((pattern) => pattern.test(summaryLower)) ||
    INVALID_PAGE_BODY_PATTERNS.some((pattern) => pattern.test(combined))
  ) {
    return 'challenge_or_error';
  }

  const consentSignals = CONSENT_SHELL_PATTERNS.filter((pattern) => pattern.test(combined)).length;
  if (consentSignals >= 2 && params.normalizedText.length <= 1200) {
    return 'consent_shell';
  }

  return null;
}

function sanitizeBrandCandidate(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;

  const cleaned = value
    .replace(/\s+/g, ' ')
    .replace(/[“”"']/g, '')
    .trim();
  const normalized = cleanBrandNoise(cleaned);

  if (!normalized || normalized.length < 2 || normalized.length > 60) return null;
  if (GENERIC_BRAND_LABEL_PATTERN.test(normalized)) return null;
  if (INVALID_BRAND_LABEL_PATTERN.test(normalized)) return null;
  if (LEGAL_OR_FOOTER_JUNK_PATTERN.test(normalized)) return null;
  if (looksLikeDynamicHeading(normalized)) return null;

  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  if (wordCount > 6) return null;

  return normalized;
}

function normalizeBrandKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .toLowerCase();
}

function compareBrandCandidates(a: string, b: string): number {
  const wordCountDiff = a.split(/\s+/).length - b.split(/\s+/).length;
  if (wordCountDiff !== 0) return wordCountDiff;
  return a.length - b.length;
}

function selectBestBrandCandidate(candidates: Array<string | null | undefined>): string | null {
  const scored = new Map<string, { label: string; score: number }>();

  candidates.forEach((candidate) => {
    const cleaned = sanitizeBrandCandidate(candidate);
    if (!cleaned) return;

    const key = normalizeBrandKey(cleaned);
    if (!key) return;

    const current = scored.get(key);
    if (!current) {
      scored.set(key, { label: cleaned, score: 1 });
      return;
    }

    current.score += 1;
    if (compareBrandCandidates(cleaned, current.label) < 0) {
      current.label = cleaned;
    }
  });

  const best = Array.from(scored.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return compareBrandCandidates(a.label, b.label);
  });

  return best[0]?.label || null;
}

function sanitizeBusinessInfo(raw: unknown): BusinessInfo {
  const parsed = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

  const toText = (value: unknown): string | null =>
    typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

  return {
    name: toText(parsed.name) ?? 'unknown',
    address: toText(parsed.address),
    phone: toText(parsed.phone),
    email: toText(parsed.email),
    openingHours: normalizeOpeningHoursValue(toText(parsed.openingHours)),
    services: Array.isArray(parsed.services)
      ? parsed.services
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    description: toText(parsed.description),
  };
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

function splitTitleForName(title: string): string | null {
  if (!title) return null;
  const parts = title.split(/[\|\-•]/).map((part) => part.trim()).filter(Boolean);
  const candidates = parts
    .map((part) => sanitizeBrandCandidate(part))
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => compareBrandCandidates(a, b));

  return candidates[0] || null;
}

function extractPageSnapshot(
  pageUrl: string,
  $: cheerio.CheerioAPI,
  html: string,
  baseUrl: string,
  structuredDataOverride?: ExtractedStructuredData
): CrawledPageSnapshot {
  const urlObj = new URL(pageUrl);
  const path = normalizeInternalPath(urlObj.pathname) || '/';
  const title =
    $('title').text().replace(/\s+/g, ' ').trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    '';
  const structuredData = structuredDataOverride || extractStructuredData($);
  const brandHint = selectBestBrandCandidate([
    $('meta[property="og:site_name"]').attr('content')?.trim() || null,
    $('meta[name="application-name"]').attr('content')?.trim() || null,
    $('meta[name="apple-mobile-web-app-title"]').attr('content')?.trim() || null,
    ...structuredData.names,
    splitTitleForName(title),
  ]);
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="twitter:description"]').attr('content')?.trim() ||
    '';
  const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
  const canonical = $('link[rel="canonical"]').attr('href')?.trim() || null;
  const metaRobots = $('meta[name="robots"]').attr('content')?.trim() || null;
  const hasOpenGraph =
    $('meta[property^="og:"]').length > 0;
  const hasTwitterCard =
    $('meta[name^="twitter:"]').length > 0;
  const schemaTypes = structuredData.types;
  const language = $('html').attr('lang')?.trim() || '';
  const internalLinks = extractInternalLinks($, baseUrl);
  const hasViewport = $('meta[name="viewport"]').length > 0;
  const normalizedText = $('body').text().replace(/\s+/g, ' ').trim();
  const likelySpaShell = detectLikelySpaShell($, html, normalizedText.length);
  const invalidReason = detectInvalidPageReason({
    title,
    metaDescription,
    h1,
    normalizedText,
  });
  const pageRole = classifyPageRole({
    path,
    title,
    metaDescription,
    h1,
    schemaTypes,
    invalidReason,
  });

  const contactSearchText = buildVisibleContactText($, normalizedText);
  const detectedEmail = extractEmailCandidateFromDocument($, contactSearchText);
  const detectedPhone = extractPhoneCandidate(contactSearchText);
  const detectedAddress = extractAddressCandidate(normalizedText, $, structuredData.addresses);
  const detectedOpeningHours = extractOpeningHoursCandidate($, normalizedText);

  return {
    url: pageUrl,
    path,
    pageRole,
    title,
    brandHint: brandHint || null,
    isInvalidPage: Boolean(invalidReason),
    invalidReason,
    metaDescription,
    h1,
    canonical,
    metaRobots,
    hasOpenGraph,
    hasTwitterCard,
    schemaTypes,
    schemaMethods: structuredData.methods,
    language,
    internalLinks,
    detectedPhone,
    detectedEmail,
    detectedAddress,
    detectedOpeningHours,
    hasViewport,
    textLength: normalizedText.length,
    likelySpaShell,
  };
}

function classifyPageRole(params: {
  path: string;
  title: string;
  metaDescription: string;
  h1: string;
  schemaTypes: string[];
  invalidReason: string | null;
}): PageRole {
  if (params.invalidReason) return 'error';

  const path = normalizeInternalPath(params.path) || '/';
  if (path === '/') return 'home';

  const combined = [path, params.title, params.metaDescription, params.h1, params.schemaTypes.join(' ')]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (matchesRoleHints(path, 'legal') || /\b(?:privacy|terms|legal|cookies|mentions légales|confidentialité)\b/i.test(combined)) {
    return 'legal';
  }
  if (
    matchesRoleHints(path, 'docs') ||
    /\b(?:documentation|developer docs|api reference|reference|guides?|knowledge base)\b/i.test(combined)
  ) {
    return 'docs';
  }
  if (
    matchesRoleHints(path, 'faq') ||
    /\b(?:faq|support|help center|centre d'aide|questions fréquentes)\b/i.test(combined) ||
    params.schemaTypes.some((type) => /faqpage|qapage/i.test(type))
  ) {
    return 'faq';
  }
  if (
    matchesRoleHints(path, 'about') ||
    /\b(?:about us|à propos|who we are|our story|company|team|mission)\b/i.test(combined)
  ) {
    return 'about';
  }
  if (
    matchesRoleHints(path, 'pricing') ||
    /\b(?:pricing|tarifs?|plans?|abonnements?|subscription)\b/i.test(combined)
  ) {
    return 'pricing';
  }
  if (
    matchesRoleHints(path, 'services') ||
    /\b(?:services?|book(?:ing)?|réserver|prendre rendez-vous|appointment)\b/i.test(combined)
  ) {
    return 'services';
  }
  if (
    matchesRoleHints(path, 'product') ||
    /\b(?:product|products|features?|solutions?|platform|software|app)\b/i.test(combined) ||
    params.schemaTypes.some((type) => /softwareapplication|product/i.test(type))
  ) {
    return 'product';
  }
  if (
    matchesRoleHints(path, 'community') ||
    /\b(?:community|forum|discussion|questions|answers)\b/i.test(combined)
  ) {
    return 'community';
  }
  if (
    matchesRoleHints(path, 'jobs') ||
    /\b(?:jobs?|careers?|hiring|recrutement|recruter)\b/i.test(combined)
  ) {
    return 'jobs';
  }
  if (
    matchesRoleHints(path, 'contact') ||
    /\b(?:contact|find us|locations?|stores?)\b/i.test(combined)
  ) {
    return 'contact';
  }
  if (
    matchesRoleHints(path, 'directory') ||
    /\b(?:catalog|categories|collection|browse|marketplace|courses?)\b/i.test(combined) ||
    params.schemaTypes.some((type) => /itemlist|collectionpage/i.test(type))
  ) {
    return 'directory';
  }
  if (
    matchesRoleHints(path, 'blog_news') ||
    /\b(?:blog|news|press|article|articles|actualité|actualités)\b/i.test(combined)
  ) {
    return 'blog_news';
  }

  return 'generic';
}

function extractInternalLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const base = new URL(baseUrl);
  const links = new Set<string>();

  $('a[href]').each((_, el) => {
    const href = ($(el).attr('href') || '').trim();
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return;
    }

    try {
      const resolved = new URL(href, baseUrl);
      if (resolved.hostname !== base.hostname) return;
      const normalized = normalizeInternalPath(resolved.pathname);
      if (!normalized || normalized === '/') return;
      links.add(normalized);
    } catch {
      // Ignore invalid links.
    }
  });

  return Array.from(links).slice(0, 120);
}

function normalizeInternalPath(pathname: string): string | null {
  if (!pathname) return null;
  const trimmed = pathname.trim();
  if (!trimmed) return null;
  const noTrailingSlash = trimmed.length > 1 ? trimmed.replace(/\/+$/, '') : trimmed;
  return noTrailingSlash.toLowerCase();
}

function extractSitemapPaths(content: string, baseUrl: string): string[] {
  const base = new URL(baseUrl);
  const paths = new Set<string>();

  const $ = cheerio.load(content, { xmlMode: true });
  $('url > loc').each((_, element) => {
    const rawLoc = $(element).text().trim();
    if (!rawLoc) return;

    try {
      const resolved = new URL(rawLoc, baseUrl);
      if (resolved.hostname !== base.hostname) return;
      if (/\.xml(?:\.gz)?$/i.test(resolved.pathname)) return;
      const normalized = normalizeInternalPath(resolved.pathname);
      if (!normalized || normalized === '/') return;
      paths.add(normalized);
    } catch {
      // Ignore invalid sitemap URL.
    }
  });

  if (paths.size === 0) {
    const urlMatches = Array.from(
      content.matchAll(/<url\b[^>]*>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/gi)
    );

    for (const match of urlMatches) {
      const rawLoc = (match[1] || '').trim();
      if (!rawLoc) continue;

      try {
        const resolved = new URL(rawLoc, baseUrl);
        if (resolved.hostname !== base.hostname) continue;
        if (/\.xml(?:\.gz)?$/i.test(resolved.pathname)) continue;
        const normalized = normalizeInternalPath(resolved.pathname);
        if (!normalized || normalized === '/') continue;
        paths.add(normalized);
      } catch {
        // Ignore invalid sitemap URL.
      }
    }
  }

  return Array.from(paths).slice(0, 120);
}

function buildCrawlCandidates(params: {
  homepageSnapshot: CrawledPageSnapshot;
  sitemapPaths: string[];
}): CrawlCandidate[] {
  const pathSources = new Map<string, CrawlCandidate['source']>();
  const mergeSource = (current: CrawlCandidate['source'] | undefined, next: CrawlCandidate['source']): CrawlCandidate['source'] => {
    if (!current || current === next) return next;
    return 'both';
  };

  params.homepageSnapshot.internalLinks.forEach((path) => {
    const normalized = normalizeInternalPath(path);
    if (!normalized || normalized === '/') return;
    pathSources.set(normalized, mergeSource(pathSources.get(normalized), 'homepage'));
  });

  params.sitemapPaths.forEach((path) => {
    const normalized = normalizeInternalPath(path);
    if (!normalized || normalized === '/') return;
    pathSources.set(normalized, mergeSource(pathSources.get(normalized), 'sitemap'));
  });

  return Array.from(pathSources.entries())
    .filter(([path]) => !shouldRejectCandidatePath(path))
    .map(([path, source]) => scoreCrawlCandidate(path, source))
    .sort((a, b) => b.score - a.score || a.depth - b.depth || a.path.length - b.path.length)
    .slice(0, 80);
}

function selectAdditionalPaths(params: {
  candidates: CrawlCandidate[];
  maxPaths: number;
  existingPages: CrawledPageSnapshot[];
  alreadySelectedPaths?: string[];
}): string[] {
  const { candidates, maxPaths, existingPages, alreadySelectedPaths = [] } = params;
  const selected = new Set<string>(alreadySelectedPaths);
  const existingRoles = new Set(existingPages.map((page) => page.pageRole));
  const adaptiveRoleOrder = buildAdaptiveRolePriority(candidates, existingPages);
  const candidateMap = new Map(candidates.map((candidate) => [candidate.path, candidate]));
  const availableCandidates = candidates.filter((candidate) => !selected.has(candidate.path));

  for (const role of adaptiveRoleOrder) {
    if (selected.size >= maxPaths) break;
    if (existingRoles.has(role)) continue;

    const candidate = availableCandidates.find(
      (entry) => !selected.has(entry.path) && entry.roleHint === role
    );
    if (candidate) {
      selected.add(candidate.path);
    }
  }

  const sortedRemaining = candidates
    .filter((candidate) => !selected.has(candidate.path))
    .sort((a, b) => {
      const aRoleGap = existingRoles.has(a.roleHint) ? 0 : 1;
      const bRoleGap = existingRoles.has(b.roleHint) ? 0 : 1;
      if (aRoleGap !== bRoleGap) return bRoleGap - aRoleGap;
      return b.score - a.score || a.depth - b.depth;
    });

  for (const candidate of sortedRemaining) {
    if (selected.size >= maxPaths) break;
    selected.add(candidate.path);
    const selectedCandidate = candidateMap.get(candidate.path);
    if (selectedCandidate) {
      existingRoles.add(selectedCandidate.roleHint);
    }
  }

  return Array.from(selected).slice(0, maxPaths);
}

function buildAdaptiveRolePriority(
  candidates: CrawlCandidate[],
  existingPages: CrawledPageSnapshot[]
): PageRole[] {
  const weights = new Map<PageRole, number>();

  ROLE_SELECTION_BASE_ORDER.forEach((role, index) => {
    weights.set(role, Math.max(10, 40 - index * 3));
  });

  existingPages.forEach((page) => {
    const pageWeight = weights.get(page.pageRole) || 0;
    weights.set(page.pageRole, pageWeight + 8);
  });

  candidates.forEach((candidate) => {
    const candidateWeight = weights.get(candidate.roleHint) || 0;
    weights.set(candidate.roleHint, candidateWeight + Math.max(1, Math.round(candidate.score / 20)));
  });

  return Array.from(new Set([...ROLE_SELECTION_BASE_ORDER, ...HIGH_VALUE_ROLES]))
    .filter((role) => role !== 'generic' && role !== 'error' && role !== 'legal' && role !== 'blog_news')
    .sort((a, b) => (weights.get(b) || 0) - (weights.get(a) || 0));
}

function scoreCrawlCandidate(
  path: string,
  source: CrawlCandidate['source']
): CrawlCandidate {
  const roleHint = inferRoleFromPath(path);
  const depth = path.split('/').filter(Boolean).length;
  const sourceBonus = source === 'both' ? 18 : source === 'homepage' ? 12 : 6;
  const roleWeight = getRoleSelectionWeight(roleHint);
  const lengthBonus = Math.max(0, 14 - path.length / 8);
  const depthPenalty = Math.max(0, (depth - 2) * 5);
  const queryPenalty = path.includes('?') ? 12 : 0;
  const rolePenalty = LOW_SIGNAL_ROLE_PENALTIES[roleHint] || 0;

  const score = Math.round(roleWeight + sourceBonus + lengthBonus - depthPenalty - queryPenalty - rolePenalty);

  return {
    path,
    roleHint,
    score,
    depth,
    source,
  };
}

function getRoleSelectionWeight(role: PageRole): number {
  switch (role) {
    case 'about':
      return 88;
    case 'pricing':
      return 84;
    case 'services':
      return 82;
    case 'product':
      return 80;
    case 'docs':
      return 78;
    case 'faq':
      return 70;
    case 'contact':
      return 68;
    case 'directory':
      return 66;
    case 'community':
      return 62;
    case 'jobs':
      return 48;
    case 'blog_news':
      return 30;
    case 'legal':
      return 10;
    case 'generic':
      return 36;
    case 'error':
      return 0;
    case 'home':
      return 0;
  }
}

function inferRoleFromPath(path: string): PageRole {
  if (path === '/') return 'home';

  for (const [role, patterns] of Object.entries(PAGE_ROLE_PATH_HINTS) as Array<
    [Exclude<PageRole, 'home' | 'generic' | 'error'>, readonly string[]]
  >) {
    if (patterns.some((pattern) => isPathMatch(path, pattern))) {
      return role;
    }
  }

  return 'generic';
}

function shouldRejectCandidatePath(path: string): boolean {
  return PATH_REJECTION_PATTERNS.some((pattern) => pattern.test(path));
}

function matchesRoleHints(
  path: string,
  role: Exclude<PageRole, 'home' | 'generic' | 'error'>
): boolean {
  return PAGE_ROLE_PATH_HINTS[role].some((pattern) => isPathMatch(path, pattern));
}

function isPathMatch(path: string, pattern: string): boolean {
  return path === pattern || path.startsWith(`${pattern}/`);
}

function buildFreePreviewSignals(
  pages: CrawledPageSnapshot[],
  sitemapDiscoveredUrls: string[]
): FreePreviewSignals {
  const usablePages = pages.filter((page) => !page.isInvalidPage);
  const signalEvidencePages = usablePages.filter(
    (page) =>
      page.path === '/' ||
      HIGH_VALUE_ROLES.includes(page.pageRole) ||
      page.pageRole === 'about' ||
      page.pageRole === 'pricing' ||
      page.pageRole === 'services' ||
      page.pageRole === 'product' ||
      page.pageRole === 'docs' ||
      page.pageRole === 'contact'
  );
  const signalPages = signalEvidencePages.length > 0 ? signalEvidencePages : usablePages;
  const spaLikely = Boolean(signalPages[0]?.likelySpaShell);
  const allPaths = new Set<string>();
  const allInternalLinks = new Set<string>();
  signalPages.forEach((page) => {
    allPaths.add(page.path);
    page.internalLinks.forEach((link) => allInternalLinks.add(link));
  });
  sitemapDiscoveredUrls.forEach((path) => {
    const normalized = normalizeInternalPath(path);
    if (normalized) allPaths.add(normalized);
  });
  allInternalLinks.forEach((link) => allPaths.add(link));

  const hasPath = (patterns: readonly string[]) =>
    Array.from(allPaths).some((path) => patterns.some((pattern) => isPathMatch(path, pattern)));

  const trustPages = {
    about: hasPath(TRUST_PAGE_PATTERNS.about),
    contact: hasPath(TRUST_PAGE_PATTERNS.contact),
    faq: hasPath(TRUST_PAGE_PATTERNS.faq),
    tarifs: hasPath(TRUST_PAGE_PATTERNS.tarifs),
    confidentialite: hasPath(TRUST_PAGE_PATTERNS.confidentialite),
    cgu: hasPath(TRUST_PAGE_PATTERNS.cgu),
  };

  const brandDetected = selectBestBrandCandidate([
    ...signalPages.map((page) => page.brandHint),
    ...signalPages.map((page) => splitTitleForName(page.title)),
  ]);

  const phoneValues = signalPages.map((page) => page.detectedPhone).filter((value): value is string => Boolean(value));
  const emailValues = signalPages.map((page) => page.detectedEmail).filter((value): value is string => Boolean(value));
  const addressValues = signalPages.map((page) => page.detectedAddress).filter((value): value is string => Boolean(value));
  const openingHoursValues = signalPages
    .map((page) => page.detectedOpeningHours)
    .filter((value): value is string => Boolean(value));

  const phone = resolveBestText(phoneValues);
  const email = resolveBestText(emailValues);
  const address = resolveBestText(addressValues);
  const openingHours = resolveBestText(openingHoursValues);
  const cityDetected = extractCityFromAddress(address);

  const heuristicSector = detectSector({
    name: brandDetected,
    description: signalPages.map((page) => page.metaDescription).join(' '),
    services: signalPages
      .map((page) => page.h1)
      .filter(Boolean),
  });
  const sectorDetected = heuristicSector;

  const uniqueCount = (values: string[]) => new Set(values.map((value) => value.toLowerCase())).size;
  const coherenceChecks = [
    phoneValues.length <= 1 || uniqueCount(phoneValues) === 1,
    emailValues.length <= 1 || uniqueCount(emailValues) === 1,
    addressValues.length <= 1 || uniqueCount(addressValues) === 1,
  ];
  const coherenceScore = Math.round(
    (coherenceChecks.filter(Boolean).length / coherenceChecks.length) * 100
  );

  const structureReadable =
    spaLikely
      ? signalPages.filter((page) => page.title.length > 0).length >= 1
      : signalPages.filter((page) => page.title.length > 0 && page.h1.length > 0).length >= 1;
  const titlesClear =
    signalPages.filter((page) => page.title.length >= 20 && page.title.length <= 90).length >= 1;
  const descriptiveContent =
    spaLikely
      ? signalPages.some((page) => page.metaDescription.length >= 70 || page.textLength >= 160)
      : signalPages.filter((page) => page.metaDescription.length >= 70 || page.textLength >= 450).length >= 2;
  const minimalInternalLinking = allInternalLinks.size >= 6;
  const entitiesUnderstandable =
    Boolean(brandDetected) &&
    (Boolean(sectorDetected) || signalPages.some((page) => page.schemaTypes.length > 0 || page.hasOpenGraph));
  const offerIdentifiable =
    signalPages.some((page) => page.h1.length >= 8) ||
    signalPages.some((page) => page.metaDescription.length >= (spaLikely ? 70 : 120));

  const trustCoverage =
    Object.values(trustPages).filter(Boolean).length;
  let replaceabilityRisk: FreePreviewSignals['replaceabilityRisk'] =
    trustCoverage <= 1 || (!offerIdentifiable && !entitiesUnderstandable)
      ? 'high'
      : trustCoverage <= 3
        ? 'medium'
        : 'low';

  if (spaLikely && replaceabilityRisk === 'high') {
    replaceabilityRisk = 'medium';
  }

  return {
    fetchedUrls: pages.map((page) => page.url),
    pages,
    trustPages,
    brandDetected,
    sectorDetected,
    cityDetected,
    phone,
    email,
    address,
    openingHours,
    coherenceScore,
    structureReadable,
    titlesClear,
    descriptiveContent,
    minimalInternalLinking,
    entitiesUnderstandable,
    offerIdentifiable,
    replaceabilityRisk,
    spaLikely,
  };
}

function resolveBestText(values: string[]): string | null {
  if (values.length === 0) return null;
  const counts = new Map<string, number>();
  values.forEach((value) => {
    const normalized = value.trim();
    if (!normalized) return;
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  });
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || null;
}

function extractCityFromAddress(address: string | null): string | null {
  if (!address) return null;
  const normalized = address
    .replace(/([a-zà-ÿ-])([A-ZÀ-Ÿ])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
  const zipMatch = normalized.match(/\d{5}\s+([A-Za-zÀ-ÿ\s'-]+)/);
  if (zipMatch?.[1]) {
    return sanitizeCityCandidate(zipMatch[1]);
  }
  const parts = normalized.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.length > 1 ? sanitizeCityCandidate(parts[parts.length - 1]) : null;
}

function sanitizeCityCandidate(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;

  const cleaned = value
    .replace(LEGAL_OR_FOOTER_JUNK_PATTERN, '')
    .replace(/[|•/].*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || /\d/.test(cleaned)) return null;

  const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
  if (wordCount > 5) return null;

  return cleaned;
}

function mergeBusinessInfo(
  llmBusinessInfo: BusinessInfo | null,
  heuristicBusinessInfo: BusinessInfo,
  previewSignals: FreePreviewSignals,
  canonicalFacts: CanonicalBusinessFacts
): BusinessInfo {
  const name = llmBusinessInfo?.name && llmBusinessInfo.name !== 'unknown'
    ? llmBusinessInfo.name
    : previewSignals.brandDetected || heuristicBusinessInfo.name || 'unknown';

  const mergedDescription = llmBusinessInfo?.description || heuristicBusinessInfo.description || null;
  const mergedServices = llmBusinessInfo?.services?.length
    ? llmBusinessInfo.services
    : heuristicBusinessInfo.services;

  return {
    name,
    address: canonicalFacts.address.value,
    phone: canonicalFacts.phone.value,
    email: canonicalFacts.email.value,
    openingHours: canonicalFacts.openingHours.value,
    services: mergedServices || [],
    description: mergedDescription,
  };
}

function buildCanonicalBusinessFacts(
  llmBusinessInfo: BusinessInfo | null,
  heuristicBusinessInfo: BusinessInfo,
  previewSignals: FreePreviewSignals
): CanonicalBusinessFacts {
  const address = pickCanonicalFact([
    createCanonicalFact(previewSignals.address, 'preview', 'high'),
    createCanonicalFact(llmBusinessInfo?.address, 'llm', 'medium'),
    createCanonicalFact(heuristicBusinessInfo.address, 'heuristic', 'medium'),
  ]);

  const phone = pickCanonicalFact([
    createCanonicalFact(previewSignals.phone, 'preview', 'high'),
    createCanonicalFact(llmBusinessInfo?.phone, 'llm', 'medium'),
    createCanonicalFact(heuristicBusinessInfo.phone, 'heuristic', 'medium'),
  ]);

  const email = pickCanonicalFact([
    createCanonicalFact(previewSignals.email, 'preview', 'high'),
    createCanonicalFact(llmBusinessInfo?.email, 'llm', 'medium'),
    createCanonicalFact(heuristicBusinessInfo.email, 'heuristic', 'medium'),
  ]);

  const openingHours = pickCanonicalFact([
    createCanonicalFact(normalizeOpeningHoursValue(previewSignals.openingHours), 'preview', 'high'),
    createCanonicalFact(normalizeOpeningHoursValue(llmBusinessInfo?.openingHours || null), 'llm', 'medium'),
    createCanonicalFact(normalizeOpeningHoursValue(heuristicBusinessInfo.openingHours), 'heuristic', 'low'),
  ]);

  const cityValue = extractExpectedCityFromAddress(address.value);
  const city = createCanonicalFact(
    cityValue,
    cityValue ? 'derived' : null,
    cityValue ? deriveConfidenceFromFact(address, 'medium') : null
  );

  return {
    address,
    phone,
    email,
    openingHours,
    city,
  };
}

function createCanonicalFact(
  value: string | null | undefined,
  source: BusinessFactSource | null,
  confidence: BusinessFactConfidence | null
): CanonicalBusinessFact {
  const cleanedValue = typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  return {
    value: cleanedValue,
    source: cleanedValue ? source : null,
    confidence: cleanedValue ? confidence : null,
    evidence: cleanedValue,
  };
}

function pickCanonicalFact(candidates: CanonicalBusinessFact[]): CanonicalBusinessFact {
  return candidates.find((candidate) => candidate.value) || {
    value: null,
    source: null,
    confidence: null,
    evidence: null,
  };
}

function deriveConfidenceFromFact(
  fact: CanonicalBusinessFact,
  fallback: BusinessFactConfidence
): BusinessFactConfidence {
  return fact.confidence || fallback;
}

function extractEmailCandidate(content: string): string | null {
  const match = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/)?.[0]?.trim() || null;
  if (!match || /[{[]/.test(match)) {
    return null;
  }
  return match;
}

function extractEmailCandidateFromDocument(
  $: cheerio.CheerioAPI,
  normalizedText: string
): string | null {
  const mailtoMatch = $('a[href^="mailto:"]')
    .map((_, el) => {
      const href = ($(el).attr('href') || '').trim();
      if (!href) return null;

      const rawValue = href
        .replace(/^mailto:/i, '')
        .split('?')[0]
        .trim();
      if (!rawValue) return null;

      try {
        return decodeURIComponent(rawValue);
      } catch {
        return rawValue;
      }
    })
    .get()
    .map((value) => extractEmailCandidate(value))
    .find((value): value is string => Boolean(value));

  if (mailtoMatch) {
    return mailtoMatch;
  }

  const addressText = $('address')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get()
    .join(' ');
  const addressMatch = extractEmailCandidate(addressText);
  if (addressMatch) {
    return addressMatch;
  }

  return extractEmailCandidate(normalizedText);
}

function buildVisibleContactText(
  $: cheerio.CheerioAPI,
  normalizedText: string
): string {
  const footerText = $('footer, [role="contentinfo"], .footer, #footer')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get()
    .join(' ');
  const addressText = $('address')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get()
    .join(' ');

  return [normalizedText, footerText, addressText]
    .filter(Boolean)
    .join('\n')
    .trim();
}

function extractOpeningHoursCandidate(
  $: cheerio.CheerioAPI,
  normalizedText: string
): string | null {
  const candidates = new Set<string>();
  extractStructuredOpeningHoursCandidates($).forEach((candidate) => candidates.add(candidate));
  const selectorTexts = [
    'footer',
    'address',
    '[class*="horaire"]',
    '[class*="hours"]',
    '[id*="horaire"]',
    '[id*="hours"]',
    '[aria-label*="horaire"]',
    '[aria-label*="hours"]',
    '[itemprop*="openingHours"]',
    '[itemprop*="hours"]',
  ];

  selectorTexts.forEach((selector) => {
    $(selector).each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text) candidates.add(text);
    });
  });

  const scopedFallbackMatches = normalizedText.match(
    /((?:horaires?|hours?|ouvert(?:ure)?|open(?:ing)?)[^\.]{0,140})/gi
  ) || [];
  scopedFallbackMatches.forEach((match) => candidates.add(match));

  for (const candidate of candidates) {
    const normalized = normalizeOpeningHoursValue(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function normalizeOpeningHoursValue(value: string | null): string | null {
  if (!value) return null;
  const normalized = value
    .replace(/\s+/g, ' ')
    .replace(/\b(?:opening hours?|business hours?|horaires?\s*:?)\b/gi, '')
    .replace(/^[\s:;-]+|[\s:;-]+$/g, '')
    .trim();
  if (!normalized) return null;
  if (normalized.length < 6 || normalized.length > 120) return null;
  if (!OPENING_HOURS_TIME_PATTERN.test(normalized)) return null;
  if (!OPENING_HOURS_DAY_PATTERN.test(normalized) && !/\b(?:24\/7|24\s*[h:\/-]\s*24|7j\/7|7j-?7)\b/i.test(normalized)) {
    return null;
  }
  if (OPENING_HOURS_NOISE_PATTERN.test(normalized) && !OPENING_HOURS_TIME_PATTERN.test(normalized)) {
    return null;
  }

  const lowercaseWords = normalized.toLowerCase().split(/\s+/);
  const noiseHits = lowercaseWords.filter((word) => OPENING_HOURS_NOISE_PATTERN.test(word)).length;
  if (noiseHits >= 3) return null;

  return normalized;
}

function extractStructuredOpeningHoursCandidates($: cheerio.CheerioAPI): string[] {
  const candidates = new Set<string>();

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).html();
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      collectStructuredOpeningHours(parsed, candidates);
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  });

  return Array.from(candidates);
}

function collectStructuredOpeningHours(node: unknown, candidates: Set<string>): void {
  if (!node) return;

  if (Array.isArray(node)) {
    node.forEach((item) => collectStructuredOpeningHours(item, candidates));
    return;
  }

  if (typeof node !== 'object') {
    if (typeof node === 'string' && node.trim()) {
      candidates.add(node.trim());
    }
    return;
  }

  const record = node as Record<string, unknown>;

  const openingHours = record.openingHours;
  if (typeof openingHours === 'string' && openingHours.trim()) {
    candidates.add(openingHours.trim());
  } else if (Array.isArray(openingHours)) {
    openingHours.forEach((value) => {
      if (typeof value === 'string' && value.trim()) {
        candidates.add(value.trim());
      }
    });
  }

  const specs = [
    record.openingHoursSpecification,
    record.hoursAvailable,
  ];

  specs.forEach((spec) => {
    if (Array.isArray(spec)) {
      spec.forEach((item) => appendOpeningHoursSpecification(item, candidates));
      return;
    }
    appendOpeningHoursSpecification(spec, candidates);
  });

  Object.values(record).forEach((value) => {
    if (value && typeof value === 'object') {
      collectStructuredOpeningHours(value, candidates);
    }
  });
}

function appendOpeningHoursSpecification(
  specification: unknown,
  candidates: Set<string>
): void {
  if (!specification || typeof specification !== 'object' || Array.isArray(specification)) {
    return;
  }

  const record = specification as Record<string, unknown>;
  const rawDays = record.dayOfWeek;
  const opens = typeof record.opens === 'string' ? record.opens.trim() : null;
  const closes = typeof record.closes === 'string' ? record.closes.trim() : null;
  const dayValues = Array.isArray(rawDays)
    ? rawDays
    : rawDays
      ? [rawDays]
      : [];
  const days = dayValues
    .map((value) => {
      if (typeof value !== 'string') return null;
      const day = value.split('/').filter(Boolean).pop() || value;
      return day.trim();
    })
    .filter((value): value is string => Boolean(value));

  const normalizedDays = days.join(', ');
  if (normalizedDays && opens && closes) {
    candidates.add(`${normalizedDays}: ${opens} - ${closes}`);
    return;
  }

  if (normalizedDays && opens) {
    candidates.add(`${normalizedDays}: ${opens}`);
    return;
  }

  if (opens && closes) {
    candidates.add(`${opens} - ${closes}`);
  }
}

function extractExpectedCityFromAddress(address: string | null): string | null {
  if (!address) return null;

  const normalized = address.replace(/\s+/g, ' ').trim();
  if (!normalized) return null;

  const segments = normalized
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean);

  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const segment = segments[i];
    const postalMatch = segment.match(/\b\d{4,5}\s+([A-Za-zÀ-ÿ'’\-\s]+)\b/u);
    if (postalMatch?.[1]) {
      return postalMatch[1].trim();
    }
    if (i > 0 && /^\d{4,5}$/.test(segment) && segments[i + 1]) {
      return segments[i + 1];
    }
  }

  return null;
}

function extractPhoneCandidate(content: string): string | null {
  const frenchPhone = content.match(/(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4}/)?.[0]?.trim();
  if (frenchPhone) return frenchPhone;

  const candidates =
    content.match(/(?:\+\d{1,3}[\s().\-]*)?(?:\(?\d{1,4}\)?[\s().\-]*){2,6}\d{2,4}/g) || [];

  for (const candidate of candidates) {
    const trimmed = candidate.trim();
    const digits = trimmed.replace(/\D/g, '');
    const separators = (trimmed.match(/[\s().\-]/g) || []).length;
    if (digits.length < 8 || digits.length > 15) continue;
    if (!trimmed.includes('+') && separators < 2) continue;
    if (/^\d+$/.test(trimmed) && digits.length <= 10) continue;
    return trimmed;
  }

  return null;
}

function isFailedPageFetch(page: FetchPageResult): boolean {
  return page.status === 0 || page.status >= 400 || !page.html.trim();
}

function extractAddressFromSemanticHtml($: cheerio.CheerioAPI): string | null {
  // 1. <address> HTML tag
  const addressTag = $('address').first().text().replace(/\s+/g, ' ').trim();
  if (addressTag && addressTag.length >= 8 && addressTag.length <= 300) {
    const cleaned = addressTag.replace(/\n/g, ', ').replace(/\s{2,}/g, ' ').trim();
    if (/\d/.test(cleaned)) return cleaned;
  }

  // 2. Schema.org microdata: itemprop="address" or itemtype PostalAddress
  const microdataSelectors = [
    '[itemprop="address"]',
    '[itemtype*="PostalAddress"]',
    '[itemprop="streetAddress"]',
  ];
  for (const selector of microdataSelectors) {
    const el = $(selector).first();
    if (el.length > 0) {
      const parts: string[] = [];
      const street = el.find('[itemprop="streetAddress"]').text().trim() || el.attr('content')?.trim();
      const locality = el.find('[itemprop="addressLocality"]').text().trim();
      const postalCode = el.find('[itemprop="postalCode"]').text().trim();
      const region = el.find('[itemprop="addressRegion"]').text().trim();
      const country = el.find('[itemprop="addressCountry"]').text().trim();

      if (street) parts.push(street);
      if (postalCode) parts.push(postalCode);
      if (locality) parts.push(locality);
      if (region) parts.push(region);
      if (country) parts.push(country);

      if (parts.length >= 2) return parts.join(', ');

      const fallbackText = el.text().replace(/\s+/g, ' ').trim();
      if (fallbackText.length >= 8 && fallbackText.length <= 200 && /\d/.test(fallbackText)) {
        return fallbackText;
      }
    }
  }

  return null;
}

function extractAddressFromFooter($: cheerio.CheerioAPI): string | null {
  const footerSelectors = ['footer', '[role="contentinfo"]', '.footer', '#footer'];
  for (const selector of footerSelectors) {
    const footer = $(selector).first();
    if (footer.length === 0) continue;

    const footerText = footer.text().replace(/\s+/g, ' ').trim();
    if (!footerText || footerText.length < 10) continue;

    for (const pattern of ADDRESS_PATTERNS) {
      const match = footerText.match(pattern);
      if (match?.[0]) return match[0].trim();
    }
  }
  return null;
}

function extractAddressFromGoogleMaps($: cheerio.CheerioAPI): string | null {
  const mapIframes = $('iframe[src*="google.com/maps"], iframe[src*="maps.google"]');
  for (let i = 0; i < mapIframes.length; i++) {
    const src = $(mapIframes[i]).attr('src') || '';
    // Extract from "q=" or "query=" parameters
    const queryMatch = src.match(/[?&](?:q|query)=([^&]+)/i);
    if (queryMatch?.[1]) {
      const decoded = decodeURIComponent(queryMatch[1]).replace(/\+/g, ' ').trim();
      if (decoded.length >= 5 && decoded.length <= 200 && !/^[-\d.,\s]+$/.test(decoded)) {
        return decoded;
      }
    }
    // Extract from "/place/" in embed URLs
    const placeMatch = src.match(/\/place\/([^/&?]+)/);
    if (placeMatch?.[1]) {
      const decoded = decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ').trim();
      if (decoded.length >= 5 && decoded.length <= 200 && !/^[-\d.,\s]+$/.test(decoded)) {
        return decoded;
      }
    }
  }
  return null;
}

function extractAddressCandidate(
  content: string,
  $?: cheerio.CheerioAPI,
  structuredAddresses?: string[]
): string | null {
  // Priority 1: Structured data (JSON-LD) — most reliable
  if (structuredAddresses && structuredAddresses.length > 0) {
    const best = structuredAddresses
      .filter((a) => a.length >= 5 && a.length <= 300)
      .sort((a, b) => b.length - a.length)[0];
    if (best) return best;
  }

  // Priority 2: HTML semantic elements (<address>, itemprop, microdata)
  if ($) {
    const semanticAddress = extractAddressFromSemanticHtml($);
    if (semanticAddress) return semanticAddress;
  }

  // Priority 3: Google Maps embeds
  if ($) {
    const mapsAddress = extractAddressFromGoogleMaps($);
    if (mapsAddress) return mapsAddress;
  }

  // Priority 4: Footer-targeted regex
  if ($) {
    const footerAddress = extractAddressFromFooter($);
    if (footerAddress) return footerAddress;
  }

  // Priority 5: Full-text regex patterns
  for (const pattern of ADDRESS_PATTERNS) {
    const match = content.match(pattern);
    if (match?.[0]) {
      return match[0].trim();
    }
  }
  return null;
}

function detectLikelySpaShell(
  $: cheerio.CheerioAPI,
  html: string,
  textLength: number
): boolean {
  const hasSpaRoot =
    $('#root, #app, #__next, #__nuxt, [data-reactroot]').length > 0 ||
    /id=["'](?:root|app|__next|__nuxt)["']/i.test(html);
  const scriptCount = $('script[src], script[type="module"]').length;
  const hasMetaSeo =
    Boolean($('title').text().trim()) ||
    Boolean($('meta[name="description"]').attr('content')?.trim()) ||
    Boolean($('meta[property="og:title"]').attr('content')?.trim());
  const hasMinimalBodyText = textLength < 140;

  return hasMinimalBodyText && hasMetaSeo && (hasSpaRoot || scriptCount >= 6);
}
