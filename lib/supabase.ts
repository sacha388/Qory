import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Audit, AuditRetentionState, ScanJob, WaitlistEntry } from '@/types';
import { logWarn } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Server-side client with service role key (full access)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DUPLICATE_KEY_ERROR_CODE = '23505';
const ANONYMIZED_AUDIT_RETENTION_STATE: AuditRetentionState = 'anonymized';
const AUDIT_RETENTION_YEARS = 1;
const REDACTED_AUDIT_URL = 'https://redacted.invalid/audit-retained-record';
const REDACTED_AUDIT_STEP = 'Données d’audit anonymisées selon la politique de conservation.';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function nowIso(): string {
  return new Date().toISOString();
}

function getRetryDelayMs(attempts: number): number {
  const baseDelay = 2000;
  return Math.min(60000, baseDelay * Math.pow(2, Math.max(attempts - 1, 0)));
}

function getAuditRetentionCutoffIso(referenceDate: Date = new Date()): string {
  const cutoff = new Date(referenceDate);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - AUDIT_RETENTION_YEARS);
  return cutoff.toISOString();
}

type RateLimitCheckResult = {
  allowed: boolean;
  remaining: number;
  retry_after_seconds: number;
};

// Database helper functions
export const db = {
  // Create a new audit
  async createAudit(url: string): Promise<Audit> {
    const { data, error } = await supabase
      .from('audits')
      .insert({
        url,
        status: 'pending',
        scan_progress: 0,
        scan_step: 'En attente de traitement...',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get audit by ID
  async getAudit(id: string): Promise<Audit | null> {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  // Update audit
  async updateAudit(id: string, updates: Partial<Audit>): Promise<void> {
    const { error } = await supabase
      .from('audits')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  // Update scan progress
  async updateScanProgress(
    id: string,
    progress: number,
    step: string
  ): Promise<void> {
    await this.updateAudit(id, {
      scan_progress: progress,
      scan_step: step,
    });
  },

  // Mark audit as completed
  async completeAudit(
    id: string,
    results: any,
    report: any,
    score: number
  ): Promise<void> {
    const completedPayload: Partial<Audit> = {
      status: 'completed',
      scan_progress: 100,
      scan_step: 'Analyse terminée',
      results,
      report,
      score,
    };
    await this.updateAudit(id, completedPayload);
  },

  // Mark audit as failed
  async failAudit(id: string, error: string): Promise<void> {
    await this.updateAudit(id, {
      status: 'failed',
      scan_progress: 100,
      scan_step: `Erreur: ${error}`,
    });
  },

  // Mark audit as paid
  async markAsPaid(
    id: string,
    stripePaymentIntentId: string
  ): Promise<void> {
    await this.updateAudit(id, {
      paid: true,
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: stripePaymentIntentId,
    });
  },

  // Add email to audit
  async addEmailToAudit(id: string, email: string): Promise<void> {
    await this.updateAudit(id, { email });
  },

  async touchAuditUsage(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('audits')
        .update({ last_used_at: nowIso() })
        .eq('id', id)
        .neq('retention_state', ANONYMIZED_AUDIT_RETENTION_STATE);

      if (error) throw error;
    } catch (error) {
      logWarn('audit_usage_touch_skipped', {
        auditId: id,
        error: error instanceof Error ? error.message : 'unknown_audit_usage_touch_error',
      });
    }
  },

  async applyAuditRetentionPolicy(): Promise<number> {
    const retentionAppliedAt = nowIso();
    const cutoffIso = getAuditRetentionCutoffIso();
    const retentionPayload: Partial<Audit> = {
      url: REDACTED_AUDIT_URL,
      business_name: null,
      sector: null,
      city: null,
      user_context: null,
      scan_context: null,
      scan_step: REDACTED_AUDIT_STEP,
      score: null,
      results: null,
      report: null,
      email: null,
      report_sent: false,
      retention_applied_at: retentionAppliedAt,
      retention_state: ANONYMIZED_AUDIT_RETENTION_STATE,
    };

    const { data: touchedByLastUsed, error: lastUsedError } = await supabase
      .from('audits')
      .update(retentionPayload)
      .is('retention_applied_at', null)
      .lt('last_used_at', cutoffIso)
      .select('id');

    if (lastUsedError) throw lastUsedError;

    const { data: touchedByCreatedAt, error: createdAtError } = await supabase
      .from('audits')
      .update(retentionPayload)
      .is('retention_applied_at', null)
      .is('last_used_at', null)
      .lt('created_at', cutoffIso)
      .select('id');

    if (createdAtError) throw createdAtError;

    const anonymizedAuditIds = Array.from(
      new Set(
        [...(touchedByLastUsed || []), ...(touchedByCreatedAt || [])]
          .map((row) => (row as { id?: string }).id)
          .filter((value): value is string => typeof value === 'string' && value.length > 0)
      )
    );

    if (anonymizedAuditIds.length > 0) {
      const { error: scanJobsError } = await supabase
        .from('scan_jobs')
        .delete()
        .in('audit_id', anonymizedAuditIds);

      if (scanJobsError) throw scanJobsError;
    }

    return anonymizedAuditIds.length;
  },

  // Add to waitlist
  async addToWaitlist(
    email: string,
    auditId: string | null,
    source: string
  ): Promise<WaitlistEntry> {
    const normalizedEmail = normalizeEmail(email);

    const { data, error } = await supabase
      .from('waitlist_monitoring')
      .insert({
        email: normalizedEmail,
        audit_id: auditId,
        source,
      })
      .select()
      .single();

    if (error) {
      if (error.code === DUPLICATE_KEY_ERROR_CODE) {
        const { data: existing, error: existingError } = await supabase
          .from('waitlist_monitoring')
          .select('*')
          .eq('email', normalizedEmail)
          .eq('source', source)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingError) throw existingError;
        if (existing) {
          return existing as WaitlistEntry;
        }
      }

      throw error;
    }

    return data;
  },

  async checkRateLimit(
    bucketKey: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_bucket_key: bucketKey,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? (data[0] as RateLimitCheckResult | undefined) : (data as RateLimitCheckResult | null);
    if (!row) {
      return {
        allowed: true,
        remaining: Math.max(maxRequests - 1, 0),
        retryAfterSeconds: 0,
      };
    }

    return {
      allowed: Boolean(row.allowed),
      remaining: Math.max(Number(row.remaining) || 0, 0),
      retryAfterSeconds: Math.max(Number(row.retry_after_seconds) || 0, 0),
    };
  },

  async enqueueScanJob(auditId: string): Promise<ScanJob> {
    const { data, error } = await supabase
      .from('scan_jobs')
      .upsert(
        {
          audit_id: auditId,
          status: 'pending',
          next_retry_at: nowIso(),
          updated_at: nowIso(),
          processing_started_at: null,
          completed_at: null,
          last_error: null,
        },
        {
          onConflict: 'audit_id',
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data as ScanJob;
  },

  async getScanJobByAuditId(auditId: string): Promise<ScanJob | null> {
    const { data, error } = await supabase
      .from('scan_jobs')
      .select('*')
      .eq('audit_id', auditId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return (data as ScanJob | null) ?? null;
  },

  async claimNextScanJob(): Promise<ScanJob | null> {
    const { data, error } = await supabase.rpc('claim_next_scan_job');

    if (!error) {
      if (!data) return null;
      if (Array.isArray(data)) {
        return (data[0] as ScanJob) ?? null;
      }
      return data as ScanJob;
    }

    // Fallback if RPC is not available yet in the DB.
    const { data: candidates, error: candidateError } = await supabase
      .from('scan_jobs')
      .select('*')
      .eq('status', 'pending')
      .lte('next_retry_at', nowIso())
      .order('created_at', { ascending: true })
      .limit(1);

    if (candidateError) throw candidateError;
    const candidate = candidates?.[0] as ScanJob | undefined;
    if (!candidate) return null;

    const { data: claimed, error: claimError } = await supabase
      .from('scan_jobs')
      .update({
        status: 'processing',
        attempts: candidate.attempts + 1,
        processing_started_at: nowIso(),
        updated_at: nowIso(),
      })
      .eq('id', candidate.id)
      .eq('status', 'pending')
      .select()
      .maybeSingle();

    if (claimError) throw claimError;
    return (claimed as ScanJob | null) ?? null;
  },

  async completeScanJob(jobId: string): Promise<void> {
    const { error } = await supabase
      .from('scan_jobs')
      .update({
        status: 'done',
        completed_at: nowIso(),
        processing_started_at: null,
        updated_at: nowIso(),
        last_error: null,
      })
      .eq('id', jobId);

    if (error) throw error;
  },

  async failOrRetryScanJob(
    job: ScanJob,
    errorMessage: string,
    maxAttempts: number = 3
  ): Promise<void> {
    const attempts = job.attempts;

    if (attempts >= maxAttempts) {
      const { error } = await supabase
        .from('scan_jobs')
        .update({
          status: 'failed',
          last_error: errorMessage,
          completed_at: nowIso(),
          processing_started_at: null,
          updated_at: nowIso(),
        })
        .eq('id', job.id);

      if (error) throw error;
      return;
    }

    const retryAt = new Date(Date.now() + getRetryDelayMs(attempts)).toISOString();
    const { error } = await supabase
      .from('scan_jobs')
      .update({
        status: 'pending',
        next_retry_at: retryAt,
        last_error: errorMessage,
        processing_started_at: null,
        updated_at: nowIso(),
      })
      .eq('id', job.id);

    if (error) throw error;
  },

  async requeueStaleScanJobs(staleAfterMs: number = 2 * 60 * 1000): Promise<void> {
    const staleBefore = new Date(Date.now() - staleAfterMs).toISOString();

    const { error } = await supabase
      .from('scan_jobs')
      .update({
        status: 'pending',
        next_retry_at: nowIso(),
        processing_started_at: null,
        updated_at: nowIso(),
        last_error: 'Job réassigné (worker précédent interrompu)',
      })
      .eq('status', 'processing')
      .lt('processing_started_at', staleBefore);

    if (error) throw error;
  },
};
