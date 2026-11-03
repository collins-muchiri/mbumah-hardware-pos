#!/usr/bin/env node
// verify-v2-374-0.mjs — the round's FEATURE gate (v2.374.0 "the paper
// follows the settle"). The release MECHANICS live in verify-current.mjs.
// This script pins only what is NEW this round: the status-repair path
// (mode REPAIRED — the badge catches up, no money moves), the receipt hop
// (money moved → paper follows), the chain-total alignment (the desk and
// the money read the SAME law), and the muted repair affordance.
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const SERVICE = read('src/lib/sale-refund-service.ts');
const DESK = read('src/app/(shell)/tabs/transactions-tab.tsx');
const LIST = read('src/app/api/transactions/route.ts');
const HEAL_ROUTE = read('src/app/api/transactions/[id]/refund-heal/route.ts');
const API = read('src/lib/api.ts');
const SUITE = read('src/tests/refund-status-repair-v2374.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the status-repair path (the service speaks two modes) —');
ok('THE RESULT CARRIES THE MODE (HEALED | REPAIRED)',
  SERVICE.includes("mode: 'HEALED' | 'REPAIRED';"));
ok('THE REPAIR PATH EXISTS and is documented at source',
  SERVICE.includes('THE STATUS-REPAIR PATH') && SERVICE.includes("mode: 'REPAIRED',"));
ok('THE REPAIR GUARD: exhausted lines AND a non-negative header',
  SERVICE.includes('const allExhausted = views.every((l) => l.refundableQuantity <= 1e-9);')
  && SERVICE.includes('if (allExhausted && expectedTotal >= 0) {'));
ok('THE REPAIR FLIPS THE BADGE and NOTHING ELSE',
  SERVICE.includes("data: { paymentStatus: 'REFUNDED' },")
  && SERVICE.includes('refund: null,'));
ok('THE OVER-REFUNDED HEADER IS REFUSED (the anomaly stays visible)',
  SERVICE.includes('headerRemaining: expectedTotal,'));
ok('THE HEALED RETURN CARRIES ITS MODE', SERVICE.includes("mode: 'HEALED',"));

console.log('— the audit voice (the mode decides the action) —');
ok('THE HEAL ROUTE LOGS SALE_STATUS_REPAIR for a repair',
  HEAL_ROUTE.includes("action: result.mode === 'REPAIRED' ? 'SALE_STATUS_REPAIR' : 'REFUND',"));
ok('THE AUDIT ROW CARRIES THE MODE and the conditional refund fields',
  HEAL_ROUTE.includes('mode: result.mode,') && HEAL_ROUTE.includes('...(result.refund'));

console.log('— the chain-total alignment (the desk reads the service\u2019s law) —');
ok('THE LIST ROUTE\u2019S PRIOR TOTAL READS \u03a3 ITEMS (never the events\u2019 headers)',
  LIST.includes('entry.priorTotal = round2(entry.priorTotal + Number(item.lineTotal));'));
ok('THE ALIGNMENT IS DOCUMENTED AT SOURCE (the divergent-event trap named)',
  LIST.includes('THE CHAIN-TOTAL ALIGNMENT'));

console.log('— the client contract —');
ok('HealStrandedResult SPEAKS the mode and the nullable refund',
  API.includes("mode: 'HEALED' | 'REPAIRED';") && API.includes('refund: {') && API.includes('} | null;'));

console.log('— the desk (the receipt hop + the muted repair affordance) —');
ok('THE RECEIPT HOP: the committed settlement opens its own paper (auto-print armed)',
  DESK.includes('setReceiptTransaction(detail);')
  && DESK.includes('setReceiptAutoPrint(true);')
  && DESK.includes('setReceiptOpen(true);'));
ok('THE HOP IS BEST-EFFORT (the paper never fails the committed money)',
  DESK.includes('/* the paper is best-effort; the money is already home */'));
ok('THE HEALED TOAST SURVIVES (the settled truth, unchanged)',
  DESK.includes('Stranded gap settled — ${formatKES(settled.refundTotal)} returned'));
ok('THE REPAIRED TOAST SPEAKS THE BADGE TRUTH',
  DESK.includes('Status repaired — ${settled.originalReceiptNumber} is fully refunded')
  && DESK.includes('No money moved.'));
ok('THE MUTED REPAIR BUTTON EXISTS on settled rows (feature-gated with the refund)',
  DESK.includes('Mark fully refunded')
  && DESK.includes("transaction.refundState?.kind === 'SETTLED' && canRefund"));
ok('THE REPAIR CONFIRM SAYS NO MONEY MOVES and no receipt is issued',
  DESK.includes('title="Mark fully refunded"')
  && DESK.includes('No money moves and no receipt is issued. This cannot be undone.'));
ok('THE TWO AFFORDANCES SHARE ONE COMMIT (commitSettle)',
  DESK.includes('const commitSettle = useCallback') && DESK.includes('await commitSettle(healTransaction);')
  && DESK.includes('await commitSettle(repairTransaction);'));

console.log('— the round\u2019s own suite —');
ok('THE SUITE EXISTS and pins the repair journey',
  SUITE.includes('v2.374.0 THE STATUS-REPAIR PATH') && SUITE.includes("toBe('REPAIRED')"));
ok('THE SUITE PINS THE OVER-REFUND WALL', SUITE.includes('consumed: 9700'));
ok('THE SUITE PINS THE DOUBLE-REPAIR REFUSAL', SUITE.includes("toBe('NOT_REFUNDABLE')"));
ok('THE SUITE PINS THE HEALED MODE and the epsilon boundary',
  SUITE.includes("toBe('HEALED')") && SUITE.includes('consumed: 8699.99'));

console.log('— the walk\u2019s own marks —');
ok('THE WALK SCRIPT EXISTS (BY WRITE, v2374 stamped)',
  read('scripts/walk-v2374.mjs').includes('walk-v2374.mjs — the v2.374.0 re-anchor codemod'));

console.log('— the release mechanics (version slots, feed, changelog) —');
ok('pkg version = VERSION (all three slots)', pkg.version === version && pkg.mbumah?.releaseVersion === version && pkg.mbumah?.baseVersion === version);
ok('the VERSION file speaks 2.374.0', version === '2.374.0');
ok('whats-new carries the lead entry', whatsNew.includes("version: '2.374.0',") && whatsNew.indexOf("version: '2.374.0',") < whatsNew.indexOf("version: '2.373.0',"));
ok('CHANGELOG carries [2.374.0] above [2.373.0]', changelog.indexOf('[2.374.0]') >= 0 && changelog.indexOf('[2.374.0]') < changelog.indexOf('[2.373.0]'));

console.log(`\nverify-v2-374-0: ${pass} ok, ${fail} FAIL`);
if (fail > 0) process.exit(1);
