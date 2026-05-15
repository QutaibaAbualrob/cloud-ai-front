import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from './GoogleSignInButton';
import './LoginPage.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password1: '', password2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password1 !== form.password2) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password1, form.password2);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object' && data !== null) {
        setError(Object.values(data).flat().join('; '));
      } else {
        setError('Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="subtitle">Start organizing your inbox with AI</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}
          <label htmlFor="username">Username</label>
          <input id="username" type="text" value={form.username}
            onChange={update('username')} required placeholder="your-username" />
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email}
            onChange={update('email')} required placeholder="you@example.com" />
          <label htmlFor="password1">Password</label>
          <input id="password1" type="password" value={form.password1}
            onChange={update('password1')} required placeholder="••••••••" />
          <label htmlFor="password2">Confirm Password</label>
          <input id="password2" type="password" value={form.password2}
            onChange={update('password2')} required placeholder="••••••••" />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          margin: '16px 0', color: 'var(--text-dim)', fontSize: '12px',
        }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-input)' }} />
          <span>or sign up with</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-input)' }} />
        </div>

        <GoogleSignInButton mode="signup" />

        <p className="auth-link" style={{ marginTop: '16px' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
