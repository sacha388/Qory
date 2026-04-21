import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/supabase';
import { headers } from 'next/headers';
import { kickScanWorker } from '@/lib/scanner/worker';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { logError, logInfo } from '@/lib/logger';
import type { ScanResults } from '@/types';

export async function POST(request: NextRequest) {
  const rateLimit = await applyRateLimit(request, {
    keyPrefix: 'api:webhook:stripe',
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

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logError('stripe_webhook_secret_missing', { phase: 'stripe_webhook' });
    return NextResponse.json(
      { error: 'Secret webhook non configuré' },
      { status: 503 }
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'En-tête stripe-signature manquant' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err: any) {
    logError('stripe_webhook_signature_verification_failed', {
      phase: 'stripe_webhook',
      error: err?.message || 'unknown_signature_error',
    });
    return NextResponse.json(
      { error: `Erreur webhook: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const auditId = session.metadata?.auditId;
    const paymentIntentId = session.payment_intent as string;

    if (auditId && paymentIntentId) {
      try {
        await db.markAsPaid(auditId, paymentIntentId);
        logInfo('stripe_audit_marked_paid', {
          auditId,
          phase: 'stripe_webhook',
        });

        const audit = await db.getAudit(auditId);
        const alreadyFullyScanned =
          audit?.status === 'completed' &&
          ((audit.results as ScanResults | null | undefined)?.analysisMode === 'full');
        if (alreadyFullyScanned) {
          return NextResponse.json({ received: true });
        }

        // Enqueue the scan job and start the worker now that payment is confirmed
        await db.updateAudit(auditId, { status: 'scanning', scan_progress: 0, scan_step: 'Préparation de votre audit complet...' });
        await db.enqueueScanJob(auditId);
        void kickScanWorker();
        logInfo('stripe_scan_job_enqueued', {
          auditId,
          phase: 'stripe_webhook',
        });
      } catch (error) {
        logError('stripe_paid_audit_processing_error', {
          auditId,
          phase: 'stripe_webhook',
          error: error instanceof Error ? error.message : 'unknown_processing_error',
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
