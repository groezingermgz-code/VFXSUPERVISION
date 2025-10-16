import { useState } from 'react';
import './LightingTools.css';
import { useLanguage } from '../contexts/LanguageContext';

const LightingTools = () => {
  const { t } = useLanguage();
  // Candela -> Lux
  const [cd, setCd] = useState('');
  const [distance, setDistance] = useState('');
  const [angleDeg, setAngleDeg] = useState('0');
  const cosTheta = Math.cos((Number(angleDeg || 0) * Math.PI) / 180);
  const lux = (() => {
    const I = Number(cd);
    const d = Number(distance);
    if (!I || !d || d <= 0) return '';
    const E = (I * cosTheta) / (d * d);
    return isFinite(E) ? E.toFixed(2) : '';
  })();

  // Belichtungsdosis H = E * t
  const [exposureTime, setExposureTime] = useState('');
  const dose = (() => {
    const E = Number(lux);
    const t = Number(exposureTime);
    if (!E || !t) return '';
    const H = E * t;
    return isFinite(H) ? H.toFixed(2) : '';
  })();

  return (
    <div className="lighting-tools-page">
      <h1>{t('nav.tools', 'Tools')} – Photometrie</h1>

      <div className="card">
        <h2>Candela → Lux (inkl. Cosinusgesetz)</h2>
        <div className="form-row">
          <div className="form-group">
            <label>I (Candela):</label>
            <input type="number" value={cd} onChange={(e) => setCd(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Distanz (m):</label>
            <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Winkel θ (°):</label>
            <input type="number" value={angleDeg} onChange={(e) => setAngleDeg(e.target.value)} />
          </div>
        </div>
        <div className="info-grid">
          <div className="info-item">
            <label><strong>cos θ</strong>:</label>
            <span className="info-value">{isFinite(cosTheta) ? cosTheta.toFixed(3) : '—'}</span>
          </div>
          <div className="info-item">
            <label><strong>E (Lux)</strong>:</label>
            <span className="info-value">{lux || '—'}</span>
          </div>
        </div>
        <small style={{ color: 'var(--text-secondary)' }}>Formel: E = (I · cosθ) / d²</small>
      </div>

      <div className="card">
        <h2>Belichtungsdosis (H)</h2>
        <div className="form-row">
          <div className="form-group">
            <label>E (Lux):</label>
            <input type="number" value={lux} readOnly />
          </div>
          <div className="form-group">
            <label>Zeit t (s):</label>
            <input type="number" value={exposureTime} onChange={(e) => setExposureTime(e.target.value)} />
          </div>
          <div className="form-group" style={{ alignSelf: 'flex-end' }}>
            <label>H (Lux·s):</label>
            <input type="text" value={dose || ''} readOnly />
          </div>
        </div>
        <small style={{ color: 'var(--text-secondary)' }}>Formel: H = E · t</small>
      </div>
    </div>
  );
};

export default LightingTools;