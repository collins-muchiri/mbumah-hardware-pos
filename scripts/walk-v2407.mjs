#!/usr/bin/env node
// walk-v2407.mjs — v2.407.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.407.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.406.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's eighteenth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (296/297/298/329 → 297/298/299/330) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.406.0') → toBe('2.407.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2407.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.407.0: the ghost routes wake — the two routes born against columns the schema never carried answer real rows at last (notifications/settings folds the user's EMAIL preference rows into the four toggles — ALL the master, RECEIPT, LOW_STOCK, DAILY_REPORT; settings/currency keeps the branch default on the SystemConfig shelf beside the VAT rate, KES with isDefault when never chosen), the phantom User/Store columns and their twelve strict-mode faces stand down (355 → 343), the Profile dialog's Preferences tab grows the email card (the master dims and disables the three categories while off, Save PATCHes only the fields that moved), and the console footer's plain open clears the jump door itself (the entry joins the feed — +1 on every unread anchor, the cascade's eighteenth generation)\n`;

if (src.includes("the cascade's eighteenth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes('// v2.406.0:')) {
  const anchorLine = src.indexOf('    // v2.406.0:');
  if (anchorLine < 0) { console.error('FAIL: the v2.406.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.406.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.407.0 nor the v2.406.0 history line found');
  process.exit(1);
}

writeFileSync(path, src);
console.log(`\n${writes} replacement(s) written.`);

const listTests = (dir) => {
  const acc = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) acc.push(...listTests(p));
    else if (/\.test\.ts$/.test(e.name)) acc.push(p);
  }
  return acc;
};

// ── the count web ────────────────────────────────────────────────────────
const COUNT_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(296)", "whatsNewUnreadCount('2.110.0')).toBe(297)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(297)", "whatsNewUnreadCount('2.109.0')).toBe(298)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(298)", "whatsNewUnreadCount('2.108.0')).toBe(299)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(329)", "whatsNewUnreadCount('2.77.0')).toBe(330)"],
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
  text = text.split("toBe('2.406.0')").join("toBe('2.407.0')");
  text = text.split('toContain("version: \'2.406.0\'")').join('toContain("version: \'2.407.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.406.0')").length - 1) + (before.split('toContain("version: \'2.406.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
