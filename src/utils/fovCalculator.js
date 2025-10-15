// Field of View (FOV) Berechnungsutilities

/**
 * Extrahiert die Brennweite aus einem Objektivnamen
 * @param {string} lensName - Der vollständige Objektivname
 * @returns {number|null} - Die Brennweite in mm oder null wenn nicht gefunden
 */
export const extractFocalLength = (lensName) => {
  if (!lensName) return null;
  
  // Regex für verschiedene Brennweiten-Formate
  const patterns = [
    /(\d+)mm/i,           // z.B. "50mm"
    /(\d+)-\d+mm/i,       // z.B. "24-70mm" (nimmt die erste Zahl)
    /(\d+)\.?\d*mm/i      // z.B. "85.5mm"
  ];
  
  for (const pattern of patterns) {
    const match = lensName.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  
  return null;
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
  
  // Import der getCameraInfoByFormat Funktion
  const { getCameraInfoByFormat } = require('../data/cameraDatabase');
  
  // Sensorgröße aus der Datenbank abrufen
  const cameraInfo = getCameraInfoByFormat(manufacturer, model, format);
  if (!cameraInfo || !cameraInfo.sensorSize) return null;
  
  // Sensorgröße parsen
  const sensor = parseSensorSize(cameraInfo.sensorSize);
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