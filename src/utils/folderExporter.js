import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const sanitize = (s) =>
  (s || 'untitled').toString().trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 64);

const normalizeCat = (c) => sanitize((c || 'unkategorisiert').toLowerCase());

const extFromDataUrl = (dataUrl) => {
  if (!dataUrl) return 'bin';
  if (dataUrl.startsWith('data:image/png')) return 'png';
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'jpg';
  if (dataUrl.startsWith('data:image/svg+xml')) return 'svg';
  return 'bin';
};

const dataUrlToBlob = (dataUrl) => {
  const parts = dataUrl.split(',');
  const header = parts[0] || '';
  const data = parts[1] || '';
  const mimeMatch = header.match(/data:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(data);
  const u8 = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
  return new Blob([u8], { type: mime });
};

/**
 * Exportiert ein Projekt als ZIP mit strukturierter Ordnerhierarchie.
 * Erwartet, dass Projekt die Shots unter project.shots enthält.
 * @param {Object} project
 */
export const exportProjectAsZip = async (project) => {
  if (!project) throw new Error('Kein Projekt angegeben');
  const shots = Array.isArray(project.shots) ? project.shots : [];

  const zip = new JSZip();
  const date = new Date().toISOString().slice(0, 10);
  const projectFolderName = `Project_${sanitize(project.name)}_${date}`;
  const root = zip.folder(projectFolderName);

  // Metadaten
  root.file('metadata.json', JSON.stringify({
    project: { id: project.id, name: project.name, description: project.description },
    shotsCount: shots.length,
    exportedAt: new Date().toISOString(),
  }, null, 2));

  // Shots
  const shotsFolder = root.folder('shots');
  shots.forEach((shot, idx) => {
    const folderName = `${String(idx + 1).padStart(2, '0')}_${sanitize(shot?.name)}`;
    const shotFolder = shotsFolder.folder(folderName);

    // Vollständige Shot-Daten
    shotFolder.file('shot.json', JSON.stringify(shot, null, 2));

    // Referenzen nach Kategorie
    const byCat = {};
    (shot.references || []).forEach(ref => {
      const cat = normalizeCat(ref?.category);
      (byCat[cat] ||= []).push(ref);
    });

    Object.entries(byCat).forEach(([cat, items]) => {
      const catFolder = shotFolder.folder(`references/${cat}`);
      items.forEach((item, i) => {
        const base = sanitize(item?.name || `ref_${i + 1}`);
        const url = item?.url;
        if (url?.startsWith('data:')) {
          const ext = extFromDataUrl(url);
          const blob = dataUrlToBlob(url);
          catFolder.file(`${base}.${ext}`, blob);
        } else if (url) {
          catFolder.file(`${base}.url.txt`, `Link: ${url}\nName: ${item?.name || ''}\nKategorie: ${item?.category || ''}`);
        } else {
          catFolder.file(`${base}.txt`, `Kein Bild vorhanden`);
        }
      });
    });
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const filename = `${projectFolderName}.zip`;
  saveAs(content, filename);
};