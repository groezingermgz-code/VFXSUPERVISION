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
      </ul>

      {/* Einstellungen wurden in die Settings-Seite verlagert */}
    </nav>
  );
};

export default Navbar;