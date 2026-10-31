#!/usr/bin/env node
// verify-v2-306-0.mjs — the round's gate (v2.306.0 "The pools speak at their desks").
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
const pool = read('src/lib/hr/pool-voice.ts');
const goalSvc = read('src/lib/hr/goal-service.ts');
const perfSvc = read('src/lib/hr/performance-service.ts');
const schedSvc = read('src/lib/hr/report-schedule-service.ts');
const tab = read('src/components/hr/report-schedules-tab.tsx');
const page = read('src/app/(shell)/hr/performance/page.tsx');
const ui = read('src/components/hr/self-service-ui.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/pool-voice-v2306.test.ts');

console.log('— the release face —');
ok('pkg version = 2.306.0 (all three slots)', pkg.version === '2.306.0' && pkg.mbumah?.releaseVersion === '2.306.0' && pkg.mbumah?.baseVersion === '2.306.0');
ok('VERSION = 2.306.0', version === '2.306.0');
ok('whats-new lead = 2.306.0 with the round\u2019s title', feed.includes("version: '2.306.0',") && feed.includes('The pools speak at their desks'));
const leadIdx = feed.indexOf("version: '2.306.0',");
ok('the lead entry sits FIRST (newest above all)', leadIdx >= 0 && feed.indexOf('version:') < leadIdx);
ok('CHANGELOG carries [2.306.0] above [2.305.0]', changelog.indexOf('[2.306.0]') >= 0 && changelog.indexOf('[2.306.0]') < changelog.indexOf('[2.305.0]'));

console.log('— the pure seam (pool-voice.ts) —');
ok('the lib stays PURE (zero imports)', (pool.match(/^import /gm) || []).length === 0 && !pool.includes("from '"));
ok('the vocabularies live here (all three)', pool.includes("export const GOAL_STATUSES = ['OPEN', 'ACHIEVED', 'MISSED', 'CLOSED'] as const;") && pool.includes("export const REVIEW_STATUSES = ['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'CALIBRATED'] as const;") && pool.includes("export const CYCLE_STATUSES = ['DRAFT', 'ACTIVE', 'CLOSED'] as const;"));
ok('the ONE attainment percentage (the strict > 0 denior)', pool.includes('return target > 0 ? r1((current / target) * 100) : null;'));
ok('the ONE share percentage (the <= 0 denior)', pool.includes('if (whole <= 0) return null;'));
ok('the ONE pct face (the em-dash voice)', pool.includes("return v == null ? '—' : `${Math.round(v * 10) / 10}%`;"));
ok('the goal band aggregate exists', pool.includes('export function poolBandFromGoals(') && pool.includes('attainmentPct: goalAttainmentPct(targetSum, currentSum),'));
ok('the cycles band aggregate exists (counts only)', pool.includes('export function poolBandFromCycles('));
ok('the STRICT overdue clock', pool.includes('if (!Number.isNaN(due) && due < nowMs) overdue += 1;'));
ok('the STRICT unclosed clock (the report\u2019s own law)', pool.includes('if (!Number.isNaN(end) && end < nowMs) unclosedWindows += 1;'));
ok('the no-fallthrough bucket law', pool.includes('function bucketRows(') && pool.includes('if (!known.has(word)) rows.push({ status: word, count: counts.get(word) ?? 0 });'));
ok('the colour map rides here (nine words)', (pool.match(/^  [A-Z_]+: '/gm) || []).length === 9);

console.log('— the move (one body, many seams) —');
ok('goal-service re-exports the percentage and the vocabulary', goalSvc.includes("export { goalAttainmentPct } from './pool-voice';") && goalSvc.includes("export { GOAL_STATUSES } from './pool-voice';"));
ok('the old percentage body is GONE from goal-service', !goalSvc.includes('return target > 0 ? goalR1((current / target) * 100) : null;'));
ok('performance-service re-exports its seam', perfSvc.includes("export { CYCLE_STATUSES, REVIEW_STATUSES, reviewCyclePct } from './pool-voice';"));
ok('the old share body is GONE from performance-service', !perfSvc.includes('return Math.round((part / whole) * 1000) / 10;'));
ok('both digest cases say percentages through the ONE voice', schedSvc.includes("import { poolPctVoice } from './pool-voice';") && schedSvc.includes('poolPctVoice(r.attainmentPct)') && schedSvc.includes('poolPctVoice(s.sharePct)') && !schedSvc.includes('pctOrDash'));
ok('the schedules desk aliases the map (the ancestor seam intact)', tab.includes('const DIGEST_STATUS_CHIP: Record<string, string> = POOL_STATUS_CHIP;'));

console.log('— the bands (performance page, mandatory 4) —');
ok('the page imports the pool voice (values + the type)', page.includes("} from '@/lib/hr/pool-voice';") && page.includes("import type { PoolStatusCount } from '@/lib/hr/pool-voice';"));
ok('the page-local vocabulary duplicates are GONE', !page.includes("const GOAL_STATUSES = ['OPEN', 'ACHIEVED', 'MISSED', 'CLOSED'] as const;") && !page.includes("const REVIEW_STATUSES = ['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'CALIBRATED'] as const;"));
ok('the bands ride the UNFILTERED pool, each with its own recompute clock', page.includes('poolBandFromGoals(goals, new Date())') && page.includes('poolBandFromCycles(cycles, reviews, new Date())'));
ok('both bands render and only over a non-empty pool', page.includes('data-testid="goal-pool-band"') && page.includes('data-testid="cycle-pool-band"') && page.includes('goals && goals.length > 0 ? poolBandFromGoals(goals, new Date()) : null'));
ok('the goal band speaks the digest\u2019s own labels', page.includes('<PoolStat label="Tracked goals" value={String(goalPoolBand.tracked)} />') && page.includes('<PoolStat label="Attainment" value={poolPctVoice(goalPoolBand.attainmentPct)} />'));
ok('the cycles band speaks counts only', page.includes('<PoolStat label="Tracked cycles" value={String(cyclePoolBand.trackedCycles)} />') && page.includes('label="Unclosed windows"') && page.includes('<PoolStat label="Tracked reviews" value={String(cyclePoolBand.trackedReviews)} />'));
ok('the unknown word speaks itself in plain text', page.includes('const chip = poolStatusChip(s.status);') && page.includes('{s.status} {s.count}'));
ok('the scope notes name the digest and the rows', page.includes('The same aggregate the goal-attainment digest emails') && page.includes('The same counts the review-cycles digest emails'));
ok('the OPEN filter chip aligns — the old sky is gone', page.includes("OPEN: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900'") && !page.includes("OPEN: 'bg-sky-100"));
ok('the tabular numerals ride the stat pairs', page.includes('text-sm font-semibold tabular-nums'));

console.log('— the one colour law, completed —');
ok('the table pill joins: OPEN = warn (amber)', /case 'OPEN':[\s\S]{0,600}return 'warn';/.test(ui));
ok('the digest map\u2019s home is the pure seam', pool.includes('export const POOL_STATUS_CHIP') && tab.includes("import { POOL_STATUS_CHIP } from '@/lib/hr/pool-voice';"));

console.log('— the tests —');
ok('the round\u2019s test file exists and carries both nets', test.includes('describe') && test.includes('poolBandFromGoals') && test.includes('BYTE net') && test.includes('RUNTIME pins'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
