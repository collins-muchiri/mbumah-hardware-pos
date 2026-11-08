#!/usr/bin/env node
// verify-v2-282-0.mjs — the round's gate (v2.282.0 "the digest learns the goals").
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
const goals = read('src/lib/hr/goal-service.ts');
const svc = read('src/lib/hr/report-schedule-service.ts');
const tab = read('src/components/hr/report-schedules-tab.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/schedule-goals-v2282.test.ts');

console.log('— the release face —');
ok('pkg version = 2.282.0', pkg.version === '2.282.0');
ok('pkg releaseVersion = 2.282.0', pkg.mbumah?.releaseVersion === '2.282.0');
ok('pkg baseVersion = 2.282.0', pkg.mbumah?.baseVersion === '2.282.0');
ok('VERSION = 2.282.0', version === '2.282.0');
ok('whats-new lead = 2.282.0 with the round\u2019s title', feed.includes("version: '2.282.0',") && feed.includes('The digest learns the goals'));
const leadIdx = feed.indexOf("version: '2.282.0',");
const pairIdx = feed.indexOf("version: '2.281.0',");
ok('whats-new pair order (lead 2.282.0 before pair 2.281.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.282.0]', changelog.includes('## [2.282.0] The digest learns the goals'));
ok('the verify script is wired', pkg.scripts['verify:v2-282-0'] === 'node scripts/verify-v2-282-0.mjs');

console.log('— the goal pool\u2019s aggregate —');
ok('goalAttainmentReport exists', goals.includes('export async function goalAttainmentReport('));
ok('the scope rides employeeScopeWhere (the same governed scope listGoals obeys)', goals.includes('where: { deletedAt: null, employee: employeeScopeWhere(session) }'));
ok('no names ride the aggregate', !goals.slice(goals.indexOf('export async function goalAttainmentReport')).match(/firstName|lastName|employeeCode/));
ok('the strict clock boundary', goals.includes("if (g.status === 'OPEN' && g.dueDate != null && g.dueDate.getTime() < now.getTime()) overdue += 1;"));
ok('no fallthrough renaming', goals.includes('const bucket = buckets.get(g.status) ??') && !goals.includes("? g.status : 'OPEN'"));
ok('the Number()-per-row door', goals.includes('Number(g.targetValue ?? 0)') && goals.includes('Number(g.currentValue ?? 0)'));
ok('the rows march the vocabulary\u2019s own order', goals.includes('const rows: GoalAttainmentRow[] = GOAL_STATUSES.map((status) => {'));
ok('goalAttainmentPct is the ONE percentage, strict `> 0`', goals.includes('export function goalAttainmentPct(target: number, current: number): number | null {') && goals.includes('return target > 0 ? goalR1((current / target) * 100) : null;'));
ok('the fn never returns null (honest zeros)', !goals.slice(goals.indexOf('export async function goalAttainmentReport')).includes('return null;'));

console.log('— the digest case (the seam) —');
ok('the key joins the schedule reports', svc.includes("  'goal-attainment',\n] as const;"));
ok('the label and the CSV slug wear the goals name', svc.includes("'goal-attainment': 'Goal attainment',") && svc.includes("'goal-attainment': 'goals',"));
ok('the case aggregates with the fire instant', svc.includes('const r = await goalAttainmentReport(session, now);') && svc.includes("import { goalAttainmentReport } from './goal-service';"));
ok('the honest \u2014 face', svc.includes("const pctOrDash = (v: number | null) => (v == null ? '—' : `${Math.round(v * 10) / 10}%`);"));
ok('the headline order: tracked, attainment, achieved, missed, overdue', svc.indexOf("{ label: 'Tracked goals'") < svc.indexOf("{ label: 'Attainment'") && svc.indexOf("{ label: 'Attainment'") < svc.indexOf("{ label: 'Achieved'") && svc.indexOf("{ label: 'Achieved'") < svc.indexOf("{ label: 'Missed'") && svc.indexOf("{ label: 'Missed'") < svc.indexOf("{ label: 'Overdue'"));
ok('the table speaks the pool by status', svc.includes("caption: 'Goal pool by status',") && svc.includes("columns: ['Status', 'Goals', 'Target', 'Current', 'Attainment %'],"));
ok('the period label is the standing pool', svc.includes("periodLabel: 'All cycles — the standing pool',"));

console.log('— the card: the report\u2019s own glyph (mandatory \u2463) —');
ok('the select offers the goal digest', tab.includes("{ value: 'goal-attainment', label: 'Goal attainment (all cycles)' },"));
ok('the icon map covers every report with Target for goals', tab.includes('const REPORT_ICONS: Record<string, LucideIcon> = {') && tab.includes("'goal-attainment': Target,"));
ok('Mail stays the fallback', tab.includes('const Icon = REPORT_ICONS[reportKey] ?? Mail;'));
ok('the card header rides the map; the colour never varies', tab.includes('<ReportIcon reportKey={s.reportKey} />') && tab.includes("className ?? 'h-4 w-4 shrink-0 text-sky-500'"));
ok('the dialog\u2019s Would-email row keeps its Mail', (tab.match(/<Mail /g) ?? []).length === 1 && tab.includes('Would email'));

console.log('— the tests and the truth bytes —');
ok('the suite pins the zero-target honest null', test.includes('expect(goalAttainmentPct(0, 42)).toBeNull();'));
ok('the suite pins the negative denior', test.includes('expect(goalAttainmentPct(-5, 100)).toBeNull();'));
ok('the suite pins the r1 door', test.includes('expect(goalAttainmentPct(3, 1)).toBe(33.3);'));
ok('the suite pins the no-fallthrough law', test.includes("expect(fn).not.toContain(\"? g.status : 'OPEN'\");"));
ok('the suite pins the strict boundary', test.includes("expect(goalSrc).toContain(\"if (g.status === 'OPEN' && g.dueDate != null && g.dueDate.getTime() < now.getTime()) overdue += 1;\");"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
