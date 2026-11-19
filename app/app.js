// Leonida Trophy Guide — bootstrap: loads the trophy data, wires the
// checklist, the roadmap view, the spoiler setting and progress export and
// import, and reads the view straight from the URL so a link can open the
// guide at one trophy, one filter or the roadmap (?view=roadmap,
// ?filter=missable, ?spoiler=on, ?open=17, ?demo=1 seeds a sample run).
import {
  loadEarnedIds,
  saveEarnedIds,
  loadSpoilerHidden,
  saveSpoilerHidden,
  downloadExportFile,
  parseImportText,
} from './storage.js';
import { renderTrophyList, renderDetailPanel } from './tracker.js';
import { renderRoadmapStages } from './roadmap.js';

const params = new URLSearchParams(window.location.search);
const trophies = (await (await fetch('data/trophies.json')).json()).trophies;
const trophiesById = new Map(trophies.map((trophy) => [trophy.id, trophy]));

// The demo flag seeds a sample playthrough (twelve trophies earned) the
// first time it is used, so a shared link can show the guide mid-run.
let earnedIds = loadEarnedIds();
if (params.get('demo') === '1' && earnedIds.size === 0) {
  earnedIds = new Set([2, 3, 4, 8, 15, 17, 21, 28, 42, 44, 46, 55]);
  saveEarnedIds(earnedIds);
}

const state = {
  kind: ['all', 'story', 'missable', 'collectibles', 'activities', 'online'].includes(params.get('filter'))
    ? params.get('filter')
    : 'all',
  search: '',
  spoilerHidden: params.get('spoiler') === 'on' ? true : loadSpoilerHidden(),
  earnedOnly: false,
  earnedIds,
  selectedId: Number(params.get('open')) || null,
};

const listEl = document.getElementById('trophyList');
const emptyNote = document.getElementById('emptyNote');
const detailCard = document.getElementById('detailCard');
const filterNote = document.getElementById('filterNote');
const searchInput = document.getElementById('search');
const spoilerToggle = document.getElementById('spoilerToggle');
const earnedToggle = document.getElementById('earnedToggle');
spoilerToggle.checked = state.spoilerHidden;

function refreshProgress() {
  const earned = state.earnedIds.size;
  const total = trophies.length;
  document.getElementById('earnedCount').textContent = String(earned);
  document.getElementById('progressFill').style.width = `${Math.round((earned / total) * 100)}%`;
  document.getElementById('progressLabel').textContent =
    `${Math.round((earned / total) * 100)}% to the platinum — ${total - earned} to go`;
  const counts = ['platinum', 'gold', 'silver', 'bronze']
    .map((grade) => {
      const done = trophies.filter((t) => t.grade === grade && state.earnedIds.has(t.id)).length;
      const of = trophies.filter((t) => t.grade === grade).length;
      return `${grade} ${done}/${of}`;
    })
    .join(' · ');
  document.getElementById('gradeCounts').textContent = counts;
}

function refreshFilterNote() {
  if (state.kind === 'online') {
    filterNote.textContent =
      'This list has no online trophies — every one of the 55 is earned in single-player. The filter is here because the bounty asks for it, and it honestly shows nothing.';
  } else if (state.kind === 'missable') {
    const total = trophies.filter((t) => t.missable).length;
    filterNote.textContent = `${total} missable trophies — finish these before the final mission, the point of no return.`;
  } else {
    filterNote.textContent = '';
  }
}

function renderAll() {
  refreshProgress();
  refreshFilterNote();
  const shown = renderTrophyList(listEl, trophies, state, {
    onToggle: toggleEarned,
    onSelect: selectTrophy,
  });
  emptyNote.hidden = shown !== 0;
  const selected = state.selectedId ? trophiesById.get(state.selectedId) ?? null : null;
  renderDetailPanel(detailCard, selected, state.earnedIds);
  document.querySelectorAll('.trophy-row').forEach((row) => {
    row.classList.toggle('selected', Number(row.dataset.trophyId) === state.selectedId);
  });
  document.querySelectorAll('.chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.kind === state.kind);
  });
}

function toggleEarned(trophyId, earned) {
  if (earned) state.earnedIds.add(trophyId);
  else state.earnedIds.delete(trophyId);
  saveEarnedIds(state.earnedIds);
  renderAll();
}

function selectTrophy(trophyId) {
  state.selectedId = trophyId;
  renderAll();
  detailCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

detailCard.addEventListener('leonida-toggle-earned', (event) => {
  const trophyId = event.detail.trophyId;
  toggleEarned(trophyId, !state.earnedIds.has(trophyId));
});

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    state.kind = chip.dataset.kind;
    renderAll();
  });
});

searchInput.addEventListener('input', () => {
  state.search = searchInput.value;
  renderAll();
});

spoilerToggle.addEventListener('change', () => {
  state.spoilerHidden = spoilerToggle.checked;
  saveSpoilerHidden(state.spoilerHidden);
  renderAll();
});

earnedToggle.addEventListener('change', () => {
  state.earnedOnly = earnedToggle.checked;
  renderAll();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const count = downloadExportFile(state.earnedIds, trophies.length);
  filterNote.textContent = `Exported ${count} earned trophies to leonida-trophy-progress.json.`;
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const imported = parseImportText(await file.text());
  if (imported === null) {
    filterNote.textContent = 'That file is not a Leonida Trophy Guide export — nothing was imported.';
    return;
  }
  state.earnedIds = imported;
  saveEarnedIds(state.earnedIds);
  renderAll();
  filterNote.textContent = `Imported ${imported.size} earned trophies from ${file.name}.`;
  event.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!window.confirm('Reset all earned trophies to zero? This clears the progress saved in this browser.')) return;
  state.earnedIds = new Set();
  saveEarnedIds(state.earnedIds);
  renderAll();
});

// Tabs switch between the checklist, the roadmap and the sources page.
const views = {
  checklist: { tab: 'tabChecklist' },
  roadmap: { tab: 'tabRoadmap' },
  sources: { tab: 'tabSources' },
};

function showView(name) {
  for (const [viewName, view] of Object.entries(views)) {
    document.getElementById(view.tab).classList.toggle('active', viewName === name);
  }
  const checklistVisible = name === 'checklist';
  document.getElementById('controls').style.display = checklistVisible ? '' : 'none';
  document.querySelector('.layout').style.display = checklistVisible ? '' : 'none';
  document.getElementById('roadmapView').hidden = name !== 'roadmap';
  document.getElementById('sourcesView').hidden = name !== 'sources';
  if (name === 'roadmap') {
    renderRoadmapStages(document.getElementById('roadmapStages'), trophiesById, state.earnedIds);
  }
}

document.getElementById('tabChecklist').addEventListener('click', () => showView('checklist'));
document.getElementById('tabRoadmap').addEventListener('click', () => showView('roadmap'));
document.getElementById('tabSources').addEventListener('click', () => showView('sources'));

renderAll();
const initialView = params.get('view');
if (initialView === 'roadmap' || initialView === 'sources') showView(initialView);
