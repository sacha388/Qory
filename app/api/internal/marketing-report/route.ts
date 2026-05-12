import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { kickScanWorker } from '@/lib/scanner/worker';
import { logError, logInfo } from '@/lib/logger';
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
import { normalizeScanUrlInput, parseJsonObject, parseOptionalString } from '@/lib/security/validation';
import type { AiProviderId } from '@/types';

const INTERNAL_PROVIDER_IDS: readonly AiProviderId[] = ['openai', 'anthropic', 'perplexity'];

function isAuthorizedInternalRequest(request: NextRequest, token: string | null): boolean {
  const expectedToken = process.env.INTERNAL_REPORT_TOKEN?.trim();
  if (!expectedToken) {
    return false;
  }

  const headerToken = request.headers.get('x-internal-report-token')?.trim() || null;
  return headerToken === expectedToken || token === expectedToken;
}

function formatUnknownError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if (typeof obj.message === 'string') return obj.message;
    if (typeof obj.code === 'string') return `db_error: code=${obj.code}, details=${obj.details ?? 'none'}`;
    try { return JSON.stringify(obj).slice(0, 500); } catch { /* fall through */ }
  }
  return String(error);
}

function normalizeInternalProviderSelection(value: unknown): AiProviderId[] {
  if (!Array.isArray(value)) {
    return [...INTERNAL_PROVIDER_IDS];
  }

  const selected = value.filter((provider): provider is AiProviderId =>
    INTERNAL_PROVIDER_IDS.includes(provider as AiProviderId)
  );

  return selected.length > 0 ? Array.from(new Set(selected)) : [...INTERNAL_PROVIDER_IDS];
}

export async function POST(request: NextRequest) {
  let step = 'init';
  try {
    assertAllowedOrigin(request);

    const body = parseJsonObject(await request.json().catch(() => null));
    const token = parseOptionalString(body.token);

    if (!process.env.INTERNAL_REPORT_TOKEN?.trim()) {
      return NextResponse.json(
        { error: 'Accès interne non configuré' },
        { status: 503 }
      );
    }

    if (!isAuthorizedInternalRequest(request, token)) {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    const rawUrl = parseOptionalString(body.url);
    const userContext = normalizePaidScanQuestionnaireInput(body.userContext);
    const providerSelection = normalizeInternalProviderSelection(body.providers);

    if (!rawUrl) {
      return NextResponse.json({ error: 'URL requise' }, { status: 400 });
    }

    if (!userContext) {
      return NextResponse.json(
        { error: 'Questionnaire incomplet' },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeScanUrlInput(rawUrl);
    const safeUrl = await assertSafeExternalUrl(normalizedUrl);
    const activityEntry = getPaidScanActivityCatalogEntry(userContext.type, userContext.activity);
    const baseScanContext = buildAuditScanContext(userContext);
    const scanContext = baseScanContext
      ? {
          ...baseScanContext,
          providerSelection,
        }
      : null;

    if (!activityEntry || !scanContext) {
      return NextResponse.json(
        { error: 'Contexte de scan invalide' },
        { status: 400 }
      );
    }

    step = 'createAudit';
    const audit = await db.createAudit(safeUrl);
    const accessToken = issueAuditAccessToken(audit.id);

    step = 'updateAudit';
    await db.updateAudit(audit.id, {
      user_context: userContext,
      scan_context: scanContext,
      sector: activityEntry.label,
      city: scanContext.city,
      paid: true,
      paid_at: new Date().toISOString(),
      status: 'scanning',
      scan_progress: 0,
      scan_step: 'Préparation du rapport marketing...',
    });

    step = 'enqueueScanJob';
    await db.enqueueScanJob(audit.id);
    step = 'done';
    void kickScanWorker(1);

    logInfo('internal_marketing_report_enqueued', {
      auditId: audit.id,
      phase: 'internal_marketing_report',
      url: safeUrl,
    });

    const reportUrl = `/scan/${audit.id}?t=${encodeURIComponent(accessToken)}`;
    const response = NextResponse.json({ auditId: audit.id, accessToken, reportUrl });
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
    const message = formatUnknownError(error);
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

    logError('internal_marketing_report_error', {
      phase: 'internal_marketing_report',
      step,
      error: message,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3).join(' | ') : undefined,
    });

    if (isValidationError) {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Impossible de créer le rapport marketing' },
      { status: 500 }
    );
  }
}
