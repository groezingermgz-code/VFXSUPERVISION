// Gängige LUTs für Kamera-Workflows
// Hinweis: Dies sind verbreitete Kombinationen aus Log/Gamut zu Rec.709 bzw. Display-Transforms.
// Die Liste kann projekt- oder kamerabezogen erweitert werden.

// Vollständige LUT-Liste (Fallback)
export const commonLuts = [
  // ARRI
  "ARRI LogC4 → Rec.709 (ALF-2 Look)",
  "ARRI LogC3 → Rec.709 (K1S1)",

  // RED (IPP2)
  "RED Log3G10 / REDWideGamutRGB → Rec.709 (IPP2)",

  // Sony
  "Sony S-Log3 / S-Gamut3.Cine → Rec.709",

  // Canon
  "Canon C-Log3 / Cinema Gamut → Rec.709",
  "Canon C-Log2 / Cinema Gamut → Rec.709",

  // Blackmagic Design
  "Blackmagic Film Gen5 → Extended Video",

  // Panasonic
  "Panasonic V-Log / V-Gamut → Rec.709",

  // Fujifilm
  "Fujifilm F-Log / F-Gamut → Rec.709",

  // Z CAM
  "Z CAM Z-Log2 / Z-Gamut → Rec.709",

  // Generisch / Display-Transforms
  "ACES IDT+RRT+ODT → Rec.709",
];

// Hersteller-spezifische Viewer-LUTs
const manufacturerLuts = {
  "ARRI": [
    "ARRI LogC4 → Rec.709 (ALF-2 Look)",
    "ARRI LogC3 → Rec.709 (K1S1)",
  ],
  "RED": [
    "RED Log3G10 / REDWideGamutRGB → Rec.709 (IPP2)",
  ],
  "Sony": [
    "Sony S-Log3 / S-Gamut3.Cine → Rec.709",
  ],
  "Canon": [
    "Canon C-Log3 / Cinema Gamut → Rec.709",
    "Canon C-Log2 / Cinema Gamut → Rec.709",
  ],
  "Blackmagic Design": [
    "Blackmagic Film Gen5 → Extended Video",
  ],
  "Panasonic": [
    "Panasonic V-Log / V-Gamut → Rec.709",
  ],
  "Fujifilm": [
    "Fujifilm F-Log / F-Gamut → Rec.709",
  ],
  "Z CAM": [
    "Z CAM Z-Log2 / Z-Gamut → Rec.709",
  ],
};

// Generische, herstellerunabhängige LUTs, die immer verfügbar sein können
const genericLuts = [
  "ACES IDT+RRT+ODT → Rec.709",
];

// Liefert Viewer-LUTs passend zum Kamerahersteller
export const getViewerLutsForManufacturer = (manufacturer) => {
  if (!manufacturer) return genericLuts;
  const byMfr = manufacturerLuts[manufacturer] || [];
  return [...byMfr, ...genericLuts];
};