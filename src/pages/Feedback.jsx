import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const EMAIL_TO = 'Info@dert-automat.com';

const encode = (data) =>
  Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key] ?? ''))
    .join('&');

const Feedback = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Beta‑Feedback');
  const [message, setMessage] = useState('');
  const [device, setDevice] = useState('');
  const [pwaInstalled, setPwaInstalled] = useState('');
  const [botField, setBotField] = useState(''); // Netlify Honeypot
  const [status, setStatus] = useState({ ok: false, error: '' });

  const submitToNetlify = async (e) => {
    e.preventDefault();
    setStatus({ ok: false, error: '' });
    try {
      const payload = {
        'form-name': 'feedback',
        name,
        email,
        subject,
        message,
        device,
        pwaInstalled
      };
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(payload)
      });
      setStatus({ ok: true, error: '' });
      setName(currentUser?.name || '');
      setEmail('');
      setSubject('Beta‑Feedback');
      setMessage('');
      setDevice('');
      setPwaInstalled('');
    } catch (err) {
      setStatus({ ok: false, error: t('feedback.error', 'Fehler beim Senden. Bitte per E‑Mail versuchen.') });
    }
  };

  const submitViaEmail = (e) => {
    e.preventDefault();
    const lines = [
      `Name: ${name}`,
      `E‑Mail: ${email}`,
      `Gerät/Browser: ${device}`,
      `PWA installiert: ${pwaInstalled}`,
      '',
      message
    ];
    const body = encodeURIComponent(lines.join('\n'));
    const subj = encodeURIComponent(subject || 'Beta‑Feedback');
    window.location.href = `mailto:${EMAIL_TO}?subject=${subj}&body=${body}`;
  };

  return (
    <div className="page" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="header">
        <div className="header-content">
          <h1>{t('feedback.title', 'Feedback')}</h1>
          <p className="subtitle">{t('feedback.description', 'Schicke uns dein Beta‑Feedback. Du kannst per E‑Mail oder über das Formular senden.')}</p>
        </div>
      </div>

      <div className="card" style={{ background: 'var(--card-bg)' }}>
        <form onSubmit={submitToNetlify} name="feedback" data-netlify="true" netlify-honeypot="bot-field">
          <input type="hidden" name="form-name" value="feedback" />

          {/* Honeypot */}
          <div style={{ display: 'none' }}>
            <label>
              Nicht ausfüllen: <input name="bot-field" value={botField} onChange={(e) => setBotField(e.target.value)} />
            </label>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-field">
              <label htmlFor="name">{t('feedback.nameLabel', 'Name')}</label>
              <input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('feedback.namePlaceholder', 'z. B. Martin')} />
            </div>
            <div className="form-field">
              <label htmlFor="email">{t('feedback.emailLabel', 'E‑Mail')}</label>
              <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('feedback.emailPlaceholder', 'optional')} />
            </div>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 12 }}>
            <div className="form-field">
              <label htmlFor="subject">{t('feedback.subjectLabel', 'Betreff')}</label>
              <input id="subject" name="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 12 }}>
            <div className="form-field">
              <label htmlFor="message">{t('feedback.messageLabel', 'Nachricht')}</label>
              <textarea id="message" name="message" rows={8} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('feedback.messagePlaceholder', 'Beschreibe Problem, Gerät/Browser, Schritte zum Reproduzieren…')} />
            </div>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div className="form-field">
              <label htmlFor="device">{t('feedback.deviceLabel', 'Gerät/Browser (optional)')}</label>
              <input id="device" name="device" type="text" value={device} onChange={(e) => setDevice(e.target.value)} placeholder={t('feedback.devicePlaceholder', 'z. B. iPadOS 17, Safari')} />
            </div>
            <div className="form-field">
              <label htmlFor="pwaInstalled">{t('feedback.pwaInstalledLabel', 'PWA installiert?')}</label>
              <select id="pwaInstalled" name="pwaInstalled" value={pwaInstalled} onChange={(e) => setPwaInstalled(e.target.value)}>
                <option value="">{t('common.select', 'Auswählen...')}</option>
                <option value="yes">{t('common.yes', 'Ja')}</option>
                <option value="no">{t('common.no', 'Nein')}</option>
              </select>
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="button" className="btn-secondary" onClick={submitViaEmail}>
              {t('feedback.submitEmail', 'Per E‑Mail senden')}
            </button>
            <button type="submit" className="btn-primary">
              {t('feedback.submitForm', 'Formular einreichen')}
            </button>
          </div>

          {status.ok && (
            <div className="success" style={{ marginTop: 12, color: 'var(--color-success, #2ecc71)' }}>
              {t('feedback.success', 'Danke! Feedback erfolgreich gesendet.')}
            </div>
          )}
          {status.error && (
            <div className="error" style={{ marginTop: 12, color: 'var(--color-danger, #e74c3c)' }}>
              {status.error}
            </div>
          )}
        </form>
      </div>

      <div className="card" style={{ marginTop: 16, background: 'var(--card-bg)', borderLeft: '4px solid var(--color-warning, #f39c12)' }}>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          {t('feedback.betaWarning', 'Hinweis: Dies ist eine öffentlich zugängliche Demo. Bitte keine sensiblen Daten senden.')} {' '}
          {t('feedback.emailFallback', 'Falls das Formular nicht funktioniert, nutze bitte den E‑Mail‑Button.')} 
        </p>
      </div>
    </div>
  );
};

export default Feedback;