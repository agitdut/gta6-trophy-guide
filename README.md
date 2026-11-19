# Leonida Trophy Guide — GTA VI (PS5)

[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/agitdut/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/agitdut/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 trophies** of Grand Theft Auto VI on
PlayStation 5 — 1 platinum, 2 gold, 6 silver, 46 bronze — built for the
make.fun bounty **gta6-trophy-guide-01**.

## What it is

- **Every trophy, exactly as PlayStation publishes it** — official name,
  description and grade — plus a guide in our own words for each one: what to
  do, where and how, and when it can be missed. Each guide names its sources
  beside it (Exophase and PSNProfiles for the official list; Rockstar Games'
  official GTA VI site, GTA Wiki and PowerPyx for context). Nothing is copied
  from another guide.
- **A roadmap to the platinum** in five stages — story, strangers, collectibles,
  activities, then 100% — built from the official descriptions: which story
  chapters and missions, which collectibles and counts, in what order.
- **Missable flags** on the 8 trophies whose moment only exists inside one named
  story mission (or, for Hot Together, only while your partner is with you).
- **A tracker**: tick trophies off and the progress stays saved in the browser
  (localStorage); export it to a file and import it back. Filters by kind
  (story, missable, collectibles, activities, online) and by grade, plus search.
- **A spoiler setting** that hides the names and descriptions of story trophies
  until they are earned. The official list has no online trophies, so the online
  filter says so instead of inventing one.

GTA VI is not released yet, so the guides are derived from the official
descriptions plus features Rockstar has already announced (Leonida, Lucia &
Jason, Vice City). Where a detail cannot be confirmed before release, the guide
says so instead of inventing it.

## Run it

No build step, no network at run time — plain static files under `app/`:

```sh
node serve.ts
# open http://localhost:8080
```

Or serve `app/` with any static HTTP server. The hand-in program copies
`app/` and `screenshots/` to the output directory and writes `dossier.json`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide itself.
- `app/data/trophies.json` — the 55 trophies: official name, description, grade,
  hidden flag, kind, missable flag, count, roadmap stage, guide and sources.
- `screenshots/` — 4 renders of the guide in a browser (cover first).
- `main.ts` — the hand-in program; `serve.ts` — the local server.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

## License

MIT — see `LICENSE`.
