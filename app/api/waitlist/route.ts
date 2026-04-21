import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { logError } from '@/lib/logger';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { assertAllowedOrigin } from '@/lib/security/origin';
import { extractAuditAccessTokenFromRequest, verifyAuditAccessToken } from '@/lib/security/audit-access';
import { isValidEmail, isValidUuid, parseJsonObject, parseOptionalString } from '@/lib/security/validation';

const ALLOWED_WAITLIST_SOURCES = new Set([
  'report_upsell',
  'report_monitoring',
]);

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await applyRateLimit(request, {
      keyPrefix: 'api:waitlist:add',
      maxRequests: 10,
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
    const email = parseOptionalString(body.email);
    const auditId = parseOptionalString(body.auditId);
    const source = parseOptionalString(body.source) || 'report_upsell';
    const accessToken = extractAuditAccessTokenFromRequest(
      request,
      body.accessToken,
      auditId || undefined
    );

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Format d’email invalide' },
        { status: 400 }
      );
    }

    if (!ALLOWED_WAITLIST_SOURCES.has(source)) {
      return NextResponse.json(
        { error: 'Source invalide' },
        { status: 400 }
      );
    }

    if (auditId) {
      if (!isValidUuid(auditId)) {
        return NextResponse.json(
          { error: 'ID d’audit invalide' },
          { status: 400 }
        );
      }

      if (!accessToken || !verifyAuditAccessToken(accessToken, auditId)) {
        return NextResponse.json(
          { error: 'Accès interdit' },
          { status: 403 }
        );
      }
    }

    await db.addToWaitlist(email, auditId || null, source);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('waitlist_add_error', {
      phase: 'waitlist',
      error: error instanceof Error ? error.message : 'unknown_waitlist_error',
    });
    return NextResponse.json(
      { error: 'Impossible d’ajouter à la liste d’attente' },
      { status: 500 }
    );
  }
}
