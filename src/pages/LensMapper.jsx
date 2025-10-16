import React, { useMemo, useState } from 'react';
import './LensMapper.css';
import {
  getManufacturers,
  getModelsByManufacturer,
  getFormatsByModel,
  getSensorSizeByFormat,
} from '../data/cameraDatabase';
import {
  getLensManufacturers,
  getLensesByManufacturer,
} from '../data/lensDatabase';
import {
  parseSensorSize,
  calculateHorizontalFOV,
  calculateVerticalFOV,
  calculateDiagonalFOV,
} from '../utils/fovCalculator';

function solveFocalForTargetFOV(target, dims, projection, type) {
  // Simple binary search to find focal length that yields the target FOV
  // type: 'h' | 'v' | 'd'
  if (!dims || !target || target <= 0) return null;
  let low = 0.5; // mm
  let high = 2000; // mm
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    let fov;
    if (type === 'h') fov = calculateHorizontalFOV(mid, dims.width, projection);
    else if (type === 'v') fov = calculateVerticalFOV(mid, dims.height, projection);
    else fov = calculateDiagonalFOV(mid, dims.width, dims.height, projection);
    if (fov > target) {
      // Need longer focal to reduce FOV
      low = mid;
    } else {
      high = mid;
    }
  }
  const focal = (low + high) / 2;
  return Math.round(focal * 10) / 10; // 0.1mm resolution
}

const LensMapper = () => {
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [sourceFormat, setSourceFormat] = useState('');
  const [focalLength, setFocalLength] = useState('');
  const [projectionType, setProjectionType] = useState('rectilinear');
  const [matchType, setMatchType] = useState('h'); // 'h' | 'v' | 'd'

  // Optik-Auswahl
  const [lensManufacturer, setLensManufacturer] = useState('');
  const [availableLenses, setAvailableLenses] = useState([]);
  const [selectedLens, setSelectedLens] = useState('');

  const manufacturers = useMemo(() => getManufacturers(), []);
  const models = useMemo(() => manufacturer ? getModelsByManufacturer(manufacturer) : [], [manufacturer]);
  const formats = useMemo(() => (manufacturer && model) ? getFormatsByModel(manufacturer, model) : [], [manufacturer, model]);
  const lensManufacturers = useMemo(() => getLensManufacturers(), []);

  const sourceSensorSizeString = useMemo(() => {
    if (!manufacturer || !model || !sourceFormat) return null;
    return getSensorSizeByFormat(manufacturer, model, sourceFormat);
  }, [manufacturer, model, sourceFormat]);

  const sourceDims = useMemo(() => parseSensorSize(sourceSensorSizeString), [sourceSensorSizeString]);
  const focal = useMemo(() => parseFloat(focalLength), [focalLength]);

  const sourceFOV = useMemo(() => {
    if (!sourceDims || !focal || focal <= 0) return null;
    return {
      h: calculateHorizontalFOV(focal, sourceDims.width, projectionType),
      v: calculateVerticalFOV(focal, sourceDims.height, projectionType),
      d: calculateDiagonalFOV(focal, sourceDims.width, sourceDims.height, projectionType),
    };
  }, [sourceDims, focal, projectionType]);

  // Helfer: Brennweite aus Objektivbezeichnung ableiten
  const extractFocalFromLens = (lensModel) => {
    if (!lensModel) return null;
    const zoomMatch = lensModel.match(/(\d+)\s*-\s*(\d+)\s*mm/i);
    if (zoomMatch) {
      const a = parseFloat(zoomMatch[1]);
      const b = parseFloat(zoomMatch[2]);
      if (!isNaN(a) && !isNaN(b)) {
        // Standard: Mittelwert als Startpunkt
        return ((a + b) / 2).toFixed(1);
      }
    }
    const singleMatch = lensModel.match(/(\d+)\s*mm/i);
    if (singleMatch) {
      const val = parseFloat(singleMatch[1]);
      if (!isNaN(val)) return val.toString();
    }
    return null;
  };

  const handleLensManufacturerChange = (e) => {
    const brand = e.target.value;
    setLensManufacturer(brand);
    setSelectedLens('');
    setAvailableLenses(brand ? getLensesByManufacturer(brand) : []);
  };

  const handleLensChange = (e) => {
    const lens = e.target.value;
    setSelectedLens(lens);
    const parsed = extractFocalFromLens(lens);
    if (parsed) setFocalLength(String(parsed));
  };

  const tableData = useMemo(() => {
    if (!sourceFOV || !manufacturer || !model) return [];
    return formats.map(fmt => {
      const sizeStr = getSensorSizeByFormat(manufacturer, model, fmt);
      const dims = parseSensorSize(sizeStr);
      if (!dims) return { format: fmt, sensor: sizeStr || '—', eqFocal: '—', hFOV: '—' };
      const targetFOV = matchType === 'h' ? sourceFOV.h : matchType === 'v' ? sourceFOV.v : sourceFOV.d;
      const eq = solveFocalForTargetFOV(targetFOV, dims, projectionType, matchType);
      const hWithOriginal = focal && focal > 0 ? calculateHorizontalFOV(focal, dims.width, projectionType) : null;
      return {
        format: fmt,
        sensor: sizeStr,
        eqFocal: eq ? `${eq} mm` : '—',
        hFOV: hWithOriginal ? `${hWithOriginal}°` : '—',
      };
    });
  }, [formats, manufacturer, model, sourceFOV, projectionType, matchType, focal]);

  const resetSelection = () => {
    setModel('');
    setSourceFormat('');
  };

  return (
    <div className="lensmapper-page">
      <div className="lensmapper-header">
        <h2>Lens‑Mapper</h2>
        <p>Äquivalent‑Brennweiten pro Format für gleiches Sichtfeld.</p>
      </div>

      {/* Infofeld */}
      <div className="card info-card" role="note" aria-label="Erklärung zum Lens‑Mapper">
        <h3>Info</h3>
        <div>
          <div className="info-section-title">Zweck</div>
          <p>Der Lens‑Mapper ermittelt je Kamerformat die Brennweite, die das gleiche horizontale/vertikale/diagonale Sichtfeld ergibt wie das Quell‑Format mit der angegebenen Brennweite.</p>
          
          <div className="info-section-title">Was du ablesen kannst</div>
          <ul className="info-list">
            <li><strong>Format</strong>: Die verfügbaren Formate des gewählten Kameramodells.</li>
            <li><strong>Sensor (mm)</strong>: Sensorbreite × ‑höhe in Millimetern, passend zum jeweiligen Format.</li>
            <li><strong>Äquiv. Brennweite</strong>: Numerisch berechnete Brennweite, die auf diesem Format das gleiche FOV wie die Quelle liefert (abhängig vom Projektionstyp).</li>
            <li><strong>HFOV (mit Original‑BW)</strong>: Horizontales Sichtfeld auf jedem Format, wenn die ursprüngliche Brennweite beibehalten wird – hilfreich zum Vergleich.</li>
          </ul>

          <div className="info-section-title">Hinweise</div>
          <ul className="info-list">
            <li>Der <em>Projektionstyp</em> (Rectilinear/Fisheye) wird beibehalten und beeinflusst die Äquivalenz.</li>
            <li>Die Äquivalenz wird per <em>numerischer Lösung</em> (binäre Suche) bis auf ~0.1 mm Genauigkeit berechnet.</li>
            <li>Reale Objektive können Abweichungen (Markierung, Verzeichnung, Toleranzen) aufweisen – die Werte sind idealisierte Rechnungen.</li>
          </ul>
        </div>
      </div>

      <div className="card lm-controls">
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
            <select value={model} onChange={(e) => { setModel(e.target.value); setSourceFormat(''); }} disabled={!manufacturer}>
              <option value="">Bitte wählen…</option>
              {models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Quell‑Format</label>
            <select value={sourceFormat} onChange={(e) => setSourceFormat(e.target.value)} disabled={!model}>
              <option value="">Bitte wählen…</option>
              {formats.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="control-row">
          <div className="form-group">
            <label>Optik Hersteller</label>
            <select value={lensManufacturer} onChange={handleLensManufacturerChange}>
              <option value="">Bitte wählen…</option>
              {lensManufacturers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Optik Modell</label>
            <select value={selectedLens} onChange={handleLensChange} disabled={!lensManufacturer}>
              <option value="">Bitte wählen…</option>
              {availableLenses.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="control-row">
          <div className="form-group">
            <label>Brennweite (mm)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="z. B. 50"
              value={focalLength}
              onChange={(e) => setFocalLength(e.target.value)}
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
          <div className="form-group">
            <label>Gleiches Sichtfeld</label>
            <select value={matchType} onChange={(e) => setMatchType(e.target.value)}>
              <option value="h">Horizontal</option>
              <option value="v">Vertikal</option>
              <option value="d">Diagonal</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card lm-results">
        <h3>Äquivalent‑Brennweiten (je Format)</h3>
        <table className="lm-table">
          <thead>
            <tr>
              <th>Format</th>
              <th>Sensor (mm)</th>
              <th>Äquiv. Brennweite</th>
              <th>HFOV (mit Original‑BW)</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map(row => (
              <tr key={row.format}>
                <td>{row.format}</td>
                <td>{row.sensor}</td>
                <td>{row.eqFocal}</td>
                <td>{row.hFOV}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LensMapper;