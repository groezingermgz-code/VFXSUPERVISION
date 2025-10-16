# TODO – Erweiterungen für Belichtung, Farbe und Optik

Dieses Dokument sammelt die geplanten Funktionen und Inhalte, damit wir sie schrittweise ins Projekt integrieren können. Aufgaben sind nach Priorität gruppiert und enthalten grobe Zieldefinitionen und Dateiverweise.

## Quick Wins (Hohe Priorität)

- [x] Flicker‑Safe Shutter Rechner (50/60 Hz, LED/HMI)
  - Ziel: sichere Verschlusszeiten (Vielfache von 1/50, 1/100 bzw. 1/60, 1/120) und Shutter‑Angle‑Optionen (z. B. 144°@24 fps in 60 Hz)
  - UI: `src/pages/CameraSettings.jsx` (Info‑Panel mit Netzfrequenz/Framerate und Empfehlungen)

- [ ] Shutter‑Angle Rechner + 180°‑Regel
  - Formel: `t = (Angle/360) / FrameRate` und Umkehrung
  - UI: `src/pages/CameraSettings.jsx`

- [ ] Photometrie‑Tools (Candela → Lux, Inverse Square, Cosinusgesetz, Belichtungsdosis)
  - Formeln: `E = (I · cosθ) / d²`, `H = E · t`
  - UI: neue Seite `LightingTools.jsx` oder Integration in `CameraSettings.jsx`

- [ ] Blitz‑Rechner (Guide Number, ISO‑Skalierung, Distanz/Apertur)
  - Formeln: `GN = f · Distanz`; `GN_new = GN_old · sqrt(ISO_new/ISO_old)`
  - Hinweise: HSS‑Verlust (~1 EV pro Verdopplung der Zeit), t.1 vs t.5
  - UI: neue Seite `FlashCalculator.jsx`

- [ ] Mired/CTO/CTB Rechner + Plus/Minus‑Grün und Duv‑Hinweise
  - Formeln: `Mired = 1,000,000 / T(K)`; Mired‑Shifts additiv
  - UI/Daten: `src/data/filterDatabase.js`, neue UI‑Sektion in `LightingTools.jsx`

## Fortgeschritten (Mittlere Priorität)

- [ ] Effektive Blende (Makro) inkl. Pupil Magnification
  - Formeln: `N_eff = N · (1 + m)` (symmetrisch), präziser: `N_eff = N · (1 + m/P)`
  - UI: Erweiterung `src/pages/LensMapper.jsx`; Eingabefeld für `P`
  - Daten: optional `pupilMagnification` in `src/data/lensDatabase.js`

- [ ] Tilt/Scheimpflug Visualisierung + DOF‑Wedge
  - Ziel: Ebene der Schärfe drehen (Scheimpflug) und Keilförmige DOF anzeigen
  - UI: neue Sektion in `src/pages/SensorPreview.jsx` oder eigene Seite `TiltVisualizer.jsx`

- [x] ARRI LogC (LogC3/LogC4) – EI & Middle Gray Placement
  - Inhalte: Middle Gray 39 % (LogC3), LogC4 Hinweise, EI‑Verhalten
  - UI/Daten: `src/data/cameraDatabase.js`, Info‑Panel in `CameraSettings.jsx`

- [x] Shutter‑Angle Rechner + 180°‑Regel
  - Formel: `t = (Angle/360) / FrameRate` und Umkehrung
  - UI: `src/pages/CameraSettings.jsx` (eigener Rechner‑Abschnitt)

- [ ] T‑Stop vs f‑Stop Darstellung
  - Ziel: Transmission (T‑Stop) vs theoretische Öffnung (f‑Stop) erklären; Linsendaten erweitern
  - Daten/UI: Feld `tStop` in `src/data/lensDatabase.js`, Tooltips in `LensMapper.jsx`

- [ ] Light‑Softness Tool (scheinbare Größe & Winkel)
  - Formel: Winkel ≈ `2 · arctan(Radius/Distanz)`; Penumbra/Wrap‑Demo
  - UI: `LightingTools.jsx`

## UI/Navigation

- [ ] Neue Seiten und Routing anlegen
  - `src/pages/FlashCalculator.jsx`
  - `src/pages/LightingTools.jsx`
  - Navbar‑Einträge: `src/components/Navbar.jsx`

- [x] Hersteller/Objektiv‑Auswahl im Lens‑Mapper integrieren
  - UI: `src/pages/LensMapper.jsx` (Dropdowns; auto‑Brennweite aus Modell)

- [x] Farbfilter‑Shortcuts in ShotDetails (CTO/CTB/Plus/Minus‑Grün)
  - UI: `src/pages/ShotDetails.jsx` (Quick‑Select Dropdowns; Chips mit Entfernen)

- [x] Distortion‑Grids (gefilmt) – VFX Aufgaben
  - UI: `src/pages/ShotDetails.jsx` (Detailbereich unter VFX mit Brennweiten, Bereich, Squeeze, Datum, Notizen)

- [x] Lighting‑Tools Seite (Photometrie‑Rechner)
  - UI: `src/pages/LightingTools.jsx`, Routing in `src/App.jsx`, Navbar‑Eintrag

## Daten/Modelle

- [x] Filterdaten erweitern
  - `src/data/filterDatabase.js`: Mired‑Werte für CTO/CTB‑Stärken; Plus/Minus‑Grün; Herstellerhinweise

- [x] Kameradaten erweitern
  - `src/data/cameraDatabase.js`: Flicker‑Regeln (50/60 Hz), Shutter‑Guidelines, LogC‑Infos

- [ ] Linsendaten erweitern
  - `src/data/lensDatabase.js`: `tStop`, optional `pupilMagnification`

## Utils/Exports

- [ ] Cheat‑Sheets als PDF exportieren
  - `src/utils/pdfExporter.js`: Formelsammlung, sichere Shutter‑Werte, HSS/TTL Hinweise

- [ ] PWA‑Caching für neue Seiten
  - `public/sw.js`, `src/utils/offlineManager.js`

## Tests/Validierung

- [ ] Unit‑Tests für Rechner/Utils
  - Randfälle (z. B. 0°/360°, m→0/hohe m, HSS Grenzwerte)
  - Beispieltests: `test_focal_length.js` als Muster erweitern

- [ ] Visuelle Prüfung & Beispiele
  - Beispiel‑Presets in `src/pages/ShotDetails.jsx`/`ShotList.jsx`

## Lokalisierung

- [ ] Sprachstrings ergänzen
  - `src/contexts/LanguageContext.jsx`: DE/EN für neue UI‑Elemente

## Referenzen (für Implementierungstext & Tooltips)

- Sekonic: Flash‑Dauer t0.5/t0.1 (ISO‑Definitionen)
- PocketWizard: HSS vs HyperSync; Timing/Effizienz
- ARRI: LogC3/LogC4 Kurven, EI/Middle‑Gray
- Cambridge in Colour: Tilt‑Shift & DOF‑Wedge
- Strobist/Tangents/Wikipedia: GN, Softness (scheinbare Größe), Photometrie‑Grundlagen