import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext({
  users: [],
  currentUser: null,
  login: (name) => {},
  logout: () => {},
  addUser: (name) => {},
  deleteUser: (id) => {},
});

const USERS_KEY = 'users';
const CURRENT_USER_ID_KEY = 'currentUserId';

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      const loaded = raw ? JSON.parse(raw) : [];
      // Upgrade: ensure 'Martin' is marked as admin if present
      const upgraded = Array.isArray(loaded) ? loaded.map(u => {
        if (typeof u.name === 'string' && u.name.toLowerCase() === 'martin') {
          return { ...u, isAdmin: true };
        }
        return u;
      }) : [];
      return upgraded;
    } catch {
      return [];
    }
  });
  const [currentUserId, setCurrentUserId] = useState(() => {
    const raw = localStorage.getItem(CURRENT_USER_ID_KEY);
    return raw ? parseInt(raw) : null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      if (currentUserId === null || currentUserId === undefined) {
        localStorage.removeItem(CURRENT_USER_ID_KEY);
      } else {
        localStorage.setItem(CURRENT_USER_ID_KEY, String(currentUserId));
      }
    } catch {}
  }, [currentUserId]);

  const currentUser = useMemo(() => users.find(u => u.id === currentUserId) || null, [users, currentUserId]);

  const addUser = (name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return null;
    // Check if user exists (case-insensitive)
    const existing = users.find(u => u.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    const newUser = { id: Date.now(), name: trimmed, isAdmin: trimmed.toLowerCase() === 'martin' };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const login = (name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return null;
    // Find existing user or create new
    const existing = users.find(u => u.name.toLowerCase() === trimmed.toLowerCase());
    const user = existing || addUser(trimmed);
    // Ensure admin flag for Martin
    if (user && user.name && user.name.toLowerCase() === 'martin' && !user.isAdmin) {
      setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, isAdmin: true } : u)));
    }
    setCurrentUserId(user.id);
    return user;
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    if (id === currentUserId) {
      setCurrentUserId(null);
    }
  };

  const value = { users, currentUser, login, logout, addUser, deleteUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);