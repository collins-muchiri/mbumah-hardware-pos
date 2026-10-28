#!/usr/bin/env node
// treadmill-v2244.mjs — the v2.244.0 release's test-pin treadmill.
//
// THE SHAPE LAW (Task 215's Work Log, forked from treadmill-v2243.mjs):
// the ancestors' release-face pins evolve to the new truth, single-pass,
// src/tests ONLY (historical markers in src/ and scripts/ are
// birth-annotations, never touched):
//   1. THE COUNTER MAP — every `whatsNewUnreadCount('…')).toBe(N)` +1.
//   2. THE FACE MAP — every `toBe('2.243.0')` becomes `toBe('2.244.0')`.
//   3. THE FEED-PAIR MAP — head `version: '2.243.0',` → 2.244.0; second
//      member `version: '2.242.0',` → 2.243.0 (the `## [ … ]` section
//      brackets never match these maps).
// The HAND-PASS rides after (the round applies it, not the map):
//   - ancestor source-byte pins on files THIS round changed (the map's
//     closures moved to the lib; the wires grew the band fields; the
//     faces grew the chips) — vitest names them, the hand-pass re-points
//     only the pins whose TRUTH changed.
// Run: node scripts/treadmill-v2244.mjs   (idempotent).

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'src', 'tests');
const files = readdirSync(dir).filter((f) => f.endsWith('.test.ts'));

const report = [];
for (const f of files) {
  const p = join(dir, f);
  const before = readFileSync(p, 'utf8');
  let after = before;
  const counts = { counter: 0, face: 0, head: 0, pair: 0 };

  after = after.replace(/whatsNewUnreadCount\('(\d+\.\d+\.\d+)'\)\)\.toBe\((\d+)\)/g, (_m, v, n) => {
    counts.counter++;
    return `whatsNewUnreadCount('${v}')).toBe(${Number(n) + 1})`;
  });
  after = after.replace(/toBe\('2\.243\.0'\)/g, () => {
    counts.face++;
    return "toBe('2.244.0')";
  });
  after = after.replace(/version: '2\.243\.0',/g, () => {
    counts.head++;
    return "version: '2.244.0',";
  });
  after = after.replace(/version: '2\.242\.0',/g, () => {
    counts.pair++;
    return "version: '2.243.0',";
  });

  if (after !== before) {
    writeFileSync(p, after);
    report.push(`${f}: counter=${counts.counter} face=${counts.face} head=${counts.head} pair=${counts.pair}`);
  }
}

console.log(report.length ? report.join('\n') : 'no pins moved (already walked)');
const total = report.reduce((acc, line) => acc + Number(line.match(/counter=(\d+)/)?.[1] ?? 0) + Number(line.match(/face=(\d+)/)?.[1] ?? 0), 0);
console.log(`\n${report.length} files, ${total} pins moved`);
