import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { lensDatabase, getLensMeta } from '../data/lensDatabase';

const LdsLenses = () => {
  const { t } = useLanguage();

  const rows = useMemo(() => {
    const out = [];
    const manufacturers = Object.keys(lensDatabase || {}).sort();
    for (const man of manufacturers) {
      const lenses = lensDatabase[man]?.lenses || [];
      for (const name of lenses) {
        const meta = getLensMeta(man, name);
        if (meta?.isLds) {
          out.push({ manufacturer: man, name, meta });
        }
      }
    }
    return out;
  }, []);

  const summary = useMemo(() => {
    const total = rows.length;
    const byManufacturer = {};
    for (const r of rows) {
      const key = r.manufacturer;
      byManufacturer[key] = byManufacturer[key] || { total: 0 };
      byManufacturer[key].total += 1;
    }
    return { total, byManufacturer };
  }, [rows]);

  const manufacturersSorted = useMemo(() => Object.keys(summary.byManufacturer).sort(), [summary]);

  return (
    <div className="page" style={{ padding: 16 }}>
      <div className="header" style={{ marginBottom: 12 }}>
        <div className="header-content">
          <h1>LDS‑Objektive</h1>
          <p className="subtitle">Alle Objektive mit „LDS“ Kennzeichnung aus der Datenbank.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div><strong>Gesamt:</strong> {summary.total}</div>
          {summary.total === 0 && (
            <div style={{ marginLeft: 'auto' }}>Keine Objektive mit LDS gefunden.</div>
          )}
        </div>
      </div>

      {summary.total > 0 && (
        <div className="card" style={{ padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {manufacturersSorted.map((m) => (
              <div key={m} style={{ padding: 8, border: '1px solid var(--border-color)', borderRadius: 6 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{m}</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>Anzahl: {summary.byManufacturer[m].total}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {rows.filter(r => r.manufacturer === m).map((r) => (
                    <li key={`${r.manufacturer}-${r.name}`} style={{ padding: '4px 0', borderBottom: '1px dashed var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span>{r.name}</span>
                        <span style={{ fontSize: 12, opacity: 0.8 }}>{r.meta?.focal || ''}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LdsLenses;