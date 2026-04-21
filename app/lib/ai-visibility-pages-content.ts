export type AiVisibilityCard = {
  title: string;
  body: string;
};

export type AiVisibilityFaqItem = {
  question: string;
  answer: string;
};

export type AiVisibilitySection =
  | {
      kind: 'problem' | 'bullets' | 'comparison' | 'method' | 'transition';
      eyebrow?: string;
      title: string;
      body?: string;
      bullets?: string[];
    }
  | {
      kind: 'cards';
      eyebrow?: string;
      title: string;
      cards: AiVisibilityCard[];
    }
  | {
      kind: 'report';
      eyebrow?: string;
      title: string;
      body?: string;
      bullets?: string[];
    }
  | {
      kind: 'faq';
      eyebrow?: string;
      title: string;
      faqs: AiVisibilityFaqItem[];
    };

export type AiVisibilityPageData = {
  slug: 'audit-visibilite-ia' | 'presence-reponses-ia' | 'analyse-presence-ia';
  path: string;
  seoTitle: string;
  seoDescription: string;
  accent: string;
  accentText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  finalCtaTitle: string;
  finalCtaBody: string;
  finalCtaLabel: string;
  finalCtaHref: string;
  sections: AiVisibilitySection[];
};

export const aiVisibilityPages: AiVisibilityPageData[] = [
  {
    slug: 'audit-visibilite-ia',
    path: '/audit-visibilite-ia',
    seoTitle: 'Audit de visibilité IA : rapport, scores et plan d’action | Qory',
    seoDescription:
      'Lancez un audit de visibilité IA pour savoir si votre site ressort dans ChatGPT, Claude et Perplexity, et quoi corriger en priorité.',
    accent: '#4BA7F5',
    accentText: '#04111F',
    heroTitle: 'Audit de visibilité IA',
    heroSubtitle:
      'Analysez votre site et découvrez s’il ressort vraiment dans les réponses IA qui comptent pour votre activité.',
    heroCtaLabel: 'Lancer mon audit',
    heroCtaHref: '/audit',
    finalCtaTitle: 'Lancez votre audit de visibilité IA',
    finalCtaBody:
      'Entrez votre URL, lancez l’analyse, puis récupérez une lecture claire de votre présence, de vos concurrents et des corrections prioritaires.',
    finalCtaLabel: 'Lancer mon audit',
    finalCtaHref: '/audit',
    sections: [
      {
        kind: 'problem',
        eyebrow: 'Pourquoi lancer un audit',
        title: 'Votre site peut être en ligne sans être repris par les IA.',
        body:
          'Quand un client demande une recommandation à ChatGPT, Claude ou Perplexity, votre site n’est pas automatiquement cité. L’audit sert à vérifier ce qui se passe réellement sur des requêtes proches de votre marché.',
        bullets: [
          'Savoir si votre marque apparaît ou disparaît.',
          'Voir comment votre activité est comprise.',
          'Identifier les concurrents qui prennent déjà la place.',
        ],
      },
      {
        kind: 'cards',
        eyebrow: 'Ce que Qory analyse',
        title: 'Les quatre signaux clés de votre visibilité IA.',
        cards: [
          {
            title: 'Présence',
            body: 'Votre site apparaît-il dans les réponses importantes ?',
          },
          {
            title: 'Compréhension',
            body: 'Votre offre est-elle correctement interprétée ?',
          },
          {
            title: 'Concurrence',
            body: 'Qui ressort à votre place dans les réponses ?',
          },
          {
            title: 'Signaux',
            body: 'Quels éléments aident ou bloquent la reprise ?',
          },
        ],
      },
      {
        kind: 'bullets',
        eyebrow: 'Ce que vous obtenez',
        title: 'Un rapport lisible, conçu pour passer à l’action.',
        bullets: [
          'Un score global pour situer votre visibilité IA.',
          'Le détail des requêtes où vous apparaissez, ou non.',
          'Les concurrents visibles dans les réponses.',
          'Les points faibles qui brouillent la lecture de votre site.',
          'Les actions à traiter en priorité.',
        ],
      },
      {
        kind: 'bullets',
        eyebrow: 'Pourquoi maintenant',
        title: 'Les décisions commencent déjà dans les réponses IA.',
        bullets: [
          'Un utilisateur peut comparer des options sans ouvrir dix sites.',
          'Une réponse IA peut recommander un concurrent avant même le premier clic.',
          'Mesurer permet d’agir avant que l’écart ne devienne invisible.',
        ],
      },
    ],
  },
  {
    slug: 'presence-reponses-ia',
    path: '/presence-reponses-ia',
    seoTitle: 'Présence dans les réponses IA : pourquoi votre site ressort ou disparaît | Qory',
    seoDescription:
      'Comprenez ce que signifie être présent dans les réponses IA, pourquoi certaines marques ressortent et pourquoi d’autres restent invisibles.',
    accent: '#F16B5D',
    accentText: '#FFFFFF',
    heroTitle: 'Votre site dans les réponses IA',
    heroSubtitle: 'Comprendre pourquoi certaines marques sont citées, résumées ou recommandées par les IA, et pourquoi d’autres restent invisibles.',
    heroCtaLabel: 'Voir l’audit Qory',
    heroCtaHref: '/audit-visibilite-ia',
    finalCtaTitle: 'Passez de la théorie à votre propre site',
    finalCtaBody:
      'Si vous voulez savoir ce que les IA font avec vos pages, Qory transforme cette lecture en audit clair.',
    finalCtaLabel: 'Lancer un audit',
    finalCtaHref: '/audit',
    sections: [
      {
        kind: 'bullets',
        eyebrow: 'Ce qui change',
        title: 'Les IA ne donnent pas seulement des liens. Elles formulent une réponse.',
        body:
          'Avant, l’utilisateur comparait une liste de résultats. Aujourd’hui, il peut demander une synthèse, une recommandation ou une shortlist directement à une IA.',
        bullets: [
          'La réponse sélectionne quelques informations.',
          'Elle simplifie les offres pour les rendre comparables.',
          'Elle peut citer une marque, en ignorer une autre, ou recommander un concurrent.',
        ],
      },
      {
        kind: 'cards',
        eyebrow: 'Pourquoi certaines marques ressortent',
        title: 'Les marques visibles sont souvent les plus faciles à comprendre.',
        cards: [
          {
            title: 'Clarté',
            body: 'L’activité est expliquée simplement, avec une promesse identifiable.',
          },
          {
            title: 'Cohérence',
            body: 'Les pages importantes racontent la même histoire, sans signaux contradictoires.',
          },
          {
            title: 'Structure',
            body: 'Les informations clés sont faciles à repérer, résumer et réutiliser.',
          },
          {
            title: 'Preuve',
            body: 'La réponse peut s’appuyer sur des éléments concrets pour justifier la citation.',
          },
        ],
      },
      {
        kind: 'cards',
        eyebrow: 'Pourquoi d’autres sites disparaissent',
        title: 'Un site peut être bon, mais difficile à reprendre.',
        cards: [
          {
            title: 'Flou',
            body: 'L’IA ne comprend pas clairement votre catégorie ou votre différence.',
          },
          {
            title: 'Contradictions',
            body: 'Les pages donnent plusieurs versions de votre positionnement.',
          },
          {
            title: 'Pages mal hiérarchisées',
            body: 'Les bons éléments existent, mais ils sont noyés ou mal placés.',
          },
        ],
      },
      {
        kind: 'comparison',
        eyebrow: 'Exemple concret',
        title: 'Un même site peut produire deux lectures très différentes.',
        body:
          'Sur une requête, votre site peut être compris comme une solution pertinente. Sur une autre, il peut être résumé trop largement ou remplacé par un acteur plus clair. La présence IA se mesure donc requête par requête.',
        bullets: [
          'Lecture floue : catégorie large, faible différence, peu de preuves.',
          'Lecture claire : offre précise, contexte utile, raison d’être cité.',
        ],
      },
      {
        kind: 'bullets',
        eyebrow: 'Les signaux importants',
        title: 'Ce qu’une IA doit pouvoir comprendre rapidement.',
        bullets: [
          'Ce que vous faites.',
          'À qui votre offre s’adresse.',
          'Pourquoi vous êtes crédible.',
          'En quoi vous vous distinguez des alternatives.',
        ],
      },
      {
        kind: 'bullets',
        eyebrow: 'Les pertes de terrain',
        title: 'L’invisibilité arrive souvent sans signal évident.',
        bullets: [
          'Un concurrent est plus simple à résumer.',
          'Une page clé ne répond pas clairement à l’intention.',
          'La réponse IA préfère une source plus structurée ou plus explicite.',
        ],
      },
      {
        kind: 'transition',
        eyebrow: 'Et ensuite',
        title: 'La bonne question devient : que disent les IA de votre site ?',
        body:
          'Comprendre le sujet aide à éviter les fausses pistes. L’étape suivante consiste à observer votre propre site dans des réponses réelles : présence, formulation, concurrents visibles et priorités.',
      },
      {
        kind: 'faq',
        eyebrow: 'FAQ',
        title: 'Comprendre la présence dans les réponses IA',
        faqs: [
          {
            question: 'Un site peut-il être visible sur Google mais absent des réponses IA ?',
            answer:
              'Oui. Un site peut être bien référencé, mais trop vague ou trop difficile à résumer pour être cité clairement dans une réponse IA.',
          },
          {
            question: 'Pourquoi ChatGPT ou Claude citent-ils mes concurrents ?',
            answer:
              'Souvent parce que leur offre est plus facile à comprendre, leurs preuves plus visibles, ou leur positionnement plus stable sur le sujet demandé.',
          },
          {
            question: 'Comment améliorer ma présence dans les réponses IA ?',
            answer:
              'Il faut d’abord comprendre où vous apparaissez, comment vous êtes décrit et qui ressort à votre place. Ensuite, on peut corriger les pages qui bloquent la lecture.',
          },
        ],
      },
    ],
  },
  {
    slug: 'analyse-presence-ia',
    path: '/analyse-reponses-ia',
    seoTitle: 'Analyse de présence IA : méthode, scores et priorités | Qory',
    seoDescription:
      'Découvrez comment fonctionne une analyse de présence IA : requêtes, réponses, scores, concurrents visibles et priorités de correction.',
    accent: '#F4B43A',
    accentText: '#111111',
    heroTitle: 'Analyser sa présence IA',
    heroSubtitle:
      'La méthode concrète pour comprendre ce que les IA reprennent de votre site, où vous êtes absent et quoi corriger.',
    heroCtaLabel: 'Voir mon analyse',
    heroCtaHref: '/audit',
    finalCtaTitle: 'Voir l’analyse de mon site',
    finalCtaBody:
      'Qory applique cette méthode à votre site et transforme les réponses observées en priorités lisibles.',
    finalCtaLabel: 'Voir mon analyse',
    finalCtaHref: '/audit',
    sections: [
      {
        kind: 'bullets',
        eyebrow: 'Point de départ',
        title: 'On ne peut pas corriger ce qu’on ne voit pas.',
        body:
          'Tester une seule question dans ChatGPT donne une impression, pas une méthode. Une analyse sérieuse observe plusieurs requêtes, plusieurs réponses et plusieurs angles de lecture.',
        bullets: [
          'Quelles requêtes sont importantes ?',
          'Votre site apparaît-il dans les réponses ?',
          'Comment est-il décrit quand il apparaît ?',
        ],
      },
      {
        kind: 'method',
        eyebrow: 'La méthode',
        title: 'Une bonne analyse sépare quatre sujets.',
        bullets: [
          'Présence : est-ce que votre marque apparaît ?',
          'Compréhension : est-ce que l’offre est bien interprétée ?',
          'Positionnement : qui ressort à côté ou à votre place ?',
          'Cohérence : vos pages donnent-elles une lecture stable ?',
        ],
      },
      {
        kind: 'bullets',
        eyebrow: 'Ce qu’on évite',
        title: 'Sans méthode, on corrige souvent le mauvais problème.',
        bullets: [
          'Refaire une page alors que le problème vient du positionnement.',
          'Publier plus de contenu alors que les pages clés sont floues.',
          'Oublier les concurrents qui cadrent déjà mieux la catégorie.',
        ],
      },
      {
        kind: 'cards',
        eyebrow: 'Lecture du rapport',
        title: 'Le score sert à orienter, pas à impressionner.',
        cards: [
          {
            title: 'Score',
            body: 'Une vue simple de votre niveau de visibilité IA.',
          },
          {
            title: 'Requêtes',
            body: 'Les questions concrètes où votre site apparaît ou non.',
          },
          {
            title: 'Écarts',
            body: 'Ce qui explique la différence avec les acteurs visibles.',
          },
          {
            title: 'Priorités',
            body: 'Les corrections à traiter dans le bon ordre.',
          },
        ],
      },
      {
        kind: 'bullets',
        eyebrow: 'Ordre des corrections',
        title: 'La méthode commence par les fondations.',
        bullets: [
          'Clarifier la promesse principale.',
          'Renforcer les pages qui expliquent l’offre.',
          'Aligner homepage, offres, cas d’usage et preuves.',
          'Rendre les preuves visibles et faciles à reprendre.',
        ],
      },
      {
        kind: 'comparison',
        eyebrow: 'SEO ≠ GEO',
        title: 'Une analyse IA ne lit pas seulement le référencement.',
        body:
          'Le SEO aide à être trouvé dans une liste de résultats. L’analyse de présence IA regarde aussi comment un modèle reformule votre offre, vous compare et décide de vous citer ou non.',
        bullets: [
          'SEO : être trouvé.',
          'Présence IA : être compris et repris.',
        ],
      },
      {
        kind: 'transition',
        eyebrow: 'Application',
        title: 'Qory applique cette méthode à votre site.',
        body:
          'L’analyse relie les réponses observées, les concurrents visibles, la structure de votre site et les actions prioritaires. Vous savez ce qui bloque, pourquoi, et dans quel ordre avancer.',
      },
    ],
  },
];

export function getAiVisibilityPageBySlug(
  slug: AiVisibilityPageData['slug'],
): AiVisibilityPageData | undefined {
  return aiVisibilityPages.find((page) => page.slug === slug);
}
