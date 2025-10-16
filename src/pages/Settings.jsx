import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './Settings.css';
import { saveAllDataToDevice } from '../utils/offlineManager';
import { 
  syncToDropbox, 
  syncToS3Presigned, 
  syncToWebDAV,
  syncToGCSignedUrl,
  syncToAzureBlobSAS,
  syncToGoogleDrive,
  syncToOneDrive,
  syncToGenericHTTP
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
        <h2>{t('settings.appearance')}</h2>
        <div className="setting-item">
          <label>
            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            Dark Mode
          </label>
        </div>
        <div className="setting-item">
          <label>
            {t('settings.language')}
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
        <h2>{t('settings.offline')}</h2>
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
        <h2>{t('settings.cloudSync.title')}</h2>
        <p>{t('settings.cloudSync.description')}</p>
        <div className="form-row">
          <div className="form-group">
            <label>{t('settings.cloudSync.providerLabel')}</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="dropbox">Dropbox</option>
              <option value="s3">AWS S3 (Presigned URL)</option>
              <option value="gcs">Google Cloud Storage (Signed URL)</option>
              <option value="azure-blob">Azure Blob (SAS URL)</option>
              <option value="webdav">WebDAV</option>
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
        {error && <p className="error-text">{error}</p>}
        {result?.cloudSync && (
          <div className="save-result">
            <p>{t('settings.cloudSync.completedPrefix')} {result.cloudSync.provider}</p>
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