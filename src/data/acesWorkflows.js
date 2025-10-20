// ACES workflow templates for common applications
// Each template provides suggested steps: IDT -> Working -> ODT
// Notes: Adjust ODT (Rec.709, sRGB, P3-D65, Rec.2020) as needed

export const programTemplates = {
  resolve: [
    { id: 1, name: 'IDT: Camera → ACEScg', input: 'Camera Log (e.g., LogC4, S-Log3, Log3G10)', output: 'ACEScg', note: 'Set Color Management: ACEScct; choose appropriate IDT' },
    { id: 2, name: 'Grading in ACEScct', input: 'ACEScg', output: 'ACEScct', note: 'Primary/Secondary grade in ACEScct timeline' },
    { id: 3, name: 'RRT + ODT to Display', input: 'ACEScct', output: 'Rec.709', note: 'Set ODT: Rec.709 (or P3-D65 / Rec.2020)' },
  ],
  premiere: [
    { id: 1, name: 'Viewer LUT / IDT', input: 'Camera Log', output: 'ACES-like Working', note: 'Use LUT to approximate IDT (Lumetri) or OCIO plugin' },
    { id: 2, name: 'Grading', input: 'ACES-like Working', output: 'ACES-like Working', note: 'Lumetri grading; avoid clipping before ODT' },
    { id: 3, name: 'ODT via LUT', input: 'ACES-like Working', output: 'Rec.709', note: 'Apply ODT LUT to Rec.709 output' },
  ],
  aftereffects: [
    { id: 1, name: 'OCIO IDT', input: 'Camera Log', output: 'ACEScg', note: 'Set OCIO config: ACES 1.3+, apply IDT (OCIOv2)' },
    { id: 2, name: 'Grading in ACEScct', input: 'ACEScg', output: 'ACEScct', note: 'Work in ACEScct for grading layers' },
    { id: 3, name: 'OCIO ODT', input: 'ACEScct', output: 'Rec.709', note: 'OCIO display transform: RRT+ODT' },
  ],
  nuke: [
    { id: 1, name: 'Set Project to ACES', input: 'Camera Log', output: 'ACEScg', note: 'Project color mgmt: OCIO ACES; Read with IDT' },
    { id: 2, name: 'Composite/Grade in ACEScg', input: 'ACEScg', output: 'ACEScg', note: 'Operate nodes in ACEScg' },
    { id: 3, name: 'Viewer ODT', input: 'ACEScg', output: 'Rec.709', note: 'Viewer process RRT+ODT (Rec.709/P3D65 etc.)' },
  ],
  fusion: [
    { id: 1, name: 'OCIO IDT', input: 'Camera Log', output: 'ACEScg', note: 'Use OCIOColorSpace node for IDT' },
    { id: 2, name: 'Composite/Grade in ACEScg', input: 'ACEScg', output: 'ACEScg', note: 'Work in ACEScg' },
    { id: 3, name: 'OCIO ODT', input: 'ACEScg', output: 'Rec.709', note: 'OCIOColorSpace node for RRT+ODT' },
  ],
  baselight: [
    { id: 1, name: 'IDT: Camera → ACEScg', input: 'Camera Log', output: 'ACEScg', note: 'Set IDT per shot' },
    { id: 2, name: 'Grading in ACEScct', input: 'ACEScg', output: 'ACEScct', note: 'Use ACEScct grading space' },
    { id: 3, name: 'RRT+ODT', input: 'ACEScct', output: 'Rec.709', note: 'Choose ODT in project settings' },
  ],
  flame: [
    { id: 1, name: 'ACES IDT', input: 'Camera Log', output: 'ACEScg', note: 'Project: ACES; choose IDT' },
    { id: 2, name: 'Grading', input: 'ACEScg', output: 'ACEScg', note: 'Operate in ACEScg' },
    { id: 3, name: 'ODT', input: 'ACEScg', output: 'Rec.709', note: 'Set display transform to desired ODT' },
  ],
  blender: [
    { id: 1, name: 'OCIO ACES Setup', input: 'Linear Scene', output: 'ACEScg', note: 'Load ACES OCIO config, set working to ACEScg' },
    { id: 2, name: 'Render/Composite', input: 'ACEScg', output: 'ACEScg', note: 'Operate in ACEScg' },
    { id: 3, name: 'View Transform', input: 'ACEScg', output: 'sRGB', note: 'RRT+ODT to sRGB (or Rec.709)' },
  ],
  unreal: [
    { id: 1, name: 'ACES Tonemapper', input: 'Linear HDR', output: 'ACES Tonemapped', note: 'UE uses ACES Filmic tonemapper by default' },
    { id: 2, name: 'Output ODT', input: 'ACES Tonemapped', output: 'sRGB/Rec.709', note: 'Output to sRGB/Rec.709 (display)' },
  ],
  photoshop: [
    { id: 1, name: 'OCIO IDT (Plugin)', input: 'Camera Log', output: 'ACEScg', note: 'Use OCIO plugin to apply IDT' },
    { id: 2, name: 'Grade in ACES-like', input: 'ACEScg', output: 'ACEScg', note: 'Limited native ACES; use OCIO plugin' },
    { id: 3, name: 'OCIO ODT', input: 'ACEScg', output: 'Rec.709', note: 'Apply RRT+ODT via OCIO' },
  ],
  maya: [
    { id: 1, name: 'OCIO ACES Setup', input: 'Linear Scene', output: 'ACEScg', note: 'Set OCIO config to ACES; working ACEScg' },
    { id: 2, name: 'Render/Composite', input: 'ACEScg', output: 'ACEScg', note: 'Operate in ACEScg' },
    { id: 3, name: 'View Transform', input: 'ACEScg', output: 'sRGB/Rec.709', note: 'Display with RRT+ODT' },
  ],
  houdini: [
    { id: 1, name: 'OCIO ACES Setup', input: 'Linear Scene', output: 'ACEScg', note: 'Configure OCIO to ACES' },
    { id: 2, name: 'Render/Composite', input: 'ACEScg', output: 'ACEScg', note: 'Operate in ACEScg' },
    { id: 3, name: 'View Transform', input: 'ACEScg', output: 'sRGB/Rec.709', note: 'Display transform to ODT' },
  ],
};

export const programOptions = [
  { key: 'resolve', label: 'DaVinci Resolve (ACEScct)' },
  { key: 'premiere', label: 'Adobe Premiere Pro (Lumetri + LUT)' },
  { key: 'aftereffects', label: 'Adobe After Effects (OCIO ACES)' },
  { key: 'nuke', label: 'Nuke (ACES 1.3)' },
  { key: 'fusion', label: 'Fusion (OCIO ACES)' },
  { key: 'baselight', label: 'Baselight (ACEScct)' },
  { key: 'flame', label: 'Flame (ACES)' },
  { key: 'blender', label: 'Blender (OCIO ACES)' },
  { key: 'unreal', label: 'Unreal Engine (ACES Tonemapper)' },
  { key: 'photoshop', label: 'Photoshop (OCIO Plugin)' },
  { key: 'maya', label: 'Maya (OCIO ACES)' },
  { key: 'houdini', label: 'Houdini (OCIO ACES)' },
];