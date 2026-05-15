import { useState, useEffect } from 'react';
import {
  fetchAccounts, connectAccount, deleteAccount, syncAccount,
} from '../api/client';
import './AccountsPage.css';

const PROVIDER_ICONS = { gmail: '📧', outlook: '📨', imap: '📫' };
const PROVIDER_CLASSES = { gmail: 'provider-gmail', outlook: 'provider-outlook', imap: 'provider-imap' };

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    provider: 'gmail',
    email_address: '',
    label: '',
    imap_host: '',
    imap_port: '993',
    imap_username: '',
    imap_password: '',
    imap_use_ssl: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(null);

  useEffect(() => { loadAccounts(); }, []);

  const loadAccounts = async () => {
    try {
      const res = await fetchAccounts();
      setAccounts(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to load accounts', err);
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = {
        provider: form.provider,
        email_address: form.email_address,
        label: form.label || undefined,
      };
      if (form.provider === 'imap') {
        data.imap_host = form.imap_host;
        data.imap_port = parseInt(form.imap_port, 10);
        data.imap_username = form.imap_username;
        data.imap_password = form.imap_password;
        data.imap_use_ssl = form.imap_use_ssl;
      }
      await connectAccount(data);
      setShowForm(false);
      setForm({
        provider: 'gmail', email_address: '', label: '',
        imap_host: '', imap_port: '993', imap_username: '',
        imap_password: '', imap_use_ssl: true,
      });
      loadAccounts();
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'object' ? Object.values(d).flat().join('; ') : 'Failed to connect account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSync = async (id) => {
    setSyncing(id);
    try {
      await syncAccount(id);
    } catch (err) {
      console.error('Sync failed', err);
    } finally {
      setSyncing(null);
      loadAccounts();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this account?')) return;
    try {
      await deleteAccount(id);
      loadAccounts();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const formatDate = (d) => {
    if (!d) return 'Never';
    return new Date(d).toLocaleString();
  };

  if (loading) return <p className="loading-text">Loading accounts…</p>;

  return (
    <div className="accounts-page">
      <div className="page-header">
        <div className="page-header-title">
          <h1>Email Accounts</h1>
          <p>Connect and manage your email inboxes</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Connect Account'}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="connect-form card" onSubmit={handleConnect}>
          <h2>Connect a New Account</h2>
          {error && <div className="error-banner">{error}</div>}

          <div className="form-row">
            <div>
              <label className="form-label">Provider</label>
              <select className="form-select" value={form.provider} onChange={update('provider')}
                style={{ width: '100%' }}>
                <option value="gmail">Gmail (OAuth)</option>
                <option value="outlook">Outlook / Office 365</option>
                <option value="imap">Generic IMAP</option>
              </select>
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={form.email_address}
                onChange={update('email_address')} required placeholder="you@example.com" />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label className="form-label">Label (optional)</label>
              <input className="form-input" type="text" value={form.label}
                onChange={update('label')} placeholder="Work Gmail" />
            </div>
          </div>

          {form.provider === 'imap' && (
            <>
              <div className="form-row">
                <div>
                  <label className="form-label">IMAP Host</label>
                  <input className="form-input" type="text" value={form.imap_host}
                    onChange={update('imap_host')} placeholder="imap.gmail.com" />
                </div>
                <div>
                  <label className="form-label">Port</label>
                  <input className="form-input" type="number" value={form.imap_port}
                    onChange={update('imap_port')} />
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label className="form-label">Username</label>
                  <input className="form-input" type="text" value={form.imap_username}
                    onChange={update('imap_username')} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" value={form.imap_password}
                    onChange={update('imap_password')} placeholder="••••••••" />
                </div>
              </div>
              <div className="form-row">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#cbd5f5' }}>
                  <input type="checkbox" checked={form.imap_use_ssl} onChange={update('imap_use_ssl')} />
                  Use SSL
                </label>
              </div>
            </>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Connecting…' : 'Connect'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>

          {form.provider === 'imap' && (
            <p className="form-hint">
              ⚠️ IMAP credentials are stored in plaintext for development.
              In production they will be encrypted at rest.
            </p>
          )}
        </form>
      )}

      {accounts.length === 0 ? (
        <p className="empty-text">No accounts connected yet. Connect one to start syncing emails.</p>
      ) : (
        <div className="accounts-list">
          {accounts.map((acc) => (
            <div key={acc.id} className="account-card">
              <div className="account-info">
                <div className={`account-provider-icon ${PROVIDER_CLASSES[acc.provider] || ''}`}>
                  {PROVIDER_ICONS[acc.provider] || '📧'}
                </div>
                <div className="account-details">
                  <div className="account-email">{acc.email_address}</div>
                  {acc.label && <div className="account-label">{acc.label}</div>}
                  <div className="account-meta">
                    {acc.provider.toUpperCase()} · Last synced: {formatDate(acc.last_synced_at)}
                  </div>
                </div>
                <span className={`sync-status ${acc.is_active ? 'sync-status-active' : 'sync-status-inactive'}`}>
                  {acc.is_active ? '● Active' : '○ Inactive'}
                </span>
              </div>
              <div className="account-actions">
                <button className="btn-ghost" onClick={() => handleSync(acc.id)}
                  disabled={syncing === acc.id}>
                  {syncing === acc.id ? 'Syncing…' : 'Sync Now'}
                </button>
                <button className="btn-danger" onClick={() => handleDelete(acc.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
