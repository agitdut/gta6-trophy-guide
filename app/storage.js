// Progress storage for the Leonida Trophy Guide: everything lives in the
// browser's localStorage, and the player can export it to a file and import
// it back on any machine. No network is involved at any point.
export const EARNED_KEY = 'leonida-trophy-guide.earned.v1';
export const SPOILER_KEY = 'leonida-trophy-guide.spoilers.v1';

// Read the earned trophy ids out of localStorage. A corrupt or foreign
// value is ignored instead of breaking the page.
export function loadEarnedIds() {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

// Persist the earned trophy ids to localStorage.
export function saveEarnedIds(earnedIds) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earnedIds].sort((a, b) => a - b)));
}

// Read the spoiler setting out of localStorage (default: spoilers shown).
export function loadSpoilerHidden() {
  try {
    return localStorage.getItem(SPOILER_KEY) === '1';
  } catch {
    return false;
  }
}

// Persist the spoiler setting to localStorage.
export function saveSpoilerHidden(hidden) {
  localStorage.setItem(SPOILER_KEY, hidden ? '1' : '0');
}

// Build the export document: the earned ids plus a small header so an
// imported file can be recognised as one of ours.
export function buildExportDocument(earnedIds, totalCount) {
  return {
    app: 'leonida-trophy-guide',
    version: 1,
    exportedAt: new Date().toISOString(),
    totalTrophies: totalCount,
    earned: [...earnedIds].sort((a, b) => a - b),
  };
}

// Download the export document as a JSON file in the browser.
export function downloadExportFile(earnedIds, totalCount) {
  const doc = buildExportDocument(earnedIds, totalCount);
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'leonida-trophy-progress.json';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return doc.earned.length;
}

// Parse an imported file's text into a set of earned ids. Returns null when
// the file is not one of our exports (or not JSON at all), so the caller can
// show an error instead of wiping progress.
export function parseImportText(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) return null;
  const clean = ids.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55);
  if (clean.length === 0 && ids.length > 0) return null;
  return new Set(clean);
}
