'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// Toast context
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  let toastIdCounter = 0;

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now() + (toastIdCounter++);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/invoices', label: 'Invoices', icon: '📄' },
    { href: '/customers', label: 'Customers', icon: '👥' },
    { href: '/products', label: 'Products', icon: '📦' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div>
        {/* Mobile overlay */}
        <div
          className={`mobile-overlay ${sidebarOpen ? 'show' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">
            <h1>Tax Invoice</h1>
            <p>Billing & Invoicing</p>
          </div>

          <nav className="sidebar-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${isActive(link.href) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userEmail}
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
            >
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="main-content">
          <div className="top-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ display: 'none' }}
                id="menu-toggle"
              >
                ☰
              </button>
              <style>{`
                @media (max-width: 1024px) {
                  #menu-toggle { display: flex !important; }
                }
              `}</style>
              <h2 className="top-bar-title">
                {navLinks.find((l) => isActive(l.href))?.label || 'Invoice Management'}
              </h2>
            </div>
            <Link href="/invoices/new" className="btn btn-primary btn-sm">
              + New Invoice
            </Link>
          </div>

          <div className="page-content">
            {children}
          </div>
        </main>

        {/* Toasts */}
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
