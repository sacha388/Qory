import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { kickScanWorker } from '@/lib/scanner/worker';
import { applyRateLimit } from '@/lib/security/rate-limit';

const MAX_ALLOWED_JOBS = 5;

export async function POST(request: NextRequest) {
  const rateLimit = await applyRateLimit(request, {
    keyPrefix: 'api:internal:scan-worker',
    maxRequests: 30,
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

  const configuredToken = process.env.SCAN_WORKER_TOKEN;
  const providedToken = request.headers.get('x-worker-token');

  if (!configuredToken) {
    return NextResponse.json({ error: 'Token worker non configuré' }, { status: 503 });
  }

  const provided = providedToken ? Buffer.from(providedToken) : Buffer.alloc(0);
  const expected = Buffer.from(configuredToken);
  const tokenMatches =
    provided.length === expected.length &&
    crypto.timingSafeEqual(provided, expected);

  if (!tokenMatches) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requested = Number(searchParams.get('maxJobs') || '2');
  const maxJobs = Number.isFinite(requested)
    ? Math.max(1, Math.min(MAX_ALLOWED_JOBS, Math.floor(requested)))
    : 2;

  await kickScanWorker(maxJobs);
  return NextResponse.json({ success: true, maxJobs });
}
