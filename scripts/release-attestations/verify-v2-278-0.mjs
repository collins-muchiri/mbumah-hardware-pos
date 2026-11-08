#!/usr/bin/env node
// verify-v2-278-0.mjs — the round's gate (v2.278.0 "the digest learns the receipt").
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
const cal = read('src/lib/hr/compliance-calendar.ts');
const reports = read('src/lib/hr/reports.ts');
const schedule = read('src/lib/hr/report-schedule-service.ts');
const page = read('src/app/(shell)/hr/reports/page.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/digest-filings-v2278.test.ts');
const a2275 = read('src/tests/panel-portal-v2275.test.ts');
const a2276 = read('src/tests/filing-ledger-v2276.test.ts');

console.log('— the release face —');
ok('pkg version = 2.278.0', pkg.version === '2.278.0');
ok('pkg releaseVersion = 2.278.0', pkg.mbumah?.releaseVersion === '2.278.0');
ok('pkg baseVersion = 2.278.0', pkg.mbumah?.baseVersion === '2.278.0');
ok('VERSION = 2.278.0', version === '2.278.0');
ok('whats-new lead = 2.278.0 with the round\u2019s title', feed.includes("version: '2.278.0',") && feed.includes('The digest learns the receipt'));
const leadIdx = feed.indexOf("version: '2.278.0',");
const pairIdx = feed.indexOf("version: '2.277.0',");
ok('whats-new pair order (lead 2.278.0 before pair 2.277.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.278.0]', changelog.includes('## [2.278.0] The digest learns the receipt'));
ok('the verify script is wired', pkg.scripts['verify:v2-278-0'] === 'node scripts/verify-v2-278-0.mjs');

console.log('— the pure voice (the calendar lib) —');
ok('the clock\u2019s own list is exported', cal.includes("export const STATUTORY_OBLIGATION_KINDS = ['PAYE', 'NSSF', 'SHIF', 'AHL'] as const;"));
ok('the window\u2019s open day is the ONE derivation', cal.includes('export function filingWindowOpensForPeriod(month: string): string | null {') && cal.includes('const due = statutoryDueForPeriod(month);') && cal.includes('return `${due.dueDate.slice(0, 7)}-01`;'));
ok('the voice gates on counts before the clock', cal.indexOf('if (!counts) return \'\';') > -1 && cal.indexOf('utcDayKey(now) < openDay') > -1);
ok('the voice clamps at the door', cal.includes('Math.max(0, Math.min(total, Math.floor(Number(counts.filed) || 0)))') && cal.includes('Math.max(0, Math.min(filed, Math.floor(Number(counts.amended) || 0)))'));
ok('the grammar speaks counts and amendments', cal.includes('`${filed} of ${total} filed${amended > 0 ? ` \u00b7 ${amended} amended` : \u0027\u0027}`'));
ok('the pure lib stays import-free (the client-bundle law)', !cal.match(/^import /m));

console.log('— the composition rides the report —');
ok('the read is the ledger\u2019s own read', reports.includes("import { fetchStatutoryFilings } from './statutory-filing';") && reports.includes('await fetchStatutoryFilings(session, { fromMonth: monthKeys[0], toMonth: monthKeys[monthKeys.length - 1] })'));
ok('the amendment count is the slack law\u2019s', reports.includes('if (filingWasAmended(row)) bucket.amended += 1;'));
ok('a foreign month\u2019s receipt is another report\u2019s story', reports.includes('if (!bucket) continue;'));
ok('a ledger that cannot speak leaves the composition null', reports.includes('filings = null; // the ledger stays quiet; the money never lies about it'));
ok('no monthly rows \u2192 no ledger read', reports.includes('if (monthKeys.length > 0) {'));
ok('the answer carries the composition beside the totals', /return \{\n    scope,\n    filings,/.test(reports));

console.log('— the seam clothes every surface —');
ok('the columns grew Filed beside Due by', schedule.includes("columns: ['Month', 'PAYE', 'NSSF', 'SHIF', 'AHL', 'Total', 'Due by', 'Filed']"));
ok('the row\u2019s last cell is the voice at the fire instant', schedule.includes('digestFilingVoice(m.month, r.filings ? r.filings[m.month] ?? null : null, now)'));
ok('the builder imports the voice with the clock', schedule.includes("import { digestFilingVoice, statutoryDueForPeriod } from '@/lib/hr/compliance-calendar';"));
ok('the v2.275 comment tells the new truth', schedule.includes('v2.278.0 "the digest learns the receipt"') && schedule.includes('COUNTS only') && schedule.includes('never a name, reference or note'));
ok('no private words ride the seam', !schedule.includes('filedByName'));

console.log('— the desk\u2019s receipt rail (mandatory \u2463) —');
ok('the rail rides the coverage law', page.includes('{monthInCoverage(m.month) && (() => {') && page.includes('data-testid="hr-due-filed-rail"'));
ok('four dots, the calendar\u2019s own order', page.includes("const kinds = ['PAYE', 'NSSF', 'SHIF', 'AHL'] as const;") && page.includes('data-testid={`hr-due-filed-dot-${k.toLowerCase()}`}'));
ok('emerald held / quiet slate not', page.includes("held ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'"));
ok('the aria speaks the ONE grammar the title speaks', page.includes('aria-label={`filed: ${count} of ${kinds.length} obligations${amended > 0 ? ` \u00b7 ${amended} receipt${amended === 1 ? \u0027\u0027 : \u0027s\u0027} amended` : \u0027\u0027}`'));
ok('monthFullyFiled retired (the rail IS the composition)', !page.includes('const monthFullyFiled = (periodMonth: string): boolean =>') && page.includes('monthFullyFiled retired'));
ok('the retirement is named where the helper lived', page.includes('v2.278.0: monthFullyFiled retired'));

console.log('— the tests and the ancestors —');
ok('the round\u2019s suite exists and pins the runtime laws', test.includes('digestFilingVoice,') && test.includes('filingWindowOpensForPeriod,') && test.includes("} from '@/lib/hr/compliance-calendar';") && test.includes("'3 of 4 filed \u00b7 1 amended'"));
ok('the suite pins the honest absences', test.includes('digestFilingVoice(\'2026-10\', { filed: 0, amended: 0 }, NOW)).toBe(\'\')'));
ok('v2275\u2019s digest pin wears the eight columns', a2275.includes("'Due by', 'Filed']") && a2275.includes('v2.278.0 (deliberate evolution)'));
ok('v2276\u2019s dot pin grew the rail', a2276.includes('data-testid="hr-due-filed-rail"') && a2276.includes('v2.278.0 (deliberate evolution)'));
ok('the clock\u2019s older pins still stand (Due by survives at the seam)', schedule.includes('statutoryDueForPeriod(m.month)?.dueDate'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
