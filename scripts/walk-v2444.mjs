#!/usr/bin/env node
// walk-v2444.mjs — v2.444.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.444.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.443.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's fifty-fifth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (333/334/335/366 → 334/335/336/367) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.443.0') → toBe('2.444.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2444.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (status-door-v2444.test.ts) pins only sealed bytes — the status door's
// button, the controlled-hand routing, the family seats, the honest
// zero — and no living toBe('2.443.0') literal anywhere in it (version
// prose lives in comments, not pins), so the web's blind split/join
// cannot re-key a word the next treadmill will own.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.444.0: the status door opens — the withdrawn badge lenses the cancelled: the census door's sibling (the withdrawn count was the one number on the By Type table that only counted) and this round its zinc badge becomes a real button whose press lands the history on the cancelled status lens through the controlled hand (chooseExpStatus, never a direct state write — press the pressed badge again and the lens releases); ONE FAMILY, THREE SEATS: the pressed wardrobe is the history chip's own zinc active bytes (bg-zinc-600 text-white border-zinc-600 — beside the history chip and the stats card), the keyboard answers natively (a real button needs no manual handler), the press stops propagation (the badge sits inside the type door's row — the two doors never conjoin a press), the honest zero stays a census (a zero-count door invites a pointless press), and the header note names both doors (press a row to lens the type · a withdrawn badge lenses the cancelled) — the cascade's fifty-fifth generation\n`;

if (src.includes("the cascade's fifty-fifth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's fifty-fourth generation")) {
  const anchorLine = src.indexOf('    // v2.443.0: the census becomes a door');
  if (anchorLine < 0) { console.error('FAIL: the v2.443.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.443.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.444.0 nor the v2.443.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(333)", "whatsNewUnreadCount('2.110.0')).toBe(334)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(334)", "whatsNewUnreadCount('2.109.0')).toBe(335)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(335)", "whatsNewUnreadCount('2.108.0')).toBe(336)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(366)", "whatsNewUnreadCount('2.77.0')).toBe(367)"],
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
  text = text.split("toBe('2.443.0')").join("toBe('2.444.0')");
  text = text.split('toContain("version: \'2.443.0\'")').join('toContain("version: \'2.444.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.443.0')").length - 1) + (before.split('toContain("version: \'2.443.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
