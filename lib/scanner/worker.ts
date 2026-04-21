import { db } from '@/lib/supabase';
import { logError, logInfo, logWarn } from '@/lib/logger';
import { runScanPipelineForAudit } from '@/lib/scanner/pipeline';
import type { ScanJob } from '@/types';

const MAX_SCAN_ATTEMPTS = 3;
const MAX_JOBS_PER_TICK = 2;
const STALE_JOB_AFTER_MS = 2 * 60 * 1000;
const PIPELINE_TIMEOUT_MS = 5 * 60 * 1000;

let currentWorkerRun: Promise<void> | null = null;

export function kickScanWorker(maxJobs: number = MAX_JOBS_PER_TICK): Promise<void> {
  if (currentWorkerRun) {
    return currentWorkerRun;
  }

  currentWorkerRun = (async () => {
    try {
      await db.requeueStaleScanJobs(STALE_JOB_AFTER_MS);

      let processed = 0;
      while (processed < Math.max(1, maxJobs)) {
        const claimedJob = await db.claimNextScanJob();
        if (!claimedJob) {
          break;
        }

        processed += 1;
        await processClaimedJob(claimedJob);
      }
    } catch (error) {
      logError('scan_worker_fatal_error', {
        phase: 'worker',
        error_code: getErrorCode(error),
        error_message: getErrorMessage(error, 'Scan worker fatal error'),
      });
    } finally {
      currentWorkerRun = null;
    }
  })();

  return currentWorkerRun;
}

async function processClaimedJob(job: ScanJob): Promise<void> {
  const startedAt = Date.now();
  const auditId = job.audit_id;

  logInfo('scan_job_claimed', {
    auditId,
    jobId: job.id,
    phase: 'job_claim',
    attempts: job.attempts,
  });

  try {
    const audit = await db.getAudit(auditId);
    if (!audit) {
      throw new Error('Audit introuvable pour ce job');
    }

    const mode = await runPipelineWithTimeout(audit);
    await db.completeScanJob(job.id);

    logInfo('scan_job_completed', {
      auditId,
      jobId: job.id,
      phase: 'job_complete',
      duration_ms: Date.now() - startedAt,
      attempts: job.attempts,
      mode,
    });
  } catch (error) {
    const message = getErrorMessage(error, 'Échec du scan');
    const isFinalAttempt = job.attempts >= MAX_SCAN_ATTEMPTS;

    await db.failOrRetryScanJob(job, message, MAX_SCAN_ATTEMPTS);

    if (isFinalAttempt) {
      await db.failAudit(auditId, message);
      logError('scan_job_failed_permanently', {
        auditId,
        jobId: job.id,
        phase: 'job_fail',
        duration_ms: Date.now() - startedAt,
        attempts: job.attempts,
        error_code: getErrorCode(error),
        error_message: message,
      });
    } else {
      await db.updateAudit(auditId, {
        status: 'scanning',
        scan_step: `Nouvelle tentative automatique (${job.attempts}/${MAX_SCAN_ATTEMPTS})...`,
      });

      logWarn('scan_job_retry_scheduled', {
        auditId,
        jobId: job.id,
        phase: 'job_retry',
        duration_ms: Date.now() - startedAt,
        attempts: job.attempts,
        error_code: getErrorCode(error),
        error_message: message,
      });
    }
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

async function runPipelineWithTimeout(
  audit: Parameters<typeof runScanPipelineForAudit>[0]
): Promise<Awaited<ReturnType<typeof runScanPipelineForAudit>>> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Pipeline timeout after ${PIPELINE_TIMEOUT_MS}ms`));
    }, PIPELINE_TIMEOUT_MS);
  });

  try {
    return await Promise.race([runScanPipelineForAudit(audit), timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function getErrorCode(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const value = (error as { code?: unknown }).code;
    if (typeof value === 'string') return value;
  }
  return 'unknown_error';
}
