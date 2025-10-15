// Versioning & Backup Manager
// - Erstellt Snapshots der lokalen Daten (Projekte, Shot-Dateien, Offline-Snapshot)
// - Hält eine Version-Historie in localStorage und ermöglicht Wiederherstellung/Löschen
// - Unterstützt manuelle Downloads und optional automatische Backups

import { buildSnapshot } from './cloudSyncManager';

const HISTORY_KEY = 'version_history';
const SNAPSHOT_PREFIX = 'version_snapshot_';
const AUTO_BACKUP_KEY = 'auto_backup_enabled';
const DAILY_BACKUP_KEY = 'daily_backup_enabled';
const LAST_DAILY_BACKUP_AT_KEY = 'last_daily_backup_at';
const VERSION_HISTORY_LIMIT = 20; // maximale Anzahl gespeicherter Versionen

const nowIso = () => new Date().toISOString();
const safeJsonParse = (text, fallback = null) => {
  try { return JSON.parse(text); } catch { return fallback; }
};

const readHistory = () => {
  const raw = localStorage.getItem(HISTORY_KEY);
  const arr = raw ? safeJsonParse(raw, []) : [];
  if (!Array.isArray(arr)) return [];
  return arr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const writeHistory = (history) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const getAutoBackupEnabled = () => {
  const raw = localStorage.getItem(AUTO_BACKUP_KEY);
  return raw ? raw === 'true' : true; // standardmäßig aktiviert
};

export const setAutoBackupEnabled = (enabled) => {
  localStorage.setItem(AUTO_BACKUP_KEY, enabled ? 'true' : 'false');
};

// Erzeuge eine neue Version und speichere Snapshot separat
export const createVersion = async ({ note = '', source = 'manual' } = {}) => {
  const blob = buildSnapshot();
  const jsonText = await blob.text();
  const snapshot = safeJsonParse(jsonText, {});

  const id = `${Date.now()}`; // einfache eindeutige ID
  const snapshotKey = `${SNAPSHOT_PREFIX}${id}`;
  localStorage.setItem(snapshotKey, jsonText);

  const projectsCount = Array.isArray(snapshot.projects) ? snapshot.projects.length : 0;
  const shotFilesCount = Array.isArray(snapshot.shotFiles) ? snapshot.shotFiles.length : 0;
  const shotsCount = (snapshot.projects || []).reduce((acc, p) => acc + ((p.shots || []).length), 0);

  const entry = {
    id,
    timestamp: nowIso(),
    note,
    source,
    size: jsonText.length,
    projectsCount,
    shotsCount,
    shotFilesCount,
  };

  const history = readHistory();
  const next = [entry, ...history];

  // Retention: lösche älteste über Limit
  if (next.length > VERSION_HISTORY_LIMIT) {
    const toDelete = next.slice(VERSION_HISTORY_LIMIT);
    for (const e of toDelete) {
      try { localStorage.removeItem(`${SNAPSHOT_PREFIX}${e.id}`); } catch {}
    }
  }

  writeHistory(next.slice(0, VERSION_HISTORY_LIMIT));
  return entry;
};

export const listVersions = () => readHistory();

export const deleteVersion = (id) => {
  const history = readHistory();
  const next = history.filter(e => e.id !== id);
  writeHistory(next);
  try { localStorage.removeItem(`${SNAPSHOT_PREFIX}${id}`); } catch {}
  return true;
};

// Snapshot anwenden: Projekte und Shot-Dateien ersetzen
export const restoreVersion = (id) => {
  const snapshotKey = `${SNAPSHOT_PREFIX}${id}`;
  const jsonText = localStorage.getItem(snapshotKey);
  if (!jsonText) throw new Error('Snapshot nicht gefunden');
  const snapshot = safeJsonParse(jsonText, null);
  if (!snapshot) throw new Error('Snapshot ungültig');

  // Projekte setzen
  localStorage.setItem('projects', JSON.stringify(snapshot.projects || []));
  // Offline Snapshot setzen (Meta)
  if (snapshot.offlineSnapshot) {
    localStorage.setItem('offline_snapshot', JSON.stringify(snapshot.offlineSnapshot));
  }

  // Shot-Dateien bereinigen und neu setzen
  const existingKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('shot-file-')) existingKeys.push(key);
  }
  const wantedKeys = new Set((snapshot.shotFiles || []).map(sf => sf.key));
  for (const k of existingKeys) {
    if (!wantedKeys.has(k)) {
      try { localStorage.removeItem(k); } catch {}
    }
  }
  for (const file of snapshot.shotFiles || []) {
    try {
      localStorage.setItem(file.key, JSON.stringify(file.value));
    } catch {}
  }

  // optional: ausgewähltes Projekt beibehalten, sonst auf erstes setzen
  const selectedProjectIdRaw = localStorage.getItem('selectedProjectId');
  if (!selectedProjectIdRaw) {
    const first = (snapshot.projects || [])[0];
    if (first && first.id) localStorage.setItem('selectedProjectId', `${first.id}`);
  }

  return {
    projectsCount: Array.isArray(snapshot.projects) ? snapshot.projects.length : 0,
    shotsCount: (snapshot.projects || []).reduce((acc, p) => acc + ((p.shots || []).length), 0),
    shotFilesCount: Array.isArray(snapshot.shotFiles) ? snapshot.shotFiles.length : 0,
    timestamp: nowIso(),
  };
};

// Direkt-Download eines aktuellen Snapshots als JSON-Datei
export const downloadCurrentSnapshot = async (nameBase = 'vfx-supervision-snapshot') => {
  const blob = buildSnapshot();
  const ts = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const filename = `${nameBase}-${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.json`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Import einer Snapshot-JSON (als Text) und optional als Version speichern
export const importSnapshotFromText = async (jsonText, { saveVersion = true, note = 'Import' } = {}) => {
  const snapshot = safeJsonParse(jsonText, null);
  if (!snapshot) throw new Error('Ungültige Snapshot-Datei');

  // Anwenden
  localStorage.setItem('projects', JSON.stringify(snapshot.projects || []));
  if (snapshot.offlineSnapshot) {
    localStorage.setItem('offline_snapshot', JSON.stringify(snapshot.offlineSnapshot));
  }
  for (const file of snapshot.shotFiles || []) {
    try { localStorage.setItem(file.key, JSON.stringify(file.value)); } catch {}
  }

  // Version optional speichern
  if (saveVersion) {
    const id = `${Date.now()}`;
    localStorage.setItem(`${SNAPSHOT_PREFIX}${id}`, jsonText);
    const entry = {
      id,
      timestamp: nowIso(),
      note,
      source: 'import',
      size: jsonText.length,
      projectsCount: Array.isArray(snapshot.projects) ? snapshot.projects.length : 0,
      shotsCount: (snapshot.projects || []).reduce((acc, p) => acc + ((p.shots || []).length), 0),
      shotFilesCount: Array.isArray(snapshot.shotFiles) ? snapshot.shotFiles.length : 0,
    };
    const next = [entry, ...readHistory()].slice(0, VERSION_HISTORY_LIMIT);
    writeHistory(next);
  }

  return true;
};

// Hilfsfunktion: automatisch sichern, falls aktiviert
export const maybeAutoBackup = async ({ note = '', source = '' } = {}) => {
  if (!getAutoBackupEnabled()) return null;
  return await createVersion({ note, source });
};

// ——— Tägliches Backup ———
export const getDailyBackupEnabled = () => {
  const raw = localStorage.getItem(DAILY_BACKUP_KEY);
  return raw ? raw === 'true' : false; // standardmäßig aus
};

export const setDailyBackupEnabled = (enabled) => {
  localStorage.setItem(DAILY_BACKUP_KEY, enabled ? 'true' : 'false');
};

export const getLastDailyBackupAt = () => {
  const raw = localStorage.getItem(LAST_DAILY_BACKUP_AT_KEY);
  return raw || null;
};

const isDifferentCalendarDay = (isoA, isoB) => {
  try {
    const a = new Date(isoA);
    const b = new Date(isoB);
    return a.getFullYear() !== b.getFullYear() || a.getMonth() !== b.getMonth() || a.getDate() !== b.getDate();
  } catch {
    return true;
  }
};

export const runDailySnapshotIfDue = async () => {
  try {
    if (!getDailyBackupEnabled()) return null;
    const last = getLastDailyBackupAt();
    const now = nowIso();
    if (!last || isDifferentCalendarDay(last, now)) {
      const entry = await createVersion({ note: 'Tägliches Backup', source: 'daily' });
      localStorage.setItem(LAST_DAILY_BACKUP_AT_KEY, now);
      return entry;
    }
    return null;
  } catch {
    return null;
  }
};