export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqChapter = {
  id: string;
  title: string;
  /** Fond plein écran (animation entre sections, comme les pages premium) */
  background: string;
  items: FaqItem[];
};

export const faqPageMeta = {
  path: '/faq',
  title: 'Questions fréquentes sur Qory',
  documentTitle: 'FAQ Qory | Questions fréquentes sur la visibilité IA',
  seoDescription:
    'Retrouvez les réponses essentielles sur Qory: fonctionnement, paiement, durée du scan, score, rapport, confidentialité et sécurité.',
  heroDescription:
    'Les réponses importantes, remises à plat sans détour: lancement, paiement, score, rapport, confidentialité.',
  primaryLabel: 'Lancer une vérification',
  primaryHref: '/audit',
  secondaryLabel: 'Voir les tarifs',
  secondaryHref: '/tarifs',
} as const;

export const faqFinalCta = {
  title: 'Le reste se voit dans le rapport.',
  body: 'Le score, les écarts et les priorités arrivent ensuite dans un format plus clair que la question de départ.',
  primaryLabel: 'Lancer une vérification',
  primaryHref: '/audit',
  secondaryLabel: 'Comment ça marche',
  secondaryHref: '/comment-ca-marche',
} as const;

export const faqChapters: FaqChapter[] = [
  {
    id: 'demarrer',
    title: 'Démarrer avec Qory',
    background: '#4FA8E6',
    items: [
      {
        question: 'Comment lancer une analyse ?',
        answer:
          'Entrez l’URL de votre site, validez le paiement unique, puis l’analyse complète démarre automatiquement. Vous accédez au rapport dès qu’il est prêt.',
      },
      {
        question: 'Que mesure Qory exactement ?',
        answer:
          'Qory évalue la lisibilité technique de votre site, la clarté des informations de marque, votre visibilité dans les réponses des principaux modèles, et la pression concurrentielle sur les intentions qui vous concernent.',
      },
      {
        question: 'Pourquoi payer avant le scan complet ?',
        answer:
          'Le scan complet sollicite des services externes plus coûteux qu’une simple lecture. Le paiement en amont permet de lancer ce traitement dans de bonnes conditions et de protéger le service contre les abus.',
      },
      {
        question: 'Puis-je analyser plusieurs sites ou marques ?',
        answer:
          'Oui. Chaque analyse est indépendante et produit son propre rapport. Vous pouvez comparer plusieurs domaines sans mélanger les résultats.',
      },
      {
        question: 'Qory modifie-t-il mon site ?',
        answer:
          'Non. Qory observe, mesure et recommande. Vous gardez la main sur les changements à apporter sur votre site.',
      },
    ],
  },
  {
    id: 'analyse',
    title: 'Analyse & score',
    background: '#65CB45',
    items: [
      {
        question: 'Combien de temps dure l’analyse ?',
        answer:
          'Dans la plupart des cas, quelques dizaines de secondes. La durée peut varier selon la taille du site et les services sollicités pendant le scan.',
      },
      {
        question: 'Comment le score global est-il construit ?',
        answer:
          'Il repose sur quatre piliers pondérés : technique 15 %, couverture factuelle 15 %, visibilité 45 %, positionnement 25 %. L’objectif est d’éviter qu’un bon signal isolé masque une faible présence réelle.',
      },
      {
        question: 'Pourquoi vois-je parfois « N/A » sur un pilier ?',
        answer:
          'Quand les modèles ne remontent pas assez d’informations claires et attribuables à votre marque, certains calculs ne peuvent pas être faits proprement. Le rapport l’indique au lieu d’afficher une note trompeuse.',
      },
      {
        question: 'Le score remplace-t-il une stratégie SEO classique ?',
        answer:
          'Non. Il complète votre lecture : il objectivise comment les IA « voient » votre marque et où vous perdez de la place dans leurs réponses, ce qui est distinct du référencement classique.',
      },
      {
        question: 'Les résultats reflètent-ils une date précise ?',
        answer:
          'Oui. Les réponses des modèles et la lecture de votre site évoluent dans le temps. Le rapport correspond à l’instant de l’analyse ; une nouvelle analyse peut donner une image différente.',
      },
    ],
  },
  {
    id: 'rapport',
    title: 'Rapport & priorités',
    background: '#FDB734',
    items: [
      {
        question: 'Le rapport est-il lisible sans profil technique ?',
        answer:
          'Oui. Il est pensé pour être compris par un marketing ou un dirigeant, tout en gardant assez de précision pour décider quoi corriger en premier.',
      },
      {
        question: 'Que contient concrètement le rapport ?',
        answer:
          'Un score et ses piliers, des angles morts, des écarts concurrents quand c’est pertinent, et des priorités ordonnées pour agir sans vous éparpiller.',
      },
      {
        question: 'Puis-je partager le rapport en interne ?',
        answer:
          'Oui, dans un cadre d’accès contrôlé prévu pour la restitution. Le rapport n’est pas une page publique librement indexable.',
      },
      {
        question: 'Comment interpréter une réponse IA qui me surprend ?',
        answer:
          'Relisez-la avec le contexte du site, du marché et de la requête. Le rapport sert de base objectivée avant d’agir ou de contester une impression isolée.',
      },
      {
        question: 'Le rapport me dit-il quoi modifier mot pour mot ?',
        answer:
          'Il oriente vers les sujets à clarifier ou renforcer et l’ordre d’impact. La rédaction finale et l’exécution restent de votre côté.',
      },
    ],
  },
  {
    id: 'tarifs',
    title: 'Tarifs & accès',
    background: '#F16B5D',
    items: [
      {
        question: 'Quel est le prix d’un rapport ?',
        answer:
          'Une seule formule : paiement unique à 9,99 € TTC par rapport, sans abonnement.',
      },
      {
        question: 'Y a-t-il des frais cachés ou un abonnement ?',
        answer:
          'Non. Vous payez une fois par analyse. Relancer une nouvelle analyse est un nouveau paiement, indépendant des précédentes.',
      },
      {
        question: 'Comment se passe le paiement ?',
        answer:
          'Le paiement passe par Stripe, dans un tunnel sécurisé, séparé du contenu du rapport.',
      },
      {
        question: 'Que se passe-t-il après le paiement ?',
        answer:
          'Le traitement complet est déclenché. Vous suivez l’avancement puis accédez au rapport sans étapes inutiles une fois prêt.',
      },
      {
        question: 'Puis-je être facturé plus tard ou à réception du rapport ?',
        answer:
          'Le modèle actuel est le paiement avant lancement du scan complet, pour couvrir les coûts du traitement et sécuriser le service.',
      },
    ],
  },
  {
    id: 'securite',
    title: 'Données & confidentialité',
    background: '#A7A45A',
    items: [
      {
        question: 'Mes données sont-elles protégées ?',
        answer:
          'L’accès au rapport est contrôlé. Le paiement est traité par Stripe selon leurs standards de sécurité, sans mélanger les données bancaires avec le contenu du rapport.',
      },
      {
        question: 'Qory conserve-t-il une copie publique de mon analyse ?',
        answer:
          'Le rapport est conçu pour être consulté dans un cadre privé de restitution, pas comme une page ouverte au web.',
      },
      {
        question: 'Puis-je supprimer ou faire rectifier des informations ?',
        answer:
          'Pour toute demande liée aux données personnelles ou au traitement, utilisez les coordonnées indiquées dans les pages légales du site (mentions, confidentialité).',
      },
      {
        question: 'Les IA interrogées voient-elles mes données clients ?',
        answer:
          'Qory s’appuie sur ce qui est observable publiquement et sur les réponses des modèles dans le cadre de l’analyse. Il ne s’agit pas d’accéder à des données privées de vos clients.',
      },
      {
        question: 'Où trouver la politique de confidentialité complète ?',
        answer:
          'Sur la page Confidentialité du site Qory, avec le détail des traitements et vos droits.',
      },
    ],
  },
];
