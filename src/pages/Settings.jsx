import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './Settings.css';
import Icon from '../components/Icon';
import { saveAllDataToDevice } from '../utils/offlineManager';
import { useAuth } from '../contexts/AuthContext';
import { 
  syncToDropbox, 
  syncToS3Presigned, 
  syncToWebDAV,
  syncToOwnCloud,
  syncToNextcloud,
  syncToGCSignedUrl,
  syncToAzureBlobSAS,
  syncToGoogleDrive,
  syncToOneDrive,
  syncToGenericHTTP,
  downloadFromNextcloud,
  downloadFromWebDAV,
  downloadFromOwnCloud,
  getCloudAutoSyncConfig
} from '../utils/cloudSyncManager';
import { 
  listVersions,
  createVersion,
  restoreVersion,
  deleteVersion,
  downloadCurrentSnapshot,
  importSnapshotFromText,
  getAutoBackupEnabled,
  setAutoBackupEnabled,
  getDailyBackupEnabled,
  setDailyBackupEnabled,
  getLastDailyBackupAt
} from '../utils/versioningManager';

const Settings = ({ darkMode, toggleDarkMode }) => {
  const { language, setLanguage, t } = useLanguage();
  const locale = language === 'de' ? 'de-DE' : language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'de-DE';
  const { authFetch, currentUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  // Versioning & Backup States
  const [versions, setVersions] = useState(() => listVersions());
  const [autoBackupEnabled, setAutoBackupEnabledState] = useState(() => getAutoBackupEnabled());
  const [dailyBackupEnabled, setDailyBackupEnabledState] = useState(() => getDailyBackupEnabled());
  const [lastDailyBackupAt, setLastDailyBackupAtState] = useState(() => getLastDailyBackupAt());
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [restoreInfo, setRestoreInfo] = useState(null);

  // Cloud Sync States
  const [provider, setProvider] = useState('dropbox');
  const [dbxToken, setDbxToken] = useState('');
  const [dbxPath, setDbxPath] = useState('/vfx-supervision/snapshot.json');
  const [s3Url, setS3Url] = useState('');
  const [wdBaseUrl, setWdBaseUrl] = useState('');
  const [wdUser, setWdUser] = useState('');
  const [wdPass, setWdPass] = useState('');
  const [wdPath, setWdPath] = useState('/vfx-supervision/snapshot.json');
  const [gdToken, setGdToken] = useState('');
  const [gdFolderId, setGdFolderId] = useState('');
  const [odToken, setOdToken] = useState('');
  const [odPath, setOdPath] = useState('/vfx-supervision/snapshot.json');
  const [genericMethod, setGenericMethod] = useState('PUT');
  const [genericHeaders, setGenericHeaders] = useState('');
  // OwnCloud (WebDAV) States
  const [ocServerUrl, setOcServerUrl] = useState('');
  const [ocUser, setOcUser] = useState('');
  const [ocPass, setOcPass] = useState('');
  const [ocPath, setOcPath] = useState('/vfx-supervision/snapshot.json');
  // Nextcloud (WebDAV) States
  const [ncServerUrl, setNcServerUrl] = useState('');
  const [ncUser, setNcUser] = useState('');
  const [ncPass, setNcPass] = useState('');
  const [ncPath, setNcPath] = useState('/vfx-supervision/snapshot.json');
  // Auto Cloud Sync (persisted)
  const initialAutoCfg = getCloudAutoSyncConfig();
  const [autoCloudEnabled, setAutoCloudEnabled] = useState(initialAutoCfg?.enabled || false);
  const [autoCloudInterval, setAutoCloudInterval] = useState(initialAutoCfg?.intervalMinutes || 30);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch('/config/cloud', { method: 'GET' });
        if (!res || !res.ok) return;
        const cfg = await res.json();
        if (cancelled) return;
        setAutoCloudEnabled(!!cfg.enabled);
        setAutoCloudInterval(cfg.intervalMinutes || 30);
        if (cfg.provider) setProvider(cfg.provider);
        const c = cfg.config || {};
        if (cfg.provider === 'webdav') { setWdBaseUrl(c.baseUrl || ''); setWdUser(c.username || ''); setWdPass(c.password || ''); setWdPath(c.path || '/vfx-supervision/snapshot.json'); }
        else if (cfg.provider === 'owncloud') { setOcServerUrl(c.serverUrl || ''); setOcUser(c.username || ''); setOcPass(c.password || ''); setOcPath(c.path || '/vfx-supervision/snapshot.json'); }
        else if (cfg.provider === 'nextcloud') { setNcServerUrl(c.serverUrl || ''); setNcUser(c.username || ''); setNcPass(c.password || ''); setNcPath(c.path || '/vfx-supervision/snapshot.json'); }
        else if (cfg.provider === 'dropbox') { setDbxToken(c.accessToken || ''); setDbxPath(c.path || '/vfx-supervision/snapshot.json'); }
        else if (cfg.provider === 'google-drive') { setGdToken(c.accessToken || ''); setGdFolderId(c.folderId || ''); }
        else if (cfg.provider === 'onedrive') { setOdToken(c.accessToken || ''); setOdPath(c.path || '/vfx-supervision/snapshot.json'); }
        else if (cfg.provider === 's3' || cfg.provider === 'gcs' || cfg.provider === 'azure-blob') { setS3Url(c.presignedUrl || c.signedUrl || c.sasUrl || ''); }
        else if (cfg.provider === 'generic-http') { setS3Url(c.url || ''); setGenericMethod(c.method || 'PUT'); setGenericHeaders(c.headers ? JSON.stringify(c.headers) : ''); }
        try {
          localStorage.setItem('cloud_auto_sync_config', JSON.stringify({ ...cfg, ownerUserId: currentUser?.id || null }));
        } catch {}
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [authFetch, currentUser?.id]);

  const handleSaveOffline = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await saveAllDataToDevice();
      setResult(res);
    } catch (e) {
      console.error('Offline save failed:', e);
      setError(t('common.saveFailedTryAgain'));
    } finally {
      setSaving(false);
    }
  };

  const handleCloudSync = async () => {
    setSaving(true);
    setError(null);
    try {
      let res;
      if (provider === 'dropbox') {
        res = await syncToDropbox({ accessToken: dbxToken, path: dbxPath });
      } else if (provider === 's3') {
        res = await syncToS3Presigned({ presignedUrl: s3Url });
      } else if (provider === 'gcs') {
        res = await syncToGCSignedUrl({ signedUrl: s3Url });
      } else if (provider === 'azure-blob') {
        res = await syncToAzureBlobSAS({ sasUrl: s3Url });
      } else if (provider === 'webdav') {
        res = await syncToWebDAV({ baseUrl: wdBaseUrl, username: wdUser, password: wdPass, path: wdPath });
      } else if (provider === 'owncloud') {
        res = await syncToOwnCloud({ serverUrl: ocServerUrl, username: ocUser, password: ocPass, path: ocPath });
      } else if (provider === 'nextcloud') {
        res = await syncToNextcloud({ serverUrl: ncServerUrl, username: ncUser, password: ncPass, path: ncPath });
      } else if (provider === 'google-drive') {
        res = await syncToGoogleDrive({ accessToken: gdToken, folderId: gdFolderId });
      } else if (provider === 'onedrive') {
        res = await syncToOneDrive({ accessToken: odToken, path: odPath });
      } else if (provider === 'generic-http') {
        let headersObj = {};
        try { headersObj = genericHeaders ? JSON.parse(genericHeaders) : {}; } catch (e) { throw new Error('Header JSON ungültig'); }
        res = await syncToGenericHTTP({ url: s3Url, method: genericMethod, headers: headersObj });
      }
      setResult({ ...(result || {}), cloudSync: { provider, res } });
    } catch (e) {
      console.error('Cloud Sync fehlgeschlagen:', e);
      setError(e.message || 'Cloud Sync fehlgeschlagen. Bitte prüfen.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloudDownload = async () => {
    setSaving(true);
    setError(null);
    try {
      if (provider === 'nextcloud') {
        const text = await downloadFromNextcloud({ serverUrl: ncServerUrl, username: ncUser, password: ncPass, path: ncPath });
        await importSnapshotFromText(text, { saveVersion: true, note: 'Cloud Import (Nextcloud)' });
        const snap = JSON.parse(text);
        const projectsCount = Array.isArray(snap.projects) ? snap.projects.length : 0;
        const shotsCount = (snap.projects || []).reduce((acc, p) => acc + ((p.shots || []).length), 0);
        const shotFilesCount = Array.isArray(snap.shotFiles) ? snap.shotFiles.length : 0;
        setResult({ ...(result || {}), cloudDownload: { provider, projectsCount, shotsCount, shotFilesCount } });
      } else if (provider === 'owncloud') {
        const text = await downloadFromOwnCloud({ serverUrl: ocServerUrl, username: ocUser, password: ocPass, path: ocPath });
        await importSnapshotFromText(text, { saveVersion: true, note: 'Cloud Import (OwnCloud)' });
        const snap = JSON.parse(text);
        const projectsCount = Array.isArray(snap.projects) ? snap.projects.length : 0;
        const shotsCount = (snap.projects || []).reduce((acc, p) => acc + ((p.shots || []).length), 0);
        const shotFilesCount = Array.isArray(snap.shotFiles) ? snap.shotFiles.length : 0;
        setResult({ ...(result || {}), cloudDownload: { provider, projectsCount, shotsCount, shotFilesCount } });
      } else if (provider === 'webdav') {
        const text = await downloadFromWebDAV({ baseUrl: wdBaseUrl, username: wdUser, password: wdPass, path: wdPath });
        await importSnapshotFromText(text, { saveVersion: true, note: 'Cloud Import (WebDAV)' });
        const snap = JSON.parse(text);
        const projectsCount = Array.isArray(snap.projects) ? snap.projects.length : 0;
        const shotsCount = (snap.projects || []).reduce((acc, p) => acc + ((p.shots || []).length), 0);
        const shotFilesCount = Array.isArray(snap.shotFiles) ? snap.shotFiles.length : 0;
        setResult({ ...(result || {}), cloudDownload: { provider, projectsCount, shotsCount, shotFilesCount } });
      } else {
        throw new Error('Cloud‑Download wird für den ausgewählten Provider noch nicht unterstützt.');
      }
    } catch (e) {
      console.error('Cloud Download fehlgeschlagen:', e);
      setError(e.message || 'Cloud Download fehlgeschlagen. Bitte prüfen.');
    } finally {
      setSaving(false);
    }
  };
  const refreshVersions = () => setVersions(listVersions());

  const handleCreateBackup = async () => {
    try {
      setSaving(true);
      await createVersion({ note: 'Manuelles Backup', source: 'settings' });
      refreshVersions();
    } catch (e) {
      setError('Backup-Erstellung fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      await downloadCurrentSnapshot();
    } catch (e) {
      setError('Download fehlgeschlagen.');
    }
  };

  const handleToggleAutoBackup = (e) => {
    const enabled = e.target.checked;
    setAutoBackupEnabled(enabled);
    setAutoBackupEnabledState(enabled);
  };

  const handleToggleDailyBackup = (e) => {
    const enabled = e.target.checked;
    setDailyBackupEnabled(enabled);
    setDailyBackupEnabledState(enabled);
    setLastDailyBackupAtState(getLastDailyBackupAt());
  };

  // Auto Cloud Sync Handlers
  const handleToggleAutoCloud = (e) => {
    const enabled = e.target.checked;
    setAutoCloudEnabled(enabled);
  };

  const applyAutoCloudConfig = async () => {
    setSaving(true);
    setError(null);
    try {
      let config = {};
      if (provider === 'dropbox') {
        config = { accessToken: dbxToken, path: dbxPath };
      } else if (provider === 's3') {
        config = { presignedUrl: s3Url };
      } else if (provider === 'gcs') {
        config = { signedUrl: s3Url };
      } else if (provider === 'azure-blob') {
        config = { sasUrl: s3Url };
      } else if (provider === 'webdav') {
        config = { baseUrl: wdBaseUrl, username: wdUser, password: wdPass, path: wdPath };
      } else if (provider === 'owncloud') {
        config = { serverUrl: ocServerUrl, username: ocUser, password: ocPass, path: ocPath };
      } else if (provider === 'nextcloud') {
        config = { serverUrl: ncServerUrl, username: ncUser, password: ncPass, path: ncPath };
      } else if (provider === 'google-drive') {
        config = { accessToken: gdToken, folderId: gdFolderId };
      } else if (provider === 'onedrive') {
        config = { accessToken: odToken, path: odPath };
      } else if (provider === 'generic-http') {
        let headersObj = {};
        try { headersObj = genericHeaders ? JSON.parse(genericHeaders) : {}; } catch (e) { /* ignore parse error */ }
        config = { url: s3Url, method: genericMethod, headers: headersObj };
      }

      const res = await authFetch('/config/cloud', {
        method: 'PUT',
        body: JSON.stringify({
          enabled: autoCloudEnabled,
          intervalMinutes: Math.max(5, Number(autoCloudInterval || 30)),
          provider,
          config,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server Fehler beim Speichern');
      }
      const data = await res.json();
      try {
        localStorage.setItem('cloud_auto_sync_config', JSON.stringify({
          enabled: autoCloudEnabled,
          intervalMinutes: Math.max(5, Number(autoCloudInterval || 30)),
          provider,
          config,
          ownerUserId: currentUser?.id || null,
          updatedAt: data.updatedAt,
        }));
      } catch {}
      setResult({ ...(result || {}), cloudAutoSync: { provider, intervalMinutes: Math.max(5, Number(autoCloudInterval || 30)) } });
    } catch (e) {
      setError(e.message || 'Konfiguration konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreVersion = async (id) => {
    try {
      const info = restoreVersion(id);
      setRestoreInfo(info);
    } catch (e) {
      setError(e.message || 'Wiederherstellung fehlgeschlagen.');
    }
  };

  const handleDeleteVersion = async (id) => {
    try {
      deleteVersion(id);
      refreshVersions();
    } catch (e) {
      setError('Löschen fehlgeschlagen.');
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportError(null);
    try {
      const text = await file.text();
      await importSnapshotFromText(text, { saveVersion: true, note: 'Importiertes Backup' });
      refreshVersions();
    } catch (err) {
      setImportError('Import fehlgeschlagen. Bitte gültige JSON-Datei wählen.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="settings-page">
      <h1>{t('nav.settings')}</h1>

      <div className="settings-card card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {t('settings.appearance')}
          <span title="Oberfläche und Sprache konfigurieren."><Icon name="info" size={16} /></span>
        </h2>
        <div className="setting-item">
          <label>
            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            Dark Mode <span title="Schaltet die dunkle Oberfläche ein/aus."><Icon name="info" size={14} /></span>
          </label>
        </div>
        <div className="setting-item">
          <label>
            {t('settings.language')} <span title="Wähle die Anwendungs‑Sprache; betrifft Labels und Texte."><Icon name="info" size={14} /></span>
            <select
              style={{ marginLeft: '8px' }}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="de">{t('settings.languageOptions.de')}</option>
              <option value="en">{t('settings.languageOptions.en')}</option>
              <option value="fr">{t('settings.languageOptions.fr')}</option>
              <option value="es">{t('settings.languageOptions.es')}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="settings-card card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {t('settings.offline')}
          <span title="Sichert Daten lokal für Offline‑Verfügbarkeit; geeignet für Set‑Einsatz."><Icon name="info" size={16} /></span>
        </h2>
        <p>{t('settings.offlineDescription')}</p>
        <button
          className="btn-primary"
          onClick={handleSaveOffline}
          disabled={saving}
        >
          {saving ? t('settings.offlineSaving') : t('settings.offlineSaveNow')}
        </button>
        {error && <p className="error-text">{error}</p>}
        {result && (
          <div className="save-result">
            <p>
              {t('settings.offlineSavedPrefix')} {result.projectsCount} {t('settings.versioning.projectsLabel')}, {result.shotsCount} {t('settings.versioning.shotsLabel')}.
            </p>
            <small>{t('settings.timestampPrefix')} {new Date(result.timestamp).toLocaleString(locale)}</small>
          </div>
        )}
      </div>

      <div className="settings-card card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {t('settings.cloudSync.title')}
          <span title="Synchronisiere Snapshots mit Cloud‑Anbietern (Dropbox, S3, WebDAV, u.a.)."><Icon name="info" size={16} /></span>
        </h2>
        <p>{t('settings.cloudSync.description')}</p>
        <div className="form-row">
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {t('settings.cloudSync.providerLabel')}
              <span title="Wähle den Anbieter für Cloud‑Synchronisierung."><Icon name="info" size={14} /></span>
            </label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="dropbox">Dropbox</option>
              <option value="s3">AWS S3 (Presigned URL)</option>
              <option value="gcs">Google Cloud Storage (Signed URL)</option>
              <option value="azure-blob">Azure Blob (SAS URL)</option>
              <option value="webdav">WebDAV</option>
              <option value="owncloud">OwnCloud (WebDAV)</option>
              <option value="nextcloud">Nextcloud (WebDAV)</option>
              <option value="google-drive">Google Drive (OAuth Token)</option>
              <option value="onedrive">OneDrive (OAuth Token)</option>
              <option value="generic-http">{t('settings.cloudSync.options.genericHttp')}</option>
            </select>
          </div>
        </div>

        {provider === 'dropbox' && (
          <div className="form-row">
            <div className="form-group">
              <label>{t('settings.cloudSync.labels.accessToken')}</label>
              <input type="password" value={dbxToken} onChange={(e) => setDbxToken(e.target.value)} placeholder="Dropbox Access Token" />
            </div>
            <div className="form-group">
              <label>{t('settings.cloudSync.labels.filePath')}</label>
              <input type="text" value={dbxPath} onChange={(e) => setDbxPath(e.target.value)} placeholder="/vfx-supervision/snapshot.json" />
            </div>
          </div>
        )}

        {provider === 's3' && (
          <div className="form-row">
            <div className="form-group" style={{ width: '100%' }}>
              <label>{t('settings.cloudSync.labels.presignedUrl')}</label>
              <input type="text" value={s3Url} onChange={(e) => setS3Url(e.target.value)} placeholder="https://bucket.s3... (Presigned URL)" />
            </div>
          </div>
        )}

        {provider === 'gcs' && (
          <div className="form-row">
            <div className="form-group" style={{ width: '100%' }}>
              <label>{t('settings.cloudSync.labels.signedUrl')}</label>
              <input type="text" value={s3Url} onChange={(e) => setS3Url(e.target.value)} placeholder="https://storage.googleapis.com/... (Signed URL)" />
            </div>
          </div>
        )}

        {provider === 'azure-blob' && (
          <div className="form-row">
            <div className="form-group" style={{ width: '100%' }}>
              <label>{t('settings.cloudSync.labels.sasUrl')}</label>
              <input type="text" value={s3Url} onChange={(e) => setS3Url(e.target.value)} placeholder="https://account.blob.core.windows.net/container/blob?sv=... (SAS URL)" />
            </div>
          </div>
        )}

        {provider === 'webdav' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>{t('settings.cloudSync.labels.baseUrl')}</label>
                <input type="text" value={wdBaseUrl} onChange={(e) => setWdBaseUrl(e.target.value)} placeholder="https://webdav.server/remote.php/dav/files/user" />
              </div>
              <div className="form-group">
                <label>{t('settings.cloudSync.labels.username')}</label>
                <input type="text" value={wdUser} onChange={(e) => setWdUser(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('settings.cloudSync.labels.passwordToken')}</label>
                <input type="password" value={wdPass} onChange={(e) => setWdPass(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{t('settings.cloudSync.labels.filePath')}</label>
                <input type="text" value={wdPath} onChange={(e) => setWdPath(e.target.value)} placeholder="/vfx-supervision/snapshot.json" />
              </div>
            </div>
          </>
        )}

        {provider === 'owncloud' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>{t('settings.cloudSync.labels.baseUrl')}</label>
                <input type="text" value={ocServerUrl} onChange={(e) => setOcServerUrl(e.target.value)} placeholder="https://cloud.example.com" />
              </div>
              <div className="form-group">
                <label>{t('settings.cloudSync.labels.username')}</label>
                <input type="text" value={ocUser} onChange={(e) => setOcUser(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('settings.cloudSync.labels.passwordToken')}</label>
                <input type="password" value={ocPass} onChange={(e) => setOcPass(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{t('settings.cloudSync.labels.filePath')}</label>
                <input type="text" value={ocPath} onChange={(e) => setOcPath(e.target.value)} placeholder="/vfx-supervision/snapshot.json" />
              </div>
            </div>
            <p style={{ fontSize: '12px', opacity: 0.8 }}>
              Hinweis: Pfad wird als /remote.php/dav/files/{ocUser}{ocPath} aufgebaut.
            </p>
          </>
        )}

        {provider === 'nextcloud' && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>{t('settings.cloudSync.labels.baseUrl')}</label>
                <input type="text" value={ncServerUrl} onChange={(e) => setNcServerUrl(e.target.value)} placeholder="https://nextcloud.example.com" />
              </div>
              <div className="form-group">
                <label>{t('settings.cloudSync.labels.username')}</label>
                <input type="text" value={ncUser} onChange={(e) => setNcUser(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('settings.cloudSync.labels.passwordToken')}</label>
                <input type="password" value={ncPass} onChange={(e) => setNcPass(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{t('settings.cloudSync.labels.filePath')}</label>
                <input type="text" value={ncPath} onChange={(e) => setNcPath(e.target.value)} placeholder="/vfx-supervision/snapshot.json" />
              </div>
            </div>
            <p style={{ fontSize: '12px', opacity: 0.8 }}>
              Hinweis: Pfad wird als /remote.php/dav/files/{ncUser}{ncPath} aufgebaut.
            </p>
          </>
        )}

        {provider === 'google-drive' && (
          <>
            <div className="form-row">
              <div className="form-group" style={{ width: '100%' }}>
                <label>{t('settings.cloudSync.labels.oauthAccessToken')}</label>
                <input type="password" value={gdToken} onChange={(e) => setGdToken(e.target.value)} placeholder="Google OAuth Access Token" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ width: '100%' }}>
                <label>{t('settings.cloudSync.labels.folderIdOptional')}</label>
                <input type="text" value={gdFolderId} onChange={(e) => setGdFolderId(e.target.value)} placeholder="Google Drive Folder ID" />
              </div>
            </div>
          </>
        )}

        {provider === 'onedrive' && (
          <>
            <div className="form-row">
              <div className="form-group" style={{ width: '100%' }}>
                <label>{t('settings.cloudSync.labels.oauthAccessToken')}</label>
                <input type="password" value={odToken} onChange={(e) => setOdToken(e.target.value)} placeholder="Microsoft Graph OAuth Token" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ width: '100%' }}>
                <label>{t('settings.cloudSync.labels.targetPath')}</label>
                <input type="text" value={odPath} onChange={(e) => setOdPath(e.target.value)} placeholder="/vfx-supervision/snapshot.json" />
              </div>
            </div>
          </>
        )}

        {provider === 'generic-http' && (
          <>
            <div className="form-row">
              <div className="form-group" style={{ width: '100%' }}>
                <label>{t('settings.cloudSync.labels.uploadUrl')}</label>
                <input type="text" value={s3Url} onChange={(e) => setS3Url(e.target.value)} placeholder="https://example.com/upload" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t('settings.cloudSync.labels.method')}</label>
                <select value={genericMethod} onChange={(e) => setGenericMethod(e.target.value)}>
                  <option value="PUT">PUT</option>
                  <option value="POST">POST</option>
                </select>
              </div>
              <div className="form-group" style={{ width: '100%' }}>
                <label>{t('settings.cloudSync.labels.headersJson')}</label>
                <input type="text" value={genericHeaders} onChange={(e) => setGenericHeaders(e.target.value)} placeholder='{"Authorization":"Bearer ..."}' />
              </div>
            </div>
          </>
        )}

        <button className="btn-secondary" onClick={handleCloudSync} disabled={saving}>
          {saving ? t('settings.cloudSync.syncing') : t('settings.cloudSync.syncNow')}
        </button>
        {provider === 'nextcloud' || provider === 'owncloud' || provider === 'webdav' ? (
          <button className="btn-secondary" onClick={handleCloudDownload} disabled={saving} style={{ marginLeft: 8 }}>
            {saving ? t('common.loading') : t('settings.cloudSync.downloadNow')}
          </button>
        ) : null}
        <div className="setting-item" style={{ marginTop: 12 }}>
          <label>
            <input type="checkbox" checked={autoCloudEnabled} onChange={handleToggleAutoCloud} />
            {t('settings.cloudSync.autoSync')}
          </label>
        </div>
        <div className="form-row" style={{ gap: '8px' }}>
          <div className="form-group">
            <label>{t('settings.cloudSync.intervalMinutes')}</label>
            <input type="number" min="5" step="5" value={autoCloudInterval} onChange={(e) => setAutoCloudInterval(Number(e.target.value) || 30)} />
          </div>
          <button className="btn-secondary" onClick={applyAutoCloudConfig} disabled={saving}>
            {t('common.save')}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
        {result?.cloudSync && (
          <div className="save-result">
            <p>{t('settings.cloudSync.completedPrefix')} {result.cloudSync.provider}</p>
          </div>
        )}
        {result?.cloudDownload && (
          <div className="save-result">
            <p>{t('settings.versioning.restoredPrefix')} {result.cloudDownload.projectsCount} {t('settings.versioning.projectsLabel')}, {result.cloudDownload.shotsCount} {t('settings.versioning.shotsLabel')}.</p>
          </div>
        )}
        {result?.cloudAutoSync && (
          <div className="save-result">
            <p>{t('settings.cloudSync.autoSyncSavedPrefix')} {result.cloudAutoSync.provider} · {result.cloudAutoSync.intervalMinutes} min</p>
          </div>
        )}

      </div>

      <div className="settings-card card">
        <h2>{t('settings.versioning.title')}</h2>
        <p>{t('settings.versioning.description')}</p>
        <div className="setting-item">
          <label>
            <input type="checkbox" checked={autoBackupEnabled} onChange={handleToggleAutoBackup} />
            {t('settings.versioning.autoBackup')}
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input type="checkbox" checked={dailyBackupEnabled} onChange={handleToggleDailyBackup} />
            {t('settings.versioning.dailySnapshot')}
          </label>
        </div>
        <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
          {t('settings.versioning.lastDailyBackupPrefix')} {lastDailyBackupAt ? new Date(lastDailyBackupAt).toLocaleString(locale) : t('settings.versioning.noneYet')}
        </p>
        <div className="form-row" style={{ gap: '8px' }}>
          <button className="btn-secondary" onClick={handleCreateBackup} disabled={saving}>
            {saving ? t('settings.versioning.creating') : t('settings.versioning.createBackupNow')}
          </button>
          <button className="btn-secondary" onClick={handleDownloadBackup}>
            {t('settings.versioning.downloadBackupJson')}
          </button>
          <label className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {t('settings.versioning.importBackup')}
            <input type="file" accept="application/json" onChange={handleImportFile} style={{ display: 'none' }} />
          </label>
        </div>
        {importError && <p className="error-text">{importError}</p>}
        {restoreInfo && (
          <div className="save-result">
            <p>
              {t('settings.versioning.restoredPrefix')} {restoreInfo.projectsCount} {t('settings.versioning.projectsLabel')}, {restoreInfo.shotsCount} {t('settings.versioning.shotsLabel')}.
            </p>
          </div>
        )}
        <div className="version-list" style={{ marginTop: '12px' }}>
          <h3>{t('settings.versioning.savedVersionsTitle')}</h3>
          {versions.length === 0 ? (
            <p>{t('settings.versioning.noVersions')}</p>
          ) : (
            versions.map(v => (
              <div key={v.id} className="version-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', padding: '8px 0' }}>
                <div style={{ flex: 1 }}>
                  <strong>{new Date(v.timestamp).toLocaleString(locale)}</strong>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    {v.note || 'Snapshot'} · Projekte {v.projectsCount}, Shots {v.shotsCount}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary" onClick={() => handleRestoreVersion(v.id)}>{t('action.restore')}</button>
                  <button className="btn-danger" onClick={() => handleDeleteVersion(v.id)}>{t('action.delete')}</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
