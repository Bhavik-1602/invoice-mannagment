'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/app/(dashboard)/layout';
import { Invoice, Customer, CompanySettings, TermCondition } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateInvoicePDF } from '@/lib/pdf';
import { DataStore } from '@/lib/data-store';
import Link from 'next/link';
import { IconCopy, IconDownload, IconEdit, IconEye, IconInvoices, IconPrint, IconTrash } from '@/components/Icons';

function SortIndicator({ active, order }: { active: boolean; order: 'asc' | 'desc' }) {
  if (!active) return <span style={{ opacity: 0.3 }}>↕</span>;
  return <span>{order === 'asc' ? '↑' : '↓'}</span>;
}

function InvoicesContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [terms, setTerms] = useState<TermCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterGstType, setFilterGstType] = useState('');
  const [sortBy, setSortBy] = useState('invoice_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const fetchInvoices = async () => {
    try {
      const data = await DataStore.getInvoices();
      setInvoices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    const data = await DataStore.getCustomers();
    setCustomers(data || []);
  };

  const fetchSettings = async () => {
    const data = await DataStore.getSettings();
    if (data) setSettings(data);
  };

  const fetchTerms = async () => {
    const data = await DataStore.getTerms();
    setTerms(data || []);
  };

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
    fetchSettings();
    fetchTerms();

    // Handle duplicate redirect
    const duplicateId = searchParams.get('duplicate');
    if (duplicateId) {
      router.push(`/invoices/new?duplicate=${duplicateId}`);
    }
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await DataStore.deleteInvoice(deleteId);
      setInvoices((prev) => prev.filter((inv) => inv.id !== deleteId));
      showToast('Invoice deleted (stock restored)', 'success');
    } catch {
      showToast('Failed to delete invoice', 'error');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleDownloadPDF = async (invoiceId: string) => {
    const invData = await DataStore.getInvoice(invoiceId);
    if (!invData) {
      showToast('Invoice data not found', 'error');
      return;
    }
    const currentSettings = settings || (await DataStore.getSettings());
    const currentTerms = terms.length > 0 ? terms : await DataStore.getTerms();

    const doc = generateInvoicePDF(invData.invoice, invData.items, currentSettings, currentTerms);
    doc.save(`Invoice-${invData.invoice.invoice_no}.pdf`);
    showToast('PDF downloaded', 'success');
  };

  // Filter and sort
  const filteredInvoices = invoices
    .filter((inv) => {
      if (search) {
        const s = search.toLowerCase();
        const matches =
          inv.invoice_no.toLowerCase().includes(s) ||
          inv.customer_name_snapshot.toLowerCase().includes(s) ||
          (inv.customer_gstin_snapshot && inv.customer_gstin_snapshot.toLowerCase().includes(s)) ||
          (inv.po_no && inv.po_no.toLowerCase().includes(s));
        if (!matches) return false;
      }
      if (dateFrom && inv.invoice_date < dateFrom) return false;
      if (dateTo && inv.invoice_date > dateTo) return false;
      if (filterCustomer && inv.customer_id !== filterCustomer) return false;
      if (filterGstType && inv.gst_type !== filterGstType) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortBy) {
        case 'invoice_date':
          aVal = a.invoice_date;
          bVal = b.invoice_date;
          break;
        case 'invoice_no':
          aVal = a.invoice_no;
          bVal = b.invoice_no;
          break;
        case 'customer_name':
          aVal = a.customer_name_snapshot;
          bVal = b.customer_name_snapshot;
          break;
        case 'grand_total':
          aVal = Number(a.grand_total);
          bVal = Number(b.grand_total);
          break;
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  const clearFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setFilterCustomer('');
    setFilterGstType('');
    setSortBy('invoice_date');
    setSortOrder('desc');
  };

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('desc');
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
    <div>
      {/* Search & Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Invoice no, customer, GSTIN, PO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Date From</label>
            <input
              type="date"
              className="form-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Date To</label>
            <input
              type="date"
              className="form-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Customer</label>
            <select
              className="form-input"
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
            >
              <option value="">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.customer_name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">GST Type</label>
            <select
              className="form-input"
              value={filterGstType}
              onChange={(e) => setFilterGstType(e.target.value)}
            >
              <option value="">All</option>
              <option value="cgst_sgst">CGST + SGST</option>
              <option value="igst">IGST</option>
            </select>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={clearFilters} style={{ height: '38px' }}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Invoices ({filteredInvoices.length})
          </h3>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconInvoices size={22} /></div>
            <div className="empty-state-title">No invoices found</div>
            <div className="empty-state-text">
              {invoices.length === 0
                ? 'Create your first invoice to get started'
                : 'Try adjusting your search or filters'}
            </div>
            {invoices.length === 0 && (
              <Link href="/invoices/new" className="btn btn-primary">
                New Invoice
              </Link>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => toggleSort('invoice_no')} style={{ cursor: 'pointer' }}>
                    Invoice No. <SortIndicator active={sortBy === 'invoice_no'} order={sortOrder} />
                  </th>
                  <th onClick={() => toggleSort('customer_name')} style={{ cursor: 'pointer' }}>
                    Customer <SortIndicator active={sortBy === 'customer_name'} order={sortOrder} />
                  </th>
                  <th>GSTIN</th>
                  <th onClick={() => toggleSort('invoice_date')} style={{ cursor: 'pointer' }}>
                    Date <SortIndicator active={sortBy === 'invoice_date'} order={sortOrder} />
                  </th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                  <th style={{ textAlign: 'right' }}>GST</th>
                  <th onClick={() => toggleSort('grand_total')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                    Grand Total <SortIndicator active={sortBy === 'grand_total'} order={sortOrder} />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 500 }}>
                      <div>{inv.invoice_no}</div>
                      {inv.company_name_snapshot && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          {inv.company_name_snapshot}
                        </div>
                      )}
                    </td>
                    <td>{inv.customer_name_snapshot}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{inv.customer_gstin_snapshot || '-'}</td>
                    <td>{formatDate(inv.invoice_date)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(inv.subtotal)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(inv.total_gst)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(inv.grand_total)}</td>
                    <td>
                      <div className="row-actions">
                        <Link href={`/invoices/${inv.id}`} className="icon-btn" title="View" aria-label="View">
                          <IconEye size={16} />
                        </Link>
                        <Link href={`/invoices/${inv.id}/edit`} className="icon-btn" title="Edit" aria-label="Edit">
                          <IconEdit size={16} />
                        </Link>
                        <button
                          className="icon-btn"
                          onClick={() => handleDownloadPDF(inv.id)}
                          title="Download PDF"
                          aria-label="Download PDF"
                        >
                          <IconDownload size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => {
                            window.open(`/invoices/${inv.id}`, '_blank');
                          }}
                          title="Print"
                          aria-label="Print"
                        >
                          <IconPrint size={16} />
                        </button>
                        <Link href={`/invoices/new?duplicate=${inv.id}`} className="icon-btn" title="Duplicate" aria-label="Duplicate">
                          <IconCopy size={16} />
                        </Link>
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={() => setDeleteId(inv.id)}
                          title="Delete"
                          aria-label="Delete"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete Invoice</h3>
            <p className="modal-text">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InvoicesContent />
    </Suspense>
  );
}
