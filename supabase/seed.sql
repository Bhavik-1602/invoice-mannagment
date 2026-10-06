-- ============================================
-- SEED DATA FOR TAX INVOICE SYSTEM
-- Run this in Supabase SQL Editor if you want to
-- populate sample data into Supabase directly.
-- ============================================

-- Ensure columns exist for multiple firm snapshots:
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS company_name_snapshot TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS company_address_snapshot TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS company_gstin_snapshot TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS bank_name_snapshot TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS account_number_snapshot TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS ifsc_code_snapshot TEXT;

-- If you have a signed-in user, you can associate this data with that user's id.
-- Alternatively, this script inserts initial records:

DO $$
DECLARE
  v_user_id UUID;
  v_customer_id UUID;
  v_product_id UUID;
  v_invoice_id UUID;
BEGIN
  -- Grab the first user or create records
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  -- 1. Insert / Update Company Settings
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.company_settings (
      user_id,
      company_name,
      company_address,
      company_gstin,
      bank_name,
      account_number,
      ifsc_code,
      signature_url
    ) VALUES (
      v_user_id,
      'R K WOODS',
      'SR NO 1092/93 UTILITY MART GIDC 361004',
      '24ACEFA9137E1ZM',
      'KOTAK BANK',
      '1612991878',
      'KKBK002016',
      '/signature.png'
    ) ON CONFLICT (user_id) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      company_address = EXCLUDED.company_address,
      company_gstin = EXCLUDED.company_gstin,
      bank_name = EXCLUDED.bank_name,
      account_number = EXCLUDED.account_number,
      ifsc_code = EXCLUDED.ifsc_code,
      signature_url = EXCLUDED.signature_url;

    -- 2. Insert Terms & Conditions
    INSERT INTO public.terms_conditions (user_id, term_text, sort_order)
    VALUES
      (v_user_id, 'Goods once sold will not be taken back.', 1),
      (v_user_id, 'Interest @18% p.a. will be charged if payment is not made within due date.', 2),
      (v_user_id, 'Subject to jurisdiction only.', 3)
    ON CONFLICT DO NOTHING;

    -- 3. Insert Customer: AABHA ENTERPRISE
    INSERT INTO public.customers (
      user_id,
      customer_name,
      address,
      place_of_supply,
      gstin
    ) VALUES (
      v_user_id,
      'AABHA ENTERPRISE',
      'JAMNAGAR ROAD GHANTESVER 360006',
      '24',
      '24ACEFA9137E1ZM'
    ) RETURNING id INTO v_customer_id;

    -- 4. Insert Products with Stock
    INSERT INTO public.products (
      user_id,
      product_name,
      description,
      hsn_sac,
      rate,
      gst_percentage,
      stock_quantity,
      unit
    ) VALUES (
      v_user_id,
      'Power slod tank high tension power',
      E'Making 72 MM\nCooper cotting machine slid',
      '32345421',
      310000.00,
      18,
      46,
      'PCS'
    ) RETURNING id INTO v_product_id;

    INSERT INTO public.products (
      user_id,
      product_name,
      description,
      hsn_sac,
      rate,
      gst_percentage,
      stock_quantity,
      unit
    ) VALUES (
      v_user_id,
      'Drm testing front desk measurements',
      'Machine',
      '32345421',
      150000.00,
      18,
      20,
      'PCS'
    );

    -- 5. Insert Sample Invoice: RKW1211/2526
    INSERT INTO public.invoices (
      user_id,
      invoice_no,
      customer_id,
      customer_name_snapshot,
      customer_address_snapshot,
      customer_place_of_supply_snapshot,
      customer_gstin_snapshot,
      invoice_date,
      gst_type,
      subtotal,
      cgst,
      sgst,
      igst,
      total_gst,
      grand_total,
      gst_in_words,
      amount_in_words
    ) VALUES (
      v_user_id,
      'RKW1211/2526',
      v_customer_id,
      'AABHA ENTERPRISE',
      'JAMNAGAR ROAD GHANTESVER 360006',
      '24',
      '24ACEFA9137E1ZM',
      '2026-09-18',
      'cgst_sgst',
      1240000.00,
      111600.00,
      111600.00,
      0.00,
      223200.00,
      1463200.00,
      'Two Lakh Twenty Three Thousand Two Hundred Rupees Only',
      'Fourteen Lakh Sixty Three Thousand Two Hundred Rupees Only'
    ) RETURNING id INTO v_invoice_id;

    -- 6. Insert Invoice Items
    INSERT INTO public.invoice_items (
      invoice_id,
      product_id,
      product_name_snapshot,
      description_snapshot,
      hsn_sac_snapshot,
      qty,
      rate,
      taxable_amount,
      gst_percentage,
      cgst_amount,
      sgst_amount,
      igst_amount,
      total_amount,
      sr_no
    ) VALUES (
      v_invoice_id,
      v_product_id,
      'Power slod tank high tension power',
      E'Making 72 MM\nCooper cotting machine slid',
      '32345421',
      4,
      310000.00,
      1240000.00,
      18,
      111600.00,
      111600.00,
      0.00,
      1463200.00,
      1
    );

  END IF;
END $$;
