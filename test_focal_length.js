// Test der Brennweiten-Extraktion
const extractFocalLengthFromLens = (lensModel) => {
  if (!lensModel) return '';
  
  const patterns = [
    /(\d+)-(\d+)mm/i,
    /(\d+)mm\s+T\d+(?:\.\d+)?/i,
    /(\d+)mm\s+Macro/i,
    /(\d+)mm\s+T\d+(?:\.\d+)?\s*\([^)]+\)/i,
    /(\d+)mm/i
  ];
  
  for (const pattern of patterns) {
    const match = lensModel.match(pattern);
    if (match) {
      if (match[2]) {
        return `${match[1]}-${match[2]}mm`;
      } else {
        return `${match[1]}mm`;
      }
    }
  }
  
  return '';
};

// Test verschiedene Objektive
const testLenses = [
  'Canon EF 24-70mm f/2.8L II USM',
  'Zeiss CP.3 25mm T2.1',
  'Cooke Anamorphic/i 40mm T2.3',
  'ARRI Master Prime 50mm T1.3',
  'Sony FE 85mm f/1.4 GM',
  'Canon EF 100mm f/2.8L Macro IS USM',
  'Hawk V-Lite 28mm T2.2 (2x)',
  'Angenieux Optimo Anamorphic 30-72mm T4'
];

console.log('Test der Brennweiten-Extraktion:');
testLenses.forEach(lens => {
  const result = extractFocalLengthFromLens(lens);
  console.log(`${lens} -> ${result}`);
});