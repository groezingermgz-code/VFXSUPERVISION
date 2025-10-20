import React, { useEffect, useMemo, useState } from 'react';

const LS_KEY = 'camera_presets_v1';

const loadPresets = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const savePresets = (presets) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(presets)); } catch {}
};

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const Presets = (bridge) => {
  const Manager = ({ currentMode, currentSettings, onApplyPreset, onUpdateMode, onUpdateSettings }) => {
    const [presets, setPresets] = useState(loadPresets());
    const [newPreset, setNewPreset] = useState({ name: '', mode: currentMode, settings: currentSettings });
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => { setNewPreset((p) => ({ ...p, mode: currentMode, settings: currentSettings })); }, [currentMode, currentSettings]);

    const handleNewChange = (e) => {
      const { name, value } = e.target;
      if (name === 'name') setNewPreset((p) => ({ ...p, name: value }));
    };

    const addPreset = () => {
      if (!newPreset.name.trim()) return;
      const updated = [...presets, { id: genId(), name: newPreset.name.trim(), mode: newPreset.mode, settings: newPreset.settings }];
      setPresets(updated);
      savePresets(updated);
      setNewPreset({ name: '', mode: currentMode, settings: currentSettings });
    };

    const removePreset = (id) => {
      const updated = presets.filter((p) => p.id !== id);
      setPresets(updated);
      savePresets(updated);
      if (selectedId === id) setSelectedId(null);
    };

    const selectPreset = (id) => {
      setSelectedId(id);
      const p = presets.find((x) => x.id === id);
      if (p) {
        onUpdateMode?.(p.mode);
        onUpdateSettings?.(p.settings);
      }
    };

    const applySelected = async () => {
      const p = presets.find((x) => x.id === selectedId);
      if (!p) return;
      await onApplyPreset?.(p);
    };

    return (
      <div className="preset-manager">
        <div className="form-row" style={{ alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Preset‑Name</label>
            <input type="text" name="name" value={newPreset.name} onChange={handleNewChange} placeholder="z. B. X5 Video 30fps" />
          </div>
          <button className="btn-secondary" onClick={addPreset}>Preset speichern</button>
        </div>

        <div className="preset-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, marginTop: 12 }}>
          {presets.map((p) => (
            <div key={p.id} className={`preset-card ${selectedId === p.id ? 'selected' : ''}`} style={{ background: 'var(--card-bg, #0f172a)', padding: 12, borderRadius: 8 }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Modus: {p.mode}, {p.settings.resolution}@{p.settings.fps}fps</div>
              <div className="form-row" style={{ marginTop: 8 }}>
                <button className="btn-secondary" onClick={() => selectPreset(p.id)}>Auswählen</button>
                <button className="btn-primary" onClick={applySelected}>Anwenden</button>
                <button className="btn-danger" onClick={() => removePreset(p.id)}>Löschen</button>
              </div>
            </div>
          ))}
          {presets.length === 0 && (
            <div style={{ opacity: 0.8 }}>Noch keine Presets gespeichert. Lege oben ein neues an.</div>
          )}
        </div>
      </div>
    );
  };

  return { Manager };
};