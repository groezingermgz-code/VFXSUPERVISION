import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AcceptInvite = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const { getInvite, acceptInvite } = useAuth();

  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Passwortstärke-Hinweis
  const passwordScore = (pwd) => {
    let s = 0;
    if ((pwd || '').length >= 12) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };
  const passwordStrengthLabel = (pwd) => {
    const s = passwordScore(pwd);
    if (s <= 2) return 'Stärke: Schwach';
    if (s === 3 || s === 4) return 'Stärke: Mittel';
    return 'Stärke: Stark';
  };
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const info = await getInvite(token);
        if (!mounted) return;
        setInv(info);
        setName(info?.name || '');
      } catch (e) {
        setError('Einladung nicht gefunden oder bereits verwendet');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
    else { setError('Ungültiger Token'); setLoading(false); }
    return () => { mounted = false; };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 8) { setError('Passwort zu kurz (min 8)'); return; }
    if (password !== confirmPassword) { setError('Passwörter stimmen nicht überein'); return; }
    try {
      await acceptInvite({ token, name, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invite konnte nicht akzeptiert werden');
    }
  };

  if (loading) return <div className="page"><div className="card">Lädt…</div></div>;

  return (
    <div className="page" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="card">
        <h1>Einladung annehmen</h1>
        {error && <div className="card" style={{ background: 'rgba(231, 76, 60, 0.12)', borderLeft: '6px solid var(--danger)' }}>{error}</div>}
        {inv && inv.accepted && (
          <div className="card" style={{ background: 'rgba(241, 196, 15, 0.12)', borderLeft: '6px solid var(--warning)' }}>
            Einladung wurde bereits akzeptiert.
          </div>
        )}
        {inv && !inv.accepted && (
          <>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={inv.email} readOnly />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Passwort</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <small style={{ display: 'block', marginTop: 6, color: 'var(--text-muted, #666)' }}>
                  {passwordStrengthLabel(password)} — Tipps: mind. 12 Zeichen, Groß- und Kleinbuchstaben,
                  Zahlen und Sonderzeichen nutzen; vermeide leicht erratbare Wörter.
                </small>
              </div>
              <div className="form-group">
                <label>Passwort bestätigen</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <div className="form-row" style={{ gap: 8 }}>
                <button type="submit" className="btn-primary">Registrieren und anmelden</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;