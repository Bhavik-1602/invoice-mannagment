-- Single-workspace access for the invoice app (no login screen).
-- Run this once in the Supabase SQL editor.

ALTER TABLE customers ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_user_id_fkey;

ALTER TABLE products ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_user_id_fkey;

ALTER TABLE invoices ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_user_id_fkey;

ALTER TABLE company_settings ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE company_settings DROP CONSTRAINT IF EXISTS company_settings_user_id_fkey;

ALTER TABLE terms_conditions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE terms_conditions DROP CONSTRAINT IF EXISTS terms_conditions_user_id_fkey;

DROP POLICY IF EXISTS "Users can view own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON customers;
CREATE POLICY "Public customers access" ON customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;
CREATE POLICY "Public products access" ON products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;
CREATE POLICY "Public invoices access" ON invoices FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can insert own invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can update own invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can delete own invoice items" ON invoice_items;
CREATE POLICY "Public invoice items access" ON invoice_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own settings" ON company_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON company_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON company_settings;
CREATE POLICY "Public settings access" ON company_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own terms" ON terms_conditions;
DROP POLICY IF EXISTS "Users can insert own terms" ON terms_conditions;
DROP POLICY IF EXISTS "Users can update own terms" ON terms_conditions;
DROP POLICY IF EXISTS "Users can delete own terms" ON terms_conditions;
CREATE POLICY "Public terms access" ON terms_conditions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
