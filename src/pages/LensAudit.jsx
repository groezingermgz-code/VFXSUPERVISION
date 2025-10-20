import React, { useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { lensDatabase, getLensMeta } from '../data/lensDatabase';

const normalize = (s) => (s || '').trim().toLowerCase();

const LensAudit = () => {
  const { t } = useLanguage();
  const [onlyLds, setOnlyLds] = useState(false);
  const [onlyIssues, setOnlyIssues] = useState(false);
  const [manufacturerFilter, setManufacturerFilter] = useState('');

  const rows = useMemo(() => {
    const out = [];
    const manufacturers = Object.keys(lensDatabase || {}).sort();
    for (const man of manufacturers) {
      const lenses = lensDatabase[man]?.lenses || [];
      const seen = new Map();
      for (const name of lenses) {
        const n = normalize(name);
        const meta = getLensMeta(man, name);
        const flags = {
          duplicate: false,
          missingMm: false,
          shortName: false,
        };
        if (seen.has(n)) {
          flags.duplicate = true;
        }
        seen.set(n, true);
        // Nutze Meta-Daten aus der Datenbank statt einfacher Regex
        flags.missingMm = !(meta && (meta.minMm != null || meta.maxMm != null));
        if ((name || '').length < 6) flags.shortName = true;
        out.push({ manufacturer: man, name, meta, flags });
      }
    }
    return out;
  }, []);

  const manufacturersList = useMemo(() => Array.from(new Set(rows.map(r => r.manufacturer))).sort(), [rows]);

  const filteredRows = useMemo(() => {
    let base = rows;
    if (manufacturerFilter) base = base.filter(r => r.manufacturer === manufacturerFilter);
    if (onlyLds) base = base.filter(r => !!r.meta?.isLds);
    if (onlyIssues) base = base.filter(r => r.flags.duplicate || r.flags.missingMm || r.flags.shortName);
    return base;
  }, [rows, manufacturerFilter, onlyLds, onlyIssues]);

  const summary = useMemo(() => {
    const base = filteredRows;
    const total = base.length;
    const issues = base.filter(r => r.flags.duplicate || r.flags.missingMm || r.flags.shortName).length;
    const byManufacturer = {};
    for (const r of base) {
      const key = r.manufacturer;
      byManufacturer[key] = byManufacturer[key] || { total: 0, issues: 0 };
      byManufacturer[key].total += 1;
      if (r.flags.duplicate || r.flags.missingMm || r.flags.shortName) byManufacturer[key].issues += 1;
    }
    return { total, issues, byManufacturer };
  }, [filteredRows]);

  return (
    <div className="page" style={{ padding: 16 }}>
      <div className="header" style={{ marginBottom: 12 }}>
        <div className="header-content">
          <h1>Objektiv‑Datenbank (Audit)</h1>
          <p className="subtitle">Überprüft Linsennamen auf Duplikate und fehlende mm‑Angaben.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div><strong>Gesamt:</strong> {summary.total}</div>
          <div><strong>Auffällige Einträge:</strong> {summary.issues}</div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Hersteller:
              <select value={manufacturerFilter} onChange={(e) => setManufacturerFilter(e.target.value)}>
                <option value="">Alle Hersteller</option>
                {manufacturersList.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </label>
          </div>

          <label style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={onlyLds} onChange={(e) => setOnlyLds(e.target.checked)} />
            Nur LDS
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} />
            Nur Auffällige
          </label>
        </div>
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {Object.keys(summary.byManufacturer).sort().map((m) => (
            <div key={m} style={{ padding: 8, border: '1px solid var(--border-color)', borderRadius: 6 }}>
              <div style={{ fontWeight: 600 }}>{m}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-color)' }}>Total: {summary.byManufacturer[m].total}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-color)' }}>Issues: {summary.byManufacturer[m].issues}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Hersteller</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Objektiv</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Typ</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Brennweite (mm)</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Hinweise</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, idx) => {
              const warn = r.flags.duplicate || r.flags.missingMm || r.flags.shortName;
              const bg = warn ? 'rgba(231, 76, 60, 0.12)' : 'transparent';
              return (
                <tr key={idx} style={{ background: bg }}>
                  <td style={{ padding: 8 }}>{r.manufacturer}</td>
                  <td style={{ padding: 8 }}>{r.name}</td>
                  <td style={{ padding: 8 }}>{r.meta?.type || (r.meta?.isZoom ? 'Zoom' : (r.meta?.minMm ? 'Prime' : '—'))}</td>
                  <td style={{ padding: 8 }}>{r.meta?.focal || '—'}</td>
                  <td style={{ padding: 8, color: warn ? 'var(--color-danger, #e74c3c)' : 'var(--muted-color)' }}>
                    {r.flags.duplicate && <span>Duplikat</span>}
                    {r.flags.missingMm && <span>{r.flags.duplicate ? ' • ' : ''}mm‑Angabe fehlt</span>}
                    {r.flags.shortName && <span>{(r.flags.duplicate || r.flags.missingMm) ? ' • ' : ''}Name sehr kurz</span>}
                    {r.meta?.isLds && <span>{warn ? ' • ' : ''}LDS</span>}
                    {!warn && !r.meta?.isLds && <span>OK</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LensAudit;