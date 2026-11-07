#!/usr/bin/env node
// walk-v2453.mjs — v2.453.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.453.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.452.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's sixty-fourth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (342/343/344/375 → 343/344/345/376) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.452.0') → toBe('2.453.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2453.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (reduce-sweep-v2453.test.ts) pins only sealed bytes — the route's
// boundary coercions, the reports desk's live seat, the customers desk's
// fifth card, the aging buckets' safe shape, and the family's elder
// confession bytes — and no living toBe('2.452.0') literal anywhere in it
// (version prose lives in comments, not pins). THE WORD-FREE LAW also
// holds (no deep-link vocabulary word appears in it).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.453.0: the reduce sweep — the customers wire learns its numbers: the sweep the v2.452.0 confession promised ran grep across every desk's summing seat and found the customers wire feeding its sums raw Prisma Decimals — the contract declared number, the spread delivered Decimal-as-string, and the reports desk's customer-analysis card read the lie LIVE (three real debts of 3500, 1200 and 0 glued into \"035001200\" — Ksh 35,001,200.00 for Ksh 4,700.00 of real debt, the same lie class the invoices stats confessed one tab line over) while the customers desk carried the same shape LATENT (a sum the underscore kept silent); the fix is three seats deep — the wire's honest boundary (the list route coerces currentDebtBalance and debtLimit to numbers after the spread, so every future consumer is born honest — the v2.450.0 comparator fix told the truth at its seat while the wire kept lying underneath), the live seat's own Number() (defense in depth, the invoices-stats law, its figure wearing tabular digits), and the latent seat LIT (the customers desk's fifth stat card — the desk finally speaks its own debt total in the risk family's rose-to-red gradient); the aging buckets were honest by arithmetic accident (subtraction coerces) and every other desk's summing seat passed the same audit (kpi-doors, branch-doors, desk-doors, kpi-row, payroll, restock, checkout, stock-take, sheet-drill, plans, reports' other eight seats) — the cascade's sixty-fourth generation\n`;

if (src.includes("the cascade's sixty-fourth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's sixty-third generation")) {
  const anchorLine = src.indexOf('    // v2.452.0: the fixture world learns to bill');
  if (anchorLine < 0) { console.error('FAIL: the v2.452.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.452.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.453.0 nor the v2.452.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(342)", "whatsNewUnreadCount('2.110.0')).toBe(343)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(343)", "whatsNewUnreadCount('2.109.0')).toBe(344)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(344)", "whatsNewUnreadCount('2.108.0')).toBe(345)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(375)", "whatsNewUnreadCount('2.77.0')).toBe(376)"],
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
  text = text.split("toBe('2.452.0')").join("toBe('2.453.0')");
  text = text.split('toContain("version: \'2.452.0\'")').join('toContain("version: \'2.453.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.452.0')").length - 1) + (before.split('toContain("version: \'2.452.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
