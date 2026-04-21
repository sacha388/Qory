function normalizeCompanyName(name?: string): string {
  const value = (name || '').trim();
  return value.length > 0 ? value : 'Cette entreprise';
}

export type MarketContext = {
  sector?: string | null;
  siteType?: string | null;
  mainOffer?: string | null;
  domainVertical?: string | null;
  geoScope?: string | null;
};

type InsightPromptContext = {
  businessName?: string;
  userPrompt: string;
  kind: 'strengths' | 'value';
  marketContext?: MarketContext;
  targetAudience?: string | null;
  businessDescription?: string | null;
  visibleServices?: string[];
  trustPages?: {
    about?: boolean;
    contact?: boolean;
    faq?: boolean;
    tarifs?: boolean;
  } | null;
  language?: 'fr' | 'en';
};

function getInsightSourcePriorities(marketContext?: MarketContext): string[] {
  const siteType = marketContext?.siteType;
  const domainVertical = marketContext?.domainVertical;

  if (
    (siteType === 'saas' || siteType === 'ai_native') &&
    (domainVertical === 'developer_tools' || domainVertical === 'it_cyber_data')
  ) {
    return [
      'Documentation technique officielle, changelog, pages produit et docs développeur',
      'GitHub public si pertinent, issues et exemples d’intégration visibles',
      'Discussions communautaires: Hacker News, Reddit technique, forums spécialisés',
      'Product Hunt et comparatifs éditoriaux spécialisés pour outils développeurs',
    ];
  }

  if (
    siteType === 'saas' &&
    [
      'hr_payroll',
      'accounting_finance',
      'legal_compliance',
      'sales_crm',
      'marketing_communication',
    ].includes(domainVertical || '')
  ) {
    return [
      'Comparateurs logiciels et avis produits: G2, Capterra',
      'Comparatifs logiciels métiers et contenus éditoriaux sectoriels',
      'Pages officielles pricing, features, comparatifs concurrents',
      'Avis clients B2B et retours d’usage publics crédibles',
    ];
  }

  if (
    (siteType === 'saas' || siteType === 'public_service_nonprofit') &&
    ['legal_compliance', 'accounting_finance', 'healthcare_wellness'].includes(domainVertical || '')
  ) {
    return [
      'Sources institutionnelles et documentation officielle du secteur',
      'Pages conformité, sécurité, certifications, méthodologie',
      'Comparatifs spécialisés métier et presse sectorielle',
      'Communautés métier en appui seulement si elles apportent un vrai signal',
    ];
  }

  if (siteType === 'saas' || siteType === 'ai_native') {
    return [
      'Comparateurs logiciels et avis produits: G2, Capterra, Product Hunt',
      'Discussions communautaires publiques: Reddit, Hacker News, forums spécialisés',
      'Pages officielles pricing, product, docs et comparatifs concurrents',
      'Articles comparatifs et contenus éditoriaux sectoriels',
    ];
  }

  if (siteType === 'local_service' && domainVertical === 'healthcare_wellness') {
    return [
      'Google Business Profile et annuaires santé pertinents',
      'Pages praticien, cabinet, spécialités, prise de rendez-vous et informations pratiques',
      'Avis publics visibles et citations locales crédibles',
      'Presse locale ou mentions institutionnelles si elles existent',
    ];
  }

  if (siteType === 'local_service' && domainVertical === 'construction_home_services') {
    return [
      'Google Business Profile, PagesJaunes et annuaires métier',
      'Avis locaux visibles et citations locales crédibles',
      'Pages services, devis, intervention, zone desservie',
      'Presse locale ou annuaires professionnels sectoriels',
    ];
  }

  if (siteType === 'local_service') {
    return [
      'Annuaires locaux et profils publics: Google Business Profile, PagesJaunes, Yelp si pertinent',
      'Avis publics visibles et annuaires métier',
      'Presse locale ou citations locales crédibles',
      'Site officiel: pages contact, services, tarifs',
    ];
  }

  if (siteType === 'ecommerce') {
    return [
      'Avis et réputation publics: Trustpilot et comparatifs d’achat',
      'Discussions communautaires publiques: Reddit, forums consommateurs',
      'Marketplaces et comparateurs si la marque y apparaît',
      'Site officiel: catalogue, FAQ, livraison, retours',
    ];
  }

  if (siteType === 'marketplace' || siteType === 'travel_booking' || siteType === 'jobs_recruitment') {
    return [
      'Comparatifs et annuaires de plateformes',
      'Avis publics et discussions communautaires d’utilisateurs',
      'Contenus éditoriaux et presse spécialisée',
      'Pages officielles de pricing, fonctionnement, frais, garanties et support',
    ];
  }

  if (
    (siteType === 'education_training' || siteType === 'public_service_nonprofit') &&
    domainVertical === 'education_training'
  ) {
    return [
      'Sources institutionnelles, pages programmes, admissions et certifications',
      'Classements, annuaires ou comparatifs reconnus si pertinents',
      'Presse éducative et mentions tierces crédibles',
      'Discussions communautaires seulement en complément',
    ];
  }

  if (siteType === 'media') {
    return [
      'Mentions presse tierces, citations et reprises éditoriales',
      'Pages auteurs, rubriques, ligne éditoriale et archives',
      'Newsletters, fréquence de publication et signaux d’autorité éditoriale',
      'Discussions communautaires si elles portent sur la réputation éditoriale',
    ];
  }

  if (siteType === 'public_service_nonprofit') {
    return [
      'Sources institutionnelles ou éditoriales crédibles',
      'Mentions presse et relais tiers fiables',
      'Pages officielles de mission, services et informations publiques',
      'Discussions communautaires publiques seulement si elles apportent un signal clair',
    ];
  }

  return [
    'Comparatifs éditoriaux et annuaires du marché',
    'Discussions communautaires publiques',
    'Pages officielles de l’entreprise',
    'Mentions presse ou contenus tiers crédibles',
  ];
}

export function buildBusinessFactsQuery(businessName?: string): string {
  const company = normalizeCompanyName(businessName);
  return `Quelles informations pratiques connais-tu sur ${company} (adresse, téléphone, email, horaires, ville) ?`;
}

export function buildWebGroundedBusinessFactsQuery(businessName?: string): string {
  const company = normalizeCompanyName(businessName);
  return `Recherche sur le web les informations pratiques actuelles concernant ${company} (adresse, téléphone, email, horaires, ville) et attribue uniquement ce qui est vérifiable.`;
}

export function buildStructuredAuditPrompt(
  userPrompt: string,
  businessName?: string,
  marketContext?: MarketContext
): string {
  const company = normalizeCompanyName(businessName);
  const marketContextLines = [
    marketContext?.sector ? `- Secteur: ${marketContext.sector}` : null,
    marketContext?.mainOffer ? `- Offre: ${marketContext.mainOffer}` : null,
    marketContext?.geoScope ? `- Zone: ${marketContext.geoScope}` : null,
  ].filter((line): line is string => Boolean(line));

  return [
    'Tu es un moteur d\'extraction pour audit de visibilité IA.',
    'Réponds comme un assistant IA normal, mais en version très courte et structurée.',
    'Réponds STRICTEMENT en JSON valide, sans markdown, sans texte avant/après.',
    `Question utilisateur: "${userPrompt}"`,
    `Entreprise cible: "${company}"`,
    ...(marketContextLines.length > 0
      ? [
          'Marché cible pour identifier les concurrents:',
          ...marketContextLines,
        ]
      : []),
    'Format JSON attendu:',
    '{',
    '  "mentioned": true|false,',
    '  "competitors": ["nom1", "nom2", "nom3", "nom4", "nom5"],',
    '  "citation": string',
    '}',
    'Contraintes obligatoires:',
    '- Applique la même logique à chaque question: réponds uniquement pour compter honnêtement si l’entreprise cible ressort et quels concurrents nommés ressortent.',
    '- mentioned: true UNIQUEMENT si l’entreprise cible fait réellement partie des acteurs que tu citerais spontanément pour répondre à cette question. false sinon.',
    '- competitors: uniquement des noms précis d’entreprises ou de marques. Pas de catégories génériques, pas d’annuaires, pas de fragments de phrase, pas de doublons, maximum 5.',
    '- Si tu ne connais pas de concurrents nommés précis et identifiables, retourne competitors: [].',
    '- N’utilise jamais de catégories génériques dans competitors (ex: "écoles locales", "plateformes", "annuaires").',
    '- citation: maximum 120 caractères. Résume très brièvement le signal principal qui justifie la réponse.',
    '- Si mentioned=true, citation doit inclure explicitement le nom de l’entreprise cible.',
    '- Si mentioned=false, citation doit citer les principaux concurrents nommés si tu en as.',
    '- Pas de prose libre, pas d\'explication.',
    '- Si information inconnue: [] ou "".',
  ].join('\n');
}

export function buildStructuredFactsPrompt(businessName?: string): string {
  const company = normalizeCompanyName(businessName);

  return [
    'Tu es un moteur d\'extraction de fiche factuelle pour audit de visibilité IA.',
    'Réponds STRICTEMENT en JSON valide, sans markdown, sans texte avant/après.',
    `Entreprise cible: "${company}"`,
    'Format JSON attendu:',
    '{"known":true,"detected":{"address":"12 Rue de la République, 75001 Paris","phone":"+33 1 23 45 67 89","email":"contact@example.fr","openingHours":"Lun-Ven : 9h-18h, Sam : 10h-13h","city":"Paris"}}',
    'Exemple si rien de fiable n’est trouvable:',
    '{"known":false,"detected":{"address":null,"phone":null,"email":null,"openingHours":null,"city":null}}',
    'Contraintes obligatoires:',
    '- known: true seulement si tu attribuerais réellement au moins une information pratique à cette entreprise.',
    '- detected.address / phone / email / openingHours / city: renseigne uniquement les informations que tu attribuerais explicitement à l’entreprise cible. Sinon null.',
    '- N’invente rien. Si une information est inconnue, mets null.',
    '- phone: format lisible, avec indicatif si connu. Exemple: "+33 1 23 45 67 89" ou "01 23 45 67 89".',
    '- openingHours: format compact. Exemple: "Lun-Ven : 9h-18h, Sam : 10h-13h".',
    '- city: uniquement le nom de la ville, pas la région ni le pays.',
    '- Pas de prose libre, pas d\'explication.',
  ].join('\n');
}

export function buildStructuredWebFactsPrompt(businessName?: string): string {
  const company = normalizeCompanyName(businessName);

  return [
    'Tu es un moteur d\'extraction factuelle web-grounded pour audit de visibilité IA.',
    'Utilise la recherche web si elle est disponible.',
    'Réponds STRICTEMENT en JSON valide, sans markdown, sans texte avant/après.',
    `Entreprise cible: "${company}"`,
    'Format JSON attendu:',
    '{"known":true,"detected":{"address":"12 Rue de la République, 75001 Paris","phone":"+33 1 23 45 67 89","email":"contact@example.fr","openingHours":"Lun-Ven : 9h-18h, Sam : 10h-13h","city":"Paris"}}',
    'Exemple si rien de fiable n’est trouvable:',
    '{"known":false,"detected":{"address":null,"phone":null,"email":null,"openingHours":null,"city":null}}',
    'Contraintes obligatoires:',
    '- known: true seulement si au moins une information pratique peut être attribuée à l’entreprise via des sources web fiables.',
    '- detected.address / phone / email / openingHours / city: renseigne uniquement ce qui est attribuable à l’entreprise cible. Sinon null.',
    '- N’invente rien. Si une information est inconnue, mets null.',
    '- phone: format lisible, avec indicatif si connu. Exemple: "+33 1 23 45 67 89" ou "01 23 45 67 89".',
    '- openingHours: format compact. Exemple: "Lun-Ven : 9h-18h, Sam : 10h-13h".',
    '- city: uniquement le nom de la ville, pas la région ni le pays.',
    '- Pas de prose libre, pas d\'explication.',
  ].join('\n');
}

export function buildStructuredInsightPrompt(params: InsightPromptContext): string {
  const company = normalizeCompanyName(params.businessName);
  const language = params.language || 'fr';
  const sourcePriorities = getInsightSourcePriorities(params.marketContext);
  const marketContextLines = [
    params.marketContext?.sector ? `- Secteur: ${params.marketContext.sector}` : null,
    params.marketContext?.siteType ? `- Type de site: ${params.marketContext.siteType}` : null,
    params.marketContext?.mainOffer ? `- Offre principale: ${params.marketContext.mainOffer}` : null,
    params.marketContext?.domainVertical ? `- Verticale: ${params.marketContext.domainVertical}` : null,
    params.marketContext?.geoScope ? `- Zone: ${params.marketContext.geoScope}` : null,
  ].filter((line): line is string => Boolean(line));
  const servicesLine =
    params.visibleServices && params.visibleServices.length > 0
      ? `Services/offres visibles: ${params.visibleServices.slice(0, 6).join(', ')}`
      : null;
  const audienceLine =
    params.targetAudience && params.targetAudience.trim().length > 0
      ? `Audience cible visible: ${params.targetAudience.trim()}`
      : null;
  const trustPageFlags = params.trustPages
    ? [
        `about=${Boolean(params.trustPages.about)}`,
        `contact=${Boolean(params.trustPages.contact)}`,
        `faq=${Boolean(params.trustPages.faq)}`,
        `pricing=${Boolean(params.trustPages.tarifs)}`,
      ].join(', ')
    : null;

  const sharedInstructions = [
    `Question utilisateur: "${params.userPrompt}"`,
    `Entreprise cible: "${company}"`,
    ...(marketContextLines.length > 0 ? ['Contexte marché:', ...marketContextLines] : []),
    params.businessDescription ? `Description du site: ${params.businessDescription}` : null,
    servicesLine,
    audienceLine,
    trustPageFlags ? `Pages de réassurance détectées: ${trustPageFlags}` : null,
    'Priorités de recherche par ordre décroissant:',
    ...sourcePriorities.map((item, index) => `${index + 1}. ${item}`),
    language === 'fr'
      ? 'Utilise la recherche web pour enrichir ta réponse avec des signaux publics récents et plausibles.'
      : 'Use web search to enrich your answer with recent and plausible public signals.',
    language === 'fr'
      ? 'Ne te limite pas au site officiel. Privilégie d’abord les sources listées ci-dessus avant de conclure.'
      : 'Do not rely only on the official site. Cross-check with comparisons, public reviews, community discussions, and editorial mentions when useful.',
    language === 'fr'
      ? 'N’invente rien. Si le signal est faible, retourne des listes vides, unclear, null ou low.'
      : 'Do not invent anything. If the signal is weak, return empty arrays, unclear, null, or low.',
    language === 'fr'
      ? 'Pas de markdown, pas de prose libre hors JSON.'
      : 'No markdown and no free-form prose outside JSON.',
  ].filter((line): line is string => Boolean(line));

  if (params.kind === 'strengths') {
    return [
      'Tu produis une fiche JSON d’insights marché pour un audit IA.',
      ...sharedInstructions,
      'Format JSON attendu:',
      '{',
      '  "sentiment": "positive|neutral|negative",',
      '  "strengths": [{ "category": string, "label": string, "evidence": string, "confidence": "high|medium|low" }],',
      '  "weaknesses": [{ "category": string, "label": string, "evidence": string, "confidence": "high|medium|low" }],',
      '  "generic_alternatives": [{ "label": string }]',
      '}',
      'Contraintes obligatoires:',
      '- strengths: maximum 3 items.',
      '- weaknesses: maximum 3 items.',
      '- generic_alternatives: maximum 4 items.',
      '- categories stables: pricing, quality, reliability, support, ease_of_use, specialization, brand_image, trust, feature_depth, innovation, service_quality.',
      '- evidence: 1 phrase courte, concrète, sans citation longue.',
      '- Si un champ est inconnu: [] ou null selon le cas.',
    ].join('\n');
  }

  return [
    'Tu produis une fiche JSON d’insights marché pour un audit IA.',
    ...sharedInstructions,
    'Format JSON attendu:',
    '{',
    '  "price_positioning": { "label": "budget|accessible|mid_market|premium|high_end|unclear", "evidence": string, "confidence": "high|medium|low" } | null,',
    '  "trust_level": { "level": "low|moderate|high|unclear", "evidence": string, "confidence": "high|medium|low" } | null,',
    '  "sentiment": { "label": "positive|neutral|negative", "summary": string, "confidence": "high|medium|low" } | null,',
    '  "comparison_axes": [{ "category": string, "label": string, "confidence": "high|medium|low" }]',
    '}',
    'Contraintes obligatoires:',
    '- comparison_axes: maximum 4 items.',
    '- Utilise des catégories stables comme pricing, value_for_money, trust, reliability, support, ease_of_use, specialization, feature_depth, brand_image.',
    '- evidence et summary: 1 phrase courte, concrète, maximum 120 caractères si possible.',
    '- Si un champ est inconnu: null ou [].',
  ].join('\n');
}
