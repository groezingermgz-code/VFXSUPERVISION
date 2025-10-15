import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './CameraSettings.css';
import { cameraDatabase, cameraColorSpaces, getManufacturers, getModelsByManufacturer } from '../data/cameraDatabase';
import { lensDatabase, getLensManufacturers, getLensesByManufacturer } from '../data/lensDatabase';

// Exportiere die Presets als globale Variable, damit sie in anderen Komponenten verfügbar sind
let globalPresets = [];

export const getPresets = () => {
  return globalPresets;
};

export const setGlobalPresets = (presets) => {
  globalPresets = presets;
};

const CameraSettings = () => {
  const { t } = useLanguage();
  // Kamera-Hersteller und Modelle
  const [cameraManufacturers, setCameraManufacturers] = useState([]);
  const [selectedCameraManufacturer, setSelectedCameraManufacturer] = useState('');
  const [cameraModels, setCameraModels] = useState([]);
  const [selectedCameraModel, setSelectedCameraModel] = useState('');
  
  // Objektiv-Hersteller und Modelle
  const [lensManufacturers, setLensManufacturers] = useState([]);
  const [selectedLensManufacturer, setSelectedLensManufacturer] = useState('');
  const [lensModels, setLensModels] = useState([]);
  const [selectedLensModel, setSelectedLensModel] = useState('');

  // Presets
  const [presets, setPresets] = useState([
    { id: 1, name: 'Standard Außen', cameraManufacturer: 'ARRI', cameraModel: 'ALEXA Mini', lensManufacturer: 'ARRI', lensModel: 'Master Prime 24mm T1.3', aperture: 'f/5.6', iso: '800', notes: 'Für Tageslicht-Aufnahmen' },
    { id: 2, name: 'Low Light', cameraManufacturer: 'Sony', cameraModel: 'VENICE', lensManufacturer: 'Sony', lensModel: 'FE 24-70mm f/2.8 GM', aperture: 'f/2.8', iso: '2500', notes: 'Für Nachtaufnahmen' },
    { id: 3, name: 'Greenscreen', cameraManufacturer: 'RED', cameraModel: 'KOMODO', lensManufacturer: 'Canon', lensModel: 'EF 50mm f/1.2L USM', aperture: 'f/8', iso: '640', notes: 'Optimiert für Keying' }
  ]);

  // Neues Preset
  const [newPreset, setNewPreset] = useState({ 
    name: '', 
    cameraManufacturer: '', 
    cameraModel: '', 
    lensManufacturer: '', 
    lensModel: '', 
    aperture: '', 
    iso: '', 
    notes: '' 
  });

  // Initialisiere Hersteller und Modelle
  useEffect(() => {
    // Kamera-Hersteller laden
    const manufacturers = getManufacturers();
    setCameraManufacturers(manufacturers);
    if (manufacturers.length > 0) {
      setSelectedCameraManufacturer(manufacturers[0]);
    }
    
    // Objektiv-Hersteller laden
    const lensManufacturers = getLensManufacturers();
    setLensManufacturers(lensManufacturers);
    if (lensManufacturers.length > 0) {
      setSelectedLensManufacturer(lensManufacturers[0]);
    }
  }, []);

  // Aktualisiere Kamera-Modelle, wenn Hersteller geändert wird
  useEffect(() => {
    if (selectedCameraManufacturer) {
      const models = getModelsByManufacturer(selectedCameraManufacturer);
      setCameraModels(models);
      if (models.length > 0) {
        setSelectedCameraModel(models[0]);
      } else {
        setSelectedCameraModel('');
      }
    }
  }, [selectedCameraManufacturer]);

  // Aktualisiere Objektiv-Modelle, wenn Hersteller geändert wird
  useEffect(() => {
    if (selectedLensManufacturer) {
      const models = getLensesByManufacturer(selectedLensManufacturer);
      setLensModels(models);
      if (models.length > 0) {
        setSelectedLensModel(models[0]);
      } else {
        setSelectedLensModel('');
      }
    }
  }, [selectedLensManufacturer]);

  const handleAddPreset = () => {
    if (newPreset.name.trim() === '') return;
    
    const preset = {
      id: presets.length + 1,
      name: newPreset.name,
      cameraManufacturer: selectedCameraManufacturer,
      cameraModel: selectedCameraModel,
      lensManufacturer: selectedLensManufacturer,
      lensModel: selectedLensModel,
      aperture: newPreset.aperture,
      iso: newPreset.iso,
      notes: newPreset.notes
    };
    
    setPresets([...presets, preset]);
    
    setNewPreset({ 
      name: '', 
      aperture: '', 
      iso: '', 
      notes: '' 
    });
  };

  const handlePresetChange = (e) => {
    const { name, value } = e.target;
    setNewPreset({
      ...newPreset,
      [name]: value
    });
  };

  const handleDeletePreset = (id) => {
    setPresets(presets.filter(preset => preset.id !== id));
  };
  
  // Aktualisiere die globalen Presets, wenn sich die lokalen Presets ändern
  useEffect(() => {
    setGlobalPresets(presets);
  }, [presets]);

  return (
     <div className="camera-settings-page">
      <h1>{t('nav.camera')}</h1>
      
      <div className="settings-section">
        <h2>{t('action.view')}</h2>
        <div className="preset-list">
          {presets.map(preset => (
            <div key={preset.id} className="preset-item">
              <h3>{preset.name}</h3>
              <p><strong>{t('camera.model')}:</strong> {preset.cameraManufacturer} {preset.cameraModel}</p>
              <p><strong>{t('lens.lens')}:</strong> {preset.lensManufacturer} {preset.lensModel}</p>
              <p><strong>{t('lens.aperture')}:</strong> {preset.aperture}</p>
              <p><strong>{t('camera.iso')}:</strong> {preset.iso}</p>
              <p><strong>{t('common.notes')}:</strong> {preset.notes}</p>
              <button className="btn-danger" onClick={() => handleDeletePreset(preset.id)}>{t('action.delete')}</button>
            </div>
          ))}
        </div>
        
        <div className="add-preset">
          <h3>{t('action.create')}</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>{t('common.description')}:</label>
              <input 
                type="text" 
                name="name" 
                value={newPreset.name} 
                onChange={handlePresetChange} 
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>{t('camera.manufacturer')}:</label>
              <select 
                value={selectedCameraManufacturer} 
                onChange={(e) => setSelectedCameraManufacturer(e.target.value)}
              >
                {cameraManufacturers.map((manufacturer, index) => (
                  <option key={index} value={manufacturer}>{manufacturer}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>{t('camera.model')}:</label>
              <select 
                value={selectedCameraModel} 
                onChange={(e) => setSelectedCameraModel(e.target.value)}
              >
                {cameraModels.map((model, index) => (
                  <option key={index} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>{t('lens.manufacturer')}:</label>
              <select 
                value={selectedLensManufacturer} 
                onChange={(e) => setSelectedLensManufacturer(e.target.value)}
              >
                {lensManufacturers.map((manufacturer, index) => (
                  <option key={index} value={manufacturer}>{manufacturer}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>{t('lens.lens')}:</label>
              <select 
                value={selectedLensModel} 
                onChange={(e) => setSelectedLensModel(e.target.value)}
              >
                {lensModels.map((model, index) => (
                  <option key={index} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>{t('lens.aperture')}:</label>
              <input 
                type="text" 
                name="aperture" 
                value={newPreset.aperture} 
                onChange={handlePresetChange} 
              />
            </div>
            
            <div className="form-group">
              <label>{t('camera.iso')}:</label>
              <input 
                type="text" 
                name="iso" 
                value={newPreset.iso} 
                onChange={handlePresetChange} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>{t('common.notes')}:</label>
            <textarea 
              name="notes" 
              value={newPreset.notes} 
              onChange={handlePresetChange}
            ></textarea>
          </div>
          
          <button className="btn-primary" onClick={handleAddPreset}>{t('action.create')}</button>
        </div>
      </div>
    </div>
  );
};

export default CameraSettings;