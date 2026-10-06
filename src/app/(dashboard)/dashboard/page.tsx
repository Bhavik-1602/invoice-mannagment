'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Invoice } from '@/types';
import { DataStore } from '@/lib/data-store';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    monthInvoices: 0,
    monthAmount: 0,
    totalStockUnits: 0,
    lowStockCount: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const allInvoices = await DataStore.getInvoices();
      const prods = await DataStore.getProducts();

      // Calculate stats
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

      const totalAmount = allInvoices.reduce((sum: number, inv: Invoice) => sum + Number(inv.grand_total), 0);
      const monthInvoices = allInvoices.filter((inv: Invoice) => inv.invoice_date >= monthStart);
      const monthAmount = monthInvoices.reduce((sum: number, inv: Invoice) => sum + Number(inv.grand_total), 0);

      const totalStockUnits = prods.reduce((acc: number, p) => acc + (Number(p.stock_quantity) || 0), 0);
      const lowStockCount = prods.filter((p) => (Number(p.stock_quantity) || 0) <= 10).length;

      setStats({
        totalInvoices: allInvoices.length,
        totalAmount,
        monthInvoices: monthInvoices.length,
        monthAmount,
        totalStockUnits,
        lowStockCount,
      });

      setRecentInvoices(allInvoices.slice(0, 10));
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div className="stat-card">
          <div className="stat-card-label">Total Invoices</div>
          <div className="stat-card-value">{stats.totalInvoices}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total Invoice Amount</div>
          <div className="stat-card-value">{formatCurrency(stats.totalAmount)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">This Month Billing</div>
          <div className="stat-card-value">{formatCurrency(stats.monthAmount)}</div>
        </div>
        <Link href="/products" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}>
            <div className="stat-card-label">📦 Stock on Hand</div>
            <div className="stat-card-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span>{stats.totalStockUnits.toLocaleString()}</span>
              {stats.lowStockCount > 0 && (
                <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                  {stats.lowStockCount} Low
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Invoices</h3>
          <Link href="/invoices" className="btn btn-secondary btn-sm">
            View All
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-title">No invoices yet</div>
            <div className="empty-state-text">Create your first invoice to get started</div>
            <Link href="/invoices/new" className="btn btn-primary">
              + New Invoice
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Customer Name</th>
                  <th>Date</th>
                  <th>Grand Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 500 }}>{inv.invoice_no}</td>
                    <td>{inv.customer_name_snapshot}</td>
                    <td>{formatDate(inv.invoice_date)}</td>
                    <td style={{ fontWeight: 500 }}>{formatCurrency(inv.grand_total)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link href={`/invoices/${inv.id}`} className="btn btn-ghost btn-sm" title="View">
                          👁
                        </Link>
                        <Link href={`/invoices/${inv.id}/edit`} className="btn btn-ghost btn-sm" title="Edit">
                          ✏️
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
