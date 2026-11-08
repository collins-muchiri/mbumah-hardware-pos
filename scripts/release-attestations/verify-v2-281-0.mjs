#!/usr/bin/env node
// verify-v2-281-0.mjs — the round's gate (v2.281.0 "the card remembers its deliveries").
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
const voice = read('src/lib/hr/schedule-health-voice.ts');
const tab = read('src/components/hr/report-schedules-tab.tsx');
const route = read('src/app/api/hr/reports/schedules/route.ts');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/schedule-health-v2281.test.ts');

console.log('— the release face —');
ok('pkg version = 2.281.0', pkg.version === '2.281.0');
ok('pkg releaseVersion = 2.281.0', pkg.mbumah?.releaseVersion === '2.281.0');
ok('pkg baseVersion = 2.281.0', pkg.mbumah?.baseVersion === '2.281.0');
ok('VERSION = 2.281.0', version === '2.281.0');
ok('whats-new lead = 2.281.0 with the round\u2019s title', feed.includes("version: '2.281.0',") && feed.includes('The card remembers its deliveries'));
const leadIdx = feed.indexOf("version: '2.281.0',");
const pairIdx = feed.indexOf("version: '2.280.0',");
ok('whats-new pair order (lead 2.281.0 before pair 2.280.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.281.0]', changelog.includes('## [2.281.0] The card remembers its deliveries'));
ok('the verify script is wired', pkg.scripts['verify:v2-281-0'] === 'node scripts/verify-v2-281-0.mjs');

console.log('— the pure voice (the card\u2019s delivery memory) —');
ok('deriveSendOutcome exists', voice.includes('export function deriveSendOutcome(status: string, hasError: boolean): ScheduleSendOutcome {'));
ok('the partial law is the SENT+error branch', voice.includes("if (status === 'SENT') return hasError ? 'partial' : 'delivered';"));
ok('the benefit of the doubt is the fall-through', voice.includes("if (status === 'FAILED') return 'failed';") && voice.includes("return 'pending';"));
ok('scheduleIdFromMetadata exists (the ONE parse)', voice.includes('export function scheduleIdFromMetadata(metadata: string | null): string | null {'));
ok('aggregateScheduleHealth exists', voice.includes('export function aggregateScheduleHealth('));
ok('scheduleHealthVoice exists', voice.includes('export function scheduleHealthVoice('));
ok('the singular keeps its plain form', voice.includes("window === 1 ? 'across the last send' : `across the last ${window} sends`;"));
ok('the honest absence: no rows → null', voice.includes('if (rows.length === 0) return null;'));
ok('the window is five', voice.includes('export const HEALTH_WINDOW = 5;'));
ok('the log cap is 250', voice.includes('export const HEALTH_LOG_CAP = 250;'));
ok('the pure lib stays import-free (the client-bundle law)', !voice.match(/^import /m));
ok('the entries sort newest-first by the ISO string', voice.includes('.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))'));

console.log('— the governed read (the seam) —');
ok('listSchedulesView exists', svc.includes('export async function listSchedulesView(organizationId: string): Promise<ScheduleView[]> {'));
ok('the OR-of-contains correlation is scope-shaped BY CONSTRUCTION', svc.includes('OR: rows.map((r) => ({ metadata: { contains: `"scheduleId":"${r.id}"` } }))'));
ok('the read is bounded and ordered', svc.includes('take: HEALTH_LOG_CAP') && svc.includes("orderBy: { createdAt: 'desc' }"));
ok('the metadata is parsed once per row', svc.includes('scheduleIdFromMetadata(l.metadata)'));
ok('the pure voice aggregates per schedule', svc.includes('aggregateScheduleHealth(flattened, r.id, HEALTH_WINDOW)'));
ok('health attaches ONLY where sends exist', svc.includes('return health ? { ...view, health } : view;'));
ok('the catch-quiet law: a failing log read returns the bare list', /} catch \{\s*\n\s*return rows\.map\(toScheduleView\);/.test(svc));
ok('toScheduleView stays pure of the log read', !svc.slice(svc.indexOf('export function toScheduleView'), svc.indexOf('export async function listSchedulesView')).includes('health'));
ok('ScheduleView carries the optional face', svc.includes('health?: ScheduleHealth;'));
ok('the voice import rides the service', svc.includes("from '@/lib/hr/schedule-health-voice'"));

console.log('— the route —');
ok('GET serves the view (health included)', route.includes('await listSchedulesView(session.organizationId)') && route.includes('data: rows'));
ok('the bare-list shape is gone', !route.includes('rows.map(toScheduleView)'));
ok('toScheduleView stays imported for the write flows', route.includes('toScheduleView,'));

console.log('— the card: the always-on strip (mandatory \u2463) —');
ok('the tab imports the TYPE only', tab.includes("import type { ScheduleHealth } from '@/lib/hr/schedule-health-voice';"));
ok('the strip renders from s.health alone', tab.includes('{s.health ? (') && tab.includes('data-testid={`schedule-health-${s.id}`}') && tab.includes('data-window={String(s.health.window)}'));
ok('the dots render oldest-left (the voice\u2019s order, reversed for reading)', tab.includes('[...s.health.entries].reverse().map((entry, idx) => (') && tab.includes('data-testid={`schedule-health-dot-${s.id}-${idx}`}'));
ok('the colour collision retires (partial amber, pending slate)', tab.includes("partial: 'bg-amber-500',") && tab.includes("pending: 'bg-slate-400 dark:bg-slate-500',") && !tab.includes('bg-amber-400'));
ok('the four families live in ONE map', (tab.match(/HEALTH_DOT_STYLES\[entry\.outcome\]/g) ?? []).length === 1 && tab.includes("delivered: 'bg-emerald-500',") && tab.includes("failed: 'bg-rose-500',"));
ok('the voice is spoken as real text', tab.includes('{s.health.voice}</span>'));
ok('the dots keep their titles and stay aria-hidden', tab.includes('title={`${entry.outcome} · ${formatDate(entry.createdAt)}`}') && tab.includes('aria-hidden'));
ok('the v2.25 lazy dots row retires', !tab.includes('function healthDots') && !tab.includes('function deliveryDotClass') && !tab.includes('const DOT_STYLES'));
ok('the strip\u2019s invitation names the deeper surface', tab.includes('open Delivery history for the full per-recipient detail'));

console.log('— the tests and the truth bytes —');
ok('the suite pins the partial law', test.includes("expect(deriveSendOutcome('SENT', true)).toBe('partial');"));
ok('the suite pins the singular form', test.includes("expect(scheduleHealthVoice({ delivered: 0, partial: 0, failed: 1, pending: 0 }, 1)).toBe(\n      '1 failed across the last send',\n    );"));
ok('the suite pins the honest absence', test.includes("expect(aggregateScheduleHealth([], 's1')).toBeNull();"));
ok('the suite pins the window cap keeping the newest', test.includes("expect(health?.entries.at(-1)?.createdAt).toBe('2026-10-26T02:00:00.000Z');"));
ok('the suite pins the retirement', test.includes("expect(tabSrc).not.toContain('function healthDots');"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
