import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './auth.js';
import { cloudConfigRouter } from './cloudConfig.js';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
    'http://localhost:5176',
    'http://127.0.0.1:5176',
    'http://localhost:5177',
    'http://127.0.0.1:5177',
    'http://localhost:5180',
    'http://127.0.0.1:5180',
    'http://192.168.178.71:5175',
    'http://192.168.178.71:5180',
    'http://192.168.178.71:5177',
    // Produktion: der-automat.com
    'https://www.der-automat.com',
    'http://www.der-automat.com',
    'https://der-automat.com',
    'http://der-automat.com',
  ],
  credentials: false,
}));
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

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/config', cloudConfigRouter);

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