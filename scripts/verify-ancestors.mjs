#!/usr/bin/env node
/**
 * verify-ancestors.mjs — Task 27's "verify-v2-* pin unwind", part two
 * (v2.321.0). Every release used to leave its feature gate behind: ~295
 * verify-v2-*-0.mjs scripts that pin the bytes of the release they
 * shipped in. They are stale-by-design (the walk law: never touched) —
 * but stale is only honest when it is VISIBLE. Until now the only way to
 * know an ancestor had drifted was to run it and read the failure. This
 * sweep runs them ALL and classifies the drift:
 *
 *   PASS    — exit 0 (young ancestors, or ones written with "superseded
 *             by" comparators, still hold).
 *   DRIFT   — exit 1, and EVERY failing check names the script's OWN
 *             release (the manifest pin, the VERSION pin, the lead
 *             entry): an ancestor speaking its own age. Expected tide.
 *   SIGNAL  — any other failure: a pin moved without its trail note, a
 *             file the ancestor pinned is gone, a check broke for real.
 *             Read the trail files' pin-evolution notes before treating
 *             a signal as breakage (an ancestor whose import-line pin a
 *             later release deliberately evolved signals too — the pin
 *             follows the import, not the round).
 *
 * Exit code: 0 when no SIGNALs (drift is the expected tide), 1 when a
 * signal needs eyes. `--strict` also exits 1 on drift (for a future CI
 * adoption); `--only=v2-319` runs a subset; `--quiet` prints the
 * summary without per-script PASS lines.
 *
 * v2.460.0 — part three, THE ATTESTATIONS COME HOME: the fleet's
 * `verify:v2-*` keys left package.json and the 347 point-in-time
 * attestations took the museum shelf (scripts/release-attestations/).
 * The spawn-era machinery stays wired for any future wired entries;
 * the shelf itself is watched by a BYTE CENSUS, never a spawn — a
 * museum piece is not run on main, it is READ: every attestation must
 * still speak its OWN release word (the `v2.X.Y verification` header
 * it shipped with). A clean shelf is the honest at-rest state; a file
 * that lost its word is DECAY (exit 1, the same honest door).
 *
 * Every classification reads the script's OWN OUTPUT (bytes, not
 * memory) — THE OD LAW.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const strict = process.argv.includes('--strict');
const quiet = process.argv.includes('--quiet');
const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : null;

// Collect the ancestor gates from package.json (the wired truth), in
// script order. A value may chain companions (`&& node scripts/...`) —
// extract every verify-v2-*.mjs token, dedupe, keep order.
const seen = new Set();
const ancestors = [];
for (const [name, cmd] of Object.entries(pkg.scripts || {})) {
  if (!name.startsWith('verify:v2-')) continue;
  const tokens = cmd.match(/scripts\/verify-v2-[\w.-]+\.mjs/g) || [];
  for (const t of tokens) {
    if (seen.has(t)) continue;
    seen.add(t);
    ancestors.push({ npm: name, script: t.replace('scripts/', '') });
  }
}

const subset = only ? ancestors.filter((a) => a.script.includes(only)) : ancestors;

// The fail-line conventions the fleet speaks across its eras:
//   `x FAIL <name>` (new era), `[FAIL] <name>` (check()-era),
//   `FAIL: <name>`, and bare `FAIL  <name>` (the v2.238–249 face).
const FAIL_LINE = /^\s*(?:x FAIL|\[FAIL\]|FAIL[:\s])\s*(.+)$/gm;

let pass = 0, drift = 0, signals = 0, errors = 0;
const signalReport = [];
const driftReport = [];

for (const a of subset) {
  const r = spawnSync('node', ['scripts/' + a.script], {
    cwd: process.cwd(),
    encoding: 'utf8',
    timeout: 60_000,
  });
  const out = (r.stdout || '') + (r.stderr || '');

  if (r.error || (r.status === null && !r.error)) {
    errors++;
    signalReport.push(`${a.script} — SPAWN/TIMEOUT: ${r.error ? r.error.message : 'killed'}`);
    console.error(`SIGNAL ${a.script} (spawn/timeout)`);
    continue;
  }

  if (r.status === 0) {
    pass++;
    if (!quiet) console.log(`  ok   ${a.script}`);
    continue;
  }

  // Classify by the script's own printed failures. The ancestor's own
  // release token is its name: verify-v2-319-0 → '2.319.0' (and
  // verify-v2-248-1 → '2.248.1'). A failing check that names that
  // release is the manifest/lead/VERSION pin — the ancestor aging.
  // Anything else is a signal.
  const token = a.script.match(/v2-(\d+(?:-\d+)?)\.mjs/)?.[1] ?? '';
  const releaseToken = token ? `2.${token.replace(/-(\d+)$/, '.$1')}` : null;

  const failLines = [];
  let m;
  FAIL_LINE.lastIndex = 0;
  while ((m = FAIL_LINE.exec(out)) !== null) failLines.push(m[1].trim());

  if (failLines.length === 0) {
    signals++;
    const tail = out.trim().split('\n').slice(-3).join(' | ').slice(0, 200);
    signalReport.push(`${a.script} — unclassified failure (no FAIL lines parsed): ${tail}`);
    console.error(`SIGNAL ${a.script} (unclassified)`);
    continue;
  }

  const nonVersion = releaseToken
    ? failLines.filter((l) => !l.includes(releaseToken))
    : failLines;
  if (nonVersion.length === 0) {
    drift++;
    driftReport.push(`${a.script} — ${failLines.length} version pin${failLines.length > 1 ? 's' : ''} behind`);
    if (!quiet) console.log(` drift ${a.script} (version tide)`);
  } else {
    signals++;
    signalReport.push(`${a.script} — ${nonVersion.length} non-version failure(s): ${nonVersion.slice(0, 3).join(' ; ').slice(0, 300)}`);
    console.error(`SIGNAL ${a.script}`);
  }
}

console.log(`\nverify-ancestors: ${subset.length} ancestors · ${pass} pass · ${drift} drift (expected tide) · ${signals} SIGNAL · ${errors} error`);

// v2.460.0 THE SHELF CENSUS — the museum's own byte-truth. The shelf's
// files are point-in-time attestations; their version word lives in
// their own bytes and their own name must agree with it.
const SHELF_DIR = 'scripts/release-attestations';
let shelfFiles = [];
try {
  shelfFiles = readdirSync(SHELF_DIR).filter((f) => /^verify-v2-[\w.-]+\.mjs$/.test(f));
} catch {
  // no shelf on this checkout yet — the census reports the absence honestly
}
let shelfClean = 0;
const shelfDecay = [];
for (const f of shelfFiles) {
  const bytes = readFileSync(join(SHELF_DIR, f), 'utf8');
  const token = f.match(/v2-([\d]+(?:-[\d]+)?)\.mjs/)?.[1] ?? '';
  // The age-word spans the shelf's two header eras: era 1 speaks
  // `v2.X.Y verification` (MBUMAH HARDWARE POS - ...), era 2 (v2.213.0
  // onward) speaks `the v2.X.Y release gate` — the file's OWN `v2.X.Y`
  // is the era-proof word both conventions carry.
  const ageWord = token ? `v2.${token.replace(/-(\d+)$/, '.$1')}` : null;
  if (ageWord && bytes.includes(ageWord)) shelfClean++;
  else shelfDecay.push(f);
}
console.log(`shelf: ${shelfClean}/${shelfFiles.length} attestations byte-census clean (scripts/release-attestations/)`);
if (shelfDecay.length) {
  console.error('— SHELF DECAY (an attestation lost its own word) —');
  for (const f of shelfDecay) console.error(`  ${f}`);
}
if (driftReport.length && !quiet) {
  console.log('— drift (each ancestor pins its own release) —');
  for (const d of driftReport) console.log(`  ${d}`);
}
if (signalReport.length) {
  console.error('— SIGNALS (need eyes) —');
  for (const s of signalReport) console.error(`  ${s}`);
}
if (signals > 0 || errors > 0 || shelfDecay.length > 0) process.exit(1);
if (strict && drift > 0) process.exit(1);
