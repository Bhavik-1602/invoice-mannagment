'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/app/(dashboard)/layout';
import { CompanySettings, TermCondition } from '@/types';
import { DataStore, isSupabaseConfigured } from '@/lib/data-store';
import { IconTrash } from '@/components/Icons';

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [terms, setTerms] = useState<TermCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [isCloud, setIsCloud] = useState(false);

  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyGstin, setCompanyGstin] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const { showToast } = useToast();

  const fetchData = async () => {
    try {
      setIsCloud(isSupabaseConfigured());
      const settingsData = await DataStore.getSettings();
      if (settingsData) {
        setSettings(settingsData);
        setCompanyName(settingsData.company_name || '');
        setCompanyAddress(settingsData.company_address || '');
        setCompanyGstin(settingsData.company_gstin || '');
        setBankName(settingsData.bank_name || '');
        setAccountNumber(settingsData.account_number || '');
        setIfscCode(settingsData.ifsc_code || '');
      }

      const termsData = await DataStore.getTerms();
      setTerms(termsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const updated = await DataStore.updateSettings({
        company_name: companyName.trim(),
        company_address: companyAddress.trim(),
        company_gstin: companyGstin.trim(),
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        ifsc_code: ifscCode.trim(),
      });
      setSettings(updated);
      showToast('Settings saved successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTerm = async () => {
    if (!newTerm.trim()) return;
    const maxOrder = terms.reduce((max, t) => Math.max(max, t.sort_order), 0);
    const newTermItem: TermCondition = {
      id: `term-${Date.now()}`,
      user_id: 'default-user',
      term_text: newTerm.trim(),
      sort_order: maxOrder + 1,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    const updated = [...terms, newTermItem];
    setTerms(updated);
    await DataStore.saveTerms(updated);
    setNewTerm('');
    showToast('Term added', 'success');
  };

  const handleUpdateTerm = async (id: string, text: string) => {
    const updated = terms.map((t) => (t.id === id ? { ...t, term_text: text.trim() } : t));
    setTerms(updated);
    await DataStore.saveTerms(updated);
  };

  const handleDeleteTerm = async (id: string) => {
    const updated = terms.filter((t) => t.id !== id);
    setTerms(updated);
    await DataStore.saveTerms(updated);
    showToast('Term removed', 'success');
  };

  const handleToggleTerm = async (id: string, isActive: boolean) => {
    const updated = terms.map((t) => (t.id === id ? { ...t, is_active: isActive } : t));
    setTerms(updated);
    await DataStore.saveTerms(updated);
  };

  const handleUploadSignature = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const updated = await DataStore.updateSettings({ signature_url: base64 });
      setSettings(updated);
      showToast('Signature updated successfully', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const updated = await DataStore.updateSettings({ logo_url: base64 });
      setSettings(updated);
      showToast('Logo updated successfully', 'success');
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Database Connection Status Banner */}
      <div className={`status-banner ${isCloud ? 'is-online' : 'is-local'}`}>
        <div className="status-title">{isCloud ? 'Cloud connected' : 'Local data'}</div>
        <p>
          {isCloud
            ? 'Invoices, customers, and products sync with your database.'
            : 'Sample invoice data is loaded on this device. You can create invoices and download PDFs.'}
        </p>
      </div>

      {/* Company Information */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>Company information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className="form-input"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Company GSTIN</label>
            <input
              type="text"
              className="form-input"
              value={companyGstin}
              onChange={(e) => setCompanyGstin(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Company Address</label>
            <textarea
              className="form-input form-textarea"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>Bank details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Bank Name</label>
            <input
              type="text"
              className="form-input"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Account Number</label>
            <input
              type="text"
              className="form-input"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">IFSC Code</label>
            <input
              type="text"
              className="form-input"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button
            className="btn btn-primary"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>Terms and conditions</h3>

        {terms.map((term, index) => (
          <div
            key={term.id}
            style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              padding: '0.625rem 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <input
              type="checkbox"
              checked={term.is_active}
              onChange={(e) => handleToggleTerm(term.id, e.target.checked)}
              style={{ marginTop: '0.375rem' }}
            />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', minWidth: '1.5rem' }}>
              {index + 1}.
            </span>
            <input
              type="text"
              className="form-input"
              value={term.term_text}
              onChange={(e) => {
                setTerms((prev) =>
                  prev.map((t) => (t.id === term.id ? { ...t, term_text: e.target.value } : t))
                );
              }}
              onBlur={(e) => handleUpdateTerm(term.id, e.target.value)}
              style={{ flex: 1, opacity: term.is_active ? 1 : 0.5 }}
            />
            <button
              className="icon-btn icon-btn-danger"
              onClick={() => handleDeleteTerm(term.id)}
              title="Remove term"
              aria-label="Remove term"
            >
              <IconTrash size={16} />
            </button>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <input
            type="text"
            className="form-input"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            placeholder="Add a new term..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddTerm()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-secondary btn-sm" onClick={handleAddTerm}>
            + Add
          </button>
        </div>
      </div>

      {/* Signature & Logo Upload */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>Signature and logo</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="form-label">Authorised Signatory</label>
            <div style={{ marginBottom: '0.5rem' }}>
              <img
                src={settings?.signature_url || '/signature.png'}
                alt="Signature"
                style={{ maxHeight: '60px', border: '1px solid var(--border)', borderRadius: '0.25rem', padding: '0.25rem', backgroundColor: 'white' }}
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadSignature}
              style={{ fontSize: '0.8125rem' }}
            />
          </div>
          <div>
            <label className="form-label">Company Logo (optional)</label>
            {settings?.logo_url && (
              <div style={{ marginBottom: '0.5rem' }}>
                <img
                  src={settings.logo_url}
                  alt="Logo"
                  style={{ maxHeight: '60px', border: '1px solid var(--border)', borderRadius: '0.25rem', padding: '0.25rem' }}
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadLogo}
              style={{ fontSize: '0.8125rem' }}
            />
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          The authorised signature above appears automatically on every invoice and in downloaded PDFs.
        </p>
      </div>
    </div>
  );
}
