import 'server-only';
import type { AIResponse } from '@/types';
import { mockQueryPerplexity, mockQueryPerplexityFacts } from './mock';
import { getProviderRuntimeSource, isPerplexityConfigured, shouldUseMockData } from './mode';
import {
  buildBusinessFactsQuery,
  buildStructuredAuditPrompt,
  buildStructuredWebFactsPrompt,
  type MarketContext,
} from './audit-format';
import { logWarn } from '@/lib/logger';

const apiKey = process.env.PERPLEXITY_API_KEY;
const useMock = shouldUseMockData();
const providerSource = getProviderRuntimeSource('perplexity');
const AUDIT_MAX_TOKENS = 800;
const PERPLEXITY_MAX_CONCURRENT = 5;
const DEFAULT_PERPLEXITY_TIMEOUT_MS = 30000;

type QueryOptions = {
  temperature?: number;
  timeoutMs?: number;
};

let perplexityInFlight = 0;
const perplexityQueue: Array<() => void> = [];

export async function queryPerplexity(
  prompt: string,
  businessName?: string,
  marketContext?: MarketContext,
  options: QueryOptions = {}
): Promise<AIResponse> {
  // Use mock in demo/test mode
  if (useMock) {
    return mockQueryPerplexity(prompt, businessName);
  }

  return executePerplexityQuery(
    prompt,
    buildStructuredAuditPrompt(prompt, businessName, marketContext),
    options
  );
}

export async function queryPerplexityFacts(
  businessName?: string,
  options: QueryOptions = {}
): Promise<AIResponse> {
  const prompt = buildBusinessFactsQuery(businessName);

  if (useMock) {
    return mockQueryPerplexityFacts(prompt, businessName);
  }

  return executePerplexityQuery(prompt, buildStructuredWebFactsPrompt(businessName), {
    ...options,
    temperature: options.temperature ?? 0.2,
  });
}

async function executePerplexityQuery(
  prompt: string,
  structuredPrompt: string,
  options: QueryOptions = {}
): Promise<AIResponse> {
  if (!isPerplexityConfigured() || !apiKey) {
    return {
      model: 'sonar',
      provider: 'perplexity',
      prompt,
      response: '',
      error: 'Perplexity API key not configured',
      providerStatus: 'unconfigured',
      searchEnabled: true,
    };
  }

  try {
    const timeoutMs = options.timeoutMs ?? DEFAULT_PERPLEXITY_TIMEOUT_MS;
    const messageContent = await withPerplexityConcurrencyLimit(() =>
      executePerplexityRequest(structuredPrompt, timeoutMs, options.temperature)
    );

    return {
      model: 'sonar',
      provider: 'perplexity',
      prompt,
      response: messageContent,
      providerStatus: 'success',
      searchEnabled: true,
    };
  } catch (error: any) {
    logWarn('perplexity_query_error', {
      phase: 'provider_query',
      provider: 'perplexity',
      provider_source: providerSource,
      error: error?.message || 'unknown_perplexity_error',
    });

    const canRetry = shouldRetryError(error);
    if (canRetry) {
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const timeoutMs = options.timeoutMs ?? DEFAULT_PERPLEXITY_TIMEOUT_MS;
        const messageContent = await withPerplexityConcurrencyLimit(() =>
          executePerplexityRequest(structuredPrompt, timeoutMs)
        );

        return {
          model: 'sonar',
          provider: 'perplexity',
          prompt,
          response: messageContent,
          providerStatus: 'success',
          searchEnabled: true,
        };
      } catch (retryError: any) {
        return {
          model: 'sonar',
          provider: 'perplexity',
          prompt,
          response: '',
          error: retryError.message || 'Perplexity API error',
          providerStatus: 'error',
          searchEnabled: true,
        };
      }
    }

    return {
      model: 'sonar',
      provider: 'perplexity',
      prompt,
      response: '',
      error: error.message || 'Perplexity API error',
      providerStatus: 'error',
      searchEnabled: true,
    };
  }
}

function shouldRetryError(error: unknown): boolean {
  const message = String((error as { message?: string })?.message || '').toLowerCase();
  return (
    message.includes('429') ||
    message.includes('rate limit') ||
    /perplexity api error:\s*5\d\d/.test(message)
  );
}

async function executePerplexityRequest(
  structuredPrompt: string,
  timeoutMs: number,
  temperature = 0.5
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: structuredPrompt }],
        temperature,
        max_tokens: AUDIT_MAX_TOKENS,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      const details = errorBody.replace(/\s+/g, ' ').trim().slice(0, 240);
      throw new Error(`Perplexity API error: ${response.status}${details ? ` - ${details}` : ''}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`perplexity timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function withPerplexityConcurrencyLimit<T>(fn: () => Promise<T>): Promise<T> {
  if (perplexityInFlight >= PERPLEXITY_MAX_CONCURRENT) {
    await new Promise<void>((resolve) => {
      perplexityQueue.push(resolve);
    });
  }

  perplexityInFlight += 1;

  try {
    return await fn();
  } finally {
    perplexityInFlight = Math.max(0, perplexityInFlight - 1);
    const next = perplexityQueue.shift();
    if (next) next();
  }
}
