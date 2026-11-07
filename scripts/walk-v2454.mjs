#!/usr/bin/env node
// walk-v2454.mjs — v2.454.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.454.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.453.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's sixty-fifth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (343/344/345/376 → 344/345/346/377) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.453.0') → toBe('2.454.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2454.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (debt-voices-v2454.test.ts) pins only sealed bytes — the five scope
// disclosures (testids + the two voice words), the ledger's route source
// (the flat aggregate + the crisis summary's statuses), the KPI's fallback
// chain byte, the elder coercion reduces, the elder label bytes, the round's
// named comments and the hover coaches — and no living toBe('2.453.0')
// literal anywhere in it (version prose lives in comments, not pins). THE
// WORD-FREE LAW also holds (the executable self-audit assembles the census
// tokens from fragments, so the file never carries a forbidden literal).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.454.0: the debt voices reconcile — every figure names its source: the carried question from the reduce sweep ran its census and found the shell speaking \"Outstanding Debt\" through FIVE seats measuring TWO different ledgers — the LEDGER voice (DebtLedger.balance over the outstanding statuses OUTSTANDING/PARTIAL/OVERDUE, store-scoped, plan-tracked rows only) speaking at the dashboard KPI (the crisis summary's outstandingTotal falling back to the route's flat aggregate), the financial desk's card and the financial overview's card (both reading the dashboard wire's outstandingDebt field), and the MIRROR voice (Customer.currentDebtBalance over the customers wire, all-time) speaking at the customers desk's fifth card and the reports desk's analysis card; the two may disagree BY DESIGN and neither is wrong — the round taught every seat to say which voice it speaks (a small muted scope line under the figure, a testid apiece, and a hover coach telling which table the sum reads, which statuses count, and why the other voice may honestly disagree), the figures themselves untouched — the cascade's sixty-fifth generation\n`;

if (src.includes("the cascade's sixty-fifth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's sixty-fourth generation")) {
  const anchorLine = src.indexOf('    // v2.453.0: the reduce sweep');
  if (anchorLine < 0) { console.error('FAIL: the v2.453.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.453.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.454.0 nor the v2.453.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(343)", "whatsNewUnreadCount('2.110.0')).toBe(344)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(344)", "whatsNewUnreadCount('2.109.0')).toBe(345)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(345)", "whatsNewUnreadCount('2.108.0')).toBe(346)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(376)", "whatsNewUnreadCount('2.77.0')).toBe(377)"],
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
  text = text.split("toBe('2.453.0')").join("toBe('2.454.0')");
  text = text.split('toContain("version: \'2.453.0\'")').join('toContain("version: \'2.454.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.453.0')").length - 1) + (before.split('toContain("version: \'2.453.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
