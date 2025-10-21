import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5174/api' : '/api');
const TOKEN_KEY = 'auth_token';
const REMEMBER_KEY = 'remember_login';

const AuthContext = createContext({
  currentUser: null,
  token: null,
  remember: true,
  setRemember: () => {},
  register: async ({ name, email, password }) => {},
  login: async (email, password) => {},
  logout: () => {},
  authFetch: async (path, options) => {},
  inviteUser: async ({ name, email }) => {},
  getInvite: async (token) => {},
  acceptInvite: async ({ token, name, password }) => {},
});

export const AuthProvider = ({ children }) => {
  const [remember, setRemember] = useState(() => {
    try { return localStorage.getItem(REMEMBER_KEY) === 'true'; } catch { return true; }
  });
  const [token, setToken] = useState(() => {
    try {
      const rem = localStorage.getItem(REMEMBER_KEY);
      const useLocal = rem === null ? true : rem === 'true';
      if (useLocal) return localStorage.getItem(TOKEN_KEY) || null;
      return sessionStorage.getItem(TOKEN_KEY) || null;
    } catch { return null; }
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false');
      if (token) {
        if (remember) {
          localStorage.setItem(TOKEN_KEY, token);
          sessionStorage.removeItem(TOKEN_KEY);
        } else {
          sessionStorage.setItem(TOKEN_KEY, token);
          localStorage.removeItem(TOKEN_KEY);
        }
      } else {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
      }
    } catch {}
  }, [token, remember]);

  const authFetch = async (path, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (res.status === 401) {
      setToken(null);
      setCurrentUser(null);
    }
    return res;
  };

  const refreshMe = async () => {
    if (!token) { setCurrentUser(null); return null; }
    try {
      const res = await authFetch('/auth/me', { method: 'GET' });
      if (!res.ok) throw new Error('me failed');
      const { user } = await res.json();
      setCurrentUser(user);
      return user;
    } catch {
      setCurrentUser(null);
      return null;
    }
  };

  useEffect(() => { refreshMe(); }, [token]);

  const fetchCloudConfigAndCache = async (tkn = token, usr = currentUser) => {
    if (!tkn) return;
    try {
      const res = await fetch(`${API_BASE}/config/cloud`, { method: 'GET', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tkn}` } });
      if (!res.ok) return;
      const cfg = await res.json();
      const ownerId = usr?.id || null;
      try { localStorage.setItem('cloud_auto_sync_config', JSON.stringify({ ...cfg, ownerUserId: ownerId })); } catch {}
    } catch {}
  };

  const register = async ({ name, email, password }) => {
    setLoadingAuth(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registrierung fehlgeschlagen');
      // Return dev verification link; do not log in
      const verifyLink = data.verifyLink || `${window.location.origin}/verify-email/${data?.token || ''}`;
      return { ok: true, verifyLink, user: data.user };
    } catch (e) {
      setError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setLoadingAuth(false);
    }
  };

  const resendVerification = async (email) => {
    setLoadingAuth(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erneutes Senden fehlgeschlagen');
      return { ok: true, verifyLink: data.verifyLink };
    } catch (e) {
      setError(e.message);
      return { ok: false, error: e.message };
    } finally {
      setLoadingAuth(false);
    }
  };

  const login = async (email, password, name) => {
    const body = { email, password };
    if (typeof name === 'string' && name.trim()) body.name = name.trim();
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Login fehlgeschlagen');
    setToken(data.token);
    setCurrentUser(data.user);
    await fetchCloudConfigAndCache(data.token, data.user);
    return data.user;
  };

  const verifyEmail = async (tokenParam) => {
    const res = await fetch(`${API_BASE}/auth/verify/${tokenParam}`, { headers: { 'Content-Type': 'application/json' } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Verifizierung fehlgeschlagen');
    setToken(data.token);
    setCurrentUser(data.user);
    await fetchCloudConfigAndCache(data.token, data.user);
    return data.user;
  };

  const getInvite = async (tokenParam) => {
    const res = await fetch(`${API_BASE}/auth/invite/${tokenParam}`, { headers: { 'Content-Type': 'application/json' } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Invite nicht gefunden');
    return data; // { email, name, accepted }
  };
  
  const inviteUser = async ({ name, email }) => {
    const res = await authFetch('/auth/invite', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Einladung fehlgeschlagen');
    return data; // { invite, link }
  };

  const acceptInvite = async ({ token: invToken, name, password }) => {
    const res = await fetch(`${API_BASE}/auth/accept-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: invToken, name, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Invite konnte nicht akzeptiert werden');
    setToken(data.token);
    setCurrentUser(data.user);
    await fetchCloudConfigAndCache(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    try {
      localStorage.removeItem('cloud_auto_sync_config');
      localStorage.removeItem('cloud_auto_sync_last_at');
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {}
  };

  const value = useMemo(() => ({
    currentUser,
    token,
    remember,
    setRemember,
    loadingAuth,
    error,
    authFetch,
    refreshMe,
    register,
    login,
    verifyEmail,
    resendVerification,
    inviteUser,
    getInvite,
    acceptInvite,
    logout,
  }), [currentUser, token, remember, loadingAuth, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);