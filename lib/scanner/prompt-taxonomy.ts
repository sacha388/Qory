import type { PromptProfileSnapshot } from '@/types';

type PromptLanguage = PromptProfileSnapshot['language'];
type SiteType = PromptProfileSnapshot['siteType'];
type SiteFamily = PromptProfileSnapshot['siteFamily'];
type DomainVertical = PromptProfileSnapshot['domainVertical'];

export interface CanonicalIntentDefinition {
  id: string;
  labels: Partial<Record<PromptLanguage, string>>;
  hints: readonly string[];
  pathHints?: readonly string[];
}

export interface SiteTypeVerticalBranch {
  topicLabel: Partial<Record<PromptLanguage, string>>;
  defaultOffer: Partial<Record<PromptLanguage, string>>;
  offers: readonly CanonicalIntentDefinition[];
}

interface SiteTypeTaxonomy {
  defaultVertical: DomainVertical;
  verticals: Partial<Record<DomainVertical, SiteTypeVerticalBranch>>;
}

function intent(
  id: string,
  fr: string,
  hints: readonly string[],
  options: {
    en?: string;
    pathHints?: readonly string[];
  } = {}
): CanonicalIntentDefinition {
  return {
    id,
    labels: {
      fr,
      ...(options.en ? { en: options.en } : {}),
    },
    hints,
    pathHints: options.pathHints,
  };
}

function branch(
  topicFr: string,
  defaultOfferFr: string,
  offers: readonly CanonicalIntentDefinition[],
  options: {
    topicEn?: string;
    offerEn?: string;
  } = {}
): SiteTypeVerticalBranch {
  return {
    topicLabel: {
      fr: topicFr,
      ...(options.topicEn ? { en: options.topicEn } : {}),
    },
    defaultOffer: {
      fr: defaultOfferFr,
      ...(options.offerEn ? { en: options.offerEn } : {}),
    },
    offers,
  };
}

export const VALID_SITE_TYPES: SiteType[] = [
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

export const VALID_DOMAIN_VERTICALS: DomainVertical[] = [
  'accounting_finance',
  'legal_compliance',
  'hr_payroll',
  'sales_crm',
  'marketing_communication',
  'developer_tools',
  'it_cyber_data',
  'ai_automation',
  'ecommerce_retail',
  'real_estate',
  'healthcare_wellness',
  'education_training',
  'recruitment_jobs',
  'travel_hospitality',
  'food_restaurants',
  'construction_home_services',
  'logistics_mobility',
  'public_sector_associations',
  'general_business',
];

export const SITE_TYPE_TO_FAMILY: Record<SiteType, SiteFamily> = {
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

const O = {
  manageAccounting: intent(
    'manage_accounting',
    "gérer la comptabilité d'une entreprise",
    ['comptabilité', 'accounting', 'bookkeeping', 'tenue comptable'],
    { pathHints: ['/accounting', '/comptabilite'] }
  ),
  manageInvoicing: intent(
    'manage_invoicing',
    'gérer la facturation',
    ['facturation', 'billing', 'invoice', 'invoices'],
    { pathHints: ['/billing', '/invoice', '/invoices'] }
  ),
  trackCashflow: intent(
    'track_cashflow',
    'piloter la trésorerie',
    ['trésorerie', 'cash flow', 'treasury'],
    { pathHints: ['/finance', '/cash-flow'] }
  ),
  manageExpenses: intent(
    'manage_expenses',
    'gérer les dépenses',
    ['dépenses', 'expenses', 'expense management'],
    { pathHints: ['/expenses', '/spend'] }
  ),
  prepareTax: intent(
    'prepare_tax',
    'préparer les obligations fiscales',
    ['fiscalité', 'tax', 'vat', 'tva', 'déclarations'],
    { pathHints: ['/tax', '/vat', '/fiscalite'] }
  ),
  financialReporting: intent(
    'financial_reporting',
    'produire un reporting financier',
    ['reporting', 'financial reporting', 'forecast', 'kpi financier'],
    { pathHints: ['/reporting', '/reports'] }
  ),
  accountingSupport: intent(
    'accounting_support',
    'se faire accompagner en comptabilité',
    ['expert-comptable', 'comptable', 'accounting support', 'cabinet comptable'],
    { pathHints: ['/cabinet', '/expert-comptable'] }
  ),
  outsourceAccounting: intent(
    'outsource_accounting',
    'externaliser la gestion comptable',
    ['externalisation comptable', 'outsourced accounting', 'tenue comptable'],
    { pathHints: ['/outsourcing', '/externalisation'] }
  ),
  legalSupport: intent(
    'legal_support',
    'obtenir un accompagnement juridique',
    ['juridique', 'legal support', 'avocat', 'lawyer'],
    { pathHints: ['/legal', '/juridique'] }
  ),
  manageContracts: intent(
    'manage_contracts',
    'gérer ses contrats',
    ['contrat', 'contracts', 'contract management'],
    { pathHints: ['/contracts', '/contrats'] }
  ),
  complianceManagement: intent(
    'compliance_management',
    'mettre en conformité son activité',
    ['compliance', 'conformité', 'regulatory', 'réglementaire'],
    { pathHints: ['/compliance', '/conformite'] }
  ),
  managePrivacy: intent(
    'manage_privacy',
    'gérer le RGPD et la confidentialité',
    ['rgpd', 'gdpr', 'privacy', 'confidentialité'],
    { pathHints: ['/privacy', '/gdpr', '/rgpd'] }
  ),
  managePayroll: intent(
    'manage_payroll',
    'gérer la paie',
    ['paie', 'payroll', 'bulletin de salaire'],
    { pathHints: ['/payroll', '/paie'] }
  ),
  manageHR: intent(
    'manage_hr',
    'gérer les RH',
    ['rh', 'hr', 'human resources', 'people ops'],
    { pathHints: ['/hr', '/people'] }
  ),
  trackTimeAbsence: intent(
    'track_time_absence',
    'suivre le temps et les absences',
    ['absences', 'congés', 'timesheets', 'leave management'],
    { pathHints: ['/leave', '/timesheets', '/absences'] }
  ),
  manageEmployeeFiles: intent(
    'manage_employee_files',
    'gérer les dossiers salariés',
    ['employee files', 'dossiers salariés', 'employee records'],
    { pathHints: ['/employees', '/team'] }
  ),
  structureHRProcesses: intent(
    'structure_hr_processes',
    'structurer les processus RH',
    ['processus rh', 'hr workflows', 'hr process'],
    { pathHints: ['/workflows', '/process'] }
  ),
  manageCRM: intent(
    'manage_crm',
    'gérer sa relation client',
    ['crm', 'relation client', 'customer relationship'],
    { pathHints: ['/crm', '/customers'] }
  ),
  trackPipeline: intent(
    'track_pipeline',
    'suivre son pipeline commercial',
    ['pipeline', 'sales pipeline', 'deals', 'opportunités'],
    { pathHints: ['/sales', '/pipeline'] }
  ),
  generateOpportunities: intent(
    'generate_opportunities',
    "générer plus d'opportunités",
    ['lead generation', 'opportunités', 'prospects', 'lead'],
    { pathHints: ['/leads', '/prospects'] }
  ),
  trackLeads: intent(
    'track_leads',
    'suivre les leads',
    ['lead', 'leads', 'prospect', 'prospects'],
    { pathHints: ['/leads', '/prospects'] }
  ),
  improveSalesFollowup: intent(
    'improve_sales_followup',
    'améliorer le suivi des ventes',
    ['follow-up', 'closing', 'suivi commercial', 'sales follow-up'],
    { pathHints: ['/sales', '/deals'] }
  ),
  manageCampaigns: intent(
    'manage_campaigns',
    'gérer ses campagnes marketing',
    ['campaign', 'campagne', 'campaigns', 'paid acquisition'],
    { pathHints: ['/campaigns', '/marketing'] }
  ),
  improveAcquisition: intent(
    'improve_acquisition',
    'améliorer son acquisition',
    ['acquisition', 'seo', 'sea', 'growth', 'lead generation'],
    { pathHints: ['/acquisition', '/growth'] }
  ),
  automateCommunication: intent(
    'automate_communication',
    'automatiser sa communication',
    ['automation', 'newsletter', 'email marketing', 'marketing automation'],
    { pathHints: ['/automation', '/newsletter'] }
  ),
  manageNewsletters: intent(
    'manage_newsletters',
    'gérer ses emails et newsletters',
    ['newsletter', 'emailing', 'email marketing'],
    { pathHints: ['/newsletter', '/email'] }
  ),
  manageDigitalPresence: intent(
    'manage_digital_presence',
    'piloter sa présence digitale',
    ['social media', 'brand marketing', 'présence digitale', 'social'],
    { pathHints: ['/social', '/brand'] }
  ),
  integrateApi: intent(
    'integrate_api',
    'intégrer une API',
    ['api', 'sdk', 'integration', 'webhook'],
    { pathHints: ['/api', '/reference', '/sdk'] }
  ),
  deployFaster: intent(
    'deploy_faster',
    'déployer plus efficacement',
    ['deployment', 'ci/cd', 'deploy', 'release'],
    { pathHints: ['/deploy', '/ci', '/cd'] }
  ),
  buildFaster: intent(
    'build_faster',
    'développer plus vite',
    ['developer tools', 'build faster', 'coding', 'programming'],
    { pathHints: ['/developers', '/dev'] }
  ),
  testAndMonitor: intent(
    'test_and_monitor',
    'tester et monitorer une application',
    ['monitoring', 'testing', 'tests', 'observability'],
    { pathHints: ['/monitoring', '/testing'] }
  ),
  consultTechReference: intent(
    'consult_technical_reference',
    'consulter une référence technique',
    ['reference', 'documentation', 'manual', 'spec'],
    { pathHints: ['/reference', '/docs'] }
  ),
  secureIT: intent(
    'secure_it',
    "sécuriser son système d'information",
    ['security', 'cybersecurity', 'sécurité', 'identity'],
    { pathHints: ['/security', '/cybersecurity'] }
  ),
  manageInfrastructure: intent(
    'manage_infrastructure',
    'piloter son infrastructure',
    ['cloud infrastructure', 'infrastructure', 'ops'],
    { pathHints: ['/infrastructure', '/cloud'] }
  ),
  monitorSystems: intent(
    'monitor_systems',
    'surveiller ses systèmes',
    ['monitoring', 'observability', 'alerting', 'uptime'],
    { pathHints: ['/monitoring', '/alerts'] }
  ),
  manageData: intent(
    'manage_data',
    'gérer ses données',
    ['data', 'analytics', 'warehouse', 'pipeline'],
    { pathHints: ['/data', '/analytics'] }
  ),
  analyzeTechPerformance: intent(
    'analyze_tech_performance',
    'analyser ses performances techniques',
    ['performance', 'metrics', 'latency', 'analysis'],
    { pathHints: ['/performance', '/metrics'] }
  ),
  automateWithAI: intent(
    'automate_with_ai',
    "automatiser des tâches avec l'IA",
    ['ai', 'automation', 'automatisation', 'agent'],
    { pathHints: ['/ai', '/automation', '/agents'] }
  ),
  generateWithAI: intent(
    'generate_with_ai',
    'générer du contenu',
    ['generate', 'générer', 'content', 'images', 'text'],
    { pathHints: ['/generate', '/content'] }
  ),
  analyzeWithAI: intent(
    'analyze_with_ai',
    'analyser des informations',
    ['research', 'analysis', 'summarize', 'search'],
    { pathHints: ['/analysis', '/research'] }
  ),
  accelerateWithAI: intent(
    'accelerate_with_ai',
    'accélérer la production',
    ['productivity', 'copilot', 'assistant', 'boost'],
    { pathHints: ['/assistant', '/copilot'] }
  ),
  buildAgents: intent(
    'build_agents',
    'créer des agents ou workflows IA',
    ['agents', 'agentic', 'workflow', 'orchestration'],
    { pathHints: ['/agents', '/workflows'] }
  ),
  manageTrainingPrograms: intent(
    'manage_training_programs',
    'gérer des parcours de formation',
    ['training program', 'learning management', 'lms'],
    { pathHints: ['/academy', '/learning'] }
  ),
  publishTrainingContent: intent(
    'publish_training_content',
    'publier des contenus de formation',
    ['courses', 'learning content', 'academy', 'course builder'],
    { pathHints: ['/courses', '/academy'] }
  ),
  trackSkills: intent(
    'track_skills',
    'suivre la montée en compétences',
    ['skills', 'skill matrix', 'upskilling'],
    { pathHints: ['/skills', '/learning'] }
  ),
  manageHiring: intent(
    'manage_hiring',
    'gérer un processus de recrutement',
    ['recruitment', 'hiring', 'candidate pipeline'],
    { pathHints: ['/recruitment', '/hiring'] }
  ),
  recruitProfiles: intent(
    'recruit_profiles',
    'recruter les bons profils',
    ['talent', 'candidate', 'sourcing', 'profiles'],
    { pathHints: ['/talent', '/candidates'] }
  ),
  publishJobOffer: intent(
    'publish_job_offer',
    "publier une offre d'emploi",
    ['job posting', 'publish', 'career page'],
    { pathHints: ['/jobs', '/careers'] }
  ),
  manageCatalogOrders: intent(
    'manage_catalog_orders',
    'gérer un catalogue et les commandes',
    ['catalog', 'orders', 'commande', 'inventory'],
    { pathHints: ['/catalog', '/orders'] }
  ),
  optimizePayments: intent(
    'optimize_payments',
    'optimiser les commandes et paiements',
    ['payments', 'checkout', 'conversion', 'cart'],
    { pathHints: ['/checkout', '/payments'] }
  ),
  buyOnline: intent(
    'buy_online',
    'acheter en ligne',
    ['buy', 'acheter', 'shop online', 'checkout'],
    { pathHints: ['/shop', '/checkout'] }
  ),
  compareProducts: intent(
    'compare_products',
    'comparer des produits',
    ['compare products', 'comparison', 'catalogue', 'products'],
    { pathHints: ['/products', '/catalog'] }
  ),
  runEcommerceOps: intent(
    'run_ecommerce_ops',
    'gérer une boutique e-commerce',
    ['ecommerce', 'shop', 'store', 'merchant'],
    { pathHints: ['/shop', '/store'] }
  ),
  findProperty: intent(
    'find_property',
    'trouver un bien',
    ['bien immobilier', 'property', 'housing', 'acheter'],
    { pathHints: ['/properties', '/buy'] }
  ),
  findRental: intent(
    'find_rental',
    'trouver une location',
    ['location', 'rent', 'rental'],
    { pathHints: ['/rentals', '/location'] }
  ),
  propertySupport: intent(
    'property_support',
    'se faire accompagner dans un projet immobilier',
    ['agent immobilier', 'transaction', 'project immobilier'],
    { pathHints: ['/agence', '/services'] }
  ),
  estimateProperty: intent(
    'estimate_property',
    'obtenir une estimation de bien',
    ['estimation', 'valuation', 'estimate'],
    { pathHints: ['/estimation', '/estimate'] }
  ),
  findPractitioner: intent(
    'find_practitioner',
    'trouver un praticien',
    ['doctor', 'médecin', 'therapist', 'dentiste', 'praticien'],
    { pathHints: ['/practitioners', '/doctors'] }
  ),
  bookHealthAppointment: intent(
    'book_health_appointment',
    'prendre rendez-vous avec un professionnel de santé',
    ['appointment', 'rendez-vous', 'book', 'consultation'],
    { pathHints: ['/appointment', '/book', '/booking'] }
  ),
  healthSupport: intent(
    'health_support',
    'obtenir un accompagnement santé',
    ['healthcare', 'wellness support', 'care'],
    { pathHints: ['/care', '/support'] }
  ),
  carePath: intent(
    'care_path',
    'suivre un parcours de soin ou bien-être',
    ['care path', 'wellness journey', 'suivi'],
    { pathHints: ['/care', '/program'] }
  ),
  learnOnline: intent(
    'learn_online',
    'se former en ligne',
    ['online course', 'formation en ligne', 'learn online'],
    { pathHints: ['/courses', '/learn'] }
  ),
  learnSkill: intent(
    'learn_skill',
    'apprendre une compétence',
    ['skills', 'compétence', 'learn'],
    { pathHints: ['/skills', '/courses'] }
  ),
  prepareCertification: intent(
    'prepare_certification',
    'préparer une certification',
    ['certification', 'certificate', 'exam'],
    { pathHints: ['/certification', '/exam'] }
  ),
  trainingPath: intent(
    'training_path',
    'suivre un parcours de formation',
    ['curriculum', 'program', 'parcours', 'path'],
    { pathHints: ['/program', '/path'] }
  ),
  developSkills: intent(
    'develop_skills',
    'développer ses compétences professionnelles',
    ['professional development', 'upskill', 'career growth'],
    { pathHints: ['/career', '/skills'] }
  ),
  findJob: intent(
    'find_job',
    'trouver un emploi',
    ['job search', 'emploi', 'jobs', 'careers'],
    { pathHints: ['/jobs', '/careers'] }
  ),
  freelanceMission: intent(
    'freelance_mission',
    'trouver une mission freelance',
    ['freelance', 'mission', 'contract work'],
    { pathHints: ['/freelance', '/missions'] }
  ),
  bookAccommodation: intent(
    'book_accommodation',
    'réserver un hébergement',
    ['hotel', 'room', 'stay', 'accommodation'],
    { pathHints: ['/hotels', '/stays', '/rooms'] }
  ),
  planTrip: intent(
    'plan_trip',
    'organiser un voyage',
    ['trip', 'voyage', 'destination', 'itinerary'],
    { pathHints: ['/destinations', '/trips'] }
  ),
  bookTransport: intent(
    'book_transport',
    'réserver un transport',
    ['flight', 'train', 'transport', 'tickets'],
    { pathHints: ['/flights', '/train', '/transport'] }
  ),
  compareTravelOptions: intent(
    'compare_travel_options',
    'comparer des options de voyage',
    ['compare', 'comparison', 'booking options', 'availability'],
    { pathHints: ['/compare', '/search'] }
  ),
  prepareStay: intent(
    'prepare_stay',
    'préparer un séjour',
    ['séjour', 'stay', 'holiday planning'],
    { pathHints: ['/guides', '/destinations'] }
  ),
  bookRestaurant: intent(
    'book_restaurant',
    'réserver un restaurant',
    ['restaurant booking', 'table', 'reservation'],
    { pathHints: ['/booking', '/reservation'] }
  ),
  orderMeal: intent(
    'order_meal',
    'commander un repas',
    ['delivery', 'commande', 'order food'],
    { pathHints: ['/delivery', '/order'] }
  ),
  findGoodAddress: intent(
    'find_good_address',
    'trouver une bonne adresse',
    ['best restaurant', 'good address', 'avis restaurant'],
    { pathHints: ['/restaurants', '/addresses'] }
  ),
  buyFoodOnline: intent(
    'buy_food_online',
    'acheter des produits alimentaires en ligne',
    ['grocery', 'food', 'online food shop'],
    { pathHints: ['/shop', '/grocery'] }
  ),
  buyFashionBeauty: intent(
    'buy_fashion_beauty',
    'acheter des produits mode et beauté',
    ['fashion', 'mode', 'beauty', 'beaute', 'apparel', 'skincare'],
    { pathHints: ['/fashion', '/beauty', '/collections'] }
  ),
  buyHomeLiving: intent(
    'buy_home_living',
    'équiper sa maison',
    ['home decor', 'maison', 'furniture', 'decoration', 'living'],
    { pathHints: ['/home', '/decor', '/furniture'] }
  ),
  buyTechProducts: intent(
    'buy_tech_products',
    'acheter des produits tech',
    ['electronics', 'tech', 'gadgets', 'devices', 'computers'],
    { pathHints: ['/electronics', '/tech', '/computers'] }
  ),
  buySportsOutdoor: intent(
    'buy_sports_outdoor',
    'trouver des produits sport et outdoor',
    ['sport', 'sports', 'fitness', 'outdoor', 'running', 'cycling'],
    { pathHints: ['/sport', '/sports', '/outdoor'] }
  ),
  manageRestaurantActivity: intent(
    'manage_restaurant_activity',
    'gérer une activité de restauration',
    ['restaurant operations', 'restaurant management'],
    { pathHints: ['/restaurant', '/business'] }
  ),
  scheduleHomeIntervention: intent(
    'schedule_home_intervention',
    'planifier une intervention à domicile',
    ['intervention', 'home service', 'repair', 'visit'],
    { pathHints: ['/services', '/booking'] }
  ),
  requestQuote: intent(
    'request_quote',
    'obtenir un devis',
    ['quote', 'devis', 'estimate', 'pricing'],
    { pathHints: ['/quote', '/devis'] }
  ),
  findReliableTradesperson: intent(
    'find_reliable_tradesperson',
    'trouver un artisan fiable',
    ['artisan', 'contractor', 'tradesperson', 'prestataire'],
    { pathHints: ['/artisans', '/experts'] }
  ),
  manageRenovation: intent(
    'manage_renovation',
    'gérer un chantier ou une rénovation',
    ['renovation', 'construction', 'chantier'],
    { pathHints: ['/renovation', '/construction'] }
  ),
  organizeDeliveries: intent(
    'organize_deliveries',
    'organiser des livraisons',
    ['delivery', 'shipping', 'livraison'],
    { pathHints: ['/delivery', '/shipping'] }
  ),
  manageTransport: intent(
    'manage_transport',
    'gérer des transports',
    ['transport management', 'fleet', 'dispatch'],
    { pathHints: ['/transport', '/fleet'] }
  ),
  optimizeMobility: intent(
    'optimize_mobility',
    'optimiser des déplacements',
    ['mobility', 'route planning', 'travel logistics'],
    { pathHints: ['/mobility', '/routes'] }
  ),
  manageFleet: intent(
    'manage_fleet',
    'piloter une flotte',
    ['fleet', 'vehicles', 'vehicle management'],
    { pathHints: ['/fleet', '/vehicles'] }
  ),
  getReliableInfo: intent(
    'get_reliable_info',
    'obtenir une information fiable',
    ['official information', 'information fiable', 'guidance'],
    { pathHints: ['/information', '/guide'] }
  ),
  completeProcess: intent(
    'complete_process',
    'effectuer une démarche',
    ['démarches', 'procedure', 'forms', 'apply'],
    { pathHints: ['/demarches', '/forms'] }
  ),
  findHelp: intent(
    'find_help',
    'trouver une aide adaptée',
    ['aide', 'support', 'assistance', 'benefits'],
    { pathHints: ['/help', '/aides'] }
  ),
  contactOrg: intent(
    'contact_org',
    'contacter le bon organisme',
    ['contact', 'administration', 'organisme', 'service public'],
    { pathHints: ['/contact', '/services'] }
  ),
  accessService: intent(
    'access_service',
    'accéder à un service utile',
    ['service', 'resource', 'public service', 'association'],
    { pathHints: ['/services', '/resources'] }
  ),
  solveTechProblem: intent(
    'solve_tech_problem',
    'résoudre un problème technique',
    ['issue', 'error', 'problem', 'fix', 'debug'],
    { pathHints: ['/troubleshooting', '/support'] }
  ),
  askQuestion: intent(
    'ask_question',
    'poser une question',
    ['question', 'questions', 'ask', 'forum'],
    { pathHints: ['/questions', '/forum'] }
  ),
  peerFeedback: intent(
    'peer_feedback',
    "trouver des retours d'expérience",
    ['feedback', 'experience', 'retours', 'community stories'],
    { pathHints: ['/community', '/feedback'] }
  ),
  discussPeers: intent(
    'discuss_peers',
    'échanger avec des pairs',
    ['discussion', 'community', 'peer', 'members'],
    { pathHints: ['/community', '/discussion'] }
  ),
  compareOptions: intent(
    'compare_options',
    'comparer les options disponibles',
    ['compare', 'comparison', 'alternatives', 'options']
  ),
  chooseSolution: intent(
    'choose_solution',
    'choisir une solution adaptée',
    ['choose', 'selection', 'right solution', 'best fit']
  ),
  findReliableActor: intent(
    'find_reliable_actor',
    'trouver un acteur fiable',
    ['trusted', 'reliable', 'reviews', 'best provider']
  ),
  identifyAlternatives: intent(
    'identify_alternatives',
    'identifier les meilleures alternatives',
    ['alternatives', 'competitors', 'other options']
  ),
  followNews: intent(
    'follow_news',
    "suivre l'actualité",
    ['actualité', 'news', 'breaking', 'latest'],
    { pathHints: ['/news', '/latest'] }
  ),
  understandTopic: intent(
    'understand_topic',
    'comprendre un sujet',
    ['analysis', 'guide', 'explainer', 'understand'],
    { pathHints: ['/analysis', '/guides'] }
  ),
  reliableSource: intent(
    'reliable_source',
    "trouver une bonne source d'information",
    ['source', 'publication', 'journal', 'newsletter']
  ),
  followTheme: intent(
    'follow_theme',
    'suivre une thématique',
    ['topic', 'section', 'coverage', 'theme']
  ),
  findProfile: intent(
    'find_profile',
    'trouver le bon profil',
    ['portfolio', 'profile', 'selected work', 'projects']
  ),
  evaluateProvider: intent(
    'evaluate_provider',
    'évaluer un prestataire',
    ['references', 'case studies', 'testimonials', 'client work']
  ),
  contactExpert: intent(
    'contact_expert',
    'contacter un expert',
    ['contact', 'book a call', 'hire me', 'consulting']
  ),
};

const GENERIC_BUSINESS_OFFERS = [
  O.compareOptions,
  O.chooseSolution,
  O.findReliableActor,
  O.identifyAlternatives,
] as const;

const SAAS_GENERAL_OFFERS = [
  O.chooseSolution,
  O.compareOptions,
  O.findReliableActor,
  O.identifyAlternatives,
] as const;

const DOCS_TECH_OFFERS = [
  O.integrateApi,
  O.solveTechProblem,
  O.consultTechReference,
  O.buildFaster,
] as const;

const DOCS_GENERAL_OFFERS = [
  O.getReliableInfo,
  O.understandTopic,
  O.solveTechProblem,
  O.consultTechReference,
] as const;

const COMMUNITY_TECH_OFFERS = [
  O.solveTechProblem,
  O.askQuestion,
  O.peerFeedback,
  O.discussPeers,
] as const;

const COMMUNITY_GENERAL_OFFERS = [
  O.askQuestion,
  O.peerFeedback,
  O.discussPeers,
  O.getReliableInfo,
] as const;

const MEDIA_GENERAL_OFFERS = [
  O.followNews,
  O.understandTopic,
  O.reliableSource,
  O.followTheme,
] as const;

const LEARNING_GENERAL_OFFERS = [
  O.learnOnline,
  O.learnSkill,
  O.prepareCertification,
  O.trainingPath,
  O.developSkills,
] as const;

const MARKETPLACE_PRODUCT_OFFERS = [
  O.compareProducts,
  O.compareOptions,
  O.findReliableActor,
  O.identifyAlternatives,
] as const;

const ECOMMERCE_GENERAL_OFFERS = [
  O.buyOnline,
  O.compareProducts,
  O.compareOptions,
  O.findReliableActor,
  O.identifyAlternatives,
] as const;

const SITE_TYPE_TAXONOMY: Record<SiteType, SiteTypeTaxonomy> = {
  saas: {
    defaultVertical: 'general_business',
    verticals: {
      accounting_finance: branch('logiciels de comptabilité et finance', "gérer la comptabilité d'une entreprise", [
        O.manageAccounting,
        O.manageInvoicing,
        O.trackCashflow,
        O.manageExpenses,
        O.prepareTax,
        O.financialReporting,
      ]),
      hr_payroll: branch('logiciels RH et paie', 'gérer les RH et la paie', [
        O.managePayroll,
        O.manageHR,
        O.trackTimeAbsence,
        O.manageEmployeeFiles,
        O.structureHRProcesses,
      ]),
      sales_crm: branch('logiciels CRM et vente', 'gérer sa relation client', [
        O.manageCRM,
        O.trackPipeline,
        O.generateOpportunities,
        O.trackLeads,
        O.improveSalesFollowup,
      ]),
      marketing_communication: branch('logiciels marketing et communication', 'piloter son marketing et sa communication', [
        O.manageCampaigns,
        O.improveAcquisition,
        O.automateCommunication,
        O.manageNewsletters,
        O.manageDigitalPresence,
      ]),
      developer_tools: branch('plateformes et outils pour développeurs', 'développer et intégrer plus efficacement', [
        O.integrateApi,
        O.deployFaster,
        O.buildFaster,
        O.testAndMonitor,
        O.consultTechReference,
      ]),
      it_cyber_data: branch('logiciels IT, data et cybersécurité', "sécuriser son système d'information", [
        O.secureIT,
        O.manageInfrastructure,
        O.monitorSystems,
        O.manageData,
        O.analyzeTechPerformance,
      ]),
      ai_automation: branch("logiciels d'IA et d'automatisation", "automatiser des tâches avec l'IA", [
        O.automateWithAI,
        O.generateWithAI,
        O.analyzeWithAI,
        O.accelerateWithAI,
        O.buildAgents,
      ]),
      education_training: branch('logiciels de formation', 'gérer des parcours de formation', [
        O.manageTrainingPrograms,
        O.publishTrainingContent,
        O.trackSkills,
        O.developSkills,
      ]),
      recruitment_jobs: branch('logiciels de recrutement', 'gérer un processus de recrutement', [
        O.manageHiring,
        O.recruitProfiles,
        O.publishJobOffer,
        O.trackLeads,
      ]),
      ecommerce_retail: branch('logiciels e-commerce et retail', 'gérer une boutique e-commerce', [
        O.runEcommerceOps,
        O.manageCatalogOrders,
        O.optimizePayments,
        O.compareOptions,
      ]),
      logistics_mobility: branch('logiciels de logistique et mobilité', 'gérer des transports et livraisons', [
        O.organizeDeliveries,
        O.manageTransport,
        O.manageFleet,
        O.optimizeMobility,
      ]),
      general_business: branch('logiciels en ligne', 'gérer son activité en ligne', SAAS_GENERAL_OFFERS),
    },
  },
  local_service: {
    defaultVertical: 'construction_home_services',
    verticals: {
      accounting_finance: branch('services comptables et financiers', 'se faire accompagner en comptabilité', [
        O.accountingSupport,
        O.prepareTax,
        O.outsourceAccounting,
        O.financialReporting,
      ]),
      legal_compliance: branch('services juridiques', 'obtenir un accompagnement juridique', [
        O.legalSupport,
        O.manageContracts,
        O.complianceManagement,
        O.managePrivacy,
      ]),
      healthcare_wellness: branch('services de santé et bien-être', 'prendre rendez-vous pour un soin', [
        O.bookHealthAppointment,
        O.findPractitioner,
        O.healthSupport,
        O.carePath,
      ]),
      real_estate: branch('services immobiliers', 'se faire accompagner sur un projet immobilier', [
        O.propertySupport,
        O.findProperty,
        O.findRental,
        O.estimateProperty,
      ]),
      construction_home_services: branch('travaux et services à domicile', 'planifier une intervention à domicile', [
        O.scheduleHomeIntervention,
        O.requestQuote,
        O.findReliableTradesperson,
        O.manageRenovation,
      ]),
      food_restaurants: branch('restaurants et services alimentaires', 'réserver ou commander dans un restaurant', [
        O.bookRestaurant,
        O.orderMeal,
        O.findGoodAddress,
        O.manageRestaurantActivity,
      ]),
      public_sector_associations: branch('services publics et associatifs', 'obtenir une information ou une aide fiable', [
        O.getReliableInfo,
        O.findHelp,
        O.completeProcess,
        O.contactOrg,
      ]),
      general_business: branch('prestataires locaux', 'résoudre un besoin local', GENERIC_BUSINESS_OFFERS),
    },
  },
  ai_native: {
    defaultVertical: 'ai_automation',
    verticals: {
      ai_automation: branch("outils d'intelligence artificielle", "automatiser des tâches avec l'IA", [
        O.automateWithAI,
        O.generateWithAI,
        O.analyzeWithAI,
        O.accelerateWithAI,
        O.buildAgents,
      ]),
      developer_tools: branch('outils IA pour développeurs', 'accélérer le développement', [
        O.buildFaster,
        O.integrateApi,
        O.buildAgents,
        O.solveTechProblem,
      ]),
      marketing_communication: branch('outils IA pour le marketing', 'automatiser sa communication', [
        O.generateWithAI,
        O.manageCampaigns,
        O.automateCommunication,
        O.improveAcquisition,
      ]),
      it_cyber_data: branch("outils IA pour l'IT et la data", 'analyser des informations', [
        O.analyzeWithAI,
        O.manageData,
        O.monitorSystems,
        O.analyzeTechPerformance,
      ]),
      education_training: branch("outils d'apprentissage avec l'IA", 'apprendre plus efficacement', [
        O.learnSkill,
        O.learnOnline,
        O.developSkills,
      ]),
      general_business: branch("outils d'intelligence artificielle", "automatiser ou créer plus vite avec l'IA", [
        O.automateWithAI,
        O.generateWithAI,
        O.analyzeWithAI,
        O.chooseSolution,
      ]),
    },
  },
  documentation_knowledge: {
    defaultVertical: 'developer_tools',
    verticals: {
      developer_tools: branch('documentation développeur', 'intégrer et documenter une API', DOCS_TECH_OFFERS),
      ai_automation: branch("documentation sur l'IA et l'automatisation", "automatiser des tâches avec l'IA", [
        O.automateWithAI,
        O.integrateApi,
        O.analyzeWithAI,
        O.consultTechReference,
      ]),
      it_cyber_data: branch('documentation IT et data', 'déployer et sécuriser une infrastructure', [
        O.secureIT,
        O.manageInfrastructure,
        O.monitorSystems,
        O.manageData,
      ]),
      accounting_finance: branch('documentation comptable et financière', 'comprendre une procédure comptable', [
        O.manageAccounting,
        O.manageInvoicing,
        O.prepareTax,
        O.getReliableInfo,
      ]),
      legal_compliance: branch('documentation juridique et conformité', 'comprendre ses obligations réglementaires', [
        O.complianceManagement,
        O.manageContracts,
        O.managePrivacy,
        O.getReliableInfo,
      ]),
      public_sector_associations: branch('ressources publiques et associatives', 'trouver une information officielle fiable', [
        O.getReliableInfo,
        O.completeProcess,
        O.findHelp,
        O.contactOrg,
      ]),
      education_training: branch('ressources pédagogiques', 'trouver une ressource de formation claire', DOCS_GENERAL_OFFERS),
      general_business: branch('documentation', 'trouver une documentation claire', DOCS_GENERAL_OFFERS),
    },
  },
  community_forum: {
    defaultVertical: 'developer_tools',
    verticals: {
      developer_tools: branch('communautés développeurs', 'résoudre un problème de développement', COMMUNITY_TECH_OFFERS),
      ai_automation: branch("communautés IA et automatisation", "échanger autour des usages de l'IA", [
        O.automateWithAI,
        O.askQuestion,
        O.peerFeedback,
        O.discussPeers,
      ]),
      education_training: branch("communautés d'apprentissage", 'progresser avec des retours entre pairs', COMMUNITY_GENERAL_OFFERS),
      public_sector_associations: branch('communautés associatives et citoyennes', 'obtenir des réponses utiles', COMMUNITY_GENERAL_OFFERS),
      general_business: branch('communautés en ligne', 'poser des questions et échanger', COMMUNITY_GENERAL_OFFERS),
    },
  },
  education_training: {
    defaultVertical: 'education_training',
    verticals: {
      education_training: branch('formations en ligne', 'se former en ligne', LEARNING_GENERAL_OFFERS),
      developer_tools: branch('formations tech et développement', 'apprendre des compétences techniques', LEARNING_GENERAL_OFFERS),
      ai_automation: branch("formations IA et automatisation", "monter en compétence sur l'IA", LEARNING_GENERAL_OFFERS),
      accounting_finance: branch('formations comptabilité et finance', 'se former en comptabilité', LEARNING_GENERAL_OFFERS),
      sales_crm: branch('formations commerce et CRM', 'développer ses compétences commerciales', LEARNING_GENERAL_OFFERS),
      marketing_communication: branch('formations marketing et communication', 'progresser en marketing', LEARNING_GENERAL_OFFERS),
      hr_payroll: branch('formations RH et paie', 'monter en compétence sur les RH', LEARNING_GENERAL_OFFERS),
      legal_compliance: branch('formations juridique et conformité', 'comprendre ses obligations réglementaires', LEARNING_GENERAL_OFFERS),
      healthcare_wellness: branch('formations santé et bien-être', 'développer ses compétences métier', LEARNING_GENERAL_OFFERS),
      construction_home_services: branch('formations métiers terrain et travaux', 'apprendre un savoir-faire métier', LEARNING_GENERAL_OFFERS),
      general_business: branch('formations en ligne', 'développer ses compétences professionnelles', LEARNING_GENERAL_OFFERS),
    },
  },
  marketplace: {
    defaultVertical: 'ecommerce_retail',
    verticals: {
      ecommerce_retail: branch('marketplaces e-commerce', 'comparer des offres en ligne', MARKETPLACE_PRODUCT_OFFERS),
      real_estate: branch('plateformes immobilières', 'trouver un bien ou une location', [
        O.findProperty,
        O.findRental,
        O.compareOptions,
        O.identifyAlternatives,
      ]),
      travel_hospitality: branch('marketplaces de voyage et hébergement', 'comparer des options de voyage et d’hébergement', [
        O.bookAccommodation,
        O.planTrip,
        O.compareTravelOptions,
        O.prepareStay,
      ]),
      recruitment_jobs: branch("plateformes de missions et recrutement", 'trouver une mission ou un profil', [
        O.freelanceMission,
        O.recruitProfiles,
        O.compareOptions,
        O.findReliableActor,
      ]),
      healthcare_wellness: branch('plateformes de santé', 'prendre rendez-vous avec un professionnel de santé', [
        O.bookHealthAppointment,
        O.findPractitioner,
        O.compareOptions,
      ]),
      construction_home_services: branch('plateformes de services à domicile', 'trouver un professionnel pour des travaux', [
        O.findReliableTradesperson,
        O.requestQuote,
        O.scheduleHomeIntervention,
        O.compareOptions,
      ]),
      food_restaurants: branch('plateformes de restauration', 'comparer des options de restauration', [
        O.bookRestaurant,
        O.orderMeal,
        O.findGoodAddress,
        O.compareOptions,
      ]),
      general_business: branch('marketplaces', 'trouver des offres fiables en ligne', MARKETPLACE_PRODUCT_OFFERS),
    },
  },
  ecommerce: {
    defaultVertical: 'ecommerce_retail',
    verticals: {
      ecommerce_retail: branch('boutiques en ligne', 'acheter en ligne', [
        O.buyFashionBeauty,
        O.buyHomeLiving,
        O.buyTechProducts,
        O.buySportsOutdoor,
        O.compareOptions,
        O.chooseSolution,
        O.findReliableActor,
        O.identifyAlternatives,
      ]),
      food_restaurants: branch('boutiques alimentaires', 'acheter des produits alimentaires en ligne', [
        O.buyFoodOnline,
        O.findGoodAddress,
        O.compareOptions,
      ]),
      healthcare_wellness: branch('produits santé et bien-être', 'acheter des produits adaptés', ECOMMERCE_GENERAL_OFFERS),
      general_business: branch('boutiques en ligne', 'acheter en ligne', ECOMMERCE_GENERAL_OFFERS),
    },
  },
  travel_booking: {
    defaultVertical: 'travel_hospitality',
    verticals: {
      travel_hospitality: branch('plateformes de voyage et réservation', 'réserver un voyage ou un hébergement', [
        O.bookAccommodation,
        O.planTrip,
        O.bookTransport,
        O.compareTravelOptions,
        O.prepareStay,
      ]),
      logistics_mobility: branch('services de transport et mobilité', 'préparer un déplacement', [
        O.bookTransport,
        O.optimizeMobility,
        O.compareTravelOptions,
      ]),
      general_business: branch('réservation de voyages', 'réserver un voyage', [
        O.bookAccommodation,
        O.planTrip,
        O.bookTransport,
        O.compareTravelOptions,
      ]),
    },
  },
  jobs_recruitment: {
    defaultVertical: 'recruitment_jobs',
    verticals: {
      recruitment_jobs: branch("plateformes d'emploi et recrutement", 'trouver un emploi ou recruter', [
        O.findJob,
        O.recruitProfiles,
        O.publishJobOffer,
        O.manageHiring,
        O.freelanceMission,
      ]),
      hr_payroll: branch('services RH et carrière', 'gérer les RH et les recrutements', [
        O.manageHR,
        O.managePayroll,
        O.manageHiring,
      ]),
      general_business: branch('emploi et recrutement', 'trouver un emploi ou recruter', [
        O.findJob,
        O.recruitProfiles,
        O.publishJobOffer,
        O.manageHiring,
      ]),
    },
  },
  public_service_nonprofit: {
    defaultVertical: 'public_sector_associations',
    verticals: {
      public_sector_associations: branch('services publics et associatifs', 'obtenir une information ou une aide fiable', [
        O.getReliableInfo,
        O.completeProcess,
        O.findHelp,
        O.contactOrg,
        O.accessService,
      ]),
      healthcare_wellness: branch('services publics de santé', 'obtenir un accompagnement santé fiable', [
        O.bookHealthAppointment,
        O.healthSupport,
        O.getReliableInfo,
      ]),
      education_training: branch('services publics de formation', 'trouver un accompagnement de formation', [
        O.learnOnline,
        O.findHelp,
        O.getReliableInfo,
      ]),
      legal_compliance: branch('information juridique officielle', 'comprendre ses droits et obligations', [
        O.legalSupport,
        O.complianceManagement,
        O.getReliableInfo,
        O.completeProcess,
      ]),
      recruitment_jobs: branch("services publics pour l'emploi", 'trouver un accompagnement vers l’emploi', [
        O.findJob,
        O.findHelp,
        O.contactOrg,
      ]),
      general_business: branch('ressources publiques et associatives', 'obtenir une aide fiable', [
        O.getReliableInfo,
        O.findHelp,
        O.completeProcess,
        O.contactOrg,
      ]),
    },
  },
  media: {
    defaultVertical: 'general_business',
    verticals: {
      accounting_finance: branch("actualité business et finance", "suivre l'actualité financière des entreprises", MEDIA_GENERAL_OFFERS),
      marketing_communication: branch('actualité marketing et communication', 'suivre une thématique marketing', MEDIA_GENERAL_OFFERS),
      developer_tools: branch('actualité développeurs et logiciels', "suivre l'actualité tech", MEDIA_GENERAL_OFFERS),
      healthcare_wellness: branch('actualité santé et bien-être', "s'informer sur la santé et le bien-être", MEDIA_GENERAL_OFFERS),
      travel_hospitality: branch('actualité voyage et tourisme', 'préparer un séjour avec de bonnes sources', MEDIA_GENERAL_OFFERS),
      public_sector_associations: branch('information publique et associative', "trouver une source d'information fiable", MEDIA_GENERAL_OFFERS),
      education_training: branch('actualité formation et carrière', 'suivre une thématique formation', MEDIA_GENERAL_OFFERS),
      general_business: branch('médias en ligne', "suivre l'actualité", MEDIA_GENERAL_OFFERS),
    },
  },
  portfolio: {
    defaultVertical: 'general_business',
    verticals: {
      developer_tools: branch('profils développement web et logiciel', 'trouver un développeur freelance', [
        O.findProfile,
        O.evaluateProvider,
        O.contactExpert,
      ]),
      marketing_communication: branch('profils marketing et communication', 'trouver un expert en communication', [
        O.findProfile,
        O.evaluateProvider,
        O.contactExpert,
      ]),
      sales_crm: branch('profils conseil commercial', 'trouver un consultant commercial', [
        O.findProfile,
        O.evaluateProvider,
        O.contactExpert,
      ]),
      education_training: branch('profils coach et formateurs', 'choisir un formateur ou coach', [
        O.findProfile,
        O.evaluateProvider,
        O.contactExpert,
      ]),
      general_business: branch('profils professionnels', 'trouver le bon profil', [
        O.findProfile,
        O.evaluateProvider,
        O.contactExpert,
      ]),
    },
  },
  brand_site: {
    defaultVertical: 'general_business',
    verticals: {
      ecommerce_retail: branch('marques et boutiques en ligne', 'acheter des produits en ligne', ECOMMERCE_GENERAL_OFFERS),
      accounting_finance: branch('services comptables et financiers', 'se faire accompagner en comptabilité', [
        O.accountingSupport,
        O.prepareTax,
        O.outsourceAccounting,
      ]),
      legal_compliance: branch('services juridiques', 'obtenir un accompagnement juridique', [
        O.legalSupport,
        O.manageContracts,
        O.complianceManagement,
      ]),
      hr_payroll: branch('services RH et paie', 'externaliser les RH et la paie', [
        O.manageHR,
        O.managePayroll,
        O.manageHiring,
      ]),
      sales_crm: branch('services commerciaux et relation client', 'développer sa relation client', [
        O.manageCRM,
        O.trackPipeline,
        O.improveSalesFollowup,
      ]),
      marketing_communication: branch('services marketing et communication', 'développer sa communication et son acquisition', [
        O.manageCampaigns,
        O.improveAcquisition,
        O.automateCommunication,
      ]),
      real_estate: branch('services immobiliers', 'se faire accompagner sur un projet immobilier', [
        O.propertySupport,
        O.findProperty,
        O.findRental,
      ]),
      healthcare_wellness: branch('services de santé et bien-être', 'bénéficier d’un accompagnement santé', [
        O.bookHealthAppointment,
        O.findPractitioner,
        O.healthSupport,
      ]),
      education_training: branch('offres de formation', 'développer ses compétences', LEARNING_GENERAL_OFFERS),
      recruitment_jobs: branch('services de recrutement', 'trouver les bons profils à recruter', [
        O.recruitProfiles,
        O.manageHiring,
        O.publishJobOffer,
      ]),
      travel_hospitality: branch('offres de voyage et hébergement', 'organiser un séjour', [
        O.bookAccommodation,
        O.planTrip,
        O.prepareStay,
      ]),
      food_restaurants: branch('restauration et alimentation', 'réserver ou commander', [
        O.bookRestaurant,
        O.orderMeal,
        O.findGoodAddress,
      ]),
      construction_home_services: branch('services pour la maison', 'réaliser un projet de travaux', [
        O.requestQuote,
        O.findReliableTradesperson,
        O.manageRenovation,
      ]),
      logistics_mobility: branch('services de logistique et mobilité', 'organiser des transports et livraisons', [
        O.organizeDeliveries,
        O.manageTransport,
        O.optimizeMobility,
      ]),
      public_sector_associations: branch('services publics et associatifs', 'accéder à un service utile', [
        O.getReliableInfo,
        O.findHelp,
        O.accessService,
      ]),
      general_business: branch('références du secteur', 'choisir une marque fiable', GENERIC_BUSINESS_OFFERS),
    },
  },
  streaming_entertainment: {
    defaultVertical: 'general_business',
    verticals: {
      general_business: branch('streaming', 'regarder du contenu en streaming', [
        O.chooseSolution,
        O.compareOptions,
        O.identifyAlternatives,
      ]),
    },
  },
  generic: {
    defaultVertical: 'general_business',
    verticals: {
      general_business: branch('sites de cette catégorie', 'faire le bon choix parmi les options', GENERIC_BUSINESS_OFFERS),
    },
  },
};

export function getSiteTypeDefaultVertical(siteType: SiteType): DomainVertical {
  return SITE_TYPE_TAXONOMY[siteType].defaultVertical;
}

export function getAllowedVerticalsForSiteType(siteType: SiteType): DomainVertical[] {
  return Object.keys(SITE_TYPE_TAXONOMY[siteType].verticals) as DomainVertical[];
}

export function isDomainVerticalAllowedForSiteType(
  siteType: SiteType,
  domainVertical: DomainVertical
): boolean {
  return Boolean(SITE_TYPE_TAXONOMY[siteType].verticals[domainVertical]);
}

export function getSiteTypeVerticalBranch(
  siteType: SiteType,
  domainVertical: DomainVertical
): SiteTypeVerticalBranch | null {
  return SITE_TYPE_TAXONOMY[siteType].verticals[domainVertical] || null;
}

export function getSiteTypeVerticalTopicLabel(
  siteType: SiteType,
  domainVertical: DomainVertical,
  language: PromptLanguage
): string | null {
  const branch = getSiteTypeVerticalBranch(siteType, domainVertical);
  if (!branch) return null;
  return branch.topicLabel[language] || branch.topicLabel.fr || branch.topicLabel.en || null;
}

export function getSiteTypeVerticalDefaultOfferLabel(
  siteType: SiteType,
  domainVertical: DomainVertical,
  language: PromptLanguage
): string | null {
  const branch = getSiteTypeVerticalBranch(siteType, domainVertical);
  if (!branch) return null;
  return branch.defaultOffer[language] || branch.defaultOffer.fr || branch.defaultOffer.en || null;
}

export function getSiteTypeVerticalOffers(
  siteType: SiteType,
  domainVertical: DomainVertical
): readonly CanonicalIntentDefinition[] {
  return getSiteTypeVerticalBranch(siteType, domainVertical)?.offers || [];
}

function normalizeTaxonomyText(value: string | null | undefined): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getCanonicalIntentLabel(
  definition: CanonicalIntentDefinition,
  language: PromptLanguage
): string {
  return definition.labels[language] || definition.labels.fr || definition.labels.en || '';
}

function scoreOfferMatch(
  rawValue: string,
  definition: CanonicalIntentDefinition,
  language: PromptLanguage
): number {
  const normalizedRaw = normalizeTaxonomyText(rawValue);
  if (!normalizedRaw) return 0;

  let score = 0;
  const labels = [
    definition.labels[language],
    definition.labels.fr,
    definition.labels.en,
  ].filter((value): value is string => Boolean(value));

  for (const label of labels) {
    const normalizedLabel = normalizeTaxonomyText(label);
    if (!normalizedLabel) continue;
    if (normalizedRaw === normalizedLabel) score += 120;
    if (normalizedRaw.includes(normalizedLabel) || normalizedLabel.includes(normalizedRaw)) {
      score += 48;
    }

    const labelTokens = normalizedLabel.split(/\s+/).filter(Boolean);
    if (labelTokens.length >= 2 && labelTokens.every((token) => normalizedRaw.includes(token))) {
      score += 28;
    }
  }

  for (const hint of definition.hints) {
    const normalizedHint = normalizeTaxonomyText(hint);
    if (!normalizedHint) continue;
    if (!normalizedRaw.includes(normalizedHint)) continue;
    score += normalizedHint.includes(' ') ? 12 : 8;
  }

  return score;
}

export function localizeTopicLabelFromTaxonomy(
  siteType: SiteType,
  domainVertical: DomainVertical,
  language: PromptLanguage,
  rawValue: string | null | undefined
): string | null {
  if (!rawValue) return null;
  return getSiteTypeVerticalTopicLabel(siteType, domainVertical, language) || rawValue;
}

export function localizeOfferLabelFromTaxonomy(
  siteType: SiteType,
  domainVertical: DomainVertical,
  language: PromptLanguage,
  rawValue: string | null | undefined
): string | null {
  if (!rawValue) return null;

  const branch = getSiteTypeVerticalBranch(siteType, domainVertical);
  if (!branch) return rawValue;

  let bestDefinition: CanonicalIntentDefinition | null = null;
  let bestScore = 0;

  for (const definition of branch.offers) {
    const score = scoreOfferMatch(rawValue, definition, language);
    if (score > bestScore) {
      bestScore = score;
      bestDefinition = definition;
    }
  }

  if (bestDefinition && bestScore >= 24) {
    return getCanonicalIntentLabel(bestDefinition, language);
  }

  return (
    getSiteTypeVerticalDefaultOfferLabel(siteType, domainVertical, language) ||
    rawValue
  );
}
