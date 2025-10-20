import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { t } = useLanguage();
  const { currentUser, register, login, resendVerification, setRemember } = useAuth();
  // Registrieren-States (entkoppelt von Login)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  // Login-States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifyInfo, setVerifyInfo] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  // Passwort-Stärke einschätzen (nur Hinweis, nicht erzwungen)
  const passwordScore = (pwd) => {
    let score = 0;
    if ((pwd || '').length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0..5
  };
  const passwordStrengthLabel = (pwd) => {
    const s = passwordScore(pwd);
    if (s <= 2) return 'Stärke: Schwach';
    if (s === 3 || s === 4) return 'Stärke: Mittel';
    return 'Stärke: Stark';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setVerifyInfo(null);
    if ((regPassword || '').length < 8) {
      setError('Passwort zu kurz (mind. 8 Zeichen)');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }
    setLoading(true);
    try {
      const result = await register({ name: regName, email: regEmail, password: regPassword });
      if (result?.verifyLink) setVerifyInfo({ link: result.verifyLink, email: regEmail });
    } catch (err) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      setRemember(!!rememberMe);
      const user = await login(loginEmail, loginPassword);
      if (user) navigate('/shots');
    } catch (err) {
      const msg = err?.message || 'Login fehlgeschlagen';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!loginEmail) {
      setError('Bitte E‑Mail ausfüllen, um den Link zu senden.');
      return;
    }
    setResendLoading(true);
    setError(null);
    try {
      const result = await resendVerification(loginEmail);
      if (result?.verifyLink) setVerifyInfo({ link: result.verifyLink, email: loginEmail });
    } catch (err) {
      setError(err.message || 'Erneutes Senden fehlgeschlagen');
    } finally {
      setResendLoading(false);
    }
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

      <div className="card" style={{ maxWidth: 720, margin: '0 auto 16px', background: 'var(--card-bg)', borderLeft: '4px solid var(--color-info, #3498db)' }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          <strong>Zugang nur mit Registrierung:</strong> Ohne Anmeldung sind Inhalte (z. B. Notizen) nicht sichtbar.
          <br />
          Du hast eine Einladung erhalten? Öffne deinen Einladungslink oder bestätige hier: <Link to="/accept-invite" className="link">Einladung bestätigen</Link>.
          <br />
          Noch keine Einladung? Bitte den Administrator um eine Einladung per E‑Mail.
        </p>
      </div>

      <div className="card" style={{ maxWidth: 640, width: '100%', margin: '0 auto' }}>
        <h2>Registrieren</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group" style={{ width: '100%' }}>
            <label>Name</label>
            <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder={t('auth.enterNamePlaceholder', 'z.B. Max Mustermann')} />
          </div>
          <div className="form-group" style={{ width: '100%' }}>
            <label>E‑Mail</label>
            <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="max@example.com" />
          </div>
          <div className="form-group" style={{ width: '100%' }}>
            <label>Passwort</label>
            <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="mind. 8 Zeichen" />
            <small style={{ display: 'block', marginTop: 6, color: 'var(--text-muted, #666)' }}>
              {passwordStrengthLabel(regPassword)} — Tipps: mind. 12 Zeichen, Groß- und Kleinbuchstaben,
              Zahlen und Sonderzeichen nutzen; vermeide leicht erratbare Wörter.
            </small>
          </div>
          <div className="form-group" style={{ width: '100%' }}>
            <label>Passwort bestätigen</label>
            <input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder="nochmal eingeben" />
          </div>
          <div className="form-row" style={{ gap: 8, marginTop: 12 }}>
            <button className="btn-primary" disabled={loading} type="submit">{loading ? 'Bitte warten…' : 'Registrieren'}</button>
          </div>
        </form>
      </div>

      <div className="card" style={{ maxWidth: 640, width: '100%', margin: '12px auto' }}>
        <h2>Anmelden</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ width: '100%' }}>
            <label>E‑Mail</label>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="max@example.com" />
          </div>
          <div className="form-group" style={{ width: '100%' }}>
            <label>Passwort</label>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="mind. 8 Zeichen" />
          </div>
          <div className="form-group" style={{ width: '100%' }}>
            <label>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ marginRight: 8 }} />
              Angemeldet bleiben
            </label>
          </div>
          <div className="form-row" style={{ gap: 8, marginTop: 12 }}>
            <button className="btn-secondary" disabled={loading} type="submit">{loading ? 'Bitte warten…' : 'Login'}</button>
            <Link to="/accept-invite" className="btn-link" style={{ marginLeft: 8 }}>Einladungslink öffnen</Link>
          </div>
        </form>
        {error && (
          <div style={{ marginTop: 8 }}>
            <p className="error-text" style={{ margin: 0 }}>{error}</p>
            {error.includes('E‑Mail bestätigen') && (
              <div style={{ marginTop: 8 }}>
                <button className="btn-link" onClick={handleResend} disabled={resendLoading || !loginEmail}>
                  {resendLoading ? 'Sende erneut…' : 'E‑Mail erneut senden'}
                </button>
              </div>
            )}
          </div>
        )}
        {verifyInfo && (
          <div className="card" style={{ maxWidth: 720, margin: '12px auto 0', background: 'var(--card-bg)', borderLeft: '4px solid var(--color-success, #2ecc71)' }}>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              <strong>Bitte bestätige deine E‑Mail-Adresse:</strong> Wir haben dir eine Nachricht geschickt.
              <br />
              Öffne den Link in der E‑Mail, um deinen Account zu aktivieren. Im lokalen Dev‑Setup kannst du den Link auch hier öffnen:
              {' '}<a href={verifyInfo.link} className="link">E‑Mail jetzt bestätigen</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;