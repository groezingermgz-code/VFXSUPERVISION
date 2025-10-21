import path from 'path';
import fs from 'fs';
import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';

const dbPath = path.resolve(process.cwd(), 'server', 'db.json');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const adapter = new JSONFileSync(dbPath);
export const db = new LowSync(adapter, { users: [], cloud_configs: [], invites: [], verifications: [] });

// Ensure data is loaded
try { db.read(); } catch {}
if (!db.data) db.data = { users: [], cloud_configs: [], invites: [], verifications: [] };

function write() {
  try { db.write(); } catch (e) { console.error('db write error', e); }
}

export function getUserByEmail(email) {
  db.read();
  return (db.data.users || []).find(u => u.email === email) || null;
}

export function createUser({ email, name, password_hash, email_verified = false }) {
  db.read();
  const created_at = new Date().toISOString();
  const id = Date.now();
  const user = { id, email, name, password_hash, created_at, email_verified: !!email_verified };
  db.data.users.push(user);
  write();
  return user;
}

export function setUserEmailVerified(user_id, verified = true) {
  db.read();
  const u = (db.data.users || []).find(x => x.id === user_id);
  if (u) {
    u.email_verified = !!verified;
    write();
  }
  return u;
}

export function setUserName(user_id, name) {
  db.read();
  const u = (db.data.users || []).find(x => x.id === user_id);
  if (u) {
    const n = typeof name === 'string' ? name.trim() : '';
    if (n) {
      u.name = n;
      write();
    }
  }
  return u;
}
export function getUserById(id) {
  db.read();
  return (db.data.users || []).find(u => u.id === id) || null;
}

export function upsertCloudConfig(user_id, cfg) {
  db.read();
  const updated_at = new Date().toISOString();
  const enabled = !!cfg.enabled;
  const interval_minutes = Math.max(5, Number(cfg.intervalMinutes || 30));
  const provider = cfg.provider || null;
  const config_enc = cfg.config_enc || null;
  const list = db.data.cloud_configs || (db.data.cloud_configs = []);
  const existing = list.find(c => c.user_id === user_id);
  if (existing) {
    existing.enabled = enabled;
    existing.interval_minutes = interval_minutes;
    existing.provider = provider;
    existing.config_enc = config_enc;
    existing.updated_at = updated_at;
  } else {
    list.push({ user_id, enabled, interval_minutes, provider, config_enc, updated_at });
  }
  write();
  return list.find(c => c.user_id === user_id);
}

export function getCloudConfig(user_id) {
  db.read();
  const list = db.data.cloud_configs || [];
  return list.find(c => c.user_id === user_id) || null;
}

export function createInvite({ email, name, invited_by, token, expires_at }) {
  db.read();
  const id = Date.now();
  const created_at = new Date().toISOString();
  const inv = { id, email, name, invited_by, token, created_at, expires_at: expires_at || null, accepted_at: null };
  db.data.invites = db.data.invites || [];
  db.data.invites.push(inv);
  try { db.write(); } catch (e) { console.error('db write error', e); }
  return inv;
}

export function getInviteByToken(token) {
  db.read();
  const list = db.data.invites || [];
  return list.find(i => i.token === token) || null;
}

export function markInviteAccepted(token) {
  db.read();
  const list = db.data.invites || [];
  const inv = list.find(i => i.token === token);
  if (inv) {
    inv.accepted_at = new Date().toISOString();
    try { db.write(); } catch (e) { console.error('db write error', e); }
  }
  return inv;
}

// Email verification records
export function createVerification({ user_id, token, expires_at }) {
  db.read();
  db.data.verifications = db.data.verifications || [];
  const id = Date.now();
  const created_at = new Date().toISOString();
  const rec = { id, user_id, token, created_at, expires_at: expires_at || null, used_at: null };
  db.data.verifications.push(rec);
  write();
  return rec;
}

export function getVerificationByToken(token) {
  db.read();
  const list = db.data.verifications || [];
  return list.find(v => v.token === token) || null;
}

export function markVerificationUsed(token) {
  db.read();
  const list = db.data.verifications || [];
  const rec = list.find(v => v.token === token);
  if (rec) {
    rec.used_at = new Date().toISOString();
    write();
  }
  return rec;
}