# Changelog

## v0.4.1-auth — 2025-10-21

- Dummy-Login-Buttons entfernt aus `src/pages/Login.jsx`.
- Frontend-API-Basis auf `http://localhost:5180` konfiguriert (`.env.local`).
- Auth-Server auf Port 5180 gestartet; Seed aktualisiert/verifiziert Dummy-User.
- Bridge/Tools aktualisiert: `bridge/insta360-python/app.py`, `tools/hdr_merge.py`.
- Kleinere Anpassungen: `src/pages/Settings.jsx`, `src/contexts/AuthContext.jsx`, `src/utils/cameraControlBridge.js`.
- Commit: `b489bb8` (Tag: `v0.4.1-auth`).

## v0.4.0-ui — 2025-10-21

- "Aufnahme"-Karte über "HDR Bracketing" verschoben.
- "Start Recording"-Button zurück in die "Aufnahme"-Karte.
- Checkbox "Nur genau N erfolgreiche Shots" direkt unter "Manuelle EV‑Liste" platziert.
- HDR Merge UI: "Gamma" neben "Tonemapping (Preview)", "Alignment" darunter.
- Commit: `62de1c9` (Tag: `v0.4.0-ui`).

## Hinweise

- Beide Tags wurden gepusht: `v0.4.0-ui`, `v0.4.1-auth`.
- Für Releases auf GitHub können diese Einträge als Release Notes verwendet werden.