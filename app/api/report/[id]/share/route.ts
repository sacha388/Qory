import { NextRequest, NextResponse } from 'next/server';
import { getSiteUrl } from '@/app/lib/site-url';
import { db } from '@/lib/supabase';
import type { ScanResults } from '@/types';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { logError } from '@/lib/logger';
import { assertAllowedOrigin } from '@/lib/security/origin';
import {
  appendShareTokenToPath,
  extractAuditAccessTokenFromRequest,
  getAuditAccessCookieName,
  getAuditAccessTokenTtlSeconds,
  getAuditShareTokenTtlSeconds,
  issueAuditShareToken,
  verifyAuditAccessToken,
} from '@/lib/security/audit-access';
import { isValidUuid } from '@/lib/security/validation';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await db.applyAuditRetentionPolicy().catch((error) => {
      logError('audit_retention_apply_error', {
        phase: 'report_share_retention',
        error: error instanceof Error ? error.message : 'unknown_report_share_retention_error',
      });
    });

    const rateLimit = await applyRateLimit(request, {
      keyPrefix: 'api:report:share',
      maxRequests: 20,
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

    const params = await context.params;
    const { id } = params;
    if (!isValidUuid(id)) {
      return NextResponse.json({ error: 'ID d’audit invalide' }, { status: 400 });
    }

    const accessToken = extractAuditAccessTokenFromRequest(request, undefined, id);
    if (!accessToken || !verifyAuditAccessToken(accessToken, id)) {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    const audit = await db.getAudit(id);
    if (!audit) {
      return NextResponse.json({ error: 'Audit introuvable' }, { status: 404 });
    }

    if (audit.retention_state === 'anonymized') {
      return NextResponse.json({ error: 'Audit archivé' }, { status: 410 });
    }

    if (!audit.paid) {
      return NextResponse.json({ error: 'Audit non payé' }, { status: 403 });
    }

    const fullReportReady =
      audit.status === 'completed' &&
      ((audit.results as ScanResults | null | undefined)?.analysisMode === 'full');
    if (!fullReportReady) {
      return NextResponse.json(
        { error: 'Le rapport final n’est pas encore prêt' },
        { status: 409 }
      );
    }

    const shareToken = issueAuditShareToken(id);
    const sharePath = appendShareTokenToPath(`/report/${id}`, shareToken);
    const shareUrl = `${getSiteUrl()}${sharePath}`;
    const ttlSeconds = getAuditShareTokenTtlSeconds();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    await db.touchAuditUsage(id);

    const response = NextResponse.json(
      {
        shareUrl,
        expiresAt,
        ttlSeconds,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );

    response.cookies.set({
      name: getAuditAccessCookieName(id),
      value: accessToken,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: getAuditAccessTokenTtlSeconds(),
    });

    return response;
  } catch (error) {
    logError('report_share_link_error', {
      phase: 'report_share_link',
      error: error instanceof Error ? error.message : 'unknown_report_share_link_error',
    });
    return NextResponse.json(
      { error: 'Impossible de créer le lien de partage' },
      { status: 500 }
    );
  }
}
