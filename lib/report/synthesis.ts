import type { Report } from '@/types';

type DataQuality = 'good' | 'partial' | 'poor';

type CrawlStatus = {
  crawlFailed?: boolean;
  crawlPartial?: boolean;
  failedFetchCount?: number;
  truncatedFetchCount?: number;
};

type BuildReportSynthesisOptions = {
  language?: 'fr' | 'en';
  globalScore: number;
  mentionRate: number;
  topCompetitorName?: string | null;
  factualCoverageScore: number;
  blocksAICrawlers: boolean;
  dataQuality: DataQuality;
  crawlStatus?: CrawlStatus | null;
};

type BuildGlobalExecutiveSummaryOptions = {
  language?: 'fr' | 'en';
  globalScore: number;
  visibilityScore: number;
  positioningScore: number;
  technicalScore: number;
  mentionRate: number;
  topCompetitorName?: string | null;
  factualCoverageScore: number;
  blockedBots?: string[];
  hasSchema: boolean;
  hasSitemap: boolean;
  hasHttps: boolean;
  marketInsights?: Report['marketInsights'];
  recommendations?: Report['recommendations'];
  dataQuality: DataQuality;
  crawlStatus?: CrawlStatus | null;
};

function joinNaturalList(items: string[], language: 'fr' | 'en'): string {
  const filtered = items.map((item) => item.trim()).filter(Boolean);
  if (filtered.length === 0) return '';
  if (filtered.length === 1) return filtered[0];
  if (filtered.length === 2) {
    return language === 'en'
      ? `${filtered[0]} and ${filtered[1]}`
      : `${filtered[0]} et ${filtered[1]}`;
  }

  const head = filtered.slice(0, -1).join(', ');
  const tail = filtered[filtered.length - 1];
  return language === 'en' ? `${head}, and ${tail}` : `${head} et ${tail}`;
}

function toSentenceContinuation(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function buildCrawlCaveat(
  language: 'fr' | 'en',
  crawlStatus?: CrawlStatus | null
): string {
  const failedFetchCount = Number(crawlStatus?.failedFetchCount || 0);
  const truncatedFetchCount = Number(crawlStatus?.truncatedFetchCount || 0);

  if (failedFetchCount <= 0 && truncatedFetchCount <= 0) {
    return '';
  }

  if (language === 'en') {
    const impact = 'This report remains useful, but some indicators may be underestimated.';

    if (failedFetchCount > 0 && truncatedFetchCount > 0) {
      return `Some pages could not be crawled during analysis (${failedFetchCount} failure${failedFetchCount > 1 ? 's' : ''}), and others were unusually heavy and could only be analyzed partially (${truncatedFetchCount} truncated page${truncatedFetchCount > 1 ? 's' : ''}). ${impact}`;
    }

    if (failedFetchCount > 0) {
      return `Some pages could not be crawled during analysis (${failedFetchCount} failure${failedFetchCount > 1 ? 's' : ''}). ${impact}`;
    }

    return `Some pages were unusually heavy and could only be analyzed partially (${truncatedFetchCount} truncated page${truncatedFetchCount > 1 ? 's' : ''}). ${impact}`;
  }

  const impact = 'Le rapport reste exploitable, mais certains indicateurs peuvent être sous-estimés.';

  if (failedFetchCount > 0 && truncatedFetchCount > 0) {
    return `Certaines pages du site n'ont pas pu être crawlées pendant l'analyse (${failedFetchCount} échec${failedFetchCount > 1 ? 's' : ''}), et d'autres étaient très volumineuses et n'ont été analysées qu'en partie (${truncatedFetchCount} page${truncatedFetchCount > 1 ? 's' : ''} tronquée${truncatedFetchCount > 1 ? 's' : ''}). ${impact}`;
  }

  if (failedFetchCount > 0) {
    return `Certaines pages du site n'ont pas pu être crawlées pendant l'analyse (${failedFetchCount} échec${failedFetchCount > 1 ? 's' : ''}). ${impact}`;
  }

  return `Certaines pages du site étaient très volumineuses et n'ont été analysées qu'en partie (${truncatedFetchCount} page${truncatedFetchCount > 1 ? 's' : ''} tronquée${truncatedFetchCount > 1 ? 's' : ''}). ${impact}`;
}

function buildDataQualityCaveat(
  language: 'fr' | 'en',
  dataQuality: DataQuality,
  crawlStatus?: CrawlStatus | null
): string {
  const crawlCaveat = buildCrawlCaveat(language, crawlStatus);
  if (crawlCaveat) {
    return crawlCaveat;
  }

  if (dataQuality === 'poor') {
    return language === 'en'
      ? 'Collected data is too partial on this report. Treat the result as directional and confirm it before any critical decision.'
      : 'Les données collectées restent trop partielles sur ce rapport. Le résultat donne une tendance et doit être confirmé avant toute décision critique.';
  }

  if (dataQuality === 'partial') {
    return language === 'en'
      ? 'Some data is incomplete on this report. It remains useful for prioritization, but a few indicators may be underestimated.'
      : 'Certaines données sont incomplètes sur ce rapport. Il reste utile pour prioriser vos actions, mais quelques indicateurs peuvent être sous-estimés.';
  }

  return '';
}

export function buildReportSynthesis({
  language = 'fr',
  globalScore,
  mentionRate,
  topCompetitorName,
  factualCoverageScore,
  blocksAICrawlers,
  dataQuality,
  crawlStatus,
}: BuildReportSynthesisOptions): string {
  const safeMentionRate = Math.max(0, Math.min(100, Math.round(mentionRate)));
  const topCompetitor = topCompetitorName?.trim() || null;
  const isGlobalGood = globalScore >= 70;
  const isGlobalAverage = globalScore >= 40 && globalScore < 70;
  const parts: string[] = [];

  if (language === 'en') {
    parts.push(
      `Your overall AI visibility score is ${isGlobalGood ? 'good' : isGlobalAverage ? 'average' : 'low'}.`
    );
    if (safeMentionRate < 50) {
      if (topCompetitor) {
        parts.push(
          `On citations specifically, you appear in ${safeMentionRate}% of relevant prompts, while ${topCompetitor} shows up more often.`
        );
      } else {
        parts.push(
          `On citations specifically, you appear in ${safeMentionRate}% of relevant prompts.`
        );
      }
    } else {
      parts.push(
        `On citations specifically, you appear in ${safeMentionRate}% of relevant prompts, which is encouraging.`
      );
    }
    if (factualCoverageScore < 50) {
      parts.push(
        'AI systems still attribute too few concrete business facts to your brand.'
      );
    }
    if (blocksAICrawlers) {
      parts.push('Your technical configuration partially blocks AI crawlers.');
    }
  } else {
    parts.push(
      `Votre score global de visibilité IA est ${isGlobalGood ? 'bon' : isGlobalAverage ? 'moyen' : 'faible'}.`
    );
    if (safeMentionRate < 50) {
      if (topCompetitor) {
        parts.push(
          `Côté citations, vous n'apparaissez que dans ${safeMentionRate}% des requêtes pertinentes, tandis que ${topCompetitor} ressort plus souvent.`
        );
      } else {
        parts.push(
          `Côté citations, vous n'apparaissez que dans ${safeMentionRate}% des requêtes pertinentes.`
        );
      }
    } else {
      parts.push(
        `Côté citations, vous apparaissez dans ${safeMentionRate}% des requêtes pertinentes, ce qui est encourageant.`
      );
    }
    if (factualCoverageScore < 50) {
      parts.push(
        'Les IA attribuent encore trop peu d’informations concrètes à votre marque.'
      );
    }
    if (blocksAICrawlers) {
      parts.push('Votre configuration technique bloque partiellement les crawlers IA.');
    }
  }

  const caveat = buildDataQualityCaveat(language, dataQuality, crawlStatus);
  if (caveat) {
    parts.push(caveat);
  }

  return parts.join(' ').trim();
}

export function buildGlobalExecutiveSummary({
  language = 'fr',
  globalScore,
  visibilityScore,
  positioningScore,
  technicalScore,
  mentionRate,
  topCompetitorName,
  factualCoverageScore,
  blockedBots = [],
  hasSchema,
  hasSitemap,
  hasHttps,
  marketInsights,
  recommendations = [],
  dataQuality,
  crawlStatus,
}: BuildGlobalExecutiveSummaryOptions): string {
  const safeMentionRate = Math.max(0, Math.min(100, Math.round(mentionRate)));
  const topCompetitor = topCompetitorName?.trim() || null;
  const isGlobalGood = globalScore >= 70;
  const isGlobalAverage = globalScore >= 40 && globalScore < 70;
  const scoreSentence =
    language === 'en'
      ? `Overall, your report lands at ${globalScore}/100 with ${visibilityScore}/100 on visibility, ${positioningScore}/100 on positioning, and ${technicalScore}/100 on technical readiness.`
      : `Globalement, votre rapport ressort à ${globalScore}/100 avec ${visibilityScore}/100 en visibilité, ${positioningScore}/100 en positionnement et ${technicalScore}/100 en socle technique.`;

  const citationSentence =
    language === 'en'
      ? topCompetitor
        ? `On the tested prompts, you appear in ${safeMentionRate}% of answers, while ${topCompetitor} remains the main citation benchmark.`
        : `On the tested prompts, you appear in ${safeMentionRate}% of answers.`
      : topCompetitor
      ? `Sur les requêtes testées, vous apparaissez dans ${safeMentionRate}% des réponses, tandis que ${topCompetitor} reste le principal repère concurrent en citation.`
      : `Sur les requêtes testées, vous apparaissez dans ${safeMentionRate}% des réponses.`;

  const marketParts: string[] = [];
  if (marketInsights) {
    marketParts.push(marketInsights.marketSentiment.summary);
    marketParts.push(marketInsights.pricePositioning.summary);

    if (marketInsights.strengths.length > 0) {
      marketParts.push(
        language === 'en'
          ? `The clearest strengths are ${joinNaturalList(
              marketInsights.strengths.map((item) => item.label.toLowerCase()),
              language
            )}.`
          : `Les points forts les plus nets concernent ${joinNaturalList(
              marketInsights.strengths.map((item) => item.label.toLowerCase()),
              language
            )}.`
      );
    }

    if (marketInsights.weaknesses.length > 0) {
      marketParts.push(
        language === 'en'
          ? `The main friction points concern ${joinNaturalList(
              marketInsights.weaknesses.map((item) => item.label.toLowerCase()),
              language
            )}.`
          : `Les principaux points de friction concernent ${joinNaturalList(
              marketInsights.weaknesses.map((item) => item.label.toLowerCase()),
              language
            )}.`
      );
    }
  }

  const riskParts: string[] = [];
  if (factualCoverageScore < 50) {
    riskParts.push(
      language === 'en'
        ? 'AI systems still attribute too few concrete business facts to your brand.'
        : 'Les IA attribuent encore trop peu d’informations concrètes à votre marque.'
    );
  }
  if (blockedBots.length > 0) {
    riskParts.push(
      language === 'en'
        ? `AI crawlability is reduced because ${joinNaturalList(blockedBots, language)} ${blockedBots.length > 1 ? 'are' : 'is'} blocked.`
        : `La crawlabilité IA reste freinée car ${joinNaturalList(blockedBots, language)} ${blockedBots.length > 1 ? 'sont bloqués' : 'est bloqué'}.`
    );
  }
  if (!hasSchema) {
    riskParts.push(
      language === 'en'
        ? 'Structured data is missing on key pages.'
        : 'Les données structurées manquent sur les pages clés.'
    );
  }
  if (!hasSitemap) {
    riskParts.push(
      language === 'en' ? 'The sitemap is missing.' : 'Le sitemap est absent.'
    );
  }
  if (!hasHttps) {
    riskParts.push(
      language === 'en' ? 'HTTPS is not fully active.' : "Le HTTPS n'est pas pleinement actif."
    );
  }

  const immediateRecommendations =
    recommendations.filter((item) => item.phase === 'this_week').slice(0, 3);
  const actionTitles = (immediateRecommendations.length > 0
    ? immediateRecommendations
    : recommendations.slice(0, 3)
  ).map((item) => toSentenceContinuation(item.title));

  const actionSentence =
    actionTitles.length > 0
      ? language === 'en'
        ? `The immediate priorities are ${joinNaturalList(actionTitles, language)}.`
        : `Les priorités immédiates sont ${joinNaturalList(actionTitles, language)}.`
      : '';

  const caveat = buildDataQualityCaveat(language, dataQuality, crawlStatus);

  return [
    scoreSentence,
    citationSentence,
    ...marketParts,
    ...riskParts,
    actionSentence,
    caveat,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
}
