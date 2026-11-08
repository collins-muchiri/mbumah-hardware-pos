#!/usr/bin/env node
// verify-v2-375-0.mjs — the round's FEATURE gate (v2.375.0 "the settlement
// speaks its name"). The release MECHANICS live in verify-current.mjs.
// This script pins only what is NEW this round: the share text's refund
// voice (the sale contract byte-identical), the zero-item settlement's
// header-level line, the desk's settlement wearing (the emerald settle
// ink), the paper's emerald banner variant, the CSV's settlement kind,
// and the daemon's stale-pin repair (the launcher follows .env again).
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const SHARE = read('src/lib/receipt-share-text.ts');
const DESK = read('src/app/(shell)/tabs/transactions-tab.tsx');
const PAPER = read('src/components/receipt-print.tsx');
const DAEMON = read('scripts/ems-daemon-3200.cjs');
const ROUTE = read('src/app/api/whatsapp/send-document/route.ts');
const SUITE = read('src/tests/receipt-refund-voice-v2375.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the share text speaks its kind —');
ok('THE REFUND VOICE IS GUARDED ON THE ROW KIND',
  SHARE.includes("const isRefund = tx.transactionType === 'REFUND';"));
ok('THE BANNER LINE RIDES REFUNDS ONLY', SHARE.includes("lines.push('** REFUND RECEIPT **');"));
ok('THE CHAIN LINE READS THE SERVICE\u2019S OWN NOTES VOICE',
  SHARE.includes('tx.notes?.match(/Refund of (\\S+)/)?.[1]'));
ok('THE ZERO-ITEM SETTLEMENT NAMES ITS NATURE',
  SHARE.includes("if (isRefund && !tx.items?.length) {")
  && SHARE.includes("lines.push('Type: Header-level settlement (no line items)');"));
ok('THE REFUND FOOTER NEVER SAYS THE SALE\u2019S LINE',
  SHARE.includes("lines.push('Refund processed - the money is on its way back.');")
  && SHARE.includes("'Goods sold are not refundable.'")
  && SHARE.indexOf('if (isRefund) {', SHARE.indexOf("lines.push('');")) < SHARE.indexOf('Thank you for shopping at'));

console.log('— the desk\u2019s settlement kind —');
ok('isSettlementEvent IS EXPORTED (the refundReasonOf precedent)',
  DESK.includes('export function isSettlementEvent(t: {'));
ok('THE LAW IS REFUND + ZERO ITEMS',
  DESK.includes("return t.transactionType === 'REFUND' && (t.items?.length ?? 0) === 0;"));
ok('THE WEARING BRANCHES INSIDE THE REFUND BLOCK (the v2.371 amber pins stand)',
  DESK.includes('isSettlementEvent(transaction) ? (')
  && DESK.includes('bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'));
ok('THE SETTLEMENT WEARS THE EMERALD SETTLE INK with the HandCoins kind',
  DESK.includes('bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300')
  && DESK.includes('<HandCoins className="h-3 w-3 shrink-0" aria-hidden="true" />')
  && DESK.includes('data-kind="SETTLEMENT"'));
ok('THE CHIP TEACHES THE WHEN-AND-WHY (the tooltip law)',
  DESK.includes('Header-level settlement — the stranded remainder'));
ok('THE CSV SPEAKS THE SETTLEMENT KIND',
  DESK.includes("isSettlementEvent(t) ? 'Settlement' : getTransactionTypeLabel(getTransactionType(t)),"));
ok('THE HandCoins KIND ICON IS IMPORTED', DESK.includes('HandCoins,'));

console.log('— the settlement\u2019s paper —');
ok('THE BANNER BRANCHES ON THE ZERO-ITEM SHAPE',
  PAPER.includes('const isSettlement = isRefund && (transaction.items?.length ?? 0) === 0;'));
ok('THE EMERALD SETTLE BAND SPEAKS ITS LINE',
  PAPER.includes("'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200'")
  && PAPER.includes("'Settlement receipt — the stranded gap is settled'"));
ok('THE REFUND\u2019S AMBER BAND STANDS',
  PAPER.includes("'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200'")
  && PAPER.includes("'Refund receipt — money returned to the customer'"));

console.log('— the server\u2019s WhatsApp path speaks the kind too —');
ok('THE SEND-DOCUMENT RECEIPT CASE GUARDS THE KIND',
  ROUTE.includes("const isRefundTx = transaction.transactionType === 'REFUND';"));
ok('THE SERVER BANNER CARRIES THE REFUND LABEL',
  ROUTE.includes("*${isRefundTx ? 'REFUND RECEIPT' : 'RECEIPT'}*"));
ok('THE SERVER CHAIN LINE READS THE SERVICE\u2019S NOTES',
  ROUTE.includes('transaction.notes?.match(/Refund of (\\S+)/)?.[1]'));
ok('THE SERVER SETTLEMENT NAMES ITS NATURE',
  ROUTE.includes('Type: Header-level settlement (no line items)'));
ok('THE SERVER FOOTER NEVER SELLS ON A REFUND',
  ROUTE.includes('Refund processed - the money is on its way back.')
  && ROUTE.includes("if (isRefundTx) {\n          whatsappMessage += `\\nRefund processed"));

console.log('— the daemon\u2019s stale-pin repair —');
ok('THE LAUNCHER FOLLOWS .env AGAIN (audit-dev.db, the QA seeds\u2019 world)',
  /DATABASE_URL: 'file:\/home\/z\/ems\/db\/audit-dev\.db',/.test(DAEMON)
  && !/DATABASE_URL: 'file:\/home\/z\/ems\/db\/ems-dev\.db',/.test(DAEMON)
  && DAEMON.includes('STALE-PIN REPAIR'));

console.log('— the round\u2019s suite —');
ok('THE SUITE EXISTS AND SPEAKS THE ROUND', SUITE.includes('THE SETTLEMENT SPEAKS ITS NAME (v2.375.0)'));
ok('THE SUITE PINS THE SALE CONTRACT BYTE-IDENTICAL', SUITE.includes("expect(text).toContain('Goods sold are not refundable.')"));
ok('THE SUITE TRUTH-TABLES THE ZERO-ITEM VOICE LIVE', SUITE.includes('Type: Header-level settlement (no line items)'));

console.log('— the release slots —');
ok('pkg version = VERSION', pkg.version === version);
ok('VERSION SPEAKS THE ROUND', version === '2.375.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
