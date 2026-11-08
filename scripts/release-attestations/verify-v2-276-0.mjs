#!/usr/bin/env node
// verify-v2-276-0.mjs — the round's gate (v2.276.0 "the ledger takes the receipt").
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const lib = read('src/lib/hr/statutory-filing.ts');
const route = read('src/app/api/hr/reports/compliance-filing/route.ts');
const schema = read('prisma/schema.prisma');
const migration = read('prisma/migrations/20261030070000_add_statutory_filings/migration.sql');
const audit = read('src/lib/hr/audit.ts');
const page = read('src/app/(shell)/hr/reports/page.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/filing-ledger-v2276.test.ts');

console.log('— the release face —');
ok('pkg version = 2.276.0', pkg.version === '2.276.0');
ok('pkg releaseVersion = 2.276.0', pkg.mbumah?.releaseVersion === '2.276.0');
ok('pkg baseVersion = 2.276.0', pkg.mbumah?.baseVersion === '2.276.0');
ok('VERSION = 2.276.0', version === '2.276.0');
ok('whats-new lead = 2.276.0 with the round\u2019s title', feed.includes("version: '2.276.0',") && feed.includes('The ledger takes the receipt'));
const leadIdx = feed.indexOf("version: '2.276.0',");
const pairIdx = feed.indexOf("version: '2.275.0',");
ok('whats-new pair order (lead 2.276.0 before pair 2.275.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.276.0]', changelog.includes('## [2.276.0] The ledger takes the receipt'));

console.log('— the ledger\'s table —');
ok('the migration creates the compound-unique receipt table', migration.includes('CREATE TABLE "statutory_filings" (') && migration.includes('"statutory_filings_organizationId_kind_periodMonth_key"'));
ok('a deleted filer never strands a receipt (SET NULL)', migration.includes('REFERENCES "users"("id") ON DELETE SET NULL'));
ok('the schema model carries the compound unique + the map', schema.includes('model StatutoryFiling {') && schema.includes('@@unique([organizationId, kind, periodMonth])') && schema.includes('@@map("statutory_filings")'));
ok('the back-relations ride both parents', schema.includes('statutoryFilings     StatutoryFiling[]') && schema.includes('filedStatutoryFilings   StatutoryFiling[]'));

console.log('— the ledger\'s one home —');
ok('the pure gate is exported', lib.includes('export function validateFilingInput(input: StatutoryFilingInput, now: Date): StatutoryFilingValidated'));
ok('the four kinds are the calendar\'s own', lib.includes("['PAYE', 'NSSF', 'SHIF', 'AHL'] as const"));
ok('the future gate rides the one-minute skew', lib.includes('FUTURE_SLACK_MS = 60_000'));
ok('the read refuses the filer\'s id, carries the name', lib.includes('filedBy: { select: { name: true } }') && !lib.includes("filedBy: { select: { id: true"));
ok('the join key derives the payroll month from the due date', read('src/lib/hr/compliance-calendar.ts').includes('export function periodMonthForDueDate(dueDate: string): string | null'));
ok('the upsert says recorded vs amended', lib.includes('amended: Boolean(existing)'));
ok('the machine code is precise, never a bare 500', lib.includes('class StatutoryFilingError'));

console.log('— the audited door —');
ok('both verbs ride the drill-down guard', (route.match(/hrGuard\('hr\.report\.branch', REPORT_ROLES\)/g) ?? []).length === 2);
ok('the audit vocabulary grew the entity', audit.includes("STATUTORY_FILING: 'StatutoryFiling',"));
ok('recorded vs amended are separate actions', route.includes("action: amended ? 'STATUTORY_FILING_AMENDED' : 'STATUTORY_FILING_RECORDED'"));
ok('values stay out of the audit trail', route.includes('metadata: { kind: filing.kind, periodMonth: filing.periodMonth, amended }') && !route.includes('reference: filing.reference'));
ok('a pre-migration database speaks the precise code', route.includes('FILING_LEDGER_UNAVAILABLE'));

console.log('— the card wears the receipt —');
ok('the receipt chip is emerald with the AT words', page.includes('data-testid={`hr-cal-filed-${o.kind.toLowerCase()}`}') && page.includes('filed {formatDate(filed.filedAt)}'));
ok('the write door refuses an unopened window', page.includes("o.status !== 'NOT_YET_OPEN' && !filingFor(o.kind, periodMonthForDueDate(o.dueDate))"));
ok('the dialog is the filer\'s assertion', page.includes('data-testid="hr-filing-dialog"') && page.includes('data-testid="hr-filing-submit"'));
ok('the footer speaks both halves (the law completed)', page.includes('The clock speaks deadlines; the ledger speaks receipts'));
ok('the ledger rides the calendar\'s loader (no new effect)', page.includes('const rows = await apiGet<StatutoryFilingRow[]>(`/api/hr/reports/compliance-filing?from=${from}&to=${to}`);') && page.includes('setFilings(rows ?? []);'));
ok('the Due cell keeps quiet outside its coverage', page.includes('if (!monthInCoverage(m.month)) return base;') && page.includes('data-testid="hr-due-filed-dot"'));

console.log('— the tests are present —');
ok('the vitest pins exist (25 tests)', test.split('it(').length - 1 === 25);

console.log('— the openapi mirror —');
const openapi = read('src/lib/openapi.ts');
ok('openapi info.version mirrors APP_VERSION (the single-truth law)', openapi.includes("import { APP_VERSION } from './version'") && openapi.includes('version: APP_VERSION'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
