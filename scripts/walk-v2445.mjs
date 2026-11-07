#!/usr/bin/env node
// walk-v2445.mjs — v2.445.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.445.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.444.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's fifty-sixth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (334/335/336/367 → 335/336/337/368) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.444.0') → toBe('2.445.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2445.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (records-lens-v2445.test.ts) pins only sealed bytes — the sort law's
// verbatim seat, the records voice, the handle's bytes, the doors riding
// — and no living toBe('2.444.0') literal anywhere in it (version prose
// lives in comments, not pins), so the web's blind split/join cannot
// re-key a word the next treadmill will own.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.445.0: the records lens — the census learns a second sort voice: the census door learned to open panes and this round it learns to reorder itself (the By Type table's Records header becomes a real button — one press re-sorts the census loudest-by-records, the desk moving the most DATA reads first, not just the desk running the most exports; press again and the run-count law returns); the second voice RIDES ABOVE THE LAW (the default .sort keeps its exact seat — the elders' pin survives verbatim — and the records sort is a new pass over the sorted rows, both voices breaking ties by the type's own name); the header is the handle (the hover affordance waits at opacity-0, the active voice reads foreground under a lit ChevronDown, aria-sort names the order, the thead sits OUTSIDE the door rows so no conjoin is even possible) — the cascade's fifty-sixth generation\n`;

if (src.includes("the cascade's fifty-sixth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's fifty-fifth generation")) {
  const anchorLine = src.indexOf('    // v2.444.0: the status door opens');
  if (anchorLine < 0) { console.error('FAIL: the v2.444.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.444.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.445.0 nor the v2.444.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(334)", "whatsNewUnreadCount('2.110.0')).toBe(335)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(335)", "whatsNewUnreadCount('2.109.0')).toBe(336)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(336)", "whatsNewUnreadCount('2.108.0')).toBe(337)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(367)", "whatsNewUnreadCount('2.77.0')).toBe(368)"],
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
  text = text.split("toBe('2.444.0')").join("toBe('2.445.0')");
  text = text.split('toContain("version: \'2.444.0\'")').join('toContain("version: \'2.445.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.444.0')").length - 1) + (before.split('toContain("version: \'2.444.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
