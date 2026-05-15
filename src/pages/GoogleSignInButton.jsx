import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { googleLogin } from '../api/client';

/**
 * Google Sign-In button using Google Identity Services.
 *
 * Loads the GIS library, renders a One Tap prompt on mount,
 * and provides a fallback button for manual sign-in.
 */
export default function GoogleSignInButton() {
  const btnRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google Identity Services library
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      /* global google */
      if (window.google?.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          cancel_on_tap_outside: false,
        });

        // Render the button
        if (btnRef.current) {
          window.google.accounts.id.renderButton(btnRef.current, {
            type: 'standard',
            shape: 'pill',
            theme: 'outline',
            text: 'signin_with',
            size: 'large',
            width: 320,
            logo_alignment: 'left',
          });
        }
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    if (!response?.credential) {
      setError('Google sign-in failed: no credential received.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await googleLogin(response.credential);
      const { key } = res.data;
      const userData = res.data.user || {};

      localStorage.setItem('auth_token', key);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      // Update the auth context state
      // We use the context's internal setter by simulating login
      // Actually, AuthContext doesn't expose a setUser directly.
      // Let's set localStorage and reload to trigger context re-read.
      window.location.href = '/dashboard';
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object' && data !== null) {
        setError(Object.values(data).flat().join('; '));
      } else {
        setError('Google sign-in failed. Check your Google Client ID in .env');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
      {error && <div className="error-banner">{error}</div>}
      <div ref={btnRef} style={{ minHeight: '44px' }} />
      {loading && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Signing in with Google…</p>}
    </div>
  );
}
