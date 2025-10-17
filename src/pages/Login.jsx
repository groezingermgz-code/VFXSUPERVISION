import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { t } = useLanguage();
  const { users, currentUser, login, logout } = useAuth();
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const user = login(name);
    if (user) navigate('/shots');
  };

  const handleLoginExisting = (existingName) => {
    const user = login(existingName);
    if (user) navigate('/shots');
  };

  return (
    <div className="page login-page">
      <div className="header">
        <div className="header-content">
          <h1>{t('auth.loginTitle', 'Login')}</h1>
          {currentUser ? (
            <p className="subtitle">{t('auth.currentUser', 'Angemeldet als')}: <strong>{currentUser.name}</strong></p>
          ) : (
            <p className="subtitle">{t('auth.notLoggedIn', 'Nicht angemeldet')}</p>
          )}
        </div>
      </div>

      <div className="card" style={{ maxWidth: 720, margin: '0 auto 16px', background: 'var(--card-bg)', borderLeft: '4px solid var(--color-warning, #f39c12)' }}>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          {t('auth.publicDataWarning', 'Hinweis: Dies ist eine öffentlich zugängliche Demo. Bitte keine wichtigen oder geschützten Projektdaten hochladen.')}
        </p>
      </div>

      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ width: '100%' }}>
            <label>{t('auth.enterNameLabel', 'Name eingeben')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.enterNamePlaceholder', 'z.B. Max Mustermann')}
            />
          </div>
          <div className="form-row" style={{ gap: 8, marginTop: 12 }}>
            <button type="submit" className="btn-primary">{t('auth.loginButton', 'Einloggen')}</button>
            {currentUser && (
              <button type="button" className="btn-secondary" onClick={() => { logout(); setName(''); }}>
                {t('auth.logoutButton', 'Abmelden')}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card" style={{ maxWidth: 720, margin: '16px auto' }}>
        <h2>{t('auth.existingUsers', 'Vorhandene Nutzer')}</h2>
        {users.length === 0 ? (
          <p style={{ opacity: 0.8 }}>{t('auth.noUsersYet', 'Noch keine Nutzer angelegt')}</p>
        ) : (
          <div className="users-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
            {users.map(u => (
              <button key={u.id} className="btn-secondary" onClick={() => handleLoginExisting(u.name)}>
                {u.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;