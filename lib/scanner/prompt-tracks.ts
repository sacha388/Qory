import type { PromptQuery } from '@/types';

export function getPromptTrack(prompt: Pick<PromptQuery, 'analysisTrack'> | null | undefined): 'scoring' | 'insight' {
  return prompt?.analysisTrack === 'insight' ? 'insight' : 'scoring';
}

export function isInsightPrompt(prompt: Pick<PromptQuery, 'analysisTrack'> | null | undefined): boolean {
  return getPromptTrack(prompt) === 'insight';
}

export function isScoringPrompt(prompt: Pick<PromptQuery, 'analysisTrack'> | null | undefined): boolean {
  return getPromptTrack(prompt) === 'scoring';
}

export function affectsVisibilityScore(
  prompt: Pick<PromptQuery, 'analysisTrack' | 'affectsVisibilityScore'> | null | undefined
): boolean {
  if (!prompt) return true;
  if (typeof prompt.affectsVisibilityScore === 'boolean') {
    return prompt.affectsVisibilityScore;
  }
  return getPromptTrack(prompt) === 'scoring';
}

export function affectsCitationMatrix(
  prompt: Pick<PromptQuery, 'analysisTrack' | 'affectsCitationMatrix'> | null | undefined
): boolean {
  if (!prompt) return true;
  if (typeof prompt.affectsCitationMatrix === 'boolean') {
    return prompt.affectsCitationMatrix;
  }
  return getPromptTrack(prompt) === 'scoring';
}
