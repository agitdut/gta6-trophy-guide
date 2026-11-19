// The roadmap to the platinum: six stages in the order to play them, built
// from the official trophy descriptions. Each stage names its trophies by id
// so the checklist and the roadmap always agree with each other.
export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Play the story, and mind the missables',
    blurb:
      'Chapters 1–4 and the named story missions, in order. This is where the missable trophies live: the two partner robberies, the VCIA departure, the showroom smash, the one-time choices and the opening mission. Clear all eight missable flags before the final mission — it is the point of no return.',
    trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 33, 34, 37, 45, 48],
  },
  {
    stage: 2,
    title: 'Stage 2 — Contacts and strangers',
    blurb:
      'Finish every contact strand (Andy, Kenton, Billy, Randy, Tyrone) and eight full stranger strands across Leonida. Strangers appear as question marks on the map; take them as you find them and the silver pops at the eighth completed strand.',
    trophyIds: [22, 23, 24, 25, 26, 27, 47, 49],
  },
  {
    stage: 3,
    title: 'Stage 3 — Collectibles and exploring Leonida',
    blurb:
      'Meditate at all 18 spots, complete 3 card sets, check in with WAiNK at 100 locations, discover 100 vehicles and explore all 52 areas. Sweep each district as the story takes you through it, so the map is nearly done before the endgame.',
    trophyIds: [28, 30, 31, 35, 42, 44, 50],
  },
  {
    stage: 4,
    title: 'Stage 4 — Activities and challenges',
    blurb:
      'The grind stage: gold in all 42 Shooting Range challenges, 14 drone-race wins, 20 different race wins, 250 stunts, 50 challenges, the fishing win over Cal, an arcade game, a bowling game, the unique-animal hunt, and the combat and driving feats. Try all 9 activity types early so Master of None pops on its own.',
    trophyIds: [15, 16, 17, 18, 19, 20, 21, 29, 32, 36, 38, 46, 51],
  },
  {
    stage: 5,
    title: 'Stage 5 — Money, robberies and property',
    blurb:
      'Rob 5 bank vaults, an armored truck and one illegal operation per gang, then launder $250,000 of Marked Bills, spend $100,000 in shops, buy all 8 garages and register 10 vehicles to the Scooter Bros app. Robbery money funds the spending trophies, so do the vaults first.',
    trophyIds: [39, 40, 41, 43, 52, 53, 54, 55],
  },
  {
    stage: 6,
    title: 'Stage 6 — 100% completion and the platinum',
    blurb:
      'With everything else done, clear whatever the in-game 100% checklist still shows — that pops the gold for 100% completion — and the platinum follows the moment the 54th other trophy is earned. Nothing extra is needed for the platinum itself.',
    trophyIds: [1, 14],
  },
];

// Render the roadmap stages into a container element. Each stage lists its
// trophies by name; earned ones are struck through, and the stage header
// shows how many of its trophies are done.
export function renderRoadmapStages(container, trophiesById, earnedIds) {
  container.innerHTML = '';
  for (const stage of ROADMAP_STAGES) {
    const done = stage.trophyIds.filter((id) => earnedIds.has(id)).length;
    const item = document.createElement('li');
    item.className = 'roadmap-stage';
    const heading = document.createElement('h3');
    heading.textContent = `${stage.title} — ${done}/${stage.trophyIds.length} done`;
    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    const list = document.createElement('ul');
    list.className = 'roadmap-trophies';
    for (const id of stage.trophyIds) {
      const trophy = trophiesById.get(id);
      if (!trophy) continue;
      const chip = document.createElement('li');
      if (earnedIds.has(id)) chip.className = 'done';
      chip.textContent = trophy.missable ? `⚠ ${trophy.name}` : trophy.name;
      list.appendChild(chip);
    }
    item.append(heading, blurb, list);
    container.appendChild(item);
  }
}

// Look up which roadmap stage a trophy belongs to, for the detail panel.
export function stageOfTrophy(trophyId) {
  for (const stage of ROADMAP_STAGES) {
    if (stage.trophyIds.includes(trophyId)) return stage.stage;
  }
  return null;
}
