import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { t } = useLanguage();
  const { currentUser, register, login, resendVerification, setRemember } = useAuth();
  const uiOpenLogin = (import.meta.env.VITE_OPEN_LOGIN_NOTICE === 'true');
  const uiDisableReg = (import.meta.env.VITE_DISABLE_REGISTRATION_NOTICE === 'true');
  // Neu: Dummy‑Login Voreinstellungen
  const DUMMY_EMAIL = import.meta.env.VITE_DUMMY_EMAIL || 'dummy@local.test';
  const DUMMY_PASSWORD = import.meta.env.VITE_DUMMY_PASSWORD || 'DummyPass123!';
  const DUMMY_NAME = import.meta.env.VITE_DUMMY_NAME || 'DummyUser';
  const enableDummyLogin = (import.meta.env.VITE_ENABLE_DUMMY_LOGIN ?? 'true') !== 'false';
  // Registrieren-States (entkoppelt von Login)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  // Login-States
  const [loginEmail, setLoginEmail] = useState(DUMMY_EMAIL || '');
  const [loginPassword, setLoginPassword] = useState(DUMMY_PASSWORD || '');
  const [loginName, setLoginName] = useState(DUMMY_NAME || '');
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
    if (s <= 2) return 'Strength: Weak';
    if (s === 3 || s === 4) return 'Strength: Medium';
    return 'Strength: Strong';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setVerifyInfo(null);
    if ((regPassword || '').length < 8) {
      setError('Password too short (min. 8 characters)');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const result = await register({ name: regName, email: regEmail, password: regPassword });
      if (result?.verifyLink) setVerifyInfo({ link: result.verifyLink, email: regEmail });
    } catch (err) {
      setError(err.message || 'Registration failed');
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
      const user = await login(loginEmail, loginPassword, loginName.trim() || undefined);
      if (user) navigate('/shots');
    } catch (err) {
      const msg = err?.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!loginEmail) {
      setError('Please enter your email to send the link.');
      return;
    }
    setResendLoading(true);
    setError(null);
    try {
      const result = await resendVerification(loginEmail);
      if (result?.verifyLink) setVerifyInfo({ link: result.verifyLink, email: loginEmail });
    } catch (err) {
      setError(err.message || 'Resend failed');
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
            <p className="subtitle">{t('auth.currentUser', 'Logged in as')}: <strong>{currentUser.name}</strong></p>
          ) : (
            <p className="subtitle">{t('auth.notLoggedIn', 'Not logged in')}</p>
          )}
        </div>
      </div>

      <div className="card" style={{ maxWidth: 720, margin: '0 auto 16px', background: 'var(--card-bg)', borderLeft: '4px solid var(--color-warning, #f39c12)' }}>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          {t('auth.publicDataWarning', 'Note: This is a public demo. Please do not upload important or protected project data.')}
        </p>
      </div>

      {uiOpenLogin ? (
        <div className="card" style={{ maxWidth: 720, margin: '0 auto 16px', background: 'var(--card-bg)', borderLeft: '4px solid var(--color-info, #3498db)' }}>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            <strong>Temporary mode:</strong> Registration is disabled, all login attempts are accepted.
            <br />
            Log in directly with your email and any password.
          </p>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: 720, margin: '0 auto 16px', background: 'var(--card-bg)', borderLeft: '4px solid var(--color-info, #3498db)' }}>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            <strong>Access only with registration:</strong> Without a login, content (e.g., notes) is not visible.
            <br />
            You received an invitation? Open your invitation link or confirm here: <Link to="/accept-invite" className="link">Confirm invitation</Link>.
            <br />
            No invitation yet? Ask the administrator for an invitation via email.
          </p>
        </div>
      )}

      {uiDisableReg ? (
        <div className="card" style={{ maxWidth: 640, width: '100%', margin: '0 auto' }}>
          <h2>Register</h2>
          <p style={{ margin: 0 }}>
            Registration is <strong>temporarily disabled</strong>. Please use the login below.
          </p>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: 640, width: '100%', margin: '0 auto' }}>
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <div className="form-group" style={{ width: '100%' }}>
              <label>Name</label>
              <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder={t('auth.enterNamePlaceholder', 'e.g., Jane Doe')} />
            </div>
            <div className="form-group" style={{ width: '100%' }}>
              <label>Email</label>
              <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="max@example.com" />
            </div>
            <div className="form-group" style={{ width: '100%' }}>
              <label>Password</label>
              <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="min. 8 characters" />
              <small style={{ display: 'block', marginTop: 6, color: 'var(--text-muted, #666)' }}>
                {passwordStrengthLabel(regPassword)} — Tips: at least 12 characters; use upper and lower case letters,
                numbers and special characters; avoid easily guessable words.
              </small>
            </div>
            <div className="form-group" style={{ width: '100%' }}>
              <label>Confirm password</label>
              <input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder="re-enter" />
            </div>
            <div className="form-row" style={{ gap: 8, marginTop: 12 }}>
              <button className="btn-primary" disabled={loading} type="submit">{loading ? 'Please wait…' : 'Register'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ maxWidth: 640, width: '100%', margin: '12px auto' }}>
        <h2>Login</h2>
        {uiOpenLogin && (
          <div className="card" style={{ margin: '0 0 12px', background: 'var(--card-bg)', borderLeft: '4px solid var(--color-warning, #f39c12)' }}>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              No registration needed — enter your email and any password.
            </p>
          </div>
        )}
        <form onSubmit={handleLogin}>
          {uiOpenLogin && (
            <div className="form-group" style={{ width: '100%' }}>
              <label>Name (optional)</label>
              <input type="text" value={loginName} onChange={(e) => setLoginName(e.target.value)} placeholder="e.g., Jane Doe" />
            </div>
          )}
          <div className="form-group" style={{ width: '100%' }}>
            <label>Email</label>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="max@example.com" />
          </div>
          <div className="form-group" style={{ width: '100%' }}>
            <label>Password</label>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="mind. 8 Zeichen" />
          </div>
          <div className="form-row" style={{ gap: 8, marginTop: 12 }}>
            <button className="btn-secondary" disabled={loading} type="submit">{loading ? 'Please wait…' : 'Login'}</button>
            <Link to="/accept-invite" className="btn-link" style={{ marginLeft: 8 }}>Open invitation link</Link>
          </div>
        </form>
        <div style={{ marginTop: 8 }}>
          <button className="btn-link" onClick={handleResend} disabled={resendLoading || !loginEmail}>
            {resendLoading ? 'Resending…' : 'Resend verification link'}
          </button>
          <small style={{ display: 'block', marginTop: 4, color: 'var(--text-muted, #666)' }}>
            Enter your email above so we can send the link.
          </small>
        </div>
        {error && (
          <div style={{ marginTop: 8 }}>
            <p className="error-text" style={{ margin: 0 }}>{error}</p>
          </div>
        )}
        {verifyInfo && (
          <div className="card" style={{ maxWidth: 720, margin: '12px auto 0', background: 'var(--card-bg)', borderLeft: '4px solid var(--color-success, #2ecc71)' }}>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              <strong>Please confirm your email address:</strong> We've sent you a message.
              <br />
              Open the link in the email to activate your account. In local dev setup you can also open the link here:
              {' '}<a href={verifyInfo.link} className="link">Confirm email now</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;