import { detectSector } from '@/lib/sectors';
import {
  buildPaidScanQualifiedActorLabel,
  getPaidScanActivityCatalogEntry,
} from '@/lib/scanner/paid-scan-catalog';
import {
  getAllowedVerticalsForSiteType,
  getSiteTypeDefaultVertical,
  getSiteTypeVerticalDefaultOfferLabel,
  getSiteTypeVerticalOffers,
  getSiteTypeVerticalTopicLabel,
  localizeOfferLabelFromTaxonomy,
  localizeTopicLabelFromTaxonomy,
} from '@/lib/scanner/prompt-taxonomy';
import { deriveHomepageFailed, deriveSubpageFailureCount } from '@/lib/scanner/crawl-status';
import type {
  AuditScanContext,
  CrawledPageSnapshot,
  CrawlResult,
  PaidScanPromptFamily,
  PromptBrief,
  PromptProfileSnapshot,
  PromptQuery,
} from '@/types';

type PromptLanguage = PromptProfileSnapshot['language'];
type SiteType = PromptProfileSnapshot['siteType'];
type SiteFamily = PromptProfileSnapshot['siteFamily'];
type DomainVertical = PromptProfileSnapshot['domainVertical'];
type PromptGenerationLevel = PromptProfileSnapshot['promptGenerationLevel'];

interface GeneratePromptsParams {
  crawl: CrawlResult;
  fallbackBusinessName?: string | null;
  fallbackTopic?: string | null;
  fallbackCity?: string | null;
  brief?: PromptBrief | null;
  scanContext?: AuditScanContext | null;
}

export interface PromptGenerationProfile extends PromptProfileSnapshot {}

interface PromptDraft {
  prompt: string;
  category: PromptQuery['category'];
  visibility?: PromptQuery['visibility'];
  benchmarkGroup?: PromptQuery['benchmarkGroup'];
  brandAnchored?: boolean;
  analysisTrack?: PromptQuery['analysisTrack'];
  affectsVisibilityScore?: boolean;
  affectsCitationMatrix?: boolean;
}

interface PromptAngleBundle {
  core: string;
  capability: string;
  decision: string;
  market: string;
  audience: string;
}

interface PromptTextCandidate {
  value: string | null | undefined;
  dynamicProne?: boolean;
}

interface WeightedNameCandidate {
  value: string | null | undefined;
  weight: number;
}

interface IntentCandidateInput {
  value: string | null | undefined;
  source: string;
  weight: number;
  dynamicProne?: boolean;
}

interface GroupedIntentCandidate {
  value: string;
  key: string;
  score: number;
  sources: Set<string>;
}

interface ResolvedIntent {
  value: string;
  confidence: number;
  source: string;
  candidates: string[];
  safe: boolean;
}

interface SafeIntentBucketDefinition {
  id: string;
  labels: Partial<Record<PromptLanguage, string>>;
  hints: readonly string[];
}

interface ResolvedSafeIntentBucket {
  id: string;
  value: string;
  source: string;
}

interface CanonicalIntentDefinition {
  id: string;
  labels: Partial<Record<PromptLanguage, string>>;
  hints: readonly string[];
  pathHints?: readonly string[];
}

interface HintScorableDefinition {
  id: string;
  hints: readonly string[];
  pathHints?: readonly string[];
}

interface DomainVerticalDefinition {
  id: DomainVertical;
  hints: readonly string[];
  pathHints?: readonly string[];
  defaultTopic: Partial<Record<PromptLanguage, string>>;
  defaultOffer: Partial<Record<PromptLanguage, string>>;
  topicBySiteType?: Partial<Record<SiteType, Partial<Record<PromptLanguage, string>>>>;
  offerBySiteType?: Partial<Record<SiteType, Partial<Record<PromptLanguage, string>>>>;
}

type DomainVerticalResolution = {
  value: DomainVertical;
  confidence: number;
  source: string;
};

type PromptGenerationDecision = {
  level: PromptGenerationLevel;
  reason: string;
};

const TARGET_PROMPT_COUNT = 10;
const TARGET_INSIGHT_PROMPT_COUNT = 2;
const FALLBACK_TOPIC_FR = 'services';
const FALLBACK_TOPIC_EN = 'services';
const MAIN_TOPIC_MAX_LENGTH = 30;
const MAIN_OFFER_MAX_LENGTH = 50;
const MIN_SITE_TYPE_SCORE = 8;
const MIN_SITE_TYPE_GAP = 3;
const MAIN_TOPIC_CONFIDENCE_THRESHOLD = 62;
const MAIN_OFFER_CONFIDENCE_THRESHOLD = 62;
const LOW_SIGNAL_SECTOR_NAMES = new Set(['service', 'services', 'commerce', 'agence', 'agency', 'shop']);
const GENERIC_BRAND_LABEL_PATTERN =
  /^(home|accueil|about(?: us)?|a propos|contact|pricing|tarifs|features?|docs|documentation|faq|support|help|login|sign in|sign up|register|careers?|jobs?|blog|news|cette entreprise|this business|ce site|this site|site web|website)$/i;
const INVALID_SITE_NAME_PATTERN =
  /^(just a moment|attention required|access denied|forbidden|page not found|not found|erreur|error|enable javascript|checking your browser|verify you are human|404|403|500)\b/i;
const SITE_NAME_NOISE_PREFIX_PATTERN =
  /^(?:logo(?:\s+de|\s+du|\s+des|\s+of)?(?:\s+la|\s+le|\s+les)?\s+|documentation\s+|docs?\s+|help center\s+|centre d[’']aide\s+|knowledge base\s+|base de connaissances\s+|welcome to\s+|accueil(?:\s+de)?\s+)/i;
const SITE_NAME_NOISE_FRAGMENT_PATTERN =
  /\b(?:logo(?:\s+de|\s+du|\s+des|\s+of)?(?:\s+la|\s+le|\s+les)?|documentation|docs?|help center|centre d[’']aide|knowledge base|base de connaissances)\b/gi;
const COMMON_SECOND_LEVEL_TLDS = new Set(['co', 'com', 'org', 'net', 'gov', 'ac']);
const GENERIC_TOPIC_PATTERN =
  /^(services?|solutions?|solution logicielle|logiciel|logiciels|outil|outils|plateforme|plateformes|produits?|ressources?|contenus?|support|expérience|experience|offres?)$/i;
const GENERIC_OFFER_PATTERN =
  /^(services?|solutions?|support|ressources?|contenus?|offres?|expérience|experience|plateforme|plateformes)$/i;
const OFFER_INTENT_PATTERN =
  /\b(?:pour|afin de|to|gérer|gerer|acheter|vendre|réserver|reserver|regarder|écouter|ecouter|apprendre|comparer|trouver|poser|échanger|echanger|recruter|postuler|suivre|lire|trader|négocier|negocier|predict|trade|book|watch|listen|learn|compare|find|buy|sell|read|follow|hire|apply|stream|ask|discuss|chat)\b/i;
const TOPIC_INTENT_PATTERN =
  /\b(?:pour|afin de|to)\b/i;

const FR_STOPWORDS = new Set([
  'avec', 'dans', 'pour', 'sur', 'vous', 'votre', 'vos', 'notre', 'nos', 'leur', 'leurs',
  'les', 'des', 'une', 'un', 'du', 'de', 'la', 'le', 'et', 'ou', 'the', 'qui', 'quoi',
  'comment', 'est', 'sont', 'plus', 'moins', 'site', 'accueil', 'home', 'page', 'nous',
  'propos', 'contact', 'faq', 'tarifs', 'politique', 'confidentialite', 'conditions',
  'generales', 'mentions', 'legales', 'vitrine', 'offres',
]);

const EN_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'your', 'our', 'their', 'from', 'this', 'that', 'are', 'is',
  'was', 'were', 'what', 'when', 'where', 'which', 'who', 'about', 'home', 'page', 'contact',
  'faq', 'pricing', 'privacy', 'terms', 'service', 'services', 'website',
]);

const LOCAL_SERVICE_HINTS = [
  'devis', 'intervention', 'urgence', 'rendez-vous', 'cabinet', 'artisan', 'agence',
  'plombier', 'dentiste', 'avocat', 'chauffagiste', 'electricien', 'coiffeur',
  'appointment', 'urgent', 'local service', 'near me',
];
const AI_NATIVE_HINTS = [
  'intelligence artificielle', 'artificial intelligence', 'generative ai', 'générative',
  'assistant ia', 'assistant ai', 'ai assistant', 'copilot', 'co-pilot', 'agent ia',
  'agent ai', 'agents ia', 'ai agents', 'llm', 'foundation model', 'language model',
  'chatbot', 'chat assistant', 'prompt', 'prompts', 'generate', 'générer', 'génération',
  'reasoning', 'automation with ai', 'create with ai', 'ai workspace',
];
const SAAS_HINTS = [
  'saas', 'logiciel', 'software', 'app', 'application', 'platform', 'plateforme', 'dashboard',
  'pricing', 'tarifs', 'features', 'fonctionnalites', 'login', 'connexion', 'essai gratuit',
  'free trial', 'sign in',
];
const STREAMING_HINTS = [
  'streaming', 'vod', 'svod', 'film', 'films', 'série', 'séries', 'series', 'movie', 'movies',
  'show', 'shows', 'episode', 'episodes', 'regarder', 'watch', 'playlist', 'podcast', 'music',
  'musique', 'listen', 'audio streaming',
];
const MARKETPLACE_HINTS = [
  'marketplace', 'vendeur', 'vendeurs', 'seller', 'sellers', 'vendor', 'vendors', 'annonce',
  'annonces', 'listing', 'listings', 'host', 'hosts', 'freelance', 'freelancers',
  'prestataire', 'prestataires', 'mission', 'missions', 'second hand', 'occasion',
];
const EDUCATION_HINTS = [
  'formation', 'formations', 'cours', 'course', 'courses', 'academy', 'académie', 'academie',
  'bootcamp', 'certification', 'certifications', 'learn', 'learning', 'masterclass', 'école',
  'ecole', 'campus', 'lessons', 'training', 'apprendre',
];
const DOCUMENTATION_HINTS = [
  'documentation', 'docs', 'guide', 'guides', 'reference', 'api reference', 'knowledge base',
  'base de connaissances', 'help center', 'centre d’aide', 'centre daide', 'manual', 'manuels',
  'developer docs', 'support articles',
];
const COMMUNITY_HINTS = [
  'forum', 'forums', 'communauté', 'communaute', 'community', 'discussion', 'discussions',
  'thread', 'threads', 'members', 'membres', 'discord', 'subreddit', 'questions', 'answers',
];
const TRAVEL_HINTS = [
  'voyage', 'travel', 'trip', 'trips', 'séjour', 'sejour', 'hotel', 'hôtel', 'flight',
  'flights', 'vol', 'vols', 'booking', 'réservation', 'reservation', 'destination',
  'destinations', 'train', 'trains', 'car rental', 'location de voiture',
];
const JOBS_HINTS = [
  'emploi', 'emplois', 'job', 'jobs', 'recrutement', 'recruitment', 'career', 'careers',
  'carrière', 'carriere', 'postuler', 'apply', 'candidate', 'candidates', 'talent', 'hiring',
  'offres emploi', 'offres d’emploi',
];
const PUBLIC_SERVICE_HINTS = [
  'association', 'fondation', 'nonprofit', 'non-profit', 'ngo', 'ong', 'mairie', 'service public',
  'government', 'gouvernement', 'ministère', 'ministere', 'citoyens', 'démarches', 'demarches',
  'solidarité', 'solidarite', 'publique',
];
const ECOMMERCE_HINTS = [
  'boutique', 'shop', 'panier', 'cart', 'checkout', 'produit', 'product', 'collection',
  'livraison', 'acheter', 'buy', 'store', 'catalogue', 'fashion', 'mode', 'vêtements',
  'vetements', 'clothing', 'shoes', 'chaussures', 'sneakers', 'articles de mode',
];
const MEDIA_HINTS = [
  'blog', 'article', 'articles', 'news', 'actualite', 'magazine', 'publication', 'auteur',
  'newsletter', 'editorial',
];
const STRONG_MEDIA_HINTS = [
  'news',
  'actualite',
  'magazine',
  'publication',
  'newsletter',
  'editorial',
  'article',
  'articles',
];
const PORTFOLIO_HINTS = [
  'portfolio', 'projets', 'projet', 'realisations', 'case studies', 'freelance', 'independant',
  'designer', 'photographe', 'creative',
];
const BRAND_HINTS = [
  'marque', 'brand', 'histoire', 'story', 'vision', 'manifesto', 'collection',
];

const AI_NATIVE_PATH_HINTS = ['/ai', '/assistant', '/assistants', '/copilot', '/chat', '/agent', '/agents', '/models', '/model', '/prompts'];
const SAAS_PATH_HINTS = ['/pricing', '/features', '/dashboard', '/app', '/login'];
const STREAMING_PATH_HINTS = ['/watch', '/browse', '/movies', '/movie', '/series', '/shows', '/listen', '/playlist'];
const MARKETPLACE_PATH_HINTS = ['/marketplace', '/seller', '/sellers', '/vendor', '/vendors', '/listing', '/listings', '/hosts', '/freelancers'];
const EDUCATION_PATH_HINTS = ['/courses', '/course', '/learn', '/academy', '/formations', '/formation', '/certification', '/bootcamp'];
const DOCUMENTATION_PATH_HINTS = ['/docs', '/documentation', '/guide', '/guides', '/reference', '/api', '/help', '/support', '/kb'];
const COMMUNITY_PATH_HINTS = ['/community', '/forum', '/forums', '/discussions', '/discussion', '/threads', '/groups'];
const TRAVEL_PATH_HINTS = ['/travel', '/trips', '/booking', '/book', '/destinations', '/hotels', '/flights', '/vols'];
const JOBS_PATH_HINTS = ['/jobs', '/job', '/careers', '/career', '/recruitment', '/hiring', '/emplois'];
const PUBLIC_SERVICE_PATH_HINTS = ['/public', '/service-public', '/demarches', '/association', '/fondation', '/citoyens'];
const ECOMMERCE_PATH_HINTS = ['/shop', '/boutique', '/product', '/products', '/cart', '/checkout', '/panier'];
const MEDIA_PATH_HINTS = ['/blog', '/news', '/magazine', '/articles', '/article'];
const PORTFOLIO_PATH_HINTS = ['/portfolio', '/projects', '/work', '/case-study', '/realisations'];
const STABLE_DESCRIPTOR_PATH_HINTS = [
  '/about',
  '/a-propos',
  '/about-us',
  '/company',
  '/pricing',
  '/tarifs',
  '/features',
  '/feature',
  '/product',
  '/products',
  '/platform',
  '/solution',
  '/solutions',
  '/how-it-works',
  '/docs',
  '/documentation',
  '/guide',
  '/guides',
  '/help',
  '/support',
];

const SITE_TYPE_TOPIC_HINTS: Record<SiteType, readonly string[]> = {
  local_service: LOCAL_SERVICE_HINTS,
  saas: SAAS_HINTS,
  ai_native: AI_NATIVE_HINTS,
  streaming_entertainment: STREAMING_HINTS,
  marketplace: MARKETPLACE_HINTS,
  education_training: EDUCATION_HINTS,
  documentation_knowledge: DOCUMENTATION_HINTS,
  community_forum: COMMUNITY_HINTS,
  travel_booking: TRAVEL_HINTS,
  jobs_recruitment: JOBS_HINTS,
  public_service_nonprofit: PUBLIC_SERVICE_HINTS,
  ecommerce: ECOMMERCE_HINTS,
  media: MEDIA_HINTS,
  portfolio: PORTFOLIO_HINTS,
  brand_site: BRAND_HINTS,
  generic: [],
};

const SITE_TYPE_DEFAULT_TOPIC: Record<SiteType, Record<PromptLanguage, string>> = {
  local_service: { fr: 'prestataires locaux', en: 'local services' },
  saas: { fr: 'logiciels en ligne', en: 'online software' },
  ai_native: { fr: 'outils d’intelligence artificielle', en: 'AI tools' },
  streaming_entertainment: { fr: 'streaming', en: 'streaming' },
  marketplace: { fr: 'marketplaces', en: 'marketplaces' },
  education_training: { fr: 'formations en ligne', en: 'online learning' },
  documentation_knowledge: { fr: 'documentation', en: 'documentation' },
  community_forum: { fr: 'communautés en ligne', en: 'online communities' },
  travel_booking: { fr: 'réservation de voyages', en: 'travel booking' },
  jobs_recruitment: { fr: 'emploi', en: 'jobs' },
  public_service_nonprofit: { fr: 'ressources publiques et associatives', en: 'public and nonprofit resources' },
  ecommerce: { fr: 'boutiques en ligne', en: 'online stores' },
  media: { fr: 'médias en ligne', en: 'online media' },
  portfolio: { fr: 'profils professionnels', en: 'professional profiles' },
  brand_site: { fr: 'références du secteur', en: 'category references' },
  generic: { fr: 'sites de cette catégorie', en: 'websites in this category' },
};

const SITE_TYPE_DEFAULT_OFFER: Record<SiteType, Record<PromptLanguage, string>> = {
  local_service: { fr: 'ce besoin local', en: 'this local need' },
  saas: { fr: 'gérer son activité en ligne', en: 'manage work online' },
  ai_native: { fr: 'automatiser ou créer plus vite avec l’IA', en: 'automate or create faster with AI' },
  streaming_entertainment: { fr: 'regarder du contenu en streaming', en: 'watch content online' },
  marketplace: { fr: 'trouver des offres fiables en ligne', en: 'find reliable offers online' },
  education_training: { fr: 'se former en ligne', en: 'learn online' },
  documentation_knowledge: { fr: 'trouver une documentation claire', en: 'find clear documentation' },
  community_forum: { fr: 'poser des questions et échanger', en: 'ask questions and discuss' },
  travel_booking: { fr: 'réserver un voyage', en: 'book a trip' },
  jobs_recruitment: { fr: 'trouver un emploi ou recruter', en: 'find jobs or recruit' },
  public_service_nonprofit: { fr: 'obtenir une aide fiable', en: 'get reliable help' },
  ecommerce: { fr: 'acheter en ligne', en: 'shop online' },
  media: { fr: 'lire et suivre l’actualité', en: 'read and follow updates' },
  portfolio: { fr: 'trouver le bon profil', en: 'find the right profile' },
  brand_site: { fr: 'choisir une marque fiable', en: 'choose a reliable brand' },
  generic: { fr: 'ce besoin', en: 'this need' },
};

const SAFE_INTENT_BUCKETS: Record<SiteType, readonly SafeIntentBucketDefinition[]> = {
  local_service: [
    { id: 'quote', labels: { fr: 'obtenir un devis', en: 'get a quote' }, hints: ['devis', 'quote', 'pricing', 'tarif', 'estimate'] },
    { id: 'intervention', labels: { fr: 'planifier une intervention', en: 'schedule an intervention' }, hints: ['intervention', 'repair', 'dépannage', 'depannage', 'visit', 'installation'] },
    { id: 'appointment', labels: { fr: 'prendre rendez-vous', en: 'book an appointment' }, hints: ['rendez-vous', 'appointment', 'booking', 'book', 'calendar'] },
    { id: 'provider', labels: { fr: 'trouver un prestataire fiable', en: 'find a reliable provider' }, hints: ['prestataire', 'provider', 'expert', 'artisan', 'service local'] },
    { id: 'local_need', labels: { fr: 'résoudre un besoin local', en: 'solve a local need' }, hints: ['local', 'near me', 'zone d’intervention', 'urgence', 'urgent'] },
  ],
  saas: [
    { id: 'operations', labels: { fr: 'centraliser ses opérations', en: 'centralize operations' }, hints: ['centraliser', 'centralize', 'operations', 'workspace', 'dashboard', 'all-in-one'] },
    { id: 'automation', labels: { fr: 'automatiser ses processus', en: 'automate processes' }, hints: ['automation', 'automatiser', 'workflow', 'process', 'no-code'] },
    { id: 'management', labels: { fr: 'gérer son activité', en: 'manage work' }, hints: ['gérer', 'manage', 'business', 'activity', 'crm', 'project management'] },
    { id: 'collaboration', labels: { fr: 'mieux collaborer', en: 'collaborate better' }, hints: ['collaboration', 'collaborer', 'team', 'shared', 'workspace'] },
    { id: 'analytics', labels: { fr: 'suivre ses performances', en: 'track performance' }, hints: ['analytics', 'reporting', 'metrics', 'performance', 'insights'] },
  ],
  ai_native: [
    { id: 'automation', labels: { fr: 'automatiser des tâches', en: 'automate tasks' }, hints: ['automate', 'automation', 'agent', 'agents', 'workflow', 'task', 'tasks'] },
    { id: 'content', labels: { fr: 'générer du contenu', en: 'generate content' }, hints: ['generate', 'générer', 'content', 'copy', 'image', 'video', 'text', 'création'] },
    { id: 'analysis', labels: { fr: 'analyser des informations', en: 'analyze information' }, hints: ['research', 'analyze', 'analyse', 'insights', 'summarize', 'search', 'report'] },
    { id: 'writing', labels: { fr: 'assister la rédaction', en: 'assist writing' }, hints: ['writing', 'rédaction', 'redaction', 'email', 'document', 'writing assistant'] },
    { id: 'coding', labels: { fr: 'coder plus vite', en: 'code faster' }, hints: ['code', 'coding', 'developer', 'dev', 'software engineer', 'programming'] },
  ],
  streaming_entertainment: [
    { id: 'movies_series', labels: { fr: 'regarder des films et séries', en: 'watch movies and series' }, hints: ['film', 'films', 'movie', 'movies', 'série', 'séries', 'series', 'shows'] },
    { id: 'audio', labels: { fr: 'écouter du contenu audio', en: 'listen to audio content' }, hints: ['music', 'musique', 'audio', 'podcast', 'playlist', 'listen'] },
    { id: 'live', labels: { fr: 'suivre des contenus en direct', en: 'follow live content' }, hints: ['live', 'direct', 'stream', 'streaming live', 'broadcast'] },
    { id: 'discovery', labels: { fr: 'découvrir de nouveaux contenus', en: 'discover new content' }, hints: ['discover', 'discover new', 'browse', 'recommendations', 'catalog'] },
    { id: 'ondemand', labels: { fr: 'regarder à la demande', en: 'watch on demand' }, hints: ['on demand', 'à la demande', 'vod', 'svod', 'catalogue'] },
  ],
  marketplace: [
    { id: 'compare_offers', labels: { fr: 'comparer plusieurs offres', en: 'compare multiple offers' }, hints: ['compare', 'comparison', 'offers', 'offres', 'results', 'filters'] },
    { id: 'seller', labels: { fr: 'trouver un vendeur fiable', en: 'find a reliable seller' }, hints: ['seller', 'vendor', 'vendeur', 'vendors', 'trusted seller'] },
    { id: 'provider', labels: { fr: 'trouver un prestataire', en: 'find a provider' }, hints: ['prestataire', 'provider', 'freelance', 'expert', 'service provider'] },
    { id: 'multivendor_buying', labels: { fr: 'acheter auprès de plusieurs vendeurs', en: 'buy from multiple sellers' }, hints: ['marketplace', 'listings', 'multi-vendor', 'acheter', 'buy'] },
    { id: 'sell_on_platform', labels: { fr: 'vendre sur une plateforme', en: 'sell on a platform' }, hints: ['sell', 'selling', 'become a seller', 'vendre', 'merchant'] },
  ],
  education_training: [
    { id: 'learn_skill', labels: { fr: 'apprendre une compétence', en: 'learn a skill' }, hints: ['learn', 'apprendre', 'skill', 'compétence', 'competence'] },
    { id: 'upskill', labels: { fr: 'monter en compétences', en: 'upskill' }, hints: ['upskill', 'career growth', 'progression', 'skills', 'professional development'] },
    { id: 'online_course', labels: { fr: 'suivre une formation en ligne', en: 'take an online course' }, hints: ['online course', 'formation en ligne', 'cours en ligne', 'lessons', 'program'] },
    { id: 'certification', labels: { fr: 'préparer une certification', en: 'prepare a certification' }, hints: ['certification', 'certificate', 'exam', 'credential'] },
    { id: 'efficient_learning', labels: { fr: 'se former efficacement', en: 'learn efficiently' }, hints: ['bootcamp', 'accelerated', 'intensive', 'fast-track', 'masterclass'] },
  ],
  documentation_knowledge: [
    { id: 'clear_docs', labels: { fr: 'trouver une documentation claire', en: 'find clear documentation' }, hints: ['documentation', 'docs', 'guide', 'manual', 'getting started'] },
    { id: 'understand_topic', labels: { fr: 'comprendre un sujet rapidement', en: 'understand a topic quickly' }, hints: ['understand', 'overview', 'introduction', 'explainer', 'guide'] },
    { id: 'solve_problem', labels: { fr: 'résoudre un problème précis', en: 'solve a specific problem' }, hints: ['troubleshooting', 'error', 'issue', 'problem', 'fix'] },
    { id: 'reference', labels: { fr: 'consulter une référence fiable', en: 'consult a reliable reference' }, hints: ['reference', 'api reference', 'reference docs', 'spec', 'manual'] },
    { id: 'structured_help', labels: { fr: 'accéder à une aide structurée', en: 'access structured help' }, hints: ['help center', 'knowledge base', 'support', 'faq', 'how-to'] },
  ],
  community_forum: [
    { id: 'answers', labels: { fr: 'obtenir des réponses utiles', en: 'get useful answers' }, hints: ['answers', 'réponses', 'resolved', 'solved', 'help me'] },
    { id: 'ask_questions', labels: { fr: 'poser une question', en: 'ask a question' }, hints: ['question', 'questions', 'ask', 'community', 'forum'] },
    { id: 'peer_exchange', labels: { fr: 'échanger avec des pairs', en: 'exchange with peers' }, hints: ['community', 'members', 'peer', 'discussion', 'discussions'] },
    { id: 'community_problem_solving', labels: { fr: 'résoudre un problème grâce à la communauté', en: 'solve a problem through the community' }, hints: ['troubleshooting', 'support forum', 'issue', 'problem', 'fix'] },
    { id: 'feedback', labels: { fr: 'trouver des retours d’expérience', en: 'find user feedback' }, hints: ['feedback', 'experience', 'retours', 'stories', 'use cases'] },
  ],
  travel_booking: [
    { id: 'stay', labels: { fr: 'réserver un séjour', en: 'book a stay' }, hints: ['stay', 'séjour', 'hotel', 'hôtel', 'accommodation', 'room'] },
    { id: 'trip', labels: { fr: 'organiser un voyage', en: 'plan a trip' }, hints: ['travel', 'voyage', 'trip', 'itinerary', 'destination'] },
    { id: 'compare_booking', labels: { fr: 'comparer des options de réservation', en: 'compare booking options' }, hints: ['compare', 'comparison', 'booking', 'availability', 'filters'] },
    { id: 'best_price', labels: { fr: 'réserver au bon prix', en: 'book at the right price' }, hints: ['best price', 'deal', 'discount', 'tarif', 'price', 'cheap'] },
    { id: 'transport', labels: { fr: 'préparer un déplacement', en: 'prepare a trip' }, hints: ['flight', 'vol', 'train', 'transport', 'car rental', 'transfer'] },
  ],
  jobs_recruitment: [
    { id: 'find_job', labels: { fr: 'trouver un emploi', en: 'find a job' }, hints: ['job', 'emploi', 'jobs', 'careers', 'work'] },
    { id: 'recruit', labels: { fr: 'recruter efficacement', en: 'recruit efficiently' }, hints: ['recruit', 'recruitment', 'hiring', 'talent', 'sourcing'] },
    { id: 'publish_offer', labels: { fr: 'publier une offre', en: 'publish a job offer' }, hints: ['post a job', 'publish', 'job posting', 'employer', 'recruteur'] },
    { id: 'apply', labels: { fr: 'postuler aux bonnes opportunités', en: 'apply to the right opportunities' }, hints: ['apply', 'postuler', 'candidate', 'application'] },
    { id: 'find_profiles', labels: { fr: 'trouver des profils adaptés', en: 'find suitable profiles' }, hints: ['candidate', 'candidates', 'profiles', 'talent pool', 'shortlist'] },
  ],
  public_service_nonprofit: [
    { id: 'reliable_info', labels: { fr: 'obtenir une information fiable', en: 'get reliable information' }, hints: ['information', 'public information', 'official', 'guide citoyen', 'citoyen'] },
    { id: 'find_help', labels: { fr: 'trouver une aide adaptée', en: 'find suitable help' }, hints: ['aide', 'help', 'support', 'accompagnement', 'assistance'] },
    { id: 'process', labels: { fr: 'effectuer une démarche', en: 'complete an administrative step' }, hints: ['démarches', 'demarches', 'procedure', 'formulaire', 'apply'] },
    { id: 'contact_org', labels: { fr: 'contacter le bon organisme', en: 'contact the right organization' }, hints: ['contact', 'service public', 'mairie', 'administration', 'organisme'] },
    { id: 'useful_service', labels: { fr: 'accéder à un service utile', en: 'access a useful service' }, hints: ['service', 'public service', 'resource', 'association', 'foundation'] },
  ],
  ecommerce: [
    { id: 'buy_online', labels: { fr: 'acheter en ligne', en: 'buy online' }, hints: ['buy', 'acheter', 'shop', 'store', 'checkout'] },
    { id: 'compare_products', labels: { fr: 'comparer des produits', en: 'compare products' }, hints: ['compare', 'comparison', 'product', 'products', 'catalogue'] },
    { id: 'trust_buying', labels: { fr: 'acheter en confiance', en: 'buy with confidence' }, hints: ['trusted', 'reviews', 'quality', 'guarantee', 'secure checkout'] },
    { id: 'find_product', labels: { fr: 'trouver le bon produit', en: 'find the right product' }, hints: ['find', 'discover', 'product', 'collection', 'catalog'] },
    { id: 'best_price', labels: { fr: 'commander au bon prix', en: 'order at the right price' }, hints: ['sale', 'promo', 'discount', 'price', 'best price'] },
  ],
  media: [
    { id: 'follow_news', labels: { fr: 'suivre l’actualité', en: 'follow the news' }, hints: ['actualité', 'news', 'latest', 'breaking', 'coverage'] },
    { id: 'reliable_content', labels: { fr: 'lire des contenus fiables', en: 'read reliable content' }, hints: ['analysis', 'report', 'editorial', 'source', 'reliable'] },
    { id: 'understand_topic', labels: { fr: 'comprendre un sujet', en: 'understand a topic' }, hints: ['explained', 'guide', 'analysis', 'background', 'insights'] },
    { id: 'follow_topic', labels: { fr: 'suivre une thématique', en: 'follow a topic' }, hints: ['topic', 'category', 'coverage', 'section', 'theme'] },
    { id: 'information_source', labels: { fr: 'trouver une bonne source d’information', en: 'find a good information source' }, hints: ['source', 'media', 'publication', 'journal', 'newsletter'] },
  ],
  portfolio: [
    { id: 'find_profile', labels: { fr: 'trouver le bon profil', en: 'find the right profile' }, hints: ['portfolio', 'profile', 'works', 'case studies', 'projects'] },
    { id: 'freelancer', labels: { fr: 'choisir un freelance', en: 'choose a freelancer' }, hints: ['freelance', 'independent', 'consultant', 'designer', 'developer'] },
    { id: 'evaluate_provider', labels: { fr: 'évaluer un prestataire', en: 'evaluate a provider' }, hints: ['testimonials', 'reviews', 'references', 'client work'] },
    { id: 'contact_expert', labels: { fr: 'contacter un expert', en: 'contact an expert' }, hints: ['book a call', 'contact', 'hire me', 'expert', 'consulting'] },
    { id: 'solid_reference', labels: { fr: 'trouver une référence solide', en: 'find a strong reference' }, hints: ['references', 'clients', 'selected work', 'featured work'] },
  ],
  brand_site: [
    { id: 'reliable_brand', labels: { fr: 'choisir une marque fiable', en: 'choose a reliable brand' }, hints: ['brand', 'marque', 'trust', 'quality', 'story'] },
    { id: 'compare_references', labels: { fr: 'comparer les références du secteur', en: 'compare category references' }, hints: ['category leaders', 'reference', 'leaders', 'best brands'] },
    { id: 'evaluate_brand', labels: { fr: 'évaluer une marque', en: 'evaluate a brand' }, hints: ['reviews', 'feedback', 'brand', 'about us', 'history'] },
    { id: 'adapted_offer', labels: { fr: 'trouver une offre adaptée', en: 'find a suitable offer' }, hints: ['solutions', 'offers', 'range', 'products', 'services'] },
    { id: 'actor_choice', labels: { fr: 'faire le bon choix parmi les acteurs', en: 'choose among category players' }, hints: ['alternatives', 'competitors', 'compare', 'comparison'] },
  ],
  generic: [
    { id: 'compare_options', labels: { fr: 'comparer les options disponibles', en: 'compare available options' }, hints: ['compare', 'comparison', 'options', 'alternatives'] },
    { id: 'reliable_actor', labels: { fr: 'trouver un acteur fiable', en: 'find a reliable provider' }, hints: ['reliable', 'trusted', 'reviews', 'best'] },
    { id: 'best_alternatives', labels: { fr: 'identifier les meilleures alternatives', en: 'identify the best alternatives' }, hints: ['alternatives', 'competitors', 'other options'] },
    { id: 'right_solution', labels: { fr: 'choisir la bonne solution', en: 'choose the right solution' }, hints: ['solution', 'product', 'service', 'platform'] },
    { id: 'informed_choice', labels: { fr: 'faire un choix éclairé', en: 'make an informed choice' }, hints: ['guide', 'help choose', 'decision', 'best option'] },
  ],
};

function canonicalIntent(
  id: string,
  fr: string,
  en: string,
  hints: readonly string[],
  options: {
    pathHints?: readonly string[];
  } = {}
): CanonicalIntentDefinition {
  return {
    id,
    labels: { fr, en },
    hints,
    pathHints: options.pathHints,
  };
}

function verticalDefinition(
  id: DomainVertical,
  params: Omit<DomainVerticalDefinition, 'id'>
): DomainVerticalDefinition {
  return {
    id,
    ...params,
  };
}

const DOMAIN_VERTICAL_DEFINITIONS: Record<DomainVertical, DomainVerticalDefinition> = {
  accounting_finance: verticalDefinition('accounting_finance', {
    hints: ['comptabilité', 'comptable', 'accounting', 'bookkeeping', 'finance', 'financial', 'expense', 'expenses', 'facturation', 'invoice', 'billing', 'trésorerie', 'cash flow', 'fiscalité', 'tax'],
    pathHints: ['/accounting', '/comptabilite', '/billing', '/invoices', '/finance', '/expenses'],
    defaultTopic: { fr: 'comptabilité et finance', en: 'accounting and finance' },
    defaultOffer: { fr: 'gérer la comptabilité et les finances', en: 'manage accounting and finance' },
    topicBySiteType: {
      saas: { fr: 'logiciels de comptabilité et finance', en: 'accounting software' },
      local_service: { fr: 'services comptables et financiers', en: 'accounting services' },
      brand_site: { fr: 'services comptables et financiers', en: 'accounting services' },
      documentation_knowledge: { fr: 'documentation comptable et financière', en: 'accounting documentation' },
      media: { fr: 'finance et gestion d’entreprise', en: 'business finance' },
    },
    offerBySiteType: {
      saas: { fr: "gérer la comptabilité d'une entreprise", en: 'manage company accounting' },
      local_service: { fr: 'se faire accompagner en comptabilité', en: 'get accounting support' },
      brand_site: { fr: 'se faire accompagner en comptabilité', en: 'get accounting support' },
      documentation_knowledge: { fr: 'documenter un sujet de comptabilité', en: 'document accounting workflows' },
      media: { fr: "suivre l'actualité financière des entreprises", en: 'follow business finance news' },
    },
  }),
  legal_compliance: verticalDefinition('legal_compliance', {
    hints: ['juridique', 'legal', 'law', 'lawyer', 'avocat', 'compliance', 'conformité', 'privacy', 'gdpr', 'rgpd', 'contracts', 'contrats', 'regulatory'],
    pathHints: ['/legal', '/juridique', '/privacy', '/compliance', '/contracts'],
    defaultTopic: { fr: 'juridique et conformité', en: 'legal and compliance' },
    defaultOffer: { fr: 'gérer ses obligations juridiques', en: 'handle legal obligations' },
    topicBySiteType: {
      saas: { fr: 'logiciels juridiques et conformité', en: 'legal software' },
      local_service: { fr: 'services juridiques', en: 'legal services' },
      brand_site: { fr: 'services juridiques', en: 'legal services' },
    },
    offerBySiteType: {
      saas: { fr: 'gérer sa conformité et ses contrats', en: 'manage compliance and contracts' },
      local_service: { fr: 'se faire accompagner sur des sujets juridiques', en: 'get legal guidance' },
      brand_site: { fr: 'se faire accompagner sur des sujets juridiques', en: 'get legal guidance' },
    },
  }),
  hr_payroll: verticalDefinition('hr_payroll', {
    hints: ['rh', 'human resources', 'hr', 'paie', 'payroll', 'talent management', 'employee', 'employees', 'people ops', 'leave management', 'timesheets'],
    pathHints: ['/hr', '/payroll', '/paie', '/employees', '/people'],
    defaultTopic: { fr: 'RH et paie', en: 'HR and payroll' },
    defaultOffer: { fr: 'gérer les RH et la paie', en: 'manage HR and payroll' },
    topicBySiteType: {
      saas: { fr: 'logiciels RH et paie', en: 'HR software' },
      brand_site: { fr: 'services RH et paie', en: 'HR services' },
    },
    offerBySiteType: {
      saas: { fr: 'gérer les RH et la paie', en: 'manage HR and payroll' },
      brand_site: { fr: 'externaliser les RH et la paie', en: 'outsource HR and payroll' },
    },
  }),
  sales_crm: verticalDefinition('sales_crm', {
    hints: ['crm', 'sales', 'vente', 'ventes', 'lead', 'prospect', 'pipeline', 'customer relationship', 'deal', 'closing', 'revops'],
    pathHints: ['/crm', '/sales', '/pipeline', '/customers'],
    defaultTopic: { fr: 'vente et relation client', en: 'sales and CRM' },
    defaultOffer: { fr: 'gérer sa relation client', en: 'manage customer relationships' },
    topicBySiteType: {
      saas: { fr: 'logiciels CRM et vente', en: 'CRM software' },
      brand_site: { fr: 'services commerciaux et relation client', en: 'sales services' },
    },
    offerBySiteType: {
      saas: { fr: 'gérer sa relation client et ses ventes', en: 'manage CRM and sales' },
      brand_site: { fr: 'développer sa relation client', en: 'improve customer relationships' },
    },
  }),
  marketing_communication: verticalDefinition('marketing_communication', {
    hints: ['marketing', 'communication', 'campaign', 'campagne', 'email marketing', 'seo', 'sea', 'social media', 'brand marketing', 'content marketing', 'newsletter'],
    pathHints: ['/marketing', '/campaigns', '/seo', '/newsletter', '/social'],
    defaultTopic: { fr: 'marketing et communication', en: 'marketing and communication' },
    defaultOffer: { fr: 'piloter son marketing et sa communication', en: 'run marketing and communications' },
    topicBySiteType: {
      saas: { fr: 'logiciels marketing et communication', en: 'marketing software' },
      brand_site: { fr: 'services marketing et communication', en: 'marketing services' },
    },
    offerBySiteType: {
      saas: { fr: 'piloter son marketing et sa communication', en: 'manage marketing and communications' },
      brand_site: { fr: 'développer sa communication et son acquisition', en: 'grow communications and acquisition' },
    },
  }),
  developer_tools: verticalDefinition('developer_tools', {
    hints: ['developer', 'developers', 'développeur', 'api', 'sdk', 'integration', 'integrations', 'devtools', 'programming', 'code', 'framework', 'deployment', 'ci/cd', 'developer platform'],
    pathHints: ['/developers', '/developer', '/api', '/sdk', '/docs', '/reference'],
    defaultTopic: { fr: 'outils pour développeurs', en: 'developer tools' },
    defaultOffer: { fr: 'développer et intégrer plus efficacement', en: 'build and integrate more efficiently' },
    topicBySiteType: {
      saas: { fr: 'plateformes et outils pour développeurs', en: 'developer platforms' },
      documentation_knowledge: { fr: 'documentation développeur', en: 'developer documentation' },
      community_forum: { fr: 'communautés développeurs', en: 'developer communities' },
      media: { fr: 'actualité développeurs et logiciels', en: 'developer news' },
    },
    offerBySiteType: {
      saas: { fr: 'développer et intégrer plus efficacement', en: 'build and integrate more efficiently' },
      documentation_knowledge: { fr: 'intégrer et documenter une API', en: 'integrate and document an API' },
      community_forum: { fr: 'résoudre un problème de développement', en: 'solve a developer problem' },
    },
  }),
  it_cyber_data: verticalDefinition('it_cyber_data', {
    hints: ['cybersecurity', 'cybersécurité', 'security', 'sécurité', 'data', 'analytics platform', 'cloud infrastructure', 'it operations', 'monitoring', 'backup', 'identity', 'siem'],
    pathHints: ['/security', '/cybersecurity', '/data', '/analytics', '/infrastructure', '/monitoring'],
    defaultTopic: { fr: 'IT, data et cybersécurité', en: 'IT, data and cybersecurity' },
    defaultOffer: { fr: 'sécuriser et piloter son système d’information', en: 'secure and run IT systems' },
    topicBySiteType: {
      saas: { fr: 'logiciels IT, data et cybersécurité', en: 'IT and cybersecurity software' },
      documentation_knowledge: { fr: 'documentation IT et data', en: 'IT documentation' },
    },
    offerBySiteType: {
      saas: { fr: "sécuriser et piloter son système d'information", en: 'secure and manage IT systems' },
      documentation_knowledge: { fr: 'déployer et sécuriser une infrastructure', en: 'deploy and secure infrastructure' },
    },
  }),
  ai_automation: verticalDefinition('ai_automation', {
    hints: ['ai', 'ia', 'artificial intelligence', 'intelligence artificielle', 'automation', 'automatisation', 'agent', 'agents', 'copilot', 'llm', 'language model', 'prompt'],
    pathHints: ['/ai', '/ia', '/automation', '/agents', '/assistant', '/copilot'],
    defaultTopic: { fr: 'intelligence artificielle et automatisation', en: 'AI and automation' },
    defaultOffer: { fr: "automatiser des tâches avec l'IA", en: 'automate tasks with AI' },
    topicBySiteType: {
      saas: { fr: "logiciels d'IA et d'automatisation", en: 'AI software' },
      ai_native: { fr: "outils d'intelligence artificielle", en: 'AI tools' },
      documentation_knowledge: { fr: "documentation sur l'IA et l'automatisation", en: 'AI documentation' },
    },
    offerBySiteType: {
      saas: { fr: "automatiser des flux de travail avec l'IA", en: 'automate workflows with AI' },
      ai_native: { fr: "automatiser des tâches avec l'IA", en: 'automate tasks with AI' },
    },
  }),
  ecommerce_retail: verticalDefinition('ecommerce_retail', {
    hints: ['ecommerce', 'e-commerce', 'retail', 'boutique', 'shop', 'store', 'catalog', 'checkout', 'product catalog', 'commande', 'order'],
    pathHints: ['/shop', '/store', '/products', '/catalog', '/checkout'],
    defaultTopic: { fr: 'commerce et vente en ligne', en: 'ecommerce and retail' },
    defaultOffer: { fr: 'vendre ou acheter en ligne', en: 'buy or sell online' },
    topicBySiteType: {
      ecommerce: { fr: 'boutiques en ligne', en: 'online stores' },
      marketplace: { fr: 'marketplaces e-commerce', en: 'ecommerce marketplaces' },
      saas: { fr: 'logiciels e-commerce et retail', en: 'ecommerce software' },
    },
    offerBySiteType: {
      ecommerce: { fr: 'acheter en ligne', en: 'shop online' },
      marketplace: { fr: 'comparer des offres en ligne', en: 'compare offers online' },
      saas: { fr: 'gérer son activité e-commerce', en: 'run ecommerce operations' },
    },
  }),
  real_estate: verticalDefinition('real_estate', {
    hints: ['immobilier', 'real estate', 'property', 'properties', 'housing', 'rent', 'rental', 'acheter', 'vendre', 'location', 'transaction immobilière'],
    pathHints: ['/real-estate', '/immobilier', '/properties', '/rentals', '/buy'],
    defaultTopic: { fr: 'immobilier', en: 'real estate' },
    defaultOffer: { fr: 'acheter, vendre ou gérer un bien', en: 'buy, sell or manage property' },
    topicBySiteType: {
      marketplace: { fr: 'plateformes immobilières', en: 'real estate platforms' },
      local_service: { fr: 'services immobiliers', en: 'real estate services' },
      brand_site: { fr: 'services immobiliers', en: 'real estate services' },
    },
    offerBySiteType: {
      marketplace: { fr: 'trouver un bien ou une location', en: 'find a property or rental' },
      local_service: { fr: 'se faire accompagner sur un projet immobilier', en: 'get support on a property project' },
      brand_site: { fr: 'se faire accompagner sur un projet immobilier', en: 'get support on a property project' },
    },
  }),
  healthcare_wellness: verticalDefinition('healthcare_wellness', {
    hints: ['santé', 'health', 'medical', 'médical', 'clinic', 'clinique', 'doctor', 'médecin', 'dentiste', 'therapist', 'thérapeute', 'wellness', 'bien-être'],
    pathHints: ['/health', '/sante', '/medical', '/clinic', '/wellness'],
    defaultTopic: { fr: 'santé et bien-être', en: 'health and wellness' },
    defaultOffer: { fr: 'prendre soin de sa santé', en: 'take care of your health' },
    topicBySiteType: {
      local_service: { fr: 'services de santé et bien-être', en: 'health services' },
      brand_site: { fr: 'services de santé et bien-être', en: 'health services' },
      marketplace: { fr: 'plateformes de santé', en: 'health platforms' },
    },
    offerBySiteType: {
      local_service: { fr: 'prendre rendez-vous pour un soin', en: 'book a health appointment' },
      brand_site: { fr: 'bénéficier d’un accompagnement santé', en: 'get health support' },
      marketplace: { fr: 'prendre rendez-vous avec un professionnel de santé', en: 'book a healthcare appointment' },
    },
  }),
  education_training: verticalDefinition('education_training', {
    hints: ['formation', 'formations', 'training', 'course', 'courses', 'academy', 'bootcamp', 'certification', 'learn', 'learning', 'éducation', 'education'],
    pathHints: ['/courses', '/course', '/learn', '/academy', '/bootcamp', '/formation'],
    defaultTopic: { fr: 'formation et apprentissage', en: 'education and training' },
    defaultOffer: { fr: 'se former efficacement', en: 'learn effectively' },
    topicBySiteType: {
      education_training: { fr: 'formations en ligne', en: 'online learning' },
      saas: { fr: 'logiciels de formation', en: 'training software' },
      brand_site: { fr: 'offres de formation', en: 'training services' },
    },
    offerBySiteType: {
      education_training: { fr: 'se former en ligne', en: 'learn online' },
      saas: { fr: 'gérer des parcours de formation', en: 'manage training programs' },
      brand_site: { fr: 'développer ses compétences', en: 'build skills' },
    },
  }),
  recruitment_jobs: verticalDefinition('recruitment_jobs', {
    hints: ['emploi', 'emplois', 'job', 'jobs', 'recruitment', 'recruiting', 'recrutement', 'hiring', 'candidate', 'candidates', 'talent', 'ats'],
    pathHints: ['/jobs', '/careers', '/recruitment', '/hiring', '/talent'],
    defaultTopic: { fr: 'emploi et recrutement', en: 'jobs and recruitment' },
    defaultOffer: { fr: 'trouver un emploi ou recruter', en: 'find jobs or hire' },
    topicBySiteType: {
      jobs_recruitment: { fr: "plateformes d'emploi et recrutement", en: 'jobs platforms' },
      saas: { fr: 'logiciels de recrutement', en: 'recruitment software' },
      brand_site: { fr: 'services de recrutement', en: 'recruitment services' },
    },
    offerBySiteType: {
      jobs_recruitment: { fr: 'trouver un emploi ou recruter', en: 'find jobs or hire' },
      saas: { fr: 'gérer ses recrutements', en: 'manage hiring' },
      brand_site: { fr: 'trouver les bons profils à recruter', en: 'find the right candidates' },
    },
  }),
  travel_hospitality: verticalDefinition('travel_hospitality', {
    hints: ['voyage', 'travel', 'trip', 'hotel', 'hôtel', 'hospitality', 'booking', 'réservation', 'destination', 'accommodation', 'flight', 'séjour'],
    pathHints: ['/travel', '/booking', '/hotels', '/stays', '/flights', '/destinations'],
    defaultTopic: { fr: 'voyage et hébergement', en: 'travel and hospitality' },
    defaultOffer: { fr: 'organiser et réserver un voyage', en: 'plan and book travel' },
    topicBySiteType: {
      travel_booking: { fr: 'plateformes de voyage et réservation', en: 'travel booking platforms' },
      marketplace: { fr: 'marketplaces de voyage et hébergement', en: 'travel marketplaces' },
      brand_site: { fr: 'offres de voyage et hébergement', en: 'travel services' },
    },
    offerBySiteType: {
      travel_booking: { fr: 'réserver un voyage ou un hébergement', en: 'book a trip or stay' },
      marketplace: { fr: 'comparer des options de voyage et d’hébergement', en: 'compare travel and stay options' },
      brand_site: { fr: 'organiser un séjour', en: 'plan a stay' },
    },
  }),
  food_restaurants: verticalDefinition('food_restaurants', {
    hints: ['restaurant', 'restaurants', 'food', 'alimentation', 'menu', 'menus', 'delivery', 'livraison', 'coffee', 'café', 'grocery', 'cuisine'],
    pathHints: ['/menu', '/menus', '/restaurant', '/restaurants', '/delivery', '/food'],
    defaultTopic: { fr: 'restauration et alimentation', en: 'food and restaurants' },
    defaultOffer: { fr: 'commander ou réserver dans la restauration', en: 'order or book food services' },
    topicBySiteType: {
      local_service: { fr: 'restaurants et services alimentaires', en: 'food services' },
      ecommerce: { fr: 'boutiques food et lifestyle', en: 'food retail' },
      marketplace: { fr: 'plateformes de restauration', en: 'food marketplaces' },
    },
    offerBySiteType: {
      local_service: { fr: 'réserver ou commander dans un restaurant', en: 'book or order from a restaurant' },
      ecommerce: { fr: 'acheter des produits alimentaires en ligne', en: 'buy food online' },
      marketplace: { fr: 'comparer des options de restauration', en: 'compare food options' },
    },
  }),
  construction_home_services: verticalDefinition('construction_home_services', {
    hints: ['renovation', 'rénovation', 'construction', 'home services', 'plomberie', 'electricien', 'électricien', 'cleaning', 'ménage', 'repair', 'dépannage', 'artisan'],
    pathHints: ['/renovation', '/construction', '/home-services', '/repair', '/cleaning', '/services'],
    defaultTopic: { fr: 'travaux et services à domicile', en: 'construction and home services' },
    defaultOffer: { fr: 'réaliser des travaux ou une intervention à domicile', en: 'handle work at home' },
    topicBySiteType: {
      local_service: { fr: 'services de travaux et d’intervention', en: 'home service providers' },
      marketplace: { fr: 'plateformes de services à domicile', en: 'home services platforms' },
      brand_site: { fr: 'services pour la maison', en: 'home services' },
    },
    offerBySiteType: {
      local_service: { fr: 'planifier une intervention à domicile', en: 'schedule a home intervention' },
      marketplace: { fr: 'trouver un professionnel pour des travaux', en: 'find a home service professional' },
      brand_site: { fr: 'réaliser un projet de travaux', en: 'complete a home project' },
    },
  }),
  logistics_mobility: verticalDefinition('logistics_mobility', {
    hints: ['logistics', 'logistique', 'fleet', 'shipping', 'delivery', 'livraison', 'mobility', 'mobilité', 'transport management', 'route planning', 'dispatch'],
    pathHints: ['/logistics', '/shipping', '/delivery', '/fleet', '/mobility', '/transport'],
    defaultTopic: { fr: 'logistique et mobilité', en: 'logistics and mobility' },
    defaultOffer: { fr: 'organiser des déplacements et des livraisons', en: 'manage transport and deliveries' },
    topicBySiteType: {
      saas: { fr: 'logiciels de logistique et mobilité', en: 'logistics software' },
      brand_site: { fr: 'services de logistique et mobilité', en: 'logistics services' },
      travel_booking: { fr: 'services de transport et mobilité', en: 'mobility services' },
    },
    offerBySiteType: {
      saas: { fr: 'piloter ses opérations de transport et livraison', en: 'manage transport operations' },
      brand_site: { fr: 'organiser des transports et des livraisons', en: 'arrange transport and delivery' },
      travel_booking: { fr: 'préparer un déplacement', en: 'prepare a trip' },
    },
  }),
  public_sector_associations: verticalDefinition('public_sector_associations', {
    hints: ['service public', 'public service', 'association', 'fondation', 'foundation', 'nonprofit', 'non-profit', 'ngo', 'ong', 'citoyen', 'citizens', 'administration', 'mairie'],
    pathHints: ['/public', '/service-public', '/association', '/foundation', '/citizens', '/demarches'],
    defaultTopic: { fr: 'services publics et associatifs', en: 'public and nonprofit services' },
    defaultOffer: { fr: 'obtenir une information ou une aide fiable', en: 'get reliable public help' },
    topicBySiteType: {
      public_service_nonprofit: { fr: 'services publics et associatifs', en: 'public and nonprofit services' },
      documentation_knowledge: { fr: 'ressources publiques et associatives', en: 'public resources' },
      brand_site: { fr: 'services publics et associatifs', en: 'public or nonprofit services' },
    },
    offerBySiteType: {
      public_service_nonprofit: { fr: 'obtenir une information ou une aide fiable', en: 'get reliable information or help' },
      documentation_knowledge: { fr: 'trouver une information officielle fiable', en: 'find reliable official information' },
      brand_site: { fr: 'accéder à un service utile', en: 'access a useful service' },
    },
  }),
  general_business: verticalDefinition('general_business', {
    hints: [],
    defaultTopic: { fr: "offres et services de cette catégorie", en: 'services in this category' },
    defaultOffer: { fr: 'faire le bon choix parmi les options', en: 'choose among available options' },
  }),
};

const SITE_TYPE_TO_DEFAULT_VERTICAL: Record<SiteType, DomainVertical> = {
  local_service: 'construction_home_services',
  saas: 'general_business',
  ai_native: 'ai_automation',
  streaming_entertainment: 'general_business',
  marketplace: 'ecommerce_retail',
  education_training: 'education_training',
  documentation_knowledge: 'developer_tools',
  community_forum: 'developer_tools',
  travel_booking: 'travel_hospitality',
  jobs_recruitment: 'recruitment_jobs',
  public_service_nonprofit: 'public_sector_associations',
  ecommerce: 'ecommerce_retail',
  media: 'general_business',
  portfolio: 'general_business',
  brand_site: 'general_business',
  generic: 'general_business',
};

const SITE_TYPE_CANONICAL_TOPICS: Record<SiteType, readonly CanonicalIntentDefinition[]> = {
  local_service: [
    canonicalIntent('plumbing', 'plomberie', 'plumbing', ['plombier', 'plomberie', 'fuite', 'canalisation', 'sanitaire'], { pathHints: ['/plomberie', '/plombier'] }),
    canonicalIntent('electricity', 'électricité', 'electrical services', ['electricien', 'électricité', 'electrical', 'wiring', 'borne de recharge'], { pathHints: ['/electricite', '/electricien', '/electrical'] }),
    canonicalIntent('heating_cooling', 'chauffage et climatisation', 'heating and cooling', ['chauffage', 'climatisation', 'heat pump', 'pompe à chaleur', 'hvac'], { pathHints: ['/chauffage', '/climatisation', '/hvac'] }),
    canonicalIntent('legal_finance', 'services juridiques et financiers', 'legal and financial services', ['avocat', 'lawyer', 'juridique', 'legal', 'expert-comptable', 'accounting', 'fiscal'], { pathHints: ['/avocat', '/juridique', '/comptabilite', '/accounting'] }),
    canonicalIntent('health_wellness', 'santé et bien-être', 'health and wellness services', ['dentiste', 'médecin', 'therapist', 'thérapeute', 'kiné', 'wellness', 'beauty', 'coiffeur', 'spa'], { pathHints: ['/sante', '/health', '/beaute', '/beauty'] }),
    canonicalIntent('home_services', 'services à domicile', 'home services', ['rénovation', 'renovation', 'peinture', 'cleaning', 'ménage', 'demenagement', 'moving', 'serrurier', 'locksmith'], { pathHints: ['/renovation', '/cleaning', '/moving', '/serrurier'] }),
  ],
  saas: [
    canonicalIntent('crm_sales', 'CRM et vente', 'CRM and sales', ['crm', 'sales pipeline', 'lead', 'prospect', 'customer relationship', 'deal flow'], { pathHints: ['/crm', '/sales', '/pipeline'] }),
    canonicalIntent('project_ops', 'gestion de projet et opérations', 'project and operations management', ['project management', 'gestion de projet', 'task management', 'kanban', 'operations', 'workflow'], { pathHints: ['/project', '/projects', '/tasks', '/operations'] }),
    canonicalIntent('marketing_growth', 'marketing et croissance', 'marketing and growth', ['marketing automation', 'email marketing', 'growth', 'campaign', 'acquisition'], { pathHints: ['/marketing', '/campaigns', '/automation'] }),
    canonicalIntent('support_success', 'support et relation client', 'customer support and success', ['helpdesk', 'support', 'customer success', 'ticketing', 'knowledge base'], { pathHints: ['/support', '/helpdesk', '/customer-success'] }),
    canonicalIntent('finance_admin', 'finance et gestion administrative', 'finance and back office', ['billing', 'invoice', 'accounting', 'expense', 'payroll', 'facturation'], { pathHints: ['/billing', '/invoices', '/accounting', '/payroll'] }),
    canonicalIntent('analytics_data', 'analytics et pilotage', 'analytics and reporting', ['analytics', 'reporting', 'dashboard', 'business intelligence', 'metrics', 'kpi'], { pathHints: ['/analytics', '/reporting', '/dashboard'] }),
  ],
  ai_native: [
    canonicalIntent('ai_assistant', 'assistants IA généralistes', 'general AI assistants', ['assistant ai', 'ai assistant', 'copilot', 'chatbot', 'chat assistant', 'workspace ai'], { pathHints: ['/assistant', '/assistants', '/chat', '/copilot'] }),
    canonicalIntent('content_generation', 'génération de contenu', 'content generation', ['generate text', 'générer du texte', 'copywriting', 'content generation', 'writing assistant', 'marketing content'], { pathHints: ['/content', '/writing'] }),
    canonicalIntent('image_video_generation', 'génération d’images et de vidéos', 'image and video generation', ['image generation', 'video generation', 'images', 'vidéo', 'video', 'design generation'], { pathHints: ['/image', '/images', '/video', '/videos'] }),
    canonicalIntent('coding_assistant', 'assistants de code', 'coding assistants', ['code assistant', 'coding assistant', 'developer', 'programming', 'software engineer', 'dev tools'], { pathHints: ['/code', '/developers', '/dev', '/programming'] }),
    canonicalIntent('agent_automation', 'agents et automatisation', 'agents and automation', ['agent', 'agents', 'automation', 'workflow', 'task automation', 'agentic'], { pathHints: ['/agents', '/automation', '/workflows'] }),
    canonicalIntent('research_analysis', 'recherche et analyse', 'research and analysis', ['research', 'analyse', 'analysis', 'summarize', 'search', 'insights'], { pathHints: ['/research', '/analysis'] }),
  ],
  streaming_entertainment: [
    canonicalIntent('video_streaming', 'vidéo à la demande', 'video on demand', ['movie', 'movies', 'films', 'series', 'shows', 'vod', 'svod'], { pathHints: ['/watch', '/browse', '/movies', '/series'] }),
    canonicalIntent('audio_streaming', 'audio et podcasts', 'audio and podcasts', ['music', 'musique', 'podcast', 'audio', 'playlist'], { pathHints: ['/listen', '/music', '/podcasts'] }),
    canonicalIntent('live_streaming', 'streaming en direct', 'live streaming', ['live', 'broadcast', 'direct', 'sports live', 'tv live'], { pathHints: ['/live', '/tv'] }),
  ],
  marketplace: [
    canonicalIntent('products_marketplace', 'marketplaces de produits', 'product marketplaces', ['marketplace', 'catalog', 'product listings', 'vendeurs', 'products'], { pathHints: ['/products', '/catalog', '/sellers'] }),
    canonicalIntent('service_marketplace', 'marketplaces de services', 'service marketplaces', ['freelance', 'prestataire', 'provider', 'experts', 'service marketplace'], { pathHints: ['/services', '/experts', '/freelancers'] }),
    canonicalIntent('travel_property_marketplace', 'marketplaces de séjours et locations', 'travel and rental marketplaces', ['rentals', 'location', 'hébergement', 'stay', 'booking marketplace'], { pathHints: ['/stays', '/rentals', '/booking'] }),
    canonicalIntent('secondhand_marketplace', 'marketplaces de seconde main', 'second-hand marketplaces', ['second hand', 'occasion', 'resale', 'used products', 'pre-owned'], { pathHints: ['/second-hand', '/occasion', '/resale'] }),
  ],
  education_training: [
    canonicalIntent('tech_learning', 'formation tech et data', 'tech and data learning', ['programming', 'code', 'data', 'analytics', 'ai', 'software'], { pathHints: ['/courses', '/academy', '/learn', '/bootcamp'] }),
    canonicalIntent('business_learning', 'formation business et marketing', 'business and marketing learning', ['marketing', 'sales', 'business', 'management', 'leadership'], { pathHints: ['/marketing', '/business', '/management'] }),
    canonicalIntent('language_learning', 'apprentissage des langues', 'language learning', ['language', 'langue', 'english', 'anglais', 'spanish', 'french lessons'], { pathHints: ['/languages', '/english', '/langues'] }),
    canonicalIntent('creative_learning', 'formation design et création', 'design and creative learning', ['design', 'ux', 'ui', 'creative', 'photo', 'video editing'], { pathHints: ['/design', '/creative'] }),
    canonicalIntent('certification_learning', 'préparation aux certifications', 'certification prep', ['certification', 'certificate', 'exam prep', 'credential'], { pathHints: ['/certification', '/certifications', '/exam'] }),
  ],
  documentation_knowledge: [
    canonicalIntent('product_docs', 'documentation produit', 'product documentation', ['product docs', 'documentation produit', 'getting started', 'product guide'], { pathHints: ['/docs', '/documentation', '/getting-started'] }),
    canonicalIntent('api_docs', 'documentation API', 'API documentation', ['api', 'sdk', 'reference', 'api reference', 'developer docs'], { pathHints: ['/api', '/reference', '/developers'] }),
    canonicalIntent('help_center', 'centre d’aide et support', 'help center and support docs', ['help center', 'knowledge base', 'support docs', 'faq', 'troubleshooting'], { pathHints: ['/help', '/support', '/faq', '/knowledge-base'] }),
    canonicalIntent('tutorials_guides', 'guides et tutoriels', 'guides and tutorials', ['guide', 'tutorial', 'how-to', 'walkthrough', 'manual'], { pathHints: ['/guides', '/tutorials', '/manual'] }),
  ],
  community_forum: [
    canonicalIntent('developer_community', 'communautés développeurs', 'developer communities', ['developer community', 'programming forum', 'dev forum', 'api discussion', 'open source'], { pathHints: ['/community', '/forum', '/developers'] }),
    canonicalIntent('product_community', 'communautés produit et support', 'product and support communities', ['support forum', 'customer community', 'user community', 'product feedback'], { pathHints: ['/community', '/forum', '/support'] }),
    canonicalIntent('creator_community', 'communautés créatives', 'creator communities', ['creator community', 'design community', 'creative community', 'portfolio forum'], { pathHints: ['/community', '/creators'] }),
    canonicalIntent('hobby_community', 'communautés thématiques', 'interest communities', ['gaming community', 'fan community', 'discussion forum', 'members forum'], { pathHints: ['/forum', '/discussions'] }),
  ],
  travel_booking: [
    canonicalIntent('accommodation', 'réservation d’hébergements', 'accommodation booking', ['hotel', 'hôtel', 'accommodation', 'stay', 'vacation rental', 'room'], { pathHints: ['/hotels', '/stays', '/rentals'] }),
    canonicalIntent('flights_transport', 'réservation de transports', 'transport booking', ['flight', 'vol', 'train', 'bus', 'transport', 'tickets'], { pathHints: ['/flights', '/train', '/transport'] }),
    canonicalIntent('trip_planning', 'organisation de voyages', 'trip planning', ['trip', 'voyage', 'itinerary', 'destination', 'travel planning'], { pathHints: ['/destinations', '/travel-guides', '/trips'] }),
    canonicalIntent('car_rental', 'location de voiture', 'car rental', ['car rental', 'location de voiture', 'rental car', 'vehicle rental'], { pathHints: ['/car-rental', '/cars'] }),
  ],
  jobs_recruitment: [
    canonicalIntent('general_jobs', 'offres d’emploi', 'job listings', ['jobs', 'emploi', 'careers', 'job board', 'job search'], { pathHints: ['/jobs', '/careers'] }),
    canonicalIntent('recruitment_software', 'recrutement et sourcing', 'recruitment and sourcing', ['recruitment', 'hiring', 'talent', 'sourcing', 'ats'], { pathHints: ['/recruitment', '/hiring'] }),
    canonicalIntent('freelance_work', 'missions freelance', 'freelance work', ['freelance', 'contract work', 'missions', 'gig', 'independent'], { pathHints: ['/freelance', '/contracts'] }),
    canonicalIntent('tech_remote_jobs', 'emplois tech et remote', 'tech and remote jobs', ['remote jobs', 'tech jobs', 'developer jobs', 'engineering roles'], { pathHints: ['/remote', '/tech-jobs'] }),
  ],
  public_service_nonprofit: [
    canonicalIntent('administrative_services', 'démarches administratives', 'administrative services', ['démarches', 'administrative', 'procedure', 'formulaire', 'official process'], { pathHints: ['/services', '/demarches', '/forms'] }),
    canonicalIntent('social_help', 'aides et accompagnement', 'social help and support', ['aide', 'help', 'support', 'accompagnement', 'benefits'], { pathHints: ['/help', '/support', '/aides'] }),
    canonicalIntent('civic_information', 'information citoyenne', 'civic information', ['citoyen', 'public information', 'official information', 'rights', 'public service'], { pathHints: ['/information', '/citizens'] }),
    canonicalIntent('nonprofit_resources', 'ressources associatives', 'nonprofit resources', ['association', 'foundation', 'nonprofit', 'solidarity', 'charity'], { pathHints: ['/association', '/foundation'] }),
  ],
  ecommerce: [
    canonicalIntent('fashion_beauty', 'mode et beauté', 'fashion and beauty', ['fashion', 'mode', 'beauty', 'beaute', 'skincare', 'apparel'], { pathHints: ['/fashion', '/beauty', '/collections'] }),
    canonicalIntent('home_living', 'maison et décoration', 'home and living', ['home decor', 'maison', 'furniture', 'decoration', 'living'], { pathHints: ['/home', '/decor', '/furniture'] }),
    canonicalIntent('electronics', 'électronique et tech', 'electronics and tech', ['electronics', 'tech', 'gadgets', 'devices', 'computers'], { pathHints: ['/electronics', '/tech', '/computers'] }),
    canonicalIntent('sports_outdoor', 'sport et outdoor', 'sports and outdoor', ['sport', 'fitness', 'outdoor', 'running', 'cycling'], { pathHints: ['/sport', '/sports', '/outdoor'] }),
    canonicalIntent('food_lifestyle', 'alimentation et lifestyle', 'food and lifestyle', ['food', 'grocery', 'coffee', 'wellness products', 'lifestyle'], { pathHints: ['/food', '/grocery', '/lifestyle'] }),
  ],
  media: [
    canonicalIntent('general_news', 'actualité générale', 'general news', ['news', 'actualité', 'breaking', 'headline', 'coverage'], { pathHints: ['/news', '/latest'] }),
    canonicalIntent('tech_media', 'actualité tech', 'technology news', ['technology', 'tech', 'startup', 'software', 'developer'], { pathHints: ['/tech', '/technology'] }),
    canonicalIntent('business_media', 'actualité business et finance', 'business and finance news', ['business', 'finance', 'markets', 'economy', 'investing'], { pathHints: ['/business', '/finance', '/markets'] }),
    canonicalIntent('sports_media', 'actualité sportive', 'sports news', ['sports', 'football', 'basketball', 'tennis', 'match'], { pathHints: ['/sports', '/sport'] }),
    canonicalIntent('culture_media', 'culture et divertissement', 'culture and entertainment', ['culture', 'entertainment', 'music', 'cinema', 'tv'], { pathHints: ['/culture', '/entertainment'] }),
  ],
  portfolio: [
    canonicalIntent('design_portfolio', 'design et produit', 'design and product', ['designer', 'design', 'ux', 'ui', 'product designer', 'branding'], { pathHints: ['/projects', '/portfolio', '/design'] }),
    canonicalIntent('dev_portfolio', 'développement web et logiciel', 'web and software development', ['developer', 'development', 'software engineer', 'frontend', 'backend', 'full-stack'], { pathHints: ['/projects', '/portfolio', '/development'] }),
    canonicalIntent('photo_video_portfolio', 'photo et vidéo', 'photo and video', ['photography', 'photo', 'video', 'filmmaker', 'motion'], { pathHints: ['/portfolio', '/work', '/photography'] }),
    canonicalIntent('consulting_portfolio', 'conseil et stratégie', 'consulting and strategy', ['consultant', 'strategy', 'marketing consultant', 'advisor', 'coach'], { pathHints: ['/services', '/consulting'] }),
  ],
  brand_site: [],
  generic: [],
};

const SITE_TYPE_CANONICAL_OFFERS: Record<SiteType, readonly CanonicalIntentDefinition[]> = {
  local_service: [
    canonicalIntent('urgent_repair', 'un dépannage urgent', 'urgent repair', ['urgence', 'urgent', 'repair', 'dépannage', 'emergency'], { pathHints: ['/urgence', '/emergency'] }),
    canonicalIntent('installation_project', 'une installation ou un chantier', 'an installation project', ['installation', 'install', 'renovation', 'rénovation', 'project'], { pathHints: ['/installation', '/renovation'] }),
    canonicalIntent('maintenance_visit', 'un entretien ou une maintenance', 'maintenance services', ['maintenance', 'entretien', 'service plan', 'inspection'], { pathHints: ['/maintenance', '/entretien'] }),
    canonicalIntent('appointment_consultation', 'un rendez-vous ou une consultation', 'an appointment or consultation', ['appointment', 'rendez-vous', 'consultation', 'book'], { pathHints: ['/booking', '/appointment', '/rendez-vous'] }),
  ],
  saas: [
    canonicalIntent('crm_workflow', 'gérer sa relation client', 'manage customer relationships', ['crm', 'sales', 'lead', 'customer relationship']),
    canonicalIntent('project_workflow', 'piloter des projets et des tâches', 'manage projects and tasks', ['project management', 'task management', 'kanban', 'workflow']),
    canonicalIntent('marketing_workflow', 'automatiser son marketing', 'automate marketing', ['marketing automation', 'campaign', 'email marketing', 'growth']),
    canonicalIntent('support_workflow', 'gérer son support client', 'run customer support', ['support', 'helpdesk', 'ticketing', 'customer success']),
    canonicalIntent('analytics_workflow', 'suivre ses performances', 'track performance', ['analytics', 'reporting', 'dashboard', 'metrics']),
  ],
  ai_native: [
    canonicalIntent('writing_use_case', 'rédiger plus vite', 'write faster', ['writing', 'copy', 'email', 'text generation', 'rédaction']),
    canonicalIntent('visual_generation_use_case', 'générer des visuels', 'generate visuals', ['image', 'video', 'visual', 'design generation']),
    canonicalIntent('automation_use_case', 'automatiser des tâches', 'automate tasks', ['automation', 'agents', 'workflow', 'task automation']),
    canonicalIntent('coding_use_case', 'accélérer le développement', 'accelerate development', ['coding', 'developer', 'programming', 'software engineer']),
    canonicalIntent('research_use_case', 'rechercher et synthétiser des informations', 'research and synthesize information', ['research', 'analysis', 'summarize', 'search']),
  ],
  streaming_entertainment: [
    canonicalIntent('watch_fiction', 'regarder des films et séries', 'watch movies and series', ['movie', 'movies', 'films', 'series', 'shows']),
    canonicalIntent('listen_audio', 'écouter de la musique ou des podcasts', 'listen to music or podcasts', ['music', 'musique', 'podcast', 'audio']),
    canonicalIntent('watch_live', 'suivre du contenu en direct', 'watch live content', ['live', 'broadcast', 'sports live']),
  ],
  marketplace: [
    canonicalIntent('compare_marketplace_offers', 'des offres comparables', 'comparable offers', ['compare', 'comparison', 'filters', 'results']),
    canonicalIntent('find_trusted_seller', 'un vendeur fiable', 'a trusted seller', ['trusted seller', 'vendor', 'seller', 'vendeur']),
    canonicalIntent('find_service_provider', 'un prestataire fiable', 'a trusted provider', ['provider', 'prestataire', 'expert', 'freelance']),
    canonicalIntent('sell_on_marketplace', 'une plateforme pour vendre', 'a platform to sell on', ['sell', 'selling', 'merchant', 'become a seller']),
  ],
  education_training: [
    canonicalIntent('learn_programming', 'apprendre des compétences tech', 'learn technical skills', ['code', 'programming', 'data', 'ai', 'software']),
    canonicalIntent('learn_business', 'monter en compétences en business', 'improve business skills', ['marketing', 'business', 'sales', 'management']),
    canonicalIntent('learn_language', 'apprendre une langue', 'learn a language', ['language', 'english', 'anglais', 'spanish', 'french']),
    canonicalIntent('prepare_certification', 'préparer une certification', 'prepare a certification', ['certification', 'certificate', 'exam']),
  ],
  documentation_knowledge: [
    canonicalIntent('getting_started', 'les premiers pas avec un produit', 'getting started with a product', ['getting started', 'quickstart', 'start', 'onboarding']),
    canonicalIntent('api_integration', 'une intégration API', 'an API integration', ['api', 'sdk', 'integration', 'webhook']),
    canonicalIntent('troubleshooting', 'un problème technique', 'a technical issue', ['troubleshooting', 'error', 'issue', 'problem', 'fix']),
    canonicalIntent('reference_lookup', 'une référence technique', 'technical reference docs', ['reference', 'api reference', 'spec', 'manual']),
  ],
  community_forum: [
    canonicalIntent('ask_technical_questions', 'un problème technique', 'a technical question', ['question', 'questions', 'problem', 'issue', 'help']),
    canonicalIntent('get_peer_feedback', 'des retours d’expérience', 'peer feedback', ['feedback', 'experience', 'retours', 'stories']),
    canonicalIntent('product_help', 'un produit ou un service', 'product help', ['support forum', 'customer community', 'product help']),
    canonicalIntent('peer_discussion', 'un échange entre pairs', 'peer discussion', ['discussion', 'peer', 'community', 'members']),
  ],
  travel_booking: [
    canonicalIntent('book_hotel', 'réserver un hébergement', 'book accommodation', ['hotel', 'room', 'stay', 'accommodation']),
    canonicalIntent('book_transport', 'réserver un transport', 'book transport', ['flight', 'train', 'transport', 'tickets']),
    canonicalIntent('plan_trip', 'organiser un voyage', 'plan a trip', ['trip', 'voyage', 'destination', 'itinerary']),
    canonicalIntent('rent_car', 'louer une voiture', 'rent a car', ['car rental', 'vehicle rental', 'location de voiture']),
  ],
  jobs_recruitment: [
    canonicalIntent('find_job_offer', 'trouver un emploi', 'find a job', ['job search', 'jobs', 'emploi', 'career opportunities']),
    canonicalIntent('recruit_profiles', 'recruter les bons profils', 'hire the right profiles', ['recruit', 'hiring', 'talent', 'candidate']),
    canonicalIntent('publish_opening', 'publier une offre d’emploi', 'publish a job opening', ['post a job', 'job posting', 'publish', 'employer']),
    canonicalIntent('find_freelance_mission', 'trouver une mission freelance', 'find freelance work', ['freelance', 'contract work', 'missions']),
  ],
  public_service_nonprofit: [
    canonicalIntent('complete_process', 'effectuer une démarche', 'complete a process', ['démarches', 'procedure', 'formulaire', 'administrative']),
    canonicalIntent('find_public_help', 'trouver une aide adaptée', 'find the right help', ['aide', 'support', 'assistance', 'benefits']),
    canonicalIntent('contact_public_org', 'contacter le bon organisme', 'contact the right organization', ['contact', 'organisme', 'administration', 'service public']),
    canonicalIntent('get_reliable_info', 'obtenir une information fiable', 'get reliable information', ['information', 'official', 'citoyen', 'public information']),
  ],
  ecommerce: [
    canonicalIntent('buy_fashion_beauty', 'acheter des produits mode et beauté', 'buy fashion and beauty products', ['fashion', 'beauty', 'apparel', 'skincare']),
    canonicalIntent('buy_home_living', 'équiper sa maison', 'shop for home and living', ['home decor', 'maison', 'furniture', 'living']),
    canonicalIntent('buy_tech', 'acheter des produits tech', 'buy tech products', ['electronics', 'tech', 'gadgets', 'devices']),
    canonicalIntent('buy_sports', 'trouver des produits sport et outdoor', 'shop sports and outdoor products', ['sport', 'fitness', 'outdoor']),
  ],
  media: [
    canonicalIntent('read_general_news', 'l’actualité générale', 'general news', ['actualité', 'news', 'breaking', 'headline']),
    canonicalIntent('read_tech_news', 'l’actualité tech', 'tech news', ['tech', 'technology', 'startup', 'software']),
    canonicalIntent('read_business_news', 'l’actualité business et finance', 'business and finance news', ['business', 'finance', 'markets', 'economy']),
    canonicalIntent('read_sports_news', 'l’actualité sportive', 'sports news', ['sports', 'football', 'basketball', 'match']),
    canonicalIntent('read_culture_news', 'des contenus culture et divertissement', 'culture and entertainment coverage', ['culture', 'entertainment', 'music', 'cinema']),
  ],
  portfolio: [
    canonicalIntent('hire_designer', 'trouver un designer', 'hire a designer', ['designer', 'ux', 'ui', 'branding']),
    canonicalIntent('hire_developer', 'recruter un développeur freelance', 'hire a freelance developer', ['developer', 'frontend', 'backend', 'full-stack']),
    canonicalIntent('hire_visual_creator', 'contacter un photographe ou vidéaste', 'hire a photographer or videographer', ['photography', 'video', 'filmmaker', 'motion']),
    canonicalIntent('hire_consultant', 'choisir un consultant', 'hire a consultant', ['consultant', 'strategy', 'advisor', 'coach']),
  ],
  brand_site: [],
  generic: [],
};

const UNKNOWN_VALUES = new Set(['', 'unknown', 'null', 'n/a', 'na', '-']);
const PROMOTIONAL_FRAGMENT_PATTERN =
  /\b(vous|votre|vos|ton|ta|tes|your|yours|our|nous|gratuit|gratuite|free|trial|essai|abonnez-vous|subscribe|juste)\b/i;
const PRICING_FRAGMENT_PATTERN = /\b\d+(?:[.,]\d+)?\s?(?:€|euros?|usd|\$)\b/i;
const PROMPT_GEO_JUNK_PATTERN =
  /\b(?:conditions? générales?|conditions of use|conditions of sale|terms(?: of service| of use)?|privacy|politique(?: de)? confidentialité|confidentialité|mentions? légales?|cookies?|cookie policy|cgu|cgv|all rights reserved|copyright)\b/i;
const LEADING_IMPERATIVE_REPLACEMENTS: Record<string, string> = {
  regardez: 'regarder',
  découvrez: 'découvrir',
  decouvrez: 'découvrir',
  comparez: 'comparer',
  trouvez: 'trouver',
  choisissez: 'choisir',
  gérez: 'gérer',
  gerez: 'gérer',
  créez: 'créer',
  creez: 'créer',
  suivez: 'suivre',
  obtenez: 'obtenir',
  profitez: 'profiter',
  lancez: 'lancer',
};
const DYNAMIC_HEADLINE_YEAR_EVENT_PATTERN =
  /\b(?:19|20)\d{2}\b.*\b(?:winner|winners|election|elections|tournament|tournaments|playoff|playoffs|championship|championships|primary|primaries|final|finale)\b/i;
const DYNAMIC_HEADLINE_EVENT_PATTERN =
  /\b(?:ceasefire|war|conflict|winner|winners|election|elections|tournament|tournaments|playoff|playoffs|championship|championships|primary|primaries|odds|poll|polls)\b/i;
const DYNAMIC_HEADLINE_TEMPORAL_PATTERN =
  /\b(?:breaking|latest|live|today|tonight|tomorrow|this week|this month|right now)\b/i;
const DYNAMIC_MATCHUP_PATTERN =
  /\b[\p{Lu}][\p{L}'’-]+\s+(?:vs\.?|x)\s+[\p{Lu}][\p{L}'’-]+\b/u;
const DYNAMIC_TOPIC_TOKEN_PATTERN =
  /^(?:\d{4}|winner|winners|election|elections|tournament|tournaments|playoff|playoffs|championship|championships|ceasefire|war|conflict|odds|poll|polls|latest|live|today|tonight|tomorrow)$/i;

const SITE_TYPES: SiteType[] = [
  'local_service',
  'saas',
  'ai_native',
  'streaming_entertainment',
  'marketplace',
  'education_training',
  'documentation_knowledge',
  'community_forum',
  'travel_booking',
  'jobs_recruitment',
  'public_service_nonprofit',
  'ecommerce',
  'media',
  'portfolio',
  'brand_site',
  'generic',
];

const SPECIALIZED_SITE_TYPES: SiteType[] = SITE_TYPES.filter(
  (siteType) => siteType !== 'brand_site' && siteType !== 'generic'
);

type SiteTypeScores = Record<SiteType, number>;
type SiteTypeReasonMap = Record<SiteType, string[]>;

type SiteClassification = {
  siteType: SiteType;
  confidenceScore: number;
  runnerUpType: SiteType;
  signalsMatched: string[];
  classificationReason: string;
  siteTypeScores: SiteTypeScores;
};

const SITE_TYPE_TO_FAMILY: Record<SiteType, SiteFamily> = {
  local_service: 'service_family',
  saas: 'software_family',
  ai_native: 'software_family',
  streaming_entertainment: 'content_family',
  marketplace: 'commerce_family',
  education_training: 'learning_family',
  documentation_knowledge: 'software_family',
  community_forum: 'content_family',
  travel_booking: 'service_family',
  jobs_recruitment: 'service_family',
  public_service_nonprofit: 'institutional_family',
  ecommerce: 'commerce_family',
  media: 'content_family',
  portfolio: 'service_family',
  brand_site: 'generic_family',
  generic: 'generic_family',
};

const SITE_FAMILY_LABELS: Record<SiteFamily, Record<PromptLanguage, string>> = {
  software_family: { fr: 'logiciels et plateformes numériques', en: 'software platforms' },
  content_family: { fr: 'plateformes de contenu', en: 'content platforms' },
  commerce_family: { fr: 'plateformes de commerce en ligne', en: 'commerce platforms' },
  service_family: { fr: 'services et prestataires', en: 'services and providers' },
  institutional_family: { fr: 'ressources publiques et associatives', en: 'public and nonprofit resources' },
  learning_family: { fr: 'plateformes de formation', en: 'learning platforms' },
  generic_family: { fr: 'acteurs du secteur', en: 'category players' },
};

const SITE_FAMILY_DEFAULT_INTENT: Record<SiteFamily, Record<PromptLanguage, string>> = {
  software_family: { fr: 'mieux s’équiper avec un logiciel', en: 'equip yourself with the right software' },
  content_family: { fr: 'accéder à du contenu en ligne', en: 'access content online' },
  commerce_family: { fr: 'comparer des offres en ligne', en: 'compare online offers' },
  service_family: { fr: 'trouver le bon prestataire', en: 'find the right provider' },
  institutional_family: { fr: 'obtenir une information ou une aide fiable', en: 'get reliable information or help' },
  learning_family: { fr: 'se former efficacement', en: 'learn effectively' },
  generic_family: { fr: 'comparer les acteurs du secteur', en: 'compare category players' },
};

const PROMPT_LEVEL_ORDER: Record<PromptGenerationLevel, number> = {
  brand: 0,
  family: 1,
  controlled: 2,
  exact: 3,
};

const SITE_TYPE_PROMPT_ACTORS: Record<
  SiteType,
  Record<PromptLanguage, { plural: string; singular: string; pluralLead?: string; singularLead?: string }>
> = {
  local_service: {
    fr: { plural: 'professionnels', singular: 'professionnel', pluralLead: 'Quels', singularLead: 'Quel' },
    en: { plural: 'providers', singular: 'provider' },
  },
  saas: {
    fr: { plural: 'logiciels', singular: 'logiciel', pluralLead: 'Quels', singularLead: 'Quel' },
    en: { plural: 'software tools', singular: 'software tool' },
  },
  ai_native: {
    fr: { plural: 'outils IA', singular: 'outil IA', pluralLead: 'Quels', singularLead: 'Quel' },
    en: { plural: 'AI tools', singular: 'AI tool' },
  },
  streaming_entertainment: {
    fr: { plural: 'plateformes', singular: 'plateforme', pluralLead: 'Quelles', singularLead: 'Quelle' },
    en: { plural: 'platforms', singular: 'platform' },
  },
  marketplace: {
    fr: { plural: 'plateformes', singular: 'plateforme', pluralLead: 'Quelles', singularLead: 'Quelle' },
    en: { plural: 'platforms', singular: 'platform' },
  },
  education_training: {
    fr: { plural: 'formations', singular: 'formation', pluralLead: 'Quelles', singularLead: 'Quelle' },
    en: { plural: 'training platforms', singular: 'training platform' },
  },
  documentation_knowledge: {
    fr: { plural: 'ressources', singular: 'ressource', pluralLead: 'Quelles', singularLead: 'Quelle' },
    en: { plural: 'resources', singular: 'resource' },
  },
  community_forum: {
    fr: { plural: 'communautés', singular: 'communauté', pluralLead: 'Quelles', singularLead: 'Quelle' },
    en: { plural: 'communities', singular: 'community' },
  },
  travel_booking: {
    fr: { plural: 'plateformes', singular: 'plateforme', pluralLead: 'Quelles', singularLead: 'Quelle' },
    en: { plural: 'platforms', singular: 'platform' },
  },
  jobs_recruitment: {
    fr: { plural: 'plateformes', singular: 'plateforme', pluralLead: 'Quelles', singularLead: 'Quelle' },
    en: { plural: 'platforms', singular: 'platform' },
  },
  public_service_nonprofit: {
    fr: { plural: 'organismes', singular: 'organisme', pluralLead: 'Quels', singularLead: 'Quel' },
    en: { plural: 'organizations', singular: 'organization' },
  },
  ecommerce: {
    fr: { plural: 'boutiques', singular: 'boutique', pluralLead: 'Quelles', singularLead: 'Quelle' },
    en: { plural: 'stores', singular: 'store' },
  },
  media: {
    fr: { plural: 'sources', singular: 'source', pluralLead: 'Quelles', singularLead: 'Quelle' },
    en: { plural: 'sources', singular: 'source' },
  },
  portfolio: {
    fr: { plural: 'profils', singular: 'profil', pluralLead: 'Quels', singularLead: 'Quel' },
    en: { plural: 'profiles', singular: 'profile' },
  },
  brand_site: {
    fr: { plural: 'acteurs', singular: 'acteur', pluralLead: 'Quels', singularLead: 'Quel' },
    en: { plural: 'players', singular: 'player' },
  },
  generic: {
    fr: { plural: 'acteurs', singular: 'acteur', pluralLead: 'Quels', singularLead: 'Quel' },
    en: { plural: 'players', singular: 'player' },
  },
};

const NEUTRAL_ACTOR_FALLBACK: Record<PromptLanguage, { plural: string; singular: string; pluralLead: string; singularLead: string }> = {
  fr: { plural: 'solutions', singular: 'solution', pluralLead: 'Quelles', singularLead: 'Quelle' },
  en: { plural: 'solutions', singular: 'solution', pluralLead: 'Which', singularLead: 'Which' },
};

const ACTOR_DEGRADATION_EXEMPT_SITE_TYPES: ReadonlySet<SiteType> = new Set([
  'media',
  'documentation_knowledge',
  'community_forum',
  'public_service_nonprofit',
  'generic',
  'brand_site',
]);

export function generatePrompts(
  params: GeneratePromptsParams
): { prompts: PromptQuery[]; profile: PromptGenerationProfile } {
  const profile = params.scanContext
    ? buildPromptProfileFromScanContext(params)
    : buildPromptProfile(params);
  const scoringDrafts = (
    params.scanContext
      ? buildDeterministicPromptSetFromScanContext(params.scanContext, profile)
      : buildDeterministicPromptSet(profile)
  ).slice(0, TARGET_PROMPT_COUNT);
  const insightDrafts = buildInsightPromptSet(profile).slice(0, TARGET_INSIGHT_PROMPT_COUNT);

  const prompts = [...scoringDrafts, ...insightDrafts].map((draft, index) => ({
    id: `prompt-${index + 1}`,
    prompt: draft.prompt,
    category: draft.category,
    language: profile.language,
    visibility: draft.visibility,
    benchmarkGroup: draft.benchmarkGroup,
    brandAnchored:
      draft.brandAnchored ??
      promptTargetsSiteName(draft.prompt, profile.siteName),
    analysisTrack: draft.analysisTrack ?? 'scoring',
    affectsVisibilityScore: draft.affectsVisibilityScore ?? (draft.analysisTrack !== 'insight'),
    affectsCitationMatrix: draft.affectsCitationMatrix ?? (draft.analysisTrack !== 'insight'),
  }));

  return {
    prompts,
    profile,
  };
}

function buildInsightPromptSet(profile: PromptGenerationProfile): PromptDraft[] {
  const { language, siteName, mainOffer, safeIntentBucket, siteFamily } = profile;
  const focusNeed = normalizePrompt(mainOffer || safeIntentBucket || profile.mainTopic);
  const valueAxisPrompt =
    siteFamily === 'content_family' || siteFamily === 'institutional_family'
      ? language === 'fr'
        ? `Comment ${siteName} est-il perçu en termes de fiabilité, clarté et valeur perçue face aux alternatives pour ${focusNeed} ?`
        : `How is ${siteName} perceived in terms of reliability, clarity, and perceived value compared with alternatives for ${focusNeed}?`
      : language === 'fr'
      ? `Comment ${siteName} se positionne-t-il sur le prix, la valeur perçue et la fiabilité face aux alternatives pour ${focusNeed} ?`
      : `How does ${siteName} compare on price, perceived value, and reliability against alternatives for ${focusNeed}?`;

  const prompts =
    language === 'fr'
      ? [
          draft(
            `Quels sont les principaux points forts et limites de ${siteName} face aux alternatives pour ${focusNeed} ?`,
            'comparison',
            {
              visibility: 'hidden',
              benchmarkGroup: 'competitor',
              brandAnchored: true,
              analysisTrack: 'insight',
              affectsVisibilityScore: false,
              affectsCitationMatrix: false,
            }
          ),
          draft(valueAxisPrompt, 'comparison', {
            visibility: 'hidden',
            benchmarkGroup: 'competitor',
            brandAnchored: true,
            analysisTrack: 'insight',
            affectsVisibilityScore: false,
            affectsCitationMatrix: false,
          }),
        ]
      : [
          draft(
            `What are the main strengths and limitations of ${siteName} compared with alternatives for ${focusNeed}?`,
            'comparison',
            {
              visibility: 'hidden',
              benchmarkGroup: 'competitor',
              brandAnchored: true,
              analysisTrack: 'insight',
              affectsVisibilityScore: false,
              affectsCitationMatrix: false,
            }
          ),
          draft(valueAxisPrompt, 'comparison', {
            visibility: 'hidden',
            benchmarkGroup: 'competitor',
            brandAnchored: true,
            analysisTrack: 'insight',
            affectsVisibilityScore: false,
            affectsCitationMatrix: false,
          }),
        ];

  return dedupePrompts(prompts);
}

function buildDeterministicPromptSetFromScanContext(
  scanContext: AuditScanContext,
  profile: PromptGenerationProfile
): PromptDraft[] {
  return buildQuestionnairePrompts(scanContext, profile.language);
}

function getQuestionnaireActivityDetail(scanContext: AuditScanContext): string | null {
  const detail = scanContext.activityDetail;
  if (typeof detail !== 'string') return null;
  return detail.trim().length > 0 ? detail : null;
}

function getQuestionnaireActivityEntry(scanContext: AuditScanContext) {
  return getPaidScanActivityCatalogEntry(scanContext.type, scanContext.activity);
}

function getScanContextPromptFamily(scanContext: AuditScanContext): PaidScanPromptFamily {
  if (scanContext.promptFamily) {
    return scanContext.promptFamily;
  }

  switch (scanContext.type) {
    case 'commerce_restauration':
    case 'prestataire_local':
      return 'local_service';
    case 'agence_studio':
      return 'agency_service';
    case 'saas_application':
      return 'software_tool';
    case 'ia_assistants':
      return 'ai_tool';
    case 'plateforme_annuaire':
      return 'platform';
    case 'ecommerce':
      return 'ecommerce_shop';
    case 'etablissement_institution':
      return 'institutional_actor';
    default:
      return scanContext.discoveryMode === 'local_places' ? 'local_service' : 'software_tool';
  }
}

function inferFrenchIndefiniteArticle(label: string): 'un' | 'une' {
  return inferFrenchLeadForLabel(label, 'singular') === 'Quelle' ? 'une' : 'un';
}

function inferEnglishIndefiniteArticle(label: string): 'a' | 'an' {
  const normalized = normalizeNullableText(label)?.toLowerCase() || '';
  return /^[aeiouyh]/.test(normalized) ? 'an' : 'a';
}

function getQuestionnaireLocationValue(
  scanContext: AuditScanContext,
  language: PromptLanguage
): string | null {
  const city = normalizeNullableText(scanContext.city);
  if (!city) return null;
  return city || (language === 'fr' ? 'votre ville' : 'your city');
}

function getQuestionnaireLocationSuffix(
  scanContext: AuditScanContext,
  language: PromptLanguage
): string {
  const location = getQuestionnaireLocationValue(scanContext, language);
  if (!location) return '';
  return language === 'fr' ? ` à ${location}` : ` in ${location}`;
}

function startsWithFrenchElisionCandidate(value: string): boolean {
  return /^[aeiouyhàâäæéèêëîïôöœùûü]/i.test(value);
}

function getFrenchDePhrase(value: string): string {
  return startsWithFrenchElisionCandidate(value) ? `d'${value}` : `de ${value}`;
}

function getQuestionnaireQualifiedActor(
  scanContext: AuditScanContext,
  plurality: 'singular' | 'plural'
): string {
  const entry = getQuestionnaireActivityEntry(scanContext);
  const detail = getQuestionnaireActivityDetail(scanContext);

  if (!entry) {
    return plurality === 'singular' ? scanContext.actorSingular : scanContext.actorPlural;
  }

  return buildPaidScanQualifiedActorLabel(entry, detail, plurality);
}

function getQuestionnaireActorSearchPhrase(
  scanContext: AuditScanContext,
  language: PromptLanguage
): string {
  const actor = getQuestionnaireQualifiedActor(scanContext, 'singular');

  if (language === 'fr') {
    return `${inferFrenchIndefiniteArticle(actor)} ${actor}`;
  }

  return `${inferEnglishIndefiniteArticle(actor)} ${actor}`;
}

function getQuestionnaireSearchClause(
  scanContext: AuditScanContext,
  language: PromptLanguage
): string {
  const actorPhrase = getQuestionnaireActorSearchPhrase(scanContext, language);
  const locationSuffix = getQuestionnaireLocationSuffix(scanContext, language);
  return `${actorPhrase}${locationSuffix}`;
}

function buildQuestionnaireDirectChoicePrompt(
  scanContext: AuditScanContext,
  language: PromptLanguage
): string {
  const actor = getQuestionnaireQualifiedActor(scanContext, 'singular');
  const locationSuffix = getQuestionnaireLocationSuffix(scanContext, language);
  const promptFamily = getScanContextPromptFamily(scanContext);

  if (language === 'fr') {
    const actorLead = inferFrenchLeadForLabel(actor, 'singular');
    const verb = promptFamily === 'institutional_actor' ? 'consulter' : 'choisir';
    return `${actorLead} ${actor} ${verb}${locationSuffix} ?`;
  }

  const verb = promptFamily === 'institutional_actor' ? 'consult' : 'choose';
  return `Which ${actor} should I ${verb}${locationSuffix}?`;
}

function buildQuestionnaireScenarioPrompt(
  scanContext: AuditScanContext,
  language: PromptLanguage
): string {
  const promptFamily = getScanContextPromptFamily(scanContext);
  const searchClause = getQuestionnaireSearchClause(scanContext, language);

  if (language === 'fr') {
    if (promptFamily === 'software_tool') {
      return `Si je cherche ${searchClause}, quelle solution choisir ?`;
    }
    if (promptFamily === 'ai_tool') {
      return `Si je cherche ${searchClause}, quel outil choisir ?`;
    }
    return `Si je cherche ${searchClause}, vers qui me tourner ?`;
  }

  if (promptFamily === 'software_tool') {
    return `If I'm looking for ${searchClause}, which solution should I choose?`;
  }
  if (promptFamily === 'ai_tool') {
    return `If I'm looking for ${searchClause}, which tool should I choose?`;
  }
  return `If I'm looking for ${searchClause}, who should I turn to?`;
}

function buildQuestionnaireAlternativesPrompt(
  scanContext: AuditScanContext,
  language: PromptLanguage
): string {
  const searchClause = getQuestionnaireSearchClause(scanContext, language);

  return language === 'fr'
    ? `Quelles alternatives sont souvent citées quand on cherche ${searchClause} ?`
    : `Which alternatives are often cited when looking for ${searchClause}?`;
}

function buildQuestionnaireMostCitedPrompt(
  scanContext: AuditScanContext,
  language: PromptLanguage
): string {
  const promptFamily = getScanContextPromptFamily(scanContext);
  const searchClause = getQuestionnaireSearchClause(scanContext, language);

  if (language === 'fr') {
    switch (promptFamily) {
      case 'software_tool':
        return `Quels produits ou éditeurs précis sont les plus souvent cités quand on cherche ${searchClause} ?`;
      case 'ai_tool':
        return `Quels produits IA précis sont les plus souvent cités quand on cherche ${searchClause} ?`;
      case 'platform':
        return `Quelles plateformes précises sont les plus souvent citées quand on cherche ${searchClause} ?`;
      case 'ecommerce_shop':
        return `Quelles marques ou boutiques précises sont les plus souvent citées quand on cherche ${searchClause} ?`;
      case 'institutional_actor':
        return `Quels organismes, médias ou structures précis sont les plus souvent cités quand on cherche ${searchClause} ?`;
      default:
        return `Quels noms précis sont les plus souvent cités quand on cherche ${searchClause} ?`;
    }
  }

  switch (promptFamily) {
    case 'software_tool':
      return `Which specific products or vendors are cited most often when looking for ${searchClause}?`;
    case 'ai_tool':
      return `Which specific AI products are cited most often when looking for ${searchClause}?`;
    case 'platform':
      return `Which specific platforms are cited most often when looking for ${searchClause}?`;
    case 'ecommerce_shop':
      return `Which specific brands or stores are cited most often when looking for ${searchClause}?`;
    case 'institutional_actor':
      return `Which specific organizations, media outlets, or institutions are cited most often when looking for ${searchClause}?`;
    default:
      return `Which specific names are cited most often when looking for ${searchClause}?`;
  }
}

function buildQuestionnaireReputationPrompt(
  scanContext: AuditScanContext,
  language: PromptLanguage
): string {
  const actorPlural = getQuestionnaireQualifiedActor(scanContext, 'plural');
  const actorPluralLead = language === 'fr' ? inferFrenchLeadForLabel(actorPlural, 'plural') : 'Which';
  const locationSuffix = getQuestionnaireLocationSuffix(scanContext, language);
  const promptFamily = getScanContextPromptFamily(scanContext);

  if (language === 'fr') {
    if (promptFamily === 'institutional_actor') {
      return `${actorPluralLead} ${actorPlural} sont les plus reconnus${locationSuffix} ?`;
    }
    return `${actorPluralLead} ${actorPlural} ont les meilleurs avis${locationSuffix} ?`;
  }

  if (promptFamily === 'institutional_actor') {
    return `Which ${actorPlural} are the most recognized${locationSuffix}?`;
  }
  return `Which ${actorPlural} have the best reviews${locationSuffix}?`;
}

function buildQuestionnairePrompts(
  scanContext: AuditScanContext,
  language: PromptLanguage
): PromptDraft[] {
  const actorPlural = getQuestionnaireQualifiedActor(scanContext, 'plural');
  const actorPluralLead = language === 'fr' ? inferFrenchLeadForLabel(actorPlural, 'plural') : 'Which';
  const locationSuffix = getQuestionnaireLocationSuffix(scanContext, language);
  const frenchActorPluralList = getFrenchDePhrase(actorPlural);

  return [
    draft(
      language === 'fr'
        ? `${actorPluralLead} ${actorPlural} recommander${locationSuffix} ?`
        : `Which ${actorPlural} would you recommend${locationSuffix}?`,
      'recommendation',
      {
        visibility: 'visible',
        benchmarkGroup: 'visibility',
        brandAnchored: false,
      }
    ),
    draft(
      language === 'fr'
        ? `Donne-moi une liste ${frenchActorPluralList}${locationSuffix}`
        : `Give me a list of ${actorPlural}${locationSuffix}`,
      'listing',
      {
        visibility: 'visible',
        benchmarkGroup: 'visibility',
        brandAnchored: false,
      }
    ),
    draft(buildQuestionnaireDirectChoicePrompt(scanContext, language), 'situation', {
      visibility: 'visible',
      benchmarkGroup: 'visibility',
      brandAnchored: false,
    }),
    draft(buildQuestionnaireScenarioPrompt(scanContext, language), 'situation', {
      visibility: 'visible',
      benchmarkGroup: 'visibility',
      brandAnchored: false,
    }),
    draft(
      language === 'fr'
        ? `${actorPluralLead} ${actorPlural} semblent être les meilleurs choix${locationSuffix} ?`
        : `Which ${actorPlural} seem like the best choices${locationSuffix}?`,
      'listing',
      {
        visibility: 'visible',
        benchmarkGroup: 'visibility',
        brandAnchored: false,
      }
    ),
    draft(
      language === 'fr'
        ? `${actorPluralLead} ${actorPlural} sont les plus fiables${locationSuffix} ?`
        : `Which ${actorPlural} are the most reliable${locationSuffix}?`,
      'reputation',
      {
        visibility: 'hidden',
        benchmarkGroup: 'competitor',
        brandAnchored: false,
      }
    ),
    draft(buildQuestionnaireReputationPrompt(scanContext, language), 'reputation', {
      visibility: 'hidden',
      benchmarkGroup: 'competitor',
      brandAnchored: false,
    }),
    draft(
      language === 'fr'
        ? `Compare les options ${frenchActorPluralList}${locationSuffix}`
        : `Compare the ${actorPlural} options${locationSuffix}`,
      'comparison',
      {
        visibility: 'hidden',
        benchmarkGroup: 'competitor',
        brandAnchored: false,
      }
    ),
    draft(buildQuestionnaireAlternativesPrompt(scanContext, language), 'alternative', {
      visibility: 'hidden',
      benchmarkGroup: 'competitor',
      brandAnchored: false,
    }),
    draft(buildQuestionnaireMostCitedPrompt(scanContext, language), 'listing', {
      visibility: 'hidden',
      benchmarkGroup: 'competitor',
      brandAnchored: false,
    }),
  ];
}

function buildDeterministicPromptSet(profile: PromptGenerationProfile): PromptDraft[] {
  if (shouldUseGenericBrandPromptSet(profile)) {
    return buildGenericBrandDeterministicPrompts(profile);
  }

  if (profile.discoveryMode === 'local_places' || profile.siteType === 'local_service') {
    return buildLocalDeterministicPrompts(profile);
  }

  return buildDigitalDeterministicPrompts(profile);
}

function shouldUseGenericBrandPromptSet(profile: PromptGenerationProfile): boolean {
  if (profile.siteType === 'brand_site') {
    const genericCore =
      profile.domainVertical === 'general_business' &&
      (profile.mainTopicSource.startsWith('site_type_default:') ||
        profile.mainOfferSource.startsWith('site_type_default:') ||
        (looksLikeGenericTopic(profile.offerFamily) && looksLikeGenericOffer(profile.useCase || '')));

    if (genericCore) {
      return true;
    }
  }

  if (profile.siteType !== 'generic') return false;
  const offerFamily = getPromptOfferFamily(profile);
  const useCase = getPromptUseCase(profile);
  return looksLikeGenericTopic(offerFamily) && looksLikeGenericOffer(useCase);
}

function buildLocalDeterministicPrompts(profile: PromptGenerationProfile): PromptDraft[] {
  const { language, geoScope } = profile;
  const angles = buildPromptAngles(profile);
  const actorSingular = profile.localActorSingular || getPromptActorSingular(profile.siteType, language);
  const actorPlural = profile.localActorPlural || getPromptActorPlural(profile.siteType, language);
  const actorSingularLead = language === 'fr' ? inferFrenchLeadForLabel(actorSingular, 'singular') : 'Which';
  const actorPluralLead = language === 'fr' ? inferFrenchLeadForLabel(actorPlural, 'plural') : 'Which';

  if (language === 'fr') {
    return [
      draft(
        geoScope
          ? `${actorSingularLead} ${actorSingular} recommander pour ${angles.core} à ${geoScope} ?`
          : `${actorSingularLead} ${actorSingular} recommander pour ${angles.core} ?`,
        'recommendation',
        { visibility: 'visible', benchmarkGroup: 'visibility', brandAnchored: false }
      ),
      draft(
        geoScope
          ? `Donne-moi une liste de ${actorPlural} pour ${angles.core} à ${geoScope}`
          : `Donne-moi une liste de ${actorPlural} pour ${angles.core}`,
        'listing',
        { visibility: 'visible', benchmarkGroup: 'visibility', brandAnchored: false }
      ),
      draft(
        geoScope
          ? `${actorSingularLead} ${actorSingular} choisir pour ${angles.capability} à ${geoScope} ?`
          : `${actorSingularLead} ${actorSingular} choisir pour ${angles.capability} ?`,
        'situation',
        { visibility: 'visible', benchmarkGroup: 'visibility', brandAnchored: false }
      ),
      draft(
        geoScope
          ? `${actorPluralLead} ${actorPlural} ressortent le plus pour ${angles.capability} à ${geoScope} ?`
          : `${actorPluralLead} ${actorPlural} ressortent le plus pour ${angles.capability} ?`,
        'listing',
        { visibility: 'visible', benchmarkGroup: 'visibility', brandAnchored: false }
      ),
      draft(
        geoScope
          ? `${actorPluralLead} ${actorPlural} sont les plus fiables pour ${angles.decision} à ${geoScope} ?`
          : `${actorPluralLead} ${actorPlural} sont les plus fiables pour ${angles.decision} ?`,
        'reputation',
        { visibility: 'visible', benchmarkGroup: 'visibility', brandAnchored: false }
      ),
      draft(
        geoScope
          ? `Quelles entreprises précises proposerais-tu pour ${angles.decision} à ${geoScope} ?`
          : `Quelles entreprises précises proposerais-tu pour ${angles.decision} ?`,
        'comparison',
        { visibility: 'hidden', benchmarkGroup: 'competitor', brandAnchored: false }
      ),
      draft(
        geoScope
          ? `Quelles entreprises précises sont souvent citées comme alternatives pour ${angles.market} à ${geoScope} ?`
          : `Quelles entreprises précises sont souvent citées comme alternatives pour ${angles.market} ?`,
        'alternative',
        { visibility: 'hidden', benchmarkGroup: 'competitor', brandAnchored: false }
      ),
      draft(
        geoScope
          ? `Quelles entreprises précises sont souvent recommandées pour ${angles.market} à ${geoScope} ?`
          : `Quelles entreprises précises sont souvent recommandées pour ${angles.market} ?`,
        'listing',
        { visibility: 'hidden', benchmarkGroup: 'competitor', brandAnchored: false }
      ),
      draft(
        geoScope
          ? `Si je veux ${angles.audience} à ${geoScope}, vers quelles entreprises précises me tourner ?`
          : `Si je veux ${angles.audience}, vers quelles entreprises précises me tourner ?`,
        'situation',
        { visibility: 'hidden', benchmarkGroup: 'competitor', brandAnchored: false }
      ),
      draft(
        geoScope
          ? `Quels noms d'entreprises précis sont les plus souvent cités pour ${angles.audience} à ${geoScope} ?`
          : `Quels noms d'entreprises précis sont les plus souvent cités pour ${angles.audience} ?`,
        'listing',
        { visibility: 'hidden', benchmarkGroup: 'competitor', brandAnchored: false }
      ),
    ];
  }

  return [
    draft(
      geoScope
        ? `Which ${actorSingular} would you recommend for ${angles.core} in ${geoScope}?`
        : `Which ${actorSingular} would you recommend for ${angles.core}?`,
      'recommendation',
      { visibility: 'visible', benchmarkGroup: 'visibility', brandAnchored: false }
    ),
    draft(
      geoScope
        ? `Give me a list of ${actorPlural} for ${angles.core} in ${geoScope}`
        : `Give me a list of ${actorPlural} for ${angles.core}`,
      'listing',
      { visibility: 'visible', benchmarkGroup: 'visibility', brandAnchored: false }
    ),
    draft(
      geoScope
        ? `Which ${actorSingular} should I choose for ${angles.capability} in ${geoScope}?`
        : `Which ${actorSingular} should I choose for ${angles.capability}?`,
      'situation',
      { visibility: 'visible', benchmarkGroup: 'visibility', brandAnchored: false }
    ),
    draft(
      geoScope
        ? `Who handles ${angles.capability} well in ${geoScope}?`
        : `Who handles ${angles.capability} well?`,
      'listing',
      { visibility: 'visible', benchmarkGroup: 'visibility', brandAnchored: false }
    ),
    draft(
      geoScope
        ? `Which ${actorPlural} are the most reliable for ${angles.decision} in ${geoScope}?`
        : `Which ${actorPlural} are the most reliable for ${angles.decision}?`,
      'reputation',
      { visibility: 'visible', benchmarkGroup: 'visibility', brandAnchored: false }
    ),
      draft(
        geoScope
          ? `Which specific companies would you suggest for ${angles.decision} in ${geoScope}?`
          : `Which specific companies would you suggest for ${angles.decision}?`,
        'comparison',
        { visibility: 'hidden', benchmarkGroup: 'competitor', brandAnchored: false }
      ),
      draft(
        geoScope
          ? `Which specific companies are often cited as alternatives for ${angles.market} in ${geoScope}?`
          : `Which specific companies are often cited as alternatives for ${angles.market}?`,
        'alternative',
        { visibility: 'hidden', benchmarkGroup: 'competitor', brandAnchored: false }
      ),
      draft(
        geoScope
          ? `Which specific companies are often recommended for ${angles.market} in ${geoScope}?`
          : `Which specific companies are often recommended for ${angles.market}?`,
        'listing',
        { visibility: 'hidden', benchmarkGroup: 'competitor', brandAnchored: false }
      ),
      draft(
        geoScope
          ? `If I want ${angles.audience} in ${geoScope}, which specific companies should I turn to?`
          : `If I want ${angles.audience}, which specific companies should I turn to?`,
        'situation',
        { visibility: 'hidden', benchmarkGroup: 'competitor', brandAnchored: false }
      ),
      draft(
        geoScope
          ? `Which specific company names are cited most often for ${angles.audience} in ${geoScope}?`
          : `Which specific company names are cited most often for ${angles.audience}?`,
        'listing',
        { visibility: 'hidden', benchmarkGroup: 'competitor', brandAnchored: false }
      ),
  ];
}

function buildDigitalDeterministicPrompts(profile: PromptGenerationProfile): PromptDraft[] {
  const { language, promptGenerationLevel } = profile;
  const angles = buildPromptAngles(profile);
  const actorPlural = getPromptActorPlural(profile.siteType, language, promptGenerationLevel);
  const actorPluralLead = getPromptActorPluralLead(profile.siteType, language, promptGenerationLevel);
  const actorSingular = getPromptActorSingular(profile.siteType, language, promptGenerationLevel);
  const actorSingularLead = getPromptActorSingularLead(profile.siteType, language, promptGenerationLevel);

  if (language === 'fr') {
    return [
      draft(`${actorPluralLead} ${actorPlural} recommander pour ${angles.core} ?`, 'recommendation', {
        visibility: 'visible',
        benchmarkGroup: 'visibility',
        brandAnchored: false,
      }),
      draft(`Donne-moi une liste de ${actorPlural} pour ${angles.core}`, 'listing', {
        visibility: 'visible',
        benchmarkGroup: 'visibility',
        brandAnchored: false,
      }),
      draft(
        `${actorSingularLead} ${actorSingular} choisir pour ${angles.capability} ?`,
        'situation',
        { visibility: 'visible', benchmarkGroup: 'visibility', brandAnchored: false }
      ),
      draft(
        `${actorPluralLead} ${actorPlural} ressortent le plus pour ${angles.capability} ?`,
        'listing',
        { visibility: 'visible', benchmarkGroup: 'visibility', brandAnchored: false }
      ),
      draft(`${actorPluralLead} ${actorPlural} sont les plus fiables pour ${angles.decision} ?`, 'reputation', {
        visibility: 'visible',
        benchmarkGroup: 'visibility',
        brandAnchored: false,
      }),
      draft(`Compare les options pour ${angles.decision}`, 'comparison', {
        visibility: 'hidden',
        benchmarkGroup: 'competitor',
        brandAnchored: false,
      }),
      draft(`Quelles alternatives sont souvent citées pour ${angles.market} ?`, 'alternative', {
        visibility: 'hidden',
        benchmarkGroup: 'competitor',
        brandAnchored: false,
      }),
      draft(`Qui est souvent recommandé pour ${angles.market} ?`, 'listing', {
        visibility: 'hidden',
        benchmarkGroup: 'competitor',
        brandAnchored: false,
      }),
      draft(`Si je veux ${angles.audience}, vers qui me tourner ?`, 'situation', {
        visibility: 'hidden',
        benchmarkGroup: 'competitor',
        brandAnchored: false,
      }),
      draft(`Quels acteurs sont les plus souvent cités pour ${angles.audience} ?`, 'listing', {
        visibility: 'hidden',
        benchmarkGroup: 'competitor',
        brandAnchored: false,
      }),
    ];
  }

  return [
    draft(`Which ${actorPlural} would you recommend for ${angles.core}?`, 'recommendation', {
      visibility: 'visible',
      benchmarkGroup: 'visibility',
      brandAnchored: false,
    }),
    draft(`Give me a list of ${actorPlural} for ${angles.core}`, 'listing', {
      visibility: 'visible',
      benchmarkGroup: 'visibility',
      brandAnchored: false,
    }),
    draft(`Which ${actorSingular} should I choose for ${angles.capability}?`, 'situation', {
      visibility: 'visible',
      benchmarkGroup: 'visibility',
      brandAnchored: false,
    }),
    draft(`Which ${actorPlural} stand out most for ${angles.capability}?`, 'listing', {
      visibility: 'visible',
      benchmarkGroup: 'visibility',
      brandAnchored: false,
    }),
    draft(`Which ${actorPlural} are the most reliable for ${angles.decision}?`, 'reputation', {
      visibility: 'visible',
      benchmarkGroup: 'visibility',
      brandAnchored: false,
    }),
    draft(`Compare the options for ${angles.decision}`, 'comparison', {
      visibility: 'hidden',
      benchmarkGroup: 'competitor',
      brandAnchored: false,
    }),
    draft(`Which alternatives are often cited for ${angles.market}?`, 'alternative', {
      visibility: 'hidden',
      benchmarkGroup: 'competitor',
      brandAnchored: false,
    }),
    draft(`Who is often recommended for ${angles.market}?`, 'listing', {
      visibility: 'hidden',
      benchmarkGroup: 'competitor',
      brandAnchored: false,
    }),
    draft(`If I want ${angles.audience}, who should I turn to?`, 'situation', {
      visibility: 'hidden',
      benchmarkGroup: 'competitor',
      brandAnchored: false,
    }),
    draft(`Which players are cited most often for ${angles.audience}?`, 'listing', {
      visibility: 'hidden',
      benchmarkGroup: 'competitor',
      brandAnchored: false,
    }),
  ];
}

function buildGenericBrandDeterministicPrompts(profile: PromptGenerationProfile): PromptDraft[] {
  return buildDigitalDeterministicPrompts(profile);
}

function determineProfileDiscoveryMode(
  siteType: SiteType
): PromptProfileSnapshot['discoveryMode'] {
  if (siteType === 'local_service') return 'local_places';
  if (siteType === 'brand_site') return 'hybrid_brand';
  return 'digital_crawl';
}

function resolveProfileOfferFamily(params: {
  siteType: SiteType;
  domainVertical: DomainVertical;
  language: PromptLanguage;
  mainTopic: string;
}): string {
  const { siteType, domainVertical, language, mainTopic } = params;
  const localizedMainTopic = localizeTopicLabelFromTaxonomy(
    siteType,
    domainVertical,
    language,
    mainTopic
  );
  if (localizedMainTopic) {
    return localizedMainTopic;
  }

  const taxonomyTopic = getSiteTypeVerticalTopicLabel(siteType, domainVertical, language);
  if (isMoreSpecificIntentValue(mainTopic, taxonomyTopic, 'topic')) {
    return mainTopic;
  }

  return taxonomyTopic || mainTopic;
}

function resolveProfileUseCase(params: {
  siteType: SiteType;
  domainVertical: DomainVertical;
  language: PromptLanguage;
  mainOffer: string;
  offerFamily: string;
}): string {
  const { siteType, domainVertical, language, mainOffer, offerFamily } = params;
  const localizedMainOffer = localizeOfferLabelFromTaxonomy(
    siteType,
    domainVertical,
    language,
    mainOffer
  );
  if (localizedMainOffer) {
    return localizedMainOffer;
  }

  const taxonomyOffer = getSiteTypeVerticalDefaultOfferLabel(siteType, domainVertical, language);
  if (isMoreSpecificIntentValue(mainOffer, taxonomyOffer, 'offer')) {
    return mainOffer;
  }

  return taxonomyOffer || mainOffer || offerFamily;
}

function resolveLocalActorLabels(params: {
  crawl: CrawlResult;
  siteType: SiteType;
  domainVertical: DomainVertical;
  offerFamily: string;
  useCase: string;
  language: PromptLanguage;
  briefSingular?: string | null;
  briefPlural?: string | null;
}): { singular: string | null; plural: string | null } {
  const {
    crawl,
    siteType,
    domainVertical,
    offerFamily,
    useCase,
    language,
    briefSingular,
    briefPlural,
  } = params;

  if (siteType !== 'local_service') {
    return { singular: null, plural: null };
  }

  const normalizedBriefSingular = sanitizeTopicLikeText(briefSingular, '', 60);
  const normalizedBriefPlural = sanitizeTopicLikeText(briefPlural, '', 60);
  if (normalizedBriefSingular && normalizedBriefPlural) {
    return {
      singular: normalizedBriefSingular,
      plural: normalizedBriefPlural,
    };
  }

  const sectorDetected = detectSector(crawl.businessInfo);
  const corpus = [
    sectorDetected,
    crawl.previewSignals?.sectorDetected,
    crawl.businessInfo.description,
    ...crawl.businessInfo.services,
    offerFamily,
    useCase,
  ]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase();

  const keywordMap: Array<{
    match: RegExp;
    singular: string;
    plural: string;
  }> = [
    { match: /\brestaurant|bistrot|brasserie|pizzeria\b/, singular: 'restaurant', plural: 'restaurants' },
    { match: /\bhotel|hôtel|hébergement|accommodation\b/, singular: 'hôtel', plural: 'hôtels' },
    { match: /\bdentiste|dental|cabinet dentaire\b/, singular: 'dentiste', plural: 'dentistes' },
    { match: /\bavocat|lawyer|juridique\b/, singular: 'cabinet', plural: 'cabinets' },
    { match: /\bplombier|plomberie\b/, singular: 'plombier', plural: 'plombiers' },
    { match: /\bélectricien|electrician|électricité|electrical\b/, singular: 'électricien', plural: 'électriciens' },
    { match: /\bcoiffeur|hairdresser|barber|salon\b/, singular: 'salon', plural: 'salons' },
    { match: /\bboulangerie|bakery|pâtisserie|pastry\b/, singular: 'boutique', plural: 'boutiques' },
    { match: /\bfitness|gym|salle de sport|musculation\b/, singular: 'salle', plural: 'salles' },
    { match: /\bboutique|shop|store|commerce|magasin\b/, singular: 'boutique', plural: 'boutiques' },
    { match: /\bagence|agency\b/, singular: 'agence', plural: 'agences' },
    { match: /\bclinique|clinic|praticien|practitioner|santé|health\b/, singular: 'praticien', plural: 'praticiens' },
  ];

  for (const entry of keywordMap) {
    if (entry.match.test(corpus)) {
      return {
        singular: language === 'fr' ? entry.singular : entry.singular,
        plural: language === 'fr' ? entry.plural : entry.plural,
      };
    }
  }

  const byVertical: Partial<Record<DomainVertical, { singular: string; plural: string }>> = {
    accounting_finance: { singular: 'cabinet', plural: 'cabinets' },
    legal_compliance: { singular: 'cabinet', plural: 'cabinets' },
    healthcare_wellness: { singular: 'praticien', plural: 'praticiens' },
    real_estate: { singular: 'agence', plural: 'agences' },
    construction_home_services: { singular: 'artisan', plural: 'artisans' },
    food_restaurants: { singular: 'restaurant', plural: 'restaurants' },
    education_training: { singular: 'organisme', plural: 'organismes' },
    public_sector_associations: { singular: 'organisme', plural: 'organismes' },
    marketing_communication: { singular: 'agence', plural: 'agences' },
    sales_crm: { singular: 'prestataire', plural: 'prestataires' },
    hr_payroll: { singular: 'cabinet', plural: 'cabinets' },
    logistics_mobility: { singular: 'prestataire', plural: 'prestataires' },
    general_business: { singular: 'prestataire', plural: 'prestataires' },
  };

  return byVertical[domainVertical] || { singular: 'prestataire', plural: 'prestataires' };
}

function extractProfileCapabilities(crawl: CrawlResult, siteName: string): string[] {
  const services = (crawl.businessInfo.services || [])
    .map((value) => sanitizeTopicLikeText(value, siteName, 60))
    .filter((value): value is string => Boolean(value))
    .filter((value) => isUsablePromptCapability(value));

  return Array.from(
    new Map(services.map((value) => [normalizeIntentKey(value), value])).values()
  ).slice(0, 4);
}

function mergePromptCapabilities(existing: string[], incoming: string[]): string[] {
  return Array.from(
    new Map(
      [...incoming, ...existing]
        .map((value) => normalizeNullableText(value))
        .filter((value): value is string => Boolean(value))
        .filter((value) => isUsablePromptCapability(value))
        .map((value) => [normalizeIntentKey(value), value] as const)
    ).values()
  ).slice(0, 4);
}

function isUsablePromptCapability(value: string): boolean {
  return (
    !looksLikeGenericOffer(value) &&
    !looksLikeGenericTopic(value) &&
    !looksLikeBroadCapability(value) &&
    !looksLikeWeakCapability(value)
  );
}

function getPromptOfferFamily(profile: PromptGenerationProfile): string {
  if (profile.offerFamily && !looksLikeGenericTopic(profile.offerFamily)) {
    return profile.offerFamily;
  }
  if (!looksLikeGenericTopic(profile.mainTopic)) {
    return profile.mainTopic;
  }
  return profile.safeIntentBucket;
}

function getPromptUseCase(profile: PromptGenerationProfile): string {
  const currentUseCase =
    (profile.useCase && !looksLikeGenericOffer(profile.useCase) && profile.useCase) ||
    (!looksLikeGenericOffer(profile.mainOffer) && profile.mainOffer) ||
    (!looksLikeGenericTopic(getPromptOfferFamily(profile)) && getPromptOfferFamily(profile)) ||
    profile.safeIntentBucket;

  if (isMoreSpecificIntentValue(profile.safeIntentBucket, currentUseCase, 'offer')) {
    return profile.safeIntentBucket;
  }

  if (profile.useCase && !looksLikeGenericOffer(profile.useCase)) {
    return profile.useCase;
  }
  if (!looksLikeGenericOffer(profile.mainOffer)) {
    return profile.mainOffer;
  }
  const offerFamily = getPromptOfferFamily(profile);
  if (!looksLikeGenericTopic(offerFamily)) {
    return offerFamily;
  }
  return profile.safeIntentBucket;
}

function getPromptAudienceOrNeed(
  profile: PromptGenerationProfile,
  primaryNeed: string
): string {
  const targetAudience = normalizeNullableText(profile.targetAudience);
  if (!targetAudience) {
    return primaryNeed;
  }

  return isMoreSpecificIntentValue(primaryNeed, targetAudience, 'offer')
    ? primaryNeed
    : targetAudience;
}

function getSecondaryCapability(
  profile: PromptGenerationProfile,
  primaryNeed: string
): string | null {
  const primaryKey = normalizeIntentKey(primaryNeed);

  for (const capability of profile.capabilities) {
    const cleaned = normalizeNullableText(capability);
    if (!cleaned) continue;
    if (normalizeIntentKey(cleaned) === primaryKey) continue;
    if (!isUsablePromptCapability(cleaned)) continue;
    return cleaned;
  }

  return null;
}

function looksLikeBroadCapability(value: string): boolean {
  return /^(?:vente|achat|commerce|boutique|catalogue|catalog|produits?|services?)\s+en\s+ligne$/i.test(
    value.trim()
  );
}

function looksLikeWeakCapability(value: string): boolean {
  return /(?:tendances?\s+actuelles?|actualit[ée]s?|nouveaut[ée]s?|diffusion\s+de\s+contenus?\s+vid[ée]o|contenus?\s+vid[ée]o|acc[eè]s\s+par\s+abonnement|service\s+par\s+abonnement|exp[ée]rience\s+utilisateur|catalogue\s+vari[ée]?\b|contenu\s+en\s+streaming)/i.test(
    value.trim()
  );
}

function buildCapabilityPromptText(
  actorPluralLead: string,
  actorPlural: string,
  need: string,
  capability: string | null,
  language: PromptLanguage
): string {
  if (language === 'fr') {
    if (capability) {
      return `${actorPluralLead} ${actorPlural} gèrent bien ${formatPromptNeedFragment(capability, language)} ?`;
    }
    return `${actorPluralLead} ${actorPlural} ressortent bien pour ${need} ?`;
  }

  if (capability) {
    return `Which ${actorPlural} handle ${capability} well?`;
  }
  return `Which ${actorPlural} stand out for ${need}?`;
}

function buildPromptAngles(profile: PromptGenerationProfile): PromptAngleBundle {
  const core = normalizePromptAngleCandidate(getPromptUseCase(profile)) || profile.safeIntentBucket;
  const familyIntent = normalizePromptAngleCandidate(getProfileFamilyIntent(profile)) || core;
  const capability = normalizePromptAngleCandidate(getSecondaryCapability(profile, core));
  const audienceForCore = buildAudiencePromptAngle(core, profile.targetAudience, profile.language);
  const audienceForFamily = buildAudiencePromptAngle(familyIntent, profile.targetAudience, profile.language);
  const audienceForCapability = buildAudiencePromptAngle(capability, profile.targetAudience, profile.language);
  const used = [core];

  const capabilityAngle =
    pickDistinctPromptAngle(
      [capability, profile.safeIntentBucket, profile.mainOffer, familyIntent, audienceForCore],
      used
    ) || core;
  used.push(capabilityAngle);

  const decisionAngle =
    pickDistinctPromptAngle(
      [audienceForCore, familyIntent, profile.safeIntentBucket, profile.mainOffer, audienceForCapability],
      used
    ) || capabilityAngle;
  used.push(decisionAngle);

  const marketAngle =
    pickDistinctPromptAngle(
      [familyIntent, profile.safeIntentBucket, profile.mainOffer, audienceForFamily, capabilityAngle],
      used
    ) || decisionAngle;
  used.push(marketAngle);

  const audienceAngle =
    pickDistinctPromptAngle(
      [
        audienceForCapability,
        audienceForCore,
        audienceForFamily,
        buildAudiencePromptAngle(profile.safeIntentBucket, profile.targetAudience, profile.language),
      ],
      used
    ) || marketAngle;

  return {
    core,
    capability: capabilityAngle,
    decision: decisionAngle,
    market: marketAngle,
    audience: audienceAngle,
  };
}

function pickDistinctPromptAngle(
  candidates: Array<string | null | undefined>,
  used: string[]
): string | null {
  const usedKeys = new Set(used.map((value) => normalizeIntentKey(value)));

  for (const candidate of candidates) {
    const normalized = normalizePromptAngleCandidate(candidate);
    if (!normalized) continue;
    const candidateKey = normalizeIntentKey(normalized);
    if (!candidateKey || usedKeys.has(candidateKey)) continue;
    return normalized;
  }

  return null;
}

function buildAudiencePromptAngle(
  base: string | null | undefined,
  targetAudience: string | null | undefined,
  language: PromptLanguage
): string | null {
  const normalizedBase = normalizePromptAngleCandidate(base);
  const normalizedAudience = normalizeNullableText(targetAudience);
  if (!normalizedBase || !isUsablePromptAudience(normalizedAudience)) {
    return null;
  }

  const audienceKey = normalizeIntentKey(normalizedAudience);
  const baseKey = normalizeIntentKey(normalizedBase);
  if (!audienceKey || baseKey.includes(audienceKey)) {
    return normalizedBase;
  }

  if (language === 'fr') {
    if (/^(?:pour|destin[ée]e?s?\s+aux?|adapt[ée]e?s?\s+aux?|pens[ée]e?s?\s+pour)\b/i.test(normalizedAudience)) {
      return `${normalizedBase} ${normalizedAudience}`;
    }
    return `${normalizedBase} pour ${normalizedAudience}`;
  }

  if (/^(?:for|built for|designed for)\b/i.test(normalizedAudience)) {
    return `${normalizedBase} ${normalizedAudience}`;
  }
  return `${normalizedBase} for ${normalizedAudience}`;
}

function isUsablePromptAudience(value: string | null): value is string {
  if (!value) return false;
  const normalized = value.trim();
  if (!normalized) return false;
  return !/^(?:clients?|customers?|users?|utilisateurs?|professionnels?|professionals?|companies?|entreprises?|teams?|équipes?)$/i.test(
    normalized
  );
}

function normalizePromptAngleCandidate(value: string | null | undefined): string | null {
  const normalized = normalizeNullableText(value);
  if (!normalized) return null;
  return normalized.replace(/[?!.\s]+$/g, '').trim() || null;
}

function formatPromptNeedFragment(value: string, language: PromptLanguage): string {
  const cleaned = value.replace(/\s+/g, ' ').trim();
  if (language !== 'fr') return cleaned;
  if (!cleaned) return value;

  if (/^(?:le|la|les|l['’]|un|une|des|du|de la|de l['’])\b/i.test(cleaned)) {
    return cleaned;
  }

  if (
    /^(?:g[ée]rer|acheter|vendre|regarder|lire|[ée]couter|apprendre|comparer|trouver|poser|prendre|r[ée]server|organiser|suivre|se former|contacter|recruter|d[ée]ployer|d[ée]velopper|int[ée]grer|s[ée]curiser|piloter|automatiser|obtenir|acc[ée]der)\b/i.test(
      cleaned
    )
  ) {
    return cleaned;
  }

  return `${inferFrenchArticleForFragment(cleaned)}${cleaned}`;
}

function inferFrenchArticleForFragment(fragment: string): string {
  const firstWord = fragment
    .split(/\s+/)[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (/^[aeiouyh]/i.test(firstWord)) {
    return "l’";
  }

  if (/(?:tion|sion|it[eé]|ence|ance|ure|ie|[eé]e|ette|ade|ude|ique|ise|sse|[eè]re|i[eè]re)$/.test(firstWord)) {
    return 'la ';
  }

  return 'le ';
}

function promptTargetsSiteName(prompt: string, siteName: string): boolean {
  const normalizedPrompt = normalizePromptEntity(prompt);
  const normalizedSiteName = normalizePromptEntity(siteName);
  if (!normalizedPrompt || !normalizedSiteName) return false;
  return normalizedPrompt.includes(normalizedSiteName);
}

function normalizePromptEntity(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shouldDegradeActor(siteType: SiteType, level: PromptGenerationLevel): boolean {
  if (level === 'exact' || level === 'controlled') return false;
  return !ACTOR_DEGRADATION_EXEMPT_SITE_TYPES.has(siteType);
}

function getPromptActorPlural(siteType: SiteType, language: PromptLanguage, level?: PromptGenerationLevel): string {
  if (level && shouldDegradeActor(siteType, level)) {
    return NEUTRAL_ACTOR_FALLBACK[language].plural;
  }
  return (
    SITE_TYPE_PROMPT_ACTORS[siteType]?.[language]?.plural ||
    SITE_TYPE_PROMPT_ACTORS.generic[language].plural
  );
}

function getPromptActorSingular(siteType: SiteType, language: PromptLanguage, level?: PromptGenerationLevel): string {
  if (level && shouldDegradeActor(siteType, level)) {
    return NEUTRAL_ACTOR_FALLBACK[language].singular;
  }
  return (
    SITE_TYPE_PROMPT_ACTORS[siteType]?.[language]?.singular ||
    SITE_TYPE_PROMPT_ACTORS.generic[language].singular
  );
}

function getPromptActorPluralLead(siteType: SiteType, language: PromptLanguage, level?: PromptGenerationLevel): string {
  if (language === 'en') return 'Which';
  if (level && shouldDegradeActor(siteType, level)) {
    return NEUTRAL_ACTOR_FALLBACK.fr.pluralLead;
  }
  return (
    SITE_TYPE_PROMPT_ACTORS[siteType]?.fr?.pluralLead ||
    SITE_TYPE_PROMPT_ACTORS.generic.fr.pluralLead ||
    'Quels'
  );
}

function getPromptActorSingularLead(siteType: SiteType, language: PromptLanguage, level?: PromptGenerationLevel): string {
  if (language === 'en') return 'Which';
  if (level && shouldDegradeActor(siteType, level)) {
    return NEUTRAL_ACTOR_FALLBACK.fr.singularLead;
  }
  return (
    SITE_TYPE_PROMPT_ACTORS[siteType]?.fr?.singularLead ||
    SITE_TYPE_PROMPT_ACTORS.generic.fr.singularLead ||
    'Quel'
  );
}

function inferFrenchLeadForLabel(
  label: string,
  mode: 'singular' | 'plural'
): string {
  const normalized = normalizeNullableText(label)?.toLowerCase() || '';
  const feminineTokens = [
    'agence',
    'animalerie',
    'association',
    'auto-école',
    'billetterie',
    'boutique',
    'boulangerie',
    'clinique',
    'communauté',
    'crèche',
    'école',
    'épicerie',
    'formation',
    'fondation',
    'institution',
    'marketplace',
    'organisation',
    'pâtisserie',
    'plateforme',
    'ressource',
    'salle',
    'source',
    'structure',
  ];
  const isFeminine = feminineTokens.some((token) => normalized.startsWith(token));

  if (mode === 'plural') {
    return isFeminine ? 'Quelles' : 'Quels';
  }

  return isFeminine ? 'Quelle' : 'Quel';
}

function getScanContextInsightNeed(
  scanContext: AuditScanContext,
  language: PromptLanguage
): string {
  const detail = getQuestionnaireActivityDetail(scanContext);
  if (detail) {
    return detail;
  }

  const actor = scanContext.actorSingular;
  const actorPhrase =
    language === 'fr'
      ? `${inferFrenchIndefiniteArticle(actor)} ${actor}`
      : `${inferEnglishIndefiniteArticle(actor)} ${actor}`;
  const promptFamily = getScanContextPromptFamily(scanContext);

  if (language === 'fr') {
    if (promptFamily === 'agency_service') {
      return `faire appel à ${actorPhrase}`;
    }
    if (
      promptFamily === 'software_tool' ||
      promptFamily === 'ai_tool' ||
      promptFamily === 'platform' ||
      promptFamily === 'ecommerce_shop'
    ) {
      return `choisir ${actorPhrase}`;
    }
    if (promptFamily === 'institutional_actor' && actor.startsWith('média')) {
      return `consulter ${actorPhrase}`;
    }
    return `trouver ${actorPhrase}`;
  }

  if (promptFamily === 'agency_service') {
    return `hire ${actorPhrase}`;
  }
  if (
    promptFamily === 'software_tool' ||
    promptFamily === 'ai_tool' ||
    promptFamily === 'platform' ||
    promptFamily === 'ecommerce_shop'
  ) {
    return `choose ${actorPhrase}`;
  }
  if (promptFamily === 'institutional_actor' && actor.startsWith('média')) {
    return `consult ${actorPhrase}`;
  }
  return `find ${actorPhrase}`;
}

function buildPromptProfileFromScanContext(
  params: GeneratePromptsParams
): PromptGenerationProfile {
  const { crawl, fallbackBusinessName, scanContext } = params;
  if (!scanContext) {
    return buildPromptProfile(params);
  }

  const language = detectPromptLanguage(crawl);
  const siteName = detectSiteName(crawl, fallbackBusinessName, language);
  const siteType = scanContext.siteTypeHint;
  const siteFamily = SITE_TYPE_TO_FAMILY[siteType] || 'generic_family';
  const domainVertical = scanContext.domainVerticalHint || getSiteTypeDefaultVertical(siteType);
  const crawlTransportScore = calculateCrawlTransportScore(crawl);
  const semanticCoverageScore = calculateSemanticCoverageScore(crawl);
  const semanticConfidenceScore = 96;
  const mainTopic = getScanContextInsightNeed(scanContext, language);
  const mainOffer = mainTopic;
  const activityDetail = getQuestionnaireActivityDetail(scanContext);

  return {
    discoveryMode: scanContext.discoveryMode,
    siteName,
    siteType,
    siteFamily,
    domainVertical,
    domainVerticalConfidence: 96,
    domainVerticalSource: 'user_context',
    promptGenerationLevel: 'exact',
    promptGenerationReason: 'Contexte utilisateur fourni via questionnaire.',
    offerFamily: mainTopic,
    useCase: activityDetail || scanContext.actorSingular,
    localActorSingular: scanContext.actorSingular,
    localActorPlural: scanContext.actorPlural,
    targetAudience: null,
    capabilities: Array.from(
      new Set([activityDetail].filter((value): value is string => Boolean(value)))
    ),
    mainTopic,
    mainOffer,
    mainTopicConfidence: 96,
    mainOfferConfidence: 96,
    mainTopicSource: 'user_context',
    mainOfferSource: 'user_context',
    mainTopicCandidates: [mainTopic],
    mainOfferCandidates: [mainOffer],
    mainTopicSafe: true,
    mainOfferSafe: true,
    safeIntentBucket: mainTopic,
    safeIntentSource: 'user_context',
    geoScope: scanContext.city,
    language,
    crawlTransportScore,
    semanticCoverageScore,
    semanticConfidenceScore,
    confidenceScore: 96,
    runnerUpType: 'generic',
    signalsMatched: ['user_context'],
    classificationReason: 'Typologie et activité confirmées par le questionnaire utilisateur.',
    siteTypeScores: {
      [siteType]: 100,
    },
  };
}

function buildPromptProfile(params: GeneratePromptsParams): PromptGenerationProfile {
  const { crawl, fallbackBusinessName, fallbackTopic, fallbackCity, brief } = params;
  const pages = getUsablePages(crawl.previewSignals?.pages ?? []);
  const knownPaths = [
    ...pages.map((page) => page.path),
    ...pages.flatMap((page) => page.internalLinks),
    ...(crawl.sitemap.discoveredUrls || []),
  ];

  const language = detectPromptLanguage(crawl);
  const siteName = detectSiteName(crawl, fallbackBusinessName, language);
  const geoScope = detectGeoScope(crawl, fallbackCity);
  const classification = classifySiteType(crawl, {
    geoScope,
    knownPaths,
  });
  const domainVertical = detectDomainVertical(crawl, {
    siteType: classification.siteType,
    language,
    knownPaths,
    fallbackTopic,
  });
  const resolvedMainTopic = detectMainTopic(crawl, {
    siteName,
    fallbackTopic,
    language,
    siteType: classification.siteType,
    domainVertical: domainVertical.value,
    domainVerticalConfidence: domainVertical.confidence,
    domainVerticalSource: domainVertical.source,
  });
  const resolvedMainOffer = detectMainOffer(crawl, {
    siteName,
    mainTopic: resolvedMainTopic.value,
    fallbackOffer: fallbackTopic,
    language,
    siteType: classification.siteType,
    domainVertical: domainVertical.value,
    knownPaths,
  });
  const discoveryMode = determineProfileDiscoveryMode(classification.siteType);
  const offerFamily = resolveProfileOfferFamily({
    siteType: classification.siteType,
    domainVertical: domainVertical.value,
    language,
    mainTopic: resolvedMainTopic.value,
  });
  const useCase = resolveProfileUseCase({
    siteType: classification.siteType,
    domainVertical: domainVertical.value,
    language,
    mainOffer: resolvedMainOffer.value,
    offerFamily,
  });
  const localActorLabels = resolveLocalActorLabels({
    crawl,
    siteType: classification.siteType,
    domainVertical: domainVertical.value,
    offerFamily,
    useCase,
    language,
  });
  const capabilities = extractProfileCapabilities(crawl, siteName);
  const rawSafeIntentBucket = detectSafeIntentBucket(crawl, {
    siteType: classification.siteType,
    language,
    mainTopic: resolvedMainTopic.value,
    mainOffer: resolvedMainOffer.value,
    mainTopicCandidates: resolvedMainTopic.candidates,
    mainOfferCandidates: resolvedMainOffer.candidates,
  });
  const safeIntentBucket = specializeSafeIntentBucket({
    resolvedBucket: rawSafeIntentBucket,
    siteType: classification.siteType,
    domainVertical: domainVertical.value,
    language,
    mainTopic: resolvedMainTopic.value,
    mainOffer: resolvedMainOffer.value,
  });
  const siteFamily = inferSiteFamily({
    siteType: classification.siteType,
    siteTypeScores: classification.siteTypeScores,
  });
  const crawlTransportScore = calculateCrawlTransportScore(crawl);
  const semanticCoverageScore = calculateSemanticCoverageScore(crawl);
  const semanticConfidenceScore = calculateSemanticConfidenceScore({
    classification,
    siteFamily,
    domainVerticalConfidence: domainVertical.confidence,
    mainTopicConfidence: resolvedMainTopic.confidence,
    mainOfferConfidence: resolvedMainOffer.confidence,
  });
  const promptGenerationDecision = determinePromptGenerationLevel({
    siteType: classification.siteType,
    siteFamily,
    domainVertical: domainVertical.value,
    domainVerticalConfidence: domainVertical.confidence,
    crawlTransportScore,
    semanticCoverageScore,
    semanticConfidenceScore,
    classificationConfidenceScore: classification.confidenceScore,
    mainTopic: resolvedMainTopic.value,
    mainOffer: resolvedMainOffer.value,
    mainTopicSource: resolvedMainTopic.source,
    mainOfferSource: resolvedMainOffer.source,
    mainTopicSafe: resolvedMainTopic.safe,
    mainOfferSafe: resolvedMainOffer.safe,
  });
  const promptGenerationLevel = enforcePromptHierarchyLevel({
    level: promptGenerationDecision.level,
    siteType: classification.siteType,
    siteFamily,
    domainVertical: domainVertical.value,
    classificationConfidenceScore: classification.confidenceScore,
    domainVerticalConfidence: domainVertical.confidence,
    crawlTransportScore,
    semanticCoverageScore,
    semanticConfidenceScore,
    mainTopic: resolvedMainTopic.value,
    mainOffer: resolvedMainOffer.value,
  });
  const stabilizedPromptGenerationLevel = enforceStructuredPromptLevelFloor({
    level: promptGenerationLevel,
    siteType: classification.siteType,
    offerFamily,
    useCase,
  });

  const baseProfile: PromptGenerationProfile = {
    discoveryMode,
    siteName,
    siteType: classification.siteType,
    siteFamily,
    domainVertical: domainVertical.value,
    domainVerticalConfidence: domainVertical.confidence,
    domainVerticalSource: domainVertical.source,
    promptGenerationLevel: stabilizedPromptGenerationLevel,
    promptGenerationReason:
      stabilizedPromptGenerationLevel === promptGenerationLevel &&
      promptGenerationLevel === promptGenerationDecision.level
        ? promptGenerationDecision.reason
        : `${promptGenerationDecision.reason} Niveau relevé par l’entonnoir hiérarchique vers ${stabilizedPromptGenerationLevel}.`,
    offerFamily,
    useCase,
    localActorSingular: localActorLabels.singular,
    localActorPlural: localActorLabels.plural,
    targetAudience: null,
    capabilities,
    mainTopic: resolvedMainTopic.value,
    mainOffer: resolvedMainOffer.value,
    mainTopicConfidence: resolvedMainTopic.confidence,
    mainOfferConfidence: resolvedMainOffer.confidence,
    mainTopicSource: resolvedMainTopic.source,
    mainOfferSource: resolvedMainOffer.source,
    mainTopicCandidates: resolvedMainTopic.candidates,
    mainOfferCandidates: resolvedMainOffer.candidates,
    mainTopicSafe: resolvedMainTopic.safe,
    mainOfferSafe: resolvedMainOffer.safe,
    safeIntentBucket: safeIntentBucket.value,
    safeIntentSource: safeIntentBucket.source,
    geoScope,
    language,
    crawlTransportScore,
    semanticCoverageScore,
    semanticConfidenceScore,
    confidenceScore: classification.confidenceScore,
    runnerUpType: classification.runnerUpType,
    signalsMatched: classification.signalsMatched,
    classificationReason: classification.classificationReason,
    siteTypeScores: classification.siteTypeScores,
  };

  if (!brief) {
    return baseProfile;
  }

  return applyPromptBriefToProfile(baseProfile, brief, crawl);
}

function applyPromptBriefToProfile(
  baseProfile: PromptGenerationProfile,
  brief: PromptBrief,
  crawl: CrawlResult
): PromptGenerationProfile {
  const siteType = brief.siteType || baseProfile.siteType;
  const siteFamily = brief.siteFamily || SITE_TYPE_TO_FAMILY[siteType] || baseProfile.siteFamily;
  const domainVertical = brief.domainVertical || baseProfile.domainVertical;
  const siteName = brief.siteName || baseProfile.siteName;
  const discoveryMode = brief.discoveryMode || determineProfileDiscoveryMode(siteType);
  const localizedBriefMainTopic = localizeTopicLabelFromTaxonomy(
    siteType,
    domainVertical,
    baseProfile.language,
    brief.mainTopic
  );
  const localizedBriefMainOffer = localizeOfferLabelFromTaxonomy(
    siteType,
    domainVertical,
    baseProfile.language,
    brief.mainOffer
  );
  const localizedBriefOfferFamily = localizeTopicLabelFromTaxonomy(
    siteType,
    domainVertical,
    baseProfile.language,
    brief.offerFamily || brief.mainTopic
  );
  const localizedBriefUseCase = localizeOfferLabelFromTaxonomy(
    siteType,
    domainVertical,
    baseProfile.language,
    brief.useCase || brief.mainOffer
  );
  const mainTopic =
    localizedBriefMainTopic || maybeSpecializeIntentWithVertical(baseProfile.mainTopic, {
      kind: 'topic',
      domainVertical,
      siteType,
      language: baseProfile.language,
      source: baseProfile.mainTopicSource,
      confidence: baseProfile.mainTopicConfidence,
    });
  const mainOffer =
    localizedBriefMainOffer || maybeSpecializeIntentWithVertical(baseProfile.mainOffer, {
      kind: 'offer',
      domainVertical,
      siteType,
      language: baseProfile.language,
      source: baseProfile.mainOfferSource,
      confidence: baseProfile.mainOfferConfidence,
    });
  const offerFamily =
    localizedBriefOfferFamily ||
    baseProfile.offerFamily ||
    resolveProfileOfferFamily({
      siteType,
      domainVertical,
      language: baseProfile.language,
      mainTopic,
    });
  const useCase =
    localizedBriefUseCase ||
    baseProfile.useCase ||
    resolveProfileUseCase({
      siteType,
      domainVertical,
      language: baseProfile.language,
      mainOffer,
      offerFamily,
    });
  const localActorLabels = resolveLocalActorLabels({
    crawl,
    siteType,
    domainVertical,
    offerFamily,
    useCase,
    language: baseProfile.language,
    briefSingular: brief.localActorSingular || null,
    briefPlural: brief.localActorPlural || null,
  });
  const geoScope = brief.geoScope ?? baseProfile.geoScope;
  const targetAudience = brief.targetAudience || baseProfile.targetAudience;
  const capabilities = mergePromptCapabilities(baseProfile.capabilities, brief.capabilities || []);
  const briefConfidence =
    typeof brief.confidence === 'number' && Number.isFinite(brief.confidence)
      ? clampScore(brief.confidence)
      : null;
  const mergedClassificationConfidence = briefConfidence
    ? Math.max(baseProfile.confidenceScore, briefConfidence)
    : baseProfile.confidenceScore;
  const mergedMainTopicConfidence = briefConfidence
    ? Math.max(baseProfile.mainTopicConfidence, briefConfidence)
    : baseProfile.mainTopicConfidence;
  const mergedMainOfferConfidence = briefConfidence
    ? Math.max(baseProfile.mainOfferConfidence, briefConfidence)
    : baseProfile.mainOfferConfidence;
  const semanticConfidenceScore = briefConfidence
    ? clampScore(
        baseProfile.semanticConfidenceScore * 0.4 +
          mergedClassificationConfidence * 0.25 +
          mergedMainTopicConfidence * 0.15 +
          mergedMainOfferConfidence * 0.2
      )
    : baseProfile.semanticConfidenceScore;
  const mainTopicCandidates = prependUniqueCandidate(mainTopic, baseProfile.mainTopicCandidates);
  const mainOfferCandidates = prependUniqueCandidate(mainOffer, baseProfile.mainOfferCandidates);
  const rawSafeIntentBucket = detectSafeIntentBucket(crawl, {
    siteType,
    language: baseProfile.language,
    mainTopic,
    mainOffer,
    mainTopicCandidates,
    mainOfferCandidates,
  });
  const safeIntentBucket = specializeSafeIntentBucket({
    resolvedBucket: rawSafeIntentBucket,
    siteType,
    domainVertical,
    language: baseProfile.language,
    mainTopic,
    mainOffer,
  });
  const baseDecision = determinePromptGenerationLevel({
    siteType,
    siteFamily,
    domainVertical,
    domainVerticalConfidence: briefConfidence ?? baseProfile.domainVerticalConfidence,
    crawlTransportScore: baseProfile.crawlTransportScore,
    semanticCoverageScore: baseProfile.semanticCoverageScore,
    semanticConfidenceScore,
    classificationConfidenceScore: mergedClassificationConfidence,
    mainTopic,
    mainOffer,
    mainTopicSource: 'ai_brief',
    mainOfferSource: 'ai_brief',
    mainTopicSafe: false,
    mainOfferSafe: false,
  });
  const promptGenerationLevel = resolvePromptBriefLevel({
    baseLevel: baseDecision.level,
    levelHint: brief.promptGenerationLevelHint || null,
    briefConfidence,
    crawlTransportScore: baseProfile.crawlTransportScore,
    semanticCoverageScore: baseProfile.semanticCoverageScore,
  });
  const hierarchyAdjustedLevel = enforcePromptHierarchyLevel({
    level: promptGenerationLevel,
    siteType,
    siteFamily,
    domainVertical,
    classificationConfidenceScore: mergedClassificationConfidence,
    domainVerticalConfidence: briefConfidence ?? baseProfile.domainVerticalConfidence,
    crawlTransportScore: baseProfile.crawlTransportScore,
    semanticCoverageScore: baseProfile.semanticCoverageScore,
    semanticConfidenceScore,
    mainTopic,
    mainOffer,
  });
  const stabilizedPromptGenerationLevel = enforceStructuredPromptLevelFloor({
    level: hierarchyAdjustedLevel,
    siteType,
    offerFamily,
    useCase,
  });

  return {
    ...baseProfile,
    discoveryMode,
    siteName,
    siteType,
    siteFamily,
    domainVertical,
    domainVerticalConfidence: briefConfidence ?? baseProfile.domainVerticalConfidence,
    domainVerticalSource: brief.domainVertical ? 'ai_brief' : baseProfile.domainVerticalSource,
    promptGenerationLevel: stabilizedPromptGenerationLevel,
    promptGenerationReason:
      stabilizedPromptGenerationLevel === hierarchyAdjustedLevel &&
      hierarchyAdjustedLevel === baseDecision.level
        ? baseDecision.reason
        : `${baseDecision.reason} Niveau ajusté après brief IA (${brief.promptGenerationLevelHint || 'sans hint'}) vers ${stabilizedPromptGenerationLevel}.`,
    offerFamily,
    useCase,
    localActorSingular: localActorLabels.singular,
    localActorPlural: localActorLabels.plural,
    targetAudience,
    capabilities,
    mainTopic,
    mainOffer,
    mainTopicConfidence: mergedMainTopicConfidence,
    mainOfferConfidence: mergedMainOfferConfidence,
    mainTopicSource: 'ai_brief',
    mainOfferSource: 'ai_brief',
    mainTopicCandidates,
    mainOfferCandidates,
    mainTopicSafe: false,
    mainOfferSafe: false,
    safeIntentBucket: safeIntentBucket.value,
    safeIntentSource: `ai_brief:${safeIntentBucket.source}`,
    geoScope,
    semanticConfidenceScore,
    confidenceScore: mergedClassificationConfidence,
    signalsMatched: prependUniqueCandidate('brief_ia_validated', baseProfile.signalsMatched),
    classificationReason: `${baseProfile.classificationReason} Brief IA validé appliqué.`,
  };
}

function prependUniqueCandidate<T extends string>(value: T, list: T[]): T[] {
  return [value, ...list].filter(
    (candidate, index, array) =>
      array.findIndex((entry) => entry.toLowerCase() === candidate.toLowerCase()) === index
  );
}

function resolvePromptBriefLevel(params: {
  baseLevel: PromptGenerationLevel;
  levelHint: PromptGenerationLevel | null;
  briefConfidence: number | null;
  crawlTransportScore: number;
  semanticCoverageScore: number;
}): PromptGenerationLevel {
  const {
    baseLevel,
    levelHint,
    briefConfidence,
    crawlTransportScore,
    semanticCoverageScore,
  } = params;

  let resolved = levelHint ? getMoreConservativePromptLevel(baseLevel, levelHint) : baseLevel;

  const veryStrongBrief =
    briefConfidence !== null &&
    briefConfidence >= 85 &&
    crawlTransportScore >= 70 &&
    semanticCoverageScore >= 70;
  const strongBrief = briefConfidence !== null && briefConfidence >= 70;

  if (levelHint) {
    if (veryStrongBrief && baseLevel === 'exact' && (resolved === 'family' || resolved === 'brand')) {
      resolved = 'controlled';
    } else if (veryStrongBrief && baseLevel === 'controlled' && resolved === 'brand') {
      resolved = 'family';
    } else if (strongBrief && (baseLevel === 'exact' || baseLevel === 'controlled') && resolved === 'brand') {
      resolved = 'family';
    }
  }

  if (crawlTransportScore < 35 && semanticCoverageScore < 50) {
    resolved = getMoreConservativePromptLevel(resolved, 'family');
  }

  if (briefConfidence !== null && briefConfidence < 60 && resolved === 'exact') {
    resolved = 'controlled';
  }
  if (briefConfidence !== null && briefConfidence < 50 && resolved !== 'brand') {
    resolved = getMoreConservativePromptLevel(resolved, 'family');
  }
  if (briefConfidence !== null && briefConfidence < 38) {
    resolved = 'brand';
  }

  return resolved;
}

function enforcePromptHierarchyLevel(params: {
  level: PromptGenerationLevel;
  siteType: SiteType;
  siteFamily: SiteFamily;
  domainVertical: PromptProfileSnapshot['domainVertical'];
  classificationConfidenceScore: number;
  domainVerticalConfidence: number;
  crawlTransportScore: number;
  semanticCoverageScore: number;
  semanticConfidenceScore: number;
  mainTopic: string;
  mainOffer: string;
}): PromptGenerationLevel {
  const {
    level,
    siteType,
    siteFamily,
    domainVertical,
    classificationConfidenceScore,
    domainVerticalConfidence,
    crawlTransportScore,
    semanticCoverageScore,
    semanticConfidenceScore,
    mainTopic,
    mainOffer,
  } = params;

  if (level !== 'brand') {
    return level;
  }

  const typeRecognized = siteType !== 'generic';
  const hierarchyRecognized =
    siteFamily !== 'generic_family' || domainVertical !== 'general_business';
  const specializedIntent =
    !looksLikeGenericTopic(mainTopic) || !looksLikeGenericOffer(mainOffer);
  const signalStrongEnough =
    classificationConfidenceScore >= 60 &&
    semanticConfidenceScore >= 45 &&
    (semanticCoverageScore >= 35 || crawlTransportScore >= 35);
  const verticalStrongEnough =
    domainVertical !== 'general_business' &&
    domainVerticalConfidence >= 58 &&
    (semanticCoverageScore >= 30 || crawlTransportScore >= 30);

  if (typeRecognized && hierarchyRecognized && (signalStrongEnough || verticalStrongEnough || specializedIntent)) {
    return 'family';
  }

  return level;
}

function enforceStructuredPromptLevelFloor(params: {
  level: PromptGenerationLevel;
  siteType: SiteType;
  offerFamily: string;
  useCase: string;
}): PromptGenerationLevel {
  const { level, siteType, offerFamily, useCase } = params;

  if (level !== 'brand') return level;
  if (siteType === 'generic') return level;

  if (!looksLikeGenericTopic(offerFamily) || !looksLikeGenericOffer(useCase)) {
    return 'family';
  }

  return level;
}

function getMoreConservativePromptLevel(
  left: PromptGenerationLevel,
  right: PromptGenerationLevel
): PromptGenerationLevel {
  return PROMPT_LEVEL_ORDER[left] <= PROMPT_LEVEL_ORDER[right] ? left : right;
}

function detectPromptLanguage(crawl: CrawlResult): PromptLanguage {
  // Product choice: keep prompt generation fully in French.
  // Browser translation can be used client-side for non-FR users.
  void crawl;
  return 'fr';
}

function detectSiteName(
  crawl: CrawlResult,
  fallbackBusinessName: string | null | undefined,
  language: PromptLanguage
): string {
  const pages = getUsablePages(crawl.previewSignals?.pages ?? []);

  const weightedCandidates: WeightedNameCandidate[] = [
    { value: crawl.businessInfo.name, weight: 5 },
    { value: crawl.previewSignals?.brandDetected, weight: 5 },
    ...pages.flatMap((page) => [
      { value: page.brandHint, weight: page.path === '/' ? 4 : 3 },
      { value: splitTitleForName(page.title), weight: page.path === '/' ? 3 : 2 },
    ]),
    { value: fallbackBusinessName, weight: 3 },
    { value: deriveSiteNameFromUrl(pages[0]?.url || crawl.previewSignals?.fetchedUrls[0]), weight: 2 },
  ];

  const best = selectBestWeightedSiteName(weightedCandidates);
  if (best) return best;

  const domainFallback = deriveSiteNameFromUrl(pages[0]?.url || crawl.previewSignals?.fetchedUrls[0]);
  if (domainFallback) return domainFallback;

  return language === 'fr' ? 'Cette entreprise' : 'This business';
}

function detectDomainVertical(
  crawl: CrawlResult,
  context: {
    siteType: SiteType;
    language: PromptLanguage;
    knownPaths: string[];
    fallbackTopic: string | null | undefined;
  }
): DomainVerticalResolution {
  const { siteType, language, knownPaths, fallbackTopic } = context;
  const detectedSector = crawl.previewSignals?.sectorDetected || detectSector(crawl.businessInfo);
  const stablePages = getStableDescriptorPages(crawl.previewSignals?.pages ?? []);
  const inputs: IntentCandidateInput[] = [
    { value: crawl.businessInfo.description, source: 'business_description', weight: 24 },
    { value: crawl.meta.description, source: 'meta_description', weight: 22 },
    { value: detectedSector, source: 'sector_detected', weight: 12 },
    { value: fallbackTopic, source: 'fallback_topic', weight: 8 },
    ...stablePages.flatMap((page) => [
      { value: page.metaDescription, source: `stable_page_meta:${page.path}`, weight: 16 },
      { value: page.h1, source: `stable_page_h1:${page.path}`, weight: 10 },
      { value: page.title, source: `stable_page_title:${page.path}`, weight: 8 },
    ]),
    ...crawl.businessInfo.services.map((value) => ({
      value,
      source: 'business_service',
      weight: 10,
    })),
  ];

  const normalizedPaths = Array.from(
    new Set(
      knownPaths
        .map((path) => normalizeInternalPath(path || ''))
        .filter((path): path is string => Boolean(path))
    )
  );
  const allowedVerticals = new Set(getAllowedVerticalsForSiteType(siteType));
  const scoredDefinitions = Object.values(DOMAIN_VERTICAL_DEFINITIONS)
    .filter((definition) => definition.id !== 'general_business' && allowedVerticals.has(definition.id))
    .map((definition) => scoreCanonicalIntentDefinition(definition, inputs, normalizedPaths))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.sourceCount !== a.sourceCount) return b.sourceCount - a.sourceCount;
      return a.definition.id.localeCompare(b.definition.id);
    });

  const best = scoredDefinitions[0];
  const runnerUp = scoredDefinitions[1];
  const fallbackVertical = getSiteTypeDefaultVertical(siteType);

  if (!best || best.score < 16) {
    return {
      value: fallbackVertical,
      confidence: fallbackVertical === 'general_business' ? 24 : 42,
      source: `site_type_vertical_default:${siteType}`,
    };
  }

  const confidence = calculateCanonicalIntentConfidence({
    bestScore: best.score,
    runnerUpScore: runnerUp?.score ?? 0,
    sourceCount: best.sourceCount,
    pathMatched: best.pathMatched,
  });

  if (confidence >= 56) {
    return {
      value: best.definition.id as DomainVertical,
      confidence,
      source: `domain_vertical:${best.definition.id}`,
    };
  }

  return {
    value: fallbackVertical,
    confidence: Math.max(30, Math.min(confidence, 55)),
    source: `low_confidence_domain_vertical:${best.definition.id}`,
  };
}

function detectMainTopic(
  crawl: CrawlResult,
  context: {
    siteName: string;
    fallbackTopic: string | null | undefined;
    language: PromptLanguage;
    siteType: SiteType;
    domainVertical: DomainVertical;
    domainVerticalConfidence: number;
    domainVerticalSource: string;
  }
): ResolvedIntent {
  const {
    fallbackTopic,
    language,
    siteType,
    domainVertical,
    domainVerticalConfidence,
    domainVerticalSource,
  } = context;
  const directTopic = getSiteTypeVerticalTopicLabel(siteType, domainVertical, language);
  const fallbackValue = getDefaultMainTopic(siteType, language, domainVertical);

  if (directTopic && domainVertical !== 'general_business') {
    const lowConfidence =
      domainVerticalSource.startsWith('low_confidence_') ||
      domainVerticalSource.startsWith('site_type_vertical_default:') ||
      domainVerticalConfidence < MAIN_TOPIC_CONFIDENCE_THRESHOLD;

    return {
      value: directTopic,
      confidence: clampScore(Math.max(24, domainVerticalConfidence)),
      source: lowConfidence
        ? `low_confidence_vertical_topic:${domainVertical}`
        : `vertical_topic:${domainVertical}`,
      candidates: fallbackTopic
        ? Array.from(new Set([directTopic, sanitizeTopicLikeText(fallbackTopic, '', MAIN_TOPIC_MAX_LENGTH)].filter(Boolean) as string[]))
        : [directTopic],
      safe: lowConfidence,
    };
  }

  return {
    value: fallbackValue,
    confidence: domainVertical === 'general_business' ? 24 : Math.max(28, domainVerticalConfidence),
    source:
      domainVertical === 'general_business'
        ? `site_type_default:${siteType}`
        : `site_type_vertical_default:${domainVertical}`,
    candidates: [fallbackValue],
    safe: true,
  };
}

function detectMainOffer(
  crawl: CrawlResult,
  context: {
    mainTopic: string;
    siteName: string;
    fallbackOffer: string | null | undefined;
    language: PromptLanguage;
    siteType: SiteType;
    domainVertical: DomainVertical;
    knownPaths: string[];
  }
): ResolvedIntent {
  const { fallbackOffer, language, siteType, domainVertical, knownPaths } = context;
  const hierarchicalOffers = getSiteTypeVerticalOffers(siteType, domainVertical);

  return resolveCanonicalIntent({
    kind: 'offer',
    siteType,
    language,
    confidenceThreshold: MAIN_OFFER_CONFIDENCE_THRESHOLD,
    fallbackValue: getDefaultMainOffer(siteType, language, domainVertical),
    definitions: hierarchicalOffers,
    knownPaths,
    inputs: buildCanonicalOfferInputs(crawl, fallbackOffer),
  });
}

function buildCanonicalTopicInputs(
  crawl: CrawlResult,
  normalizedSector: string | null,
  fallbackTopic: string | null | undefined
): IntentCandidateInput[] {
  const stablePages = getStableDescriptorPages(crawl.previewSignals?.pages ?? []);

  return [
    { value: crawl.businessInfo.description, source: 'business_description', weight: 24 },
    { value: crawl.meta.description, source: 'meta_description', weight: 22 },
    ...stablePages.map((page) => ({
      value: page.metaDescription,
      source: `stable_page_meta:${page.path}`,
      weight: 16,
    })),
    ...crawl.businessInfo.services.map((value) => ({
      value,
      source: 'business_service',
      weight: 12,
    })),
    { value: normalizedSector, source: 'sector_detected', weight: 10 },
    { value: fallbackTopic, source: 'fallback_topic', weight: 4 },
  ];
}

function buildCanonicalOfferInputs(
  crawl: CrawlResult,
  fallbackOffer: string | null | undefined
): IntentCandidateInput[] {
  const stablePages = getStableDescriptorPages(crawl.previewSignals?.pages ?? []);

  return [
    { value: crawl.businessInfo.description, source: 'business_description', weight: 22 },
    { value: crawl.meta.description, source: 'meta_description', weight: 20 },
    ...stablePages.map((page) => ({
      value: page.metaDescription,
      source: `stable_page_meta:${page.path}`,
      weight: 16,
    })),
    ...crawl.businessInfo.services.map((value) => ({
      value,
      source: 'business_service',
      weight: 14,
    })),
    { value: fallbackOffer, source: 'fallback_offer', weight: 4 },
  ];
}

function resolveCanonicalIntent(params: {
  kind: 'topic' | 'offer';
  siteType: SiteType;
  language: PromptLanguage;
  confidenceThreshold: number;
  fallbackValue: string;
  definitions: readonly CanonicalIntentDefinition[];
  knownPaths: string[];
  inputs: IntentCandidateInput[];
}): ResolvedIntent {
  const {
    kind,
    siteType,
    language,
    confidenceThreshold,
    fallbackValue,
    definitions,
    knownPaths,
    inputs,
  } = params;

  if (definitions.length === 0) {
    return {
      value: fallbackValue,
      confidence: 22,
      source: `site_type_default:${siteType}`,
      candidates: [fallbackValue],
      safe: true,
    };
  }

  const normalizedPaths = Array.from(
    new Set(
      knownPaths
        .map((path) => normalizeInternalPath(path || ''))
        .filter((path): path is string => Boolean(path))
    )
  );

  const scoredDefinitions = definitions
    .map((definition) => scoreCanonicalIntentDefinition(definition, inputs, normalizedPaths))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.sourceCount !== a.sourceCount) return b.sourceCount - a.sourceCount;
      return getCanonicalIntentLabel(a.definition, language).localeCompare(
        getCanonicalIntentLabel(b.definition, language)
      );
    });

  const candidateLabels = scoredDefinitions
    .filter((entry) => entry.score > 0)
    .slice(0, 5)
    .map((entry) => getCanonicalIntentLabel(entry.definition, language));

  const best = scoredDefinitions[0];
  const runnerUp = scoredDefinitions[1];
  const confidence = best
    ? calculateCanonicalIntentConfidence({
        bestScore: best.score,
        runnerUpScore: runnerUp?.score ?? 0,
        sourceCount: best.sourceCount,
        pathMatched: best.pathMatched,
      })
    : 18;

  if (best && best.score >= 18 && confidence >= confidenceThreshold) {
    const bestLabel = getCanonicalIntentLabel(best.definition, language);
    return {
      value: bestLabel,
      confidence,
      source: `canonical_${kind}:${best.definition.id}`,
      candidates: candidateLabels.length > 0 ? candidateLabels : [bestLabel],
      safe: false,
    };
  }

  return {
    value: fallbackValue,
    confidence: best ? Math.min(confidence, confidenceThreshold - 1) : 22,
    source:
      best && candidateLabels.length > 0
        ? `low_confidence_canonical_fallback:${best.definition.id}`
        : `site_type_default:${siteType}`,
    candidates: candidateLabels.length > 0 ? candidateLabels : [fallbackValue],
    safe: true,
  };
}

function scoreCanonicalIntentDefinition<T extends HintScorableDefinition>(
  definition: T,
  inputs: IntentCandidateInput[],
  normalizedPaths: string[]
): {
  definition: T;
  score: number;
  sourceCount: number;
  pathMatched: boolean;
} {
  let score = 0;
  const matchedSources = new Set<string>();

  for (const input of inputs) {
    const normalized = normalizeNullableText(input.value);
    if (!normalized) continue;
    if (!containsAny(normalized, definition.hints)) continue;
    score += input.weight;
    matchedSources.add(input.source);
  }

  const pathMatched = Boolean(
    definition.pathHints?.some((pattern) =>
      normalizedPaths.some((path) => isPathMatch(path, pattern))
    )
  );

  if (pathMatched) {
    score += 10;
    matchedSources.add('path_hint');
  }

  if (matchedSources.size >= 2) {
    score += 6;
  }

  if (matchedSources.size >= 3) {
    score += 4;
  }

  return {
    definition,
    score,
    sourceCount: matchedSources.size,
    pathMatched,
  };
}

function calculateCanonicalIntentConfidence(params: {
  bestScore: number;
  runnerUpScore: number;
  sourceCount: number;
  pathMatched: boolean;
}): number {
  const { bestScore, runnerUpScore, sourceCount, pathMatched } = params;
  const gap = Math.max(0, bestScore - runnerUpScore);

  return clampScore(
    16 +
      Math.min(36, bestScore * 1.2) +
      Math.min(18, gap * 2) +
      Math.min(18, sourceCount * 6) +
      (pathMatched ? 8 : 0)
  );
}

function getCanonicalIntentLabel(
  definition: CanonicalIntentDefinition,
  language: PromptLanguage
): string {
  return definition.labels[language] || definition.labels.fr || definition.labels.en || '';
}

function resolveIntentFromCandidates(params: {
  kind: 'topic' | 'offer';
  siteType: SiteType;
  siteName: string;
  language: PromptLanguage;
  maxLength: number;
  confidenceThreshold: number;
  fallbackValue: string;
  excludedValue?: string | null;
  inputs: IntentCandidateInput[];
}): ResolvedIntent {
  const {
    kind,
    siteType,
    siteName,
    language,
    maxLength,
    confidenceThreshold,
    fallbackValue,
    excludedValue,
    inputs,
  } = params;
  const grouped = new Map<string, GroupedIntentCandidate>();

  inputs.forEach((input) => {
    const sanitized = sanitizeTopicLikeText(input.value, siteName, maxLength);
    if (!sanitized) return;
    if (input.dynamicProne && looksLikeEphemeralHeadline(sanitized)) return;
    if (
      excludedValue &&
      sanitized.toLowerCase() === excludedValue.trim().toLowerCase()
    ) {
      return;
    }

    const key = normalizeIntentKey(sanitized);
    if (!key) return;

    const current = grouped.get(key);
    if (!current) {
      grouped.set(key, {
        value: sanitized,
        key,
        score: input.weight,
        sources: new Set([input.source]),
      });
      return;
    }

    current.score += input.weight;
    current.sources.add(input.source);
    if (compareIntentLabels(sanitized, current.value) < 0) {
      current.value = sanitized;
    }
  });

  const scoredCandidates = Array.from(grouped.values()).map((candidate) =>
    finalizeIntentCandidateScore(candidate, {
      kind,
      siteType,
      language,
      fallbackValue,
      excludedValue,
    })
  );

  const ordered = scoredCandidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return compareIntentLabels(a.value, b.value);
  });

  const candidateLabels = ordered.slice(0, 5).map((entry) => entry.value);
  const best = ordered[0];
  const runnerUp = ordered[1];
  const confidence = best
    ? calculateIntentConfidence({
        bestScore: best.score,
        runnerUpScore: runnerUp?.score ?? 0,
        sourceCount: best.sources.size,
        kind,
      })
    : 18;

  if (best && confidence >= confidenceThreshold) {
    return {
      value: best.value,
      confidence,
      source: Array.from(best.sources)[0] || `${kind}_candidate`,
      candidates: candidateLabels,
      safe: false,
    };
  }

  const fallbackSource =
    best && candidateLabels.length > 0
      ? `low_confidence_fallback:${best.value}`
      : `site_type_fallback:${siteType}`;

  return {
    value: fallbackValue,
    confidence: best ? Math.min(confidence, confidenceThreshold - 1) : 22,
    source: fallbackSource,
    candidates: candidateLabels.length > 0 ? candidateLabels : [fallbackValue],
    safe: true,
  };
}

function finalizeIntentCandidateScore(
  candidate: GroupedIntentCandidate,
  params: {
    kind: 'topic' | 'offer';
    siteType: SiteType;
    language: PromptLanguage;
    fallbackValue: string;
    excludedValue?: string | null;
  }
): GroupedIntentCandidate {
  const { kind, siteType, language, fallbackValue, excludedValue } = params;
  let score = candidate.score;
  const wordCount = candidate.value.split(/\s+/).filter(Boolean).length;

  if (candidate.sources.size >= 2) {
    score += 10;
  }

  if (candidate.sources.size >= 3) {
    score += 6;
  }

  if (kind === 'topic') {
    if (wordCount >= 2 && wordCount <= 5) score += 6;
    if (wordCount === 1) score -= 3;
    if (containsAny(candidate.value, SITE_TYPE_TOPIC_HINTS[siteType])) score += 10;
    if (looksLikeGenericTopic(candidate.value)) score -= 12;
    if (TOPIC_INTENT_PATTERN.test(candidate.value)) score -= 8;
  } else {
    if (wordCount >= 3 && wordCount <= 9) score += 6;
    if (containsAny(candidate.value, SITE_TYPE_TOPIC_HINTS[siteType])) score += 8;
    if (looksLikeGenericOffer(candidate.value)) score -= 12;
    if (OFFER_INTENT_PATTERN.test(candidate.value)) score += 10;
  }

  if (excludedValue && candidate.value.toLowerCase() === excludedValue.trim().toLowerCase()) {
    score -= 12;
  }

  if (candidate.value.toLowerCase() === fallbackValue.toLowerCase()) {
    score -= 3;
  }

  if (candidate.value.toLowerCase() === getDefaultMainTopic(siteType, language).toLowerCase()) {
    score -= 3;
  }

  if (candidate.value.toLowerCase() === getDefaultMainOffer(siteType, language).toLowerCase()) {
    score -= 3;
  }

  if (looksLikeEphemeralHeadline(candidate.value)) {
    score -= 20;
  }

  return {
    ...candidate,
    score,
  };
}

function calculateIntentConfidence(params: {
  bestScore: number;
  runnerUpScore: number;
  sourceCount: number;
  kind: 'topic' | 'offer';
}): number {
  const { bestScore, runnerUpScore, sourceCount, kind } = params;
  const gap = Math.max(0, bestScore - runnerUpScore);
  const base = kind === 'topic' ? 16 : 18;
  const scoreComponent = Math.min(44, Math.max(0, bestScore) * 2);
  const gapComponent = Math.min(20, gap * 3);
  const corroborationComponent = Math.min(14, sourceCount * 4);

  return Math.max(
    18,
    Math.min(96, base + scoreComponent + gapComponent + corroborationComponent)
  );
}

function getDefaultMainTopic(
  siteType: SiteType,
  language: PromptLanguage,
  domainVertical: DomainVertical = getSiteTypeDefaultVertical(siteType)
): string {
  const taxonomyLabel = getSiteTypeVerticalTopicLabel(siteType, domainVertical, language);
  if (taxonomyLabel) {
    return taxonomyLabel;
  }

  return SITE_TYPE_DEFAULT_TOPIC[siteType][language] || SITE_TYPE_DEFAULT_TOPIC.generic[language];
}

function getDefaultMainOffer(
  siteType: SiteType,
  language: PromptLanguage,
  domainVertical: DomainVertical = getSiteTypeDefaultVertical(siteType)
): string {
  const taxonomyLabel = getSiteTypeVerticalDefaultOfferLabel(siteType, domainVertical, language);
  if (taxonomyLabel) {
    return taxonomyLabel;
  }

  return SITE_TYPE_DEFAULT_OFFER[siteType][language] || SITE_TYPE_DEFAULT_OFFER.generic[language];
}

function getDomainVerticalTopicLabel(
  domainVertical: DomainVertical,
  siteType: SiteType,
  language: PromptLanguage
): string {
  const taxonomyLabel = getSiteTypeVerticalTopicLabel(siteType, domainVertical, language);
  if (taxonomyLabel) return taxonomyLabel;

  const definition = DOMAIN_VERTICAL_DEFINITIONS[domainVertical];
  const siteSpecific = definition.topicBySiteType?.[siteType];
  if (siteSpecific?.[language]) return siteSpecific[language] as string;
  if (siteSpecific?.fr) return siteSpecific.fr;
  if (siteSpecific?.en) return siteSpecific.en;
  return definition.defaultTopic[language] || definition.defaultTopic.fr || definition.defaultTopic.en || getDefaultMainTopic(siteType, language, 'general_business');
}

function getDomainVerticalOfferLabel(
  domainVertical: DomainVertical,
  siteType: SiteType,
  language: PromptLanguage
): string {
  const taxonomyLabel = getSiteTypeVerticalDefaultOfferLabel(siteType, domainVertical, language);
  if (taxonomyLabel) return taxonomyLabel;

  const definition = DOMAIN_VERTICAL_DEFINITIONS[domainVertical];
  const siteSpecific = definition.offerBySiteType?.[siteType];
  if (siteSpecific?.[language]) return siteSpecific[language] as string;
  if (siteSpecific?.fr) return siteSpecific.fr;
  if (siteSpecific?.en) return siteSpecific.en;
  return definition.defaultOffer[language] || definition.defaultOffer.fr || definition.defaultOffer.en || getDefaultMainOffer(siteType, language, 'general_business');
}

function maybeSpecializeIntentWithVertical(
  value: string,
  params: {
    kind: 'topic' | 'offer';
    domainVertical: DomainVertical;
    siteType: SiteType;
    language: PromptLanguage;
    source: string;
    confidence: number;
  }
): string {
  const { kind, domainVertical, siteType, language, source, confidence } = params;
  if (domainVertical === 'general_business') return value;

  const generic =
    kind === 'topic' ? looksLikeGenericTopic(value) : looksLikeGenericOffer(value);
  const shouldOverride =
    generic ||
    isFallbackIntentSource(source) ||
    confidence < 58;

  if (!shouldOverride) return value;

  return kind === 'topic'
    ? getDomainVerticalTopicLabel(domainVertical, siteType, language)
    : getDomainVerticalOfferLabel(domainVertical, siteType, language);
}

function specializeSafeIntentBucket(params: {
  resolvedBucket: ResolvedSafeIntentBucket;
  siteType: SiteType;
  domainVertical: DomainVertical;
  language: PromptLanguage;
  mainTopic: string;
  mainOffer: string;
}): ResolvedSafeIntentBucket {
  const { resolvedBucket, siteType, domainVertical, language, mainTopic, mainOffer } = params;
  if (domainVertical === 'general_business') return resolvedBucket;

  const verticalOffer = getDomainVerticalOfferLabel(domainVertical, siteType, language);
  const bucketLooksWeak =
    resolvedBucket.source.startsWith('safe_intent_default:') ||
    normalizeIntentKey(resolvedBucket.value) === normalizeIntentKey(mainTopic) ||
    looksLikeGenericOffer(resolvedBucket.value) ||
    /(?:activité|operations?|choix éclairé|options disponibles|aide fiable)/i.test(resolvedBucket.value);

  if (!bucketLooksWeak) return resolvedBucket;

  const replacement = !looksLikeGenericOffer(mainOffer) ? mainOffer : verticalOffer;

  return {
    id: `${resolvedBucket.id}_vertical`,
    value: replacement,
    source: `domain_vertical_bucket:${domainVertical}`,
  };
}

function getDefaultFamilyIntent(siteFamily: SiteFamily, language: PromptLanguage): string {
  return SITE_FAMILY_DEFAULT_INTENT[siteFamily][language] || SITE_FAMILY_DEFAULT_INTENT.generic_family[language];
}

function getProfileFamilyIntent(profile: PromptGenerationProfile): string {
  if (!looksLikeGenericOffer(profile.mainOffer)) {
    return profile.mainOffer;
  }

  if (profile.domainVertical !== 'general_business') {
    return getDomainVerticalOfferLabel(profile.domainVertical, profile.siteType, profile.language);
  }

  return getDefaultFamilyIntent(profile.siteFamily, profile.language);
}

function getFamilyLabel(siteFamily: SiteFamily, language: PromptLanguage): string {
  return SITE_FAMILY_LABELS[siteFamily][language] || SITE_FAMILY_LABELS.generic_family[language];
}

function inferSiteFamily(params: {
  siteType: SiteType;
  siteTypeScores: SiteTypeScores;
}): SiteFamily {
  const { siteType, siteTypeScores } = params;

  if (siteType !== 'brand_site' && siteType !== 'generic') {
    return SITE_TYPE_TO_FAMILY[siteType];
  }

  const ordered = SPECIALIZED_SITE_TYPES
    .map((candidate) => [candidate, siteTypeScores[candidate] || 0] as const)
    .sort((a, b) => b[1] - a[1]);

  const [topType, topScore] = ordered[0] ?? ['generic', 0];
  return topScore >= 5 ? SITE_TYPE_TO_FAMILY[topType] : 'generic_family';
}

function calculateCrawlTransportScore(crawl: CrawlResult): number {
  const status = crawl.crawlStatus;
  const pages = crawl.previewSignals?.pages ?? [];
  const invalidPageCount = pages.filter((page) => page.isInvalidPage).length;
  const homepageFailed = deriveHomepageFailed(status);
  const subpageFailureCount = deriveSubpageFailureCount(status);
  let score = 100;

  if (pages.length === 0) score -= 45;
  if ((status?.homepageStatus ?? 200) >= 400) score -= 35;
  if (homepageFailed) score -= 25;
  if (pages[0]?.isInvalidPage) score -= 35;

  score -= Math.min(28, subpageFailureCount * 6);
  score -= Math.min(16, (status?.truncatedFetchCount ?? 0) * 4);
  score -= Math.min(24, invalidPageCount * 8);

  if (pages.length === 1) score -= 8;

  return clampScore(score);
}

function calculateSemanticCoverageScore(crawl: CrawlResult): number {
  const pages = getUsablePages(crawl.previewSignals?.pages ?? []);
  const homepage = pages[0];
  const stablePages = getStableDescriptorPages(pages);
  const previewSignals = crawl.previewSignals;
  const trustCoverage = previewSignals
    ? Object.values(previewSignals.trustPages).filter(Boolean).length
    : 0;

  let score = 0;

  if (homepage) score += 14;
  if (crawl.meta.title || homepage?.title) score += 10;
  if (crawl.meta.description || homepage?.metaDescription) score += 12;
  if (homepage?.h1) score += 6;
  if (crawl.businessInfo.name || previewSignals?.brandDetected || homepage?.brandHint) score += 12;
  if (crawl.structuredData.hasSchemaOrg) score += 8;
  if (homepage?.hasOpenGraph) score += 4;
  if (previewSignals?.structureReadable) score += 8;
  if (previewSignals?.descriptiveContent) score += 8;
  if (previewSignals?.entitiesUnderstandable) score += 8;
  if (previewSignals?.offerIdentifiable) score += 8;

  score += Math.min(18, stablePages.length * 6);
  score += Math.min(10, trustCoverage * 3);
  score += Math.min(8, Math.max(0, pages.length - 1) * 2);
  score += Math.round((previewSignals?.coherenceScore ?? 0) * 0.08);

  if (homepage?.likelySpaShell && stablePages.length === 0) score -= 8;
  if (!homepage?.title && !homepage?.metaDescription && !homepage?.h1) score -= 16;

  return clampScore(score);
}

function calculateSemanticConfidenceScore(params: {
  classification: SiteClassification;
  siteFamily: SiteFamily;
  domainVerticalConfidence: number;
  mainTopicConfidence: number;
  mainOfferConfidence: number;
}): number {
  const { classification, siteFamily, domainVerticalConfidence, mainTopicConfidence, mainOfferConfidence } = params;
  let score = Math.round(
    classification.confidenceScore * 0.38 +
      domainVerticalConfidence * 0.18 +
      mainTopicConfidence * 0.2 +
      mainOfferConfidence * 0.24
  );

  if (classification.siteType === 'generic') score -= 14;
  if (classification.siteType === 'brand_site') score -= 8;
  if (siteFamily === 'generic_family') score -= 10;

  return clampScore(score);
}

function determinePromptGenerationLevel(params: {
  siteType: SiteType;
  siteFamily: SiteFamily;
  domainVertical: DomainVertical;
  domainVerticalConfidence: number;
  crawlTransportScore: number;
  semanticCoverageScore: number;
  semanticConfidenceScore: number;
  classificationConfidenceScore: number;
  mainTopic: string;
  mainOffer: string;
  mainTopicSource: string;
  mainOfferSource: string;
  mainTopicSafe: boolean;
  mainOfferSafe: boolean;
}): PromptGenerationDecision {
  const {
    siteType,
    siteFamily,
    domainVertical,
    domainVerticalConfidence,
    crawlTransportScore,
    semanticCoverageScore,
    semanticConfidenceScore,
    classificationConfidenceScore,
    mainTopic,
    mainOffer,
    mainTopicSource,
    mainOfferSource,
    mainTopicSafe,
    mainOfferSafe,
  } = params;

  const hasExactType = siteType !== 'generic' && siteType !== 'brand_site';
  const hasUsableFamily = siteFamily !== 'generic_family';
  const hasUsableVertical = domainVertical !== 'general_business' && domainVerticalConfidence >= 60;
  const hasSpecializedVerticalIntent =
    domainVertical !== 'general_business' &&
    domainVerticalConfidence >= 52 &&
    !looksLikeGenericTopic(mainTopic) &&
    !looksLikeGenericOffer(mainOffer);
  const transportIsCritical = crawlTransportScore < 35 && semanticCoverageScore < 50;
  const transportIsSeverelyBroken = crawlTransportScore < 18 && semanticCoverageScore < 28;
  const exactIntentGrounded =
    !mainTopicSafe &&
    !mainOfferSafe &&
    !isFallbackIntentSource(mainTopicSource) &&
    !isFallbackIntentSource(mainOfferSource);
  const typeConfidenceStrong = hasExactType && classificationConfidenceScore >= 62;
  const typeConfidenceUsable = hasExactType && classificationConfidenceScore >= 52;

  if (
    exactIntentGrounded &&
    hasExactType &&
    semanticCoverageScore >= 70 &&
    semanticConfidenceScore >= 75 &&
    typeConfidenceStrong
  ) {
    return {
      level: 'exact',
      reason: 'Type fiable, intentions ancrées dans des signaux non fallback et couverture sémantique forte.',
    };
  }

  if (
    typeConfidenceUsable &&
    semanticCoverageScore >= 60 &&
    semanticConfidenceScore >= 58 &&
    !transportIsCritical
  ) {
    return {
      level: 'controlled',
      reason: 'Type exploitable avec une couverture suffisante, mais signal encore trop prudent pour exact.',
    };
  }

  if ((hasUsableFamily || hasUsableVertical) && semanticCoverageScore >= 50 && semanticConfidenceScore >= 45) {
    return {
      level: 'family',
      reason: 'Famille ou verticale métier reconnue avec une couverture sémantique suffisante.',
    };
  }

  // Preserve category-level prompts for well-classified sites even when crawl coverage is weak.
  if (
    (hasUsableFamily || hasUsableVertical) &&
    (typeConfidenceStrong || domainVerticalConfidence >= 68) &&
    semanticConfidenceScore >= 48 &&
    (semanticCoverageScore >= 36 || crawlTransportScore >= 28)
  ) {
    return {
      level: 'family',
      reason: 'Type ou verticale métier solides malgré une couverture partielle, on garde des prompts de catégorie.',
    };
  }

  if (hasSpecializedVerticalIntent && !transportIsSeverelyBroken) {
    return {
      level: 'family',
      reason: 'Verticale métier et besoin spécialisés détectés; plancher family appliqué pour éviter un fallback marque trop générique.',
    };
  }

  if (
    hasExactType &&
    classificationConfidenceScore >= 68 &&
    crawlTransportScore >= 40 &&
    !transportIsSeverelyBroken
  ) {
    return {
      level: 'family',
      reason: 'Type de site bien identifié et crawl exploitable; plancher family appliqué pour éviter des prompts full marque trop génériques.',
    };
  }

  return {
    level: 'brand',
    reason: 'Signal encore trop faible ou trop générique pour sortir du fallback marque.',
  };
}

function isFallbackIntentSource(source: string): boolean {
  return (
    source === 'fallback_topic' ||
    source === 'fallback_offer' ||
    source.startsWith('low_confidence_fallback:') ||
    source.startsWith('low_confidence_canonical_fallback:') ||
    source.startsWith('site_type_fallback:') ||
    source.startsWith('site_type_default:')
  );
}

function detectSafeIntentBucket(
  crawl: CrawlResult,
  context: {
    siteType: SiteType;
    language: PromptLanguage;
    mainTopic: string;
    mainOffer: string;
    mainTopicCandidates: string[];
    mainOfferCandidates: string[];
  }
): ResolvedSafeIntentBucket {
  const { siteType, language, mainTopic, mainOffer, mainTopicCandidates, mainOfferCandidates } = context;
  const buckets = SAFE_INTENT_BUCKETS[siteType] || SAFE_INTENT_BUCKETS.generic;
  const pages = getUsablePages(crawl.previewSignals?.pages ?? []);
  const stablePages = getStableDescriptorPages(pages);
  const weightedSources = [
    { value: mainOffer, weight: 9, label: 'main_offer' },
    ...mainOfferCandidates.map((value) => ({ value, weight: 7, label: 'main_offer_candidate' })),
    { value: mainTopic, weight: 5, label: 'main_topic' },
    ...mainTopicCandidates.map((value) => ({ value, weight: 4, label: 'main_topic_candidate' })),
    { value: crawl.businessInfo.description, weight: 4, label: 'business_description' },
    { value: crawl.meta.description, weight: 4, label: 'meta_description' },
    ...stablePages.flatMap((page) => [
      { value: page.metaDescription, weight: 3, label: `stable_page_meta:${page.path}` },
      { value: page.h1, weight: 2, label: `stable_page_h1:${page.path}` },
      { value: page.title, weight: 2, label: `stable_page_title:${page.path}` },
    ]),
    ...crawl.businessInfo.services.map((value) => ({ value, weight: 2, label: 'business_service' })),
  ];

  const scoredBuckets = buckets.map((bucket, index) => {
    let score = 0;
    let matches = 0;

    weightedSources.forEach((source) => {
      const normalized = normalizeNullableText(source.value);
      if (!normalized) return;
      if (!containsAny(normalized, bucket.hints)) return;
      score += source.weight;
      matches += 1;
    });

    if (matches >= 2) score += 5;
    if (mainOfferCandidates.some((value) => containsAny(value, bucket.hints))) score += 4;
    if (mainTopicCandidates.some((value) => containsAny(value, bucket.hints))) score += 2;

    return {
      bucket,
      score,
      matches,
      index,
    };
  });

  scoredBuckets.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.matches !== a.matches) return b.matches - a.matches;
    return a.index - b.index;
  });

  const best = scoredBuckets[0];
  const selected = best && best.score >= 7 ? best.bucket : buckets[0];

  return {
    id: selected.id,
    value: getSafeIntentBucketLabel(selected, language),
    source:
      best && best.score >= 7
        ? `safe_intent_match:${selected.id}`
        : `safe_intent_default:${selected.id}`,
  };
}

function getSafeIntentBucketLabel(
  bucket: SafeIntentBucketDefinition,
  language: PromptLanguage
): string {
  return bucket.labels[language] || bucket.labels.fr || bucket.labels.en || 'ce besoin';
}

function detectGeoScope(
  crawl: CrawlResult,
  fallbackCity: string | null | undefined
): string | null {
  const candidates = [
    crawl.previewSignals?.cityDetected,
    fallbackCity,
    extractCityFromAddress(crawl.previewSignals?.address ?? null),
    extractCityFromAddress(crawl.businessInfo.address),
  ]
    .map((value) => normalizeNullableText(value))
    .filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const cleaned = cleanGeoLabel(candidate);
    if (cleaned) return cleaned;
  }

  return null;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function classifySiteType(
  crawl: CrawlResult,
  context: {
    geoScope: string | null;
    knownPaths: string[];
  }
): SiteClassification {
  const pages = getUsablePages(crawl.previewSignals?.pages ?? []);
  const homepage = pages[0];
  const secondaryPages = pages.slice(1);
  const detectedSector = (crawl.previewSignals?.sectorDetected || detectSector(crawl.businessInfo) || '').toLowerCase();
  const homeText = [
    crawl.meta.title,
    crawl.meta.description,
    homepage?.title,
    homepage?.metaDescription,
    homepage?.h1,
    crawl.businessInfo.description,
    ...(crawl.businessInfo.services || []).slice(0, 3),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const secondaryText = secondaryPages
    .flatMap((page) => [page.title, page.metaDescription, page.h1])
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const normalizedPaths = Array.from(
    new Set(
      context.knownPaths
        .map((path) => normalizeInternalPath(path || ''))
        .filter((path): path is string => Boolean(path))
    )
  );
  const homeSchemaTypes = new Set((homepage?.schemaTypes || []).map((type) => type.toLowerCase()));
  const allSchemaTypes = new Set(
    pages.flatMap((page) => page.schemaTypes.map((type) => type.toLowerCase()))
  );
  const contactSignals = [
    Boolean(crawl.previewSignals?.phone || crawl.businessInfo.phone),
    Boolean(crawl.previewSignals?.email || crawl.businessInfo.email),
    Boolean(crawl.previewSignals?.address || crawl.businessInfo.address),
    Boolean(context.geoScope),
  ].filter(Boolean).length;
  const scores = createInitialSiteTypeScores();
  const reasons = createInitialReasonMap();
  const homeContains = (hints: readonly string[]) => containsAny(homeText, hints);
  const secondaryContains = (hints: readonly string[]) => containsAny(secondaryText, hints);
  const hasPath = (patterns: readonly string[]) =>
    normalizedPaths.some((path) => patterns.some((pattern) => isPathMatch(path, pattern)));
  const hasSchema = (schemaHints: readonly string[], scope: 'home' | 'all' = 'all') => {
    const haystack = scope === 'home' ? homeSchemaTypes : allSchemaTypes;
    return Array.from(haystack).some((type) =>
      schemaHints.some((hint) => type.includes(hint.toLowerCase()))
    );
  };
  const addScore = (type: SiteType, points: number, reason: string) => {
    scores[type] += points;
    reasons[type].push(reason);
  };
  const subtractScore = (type: SiteType, points: number) => {
    scores[type] = Math.max(0, scores[type] - points);
  };

  if (contactSignals >= 2) addScore('local_service', 3, 'coordonnées locales visibles');
  if (context.geoScope) addScore('local_service', 3, `zone géographique détectée (${context.geoScope})`);
  if (homeContains(LOCAL_SERVICE_HINTS)) addScore('local_service', 5, 'signaux service local sur la home');
  if (secondaryContains(LOCAL_SERVICE_HINTS)) addScore('local_service', 2, 'signaux service local sur des pages secondaires');
  if (hasSchema(['localbusiness'])) addScore('local_service', 6, 'schema LocalBusiness détecté');

  if (homeContains(SAAS_HINTS)) addScore('saas', 6, 'signaux SaaS visibles sur la home');
  if (secondaryContains(SAAS_HINTS)) addScore('saas', 2, 'signaux SaaS sur des pages secondaires');
  if (hasPath(SAAS_PATH_HINTS)) addScore('saas', 3, 'pages pricing/features/login détectées');
  if (hasSchema(['softwareapplication'], 'home')) addScore('saas', 6, 'schema SoftwareApplication sur la home');
  if (hasPath(DOCUMENTATION_PATH_HINTS)) addScore('saas', 1, 'section docs présente sur le site produit');

  if (homeContains(AI_NATIVE_HINTS)) addScore('ai_native', 6, 'signaux IA natifs visibles sur la home');
  if (secondaryContains(AI_NATIVE_HINTS)) addScore('ai_native', 2, 'signaux IA natifs sur des pages secondaires');
  if (hasPath(AI_NATIVE_PATH_HINTS)) addScore('ai_native', 3, 'pages AI/assistant/agents détectées');
  if (hasSchema(['softwareapplication'], 'home') && homeContains(['ai', 'ia', 'assistant', 'copilot', 'agent', 'agents'])) {
    addScore('ai_native', 4, 'schema logiciel avec promesse IA sur la home');
  }
  if (homeContains(['ai', 'ia', 'artificial intelligence', 'intelligence artificielle', 'llm', 'copilot', 'assistant'])) {
    addScore('ai_native', 3, 'vocabulaire IA central sur la home');
  }

  if (homeContains(STREAMING_HINTS)) addScore('streaming_entertainment', 6, 'signaux streaming visibles sur la home');
  if (secondaryContains(STREAMING_HINTS)) addScore('streaming_entertainment', 2, 'signaux streaming sur des pages secondaires');
  if (hasPath(STREAMING_PATH_HINTS)) addScore('streaming_entertainment', 3, 'pages watch/browse/listen détectées');
  if (hasSchema(['videoobject', 'audioobject', 'musicplaylist'])) {
    addScore('streaming_entertainment', 5, 'données structurées vidéo/audio détectées');
  }

  if (homeContains(MARKETPLACE_HINTS)) addScore('marketplace', 6, 'signaux marketplace visibles sur la home');
  if (secondaryContains(MARKETPLACE_HINTS)) addScore('marketplace', 2, 'signaux marketplace sur des pages secondaires');
  if (hasPath(MARKETPLACE_PATH_HINTS)) addScore('marketplace', 3, 'pages vendeurs/listings détectées');

  if (homeContains(EDUCATION_HINTS)) addScore('education_training', 6, 'signaux formation visibles sur la home');
  if (secondaryContains(EDUCATION_HINTS)) addScore('education_training', 2, 'signaux formation sur des pages secondaires');
  if (hasPath(EDUCATION_PATH_HINTS)) addScore('education_training', 3, 'pages cours/academy détectées');
  if (hasSchema(['course'])) addScore('education_training', 5, 'schema Course détecté');

  if (homeContains(DOCUMENTATION_HINTS)) addScore('documentation_knowledge', 6, 'signaux documentation visibles sur la home');
  if (secondaryContains(DOCUMENTATION_HINTS)) addScore('documentation_knowledge', 2, 'signaux documentation sur des pages secondaires');
  if (hasPath(DOCUMENTATION_PATH_HINTS)) addScore('documentation_knowledge', 4, 'pages docs/support détectées');
  if (hasPath(['/api']) && hasPath(['/docs', '/documentation'])) {
    addScore('documentation_knowledge', 2, 'structure API/docs détectée');
  }

  if (homeContains(COMMUNITY_HINTS)) addScore('community_forum', 6, 'signaux communauté visibles sur la home');
  if (secondaryContains(COMMUNITY_HINTS)) addScore('community_forum', 2, 'signaux communauté sur des pages secondaires');
  if (hasPath(COMMUNITY_PATH_HINTS)) addScore('community_forum', 4, 'pages forum/community détectées');

  if (homeContains(TRAVEL_HINTS)) addScore('travel_booking', 6, 'signaux voyage/réservation visibles sur la home');
  if (secondaryContains(TRAVEL_HINTS)) addScore('travel_booking', 2, 'signaux voyage sur des pages secondaires');
  if (hasPath(TRAVEL_PATH_HINTS)) addScore('travel_booking', 3, 'pages booking/destinations détectées');

  if (homeContains(JOBS_HINTS)) addScore('jobs_recruitment', 6, 'signaux emploi visibles sur la home');
  if (secondaryContains(JOBS_HINTS)) addScore('jobs_recruitment', 2, 'signaux emploi sur des pages secondaires');
  if (hasPath(JOBS_PATH_HINTS)) addScore('jobs_recruitment', 3, 'pages jobs/careers détectées');
  if (hasSchema(['jobposting'])) addScore('jobs_recruitment', 6, 'schema JobPosting détecté');

  if (homeContains(PUBLIC_SERVICE_HINTS)) addScore('public_service_nonprofit', 6, 'signaux institutionnels visibles sur la home');
  if (secondaryContains(PUBLIC_SERVICE_HINTS)) addScore('public_service_nonprofit', 2, 'signaux institutionnels sur des pages secondaires');
  if (hasPath(PUBLIC_SERVICE_PATH_HINTS)) addScore('public_service_nonprofit', 3, 'pages institutionnelles détectées');
  if (homeContains(['association', 'fondation', 'service public', 'citoyens'])) {
    addScore('public_service_nonprofit', 2, 'vocabulaire associatif ou public détecté');
  }

  if (homeContains(ECOMMERCE_HINTS)) addScore('ecommerce', 6, 'signaux e-commerce visibles sur la home');
  if (secondaryContains(ECOMMERCE_HINTS)) addScore('ecommerce', 2, 'signaux e-commerce sur des pages secondaires');
  if (hasPath(ECOMMERCE_PATH_HINTS)) addScore('ecommerce', 3, 'pages shop/products/cart détectées');
  if (hasSchema(['product'])) addScore('ecommerce', 5, 'schema Product détecté');
  if (detectedSector.includes('e-commerce') || detectedSector.includes('commerce')) {
    addScore('ecommerce', 5, `secteur détecté orienté commerce (${detectedSector})`);
  }
  if (detectedSector.includes('saas')) {
    addScore('saas', 4, `secteur détecté orienté logiciel (${detectedSector})`);
  }
  if (detectedSector.includes('média') || detectedSector.includes('media')) {
    addScore('media', 4, `secteur détecté orienté contenu (${detectedSector})`);
  }

  const hasMediaHintsOnHome = homeContains(MEDIA_HINTS);
  const hasStrongMediaHintsOnHome = homeContains(STRONG_MEDIA_HINTS);
  if (hasMediaHintsOnHome) {
    addScore('media', hasStrongMediaHintsOnHome ? 6 : 4, 'signaux média visibles sur la home');
  }
  if (secondaryContains(MEDIA_HINTS)) addScore('media', 2, 'signaux média sur des pages secondaires');
  if (hasPath(MEDIA_PATH_HINTS)) addScore('media', 3, 'pages blog/news détectées');
  if (hasSchema(['article', 'newsarticle'])) addScore('media', 5, 'schema Article/NewsArticle détecté');

  if (homeContains(PORTFOLIO_HINTS)) addScore('portfolio', 5, 'signaux portfolio visibles sur la home');
  if (secondaryContains(PORTFOLIO_HINTS)) addScore('portfolio', 2, 'signaux portfolio sur des pages secondaires');
  if (hasPath(PORTFOLIO_PATH_HINTS)) addScore('portfolio', 3, 'pages portfolio/projects détectées');

  const hasBrandHintsOnHome = homeContains(BRAND_HINTS);
  if (hasBrandHintsOnHome) addScore('brand_site', 4, 'signaux marque/storytelling sur la home');
  if (hasPath(['/about', '/a-propos', '/company'])) addScore('brand_site', 1, 'page about/company détectée');
  if (!hasMediaHintsOnHome && !homeContains(SAAS_HINTS) && !homeContains(ECOMMERCE_HINTS)) {
    addScore('brand_site', 2, 'site de marque sans pattern spécialisé dominant sur la home');
  }

  if (scores.ai_native >= 6) {
    subtractScore('saas', 2);
    subtractScore('documentation_knowledge', 1);
  }
  if (scores.saas >= 6 && !homeContains(['ai', 'ia', 'assistant', 'copilot', 'agent', 'agents', 'llm'])) {
    subtractScore('ai_native', 4);
  }
  if (scores.marketplace >= 6) subtractScore('ecommerce', 2);
  if (scores.ecommerce >= 6) subtractScore('marketplace', 3);
  if (scores.streaming_entertainment >= 6) {
    subtractScore('saas', 3);
    subtractScore('ecommerce', 2);
  }
  if (scores.documentation_knowledge >= 6 && scores.saas >= 6) {
    subtractScore('documentation_knowledge', 2);
  }
  if (scores.community_forum >= 6) {
    subtractScore('media', 2);
    subtractScore('documentation_knowledge', 1);
  }
  if (scores.media >= 6) {
    subtractScore('community_forum', 1);
    subtractScore('documentation_knowledge', 1);
  }
  if (!homeContains(JOBS_HINTS) && hasPath(JOBS_PATH_HINTS) && scores.saas >= 6) {
    subtractScore('jobs_recruitment', 4);
  }
  if (scores.public_service_nonprofit >= 6) {
    subtractScore('saas', 2);
    subtractScore('ecommerce', 2);
  }

  if (!homepage?.title && !homepage?.h1 && !homepage?.metaDescription) {
    addScore('generic', 3, 'home trop pauvre pour une classification fiable');
  }

  const ordered = Object.entries(scores).sort((a, b) => b[1] - a[1]) as Array<[SiteType, number]>;
  const [rawTopType, rawTopScore] = ordered[0];
  const [rawRunnerUpType, rawRunnerUpScore] = ordered[1] ?? ['generic', 0];
  const gap = rawTopScore - rawRunnerUpScore;
  let finalType = rawTopType;
  let finalSignals = reasons[rawTopType].slice(0, 6);
  let classificationReason = `${rawTopType} retenu avec ${rawTopScore} points et ${gap} points d'avance sur ${rawRunnerUpType}.`;
  const preserveSpecializedType =
    rawTopType !== 'brand_site' &&
    rawTopType !== 'generic' &&
    ((rawTopScore >= MIN_SITE_TYPE_SCORE && gap >= MIN_SITE_TYPE_GAP) ||
      (rawTopScore >= 6 && reasons[rawTopType].length >= 2) ||
      (rawTopScore >= 5 && reasons[rawTopType].length >= 3));

  const needsFallback =
    rawTopType !== 'brand_site' &&
    rawTopType !== 'generic' &&
    !preserveSpecializedType;

  if (needsFallback) {
    finalType = rawTopScore >= 5 || reasons[rawTopType].length >= 2 ? 'brand_site' : 'generic';
    finalSignals = [
      `fallback depuis ${rawTopType} (score ${rawTopScore}, écart ${gap} avec ${rawRunnerUpType})`,
      ...reasons[rawTopType],
      ...reasons[finalType],
    ].slice(0, 6);
    classificationReason = `Fallback vers ${finalType} car ${rawTopType} n'est pas assez dominant (score ${rawTopScore}, écart ${gap} avec ${rawRunnerUpType}).`;
  } else if (
    rawTopType === 'brand_site' &&
    rawRunnerUpType !== 'brand_site' &&
    rawRunnerUpType !== 'generic' &&
    rawRunnerUpScore >= 5 &&
    reasons[rawRunnerUpType].length >= 2
  ) {
    finalType = rawRunnerUpType;
    finalSignals = [
      `priorité au type spécialisé ${rawRunnerUpType} face à brand_site`,
      ...reasons[rawRunnerUpType],
    ].slice(0, 6);
    classificationReason = `Priorité donnée à ${rawRunnerUpType} face à brand_site grâce à des signaux spécialisés exploitables (score ${rawRunnerUpScore}).`;
  } else if (rawTopType === 'brand_site' && rawTopScore < 5) {
    finalType = 'generic';
    finalSignals = [
      `fallback depuis brand_site (score ${rawTopScore})`,
      ...reasons.brand_site,
    ].slice(0, 6);
    classificationReason = `Fallback vers generic car les signaux de marque restent trop faibles pour un classement fiable.`;
  }

  return {
    siteType: finalType,
    confidenceScore: calculateClassificationConfidence({
      topScore: rawTopScore,
      gap,
      accepted: finalType === rawTopType,
      signalCount: finalSignals.length,
      finalType,
    }),
    runnerUpType: finalType === rawTopType ? rawRunnerUpType : rawTopType,
    signalsMatched: finalSignals,
    classificationReason,
    siteTypeScores: scores,
  };
}

function createInitialSiteTypeScores(): SiteTypeScores {
  return SITE_TYPES.reduce((acc, siteType) => {
    acc[siteType] = siteType === 'generic' ? 1 : 0;
    return acc;
  }, {} as SiteTypeScores);
}

function createInitialReasonMap(): SiteTypeReasonMap {
  return SITE_TYPES.reduce((acc, siteType) => {
    acc[siteType] = [];
    return acc;
  }, {} as SiteTypeReasonMap);
}

function calculateClassificationConfidence(params: {
  topScore: number;
  gap: number;
  accepted: boolean;
  signalCount: number;
  finalType: SiteType;
}): number {
  const { topScore, gap, accepted, signalCount, finalType } = params;
  const scoreComponent = Math.min(45, topScore * 4);
  const gapComponent = Math.min(25, Math.max(0, gap) * 5);
  const signalComponent = Math.min(15, signalCount * 3);
  const acceptanceBonus = accepted ? 15 : 0;
  const fallbackPenalty = finalType === 'generic' ? 20 : finalType === 'brand_site' && !accepted ? 10 : 0;

  return Math.max(
    18,
    Math.min(96, scoreComponent + gapComponent + signalComponent + acceptanceBonus - fallbackPenalty)
  );
}

function buildFamilyBackendPrompts(profile: PromptGenerationProfile): PromptDraft[] {
  const { siteFamily, language, siteName } = profile;
  const familyIntent = getProfileFamilyIntent(profile);

  if (siteFamily === 'software_family') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do reviews say about ${siteName}?`, 'reputation'),
      draft(language === 'fr' ? `Quels logiciels recommanderais-tu pour ${familyIntent} ?` : `Which software products would you recommend for ${familyIntent}?`, 'recommendation'),
      draft(language === 'fr' ? `Quels logiciels ressortent le plus pour ${familyIntent} ?` : `Which software products stand out most for ${familyIntent}?`, 'listing'),
      draft(language === 'fr' ? `Quel logiciel choisir pour ${familyIntent} ?` : `Which software should I choose for ${familyIntent}?`, 'comparison'),
      draft(language === 'fr' ? `Quelles alternatives à ${siteName} sont le plus souvent citées ?` : `Which alternatives to ${siteName} are cited most often?`, 'alternative'),
    ];
  }

  if (siteFamily === 'content_family') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do people think about ${siteName}?`, 'reputation'),
      draft(language === 'fr' ? `Quels acteurs recommanderais-tu pour ${familyIntent} ?` : `Which platforms would you recommend for ${familyIntent}?`, 'recommendation'),
      draft(language === 'fr' ? `Quels acteurs ressortent le plus pour ${familyIntent} ?` : `Which platforms stand out most for ${familyIntent}?`, 'listing'),
      draft(language === 'fr' ? `Quelle plateforme choisir pour ${familyIntent} ?` : `Which platform should I choose for ${familyIntent}?`, 'comparison'),
      draft(language === 'fr' ? `Quelles alternatives à ${siteName} sont le plus souvent citées ?` : `Which alternatives to ${siteName} are cited most often?`, 'alternative'),
    ];
  }

  if (siteFamily === 'commerce_family') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do people think about ${siteName}?`, 'reputation'),
      draft(language === 'fr' ? `Quels acteurs recommanderais-tu pour ${familyIntent} ?` : `Which commerce platforms would you recommend for ${familyIntent}?`, 'recommendation'),
      draft(language === 'fr' ? `Quels acteurs ressortent le plus pour ${familyIntent} ?` : `Which commerce platforms stand out most for ${familyIntent}?`, 'listing'),
      draft(language === 'fr' ? `Quelle plateforme choisir pour ${familyIntent} ?` : `Which platform should I choose for ${familyIntent}?`, 'comparison'),
      draft(language === 'fr' ? `Quelles alternatives à ${siteName} sont le plus souvent citées ?` : `Which alternatives to ${siteName} are cited most often?`, 'alternative'),
    ];
  }

  if (siteFamily === 'service_family') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do people think about ${siteName}?`, 'reputation'),
      draft(language === 'fr' ? `Quels acteurs recommanderais-tu pour ${familyIntent} ?` : `Which providers would you recommend for ${familyIntent}?`, 'recommendation'),
      draft(language === 'fr' ? `Quels acteurs ressortent le plus pour ${familyIntent} ?` : `Which providers stand out most for ${familyIntent}?`, 'listing'),
      draft(language === 'fr' ? `Quel service choisir pour ${familyIntent} ?` : `Which service should I choose for ${familyIntent}?`, 'comparison'),
      draft(language === 'fr' ? `Quelles alternatives à ${siteName} sont le plus souvent citées ?` : `Which alternatives to ${siteName} are cited most often?`, 'alternative'),
    ];
  }

  if (siteFamily === 'institutional_family') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do people think about ${siteName}?`, 'reputation'),
      draft(language === 'fr' ? `Quels organismes recommanderais-tu pour ${familyIntent} ?` : `Which organizations would you recommend for ${familyIntent}?`, 'recommendation'),
      draft(language === 'fr' ? `Quels organismes ressortent le plus pour ${familyIntent} ?` : `Which organizations stand out most for ${familyIntent}?`, 'listing'),
      draft(language === 'fr' ? `Quelle ressource consulter pour ${familyIntent} ?` : `Which resource should I consult for ${familyIntent}?`, 'comparison'),
      draft(language === 'fr' ? `Quelles alternatives à ${siteName} sont le plus souvent citées ?` : `Which alternatives to ${siteName} are cited most often?`, 'alternative'),
    ];
  }

  if (siteFamily === 'learning_family') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do people think about ${siteName}?`, 'reputation'),
      draft(language === 'fr' ? `Quels acteurs recommanderais-tu pour ${familyIntent} ?` : `Which learning platforms would you recommend for ${familyIntent}?`, 'recommendation'),
      draft(language === 'fr' ? `Quels acteurs ressortent le plus pour ${familyIntent} ?` : `Which learning platforms stand out most for ${familyIntent}?`, 'listing'),
      draft(language === 'fr' ? `Quelle plateforme choisir pour ${familyIntent} ?` : `Which platform should I choose for ${familyIntent}?`, 'comparison'),
      draft(language === 'fr' ? `Quelles alternatives à ${siteName} sont le plus souvent citées ?` : `Which alternatives to ${siteName} are cited most often?`, 'alternative'),
    ];
  }

  return buildBrandFallbackBackendPrompts(profile);
}

function buildBrandFallbackBackendPrompts(profile: PromptGenerationProfile): PromptDraft[] {
  const { language, siteName } = profile;

  return [
    draft(language === 'fr' ? `Quels avis trouve-t-on sur ${siteName} ?` : `What feedback exists about ${siteName}?`, 'reputation'),
    draft(language === 'fr' ? `Quelles alternatives à ${siteName} sont le plus souvent citées ?` : `Which alternatives to ${siteName} are cited most often?`, 'recommendation'),
    draft(language === 'fr' ? `Quels acteurs comparables à ${siteName} ressortent le plus ?` : `Which players comparable to ${siteName} stand out most?`, 'listing'),
    draft(language === 'fr' ? `Comment ${siteName} se positionne-t-il face à ses alternatives ?` : `How does ${siteName} compare with its alternatives?`, 'comparison'),
    draft(language === 'fr' ? `Quand ${siteName} est-il recommandé ou non ?` : `When is ${siteName} recommended or not?`, 'alternative'),
  ];
}

function buildSafeBackendPrompts(profile: PromptGenerationProfile): PromptDraft[] {
  const { siteType, language, siteName, geoScope, safeIntentBucket } = profile;

  if (siteType === 'local_service') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do reviews say about ${siteName}?`, 'reputation'),
      draft(
        geoScoped(
          language,
          geoScope,
          `Qui recommanderais-tu pour ${safeIntentBucket} à`,
          `Qui recommanderais-tu pour ${safeIntentBucket} ?`,
          `Who would you recommend for ${safeIntentBucket} in`,
          `Who would you recommend for ${safeIntentBucket}?`
        ),
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quels prestataires ressortent le plus pour ${safeIntentBucket} ?`
          : `Which providers stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Qui choisir pour ${safeIntentBucket} ?`
          : `Who should I choose for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Quelles alternatives à ${siteName} comparer ?`
          : `Which alternatives to ${siteName} should I compare?`,
        'alternative'
      ),
    ];
  }

  if (siteType === 'saas') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do reviews say about ${siteName}?`, 'reputation'),
      draft(
        language === 'fr'
          ? `Quels logiciels recommanderais-tu pour ${safeIntentBucket} ?`
          : `Which software products would you recommend for ${safeIntentBucket}?`,
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quels logiciels ressortent le plus pour ${safeIntentBucket} ?`
          : `Which software products stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Quel logiciel choisir pour ${safeIntentBucket} ?`
          : `Which software should I choose for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Qui sont les concurrents principaux de ${siteName} ?`
          : `Who are the main competitors to ${siteName}?`,
        'alternative'
      ),
    ];
  }

  if (siteType === 'ai_native') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do reviews say about ${siteName}?`, 'reputation'),
      draft(
        language === 'fr'
          ? `Quels outils IA recommanderais-tu pour ${safeIntentBucket} ?`
          : `Which AI tools would you recommend for ${safeIntentBucket}?`,
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quels outils IA ressortent le plus pour ${safeIntentBucket} ?`
          : `Which AI tools stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Quel outil IA choisir pour ${safeIntentBucket} ?`
          : `Which AI tool should I choose for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Qui sont les concurrents principaux de ${siteName} ?`
          : `Who are the main competitors to ${siteName}?`,
        'alternative'
      ),
    ];
  }

  if (siteType === 'streaming_entertainment') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do people think about ${siteName}?`, 'reputation'),
      draft(
        language === 'fr'
          ? `Quelles plateformes recommanderais-tu pour ${safeIntentBucket} ?`
          : `Which platforms would you recommend for ${safeIntentBucket}?`,
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quelles plateformes ressortent le plus pour ${safeIntentBucket} ?`
          : `Which platforms stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Quelle plateforme choisir pour ${safeIntentBucket} ?`
          : `Which platform should I choose for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Qui sont les concurrents principaux de ${siteName} ?`
          : `Who are the main competitors to ${siteName}?`,
        'alternative'
      ),
    ];
  }

  if (siteType === 'marketplace') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do people think about ${siteName}?`, 'reputation'),
      draft(
        language === 'fr'
          ? `Quelles plateformes recommanderais-tu pour ${safeIntentBucket} ?`
          : `Which platforms would you recommend for ${safeIntentBucket}?`,
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quelles plateformes ressortent le plus pour ${safeIntentBucket} ?`
          : `Which platforms stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Quelle plateforme choisir pour ${safeIntentBucket} ?`
          : `Which platform should I choose for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Qui sont les concurrents principaux de ${siteName} ?`
          : `Who are the main competitors to ${siteName}?`,
        'alternative'
      ),
    ];
  }

  if (siteType === 'education_training') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do people think about ${siteName}?`, 'reputation'),
      draft(
        language === 'fr'
          ? `Quelles formations recommanderais-tu pour ${safeIntentBucket} ?`
          : `Which training options would you recommend for ${safeIntentBucket}?`,
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quelles formations ressortent le plus pour ${safeIntentBucket} ?`
          : `Which training options stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Quelle formation choisir pour ${safeIntentBucket} ?`
          : `Which training program should I choose for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Qui sont les concurrents principaux de ${siteName} ?`
          : `Who are the main competitors to ${siteName}?`,
        'alternative'
      ),
    ];
  }

  if (siteType === 'documentation_knowledge') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} comme ressource ?` : `How is ${siteName} rated as a resource?`, 'reputation'),
      draft(
        language === 'fr'
          ? `Quelles ressources recommanderais-tu pour ${safeIntentBucket} ?`
          : `Which resources would you recommend for ${safeIntentBucket}?`,
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quelles ressources ressortent le plus pour ${safeIntentBucket} ?`
          : `Which resources stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Quelle ressource consulter pour ${safeIntentBucket} ?`
          : `Which resource should I consult for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Quelles alternatives à ${siteName} peux-tu citer ?`
          : `What alternatives to ${siteName} can you cite?`,
        'alternative'
      ),
    ];
  }

  if (siteType === 'community_forum') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do people think about ${siteName}?`, 'reputation'),
      draft(
        language === 'fr'
          ? `Quelles communautés recommanderais-tu pour ${safeIntentBucket} ?`
          : `Which communities would you recommend for ${safeIntentBucket}?`,
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quelles communautés ressortent le plus pour ${safeIntentBucket} ?`
          : `Which communities stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Quelle communauté choisir pour ${safeIntentBucket} ?`
          : `Which community should I choose for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Quelles alternatives à ${siteName} comparer ?`
          : `Which alternatives to ${siteName} should I compare?`,
        'alternative'
      ),
    ];
  }

  if (siteType === 'travel_booking') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do people think about ${siteName}?`, 'reputation'),
      draft(
        language === 'fr'
          ? `Quelles plateformes recommanderais-tu pour ${safeIntentBucket} ?`
          : `Which platforms would you recommend for ${safeIntentBucket}?`,
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quelles plateformes ressortent le plus pour ${safeIntentBucket} ?`
          : `Which platforms stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Quelle plateforme choisir pour ${safeIntentBucket} ?`
          : `Which platform should I choose for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Qui sont les concurrents principaux de ${siteName} ?`
          : `Who are the main competitors to ${siteName}?`,
        'alternative'
      ),
    ];
  }

  if (siteType === 'jobs_recruitment') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do people think about ${siteName}?`, 'reputation'),
      draft(
        language === 'fr'
          ? `Quelles plateformes recommanderais-tu pour ${safeIntentBucket} ?`
          : `Which platforms would you recommend for ${safeIntentBucket}?`,
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quelles plateformes ressortent le plus pour ${safeIntentBucket} ?`
          : `Which platforms stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Quelle plateforme choisir pour ${safeIntentBucket} ?`
          : `Which platform should I choose for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Qui sont les concurrents principaux de ${siteName} ?`
          : `Who are the main competitors to ${siteName}?`,
        'alternative'
      ),
    ];
  }

  if (siteType === 'public_service_nonprofit') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do people think about ${siteName}?`, 'reputation'),
      draft(
        language === 'fr'
          ? `Quelles ressources recommanderais-tu pour ${safeIntentBucket} ?`
          : `Which resources would you recommend for ${safeIntentBucket}?`,
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quels organismes ressortent le plus pour ${safeIntentBucket} ?`
          : `Which organizations stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Vers quel organisme se tourner pour ${safeIntentBucket} ?`
          : `Which organization should I turn to for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Quelles ressources comparer à ${siteName} ?`
          : `Which resources should I compare with ${siteName}?`,
        'alternative'
      ),
    ];
  }

  if (siteType === 'ecommerce') {
    return [
      draft(language === 'fr' ? `Quels sont les avis clients sur ${siteName} ?` : `What do customers say about ${siteName}?`, 'reputation'),
      draft(
        language === 'fr'
          ? `Quelles boutiques recommanderais-tu pour ${safeIntentBucket} ?`
          : `Which stores would you recommend for ${safeIntentBucket}?`,
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quelles boutiques ressortent le plus pour ${safeIntentBucket} ?`
          : `Which stores stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Quelle boutique choisir pour ${safeIntentBucket} ?`
          : `Which store should I choose for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Quelles marques comparer à ${siteName} ?`
          : `Which brands should I compare with ${siteName}?`,
        'alternative'
      ),
    ];
  }

  if (siteType === 'media') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} comme source ?` : `How is ${siteName} rated as a source?`, 'reputation'),
      draft(
        language === 'fr'
          ? `Quelles sources recommanderais-tu pour ${safeIntentBucket} ?`
          : `Which sources would you recommend for ${safeIntentBucket}?`,
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quelles sources ressortent le plus pour ${safeIntentBucket} ?`
          : `Which sources stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Quelle source consulter pour ${safeIntentBucket} ?`
          : `Which source should I consult for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Quelles alternatives à ${siteName} dois-je suivre ?`
          : `Which alternatives to ${siteName} should I follow?`,
        'alternative'
      ),
    ];
  }

  if (siteType === 'portfolio') {
    return [
      draft(language === 'fr' ? `Quels sont les avis sur ${siteName} ?` : `What do people say about ${siteName}?`, 'reputation'),
      draft(
        language === 'fr'
          ? `Quels profils recommanderais-tu pour ${safeIntentBucket} ?`
          : `Which profiles would you recommend for ${safeIntentBucket}?`,
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quels profils ressortent le plus pour ${safeIntentBucket} ?`
          : `Which profiles stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Quel profil choisir pour ${safeIntentBucket} ?`
          : `Which profile should I choose for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Quelles alternatives à ${siteName} comparer ?`
          : `Which alternatives to ${siteName} should I compare?`,
        'alternative'
      ),
    ];
  }

  if (siteType === 'brand_site') {
    return [
      draft(language === 'fr' ? `Quels avis trouve-t-on sur ${siteName} ?` : `What feedback exists about ${siteName}?`, 'reputation'),
      draft(
        language === 'fr'
          ? `Quelles marques recommanderais-tu pour ${safeIntentBucket} ?`
          : `Which brands would you recommend for ${safeIntentBucket}?`,
        'recommendation'
      ),
      draft(
        language === 'fr'
          ? `Quelles marques ressortent le plus pour ${safeIntentBucket} ?`
          : `Which brands stand out most for ${safeIntentBucket}?`,
        'listing'
      ),
      draft(
        language === 'fr'
          ? `Quelle marque choisir pour ${safeIntentBucket} ?`
          : `Which brand should I choose for ${safeIntentBucket}?`,
        'comparison'
      ),
      draft(
        language === 'fr'
          ? `Quelles alternatives directes à ${siteName} existent ?`
          : `What direct alternatives to ${siteName} exist?`,
        'alternative'
      ),
    ];
  }

  return [
    draft(language === 'fr' ? `Quels avis trouve-t-on sur ${siteName} ?` : `What feedback exists about ${siteName}?`, 'reputation'),
    draft(
      language === 'fr'
        ? `Quels acteurs recommanderais-tu pour ${safeIntentBucket} ?`
        : `Which providers would you recommend for ${safeIntentBucket}?`,
      'recommendation'
    ),
    draft(
      language === 'fr'
        ? `Quels acteurs ressortent le plus pour ${safeIntentBucket} ?`
        : `Which providers stand out most for ${safeIntentBucket}?`,
      'listing'
    ),
    draft(
      language === 'fr'
        ? `Quel acteur consulter pour ${safeIntentBucket} ?`
        : `Which provider should I consult for ${safeIntentBucket}?`,
      'comparison'
    ),
    draft(
      language === 'fr'
        ? `Quelles alternatives à ${siteName} peux-tu citer ?`
        : `Which alternatives to ${siteName} can you cite?`,
      'alternative'
    ),
  ];
}

function draft(
  prompt: string,
  category: PromptQuery['category'],
  options: Partial<
    Pick<
      PromptDraft,
      | 'visibility'
      | 'benchmarkGroup'
      | 'brandAnchored'
      | 'analysisTrack'
      | 'affectsVisibilityScore'
      | 'affectsCitationMatrix'
    >
  > = {}
): PromptDraft {
  return {
    prompt: normalizePrompt(prompt),
    category,
    visibility: options.visibility,
    benchmarkGroup: options.benchmarkGroup,
    brandAnchored: options.brandAnchored,
    analysisTrack: options.analysisTrack,
    affectsVisibilityScore: options.affectsVisibilityScore,
    affectsCitationMatrix: options.affectsCitationMatrix,
  };
}

function dedupePrompts(drafts: PromptDraft[]): PromptDraft[] {
  const unique = new Map<string, PromptDraft>();
  for (const draft of drafts) {
    const normalizedKey = normalizePrompt(draft.prompt).toLowerCase();
    if (!normalizedKey) continue;
    if (!unique.has(normalizedKey)) {
      unique.set(normalizedKey, {
        prompt: normalizePrompt(draft.prompt),
        category: draft.category,
        visibility: draft.visibility,
        benchmarkGroup: draft.benchmarkGroup,
        brandAnchored: draft.brandAnchored,
        analysisTrack: draft.analysisTrack,
        affectsVisibilityScore: draft.affectsVisibilityScore,
        affectsCitationMatrix: draft.affectsCitationMatrix,
      });
    }
  }
  return Array.from(unique.values());
}

function ensurePromptCount(
  drafts: PromptDraft[],
  profile: PromptGenerationProfile
): PromptDraft[] {
  const filled = [...drafts];
  const fallbacks = buildFallbackPrompts(profile);
  let fallbackCursor = 0;
  let syntheticCursor = 0;

  while (filled.length < TARGET_PROMPT_COUNT && syntheticCursor < TARGET_PROMPT_COUNT * 2) {
    const fallback = fallbacks[fallbackCursor % fallbacks.length];
    fallbackCursor += 1;
    const duplicate = filled.some(
      (entry) => entry.prompt.toLowerCase() === fallback.prompt.toLowerCase()
    );

    if (!duplicate) {
      filled.push(fallback);
      continue;
    }

    syntheticCursor += 1;
    const synthetic = buildSyntheticPrompt(profile, syntheticCursor);
    const syntheticDuplicate = filled.some(
      (entry) => entry.prompt.toLowerCase() === synthetic.prompt.toLowerCase()
    );
    if (!syntheticDuplicate) {
      filled.push(synthetic);
    }
  }

  return filled.slice(0, TARGET_PROMPT_COUNT);
}

function buildFallbackPrompts(profile: PromptGenerationProfile): PromptDraft[] {
  if (profile.promptGenerationLevel === 'brand') {
    return buildBrandFallbackBackendPrompts(profile);
  }

  if (profile.promptGenerationLevel === 'family') {
    return buildFamilyBackendPrompts(profile);
  }

  if (profile.promptGenerationLevel === 'controlled') {
    return buildSafeBackendPrompts(profile);
  }

  const { language, siteName, mainTopic, mainOffer } = profile;

  if (language === 'fr') {
    return [
      draft(`Que sais-tu sur ${siteName} ?`, 'info'),
      draft(`Est-ce que ${siteName} est une bonne option pour ${mainTopic} ?`, 'reputation'),
      draft(`Quels acteurs recommanderais-tu pour ${mainTopic} ?`, 'recommendation'),
      draft(`Quel service choisir pour ${mainOffer} ?`, 'comparison'),
      draft(`Quelles alternatives à ${siteName} peux-tu citer ?`, 'alternative'),
    ];
  }

  return [
    draft(`What do you know about ${siteName}?`, 'info'),
    draft(`Is ${siteName} a good option for ${mainTopic}?`, 'reputation'),
    draft(`Which providers would you recommend for ${mainTopic}?`, 'recommendation'),
    draft(`Which service should I choose for ${mainOffer}?`, 'comparison'),
    draft(`Which alternatives to ${siteName} can you cite?`, 'alternative'),
  ];
}

function buildSyntheticPrompt(
  profile: PromptGenerationProfile,
  index: number
): PromptDraft {
  const { language, siteName, mainTopic, mainOffer, safeIntentBucket, promptGenerationLevel } = profile;

  if (promptGenerationLevel === 'brand') {
    const syntheticPool: PromptDraft[] = [
      draft(language === 'fr' ? `Que disent les IA de ${siteName} ?` : `How do AI engines talk about ${siteName}?`, 'info'),
      draft(language === 'fr' ? `Quels concurrents de ${siteName} reviennent le plus ?` : `Which competitors to ${siteName} appear most often?`, 'listing'),
      draft(language === 'fr' ? `Comment ${siteName} est-il comparé à ses alternatives ?` : `How is ${siteName} compared with alternatives?`, 'comparison'),
      draft(language === 'fr' ? `Dans quelles situations ${siteName} est-il cité ?` : `In which situations is ${siteName} cited?`, 'situation'),
      draft(language === 'fr' ? `Quelles marques apparaissent à la place de ${siteName} ?` : `Which brands appear instead of ${siteName}?`, 'alternative'),
    ];
    return syntheticPool[index % syntheticPool.length];
  }

  if (promptGenerationLevel === 'family' || promptGenerationLevel === 'controlled') {
    const syntheticPool: PromptDraft[] = [
      draft(language === 'fr' ? `Que répondent les IA quand on cherche ${siteName} ?` : `How do AI engines describe ${siteName}?`, 'info'),
      draft(language === 'fr' ? `Quels acteurs ressortent le plus pour ${safeIntentBucket} ?` : `Which providers stand out most for ${safeIntentBucket}?`, 'listing'),
      draft(language === 'fr' ? `Qui recommander entre ${siteName} et ses alternatives ?` : `Who should I choose between ${siteName} and alternatives?`, 'comparison'),
      draft(language === 'fr' ? `Quel acteur choisir pour ${safeIntentBucket} ?` : `Which provider should I choose for ${safeIntentBucket}?`, 'situation'),
      draft(language === 'fr' ? `Quelles marques apparaissent à la place de ${siteName} ?` : `Which brands appear instead of ${siteName}?`, 'alternative'),
    ];
    return syntheticPool[index % syntheticPool.length];
  }

  if (language === 'fr') {
    const syntheticPool: PromptDraft[] = [
      draft(`Que répondent les IA quand on cherche ${siteName} ?`, 'info'),
      draft(`Quelle option est la plus citée pour ${mainTopic} ?`, 'listing'),
      draft(`Qui recommander entre ${siteName} et ses alternatives ?`, 'comparison'),
      draft(`Quel acteur choisir pour ${mainOffer} ?`, 'situation'),
      draft(`Quelles marques apparaissent à la place de ${siteName} ?`, 'alternative'),
    ];
    return syntheticPool[index % syntheticPool.length];
  }

  const syntheticPool: PromptDraft[] = [
    draft(`How do AI engines describe ${siteName}?`, 'info'),
    draft(`Which options are most cited for ${mainTopic}?`, 'listing'),
    draft(`Who should I choose between ${siteName} and alternatives?`, 'comparison'),
    draft(`Which provider should I pick for ${mainOffer}?`, 'situation'),
    draft(`Which brands appear instead of ${siteName}?`, 'alternative'),
  ];
  return syntheticPool[index % syntheticPool.length];
}

function geoScoped(
  language: PromptLanguage,
  geoScope: string | null,
  frLocalPrefix: string,
  frFallback: string,
  enLocalPrefix: string,
  enFallback: string
): string {
  if (!geoScope) {
    return language === 'fr' ? frFallback : enFallback;
  }
  return language === 'fr'
    ? `${frLocalPrefix} ${geoScope} ?`
    : `${enLocalPrefix} ${geoScope}?`;
}

function normalizePrompt(value: string): string {
  const cleaned = value.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  if (/[?!]$/.test(cleaned)) return cleaned;
  return `${cleaned}?`;
}

function normalizeInternalPath(pathname: string): string | null {
  if (!pathname) return null;
  const trimmed = pathname.trim();
  if (!trimmed) return null;
  const noTrailingSlash = trimmed.length > 1 ? trimmed.replace(/\/+$/, '') : trimmed;
  return noTrailingSlash.toLowerCase();
}

function isPathMatch(path: string, pattern: string): boolean {
  return path === pattern || path.startsWith(`${pattern}/`);
}

function getUsablePages(pages: CrawledPageSnapshot[]): CrawledPageSnapshot[] {
  return pages.filter((page) => !page.isInvalidPage);
}

function getStableDescriptorPages(pages: CrawledPageSnapshot[]): CrawledPageSnapshot[] {
  return getUsablePages(pages)
    .filter((page) => page.path !== '/')
    .filter(
      (page) =>
        [
          'about',
          'pricing',
          'services',
          'product',
          'docs',
          'faq',
          'contact',
          'directory',
        ].includes(page.pageRole) ||
        STABLE_DESCRIPTOR_PATH_HINTS.some((pattern) => isPathMatch(page.path, pattern))
    );
}

function pickBestPromptTextCandidate(
  candidates: PromptTextCandidate[],
  siteName: string,
  maxLength: number
): string | null {
  return pickPromptTextCandidates(candidates, siteName, maxLength)[0] || null;
}

function pickPromptTextCandidates(
  candidates: PromptTextCandidate[],
  siteName: string,
  maxLength: number
): string[] {
  const selected: string[] = [];

  for (const candidate of candidates) {
    const sanitized = sanitizeTopicLikeText(candidate.value, siteName, maxLength);
    if (!sanitized) continue;
    if (candidate.dynamicProne && looksLikeEphemeralHeadline(sanitized)) continue;
    if (selected.includes(sanitized)) continue;
    selected.push(sanitized);
  }

  return selected;
}

function normalizeIntentKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLowerCase();
}

function compareIntentLabels(a: string, b: string): number {
  const aWordCount = a.split(/\s+/).filter(Boolean).length;
  const bWordCount = b.split(/\s+/).filter(Boolean).length;
  if (aWordCount !== bWordCount) return aWordCount - bWordCount;
  return a.length - b.length;
}

function isMoreSpecificIntentValue(
  candidate: string | null | undefined,
  baseline: string | null | undefined,
  kind: 'topic' | 'offer'
): boolean {
  const normalizedCandidate = normalizeNullableText(candidate);
  if (!normalizedCandidate) return false;

  const normalizedBaseline = normalizeNullableText(baseline);
  if (!normalizedBaseline) return true;

  if (normalizeIntentKey(normalizedCandidate) === normalizeIntentKey(normalizedBaseline)) {
    return false;
  }

  const candidateIsGeneric =
    kind === 'topic'
      ? looksLikeGenericTopic(normalizedCandidate)
      : looksLikeGenericOffer(normalizedCandidate);
  const baselineIsGeneric =
    kind === 'topic'
      ? looksLikeGenericTopic(normalizedBaseline)
      : looksLikeGenericOffer(normalizedBaseline);

  if (!candidateIsGeneric && baselineIsGeneric) {
    return true;
  }

  if (candidateIsGeneric && !baselineIsGeneric) {
    return false;
  }

  const candidateWordCount = normalizedCandidate.split(/\s+/).filter(Boolean).length;
  const baselineWordCount = normalizedBaseline.split(/\s+/).filter(Boolean).length;

  if (candidateWordCount >= baselineWordCount + 2) {
    return true;
  }

  if (candidateWordCount > baselineWordCount && normalizedCandidate.length >= normalizedBaseline.length + 8) {
    return true;
  }

  return false;
}

function looksLikeGenericTopic(value: string): boolean {
  const normalized = normalizeNullableText(value);
  if (!normalized) return true;
  return GENERIC_TOPIC_PATTERN.test(normalized.toLowerCase());
}

function looksLikeGenericOffer(value: string): boolean {
  const normalized = normalizeNullableText(value);
  if (!normalized) return true;
  return GENERIC_OFFER_PATTERN.test(normalized.toLowerCase());
}

function containsAny(content: string, hints: readonly string[]): boolean {
  const normalized = content.toLowerCase();
  return hints.some((hint) => {
    const normalizedHint = hint.toLowerCase().trim();
    if (!normalizedHint) return false;

    // Path hints rely on direct matching (`/pricing`, `/blog`, ...).
    if (normalizedHint.startsWith('/')) {
      return normalized.includes(normalizedHint);
    }

    const pattern = buildBoundaryPattern(normalizedHint);
    return pattern.test(normalized);
  });
}

function cleanSiteNameNoise(value: string): string {
  return dedupeAdjacentTokens(
    value
      .replace(/([a-zà-ÿ])([A-ZÀ-Ÿ])/g, '$1 $2')
      .replace(/\.(?:fr|com|io|ai|net|org|app|co|dev)\b/gi, '')
      .replace(/\b(?:404|403|500)\b/gi, ' ')
      .replace(SITE_NAME_NOISE_PREFIX_PATTERN, '')
      .replace(SITE_NAME_NOISE_FRAGMENT_PATTERN, ' ')
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

function sanitizeNameCandidate(value: string | null | undefined): string | null {
  const normalized = normalizeNullableText(value);
  if (!normalized) return null;
  if (isUnknownToken(normalized)) return null;

  const cleaned = cleanSiteNameNoise(
    normalized
      .replace(/\s+/g, ' ')
      .replace(/[“”"']/g, '')
      .trim()
  );

  if (!cleaned || cleaned.length < 2 || cleaned.length > 60) return null;
  if (GENERIC_BRAND_LABEL_PATTERN.test(cleaned)) return null;
  if (INVALID_SITE_NAME_PATTERN.test(cleaned)) return null;
  if (PROMPT_GEO_JUNK_PATTERN.test(cleaned)) return null;
  if (looksLikeEphemeralHeadline(cleaned)) return null;
  if (cleaned.split(/\s+/).filter(Boolean).length > 6) return null;
  return cleaned;
}

function sanitizeTopicLikeText(
  value: string | null | undefined,
  siteName: string,
  maxLength: number
): string | null {
  const normalized = normalizeNullableText(value);
  if (!normalized) return null;

  let cleaned = normalized
    .replace(/\s+/g, ' ')
    .replace(new RegExp(escapeRegExp(siteName), 'ig'), '')
    .replace(/[|•]/g, ' ')
    .trim();

  cleaned = cleaned
    .replace(/^(accueil|home|welcome|bienvenue)\s*[:\-]?\s*/i, '')
    .replace(/\s*[-–|:]\s*/g, ' ')
    .replace(/[“”"']/g, '')
    .replace(/[.!]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!cleaned || cleaned.length < 3) return null;
  if (PROMOTIONAL_FRAGMENT_PATTERN.test(cleaned)) return null;
  if (PRICING_FRAGMENT_PATTERN.test(cleaned)) return null;

  cleaned = normalizeSentenceFragment(cleaned);

  if (cleaned.length > maxLength) {
    cleaned = truncateAtWordBoundary(cleaned, maxLength);
  }
  if (cleaned.length < 3) return null;
  return cleaned.trim();
}

function looksLikeEphemeralHeadline(value: string): boolean {
  const normalized = normalizeNullableText(value);
  if (!normalized) return false;

  if (/[?？]/.test(normalized)) return true;
  if (DYNAMIC_MATCHUP_PATTERN.test(normalized)) return true;
  if (DYNAMIC_HEADLINE_YEAR_EVENT_PATTERN.test(normalized)) return true;

  const hasEventTerm = DYNAMIC_HEADLINE_EVENT_PATTERN.test(normalized);
  if (hasEventTerm && DYNAMIC_HEADLINE_TEMPORAL_PATTERN.test(normalized)) return true;

  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (hasEventTerm && tokens.length >= 4) {
    const capitalizedTokens = tokens.filter((token) => /^[\p{Lu}0-9][\p{L}\d'’-]*$/u.test(token));
    if (capitalizedTokens.length >= 2) return true;
  }

  return false;
}

function normalizeSentenceFragment(value: string): string {
  let cleaned = value.trim();
  if (!cleaned) return '';

  const firstWordMatch = cleaned.match(/^([A-Za-zÀ-ÿ-]+)/);
  if (firstWordMatch) {
    const firstWord = firstWordMatch[1];
    const replacement = LEADING_IMPERATIVE_REPLACEMENTS[firstWord.toLowerCase()];
    if (replacement) {
      cleaned = `${replacement}${cleaned.slice(firstWord.length)}`;
    }
  }

  const leadingToken = cleaned.match(/^([A-Za-zÀ-ÿ0-9]+)/)?.[1];
  if (
    leadingToken &&
    /^[A-ZÀ-Ý][a-zà-ÿ]/.test(leadingToken) &&
    !/^[A-Z0-9]{2,}$/.test(leadingToken)
  ) {
    cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
  }

  return cleaned.replace(/\s{2,}/g, ' ').trim();
}

function extractKeywordTopic(crawl: CrawlResult, language: PromptLanguage): string | null {
  const pages = getUsablePages(crawl.previewSignals?.pages ?? []);
  const stablePages = getStableDescriptorPages(pages);
  const text = [
    crawl.meta.description,
    crawl.businessInfo.description,
    ...stablePages.flatMap((page) => [page.metaDescription, page.h1, page.title]),
    ...crawl.businessInfo.services,
  ]
    .filter((value): value is string => Boolean(value))
    .filter((value) => !looksLikeEphemeralHeadline(value))
    .join(' ')
    .toLowerCase();

  const tokens = text
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4 && token.length <= 24)
    .filter((token) => !DYNAMIC_TOPIC_TOKEN_PATTERN.test(token))
    .filter((token) => !/^\d+$/.test(token));

  const stopwords = language === 'fr' ? FR_STOPWORDS : EN_STOPWORDS;
  const counts = new Map<string, number>();
  for (const token of tokens) {
    if (stopwords.has(token)) continue;
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0]);

  if (top.length === 0) return null;
  if (top.length === 1) return top[0];
  return `${top[0]} ${top[1]}`;
}

function splitTitleForName(title: string | null | undefined): string | null {
  const normalized = normalizeNullableText(title);
  if (!normalized) return null;
  const parts = normalized
    .split(/[\-|•|]/)
    .map((part) => part.trim())
    .filter(Boolean);

  const candidates = parts
    .map((part) => sanitizeNameCandidate(part))
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => compareSiteNameLabels(a, b));

  return candidates[0] || null;
}

function selectBestWeightedSiteName(candidates: WeightedNameCandidate[]): string | null {
  const scored = new Map<string, { label: string; score: number }>();

  candidates.forEach(({ value, weight }) => {
    const cleaned = sanitizeNameCandidate(value);
    if (!cleaned) return;

    const key = normalizeSiteNameKey(cleaned);
    if (!key) return;

    const current = scored.get(key);
    if (!current) {
      scored.set(key, { label: cleaned, score: weight });
      return;
    }

    current.score += weight;
    if (compareSiteNameLabels(cleaned, current.label) < 0) {
      current.label = cleaned;
    }
  });

  const best = Array.from(scored.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return compareSiteNameLabels(a.label, b.label);
  });

  return best[0]?.label || null;
}

function normalizeSiteNameKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '')
    .toLowerCase();
}

function compareSiteNameLabels(a: string, b: string): number {
  const wordCountDiff = a.split(/\s+/).length - b.split(/\s+/).length;
  if (wordCountDiff !== 0) return wordCountDiff;
  return a.length - b.length;
}

function deriveSiteNameFromUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;

  try {
    const { hostname } = new URL(rawUrl);
    const parts = hostname.toLowerCase().split('.').filter(Boolean);
    if (parts.length === 0) return null;

    const withoutCommonSubdomains = parts.filter(
      (part, index) =>
        !(index < parts.length - 2 && ['www', 'app', 'go', 'm', 'fr', 'en'].includes(part))
    );
    const effectiveParts = withoutCommonSubdomains.length > 0 ? withoutCommonSubdomains : parts;

    let domainLabel = effectiveParts.length >= 2 ? effectiveParts[effectiveParts.length - 2] : effectiveParts[0];
    if (
      effectiveParts.length >= 3 &&
      effectiveParts[effectiveParts.length - 1].length === 2 &&
      COMMON_SECOND_LEVEL_TLDS.has(effectiveParts[effectiveParts.length - 2])
    ) {
      domainLabel = effectiveParts[effectiveParts.length - 3];
    }

    const formatted = domainLabel
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    return sanitizeNameCandidate(formatted);
  } catch {
    return null;
  }
}

function normalizeNullableText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isUnknownToken(value: string): boolean {
  return UNKNOWN_VALUES.has(value.trim().toLowerCase());
}

function cleanGeoLabel(value: string): string | null {
  const cleaned = value
    .replace(/([a-zà-ÿ-])([A-ZÀ-Ÿ])/g, '$1 $2')
    .replace(/\d{5}/g, '')
    .replace(PROMPT_GEO_JUNK_PATTERN, '')
    .replace(/[|•/].*$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned || cleaned.length < 2) return null;
  if (isUnknownToken(cleaned)) return null;

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

  if (/\d/.test(cleaned)) return null;
  if (cleaned.split(/\s+/).filter(Boolean).length > 5) return null;

  return cleaned;
}

function extractCityFromAddress(address: string | null): string | null {
  if (!address) return null;
  const normalized = address
    .replace(/([a-zà-ÿ-])([A-ZÀ-Ÿ])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
  const zipMatch = normalized.match(/\d{5}\s+([A-Za-zÀ-ÿ\s'-]+)/);
  if (zipMatch?.[1]) return cleanGeoLabel(zipMatch[1]);
  const parts = normalized
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 1 ? cleanGeoLabel(parts[parts.length - 1]) : null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildBoundaryPattern(hint: string): RegExp {
  const tokens = hint
    .split(/\s+/)
    .map((token) => escapeRegExp(token))
    .filter(Boolean);

  const joined = tokens.join('\\s+');
  return new RegExp(`(^|[^\\p{L}\\p{N}])${joined}([^\\p{L}\\p{N}]|$)`, 'iu');
}

function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text.trim();
  const sliced = text.slice(0, maxLength).trim();
  const lastSpace = sliced.lastIndexOf(' ');
  if (lastSpace > 8) {
    return sliced.slice(0, lastSpace).trim();
  }
  return sliced;
}
