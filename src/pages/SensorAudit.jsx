import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getManufacturers,
  getModelsByManufacturer,
  getFormatsByModel,
  getSensorSizeByFormat,
  getPixelResolutionByFormat,
  getMaxSensorDimsForModel,
  getMaxPixelResolutionForModel,
} from '../data/cameraDatabase';
import { parseSensorSize } from '../utils/fovCalculator';

const parsePixels = (pxString) => {
  if (!pxString || typeof pxString !== 'string') return null;
  const m = pxString.match(/(\d+)\s*x\s*(\d+)/i);
  if (!m) return null;
  const w = parseInt(m[1], 10);
  const h = parseInt(m[2], 10);
  if (!isFinite(w) || !isFinite(h)) return null;
  return { width: w, height: h };
};

const closeRel = (a, b, tol = 0.02) => {
  if (a == null || b == null) return false;
  const denom = Math.max(Math.abs(a), 1e-6);
  return Math.abs(a - b) / denom <= tol;
};

const SensorAudit = () => {
  const { t } = useLanguage();

  const rows = useMemo(() => {
    const result = [];
    const manufacturers = getManufacturers();
    for (const man of manufacturers) {
      const models = getModelsByManufacturer(man) || [];
      for (const model of models) {
        const baseMm = getMaxSensorDimsForModel(man, model);
        const basePx = getMaxPixelResolutionForModel(man, model);
        const formats = getFormatsByModel(man, model) || [];
        for (const fmt of formats) {
          const pxStr = getPixelResolutionByFormat(man, model, fmt);
          const px = parsePixels(pxStr);
          const mmStr = getSensorSizeByFormat(man, model, fmt);
          const mm = parseSensorSize(mmStr);

          const flags = { mmMissing: false, fullSensor: false, mismatch: false, suspiciousEqualFull: false };
          let expected = null;
          if (baseMm && basePx && px) {
            const pitchW = baseMm.width / basePx.width;
            const pitchH = baseMm.height / basePx.height;
            expected = {
              width: px.width * pitchW,
              height: px.height * pitchH,
            };
            const pxArea = px.width * px.height;
            const baseArea = basePx.width * basePx.height;
            const isFull = baseArea > 0 && Math.abs(pxArea - baseArea) / baseArea < 0.01;
            flags.fullSensor = !!isFull;
            if (!isFull) {
              // Für Crops sollte mm nahe an expected liegen
              if (mm && expected) {
                const wOk = closeRel(mm.width, expected.width, 0.02);
                const hOk = closeRel(mm.height, expected.height, 0.02);
                if (!(wOk && hOk)) flags.mismatch = true;
                // Verdächtig: mm gleich volle Sensorgröße trotz kleinerer px
                if (closeRel(mm.width, baseMm.width, 0.01) && closeRel(mm.height, baseMm.height, 0.01)) {
                  flags.suspiciousEqualFull = true;
                }
              } else if (!mm) {
                flags.mmMissing = true;
              }
            } else {
              // Full Sensor: mm sollte dem vollen Sensor entsprechen
              if (mm && baseMm) {
                const wOk = closeRel(mm.width, baseMm.width, 0.02);
                const hOk = closeRel(mm.height, baseMm.height, 0.02);
                if (!(wOk && hOk)) flags.mismatch = true;
              } else if (!mm) {
                flags.mmMissing = true;
              }
            }
          } else if (!mm) {
            flags.mmMissing = true;
          }

          result.push({ manufacturer: man, model, format: fmt, baseMm, basePx, formatPx: px, mmStr, mm, expected, flags });
        }
      }
    }
    return result;
  }, []);

  const summary = useMemo(() => {
    const total = rows.length;
    const issues = rows.filter(r => r.flags.mmMissing || r.flags.mismatch || r.flags.suspiciousEqualFull).length;
    const byManufacturer = {};
    for (const r of rows) {
      const key = r.manufacturer;
      byManufacturer[key] = byManufacturer[key] || { total: 0, issues: 0 };
      byManufacturer[key].total += 1;
      if (r.flags.mmMissing || r.flags.mismatch || r.flags.suspiciousEqualFull) byManufacturer[key].issues += 1;
    }
    return { total, issues, byManufacturer };
  }, [rows]);

  return (
    <div className="page" style={{ padding: 16 }}>
      <div className="header" style={{ marginBottom: 12 }}>
        <div className="header-content">
          <h1>Sensor/Format Audit</h1>
          <p className="subtitle">Überprüft mm-Berechnungen für alle Kameras und Formate.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div><strong>Gesamt:</strong> {summary.total}</div>
          <div><strong>Auffällige Einträge:</strong> {summary.issues}</div>
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
              <th style={{ textAlign: 'left', padding: 8 }}>Modell</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Format</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Pixel (Format)</th>
              <th style={{ textAlign: 'left', padding: 8 }}>mm (berechnet)</th>
              <th style={{ textAlign: 'left', padding: 8 }}>mm (erwartet)</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Sensor (mm)</th>
              <th style={{ textAlign: 'left', padding: 8 }}>{t('common.notes', 'Hinweise')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const warn = r.flags.mmMissing || r.flags.mismatch || r.flags.suspiciousEqualFull;
              const bg = warn ? 'rgba(231, 76, 60, 0.12)' : 'transparent';
              return (
                <tr key={idx} style={{ background: bg }}>
                  <td style={{ padding: 8 }}>{r.manufacturer}</td>
                  <td style={{ padding: 8 }}>{r.model}</td>
                  <td style={{ padding: 8 }}>{r.format}</td>
                  <td style={{ padding: 8 }}>{r.formatPx ? `${r.formatPx.width} x ${r.formatPx.height}` : (getPixelResolutionByFormat(r.manufacturer, r.model, r.format) || 'N/V')}</td>
                  <td style={{ padding: 8 }}>{r.mm ? `${r.mm.width.toFixed(2)} x ${r.mm.height.toFixed(2)} mm` : (r.mmStr || 'N/V')}</td>
                  <td style={{ padding: 8 }}>{r.expected ? `${r.expected.width.toFixed(2)} x ${r.expected.height.toFixed(2)} mm` : 'N/V'}</td>
                  <td style={{ padding: 8 }}>{r.baseMm ? `${r.baseMm.width.toFixed(2)} x ${r.baseMm.height.toFixed(2)} mm` : 'N/V'}</td>
                  <td style={{ padding: 8, color: warn ? 'var(--color-danger, #e74c3c)' : 'var(--muted-color)' }}>
                    {r.flags.mmMissing && <span>mm fehlt</span>}
                    {r.flags.mismatch && <span>{r.flags.mmMissing ? ' • ' : ''}mm weicht stark ab</span>}
                    {r.flags.suspiciousEqualFull && <span>{(r.flags.mmMissing || r.flags.mismatch) ? ' • ' : ''}mm = voller Sensor trotz Crop</span>}
                    {!warn && <span>OK</span>}
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

export default SensorAudit;