// The trophy checklist: renders the list, the detail panel for the selected
// trophy, the kind filters and the spoiler setting. It never touches the
// network — all it reads is the trophy data handed to it.
import { stageOfTrophy } from './roadmap.js';

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

// A trophy is shown under a kind filter: "missable" matches the missable
// flag, "online" matches kind online (this list has no online trophies — the
// filter honestly shows an empty list with a note), anything else matches
// the trophy's kind field.
export function trophyMatchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  return trophy.kind === kind;
}

// The spoiler setting hides a story trophy's name and description until it
// is earned. Hidden-on-PlayStation trophies are the story ones, so the mask
// applies to kind story while the trophy is unearned.
export function trophyIsSpoilerMasked(trophy, spoilerHidden, earnedIds) {
  return spoilerHidden && trophy.kind === 'story' && !earnedIds.has(trophy.id);
}

// Format the count PlayStation tracks for a trophy, when the official list
// carries one (42 Shooting Range challenges, 14 drone-race locations…).
export function formatCountSuffix(trophy) {
  if (typeof trophy.count !== 'number') return '';
  return ` · target ${trophy.count.toLocaleString('en-US')}`;
}

// Build one checklist row: a checkbox, the official name, description and
// grade, and the kind / missable / hidden / stage badges.
export function buildTrophyRow(trophy, earnedIds, spoilerHidden, onToggle, onSelect) {
  const row = document.createElement('li');
  row.className = 'trophy-row';
  row.dataset.trophyId = String(trophy.id);
  if (earnedIds.has(trophy.id)) row.classList.add('earned');
  if (trophyIsSpoilerMasked(trophy, spoilerHidden, earnedIds)) row.classList.add('spoiler-hidden');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = earnedIds.has(trophy.id);
  checkbox.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  checkbox.addEventListener('change', () => onToggle(trophy.id, checkbox.checked));
  checkbox.addEventListener('click', (event) => event.stopPropagation());

  const body = document.createElement('div');
  const name = document.createElement('p');
  name.className = 'trophy-name';
  name.textContent = trophy.name;
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = trophy.description + formatCountSuffix(trophy);
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  meta.append(gradeBadge(trophy.grade), kindBadge(trophy));
  if (trophy.missable) meta.append(flagBadge('missable', '⚠ Missable'));
  if (trophy.hidden) meta.append(flagBadge('hidden', 'Hidden on PSN'));
  const stage = stageOfTrophy(trophy.id);
  if (stage !== null) meta.append(flagBadge('stage', `Roadmap stage ${stage}`));
  body.append(name, desc, meta);

  const grade = document.createElement('span');
  grade.className = `badge ${trophy.grade}`;
  grade.textContent = trophy.grade;

  row.append(checkbox, body, grade);
  row.addEventListener('click', () => onSelect(trophy.id));
  return row;
}

function gradeBadge(grade) {
  const badge = document.createElement('span');
  badge.className = `badge ${grade}`;
  badge.textContent = grade;
  return badge;
}

function kindBadge(trophy) {
  const badge = document.createElement('span');
  badge.className = 'badge kind';
  badge.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  return badge;
}

function flagBadge(kind, label) {
  const badge = document.createElement('span');
  badge.className = `badge ${kind}`;
  badge.textContent = label;
  return badge;
}

// Render the whole filtered list into the container. Returns how many rows
// were shown, so the caller can show the empty-state note when it is zero.
export function renderTrophyList(container, trophies, state, callbacks) {
  container.innerHTML = '';
  const query = state.search.trim().toLowerCase();
  let shown = 0;
  for (const trophy of trophies) {
    if (!trophyMatchesKind(trophy, state.kind)) continue;
    if (state.earnedOnly && !state.earnedIds.has(trophy.id)) continue;
    if (query && !(trophy.name.toLowerCase().includes(query) || trophy.description.toLowerCase().includes(query))) continue;
    container.appendChild(
      buildTrophyRow(trophy, state.earnedIds, state.spoilerHidden, callbacks.onToggle, callbacks.onSelect),
    );
    shown += 1;
  }
  return shown;
}

// Render the detail panel for one trophy: official name, description and
// grade, the guide in our own words, its cited sources, and a clear
// missable / not-missable verdict built from the official description.
export function renderDetailPanel(card, trophy, earnedIds) {
  card.innerHTML = '';
  if (!trophy) {
    const hint = document.createElement('p');
    hint.className = 'detail-hint';
    hint.textContent = 'Select a trophy on the left to read its full guide, its sources and when it can be missed.';
    card.appendChild(hint);
    return;
  }

  const title = document.createElement('h2');
  title.textContent = trophy.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = `“${trophy.description}” — official description · ${trophy.grade}${formatCountSuffix(trophy)}`;
  card.append(title, official);
  card.append(gradeBadge(trophy.grade), kindBadge(trophy));

  const warn = document.createElement('p');
  if (trophy.missable) {
    warn.className = 'detail-warn';
    warn.textContent = '⚠ Missable — do this before the point of no return. See the guide below for exactly when.';
  } else {
    warn.className = 'detail-ok';
    warn.textContent = 'Not missable — this trophy can be earned any time once it is unlocked, including after the story.';
  }
  card.appendChild(warn);

  const guideHeading = document.createElement('h3');
  guideHeading.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = trophy.guide;
  card.append(guideHeading, guide);

  const sourcesHeading = document.createElement('h3');
  sourcesHeading.textContent = 'Sources';
  const sources = document.createElement('p');
  sources.className = 'detail-sources';
  sources.textContent = `Facts in this guide are drawn from: ${(trophy.sources ?? ['Exophase', 'PSNProfiles']).join(' · ')}. The guide text is written in our own words; the sources are cited, never copied.`;
  card.append(sourcesHeading, sources);

  const stage = stageOfTrophy(trophy.id);
  if (stage !== null) {
    const stageNote = document.createElement('p');
    stageNote.className = 'detail-sources';
    stageNote.textContent = `Roadmap: stage ${stage} of 6 on the road to the platinum.`;
    card.appendChild(stageNote);
  }

  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = earnedIds.has(trophy.id) ? '✓ Earned — mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    const event = new CustomEvent('leonida-toggle-earned', { detail: { trophyId: trophy.id } });
    card.dispatchEvent(event);
  });
  actions.appendChild(toggle);
  card.appendChild(actions);
}
