import { jsPDF } from 'jspdf';

/**
 * Exportiert einen einzelnen Shot als PDF
 * @param {Object} shot - Das Shot-Objekt, das exportiert werden soll
 * @param {Object} project - Das Projekt-Objekt, zu dem der Shot gehört
 * @returns {jsPDF} - Das PDF-Dokument
 */
export const exportShotToPDF = (shot, project) => {
  const doc = new jsPDF();
  
  // Titel und Projekt-Informationen
  doc.setFontSize(20);
  doc.text(`Shot: ${shot.name}`, 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Projekt: ${project.name}`, 20, 30);
  doc.text(`Datum: ${new Date().toLocaleDateString()}`, 20, 40);
  
  // Thumbnail rechts oben (falls vorhanden)
  try {
    if (shot.previewImage) {
      const fmt = imageFormatForDataUrl(shot.previewImage);
      doc.addImage(shot.previewImage, fmt, 140, 15, 50, 31);
    }
  } catch (e) {}

  // Shot-Details
  doc.setFontSize(16);
  doc.text('Shot-Details', 20, 55);
  
  doc.setFontSize(10);
  let yPos = 65;
  
  // Allgemeine Shot-Informationen
  doc.text(`Status: ${shot.status || 'Nicht definiert'}`, 20, yPos); yPos += 7;
  doc.text(`Beschreibung: ${shot.description || 'Keine Beschreibung'}`, 20, yPos); yPos += 7;
  doc.text(`Erstellt am: ${shot.dateCreated || 'Nicht definiert'}`, 20, yPos); yPos += 7;
  doc.text(`Zuletzt aktualisiert: ${shot.lastUpdated || 'Nicht definiert'}`, 20, yPos); yPos += 7;
  
  // Kamera-Einstellungen
  if (shot.cameraSettings) {
    doc.setFontSize(14);
    doc.text('Kamera-Einstellungen', 20, yPos); yPos += 10;
    doc.setFontSize(10);
    
    // Kamera-Hersteller und Modell
    doc.text(`Hersteller: ${shot.cameraSettings.manufacturer || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    doc.text(`Modell: ${shot.cameraSettings.model || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    doc.text(`Kamera: ${shot.cameraSettings.camera || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    
    // Kameraformat mit Pixelgrößen und Sensorgröße
    if (shot.cameraSettings.format) {
      doc.text(`Format: ${shot.cameraSettings.format || 'Nicht definiert'}`, 20, yPos); yPos += 7;
      
      if (shot.cameraSettings.resolution) {
        doc.text(`Auflösung: ${shot.cameraSettings.resolution || 'Nicht definiert'}`, 20, yPos); yPos += 7;
      }
      
      if (shot.cameraSettings.sensorSize) {
        doc.text(`Sensorgröße: ${shot.cameraSettings.sensorSize || 'Nicht definiert'}`, 20, yPos); yPos += 7;
      }
    }
    
    // Codec und Farbräume
    doc.text(`Codec: ${shot.cameraSettings.codec || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    doc.text(`Farbraum: ${shot.cameraSettings.colorSpace || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    
    // Framerate und Shutter
    doc.text(`Framerate: ${shot.cameraSettings.framerate || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    doc.text(`Shutter-Winkel: ${shot.cameraSettings.shutterAngle || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    
    // Bildstabilisierung
    doc.text(`Bildstabilisierung: ${shot.cameraSettings.imageStabilization || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    
    // Objektiv-Informationen
    doc.text(`Objektiv-Hersteller: ${shot.cameraSettings.lensManufacturer || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    doc.text(`Objektiv: ${shot.cameraSettings.lens || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    doc.text(`Brennweite: ${shot.cameraSettings.focalLength || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    doc.text(`Blende: ${shot.cameraSettings.aperture || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    doc.text(`Fokus-Distanz: ${shot.cameraSettings.focusDistance || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    
    // Belichtung
    doc.text(`ISO: ${shot.cameraSettings.iso || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    doc.text(`Verschlusszeit: ${shot.cameraSettings.shutterSpeed || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    doc.text(`Weißabgleich: ${shot.cameraSettings.whiteBalance || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    
    if (shot.cameraSettings.whiteBalance === 'Manuell' && shot.cameraSettings.manualWhiteBalance) {
      doc.text(`Manueller Weißabgleich: ${shot.cameraSettings.manualWhiteBalance}K`, 20, yPos); yPos += 7;
    }
    
    // Filter
    doc.text(`Filter: ${shot.cameraSettings.filter || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    
    // Sichtfeld (FOV)
    if (shot.cameraSettings.fov) {
      doc.text(`Sichtfeld (FOV): ${shot.cameraSettings.fov || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    }
  }
  
  // Kamerabewegung
  if (shot.cameraMovement) {
    doc.setFontSize(14);
    doc.text('Kamerabewegung', 20, yPos); yPos += 10;
    doc.setFontSize(10);
    
    doc.text(`Bewegungstyp: ${shot.cameraMovement.movementType || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    doc.text(`Equipment: ${shot.cameraMovement.equipment || 'Nicht definiert'}`, 20, yPos); yPos += 7;
    
    if (shot.cameraMovement.description) {
      doc.text(`Beschreibung: ${shot.cameraMovement.description}`, 20, yPos); yPos += 7;
    }
  }
  
  // VFX-Aufgaben
  if (shot.vfxPreparations) {
    doc.setFontSize(14);
    doc.text('VFX-Aufgaben', 20, yPos); yPos += 10;
    doc.setFontSize(10);
    
    if (shot.vfxPreparations.trackingMarkers) {
      doc.text('Tracking-Marker: Ja', 20, yPos); yPos += 7;
    }
    
    if (shot.vfxPreparations.greenscreen) {
      doc.text('Greenscreen: Ja', 20, yPos); yPos += 7;
    }
    
    if (shot.vfxPreparations.lightingReference) {
      doc.text('Beleuchtungsreferenz: Ja', 20, yPos); yPos += 7;
    }
    
    if (shot.vfxPreparations.scaleReference) {
      doc.text('Größenreferenz: Ja', 20, yPos); yPos += 7;
    }
    
    if (shot.vfxPreparations.notes) {
      doc.text(`VFX-Notizen: ${shot.vfxPreparations.notes}`, 20, yPos); yPos += 7;
    }
  }
  
  // Notizen
  if (shot.notes && shot.notes.length > 0) {
    doc.setFontSize(14);
    doc.text('Notizen', 20, yPos); yPos += 10;
    doc.setFontSize(10);
    
    shot.notes.forEach(note => {
      doc.text(`- ${note.text}`, 20, yPos); yPos += 7;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
  }
  
  return doc;
};

/**
 * Exportiert ein komplettes Projekt mit allen Shots als PDF
 * @param {Object} project - Das Projekt-Objekt, das exportiert werden soll
 * @param {Array} shots - Die Shots des Projekts
 * @returns {jsPDF} - Das PDF-Dokument
 */
export const exportProjectToPDF = (project, shots) => {
  const doc = new jsPDF();

  // Titel- und Projekt-Übersichtsseite
  doc.setFontSize(20);
  doc.text(`Projekt: ${project.name}`, 20, 20);

  doc.setFontSize(12);
  doc.text(`Datum: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.text(`Anzahl Shots: ${shots.length}`, 20, 40);

  if (project.description) {
    doc.text(`Beschreibung: ${project.description}`, 20, 50);
  }

  // Shot-Übersicht
  doc.setFontSize(16);
  doc.text('Shot-Übersicht', 20, 65);
  let yPos = 75;

  shots.forEach((shot, index) => {
    if (yPos > 250) { doc.addPage(); yPos = 20; }

    doc.setFontSize(14);
    doc.text(`Shot ${index + 1}: ${shot.name}`, 20, yPos); yPos += 10;

    // Thumbnail in Übersicht (rechts)
    try {
      if (shot.previewImage) {
        const fmt = imageFormatForDataUrl(shot.previewImage);
        doc.addImage(shot.previewImage, fmt, 160, yPos - 12, 30, 18);
      }
    } catch (e) {}

    doc.setFontSize(10);
    doc.text(`Status: ${shot.status || 'Nicht definiert'}`, 30, yPos); yPos += 7;
    doc.text(`Beschreibung: ${shot.description || 'Keine Beschreibung'}`, 30, yPos); yPos += 7;

    if (shot.cameraSettings) {
      doc.text(`Kamera: ${shot.cameraSettings.camera || 'Nicht definiert'}`, 30, yPos); yPos += 7;
      if (shot.cameraSettings.format) {
        doc.text(`Format: ${shot.cameraSettings.format || 'Nicht definiert'}`, 30, yPos); yPos += 7;
      }
      doc.text(`Objektiv: ${shot.cameraSettings.lens || 'Nicht definiert'}`, 30, yPos); yPos += 7;
      doc.text(`Brennweite: ${shot.cameraSettings.focalLength || 'Nicht definiert'}`, 30, yPos); yPos += 7;
    }

    yPos += 5;
  });

  // Detailseiten je Shot (Nicht-Bearbeiten-Ansicht)
  shots.forEach((shot) => {
    doc.addPage();

    // Kopfbereich
    doc.setFontSize(20);
    doc.text(`Shot: ${shot.name}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Projekt: ${project.name}`, 20, 30);
    doc.text(`Datum: ${new Date().toLocaleDateString()}`, 20, 40);

    // Thumbnail rechts oben (falls vorhanden)
    try {
      if (shot.previewImage) {
        const fmt = imageFormatForDataUrl(shot.previewImage);
        doc.addImage(shot.previewImage, fmt, 140, 15, 50, 31);
      }
    } catch (e) {}

    // Basis-Shot-Infos
    doc.setFontSize(16);
    doc.text('Shot-Details', 20, 55);
    doc.setFontSize(10);
    let y = 65;

    const addLine = (text) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(text, 20, y); y += 7;
    };

    addLine(`Status: ${shot.status || 'Nicht definiert'}`);
    addLine(`Beschreibung: ${shot.description || 'Keine Beschreibung'}`);
    if (shot.dateCreated) addLine(`Erstellt am: ${shot.dateCreated}`);
    if (shot.lastUpdated) addLine(`Zuletzt aktualisiert: ${shot.lastUpdated}`);

    // Kamera-Einstellungen (robust, nur vorhandene Felder)
    if (shot.cameraSettings) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text('Kamera-Einstellungen', 20, y); y += 10; doc.setFontSize(10);

      const cs = shot.cameraSettings;
      addLine(`Hersteller: ${cs.manufacturer || 'Nicht definiert'}`);
      addLine(`Modell: ${cs.model || 'Nicht definiert'}`);
      addLine(`Kamera: ${cs.camera || 'Nicht definiert'}`);
      if (cs.format) addLine(`Format: ${cs.format}`);
      if (cs.resolution) addLine(`Auflösung: ${cs.resolution}`);
      if (cs.sensorSize) addLine(`Sensorgröße: ${cs.sensorSize}`);
      addLine(`Codec: ${cs.codec || 'Nicht definiert'}`);
      addLine(`Farbraum: ${cs.colorSpace || 'Nicht definiert'}`);
      addLine(`Framerate: ${cs.framerate || 'Nicht definiert'}`);
      addLine(`Shutter-Winkel: ${cs.shutterAngle || 'Nicht definiert'}`);
      addLine(`Bildstabilisierung: ${cs.imageStabilization || 'Nicht definiert'}`);
      addLine(`Objektiv-Hersteller: ${cs.lensManufacturer || 'Nicht definiert'}`);
      addLine(`Objektiv: ${cs.lens || 'Nicht definiert'}`);
      addLine(`Brennweite: ${cs.focalLength || 'Nicht definiert'}`);
      addLine(`Blende: ${cs.aperture || 'Nicht definiert'}`);
      addLine(`Fokus-Distanz: ${cs.focusDistance || 'Nicht definiert'}`);
      addLine(`ISO: ${cs.iso || 'Nicht definiert'}`);
      addLine(`Verschlusszeit: ${cs.shutterSpeed || 'Nicht definiert'}`);
      addLine(`Weißabgleich: ${cs.whiteBalance || 'Nicht definiert'}`);
      if (cs.whiteBalance === 'Manuell' && cs.manualWhiteBalance) addLine(`Manueller Weißabgleich: ${cs.manualWhiteBalance}K`);
      addLine(`Filter: ${cs.filter || 'Nicht definiert'}`);
      if (cs.fov) addLine(`Sichtfeld (FOV): ${cs.fov}`);
    }

    // Kamerabewegung
    if (shot.cameraMovement) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text('Kamerabewegung', 20, y); y += 10; doc.setFontSize(10);
      const cm = shot.cameraMovement;
      addLine(`Bewegungstyp: ${cm.movementType || 'Nicht definiert'}`);
      addLine(`Equipment: ${cm.equipment || 'Nicht definiert'}`);
      if (cm.description) addLine(`Beschreibung: ${cm.description}`);
    }

    // VFX-Aufgaben (Flags)
    if (shot.vfxPreparations) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text('VFX-Aufgaben', 20, y); y += 10; doc.setFontSize(10);
      const vfx = shot.vfxPreparations || {};
      if (vfx.trackingMarkers) addLine('Tracking-Marker: Ja');
      if (vfx.greenscreen) addLine('Greenscreen: Ja');
      if (vfx.lightingReference) addLine('Beleuchtungsreferenz: Ja');
      if (vfx.scaleReference) addLine('Größenreferenz: Ja');
      if (vfx.cleanplates) addLine('Cleanplates: Ja');
      if (vfx.hdris) addLine('HDRIs: Ja');
      if (vfx.setReferences) addLine('Set-Referenzen: Ja');
      if (vfx.chromeBall) addLine('Chrome Ball: Ja');
      if (vfx.grayBall) addLine('Gray Ball: Ja');
      if (vfx.colorChecker) addLine('Color Checker: Ja');
      if (vfx.distortionGrids) addLine('Distortion Grids: Ja');
      if (vfx.measurementsTaken) addLine('Messungen vorgenommen: Ja');
      if (vfx.threeDScans) addLine('3D-Scans: Ja');
      if (vfx.notes) addLine(`VFX-Notizen: ${vfx.notes}`);

      // VFX-Details (falls vorhanden)
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text('VFX-Details', 20, y); y += 10; doc.setFontSize(10);

      const addDetailBlock = (title, lines = []) => {
        if (!lines.length) return;
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(12);
        doc.text(title, 20, y); y += 8; doc.setFontSize(10);
        lines.forEach((ln) => addLine(ln));
      };

      const dgd = vfx.distortionGridsDetails || {};
      addDetailBlock('Distortion Grids', [
        dgd.patternType && `Muster: ${dgd.patternType}`,
        dgd.distances && `Distanzen: ${dgd.distances}`,
        dgd.focalLengths && `Brennweiten: ${dgd.focalLengths}`,
        dgd.coverage && `Coverage: ${dgd.coverage}`,
        dgd.anamorphicSqueeze && `Squeeze: ${dgd.anamorphicSqueeze}`,
        dgd.date && `Datum: ${dgd.date}`,
        dgd.notes && `Notizen: ${dgd.notes}`,
      ].filter(Boolean));

      const hd = vfx.hdrisDetails || {};
      addDetailBlock('HDRIs', [ hd.notes && `Notizen: ${hd.notes}` ].filter(Boolean));

      const sr = vfx.setReferencesDetails || {};
      addDetailBlock('Set-Referenzen', [ sr.notes && `Notizen: ${sr.notes}` ].filter(Boolean));

      const cp = vfx.cleanplatesDetails || {};
      addDetailBlock('Cleanplates', [ cp.notes && `Notizen: ${cp.notes}` ].filter(Boolean));

      const cb = vfx.chromeBallDetails || {};
      addDetailBlock('Chrome Ball', [
        cb.size && `Größe: ${cb.size}`,
        cb.notes && `Notizen: ${cb.notes}`,
      ].filter(Boolean));

      const gb = vfx.grayBallDetails || {};
      addDetailBlock('Gray Ball', [
        gb.size && `Größe: ${gb.size}`,
        gb.notes && `Notizen: ${gb.notes}`,
      ].filter(Boolean));

      const cc = vfx.colorCheckerDetails || {};
      addDetailBlock('Color Checker', [
        cc.wb && `Weißabgleich: ${cc.wb}`,
        cc.notes && `Notizen: ${cc.notes}`,
      ].filter(Boolean));

      const md = vfx.measurementsDetails || {};
      addDetailBlock('Messungen', [ md.notes && `Notizen: ${md.notes}` ].filter(Boolean));

      const td = vfx.threeDScansDetails || {};
      addDetailBlock('3D-Scans', [
        td.notes && `Notizen: ${td.notes}`,
        Array.isArray(td.formats) && td.formats.length && `Formate: ${td.formats.join(', ')}`,
      ].filter(Boolean));
    }

    // Notizen (robust für String/Array)
    if (shot.notes) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text('Notizen', 20, y); y += 10; doc.setFontSize(10);
      if (Array.isArray(shot.notes)) {
        shot.notes.forEach(note => {
          const text = typeof note === 'string' ? note : (note?.text || '');
          if (text) addLine(`- ${text}`);
        });
      } else if (typeof shot.notes === 'string') {
        addLine(shot.notes);
      }
    }

    // Referenzen (Übersicht mit Zählung nach Kategorien)
    if (Array.isArray(shot.references) && shot.references.length) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text('Referenzen (Anzahl je Kategorie)', 20, y); y += 10; doc.setFontSize(10);
      const byCat = {};
      shot.references.forEach((r) => { byCat[r.category] = (byCat[r.category] || 0) + 1; });
      Object.entries(byCat).forEach(([cat, count]) => addLine(`${cat}: ${count}`));
    }
  });

  return doc;
};

/**
 * Speichert ein PDF-Dokument mit dem angegebenen Dateinamen
 * @param {jsPDF} doc - Das PDF-Dokument
 * @param {string} filename - Der Dateiname für das PDF
 */
export const savePDF = (doc, filename) => {
  doc.save(filename);
};

// Hilfsfunktionen für Bild‑Thumbnails in PDFs
const isSvgDataUrl = (url) => !!url && url.startsWith('data:image/svg+xml');

const svgToPngDataUrl = (svgDataUrl, width = 240, height = 160) => new Promise((resolve, reject) => {
  try {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (e) => reject(e);
    img.src = svgDataUrl;
  } catch (e) {
    reject(e);
  }
});

const ensureImageDataUrl = async (dataUrl, width = 240, height = 160) => {
  if (!dataUrl) return null;
  if (isSvgDataUrl(dataUrl)) {
    try {
      return await svgToPngDataUrl(dataUrl, width, height);
    } catch {
      return null;
    }
  }
  return dataUrl; // PNG/JPEG bereits nutzbar
};

const imageFormatForDataUrl = (dataUrl) => {
  if (!dataUrl) return 'PNG';
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'JPEG';
  // Fallback auf PNG
  return 'PNG';
};

const truncate = (s, n = 24) => {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
};