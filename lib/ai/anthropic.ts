import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import type { AIResponse } from '@/types';
import { mockQueryAnthropic, mockQueryAnthropicFacts } from './mock';
import { getProviderRuntimeSource, isAnthropicConfigured, shouldUseMockData } from './mode';
import {
  buildBusinessFactsQuery,
  buildStructuredAuditPrompt,
  buildStructuredFactsPrompt,
  buildStructuredWebFactsPrompt,
  type MarketContext,
} from './audit-format';
import { logWarn } from '@/lib/logger';

const apiKey = process.env.ANTHROPIC_API_KEY;
const useMock = shouldUseMockData();
const providerSource = getProviderRuntimeSource('anthropic');
const anthropic = !useMock && isAnthropicConfigured() && apiKey ? new Anthropic({ apiKey }) : null;
const ANTHROPIC_MODEL = 'claude-haiku-4-5';
const ANTHROPIC_WEB_MODEL = 'claude-sonnet-4-20250514';
const AUDIT_MAX_TOKENS = 800;
const ANTHROPIC_MAX_CONCURRENT = 5;
const DEFAULT_ANTHROPIC_TIMEOUT_MS = 30000;

type QueryOptions = {
  searchEnabled?: boolean;
  temperature?: number;
  timeoutMs?: number;
};

let anthropicInFlight = 0;
const anthropicQueue: Array<() => void> = [];

export async function queryAnthropic(
  prompt: string,
  businessName?: string,
  marketContext?: MarketContext,
  options: QueryOptions = {}
): Promise<AIResponse> {
  // Use mock in demo/test mode
  if (useMock) {
    return mockQueryAnthropic(prompt, businessName);
  }

  return executeAnthropicQuery(
    prompt,
    buildStructuredAuditPrompt(prompt, businessName, marketContext),
    options
  );
}

export async function queryAnthropicFacts(
  businessName?: string,
  options: QueryOptions = {}
): Promise<AIResponse> {
  const prompt = buildBusinessFactsQuery(businessName);

  if (useMock) {
    return mockQueryAnthropicFacts(prompt, businessName);
  }

  return executeAnthropicQuery(
    prompt,
    options.searchEnabled
      ? buildStructuredWebFactsPrompt(businessName)
      : buildStructuredFactsPrompt(businessName),
    {
      ...options,
      temperature: options.temperature ?? 0.2,
    }
  );
}

async function executeAnthropicQuery(
  prompt: string,
  structuredPrompt: string,
  options: QueryOptions = {}
): Promise<AIResponse> {
  if (!anthropic) {
    return {
      model: options.searchEnabled ? ANTHROPIC_WEB_MODEL : ANTHROPIC_MODEL,
      provider: 'anthropic',
      prompt,
      response: '',
      error: 'Anthropic API key not configured',
      providerStatus: 'unconfigured',
      searchEnabled: Boolean(options.searchEnabled),
    };
  }

  try {
    const timeoutMs = options.timeoutMs ?? DEFAULT_ANTHROPIC_TIMEOUT_MS;
    const response = await withAnthropicConcurrencyLimit(() =>
      options.searchEnabled
        ? executeAnthropicWebSearch(
            structuredPrompt,
            timeoutMs,
            options.temperature
          )
        : executeAnthropicNative(
            structuredPrompt,
            timeoutMs,
            options.temperature
          )
    );
    
    return {
      model: options.searchEnabled ? ANTHROPIC_WEB_MODEL : ANTHROPIC_MODEL,
      provider: 'anthropic',
      prompt,
      response,
      providerStatus: 'success',
      searchEnabled: Boolean(options.searchEnabled),
    };
  } catch (error: any) {
    logWarn('anthropic_query_error', {
      phase: 'provider_query',
      provider: 'anthropic',
      provider_source: providerSource,
      error: error?.message || 'unknown_anthropic_error',
    });

    const canRetry = shouldRetryError(error);
    if (canRetry) {
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const timeoutMs = options.timeoutMs ?? DEFAULT_ANTHROPIC_TIMEOUT_MS;
        const retryResponse = await withAnthropicConcurrencyLimit(() =>
          options.searchEnabled
            ? executeAnthropicWebSearch(structuredPrompt, timeoutMs)
            : executeAnthropicNative(structuredPrompt, timeoutMs)
        );
        
        return {
          model: options.searchEnabled ? ANTHROPIC_WEB_MODEL : ANTHROPIC_MODEL,
          provider: 'anthropic',
          prompt,
          response: retryResponse,
          providerStatus: 'success',
          searchEnabled: Boolean(options.searchEnabled),
        };
      } catch (retryError: any) {
        return {
          model: options.searchEnabled ? ANTHROPIC_WEB_MODEL : ANTHROPIC_MODEL,
          provider: 'anthropic',
          prompt,
          response: '',
          error: retryError.message || 'Anthropic API error',
          providerStatus: 'error',
          searchEnabled: Boolean(options.searchEnabled),
        };
      }
    }

    return {
      model: options.searchEnabled ? ANTHROPIC_WEB_MODEL : ANTHROPIC_MODEL,
      provider: 'anthropic',
      prompt,
      response: '',
      error: error.message || 'Anthropic API error',
      providerStatus: 'error',
      searchEnabled: Boolean(options.searchEnabled),
    };
  }
}

async function executeAnthropicNative(
  structuredPrompt: string,
  timeoutMs: number,
  temperature = 0.5
): Promise<string> {
  return withAnthropicAbortTimeout(timeoutMs, async (signal) => {
    const message = await anthropic!.messages.create(
      {
        model: ANTHROPIC_MODEL,
        max_tokens: AUDIT_MAX_TOKENS,
        temperature,
        system: 'Tu réponds UNIQUEMENT en JSON valide. Pas de texte avant ou après.',
        messages: [
          { role: 'user', content: structuredPrompt },
          { role: 'assistant', content: '{' },
        ],
      },
      {
        signal,
        timeout: timeoutMs,
        maxRetries: 0,
      }
    );

    const rawText = message.content[0]?.type === 'text' ? message.content[0].text : '';
    return '{' + rawText;
  });
}

async function executeAnthropicWebSearch(
  structuredPrompt: string,
  timeoutMs: number,
  temperature = 0.2
): Promise<string> {
  return withAnthropicAbortTimeout(timeoutMs, async (signal) => {
    const message = await anthropic!.messages.create(
      {
        model: ANTHROPIC_WEB_MODEL,
        max_tokens: 1200,
        temperature,
        system: 'Utilise la recherche web si nécessaire. Tu réponds UNIQUEMENT en JSON valide. Pas de texte avant ou après.',
        messages: [{ role: 'user', content: structuredPrompt }],
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 3,
        }],
      } as any,
      {
        signal,
        timeout: timeoutMs,
        maxRetries: 0,
      }
    );

    const textBlocks = message.content
      .filter((block: any) => block?.type === 'text')
      .map((block: any) => String(block.text || '').trim())
      .filter(Boolean);

    return textBlocks[textBlocks.length - 1] || '';
  });
}

async function withAnthropicConcurrencyLimit<T>(fn: () => Promise<T>): Promise<T> {
  if (anthropicInFlight >= ANTHROPIC_MAX_CONCURRENT) {
    await new Promise<void>((resolve) => {
      anthropicQueue.push(resolve);
    });
  }

  anthropicInFlight += 1;

  try {
    return await fn();
  } finally {
    anthropicInFlight = Math.max(0, anthropicInFlight - 1);
    const next = anthropicQueue.shift();
    if (next) next();
  }
}

function shouldRetryError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const maybeError = error as { status?: number; code?: string; message?: string };
  if (typeof maybeError.status === 'number') {
    return maybeError.status === 429 || maybeError.status >= 500;
  }
  const message = String(maybeError.message || '').toLowerCase();
  return message.includes('429') || message.includes('rate limit');
}

async function withAnthropicAbortTimeout<T>(
  timeoutMs: number,
  fn: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fn(controller.signal);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`anthropic timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
