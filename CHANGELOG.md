# Changelog

## v0.4.4 — 2025-10-26

- Clip-Benennung vereinheitlicht: Felder `Kameraindex`, `Reel-Nummer`, `Clip-Nummer` für Schema `A001_C001` jetzt für alle Hersteller sichtbar.
- Feld `Manuelle Clip-ID` hinzugefügt; überschreibt das generierte Schema, kein Auto-Increment.
- Auto-Increment für `Clip-Nummer` nur bei generierten IDs.
- Dev: `React.StrictMode` nur in Produktion aktiv, doppelte Logs in Dev entfernt.
- Dateien: `src/pages/ShotDetails.jsx`, `src/main.jsx`.
- Version: `0.1.6`.

## v0.4.3 — 2025-10-26

- Login- und SplashLogin-Oberflächen auf Englisch vereinheitlicht.
- Auth-Fehlermeldungen vereinheitlicht (Frontend & Server): `src/contexts/AuthContext.jsx`, `server/auth.js`.
- PWA-Install-Button-Texte auf Englisch (`src/components/InstallPWA.jsx`).
- Kleinere Textanpassungen: `src/pages/Settings.jsx`, `src/pages/SensorPreview.jsx`, `src/pages/ColorWorkflows.jsx`.
- Commit: `93bf4d9` (Tag: `v0.4.3`).

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

- Tags: `v0.4.0-ui`, `v0.4.1-auth`, `v0.4.3`.
- Für Releases auf GitHub können diese Einträge als Release Notes verwendet werden.