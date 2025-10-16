import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './Navbar.css';
import { APP_VERSION_LABEL } from '../version';
import Icon from './Icon';
import InstallPWA from './InstallPWA';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <div className="navbar-title">
          <h1>VFX Supervision</h1>
          <div className="app-version">{APP_VERSION_LABEL}</div>
        </div>
        <div className="navbar-controls">
          <InstallPWA />
          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
            ☰
          </button>
        </div>
      </div>
      
      <ul className={`navbar-links ${isOpen ? 'active' : ''}`}>
        <li>
          <Link to="/" onClick={() => setIsOpen(false)} aria-label={t('nav.dashboard')} title={t('nav.dashboard')}>
            <span className="nav-icon" aria-hidden><Icon name="home" /></span>
            <span className="nav-label">{t('nav.dashboard')}</span>
          </Link>
        </li>
        <li>
          <Link to="/shots" onClick={() => setIsOpen(false)} aria-label={t('nav.shots')} title={t('nav.shots')}>
            <span className="nav-icon" aria-hidden><Icon name="film" /></span>
            <span className="nav-label">{t('nav.shots')}</span>
          </Link>
        </li>
        <li>
          <Link to="/camera" onClick={() => setIsOpen(false)} aria-label={t('nav.camera')} title={t('nav.camera')}>
            <span className="nav-icon" aria-hidden><Icon name="camera" /></span>
            <span className="nav-label">{t('nav.camera')}</span>
          </Link>
        </li>
        <li>
          <Link to="/notes" onClick={() => setIsOpen(false)} aria-label={t('nav.notes')} title={t('nav.notes')}>
            <span className="nav-icon" aria-hidden><Icon name="notes" /></span>
            <span className="nav-label">{t('nav.notes')}</span>
          </Link>
        </li>
        <li>
          <Link to="/settings" onClick={() => setIsOpen(false)} aria-label={t('nav.settings')} title={t('nav.settings')}>
            <span className="nav-icon" aria-hidden><Icon name="settings" /></span>
            <span className="nav-label">{t('nav.settings')}</span>
          </Link>
        </li>

        {/* Tools-Menü mit Einträgen */}
        <li className="nav-tools">
          <div className="nav-tools-title" aria-label={t('nav.tools', 'Tools')} title={t('nav.tools', 'Tools')}>
            <span className="nav-icon" aria-hidden><Icon name="folder" /></span>
            <span className="nav-label">{t('nav.tools', 'Tools')}</span>
          </div>
          <ul className="submenu">
            <li>
              <Link to="/sensor-preview" onClick={() => setIsOpen(false)} aria-label={t('nav.sensorPreview', 'Sensor Vorschau')} title={t('nav.sensorPreview', 'Sensor Vorschau')}>
                <span className="nav-icon" aria-hidden><Icon name="camera" /></span>
                <span className="nav-label">{t('nav.sensorPreview', 'Sensor Vorschau')}</span>
              </Link>
            </li>
            <li>
              <Link to="/fov-calculator" onClick={() => setIsOpen(false)} aria-label={t('nav.fovCalculator', 'FOV‑Rechner')} title={t('nav.fovCalculator', 'FOV‑Rechner')}>
                <span className="nav-icon" aria-hidden><Icon name="film" /></span>
                <span className="nav-label">{t('nav.fovCalculator', 'FOV‑Rechner')}</span>
              </Link>
            </li>
            <li>
              <Link to="/lens-mapper" onClick={() => setIsOpen(false)} aria-label={t('nav.lensMapper', 'Lens‑Mapper')} title={t('nav.lensMapper', 'Lens‑Mapper')}>
                <span className="nav-icon" aria-hidden><Icon name="notes" /></span>
                <span className="nav-label">{t('nav.lensMapper', 'Lens‑Mapper')}</span>
              </Link>
            </li>
            <li>
              <Link to="/flicker-controll" onClick={() => setIsOpen(false)} aria-label={t('nav.flickerControll', 'Flicker Controll')} title={t('nav.flickerControll', 'Flicker Controll')}>
                <span className="nav-icon" aria-hidden><Icon name="camera" /></span>
                <span className="nav-label">{t('nav.flickerControll', 'Flicker Controll')}</span>
              </Link>
            </li>
            <li>
              <Link to="/lighting-tools" onClick={() => setIsOpen(false)} aria-label={t('nav.lightingTools', 'Lighting‑Tools')} title={t('nav.lightingTools', 'Lighting‑Tools')}>
                <span className="nav-icon" aria-hidden><Icon name="settings" /></span>
                <span className="nav-label">{t('nav.lightingTools', 'Lighting‑Tools')}</span>
              </Link>
            </li>
          </ul>
        </li>
      </ul>

      {/* Einstellungen wurden in die Settings-Seite verlagert */}
    </nav>
  );
};

export default Navbar;