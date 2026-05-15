import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await apiLogin(username, password);
    const { key } = res.data;
    const userData = res.data.user || { username };
    localStorage.setItem('auth_token', key);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  const register = async (username, email, password1, password2) => {
    const res = await apiRegister(username, email, password1, password2);
    const { key } = res.data;
    const userData = res.data.user || { username };
    localStorage.setItem('auth_token', key);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // proceed even if server logout fails
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
