-- Allow invoices without GST (gst_type = 'none').
-- Run this once in the Supabase SQL editor.

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_gst_type_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_gst_type_check CHECK (gst_type IN ('cgst_sgst', 'igst', 'none'));
