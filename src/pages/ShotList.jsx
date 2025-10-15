import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ShotList.css';
import { exportProjectToPDF, savePDF } from '../utils/pdfExporter';
import dummyPreview from '../assets/dummy-preview.svg';
import { useLanguage } from '../contexts/LanguageContext';

// Funktion zur Extraktion der Brennweite aus dem Objektiv-Modell
const extractFocalLengthFromLens = (lensModel) => {
  if (!lensModel) return '';
  
  // Regex-Patterns für verschiedene Brennweiten-Formate (in Prioritätsreihenfolge)
  const patterns = [
    // Zoom-Objektive: "24-70mm", "16-35mm", "30-72mm", "44-440mm", etc.
    /(\d+)-(\d+)mm/i,
    // Einzelbrennweiten mit T-Stops: "25mm T2.1", "50mm T1.4", "40mm T2.3", etc.
    /(\d+)mm\s+T\d+(?:\.\d+)?/i,
    // Einzelbrennweiten mit Macro: "65mm Macro", "100mm Macro", etc.
    /(\d+)mm\s+Macro/i,
    // Einzelbrennweiten mit speziellen Bezeichnungen: "V-Lite 28mm T2.2 (2x)", etc.
    /(\d+)mm\s+T\d+(?:\.\d+)?\s*\([^)]+\)/i,
    // Einfache Einzelbrennweiten: "50mm", "85mm", etc.
    /(\d+)mm/i
  ];
  
  for (const pattern of patterns) {
    const match = lensModel.match(pattern);
    if (match) {
      if (match[2]) {
        // Zoom-Objektiv gefunden
        return `${match[1]}-${match[2]}mm`;
      } else {
        // Einzelbrennweite gefunden
        return `${match[1]}mm`;
      }
    }
  }
  
  return '';
};

// Funktion zur Extraktion des Herstellers aus dem Objektiv-Namen (robust gegen Brennweiten)
const extractManufacturerFromLens = (lensModel) => {
  if (!lensModel) return '';
  const trimmed = lensModel.trim();
  // Wenn der String mit einer Brennweite beginnt, KEIN Hersteller zurückgeben
  if (/^(\d+)(-\d+)?mm\b/i.test(trimmed) || /^\d/.test(trimmed)) {
    return '';
  }
  
  const manufacturers = [
    'Canon', 'Nikon', 'Sony', 'Zeiss', 'Cooke', 'ARRI', 'Leica',
    'Sigma', 'Panavision', 'Hawk', 'Angenieux', 'Atlas', 'Fujinon', 'Tokina', 'Voigtländer'
  ];
  
  for (const manufacturer of manufacturers) {
    if (trimmed.toLowerCase().includes(manufacturer.toLowerCase())) {
      return manufacturer;
    }
  }
  
  // Vorsichtiger Fallback: nur alphabetisches erstes Wort ohne "mm" zurückgeben
  const firstWord = trimmed.split(' ')[0];
  if (/^[A-Za-zÄÖÜäöü-]+$/.test(firstWord) && !/mm/i.test(firstWord)) {
    return firstWord;
  }
  return '';
};

const ShotList = () => {
  const { t } = useLanguage();
  // Lade das ausgewählte Projekt aus localStorage
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    return parseInt(localStorage.getItem('selectedProjectId')) || 1;
  });
  
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('projects');
    return savedProjects ? JSON.parse(savedProjects) : [];
  });

  // Finde das ausgewählte Projekt
  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  
  // Funktion zum Exportieren des Projekts als PDF
  const handleExportProjectToPDF = () => {
    try {
      if (selectedProject && selectedProject.shots) {
        // Erstelle das PDF
        const doc = exportProjectToPDF(selectedProject, selectedProject.shots);
        
        // Speichere das PDF
        savePDF(doc, `Projekt_${selectedProject.name}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
      }
    } catch (error) {
      console.error('Fehler beim Exportieren des Projekts als PDF:', error);
    }
  };
  
  // Initialisiere Shots aus dem ausgewählten Projekt oder mit Standardwerten
  const [shots, setShots] = useState([]);

  const [filter, setFilter] = useState('Alle');
  const [searchTerm, setSearchTerm] = useState('');

  // Lade Shots wenn sich das Projekt ändert
  useEffect(() => {
    console.log("ShotList useEffect - Loading shots...");
    const savedProjects = localStorage.getItem('projects');
    const currentProjects = savedProjects ? JSON.parse(savedProjects) : [];
    const currentSelectedProjectId = parseInt(localStorage.getItem('selectedProjectId')) || 1;
    
    console.log("Current projects:", currentProjects);
    console.log("Current selected project ID:", currentSelectedProjectId);
    
    setSelectedProjectId(currentSelectedProjectId);
    setProjects(currentProjects);
    
    const currentProject = currentProjects.find(p => p.id === currentSelectedProjectId);
    console.log("Found current project:", currentProject);
    
    if (currentProject && currentProject.shots) {
      console.log("Loading shots from project:", currentProject.shots);
      setShots(currentProject.shots);
    } else {
      console.log("No shots found in project, loading default shots");
      // Fallback zu Standardshots falls keine vorhanden sind
      const defaultShots = [
        { id: 1, name: 'SH_001', description: 'Explosion Hauptgebäude', status: 'Abgeschlossen', notes: 'Pyrotechnik und CG-Erweiterung', cameraSettings: { model: 'ARRI Alexa Mini', lens: '35mm', focalLength: '24mm', aperture: 'f/5.6', iso: '800' } },
        { id: 2, name: 'SH_002', description: 'Drohnenflug über Stadt', status: 'In Bearbeitung', notes: 'Tracking-Marker platzieren', cameraSettings: { model: 'DJI Inspire 2', lens: 'X7', focalLength: '16mm', aperture: 'f/4', iso: '400' } },
        { id: 3, name: 'SH_003', description: 'Greenscreen Held', status: 'Ausstehend', notes: 'Beleuchtungsreferenzen sammeln', cameraSettings: { model: 'RED Epic', lens: '50mm', focalLength: '50mm', aperture: 'f/2.8', iso: '640' } },
        { id: 4, name: 'SH_004', description: 'Auto Verfolgungsjagd', status: 'Ausstehend', notes: 'Stunt-Koordination erforderlich', cameraSettings: { model: 'Sony Venice', lens: '24-70mm Zoom', focalLength: '35mm', aperture: 'f/4', iso: '500' } },
        { id: 5, name: 'SH_005', description: 'Alien Landung', status: 'In Bearbeitung', notes: 'Referenzfotos vom Set', cameraSettings: { model: 'ARRI Alexa LF', lens: '18mm', focalLength: '18mm', aperture: 'f/8', iso: '1600' } }
      ];
      setShots(defaultShots);
    }
  }, []);

  // Synchronisiere Shots mit Änderungen in Projekten und auto-gespeicherten Shot-Dateien
  useEffect(() => {
    const syncShots = () => {
      const currentSelectedProjectId = parseInt(localStorage.getItem('selectedProjectId')) || 1;
      if (currentSelectedProjectId !== selectedProjectId) {
        setSelectedProjectId(currentSelectedProjectId);
      }

      const savedProjects = localStorage.getItem('projects');
      const currentProjects = savedProjects ? JSON.parse(savedProjects) : [];
      const currentProject = currentProjects.find(p => p.id === currentSelectedProjectId);

      let nextShots = currentProject && Array.isArray(currentProject.shots) ? currentProject.shots : [];

      // Overlay: auto-gespeicherte Shot-Dateien (shot-file-<id>) und Legacy (shot_<id>)
      const overlaidShots = nextShots.map(s => {
        try {
          const fileKey = `shot-file-${s.id}`;
          const fileContent = localStorage.getItem(fileKey);
          if (fileContent) {
            const fileShot = JSON.parse(fileContent);
            return { ...s, ...fileShot };
          }
          const legacyKey = `shot_${s.id}`;
          const legacyContent = localStorage.getItem(legacyKey);
          if (legacyContent) {
            const legacyShot = JSON.parse(legacyContent);
            return { ...s, ...legacyShot };
          }
        } catch (e) {
          // Ignoriere Parsing-Fehler still
        }
        return s;
      });

      const hasChanged = JSON.stringify(overlaidShots) !== JSON.stringify(shots);
      if (hasChanged) {
        setShots(overlaidShots);
      }
    };

    window.addEventListener('storage', syncShots);
    const interval = setInterval(syncShots, 1000);

    return () => {
      window.removeEventListener('storage', syncShots);
      clearInterval(interval);
    };
  }, [selectedProjectId, shots]);

  // Speichere Shots im ausgewählten Projekt
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    const currentProjects = savedProjects ? JSON.parse(savedProjects) : [];
    
    if (currentProjects.length > 0 && shots.length > 0) {
      const updatedProjects = currentProjects.map(project => {
        if (project.id === selectedProjectId) {
          return { ...project, shots: shots };
        }
        return project;
      });
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }
  }, [shots, selectedProjectId]);

  const addNewShot = () => {
    const newShot = {
      id: Date.now(),
      name: `SH_${String(shots.length + 1).padStart(3, '0')}`,
      description: 'Neuer Shot',
      status: 'Ausstehend',
      notes: '',
      previewScale: 1,
      referencesScale: 1,
      additionalCameraSetups: [],
      cameraSettings: { 
        manufacturer: '',
        model: '', 
        format: '',
        lens: '', 
        focalLength: '', 
        aperture: '', 
        iso: '',
        focusDistance: '',
        hyperfocalDistance: '',
        ndFilter: '',
        shutterAngle: '180°',
        imageStabilization: 'Aus'
      },
      cameraMovement: {
        movementType: '',
        direction: '',
        speed: '',
        cameraHeight: '',
        dollySetup: {
          trackType: '',
          trackLength: '',
          headType: '',
          mount: ''
        },
        sliderSetup: {
          length: '',
          orientation: ''
        },
        craneSetup: {
          armLength: '',
          mounting: ''
        },
        gimbalSetup: {
          system: '',
          mode: ''
        },
        steadicamSetup: {
          system: '',
          mode: ''
        },
        tripodSetup: {
          height: '',
          legsSpread: ''
        },
        panTilt: {
          pan: '',
          tilt: ''
        },
        notes: ''
      },
      vfxPreparations: {
        cleanplates: false,
        hdris: false,
        setReferences: false,
        chromeBall: false,
        grayBall: false,
        colorChecker: false,
        distortionGrids: false,
        measurementsTaken: false,
        threeDScans: false,
        distortionGridsDetails: {
          patternType: '',
          distances: '',
          notes: ''
        },
        measurementsDetails: {
          method: '',
          unit: 'cm',
          width: '',
          height: '',
          depth: '',
          cameraDistance: '',
          notes: ''
        },
        threeDScansDetails: {
          method: '',
          formats: [],
          quality: '',
          notes: ''
        }
      },
      references: [],
      projectId: selectedProjectId
    };
    setShots([...shots, newShot]);
  };

  const filteredShots = shots.filter(shot => {
    const matchesFilter = filter === 'Alle' || shot.status === filter;
    const matchesSearch = shot.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          shot.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusLabel = (s) => {
    if (s === 'Alle') return t('status.all');
    if (s === 'Abgeschlossen') return t('status.completed');
    if (s === 'In Bearbeitung') return t('status.inProgress');
    return t('status.pending');
  };

  return (
    <div className="shot-list-page">
      <div className="header">
        <div className="header-content">
  <h1>{t('nav.shots')}</h1>
          <p className="subtitle">{filteredShots.length} {t('common.of')} {shots.length} {t('shot.plural')}</p>
        </div>
        <div className="header-buttons">
          <button className="export-btn" onClick={handleExportProjectToPDF}>{t('action.exportProjectPDF')}</button>
          <button className="btn-primary" onClick={addNewShot}>
            {t('action.newShot')}
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder={t('search.shotsPlaceholder')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="status-filters">
          {['Alle', 'Abgeschlossen', 'In Bearbeitung', 'Ausstehend'].map(status => (
            <button 
              key={status}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {statusLabel(status)}
              {status !== 'Alle' && (
                <span className="filter-count">
                  {shots.filter(shot => shot.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="shots-grid">
        {filteredShots.map(shot => {
          // Extrahiere automatisch Brennweite und Hersteller aus dem Objektiv-Modell
          const autoFocalLength = extractFocalLengthFromLens(shot.cameraSettings?.lens);
          const lensManufacturer = (shot.cameraSettings?.lensManufacturer && shot.cameraSettings.lensManufacturer.trim())
            ? shot.cameraSettings.lensManufacturer
            : extractManufacturerFromLens(shot.cameraSettings?.lens);
          const displayFocalLength = shot.cameraSettings?.focalLength || autoFocalLength;
          const setupCount = 1 + (shot.additionalCameraSetups?.length || 0);
          const getLensType = (lensModel, isAnamorphic) => {
            if (!lensModel && !isAnamorphic) return '';
            const model = (lensModel || '').toLowerCase();
            const zoomPattern = /(\d+)\s*-\s*(\d+)\s*mm/;
            const singleFocalPattern = /(\d+)\s*mm(?!\s*-)/;
            const isZoom = zoomPattern.test(model) || model.includes('zoom');
            const isMacro = model.includes('macro');
            const isFisheye = model.includes('fisheye') || model.includes('fish-eye');
            const isAnamorph = !!isAnamorphic || model.includes('anamorph');

            if (isAnamorph && isZoom) return 'Anamorphe Zoomlinse';
            if (isAnamorph && isMacro) return 'Anamorphe Makrolinse';
            if (isAnamorph && isFisheye) return 'Anamorphes Fisheye';
            if (isAnamorph && singleFocalPattern.test(model)) return 'Anamorphe Festbrennweite';
            if (isAnamorph) return 'Anamorphe Linse';

            if (isZoom) return 'Zoomlinse';
            if (isMacro) return 'Makrolinse';
            if (isFisheye) return 'Fisheye';
            if (singleFocalPattern.test(model)) return 'Festbrennweite';
            return lensModel ? 'Objektiv' : '';
          };
          const lensType = getLensType(shot.cameraSettings?.lens, shot.cameraSettings?.isAnamorphic);
          
          return (
            <div className="shot-card" key={shot.id}>
              <div className="shot-card-header">
                <div className="shot-name">{shot.name}</div>
                <span className={`status-badge ${shot.status.toLowerCase().replace(' ', '-')}`}>
                  {shot.status}
                </span>
              </div>
              {(shot.previewImage) ? (
                <div className="shot-thumbnail">
                  <img src={shot.previewImage} alt={`Vorschau für ${shot.name}`} />
                </div>
              ) : (
                <div className="shot-thumbnail placeholder">
                  <img src={dummyPreview} alt="Vorschau" />
                </div>
              )}
              
              <div className="shot-description">
                {shot.description}
              </div>
              
              <div className="shot-details">
                <div className="detail-item">
                  <span className="detail-label">{t('shot.setupCount')}:</span>
                  <span className="detail-value">{setupCount}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t('camera.model')}:</span>
                  <span className="detail-value">{shot.cameraSettings?.model || t('common.notAvailable')}</span>
                </div>
                
                {lensManufacturer && (
                  <div className="detail-item">
                    <span className="detail-label">{t('lens.manufacturer')}:</span>
                    <span className="detail-value">{lensManufacturer}</span>
                  </div>
                )}
                
                <div className="detail-item">
                  <span className="detail-label">{t('lens.lens')}:</span>
                  <span className="detail-value">{shot.cameraSettings?.lens || t('common.notAvailable')}</span>
                </div>
                
                {displayFocalLength && (
                  <div className="detail-item">
                    <span className="detail-label">{t('lens.focalLength')}:</span>
                    <span className="detail-value">{displayFocalLength}</span>
                  </div>
                )}
                
                {shot.notes && (
                  <div className="detail-item">
                    <span className="detail-label">{t('common.notes')}:</span>
                    <span className="detail-value">{shot.notes}</span>
                  </div>
                )}
              </div>
              
              <div className="shot-card-actions">
                <Link to={`/shots/${shot.id}`} className="action-btn primary">
                  {t('action.shotDetails')}
                </Link>
              </div>
            </div>
          );
        })}
        
        {filteredShots.length === 0 && (
          <div className="empty-state">
            <h3>{t('shot.emptyTitle')}</h3>
            <p>{t('shot.emptyMessage')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShotList;