import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { maybeAutoBackup } from '../utils/versioningManager';
import './Dashboard.css';
import Icon from '../components/Icon';

const Dashboard = () => {
  const { t, language } = useLanguage();
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
    director: '',
    vfxSupervisor: '',
    production: '',
    cinematographer: '',
    shotCount: 0,
    completedShots: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  
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
  
  const stats = selectedProject ? [
    { label: t('dashboard.plannedShotsCount'), value: selectedProject.shotCount },
    { label: `${t('status.completed')} ${t('shot.plural')}`, value: selectedProject.completedShots },
    { label: t('dashboard.progress'), value: `${Math.round((selectedProject.completedShots / (selectedProject.shotCount || 1)) * 100)}%` }
  ] : [];


  
  // Speichere Projekte in localStorage wenn sie sich ändern
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  // Speichere ausgewähltes Projekt in localStorage
  useEffect(() => {
    localStorage.setItem('selectedProjectId', selectedProjectId);
  }, [selectedProjectId]);

  // Neues Projekt hinzufügen
  const handleAddProject = () => {
    if (newProject.name.trim() === '') return;
    
    // Erstelle Dummy-Shots basierend auf der angegebenen Anzahl
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
      shots: dummyShots // Array mit der angegebenen Anzahl an Dummy-Shots
    };
    
    const updatedProjects = sortByNewest([...projects, newProjectWithId]);
    setProjects(updatedProjects);
    setSelectedProjectId(newProjectWithId.id);
    setShowNewProjectForm(false);
    setNewProject({
      name: '',
      director: '',
      vfxSupervisor: '',
      shotCount: 0,
      completedShots: 0
    });
    // Auto-Backup nach Erstellung eines Projekts
    try { maybeAutoBackup({ note: 'Projekt erstellt', source: 'dashboard' }); } catch {}
  };
  
  // Eingabefeld-Änderungen verarbeiten
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({
      ...newProject,
      [name]: name === 'shotCount' ? parseInt(value) || 0 : value
    });
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
      production: selectedProject.production || '',
      director: selectedProject.director || '',
      cinematographer: selectedProject.cinematographer || '',
      vfxSupervisor: selectedProject.vfxSupervisor || '',
      shotCount: parseInt(selectedProject.shotCount) || 0,
      completedShots: parseInt(selectedProject.completedShots) || 0,
    });
    setIsEditing(true);
  };

  // Eingaben im Bearbeiten-Formular verarbeiten
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditDraft(prev => ({
      ...prev,
      [name]: (name === 'shotCount' || name === 'completedShots') ? (parseInt(value) || 0) : value
    }));
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
      <div className="dashboard-header">
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
            <label>{t('dashboard.plannedShotsCount')}:</label>
            <input 
              type="number" 
              name="shotCount" 
              value={newProject.shotCount} 
              onChange={handleInputChange} 
              min="0"
            />
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
    </div>
  );
};

export default Dashboard;