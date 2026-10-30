#!/usr/bin/env node
// verify-v2-277-0.mjs — the round's gate (v2.277.0 "the chip takes its correction").
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
const cal = read('src/lib/hr/compliance-calendar.ts');
const route = read('src/app/api/hr/reports/compliance-filing/route.ts');
const schema = read('prisma/schema.prisma');
const page = read('src/app/(shell)/hr/reports/page.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/filing-ledger-v2277.test.ts');
const ancestor = read('src/tests/filing-ledger-v2276.test.ts');

console.log('— the release face —');
ok('pkg version = 2.277.0', pkg.version === '2.277.0');
ok('pkg releaseVersion = 2.277.0', pkg.mbumah?.releaseVersion === '2.277.0');
ok('pkg baseVersion = 2.277.0', pkg.mbumah?.baseVersion === '2.277.0');
ok('VERSION = 2.277.0', version === '2.277.0');
ok('whats-new lead = 2.277.0 with the round\u2019s title', feed.includes("version: '2.277.0',") && feed.includes('The chip takes its correction'));
const leadIdx = feed.indexOf("version: '2.277.0',");
const pairIdx = feed.indexOf("version: '2.276.0',");
ok('whats-new pair order (lead 2.277.0 before pair 2.276.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.277.0]', changelog.includes('## [2.277.0] The chip takes its correction'));

console.log('— the door law —');
ok('the clock still governs the FIRST record', page.includes("o.status !== 'NOT_YET_OPEN' && !filingFor(o.kind, periodMonthForDueDate(o.dueDate))"));
ok('the chip is a BUTTON with the dialog affordance', page.includes('aria-haspopup="dialog"') && page.includes('if (pm) openFilingDialog(o, pm, filed);'));
ok('the amend prefill starts from the truth it corrects', page.includes("setFilingFiledAt(existing ? toDatetimeLocalValue(existing.filedAt) : toDatetimeLocalValue(new Date()));") && page.includes("setFilingRef(existing?.reference ?? '');"));
ok('the dialog speaks two modes', page.includes("{filingTarget?.amend ? 'Amend' : 'Record'} the {filingTarget?.label} filing — {filingTarget?.periodLabel}") && page.includes("filingTarget?.amend ? 'Update filing' : 'Record filing'"));
ok('the strip speaks the original recording', page.includes('data-testid="hr-filing-amend-strip"') && page.includes('corrects the ledger&apos;s one truth; the audit trail remembers the correction.'));
ok('the silent difference gets its words', page.includes('data-testid="hr-filing-amended-note"') && page.includes('if (res?.amended) {'));

console.log('— the slack law (pure, runtime-pinned) —');
ok('toDatetimeLocalValue is the ONE field math', cal.includes('export function toDatetimeLocalValue(instant: string | Date): string {'));
ok('filingWasAmended rides the one-second slack', cal.includes('export function filingWasAmended(row: { createdAt?: string | null; updatedAt?: string | null }): boolean {') && cal.includes('AMEND_SLACK_MS = 1_000'));
ok('the pure lib stays import-free (the client-bundle law)', !cal.match(/^import /m));
ok('the field math has ONE home (the old inline math is gone)', !page.includes('nowLocal.setMinutes') && !page.includes('getTimezoneOffset()'));

console.log('— the row carries its history —');
ok('the wire type carries createdAt/updatedAt', lib.includes('createdAt: string;') && lib.includes('updatedAt: string;'));
ok('both selects carry the stamps', (lib.match(/createdAt: true/g) ?? []).length === 2 && (lib.match(/updatedAt: true/g) ?? []).length === 2);
ok('the schema already had the stamps — no migration this round', schema.includes('createdAt      DateTime @default(now())') && schema.includes('updatedAt      DateTime @updatedAt'));
ok('the chip title speaks the amendment and the door', page.includes("${filingWasAmended(filed) ? ` — amended ${formatDate(filed.updatedAt)}` : ''} — open to amend"));
ok('the Due cell counts corrections like receipts', page.includes('const monthAmendedCount = (periodMonth: string): number =>') && page.includes("${amended > 0 ? ` · ${amended} receipt${amended === 1 ? '' : 's'} amended` : ''}"));

console.log('— the door\'s styling (mandatory ④) —');
ok('the hover deepens the emerald face', page.includes('hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800'));
ok('focus-visible rides the emerald ring', page.includes('focus-visible:ring-emerald-400'));
ok('the pen and the stamp never share a submit', page.includes("filingTarget?.amend ? <PenLine className=\"h-3.5 w-3.5\" aria-hidden /> : <Stamp className=\"h-3.5 w-3.5\" aria-hidden />"));

console.log('— the audited door rides unchanged —');
ok('recorded vs amended stay separate actions', route.includes("action: amended ? 'STATUTORY_FILING_AMENDED' : 'STATUTORY_FILING_RECORDED'"));
ok('values stay out of the audit trail', route.includes('metadata: { kind: filing.kind, periodMonth: filing.periodMonth, amended }') && !route.includes('reference: filing.reference'));

console.log('— the ancestor\'s evolutions are named —');
ok('four named v2.277 evolutions in the ancestor', (ancestor.match(/v2\.277\.0 \(deliberate evolution\)/g) ?? []).length === 4);
ok('the join-key count grew with the chip\'s door', ancestor.includes('expect(uses.length).toBe(5);'));

console.log('— the tests are present —');
ok('the vitest pins exist (21 tests)', test.split('it(').length - 1 === 21);

console.log('— the openapi mirror —');
const openapi = read('src/lib/openapi.ts');
ok('openapi info.version mirrors APP_VERSION (the single-truth law)', openapi.includes("import { APP_VERSION } from './version'") && openapi.includes('version: APP_VERSION'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
