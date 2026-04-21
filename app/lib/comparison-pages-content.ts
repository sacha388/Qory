export type ComparisonTableRow = {
  criterion: string;
  qory: string;
  competitor: string;
};

export type ComparisonSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type ComparisonPageData = {
  id: 'hubspot' | 'otterly';
  path: string;
  seoTitle: string;
  seoDescription: string;
  breadcrumbLabel: string;
  hero: {
    headline: string;
    subline: string;
    ctaLabel: string;
    ctaHref: '/audit';
  };
  summaryHeading: string;
  summaryParagraphs: string[];
  tableHeading: string;
  competitorShortName: string;
  tableRows: ComparisonTableRow[];
  sections: ComparisonSection[];
  finalCta: {
    title: string;
    ctaLabel: string;
    ctaHref: '/audit';
  };
};

export const qoryVsHubspotPage: ComparisonPageData = {
  id: 'hubspot',
  path: '/qory-vs-hubspot-aeo-grader',
  seoTitle: 'Qory vs HubSpot AEO Grader : comparatif clair pour la visibilité dans les réponses IA',
  seoDescription:
    'Qory et le HubSpot AEO Grader ne jouent pas exactement le même rôle. Résumé, tableau comparatif et critères pour choisir selon votre contexte marketing.',
  breadcrumbLabel: 'Qory vs HubSpot AEO Grader',
  hero: {
    headline: 'Qory vs HubSpot AEO Grader',
    subline:
      'Deux approches possibles autour de la visibilité « au-delà du clic » : un grader intégré à un écosystème marketing, et un audit focalisé sur la lecture de votre site dans les réponses IA.',
    ctaLabel: 'Lancer l’analyse',
    ctaHref: '/audit',
  },
  summaryHeading: 'Résumé ultra court',
  summaryParagraphs: [
    'Le HubSpot AEO Grader s’inscrit dans la logique HubSpot : évaluer rapidement des critères liés à la visibilité dans des environnements enrichis, souvent avec une porte d’entrée vers l’offre HubSpot.',
    'Qory est un produit indépendant centré sur un audit de visibilité IA : crawl de votre site, lecture structurée sur des requêtes représentatives, score explicable et priorités — sans stack CRM ni marketing automation derrière.',
  ],
  tableHeading: 'Tableau comparatif',
  competitorShortName: 'HubSpot AEO Grader',
  tableRows: [
    {
      criterion: 'Positionnement',
      qory: 'Audit GEO / visibilité dans les réponses IA, livrable priorisé.',
      competitor: 'Outil de « grading » AEO, aligné sur l’univers HubSpot.',
    },
    {
      criterion: 'Périmètre produit',
      qory: 'Mesure et rapport Qory ; pas de suite CRM native.',
      competitor: 'Pont naturel vers CMS, CRM et campagnes HubSpot.',
    },
    {
      criterion: 'Profondeur du diagnostic',
      qory: 'Crawl orienté diagnostic, piliers de score détaillés, lecture concurrentielle.',
      competitor: 'Vue synthétique et critères de bonnes pratiques type grader.',
    },
    {
      criterion: 'Public typique',
      qory: 'Marques et équipes qui veulent un rapport actionnable sans changer de stack.',
      competitor: 'Équipes déjà sur HubSpot ou sensibles à l’écosystème HubSpot.',
    },
    {
      criterion: 'Modèle',
      qory: 'Paiement à l’audit / offre Qory (voir tarifs).',
      competitor: 'Gratuit ou freemium selon évolutions produit HubSpot.',
    },
  ],
  sections: [
    {
      id: 'hubspot-bien',
      title: 'Ce que HubSpot fait bien',
      paragraphs: [
        'HubSpot excelle quand vous cherchez une plateforme unifiée : contenu, automation, CRM, reporting. Un grader AEO y trouve sa place comme point d’entrée pédagogique pour des équipes déjà familiarisées avec la marque.',
        'Pour une organisation qui standardise ses outils autour de HubSpot, tester le grader peut servir de premier signal — surtout si la suite marketing est déjà adoptée en interne.',
      ],
      bullets: [
        'Cohérence avec le reste du parcours HubSpot',
        'Onboarding familier pour les équipes inbound',
        'Vision « marketing global » plutôt qu’outil pointu',
      ],
    },
    {
      id: 'qory-diff',
      title: 'Ce que Qory fait différemment',
      paragraphs: [
        'Qory ne cherche pas à remplacer votre CRM : il vise une mesure sérieuse de votre visibilité dans les réponses IA (présence, formulation, concurrents) à partir de votre URL et d’une lecture multi-modèles cadrée.',
        'Le rapport est pensé pour trancher : notoriété perçue, clarté factuelle, technique, visibilité dans les réponses — avec un ordre d’actions défendable, pas seulement une note isolée.',
      ],
      bullets: [
        'Indépendance vis-à-vis d’un éditeur de marketing cloud',
        'Score décomposé et priorités lisibles par la direction et les équipes terrain',
        'Focus France / francophone et parcours sans engagement stack',
      ],
    },
    {
      id: 'choix',
      title: 'Quel outil choisir selon votre cas',
      bullets: [
        'Vous standardisez tout sur HubSpot et voulez un premier grader AEO intégré à cet univers → HubSpot AEO Grader peut suffire comme premier pas.',
        'Vous voulez un diagnostic approfondi de votre visibilité IA, un rapport partageable et des priorités sans adopter une nouvelle suite → Qory.',
        'Vous combinez souvent les deux lectures : un grader rapide pour sensibiliser, puis un audit Qory pour prioriser les corrections.',
      ],
    },
  ],
  finalCta: {
    title: 'Comparez sur votre propre site',
    ctaLabel: 'Lancer l’analyse',
    ctaHref: '/audit',
  },
};

export const qoryVsOtterlyPage: ComparisonPageData = {
  id: 'otterly',
  path: '/qory-vs-otterly',
  seoTitle: 'Qory vs Otterly : suivi des prompts ou audit structuré ?',
  seoDescription:
    'Otterly et Qory répondent à des besoins différents autour de la visibilité dans les moteurs et assistants. Tableau comparatif et critères pour choisir votre point de départ.',
  breadcrumbLabel: 'Qory vs Otterly',
  hero: {
    headline: 'Qory vs Otterly',
    subline:
      'Otterly met l’accent sur le suivi de visibilité dans les résultats de recherche générative ; Qory propose un audit de site et un score expliqué pour agir sur vos leviers réels.',
    ctaLabel: 'Lancer l’analyse',
    ctaHref: '/audit',
  },
  summaryHeading: 'Résumé en une phrase',
  summaryParagraphs: [
    'Otterly aide surtout à suivre dans le temps des requêtes et des positions dans l’IA search ; Qory part de votre site pour diagnostiquer pourquoi vous êtes cité ou absent et quoi corriger en premier — en une phrase, monitoring côté requêtes versus diagnostic côté site.',
  ],
  tableHeading: 'Tableau comparatif',
  competitorShortName: 'Otterly',
  tableRows: [
    {
      criterion: 'Point d’entrée',
      qory: 'URL de votre site → crawl + analyse + lecture sur requêtes.',
      competitor: 'Suivi de prompts / visibilité dans les SERP IA (selon offre).',
    },
    {
      criterion: 'Temporalité',
      qory: 'Instantané sur un audit ; idéal pour une photographie et un plan d’action.',
      competitor: 'Monitoring dans la durée, utile pour les tendances.',
    },
    {
      criterion: 'Livrable',
      qory: 'Rapport avec score, piliers, concurrents visibles, priorités.',
      competitor: 'Tableaux de visibilité, suivis de marques / requêtes (selon formule).',
    },
    {
      criterion: 'Leviers actionnables',
      qory: 'Relie contenu, technique, faits et marque à votre présence dans les réponses.',
      competitor: 'Optimisé pour mesurer l’évolution plutôt que refondre tout le site.',
    },
    {
      criterion: 'Langue & marché',
      qory: 'Pensé pour les équipes francophones et le contexte européen.',
      competitor: 'Outil international, pricing et fonctionnalités selon plans.',
    },
  ],
  sections: [
    {
      id: 'otterly-plus',
      title: 'Quand Otterly est plus pertinent',
      paragraphs: [
        'Otterly brille lorsque votre besoin principal est de piloter des campagnes de suivi : évolution des requêtes, visibilité relative sur des prompts suivis, comparaisons dans le temps entre acteurs.',
        'Si vous avez déjà une équipe qui optimise le contenu en continu et cherche un tableau de bord de « AI visibility » pour arbitrer des budgets média ou SEO, un outil de monitoring peut être le bon cœur de métier.',
      ],
      bullets: [
        'Suivi hebdomadaire ou mensuel de listes de prompts',
        'Besoin de courbes et de benchmarks entre marques',
        'Moins besoin d’un diagnostic crawl au départ',
      ],
    },
    {
      id: 'qory-plus',
      title: 'Quand Qory est plus pertinent',
      paragraphs: [
        'Qory est plus adapté quand vous ne savez pas encore si le problème vient de la clarté de l’offre, de la structure du site, de la faiblesse de notoriété dans les réponses ou d’un mix — et que vous voulez un ordre de bataille.',
        'L’audit sert aussi à aligner marketing, produit et direction sur un même constat chiffré avant de lancer des chantiers coûteux.',
      ],
      bullets: [
        'Refonte ou clarification de l’offre en cours',
        'Concurrents mieux cités sans que vous sachiez pourquoi',
        'Besoin d’un document de travail interne ou agence / client',
      ],
    },
    {
      id: 'depart',
      title: 'Quel point de départ est le plus intelligent',
      paragraphs: [
        'Il n’y a pas de règle unique : beaucoup d’équipes commencent par un audit Qory pour comprendre les causes, puis ajoutent un suivi type Otterly pour mesurer l’impact dans le temps.',
        'Si votre priorité absolue est le monitoring sans toucher au site, commencez par un outil de suivi ; si votre priorité est d’agir sur le fond (pages, message, preuves), commencez par un audit structuré.',
      ],
      bullets: [
        'Cause d’abord (Qory), puis tendance (Otterly) — souvent la combinaison la plus rentable.',
        'Inverse possible si vous avez déjà un site très mature et cherchez surtout la veille.',
      ],
    },
  ],
  finalCta: {
    title: 'Partez d’un audit clair sur votre URL',
    ctaLabel: 'Lancer l’analyse',
    ctaHref: '/audit',
  },
};

export function getComparisonPageByPath(path: string): ComparisonPageData | undefined {
  if (path === qoryVsHubspotPage.path) return qoryVsHubspotPage;
  if (path === qoryVsOtterlyPage.path) return qoryVsOtterlyPage;
  return undefined;
}
