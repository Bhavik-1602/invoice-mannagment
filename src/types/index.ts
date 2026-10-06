// TypeScript types for the Invoice Management System

export type GstType = 'cgst_sgst' | 'igst' | 'none';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  customer_name: string;
  address: string;
  place_of_supply: string;
  gstin: string | null;
  created_at: string;
  updated_at: string;
  invoice_count?: number;
}

export interface Product {
  id: string;
  user_id: string;
  product_name: string;
  description: string | null;
  hsn_sac: string | null;
  default_rate: number;
  gst_percentage: number;
  stock_quantity: number;
  unit: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfile {
  id: string;
  company_name: string;
  company_address: string;
  company_gstin?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_no: string;
  // Seller / Company snapshot per invoice (allows different billing firms)
  company_name_snapshot?: string | null;
  company_address_snapshot?: string | null;
  company_gstin_snapshot?: string | null;
  bank_name_snapshot?: string | null;
  account_number_snapshot?: string | null;
  ifsc_code_snapshot?: string | null;

  customer_id: string | null;
  customer_name_snapshot: string;
  customer_address_snapshot: string;
  customer_place_of_supply_snapshot: string;
  customer_gstin_snapshot: string | null;
  invoice_date: string;
  po_no: string | null;
  po_date: string | null;
  gst_type: GstType;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_gst: number;
  grand_total: number;
  gst_in_words: string | null;
  amount_in_words: string | null;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  product_id: string | null;
  sr_no: number;
  product_name_snapshot: string;
  description_snapshot: string | null;
  hsn_sac_snapshot: string | null;
  qty: number;
  rate: number;
  gst_percentage: number;
  taxable_amount: number;
  gst_amount: number;
  created_at?: string;
}

export interface CompanySettings {
  id: string;
  user_id: string;
  company_name: string;
  company_address: string;
  company_gstin: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  logo_url: string | null;
  signature_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TermCondition {
  id: string;
  user_id: string;
  term_text: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// Form types for creating/editing
export interface InvoiceFormData {
  // Seller / Company details (editable per invoice)
  company_name: string;
  company_address: string;
  company_gstin: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  save_company_profile?: boolean;

  customer_id: string | null;
  customer_name: string;
  customer_address: string;
  customer_place_of_supply: string;
  customer_gstin: string;
  invoice_no: string;
  invoice_date: string;
  po_no: string;
  po_date: string;
  gst_type: GstType;
  items: InvoiceItemFormData[];
}

export interface InvoiceItemFormData {
  id?: string;
  product_id: string | null;
  product_name: string;
  description: string;
  hsn_sac: string;
  qty: number | string;
  rate: number | string;
  gst_percentage: number | string;
  save_to_master?: boolean;
  available_stock?: number | null;
  unit?: string | null;
}

export interface InvoiceFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  customerId: string;
  gstType: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
