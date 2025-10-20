// Cloud Sync Manager: erstellt einen JSON-Snapshot und lädt ihn zu verschiedenen Providern

// Snapshot aus localStorage zusammenbauen
export const buildSnapshot = () => {
  const projectsRaw = localStorage.getItem('projects');
  const projects = projectsRaw ? JSON.parse(projectsRaw) : [];
  const offlineSnapshotRaw = localStorage.getItem('offline_snapshot');
  const offlineSnapshot = offlineSnapshotRaw ? JSON.parse(offlineSnapshotRaw) : null;

  const shotFiles = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('shot-file-')) {
      try {
        const val = JSON.parse(localStorage.getItem(key) || 'null');
        shotFiles.push({ key, value: val });
      } catch {
        // ignorieren
      }
    }
  }

  const snapshot = {
    version: 1,
    generatedAt: new Date().toISOString(),
    projects,
    shotFiles,
    offlineSnapshot
  };
  const json = JSON.stringify(snapshot, null, 2);
  return new Blob([json], { type: 'application/json' });
};

// Dropbox Upload (erfordert User Access Token und Zielpfad)
export const syncToDropbox = async ({ accessToken, path = '/vfx-supervision/snapshot.json' }) => {
  if (!accessToken) throw new Error('Dropbox Access Token fehlt');
  const blob = buildSnapshot();
  const url = 'https://content.dropboxapi.com/2/files/upload';
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/octet-stream',
    'Dropbox-API-Arg': JSON.stringify({
      path,
      mode: 'overwrite',
      autorename: false,
      mute: false,
      strict_conflict: false
    })
  };
  const res = await fetch(url, { method: 'POST', headers, body: blob });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Dropbox Upload fehlgeschlagen: ${res.status} ${text}`);
  }
  return await res.json();
};

// AWS S3 via vorab signierter URL (Presigned URL vom Nutzer)
export const syncToS3Presigned = async ({ presignedUrl }) => {
  if (!presignedUrl) throw new Error('S3 Presigned URL fehlt');
  const blob = buildSnapshot();
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: blob
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`S3 Upload fehlgeschlagen: ${res.status} ${text}`);
  }
  return { ok: true };
};

// Google Cloud Storage via Signed URL (PUT)
export const syncToGCSignedUrl = async ({ signedUrl }) => {
  if (!signedUrl) throw new Error('GCS Signed URL fehlt');
  const blob = buildSnapshot();
  const res = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: blob
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GCS Upload fehlgeschlagen: ${res.status} ${text}`);
  }
  return { ok: true };
};

// Azure Blob Storage via SAS URL (PUT)
export const syncToAzureBlobSAS = async ({ sasUrl }) => {
  if (!sasUrl) throw new Error('Azure Blob SAS URL fehlt');
  const blob = buildSnapshot();
  const res = await fetch(sasUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-ms-blob-type': 'BlockBlob'
    },
    body: blob
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Azure Blob Upload fehlgeschlagen: ${res.status} ${text}`);
  }
  return { ok: true };
};

// Google Drive Upload (OAuth Access Token, optional Folder ID)
export const syncToGoogleDrive = async ({ accessToken, folderId, name = 'vfx-supervision-snapshot.json' }) => {
  if (!accessToken) throw new Error('Google Drive Access Token fehlt');
  const blob = buildSnapshot();
  const metadata = {
    name,
    mimeType: 'application/json',
    ...(folderId ? { parents: [folderId] } : {})
  };
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;
  const jsonText = await blob.text();
  const multipartBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    jsonText +
    closeDelimiter;
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google Drive Upload fehlgeschlagen: ${res.status} ${text}`);
  }
  return await res.json();
};

// OneDrive Upload (OAuth Access Token, Pfad)
export const syncToOneDrive = async ({ accessToken, path = '/vfx-supervision/snapshot.json' }) => {
  if (!accessToken) throw new Error('OneDrive Access Token fehlt');
  const blob = buildSnapshot();
  const safePath = path.startsWith('/') ? path : `/${path}`;
  const url = `https://graph.microsoft.com/v1.0/me/drive/root:${safePath}:/content`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: blob
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OneDrive Upload fehlgeschlagen: ${res.status} ${text}`);
  }
  return await res.json().catch(() => ({ ok: true }));
};

// Generischer HTTP Upload (PUT/POST, optionale Header)
export const syncToGenericHTTP = async ({ url, method = 'PUT', headers = {} }) => {
  if (!url) throw new Error('Upload URL fehlt');
  const blob = buildSnapshot();
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: blob
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP Upload fehlgeschlagen: ${res.status} ${text}`);
  }
  return { ok: true };
};
// WebDAV Upload (Basic Auth; Endpoint + Pfad)
export const syncToWebDAV = async ({ baseUrl, username, password, path = '/vfx-supervision/snapshot.json' }) => {
  if (!baseUrl) throw new Error('WebDAV Base URL fehlt');
  const url = baseUrl.replace(/\/$/, '') + path; // einfach zusammenfügen
  const blob = buildSnapshot();
  const auth = btoa(`${username || ''}:${password || ''}`);
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: blob
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WebDAV Upload fehlgeschlagen: ${res.status} ${text}`);
  }
  return { ok: true };
};

// OwnCloud Upload (WebDAV Wrapper: serverUrl + /remote.php/dav/files/{username} + path)
export const syncToOwnCloud = async ({ serverUrl, username, password, path = '/vfx-supervision/snapshot.json' }) => {
  if (!serverUrl) throw new Error('OwnCloud Server URL fehlt');
  if (!username) throw new Error('OwnCloud Benutzername fehlt');
  const baseUrl = serverUrl.replace(/\/$/, '') + '/remote.php/dav/files/' + encodeURIComponent(username);
  return await syncToWebDAV({ baseUrl, username, password, path });
};

// Nextcloud Upload (WebDAV Wrapper: serverUrl + /remote.php/dav/files/{username} + path)
export const syncToNextcloud = async ({ serverUrl, username, password, path = '/vfx-supervision/snapshot.json' }) => {
  if (!serverUrl) throw new Error('Nextcloud Server URL fehlt');
  if (!username) throw new Error('Nextcloud Benutzername fehlt');
  const baseUrl = serverUrl.replace(/\/$/, '') + '/remote.php/dav/files/' + encodeURIComponent(username);
  return await syncToWebDAV({ baseUrl, username, password, path });
};

// ——— Download: WebDAV / OwnCloud / Nextcloud ———
export const downloadFromWebDAV = async ({ baseUrl, username, password, path = '/vfx-supervision/snapshot.json' }) => {
  if (!baseUrl) throw new Error('WebDAV Base URL fehlt');
  const url = baseUrl.replace(/\/$/, '') + path;
  const auth = btoa(`${username || ''}:${password || ''}`);
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Authorization': `Basic ${auth}` }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`WebDAV Download fehlgeschlagen: ${res.status} ${text}`);
  }
  return await res.text();
};

export const downloadFromOwnCloud = async ({ serverUrl, username, password, path = '/vfx-supervision/snapshot.json' }) => {
  if (!serverUrl) throw new Error('OwnCloud Server URL fehlt');
  if (!username) throw new Error('OwnCloud Benutzername fehlt');
  const baseUrl = serverUrl.replace(/\/$/, '') + '/remote.php/dav/files/' + encodeURIComponent(username);
  return await downloadFromWebDAV({ baseUrl, username, password, path });
};

export const downloadFromNextcloud = async ({ serverUrl, username, password, path = '/vfx-supervision/snapshot.json' }) => {
  if (!serverUrl) throw new Error('Nextcloud Server URL fehlt');
  if (!username) throw new Error('Nextcloud Benutzername fehlt');
  const baseUrl = serverUrl.replace(/\/$/, '') + '/remote.php/dav/files/' + encodeURIComponent(username);
  return await downloadFromWebDAV({ baseUrl, username, password, path });
};

// ——— Auto Cloud Sync: Konfiguration & periodischer Trigger ———
export const getCloudAutoSyncConfig = () => {
  try {
    const raw = localStorage.getItem('cloud_auto_sync_config');
    return raw ? JSON.parse(raw) : { enabled: false };
  } catch {
    return { enabled: false };
  }
};

export const saveCloudAutoSyncConfig = (cfg) => {
  try {
    localStorage.setItem('cloud_auto_sync_config', JSON.stringify(cfg));
    return { ok: true };
  } catch (e) {
    throw new Error('Speichern der Auto‑Sync‑Konfiguration fehlgeschlagen');
  }
};

export const clearCloudAutoSyncConfig = () => {
  try {
    localStorage.removeItem('cloud_auto_sync_config');
    localStorage.removeItem('cloud_auto_sync_last_at');
  } catch {}
};

export const runCloudAutoSyncOnce = async () => {
  const cfg = getCloudAutoSyncConfig();
  if (!cfg || !cfg.enabled) return null;
  const now = Date.now();
  const intervalMs = Math.max(5, Number(cfg.intervalMinutes || 30)) * 60 * 1000;
  const lastRaw = localStorage.getItem('cloud_auto_sync_last_at');
  const last = lastRaw ? Date.parse(lastRaw) : 0;
  if (last && isFinite(last) && (now - last) < intervalMs) {
    return null; // noch nicht fällig
  }
  let res = null;
  const safeCfg = cfg.config || {};
  try {
    switch (cfg.provider) {
      case 'nextcloud':
        res = await syncToNextcloud(safeCfg);
        break;
      case 'owncloud':
        res = await syncToOwnCloud(safeCfg);
        break;
      case 'webdav':
        res = await syncToWebDAV(safeCfg);
        break;
      case 'dropbox':
        res = await syncToDropbox(safeCfg);
        break;
      case 's3':
        res = await syncToS3Presigned(safeCfg);
        break;
      case 'gcs':
        res = await syncToGCSignedUrl(safeCfg);
        break;
      case 'azure-blob':
        res = await syncToAzureBlobSAS(safeCfg);
        break;
      case 'google-drive':
        res = await syncToGoogleDrive(safeCfg);
        break;
      case 'onedrive':
        res = await syncToOneDrive(safeCfg);
        break;
      case 'generic-http':
        res = await syncToGenericHTTP(safeCfg);
        break;
      default:
        return null;
    }
    return res;
  } finally {
    try { localStorage.setItem('cloud_auto_sync_last_at', new Date().toISOString()); } catch {}
  }
};