import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { maybeAutoBackup } from '../utils/versioningManager';
import { compactProjectsForStorage, trySetLocalStorage } from '../utils/shotFileManager';
import './Dashboard.css';
import Icon from '../components/Icon';
import { useTeam } from '../contexts/TeamContext';
import storyboard1 from '../assets/storyboard-scribble-1.svg';
import storyboard2 from '../assets/storyboard-scribble-2.svg';
import storyboard3 from '../assets/storyboard-scribble-3.svg';
import storyboard4 from '../assets/storyboard-scribble-4.svg';

// Einfacher Cropper mit Drag (Pan) und Zoom, 16:9 Bühne
const ImageCropperModal = ({ src, aspect = 16/9, onCancel, onApply }) => {
  // Hooks werden oben importiert, hier direkt verwenden: useState, useEffect, useRef
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [iw, setIw] = useState(0);
  const [ih, setIh] = useState(0);
  const [cw, setCw] = useState(0);
  const [ch, setCh] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [ox, setOx] = useState(0);
  const [oy, setOy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateStageSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setCw(rect.width);
      setCh(rect.height);
    };
    updateStageSize();
    window.addEventListener('resize', updateStageSize);
    return () => window.removeEventListener('resize', updateStageSize);
  }, []);

  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img || !containerRef.current) return;
    const iw0 = img.naturalWidth;
    const ih0 = img.naturalHeight;
    setIw(iw0);
    setIh(ih0);
    const rect = containerRef.current.getBoundingClientRect();
    const cw0 = rect.width;
    const ch0 = rect.height;
    setCw(cw0);
    setCh(ch0);
    const mZoom = Math.max(cw0 / iw0, ch0 / ih0);
    setMinZoom(mZoom);
    setZoom(mZoom);
    const dw0 = iw0 * mZoom;
    const dh0 = ih0 * mZoom;
    setOx((cw0 - dw0) / 2);
    setOy((ch0 - dh0) / 2);
  };

  const clampOffsets = (oxVal, oyVal, z) => {
    const dw = iw * z;
    const dh = ih * z;
    const minX = cw - dw;
    const maxX = 0;
    const minY = ch - dh;
    const maxY = 0;
    const cx = Math.min(Math.max(oxVal, minX), maxX);
    const cy = Math.min(Math.max(oyVal, minY), maxY);
    return { x: cx, y: cy };
  };

  const onMouseDown = (e) => {
    setDragging(true);
    setStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const { x, y } = clampOffsets(ox + dx, oy + dy, zoom);
    setOx(x);
    setOy(y);
    setStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };
  const onMouseUp = () => setDragging(false);
  const onMouseLeave = () => setDragging(false);

  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY;
    const step = (minZoom * 0.05);
    let newZoom = zoom + (delta > 0 ? -step : step);
    if (newZoom < minZoom) newZoom = minZoom;
    if (newZoom > minZoom * 4) newZoom = minZoom * 4;
    const { x, y } = clampOffsets(ox, oy, newZoom);
    setZoom(newZoom);
    setOx(x);
    setOy(y);
  };

  const reset = () => {
    const dw0 = iw * minZoom;
    const dh0 = ih * minZoom;
    setZoom(minZoom);
    setOx((cw - dw0) / 2);
    setOy((ch - dh0) / 2);
  };

  const apply = async () => {
    const targetW = 1280;
    const targetH = 720;
    const scaleX = targetW / cw;
    const scaleY = targetH / ch;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    await new Promise(res => { if (img.complete) res(); else img.onload = res; });
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    const dw = iw * zoom;
    const dh = ih * zoom;
    ctx.drawImage(img, ox * scaleX, oy * scaleY, dw * scaleX, dh * scaleY);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onApply(dataUrl);
  };

  return (
    <div className="image-editor-backdrop" role="dialog" aria-modal="true">
      <div className="image-editor-modal">
        <div
          className="crop-stage"
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onWheel={onWheel}
        >
          <img
            ref={imgRef}
            src={src}
            alt="Crop"
            onLoad={onImgLoad}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translate(${ox}px, ${oy}px) scale(${zoom})`,
              transformOrigin: 'top left',
              willChange: 'transform',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
          <div className="grid-overlay">
            <div className="grid-line vertical" style={{ left: '33.333%' }} />
            <div className="grid-line vertical" style={{ left: '66.666%' }} />
            <div className="grid-line horizontal" style={{ top: '33.333%' }} />
            <div className="grid-line horizontal" style={{ top: '66.666%' }} />
          </div>
        </div>
        <div className="crop-controls">
          <label>Zoom</label>
          <input
            type="range"
            min={minZoom}
            max={minZoom * 4}
            step={minZoom * 0.01}
            value={zoom}
            onChange={(e) => {
              const z = parseFloat(e.target.value);
              const { x, y } = clampOffsets(ox, oy, z);
              setZoom(z);
              setOx(x);
              setOy(y);
            }}
          />
          <div className="crop-actions">
            <button className="btn-secondary" type="button" onClick={reset}>Zurücksetzen</button>
            <div style={{ flex: 1 }} />
            <button className="btn-secondary" type="button" onClick={onCancel}>Abbrechen</button>
            <button className="btn-primary" type="button" onClick={apply}>Zuschneiden & übernehmen</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { t, language } = useLanguage();
  const { teams } = useTeam();
  const teamById = Object.fromEntries(teams.map(team => [team.id, team]));
  const localeMap = { de: 'de-DE', en: 'en-US', fr: 'fr-FR', es: 'es-ES' };
  const getCreatedTs = (p) => (p && p.createdAt ? Date.parse(p.createdAt) || 0 : 0);
  const sortByNewest = (arr) => arr.slice().sort((a, b) => getCreatedTs(b) - getCreatedTs(a));
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('projects');
    const initial = savedProjects ? JSON.parse(savedProjects) : [
      {
        id: 1,
        name: 'Projekt Codename: Phoenix',
        director: 'Martin Schmidt',
        vfxSupervisor: 'Du',
        production: 'Studio XYZ',
        cinematographer: 'Anna Müller',
        shotCount: 24,
        completedShots: 8,
        createdAt: new Date().toISOString()
      }
    ];
    return sortByNewest(initial);
  });
  
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    return parseInt(localStorage.getItem('selectedProjectId')) || 1;
  });
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    code: '',
    director: '',
    vfxSupervisor: '',
    production: '',
    cinematographer: '',
    shotCount: 0,
    completedShots: 0,
    teamId: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  // Bild-Cropper Status
  const [imageEditor, setImageEditor] = useState(null); // { mode: 'new'|'edit', src }
  const [isDragOverNew, setIsDragOverNew] = useState(false);
  const [isDragOverEdit, setIsDragOverEdit] = useState(false);
  
  // Autosave Projekt-Änderungen: speichere sofort bei jeder Eingabe
  useEffect(() => {
    if (!isEditing || !editDraft || !editDraft.id) return;
    setProjects(prev => sortByNewest(prev.map(p => {
      if (p.id === editDraft.id) {
        return {
          ...p,
          name: editDraft.name,
          production: editDraft.production,
          director: editDraft.director,
          cinematographer: editDraft.cinematographer,
          vfxSupervisor: editDraft.vfxSupervisor,
          shotCount: editDraft.shotCount,
          completedShots: editDraft.completedShots,
          teamId: editDraft.teamId ?? null,
        };
      }
      return p;
    })));
  }, [isEditing, editDraft]);
  
  // Ausgewähltes Projekt finden
  // Funktion um die Akzentfarbe für ein Projekt zu erhalten
  const getProjectAccentColor = (projectId) => {
    const projectIndex = projects.findIndex(p => p.id === projectId);
    const colors = [
      '#4a90e2', // Blau
      '#27ae60', // Grün  
      '#e67e22', // Orange
      '#9b59b6', // Lila
      '#f1c40f', // Gelb
      '#e74c3c', // Rot
      '#1abc9c', // Türkis
      '#34495e', // Dunkelgrau
      '#f39c12', // Dunkelorange
      '#2ecc71'  // Hellgrün
    ];
    return colors[projectIndex % colors.length] || '#4a90e2';
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  
  // Vorschaubild für Projekte bestimmen (Fallback auf Storyboard-Varianten)
  const getProjectPreviewSrc = (project) => {
    if (project?.previewImage) return project.previewImage;
    try {
      const name = project?.name || 'Projekt';
      const hashSeed = (s) => [...String(s)].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
      const variants = [storyboard1, storyboard2, storyboard3, storyboard4];
      const idx = Math.abs(hashSeed(name)) % variants.length;
      return variants[idx];
    } catch {
      return storyboard1;
    }
  };

  // Fallback auch bei Erstellung neuer Projekte verwenden
  const computeProjectPreviewFallback = (name) => {
    try {
      const hashSeed = (s) => [...String(s)].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
      const variants = [storyboard1, storyboard2, storyboard3, storyboard4];
      const idx = Math.abs(hashSeed(name || 'Projekt')) % variants.length;
      return variants[idx];
    } catch {
      return storyboard1;
    }
  };
  const stats = selectedProject ? [
    { label: t('dashboard.plannedShotsCount'), value: selectedProject.shotCount },
    { label: `${t('status.completed')} ${t('shot.plural')}`, value: selectedProject.completedShots },
    { label: t('dashboard.progress'), value: `${Math.round((selectedProject.completedShots / (selectedProject.shotCount || 1)) * 100)}%` }
  ] : [];


  
  // Speichere Projekte in localStorage wenn sie sich ändern (kompakt)
  useEffect(() => {
    const compact = compactProjectsForStorage(projects);
    const ok = trySetLocalStorage('projects', JSON.stringify(compact));
    if (!ok) {
      try { localStorage.setItem('projects', JSON.stringify(compact)); } catch {}
    }
  }, [projects]);

  // Speichere ausgewähltes Projekt in localStorage
  useEffect(() => {
    localStorage.setItem('selectedProjectId', selectedProjectId);
  }, [selectedProjectId]);

  // New-Project Draft laden, wenn Formular geöffnet wird
  useEffect(() => {
    if (showNewProjectForm) {
      try {
        const draft = localStorage.getItem('newProjectDraft');
        if (draft) {
          const parsed = JSON.parse(draft);
          setNewProject(prev => ({
            name: parsed.name ?? prev.name ?? '',
            code: parsed.code ?? prev.code ?? '',
            director: parsed.director ?? prev.director ?? '',
            vfxSupervisor: parsed.vfxSupervisor ?? prev.vfxSupervisor ?? '',
            production: parsed.production ?? prev.production ?? '',
            cinematographer: parsed.cinematographer ?? prev.cinematographer ?? '',
            shotCount: typeof parsed.shotCount === 'number' ? parsed.shotCount : (parseInt(parsed.shotCount) || prev.shotCount || 0),
            completedShots: typeof parsed.completedShots === 'number' ? parsed.completedShots : (parseInt(parsed.completedShots) || prev.completedShots || 0),
            teamId: typeof parsed.teamId === 'number' ? parsed.teamId : (parseInt(parsed.teamId) || prev.teamId || null),
            previewImage: parsed.previewImage ?? prev.previewImage ?? null,
          }));
        }
      } catch (e) {}
    }
  }, [showNewProjectForm]);

  // Draft bei Änderungen persistieren (nur wenn Formular offen)
  useEffect(() => {
    if (showNewProjectForm) {
      try {
        localStorage.setItem('newProjectDraft', JSON.stringify(newProject));
      } catch (e) {}
    }
  }, [newProject, showNewProjectForm]);

  // Neues Projekt hinzufügen
  const handleAddProject = () => {
    if (newProject.name.trim() === '') return;
    

    const dummyShots = [];
    const shotCount = parseInt(newProject.shotCount) || 0;
    
    for (let i = 0; i < shotCount; i++) {
      dummyShots.push({
        id: Date.now() + i,
        name: `SH_${String(i + 1).padStart(3, '0')}`,
        description: 'Neuer Shot',
        status: 'Ausstehend',
        notes: '',
        cameraSettings: { model: '', lens: '', focalLength: '', aperture: '', iso: '' }
      });
    }
    
    const newProjectWithId = {
      ...newProject,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      completedShots: 0,
      shots: dummyShots, // Array mit der angegebenen Anzahl an Dummy-Shots
      previewImage: newProject.previewImage || computeProjectPreviewFallback(newProject.name)
    };
    
    const updatedProjects = sortByNewest([...projects, newProjectWithId]);
    setProjects(updatedProjects);
    setSelectedProjectId(newProjectWithId.id);
    setShowNewProjectForm(false);
    setNewProject({
      name: '',
      code: '',
      director: '',
      vfxSupervisor: '',
      production: '',
      cinematographer: '',
      shotCount: 0,
      completedShots: 0,
      teamId: null,
      previewImage: null,
    });
    try { localStorage.removeItem('newProjectDraft'); } catch {}
    // Auto-Backup nach Erstellung eines Projekts
    try { maybeAutoBackup({ note: 'Projekt erstellt', source: 'dashboard' }); } catch {}
  };
  
  // Eingabefeld-Änderungen verarbeiten
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]:
        name === 'shotCount' ? (parseInt(value) || 0)
        : name === 'teamId' ? (parseInt(value) || null)
        : value
    }));
  };

  // Bild-Upload für neues Projekt (öffnet Cropper)
  const handleNewProjectImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setImageEditor({ mode: 'new', src: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleClearNewProjectImage = () => {
    setNewProject(prev => ({ ...prev, previewImage: null }));
  };

  // Drag & Drop für neues Projekt
  const handleDragOverNew = (e) => { e.preventDefault(); setIsDragOverNew(true); };
  const handleDragLeaveNew = (e) => { e.preventDefault(); setIsDragOverNew(false); };
  const handleDropNew = (e) => {
    e.preventDefault();
    setIsDragOverNew(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setImageEditor({ mode: 'new', src: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  // Cropper Steuerung
  const openImageEditor = (mode, src) => setImageEditor({ mode, src });
  const closeImageEditor = () => setImageEditor(null);
  const handleCropApply = (croppedDataUrl) => {
    if (!imageEditor) return;
    if (imageEditor.mode === 'new') {
      setNewProject(prev => ({ ...prev, previewImage: croppedDataUrl }));
    } else if (imageEditor.mode === 'edit') {
      setEditDraft(prev => ({ ...prev, previewImage: croppedDataUrl }));
    }
    setImageEditor(null);
  };

  // Projekt löschen mit Bestätigung
  const handleDeleteProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjectToDelete(project);
      setShowDeleteConfirmation(true);
    }
  };

  // Projekt bearbeiten starten
  const startEdit = () => {
    if (!selectedProject) return;
    setEditDraft({
      id: selectedProject.id,
      name: selectedProject.name || '',
      code: selectedProject.code || '',
      production: selectedProject.production || '',
      director: selectedProject.director || '',
      cinematographer: selectedProject.cinematographer || '',
      vfxSupervisor: selectedProject.vfxSupervisor || '',
      shotCount: parseInt(selectedProject.shotCount) || 0,
      completedShots: parseInt(selectedProject.completedShots) || 0,
      teamId: selectedProject.teamId || null,
      previewImage: selectedProject.previewImage || null,
    });
    setIsEditing(true);
  };

  // Eingaben im Bearbeiten-Formular verarbeiten
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditDraft(prev => ({
      ...prev,
      [name]: (name === 'shotCount' || name === 'completedShots') ? (parseInt(value) || 0)
        : name === 'teamId' ? (parseInt(value) || null)
        : value
    }));
  };

  // Bild-Upload für Projekt-Bearbeitung (öffnet Cropper)
  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setImageEditor({ mode: 'edit', src: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleClearEditImage = () => {
    setEditDraft(prev => ({ ...prev, previewImage: null }));
  };

  // Drag & Drop für Bearbeiten
  const handleDragOverEdit = (e) => { e.preventDefault(); setIsDragOverEdit(true); };
  const handleDragLeaveEdit = (e) => { e.preventDefault(); setIsDragOverEdit(false); };
  const handleDropEdit = (e) => {
    e.preventDefault();
    setIsDragOverEdit(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setImageEditor({ mode: 'edit', src: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  // Änderungen speichern
  const handleSaveEdit = () => {
    if (!editDraft || !editDraft.name || editDraft.name.trim() === '') return;
    const updatedProjects = sortByNewest(projects.map(p => {
      if (p.id === selectedProject.id) {
        return {
          ...p,
          name: editDraft.name,
          production: editDraft.production,
          director: editDraft.director,
          cinematographer: editDraft.cinematographer,
          vfxSupervisor: editDraft.vfxSupervisor,
          shotCount: editDraft.shotCount,
          completedShots: editDraft.completedShots,
          teamId: editDraft.teamId || null,
          previewImage: editDraft.previewImage || null,
        };
      }
      return p;
    }));
    setProjects(updatedProjects);
    setIsEditing(false);
    setEditDraft(null);
    // Auto-Backup nach Projektänderung
    try { maybeAutoBackup({ note: 'Projekt geändert', source: 'dashboard' }); } catch {}
  };

  // Bearbeiten abbrechen
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditDraft(null);
  };
  
  // Bestätigtes Löschen durchführen
  const confirmDeleteProject = () => {
    if (projectToDelete) {
      const updatedProjects = sortByNewest(projects.filter(p => p.id !== projectToDelete.id));
      setProjects(updatedProjects);
      
      // Wenn das gelöschte Projekt das ausgewählte war, wähle das erste verfügbare Projekt aus
      if (projectToDelete.id === selectedProjectId && updatedProjects.length > 0) {
        setSelectedProjectId(updatedProjects[0].id);
      }
      
      setShowDeleteConfirmation(false);
      setProjectToDelete(null);
      // Auto-Backup nach Löschen eines Projekts
      try { maybeAutoBackup({ note: 'Projekt gelöscht', source: 'dashboard' }); } catch {}
    }
  };
  
  // Löschen abbrechen
  const cancelDeleteProject = () => {
    setShowDeleteConfirmation(false);
    setProjectToDelete(null);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h1>{t('nav.dashboard')}</h1>
        <button 
          className="btn-primary" 
          onClick={() => setShowNewProjectForm(!showNewProjectForm)}
        >
          {showNewProjectForm ? t('common.cancel') : t('dashboard.newProject')}
        </button>
      </div>
      
      {/* Bestätigungsdialog für das Löschen */}
      {showDeleteConfirmation && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-dialog">
            <h3>Projekt löschen</h3>
            <p>Möchtest du das Projekt "{projectToDelete?.name}" wirklich löschen?</p>
            <p>Alle zugehörigen Shots werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <div className="delete-confirmation-buttons">
              <button className="btn-secondary" onClick={cancelDeleteProject}>Abbrechen</button>
          <button className="btn-danger" onClick={confirmDeleteProject}>Löschen</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Projektauswahl */}
      <div className="project-selection">
        <div className="section-header">
          <h2>{t('dashboard.myProjects')}</h2>
          <div className="project-count">{projects.length}</div>
        </div>
        
        {projects.length === 0 ? (
          <div className="empty-projects">
            <div className="empty-icon"><Icon name="folder" size={48} /></div>
            <h3>{t('dashboard.emptyTitle')}</h3>
            <p>{t('dashboard.emptyMessage')}</p>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map(project => (
              <div 
                key={project.id} 
                className={`project-card card ${selectedProjectId === project.id ? 'selected' : ''}`}
                onClick={() => setSelectedProjectId(project.id)}
              >
                <div className="project-thumbnail">
                  <img src={getProjectPreviewSrc(project)} alt={`Vorschau für ${project.name}`} />
                </div>
                <div className="project-header">
                  <h3>{project.name}</h3>
                  <div className="project-status">
                    <span className="shots-progress">{project.completedShots}/{project.shotCount}</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${project.shotCount > 0 ? (project.completedShots / project.shotCount) * 100 : 0}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="project-info">
                  <div className="info-row">
                    <span className="info-label">{t('dashboard.director')}:</span>
                    <span className="info-value">{project.director}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{t('vfx.supervisor')}:</span>
                    <span className="info-value">{project.vfxSupervisor}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{t('dashboard.cinematographer')}:</span>
                    <span className="info-value">{project.cinematographer}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{t('dashboard.teamLabel')}:</span>
                    <span className="info-value">{teamById[project.teamId]?.name || t('dashboard.noTeam')}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{t('dashboard.created')}:</span>
                    <span className="info-value">{new Date(project.createdAt).toLocaleDateString(localeMap[language] || language)}</span>
                  </div>
                </div>
                
                <div className="project-actions">
                  <Link 
                    to="/shots" 
                    className="btn-primary btn-small"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t('dashboard.viewShots')}
                  </Link>
                  <button 
                    className="btn-danger btn-small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    title={t('action.delete')}
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Formular für neues Projekt */}
      {showNewProjectForm && (
        <div className="new-project-form card">
          <h2>{t('dashboard.newProject')}</h2>
          <div className="form-group">
            <label>{t('dashboard.projectName')}:</label>
            <input 
              type="text" 
              name="name" 
              value={newProject.name} 
              onChange={handleInputChange} 
              placeholder={t('dashboard.projectNamePlaceholder')}
            />
          </div>
          <div className="form-group">
            <label>{t('dashboard.projectCode', 'Projektkürzel')}:</label>
            <input 
              type="text" 
              name="code" 
              value={newProject.code} 
              onChange={handleInputChange} 
              placeholder={t('dashboard.projectCodePlaceholder', 'z.B. PHX')}
            />
          </div>
          <div className="form-group">
            <label>{t('dashboard.production')}:</label>
            <input 
              type="text" 
              name="production" 
              value={newProject.production} 
              onChange={handleInputChange} 
              placeholder={t('dashboard.productionPlaceholder')}
            />
          </div>
          <div className="form-group">
            <label>{t('dashboard.director')}:</label>
            <input 
              type="text" 
              name="director" 
              value={newProject.director} 
              onChange={handleInputChange} 
              placeholder={t('dashboard.directorPlaceholder')}
            />
          </div>
          <div className="form-group">
            <label>{t('dashboard.cinematographer')}:</label>
            <input 
              type="text" 
              name="cinematographer" 
              value={newProject.cinematographer} 
              onChange={handleInputChange} 
              placeholder={t('dashboard.cinematographerPlaceholder')}
            />
          </div>
          <div className="form-group">
            <label>{t('vfx.supervisor')}:</label>
            <input 
              type="text" 
              name="vfxSupervisor" 
              value={newProject.vfxSupervisor} 
              onChange={handleInputChange} 
              placeholder={t('dashboard.vfxSupervisorPlaceholder')}
            />
          </div>
          <div className="form-group">
            <label>{t('dashboard.teamLabel')}:</label>
            <select name="teamId" value={newProject.teamId ?? ''} onChange={handleInputChange}>
              <option value="">{t('dashboard.selectTeam')}</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t('dashboard.plannedShotsCount')}:</label>
            <input 
              type="number" 
              name="shotCount" 
              value={newProject.shotCount} 
              onChange={handleInputChange} 
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Vorschaubild:</label>
            <div
              className={`image-dropzone ${isDragOverNew ? 'drag-over' : ''}`}
              onDragOver={handleDragOverNew}
              onDragLeave={handleDragLeaveNew}
              onDrop={handleDropNew}
            >
              <p>Bild hierher ziehen oder auswählen</p>
              <input type="file" accept="image/*" onChange={handleNewProjectImageChange} />
              {newProject.previewImage && (
                <>
                  <div className="project-thumbnail" style={{ marginTop: '8px' }}>
                    <img src={newProject.previewImage} alt="Vorschaubild" />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn-secondary btn-small"
                      onClick={() => openImageEditor('new', newProject.previewImage)}
                    >
                      Zuschneiden
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-small"
                      onClick={handleClearNewProjectImage}
                    >
                      Bild entfernen
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <button className="btn-primary" onClick={handleAddProject}>{t('dashboard.createProject')}</button>
        </div>
      )}
      
      {/* Ausgewähltes Projekt Details */}
      {selectedProject && (
        <>
          <div className="project-details-section">
            <h2 className="section-title">{t('dashboard.projectDetails')}</h2>
            <div 
              className="project-info card"
              style={{'--project-accent-color': getProjectAccentColor(selectedProject.id)}}
            >
              {!isEditing ? (
                <>
                  <h3>{selectedProject.name}</h3>
                  <div className="project-details">
                    <p className="detail-row"><strong>{t('dashboard.production')}:</strong><span className="detail-value">{selectedProject.production}</span></p>
                    <p className="detail-row"><strong>{t('dashboard.director')}:</strong><span className="detail-value">{selectedProject.director}</span></p>
                    <p className="detail-row"><strong>{t('dashboard.cinematographer')}:</strong><span className="detail-value">{selectedProject.cinematographer}</span></p>
                    <p className="detail-row"><strong>{t('vfx.supervisor')}:</strong><span className="detail-value">{selectedProject.vfxSupervisor}</span></p>
                    <p className="detail-row"><strong>{t('dashboard.teamLabel')}:</strong><span className="detail-value">{teamById[selectedProject.teamId]?.name || t('dashboard.noTeam')}</span></p>
                  </div>
                  <div className="project-edit-actions">
                    <button className="btn-secondary" onClick={startEdit}>
                      {t('action.edit')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="edit-project-form">
                  <div className="form-group">
                    <label>{t('dashboard.projectName')}:</label>
                    <input
                      type="text"
                      name="name"
                      value={editDraft?.name || ''}
                      onChange={handleEditInputChange}
                      placeholder={t('dashboard.projectNamePlaceholder')}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('dashboard.projectCode', 'Projektkürzel')}:</label>
                    <input
                      type="text"
                      name="code"
                      value={editDraft?.code || ''}
                      onChange={handleEditInputChange}
                      placeholder={t('dashboard.projectCodePlaceholder', 'z.B. PHX')}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('dashboard.production')}:</label>
                    <input
                      type="text"
                      name="production"
                      value={editDraft?.production || ''}
                      onChange={handleEditInputChange}
                      placeholder={t('dashboard.productionPlaceholder')}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('dashboard.director')}:</label>
                    <input
                      type="text"
                      name="director"
                      value={editDraft?.director || ''}
                      onChange={handleEditInputChange}
                      placeholder={t('dashboard.directorPlaceholder')}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('dashboard.cinematographer')}:</label>
                    <input
                      type="text"
                      name="cinematographer"
                      value={editDraft?.cinematographer || ''}
                      onChange={handleEditInputChange}
                      placeholder={t('dashboard.cinematographerPlaceholder')}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('vfx.supervisor')}:</label>
                    <input
                      type="text"
                      name="vfxSupervisor"
                      value={editDraft?.vfxSupervisor || ''}
                      onChange={handleEditInputChange}
                      placeholder={t('dashboard.vfxSupervisorPlaceholder')}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('dashboard.teamLabel')}:</label>
                    <select name="teamId" value={editDraft?.teamId ?? ''} onChange={handleEditInputChange}>
                      <option value="">{t('dashboard.selectTeam')}</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('dashboard.plannedShotsCount')}:</label>
                    <input
                      type="number"
                      name="shotCount"
                      value={editDraft?.shotCount || 0}
                      onChange={handleEditInputChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>{`${t('status.completed')} ${t('shot.plural')}`}:</label>
                    <input
                      type="number"
                      name="completedShots"
                      value={editDraft?.completedShots || 0}
                      onChange={handleEditInputChange}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Vorschaubild:</label>
                    <div
                      className={`image-dropzone ${isDragOverEdit ? 'drag-over' : ''}`}
                      onDragOver={handleDragOverEdit}
                      onDragLeave={handleDragLeaveEdit}
                      onDrop={handleDropEdit}
                    >
                      <p>Bild hierher ziehen oder auswählen</p>
                      <input type="file" accept="image/*" onChange={handleEditImageChange} />
                      {editDraft?.previewImage && (
                        <>
                          <div className="project-thumbnail" style={{ marginTop: '8px' }}>
                            <img src={editDraft.previewImage} alt="Vorschaubild" />
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              className="btn-secondary btn-small"
                              onClick={() => openImageEditor('edit', editDraft.previewImage)}
                            >
                              Zuschneiden
                            </button>
                            <button
                              type="button"
                              className="btn-secondary btn-small"
                              onClick={handleClearEditImage}
                            >
                              Bild entfernen
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="edit-buttons">
                    <button className="btn-primary" onClick={handleSaveEdit}>{t('common.save')}</button>
                    <button className="btn-secondary" onClick={handleCancelEdit}>{t('common.cancel')}</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="stats-container">
            {stats.map((stat, index) => (
              <div className="stat-card card" key={index}>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="quick-actions">
            <Link to="/shots" className="btn-primary">
              {t('nav.shots')}
            </Link>
            <Link to="/notes" className="btn-primary">
              {t('nav.notes')}
            </Link>
          </div>
        </>
      )}
      {imageEditor && (
        <ImageCropperModal
          src={imageEditor.src}
          aspect={16/9}
          onCancel={closeImageEditor}
          onApply={handleCropApply}
        />
      )}
    </div>
  );
};

export default Dashboard;