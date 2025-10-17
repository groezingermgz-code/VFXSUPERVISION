import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './Quickstart.css';

const Quickstart = () => {
  const { t } = useLanguage();

  return (
    <div className="page quickstart-page">
      {/* Grid mit drei Spalten und Full-Width Reihen für Hinweis + Überschrift */}
      <div
        className="quickstart-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {/* Öffentliche Demo Hinweis: volle Breite, prominenter Stil */}
        <div
          className="card"
          role="alert"
          style={{
            gridColumn: '1 / -1',
            padding: '16px 20px',
            background: 'rgba(243, 156, 18, 0.12)',
            border: '1px solid rgba(243, 156, 18, 0.35)',
            borderLeft: '6px solid #f39c12',
            borderRadius: 8,
            color: 'var(--color-text)',
            fontWeight: 600,
          }}
        >
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            <span aria-hidden="true" style={{ marginRight: 8 }}>⚠️</span>
            {t(
              'auth.publicDataWarning',
              'Hinweis: Dies ist eine öffentlich zugängliche Demo. Bitte keine wichtigen oder geschützten Projektdaten hochladen.'
            )}
          </p>
        </div>

        {/* Überschrift über allen Spalten, gleiche Basis für anschließend Karten-Zeile */}
        <div className="header" style={{ gridColumn: '1 / -1' }}>
          <div className="header-content">
            <h1>{t('quickstart.title', 'Quickstart')}</h1>
            <p className="subtitle">
              {t(
                'quickstart.intro',
                'In wenigen Schritten startklar: Login, Nutzer/Teams, Projekte und Shots.'
              )}
            </p>
          </div>
        </div>

        {/* Spalte 1: Login + Start */}
        <div className="quickstart-col" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>{t('quickstart.sections.loginTitle', '1) Login')}</h2>
            <p>
              {t(
                'quickstart.sections.loginText',
                'Gehe zu Login, gib einen Namen ein (z. B. „Martin“ — Admin). Du kannst auch aus vorhandenen Nutzern wählen.'
              )}
            </p>
            <div className="form-row" style={{ gap: 8 }}>
              <Link to="/login" className="btn-primary">
                {t('quickstart.ctaLogin', 'Zum Login')}
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="form-row" style={{ gap: 8 }}>
              <Link to="/login" className="btn-primary">
                {t('quickstart.ctaStart', 'Jetzt starten')}
              </Link>
            </div>
          </div>
        </div>

        {/* Spalte 2: Nutzer/Teams + Projekt */}
        <div className="quickstart-col" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>{t('quickstart.sections.usersTeamsTitle', '2) Nutzer & Teams')}</h2>
            <p>
              {t(
                'quickstart.sections.usersTeamsText',
                'Lege Nutzer an (Users) und erstelle Teams (Teams). Füge Mitglieder zu Teams hinzu, um Projekte zuzuordnen.'
              )}
            </p>
            <div className="form-row" style={{ gap: 8 }}>
              <Link to="/users" className="btn-secondary">
                {t('quickstart.ctaUsers', 'Users öffnen')}
              </Link>
              <Link to="/teams" className="btn-secondary">
                {t('quickstart.ctaTeams', 'Teams öffnen')}
              </Link>
              <Link to="/users-teams" className="btn-primary">
                {t('quickstart.ctaUsersTeams', 'Nutzer & Teams öffnen')}
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>{t('quickstart.sections.projectTitle', '3) Projekt anlegen')}</h2>
            <p>
              {t(
                'quickstart.sections.projectText',
                'Im Dashboard neues Projekt erstellen: Name, Produktion, Regie, DOP, VFX Supervisor. Team auswählen und geplante Shots angeben.'
              )}
            </p>
            <div className="form-row" style={{ gap: 8 }}>
              <Link to="/" className="btn-secondary">
                {t('quickstart.ctaDashboard', 'Zum Dashboard')}
              </Link>
            </div>
          </div>
        </div>

        {/* Spalte 3: Shots + Notizen + Tools + Backup */}
        <div className="quickstart-col" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>{t('quickstart.sections.shotsTitle', '4) Shots verwalten')}</h2>
            <p>
              {t(
                'quickstart.sections.shotsText',
                'Öffne die Shot List, suche und bearbeite Shots. Plane Kamera-Setups, trage Status und Notizen ein.'
              )}
            </p>
            <div className="form-row" style={{ gap: 8 }}>
              <Link to="/shots" className="btn-secondary">
                {t('quickstart.ctaShots', 'Shot List öffnen')}
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>{t('quickstart.sections.notesTitle', '5) Notizen')}</h2>
            <p>
              {t(
                'quickstart.sections.notesText',
                'Erstelle und tagge Notizen, um Set-Infos und Todo-Punkte festzuhalten.'
              )}
            </p>
            <div className="form-row" style={{ gap: 8 }}>
              <Link to="/notes" className="btn-secondary">
                {t('quickstart.ctaNotes', 'Notes öffnen')}
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>{t('quickstart.sections.cameraToolsTitle', '6) Kamera & Tools')}</h2>
            <p>
              {t(
                'quickstart.sections.cameraToolsText',
                'Verwalte Kamera-Presets und nutze Tools wie Sensor Preview, FOV Calculator, Lens Mapper, Flicker Control und Lighting Tools.'
              )}
            </p>
            <div
              className="form-row"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                rowGap: 16,
                columnGap: 16,
              }}
            >
              <Link to="/camera" className="btn-secondary" style={{ padding: '10px 16px', borderRadius: 8 }}>{t('nav.camera', 'Camera Presets')}</Link>
              <Link to="/sensor-preview" className="btn-secondary" style={{ padding: '10px 16px', borderRadius: 8 }}>{t('nav.sensorPreview', 'Sensor Preview')}</Link>
              <Link to="/fov-calculator" className="btn-secondary" style={{ padding: '10px 16px', borderRadius: 8 }}>{t('nav.fovCalculator', 'FOV Calculator')}</Link>
              <Link to="/lens-mapper" className="btn-secondary" style={{ padding: '10px 16px', borderRadius: 8 }}>{t('nav.lensMapper', 'Lens Mapper')}</Link>
              <Link to="/flicker-controll" className="btn-secondary" style={{ padding: '10px 16px', borderRadius: 8 }}>{t('nav.flickerControll', 'Flicker Control')}</Link>
              <Link to="/lighting-tools" className="btn-secondary" style={{ padding: '10px 16px', borderRadius: 8 }}>{t('nav.lightingTools', 'Lighting Tools')}</Link>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>{t('quickstart.sections.backupTitle', '7) Backup & Sync')}</h2>
            <p>
              {t(
                'quickstart.sections.backupText',
                'Sichere Daten lokal (Offline availability) und nutze Versionierung & Backup. Optional: Cloud Sync über Settings → Cloud Synchronization.'
              )}
            </p>
            <div className="form-row" style={{ gap: 8 }}>
              <Link to="/settings" className="btn-secondary">{t('nav.settings', 'Settings')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quickstart;