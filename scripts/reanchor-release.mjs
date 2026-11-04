#!/usr/bin/env node
// reanchor-release.mjs — THE PARAMETERIZED RELEASE-SLOT RE-ANCHOR (the
// pin unwind's second retire). Every test that pins the CURRENT release
// slots (the three package.json faces, the VERSION file read, the feed's
// lead, the mark-all target) and every string pin of those same bytes
// carries a `toBe('<version>')` literal. The old version is DERIVED: the
// CHANGELOG's SECOND header (the newest release is the first; the slots
// being replaced speak the second). The new version is DERIVED: the
// VERSION file. No argv, no hand-editing. IDEMPOTENT: when VERSION
// already speaks the derived-prev (nothing to do) the script answers
// zero changes; guarded against torn trees (both generations present in
// the same file is legal only across DIFFERENT assertions — the slot
// census counts literals, and a file holding prev after the run means
// the run missed it).
// THE OD LAW: bytes, not memory.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const version = readFileSync('VERSION', 'utf8').trim();
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`x REFUSE: VERSION does not speak X.Y.Z ("${version}")`);
  process.exit(1);
}
const changelog = readFileSync('CHANGELOG.md', 'utf8');
const headers = [...changelog.matchAll(/^## \[(\d+\.\d+\.\d+)\]/gm)].map((m) => m[1]);
if (headers.length < 2) {
  console.error('x REFUSE: the CHANGELOG carries fewer than two release headers');
  process.exit(1);
}
const [lead, prev] = headers;
if (lead !== version) {
  console.error(`x REFUSE: the CHANGELOG's lead [${lead}] !== VERSION ${version} — bump the slots first`);
  process.exit(1);
}
if (prev === version) {
  console.log(`nothing to do: the slots already speak ${version} (idempotent)`);
  process.exit(0);
}

const files = readdirSync('src/tests')
  .filter((f) => f.endsWith('.test.ts'))
  .map((f) => join('src/tests', f));

const OLD = `toBe('${prev}')`;
const NEW = `toBe('${version}')`;

let touched = 0, literals = 0, missed = [];
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const n = src.split(OLD).length - 1;
  if (n > 0) {
    writeFileSync(f, src.split(OLD).join(NEW));
    touched++; literals += n;
  } else if (src.includes(`toBe('${version}')`) === false && src.includes(prev)) {
    // a file that speaks the old version in OTHER assert forms — report,
    // never block (title pins and order pins are hand-adjudicated).
    missed.push(f);
  }
}
console.log(`re-anchor: ${literals} slot literals set to ${version} across ${touched} files (prev ${prev} derived from the CHANGELOG's second header)`);
if (missed.length > 0) {
  console.log('review (non-slot pins of the old version):');
  for (const f of missed) console.log(`  ${f}`);
}
