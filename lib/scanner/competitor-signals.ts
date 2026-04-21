import type { AnalysisResult, PromptQuery } from '@/types';

const COMPETITOR_SIGNAL_CATEGORIES = new Set<PromptQuery['category']>([
  'alternative',
  'recommendation',
  'comparison',
  'listing',
  'situation',
]);

export function isCompetitorSignalCategory(category: PromptQuery['category']): boolean {
  return COMPETITOR_SIGNAL_CATEGORIES.has(category);
}

export function isCompetitiveBenchmarkPrompt(prompt: PromptQuery): boolean {
  if (prompt.benchmarkGroup) {
    return prompt.benchmarkGroup === 'competitor';
  }
  return isCompetitorSignalCategory(prompt.category);
}

export function getCompetitorSignalPromptIds(prompts: PromptQuery[]): Set<string> {
  return new Set(
    prompts
      .filter((prompt) => isCompetitiveBenchmarkPrompt(prompt))
      .map((prompt) => prompt.id)
  );
}

export function filterCompetitorSignalAnalyses(
  analyses: AnalysisResult[],
  prompts: PromptQuery[]
): AnalysisResult[] {
  const competitorSignalPromptIds = getCompetitorSignalPromptIds(prompts);
  return analyses.filter((analysis) => competitorSignalPromptIds.has(analysis.promptId));
}

export function getExplicitCompetitorNames(analysis: AnalysisResult): string[] {
  return analysis.explicitCompetitors ?? [];
}

export function getVisibleCompetitorNames(
  analysis: AnalysisResult,
  allowInferredFallback = false
): string[] {
  const explicit = getExplicitCompetitorNames(analysis);
  if (explicit.length > 0) {
    return explicit;
  }

  return allowInferredFallback ? analysis.competitors : [];
}
