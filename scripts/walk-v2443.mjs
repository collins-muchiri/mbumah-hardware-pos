#!/usr/bin/env node
// walk-v2443.mjs — v2.443.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.443.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.442.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's fifty-fourth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (332/333/334/365 → 333/334/335/366) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.442.0') → toBe('2.443.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2443.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (census-door-v2443.test.ts) pins only sealed bytes — the translation
// law, the door's seats, the controlled-hand routing, the honest titles —
// and no living toBe('2.442.0') literal anywhere in it (version prose
// lives in comments, not pins), so the web's blind split/join cannot
// re-key a word the next treadmill will own.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.443.0: the census becomes a door — the By Type rows lens the history: the By Type table landed last release as a census (a face that only counted) and this round its rows press through to the history's own lens (the door the deep-link desks already know, opened from the census side); a row whose wire type owns a lens word lands the history pre-filtered through the controlled hand (chooseExpType, never a direct state write — press the seat again and the lens releases), the translation lives in the ONE home (expTypeWordFor in tab-url.ts — the wire's UPPERCASE to the lens's kebab, and the NEUTRAL IS NOT A WORD: wire ALL answers null with the off-union rows, a door that filters to all being a no-op masquerading as a door); the active row wears the desk's emerald seat in both states (light 50/70, dark 500/10) with aria-current and the lens icon lit, the idle doors wear the hover/focus-visible seat, the keyboard answers Enter and Space, and the header note names the door (press a row to lens the history) — the cascade's fifty-fourth generation\n`;

if (src.includes("the cascade's fifty-fourth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's fifty-third generation")) {
  const anchorLine = src.indexOf('    // v2.442.0: the trends find their dark voice');
  if (anchorLine < 0) { console.error('FAIL: the v2.442.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.442.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.443.0 nor the v2.442.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(332)", "whatsNewUnreadCount('2.110.0')).toBe(333)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(333)", "whatsNewUnreadCount('2.109.0')).toBe(334)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(334)", "whatsNewUnreadCount('2.108.0')).toBe(335)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(365)", "whatsNewUnreadCount('2.77.0')).toBe(366)"],
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
  text = text.split("toBe('2.442.0')").join("toBe('2.443.0')");
  text = text.split('toContain("version: \'2.442.0\'")').join('toContain("version: \'2.443.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.442.0')").length - 1) + (before.split('toContain("version: \'2.442.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
