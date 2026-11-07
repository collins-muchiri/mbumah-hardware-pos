#!/usr/bin/env node
// walk-v2448.mjs — v2.448.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.448.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.447.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's fifty-ninth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (337/338/339/370 → 338/339/340/371) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.447.0') → toBe('2.448.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2448.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (records-voice-v2448.test.ts) pins only sealed bytes — the voice's new
// pass, the exclusion at both presses, the handle's bytes, the doors
// riding — and no living toBe('2.447.0') literal anywhere in it (version
// prose lives in comments, not pins), so the web's blind split/join
// cannot re-key a word the next treadmill owns.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.448.0: the history's records voice — the unordered wire learns to sort: the Created header gave the Export History its mirror and this round the Records header learns its own FIRST voice (one press sorts the history LOUDEST-BY-RECORDS — the run carrying the most data reads first — desc-first, the census's records-lens grammar ported across the tab line, the row's own id as the deterministic tiebreak, press again and the wire's newest-first law returns); the exclusion lives at the press (the records voice retires the Created mirror and the mirror retires the voice — no reconcile effect, the lint zero held) and both sorts ride above the lenses (the type and status chips' conjoin keeps its exact seat, the API's orderBy createdAt desc was never rewritten); the wardrobe rides this table's own light (the active voice is SEMIBOLD under a lit ChevronDown — the weight speaks where the census's color spoke) — the cascade's fifty-ninth generation\n`;

if (src.includes("the cascade's fifty-ninth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's fifty-eighth generation")) {
  const anchorLine = src.indexOf('    // v2.447.0: the history\'s mirror');
  if (anchorLine < 0) { console.error('FAIL: the v2.447.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.447.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.448.0 nor the v2.447.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(337)", "whatsNewUnreadCount('2.110.0')).toBe(338)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(338)", "whatsNewUnreadCount('2.109.0')).toBe(339)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(339)", "whatsNewUnreadCount('2.108.0')).toBe(340)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(370)", "whatsNewUnreadCount('2.77.0')).toBe(371)"],
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
  text = text.split("toBe('2.447.0')").join("toBe('2.448.0')");
  text = text.split('toContain("version: \'2.447.0\'")').join('toContain("version: \'2.448.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.447.0')").length - 1) + (before.split('toContain("version: \'2.447.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
