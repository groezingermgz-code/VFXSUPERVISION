import React, { useMemo, useState, useRef, useEffect } from 'react';
import './FovCalculator.css';
import { 
  getManufacturers,
  getModelsByManufacturer,
  getFormatsByModel,
  getSensorSizeByFormat,
} from '../data/cameraDatabase';
import {
  getLensManufacturers,
  getLensesByManufacturer,
  getLensFullName,
  getAnamorphicLensManufacturers,
  getAnamorphicLensesByManufacturer,
} from '../data/lensDatabase';
  import {
    parseSensorSize,
    calculateHorizontalFOV,
    calculateVerticalFOV,
    calculateDiagonalFOV,
    calculateCropFactor,
    calculateCircleOfConfusion,
    calculateHyperfocal,
    calculateDOF,
    extractAnamorphicFactor,
    extractFocalLength,
  } from '../utils/fovCalculator';

const FovCalculator = () => {
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [format, setFormat] = useState('');
  const [projectionType, setProjectionType] = useState('rectilinear');
  const [focalLength, setFocalLength] = useState('32');
  const [aperture, setAperture] = useState('4');
  const [focusDistance, setFocusDistance] = useState('5');
  // Objektiv-Auswahl
  const [lensManufacturer, setLensManufacturer] = useState('');
  const [lensModel, setLensModel] = useState('');
  const [isAnamorphic, setIsAnamorphic] = useState(false);
  const [anamorphicFactor, setAnamorphicFactor] = useState(1);

  const manufacturers = useMemo(() => getManufacturers(), []);
  const models = useMemo(() => manufacturer ? getModelsByManufacturer(manufacturer) : [], [manufacturer]);
  const formats = useMemo(() => (manufacturer && model) ? getFormatsByModel(manufacturer, model) : [], [manufacturer, model]);
  // Objektiv-Dropdowns
  const lensManufacturers = useMemo(() => (isAnamorphic ? getAnamorphicLensManufacturers() : getLensManufacturers()), [isAnamorphic]);
  const lenses = useMemo(() => (lensManufacturer ? (isAnamorphic ? getAnamorphicLensesByManufacturer(lensManufacturer) : getLensesByManufacturer(lensManufacturer)) : []), [isAnamorphic, lensManufacturer]);

  const sensorSizeString = useMemo(() => {
    if (!manufacturer || !model || !format) return null;
    return getSensorSizeByFormat(manufacturer, model, format);
  }, [manufacturer, model, format]);

  const sensorDims = useMemo(() => parseSensorSize(sensorSizeString), [sensorSizeString]);

  const fov = useMemo(() => {
    const focal = parseFloat(focalLength);
    if (!sensorDims || !focal || focal <= 0) return null;
    return {
      h: calculateHorizontalFOV(focal, sensorDims.width * (anamorphicFactor || 1), projectionType),
      v: calculateVerticalFOV(focal, sensorDims.height, projectionType),
      d: calculateDiagonalFOV(focal, sensorDims.width * (anamorphicFactor || 1), sensorDims.height, projectionType),
      crop: calculateCropFactor(sensorDims.width, sensorDims.height),
    };
  }, [sensorDims, focalLength, projectionType, anamorphicFactor]);

  const optics = useMemo(() => {
    const focal = parseFloat(focalLength);
    const ap = parseFloat(aperture);
    const fd = parseFloat(focusDistance);
    if (!sensorDims || !focal || focal <= 0 || !ap || ap <= 0) return null;
    const coc = calculateCircleOfConfusion(sensorDims.width, sensorDims.height);
    const H = coc ? calculateHyperfocal(focal, ap, coc) : null;
    const dof = (coc && fd && fd > 0) ? calculateDOF(focal, ap, coc, fd) : null;
    return { coc, H, dof };
  }, [sensorDims, focalLength, aperture, focusDistance]);

  const lensInfo = useMemo(() => {
    const full = (lensManufacturer && lensModel) ? getLensFullName(lensManufacturer, lensModel) : '';
    const factor = extractAnamorphicFactor(full);
    const isZoom = /\d+\s*-\s*\d+mm/i.test(full);
    const isMacro = /macro/i.test(full);
    const baseType = factor > 1 ? `Anamorph ${factor}x` : 'Sphärisch';
    const subtype = `${isZoom ? 'Zoom' : 'Prime'}${isMacro ? ' / Macro' : ''}`;
    return { fullName: full, factor, type: `${baseType} / ${subtype}` };
  }, [lensManufacturer, lensModel]);

  const resetSelection = () => {
    setModel('');
    setFormat('');
    // Objektiv-Reset, wenn Hersteller gewechselt wird
    setLensManufacturer('');
    setLensModel('');
    setIsAnamorphic(false);
    setAnamorphicFactor(1);
  };

  return (
    <div className="fov-page">
      <div className="fov-header">
        <h2>FOV‑Rechner</h2>
        <p>Berechne Sichtfeld basierend auf Sensorformat und Brennweite.</p>
      </div>

      {/* Infofeld */}
      <div className="card info-card" role="note" aria-label="Erklärung zum FOV‑Diagramm">
        <h3>Info</h3>
        <div>
          <div className="info-section-title">Diagrammfarben</div>
          <ul className="info-list">
            <li>Blau: Vertikaler FOV (VFOV) – die beiden blauen Linien zeigen die oberen/unteren Extremstrahlen vom Linsen‑Apex aus; der blaue Punkt markiert die optische Mitte.</li>
            <li>Rot: Horizontaler FOV (HFOV) – die roten Linien zeigen die linken/rechten Extremstrahlen.</li>
            <li>Grau: Sensorrahmen (rechts) in Millimetern skaliert, inklusive gestrichelter Diagonale für die Sensor‑Diagonal (DFOV).</li>
          </ul>
          <div className="info-section-title">Was du ablesen kannst</div>
          <ul className="info-list">
            <li>HFOV/VFOV/DFOV: Die Winkelwerte entsprechen den berechneten Ergebnissen und aktualisieren sich live.</li>
            <li>Sensorgröße: Beschriftung mit Breite × Höhe in mm, passend zum gewählten Format.</li>
            <li>Crop‑Faktor: Verhältnis der Sensor‑Diagonal zu Vollformat, als zusätzlicher Kontext zum Bildwinkel.</li>
          </ul>
          <div className="info-section-title">Hinweis</div>
          <p>Die Darstellung ist schematisch. Sie zeigt Winkelbeziehungen und den Sensormaßstab, nicht die reale Projektion/Verzeichnung einer Fisheye‑Optik.</p>
        </div>
      </div>

      <div className="card fov-controls">
        <div className="control-row">
          <div className="form-group">
            <label>Hersteller</label>
            <select value={manufacturer} onChange={(e) => { setManufacturer(e.target.value); resetSelection(); }}>
              <option value="">Bitte wählen…</option>
              {manufacturers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Kamera</label>
            <select value={model} onChange={(e) => { setModel(e.target.value); setFormat(''); }} disabled={!manufacturer}>
              <option value="">Bitte wählen…</option>
              {models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} disabled={!model}>
              <option value="">Bitte wählen…</option>
              {formats.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Objektiv-Auswahl */}
        <div className="control-row">
          <div className="form-group">
            <label>Anamorph</label>
            <input
              type="checkbox"
              checked={isAnamorphic}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsAnamorphic(checked);
                // Beim Umschalten Liste zurücksetzen
                setLensManufacturer('');
                setLensModel('');
                setAnamorphicFactor(checked ? (lensInfo.factor || 1) : 1);
              }}
            />
          </div>
          <div className="form-group">
            <label>Objektiv‑Hersteller</label>
            <select value={lensManufacturer} onChange={(e) => { setLensManufacturer(e.target.value); setLensModel(''); }}>
              <option value="">Bitte wählen…</option>
              {lensManufacturers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Objektiv</label>
            <select
              value={lensModel}
              onChange={(e) => {
                const modelSel = e.target.value;
                setLensModel(modelSel);
                const fullName = getLensFullName(lensManufacturer, modelSel);
                // Brennweite automatisch übernehmen, falls im Namen enthalten
                const fl = extractFocalLength(fullName);
                if (fl) setFocalLength(String(fl));
                // Anamorph‑Faktor aus dem Namen ableiten
                const af = extractAnamorphicFactor(fullName);
                setAnamorphicFactor(af || (isAnamorphic ? 2 : 1));
              }}
              disabled={!lensManufacturer}
            >
              <option value="">Bitte wählen…</option>
              {lenses.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="control-row">
          <div className="form-group">
            <label>Brennweite (mm)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="z. B. 50"
              value={focalLength}
              onChange={(e) => {
                // Erlaube nur Ziffern, Punkt und Komma und normalisiere Komma → Punkt
                let v = e.target.value;
                v = v.replace(',', '.');
                // Entferne alle Zeichen außer Ziffern und Punkt
                v = v.replace(/[^0-9.]/g, '');
                // Erlaube nur einen Dezimalpunkt
                const firstDot = v.indexOf('.');
                if (firstDot !== -1) {
                  v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
                }
                setFocalLength(v);
              }}
            />
          </div>
          <div className="form-group">
            <label>Projektion</label>
            <select value={projectionType} onChange={(e) => setProjectionType(e.target.value)}>
              <option value="rectilinear">Rectilinear</option>
              <option value="fisheye-equidistant">Fisheye (equidistant)</option>
              <option value="fisheye-stereographic">Fisheye (stereographic)</option>
            </select>
          </div>
        </div>

        <div className="control-row">
          <div className="form-group">
            <label>Blende (f/N)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="z. B. 2.8"
              value={aperture}
              onChange={(e) => {
                let v = e.target.value;
                v = v.replace(',', '.');
                v = v.replace(/[^0-9.]/g, '');
                const firstDot = v.indexOf('.');
                if (firstDot !== -1) {
                  v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
                }
                setAperture(v);
              }}
            />
          </div>
          <div className="form-group">
            <label>Fokus‑Distanz (m)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="z. B. 5"
              value={focusDistance}
              onChange={(e) => {
                let v = e.target.value;
                v = v.replace(',', '.');
                v = v.replace(/[^0-9.]/g, '');
                const firstDot = v.indexOf('.');
                if (firstDot !== -1) {
                  v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
                }
                setFocusDistance(v);
              }}
            />
          </div>
        </div>
        <div className="control-row">
          <div className="form-group" style={{flex: 1}}>
            <label>Fokus‑Distanz</label>
            <input
              type="range"
              min="0.3"
              max="100"
              step="0.1"
              value={Number(parseFloat(focusDistance) || 0)}
              onChange={(e) => setFocusDistance(e.target.value)}
            />
            <div className="value">{(parseFloat(focusDistance) || 0).toFixed(2)} m</div>
          </div>
        </div>
      </div>

      <div className="card fov-results">
        <h3>Ergebnis</h3>
        <div className="result-grid">
          <div className="result-item">
            <span className="label">Sensorgröße</span>
            <span className="value">{sensorSizeString || 'Nicht verfügbar'}</span>
          </div>
          <div className="result-item">
            <span className="label">Objektiv</span>
            <span className="value">{lensInfo.fullName || '—'}</span>
          </div>
          <div className="result-item">
            <span className="label">Objektiv‑Typ</span>
            <span className="value">{lensInfo.fullName ? lensInfo.type : '—'}</span>
          </div>
          <div className="result-item">
            <span className="label">Anamorph‑Faktor</span>
            <span className="value">{lensInfo.fullName ? `${(anamorphicFactor || 1)}×` : '—'}</span>
          </div>
          <div className="result-item">
            <span className="label">Horizontal</span>
            <span className="value">{fov?.h ? `${fov.h}°` : '—'}</span>
          </div>
          <div className="result-item">
            <span className="label">Vertikal</span>
            <span className="value">{fov?.v ? `${fov.v}°` : '—'}</span>
          </div>
          <div className="result-item">
            <span className="label">Diagonal</span>
            <span className="value">{fov?.d ? `${fov.d}°` : '—'}</span>
          </div>
          <div className="result-item">
            <span className="label">Crop‑Faktor (vs. Vollformat)</span>
            <span className="value">{fov?.crop ? `${fov.crop}×` : '—'}</span>
          </div>
        </div>
      </div>

      <div className="card fov-results">
        <h3>Fokus / DOF</h3>
        <div className="result-grid">
          <div className="result-item">
            <span className="label">Hyperfokale Distanz</span>
            <span className="value">{optics?.H != null ? `${optics.H.toFixed(2)} m` : '—'}</span>
          </div>
          <div className="result-item">
            <span className="label">Nahgrenze</span>
            <span className="value">{optics?.dof?.near != null ? `${optics.dof.near.toFixed(2)} m` : '—'}</span>
          </div>
          <div className="result-item">
            <span className="label">Ferngrenze</span>
            <span className="value">{optics?.dof?.far != null ? `${optics.dof.far.toFixed(2)} m` : '∞'}</span>
          </div>
          <div className="result-item">
            <span className="label">Gesamt Schärfentiefe</span>
            <span className="value">{optics?.dof ? (optics.dof.total === Infinity ? '∞' : `${optics.dof.total.toFixed(2)} m`) : '—'}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>FOV Diagramm</h3>
        <div className="fov-diagram-grid">
          <div>
            <div className="panel-title">2D</div>
            <FovDiagram fov={fov} sensorDims={sensorDims} />
          </div>
          <div>
            <div className="panel-title">3D</div>
            <FovDiagram3D fov={fov} sensorDims={sensorDims} optics={optics} focusDistance={parseFloat(focusDistance) || 0} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FovCalculator;
  const FovDiagram3D = ({ fov, sensorDims, optics, focusDistance }) => {
    const canvasRef = useRef(null);
    // Start in einer 3/4‑Ansicht für bessere Orientierung
    const [yaw, setYaw] = useState(Math.PI / 4);   // Isometrischer Yaw ~45°
    const [pitch, setPitch] = useState(-Math.atan(1/Math.sqrt(2))); // Isometrischer Pitch ~‑35.264°
    const [projection3D, setProjection3D] = useState('isometric');
    const [dragging, setDragging] = useState(false);
    const lastPos = useRef(null);
    const [zoom, setZoom] = useState(0.32);
    const [camX, setCamX] = useState(-0.52);
    const [camY, setCamY] = useState(-0.55);
    const [camZ, setCamZ] = useState(0.03);
    const defaults = useRef({
      yaw: Math.PI / 4,
      pitch: -Math.atan(1/Math.sqrt(2)),
      zoom: 0.32,
      camX: -0.52,
      camY: -0.55,
      camZ: 0.03,
      projection3D: 'isometric',
    });
    useEffect(() => {
      // Lade persistierte Defaults aus localStorage (falls vorhanden)
      try {
        const raw = localStorage.getItem('fov3d_defaults');
        if (raw) {
          const d = JSON.parse(raw);
          if (typeof d.yaw === 'number') setYaw(d.yaw);
          if (typeof d.pitch === 'number') setPitch(d.pitch);
          if (typeof d.zoom === 'number') setZoom(d.zoom);
          if (typeof d.camX === 'number') setCamX(d.camX);
          if (typeof d.camY === 'number') setCamY(d.camY);
          if (typeof d.camZ === 'number') setCamZ(d.camZ);
          if (d.projection3D) setProjection3D(d.projection3D);
          defaults.current = {
            yaw: typeof d.yaw === 'number' ? d.yaw : defaults.current.yaw,
            pitch: typeof d.pitch === 'number' ? d.pitch : defaults.current.pitch,
            zoom: typeof d.zoom === 'number' ? d.zoom : defaults.current.zoom,
            camX: typeof d.camX === 'number' ? d.camX : defaults.current.camX,
            camY: typeof d.camY === 'number' ? d.camY : defaults.current.camY,
            camZ: typeof d.camZ === 'number' ? d.camZ : defaults.current.camZ,
            projection3D: d.projection3D || defaults.current.projection3D,
          };
        } else {
          // Keine Persistenz vorhanden: aktuelle Startwerte als Defaults
          defaults.current = { yaw, pitch, zoom, camX, camY, camZ, projection3D };
        }
      } catch (e) {
        // Fallback: aktuelle Startwerte
        defaults.current = { yaw, pitch, zoom, camX, camY, camZ, projection3D };
      }
    }, []);

    const toRad = (deg) => (deg || 0) * Math.PI / 180;
    const toDeg = (rad) => (rad || 0) * 180 / Math.PI;
    const effectiveFov = useMemo(() => {
      return fov || null;
    }, [fov]);
    const hHalf = toRad((effectiveFov?.h || 0) / 2);
    const vHalf = toRad((effectiveFov?.v || 0) / 2);

    const rotateY = ([x, y, z], a) => {
      const ca = Math.cos(a), sa = Math.sin(a);
      return [ca * x + sa * z, y, -sa * x + ca * z];
    };
    const rotateX = ([x, y, z], a) => {
      const ca = Math.cos(a), sa = Math.sin(a);
      return [x, ca * y - sa * z, sa * y + ca * z];
    };
    const applyRot = (p) => rotateX(rotateY(p, yaw), pitch);

    const project = (p, w, h) => {
      const cx = w / 2, cy = h / 2;
      const f = w * 0.45 * zoom;
      if (projection3D === 'isometric') {
        // Orthographische Projektion für isometrische Darstellung (kein Perspektiv‑Verhältnis)
        return [cx + (p[0] * f), cy - (p[1] * f)];
      }
      // Perspektivische Projektion
      const z = p[2] + 0.0001;
      return [cx + (p[0] * f) / z, cy - (p[1] * f) / z];
    };

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height;
      const css = getComputedStyle(document.documentElement);
      const accentBase = css.getPropertyValue('--accent-color')?.trim() || '#e91e63';
      const secondaryBase = css.getPropertyValue('--secondary-color')?.trim() || '#2ec4b6';
      const borderBase = css.getPropertyValue('--border-color')?.trim() || '#888';
      const textBase = css.getPropertyValue('--text-color')?.trim() || '#999';
      const bg3d = '#05070a';

      const brighten = (hex, amount = 0.45) => {
        const m = hex?.match(/^#([0-9a-f]{6})$/i);
        if (!m) return hex;
        const num = parseInt(m[1], 16);
        let r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
        r = Math.min(255, Math.round(r + (255 - r) * amount));
        g = Math.min(255, Math.round(g + (255 - g) * amount));
        b = Math.min(255, Math.round(b + (255 - b) * amount));
        return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
      };
      const accent = brighten(accentBase, 0.3);
      const secondary = brighten(secondaryBase, 0.5);
      const border = brighten(borderBase, 0.7);
      const textColor = brighten(textBase, 0.5);
      const bodyFill = '#2b2e34';
      const bodyStroke = '#5a5f66';

      // Helfer für Labels: abgerundetes Rechteck und farbiger Text
      const roundedRect = (x, y, width, height, radius = 6) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      };

      const drawTag = (text, x, y, color = textColor, bgAlpha = 0.55) => {
        ctx.save();
        ctx.font = '13px sans-serif';
        ctx.textBaseline = 'alphabetic';
        const tw = ctx.measureText(text).width;
        const padX = 8, padY = 5;
        const boxW = tw + padX * 2;
        const boxH = 20;
        roundedRect(x, y - boxH + padY, boxW, boxH, 6);
        ctx.fillStyle = `rgba(0,0,0,${bgAlpha})`;
        ctx.fill();
        ctx.fillStyle = color;
        ctx.fillText(text, x + padX, y);
        ctx.restore();
      };

      // Clear gesamter Canvas
      ctx.fillStyle = bg3d;
      ctx.fillRect(0, 0, w, h);

      if (!effectiveFov?.h || !effectiveFov?.v) {
        ctx.fillStyle = textColor;
        ctx.font = '14px sans-serif';
        ctx.fillText('Bitte Sensor & Brennweite auswählen, um die 3D‑Ansicht zu sehen.', 16, 24);
        return;
      }

      // Frustum Geometrie (normiert)
      const dNear = 1.0;
      const dFar = 2.2;
      const wNear = Math.tan(hHalf) * dNear;
      const hNear = Math.tan(vHalf) * dNear;
      const wFar = Math.tan(hHalf) * dFar;
      const hFar = Math.tan(vHalf) * dFar;

      const near = [
        [-wNear, -hNear, dNear],
        [ wNear, -hNear, dNear],
        [ wNear,  hNear, dNear],
        [-wNear,  hNear, dNear],
      ];
      const far = [
        [-wFar, -hFar, dFar],
        [ wFar, -hFar, dFar],
        [ wFar,  hFar, dFar],
        [-wFar,  hFar, dFar],
      ];
      const apex = [0, 0, 0.2];

      // Kamera‑Positionsoffset
      const offset = [camX, camY, camZ];
      const add = (p) => [p[0] + offset[0], p[1] + offset[1], p[2] + offset[2]];


      // Hilfsfunktion Linie
      const line = (a, b, color, width = 2) => {
        const A = project(applyRot(add(a)), w, h);
        const B = project(applyRot(add(b)), w, h);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(A[0], A[1]);
        ctx.lineTo(B[0], B[1]);
        ctx.stroke();
      };

      // Near/Far Rechtecke
      ctx.strokeStyle = border; ctx.lineWidth = 2;
      ctx.beginPath();
      let p = project(applyRot(add(near[0])), w, h); ctx.moveTo(p[0], p[1]);
      for (let i = 1; i < 4; i++) { p = project(applyRot(add(near[i])), w, h); ctx.lineTo(p[0], p[1]); }
      ctx.closePath(); ctx.stroke();

      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      p = project(applyRot(add(far[0])), w, h); ctx.moveTo(p[0], p[1]);
      for (let i = 1; i < 4; i++) { p = project(applyRot(add(far[i])), w, h); ctx.lineTo(p[0], p[1]); }
      ctx.closePath(); ctx.stroke();
      ctx.setLineDash([]);

      // Frustum Kanten
      for (let i = 0; i < 4; i++) {
        line(apex, near[i], secondary, 2);
        line(near[i], far[i], accent, 2);
      }
      // Kamera‑Geometrie (Körper als Quader, Linse als Wedge)
      // Körper
      const bodyZ0 = 0.08; // weiter hinten
      const bodyZ1 = 0.18; // nahe der Linse
      const bodyHalfW = 0.12;
      const bodyHalfH = 0.09;
      const bodyNear = [
        [-bodyHalfW, -bodyHalfH, bodyZ0],
        [ bodyHalfW, -bodyHalfH, bodyZ0],
        [ bodyHalfW,  bodyHalfH, bodyZ0],
        [-bodyHalfW,  bodyHalfH, bodyZ0],
      ];
      const bodyFar = [
        [-bodyHalfW, -bodyHalfH, bodyZ1],
        [ bodyHalfW, -bodyHalfH, bodyZ1],
        [ bodyHalfW,  bodyHalfH, bodyZ1],
        [-bodyHalfW,  bodyHalfH, bodyZ1],
      ];
      // Körper‑Kanten zeichnen (dunkelgrau)
      ctx.strokeStyle = bodyStroke; ctx.lineWidth = 2;
      ctx.beginPath();
      p = project(applyRot(add(bodyNear[0])), w, h); ctx.moveTo(p[0], p[1]);
      for (let i = 1; i < 4; i++) { p = project(applyRot(add(bodyNear[i])), w, h); ctx.lineTo(p[0], p[1]); }
      ctx.closePath(); ctx.fillStyle = bodyFill; ctx.fill(); ctx.stroke();
      ctx.beginPath();
      p = project(applyRot(add(bodyFar[0])), w, h); ctx.moveTo(p[0], p[1]);
      for (let i = 1; i < 4; i++) { p = project(applyRot(add(bodyFar[i])), w, h); ctx.lineTo(p[0], p[1]); }
      ctx.closePath(); ctx.fillStyle = bodyFill; ctx.fill(); ctx.stroke();
      for (let i = 0; i < 4; i++) line(bodyNear[i], bodyFar[i], bodyStroke, 2);

      // Linse als Wedge zur Apex
      const lensZ = bodyZ1 - 0.01; // knapp vor der Körperfront
      const lensHalfW = 0.08;
      const lensHalfH = 0.06;
      const lensFace = [
        [-lensHalfW, -lensHalfH, lensZ],
        [ lensHalfW, -lensHalfH, lensZ],
        [ lensHalfW,  lensHalfH, lensZ],
        [-lensHalfW,  lensHalfH, lensZ],
      ];
      ctx.strokeStyle = accent; ctx.lineWidth = 2;
      ctx.beginPath();
      p = project(applyRot(add(lensFace[0])), w, h); ctx.moveTo(p[0], p[1]);
      for (let i = 1; i < 4; i++) { p = project(applyRot(add(lensFace[i])), w, h); ctx.lineTo(p[0], p[1]); }
      ctx.closePath(); ctx.stroke();
      for (let i = 0; i < 4; i++) line(lensFace[i], apex, secondary, 2);

      // Sensor‑Ebene hinter der Linse
      // Sensor‑Ebene hinter der Linse (Sensor in den Kamerakörper einpassen)
      if (sensorDims) {
        const dSensor = 0.15;
        const aspect = (sensorDims.width && sensorDims.height) ? (sensorDims.width / sensorDims.height) : 1;
        // Innere Grenzen des Körpers (etwas kleiner als die Außenkante)
        const innerW = bodyHalfW * 0.85;
        const innerH = bodyHalfH * 0.85;
        // Höhe zuerst anpassen, Breite aus Aspect ableiten; ggf. klammern
        let hS = innerH;
        let wS = hS * aspect;
        if (wS > innerW) {
          const scale = innerW / wS;
          wS = innerW;
          hS = hS * scale;
        }
        const sensorRect = [
          [-wS, -hS, dSensor],
          [ wS, -hS, dSensor],
          [ wS,  hS, dSensor],
          [-wS,  hS, dSensor],
        ];
        ctx.beginPath();
        let sp = project(applyRot(add(sensorRect[0])), w, h); ctx.moveTo(sp[0], sp[1]);
        for (let i = 1; i < 4; i++) { sp = project(applyRot(add(sensorRect[i])), w, h); ctx.lineTo(sp[0], sp[1]); }
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.fill();
        ctx.strokeStyle = border; ctx.lineWidth = 1.5; ctx.stroke();
        for (let i = 0; i < 4; i++) line(apex, sensorRect[i], secondary, 1);
        const labelPos2 = project(applyRot(add(sensorRect[2])), w, h);
        ctx.fillStyle = textColor;
        ctx.font = '12px sans-serif';
        ctx.fillText('Sensor-Position', labelPos2[0] - 60, labelPos2[1] + 16);
      }

      // Fokus- und DOF-Ebenen (optional)
      const planeRectAtDepth = (z) => {
        const wP = Math.tan(hHalf) * z;
        const hP = Math.tan(vHalf) * z;
        return [
          [-wP, -hP, z],
          [ wP, -hP, z],
          [ wP,  hP, z],
          [-wP,  hP, z],
        ];
      };
      const drawPlane = (rect, strokeColor, fillAlpha = 0.08, label) => {
        ctx.beginPath();
        let p0 = project(applyRot(add(rect[0])), w, h);
        ctx.moveTo(p0[0], p0[1]);
        for (let i = 1; i < 4; i++) {
          const pi = project(applyRot(add(rect[i])), w, h);
          ctx.lineTo(pi[0], pi[1]);
        }
        ctx.closePath();
        ctx.save();
        ctx.globalAlpha = fillAlpha;
        ctx.fillStyle = strokeColor;
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        if (label) {
          const labelPos = project(applyRot(add(rect[2])), w, h);
          drawTag(label, labelPos[0] - 70, labelPos[1] + 16, strokeColor, 0.6);
        }
      };

      if (optics?.dof && focusDistance && focusDistance > 0) {
        const focusZ = 1.6; // Referenztiefe für die Fokus-Ebene (im Frustum)
        const clamp = (x, min, max) => Math.max(min, Math.min(max, x));
        const mapDepth = (distM) => clamp(focusZ * (distM / focusDistance), 0.4, 2.6);
        const nearZ = mapDepth(optics.dof.near);
        const farZ = optics.dof.far != null ? mapDepth(optics.dof.far) : 2.6;
        const focusRect = planeRectAtDepth(focusZ);
        const nearRect = planeRectAtDepth(nearZ);
        const farRect = planeRectAtDepth(farZ);
        // Farben für Ebenen
        const focusCol = '#22c55e'; // grün
        const nearCol = '#f59e0b'; // orange
        const farCol = '#0ea5e9';  // cyan
        drawPlane(focusRect, focusCol, 0.10, `Fokus ${focusDistance.toFixed(2)} m`);
        drawPlane(nearRect, nearCol, 0.08, `Nah ${optics.dof.near.toFixed(2)} m`);
        drawPlane(farRect, farCol, 0.08, `Fern ${optics.dof.far != null ? optics.dof.far.toFixed(2)+' m' : '∞'}`);
      }

      // Legende oben links
      const legendX = 16, legendY = 16;
      const legendItems = [
        { text: 'Fokus', color: '#22c55e' },
        { text: 'Nahgrenze', color: '#f59e0b' },
        { text: 'Ferngrenze', color: '#0ea5e9' },
      ];
      ctx.save();
      ctx.font = '13px sans-serif';
      const squareSize = 10;
      let yCursor = legendY;
      // Hintergrundplatte
      const legendWidth = 140;
      const legendHeight = legendItems.length * 22 + 12;
      roundedRect(legendX - 6, legendY - 8, legendWidth, legendHeight, 8);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fill();
      for (const item of legendItems) {
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, yCursor, squareSize, squareSize);
        ctx.fillStyle = item.color;
        ctx.fillText(item.text, legendX + squareSize + 8, yCursor + squareSize);
        yCursor += 22;
      }
      ctx.restore();

      // Beschriftungen unten: farblich gekennzeichnet und mit Hintergrund
      drawTag(`Anzeige‑Kamera HFOV: ${effectiveFov.h}°`, 16, h - 44, accent, 0.5);
      drawTag(`Anzeige‑Kamera VFOV: ${effectiveFov.v}°`, 16, h - 20, secondary, 0.5);
      if (sensorDims) {
        const sensorText = `Sensor: ${sensorDims.width} × ${sensorDims.height} mm`;
        // rechts unten ausrichten
        ctx.font = '13px sans-serif';
        const tw = ctx.measureText(sensorText).width;
        const padX = 8;
        const xRight = w - tw - padX - 20;
        drawTag(sensorText, xRight, h - 20, border, 0.5);
      }
    };

    useEffect(() => { draw(); }, [fov, effectiveFov, sensorDims, yaw, pitch, zoom, camX, camY, camZ, projection3D, optics, focusDistance]);

    const onDown = (e) => { setDragging(true); lastPos.current = { x: e.clientX, y: e.clientY }; };
    const onMove = (e) => {
      if (!dragging || !lastPos.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      setYaw((y) => y + dx * 0.01);
      setPitch((p) => Math.max(-Math.PI * 120 / 180, Math.min(Math.PI * 120 / 180, p + dy * 0.01)));
      lastPos.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { setDragging(false); lastPos.current = null; };

    const onWheel = (e) => {
      e.preventDefault();
      const dir = Math.sign(e.deltaY);
      setZoom((z) => {
        const target = dir > 0 ? z * 0.92 : z * 1.08;
        return Math.min(3.0, Math.max(0.1, target));
      });
    };

    const resetView = () => {
      setYaw(defaults.current.yaw);
      setPitch(defaults.current.pitch);
      setZoom(defaults.current.zoom);
      setCamX(defaults.current.camX);
      setCamY(defaults.current.camY);
      setCamZ(defaults.current.camZ);
      setProjection3D(defaults.current.projection3D || 'isometric');
    };
    const setCurrentAsDefault = () => {
      defaults.current = { yaw, pitch, zoom, camX, camY, camZ, projection3D };
      try {
        localStorage.setItem('fov3d_defaults', JSON.stringify(defaults.current));
      } catch (e) {
        // Ignoriere Persistenzfehler (z. B. privates Browserfenster)
      }
    };

    return (
      <div className="fov-3d-container">
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          onWheel={onWheel}
        />
      <div className="hint">Ziehe mit der Maus, um zu drehen; Mausrad zoomt</div>
      <div className="fov-3d-actions">
        <button className="btn-reset" onClick={resetView}>Ansicht zurücksetzen</button>
        <button className="btn-reset" onClick={setCurrentAsDefault}>Als Standard übernehmen</button>
        <div className="view-toggle" aria-label="Darstellung umschalten">
          <button className={projection3D === 'isometric' ? 'active' : ''} onClick={() => setProjection3D('isometric')}>Isometrisch</button>
          <button className={projection3D === 'perspective' ? 'active' : ''} onClick={() => setProjection3D('perspective')}>Perspektivisch</button>
        </div>
      </div>
      <div className="fov-3d-controls">
        <div className="control">
          <label>Yaw</label>
          <input type="range" min="0" max="360" step="1" value={Math.round(toDeg(yaw))} onChange={(e)=>setYaw(Number(e.target.value) * Math.PI / 180)} />
          <div className="value">{Math.round(toDeg(yaw))}°</div>
        </div>
        <div className="control">
          <label>Pitch</label>
          <input type="range" min="-120" max="120" step="1" value={Math.round(toDeg(pitch))} onChange={(e)=>setPitch(Number(e.target.value) * Math.PI / 180)} />
          <div className="value">{Math.round(toDeg(pitch))}°</div>
        </div>
        <div className="control">
          <label>Zoom</label>
          <input type="range" min="0.1" max="3.0" step="0.01" value={zoom} onChange={(e)=>setZoom(Number(e.target.value))} />
          <div className="value">{zoom.toFixed(2)}x</div>
        </div>
        <div className="control">
          <label>Kamera‑X</label>
          <input type="range" min="-2.0" max="2.0" step="0.01" value={camX} onChange={(e)=>setCamX(Number(e.target.value))} />
          <div className="value">{camX.toFixed(2)}</div>
        </div>
        <div className="control">
          <label>Kamera‑Y</label>
          <input type="range" min="-2.0" max="2.0" step="0.01" value={camY} onChange={(e)=>setCamY(Number(e.target.value))} />
          <div className="value">{camY.toFixed(2)}</div>
        </div>
        <div className="control">
          <label>Kamera‑Z</label>
          <input type="range" min="-3.0" max="3.0" step="0.01" value={camZ} onChange={(e)=>setCamZ(Number(e.target.value))} />
          <div className="value">{camZ.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
  };
  const FovDiagram = ({ fov, sensorDims }) => {
    const width = 640; const height = 360;
    const cx = 80; const cy = height/2; // Linsen-Apex
    const r = 140; // Radius für FOV-Winkel
    const rectCenterX = 360; // Sensor-Darstellung rechts
    const scale = sensorDims ? Math.min(260 / sensorDims.width, 200 / sensorDims.height) : 1;
    const rectW = sensorDims ? sensorDims.width * scale : 0;
    const rectH = sensorDims ? sensorDims.height * scale : 0;
    const rectX = rectCenterX - rectW/2;
    const rectY = cy - rectH/2;

    const toRad = (deg) => (deg || 0) * Math.PI / 180;
    const halfH = toRad((fov?.h || 0) / 2);
    const h1 = { x: cx + r * Math.cos(halfH), y: cy + r * Math.sin(halfH) };
    const h2 = { x: cx + r * Math.cos(halfH), y: cy - r * Math.sin(halfH) };

    const halfV = toRad((fov?.v || 0) / 2);
    const v1 = { x: cx + r * Math.sin(halfV), y: cy - r * Math.cos(halfV) };
    const v2 = { x: cx - r * Math.sin(halfV), y: cy - r * Math.cos(halfV) };

    return (
      <div className="fov-diagram-container">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="FOV Diagramm">
          {/* Hintergrund grid leicht */}
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="var(--border-color)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={width} height={height} fill="url(#grid)" opacity="0.12" />

          {/* Linsen-Apex */}
          <circle cx={cx} cy={cy} r="6" fill="var(--secondary-color)" />
          <text x={cx + 10} y={cy - 10} fill="var(--text-color)" fontSize="12">Linse</text>

          {/* Horizontaler FOV-Winkel */}
          <line x1={cx} y1={cy} x2={h1.x} y2={h1.y} stroke="var(--accent-color)" strokeWidth="2" />
          <line x1={cx} y1={cy} x2={h2.x} y2={h2.y} stroke="var(--accent-color)" strokeWidth="2" />
          <path d={`M ${cx + 20} ${cy} A 20 20 0 0 1 ${cx + 20*Math.cos(halfH)} ${cy + 20*Math.sin(halfH)}`} fill="none" stroke="var(--accent-color)" strokeWidth="2" />
          <path d={`M ${cx + 20} ${cy} A 20 20 0 0 0 ${cx + 20*Math.cos(halfH)} ${cy - 20*Math.sin(halfH)}`} fill="none" stroke="var(--accent-color)" strokeWidth="2" />
          <text x={cx + 60} y={cy - 24} fill="var(--text-color)" fontSize="12">HFOV: {fov?.h ? `${fov.h}°` : '—'}</text>

          {/* Vertikaler FOV-Winkel (schematisch) */}
          <line x1={cx} y1={cy} x2={v1.x} y2={v1.y} stroke="var(--secondary-color)" strokeWidth="2" opacity="0.8" />
          <line x1={cx} y1={cy} x2={v2.x} y2={v2.y} stroke="var(--secondary-color)" strokeWidth="2" opacity="0.8" />
          <text x={cx + 60} y={cy + 24} fill="var(--text-color)" fontSize="12">VFOV: {fov?.v ? `${fov.v}°` : '—'}</text>

          {/* Sensorrahmen (mm skaliert) */}
          {sensorDims && (
            <>
              <rect x={rectX} y={rectY} width={rectW} height={rectH} fill="none" stroke="var(--border-color)" strokeWidth="2" />
              <line x1={rectX} y1={rectY} x2={rectX + rectW} y2={rectY + rectH} stroke="var(--border-color)" strokeDasharray="4 4" />
              <text x={rectX} y={rectY - 8} fill="var(--text-color)" fontSize="12">Sensor: {sensorDims.width} × {sensorDims.height} mm</text>
              <text x={rectX} y={rectY + rectH + 16} fill="var(--text-color)" fontSize="12">Crop: {fov?.crop ? `${fov.crop}×` : '—'}</text>
              <text x={rectX + rectW - 80} y={rectY + rectH + 16} fill="var(--text-color)" fontSize="12">DFOV: {fov?.d ? `${fov.d}°` : '—'}</text>
            </>
          )}
        </svg>
      </div>
    );
  };