import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const TeamContext = createContext({
  teams: [],
  addTeam: (name) => {},
  deleteTeam: (id) => {},
  renameTeam: (id, name) => {},
  addMember: (teamId, userId) => {},
  removeMember: (teamId, userId) => {},
});

const TEAMS_KEY = 'teams';

export const TeamProvider = ({ children }) => {
  const [teams, setTeams] = useState(() => {
    try {
      const raw = localStorage.getItem(TEAMS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
    } catch {}
  }, [teams]);

  const addTeam = (name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return null;
    // Prevent duplicate names (case-insensitive)
    const existing = teams.find(t => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;
    const newTeam = { id: Date.now(), name: trimmed, memberIds: [] };
    setTeams(prev => [...prev, newTeam]);
    return newTeam;
  };

  const deleteTeam = (id) => {
    setTeams(prev => prev.filter(t => t.id !== id));
  };

  const renameTeam = (id, name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    setTeams(prev => prev.map(t => (t.id === id ? { ...t, name: trimmed } : t)));
  };

  const addMember = (teamId, userId) => {
    setTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t;
      if (t.memberIds.includes(userId)) return t;
      return { ...t, memberIds: [...t.memberIds, userId] };
    }));
  };

  const removeMember = (teamId, userId) => {
    setTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t;
      return { ...t, memberIds: t.memberIds.filter(id => id !== userId) };
    }));
  };

  const value = useMemo(() => ({ teams, addTeam, deleteTeam, renameTeam, addMember, removeMember }), [teams]);

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => useContext(TeamContext);