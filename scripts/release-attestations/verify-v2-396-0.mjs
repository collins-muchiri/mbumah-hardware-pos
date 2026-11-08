#!/usr/bin/env node
// verify-v2-396-0.mjs — the round's FEATURE gate (v2.396.0 "the M-Pesa
// statuses find their feet"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// stored reconciliation status (schema + migration), the write route's
// vocabulary and coherence, the desk's effective status (the honest
// derivation), the row actions, the api client's voice, the fixture
// world, and the release's own slots. THE OD LAW: bytes, not memory.
import { readFileSync, existsSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/banking-tab.tsx');
const ROUTE = read('src/app/api/banking/transactions/route.ts');
const API = read('src/lib/api.ts');
const SCHEMA = read('prisma/schema.prisma');
const MIGRATION = 'prisma/migrations/20261105100000_add_mpesa_reconciliation_status/migration.sql';
const FIXTURES = read('scripts/seed-mpesa-fixtures.mjs');
const SUITE = read('src/tests/bank-mpesa-deep-link-v2388.test.ts');
const FEED = read('src/lib/whats-new.ts');
const CHANGELOG = read('CHANGELOG.md');
const CHANGELOG_TEST = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the stored status —');
ok('THE SCHEMA SPEAKS THE COLUMN (nullable — legacy rows keep NULL)',
  SCHEMA.includes('reconciliationStatus String?'));
ok('THE MIGRATION EXISTS AND ALTERS THE LEDGER',
  existsSync(MIGRATION) && read(MIGRATION).includes('ALTER TABLE "bank_transactions" ADD COLUMN "reconciliationStatus" TEXT;'));

console.log('— the write path —');
ok('THE ROUTE SPEAKS THE VOCABULARY (four statuses, null re-derives)',
  ROUTE.includes("const VALID_STATUSES = ['PENDING', 'MATCHED', 'UNMATCHED', 'DISPUTED'];"));
ok('THE COHERENCE LAW (MATCHED true + reconciledAt, every other status cleared)',
  ROUTE.includes('isReconciled: isMatched,')
  && ROUTE.includes('reconciledAt: isMatched ? new Date() : null,'));
ok('THE GUARDS (role-gated, body-door, systemLogged)',
  ROUTE.includes('withSessionAuth(setReconciliationStatusHandler, FINANCIAL_ROLES.WRITE)')
  && ROUTE.includes('readJsonBody<{')
  && ROUTE.includes("action: 'BANK_TRANSACTION_STATUS_SET',"));

console.log('— the desk —');
ok('THE EFFECTIVE STATUS (stored first, the honest derivation second)',
  DESK.includes('const effectiveMpesaStatus = (')
  && DESK.includes("tx.reconciliationStatus ?? (tx.isReconciled ? 'MATCHED' : 'PENDING')"));
ok('THE LIES ARE GONE (the stale simulate comment retired)',
  !DESK.includes('UNMATCHED/DISPUTED are not easily derived'));
ok('THE LENS FILTERS ON THE EFFECTIVE STATUS',
  DESK.includes('list = list.filter((t) => effectiveMpesaStatus(t) === mpesaFilterStatus);'));
ok('THE ROW ACTIONS (Dispute, Match, Reopen, the settled face)',
  DESK.includes('data-testid="mpesa-row-dispute"')
  && DESK.includes('data-testid="mpesa-row-match"')
  && DESK.includes('data-testid="mpesa-row-reopen"')
  && DESK.includes('data-testid="mpesa-row-settled"'));
ok('THE ACTIONS WRITE THROUGH THE MUTATION',
  DESK.includes('bankingApi.transactions.setStatus(vars)')
  && DESK.includes("mpesaStatusMut.mutate({ transactionId: tx.id, reconciliationStatus: 'DISPUTED' })"));
ok('THE BADGE CONFIG COVERS THE WHOLE VOCABULARY',
  DESK.includes('UNMATCHED: { label: \'Unmatched\'')
  && DESK.includes('DISPUTED: { label: \'Disputed\''));

console.log('— the client + the fixtures —');
ok('THE API CLIENT (the type nullable, the setStatus voice)',
  API.includes('reconciliationStatus: string | null;')
  && API.includes('setStatus: async (data: { transactionId: string; reconciliationStatus: string | null })'));
ok('THE FIXTURE WORLD LIGHTS EVERY WORD',
  FIXTURES.includes("'MATCHED'") && FIXTURES.includes("'UNMATCHED'")
  && FIXTURES.includes("'DISPUTED'") && FIXTURES.includes('the legacy face: derived, never stored'));
ok('THE PIN SUITE EXTENDED (the feet describe lives)',
  SUITE.includes('the statuses find their feet (v2.396.0)'));

console.log('— the release slots —');
ok('THE FEED LEADS WITH THE ROUND (title + the shop-floor bullets)',
  FEED.includes("version: '2.396.0',")
  && FEED.indexOf("version: '2.396.0',") < FEED.indexOf("version: '2.395.0',")
  && FEED.includes('The M-Pesa statuses find their feet')
  && FEED.includes('no row lies'));
ok('THE CHANGELOG LEADS WITH THE ROUND',
  CHANGELOG.startsWith('## [2.396.0] The M-Pesa statuses find their feet'));
ok('THE VERSION SLOTS AGREE',
  version === '2.396.0'
  && pkg.version === '2.396.0'
  && pkg.mbumah.releaseVersion === '2.396.0'
  && pkg.mbumah.baseVersion === '2.396.0');
ok('THE CASCADE HISTORY LINE LANDED',
  CHANGELOG_TEST.includes('// v2.396.0:')
  && CHANGELOG_TEST.includes('286/287/288/319'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
