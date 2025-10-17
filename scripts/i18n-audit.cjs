#!/usr/bin/env node
/*
 Simple i18n audit script
 - Scans src/ for likely hardcoded German UI strings
 - Heuristics: known German UI words and diacritics; strings in aria-label/title; JSX text nodes
 - Excludes contexts/LanguageContext.jsx and data/ by default
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');

const EXCLUDE_DIRS = [
  path.join(SRC_DIR, 'contexts'),
  path.join(SRC_DIR, 'data'),
  path.join(SRC_DIR, 'assets'),
];

// Keep the list small and high-signal; extend as needed
const GERMAN_HINTS = [
  'Erweitern', 'Minimieren', 'Kamera', 'Objektiv', 'Brennweite', 'Blende',
  'Fokus', 'Hyperfokal', 'Anamorph', 'Nicht verfügbar', 'Bitte wählen',
  'Manuell', 'Auswählen', 'Sensorvorschau', 'Ansicht', 'zurücksetzen',
  // with hyphens/soft hyphens frequently used in UI
  'Kamera‑', 'Objektiv‑', 'FOV', 'HFOV', 'VFOV', 'DFOV'
];

const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

function shouldSkip(filePath) {
  const abs = path.resolve(filePath);
  return EXCLUDE_DIRS.some((ex) => abs.startsWith(ex));
}

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (shouldSkip(full)) continue;
    if (e.isDirectory()) {
      walk(full, out);
    } else if (EXTENSIONS.has(path.extname(e.name))) {
      out.push(full);
    }
  }
  return out;
}

function stripComments(source) {
  // naive removal of // and /* */ to cut noise; not perfect but good enough for audit
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '$1');
}

function findIssuesInFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const src = stripComments(raw);
  const issues = [];

  const lines = src.split(/\r?\n/);
  lines.forEach((line, idx) => {
    // Skip obvious i18n lines
    if (line.includes('t(')) return;

    // Check for aria-/title props with literal strings
    const attrMatch = line.match(/\b(aria-label|title|placeholder|alt|label)\s*=\s*"([^"]{2,})"|\'([^\']{2,})\'/i);
    if (attrMatch) {
      const text = (attrMatch[2] || attrMatch[3] || '').trim();
      if (GERMAN_HINTS.some(h => text.includes(h)) || /[äöüÄÖÜß]/.test(text)) {
        issues.push({ line: idx + 1, type: 'attr', text });
      }
    }

    // JSX text nodes: > ... <
    const jsxTexts = [...line.matchAll(/>([^<{}]{2,})</g)];
    for (const m of jsxTexts) {
      const text = m[1].trim();
      if (!text) continue;
      if (GERMAN_HINTS.some(h => text.includes(h)) || /[äöüÄÖÜß]/.test(text)) {
        issues.push({ line: idx + 1, type: 'jsx', text });
      }
    }

    // Generic quoted strings likely used for UI
    const q = [...line.matchAll(/[\"\']([^\"\']{2,})[\"\']/g)];
    for (const m of q) {
      const text = m[1].trim();
      if (!text) continue;
      if (text.length < 3) continue;
      // avoid matching code keys like object keys (followed by :)
      if (/:\s*$/.test(line)) continue;
      // avoid URLs or units
      if (/^https?:\/\//i.test(text) || /\d+\s*(mm|m|°|x)$/i.test(text)) continue;
      if (GERMAN_HINTS.some(h => text.includes(h)) || /[äöüÄÖÜß]/.test(text)) {
        issues.push({ line: idx + 1, type: 'string', text });
      }
    }
  });

  return issues;
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('src directory not found');
    process.exit(2);
  }

  const files = walk(SRC_DIR);
  const report = [];

  for (const f of files) {
    const issues = findIssuesInFile(f);
    if (issues.length) {
      report.push({ file: path.relative(ROOT, f), issues });
    }
  }

  if (!report.length) {
    console.log('i18n audit: no potential hardcoded German strings found.');
    process.exit(0);
  }

  console.log('i18n audit: potential hardcoded German strings found:\n');
  for (const entry of report) {
    console.log(`- ${entry.file}`);
    for (const it of entry.issues.slice(0, 10)) {
      console.log(`  L${it.line.toString().padStart(4, ' ')}  [${it.type}]  ${it.text}`);
    }
    if (entry.issues.length > 10) {
      console.log(`  ... and ${entry.issues.length - 10} more`);
    }
  }
  // non-failing by default; change to 1 to enforce CI failure
  process.exit(0);
}

main();