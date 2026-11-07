#!/usr/bin/env node
// walk-v2432.mjs — v2.432.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.432.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.431.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's forty-third generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (321/322/323/354 → 322/323/324/355) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.431.0') → toBe('2.432.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2432.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.432.0: the door remembers its send — the block menu wears the session's own memory: the inventory banner's census door grew the SENDING side's own session memory (orderBlockSendWord — the block's send word, pure: a null, a broken stamp, or no send this session reads the null, the honest absence; the viewer's own clock, zero-padded, exactly one colon — the census's own brevity), the record is component state never persisted (a reload honestly forgets — a menu claiming yesterday's sends would be a lie), the LAST send wins as the record overwrites, and the word is a FACT never a gate (the v2.430 census row byte-kept under the two-row item, the clock glyph's muted quiet, the block stays pressable — resending a maker updates the word the menu speaks), and the new suite's 12 pins caught the honest absences before they ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's forty-third generation)\n`;

if (src.includes("the cascade's forty-third generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's forty-second generation")) {
  const anchorLine = src.indexOf('    // v2.431.0: the desk answers the walk');
  if (anchorLine < 0) { console.error('FAIL: the v2.431.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.431.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.432.0 nor the v2.431.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(321)", "whatsNewUnreadCount('2.110.0')).toBe(322)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(322)", "whatsNewUnreadCount('2.109.0')).toBe(323)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(323)", "whatsNewUnreadCount('2.108.0')).toBe(324)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(354)", "whatsNewUnreadCount('2.77.0')).toBe(355)"],
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
  text = text.split("toBe('2.431.0')").join("toBe('2.432.0')");
  text = text.split('toContain("version: \'2.431.0\'")').join('toContain("version: \'2.432.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.431.0')").length - 1) + (before.split('toContain("version: \'2.431.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
