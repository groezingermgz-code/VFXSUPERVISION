import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './auth.js';
import { cloudConfigRouter } from './cloudConfig.js';
// Neu: Imports für DummyUser-Seeding
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser, setUserEmailVerified, setUserName } from './db.js';
import { isMailerConfigured } from './mailer.js';
import pkg from '../package.json' assert { type: 'json' };

const app = express();

// Dynamische CORS-Whitelist inkl. Cloudflare Pages (*.pages.dev)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5176',
  'http://localhost:5177',
  'http://127.0.0.1:5177',
  'http://localhost:5178',
  'http://127.0.0.1:5178',
  'http://localhost:4180',
  'http://127.0.0.1:4180',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:5180',
  'http://127.0.0.1:5180',
  'http://localhost:5181',
  'http://127.0.0.1:5181',
  'http://192.168.178.71:5175',
  'http://192.168.178.71:5177',
  'http://192.168.178.71:5178',
  'http://192.168.178.71:5180',
  // Produktion: der-automat.com
  'https://www.der-automat.com',
  'http://www.der-automat.com',
  'https://der-automat.com',
  'http://der-automat.com',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    try {
      const url = new URL(origin);
      const host = url.hostname;
      const allow = allowedOrigins.includes(origin) || host.endsWith('pages.dev');
      return callback(null, allow);
    } catch (e) {
      const allow = allowedOrigins.includes(origin) || origin.includes('pages.dev');
      return callback(null, allow);
    }
  },
  credentials: false,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

// Simple API info route
app.get('/api', (req, res) => {
  res.json({
    ok: true,
    message: 'Auth/Config API',
    endpoints: {
      health: '/api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me (Authorization: Bearer <token>)',
      verify: 'GET /api/auth/verify/:token',
      resendVerification: 'POST /api/auth/resend-verification',
      invite: 'POST /api/auth/invite (auth required)',
      getInvite: 'GET /api/auth/invite/:token',
      acceptInvite: 'POST /api/auth/accept-invite',
      cloudConfig: 'GET /api/config/cloud (auth required)'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'vfx-supervision-api',
    version: pkg?.version || '0.0.0',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    mode: {
      openLoginMode: process.env.OPEN_LOGIN_MODE === 'true',
      disableRegistration: process.env.DISABLE_REGISTRATION === 'true',
    },
    endpoints: {
      health: '/api/health',
      authHealth: '/api/auth/health',
    }
  });
});

// Zusätzlicher Health‑Endpunkt für Auth/Mailer Setup
app.get('/api/auth/health', (req, res) => {
  res.json({
    ok: true,
    auth: true,
    version: pkg?.version || '0.0.0',
    mailerConfigured: isMailerConfigured(),
    timestamp: new Date().toISOString(),
  });
});
app.use('/api/auth', authRouter);
app.use('/api/config', cloudConfigRouter);

// Neu: DummyUser einmalig beim Start sicherstellen
const DUMMY_EMAIL = process.env.DUMMY_USER_EMAIL || 'dummy@local.test';
const DUMMY_PASSWORD = process.env.DUMMY_USER_PASSWORD || 'DummyPass123!';
const DUMMY_NAME = process.env.DUMMY_USER_NAME || 'DummyUser';
try {
  const existing = getUserByEmail(DUMMY_EMAIL.toLowerCase());
  if (!existing) {
    const password_hash = bcrypt.hashSync(DUMMY_PASSWORD, 12);
    const user = createUser({ email: DUMMY_EMAIL.toLowerCase(), name: DUMMY_NAME, password_hash, email_verified: true });
    console.log(`[auth] Dummy user created: ${user.email} (${user.name})`);
  } else {
    setUserEmailVerified(existing.id, true);
    if (DUMMY_NAME) setUserName(existing.id, DUMMY_NAME);
    console.log(`[auth] Dummy user ensured: ${existing.email}`);
  }
} catch (e) {
  console.warn('[auth] Failed to ensure dummy user:', e?.message || e);
}

// Serve static if needed in production (optional)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = parseInt(process.env.PORT || '5174', 10);
app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});