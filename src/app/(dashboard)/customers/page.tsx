'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/app/(dashboard)/layout';
import { Customer, Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DataStore } from '@/lib/data-store';
import Link from 'next/link';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  // Add/Edit form
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPlace, setFormPlace] = useState('');
  const [formGstin, setFormGstin] = useState('');

  const { showToast } = useToast();

  const fetchCustomers = async () => {
    try {
      const data = await DataStore.getCustomers();
      const invoices = await DataStore.getInvoices();

      const countMap: Record<string, number> = {};
      (invoices || []).forEach((inv) => {
        if (inv.customer_id) {
          countMap[inv.customer_id] = (countMap[inv.customer_id] || 0) + 1;
        }
      });

      const customersWithCount = (data || []).map((c) => ({
        ...c,
        invoice_count: countMap[c.id] || 0,
      }));

      setCustomers(customersWithCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormAddress('');
    setFormPlace('');
    setFormGstin('');
  };

  const openAdd = () => {
    resetForm();
    setEditCustomer(null);
    setShowAdd(true);
  };

  const openEdit = (customer: Customer) => {
    setFormName(customer.customer_name);
    setFormAddress(customer.address);
    setFormPlace(customer.place_of_supply);
    setFormGstin(customer.gstin || '');
    setEditCustomer(customer);
    setShowAdd(true);
  };

  const openView = async (customer: Customer) => {
    setViewCustomer(customer);
    const invoices = await DataStore.getInvoices();
    const customerInvs = (invoices || []).filter((inv) => inv.customer_id === customer.id);
    setCustomerInvoices(customerInvs);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formAddress.trim() || !formPlace.trim()) {
      showToast('Please fill required fields', 'error');
      return;
    }

    setSaving(true);
    try {
      await DataStore.saveCustomer({
        id: editCustomer?.id,
        customer_name: formName.trim(),
        address: formAddress.trim(),
        place_of_supply: formPlace.trim(),
        gstin: formGstin.trim() || null,
      });

      showToast(editCustomer ? 'Customer updated' : 'Customer added', 'success');
      setShowAdd(false);
      resetForm();
      setEditCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      showToast('Failed to save customer', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await DataStore.deleteCustomer(deleteId);
      setCustomers((prev) => prev.filter((c) => c.id !== deleteId));
      showToast('Customer deleted', 'success');
    } catch {
      showToast('Failed to delete customer', 'error');
    } finally {
      setDeleting(false);
      setDeleteId(null);
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Customer Master ({customers.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          + Add Customer
        </button>
      </div>

      {/* Customer list */}
      {customers.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No customers yet</div>
            <div className="empty-state-text">Customers are automatically saved when you create invoices, or add them here.</div>
            <button className="btn btn-primary" onClick={openAdd}>+ Add Customer</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>GSTIN</th>
                  <th>Place of Supply</th>
                  <th style={{ textAlign: 'center' }}>Invoices</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.customer_name}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{c.gstin || '-'}</td>
                    <td>{c.place_of_supply}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-success">{c.invoice_count || 0}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openView(c)} title="View">👁</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)} title="Edit">✏️</button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteId(c.id)}
                          title="Delete"
                          style={{ color: 'var(--error)' }}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => !saving && setShowAdd(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3 className="modal-title">{editCustomer ? 'Edit Customer' : 'Add Customer'}</h3>
            <div style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input type="text" className="form-input" value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <textarea className="form-input form-textarea" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} rows={2} />
              </div>
              <div className="form-group">
                <label className="form-label">Place of Supply *</label>
                <input type="text" className="form-input" value={formPlace} onChange={(e) => setFormPlace(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">GSTIN</label>
                <input type="text" className="form-input" value={formGstin} onChange={(e) => setFormGstin(e.target.value)} />
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editCustomer ? 'Update' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Customer Modal */}
      {viewCustomer && (
        <div className="modal-overlay" onClick={() => setViewCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3 className="modal-title">{viewCustomer.customer_name}</h3>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <p>{viewCustomer.address}</p>
              <p>Place of Supply: {viewCustomer.place_of_supply}</p>
              {viewCustomer.gstin && <p>GSTIN: {viewCustomer.gstin}</p>}
            </div>

            {customerInvoices.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Invoice History</h4>
                <div className="table-container" style={{ maxHeight: '300px', overflow: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Invoice No.</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerInvoices.map((inv) => (
                        <tr key={inv.id}>
                          <td>{inv.invoice_no}</td>
                          <td>{formatDate(inv.invoice_date)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(inv.grand_total)}</td>
                          <td>
                            <Link href={`/invoices/${inv.id}`} className="btn btn-ghost btn-sm" onClick={() => setViewCustomer(null)}>
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setViewCustomer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete Customer</h3>
            <p className="modal-text">
              Are you sure you want to delete this customer? Existing invoices will retain their data but the customer link will be removed.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
