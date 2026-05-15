import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object' && data !== null) {
        setError(Object.values(data).flat().join('; '));
      } else {
        setError('Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>CloudAI</h1>
        <p className="subtitle">Intelligent Email Organization</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}
          <label htmlFor="username">Username</label>
          <input id="username" type="text" value={username}
            onChange={(e) => setUsername(e.target.value)} required autoFocus
            placeholder="your-username" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} required
            placeholder="••••••••" />
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="auth-link">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
        <p className="auth-note">
          CloudAI has read-only access to your emails and never sends mail
          without your consent.
        </p>
      </div>
    </div>
  );
}
