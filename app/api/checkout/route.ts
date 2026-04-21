import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { createCheckoutSession } from '@/lib/stripe';
import { logError } from '@/lib/logger';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { assertAllowedOrigin } from '@/lib/security/origin';
import {
  getAuditAccessCookieName,
  getAuditAccessTokenTtlSeconds,
  issueAuditAccessToken,
} from '@/lib/security/audit-access';
import {
  buildAuditScanContext,
  getPaidScanActivityCatalogEntry,
  normalizePaidScanQuestionnaireInput,
} from '@/lib/scanner/paid-scan-catalog';
import { assertSafeExternalUrl } from '@/lib/security/ssrf';
import { isValidEmail, normalizeScanUrlInput, parseJsonObject, parseOptionalString } from '@/lib/security/validation';

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await applyRateLimit(request, {
      keyPrefix: 'api:checkout:create',
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
    const rawUrl = parseOptionalString(body.url);
    const email = parseOptionalString(body.email);
    const userContext = normalizePaidScanQuestionnaireInput(body.userContext);

    if (!rawUrl) {
      return NextResponse.json(
        { error: 'URL requise' },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Format d’email invalide' },
        { status: 400 }
      );
    }

    // Validate and normalize the URL
    const normalizedUrl = normalizeScanUrlInput(rawUrl);
    const safeUrl = await assertSafeExternalUrl(normalizedUrl);

    if (!userContext) {
      return NextResponse.json(
        { error: 'Questionnaire incomplet' },
        { status: 400 }
      );
    }

    const activityEntry = getPaidScanActivityCatalogEntry(userContext.type, userContext.activity);
    const scanContext = buildAuditScanContext(userContext);

    if (!activityEntry || !scanContext) {
      return NextResponse.json(
        { error: 'Contexte de scan invalide' },
        { status: 400 }
      );
    }

    // Create audit in DB (pending state, no scan job yet)
    const audit = await db.createAudit(safeUrl);
    const accessToken = issueAuditAccessToken(audit.id);

    await db.updateAudit(audit.id, {
      user_context: userContext,
      scan_context: scanContext,
      sector: activityEntry.label,
      city: scanContext.city,
    });

    // Persist email if provided
    if (email) {
      await db.addEmailToAudit(audit.id, email);
    }

    // Create Stripe checkout session
    const checkoutUrl = await createCheckoutSession(audit.id, accessToken, safeUrl, email || undefined);

    const response = NextResponse.json({ checkoutUrl, auditId: audit.id, accessToken });
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
      error instanceof Error && error.message ? error.message : 'Impossible de créer la session de paiement';
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

    logError('checkout_create_error', {
      phase: 'checkout',
      error: error instanceof Error ? error.message : 'unknown_checkout_error',
    });

    if (isValidationError) {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Impossible de créer la session de paiement' },
      { status: 500 }
    );
  }
}
