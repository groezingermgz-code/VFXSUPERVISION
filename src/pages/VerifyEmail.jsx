import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState('pending'); // pending | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        await verifyEmail(token);
        if (!mounted) return;
        setStatus('success');
        setMessage('Verifizierung erfolgreich. Du wirst gleich weitergeleitet …');
        setTimeout(() => navigate('/shots'), 1200);
      } catch (err) {
        if (!mounted) return;
        setStatus('error');
        setMessage(err?.message || 'Verifizierung fehlgeschlagen. Link eventuell ungültig oder bereits verwendet.');
      }
    };
    run();
    return () => { mounted = false; };
  }, [token]);

  return (
    <div className="page" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="card" style={{ marginTop: 24 }}>
        <h1>E‑Mail bestätigen</h1>
        {status === 'pending' && (
          <p>Bitte warten … wir bestätigen deine E‑Mail.</p>
        )}
        {status === 'success' && (
          <div className="card" style={{ background: 'rgba(46, 204, 113, 0.10)', borderLeft: '6px solid var(--color-success, #2ecc71)' }}>
            <p style={{ margin: 0 }}>{message}</p>
          </div>
        )}
        {status === 'error' && (
          <>
            <p style={{ color: 'var(--color-error, #e74c3c)' }}>{message}</p>
            <p>
              Du kannst dich <Link to="/login">hier anmelden</Link> und die Registrierung erneut starten.
              Wenn du eine Einladung hast, öffne bitte den Link oder gehe zu <Link to="/accept-invite">Einladung bestätigen</Link>.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;