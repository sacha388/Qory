import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/supabase';
import { logError } from '@/lib/logger';
import { applyRateLimit } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimit = await applyRateLimit(request, {
    keyPrefix: 'api:internal:retention',
    maxRequests: 12,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Trop de requêtes' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  const configuredToken = process.env.RETENTION_WORKER_TOKEN;
  const providedToken = request.headers.get('x-retention-token');

  if (!configuredToken) {
    return NextResponse.json({ error: 'Token rétention non configuré' }, { status: 503 });
  }

  const provided = providedToken ? Buffer.from(providedToken) : Buffer.alloc(0);
  const expected = Buffer.from(configuredToken);
  const tokenMatches =
    provided.length === expected.length &&
    crypto.timingSafeEqual(provided, expected);

  if (!tokenMatches) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const anonymizedCount = await db.applyAuditRetentionPolicy();
    return NextResponse.json({ success: true, anonymizedCount });
  } catch (error) {
    logError('audit_retention_run_error', {
      phase: 'internal_retention',
      error: error instanceof Error ? error.message : 'unknown_retention_run_error',
    });
    return NextResponse.json(
      { error: 'Impossible d’exécuter la rétention' },
      { status: 500 }
    );
  }
}
