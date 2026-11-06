#!/usr/bin/env node
// walk-v2426.mjs — v2.426.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.426.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.425.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's thirty-seventh generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (315/316/317/348 → 316/317/318/349) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.425.0') → toBe('2.426.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2426.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.426.0: the receipt names its maker — the receive face learns the supplier's day: the receive dialog grew the maker chip (receive-supplier-chip — the sky census family the rows taught, the Truck icon, "via {name}" — conditional: a wire without the maker stays silent, never a fake via) and the call door (receive-supplier-call — the tel: door gated on the maker's own phone, the day's contact speaking through the title), the toast names the day (receiveSuccessVoice's two faces — "Items received and stock updated — {maker}'s goods are on the shelf", the old byte when the read found nothing), the day's honest read lives in the receive's one home (receiveMaker — a trimmed non-empty name makes the maker, the whitespace and non-string arrivals read the absence), and THE DOM'S LAW healed the div-in-p hydration wound the opening burst caught on the detail's own description (the faces stay phrasing content now), and the new suite's 15 pins caught the whitespace leak before it ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's thirty-seventh generation)\n`;

if (src.includes("the cascade's thirty-seventh generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's thirty-sixth generation")) {
  const anchorLine = src.indexOf("    // v2.425.0: the carried row knows its maker");
  if (anchorLine < 0) { console.error('FAIL: the v2.425.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.425.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.426.0 nor the v2.425.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(315)", "whatsNewUnreadCount('2.110.0')).toBe(316)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(316)", "whatsNewUnreadCount('2.109.0')).toBe(317)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(317)", "whatsNewUnreadCount('2.108.0')).toBe(318)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(348)", "whatsNewUnreadCount('2.77.0')).toBe(349)"],
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
  text = text.split("toBe('2.425.0')").join("toBe('2.426.0')");
  text = text.split('toContain("version: \'2.425.0\'")').join('toContain("version: \'2.426.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.425.0')").length - 1) + (before.split('toContain("version: \'2.425.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
