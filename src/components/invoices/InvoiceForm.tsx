'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/(dashboard)/layout';
import { Customer, Product, InvoiceFormData, InvoiceItemFormData, CompanyProfile } from '@/types';
import { calculateInvoiceTotals } from '@/lib/gst';
import { amountToWords } from '@/lib/number-to-words';
import { formatCurrency, getTodayISO, parseNumeric, roundTo2 } from '@/lib/utils';
import { DataStore } from '@/lib/data-store';

interface InvoiceFormProps {
  mode: 'create' | 'edit';
  invoiceId?: string;
  duplicateFrom?: string;
}

const emptyItem: InvoiceItemFormData = {
  product_id: null,
  product_name: '',
  description: '',
  hsn_sac: '',
  qty: '',
  rate: '',
  gst_percentage: '18',
  save_to_master: false,
};

export default function InvoiceForm({ mode, invoiceId, duplicateFrom }: InvoiceFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<InvoiceFormData>({
    company_name: '',
    company_address: '',
    company_gstin: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    save_company_profile: true,
    customer_id: null,
    customer_name: '',
    customer_address: '',
    customer_place_of_supply: '',
    customer_gstin: '',
    invoice_no: '',
    invoice_date: getTodayISO(),
    po_no: '',
    po_date: '',
    gst_type: 'cgst_sgst',
    items: [{ ...emptyItem }],
  });

  const [companyProfiles, setCompanyProfiles] = useState<CompanyProfile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [productSearchIndex, setProductSearchIndex] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit' || !!duplicateFrom);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const customerRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);

  const fetchCompaniesAndSettings = async () => {
    try {
      const profiles = await DataStore.getCompanyProfiles();
      setCompanyProfiles(profiles || []);

      if (mode === 'create' && !duplicateFrom) {
        const settings = await DataStore.getSettings();
        if (profiles && profiles.length > 0) {
          const first = profiles[0];
          setFormData((prev) => ({
            ...prev,
            company_name: prev.company_name || first.company_name || '',
            company_address: prev.company_address || first.company_address || '',
            company_gstin: prev.company_gstin || first.company_gstin || '',
            bank_name: prev.bank_name || first.bank_name || '',
            account_number: prev.account_number || first.account_number || '',
            ifsc_code: prev.ifsc_code || first.ifsc_code || '',
          }));
        } else if (settings && settings.company_name) {
          setFormData((prev) => ({
            ...prev,
            company_name: prev.company_name || settings.company_name || '',
            company_address: prev.company_address || settings.company_address || '',
            company_gstin: prev.company_gstin || settings.company_gstin || '',
            bank_name: prev.bank_name || settings.bank_name || '',
            account_number: prev.account_number || settings.account_number || '',
            ifsc_code: prev.ifsc_code || settings.ifsc_code || '',
          }));
        }
      }
    } catch (e) {
      console.warn('Could not load company profiles:', e);
    }
  };

  const fetchCustomers = async () => {
    const data = await DataStore.getCustomers();
    setCustomers(data || []);
  };

  const fetchProducts = async () => {
    const data = await DataStore.getProducts();
    setProducts(data || []);
  };

  const fetchInvoice = async (id: string, isDuplicate = false) => {
    try {
      const invData = await DataStore.getInvoice(id);
      if (!invData) throw new Error('Invoice not found');

      const { invoice, items } = invData;
      const settings = await DataStore.getSettings();

      const formItems: InvoiceItemFormData[] = (items || []).map((item) => ({
        id: isDuplicate ? undefined : item.id,
        product_id: item.product_id,
        product_name: item.product_name_snapshot,
        description: item.description_snapshot || '',
        hsn_sac: item.hsn_sac_snapshot || '',
        qty: item.qty,
        rate: item.rate,
        gst_percentage: item.gst_percentage,
        save_to_master: false,
      }));

      setFormData({
        company_name: invoice.company_name_snapshot ?? settings?.company_name ?? '',
        company_address: invoice.company_address_snapshot ?? settings?.company_address ?? '',
        company_gstin: invoice.company_gstin_snapshot ?? settings?.company_gstin ?? '',
        bank_name: invoice.bank_name_snapshot ?? settings?.bank_name ?? '',
        account_number: invoice.account_number_snapshot ?? settings?.account_number ?? '',
        ifsc_code: invoice.ifsc_code_snapshot ?? settings?.ifsc_code ?? '',
        save_company_profile: false,
        customer_id: invoice.customer_id,
        customer_name: invoice.customer_name_snapshot,
        customer_address: invoice.customer_address_snapshot,
        customer_place_of_supply: invoice.customer_place_of_supply_snapshot,
        customer_gstin: invoice.customer_gstin_snapshot || '',
        invoice_no: isDuplicate ? '' : invoice.invoice_no,
        invoice_date: isDuplicate ? getTodayISO() : invoice.invoice_date,
        po_no: invoice.po_no || '',
        po_date: invoice.po_date || '',
        gst_type: invoice.gst_type,
        items: formItems.length > 0 ? formItems : [{ ...emptyItem }],
      });
    } catch (err) {
      showToast('Failed to load invoice', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchCompaniesAndSettings();

    if (mode === 'edit' && invoiceId) {
      fetchInvoice(invoiceId);
    } else if (duplicateFrom) {
      fetchInvoice(duplicateFrom, true);
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (customerRef.current && !customerRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
      if (productRef.current && !productRef.current.contains(e.target as Node)) {
        setProductSearchIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Customer selection
  const filteredCustomers = customers.filter((c) =>
    c.customer_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.gstin && c.gstin.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  const selectCustomer = (customer: Customer) => {
    setFormData((prev) => ({
      ...prev,
      customer_id: customer.id,
      customer_name: customer.customer_name,
      customer_address: customer.address,
      customer_place_of_supply: customer.place_of_supply,
      customer_gstin: customer.gstin || '',
    }));
    setCustomerSearch(customer.customer_name);
    setShowCustomerDropdown(false);
  };

  // Product selection
  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectProduct = (product: Product, index: number) => {
    updateItem(index, {
      product_id: product.id,
      product_name: product.product_name,
      description: product.description || '',
      hsn_sac: product.hsn_sac || '',
      rate: product.default_rate,
      gst_percentage: product.gst_percentage,
      available_stock: product.stock_quantity ?? 0,
      unit: product.unit || 'Pcs',
    });
    setProductSearchIndex(null);
    setProductSearch('');
  };

  // Item management
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { ...emptyItem }],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, updates: Partial<InvoiceItemFormData>) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    }));
  };

  // Calculations
  const totals = calculateInvoiceTotals(formData.items, formData.gst_type);

  // Validate
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.company_name.trim()) errs.company_name = 'Firm / Company name is required';
    if (!formData.company_address.trim()) errs.company_address = 'Firm address is required';
    if (!formData.customer_name.trim()) errs.customer_name = 'Customer name is required';
    if (!formData.customer_address.trim()) errs.customer_address = 'Address is required';
    if (!formData.customer_place_of_supply.trim()) errs.customer_place_of_supply = 'Place of supply is required';
    if (!formData.invoice_no.trim()) errs.invoice_no = 'Invoice number is required';
    if (!formData.invoice_date) errs.invoice_date = 'Invoice date is required';

    formData.items.forEach((item, i) => {
      if (!item.product_name.trim()) errs[`item_${i}_name`] = 'Product name is required';
      if (parseNumeric(item.qty) <= 0) errs[`item_${i}_qty`] = 'Quantity must be > 0';
      if (parseNumeric(item.rate) < 0) errs[`item_${i}_rate`] = 'Rate must be >= 0';
      const gst = parseNumeric(item.gst_percentage);
      if (gst < 0 || gst > 100) errs[`item_${i}_gst`] = 'GST must be 0-100';
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save
  const handleSave = async () => {
    if (!validate()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setSaving(true);

    try {
      // Save company profile if requested
      if (formData.save_company_profile !== false && formData.company_name.trim()) {
        try {
          await DataStore.saveCompanyProfile({
            company_name: formData.company_name.trim(),
            company_address: formData.company_address.trim(),
            company_gstin: formData.company_gstin.trim() || null,
            bank_name: formData.bank_name.trim() || null,
            account_number: formData.account_number.trim() || null,
            ifsc_code: formData.ifsc_code.trim() || null,
          });
        } catch (e) {
          console.warn('Could not save company profile:', e);
        }
      }

      // Save customer if needed
      let customerId = formData.customer_id;
      if (!customerId && formData.customer_name.trim()) {
        const savedCust = await DataStore.saveCustomer({
          customer_name: formData.customer_name.trim(),
          address: formData.customer_address.trim(),
          place_of_supply: formData.customer_place_of_supply.trim(),
          gstin: formData.customer_gstin.trim() || null,
        });
        customerId = savedCust.id;
      }

      // Save new products to master if requested
      const newProductIds: Record<number, string> = {};
      for (let i = 0; i < formData.items.length; i++) {
        const itm = formData.items[i];
        if (itm.save_to_master && !itm.product_id && itm.product_name.trim()) {
          const newProd = await DataStore.saveProduct({
            product_name: itm.product_name.trim(),
            description: itm.description.trim() || null,
            hsn_sac: itm.hsn_sac.trim() || null,
            default_rate: parseNumeric(itm.rate),
            gst_percentage: parseNumeric(itm.gst_percentage),
            stock_quantity: 0,
            unit: 'PCS',
          });
          newProductIds[i] = newProd.id;
        }
      }

      const gstInWords = amountToWords(totals.totalGst);
      const amountInWords = amountToWords(totals.grandTotal);

      const invoiceData = {
        invoice_no: formData.invoice_no.trim(),
        company_name_snapshot: formData.company_name.trim(),
        company_address_snapshot: formData.company_address.trim(),
        company_gstin_snapshot: formData.company_gstin.trim() || null,
        bank_name_snapshot: formData.bank_name.trim() || null,
        account_number_snapshot: formData.account_number.trim() || null,
        ifsc_code_snapshot: formData.ifsc_code.trim() || null,
        customer_id: customerId,
        customer_name_snapshot: formData.customer_name.trim(),
        customer_address_snapshot: formData.customer_address.trim(),
        customer_place_of_supply_snapshot: formData.customer_place_of_supply.trim(),
        customer_gstin_snapshot: formData.customer_gstin.trim() || null,
        invoice_date: formData.invoice_date,
        po_no: formData.po_no.trim() || null,
        po_date: formData.po_date || null,
        gst_type: formData.gst_type,
        subtotal: totals.subtotal,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        total_gst: totals.totalGst,
        grand_total: totals.grandTotal,
        gst_in_words: gstInWords,
        amount_in_words: amountInWords,
      };

      const itemsToInsert = totals.items.map((item, index) => ({
        product_id: newProductIds[index] || item.product_id,
        sr_no: index + 1,
        product_name_snapshot: item.product_name.trim(),
        description_snapshot: item.description.trim() || null,
        hsn_sac_snapshot: item.hsn_sac.trim() || null,
        qty: parseNumeric(item.qty),
        rate: parseNumeric(item.rate),
        gst_percentage: parseNumeric(item.gst_percentage),
        taxable_amount: item.taxable_amount || 0,
        gst_amount: item.gst_amount || 0,
      }));

      const savedInvoiceId = await DataStore.saveInvoice(
        invoiceData,
        itemsToInsert,
        mode,
        invoiceId
      );

      showToast(mode === 'edit' ? 'Invoice updated successfully' : 'Invoice saved successfully', 'success');
      router.push(`/invoices/${savedInvoiceId}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Save error:', err);
      showToast('Failed to save invoice: ' + errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Seller / Billed From Details (Editable per invoice) */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>
              Seller / Billed From
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Select or manually type the billing firm name and details for this invoice
            </p>
          </div>
          {companyProfiles.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Saved firm</span>
              <select
                className="form-input form-select"
                style={{ width: 'auto', minWidth: '180px', padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
                onChange={(e) => {
                  const selected = companyProfiles.find((c) => c.id === e.target.value);
                  if (selected) {
                    setFormData((prev) => ({
                      ...prev,
                      company_name: selected.company_name,
                      company_address: selected.company_address,
                      company_gstin: selected.company_gstin || '',
                      bank_name: selected.bank_name || '',
                      account_number: selected.account_number || '',
                      ifsc_code: selected.ifsc_code || '',
                    }));
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>-- Select Saved Firm --</option>
                {companyProfiles.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Firm / Company Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.company_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
              placeholder="e.g. YOUR FIRM / COMPANY NAME"
            />
            {errors.company_name && <div className="form-error">{errors.company_name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Firm GSTIN No.</label>
            <input
              type="text"
              className="form-input"
              value={formData.company_gstin}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_gstin: e.target.value }))}
              placeholder="e.g. 24XXXXXXXXXXXXX"
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Firm Address *</label>
            <textarea
              className="form-input form-textarea"
              value={formData.company_address}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_address: e.target.value }))}
              placeholder="Firm address (shop, street, city, pin code)..."
              rows={2}
            />
            {errors.company_address && <div className="form-error">{errors.company_address}</div>}
          </div>
        </div>

        {/* Bank Details section */}
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Bank details
            </span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer', color: 'var(--primary)' }}>
              <input
                type="checkbox"
                checked={formData.save_company_profile !== false}
                onChange={(e) => setFormData((prev) => ({ ...prev, save_company_profile: e.target.checked }))}
              />
              Remember this firm for future invoices
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.bank_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, bank_name: e.target.value }))}
                placeholder="e.g. KOTAK BANK / SBI"
              />
            </div>
            <div className="form-group">
              <label className="form-label">A/C No.</label>
              <input
                type="text"
                className="form-input"
                value={formData.account_number}
                onChange={(e) => setFormData((prev) => ({ ...prev, account_number: e.target.value }))}
                placeholder="e.g. 1612991878"
              />
            </div>
            <div className="form-group">
              <label className="form-label">IFSC Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.ifsc_code}
                onChange={(e) => setFormData((prev) => ({ ...prev, ifsc_code: e.target.value }))}
                placeholder="e.g. KKBK002016"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>Customer / Billed to</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="form-group" ref={customerRef}>
            <label className="form-label">M/s. / Customer Name *</label>
            <div className="autocomplete-wrapper">
              <input
                type="text"
                className="form-input"
                value={formData.customer_name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, customer_name: e.target.value, customer_id: null }));
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => {
                  setCustomerSearch(formData.customer_name);
                  setShowCustomerDropdown(true);
                }}
                placeholder="Type customer name..."
              />
              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div className="autocomplete-dropdown">
                  {filteredCustomers.slice(0, 8).map((c) => (
                    <div
                      key={c.id}
                      className="autocomplete-item"
                      onClick={() => selectCustomer(c)}
                    >
                      <div className="autocomplete-item-name">{c.customer_name}</div>
                      <div className="autocomplete-item-sub">{c.place_of_supply} {c.gstin ? `• ${c.gstin}` : ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.customer_name && <div className="form-error">{errors.customer_name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">GSTIN No.</label>
            <input
              type="text"
              className="form-input"
              value={formData.customer_gstin}
              onChange={(e) => setFormData((prev) => ({ ...prev, customer_gstin: e.target.value }))}
              placeholder="Customer GSTIN"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea
              className="form-input form-textarea"
              value={formData.customer_address}
              onChange={(e) => setFormData((prev) => ({ ...prev, customer_address: e.target.value }))}
              placeholder="Customer address"
              rows={2}
            />
            {errors.customer_address && <div className="form-error">{errors.customer_address}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Place of Supply *</label>
            <input
              type="text"
              className="form-input"
              value={formData.customer_place_of_supply}
              onChange={(e) => setFormData((prev) => ({ ...prev, customer_place_of_supply: e.target.value }))}
              placeholder="e.g., Gujarat"
            />
            {errors.customer_place_of_supply && <div className="form-error">{errors.customer_place_of_supply}</div>}
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>📑 Invoice Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Invoice No. *</label>
            <input
              type="text"
              className="form-input"
              value={formData.invoice_no}
              onChange={(e) => setFormData((prev) => ({ ...prev, invoice_no: e.target.value }))}
              placeholder="e.g., INV-001"
            />
            {errors.invoice_no && <div className="form-error">{errors.invoice_no}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Invoice Date *</label>
            <input
              type="date"
              className="form-input"
              value={formData.invoice_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, invoice_date: e.target.value }))}
            />
            {errors.invoice_date && <div className="form-error">{errors.invoice_date}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">P.O. No.</label>
            <input
              type="text"
              className="form-input"
              value={formData.po_no}
              onChange={(e) => setFormData((prev) => ({ ...prev, po_no: e.target.value }))}
              placeholder="Purchase Order No."
            />
          </div>

          <div className="form-group">
            <label className="form-label">P.O. Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.po_date}
              onChange={(e) => setFormData((prev) => ({ ...prev, po_date: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">GST Type</label>
            <select
              className="form-input"
              value={formData.gst_type}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                gst_type: e.target.value as 'cgst_sgst' | 'igst',
              }))}
            >
              <option value="cgst_sgst">CGST + SGST (Intra-State)</option>
              <option value="igst">IGST (Inter-State)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">Items</h3>
          <button type="button" className="btn btn-primary btn-sm" onClick={addItem}>
            + Add Item
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {formData.items.map((item, index) => (
            <div
              key={index}
              style={{
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '0.75rem',
                backgroundColor: index % 2 === 0 ? '#FAFBFC' : 'white',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Item #{index + 1}
                </span>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeItem(index)}
                    style={{ color: 'var(--error)' }}
                    title="Remove item"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }} ref={productSearchIndex === index ? productRef : undefined}>
                  <label className="form-label">Product Name *</label>
                  <div className="autocomplete-wrapper">
                    <input
                      type="text"
                      className="form-input"
                      value={item.product_name}
                      onChange={(e) => {
                        updateItem(index, { product_name: e.target.value, product_id: null });
                        setProductSearch(e.target.value);
                        setProductSearchIndex(index);
                      }}
                      onFocus={() => {
                        setProductSearch(item.product_name);
                        setProductSearchIndex(index);
                      }}
                      placeholder="Type product name..."
                    />
                    {productSearchIndex === index && filteredProducts.length > 0 && (
                      <div className="autocomplete-dropdown">
                        {filteredProducts.slice(0, 6).map((p) => (
                          <div
                            key={p.id}
                            className="autocomplete-item"
                            onClick={() => selectProduct(p, index)}
                          >
                            <div className="autocomplete-item-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{p.product_name}</span>
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: (p.stock_quantity ?? 0) > 0 ? 'var(--success)' : 'var(--error)',
                              }}>
                                Stock: {p.stock_quantity ?? 0} {p.unit || 'Pcs'}
                              </span>
                            </div>
                            <div className="autocomplete-item-sub">
                              HSN: {p.hsn_sac || 'N/A'} • Rate: {formatCurrency(p.default_rate)} • GST: {p.gst_percentage}%
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors[`item_${index}_name`] && <div className="form-error">{errors[`item_${index}_name`]}</div>}
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input form-textarea"
                    value={item.description}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                    placeholder="Product description (multiline supported)"
                    rows={2}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">HSN/SAC</label>
                  <input
                    type="text"
                    className="form-input"
                    value={item.hsn_sac}
                    onChange={(e) => updateItem(index, { hsn_sac: e.target.value })}
                    placeholder="HSN/SAC Code"
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Qty *</label>
                    {item.available_stock !== undefined && item.available_stock !== null && (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: Number(item.available_stock) > 0 ? 'var(--text-muted)' : 'var(--error)'
                      }}>
                        Stock: {item.available_stock} {item.unit || 'Pcs'}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    className="form-input"
                    value={item.qty}
                    onChange={(e) => updateItem(index, { qty: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="any"
                  />
                  {item.available_stock !== undefined && item.available_stock !== null && parseNumeric(item.qty) > Number(item.available_stock) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.25rem', fontWeight: 500 }}>
                      Exceeds stock ({item.available_stock} {item.unit || 'Pcs'})
                    </div>
                  )}
                  {errors[`item_${index}_qty`] && <div className="form-error">{errors[`item_${index}_qty`]}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Rate (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={item.rate}
                    onChange={(e) => updateItem(index, { rate: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="any"
                  />
                  {errors[`item_${index}_rate`] && <div className="form-error">{errors[`item_${index}_rate`]}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">GST %</label>
                  <input
                    type="number"
                    className="form-input"
                    value={item.gst_percentage}
                    onChange={(e) => updateItem(index, { gst_percentage: e.target.value })}
                    placeholder="18"
                    min="0"
                    max="100"
                    step="any"
                  />
                  {errors[`item_${index}_gst`] && <div className="form-error">{errors[`item_${index}_gst`]}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formatCurrency(roundTo2(parseNumeric(item.qty) * parseNumeric(item.rate)))}
                    readOnly
                    disabled
                    style={{ fontWeight: 600 }}
                  />
                </div>
              </div>

              {/* Save to product master checkbox */}
              {!item.product_id && item.product_name.trim() && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={item.save_to_master || false}
                    onChange={(e) => updateItem(index, { save_to_master: e.target.checked })}
                  />
                  Save this product to Product Master
                </label>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-secondary" onClick={addItem} style={{ marginTop: '0.5rem' }}>
          + Add Another Item
        </button>
      </div>

      {/* Totals */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>💰 Invoice Total</h3>
        <div style={{ maxWidth: '400px', marginLeft: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Sub Total</span>
            <span style={{ fontWeight: 500 }}>{formatCurrency(totals.subtotal)}</span>
          </div>

          {formData.gst_type === 'cgst_sgst' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>CGST</span>
                <span>{formatCurrency(totals.cgst)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>SGST</span>
                <span>{formatCurrency(totals.sgst)}</span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>IGST</span>
              <span>{formatCurrency(totals.igst)}</span>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.75rem 0',
            fontSize: '1.125rem',
            fontWeight: 700,
            borderTop: '2px solid var(--text-primary)',
            marginTop: '0.5rem',
          }}>
            <span>Grand Total</span>
            <span>{formatCurrency(totals.grandTotal)}</span>
          </div>
        </div>

        <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <p><strong>Amount in words:</strong> {amountToWords(totals.grandTotal)}</p>
          <p style={{ marginTop: '0.25rem' }}><strong>Total GST in words:</strong> {amountToWords(totals.totalGst)}</p>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner" style={{ borderTopColor: 'white' }}></span>
              Saving...
            </>
          ) : (
            mode === 'edit' ? 'Update Invoice' : 'Save Invoice'
          )}
        </button>
      </div>
    </div>
  );
}
