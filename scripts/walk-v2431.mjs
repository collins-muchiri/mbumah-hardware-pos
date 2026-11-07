#!/usr/bin/env node
// walk-v2431.mjs — v2.431.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.431.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.430.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's forty-second generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (320/321/322/353 → 321/322/323/354) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.430.0') → toBe('2.431.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2431.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.431.0: the desk answers the walk — the pocket's echo wears the walk's name: the carriage strip on the purchase order desk now answers the block-walk's receipt (orderHandoffPocketEcho — the strip's gate over the pocket's own word: the envelope's every-line-agrees maker read once as the map lands; agreement is no news — the pre-pick speaking the same name quiets the echo, never a repeated chip; a null, an empty, or a whitespace pocket reads the null, and the spoken name is the census's trimmed form), the amber chip rides the strip's header ("the walk named {maker}" — the walk's own house, never the pre-pick's sky) with the echo line's quote-border under the counts (the walk's words are a quotation, not the desk's own voice), the digest carries the pocket census beside the counts so the echo survives the one-way consumption exactly as the lines and units do, and the WORDS-ONLY law holds at the pen (the v2.422 derivation byte-identical — the shelf's live link or the actor's own call stays the only voice the supplier select wears), and the new suite's 13 pins caught the honest absences before they ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's forty-second generation)\n`;

if (src.includes("the cascade's forty-second generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's forty-first generation")) {
  const anchorLine = src.indexOf('    // v2.430.0: the census opens');
  if (anchorLine < 0) { console.error('FAIL: the v2.430.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.430.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.431.0 nor the v2.430.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(320)", "whatsNewUnreadCount('2.110.0')).toBe(321)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(321)", "whatsNewUnreadCount('2.109.0')).toBe(322)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(322)", "whatsNewUnreadCount('2.108.0')).toBe(323)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(353)", "whatsNewUnreadCount('2.77.0')).toBe(354)"],
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
  text = text.split("toBe('2.430.0')").join("toBe('2.431.0')");
  text = text.split('toContain("version: \'2.430.0\'")').join('toContain("version: \'2.431.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.430.0')").length - 1) + (before.split('toContain("version: \'2.430.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
