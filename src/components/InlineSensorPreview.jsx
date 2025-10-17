import React, { useMemo } from 'react';
import {
  cameraDatabase,
  getSensorSizeByFormat,
  getPixelResolutionByFormat,
  getAspectRatiosByFormat,
  calculateSensorDiagonal,
} from '../data/cameraDatabase';
import {
  parseSensorSize,
  calculateAllFOV,
  formatFOVDisplay,
  calculateCircleOfConfusion,
  calculateHyperfocal,
  calculateDOF,
  extractFocalLength,
} from '../utils/fovCalculator';

// Hilfsfunktion: mm-String "W x H mm" in { width, height }
const parseMm = (s) => parseSensorSize(s);

// Hilfsfunktion: größter Sensor (mm) für ein Kameramodell
const getMaxSensorDimsForModel = (manufacturer, model) => {
  if (!manufacturer || !model) return null;
  const man = cameraDatabase?.[manufacturer];
  const cam = man?.models?.[model];
  const sizes = cam?.sensorSizes;
  if (!sizes) return null;
  let maxDiag = -1;
  let best = null;
  for (const key of Object.keys(sizes)) {
    const dims = parseMm(sizes[key]);
    if (!dims) continue;
    const diag = Math.hypot(dims.width, dims.height);
    if (diag > maxDiag) {
      maxDiag = diag;
      best = dims;
    }
  }
  return best;
};

// Hilfsfunktion: größter Pixelbereich für ein Kameramodell
const parsePixels = (pxString) => {
  if (!pxString || typeof pxString !== 'string') return null;
  const m = pxString.match(/(\d+)\s*x\s*(\d+)/i);
  if (!m) return null;
  const w = parseInt(m[1], 10);
  const h = parseInt(m[2], 10);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return null;
  return { width: w, height: h };
};

const getMaxPixelResolutionForModel = (manufacturer, model) => {
  if (!manufacturer || !model) return null;
  const man = cameraDatabase?.[manufacturer];
  const cam = man?.models?.[model];
  const px = cam?.pixelResolutions;
  if (!px) return null;
  let best = null;
  for (const key of Object.keys(px)) {
    const dims = parsePixels(px[key]);
    if (!dims) continue;
    const area = dims.width * dims.height;
    if (!best || area > best.area) best = { ...dims, area };
  }
  return best ? { width: best.width, height: best.height } : null;
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

// Grobe Textbreitenschätzung für SVG (monospace-ish Heuristik)
const estimateTextWidth = (text, fontSize = 12) => {
  if (!text) return 0;
  const avgCharWidth = fontSize * 0.6; // Heuristik
  return text.length * avgCharWidth;
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

// Kompakte Inline-Sensorvorschau
// Nutzt vorhandene Felder aus Shot-/CameraSettings: manufacturer, model, format, manualFormat
const InlineSensorPreview = ({ settings, title = undefined }) => {
  const manufacturer = settings?.manufacturer;
  const modelRaw = settings?.model;
  const format = settings?.format;
  const manualFormat = settings?.manualFormat;

  // Frühzeitiger Guard VOR allen Hooks, um Hook-Reihenfolge zu wahren
  const isManual = (v) => typeof v === 'string' && v.trim().toLowerCase() === 'manuell';
  if (!manufacturer || !modelRaw || !format || isManual(manufacturer) || isManual(modelRaw) || isManual(format)) {
    return null;
  }

  // Modellnamen für Datenbank normalisieren (Shot speichert teils "Hersteller Modell")
  const model = useMemo(() => {
    const man = typeof manufacturer === 'string' ? manufacturer : '';
    const m = typeof modelRaw === 'string' ? modelRaw : '';
    const models = cameraDatabase?.[man]?.models || {};
    if (m && models[m]) return m; // exakter Key vorhanden
    // Versuche Herstellerpräfix zu entfernen
    const esc = man.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const stripped = m.replace(new RegExp(`^${esc}\\s+`), '');
    if (stripped && models[stripped]) return stripped;
    return m; // Fallback: unverändert
  }, [manufacturer, modelRaw]);

  // Sensor mm (voller Sensor) für Rahmen
  const fullSensorDims = useMemo(() => {
    // Primär: größter mm-Sensor des Modells (stabiler Rahmen)
    const maxDims = getMaxSensorDimsForModel(manufacturer, model);
    if (maxDims) return maxDims;
    // Fallback: falls nur ein manuelles Format existiert
    const manualDims = parseMm(manualFormat);
    if (manualDims) return manualDims;
    // Letzter Fallback: 36x24 (Vollformat), damit UI nicht bricht
    return { width: 36, height: 24 };
  }, [manufacturer, model, manualFormat]);

  // Format mm (auf dem Sensor belegte Fläche)
  const formatDims = useMemo(() => {
    if (format === 'Manuell') {
      return parseMm(manualFormat);
    }
    if (manufacturer && model && format) {
      const s = getSensorSizeByFormat(manufacturer, model, format);
      return parseMm(s);
    }
    return null;
  }, [manufacturer, model, format, manualFormat]);

  // Zusätzliche Daten wie auf der SensorPreview-Seite
  const formatSizeString = useMemo(() => {
    if (format === 'Manuell') return manualFormat || 'Nicht verfügbar';
    return manufacturer && model && format ? getSensorSizeByFormat(manufacturer, model, format) : 'Nicht verfügbar';
  }, [manufacturer, model, format, manualFormat]);

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

  const sensorAspectRatioStringConstant = useMemo(() => {
    if (!fullSensorDims) return 'Nicht verfügbar';
    const w = Math.round(fullSensorDims.width);
    const h = Math.round(fullSensorDims.height);
    const g = gcd(w, h);
    const rw = Math.round(w / g);
    const rh = Math.round(h / g);
    if (rw > 0 && rh > 0) return `${rw}:${rh}`;
    return 'Nicht verfügbar';
  }, [fullSensorDims]);

  const formatDiagMm = useMemo(() => {
    const d = calculateSensorDiagonal(formatSizeString);
    return d && d !== 'Nicht verfügbar' ? d : null;
  }, [formatSizeString]);

  // Fallback: Berechne mm-Dimensionen aus Pixeln und Open-Gate Pitch, falls mm nicht verfügbar
  const formatDimsFallback = useMemo(() => {
    if (formatDims) return null;
    if (!fullSensorDims || !sensorPxDims || !formatPxDims) return null;
    const pitchW = fullSensorDims.width / sensorPxDims.width;  // mm pro Pixel (Breite)
    const pitchH = fullSensorDims.height / sensorPxDims.height; // mm pro Pixel (Höhe)
    return {
      width: formatPxDims.width * pitchW,
      height: formatPxDims.height * pitchH,
    };
  }, [formatDims, fullSensorDims, sensorPxDims, formatPxDims]);

  const dimsForViz = formatDims || formatDimsFallback;
  const formatDiagLabel = useMemo(() => {
    if (formatDiagMm) return `Diag: ${formatDiagMm} mm`;
    if (dimsForViz) {
      const d = Math.sqrt(dimsForViz.width * dimsForViz.width + dimsForViz.height * dimsForViz.height);
      return `Diag: ${d.toFixed(2)} mm`;
    }
    return null;
  }, [formatDiagMm, dimsForViz]);

  // Zeichnen der Vorschau (SVG)
  const svg = useMemo(() => {
    if (!fullSensorDims) return null;
    const viewW = 480;
    const viewH = 280;
    const pad = 16;
    const scale = Math.min(
      (viewW - pad * 2) / fullSensorDims.width,
      (viewH - pad * 2) / fullSensorDims.height
    );
    const fw = fullSensorDims.width * scale;
    const fh = fullSensorDims.height * scale;
    const fx = (viewW - fw) / 2;
    const fy = (viewH - fh) / 2;

    // Formatfläche mittig einpassen
    let fmt = null;
    if (dimsForViz) {
      const ow = dimsForViz.width * scale;
      const oh = dimsForViz.height * scale;
      fmt = {
        x: fx + (fw - ow) / 2,
        y: fy + (fh - oh) / 2,
        w: ow,
        h: oh,
      };
    }

    return (
      <svg width="100%" height="280" viewBox={`0 0 ${viewW} ${viewH}`} role="img" aria-label="Sensorvorschau">
        {/* Full sensor */}
        <rect x={fx} y={fy} width={fw} height={fh} fill="none" stroke="var(--text-color)" strokeWidth="1.5" />

        {/* Leichtes Grid */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`gv-${i}`} x1={fx + ((i + 1) * (fw / 11))} y1={fy} x2={fx + ((i + 1) * (fw / 11))} y2={fy + fh} stroke="var(--border-color)" strokeWidth="0.5" opacity="0.35" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`gh-${i}`} x1={fx} y1={fy + ((i + 1) * (fh / 7))} x2={fx + fw} y2={fy + ((i + 1) * (fh / 7))} stroke="var(--border-color)" strokeWidth="0.5" opacity="0.35" />
        ))}

        {/* Kein Diagonalen-Linienzug, um Darstellung an die Tool-Seite anzugleichen */}

        {/* Format overlay mit dezenter Füllfarbe wie im Tool */}
        {fmt && (
          <rect
            x={fmt.x}
            y={fmt.y}
            width={fmt.w}
            height={fmt.h}
            fill="var(--secondary-color)"
            opacity="0.35"
            stroke="var(--secondary-color)"
            strokeWidth="2"
          />
        )}

        {/* Diagonale über das Format-Rechteck mit Lücke für Text (wie Tools-Seite) */}
        {fmt && (
          (() => {
            const x1 = fmt.x;
            const y1 = fmt.y + fmt.h;
            const x2 = fmt.x + fmt.w;
            const y2 = fmt.y;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            const fontSize = 12;
            const label = formatDiagMm && formatDiagMm !== 'Nicht verfügbar' ? `Diag: ${formatDiagMm} mm` : '';
            const gap = (estimateTextWidth(label, fontSize) || 24) + 12; // etwas Puffer
            const hx = (gap / 2) * ux;
            const hy = (gap / 2) * uy;
            const sx = mx - hx;
            const sy = my - hy;
            const ex = mx + hx;
            const ey = my + hy;
            return (
              <g>
                <line x1={x1} y1={y1} x2={sx} y2={sy} stroke="var(--accent-color, #d33)" strokeWidth="2" />
                <line x1={ex} y1={ey} x2={x2} y2={y2} stroke="var(--accent-color, #d33)" strokeWidth="2" />
              </g>
            );
          })()
        )}

        {/* Texte wie auf der Tools-Seite */}
        {sensorPxDims && (
          (() => {
            const dec = toDecimalAR(sensorPxDims.width, sensorPxDims.height);
            const fallbackDec = parseARtoDecimal(sensorAspectRatioStringConstant);
            const arLabel = dec || fallbackDec || 'Nicht verfügbar';
            const arString = sensorAspectRatioStringConstant && sensorAspectRatioStringConstant !== 'Nicht verfügbar' ? sensorAspectRatioStringConstant : null;
            const label = `Sensor px: ${sensorPxDims.width} x ${sensorPxDims.height} • Bildverhältnis: ${arLabel}${arString ? ` (${arString})` : ''}`;
            return (
              <text x={fx + 6} y={fy + 14} fill="var(--text-color)" fontSize={12}>{label}</text>
            );
          })()
        )}

        {formatPxDims && fmt && (
          (() => {
            const fontSize = 12;
            const arDec = toDecimalAR(formatPxDims.width, formatPxDims.height);
            const fallbackArDec = parseARtoDecimal(aspectRatios?.recorded);
            const arText = arDec || fallbackArDec || 'Nicht verfügbar';
            const arString = aspectRatios?.recorded && aspectRatios?.recorded !== 'Nicht verfügbar' ? aspectRatios.recorded : null;
            const label = `Format px: ${formatPxDims.width} x ${formatPxDims.height} • Bildverhältnis: ${arText}${arString ? ` (${arString})` : ''}`;
            const est = estimateTextWidth(label, fontSize);
            const margin = 6;
            const candidateX = fmt.x + fmt.w - est - margin;
            const textX = Math.max(fmt.x + margin, candidateX);
            const textY = fmt.y + fmt.h - 6;
            return (<text x={textX} y={textY} fill="var(--text-color)" fontSize={fontSize}>{label}</text>);
          })()
        )}

        {formatDiagMm && fmt && (
          (() => {
            const fontSize = 12;
            const label = `Diag: ${formatDiagMm} mm`;
            const textX = fmt.x + fmt.w / 2;
            const textY = fmt.y + fmt.h / 2 - 4;
            return (<text x={textX} y={textY} fill="var(--text-color)" fontSize={fontSize} textAnchor="middle">{label}</text>);
          })()
        )}
      </svg>
    );
  }, [fullSensorDims, dimsForViz, formatDiagMm, formatPxDims, aspectRatios, sensorPxDims, sensorAspectRatioStringConstant]);

  return (
    <div className="card" style={{ marginTop: 12 }}>
      {(manufacturer || model || format) && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'baseline' }}>
          <div style={{ fontSize: 12, color: 'var(--muted-color)' }}>
            {[manufacturer, model, format === 'Manuell' ? manualFormat : format]
              .filter(Boolean)
              .join(' • ')}
          </div>
        </div>
      )}
      <div style={{ marginTop: 8 }}>{svg}</div>
      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr', gap: 4, textAlign: 'left' }}>
        {dimsForViz && (
          <div style={{ fontSize: 12, color: 'var(--muted-color)' }}>
            Sensor (mm): {fullSensorDims.width.toFixed ? fullSensorDims.width.toFixed(2) : fullSensorDims.width} × {fullSensorDims.height.toFixed ? fullSensorDims.height.toFixed(2) : fullSensorDims.height} • Format (mm): {dimsForViz.width.toFixed ? dimsForViz.width.toFixed(2) : dimsForViz.width} × {dimsForViz.height.toFixed ? dimsForViz.height.toFixed(2) : dimsForViz.height}
          </div>
        )}
        <div style={{ fontSize: 12, color: 'var(--muted-color)' }}>
          Pixelauflösung: {pixelResolution || 'Nicht verfügbar'}
        </div>
      </div>
    </div>
  );
};

export default InlineSensorPreview;