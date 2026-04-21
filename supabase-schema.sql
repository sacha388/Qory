-- IA-Check Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Create audits table
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP DEFAULT NOW(),
  retention_applied_at TIMESTAMP,
  retention_state TEXT DEFAULT 'active',
  
  -- Input utilisateur
  url TEXT NOT NULL,
  business_name TEXT,
  sector TEXT,
  city TEXT,
  user_context JSONB,
  scan_context JSONB,
  
  -- Statut du scan
  status TEXT DEFAULT 'pending', -- pending | scanning | completed | failed
  scan_progress INTEGER DEFAULT 0, -- 0-100
  scan_step TEXT, -- message affiché pendant le scan
  
  -- Résultats (stockés en JSON)
  score INTEGER, -- score global 0-100
  results JSONB, -- résultats complets du scan
  report JSONB, -- rapport formaté complet
  
  -- Paiement
  paid BOOLEAN DEFAULT FALSE,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMP,
  
  -- Email
  email TEXT, -- collecté avant ou après paiement
  report_sent BOOLEAN DEFAULT FALSE
);

ALTER TABLE audits ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP DEFAULT NOW();
ALTER TABLE audits ADD COLUMN IF NOT EXISTS retention_applied_at TIMESTAMP;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS retention_state TEXT DEFAULT 'active';
ALTER TABLE audits ADD COLUMN IF NOT EXISTS user_context JSONB;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS scan_context JSONB;

UPDATE audits
SET
  last_used_at = COALESCE(last_used_at, paid_at, created_at),
  retention_state = COALESCE(retention_state, 'active')
WHERE last_used_at IS NULL OR retention_state IS NULL;

-- Create waitlist_monitoring table
CREATE TABLE IF NOT EXISTS waitlist_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  email TEXT NOT NULL,
  audit_id UUID REFERENCES audits(id),
  source TEXT DEFAULT 'report_upsell' -- d'où vient l'inscription
);

-- Durable queue for scans
CREATE TABLE IF NOT EXISTS scan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | processing | failed | done
  attempts INTEGER NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processing_started_at TIMESTAMP,
  completed_at TIMESTAMP,
  last_error TEXT
);

-- Persistent rate-limiting buckets (shared across instances)
CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  bucket_key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL,
  reset_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Claim a job atomically (one worker at a time).
CREATE OR REPLACE FUNCTION claim_next_scan_job()
RETURNS SETOF scan_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  claimed_job scan_jobs;
BEGIN
  UPDATE scan_jobs
  SET
    status = 'processing',
    attempts = attempts + 1,
    processing_started_at = NOW(),
    updated_at = NOW()
  WHERE id = (
    SELECT id
    FROM scan_jobs
    WHERE status = 'pending'
      AND next_retry_at <= NOW()
    ORDER BY created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  RETURNING * INTO claimed_job;

  IF claimed_job.id IS NULL THEN
    RETURN;
  END IF;

  RETURN NEXT claimed_job;
END;
$$;

-- Shared rate-limit check (atomic in DB)
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_bucket_key TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, retry_after_seconds INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_count INTEGER;
  v_reset_at TIMESTAMPTZ;
BEGIN
  LOOP
    UPDATE rate_limit_buckets
    SET
      request_count = CASE
        WHEN reset_at <= v_now THEN 1
        ELSE request_count + 1
      END,
      reset_at = CASE
        WHEN reset_at <= v_now THEN v_now + make_interval(secs => p_window_seconds)
        ELSE reset_at
      END,
      updated_at = v_now
    WHERE bucket_key = p_bucket_key
    RETURNING request_count, reset_at INTO v_count, v_reset_at;

    IF FOUND THEN
      EXIT;
    END IF;

    BEGIN
      INSERT INTO rate_limit_buckets (bucket_key, request_count, reset_at, updated_at)
      VALUES (p_bucket_key, 1, v_now + make_interval(secs => p_window_seconds), v_now)
      RETURNING request_count, reset_at INTO v_count, v_reset_at;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      -- race condition: another transaction inserted concurrently, retry update
    END;
  END LOOP;

  allowed := v_count <= p_max_requests;
  remaining := GREATEST(p_max_requests - v_count, 0);
  retry_after_seconds := CASE
    WHEN allowed THEN 0
    ELSE GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_reset_at - v_now)))::INTEGER)
  END;

  RETURN NEXT;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_audits_paid ON audits(paid);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audits_retention_last_used
  ON audits(retention_state, last_used_at);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_monitoring(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email_source_unique
  ON waitlist_monitoring((lower(trim(email))), source);
CREATE UNIQUE INDEX IF NOT EXISTS idx_scan_jobs_audit_unique ON scan_jobs(audit_id);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_status_next_retry
  ON scan_jobs(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_scan_jobs_processing_started
  ON scan_jobs(processing_started_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_reset_at
  ON rate_limit_buckets(reset_at);

-- Enable Row Level Security (RLS)
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- Replace permissive policies with deny-by-default + service role only.
DROP POLICY IF EXISTS "Allow service role all operations on audits" ON audits;
DROP POLICY IF EXISTS "Allow service role all operations on waitlist" ON waitlist_monitoring;
DROP POLICY IF EXISTS "Service role full access audits" ON audits;
DROP POLICY IF EXISTS "Service role full access waitlist" ON waitlist_monitoring;
DROP POLICY IF EXISTS "Service role full access scan jobs" ON scan_jobs;
DROP POLICY IF EXISTS "Service role full access rate limit buckets" ON rate_limit_buckets;

CREATE POLICY "Service role full access audits" ON audits
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access waitlist" ON waitlist_monitoring
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access scan jobs" ON scan_jobs
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access rate limit buckets" ON rate_limit_buckets
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

REVOKE ALL ON FUNCTION claim_next_scan_job() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION claim_next_scan_job() TO service_role;
REVOKE ALL ON FUNCTION check_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;

-- Ops dashboard queries:
-- 1) Scans failed in the last 7 days
-- SELECT count(*) FROM audits WHERE status = 'failed' AND created_at >= now() - interval '7 days';
--
-- 2) Scans potentially stuck
-- SELECT id, url, status, scan_progress, scan_step, created_at
-- FROM audits
-- WHERE status IN ('pending', 'scanning')
--   AND created_at < now() - interval '10 minutes'
-- ORDER BY created_at ASC;
--
-- 3) Payment conversion (last 7 days)
-- SELECT
--   count(*) FILTER (WHERE paid) AS paid_count,
--   count(*) AS total_count,
--   round((count(*) FILTER (WHERE paid)::numeric / nullif(count(*), 0)) * 100, 2) AS paid_rate_pct
-- FROM audits
-- WHERE created_at >= now() - interval '7 days';
--
-- 4) Waitlist conversion (last 7 days)
-- SELECT
--   count(distinct lower(trim(email))) AS unique_waitlist_emails
-- FROM waitlist_monitoring
-- WHERE created_at >= now() - interval '7 days';
