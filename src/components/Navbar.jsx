import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';
import { APP_VERSION_LABEL } from '../version';
import Icon from './Icon';
import InstallPWA from './InstallPWA';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { t } = useLanguage();
  const { currentUser } = useAuth();

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
        {/* Quickstart und Login über dem Dashboard-Button platzieren */}
        <li>
          <Link to="/quickstart" onClick={() => setIsOpen(false)} aria-label={t('nav.quickstart', 'Quickstart')} title={t('nav.quickstart', 'Quickstart')}>
            <span className="nav-icon" aria-hidden><Icon name="notes" /></span>
            <span className="nav-label">{t('nav.quickstart', 'Quickstart')}</span>
          </Link>
        </li>
        <li>
          <Link to="/login" onClick={() => setIsOpen(false)} aria-label={t('nav.login', 'Login')} title={t('nav.login', 'Login')}>
            <span className="nav-icon" aria-hidden><Icon name="notes" /></span>
            <span className="nav-label">{currentUser ? `${t('auth.currentUser', 'Angemeldet als')}: ${currentUser.name}` : t('nav.login', 'Login')}</span>
          </Link>
        </li>
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
          <Link to="/feedback" onClick={() => setIsOpen(false)} aria-label={t('nav.feedback', 'Feedback')} title={t('nav.feedback', 'Feedback')}>
            <span className="nav-icon" aria-hidden><Icon name="notes" /></span>
            <span className="nav-label">{t('nav.feedback', 'Feedback')}</span>
          </Link>
        </li>
        <li>
          <Link to="/settings" onClick={() => setIsOpen(false)} aria-label={t('nav.settings')} title={t('nav.settings')}>
            <span className="nav-icon" aria-hidden><Icon name="settings" /></span>
            <span className="nav-label">{t('nav.settings')}</span>
          </Link>
        </li>

        {/* Users */}
        <li>
          <Link to="/users-teams" onClick={() => setIsOpen(false)} aria-label={t('nav.usersTeams', 'Nutzer & Teams')} title={t('nav.usersTeams', 'Nutzer & Teams')}>
            <span className="nav-icon" aria-hidden><Icon name="folder" /></span>
            <span className="nav-label">{t('nav.usersTeams', 'Nutzer & Teams')}</span>
          </Link>
        </li>

        {/* Tools-Menü mit Einträgen */}
        <li className={`nav-tools ${toolsOpen ? 'expanded' : 'collapsed'}`}>
          <button
            className="nav-tools-title"
            onClick={() => setToolsOpen(!toolsOpen)}
            aria-label={t('nav.tools', 'Tools')}
            title={t('nav.tools', 'Tools')}
            aria-expanded={toolsOpen}
            aria-controls="tools-submenu"
          >
            <span className="nav-icon" aria-hidden><Icon name="folder" /></span>
            <span className="nav-label">{t('nav.tools', 'Tools')}</span>
            <span className="nav-toggle-icon" aria-hidden><Icon name={toolsOpen ? 'chevronDown' : 'chevronRight'} /></span>
          </button>
          <ul id="tools-submenu" className="submenu" aria-hidden={!toolsOpen} style={{ display: toolsOpen ? 'block' : 'none' }}>

            <li>
              <Link to="/camera-format-audit" onClick={() => setIsOpen(false)} aria-label={t('nav.cameraFormatAudit', 'Kamera/Format Audit')} title={t('nav.cameraFormatAudit', 'Kamera/Format Audit')}>
                <span className="nav-icon" aria-hidden><Icon name="film" /></span>
                <span className="nav-label">{t('nav.cameraFormatAudit', 'Kamera/Format Audit')}</span>
              </Link>
            </li>
            <li>
              <Link to="/lens-audit" onClick={() => setIsOpen(false)} aria-label={t('nav.lensAudit', 'Objektiv Audit')} title={t('nav.lensAudit', 'Objektiv Audit')}>
                <span className="nav-icon" aria-hidden><Icon name="notes" /></span>
                <span className="nav-label">{t('nav.lensAudit', 'Objektiv Audit')}</span>
              </Link>
            </li>
            <li>
              <Link to="/sensor-preview" onClick={() => setIsOpen(false)} aria-label={t('nav.sensorPreview', 'Sensor Vorschau')} title={t('nav.sensorPreview', 'Sensor Vorschau')}>
                <span className="nav-icon" aria-hidden><Icon name="film" /></span>
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
              <Link to="/lens-editor" onClick={() => setIsOpen(false)} aria-label={t('nav.lensEditor', 'Objektiv‑Editor')} title={t('nav.lensEditor', 'Objektiv‑Editor')}>
                <span className="nav-icon" aria-hidden><Icon name="notes" /></span>
                <span className="nav-label">{t('nav.lensEditor', 'Objektiv‑Editor')}</span>
              </Link>
            </li>
            <li>
              <Link to="/camera-sensor-editor" onClick={() => setIsOpen(false)} aria-label={t('nav.cameraSensorEditor', 'Kamera/Sensor‑Editor')} title={t('nav.cameraSensorEditor', 'Kamera/Sensor‑Editor')}>
                <span className="nav-icon" aria-hidden><Icon name="film" /></span>
                <span className="nav-label">{t('nav.cameraSensorEditor', 'Kamera/Sensor‑Editor')}</span>
              </Link>
            </li>
            <li>
              <Link to="/flicker-controll" onClick={() => setIsOpen(false)} aria-label={t('nav.flickerControll', 'Flicker Control')} title={t('nav.flickerControll', 'Flicker Control')}>
                <span className="nav-icon" aria-hidden><Icon name="camera" /></span>
                <span className="nav-label">{t('nav.flickerControll', 'Flicker Control')}</span>
              </Link>
            </li>
            <li>
              <Link to="/lighting-tools" onClick={() => setIsOpen(false)} aria-label={t('nav.lightingTools', 'Lighting‑Tools')} title={t('nav.lightingTools', 'Lighting‑Tools')}>
                <span className="nav-icon" aria-hidden><Icon name="settings" /></span>
                <span className="nav-label">{t('nav.lightingTools', 'Lighting‑Tools')}</span>
              </Link>
            </li>
            <li>
              <Link to="/tools-docs" onClick={() => setIsOpen(false)} aria-label={t('nav.toolsDocs', 'Dokumentation')} title={t('nav.toolsDocs', 'Dokumentation')}>
                <span className="nav-icon" aria-hidden><Icon name="notes" /></span>
                <span className="nav-label">{t('nav.toolsDocs', 'Dokumentation')}</span>
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