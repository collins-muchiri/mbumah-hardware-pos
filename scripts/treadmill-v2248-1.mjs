#!/usr/bin/env node
// treadmill-v2248-1.mjs — the v2.248.1 patch's test-pin treadmill.
//
// THE SHAPE LAW (Task 225's Work Log, forked from treadmill-v2247.mjs):
// the ancestors' release-face pins evolve to the new truth, single-pass,
// src/tests ONLY (historical markers in src/ and scripts/ are
// birth-annotations, never touched):
//   1. THE COUNTER MAP — every `whatsNewUnreadCount('…')).toBe(N)` +1.
//   2. THE FACE MAP — every `toBe('2.248.0')` becomes `toBe('2.248.1')`.
//   3. THE FEED-PAIR MAP — head `version: '2.248.0',` → 2.248.1; second
//      member `version: '2.247.0',` → 2.248.0 (the `## [ … ]` section
//      brackets never match these maps).
// The HAND-PASS rides after (the round applies it, not the map):
//   - the door's answer is fully additive on the faces/wires, BUT the
//     v2.245 pick-strip findings title pin (stock-take-panel) moved its
//     byte this round (the law-naming ride-along) and the census row's
//     title grew — the full vitest run arbitrates; re-point any ancestor
//     pin that read the OLD titles.
// Run: node scripts/treadmill-v2248-1.mjs   (idempotent).

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
  after = after.replace(/toBe\('2\.248\.0'\)/g, () => {
    counts.face++;
    return "toBe('2.248.1')";
  });
  after = after.replace(/version: '2\.248\.0',/g, () => {
    counts.head++;
    return "version: '2.248.1',";
  });
  after = after.replace(/version: '2\.247\.0',/g, () => {
    counts.pair++;
    return "version: '2.248.0',";
  });

  if (after !== before) {
    writeFileSync(p, after);
    report.push(`${f}: counter=${counts.counter} face=${counts.face} head=${counts.head} pair=${counts.pair}`);
  }
}

console.log(report.length ? report.join('\n') : 'no pins moved (already walked)');
const total = report.reduce((acc, line) => acc + Number(line.match(/counter=(\d+)/)?.[1] ?? 0) + Number(line.match(/face=(\d+)/)?.[1] ?? 0), 0);
console.log(`\n${report.length} files, ${total} pins moved`);
