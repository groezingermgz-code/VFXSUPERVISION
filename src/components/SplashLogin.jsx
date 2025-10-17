import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const SPLASH_KEY = 'splashLoginSeen';

const SplashLogin = () => {
  const { t } = useLanguage();
  const { currentUser, login, users } = useAuth();
  const [visible, setVisible] = useState(() => {
    try {
      return localStorage.getItem(SPLASH_KEY) !== 'true';
    } catch {
      return true;
    }
  });
  const [name, setName] = useState('');

  useEffect(() => {
    if (currentUser && visible) {
      try { localStorage.setItem(SPLASH_KEY, 'true'); } catch {}
      setVisible(false);
    }
  }, [currentUser, visible]);

  if (!visible) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    const user = login(name);
    if (user) {
      try { localStorage.setItem(SPLASH_KEY, 'true'); } catch {}
      setVisible(false);
    }
  };

  const handleLoginExisting = (existingName) => {
    const user = login(existingName);
    if (user) {
      try { localStorage.setItem(SPLASH_KEY, 'true'); } catch {}
      setVisible(false);
    }
  };

  const handleSkip = () => {
    try { localStorage.setItem(SPLASH_KEY, 'true'); } catch {}
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="splash-login-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 640,
          background: 'var(--card-bg)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div className="header" style={{ padding: '16px 16px 0' }}>
          <div className="header-content">
            <h1 id="splash-login-title">{t('auth.loginTitle', 'Login')}</h1>
            <p className="subtitle" style={{ marginTop: 4 }}>
              {currentUser
                ? `${t('auth.currentUser', 'Angemeldet als')}: ${currentUser.name}`
                : t('auth.notLoggedIn', 'Nicht angemeldet')}
            </p>
          </div>
        </div>

        <div
          className="card"
          style={{
            margin: '12px 16px 0',
            background: 'var(--card-bg)',
            borderLeft: '4px solid var(--color-warning, #f39c12)',
          }}
        >
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            {t(
              'auth.publicDataWarning',
              'Hinweis: Dies ist eine öffentlich zugängliche Demo. Bitte keine wichtigen oder geschützten Projektdaten hochladen.'
            )}
          </p>
        </div>

        <div className="card" style={{ margin: '12px 16px' }}>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ width: '100%' }}>
              <label>{t('auth.enterNameLabel', 'Name eingeben')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth.enterNamePlaceholder', 'z.B. Max Mustermann')}
                autoFocus
              />
            </div>
            <div className="form-row" style={{ gap: 8, marginTop: 12 }}>
              <button type="submit" className="btn-primary">
                {t('auth.loginButton', 'Einloggen')}
              </button>
              <button type="button" className="btn-secondary" onClick={handleSkip}>
                {t('common.cancel', 'Abbrechen')}
              </button>
            </div>
          </form>
        </div>

        <div className="card" style={{ margin: '0 16px 16px' }}>
          <h2 style={{ marginTop: 0 }}>{t('auth.existingUsers', 'Vorhandene Nutzer')}</h2>
          {users.length === 0 ? (
            <p style={{ opacity: 0.8 }}>{t('auth.noUsersYet', 'Noch keine Nutzer angelegt')}</p>
          ) : (
            <div className="users-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
              {users.map((u) => (
                <button key={u.id} className="btn-secondary" onClick={() => handleLoginExisting(u.name)}>
                  {u.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SplashLogin;