// Simple global presets store decoupled from React components (for HMR friendliness)
let globalPresets = [
  {
    id: 1,
    name: 'Standard Außen',
    cameraManufacturer: 'Sony',
    cameraModel: 'FX3',
    lensManufacturer: 'Sony',
    lensModel: 'FE 24-70mm f/2.8 GM',
    aperture: '5.6',
    iso: '400',
    focalLength: '35',
    format: '4K UHD',
    codec: 'XAVC S-I',
    framerate: '25 fps',
    shutterAngle: '180°',
    whiteBalance: '5600K',
    colorSpace: 'Rec.709',
    notes: 'Standardeinstellung für Außenaufnahmen bei Tageslicht'
  },
  {
    id: 2,
    name: 'Low Light',
    cameraManufacturer: 'Sony',
    cameraModel: 'A7S III',
    lensManufacturer: 'Sony',
    lensModel: 'FE 50mm f/1.2 GM',
    aperture: '1.8',
    iso: '3200',
    focalLength: '50',
    format: '4K UHD',
    codec: 'XAVC S',
    framerate: '25 fps',
    shutterAngle: '180°',
    whiteBalance: '3200K',
    colorSpace: 'S-Log3',
    notes: 'Optimiert für schwache Lichtverhältnisse'
  },
  {
    id: 3,
    name: 'Greenscreen',
    cameraManufacturer: 'Blackmagic Design',
    cameraModel: 'URSA Mini Pro 12K',
    lensManufacturer: 'Canon',
    lensModel: 'CN-E 24-70mm T2.95 L SP',
    aperture: '4.0',
    iso: '800',
    focalLength: '35',
    format: '12K',
    codec: 'Blackmagic RAW',
    framerate: '25 fps',
    shutterAngle: '180°',
    whiteBalance: '5600K',
    colorSpace: 'Blackmagic Design',
    notes: 'Einstellungen für Greenscreen-Aufnahmen'
  }
];

export const getPresets = () => globalPresets;
export const setGlobalPresets = (presets) => { globalPresets = Array.isArray(presets) ? presets : []; };