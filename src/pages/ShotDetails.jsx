import { useState, useEffect, useMemo } from 'react';
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
  formatFormatDisplay,
  getFrameratesByCodec
} from '../data/cameraDatabase';
import { 
  lensDatabase, 
  getLensManufacturers, 
  getLensesByManufacturer,
  getLensFullName,
  getAnamorphicLensManufacturers,
  getAnamorphicLensesByManufacturer,
  getLensMeta,
  isZoomLens
} from '../data/lensDatabase';
import { 
  getAllFilters,
  getFiltersByCategory
} from '../data/filterDatabase';
import { commonLuts, getViewerLutsForManufacturer } from '../data/lutDatabase';
import { 
  calculateAllFOV, 
  formatFOVDisplay,
  parseSensorSize,
  calculateHorizontalFOV,
  calculateVerticalFOV,
  calculateDiagonalFOV,
  extractAnamorphicFactor,
  extractFocalLength
} from '../utils/fovCalculator';
import { getPresets } from './CameraSettings';
import { 
  loadShotFromFile, 
  saveShotToFile, 
  autoSaveShotToFile,
  shotFileExists,
  compactShotForIndex,
  compactProjectsForStorage,
  trySetLocalStorage 
} from '../utils/shotFileManager';
import { maybeAutoBackup } from '../utils/versioningManager';
import { exportShotToPDF, savePDF } from '../utils/pdfExporter';
import storyboard1 from '../assets/storyboard-scribble-1.svg';
import storyboard2 from '../assets/storyboard-scribble-2.svg';
import storyboard3 from '../assets/storyboard-scribble-3.svg';
import storyboard4 from '../assets/storyboard-scribble-4.svg';
import dummyReference from '../assets/dummy-reference.svg';
import { useLanguage } from '../contexts/LanguageContext';
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash } from 'react-icons/fi';
import InlineSensorPreview from '../components/InlineSensorPreview';
import ImageAnnotatorModal from '../components/ImageAnnotatorModal';
// Vollständiger FOV‑Rechner als eingebettete Komponente für Objektiv‑Einstellungen
import EmbeddedFovCalculator from '../components/EmbeddedFovCalculator';
import { bridge } from '../utils/cameraControlBridge';

const ShotDetails = () => {
  // Helper: deterministische Platzhalter‑Thumbnails für Referenzen
  const hashSeed = (s) => [...String(s)].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const makeLocalPlaceholderDataUrl = (seed, width = 640, height = 360) => {
    const label = (() => {
      if (/vfx-cleanplates/.test(seed)) return 'Cleanplate';
      if (/vfx-set-references/.test(seed)) return 'Set Reference';
      if (/vfx-chrome-ball/.test(seed)) return 'Chrome Ball';
      if (/vfx-gray-ball/.test(seed)) return 'Grey Ball';
      if (/vfx-color-checker/.test(seed)) return 'Color Checker';
      if (/vfx-distortion-grids/.test(seed)) return 'Distortion Grid';
      if (/vfx-measurements/.test(seed)) return 'Measurements';
      if (/vfx-3d-scans/.test(seed)) return '3D Scan';
      if (/hdri/.test(seed)) return 'HDRI';
      return 'Reference';
    })();
    const bg = '#1f2937';
    const fg = '#9ca3af';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'><rect width='100%' height='100%' fill='${bg}' /><text x='50%' y='50%' fill='${fg}' font-family='system-ui, sans-serif' font-size='${Math.round(height*0.1)}' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const makeRealImageUrl = (seed, width = 640, height = 360) => {
    const lock = Math.abs(hashSeed(seed)) % 1000;
    const scenarioTags = (localStorage.getItem('filmScenarioTags') || 'city,night,rain,street').trim();
    let tags = scenarioTags || 'film,set';
    const withScenario = (extra) => scenarioTags ? `${scenarioTags},${extra}` : extra;
    if (/vfx-cleanplates/.test(seed)) tags = withScenario('street,night,cleanplate');
    else if (/vfx-set-references/.test(seed)) tags = withScenario('behind-the-scenes,lighting,set');
    else if (/vfx-chrome-ball/.test(seed)) tags = withScenario('reflection,sphere,studio');
    else if (/vfx-gray-ball/.test(seed)) tags = withScenario('gray,ball,lighting');
    else if (/vfx-color-checker/.test(seed)) tags = withScenario('color,chart,reference');
    else if (/vfx-distortion-grids/.test(seed)) tags = withScenario('grid,checkerboard,lens');
    else if (/vfx-measurements/.test(seed)) tags = withScenario('ruler,measure,tape');
    else if (/vfx-3d-scans/.test(seed)) tags = withScenario('3d,scan,mesh');
    else if (/hdri/.test(seed)) tags = withScenario('skyline,panorama,city');
    // Use local placeholder to avoid external image errors
    return makeLocalPlaceholderDataUrl(seed, width, height);
  };
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // HDRI Bracket (Beta): read latest camera bracket session from localStorage and sync via event
  const [latestBracket, setLatestBracket] = useState(null);
  const [cameraBridgeUrl, setCameraBridgeUrl] = useState((typeof window !== 'undefined' && localStorage.getItem('cameraBridgeUrl')) || 'http://localhost:8080');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cameraBracketLatest');
      setLatestBracket(raw ? JSON.parse(raw) : null);
    } catch {
      setLatestBracket(null);
    }
    const onUpdated = () => {
      try {
        const raw = localStorage.getItem('cameraBracketLatest');
        setLatestBracket(raw ? JSON.parse(raw) : null);
      } catch {}
    };
    window.addEventListener('camera-bracket-updated', onUpdated);
    return () => window.removeEventListener('camera-bracket-updated', onUpdated);
  }, []);

  const handleHdrUpload = (index, s, e) => {
    const file = e.target?.files?.[0];
    const sid = latestBracket?.session?.id;
    if (!file || !sid) return;
    bridge.uploadBracketImage(sid, s.ev, file)
      .then((resp) => {
        const full = resp?.full;
        if (!full) return;
        setLatestBracket((prev) => {
          const arr = (prev?.results || []).slice();
          arr[index] = { ...arr[index], full };
          const next = { session: prev?.session, results: arr, timestamp: Date.now() };
          try { localStorage.setItem('cameraBracketLatest', JSON.stringify(next)); } catch {}
          return next;
        });
      })
      .catch((err) => console.error('HDR upload in ShotDetails failed:', err));
  };

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
      'Down': 'down'
    };
    return d && map[d] ? t(`movement.directionOptions.${map[d]}`) : (d || '');
  };
  
  const [shot, setShot] = useState(null);
  const [editedShot, setEditedShot] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [references, setReferences] = useState([]);
const [annotatorState, setAnnotatorState] = useState({ open: false, refId: null, imageUrl: null, title: '', kind: null });
  const [selectedCategory, setSelectedCategory] = useState('set-fotos');
  
  // Camera state
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [availableFormats, setAvailableFormats] = useState([]);
  const [availableCodecs, setAvailableCodecs] = useState([]);
  const [availableColorSpaces, setAvailableColorSpaces] = useState([]);
  const [availableFramerates, setAvailableFramerates] = useState([]);
  const [availableLuts, setAvailableLuts] = useState(getViewerLutsForManufacturer(''));
  
  // Lens state
  const [selectedLensManufacturer, setSelectedLensManufacturer] = useState('');
  const [selectedLens, setSelectedLens] = useState('');
  const [availableLenses, setAvailableLenses] = useState([]);
  const [isAnamorphicEnabled, setIsAnamorphicEnabled] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filterToAdd, setFilterToAdd] = useState('');
  const [ctoToAdd, setCtoToAdd] = useState('');
  const [ctbToAdd, setCtbToAdd] = useState('');
  const [greenToAdd, setGreenToAdd] = useState('');
  const [selectedSetupIndex, setSelectedSetupIndex] = useState(0);

  // Einklapp-/Ausklapp-Status für Bearbeitungsansicht
  const [isCameraSettingsCollapsed, setCameraSettingsCollapsed] = useState(false);
  const [isLensSettingsCollapsed, setLensSettingsCollapsed] = useState(false);
  const [isCameraMovementCollapsed, setCameraMovementCollapsed] = useState(false);
  const [isVfxTasksCollapsed, setVfxTasksCollapsed] = useState(false);
  const [isReferencesCollapsed, setReferencesCollapsed] = useState(false);

  // TAKES helpers
  const getShotBaseName = () => {
    const base = (editedShot?.name || shot?.name || `SH_${String(id).slice(-3)}`).trim();
    return base;
  };
  const getNextTakeVersion = () => {
    const existing = Array.isArray(editedShot?.takes) ? editedShot.takes : [];
    const maxVer = existing.reduce((m, t) => (typeof t.version === 'number' && t.version > m ? t.version : m), 0);
    return maxVer + 1;
  };
  const addTake = () => {
    const base = getShotBaseName();
    const nextVersion = getNextTakeVersion();
    const label = `${base}_TAKE ${String(nextVersion).padStart(3, '0')}`;
    const newTake = {
      id: Date.now(),
      name: label,
      version: nextVersion,
      note: '',
      changes: '',
      ratings: ['none', 'none', 'none']
    };
    const updatedShot = {
      ...editedShot,
      takes: [...(editedShot?.takes || []), newTake]
    };
    setEditedShot(updatedShot);
    autoSaveShotToFile(id, updatedShot);
  };
  const updateTakeNote = (takeId, value) => {
    const updatedTakes = (editedShot?.takes || []).map(t => t.id === takeId ? { ...t, note: value } : t);
    const updatedShot = { ...editedShot, takes: updatedTakes };
    setEditedShot(updatedShot);
    autoSaveShotToFile(id, updatedShot);
  };
  const updateTakeChanges = (takeId, value) => {
    const updatedTakes = (editedShot?.takes || []).map(t => t.id === takeId ? { ...t, changes: value } : t);
    const updatedShot = { ...editedShot, takes: updatedTakes };
    setEditedShot(updatedShot);
    autoSaveShotToFile(id, updatedShot);
  };
  const cycleColor = (c) => {
    if (c === 'none') return 'green';
    if (c === 'green') return 'yellow';
    if (c === 'yellow') return 'red';
    return 'none';
  };
  const toggleTakeRating = (takeId, index) => {
    const updatedTakes = (editedShot?.takes || []).map(t => {
      if (t.id !== takeId) return t;
      const next = [...(t.ratings || ['none', 'none', 'none'])];
      next[index] = cycleColor(next[index]);
      return { ...t, ratings: next };
    });
    const updatedShot = { ...editedShot, takes: updatedTakes };
    setEditedShot(updatedShot);
    autoSaveShotToFile(id, updatedShot);
  };
  const removeTake = (takeId) => {
    const updatedTakes = (editedShot?.takes || []).filter(t => t.id !== takeId);
    const updatedShot = { ...editedShot, takes: updatedTakes };
    setEditedShot(updatedShot);
    autoSaveShotToFile(id, updatedShot);
  };

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

  // FOV-Anzeige (Readonly) für aktuelles Setup
  const readonlyFovDisplay = useMemo(() => {
    try {
      const manufacturer = currentShotCameraSettings?.manufacturer;
      const fullModel = currentShotCameraSettings?.model;
      const format = currentShotCameraSettings?.format;
      const lensName = currentShotCameraSettings?.lens;
      const focalInput = currentShotCameraSettings?.focalLength;
      if (!manufacturer || !fullModel || !format || format === 'Manuell') return t('common.notAvailable');
      const shortModel = String(fullModel).replace(new RegExp(`^${manufacturer}\\s+`), '').trim();
      const sensorStr = getSensorSizeByFormat(manufacturer, shortModel, format);
      if (!sensorStr || sensorStr === 'Nicht verfügbar') return t('common.notAvailable');
      const sensor = parseSensorSize(sensorStr);
      if (!sensor) return t('common.notAvailable');
      let focal = 0;
      const parsed = parseFloat(String(focalInput || '').replace(',', '.'));
      if (!isNaN(parsed) && parsed > 0) focal = parsed;
      if (!focal) {
        const extracted = extractFocalLength(lensName || '');
        if (extracted && extracted > 0) focal = extracted;
      }
      if (!focal || focal <= 0) return t('common.notAvailable');
      let af = extractAnamorphicFactor(lensName || '');
      if ((currentShotCameraSettings?.isAnamorphic) && (!af || af <= 1)) af = 2;
      const h = calculateHorizontalFOV(focal, sensor.width * (af || 1));
      const v = calculateVerticalFOV(focal, sensor.height);
      const d = calculateDiagonalFOV(focal, sensor.width * (af || 1), sensor.height);
      return formatFOVDisplay({ horizontal: h, vertical: v, diagonal: d });
    } catch {
      return t('common.notAvailable');
    }
  }, [
    currentShotCameraSettings?.manufacturer,
    currentShotCameraSettings?.model,
    currentShotCameraSettings?.format,
    currentShotCameraSettings?.lens,
    currentShotCameraSettings?.focalLength,
    currentShotCameraSettings?.isAnamorphic,
    t
  ]);

  // Alle Setups (Readonly) für mehrspaltige Anzeige
  const allShotCameraSettings = [
    shot?.cameraSettings || {},
    ...(Array.isArray(shot?.additionalCameraSetups)
      ? shot.additionalCameraSetups.map(s => s?.cameraSettings || {})
      : [])
  ];
  const allShotCameraMovements = [
    shot?.cameraMovement || {},
    ...(Array.isArray(shot?.additionalCameraSetups)
      ? shot.additionalCameraSetups.map(s => s?.cameraMovement || {})
      : [])
  ];

  // FOV-Anzeige (Readonly) je Setup für Mehrspaltenansicht
  const allReadonlyFovDisplays = useMemo(() => {
    try {
      return allShotCameraSettings.map(setup => {
        const manufacturer = setup?.manufacturer;
        const fullModel = setup?.model;
        const format = setup?.format;
        const lensName = setup?.lens;
        const focalInput = setup?.focalLength;
        if (!manufacturer || !fullModel || !format || format === 'Manuell') return t('common.notAvailable');
        const shortModel = String(fullModel).replace(new RegExp(`^${manufacturer}\\s+`), '').trim();
        const sensorStr = getSensorSizeByFormat(manufacturer, shortModel, format);
        if (!sensorStr || sensorStr === 'Nicht verfügbar') return t('common.notAvailable');
        const sensor = parseSensorSize(sensorStr);
        if (!sensor) return t('common.notAvailable');
        let focal = 0;
        const parsed = parseFloat(String(focalInput || '').replace(',', '.'));
        if (!isNaN(parsed) && parsed > 0) focal = parsed;
        if (!focal) {
          const extracted = extractFocalLength(lensName || '');
          if (extracted && extracted > 0) focal = extracted;
        }
        if (!focal || focal <= 0) return t('common.notAvailable');
        let af = extractAnamorphicFactor(lensName || '');
        if ((setup?.isAnamorphic) && (!af || af <= 1)) af = 2;
        const h = calculateHorizontalFOV(focal, sensor.width * (af || 1));
        const v = calculateVerticalFOV(focal, sensor.height);
        const d = calculateDiagonalFOV(focal, sensor.width * (af || 1), sensor.height);
        return formatFOVDisplay({ horizontal: h, vertical: v, diagonal: d });
      });
    } catch {
      return allShotCameraSettings.map(() => t('common.notAvailable'));
    }
  }, [allShotCameraSettings, t]);

  // Setup-Label (A/B/C ...)
  const getSetupLabel = (index) => String.fromCharCode(65 + index);

  // Beim Wechsel des Setups: UI-States an den aktuell ausgewählten Setup anpassen
  useEffect(() => {
    if (!editedShot) return;
    const s = selectedSetupIndex === 0
      ? (editedShot.cameraSettings || {})
      : ((editedShot.additionalCameraSetups?.[selectedSetupIndex - 1]?.cameraSettings) || {});

    // Kamera-Auswahl
    const manufacturer = s.manufacturer === 'Manuell' ? 'Manuell' : (s.manufacturer || '');
    setSelectedManufacturer(manufacturer);
    const models = (manufacturer && manufacturer !== 'Manuell') ? getModelsByManufacturer(manufacturer) : [];
    setAvailableModels(models);
    const modelName = s.model === 'Manuell'
      ? 'Manuell'
      : (s.model
        ? (manufacturer ? s.model.replace(new RegExp(`^${manufacturer}\\s+`), '') : s.model)
        : '');
    setSelectedModel(modelName);
    if (manufacturer && modelName && manufacturer !== 'Manuell' && modelName !== 'Manuell') {
      setAvailableFormats(getFormatsByModel(manufacturer, modelName));
      setAvailableCodecs(getCodecsByModel(manufacturer, modelName));
      setAvailableColorSpaces(getColorSpacesByModel(manufacturer, modelName));
    } else {
      setAvailableFormats([]);
      setAvailableCodecs([]);
      setAvailableColorSpaces([]);
    }

    // Objektiv-Auswahl
    const lm = s.lensManufacturer === 'Manuell' ? 'Manuell' : (s.lensManufacturer || '');
    setSelectedLensManufacturer(lm);
    setIsAnamorphicEnabled(!!s.isAnamorphic);
    const lensList = (lm && lm !== 'Manuell')
      ? (s.isAnamorphic ? getAnamorphicLensesByManufacturer(lm) : getLensesByManufacturer(lm))
      : [];
    setAvailableLenses(lensList);
    const fullLensName = s.lens || '';
    const lensModelName = (s.lens === 'Manuell') ? 'Manuell' : ((lm && fullLensName) ? fullLensName.replace(new RegExp(`^${lm}\\s+`), '') : '');
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
                  focalLengths: '',
                  coverage: '',
                  anamorphicSqueeze: '',
                  date: '',
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
          takes: Array.isArray(shotData.takes) ? shotData.takes : [],
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
      setAvailableLuts(getViewerLutsForManufacturer(shotData.cameraSettings.manufacturer));
        
      if (shotData.cameraSettings.model) {
        const manu = shotData.cameraSettings.manufacturer;
        const modelName = shotData.cameraSettings.model
          ? (manu ? shotData.cameraSettings.model.replace(new RegExp(`^${manu}\\s+`), '') : shotData.cameraSettings.model)
          : '';
        setSelectedModel(modelName);
        
        // Load formats, codecs, and color spaces for the selected model
        const formats = getFormatsByModel(shotData.cameraSettings.manufacturer, modelName);
        const codecs = getCodecsByModel(shotData.cameraSettings.manufacturer, modelName);
        const colorSpaces = getColorSpacesByModel(shotData.cameraSettings.manufacturer, modelName);
        setAvailableFormats(formats);
        setAvailableCodecs(codecs);
        setAvailableColorSpaces(colorSpaces);
        const initialCodec = shotData.cameraSettings.codec || '';
        const fps = initialCodec
          ? getFrameratesByCodec(shotData.cameraSettings.manufacturer, modelName, initialCodec)
          : [];
        setAvailableFramerates(fps);
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
          const lm = shotData.cameraSettings.lensManufacturer;
          const lensModel = (lm && shotData.cameraSettings.lens)
            ? shotData.cameraSettings.lens.replace(new RegExp(`^${lm}\\s+`), '')
            : (shotData.cameraSettings.lens || '');
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
            const updatedShots = project.shots.map(shot => {
              const isMatch = shot.id === parseInt(id);
              const merged = isMatch ? { ...shot, ...updatedShot } : shot;
              return compactShotForIndex(merged);
            });
            return { ...project, shots: updatedShots };
          }
          return project;
        });
        
        {
          const ok = trySetLocalStorage('projects', JSON.stringify(updatedProjects));
          if (!ok) {
            const compact = compactProjectsForStorage(updatedProjects);
            trySetLocalStorage('projects', JSON.stringify(compact));
          }
        }
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
    // Dynamische Ableitung der Framerates bei Codec-Änderung
    let derivedFramerates = null;
    if (name === 'codec') {
      derivedFramerates = (selectedManufacturer && selectedModel)
        ? getFrameratesByCodec(selectedManufacturer, selectedModel, value)
        : [];
      setAvailableFramerates(derivedFramerates);
    }
    setEditedShot(prev => {
      if (selectedSetupIndex === 0) {
        const currentFr = prev.cameraSettings?.framerate || '';
        const reconciledFr = (name === 'codec' && Array.isArray(derivedFramerates))
          ? (derivedFramerates.includes(currentFr) ? currentFr : '')
          : currentFr;
        const updatedSettings = { ...prev.cameraSettings, [name]: value };
        if (name === 'codec') {
          updatedSettings.framerate = reconciledFr;
        } else if (name === 'framerate') {
          updatedSettings.framerate = value;
        }
        return { ...prev, cameraSettings: updatedSettings };
      }
      const additional = Array.isArray(prev.additionalCameraSetups) ? [...prev.additionalCameraSetups] : [];
      const idx = selectedSetupIndex - 1;
      const setup = { ...(additional[idx] || { cameraSettings: {}, cameraMovement: {} }) };
      const setupFr = (setup.cameraSettings || {}).framerate || '';
      const reconciledSetupFr = (name === 'codec' && Array.isArray(derivedFramerates))
        ? (derivedFramerates.includes(setupFr) ? setupFr : '')
        : setupFr;
      const updatedSetupSettings = { ...(setup.cameraSettings || {}), [name]: value };
      if (name === 'codec') {
        updatedSetupSettings.framerate = reconciledSetupFr;
      } else if (name === 'framerate') {
        updatedSetupSettings.framerate = value;
      }
      setup.cameraSettings = updatedSetupSettings;
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
    const newLuts = getViewerLutsForManufacturer(manufacturer);
    setAvailableLuts(newLuts);
    setAvailableFramerates([]);
    
    if (manufacturer === 'Manuell') {
      setAvailableModels([]);
      setAvailableFormats([]);
      setAvailableCodecs([]);
      setAvailableColorSpaces([]);
      setAvailableFramerates([]);
    } else if (manufacturer) {
      const models = getModelsByManufacturer(manufacturer);
      setAvailableModels(models);
    } else {
      setAvailableModels([]);
    }

    setEditedShot(prev => {
      if (selectedSetupIndex === 0) {
        const currentLut = prev.cameraSettings?.lut || '';
        const reconciledLut = newLuts.includes(currentLut) ? currentLut : '';
        return {
          ...prev,
          cameraSettings: {
            ...prev.cameraSettings,
            manufacturer: manufacturer,
            model: '',
            lut: reconciledLut
          }
        };
      }
      const additional = Array.isArray(prev.additionalCameraSetups) ? [...prev.additionalCameraSetups] : [];
      const idx = selectedSetupIndex - 1;
      const setup = { ...(additional[idx] || { cameraSettings: {}, cameraMovement: {} }) };
      const currentSetupLut = (setup.cameraSettings || {}).lut || '';
      const reconciledSetupLut = newLuts.includes(currentSetupLut) ? currentSetupLut : '';
      setup.cameraSettings = { ...(setup.cameraSettings || {}), manufacturer: manufacturer, model: '', lut: reconciledSetupLut };
      additional[idx] = setup;
      return { ...prev, additionalCameraSetups: additional };
    });
  };

  const handleModelChange = (e) => {
    const model = e.target.value;
    setSelectedModel(model);
    
    if (model === 'Manuell') {
      setAvailableFormats([]);
      setAvailableCodecs([]);
      setAvailableColorSpaces([]);
      setAvailableFramerates([]);
      setEditedShot(prev => {
        if (selectedSetupIndex === 0) {
          return {
            ...prev,
            cameraSettings: {
              ...prev.cameraSettings,
              model: 'Manuell',
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
          model: 'Manuell',
          format: '',
          codec: '',
          colorSpace: ''
        };
        additional[idx] = setup;
        return { ...prev, additionalCameraSetups: additional };
      });
    } else if (model && selectedManufacturer) {
      const formats = getFormatsByModel(selectedManufacturer, model);
      const codecs = getCodecsByModel(selectedManufacturer, model);
      const colorSpaces = getColorSpacesByModel(selectedManufacturer, model);
      setAvailableFormats(formats);
      setAvailableCodecs(codecs);
      setAvailableColorSpaces(colorSpaces);
      setAvailableFramerates([]);
      
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
      setAvailableFramerates([]);
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
    
    if (manufacturer === 'Manuell') {
      setAvailableLenses([]);
    } else if (manufacturer) {
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

  // Vereinheitlicht: nutze zentrale Util zur Brennweitenableitung
  const extractFocalLengthFromLens = (lensModel) => {
    const val = extractFocalLength(lensModel || '');
    return val !== null && !Number.isNaN(val) ? `${val}mm` : '';
  };

  const handleLensChange = (e) => {
    const lens = e.target.value;
    setSelectedLens(lens);
    
    if (lens === 'Manuell') {
      const updatedShot = (selectedSetupIndex === 0)
        ? {
            ...editedShot,
            cameraSettings: {
              ...editedShot.cameraSettings,
              lens: 'Manuell'
            }
          }
        : {
            ...editedShot,
            additionalCameraSetups: (() => {
              const arr = Array.isArray(editedShot.additionalCameraSetups) ? [...editedShot.additionalCameraSetups] : [];
              const idx = selectedSetupIndex - 1;
              const setup = { ...(arr[idx] || { cameraSettings: {}, cameraMovement: {} }) };
              setup.cameraSettings = { ...(setup.cameraSettings || {}), lens: 'Manuell' };
              arr[idx] = setup;
              return arr;
            })()
          };
      setEditedShot(updatedShot);
      autoSaveShotToFile(id, updatedShot);
    } else if (lens && selectedLensManufacturer) {
      const fullLensName = getLensFullName(selectedLensManufacturer, lens);
      
      // Extrahiere automatisch die Brennweite aus dem Objektiv-Namen über zentrale Util
      const autoFocalLength = extractFocalLength(fullLensName || '') || null;
      
      const updatedShot = (selectedSetupIndex === 0)
        ? {
            ...editedShot,
            cameraSettings: {
              ...editedShot.cameraSettings,
              lens: fullLensName,
              focalLength: editedShot.cameraSettings.focalLength || String(autoFocalLength || '')
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
                focalLength: existingFL || String(autoFocalLength || '')
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

  const addFilter = (value) => {
    const v = (value || '').trim();
    if (!v) return;
    if (selectedFilters.includes(v)) return;
    const newFilters = [ ...selectedFilters, v ];
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

  const handleAddFilter = () => {
    addFilter(filterToAdd);
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
        setEditedShot(prev => {
          const next = { ...prev, previewImage: event.target.result };
          try { autoSaveShotToFile(id, next); } catch (err) {}
          return next;
        });
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

  const openAnnotatorForReference = (refId, imageUrl, name) => {
    setAnnotatorState({ open: true, refId, imageUrl, title: `Annotieren: ${name}`, kind: 'reference' });
  };

  const applyAnnotationToRef = (dataUrl) => {
    setReferences(prev => {
      const updated = prev.map(r => r.id === annotatorState.refId ? { ...r, url: dataUrl } : r);
      const updatedShot = { ...editedShot, references: updated };
      setEditedShot(updatedShot);
      autoSaveShotToFile(id, updatedShot);
      return updated;
    });
    setAnnotatorState({ open: false, refId: null, imageUrl: null, title: '', kind: null });
  };

  const openAnnotatorForPreview = () => {
    try {
      const src = (previewImage || shot?.previewImage) || (() => {
        try {
          const projects = JSON.parse(localStorage.getItem('projects') || '[]');
          const selectedId = localStorage.getItem('selectedProjectId');
          const filmName = projects.find(p => String(p.id) === String(selectedId))?.name || 'Film';
          const hashSeed = (s) => [...String(s)].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
          const variants = [storyboard1, storyboard2, storyboard3, storyboard4];
          const idx = Math.abs(hashSeed(`${filmName}-${shot?.name || editedShot?.name || 'Shot'}`)) % variants.length;
          return variants[idx];
        } catch {
          return storyboard1;
        }
      })();
      setAnnotatorState({ open: true, refId: null, imageUrl: src, title: `Annotieren: ${shot?.name || editedShot?.name || 'Shot'}`, kind: 'preview' });
    } catch {
      setAnnotatorState({ open: true, refId: null, imageUrl: previewImage || shot?.previewImage || storyboard1, title: `Annotieren: ${shot?.name || editedShot?.name || 'Shot'}`, kind: 'preview' });
    }
  };

  const applyAnnotationToPreview = (dataUrl) => {
    setPreviewImage(dataUrl);
    setEditedShot(prev => {
      const next = { ...prev, previewImage: dataUrl };
      try { autoSaveShotToFile(id, next); } catch (err) {}
      return next;
    });
    setAnnotatorState({ open: false, refId: null, imageUrl: null, title: '', kind: null });
  };

  const closeAnnotator = () => {
    setAnnotatorState(state => ({ ...state, open: false }));
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
      
      {/* Zweispaltiges Layout: Vorschaubild links, Informationen rechts */}
      <div className="shot-layout">
        {/* Preview Image */}
        <div className="preview-image-container">
        {shot.previewImage || previewImage ? (
          <img 
            src={previewImage || shot.previewImage} 
            alt={`Vorschau für ${shot.name}`} 
            className="preview-image"
            onError={(e) => {
              try {
                const projects = JSON.parse(localStorage.getItem('projects') || '[]');
                const selectedId = localStorage.getItem('selectedProjectId');
                const filmName = projects.find(p => String(p.id) === String(selectedId))?.name || 'Film';
                const hashSeed = (s) => [...String(s)].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
                const variants = [storyboard1, storyboard2, storyboard3, storyboard4];
                const idx = Math.abs(hashSeed(`${filmName}-${shot.name}`)) % variants.length;
                e.currentTarget.onerror = null;
                e.currentTarget.src = variants[idx];
              } catch {
                e.currentTarget.onerror = null;
                e.currentTarget.src = storyboard1;
              }
            }}
          />
        ) : (
          <div className="preview-placeholder">
            <img 
              src={(() => {
                try {
                  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
                  const selectedId = localStorage.getItem('selectedProjectId');
                  const filmName = projects.find(p => String(p.id) === String(selectedId))?.name || 'Film';
                  const hashSeed = (s) => [...String(s)].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
                  const variants = [storyboard1, storyboard2, storyboard3, storyboard4];
                  const idx = Math.abs(hashSeed(`${filmName}-${shot.name}`)) % variants.length;
                  return variants[idx];
                } catch {
                  return storyboard1;
                }
              })()}
              alt={`Vorschau für ${shot.name}`}
              className="preview-image"
            />
          </div>
        )}
        
        {isEditing && (
          <div className="image-upload" style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
            <label htmlFor="image-upload" className="btn-outline">
              Bild hochladen
            </label>
            <button type="button" className="btn-annotate" onClick={openAnnotatorForPreview} title="Vorschaubild annotieren">Annotieren</button>
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
            
            <div className="info-item">
              <label><strong>{t('common.notes')}</strong>:</label>
              <span className="info-value">{shot.notes}</span>
            </div>
            <div className="info-item">
              <label><strong>Erstellt am</strong>:</label>
              <span className="info-value">{shot.dateCreated}</span>
            </div>
            <div className="info-item">
              <label><strong>Zuletzt aktualisiert</strong>:</label>
              <span className="info-value">{shot.lastUpdated}</span>
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
        <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{t('section.cameraSettings')}</h2>
          {isEditing && (
            <button
              type="button"
              className="collapse-toggle"
              onClick={() => setCameraSettingsCollapsed(prev => !prev)}
              aria-label={isCameraSettingsCollapsed ? 'Erweitern' : 'Minimieren'}
              title={isCameraSettingsCollapsed ? 'Erweitern' : 'Minimieren'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 1 }}
            >
              {isCameraSettingsCollapsed ? (<FiChevronDown size={24} />) : (<FiChevronUp size={24} />)}
            </button>
          )}
        </div>
        {!isEditing ? (
          (Array.isArray(shot?.additionalCameraSetups) && (shot.additionalCameraSetups.length > 0)) ? (
            <div className="multi-setup-grid">
              {allShotCameraSettings.map((setup, i) => (
                <div className="setup-column" key={`camera-settings-${i}`}>
                  <h3 className="setup-title">{`Kamera ${getSetupLabel(i)}`}</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label><strong>{t('camera.manufacturer')}</strong>:</label>
                      <span className="info-value">{
                        setup.manufacturer === 'Manuell'
                          ? (setup.manualManufacturer ? `${t('common.manual')} (${setup.manualManufacturer})` : t('common.manual'))
                          : (setup.manufacturer || t('common.notAvailable'))
                      }</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('camera.model')}</strong>:</label>
                      <span className="info-value">{
                        setup.model === 'Manuell'
                          ? (setup.manualModel ? `${t('common.manual')} (${setup.manualModel})` : t('common.manual'))
                          : (setup.model || t('common.notAvailable'))
                      }</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('camera.iso')}</strong>:</label>
                      <span className="info-value">{setup.iso}</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('camera.format')}</strong>:</label>
                      <span className="info-value">{
                        setup.format === 'Manuell'
                          ? (setup.manualFormat ? `${t('common.manual')} (${setup.manualFormat})` : t('common.manual'))
                          : (setup.format
                              ? formatFormatDisplay(
                                  setup.format,
                                  setup.manufacturer,
                                  getModelKey(
                                    setup.manufacturer,
                                    setup.model
                                  )
                                )
                              : t('common.notAvailable'))
                      }</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('camera.codec')}</strong>:</label>
                      <span className="info-value">{
                        setup.codec === 'Manuell'
                          ? (setup.manualCodec ? `${t('common.manual')} (${setup.manualCodec})` : t('common.manual'))
                          : (setup.codec || t('common.notAvailable'))
                      }</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('camera.colorSpace')}</strong>:</label>
                      <span className="info-value">{
                        setup.colorSpace === 'Manuell'
                          ? (setup.manualColorSpace ? `${t('common.manual')} (${setup.manualColorSpace})` : t('common.manual'))
                          : (setup.colorSpace || t('common.notAvailable'))
                      }</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('camera.lut')}</strong>:</label>
                      <span className="info-value">{setup.lut || t('common.notAvailable')}</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('camera.wb')}</strong>:</label>
                      <span className="info-value">{
                        setup.whiteBalance === 'Manuell'
                          ? (
                              setup.manualWhiteBalance
                                ? `${t('common.manual')} (${setup.manualWhiteBalance})`
                                : t('common.manual')
                            )
                          : (setup.whiteBalance || t('common.notAvailable'))
                      }</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('camera.framerate')}</strong>:</label>
                      <span className="info-value">{
                        setup.framerate === 'Manuell'
                          ? (setup.manualFramerate ? `${t('common.manual')} (${setup.manualFramerate})` : t('common.manual'))
                          : (setup.framerate || t('common.notAvailable'))
                      }</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('camera.shutterAngle')}</strong>:</label>
                      <span className="info-value">{
                        setup.shutterAngle === 'Manuell'
                          ? (setup.manualShutterAngle ? `${t('common.manual')} (${setup.manualShutterAngle})` : t('common.manual'))
                          : (setup.shutterAngle || t('common.notAvailable'))
                      }</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('camera.imageStabilization')}</strong>:</label>
                      <span className="info-value">{
                        setup.imageStabilization === 'Manuell'
                          ? (setup.manualImageStabilization ? `${t('common.manual')} (${setup.manualImageStabilization})` : t('common.manual'))
                          : (setup.imageStabilization || t('common.notAvailable'))
                      }</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('camera.ndFilter')}</strong>:</label>
                      <span className="info-value">{
                        setup.ndFilter === 'Manuell'
                          ? (setup.manualNDFilter ? `${t('common.manual')} (${setup.manualNDFilter})` : t('common.manual'))
                          : (setup.ndFilter || t('common.notAvailable'))
                      }</span>
                    </div>
                  </div>
                  <InlineSensorPreview settings={setup} title={t('section.sensorPreview') || 'Sensorvorschau'} />
                </div>
              ))}
            </div>
          ) : (
            <>
            <div className="info-grid">
              <div className="info-item">
                <label><strong>{t('camera.manufacturer')}</strong>:</label>
                <span className="info-value">{
                  currentShotCameraSettings.manufacturer === 'Manuell'
                    ? (
                        currentShotCameraSettings.manualManufacturer
                          ? `${t('common.manual')} (${currentShotCameraSettings.manualManufacturer})`
                          : t('common.manual')
                      )
                    : (currentShotCameraSettings.manufacturer || t('common.notAvailable'))
                }</span>
              </div>
              <div className="info-item">
                <label><strong>{t('camera.model')}</strong>:</label>
                <span className="info-value">{
                  currentShotCameraSettings.model === 'Manuell'
                    ? (
                        currentShotCameraSettings.manualModel
                          ? `${t('common.manual')} (${currentShotCameraSettings.manualModel})`
                          : t('common.manual')
                      )
                    : (currentShotCameraSettings.model || t('common.notAvailable'))
                }</span>
              </div>
              <div className="info-item">
                <label><strong>{t('camera.iso')}</strong>:</label>
                <span className="info-value">{currentShotCameraSettings.iso}</span>
              </div>
              <div className="info-item">
                <label><strong>{t('camera.format')}</strong>:</label>
                <span className="info-value">{
                  currentShotCameraSettings.format === 'Manuell'
                    ? (
                        currentShotCameraSettings.manualFormat
                          ? `${t('common.manual')} (${currentShotCameraSettings.manualFormat})`
                          : t('common.manual')
                      )
                    : (
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
                      )
                }</span>
              </div>
              <div className="info-item">
                <label><strong>{t('camera.codec')}</strong>:</label>
                <span className="info-value">{
                  currentShotCameraSettings.codec === 'Manuell'
                    ? (
                        currentShotCameraSettings.manualCodec
                          ? `${t('common.manual')} (${currentShotCameraSettings.manualCodec})`
                          : t('common.manual')
                      )
                    : (currentShotCameraSettings.codec || t('common.notAvailable'))
                }</span>
              </div>
              <div className="info-item">
                <label><strong>{t('camera.colorSpace')}</strong>:</label>
                <span className="info-value">{
                  currentShotCameraSettings.colorSpace === 'Manuell'
                    ? (
                        currentShotCameraSettings.manualColorSpace
                          ? `${t('common.manual')} (${currentShotCameraSettings.manualColorSpace})`
                          : t('common.manual')
                      )
                    : (currentShotCameraSettings.colorSpace || t('common.notAvailable'))
                }</span>
              </div>
              <div className="info-item">
                <label><strong>{t('camera.lut')}</strong>:</label>
                <span className="info-value">{currentShotCameraSettings.lut || t('common.notAvailable')}</span>
              </div>
              <div className="info-item">
                <label><strong>{t('camera.wb')}</strong>:</label>
                <span className="info-value">{
                  currentShotCameraSettings.whiteBalance === 'Manuell'
                    ? (
                        currentShotCameraSettings.manualWhiteBalance
                          ? `${t('common.manual')} (${currentShotCameraSettings.manualWhiteBalance})`
                          : t('common.manual')
                      )
                    : (currentShotCameraSettings.whiteBalance || t('common.notAvailable'))
                }</span>
              </div>
              <div className="info-item">
                <label><strong>{t('camera.framerate')}</strong>:</label>
                <span className="info-value">{
                  currentShotCameraSettings.framerate === 'Manuell'
                    ? (
                        currentShotCameraSettings.manualFramerate
                          ? `${t('common.manual')} (${currentShotCameraSettings.manualFramerate})`
                          : t('common.manual')
                      )
                    : (currentShotCameraSettings.framerate || t('common.notAvailable'))
                }</span>
              </div>
              <div className="info-item">
                <label><strong>{t('camera.shutterAngle')}</strong>:</label>
                <span className="info-value">{
                  currentShotCameraSettings.shutterAngle === 'Manuell'
                    ? (
                        currentShotCameraSettings.manualShutterAngle
                          ? `${t('common.manual')} (${currentShotCameraSettings.manualShutterAngle})`
                          : t('common.manual')
                      )
                    : (currentShotCameraSettings.shutterAngle || t('common.notAvailable'))
                }</span>
              </div>
              <div className="info-item">
                <label><strong>{t('camera.imageStabilization')}</strong>:</label>
                <span className="info-value">{
                  currentShotCameraSettings.imageStabilization === 'Manuell'
                    ? (
                        currentShotCameraSettings.manualImageStabilization
                          ? `${t('common.manual')} (${currentShotCameraSettings.manualImageStabilization})`
                          : t('common.manual')
                      )
                    : (currentShotCameraSettings.imageStabilization || t('common.notAvailable'))
                }</span>
              </div>
              <div className="info-item">
                <label><strong>{t('camera.ndFilter')}</strong>:</label>
                <span className="info-value">{
                  currentShotCameraSettings.ndFilter === 'Manuell'
                    ? (
                        currentShotCameraSettings.manualNDFilter
                          ? `${t('common.manual')} (${currentShotCameraSettings.manualNDFilter})`
                          : t('common.manual')
                      )
                    : (currentShotCameraSettings.ndFilter || t('common.notAvailable'))
                }</span>
              </div>
            </div>
            <InlineSensorPreview settings={currentShotCameraSettings} title={t('section.sensorPreview') || 'Sensorvorschau'} />
            </>
          )
        ) : (
          <div className="edit-form" style={{ display: isCameraSettingsCollapsed ? 'none' : 'block' }}>
            <div className="form-row">
              <div className="form-group">
                <label>{t('camera.manufacturer')}:</label>
                <select 
                  name="manufacturer" 
                  value={selectedManufacturer} 
                  onChange={handleManufacturerChange}
                >
                  <option value="">{t('camera.selectManufacturer')}</option>
                  <option value="Manuell">{t('common.manual')}</option>
                  {getManufacturers().map(manufacturer => (
                    <option key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </option>
                  ))}
                </select>
                {selectedManufacturer === 'Manuell' && (
                  <input
                    type="text"
                    name="manualManufacturer"
                    placeholder={t('camera.selectManufacturer')}
                    value={currentEditedCameraSettings.manualManufacturer || ''}
                    onChange={handleCameraChange}
                    style={{ marginTop: '8px' }}
                  />
                )}
              </div>
              <div className="form-group">
                <label>{t('camera.model')}:</label>
                <select 
                  name="model" 
                  value={selectedModel} 
                  onChange={handleModelChange}
                >
                  <option value="">{t('camera.selectModel')}</option>
                  <option value="Manuell">{t('common.manual')}</option>
                  {availableModels.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                {selectedModel === 'Manuell' && (
                  <input
                    type="text"
                    name="manualModel"
                    placeholder={t('camera.selectModel')}
                    value={currentEditedCameraSettings.manualModel || ''}
                    onChange={handleCameraChange}
                    style={{ marginTop: '8px' }}
                  />
                )}
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
                  <option value="Manuell">{t('common.manual')}</option>
                  {availableFormats.map(format => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
                {currentEditedCameraSettings.format === 'Manuell' && (
                  <input 
                    type="text"
                    name="manualFormat"
                    placeholder={t('camera.selectFormat')}
                    value={currentEditedCameraSettings.manualFormat || ''}
                    onChange={handleCameraChange}
                    style={{ marginTop: '8px' }}
                  />
                )}
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
                  <option value="Manuell">{t('common.manual')}</option>
                  {availableCodecs.map(codec => (
                    <option key={codec} value={codec}>
                      {codec}
                    </option>
                  ))}
                </select>
                {currentEditedCameraSettings.codec === 'Manuell' && (
                  <input 
                    type="text"
                    name="manualCodec"
                    placeholder={t('camera.selectCodec')}
                    value={currentEditedCameraSettings.manualCodec || ''}
                    onChange={handleCameraChange}
                    style={{ marginTop: '8px' }}
                  />
                )}
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
                  <option value="Manuell">{t('common.manual')}</option>
                  {availableColorSpaces.map(colorSpace => (
                    <option key={colorSpace} value={colorSpace}>
                      {colorSpace}
                    </option>
                  ))}
                </select>
                {currentEditedCameraSettings.colorSpace === 'Manuell' && (
                  <input 
                    type="text"
                    name="manualColorSpace"
                    placeholder={t('camera.selectColorSpace')}
                    value={currentEditedCameraSettings.manualColorSpace || ''}
                    onChange={handleCameraChange}
                    style={{ marginTop: '8px' }}
                  />
                )}
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
              <div className="form-group" style={{ width: '100%' }}>
                <label>{t('camera.lut')}:</label>
                <select
                  name="lut"
                  value={currentEditedCameraSettings.lut || ''}
                  onChange={handleCameraChange}
                >
                  <option value="">{t('camera.selectLut')}</option>
                  {availableLuts.map(lut => (
                    <option key={lut} value={lut}>{lut}</option>
                  ))}
                </select>
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
                  disabled={!selectedModel || !currentEditedCameraSettings.codec}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="Manuell">{t('common.manual')}</option>
                  {availableFramerates.map(fps => (
                    <option key={fps} value={fps}>{fps}</option>
                  ))}
                </select>
                {currentEditedCameraSettings.framerate === 'Manuell' && (
                  <input 
                    type="text"
                    name="manualFramerate"
                    placeholder={t('camera.framerate')}
                    value={currentEditedCameraSettings.manualFramerate || ''}
                    onChange={handleCameraChange}
                    style={{ marginTop: '8px' }}
                  />
                )}
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
                  <option value="Manuell">{t('common.manual')}</option>
                  <option value="45°">45°</option>
                  <option value="90°">90°</option>
                  <option value="180°">180°</option>
                  <option value="270°">270°</option>
                  <option value="360°">360°</option>
                </select>
                {currentEditedCameraSettings.shutterAngle === 'Manuell' && (
                  <input 
                    type="text"
                    name="manualShutterAngle"
                    placeholder={t('camera.shutterAngle')}
                    value={currentEditedCameraSettings.manualShutterAngle || ''}
                    onChange={handleCameraChange}
                    style={{ marginTop: '8px' }}
                  />
                )}
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
                  <option value="Manuell">{t('common.manual')}</option>
                </select>
                {currentEditedCameraSettings.imageStabilization === 'Manuell' && (
                  <input 
                    type="text"
                    name="manualImageStabilization"
                    placeholder={t('camera.imageStabilization')}
                    value={currentEditedCameraSettings.manualImageStabilization || ''}
                    onChange={handleCameraChange}
                    style={{ marginTop: '8px' }}
                  />
                )}
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
                  <option value="Manuell">{t('common.manual')}</option>
                </select>
                {currentEditedCameraSettings.ndFilter === 'Manuell' && (
                  <input 
                    type="text"
                    name="manualNDFilter"
                    placeholder={t('camera.ndFilter')}
                    value={currentEditedCameraSettings.manualNDFilter || ''}
                    onChange={handleCameraChange}
                    style={{ marginTop: '8px' }}
                  />
                )}
              </div>
            </div>
            <InlineSensorPreview settings={currentEditedCameraSettings} title={t('section.sensorPreview') || 'Sensorvorschau'} />
          </div>
        )}
      </div>

      {/* Lens Settings */}
      <div className="lens-settings card">
        <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{t('section.lensSettings')}</h2>
          {isEditing && (
            <button
              type="button"
              className="collapse-toggle"
              onClick={() => setLensSettingsCollapsed(prev => !prev)}
              aria-label={isLensSettingsCollapsed ? t('common.expand') : t('common.collapse')}
              title={isLensSettingsCollapsed ? t('common.expand') : t('common.collapse')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 1 }}
            >
              {isLensSettingsCollapsed ? (<FiChevronDown size={24} />) : (<FiChevronUp size={24} />)}
            </button>
          )}
        </div>
        {!isEditing ? (
          (Array.isArray(shot?.additionalCameraSetups) && (shot.additionalCameraSetups.length > 0)) ? (
            <div className="multi-setup-grid">
              {allShotCameraSettings.map((setup, i) => (
                <div className="setup-column" key={`lens-settings-${i}`}>
                  <h3 className="setup-title">{`${t('camera.model')} ${getSetupLabel(i)}`}</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label><strong>{t('lens.manufacturer')}</strong>:</label>
                      <span className="info-value">{
                        setup.lensManufacturer === 'Manuell'
                          ? (setup.manualLensManufacturer ? `${t('common.manual')} (${setup.manualLensManufacturer})` : t('common.manual'))
                          : (setup.lensManufacturer || t('common.notAvailable'))
                      }</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('lens.lens')}</strong>:</label>
                      <span className="info-value">{
                        setup.lens === 'Manuell'
                          ? (setup.manualLens ? `${t('common.manual')} (${setup.manualLens})` : t('common.manual'))
                          : (setup.lens || t('common.notAvailable'))
                      }</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('lens.focalLengthZoom')}</strong>:</label>
                      <span className="info-value">{setup.focalLength || t('common.notAvailable')}</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('lens.fov', 'Sichtfeld (FOV)')}</strong>:</label>
                      <span className="info-value">{allReadonlyFovDisplays?.[i] || t('common.notAvailable')}</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('lens.aperture')}</strong>:</label>
                      <span className="info-value">{setup.aperture || t('common.notAvailable')}</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('lens.focusDistance')}</strong>:</label>
                      <span className="info-value">{setup.focusDistance || t('common.notAvailable')}</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('lens.hyperfocalDistance')}</strong>:</label>
                      <span className="info-value">{setup.hyperfocalDistance || t('common.notAvailable')}</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('lens.lensStabilization')}</strong>:</label>
                      <span className="info-value">{
                        setup.lensStabilization === 'Manuell'
                          ? (setup.manualLensStabilization ? `${t('common.manual')} (${setup.manualLensStabilization})` : t('common.manual'))
                          : (setup.lensStabilization || t('common.notAvailable'))
                      }</span>
                    </div>
                    <div className="info-item anamorphic-info">
                      <label id={`anamorphic-readonly-label-${i}`}><strong>{t('lens.anamorphic')}</strong>:</label>
                      <span className="info-value checkbox-display">
                        <input
                          type="checkbox"
                          id={`anamorphic-readonly-${i}`}
                          aria-labelledby={`anamorphic-readonly-label-${i}`}
                          checked={!!setup.isAnamorphic}
                          readOnly
                          disabled
                        />
                      </span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('lens.filter')}</strong>:</label>
                      <span className="info-value">{
                        (setup?.filters && setup.filters.length > 0)
                          ? setup.filters.join(', ')
                          : (setup?.filter || t('common.notAvailable'))
                      }</span>
                    </div>
                  </div>

                  <EmbeddedFovCalculator
                    selectedManufacturer={setup.manufacturer || ''}
                    selectedModel={((setup.model || '').startsWith((setup.manufacturer || '') + ' ')) ? (setup.model || '').slice(((setup.manufacturer || '') + ' ').length) : (setup.model || '')}
                    selectedLensManufacturer={setup.lensManufacturer || ''}
                    selectedLens={setup.lens || ''}
                    isAnamorphicEnabled={!!setup.isAnamorphic}
                    settings={{
                      format: setup.format || '',
                      focalLength: String(extractFocalLength(setup.focalLength || setup.lens || '') || setup.focalLength || ''),
                      aperture: setup.aperture || '',
                      focusDistance: setup.focusDistance || ''
                    }}
                    onManufacturerChange={() => {}}
                    onModelChange={() => {}}
                    onCameraChange={() => {}}
                    onLensManufacturerChange={() => {}}
                    onLensChange={() => {}}
                    onAnamorphicToggle={() => {}}
                    compact={true}
                    hideCameraSelectors={true}
                    plain={true}
                    hideControls={true}
                    diagramOnly={true}
                  />

                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="info-grid">
              <div className="info-item">
                <label><strong>{t('lens.manufacturer')}</strong>:</label>
                <span className="info-value">{
                  currentShotCameraSettings.lensManufacturer === 'Manuell'
                    ? (
                        currentShotCameraSettings.manualLensManufacturer
                          ? `${t('common.manual')} (${currentShotCameraSettings.manualLensManufacturer})`
                          : t('common.manual')
                      )
                    : (currentShotCameraSettings.lensManufacturer || t('common.notAvailable'))
                }</span>
              </div>
              <div className="info-item">
                <label><strong>{t('lens.lens')}</strong>:</label>
                <span className="info-value">{
                  currentShotCameraSettings.lens === 'Manuell'
                    ? (
                        currentShotCameraSettings.manualLens
                          ? `${t('common.manual')} (${currentShotCameraSettings.manualLens})`
                          : t('common.manual')
                      )
                    : (currentShotCameraSettings.lens || t('common.notAvailable'))
                }</span>
              </div>
              <div className="info-item">
                <label><strong>{t('lens.focalLengthZoom')}</strong>:</label>
                <span className="info-value">{currentShotCameraSettings.focalLength || t('common.notAvailable')}</span>
              </div>
              <div className="info-item">
                <label><strong>{t('lens.fov', 'Sichtfeld (FOV)')}</strong>:</label>
                <span className="info-value">{readonlyFovDisplay}</span>
              </div>
              <div className="info-item">
                <label><strong>{t('lens.aperture')}</strong>:</label>
                <span className="info-value">{currentShotCameraSettings.aperture || t('common.notAvailable')}</span>
              </div>
              <div className="info-item">
                <label><strong>{t('lens.focusDistance')}</strong>:</label>
                <span className="info-value">{currentShotCameraSettings.focusDistance || t('common.notAvailable')}</span>
              </div>
              <div className="info-item">
                <label><strong>{t('lens.hyperfocalDistance')}</strong>:</label>
                <span className="info-value">{currentShotCameraSettings.hyperfocalDistance || t('common.notAvailable')}</span>
              </div>
              <div className="info-item">
                <label><strong>{t('lens.lensStabilization')}</strong>:</label>
                <span className="info-value">{
                  currentShotCameraSettings.lensStabilization === 'Manuell'
                    ? (
                        currentShotCameraSettings.manualLensStabilization
                          ? `${t('common.manual')} (${currentShotCameraSettings.manualLensStabilization})`
                          : t('common.manual')
                      )
                    : (currentShotCameraSettings.lensStabilization || t('common.notAvailable'))
                }</span>
              </div>
              <div className="info-item anamorphic-info">
                <label id="anamorphic-readonly-label"><strong>{t('lens.anamorphic')}</strong>:</label>
                <span className="info-value checkbox-display">
                  <input
                    type="checkbox"
                    id="anamorphic-readonly"
                    aria-labelledby="anamorphic-readonly-label"
                    checked={!!currentShotCameraSettings.isAnamorphic}
                    readOnly
                    disabled
                  />
                </span>
              </div>
              <div className="info-item">
                <label><strong>{t('lens.filter')}</strong>:</label>
                <span className="info-value">{
                  (currentShotCameraSettings?.filters && currentShotCameraSettings.filters.length > 0)
                    ? currentShotCameraSettings.filters.join(', ')
                    : (currentShotCameraSettings?.filter || t('common.notAvailable'))
                }</span>
              </div>
            </div>

            <EmbeddedFovCalculator
              selectedManufacturer={currentShotCameraSettings.manufacturer || ''}
              selectedModel={((currentShotCameraSettings.model || '').startsWith((currentShotCameraSettings.manufacturer || '') + ' ')) ? (currentShotCameraSettings.model || '').slice(((currentShotCameraSettings.manufacturer || '') + ' ').length) : (currentShotCameraSettings.model || '')}
              selectedLensManufacturer={currentShotCameraSettings.lensManufacturer || ''}
              selectedLens={currentShotCameraSettings.lens || ''}
              isAnamorphicEnabled={!!currentShotCameraSettings.isAnamorphic}
              settings={{
                format: currentShotCameraSettings.format || '',
                focalLength: String(extractFocalLength(currentShotCameraSettings.focalLength || currentShotCameraSettings.lens || '') || currentShotCameraSettings.focalLength || ''),
                aperture: currentShotCameraSettings.aperture || '',
                focusDistance: currentShotCameraSettings.focusDistance || ''
              }}
              onManufacturerChange={() => {}}
              onModelChange={() => {}}
              onCameraChange={() => {}}
              onLensManufacturerChange={() => {}}
              onLensChange={() => {}}
              onAnamorphicToggle={() => {}}
              compact={true}
              hideCameraSelectors={true}
              plain={true}
              hideControls={true}
              diagramOnly={true}
            />

            </>
          )
        ) : (
          <div className="edit-form" style={{ display: isLensSettingsCollapsed ? 'none' : 'block' }}>
            <EmbeddedFovCalculator
              selectedManufacturer={selectedManufacturer}
              selectedModel={selectedModel}
              selectedLensManufacturer={selectedLensManufacturer}
              selectedLens={selectedLens}
              isAnamorphicEnabled={isAnamorphicEnabled}
              settings={currentEditedCameraSettings}
              onManufacturerChange={handleManufacturerChange}
              onModelChange={handleModelChange}
              onCameraChange={handleCameraChange}
              onLensManufacturerChange={handleLensManufacturerChange}
              onLensChange={handleLensChange}
              onAnamorphicToggle={handleAnamorphicToggle}
              compact={true}
              hideCameraSelectors={true}
              plain={true}
            />

            {isZoomLens(selectedLensManufacturer, selectedLens) && (
              <div className="form-row">
                <div className="form-group">
                  <label>Brennweite (manuell)</label>
                  <input
                    type="number"
                    name="focalLength"
                    step="0.1"
                    placeholder={(function(){
                      const m = getLensMeta(selectedLensManufacturer, selectedLens);
                      if (!m || m.minMm == null || m.maxMm == null) return 'z. B. 35';
                      return `${m.minMm}-${m.maxMm}mm`;
                    })()}
                    min={(function(){
                      const m = getLensMeta(selectedLensManufacturer, selectedLens);
                      return (m && m.minMm != null) ? m.minMm : undefined;
                    })()}
                    max={(function(){
                      const m = getLensMeta(selectedLensManufacturer, selectedLens);
                      return (m && m.maxMm != null) ? m.maxMm : undefined;
                    })()}
                    value={currentEditedCameraSettings?.focalLength || ''}
                    onChange={(e) => {
                      const m = getLensMeta(selectedLensManufacturer, selectedLens);
                      let v = e.target.value;
                      if (m && m.minMm != null && m.maxMm != null) {
                        const num = parseFloat(v);
                        if (!isNaN(num)) {
                          const clamped = Math.max(m.minMm, Math.min(m.maxMm, num));
                          e.target.value = String(clamped);
                        }
                      }
                      handleCameraChange(e);
                    }}
                  />
                  <small className="helper-text">Zoom-Objektiv: Nur Werte innerhalb des Bereichs zulässig.</small>
                </div>
              </div>
            )}

            {/* Kompletter FOV‑Rechner oben ersetzt die Objektiv‑Eingaben (Hersteller, Linse, Brennweite, Blende, Fokus, Hyperfokal). */}

            <div className="form-row">
              <div className="form-group">
                <label>{t('lens.manualEntry', 'Manuelle Objektiv‑Eingabe')}</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedLensManufacturer !== 'Manuell' && (
                    <button type="button" className="btn btn-secondary" onClick={() => handleLensManufacturerChange({ target: { value: 'Manuell' } })}>
                      {t('action.manualManufacturer', 'Hersteller manuell')}
                    </button>
                  )}
                  {selectedLens !== 'Manuell' && (
                    <button type="button" className="btn btn-secondary" onClick={() => handleLensChange({ target: { value: 'Manuell' } })}>
                      {t('action.manualLens', 'Linse manuell')}
                    </button>
                  )}
                </div>

                {selectedLensManufacturer === 'Manuell' && (
                  <>
                  <input
                    type="text"
                    name="manualLensManufacturer"
                    placeholder={t('lens.manufacturer')}
                    value={currentEditedCameraSettings.manualLensManufacturer || ''}
                    onChange={handleCameraChange}
                    style={{ marginTop: '8px' }}
                  />
                  <small className="helper-text">Beispiele: „Canon“, „ARRI“, „Cooke“, „Zeiss“.</small>
                  </>
                )}

                {(selectedLens === 'Manuell' || selectedLensManufacturer === 'Manuell') && (
                  <>
                  <input
                    type="text"
                    name="manualLens"
                    placeholder={t('lens.lens')}
                    value={currentEditedCameraSettings.manualLens || ''}
                    onChange={(e) => {
                      handleCameraChange(e);
                      const flNum = extractFocalLength(e.target.value);
                      if (flNum !== null && !Number.isNaN(flNum)) {
                        handleCameraChange({ target: { name: 'focalLength', value: String(flNum) } });
                      }
                    }}
                    style={{ marginTop: '8px' }}
                  />
                  <small className="helper-text">Beispiele: „24–70mm“, „24 bis 70 mm“, „50mm T1.4“, „100mm Macro“.</small>
                  </>
                )}
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
                  <option value="Manuell">{t('common.manual')}</option>
                </select>
                {currentEditedCameraSettings.lensStabilization === 'Manuell' && (
                  <input 
                    type="text"
                    name="manualLensStabilization"
                    placeholder={t('lens.lensStabilization')}
                    value={currentEditedCameraSettings.manualLensStabilization || ''}
                    onChange={handleCameraChange}
                    style={{ marginTop: '8px' }}
                  />
                )}
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
            {/* Farbfilter-Shortcuts: CTO/CTB/Grün-Magenta */}
            <div className="form-row">
              <div className="form-group">
                <label>CTO:</label>
                <select 
                  name="cto"
                  value={ctoToAdd}
                  onChange={(e) => {
                    setCtoToAdd(e.target.value);
                    addFilter(e.target.value);
                    setCtoToAdd('');
                  }}
                >
                  <option value="">{t('common.select')}</option>
                  {getFiltersByCategory('cto').map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>CTB:</label>
                <select 
                  name="ctb"
                  value={ctbToAdd}
                  onChange={(e) => {
                    setCtbToAdd(e.target.value);
                    addFilter(e.target.value);
                    setCtbToAdd('');
                  }}
                >
                  <option value="">{t('common.select')}</option>
                  {getFiltersByCategory('ctb').map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Grün/Magenta:</label>
                <select 
                  name="greenMagenta"
                  value={greenToAdd}
                  onChange={(e) => {
                    setGreenToAdd(e.target.value);
                    addFilter(e.target.value);
                    setGreenToAdd('');
                  }}
                >
                  <option value="">{t('common.select')}</option>
                  {getFiltersByCategory('greenMagenta').map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
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
        <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{t('section.cameraMovement')}</h2>
          {isEditing && (
            <button
              type="button"
              className="collapse-toggle"
              onClick={() => setCameraMovementCollapsed(prev => !prev)}
              aria-label={isCameraMovementCollapsed ? 'Erweitern' : 'Minimieren'}
              title={isCameraMovementCollapsed ? 'Erweitern' : 'Minimieren'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 1 }}
            >
              {isCameraMovementCollapsed ? (<FiChevronDown size={24} />) : (<FiChevronUp size={24} />)}
            </button>
          )}
        </div>
        {!isEditing ? (
          (Array.isArray(shot?.additionalCameraSetups) && (shot.additionalCameraSetups.length > 0)) ? (
            <div className="multi-setup-grid">
              {allShotCameraMovements.map((mv, i) => (
                <div className="setup-column" key={`movement-settings-${i}`}>
                  <h3 className="setup-title">{`Kamera ${getSetupLabel(i)}`}</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label><strong>{t('movement.movement')}</strong>:</label>
                      <span className="info-value">{mv?.movementType
                        ? movementTypeLabel(mv.movementType) + (mv?.direction ? ` (${directionLabel(mv.direction)})` : '')
                        : t('common.notAvailable')}</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('movement.speed')}</strong>:</label>
                      <span className="info-value">{mv?.speed || t('common.notAvailable')}</span>
                    </div>
                    <div className="info-item">
                      <label><strong>{t('movement.cameraHeight')}</strong>:</label>
                      <span className="info-value">{mv?.cameraHeight || t('common.notAvailable')}</span>
                    </div>
                    <div className="info-item" style={{ width: '100%' }}>
                      <label><strong>{t('movement.dollySetup')}</strong>:</label>
                      <span className="info-value">{[
                        mv?.dollySetup?.trackType,
                        mv?.dollySetup?.trackLength,
                        mv?.dollySetup?.headType,
                        mv?.dollySetup?.mount
                      ].filter(Boolean).join(' • ') || t('common.notAvailable')}</span>
                    </div>
                    {mv?.notes && (
                      <div className="info-item" style={{ width: '100%' }}>
                        <label><strong>{t('common.notes')}</strong>:</label>
                        <span className="info-value">{mv.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label><strong>{t('movement.movement')}</strong>:</label>
                <span className="info-value">{currentShotCameraMovement?.movementType
                  ? movementTypeLabel(currentShotCameraMovement.movementType) + (currentShotCameraMovement?.direction ? ` (${directionLabel(currentShotCameraMovement.direction)})` : '')
                  : t('common.notAvailable')}</span>
              </div>
              <div className="info-item">
                <label><strong>{t('movement.speed')}</strong>:</label>
                <span className="info-value">{currentShotCameraMovement?.speed || t('common.notAvailable')}</span>
              </div>
              <div className="info-item">
                <label><strong>{t('movement.cameraHeight')}</strong>:</label>
                <span className="info-value">{currentShotCameraMovement?.cameraHeight || t('common.notAvailable')}</span>
              </div>
              <div className="info-item" style={{ width: '100%' }}>
                <label><strong>{t('movement.dollySetup')}</strong>:</label>
                <span className="info-value">{[
                  currentShotCameraMovement?.dollySetup?.trackType,
                  currentShotCameraMovement?.dollySetup?.trackLength,
                  currentShotCameraMovement?.dollySetup?.headType,
                  currentShotCameraMovement?.dollySetup?.mount
                ].filter(Boolean).join(' • ') || t('common.notAvailable')}</span>
              </div>
              {currentShotCameraMovement?.notes && (
                <div className="info-item" style={{ width: '100%' }}>
                  <label><strong>{t('common.notes')}</strong>:</label>
                  <span className="info-value">{currentShotCameraMovement.notes}</span>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="edit-form" style={{ display: isCameraMovementCollapsed ? 'none' : 'block' }}>
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
        <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{t('section.vfxTasks')}</h2>
          {isEditing && (
            <button
              type="button"
              className="collapse-toggle"
              onClick={() => setVfxTasksCollapsed(prev => !prev)}
              aria-label={isVfxTasksCollapsed ? 'Erweitern' : 'Minimieren'}
              title={isVfxTasksCollapsed ? 'Erweitern' : 'Minimieren'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 1 }}
            >
              {isVfxTasksCollapsed ? (<FiChevronDown size={24} />) : (<FiChevronUp size={24} />)}
            </button>
          )}
        </div>
        {!isEditing ? (
          <div className="vfx-checklist">
            {(() => {
              const flags = shot.vfxPreparations || {};
              const items = [
                { key: 'cleanplates', label: t('vfx.checklist.cleanplates') },
                { key: 'hdris', label: t('vfx.checklist.hdris') },
                { key: 'setReferences', label: t('vfx.checklist.setReferences') },
                { key: 'chromeBall', label: t('vfx.checklist.chromeBall') },
                { key: 'grayBall', label: t('vfx.checklist.grayBall') },
                { key: 'colorChecker', label: t('vfx.checklist.colorChecker') },
                { key: 'distortionGrids', label: t('vfx.checklist.distortionGrids') },
                { key: 'measurementsTaken', label: t('vfx.checklist.measurementsTaken') },
                { key: 'threeDScans', label: t('vfx.checklist.threeDScans') }
              ];
              const visible = items.filter(it => !!flags[it.key]);
              return visible.map(it => (
                <div className="vfx-item" key={`ro-${it.key}`}>
                  <input
                    type="checkbox"
                    id={`${it.key}-readonly`}
                    checked={!!flags[it.key]}
                    readOnly
                    disabled
                  />
                  <label htmlFor={`${it.key}-readonly`}>{it.label}</label>
                  {it.key === 'distortionGrids' && flags.distortionGrids && (
                    <div className="info-grid" style={{ marginTop: '6px' }}>
                      <div className="info-item" style={{ width: '100%' }}>
                        <label><strong>Rastertyp</strong>:</label>
                        <span className="info-value">{shot.vfxPreparations?.distortionGridsDetails?.patternType || t('common.notAvailable')}</span>
                      </div>
                      <div className="info-item" style={{ width: '100%' }}>
                        <label><strong>Distanzen</strong>:</label>
                        <span className="info-value">{shot.vfxPreparations?.distortionGridsDetails?.distances || t('common.notAvailable')}</span>
                      </div>
                      <div className="info-item" style={{ width: '100%' }}>
                        <label><strong>Brennweite(n)</strong>:</label>
                        <span className="info-value">{shot.vfxPreparations?.distortionGridsDetails?.focalLengths || t('common.notAvailable')}</span>
                      </div>
                      <div className="info-item">
                        <label><strong>Bereich</strong>:</label>
                        <span className="info-value">{shot.vfxPreparations?.distortionGridsDetails?.coverage || t('common.notAvailable')}</span>
                      </div>
                      <div className="info-item">
                        <label><strong>Anamorph Squeeze</strong>:</label>
                        <span className="info-value">{shot.vfxPreparations?.distortionGridsDetails?.anamorphicSqueeze || t('common.notAvailable')}</span>
                      </div>
                      <div className="info-item">
                        <label><strong>Datum</strong>:</label>
                        <span className="info-value">{shot.vfxPreparations?.distortionGridsDetails?.date || t('common.notAvailable')}</span>
                      </div>
                      {shot.vfxPreparations?.distortionGridsDetails?.notes && (
                        <div className="info-item" style={{ width: '100%' }}>
                          <label><strong>{t('common.notes')}</strong>:</label>
                          <span className="info-value">{shot.vfxPreparations?.distortionGridsDetails?.notes}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        ) : (
          <div className="vfx-edit-form" style={{ display: isVfxTasksCollapsed ? 'none' : 'block' }}>
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
            {/* Detailkarten für aktivierte VFX Aufgaben: zweispaltiges Grid */}
            <div className="vfx-options-grid">
            {/* Detailfelder für Distortion Grids (gefilmt Bereich) */}
            {editedShot.vfxPreparations?.distortionGrids && (
              <div className="vfx-option-group card">
                <h3>{t('vfx.checklist.distortionGrids')} – Gefilmt Bereich</h3>
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
                    <label>Distanzen:</label>
                    <input
                      type="text"
                      placeholder="z.B. 1m, 2m, 3m"
                      value={editedShot.vfxPreparations?.distortionGridsDetails?.distances || ''}
                      onChange={(e) => handleVFXDetailChange('distortionGridsDetails', 'distances', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Brennweite(n):</label>
                    <input
                      type="text"
                      placeholder="z.B. 18, 25, 35, 50"
                      value={editedShot.vfxPreparations?.distortionGridsDetails?.focalLengths || ''}
                      onChange={(e) => handleVFXDetailChange('distortionGridsDetails', 'focalLengths', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Bereich:</label>
                    <select
                      value={editedShot.vfxPreparations?.distortionGridsDetails?.coverage || ''}
                      onChange={(e) => handleVFXDetailChange('distortionGridsDetails', 'coverage', e.target.value)}
                    >
                      <option value="">Auswählen...</option>
                      <option value="Nah">Nah</option>
                      <option value="Mittel">Mittel</option>
                      <option value="Fern">Fern</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Anamorph Squeeze:</label>
                    <input
                      type="text"
                      placeholder="z.B. 2.0x, 1.5x"
                      value={editedShot.vfxPreparations?.distortionGridsDetails?.anamorphicSqueeze || ''}
                      onChange={(e) => handleVFXDetailChange('distortionGridsDetails', 'anamorphicSqueeze', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Datum:</label>
                    <input
                      type="date"
                      value={editedShot.vfxPreparations?.distortionGridsDetails?.date || ''}
                      onChange={(e) => handleVFXDetailChange('distortionGridsDetails', 'date', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>{t('common.notes')}:</label>
                    <textarea
                      placeholder="Zusätzliche Hinweise zu den Distortion-Grids"
                      value={editedShot.vfxPreparations?.distortionGridsDetails?.notes || ''}
                      onChange={(e) => handleVFXDetailChange('distortionGridsDetails', 'notes', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>Referenzbilder (Distortion‑Grids):</label>
                    <label htmlFor="vfx-upload-distortion" className="btn-outline">Fotos hinzufügen</label>
                    <input
                      id="vfx-upload-distortion"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReferenceUploadFor('vfx-distortion-grids')}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                {/* Mini-Preview: Distortion Grids */}
                <div className="references-subgrid" style={{ marginTop: '6px' }}>
                  {(() => {
                    const refsForCat = references.filter(ref => ref.category === 'vfx-distortion-grids');
                    const tiles = [];
                    for (let i = 0; i < 3; i++) {
                      const ref = refsForCat[i];
                      if (ref) {
                        if (typeof ref === 'string') {
                          tiles.push({ key: `mini-distortion-${i}-${ref}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-distortion-grids-${i}`), name: ref });
                        } else {
                          tiles.push({ key: `mini-distortion-${i}-${ref.id}`, url: ref.url, name: ref.name });
                        }
                      } else {
                        tiles.push({ key: `mini-distortion-dummy-${i}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-distortion-grids-${i}`), name: `Ref ${i+1}` });
                      }
                    }
                    return tiles.map(tile => (
                      <div className="reference-item" key={tile.key}>
                        <div className="reference-image-container">
                          <img src={tile.url} alt={tile.name} className="reference-image" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = dummyReference; }} />
                          <div className="reference-info">
                            <span className="reference-name">{tile.name}</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* HDRI Aufnahme (Beta): Letzte Belichtungsreihe aus Camera Control */}
                {((isEditing ? editedShot?.vfxPreparations?.hdris : shot?.vfxPreparations?.hdris)) && (
                <div className="hdri-beta-block" style={{ marginTop: '10px', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                  <div className="beta-note" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>HDRI – Beta</div>
                  {latestBracket?.results?.length ? (
                    <div className="hdri-bracket-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                      {latestBracket.results.map((s, idx) => {
                        const fullUrl = s?.full?.url ? `${cameraBridgeUrl}${s.full.url}` : null;
                        const mp = s?.full?.megapixels != null ? Number(s.full.megapixels).toFixed(2) : null;
                        const dim = s?.full ? `${s.full.width}×${s.full.height}` : null;
                        const expMp = s?.full?.expectedMegapixels != null ? Number(s.full.expectedMegapixels).toFixed(1) : null;
                        const expDim = s?.full ? `${s.full.expectedWidth}×${s.full.expectedHeight}` : null;
                        return (
                          <div key={`br-${idx}`} className="hdri-thumb-item" style={{ background: 'var(--card-bg, #111827)', color: 'var(--card-fg, #e5e7eb)', border: '1px solid #1f2937', borderRadius: 6, padding: 8 }}>
                            <div className="hdri-thumb" style={{ aspectRatio: '16 / 9', overflow: 'hidden', background: 'var(--card-bg-alt, #0b1220)', border: '1px solid #1f2937', borderRadius: 4 }}>
                              {s?.thumb ? (
                                <img src={s.thumb} alt={`EV ${s.ev}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div className="hdri-thumb-placeholder" style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>Kein Thumbnail</div>
                              )}
                            </div>
                            <div className="hdri-thumb-caption" style={{ marginTop: 6, fontWeight: 600, color: 'var(--muted, #9ca3af)' }}>EV {s.ev}</div>
                            <div className="hdri-thumb-meta" style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start', marginTop: 4, fontSize: '0.85em' }}>
                              {mp && dim && (<span className="meta">{mp} MP ({dim})</span>)}
                              {expMp && expDim && (<span className="meta expected" style={{ opacity: 0.8 }}>Erwartet: {expMp} MP (~{expDim})</span>)}
                              {fullUrl ? (
                                <a className="btn-link" href={fullUrl} target="_blank" rel="noreferrer">Öffnen</a>
                              ) : (
                                <input type="file" accept="image/*" onChange={(e)=>handleHdrUpload(idx, s, e)} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="hdri-beta-empty" style={{ color: 'var(--text-secondary)' }}>Noch keine Belichtungsreihe vorhanden. Starte sie in Camera Control.</div>
                  )}
                </div>
                )}
              </div>
            )}

            {/* Aufklappbare Bereiche und Uploads für weitere VFX Tasks */}
            {((isEditing ? editedShot?.vfxPreparations?.hdris : shot?.vfxPreparations?.hdris)) && (
              <div className="vfx-option-group card">
                <h3>{t('vfx.checklist.hdris')}</h3>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>{t('common.notes')}:</label>
                    <textarea
                      placeholder="Belichtungsreihen, Stativ, Sonnenstand …"
                      value={editedShot.vfxPreparations?.hdrisDetails?.notes || ''}
                      onChange={(e) => handleVFXDetailChange('hdrisDetails', 'notes', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>HDRI Referenzen:</label>
                    <label htmlFor="vfx-upload-hdris" className="btn-outline">Fotos hinzufügen</label>
                    <input
                      id="vfx-upload-hdris"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReferenceUploadFor('hdri')}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                {/* Mini-Preview: HDRIs */}
                <div className="references-subgrid" style={{ marginTop: '6px' }}>
                  {(() => {
                    const refsForCat = references.filter(ref => ref.category === 'hdri');
                    const tiles = [];
                    for (let i = 0; i < 3; i++) {
                      const ref = refsForCat[i];
                      if (ref) {
                        if (typeof ref === 'string') {
                          tiles.push({ key: `mini-hdri-${i}-${ref}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-hdri-${i}`), name: ref });
                        } else {
                          tiles.push({ key: `mini-hdri-${i}-${ref.id}`, url: ref.url, name: ref.name });
                        }
                      } else {
                        tiles.push({ key: `mini-hdri-dummy-${i}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-hdri-${i}`), name: `Ref ${i+1}` });
                      }
                    }
                    return tiles.map(tile => (
                      <div className="reference-item" key={tile.key}>
                        <div className="reference-image-container">
                          <img src={tile.url} alt={tile.name} className="reference-image" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = dummyReference; }} />
                          <div className="reference-info">
                            <span className="reference-name">{tile.name}</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {editedShot.vfxPreparations?.setReferences && (
              <div className="vfx-option-group card">
                <h3>{t('vfx.checklist.setReferences')}</h3>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>{t('common.notes')}:</label>
                    <textarea
                      placeholder="Welche Set‑Details wurden festgehalten?"
                      value={editedShot.vfxPreparations?.setReferencesDetails?.notes || ''}
                      onChange={(e) => handleVFXDetailChange('setReferencesDetails', 'notes', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>Set‑Referenzen:</label>
                    <label htmlFor="vfx-upload-setrefs" className="btn-outline">Fotos hinzufügen</label>
                    <input
                      id="vfx-upload-setrefs"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReferenceUploadFor('vfx-set-references')}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                {/* Mini-Preview: Set‑Referenzen */}
                <div className="references-subgrid" style={{ marginTop: '6px' }}>
                  {(() => {
                    const refsForCat = references.filter(ref => ref.category === 'vfx-set-references');
                    const tiles = [];
                    for (let i = 0; i < 3; i++) {
                      const ref = refsForCat[i];
                      if (ref) {
                        if (typeof ref === 'string') {
                          tiles.push({ key: `mini-setrefs-${i}-${ref}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-set-references-${i}`), name: ref });
                        } else {
                          tiles.push({ key: `mini-setrefs-${i}-${ref.id}`, url: ref.url, name: ref.name });
                        }
                      } else {
                        tiles.push({ key: `mini-setrefs-dummy-${i}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-set-references-${i}`), name: `Ref ${i+1}` });
                      }
                    }
                    return tiles.map(tile => (
                      <div className="reference-item" key={tile.key}>
                        <div className="reference-image-container">
                          <img src={tile.url} alt={tile.name} className="reference-image" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = dummyReference; }} />
                          <div className="reference-info">
                            <span className="reference-name">{tile.name}</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {editedShot.vfxPreparations?.cleanplates && (
              <div className="vfx-option-group card">
                <h3>{t('vfx.checklist.cleanplates')}</h3>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>{t('common.notes')}:</label>
                    <textarea
                      placeholder="Kameraeinstellungen, Zeitpunkt, Bewegung …"
                      value={editedShot.vfxPreparations?.cleanplatesDetails?.notes || ''}
                      onChange={(e) => handleVFXDetailChange('cleanplatesDetails', 'notes', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>Clean Plates:</label>
                    <label htmlFor="vfx-upload-cleanplates" className="btn-outline">Fotos hinzufügen</label>
                    <input
                      id="vfx-upload-cleanplates"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReferenceUploadFor('vfx-cleanplates')}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                {/* Mini-Preview: Cleanplates */}
                <div className="references-subgrid" style={{ marginTop: '6px' }}>
                  {(() => {
                    const refsForCat = references.filter(ref => ref.category === 'vfx-cleanplates');
                    const tiles = [];
                    for (let i = 0; i < 3; i++) {
                      const ref = refsForCat[i];
                      if (ref) {
                        if (typeof ref === 'string') {
                          tiles.push({ key: `mini-clean-${i}-${ref}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-cleanplates-${i}`), name: ref });
                        } else {
                          tiles.push({ key: `mini-clean-${i}-${ref.id}`, url: ref.url, name: ref.name });
                        }
                      } else {
                        tiles.push({ key: `mini-clean-dummy-${i}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-cleanplates-${i}`), name: `Ref ${i+1}` });
                      }
                    }
                    return tiles.map(tile => (
                      <div className="reference-item" key={tile.key}>
                        <div className="reference-image-container">
                          <img src={tile.url} alt={tile.name} className="reference-image" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = dummyReference; }} />
                          <div className="reference-info">
                            <span className="reference-name">{tile.name}</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {editedShot.vfxPreparations?.chromeBall && (
              <div className="vfx-option-group card">
                <h3>{t('vfx.checklist.chromeBall')}</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Größe:</label>
                    <input
                      type="text"
                      placeholder="z.B. 7cm"
                      value={editedShot.vfxPreparations?.chromeBallDetails?.size || ''}
                      onChange={(e) => handleVFXDetailChange('chromeBallDetails', 'size', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>{t('common.notes')}:</label>
                    <textarea
                      placeholder="Aufhängung, Position, Reflektionen …"
                      value={editedShot.vfxPreparations?.chromeBallDetails?.notes || ''}
                      onChange={(e) => handleVFXDetailChange('chromeBallDetails', 'notes', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>Chrome Ball Fotos:</label>
                    <label htmlFor="vfx-upload-chrome" className="btn-outline">Fotos hinzufügen</label>
                    <input
                      id="vfx-upload-chrome"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReferenceUploadFor('vfx-chrome-ball')}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                {/* Mini-Preview: Chrome Ball */}
                <div className="references-subgrid" style={{ marginTop: '6px' }}>
                  {(() => {
                    const refsForCat = references.filter(ref => ref.category === 'vfx-chrome-ball');
                    const tiles = [];
                    for (let i = 0; i < 3; i++) {
                      const ref = refsForCat[i];
                      if (ref) {
                        if (typeof ref === 'string') {
                          tiles.push({ key: `mini-chrome-${i}-${ref}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-chrome-ball-${i}`), name: ref });
                        } else {
                          tiles.push({ key: `mini-chrome-${i}-${ref.id}`, url: ref.url, name: ref.name });
                        }
                      } else {
                        tiles.push({ key: `mini-chrome-dummy-${i}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-chrome-ball-${i}`), name: `Ref ${i+1}` });
                      }
                    }
                    return tiles.map(tile => (
                      <div className="reference-item" key={tile.key}>
                        <div className="reference-image-container">
                          <img src={tile.url} alt={tile.name} className="reference-image" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = dummyReference; }} />
                          <div className="reference-info">
                            <span className="reference-name">{tile.name}</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {editedShot.vfxPreparations?.grayBall && (
              <div className="vfx-option-group card">
                <h3>{t('vfx.checklist.grayBall')}</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Größe:</label>
                    <input
                      type="text"
                      placeholder="z.B. 18% Grey, 7cm"
                      value={editedShot.vfxPreparations?.grayBallDetails?.size || ''}
                      onChange={(e) => handleVFXDetailChange('grayBallDetails', 'size', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>{t('common.notes')}:</label>
                    <textarea
                      placeholder="Position, Beleuchtung …"
                      value={editedShot.vfxPreparations?.grayBallDetails?.notes || ''}
                      onChange={(e) => handleVFXDetailChange('grayBallDetails', 'notes', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>Grey Ball Fotos:</label>
                    <label htmlFor="vfx-upload-gray" className="btn-outline">Fotos hinzufügen</label>
                    <input
                      id="vfx-upload-gray"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReferenceUploadFor('vfx-gray-ball')}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                {/* Mini-Preview: Gray Ball */}
                <div className="references-subgrid" style={{ marginTop: '6px' }}>
                  {(() => {
                    const refsForCat = references.filter(ref => ref.category === 'vfx-gray-ball');
                    const tiles = [];
                    for (let i = 0; i < 3; i++) {
                      const ref = refsForCat[i];
                      if (ref) {
                        if (typeof ref === 'string') {
                          tiles.push({ key: `mini-gray-${i}-${ref}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-gray-ball-${i}`), name: ref });
                        } else {
                          tiles.push({ key: `mini-gray-${i}-${ref.id}`, url: ref.url, name: ref.name });
                        }
                      } else {
                        tiles.push({ key: `mini-gray-dummy-${i}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-gray-ball-${i}`), name: `Ref ${i+1}` });
                      }
                    }
                    return tiles.map(tile => (
                      <div className="reference-item" key={tile.key}>
                        <div className="reference-image-container">
                          <img src={tile.url} alt={tile.name} className="reference-image" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = dummyReference; }} />
                          <div className="reference-info">
                            <span className="reference-name">{tile.name}</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {editedShot.vfxPreparations?.colorChecker && (
              <div className="vfx-option-group card">
                <h3>{t('vfx.checklist.colorChecker')}</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>WB Ziel:</label>
                    <input
                      type="text"
                      placeholder="z.B. 5600K"
                      value={editedShot.vfxPreparations?.colorCheckerDetails?.wb || ''}
                      onChange={(e) => handleVFXDetailChange('colorCheckerDetails', 'wb', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>{t('common.notes')}:</label>
                    <textarea
                      placeholder="Licht, Winkel, Abstand …"
                      value={editedShot.vfxPreparations?.colorCheckerDetails?.notes || ''}
                      onChange={(e) => handleVFXDetailChange('colorCheckerDetails', 'notes', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>ColorChecker Fotos:</label>
                    <label htmlFor="vfx-upload-colorchecker" className="btn-outline">Fotos hinzufügen</label>
                    <input
                      id="vfx-upload-colorchecker"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReferenceUploadFor('vfx-color-checker')}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                {/* Mini-Preview: ColorChecker */}
                <div className="references-subgrid" style={{ marginTop: '6px' }}>
                  {(() => {
                    const refsForCat = references.filter(ref => ref.category === 'vfx-color-checker');
                    const tiles = [];
                    for (let i = 0; i < 3; i++) {
                      const ref = refsForCat[i];
                      if (ref) {
                        if (typeof ref === 'string') {
                          tiles.push({ key: `mini-cc-${i}-${ref}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-color-checker-${i}`), name: ref });
                        } else {
                          tiles.push({ key: `mini-cc-${i}-${ref.id}`, url: ref.url, name: ref.name });
                        }
                      } else {
                        tiles.push({ key: `mini-cc-dummy-${i}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-color-checker-${i}`), name: `Ref ${i+1}` });
                      }
                    }
                    return tiles.map(tile => (
                      <div className="reference-item" key={tile.key}>
                        <div className="reference-image-container">
                          <img src={tile.url} alt={tile.name} className="reference-image" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = dummyReference; }} />
                          <div className="reference-info">
                            <span className="reference-name">{tile.name}</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {editedShot.vfxPreparations?.measurementsTaken && (
              <div className="vfx-option-group card">
                <h3>{t('vfx.checklist.measurementsTaken')}</h3>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>{t('common.notes')}:</label>
                    <textarea
                      placeholder="Zusätzliche Messhinweise"
                      value={editedShot.vfxPreparations?.measurementsDetails?.notes || ''}
                      onChange={(e) => handleVFXDetailChange('measurementsDetails', 'notes', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>Mess‑Fotos:</label>
                    <label htmlFor="vfx-upload-measurements" className="btn-outline">Fotos hinzufügen</label>
                    <input
                      id="vfx-upload-measurements"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReferenceUploadFor('vfx-measurements')}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                {/* Mini-Preview: Measurements */}
                <div className="references-subgrid" style={{ marginTop: '6px' }}>
                  {(() => {
                    const refsForCat = references.filter(ref => ref.category === 'vfx-measurements');
                    const tiles = [];
                    for (let i = 0; i < 3; i++) {
                      const ref = refsForCat[i];
                      if (ref) {
                        if (typeof ref === 'string') {
                          tiles.push({ key: `mini-meas-${i}-${ref}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-measurements-${i}`), name: ref });
                        } else {
                          tiles.push({ key: `mini-meas-${i}-${ref.id}`, url: ref.url, name: ref.name });
                        }
                      } else {
                        tiles.push({ key: `mini-meas-dummy-${i}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-measurements-${i}`), name: `Ref ${i+1}` });
                      }
                    }
                    return tiles.map(tile => (
                      <div className="reference-item" key={tile.key}>
                        <div className="reference-image-container">
                          <img src={tile.url} alt={tile.name} className="reference-image" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = dummyReference; }} />
                          <div className="reference-info">
                            <span className="reference-name">{tile.name}</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {editedShot.vfxPreparations?.threeDScans && (
              <div className="vfx-option-group card">
                <h3>3D Scans</h3>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>{t('common.notes')}:</label>
                    <textarea
                      placeholder="Methode, Formate, Abdeckung …"
                      value={editedShot.vfxPreparations?.threeDScansDetails?.notes || ''}
                      onChange={(e) => handleVFXDetailChange('threeDScansDetails', 'notes', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group" style={{ width: '100%' }}>
                    <label>Scan‑Referenzen:</label>
                    <label htmlFor="vfx-upload-3dscans" className="btn-outline">Fotos hinzufügen</label>
                    <input
                      id="vfx-upload-3dscans"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReferenceUploadFor('vfx-3d-scans')}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                {/* Mini-Preview: 3D Scans */}
                <div className="references-subgrid" style={{ marginTop: '6px' }}>
                  {(() => {
                    const refsForCat = references.filter(ref => ref.category === 'vfx-3d-scans');
                    const tiles = [];
                    for (let i = 0; i < 3; i++) {
                      const ref = refsForCat[i];
                      if (ref) {
                        if (typeof ref === 'string') {
                          tiles.push({ key: `mini-3d-${i}-${ref}`, url: dummyReference, name: ref });
                        } else {
                          tiles.push({ key: `mini-3d-${i}-${ref.id}`, url: ref.url, name: ref.name });
                        }
                      } else {
                        tiles.push({ key: `mini-3d-dummy-${i}`, url: makeRealImageUrl(`${(editedShot?.name || shot?.name || ('SH_' + String(id).slice(-3)))}-vfx-3d-scans-${i}`), name: `Ref ${i+1}` });
                      }
                    }
                    return tiles.map(tile => (
                      <div className="reference-item" key={tile.key}>
                        <div className="reference-image-container">
                          <img src={tile.url} alt={tile.name} className="reference-image" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = dummyReference; }} />
                          <div className="reference-info">
                            <span className="reference-name">{tile.name}</span>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {/* References */}
      {(() => {
        const vfxSelections = isEditing ? (editedShot?.vfxPreparations || {}) : (shot?.vfxPreparations || {});
        const hasAnyVFXSelected = Object.entries(vfxSelections).some(([key, val]) => !key.endsWith('Details') && !!val);
        if (!hasAnyVFXSelected) return null;
        return (
          <div className="references card">
            <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Referenzen</h2>
              {isEditing && (
                <button
                  type="button"
                  className="collapse-toggle"
                  onClick={() => setReferencesCollapsed(prev => !prev)}
                  aria-label={isReferencesCollapsed ? 'Erweitern' : 'Minimieren'}
                  title={isReferencesCollapsed ? 'Erweitern' : 'Minimieren'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 1 }}
                >
                  {isReferencesCollapsed ? (<FiChevronDown size={24} />) : (<FiChevronUp size={24} />)}
                </button>
              )}
            </div>
            {/* Skalierungs-Slider entfernt, Bilder passen sich automatisch an */}
            {/* Drei Abschnitte mit Überschriften und Upload-Button je Abschnitt */}
            <div className="references-sections" style={{ display: isEditing && isReferencesCollapsed ? 'none' : 'block' }}>
              {(() => {
                const sections = [
                  { key: 'set-fotos', title: 'SETFOTOS' },
                  { key: 'hdri', title: 'HDRI' },
                  { key: 'setup-fotos', title: 'Setup Fotos' },
                  { key: 'vfx-distortion-grids', title: 'Distortion Grids' },
                  { key: 'vfx-set-references', title: 'Set‑Referenzen' },
                  { key: 'vfx-cleanplates', title: 'Clean Plates' },
                  { key: 'vfx-chrome-ball', title: 'Chrome Ball' },
                  { key: 'vfx-gray-ball', title: 'Grey Ball' },
                  { key: 'vfx-color-checker', title: 'ColorChecker' },
                  { key: 'vfx-measurements', title: 'Mess‑Fotos' },
                  { key: 'vfx-3d-scans', title: '3D Scans' }
                ];
                const controlMap = {
                  'hdri': 'hdris',
                  'vfx-distortion-grids': 'distortionGrids',
                  'vfx-set-references': 'setReferences',
                  'vfx-cleanplates': 'cleanplates',
                  'vfx-chrome-ball': 'chromeBall',
                  'vfx-gray-ball': 'grayBall',
                  'vfx-color-checker': 'colorChecker',
                  'vfx-measurements': 'measurementsTaken',
                  'vfx-3d-scans': 'threeDScans'
                };
                const vfxSelections = isEditing ? (editedShot?.vfxPreparations || {}) : (shot?.vfxPreparations || {});
                const shouldInclude = (section) => {
                  const controlling = controlMap[section.key];
                  if (!controlling) return false; // allgemeine Kategorien ausblenden
                  return !!vfxSelections[controlling];
                };
                const effectiveSections = sections.filter(shouldInclude);
                return effectiveSections.map(section => {
                  const refsForCat = references.filter(ref => ref.category === section.key);
                  const tiles = [];
                  for (let i = 0; i < 3; i++) {
                    const ref = refsForCat[i];
                    if (ref) {
                      if (typeof ref === 'string') {
                        tiles.push({ key: `grid-${section.key}-${i}-${ref}`, url: dummyReference, name: ref });
                      } else {
                        tiles.push({ key: `grid-${section.key}-${i}-${ref.id}`, url: ref.url, name: ref.name, refId: ref.id });
                      }
                    } else {
                      tiles.push({ key: `grid-${section.key}-dummy-${i}`, url: dummyReference, name: `${section.title} ${i+1}` });
                    }
                  }
                  return (
                      <div className="references-section" key={`section-${section.key}`}>
                        <div className="references-section-header">
                          <h3 className="references-section-title">{section.title}</h3>
                        </div>
                        <div className="references-subgrid">
                          {tiles.map(tile => (
                            <div className="reference-item" key={tile.key}>
                              <div className="reference-image-container">
                                <img src={tile.url} alt={tile.name} className="reference-image" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = dummyReference; }} />
                                <div className="reference-info">
                                  <span className="reference-name">{tile.name}</span>
                                  {isEditing && tile.refId && (
                                    <button type="button" className="btn-annotate" onClick={() => openAnnotatorForReference(tile.refId, tile.url, tile.name)}>Annotieren</button>
                                  )}
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
        );
      })()}

      {annotatorState.open && (
        <ImageAnnotatorModal
          imageUrl={annotatorState.imageUrl}
          onApply={annotatorState.kind === 'preview' ? applyAnnotationToPreview : applyAnnotationToRef}
          onClose={closeAnnotator}
          title={annotatorState.title}
        />
      )}

      {/* TAKES */}
      <div className="takes card">
        <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>TAKES</h2>
          {isEditing && (
            <button type="button" className="btn btn-secondary" onClick={addTake} title="Take hinzufügen">
              <FiPlus style={{ marginRight: 6 }} /> Take hinzufügen
            </button>
          )}
        </div>
        {isEditing ? (
          <div className="takes-edit-list">
            {(editedShot?.takes || []).length === 0 ? (
              <div className="info-item"><label><strong>Hinweis</strong>:</label><span className="info-value">Noch keine Takes hinzugefügt.</span></div>
            ) : (
              (editedShot.takes || []).map(take => (
                <div key={take.id} className="take-item">
                  <div className="take-header">
                    <span className="take-name">{take.name}</span>
                    <button type="button" className="btn-outline take-remove" onClick={() => removeTake(take.id)} title="Take entfernen">
                      <FiTrash />
                    </button>
                  </div>
                  <div className="take-content">
                    <div className="form-group" style={{ width: '100%' }}>
                      <label>Notiz:</label>
                      <textarea
                        value={take.note || ''}
                        placeholder="Kurze Notiz zum Take"
                        onChange={(e) => updateTakeNote(take.id, e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ width: '100%' }}>
                      <label>Änderungen:</label>
                      <textarea
                        value={take.changes || ''}
                        placeholder="Geänderte Punkte, Abweichungen, Hinweise …"
                        onChange={(e) => updateTakeChanges(take.id, e.target.value)}
                      />
                    </div>
                    <div className="take-ratings" aria-label="Schnellbewertung">
                      {["DIR","DOP","VFX"].map((label, idx) => (
                        <div key={`rating-${take.id}-${idx}`} className="rating-item">
                          <span className="rating-label">{label}</span>
                          <button
                            type="button"
                            className={`rating-dot ${take.ratings?.[idx] || 'none'}`}
                            onClick={() => toggleTakeRating(take.id, idx)}
                            title={`${label} Bewertung`}
                            aria-label={`${label} Bewertung: ${take.ratings?.[idx] || 'none'}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="takes-readonly-list">
            {(shot?.takes || []).length === 0 ? (
              <div className="info-item"><label><strong>Hinweis</strong>:</label><span className="info-value">Keine Takes vorhanden.</span></div>
            ) : (
              (shot.takes || []).map(take => (
                <div key={take.id} className="take-item">
                  <div className="take-header">
                    <span className="take-name">{take.name}</span>
                  </div>
                  <div className="take-content">
                    {take.note && (
                      <div className="info-item" style={{ width: '100%' }}>
                        <label><strong>Notiz</strong>:</label>
                        <span className="info-value">{take.note}</span>
                      </div>
                    )}
                    {take.changes && (
                      <div className="info-item" style={{ width: '100%' }}>
                        <label><strong>Änderungen</strong>:</label>
                        <span className="info-value">{take.changes}</span>
                      </div>
                    )}
                    <div className="take-ratings readonly" aria-label="Schnellbewertung">
                      {["DIR","DOP","VFX"].map((label, idx) => (
                        <div key={`rating-ro-${take.id}-${idx}`} className="rating-item">
                          <span className="rating-label">{label}</span>
                          <span
                            className={`rating-dot ${take.ratings?.[idx] || 'none'}`}
                            title={`${label} Bewertung`}
                            aria-label={`${label} Bewertung: ${take.ratings?.[idx] || 'none'}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShotDetails;