import React, { useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './SensorPreview.css';
import Icon from '../components/Icon';
import {
  cameraDatabase,
  getManufacturers,
  getModelsByManufacturer,
  getFormatsByModel,
  getSensorSizeByFormat,
  getPixelResolutionByFormat,
  getAspectRatiosByFormat,
  calculateSensorDiagonal,
} from '../data/cameraDatabase';

const parseMm = (mmString) => {
  if (!mmString || typeof mmString !== 'string') return null;
  if (mmString.toLowerCase().includes('nicht verfügbar') || mmString.toLowerCase().includes('not available')) return null;
  const match = mmString.match(/(\d+\.\d+|\d+)\s*x\s*(\d+\.\d+|\d+)\s*mm/i);
  if (!match) return null;
  const width = parseFloat(match[1]);
  const height = parseFloat(match[2]);
  if (isNaN(width) || isNaN(height)) return null;
  return { width, height };
};

const parsePixels = (pxString) => {
  if (!pxString || typeof pxString !== 'string') return null;
  const match = pxString.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) return null;
  const width = parseInt(match[1], 10);
  const height = parseInt(match[2], 10);
  if (isNaN(width) || isNaN(height)) return null;
  return { width, height };
};

// (gcd ist weiter unten bereits definiert; Doppeldefinition entfernt)

// Rough text width estimator for SVG labels (monospace-ish)
const estimateTextWidth = (text, fontSize = 12) => {
  if (!text) return 0;
  const avgCharWidth = fontSize * 0.6; // heuristic
  return text.length * avgCharWidth;
};

const gcd = (a, b) => {
  a = Math.abs(a || 0);
  b = Math.abs(b || 0);
  if (!a && !b) return 1;
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
};

const toDecimalAR = (width, height, digits = 2) => {
  if (!width || !height) return null;
  const ratio = width / height;
  if (!isFinite(ratio) || ratio <= 0) return null;
  return `${ratio.toFixed(digits)}:1`;
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

const getMaxSensorDimsForModel = (manufacturer, model) => {
  try {
    const camera = cameraDatabase?.[manufacturer]?.models?.[model];
    if (!camera || !camera.sensorSizes) return null;
    let best = null;
    for (const key of Object.keys(camera.sensorSizes)) {
      const dims = parseMm(camera.sensorSizes[key]);
      if (!dims) continue;
      const area = dims.width * dims.height;
      if (!best || area > best.area) best = { ...dims, area };
    }
    return best ? { width: best.width, height: best.height } : null;
  } catch {
    return null;
  }
};

const getMaxPixelResolutionForModel = (manufacturer, model) => {
  try {
    const camera = cameraDatabase?.[manufacturer]?.models?.[model];
    if (!camera || !camera.pixelResolutions) return null;
    let best = null;
    for (const key of Object.keys(camera.pixelResolutions)) {
      const dims = parsePixels(camera.pixelResolutions[key]);
      if (!dims) continue;
      const area = dims.width * dims.height;
      if (!best || area > best.area) best = { ...dims, area };
    }
    return best ? { width: best.width, height: best.height } : null;
  } catch {
    return null;
  }
};

const SensorPreview = () => {
  const { t } = useLanguage();
  const manufacturers = useMemo(() => getManufacturers(), []);

  // Preselect a sensible default for quick preview
  const [manufacturer, setManufacturer] = useState(manufacturers[0] || '');
  const models = useMemo(() => (manufacturer ? getModelsByManufacturer(manufacturer) : []), [manufacturer]);
  const [model, setModel] = useState(models[0] || '');
  const formats = useMemo(() => (manufacturer && model ? getFormatsByModel(manufacturer, model) : []), [manufacturer, model]);
  const [format, setFormat] = useState(formats[0] || '');

  // Update dependent selections when upstream changes
  React.useEffect(() => {
    const ms = getModelsByManufacturer(manufacturer);
    setModel(ms[0] || '');
  }, [manufacturer]);

  React.useEffect(() => {
    const fs = manufacturer && model ? getFormatsByModel(manufacturer, model) : [];
    setFormat(fs[0] || '');
  }, [manufacturer, model]);

  const fullDims = useMemo(() => {
    return manufacturer && model ? getMaxSensorDimsForModel(manufacturer, model) : null;
  }, [manufacturer, model]);

  const formatSizeString = useMemo(() => {
    return manufacturer && model && format ? getSensorSizeByFormat(manufacturer, model, format) : 'Nicht verfügbar';
  }, [manufacturer, model, format]);

  const formatDims = useMemo(() => parseMm(formatSizeString), [formatSizeString]);

  const pxWidth = 440; // fixed SVG width for visualization
  const scale = fullDims && fullDims.width ? pxWidth / fullDims.width : 1;
  const fullPx = fullDims ? { w: Math.round(fullDims.width * scale), h: Math.round(fullDims.height * scale) } : { w: pxWidth, h: 280 };
  

  const pixelResolution = useMemo(() => {
    return manufacturer && model && format ? getPixelResolutionByFormat(manufacturer, model, format) : 'Nicht verfügbar';
  }, [manufacturer, model, format]);

  const aspectRatios = useMemo(() => {
    return manufacturer && model && format ? getAspectRatiosByFormat(manufacturer, model, format) : { recorded: 'Nicht verfügbar', sensor: 'Nicht verfügbar' };
  }, [manufacturer, model, format]);

  const sensorPxDims = useMemo(() => {
    return manufacturer && model ? getMaxPixelResolutionForModel(manufacturer, model) : null;
  }, [manufacturer, model]);

  const formatPxDims = useMemo(() => parsePixels(pixelResolution), [pixelResolution]);

  // Konstantes Sensor-Bildverhältnis (größter mm-Sensorwert)
  const sensorAspectRatioStringConstant = useMemo(() => {
    if (!manufacturer || !model) return 'Nicht verfügbar';
    // Primär: aus größter mm-Sensorfläche ableiten
    if (fullDims && fullDims.width && fullDims.height) {
      // mm sind Dezimalwerte – zur stabilen Verhältnisbildung auf ganze Werte runden
      const w = Math.round(fullDims.width);
      const h = Math.round(fullDims.height);
      const g = gcd(w, h);
      const rw = Math.round(w / g);
      const rh = Math.round(h / g);
      if (rw > 0 && rh > 0) return `${rw}:${rh}`;
    }
    // Fallback: Open Gate-Format oder größter Pixelbereich
    const formatsList = formats || [];
    let baseFmt = formatsList.find((f) => /open gate/i.test(f));
    if (!baseFmt) {
      let bestArea = 0;
      for (const f of formatsList) {
        const pxStr = getPixelResolutionByFormat(manufacturer, model, f);
        const dims = parsePixels(pxStr);
        if (dims) {
          const area = dims.width * dims.height;
          if (area > bestArea) {
            bestArea = area;
            baseFmt = f;
          }
        }
      }
    }
    const ar = baseFmt ? getAspectRatiosByFormat(manufacturer, model, baseFmt) : null;
    const candidate = ar?.sensor;
    if (candidate && candidate !== 'Nicht verfügbar') return candidate;
    if (sensorPxDims) {
      const g2 = gcd(sensorPxDims.width, sensorPxDims.height);
      const rw2 = Math.round(sensorPxDims.width / g2);
      const rh2 = Math.round(sensorPxDims.height / g2);
      if (rw2 > 0 && rh2 > 0) return `${rw2}:${rh2}`;
    }
    return 'Nicht verfügbar';
  }, [manufacturer, model, formats, fullDims, sensorPxDims]);

  // Fallback: Berechne mm-Dimensionen aus Pixeln und Open-Gate Pitch, falls mm nicht verfügbar
  const formatDimsFallback = useMemo(() => {
    if (formatDims) return formatDims;
    if (!fullDims || !sensorPxDims || !formatPxDims) return null;
    const pitchW = fullDims.width / sensorPxDims.width;  // mm pro Pixel (Breite)
    const pitchH = fullDims.height / sensorPxDims.height; // mm pro Pixel (Höhe)
    return {
      width: formatPxDims.width * pitchW,
      height: formatPxDims.height * pitchH,
    };
  }, [formatDims, fullDims, sensorPxDims, formatPxDims]);

  const dimsForViz = formatDims || formatDimsFallback;

  const fmtPx = dimsForViz && fullDims ? {
    w: Math.round(dimsForViz.width * scale),
    h: Math.round(dimsForViz.height * scale),
  } : null;
  const formatDiagMm = useMemo(() => {
    const direct = calculateSensorDiagonal(formatSizeString);
    if (direct && direct !== 'Nicht verfügbar') return direct;
    if (formatDimsFallback) {
      const d = Math.sqrt(
        formatDimsFallback.width * formatDimsFallback.width +
        formatDimsFallback.height * formatDimsFallback.height
      );
      return d.toFixed(2);
    }
    return 'Nicht verfügbar';
  }, [formatSizeString, formatDimsFallback]);

  const fmtRect = useMemo(() => {
    if (!fmtPx) return null;
    return {
      x: (pxWidth - fmtPx.w) / 2,
      y: (fullPx.h - fmtPx.h) / 2,
    };
  }, [fmtPx, fullPx.h]);

  return (
    <div className="sensor-preview-page">
      <div className="sensor-preview-header">
        <h2>Sensor Vorschau</h2>
        <p>Zeigt den gesamten Sensor und den Bereich, den das gewählte Aufnahmeformat abdeckt.</p>
      </div>

      <div className="card sensor-preview-controls">
        <div className="control-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {t('camera.manufacturer', 'Hersteller')}
            <span title="Wähle den Kamerahersteller; beeinflusst verfügbare Modelle."><Icon name="info" size={16} /></span>
          </label>
          <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}>
            {manufacturers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {t('camera.model', 'Kamera')}
            <span title="Wähle das Kameramodell; steuert Sensordaten und Formate."><Icon name="info" size={16} /></span>
          </label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            {(models || []).map((mo) => (
              <option key={mo} value={mo}>{mo}</option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {t('camera.format', 'Format')}
            <span title="Aufnahmeformat/Modus; bestimmt Sensorbereich, Pixelauflösung und Seitenverhältnis."><Icon name="info" size={16} /></span>
          </label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            {(formats || []).map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card sensor-preview-visual">
        <svg width={pxWidth} height={fullPx.h} viewBox={`0 0 ${pxWidth} ${fullPx.h}`}>
          {/* Full sensor outline */}
          <rect x={0} y={0} width={pxWidth} height={fullPx.h} fill="var(--card-bg)" stroke="var(--border-color)" strokeWidth={2} />
          {/* Grid lines (optional light aids) - draw first so all texts/overlays are above */}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v-${i}`} x1={(i + 1) * (pxWidth / 11)} y1={0} x2={(i + 1) * (pxWidth / 11)} y2={fullPx.h} stroke="var(--border-color)" strokeWidth={1} opacity={0.35} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h-${i}`} x1={0} y1={(i + 1) * (fullPx.h / 7)} x2={pxWidth} y2={(i + 1) * (fullPx.h / 7)} stroke="var(--border-color)" strokeWidth={1} opacity={0.35} />
          ))}
          {/* Format area overlay centered within sensor */}
          {fmtPx && fmtRect && (
            <rect
              x={fmtRect.x}
              y={fmtRect.y}
              width={fmtPx.w}
              height={fmtPx.h}
              fill="var(--secondary-color)"
              opacity={0.35}
              stroke="var(--secondary-color)"
              strokeWidth={2}
            />
          )}
          {/* Diagonal line across format rectangle (bottom-left to top-right) with center gap for text readability */}
          {fmtPx && fmtRect && (
            (() => {
              const x1 = fmtRect.x;
              const y1 = fmtRect.y + fmtPx.h;
              const x2 = fmtRect.x + fmtPx.w;
              const y2 = fmtRect.y;
              const dx = x2 - x1;
              const dy = y2 - y1;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              const ux = dx / len;
              const uy = dy / len;
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              const fontSize = 12;
              const label = formatDiagMm && formatDiagMm !== 'Nicht verfügbar' ? `Diag: ${formatDiagMm} mm` : '';
              const gap = (estimateTextWidth(label, fontSize) || 24) + 12; // add padding
              const hx = (gap / 2) * ux;
              const hy = (gap / 2) * uy;
              const sx = mx - hx;
              const sy = my - hy;
              const ex = mx + hx;
              const ey = my + hy;
              return (
                <g>
                  <line x1={x1} y1={y1} x2={sx} y2={sy} stroke="var(--accent-color)" strokeWidth={2} />
                  <line x1={ex} y1={ey} x2={x2} y2={y2} stroke="var(--accent-color)" strokeWidth={2} />
                </g>
              );
            })()
          )}
          {/* Measurement texts above grid */}
          {sensorPxDims && (
            (() => {
              const dec = toDecimalAR(sensorPxDims.width, sensorPxDims.height);
              const fallbackDec = parseARtoDecimal(sensorAspectRatioStringConstant);
              const arLabel = dec || fallbackDec || 'Nicht verfügbar';
              const arString = sensorAspectRatioStringConstant && sensorAspectRatioStringConstant !== 'Nicht verfügbar' ? sensorAspectRatioStringConstant : null;
              const label = `Sensor px: ${sensorPxDims.width} x ${sensorPxDims.height} • Bildverhältnis: ${arLabel}${arString ? ` (${arString})` : ''}`;
              return (
                <text x={8} y={16} fill="var(--text-color)" fontSize={12}>{label}</text>
              );
            })()
          )}
          {/* Place format px inside the format rectangle at the bottom edge, aligned right (ohne Hintergrund) */}
          {formatPxDims && fmtRect && fmtPx && (
            (() => {
              const fontSize = 12;
              const arDec = toDecimalAR(formatPxDims.width, formatPxDims.height);
              const fallbackArDec = parseARtoDecimal(aspectRatios?.recorded);
              const arText = arDec || fallbackArDec || 'Nicht verfügbar';
              const arString = aspectRatios?.recorded && aspectRatios?.recorded !== 'Nicht verfügbar' ? aspectRatios.recorded : null;
              const label = `Format px: ${formatPxDims.width} x ${formatPxDims.height} • Bildverhältnis: ${arText}${arString ? ` (${arString})` : ''}`;
              const est = estimateTextWidth(label, fontSize);
              const margin = 8;
              const candidateX = fmtRect.x + fmtPx.w - est - margin;
              const textX = Math.max(fmtRect.x + margin, candidateX);
              const textY = fmtRect.y + fmtPx.h - 8;
              return (<text x={textX} y={textY} fill="var(--text-color)" fontSize={fontSize}>{label}</text>);
            })()
          )}
          {/* Place diagonal length centered on the diagonal (ohne Hintergrund) */}
          {formatDiagMm && formatDiagMm !== 'Nicht verfügbar' && fmtRect && fmtPx && (
            (() => {
              const fontSize = 12;
              const label = `Diag: ${formatDiagMm} mm`;
              const textX = fmtRect.x + fmtPx.w / 2;
              const textY = fmtRect.y + fmtPx.h / 2 - 4;
              return (<text x={textX} y={textY} fill="var(--text-color)" fontSize={fontSize} textAnchor="middle">{label}</text>);
            })()
          )}
        </svg>
      </div>

      <div className="card sensor-preview-info">
        <div className="info-row">
          <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Sensor (max):
            <span title="Größte Sensorfläche des Modells (Breite × Höhe in mm)."><Icon name="info" size={14} /></span>
          </span>
          <span className="info-value">{fullDims ? `${fullDims.width.toFixed(2)} x ${fullDims.height.toFixed(2)} mm` : t('common.notAvailable', 'Nicht angegeben')}</span>
        </div>
        <div className="info-row">
          <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Format Sensorbereich:
            <span title="Vom gewählten Format abgedeckter Bereich auf dem Sensor (mm)."><Icon name="info" size={14} /></span>
          </span>
          <span className="info-value">{dimsForViz ? `${dimsForViz.width.toFixed(2)} x ${dimsForViz.height.toFixed(2)} mm` : formatSizeString || t('common.notAvailable', 'Nicht angegeben')}</span>
        </div>
        <div className="info-row">
          <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Pixelauflösung:
            <span title="Breite × Höhe in Pixeln für das gewählte Format."><Icon name="info" size={14} /></span>
          </span>
          <span className="info-value">{pixelResolution || t('common.notAvailable', 'Nicht angegeben')}</span>
        </div>
        <div className="info-row">
          <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Bildverhältnis (Aufnahme):
            <span title="Seitenverhältnis des Aufnahmeformats (z. B. 2.39:1)."><Icon name="info" size={14} /></span>
          </span>
          <span className="info-value">{aspectRatios?.recorded || t('common.notAvailable', 'Nicht angegeben')}</span>
        </div>
        <div className="info-row">
          <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Bildverhältnis (Sensor):
            <span title="Seitenverhältnis des maximalen Sensors (z. B. 3:2)."><Icon name="info" size={14} /></span>
          </span>
          <span className="info-value">{sensorAspectRatioStringConstant || t('common.notAvailable', 'Nicht angegeben')}</span>
        </div>
      </div>
    </div>
  );
};

export default SensorPreview;