// v2.280.0 — the schedule keeps its appointment.
//
//   - THE APPOINTMENT: the Schedules card has always spoken its LAST fire
//     (status chip + date); the NEXT fire hid inside the preview dialog.
//     The row view now carries nextRunAt — derived server-side through
//     nextScheduleRunAt (the ONE derivation the nightly sweep and the
//     preview already obey), so the card's appointment can never disagree
//     with the cron's own math.
//   - THE HONEST ABSENCE: a paused schedule has no next fire — null, and
//     the card wears the paused face ("no fire while paused"), never a
//     guessed instant. The document's-answer law, schedule edition.
//   - THE RELATIVE VOICE: "today" / "tomorrow" / "in N days" by the
//     UTC-midnight floor law (25 hours ahead is TOMORROW, never "in 2
//     days") — the same calendar arithmetic the filing voice obeys.
//   - THE SKY FAMILY: the imminent dot rides the schedule's own colour
//     (the card icon and header gradient already live there); held tone
//     when the fire lands today or tomorrow, quiet otherwise. Colour
//     never means two things — emerald/rose/amber stay the verdicts.
//   - THE RUNTIME-PIN LAW (the fourth net): the derivation agreement and
//     the relative voice are exactly the truth bytes a byte-pin alone
//     cannot catch — both nets, every round.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { toScheduleView, nextScheduleRunAt } from '@/lib/hr/report-schedule-service';
import { relativeFireLabel, fireImminent, utcDayKey } from '@/lib/hr/schedule-fire-voice';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const svcSrc = read('src/lib/hr/report-schedule-service.ts');
const tabSrc = read('src/components/hr/report-schedules-tab.tsx');
const voiceSrc = read('src/lib/hr/schedule-fire-voice.ts');

// ── the relative voice (RUNTIME pins) ──

describe('relativeFireLabel — the UTC calendar-day law', () => {
  const NOW = Date.parse('2026-11-01T10:00:00Z');

  it('the day key is the ONE floor — midnight UTC', () => {
    expect(utcDayKey(Date.parse('2026-11-01T00:00:00Z'))).toBe(utcDayKey(Date.parse('2026-11-01T23:59:59Z')));
    expect(utcDayKey(Date.parse('2026-11-01T23:59:59Z')) + 1).toBe(utcDayKey(Date.parse('2026-11-02T00:00:00Z')));
  });

  it('today, tomorrow, yesterday — by day key, never by elapsed hours', () => {
    expect(relativeFireLabel('2026-11-01T23:50:00Z', NOW)).toBe('today');
    // 25 hours ahead — the calendar says tomorrow, never "in 2 days"
    expect(relativeFireLabel('2026-11-02T11:00:00Z', NOW)).toBe('tomorrow');
    expect(relativeFireLabel('2026-11-01T10:00:00Z', Date.parse('2026-11-02T09:00:00Z'))).toBe('yesterday');
  });

  it('the wider marches speak their counts', () => {
    expect(relativeFireLabel('2026-11-03T10:00:00Z', NOW)).toBe('in 2 days');
    expect(relativeFireLabel('2026-11-08T10:00:00Z', NOW)).toBe('in 7 days');
    expect(relativeFireLabel('2026-10-30T10:00:00Z', NOW)).toBe('2 days ago');
  });

  it('the midnight edges stay honest', () => {
    // the fire at 00:00:00.000 of the current day IS today
    expect(relativeFireLabel('2026-11-01T00:00:00.000Z', NOW)).toBe('today');
    // 0.001s before the floor of yesterday — still yesterday's key
    expect(relativeFireLabel('2026-10-31T23:59:59.999Z', NOW)).toBe('yesterday');
  });

  it('a malformed instant keeps the honest absence — empty, never a guess', () => {
    expect(relativeFireLabel('not-a-date', NOW)).toBe('');
    expect(relativeFireLabel('', NOW)).toBe('');
  });
});

describe('fireImminent — the sky dot\u2019s gate', () => {
  const NOW = Date.parse('2026-11-01T10:00:00Z');

  it('today and tomorrow hold the tone', () => {
    expect(fireImminent('2026-11-01T23:00:00Z', NOW)).toBe(true);
    expect(fireImminent('2026-11-02T02:00:00Z', NOW)).toBe(true);
  });

  it('the wider future and the past stay quiet', () => {
    expect(fireImminent('2026-11-03T10:00:00Z', NOW)).toBe(false);
    expect(fireImminent('2026-11-09T02:00:00Z', NOW)).toBe(false);
    expect(fireImminent('2026-10-30T10:00:00Z', NOW)).toBe(false);
  });

  it('a malformed instant is never imminent', () => {
    expect(fireImminent('nope', NOW)).toBe(false);
  });
});

// ── the ONE derivation (RUNTIME pins) ──

const baseRow = {
  id: 'sched_test_1',
  reportKey: 'statutory-liability',
  frequency: 'WEEKLY',
  recipients: '["finance@mbumahhardware.co.ke"]',
  weekday: 1,
  dayOfMonth: null,
  hourUtc: 2,
  active: true,
  lastRunAt: null as Date | null,
  lastStatus: null as string | null,
  lastError: null as string | null,
  createdAt: new Date('2026-10-01T00:00:00Z'),
  storeId: null as string | null,
};

describe('toScheduleView — the appointment rides the ONE derivation', () => {
  it('the view\u2019s nextRunAt IS nextScheduleRunAt\u2019s answer — byte for byte', () => {
    const row = { ...baseRow, lastRunAt: new Date('2026-10-26T02:00:00Z') };
    const view = toScheduleView(row);
    expect(view.nextRunAt).toBe(nextScheduleRunAt(row).toISOString());
    // and it is a real future Monday at the schedule's own hour
    const next = new Date(view.nextRunAt as string);
    expect(next.getUTCDay()).toBe(1);
    expect(next.getUTCHours()).toBe(2);
    expect(next.getTime()).toBeGreaterThan(Date.now());
  });

  it('the other cadences agree too (daily and monthly)', () => {
    const daily = { ...baseRow, frequency: 'DAILY', weekday: null, hourUtc: 5, lastRunAt: new Date('2026-10-30T05:00:00Z') };
    expect(toScheduleView(daily).nextRunAt).toBe(nextScheduleRunAt(daily).toISOString());
    const monthly = { ...baseRow, frequency: 'MONTHLY', weekday: null, dayOfMonth: 9, lastRunAt: new Date('2026-09-09T02:00:00Z') };
    expect(toScheduleView(monthly).nextRunAt).toBe(nextScheduleRunAt(monthly).toISOString());
    const monthlyNext = new Date(toScheduleView(monthly).nextRunAt as string);
    expect(monthlyNext.getUTCDate()).toBe(9);
  });

  it('a never-fired active row still speaks — the cadence is real before the first fire', () => {
    const view = toScheduleView(baseRow);
    expect(view.nextRunAt).not.toBeNull();
    expect(new Date(view.nextRunAt as string).getTime()).toBeGreaterThan(Date.now());
  });

  it('a paused schedule keeps the honest absence — null, never a guess', () => {
    const view = toScheduleView({ ...baseRow, active: false, lastRunAt: new Date('2026-10-26T02:00:00Z') });
    expect(view.nextRunAt).toBeNull();
  });
});

// ── byte pins — the seam and the card ──

describe('the service seam — one derivation, one honest absence', () => {
  it('ScheduleView carries the appointment with its law named', () => {
    expect(svcSrc).toContain("// v2.280.0: the row's own appointment — nextScheduleRunAt derived at view");
    expect(svcSrc).toContain('nextRunAt: string | null;');
  });

  it('toScheduleView derives through nextScheduleRunAt — never a second math', () => {
    expect(svcSrc).toContain('nextRunAt: row.active ? nextScheduleRunAt(row).toISOString() : null,');
    expect(svcSrc).not.toMatch(/nextRunAt:.*getUTC/);
  });

  it('the paused row\u2019s null is chosen at the seam, not the client', () => {
    expect(svcSrc).toContain('row.active ?');
  });
});

describe('the card — the appointment strip', () => {
  it('the tab imports the pure voice', () => {
    expect(tabSrc).toContain("import { fireImminent, relativeFireLabel } from '@/lib/hr/schedule-fire-voice';");
  });

  it('the row interface carries the appointment', () => {
    expect(tabSrc).toContain('nextRunAt: string | null;');
  });

  it('both strip faces carry their testids and states', () => {
    expect((tabSrc.match(/data-testid=\{`schedule-next-fire-\$\{s\.id\}`\}/g) ?? []).length).toBe(2);
    expect(tabSrc).toContain('data-state="scheduled"');
    expect(tabSrc).toContain('data-state="paused"');
  });

  it('the scheduled face speaks the label, the date and the relative chip', () => {
    expect(tabSrc).toContain('<span className="font-medium">Next fire</span>');
    expect(tabSrc).toContain('{formatDate(s.nextRunAt)}');
    expect(tabSrc).toContain('{relativeFireLabel(s.nextRunAt, fireNowMs)}');
    expect(tabSrc).toContain('fireImminent(s.nextRunAt, fireNowMs)');
  });

  it('the sky family is the only new colour — the verdicts keep their families', () => {
    expect(tabSrc).toContain("'bg-sky-500' : 'bg-sky-300 dark:bg-sky-700'");
    expect(tabSrc).toContain('border-sky-200 bg-sky-50');
  });

  it('the paused face is the honest absence', () => {
    expect(tabSrc).toContain('<span>Paused — no fire while paused.</span>');
  });

  it('the fire ledger drops the seam border only when the strip renders beneath', () => {
    expect(tabSrc).toContain("(s.active ? s.nextRunAt : true) ? 'rounded-t-md border-b-0' : 'rounded-md'");
  });

  it('the appointment\u2019s now is the fetch\u2019s own instant — never a render-time clock read (the purity law)', () => {
    expect(tabSrc).toContain('const [fireNowMs, setFireNowMs] = useState(0);');
    expect(tabSrc).toContain('setFireNowMs(Date.now());');
    // v2.280.0 deliberate self-evolution: the first draft read Date.now()
    // during render and the purity rule named it — the stamp rides the load.
    expect(tabSrc).not.toContain('const fireNowMs = Date.now();');
  });

  it('the empty state grew its own door', () => {
    expect(tabSrc).toContain('data-testid="schedules-empty-cta"');
    expect(tabSrc).toContain('Create the first schedule');
  });
});

describe('the pure voice\u2019s house laws hold in its own file', () => {
  it('the floor lives once', () => {
    expect((voiceSrc.match(/Math\.floor\(ms \/ 86_400_000\)/g) ?? []).length).toBe(1);
    expect((voiceSrc.match(/Math\.floor\([^)]*\/ 86_400_000\)/g) ?? []).length).toBe(1);
  });

  it('the voice file stays import-free — the client-bundle law', () => {
    expect(voiceSrc).not.toMatch(/^import /m);
  });
});
