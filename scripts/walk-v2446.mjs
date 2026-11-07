#!/usr/bin/env node
// walk-v2446.mjs — v2.446.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.446.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.445.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's fifty-seventh generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (335/336/337/368 → 336/337/338/369) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.445.0') → toBe('2.446.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2446.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (runs-mirror-v2446.test.ts) pins only sealed bytes — the law's verbatim
// seat, the records voice, the mirror's inversion, the handles' bytes,
// the exclusive-voices effect — and no living toBe('2.445.0') literal
// anywhere in it (version prose lives in comments, not pins), so the
// web's blind split/join cannot re-key a word the next treadmill owns.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.446.0: the runs mirror — the law's own header answers: the records lens gave the census a second sort voice and this round the law's own header answers with its mirror (the By Type table's Runs header becomes a real button — one press INVERTS the run-count law, the QUIETEST desk reads first with the same name tiebreak, press again and the law returns); the third voice rides above the law like its sibling (a new sort pass over the already-lawful rows — the law's bytes and the records voice keep their exact seats) and the voices are EXCLUSIVE (the most recent press names the order — the mirror's press retires the records lens, the lens's own press bytes stay verbatim for the elders' pin, and the reconcile effect retires the mirror when the lens lands) — the cascade's fifty-seventh generation\n`;

if (src.includes("the cascade's fifty-seventh generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's fifty-sixth generation")) {
  const anchorLine = src.indexOf('    // v2.445.0: the records lens');
  if (anchorLine < 0) { console.error('FAIL: the v2.445.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.445.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.446.0 nor the v2.445.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(335)", "whatsNewUnreadCount('2.110.0')).toBe(336)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(336)", "whatsNewUnreadCount('2.109.0')).toBe(337)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(337)", "whatsNewUnreadCount('2.108.0')).toBe(338)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(368)", "whatsNewUnreadCount('2.77.0')).toBe(369)"],
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
  text = text.split("toBe('2.445.0')").join("toBe('2.446.0')");
  text = text.split('toContain("version: \'2.445.0\'")').join('toContain("version: \'2.446.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.445.0')").length - 1) + (before.split('toContain("version: \'2.445.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
