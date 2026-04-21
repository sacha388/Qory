import 'server-only';

import type {
  AnalysisResult,
  CrawlResult,
  PromptProfileSnapshot,
  Recommendation,
  RecommendationAxis,
  RecommendationEvidence,
  RecommendationPhase,
  Report,
  ScoreResult,
} from '@/types';

type MarketInsights = NonNullable<Report['marketInsights']>;
type RecommendationTone = 'local' | 'software' | 'commerce' | 'knowledge' | 'generic';

type RecommendationSignals = {
  siteName: string;
  siteType: PromptProfileSnapshot['siteType'] | null;
  domainVertical: PromptProfileSnapshot['domainVertical'] | null;
  tone: RecommendationTone;
  visibilityScore: number;
  factualCoverageScore: number;
  technicalScore: number;
  positioningScore: number;
  mentionRate: number;
  blockedBots: string[];
  missingIdentityFields: string[];
  hasSchemaOrg: boolean;
  hasSitemap: boolean;
  hasHttps: boolean;
  negativeSentimentCount: number;
  topCompetitorCount: number;
  topCompetitorName: string | null;
  trustLevel: MarketInsights['trustLevel']['level'] | null;
  pricePositioning: MarketInsights['pricePositioning']['label'] | null;
  polarizationLevel: MarketInsights['polarization']['level'] | null;
  signalStrength: MarketInsights['signalStrength'] | null;
  supportWeakness: boolean;
  pricingWeakness: boolean;
  businessDescription: string | null;
  absentQueryCount: number;
};

type CardContent = {
  description: string;
};

type CandidateRecommendation = Omit<Recommendation, 'priority'> & {
  score: number;
  active: boolean;
};

type RecommendationDefinition = {
  id: Recommendation['id'];
  axis: RecommendationAxis;
  phase: RecommendationPhase;
  impact: Recommendation['impact'];
  difficulty: Recommendation['difficulty'];
  isActive: (signals: RecommendationSignals) => boolean;
  score: (signals: RecommendationSignals) => number;
  buildTitle: (signals: RecommendationSignals) => string;
  buildEvidence: (signals: RecommendationSignals) => RecommendationEvidence[];
  buildFallbackContent: (signals: RecommendationSignals) => CardContent;
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} et ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;
}

function mapTone(siteType: PromptProfileSnapshot['siteType'] | null): RecommendationTone {
  if (siteType === 'local_service') return 'local';
  if (siteType === 'saas' || siteType === 'ai_native') return 'software';
  if (siteType === 'ecommerce' || siteType === 'marketplace') return 'commerce';
  if (siteType === 'documentation_knowledge' || siteType === 'education_training') {
    return 'knowledge';
  }
  return 'generic';
}

function buildSignals(params: {
  score: ScoreResult;
  crawl: CrawlResult;
  analyses: AnalysisResult[];
  marketInsights?: Report['marketInsights'];
  promptProfile?: PromptProfileSnapshot;
  positioningScore: number;
}): RecommendationSignals {
  const { score, crawl, analyses, marketInsights, promptProfile, positioningScore } = params;
  const blockedBots = [
    crawl.robotsTxt.blocksGPTBot ? 'GPTBot' : null,
    crawl.robotsTxt.blocksClaude ? 'ClaudeBot' : null,
    crawl.robotsTxt.blocksPerplexity ? 'PerplexityBot' : null,
  ].filter(Boolean) as string[];
  const missingIdentityFields = [
    !crawl.businessInfo.name ? 'nom' : null,
    !crawl.businessInfo.address ? 'adresse' : null,
    !crawl.businessInfo.phone ? 'téléphone' : null,
    !crawl.businessInfo.openingHours ? 'horaires' : null,
  ].filter(Boolean) as string[];
  const weaknesses = marketInsights?.weaknesses ?? [];

  return {
    siteName:
      crawl.businessInfo.name?.trim() || promptProfile?.siteName || 'votre site',
    siteType: promptProfile?.siteType ?? null,
    domainVertical: promptProfile?.domainVertical ?? null,
    tone: mapTone(promptProfile?.siteType ?? null),
    visibilityScore: clampScore(score.visibility.score),
    factualCoverageScore: clampScore(score.factualCoverage.score),
    technicalScore: clampScore(score.technical.score),
    positioningScore: clampScore(positioningScore),
    mentionRate: clampScore(score.mentionRate),
    blockedBots,
    missingIdentityFields,
    hasSchemaOrg: Boolean(crawl.structuredData.hasSchemaOrg),
    hasSitemap: Boolean(crawl.sitemap.exists),
    hasHttps: Boolean(crawl.performance.isHttps),
    negativeSentimentCount: analyses.filter((analysis) => analysis.sentiment === 'negative').length,
    topCompetitorCount: score.topCompetitors.length,
    topCompetitorName: score.topCompetitors[0]?.name ?? null,
    trustLevel: marketInsights?.trustLevel.level ?? null,
    pricePositioning: marketInsights?.pricePositioning.label ?? null,
    polarizationLevel: marketInsights?.polarization.level ?? null,
    signalStrength: marketInsights?.signalStrength ?? null,
    supportWeakness: weaknesses.some(
      (item) => item.category === 'support' || item.label === 'Support'
    ),
    pricingWeakness: weaknesses.some(
      (item) =>
        item.category === 'pricing' ||
        item.category === 'value_for_money' ||
        item.label === 'Prix' ||
        item.label === 'Rapport qualité-prix' ||
        item.label === 'Rapport qualite-prix'
    ),
    businessDescription: crawl.businessInfo.description?.trim() || null,
    absentQueryCount: analyses.filter((analysis) => !(analysis.organicMention ?? analysis.mentioned)).length,
  };
}

function buildEvidence(
  items: Array<RecommendationEvidence | null | false | undefined>
): RecommendationEvidence[] {
  return items.filter(Boolean) as RecommendationEvidence[];
}

function titleForSchema(signals: RecommendationSignals): string {
  if (signals.tone === 'local') return 'Ajouter le balisage Schema.org LocalBusiness';
  if (signals.tone === 'software') return 'Ajouter un balisage Schema.org SoftwareApplication';
  if (signals.tone === 'commerce') return 'Ajouter un balisage Schema.org Product';
  return 'Ajouter un balisage Schema.org adapté à votre site';
}

const CARD_DEFINITIONS: RecommendationDefinition[] = [
  {
    id: 'unblock_ai_bots',
    axis: 'readable',
    phase: 'this_week',
    impact: 'high',
    difficulty: 'easy',
    isActive: (signals) => signals.blockedBots.length > 0,
    score: (signals) => 92 + signals.blockedBots.length * 3,
    buildTitle: (signals) => `Débloquer ${formatList(signals.blockedBots)} dans robots.txt`,
    buildEvidence: (signals) =>
      buildEvidence([
        {
          label: 'blockedBots',
          value: signals.blockedBots,
          reason: 'Des bots IA importants ne peuvent pas lire vos pages.',
        },
      ]),
    buildFallbackContent: (signals) => {
      return {
        description: `${signals.siteName} bloque actuellement ${formatList(signals.blockedBots)} dans robots.txt. Autorisez ces bots pour que vos pages puissent être lues et reprises plus facilement dans les réponses IA.`,
      };
    },
  },
  {
    id: 'standardize_identity',
    axis: 'offer',
    phase: 'this_week',
    impact: 'high',
    difficulty: 'easy',
    isActive: (signals) =>
      signals.missingIdentityFields.length > 0 ||
      signals.factualCoverageScore < 62 ||
      signals.tone === 'local',
    score: (signals) =>
      70 +
      Math.max(0, 60 - signals.factualCoverageScore) +
      signals.missingIdentityFields.length * 6 +
      (signals.tone === 'local' ? 6 : 0),
    buildTitle: () => 'Standardiser vos informations clés sur toutes les pages',
    buildEvidence: (signals) =>
      buildEvidence([
        {
          label: 'factualCoverage',
          value: signals.factualCoverageScore,
          reason: 'Les informations de référence sont encore peu reprises par les IA.',
        },
        signals.missingIdentityFields.length > 0
          ? {
              label: 'missingIdentityFields',
              value: signals.missingIdentityFields,
              reason: 'Certaines informations essentielles manquent encore.',
            }
          : null,
      ]),
    buildFallbackContent: (signals) => {
      const missing =
        signals.missingIdentityFields.length > 0
          ? ` Des informations manquent encore (${formatList(signals.missingIdentityFields)}).`
          : '';
      return {
        description: `Votre score de couverture factuelle est de ${signals.factualCoverageScore}/100, signe que vos informations clés ne sont pas encore reprises de façon fiable.${missing} Rendez-les visibles et cohérentes sur vos pages importantes.`,
      };
    },
  },
  {
    id: 'fix_missing_business_fields',
    axis: 'offer',
    phase: 'this_week',
    impact: 'high',
    difficulty: 'easy',
    isActive: (signals) => signals.missingIdentityFields.length > 0,
    score: (signals) => 68 + signals.missingIdentityFields.length * 7,
    buildTitle: () => 'Compléter les informations essentielles manquantes',
    buildEvidence: (signals) =>
      buildEvidence([
        {
          label: 'missingIdentityFields',
          value: signals.missingIdentityFields,
          reason: 'Des informations clés manquent encore sur le site.',
        },
      ]),
    buildFallbackContent: (signals) => ({
      description: `Certaines informations essentielles manquent encore (${formatList(signals.missingIdentityFields)}). Complétez-les sur les pages clés pour aider les IA à restituer des informations plus fiables sur ${signals.siteName}.`,
    }),
  },
  {
    id: 'add_schema_org',
    axis: 'readable',
    phase: 'this_week',
    impact: 'high',
    difficulty: 'medium',
    isActive: (signals) => !signals.hasSchemaOrg,
    score: (signals) => 72 + (signals.tone === 'local' ? 5 : 0) + (signals.tone === 'software' ? 4 : 0),
    buildTitle: titleForSchema,
    buildEvidence: () =>
      buildEvidence([
        {
          label: 'schemaOrg',
          value: false,
          reason: 'Les données structurées manquent sur les pages importantes.',
        },
      ]),
    buildFallbackContent: (signals) => {
      const schemaLabel =
        signals.tone === 'local'
          ? 'LocalBusiness'
          : signals.tone === 'software'
          ? 'SoftwareApplication'
          : signals.tone === 'commerce'
          ? 'Product'
          : 'Organization/WebSite';
      return {
        description: `${signals.siteName} ne propose pas encore de données structurées détectables. Ajouter un balisage ${schemaLabel} aidera les moteurs et les IA à mieux comprendre votre activité et vos contenus clés.`,
      };
    },
  },
  {
    id: 'add_sitemap',
    axis: 'readable',
    phase: 'this_week',
    impact: 'medium',
    difficulty: 'easy',
    isActive: (signals) => !signals.hasSitemap,
    score: () => 58,
    buildTitle: () => 'Créer et soumettre un sitemap.xml',
    buildEvidence: () =>
      buildEvidence([
        {
          label: 'sitemap',
          value: false,
          reason: 'Le sitemap est absent ou non détecté.',
        },
      ]),
    buildFallbackContent: (signals) => {
      return {
        description: `Le site ${signals.siteName} n’expose pas encore de sitemap exploitable. Un sitemap à jour aide les moteurs et leurs index IA à découvrir plus vite vos pages importantes.`,
      };
    },
  },
  {
    id: 'enforce_https',
    axis: 'credible',
    phase: 'this_week',
    impact: 'high',
    difficulty: 'medium',
    isActive: (signals) => !signals.hasHttps,
    score: () => 76,
    buildTitle: () => 'Activer HTTPS sur tout le site',
    buildEvidence: () =>
      buildEvidence([
        {
          label: 'https',
          value: false,
          reason: 'Le site n’est pas entièrement servi en HTTPS.',
        },
      ]),
    buildFallbackContent: (signals) => {
      return {
        description: `${signals.siteName} n’est pas encore entièrement servi en HTTPS. Corriger ce point renforce votre fiabilité technique et supprime un signal de confiance faible inutile.`,
      };
    },
  },
  {
    id: 'create_intent_pages',
    axis: 'citable',
    phase: 'this_month',
    impact: 'high',
    difficulty: 'hard',
    isActive: (signals) => signals.visibilityScore < 55,
    score: (signals) => 65 + Math.max(0, 55 - signals.visibilityScore) + signals.topCompetitorCount * 2,
    buildTitle: (signals) =>
      signals.tone === 'local'
        ? 'Créer des pages services ciblées par besoin et zone'
        : 'Créer des pages ciblées sur les requêtes à fort intent',
    buildEvidence: (signals) =>
      buildEvidence([
        {
          label: 'visibility',
          value: signals.visibilityScore,
          reason: 'Votre visibilité reste faible sur les sujets qui comptent.',
        },
        signals.topCompetitorCount > 0
          ? {
              label: 'topCompetitors',
              value: signals.topCompetitorCount,
              reason: 'Des concurrents ressortent plus souvent que vous.',
            }
          : null,
      ]),
    buildFallbackContent: (signals) => {
      return {
        description: `Votre score de visibilité est de ${signals.visibilityScore}/100, ce qui montre que ${signals.siteName} manque encore de pages fortes sur les requêtes stratégiques. Créez des pages ciblées avec réponses directes et preuves concrètes.`,
      };
    },
  },
  {
    id: 'rattraper_competitors',
    axis: 'citable',
    phase: 'this_month',
    impact: 'medium',
    difficulty: 'medium',
    isActive: (signals) => signals.topCompetitorCount > 0,
    score: (signals) => 54 + signals.topCompetitorCount * 5,
    buildTitle: () => 'Rattraper les concurrents les plus cités',
    buildEvidence: (signals) =>
      buildEvidence([
        {
          label: 'topCompetitors',
          value: signals.topCompetitorCount,
          reason: 'Des concurrents ressortent plus souvent que vous.',
        },
        signals.topCompetitorName
          ? {
              label: 'topCompetitorName',
              value: signals.topCompetitorName,
              reason: 'Le concurrent le plus cité peut servir de repère prioritaire.',
            }
          : null,
      ]),
    buildFallbackContent: (signals) => ({
      description: `${signals.topCompetitorCount} concurrents ressortent plus souvent que ${signals.siteName} dans vos analyses. Identifiez les sujets où ils dominent et renforcez vos pages sur ces requêtes pour réduire l’écart.`,
    }),
  },
  {
    id: 'fill_query_gaps',
    axis: 'citable',
    phase: 'this_month',
    impact: 'medium',
    difficulty: 'medium',
    isActive: (signals) => signals.absentQueryCount >= 4,
    score: (signals) => 52 + Math.min(20, signals.absentQueryCount * 2),
    buildTitle: () => 'Combler les requêtes où vous êtes encore absent',
    buildEvidence: (signals) =>
      buildEvidence([
        {
          label: 'absentQueryCount',
          value: signals.absentQueryCount,
          reason: 'Plusieurs requêtes testées ne vous citent pas encore.',
        },
      ]),
    buildFallbackContent: (signals) => ({
      description: `${signals.absentQueryCount} requêtes testées ne vous citent pas encore. Identifiez les sujets où vous êtes absent et créez des contenus plus explicites sur ces besoins.`,
    }),
  },
  {
    id: 'strengthen_factual_coverage',
    axis: 'offer',
    phase: 'this_month',
    impact: 'high',
    difficulty: 'easy',
    isActive: (signals) => signals.factualCoverageScore < 50,
    score: (signals) => 64 + Math.max(0, 50 - signals.factualCoverageScore),
    buildTitle: () => 'Renforcer les informations factuelles attribuées par les IA',
    buildEvidence: (signals) =>
      buildEvidence([
        {
          label: 'factualCoverage',
          value: signals.factualCoverageScore,
          reason: 'Les IA attribuent encore trop peu d’informations fiables à votre marque.',
        },
      ]),
    buildFallbackContent: (signals) => ({
      description: `Les IA attribuent encore trop peu d’informations concrètes à ${signals.siteName}. Renforcez vos coordonnées, votre offre et vos repères de confiance sur les pages les plus visibles.`,
    }),
  },
  {
    id: 'build_faq_pages',
    axis: 'citable',
    phase: 'this_month',
    impact: 'medium',
    difficulty: 'easy',
    isActive: (signals) => signals.factualCoverageScore < 65 || signals.visibilityScore < 55,
    score: (signals) =>
      52 +
      Math.max(0, 65 - signals.factualCoverageScore) +
      Math.max(0, 55 - signals.visibilityScore) * 0.4,
    buildTitle: () => 'Créer une FAQ courte et orientée réponses',
    buildEvidence: (signals) =>
      buildEvidence([
        {
          label: 'factualCoverage',
          value: signals.factualCoverageScore,
          reason: 'Les IA ont besoin de réponses courtes et factuelles pour mieux vous reprendre.',
        },
      ]),
    buildFallbackContent: (signals) => {
      return {
        description: `${signals.siteName} a encore besoin de réponses plus directes pour faire remonter ses informations utiles. Une FAQ courte et factuelle est souvent plus facilement reprise par les IA.`,
      };
    },
  },
  {
    id: 'add_trust_proof',
    axis: 'credible',
    phase: 'this_month',
    impact: 'high',
    difficulty: 'easy',
    isActive: (signals) =>
      signals.trustLevel === 'low' ||
      signals.factualCoverageScore < 55 ||
      signals.mentionRate < 45,
    score: (signals) =>
      60 +
      (signals.trustLevel === 'low' ? 10 : 0) +
      Math.max(0, 55 - signals.factualCoverageScore) * 0.6,
    buildTitle: () => 'Renforcer les preuves qui soutiennent votre crédibilité',
    buildEvidence: (signals) =>
      buildEvidence([
        signals.trustLevel
          ? {
              label: 'trustLevel',
              value: signals.trustLevel,
              reason: 'Le niveau de confiance perçu reste à renforcer.',
            }
          : null,
        {
          label: 'mentionRate',
          value: signals.mentionRate,
          reason: 'Votre marque a encore besoin de signaux plus rassurants et mémorables.',
        },
      ]),
    buildFallbackContent: (signals) => {
      return {
        description:
          signals.trustLevel === 'low'
            ? 'Le signal de confiance du rapport reste fragile. Ajoutez davantage de preuves visibles, de références et d’éléments de réassurance sur vos pages clés.'
            : `${signals.siteName} manque encore de preuves visibles pour rassurer rapidement sur sa crédibilité. Ajoutez des références, garanties ou preuves concrètes là où les visiteurs décident.`,
      };
    },
  },
  {
    id: 'improve_reviews_reputation',
    axis: 'credible',
    phase: 'this_month',
    impact: 'medium',
    difficulty: 'hard',
    isActive: (signals) => signals.negativeSentimentCount > 0,
    score: (signals) => 50 + signals.negativeSentimentCount * 8,
    buildTitle: () => 'Renforcer votre réputation sur les sources externes',
    buildEvidence: (signals) =>
      buildEvidence([
        {
          label: 'negativeSentimentCount',
          value: signals.negativeSentimentCount,
          reason: 'Le rapport remonte des signaux négatifs dans certaines réponses IA.',
        },
      ]),
    buildFallbackContent: (signals) => {
      return {
        description: `${signals.negativeSentimentCount} signaux négatifs ont été détectés dans vos analyses. Travaillez vos avis récents, vos réponses publiques et vos preuves de fiabilité pour mieux cadrer la perception de ${signals.siteName}.`,
      };
    },
  },
  {
    id: 'clarify_pricing_value',
    axis: 'offer',
    phase: 'this_month',
    impact: 'high',
    difficulty: 'medium',
    isActive: (signals) =>
      signals.pricePositioning === 'premium' ||
      signals.pricePositioning === 'high_end' ||
      signals.pricingWeakness,
    score: (signals) =>
      56 +
      (signals.pricePositioning === 'premium' || signals.pricePositioning === 'high_end' ? 8 : 0) +
      (signals.pricingWeakness ? 6 : 0),
    buildTitle: () => 'Clarifier votre positionnement prix et votre valeur',
    buildEvidence: (signals) =>
      buildEvidence([
        signals.pricePositioning
          ? {
              label: 'pricePositioning',
              value: signals.pricePositioning,
              reason: 'Le positionnement prix perçu mérite d’être mieux expliqué.',
            }
          : null,
        signals.pricingWeakness
          ? {
              label: 'pricingWeakness',
              value: true,
              reason: 'Le rapport remonte une faiblesse sur le prix ou le rapport qualité-prix.',
            }
          : null,
      ]),
    buildFallbackContent: (signals) => {
      return {
        description:
          signals.pricePositioning === 'premium' || signals.pricePositioning === 'high_end'
            ? `${signals.siteName} est plutôt perçu comme premium, mais cette promesse doit être mieux justifiée. Rendez votre valeur plus explicite avec des preuves, comparatifs et éléments de réassurance.`
            : 'Le rapport indique que votre valeur perçue reste floue face au prix. Clarifiez ce qui justifie votre positionnement et ce que vos clients obtiennent concrètement.',
      };
    },
  },
  {
    id: 'clarify_support',
    axis: 'credible',
    phase: 'this_month',
    impact: 'medium',
    difficulty: 'easy',
    isActive: (signals) => signals.supportWeakness,
    score: () => 52,
    buildTitle: () => 'Mieux documenter votre support et votre accompagnement',
    buildEvidence: () =>
      buildEvidence([
        {
          label: 'supportWeakness',
          value: true,
          reason: 'Le support ressort comme un point faible dans les comparaisons.',
        },
      ]),
    buildFallbackContent: (signals) => {
      return {
        description: `${signals.siteName} laisse encore trop de questions ouvertes sur l’accompagnement et les délais de réponse. Rendez votre support plus visible pour renforcer la confiance et mieux vous comparer.`,
      };
    },
  },
  {
    id: 'strengthen_about_authority',
    axis: 'credible',
    phase: 'later',
    impact: 'medium',
    difficulty: 'medium',
    isActive: (signals) =>
      signals.factualCoverageScore < 60 ||
      signals.trustLevel === 'low' ||
      signals.topCompetitorCount > 0,
    score: (signals) =>
      42 +
      Math.max(0, 60 - signals.factualCoverageScore) * 0.5 +
      (signals.trustLevel === 'low' ? 6 : 0),
    buildTitle: () => 'Renforcer votre autorité et vos repères de marque',
    buildEvidence: (signals) =>
      buildEvidence([
        {
          label: 'factualCoverage',
          value: signals.factualCoverageScore,
          reason: 'Votre site doit mieux installer son autorité et ses repères de marque.',
        },
      ]),
    buildFallbackContent: (signals) => {
      return {
        description: `${signals.siteName} manque encore de repères d’autorité bien visibles. Renforcez votre page de référence et vos preuves d’expertise pour installer une image plus nette et plus crédible.`,
      };
    },
  },
  {
    id: 'add_case_studies',
    axis: 'citable',
    phase: 'later',
    impact: 'medium',
    difficulty: 'medium',
    isActive: (signals) =>
      signals.visibilityScore < 60 ||
      signals.topCompetitorCount > 0 ||
      signals.trustLevel === 'low',
    score: (signals) =>
      45 +
      Math.max(0, 60 - signals.visibilityScore) * 0.6 +
      signals.topCompetitorCount * 2,
    buildTitle: () => 'Publier des cas clients et exemples concrets',
    buildEvidence: (signals) =>
      buildEvidence([
        {
          label: 'visibility',
          value: signals.visibilityScore,
          reason: 'Des preuves concrètes aideraient vos pages à être davantage retenues et citées.',
        },
        signals.topCompetitorCount > 0
          ? {
              label: 'topCompetitors',
              value: signals.topCompetitorCount,
              reason: 'Des concurrents disposent probablement de contenus plus démonstratifs.',
            }
          : null,
      ]),
    buildFallbackContent: (signals) => {
      return {
        description: `${signals.siteName} a besoin de preuves plus démonstratives pour mieux ressortir face aux alternatives citées. Publiez des cas clients ou exemples concrets avec contexte, action et résultat observable.`,
      };
    },
  },
  {
    id: 'build_comparison_pages',
    axis: 'citable',
    phase: 'later',
    impact: 'medium',
    difficulty: 'hard',
    isActive: (signals) => signals.topCompetitorCount > 0,
    score: (signals) => 44 + signals.topCompetitorCount * 6,
    buildTitle: () => 'Créer des pages de comparaison face aux alternatives citées',
    buildEvidence: (signals) =>
      buildEvidence([
        {
          label: 'topCompetitors',
          value: signals.topCompetitorCount,
          reason: 'Des concurrents sont plus souvent cités que vous.',
        },
        signals.topCompetitorName
          ? {
              label: 'topCompetitorName',
              value: signals.topCompetitorName,
              reason: 'Le premier concurrent cité peut servir de point de comparaison.',
            }
          : null,
      ]),
    buildFallbackContent: (signals) => {
      const competitorHint = signals.topCompetitorName
        ? `, notamment face à ${signals.topCompetitorName}`
        : '';
      return {
        description: `${signals.topCompetitorCount} concurrents ressortent davantage que ${signals.siteName} dans vos analyses. Des pages comparatives bien cadrées peuvent vous aider à reprendre la main sur ces requêtes${competitorHint}.`,
      };
    },
  },
  {
    id: 'reduce_market_confusion',
    axis: 'offer',
    phase: 'later',
    impact: 'medium',
    difficulty: 'medium',
    isActive: (signals) =>
      signals.signalStrength === 'weak' ||
      signals.polarizationLevel === 'moderate' ||
      signals.polarizationLevel === 'high',
    score: (signals) =>
      48 +
      (signals.signalStrength === 'weak' ? 8 : 0) +
      (signals.polarizationLevel === 'high' ? 10 : signals.polarizationLevel === 'moderate' ? 5 : 0),
    buildTitle: () => 'Réduire les signaux contradictoires dans votre perception marché',
    buildEvidence: (signals) =>
      buildEvidence([
        signals.signalStrength
          ? {
              label: 'signalStrength',
              value: signals.signalStrength,
              reason: 'Le signal public reste trop faible ou trop diffus.',
            }
          : null,
        signals.polarizationLevel
          ? {
              label: 'polarization',
              value: signals.polarizationLevel,
              reason: 'La perception de votre marque n’est pas encore complètement stable.',
            }
          : null,
      ]),
    buildFallbackContent: (signals) => {
      return {
        description:
          signals.signalStrength === 'weak'
            ? `${signals.siteName} envoie encore un signal trop diffus pour que sa valeur soit lue de façon stable. Clarifiez votre promesse et vos preuves pour rendre votre positionnement plus net.`
            : 'Le rapport montre une perception encore contrastée selon les contextes. Alignez votre vocabulaire, vos preuves et vos cas d’usage pour réduire les signaux contradictoires.',
      };
    },
  },
];

function compareCandidates(a: CandidateRecommendation, b: CandidateRecommendation): number {
  if (b.score !== a.score) return b.score - a.score;
  const impactWeight = { high: 3, medium: 2, low: 1 };
  const difficultyWeight = { easy: 3, medium: 2, hard: 1 };
  const impactDiff = impactWeight[b.impact] - impactWeight[a.impact];
  if (impactDiff !== 0) return impactDiff;
  return difficultyWeight[b.difficulty] - difficultyWeight[a.difficulty];
}

function countByAxis(items: CandidateRecommendation[]): Record<RecommendationAxis, number> {
  return items.reduce(
    (acc, item) => {
      acc[item.axis] += 1;
      return acc;
    },
    { readable: 0, offer: 0, citable: 0, credible: 0 }
  );
}

function canAddCandidate(
  selected: CandidateRecommendation[],
  candidate: CandidateRecommendation,
  relaxAxisCap = false
): boolean {
  if (selected.some((item) => item.id === candidate.id)) return false;
  if (relaxAxisCap) return true;
  const counts = countByAxis(selected);
  return counts[candidate.axis] < 2;
}

function buildCandidate(definition: RecommendationDefinition, signals: RecommendationSignals): CandidateRecommendation {
  const content = definition.buildFallbackContent(signals);
  return {
    id: definition.id,
    title: definition.buildTitle(signals),
    description: content.description,
    difficulty: definition.difficulty,
    impact: definition.impact,
    axis: definition.axis,
    phase: definition.phase,
    evidence: definition.buildEvidence(signals),
    score: definition.score(signals),
    active: definition.isActive(signals),
  };
}

function selectRecommendations(candidates: CandidateRecommendation[]): {
  selected: CandidateRecommendation[];
} {
  const active = candidates.filter((candidate) => candidate.active).sort(compareCandidates);
  const allSorted = [...candidates].sort(compareCandidates);
  const targetCount = Math.min(Math.max(active.length, 5), 8);
  const selected: CandidateRecommendation[] = [];

  for (const candidate of active) {
    if (selected.length >= targetCount) break;
    if (!canAddCandidate(selected, candidate)) continue;
    selected.push(candidate);
  }

  for (const candidate of allSorted) {
    if (selected.length >= 5) break;
    if (!canAddCandidate(selected, candidate, true)) continue;
    selected.push(candidate);
  }

  return {
    selected: selected.sort(compareCandidates).slice(0, Math.min(Math.max(selected.length, 5), 8)),
  };
}

export function buildRecommendations(params: {
  auditId?: string;
  score: ScoreResult;
  crawl: CrawlResult;
  analyses: AnalysisResult[];
  marketInsights?: Report['marketInsights'];
  promptProfile?: PromptProfileSnapshot;
  positioningScore: number;
}): Recommendation[] {
  const signals = buildSignals(params);
  const candidates = CARD_DEFINITIONS.map((definition) => buildCandidate(definition, signals));
  const { selected } = selectRecommendations(candidates);

  return selected.map((recommendation, index) => ({
    ...recommendation,
    priority: index + 1,
  }));
}
