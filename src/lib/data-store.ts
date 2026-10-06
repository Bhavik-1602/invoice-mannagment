import { Customer, Product, Invoice, InvoiceItem, CompanySettings, TermCondition, CompanyProfile } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_SIGNATURE_BASE64 } from '@/lib/default-signature';

export function isSupabaseConfigured(): boolean {
  if (typeof window === 'undefined') {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!(url && key && !url.includes('placeholder') && !url.includes('your-project'));
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return !!(url && key && !url.includes('placeholder') && !url.includes('your-project'));
}

export const DEFAULT_SELLER = {
  company_name: 'IMPORT EXPORT',
  company_address: 'GATE NO 3 KISHAN GATE METODA LODHIKA GIDC RAJKOT, 360021',
  company_gstin: '',
  bank_name: 'KOTAK BANK',
  account_number: '1612991878',
  ifsc_code: 'KKBK002016',
};

export const SEED_SETTINGS: CompanySettings = {
  id: 'set-default',
  user_id: 'default-user',
  ...DEFAULT_SELLER,
  logo_url: null,
  signature_url: DEFAULT_SIGNATURE_BASE64,
  created_at: '2026-09-18T00:00:00Z',
  updated_at: '2026-09-18T00:00:00Z',
};

export const SEED_COMPANIES: CompanyProfile[] = [];

export const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'cust-aabha',
    user_id: 'default-user',
    customer_name: 'AABHA ENTERPRISE',
    address: 'JAMNAGAR ROAD GHANTESVER 360006',
    place_of_supply: '24',
    gstin: '24ACEFA9137E1ZM',
    created_at: '2026-09-18T00:00:00Z',
    updated_at: '2026-09-18T00:00:00Z',
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-power-tank',
    user_id: 'default-user',
    product_name: 'Power slod tank high tension power',
    description: 'Making 72 MM\nCooper cotting machine slid',
    hsn_sac: '32345421',
    default_rate: 310000,
    gst_percentage: 18,
    stock_quantity: 46,
    unit: 'PCS',
    created_at: '2026-09-18T00:00:00Z',
    updated_at: '2026-09-18T00:00:00Z',
  },
  {
    id: 'prod-drm-testing',
    user_id: 'default-user',
    product_name: 'Drm testing front desk measurements',
    description: 'Machine',
    hsn_sac: '32345421',
    default_rate: 150000,
    gst_percentage: 18,
    stock_quantity: 20,
    unit: 'PCS',
    created_at: '2026-09-18T00:00:00Z',
    updated_at: '2026-09-18T00:00:00Z',
  },
];

export const SEED_TERMS: TermCondition[] = [
  {
    id: 'term-1',
    user_id: 'default-user',
    term_text: 'Goods once sold will not be taken back.',
    sort_order: 1,
    is_active: true,
    created_at: '2026-09-18T00:00:00Z',
  },
  {
    id: 'term-2',
    user_id: 'default-user',
    term_text: 'Interest @18% p.a. will be charged if payment is not made within due date.',
    sort_order: 2,
    is_active: true,
    created_at: '2026-09-18T00:00:00Z',
  },
  {
    id: 'term-3',
    user_id: 'default-user',
    term_text: 'Subject to jurisdiction only.',
    sort_order: 3,
    is_active: true,
    created_at: '2026-09-18T00:00:00Z',
  },
];

export const SEED_INVOICE: Invoice = {
  id: 'inv-rkw-sample',
  user_id: 'default-user',
  invoice_no: 'RKW1211/2526',
  customer_id: 'cust-aabha',
  customer_name_snapshot: 'AABHA ENTERPRISE',
  customer_address_snapshot: 'JAMNAGAR ROAD GHANTESVER 360006',
  customer_place_of_supply_snapshot: '24',
  customer_gstin_snapshot: '24ACEFA9137E1ZM',
  invoice_date: '2026-09-18',
  po_no: '',
  po_date: null,
  gst_type: 'cgst_sgst',
  subtotal: 1240000,
  cgst: 111600,
  sgst: 111600,
  igst: 0,
  total_gst: 223200,
  grand_total: 1463200,
  gst_in_words: 'Two Lakh Twenty Three Thousand Two Hundred Rupees Only',
  amount_in_words: 'Fourteen Lakh Sixty Three Thousand Two Hundred Rupees Only',
  created_at: '2026-09-18T00:00:00Z',
  updated_at: '2026-09-18T00:00:00Z',
};

export const SEED_ITEMS: InvoiceItem[] = [
  {
    id: 'item-1',
    invoice_id: 'inv-rkw-sample',
    product_id: 'prod-power-tank',
    product_name_snapshot: 'Power slod tank high tension power',
    description_snapshot: 'Making 72 MM\nCooper cotting machine slid',
    hsn_sac_snapshot: '32345421',
    qty: 4,
    rate: 310000,
    taxable_amount: 1240000,
    gst_percentage: 18,
    gst_amount: 223200,
    sr_no: 1,
  },
  {
    id: 'item-2',
    invoice_id: 'inv-rkw-sample',
    product_id: 'prod-drm-testing',
    product_name_snapshot: 'Drm testing front desk measurements',
    description_snapshot: 'Machine',
    hsn_sac_snapshot: '',
    qty: 0,
    rate: 0,
    taxable_amount: 0,
    gst_percentage: 0,
    gst_amount: 0,
    sr_no: 2,
  },
];

// Helper functions for LocalStorage management
function getLocalItem<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalItem<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Failed to set localStorage', e);
  }
}

function assertOk(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function isUuid(value?: string | null): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function initializeLocalStoreIfNeeded(): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('inv_settings')) {
    setLocalItem('inv_settings', SEED_SETTINGS);
  }
  if (!localStorage.getItem('inv_customers')) {
    setLocalItem('inv_customers', SEED_CUSTOMERS);
  }
  if (!localStorage.getItem('inv_products')) {
    setLocalItem('inv_products', SEED_PRODUCTS);
  }
  if (!localStorage.getItem('inv_terms')) {
    setLocalItem('inv_terms', SEED_TERMS);
  }
  if (!localStorage.getItem('inv_company_profiles')) {
    setLocalItem('inv_company_profiles', SEED_COMPANIES);
  }
  if (!localStorage.getItem('inv_invoices')) {
    setLocalItem('inv_invoices', [SEED_INVOICE]);
  }
  if (!localStorage.getItem('inv_items')) {
    setLocalItem('inv_items', SEED_ITEMS);
  }
}

export const DataStore = {
  async getCompanyProfiles(): Promise<CompanyProfile[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from('company_profiles').select('*').order('company_name');
      assertOk(error);
      return data || [];
    }
    initializeLocalStoreIfNeeded();
    return getLocalItem<CompanyProfile[]>('inv_company_profiles', SEED_COMPANIES);
  },

  async saveCompanyProfile(profile: Partial<CompanyProfile>): Promise<CompanyProfile> {
    const trimmedName = (profile.company_name || '').trim();
    if (!trimmedName) {
      throw new Error('Company / Firm name is required');
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const payload = {
        company_name: trimmedName,
        company_address: (profile.company_address || '').trim(),
        company_gstin: (profile.company_gstin || '').trim() || null,
        bank_name: (profile.bank_name || '').trim() || null,
        account_number: (profile.account_number || '').trim() || null,
        ifsc_code: (profile.ifsc_code || '').trim() || null,
      };
      const { data, error } = await supabase
        .from('company_profiles')
        .upsert(payload, { onConflict: 'company_name' })
        .select()
        .single();
      assertOk(error);
      return data;
    }

    initializeLocalStoreIfNeeded();
    const profiles = getLocalItem<CompanyProfile[]>('inv_company_profiles', SEED_COMPANIES);

    const existingIndex = profiles.findIndex(
      (p) =>
        (profile.id && p.id === profile.id) ||
        p.company_name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    let saved: CompanyProfile;
    if (existingIndex >= 0) {
      saved = {
        ...profiles[existingIndex],
        ...profile,
        company_name: trimmedName,
        company_address: (profile.company_address || profiles[existingIndex].company_address || '').trim(),
      };
      profiles[existingIndex] = saved;
    } else {
      saved = {
        id: profile.id || `comp-${Date.now()}`,
        company_name: trimmedName,
        company_address: (profile.company_address || '').trim(),
        company_gstin: (profile.company_gstin || '').trim() || null,
        bank_name: (profile.bank_name || '').trim() || null,
        account_number: (profile.account_number || '').trim() || null,
        ifsc_code: (profile.ifsc_code || '').trim() || null,
      };
      profiles.push(saved);
    }
    setLocalItem('inv_company_profiles', profiles);
    return saved;
  },

  async getSettings(): Promise<CompanySettings> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from('company_settings').select('*').limit(1).maybeSingle();
      assertOk(error);
      if (data) return data;
      return { ...SEED_SETTINGS };
    }
    initializeLocalStoreIfNeeded();
    return getLocalItem('inv_settings', SEED_SETTINGS);
  },

  async updateSettings(updates: Partial<CompanySettings>): Promise<CompanySettings> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data: existing, error: readError } = await supabase.from('company_settings').select('id').limit(1).maybeSingle();
      assertOk(readError);
      const payload = {
        company_name: updates.company_name,
        company_address: updates.company_address,
        company_gstin: updates.company_gstin,
        bank_name: updates.bank_name,
        account_number: updates.account_number,
        ifsc_code: updates.ifsc_code,
        logo_url: updates.logo_url,
        signature_url: updates.signature_url,
      };
      const definedPayload = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
      if (existing?.id) {
        const { data, error } = await supabase.from('company_settings').update(definedPayload).eq('id', existing.id).select().single();
        assertOk(error);
        return data;
      }
      const { data, error } = await supabase.from('company_settings').insert(definedPayload).select().single();
      assertOk(error);
      return data;
    }

    initializeLocalStoreIfNeeded();
    let current = getLocalItem('inv_settings', SEED_SETTINGS);
    current = { ...current, ...updates, updated_at: new Date().toISOString() };
    setLocalItem('inv_settings', current);
    return current;
  },

  async getCustomers(): Promise<Customer[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from('customers').select('*').order('customer_name');
      assertOk(error);
      return data || [];
    }
    initializeLocalStoreIfNeeded();
    return getLocalItem('inv_customers', SEED_CUSTOMERS);
  },

  async saveCustomer(customer: Partial<Customer>): Promise<Customer> {
    const payload = {
      customer_name: customer.customer_name || '',
      address: customer.address || '',
      place_of_supply: customer.place_of_supply || '',
      gstin: customer.gstin || null,
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (isUuid(customer.id)) {
        const { data, error } = await supabase.from('customers').update(payload).eq('id', customer.id).select().single();
        assertOk(error);
        return data;
      }
      const { data, error } = await supabase.from('customers').insert(payload).select().single();
      assertOk(error);
      return data;
    }

    initializeLocalStoreIfNeeded();
    const customers = getLocalItem<Customer[]>('inv_customers', SEED_CUSTOMERS);
    let saved: Customer;

    if (customer.id) {
      saved = { ...customers.find((c) => c.id === customer.id)!, ...customer, updated_at: new Date().toISOString() };
      const updated = customers.map((c) => (c.id === customer.id ? saved : c));
      setLocalItem('inv_customers', updated);
    } else {
      saved = {
        id: `cust-${Date.now()}`,
        user_id: 'default-user',
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLocalItem('inv_customers', [...customers, saved]);
    }

    return saved;
  },

  async deleteCustomer(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase.from('customers').delete().eq('id', id);
      assertOk(error);
      return;
    }
    initializeLocalStoreIfNeeded();
    const customers = getLocalItem<Customer[]>('inv_customers', SEED_CUSTOMERS);
    setLocalItem('inv_customers', customers.filter((c) => c.id !== id));
  },

  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from('products').select('*').order('product_name');
      assertOk(error);
      return data || [];
    }
    initializeLocalStoreIfNeeded();
    return getLocalItem('inv_products', SEED_PRODUCTS);
  },

  async saveProduct(product: Partial<Product>): Promise<Product> {
    const payload = {
      product_name: product.product_name || '',
      description: product.description || null,
      hsn_sac: product.hsn_sac || null,
      default_rate: Number(product.default_rate) || 0,
      gst_percentage: Number(product.gst_percentage) || 18,
      stock_quantity: Number(product.stock_quantity) || 0,
      unit: product.unit || 'PCS',
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (isUuid(product.id)) {
        const { data, error } = await supabase.from('products').update(payload).eq('id', product.id).select().single();
        assertOk(error);
        return data;
      }
      const { data, error } = await supabase.from('products').insert(payload).select().single();
      assertOk(error);
      return data;
    }

    initializeLocalStoreIfNeeded();
    const products = getLocalItem<Product[]>('inv_products', SEED_PRODUCTS);
    let saved: Product;

    if (product.id) {
      saved = { ...products.find((p) => p.id === product.id)!, ...product, updated_at: new Date().toISOString() };
      const updated = products.map((p) => (p.id === product.id ? saved : p));
      setLocalItem('inv_products', updated);
    } else {
      saved = {
        id: `prod-${Date.now()}`,
        user_id: 'default-user',
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLocalItem('inv_products', [...products, saved]);
    }

    return saved;
  },

  async deleteProduct(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase.from('products').delete().eq('id', id);
      assertOk(error);
      return;
    }
    initializeLocalStoreIfNeeded();
    const products = getLocalItem<Product[]>('inv_products', SEED_PRODUCTS);
    setLocalItem('inv_products', products.filter((p) => p.id !== id));
  },

  async getInvoices(): Promise<Invoice[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from('invoices').select('*').order('invoice_date', { ascending: false });
      assertOk(error);
      return data || [];
    }
    initializeLocalStoreIfNeeded();
    return getLocalItem('inv_invoices', [SEED_INVOICE]);
  },

  async getInvoice(id: string): Promise<{ invoice: Invoice; items: InvoiceItem[] } | null> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data: inv, error: invErr } = await supabase.from('invoices').select('*').eq('id', id).maybeSingle();
      assertOk(invErr);
      if (!inv) return null;
      const { data: itms, error: itemErr } = await supabase.from('invoice_items').select('*').eq('invoice_id', id).order('sr_no');
      assertOk(itemErr);
      return { invoice: inv, items: itms || [] };
    }

    initializeLocalStoreIfNeeded();
    const invoices = getLocalItem<Invoice[]>('inv_invoices', [SEED_INVOICE]);
    const items = getLocalItem<InvoiceItem[]>('inv_items', SEED_ITEMS);
    const foundInv = invoices.find((inv) => inv.id === id);
    if (!foundInv) return null;
    const foundItems = items.filter((itm) => itm.invoice_id === id);
    return { invoice: foundInv, items: foundItems };
  },

  async saveInvoice(
    invoiceData: Partial<Invoice>,
    itemsData: Partial<InvoiceItem>[],
    mode: 'create' | 'edit',
    invoiceId?: string
  ): Promise<string> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const invoicePayload = {
        invoice_no: invoiceData.invoice_no || `INV-${Date.now()}`,
        company_name_snapshot: invoiceData.company_name_snapshot || null,
        company_address_snapshot: invoiceData.company_address_snapshot || null,
        company_gstin_snapshot: invoiceData.company_gstin_snapshot || null,
        bank_name_snapshot: invoiceData.bank_name_snapshot || null,
        account_number_snapshot: invoiceData.account_number_snapshot || null,
        ifsc_code_snapshot: invoiceData.ifsc_code_snapshot || null,
        customer_id: isUuid(invoiceData.customer_id) ? invoiceData.customer_id : null,
        customer_name_snapshot: invoiceData.customer_name_snapshot || '',
        customer_address_snapshot: invoiceData.customer_address_snapshot || '',
        customer_place_of_supply_snapshot: invoiceData.customer_place_of_supply_snapshot || '',
        customer_gstin_snapshot: invoiceData.customer_gstin_snapshot || null,
        invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
        po_no: invoiceData.po_no || null,
        po_date: invoiceData.po_date || null,
        gst_type: invoiceData.gst_type || 'cgst_sgst',
        subtotal: Number(invoiceData.subtotal) || 0,
        cgst: Number(invoiceData.cgst) || 0,
        sgst: Number(invoiceData.sgst) || 0,
        igst: Number(invoiceData.igst) || 0,
        total_gst: Number(invoiceData.total_gst) || 0,
        grand_total: Number(invoiceData.grand_total) || 0,
        gst_in_words: invoiceData.gst_in_words || '',
        amount_in_words: invoiceData.amount_in_words || '',
      };

      let targetId = invoiceId || '';
      if (mode === 'edit' && isUuid(invoiceId)) {
        const { data: oldItems, error: oldErr } = await supabase.from('invoice_items').select('product_id, qty').eq('invoice_id', invoiceId);
        assertOk(oldErr);
        for (const oldItem of oldItems || []) {
          await adjustProductStock(oldItem.product_id, Number(oldItem.qty) || 0);
        }
        const { error } = await supabase.from('invoices').update(invoicePayload).eq('id', invoiceId);
        assertOk(error);
        const { error: deleteItemsError } = await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
        assertOk(deleteItemsError);
        targetId = invoiceId;
      } else {
        const { data, error } = await supabase.from('invoices').insert(invoicePayload).select('id').single();
        assertOk(error);
        if (!data) throw new Error('Invoice was not saved');
        targetId = data.id;
      }

      const formattedItems = itemsData.map((item, index) => ({
        invoice_id: targetId,
        product_id: isUuid(item.product_id) ? item.product_id : null,
        product_name_snapshot: item.product_name_snapshot || '',
        description_snapshot: item.description_snapshot || null,
        hsn_sac_snapshot: item.hsn_sac_snapshot || null,
        qty: Number(item.qty) || 0,
        rate: Number(item.rate) || 0,
        taxable_amount: Number(item.taxable_amount) || 0,
        gst_percentage: Number(item.gst_percentage) || 18,
        gst_amount: Number(item.gst_amount) || 0,
        sr_no: index + 1,
      }));

      if (formattedItems.length > 0) {
        const { error } = await supabase.from('invoice_items').insert(formattedItems);
        assertOk(error);
      }

      for (const item of formattedItems) {
        await adjustProductStock(item.product_id, -(Number(item.qty) || 0));
      }

      return targetId;
    }

    initializeLocalStoreIfNeeded();
    const invoices = getLocalItem<Invoice[]>('inv_invoices', [SEED_INVOICE]);
    const allItems = getLocalItem<InvoiceItem[]>('inv_items', SEED_ITEMS);
    const products = getLocalItem<Product[]>('inv_products', SEED_PRODUCTS);

    const targetId = mode === 'edit' && invoiceId ? invoiceId : `inv-${Date.now()}`;

    // Manage stock: deduct for new items, restore for replaced items
    if (mode === 'edit' && invoiceId) {
      const oldItems = allItems.filter((i) => i.invoice_id === invoiceId);
      for (const oldItm of oldItems) {
        if (oldItm.product_id) {
          const prod = products.find((p) => p.id === oldItm.product_id);
          if (prod) prod.stock_quantity = (prod.stock_quantity || 0) + (Number(oldItm.qty) || 0);
        }
      }
    }

    // Deduct stock for current items
    for (const itm of itemsData) {
      if (itm.product_id) {
        const prod = products.find((p) => p.id === itm.product_id);
        if (prod) {
          prod.stock_quantity = Math.max(0, (prod.stock_quantity || 0) - (Number(itm.qty) || 0));
        }
      }
    }
    setLocalItem('inv_products', products);

    const savedInvoice: Invoice = {
      id: targetId,
      user_id: 'default-user',
      invoice_no: invoiceData.invoice_no || `INV-${Date.now()}`,
      company_name_snapshot: invoiceData.company_name_snapshot || null,
      company_address_snapshot: invoiceData.company_address_snapshot || null,
      company_gstin_snapshot: invoiceData.company_gstin_snapshot || null,
      bank_name_snapshot: invoiceData.bank_name_snapshot || null,
      account_number_snapshot: invoiceData.account_number_snapshot || null,
      ifsc_code_snapshot: invoiceData.ifsc_code_snapshot || null,
      customer_id: invoiceData.customer_id || null,
      customer_name_snapshot: invoiceData.customer_name_snapshot || '',
      customer_address_snapshot: invoiceData.customer_address_snapshot || '',
      customer_place_of_supply_snapshot: invoiceData.customer_place_of_supply_snapshot || '',
      customer_gstin_snapshot: invoiceData.customer_gstin_snapshot || null,
      invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
      po_no: invoiceData.po_no || null,
      po_date: invoiceData.po_date || null,
      gst_type: invoiceData.gst_type || 'cgst_sgst',
      subtotal: Number(invoiceData.subtotal) || 0,
      cgst: Number(invoiceData.cgst) || 0,
      sgst: Number(invoiceData.sgst) || 0,
      igst: Number(invoiceData.igst) || 0,
      total_gst: Number(invoiceData.total_gst) || 0,
      grand_total: Number(invoiceData.grand_total) || 0,
      gst_in_words: invoiceData.gst_in_words || '',
      amount_in_words: invoiceData.amount_in_words || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (mode === 'edit' && invoiceId) {
      setLocalItem(
        'inv_invoices',
        invoices.map((inv) => (inv.id === invoiceId ? savedInvoice : inv))
      );
    } else {
      setLocalItem('inv_invoices', [savedInvoice, ...invoices]);
    }

    // Save items
    const formattedItems: InvoiceItem[] = itemsData.map((itm, idx) => ({
      id: itm.id || `item-${Date.now()}-${idx}`,
      invoice_id: targetId,
      product_id: itm.product_id || null,
      product_name_snapshot: itm.product_name_snapshot || '',
      description_snapshot: itm.description_snapshot || null,
      hsn_sac_snapshot: itm.hsn_sac_snapshot || null,
      qty: Number(itm.qty) || 0,
      rate: Number(itm.rate) || 0,
      taxable_amount: Number(itm.taxable_amount) || 0,
      gst_percentage: Number(itm.gst_percentage) || 18,
      gst_amount: Number(itm.gst_amount) || 0,
      sr_no: idx + 1,
    }));

    const remainingItems = allItems.filter((i) => i.invoice_id !== targetId);
    setLocalItem('inv_items', [...remainingItems, ...formattedItems]);

    return targetId;
  },

  async deleteInvoice(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data: items, error: itemErr } = await supabase.from('invoice_items').select('product_id, qty').eq('invoice_id', id);
      assertOk(itemErr);
      for (const item of items || []) {
        await adjustProductStock(item.product_id, Number(item.qty) || 0);
      }
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      assertOk(error);
      return;
    }

    initializeLocalStoreIfNeeded();
    const invoices = getLocalItem<Invoice[]>('inv_invoices', [SEED_INVOICE]);
    const items = getLocalItem<InvoiceItem[]>('inv_items', SEED_ITEMS);
    const products = getLocalItem<Product[]>('inv_products', SEED_PRODUCTS);

    // Restore stock
    const invoiceItems = items.filter((i) => i.invoice_id === id);
    for (const itm of invoiceItems) {
      if (itm.product_id) {
        const prod = products.find((p) => p.id === itm.product_id);
        if (prod) prod.stock_quantity = (prod.stock_quantity || 0) + (Number(itm.qty) || 0);
      }
    }
    setLocalItem('inv_products', products);

    setLocalItem('inv_invoices', invoices.filter((i) => i.id !== id));
    setLocalItem('inv_items', items.filter((i) => i.invoice_id !== id));
  },

  async getTerms(): Promise<TermCondition[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.from('terms_conditions').select('*').order('sort_order');
      assertOk(error);
      return data || [];
    }
    initializeLocalStoreIfNeeded();
    return getLocalItem('inv_terms', SEED_TERMS);
  },

  async saveTerms(terms: TermCondition[]): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error: deleteError } = await supabase.from('terms_conditions').delete().not('id', 'is', null);
      assertOk(deleteError);
      if (terms.length === 0) return;
      const { error } = await supabase.from('terms_conditions').insert(
        terms.map((term) => ({
          term_text: term.term_text,
          sort_order: term.sort_order,
          is_active: term.is_active,
        }))
      );
      assertOk(error);
      return;
    }
    initializeLocalStoreIfNeeded();
    setLocalItem('inv_terms', terms);
  },
};

async function adjustProductStock(productId: string | null | undefined, delta: number) {
  if (!isUuid(productId) || !delta) return;
  const supabase = createClient();
  const { data, error } = await supabase.from('products').select('stock_quantity').eq('id', productId).maybeSingle();
  assertOk(error);
  if (!data) return;
  const next = Math.max(0, Number(data.stock_quantity || 0) + delta);
  const { error: updateError } = await supabase.from('products').update({ stock_quantity: next }).eq('id', productId);
  assertOk(updateError);
}
