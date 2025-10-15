import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ShotDetails.css';
import { 
  cameraDatabase, 
  getManufacturers, 
  getModelsByManufacturer, 
  getFormatsByModel, 
  getCodecsByModel,
  getCameraFullName,
  getSensorSizeByFormat,
  getCameraInfoByFormat,
  getColorSpacesByModel,
  formatFormatDisplay
} from '../data/cameraDatabase';
import { 
  lensDatabase, 
  getLensManufacturers, 
  getLensesByManufacturer,
  getLensFullName,
  getAnamorphicLensManufacturers,
  getAnamorphicLensesByManufacturer 
} from '../data/lensDatabase';
import { 
  getAllFilters 
} from '../data/filterDatabase';
import { 
  calculateAllFOV, 
  formatFOVDisplay 
} from '../utils/fovCalculator';
import { getPresets } from './CameraSettings';
import { 
  loadShotFromFile, 
  saveShotToFile, 
  autoSaveShotToFile,
  shotFileExists 
} from '../utils/shotFileManager';
import { maybeAutoBackup } from '../utils/versioningManager';
import { exportShotToPDF, savePDF } from '../utils/pdfExporter';
import dummyPreview from '../assets/dummy-preview.svg';
import dummyReference from '../assets/dummy-reference.svg';
import { useLanguage } from '../contexts/LanguageContext';

const ShotDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const statusLabel = (s) => {
    if (s === 'Abgeschlossen') return t('status.completed');
    if (s === 'In Bearbeitung') return t('status.inProgress');
    if (s === 'Ausstehend') return t('status.pending');
    return s;
  };
  const movementTypeLabel = (v) => {
    const map = {
      'Dolly': 'dolly',
      'Slider': 'slider',
      'Crane': 'craneJib',
      'Gimbal': 'gimbal',
      'Steadicam': 'steadicam',
      'Handheld': 'handheld',
      'Tripod': 'tripodStatic',
      'Stativ (Static)': 'tripodStatic'
    };
    return v && map[v] ? t(`movement.typeOptions.${map[v]}`) : (v || '');
  };
  const directionLabel = (d) => {
    const map = {
      'Vorwärts': 'forward',
      'Rückwärts': 'backward',
      'Seitwärts': 'sideways',
      'Kreis': 'circle',
      'Hoch': 'up',
      'Runter': 'down',
      'Diagonal': 'diagonal',
      'Forward': 'forward',
      'Backward': 'backward',
      'Sideways': 'sideways',
      'Circle': 'circle',
      'Up': 'up',
      'Down': 'down',
      'Diagonal': 'diagonal'
    };
    return d && map[d] ? t(`movement.directionOptions.${map[d]}`) : (d || '');
  };
  
  const [shot, setShot] = useState(null);
  const [editedShot, setEditedShot] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [references, setReferences] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('set-fotos');
  
  // Camera state
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [availableFormats, setAvailableFormats] = useState([]);
  const [availableCodecs, setAvailableCodecs] = useState([]);
  const [availableColorSpaces, setAvailableColorSpaces] = useState([]);
  
  // Lens state
  const [selectedLensManufacturer, setSelectedLensManufacturer] = useState('');
  const [selectedLens, setSelectedLens] = useState('');
  const [availableLenses, setAvailableLenses] = useState([]);
  const [isAnamorphicEnabled, setIsAnamorphicEnabled] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filterToAdd, setFilterToAdd] = useState('');
  const [selectedSetupIndex, setSelectedSetupIndex] = useState(0);

  // Aktuelle Setup-Referenzen (A = Top-Level, B/C = additionalCameraSetups)
  const currentEditedCameraSettings = selectedSetupIndex === 0
    ? (editedShot?.cameraSettings || {})
    : ((editedShot?.additionalCameraSetups?.[selectedSetupIndex - 1]?.cameraSettings) || {});
  const currentEditedCameraMovement = selectedSetupIndex === 0
    ? (editedShot?.cameraMovement || {})
    : ((editedShot?.additionalCameraSetups?.[selectedSetupIndex - 1]?.cameraMovement) || {});

  // Anzeige-Referenzen für Nicht-Bearbeitungsmodus
  const currentShotCameraSettings = selectedSetupIndex === 0
    ? (shot?.cameraSettings || {})
    : ((shot?.additionalCameraSetups?.[selectedSetupIndex - 1]?.cameraSettings) || {});
  const currentShotCameraMovement = selectedSetupIndex === 0
    ? (shot?.cameraMovement || {})
    : ((shot?.additionalCameraSetups?.[selectedSetupIndex - 1]?.cameraMovement) || {});

  // Setup-Label (A/B/C ...)
  const getSetupLabel = (index) => String.fromCharCode(65 + index);

  // Beim Wechsel des Setups: UI-States an den aktuell ausgewählten Setup anpassen
  useEffect(() => {
    if (!editedShot) return;
    const s = selectedSetupIndex === 0
      ? (editedShot.cameraSettings || {})
      : ((editedShot.additionalCameraSetups?.[selectedSetupIndex - 1]?.cameraSettings) || {});

    // Kamera-Auswahl
    const manufacturer = s.manufacturer || '';
    setSelectedManufacturer(manufacturer);
    const models = manufacturer ? getModelsByManufacturer(manufacturer) : [];
    setAvailableModels(models);
    const modelName = s.model
      ? (s.model.includes(' ') ? s.model.split(' ').slice(1).join(' ') : s.model)
      : '';
    setSelectedModel(modelName);
    if (manufacturer && modelName) {
      setAvailableFormats(getFormatsByModel(manufacturer, modelName));
      setAvailableCodecs(getCodecsByModel(manufacturer, modelName));
      setAvailableColorSpaces(getColorSpacesByModel(manufacturer, modelName));
    } else {
      setAvailableFormats([]);
      setAvailableCodecs([]);
      setAvailableColorSpaces([]);
    }

    // Objektiv-Auswahl
    const lm = s.lensManufacturer || '';
    setSelectedLensManufacturer(lm);
    setIsAnamorphicEnabled(!!s.isAnamorphic);
    const lensList = lm
      ? (s.isAnamorphic ? getAnamorphicLensesByManufacturer(lm) : getLensesByManufacturer(lm))
      : [];
    setAvailableLenses(lensList);
    const fullLensName = s.lens || '';
    const lensModelName = (lm && fullLensName) ? fullLensName.replace(new RegExp(`^${lm}\\s+`), '') : '';
    setSelectedLens(lensModelName);

    // Filter-Auswahl
    const filtersArr = Array.isArray(s.filters)
      ? s.filters
      : (typeof s.filter === 'string' && s.filter.trim().length > 0 ? s.filter.split(/\s*,\s*/) : []);
    setSelectedFilters(filtersArr);
    setFilterToAdd('');
  }, [selectedSetupIndex, editedShot]);

  useEffect(() => {
    const loadShotData = async () => {
      try {
        let shotData;
        
        if (shotFileExists(id)) {
          shotData = await loadShotFromFile(id);
        } else {
          const storedShot = localStorage.getItem(`shot_${id}`);
          if (storedShot) {
            shotData = JSON.parse(storedShot);
          } else {
            shotData = {
              id: id,
              name: `SH_${id.slice(-3)}`,
              status: 'Ausstehend',
              description: `Hier werden die Details für Shot ${id} angezeigt.`,
              notes: '',
              dateCreated: new Date().toLocaleDateString('de-DE'),
              lastUpdated: new Date().toLocaleDateString('de-DE'),
              previewScale: 1,
              referencesScale: 1,
              cameraSettings: {
                manufacturer: '',
                model: '',
                iso: '',
                isoSelection: '',
                manualISO: '',
                format: '',
                codec: '',
                colorSpace: '',
                whiteBalance: '',
                framerate: '',
                shutterAngle: '180°',
                imageStabilization: 'Aus',
                lensManufacturer: '',
                lens: '',
                focalLength: '',
                aperture: '',
                focusDistance: '',
                hyperfocalDistance: '',
                isAnamorphic: false,
                ndFilter: '',
                filters: [],
                filter: ''
                ,
                lensStabilization: ''
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
              }
            };
          }
        }
        
        // Defaults für Kamera-Bewegung definieren und Referenzen-Struktur sichern
        const cameraMovementDefaults = {
          movementType: '',
          direction: '',
          speed: '',
          cameraHeight: '',
          dollySetup: { trackType: '', trackLength: '', headType: '', mount: '' },
          sliderSetup: { length: '', orientation: '' },
          craneSetup: { armLength: '', mounting: '' },
          gimbalSetup: { system: '', mode: '' },
          steadicamSetup: { system: '', mode: '' },
          tripodSetup: { height: '', legsSpread: '' },
          panTilt: { pan: '', tilt: '' },
          notes: ''
        };

        const normalizedShotData = {
          ...shotData,
          references: Array.isArray(shotData.references) ? shotData.references : [],
          cameraMovement: {
            ...cameraMovementDefaults,
            ...(shotData.cameraMovement || {})
          },
          additionalCameraSetups: Array.isArray(shotData.additionalCameraSetups)
            ? shotData.additionalCameraSetups
            : []
        };

        setShot(normalizedShotData);
        setEditedShot({ ...normalizedShotData });
        // UI-States aus gespeicherten Daten herstellen
        setReferences(normalizedShotData.references || []);
        setupUIStatesFromShotData(shotData);
      } catch (error) {
        console.error('Error loading shot data:', error);
      }
    };

    const setupUIStatesFromShotData = (shotData) => {
      if (shotData.cameraSettings?.manufacturer) {
        setSelectedManufacturer(shotData.cameraSettings.manufacturer);
        const models = getModelsByManufacturer(shotData.cameraSettings.manufacturer);
        setAvailableModels(models);
        
        if (shotData.cameraSettings.model) {
          const modelName = shotData.cameraSettings.model.includes(' ') 
            ? shotData.cameraSettings.model.split(' ').slice(1).join(' ')
            : shotData.cameraSettings.model;
          setSelectedModel(modelName);
          
          // Load formats, codecs, and color spaces for the selected model
          const formats = getFormatsByModel(shotData.cameraSettings.manufacturer, modelName);
          const codecs = getCodecsByModel(shotData.cameraSettings.manufacturer, modelName);
          const colorSpaces = getColorSpacesByModel(shotData.cameraSettings.manufacturer, modelName);
          setAvailableFormats(formats);
          setAvailableCodecs(codecs);
          setAvailableColorSpaces(colorSpaces);
        }
      }

      if (shotData.cameraSettings?.isAnamorphic !== undefined) {
        setIsAnamorphicEnabled(shotData.cameraSettings.isAnamorphic);
      }

      if (shotData.cameraSettings?.lensManufacturer) {
        setSelectedLensManufacturer(shotData.cameraSettings.lensManufacturer);
        const lenses = shotData.cameraSettings.isAnamorphic 
          ? getAnamorphicLensesByManufacturer(shotData.cameraSettings.lensManufacturer)
          : getLensesByManufacturer(shotData.cameraSettings.lensManufacturer);
        setAvailableLenses(lenses);
        
        if (shotData.cameraSettings.lens) {
          const lensModel = shotData.cameraSettings.lens.includes(' ')
            ? shotData.cameraSettings.lens.split(' ').slice(1).join(' ')
            : shotData.cameraSettings.lens;
          setSelectedLens(lensModel);
        }
      }

      // Filter-Initialisierung aus vorhandenen Daten
      if (shotData.cameraSettings?.filters && Array.isArray(shotData.cameraSettings.filters)) {
        setSelectedFilters([ ...shotData.cameraSettings.filters ]);
      } else if (shotData.cameraSettings?.filter) {
        const parsed = shotData.cameraSettings.filter
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        setSelectedFilters(parsed);
      }
    };

    if (id) {
      loadShotData();
    }
  }, [id]);

  // Automatischer Save: speichert Änderungen mit Debounce über autoSaveShotToFile
  useEffect(() => {
    if (!isEditing || !id || !editedShot) return;
    // Die Funktion autoSaveShotToFile ist bereits intern debounced
    autoSaveShotToFile(id, editedShot, 1000);
  }, [editedShot, isEditing, id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const updatedShot = {
        ...editedShot,
        references: references,
        lastUpdated: new Date().toLocaleDateString('de-DE')
      };
      
      setShot(updatedShot);
      await saveShotToFile(id, updatedShot);
      localStorage.setItem(`shot_${id}`, JSON.stringify(updatedShot));
      
      // Synchronisiere mit der Projektliste
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        const currentProjectId = parseInt(localStorage.getItem('selectedProjectId')) || 1;
        
        const updatedProjects = projects.map(project => {
          if (project.id === currentProjectId && project.shots) {
            const updatedShots = project.shots.map(shot => 
              shot.id === parseInt(id) ? updatedShot : shot
            );
            return { ...project, shots: updatedShots };
          }
          return project;
        });
        
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
      }
      
      setIsEditing(false);
      // Auto-Backup nach Shot-Speichern
      try { maybeAutoBackup({ note: `Shot ${id} gespeichert`, source: 'shot' }); } catch {}
    } catch (error) {
      console.error('Error saving shot:', error);
    }
  };
  
  // Funktion zum Exportieren des Shots als PDF
  const handleExportToPDF = () => {
    try {
      // Finde das aktuelle Projekt
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        const currentProjectId = parseInt(localStorage.getItem('selectedProjectId')) || 1;
        const currentProject = projects.find(project => project.id === currentProjectId);
        
        if (currentProject && shot) {
          // Erstelle das PDF
          const doc = exportShotToPDF(shot, currentProject);
          
          // Speichere das PDF
          savePDF(doc, `Shot_${shot.name}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
        }
      }
    } catch (error) {
      console.error('Fehler beim Exportieren des Shots als PDF:', error);
    }
  };

  const handleCancel = () => {
    setEditedShot({ ...shot });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedShot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCameraChange = (e) => {
    const { name, value } = e.target;
    setEditedShot(prev => {
      if (selectedSetupIndex === 0) {
        return {
          ...prev,
          cameraSettings: {
            ...prev.cameraSettings,
            [name]: value
          }
        };
      }
      const additional = Array.isArray(prev.additionalCameraSetups) ? [...prev.additionalCameraSetups] : [];
      const idx = selectedSetupIndex - 1;
      const setup = { ...(additional[idx] || { cameraSettings: {}, cameraMovement: {} }) };
      setup.cameraSettings = { ...(setup.cameraSettings || {}), [name]: value };
      additional[idx] = setup;
      return { ...prev, additionalCameraSetups: additional };
    });
  };

  // ISO Auswahl- und Custom-Handling
  const handleISOSelectChange = (e) => {
    const value = e.target.value;
    setEditedShot(prev => {
      const compute = (base) => ({
        ...base,
        isoSelection: value,
        iso: value === 'Custom' 
          ? ((base.manualISO) || (base.iso) || '')
          : value,
        manualISO: value === 'Custom' 
          ? ((base.manualISO) || (base.iso) || '')
          : ''
      });
      if (selectedSetupIndex === 0) {
        return {
          ...prev,
          cameraSettings: compute(prev.cameraSettings || {})
        };
      }
      const additional = Array.isArray(prev.additionalCameraSetups) ? [...prev.additionalCameraSetups] : [];
      const idx = selectedSetupIndex - 1;
      const setup = { ...(additional[idx] || { cameraSettings: {}, cameraMovement: {} }) };
      setup.cameraSettings = compute(setup.cameraSettings || {});
      additional[idx] = setup;
      return { ...prev, additionalCameraSetups: additional };
    });
  };

  const handleManualISOChange = (e) => {
    const value = e.target.value;
    setEditedShot(prev => {
      if (selectedSetupIndex === 0) {
        return {
          ...prev,
          cameraSettings: {
            ...prev.cameraSettings,
            manualISO: value,
            iso: value
          }
        };
      }
      const additional = Array.isArray(prev.additionalCameraSetups) ? [...prev.additionalCameraSetups] : [];
      const idx = selectedSetupIndex - 1;
      const setup = { ...(additional[idx] || { cameraSettings: {}, cameraMovement: {} }) };
      setup.cameraSettings = { ...(setup.cameraSettings || {}), manualISO: value, iso: value };
      additional[idx] = setup;
      return { ...prev, additionalCameraSetups: additional };
    });
  };

  const handleVFXChange = (e) => {
    const { name, checked } = e.target;
    setEditedShot(prev => ({
      ...prev,
      vfxPreparations: {
        ...prev.vfxPreparations,
        [name]: checked
      }
    }));
  };

  // VFX Detailfelder ändern (verschachtelte Objekte in vfxPreparations)
  const handleVFXDetailChange = (groupKey, field, value) => {
    setEditedShot(prev => ({
      ...prev,
      vfxPreparations: {
        ...prev.vfxPreparations,
        [groupKey]: {
          ...(prev.vfxPreparations?.[groupKey] || {}),
          [field]: value
        }
      }
    }));
  };

  // Kamera-Bewegung: einfache Felder ändern
  const handleCameraMovementChange = (field, value) => {
    const updatedShot = (selectedSetupIndex === 0)
      ? {
          ...editedShot,
          cameraMovement: {
            ...(editedShot.cameraMovement || {}),
            [field]: value
          }
        }
      : {
          ...editedShot,
          additionalCameraSetups: (() => {
            const arr = Array.isArray(editedShot.additionalCameraSetups) ? [...editedShot.additionalCameraSetups] : [];
            const idx = selectedSetupIndex - 1;
            const setup = { ...(arr[idx] || { cameraSettings: {}, cameraMovement: {} }) };
            setup.cameraMovement = { ...(setup.cameraMovement || {}), [field]: value };
            arr[idx] = setup;
            return arr;
          })()
        };
    setEditedShot(updatedShot);
    autoSaveShotToFile(id, updatedShot);
  };

  // Kamera-Bewegung: verschachtelte Felder ändern (z.B. dollySetup)
  const handleCameraMovementNestedChange = (groupKey, field, value) => {
    const updatedShot = (selectedSetupIndex === 0)
      ? {
          ...editedShot,
          cameraMovement: {
            ...(editedShot.cameraMovement || {}),
            [groupKey]: {
              ...((editedShot.cameraMovement && editedShot.cameraMovement[groupKey]) || {}),
              [field]: value
            }
          }
        }
      : {
          ...editedShot,
          additionalCameraSetups: (() => {
            const arr = Array.isArray(editedShot.additionalCameraSetups) ? [...editedShot.additionalCameraSetups] : [];
            const idx = selectedSetupIndex - 1;
            const setup = { ...(arr[idx] || { cameraSettings: {}, cameraMovement: {} }) };
            const cm = setup.cameraMovement || {};
            setup.cameraMovement = {
              ...cm,
              [groupKey]: {
                ...(cm[groupKey] || {}),
                [field]: value
              }
            };
            arr[idx] = setup;
            return arr;
          })()
        };
    setEditedShot(updatedShot);
    autoSaveShotToFile(id, updatedShot);
  };

  // Formate (Checkboxen) für 3D Scans toggeln
  const handleVFXFormatToggle = (format) => {
    setEditedShot(prev => {
      const current = prev.vfxPreparations?.threeDScansDetails?.formats || [];
      const exists = current.includes(format);
      const updatedFormats = exists ? current.filter(f => f !== format) : [...current, format];
      return {
        ...prev,
        vfxPreparations: {
          ...prev.vfxPreparations,
          threeDScansDetails: {
            ...(prev.vfxPreparations?.threeDScansDetails || {}),
            formats: updatedFormats
          }
        }
      };
    });
  };

  const handleManufacturerChange = (e) => {
    const manufacturer = e.target.value;
    setSelectedManufacturer(manufacturer);
    setSelectedModel('');
    
    if (manufacturer) {
      const models = getModelsByManufacturer(manufacturer);
      setAvailableModels(models);
    } else {
      setAvailableModels([]);
    }

    setEditedShot(prev => {
      if (selectedSetupIndex === 0) {
        return {
          ...prev,
          cameraSettings: {
            ...prev.cameraSettings,
            manufacturer: manufacturer,
            model: ''
          }
        };
      }
      const additional = Array.isArray(prev.additionalCameraSetups) ? [...prev.additionalCameraSetups] : [];
      const idx = selectedSetupIndex - 1;
      const setup = { ...(additional[idx] || { cameraSettings: {}, cameraMovement: {} }) };
      setup.cameraSettings = { ...(setup.cameraSettings || {}), manufacturer: manufacturer, model: '' };
      additional[idx] = setup;
      return { ...prev, additionalCameraSetups: additional };
    });
  };

  const handleModelChange = (e) => {
    const model = e.target.value;
    setSelectedModel(model);
    
    if (model && selectedManufacturer) {
      const formats = getFormatsByModel(selectedManufacturer, model);
      const codecs = getCodecsByModel(selectedManufacturer, model);
      const colorSpaces = getColorSpacesByModel(selectedManufacturer, model);
      setAvailableFormats(formats);
      setAvailableCodecs(codecs);
      setAvailableColorSpaces(colorSpaces);
      
      const fullCameraName = getCameraFullName(selectedManufacturer, model);
      setEditedShot(prev => {
        if (selectedSetupIndex === 0) {
          return {
            ...prev,
            cameraSettings: {
              ...prev.cameraSettings,
              model: fullCameraName,
              format: '',
              codec: '',
              colorSpace: ''
            }
          };
        }
        const additional = Array.isArray(prev.additionalCameraSetups) ? [...prev.additionalCameraSetups] : [];
        const idx = selectedSetupIndex - 1;
        const setup = { ...(additional[idx] || { cameraSettings: {}, cameraMovement: {} }) };
        setup.cameraSettings = {
          ...(setup.cameraSettings || {}),
          model: fullCameraName,
          format: '',
          codec: '',
          colorSpace: ''
        };
        additional[idx] = setup;
        return { ...prev, additionalCameraSetups: additional };
      });
    } else {
      setAvailableFormats([]);
      setAvailableCodecs([]);
      setAvailableColorSpaces([]);
      setEditedShot(prev => {
        if (selectedSetupIndex === 0) {
          return {
            ...prev,
            cameraSettings: {
              ...prev.cameraSettings,
              model: '',
              format: '',
              codec: '',
              colorSpace: ''
            }
          };
        }
        const additional = Array.isArray(prev.additionalCameraSetups) ? [...prev.additionalCameraSetups] : [];
        const idx = selectedSetupIndex - 1;
        const setup = { ...(additional[idx] || { cameraSettings: {}, cameraMovement: {} }) };
        setup.cameraSettings = {
          ...(setup.cameraSettings || {}),
          model: '',
          format: '',
          codec: '',
          colorSpace: ''
        };
        additional[idx] = setup;
        return { ...prev, additionalCameraSetups: additional };
      });
    }
  };

  const handleLensManufacturerChange = (e) => {
    const manufacturer = e.target.value;
    setSelectedLensManufacturer(manufacturer);
    setSelectedLens('');
    
    if (manufacturer) {
      const lenses = isAnamorphicEnabled 
        ? getAnamorphicLensesByManufacturer(manufacturer)
        : getLensesByManufacturer(manufacturer);
      setAvailableLenses(lenses);
    } else {
      setAvailableLenses([]);
    }

    const updatedShot = (selectedSetupIndex === 0)
      ? {
          ...editedShot,
          cameraSettings: {
            ...editedShot.cameraSettings,
            lensManufacturer: manufacturer,
            lens: ''
          }
        }
      : {
          ...editedShot,
          additionalCameraSetups: (() => {
            const arr = Array.isArray(editedShot.additionalCameraSetups) ? [...editedShot.additionalCameraSetups] : [];
            const idx = selectedSetupIndex - 1;
            const setup = { ...(arr[idx] || { cameraSettings: {}, cameraMovement: {} }) };
            setup.cameraSettings = { ...(setup.cameraSettings || {}), lensManufacturer: manufacturer, lens: '' };
            arr[idx] = setup;
            return arr;
          })()
        };
    
    setEditedShot(updatedShot);
    autoSaveShotToFile(id, updatedShot);
  };

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

  const handleLensChange = (e) => {
    const lens = e.target.value;
    setSelectedLens(lens);
    
    if (lens && selectedLensManufacturer) {
      const fullLensName = getLensFullName(selectedLensManufacturer, lens);
      
      // Extrahiere automatisch die Brennweite aus dem Objektiv-Namen
      const autoFocalLength = extractFocalLengthFromLens(fullLensName);
      
      const updatedShot = (selectedSetupIndex === 0)
        ? {
            ...editedShot,
            cameraSettings: {
              ...editedShot.cameraSettings,
              lens: fullLensName,
              focalLength: editedShot.cameraSettings.focalLength || autoFocalLength
            }
          }
        : {
            ...editedShot,
            additionalCameraSetups: (() => {
              const arr = Array.isArray(editedShot.additionalCameraSetups) ? [...editedShot.additionalCameraSetups] : [];
              const idx = selectedSetupIndex - 1;
              const setup = { ...(arr[idx] || { cameraSettings: {}, cameraMovement: {} }) };
              const existingFL = (setup.cameraSettings || {}).focalLength;
              setup.cameraSettings = {
                ...(setup.cameraSettings || {}),
                lens: fullLensName,
                focalLength: existingFL || autoFocalLength
              };
              arr[idx] = setup;
              return arr;
            })()
          };
      
      setEditedShot(updatedShot);
      autoSaveShotToFile(id, updatedShot);
    } else {
      const updatedShot = (selectedSetupIndex === 0)
        ? {
            ...editedShot,
            cameraSettings: {
              ...editedShot.cameraSettings,
              lens: ''
            }
          }
        : {
            ...editedShot,
            additionalCameraSetups: (() => {
              const arr = Array.isArray(editedShot.additionalCameraSetups) ? [...editedShot.additionalCameraSetups] : [];
              const idx = selectedSetupIndex - 1;
              const setup = { ...(arr[idx] || { cameraSettings: {}, cameraMovement: {} }) };
              setup.cameraSettings = { ...(setup.cameraSettings || {}), lens: '' };
              arr[idx] = setup;
              return arr;
            })()
          };
      
      setEditedShot(updatedShot);
      autoSaveShotToFile(id, updatedShot);
    }
  };

  const handleAnamorphicToggle = (e) => {
    const isEnabled = e.target.checked;
    setIsAnamorphicEnabled(isEnabled);
    setSelectedLensManufacturer('');
    setSelectedLens('');
    setAvailableLenses([]);
    
    const updatedShot = (selectedSetupIndex === 0)
      ? {
          ...editedShot,
          cameraSettings: {
            ...editedShot.cameraSettings,
            isAnamorphic: isEnabled,
            lensManufacturer: '',
            lens: ''
          }
        }
      : {
          ...editedShot,
          additionalCameraSetups: (() => {
            const arr = Array.isArray(editedShot.additionalCameraSetups) ? [...editedShot.additionalCameraSetups] : [];
            const idx = selectedSetupIndex - 1;
            const setup = { ...(arr[idx] || { cameraSettings: {}, cameraMovement: {} }) };
            setup.cameraSettings = { ...(setup.cameraSettings || {}), isAnamorphic: isEnabled, lensManufacturer: '', lens: '' };
            arr[idx] = setup;
            return arr;
          })()
        };
    
    setEditedShot(updatedShot);
    autoSaveShotToFile(id, updatedShot);
  };

  // Filter-Handling (Mehrfachauswahl)
  const handleFilterSelectChange = (e) => {
    setFilterToAdd(e.target.value);
  };

  const handleAddFilter = () => {
    if (!filterToAdd) return;
    if (selectedFilters.includes(filterToAdd)) return;
    const newFilters = [ ...selectedFilters, filterToAdd ];
    setSelectedFilters(newFilters);
    const updatedShot = (selectedSetupIndex === 0)
      ? {
          ...editedShot,
          cameraSettings: {
            ...editedShot.cameraSettings,
            filters: newFilters,
            filter: newFilters.join(', ')
          }
        }
      : {
          ...editedShot,
          additionalCameraSetups: (() => {
            const arr = Array.isArray(editedShot.additionalCameraSetups) ? [...editedShot.additionalCameraSetups] : [];
            const idx = selectedSetupIndex - 1;
            const setup = { ...(arr[idx] || { cameraSettings: {}, cameraMovement: {} }) };
            setup.cameraSettings = {
              ...(setup.cameraSettings || {}),
              filters: newFilters,
              filter: newFilters.join(', ')
            };
            arr[idx] = setup;
            return arr;
          })()
        };
    setEditedShot(updatedShot);
    autoSaveShotToFile(id, updatedShot);
    setFilterToAdd('');
  };

  const handleRemoveFilter = (filter) => {
    const newFilters = selectedFilters.filter(f => f !== filter);
    setSelectedFilters(newFilters);
    const updatedShot = (selectedSetupIndex === 0)
      ? {
          ...editedShot,
          cameraSettings: {
            ...editedShot.cameraSettings,
            filters: newFilters,
            filter: newFilters.join(', ')
          }
        }
      : {
          ...editedShot,
          additionalCameraSetups: (() => {
            const arr = Array.isArray(editedShot.additionalCameraSetups) ? [...editedShot.additionalCameraSetups] : [];
            const idx = selectedSetupIndex - 1;
            const setup = { ...(arr[idx] || { cameraSettings: {}, cameraMovement: {} }) };
            setup.cameraSettings = {
              ...(setup.cameraSettings || {}),
              filters: newFilters,
              filter: newFilters.join(', ')
            };
            arr[idx] = setup;
            return arr;
          })()
        };
    setEditedShot(updatedShot);
    autoSaveShotToFile(id, updatedShot);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
        setEditedShot(prev => ({
          ...prev,
          previewImage: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReferenceUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newReference = {
          id: Date.now() + Math.random(),
          name: file.name,
          url: event.target.result,
          category: selectedCategory
        };
        setReferences(prev => {
          const updated = [...prev, newReference];
          const updatedShot = { ...editedShot, references: updated };
          setEditedShot(updatedShot);
          autoSaveShotToFile(id, updatedShot);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload-Handler pro Abschnitt: Kategorie explizit übergeben
  const handleReferenceUploadFor = (category) => (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newReference = {
          id: Date.now() + Math.random(),
          name: file.name,
          url: event.target.result,
          category
        };
        setReferences(prev => {
          const updated = [...prev, newReference];
          const updatedShot = { ...editedShot, references: updated };
          setEditedShot(updatedShot);
          autoSaveShotToFile(id, updatedShot);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReference = (referenceId) => {
    setReferences(prev => {
      const updated = prev.filter(ref => ref.id !== referenceId);
      const updatedShot = { ...editedShot, references: updated };
      setEditedShot(updatedShot);
      autoSaveShotToFile(id, updatedShot);
      return updated;
    });
  };

  // Hilfsfunktion: Modellschlüssel aus vollem Kameranamen ableiten
  const getModelKey = (manufacturer, fullModel) => {
    if (!manufacturer || !fullModel) return fullModel || '';
    return fullModel.startsWith(manufacturer)
      ? fullModel.slice(manufacturer.length).trim()
      : fullModel;
  };

  // Neues Kamera-Setup hinzufügen (B, C, ...)
  const handleAddCameraSetup = () => {
    const defaultSetup = {
      cameraSettings: {
        manufacturer: '',
        model: '',
        iso: '',
        isoSelection: '',
        manualISO: '',
        format: '',
        codec: '',
        colorSpace: '',
        whiteBalance: '',
        manualWhiteBalance: '',
        framerate: '',
        shutterAngle: '180°',
        imageStabilization: 'Aus',
        lensManufacturer: '',
        lens: '',
        focalLength: '',
        aperture: '',
        focusDistance: '',
        hyperfocalDistance: '',
        isAnamorphic: false,
        ndFilter: '',
        filters: [],
        filter: ''
      },
      cameraMovement: {
        movementType: '',
        direction: '',
        speed: '',
        cameraHeight: '',
        dollySetup: { trackType: '', trackLength: '', headType: '', mount: '' },
        sliderSetup: { length: '', orientation: '' },
        craneSetup: { armLength: '', mounting: '' },
        gimbalSetup: { system: '', mode: '' },
        steadicamSetup: { system: '', mode: '' },
        tripodSetup: { height: '', legsSpread: '' },
        panTilt: { pan: '', tilt: '' },
        notes: ''
      }
    };

    const updatedShot = {
      ...editedShot,
      additionalCameraSetups: [ ...(editedShot.additionalCameraSetups || []), defaultSetup ]
    };
    setEditedShot(updatedShot);
    autoSaveShotToFile(id, updatedShot);
    const newIndex = (updatedShot.additionalCameraSetups?.length || 0); // 1-basiert für B/C
    setSelectedSetupIndex(newIndex);
  };

  if (!shot) {
    return <div className="loading">Lade Shot-Details...</div>;
  }

  return (
    <div className="shot-details">
      <div className="header">
        <button className="btn-secondary" onClick={() => navigate('/shots')}>Zurück zur Liste</button>
        {!isEditing ? (
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleEdit}>Bearbeiten</button>
            <button className="btn-secondary" onClick={handleExportToPDF}>Als PDF exportieren</button>
          </div>
        ) : (
          <div className="edit-actions">
            <button className="btn-danger" onClick={handleCancel}>Abbrechen</button>
            <button className="btn-primary" onClick={handleSave}>Speichern</button>
          </div>
        )}
      </div>

      {/* Shot Header */}
      <div className="shot-header">
        {!isEditing ? (
          <>
            <h1>{shot.name}</h1>
            <span className={`status ${shot.status.toLowerCase().replace(' ', '-')}`}>
              {statusLabel(shot.status)}
            </span>
          </>
        ) : (
          <div className="edit-header">
            <input 
              type="text" 
              name="name" 
              value={editedShot.name} 
              onChange={handleChange}
            />
            <select 
              name="status" 
              value={editedShot.status} 
              onChange={handleChange}
            >
              <option value="Abgeschlossen">{t('status.completed')}</option>
              <option value="In Bearbeitung">{t('status.inProgress')}</option>
              <option value="Ausstehend">{t('status.pending')}</option>
            </select>
          </div>
        )}
      </div>
      
      {/* Preview Image */}
      <div className="preview-image-container">
        {shot.previewImage || previewImage ? (
          <img 
            src={previewImage || shot.previewImage} 
            alt={`Vorschau für ${shot.name}`} 
            className="preview-image"
          />
        ) : (
          <div className="preview-placeholder">
            <img 
              src={dummyPreview}
              alt="Dummy Vorschau Bild"
              className="preview-image"
            />
          </div>
        )}
        
        {isEditing && (
          <div className="image-upload">
            <label htmlFor="image-upload" className="btn-outline">
              Bild hochladen
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
        )}
      </div>

      {/* Shot Information */}
      <div className="shot-info card">
        <h2>{t('shot.detailsTitle')}</h2>
        {!isEditing ? (
          <div className="info-grid">
            <div className="info-item">
              <label><strong>{t('common.description')}</strong>: <span className="info-value">{shot.description}</span></label>
            </div>

            {/* Zweispaltige Options-UI */}
            <div className="vfx-options-grid">
              {editedShot.vfxPreparations?.distortionGrids && (
                <div className="vfx-option-group card">
            <h3>{t('vfx.checklist.distortionGrids')}</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Rastertyp:</label>
                      <select
                        value={editedShot.vfxPreparations?.distortionGridsDetails?.patternType || ''}
                        onChange={(e) => handleVFXDetailChange('distortionGridsDetails', 'patternType', e.target.value)}
                      >
                        <option value="">Auswählen...</option>
                        <option value="Schachbrett">Schachbrett</option>
                        <option value="Punkte">Punkte</option>
                        <option value="Benutzerdefiniert">Benutzerdefiniert</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Abstände/Varianten:</label>
                      <input
                        type="text"
                        placeholder="z.B. 1m, 2m, 3m"
                        value={editedShot.vfxPreparations?.distortionGridsDetails?.distances || ''}
                        onChange={(e) => handleVFXDetailChange('distortionGridsDetails', 'distances', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ width: '100%' }}>
                      <label>{t('common.notes')}:</label>
                      <textarea
                        placeholder="Zusätzliche Hinweise"
                        value={editedShot.vfxPreparations?.distortionGridsDetails?.notes || ''}
                        onChange={(e) => handleVFXDetailChange('distortionGridsDetails', 'notes', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {editedShot.vfxPreparations?.measurementsTaken && (
                <div className="vfx-option-group card">
            <h3>{t('vfx.checklist.measurementsTaken')}</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Methode:</label>
                      <select
                        value={editedShot.vfxPreparations?.measurementsDetails?.method || ''}
                        onChange={(e) => handleVFXDetailChange('measurementsDetails', 'method', e.target.value)}
                      >
                        <option value="">Auswählen...</option>
                        <option value="Tape">Tape</option>
                        <option value="Laser">Laser</option>
                        <option value="Photogrammetrie">Photogrammetrie</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Einheit:</label>
                      <select
                        value={editedShot.vfxPreparations?.measurementsDetails?.unit || 'cm'}
                        onChange={(e) => handleVFXDetailChange('measurementsDetails', 'unit', e.target.value)}
                      >
                        <option value="cm">cm</option>
                        <option value="inch">inch</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Breite:</label>
                      <input
                        type="text"
                        placeholder="z.B. 120"
                        value={editedShot.vfxPreparations?.measurementsDetails?.width || ''}
                        onChange={(e) => handleVFXDetailChange('measurementsDetails', 'width', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Höhe:</label>
                      <input
                        type="text"
                        placeholder="z.B. 200"
                        value={editedShot.vfxPreparations?.measurementsDetails?.height || ''}
                        onChange={(e) => handleVFXDetailChange('measurementsDetails', 'height', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tiefe:</label>
                      <input
                        type="text"
                        placeholder="z.B. 50"
                        value={editedShot.vfxPreparations?.measurementsDetails?.depth || ''}
                        onChange={(e) => handleVFXDetailChange('measurementsDetails', 'depth', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Kamera-Objekt Distanz:</label>
                      <input
                        type="text"
                        placeholder="z.B. 3m"
                        value={editedShot.vfxPreparations?.measurementsDetails?.cameraDistance || ''}
                        onChange={(e) => handleVFXDetailChange('measurementsDetails', 'cameraDistance', e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ width: '100%' }}>
                      <label>{t('common.notes')}:</label>
                      <textarea
                        placeholder="Zusätzliche Messhinweise"
                        value={editedShot.vfxPreparations?.measurementsDetails?.notes || ''}
                        onChange={(e) => handleVFXDetailChange('measurementsDetails', 'notes', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {editedShot.vfxPreparations?.threeDScans && (
                <div className="vfx-option-group card">
                  <h3>3D Scans</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Methode:</label>
                      <select
                        value={editedShot.vfxPreparations?.threeDScansDetails?.method || ''}
                        onChange={(e) => handleVFXDetailChange('threeDScansDetails', 'method', e.target.value)}
                      >
                        <option value="">Auswählen...</option>
                        <option value="LiDAR">LiDAR</option>
                        <option value="Photogrammetrie">Photogrammetrie</option>
                        <option value="Structured Light">Structured Light</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Qualität:</label>
                      <select
                        value={editedShot.vfxPreparations?.threeDScansDetails?.quality || ''}
                        onChange={(e) => handleVFXDetailChange('threeDScansDetails', 'quality', e.target.value)}
                      >
                        <option value="">Auswählen...</option>
                        <option value="Niedrig">Niedrig</option>
                        <option value="Mittel">Mittel</option>
                        <option value="Hoch">Hoch</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <label>Dateiformate:</label>
                      {['OBJ', 'FBX', 'PLY', 'GLTF'].map(fmt => (
                        <label key={fmt} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="checkbox"
                            checked={(editedShot.vfxPreparations?.threeDScansDetails?.formats || []).includes(fmt)}
                            onChange={() => handleVFXFormatToggle(fmt)}
                          />
                          <span>{fmt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ width: '100%' }}>
                      <label>{t('common.notes')}:</label>
                      <textarea
                        placeholder="Scandetails, Kalibrierung, etc."
                        value={editedShot.vfxPreparations?.threeDScansDetails?.notes || ''}
                        onChange={(e) => handleVFXDetailChange('threeDScansDetails', 'notes', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="info-item">
              <label><strong>{t('common.notes')}</strong>: <span className="info-value">{shot.notes}</span></label>
            </div>
            <div className="info-item">
              <label><strong>Erstellt am</strong>: <span className="info-value">{shot.dateCreated}</span></label>
            </div>
            <div className="info-item">
              <label><strong>Zuletzt aktualisiert</strong>: <span className="info-value">{shot.lastUpdated}</span></label>
            </div>
          </div>
        ) : (
          <div className="edit-form">
            <div className="form-group">
              <label>{t('common.description')}:</label>
              <textarea 
                name="description" 
                value={editedShot.description} 
                onChange={handleChange}
              ></textarea>
            </div>
            <div className="form-group">
              <label>{t('common.notes')}:</label>
              <textarea 
                name="notes" 
                value={editedShot.notes} 
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        )}
      </div>

      {/* Kamera Setup Header */}
      <div className="camera-setup-header card">
        <h2>{t('section.cameraSetup')}</h2>
        <div className="setup-tabs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Array.from({ length: ((isEditing ? (editedShot.additionalCameraSetups?.length || 0) : (shot.additionalCameraSetups?.length || 0)) + 1) }).map((_, i) => (
            <button
              key={`setup-tab-${i}`}
              type="button"
              className={`btn ${selectedSetupIndex === i ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedSetupIndex(i)}
            >
              {`Setup ${getSetupLabel(i)}`}
            </button>
          ))}
          {isEditing && (
            <button type="button" className="btn btn-secondary" onClick={handleAddCameraSetup}>
              Setup hinzufügen
            </button>
          )}
        </div>
      </div>

      {/* Camera Settings */}
      <div className="camera-settings card">
        <h2>{t('section.cameraSettings')}</h2>
        {!isEditing ? (
          <div className="info-grid">
            <div className="info-item">
              <label><strong>{t('camera.manufacturer')}</strong>: <span className="info-value">{currentShotCameraSettings.manufacturer || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('camera.model')}</strong>: <span className="info-value">{currentShotCameraSettings.model}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('camera.iso')}</strong>: <span className="info-value">{currentShotCameraSettings.iso}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('camera.format')}</strong>: <span className="info-value">{
                currentShotCameraSettings.format
                  ? formatFormatDisplay(
                      currentShotCameraSettings.format,
                      currentShotCameraSettings.manufacturer,
                      getModelKey(
                        currentShotCameraSettings.manufacturer,
                        currentShotCameraSettings.model
                      )
                    )
                  : t('common.notAvailable')
              }</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('camera.codec')}</strong>: <span className="info-value">{currentShotCameraSettings.codec || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('camera.colorSpace')}</strong>: <span className="info-value">{currentShotCameraSettings.colorSpace || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('camera.wb')}</strong>: <span className="info-value">{
                currentShotCameraSettings.whiteBalance === 'Manuell'
                  ? (
                      currentShotCameraSettings.manualWhiteBalance
                        ? `${t('common.manual')} (${currentShotCameraSettings.manualWhiteBalance})`
                        : t('common.manual')
                    )
                  : (currentShotCameraSettings.whiteBalance || t('common.notAvailable'))
              }</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('camera.framerate')}</strong>: <span className="info-value">{currentShotCameraSettings.framerate || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('camera.shutterAngle')}</strong>: <span className="info-value">{currentShotCameraSettings.shutterAngle || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('camera.imageStabilization')}</strong>: <span className="info-value">{currentShotCameraSettings.imageStabilization || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('camera.ndFilter')}</strong>: <span className="info-value">{currentShotCameraSettings.ndFilter || t('common.notAvailable')}</span></label>
            </div>
          </div>
        ) : (
          <div className="edit-form">
            <div className="form-row">
              <div className="form-group">
                <label>{t('camera.manufacturer')}:</label>
                <select 
                  name="manufacturer" 
                  value={selectedManufacturer} 
                  onChange={handleManufacturerChange}
                >
                  <option value="">{t('camera.selectManufacturer')}</option>
                  {getManufacturers().map(manufacturer => (
                    <option key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('camera.model')}:</label>
                <select 
                  name="model" 
                  value={selectedModel} 
                  onChange={handleModelChange}
                  disabled={!selectedManufacturer}
                >
                  <option value="">{t('camera.selectModel')}</option>
                  {availableModels.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>{t('camera.format')}:</label>
                <select 
                  name="format" 
                  value={currentEditedCameraSettings.format || ''} 
                  onChange={handleCameraChange}
                  disabled={!selectedModel}
                >
                  <option value="">{t('camera.selectFormat')}</option>
                  {availableFormats.map(format => (
                    <option key={format} value={format}>
                      {formatFormatDisplay(format, selectedManufacturer, selectedModel)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('camera.codec')}:</label>
                <select 
                  name="codec" 
                  value={currentEditedCameraSettings.codec || ''} 
                  onChange={handleCameraChange}
                  disabled={!selectedModel}
                >
                  <option value="">{t('camera.selectCodec')}</option>
                  {availableCodecs.map(codec => (
                    <option key={codec} value={codec}>
                      {codec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>{t('camera.colorSpace')}:</label>
                <select 
                  name="colorSpace" 
                  value={currentEditedCameraSettings.colorSpace || ''} 
                  onChange={handleCameraChange}
                  disabled={!selectedModel}
                >
                  <option value="">{t('camera.selectColorSpace')}</option>
                  {availableColorSpaces.map(colorSpace => (
                    <option key={colorSpace} value={colorSpace}>
                      {colorSpace}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('camera.wb')}:</label>
                <select 
                  name="whiteBalance" 
                  value={currentEditedCameraSettings.whiteBalance || ''} 
                  onChange={handleCameraChange}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="Auto">{t('common.auto')}</option>
                  <option value="Tageslicht (5600K)">{t('camera.wbOptions.daylight5600')}</option>
                  <option value="Kunstlicht (3200K)">{t('camera.wbOptions.tungsten3200')}</option>
                  <option value="Leuchtstoff">{t('camera.wbOptions.fluorescent')}</option>
                  <option value="Bewölkt">{t('camera.wbOptions.cloudy')}</option>
                  <option value="Schatten">{t('camera.wbOptions.shade')}</option>
                  <option value="Manuell">{t('common.manual')}</option>
                </select>
                {currentEditedCameraSettings.whiteBalance === 'Manuell' && (
                  <input 
                    type="text"
                    name="manualWhiteBalance"
                    placeholder={t('camera.manualWBPlaceholder')}
                    value={currentEditedCameraSettings.manualWhiteBalance || ''}
                    onChange={handleCameraChange}
                    style={{ marginTop: '8px' }}
                  />
                )}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>{t('camera.iso')}:</label>
                <select 
                  name="isoSelection" 
                  value={currentEditedCameraSettings.isoSelection || currentEditedCameraSettings.iso || ''} 
                  onChange={handleISOSelectChange}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="100">100</option>
                  <option value="125">125</option>
                  <option value="160">160</option>
                  <option value="200">200</option>
                  <option value="250">250</option>
                  <option value="320">320</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                  <option value="640">640</option>
                  <option value="800">800</option>
                  <option value="1000">1000</option>
                  <option value="1250">1250</option>
                  <option value="1600">1600</option>
                  <option value="2000">2000</option>
                  <option value="2500">2500</option>
                  <option value="3200">3200</option>
                  <option value="4000">4000</option>
                  <option value="5000">5000</option>
                  <option value="6400">6400</option>
                  <option value="Custom">Custom</option>
                </select>
                {currentEditedCameraSettings.isoSelection === 'Custom' && (
                  <input 
                    type="text"
                    name="manualISO"
                    placeholder={t('camera.manualISOPlaceholder')}
                    value={currentEditedCameraSettings.manualISO || currentEditedCameraSettings.iso || ''}
                    onChange={handleManualISOChange}
                    style={{ marginTop: '8px' }}
                  />
                )}
              </div>
              <div className="form-group">
                <label>{t('camera.framerate')}:</label>
                <select 
                  name="framerate" 
                  value={currentEditedCameraSettings.framerate || ''} 
                  onChange={handleCameraChange}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="23.98 fps">23.98 fps</option>
                  <option value="24 fps">24 fps</option>
                  <option value="25 fps">25 fps</option>
                  <option value="29.97 fps">29.97 fps</option>
                  <option value="30 fps">30 fps</option>
                  <option value="50 fps">50 fps</option>
                  <option value="59.94 fps">59.94 fps</option>
                  <option value="60 fps">60 fps</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
               <div className="form-group">
                <label>{t('camera.shutterAngle')}:</label>
                <select 
                  name="shutterAngle" 
                  value={currentEditedCameraSettings.shutterAngle || ''} 
                  onChange={handleCameraChange}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="45°">45°</option>
                  <option value="90°">90°</option>
                  <option value="180°">180°</option>
                  <option value="270°">270°</option>
                  <option value="360°">360°</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('camera.imageStabilization')}:</label>
                <select 
                  name="imageStabilization" 
                  value={currentEditedCameraSettings.imageStabilization || ''} 
                  onChange={handleCameraChange}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="Aus">{t('camera.imageStabilizationOptions.off')}</option>
                  <option value="Standard">{t('camera.imageStabilizationOptions.standard')}</option>
                  <option value="Aktiv">{t('camera.imageStabilizationOptions.active')}</option>
                  <option value="Boost">{t('camera.imageStabilizationOptions.boost')}</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>{t('camera.ndFilter')}:</label>
                <select 
                  name="ndFilter" 
                  value={currentEditedCameraSettings.ndFilter || ''} 
                  onChange={handleCameraChange}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="Kein">{t('camera.ndFilterOptions.none')}</option>
                  <option value="ND 0.3 (1 Stop)">{t('camera.ndFilterOptions.nd03_1Stop')}</option>
                  <option value="ND 0.6 (2 Stops)">{t('camera.ndFilterOptions.nd06_2Stops')}</option>
                  <option value="ND 0.9 (3 Stops)">{t('camera.ndFilterOptions.nd09_3Stops')}</option>
                  <option value="ND 1.2 (4 Stops)">{t('camera.ndFilterOptions.nd12_4Stops')}</option>
                  <option value="ND 1.5 (5 Stops)">{t('camera.ndFilterOptions.nd15_5Stops')}</option>
                  <option value="ND 1.8 (6 Stops)">{t('camera.ndFilterOptions.nd18_6Stops')}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lens Settings */}
      <div className="lens-settings card">
        <h2>{t('section.lensSettings')}</h2>
        {!isEditing ? (
          <div className="info-grid">
            <div className="info-item">
              <label><strong>{t('lens.manufacturer')}</strong>: <span className="info-value">{currentShotCameraSettings.lensManufacturer || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('lens.lens')}</strong>: <span className="info-value">{currentShotCameraSettings.lens || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('lens.focalLengthZoom')}</strong>: <span className="info-value">{currentShotCameraSettings.focalLength || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('lens.aperture')}</strong>: <span className="info-value">{currentShotCameraSettings.aperture || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('lens.focusDistance')}</strong>: <span className="info-value">{currentShotCameraSettings.focusDistance || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('lens.hyperfocalDistance')}</strong>: <span className="info-value">{currentShotCameraSettings.hyperfocalDistance || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('lens.lensStabilization')}</strong>: <span className="info-value">{currentShotCameraSettings.lensStabilization || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item anamorphic-info">
              <label id="anamorphic-readonly-label"><strong>{t('lens.anamorphic')}</strong>:</label>
              <div className="checkbox-display">
                <input
                  type="checkbox"
                  id="anamorphic-readonly"
                  aria-labelledby="anamorphic-readonly-label"
                  checked={!!currentShotCameraSettings.isAnamorphic}
                  readOnly
                  disabled
                />
              </div>
            </div>
            <div className="info-item">
              <label><strong>{t('lens.filter')}</strong>: <span className="info-value">{
                (currentShotCameraSettings?.filters && currentShotCameraSettings.filters.length > 0)
                  ? currentShotCameraSettings.filters.join(', ')
                  : (currentShotCameraSettings?.filter || t('common.notAvailable'))
              }</span></label>
            </div>
          </div>
        ) : (
          <div className="edit-form">
            <div className="form-row">
              <div className="form-group">
                <label>{t('lens.manufacturer')}:</label>
                <select 
                  name="lensManufacturer" 
                  value={selectedLensManufacturer} 
                  onChange={handleLensManufacturerChange}
                >
                  <option value="">{t('lens.selectManufacturer')}</option>
                  {(isAnamorphicEnabled ? getAnamorphicLensManufacturers() : getLensManufacturers()).map(manufacturer => (
                    <option key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('lens.lens')}:</label>
                <select 
                  name="lens" 
                  value={selectedLens} 
                  onChange={handleLensChange}
                  disabled={!selectedLensManufacturer}
                >
                  <option value="">{t('common.select')}</option>
                  {availableLenses.map(lens => (
                    <option key={lens} value={lens}>
                      {lens}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <div className="checkbox-group">
                  <input 
                    type="checkbox" 
                    id="anamorphic"
                    checked={isAnamorphicEnabled}
                    onChange={handleAnamorphicToggle}
                  />
                  <label htmlFor="anamorphic">{t('lens.anamorphic')}</label>
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>{t('lens.focalLengthZoom')}:</label>
                <input 
                  type="text" 
                  name="focalLength" 
                  value={currentEditedCameraSettings.focalLength || ''} 
                  onChange={handleCameraChange}
                  placeholder="z.B. 24-70mm oder 50mm"
                />
              </div>
              <div className="form-group">
                <label>{t('lens.aperture')}:</label>
                <input 
                  type="text" 
                  name="aperture" 
                  value={currentEditedCameraSettings.aperture || ''} 
                  onChange={handleCameraChange}
                  placeholder={t('lens.aperturePlaceholder')}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>{t('lens.focus')}:</label>
                <input 
                  type="text" 
                  name="focusDistance" 
                  value={currentEditedCameraSettings.focusDistance || ''} 
                  onChange={handleCameraChange}
                  placeholder={t('lens.focusDistancePlaceholder')}
                />
              </div>
              <div className="form-group">
                <label>{t('lens.hyperfocalDistance')}:</label>
                <input 
                  type="text" 
                  name="hyperfocalDistance" 
                  value={currentEditedCameraSettings.hyperfocalDistance || ''} 
                  onChange={handleCameraChange}
                  placeholder={t('lens.hyperfocalPlaceholder')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('lens.lensStabilization')}:</label>
                <select 
                  name="lensStabilization" 
                  value={currentEditedCameraSettings.lensStabilization || ''}
                  onChange={handleCameraChange}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="Aus">{t('common.off')}</option>
                  <option value="An">{t('common.on')}</option>
                </select>
              </div>
            </div>

            {/* Mehrfach-Filter Auswahl (Objektiv) */}
            <div className="form-row">
              <div className="form-group">
                <label>{t('lens.addFilter')}:</label>
                <select 
                  name="filters"
                  value={filterToAdd}
                  onChange={handleFilterSelectChange}
                >
                  <option value="">{t('common.select')}</option>
                  {getAllFilters().map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ alignSelf: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={handleAddFilter}>
                  {t('action.add')}
                </button>
              </div>
            </div>
            {selectedFilters.length > 0 && (
              <div className="form-group">
                <div className="selected-filters">
                  {selectedFilters.map(f => (
                    <span key={f} className="filter-chip">
                      {f}
                      <button type="button" className="chip-remove" onClick={() => handleRemoveFilter(f)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Camera Movement */}
      <div className="camera-movement card">
        <h2>{t('section.cameraMovement')}</h2>
        {!isEditing ? (
          <div className="info-grid">
            <div className="info-item">
              <label><strong>{t('movement.movement')}</strong>: <span className="info-value">{currentShotCameraMovement?.movementType
                ? movementTypeLabel(currentShotCameraMovement.movementType) + (currentShotCameraMovement?.direction ? ` (${directionLabel(currentShotCameraMovement.direction)})` : '')
                : t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('movement.speed')}</strong>: <span className="info-value">{currentShotCameraMovement?.speed || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item">
              <label><strong>{t('movement.cameraHeight')}</strong>: <span className="info-value">{currentShotCameraMovement?.cameraHeight || t('common.notAvailable')}</span></label>
            </div>
            <div className="info-item" style={{ width: '100%' }}>
              <label><strong>{t('movement.dollySetup')}</strong>: <span className="info-value">{[
                currentShotCameraMovement?.dollySetup?.trackType,
                currentShotCameraMovement?.dollySetup?.trackLength,
                currentShotCameraMovement?.dollySetup?.headType,
                currentShotCameraMovement?.dollySetup?.mount
              ].filter(Boolean).join(' • ') || t('common.notAvailable')}</span></label>
            </div>
            {currentShotCameraMovement?.notes && (
              <div className="info-item" style={{ width: '100%' }}>
                <label><strong>{t('common.notes')}</strong>: <span className="info-value">{currentShotCameraMovement.notes}</span></label>
              </div>
            )}
          </div>
        ) : (
          <div className="edit-form">
            <div className="form-row">
              <div className="form-group">
                <label>{t('movement.type')}:</label>
                <select
                  value={currentEditedCameraMovement?.movementType || ''}
                  onChange={(e) => handleCameraMovementChange('movementType', e.target.value)}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="Dolly">{t('movement.typeOptions.dolly')}</option>
                  <option value="Slider">{t('movement.typeOptions.slider')}</option>
                  <option value="Crane">{t('movement.typeOptions.craneJib')}</option>
                  <option value="Gimbal">{t('movement.typeOptions.gimbal')}</option>
                  <option value="Steadicam">{t('movement.typeOptions.steadicam')}</option>
                  <option value="Handheld">{t('movement.typeOptions.handheld')}</option>
                  <option value="Tripod">{t('movement.typeOptions.tripodStatic')}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('movement.direction')}:</label>
                <select
                  value={currentEditedCameraMovement?.direction || ''}
                  onChange={(e) => handleCameraMovementChange('direction', e.target.value)}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="Vorwärts">{t('movement.directionOptions.forward')}</option>
                  <option value="Rückwärts">{t('movement.directionOptions.backward')}</option>
                  <option value="Seitwärts">{t('movement.directionOptions.sideways')}</option>
                  <option value="Kreis">{t('movement.directionOptions.circle')}</option>
                  <option value="Hoch">{t('movement.directionOptions.up')}</option>
                  <option value="Runter">{t('movement.directionOptions.down')}</option>
                  <option value="Diagonal">{t('movement.directionOptions.diagonal')}</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('movement.speed')}:</label>
                <input
                  type="text"
                  placeholder={t('movement.speedPlaceholder')}
                  value={currentEditedCameraMovement?.speed || ''}
                  onChange={(e) => handleCameraMovementChange('speed', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('movement.cameraHeight')}:</label>
                <input
                  type="text"
                  placeholder={t('movement.cameraHeightPlaceholder')}
                  value={currentEditedCameraMovement?.cameraHeight || ''}
                  onChange={(e) => handleCameraMovementChange('cameraHeight', e.target.value)}
                />
              </div>
            </div>

            {/* Dolly Setup */}
            <div className="form-row">
              <div className="form-group">
                <label>{t('movement.trackType')}:</label>
                <select
                  value={currentEditedCameraMovement?.dollySetup?.trackType || ''}
                  onChange={(e) => handleCameraMovementNestedChange('dollySetup', 'trackType', e.target.value)}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="Gerade">{t('movement.trackTypeStraight')}</option>
                  <option value="Kurve">{t('movement.trackTypeCurve')}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('movement.trackLength')}:</label>
                <input
                  type="text"
                  placeholder={t('movement.trackLengthPlaceholder')}
                  value={currentEditedCameraMovement?.dollySetup?.trackLength || ''}
                  onChange={(e) => handleCameraMovementNestedChange('dollySetup', 'trackLength', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('movement.head')}:</label>
                <select
                  value={currentEditedCameraMovement?.dollySetup?.headType || ''}
                  onChange={(e) => handleCameraMovementNestedChange('dollySetup', 'headType', e.target.value)}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="Fluid">{t('movement.headFluid')}</option>
                  <option value="Gearhead">{t('movement.headGearhead')}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('movement.mount')}:</label>
                <input
                  type="text"
                  placeholder={t('movement.mountPlaceholder')}
                  value={currentEditedCameraMovement?.dollySetup?.mount || ''}
                  onChange={(e) => handleCameraMovementNestedChange('dollySetup', 'mount', e.target.value)}
                />
              </div>
            </div>

            {/* Weitere Setups optional */}
            <div className="form-row">
              <div className="form-group">
                <label>{t('movement.sliderLength')}:</label>
                <input
                  type="text"
                  placeholder={t('movement.sliderLengthPlaceholder')}
                  value={currentEditedCameraMovement?.sliderSetup?.length || ''}
                  onChange={(e) => handleCameraMovementNestedChange('sliderSetup', 'length', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('movement.sliderOrientation')}:</label>
                <select
                  value={currentEditedCameraMovement?.sliderSetup?.orientation || ''}
                  onChange={(e) => handleCameraMovementNestedChange('sliderSetup', 'orientation', e.target.value)}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="Horizontal">{t('movement.orientationHorizontal')}</option>
                  <option value="Vertikal">{t('movement.orientationVertical')}</option>
                  <option value="Diagonal">{t('movement.orientationDiagonal')}</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('movement.jibArmLength')}:</label>
                <input
                  type="text"
                  placeholder={t('movement.armLengthPlaceholder')}
                  value={currentEditedCameraMovement?.craneSetup?.armLength || ''}
                  onChange={(e) => handleCameraMovementNestedChange('craneSetup', 'armLength', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('movement.mountCraneJib')}:</label>
                <input
                  type="text"
                  placeholder={t('movement.mountingPlaceholder')}
                  value={currentEditedCameraMovement?.craneSetup?.mounting || ''}
                  onChange={(e) => handleCameraMovementNestedChange('craneSetup', 'mounting', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('movement.panDegrees')}:</label>
                <input
                  type="text"
                  placeholder={t('movement.panPlaceholder')}
                  value={currentEditedCameraMovement?.panTilt?.pan || ''}
                  onChange={(e) => handleCameraMovementNestedChange('panTilt', 'pan', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('movement.tiltDegrees')}:</label>
                <input
                  type="text"
                  placeholder={t('movement.tiltPlaceholder')}
                  value={currentEditedCameraMovement?.panTilt?.tilt || ''}
                  onChange={(e) => handleCameraMovementNestedChange('panTilt', 'tilt', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ width: '100%' }}>
                <label>{t('common.notes')}:</label>
                <textarea
                  placeholder={t('movement.notesPlaceholder')}
                  value={currentEditedCameraMovement?.notes || ''}
                  onChange={(e) => handleCameraMovementChange('notes', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VFX Aufgaben */}
      <div className="vfx-preparations card">
        <h2>{t('section.vfxTasks')}</h2>
        {!isEditing ? (
          <div className="vfx-checklist">
            <div className="vfx-item">
              <input
                type="checkbox"
                id="cleanplates-readonly"
                checked={!!shot.vfxPreparations?.cleanplates}
                readOnly
                disabled
              />
              <label htmlFor="cleanplates-readonly">{t('vfx.checklist.cleanplates')}</label>
              {/* localized text only; value remains boolean */}
              
            </div>
            <div className="vfx-item">
              <input
                type="checkbox"
                id="hdris-readonly"
                checked={!!shot.vfxPreparations?.hdris}
                readOnly
                disabled
              />
              <label htmlFor="hdris-readonly">{t('vfx.checklist.hdris')}</label>
            </div>
            <div className="vfx-item">
              <input
                type="checkbox"
                id="setReferences-readonly"
                checked={!!shot.vfxPreparations?.setReferences}
                readOnly
                disabled
              />
              <label htmlFor="setReferences-readonly">{t('vfx.checklist.setReferences')}</label>
            </div>
            <div className="vfx-item">
              <input
                type="checkbox"
                id="chromeBall-readonly"
                checked={!!shot.vfxPreparations?.chromeBall}
                readOnly
                disabled
              />
              <label htmlFor="chromeBall-readonly">{t('vfx.checklist.chromeBall')}</label>
            </div>
            <div className="vfx-item">
              <input
                type="checkbox"
                id="grayBall-readonly"
                checked={!!shot.vfxPreparations?.grayBall}
                readOnly
                disabled
              />
              <label htmlFor="grayBall-readonly">{t('vfx.checklist.grayBall')}</label>
            </div>
            <div className="vfx-item">
              <input
                type="checkbox"
                id="colorChecker-readonly"
                checked={!!shot.vfxPreparations?.colorChecker}
                readOnly
                disabled
              />
              <label htmlFor="colorChecker-readonly">{t('vfx.checklist.colorChecker')}</label>
            </div>
            <div className="vfx-item">
              <input
                type="checkbox"
                id="distortionGrids-readonly"
                checked={!!shot.vfxPreparations?.distortionGrids}
                readOnly
                disabled
              />
              <label htmlFor="distortionGrids-readonly">{t('vfx.checklist.distortionGrids')}</label>
            </div>
            <div className="vfx-item">
              <input
                type="checkbox"
                id="measurementsTaken-readonly"
                checked={!!shot.vfxPreparations?.measurementsTaken}
                readOnly
                disabled
              />
              <label htmlFor="measurementsTaken-readonly">{t('vfx.checklist.measurementsTaken')}</label>
            </div>
            <div className="vfx-item">
              <input
                type="checkbox"
                id="threeDScans-readonly"
                checked={!!shot.vfxPreparations?.threeDScans}
                readOnly
                disabled
              />
              <label htmlFor="threeDScans-readonly">{t('vfx.checklist.threeDScans')}</label>
            </div>
          </div>
        ) : (
          <div className="vfx-edit-form">
            <div className="vfx-checkboxes">
              <div className="vfx-checkbox-item">
                <input 
                  type="checkbox" 
                  id="cleanplates"
                  name="cleanplates"
                  checked={editedShot.vfxPreparations?.cleanplates || false}
                  onChange={handleVFXChange}
                />
                <label htmlFor="cleanplates">{t('vfx.checklist.cleanplates')}</label>
              </div>
              <div className="vfx-checkbox-item">
                <input 
                  type="checkbox" 
                  id="hdris"
                  name="hdris"
                  checked={editedShot.vfxPreparations?.hdris || false}
                  onChange={handleVFXChange}
                />
                <label htmlFor="hdris">{t('vfx.checklist.hdris')}</label>
              </div>
              <div className="vfx-checkbox-item">
                <input 
                  type="checkbox" 
                  id="setReferences"
                  name="setReferences"
                  checked={editedShot.vfxPreparations?.setReferences || false}
                  onChange={handleVFXChange}
                />
                <label htmlFor="setReferences">{t('vfx.checklist.setReferences')}</label>
              </div>
              <div className="vfx-checkbox-item">
                <input 
                  type="checkbox" 
                  id="chromeBall"
                  name="chromeBall"
                  checked={editedShot.vfxPreparations?.chromeBall || false}
                  onChange={handleVFXChange}
                />
                <label htmlFor="chromeBall">{t('vfx.checklist.chromeBall')}</label>
              </div>
              <div className="vfx-checkbox-item">
                <input 
                  type="checkbox" 
                  id="grayBall"
                  name="grayBall"
                  checked={editedShot.vfxPreparations?.grayBall || false}
                  onChange={handleVFXChange}
                />
                <label htmlFor="grayBall">{t('vfx.checklist.grayBall')}</label>
              </div>
              <div className="vfx-checkbox-item">
                <input 
                  type="checkbox" 
                  id="colorChecker"
                  name="colorChecker"
                  checked={editedShot.vfxPreparations?.colorChecker || false}
                  onChange={handleVFXChange}
                />
                <label htmlFor="colorChecker">{t('vfx.checklist.colorChecker')}</label>
              </div>
              <div className="vfx-checkbox-item">
                <input 
                  type="checkbox" 
                  id="distortionGrids"
                  name="distortionGrids"
                  checked={editedShot.vfxPreparations?.distortionGrids || false}
                  onChange={handleVFXChange}
                />
                <label htmlFor="distortionGrids">{t('vfx.checklist.distortionGrids')}</label>
              </div>
              <div className="vfx-checkbox-item">
                <input 
                  type="checkbox" 
                  id="measurementsTaken"
                  name="measurementsTaken"
                  checked={editedShot.vfxPreparations?.measurementsTaken || false}
                  onChange={handleVFXChange}
                />
                <label htmlFor="measurementsTaken">{t('vfx.checklist.measurementsTaken')}</label>
              </div>
              <div className="vfx-checkbox-item">
                <input 
                  type="checkbox" 
                  id="threeDScans"
                  name="threeDScans"
                  checked={editedShot.vfxPreparations?.threeDScans || false}
                  onChange={handleVFXChange}
                />
                <label htmlFor="threeDScans">{t('vfx.checklist.threeDScans')}</label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* References */}
      <div className="references card">
        <h2>Referenzen</h2>
        {/* Skalierungs-Slider entfernt, Bilder passen sich automatisch an */}
        {/* Drei Abschnitte mit Überschriften und Upload-Button je Abschnitt */}
        <div className="references-sections">
          {(() => {
            const sections = [
              { key: 'set-fotos', title: 'SETFOTOS' },
              { key: 'hdri', title: 'HDRI' },
              { key: 'setup-fotos', title: 'Setup Fotos' }
            ];
            return sections.map(section => {
              const refsForCat = references.filter(ref => ref.category === section.key);
              const tiles = [];
              for (let i = 0; i < 3; i++) {
                const ref = refsForCat[i];
                if (ref) {
                  if (typeof ref === 'string') {
                    tiles.push({ key: `grid-${section.key}-${i}-${ref}`, url: dummyReference, name: ref });
                  } else {
                    tiles.push({ key: `grid-${section.key}-${i}-${ref.id}`, url: ref.url, name: ref.name });
                  }
                } else {
                  tiles.push({ key: `grid-${section.key}-dummy-${i}`, url: dummyReference, name: `${section.title} ${i+1}` });
                }
              }
              return (
                <div className="references-section" key={`section-${section.key}`}>
                  <div className="references-section-header">
                    <h3 className="references-section-title">{section.title}</h3>
                    {isEditing && (
                      <>
                        <label 
                          htmlFor={`reference-upload-${section.key}`} 
                          className="btn-outline references-upload-btn"
                        >
                          Fotos hinzufügen
                        </label>
                        <input
                          id={`reference-upload-${section.key}`}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleReferenceUploadFor(section.key)}
                          style={{ display: 'none' }}
                        />
                      </>
                    )}
                  </div>
                  <div className="references-subgrid">
                    {tiles.map(tile => (
                      <div className="reference-item" key={tile.key}>
                        <div className="reference-image-container">
                          <img src={tile.url} alt={tile.name} className="reference-image" />
                          <div className="reference-info">
                            <span className="reference-name">{tile.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

export default ShotDetails;