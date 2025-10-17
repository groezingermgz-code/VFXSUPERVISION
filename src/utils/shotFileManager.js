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

// Auto-save functionality - immediate saving with full sync
export const autoSaveShotToFile = (shotId, shotData, delay = 0) => {
  try {
    // Save to individual shot file
    saveShotToFile(shotId, shotData);

    // Also mirror to legacy key for compatibility
    localStorage.setItem(`shot_${shotId}`, JSON.stringify(shotData));

    // Update shot in selected project's shots array
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const projects = JSON.parse(savedProjects);
      const currentProjectId = parseInt(localStorage.getItem('selectedProjectId')) || 1;
      const updatedProjects = projects.map(project => {
        if (project.id === currentProjectId && Array.isArray(project.shots)) {
          const updatedShots = project.shots.map(shot => {
            const match = String(shot.id) === String(shotId);
            return match ? { ...shot, ...shotData } : shot;
          });
          return { ...project, shots: updatedShots };
        }
        return project;
      });
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }
  } catch (error) {
    try { console.error('AutoSave sync error:', error); } catch {}
  }
};