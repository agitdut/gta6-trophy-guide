// Leonida Trophy Guide — tracker logic. Loads data/trophies.json once, keeps the
// earned set in localStorage, and renders the roadmap, the filters and the cards.
// Nothing here talks to the network except that one same-origin JSON fetch.
const STORE_KEY = 'leonida-trophy-guide-v1';
const listEl = document.getElementById('trophyList');
const emptyEl = document.getElementById('emptyNote');
const params = new URLSearchParams(location.search);

const state = {
  kind: params.get('kind') || 'all',
  grade: 'all',
  query: '',
  spoilers: params.get('spoilers') === 'on',
  earned: new Set(),
};

function loadEarned() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]');
    if (Array.isArray(saved)) return new Set(saved.filter((n) => typeof n === 'string'));
  } catch { /* a corrupt saved file just means starting fresh */ }
  return new Set();
}

function persistEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...state.earned]));
}

// A shareable link can pre-tick trophies: ?earned=2,3,4 uses the trophy ids.
function applySharedEarned(trophies) {
  const raw = params.get('earned');
  if (!raw) return;
  const byId = new Map(trophies.map((t) => [String(t.id), t.name]));
  for (const piece of raw.split(',')) {
    const name = byId.get(piece.trim());
    if (name) state.earned.add(name);
  }
  persistEarned();
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function isHiddenFromSpoilers(trophy) {
  return state.spoilers && trophy.kind === 'story' && !state.earned.has(trophy.name);
}

function visibleTrophies(trophies) {
  const q = state.query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind === 'missable' && !t.missable) return false;
    if (state.kind === 'online') return false; // the official list holds no online trophies
    if (state.kind !== 'all' && state.kind !== 'missable' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function sourceLine(trophy) {
  const parts = trophy.sources.map((s) => {
    if (s.url) return '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.name + '</a>';
    return s.name;
  });
  return 'Sources: ' + parts.join(' · ');
}

function cardFor(trophy) {
  const card = document.createElement('article');
  card.className = 'card' + (state.earned.has(trophy.name) ? ' earned' : '');
  card.id = 'trophy-' + trophy.id;
  const hidden = isHiddenFromSpoilers(trophy);

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(trophy.name);
  box.setAttribute('aria-label', 'Mark ' + trophy.name + ' as earned');
  box.addEventListener('change', () => {
    if (box.checked) state.earned.add(trophy.name);
    else state.earned.delete(trophy.name);
    persistEarned();
    renderAll();
  });
  const titleWrap = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  const desc = document.createElement('p');
  desc.className = 'official';
  desc.textContent = hidden
    ? 'Hidden until earned — turn the spoiler setting off, or earn it, to reveal it.'
    : trophy.description;
  const badges = document.createElement('p');
  badges.innerHTML = '';
  const gradeBadge = document.createElement('span');
  gradeBadge.className = 'badge ' + trophy.grade;
  gradeBadge.textContent = gradeLabel(trophy.grade);
  badges.append(gradeBadge);
  if (trophy.missable) {
    const m = document.createElement('span');
    m.className = 'badge missable';
    m.textContent = 'Missable';
    badges.append(m);
  }
  if (trophy.hidden) {
    const h = document.createElement('span');
    h.className = 'badge hidden-flag';
    h.textContent = 'Hidden on PSN';
    badges.append(h);
  }
  titleWrap.append(title, desc, badges);
  head.append(box, titleWrap);
  card.append(head);

  if (typeof trophy.count === 'number') {
    const count = document.createElement('p');
    count.className = 'count';
    count.textContent = 'Target: ' + trophy.count.toLocaleString('en-US') + ' · roadmap stage ' + trophy.stage;
    card.append(count);
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  toggle.textContent = 'Read the guide';
  toggle.addEventListener('click', () => card.classList.toggle('open'));
  card.append(toggle);

  const guide = document.createElement('div');
  guide.className = 'guide';
  const text = document.createElement('p');
  text.textContent = trophy.guide;
  const sources = document.createElement('p');
  sources.className = 'sources';
  sources.innerHTML = sourceLine(trophy);
  guide.append(text, sources);
  card.append(guide);
  return card;
}

function renderRoadmap(doc) {
  const list = document.getElementById('roadmapList');
  list.replaceChildren();
  for (const step of doc.roadmap) {
    const li = document.createElement('li');
    const stage = document.createElement('span');
    stage.className = 'stage-no';
    stage.textContent = 'Stage ' + step.stage;
    const heading = document.createElement('h3');
    heading.textContent = step.title;
    const text = document.createElement('p');
    text.textContent = step.text;
    li.append(stage, heading, text);
    list.append(li);
  }
  const missable = doc.trophies.filter((t) => t.missable);
  document.getElementById('missableSummary').textContent =
    'Missable flags (' + missable.length + '): ' +
    missable.map((t) => t.name).join(' · ') +
    '. Do these inside their missions, with your partner beside you for Hot Together.';
}

function renderProgress(trophies) {
  document.getElementById('earnedCount').textContent = String(state.earned.size);
  document.getElementById('stickyProgress').textContent =
    state.earned.size + ' / ' + trophies.length + ' earned';
  document.getElementById('barFill').style.width =
    Math.round((state.earned.size / trophies.length) * 100) + '%';
  const byGrade = {};
  for (const t of trophies) {
    if (!state.earned.has(t.name)) continue;
    byGrade[t.grade] = (byGrade[t.grade] ?? 0) + 1;
  }
  const totals = {};
  for (const t of trophies) totals[t.grade] = (totals[t.grade] ?? 0) + 1;
  document.getElementById('gradeCounts').textContent =
    ['platinum', 'gold', 'silver', 'bronze']
      .map((g) => gradeLabel(g) + ' ' + (byGrade[g] ?? 0) + '/' + totals[g])
      .join(' · ');
}

function renderAll() {
  const shown = visibleTrophies(window.__trophies);
  listEl.replaceChildren();
  for (const t of shown) listEl.append(cardFor(t));
  if (state.kind === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent =
      'No online trophies in the official list: all 55 trophies are earned in single-player ' +
      'Leonida, so this filter is empty by design — the guide says so rather than inventing one.';
  } else if (shown.length === 0) {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No trophies match these filters. Clear the search or pick another kind.';
  } else {
    emptyEl.hidden = true;
  }
  document.getElementById('listHeading').textContent =
    'Trophy checklist — showing ' + shown.length + ' of ' + window.__trophies.length;
  renderProgress(window.__trophies);
  // Open the trophy a #trophy-<id> link points at — once, on the first render,
  // so ticking a box later does not yank the page back to it.
  if (!window.__hashScrolled) {
    window.__hashScrolled = true;
    const openId = location.hash.match(/^#trophy-(\d+)$/);
    if (openId) {
      const card = document.getElementById('trophy-' + openId[1]);
      if (card) {
        card.classList.add('open');
        card.scrollIntoView({ block: 'center' });
      }
    }
  }
}

function wireControls(doc) {
  document.getElementById('kindRow').addEventListener('click', (event) => {
    const button = event.target.closest('[data-kind]');
    if (!button) return;
    state.kind = button.dataset.kind;
    for (const b of document.querySelectorAll('#kindRow .kind')) {
      b.classList.toggle('active', b === button);
    }
    renderAll();
  });
  document.getElementById('grade').addEventListener('change', (event) => {
    state.grade = event.target.value;
    renderAll();
  });
  document.getElementById('search').addEventListener('input', (event) => {
    state.query = event.target.value;
    renderAll();
  });
  const spoilerBox = document.getElementById('spoilers');
  spoilerBox.checked = state.spoilers;
  spoilerBox.addEventListener('change', (event) => {
    state.spoilers = event.target.checked;
    renderAll();
  });
  document.getElementById('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify([...state.earned], null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leonida-trophy-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const names = JSON.parse(await file.text());
      if (!Array.isArray(names)) throw new Error('expected a list of trophy names');
      const known = new Set(doc.trophies.map((t) => t.name));
      state.earned = new Set(names.filter((n) => known.has(n)));
      persistEarned();
      renderAll();
    } catch {
      emptyEl.hidden = false;
      emptyEl.textContent = 'That file could not be imported: it must be a JSON list of trophy names exported from this guide.';
    }
  });
  // Honour a kind passed in the link (?kind=collectibles) by marking its button.
  for (const b of document.querySelectorAll('#kindRow .kind')) {
    b.classList.toggle('active', b.dataset.kind === state.kind);
  }
}

const doc = await (await fetch('data/trophies.json')).json();
window.__trophies = doc.trophies;
state.earned = loadEarned();
applySharedEarned(doc.trophies);
renderRoadmap(doc);
wireControls(doc);
renderAll();
