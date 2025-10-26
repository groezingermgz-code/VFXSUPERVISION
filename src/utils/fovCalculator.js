// Field of View (FOV) Berechnungsutilities
import { getSensorSizeByFormat } from '../data/cameraDatabase';
import { getLensManufacturers } from '../data/lensDatabase';

/**
 * Extrahiert die Brennweite aus einem Objektivnamen
 * @param {string} lensName - Der vollständige Objektivname
 * @returns {number|null} - Die Brennweite in mm oder null wenn nicht gefunden
 */
export const extractFocalLength = (lensName) => {
  if (!lensName) return null;

  // Robustere Extraktion: unterstützt Bereiche, T‑Stops, Macro und Varianten
  const patterns = [
    // Zoom-Bereich: „24-70mm“, „16 – 35 mm“
    /(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)\s*mm/i,
    // Zoom-Bereich mit Worten: „24 bis 70 mm“, „24 to 70mm“
    /(\d+(?:\.\d+)?)\s*(?:bis|to)\s*(\d+(?:\.\d+)?)\s*mm/i,
    // Einzelbrennweite mit T‑Stop: „50mm T1.4“, „25 mm T2.1“
    /(\d+(?:\.\d+)?)\s*mm\s*T\d+(?:\.\d+)?/i,
    // Einzelbrennweite mit Macro: „100mm Macro“
    /(\d+(?:\.\d+)?)\s*mm\s*Macro/i,
    // Einzelbrennweite mit Zusätzen in Klammern: „28mm T2.2 (2x)“
    /(\d+(?:\.\d+)?)\s*mm\s*(?:\([^)]*\))?/i,
  ];

  for (const pattern of patterns) {
    const match = lensName.match(pattern);
    if (match) {
      // Für Bereiche: nimm die erste Zahl als FOV‑Basis
      return parseFloat(match[1]);
    }
  }

  // Fallback: einfache Erkennung
  const simple = lensName.match(/(\d+(?:\.\d+)?)\s*mm/i);
  return simple ? parseFloat(simple[1]) : null;
};

/**
 * Parst die Sensorgröße aus dem Format "Breite x Höhe mm"
 * @param {string} sensorSize - Sensorgröße im Format "36.0 x 24.0 mm"
 * @returns {object|null} - {width: number, height: number} oder null
 */
export const parseSensorSize = (sensorSize) => {
  if (!sensorSize || sensorSize === 'Nicht verfügbar') return null;
  
  const match = sensorSize.match(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*mm/i);
  if (match) {
    return {
      width: parseFloat(match[1]),
      height: parseFloat(match[2])
    };
  }
  
  return null;
};

/**
 * Parst das Seitenverhältnis aus dem Format "16:9" oder "1.78:1"
 * @param {string} aspectRatio - Seitenverhältnis als String
 * @returns {number|null} - Seitenverhältnis als Dezimalzahl oder null
 */
export const parseAspectRatio = (aspectRatio) => {
  if (!aspectRatio) return null;
  
  // Format "16:9"
  let match = aspectRatio.match(/(\d+\.?\d*):(\d+\.?\d*)/);
  if (match) {
    return parseFloat(match[1]) / parseFloat(match[2]);
  }
  
  // Format "1.78:1"
  match = aspectRatio.match(/(\d+\.?\d*):1/);
  if (match) {
    return parseFloat(match[1]);
  }
  
  return null;
};

/**
 * Berechnet den Crop-Faktor im Vergleich zu Vollformat (36x24mm)
 * @param {number} sensorWidth - Sensorbreite in mm
 * @param {number} sensorHeight - Sensorhöhe in mm
 * @returns {number} - Crop-Faktor
 */
export const calculateCropFactor = (sensorWidth, sensorHeight) => {
  if (!sensorWidth || !sensorHeight || sensorWidth <= 0 || sensorHeight <= 0) {
    return null;
  }
  
  const fullFrameDiagonal = Math.sqrt(36*36 + 24*24); // ca. 43.3mm
  const sensorDiagonal = Math.sqrt(sensorWidth*sensorWidth + sensorHeight*sensorHeight);
  
  return Math.round((fullFrameDiagonal / sensorDiagonal) * 100) / 100; // Auf 2 Dezimalstellen runden
};

/**
 * Berechnet das horizontale Field of View (FOV)
 * @param {number} focalLength - Brennweite in mm
 * @param {number} sensorWidth - Sensorbreite in mm
 * @param {string} projectionType - Projektionstyp ('rectilinear', 'fisheye-equidistant', 'fisheye-stereographic')
 * @returns {number} - FOV in Grad
 */
export const calculateHorizontalFOV = (focalLength, sensorWidth, projectionType = 'rectilinear') => {
  if (!focalLength || !sensorWidth || focalLength <= 0 || sensorWidth <= 0) {
    return null;
  }
  
  let fovDegrees;
  
  switch (projectionType) {
    case 'fisheye-equidistant':
      // FOV = (sensorWidth / focalLength) * (180 / Math.PI)
      fovDegrees = (sensorWidth / focalLength) * (180 / Math.PI);
      break;
    case 'fisheye-stereographic':
      // FOV = 4 * arctan(sensorWidth / (4 * focalLength)) * (180 / Math.PI)
      fovDegrees = 4 * Math.atan(sensorWidth / (4 * focalLength)) * (180 / Math.PI);
      break;
    case 'rectilinear':
    default:
      // FOV = 2 * arctan(sensorWidth / (2 * focalLength)) * (180 / Math.PI)
      fovDegrees = 2 * Math.atan(sensorWidth / (2 * focalLength)) * (180 / Math.PI);
      break;
  }
  
  return Math.round(fovDegrees * 10) / 10; // Auf 1 Dezimalstelle runden
};

/**
 * Berechnet das vertikale Field of View (FOV)
 * @param {number} focalLength - Brennweite in mm
 * @param {number} sensorHeight - Sensorhöhe in mm
 * @param {string} projectionType - Projektionstyp ('rectilinear', 'fisheye-equidistant', 'fisheye-stereographic')
 * @returns {number} - FOV in Grad
 */
export const calculateVerticalFOV = (focalLength, sensorHeight, projectionType = 'rectilinear') => {
  if (!focalLength || !sensorHeight || focalLength <= 0 || sensorHeight <= 0) {
    return null;
  }
  
  let fovDegrees;
  
  switch (projectionType) {
    case 'fisheye-equidistant':
      // FOV = (sensorHeight / focalLength) * (180 / Math.PI)
      fovDegrees = (sensorHeight / focalLength) * (180 / Math.PI);
      break;
    case 'fisheye-stereographic':
      // FOV = 4 * arctan(sensorHeight / (4 * focalLength)) * (180 / Math.PI)
      fovDegrees = 4 * Math.atan(sensorHeight / (4 * focalLength)) * (180 / Math.PI);
      break;
    case 'rectilinear':
    default:
      // FOV = 2 * arctan(sensorHeight / (2 * focalLength)) * (180 / Math.PI)
      fovDegrees = 2 * Math.atan(sensorHeight / (2 * focalLength)) * (180 / Math.PI);
      break;
  }
  
  return Math.round(fovDegrees * 10) / 10; // Auf 1 Dezimalstelle runden
};

/**
 * Berechnet das diagonale Field of View (FOV)
 * @param {number} focalLength - Brennweite in mm
 * @param {number} sensorWidth - Sensorbreite in mm
 * @param {number} sensorHeight - Sensorhöhe in mm
 * @param {string} projectionType - Projektionstyp ('rectilinear', 'fisheye-equidistant', 'fisheye-stereographic')
 * @returns {number} - FOV in Grad
 */
export const calculateDiagonalFOV = (focalLength, sensorWidth, sensorHeight, projectionType = 'rectilinear') => {
  if (!focalLength || !sensorWidth || !sensorHeight || 
      focalLength <= 0 || sensorWidth <= 0 || sensorHeight <= 0) {
    return null;
  }
  
  // Diagonale des Sensors berechnen
  const sensorDiagonal = Math.sqrt(sensorWidth * sensorWidth + sensorHeight * sensorHeight);
  
  let fovDegrees;
  
  switch (projectionType) {
    case 'fisheye-equidistant':
      // FOV = (sensorDiagonal / focalLength) * (180 / Math.PI)
      fovDegrees = (sensorDiagonal / focalLength) * (180 / Math.PI);
      break;
    case 'fisheye-stereographic':
      // FOV = 4 * arctan(sensorDiagonal / (4 * focalLength)) * (180 / Math.PI)
      fovDegrees = 4 * Math.atan(sensorDiagonal / (4 * focalLength)) * (180 / Math.PI);
      break;
    case 'rectilinear':
    default:
      // FOV = 2 * arctan(sensorDiagonal / (2 * focalLength)) * (180 / Math.PI)
      fovDegrees = 2 * Math.atan(sensorDiagonal / (2 * focalLength)) * (180 / Math.PI);
      break;
  }
  
  return Math.round(fovDegrees * 10) / 10; // Auf 1 Dezimalstelle runden
};

/**
 * Extrahiert den Anamorph‑Faktor (z. B. 2x, 1.8x, 1.5x, 1.33x) aus einem Objektivnamen
 * Erkennt zusätzlich Kennung "A2S" (Angenieux Ultra Compact A2S → 2x)
 * @param {string} lensName
 * @returns {number} Faktor (>1) oder 1, wenn keiner gefunden wurde
 */
export const extractAnamorphicFactor = (lensName) => {
  if (!lensName || typeof lensName !== 'string') return 1;
  // Erlaube Muster überall im Namen, inklusive Klammern und "×" Symbol; akzeptiere Komma als Dezimaltrenner
  const s = lensName.replace(/,/g, '.');
  const match = s.match(/(\d+(?:\.\d+)?)\s*[x×]/i);
  if (match && match[1]) {
    const n = parseFloat(match[1]);
    if (!isNaN(n) && n > 1) return n;
  }
  // Spezielle Kennung A2S → 2x
  if (/\bA2S\b/i.test(s)) return 2;
  return 1;
};

/**
 * Schätzt den zulässigen Zerstreuungskreis (Circle of Confusion, CoC) in mm
 * Skaliert von Vollformat (~43.3mm Diagonale) mit Basiswert 0.03mm
 * @param {number} sensorWidth - Sensorbreite in mm
 * @param {number} sensorHeight - Sensorhöhe in mm
 * @returns {number|null} - CoC in mm
 */
export const calculateCircleOfConfusion = (sensorWidth, sensorHeight) => {
  if (!sensorWidth || !sensorHeight || sensorWidth <= 0 || sensorHeight <= 0) return null;
  const fullFrameDiagonal = Math.sqrt(36*36 + 24*24); // ~43.3mm
  const sensorDiagonal = Math.sqrt(sensorWidth*sensorWidth + sensorHeight*sensorHeight);
  const baseCoC = 0.03; // Vollformat-Norm
  const coc = baseCoC * (sensorDiagonal / fullFrameDiagonal);
  // optional klammern für vernünftige Grenzen
  return Math.round(Math.max(0.01, Math.min(0.06, coc)) * 1000) / 1000; // auf 0.001mm runden
};

/**
 * Berechnet die hyperfokale Distanz (Meter)
 * H = f^2 / (N * c) + f, mit f und c in mm
 * @param {number} focalLengthMm - Brennweite in mm
 * @param {number} aperture - Blendenzahl (f/N)
 * @param {number} cocMm - Zerstreuungskreis in mm
 * @returns {number|null} - Hyperfokale Distanz in Metern
 */
export const calculateHyperfocal = (focalLengthMm, aperture, cocMm) => {
  if (!focalLengthMm || !aperture || !cocMm || focalLengthMm <= 0 || aperture <= 0 || cocMm <= 0) return null;
  const f = focalLengthMm;
  const N = aperture;
  const c = cocMm;
  const H_mm = (f * f) / (N * c) + f; // in mm
  return Math.round((H_mm / 1000) * 1000) / 1000; // Meter, auf 0.001 runden
};

/**
 * Berechnet Nah-/Fernpunkt und Schärfentiefe (Meter) für gegebene Fokus-Distanz
 * @param {number} focalLengthMm - Brennweite in mm
 * @param {number} aperture - Blendenzahl (f/N)
 * @param {number} cocMm - Zerstreuungskreis in mm
 * @param {number} focusDistanceM - Fokus-Distanz in Metern
 * @returns {{near:number, far:number|null, total:number}|null}
 */
export const calculateDOF = (focalLengthMm, aperture, cocMm, focusDistanceM) => {
  if (!focalLengthMm || !aperture || !cocMm || !focusDistanceM || focalLengthMm <= 0 || aperture <= 0 || cocMm <= 0 || focusDistanceM <= 0) return null;
  const f = focalLengthMm; // mm
  const s = focusDistanceM * 1000; // mm
  const N = aperture;
  const c = cocMm;
  const H = (f * f) / (N * c) + f; // mm
  const denomNear = H + (s - f);
  const denomFar = H - (s - f);
  const sNear_mm = (H * s) / denomNear; // mm
  let sFar_mm;
  let farM = null;
  if (denomFar > 0) {
    sFar_mm = (H * s) / denomFar;
    farM = sFar_mm / 1000;
  } else {
    // Fernpunkt liegt hinter Unendlich
    farM = null; // null kennzeichnet "∞"
  }
  const nearM = sNear_mm / 1000;
  const totalM = farM != null ? Math.max(0, farM - nearM) : Infinity;
  return {
    near: Math.round(nearM * 1000) / 1000,
    far: farM != null ? Math.round(farM * 1000) / 1000 : null,
    total: farM != null ? Math.round(totalM * 1000) / 1000 : Infinity,
  };
};

/**
 * Berechnet alle FOV-Werte basierend auf den Kamera- und Objektiveinstellungen
 * @param {object} cameraSettings - Die Kameraeinstellungen
 * @param {object} lensSettings - Die Objektiveinstellungen
 * @returns {object} - Berechnete FOV-Werte
 */
export const calculateAllFOV = (cameraSettings, lensSettings) => {
  if (!cameraSettings || !lensSettings) return null;
  
  const { manufacturer, model, format } = cameraSettings;
  const { lensName, focalLength: manualFocalLength } = lensSettings;
  
  // Prüfe, ob alle notwendigen Daten vorhanden sind
  if (!manufacturer || !model || !format) return null;
  
  // Sensorgröße aus der Datenbank abrufen (als String, z. B. "36 x 24 mm")
  const sensorSizeStr = getSensorSizeByFormat(manufacturer, model, format);
  
  // Falls kein Eintrag vorhanden ist, abbrechen (Aufrufer formatiert "Nicht verfügbar")
  if (!sensorSizeStr) return null;
  
  // Sensorgröße parsen
  const sensor = parseSensorSize(sensorSizeStr);
  if (!sensor) return null;
  
  // Brennweite bestimmen (entweder manuell eingegeben oder aus dem Objektivnamen extrahiert)
  const focalLength = manualFocalLength || extractFocalLength(lensName);
  if (!focalLength) return null;
  
  // FOV-Werte berechnen
  const horizontalFOV = calculateHorizontalFOV(focalLength, sensor.width);
  const verticalFOV = calculateVerticalFOV(focalLength, sensor.height);
  const diagonalFOV = calculateDiagonalFOV(focalLength, sensor.width, sensor.height);
  
  return {
    horizontal: horizontalFOV,
    vertical: verticalFOV,
    diagonal: diagonalFOV
  };
};

/**
 * Formatiert FOV-Werte für die Anzeige
 * @param {object} fovData - FOV-Daten von calculateAllFOV
 * @returns {string} - Formatierter FOV-String
 */
export const formatFOVDisplay = (fovData) => {
  if (!fovData || !fovData.horizontal || !fovData.vertical) {
    return 'Nicht verfügbar';
  }
  
  return `${fovData.horizontal}° × ${fovData.vertical}° (${fovData.diagonal}° diagonal)`;
};

export const extractLensManufacturer = (lensStr, fallbackManufacturer = '') => {
  const s = typeof lensStr === 'string' ? lensStr.trim() : '';
  if (!s) return fallbackManufacturer || '';
  // Spezialfall: DJI X7
  if (/^X7\b/i.test(s) && fallbackManufacturer === 'DJI') return 'DJI';

  let known = [];
  try { known = getLensManufacturers() || []; } catch {}
  const aliases = {
    'angenieux': 'Angénieux',
    'angénieux': 'Angénieux',
    'voigtlander': 'Voigtländer',
    'voigtländer': 'Voigtländer',
  };

  const lc = s.toLowerCase();

  // Falls Name mit Zahl beginnt, steht der Hersteller vermutlich nicht vorne
  if (/^\d|^mm\b/i.test(s)) {
    for (const k of known) {
      if (lc.includes(k.toLowerCase())) return k;
    }
    for (const [alias, canon] of Object.entries(aliases)) {
      if (lc.includes(alias)) return canon;
    }
    return fallbackManufacturer || '';
  }

  // Erstes Wort als Kandidat prüfen
  const firstWord = s.split(/\s+/)[0];
  const fwLc = firstWord.toLowerCase();
  if (aliases[fwLc]) return aliases[fwLc];
  for (const k of known) {
    if (fwLc === k.toLowerCase()) return k;
  }
  // Hersteller irgendwo im Namen
  for (const k of known) {
    if (lc.includes(k.toLowerCase())) return k;
  }
  for (const [alias, canon] of Object.entries(aliases)) {
    if (lc.includes(alias)) return canon;
  }
  return fallbackManufacturer || '';
};