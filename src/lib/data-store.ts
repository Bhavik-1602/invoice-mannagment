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

export const SEED_SETTINGS: CompanySettings = {
  id: 'set-default',
  user_id: 'default-user',
  company_name: '',
  company_address: '',
  company_gstin: '',
  bank_name: '',
  account_number: '',
  ifsc_code: '',
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
    initializeLocalStoreIfNeeded();
    return getLocalItem<CompanyProfile[]>('inv_company_profiles', SEED_COMPANIES);
  },

  async saveCompanyProfile(profile: Partial<CompanyProfile>): Promise<CompanyProfile> {
    initializeLocalStoreIfNeeded();
    const profiles = getLocalItem<CompanyProfile[]>('inv_company_profiles', SEED_COMPANIES);
    const trimmedName = (profile.company_name || '').trim();
    if (!trimmedName) {
      throw new Error('Company / Firm name is required');
    }

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
    initializeLocalStoreIfNeeded();
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('company_settings').select('*').single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase getSettings failed, using local fallback:', e);
      }
    }
    return getLocalItem('inv_settings', SEED_SETTINGS);
  },

  async updateSettings(updates: Partial<CompanySettings>): Promise<CompanySettings> {
    initializeLocalStoreIfNeeded();
    let current = getLocalItem('inv_settings', SEED_SETTINGS);
    current = { ...current, ...updates, updated_at: new Date().toISOString() };
    setLocalItem('inv_settings', current);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('company_settings').update(updates).eq('id', current.id);
      } catch (e) {
        console.warn('Supabase updateSettings failed:', e);
      }
    }
    return current;
  },

  async getCustomers(): Promise<Customer[]> {
    initializeLocalStoreIfNeeded();
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('customers').select('*').order('customer_name');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getCustomers failed, using local fallback:', e);
      }
    }
    return getLocalItem('inv_customers', SEED_CUSTOMERS);
  },

  async saveCustomer(customer: Partial<Customer>): Promise<Customer> {
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
        customer_name: customer.customer_name || '',
        address: customer.address || '',
        place_of_supply: customer.place_of_supply || '',
        gstin: customer.gstin || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLocalItem('inv_customers', [...customers, saved]);
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        if (customer.id) {
          await supabase.from('customers').update(customer).eq('id', customer.id);
        } else {
          await supabase.from('customers').insert(saved);
        }
      } catch (e) {
        console.warn('Supabase saveCustomer failed:', e);
      }
    }

    return saved;
  },

  async deleteCustomer(id: string): Promise<void> {
    initializeLocalStoreIfNeeded();
    const customers = getLocalItem<Customer[]>('inv_customers', SEED_CUSTOMERS);
    setLocalItem('inv_customers', customers.filter((c) => c.id !== id));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('customers').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteCustomer failed:', e);
      }
    }
  },

  async getProducts(): Promise<Product[]> {
    initializeLocalStoreIfNeeded();
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('products').select('*').order('product_name');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getProducts failed, using local fallback:', e);
      }
    }
    return getLocalItem('inv_products', SEED_PRODUCTS);
  },

  async saveProduct(product: Partial<Product>): Promise<Product> {
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
        product_name: product.product_name || '',
        description: product.description || null,
        hsn_sac: product.hsn_sac || null,
        default_rate: Number(product.default_rate) || 0,
        gst_percentage: Number(product.gst_percentage) || 18,
        stock_quantity: Number(product.stock_quantity) || 0,
        unit: product.unit || 'PCS',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLocalItem('inv_products', [...products, saved]);
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        if (product.id) {
          await supabase.from('products').update(product).eq('id', product.id);
        } else {
          await supabase.from('products').insert(saved);
        }
      } catch (e) {
        console.warn('Supabase saveProduct failed:', e);
      }
    }

    return saved;
  },

  async deleteProduct(id: string): Promise<void> {
    initializeLocalStoreIfNeeded();
    const products = getLocalItem<Product[]>('inv_products', SEED_PRODUCTS);
    setLocalItem('inv_products', products.filter((p) => p.id !== id));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('products').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteProduct failed:', e);
      }
    }
  },

  async getInvoices(): Promise<Invoice[]> {
    initializeLocalStoreIfNeeded();
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('invoices').select('*').order('invoice_date', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getInvoices failed, using local fallback:', e);
      }
    }
    return getLocalItem('inv_invoices', [SEED_INVOICE]);
  },

  async getInvoice(id: string): Promise<{ invoice: Invoice; items: InvoiceItem[] } | null> {
    initializeLocalStoreIfNeeded();
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: inv, error: invErr } = await supabase.from('invoices').select('*').eq('id', id).single();
        if (!invErr && inv) {
          const { data: itms } = await supabase.from('invoice_items').select('*').eq('invoice_id', id).order('sr_no');
          return { invoice: inv, items: itms || [] };
        }
      } catch (e) {
        console.warn('Supabase getInvoice failed, using local fallback:', e);
      }
    }

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

    // Attempt Supabase sync if online
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const dbInvoice = { ...savedInvoice, user_id: user.id };
          try {
            if (mode === 'edit' && invoiceId) {
              const { error } = await supabase.from('invoices').update(dbInvoice).eq('id', invoiceId);
              if (error) throw error;
              await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
            } else {
              const { error } = await supabase.from('invoices').insert(dbInvoice);
              if (error) throw error;
            }
          } catch (colErr) {
            console.warn('Supabase invoice sync with snapshots failed, falling back to base columns:', colErr);
            const baseInvoice = { ...dbInvoice };
            delete (baseInvoice as Record<string, unknown>).company_name_snapshot;
            delete (baseInvoice as Record<string, unknown>).company_address_snapshot;
            delete (baseInvoice as Record<string, unknown>).company_gstin_snapshot;
            delete (baseInvoice as Record<string, unknown>).bank_name_snapshot;
            delete (baseInvoice as Record<string, unknown>).account_number_snapshot;
            delete (baseInvoice as Record<string, unknown>).ifsc_code_snapshot;
            if (mode === 'edit' && invoiceId) {
              await supabase.from('invoices').update(baseInvoice).eq('id', invoiceId);
              await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
            } else {
              await supabase.from('invoices').insert(baseInvoice);
            }
          }
          await supabase.from('invoice_items').insert(
            formattedItems.map((fi) => ({ ...fi, invoice_id: targetId }))
          );
        }
      } catch (e) {
        console.warn('Supabase sync skipped/failed:', e);
      }
    }

    return targetId;
  },

  async deleteInvoice(id: string): Promise<void> {
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

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('invoices').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteInvoice failed:', e);
      }
    }
  },

  async getTerms(): Promise<TermCondition[]> {
    initializeLocalStoreIfNeeded();
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('terms_conditions')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase getTerms failed, using local fallback:', e);
      }
    }
    return getLocalItem('inv_terms', SEED_TERMS);
  },

  async saveTerms(terms: TermCondition[]): Promise<void> {
    initializeLocalStoreIfNeeded();
    setLocalItem('inv_terms', terms);
  },
};
