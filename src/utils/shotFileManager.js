// Shot File Manager - Browser-compatible shot storage with individual "files" in localStorage
// Simulates individual JSON files for each shot using localStorage keys

// Save shot data to individual localStorage "file"
export const saveShotToFile = (shotId, shotData) => {
  try {
    const key = `shot-file-${shotId}`;
    const dataToSave = {
      ...shotData,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(dataToSave));
    console.log(`Shot ${shotId} saved to localStorage file:`, key);
    return true;
  } catch (error) {
    console.error(`Error saving shot ${shotId}:`, error);
    return false;
  }
};

// Load shot data from individual localStorage "file"
export const loadShotFromFile = (shotId) => {
  try {
    const key = `shot-file-${shotId}`;
    const fileContent = localStorage.getItem(key);
    if (fileContent) {
      const shotData = JSON.parse(fileContent);
      console.log(`Shot ${shotId} loaded from localStorage file:`, key);
      return shotData;
    } else {
      console.log(`No saved file found for shot ${shotId}, using default data`);
      return null;
    }
  } catch (error) {
    console.error(`Error loading shot ${shotId}:`, error);
    return null;
  }
};

// Check if shot file exists
export const shotFileExists = (shotId) => {
  const key = `shot-file-${shotId}`;
  return localStorage.getItem(key) !== null;
};

// Delete shot file
export const deleteShotFile = (shotId) => {
  try {
    const key = `shot-file-${shotId}`;
    localStorage.removeItem(key);
    console.log(`Shot file ${shotId} deleted`);
    return true;
  } catch (error) {
    console.error(`Error deleting shot file ${shotId}:`, error);
    return false;
  }
};

// List all shot files
export const listShotFiles = () => {
  try {
    const shotFiles = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('shot-file-')) {
        const shotId = key.replace('shot-file-', '');
        shotFiles.push({ shotId, key });
      }
    }
    return shotFiles;
  } catch (error) {
    console.error('Error listing shot files:', error);
    return [];
  }
};

// --- Compact serialization helpers to keep projects lightweight ---
export const compactShotForIndex = (s) => ({
  id: s?.id,
  name: s?.name,
  description: s?.description,
  status: s?.status,
  notes: s?.notes,
  createdBy: s?.createdBy,
  // Keep only small summary of camera settings
  cameraSettings: {
    manufacturer: s?.cameraSettings?.manufacturer,
    model: s?.cameraSettings?.model,
    lensManufacturer: s?.cameraSettings?.lensManufacturer,
    lens: s?.cameraSettings?.lens,
    focalLength: s?.cameraSettings?.focalLength,
    aperture: s?.cameraSettings?.aperture,
    iso: s?.cameraSettings?.iso,
    isAnamorphic: s?.cameraSettings?.isAnamorphic,
  },
  // Keep minimal arrays so list UI can default to 1 setup
  additionalCameraSetups: Array.isArray(s?.additionalCameraSetups) ? [] : [],
  // Deliberately omit heavy fields like previewImage, references, cameraMovement
  projectId: s?.projectId,
});

export const compactProjectsForStorage = (projects) => {
  try {
    return (projects || []).map(p => ({
      ...p,
      shots: Array.isArray(p?.shots) ? p.shots.map(compactShotForIndex) : []
    }));
  } catch {
    return [];
  }
};

export const trySetLocalStorage = (key, jsonString) => {
  try {
    localStorage.setItem(key, jsonString);
    return true;
  } catch (e) {
    try { console.warn(`localStorage set failed for ${key}:`, e?.name || e); } catch {}
    return false;
  }
};

// Auto-save functionality - immediate saving with full sync
export const autoSaveShotToFile = (shotId, shotData, delay = 0) => {
  try {
    // Save to individual shot file
    saveShotToFile(shotId, shotData);

    // Also mirror to legacy key for compatibility
    localStorage.setItem(`shot_${shotId}`, JSON.stringify(shotData));

    // Update shot in selected project's shots array (compact form)
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      const currentProjectId = parseInt(localStorage.getItem('selectedProjectId')) || 1;
      const updatedProjects = projects.map(project => {
        if (project.id === currentProjectId && Array.isArray(project.shots)) {
          const updatedShots = project.shots.map(shot => {
            const match = String(shot.id) === String(shotId);
            const merged = match ? { ...shot, ...shotData } : shot;
            return compactShotForIndex(merged);
          });
          return { ...project, shots: updatedShots };
        }
        return { ...project, shots: Array.isArray(project.shots) ? project.shots.map(compactShotForIndex) : project.shots };
      });

      const ok = trySetLocalStorage('projects', JSON.stringify(updatedProjects));
      if (!ok) {
        const compact = compactProjectsForStorage(updatedProjects);
        trySetLocalStorage('projects', JSON.stringify(compact));
      }
    }
  } catch (error) {
    try { console.error('AutoSave sync error:', error); } catch {}
  }
};