#!/usr/bin/env node
// verify-v2-280-0.mjs — the round's gate (v2.280.0 "the schedule keeps its appointment").
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
const svc = read('src/lib/hr/report-schedule-service.ts');
const voice = read('src/lib/hr/schedule-fire-voice.ts');
const tab = read('src/components/hr/report-schedules-tab.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/schedule-fire-v2280.test.ts');

console.log('— the release face —');
ok('pkg version = 2.280.0', pkg.version === '2.280.0');
ok('pkg releaseVersion = 2.280.0', pkg.mbumah?.releaseVersion === '2.280.0');
ok('pkg baseVersion = 2.280.0', pkg.mbumah?.baseVersion === '2.280.0');
ok('VERSION = 2.280.0', version === '2.280.0');
ok('whats-new lead = 2.280.0 with the round\u2019s title', feed.includes("version: '2.280.0',") && feed.includes('The schedule keeps its appointment'));
const leadIdx = feed.indexOf("version: '2.280.0',");
const pairIdx = feed.indexOf("version: '2.279.0',");
ok('whats-new pair order (lead 2.280.0 before pair 2.279.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.280.0]', changelog.includes('## [2.280.0] The schedule keeps its appointment'));
ok('the verify script is wired', pkg.scripts['verify:v2-280-0'] === 'node scripts/verify-v2-280-0.mjs');

console.log('— the ONE derivation (the seam) —');
ok('ScheduleView carries the appointment with its law named', svc.includes("// v2.280.0: the row's own appointment — nextScheduleRunAt derived at view") && svc.includes('nextRunAt: string | null;'));
ok('toScheduleView derives through nextScheduleRunAt — never a second math', svc.includes('nextRunAt: row.active ? nextScheduleRunAt(row).toISOString() : null,'));
ok('no second client math in the seam', !svc.includes('nextRunAt: new Date(') && !/nextRunAt:.*getUTC/.test(svc));
ok('the sweep\u2019s own law stands untouched (the v2.22 derivation byte)', svc.includes('const floor = Math.max(from.getTime(), schedule.lastRunAt?.getTime() ?? 0);'));

console.log('— the pure voice —');
ok('relativeFireLabel exists', voice.includes('export function relativeFireLabel(iso: string, nowMs: number): string {'));
ok('fireImminent exists', voice.includes('export function fireImminent(iso: string, nowMs: number): boolean {'));
ok('the floor lives once', (voice.match(/Math\.floor\(ms \/ 86_400_000\)/g) ?? []).length === 1);
ok('tomorrow is +1 (the 25-hour law the round\u2019s test caught)', voice.includes("if (days === 1) return 'tomorrow';") && voice.includes("if (days === -1) return 'yesterday';"));
ok('the honest absence for malformed instants', voice.includes("if (!Number.isFinite(t)) return '';"));
ok('the pure lib stays import-free (the client-bundle law)', !voice.match(/^import /m));

console.log('— the card: the appointment strip (mandatory \u2463) —');
ok('the tab imports the pure voice', tab.includes("import { fireImminent, relativeFireLabel } from '@/lib/hr/schedule-fire-voice';"));
ok('the row interface carries the appointment', tab.includes('nextRunAt: string | null;'));
ok('both strip faces carry their testids', (tab.match(/data-testid=\{`schedule-next-fire-\$\{s\.id\}`\}/g) ?? []).length === 2);
ok('both strip faces carry their states', tab.includes('data-state="scheduled"') && tab.includes('data-state="paused"'));
ok('the scheduled face speaks label, date, relative chip', tab.includes('<span className="font-medium">Next fire</span>') && tab.includes('{formatDate(s.nextRunAt)}') && tab.includes('{relativeFireLabel(s.nextRunAt, fireNowMs)}'));
ok('the sky family is the only new colour', tab.includes("'bg-sky-500' : 'bg-sky-300 dark:bg-sky-700'") && tab.includes('border-sky-200 bg-sky-50'));
ok('the paused face is the honest absence', tab.includes('<span>Paused — no fire while paused.</span>'));
ok('the fire ledger drops the seam only when the strip renders', tab.includes("(s.active ? s.nextRunAt : true) ? 'rounded-t-md border-b-0' : 'rounded-md'"));
ok('the last fire\u2019s verdict chip keeps its bytes', tab.includes('title="Date of the last scheduled fire. Manual sends update the status but never move the cadence."'));
ok('the empty state grew its own door', tab.includes('data-testid="schedules-empty-cta"') && tab.includes('Create the first schedule'));

console.log('— the tests and the truth bytes —');
ok('the suite pins the 25-hour-is-tomorrow law', test.includes("expect(relativeFireLabel('2026-11-02T11:00:00Z', NOW)).toBe('tomorrow');"));
ok('the suite pins the ONE-derivation agreement', test.includes('expect(view.nextRunAt).toBe(nextScheduleRunAt(row).toISOString());'));
ok('the suite pins the paused row\u2019s honest null', test.includes('expect(view.nextRunAt).toBeNull();'));
ok('the suite pins the malformed honest absence', test.includes("expect(relativeFireLabel('not-a-date', NOW)).toBe('');"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
