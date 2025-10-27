import { jsPDF } from 'jspdf';
import { translate } from '../contexts/LanguageContext';

/**
 * Exportiert einen einzelnen Shot als PDF
 * @param {Object} shot - Das Shot-Objekt, das exportiert werden soll
 * @param {Object} project - Das Projekt-Objekt, zu dem der Shot gehört
 * @returns {jsPDF} - Das PDF-Dokument
 */
export const exportShotToPDF = (shot, project) => {
  const doc = new jsPDF();
  const t = (key, fallback) => translate(key, fallback);
  const NA = t('common.notAvailable', 'Nicht angegeben');
  const EMPTY_DESC = t('pdf.emptyDescription', 'Keine Beschreibung');
  
  // Titel und Projekt-Informationen
  doc.setFontSize(20);
  doc.text(`${t('shot.singular', 'Shot')}: ${shot.name}`, 20, 20);
  
  doc.setFontSize(12);
  doc.text(`${t('dashboard.projectDetails', 'Projekt')}: ${project.name}`, 20, 30);
  doc.text(`${t('common.date', 'Datum')}: ${new Date().toLocaleDateString()}`, 20, 40);
  
  // Thumbnail rechts oben (falls vorhanden)
  try {
    if (shot.previewImage) {
      const fmt = imageFormatForDataUrl(shot.previewImage);
      doc.addImage(shot.previewImage, fmt, 140, 15, 50, 31);
    }
  } catch (e) {}

  // Shot-Details
  doc.setFontSize(16);
  doc.text(t('pdf.title.shotDetails', 'Shot-Details'), 20, 55);
  
  doc.setFontSize(10);
  let yPos = 65;
  
  // Allgemeine Shot-Informationen
  doc.text(`${t('pdf.label.status', 'Status')}: ${shot.status || NA}`, 20, yPos); yPos += 7;
  doc.text(`${t('common.description', 'Beschreibung')}: ${shot.description || EMPTY_DESC}`, 20, yPos); yPos += 7;
  doc.text(`${t('pdf.label.createdAt', 'Erstellt am')}: ${shot.dateCreated || NA}`, 20, yPos); yPos += 7;
  doc.text(`${t('pdf.label.lastUpdated', 'Zuletzt aktualisiert')}: ${shot.lastUpdated || NA}`, 20, yPos); yPos += 7;
  
  // Kamera-Einstellungen
  if (shot.cameraSettings) {
    doc.setFontSize(14);
    doc.text(t('section.cameraSettings', 'Kamera-Einstellungen'), 20, yPos); yPos += 10;
    doc.setFontSize(10);
    
    // Kamera-Hersteller und Modell
    doc.text(`${t('camera.manufacturer', 'Hersteller')}: ${shot.cameraSettings.manufacturer || NA}`, 20, yPos); yPos += 7;
    doc.text(`${t('camera.model', 'Modell')}: ${shot.cameraSettings.model || NA}`, 20, yPos); yPos += 7;
    doc.text(`${t('camera.model', 'Kamera')}: ${shot.cameraSettings.camera || NA}`, 20, yPos); yPos += 7;
    
    // Kameraformat mit Pixelgrößen und Sensorgröße
    if (shot.cameraSettings.format) {
      doc.text(`${t('camera.format', 'Format')}: ${shot.cameraSettings.format || NA}`, 20, yPos); yPos += 7;
      
      if (shot.cameraSettings.resolution) {
        doc.text(`${t('camera.resolution', 'Auflösung')}: ${shot.cameraSettings.resolution || NA}`, 20, yPos); yPos += 7;
      }
      
      if (shot.cameraSettings.sensorSize) {
        doc.text(`${t('tools.fov.controls.sensorSize', 'Sensorgröße')}: ${shot.cameraSettings.sensorSize || NA}`, 20, yPos); yPos += 7;
      }
    }
    
    // Codec und Farbräume
    doc.text(`${t('camera.codec', 'Codec')}: ${shot.cameraSettings.codec || NA}`, 20, yPos); yPos += 7;
    doc.text(`${t('camera.colorSpace', 'Farbraum')}: ${shot.cameraSettings.colorSpace || NA}`, 20, yPos); yPos += 7;
    
    // Framerate und Shutter
    doc.text(`${t('camera.framerate', 'Framerate')}: ${shot.cameraSettings.framerate || NA}`, 20, yPos); yPos += 7;
    doc.text(`${t('camera.shutterAngle', 'Shutter-Winkel')}: ${shot.cameraSettings.shutterAngle || NA}`, 20, yPos); yPos += 7;
    
    // Bildstabilisierung
    doc.text(`${t('camera.imageStabilization', 'Bildstabilisierung')}: ${shot.cameraSettings.imageStabilization || NA}`, 20, yPos); yPos += 7;
    
    // Objektiv-Informationen
    doc.text(`${t('lens.manufacturer', 'Objektiv-Hersteller')}: ${shot.cameraSettings.lensManufacturer || NA}`, 20, yPos); yPos += 7;
    doc.text(`${t('lens.lens', 'Objektiv')}: ${shot.cameraSettings.lens || NA}`, 20, yPos); yPos += 7;
    doc.text(`${t('lens.focalLength', 'Brennweite')}: ${shot.cameraSettings.focalLength || NA}`, 20, yPos); yPos += 7;
    doc.text(`${t('lens.aperture', 'Blende')}: ${shot.cameraSettings.aperture || NA}`, 20, yPos); yPos += 7;
    doc.text(`${t('lens.focusDistance', 'Fokus-Distanz')}: ${shot.cameraSettings.focusDistance || NA}`, 20, yPos); yPos += 7;
    
    // Belichtung
    doc.text(`ISO: ${shot.cameraSettings.iso || NA}`, 20, yPos); yPos += 7;
    doc.text(`${t('camera.shutter', 'Verschlusszeit')}: ${shot.cameraSettings.shutterSpeed || NA}`, 20, yPos); yPos += 7;
    doc.text(`${t('camera.wb', 'Weißabgleich')}: ${shot.cameraSettings.whiteBalance || NA}`, 20, yPos); yPos += 7;
    
    if (shot.cameraSettings.whiteBalance === 'Manuell' && shot.cameraSettings.manualWhiteBalance) {
      doc.text(`${t('common.manual', 'Manuell')} ${t('camera.wb', 'Weißabgleich')}: ${shot.cameraSettings.manualWhiteBalance}K`, 20, yPos); yPos += 7;
    }
    
    // Filter
    doc.text(`${t('lens.filter', 'Filter')}: ${shot.cameraSettings.filter || NA}`, 20, yPos); yPos += 7;
    
    // Sichtfeld (FOV)
    if (shot.cameraSettings.fov) {
      doc.text(`${t('tools.fov.header', 'Sichtfeld (FOV)')}: ${shot.cameraSettings.fov || NA}`, 20, yPos); yPos += 7;
    }
  }
  
  // Kamerabewegung
  if (shot.cameraMovement) {
    doc.setFontSize(14);
    doc.text(t('section.cameraMovement', 'Kamerabewegung'), 20, yPos); yPos += 10;
    doc.setFontSize(10);
    
    doc.text(`${t('movement.type', 'Bewegungstyp')}: ${shot.cameraMovement.movementType || NA}`, 20, yPos); yPos += 7;
    doc.text(`${t('movement.mount', 'Equipment')}: ${shot.cameraMovement.equipment || NA}`, 20, yPos); yPos += 7;
    
    if (shot.cameraMovement.description) {
      doc.text(`${t('common.description', 'Beschreibung')}: ${shot.cameraMovement.description}`, 20, yPos); yPos += 7;
    }
  }
  
  // VFX-Aufgaben
  if (shot.vfxPreparations) {
    doc.setFontSize(14);
    doc.text(t('section.vfxTasks', 'VFX-Aufgaben'), 20, yPos); yPos += 10;
    doc.setFontSize(10);
    
    if (shot.vfxPreparations.trackingMarkers) {
      doc.text(t('vfx.checklist.measurementsTaken', 'Tracking-Marker: Ja'), 20, yPos); yPos += 7;
    }
    
    if (shot.vfxPreparations.greenscreen) {
      doc.text(t('vfx.checklist.cleanplates', 'Greenscreen: Ja'), 20, yPos); yPos += 7;
    }
    
    if (shot.vfxPreparations.lightingReference) {
      doc.text(t('vfx.checklist.setReferences', 'Beleuchtungsreferenz: Ja'), 20, yPos); yPos += 7;
    }
    
    if (shot.vfxPreparations.scaleReference) {
      doc.text(t('vfx.checklist.measurementsTaken', 'Größenreferenz: Ja'), 20, yPos); yPos += 7;
    }
    
    if (shot.vfxPreparations.notes) {
      doc.text(`${t('vfx.supervisor', 'VFX-Notizen')}: ${shot.vfxPreparations.notes}`, 20, yPos); yPos += 7;
    }
  }
  
  // Notizen
  if (shot.notes && shot.notes.length > 0) {
    doc.setFontSize(14);
    doc.text(t('common.notes', 'Notizen'), 20, yPos); yPos += 10;
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
  const t = (key, fallback) => translate(key, fallback);
  const NA = t('common.notAvailable', 'Nicht angegeben');
  const EMPTY_DESC = t('pdf.emptyDescription', 'Keine Beschreibung');

  // Titel- und Projekt-Übersichtsseite
  doc.setFontSize(20);
  doc.text(`${t('dashboard.projectDetails', 'Projekt')}: ${project.name}`, 20, 20);

  doc.setFontSize(12);
  doc.text(`${t('common.date', 'Datum')}: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.text(`${t('pdf.label.shotCount', 'Anzahl Shots')}: ${shots.length}`, 20, 40);

  if (project.description) {
    doc.text(`${t('common.description', 'Beschreibung')}: ${project.description}`, 20, 50);
  }

  // Shot-Übersicht
  doc.setFontSize(16);
  doc.text(t('pdf.title.shotOverview', 'Shot-Übersicht'), 20, 65);
  let yPos = 75;

  shots.forEach((shot, index) => {
    if (yPos > 250) { doc.addPage(); yPos = 20; }

    doc.setFontSize(14);
    doc.text(`${t('shot.singular', 'Shot')} ${index + 1}: ${shot.name}`, 20, yPos); yPos += 10;

    // Thumbnail in Übersicht (rechts)
    try {
      if (shot.previewImage) {
        const fmt = imageFormatForDataUrl(shot.previewImage);
        doc.addImage(shot.previewImage, fmt, 160, yPos - 12, 30, 18);
      }
    } catch (e) {}

    doc.setFontSize(10);
    doc.text(`${t('pdf.label.status', 'Status')}: ${shot.status || NA}`, 30, yPos); yPos += 7;
    doc.text(`${t('common.description', 'Beschreibung')}: ${shot.description || EMPTY_DESC}`, 30, yPos); yPos += 7;

    if (shot.cameraSettings) {
      doc.text(`${t('camera.model', 'Kamera')}: ${shot.cameraSettings.camera || NA}`, 30, yPos); yPos += 7;
      if (shot.cameraSettings.format) {
        doc.text(`${t('camera.format', 'Format')}: ${shot.cameraSettings.format || NA}`, 30, yPos); yPos += 7;
      }
      doc.text(`${t('lens.lens', 'Objektiv')}: ${shot.cameraSettings.lens || NA}`, 30, yPos); yPos += 7;
      doc.text(`${t('lens.focalLength', 'Brennweite')}: ${shot.cameraSettings.focalLength || NA}`, 30, yPos); yPos += 7;
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
      addLine(`${t('lens.focusDistance', 'Fokus-Distanz')}: ${cs.focusDistance || NA}`);
      addLine(`${t('camera.iso', 'ISO')}: ${cs.iso || NA}`);
      addLine(`${t('camera.shutter', 'Verschlusszeit')}: ${cs.shutterSpeed || NA}`);
      addLine(`${t('camera.wb', 'Weißabgleich')}: ${cs.whiteBalance || NA}`);
      if (cs.whiteBalance === t('common.manual', 'Manuell') && cs.manualWhiteBalance) addLine(`${t('common.manual', 'Manuell')} ${t('camera.wb', 'Weißabgleich')}: ${cs.manualWhiteBalance}K`);
      addLine(`${t('lens.filter', 'Filter')}: ${cs.filter || NA}`);
      if (cs.fov) addLine(`${t('tools.fov.header', 'Sichtfeld (FOV)')}: ${cs.fov}`);
    }

    // Kamerabewegung
    if (shot.cameraMovement) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text(t('section.cameraMovement', 'Kamerabewegung'), 20, y); y += 10; doc.setFontSize(10);
      const cm = shot.cameraMovement;
      addLine(`${t('movement.type', 'Bewegungstyp')}: ${cm.movementType || NA}`);
      addLine(`${t('movement.mount', 'Equipment')}: ${cm.equipment || NA}`);
      if (cm.description) addLine(`${t('common.description', 'Beschreibung')}: ${cm.description}`);
    }

    // VFX-Aufgaben (Flags)
    if (shot.vfxPreparations) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text(t('section.vfxTasks', 'VFX-Aufgaben'), 20, y); y += 10; doc.setFontSize(10);
      const vfx = shot.vfxPreparations || {};
      if (vfx.trackingMarkers) addLine(`${t('vfx.flags.trackingMarkers', 'Tracking-Marker')}: ${t('common.yes', 'Ja')}`);
      if (vfx.greenscreen) addLine(`${t('vfx.flags.greenscreen', 'Greenscreen')}: ${t('common.yes', 'Ja')}`);
      if (vfx.lightingReference) addLine(`${t('vfx.flags.lightingReference', 'Beleuchtungsreferenz')}: ${t('common.yes', 'Ja')}`);
      if (vfx.scaleReference) addLine(`${t('vfx.flags.scaleReference', 'Größenreferenz')}: ${t('common.yes', 'Ja')}`);
      if (vfx.cleanplates) addLine(`${t('vfx.flags.cleanplates', 'Cleanplates')}: ${t('common.yes', 'Ja')}`);
      if (vfx.hdris) addLine(`${t('vfx.flags.hdris', 'HDRIs')}: ${t('common.yes', 'Ja')}`);
      if (vfx.setReferences) addLine(`${t('vfx.flags.setReferences', 'Set-Referenzen')}: ${t('common.yes', 'Ja')}`);
      if (vfx.chromeBall) addLine(`${t('vfx.flags.chromeBall', 'Chrome Ball')}: ${t('common.yes', 'Ja')}`);
      if (vfx.grayBall) addLine(`${t('vfx.flags.grayBall', 'Gray Ball')}: ${t('common.yes', 'Ja')}`);
      if (vfx.colorChecker) addLine(`${t('vfx.flags.colorChecker', 'Color Checker')}: ${t('common.yes', 'Ja')}`);
      if (vfx.distortionGrids) addLine(`${t('vfx.flags.distortionGrids', 'Distortion Grids')}: ${t('common.yes', 'Ja')}`);
      if (vfx.measurementsTaken) addLine(`${t('vfx.flags.measurementsTaken', 'Messungen vorgenommen')}: ${t('common.yes', 'Ja')}`);
      if (vfx.threeDScans) addLine(`${t('vfx.flags.threeDScans', '3D-Scans')}: ${t('common.yes', 'Ja')}`);
      if (vfx.notes) addLine(`${t('vfx.supervisor', 'VFX-Notizen')}: ${vfx.notes}`);

      // VFX-Details (falls vorhanden)
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text(t('pdf.title.vfxDetails', 'VFX-Details'), 20, y); y += 10; doc.setFontSize(10);

      const addDetailBlock = (title, lines = []) => {
        if (!lines.length) return;
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(12);
        doc.text(title, 20, y); y += 8; doc.setFontSize(10);
        lines.forEach((ln) => addLine(ln));
      };

      const dgd = vfx.distortionGridsDetails || {};
      addDetailBlock(t('vfx.details.distortionGrids', 'Distortion Grids'), [
        dgd.patternType && `${t('vfx.details.pattern', 'Muster')}: ${dgd.patternType}`,
        dgd.distances && `${t('vfx.details.distances', 'Distanzen')}: ${dgd.distances}`,
        dgd.focalLengths && `${t('lens.focalLength', 'Brennweiten')}: ${dgd.focalLengths}`,
        dgd.coverage && `${t('vfx.details.coverage', 'Coverage')}: ${dgd.coverage}`,
        dgd.anamorphicSqueeze && `${t('vfx.details.squeeze', 'Squeeze')}: ${dgd.anamorphicSqueeze}`,
        dgd.date && `${t('common.date', 'Datum')}: ${dgd.date}`,
        dgd.notes && `${t('common.notes', 'Notizen')}: ${dgd.notes}`,
      ].filter(Boolean));

      const hd = vfx.hdrisDetails || {};
      addDetailBlock(t('vfx.details.hdris', 'HDRIs'), [ hd.notes && `${t('common.notes', 'Notizen')}: ${hd.notes}` ].filter(Boolean));

      const sr = vfx.setReferencesDetails || {};
      addDetailBlock(t('vfx.details.setReferences', 'Set-Referenzen'), [ sr.notes && `${t('common.notes', 'Notizen')}: ${sr.notes}` ].filter(Boolean));

      const cp = vfx.cleanplatesDetails || {};
      addDetailBlock(t('vfx.details.cleanplates', 'Cleanplates'), [ cp.notes && `${t('common.notes', 'Notizen')}: ${cp.notes}` ].filter(Boolean));

      const cb = vfx.chromeBallDetails || {};
      addDetailBlock(t('vfx.details.chromeBall', 'Chrome Ball'), [
        cb.size && `${t('common.size', 'Größe')}: ${cb.size}`,
        cb.notes && `${t('common.notes', 'Notizen')}: ${cb.notes}`,
      ].filter(Boolean));

      const gb = vfx.grayBallDetails || {};
      addDetailBlock(t('vfx.details.grayBall', 'Gray Ball'), [
        gb.size && `${t('common.size', 'Größe')}: ${gb.size}`,
        gb.notes && `${t('common.notes', 'Notizen')}: ${gb.notes}`,
      ].filter(Boolean));

      const cc = vfx.colorCheckerDetails || {};
      addDetailBlock(t('vfx.details.colorChecker', 'Color Checker'), [
        cc.wb && `${t('camera.wb', 'Weißabgleich')}: ${cc.wb}`,
        cc.notes && `${t('common.notes', 'Notizen')}: ${cc.notes}`,
      ].filter(Boolean));

      const md = vfx.measurementsDetails || {};
      addDetailBlock(t('pdf.title.measurements', 'Messungen'), [ md.notes && `${t('common.notes', 'Notizen')}: ${md.notes}` ].filter(Boolean));

      const td = vfx.threeDScansDetails || {};
      addDetailBlock(t('pdf.title.threeDScans', '3D-Scans'), [
        td.notes && `${t('common.notes', 'Notizen')}: ${td.notes}`,
        Array.isArray(td.formats) && td.formats.length && `${t('common.formats', 'Formate')}: ${td.formats.join(', ')}`,
      ].filter(Boolean));
    }

    // Notizen (robust für String/Array)
    if (shot.notes) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.text(t('common.notes', 'Notizen'), 20, y); y += 10; doc.setFontSize(10);
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
      doc.text(t('pdf.title.referencesByCategory', 'Referenzen (Anzahl je Kategorie)'), 20, y); y += 10; doc.setFontSize(10);
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