// Bridge client for Camera Control page
// Provides HTTP calls to native Android bridge or Python FastAPI

const ENV_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BRIDGE_BASE_URL) || null;
let BASE_URL = ENV_BASE || (typeof window !== 'undefined' && localStorage.getItem('cameraBridgeUrl')) || 'http://localhost:5174';
let AUTH_TOKEN = (typeof window !== 'undefined' && localStorage.getItem('cameraBridgeToken')) || 'devtoken';

function authHeaders() {
  return AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {};
}

function authQuerySuffix() {
  return AUTH_TOKEN ? `?token=${encodeURIComponent(AUTH_TOKEN)}` : '';
}

export const bridge = {
  setBaseUrl(url) {
    BASE_URL = url;
    try { localStorage.setItem('cameraBridgeUrl', url); } catch {}
  },
  setToken(token) {
    AUTH_TOKEN = token || '';
    try { localStorage.setItem('cameraBridgeToken', AUTH_TOKEN); } catch {}
  },
  async getInfo() {
    const res = await fetch(`${BASE_URL}/info`, { headers: { ...authHeaders() } });
    if (!res.ok) throw new Error(`Info failed: ${res.status}`);
    return res.json();
  },
  async setMode(mode) {
    const res = await fetch(`${BASE_URL}/mode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ mode }),
    });
    if (!res.ok) throw new Error(`SetMode failed: ${res.status}`);
    return res.json();
  },
  async applySettings(settings) {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error(`ApplySettings failed: ${res.status}`);
    return res.json();
  },
  async startRecord() {
    const res = await fetch(`${BASE_URL}/record/start`, { method: 'POST', headers: { ...authHeaders() } });
    if (!res.ok) throw new Error(`StartRecord failed: ${res.status}`);
    return res.json();
  },
  async stopRecord() {
    const res = await fetch(`${BASE_URL}/record/stop`, { method: 'POST', headers: { ...authHeaders() } });
    if (!res.ok) throw new Error(`StopRecord failed: ${res.status}`);
    return res.json();
  },
  async takePhoto() {
    const res = await fetch(`${BASE_URL}/photo`, { method: 'POST', headers: { ...authHeaders() } });
    if (!res.ok) throw new Error(`TakePhoto failed: ${res.status}`);
    return res.json();
  },
  async startPreview() {
    const res = await fetch(`${BASE_URL}/preview/start`, { method: 'POST', headers: { ...authHeaders() } });
    if (!res.ok) throw new Error(`StartPreview failed: ${res.status}`);
    return res.json();
  },
  async stopPreview() {
    const res = await fetch(`${BASE_URL}/preview/stop`, { method: 'POST', headers: { ...authHeaders() } });
    if (!res.ok) throw new Error(`StopPreview failed: ${res.status}`);
    return res.json();
  },
  // For polling single preview frames.
  getPreviewImageUrl() {
    return `${BASE_URL}/preview/frame${authQuerySuffix()}`;
  },
  // MJPEG streaming url: prefer alias /preview/stream; backend also supports /preview.mjpeg
  getPreviewVideoUrl() {
    return `${BASE_URL}/preview/stream${authQuerySuffix()}`;
  },
  // New: status events long-polling and HDR bracketing
  async getEventsOnce() {
    const res = await fetch(`${BASE_URL}/events/poll`, { headers: { ...authHeaders() } });
    if (!res.ok) throw new Error(`Events poll failed: ${res.status}`);
    return res.json();
  },
  async photoBracket(options = {}) {
    const res = await fetch(`${BASE_URL}/photo/bracket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(options),
    });
    if (!res.ok) throw new Error(`Photo bracket failed: ${res.status}`);
    return res.json();
  },
  getEventsStreamUrl() {
    return `${BASE_URL}/events${authQuerySuffix()}`;
  },
  async uploadBracketImage(sessionId, ev, file) {
    const url = `${BASE_URL}/files/upload`;
    const form = new FormData();
    form.append('session', String(sessionId));
    form.append('ev', String(ev));
    form.append('file', file);
    const res = await fetch(url, {
      method: 'POST',
      headers: { ...authHeaders() },
      body: form,
    });
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    return await res.json();
  },
  async mergeBracket(options = {}, opts = {}) {
    const res = await fetch(`${BASE_URL}/photo/bracket/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(options),
      signal: opts.signal,
    });
    if (!res.ok) throw new Error(`Merge failed: ${res.status}`);
    return await res.json();
  }
};