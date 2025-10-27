# Deployment Anleitung (Cloudflare Pages + Render)

## Übersicht
- Frontend: Cloudflare Pages (Vite Build aus `dist`)
- Backend: Render Web Service (Node/Express aus `server/index.js`)

## Frontend (Cloudflare Pages)
1. Repository mit Cloudflare Pages verbinden.
2. Build-Einstellungen:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Environment Variables:
   - `VITE_API_URL` = `https://<dein-backend-host>/api`
   - Beispiel (Render): `https://vfx-supervision-api.onrender.com/api`
4. SPA-Fallback:
   - Datei `public/_redirects` vorhanden: `/* /index.html 200`
5. Domain:
   - Standard: `<projekt>.pages.dev` (bereits durch CORS erlaubt)
   - Eigene Domain optional; bei Nutzung `der-automat.com` ist bereits whitelisted.

## Backend (Render)
1. Render öffnen und "New Web Service" aus Repo erstellen.
2. Einstellungen gemäß `render.yaml`:
   - Environment: Node
   - Build Command: `npm ci`
   - Start Command: `node server/index.js`
   - Health Check: `/api/health`
3. Environment Variables setzen:
   - `JWT_SECRET` (zufälliger sicherer String)
   - Optional: `DISABLE_REGISTRATION` = `false`
   - Optional: `OPEN_LOGIN_MODE` = `true` für vereinfachtes Testen
4. Nach Deploy: URL kopieren, z. B. `https://vfx-supervision-api.onrender.com`
5. In Cloudflare Pages `VITE_API_URL` auf `https://<render-url>/api` setzen.

### Healthcheck & Warm‑up (Render)
- Render Free‑Instanzen schlafen ein und benötigen beim ersten Zugriff bis zu 60–120 Sekunden zum Hochfahren.
- Der CI‑Workflow (`deploy-cloudflare.yml`) führt vor dem Frontend‑Deploy einen Preflight‑Healthcheck durch:
  - Erkennt automatisch, ob `VITE_API_URL` bereits mit `/api` endet.
  - Ping auf `BASE` (Warm‑up) und wiederholtes Pollen von `HEALTH_URL` (bis zu 12 Versuche).
  - Bei Fehlschlag werden Header und Body‑Preview geloggt, um die Ursache zu erkennen (z. B. 502/Timeout).
- Stelle sicher:
  - `VITE_API_URL` zeigt exakt auf die Render‑Basis mit `/api` (z. B. `https://vfx-supervision-api.onrender.com/api`).
  - `render.yaml` enthält `healthCheckPath: /api/health` (ist bereits so konfiguriert).
  - Bei sporadischen 502 hilft es, den Preflight erneut auszuführen oder kurz manuell die Render‑Basis‑URL im Browser zu öffnen (Warm‑up).

## CORS
- Der Server erlaubt lokale Dev-Origins und Domains unter `*.pages.dev` dynamisch.
- Eigene Domain `der-automat.com` ist whitelistet.
- Bei weiteren Domains einfach `origin`-Check in `server/index.js` erweitern.

## Testen
- Frontend auf Pages öffnen und Login testen.
- Prüfen, dass `POST <backend>/api/auth/login` mit Status 200 antwortet.
- Optional: `OPEN_LOGIN_MODE=true` aktivieren, um ohne E-Mail-Verifizierung zu testen.

## Hinweise
- Verifikations-Links nutzen die Request-Domain; in Produktion sicherstellen, dass E-Mail-Versand konfiguriert ist.
- Falls Netlify weiter genutzt werden soll, kann `VITE_API_URL` entsprechend gesetzt werden.

## CI/CD (GitHub Actions)
- Workflow: `.github/workflows/deploy-cloudflare.yml` baut Vite und veröffentlicht mit `cloudflare/wrangler-action@v3` nach Cloudflare Pages.
- GitHub Secrets erforderlich: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- GitHub Repository-Variablen erforderlich: `CLOUDFLARE_PROJECT_NAME`, `VITE_API_URL`.
- Workflow: `.github/workflows/deploy-render.yml` triggert einen Render-Deploy bei Push auf `main`.
- GitHub Secrets erforderlich: `RENDER_SERVICE_ID` (Render Service-ID, beginnt mit `srv-...`), `RENDER_API_KEY`.
- Einrichtung in GitHub:
  - Repo → Settings → Secrets and variables → Actions.
  - Unter Secrets die oben genannten Schlüssel hinzufügen.
  - Unter Variables `CLOUDFLARE_PROJECT_NAME` und `VITE_API_URL` anlegen.
- Werte finden:
  - `CLOUDFLARE_ACCOUNT_ID`: im Cloudflare Dashboard (z. B. `dash.cloudflare.com/<ACCOUNT_ID>/pages`).
  - `CLOUDFLARE_API_TOKEN`: API Token mit „Cloudflare Pages — Edit“-Rechten.
  - `CLOUDFLARE_PROJECT_NAME`: Name des Pages-Projekts.
  - `RENDER_SERVICE_ID`: in der Render Service-URL (Format `srv-...`).
  - `RENDER_API_KEY`: Render → Account Settings → API Keys.
- Hinweise:
  - Falls Render Auto-Deploy aktiv ist, wird bei jedem Push automatisch gebaut; der GitHub Action-Workflow ermöglicht zusätzlich manuelles oder explizites Triggern.
  - Bei Cloudflare Pages kannst du alternativ direkt im Pages-Dashboard bauen; in unserem Workflow wird lokal in GitHub Actions gebaut und das `dist`-Verzeichnis hochgeladen.

### `VITE_API_URL` – korrekte Form
- Verwende immer die vollständige Backend‑Basis mit `/api`‑Suffix:
  - Empfohlen: `https://vfx-supervision-api.onrender.com/api`
  - Nicht empfohlen: Basis ohne `/api` oder falscher Host (führt zu 404/502 oder Endpunkt‑Mismatch).
- Frontend‑Fallbacks:
  - Dev: `http://localhost:5174/api`
  - Prod: `'/api'` (relativ) — funktioniert nur, wenn Frontend und Backend unter derselben Domain laufen (nicht der Fall bei Pages + Render). Daher immer `VITE_API_URL` setzen.

## Wichtige Klarstellung: Cloudflare Projekt vs. GitHub Repository
- `CLOUDFLARE_PROJECT_NAME` bezieht sich auf den Namen des Cloudflare Pages Projekts (z. B. `vfx-supervision`). Dieser Name bestimmt die Pages-Subdomain (`https://vfx-supervision.pages.dev`).
- Der GitHub-Repository-Slug ist separat (z. B. `groezingermgz-code/vfx-supervision`). Änderungen am Repo-Namen beeinflussen den Pages-Projektnamen nicht automatisch.
- Prüfe in `.github/workflows/deploy-cloudflare.yml`, dass bei der Übergabe an `cloudflare/pages-action@v1` das korrekte `projectName` gesetzt ist (entweder über die Repo-Variable `CLOUDFLARE_PROJECT_NAME` oder mit einem sinnvollen Fallback).
- Stelle sicher, dass `VITE_API_URL` in den GitHub Repository-Variablen korrekt auf dein Backend zeigt. Ein falscher Wert kann zu einer weißen Seite führen, wenn Initial-Requests fehlschlagen.