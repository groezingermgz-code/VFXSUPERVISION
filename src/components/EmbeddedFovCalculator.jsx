import React, { useMemo, useState, useRef, useEffect } from 'react';
import '../pages/FovCalculator.css';
import { useLanguage } from '../contexts/LanguageContext';
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
  getLensMeta,
  isZoomLens,
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
    extractTStop,
  } from '../utils/fovCalculator';

const EmbeddedFovCalculator = ({
  selectedManufacturer,
  selectedModel,
  selectedLensManufacturer,
  selectedLens,
  isAnamorphicEnabled,
  settings,
  onManufacturerChange,
  onModelChange,
  onCameraChange,
  onLensManufacturerChange,
  onLensChange,
  onAnamorphicToggle,
  compact = false,
  hideCameraSelectors = false,
  plain = false,
  hideControls = false,
  diagramOnly = false,
  slotAfterFocus = null,
  hideManualFocalInput = false,
  titleHint,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const [projectionType, setProjectionType] = useState('rectilinear');
  const [anamorphicFactor, setAnamorphicFactor] = useState(1);

  const manufacturers = useMemo(() => getManufacturers(), []);
  const models = useMemo(() => selectedManufacturer ? getModelsByManufacturer(selectedManufacturer) : [], [selectedManufacturer]);
  const formats = useMemo(() => (selectedManufacturer && selectedModel) ? getFormatsByModel(selectedManufacturer, selectedModel) : [], [selectedManufacturer, selectedModel]);

  const lensManufacturers = useMemo(() => (isAnamorphicEnabled ? getAnamorphicLensManufacturers() : getLensManufacturers()), [isAnamorphicEnabled]);
  const lenses = useMemo(() => (selectedLensManufacturer ? (isAnamorphicEnabled ? getAnamorphicLensesByManufacturer(selectedLensManufacturer) : getLensesByManufacturer(selectedLensManufacturer)) : []), [isAnamorphicEnabled, selectedLensManufacturer]);

  const sensorSizeString = useMemo(() => {
    if (!selectedManufacturer || !selectedModel || !settings?.format) return null;
    return getSensorSizeByFormat(selectedManufacturer, selectedModel, settings.format);
  }, [selectedManufacturer, selectedModel, settings?.format]);

  const sensorDims = useMemo(() => parseSensorSize(sensorSizeString), [sensorSizeString]);

  const numericFrom = (value) => {
    if (value == null) return 0;
    const direct = parseFloat(value);
    if (!isNaN(direct) && isFinite(direct)) return direct;
    const extracted = extractFocalLength(String(value));
    return extracted || 0;
  };
  const numericFromAny = (value) => {
    const s = String(value || '');
    let cleaned = s.replace(',', '.').replace(/[^0-9.]/g, '');
    const firstDot = cleaned.indexOf('.');
    if (firstDot !== -1) {
      cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
    }
    const n = parseFloat(cleaned);
    return !isNaN(n) && isFinite(n) ? n : 0;
  };

  const focal = useMemo(() => numericFrom(settings?.focalLength), [settings?.focalLength]);
  const ap = useMemo(() => numericFromAny(settings?.aperture), [settings?.aperture]);
  const fd = useMemo(() => parseFloat(settings?.focusDistance) || 0, [settings?.focusDistance]);

  const fov = useMemo(() => {
    if (!sensorDims || !focal || focal <= 0) return null;
    return {
      h: calculateHorizontalFOV(focal, sensorDims.width * (anamorphicFactor || 1), projectionType),
      v: calculateVerticalFOV(focal, sensorDims.height, projectionType),
      d: calculateDiagonalFOV(focal, sensorDims.width * (anamorphicFactor || 1), sensorDims.height, projectionType),
      crop: calculateCropFactor(sensorDims.width, sensorDims.height),
    };
  }, [sensorDims, focal, projectionType, anamorphicFactor]);

  const optics = useMemo(() => {
    if (!sensorDims || !focal || focal <= 0 || !ap || ap <= 0) return null;
    const coc = calculateCircleOfConfusion(sensorDims.width, sensorDims.height);
    const H = coc ? calculateHyperfocal(focal, ap, coc) : null;
    const dof = (coc && fd && fd > 0) ? calculateDOF(focal, ap, coc, fd) : null;
    return { coc, H, dof };
  }, [sensorDims, focal, ap, fd]);

  const lensInfo = useMemo(() => {
    const full = (selectedLensManufacturer && selectedLens) ? getLensFullName(selectedLensManufacturer, selectedLens) : '';
    const factor = extractAnamorphicFactor(full);
    const isZoom = /\d+\s*-\s*\d+mm/i.test(full);
    const isMacro = /macro/i.test(full);
    const baseType = factor > 1 ? `Anamorphic ${factor}x` : 'Spherical';
    const subtype = `${isZoom ? 'Zoom' : 'Prime'}${isMacro ? ' / Macro' : ''}`;
    return { fullName: full, factor, type: `${baseType} / ${subtype}` };
  }, [selectedLensManufacturer, selectedLens]);

  useEffect(() => {
    const full = lensInfo.fullName || '';
    const afRaw = extractAnamorphicFactor(full);
    const af = afRaw || (isAnamorphicEnabled ? 2 : 1);
    setAnamorphicFactor(af);
    onCameraChange?.({ target: { name: 'anamorphicFactor', value: String(af) } });
  }, [lensInfo.fullName, isAnamorphicEnabled]);

  // Wenn im Objektivnamen ein T‑Stop vorhanden ist, Blendenwert automatisch übernehmen (ohne "T"‑Präfix)
  useEffect(() => {
    const full = lensInfo.fullName || '';
    const tStop = extractTStop(full);
    if (tStop && tStop > 0) {
      const val = String(tStop);
      // Schreibe numerischen Wert (z. B. "2.8") nach settings.aperture
      onCameraChangeRef.current?.({ target: { name: 'aperture', value: val } });
    }
  }, [lensInfo.fullName]);

  // Stabilisiere Handler-Referenz, um Endlosschleifen bei Effekt-Updates zu vermeiden
  const onCameraChangeRef = useRef(onCameraChange);
  useEffect(() => { onCameraChangeRef.current = onCameraChange; }, [onCameraChange]);

  // Synchronisiere hyperfokale Distanz nur bei Wertänderung
  const lastHyperfocalRef = useRef(null);
  useEffect(() => {
    if (optics?.H == null) return;
    const value = `${optics.H.toFixed(2)} m`;
    if (lastHyperfocalRef.current === value) return;
    lastHyperfocalRef.current = value;
    onCameraChangeRef.current?.({ target: { name: 'hyperfocalDistance', value } });
  }, [optics?.H]);

  // Standardwert für Fokusdistanz: 3 m, wenn nicht gesetzt
  useEffect(() => {
    if (!settings?.focusDistance) {
      onCameraChangeRef.current?.({ target: { name: 'focusDistance', value: '3' } });
    }
  }, [settings?.focusDistance]);

  // Standardwert für Blende: 4, wenn nicht gesetzt
  useEffect(() => {
    if (!settings?.aperture) {
      onCameraChangeRef.current?.({ target: { name: 'aperture', value: '4' } });
    }
  }, [settings?.aperture]);

  const sanitizeDecimal = (v) => {
    v = (v || '').toString();
    v = v.replace(',', '.');
    v = v.replace(/[^0-9.]/g, '');
    const firstDot = v.indexOf('.');
    if (firstDot !== -1) {
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
    }
    return v;
  };

  return (
    <div className="fov-page">
      {!compact && (
        <>
          <div className="fov-header">
            <h2>{t('tools.fov.header', 'FOV Calculator')}</h2>
            <p>{t('tools.fov.description', 'Compute field of view from sensor format and focal length.')}</p>
          </div>

          <div className="card info-card" role="note" aria-label="FOV info">
            <h3>{t('tools.fov.infoTitle', 'Info')}</h3>
            <div>
              <div className="info-section-title">{t('tools.fov.legendColorsTitle', 'Diagram colors')}</div>
              <ul className="info-list">
                <li>{t('tools.fov.legendBlue', 'Blue: Vertical FOV (VFOV); blue dot marks optical center.')}</li>
                <li>{t('tools.fov.legendRed', 'Red: Horizontal FOV (HFOV) – left/right extreme rays.')}</li>
                <li>{t('tools.fov.legendGray', 'Gray: Sensor frame (right) in mm incl. dashed diagonal (DFOV).')}</li>
              </ul>
              <div className="info-section-title">{t('tools.fov.readTitle', 'What you can read')}</div>
              <ul className="info-list">
                <li>{t('tools.fov.readHFOV', 'HFOV/VFOV/DFOV: angles update live.')}</li>
                <li>{t('tools.fov.readSensor', 'Sensor size: width × height in mm per format.')}</li>
                <li>{t('tools.fov.readCrop', 'Crop factor: sensor diagonal vs. full frame.')}</li>
              </ul>
              <div className="info-section-title">{t('tools.fov.hintTitle', 'Note')}</div>
              <p>{t('tools.fov.hintText', 'Schematic view: angles and sensor scale, not lens distortion.')}</p>
            </div>
          </div>
        </>
      )}

      {!hideControls && (
        <div className="card fov-controls">
          {!hideCameraSelectors && (
            <div className="control-row">
              <div className="form-group">
                <label>{t('tools.fov.controls.manufacturer', 'Manufacturer')}</label>
                <select value={selectedManufacturer || ''} onChange={onManufacturerChange} disabled={disabled}>
                  <option value="">{t('tools.fov.controls.selectPrompt', 'Please select…')}</option>
                  {manufacturers.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('tools.fov.controls.camera', 'Camera')}</label>
                <select value={selectedModel || ''} onChange={onModelChange} disabled={disabled || !selectedManufacturer}>
                  <option value="">{t('tools.fov.controls.selectPrompt', 'Please select…')}</option>
                  {models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('tools.fov.controls.format', 'Format')}</label>
                <select value={settings?.format || ''} onChange={onCameraChange} name="format" disabled={disabled || !selectedModel}>
                  <option value="">{t('tools.fov.controls.selectPrompt', 'Please select…')}</option>
                  {formats.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="control-row">
            <div className="form-group">
              <label style={{ color: '#6cbc75' }}>{t('tools.fov.controls.lensManufacturer', 'Lens Manufacturer')}</label>
              <select value={selectedLensManufacturer || ''} onChange={onLensManufacturerChange} disabled={disabled} style={{ color: (!selectedLensManufacturer ? 'red' : undefined) }}>
                <option value="">{t('tools.fov.controls.selectPrompt', 'Please select…')}</option>
                {lensManufacturers.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="Manuell">{t('common.manual')}</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ color: '#6cbc75' }}>{t('tools.fov.controls.lens', 'Lens')}{isAnamorphicEnabled ? ` • ×${Number(anamorphicFactor || 1).toFixed(2)}` : ''}</label>
              <select
                value={selectedLens || ''}
                onChange={(e) => {
                  onLensChange(e);
                  const fullName = getLensFullName(selectedLensManufacturer, e.target.value);
                  const fl = extractFocalLength(fullName);
                  if (fl) onCameraChange({ target: { name: 'focalLength', value: String(fl) } });
                  const afRaw = extractAnamorphicFactor(fullName);
                  const af = afRaw || (isAnamorphicEnabled ? 2 : 1);
                  setAnamorphicFactor(af);
                  onCameraChange?.({ target: { name: 'anamorphicFactor', value: String(af) } });
                }}
                disabled={disabled || !selectedLensManufacturer}
                style={{ color: (!selectedLens ? 'red' : undefined) }}
              >
                <option value="">{t('tools.fov.controls.selectPrompt', 'Please select…')}</option>
                {lenses.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
                <option value="Manuell">{t('common.manual')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('tools.fov.controls.anamorph', 'Anamorphic')}</label>
              <select
                value={!!isAnamorphicEnabled ? 'yes' : 'no'}
                onChange={(e) => {
                  const yes = e.target.value === 'yes';
                  onAnamorphicToggle?.({ target: { checked: yes } });
                }}
                disabled={disabled}
              >
                <option value="no">{t('common.no', 'Nein')}</option>
                <option value="yes">{t('common.yes', 'Ja')}</option>
              </select>
            </div>
              {!!isAnamorphicEnabled && (
                <div className="form-group">
                  <label>{t('tools.fov.controls.anamorphFactor', 'Squeeze‑Faktor')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={String(anamorphicFactor || 1)}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      const next = (!isNaN(v) && v >= 1) ? v : 1;
                      setAnamorphicFactor(next);
                      onCameraChange?.({ target: { name: 'anamorphicFactor', value: String(next) } });
                    }}
                    disabled={disabled}
                  />
                </div>
              )}
            {/* Squeeze‑Faktor Block wird weiter oben direkt nach der Lens‑Auswahl eingefügt */}
            {/* Lens Stabilization wurde unter Focus Distance verschoben */}
          </div>

          <div className="control-row">
            <div className="form-group">
              <label style={{ color: '#6cbc75' }}>{t('tools.fov.controls.focalLength', 'Focal Length (mm)')}</label>
              <input
                type="number"
                step="0.1"
                name="focalLength"
                placeholder={(function(){
                  const m = getLensMeta(selectedLensManufacturer, selectedLens);
                  const zoom = isZoomLens(selectedLensManufacturer, selectedLens);
                  if (!m) return 'e.g., 50';
                  return zoom && m.minMm != null && m.maxMm != null ? `${m.minMm}-${m.maxMm}mm` : (m.minMm != null ? `${m.minMm}mm` : 'e.g., 50');
                })()}
                min={(function(){
                  const m = getLensMeta(selectedLensManufacturer, selectedLens);
                  const zoom = isZoomLens(selectedLensManufacturer, selectedLens);
                  return (zoom && m && m.minMm != null) ? m.minMm : undefined;
                })()}
                max={(function(){
                  const m = getLensMeta(selectedLensManufacturer, selectedLens);
                  const zoom = isZoomLens(selectedLensManufacturer, selectedLens);
                  return (zoom && m && m.maxMm != null) ? m.maxMm : undefined;
                })()}
                value={settings?.focalLength || ''}
                onChange={(e) => {
                  let v = sanitizeDecimal(e.target.value);
                  const m = getLensMeta(selectedLensManufacturer, selectedLens);
                  const zoom = isZoomLens(selectedLensManufacturer, selectedLens);
                  if (zoom && m && m.minMm != null && m.maxMm != null) {
                    const num = parseFloat(v);
                    if (!isNaN(num)) {
                      const clamped = Math.max(m.minMm, Math.min(m.maxMm, num));
                      v = String(clamped);
                    }
                  }
                  onCameraChange({ target: { name: 'focalLength', value: v } });
                }}
                style={{ color: (!settings?.focalLength ? 'red' : undefined) }}
                disabled={disabled}
              />
              {isZoomLens(selectedLensManufacturer, selectedLens) && !hideManualFocalInput && (
                null
              )}
            </div>
              {isZoomLens(selectedLensManufacturer, selectedLens) && !hideManualFocalInput && (
                <div className="form-group">
                  <label style={{ color: '#6cbc75' }}>{t('tools.fov.controls.manualFocalLength', 'Brennweite (manuell)')}</label>
                  <input
                    type="number"
                    name="focalLength"
                    step="0.1"
                  placeholder={(function(){
                    const m = getLensMeta(selectedLensManufacturer, selectedLens);
                    if (!m || m.minMm == null || m.maxMm == null) return t('lens.focalLengthPlaceholderShort', 'z. B. 35');
                    return `${m.minMm}-${m.maxMm}mm`;
                  })()}
                  min={(function(){
                    const m = getLensMeta(selectedLensManufacturer, selectedLens);
                    return (m && m.minMm != null) ? m.minMm : undefined;
                  })()}
                  max={(function(){
                    const m = getLensMeta(selectedLensManufacturer, selectedLens);
                    return (m && m.maxMm != null) ? m.maxMm : undefined;
                  })()}
                    value={settings?.focalLength || ''}
                    onChange={(e) => {
                    const m = getLensMeta(selectedLensManufacturer, selectedLens);
                    let v = sanitizeDecimal(e.target.value);
                    if (m && m.minMm != null && m.maxMm != null) {
                      const num = parseFloat(v);
                      if (!isNaN(num)) {
                        const clamped = Math.max(m.minMm, Math.min(m.maxMm, num));
                        v = String(clamped);
                      }
                    }
                      onCameraChange({ target: { name: 'focalLength', value: v } });
                    }}
                    style={{ marginTop: '4px' }}
                    disabled={disabled}
                  />
                </div>
              )}
            <div className="form-group">
              <label style={{ color: '#6cbc75' }}>{t('tools.fov.controls.apertureFN', 'Aperture (f/N)')}</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="e.g., 2.8"
                name="aperture"
                value={sanitizeDecimal(settings?.aperture || '')}
                onChange={(e) => {
                  const v = sanitizeDecimal(e.target.value);
                  onCameraChange({ target: { name: 'aperture', value: v } });
                }}
                style={{ color: (!settings?.aperture ? 'red' : undefined) }}
                disabled={disabled}
              />
            </div>
            {isZoomLens(selectedLensManufacturer, selectedLens) && !hideManualFocalInput && (
              <>
                <div className="form-group">
                  <label style={{ color: '#6cbc75' }}>{t('tools.fov.controls.focusDistance', 'Focus Distance (m)')}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g., 5"
                    name="focusDistance"
                    value={settings?.focusDistance ?? '3'}
                    onChange={(e) => {
                      const v = sanitizeDecimal(e.target.value);
                      onCameraChange({ target: { name: 'focusDistance', value: e.target.value } });
                    }}
                    disabled={disabled}
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label style={{ color: '#6cbc75' }}>{t('tools.fov.controls.focusDistance', 'Focus Distance')}</label>
                  <input
                    type="range"
                    min="0.3"
                    max="100"
                    step="0.1"
                    value={Number(parseFloat(settings?.focusDistance ?? 3) || 3)}
                    onChange={(e) => onCameraChange({ target: { name: 'focusDistance', value: e.target.value } })}
                    disabled={disabled}
                  />
                  <div className="value">{(parseFloat(settings?.focusDistance ?? 3) || 3).toFixed(2)} m</div>
                </div>
              </>
            )}
            {/* Projection wurde unter Focus Distance verschoben */}
          </div>

          {(!isZoomLens(selectedLensManufacturer, selectedLens) || hideManualFocalInput) && (
            <div className="control-row">
              <div className="form-group">
                <label style={{ color: '#6cbc75' }}>{t('tools.fov.controls.focusDistance', 'Focus Distance (m)')}</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="e.g., 5"
                name="focusDistance"
                value={settings?.focusDistance ?? '3'}
                onChange={(e) => {
                  const v = sanitizeDecimal(e.target.value);
                  onCameraChange({ target: { name: 'focusDistance', value: e.target.value } });
                }}
                disabled={disabled}
              />
              </div>
              <div className="form-group" style={{flex: 1}}>
                <label style={{ color: '#6cbc75' }}>{t('tools.fov.controls.focusDistance', 'Focus Distance')}</label>
              <input
                type="range"
                min="0.3"
                max="100"
                step="0.1"
                value={Number(parseFloat(settings?.focusDistance ?? 3) || 3)}
                onChange={(e) => onCameraChange({ target: { name: 'focusDistance', value: e.target.value } })}
                disabled={disabled}
              />
                <div className="value">{(parseFloat(settings?.focusDistance ?? 3) || 3).toFixed(2)} m</div>
              </div>
            </div>
          )}
          {/* Zusätzliche Steuerungen unterhalb Focus Distance: Projection & Lens Stabilization */}
          <div className="control-row">
            <div className="form-group">
              <label>{t('tools.fov.controls.projection', 'Projection')}</label>
              <select value={projectionType} onChange={(e) => setProjectionType(e.target.value)}>
                <option value="rectilinear">{t('tools.fov.controls.projectionOptions.rectilinear', 'Rectilinear')}</option>
                <option value="fisheye-equidistant">{t('tools.fov.controls.projectionOptions.fisheyeEquidistant', 'Fisheye (equidistant)')}</option>
                <option value="fisheye-stereographic">{t('tools.fov.controls.projectionOptions.fisheyeStereographic', 'Fisheye (stereographic)')}</option>
              </select>
            </div>
            <div className="form-group" style={{ minWidth: 220 }}>
              <label>{t('lens.lensStabilization')}:</label>
              <select 
                name="lensStabilization" 
                value={settings?.lensStabilization || 'Aus'}
                onChange={onCameraChange}
                disabled={disabled}
              >
                <option value="">{t('common.select')}</option>
                <option value="Aus">{t('common.off')}</option>
                <option value="An">{t('common.on')}</option>
                <option value="Manuell">{t('common.manual')}</option>
              </select>
              {settings?.lensStabilization === 'Manuell' && (
                <input 
                  type="text"
                  name="manualLensStabilization"
                  placeholder={t('lens.lensStabilization')}
                  value={settings?.manualLensStabilization || ''}
                  onChange={onCameraChange}
                  style={{ marginTop: '8px' }}
                  disabled={disabled}
                />
              )}
            </div>
          </div>
          {slotAfterFocus ? (
            <div className="control-row">
              {slotAfterFocus}
            </div>
          ) : null}
        </div>
      )}

      {!diagramOnly && (
        <div className="card fov-results" style={plain ? { background: 'transparent', boxShadow: 'none', border: 'none', padding: '8px 12px' } : undefined}>
          <h3>{t('tools.fov.controls.resultTitle', 'Result')}</h3>
          <div className="result-grid" style={plain ? { gap: 6, fontSize: 12, lineHeight: 1.2 } : undefined}>
            <div className="result-item" style={plain ? { background: 'transparent', border: 'none', padding: 0 } : undefined}>
              <span className="label">{t('tools.fov.controls.sensorSize', 'Sensor Size')}</span>
              <span className="value">{sensorSizeString || t('tools.fov.controls.notAvailable', 'Not available')}</span>
            </div>
            <div className="result-item" style={plain ? { background: 'transparent', border: 'none', padding: 0 } : undefined}>
              <span className="label">{t('tools.fov.controls.lensInfo', 'Lens')}</span>
              <span className="value">{lensInfo.fullName || '—'}</span>
            </div>
            <div className="result-item" style={plain ? { background: 'transparent', border: 'none', padding: 0 } : undefined}>
              <span className="label">{t('tools.fov.controls.lensType', 'Lens Type')}</span>
              <span className="value">{lensInfo.fullName ? lensInfo.type : '—'}</span>
            </div>
            <div className="result-item" style={plain ? { background: 'transparent', border: 'none', padding: 0 } : undefined}>
              <span className="label">{t('tools.fov.controls.anamorphFactor', 'Anamorphic Factor')}</span>
              <span className="value">{lensInfo.fullName ? `${(anamorphicFactor || 1)}×` : '—'}</span>
            </div>
            <div className="result-item" style={plain ? { background: 'transparent', border: 'none', padding: 0 } : undefined}>
              <span className="label">{t('tools.fov.controls.horizontal', 'Horizontal')}</span>
              <span className="value">{fov?.h ? `${fov.h}°` : '—'}</span>
            </div>
            <div className="result-item" style={plain ? { background: 'transparent', border: 'none', padding: 0 } : undefined}>
              <span className="label">{t('tools.fov.controls.vertical', 'Vertical')}</span>
              <span className="value">{fov?.v ? `${fov.v}°` : '—'}</span>
            </div>
            <div className="result-item" style={plain ? { background: 'transparent', border: 'none', padding: 0 } : undefined}>
              <span className="label">{t('tools.fov.controls.diagonal', 'Diagonal')}</span>
              <span className="value">{fov?.d ? `${fov.d}°` : '—'}</span>
            </div>
            <div className="result-item" style={plain ? { background: 'transparent', border: 'none', padding: 0 } : undefined}>
              <span className="label">{t('tools.fov.controls.cropVsFF', 'Crop factor (vs. full frame)')}</span>
              <span className="value">{fov?.crop ? `${fov.crop}×` : '—'}</span>
            </div>
          </div>
        </div>
      )}

      {!diagramOnly && (
        <div className="card fov-results" style={plain ? { background: 'transparent', boxShadow: 'none', border: 'none', padding: '8px 12px' } : undefined}>
          <h3>{t('tools.fov.focusTitle', 'Focus / DOF')}</h3>
          <div className="result-grid" style={plain ? { gap: 6, fontSize: 12, lineHeight: 1.2 } : undefined}>
            <div className="result-item" style={plain ? { background: 'transparent', border: 'none', padding: 0 } : undefined}>
              <span className="label">{t('camera.hyperfocalDistance', 'Hyperfocal Distance')}</span>
              <span className="value">{optics?.H != null ? `${optics.H.toFixed(2)} m` : '—'}</span>
            </div>
            <div className="result-item" style={plain ? { background: 'transparent', border: 'none', padding: 0 } : undefined}>
              <span className="label">{t('tools.fov.threeD.legendNear', 'Near limit')}</span>
              <span className="value">{optics?.dof?.near != null ? `${optics.dof.near.toFixed(2)} m` : '—'}</span>
            </div>
            <div className="result-item" style={plain ? { background: 'transparent', border: 'none', padding: 0 } : undefined}>
              <span className="label">{t('tools.fov.threeD.legendFar', 'Far limit')}</span>
              <span className="value">{optics?.dof?.far != null ? `${optics.dof.far.toFixed(2)} m` : '∞'}</span>
            </div>
            <div className="result-item" style={plain ? { background: 'transparent', border: 'none', padding: 0 } : undefined}>
              <span className="label">{t('tools.fov.totalDOF', 'Total depth of field')}</span>
              <span className="value">{optics?.dof ? (optics.dof.total === Infinity ? '∞' : `${optics.dof.total.toFixed(2)} m`) : '—'}</span>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={plain ? { background: 'transparent', boxShadow: 'none', border: 'none' } : undefined}>
        <h3 style={plain ? { fontSize: 14, marginBottom: 6 } : undefined}>
          {t('tools.fov.controls.diagramTitle', 'FOV Diagram')}
          {titleHint ? (
            <span style={{ color: 'var(--color-success, #2ecc71)' }}> ({titleHint})</span>
          ) : ''}
        </h3>
        <div className="fov-diagram-grid">
          <div>
            <div className="panel-title">{t('tools.fov.controls.panel2D', '2D')}</div>
            <FovDiagram fov={fov} sensorDims={sensorDims} plain={plain} />
          </div>
          <div>
            <div className="panel-title">{t('tools.fov.controls.panel3D', '3D')}</div>
            <FovDiagram3D fov={fov} sensorDims={sensorDims} optics={optics} focusDistance={parseFloat(settings?.focusDistance) || 0} plain={plain} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbeddedFovCalculator;

const FovDiagram3D = ({ fov, sensorDims, optics, focusDistance, plain = false }) => {
  const canvasRef = useRef(null);
  const { t } = useLanguage();
  const [yaw, setYaw] = useState(Math.PI / 4);
  const [pitch, setPitch] = useState(-Math.atan(1/Math.sqrt(2)));
  const [projection3D, setProjection3D] = useState('isometric');
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef(null);
  const [zoom, setZoom] = useState(0.32);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
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
        defaults.current = { yaw, pitch, zoom, camX, camY, camZ, projection3D };
      }
    } catch (e) {
      defaults.current = { yaw, pitch, zoom, camX, camY, camZ, projection3D };
    }
  }, []);

  const toRad = (deg) => (deg || 0) * Math.PI / 180;
  const effectiveFov = useMemo(() => fov || null, [fov]);
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
      return [cx + (p[0] * f) + panX, cy - (p[1] * f) + panY];
    }
    const z = p[2] + 0.0001;
    return [cx + (p[0] * f) / z + panX, cy - (p[1] * f) / z + panY];
  };

  const projectAtZoom = (p, w, h, zScale) => {
    const cx = w / 2, cy = h / 2;
    const f = w * 0.45 * zScale;
    if (projection3D === 'isometric') {
      return [cx + (p[0] * f), cy - (p[1] * f)];
    }
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
    const bg3d = (css.getPropertyValue('--card-bg')?.trim() || css.getPropertyValue('--background-color')?.trim() || '#05070a');

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

    const roundedRect = (x, y, width, height, radius = 6) => {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x, y + height - radius);
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

    ctx.clearRect(0, 0, w, h);
    if (!plain) {
      ctx.fillStyle = bg3d;
      ctx.fillRect(0, 0, w, h);
    }
    if (!fov?.h || !fov?.v) {
      ctx.fillStyle = textColor;
      ctx.font = '14px sans-serif';
      ctx.fillText(t('tools.fov.threeD.selectSensorFocalToSee3D', 'Select sensor & focal length to see the 3D view.'), 16, 24);
      return;
    }

    const hHalf = Math.atan(Math.tan(toRad(fov.h / 2)));
    const vHalf = Math.atan(Math.tan(toRad(fov.v / 2)));
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
    const offset = [camX, camY, camZ];
    const add = (p) => [p[0] + offset[0], p[1] + offset[1], p[2] + offset[2]];

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

    for (let i = 0; i < 4; i++) {
      line(apex, near[i], secondary, 2);
      line(near[i], far[i], accent, 2);
    }

    const bodyZ0 = 0.08;
    const bodyZ1 = 0.18;
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

    const lensZ = bodyZ1 - 0.01;
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

    if (sensorDims) {
      const dSensor = 0.15;
      const aspect = (sensorDims.width && sensorDims.height) ? (sensorDims.width / sensorDims.height) : 1;
      const innerW = bodyHalfW * 0.85;
      const innerH = bodyHalfH * 0.85;
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
      ctx.fillStyle = '#ddd';
      ctx.font = '12px sans-serif';
      ctx.fillText(t('tools.fov.threeD.sensorPosition', 'Sensor Position'), labelPos2[0] - 60, labelPos2[1] + 16);
    }

    const toDepth = (deg) => Math.tan(toRad(deg / 2));
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
      const focusZ = 1.6;
      const clamp = (x, min, max) => Math.max(min, Math.min(max, x));
      const mapDepth = (distM) => clamp(focusZ * (distM / focusDistance), 0.4, 2.6);
      const nearZ = mapDepth(optics.dof.near);
      const farZ = optics.dof.far != null ? mapDepth(optics.dof.far) : 2.6;
      const focusRect = planeRectAtDepth(focusZ);
      const nearRect = planeRectAtDepth(nearZ);
      const farRect = planeRectAtDepth(farZ);
      const focusCol = '#22c55e';
      const nearCol = '#f59e0b';
      const farCol = '#0ea5e9';
      drawPlane(focusRect, focusCol, 0.10, `${t('tools.fov.threeD.legendFocus', 'Focus')} ${focusDistance.toFixed(2)} m`);
      drawPlane(nearRect, nearCol, 0.08, `${t('tools.fov.threeD.legendNear', 'Near')} ${optics.dof.near.toFixed(2)} m`);
      drawPlane(farRect, farCol, 0.08, `${t('tools.fov.threeD.legendFar', 'Far')} ${optics.dof.far != null ? optics.dof.far.toFixed(2)+' m' : '∞'}`);
    }

    const legendX = 16, legendY = 16;
    const legendItems = [
      { text: t('tools.fov.threeD.legendFocus', 'Focus'), color: '#22c55e' },
      { text: t('tools.fov.threeD.legendNear', 'Near limit'), color: '#f59e0b' },
      { text: t('tools.fov.threeD.legendFar', 'Far limit'), color: '#0ea5e9' },
    ];
    ctx.save();
    ctx.font = '13px sans-serif';
    const squareSize = 10;
    let yCursor = legendY;
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
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = c.getBoundingClientRect();
      c.width = Math.max(320, Math.floor(rect.width * dpr));
      c.height = Math.max(220, Math.floor((rect.width * 0.6) * dpr));
      draw();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [fov, optics, projection3D, yaw, pitch, zoom, camX, camY, camZ]);

  useEffect(() => { draw(); });

  // Redraw on theme (dark/light) toggle by observing .app class changes
  useEffect(() => {
    const appEl = document.querySelector('.app');
    if (!appEl) return;
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          draw();
        }
      }
    });
    mo.observe(appEl, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !fov?.h || !fov?.v) return;
    const w = c.width, h = c.height;
    const toR = (deg) => (deg || 0) * Math.PI / 180;
    const hHalfLocal = Math.atan(Math.tan(toR(fov.h / 2)));
    const vHalfLocal = Math.atan(Math.tan(toR(fov.v / 2)));
    const rectAt = (z) => {
      const wP = Math.tan(hHalfLocal) * z;
      const hP = Math.tan(vHalfLocal) * z;
      return [
        [-wP, -hP, z], [wP, -hP, z], [wP, hP, z], [-wP, hP, z],
      ];
    };
    const dNear = 1.0, dFar = 2.2;
    const near = rectAt(dNear);
    const far = rectAt(dFar);
    const apex = [0, 0, 0.2];
    const bodyZ0 = 0.08, bodyZ1 = 0.18;
    const bodyHalfW = 0.12, bodyHalfH = 0.09;
    const bodyNear = [[-bodyHalfW,-bodyHalfH,bodyZ0],[bodyHalfW,-bodyHalfH,bodyZ0],[bodyHalfW,bodyHalfH,bodyZ0],[-bodyHalfW,bodyHalfH,bodyZ0]];
    const bodyFar = [[-bodyHalfW,-bodyHalfH,bodyZ1],[bodyHalfW,-bodyHalfH,bodyZ1],[bodyHalfW,bodyHalfH,bodyZ1],[-bodyHalfW,bodyHalfH,bodyZ1]];
    const lensZ = bodyZ1 - 0.01, lensHalfW = 0.08, lensHalfH = 0.06;
    const lensFace = [[-lensHalfW,-lensHalfH,lensZ],[lensHalfW,-lensHalfH,lensZ],[lensHalfW,lensHalfH,lensZ],[-lensHalfW,lensHalfH,lensZ]];
    const offset = [camX, camY, camZ];
    const add = (p) => [p[0] + offset[0], p[1] + offset[1], p[2] + offset[2]];
    const points = [];
    const collect = (arr) => { for (const p of arr) points.push(projectAtZoom(applyRot(add(p)), w, h, zoom)); };
    collect([apex]);
    collect(near); collect(far);
    collect(bodyNear); collect(bodyFar);
    collect(lensFace);
    if (sensorDims) {
      const aspect = (sensorDims.width && sensorDims.height) ? (sensorDims.width / sensorDims.height) : 1;
      const innerW = bodyHalfW * 0.85;
      const innerH = bodyHalfH * 0.85;
      let hS = innerH; let wS = hS * aspect;
      if (wS > innerW) { const scale = innerW / wS; wS = innerW; hS = hS * scale; }
      const sensorRect = [[-wS,-hS,0.15],[wS,-hS,0.15],[wS,hS,0.15],[-wS,hS,0.15]];
      collect(sensorRect);
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [px, py] of points) { if (px < minX) minX = px; if (py < minY) minY = py; if (px > maxX) maxX = px; if (py > maxY) maxY = py; }
    const pad = 24;
    const curW = Math.max(1, maxX - minX);
    const curH = Math.max(1, maxY - minY);
    const fitScaleW = (w - pad) / curW;
    const fitScaleH = (h - pad) / curH;
    const fitScale = Math.min(fitScaleW, fitScaleH) * 0.95;
    const targetZoom = Math.max(0.15, Math.min(1, zoom * fitScale));
    if (Math.abs(targetZoom - zoom) > 0.02) setZoom(targetZoom);

    // Auto-center with slight left bias so all elements are visible
    const boxCX = (minX + maxX) / 2;
    const boxCY = (minY + maxY) / 2;
    const desiredCX = (w / 2) - 24; // shift a bit to the left
    const desiredCY = h / 2;
    const newPanX = desiredCX - boxCX;
    const newPanY = desiredCY - boxCY;
    if (Math.abs(newPanX - panX) > 2) setPanX(newPanX);
    if (Math.abs(newPanY - panY) > 2) setPanY(newPanY);
  }, [fov, sensorDims, projection3D, yaw, pitch, camX, camY, camZ, panX, panY]);

  const toDeg = (rad) => (rad || 0) * 180 / Math.PI;

  const onMouseDown = (e) => { setDragging(true); lastPos.current = { x: e.clientX, y: e.clientY }; };
  const onMouseUp = () => { setDragging(false); lastPos.current = null; };
  const onMouseMove = (e) => {
    if (!dragging || !lastPos.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setYaw((y) => y + dx * 0.01);
    setPitch((p) => Math.max(-Math.PI/2, Math.min(Math.PI/2, p + dy * 0.01)));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div>
      <div className="panel-controls" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        {!plain && <label>{t('tools.fov.threeD.view3D', '3D view:')}</label>}
        {!plain && (
          <select value={projection3D} onChange={(e) => setProjection3D(e.target.value)}>
            <option value="isometric">{t('tools.fov.threeD.projectionIsometric', 'Isometric')}</option>
            <option value="perspective">{t('tools.fov.threeD.projectionPerspective', 'Perspective')}</option>
          </select>
        )}
        {!plain && <label>{t('tools.fov.threeD.zoom', 'Zoom')}</label>}
        {!plain && (
          <input type="range" min="0.15" max="1" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
        )}
        {!plain && (
          <button type="button" className="btn btn-secondary" onClick={() => {
          setYaw(defaults.current.yaw);
          setPitch(defaults.current.pitch);
          setZoom(defaults.current.zoom);
          setPanX(0);
          setPanY(0);
          setCamX(defaults.current.camX);
          setCamY(defaults.current.camY);
          setCamZ(defaults.current.camZ);
          setProjection3D(defaults.current.projection3D);
        }}>{t('tools.fov.threeD.reset', 'Reset')}</button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="fov-3d-canvas"
        style={{ width: '100%', height: 340, background: plain ? 'transparent' : 'var(--card-bg)', borderRadius: 8 }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onMouseMove={onMouseMove}
      />
    </div>
  );
};

const FovDiagram = ({ fov, sensorDims, plain = false }) => {
  const svgRef = useRef(null);
  const { t } = useLanguage();
  const [size, setSize] = useState({ w: 640, h: 280 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const update = () => {
      const w = svg.clientWidth || 640;
      const h = svg.clientHeight || 280;
      setSize({ w, h });
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const w = size.w;
  const h = size.h;
  const margin = Math.max(18, Math.min(32, Math.floor(Math.min(w, h) * 0.08)));
  const apexX = margin + 36;
  const apexY = h / 2;
  const ratio = (sensorDims?.height && sensorDims?.width)
    ? (sensorDims.height / sensorDims.width)
    : (9 / 16);
  const maxWByHeight = (h - 2 * margin) / ratio;
  const maxWByWidth = Math.max(40, w - apexX - 2 * margin);
  const sensorW = Math.max(40, Math.min(maxWByHeight, maxWByWidth));
  const w2 = sensorW / 2;
  const h2 = (sensorW * ratio) / 2;
  const centerX = w - margin - w2;
  const centerY = apexY;
  const sensorLeft = centerX - w2;
  const sensorRight = centerX + w2;
  const sensorTop = centerY - h2;
  const sensorBottom = centerY + h2;

  const label = (text, x, y, color = 'var(--text-color)') => (
    <text x={x} y={y} fill={color} fontSize="12" fontFamily="sans-serif">{text}</text>
  );

  return (
    <svg ref={svgRef} className="fov-svg" width="100%" height="280">
      {!plain && (<rect x="0" y="0" width="100%" height="100%" fill="var(--card-bg)" />)}
      <rect x={sensorLeft} y={sensorTop} width={w2 * 2} height={h2 * 2} fill="rgba(255,255,255,0.05)" stroke="var(--border-color)" strokeDasharray="6,4" />
      <line x1={apexX} y1={apexY} x2={sensorLeft} y2={sensorTop} stroke="var(--accent-color)" strokeWidth="2" />
      <line x1={apexX} y1={apexY} x2={sensorLeft} y2={sensorBottom} stroke="var(--accent-color)" strokeWidth="2" />
      <line x1={apexX} y1={apexY} x2={sensorRight} y2={sensorTop} stroke="var(--secondary-color)" strokeWidth="2" />
      <line x1={apexX} y1={apexY} x2={sensorRight} y2={sensorBottom} stroke="var(--secondary-color)" strokeWidth="2" />
      <circle cx={apexX} cy={apexY} r="4" fill="var(--secondary-color)" />
      {label(t('tools.fov.threeD.labelSensor', 'Sensor'), sensorRight - 26, sensorBottom + 18, 'var(--text-color)')}
      {label(`${t('tools.fov.threeD.labelHFOV', 'HFOV')} ${fov?.h ? `${fov.h}°` : '—'}`, apexX + 8, apexY - 10, 'var(--accent-color)')}
      {label(`${t('tools.fov.threeD.labelVFOV', 'VFOV')} ${fov?.v ? `${fov.v}°` : '—'}`, apexX + 8, apexY + 24, 'var(--secondary-color)')}
      {sensorDims?.width && sensorDims?.height && (
        <g>
          {label(`${sensorDims.width.toFixed(1)} mm`, centerX - 24, sensorTop - 8, 'var(--text-color)')}
          <g>
            <path d={`M ${sensorLeft - 14} ${centerY} L ${sensorLeft - 6} ${centerY - 6} M ${sensorLeft - 14} ${centerY} L ${sensorLeft - 6} ${centerY + 6}`} stroke="var(--border-color)" strokeWidth="2" fill="none" />
            <text x={sensorLeft - 6} y={centerY + 4} fill="var(--text-color)" fontSize="12" fontFamily="sans-serif" textAnchor="end">{`${sensorDims.height.toFixed(1)} mm`}</text>
          </g>
        </g>
      )}
    </svg>
  );
};