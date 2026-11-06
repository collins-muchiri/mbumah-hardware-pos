#!/usr/bin/env node
// walk-v2417.mjs — v2.417.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.417.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.416.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's twenty-eighth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (306/307/308/339 → 307/308/309/340) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.416.0') → toBe('2.417.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2417.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.417.0: the receive fills itself — the receive dialog stops being a bare wall of pens: the quick fills land (Fill all remaining tops every open pen up to its line's remaining units in one press — buildReceiveInitials, the REMAINING LAW's one home; Clear all empties them; each open row carries its own Fill pen), the short-receive face speaks (a line receiving more than 0 but less than its remaining wears the amber family — row, pen ring and the words 'short by N', one read receiveRowState painting and speaking together) and the receive-plan strip speaks the pass before the commit (describeReceivePlan counts over OPEN lines only — a finished order can never speak as partial; emerald when the order completes, amber when lines run short or stay untouched, muted before anything is set) (the entry joins the feed — +1 on every unread anchor, the cascade's twenty-eighth generation)\n`;

if (src.includes("the cascade's twenty-eighth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's twenty-seventh generation")) {
  const anchorLine = src.indexOf("    // v2.416.0: the order's handover");
  if (anchorLine < 0) { console.error('FAIL: the v2.416.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.416.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.417.0 nor the v2.416.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(306)", "whatsNewUnreadCount('2.110.0')).toBe(307)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(307)", "whatsNewUnreadCount('2.109.0')).toBe(308)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(308)", "whatsNewUnreadCount('2.108.0')).toBe(309)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(339)", "whatsNewUnreadCount('2.77.0')).toBe(340)"],
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
  text = text.split("toBe('2.416.0')").join("toBe('2.417.0')");
  text = text.split('toContain("version: \'2.416.0\'")').join('toContain("version: \'2.417.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.416.0')").length - 1) + (before.split('toContain("version: \'2.416.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
