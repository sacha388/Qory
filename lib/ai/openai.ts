import 'server-only';
import OpenAI from 'openai';
import type { AIResponse } from '@/types';
import {
  mockQueryOpenAI,
  mockQueryOpenAIFacts,
  mockQueryOpenAIInsight,
  mockQueryOpenAIMarketPositioning,
} from './mock';
import { getProviderRuntimeSource, isOpenAIConfigured, shouldUseMockData } from './mode';
import {
  buildBusinessFactsQuery,
  buildStructuredAuditPrompt,
  buildStructuredFactsPrompt,
  buildStructuredWebFactsPrompt,
  type MarketContext,
} from './audit-format';
import { logWarn } from '@/lib/logger';

const apiKey = process.env.OPENAI_API_KEY;
const useMock = shouldUseMockData();
const providerSource = getProviderRuntimeSource('openai');
const openai = !useMock && isOpenAIConfigured() && apiKey ? new OpenAI({ apiKey }) : null;
const OPENAI_MODEL = 'gpt-5.4-mini';
const OPENAI_WEB_MODEL = 'gpt-4o-mini-search-preview';
const AUDIT_MAX_TOKENS = 800;
const OPENAI_WEB_SEARCH_MAX_TOKENS = 650;
const OPENAI_WEB_FACT_MAX_TOKENS = 220;
const OPENAI_RETRY_ATTEMPTS = 3;
const OPENAI_MAX_CONCURRENT = 5;
const DEFAULT_OPENAI_TIMEOUT_MS = 30000;

type QueryOptions = {
  searchEnabled?: boolean;
  maxCompletionTokens?: number;
  temperature?: number;
  timeoutMs?: number;
};

type ExtractionOptions = {
  timeoutMs?: number;
};

let openaiInFlight = 0;
const openaiQueue: Array<() => void> = [];

function buildOpenAISamplingOptions(model: string, temperature?: number): { temperature?: number } {
  if (typeof temperature !== 'number') {
    return {};
  }

  // Some OpenAI models reject sampling params entirely.
  if (model.startsWith('gpt-5') || model.includes('search-preview')) {
    return {};
  }

  return { temperature };
}

export async function queryOpenAI(
  prompt: string,
  businessName?: string,
  marketContext?: MarketContext,
  options: QueryOptions = {}
): Promise<AIResponse> {
  // Use mock in demo/test mode
  if (useMock) {
    return mockQueryOpenAI(prompt, businessName);
  }

  return executeOpenAIQuery(
    prompt,
    buildStructuredAuditPrompt(prompt, businessName, marketContext),
    options
  );
}

export async function queryOpenAIFacts(
  businessName?: string,
  options: QueryOptions = {}
): Promise<AIResponse> {
  const prompt = buildBusinessFactsQuery(businessName);

  if (useMock) {
    return mockQueryOpenAIFacts(prompt, businessName);
  }

  return executeOpenAIQuery(
    prompt,
    options.searchEnabled
      ? buildStructuredWebFactsPrompt(businessName)
      : buildStructuredFactsPrompt(businessName),
    {
      ...options,
      maxCompletionTokens: options.searchEnabled ? OPENAI_WEB_FACT_MAX_TOKENS : AUDIT_MAX_TOKENS,
      temperature: options.temperature ?? 0.2,
    }
  );
}

export async function queryOpenAIMarketPositioning(
  prompt: string,
  structuredPrompt: string,
  maxCompletionTokens = 1100
): Promise<AIResponse> {
  if (useMock) {
    return mockQueryOpenAIMarketPositioning(prompt);
  }

  return executeOpenAIQuery(prompt, structuredPrompt, {
    searchEnabled: true,
    maxCompletionTokens,
    timeoutMs: DEFAULT_OPENAI_TIMEOUT_MS,
  });
}

export async function queryOpenAIInsight(
  prompt: string,
  structuredPrompt: string,
  kind: 'strengths' | 'value',
  businessName?: string,
  maxCompletionTokens = 700
): Promise<AIResponse> {
  if (useMock) {
    return mockQueryOpenAIInsight(prompt, kind, businessName);
  }

  return executeOpenAIQuery(prompt, structuredPrompt, {
    searchEnabled: true,
    maxCompletionTokens,
    timeoutMs: DEFAULT_OPENAI_TIMEOUT_MS,
  });
}

async function executeOpenAIQuery(
  prompt: string,
  structuredPrompt: string,
  options: QueryOptions = {}
): Promise<AIResponse> {
  if (!openai) {
    return {
      model: options.searchEnabled ? OPENAI_WEB_MODEL : OPENAI_MODEL,
      provider: 'openai',
      prompt,
      response: '',
      error: 'OpenAI API key not configured',
      providerStatus: 'unconfigured',
      searchEnabled: Boolean(options.searchEnabled),
    };
  }

  try {
    const response = await executeOpenAIQueryWithRetry(structuredPrompt, options);
    return {
      model: options.searchEnabled ? OPENAI_WEB_MODEL : OPENAI_MODEL,
      provider: 'openai',
      prompt,
      response,
      providerStatus: 'success',
      searchEnabled: Boolean(options.searchEnabled),
    };
  } catch (error: any) {
    logWarn('openai_query_error', {
      phase: 'provider_query',
      provider: 'openai',
      provider_source: providerSource,
      error: error?.message || 'unknown_openai_error',
    });

    return {
      model: options.searchEnabled ? OPENAI_WEB_MODEL : OPENAI_MODEL,
      provider: 'openai',
      prompt,
      response: '',
      error: error.message || 'OpenAI API error',
      providerStatus: 'error',
      searchEnabled: Boolean(options.searchEnabled),
    };
  }
}

async function executeOpenAIQueryWithRetry(
  structuredPrompt: string,
  options: QueryOptions
): Promise<string> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < OPENAI_RETRY_ATTEMPTS) {
    try {
      return await withOpenAIConcurrencyLimit(() =>
        options.searchEnabled
          ? executeOpenAIWebSearch(
              structuredPrompt,
              options.maxCompletionTokens,
              options.temperature,
              options.timeoutMs ?? DEFAULT_OPENAI_TIMEOUT_MS
            )
          : executeOpenAIChat(
              structuredPrompt,
              options.temperature,
              options.timeoutMs ?? DEFAULT_OPENAI_TIMEOUT_MS
            )
      );
    } catch (error) {
      lastError = error;
      attempt += 1;

      if (!shouldRetryError(error) || attempt >= OPENAI_RETRY_ATTEMPTS) {
        throw error;
      }

      const delayMs = extractRetryDelayMs(error, attempt);
      await sleep(delayMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('OpenAI API error');
}

async function executeOpenAIChat(
  structuredPrompt: string,
  temperature = 0.5,
  timeoutMs = DEFAULT_OPENAI_TIMEOUT_MS
): Promise<string> {
  return withOpenAIAbortTimeout(timeoutMs, async (signal) => {
    const completion = await openai!.chat.completions.create(
      {
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: structuredPrompt }],
        ...buildOpenAISamplingOptions(OPENAI_MODEL, temperature),
        max_completion_tokens: AUDIT_MAX_TOKENS,
        response_format: { type: 'json_object' },
      },
      {
        signal,
        timeout: timeoutMs,
        maxRetries: 0,
      }
    );

    return completion.choices[0]?.message?.content || '';
  });
}

async function executeOpenAIWebSearch(
  structuredPrompt: string,
  maxCompletionTokens = OPENAI_WEB_SEARCH_MAX_TOKENS,
  temperature = 0.5,
  timeoutMs = DEFAULT_OPENAI_TIMEOUT_MS
): Promise<string> {
  return withOpenAIAbortTimeout(timeoutMs, async (signal) => {
    const completion = await openai!.chat.completions.create(
      {
        model: OPENAI_WEB_MODEL,
        web_search_options: {},
        messages: [{ role: 'user', content: structuredPrompt }],
        ...buildOpenAISamplingOptions(OPENAI_WEB_MODEL, temperature),
        max_completion_tokens: maxCompletionTokens,
      },
      {
        signal,
        timeout: timeoutMs,
        maxRetries: 0,
      }
    );

    return completion.choices[0]?.message?.content || '';
  });
}

// Helper function for extraction tasks (used by analyzer)
export async function extractWithGPT(
  prompt: string,
  systemPrompt?: string,
  options: ExtractionOptions = {}
): Promise<string> {
  // In demo/test mode, return mock data
  if (useMock) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return '{"name": "Mon Entreprise", "address": "123 Rue de la République, 75001 Paris", "phone": "01 23 45 67 89", "email": "contact@entreprise.fr", "openingHours": "Lun-Ven: 9h-18h", "services": ["Service A", "Service B"], "description": "Entreprise de services"}';
  }
  
  if (!openai) {
    logWarn('openai_extraction_skipped', {
      phase: 'provider_extract',
      provider: 'openai',
      provider_source: providerSource,
      error: 'OpenAI API key not configured',
    });
    return '';
  }
  
  try {
    const timeoutMs = options.timeoutMs ?? DEFAULT_OPENAI_TIMEOUT_MS;
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    const completion = await withOpenAIAbortTimeout(timeoutMs, async (signal) =>
      openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages,
        ...buildOpenAISamplingOptions(OPENAI_MODEL, 0.3),
        max_completion_tokens: 1000,
        response_format: { type: 'json_object' },
      }, {
        signal,
        timeout: timeoutMs,
        maxRetries: 0,
      })
    );

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    logWarn('openai_extraction_error', {
      phase: 'provider_extract',
      provider: 'openai',
      provider_source: providerSource,
      error: error instanceof Error ? error.message : 'unknown_openai_extract_error',
    });
    return '';
  }
}

function shouldRetryError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const maybeError = error as { status?: number; code?: string; message?: string };
  if (typeof maybeError.status === 'number') {
    return maybeError.status === 429 || maybeError.status >= 500;
  }
  if (typeof maybeError.code === 'string') {
    if (maybeError.code === 'rate_limit_exceeded') return true;
    if (maybeError.code.startsWith('5')) return true;
  }
  const message = String(maybeError.message || '').toLowerCase();
  return message.includes('429') || message.includes('rate limit');
}

function extractRetryDelayMs(error: unknown, attempt: number): number {
  const maybeError = error as { message?: string } | undefined;
  const message = String(maybeError?.message || '');
  const retryAfterMatch = message.match(/try again in\s+([\d.]+)s/i);
  if (retryAfterMatch?.[1]) {
    const parsedSeconds = Number.parseFloat(retryAfterMatch[1]);
    if (Number.isFinite(parsedSeconds) && parsedSeconds > 0) {
      return Math.ceil(parsedSeconds * 1000) + 250;
    }
  }

  return Math.min(4000, 750 * attempt);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withOpenAIConcurrencyLimit<T>(fn: () => Promise<T>): Promise<T> {
  if (openaiInFlight >= OPENAI_MAX_CONCURRENT) {
    await new Promise<void>((resolve) => {
      openaiQueue.push(resolve);
    });
  }

  openaiInFlight += 1;

  try {
    return await fn();
  } finally {
    openaiInFlight = Math.max(0, openaiInFlight - 1);
    const next = openaiQueue.shift();
    if (next) next();
  }
}

async function withOpenAIAbortTimeout<T>(
  timeoutMs: number,
  fn: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fn(controller.signal);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`openai timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
