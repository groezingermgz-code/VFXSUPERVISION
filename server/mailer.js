import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || `no-reply@localhost`;
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5173';

let transporter = null;

export function isMailerConfigured() {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

export function getTransporter() {
  if (!isMailerConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      authMethod: 'LOGIN',
      logger: true,
      debug: true,
    });
  }
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) {
    console.log(`[mail DEV] To: ${to}\nSubject: ${subject}\n${text || html}`);
    return { devLogged: true };
  }
  return await tx.sendMail({ from: MAIL_FROM, to, subject, html, text });
}

// Neue Hilfsfunktion: App‑Base aus Anfrage‑Header ableiten, mit Fallback
export function resolveAppBaseUrl(req) {
  const origin = req?.headers?.origin;
  if (origin && /^https?:\/\/.+/.test(origin)) return origin;
  return APP_BASE_URL;
}

export function buildVerificationLink(token, appBaseOverride) {
  const base = appBaseOverride || APP_BASE_URL;
  return `${base}/verify-email/${token}`;
}

export function buildVerificationEmail({ name, link }) {
  const subject = 'Bitte bestätige deine E‑Mail für die VFX Supervision App';
  const text = `Hallo ${name || ''},\n\nbitte bestätige deine E‑Mail-Adresse, indem du diesen Link öffnest:\n${link}\n\nWenn du diese Anfrage nicht gestellt hast, kannst du diese Nachricht ignorieren.\n\nViele Grüße`;
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #222;">
      <p>Hallo ${name || ''},</p>
      <p>bitte bestätige deine E‑Mail-Adresse für die <strong>VFX Supervision App</strong>:</p>
      <p style="margin: 12px 0;">
        <a href="${link}" style="display: inline-block; background: #2ecc71; color: white; text-decoration: none; padding: 10px 16px; border-radius: 6px;">E‑Mail jetzt bestätigen</a>
      </p>
      <p>Alternativ kannst du diesen Link öffnen:<br /><a href="${link}">${link}</a></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
      <p style="color:#666;">Wenn du diese Anfrage nicht gestellt hast, kannst du diese Nachricht ignorieren.</p>
      <p>Viele Grüße</p>
    </div>
  `;
  return { subject, text, html };
}