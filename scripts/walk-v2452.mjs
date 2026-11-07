#!/usr/bin/env node
// walk-v2452.mjs — v2.452.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.452.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.451.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's sixty-third generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (341/342/343/374 → 342/343/344/375) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.451.0') → toBe('2.452.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2452.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (invoice-world-v2452.test.ts) pins only sealed bytes — the seed script's
// witnesses, the money bait's computed totals, the wiring, the watcher's
// mend bytes, the tabular seat — and no living toBe('2.451.0') literal
// anywhere in it (version prose lives in comments, not pins). THE
// WORD-FREE LAW also holds (no deep-link vocabulary word appears in it).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.452.0: the fixture world learns to bill — the invoice register gets its witnesses: the invoices desk answered every QA burst honestly empty (the other three fixture worlds never wrote an Invoice row — the v2.451.0 carry), so db:fixtures now stands up FOUR worlds through the one door and the register gets its ELEVEN WITNESSES — every document type wears a row (INVOICE, QUOTATION, PROFORMA, CREDIT_NOTE, DEBIT_NOTE) and the register's statuses wear rows too (PAID, SENT, DRAFT, CANCELLED, INVOICED — EXPIRED rides the quotation, where the lazy expiry law writes it); the money bait is set (the six register totals are distinct AND lexicographic ≠ numeric — 725.75 first numerically, \"9500\" last lexicographically — so the walk that catches a string/string comparator is one press away and the v2.451.0 coercion seat keeps its LIVE proof forever); the lazy-expiry law is spoken by the seeds, not fought (living quotations carry FUTURE due dates, one past-due quotation already wears EXPIRED); the watcher learned to COUNT THE RUNS, NOT JUST THE PENDING (the green verdict requires the known total, eleven faces, AND zero pending — a half-born CI is named, tolerated, then refused, never green); and the register's money column wears tabular digits; and the witnesses' first boot exposed the stats row's own concat lie (the reduce seeds 0 and the wire delivers Decimal-as-string, so 0 + \"9500\" grew into \"0950012000045000\" — the outstanding card read Ksh 950,012,000,045,000.00 for a Ksh 174,500 register) and the stats reduces coerce now — the cascade's sixty-third generation\n`;

if (src.includes("the cascade's sixty-third generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's sixty-second generation")) {
  const anchorLine = src.indexOf('    // v2.451.0: the money-sort sweep');
  if (anchorLine < 0) { console.error('FAIL: the v2.451.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.451.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.452.0 nor the v2.451.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(341)", "whatsNewUnreadCount('2.110.0')).toBe(342)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(342)", "whatsNewUnreadCount('2.109.0')).toBe(343)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(343)", "whatsNewUnreadCount('2.108.0')).toBe(344)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(374)", "whatsNewUnreadCount('2.77.0')).toBe(375)"],
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
  text = text.split("toBe('2.451.0')").join("toBe('2.452.0')");
  text = text.split('toContain("version: \'2.451.0\'")').join('toContain("version: \'2.452.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.451.0')").length - 1) + (before.split('toContain("version: \'2.451.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
