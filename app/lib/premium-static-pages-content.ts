import { faqChapters, faqFinalCta, faqPageMeta } from '@/app/lib/faq-page-content';

/**
 * Couleur de la 2e ligne des titres (sections « Comment ça marche »).
 * Même palette que les titres des cartes du carrousel rapport sur la landing (une teinte par famille de fond).
 */
export const PREMIUM_CCM_TITLE_BOTTOM_BY_SECTION = {
  'method-start': '#0E3D5C',
  'method-pillars': '#5C3A0C',
  'method-report': '#1B3F18',
  'method-priority': '#612C24',
} as const;

export type PremiumStaticCardTone = 'light' | 'dark';
export type PremiumStaticCardSize = 'half' | 'wide' | 'full';
export type PremiumStaticArtwork =
  | 'none'
  | 'scan'
  | 'signals'
  | 'brand'
  | 'route'
  | 'donut'
  | 'document'
  | 'priority'
  | 'payment'
  | 'shield'
  | 'message'
  | 'clock'
  | 'lock'
  | 'check'
  | 'bolt'
  | 'grid'
  | 'compare'
  | 'models'
  | 'price'
  | 'qa-list'
  | 'report'
  /* Un visuel dédié par carte — comment ça marche */
  | 'pillar-technical'
  | 'pillar-factual'
  | 'visibility-nodes'
  | 'share-intent'
  | 'gap-scan'
  | 'loss-compare'
  | 'clarity-brand'
  | 'peer-rows'
  | 'action-flow'
  | 'echo-surface'
  | 'read-complete'
  | 'focus-fix'
  /* Tarifs */
  | 'no-lock-in'
  | 'relance-independent'
  | 'report-pipeline'
  | 'run-bolt'
  | 'saas-velocity'
  | 'commerce-channels'
  | 'fit-showcase'
  /* FAQ */
  | 'scope-layers'
  | 'pay-upfront'
  | 'faq-shareable'
  | 'stripe-link'
  | 'ready-pack'
  | 'pricing-actions'
  | 'score-formula'
  | 'sparse-data'
  | 'surprise-context'
  | 'readable-report';

export type PremiumStaticCard = {
  title: string;
  body?: string;
  /** Deuxième ligne en grand (style marketing type Apple), pas en petit gris */
  bodyHeadline?: boolean;
  tone: PremiumStaticCardTone;
  size: PremiumStaticCardSize;
  accent?: string;
  artwork?: PremiumStaticArtwork;
  /** Visuel en pleine carte, sans encadré interne arrondi */
  artworkIntegrated?: boolean;
};

export type PremiumStaticTarifLayout = {
  offerHeading: string;
  features: string[];
  priceInteger: string;
  priceCurrency: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export type PremiumStaticSection = {
  id: string;
  background: string;
  titleTop: string;
  titleBottom: string;
  titleTopColor?: string;
  titleBottomColor?: string;
  description?: string;
  cards: PremiumStaticCard[];
  /** Mise en page type « Un audit / Un prix » : pas de cartes visuelles. */
  tarifLayout?: PremiumStaticTarifLayout;
};

export type PremiumStaticFinalFaq = {
  title: string;
  items: Array<{ question: string; answer: string }>;
};

/** Icône au-dessus du titre (page Comment ça marche, blocs bicolonne). */
export type PremiumHowItWorksIcon = 'url' | 'analysis' | 'report';

/** Visuel de droite pour chaque bloc. */
export type PremiumHowItWorksVisual = 'crawl' | 'analyse' | 'rapport';

export type PremiumHowItWorksBlock = {
  icon: PremiumHowItWorksIcon;
  title: string;
  body: string;
  visual: PremiumHowItWorksVisual;
};


export type PremiumTarifsBand = {
  title: string;
  subtitle?: string;
};

export type PremiumModelsStripItem = {
  logoSrc: string;
  /** Libellé / texte alternatif pour l’image. */
  name: string;
};

export type PremiumModelsStrip = {
  title: string;
  items: PremiumModelsStripItem[];
};

export type PremiumStaticPageData = {
  path: string;
  title: string;
  breadcrumbLabel: string;
  seoDescription: string;
  hero: {
    description: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
  sections: PremiumStaticSection[];
  /** Hero bandeau + carte chevauchante + bandeau modèles (page /tarifs uniquement). */
  tarifsBand?: PremiumTarifsBand;
  modelsStrip?: PremiumModelsStrip;
  /** Bloc sous les sections (pages comment-ca-marche, faq). */
  finalCta?: {
    title: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
  /** Remplace le CTA final (ex. page tarifs). */
  finalFaq?: PremiumStaticFinalFaq;
  /** Blocs « icône + titre + texte | visuel » (refonte comment-ca-marche). */
  howItWorksBlocks?: PremiumHowItWorksBlock[];
};

const premiumTarifsFaqChapter = faqChapters.find((c) => c.id === 'tarifs');
const premiumCcmFaqChapter = faqChapters.find((c) => c.id === 'demarrer');

export const premiumStaticPages: Record<'comment-ca-marche' | 'tarifs' | 'faq', PremiumStaticPageData> = {
  'comment-ca-marche': {
    path: '/comment-ca-marche',
    title: 'Comment fonctionne Qory',
    breadcrumbLabel: 'Comment ça marche',
    seoDescription:
      'Découvrez comment fonctionne Qory, comment le score de visibilité IA se construit et comment lire les priorités du rapport.',
    hero: {
      description: '',
      primaryLabel: 'Lancer une vérification',
      primaryHref: '/audit',
      secondaryLabel: 'Voir les tarifs',
      secondaryHref: '/tarifs',
    },
    sections: [],
    howItWorksBlocks: [
      {
        icon: 'url',
        title: 'Étape 1 — L’URL de votre site',
        body:
          'Comme au début du parcours d’audit, vous saisissez l’adresse de votre site dans le champ (avec ou sans https://), puis vous lancez l’analyse. Qory explore les pages utiles et ce que les modèles peuvent déjà relire pour établir une base factuelle avant le score.',
        visual: 'crawl',
      },
      {
        icon: 'analysis',
        title: 'Étape 2 — L’analyse',
        body:
          'Pendant le chargement, Qory interroge en parallèle plusieurs modèles (Claude, ChatGPT, Perplexity…) sur des requêtes liées à votre activité : on observe si et comment votre site ou votre marque apparaît dans leurs réponses, pas seulement ce que vous affichez sur vos pages.',
        visual: 'analyse',
      },
      {
        icon: 'report',
        title: 'Étape 3 — Le rapport',
        body:
          'Vous voyez ce qui vous aide déjà, ce qui bloque, l’écart avec d’autres acteurs, puis une suite d’actions priorisées — sans noyer la lecture dans du jargon.',
        visual: 'rapport',
      },
    ],
    finalCta: {
      title: 'Le scan commence en quelques secondes.',
      body: 'Le rapport remet ensuite votre visibilité IA au propre, avec les vrais sujets à traiter.',
      primaryLabel: 'Lancer une vérification',
      primaryHref: '/audit',
      secondaryLabel: 'Voir les tarifs',
      secondaryHref: '/tarifs',
    },
    finalFaq: {
      title: 'Questions fréquentes',
      items: premiumCcmFaqChapter?.items ?? [],
    },
  },
  tarifs: {
    path: '/tarifs',
    title: 'Tarifs Qory',
    breadcrumbLabel: 'Tarifs',
    seoDescription:
      'Consultez les tarifs Qory: 9,99€ TTC par rapport, paiement unique, sans abonnement, avec accès au rapport complet de visibilité IA.',
    hero: {
      description:
        'Une seule formule. Un seul paiement. Un rapport complet pour voir votre présence IA, vos écarts et vos priorités.',
      primaryLabel: 'Lancer une vérification',
      primaryHref: '/audit',
      secondaryLabel: 'Comment ça marche',
      secondaryHref: '/comment-ca-marche',
    },
    tarifsBand: {
      title: 'Tarif Qory',
    },
    modelsStrip: {
      title: 'L’analyse s’appuie sur ces modèles et environnements',
      items: [
        { logoSrc: '/brandopenai.svg', name: 'OpenAI' },
        { logoSrc: '/brandclaude.svg', name: 'Anthropic' },
        { logoSrc: '/brandperplexity.svg', name: 'Perplexity' },
        { logoSrc: '/brandgoogle.svg', name: 'Google' },
      ],
    },
    sections: [
      {
        id: 'pricing-access',
        background: '#65CB45',
        titleTop: 'Paiement unique',
        titleBottom: '',
        cards: [],
        tarifLayout: {
          offerHeading: 'Offre unique',
          features: [
            'Score global + détail par pilier',
            'Visibilité par modèle IA (ChatGPT, Claude, Perplexity)',
            'Analyse concurrentielle',
            'Plan d’action priorisé',
            'Rapport complet en français',
          ],
          priceInteger: '9,99',
          priceCurrency: '€',
          primaryCta: { label: 'Lancer l’audit', href: '/audit' },
          secondaryCta: { label: 'Comment ça marche', href: '/comment-ca-marche' },
        },
      },
    ],
    finalFaq: {
      title: 'Questions fréquentes',
      items: premiumTarifsFaqChapter?.items ?? [],
    },
  },
  faq: {
    path: faqPageMeta.path,
    title: faqPageMeta.title,
    breadcrumbLabel: 'FAQ',
    seoDescription: faqPageMeta.seoDescription,
    hero: {
      description: faqPageMeta.heroDescription,
      primaryLabel: faqPageMeta.primaryLabel,
      primaryHref: faqPageMeta.primaryHref,
      secondaryLabel: faqPageMeta.secondaryLabel,
      secondaryHref: faqPageMeta.secondaryHref,
    },
    sections: [],
    finalCta: {
      title: faqFinalCta.title,
      body: faqFinalCta.body,
      primaryLabel: faqFinalCta.primaryLabel,
      primaryHref: faqFinalCta.primaryHref,
      secondaryLabel: faqFinalCta.secondaryLabel,
      secondaryHref: faqFinalCta.secondaryHref,
    },
  },
};
