import type { NextRequest } from 'next/server';
import { db } from '@/lib/supabase';
import { logWarn } from '@/lib/logger';

export type RateLimitRule = {
  keyPrefix: string;
  maxRequests: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
let lastCleanupAt = 0;

const CLEANUP_INTERVAL_MS = 60_000;
const MAX_BUCKETS_BEFORE_CLEANUP = 5_000;

function cleanup(now: number) {
  if (
    now - lastCleanupAt < CLEANUP_INTERVAL_MS &&
    buckets.size < MAX_BUCKETS_BEFORE_CLEANUP
  ) {
    return;
  }

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }

  lastCleanupAt = now;
}

function getClientIp(request: NextRequest): string {
  const trustProxyHeaders = process.env.TRUST_PROXY_HEADERS === 'true';

  if (trustProxyHeaders) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      const first = forwardedFor.split(',')[0]?.trim();
      if (first) return first;
    }
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp?.trim()) return realIp.trim();

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp?.trim()) return cfIp.trim();

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }

  return 'unknown';
}

function formatRateLimitError(error: unknown): string {
  if (error instanceof Error) {
    const supabaseError = error as Error & { code?: string; details?: string };
    const parts = [supabaseError.message];
    if (supabaseError.code) parts.push(`code=${supabaseError.code}`);
    if (supabaseError.details) parts.push(`details=${supabaseError.details}`);
    return parts.join(', ');
  }
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if (obj.message) return String(obj.message);
    if (obj.code) return `db_error_code=${String(obj.code)}`;
  }
  return `non_error_thrown: ${typeof error}`;
}

export async function applyRateLimit(
  request: NextRequest,
  rule: RateLimitRule
): Promise<RateLimitResult> {
  return applyRateLimitWithFallback(request, rule);
}

export function skipRateLimit(): RateLimitResult {
  return { allowed: true, retryAfterSeconds: 0, remaining: -1 };
}

async function applyRateLimitWithFallback(
  request: NextRequest,
  rule: RateLimitRule
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const key = `${rule.keyPrefix}:${ip}`;

  try {
    return await db.checkRateLimit(key, rule.maxRequests, rule.windowMs);
  } catch (error) {
    logWarn('rate_limit_db_fallback', {
      phase: 'rate_limit',
      keyPrefix: rule.keyPrefix,
      ip,
      error: formatRateLimitError(error),
    });
    return applyInMemoryRateLimit(rule, key);
  }
}

function applyInMemoryRateLimit(
  rule: RateLimitRule,
  key: string
): {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
} {
  const now = Date.now();
  cleanup(now);
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + rule.windowMs,
    });

    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: Math.max(rule.maxRequests - 1, 0),
    };
  }

  existing.count += 1;
  buckets.set(key, existing);

  if (existing.count > rule.maxRequests) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000)
    );

    return {
      allowed: false,
      retryAfterSeconds,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: Math.max(rule.maxRequests - existing.count, 0),
  };
}
