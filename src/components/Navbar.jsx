import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';
import { APP_VERSION_LABEL } from '../version';
import Icon from './Icon';
import InstallPWA from './InstallPWA';
import appIcon from '../assets/icon2.png';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [betaOpen, setBetaOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <div className="navbar-title">
          <img
            src={appIcon}
            alt="SUPErVISION Icon"
            style={{ width: 72, height: 72, objectFit: 'contain', margin: '0 auto 8px' }}
          />
          <h1>SUPErVISION</h1>
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
            <span className="nav-icon" aria-hidden><Icon name="key" /></span>
            <span className="nav-label">{currentUser ? `${t('auth.currentUser', 'Angemeldet als')}: ${currentUser.name}` : t('nav.login', 'Login')}</span>
          </Link>
        </li>
        <li>
          <Link to="/" className="dashboard-link" onClick={() => setIsOpen(false)} aria-label={t('nav.dashboard')} title={t('nav.dashboard')}>
            <span className="nav-icon" aria-hidden><Icon name="home" /></span>
            <span className="nav-label">{t('nav.dashboard')}</span>
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
            <span className="nav-icon" aria-hidden><Icon name="message" /></span>
            <span className="nav-label">{t('nav.feedback', 'Feedback')}</span>
          </Link>
        </li>
        <li>
          <Link to="/settings" onClick={() => setIsOpen(false)} aria-label={t('nav.settings')} title={t('nav.settings')}>
            <span className="nav-icon" aria-hidden><Icon name="settings" /></span>
            <span className="nav-label">{t('nav.settings')}</span>
          </Link>
        </li>

        {/* Account */}
        <li className={`nav-tools ${accountOpen ? 'expanded' : 'collapsed'}`}>
          <button
            className="nav-tools-title"
            onClick={() => setAccountOpen(!accountOpen)}
            aria-label={t('nav.account', 'Account')}
            title={t('nav.account', 'Account')}
            aria-expanded={accountOpen}
            aria-controls="account-submenu"
          >
            <span className="nav-icon" aria-hidden><Icon name="key" /></span>
            <span className="nav-label">{t('nav.account', 'Account')}</span>
            <span className="nav-toggle-icon" aria-hidden><Icon name={accountOpen ? 'chevronDown' : 'chevronRight'} /></span>
          </button>
          <ul id="account-submenu" className="submenu" aria-hidden={!accountOpen} style={{ display: accountOpen ? 'block' : 'none' }}>
            <li>
              <Link to="/users-teams" onClick={() => setIsOpen(false)} aria-label={t('nav.usersTeams', 'Nutzer & Teams')} title={t('nav.usersTeams', 'Nutzer & Teams')}>
                <span className="nav-icon" aria-hidden><Icon name="folder" /></span>
                <span className="nav-label">{t('nav.usersTeams', 'Nutzer & Teams')}</span>
              </Link>
            </li>
            <li>
              <Link to="/users" onClick={() => setIsOpen(false)} aria-label={t('nav.users', 'Nutzer')} title={t('nav.users', 'Nutzer')}>
                <span className="nav-icon" aria-hidden><Icon name="notes" /></span>
                <span className="nav-label">{t('nav.users', 'Nutzer')}</span>
              </Link>
            </li>
            <li>
              <Link to="/teams" onClick={() => setIsOpen(false)} aria-label={t('nav.teams', 'Teams')} title={t('nav.teams', 'Teams')}>
                <span className="nav-icon" aria-hidden><Icon name="folder" /></span>
                <span className="nav-label">{t('nav.teams', 'Teams')}</span>
              </Link>
            </li>
          </ul>
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
                <span className="nav-icon" aria-hidden><Icon name="lens" /></span>
                <span className="nav-label">{t('nav.lensAudit', 'Objektiv Audit')}</span>
              </Link>
            </li>
            <li>
              <Link to="/lds-lenses" onClick={() => setIsOpen(false)} aria-label={t('nav.ldsLenses', 'LDS‑Objektive')} title={t('nav.ldsLenses', 'LDS‑Objektive')}>
                <span className="nav-icon" aria-hidden><Icon name="lens" /></span>
                <span className="nav-label">{t('nav.ldsLenses', 'LDS‑Objektive')}</span>
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
                <span className="nav-icon" aria-hidden><Icon name="angle" /></span>
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
                <span className="nav-icon" aria-hidden><Icon name="zap" /></span>
                <span className="nav-label">{t('nav.flickerControll', 'Flicker Control')}</span>
              </Link>
            </li>
            <li>
              <Link to="/lighting-tools" onClick={() => setIsOpen(false)} aria-label={t('nav.lightingTools', 'Lighting‑Tools')} title={t('nav.lightingTools', 'Lighting‑Tools')}>
                <span className="nav-icon" aria-hidden><Icon name="sun" /></span>
                <span className="nav-label">{t('nav.lightingTools', 'Lighting‑Tools')}</span>
              </Link>
            </li>
            <li>
              <Link to="/camera" onClick={() => setIsOpen(false)} aria-label={t('nav.cameraPresets', 'Camera Presets')} title={t('nav.cameraPresets', 'Camera Presets')}>
                <span className="nav-icon" aria-hidden><Icon name="camera" /></span>
                <span className="nav-label">{t('nav.cameraPresets', 'Camera Presets')}</span>
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
        <li className={`nav-tools ${betaOpen ? 'expanded' : 'collapsed'}`}>
          <button
            className="nav-tools-title"
            onClick={() => setBetaOpen(!betaOpen)}
            aria-label={t('nav.betaTools', 'Beta Tools')}
            title={t('nav.betaTools', 'Beta Tools')}
            aria-expanded={betaOpen}
            aria-controls="beta-tools-submenu"
          >
            <span className="nav-icon" aria-hidden><Icon name="zap" /></span>
            <span className="nav-label">{t('nav.betaTools', 'Beta Tools')}</span>
            <span className="nav-toggle-icon" aria-hidden><Icon name={betaOpen ? 'chevronDown' : 'chevronRight'} /></span>
          </button>
          <ul id="beta-tools-submenu" className="submenu" aria-hidden={!betaOpen} style={{ display: betaOpen ? 'block' : 'none' }}>
            <li>
              <Link to="/camera-control" onClick={() => setIsOpen(false)} aria-label={t('nav.cameraControl', 'Camera Control (Beta)')} title={t('nav.cameraControl', 'Camera Control (Beta)')}>
                <span className="nav-icon" aria-hidden><Icon name="camera" /></span>
                <span className="nav-label">{t('nav.cameraControl', 'Camera Control (Beta)')}</span>
              </Link>
            </li>
            <li>
              <Link to="/color-workflows" onClick={() => setIsOpen(false)} aria-label={t('nav.colorWorkflows', 'ColorWorkflows (Beta)')} title={t('nav.colorWorkflows', 'ColorWorkflows (Beta)')}>
                <span className="nav-icon" aria-hidden><Icon name="notes" /></span>
                <span className="nav-label">{t('nav.colorWorkflows', 'ColorWorkflows (Beta)')}</span>
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