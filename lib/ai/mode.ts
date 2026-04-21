export type AiProvider = 'openai' | 'anthropic' | 'perplexity';

function normalize(value?: string | null): string {
  return (value || '').trim();
}

function isRealOpenAIKey(key?: string | null): boolean {
  const normalized = normalize(key);
  return normalized.startsWith('sk-');
}

function isRealAnthropicKey(key?: string | null): boolean {
  const normalized = normalize(key);
  return normalized.startsWith('sk-ant-');
}

function isRealPerplexityKey(key?: string | null): boolean {
  const normalized = normalize(key);
  return normalized.startsWith('pplx-');
}

export function isDemoModeEnabled(): boolean {
  return normalize(process.env.DEMO_MODE).toLowerCase() === 'true';
}

export function isOpenAIConfigured(): boolean {
  return isRealOpenAIKey(process.env.OPENAI_API_KEY);
}

export function isAnthropicConfigured(): boolean {
  return isRealAnthropicKey(process.env.ANTHROPIC_API_KEY);
}

export function isPerplexityConfigured(): boolean {
  return isRealPerplexityKey(process.env.PERPLEXITY_API_KEY);
}

export function hasAnyRealApiKey(): boolean {
  return (
    isOpenAIConfigured() ||
    isAnthropicConfigured() ||
    isPerplexityConfigured()
  );
}

export function hasRealApiKeys(): boolean {
  return (
    isOpenAIConfigured() &&
    isAnthropicConfigured() &&
    isPerplexityConfigured()
  );
}

export function shouldUseMockData(): boolean {
  if (isDemoModeEnabled()) {
    return true;
  }

  // Mock mode is only used when no real provider key is configured.
  return !hasAnyRealApiKey();
}

export function getProviderRuntimeSource(
  provider: AiProvider
): 'mock' | 'api' | 'unconfigured' {
  if (shouldUseMockData()) {
    return 'mock';
  }

  switch (provider) {
    case 'openai':
      return isOpenAIConfigured() ? 'api' : 'unconfigured';
    case 'anthropic':
      return isAnthropicConfigured() ? 'api' : 'unconfigured';
    case 'perplexity':
      return isPerplexityConfigured() ? 'api' : 'unconfigured';
    default:
      return 'unconfigured';
  }
}

export function getAiRuntimeSummary() {
  return {
    demo_mode: isDemoModeEnabled(),
    mock_mode: shouldUseMockData(),
    openai_configured: isOpenAIConfigured(),
    anthropic_configured: isAnthropicConfigured(),
    perplexity_configured: isPerplexityConfigured(),
    openai_source: getProviderRuntimeSource('openai'),
    anthropic_source: getProviderRuntimeSource('anthropic'),
    perplexity_source: getProviderRuntimeSource('perplexity'),
  };
}
