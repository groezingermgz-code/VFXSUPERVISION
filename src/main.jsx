import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { getFormatsByModel, getCodecsByModel, getColorSpacesByModel } from './data/cameraDatabase.js'
import { getViewerLutsForManufacturer } from './data/lutDatabase.js'
import { extractLensManufacturer } from './utils/fovCalculator.js'

// Seed/Upgrade: Dummy-Projekt mit vollständigen VFX-Flags, Details und Referenzen (alle Shots)
(() => {
  try {
    const projectsRaw = localStorage.getItem('projects');
    const projects = projectsRaw ? JSON.parse(projectsRaw) : [];
    const nowTs = Date.now();

    // Globales Szenario-Profil (falls nicht gesetzt): Neo-Noir Stadt bei Nacht mit Regen
    const defaultScenarioTags = 'city,night,rain,street';
    const storedScenarioTags = localStorage.getItem('filmScenarioTags');
    if (!storedScenarioTags) {
      try { localStorage.setItem('filmScenarioTags', defaultScenarioTags); } catch {}
    }

    // Platzhalterbild als Data-URL erzeugen (mit sprechendem Titel)
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

    const ensureShotData = (shot, index) => {
      // Alle VFX-Flags aktivieren
      const vfxFlags = {
        cleanplates: true,
        hdris: true,
        setReferences: true,
        chromeBall: true,
        grayBall: true,
        colorChecker: true,
        distortionGrids: true,
        measurementsTaken: true,
        threeDScans: true,
      };
    
      // Detailfelder sinnvoll befüllen
      const vfxDetails = {
        distortionGridsDetails: {
          patternType: 'Checkerboard',
          distances: '1m, 2m, 5m',
          focalLengths: '24mm, 35mm, 50mm',
          coverage: 'Full Frame',
          anamorphicSqueeze: '2.0x',
          date: new Date().toISOString().slice(0, 10),
          notes: 'Linsenverzeichnung erfasst; verschiedene Brennweiten dokumentiert.'
        },
        hdrisDetails: {
          notes: 'Belichtungsreihe ±7EV, Stativ, 360° Panorama, keine Personen.'
        },
        setReferencesDetails: {
          notes: 'Setaufbau, Lichtpositionen, Prop-Nummern, Kameraachsen markiert.'
        },
        cleanplatesDetails: {
          notes: 'Statische Plate-Aufnahmen, identische Kameraeinstellungen, keine Crew im Bild.'
        },
        chromeBallDetails: {
          size: '7cm',
          notes: 'Reflexionen für Licht-Rig; Position links neben Motiv.'
        },
        grayBallDetails: {
          size: '10cm',
          notes: '18% Grey Referenz; neben ColorChecker platziert.'
        },
        colorCheckerDetails: {
          wb: '5600K',
          notes: 'X-Rite ColorChecker Video; WB Referenz für DI.'
        },
        measurementsDetails: {
          notes: 'Türbreite 90cm, Tischhöhe 75cm, Distanz Kamera–Subjekt 3m.'
        },
        threeDScansDetails: {
          notes: 'Photogrammetrie/LiDAR; Mesh und Punktwolke erzeugt.',
          formats: ['OBJ', 'PLY', 'GLTF']
        },
      };
    
      // Mindestens 3 Referenzen pro Kategorie hinzufügen (ohne vorhandene zu überschreiben)
      const base = Date.now() + index * 1000;
      const categories = [
        { key: 'hdri', names: ['HDRI 01', 'HDRI 02', 'HDRI 03'] },
        { key: 'vfx-set-references', names: ['Set‑Ref Licht', 'Set‑Ref Aufbau', 'Set‑Ref Props'] },
        { key: 'vfx-cleanplates', names: ['Cleanplate A', 'Cleanplate B', 'Cleanplate C'] },
        { key: 'vfx-chrome-ball', names: ['Chrome Ball A', 'Chrome Ball B', 'Chrome Ball C'] },
        { key: 'vfx-gray-ball', names: ['Grey Ball A', 'Grey Ball B', 'Grey Ball C'] },
        { key: 'vfx-color-checker', names: ['ColorChecker A', 'ColorChecker B', 'ColorChecker C'] },
        { key: 'vfx-distortion-grids', names: ['Distortion Grid 24mm', 'Distortion Grid 35mm', 'Distortion Grid 50mm'] },
        { key: 'vfx-measurements', names: ['Mess‑Foto Maßstab', 'Mess‑Foto Abstand', 'Mess‑Foto Höhe'] },
        { key: 'vfx-3d-scans', names: ['3D Scan Mesh', '3D Scan Pointcloud', '3D Scan UV'] },
      ];
    
      const existingRefs = Array.isArray(shot.references) ? shot.references.slice() : [];
      const ensureThreePerCategory = (refs) => {
        const out = refs.slice();
        categories.forEach((cat, ci) => {
          const have = out.filter(r => r.category === cat.key).length;
          for (let i = have; i < 3; i++) {
            out.push({
              id: base + ci * 100 + i + Math.random(),
              name: cat.names[i],
              url: makeRealImageUrl(`${cat.key}-${i}`),
              category: cat.key
            });
          }
        });
        return out;
      };
    
      const refsAugmented = ensureThreePerCategory(existingRefs);
    
      // Kamera/Linsen-Defaults aus Datenbank ermitteln und fehlende Felder befüllen
      const csIn = shot.cameraSettings || {};
      const cs = { ...csIn };
    
      // Hersteller/Modell normalisieren
      const normalizeCameraModel = (raw) => {
        const s = String(raw || '').trim();
        const map = [
          [/^ARRI\s+(.+)/i, (m) => ({ manufacturer: 'ARRI', model: m[1].trim() })],
          [/^Sony\s+(.+)/i, (m) => ({ manufacturer: 'Sony', model: m[1].trim() })],
          [/^RED\s+(.+)/i, (m) => ({ manufacturer: 'RED', model: m[1].trim().toUpperCase() === 'KOMODO' ? 'KOMODO' : m[1].trim() })],
          [/^Blackmagic\s+6K/i, () => ({ manufacturer: 'Blackmagic Design', model: 'Pocket Cinema Camera 6K' })],
          [/^Blackmagic\s+(.+)/i, (m) => ({ manufacturer: 'Blackmagic Design', model: m[1].trim() })],
          [/^Canon\s+(.+)/i, (m) => ({ manufacturer: 'Canon', model: m[1].trim() })],
          [/^Panasonic\s+(.+)/i, (m) => ({ manufacturer: 'Panasonic', model: m[1].trim() })],
          [/^Fujifilm\s+(.+)/i, (m) => ({ manufacturer: 'Fujifilm', model: m[1].trim() })],
          [/^Z\s*CAM\s+(.+)/i, (m) => ({ manufacturer: 'Z CAM', model: m[1].trim() })],
          [/^DJI\s+(.+)/i, (m) => ({ manufacturer: 'DJI', model: m[1].trim() })],
        ];
        for (const [re, fn] of map) {
          const m = s.match(re);
          if (m) return fn(m);
        }
        // Fallback: unbekannt
        return { manufacturer: cs.manufacturer || 'ARRI', model: s || 'ALEXA Mini' };
      };
    
      const nm = normalizeCameraModel(cs.model);
      cs.manufacturer = cs.manufacturer || nm.manufacturer;
      cs.model = nm.model;
    

    
      cs.lensManufacturer = cs.lensManufacturer || extractLensManufacturer(cs.lens, cs.manufacturer);
    
      // Formate/Codecs/ColorSpaces aus DB ziehen, ansonsten sinnvolle Defaults
      let formats = [];
      let codecs = [];
      let colorSpaces = [];
      try { formats = getFormatsByModel(cs.manufacturer, cs.model) || []; } catch {}
      try { codecs = getCodecsByModel(cs.manufacturer, cs.model) || []; } catch {}
      try { colorSpaces = getColorSpacesByModel(cs.manufacturer, cs.model) || []; } catch {}
    
      cs.format = cs.format || (formats[0] || '4K UHD');
      cs.codec = cs.codec || (codecs[0] || 'H.264');
      cs.colorSpace = cs.colorSpace || (colorSpaces[0] || 'Rec. 709');
    
      // LUTs (Viewer) pro Hersteller, generisch fallback
      let luts = [];
      try { luts = getViewerLutsForManufacturer(cs.manufacturer) || []; } catch {}
      cs.lut = cs.lut || (luts[0] || 'ACES IDT+RRT+ODT → Rec.709');
    
      // Weitere Defaults
      cs.whiteBalance = cs.whiteBalance || '5600K';
      cs.framerate = cs.framerate || '24';
      cs.shutterAngle = cs.shutterAngle || '180°';
      cs.imageStabilization = cs.imageStabilization || 'Aus';
    
      // Bestehende Werte beibehalten
      cs.lens = cs.lens || csIn.lens || '';
      cs.focalLength = cs.focalLength || csIn.focalLength || '';
      cs.aperture = cs.aperture || csIn.aperture || '';
      cs.iso = cs.iso || csIn.iso || '';
    
      return {
        ...shot,
        vfxPreparations: { ...(shot.vfxPreparations || {}), ...vfxFlags, ...vfxDetails },
        references: refsAugmented,
        cameraSettings: cs,
      };
    };

      const hasDummy = projects.some(p => p && p.name === 'Dummy Projekt');
      if (!hasDummy) {
        // Neues Dummy-Projekt: alle Shots mit vollständigen Daten und Referenzen
        const baseTs = nowTs;
        const shots = [
          { id: baseTs + 1, name: 'SH_001', description: 'Establishing city skyline at dusk', status: 'In Bearbeitung', notes: 'Use ND filter; golden hour', cameraSettings: { model: 'ARRI ALEXA Mini', lens: 'Zeiss CP.2 35mm', focalLength: '35mm', aperture: 'T2.8', iso: '800' } },
          { id: baseTs + 2, name: 'SH_002', description: 'Close-up actor reading note', status: 'Ausstehend', notes: 'Macro lens; shallow depth', cameraSettings: { model: 'Sony FX9', lens: 'Sigma 85mm', focalLength: '85mm', aperture: 'F1.8', iso: '640' } },
          { id: baseTs + 3, name: 'SH_003', description: 'Tracking shot through corridor', status: 'Abgeschlossen', notes: 'Steadicam; 24fps', cameraSettings: { model: 'Blackmagic 6K', lens: 'Canon 24-70mm', focalLength: '35mm', aperture: 'F4', iso: '400' } },
          { id: baseTs + 4, name: 'SH_004', description: 'VFX plate of main street', status: 'Ausstehend', notes: 'Plate only; lock-off', cameraSettings: { model: 'RED Komodo', lens: 'Canon 50mm', focalLength: '50mm', aperture: 'F2.8', iso: '800' } },
          { id: baseTs + 5, name: 'SH_005', description: 'Car interior night ride', status: 'In Bearbeitung', notes: 'LED strips; dimmers', cameraSettings: { model: 'ARRI ALEXA 35', lens: 'Angenieux 24-290mm', focalLength: '70mm', aperture: 'T2.8', iso: '1280' } },
          { id: baseTs + 6, name: 'SH_006', description: 'Drone shot over forest', status: 'Ausstehend', notes: 'Wind check; ND 0.6', cameraSettings: { model: 'DJI Inspire 2', lens: 'X7 24mm', focalLength: '24mm', aperture: 'F5.6', iso: '400' } },
          { id: baseTs + 7, name: 'SH_007', description: 'Actor runs across bridge', status: 'Abgeschlossen', notes: 'Gimbal; 48fps', cameraSettings: { model: 'Sony A7S III', lens: 'Sony 35mm', focalLength: '35mm', aperture: 'F2', iso: '800' } },
          { id: baseTs + 8, name: 'SH_008', description: 'Rain FX street VFX plate', status: 'Ausstehend', notes: 'Rain rigs; backlight', cameraSettings: { model: 'ARRI ALEXA Mini', lens: 'Zeiss CP.2 50mm', focalLength: '50mm', aperture: 'T2.1', iso: '800' } },
        ].map((s, idx) => ensureShotData(s, idx));
    
        const dummy = {
          id: baseTs,
          name: 'Dummy Projekt',
          production: 'Demo Productions',
          director: 'Ava DuVernay',
          cinematographer: 'Roger Deakins',
          vfxSupervisor: 'Grace Hopper',
          shotCount: shots.length,
          completedShots: shots.filter(s => s.status === 'Abgeschlossen').length,
          teamId: null,
          createdAt: new Date().toISOString(),
          shots,
        };
        const updatedProjects = [dummy, ...projects];
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        localStorage.setItem('selectedProjectId', String(dummy.id));
        console.info('Dummy Projekt erstellt: Alle Shots mit VFX-Details und Referenzen befüllt.');
      } else {
        // Bestehendes Dummy-Projekt upgraden: alle Shots komplett befüllen
        const idx = projects.findIndex(p => p && p.name === 'Dummy Projekt');
        if (idx >= 0) {
          const dummy = projects[idx];
          const shots = Array.isArray(dummy.shots) ? dummy.shots.slice() : [];
          const upgraded = shots.map((s, si) => ensureShotData(s, si));
          const completedShots = upgraded.filter(s => s.status === 'Abgeschlossen').length;
          const updatedDummy = { ...dummy, shots: upgraded, completedShots };
          const updatedProjects = projects.slice();
          updatedProjects[idx] = updatedDummy;
          localStorage.setItem('projects', JSON.stringify(updatedProjects));
          console.info('Dummy Projekt aktualisiert: Alle Shots mit VFX-Details und Referenzen ergänzt.');
        }
      }

      // Neues Superhelden-Projekt erzeugen, falls nicht vorhanden
      try {
        const currentProjectsRaw = localStorage.getItem('projects');
        const currentProjects = currentProjectsRaw ? JSON.parse(currentProjectsRaw) : [];
        const hasHero = currentProjects.some(p => p && p.name === 'Superheld – Kampf & Glas-Crash');
        if (!hasHero) {
          const heroBase = nowTs + 10000;
          const heroShotsBase = heroBase + 1;
          const heroShots = [
            { id: heroShotsBase + 1, name: 'SH_H101', description: 'Establishing: Stadt bei Nacht, Held auf Dach', status: 'Ausstehend', notes: 'Silhouette, Backlight, Wind', cameraSettings: { model: 'ARRI ALEXA 35', lens: 'Zeiss 25mm', focalLength: '25mm', aperture: 'T2.8', iso: '800' } },
            { id: heroShotsBase + 2, name: 'SH_H102', description: 'Anlauf zum Kampf im Büroflur', status: 'In Bearbeitung', notes: 'Handheld, 24fps, ND 0.6', cameraSettings: { model: 'Sony FX9', lens: 'Sigma 35mm', focalLength: '35mm', aperture: 'F2.8', iso: '640' } },
            { id: heroShotsBase + 3, name: 'SH_H103', description: 'OTS: Gegner hebt die Faust', status: 'Ausstehend', notes: 'OTS, Eyelevel, 180°', cameraSettings: { model: 'RED Komodo', lens: 'Canon 50mm', focalLength: '50mm', aperture: 'F2.8', iso: '800' } },
            { id: heroShotsBase + 4, name: 'SH_H104', description: 'Close‑up: Held spannt sich, Scherben im Hintergrund', status: 'In Bearbeitung', notes: 'Makro‑Look, flache Schärfe', cameraSettings: { model: 'ARRI ALEXA Mini', lens: 'Zeiss 85mm', focalLength: '85mm', aperture: 'T1.9', iso: '800' } },
            { id: heroShotsBase + 5, name: 'SH_H105', description: 'Crash durch die Glasscheibe (Primary VFX)', status: 'Abgeschlossen', notes: 'Stunt, Breakaway‑Glass, SlowMo 60fps', cameraSettings: { model: 'Sony A7S III', lens: 'Sony 24mm', focalLength: '24mm', aperture: 'F4', iso: '1600' } },
            { id: heroShotsBase + 6, name: 'SH_H106', description: 'Zeitlupe: Scherben fliegen, Tracking entlang der Fassade', status: 'In Bearbeitung', notes: 'Dolly/Slider, 60fps', cameraSettings: { model: 'Blackmagic 6K', lens: 'Canon 24‑70mm', focalLength: '70mm', aperture: 'F4', iso: '800' } },
            { id: heroShotsBase + 7, name: 'SH_H107', description: 'Außen: Aufprall auf Autodach, Regen/Steam', status: 'Ausstehend', notes: 'Gimbal, Practical Rain', cameraSettings: { model: 'Sony FX3', lens: 'Sony 35mm', focalLength: '35mm', aperture: 'F2', iso: '1250' } },
            { id: heroShotsBase + 8, name: 'SH_H108', description: 'Cleanplate: Fensterrahmen ohne Darsteller', status: 'Ausstehend', notes: 'Lock‑Off, identische Einstellungen', cameraSettings: { model: 'RED Komodo', lens: 'Canon 50mm', focalLength: '50mm', aperture: 'F5.6', iso: '400' } },
            { id: heroShotsBase + 9, name: 'SH_H109', description: 'Set‑Ref: Lichtpositionen, Rigging, Prop‑Markierungen', status: 'Ausstehend', notes: 'BTS, Doku‑Fotos', cameraSettings: { model: 'ARRI ALEXA 35', lens: 'Zeiss 35mm', focalLength: '35mm', aperture: 'T2.8', iso: '800' } },
            { id: heroShotsBase + 10, name: 'SH_H110', description: 'HDRI: Skyline/Nacht für Umgebung', status: 'Abgeschlossen', notes: '±7EV, Panorama', cameraSettings: { model: 'DJI Inspire 2', lens: 'X7 24mm', focalLength: '24mm', aperture: 'F5.6', iso: '400' } },
          ].map((s, idx) => {
            const enriched = ensureShotData(s, idx);
            return { ...enriched, previewImage: enriched.previewImage || null };
          });
    
            const hero = {
              id: heroBase,
              name: 'Superheld – Kampf & Glas-Crash',
              production: 'Heroic Pictures',
              director: 'Patty Jenkins',
              cinematographer: 'Hoyte van Hoytema',
              vfxSupervisor: 'Paul Lambert',
              shotCount: heroShots.length,
              completedShots: heroShots.filter(s => s.status === 'Abgeschlossen').length,
              teamId: null,
              createdAt: new Date().toISOString(),
              shots: heroShots,
            };
            const merged = [hero, ...currentProjects];
            localStorage.setItem('projects', JSON.stringify(merged));
            localStorage.setItem('selectedProjectId', String(hero.id));
            try { localStorage.setItem('filmScenarioTags', 'superhero,action,city,night,glass'); } catch {}
            console.info('Superhelden-Dummyprojekt erstellt: Kampf & Glas-Crash mit voll befüllten Shots.');
          }
        } catch (e) {
          console.warn('Superhelden-Projekt-Seeding fehlgeschlagen:', e);
        }

      } catch (e) {
        console.warn('Dummy-Projekt-Seeding/Upgrade fehlgeschlagen:', e);
      }
    })();

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )

    // Register Service Worker only in production; avoid dev/HMR interference
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('Service Worker registration failed:', err);
        });
      });
    } else if (import.meta.env.DEV && 'serviceWorker' in navigator) {
      // In development, proactively unregister any existing SW and clear caches
      // to prevent issues with Vite React Refresh/HMR.
      window.addEventListener('load', async () => {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          regs.forEach((r) => r.unregister());
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
          console.info('Development: Unregistered service workers and cleared caches.');
        } catch (err) {
          console.warn('Development SW cleanup failed:', err);
        }
      });
    }