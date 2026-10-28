#!/usr/bin/env node
// treadmill-v2249.mjs — the v2.249.0 round's test-pin treadmill.
//
// THE SHAPE LAW (forked from treadmill-v2248-1.mjs):
// the ancestors' release-face pins evolve to the new truth, single-pass,
// src/tests ONLY (historical markers in src/ and scripts/ are
// birth-annotations, never touched):
//   1. THE COUNTER MAP — every `whatsNewUnreadCount('…')).toBe(N)` +1.
//   2. THE FACE MAP — every `toBe('2.248.1')` becomes `toBe('2.249.0')`.
//   3. THE FEED-PAIR MAP — head `version: '2.248.1',` → 2.249.0; second
//      member `version: '2.248.0',` → 2.248.1 (the `## [ … ]` section
//      brackets never match these maps).
// THE EXCLUSION LAW (Task 225's lesson): the CURRENT round's own test
// file is excluded from ALL maps — its ordering pins read the new
// truth already, and the maps would rewrite them into nonsense.
// The HAND-PASS rides after (the round applies it, not the map):
//   - the birth's ledger is fully additive on the faces/wires, so NO
//     ancestor source-byte pin should move. The full vitest run
//     arbitrates; re-point anything that read a byte this round grew.
// Run: node scripts/treadmill-v2249.mjs   (idempotent).

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'src', 'tests');
const SELF = 'po-birth-ledger-v2249.test.ts';
const files = readdirSync(dir).filter((f) => f.endsWith('.test.ts') && f !== SELF);

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
  after = after.replace(/toBe\('2\.248\.1'\)/g, () => {
    counts.face++;
    return "toBe('2.249.0')";
  });
  after = after.replace(/version: '2\.248\.1',/g, () => {
    counts.head++;
    return "version: '2.249.0',";
  });
  after = after.replace(/version: '2\.248\.0',/g, () => {
    counts.pair++;
    return "version: '2.248.1',";
  });

  if (after !== before) {
    writeFileSync(p, after);
    report.push(`${f}: counter=${counts.counter} face=${counts.face} head=${counts.head} pair=${counts.pair}`);
  }
}

console.log(report.length ? report.join('\n') : 'no pins moved (already walked)');
const total = report.reduce((acc, line) => acc + Number(line.match(/counter=(\d+)/)?.[1] ?? 0) + Number(line.match(/face=(\d+)/)?.[1] ?? 0), 0);
console.log(`\n${report.length} files, ${total} pins moved`);
