#!/usr/bin/env node
// verify-v2-283-0.mjs — the round's gate (v2.283.0 "the cycles join the digest").
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
const perf = read('src/lib/hr/performance-service.ts');
const svc = read('src/lib/hr/report-schedule-service.ts');
const tab = read('src/components/hr/report-schedules-tab.tsx');
const desk = read('src/app/(shell)/hr/performance/page.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/schedule-reviews-v283.test.ts');

console.log('— the release face —');
ok('pkg version = 2.283.0', pkg.version === '2.283.0');
ok('pkg releaseVersion = 2.283.0', pkg.mbumah?.releaseVersion === '2.283.0');
ok('pkg baseVersion = 2.283.0', pkg.mbumah?.baseVersion === '2.283.0');
ok('VERSION = 2.283.0', version === '2.283.0');
ok('whats-new lead = 2.283.0 with the round\u2019s title', feed.includes("version: '2.283.0',") && feed.includes('The cycles join the digest'));
const leadIdx = feed.indexOf("version: '2.283.0',");
const pairIdx = feed.indexOf("version: '2.282.0',");
ok('whats-new pair order (lead 2.283.0 before pair 2.282.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.283.0]', changelog.includes('## [2.283.0] The cycles join the digest'));
ok('the verify script is wired', pkg.scripts['verify:v2-283-0'] === 'node scripts/verify-v2-283-0.mjs');

console.log('— the review pool\u2019s aggregate —');
ok('reviewCycleReport exists', perf.includes('export async function reviewCycleReport('));
ok('the scope rides the organization (the same governed scope listCycles obeys)', perf.includes('where: { deletedAt: null, organizationId: session.organizationId }') && perf.includes('where: { deletedAt: null, cycle: { deletedAt: null, organizationId: session.organizationId } }'));
ok('the standing pool, NOT the console page size', !perf.slice(perf.indexOf('export async function reviewCycleReport'), perf.indexOf('export async function createCycle')).includes('take: 60'));
ok('COUNTS ONLY — no rating enters the aggregate', !perf.slice(perf.indexOf('export async function reviewCycleReport'), perf.indexOf('export async function createCycle')).match(/overallRating|strengths|improvements|_avg|average/i));
ok('no fallthrough renaming', perf.includes('reviewBuckets.set(r.status, (reviewBuckets.get(r.status) ?? 0) + 1);') && !perf.includes("? r.status : 'DRAFT'"));
ok('the strict clock boundary (unclosed windows)', perf.includes("if (c.status === 'ACTIVE' && c.periodEnd.getTime() < now.getTime()) unclosedWindows += 1;"));
ok('the rows march REVIEW_STATUSES\u2019 own order', perf.includes('const rows: ReviewCycleRow[] = REVIEW_STATUSES.map((status) => ({'));
ok('reviewCyclePct is the ONE share, strict denior', perf.includes('export function reviewCyclePct(part: number, whole: number): number | null {') && perf.includes('if (whole <= 0) return null;'));
ok('the fn never returns null (honest zeros)', !perf.slice(perf.indexOf('export async function reviewCycleReport'), perf.indexOf('export async function createCycle')).includes('return null;'));

console.log('— the digest case (the seam) —');
ok('the key joins the schedule reports', svc.includes("  'review-cycles',\n] as const;"));
ok('the label wears the review name', svc.includes("'review-cycles': 'Review cycles',"));
ok('the case aggregates with the fire instant', svc.includes('const r = await reviewCycleReport(session, now);') && svc.includes("import { reviewCycleReport } from './performance-service';"));
ok('the honest \u2014 face', svc.includes("const pctOrDash = (v: number | null) => (v == null ? '—' : `${Math.round(v * 10) / 10}%`);"));
ok('the headline order: cycles, active, reviews, awaiting, calibrated, unclosed', svc.indexOf("{ label: 'Tracked cycles'") < svc.indexOf("{ label: 'Active cycles'") && svc.indexOf("{ label: 'Active cycles'") < svc.indexOf("{ label: 'Tracked reviews'") && svc.indexOf("{ label: 'Tracked reviews'") < svc.indexOf("{ label: 'Awaiting acknowledgement'") && svc.indexOf("{ label: 'Awaiting acknowledgement'") < svc.indexOf("{ label: 'Calibrated'") && svc.indexOf("{ label: 'Calibrated'") < svc.indexOf("{ label: 'Unclosed windows'"));
ok('the table speaks the review pool by status with the honest share', svc.includes("caption: 'Review pool by status',") && svc.includes("columns: ['Status', 'Reviews', 'Share %'],"));
ok('the standing-pool period label rides both pool digests', (svc.match(/periodLabel: 'All cycles — the standing pool',/g) ?? []).length === 2);

console.log('— the deep link (the desk, not the reports table) —');
ok('the tab map stays total', svc.includes("'review-cycles': 'reviews',"));
ok('the URL override wins for review-cycles', svc.includes("'review-cycles': '/hr/performance?tab=reviews',") && svc.includes('export const REPORT_KEY_TO_URL: Partial<Record<HrScheduleReportKey, string>>'));
ok('the builder consults the override FIRST', svc.indexOf('const override = REPORT_KEY_TO_URL') > -1 && svc.indexOf('const override = REPORT_KEY_TO_URL') < svc.indexOf('const tab = REPORT_KEY_TO_TAB'));
ok('storeId appends only when present (never a bare storeId=null)', svc.includes("const storeIdQs = params.storeId ? `${override?.includes('?') ? '&' : '?'}storeId=${params.storeId}` : '';"));
ok('the performance desk reads ?tab= and only a KNOWN tab id lands (deferred, directive-free)', desk.includes("const requested = new URLSearchParams(window.location.search).get('tab');") && desk.includes("if (requested !== 'cycles' && requested !== 'reviews' && requested !== 'goals') return;") && desk.includes('const t = window.setTimeout(() => setTab(requested), 0);') && !desk.includes('eslint-disable'));

console.log('— the card + the preview\u2019s face (mandatory \u2463) —');
ok('the select offers the review digest', tab.includes("{ value: 'review-cycles', label: 'Review cycles (all cycles)' },"));
ok('the review pool wears the clipboard glyph', tab.includes("'review-cycles': ClipboardCheck,") && tab.includes('ClipboardCheck,'));
ok('the preview strip wears the report\u2019s own glyph', tab.includes('<ReportIcon reportKey={preview.schedule.reportKey} />'));
ok('the label column chips KNOWN lifecycle words only', tab.includes('const DIGEST_STATUS_CHIP: Record<string, string> = {') && tab.includes('{ci === 0 ? <DigestStatusCell word={cell} /> : cell}') && tab.includes('if (!chip) return <>{word}</>;'));
ok('nine words, five borrowed families', (() => { const b = tab.slice(tab.indexOf('const DIGEST_STATUS_CHIP'), tab.indexOf('function DigestStatusCell')); const c = [...b.matchAll(/'((?:bg|text|border)-[^']+)'/g)].map((m) => m[1]); return c.length === 9 && new Set(c).size === 5; })());
ok('numeric columns right-align under their own headers', tab.includes("ci > 0 ? 'text-right' : ''") && tab.includes("ci === 0 ? 'font-medium' : 'tabular-nums text-right'"));
ok('the dialog\u2019s Would-email row keeps its Mail', (tab.match(/<Mail /g) ?? []).length === 1 && tab.includes('Would email'));

console.log('— the tests and the truth bytes —');
ok('the suite pins the empty-pool honest null', test.includes('expect(reviewCyclePct(3, 0)).toBeNull();'));
ok('the suite pins the negative denior', test.includes('expect(reviewCyclePct(2, -4)).toBeNull();'));
ok('the suite pins the r1 door', test.includes('expect(reviewCyclePct(2, 3)).toBe(66.7);'));
ok('the suite pins the counts-only law', test.includes("expect(fn).not.toMatch(/overallRating|strengths|improvements|_avg|average/i);"));
ok('the suite pins the strict boundary', test.includes("expect(perfSrc).toContain(\"if (c.status === 'ACTIVE' && c.periodEnd.getTime() < now.getTime()) unclosedWindows += 1;\");"));
ok('the suite pins the deep-link override', test.includes("expect(REPORT_KEY_TO_URL['review-cycles']).toBe('/hr/performance?tab=reviews');"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
