#!/usr/bin/env node
// verify-v2-380-0.mjs — the round's FEATURE gate (v2.380.0 "the lens rides
// past the cap"). The release MECHANICS live in verify-current.mjs. This
// script pins only what is NEW this round: the wire's kind serialization,
// the honest window total (the exact truncation signal), the honest-fetch
// rider (arm contract, kind ride, per-lens key, honest base swap, census
// wholeness), and the capped-window voices (the honest lens count, the
// spinner, the amber capped-window voice).
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const API = read('src/lib/api.ts');
const DESK = read('src/app/(shell)/tabs/transactions-tab.tsx');
const SUITE = read('src/tests/txn-kind-honest-fetch-v2380.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the wire —');
ok('THE LIST PARAMS GROW KIND',
  API.includes('THE HONEST-FETCH RIDE')
  && API.includes("paymentMethod?: string; kind?: string; dateFrom?: string; dateTo?: string"));
ok('THE KIND PARAM SERIALIZES',
  API.includes("if (params?.kind) query.set('kind', params.kind);"));

console.log('— the honest window —');
ok('THE QUERYFN RETURNS ROWS + THE WIRE TOTAL',
  DESK.includes('THE HONEST WINDOW TOTAL')
  && DESK.includes('return { rows, total: res.pagination?.total ?? rows.length };'));
ok('THE MEMO READS THE ROWS SLOT',
  DESK.includes('() => (transactionsData?.rows ?? []),'));
ok('THE CAPPED SIGNAL IS EXACT (wire count outranks slice)',
  DESK.includes('const windowTotal = transactionsData?.total ?? 0;')
  && DESK.includes('const windowCapped = windowTotal > transactions.length;'));

console.log('— the rider —');
ok('THE ARM CONTRACT (lens active AND window capped)',
  DESK.includes("const lensCapped = typeFilter !== 'all' && windowCapped;")
  && DESK.includes('enabled: lensCapped,'));
ok('THE RIDE (kind crosses the lensed fetch)',
  (() => {
    const fn = DESK.slice(DESK.indexOf("queryKey: ['transactions-lens'"));
    return fn.includes("kind: typeFilter,") && fn.includes("limit: '200',");
  })());
ok('THE PER-LENS KEY',
  DESK.includes("queryKey: ['transactions-lens', currentStoreId, dateRange, paymentFilter, typeFilter],"));
ok('THE HONEST BASE SWAP + THE CLIENT FILTER STANDS DOWN',
  DESK.includes('let result = lensedRows ?? transactions;')
  && DESK.includes("if (!lensedRows && typeFilter !== 'all') {"));
ok('THE CENSUS STAYS WHOLE (reads the unscoped fetch)',
  DESK.includes('const typeCensus = countTransactionTypes(transactions);'));

console.log('— the voices —');
ok('THE LENS VOICE SPEAKS THE HONEST TOTAL',
  DESK.includes('<span className="tabular-nums">{lensTotal ?? typeCensus[typeFilter]} in this lens</span>'));
ok('THE SPINNER RIDES WHILE THE RIDER RIDES',
  DESK.includes('{lensedRiding && (')
  && DESK.includes('<Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />'));
ok('THE CAPPED-WINDOW VOICE (amber honesty, own row)',
  DESK.includes('data-testid="txn-window-cap-voice"')
  && DESK.includes('className="flex w-full items-center gap-1.5 pl-6 text-xs font-medium text-amber-700 dark:text-amber-300"')
  && DESK.includes('Capped window — showing the newest {transactions.length} of {windowTotal} rows'));
ok('THE RIDER-NOTE LIVES INSIDE THE CAPPED GATE',
  (() => {
    const voice = DESK.slice(DESK.indexOf('THE CAPPED-WINDOW VOICE'));
    const capped = voice.indexOf('{windowCapped && (');
    const note = voice.indexOf('the active lens fetches its own scope past the cap');
    return capped >= 0 && note > capped;
  })());

console.log('— the suites —');
ok('THE ROUND\u2019S SUITE EXISTS AND SPEAKS THE ROUND',
  SUITE.includes('THE LENS RIDES PAST THE CAP (v2.380.0)'));

console.log('— the release slots —');
ok('pkg version = VERSION', pkg.version === version);
ok('VERSION SPEAKS THE ROUND', version === '2.380.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
