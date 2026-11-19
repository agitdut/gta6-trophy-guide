// Leonida Trophy Guide — the hand-in program (Node 22, standard library only).
//
// The guide itself is plain static files in app/ (index.html, style.css, app.js and
// data/trophies.json — no build step, no network at run time). This program does the
// one job the competition asks of it: copy app/ and screenshots/ next to this file
// into the output directory and write dossier.json there, using the vendored
// make.fun library, so the judge reads exactly what the scorer computes.
//
// vendor/makefun-frontend.ts is the kit's copy and must stay untouched — the sealed
// scorer rebuilds the dossier with its own copy and compares the two byte for byte.
//
// Run it outside the grader with an output directory of your own:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader MAKEFUN_OUTPUT_DIR is unset and the output goes to /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });

// app/ first: the whole guide, exactly as it sits in the repository.
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

// screenshots/ second: 3 or 4 renders of the guide, the first by name the cover.
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The dossier, with the kit's own caps baked in: at most 4 screenshots of 256 KiB,
// app/ at most 993 files and 48 MiB, and the judge-view text at most 160 KiB.
// Anything over those caps is an entry the scorer would refuse, so refusing here
// keeps a bad hand-in from ever being submitted.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`Leonida Trophy Guide handed in: app/ + screenshots/ + dossier.json (${dossier.length} bytes) in ${outputDir}`);
