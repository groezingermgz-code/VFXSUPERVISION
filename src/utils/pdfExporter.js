import jsPDF from 'jspdf';

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
  
  // Titel und Projekt-Informationen
  doc.setFontSize(20);
  doc.text(`Projekt: ${project.name}`, 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Datum: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.text(`Anzahl Shots: ${shots.length}`, 20, 40);
  
  // Projekt-Beschreibung
  if (project.description) {
    doc.text(`Beschreibung: ${project.description}`, 20, 50);
  }
  
  // Shot-Liste
  doc.setFontSize(16);
  doc.text('Shot-Liste', 20, 65);
  
  let yPos = 75;
  
  // Shots auflisten
  shots.forEach((shot, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text(`Shot ${index + 1}: ${shot.name}`, 20, yPos); yPos += 10;
    
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
    
    yPos += 5; // Abstand zum nächsten Shot
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