#!/usr/bin/env node
// verify-v2-379-0.mjs — the round's FEATURE gate (v2.379.0 "the server
// speaks the desk's vocabulary"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// server-side kind scope (the param, the four refinements, the outranks
// order, the unknown-ignored contract), and the settlement's items cell
// (the settled-gap voice, the mono badge's survival).
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const ROUTE = read('src/app/api/transactions/route.ts');
const DESK = read('src/app/(shell)/tabs/transactions-tab.tsx');
const SUITE = read('src/tests/txn-kind-server-scope-v2379.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the server-side kind scope —');
ok('THE ROUTE READS THE KIND PARAM',
  ROUTE.includes("const kind = searchParams.get('kind') || '';"));
ok('THE CONTRACT IS SPOKEN (outranks + never-400)',
  ROUTE.includes('A RECOGNIZED kind OUTRANKS a coincident `transactionType`')
  && ROUTE.includes('an UNRECOGNIZED kind is IGNORED'));
ok('THE SALE WORD SCOPES THE FLAT SALE',
  ROUTE.includes("if (kind === 'sale') {\n    where.transactionType = 'SALE';"));
ok('THE VOID WORD SCOPES THE FLAT VOID',
  ROUTE.includes("} else if (kind === 'void') {\n    where.transactionType = 'VOID';"));
ok('THE SETTLEMENT IS THE ZERO-ITEM LAW (items none)',
  ROUTE.includes("} else if (kind === 'settlement') {\n    where.transactionType = 'REFUND';\n    where.items = { none: {} };"));
ok('THE ITEMIZED REFUND KEEPS THE SOME LAW',
  ROUTE.includes("} else if (kind === 'refund') {\n    where.transactionType = 'REFUND';\n    where.items = { some: {} };"));
ok('THE ORDER LAW (the kind chain stands after the flat filter)',
  (() => {
    const flat = ROUTE.indexOf('if (transactionType) {');
    const chain = ROUTE.indexOf("if (kind === 'sale') {");
    return flat >= 0 && chain > flat;
  })());
ok('THE UNKNOWN KIND NEVER SCOPES (no catch-all else in the chain)',
  (() => {
    const a = ROUTE.indexOf("// v2.379.0 THE KIND'S SERVER FACE");
    const b = ROUTE.indexOf('if (cashierId) {', a);
    const chain = ROUTE.slice(a, b);
    return chain.includes("} else if (kind === 'refund') {")
      && chain.endsWith('  }\n\n  ');
  })());
ok('THE COUNT RIDES THE SAME WHERE',
  ROUTE.includes('db.salesTransaction.count({ where })'));

console.log('— the settlement\u2019s items cell —');
ok('THE SETTLED GAP VOICE REPLACES THE DEAD COUNT',
  DESK.includes("txType === 'settlement' ? (")
  && DESK.includes('settled gap'));
ok('THE EMERALD SETTLE INKS (light + dark)',
  DESK.includes('className="text-[10px] px-1.5 py-0 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"'));
ok('THE MONO COUNT BADGE RIDES FOR THE OTHER KINDS',
  DESK.includes("{items.length} {items.length === 1 ? 'item' : 'items'}")
  && DESK.includes('className="text-[10px] px-1.5 py-0 font-mono"'));
ok('THE V2.378 AMOUNT INK RIDES UNTOUCHED',
  DESK.includes("txType === 'settlement' ? 'text-emerald-700'")
  && DESK.includes("{txType === 'refund' || txType === 'settlement' ? '-' : ''}"));

console.log('— the suites —');
ok('THE ROUND\u2019S SUITE EXISTS AND SPEAKS THE ROUND',
  SUITE.includes('THE SERVER SPEAKS THE DESK\u2019S VOCABULARY (v2.379.0)'));

console.log('— the release slots —');
ok('pkg version = VERSION', pkg.version === version);
ok('VERSION SPEAKS THE ROUND', version === '2.379.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
