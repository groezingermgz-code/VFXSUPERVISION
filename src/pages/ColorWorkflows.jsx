import { useState, useMemo, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Icon from '../components/Icon';
import { programTemplates, programOptions } from '../data/acesWorkflows';
import { loadShotFromFile } from '../utils/shotFileManager';
import { getSensorSizeByFormat, getPixelResolutionByFormat } from '../data/cameraDatabase';
import { parseSensorSize } from '../utils/fovCalculator';

const defaultSteps = [
  { id: 1, name: 'Camera Log to Working Space', input: 'ARRI LogC4', output: 'ACEScg', note: 'Apply IDT (Input Device Transform)' },
  { id: 2, name: 'Grading', input: 'ACEScg', output: 'ACEScg', note: 'Primary + Secondary grading' },
  { id: 3, name: 'Output to Display', input: 'ACEScg', output: 'Rec.709', note: 'Apply ODT (Output Device Transform)' },
];

const ColorWorkflows = () => {
  const { t } = useLanguage();
  const [steps, setSteps] = useState(defaultSteps);
  const [form, setForm] = useState({ name: '', input: '', output: '', note: '' });

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [shots, setShots] = useState([]);
  const [selectedShotId, setSelectedShotId] = useState(null);
  const [targetOdt, setTargetOdt] = useState('Rec.709');
  const [nukeIncludeDisplay, setNukeIncludeDisplay] = useState(false);
  const [nukeOcioDisplay, setNukeOcioDisplay] = useState('');
  const [nukeOcioView, setNukeOcioView] = useState('');
  const [nukeOcioConfig, setNukeOcioConfig] = useState('auto');

  useEffect(() => {
    const saved = localStorage.getItem('projects');
    if (saved) {
      try {
        const list = JSON.parse(saved) || [];
        setProjects(list);
        const storedSel = parseInt(localStorage.getItem('selectedProjectId')) || list[0]?.id || null;
        setSelectedProjectId(storedSel);
        const proj = list.find(p => p.id === storedSel);
        const shotsList = Array.isArray(proj?.shots) ? proj.shots : [];
        setShots(shotsList);
        setSelectedShotId(shotsList[0]?.id || null);
      } catch {}
    }
  }, []);

  // Load saved Nuke OCIO export options
  useEffect(() => {
    try {
      const raw = localStorage.getItem('nukeOcioOptions');
      if (raw) {
        const opts = JSON.parse(raw);
        if (typeof opts.includeDisplay === 'boolean') setNukeIncludeDisplay(opts.includeDisplay);
        if (typeof opts.display === 'string') setNukeOcioDisplay(opts.display);
        if (typeof opts.view === 'string') setNukeOcioView(opts.view);
        if (typeof opts.config === 'string') setNukeOcioConfig(opts.config);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const opts = {
      includeDisplay: nukeIncludeDisplay,
      display: nukeOcioDisplay,
      view: nukeOcioView,
      config: nukeOcioConfig,
    };
    try { localStorage.setItem('nukeOcioOptions', JSON.stringify(opts)); } catch {}
  }, [nukeIncludeDisplay, nukeOcioDisplay, nukeOcioView, nukeOcioConfig]);

  useEffect(() => {
    const proj = projects.find(p => String(p.id) === String(selectedProjectId));
    const shotsList = Array.isArray(proj?.shots) ? proj.shots : [];
    setShots(shotsList);
    if (!shotsList.find(s => String(s.id) === String(selectedShotId))) {
      setSelectedShotId(shotsList[0]?.id || null);
    }
  }, [selectedProjectId, projects]);

  const canAdd = useMemo(() => form.name && form.input && form.output, [form]);

  const addStep = () => {
    const id = (steps[steps.length - 1]?.id || 0) + 1;
    setSteps([...steps, { id, ...form }]);
    setForm({ name: '', input: '', output: '', note: '' });
  };

  const removeStep = (id) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const guessCameraLog = (cs) => {
    const manu = (cs?.manufacturer || '').toLowerCase();
    if (!manu) return 'Camera Log';
    if (manu.includes('arri')) return 'ARRI LogC4';
    if (manu.includes('sony')) return 'Sony S-Log3';
    if (manu.includes('red')) return 'RED Log3G10';
    if (manu.includes('canon')) return 'Canon C-Log3';
    if (manu.includes('blackmagic')) return 'Blackmagic Film Gen5';
    if (manu.includes('panasonic')) return 'Panasonic V-Log';
    if (manu.includes('fujifilm')) return 'Fujifilm F-Log';
    if (manu.includes('z cam')) return 'Z CAM Z-Log2';
    return 'Camera Log';
  };

  const augmentIdtNote = (note, cs) => {
    const manu = (cs?.manufacturer || '').trim();
    const model = (cs?.model || '').trim();
    const colorSpace = (cs?.colorSpace || '').trim();
    const parts = [note];
    if (manu || model || colorSpace) {
      parts.push(`IDT für ${[manu, model].filter(Boolean).join(' ')}${colorSpace ? ` (${colorSpace})` : ''}`);
    }
    return parts.filter(Boolean).join(' — ');
  };

  const exportJSON = () => {
    const payload = { type: 'ColorWorkflows', version: 1, program: selectedProgram, sourceProjectId: selectedProjectId, sourceShotId: selectedShotId, targetOdt, steps };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-workflows.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const header = ['id', 'name', 'input', 'output', 'note', 'lut_file', 'lut_type', 'lut_title', 'lut_size', 'lut_domain_min', 'lut_domain_max'];
    const rows = [header.join(','), ...steps.map(s => {
      const lut = s.lut || {};
      const lutSize = lut.type === '3D' ? (lut.size3d ?? '') : (lut.size1d ?? '');
      return [
        s.id,
        escapeCsv(s.name),
        escapeCsv(s.input),
        escapeCsv(s.output),
        escapeCsv(s.note || ''),
        escapeCsv(lut.filename || ''),
        escapeCsv(lut.type || ''),
        escapeCsv(lut.title || ''),
        escapeCsv(lutSize),
        escapeCsv(lut.domainMin || ''),
        escapeCsv(lut.domainMax || ''),
      ].join(',');
    })];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-workflows.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const escapeCsv = (val) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/\"/g, '""') + '"';
    }
    return s;
  };

  // Map common camera color spaces to Nuke ACES 1.3 OCIO names
  const normalizeSpace = (s) => String(s || '').trim().toLowerCase();
  const mapInputToNukeOCIO = (input) => {
    const key = normalizeSpace(input);
    const compact = key.replace(/[\s_\-+()]/g, '');

    // Robust handling for RED Wide Gamut + Log3G10 combinations
    if ((key.includes('log3g10') || compact.includes('log3g10')) && (
      key.includes('red') || key.includes('wide gamut') || key.includes('redwidegamut') || compact.includes('redwidegamutrgb') || key.includes('rwg') || compact.includes('rwgrgb')
    )) {
      return 'REDLog3G10 REDWideGamutRGB';
    }

    // Known aliases and expected OCIO colorspace names in ACES 1.3
    const dict = {
      'arri logc4': 'ARRI LogC4',
      'logc4': 'ARRI LogC4',
      'arri logc3': 'ARRI LogC3 (EI800)',
      'logc3': 'ARRI LogC3 (EI800)',
      'red log3g10': 'REDLog3G10 REDWideGamutRGB',
      'log3g10': 'REDLog3G10 REDWideGamutRGB',
      'rwgrgb log3g10': 'REDLog3G10 REDWideGamutRGB',
      'rwg/log3g10': 'REDLog3G10 REDWideGamutRGB',
      'redwidegamutrgb+log3g10': 'REDLog3G10 REDWideGamutRGB',
      'redwidegamut+log3g10': 'REDLog3G10 REDWideGamutRGB',
      'sony s-log3': 'S-Log3 S-Gamut3.Cine',
      's-log3': 'S-Log3 S-Gamut3.Cine',
      'canon c-log3': 'Canon-Log3 Cinema Gamut',
      'c-log3': 'Canon-Log3 Cinema Gamut',
      'blackmagic film gen5': 'Blackmagic Film Generation 5',
      'bmd film gen5': 'Blackmagic Film Generation 5',
      'panasonic v-log': 'Panasonic V-Log V-Gamut',
      'v-log': 'Panasonic V-Log V-Gamut',
      'fujifilm f-log': 'F-Log F-Gamut',
      'f-log': 'F-Log F-Gamut',
      'z cam z-log2': 'Z-Log2 Z-Gamut',
      'z-log2': 'Z-Log2 Z-Gamut',
    };
    return dict[key] || input || 'Camera Log';
  };

  // Map ODT label to OCIODisplay display/view pair
  const mapOdtToDisplayView = (odt) => {
    const key = normalizeSpace(odt);
    if (key.includes('709') || key.includes('srgb')) {
      return { display: 'sRGB', view: 'ACES 1.0 - SDR Video' };
    }
    if (key.includes('p3')) {
      return { display: 'P3-D65', view: 'ACES 1.0 - SDR Cinema' };
    }
    if (key.includes('2020')) {
      return { display: 'sRGB', view: 'ACES 1.0 - SDR Video' };
    }
    if (key.includes('pq') || key.includes('hdr')) {
      return { display: 'Rec.2100-PQ', view: 'ACES 1.1 - HDR Video (1000 nits & Rec.2020 lim)' };
    }
    return { display: 'sRGB', view: 'ACES 1.0 - SDR Video' };
  };

  const buildNukeNk = () => {
    const shotFull = selectedShotId ? loadShotFromFile(String(selectedShotId)) : null;
    const cs = shotFull?.cameraSettings || {};

    const step0 = steps[0] || {};
    const inputLabel = step0.input || (cs.colorSpace || guessCameraLog(cs) || 'Camera Log');
    const inputOCIO = mapInputToNukeOCIO(inputLabel);
    const workingRole = 'scene_linear';
    const { display, view } = mapOdtToDisplayView(targetOdt || step0.output || 'Rec.709');

    const fpsVal = parseNumber(cs.framerate, 24);

    const sensorStrRaw = cs.sensorSize || (cs.manufacturer && cs.model && cs.format ? getSensorSizeByFormat(cs.manufacturer, cs.model, cs.format) : null);
    const sensor = sensorStrRaw ? parseSensorSize(sensorStrRaw) : null;
    const haperture = sensor?.width ?? 36;
    const vaperture = sensor?.height ?? 24;

    const focal = parseNumber(cs.focalLength, 35);
    const fstop = parseNumber(cs.aperture, 2.8);
    // Compute shutter time (seconds). Prefer explicit shutterSpeed; else derive from shutterAngle and fps.
    let shutter;
    if (cs.shutterSpeed != null) {
      shutter = parseNumber(cs.shutterSpeed, null);
    }
    if (shutter == null) {
      const angle = parseNumber(cs.shutterAngle, null);
      if (angle != null && fpsVal) {
        shutter = (angle / 360) / fpsVal; // 180° @24fps => ~1/48s
      }
    }
    if (shutter == null) {
      shutter = 1 / (fpsVal ? fpsVal * 2 : 48); // sensible default
    }

    // Focus distance parsing (meters). Supports 'm', 'cm', 'mm'.
    let focusDistMeters = null;
    const fdStr = String(cs.focusDistance || '').trim();
    if (fdStr) {
      const fdNum = parseNumber(fdStr, NaN);
      if (!Number.isNaN(fdNum)) {
        const u = fdStr.toLowerCase();
        if (u.includes('cm')) focusDistMeters = fdNum / 100;
        else if (u.includes('mm')) focusDistMeters = fdNum / 1000;
        else focusDistMeters = fdNum;
      }
    }
    if (focusDistMeters == null) {
      const fdAlt = parseNumber(cs.focus, NaN);
      if (Number.isFinite(fdAlt)) focusDistMeters = fdAlt;
    }
    if (focusDistMeters == null) focusDistMeters = 3;

    const resStrRaw = cs.pixelResolution || cs.resolution || (cs.manufacturer && cs.model && cs.format ? getPixelResolutionByFormat(cs.manufacturer, cs.model, cs.format) : null);
    const resParsed = resStrRaw ? parseResolution(resStrRaw) : null;
    const outW = resParsed?.width ?? 1920;
    const outH = resParsed?.height ?? 1080;

    const proj = (projects || []).find(p => String(p.id) === String(selectedProjectId));
    const projName = proj?.name || '';
    const projCode = proj?.code ? ` (${proj.code})` : '';
    const stickyText = [
      `Project: ${projName}${projCode}`,
      `Shot: ${shotFull?.name || '-'}`,
      `Camera: ${(cs.manufacturer || '')} ${(cs.model || '')}`.trim(),
      `Lens: ${cs.lens || '-'}`,
      `Focal: ${focal}mm  Aperture: f/${fstop}`,
      `Focus: ${focusDistMeters}m  Shutter: ${typeof shutter === 'number' ? (1/shutter >= 1 ? `~1/${Math.round(1/shutter)}` : `${shutter.toFixed(6)}s`) : String(shutter)}`,
      `FPS: ${fpsVal || '-'}`,
      `Resolution: ${outW}x${outH}`,
      `Input: ${inputOCIO}  Working: ${workingRole}  Display: ${display} / ${view}`
    ].join('\n');

    const lines = [];
    lines.push('# Nuke script generated by ColorWorkflows');
    lines.push('# Program: ' + (selectedProgram || 'nuke') + ' · Project ' + (selectedProjectId ?? '-') + ' · Shot ' + (selectedShotId ?? '-'));
    lines.push('Root {');
    lines.push(' colorManagement OCIO');
    if (nukeOcioConfig && nukeOcioConfig !== 'auto' && nukeOcioConfig !== 'aces_1.2') lines.push(' OCIO_config "aces_1.3"');
    if (fpsVal) lines.push(' fps ' + fpsVal);
    lines.push(' first_frame 1001');
    lines.push(' frame 1001');
    lines.push('}');
    lines.push('Read {');
    lines.push(' file ""');
    lines.push(' raw false');
    lines.push(' colorspace "' + inputOCIO + '"');
    lines.push(' name Read1');
    lines.push(' xpos -200');
    lines.push(' ypos 0');
    lines.push('}');
    lines.push('TimeOffset {');
    lines.push(' time 1000');
    lines.push(' name TimeOffset1');
    lines.push(' xpos -200');
    lines.push(' ypos 60');
    lines.push('}');
    lines.push('Reformat {');
    lines.push(' type "to box"');
    lines.push(' box_width ' + outW);
    lines.push(' box_height ' + outH);
    lines.push(' center true');
    lines.push(' filter Lanczos4');
    lines.push(' name Reformat1');
    lines.push(' xpos -100');
    lines.push(' ypos 0');
    lines.push('}');
    lines.push('Camera2 {');
    lines.push(' read_from_file false');
    lines.push(' focal ' + focal);
    lines.push(' haperture ' + haperture);
    lines.push(' vaperture ' + vaperture);
    lines.push(' fstop ' + fstop);
    lines.push(' shutter ' + shutter);
    lines.push(' addUserKnob {20 user l User}');
    lines.push(' addUserKnob {7 focus_distance l "Focus Distance (m)"}');
    lines.push(' focus_distance ' + focusDistMeters);
    lines.push(' label "focal ' + focal + 'mm  f/' + fstop + '  focus ' + focusDistMeters.toFixed(2) + 'm"');
    lines.push(' name Camera1');
    lines.push(' xpos -400');
    lines.push(' ypos -150');
    lines.push('}');
    lines.push('StickyNote {');
    lines.push(' label {' + stickyText + '}');
    lines.push(' name Note_ShotInfo');
    lines.push(' xpos -520');
    lines.push(' ypos -260');
    lines.push('}');
    lines.push('OCIOColorSpace {');
    lines.push(' in_colorspace "' + inputOCIO + '"');
    lines.push(' out_colorspace "ACEScg"');
    lines.push(' name to_ACEScg1');
    lines.push(' xpos 0');
    lines.push(' ypos 0');
    lines.push('}');
    // Optional OCIODisplay (enable in UI)
    if (nukeIncludeDisplay && nukeOcioDisplay && nukeOcioView) {
      lines.push('OCIODisplay {');
      lines.push(' display "' + nukeOcioDisplay + '"');
      lines.push(' view "' + nukeOcioView + '"');
      lines.push(' name ODT1');
      lines.push(' xpos 200');
      lines.push(' ypos 0');
      lines.push('}');
    }
    lines.push('Viewer {');
    lines.push(' name Viewer1');
    lines.push(' xpos 400');
    lines.push(' ypos 0');
    lines.push('}');

    return lines.join('\n');
  };

  const exportNukeNK = () => {
    const nk = buildNukeNk();
    const shotFull = selectedShotId ? loadShotFromFile(String(selectedShotId)) : null;
    const proj = (projects || []).find(p => String(p.id) === String(selectedProjectId)) || {};
    const safe = (s) => String(s || '').trim().replace(/[^A-Za-z0-9._-]+/g, '_');
    const fileName = `${safe(proj.code || proj.name || 'Project')}_${safe(shotFull?.name || 'Shot')}_color.nk`;
    const blob = new Blob([nk], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [selectedProgram, setSelectedProgram] = useState('resolve');
  const applyTemplate = () => {
    const tpl = programTemplates[selectedProgram] || [];
    const withIds = tpl.map((s, idx) => ({ ...s, id: idx + 1 }));
    setSteps(withIds);
  };
  const fileInputRef = useRef(null);
  const [lutAttachTarget, setLutAttachTarget] = useState(null);
  const onSelectLutFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !lutAttachTarget) return;
    const text = await file.text();
    const lutMeta = parseLutMeta(text, file.name);
    setSteps(steps.map(s => s.id === lutAttachTarget ? { ...s, lut: lutMeta } : s));
    setLutAttachTarget(null);
    e.target.value = '';
  };
  const parseLutMeta = (text, filename) => {
    const lines = text.split(/\r?\n/);
    const titleLine = lines.find(l => l.startsWith('TITLE'));
    const title = titleLine ? titleLine.replace(/^TITLE\s+"?(.+?)"?$/, '$1') : undefined;
    const size3dLine = lines.find(l => l.startsWith('LUT_3D_SIZE'));
    const size1dLine = lines.find(l => l.startsWith('LUT_1D_SIZE'));
    const domainMinLine = lines.find(l => l.startsWith('DOMAIN_MIN'));
    const domainMaxLine = lines.find(l => l.startsWith('DOMAIN_MAX'));
    const size3d = size3dLine ? Number(size3dLine.split(/\s+/)[1]) : undefined;
    const size1d = size1dLine ? Number(size1dLine.split(/\s+/)[1]) : undefined;
    const domainMin = domainMinLine ? domainMinLine.split(/\s+/).slice(1).join(' ') : undefined;
    const domainMax = domainMaxLine ? domainMaxLine.split(/\s+/).slice(1).join(' ') : undefined;
    return { filename, title, type: size3d ? '3D' : '1D', size3d, size1d, domainMin, domainMax };
  };

  const generateFromShot = () => {
    if (!selectedProjectId || !selectedShotId) return;
    const shotFull = loadShotFromFile(String(selectedShotId));
    const cs = shotFull?.cameraSettings || {};
    const inputSpace = cs.colorSpace || guessCameraLog(cs);
    const tpl = programTemplates[selectedProgram] || [];
    const withIds = tpl.map((s, idx) => ({ ...s, id: idx + 1 }));
    const stepsCustom = withIds.map((step, idx, arr) => {
      if (idx === 0) {
        return { ...step, input: inputSpace || step.input, note: augmentIdtNote(step.note, cs) };
      }
      if (idx === arr.length - 1) {
        return { ...step, output: targetOdt || step.output };
      }
      return step;
    });
    const viewerLut = cs?.lut;
    if (viewerLut && stepsCustom.length > 0) {
      stepsCustom[0] = { ...stepsCustom[0], lut: { filename: viewerLut } };
    }
    setSteps(stepsCustom);
  };

  return (
    <div className="page" style={{ maxWidth: 980, margin: '0 auto' }}>
      <input type="file" accept=".cube,.3dl,.csp" ref={fileInputRef} onChange={onSelectLutFile} style={{ display: 'none' }} />
      <div className="header">
        <div className="header-content">
          <h1>ColorWorkflows <span style={{ fontSize: '0.7em', color: 'var(--text-secondary)' }}>(Beta)</span></h1>
          <p className="subtitle">Define color workflows with input/output color spaces and export as JSON/CSV.</p>
        </div>
      </div>

      {/* Program templates selector */}
      <div className="card" style={{ background: 'var(--card-bg)', marginBottom: 12 }}>
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
          <div className="form-field">
            <label htmlFor="wf-program">Program template</label>
            <select id="wf-program" value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)}>
              {programOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="form-field" style={{ alignSelf: 'end' }}>
            <button type="button" className="btn-secondary" onClick={applyTemplate}>
              <span className="nav-icon" aria-hidden><Icon name="notes" /></span> Apply template
            </button>
          </div>
        </div>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
          Templates are based on ACES (IDT → Working → ODT). Adjust the ODT (e.g., Rec.709/P3‑D65/Rec.2020) within the steps as needed.
        </p>
      </div>

      <div className="card" style={{ background: 'var(--card-bg)', marginBottom: 12 }}>
        <h2 style={{ marginTop: 0 }}>Project/Shot Selection</h2>
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12 }}>
          <div className="form-field">
            <label htmlFor="wf-project">Project</label>
            <select id="wf-project" value={selectedProjectId || ''} onChange={(e) => setSelectedProjectId(Number(e.target.value))}>
              {(projects || []).map(p => <option key={p.id} value={p.id}>{p.name || `Project ${p.id}`}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="wf-shot">Shot</label>
            <select id="wf-shot" value={selectedShotId || ''} onChange={(e) => setSelectedShotId(Number(e.target.value))}>
              {(shots || []).map(s => <option key={s.id} value={s.id}>{s.name || `Shot ${s.id}`}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="wf-odt">Target output (ODT)</label>
            <input id="wf-odt" list="color-space-presets" type="text" value={targetOdt} onChange={(e) => setTargetOdt(e.target.value)} placeholder="e.g., Rec.709" />
          </div>
          <div className="form-field" style={{ alignSelf: 'end' }}>
            <button type="button" className="btn-primary" onClick={generateFromShot}>
              <span className="nav-icon" aria-hidden><Icon name="play" /></span> Generate workflow
            </button>
          </div>
        </div>
        {selectedShotId ? (
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
            Source: Project {selectedProjectId} · Shot {selectedShotId}
          </p>
        ) : null}
      </div>

      <div className="card" style={{ background: 'var(--card-bg)' }}>
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div className="form-field">
            <label htmlFor="wf-name">Name</label>
            <input id="wf-name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., IDT + Grading + ODT" />
          </div>
          <div className="form-field">
            <label htmlFor="wf-input">Input Space</label>
            <input id="wf-input" list="color-space-presets" type="text" value={form.input} onChange={(e) => setForm({ ...form, input: e.target.value })} placeholder="e.g., LogC4" />
          </div>
          <div className="form-field">
            <label htmlFor="wf-output">Output Space</label>
            <input id="wf-output" list="color-space-presets" type="text" value={form.output} onChange={(e) => setForm({ ...form, output: e.target.value })} placeholder="e.g., Rec.709" />
          </div>
        </div>
        <datalist id="color-space-presets">
          <option value="ACES2065-1 (AP0)" />
          <option value="ACEScg (AP1)" />
          <option value="ACEScct" />
          <option value="Rec.709" />
          <option value="sRGB" />
          <option value="DCI-P3 D65" />
          <option value="Rec.2020" />
          <option value="ARRI LogC4" />
          <option value="ARRI LogC3" />
          <option value="RED Log3G10" />
          <option value="Sony S-Log3" />
          <option value="Canon C-Log3" />
          <option value="Blackmagic Film Gen5" />
          <option value="Panasonic V-Log" />
          <option value="Fujifilm F-Log" />
          <option value="Z CAM Z-Log2" />
        </datalist>
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 10 }}>
          <div className="form-field">
            <label htmlFor="wf-note">Note</label>
            <input id="wf-note" type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g., LUT, IDT/ODT notes" />
          </div>
        </div>

        {/* Nuke Export Optionen */}
        <div className="card" style={{ background: 'var(--card-bg)', border: '1px dashed var(--border-color)', marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>Nuke Export Options</h3>
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12 }}>
            <div className="form-field">
              <label htmlFor="nuke-ocio-config">OCIO Config</label>
              <select id="nuke-ocio-config" value={nukeOcioConfig} onChange={(e) => setNukeOcioConfig(e.target.value)}>
                <option value="auto">Auto (Nuke default)</option>
                <option value="aces_1.2">ACES 1.2 (Nuke builtin)</option>
                <option value="aces_1.3">ACES 1.3 (external)</option>
                <option value="fn-nuke_cg-1.0.0">Foundry Nuke CG v1.0.0 (ACES 1.3, OCIO v2.1)</option>
                <option value="fn-nuke_studio-1.0.0">Foundry Nuke Studio v1.0.0 (ACES 1.3, OCIO v2.1)</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="nuke-display">Display</label>
              <input id="nuke-display" list="ocio-display-presets" type="text" value={nukeOcioDisplay} onChange={(e) => setNukeOcioDisplay(e.target.value)} placeholder="e.g., sRGB" />
            </div>
            <div className="form-field">
              <label htmlFor="nuke-view">View</label>
              <input id="nuke-view" list="ocio-view-presets" type="text" value={nukeOcioView} onChange={(e) => setNukeOcioView(e.target.value)} placeholder="e.g., ACES 1.0 - SDR Video" />
            </div>
            <div className="form-field" style={{ display: 'flex', alignItems: 'end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={nukeIncludeDisplay} onChange={(e) => setNukeIncludeDisplay(e.target.checked)} />
                Add OCIODisplay node
              </label>
            </div>
          </div>
          <datalist id="ocio-display-presets">
            <option value="sRGB" />
            <option value="Rec.709" />
            <option value="DCI-P3 D65" />
            <option value="Rec.2020" />
          </datalist>
          <datalist id="ocio-view-presets">
            <option value="ACES 1.0 - SDR Video" />
          </datalist>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
            Tip: With ACES 1.2, <code>Display</code> is often "sRGB" and <code>View</code> "ACES 1.0 - SDR Video". Enter exactly the names that Nuke offers in the <code>OCIODisplay</code> node.
          </p>
        </div>

        <div className="form-row" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button type="button" className="btn-primary" disabled={!canAdd} onClick={addStep}>
            <span className="nav-icon" aria-hidden><Icon name="plus" /></span> Add step
          </button>
          <button type="button" className="btn-secondary" onClick={exportJSON}>
            <span className="nav-icon" aria-hidden><Icon name="notes" /></span> Export JSON
          </button>
          <button type="button" className="btn-secondary" onClick={exportCSV}>
            <span className="nav-icon" aria-hidden><Icon name="notes" /></span> Export CSV
          </button>
          <button type="button" className="btn-secondary" onClick={exportNukeNK}>
            <span className="nav-icon" aria-hidden><Icon name="notes" /></span> Export Nuke (.nk)
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16, background: 'var(--card-bg)' }}>
        <h2 style={{ marginTop: 0 }}>Steps</h2>
        {steps.length === 0 ? (
          <div className="empty" style={{ color: 'var(--text-secondary)' }}>No steps yet. Add a step above.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {steps.map((s) => (
              <li key={s.id} className="workflow-step" style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr auto', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{s.id}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  {s.note ? <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>{s.note}</div> : null}
                  {s.lut ? <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>LUT: {s.lut.filename} {s.lut.type ? `(${s.lut.type})` : ''}</div> : null}
                </div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Input:</span> {s.input}</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Output:</span> {s.output}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-icon" title="Attach LUT" aria-label="Attach LUT" onClick={() => { setLutAttachTarget(s.id); fileInputRef.current?.click(); }} style={{ border: '1px solid var(--border-color)', borderRadius: 6, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span aria-hidden><Icon name="notes" /></span>
                  </button>
                  <button className="btn-icon" title="Delete step" aria-label="Delete step" onClick={() => removeStep(s.id)} style={{ border: '1px solid var(--border-color)', borderRadius: 6, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span aria-hidden><Icon name="trash" /></span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card" style={{ marginTop: 16, background: 'var(--card-bg)', borderLeft: '4px solid var(--color-warning, #f39c12)' }}>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          Note: Export to JSON/CSV is implemented. Additional formats (e.g., XML, YAML) can be added. For LUT workflows, later import/export of .cube is planned.
        </p>
      </div>
    </div>
  );
};

export default ColorWorkflows;

  // Helper: parse numeric from mixed string
  const parseNumber = (s, fallback) => {
    if (s == null) return Number(fallback);
    const m = String(s).match(/[\d.,]+/);
    if (!m) return Number(fallback);
    const v = parseFloat(m[0].replace(',', '.'));
    return isFinite(v) ? v : Number(fallback);
  };
  // Helper: parse resolution "W x H"
  const parseResolution = (s) => {
    const m = String(s || '').match(/(\d+)\s*[x×]\s*(\d+)/i);
    if (!m) return null;
    return { width: Number(m[1]), height: Number(m[2]) };
  };