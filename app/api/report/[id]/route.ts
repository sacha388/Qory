import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { verifyCheckoutSession } from '@/lib/stripe';
import { generateReport } from '@/lib/scanner/report-generator';
import { kickScanWorker } from '@/lib/scanner/worker';
import type { ScanResults } from '@/types';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { logError } from '@/lib/logger';
import {
  extractAuditAccessTokenFromRequest,
  extractAuditShareTokenFromRequest,
  getAuditAccessCookieName,
  getAuditAccessTokenTtlSeconds,
  verifyAuditAccessToken,
  verifyAuditShareToken,
} from '@/lib/security/audit-access';
import { isValidStripeCheckoutSessionId, isValidUuid } from '@/lib/security/validation';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await db.applyAuditRetentionPolicy().catch((error) => {
      logError('audit_retention_apply_error', {
        phase: 'report_fetch_retention',
        error: error instanceof Error ? error.message : 'unknown_report_retention_error',
      });
    });

    const rateLimit = await applyRateLimit(request, {
      keyPrefix: 'api:report:get',
      maxRequests: 60,
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

    const params = await context.params;
    const { id } = params;
    if (!isValidUuid(id)) {
      return NextResponse.json(
        { error: 'ID d’audit invalide' },
        { status: 400 }
      );
    }

    const accessToken = extractAuditAccessTokenFromRequest(request, undefined, id);
    const hasOwnerAccess = !!accessToken && verifyAuditAccessToken(accessToken, id);
    const shareToken = extractAuditShareTokenFromRequest(request);
    const hasShareAccess = !!shareToken && verifyAuditShareToken(shareToken, id);

    if (!hasOwnerAccess && !hasShareAccess) {
      logError('report_fetch_access_denied', {
        phase: 'report_fetch',
        auditId: id,
        ownerPresent: !!accessToken,
        sharePresent: !!shareToken,
        ownerValid: hasOwnerAccess,
        shareValid: hasShareAccess,
      });
      return NextResponse.json(
        { error: 'Accès interdit' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    if (sessionId && !isValidStripeCheckoutSessionId(sessionId)) {
      return NextResponse.json({ error: 'ID de session invalide' }, { status: 400 });
    }

    // If coming from Stripe, verify payment first
    if (sessionId) {
      const verification = await verifyCheckoutSession(sessionId);
      if (verification.paid && verification.auditId === id) {
        // Payment verified, mark as paid in DB
        if (verification.paymentIntentId) {
          await db.markAsPaid(id, verification.paymentIntentId);
        }
      }
    }

    // Fetch audit
    const audit = await db.getAudit(id);

    if (!audit) {
      logError('report_fetch_not_found', {
        phase: 'report_fetch',
        auditId: id,
        hasOwnerAccess,
        hasShareAccess,
      });
      return NextResponse.json(
        { error: 'Audit introuvable' },
        { status: 404 }
      );
    }

    if (audit.retention_state === 'anonymized') {
      logError('report_fetch_anonymized', {
        phase: 'report_fetch',
        auditId: id,
        retentionAppliedAt: audit.retention_applied_at,
      });
      return NextResponse.json(
        { error: 'Audit archivé' },
        { status: 410 }
      );
    }

    // Check if paid
    if (!audit.paid) {
      return NextResponse.json(
        { error: 'Audit non payé' },
        { status: 403 }
      );
    }

    const analysisMode = (audit.results as ScanResults | null | undefined)?.analysisMode;
    const fullReportReady = audit.status === 'completed' && analysisMode === 'full';

    if (!fullReportReady && hasOwnerAccess) {
      if (audit.status !== 'scanning') {
        await db.updateAudit(id, {
          status: 'scanning',
          scan_progress: Math.min(audit.scan_progress || 0, 5),
          scan_step: 'Préparation du rapport complet...',
        });
        await db.enqueueScanJob(id);
      }

      void kickScanWorker(1);

      const response = NextResponse.json(
        {
          status: 'processing',
          redirectTo: `/scan/${id}`,
        },
        {
          status: 202,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );

      if (accessToken) {
        response.cookies.set({
          name: getAuditAccessCookieName(id),
          value: accessToken,
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: getAuditAccessTokenTtlSeconds(),
        });
      }

      await db.touchAuditUsage(id);

      return response;
    }

    let responseAudit = audit;

    if (audit.status === 'completed' && audit.results && !audit.report) {
      try {
        const generatedReport = await generateReport(audit.id, audit.results as ScanResults);
        responseAudit = { ...audit, report: generatedReport };
      } catch (reportGenError) {
        logError('report_generation_fallback_error', {
          phase: 'report_fetch',
          auditId: id,
          error: reportGenError instanceof Error ? reportGenError.message : String(reportGenError),
        });
      }
    }

    await db.touchAuditUsage(id);

    const response = NextResponse.json(responseAudit, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    if (hasOwnerAccess && accessToken) {
      response.cookies.set({
        name: getAuditAccessCookieName(id),
        value: accessToken,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: getAuditAccessTokenTtlSeconds(),
      });
    }
    return response;
  } catch (error) {
    logError('report_fetch_error', {
      phase: 'report_fetch',
      error: error instanceof Error ? error.message : 'unknown_report_error',
    });
    return NextResponse.json(
      { error: 'Impossible de charger le rapport' },
      { status: 500 }
    );
  }
}
