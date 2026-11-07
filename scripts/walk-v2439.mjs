#!/usr/bin/env node
// walk-v2439.mjs — v2.439.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.439.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.438.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's fiftieth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (328/329/330/361 → 329/330/331/362) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.438.0') → toBe('2.439.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2439.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (export-cancel-v2439.test.ts) pins only sealed bytes — the route's gate
// bytes, the table's zinc wardrobe, the fixture's tuples, the wire's
// union — and no living toBe('2.438.0') literal anywhere in it, so the
// web's blind split/join cannot re-key a word the next treadmill will own.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.439.0: the stuck row learns to bow out — the cancel door retires the waiting-room ghosts: a PENDING/PROCESSING row whose invocation died (serverless timeout, closed tab) used to wait forever (a spinner that never stops, a 409 for eternity, no word in the vocabulary for what happened), so POST /api/data-exports/[id]/cancel gives the stuck row its honest exit (only a stuck row passes — a finished row is never rewritten, the row STAYS wearing its note, the audit speaks DATA_EXPORT_CANCELLED), the vocabulary speaks every word it keeps (the zinc Cancelled badge with the Ban icon, the Cancelled chip joins the lens row, exp-status=cancelled joins the deep-link words, the cancel hand on exactly the waiting rows, the row dims to opacity-60 — the withdrawn read), the download route answers the cancelled face with its own 409 message between the FAILED gate and the expiry gate (the 410's order pin untouched), and the fixture world wears the face (one LOYALTY row cancelled by the owner — fifteen rows, the badge wearable on a fresh world — the cascade's fiftieth generation)\n`;

if (src.includes("the cascade's fiftieth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's forty-ninth generation")) {
  const anchorLine = src.indexOf('    // v2.438.0: the world learns to expire');
  if (anchorLine < 0) { console.error('FAIL: the v2.438.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.438.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.439.0 nor the v2.438.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(328)", "whatsNewUnreadCount('2.110.0')).toBe(329)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(329)", "whatsNewUnreadCount('2.109.0')).toBe(330)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(330)", "whatsNewUnreadCount('2.108.0')).toBe(331)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(361)", "whatsNewUnreadCount('2.77.0')).toBe(362)"],
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
  text = text.split("toBe('2.438.0')").join("toBe('2.439.0')");
  text = text.split('toContain("version: \'2.438.0\'")').join('toContain("version: \'2.439.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.438.0')").length - 1) + (before.split('toContain("version: \'2.438.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
