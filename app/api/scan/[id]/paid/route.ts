import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { kickScanWorker } from '@/lib/scanner/worker';
import { runScanPipelineForAudit } from '@/lib/scanner/pipeline';
import { verifyCheckoutSession } from '@/lib/stripe';
import type { Audit, ScanResults } from '@/types';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { logError, logWarn } from '@/lib/logger';
import { assertAllowedOrigin } from '@/lib/security/origin';
import {
  buildAuditScanContext,
  getPaidScanActivityCatalogEntry,
  normalizePaidScanQuestionnaireInput,
} from '@/lib/scanner/paid-scan-catalog';
import {
  extractAuditAccessTokenFromRequest,
  getAuditAccessCookieName,
  getAuditAccessTokenTtlSeconds,
  verifyAuditAccessToken,
} from '@/lib/security/audit-access';
import {
  isValidStripeCheckoutSessionId,
  isValidUuid,
  parseJsonObject,
} from '@/lib/security/validation';

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'unknown_paid_scan_error';
}

function isQueueStartError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('scan_jobs') ||
    message.includes('claim_next_scan_job') ||
    message.includes('next_retry_at') ||
    message.includes('processing_started_at') ||
    message.includes('audit_id')
  );
}

function startInlinePaidScan(audit: Audit): void {
  void (async () => {
    try {
      await runScanPipelineForAudit(audit);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      await db.failAudit(audit.id, errorMessage).catch((dbError) => {
        logError('paid_scan_inline_fail_audit_error', {
          auditId: audit.id,
          phase: 'paid_scan_inline_fail_audit',
          error: getErrorMessage(dbError),
        });
      });

      logError('paid_scan_inline_error', {
        auditId: audit.id,
        phase: 'paid_scan_inline',
        error: errorMessage,
      });
    }
  })();
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await db.applyAuditRetentionPolicy().catch((error) => {
      logError('audit_retention_apply_error', {
        phase: 'paid_scan_retention',
        error: error instanceof Error ? error.message : 'unknown_paid_scan_retention_error',
      });
    });

    const rateLimit = await applyRateLimit(request, {
      keyPrefix: 'api:scan:paid:start',
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

    const body = parseJsonObject(await request.json().catch(() => ({})));
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : null;
    if (sessionId && !isValidStripeCheckoutSessionId(sessionId)) {
      return NextResponse.json({ error: 'ID de session invalide' }, { status: 400 });
    }

    const accessToken = extractAuditAccessTokenFromRequest(request, body.accessToken, id);

    if (!accessToken || !verifyAuditAccessToken(accessToken, id)) {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    let audit = await db.getAudit(id);
    if (!audit) {
      return NextResponse.json({ error: 'Audit introuvable' }, { status: 404 });
    }

    if (audit.retention_state === 'anonymized') {
      return NextResponse.json({ error: 'Audit archivé' }, { status: 410 });
    }

    if (sessionId) {
      const verification = await verifyCheckoutSession(sessionId);
      if (verification.paid && verification.auditId === id) {
        if (verification.paymentIntentId) {
          await db.markAsPaid(id, verification.paymentIntentId);
        } else {
          await db.updateAudit(id, { paid: true, paid_at: new Date().toISOString() });
        }
        audit = (await db.getAudit(id)) || audit;
      }
    }

    if (!audit.paid) {
      return NextResponse.json({ error: 'Audit non payé' }, { status: 403 });
    }

    await db.touchAuditUsage(id);

    const isFullReady =
      audit.status === 'completed' &&
      ((audit.results as ScanResults | null)?.analysisMode === 'full');

    if (isFullReady) {
      const response = NextResponse.json({ status: 'ready' });
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
    }

    const submittedUserContext = normalizePaidScanQuestionnaireInput(body.userContext);
    const storedUserContext = normalizePaidScanQuestionnaireInput(audit.user_context);
    const userContext = submittedUserContext || storedUserContext;

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

    const auditUpdates: Partial<Audit> = {
      user_context: userContext,
      scan_context: scanContext,
      sector: activityEntry.label,
      city: scanContext.city,
      status: 'scanning',
      scan_progress: 0,
      scan_step: 'Préparation du rapport complet...',
    };

    await db.updateAudit(id, auditUpdates);

    const updatedAudit: Audit = {
      ...audit,
      ...auditUpdates,
      status: 'scanning',
      scan_progress: 0,
      scan_step: 'Préparation du rapport complet...',
      sector: activityEntry.label,
      city: scanContext.city,
      user_context: userContext,
      scan_context: scanContext,
    };

    let startedWithInlineFallback = false;

    try {
      const existingJob = await db.getScanJobByAuditId(id);
      if (existingJob?.status === 'pending' || existingJob?.status === 'processing') {
        void kickScanWorker(1);
      } else {
        // Self-heal: if audit is scanning but no active job exists, recreate one.
        await db.enqueueScanJob(id);
        void kickScanWorker(1);
      }
    } catch (error) {
      if (!isQueueStartError(error)) {
        throw error;
      }

      startedWithInlineFallback = true;
      logWarn('paid_scan_queue_fallback', {
        auditId: id,
        phase: 'paid_scan_queue_fallback',
        error: getErrorMessage(error),
      });
      startInlinePaidScan({
        ...updatedAudit,
        paid: true,
      });
    }

    const response = NextResponse.json({
      status: 'processing',
      mode: startedWithInlineFallback ? 'inline_fallback' : 'queued',
    });
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
    logError('paid_scan_start_error', {
      phase: 'paid_scan_start',
      error: error instanceof Error ? error.message : 'unknown_paid_scan_error',
    });
    return NextResponse.json(
      { error: 'Impossible de démarrer le scan payé' },
      { status: 500 }
    );
  }
}
