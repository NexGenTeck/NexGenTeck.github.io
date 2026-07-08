-- ============================================================
-- email_logs table (PostgreSQL / Supabase)
-- Audit trail for all email sending attempts
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS email_logs (
  id            BIGSERIAL PRIMARY KEY,
  recipient     TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('subscriber', 'admin')),
  status        TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  provider      TEXT NOT NULL DEFAULT 'resend',
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying by recipient
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient
  ON email_logs (recipient);

-- Index for querying failures
CREATE INDEX IF NOT EXISTS idx_email_logs_status
  ON email_logs (status);

-- Enable Row Level Security
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- ONLY service_role (Edge Function) can write logs — no anon access
-- No policies needed: service_role bypasses RLS by default in Supabase
