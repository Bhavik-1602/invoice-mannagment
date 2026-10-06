-- Fixed seller ("Billed From") details used on every invoice.
-- Run after company_profiles.sql in the Supabase SQL editor.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM company_settings) THEN
    UPDATE company_settings SET
      company_name = 'IMPORT EXPORT',
      company_address = 'GATE NO 3 KISHAN GATE METODA LODHIKA GIDC RAJKOT, 360021',
      bank_name = 'KOTAK BANK',
      account_number = '1612991878',
      ifsc_code = 'KKBK002016',
      updated_at = NOW();
  ELSE
    INSERT INTO company_settings (company_name, company_address, bank_name, account_number, ifsc_code)
    VALUES ('IMPORT EXPORT', 'GATE NO 3 KISHAN GATE METODA LODHIKA GIDC RAJKOT, 360021', 'KOTAK BANK', '1612991878', 'KKBK002016');
  END IF;
END $$;

INSERT INTO company_profiles (company_name, company_address, bank_name, account_number, ifsc_code)
VALUES ('IMPORT EXPORT', 'GATE NO 3 KISHAN GATE METODA LODHIKA GIDC RAJKOT, 360021', 'KOTAK BANK', '1612991878', 'KKBK002016')
ON CONFLICT (company_name) DO UPDATE SET
  company_address = EXCLUDED.company_address,
  bank_name = EXCLUDED.bank_name,
  account_number = EXCLUDED.account_number,
  ifsc_code = EXCLUDED.ifsc_code,
  updated_at = NOW();
