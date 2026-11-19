# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/agitdut/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/agitdut/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — an offline guide and tracker for all 55 PlayStation 5
trophies of Grand Theft Auto VI. Every trophy is shown with its official name,
description and grade exactly as PlayStation publishes them, plus a guide
written in our own words that cites its sources (Exophase, PSNProfiles and
PowerPyx), a six-stage roadmap to the platinum built from the official
descriptions, and clear flags for all 8 missable trophies. The tracker saves
your progress in the browser, exports it to a file and imports it back,
filters by kind (story, missable, collectibles, activities, online), and has a
spoiler setting that hides story trophies until they are earned. It runs from
plain static files with no build step and no network — no Rockstar logo or
official artwork anywhere, the look is our own.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. To try a view straight
away, add a query: `?view=roadmap` for the roadmap, `?filter=missable` for the
missable trophies, `?spoiler=on` for spoiler hiding, `?open=17` to open one
trophy's guide, or `?demo=1` to see the guide mid-run with sample progress.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
node cli/makefun.mjs check --kit . --repo /home/hatch/workspace/makefun/gta6-trophy-guide
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
