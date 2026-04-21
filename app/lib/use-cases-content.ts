export type UseCaseSectorPreview = {
  slug: string;
  title: string;
  summary: string;
  searchFocus: string;
  status: 'ready' | 'planned';
  path?: string;
};

export type UseCaseFamily = {
  slug: string;
  label: string;
  description: string;
  hubTitle: string;
  hubDescription: string;
  sectors: UseCaseSectorPreview[];
};

export type UseCaseSectorFaqItem = {
  question: string;
  answer: string;
};

export type UseCaseSectorLink = {
  label: string;
  href: string;
};

export type UseCaseSectorPage = {
  slug: string;
  familySlug: string;
  path: string;
  seoTitle: string;
  seoDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroTitleLines?: [string, string?];
  heroSubtitle: string;
  heroSubtitleLines?: [string, string?];
  ctaLabel: string;
  querySectionTitle: string;
  querySectionDescription: string;
  checksSectionTitle: string;
  aiBadges: string[];
  proofBullets: string[];
  pains: Array<{ title: string; description: string }>;
  queryExamples: string[];
  qoryChecks: string[];
  reportHighlights: string[];
  faqs: UseCaseSectorFaqItem[];
  relatedLinks: UseCaseSectorLink[];
};

export const useCaseFamilies: UseCaseFamily[] = [
  {
    slug: 'commerces-restauration',
    label: 'Commerce & restauration',
    description: 'Restaurants, cafés, commerces alimentaires, boutiques locales, hôtels et lieux de loisirs.',
    hubTitle: 'Cas d’usage Qory pour les commerces et établissements de restauration',
    hubDescription:
      'Qory aide les établissements locaux à comprendre s’ils ressortent vraiment dans les réponses IA quand un utilisateur cherche où manger, quoi acheter ou où réserver.',
    sectors: [
      {
        slug: 'restaurants',
        title: 'Restaurants',
        summary: 'Mesurer si votre établissement ressort dans les recommandations, comparatifs et réponses locales des assistants IA.',
        searchFocus: 'Intentions type: restaurant italien, brunch, terrasse, dîner en famille, où manger ce soir.',
        status: 'ready',
        path: '/pour-restaurants',
      },
      {
        slug: 'bars-cafes',
        title: 'Bars & cafés',
        summary: 'Comprendre si votre lieu apparaît quand les IA suggèrent un café, un bar à vin, un spot brunch ou un lieu convivial.',
        searchFocus: 'Intentions type: coffee shop, bar à cocktails, café coworking, meilleur brunch.',
        status: 'ready',
        path: '/pour-bars-cafes',
      },
      {
        slug: 'boulangeries-traiteurs-alimentaire',
        title: 'Boulangeries, traiteurs & commerces alimentaires',
        summary: 'Voir si votre offre est citée quand les IA recommandent une boulangerie, un traiteur ou une épicerie spécialisée.',
        searchFocus: 'Intentions type: meilleure boulangerie, traiteur mariage, épicerie fine, produits bio.',
        status: 'ready',
        path: '/pour-boulangeries-traiteurs-commerces-alimentaires',
      },
      {
        slug: 'boutiques-mode-accessoires',
        title: 'Boutiques mode & accessoires',
        summary: 'Évaluer votre visibilité quand les IA conseillent une boutique locale de prêt-à-porter, chaussures ou accessoires.',
        searchFocus: 'Intentions type: boutique femme, concept store mode, accessoires premium, idées shopping.',
        status: 'ready',
        path: '/pour-boutiques-mode-accessoires',
      },
      {
        slug: 'boutiques-maison-deco-fleuristes',
        title: 'Boutiques maison, déco & fleuristes',
        summary: 'Mesurer votre présence dans les recommandations liées à la décoration, aux cadeaux et aux achats locaux de dernière minute.',
        searchFocus: 'Intentions type: fleuriste, boutique déco, cadeau local, concept store maison.',
        status: 'ready',
        path: '/pour-boutiques-maison-deco-fleuristes',
      },
      {
        slug: 'hotels-loisirs-locaux',
        title: 'Hôtels & loisirs locaux',
        summary: 'Vérifier si votre établissement ressort quand les IA proposent un hébergement, une activité ou une sortie dans votre zone.',
        searchFocus: 'Intentions type: hôtel indépendant, activité en famille, sortie week-end, lieu à visiter.',
        status: 'ready',
        path: '/pour-hotels-loisirs-locaux',
      },
    ],
  },
  {
    slug: 'prestataires-locaux',
    label: 'Prestataires locaux',
    description: 'Artisans, immobilier, santé, bien-être, coaching, cabinets et services de proximité.',
    hubTitle: 'Cas d’usage Qory pour les prestataires locaux',
    hubDescription:
      'Qory aide les professionnels de proximité à comprendre comment les IA lisent leur offre, leur spécialité et leur position locale face aux concurrents déjà cités.',
    sectors: [
      {
        slug: 'artisans-travaux-depannage',
        title: 'Artisans, travaux & dépannage',
        summary: 'Savoir si votre activité ressort quand les IA recommandent un artisan fiable, un dépanneur ou un spécialiste rénovation.',
        searchFocus: 'Intentions type: plombier urgent, électricien, artisan RGE, rénovation cuisine.',
        status: 'ready',
        path: '/pour-artisans-travaux-depannage',
      },
      {
        slug: 'immobilier',
        title: 'Immobilier',
        summary: 'Mesurer votre présence quand un utilisateur demande une agence, un mandataire ou un expert local pour vendre, acheter ou louer.',
        searchFocus: 'Intentions type: agent immobilier, estimation maison, gestion locative, achat appartement.',
        status: 'ready',
        path: '/pour-immobilier',
      },
      {
        slug: 'sante-soins',
        title: 'Santé & soins',
        summary: 'Comprendre si votre cabinet ou établissement est cité dans les réponses IA liées aux soins, à la spécialité ou à la prise de rendez-vous.',
        searchFocus: 'Intentions type: dentiste, kiné, orthophoniste, cabinet de santé local.',
        status: 'ready',
        path: '/pour-sante-soins',
      },
      {
        slug: 'bien-etre-esthetique',
        title: 'Bien-être & esthétique',
        summary: 'Évaluer si votre institut, salon ou pratique bien-être ressort quand les IA recommandent un professionnel autour de chez l’utilisateur.',
        searchFocus: 'Intentions type: institut, épilation laser, massage, esthétique premium.',
        status: 'ready',
        path: '/pour-bien-etre-esthetique',
      },
      {
        slug: 'sport-coaching',
        title: 'Sport & coaching',
        summary: 'Voir si votre salle, votre studio ou votre coaching apparaît sur les requêtes de remise en forme, préparation physique et objectifs personnels.',
        searchFocus: 'Intentions type: coach sportif, salle de sport, pilates, perte de poids.',
        status: 'ready',
        path: '/pour-sport-coaching',
      },
      {
        slug: 'avocats-experts-comptables',
        title: 'Avocats & experts-comptables',
        summary: 'Mesurer votre visibilité sur des requêtes de confiance où les IA sélectionnent peu d’acteurs perçus comme sérieux et spécialisés.',
        searchFocus: 'Intentions type: avocat droit du travail, expert-comptable LMNP, cabinet juridique PME.',
        status: 'ready',
        path: '/pour-avocats-experts-comptables',
      },
      {
        slug: 'services-locaux-specialises',
        title: 'Services locaux spécialisés',
        summary: 'Regrouper les services à domicile, l’auto-mobilité et les métiers événementiels qui jouent leur acquisition sur la recommandation locale.',
        searchFocus: 'Intentions type: aide à domicile, garage local, photographe mariage, service spécialisé.',
        status: 'ready',
        path: '/pour-services-locaux-specialises',
      },
    ],
  },
  {
    slug: 'agences-studios',
    label: 'Agences & studios',
    description: 'Agences marketing, SEO, social, web, design, production et conseil B2B.',
    hubTitle: 'Cas d’usage Qory pour les agences et studios',
    hubDescription:
      'Qory permet aux agences, studios et cabinets de mesurer leur visibilité sur les requêtes de comparaison, de recommandation et de spécialité qui comptent pour signer de nouveaux clients.',
    sectors: [
      {
        slug: 'agences-marketing-seo',
        title: 'Agences marketing & SEO',
        summary: 'Mesurer votre visibilité quand les IA recommandent une agence acquisition, SEO, SEA ou growth sur votre marché.',
        searchFocus: 'Intentions type: meilleure agence SEO, agence acquisition B2B, consultant growth.',
        status: 'ready',
        path: '/pour-agences-marketing-seo',
      },
      {
        slug: 'agences-social-media-contenu',
        title: 'Agences social media & contenu',
        summary: 'Voir si votre structure ressort sur les requêtes liées au contenu, aux réseaux sociaux et à la stratégie éditoriale.',
        searchFocus: 'Intentions type: agence social media, agence contenu, community management.',
        status: 'ready',
        path: '/pour-agences-social-media-contenu',
      },
      {
        slug: 'agences-web-no-code-developpement',
        title: 'Agences web, no-code & développement',
        summary: 'Comprendre si vous êtes recommandé quand les IA proposent un partenaire pour créer un site, une app ou un produit digital.',
        searchFocus: 'Intentions type: agence webflow, agence no-code, agence développement SaaS.',
        status: 'ready',
        path: '/pour-agences-web-no-code-developpement',
      },
      {
        slug: 'studios-design-photo-video',
        title: 'Studios design, photo & vidéo',
        summary: 'Évaluer votre présence sur les requêtes de branding, identité, production visuelle et contenus créatifs.',
        searchFocus: 'Intentions type: studio branding, production vidéo, photographe corporate.',
        status: 'ready',
        path: '/pour-studios-design-photo-video',
      },
      {
        slug: 'conseil-rh-freelances-data-ia',
        title: 'Conseil, RH, freelances, data & IA',
        summary: 'Regrouper les offres B2B spécialisées qui doivent être visibles sur des requêtes d’expertise et de transformation.',
        searchFocus: 'Intentions type: cabinet conseil B2B, agence IA, cabinet RH, freelance expert.',
        status: 'ready',
        path: '/pour-conseil-rh-freelances-data-ia',
      },
    ],
  },
  {
    slug: 'saas-applications',
    label: 'SaaS & applications',
    description: 'CRM, support, marketing, finance, RH, productivité, data, cyber et logiciels métier.',
    hubTitle: 'Cas d’usage Qory pour les SaaS et applications',
    hubDescription:
      'Qory aide les éditeurs de logiciels à comprendre sur quelles requêtes les IA citent déjà leur produit, où les concurrents prennent la place et quelles pages doivent être clarifiées.',
    sectors: [
      {
        slug: 'logiciels-crm-vente-support',
        title: 'CRM, vente & support',
        summary: 'Mesurer si votre solution ressort quand les IA recommandent un CRM, un helpdesk ou un outil de service client.',
        searchFocus: 'Intentions type: meilleur CRM PME, helpdesk simple, outil support client.',
        status: 'ready',
        path: '/pour-crm-vente-support',
      },
      {
        slug: 'logiciels-marketing-automation',
        title: 'Marketing automation',
        summary: 'Comprendre votre visibilité sur les requêtes liées à l’automatisation marketing, au nurturing et à l’exécution des campagnes.',
        searchFocus: 'Intentions type: marketing automation, lead nurturing, scénarios email.',
        status: 'ready',
        path: '/pour-marketing-automation',
      },
      {
        slug: 'logiciels-finance-rh-conformite',
        title: 'Finance, RH & conformité',
        summary: 'Voir si votre logiciel est cité sur des requêtes à forte confiance liées à la paie, la comptabilité ou la conformité.',
        searchFocus: 'Intentions type: logiciel compta, SIRH, paie, conformité.',
        status: 'ready',
        path: '/pour-finance-rh-conformite',
      },
      {
        slug: 'logiciels-gestion-projet-collaboration',
        title: 'Gestion de projet & collaboration',
        summary: 'Évaluer votre présence sur les requêtes d’organisation, de productivité et de coordination d’équipe.',
        searchFocus: 'Intentions type: outil gestion projet, collaboration équipe, to-do partagée.',
        status: 'ready',
        path: '/pour-gestion-projet-collaboration',
      },
      {
        slug: 'logiciels-data-analytics-cybersecurite',
        title: 'Data, analytics & cybersécurité',
        summary: 'Mesurer si votre offre ressort sur les requêtes expertes liées à la donnée, la BI, l’observabilité ou la sécurité.',
        searchFocus: 'Intentions type: BI, analytics, monitoring, cyber protection.',
        status: 'ready',
        path: '/pour-data-analytics-cybersecurite',
      },
      {
        slug: 'logiciels-metiers-ecommerce-booking-formation',
        title: 'Logiciels métier, e-commerce, booking & formation',
        summary: 'Regrouper les solutions verticales où la clarté du cas d’usage décide souvent de la citation dans les réponses IA.',
        searchFocus: 'Intentions type: logiciel métier, LMS, réservation, outil e-commerce.',
        status: 'ready',
        path: '/pour-logiciels-metiers-ecommerce-booking-formation',
      },
    ],
  },
  {
    slug: 'produits-ia',
    label: 'IA & assistants',
    description: 'Assistants IA, copilotes, agents, outils créatifs, data, code, traduction et infrastructure IA.',
    hubTitle: 'Cas d’usage Qory pour les produits IA et assistants spécialisés',
    hubDescription:
      'Qory permet aux produits IA de mesurer leur part de voix face aux autres outils déjà cités par les LLMs sur les requêtes de recommandation, de comparaison et de spécialité.',
    sectors: [
      {
        slug: 'assistants-ia-generalistes-copilotes',
        title: 'Assistants IA généralistes & copilotes',
        summary: 'Mesurer votre présence quand les IA recommandent un assistant, un copilote métier ou un produit conversationnel.',
        searchFocus: 'Intentions type: assistant IA, copilote métier, alternative ChatGPT.',
        status: 'ready',
        path: '/pour-assistants-ia-generalistes-copilotes',
      },
      {
        slug: 'assistants-contenu-marketing',
        title: 'Assistants contenu & marketing',
        summary: 'Comprendre votre visibilité sur les requêtes liées à la rédaction, au contenu et à l’exécution marketing.',
        searchFocus: 'Intentions type: outil IA rédaction, assistant marketing, génération contenu.',
        status: 'ready',
        path: '/pour-assistants-contenu-marketing',
      },
      {
        slug: 'assistants-recherche-data-analyse',
        title: 'Assistants recherche, data & analyse',
        summary: 'Évaluer votre présence sur les requêtes orientées synthèse, recherche, analyse documentaire ou data.',
        searchFocus: 'Intentions type: assistant recherche, IA analyse document, IA data.',
        status: 'ready',
        path: '/pour-assistants-recherche-data-analyse',
      },
      {
        slug: 'assistants-support-commercial',
        title: 'Assistants support & commercial',
        summary: 'Mesurer si votre produit ressort sur les besoins de support client, prospection, prévente et service.',
        searchFocus: 'Intentions type: IA support client, assistant prospection, agent commercial IA.',
        status: 'ready',
        path: '/pour-assistants-support-commercial',
      },
      {
        slug: 'assistants-code-design-traduction',
        title: 'Assistants code, design & traduction',
        summary: 'Voir si votre outil apparaît quand les IA recommandent un assistant de développement, de création ou de localisation.',
        searchFocus: 'Intentions type: assistant code, IA design, IA traduction.',
        status: 'ready',
        path: '/pour-assistants-code-design-traduction',
      },
      {
        slug: 'agents-automatisation-infrastructure-formation',
        title: 'Agents, automatisation, infrastructure & formation',
        summary: 'Regrouper les offres IA orientées workflows, orchestration, modèles, API et partage de connaissance.',
        searchFocus: 'Intentions type: agent IA, orchestration workflow, plateforme modèles, IA formation.',
        status: 'ready',
        path: '/pour-agents-automatisation-infrastructure-formation',
      },
    ],
  },
  {
    slug: 'plateformes-annuaires',
    label: 'Plateformes & annuaires',
    description: 'Annuaires, marketplaces, comparateurs, plateformes de réservation, forums et avis.',
    hubTitle: 'Cas d’usage Qory pour les plateformes, annuaires et comparateurs',
    hubDescription:
      'Qory aide les plateformes à comprendre si elles ressortent quand les IA cherchent à recommander un annuaire, un comparateur ou une place de marché plutôt qu’un acteur direct.',
    sectors: [
      {
        slug: 'annuaires-locaux-b2b',
        title: 'Annuaires locaux & B2B',
        summary: 'Mesurer votre capacité à être cité comme source de découverte ou d’identification d’acteurs fiables.',
        searchFocus: 'Intentions type: annuaire local, annuaire pro, répertoire prestataires.',
        status: 'ready',
        path: '/pour-annuaires-locaux-b2b',
      },
      {
        slug: 'marketplaces-services-produits',
        title: 'Marketplaces services & produits',
        summary: 'Évaluer si votre marketplace ressort sur les requêtes de comparaison et d’exploration d’offres.',
        searchFocus: 'Intentions type: marketplace services, marketplace produits, plateforme offres.',
        status: 'ready',
        path: '/pour-marketplaces-services-produits',
      },
      {
        slug: 'plateformes-mise-en-relation-recrutement-reservation',
        title: 'Mise en relation, recrutement & réservation',
        summary: 'Voir si votre plateforme prend la place sur les intentions où l’utilisateur cherche un intermédiaire fiable.',
        searchFocus: 'Intentions type: mise en relation, plateforme emploi, réservation en ligne.',
        status: 'ready',
        path: '/pour-mise-en-relation-recrutement-reservation',
      },
      {
        slug: 'comparateurs-forums-avis-agregateurs',
        title: 'Comparateurs, forums, avis & agrégateurs',
        summary: 'Comprendre votre présence sur les requêtes où les IA arbitrent entre contenu communautaire, comparatif et preuve sociale.',
        searchFocus: 'Intentions type: comparatif, forum, avis, agrégateur d’offres.',
        status: 'ready',
        path: '/pour-comparateurs-forums-avis-agregateurs',
      },
    ],
  },
  {
    slug: 'ecommerce',
    label: 'E-commerce',
    description: 'Boutiques généralistes ou spécialisées: mode, beauté, maison, alimentation, santé, tech, loisirs, luxe et B2B.',
    hubTitle: 'Cas d’usage Qory pour les boutiques e-commerce',
    hubDescription:
      'Qory permet aux sites marchands de comprendre si leurs pages, leurs catégories et leur promesse produit ressortent quand les IA comparent déjà des offres, des produits et des marques.',
    sectors: [
      {
        slug: 'boutiques-generalistes-multicategories',
        title: 'Boutiques généralistes & multi-catégories',
        summary: 'Mesurer votre visibilité sur des requêtes larges où les IA sélectionnent quelques marchands perçus comme fiables.',
        searchFocus: 'Intentions type: boutique en ligne fiable, meilleur site pour acheter, alternatives marchands.',
        status: 'ready',
        path: '/pour-boutiques-generalistes-multicategories',
      },
      {
        slug: 'ecommerce-mode-accessoires',
        title: 'Mode & accessoires',
        summary: 'Évaluer votre présence sur les requêtes d’achat mode, vêtements, chaussures et accessoires.',
        searchFocus: 'Intentions type: marque mode, boutique robe, accessoires premium.',
        status: 'ready',
        path: '/pour-ecommerce-mode-accessoires',
      },
      {
        slug: 'ecommerce-beaute-cosmetique',
        title: 'Beauté & cosmétique',
        summary: 'Comprendre si votre boutique ressort quand les IA suggèrent des produits beauté, soins ou cosmétiques.',
        searchFocus: 'Intentions type: routine beauté, cosmétique bio, boutique skincare.',
        status: 'ready',
        path: '/pour-ecommerce-beaute-cosmetique',
      },
      {
        slug: 'ecommerce-maison-deco-mobilier',
        title: 'Maison, déco & mobilier',
        summary: 'Voir si votre boutique est citée sur les requêtes d’inspiration et d’achat liées à l’univers maison.',
        searchFocus: 'Intentions type: mobilier design, déco artisanale, boutique maison.',
        status: 'ready',
        path: '/pour-ecommerce-maison-deco-mobilier',
      },
      {
        slug: 'ecommerce-alimentation-sante-famille',
        title: 'Alimentation, santé & famille',
        summary: 'Regrouper les e-commerces où la confiance et la clarté de l’offre déterminent la recommandation IA.',
        searchFocus: 'Intentions type: produits bio, compléments, puériculture, boutique famille.',
        status: 'ready',
        path: '/pour-ecommerce-alimentation-sante-famille',
      },
      {
        slug: 'ecommerce-tech-sport-loisirs',
        title: 'Tech',
        summary: 'Mesurer votre visibilité sur les requêtes d’équipement tech, d’accessoires et de choix produit où les IA comparent très vite les options.',
        searchFocus: 'Intentions type: accessoires tech, gadgets, équipement connecté, achat tech.',
        status: 'ready',
        path: '/pour-ecommerce-tech',
      },
      {
        slug: 'ecommerce-sport-loisirs',
        title: 'Sport & loisirs',
        summary: 'Mesurer votre visibilité sur les requêtes d’équipement, de passion et d’achat où les IA recommandent quelques boutiques seulement.',
        searchFocus: 'Intentions type: équipement sport, loisirs outdoor, idées cadeaux loisirs.',
        status: 'ready',
        path: '/pour-ecommerce-sport-loisirs',
      },
      {
        slug: 'ecommerce-luxe-animalerie-b2b-specialise',
        title: 'Luxe, animalerie & équipement pro spécialisé',
        summary: 'Regrouper les boutiques plus niches qui ont besoin d’une promesse plus nette pour être correctement reprises.',
        searchFocus: 'Intentions type: boutique luxe, animalerie en ligne, matériel spécialisé pro.',
        status: 'ready',
        path: '/pour-ecommerce-luxe-animalerie-b2b-specialise',
      },
    ],
  },
  {
    slug: 'etablissements-institutions',
    label: 'Établissements & institutions',
    description: 'Services publics, associations, fondations, écoles, organismes de santé, institutions culturelles et médias.',
    hubTitle: 'Cas d’usage Qory pour les établissements, associations et institutions',
    hubDescription:
      'Qory permet aux structures d’intérêt général, d’information ou de service public de comprendre comment les IA résument leur mission, leur périmètre et leur légitimité.',
    sectors: [
      {
        slug: 'services-publics-associations-fondations',
        title: 'Services publics, associations & fondations',
        summary: 'Mesurer si votre structure ressort quand les IA recommandent un organisme utile, un service ou un acteur d’intérêt général.',
        searchFocus: 'Intentions type: association locale, organisme public, fondation, aide administrative.',
        status: 'ready',
        path: '/pour-services-publics-associations-fondations',
      },
      {
        slug: 'ecoles-organismes-formation',
        title: 'Écoles & organismes de formation',
        summary: 'Comprendre votre présence sur les requêtes pédagogiques, professionnelles ou de reconversion où les IA proposent des organismes.',
        searchFocus: 'Intentions type: organisme formation, école spécialisée, formation certifiante.',
        status: 'ready',
        path: '/pour-ecoles-organismes-formation',
      },
      {
        slug: 'organismes-sante',
        title: 'Organismes de santé',
        summary: 'Voir si votre établissement ou structure est cité correctement sur les questions de santé, d’accès et d’accompagnement.',
        searchFocus: 'Intentions type: organisme santé, centre spécialisé, accompagnement santé.',
        status: 'ready',
        path: '/pour-organismes-sante',
      },
      {
        slug: 'institutions-culturelles',
        title: 'Institutions culturelles',
        summary: 'Évaluer votre présence sur les réponses IA liées à la programmation, à la découverte culturelle et aux lieux de référence.',
        searchFocus: 'Intentions type: lieu culturel, exposition, programmation, sortie culturelle.',
        status: 'ready',
        path: '/pour-institutions-culturelles',
      },
      {
        slug: 'medias',
        title: 'Médias',
        summary: 'Mesurer votre présence sur les réponses IA liées à l’information, à la référence éditoriale et aux sources de confiance.',
        searchFocus: 'Intentions type: média de référence, source fiable, publication spécialisée.',
        status: 'ready',
        path: '/pour-medias',
      },
      {
        slug: 'federations-reseaux-organismes-aide',
        title: 'Fédérations, réseaux & organismes d’aide',
        summary: 'Mesurer si votre mission, votre périmètre et vos ressources ressortent correctement sur les réponses d’orientation.',
        searchFocus: 'Intentions type: réseau professionnel, fédération, organisme d’aide, accompagnement sectoriel.',
        status: 'ready',
        path: '/pour-federations-reseaux-organismes-aide',
      },
    ],
  },
];

export const readyUseCaseSectorPages: UseCaseSectorPage[] = [
  {
    slug: 'logiciels-crm-vente-support',
    familySlug: 'saas-applications',
    path: '/pour-crm-vente-support',
    seoTitle: 'CRM, vente & support : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les éditeurs CRM, vente et support à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre logiciel ressort, quels concurrents prennent la place et quoi corriger en priorité.',
    heroEyebrow: 'Cas d’usage • CRM, vente & support',
    heroTitle: 'Votre logiciel CRM ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre logiciel CRM ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit CRM',
    querySectionTitle: 'Exemples de requêtes analysées pour un logiciel CRM ou support',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de recommandation, de comparaison et de cas d’usage métier.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre logiciel CRM',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes CRM, vente et support',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA recommandent toujours les mêmes outils',
        description:
          'Même avec un bon produit, vous pouvez rester invisible si votre cas d’usage, votre cible ou vos bénéfices sont moins clairs que ceux de vos concurrents.',
      },
      {
        title: 'Votre positionnement est mal compris',
        description:
          'CRM PME, pipeline commercial, service client, helpdesk, support multicanal: si votre angle n’est pas net, les recommandations partent vers d’autres solutions.',
      },
      {
        title: 'Vous ne savez pas quelles pages retravailler',
        description:
          'Pages features, use cases, comparatifs, pricing, onboarding, catégories: Qory aide à voir où votre lisibilité se casse vraiment.',
      },
    ],
    queryExamples: [
      'Quel CRM simple recommander à une PME ?',
      'Quel outil support client choisir ?',
      'Quelle alternative à HubSpot pour une petite équipe ?',
      'Quel helpdesk recommander pour le service client ?',
      'Quel logiciel CRM ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre logiciel ressort sur les requêtes de CRM, de support, de vente et de recommandation.',
      'Quels concurrents ou comparateurs prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre produit: cible, cas d’usage, promesse, complexité, équipes visées.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre produit sur plusieurs requêtes CRM et support.',
      'Les solutions ou comparateurs qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre positionnement et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un SaaS encore peu connu ?',
        answer:
          'Oui. Quand une marque est encore jeune, la clarté du positionnement et des cas d’usage devient encore plus importante pour ressortir dans les réponses IA.',
      },
      {
        question: 'Le rapport aide-t-il sur les requêtes de comparaison ?',
        answer:
          'Oui, et c’est souvent l’un des cas les plus intéressants. Le rapport montre si votre produit ressort quand un utilisateur compare déjà plusieurs options.',
      },
      {
        question: 'Puis-je voir quels outils prennent la place ?',
        answer:
          'Le rapport met en lumière les concurrents, comparateurs et catégories qui captent déjà la visibilité sur les requêtes importantes.',
      },
      {
        question: 'Qory me dit-il quoi améliorer en priorité ?',
        answer:
          'Vous repartez avec un plan d’action priorisé pour clarifier votre wording, vos pages use case et les signaux qui influencent le plus la recommandation.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille SaaS & applications', href: '/cas-usage/saas-applications' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'logiciels-marketing-automation',
    familySlug: 'saas-applications',
    path: '/pour-marketing-automation',
    seoTitle: 'Marketing automation : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les outils de marketing automation à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre logiciel ressort et quoi corriger pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Marketing automation',
    heroTitle: 'Votre logiciel marketing ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre logiciel marketing ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit marketing automation',
    querySectionTitle: 'Exemples de requêtes analysées pour un outil de marketing automation',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches d’automatisation, de nurturing, d’emailing et de recommandation.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre logiciel marketing',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes marketing automation',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Votre outil n’est pas bien distingué',
        description:
          'Automation, workflows, lead nurturing, campagnes, scénarios email: si votre promesse reste floue, les IA citent des suites plus connues ou plus lisibles.',
      },
      {
        title: 'Votre cas d’usage n’est pas assez concret',
        description:
          'B2B, PME, e-commerce, acquisition, CRM intégré, orchestration: si vos pages restent trop générales, la recommandation devient fragile.',
      },
      {
        title: 'Vous ne savez pas où améliorer la clarté',
        description:
          'Pages features, use cases, templates, intégrations, pricing, onboarding: Qory aide à voir ce qu’il faut rendre plus net.',
      },
    ],
    queryExamples: [
      'Quel outil de marketing automation recommander ?',
      'Quelle solution simple pour automatiser ses emails ?',
      'Quel logiciel choisir pour le lead nurturing ?',
      'Quelle alternative à ActiveCampaign ou HubSpot ?',
      'Quel outil ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre logiciel ressort sur les requêtes d’automatisation, de nurturing, de campagnes et de recommandation.',
      'Quels concurrents ou comparateurs prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre produit: cible, cas d’usage, complexité, intégrations, bénéfices.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre produit sur plusieurs requêtes marketing automation.',
      'Les solutions ou comparateurs qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre positionnement et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un outil très spécialisé ?',
        answer:
          'Oui. Plus votre outil est spécialisé, plus il doit être décrit clairement pour ressortir dans les recommandations IA. C’est souvent ce qui manque le plus.',
      },
      {
        question: 'Le rapport aide-t-il face aux gros acteurs du marché ?',
        answer:
          'Justement, il permet de voir sur quelles requêtes les gros acteurs dominent encore, et où votre positionnement peut devenir plus lisible.',
      },
      {
        question: 'Puis-je voir quelles solutions prennent la place ?',
        answer:
          'Le rapport montre les outils, comparateurs et catégories qui captent déjà la visibilité sur les requêtes importantes.',
      },
      {
        question: 'Qory me dit-il quoi retravailler ?',
        answer:
          'Vous obtenez un plan d’action priorisé pour clarifier vos cas d’usage, vos pages produit et les signaux qui influencent le plus la recommandation.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille SaaS & applications', href: '/cas-usage/saas-applications' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'logiciels-finance-rh-conformite',
    familySlug: 'saas-applications',
    path: '/pour-finance-rh-conformite',
    seoTitle: 'Finance, RH & conformité : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les logiciels finance, RH et conformité à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre produit ressort et quoi corriger pour être mieux cité.',
    heroEyebrow: 'Cas d’usage • Finance, RH & conformité',
    heroTitle: 'Votre logiciel de finance ou RH ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre logiciel de finance ou RH ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit finance ou RH',
    querySectionTitle: 'Exemples de requêtes analysées pour un logiciel finance, RH ou conformité',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de confiance, de spécialité et de recommandation métier.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre logiciel',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes finance, RH et conformité',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA citent peu d’outils de confiance',
        description:
          'Sur les requêtes paie, compta, SIRH ou conformité, les réponses IA favorisent peu de solutions. Si votre positionnement n’est pas clair, vous pouvez disparaître.',
      },
      {
        title: 'Votre spécialité est mal comprise',
        description:
          'Paie, comptabilité, conformité, RH PME, reporting, audit, onboarding: si votre angle reste flou, la recommandation bascule vers d’autres logiciels.',
      },
      {
        title: 'Vous ne savez pas quels signaux renforcer',
        description:
          'Pages expertise, verticales, sécurité, intégrations, modules, preuves, wording: Qory aide à voir ce qu’il faut rendre plus lisible.',
      },
    ],
    queryExamples: [
      'Quel logiciel de paie recommander à une PME ?',
      'Quel SIRH choisir pour une petite équipe ?',
      'Quelle solution de conformité recommander ?',
      'Quel logiciel comptable ressort dans ChatGPT ?',
      'Quelle alternative à un outil RH plus lourd ?',
    ],
    qoryChecks: [
      'Si votre logiciel ressort sur les requêtes finance, RH, conformité et recommandation métier.',
      'Quels concurrents ou comparateurs prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre produit: cible, niveau de complexité, spécialité, sécurité, bénéfices.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre produit sur plusieurs requêtes finance et RH.',
      'Les solutions ou comparateurs qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre positionnement et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile sur des sujets à forte confiance ?',
        answer:
          'Oui, et c’est même souvent là que le travail de clarté devient le plus important. Sur ces requêtes, les IA citent peu d’acteurs et privilégient ceux qu’elles comprennent bien.',
      },
      {
        question: 'Le rapport fonctionne-t-il si mon produit a plusieurs modules ?',
        answer:
          'Oui. Le rapport aide justement à voir si vos différents modules, cas d’usage et bénéfices sont compris ou s’ils se brouillent entre eux.',
      },
      {
        question: 'Puis-je voir quelles solutions prennent la place ?',
        answer:
          'Le rapport montre les concurrents, annuaires ou comparateurs qui captent déjà la visibilité sur vos requêtes clés.',
      },
      {
        question: 'Qory me dit-il quoi clarifier ?',
        answer:
          'Vous repartez avec un plan d’action priorisé pour clarifier vos pages produit, vos verticales et les signaux qui influencent le plus la recommandation.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille SaaS & applications', href: '/cas-usage/saas-applications' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'logiciels-gestion-projet-collaboration',
    familySlug: 'saas-applications',
    path: '/pour-gestion-projet-collaboration',
    seoTitle: 'Gestion de projet & collaboration : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les outils de gestion de projet et collaboration à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre produit ressort et quoi corriger pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Gestion de projet & collaboration',
    heroTitle: 'Votre logiciel de gestion de projet ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre logiciel de gestion de projet ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit gestion de projet',
    querySectionTitle: 'Exemples de requêtes analysées pour un outil de gestion de projet',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches d’organisation, de productivité et de coordination d’équipe.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre logiciel',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes gestion de projet et collaboration',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA recommandent les outils les plus évidents',
        description:
          'Tâches, projet, collaboration, roadmap, planning, équipe: si votre différence n’est pas lisible, les recommandations vont vers les leaders déjà installés.',
      },
      {
        title: 'Votre bénéfice principal n’est pas clair',
        description:
          'Simplicité, visuel, PMO, équipe produit, PME, agence, équipe distribuée: si le bénéfice cible reste flou, votre visibilité baisse vite.',
      },
      {
        title: 'Vous ne savez pas quelles pages renforcent vraiment la recommandation',
        description:
          'Use cases, templates, pricing, onboarding, pages équipe, collaboration: Qory aide à repérer ce qu’il faut rendre plus net.',
      },
    ],
    queryExamples: [
      'Quel outil de gestion de projet recommander ?',
      'Quelle alternative simple à Asana ou ClickUp ?',
      'Quel logiciel choisir pour collaborer en équipe ?',
      'Quel outil to-do partagé ressort dans ChatGPT ?',
      'Quel outil convient à une petite équipe produit ?',
    ],
    qoryChecks: [
      'Si votre logiciel ressort sur les requêtes de gestion de projet, de productivité et de collaboration.',
      'Quels concurrents ou comparateurs prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre produit: cible, usage, simplicité, type d’équipe, bénéfices.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre produit sur plusieurs requêtes gestion de projet et collaboration.',
      'Les outils ou comparateurs qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre positionnement et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile dans un marché très concurrentiel ?',
        answer:
          'Oui. Plus le marché est encombré, plus la clarté du positionnement et des cas d’usage devient décisive pour ressortir dans les recommandations IA.',
      },
      {
        question: 'Le rapport aide-t-il si mon produit s’adresse à un segment précis ?',
        answer:
          'Oui. C’est même l’un de ses rôles les plus utiles: vérifier si ce segment précis ressort bien dans vos pages et dans la façon dont les IA résument votre produit.',
      },
      {
        question: 'Puis-je voir quels outils prennent déjà la place ?',
        answer:
          'Le rapport montre les concurrents, comparateurs et catégories qui captent déjà la visibilité sur vos requêtes les plus importantes.',
      },
      {
        question: 'Qory me dit-il quoi retravailler en priorité ?',
        answer:
          'Vous repartez avec un plan d’action priorisé pour clarifier vos pages use case, votre bénéfice principal et les signaux qui influencent la recommandation.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille SaaS & applications', href: '/cas-usage/saas-applications' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'logiciels-data-analytics-cybersecurite',
    familySlug: 'saas-applications',
    path: '/pour-data-analytics-cybersecurite',
    seoTitle: 'Data, analytics & cybersécurité : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les outils data, analytics et cybersécurité à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre produit ressort et quoi corriger pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Data, analytics & cybersécurité',
    heroTitle: 'Votre logiciel de cybersécurité ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre logiciel de cybersécurité ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit data ou cyber',
    querySectionTitle: 'Exemples de requêtes analysées pour un outil data, analytics ou cyber',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches expertes, de spécialité et de recommandation métier.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre logiciel',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes data, analytics et cyber',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Votre expertise est trop technique pour être bien reprise',
        description:
          'BI, observabilité, monitoring, sécurité, data stack, analytics: si vos pages restent trop complexes ou trop vagues, les IA recommandent d’autres outils.',
      },
      {
        title: 'Votre positionnement manque de clarté',
        description:
          'Cible, niveau de maturité, cas d’usage, promesse, complexité, intégrations: sans clarté, la recommandation devient faible.',
      },
      {
        title: 'Vous ne savez pas quoi simplifier',
        description:
          'Pages produit, use cases, documentation marketing, comparatifs, sécurité, bénéfices: Qory aide à voir ce qu’il faut rendre plus lisible.',
      },
    ],
    queryExamples: [
      'Quel outil BI recommander à une PME ?',
      'Quelle solution analytics choisir ?',
      'Quel outil de monitoring simple recommander ?',
      'Quelle solution cybersécurité ressort dans ChatGPT ?',
      'Quel outil data recommander à une équipe produit ?',
    ],
    qoryChecks: [
      'Si votre logiciel ressort sur les requêtes data, analytics, sécurité et recommandation métier.',
      'Quels concurrents ou comparateurs prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre produit: usage, cible, niveau de complexité, bénéfices, intégrations.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre produit sur plusieurs requêtes data, analytics et cyber.',
      'Les outils ou comparateurs qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre positionnement et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un produit très technique ?',
        answer:
          'Oui. Plus un produit est technique, plus il doit être expliqué clairement pour être bien repris par les réponses IA. C’est souvent là que les écarts se créent.',
      },
      {
        question: 'Le rapport aide-t-il si j’ai déjà beaucoup de documentation ?',
        answer:
          'Oui, parce qu’avoir beaucoup de contenu ne garantit pas qu’il soit bien compris. Le rapport aide à voir si votre positionnement et vos bénéfices ressortent vraiment.',
      },
      {
        question: 'Puis-je voir quels outils prennent déjà la place ?',
        answer:
          'Le rapport montre les concurrents, comparateurs et catégories qui captent déjà la visibilité sur vos requêtes importantes.',
      },
      {
        question: 'Qory me dit-il quoi rendre plus lisible ?',
        answer:
          'Vous repartez avec un plan d’action priorisé pour clarifier vos pages produit, vos cas d’usage et les signaux qui influencent la recommandation.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille SaaS & applications', href: '/cas-usage/saas-applications' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'logiciels-metiers-ecommerce-booking-formation',
    familySlug: 'saas-applications',
    path: '/pour-logiciels-metiers-ecommerce-booking-formation',
    seoTitle: 'Logiciels métier, e-commerce, booking & formation : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les logiciels métier, e-commerce, booking et formation à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre produit ressort et quoi corriger pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Logiciels métier, e-commerce, booking & formation',
    heroTitle: 'Votre logiciel métier ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre logiciel métier ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit logiciel métier',
    querySectionTitle: 'Exemples de requêtes analysées pour un logiciel métier',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de verticalité, de cas d’usage et de recommandation métier.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre logiciel',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes logiciel métier et verticales',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Votre verticalité n’est pas assez comprise',
        description:
          'LMS, réservation, booking, e-commerce enablement, logiciel métier: si votre cas d’usage reste trop large, les IA peinent à bien vous recommander.',
      },
      {
        title: 'Votre produit est noyé dans une catégorie trop générique',
        description:
          'Plus votre logiciel est vertical, plus son angle doit être explicite. Sinon les recommandations partent vers des outils généralistes ou des concurrents mieux cadrés.',
      },
      {
        title: 'Vous ne savez pas quelles pages clarifier',
        description:
          'Pages use case, secteurs, fonctionnalités, bénéfices, modules, onboarding: Qory aide à voir ce qu’il faut rendre plus net pour mieux ressortir.',
      },
    ],
    queryExamples: [
      'Quel logiciel de réservation recommander ?',
      'Quel LMS choisir pour former une équipe ?',
      'Quel outil métier recommander dans ce secteur ?',
      'Quelle solution e-commerce spécialisée ressort dans ChatGPT ?',
      'Quel logiciel vertical recommander à une PME ?',
    ],
    qoryChecks: [
      'Si votre logiciel ressort sur les requêtes métier, verticales, de réservation, de formation ou de recommandation.',
      'Quels concurrents ou comparateurs prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre produit: secteur, usage, cible, bénéfices, niveau de spécialisation.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre produit sur plusieurs requêtes verticales et métier.',
      'Les outils ou comparateurs qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre positionnement et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un logiciel très vertical ?',
        answer:
          'Oui, et souvent encore plus que pour un outil généraliste. Quand la verticalité n’est pas bien exprimée, les réponses IA ont vite fait de vous ranger dans la mauvaise catégorie.',
      },
      {
        question: 'Le rapport fonctionne-t-il pour plusieurs types de logiciels métier ?',
        answer:
          'Oui. Cette page regroupe les logiciels métier, booking, formation et e-commerce spécialisés qui jouent leur acquisition sur des requêtes très orientées cas d’usage.',
      },
      {
        question: 'Puis-je voir quels outils prennent déjà la place ?',
        answer:
          'Le rapport montre les concurrents, comparateurs et catégories qui captent déjà la visibilité sur vos requêtes clés.',
      },
      {
        question: 'Qory me dit-il quoi retravailler ?',
        answer:
          'Vous obtenez un plan d’action priorisé pour clarifier vos pages use case, votre niveau de spécialisation et les signaux qui influencent la recommandation.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille SaaS & applications', href: '/cas-usage/saas-applications' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'agences-marketing-seo',
    familySlug: 'agences-studios',
    path: '/pour-agences-marketing-seo',
    seoTitle: 'Agences marketing & SEO : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les agences marketing et SEO à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre agence ressort, quels concurrents prennent la place et quoi corriger en priorité.',
    heroEyebrow: 'Cas d’usage • Agences marketing & SEO',
    heroTitle: 'Votre agence de marketing ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre agence de marketing ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit agence marketing',
    querySectionTitle: 'Exemples de requêtes analysées pour une agence marketing ou SEO',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de recommandation, de comparaison et de spécialité.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre agence marketing',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes agence, acquisition et SEO',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA recommandent toujours les mêmes agences',
        description:
          'Même avec un bon niveau d’expertise, vous pouvez rester invisible si votre positionnement, vos verticales ou vos offres sont moins clairs que ceux d’autres agences.',
      },
      {
        title: 'Votre spécialité n’est pas assez lisible',
        description:
          'SEO, SEA, acquisition, B2B, growth, e-commerce, local: si votre angle n’est pas net, les réponses IA citent des acteurs plus faciles à qualifier.',
      },
      {
        title: 'Vous ne savez pas quels signaux renforcer',
        description:
          'Cas clients, pages expertise, verticales, preuves, wording, services: Qory aide à voir ce qu’il faut clarifier en priorité.',
      },
    ],
    queryExamples: [
      'Quelle agence SEO recommander pour une PME ?',
      'Quelle agence acquisition B2B choisir ?',
      'Quelle agence growth connaît bien le SaaS ?',
      'Qui recommander pour améliorer son SEO ?',
      'Quelle agence ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre agence ressort sur les requêtes de recommandation, de comparaison et de spécialité.',
      'Quels concurrents ou annuaires captent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre agence: expertises, verticales, taille de clients, cas d’usage, positionnement.',
      'Si vos pages rendent votre offre assez claire pour être correctement reprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre agence sur plusieurs requêtes d’acquisition et de recommandation.',
      'Les agences ou annuaires qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre positionnement et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une petite agence ?',
        answer:
          'Même une petite agence peut gagner en visibilité si ses expertises, ses verticales et ses preuves sont présentées de façon plus nette. C’est souvent là que la différence se joue.',
      },
      {
        question: 'Le rapport aide-t-il aussi sur des requêtes de comparaison ?',
        answer:
          'Oui, et c’est souvent l’un des cas les plus intéressants. Le rapport aide à voir si votre agence ressort quand un prospect demande une recommandation ou compare plusieurs acteurs.',
      },
      {
        question: 'Puis-je voir quelles agences prennent la place ?',
        answer:
          'Le rapport montre quels concurrents, comparateurs ou annuaires captent déjà la visibilité sur les requêtes qui comptent pour vous.',
      },
      {
        question: 'Qory me dit-il quoi améliorer ensuite ?',
        answer:
          'Vous repartez avec un plan d’action priorisé pour clarifier vos pages, votre positionnement et les signaux qui influencent le plus la recommandation.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Agences & studios', href: '/cas-usage/agences-studios' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'agences-social-media-contenu',
    familySlug: 'agences-studios',
    path: '/pour-agences-social-media-contenu',
    seoTitle: 'Agences social media & contenu : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les agences social media et contenu à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre agence ressort et quoi corriger pour être mieux recommandée.',
    heroEyebrow: 'Cas d’usage • Agences social media & contenu',
    heroTitle: 'Votre agence de contenu ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre agence de contenu ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit agence contenu',
    querySectionTitle: 'Exemples de requêtes analysées pour une agence contenu ou social media',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de recommandation, d’expertise éditoriale et de présence sociale.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre agence de contenu',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes social media et contenu',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Votre agence ne ressort pas sur les bonnes requêtes',
        description:
          'Community management, contenu B2B, réseaux sociaux, stratégie éditoriale, personal branding: si votre angle n’est pas net, les recommandations partent ailleurs.',
      },
      {
        title: 'Votre valeur n’est pas assez lisible',
        description:
          'Format d’accompagnement, équipe, spécialités, types de clients, livrables: sans clarté, les IA citent des agences plus faciles à résumer.',
      },
      {
        title: 'Vous ne savez pas quoi renforcer',
        description:
          'Pages expertise, cas clients, formats d’offre, verticales, signes d’autorité: Qory aide à prioriser ce qui influence vraiment la recommandation.',
      },
    ],
    queryExamples: [
      'Quelle agence social media recommander ?',
      'Quelle agence contenu choisir pour le B2B ?',
      'Qui peut gérer une stratégie éditoriale complète ?',
      'Quelle agence community management ressort dans ChatGPT ?',
      'Quelle agence recommande-t-on pour LinkedIn ?',
    ],
    qoryChecks: [
      'Si votre agence ressort sur les requêtes de recommandation, de contenu et de social media.',
      'Quels concurrents ou annuaires prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre agence: spécialités, formats, verticales, canaux, types de clients.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre agence sur plusieurs requêtes de recommandation et de spécialité.',
      'Les agences ou annuaires qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une agence de contenu très spécialisée ?',
        answer:
          'Oui. Plus votre agence a un angle précis, plus il est important qu’il ressorte clairement. C’est souvent ce qui fait la différence dans les réponses IA.',
      },
      {
        question: 'Le rapport aide-t-il si je vends surtout par le bouche-à-oreille ?',
        answer:
          'Oui, parce qu’il permet de voir si votre visibilité progresse aussi en dehors du bouche-à-oreille, sur les requêtes de recommandation qui influencent déjà les choix.',
      },
      {
        question: 'Puis-je voir quelles agences prennent déjà la place ?',
        answer:
          'Le rapport montre les agences, annuaires ou comparateurs qui captent déjà la visibilité sur vos requêtes les plus importantes.',
      },
      {
        question: 'Qory me dit-il quoi retravailler ?',
        answer:
          'Vous obtenez un plan d’action priorisé pour clarifier votre offre, vos pages d’expertise et les signaux qui influencent le plus la recommandation.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Agences & studios', href: '/cas-usage/agences-studios' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'services-publics-associations-fondations',
    familySlug: 'etablissements-institutions',
    path: '/pour-services-publics-associations-fondations',
    seoTitle: 'Services publics, associations & fondations : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les services publics, associations et fondations à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre structure ressort et quoi clarifier pour être mieux citée.',
    heroEyebrow: 'Cas d’usage • Services publics, associations & fondations',
    heroTitle: 'Votre organisme ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre organisme ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit organisme',
    querySectionTitle: 'Exemples de requêtes analysées pour un service public, une association ou une fondation',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches d’aide, d’orientation, de mission d’intérêt général et de service utile.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre organisme',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes d’aide, de mission et de service',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA résument mal votre mission',
        description:
          'Quand votre rôle, votre public ou votre zone d’intervention ne sont pas compris clairement, les réponses IA orientent vers d’autres structures ou vers des sources plus généralistes.',
      },
      {
        title: 'Votre utilité concrète n’est pas assez lisible',
        description:
          'Aide administrative, accompagnement, mission sociale, soutien local, service public: si ces bénéfices restent flous, votre structure ressort peu ou mal.',
      },
      {
        title: 'Vous ne savez pas quelles pages clarifier',
        description:
          'Pages mission, publics concernés, démarches, services, ressources, ancrage territorial: Qory aide à voir ce qu’il faut rendre plus explicite.',
      },
    ],
    queryExamples: [
      'Quelle association locale recommander ?',
      'Quel organisme aide sur cette démarche ?',
      'Quel service public contacter pour ce besoin ?',
      'Quelle fondation agit sur ce sujet ?',
      'Quel organisme ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre structure ressort sur les requêtes d’aide, de mission d’intérêt général et de service utile.',
      'Quels organismes, médias ou plateformes captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre structure: mission, publics, services, zone d’action, crédibilité.',
      'Si vos pages rendent votre rôle assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre structure sur plusieurs requêtes d’orientation.',
      'Les organismes déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre mission et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une structure non marchande ?',
        answer:
          'Oui. Le besoin de clarté est le même, parfois même plus important, parce que les IA doivent comprendre rapidement votre mission, votre utilité et votre périmètre.',
      },
      {
        question: 'Le rapport aide-t-il si notre site sert surtout à informer ?',
        answer:
          'Oui. Il permet de voir si cette information est vraiment bien comprise et si votre site aide les IA à orienter vers votre structure au bon moment.',
      },
      {
        question: 'Puis-je voir quelles structures prennent déjà la place ?',
        answer:
          'Le rapport montre les organismes, plateformes ou sources éditoriales déjà citées sur vos requêtes importantes.',
      },
      {
        question: 'Qory me dit-il quoi améliorer ?',
        answer:
          'Oui. Vous repartez avec des priorités concrètes pour rendre votre mission, vos services et vos publics plus lisibles.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Établissements & institutions', href: '/cas-usage/etablissements-institutions' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'ecoles-organismes-formation',
    familySlug: 'etablissements-institutions',
    path: '/pour-ecoles-organismes-formation',
    seoTitle: 'Écoles & organismes de formation : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les écoles et organismes de formation à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre structure ressort et quoi clarifier pour être mieux recommandée.',
    heroEyebrow: 'Cas d’usage • Écoles & organismes de formation',
    heroTitle: 'Votre organisme de formation ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre organisme de formation ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit formation',
    querySectionTitle: 'Exemples de requêtes analysées pour une école ou un organisme de formation',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches pédagogiques, de reconversion, de spécialité métier et d’orientation.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre organisme de formation',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes formation et orientation',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA citent peu d’organismes sur les bonnes formations',
        description:
          'Quand un utilisateur cherche une formation, une école ou une reconversion, les réponses retiennent peu d’acteurs. Si votre spécialité n’est pas claire, vous passez à côté.',
      },
      {
        title: 'Votre offre pédagogique est difficile à résumer',
        description:
          'Public visé, niveau, débouchés, format, certification, spécialité: si ces éléments ne ressortent pas clairement, les IA recommandent d’autres organismes.',
      },
      {
        title: 'Vous ne savez pas quelles pages renforcent l’orientation',
        description:
          'Pages programmes, admissions, débouchés, financement, modalités, cas d’usage: Qory aide à prioriser ce qui doit être mieux exprimé.',
      },
    ],
    queryExamples: [
      'Quel organisme de formation recommander ?',
      'Quelle école choisir pour cette spécialité ?',
      'Quelle formation certifiante est reconnue ?',
      'Quel organisme aide à une reconversion ?',
      'Quelle école ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre structure ressort sur les requêtes formation, orientation, reconversion et spécialité métier.',
      'Quels organismes, annuaires ou médias captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre offre: public visé, niveau, spécialités, format, débouchés, certification.',
      'Si vos pages rendent votre proposition assez claire pour être correctement reprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre structure sur plusieurs requêtes formation.',
      'Les organismes déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une école ou pour un organisme plus court ?',
        answer:
          'Oui. Le rapport fonctionne aussi bien pour une école que pour un organisme de formation plus ciblé, dès lors que l’acquisition passe par des requêtes d’orientation ou de recommandation.',
      },
      {
        question: 'Le rapport aide-t-il si nous proposons plusieurs programmes ?',
        answer:
          'Oui. Il permet de voir si vos programmes restent lisibles ou si leur diversité brouille votre positionnement dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quelles structures prennent déjà la place ?',
        answer:
          'Le rapport montre quels organismes, comparateurs ou médias ressortent déjà sur vos requêtes importantes.',
      },
      {
        question: 'Qory me dit-il quoi clarifier ?',
        answer:
          'Oui. Vous repartez avec des priorités concrètes pour mieux présenter vos programmes, vos débouchés et vos publics visés.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Établissements & institutions', href: '/cas-usage/etablissements-institutions' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'organismes-sante',
    familySlug: 'etablissements-institutions',
    path: '/pour-organismes-sante',
    seoTitle: 'Organismes de santé : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les organismes de santé à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre structure ressort et quoi clarifier pour être mieux citée.',
    heroEyebrow: 'Cas d’usage • Organismes de santé',
    heroTitle: 'Votre organisme de santé ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre organisme de santé ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit santé',
    querySectionTitle: 'Exemples de requêtes analysées pour un organisme de santé',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches d’orientation, d’accompagnement, d’accès aux soins et d’information santé.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre organisme de santé',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes santé et d’orientation',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA sélectionnent peu de sources sur les sujets santé',
        description:
          'Sur les requêtes santé, les assistants citent très peu d’acteurs. Si votre rôle, votre spécialité ou votre cadre d’intervention ne sont pas nets, vous pouvez disparaître totalement.',
      },
      {
        title: 'Votre mission ou vos services sont mal qualifiés',
        description:
          'Prévention, accompagnement, accès, parcours de soin, public concerné, ressources: si ces éléments restent flous, les réponses orientent vers d’autres structures.',
      },
      {
        title: 'Vous ne savez pas quelles pages rassurent vraiment',
        description:
          'Pages mission, accès, accompagnement, ressources, public visé, orientation: Qory aide à identifier les signaux qui doivent être mieux explicités.',
      },
    ],
    queryExamples: [
      'Quel organisme de santé recommander ?',
      'Qui contacter pour être orienté sur ce sujet ?',
      'Quel centre spécialisé peut accompagner ce besoin ?',
      'Quel organisme aide sur cette problématique de santé ?',
      'Quel organisme ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre structure ressort sur les requêtes santé, d’orientation, d’accompagnement et d’accès.',
      'Quels organismes, portails ou établissements captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre structure: mission, public, type d’aide, spécialité, accès, ressources.',
      'Si vos pages rendent votre rôle assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre structure sur plusieurs requêtes santé.',
      'Les organismes déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre mission et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une structure d’information ou d’accompagnement ?',
        answer:
          'Oui. Le rapport aide justement à vérifier si votre rôle d’information, d’orientation ou d’accompagnement est bien compris par les IA.',
      },
      {
        question: 'Le rapport remplace-t-il un audit réglementaire ou médical ?',
        answer:
          'Non. Il mesure uniquement votre visibilité et la clarté de votre présence en ligne. Il ne remplace ni un audit réglementaire ni un avis médical.',
      },
      {
        question: 'Puis-je voir quelles structures prennent déjà la place ?',
        answer:
          'Le rapport montre quels organismes, établissements ou portails captent déjà la visibilité sur vos requêtes importantes.',
      },
      {
        question: 'Qory me dit-il quoi renforcer ?',
        answer:
          'Oui. Vous repartez avec des priorités concrètes pour mieux présenter votre mission, vos ressources et vos modalités d’accès.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Établissements & institutions', href: '/cas-usage/etablissements-institutions' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'institutions-culturelles',
    familySlug: 'etablissements-institutions',
    path: '/pour-institutions-culturelles',
    seoTitle: 'Institutions culturelles : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les institutions culturelles à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre structure ressort et quoi clarifier pour être mieux citée.',
    heroEyebrow: 'Cas d’usage • Institutions culturelles',
    heroTitle: 'Votre institution culturelle ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre institution culturelle ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit culturel',
    querySectionTitle: 'Exemples de requêtes analysées pour une institution culturelle',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches de découverte, de programmation et d’orientation culturelle.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre institution culturelle',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes culture, média et découverte',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA simplifient trop votre rôle culturel',
        description:
          'Musée, lieu culturel, festival, centre d’art, programmation, mission: si votre position n’est pas claire, vous êtes mal résumé ou peu cité.',
      },
      {
        title: 'Votre proposition culturelle n’est pas assez explicite',
        description:
          'Public, thématique, programmation, ancrage local, expérience proposée: si ces éléments restent flous, les réponses IA privilégient d’autres références.',
      },
      {
        title: 'Vous ne savez pas quels contenus portent votre visibilité',
        description:
          'Pages programmes, dossiers, collections, archives, éditorial, calendrier, pages pratiques: Qory aide à voir ce qu’il faut mieux structurer.',
      },
    ],
    queryExamples: [
      'Quel lieu culturel visiter ce week-end ?',
      'Quelle institution culturelle propose cette exposition ?',
      'Quel musée ou centre d’art recommander ?',
      'Quel lieu culturel programmer ce mois-ci ?',
      'Quelle institution ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre structure ressort sur les requêtes de découverte, de programmation et de culture.',
      'Quels lieux, agendas, institutions ou plateformes captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre structure: programmation, public, mission, ancrage, spécialité.',
      'Si vos pages rendent votre rôle assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre structure sur plusieurs requêtes culturelles.',
      'Les institutions ou plateformes déjà citées à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre rôle et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un musée, un festival ou un lieu culturel ?',
        answer:
          'Oui. Le rapport aide à voir si votre lieu, votre programmation et votre mission sont bien compris par les IA quand elles recommandent une sortie ou une institution culturelle.',
      },
      {
        question: 'Le rapport aide-t-il si je publie déjà beaucoup de contenu ?',
        answer:
          'Oui. Avoir beaucoup de contenu ou de programmation ne suffit pas si votre rôle et votre offre ne sont pas bien compris dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quels acteurs prennent déjà la place ?',
        answer:
          'Le rapport montre quelles institutions, plateformes ou agendas sont déjà cités sur vos requêtes importantes.',
      },
      {
        question: 'Qory me dit-il quoi clarifier ?',
        answer:
          'Oui. Vous repartez avec des priorités concrètes pour mieux structurer votre programmation, votre mission et vos pages de référence.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Établissements & institutions', href: '/cas-usage/etablissements-institutions' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'medias',
    familySlug: 'etablissements-institutions',
    path: '/pour-medias',
    seoTitle: 'Médias : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les médias à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre publication ressort et quoi clarifier pour être mieux citée.',
    heroEyebrow: 'Cas d’usage • Médias',
    heroTitle: 'Votre média ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre média ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit média',
    querySectionTitle: 'Exemples de requêtes analysées pour un média',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches de source fiable, de référence éditoriale et d’information spécialisée.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre média',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes média et référence éditoriale',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA citent très peu de sources éditoriales',
        description:
          'Sur les sujets d’information ou d’analyse, les assistants retiennent peu de médias. Si votre ligne ou votre spécialité n’est pas claire, vous passez à côté de la citation.',
      },
      {
        title: 'Votre valeur éditoriale n’est pas assez explicite',
        description:
          'Public, thématique, angle, niveau d’expertise, fréquence, sérieux de la couverture: si ces éléments restent flous, d’autres sources sont préférées.',
      },
      {
        title: 'Vous ne savez pas quels contenus portent votre autorité',
        description:
          'Rubriques, dossiers, archives, pages auteurs, éditoriaux, pages thématiques: Qory aide à voir ce qu’il faut mieux structurer pour être repris.',
      },
    ],
    queryExamples: [
      'Quel média recommander sur ce sujet ?',
      'Quelle source éditoriale est fiable sur ce thème ?',
      'Quel média spécialisé citer pour cette analyse ?',
      'Quelle publication ressort dans ChatGPT ?',
      'Quel site d’information recommander ?',
    ],
    qoryChecks: [
      'Si votre média ressort sur les requêtes de source fiable, d’analyse et de référence éditoriale.',
      'Quels médias, plateformes ou agrégateurs captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre média: ligne éditoriale, spécialité, public, profondeur, crédibilité.',
      'Si vos pages rendent votre rôle assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre média sur plusieurs requêtes éditoriales.',
      'Les sources déjà citées à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre ligne et vos pages de référence.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un média spécialisé ?',
        answer:
          'Oui. Plus une ligne éditoriale est spécialisée, plus il est important que les IA comprennent clairement pourquoi votre média doit être cité sur ce sujet.',
      },
      {
        question: 'Le rapport aide-t-il si je publie déjà beaucoup de contenu ?',
        answer:
          'Oui. Le volume seul ne suffit pas. Le rapport aide à voir si votre autorité et votre spécialité ressortent vraiment dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quelles sources prennent déjà la place ?',
        answer:
          'Le rapport montre quels médias, agrégateurs ou plateformes sont déjà cités sur vos requêtes importantes.',
      },
      {
        question: 'Qory me dit-il quoi renforcer ?',
        answer:
          'Oui. Vous repartez avec des priorités concrètes pour mieux structurer vos pages thématiques, votre ligne éditoriale et vos signaux de crédibilité.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Établissements & institutions', href: '/cas-usage/etablissements-institutions' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'federations-reseaux-organismes-aide',
    familySlug: 'etablissements-institutions',
    path: '/pour-federations-reseaux-organismes-aide',
    seoTitle: 'Fédérations, réseaux & organismes d’aide : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les fédérations, réseaux et organismes d’aide à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre structure ressort et quoi clarifier pour être mieux citée.',
    heroEyebrow: 'Cas d’usage • Fédérations, réseaux & organismes d’aide',
    heroTitle: 'Votre organisme d’accompagnement ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre organisme d’accompagnement ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit réseau',
    querySectionTitle: 'Exemples de requêtes analysées pour une fédération, un réseau ou un organisme d’aide',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches d’orientation, de ressources, d’accompagnement sectoriel et de mise en réseau.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre réseau',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes réseau, aide et orientation',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA comprennent mal votre périmètre',
        description:
          'Fédération, réseau, syndicat, organisme d’aide, accompagnement sectoriel: si votre périmètre ou votre utilité sont flous, vous êtes mal orienté dans les réponses.',
      },
      {
        title: 'Votre rôle d’accompagnement est trop abstrait',
        description:
          'Ressources, adhésion, soutien, représentation, aide, réseau, orientation: si ces bénéfices restent implicites, d’autres structures sont citées à votre place.',
      },
      {
        title: 'Vous ne savez pas quelles pages renforcent la compréhension',
        description:
          'Pages mission, services, ressources, secteurs couverts, publics, adhésion, documentation: Qory aide à voir ce qu’il faut mieux expliciter.',
      },
    ],
    queryExamples: [
      'Quel réseau recommander pour ce secteur ?',
      'Quel organisme peut accompagner cette activité ?',
      'Quelle fédération représente ce métier ?',
      'Où trouver des ressources fiables pour ce besoin ?',
      'Quel réseau ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre structure ressort sur les requêtes réseau, aide, orientation et accompagnement sectoriel.',
      'Quels organismes, annuaires ou plateformes captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre structure: mission, publics, secteur, services, ressources, niveau d’aide.',
      'Si vos pages rendent votre rôle assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre structure sur plusieurs requêtes d’orientation et de réseau.',
      'Les acteurs déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre mission et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une fédération ou un réseau national ?',
        answer:
          'Oui. Le rapport aide à voir si votre rôle est bien compris, quel que soit votre niveau de couverture, local, régional ou national.',
      },
      {
        question: 'Le rapport aide-t-il si notre site sert surtout de ressource ?',
        answer:
          'Oui. Il permet de vérifier si cette fonction de ressource et d’orientation ressort vraiment dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quels acteurs prennent déjà la place ?',
        answer:
          'Le rapport montre quels réseaux, annuaires ou organismes sont déjà cités sur les requêtes importantes pour votre mission.',
      },
      {
        question: 'Qory me dit-il quoi renforcer ?',
        answer:
          'Oui. Vous obtenez des priorités concrètes pour mieux présenter votre rôle, vos ressources et votre périmètre d’action.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Établissements & institutions', href: '/cas-usage/etablissements-institutions' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'boutiques-generalistes-multicategories',
    familySlug: 'ecommerce',
    path: '/pour-boutiques-generalistes-multicategories',
    seoTitle: 'Boutiques généralistes & multi-catégories : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les boutiques généralistes et multi-catégories à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre site ressort et quoi clarifier pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Boutiques généralistes & multi-catégories',
    heroTitle: 'Votre boutique en ligne ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre boutique en ligne ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit e-commerce',
    querySectionTitle: 'Exemples de requêtes analysées pour une boutique multi-catégories',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches d’achat large, de confiance marchand et de comparaison entre sites.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre boutique en ligne',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes e-commerce et marchandes',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA citent très peu de marchands généralistes',
        description:
          'Sur les requêtes larges, les assistants retiennent quelques sites perçus comme fiables, simples à comprendre et bien catégorisés. Si votre promesse reste diffuse, vous êtes vite écarté.',
      },
      {
        title: 'Votre catalogue parle plus que votre positionnement',
        description:
          'Largeur d’offre, catégories, univers, garanties, livraison, spécialités: si tout est présent mais rien n’est hiérarchisé, les réponses IA favorisent d’autres marchands.',
      },
      {
        title: 'Vous ne savez pas quelles pages renforcent vraiment votre visibilité',
        description:
          'Pages catégories, pages marques, éditorial, réassurance, best-sellers: Qory aide à identifier les points qui rendent votre site plus recommandable.',
      },
    ],
    queryExamples: [
      'Quel site e-commerce recommander pour acheter en ligne ?',
      'Quelle boutique en ligne est fiable ?',
      'Quel marchand proposer pour plusieurs types de produits ?',
      'Quel site généraliste choisir en dehors des géants du marché ?',
      'Quelle boutique ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre boutique ressort sur les requêtes d’achat large, de confiance marchand et de comparaison entre sites.',
      'Quels marchands ou marketplaces captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre site: catégories, spécialités, fiabilité, avantages, expérience d’achat.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre boutique sur plusieurs requêtes d’achat et de confiance.',
      'Les marchands déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une boutique avec beaucoup de catégories ?',
        answer:
          'Oui. Quand l’offre est large, l’enjeu est de vérifier si cette richesse reste lisible pour les IA ou si elle brouille votre positionnement.',
      },
      {
        question: 'Le rapport aide-t-il si mon acquisition dépend déjà beaucoup du SEO classique ?',
        answer:
          'Oui. Il permet de voir si cette visibilité classique se transforme aussi en recommandation dans les réponses IA, ce qui n’est pas automatique.',
      },
      {
        question: 'Puis-je voir quels sites prennent déjà la place ?',
        answer:
          'Le rapport montre les marchands et plateformes déjà cités sur les requêtes importantes pour votre acquisition.',
      },
      {
        question: 'Qory me dit-il quoi retravailler ?',
        answer:
          'Oui. Vous repartez avec des priorités concrètes pour clarifier vos catégories, votre réassurance et vos pages marchandes clés.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille E-commerce', href: '/cas-usage/ecommerce' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'ecommerce-mode-accessoires',
    familySlug: 'ecommerce',
    path: '/pour-ecommerce-mode-accessoires',
    seoTitle: 'Mode & accessoires : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les boutiques mode et accessoires à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre site ressort et quoi renforcer pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Mode & accessoires',
    heroTitle: 'Votre boutique de mode ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre boutique de mode ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit mode',
    querySectionTitle: 'Exemples de requêtes analysées pour une boutique mode',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches d’achat mode, de style, d’accessoires et de marque.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre boutique de mode',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes mode et accessoires',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA recommandent quelques marques ou boutiques seulement',
        description:
          'Sur la mode, les assistants retiennent vite des références plus visibles que les autres. Si votre univers n’est pas clair, vous perdez la recommandation.',
      },
      {
        title: 'Votre positionnement de marque est trop flou',
        description:
          'Style, gamme, clientèle, catégories fortes, matières, occasions d’achat: si ces éléments ne ressortent pas nettement, les réponses IA citent d’autres acteurs.',
      },
      {
        title: 'Vous ne savez pas quels signaux rendent votre boutique mémorable',
        description:
          'Pages collections, best-sellers, univers, guide de style, réassurance: Qory aide à identifier ce qu’il faut rendre plus lisible.',
      },
    ],
    queryExamples: [
      'Quelle boutique de mode recommander en ligne ?',
      'Où acheter des accessoires de qualité ?',
      'Quelle marque mode proposer pour ce style ?',
      'Quel site mode est fiable et bien positionné ?',
      'Quelle boutique mode ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre boutique ressort sur les requêtes mode, accessoires, style et recommandation de marque.',
      'Quels marchands ou marketplaces captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre site: style, produits phares, clientèle, positionnement, expérience.',
      'Si vos pages rendent votre univers assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre boutique sur plusieurs requêtes mode.',
      'Les sites déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre univers et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une marque avec une forte identité visuelle ?',
        answer:
          'Oui. Une identité visuelle forte ne suffit pas toujours si le positionnement et les catégories fortes ne sont pas compris clairement par les IA.',
      },
      {
        question: 'Le rapport aide-t-il si je vends plusieurs styles ou collections ?',
        answer:
          'Oui. Il permet de voir si cette variété reste lisible ou si elle rend votre proposition plus difficile à résumer dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quels sites prennent déjà la place ?',
        answer:
          'Le rapport met en lumière les boutiques, marques ou plateformes déjà recommandées sur vos requêtes clés.',
      },
      {
        question: 'Qory me dit-il quoi améliorer ?',
        answer:
          'Oui. Vous obtenez des priorités claires pour mieux présenter vos collections, votre univers et vos preuves de confiance.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille E-commerce', href: '/cas-usage/ecommerce' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'ecommerce-beaute-cosmetique',
    familySlug: 'ecommerce',
    path: '/pour-ecommerce-beaute-cosmetique',
    seoTitle: 'Beauté & cosmétique : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les boutiques beauté et cosmétique à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre site ressort et quoi renforcer pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Beauté & cosmétique',
    heroTitle: 'Votre boutique beauté ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre boutique beauté ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit beauté',
    querySectionTitle: 'Exemples de requêtes analysées pour une boutique beauté',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches de soins, de routine, de cosmétique et de confiance produit.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre boutique beauté',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes beauté et cosmétique',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA privilégient les marques et boutiques déjà très lisibles',
        description:
          'Sur la beauté, les réponses vont vite vers quelques acteurs perçus comme fiables. Si votre offre n’est pas claire, vous êtes peu ou mal recommandé.',
      },
      {
        title: 'Votre assortiment manque de lisibilité',
        description:
          'Skincare, maquillage, cheveux, bio, peaux sensibles, routines: si vos points forts ne ressortent pas, les assistants retiennent d’autres boutiques.',
      },
      {
        title: 'Vous ne savez pas quels éléments renforcent la confiance',
        description:
          'Pages catégories, conseils, routines, ingrédients, réassurance, promesse produit: Qory aide à identifier les signaux à mieux exposer.',
      },
    ],
    queryExamples: [
      'Quelle boutique beauté recommander en ligne ?',
      'Où acheter des cosmétiques fiables ?',
      'Quel site skincare proposer pour une routine ?',
      'Quelle boutique beauté est bien recommandée ?',
      'Quel site cosmétique ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre boutique ressort sur les requêtes beauté, cosmétique, soin et recommandation d’achat.',
      'Quels sites ou marketplaces captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre site: catégories fortes, bénéfices, clientèle, niveau de confiance, positionnement.',
      'Si vos pages rendent votre offre assez claire pour être correctement reprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre boutique sur plusieurs requêtes beauté.',
      'Les sites déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une boutique très spécialisée ?',
        answer:
          'Oui. Plus votre spécialité est nette, plus elle doit être comprise rapidement par les IA. Le rapport aide à vérifier si cette clarté existe vraiment.',
      },
      {
        question: 'Le rapport aide-t-il si je vends à la fois plusieurs univers beauté ?',
        answer:
          'Oui. Il permet de voir si cette largeur reste lisible ou si elle brouille votre positionnement dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quels sites prennent déjà la place ?',
        answer:
          'Le rapport montre les boutiques et plateformes déjà recommandées sur les requêtes qui comptent pour vous.',
      },
      {
        question: 'Qory me dit-il quoi clarifier ?',
        answer:
          'Oui. Vous repartez avec des priorités concrètes pour mieux présenter vos catégories, votre promesse et vos signaux de confiance.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille E-commerce', href: '/cas-usage/ecommerce' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'ecommerce-maison-deco-mobilier',
    familySlug: 'ecommerce',
    path: '/pour-ecommerce-maison-deco-mobilier',
    seoTitle: 'Maison, déco & mobilier : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les boutiques maison, déco et mobilier à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre site ressort et quoi améliorer pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Maison, déco & mobilier',
    heroTitle: 'Votre boutique de décoration et mobilier ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre boutique de décoration et mobilier ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit maison',
    querySectionTitle: 'Exemples de requêtes analysées pour une boutique maison ou déco',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches d’inspiration, de décoration, de mobilier et d’achat d’univers maison.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre boutique maison',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes maison, déco et mobilier',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA recommandent peu d’acteurs sur les univers maison',
        description:
          'Sur les requêtes déco ou mobilier, les réponses citent quelques sites jugés inspirants et fiables. Si votre univers est mal cadré, vous perdez en visibilité.',
      },
      {
        title: 'Votre style ou votre spécialité manque de netteté',
        description:
          'Décoration, mobilier, design, artisanat, petit objet, inspiration pièce par pièce: si vos points forts sont flous, les assistants retiennent d’autres boutiques.',
      },
      {
        title: 'Vous ne savez pas quels contenus renforcent vraiment votre position',
        description:
          'Pages catégories, inspirations, sélections, guides, univers produits: Qory aide à voir ce qu’il faut mieux structurer pour être repris.',
      },
    ],
    queryExamples: [
      'Quelle boutique déco recommander en ligne ?',
      'Où acheter du mobilier design ?',
      'Quel site maison proposer pour décorer un salon ?',
      'Quelle boutique maison est fiable ?',
      'Quel site déco ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre boutique ressort sur les requêtes maison, déco, mobilier et inspiration d’achat.',
      'Quels sites ou marketplaces captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre site: style, univers, catégories fortes, niveau de gamme, bénéfices.',
      'Si vos pages rendent votre offre assez claire pour être correctement reprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre boutique sur plusieurs requêtes maison et déco.',
      'Les sites déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre univers et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une boutique très inspirante visuellement ?',
        answer:
          'Oui. Un bel univers visuel aide, mais il faut aussi que les IA comprennent clairement votre style, vos catégories fortes et votre positionnement.',
      },
      {
        question: 'Le rapport aide-t-il si je vends déco et mobilier en même temps ?',
        answer:
          'Oui. Il permet de voir si cette largeur d’offre est bien comprise ou si elle brouille la lecture de votre boutique dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quels sites prennent déjà la place ?',
        answer:
          'Le rapport montre les boutiques et plateformes déjà recommandées sur vos requêtes importantes.',
      },
      {
        question: 'Qory me dit-il quoi améliorer ?',
        answer:
          'Oui. Vous obtenez des priorités concrètes pour mieux structurer vos catégories, vos pages inspiration et votre réassurance.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille E-commerce', href: '/cas-usage/ecommerce' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'ecommerce-alimentation-sante-famille',
    familySlug: 'ecommerce',
    path: '/pour-ecommerce-alimentation-sante-famille',
    seoTitle: 'Alimentation, santé & famille : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les boutiques alimentation, santé et famille à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre site ressort et quoi renforcer pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Alimentation, santé & famille',
    heroTitle: 'Votre boutique alimentaire ou santé ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre boutique alimentaire ou santé ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit boutique santé',
    querySectionTitle: 'Exemples de requêtes analysées pour une boutique alimentation, santé ou famille',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches d’achat de confiance liées à la nutrition, au bien-être, à la famille et au quotidien.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre boutique santé',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes alimentation, santé et famille',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA citent peu d’acteurs sur les achats sensibles',
        description:
          'Quand la confiance compte, les assistants sélectionnent très peu de sites. Si votre crédibilité n’est pas lisible, d’autres marchands prennent la place.',
      },
      {
        title: 'Votre offre couvre plusieurs univers difficiles à résumer',
        description:
          'Bio, compléments, famille, puériculture, santé du quotidien, alimentation spécialisée: si vos catégories fortes sont floues, les réponses IA se tournent ailleurs.',
      },
      {
        title: 'Vous ne savez pas quels signaux rassurent vraiment',
        description:
          'Pages catégories, certifications, sourcing, bénéfices, réassurance, contenus d’accompagnement: Qory aide à voir ce qu’il faut mieux exposer.',
      },
    ],
    queryExamples: [
      'Quelle boutique en ligne recommander pour acheter des compléments ?',
      'Où trouver des produits bio fiables ?',
      'Quel site famille choisir pour des achats du quotidien ?',
      'Quelle boutique santé est bien recommandée ?',
      'Quel site ressort dans ChatGPT pour ce type de produits ?',
    ],
    qoryChecks: [
      'Si votre boutique ressort sur les requêtes alimentation, santé, famille et achat de confiance.',
      'Quels marchands ou marketplaces captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre site: catégories fortes, niveau de confiance, bénéfices, spécialisation, garanties.',
      'Si vos pages rendent votre offre assez claire pour être correctement reprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre boutique sur plusieurs requêtes alimentation, santé et famille.',
      'Les sites déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages les plus importantes.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une boutique sur des produits à forte exigence de confiance ?',
        answer:
          'Oui. C’est même l’un des cas où le rapport est le plus utile, parce qu’il aide à voir si vos signaux de crédibilité sont bien perçus par les IA.',
      },
      {
        question: 'Le rapport aide-t-il si je couvre plusieurs univers comme santé et famille ?',
        answer:
          'Oui. Il permet de vérifier si cette variété est bien comprise ou si elle rend votre positionnement plus difficile à lire.',
      },
      {
        question: 'Puis-je voir quels sites prennent déjà la place ?',
        answer:
          'Le rapport met en lumière les marchands et plateformes déjà cités sur vos requêtes clés.',
      },
      {
        question: 'Qory me dit-il quoi renforcer ?',
        answer:
          'Oui. Vous obtenez des priorités concrètes pour retravailler vos catégories, vos preuves de confiance et vos pages marchandes.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille E-commerce', href: '/cas-usage/ecommerce' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'ecommerce-tech-sport-loisirs',
    familySlug: 'ecommerce',
    path: '/pour-ecommerce-tech',
    seoTitle: 'Tech : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les boutiques tech à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre site ressort et quoi clarifier pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Tech',
    heroTitle: 'Votre boutique tech ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre boutique tech ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit tech',
    querySectionTitle: 'Exemples de requêtes analysées pour une boutique tech',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches d’équipement tech, d’accessoires, d’usage et de comparaison entre options.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre boutique tech',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes tech et équipement',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA comparent très vite les produits et vendeurs',
        description:
          'Sur la tech, les réponses citent peu de marchands. Si votre expertise, votre sélection ou votre positionnement ne sont pas lisibles, d’autres acteurs dominent la recommandation.',
      },
      {
        title: 'Votre spécialité tech n’est pas assez claire',
        description:
          'Accessoires, audio, bureau, gaming, objets connectés, mobilité: si votre angle principal est flou, les assistants retiennent des sites plus nets.',
      },
      {
        title: 'Vous ne savez pas quels contenus renforcent votre crédibilité',
        description:
          'Guides d’achat, catégories, sélections, cas d’usage, comparatifs, réassurance: Qory aide à hiérarchiser ce qu’il faut mieux exposer.',
      },
    ],
    queryExamples: [
      'Quelle boutique tech recommander en ligne ?',
      'Où acheter des accessoires tech fiables ?',
      'Quel site proposer pour du matériel connecté ?',
      'Quelle boutique est bien recommandée pour ce type d’équipement ?',
      'Quel site tech ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre boutique ressort sur les requêtes tech, accessoires, équipement connecté et achat en ligne.',
      'Quels marchands ou marketplaces captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre site: catégories fortes, usages, expertise, niveau de confiance, spécialisation.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre boutique sur plusieurs requêtes tech.',
      'Les sites déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une boutique très experte ?',
        answer:
          'Oui. Plus votre spécialité est pointue, plus il est important que les IA comprennent clairement pourquoi votre site mérite d’être recommandé.',
      },
      {
        question: 'Le rapport aide-t-il si je vends plusieurs univers liés ?',
        answer:
          'Oui. Il permet de voir si cette combinaison reste lisible ou si elle dilue votre positionnement dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quels sites prennent déjà la place ?',
        answer:
          'Le rapport montre les marchands déjà recommandés sur les requêtes importantes pour votre acquisition.',
      },
      {
        question: 'Qory me dit-il quoi retravailler ?',
        answer:
          'Oui. Vous repartez avec des priorités concrètes pour renforcer vos catégories, vos contenus d’aide au choix et vos signaux de confiance.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille E-commerce', href: '/cas-usage/ecommerce' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'ecommerce-sport-loisirs',
    familySlug: 'ecommerce',
    path: '/pour-ecommerce-sport-loisirs',
    seoTitle: 'Sport & loisirs : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les boutiques sport et loisirs à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre site ressort et quoi clarifier pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Sport & loisirs',
    heroTitle: 'Votre boutique sport ou loisirs ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre boutique sport ou loisirs ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit sport & loisirs',
    querySectionTitle: 'Exemples de requêtes analysées pour une boutique sport ou loisirs',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches d’équipement, de passion, d’usage et de comparaison entre options.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre boutique sport ou loisirs',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes sport et loisirs',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA comparent très vite les options disponibles',
        description:
          'Sur les univers sport et loisirs, les réponses citent peu de marchands. Si votre expertise n’est pas lisible, d’autres acteurs dominent la recommandation.',
      },
      {
        title: 'Votre offre est perçue comme trop large',
        description:
          'Sport, outdoor, loisirs créatifs, jeux, équipement de passion: si votre angle principal est flou, les assistants retiennent des sites plus clairs.',
      },
      {
        title: 'Vous ne savez pas quels contenus renforcent votre crédibilité',
        description:
          'Guides d’achat, catégories, sélections, cas d’usage, comparatifs, réassurance: Qory aide à hiérarchiser ce qu’il faut mieux exposer.',
      },
    ],
    queryExamples: [
      'Quelle boutique sport recommander en ligne ?',
      'Où acheter du matériel de loisirs fiable ?',
      'Quel site proposer pour des équipements outdoor ?',
      'Quelle boutique est bien recommandée pour ce type d’équipement ?',
      'Quel site sport ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre boutique ressort sur les requêtes sport, loisirs, outdoor et achat d’équipement.',
      'Quels marchands ou marketplaces captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre site: catégories fortes, usages, expertise, niveau de confiance, spécialisation.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre boutique sur plusieurs requêtes sport et loisirs.',
      'Les sites déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une boutique très experte ?',
        answer:
          'Oui. Plus votre spécialité est pointue, plus il est important que les IA comprennent clairement pourquoi votre site mérite d’être recommandé.',
      },
      {
        question: 'Le rapport aide-t-il si je vends plusieurs univers liés ?',
        answer:
          'Oui. Il permet de voir si cette combinaison reste lisible ou si elle dilue votre positionnement dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quels sites prennent déjà la place ?',
        answer:
          'Le rapport montre les marchands déjà recommandés sur les requêtes importantes pour votre acquisition.',
      },
      {
        question: 'Qory me dit-il quoi retravailler ?',
        answer:
          'Oui. Vous repartez avec des priorités concrètes pour renforcer vos catégories, vos contenus d’aide au choix et vos signaux de confiance.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille E-commerce', href: '/cas-usage/ecommerce' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'ecommerce-luxe-animalerie-b2b-specialise',
    familySlug: 'ecommerce',
    path: '/pour-ecommerce-luxe-animalerie-b2b-specialise',
    seoTitle: 'Luxe, animalerie & équipement pro spécialisé : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les boutiques luxe, animalerie et équipement pro spécialisé à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre site ressort et quoi clarifier pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Luxe, animalerie & équipement pro spécialisé',
    heroTitle: 'Votre boutique spécialisée ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre boutique spécialisée ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit boutique spécialisée',
    querySectionTitle: 'Exemples de requêtes analysées pour une boutique spécialisée',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches d’achat niche, de confiance, de haut niveau d’expertise et de sélection précise.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre boutique spécialisée',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes luxe, animalerie et équipement spécialisé',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Votre niche est mal comprise par les IA',
        description:
          'Luxe, animalerie, équipement pro, produit technique ou rare: plus la catégorie est précise, plus le moindre flou de positionnement coûte en visibilité.',
      },
      {
        title: 'Votre expertise ne ressort pas assez vite',
        description:
          'Sélection, gamme, niveau de conseil, qualité, clientèle, usages spécifiques: si ces éléments ne sont pas nets, les assistants proposent d’autres sources.',
      },
      {
        title: 'Vous ne savez pas quels signaux font la différence',
        description:
          'Pages catégories, fiches conseils, garanties, spécialisation, vocabulaire métier: Qory aide à voir ce qu’il faut rendre plus explicite.',
      },
    ],
    queryExamples: [
      'Quelle boutique spécialisée recommander en ligne ?',
      'Où acheter un équipement pro fiable ?',
      'Quel site proposer pour des produits premium ou de niche ?',
      'Quelle boutique experte choisir pour ce besoin précis ?',
      'Quel site spécialisé ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre boutique ressort sur les requêtes d’achat niche, de spécialisation et de confiance.',
      'Quels marchands ou plateformes captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre site: spécialité, niveau de gamme, expertise, public cible, promesse.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre boutique sur plusieurs requêtes de niche.',
      'Les sites déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre spécialité et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une boutique très niche ?',
        answer:
          'Oui. C’est même souvent là que le besoin est le plus fort, parce qu’un positionnement de niche doit être compris très vite pour être recommandé correctement.',
      },
      {
        question: 'Le rapport aide-t-il si mon catalogue s’adresse à un public expert ?',
        answer:
          'Oui. Il permet de voir si votre niveau d’expertise est perçu comme une vraie force ou s’il reste trop implicite dans vos pages.',
      },
      {
        question: 'Puis-je voir quels sites prennent déjà la place ?',
        answer:
          'Le rapport met en lumière les marchands et plateformes déjà recommandés sur vos requêtes clés.',
      },
      {
        question: 'Qory me dit-il quoi améliorer ?',
        answer:
          'Oui. Vous obtenez des priorités concrètes pour clarifier votre spécialité, vos garanties et vos pages de réassurance.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille E-commerce', href: '/cas-usage/ecommerce' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'annuaires-locaux-b2b',
    familySlug: 'plateformes-annuaires',
    path: '/pour-annuaires-locaux-b2b',
    seoTitle: 'Annuaires locaux & B2B : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les annuaires locaux et B2B à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre plateforme ressort et quoi renforcer pour être mieux citée.',
    heroEyebrow: 'Cas d’usage • Annuaires locaux & B2B',
    heroTitle: 'Votre annuaire ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre annuaire ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit annuaire',
    querySectionTitle: 'Exemples de requêtes analysées pour un annuaire local ou B2B',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches de découverte d’acteurs, de répertoires fiables et de sélection de prestataires.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre annuaire',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes annuaire et découverte d’acteurs',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA citent très peu de sources intermédiaires',
        description:
          'Sur les requêtes de découverte, les assistants retiennent quelques répertoires perçus comme fiables. Si votre valeur n’est pas claire, vous restez hors de la sélection.',
      },
      {
        title: 'Votre annuaire manque de signaux de confiance',
        description:
          'Couverture géographique, spécialisation, méthode de sélection, fraîcheur des fiches, crédibilité éditoriale: si ces éléments sont flous, les réponses IA favorisent d’autres sources.',
      },
      {
        title: 'Vous ne savez pas comment renforcer votre rôle de source',
        description:
          'Pages catégories, filtres, pages locales, critères, maillage éditorial: Qory aide à voir ce qu’il faut rendre plus lisible pour être mieux repris.',
      },
    ],
    queryExamples: [
      'Quel annuaire recommander pour trouver un prestataire local ?',
      'Où trouver un bon répertoire B2B ?',
      'Quel site aide à comparer des prestataires fiables ?',
      'Quel annuaire local utiliser pour une PME ?',
      'Quel annuaire ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre annuaire ressort sur les requêtes de découverte, de sélection et de répertoire fiable.',
      'Quels concurrents ou agrégateurs captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre plateforme: spécialisation, zone, critères, niveau de confiance, profondeur de catalogue.',
      'Si vos pages rendent votre rôle de source assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre annuaire sur plusieurs requêtes de découverte.',
      'Les plateformes déjà citées à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre positionnement et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un annuaire très spécialisé ?',
        answer:
          'Oui. Plus un annuaire est spécialisé, plus il doit faire comprendre rapidement à qui il sert, comment il sélectionne ses acteurs et pourquoi il est crédible.',
      },
      {
        question: 'Le rapport aide-t-il si je couvre déjà beaucoup de villes ou de catégories ?',
        answer:
          'Oui. Il permet de voir si cette couverture est vraiment perçue comme une force ou si elle rend votre positionnement moins lisible dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quels annuaires prennent déjà la place ?',
        answer:
          'Le rapport montre quelles plateformes sont déjà citées sur les requêtes importantes pour votre acquisition.',
      },
      {
        question: 'Qory donne-t-il des actions concrètes ?',
        answer:
          'Oui. Vous repartez avec des priorités claires pour retravailler vos pages catégories, vos pages locales et vos signaux de confiance.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Plateformes & annuaires', href: '/cas-usage/plateformes-annuaires' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'marketplaces-services-produits',
    familySlug: 'plateformes-annuaires',
    path: '/pour-marketplaces-services-produits',
    seoTitle: 'Marketplaces services & produits : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les marketplaces services et produits à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre plateforme ressort et quoi renforcer pour être mieux recommandée.',
    heroEyebrow: 'Cas d’usage • Marketplaces services & produits',
    heroTitle: 'Votre marketplace ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre marketplace ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit marketplace',
    querySectionTitle: 'Exemples de requêtes analysées pour une marketplace',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches de comparaison d’offres, d’exploration de catégories et de plateforme de confiance.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre marketplace',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes marketplace et exploration d’offres',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA privilégient les plateformes les plus évidentes',
        description:
          'Quand un utilisateur cherche où comparer, réserver ou explorer une offre, les assistants citent peu de marketplaces. Si votre rôle n’est pas limpide, vous sortez de la sélection.',
      },
      {
        title: 'Votre valeur de place de marché est mal comprise',
        description:
          'Services, produits, sélection, garanties, volume d’offres, type de vendeurs ou de prestataires: sans cadrage clair, les réponses IA choisissent d’autres acteurs.',
      },
      {
        title: 'Vous ne voyez pas quels signaux vous rendent recommandable',
        description:
          'Pages catégories, filtres, règles de sélection, réassurance, structure éditoriale: Qory aide à identifier ce qu’il faut mieux exposer.',
      },
    ],
    queryExamples: [
      'Quelle marketplace recommander pour trouver ce service ?',
      'Où comparer plusieurs offres fiables ?',
      'Quelle plateforme utiliser pour trouver un produit spécialisé ?',
      'Quel site aide à explorer plusieurs vendeurs ?',
      'Quelle marketplace ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre marketplace ressort sur les requêtes de comparaison, d’exploration et de découverte d’offres.',
      'Quels concurrents, comparateurs ou annuaires captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre plateforme: type d’offre, spécialisation, volume, confiance, mode de sélection.',
      'Si vos pages rendent votre promesse assez claire pour être correctement reprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre marketplace sur plusieurs requêtes de plateforme.',
      'Les acteurs déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre proposition et vos pages stratégiques.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une marketplace verticale ?',
        answer:
          'Oui. Une marketplace verticale a besoin d’être comprise très vite sur sa spécialité et sa valeur. Le rapport aide à voir si cette promesse ressort vraiment.',
      },
      {
        question: 'Le rapport aide-t-il si je vends à la fois côté offreurs et côté clients ?',
        answer:
          'Oui. Il permet de vérifier si votre plateforme reste lisible malgré une promesse double, ce qui est souvent un point sensible dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quelles plateformes prennent déjà la place ?',
        answer:
          'Le rapport montre quelles marketplaces et plateformes sont déjà recommandées sur vos requêtes importantes.',
      },
      {
        question: 'Qory me dit-il quoi renforcer ?',
        answer:
          'Oui. Vous obtenez des priorités concrètes pour retravailler vos catégories, votre promesse et vos signaux de confiance.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Plateformes & annuaires', href: '/cas-usage/plateformes-annuaires' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'plateformes-mise-en-relation-recrutement-reservation',
    familySlug: 'plateformes-annuaires',
    path: '/pour-mise-en-relation-recrutement-reservation',
    seoTitle: 'Mise en relation, recrutement & réservation : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les plateformes de mise en relation, recrutement et réservation à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre plateforme ressort et quoi clarifier pour être mieux recommandée.',
    heroEyebrow: 'Cas d’usage • Mise en relation, recrutement & réservation',
    heroTitle: 'Votre plateforme ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre plateforme ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit plateforme',
    querySectionTitle: 'Exemples de requêtes analysées pour une plateforme de mise en relation ou réservation',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches d’intermédiaire fiable, de prise de contact, de recrutement et de réservation.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre plateforme',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes mise en relation, recrutement et réservation',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA retiennent très peu d’intermédiaires',
        description:
          'Quand il faut recommander une plateforme pour réserver, recruter ou être mis en relation, les réponses citent peu d’acteurs. Si votre rôle n’est pas évident, vous disparaissez vite.',
      },
      {
        title: 'Votre positionnement est trop large ou trop flou',
        description:
          'Recrutement, mise en relation, prise de rendez-vous, réservation, matching: si le bénéfice principal n’est pas explicite, d’autres plateformes prennent la place.',
      },
      {
        title: 'Vous ne savez pas quelles pages portent vraiment votre acquisition',
        description:
          'Pages catégories, secteurs, métiers, destinations, cas d’usage, signaux de confiance: Qory aide à identifier les pages qui doivent être renforcées en priorité.',
      },
    ],
    queryExamples: [
      'Quelle plateforme recommander pour réserver un professionnel ?',
      'Quel site utiliser pour recruter rapidement ?',
      'Quelle plateforme aide à trouver le bon prestataire ?',
      'Quel service de réservation en ligne choisir ?',
      'Quelle plateforme ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre plateforme ressort sur les requêtes de mise en relation, de réservation et de recrutement.',
      'Quels concurrents ou intermédiaires captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre plateforme: usages, types de profils, secteurs, réassurance, fonctionnement.',
      'Si vos pages rendent votre promesse assez claire pour être correctement reprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre plateforme sur plusieurs requêtes d’intermédiation.',
      'Les acteurs déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre promesse et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une plateforme très spécialisée ?',
        answer:
          'Oui. Une plateforme spécialisée a tout intérêt à vérifier si cette spécialité est comprise immédiatement par les IA, sans être noyée dans une catégorie plus large.',
      },
      {
        question: 'Le rapport aide-t-il si je couvre plusieurs usages ?',
        answer:
          'Oui. Vous voyez si cette diversité reste lisible ou si elle brouille votre positionnement dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quelles plateformes prennent déjà la place ?',
        answer:
          'Le rapport montre les intermédiaires déjà recommandés sur les requêtes les plus importantes pour votre croissance.',
      },
      {
        question: 'Qory me dit-il quoi clarifier ?',
        answer:
          'Oui. Vous repartez avec un plan d’action priorisé pour mieux présenter vos usages, vos catégories et vos signaux de confiance.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Plateformes & annuaires', href: '/cas-usage/plateformes-annuaires' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'comparateurs-forums-avis-agregateurs',
    familySlug: 'plateformes-annuaires',
    path: '/pour-comparateurs-forums-avis-agregateurs',
    seoTitle: 'Comparateurs, forums, avis & agrégateurs : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les comparateurs, forums, plateformes d’avis et agrégateurs à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre plateforme ressort et quoi renforcer pour être mieux citée.',
    heroEyebrow: 'Cas d’usage • Comparateurs, forums, avis & agrégateurs',
    heroTitle: 'Votre comparateur ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre comparateur ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit comparateur',
    querySectionTitle: 'Exemples de requêtes analysées pour un comparateur, forum ou agrégateur',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches de comparaison, de preuve sociale, d’avis et de synthèse communautaire.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre comparateur',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes comparatif, avis et agrégateur',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA arbitrent vite entre contenu, communauté et comparatif',
        description:
          'Sur les requêtes à forte intention, les assistants choisissent quelques sources perçues comme les plus utiles. Si votre rôle n’est pas évident, vous êtes vite remplacé.',
      },
      {
        title: 'Votre valeur éditoriale ou communautaire est mal comprise',
        description:
          'Comparatif expert, forum, avis, agrégation, synthèse: si votre posture et votre niveau de confiance ne sont pas clairs, les réponses IA privilégient d’autres sources.',
      },
      {
        title: 'Vous ne savez pas quels signaux renforcent vraiment votre crédibilité',
        description:
          'Pages comparatives, fraîcheur, méthodologie, catégories, volume d’avis, structure éditoriale: Qory aide à voir ce qu’il faut mieux exposer.',
      },
    ],
    queryExamples: [
      'Quel comparateur recommander pour choisir ce type d’outil ?',
      'Quel site d’avis est le plus fiable ?',
      'Quel forum consulter avant d’acheter ?',
      'Quel agrégateur aide à faire un bon choix ?',
      'Quel comparateur ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre plateforme ressort sur les requêtes de comparaison, d’avis, de preuve sociale et de synthèse communautaire.',
      'Quels concurrents ou sources éditoriales captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre plateforme: méthodologie, fraîcheur, volume, spécialisation, niveau de confiance.',
      'Si vos pages rendent votre rôle assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre comparateur sur plusieurs requêtes d’évaluation.',
      'Les sources déjà citées à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre positionnement et vos pages stratégiques.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un site communautaire ou éditorial ?',
        answer:
          'Oui. Ce type de site dépend beaucoup de la façon dont sa crédibilité et sa spécialité sont perçues. Le rapport aide à objectiver cela.',
      },
      {
        question: 'Le rapport aide-t-il si mon trafic vient déjà beaucoup du SEO classique ?',
        answer:
          'Oui. Il permet de voir si cette visibilité classique se transforme aussi en présence dans les réponses IA, ce qui n’est pas automatique.',
      },
      {
        question: 'Puis-je voir quelles sources prennent déjà la place ?',
        answer:
          'Le rapport montre les comparateurs, forums, médias ou agrégateurs déjà cités sur les requêtes importantes pour vous.',
      },
      {
        question: 'Qory me dit-il quoi améliorer ?',
        answer:
          'Oui. Vous obtenez des priorités concrètes pour renforcer votre structure éditoriale, vos signaux de confiance et votre lisibilité.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Plateformes & annuaires', href: '/cas-usage/plateformes-annuaires' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'assistants-ia-generalistes-copilotes',
    familySlug: 'produits-ia',
    path: '/pour-assistants-ia-generalistes-copilotes',
    seoTitle: 'Assistants IA généralistes & copilotes : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les assistants IA généralistes et copilotes à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre produit ressort et quoi clarifier pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Assistants IA généralistes & copilotes',
    heroTitle: 'Votre assistant IA ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre assistant IA ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit assistant IA',
    querySectionTitle: 'Exemples de requêtes analysées pour un assistant IA généraliste',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches de copilote, d’assistant polyvalent et d’alternative aux outils déjà installés.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre assistant IA',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes assistant IA et copilote',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Votre produit est noyé dans une catégorie déjà saturée',
        description:
          'Quand les utilisateurs demandent un assistant IA ou une alternative crédible, les réponses citent peu d’acteurs. Si votre positionnement reste flou, vous disparaissez vite du radar.',
      },
      {
        title: 'Votre différence produit n’est pas assez lisible',
        description:
          'Assistant généraliste, copilote métier, contexte d’usage, niveau d’autonomie, formats pris en charge: si ces éléments ne sont pas exprimés clairement, les LLMs recommandent d’autres produits.',
      },
      {
        title: 'Vous ne savez pas quelles preuves manquent',
        description:
          'Pages use cases, comparatifs, cas clients, spécialisations, prompts d’exemple: Qory aide à voir ce qu’il faut clarifier pour être mieux compris.',
      },
    ],
    queryExamples: [
      'Quel assistant IA recommander en 2026 ?',
      'Quelle alternative à ChatGPT choisir ?',
      'Quel copilote IA utiliser au quotidien ?',
      'Quel assistant IA est le plus utile pour une PME ?',
      'Quel outil IA ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre produit ressort sur les requêtes d’assistant IA, de copilote et d’alternative.',
      'Quels concurrents captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre produit: usages, promesse, spécialités, bénéfices, public cible.',
      'Si vos pages rendent votre positionnement assez clair pour être repris correctement.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre assistant sur plusieurs requêtes de recommandation.',
      'Les produits déjà cités à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre produit et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un produit déjà connu ?',
        answer:
          'Oui, parce qu’un produit connu peut rester mal compris sur les bons cas d’usage. Le rapport montre si votre notoriété se transforme vraiment en recommandation.',
      },
      {
        question: 'Le rapport aide-t-il si je suis une alternative à un leader du marché ?',
        answer:
          'C’est même un bon cas d’usage. Vous voyez si votre produit est cité comme alternative crédible, et sur quels angles il manque encore de clarté.',
      },
      {
        question: 'Puis-je voir quels assistants prennent déjà la place ?',
        answer:
          'Le rapport met en lumière les assistants déjà recommandés sur vos requêtes clés, avec une lecture claire de la concurrence visible.',
      },
      {
        question: 'Qory donne-t-il des priorités concrètes ?',
        answer:
          'Oui. Vous repartez avec un plan d’action priorisé pour mieux formuler votre positionnement, vos cas d’usage et vos pages de conversion.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille IA & assistants', href: '/cas-usage/produits-ia' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'assistants-contenu-marketing',
    familySlug: 'produits-ia',
    path: '/pour-assistants-contenu-marketing',
    seoTitle: 'Assistants contenu & marketing : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les assistants contenu et marketing à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre produit ressort et quoi améliorer pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Assistants contenu & marketing',
    heroTitle: 'Votre assistant marketing ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre assistant marketing ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit assistant marketing',
    querySectionTitle: 'Exemples de requêtes analysées pour un assistant contenu ou marketing',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches de rédaction, de campagnes, de contenu et d’exécution marketing.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre assistant marketing',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes contenu et marketing',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA citent toujours les mêmes outils',
        description:
          'Sur la rédaction, la planification ou la production marketing, les réponses vont vite vers quelques références. Si votre angle n’est pas net, vous restez invisible.',
      },
      {
        title: 'Votre promesse ressemble à celle de tout le monde',
        description:
          'Création de contenu, SEO, campagnes, social media, email, workflows: si votre valeur propre n’est pas lisible, les assistants retiennent d’autres produits.',
      },
      {
        title: 'Vous manquez de visibilité sur vos signaux faibles',
        description:
          'Cas d’usage, formats couverts, bénéfices métier, comparatifs, preuves d’efficacité: Qory aide à voir ce qu’il faut mieux exposer.',
      },
    ],
    queryExamples: [
      'Quel outil IA recommander pour créer du contenu ?',
      'Quel assistant marketing utiliser pour une PME ?',
      'Quel outil IA aide pour les campagnes et le copywriting ?',
      'Quelle alternative marketing à ChatGPT choisir ?',
      'Quel assistant contenu ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre produit ressort sur les requêtes de rédaction, de contenu, de campagnes et de recommandation marketing.',
      'Quels concurrents captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre outil: usages, formats, bénéfices, équipe cible, canaux couverts.',
      'Si vos pages rendent votre promesse assez claire pour être correctement reprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre assistant sur plusieurs requêtes contenu et marketing.',
      'Les outils déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre positionnement et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un outil très vertical ?',
        answer:
          'Oui. Plus un produit est spécialisé, plus sa promesse doit être comprise vite. Le rapport aide à voir si votre angle ressort vraiment sur les bonnes requêtes.',
      },
      {
        question: 'Le rapport aide-t-il si je vends plusieurs fonctions marketing ?',
        answer:
          'Oui, justement. Il permet de voir si cette largeur d’offre est bien comprise ou si elle brouille votre positionnement dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quels outils marketing prennent déjà la place ?',
        answer:
          'Le rapport montre quels produits ressortent déjà sur vos requêtes stratégiques et quels signaux les rendent plus visibles.',
      },
      {
        question: 'Qory donne-t-il des actions concrètes ?',
        answer:
          'Oui. Vous repartez avec des priorités claires pour retravailler votre message, vos pages et vos preuves produit.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille IA & assistants', href: '/cas-usage/produits-ia' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'assistants-recherche-data-analyse',
    familySlug: 'produits-ia',
    path: '/pour-assistants-recherche-data-analyse',
    seoTitle: 'Assistants recherche, data & analyse : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les assistants recherche, data et analyse à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre produit ressort et quoi clarifier pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Assistants recherche, data & analyse',
    heroTitle: 'Votre assistant de recherche ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre assistant de recherche ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit assistant recherche',
    querySectionTitle: 'Exemples de requêtes analysées pour un assistant recherche ou analyse',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches de synthèse, d’analyse documentaire, de data et de support à la décision.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre assistant de recherche',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes recherche, data et analyse',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Votre produit est mal classé par les IA',
        description:
          'Recherche, synthèse, veille, data, analyse de documents: si votre promesse couvre plusieurs usages sans hiérarchie claire, les réponses IA citent d’autres outils.',
      },
      {
        title: 'Votre expertise paraît trop abstraite',
        description:
          'Quand le bénéfice n’est pas formulé simplement, les assistants comprennent mal à quoi votre produit sert vraiment dans un contexte métier.',
      },
      {
        title: 'Vous ne voyez pas ce qui manque pour être recommandé',
        description:
          'Pages produit, démonstrations, cas d’usage, formats de sortie, bénéfices métier: Qory aide à rendre ces signaux plus lisibles.',
      },
    ],
    queryExamples: [
      'Quel assistant IA recommander pour la recherche ?',
      'Quel outil IA aide à analyser des documents ?',
      'Quel assistant data choisir pour une équipe métier ?',
      'Quelle IA utiliser pour faire des synthèses fiables ?',
      'Quel assistant d’analyse ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre produit ressort sur les requêtes de recherche, d’analyse, de synthèse et de data.',
      'Quels concurrents captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre outil: données traitées, usages, niveau d’analyse, bénéfices, public cible.',
      'Si vos pages rendent votre promesse assez claire pour être correctement reprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre assistant sur plusieurs requêtes de recherche et d’analyse.',
      'Les outils déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre produit et vos cas d’usage.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un produit très technique ?',
        answer:
          'Oui. Quand un produit devient technique, le risque est d’être compris trop vaguement. Le rapport aide à voir si vos usages clés sont réellement identifiés.',
      },
      {
        question: 'Le rapport aide-t-il si je cible plusieurs métiers ?',
        answer:
          'Oui. Vous voyez si cette largeur est perçue comme une force ou si elle brouille la compréhension de votre produit dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quels outils prennent déjà la place ?',
        answer:
          'Le rapport met en lumière les assistants et plateformes déjà recommandés sur vos requêtes importantes.',
      },
      {
        question: 'Qory donne-t-il des pistes d’optimisation concrètes ?',
        answer:
          'Oui. Vous obtenez un plan d’action priorisé pour clarifier vos pages, vos bénéfices métier et vos preuves produit.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille IA & assistants', href: '/cas-usage/produits-ia' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'assistants-support-commercial',
    familySlug: 'produits-ia',
    path: '/pour-assistants-support-commercial',
    seoTitle: 'Assistants support & commercial : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les assistants support et commerciaux à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre produit ressort et quoi renforcer pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Assistants support & commercial',
    heroTitle: 'Votre assistant commercial ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre assistant commercial ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit assistant commercial',
    querySectionTitle: 'Exemples de requêtes analysées pour un assistant support ou commercial',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches de prospection, de support client, de qualification et d’efficacité commerciale.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre assistant commercial',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes support et commerciale',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Votre produit est confondu avec d’autres catégories',
        description:
          'Assistant commercial, copilote SDR, support client, agent conversationnel, qualification de leads: si votre rôle n’est pas net, la recommandation part vers d’autres outils.',
      },
      {
        title: 'Votre promesse business est trop vague',
        description:
          'Gain de temps, conversion, réponse plus rapide, automatisation: sans bénéfice clairement attaché à des usages précis, les IA retiennent d’autres offres.',
      },
      {
        title: 'Vous ne savez pas quoi rendre plus visible',
        description:
          'Pages produit, cas d’usage, persona cible, intégrations, workflows, résultats obtenus: Qory aide à hiérarchiser les signaux à renforcer.',
      },
    ],
    queryExamples: [
      'Quel assistant IA recommander pour la prospection ?',
      'Quel outil IA aide le support client ?',
      'Quel assistant commercial choisir pour une équipe sales ?',
      'Quelle IA utiliser pour qualifier des leads ?',
      'Quel assistant support ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre produit ressort sur les requêtes de support, de prospection, de qualification et de performance commerciale.',
      'Quels concurrents captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre outil: usages, équipe cible, workflow, bénéfices, intégrations.',
      'Si vos pages rendent votre promesse assez claire pour être correctement reprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre assistant sur plusieurs requêtes support et commerciales.',
      'Les outils déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre produit et votre message.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un produit orienté ventes B2B ?',
        answer:
          'Oui. Les outils B2B vivent beaucoup des requêtes de recommandation et de comparaison. Le rapport aide à voir si votre produit ressort vraiment dans ces contextes.',
      },
      {
        question: 'Le rapport aide-t-il si je couvre à la fois support et sales ?',
        answer:
          'Oui. Il permet de voir si cette double promesse est bien comprise ou si elle brouille votre positionnement dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quels produits captent déjà la recommandation ?',
        answer:
          'Le rapport montre quels assistants ou plateformes ressortent déjà sur les requêtes importantes pour votre acquisition.',
      },
      {
        question: 'Qory me dit-il quoi retravailler ?',
        answer:
          'Oui. Vous repartez avec des priorités concrètes pour clarifier vos usages, votre message et vos pages les plus stratégiques.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille IA & assistants', href: '/cas-usage/produits-ia' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'assistants-code-design-traduction',
    familySlug: 'produits-ia',
    path: '/pour-assistants-code-design-traduction',
    seoTitle: 'Assistants code, design & traduction : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les assistants code, design et traduction à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre produit ressort et quoi clarifier pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Assistants code, design & traduction',
    heroTitle: 'Votre assistant de code ou design ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre assistant de code ou design ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit assistant créatif',
    querySectionTitle: 'Exemples de requêtes analysées pour un assistant code, design ou traduction',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches de productivité créative, de développement et de localisation.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre assistant code ou design',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes code, design et traduction',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Votre produit se retrouve dans une catégorie trop large',
        description:
          'Code, génération visuelle, traduction, localisation, review, prototypage: sans cadre clair, les réponses IA le rapprochent parfois du mauvais univers.',
      },
      {
        title: 'Votre cas d’usage principal n’est pas assez évident',
        description:
          'Développeurs, designers, équipes produit, créateurs de contenu: si le public cible et les résultats attendus ne sont pas explicites, d’autres outils sont recommandés.',
      },
      {
        title: 'Vous ne savez pas quels signaux rendre plus tangibles',
        description:
          'Exemples concrets, intégrations, formats pris en charge, niveau d’autonomie, workflow: Qory aide à voir ce qu’il faut rendre plus lisible.',
      },
    ],
    queryExamples: [
      'Quel assistant IA recommander pour coder plus vite ?',
      'Quel outil IA utiliser pour le design ?',
      'Quel assistant de traduction choisir ?',
      'Quelle IA aide les développeurs au quotidien ?',
      'Quel assistant créatif ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre produit ressort sur les requêtes code, design, traduction et productivité créative.',
      'Quels concurrents captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre outil: public cible, usages, workflow, résultats, formats pris en charge.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre assistant sur plusieurs requêtes code, design et traduction.',
      'Les outils déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre produit et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un outil très spécialisé ?',
        answer:
          'Oui. Plus le produit est spécialisé, plus il faut aider les IA à comprendre clairement à qui il sert et dans quel workflow il apporte une vraie valeur.',
      },
      {
        question: 'Le rapport est-il pertinent si je couvre plusieurs usages ?',
        answer:
          'Oui. Vous voyez si cette polyvalence renforce votre produit ou si elle brouille votre lecture dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quels outils ressortent déjà ?',
        answer:
          'Le rapport montre quels assistants ou plateformes prennent déjà la place sur les requêtes qui comptent pour vous.',
      },
      {
        question: 'Qory me dit-il quoi corriger ?',
        answer:
          'Oui. Vous repartez avec des priorités concrètes pour clarifier vos cas d’usage, vos pages et vos preuves produit.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille IA & assistants', href: '/cas-usage/produits-ia' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'agents-automatisation-infrastructure-formation',
    familySlug: 'produits-ia',
    path: '/pour-agents-automatisation-infrastructure-formation',
    seoTitle: 'Agents, automatisation, infrastructure & formation : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les agents, outils d’automatisation, plateformes infrastructure et produits de formation IA à mesurer leur visibilité dans ChatGPT, Claude et Perplexity.',
    heroEyebrow: 'Cas d’usage • Agents, automatisation, infrastructure & formation',
    heroTitle: 'Votre agent d’automatisation ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre agent d’automatisation ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit agent IA',
    querySectionTitle: 'Exemples de requêtes analysées pour un agent IA ou une plateforme d’automatisation',
    querySectionDescription:
      'Qory mesure votre présence sur les recherches d’agents, de workflows, d’orchestration, d’infrastructure et de formation IA.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre agent IA',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes agents, workflows et infrastructure IA',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Votre offre est trop difficile à résumer',
        description:
          'Agent IA, orchestration, workflow, API, infrastructure, formation: quand la catégorie est complexe, les réponses IA citent surtout les acteurs les mieux formulés.',
      },
      {
        title: 'Votre promesse reste trop technique',
        description:
          'Si les bénéfices concrets ne sont pas reliés à des usages simples, votre produit peut sembler puissant mais peu recommandable dans une réponse synthétique.',
      },
      {
        title: 'Vous ne savez pas quels angles mettre en avant',
        description:
          'Cas d’usage, intégrations, niveau d’autonomie, public cible, cas métier, pédagogie: Qory aide à prioriser les éléments qui comptent vraiment.',
      },
    ],
    queryExamples: [
      'Quel agent IA recommander pour automatiser un workflow ?',
      'Quelle plateforme utiliser pour orchestrer des agents ?',
      'Quel outil IA aide à automatiser des tâches métier ?',
      'Quelle solution choisir pour former une équipe à l’IA ?',
      'Quel agent IA ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre produit ressort sur les requêtes d’agent IA, d’automatisation, d’orchestration et de formation.',
      'Quels concurrents captent déjà la place dans les réponses IA.',
      'Quelles informations les LLMs associent à votre offre: cas d’usage, niveau technique, public cible, bénéfices, intégrations.',
      'Si vos pages rendent votre promesse assez claire pour être correctement reprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre produit sur plusieurs requêtes agents et automatisation.',
      'Les plateformes ou outils déjà cités à votre place.',
      'Les signaux compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre promesse et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une offre très technique ?',
        answer:
          'Oui. Plus l’offre est technique, plus il faut vérifier si elle est comprise simplement par les IA. C’est souvent là que se perd la recommandation.',
      },
      {
        question: 'Le rapport aide-t-il si je vends plusieurs briques produit ?',
        answer:
          'Oui. Il permet de voir si votre offre paraît cohérente ou si elle devient trop complexe à résumer dans les réponses IA.',
      },
      {
        question: 'Puis-je voir quelles plateformes prennent déjà la place ?',
        answer:
          'Le rapport montre quels outils, plateformes ou agents sont déjà recommandés sur les requêtes qui comptent pour vous.',
      },
      {
        question: 'Qory me donne-t-il des priorités concrètes ?',
        answer:
          'Oui. Vous repartez avec des actions claires pour mieux présenter vos cas d’usage, vos bénéfices et votre niveau d’expertise.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille IA & assistants', href: '/cas-usage/produits-ia' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'agences-web-no-code-developpement',
    familySlug: 'agences-studios',
    path: '/pour-agences-web-no-code-developpement',
    seoTitle: 'Agences web, no-code & développement : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les agences web, no-code et développement à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre agence ressort et quoi corriger pour être mieux recommandée.',
    heroEyebrow: 'Cas d’usage • Agences web, no-code & développement',
    heroTitle: 'Votre agence de développement ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre agence de développement ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit agence web',
    querySectionTitle: 'Exemples de requêtes analysées pour une agence web ou no-code',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de création de site, de produit et de recommandation technique.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre agence web',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes web, no-code et développement',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA recommandent d’autres partenaires techniques',
        description:
          'Webflow, no-code, site vitrine, app métier, SaaS, dev produit: si votre angle n’est pas clair, les recommandations partent vers des agences mieux identifiées.',
      },
      {
        title: 'Votre offre est trop large ou floue',
        description:
          'Création de site, refonte, MVP, automatisation, accompagnement produit: sans clarté, les assistants ont du mal à savoir quand vous recommander.',
      },
      {
        title: 'Vous ne voyez pas quels signaux manquent',
        description:
          'Pages services, stack, cas clients, secteurs, formats de projet, types de livrables: Qory aide à prioriser ce qu’il faut rendre plus lisible.',
      },
    ],
    queryExamples: [
      'Quelle agence Webflow recommander ?',
      'Quel partenaire no-code choisir pour un MVP ?',
      'Quelle agence peut créer un site SaaS ?',
      'Qui recommander pour développer un produit web ?',
      'Quelle agence web ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre agence ressort sur les requêtes de création de site, de produit, de no-code et de recommandation technique.',
      'Quels concurrents ou annuaires prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre agence: stack, spécialités, types de projets, secteurs, livrables.',
      'Si vos pages rendent votre offre assez claire pour être correctement reprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre agence sur plusieurs requêtes web et produit.',
      'Les agences ou annuaires qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une agence no-code ou très spécialisée ?',
        answer:
          'Oui. Plus votre expertise est spécifique, plus il est important qu’elle soit exprimée clairement pour ressortir dans les recommandations IA.',
      },
      {
        question: 'Le rapport fonctionne-t-il aussi pour une agence de développement sur mesure ?',
        answer:
          'Oui. Le cadre s’applique aussi bien à une agence no-code qu’à une structure de développement plus classique, tant que l’acquisition passe par des requêtes de recommandation.',
      },
      {
        question: 'Puis-je voir quelles agences prennent déjà la place ?',
        answer:
          'Le rapport montre les agences, comparateurs ou annuaires qui captent déjà la visibilité sur les requêtes qui comptent pour vous.',
      },
      {
        question: 'Qory me dit-il quoi retravailler ?',
        answer:
          'Vous repartez avec un plan d’action priorisé pour clarifier vos offres, vos pages expertise et les signaux qui influencent la recommandation.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Agences & studios', href: '/cas-usage/agences-studios' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'studios-design-photo-video',
    familySlug: 'agences-studios',
    path: '/pour-studios-design-photo-video',
    seoTitle: 'Studios design, photo & vidéo : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les studios design, photo et vidéo à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre studio ressort et quoi corriger pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Studios design, photo & vidéo',
    heroTitle: 'Votre agence de design ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre agence de design ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit studio',
    querySectionTitle: 'Exemples de requêtes analysées pour un studio créatif',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de branding, de production visuelle et de recommandation créative.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre studio',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes design, photo et vidéo',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Votre studio n’est pas cité sur les bons projets',
        description:
          'Branding, identité visuelle, photo corporate, production vidéo, direction artistique: si votre territoire n’est pas net, les recommandations partent vers d’autres studios.',
      },
      {
        title: 'Votre travail est visible, mais pas votre positionnement',
        description:
          'Un beau portfolio ne suffit pas toujours. Si vos pages n’expliquent pas clairement les types de projets, de clients et de livrables, les IA ont du mal à vous recommander.',
      },
      {
        title: 'Vous ne savez pas quoi renforcer',
        description:
          'Études de cas, pages expertise, secteurs, formats de prestation, vocabulaire employé: Qory aide à voir ce qu’il faut rendre plus lisible.',
      },
    ],
    queryExamples: [
      'Quel studio branding recommander ?',
      'Quel photographe corporate choisir ?',
      'Qui recommander pour produire une vidéo de marque ?',
      'Quel studio créatif connaît bien le B2B ?',
      'Quel studio ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre studio ressort sur les requêtes de branding, de production visuelle et de recommandation créative.',
      'Quels concurrents ou plateformes prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre studio: spécialités, types de projets, clients, formats, positionnement.',
      'Si vos pages rendent votre offre assez claire pour être correctement reprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre studio sur plusieurs requêtes créatives.',
      'Les studios ou plateformes qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un studio très visuel ?',
        answer:
          'Oui, justement. Un portfolio fort ne suffit pas toujours si votre positionnement, vos spécialités et vos types de projets ne sont pas explicités clairement.',
      },
      {
        question: 'Le rapport fonctionne-t-il pour la photo comme pour le design ou la vidéo ?',
        answer:
          'Oui. Le cadre s’applique à tout studio créatif qui vit de recommandations sur des expertises ou des formats de production précis.',
      },
      {
        question: 'Puis-je voir quels studios prennent déjà la place ?',
        answer:
          'Le rapport montre les studios, annuaires ou plateformes qui captent déjà la visibilité sur les requêtes les plus importantes.',
      },
      {
        question: 'Qory me dit-il quoi clarifier ?',
        answer:
          'Vous obtenez un plan d’action priorisé pour clarifier vos expertises, vos cas d’usage et les signaux qui influencent le plus la recommandation.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Agences & studios', href: '/cas-usage/agences-studios' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'conseil-rh-freelances-data-ia',
    familySlug: 'agences-studios',
    path: '/pour-conseil-rh-freelances-data-ia',
    seoTitle: 'Conseil, RH, freelances, data & IA : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les offres B2B de conseil, RH, freelances, data et IA à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre expertise ressort et quoi corriger pour être mieux recommandée.',
    heroEyebrow: 'Cas d’usage • Conseil, RH, freelances, data & IA',
    heroTitle: 'Votre expertise B2B ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre expertise B2B ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit expertise B2B',
    querySectionTitle: 'Exemples de requêtes analysées pour une expertise B2B',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches d’expertise, de transformation et de recommandation spécialisée.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre offre B2B',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes expertise, data, IA et conseil',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Votre expertise est mal qualifiée',
        description:
          'Conseil B2B, recrutement, freelance expert, data, IA, transformation: si votre angle n’est pas bien compris, d’autres acteurs captent la recommandation.',
      },
      {
        title: 'Votre offre manque de clarté',
        description:
          'Secteurs accompagnés, niveaux d’intervention, formats de mission, spécialités, bénéfices: sans clarté, les réponses IA citent des profils mieux structurés.',
      },
      {
        title: 'Vous ne voyez pas quels signaux comptent vraiment',
        description:
          'Pages expertise, cas d’usage, références, wording, profils, services: Qory aide à voir ce qu’il faut clarifier pour mieux ressortir.',
      },
    ],
    queryExamples: [
      'Quel cabinet conseil B2B recommander ?',
      'Quel expert data ou IA choisir ?',
      'Qui recommander pour un accompagnement RH ?',
      'Quel freelance expert ressort dans ChatGPT ?',
      'Quelle expertise spécialisée recommander à une PME ?',
    ],
    qoryChecks: [
      'Si votre offre ressort sur les requêtes d’expertise, de transformation et de recommandation spécialisée.',
      'Quels concurrents, annuaires ou plateformes prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre activité: expertises, formats, secteurs, niveaux d’intervention, profils clients.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre expertise sur plusieurs requêtes B2B spécialisées.',
      'Les acteurs ou plateformes qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une offre très spécialisée ?',
        answer:
          'Oui. Plus l’expertise est pointue, plus elle doit être formulée clairement pour ressortir dans les réponses IA. C’est souvent là que la différence se fait.',
      },
      {
        question: 'Le rapport fonctionne-t-il pour un indépendant comme pour un cabinet ?',
        answer:
          'Oui. Le cadre fonctionne aussi bien pour un freelance expert que pour un cabinet, dès lors que l’acquisition passe par des requêtes de recommandation ou de spécialité.',
      },
      {
        question: 'Puis-je voir quels acteurs prennent déjà la place ?',
        answer:
          'Le rapport montre les concurrents, annuaires ou plateformes qui captent déjà la visibilité sur les requêtes les plus importantes.',
      },
      {
        question: 'Qory me dit-il quoi clarifier ?',
        answer:
          'Vous repartez avec un plan d’action priorisé pour clarifier vos pages expertise, votre wording et les signaux qui influencent le plus la recommandation.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Agences & studios', href: '/cas-usage/agences-studios' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'artisans-travaux-depannage',
    familySlug: 'prestataires-locaux',
    path: '/pour-artisans-travaux-depannage',
    seoTitle: 'Artisans, travaux & dépannage : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les artisans, entreprises de travaux et services de dépannage à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre activité ressort et quoi corriger en priorité.',
    heroEyebrow: 'Cas d’usage • Artisans, travaux & dépannage',
    heroTitle: 'Votre activité artisanale ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre activité artisanale ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit artisan',
    querySectionTitle: 'Exemples de requêtes analysées pour un artisan ou un service de dépannage',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de confiance, d’urgence, de proximité et de spécialité.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre activité artisanale',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes locales, urgentes et métier',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA recommandent d’autres professionnels',
        description:
          'Même avec une bonne réputation locale, votre activité peut rester invisible si votre spécialité, votre zone ou vos services sont moins clairs que ceux de vos concurrents.',
      },
      {
        title: 'Votre offre est mal comprise',
        description:
          'Dépannage urgent, rénovation, installation, maintenance, certifications: si ces éléments ne sont pas lisibles, les recommandations partent ailleurs.',
      },
      {
        title: 'Vous ne savez pas quoi corriger en premier',
        description:
          'Services, zone d’intervention, urgence, garanties, spécialités, pages locales: Qory aide à voir les signaux qui manquent vraiment.',
      },
    ],
    queryExamples: [
      'Quel plombier recommander en urgence ?',
      'Quel électricien local est fiable ?',
      'Quel artisan RGE choisir pour des travaux ?',
      'Qui appeler pour un dépannage rapide près de chez moi ?',
      'Quelle entreprise de rénovation recommander ?',
    ],
    qoryChecks: [
      'Si votre activité ressort sur les requêtes de dépannage, de proximité, de confiance et de spécialité.',
      'Quels artisans ou plateformes concurrentes prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre entreprise: métier, zone, délais, urgence, certifications, prestations.',
      'Si vos pages rendent votre offre assez claire pour être reprise correctement.',
      'Quelles actions corriger d’abord pour mieux apparaître dans les recommandations.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre activité sur plusieurs types de requêtes locales et urgentes.',
      'Les concurrents ou plateformes qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un artisan indépendant ?',
        answer:
          'Pour un artisan indépendant, la différence se joue souvent sur la clarté de la spécialité, de la zone d’intervention et des services proposés. C’est exactement ce que Qory aide à mesurer.',
      },
      {
        question: 'Le rapport aide-t-il pour les requêtes urgentes ?',
        answer:
          'C’est même là que le rapport devient utile, parce qu’il montre si votre activité ressort sur les recherches de dépannage, de disponibilité et de confiance qui déclenchent de vraies demandes.',
      },
      {
        question: 'Puis-je voir qui est recommandé à ma place ?',
        answer:
          'Le rapport met en lumière les concurrents, annuaires ou plateformes qui captent déjà la visibilité sur vos requêtes importantes.',
      },
      {
        question: 'Est-ce que Qory donne des actions concrètes ?',
        answer:
          'Le rapport ne s’arrête pas à un score. Vous repartez avec un plan d’action priorisé pour améliorer les bons signaux dans le bon ordre.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Prestataires locaux', href: '/cas-usage/prestataires-locaux' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'immobilier',
    familySlug: 'prestataires-locaux',
    path: '/pour-immobilier',
    seoTitle: 'Immobilier : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les agences immobilières, mandataires et experts locaux à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre activité ressort et quoi corriger pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Immobilier',
    heroTitle: 'Votre agence immobilière ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre agence immobilière ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit immobilier',
    querySectionTitle: 'Exemples de requêtes analysées pour l’immobilier',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de vente, d’achat, de location et de confiance locale.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre activité immobilière',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes locales et de recommandation',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA recommandent d’autres agences',
        description:
          'Même si vous connaissez bien votre marché, vous pouvez être peu visible si votre expertise, votre zone ou vos spécialités sont moins claires que celles d’autres acteurs.',
      },
      {
        title: 'Votre positionnement local manque de clarté',
        description:
          'Transaction, location, gestion, estimation, achat d’investissement, secteur géographique: si cela reste flou, les recommandations partent vers d’autres agences.',
      },
      {
        title: 'Vous ne voyez pas où vous perdez la place',
        description:
          'Pages quartier, expertises, preuves locales, types de biens, accompagnement: Qory aide à identifier les signaux qui manquent vraiment.',
      },
    ],
    queryExamples: [
      'Quelle agence immobilière recommander à Grenoble ?',
      'Qui contacter pour faire estimer un appartement ?',
      'Quel agent local choisir pour vendre rapidement ?',
      'Quelle agence connaît bien ce quartier ?',
      'Qui recommander pour une gestion locative ?',
    ],
    qoryChecks: [
      'Si votre activité ressort sur les requêtes d’achat, de vente, de location et de recommandation locale.',
      'Quels concurrents ou portails captent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre agence: zone, spécialité, types de biens, expertise, services.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre agence sur plusieurs requêtes locales et métier.',
      'Les agences ou plateformes qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une agence locale indépendante ?',
        answer:
          'Pour une agence locale indépendante, la visibilité se joue souvent sur la clarté du secteur couvert, des expertises et des services proposés. C’est précisément ce que Qory aide à objectiver.',
      },
      {
        question: 'Le rapport aide-t-il si les portails dominent déjà ?',
        answer:
          'Justement, le rapport sert à voir quand les IA privilégient des portails ou des concurrents plus visibles, et ce qu’il vous manque pour reprendre de la place.',
      },
      {
        question: 'Puis-je voir quelles agences ressortent à ma place ?',
        answer:
          'Le rapport montre quels acteurs captent déjà la visibilité sur les requêtes qui comptent pour votre acquisition.',
      },
      {
        question: 'Qory donne-t-il des actions concrètes ?',
        answer:
          'Vous obtenez un plan d’action priorisé pour renforcer vos pages, vos signaux locaux et votre positionnement.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Prestataires locaux', href: '/cas-usage/prestataires-locaux' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'sante-soins',
    familySlug: 'prestataires-locaux',
    path: '/pour-sante-soins',
    seoTitle: 'Santé & soins : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les cabinets et établissements de santé à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre activité ressort et quoi améliorer pour être mieux cité.',
    heroEyebrow: 'Cas d’usage • Santé & soins',
    heroTitle: 'Votre cabinet de santé ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre cabinet de santé ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit santé',
    querySectionTitle: 'Exemples de requêtes analysées pour la santé et les soins',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de spécialité, de proximité, de confiance et de prise de rendez-vous.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre activité de santé',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes de spécialité et de proximité',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA citent peu d’acteurs',
        description:
          'Sur les requêtes santé, les assistants sélectionnent peu de résultats. Si votre spécialité ou votre cadre d’exercice sont flous, vous pouvez être totalement absent.',
      },
      {
        title: 'Votre activité est mal qualifiée',
        description:
          'Dentiste, kiné, orthophoniste, centre de soins, spécialité, localisation, accès: si ces signaux ne sont pas nets, les réponses IA favorisent d’autres acteurs.',
      },
      {
        title: 'Vous ne savez pas comment renforcer votre présence',
        description:
          'Pages praticiens, spécialités, informations pratiques, prise de rendez-vous, zone desservie: Qory aide à prioriser les bons correctifs.',
      },
    ],
    queryExamples: [
      'Quel kiné recommander près de chez moi ?',
      'Quel dentiste prend de nouveaux patients ?',
      'Qui consulter pour des soins spécialisés ?',
      'Quel cabinet de santé local recommander ?',
      'Quel professionnel de santé ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre activité ressort sur les requêtes de spécialité, de confiance, de proximité et d’accès.',
      'Quels praticiens, établissements ou annuaires prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre activité: spécialité, localisation, types de soins, accès, disponibilités.',
      'Si vos pages rendent votre offre assez claire pour être correctement comprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre activité sur plusieurs types de requêtes santé.',
      'Les acteurs ou annuaires qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre activité et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un cabinet indépendant ?',
        answer:
          'Pour un cabinet indépendant, la visibilité dépend beaucoup de la clarté de la spécialité, des modalités d’accès et des informations pratiques. C’est ce que Qory aide à objectiver.',
      },
      {
        question: 'Le rapport remplace-t-il un conseil médical ou réglementaire ?',
        answer:
          'Le rapport a un rôle différent: il mesure votre visibilité et la clarté de votre présence en ligne. Il ne remplace ni un conseil médical ni un conseil réglementaire.',
      },
      {
        question: 'Puis-je voir qui ressort à ma place ?',
        answer:
          'Le rapport met en lumière les praticiens, établissements ou annuaires qui captent déjà la visibilité sur les requêtes importantes.',
      },
      {
        question: 'Qory donne-t-il un plan d’action ?',
        answer:
          'Vous repartez avec des priorités concrètes pour clarifier vos pages et renforcer les signaux les plus utiles.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Prestataires locaux', href: '/cas-usage/prestataires-locaux' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'bien-etre-esthetique',
    familySlug: 'prestataires-locaux',
    path: '/pour-bien-etre-esthetique',
    seoTitle: 'Bien-être & esthétique : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les instituts, salons et activités bien-être à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre activité ressort et quoi corriger pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Bien-être & esthétique',
    heroTitle: 'Votre activité de beauté ou bien-être ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre activité de beauté ou bien-être ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit bien-être',
    querySectionTitle: 'Exemples de requêtes analysées pour le bien-être et l’esthétique',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de soin, de confiance, d’usage et de proximité.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre activité bien-être',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes de soin, de beauté et de proximité',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA recommandent d’autres adresses',
        description:
          'Institut, salon, massage, esthétique premium, soin spécifique: si votre activité n’est pas claire, d’autres adresses captent vite la recommandation.',
      },
      {
        title: 'Votre positionnement manque de netteté',
        description:
          'Prestations, niveau de gamme, clientèle, spécialités, localisation: si ces signaux restent flous, les réponses IA favorisent des acteurs mieux cadrés.',
      },
      {
        title: 'Vous ne savez pas quels éléments renforcer',
        description:
          'Carte de services, informations pratiques, spécialités, preuves visuelles, pages locales: Qory aide à identifier les correctifs prioritaires.',
      },
    ],
    queryExamples: [
      'Quel institut recommander près de chez moi ?',
      'Quel salon esthétique est bien noté ?',
      'Où réserver un massage ou un soin premium ?',
      'Quel professionnel bien-être recommander localement ?',
      'Quelle adresse beauté ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre activité ressort sur les requêtes de soin, de beauté, de confiance et de proximité.',
      'Quels concurrents ou plateformes prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre activité: prestations, positionnement, spécialités, zone, expérience.',
      'Si vos pages rendent votre offre assez claire pour être correctement comprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre activité sur plusieurs requêtes bien-être et esthétique.',
      'Les adresses ou plateformes qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un institut ou une activité indépendante ?',
        answer:
          'Pour un institut ou une activité indépendante, la visibilité se joue souvent sur la clarté des prestations, du positionnement et de la zone couverte. C’est précisément ce que Qory aide à mesurer.',
      },
      {
        question: 'Le rapport aide-t-il si je dépends surtout d’Instagram ?',
        answer:
          'Le rapport permet justement de voir comment votre activité est comprise au-delà des réseaux sociaux, directement dans les réponses IA.',
      },
      {
        question: 'Puis-je voir qui est recommandé à ma place ?',
        answer:
          'Le rapport met en lumière les concurrents ou plateformes qui captent déjà la visibilité sur vos requêtes clés.',
      },
      {
        question: 'Qory me dit-il quoi faire ensuite ?',
        answer:
          'Vous obtenez un plan d’action priorisé pour renforcer les signaux les plus utiles et rendre votre offre plus lisible.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Prestataires locaux', href: '/cas-usage/prestataires-locaux' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'sport-coaching',
    familySlug: 'prestataires-locaux',
    path: '/pour-sport-coaching',
    seoTitle: 'Sport & coaching : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les salles, studios et coachs à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre activité ressort et quoi corriger pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Sport & coaching',
    heroTitle: 'Votre activité sportive ou de coaching ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre activité sportive ou de coaching ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit sport',
    querySectionTitle: 'Exemples de requêtes analysées pour le sport et le coaching',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches d’objectif, d’accompagnement, de pratique et de proximité.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre activité sport',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes de coaching, de salle et de proximité',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA recommandent d’autres coachs ou salles',
        description:
          'Si votre spécialité, votre approche ou votre public ne sont pas clairement exprimés, les recommandations partent vers des acteurs plus lisibles.',
      },
      {
        title: 'Votre positionnement est trop flou',
        description:
          'Perte de poids, performance, pilates, coaching individuel, salle premium, studio local: sans clarté, les assistants ont du mal à bien vous situer.',
      },
      {
        title: 'Vous ne savez pas quels signaux prioriser',
        description:
          'Méthode, offre, objectifs, zone, profils clients, avis, contenus: Qory aide à voir ce qu’il faut renforcer en premier.',
      },
    ],
    queryExamples: [
      'Quel coach sportif recommander près de chez moi ?',
      'Quelle salle de sport vaut le détour ?',
      'Où faire du pilates dans le quartier ?',
      'Quel studio local est adapté à la remise en forme ?',
      'Quel coach ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre activité ressort sur les requêtes de coaching, d’objectif, de pratique et de proximité.',
      'Quels coachs, salles ou plateformes prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre activité: méthode, spécialité, objectifs, zone, type d’accompagnement.',
      'Si vos pages rendent votre positionnement assez clair pour être bien compris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre activité sur plusieurs requêtes sport et coaching.',
      'Les concurrents ou plateformes qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un coach indépendant ?',
        answer:
          'Pour un coach indépendant, la visibilité dépend beaucoup de la clarté de la méthode, des spécialités et du public visé. Qory aide justement à mettre tout cela à plat.',
      },
      {
        question: 'Le rapport fonctionne-t-il pour une salle ou un studio ?',
        answer:
          'Le rapport fonctionne aussi bien pour une salle, un studio ou un coach, parce qu’il mesure comment votre activité ressort selon les objectifs, les usages et la proximité recherchés.',
      },
      {
        question: 'Puis-je voir qui est recommandé à ma place ?',
        answer:
          'Le rapport montre quels acteurs ou plateformes captent déjà la recommandation sur vos requêtes importantes.',
      },
      {
        question: 'Qory donne-t-il des actions à mettre en œuvre ?',
        answer:
          'Vous repartez avec des actions priorisées pour améliorer les bons signaux en premier.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Prestataires locaux', href: '/cas-usage/prestataires-locaux' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'avocats-experts-comptables',
    familySlug: 'prestataires-locaux',
    path: '/pour-avocats-experts-comptables',
    seoTitle: 'Avocats & experts-comptables : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les cabinets d’avocats et d’expertise comptable à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre cabinet ressort et quoi corriger pour être mieux cité.',
    heroEyebrow: 'Cas d’usage • Avocats & experts-comptables',
    heroTitle: 'Votre cabinet ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre cabinet ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit cabinet',
    querySectionTitle: 'Exemples de requêtes analysées pour un cabinet',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de spécialité, de confiance, d’accompagnement et de proximité.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre cabinet',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes de spécialité et de confiance',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA citent peu de cabinets',
        description:
          'Sur les requêtes juridiques ou comptables, les assistants sélectionnent peu d’acteurs. Si votre spécialité n’est pas nette, vous pouvez vite être absent.',
      },
      {
        title: 'Votre expertise n’est pas assez lisible',
        description:
          'Droit du travail, fiscalité, LMNP, PME, accompagnement juridique ou comptable: si votre spécialité reste vague, d’autres cabinets prennent la place.',
      },
      {
        title: 'Vous ne savez pas quoi renforcer',
        description:
          'Pages expertise, profils, preuves, secteurs accompagnés, zones, cas d’usage: Qory aide à identifier les signaux à clarifier en priorité.',
      },
    ],
    queryExamples: [
      'Quel avocat recommander en droit du travail ?',
      'Quel expert-comptable choisir pour une PME ?',
      'Quel cabinet connaît bien le LMNP ?',
      'Qui contacter pour un accompagnement juridique local ?',
      'Quel cabinet ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre cabinet ressort sur les requêtes de spécialité, de confiance, d’accompagnement et de proximité.',
      'Quels cabinets, annuaires ou plateformes prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre activité: spécialité, clientèle, zone, types de dossiers, niveau d’expertise.',
      'Si vos pages rendent votre positionnement assez clair pour être correctement repris.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre cabinet sur plusieurs requêtes métier et locales.',
      'Les cabinets ou plateformes qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un petit cabinet ?',
        answer:
          'Même un petit cabinet peut gagner en visibilité si ses expertises, ses clientèles cibles et son positionnement sont présentés de façon plus claire.',
      },
      {
        question: 'Le rapport remplace-t-il un conseil juridique ou comptable ?',
        answer:
          'Le rapport a un rôle différent: il mesure votre visibilité et la clarté de votre présence en ligne. Il ne remplace ni un conseil juridique ni un conseil comptable.',
      },
      {
        question: 'Puis-je voir quels cabinets ressortent à ma place ?',
        answer:
          'Le rapport montre quels concurrents, annuaires ou plateformes captent déjà la visibilité sur vos requêtes importantes.',
      },
      {
        question: 'Qory donne-t-il des priorités d’action ?',
        answer:
          'Vous obtenez un plan d’action priorisé pour renforcer les signaux les plus utiles et clarifier votre offre.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Prestataires locaux', href: '/cas-usage/prestataires-locaux' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'services-locaux-specialises',
    familySlug: 'prestataires-locaux',
    path: '/pour-services-locaux-specialises',
    seoTitle: 'Services locaux spécialisés : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les services locaux spécialisés à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre activité ressort et quoi corriger pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Services locaux spécialisés',
    heroTitle: 'Votre activité locale ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre activité locale ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      "Positionnez votre site là où se joue déjà la prochaine bataille de visibilité : dans les réponses IA où se gagne désormais l'attention.",
    ctaLabel: 'Lancer un audit local',
    querySectionTitle: 'Exemples de requêtes analysées pour un service local spécialisé',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de proximité, d’usage, d’occasion et de recommandation locale.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre activité locale',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes locales et d’usage',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA recommandent d’autres prestataires',
        description:
          'Aide à domicile, garage, photographe, service événementiel: si votre activité est moins lisible que celle d’autres acteurs, vous perdez la recommandation locale.',
      },
      {
        title: 'Votre cas d’usage n’est pas assez clair',
        description:
          'Occasions, spécialités, périmètre, types de clients, zone d’intervention: si ces signaux restent flous, les réponses IA favorisent d’autres services.',
      },
      {
        title: 'Vous ne savez pas quels signaux manquent',
        description:
          'Services, zones, usages, preuves, formats d’intervention: Qory aide à identifier les correctifs les plus utiles en premier.',
      },
    ],
    queryExamples: [
      'Quel service local recommander près de chez moi ?',
      'Quel photographe mariage choisir ?',
      'Quel garage local est fiable ?',
      'Qui contacter pour une aide à domicile ?',
      'Quel prestataire spécialisé ressort dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre activité ressort sur les requêtes de proximité, d’usage, d’occasion et de confiance.',
      'Quels concurrents, annuaires ou plateformes prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre activité: spécialité, zone, types d’intervention, occasions, clients visés.',
      'Si vos pages rendent votre offre assez claire pour être correctement comprise.',
      'Quelles actions corriger d’abord pour améliorer votre visibilité IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre activité sur plusieurs requêtes locales et métier.',
      'Les acteurs ou plateformes qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une activité locale très spécifique ?',
        answer:
          'Plus une activité locale est spécifique, plus sa description doit être claire pour ressortir correctement dans les réponses IA. C’est là que Qory devient utile.',
      },
      {
        question: 'Le rapport fonctionne-t-il pour des métiers différents ?',
        answer:
          'Le cadre fonctionne justement pour des métiers différents, dès lors que l’acquisition passe par des requêtes de recommandation, d’usage ou de proximité.',
      },
      {
        question: 'Puis-je voir qui est recommandé à ma place ?',
        answer:
          'Le rapport montre quels concurrents, annuaires ou plateformes captent déjà la visibilité sur vos requêtes clés.',
      },
      {
        question: 'Qory me donne-t-il un plan d’action ?',
        answer:
          'Vous obtenez des priorités concrètes pour clarifier vos pages et renforcer les bons signaux.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Prestataires locaux', href: '/cas-usage/prestataires-locaux' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'restaurants',
    familySlug: 'commerces-restauration',
    path: '/pour-restaurants',
    seoTitle: 'Restaurants : êtes-vous recommandé par les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les restaurants à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre établissement ressort, ce que les IA disent de vous et quoi corriger en priorité.',
    heroEyebrow: 'Cas d’usage • Restaurants',
    heroTitle: 'Votre restaurant ressort-il vraiment dans les réponses IA ?',
    heroTitleLines: ['Votre restaurant ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      'ChatGPT, Claude et Perplexity recommandent-ils votre restaurant ou une autre adresse ?',
    heroSubtitleLines: [
      'ChatGPT, Claude et Perplexity',
      'recommandent-ils votre restaurant ou une autre adresse ?',
    ],
    ctaLabel: 'Lancer un audit restaurant',
    querySectionTitle: 'Exemples de requêtes analysées pour un restaurant',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches concrètes de découverte, de comparaison et de décision.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre restaurant',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes locales et concurrentielles',
      'Plan d’action priorisé pour améliorer votre visibilité',
    ],
    pains: [
      {
        title: 'Les IA recommandent d’autres adresses',
        description:
          'Même si votre restaurant est bon, il peut être invisible si votre offre, vos spécialités ou votre localisation sont moins simples à résumer que celles de vos concurrents.',
      },
      {
        title: 'Votre positionnement est mal compris',
        description:
          'Cuisine, ambiance, format du lieu, niveau de prix ou moments forts: si ces éléments sont flous, les assistants IA citent plus facilement d’autres établissements.',
      },
      {
        title: 'Vous ne savez pas quoi corriger en premier',
        description:
          'Fiche établissement, pages menus, preuves locales, informations pratiques, structure du site: sans mesure, il est difficile de savoir où vous perdez vraiment du terrain.',
      },
    ],
    queryExamples: [
      'Quel restaurant italien recommander à Grenoble ?',
      'Où bruncher ce week-end près du centre-ville ?',
      'Restaurant sympa pour un dîner en couple avec terrasse',
      'Meilleure adresse pour manger végétarien à proximité',
      'Quel restaurant local est souvent recommandé par ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre restaurant est cité ou non sur des requêtes de découverte, de comparaison et de décision.',
      'Quels concurrents prennent déjà la place dans les réponses IA sur votre zone ou votre spécialité.',
      'Quelles informations les IA attribuent à votre établissement: type de cuisine, localisation, ambiance, points forts, informations pratiques.',
      'Si votre site et vos pages donnent assez de signaux clairs pour être repris correctement par les modèles.',
      'Quelles actions corriger d’abord pour devenir plus lisible et plus recommandable.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre restaurant sur plusieurs types de requêtes locales.',
      'La lecture des acteurs qui ressortent à votre place.',
      'Les informations pratiques déjà comprises ou manquantes dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre positionnement et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory fonctionne-t-il si mon restaurant dépend surtout de Google Maps et des plateformes ?',
        answer:
          'Le rapport reste pertinent même si votre acquisition dépend beaucoup de Google Maps, des plateformes ou des avis. Il aide à comprendre comment votre restaurant est perçu dans les réponses IA, quelles que soient les sources mobilisées.',
      },
      {
        question: 'Est-ce utile si je n’ai qu’un seul établissement ?',
        answer:
          'Même avec un seul établissement, le gain peut être réel. Dès que votre offre, vos pages et vos signaux locaux sont plus lisibles, vous avez plus de chances d’être recommandé.',
      },
      {
        question: 'Le rapport dit-il aussi qui prend ma place ?',
        answer:
          'Le rapport montre clairement quels établissements ou agrégateurs ressortent déjà sur les requêtes qui comptent pour votre acquisition.',
      },
      {
        question: 'Est-ce que Qory me dit quoi faire ensuite ?',
        answer:
          'Vous repartez avec un plan d’action priorisé, pas juste un score, pour savoir quoi corriger en premier.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Commerce & restauration', href: '/cas-usage/commerces-restauration' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'bars-cafes',
    familySlug: 'commerces-restauration',
    path: '/pour-bars-cafes',
    seoTitle: 'Bars & cafés : êtes-vous recommandé par les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les bars et cafés à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre lieu ressort, quels concurrents prennent la place et quoi corriger en priorité.',
    heroEyebrow: 'Cas d’usage • Bars & cafés',
    heroTitle: 'Votre bar ou café ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre bar ou café ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      'ChatGPT, Claude et Perplexity recommandent-ils votre bar ou café, ou un autre lieu ?',
    heroSubtitleLines: [
      'ChatGPT, Claude et Perplexity',
      'recommandent-ils votre bar ou café, ou un autre lieu ?',
    ],
    ctaLabel: 'Lancer un audit bar ou café',
    querySectionTitle: 'Exemples de requêtes analysées pour un bar ou un café',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de découverte, d’ambiance, d’occasion et de recommandation locale.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre bar ou café',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes d’ambiance, de quartier et de moment',
      'Plan d’action priorisé pour rendre votre lieu plus recommandable',
    ],
    pains: [
      {
        title: 'Les IA citent toujours les mêmes adresses',
        description:
          'Les assistants ont tendance à recommander les lieux les plus faciles à résumer. Si votre ambiance, votre offre ou votre positionnement sont flous, vous disparaissez vite.',
      },
      {
        title: 'Votre lieu est mal compris',
        description:
          'Coffee shop calme, bar à cocktails, adresse brunch, lieu de travail ou spot afterwork: si le site ne clarifie pas assez cela, les recommandations partent ailleurs.',
      },
      {
        title: 'Vous ne savez pas quels signaux manquent',
        description:
          'Horaires, ambiance, carte, quartier, formats de service, moments forts: sans audit, difficile de savoir ce que les IA comprennent vraiment de votre lieu.',
      },
    ],
    queryExamples: [
      'Quel coffee shop sympa recommander pour travailler ?',
      'Meilleur bar à cocktails dans le centre-ville',
      'Où prendre un brunch ce week-end ?',
      'Quel café cosy avec terrasse près de moi ?',
      'Quel bar recommander pour un afterwork entre amis ?',
    ],
    qoryChecks: [
      'Si votre bar ou café ressort sur les requêtes de découverte, de moment de consommation et d’ambiance.',
      'Quels lieux concurrents sont déjà repris par les réponses IA sur votre zone.',
      'Quelles informations les IA associent à votre adresse: ambiance, boissons, horaires, terrasse, brunch, travail, quartier.',
      'Si vos pages donnent assez de signaux clairs pour être reprises sans ambiguïté.',
      'Quelles actions corriger d’abord pour mieux apparaître dans les recommandations locales.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre établissement sur plusieurs types de requêtes locales.',
      'Les lieux qui ressortent à votre place selon les contextes.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre lieu et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un coffee shop ou un bar indépendant ?',
        answer:
          'Pour un coffee shop ou un bar indépendant, la visibilité se joue souvent sur la clarté de l’ambiance, des usages et des temps forts. Qory aide à voir si ces signaux ressortent vraiment.',
      },
      {
        question: 'Le rapport aide-t-il si je dépends surtout d’Instagram et de Google Maps ?',
        answer:
          'Le rapport reste utile même si Instagram ou Google Maps pèsent déjà lourd, parce qu’il mesure comment votre lieu est résumé dans les réponses IA à partir de plusieurs sources.',
      },
      {
        question: 'Est-ce que Qory montre les bars ou cafés recommandés à ma place ?',
        answer:
          'Le rapport met en lumière les adresses concurrentes déjà recommandées sur les requêtes qui comptent pour votre acquisition.',
      },
      {
        question: 'Est-ce un score ou un vrai plan d’action ?',
        answer:
          'L’idée n’est pas seulement d’afficher un score. Vous obtenez aussi un plan d’action pour rendre votre lieu plus lisible et plus recommandable.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Commerce & restauration', href: '/cas-usage/commerces-restauration' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'boulangeries-traiteurs-alimentaire',
    familySlug: 'commerces-restauration',
    path: '/pour-boulangeries-traiteurs-commerces-alimentaires',
    seoTitle:
      'Boulangeries, traiteurs & commerces alimentaires : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les boulangeries, traiteurs et commerces alimentaires à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre offre ressort et quoi améliorer en priorité.',
    heroEyebrow: 'Cas d’usage • Boulangeries, traiteurs & commerces alimentaires',
    heroTitle: 'Votre commerce alimentaire ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre commerce alimentaire ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      'ChatGPT, Claude et Perplexity recommandent-ils votre commerce, ou une autre adresse ?',
    heroSubtitleLines: [
      'ChatGPT, Claude et Perplexity',
      'recommandent-ils votre commerce, ou une autre adresse ?',
    ],
    ctaLabel: 'Lancer un audit alimentaire',
    querySectionTitle: 'Exemples de requêtes analysées pour une boulangerie ou un traiteur',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches d’achat, d’occasion, de spécialité et de recommandation locale.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre activité alimentaire',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes locales et produit',
      'Plan d’action priorisé pour clarifier votre offre',
    ],
    pains: [
      {
        title: 'Votre spécialité n’est pas bien reprise',
        description:
          'Pain au levain, brunch, produits bio, offre traiteur, épicerie fine: si votre spécialité n’est pas clairement comprise, les assistants recommandent d’autres enseignes.',
      },
      {
        title: 'Votre commerce manque de lisibilité',
        description:
          'Les IA aiment les offres simples à résumer. Si votre proposition, vos formats ou vos occasions de consommation sont flous, votre visibilité chute rapidement.',
      },
      {
        title: 'Vous ignorez ce qui bloque la recommandation',
        description:
          'Horaires, zone desservie, prestations, catégories de produits, informations pratiques: Qory aide à voir quels signaux manquent pour mieux ressortir.',
      },
    ],
    queryExamples: [
      'Quelle boulangerie artisanale recommander dans le quartier ?',
      'Quel traiteur choisir pour un mariage ?',
      'Où acheter des produits bio ou une épicerie fine locale ?',
      'Quelle pâtisserie proposer pour un anniversaire ?',
      'Quel commerce alimentaire local vaut le détour ?',
    ],
    qoryChecks: [
      'Si votre activité ressort sur les requêtes de spécialité, d’occasion et de recommandation locale.',
      'Quelles adresses concurrentes ou agrégateurs prennent déjà la place.',
      'Quelles informations les IA associent à votre commerce: produits, qualité, occasions, formats, zone, horaires.',
      'Si vos pages sont assez explicites pour faire comprendre votre offre sans ambiguïté.',
      'Quelles actions corriger d’abord pour gagner en clarté et en présence IA.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre commerce sur plusieurs requêtes produit et locales.',
      'Les adresses ou plateformes qui ressortent à votre place.',
      'Les signaux déjà compris ou encore flous dans les réponses IA.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une petite boulangerie indépendante ?',
        answer:
          'Pour une petite boulangerie indépendante, la différence se fait souvent sur la clarté des spécialités, de l’emplacement et des informations pratiques. C’est exactement ce que le rapport aide à mesurer.',
      },
      {
        question: 'Est-ce adapté à un traiteur avec plusieurs prestations ?',
        answer:
          'Le cadre s’adapte très bien à un traiteur avec plusieurs prestations, justement parce qu’il permet de voir si vos différents usages et occasions sont bien compris.',
      },
      {
        question: 'Le rapport montre-t-il qui est recommandé à ma place ?',
        answer:
          'Le rapport montre quels commerces, adresses ou plateformes prennent déjà la visibilité sur les requêtes importantes.',
      },
      {
        question: 'Qory me dit-il quoi améliorer ensuite ?',
        answer:
          'Vous repartez avec un plan d’action priorisé pour savoir quoi améliorer d’abord, au-delà du simple score.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Commerce & restauration', href: '/cas-usage/commerces-restauration' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'boutiques-mode-accessoires',
    familySlug: 'commerces-restauration',
    path: '/pour-boutiques-mode-accessoires',
    seoTitle: 'Boutiques mode & accessoires : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les boutiques mode et accessoires à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre magasin ressort et quoi corriger pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Boutiques mode & accessoires',
    heroTitle: 'Votre boutique de mode ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre boutique de mode ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      'ChatGPT, Claude et Perplexity recommandent-ils votre boutique, ou une autre enseigne ?',
    heroSubtitleLines: [
      'ChatGPT, Claude et Perplexity',
      'recommandent-ils votre boutique, ou une autre enseigne ?',
    ],
    ctaLabel: 'Lancer un audit boutique mode',
    querySectionTitle: 'Exemples de requêtes analysées pour une boutique mode',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de shopping, de style, de quartier et de recommandation locale.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre boutique mode',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes shopping et locales',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Votre boutique n’est pas dans les recommandations',
        description:
          'Même avec une bonne sélection, vous pouvez rester invisible si votre univers, votre positionnement ou votre catégorie de produits sont mal compris.',
      },
      {
        title: 'Votre identité est trop floue',
        description:
          'Prêt-à-porter femme, concept store, accessoires premium, boutique responsable: si votre promesse n’est pas claire, les assistants citent des concurrents plus lisibles.',
      },
      {
        title: 'Vous ne savez pas comment améliorer votre présence',
        description:
          'Catégories, marques, style, localisation, occasions d’achat: Qory aide à voir quels signaux manquent pour être mieux recommandé.',
      },
    ],
    queryExamples: [
      'Quelle boutique mode recommander dans le centre-ville ?',
      'Où acheter des accessoires premium près de moi ?',
      'Quel concept store mode vaut le détour ?',
      'Quelle boutique femme recommander pour un cadeau ?',
      'Quelles enseignes locales ressortent dans ChatGPT ?',
    ],
    qoryChecks: [
      'Si votre boutique ressort sur les requêtes de shopping, de style, de cadeau et de découverte locale.',
      'Quels commerces concurrents prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre magasin: style, catégories, marques, positionnement, quartier.',
      'Si vos pages et vos signaux de marque sont assez clairs pour être repris correctement.',
      'Quelles actions corriger d’abord pour mieux apparaître dans les recommandations.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre boutique sur plusieurs types de requêtes shopping.',
      'Les enseignes qui ressortent à votre place.',
      'Les signaux de style et de positionnement déjà compris ou encore flous.',
      'Un plan d’action priorisé pour clarifier votre boutique et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour une boutique indépendante ?',
        answer:
          'Pour une boutique indépendante, la visibilité dépend beaucoup de la clarté de l’univers, des catégories et du positionnement. Qory aide à voir si cela ressort vraiment.',
      },
      {
        question: 'Le rapport est-il utile si je vends surtout en physique ?',
        answer:
          'Le rapport reste pertinent même si la vente se fait surtout en magasin, parce qu’il mesure comment votre boutique est perçue et recommandée en amont.',
      },
      {
        question: 'Puis-je voir quelles boutiques sont citées à ma place ?',
        answer:
          'Le rapport montre quels concurrents ou agrégateurs captent déjà la recommandation sur vos requêtes importantes.',
      },
      {
        question: 'Qory me dit-il ce qu’il faut corriger ?',
        answer:
          'Vous obtenez un plan d’action priorisé pour améliorer les signaux les plus utiles et clarifier votre positionnement.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Commerce & restauration', href: '/cas-usage/commerces-restauration' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'boutiques-maison-deco-fleuristes',
    familySlug: 'commerces-restauration',
    path: '/pour-boutiques-maison-deco-fleuristes',
    seoTitle:
      'Boutiques maison, déco & fleuristes : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les boutiques déco, maison et fleuristes à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Voyez si votre adresse ressort et quoi améliorer pour être mieux recommandée.',
    heroEyebrow: 'Cas d’usage • Boutiques maison, déco & fleuristes',
    heroTitle: 'Votre boutique de décoration ressort-elle dans les réponses IA ?',
    heroTitleLines: ['Votre boutique de décoration ressort-elle', 'dans les réponses IA ?'],
    heroSubtitle:
      'ChatGPT, Claude et Perplexity recommandent-ils votre boutique, ou une autre adresse ?',
    heroSubtitleLines: [
      'ChatGPT, Claude et Perplexity',
      'recommandent-ils votre boutique, ou une autre adresse ?',
    ],
    ctaLabel: 'Lancer un audit boutique déco',
    querySectionTitle: 'Exemples de requêtes analysées pour une boutique déco ou un fleuriste',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de cadeau, d’inspiration, d’achat local et de recommandation.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre boutique déco',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes déco, cadeau et achat local',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Votre univers est mal résumé',
        description:
          'Déco, fleurs, idées cadeaux, artisanat, objets maison: si votre univers n’est pas assez net, les assistants recommandent d’autres adresses plus faciles à comprendre.',
      },
      {
        title: 'Votre boutique ne ressort pas sur les bonnes occasions',
        description:
          'Mariage, anniversaire, déco intérieure, cadeau de dernière minute: si ces usages ne sont pas visibles, vous perdez les requêtes à forte intention.',
      },
      {
        title: 'Vous manquez de visibilité locale claire',
        description:
          'Zone desservie, style, occasions, spécialités, horaires: Qory aide à voir ce qui manque pour être mieux recommandé près de chez vos clients.',
      },
    ],
    queryExamples: [
      'Quel fleuriste recommander pour un anniversaire ?',
      'Quelle boutique déco sympa dans le centre-ville ?',
      'Où acheter un cadeau maison original ?',
      'Quel concept store déco vaut le détour ?',
      'Quelle boutique locale proposer pour un bouquet ou un objet déco ?',
    ],
    qoryChecks: [
      'Si votre boutique ressort sur les requêtes de décoration, de fleur, de cadeau et d’achat local.',
      'Quels commerces concurrents ou plateformes prennent déjà la place.',
      'Quelles informations les IA associent à votre adresse: style, occasions, catégories, localisation, niveau de gamme.',
      'Si votre site et vos pages expriment assez clairement votre univers et vos spécialités.',
      'Quelles actions corriger d’abord pour devenir plus visible et plus recommandable.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre boutique sur plusieurs requêtes de recommandation locale.',
      'Les adresses ou plateformes qui ressortent à votre place.',
      'Les signaux d’univers, de style et d’occasion déjà compris ou encore flous.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un fleuriste ou une petite boutique déco ?',
        answer:
          'Pour un fleuriste ou une petite boutique déco, la visibilité se joue souvent sur la clarté de l’univers, des occasions d’achat et des spécialités. Qory aide à voir si tout cela ressort vraiment.',
      },
      {
        question: 'Le rapport fonctionne-t-il si je vends surtout en magasin ?',
        answer:
          'Le rapport reste utile même si la vente se fait surtout en magasin, parce qu’il mesure comment votre boutique est comprise et recommandée en amont.',
      },
      {
        question: 'Puis-je voir quelles boutiques ressortent à ma place ?',
        answer:
          'Le rapport montre quels commerces ou plateformes captent déjà la recommandation sur vos requêtes importantes.',
      },
      {
        question: 'Est-ce que Qory me dit quoi améliorer ?',
        answer:
          'Vous obtenez un plan d’action priorisé pour renforcer les signaux les plus utiles et rendre votre offre plus lisible.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Commerce & restauration', href: '/cas-usage/commerces-restauration' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
  {
    slug: 'hotels-loisirs-locaux',
    familySlug: 'commerces-restauration',
    path: '/pour-hotels-loisirs-locaux',
    seoTitle: 'Hôtels & loisirs locaux : êtes-vous visible dans les réponses IA ? | Qory',
    seoDescription:
      'Qory aide les hôtels et lieux de loisirs à mesurer leur visibilité dans ChatGPT, Claude et Perplexity. Vérifiez si votre établissement ressort et quoi corriger pour être mieux recommandé.',
    heroEyebrow: 'Cas d’usage • Hôtels & loisirs locaux',
    heroTitle: 'Votre établissement ressort-il dans les réponses IA ?',
    heroTitleLines: ['Votre établissement ressort-il', 'dans les réponses IA ?'],
    heroSubtitle:
      'ChatGPT, Claude et Perplexity recommandent-ils votre établissement, ou d’autres options ?',
    heroSubtitleLines: [
      'ChatGPT, Claude et Perplexity',
      'recommandent-ils votre établissement, ou d’autres options ?',
    ],
    ctaLabel: 'Lancer un audit hôtel ou loisirs',
    querySectionTitle: 'Exemples de requêtes analysées pour un hôtel ou un lieu de loisirs',
    querySectionDescription:
      'Qory mesure votre présence sur des recherches de séjour, d’activité, de sortie et de recommandation locale.',
    checksSectionTitle: 'Ce que Qory vérifie pour votre établissement',
    aiBadges: ['ChatGPT', 'Claude', 'Perplexity'],
    proofBullets: [
      'Analyse one-shot à 9,99 € sans abonnement',
      'Lecture claire des requêtes de séjour, visite et activité',
      'Plan d’action priorisé pour mieux ressortir',
    ],
    pains: [
      {
        title: 'Les IA proposent d’autres options à votre place',
        description:
          'Hôtels, lieux à visiter, activités en famille, sorties du week-end: les assistants ne citent que quelques options, et votre établissement peut rapidement passer à côté.',
      },
      {
        title: 'Votre promesse n’est pas assez claire',
        description:
          'Hôtel indépendant, escapade romantique, activité locale, expérience familiale: si votre proposition n’est pas limpide, les recommandations partent vers des acteurs mieux cadrés.',
      },
      {
        title: 'Vous ne savez pas quels signaux améliorer',
        description:
          'Services, localisation, occasions, public visé, style, points forts: Qory aide à voir ce que les IA comprennent vraiment de votre établissement.',
      },
    ],
    queryExamples: [
      'Quel hôtel recommander pour un week-end en amoureux ?',
      'Quelle activité faire en famille ce week-end ?',
      'Quel établissement local vaut le détour dans la région ?',
      'Quel hôtel indépendant avec charme près du centre-ville ?',
      'Que recommander comme sortie locale à proximité ?',
    ],
    qoryChecks: [
      'Si votre établissement ressort sur les requêtes de séjour, de loisir, de découverte et de recommandation locale.',
      'Quels concurrents ou plateformes prennent déjà la place dans les réponses IA.',
      'Quelles informations les IA associent à votre lieu: style, services, localisation, public, expérience, occasion.',
      'Si votre site est assez explicite pour faire comprendre votre promesse sans ambiguïté.',
      'Quelles actions corriger d’abord pour mieux apparaître dans les recommandations.',
    ],
    reportHighlights: [
      'Un score global de visibilité IA et le détail par pilier.',
      'La présence réelle de votre établissement sur plusieurs requêtes de séjour et de loisirs.',
      'Les acteurs ou plateformes qui ressortent à votre place.',
      'Les signaux de positionnement déjà compris ou encore flous.',
      'Un plan d’action priorisé pour clarifier votre offre et vos pages clés.',
    ],
    faqs: [
      {
        question: 'Qory est-il utile pour un hôtel indépendant ou un lieu local ?',
        answer:
          'Pour un hôtel indépendant ou un lieu local, l’enjeu est de voir si votre établissement est bien compris et recommandé sur les requêtes qui comptent pour vos réservations ou vos visites.',
      },
      {
        question: 'Le rapport est-il pertinent si les plateformes dominent déjà mon secteur ?',
        answer:
          'C’est justement là que le rapport est utile: il aide à voir quand les IA privilégient des plateformes, des guides ou des concurrents plus visibles que vous.',
      },
      {
        question: 'Puis-je voir quels acteurs prennent la place ?',
        answer:
          'Le rapport montre quels établissements, agrégateurs ou plateformes ressortent déjà sur vos requêtes clés.',
      },
      {
        question: 'Qory me donne-t-il des actions concrètes ?',
        answer:
          'Vous repartez avec un plan d’action priorisé pour améliorer la lisibilité de votre offre et de vos pages.',
      },
    ],
    relatedLinks: [
      { label: 'Voir tous les cas d’usage', href: '/cas-usage' },
      { label: 'Explorer la famille Commerce & restauration', href: '/cas-usage/commerces-restauration' },
      { label: 'Voir les tarifs', href: '/tarifs' },
      { label: 'Comprendre la méthode Qory', href: '/comment-ca-marche' },
    ],
  },
];

export function getUseCaseFamilyBySlug(slug: string): UseCaseFamily | undefined {
  return useCaseFamilies.find((family) => family.slug === slug);
}

export function getUseCaseSectorByFamilyAndSlug(
  familySlug: string,
  sectorSlug: string
): UseCaseSectorPreview | undefined {
  return getUseCaseFamilyBySlug(familySlug)?.sectors.find((sector) => sector.slug === sectorSlug);
}

export function getUseCaseSectorBySlug(slug: string): UseCaseSectorPreview | undefined {
  return useCaseFamilies.flatMap((family) => family.sectors).find((sector) => sector.slug === slug);
}

export function getReadyUseCaseSectorPageBySlug(slug: string): UseCaseSectorPage | undefined {
  return readyUseCaseSectorPages.find((sector) => sector.slug === slug);
}

export function getUseCaseSectorHref(
  familySlug: string,
  sector: Pick<UseCaseSectorPreview, 'slug' | 'path'>
): string {
  return sector.path ?? `/cas-usage/${familySlug}/${sector.slug}`;
}

export function getReadyUseCaseSectorPaths(): string[] {
  return readyUseCaseSectorPages.map((sector) => sector.path);
}

export function getPlannedUseCaseSectorPaths(): string[] {
  return useCaseFamilies.flatMap((family) =>
    family.sectors
      .filter((sector) => !sector.path)
      .map((sector) => `/cas-usage/${family.slug}/${sector.slug}`)
  );
}
