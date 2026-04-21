/** Comment savoir si ChatGPT cite votre site : guide pratique format pilier. */
export const commentSavoirSiChatgptCiteArticle = {
  slug: 'comment-savoir-si-chatgpt-cite-votre-site',
  seoTitle:
    'Comment savoir si ChatGPT cite votre site ? Méthode, tests et lecture sérieuse de votre visibilité IA',
  title: 'Comment savoir si ChatGPT cite votre site (sans se fier à une seule requête)',
  description:
    'Une méthode pour tester la présence de votre marque dans ChatGPT, structurer des requêtes représentatives, interpréter les réponses et distinguer une citation utile d’un simple bruit. Outils et limites.',
  excerpt:
    'Une seule question posée à ChatGPT ne prouve rien. La vraie lecture se fait sur un ensemble de requêtes proches de vos acheteurs, en observant présence, formulation, concurrents et sources.',
  category: 'Guide pratique',
  dateLabel: '15 AVRIL 2026',
  dateIso: '2026-04-15',
  dateModifiedIso: '2026-04-18',
  authorLabel: 'Rédaction Qory',
  readTime: '14 min',
  imageSrc: '/ressources/checklist-hero.svg',
  imageAlt: 'Illustration sur les tests de présence de marque dans les réponses ChatGPT',
  tags: ['ChatGPT', 'citation', 'visibilité IA', 'audit', 'mesure'],
  ctaBox: {
    title: 'Passer du test manuel à une lecture structurée',
    body: 'Qory organise la mesure sur des intentions proches de votre marché et montre qui occupe l’espace à côté de vous, sans que vous ayez à refaire les tests manuellement chaque mois.',
    href: '/audit',
    label: 'Lancer un audit',
  },
  sections: [
    {
      title: 'Pourquoi savoir si ChatGPT cite votre site est devenu stratégique',
      paragraphs: [],
      body: [
        {
          type: 'paragraph',
          text: 'Une part croissante des parcours d’achat commence désormais dans un assistant : ChatGPT, Claude, Perplexity, Gemini ou les AI Overviews de Google. Les prospects ne comparent plus seulement dix liens, ils lisent une réponse synthétique qui recommande parfois un acteur et en ignore un autre.',
        },
        {
          type: 'paragraph',
          text: 'Dans ce contexte, être cité par ChatGPT n’est pas un effet de mode. C’est un indicateur de présence sur des intentions qui ne passeront peut-être jamais par Google, et que vous ne verrez pas dans vos outils d’analytics classiques. Un concurrent plus clair ou plus lisible peut capter ces opportunités sans que vous vous en aperceviez.',
        },
        {
          type: 'paragraph',
          text: 'Avant toute optimisation, il faut donc une mesure sérieuse : où êtes-vous cité, où êtes-vous absent, par qui êtes-vous remplacé, comment votre marque est-elle formulée ? Ce guide donne la méthode. Pour une vue complète sur le sujet, voir aussi [Présence dans les réponses IA](/presence-reponses-ia).',
        },
      ],
    },
    {
      title: 'Pourquoi une requête isolée ne prouve rien',
      paragraphs: [],
      body: [
        {
          type: 'paragraph',
          text: 'Le premier réflexe est souvent de taper son nom de marque dans ChatGPT et d’en tirer une conclusion. C’est rarement fiable. Les réponses d’un assistant varient selon plusieurs paramètres : version du modèle, compte utilisé, historique de la conversation, activation ou non du mode recherche web, langue, pays, moment de la journée.',
        },
        {
          type: 'paragraph',
          text: 'Voir votre site cité une fois ne garantit pas une présence stable. À l’inverse, une absence ponctuelle ne condamne pas toute votre visibilité. La vraie question n’est pas seulement « apparaît-il ou non ? ». Il faut regarder sur un ensemble représentatif de requêtes de votre marché si vous êtes cité, comment, et qui apparaît à côté de vous.',
        },
        {
          type: 'bulletList',
          items: [
            'Les réponses varient selon le modèle et le contexte',
            'Un test unique ne permet pas de comparer dans le temps',
            'Le nom de marque seul masque l’intention d’achat réelle',
            'L’absence ponctuelle n’est pas une condamnation',
          ],
        },
      ],
    },
    {
      title: 'Comprendre d’où ChatGPT tire ses réponses',
      paragraphs: [],
      body: [
        {
          type: 'paragraph',
          text: 'ChatGPT combine plusieurs sources selon la configuration. D’un côté, les connaissances intégrées au modèle lors de son entraînement, qui dépendent de données publiques plus ou moins anciennes. De l’autre, un mode de recherche web qui interroge des sources en ligne en temps réel et affiche parfois des citations explicites.',
        },
        {
          type: 'paragraph',
          text: 'La distinction est importante. Si votre marque apparaît sans que le modèle ait consulté le web, c’est qu’elle est suffisamment présente dans l’écosystème général (site, presse, annuaires, forums, avis) pour être mémorisée. Si elle apparaît uniquement en mode recherche, c’est que le modèle a trouvé une source explicite, souvent votre site ou une source tierce.',
        },
        {
          type: 'paragraph',
          text: 'Pour être correctement exploitable par ChatGPT, votre site doit par ailleurs être accessible aux crawlers IA (notamment GPTBot côté OpenAI). Un robots.txt trop restrictif, un contenu caché derrière JavaScript non rendu ou des pages non indexables peuvent expliquer une partie des absences.',
        },
      ],
    },
    {
      title: 'Construire une liste de requêtes utile (pas votre marque seule)',
      paragraphs: [],
      body: [
        {
          type: 'paragraph',
          text: 'La qualité de votre mesure dépend presque entièrement de la qualité de vos requêtes. Une liste trop centrée sur votre marque produit un score flatteur mais inutile. Une liste trop large dilue la lecture. L’enjeu est de simuler les intentions d’un prospect qui ne vous connaît pas encore.',
        },
        {
          type: 'paragraph',
          text: 'Mélangez quatre familles de requêtes : besoin générique (« meilleur outil pour mesurer sa visibilité IA »), comparaison (« X vs Y »), locales ou sectorielles si pertinent (« meilleure agence SEO à Lyon »), et marque pure pour vérifier la formulation.',
        },
        {
          type: 'bulletList',
          items: [
            'Requêtes d’achat ou de shortlist, pas seulement la notoriété',
            'Variantes de langage que vos clients utilisent vraiment',
            'Cas où un concurrent est typiquement recommandé à votre place',
            'Requêtes locales ou verticales si votre offre est spécialisée',
            'Requêtes « près du clic » : comparatifs, alternatives, recommandations',
          ],
        },
        {
          type: 'iconFrames',
          items: [
            { label: 'Définition du GEO', href: '/ressources/quest-ce-que-le-geo', icon: 'sparkle' },
            { label: 'SEO vs GEO', href: '/ressources/seo-vs-geo', icon: 'link' },
            { label: 'Mesurer la visibilité IA', href: '/audit-visibilite-ia', icon: 'chart' },
            { label: 'Lancer un audit', href: '/audit', icon: 'search' },
          ],
        },
      ],
    },
    {
      title: 'Une méthode de test en 5 étapes',
      paragraphs: [
        'Pour être exploitable, un test manuel doit suivre une petite discipline. L’objectif n’est pas de produire un chiffre impressionnant, mais de rendre vos observations comparables d’un mois à l’autre.',
      ],
      bullets: [
        'Définir 20 à 40 requêtes représentatives de vos intentions prioritaires',
        'Tester chaque requête sur au moins deux modèles (ex. ChatGPT + Perplexity)',
        'Noter pour chaque réponse : présence, formulation de marque, concurrents cités',
        'Capturer les sources affichées quand le modèle les indique',
        'Refaire l’exercice à intervalle régulier (toutes les 4 à 8 semaines)',
      ],
    },
    {
      title: 'Ce qu’il faut vraiment regarder dans la réponse',
      paragraphs: [],
      body: [
        {
          type: 'paragraph',
          text: 'Beaucoup de marques s’arrêtent au « oui / non ». C’est dommage, car l’essentiel est dans les nuances. Une citation neutre où votre marque est mentionnée sans contexte vaut beaucoup moins qu’une recommandation explicite comme option principale. À l’inverse, un concurrent cité en tête sur une requête centrale de votre marché est un signal fort.',
        },
        {
          type: 'paragraph',
          text: 'Regardez aussi la formulation : votre nom est-il orthographié correctement ? Votre activité est-elle résumée fidèlement ? Le périmètre est-il juste ? Une marque souvent mal décrite révèle une ambiguïté à corriger dans vos pages clés. Sur ce sujet, voir [comment corriger une hallucination IA sur votre entreprise](/ressources/corriger-hallucination-ia-marque).',
        },
        {
          type: 'bannerQuote',
          color: '#4BA7F5',
          quote:
            'Ce qui compte n’est pas seulement d’être cité : c’est d’être cité au bon endroit de la réponse, avec la bonne formulation, sur les bonnes requêtes.',
          attribution: 'Rédaction Qory, guides GEO',
        },
      ],
    },
    {
      title: 'Analyser les concurrents cités à votre place',
      paragraphs: [
        'La dimension concurrentielle est souvent sous-estimée. Quand vous n’êtes pas cité, un autre acteur l’est, et cet acteur est probablement en train de capter une partie des intentions d’achat que vous visez. Cette lecture est un gisement d’apprentissage.',
        'Relevez systématiquement les marques qui apparaissent à votre place. Regardez leurs pages de service, leur homepage, leur vocabulaire, la manière dont ils nomment leur offre. Vous y trouverez souvent des formulations plus claires, des cas d’usage mieux posés, ou une structure plus simple à résumer pour un modèle.',
        'Ne cherchez pas à copier : cherchez à comprendre pourquoi leur site est plus facile à mobiliser, puis à rendre le vôtre au moins aussi lisible.',
      ],
      bullets: [
        'Lister les concurrents récurrents, par type de requête',
        'Repérer les formulations qui reviennent dans leur positionnement',
        'Comparer la clarté des pages clés des deux côtés',
      ],
    },
    {
      title: 'Les limites du test manuel',
      paragraphs: [],
      body: [
        {
          type: 'paragraph',
          text: 'Tester à la main reste utile pour comprendre finement une poignée de requêtes. Au-delà, cela devient vite ingérable. Entre les variations de réponse, la multiplication des modèles et la nécessité de suivre l’évolution dans le temps, vous passez plus de temps à capturer les résultats qu’à en tirer des décisions.',
        },
        {
          type: 'paragraph',
          text: 'Trois limites reviennent souvent : la reproductibilité (une même requête ne donne pas toujours la même réponse), la couverture (impossible de suivre des centaines de requêtes manuellement), et la comparabilité dans le temps (sans méthode stable, difficile de dire si vous progressez ou non).',
        },
        {
          type: 'bulletList',
          items: [
            'Reproductibilité imparfaite des réponses',
            'Impossible de couvrir un large portefeuille de requêtes',
            'Comparaison dans le temps difficile sans protocole strict',
            'Lecture concurrentielle trop partielle',
          ],
        },
      ],
    },
    {
      title: 'Quand basculer vers un audit structuré',
      paragraphs: [],
      body: [
        {
          type: 'paragraph',
          text: 'Dès qu’il s’agit de décider où investir (quelles pages corriger, quels concurrents surveiller, quelle promesse clarifier), les tests manuels ne suffisent plus. Un audit structuré prend le relais en fixant le protocole, en élargissant la couverture, en stabilisant la lecture et en reliant les observations à des actions priorisées.',
        },
        {
          type: 'paragraph',
          text: 'L’objectif d’un outil comme Qory n’est pas d’ajouter de la complexité, mais d’éviter que la mesure reste un exercice ponctuel. Il fait le tri entre freins techniques, problèmes de clarté, écarts concurrentiels et priorités d’action. Pour aller plus loin : [audit de visibilité IA](/audit-visibilite-ia) et [tarifs](/tarifs).',
        },
        {
          type: 'bannerQuote',
          color: '#F16B5D',
          quote:
            'Mesurer manuellement permet de comprendre. Mesurer de façon structurée permet de décider et de comparer dans le temps.',
          attribution: 'Synthèse Qory',
        },
      ],
    },
    {
      title: 'Ce qu’il faut retenir',
      paragraphs: [
        'Savoir si ChatGPT cite votre site n’est pas une question à laquelle on répond en une requête. C’est une lecture construite sur un ensemble de requêtes représentatives, sur plusieurs modèles, observée dans le temps, avec une attention particulière à la formulation, aux sources et aux concurrents cités à votre place.',
        'Un bon test manuel révèle les premières évidences. Un audit structuré les transforme en décisions. Dans les deux cas, l’essentiel est de sortir de l’intuition pour entrer dans une mesure que vous pouvez comparer, expliquer et utiliser pour prioriser vos prochaines actions.',
      ],
    },
  ],
  faqs: [
    {
      question: 'ChatGPT indique-t-il toujours ses sources ?',
      answer:
        'Non. Les sources ne sont affichées que dans certains modes, notamment quand la recherche web est activée. Sans sources visibles, il faut recouper avec d’autres indices : formulation, présence de concurrents, cohérence des informations.',
    },
    {
      question: 'Comment faire si ma marque n’apparaît jamais ?',
      answer:
        'D’abord vérifier que votre site est bien accessible aux crawlers IA. Ensuite diagnostiquer la clarté de votre promesse, la cohérence du vocabulaire et la force des preuves. Voir [pourquoi votre marque n’apparaît pas](/ressources/pourquoi-votre-marque-napparait-pas).',
    },
    {
      question: 'À quelle fréquence refaire les tests ?',
      answer:
        'Un cycle de 4 à 8 semaines est un bon compromis : assez fréquent pour détecter les évolutions, assez espacé pour éviter le bruit lié aux variations de réponse.',
    },
    {
      question: 'Faut-il tester uniquement ChatGPT ?',
      answer:
        'Non. Il est utile de couvrir au moins ChatGPT, Perplexity et Claude, et d’y ajouter les AI Overviews de Google selon votre marché. Les réponses et les sources mobilisées ne sont pas les mêmes.',
    },
  ],
} as const;
