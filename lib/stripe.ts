import 'server-only';
import Stripe from 'stripe';
import { logError } from '@/lib/logger';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const stripePriceId = process.env.STRIPE_PRICE_ID?.trim();

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

// Helper to create a checkout session
export async function createCheckoutSession(
  auditId: string,
  _accessToken: string,
  auditUrl: string,
  email?: string
): Promise<string> {
  const baseUrl = (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const idempotencyKey = `checkout:${auditId}:${Math.floor(Date.now() / 60000)}`;
  const lineItems = stripePriceId
    ? [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ]
    : [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Rapport IA-Check Complet',
              description: 'Analyse complète de votre visibilité sur les IA (ChatGPT, Claude, Perplexity)',
            },
            unit_amount: 999, // 9.99€
          },
          quantity: 1,
        },
      ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${baseUrl}/scan/${auditId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/erreur/paiement-echoue?url=${encodeURIComponent(auditUrl)}`,
    ...(email ? { customer_email: email } : {}),
    metadata: {
      auditId,
    },
  }, { idempotencyKey });

  if (!session.url) {
    throw new Error('Stripe checkout session URL is missing');
  }

  return session.url;
}

// Helper to verify a checkout session
export async function verifyCheckoutSession(
  sessionId: string
): Promise<{ paid: boolean; auditId: string | null; paymentIntentId: string | null }> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return {
      paid: session.payment_status === 'paid',
      auditId: session.metadata?.auditId || null,
      paymentIntentId: session.payment_intent as string | null,
    };
  } catch (error) {
    logError('stripe_session_verify_error', {
      phase: 'stripe_session_verify',
      error: error instanceof Error ? error.message : 'unknown_stripe_verify_error',
    });
    return { paid: false, auditId: null, paymentIntentId: null };
  }
}
