import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { kickScanWorker } from '@/lib/scanner/worker';
import { logError, logInfo } from '@/lib/logger';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { assertAllowedOrigin } from '@/lib/security/origin';
import {
  getAuditAccessCookieName,
  getAuditAccessTokenTtlSeconds,
  issueAuditAccessToken,
} from '@/lib/security/audit-access';
import { assertSafeExternalUrl } from '@/lib/security/ssrf';
import { normalizeScanUrlInput, parseJsonObject } from '@/lib/security/validation';

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await applyRateLimit(request, {
      keyPrefix: 'api:scan:create',
      maxRequests: 5,
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

    assertAllowedOrigin(request);

    const body = parseJsonObject(await request.json().catch(() => null));
    const normalizedUrl = normalizeScanUrlInput(body.url);
    const safeUrl = await assertSafeExternalUrl(normalizedUrl);

    const audit = await db.createAudit(safeUrl);
    await db.enqueueScanJob(audit.id);
    const accessToken = issueAuditAccessToken(audit.id);

    // Trigger worker opportunistically (job remains durable in DB even if this process stops).
    void kickScanWorker();

    logInfo('scan_enqueued', {
      auditId: audit.id,
      phase: 'enqueue',
      url: safeUrl,
    });

    const response = NextResponse.json({ auditId: audit.id, accessToken });
    response.cookies.set({
      name: getAuditAccessCookieName(audit.id),
      value: accessToken,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: getAuditAccessTokenTtlSeconds(),
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : 'Impossible de créer l’audit';
    const normalizedMessage = message.toLowerCase();
    const isValidationError =
      normalizedMessage.includes('url') ||
      normalizedMessage.includes('hostname') ||
      normalizedMessage.includes('hôte') ||
      normalizedMessage.includes('payload') ||
      normalizedMessage.includes('charge utile') ||
      normalizedMessage.includes('blocked') ||
      normalizedMessage.includes('bloqu') ||
      normalizedMessage.includes('private') ||
      normalizedMessage.includes('privé') ||
      normalizedMessage.includes('origin') ||
      normalizedMessage.includes('origine');

    logError('scan_enqueue_error', {
      phase: 'enqueue',
      error: message,
    });

    if (isValidationError) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Impossible de créer l’audit' },
      { status: 500 }
    );
  }
}
