import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { lensDatabase, getLensManufacturers, getLensesByManufacturer } from '../data/lensDatabase';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import { Link } from 'react-router-dom';

const lsPrefix = 'userLensAdditions:';
const legacyKey = 'userLensAdditions';
const getLsKey = (user) => `${lsPrefix}${user?.id ?? 'guest'}`;

const loadAdditionsForUser = (user) => {
  const key = getLsKey(user);
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveAdditionsForUser = (user, items) => {
  const key = getLsKey(user);
  try {
    localStorage.setItem(key, JSON.stringify(items || []));
  } catch {}
};

const collectAllLensAdditions = () => {
  const rows = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(lsPrefix)) continue;
      const ownerId = k.slice(lsPrefix.length);
      const raw = localStorage.getItem(k);
      const arr = raw ? JSON.parse(raw) : [];
      const ownerName = null; // wird im UI ggf. aus AuthContext gemappt, falls verfügbar
      arr.forEach(a => rows.push({ ...a, ownerId, ownerName }));
    }
  } catch {}
  return rows;
};

const LensEditor = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const manufacturers = useMemo(() => getLensManufacturers(), []);
  const [manufacturer, setManufacturer] = useState('');
  const [lensName, setLensName] = useState('');
  const [additions, setAdditions] = useState(() => []);
  const [existing, setExisting] = useState([]);
  const [viewAll, setViewAll] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Migration: alte Einträge aus legacyKey dem aktuellen Nutzer zuordnen
    try {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        const legacyArr = JSON.parse(legacyRaw) || [];
        const migrated = legacyArr.map(a => ({ ...a, ownerId: currentUser?.id ?? 'guest', ownerName: currentUser?.name ?? 'Gast' }));
        const current = loadAdditionsForUser(currentUser);
        const merged = [...current, ...migrated];
        saveAdditionsForUser(currentUser, merged);
        localStorage.removeItem(legacyKey);
      }
    } catch {}
    // Normale Ladung der Nutzereinträge
    setAdditions(loadAdditionsForUser(currentUser));
  }, [currentUser]);

  useEffect(() => {
    const list = manufacturer ? getLensesByManufacturer(manufacturer) : [];
    setExisting(list);
  }, [manufacturer]);

  const hasMm = (s) => /\bmm\b/i.test(s || '');

  const addEntry = () => {
    const man = (manufacturer || '').trim();
    const name = (lensName || '').trim();
    if (!man || !name) return;
    // Duplikatprüfung: gegen offizielle DB und alle Nutzer-Ergänzungen
    const official = (existing || []).some(x => String(x).toLowerCase() === name.toLowerCase());
    const all = collectAllLensAdditions();
    const dup = all.some(x => (x.manufacturer || '').toLowerCase() === man.toLowerCase() && (x.name || '').toLowerCase() === name.toLowerCase());
    if (official || dup) {
      alert('Duplikat gefunden (offizielle DB oder Ergänzung eines Nutzers). Eintrag wurde nicht hinzugefügt, es wird nichts überschrieben.');
      return;
    }
    const entry = { manufacturer: man, name, createdAt: Date.now(), ownerId: currentUser?.id ?? 'guest', ownerName: currentUser?.name ?? 'Gast' };
    const next = [...additions, entry];
    setAdditions(next);
    saveAdditionsForUser(currentUser, next);
    setLensName('');
  };

  const removeEntry = (index) => {
    const row = additions[index];
    if (row && row.ownerId !== (currentUser?.id ?? 'guest')) {
      alert('Nur eigene Einträge können entfernt werden.');
      return;
    }
    const next = additions.filter((_, i) => i !== index);
    setAdditions(next);
    saveAdditionsForUser(currentUser, next);
  };

  const clearAll = () => {
    // Löscht nur eigene Einträge
    setAdditions([]);
    saveAdditionsForUser(currentUser, []);
  };

  const exportJson = () => {
    const payload = additions.map((a) => ({
      manufacturer: a.manufacturer,
      lens: a.name,
      ownerId: a.ownerId,
      ownerName: a.ownerName,
    }));
    const text = JSON.stringify(payload, null, 2);
    navigator.clipboard?.writeText(text).catch(() => {});
    alert('JSON (eigene Ergänzungen) in die Zwischenablage kopiert.');
  };

  const importJson = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const items = Array.isArray(payload) ? payload : (payload.items || payload.lenses || []);
      if (!Array.isArray(items)) throw new Error('Ungültiges JSON-Format (Array erwartet).');

      const all = collectAllLensAdditions();
      const added = [];
      let skipped = 0;

      for (const it of items) {
        const man = String(it.manufacturer || '').trim();
        const name = String(it.lens || it.name || '').trim();
        if (!man || !name) { skipped++; continue; }
        const official = (getLensesByManufacturer(man) || []).some(x => String(x).toLowerCase() === name.toLowerCase());
        const dup = all.some(x => (x.manufacturer || '').toLowerCase() === man.toLowerCase() && (x.name || '').toLowerCase() === name.toLowerCase());
        if (official || dup) { skipped++; continue; }
        added.push({ manufacturer: man, name, createdAt: Date.now(), ownerId: currentUser?.id ?? 'guest', ownerName: currentUser?.name ?? 'Gast' });
      }

      if (added.length) {
        const next = [...additions, ...added];
        setAdditions(next);
        saveAdditionsForUser(currentUser, next);
      }
      alert(`Import abgeschlossen. Hinzugefügt: ${added.length}, übersprungen (Duplikate/fehlerhaft): ${skipped}.`);
    } catch (err) {
      alert('Import fehlgeschlagen: ' + (err?.message || 'Unbekannter Fehler'));
    }
  };

  const rows = viewAll ? collectAllLensAdditions() : additions;
// Auto-Detect LDS from typed lens name
const isLdsName = useMemo(() => {
  const s = (lensName || '').toUpperCase();
  return /(\bLDS\b|\bLDS-2\b\/I\b|\bXD\b)/.test(s);
}, [lensName]);

  return (
    <div className="page" style={{ padding: 16 }}>
      <div className="header" style={{ marginBottom: 12 }}>
        <div className="header-content">
          <h1>Objektiv‑Datenbank (Editor)</h1>
          <p className="subtitle">Füge neue Objektive hinzu. Keine Überschreibungen: Duplikate werden blockiert.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 12, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Hersteller <span title={t('help.lensManufacturer', 'Marke, z. B. ARRI, Canon')} aria-label={t('help.info', 'Info')} style={{ verticalAlign: 'middle', marginLeft: 6 }}><Icon name="info" size={16} /></span></label>
            <input list="lens-manufacturers" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder="z. B. ARRI, Canon" />
            <datalist id="lens-manufacturers">
              {manufacturers.map((m) => (<option key={m} value={m} />))}
            </datalist>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Objektivname <span title={t('help.lensNameHint', 'Beispiel: 50mm f/1.4; mm‑Angabe empfohlen')} aria-label={t('help.info', 'Info')} style={{ verticalAlign: 'middle', marginLeft: 6 }}><Icon name="info" size={16} /></span></label>
            <input value={lensName} onChange={(e) => setLensName(e.target.value)} placeholder="z. B. 50mm f/1.4" />
            <div style={{ fontSize: 12, color: 'var(--muted-color)' }}>
              {lensName ? (hasMm(lensName) ? 'mm‑Angabe erkannt' : 'Hinweis: mm‑Angabe fehlt') : 'Beispiel: 50mm f/1.4'}
            </div>
            <div style={{ marginTop: 6 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                LDS
                <input type="checkbox" checked={isLdsName} readOnly />
                <span style={{ fontSize: 12, color: 'var(--muted-color)' }}>
                  {isLdsName ? 'automatisch erkannt' : 'aktiviert bei "LDS", "LDS-2", "/i", "XD" im Namen'}
                </span>
              </label>
            </div>
          </div>
          <button onClick={addEntry} aria-label={t('editor.addEntry', 'Eintrag hinzufügen')} title={t('editor.addEntry', 'Eintrag hinzufügen')}>Hinzufügen</button>
        </div>
      </div>

      <div className="card" style={{ padding: 12, marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Vorhandene Objektive ({manufacturer || '—'})</div>
        <ul style={{ maxHeight: 160, overflow: 'auto', border: '1px solid var(--border-color)', borderRadius: 6, padding: 8 }}>
          {existing.map((name, i) => (
            <li key={i} style={{ fontSize: 13, color: 'var(--muted-color)' }}>{name}</li>
          ))}
          {!existing.length && <li style={{ fontSize: 13, color: 'var(--muted-color)' }}>Keine Einträge</li>}
        </ul>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>Ergänzungen</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setViewAll(false)} aria-pressed={!viewAll} aria-label={t('editor.viewMine', 'Nur eigene Ergänzungen anzeigen')} title={t('editor.viewMine', 'Nur eigene Ergänzungen anzeigen')}>Meine</button>
            <button onClick={() => setViewAll(true)} aria-pressed={viewAll} aria-label={t('editor.viewAll', 'Alle Ergänzungen anzeigen')} title={t('editor.viewAll', 'Alle Ergänzungen anzeigen')}>Alle</button>
            <button onClick={exportJson} aria-label={t('editor.exportJsonMine', 'Eigene Ergänzungen als JSON kopieren')} title={t('editor.exportJsonMine', 'Eigene Ergänzungen als JSON kopieren')}>Export JSON (Meine)</button>
            <button onClick={importJson} title={t('editor.importJsonHint', 'JSON-Datei importieren: [{ manufacturer, lens }] oder { items/lenses: [...] }')} aria-label={t('editor.importJsonMine', 'JSON importieren (eigene Ergänzungen)')}>Import JSON (Meine)</button>
            <Link to="/tools-docs" aria-label={t('docs.openImportHelp', 'Import‑Hilfe öffnen')} title={t('docs.openImportHelp', 'Import‑Hilfe öffnen')} style={{ display: 'inline-flex', alignItems: 'center', padding: '0 6px', border: '1px solid var(--border-color)', borderRadius: 6 }}>
              <Icon name="info" size={16} />
            </Link>
            <button onClick={clearAll} style={{ color: 'var(--color-danger)' }} aria-label={t('editor.clearMine', 'Eigene Ergänzungen löschen')} title={t('editor.clearMine', 'Eigene Ergänzungen löschen')}>Meine löschen</button>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Hersteller</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Objektiv</th>
              <th style={{ textAlign: 'left', padding: 8 }}>mm‑Angabe</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Besitzer</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a, idx) => (
              <tr key={idx}>
                <td style={{ padding: 8 }}>{a.manufacturer}</td>
                <td style={{ padding: 8 }}>{a.name}</td>
                <td style={{ padding: 8 }}>{hasMm(a.name) ? 'Ja' : 'Fehlt'}</td>
                <td style={{ padding: 8 }}>{a.ownerName || (a.ownerId ? `User ${a.ownerId}` : '—')}</td>
                <td style={{ padding: 8 }}>
                  {!viewAll ? (
                    <button onClick={() => removeEntry(idx)} style={{ color: 'var(--color-danger)' }} aria-label={t('editor.removeEntry', 'Eintrag entfernen')} title={t('editor.removeEntry', 'Eintrag entfernen')}>Entfernen</button>
                  ) : (
                    <span style={{ color: 'var(--muted-color)' }}>Nur eigene Einträge entfernbar</span>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} style={{ padding: 8, color: 'var(--muted-color)' }}>{viewAll ? 'Keine Ergänzungen vorhanden.' : 'Noch keine eigenen Objektive hinzugefügt.'}</td>
              </tr>
            )}
          </tbody>
        </table>
        <input type="file" accept="application/json" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} />
        <details style={{ marginTop: 12 }}>
          <summary>Import‑Hilfe: JSON‑Format</summary>
          <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--muted-color)' }}>
            <div>Unterstützt: Array oder Objekt mit Schlüssel <code>items</code>/<code>lenses</code>.</div>
            <pre style={{ background: 'var(--code-bg, #f6f8fa)', padding: 8, borderRadius: 6 }}>{`[
  { "manufacturer": "ARRI", "lens": "50mm f/1.4" },
  { "manufacturer": "Canon", "name": "24-70mm f/2.8" }
]`}</pre>
            <div>Duplikate gegen offizielle Datenbank und Ergänzungen anderer Nutzer werden übersprungen.</div>
            <div>Importierte Einträge werden dem aktuellen Nutzer zugeordnet.</div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default LensEditor;