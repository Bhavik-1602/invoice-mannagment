'use client';

import { useState, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  IconCustomers,
  IconDashboard,
  IconInvoices,
  IconMenu,
  IconPlus,
  IconProducts,
  IconSettings,
} from '@/components/Icons';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });
export const useToast = () => useContext(ToastContext);

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { href: '/invoices', label: 'Invoices', icon: IconInvoices },
  { href: '/customers', label: 'Customers', icon: IconCustomers },
  { href: '/products', label: 'Products', icon: IconProducts },
  { href: '/settings', label: 'Settings', icon: IconSettings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pathname = usePathname();

  let toastIdCounter = 0;

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now() + (toastIdCounter++);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const current = navLinks.find((link) => isActive(link.href));

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div>
        <div
          className={`mobile-overlay ${sidebarOpen ? 'show' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">
            <div className="brand-mark">TI</div>
            <div>
              <h1>Tax Invoice</h1>
              <p>Billing workspace</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sidebar-link ${isActive(link.href) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">GST billing</div>
        </aside>

        <main className="main-content">
          <div className="top-bar">
            <div className="top-bar-start">
              <button
                className="btn btn-ghost menu-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Open menu"
              >
                <IconMenu />
              </button>
              <h2 className="top-bar-title">{current?.label || 'Invoice Management'}</h2>
            </div>
            <Link href="/invoices/new" className="btn btn-primary btn-sm">
              <IconPlus size={16} />
              New Invoice
            </Link>
          </div>

          <div className="page-content">
            {children}
          </div>
        </main>

        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}
            >
              <span>{toast.type === 'success' ? '✓' : '✕'}</span>
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
