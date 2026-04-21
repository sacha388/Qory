export type MoneyPageFaqItem = {
  question: string;
  answer: string;
};

export type MoneyPageData = {
  slug: 'audit-visibilite-ia' | 'chatgpt-cite-mon-site' | 'analyse-reponses-ia';
  path: string;
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  intro: string[];
  measureTitle: string;
  measureItems: string[];
  reportTitle: string;
  reportItems: string[];
  whyTitle: string;
  whyItems: string[];
  faqs: MoneyPageFaqItem[];
  ctaLabel: string;
};

export const moneyPages: MoneyPageData[] = [
  {
    slug: 'audit-visibilite-ia',
    path: '/audit-visibilite-ia',
    seoTitle: 'Audit de visibilité IA : voyez ce que les IA disent de votre entreprise | Qory',
    seoDescription:
      'Qory vous aide à mesurer votre visibilité dans ChatGPT, Claude et Perplexity avec un rapport clair, actionnable et sans abonnement.',
    eyebrow: 'Audit de visibilité IA',
    title: 'Voyez ce que les IA disent vraiment de votre entreprise',
    intro: [
      'Un audit de visibilité IA sert à comprendre si votre site ressort réellement dans les réponses de ChatGPT, Claude et Perplexity sur les requêtes qui comptent pour votre activité.',
      'Qory transforme cette question en lecture exploitable: où vous êtes cité, où vous êtes absent, qui prend la place et quoi corriger en priorité pour mieux ressortir.',
    ],
    measureTitle: 'Ce que Qory mesure',
    measureItems: [
      'Votre présence réelle sur des requêtes proches de votre offre.',
      'Les concurrents ou plateformes déjà visibles à votre place.',
      'La manière dont votre activité est comprise par les réponses IA.',
      'Les signaux qui freinent encore votre clarté ou votre citation.',
    ],
    reportTitle: 'Ce que contient le rapport',
    reportItems: [
      'Un score global de visibilité IA et le détail par pilier.',
      'Les requêtes analysées et la présence observée par modèle.',
      'Les acteurs qui ressortent déjà sur votre terrain.',
      'Un plan d’action priorisé, lisible et concret.',
    ],
    whyTitle: 'Pourquoi passer par Qory plutôt que regarder quelques requêtes à la main',
    whyItems: [
      'Une recherche manuelle donne une impression. Le rapport donne une lecture structurée.',
      'Vous gagnez une vision plus claire que celle d’un simple grader gratuit.',
      'Le rapport est pensé pour déboucher sur des actions, pas seulement sur un score.',
      'Le format one-shot à 9,99 € évite de rentrer dans une logique d’abonnement lourd.',
    ],
    faqs: [
      {
        question: 'À qui sert un audit de visibilité IA ?',
        answer:
          'Il est utile dès qu’une entreprise dépend de sa visibilité en ligne pour être découverte, comparée ou recommandée. Cela vaut pour un commerce local, une agence, un SaaS ou une marque plus installée.',
      },
      {
        question: 'Est-ce que Qory analyse seulement ChatGPT ?',
        answer:
          'Non. Le rapport est pensé pour lire votre présence sur plusieurs environnements, notamment ChatGPT, Claude et Perplexity, afin d’éviter une vision trop étroite.',
      },
      {
        question: 'Le rapport donne-t-il des actions concrètes ?',
        answer:
          'Oui. L’objectif n’est pas seulement de constater un niveau de visibilité, mais de vous montrer ce qu’il faut clarifier ou renforcer en premier.',
      },
    ],
    ctaLabel: 'Lancer mon audit',
  },
  {
    slug: 'chatgpt-cite-mon-site',
    path: '/presence-chatgpt',
    seoTitle: 'ChatGPT cite-t-il votre site ? | Qory',
    seoDescription:
      'Découvrez si votre site est cité, compris ou dépassé dans ChatGPT, puis obtenez un rapport simple pour savoir quoi corriger.',
    eyebrow: 'ChatGPT cite mon site',
    title: 'Découvrez si ChatGPT vous cite vraiment',
    intro: [
      'Beaucoup de marques testent quelques prompts puis repartent avec une impression floue. Le vrai sujet n’est pas seulement d’apparaître une fois, mais de comprendre si ChatGPT vous cite sur les requêtes qui ont un impact commercial.',
      'Qory aide à vérifier cette présence de façon plus structurée, à voir qui ressort à votre place et à transformer le constat en priorités d’optimisation.',
    ],
    measureTitle: 'Ce que Qory regarde dans ChatGPT',
    measureItems: [
      'Si votre marque apparaît sur des requêtes proches de votre activité.',
      'Comment votre entreprise est décrite quand elle ressort.',
      'Quels concurrents sont recommandés à votre place.',
      'Quels signaux manquent encore pour être mieux compris.',
    ],
    reportTitle: 'Ce que vous récupérez ensuite',
    reportItems: [
      'Une lecture claire de votre présence dans les réponses IA.',
      'Les requêtes où vous êtes visible, partiel ou absent.',
      'La concurrence réellement reprise dans les réponses.',
      'Des actions à mener pour améliorer la clarté et la citation.',
    ],
    whyTitle: 'Pourquoi ne pas se contenter de tester quelques prompts',
    whyItems: [
      'Une vérification à la main reste partielle et dépend du contexte testé.',
      'Le rapport donne une base plus stable pour interpréter votre présence.',
      'Vous voyez non seulement si vous apparaissez, mais aussi pourquoi cela reste insuffisant.',
      'La lecture est pensée pour décider quoi faire ensuite, pas juste pour se rassurer.',
    ],
    faqs: [
      {
        question: 'Si ChatGPT me cite une fois, est-ce que c’est bon signe ?',
        answer:
          'C’est un début, mais ce n’est pas suffisant. Il faut surtout savoir si vous ressortez sur les requêtes qui comptent vraiment pour votre acquisition ou votre notoriété.',
      },
      {
        question: 'Le rapport fonctionne-t-il aussi si je suis une petite entreprise ?',
        answer:
          'Oui. Justement, une petite entreprise a intérêt à savoir si sa clarté d’offre suffit à exister face à des acteurs plus installés dans les réponses IA.',
      },
      {
        question: 'Est-ce que le rapport regarde aussi au-delà de ChatGPT ?',
        answer:
          'Oui. Même si cette page part de ChatGPT, le rapport garde une lecture multi-plateforme pour vous donner une vision plus utile.',
      },
    ],
    ctaLabel: 'Vérifier ma présence',
  },
  {
    slug: 'analyse-reponses-ia',
    path: '/analyse-reponses-ia',
    seoTitle: 'Analyse de réponses IA : comprenez comment votre entreprise est reprise | Qory',
    seoDescription:
      'Analysez comment les réponses IA parlent de votre entreprise, quels concurrents prennent la place et quoi corriger ensuite.',
    eyebrow: 'Analyse de réponses IA',
    title: 'Analysez comment les réponses IA parlent de votre entreprise',
    intro: [
      'Une analyse de réponses IA ne sert pas seulement à savoir si votre marque apparaît. Elle sert à comprendre comment elle est lue, simplifiée, comparée ou parfois mal interprétée.',
      'Qory aide à transformer cette lecture en rapport concret: présence observée, concurrence visible, points de flou et ordre des corrections à faire.',
    ],
    measureTitle: 'Ce que Qory analyse',
    measureItems: [
      'Votre présence ou votre absence sur des réponses stratégiques.',
      'La formulation associée à votre activité ou votre offre.',
      'Les concurrents, annuaires ou plateformes mis en avant à votre place.',
      'Les zones où votre positionnement reste trop vague pour être bien repris.',
    ],
    reportTitle: 'Ce que le rapport vous permet de lire',
    reportItems: [
      'Le niveau global de visibilité IA de votre site.',
      'Les requêtes où votre marque est bien comprise ou mal captée.',
      'Les signaux déjà repris et ceux encore trop faibles.',
      'Un plan d’action priorisé pour clarifier vos pages clés.',
    ],
    whyTitle: 'Pourquoi cette analyse compte',
    whyItems: [
      'Elle révèle les écarts entre votre discours et la façon dont les IA vous résument.',
      'Elle aide à comprendre pourquoi un concurrent semble plus visible que vous.',
      'Elle donne une base plus solide qu’une intuition ou un test ponctuel.',
      'Elle relie visibilité, compréhension et conversion dans une même lecture.',
    ],
    faqs: [
      {
        question: 'Cette analyse remplace-t-elle un audit SEO complet ?',
        answer:
          'Non. Elle se concentre sur la visibilité et la compréhension dans les réponses IA. Elle complète une lecture SEO plus classique au lieu de la remplacer.',
      },
      {
        question: 'Le rapport aide-t-il si ma marque est parfois mal décrite ?',
        answer:
          'Oui. C’est justement l’un des cas les plus utiles, parce qu’il permet de repérer où votre offre manque encore de clarté ou de cohérence.',
      },
      {
        question: 'Qory montre-t-il aussi la concurrence visible ?',
        answer:
          'Oui. Le rapport ne se limite pas à votre présence: il montre aussi quels acteurs prennent déjà la place sur les requêtes importantes.',
      },
    ],
    ctaLabel: 'Analyser mes réponses IA',
  },
];

export function getMoneyPageBySlug(slug: MoneyPageData['slug']): MoneyPageData | undefined {
  return moneyPages.find((page) => page.slug === slug);
}
