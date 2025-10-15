import { saveShotToFile, listShotFiles } from './shotFileManager';

// Hilfsfunktion: sichere Fetch-Aufrufe ohne Fehlerabbruch
const safeFetch = async (url, options = {}) => {
  try {
    await fetch(url, { cache: 'reload', ...options });
  } catch (e) {
    // Ignoriere Fehler bei Prefetch (z.B. offline oder dev routing)
    console.warn('Prefetch fehlgeschlagen für', url);
  }
};

export const saveAllDataToDevice = async () => {
  // Projekte laden
  const projectsRaw = localStorage.getItem('projects');
  const projects = projectsRaw ? JSON.parse(projectsRaw) : [];

  // Shots aus Projekten speichern (inkl. Bilder/Referenzen in Shot-Objekten)
  let shotsCount = 0;
  for (const project of projects) {
    const shots = Array.isArray(project.shots) ? project.shots : [];
    for (const shot of shots) {
      shotsCount += 1;
      // Schreibe jede Shot-Datei in lokalen "Datei"-Speicher
      saveShotToFile(shot.id, shot);
    }
  }

  // Bestehende "Shot-Dateien" aufzählen (zur Kontrolle/Statistik)
  const shotFiles = listShotFiles();

  // Wichtige Routen prefetchen, damit der Service Worker sie cachen kann
  const baseRoutes = ['/', '/shots', '/notes', '/camera', '/settings'];
  const shotRoutes = [];
  projects.forEach(p => (p.shots || []).forEach(s => {
    shotRoutes.push(`/shots/${s.id}`);
  }));
  const routesToPrefetch = [...new Set([...baseRoutes, ...shotRoutes])];
  for (const r of routesToPrefetch) {
    await safeFetch(r);
  }

  const snapshot = {
    projectsCount: projects.length,
    shotsCount,
    shotFilesCount: shotFiles.length,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('offline_snapshot', JSON.stringify(snapshot));

  return snapshot;
};