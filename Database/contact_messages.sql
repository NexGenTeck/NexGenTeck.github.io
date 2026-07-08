-- PostgreSQL syntax for Supabase
-- Run this in Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  subject VARCHAR(200) DEFAULT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon) to INSERT (submit the form)
CREATE POLICY "Allow public insert" ON contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated users (admins) can SELECT
CREATE POLICY "Allow authenticated select" ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);
