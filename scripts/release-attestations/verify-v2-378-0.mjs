#!/usr/bin/env node
// verify-v2-378-0.mjs — the round's FEATURE gate (v2.378.0 "the
// settlement answers the address bar"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// settlement kind (union, refinement, wearing, census, vocabulary), the
// repair's own WhatsApp note (the paper-substitute voice), and the
// Release workflow's release-scoped publish gate (the Task 95 incident's
// permanent repair).
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/transactions-tab.tsx');
const WORKFLOW = read('.github/workflows/release.yml');
const SUITE = read('src/tests/txn-type-settlement-kind-v2378.test.ts');
const DL = read('src/tests/txn-type-deep-link-v2354.test.ts');
const KIND = read('src/tests/txn-kind-v2371.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the settlement kind —');
ok('THE UNION SPEAKS FOUR KINDS',
  DESK.includes("type TransactionType = 'sale' | 'refund' | 'settlement' | 'void';"));
ok('THE DERIVATION REFINES THROUGH THE EXPORTED LAW',
  DESK.includes("return isSettlementEvent(transaction) ? 'settlement' : 'refund';")
  && DESK.includes("THE KIND'S OWN DERIVATION"));
ok('THE WEARING TRIO (HandCoins, emerald ink, the Settlement label)',
  DESK.includes("case 'settlement': return <HandCoins className=\"h-3.5 w-3.5\" />;")
  && DESK.includes("case 'settlement': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';")
  && DESK.includes("case 'settlement': return 'Settlement';"));
ok('THE CENSUS KEYSET IS THE UNION',
  DESK.includes('{ all: rows.length, sale: 0, refund: 0, settlement: 0, void: 0 }'));
ok('THE ROW AND THE AMOUNT CELL SPEAK THE SETTLE INK',
  DESK.includes("txType === 'settlement' ? 'bg-emerald-50/50 dark:bg-emerald-950/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'")
  && DESK.includes("txType === 'settlement' ? 'text-emerald-700'")
  && DESK.includes("{txType === 'refund' || txType === 'settlement' ? '-' : ''}"));
ok('THE KIND-FIRST ORDER LAW STANDS (kind branches before status branches)',
  (() => {
    const a = DESK.indexOf("transaction.transactionType === 'REFUND')");
    const b = DESK.indexOf("transaction.transactionType === 'VOID')");
    const c = DESK.indexOf("paymentStatus === 'REFUNDED'");
    return a >= 0 && b > a && c > b;
  })());

console.log('— the address bar —');
ok('THE VOCABULARY GREW ONE VALUE (the parser home rides untouched)',
  DESK.includes("export const TXN_TYPE_FILTERS = ['all', 'sale', 'refund', 'settlement', 'void'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'txn-type', TXN_TYPE_FILTERS, 'all')"));
ok('THE CHIP MAP SPEAKS THE SAME KEYSET (the door-shape law)',
  DESK.includes("(['all', 'sale', 'refund', 'settlement', 'void'] as const).map((type) => ("));
ok('THE LEDGER ADMITTED THE NEW SUITE (the LEDGER-CITATION RIPPLE)',
  DL.includes("'src/tests/txn-type-settlement-kind-v2378.test.ts',"));

console.log('— the repair\u2019s own note —');
ok('THE SHARE ASK RIDES THE FAMILY (title, confirm, prefill)',
  DESK.includes('title: `Share the repair note for ${settled.originalReceiptNumber}?`,')
  && DESK.includes("confirmLabel: 'Share note',")
  && DESK.includes("prefill: tx.customer?.phone || '',"));
ok('THE NOTE SAYS EXACTLY WHAT HAPPENED (the toast\u2019s own truth)',
  DESK.includes('`Status repaired — receipt ${settled.originalReceiptNumber} is fully refunded. ` +')
  && DESK.includes("'The refund chain already covered this sale; the badge caught up. No money moved.',"));
ok('THE SEND IS BEST-EFFORT (the committed repair must never fail it)',
  DESK.includes("toast.success('Repair note sent via WhatsApp');")
  && DESK.includes('/* the note is best-effort; the repair is already home */'));
ok('THE DEPS OWN THE ASK AND THE STORE',
  DESK.includes('}, [queryClient, askRecipient, currentStoreId]);'));

console.log('— the release-scoped gate —');
ok('THE PUBLISH STEP GATES ON THE RELEASE (id: release)',
  WORKFLOW.includes('id: release')
  && WORKFLOW.includes("if: steps.release.outputs.exists == 'false'"));
ok('THE TAG CUT KEEPS ITS OWN GATE (the two gates are distinct)',
  WORKFLOW.includes("if: steps.tag.outputs.exists == 'false'"));
ok('THE CHECK ASKS GITHUB FOR THE RELEASE ITSELF',
  WORKFLOW.includes('gh release view "v${{ steps.ver.outputs.version }}" --repo "$GITHUB_REPOSITORY" --json id'));
ok('THE OLD TAG-SCOPED PUBLISH GATE IS GONE',
  !WORKFLOW.includes("if: steps.tag.outputs.exists == 'false'\n        env:"));

console.log('— the suites —');
ok('THE ROUND\u2019S SUITE EXISTS AND SPEAKS THE ROUND', SUITE.includes('THE SETTLEMENT LENS (v2.378.0)'));
ok('THE DEEP-LINK SUITE TRAVELED (the settlement value + case law)',
  DL.includes("parseInitialNamedMember('?txn-type=settlement', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('settlement')")
  && DL.includes("parseInitialNamedMember('?txn-type=SETTLEMENT', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('all')"));
ok('THE KIND SUITE GREW THE REFINEMENT (the ORDER law pinned)',
  KIND.includes("return isSettlementEvent(transaction) ? 'settlement' : 'refund';")
  && KIND.includes("'REFUND') {"));

console.log('— the release slots —');
ok('pkg version = VERSION', pkg.version === version);
ok('VERSION SPEAKS THE ROUND', version === '2.378.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
