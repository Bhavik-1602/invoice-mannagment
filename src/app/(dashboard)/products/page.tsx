'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/app/(dashboard)/layout';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { DataStore } from '@/lib/data-store';
import { IconEdit, IconProducts, IconTrash } from '@/components/Icons';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'set'>('add');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formHsn, setFormHsn] = useState('');
  const [formStock, setFormStock] = useState('0');
  const [formUnit, setFormUnit] = useState('Pcs');
  const [formRate, setFormRate] = useState('');
  const [formGst, setFormGst] = useState('18');

  const { showToast } = useToast();

  const fetchProducts = async () => {
    try {
      const data = await DataStore.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormHsn('');
    setFormStock('0');
    setFormUnit('Pcs');
    setFormRate('');
    setFormGst('18');
  };

  const openAdd = () => {
    resetForm();
    setEditProduct(null);
    setShowAdd(true);
  };

  const openEdit = (product: Product) => {
    setFormName(product.product_name);
    setFormDesc(product.description || '');
    setFormHsn(product.hsn_sac || '');
    setFormStock((product.stock_quantity ?? 0).toString());
    setFormUnit(product.unit || 'Pcs');
    setFormRate(product.default_rate.toString());
    setFormGst(product.gst_percentage.toString());
    setEditProduct(product);
    setShowAdd(true);
  };

  const openAdjust = (product: Product) => {
    setAdjustProduct(product);
    setAdjustAmount('');
    setAdjustType('add');
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      showToast('Product name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      await DataStore.saveProduct({
        id: editProduct?.id,
        product_name: formName.trim(),
        description: formDesc.trim() || null,
        hsn_sac: formHsn.trim() || null,
        stock_quantity: parseFloat(formStock) || 0,
        unit: formUnit.trim() || 'Pcs',
        default_rate: parseFloat(formRate) || 0,
        gst_percentage: parseFloat(formGst) || 0,
      });

      showToast(editProduct ? 'Product updated successfully' : 'Product added successfully', 'success');
      setShowAdd(false);
      resetForm();
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast(err instanceof Error ? err.message : 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustProduct) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount)) {
      showToast('Please enter a valid quantity', 'error');
      return;
    }

    setSaving(true);
    try {
      const currentStock = adjustProduct.stock_quantity ?? 0;
      const newStock = adjustType === 'add' ? currentStock + amount : amount;

      if (newStock < 0) {
        showToast('Stock quantity cannot be negative', 'error');
        setSaving(false);
        return;
      }

      await DataStore.saveProduct({
        ...adjustProduct,
        stock_quantity: newStock,
      });

      showToast(`Stock updated to ${newStock} ${adjustProduct.unit || 'Pcs'}`, 'success');
      setAdjustProduct(null);
      setAdjustAmount('');
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast('Failed to update stock', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await DataStore.deleteProduct(deleteId);
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      showToast('Product deleted', 'success');
    } catch {
      showToast('Failed to delete product', 'error');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Calculations for summary cards
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (Number(p.stock_quantity) || 0), 0);
  const lowStockCount = products.filter((p) => (Number(p.stock_quantity) || 0) > 0 && (Number(p.stock_quantity) || 0) <= 10).length;
  const outOfStockCount = products.filter((p) => (Number(p.stock_quantity) || 0) <= 0).length;

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.hsn_sac && p.hsn_sac.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    const stock = Number(p.stock_quantity) || 0;
    let matchesStock = true;
    if (stockFilter === 'in_stock') matchesStock = stock > 10;
    else if (stockFilter === 'low_stock') matchesStock = stock > 0 && stock <= 10;
    else if (stockFilter === 'out_of_stock') matchesStock = stock <= 0;

    return matchesSearch && matchesStock;
  });

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h2>Products & stock</h2>
          <p>Manage items, rates, and available inventory.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          Add Product
        </button>
      </div>

      {/* Stock Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">Total Products</div>
          <div className="stat-card-value" style={{ color: 'var(--primary)' }}>{totalProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Units in Stock</div>
          <div className="stat-card-value">{totalStockUnits.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Low Stock</div>
          <div className="stat-card-value" style={{ color: 'var(--warning)' }}>{lowStockCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Out of Stock</div>
          <div className="stat-card-value" style={{ color: 'var(--error)' }}>{outOfStockCount}</div>
        </div>
      </div>

      {/* Search & Stock Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1', minWidth: '240px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by product name, HSN code, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Stock Filter:</span>
            <button
              className={`btn btn-sm ${stockFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStockFilter('all')}
            >
              All ({products.length})
            </button>
            <button
              className={`btn btn-sm ${stockFilter === 'in_stock' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStockFilter('in_stock')}
            >
              In Stock
            </button>
            <button
              className={`btn btn-sm ${stockFilter === 'low_stock' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStockFilter('low_stock')}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              className={`btn btn-sm ${stockFilter === 'out_of_stock' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStockFilter('out_of_stock')}
            >
              Out of Stock ({outOfStockCount})
            </button>
          </div>
        </div>
      </div>

      {/* Products & Stock Table */}
      {products.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconProducts size={22} /></div>
            <div className="empty-state-title">No products yet</div>
            <div className="empty-state-text">Add your products with current stock quantity to track inventory and use them in invoices.</div>
            <button className="btn btn-primary" onClick={openAdd}>Add Product</button>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No products match your search or filter.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>HSN/SAC</th>
                  <th style={{ textAlign: 'center' }}>Current Stock Qty</th>
                  <th style={{ textAlign: 'right' }}>Default Rate</th>
                  <th style={{ textAlign: 'center' }}>GST %</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const stock = Number(p.stock_quantity) || 0;
                  const unit = p.unit || 'Pcs';

                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.product_name}</div>
                        {p.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', marginTop: '0.125rem' }}>
                            {p.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{p.hsn_sac || '-'}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          {stock > 10 ? (
                            <span className="badge badge-success" style={{ fontWeight: 600 }}>
                              {stock} {unit}
                            </span>
                          ) : stock > 0 ? (
                            <span className="badge badge-warning" style={{ fontWeight: 600 }}>
                              {stock} {unit} (Low)
                            </span>
                          ) : (
                            <span className="badge badge-danger" style={{ fontWeight: 600 }}>
                              0 {unit} (Out of Stock)
                            </span>
                          )}
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.15rem 0.45rem', fontSize: '0.75rem' }}
                            onClick={() => openAdjust(p)}
                            title="Quick Adjust Stock"
                          >
                            Adjust
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(p.default_rate)}</td>
                      <td style={{ textAlign: 'center' }}>{p.gst_percentage}%</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                          <button className="icon-btn" onClick={() => openEdit(p)} title="Edit Product" aria-label="Edit Product"><IconEdit size={16} /></button>
                          <button
                            className="icon-btn icon-btn-danger"
                            onClick={() => setDeleteId(p.id)}
                            title="Delete Product"
                            aria-label="Delete Product"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => !saving && setShowAdd(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <h3 className="modal-title">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '1rem' }}>
              Fill in product details and initial stock quantity
            </p>

            <div>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Plywood 18mm Commercial"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-input form-textarea"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                  placeholder="Size, grade, specs or additional info"
                />
              </div>

              {/* Stock Quantity & Unit Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Available Stock Qty *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    min="0"
                    step="any"
                    placeholder="e.g. 50"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kitna stock available hai</span>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Unit</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="Pcs, Nos, Box..."
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>e.g. Pcs, Box</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">HSN/SAC</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formHsn}
                    onChange={(e) => setFormHsn(e.target.value)}
                    placeholder="e.g. 4407"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Default Rate (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formRate}
                    onChange={(e) => setFormRate(e.target.value)}
                    min="0"
                    step="any"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GST %</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formGst}
                    onChange={(e) => setFormGst(e.target.value)}
                    min="0"
                    max="100"
                    step="any"
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stock Adjustment Modal */}
      {adjustProduct && (
        <div className="modal-overlay" onClick={() => !saving && setAdjustProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <h3 className="modal-title">Adjust stock</h3>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {adjustProduct.product_name}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Current Stock: <strong>{adjustProduct.stock_quantity ?? 0} {adjustProduct.unit || 'Pcs'}</strong>
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${adjustType === 'add' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setAdjustType('add')}
              >
                + Add / Receive Stock
              </button>
              <button
                type="button"
                className={`btn btn-sm ${adjustType === 'set' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setAdjustType('set')}
              >
                Set Exact Stock
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">
                {adjustType === 'add' ? 'Quantity to Add (+)' : 'New Total Stock Count'}
              </label>
              <input
                type="number"
                className="form-input"
                placeholder={adjustType === 'add' ? 'e.g. 20' : 'e.g. 50'}
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                min="0"
                step="any"
                autoFocus
              />
              {adjustType === 'add' && adjustAmount && !isNaN(parseFloat(adjustAmount)) && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--success)', marginTop: '0.25rem' }}>
                  New Stock will be: {(adjustProduct.stock_quantity ?? 0) + parseFloat(adjustAmount)} {adjustProduct.unit || 'Pcs'}
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setAdjustProduct(null)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdjustStock} disabled={saving}>
                {saving ? 'Updating...' : 'Update Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete Product</h3>
            <p className="modal-text">
              Are you sure you want to delete this product? Existing saved invoices will remain safe.
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
