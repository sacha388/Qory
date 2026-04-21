import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { generateReport } from '@/lib/scanner/report-generator';
import { kickScanWorker } from '@/lib/scanner/worker';
import type { Report, ScanResults } from '@/types';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { logError } from '@/lib/logger';
import {
  extractAuditAccessTokenFromRequest,
  getAuditAccessCookieName,
  getAuditAccessTokenTtlSeconds,
  verifyAuditAccessToken,
} from '@/lib/security/audit-access';
import { isValidUuid } from '@/lib/security/validation';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await db.applyAuditRetentionPolicy().catch((error) => {
      logError('audit_retention_apply_error', {
        phase: 'scan_status_retention',
        error: error instanceof Error ? error.message : 'unknown_scan_status_retention_error',
      });
    });

    const rateLimit = await applyRateLimit(request, {
      keyPrefix: 'api:scan:status',
      maxRequests: 120,
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
      return NextResponse.json({ error: 'ID d’audit invalide' }, { status: 400 });
    }

    const accessToken = extractAuditAccessTokenFromRequest(request, undefined, id);
    if (!accessToken || !verifyAuditAccessToken(accessToken, id)) {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    // Opportunistic worker tick to avoid stuck jobs in serverless environments.
    void kickScanWorker(1);

    const audit = await db.getAudit(id);

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit introuvable' },
        { status: 404 }
      );
    }

    if (audit.retention_state === 'anonymized') {
      return NextResponse.json(
        { error: 'Audit archivé' },
        { status: 410 }
      );
    }

    const job = await db.getScanJobByAuditId(id);
    if (
      (audit.status === 'pending' || audit.status === 'scanning') &&
      job?.status === 'failed'
    ) {
      const finalMessage =
        job.last_error || 'Le scan a échoué après plusieurs tentatives automatiques.';
      await db.failAudit(id, finalMessage);
      audit.status = 'failed';
      audit.scan_step = `Erreur: ${finalMessage}`;
    }

    const analysisMode =
      (audit.results as ScanResults | null | undefined)?.analysisMode || 'free';
    const crawlStatus =
      (audit.results as ScanResults | null | undefined)?.crawl?.crawlStatus ?? null;
    const fullReportReady = audit.status === 'completed' && analysisMode === 'full';
    const computedReport: Report | null =
      audit.paid && fullReportReady && audit.results
        ? audit.report ?? await generateReport(audit.id, audit.results as ScanResults)
        : audit.paid
        ? audit.report
        : null;

    // Security: never leak premium report details before payment.
    const report = audit.paid ? computedReport : null;

    const response = NextResponse.json(
      {
        id: audit.id,
        url: audit.url,
        status: audit.status,
        progress: audit.scan_progress,
        step: audit.scan_step,
        score: audit.score,
        paid: audit.paid,
        userContext: audit.user_context ?? null,
        scanContext: audit.scan_context ?? null,
        analysisMode,
        crawlStatus,
        fullReportReady,
        dataQuality: computedReport?.dataQuality ?? null,
        jobStatus: job?.status ?? null,
        report,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );

    await db.touchAuditUsage(id);

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
    logError('scan_status_fetch_error', {
      phase: 'scan_status',
      error: error instanceof Error ? error.message : 'unknown_scan_status_error',
    });
    return NextResponse.json(
      { error: 'Impossible de récupérer le statut de l’audit' },
      { status: 500 }
    );
  }
}
