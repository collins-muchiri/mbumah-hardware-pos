#!/usr/bin/env node
// walk-v2428.mjs — v2.428.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.428.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.427.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's thirty-ninth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (317/318/319/350 → 318/319/320/351) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.427.0') → toBe('2.428.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2428.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.428.0: the toast points at the follow-up — the shortfall survives the close: the success toast grew the pointer's own second line (receiveShortfallPointer — the units still owed and where the follow-up waits, "N units still owed — the follow-up waits on the order's face", the honest gate reads zero, a negative, a NaN and an infinity as the null — a full receipt points nowhere, never a fake pointer), the plan rides the submit (the pens' truth at the press travels with the mutation, so the pointer speaks what WAS submitted, never a later render's guess; the gate reads the plan's own empty beside the payload's length — the two gates agree by the fill's law), and the pointer wears the follow-up door's own sky (the conditional description, the byte-identical family the maker chip and the drill's pill taught), and the new suite's 11 pins caught the honest silence before it ever shipped (the old bare toast byte retired — the entry joins the feed — +1 on every unread anchor, the cascade's thirty-ninth generation)\n`;

if (src.includes("the cascade's thirty-ninth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's thirty-eighth generation")) {
  const anchorLine = src.indexOf("    // v2.427.0: the shortfall's own door");
  if (anchorLine < 0) { console.error('FAIL: the v2.427.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.427.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.428.0 nor the v2.427.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(317)", "whatsNewUnreadCount('2.110.0')).toBe(318)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(318)", "whatsNewUnreadCount('2.109.0')).toBe(319)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(319)", "whatsNewUnreadCount('2.108.0')).toBe(320)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(350)", "whatsNewUnreadCount('2.77.0')).toBe(351)"],
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
  text = text.split("toBe('2.427.0')").join("toBe('2.428.0')");
  text = text.split('toContain("version: \'2.427.0\'")').join('toContain("version: \'2.428.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.427.0')").length - 1) + (before.split('toContain("version: \'2.427.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
