-- ============================================================
-- newsletter_subscribers table (PostgreSQL / Supabase)
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT NOT NULL,
  source        TEXT NOT NULL DEFAULT 'newsletter',
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email)
);

-- Index for fast duplicate checks
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email
  ON newsletter_subscribers (email);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon) to INSERT — form submission
CREATE POLICY "anon_can_insert_newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated users / service_role can SELECT
CREATE POLICY "auth_can_select_newsletter"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);
