#!/usr/bin/env node
// walk-v2437.mjs — v2.437.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.437.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.436.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's forty-eighth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (326/327/328/359 → 327/328/329/360) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.436.0') → toBe('2.437.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2437.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (fixture-door-v2437.test.ts) pins only sealed bytes — the package.json
// handle, the fixture scripts, the schema comment, the table's union —
// and no living toBe('2.436.0') literal anywhere in it, so the web's
// blind split/join cannot re-key a word the next treadmill will own.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.437.0: the taxman joins the door — one handle lights three fixture worlds: npm run db:fixtures grows its third face (the M-Pesa ledger's script leads, the exports world follows, the taxman's world closes the parade — six invoices speaking all five submission statuses, four audit rows for the submitted faces, eight tax filings across the four types and the schema-honest statuses, the sandbox profile — verified live on the current schema, idempotent), the exports world wears the schema's own default status (one PENDING history row — the one wire face the fixtures never spoke — the processing word's union answering it under processing and all, never stranded; the coherence law holds: a waiting row carries neither completion nor failure faces — the cascade's forty-eighth generation)\n`;

if (src.includes("the cascade's forty-eighth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's forty-seventh generation")) {
  const anchorLine = src.indexOf('    // v2.436.0: the fixture world speaks its whole vocabulary');
  if (anchorLine < 0) { console.error('FAIL: the v2.436.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.436.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.437.0 nor the v2.436.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(326)", "whatsNewUnreadCount('2.110.0')).toBe(327)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(327)", "whatsNewUnreadCount('2.109.0')).toBe(328)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(328)", "whatsNewUnreadCount('2.108.0')).toBe(329)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(359)", "whatsNewUnreadCount('2.77.0')).toBe(360)"],
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
  text = text.split("toBe('2.436.0')").join("toBe('2.437.0')");
  text = text.split('toContain("version: \'2.436.0\'")').join('toContain("version: \'2.437.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.436.0')").length - 1) + (before.split('toContain("version: \'2.436.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
