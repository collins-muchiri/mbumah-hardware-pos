#!/usr/bin/env node
// verify-v2-279-0.mjs — the round's gate (v2.279.0 "the email hears the clock").
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
const schedule = read('src/lib/hr/report-schedule-service.ts');
const tpl = read('src/lib/email-templates.ts');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/digest-email-clock-v2279.test.ts');
const a2275 = read('src/tests/panel-portal-v2275.test.ts');
const a2278 = read('src/tests/digest-filings-v2278.test.ts');

console.log('— the release face —');
ok('pkg version = 2.279.0', pkg.version === '2.279.0');
ok('pkg releaseVersion = 2.279.0', pkg.mbumah?.releaseVersion === '2.279.0');
ok('pkg baseVersion = 2.279.0', pkg.mbumah?.baseVersion === '2.279.0');
ok('VERSION = 2.279.0', version === '2.279.0');
ok('whats-new lead = 2.279.0 with the round\u2019s title', feed.includes("version: '2.279.0',") && feed.includes('The email hears the clock'));
const leadIdx = feed.indexOf("version: '2.279.0',");
const pairIdx = feed.indexOf("version: '2.278.0',");
ok('whats-new pair order (lead 2.279.0 before pair 2.278.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.279.0]', changelog.includes('## [2.279.0] The email hears the clock'));
ok('the verify script is wired', pkg.scripts['verify:v2-279-0'] === 'node scripts/verify-v2-279-0.mjs');

console.log('— the ONE window gate —');
ok('the open day-key helper exists', cal.includes('export function filingWindowOpenDay(month: string): number | null {'));
ok('the voice rides the ONE gate', cal.includes('const openDay = filingWindowOpenDay(month);') && cal.includes('utcDayKey(now) < openDay'));
ok('the voice\u2019s old inline math is retired', !cal.includes("const openDay = utcDayKey(new Date(`${opens}T00:00:00Z`));"));
ok('the ISO helper keeps its own bytes (the v2.278 pin stands)', cal.includes('const due = statutoryDueForPeriod(month);') && cal.includes('return `${due.dueDate.slice(0, 7)}-01`;'));

console.log('— the paired faces —');
ok('digestFilingComplete exists on the pure home', cal.includes('export function digestFilingComplete(') && cal.includes('return filed === total;'));
ok('the complete face shares the gate and the clamp', (cal.match(/const openDay = filingWindowOpenDay\(month\);/g) ?? []).length === 2 && (cal.match(/Math.max\(0, Math.min\(total, Math.floor\(Number\(counts.filed\) \|\| 0\)\)\)/g) ?? []).length === 2);
ok('the clock chip exists', cal.includes('export function digestNextDeadlineChip(now: Date): { label: string; value: string } | null {') && cal.includes('`${first.dueLabel} \u00b7 ${first.periodLabel} payroll`'));
ok('the chip derives from the calendar\u2019s own first obligation', cal.includes('const first = complianceCalendar(now).obligations[0];'));
ok('the pure lib stays import-free (the client-bundle law)', !cal.match(/^import /m));

console.log('— the builder: chip first, marks beside —');
ok('the chip is computed once, spread once', schedule.includes('const clock = digestNextDeadlineChip(now);') && schedule.includes('...(clock ? [clock] : []),'));
ok('no double derivation of the chip', !schedule.includes('digestNextDeadlineChip(now) ? [digestNextDeadlineChip(now)'));
ok('goodCells are the complete-test\u2019s coordinates at column 7', schedule.includes('digestFilingComplete(m.month, r.filings ? r.filings[m.month] ?? null : null, now) ? [i, 7] : null') && schedule.includes('.filter((c): c is [number, number] => c !== null)'));
ok('the v2.278 rows bytes stand untouched', schedule.includes("columns: ['Month', 'PAYE', 'NSSF', 'SHIF', 'AHL', 'Total', 'Due by', 'Filed']") && schedule.includes('digestFilingVoice(m.month, r.filings ? r.filings[m.month] ?? null : null, now)'));
ok('the paired faces import from the ONE home', schedule.includes("import { digestFilingComplete, digestFilingVoice, digestNextDeadlineChip, statutoryDueForPeriod } from '@/lib/hr/compliance-calendar';"));

console.log('— the email face (mandatory \u2463) —');
ok('goodCells are coordinates on the table type, optional', tpl.includes('goodCells?: Array<[number, number]>;'));
ok('the marked cell wears BRAND.primaryDark at weight 600', tpl.includes('color:${BRAND.primaryDark};font-weight:600;'));
ok('the mark reads coordinates, never strings', tpl.includes('data.table?.goodCells?.some((rc) => rc[0] === rowIdx && rc[1] === colIdx)'));
ok('the column offset keeps its honest arithmetic', tpl.includes('colIdx > 0'));
ok('no string-sniffing of the voice in the template', !tpl.includes("startsWith('4 of 4"));

console.log('— the tests and the ancestors —');
ok('the round\u2019s suite pins the agreement law as a truth table', test.includes('digestFilingComplete(c.month, c.counts, NOW)).toBe(voice.startsWith(\u00274 of 4 filed\u0027))'));
ok('the suite pins the chip\u2019s honest date pairs', test.includes("'9 October 2026 \u00b7 September 2026 payroll'") && test.includes("'9 November 2026 \u00b7 October 2026 payroll'"));
ok('the suite pins the byte-identical no-goodCells render', test.includes('expect(html).not.toContain(\u0027font-weight:600;\u0027)'));
ok('v2275\u2019s import pin wears the paired faces (deliberate evolution)', a2275.includes('import { digestFilingComplete, digestFilingVoice, digestNextDeadlineChip, statutoryDueForPeriod }') && a2275.includes('v2.279.0 (deliberate evolution)'));
ok('v2278\u2019s seam pins still stand', a2278.includes("'Due by', 'Filed']"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
