#!/usr/bin/env node
// verify-v2-371-0.mjs — the round's FEATURE gate (v2.371.0 "the refund
// rows come home"). The release MECHANICS live in verify-current.mjs.
// This script pins only what is NEW this round: the kind-first law,
// the refund event's wearing, the reason voice, the lens composition,
// and the census ripple.
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/transactions-tab.tsx');
const SUITE = read('src/tests/txn-kind-v2371.test.ts');
const LEDGER = read('src/tests/txn-type-deep-link-v2354.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the kind-first law (the row\'s own kind comes first) —');
const kindIdx = DESK.indexOf("transaction.transactionType === 'REFUND'");
const statusIdx = DESK.indexOf("paymentStatus === 'REFUNDED') return 'refund'");
ok('THE REFUND BRANCH IS WRITTEN and precedes the status branch',
  kindIdx >= 0 && statusIdx > kindIdx);
ok('THE VOID BRANCH IS WRITTEN (the kind law\'s symmetry)',
  DESK.includes("transaction.transactionType === 'VOID') return 'void';"));
ok('THE LAW IS DOCUMENTED AT SOURCE (the masquerade named)',
  DESK.includes("THE ROW'S OWN KIND COMES FIRST") && DESK.includes('masqueraded'));

console.log('— the refund event\'s wearing (the amber kind chip) —');
ok('THE CHIP RENDERS ON THE ROW\'S OWN KIND',
  DESK.includes("{transaction.transactionType === 'REFUND' && ("));
ok('THE CHIP WEARS THE DESK\'S OWN AMBER REFUND INK (light + dark)',
  DESK.includes('bg-amber-100 text-amber-800')
  && DESK.includes('dark:bg-amber-950/40 dark:text-amber-300'));
ok('THE KIND ICON RIDES THE CHIP', /REFUND' && \([\s\S]*?RotateCcw className="h-3 w-3 shrink-0"/.test(DESK));
ok('THE REASON VOICE RIDES THE CHIP (the service\'s own prefix form)',
  DESK.includes("refundReasonOf(transaction.notes) ? ` · ${refundReasonOf(transaction.notes)}` : ''"));

console.log('— the reason voice (exported, guarded) —');
ok('refundReasonOf IS EXPORTED FROM THE DESK',
  DESK.includes('export function refundReasonOf(notes: string | null | undefined): string | null {'));
ok('THE REGEX ANCHORS THE SERVICE\'S PREFIX (first segment, known boundary)',
  DESK.includes("notes.match(/^Refund reason: ([A-Z_]+)(?=$| ·)/)"));
ok('THE VOCABULARY GUARD READS THE KNOWN LABELS ONLY',
  /export function refundReasonOf\([\s\S]*?in REFUND_REASON_LABELS[\s\S]*?function RefundDialog\(\{/.test(DESK));

console.log('— the two voices and the lens composition —');
ok('THE ORIGINAL\'S STATUS BADGE STANDS (the event and the state are two voices)',
  DESK.includes('getPaymentStatusColor(transaction.paymentStatus)')
  && DESK.includes('getPaymentStatusLabel(transaction.paymentStatus)'));
ok('THE AMOUNT\'S AMBER-MINUS NOW REACHES THE EVENTS (the pre-existing voice)',
  DESK.includes("txType === 'refund' ? 'text-amber-700'")
  && DESK.includes("{txType === 'refund' ? '-' : ''}"));
ok('THE TYPE FILTER READS THE DERIVED KIND (a landed word filters the rows)',
  DESK.includes('getTransactionType(t) === typeFilter'));

console.log('— the suite and the census ripple —');
ok('THE KIND SUITE EXISTS and declares its boundary',
  SUITE.includes('THE REFUND ROWS COME HOME') && SUITE.includes('txn-type-deep-link-v2354.test.ts'));
ok('THE TXN-TYPE LEDGER LISTS THE KIND SUITE (the honest-speaker ripple)',
  LEDGER.includes("'src/tests/txn-kind-v2371.test.ts',"));

console.log('— the release mechanics (version slots, feed, changelog) —');
ok('pkg version = VERSION (all three slots)', pkg.version === version && pkg.mbumah?.releaseVersion === version && pkg.mbumah?.baseVersion === version);
ok('the VERSION file speaks 2.371.0', version === '2.371.0');
ok('whats-new carries the lead entry', whatsNew.includes("version: '2.371.0',") && whatsNew.indexOf("version: '2.371.0',") < whatsNew.indexOf("version: '2.370.0',"));
ok('CHANGELOG carries [2.371.0] above [2.370.0]', changelog.indexOf('[2.371.0]') >= 0 && changelog.indexOf('[2.371.0]') < changelog.indexOf('[2.370.0]'));

console.log(`\nverify-v2-371-0: ${pass} ok, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
