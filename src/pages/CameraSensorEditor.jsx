import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { cameraDatabase } from '../data/cameraDatabase';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import { Link } from 'react-router-dom';

const lsPrefix = 'userCamAdditions:';
const legacyKey = 'userCameraAdditions';
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

const collectAllCamAdditions = () => {
  const rows = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(lsPrefix)) continue;
      const ownerId = k.slice(lsPrefix.length);
      const raw = localStorage.getItem(k);
      const arr = raw ? JSON.parse(raw) : [];
      const ownerName = null;
      arr.forEach(a => rows.push({ ...a, ownerId, ownerName }));
    }
  } catch {}
  return rows;
};

const parseMmOk = (s) => /^(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*mm$/i.test((s || '').trim());
const parsePxOk = (s) => /^(\d+)\s*x\s*(\d+)$/i.test((s || '').trim());
const parseArOk = (s) => /^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/i.test((s || '').trim());

const toPxRatio = (s) => {
  const m = (s || '').trim().match(/(\d+)\s*x\s*(\d+)/i);
  if (!m) return null;
  const w = parseInt(m[1], 10); const h = parseInt(m[2], 10);
  if (!Number.isFinite(w) || !Number.isFinite(h) || h <= 0) return null;
  return (w / h).toFixed(3);
};

const toArRatio = (s) => {
  const m = (s || '').trim().match(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const a = parseFloat(m[1]); const b = parseFloat(m[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= 0) return null;
  return (a / b).toFixed(3);
};

const CameraSensorEditor = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const manufacturers = useMemo(() => Object.keys(cameraDatabase || {}), []);
  const [manufacturer, setManufacturer] = useState(manufacturers[0] || '');
  const models = useMemo(() => Object.keys(cameraDatabase?.[manufacturer]?.models || {}), [manufacturer]);
  const [model, setModel] = useState(models[0] || '');
  const [formatName, setFormatName] = useState('');
  const [sensorMm, setSensorMm] = useState('');
  const [pixelRes, setPixelRes] = useState('');
  const [arRecorded, setArRecorded] = useState('');
  const [arSensor, setArSensor] = useState('');
  const [additions, setAdditions] = useState(() => []);
  const [viewAll, setViewAll] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setModel(models[0] || '');
  }, [manufacturer]);

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
    setAdditions(loadAdditionsForUser(currentUser));
  }, [currentUser]);

  const addEntry = () => {
    const man = (manufacturer || '').trim();
    const mod = (model || '').trim();
    const fmt = (formatName || '').trim();
    const mm = (sensorMm || '').trim();
    const px = (pixelRes || '').trim();
    const rec = (arRecorded || '').trim();
    const sen = (arSensor || '').trim() || rec;
    if (!man || !mod || !fmt) return;
    if (mm && !parseMmOk(mm)) return alert('mm‑Format: z. B. 28.0 x 15.7 mm');
    if (px && !parsePxOk(px)) return alert('Pixel‑Format: z. B. 4608 x 2592');
    if (rec && !parseArOk(rec)) return alert('AR‑Format: z. B. 16:9 oder 2.39:1');
    if (sen && !parseArOk(sen)) return alert('AR(sensor)‑Format: z. B. 16:9');
    // Duplikatprüfung gegen offizielle DB
    const officialFormats = Object.keys(cameraDatabase?.[man]?.models?.[mod]?.formats || {});
    const existsOfficial = officialFormats.some(f => String(f).toLowerCase() === fmt.toLowerCase());
    // Duplikatprüfung gegen Ergänzungen aller Nutzer
    const all = collectAllCamAdditions();
    const existsUser = all.some(x => (x.manufacturer || '').toLowerCase() === man.toLowerCase() && (x.model || '').toLowerCase() === mod.toLowerCase() && (x.format || '').toLowerCase() === fmt.toLowerCase());
    if (existsOfficial || existsUser) {
      alert('Duplikat gefunden (offizielle DB oder Ergänzung eines Nutzers). Eintrag wurde nicht hinzugefügt, es wird nichts überschrieben.');
      return;
    }
    const entry = { manufacturer: man, model: mod, format: fmt, sensorMm: mm, pixelRes: px, recorded: rec, sensor: sen, createdAt: Date.now(), ownerId: currentUser?.id ?? 'guest', ownerName: currentUser?.name ?? 'Gast' };
    const next = [...additions, entry];
    setAdditions(next);
    saveAdditionsForUser(currentUser, next);
    setFormatName(''); setSensorMm(''); setPixelRes(''); setArRecorded(''); setArSensor('');
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

  const clearAll = () => { setAdditions([]); saveAdditionsForUser(currentUser, []); };

  const exportJson = () => {
    const payload = additions.map((a) => ({
      manufacturer: a.manufacturer,
      model: a.model,
      format: a.format,
      sensorSize: a.sensorMm,
      pixelResolution: a.pixelRes,
      aspectRatio: { recorded: a.recorded, sensor: a.sensor || a.recorded },
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
      const items = Array.isArray(payload) ? payload : (payload.items || payload.formats || []);
      if (!Array.isArray(items)) throw new Error('Ungültiges JSON-Format (Array erwartet).');

      const all = collectAllCamAdditions();
      const added = [];
      let skipped = 0;

      for (const it of items) {
        const man = String(it.manufacturer || '').trim();
        const mod = String(it.model || '').trim();
        const fmt = String(it.format || '').trim();
        const mm = String(it.sensorSize || it.sensorMm || '').trim();
        const px = String(it.pixelResolution || it.pixelRes || '').trim();
        const rec = String((it.aspectRatio && it.aspectRatio.recorded) || it.recorded || '').trim();
        const sen = String((it.aspectRatio && it.aspectRatio.sensor) || it.sensor || rec || '').trim();
        if (!man || !mod || !fmt) { skipped++; continue; }
        // Duplikatprüfung gegen offizielle DB
        const officialFormats = Object.keys(cameraDatabase?.[man]?.models?.[mod]?.formats || {});
        const existsOfficial = officialFormats.some(f => String(f).toLowerCase() === fmt.toLowerCase());
        // Duplikatprüfung gegen Ergänzungen aller Nutzer
        const existsUser = all.some(x => (x.manufacturer || '').toLowerCase() === man.toLowerCase() && (x.model || '').toLowerCase() === mod.toLowerCase() && (x.format || '').toLowerCase() === fmt.toLowerCase());
        if (existsOfficial || existsUser) { skipped++; continue; }
        added.push({ manufacturer: man, model: mod, format: fmt, sensorMm: mm, pixelRes: px, recorded: rec, sensor: sen || rec, createdAt: Date.now(), ownerId: currentUser?.id ?? 'guest', ownerName: currentUser?.name ?? 'Gast' });
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
  const pxRatio = toPxRatio(pixelRes);
  const arRatio = toArRatio(arRecorded);
  const approx = (pxRatio && arRatio) ? Math.abs(parseFloat(pxRatio) - parseFloat(arRatio)) <= 0.03 : null;

  const rows = viewAll ? collectAllCamAdditions() : additions;

  return (
    <div className="page" style={{ padding: 16 }}>
      <div className="header" style={{ marginBottom: 12 }}>
        <div className="header-content">
          <h1>Kamera/Sensor‑Datenbank (Editor)</h1>
          <p className="subtitle">Füge Formate mit mm, Pixel und AR hinzu. Keine Überschreibungen: Duplikate werden blockiert.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 12, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Hersteller</label>
            <input list="cam-manufacturers" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
            <datalist id="cam-manufacturers">
              {manufacturers.map((m) => (<option key={m} value={m} />))}
            </datalist>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Modell</label>
            <input list="cam-models" value={model} onChange={(e) => setModel(e.target.value)} placeholder="z. B. ALEXA 35" />
            <datalist id="cam-models">
              {models.map((m) => (<option key={m} value={m} />))}
            </datalist>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Formatname</label>
            <input value={formatName} onChange={(e) => setFormatName(e.target.value)} placeholder="z. B. 4.6K 16:9" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Sensorgröße (mm) <span title={t('help.sensorMm', 'Format: 28.0 x 15.7 mm')} aria-label={t('help.info', 'Info')} style={{ verticalAlign: 'middle', marginLeft: 6 }}><Icon name="info" size={16} /></span></label>
            <input value={sensorMm} onChange={(e) => setSensorMm(e.target.value)} placeholder="z. B. 28.0 x 15.7 mm" />
            <div style={{ fontSize: 12, color: parseMmOk(sensorMm) || !sensorMm ? 'var(--muted-color)' : 'var(--color-danger)' }}>
              {sensorMm ? (parseMmOk(sensorMm) ? 'Format ok' : 'Format: 28.0 x 15.7 mm') : 'optional'}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>Pixelauflösung <span title={t('help.pixelRes', 'Format: 4608 x 2592')} aria-label={t('help.info', 'Info')} style={{ verticalAlign: 'middle', marginLeft: 6 }}><Icon name="info" size={16} /></span></label>
            <input value={pixelRes} onChange={(e) => setPixelRes(e.target.value)} placeholder="z. B. 4608 x 2592" />
            <div style={{ fontSize: 12, color: parsePxOk(pixelRes) || !pixelRes ? 'var(--muted-color)' : 'var(--color-danger)' }}>
              {pixelRes ? (parsePxOk(pixelRes) ? `AR(px) ≈ ${toPxRatio(pixelRes)}:1` : 'Format: 4608 x 2592') : 'optional'}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>AR (recorded) <span title={t('help.arRecorded', 'Format: 16:9 / 2.39:1')} aria-label={t('help.info', 'Info')} style={{ verticalAlign: 'middle', marginLeft: 6 }}><Icon name="info" size={16} /></span></label>
            <input value={arRecorded} onChange={(e) => setArRecorded(e.target.value)} placeholder="z. B. 16:9 oder 2.39:1" />
            <div style={{ fontSize: 12, color: parseArOk(arRecorded) || !arRecorded ? 'var(--muted-color)' : 'var(--color-danger)' }}>
              {arRecorded ? (parseArOk(arRecorded) ? `AR(rec) ≈ ${toArRatio(arRecorded)}:1` : 'Format: 16:9 / 2.39:1') : 'optional'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginTop: 8 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4 }}>AR (sensor) <span title={t('help.arSensor', 'Optional, z. B. 16:9')} aria-label={t('help.info', 'Info')} style={{ verticalAlign: 'middle', marginLeft: 6 }}><Icon name="info" size={16} /></span></label>
            <input value={arSensor} onChange={(e) => setArSensor(e.target.value)} placeholder="optional, z. B. 16:9" />
          </div>
        </div>

        {approx != null && (
          <div style={{ marginTop: 8, fontSize: 12, color: approx ? 'var(--muted-color)' : 'var(--color-danger)' }}>
            {approx ? 'AR (recorded) ≈ AR (px) innerhalb 0.03' : 'AR (recorded) ≠ AR (px) (>|0.03|)'}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <button onClick={addEntry} aria-label={t('editor.addEntry', 'Eintrag hinzufügen')} title={t('editor.addEntry', 'Eintrag hinzufügen')}>Hinzufügen</button>
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>Ergänzungen</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setViewAll(false)} aria-pressed={!viewAll} aria-label={t('editor.viewMine', 'Nur eigene Ergänzungen anzeigen')} title={t('editor.viewMine', 'Nur eigene Ergänzungen anzeigen')}>Meine</button>
            <button onClick={() => setViewAll(true)} aria-pressed={viewAll} aria-label={t('editor.viewAll', 'Alle Ergänzungen anzeigen')} title={t('editor.viewAll', 'Alle Ergänzungen anzeigen')}>Alle</button>
            <button onClick={exportJson} aria-label={t('editor.exportJsonMine', 'Eigene Ergänzungen als JSON kopieren')} title={t('editor.exportJsonMine', 'Eigene Ergänzungen als JSON kopieren')}>Export JSON (Meine)</button>
            <button onClick={importJson} title={t('editor.importJsonHintCams', 'JSON-Datei importieren: [{ manufacturer, camera, sensorWidth, sensorHeight }] oder { items/cameras: [...] }')} aria-label={t('editor.importJsonMine', 'JSON importieren (eigene Ergänzungen)')}>Import JSON (Meine)</button>
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
              <th style={{ textAlign: 'left', padding: 8 }}>Modell</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Format</th>
              <th style={{ textAlign: 'left', padding: 8 }}>mm</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Pixel</th>
              <th style={{ textAlign: 'left', padding: 8 }}>AR (rec)</th>
              <th style={{ textAlign: 'left', padding: 8 }}>AR (sensor)</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Besitzer</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a, idx) => (
              <tr key={idx}>
                <td style={{ padding: 8 }}>{a.manufacturer}</td>
                <td style={{ padding: 8 }}>{a.model}</td>
                <td style={{ padding: 8 }}>{a.format}</td>
                <td style={{ padding: 8 }}>{a.sensorMm || '—'}</td>
                <td style={{ padding: 8 }}>{a.pixelRes || '—'}</td>
                <td style={{ padding: 8 }}>{a.recorded || '—'}</td>
                <td style={{ padding: 8 }}>{a.sensor || a.recorded || '—'}</td>
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
                <td colSpan={9} style={{ padding: 8, color: 'var(--muted-color)' }}>{viewAll ? 'Keine Ergänzungen vorhanden.' : 'Noch keine eigenen Formate hinzugefügt.'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <input type="file" accept="application/json" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} />
      <details style={{ marginTop: 12 }}>
        <summary>Import‑Hilfe: JSON‑Format</summary>
        <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--muted-color)' }}>
          <div>Unterstützt: Array oder Objekt mit Schlüssel <code>items</code>/<code>cameras</code>.</div>
          <pre style={{ background: 'var(--code-bg, #f6f8fa)', padding: 8, borderRadius: 6 }}>{`[
  { "manufacturer": "RED", "camera": "Komodo", "sensorWidth": 27.03, "sensorHeight": 14.26 },
  { "manufacturer": "Sony", "name": "A7S III", "width": 35.6, "height": 23.8 }
]`}</pre>
          <div>Duplikate gegen offizielle Datenbank und Ergänzungen anderer Nutzer werden übersprungen.</div>
          <div>Importierte Einträge werden dem aktuellen Nutzer zugeordnet.</div>
        </div>
      </details>
    </div>
  );
};

export default CameraSensorEditor;