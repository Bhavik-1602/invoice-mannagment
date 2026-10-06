'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/(dashboard)/layout';
import { Invoice, InvoiceItem, CompanySettings, TermCondition } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateInvoicePDF } from '@/lib/pdf';
import { DataStore } from '@/lib/data-store';
import Link from 'next/link';
import { use } from 'react';

export default function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [terms, setTerms] = useState<TermCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  const fetchInvoice = async () => {
    try {
      const invData = await DataStore.getInvoice(id);
      if (!invData) {
        showToast('Invoice not found', 'error');
        router.push('/invoices');
        return;
      }
      setInvoice(invData.invoice);
      setItems(invData.items);
    } catch {
      showToast('Invoice not found', 'error');
      router.push('/invoices');
    } finally {
      setLoading(false);
    }
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
    fetchInvoice();
    fetchSettings();
    fetchTerms();
  }, []);

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    const currentSettings = settings || (await DataStore.getSettings());
    const currentTerms = terms.length > 0 ? terms : await DataStore.getTerms();
    const doc = generateInvoicePDF(invoice, items, currentSettings, currentTerms);
    doc.save(`Invoice-${invoice.invoice_no}.pdf`);
    showToast('PDF downloaded', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div>
      {/* Action buttons */}
      <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link href="/invoices" className="btn btn-secondary btn-sm">
          ← Back to Invoices
        </Link>
        <Link href={`/invoices/${id}/edit`} className="btn btn-secondary btn-sm">
          ✏️ Edit
        </Link>
        <button className="btn btn-primary btn-sm" onClick={handleDownloadPDF}>
          📥 Download PDF
        </button>
        <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
          🖨 Print
        </button>
        <Link href={`/invoices/new?duplicate=${id}`} className="btn btn-secondary btn-sm">
          📋 Duplicate Invoice
        </Link>
      </div>

      {/* Invoice Preview */}
      <div className="invoice-preview">
        {/* Header */}
        <div className="invoice-preview-header">
          <h1>{invoice.company_name_snapshot || settings?.company_name || 'TAX INVOICE'}</h1>
          {(invoice.company_address_snapshot || settings?.company_address) && (
            <p>{invoice.company_address_snapshot || settings?.company_address}</p>
          )}
          <div className="invoice-title">TAX INVOICE</div>
        </div>

        {/* Billed To & Invoice Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Billed To</h4>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600 }}>M/s. {invoice.customer_name_snapshot}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{invoice.customer_address_snapshot}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Place of Supply: {invoice.customer_place_of_supply_snapshot}</p>
            {invoice.customer_gstin_snapshot && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>GSTIN: {invoice.customer_gstin_snapshot}</p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.8125rem' }}><strong>Invoice No.:</strong> {invoice.invoice_no}</p>
            <p style={{ fontSize: '0.8125rem' }}><strong>Date:</strong> {formatDate(invoice.invoice_date)}</p>
            {invoice.po_no && <p style={{ fontSize: '0.8125rem' }}><strong>P.O. No.:</strong> {invoice.po_no}</p>}
            {invoice.po_date && <p style={{ fontSize: '0.8125rem' }}><strong>P.O. Date:</strong> {formatDate(invoice.po_date)}</p>}
          </div>
        </div>

        {/* Shaded Strip: GSTIN & Bank Details */}
        {(() => {
          const companyGstin = invoice.company_gstin_snapshot || settings?.company_gstin;
          const bankName = invoice.bank_name_snapshot || settings?.bank_name;
          const accNo = invoice.account_number_snapshot || settings?.account_number;
          const ifsc = invoice.ifsc_code_snapshot || settings?.ifsc_code;
          const parts: string[] = [];
          if (companyGstin) parts.push(`GSTIN No.: ${companyGstin}`);
          if (bankName) parts.push(`Bank Name: ${bankName}`);
          if (accNo) parts.push(`A/C No.: ${accNo}`);
          if (ifsc) parts.push(`IFSC: ${ifsc}`);
          if (parts.length === 0) return null;
          return (
            <div style={{
              backgroundColor: '#E2E8F0',
              padding: '0.5rem 0.75rem',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              marginBottom: '1.25rem',
              color: '#0F172A',
            }}>
              {parts.join(' | ')}
            </div>
          );
        })()}

        {/* Items Table */}
        <div className="table-container" style={{ marginBottom: '1.5rem' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Sr.</th>
                <th>Product Name / Description</th>
                <th>HSN/SAC</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Rate</th>
                <th style={{ textAlign: 'center' }}>GST %</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id || index}>
                  <td style={{ textAlign: 'center' }}>{index + 1}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.product_name_snapshot}</div>
                    {item.description_snapshot && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>
                        {item.description_snapshot}
                      </div>
                    )}
                  </td>
                  <td>{item.hsn_sac_snapshot || '-'}</td>
                  <td style={{ textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(item.rate)}</td>
                  <td style={{ textAlign: 'center' }}>{item.gst_percentage}%</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(item.taxable_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ maxWidth: '350px', marginLeft: 'auto', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Sub Total</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.gst_type === 'cgst_sgst' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>CGST</span>
                <span>{formatCurrency(invoice.cgst)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>SGST</span>
                <span>{formatCurrency(invoice.sgst)}</span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>IGST</span>
              <span>{formatCurrency(invoice.igst)}</span>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.75rem 0',
            fontSize: '1.125rem',
            fontWeight: 700,
            borderTop: '2px solid var(--text-primary)',
            marginTop: '0.25rem',
          }}>
            <span>Grand Total</span>
            <span>{formatCurrency(invoice.grand_total)}</span>
          </div>
        </div>

        {/* Amount in Words */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem' }}>
          <p><strong>Total GST (in words):</strong> {invoice.gst_in_words}</p>
          <p style={{ marginTop: '0.25rem' }}><strong>Bill Amount (in words):</strong> {invoice.amount_in_words}</p>
        </div>

        {/* Terms & Conditions */}
        {terms.length > 0 && (
          <div style={{ marginBottom: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Terms & Conditions:</p>
            {terms.map((term, i) => (
              <p key={term.id}>{i + 1}. {term.term_text}</p>
            ))}
          </div>
        )}

        {/* Signature */}
        <div style={{ textAlign: 'right', marginTop: '2rem' }}>
          <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
            For, {invoice.company_name_snapshot || settings?.company_name || 'Authorised Signatory'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0.35rem 0' }}>
            <img
              src={settings?.signature_url || '/signature.png'}
              alt="Authorised Signatory"
              style={{ maxHeight: '55px', objectFit: 'contain' }}
            />
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>(Authorised Signatory)</p>
        </div>
      </div>
    </div>
  );
}
