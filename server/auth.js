import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getUserByEmail, createUser, getUserById, createInvite, getInviteByToken, markInviteAccepted, createVerification, getVerificationByToken, markVerificationUsed, setUserEmailVerified } from './db.js';
import { buildVerificationLink, buildVerificationEmail, sendMail, resolveAppBaseUrl } from './mailer.js'

export const authRouter = express.Router();

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function validateEmail(email) {
  return typeof email === 'string' && /.+@.+\..+/.test(email);
}

function validatePassword(pw) {
  return typeof pw === 'string' && pw.length >= 8;
}

export function requireAuth(req, res, next) {
  const hdr = req.headers['authorization'] || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.uid;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Helper: log verification link (replace with real mailer in production)
function logVerificationLink(email, link) {
  console.log(`Verification mail to ${email}: ${link}`);
}

authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    if (!validatePassword(password)) return res.status(400).json({ error: 'Password too short (min 8)' });
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Invalid name' });
    const existing = getUserByEmail(email.toLowerCase());
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const password_hash = await bcrypt.hash(password, 12);
    const user = createUser({ email: email.toLowerCase(), name: name.trim(), password_hash, email_verified: false });
    const token = crypto.randomBytes(24).toString('hex');
    const ver = createVerification({ user_id: user.id, token });
    const appBase = resolveAppBaseUrl(req);
    const link = buildVerificationLink(ver.token, appBase);
    // Try sending email; if not configured or fails, still return link for DEV
    try {
      const { subject, text, html } = buildVerificationEmail({ name: user.name, link });
      await sendMail({ to: user.email, subject, text, html });
    } catch (mailErr) {
      console.warn('verify mail send failed, falling back to log', mailErr);
      logVerificationLink(user.email, link);
    }
    // Do NOT log in yet; require email verification
    return res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, email_verified: false }, verifyLink: link });
  } catch (e) {
    console.error('register error', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    const user = getUserByEmail(email.toLowerCase());
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.email_verified) return res.status(409).json({ error: 'Already verified' });
    let ver = getVerificationByToken(null);
    // Find any existing unused token for user; if none, create new
    // Since db utils do not include query by user, just create a fresh token
    const token = crypto.randomBytes(24).toString('hex');
    ver = createVerification({ user_id: user.id, token });
    const appBase = resolveAppBaseUrl(req);
    const link = buildVerificationLink(ver.token, appBase);
    try {
      const { subject, text, html } = buildVerificationEmail({ name: user.name, link });
      await sendMail({ to: user.email, subject, text, html });
    } catch (mailErr) {
      console.warn('resend mail failed, falling back to log', mailErr);
      logVerificationLink(user.email, link);
    }
    return res.json({ ok: true, verifyLink: link });
  } catch (e) {
    console.error('resend verify error', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = getUserByEmail((email || '').toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.email_verified) return res.status(403).json({ error: 'Bitte E‑Mail bestätigen, bevor du dich einloggst.' });
    const token = jwt.sign({ uid: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name, email_verified: !!user.email_verified } });
  } catch (e) {
    console.error('login error', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

authRouter.get('/verify/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const rec = getVerificationByToken(token);
    if (!rec) return res.status(404).json({ error: 'Verification token not found' });
    if (rec.used_at) return res.status(409).json({ error: 'Token already used' });
    const user = getUserById(rec.user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    setUserEmailVerified(user.id, true);
    markVerificationUsed(token);
    const jwtToken = jwt.sign({ uid: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
    return res.json({ token: jwtToken, user: { id: user.id, email: user.email, name: user.name, email_verified: true } });
  } catch (e) {
    console.error('verify error', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

authRouter.get('/me', requireAuth, (req, res) => {
  const user = getUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'Not found' });
  return res.json({ user: { id: user.id, email: user.email, name: user.name, email_verified: !!user.email_verified } });
});

authRouter.post('/invite', requireAuth, async (req, res) => {
  try {
    const { email, name } = req.body || {};
    if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Invalid name' });
    const existing = getUserByEmail(email.toLowerCase());
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const token = crypto.randomBytes(24).toString('hex');
    const invite = createInvite({ email: email.toLowerCase(), name: name.trim(), invited_by: req.userId, token });
    const appBase = resolveAppBaseUrl(req);
    const link = `${appBase}/accept-invite?token=${invite.token}`;
    return res.json({ invite: { email: invite.email, name: invite.name, token: invite.token }, link });
  } catch (e) {
    console.error('invite error', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

authRouter.get('/invite/:token', async (req, res) => {
  const token = req.params.token;
  const inv = getInviteByToken(token);
  if (!inv) return res.status(404).json({ error: 'Invite not found' });
  const accepted = !!inv.accepted_at;
  return res.json({ email: inv.email, name: inv.name, accepted });
});

authRouter.post('/accept-invite', async (req, res) => {
  try {
    const { token, name, password } = req.body || {};
    if (!validatePassword(password)) return res.status(400).json({ error: 'Password too short (min 8)' });
    const inv = getInviteByToken(token);
    if (!inv) return res.status(404).json({ error: 'Invite not found' });
    if (inv.accepted_at) return res.status(409).json({ error: 'Invite already used' });
    const email = inv.email.toLowerCase();
    const existing = getUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const password_hash = await bcrypt.hash(password, 12);
    const user = createUser({ email, name: (name || inv.name || '').trim(), password_hash, email_verified: true });
    markInviteAccepted(token);
    const jwtToken = jwt.sign({ uid: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
    return res.json({ token: jwtToken, user: { id: user.id, email: user.email, name: user.name, email_verified: true } });
  } catch (e) {
    console.error('accept invite error', e);
    return res.status(500).json({ error: 'Server error' });
  }
});