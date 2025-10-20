import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Icon from '../components/Icon';
import './CameraControl.css';
import { bridge } from '../utils/cameraControlBridge';
import { Presets } from '../utils/cameraPresets';

const defaultBridgeUrl = (typeof window !== 'undefined' && localStorage.getItem('cameraBridgeUrl')) || 'http://localhost:8080';
const defaultBridgeToken = (typeof window !== 'undefined' && localStorage.getItem('cameraBridgeToken')) || 'devtoken';

const CameraControl = () => {
  const { t } = useLanguage();
  const [bridgeUrl, setBridgeUrl] = useState(defaultBridgeUrl);
  const [bridgeToken, setBridgeToken] = useState(defaultBridgeToken);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [cameraInfo, setCameraInfo] = useState(null);
  const [mode, setMode] = useState('video'); // 'video' | 'photo' | 'timelapse'
  const [settings, setSettings] = useState({
    resolution: '2880x1440',
    fps: 30,
    bitrate: 40,
    stabilization: 'on',
    iso: 400,
    shutter: 'auto',
    whiteBalance: 'auto',
    // Advanced
    exposureLock: false,
    ev: 0,
    fov: 'standard',
  });
  const [previewActive, setPreviewActive] = useState(false);
  const [frameTick, setFrameTick] = useState(0);
  const [usePolling, setUsePolling] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState(null);
  const [useStatusPolling, setUseStatusPolling] = useState(false);
  const [mjpegLoaded, setMjpegLoaded] = useState(false);
  const [mjpegRetryTick, setMjpegRetryTick] = useState(0);
  const [bracket, setBracket] = useState({ stops: 5, evStep: 1, delayMs: 300, lockExposure: true, exposures: '' });
  const [useManualExposures, setUseManualExposures] = useState(false);
  const [bracketShots, setBracketShots] = useState([]);
  const [bracketSession, setBracketSession] = useState(null);
  const autoExposures = useMemo(() => {
    const nRaw = Number(bracket.stops) || 1;
    const n = Math.max(1, nRaw);
    const odd = n % 2 === 0 ? n + 1 : n;
    const half = (odd - 1) / 2;
    const step = Number(bracket.evStep) || 1;
    return Array.from({ length: odd }, (_, i) => (i - half) * step);
  }, [bracket.stops, bracket.evStep]);

  useEffect(() => {
    try { localStorage.setItem('cameraBridgeUrl', bridgeUrl); } catch {}
  }, [bridgeUrl]);

  useEffect(() => {
    try { localStorage.setItem('cameraBridgeToken', bridgeToken); } catch {}
  }, [bridgeToken]);

  const connect = async () => {
    setConnecting(true);
    try {
      bridge.setBaseUrl(bridgeUrl);
      bridge.setToken(bridgeToken);
      const info = await bridge.getInfo();
      setCameraInfo(info);
      setConnected(true);
    } catch (e) {
      console.error('Bridge connect failed:', e);
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  const startPreview = async () => {
    try {
      await bridge.startPreview();
      setMjpegLoaded(false);
      setMjpegRetryTick(0);
      setUsePolling(false);
      setPreviewActive(true);
    } catch (e) { console.error('Start preview failed:', e); }
  };
  const stopPreview = async () => {
    try {
      await bridge.stopPreview();
      setPreviewActive(false);
    } catch (e) { console.error('Stop preview failed:', e); }
  };

  const applyMode = async () => {
    try {
      await bridge.setMode(mode);
    } catch (e) { console.error('Set mode failed:', e); }
  };

  const applySettings = async () => {
    try {
      await bridge.applySettings(settings);
    } catch (e) { console.error('Apply settings failed:', e); }
  };

  const startRecord = async () => {
    try { await bridge.startRecord(); } catch (e) { console.error('Start record failed:', e); }
  };
  const stopRecord = async () => {
    try { await bridge.stopRecord(); } catch (e) { console.error('Stop record failed:', e); }
  };
  const takePhoto = async () => {
    try { await bridge.takePhoto(); } catch (e) { console.error('Take photo failed:', e); }
  };
  const startBracket = async () => {
    try {
      const payload = { delayMs: bracket.delayMs, lockExposure: bracket.lockExposure, includeThumbs: true, includeFull: true };
      if (useManualExposures && bracket.exposures && bracket.exposures.trim()) {
        payload.exposures = bracket.exposures
          .split(',')
          .map((s) => parseFloat(s.trim()))
          .filter((n) => !Number.isNaN(n));
      } else {
        payload.exposures = autoExposures;
      }
      const res = await bridge.photoBracket(payload);
      const sessionId = res?.session?.id || null;
      setBracketSession(sessionId);
      const shots = (res && Array.isArray(res.results))
        ? res.results
        : (Array.isArray(res.exposures) ? res.exposures.map((ev) => ({ ev, ok: true, thumb: null })) : []);
      setBracketShots(shots);
      // Persist latest bracket to localStorage so ShotDetails can reflect it
      try {
        const latest = { session: { id: sessionId }, results: shots, timestamp: Date.now() };
        localStorage.setItem('cameraBracketLatest', JSON.stringify(latest));
        window.dispatchEvent(new CustomEvent('camera-bracket-updated'));
      } catch {}
    } catch (e) { console.error('HDR bracketing failed:', e); }
  };

  const resolutions = ['2880x1440', '1440x720'];

  const handleUpload = (index, shot, e) => {
    const file = e.target?.files?.[0];
    if (!file || !bracketSession) return;
    bridge.uploadBracketImage(bracketSession, shot.ev, file)
      .then((resp) => {
        const full = resp?.full;
        if (!full) return;
        setBracketShots((prev) => {
          const arr = [...prev];
          arr[index] = { ...arr[index], full };
          // Persist updated bracket state
          try {
            const latest = { session: { id: bracketSession }, results: arr, timestamp: Date.now() };
            localStorage.setItem('cameraBracketLatest', JSON.stringify(latest));
            window.dispatchEvent(new CustomEvent('camera-bracket-updated'));
          } catch {}
          return arr;
        });
      })
      .catch((err) => {
        console.error('Upload failed', err);
      });
  };
  const fpsOptions = [24, 25, 30, 50, 60];
  const stabilizationOptions = ['off', 'on'];
  const wbOptions = ['auto', '3200K', '5600K', '6500K'];
  const shutterOptions = ['auto', '1/50', '1/60', '1/100', '1/120'];
  const fovOptions = ['standard', 'wide', 'linear'];

  // Connect SSE status when connected
  useEffect(() => {
    let es;
    const onStatus = (e) => {
      try { setBridgeStatus(JSON.parse(e.data)); setUseStatusPolling(false); } catch {}
    };
    if (connected && bridgeUrl && bridgeToken) {
      try {
        es = new EventSource(`${bridgeUrl}/events?token=${encodeURIComponent(bridgeToken)}`);
        // Handle named SSE events sent as "event: status"
        es.addEventListener('status', onStatus);
        // Also handle default message events for compatibility
        es.onmessage = onStatus;
        es.onerror = () => {
          setUseStatusPolling(true);
          try { es.close(); } catch {}
        };
      } catch {
        setUseStatusPolling(true);
      }
    }
    return () => {
      if (es) {
        try { es.removeEventListener('status', onStatus); } catch {}
        try { es.close(); } catch {}
      }
    };
  }, [connected, bridgeUrl, bridgeToken]);
  
  // Start long-polling fallback when SSE fails
  useEffect(() => {
    let stop = false;
    const loop = async () => {
      while (connected && useStatusPolling && !stop) {
        try {
          const s = await bridge.getEventsOnce();
          setBridgeStatus(s);
        } catch {}
        await new Promise((r) => setTimeout(r, 1000));
      }
    };
    if (connected && useStatusPolling) loop();
    return () => { stop = true; };
  }, [connected, useStatusPolling]);

  // Keep previewActive in sync with backend status
  useEffect(() => {
    if (bridgeStatus && typeof bridgeStatus.preview_on === 'boolean') {
      setPreviewActive(bridgeStatus.preview_on);
    }
  }, [bridgeStatus]);

  // Polling interval to update single frame when fallback active
  useEffect(() => {
    if (previewActive && usePolling) {
      const id = setInterval(() => setFrameTick((v) => v + 1), 500);
      return () => clearInterval(id);
    }
  }, [previewActive, usePolling]);

  return (
    <div className="camera-control">
      <h1 className="page-title">{t('cameraControl.title', 'Camera Control (Beta)')}</h1>
      <p className="page-subtitle">{t('cameraControl.subtitle', 'Steuere deine Insta360 über WLAN. Benötigt Bridge‑Dienst.')}</p>

      <div className="card">
        <h2>{t('cameraControl.connection.title', 'Verbindung')}</h2>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>{t('cameraControl.connection.bridgeUrl', 'Bridge URL')}</label>
            <input type="text" value={bridgeUrl} onChange={(e) => setBridgeUrl(e.target.value)} placeholder="http://localhost:8080" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>{t('cameraControl.connection.bridgeToken', 'Bridge Token')}</label>
            <input type="text" value={bridgeToken} onChange={(e) => setBridgeToken(e.target.value)} placeholder="devtoken" />
          </div>
          <div className="form-group" style={{ alignSelf: 'flex-end' }}>
            <button className="btn-primary" onClick={connect} disabled={connecting}>
              {connecting ? t('common.loading', 'Loading...') : t('cameraControl.connection.connect', 'Verbinden')}
            </button>
          </div>
        </div>
        {bridgeStatus && (
          <div className="status-row" style={{ marginTop: 8 }}>
            <span>Preview: {bridgeStatus.preview_on ? 'On' : 'Off'} • Mode: {bridgeStatus.mode || '-'} • FPS: {settings.fps} • Events: {useStatusPolling ? 'Poll' : 'SSE'}</span>
          </div>
        )}
      </div>

      {connected && (
        <div className="card">
          <h2>{t('cameraControl.info.title', 'Kamera‑Info')}</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(cameraInfo, null, 2)}</pre>
        </div>
      )}

      <div className="card">
        <h2>{t('cameraControl.preview.title', 'Preview')}</h2>
        <div className="form-row">
          <button className="btn-secondary" onClick={startPreview} disabled={previewActive || !connected}>{t('cameraControl.preview.start', 'Preview starten')}</button>
          <button className="btn-danger" onClick={stopPreview} disabled={!previewActive}>{t('cameraControl.preview.stop', 'Preview stoppen')}</button>
        </div>
        <div className="preview-box" style={{ marginTop: 12 }}>
          {previewActive ? (
            <>
              {usePolling ? (
                (() => {
                  const url = bridge.getPreviewImageUrl();
                  const cacheUrl = url + (url.includes('?') ? `&t=${frameTick}` : `?t=${frameTick}`);
                  return (
                    <img src={cacheUrl} alt="Preview" style={{ width: '100%', maxHeight: '480px', objectFit: 'contain' }} />
                  );
                })()
              ) : (
                (() => {
                  const url = bridge.getPreviewVideoUrl();
                  const streamUrl = url + (url.includes('?') ? `&r=${mjpegRetryTick}` : `?r=${mjpegRetryTick}`);
                  return (
                    <img
                      src={streamUrl}
                      alt="Preview MJPEG Stream"
                      style={{ width: '100%', maxHeight: '480px', objectFit: 'contain' }}
                      onLoad={() => setMjpegLoaded(true)}
                      onError={() => setMjpegRetryTick((v) => { const n = v + 1; if (n >= 2) setUsePolling(true); return n; })}
                    />
                  );
                })()
              )}
            </>
          ) : (
            <div className="preview-placeholder">{t('cameraControl.preview.placeholder', 'Preview ist deaktiviert')}</div>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Modus</h2>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Modus</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="video">Video</option>
              <option value="photo">Foto</option>
              <option value="timelapse">Timelapse</option>
            </select>
          </div>
          <div className="form-group" style={{ alignSelf: 'flex-end' }}>
            <button className="btn-primary" onClick={applyMode} disabled={!connected}>Übernehmen</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Einstellungen</h2>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Auflösung</label>
            <select value={settings.resolution} onChange={(e) => setSettings({ ...settings, resolution: e.target.value })}>
              {resolutions.map((r) => (<option key={r} value={r}>{r}</option>))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>FPS</label>
            <select value={settings.fps} onChange={(e) => setSettings({ ...settings, fps: Number(e.target.value) })}>
              {fpsOptions.map((f) => (<option key={f} value={f}>{f}</option>))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Stabilisierung</label>
            <select value={settings.stabilization} onChange={(e) => setSettings({ ...settings, stabilization: e.target.value })}>
              {stabilizationOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>FOV</label>
            <select value={settings.fov} onChange={(e) => setSettings({ ...settings, fov: e.target.value })}>
              {fovOptions.map((f) => (<option key={f} value={f}>{f}</option>))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>ISO</label>
            <input type="number" value={settings.iso} onChange={(e) => setSettings({ ...settings, iso: Number(e.target.value) })} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Weißabgleich</label>
            <select value={settings.whiteBalance} onChange={(e) => setSettings({ ...settings, whiteBalance: e.target.value })}>
              {wbOptions.map((w) => (<option key={w} value={w}>{w}</option>))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Shutter</label>
            <select value={settings.shutter} onChange={(e) => setSettings({ ...settings, shutter: e.target.value })}>
              {shutterOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Bitrate (Mbps)</label>
            <input type="number" value={settings.bitrate} onChange={(e) => setSettings({ ...settings, bitrate: Number(e.target.value) })} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Belichtung sperren</label>
            <input type="checkbox" checked={settings.exposureLock} onChange={(e) => setSettings({ ...settings, exposureLock: e.target.checked })} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>EV‑Korrektur</label>
            <input type="number" step="0.3" min="-3" max="3" value={settings.ev} onChange={(e) => setSettings({ ...settings, ev: Number(e.target.value) })} />
          </div>
          <div className="form-group" style={{ alignSelf: 'flex-end' }}>
            <button className="btn-primary" onClick={applySettings} disabled={!connected}>Anwenden</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>HDR Bracketing</h2>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Stops</label>
            <input type="range" min="3" max="13" step="2" value={bracket.stops} onChange={(e) => setBracket({ ...bracket, stops: Number(e.target.value) })} />
            <div className="help-text" style={{ fontSize: '0.9em', color: '#666', marginTop: 4 }}>Stops: {bracket.stops}</div>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Abstand (EV)</label>
            <input type="range" min="0.3" max="2" step="0.1" value={bracket.evStep} onChange={(e) => setBracket({ ...bracket, evStep: Number(e.target.value) })} />
            <div className="help-text" style={{ fontSize: '0.9em', color: '#666', marginTop: 4 }}>Schrittweite: {Number(bracket.evStep).toFixed(1)} EV</div>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Exposures (EV, komma‑separiert)</label>
            <input type="text" value={bracket.exposures} onChange={(e) => setBracket({ ...bracket, exposures: e.target.value })} placeholder="-2,-1,0,1,2" disabled={!useManualExposures} />
            <div className="help-text" style={{ fontSize: '0.9em', color: '#666', marginTop: 4 }}>Automatisch: {autoExposures.map((n) => Number(n.toFixed(2))).join(', ')}</div>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Delay (ms)</label>
            <input type="number" value={bracket.delayMs} onChange={(e) => setBracket({ ...bracket, delayMs: Number(e.target.value) })} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Belichtung sperren</label>
            <input type="checkbox" checked={bracket.lockExposure} onChange={(e) => setBracket({ ...bracket, lockExposure: e.target.checked })} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Manuell EV‑Liste</label>
            <input type="checkbox" checked={useManualExposures} onChange={(e) => setUseManualExposures(e.target.checked)} />
          </div>
          <div className="form-group" style={{ alignSelf: 'flex-end' }}>
            <button className="btn-primary" onClick={startBracket} disabled={!connected}>{t('cameraControl.hdr.start', 'HDR Bracketing aufnehmen')}</button>
          </div>
        </div>
      </div>

      {/* Letzte Belichtungsreihe */}
      {bracketShots?.length > 0 && (
        <div className="card">
          <div className="card-header">Letzte Belichtungsreihe</div>
          <div className="thumb-grid">
            {bracketShots.map((s, idx) => {
              const fullUrl = s?.full?.url ? `${bridgeUrl}${s.full.url}` : null;
              const mp = s?.full?.megapixels != null ? Number(s.full.megapixels).toFixed(2) : null;
              const dim = s?.full ? `${s.full.width}×${s.full.height}` : null;
              const expMp = s?.full?.expectedMegapixels != null ? Number(s.full.expectedMegapixels).toFixed(1) : null;
              const expDim = s?.full ? `${s.full.expectedWidth}×${s.full.expectedHeight}` : null;
              return (
                <div key={idx} className="thumb-item">
                  <div className="thumb">
                    {s?.thumb ? (
                      <img src={s.thumb} alt={`EV ${s.ev}`} />
                    ) : (
                      <div className="thumb-placeholder">Kein Thumbnail</div>
                    )}
                  </div>
                  <div className="thumb-caption">EV {s.ev}</div>
                  {(fullUrl || mp || expMp) && (
                     <div className="thumb-meta">
                       {mp && dim && (
                         <span className="meta">{mp} MP ({dim})</span>
                       )}
                       {expMp && expDim && (
                         <span className="meta expected">Erwartet: {expMp} MP (~{expDim})</span>
                       )}
                       {fullUrl ? (
                         <a className="btn-link" href={fullUrl} target="_blank" rel="noreferrer">Öffnen</a>
                       ) : (
                         <input type="file" accept="image/*" onChange={(e)=>handleUpload(idx, s, e)} />
                       )}
                     </div>
                   )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="card">
        <h2>Aufnahme</h2>
        <div className="form-row">
          <button className="btn-primary" onClick={startRecord} disabled={!connected}>Aufnahme starten</button>
          <button className="btn-warning" onClick={stopRecord} disabled={!connected}>Aufnahme stoppen</button>
          <button className="btn-secondary" onClick={takePhoto} disabled={!connected || mode !== 'photo'}>Foto aufnehmen</button>
        </div>
      </div>
    </div>
  );
};

export default CameraControl;