export type PlatformVisibilityFaqItem = {
  question: string;
  answer: string;
};

export type PlatformVisibilitySection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  /** Visuel optionnel ; sinon rotation sur les illustrations Qory dans la page. */
  illustrationSrc?: string;
};

/** Illustrations par défaut pour les sections (ordre cyclique). */
export const platformVisibilityDefaultIllustrations = [
  '/money-pages/scene-intro-network.svg',
  '/money-pages/scene-measure-analysis.svg',
  '/report-assets/models-visibility.svg',
  '/report-assets/competitor-radar.svg',
  '/report-assets/action-plan.svg',
  '/money-pages/scene-report-reading.svg',
] as const;

export type PlatformVisibilityPageData = {
  id: 'chatgpt' | 'claude' | 'perplexity';
  path: string;
  seoTitle: string;
  seoDescription: string;
  heroImageSrc: string;
  heroImageAlt: string;
  headline: string;
  ctaHref: string;
  ctaLabel: string;
  finalCtaTitle: string;
  finalCtaBody: string;
  finalCtaLabel: string;
  sections: PlatformVisibilitySection[];
  faqs: PlatformVisibilityFaqItem[];
  useCaseLink: { href: string; label: string };
};

const internalLinkAudit = { href: '/audit-visibilite-ia' as const, label: 'Audit de visibilité IA' };
const internalLinkPricing = { href: '/tarifs' as const, label: 'Tarifs' };
const internalLinkGeoBlog = { href: '/blog/quest-ce-que-le-geo' as const, label: 'Qu’est-ce que le GEO ?' };
const internalLinkSeoGeoBlog = { href: '/ressources/seo-vs-geo' as const, label: 'SEO vs GEO : les différences' };

export const platformVisibilityInternalLinks = [
  internalLinkAudit,
  internalLinkPricing,
  internalLinkGeoBlog,
  internalLinkSeoGeoBlog,
] as const;

export const platformVisibilityPages: PlatformVisibilityPageData[] = [
  {
    id: 'chatgpt',
    path: '/presence-chatgpt',
    seoTitle: 'ChatGPT cite-t-il votre site ? Notoriété, marque et concurrence | Qory',
    seoDescription:
      'Comprenez pourquoi ChatGPT cite ou ignore votre site : notoriété, reprise de marque, présence générale et lecture concurrentielle. Mesurez avant de corriger avec Qory.',
    heroImageSrc: '/chatgpt.PNG',
    heroImageAlt: 'Icône ChatGPT',
    headline: 'ChatGPT cite-t-il votre site ?',
    ctaHref: '/audit',
    ctaLabel: 'Vérifier ma présence dans ChatGPT',
    finalCtaTitle: 'Passez du test manuel à une lecture fiable',
    finalCtaBody:
      'Qory vous montre où vous êtes cité, comment votre marque est décrite et qui occupe l’espace à votre place — pour prioriser ce qui renforce vraiment votre notoriété dans les réponses IA.',
    finalCtaLabel: 'Lancer l’analyse',
    useCaseLink: { href: '/cas-usage/saas-applications', label: 'Cas d’usage SaaS' },
    sections: [
      {
        title: 'Pourquoi cette plateforme compte',
        paragraphs: [
          'ChatGPT est souvent le premier endroit où une personne formule un besoin, compare des options ou demande des exemples. Même lorsque la requête ne vise pas directement votre nom, la réponse peut déjà orienter la shortlist.',
          'Pour une marque, la visibilité dans ChatGPT se lit comme une combinaison de notoriété perçue, de reprise de marque et de présence générale sur les intentions qui comptent pour votre activité.',
        ],
      },
      {
        title: 'Pourquoi un site peut être absent',
        paragraphs: [
          'Un site peut être correct en SEO classique et pourtant peu mobilisé dans ChatGPT sur les requêtes stratégiques. Le modèle ne « classe » pas vos pages comme Google : il synthétise à partir de signaux de clarté, de cohérence et de présence dans des sources qu’il estime utiles.',
          'L’absence peut aussi venir d’une marque encore faiblement associée à votre catégorie dans les contenus publics, ou d’une offre formulée de façon trop vague pour être citée sans risque.',
        ],
      },
      {
        title: 'Ce que Qory analyse pour cette plateforme',
        paragraphs: [
          'Qory structure une lecture orientée ChatGPT : où votre site ou votre marque apparaît, comment il est décrit, et quels concurrents ou alternatives sont proposés à la place.',
        ],
        bullets: [
          'Présence et formulation sur des requêtes proches de votre marché.',
          'Reprise de marque : nom, désignation et risques de confusion.',
          'Lecture concurrentielle : qui est recommandé, comparé ou présenté comme référence.',
          'Signaux qui expliquent une présence faible ou une description incomplète.',
        ],
      },
      {
        title: 'Les freins les plus fréquents',
        paragraphs: [
          'Les blocages reviennent souvent : notoriété relative trop faible face à des acteurs plus cités, pages clés peu explicites, preuves ou périmètre mal identifiables, et manque de cohérence entre ce que vous dites sur votre site et ce que d’autres sources affirment.',
        ],
      },
      {
        title: 'Pourquoi mesurer avant de corriger',
        paragraphs: [
          'Optimiser sans mesure revient souvent à traiter le symptôme visible. Une mesure structurée montre sur quelles requêtes vous gagnez ou perdez, et si le problème est plutôt notoriété, clarté ou concurrence — ce qui change complètement l’ordre des actions.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Comment savoir si ChatGPT cite mon site ?',
        answer:
          'Il faut tester des requêtes représentatives de votre marché, pas seulement votre nom de marque. Qory aide à organiser cette lecture : présence, formulation et concurrents visibles sur les intentions qui comptent pour vous.',
      },
      {
        question: 'Pourquoi ChatGPT parle de mes concurrents et pas de moi ?',
        answer:
          'Souvent parce que leurs offres sont perçues comme plus simples à résumer, plus citées ailleurs, ou parce que votre site ne rend pas votre positionnement aussi explicite. La mesure permet de distinguer notoriété, clarté et angle concurrentiel.',
      },
      {
        question: 'Un bon SEO suffit-il pour être visible dans ChatGPT ?',
        answer:
          'Non, ce n’est pas équivalent. Un bon SEO aide à être trouvé dans les moteurs, mais la visibilité dans ChatGPT dépend aussi de la clarté éditoriale, de la cohérence et de la capacité de votre contenu à être mobilisé dans une synthèse. Les deux se renforcent, sans se remplacer.',
      },
    ],
  },
  {
    id: 'claude',
    path: '/presence-claude',
    seoTitle: 'Claude cite-t-il votre site ? Clarté, cohérence et visibilité | Qory',
    seoDescription:
      'Améliorez la façon dont Claude lit votre site : compréhension, cohérence et formulation. Mesurez votre visibilité et vos angles de correction avec Qory.',
    heroImageSrc: '/claude.PNG',
    heroImageAlt: 'Icône Claude',
    headline: 'Claude cite-t-il votre site ?',
    ctaHref: '/audit',
    ctaLabel: 'Tester ma lisibilité pour Claude',
    finalCtaTitle: 'Rendez votre site plus simple à lire pour un modèle',
    finalCtaBody:
      'Qory met en évidence les écarts entre ce que vous pensez montrer et ce qui est réellement repris — pour corriger formulation, structure et cohérence avant d’empiler le contenu.',
    finalCtaLabel: 'Lancer l’analyse',
    useCaseLink: { href: '/cas-usage/ecommerce', label: 'Cas d’usage e-commerce' },
    sections: [
      {
        title: 'Pourquoi cette plateforme compte',
        paragraphs: [
          'Claude est utilisé pour analyser, comparer et reformuler des informations. Si votre site est mal structuré ou trop ambigu, le modèle peut simplifier à l’excès ou privilégier une formulation plus « sûre » qui n’est pas la vôtre.',
          'Pour les marques B2B et les offres complexes, la qualité de compréhension prime : une petite imprécision peut devenir une grande simplification dans la réponse.',
        ],
      },
      {
        title: 'Pourquoi un site peut être absent',
        paragraphs: [
          'Claude peut éviter de citer une source qu’il juge peu claire ou contradictoire. L’absence n’est donc pas toujours une punition « technique » : c’est parfois un signal de formulation, de chevauchement entre pages ou de promesses non alignées.',
        ],
      },
      {
        title: 'Ce que Qory analyse pour cette plateforme',
        paragraphs: [
          'L’analyse Qory met l’accent sur la façon dont votre activité est comprise et reformulée : précision du périmètre, stabilité du discours et qualité des passages les plus exposés au résumé.',
        ],
        bullets: [
          'Compréhension : votre offre est-elle résumable sans erreur sensible ?',
          'Cohérence : les pages clés se contredisent-elles sur le fond ou le positionnement ?',
          'Clarté du site : hiérarchie, titres, sections et preuves exploitables.',
          'Formulation : phrases trop longues, jargon ou promesses floues qui fragilisent la citation.',
        ],
      },
      {
        title: 'Les freins les plus fréquents',
        paragraphs: [
          'On retrouve souvent des services mal délimités, plusieurs cibles mélangées sur une même page, différenciation noyée dans du vocabulaire marketing, et preuves dispersées sans synthèse. Ces freins nuisent plus à Claude qu’à un simple classement de mots-clés.',
        ],
      },
      {
        title: 'Pourquoi mesurer avant de corriger',
        paragraphs: [
          'Sans mesure, on retouche souvent la homepage alors que le problème vient d’une page catégorie ou d’une incohérence entre deux paragraphes. La lecture Qory priorise les zones qui changent vraiment la compréhension dans les réponses IA.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Claude utilise-t-il les mêmes signaux que Google ?',
        answer:
          'Non. Google et Claude ne « lisent » pas la pertinence de la même manière. Les signaux de classement classiques ne suffisent pas à garantir une bonne reprise dans Claude : la clarté, la cohérence et la qualité de formulation jouent un rôle direct dans ce qui est synthétisé ou évité.',
      },
      {
        question: 'Pourquoi Claude comprend mal certaines offres ?',
        answer:
          'Souvent parce que l’offre est décrite avec trop de généralités, parce que plusieurs produits se chevauchent sur le discours, ou parce que les preuves ne sont pas au bon endroit pour ancrer la lecture. Le modèle choisit alors une version plus simple, parfois incomplète.',
      },
      {
        question: 'Comment rendre mon site plus clair pour Claude ?',
        answer:
          'En réduisant l’ambiguïté : périmètre net, pages dédiées par intention, titres explicites, et paragraphes d’introduction qui tiennent la promesse sans jargon. Qory aide à repérer où cette clarté manque encore dans les réponses observées.',
      },
    ],
  },
  {
    id: 'perplexity',
    path: '/presence-perplexity',
    seoTitle: 'Présence dans Perplexity : citations, sources et concurrence | Qory',
    seoDescription:
      'Perplexity affiche des sources visibles : découvrez pourquoi votre site est cité ou écarté, comment se positionner face à la concurrence, et quoi mesurer avant d’optimiser.',
    heroImageSrc: '/perplexity.PNG',
    heroImageAlt: 'Icône Perplexity',
    headline: 'Perplexity cite-t-il votre site ?',
    ctaHref: '/audit',
    ctaLabel: 'Voir si Perplexity me cite',
    finalCtaTitle: 'Agissez sur ce qui influence vraiment les citations',
    finalCtaBody:
      'Qory relie votre présence Perplexity à des requêtes concrètes, aux sources qui gagnent et aux écarts de clarté — pour corriger dans le bon ordre.',
    finalCtaLabel: 'Lancer l’analyse',
    useCaseLink: { href: '/cas-usage/prestataires-locaux', label: 'Cas d’usage entreprises locales' },
    sections: [
      {
        title: 'Pourquoi cette plateforme compte',
        paragraphs: [
          'Perplexity s’appuie sur des citations visibles : l’utilisateur voit souvent quelles sources soutiennent la réponse. C’est une visibilité à la fois franche et concurrentielle, car d’autres sites peuvent occuper les extraits les plus visibles.',
          'Pour une marque, être citée dans Perplexity, c’est aussi une question de crédibilité : la source apparaît au même niveau que d’autres acteurs du même sujet.',
        ],
      },
      {
        title: 'Pourquoi un site peut être absent',
        paragraphs: [
          'Perplexity peut privilégier des pages faciles à citer, stables et claires. Si votre contenu est trop générique, dupliqué ailleurs, ou moins utile qu’un guide concurrent pour répondre à la requête, votre URL peut rester hors de la liste.',
          'Les problèmes techniques ou d’accès peuvent aussi réduire la probabilité d’être choisi comme source fiable.',
        ],
      },
      {
        title: 'Ce que Qory analyse pour cette plateforme',
        paragraphs: [
          'Qory examine comment votre site apparaît dans les réponses qui listent des sources : présence, position relative et type de pages mobilisées.',
        ],
        bullets: [
          'Citations visibles et reprise explicite de votre domaine.',
          'Sources concurrentes qui prennent la place sur vos intentions clés.',
          'Adéquation entre la requête et les pages de votre site les plus citables.',
          'Lecture de la concurrence directe dans les extraits proposés.',
        ],
      },
      {
        title: 'Les freins les plus fréquents',
        paragraphs: [
          'Contenus trop minces ou trop similaires à d’autres sites, manque de page « référence » sur un sujet, structure peu lisible pour un extrait, et présence faible sur les questions où les concurrents ont déjà des guides solides.',
        ],
      },
      {
        title: 'Pourquoi mesurer avant de corriger',
        paragraphs: [
          'La compétition sur Perplexity est visible : sans mesure, on risque de copier le format d’un concurrent sans comprendre pourquoi sa source est choisie. La mesure indique quelles requêtes et quels types de pages déclenchent encore vos citations.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Comment apparaître dans Perplexity ?',
        answer:
          'En proposant des pages claires, factuelles et faciles à citer sur les sujets où vous voulez exister, et en vérifiant que votre site est bien accessible. Qory aide à prioriser les intentions et les écarts observés sur vos requêtes.',
      },
      {
        question: 'Pourquoi Perplexity cite certains sites et pas d’autres ?',
        answer:
          'Le système favorise des sources qui semblent répondre directement à la question, avec un contenu stable et utile pour l’extrait. La concurrence sur ces créneaux est explicite : d’autres sites peuvent mieux tenir le rôle de référence.',
      },
      {
        question: 'Quelle différence entre Perplexity et Google AI Overviews ?',
        answer:
          'Perplexity centre l’expérience sur une réponse avec des sources listées de façon très visible. Les AI Overviews de Google intègrent une synthèse dans un parcours de recherche différent, avec des règles et des surfaces de citation qui ne se superposent pas toujours. Les deux méritent une lecture distincte dans votre stratégie de visibilité IA.',
      },
    ],
  },
];

export function getPlatformVisibilityPageByPath(path: string): PlatformVisibilityPageData | undefined {
  return platformVisibilityPages.find((p) => p.path === path);
}

export function getPlatformVisibilityPageById(
  id: PlatformVisibilityPageData['id'],
): PlatformVisibilityPageData | undefined {
  return platformVisibilityPages.find((p) => p.id === id);
}
