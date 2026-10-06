-- Saved seller firms ("Billed From") shown as suggestions on the invoice form.
-- Run this once in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS company_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL UNIQUE,
  company_address TEXT NOT NULL DEFAULT '',
  company_gstin TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public company profiles access" ON company_profiles;
CREATE POLICY "Public company profiles access" ON company_profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
