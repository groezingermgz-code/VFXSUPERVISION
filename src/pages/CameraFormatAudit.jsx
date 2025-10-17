import React, { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getManufacturers,
  getModelsByManufacturer,
  getFormatsByModel,
  getPixelResolutionByFormat,
  getSensorSizeByFormat,
  getAspectRatiosByFormat,
  getMaxSensorDimsForModel,
  getMaxPixelResolutionForModel,
  getCodecsByModel,
  getColorSpacesByModel,
} from '../data/cameraDatabase';
import { parseSensorSize as parseMm } from '../utils/fovCalculator';

const parsePixels = (pxString) => {
  if (!pxString || typeof pxString !== 'string') return null;
  const m = pxString.match(/(\d+)\s*x\s*(\d+)/i);
  if (!m) return null;
  const w = parseInt(m[1], 10);
  const h = parseInt(m[2], 10);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  return { width: w, height: h };
};

const closeRel = (a, b, tol = 0.02) => {
  if (a == null || b == null) return false;
  const denom = Math.max(Math.abs(a), 1e-6);
  return Math.abs(a - b) / denom <= tol;
};

const toDecimalAR = (w, h, digits = 2) => {
  if (!w || !h) return null;
  const r = w / h;
  if (!isFinite(r) || r <= 0) return null;
  return `${r.toFixed(digits)}:1`;
};

const parseARtoDecimal = (arString, digits = 2) => {
  if (!arString || typeof arString !== 'string') return null;
  const m = arString.match(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const a = parseFloat(m[1]);
  const b = parseFloat(m[2]);
  if (!b || !isFinite(a / b) || a <= 0 || b <= 0) return null;
  return `${(a / b).toFixed(digits)}:1`;
};

// New: numeric AR helpers for tolerant comparison
const toNumericAR = (w, h) => {
  if (!w || !h) return null;
  const r = w / h;
  return isFinite(r) && r > 0 ? r : null;
};

const parseARtoNumber = (arString) => {
  if (!arString || typeof arString !== 'string') return null;
  const m = arString.match(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const a = parseFloat(m[1]);
  const b = parseFloat(m[2]);
  const r = a / b;
  return b && isFinite(r) && a > 0 && b > 0 ? r : null;
};

const CameraFormatAudit = () => {
  const { t } = useLanguage();

  const rows = useMemo(() => {
    const out = [];
    const manufacturers = getManufacturers();
    for (const man of manufacturers) {
      const models = getModelsByManufacturer(man) || [];
      for (const model of models) {
        const baseMm = getMaxSensorDimsForModel(man, model);
        const basePx = getMaxPixelResolutionForModel(man, model);
        const codecs = getCodecsByModel(man, model) || [];
        const colorSpaces = getColorSpacesByModel(man, model) || [];
        const formats = getFormatsByModel(man, model) || [];
        for (const fmt of formats) {
          const pxStr = getPixelResolutionByFormat(man, model, fmt);
          const px = parsePixels(pxStr);
          const mmStr = getSensorSizeByFormat(man, model, fmt);
          const mm = parseMm(mmStr);
          const ar = getAspectRatiosByFormat(man, model, fmt);

          const flags = {
            pxMissing: false,
            mmMissing: false,
            mmMismatch: false,
            arRecordedMismatch: false,
            arRecordedApprox: false,
          };

          let expected = null;
          if (baseMm && basePx && px) {
            const pitchW = baseMm.width / basePx.width;
            const pitchH = baseMm.height / basePx.height;
            expected = {
              width: px.width * pitchW,
              height: px.height * pitchH,
            };
            if (mm) {
              const wOk = closeRel(mm.width, expected.width, 0.02);
              const hOk = closeRel(mm.height, expected.height, 0.02);
              if (!(wOk && hOk)) flags.mmMismatch = true;
            } else {
              flags.mmMissing = true;
            }
          } else {
            if (!px) flags.pxMissing = true;
            if (!mm) flags.mmMissing = true;
          }

          // AR‑Prüfung: aufgezeichnetes AR vs. Pixel‑AR (toleranter, numerischer Vergleich)
          const pxNum = px ? toNumericAR(px.width, px.height) : null;
          const recNum = parseARtoNumber(ar?.recorded);
          const pxDec = px ? toDecimalAR(px.width, px.height) : null;
          const recDec = parseARtoDecimal(ar?.recorded);
          const arTol = 0.03; // absolute tolerance (ratio units)
          if (pxNum != null && recNum != null) {
            const approx = Math.abs(pxNum - recNum) <= arTol;
            if (approx) {
              flags.arRecordedApprox = true;
            } else {
              flags.arRecordedMismatch = true;
            }
          }

          out.push({
            manufacturer: man,
            model,
            format: fmt,
            pxStr,
            px,
            mmStr,
            mm,
            expected,
            ar,
            pxDec,
            recDec,
            codecs,
            colorSpaces,
            flags,
          });
        }
      }
    }
    return out;
  }, []);

  const summary = useMemo(() => {
    const total = rows.length;
    const issues = rows.filter(r => r.flags.pxMissing || r.flags.mmMissing || r.flags.mmMismatch || r.flags.arRecordedMismatch).length;
    const byManufacturer = {};
    for (const r of rows) {
      const key = r.manufacturer;
      byManufacturer[key] = byManufacturer[key] || { total: 0, issues: 0 };
      byManufacturer[key].total += 1;
      if (r.flags.pxMissing || r.flags.mmMissing || r.flags.mmMismatch || r.flags.arRecordedMismatch) byManufacturer[key].issues += 1;
    }
    return { total, issues, byManufacturer };
  }, [rows]);

  return (
    <div className="page" style={{ padding: 16 }}>
      <div className="header" style={{ marginBottom: 12 }}>
        <div className="header-content">
          <h1>Kamera/Format Datenbank (Audit)</h1>
          <p className="subtitle">Übersicht und Prüfungen für Formate, Pixel, mm, Aspect Ratios, Codecs und Farbräume.</p>
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
              <th style={{ textAlign: 'left', padding: 8 }}>Pixel</th>
              <th style={{ textAlign: 'left', padding: 8 }}>mm (berechnet)</th>
              <th style={{ textAlign: 'left', padding: 8 }}>mm (erwartet)</th>
              <th style={{ textAlign: 'left', padding: 8 }}>AR (px)</th>
              <th style={{ textAlign: 'left', padding: 8 }}>AR (recorded)</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Codecs</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Farbräume</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Hinweise</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const warn = r.flags.pxMissing || r.flags.mmMissing || r.flags.mmMismatch || r.flags.arRecordedMismatch;
              const bg = warn ? 'rgba(231, 76, 60, 0.12)' : 'transparent';
              const codecsStr = (r.codecs && r.codecs.length) ? r.codecs.join(', ') : 'N/V';
              const csStr = (r.colorSpaces && r.colorSpaces.length) ? r.colorSpaces.join(', ') : 'N/V';
              return (
                <tr key={idx} style={{ background: bg }}>
                  <td style={{ padding: 8 }}>{r.manufacturer}</td>
                  <td style={{ padding: 8 }}>{r.model}</td>
                  <td style={{ padding: 8 }}>{r.format}</td>
                  <td style={{ padding: 8 }}>{r.px ? `${r.px.width} x ${r.px.height}` : (r.pxStr || 'N/V')}</td>
                  <td style={{ padding: 8 }}>{r.mm ? `${r.mm.width.toFixed(2)} x ${r.mm.height.toFixed(2)} mm` : (r.mmStr || 'N/V')}</td>
                  <td style={{ padding: 8 }}>{r.expected ? `${r.expected.width.toFixed(2)} x ${r.expected.height.toFixed(2)} mm` : 'N/V'}</td>
                  <td style={{ padding: 8 }}>{r.pxDec || 'N/V'}</td>
                  <td style={{ padding: 8 }}>{r.recDec || (r.ar?.recorded || 'N/V')}</td>
                  <td style={{ padding: 8 }}>{codecsStr}</td>
                  <td style={{ padding: 8 }}>{csStr}</td>
                  <td style={{ padding: 8, color: warn ? 'var(--color-danger, #e74c3c)' : 'var(--muted-color)' }}>
                    {r.flags.pxMissing && <span>Pixel fehlt</span>}
                    {r.flags.mmMissing && <span>{r.flags.pxMissing ? ' • ' : ''}mm fehlt</span>}
                    {r.flags.mmMismatch && <span>{(r.flags.pxMissing || r.flags.mmMissing) ? ' • ' : ''}mm weicht stark ab</span>}
                    {r.flags.arRecordedMismatch && <span>{(r.flags.pxMissing || r.flags.mmMissing || r.flags.mmMismatch) ? ' • ' : ''}AR (recorded) ≠ AR (px)</span>}
                    {!warn && <span>{r.flags.arRecordedApprox ? 'AR (recorded) ≈ AR (px)' : 'OK'}</span>}
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

export default CameraFormatAudit;