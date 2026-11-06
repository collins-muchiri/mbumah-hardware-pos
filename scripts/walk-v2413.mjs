#!/usr/bin/env node
// walk-v2413.mjs — v2.413.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.413.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.412.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's twenty-fourth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (302/303/304/335 → 303/304/305/336) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.412.0') → toBe('2.413.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2413.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.413.0: the census rides the org desk — v2.412.0's admin-card echo reaches the desk that reads but cannot write: the Organization Console renders the same provenance census under its header row (N admin-set · N API · N built-in beside the fresh/aging/stale age dot) spoken WITHOUT opening the currency menu — one shared cache, the observer law (enabled:false, the switcher's mount fetch fills it, the strip never fetches), the quiet neutral surface kept because the amber invitation is the ACTOR's voice and the org reader is not the actor (the switcher's own footer still names the door), and the password-rotation guard's request type shrinks to what it actually reads ({ url: string } — a real NextRequest satisfies it structurally, and so does the tests' honest fake — six strict-mode faces stand down, 287 → 281) (the entry joins the feed — +1 on every unread anchor, the cascade's twenty-fourth generation)\n`;

if (src.includes("the cascade's twenty-fourth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's twenty-third generation")) {
  const anchorLine = src.indexOf("    // v2.412.0: the census echoes");
  if (anchorLine < 0) { console.error('FAIL: the v2.412.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.412.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.413.0 nor the v2.412.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(302)", "whatsNewUnreadCount('2.110.0')).toBe(303)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(303)", "whatsNewUnreadCount('2.109.0')).toBe(304)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(304)", "whatsNewUnreadCount('2.108.0')).toBe(305)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(335)", "whatsNewUnreadCount('2.77.0')).toBe(336)"],
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
  text = text.split("toBe('2.412.0')").join("toBe('2.413.0')");
  text = text.split('toContain("version: \'2.412.0\'")').join('toContain("version: \'2.413.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.412.0')").length - 1) + (before.split('toContain("version: \'2.412.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
