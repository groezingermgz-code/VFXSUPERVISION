// Datenbank für gängige Kamera-Filter
export const filterDatabase = {
  nd: [
    'ND 0.3 (1 Stop)',
    'ND 0.6 (2 Stops)',
    'ND 0.9 (3 Stops)',
    'ND 1.2 (4 Stops)',
    'ND 1.5 (5 Stops)',
    'ND 1.8 (6 Stops)',
    'ND 2.1 (7 Stops)',
    'ND 2.4 (8 Stops)',
    'ND 2.7 (9 Stops)',
    'ND 3.0 (10 Stops)'
  ],
  polarizing: [
    'Zirkular Polarisationsfilter',
    'Linear Polarisationsfilter'
  ],
  uv: [
    'UV-Filter',
    'UV-Haze Filter'
  ],
  color: [
    'Warming Filter (81A)',
    'Warming Filter (81B)',
    'Cooling Filter (82A)',
    'Cooling Filter (82B)',
    'Color Correction Filter (CC30M)',
    'Color Correction Filter (CC30G)',
    'Daylight to Tungsten (85B)',
    'Tungsten to Daylight (80A)'
  ],
  diffusion: [
    'Pro-Mist 1/8',
    'Pro-Mist 1/4',
    'Pro-Mist 1/2',
    'Pro-Mist 1',
    'Black Pro-Mist 1/8',
    'Black Pro-Mist 1/4',
    'Black Pro-Mist 1/2',
    'Black Pro-Mist 1',
    'Glimmerglass 1',
    'Glimmerglass 2',
    'Glimmerglass 3'
  ],
  special: [
    'Star Filter 4-Point',
    'Star Filter 6-Point',
    'Star Filter 8-Point',
    'Streak Filter',
    'Fog Filter 1',
    'Fog Filter 2',
    'Fog Filter 3',
    'Double Fog 1',
    'Double Fog 2'
  ]
};

// Alle Filter in einer flachen Liste
export const getAllFilters = () => {
  const allFilters = [];
  Object.values(filterDatabase).forEach(category => {
    allFilters.push(...category);
  });
  return allFilters.sort();
};

// Filter nach Kategorie
export const getFiltersByCategory = (category) => {
  return filterDatabase[category] || [];
};

// Alle Kategorien
export const getFilterCategories = () => {
  return Object.keys(filterDatabase);
};