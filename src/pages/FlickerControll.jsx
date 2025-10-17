import { useState, useMemo } from 'react';
import './FlickerControll.css';
import { useLanguage } from '../contexts/LanguageContext';
import { flickerSafeGuidelines, logCExposureInfo, eiBehaviorNotes, getManufacturers } from '../data/cameraDatabase';

const FlickerControll = () => {
  const { t } = useLanguage();

  // Flicker‑Safe Infos
  const [mainsFrequency, setMainsFrequency] = useState('50Hz');
  const [infoFramerate, setInfoFramerate] = useState('24fps');

  // Herstellerauswahl für LogC/EI Hinweise
  const manufacturers = useMemo(() => getManufacturers(), []);
  const [selectedManufacturer, setSelectedManufacturer] = useState('ARRI');

  // Shutter‑Angle Rechner
  const [calcFramerate, setCalcFramerate] = useState(24);
  const [calcAngle, setCalcAngle] = useState(180);
  const exposureTimeFromAngle = (angle, fps) => {
    const t = (Number(angle) / 360) / Number(fps || 1);
    if (!isFinite(t) || t <= 0) return '';
    const denom = Math.round(1 / t);
    return `1/${denom} s`;
  };
  const angleFromExposure = (exposureStr, fps) => {
    const match = String(exposureStr).match(/1\/(\d+)/);
    const denom = match ? Number(match[1]) : undefined;
    if (!denom || !fps) return '';
    const t = 1 / denom;
    const angle = t * 360 * Number(fps);
    return Math.round(angle);
  };
  const [calcExposureStr, setCalcExposureStr] = useState(exposureTimeFromAngle(180, 24));

  return (
    <div className="flicker-controll-page">
      <h1>{t('tools.flicker.title', 'Flicker Control')}</h1>

      {/* Kamera‑Infos: Flicker‑Safe & LogC/EI */}
      <div className="card">
        <h2>{t('tools.flicker.cameraInfo', 'Kamera‑Infos')}</h2>
        <div className="form-row">
          <div className="form-group">
            <label>{t('tools.flicker.mainsFrequency', 'Netzfrequenz')}:</label>
            <select value={mainsFrequency} onChange={(e) => setMainsFrequency(e.target.value)}>
              <option value="50Hz">50Hz (EU)</option>
              <option value="60Hz">60Hz (US)</option>
            </select>
          </div>
          <div className="form-group">
            <label>{t('tools.flicker.framerate', 'Framerate')}:</label>
            <select value={infoFramerate} onChange={(e) => setInfoFramerate(e.target.value)}>
              <option value="24fps">24 fps</option>
              <option value="25fps">25 fps</option>
              <option value="30fps">30 fps</option>
              <option value="50fps">50 fps</option>
              <option value="60fps">60 fps</option>
            </select>
          </div>
          <div className="form-group" style={{ alignSelf: 'flex-end' }}>
            <label>{t('tools.flicker.flickerSafe', 'Flicker‑safe')}:</label>
            <div>
              {(() => {
                const info = (flickerSafeGuidelines[mainsFrequency] || {})[infoFramerate];
                return info
                  ? (<span>{`${t('tools.flicker.shutterAngle', 'Shutter')}: ${info.shutterAngle}° • ${t('tools.flicker.exposureTime', 'Belichtungszeit')}: ${info.exposureTime}`}</span>)
                  : (<span>{t('tools.flicker.na', 'N/A')}</span>);
              })()}
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>{t('camera.manufacturer', 'Kamera Hersteller')}:</label>
            <select value={selectedManufacturer} onChange={(e) => setSelectedManufacturer(e.target.value)}>
              {manufacturers.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        {selectedManufacturer === 'ARRI' && (
          <div className="info-grid">
            <div className="info-item" style={{ width: '100%' }}>
              <label><strong>{t('tools.flicker.arriLogC3', 'ARRI LogC3')}</strong>:</label>
              <span className="info-value">{logCExposureInfo['ARRI'].LogC3.middleGraySignal}</span>
            </div>
            <div className="info-item" style={{ width: '100%' }}>
              <label><strong>{t('tools.flicker.arriLogC4', 'ARRI LogC4')}</strong>:</label>
              <span className="info-value">{logCExposureInfo['ARRI'].LogC4.note}</span>
            </div>
            <div className="info-item" style={{ width: '100%' }}>
              <label><strong>{t('tools.flicker.eiBehavior', 'EI Verhalten')}</strong>:</label>
              <span className="info-value">{eiBehaviorNotes['ARRI']}</span>
            </div>
          </div>
        )}
      </div>

      {/* Shutter‑Angle Rechner */}
      <div className="card" style={{ marginTop: '16px' }}>
        <h2>{t('tools.flicker.shutterCalcTitle', 'Shutter‑Angle Rechner')}</h2>
        <div className="form-row">
          <div className="form-group">
            <label>{t('tools.flicker.framerateFpsLabel', 'Framerate (fps)')}:</label>
            <input
              type="number"
              min="1"
              value={calcFramerate}
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                setCalcFramerate(v);
                setCalcExposureStr(exposureTimeFromAngle(calcAngle, v));
              }}
            />
          </div>
          <div className="form-group">
            <label>{t('tools.flicker.shutterAngleLabel', 'Shutter Angle (°)')}:</label>
            <input
              type="number"
              min="1"
              max="360"
              value={calcAngle}
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                setCalcAngle(v);
                setCalcExposureStr(exposureTimeFromAngle(v, calcFramerate));
              }}
            />
          </div>
          <div className="form-group" style={{ alignSelf: 'flex-end' }}>
            <label>{t('tools.flicker.exposureTimeLabel', 'Belichtungszeit')}:</label>
            <input
              type="text"
              value={calcExposureStr}
              onChange={(e) => {
                const angle = angleFromExposure(e.target.value, calcFramerate);
                if (angle) setCalcAngle(angle);
                setCalcExposureStr(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="form-row">
          <button className="btn-outline" onClick={() => {
            setCalcAngle(180);
            setCalcExposureStr(exposureTimeFromAngle(180, calcFramerate));
          }}>{t('tools.flicker.apply180Rule', '180°‑Regel anwenden')}</button>
        </div>
        <small style={{ color: 'var(--text-secondary)' }}>
          {t('tools.flicker.formulaLabel', 'Formel: t = (Angle/360) · (1/FPS)')}
        </small>
      </div>
    </div>
  );
};

export default FlickerControll;