import type {
  AnalysisResult,
  CrawlResult,
  FactAnalysisResult,
  PromptQuery,
  ScoreResult,
} from '@/types';
import {
  areLikelySameCompetitorName,
  collapseBareCompetitorAliases,
  computeCompositeSplitPlan,
  pickPreferredCompetitorName,
} from '@/lib/scanner/competitor-normalization';
import { classifyCompetitorEntity } from '@/lib/scanner/competitor-entities';
import { affectsVisibilityScore } from '@/lib/scanner/prompt-tracks';

function sanitizeCompetitorName(name: string, businessName?: string | null): string | null {
  const classified = classifyCompetitorEntity(name, businessName);
  return classified.type === 'brand' || classified.type === 'marketplace'
    ? classified.name
    : null;
}

export function calculateScore(
  analyses: AnalysisResult[],
  crawl: CrawlResult,
  prompts: PromptQuery[],
  factAnalyses: FactAnalysisResult[] = []
): ScoreResult {
  const scoringPromptIds = new Set(
    prompts.filter((prompt) => affectsVisibilityScore(prompt)).map((prompt) => prompt.id)
  );
  const relevantAnalyses = analyses.filter((analysis) => scoringPromptIds.has(analysis.promptId));
  const availableAnalyses = relevantAnalyses.filter((analysis) => !analysis.providerError);
  const totalAnalyses = availableAnalyses.length;
  const mentionedCount = availableAnalyses.filter((a) => a.organicMention ?? a.mentioned).length;
  const mentionRate = totalAnalyses > 0 ? (mentionedCount / totalAnalyses) * 100 : 0;

  // Calculate sub-scores
  const visibility = calculateVisibilityScore(availableAnalyses);
  const factualCoverage = calculateFactualCoverageScore(factAnalyses);
  const positioning = calculatePositioningScore(availableAnalyses, crawl.businessInfo.name);
  const sentiment = calculateSentimentScore(availableAnalyses);
  const technical = calculateTechnicalScore(crawl);

  // Technique 15% / Couverture factuelle 15% / Visibilité 45% / Positionnement 25%
  let globalScore = Math.round(
    technical.score * 0.15 +
    factualCoverage.score * 0.15 +
    visibility.score * 0.45 +
    positioning.score * 0.25
  );
  if (mentionRate < 20) {
    globalScore -= 8;
  }
  globalScore = clamp(globalScore, 0, 100);
  
  // Extract top competitors
  const topCompetitors = buildCompetitorCounts(availableAnalyses, crawl.businessInfo.name).slice(0, 5);
  
  return {
    globalScore,
    visibility,
    factualCoverage,
    positioning,
    sentiment,
    technical,
    mentionRate,
    topCompetitors,
  };
}

function calculateVisibilityScore(analyses: AnalysisResult[]) {
  const totalAnalyses = analyses.length;
  if (totalAnalyses === 0) {
    return { score: 0, details: 'Aucune analyse disponible' };
  }
  
  const mentionedCount = analyses.filter(a => a.organicMention ?? a.mentioned).length;
  const mentionRate = (mentionedCount / totalAnalyses) * 100;

  const positionBonus = analyses
    .filter(a => (a.organicMention ?? a.mentioned) && a.position !== null && a.position <= 3)
    .length * 5;
  
  const score = Math.min(100, Math.round(mentionRate + positionBonus));
  
  let details = '';
  if (score >= 80) {
    details = 'Excellente visibilité - Vous êtes régulièrement cité par les IA';
  } else if (score >= 60) {
    details = 'Bonne visibilité - Vous apparaissez dans plusieurs réponses';
  } else if (score >= 40) {
    details = 'Visibilité moyenne - Présence limitée dans les réponses IA';
  } else if (score >= 20) {
    details = 'Faible visibilité - Rarement mentionné par les IA';
  } else {
    details = 'Visibilité très faible - Quasi-absent des réponses IA';
  }
  
  return { score, details };
}

function calculateFactualCoverageScore(factAnalyses: FactAnalysisResult[]) {
  const availableFactAnalyses = factAnalyses.filter((analysis) => !analysis.providerError);

  if (availableFactAnalyses.length === 0) {
    return {
      score: 50,
      details: 'Collecte factuelle indisponible sur cet audit',
      measurable: false,
    };
  }

  const possibleFieldCount = availableFactAnalyses.reduce(
    (sum, analysis) => sum + analysis.possibleFieldCount,
    0
  );

  const detectedFieldCount = availableFactAnalyses.reduce(
    (sum, analysis) => sum + analysis.detectedFieldCount,
    0
  );

  if (possibleFieldCount === 0) {
    return {
      score: 50,
      details: 'Aucune donnée factuelle exploitable n’a été remontée par les IA',
      measurable: false,
    };
  }

  const score = Math.max(
    0,
    Math.min(100, Math.round((detectedFieldCount / possibleFieldCount) * 100))
  );

  let details = '';
  if (score >= 90) {
    details = 'Excellente couverture factuelle - les IA attribuent largement des informations pratiques à votre marque';
  } else if (score >= 70) {
    details = 'Bonne couverture factuelle - plusieurs informations pratiques sont correctement attribuées';
  } else if (score >= 50) {
    details = 'Couverture factuelle moyenne - les IA attribuent seulement une partie des informations utiles';
  } else {
    details = 'Couverture factuelle faible - peu d’informations pratiques sont attribuées par les IA';
  }

  return { score, details, measurable: true };
}

function calculateSentimentScore(analyses: AnalysisResult[]) {
  if (analyses.length === 0) {
    return { score: 50, details: 'Données partielles - sentiment non mesurable' };
  }

  const mentionedAnalyses = analyses.filter(a => a.mentioned && a.sentiment);
  
  if (mentionedAnalyses.length === 0) {
    return { score: 50, details: 'Aucun sentiment à analyser' };
  }
  
  const sentimentCounts = {
    positive: mentionedAnalyses.filter(a => a.sentiment === 'positive').length,
    neutral: mentionedAnalyses.filter(a => a.sentiment === 'neutral').length,
    negative: mentionedAnalyses.filter(a => a.sentiment === 'negative').length,
  };
  
  const positiveRate = (sentimentCounts.positive / mentionedAnalyses.length) * 100;
  const negativeRate = (sentimentCounts.negative / mentionedAnalyses.length) * 100;
  
  const score = Math.round(50 + positiveRate * 0.5 - negativeRate * 0.5);
  
  let details = '';
  if (score >= 80) {
    details = 'Sentiment très positif - Les IA vous recommandent favorablement';
  } else if (score >= 60) {
    details = 'Sentiment positif - Mentions généralement favorables';
  } else if (score >= 40) {
    details = 'Sentiment neutre - Mentions factuelles sans jugement';
  } else {
    details = 'Sentiment négatif - Certaines mentions défavorables';
  }
  
  return { score, details };
}

function calculatePositioningScore(
  analyses: AnalysisResult[],
  businessName?: string | null
) {
  if (analyses.length === 0) {
    return { score: 50, details: 'Données partielles - positionnement non mesurable' };
  }

  const totalAnalyses = analyses.length;
  const mentionedCount = analyses.filter((a) => a.organicMention ?? a.mentioned).length;
  const mentionRate = (mentionedCount / totalAnalyses) * 100;

  const competitorCounts = buildCompetitorCounts(analyses, businessName);
  const hasCompetitorSignal = competitorCounts.length > 0;

  if (!hasCompetitorSignal) {
    const score = clamp(Math.round(mentionRate * 0.7), 0, 100);
    return {
      score,
      details:
        'Positionnement estimé avec un signal concurrentiel partiel - score basé surtout sur le volume de citations observées.',
    };
  }

  const topCompetitorMentions = competitorCounts[0]?.mentionCount ?? 0;
  const targetRank =
    mentionedCount > 0
      ? competitorCounts.filter((entry) => entry.mentionCount > mentionedCount).length + 1
      : competitorCounts.length + 1;
  const dominanceScore =
    mentionedCount <= 0
      ? 0
      : topCompetitorMentions <= 0
      ? 100
      : clamp(Math.round((mentionedCount / topCompetitorMentions) * 50), 0, 100);
  const score = clamp(Math.round(mentionRate * 0.6 + dominanceScore * 0.4), 0, 100);

  let details = '';
  if (mentionedCount === 0) {
    details = 'Positionnement faible - votre marque n’est pas citée, alors que des concurrents nommés le sont.';
  } else if (targetRank === 1 && score >= 80) {
    details = 'Positionnement fort - votre volume de citations agrégées vous place devant les concurrents les plus visibles.';
  } else if (targetRank === 1) {
    details = 'Positionnement correct - vous êtes au niveau du premier groupe de concurrents en volume de citations.';
  } else if (score >= 60) {
    details = `Positionnement solide - vous êtes derrière le leader mais restez compétitif avec un rang agrégé #${targetRank}.`;
  } else if (score >= 40) {
    details = `Positionnement moyen - la concurrence reste devant en volume de citations (rang agrégé #${targetRank}).`;
  } else {
    details = `Positionnement faible - les concurrents captent davantage de citations que vous (rang agrégé #${targetRank}).`;
  }

  return { score, details };
}

function buildCompetitorCounts(
  analyses: AnalysisResult[],
  businessName?: string | null
): Array<{ name: string; mentionCount: number }> {
  const competitorCounts: Array<{ name: string; analysisKeys: Set<string> }> = [];

  analyses.forEach((analysis) => {
    const analysisKey = `${analysis.promptId}::${analysis.provider}`;
    const reportCompetitors = analysis.explicitCompetitors ?? analysis.competitors ?? [];
    reportCompetitors.forEach((competitor) => {
      const sanitized = sanitizeCompetitorName(competitor, businessName);
      if (!sanitized) return;

      const existingGroup = competitorCounts.find((entry) =>
        areLikelySameCompetitorName(entry.name, sanitized)
      );

      if (existingGroup) {
        existingGroup.name = pickPreferredCompetitorName(existingGroup.name, sanitized);
        existingGroup.analysisKeys.add(analysisKey);
        return;
      }

      competitorCounts.push({
        name: sanitized,
        analysisKeys: new Set<string>([analysisKey]),
      });
    });
  });

  applyCompositeSplit(competitorCounts);

  return competitorCounts
    .map((entry) => ({ name: entry.name, mentionCount: entry.analysisKeys.size }))
    .sort((a, b) => b.mentionCount - a.mentionCount);
}

function calculateTechnicalScore(crawl: CrawlResult) {
  let rawScore = 0;
  const maxRawScore = 30;
  const issues: string[] = [];
  
  // Robots.txt checks (20 points total - 5 per bot)
  if (!crawl.robotsTxt.blocksGPTBot) {
    rawScore += 5;
  } else {
    issues.push('GPTBot bloqué dans robots.txt');
  }
  
  if (!crawl.robotsTxt.blocksClaude) {
    rawScore += 5;
  } else {
    issues.push('ClaudeBot bloqué dans robots.txt');
  }
  
  if (!crawl.robotsTxt.blocksPerplexity) {
    rawScore += 5;
  } else {
    issues.push('PerplexityBot bloqué dans robots.txt');
  }
  
  if (!crawl.robotsTxt.blocksGoogleExtended) {
    rawScore += 5;
  } else {
    issues.push('Google-Extended bloqué dans robots.txt');
  }
  
  // Structured data (5 points)
  if (crawl.structuredData.hasSchemaOrg) {
    rawScore += 5;
  } else {
    issues.push('Pas de données structurées Schema.org');
  }
  
  // Sitemap (2 points)
  if (crawl.sitemap.exists) {
    rawScore += 2;
  } else {
    issues.push('Pas de sitemap.xml');
  }
  
  // HTTPS (3 points)
  if (crawl.performance.isHttps) {
    rawScore += 3;
  } else {
    issues.push('Site non sécurisé (pas de HTTPS)');
  }

  const score = Math.round((rawScore / maxRawScore) * 100);
  
  let details = '';
  if (score >= 90) {
    details = 'Configuration technique optimale pour les IA';
  } else if (score >= 70) {
    details = 'Bonne configuration technique avec quelques améliorations possibles';
  } else if (score >= 50) {
    details = `Configuration technique moyenne - ${issues.length} problème(s) détecté(s)`;
  } else {
    details = `Configuration technique faible - ${issues.length} problème(s) majeur(s)`;
  }
  
  return { score, details };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function applyCompositeSplit(
  groups: Array<{ name: string; analysisKeys: Set<string> }>
): void {
  const splitPlan = computeCompositeSplitPlan(groups.map((g) => g.name));
  if (splitPlan.size > 0) {
    const toRemove: number[] = [];
    const toAdd: Array<{ name: string; analysisKeys: Set<string> }> = [];

    for (let i = 0; i < groups.length; i++) {
      const parts = splitPlan.get(groups[i].name);
      if (!parts) continue;
      toRemove.push(i);
      for (const part of parts) {
        toAdd.push({ name: part, analysisKeys: new Set(groups[i].analysisKeys) });
      }
    }

    for (let i = toRemove.length - 1; i >= 0; i--) {
      groups.splice(toRemove[i], 1);
    }

    for (const entry of toAdd) {
      const existing = groups.find((g) => areLikelySameCompetitorName(g.name, entry.name));
      if (existing) {
        existing.name = pickPreferredCompetitorName(existing.name, entry.name);
        for (const key of entry.analysisKeys) existing.analysisKeys.add(key);
      } else {
        groups.push(entry);
      }
    }
  }

  collapseBareCompetitorAliases(groups, (target, source) => {
    for (const key of source.analysisKeys) target.analysisKeys.add(key);
  });
}
