#!/usr/bin/env node
// walk-v2420.mjs — v2.420.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.420.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.419.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's thirty-first generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (309/310/311/342 → 310/311/312/343) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.419.0') → toBe('2.420.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2420.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.420.0: the shelf remembers its supplier — the inventory desk answers 'who provides this?': the Product schema grows its own nullable supplierId (the honest absence, no backfill required and no row lies, the FK to suppliers ON DELETE SET NULL, the lens's own index), the ONE arithmetic home (buildSupplierGroups) groups the shelf by supplier with the Decimal grace carried (string arrivals read honest numbers — never a concat), the inventory desk wears the sky lens strip (every supplier a card — products, units, shelf value; one press filters the roster; the 'No supplier yet' card is a REAL group for the unassigned, never hidden and never guessed a name; the census chip speaks 'N suppliers · M products placed · K waiting'), named rows carry the quiet 'via Supplier' sub-line (the absence stays silent there), both form faces grow the supplier select behind the wires' SAME-STORE DOOR (a cross-store assignment is refused, never guessed; '' clears honestly), the suppliers desk answers with its Products chip (sky when placed, honest at zero) and its CSV column, and the seed's idempotent pass names the real-world makers (the entry joins the feed — +1 on every unread anchor, the cascade's thirty-first generation)\n`;

if (src.includes("the cascade's thirty-first generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's thirtieth generation")) {
  const anchorLine = src.indexOf('    // v2.419.0: the drill wears the receive');
  if (anchorLine < 0) { console.error('FAIL: the v2.419.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.419.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.420.0 nor the v2.419.0 history line found');
  process.exit(1);
}

writeFileSync(path, src);
console.log(`\n${writes} replacement(s) written.`);

const listTests = (dir) => {
  const acc = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) acc.push(...listTests(join(dir, e.name)));
    else if (/\.test\.ts$/.test(e.name)) acc.push(join(dir, e.name));
  }
  return acc;
};

// ── the count web ────────────────────────────────────────────────────────
const COUNT_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(309)", "whatsNewUnreadCount('2.110.0')).toBe(310)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(310)", "whatsNewUnreadCount('2.109.0')).toBe(311)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(311)", "whatsNewUnreadCount('2.108.0')).toBe(312)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(342)", "whatsNewUnreadCount('2.77.0')).toBe(343)"],
];
let cFiles = 0, cEdits = 0;
for (const file of listTests('src/tests')) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  for (const [from, to] of COUNT_FROM) text = text.split(from).join(to);
  if (text !== before) {
    writeFileSync(file, text);
    cFiles++;
    cEdits += COUNT_FROM.reduce((n, [from]) => n + (before.split(from).length - 1), 0);
  }
}
console.log(`count web: ${cEdits} anchor edit(s) across ${cFiles} file(s).`);

// ── the version web ──────────────────────────────────────────────────────
let vFiles = 0, vEdits = 0;
for (const file of listTests('src/tests')) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  text = text.split("toBe('2.419.0')").join("toBe('2.420.0')");
  text = text.split('toContain("version: \'2.419.0\'")').join('toContain("version: \'2.420.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.419.0')").length - 1) + (before.split('toContain("version: \'2.419.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
