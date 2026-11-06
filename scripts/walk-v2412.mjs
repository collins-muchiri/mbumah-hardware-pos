#!/usr/bin/env node
// walk-v2412.mjs — v2.412.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.412.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.411.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's twenty-third generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (301/302/303/334 → 302/303/304/335) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.411.0') → toBe('2.412.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2412.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.412.0: the census echoes — v2.411.0's maintenance voice reaches the door it named: the Exchange Rates admin card renders the same provenance census the top-bar dropdown shows (same wire — the shared ADMIN_CURRENCY_RATES_QUERY_KEY — and the same pure voices, rateCensus and wireAgeVoice), the card's own amber invitation names the action instead of the door (the admin is already standing on it — set one with the Set rate action), a maintained census silences both voices, the echo strip's tone follows its census scale-honest to a panel, the credits ledger's print handler speaks the row the desk actually hands it (CreditLedgerRow — the wire's credit widened by the running balance the memo computes), and the banking recon dialog loses its phantom approver line (dead UI reading a field the wire never carried — four strict-mode faces stand down, 291 → 287) (the entry joins the feed — +1 on every unread anchor, the cascade's twenty-third generation)\n`;

if (src.includes("the cascade's twenty-third generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's twenty-second generation")) {
  const anchorLine = src.indexOf("    // v2.411.0: the census speaks first");
  if (anchorLine < 0) { console.error('FAIL: the v2.411.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.411.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.412.0 nor the v2.411.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(301)", "whatsNewUnreadCount('2.110.0')).toBe(302)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(302)", "whatsNewUnreadCount('2.109.0')).toBe(303)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(303)", "whatsNewUnreadCount('2.108.0')).toBe(304)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(334)", "whatsNewUnreadCount('2.77.0')).toBe(335)"],
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
  text = text.split("toBe('2.411.0')").join("toBe('2.412.0')");
  text = text.split('toContain("version: \'2.411.0\'")').join('toContain("version: \'2.412.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.411.0')").length - 1) + (before.split('toContain("version: \'2.411.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
