import express from 'express';
import { requireAuth } from './auth.js';
import { upsertCloudConfig, getCloudConfig } from './db.js';
import { encryptJson, decryptJson } from './crypto.js';

export const cloudConfigRouter = express.Router();

cloudConfigRouter.get('/', requireAuth, (req, res) => {
  const row = getCloudConfig(req.userId);
  if (!row) return res.json({ enabled: false });
  const secret = process.env.CFG_SECRET || process.env.JWT_SECRET;
  const cfg = row.config_enc ? decryptJson(JSON.parse(row.config_enc), secret) : null;
  return res.json({
    enabled: !!row.enabled,
    intervalMinutes: row.interval_minutes,
    provider: row.provider || null,
    config: cfg || null,
    updatedAt: row.updated_at,
  });
});

cloudConfigRouter.put('/', requireAuth, (req, res) => {
  const { enabled, intervalMinutes, provider, config } = req.body || {};
  const interval = Math.max(5, Number(intervalMinutes || 30));
  const secret = process.env.CFG_SECRET || process.env.JWT_SECRET;
  const config_enc = config ? JSON.stringify(encryptJson(config, secret)) : null;
  const saved = upsertCloudConfig(req.userId, {
    enabled: !!enabled,
    intervalMinutes: interval,
    provider: provider || null,
    config_enc,
  });
  return res.json({ ok: true, updatedAt: saved.updated_at });
});