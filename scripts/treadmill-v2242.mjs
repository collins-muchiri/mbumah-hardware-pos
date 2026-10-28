#!/usr/bin/env node
// treadmill-v2242.mjs — the v2.242.0 release's test-pin treadmill.
//
// THE SHAPE LAW (Task 215's Work Log, honored every round since): when a
// release lands, the ancestors' release-face pins evolve to the new
// truth — the faces track the CURRENT version (a pin that said yesterday
// is a lie tomorrow). This script single-passes the three uniform maps
// across src/tests ONLY (the historical markers in src/ and scripts/
// are birth-annotations, never touched):
//
//   1. THE COUNTER MAP — every `whatsNewUnreadCount('…')).toBe(N);`
//      rides +1 (one new release = every unread count below the head
//      grows by exactly one; the nested meta-pin copies ride the same
//      pass because they are the same literal).
//   2. THE FACE MAP — every `toBe('2.241.0')` becomes `toBe('2.242.0')`
//      (the three package slots + the VERSION read, direct pins and the
//      meta-pins' quoted copies alike).
//   3. THE FEED-PAIR MAP — the feed's head string `version: '2.241.0',`
//      becomes the new head `version: '2.242.0',`, and the ordering's
//      second member `version: '2.240.0',` becomes `version: '2.241.0',`
//      (each release's own section brackets stay byte-identical — the
//      `## [ … ]` strings never match these maps).
//
// The HAND-PASS (this round's documented per-anchor care) rides after:
//   - ancestor source-byte pins on CHANGED files (walk-census-v2238's
//     create-wire data line) — applied by the round, not the map.
// Run: node scripts/treadmill-v2242.mjs   (idempotent: second run is a
// no-op — the maps match nothing after the first pass).

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

  // 1. the counter map — +1 per occurrence, single pass
  after = after.replace(/whatsNewUnreadCount\('(\d+\.\d+\.\d+)'\)\)\.toBe\((\d+)\)/g, (_m, v, n) => {
    counts.counter++;
    return `whatsNewUnreadCount('${v}')).toBe(${Number(n) + 1})`;
  });

  // 2. the face map — the current-version faces
  after = after.replace(/toBe\('2\.241\.0'\)/g, () => {
    counts.face++;
    return "toBe('2.242.0')";
  });

  // 3. the feed-pair map — the head rises, the second member follows
  after = after.replace(/version: '2\.241\.0',/g, () => {
    counts.head++;
    return "version: '2.242.0',";
  });
  after = after.replace(/version: '2\.240\.0',/g, () => {
    counts.pair++;
    return "version: '2.241.0',";
  });

  if (after !== before) {
    writeFileSync(p, after);
    report.push(`${f}: counter=${counts.counter} face=${counts.face} head=${counts.head} pair=${counts.pair}`);
  }
}

console.log(report.length ? report.join('\n') : 'no pins moved (already walked)');
const total = report.reduce((acc, line) => acc + Number(line.match(/counter=(\d+)/)?.[1] ?? 0) + Number(line.match(/face=(\d+)/)?.[1] ?? 0), 0);
console.log(`\n${report.length} files, ${total} pins moved`);
