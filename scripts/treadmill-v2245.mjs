#!/usr/bin/env node
// treadmill-v2245.mjs — the v2.245.0 release's test-pin treadmill.
//
// THE SHAPE LAW (Task 215's Work Log, forked from treadmill-v2244.mjs):
// the ancestors' release-face pins evolve to the new truth, single-pass,
// src/tests ONLY (historical markers in src/ and scripts/ are
// birth-annotations, never touched):
//   1. THE COUNTER MAP — every `whatsNewUnreadCount('…')).toBe(N)` +1.
//   2. THE FACE MAP — every `toBe('2.244.0')` becomes `toBe('2.245.0')`.
//   3. THE FEED-PAIR MAP — head `version: '2.244.0',` → 2.245.0; second
//      member `version: '2.243.0',` → 2.244.0 (the `## [ … ]` section
//      brackets never match these maps).
// The HAND-PASS rides after (the round applies it, not the map):
//   - teeth-v2236's beyond-voice pin (the hardcoded "30 days" was the
//     bug this round fixed) — re-pointed at the wire's own window.
// Run: node scripts/treadmill-v2245.mjs   (idempotent).

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
  after = after.replace(/toBe\('2\.244\.0'\)/g, () => {
    counts.face++;
    return "toBe('2.245.0')";
  });
  after = after.replace(/version: '2\.244\.0',/g, () => {
    counts.head++;
    return "version: '2.245.0',";
  });
  after = after.replace(/version: '2\.243\.0',/g, () => {
    counts.pair++;
    return "version: '2.244.0',";
  });

  if (after !== before) {
    writeFileSync(p, after);
    report.push(`${f}: counter=${counts.counter} face=${counts.face} head=${counts.head} pair=${counts.pair}`);
  }
}

console.log(report.length ? report.join('\n') : 'no pins moved (already walked)');
const total = report.reduce((acc, line) => acc + Number(line.match(/counter=(\d+)/)?.[1] ?? 0) + Number(line.match(/face=(\d+)/)?.[1] ?? 0), 0);
console.log(`\n${report.length} files, ${total} pins moved`);
