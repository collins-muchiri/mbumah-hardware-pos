// v2.281.0 — the card remembers its deliveries.
//
//   - THE ALWAYS-ON FACE: the Schedules card spoke only its LAST send
//     (lastStatus on the row); the v2.25 delivery dots stayed lazy — hidden
//     behind the history panel's fetch. The list view now carries the
//     schedule's delivery health (the last HEALTH_WINDOW recorded sends —
//     counts, entries, ONE spoken line) so an operator scanning the list
//     reads "4 delivered · 1 failed across the last 5 sends" without
//     opening a panel.
//   - THE GOVERNED READ: NotificationLog has no organizationId to join
//     through — the OR-of-contains correlation is governed BY CONSTRUCTION
//     (the schedule ids come from the actor's own list, so the one bounded
//     query can never widen past the actor's scope). No new table, no N+1.
//   - THE PARTIAL LAW: a SENT log that carries an error delivered only some
//     of its recipients — "partial", never "sent". PENDING — and any word
//     the vocabulary grows later — stays pending: an unresolved row is not
//     a verdict, and the strip never guesses.
//   - THE COLOUR COLLISION RETIRES: the v2.25 map gave PARTIAL and PENDING
//     the same amber; partial keeps amber, pending wears quiet slate
//     (colour never means two things).
//   - THE HONEST ABSENCE: a schedule with no recorded sends aggregates to
//     null — the face stays silent, never "0 delivered". And the voice
//     speaks the window it ACTUALLY counted ("across the last 3 sends"),
//     never the configured maximum.
//   - THE CATCH-QUIET LAW: a failing log read returns the bare list — the
//     cards speak their lastStatus as before; the strip never darkens the
//     page the operator came for.
//   - THE RUNTIME-PIN LAW (the fourth net): the outcome truth table and the
//     aggregation ordering are exactly the truth bytes a byte-pin alone
//     cannot catch — both nets, every round.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  aggregateScheduleHealth,
  deriveSendOutcome,
  HEALTH_LOG_CAP,
  HEALTH_WINDOW,
  scheduleHealthVoice,
  scheduleIdFromMetadata,
  type ScheduleHealthLog,
} from '@/lib/hr/schedule-health-voice';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const voiceSrc = read('src/lib/hr/schedule-health-voice.ts');
const svcSrc = read('src/lib/hr/report-schedule-service.ts');
const tabSrc = read('src/components/hr/report-schedules-tab.tsx');
const routeSrc = read('src/app/api/hr/reports/schedules/route.ts');

// ── the constants (RUNTIME pins) ──

describe('the strip\u2019s own constants', () => {
  it('the window is five — the spoken sentence\u2019s size', () => {
    expect(HEALTH_WINDOW).toBe(5);
  });

  it('the log cap is the list\u2019s exact need: 50 schedules × the 5-send window', () => {
    expect(HEALTH_LOG_CAP).toBe(250);
  });
});

// ── the partial law (RUNTIME pins — the truth table) ──

describe('deriveSendOutcome — the ONE derivation', () => {
  it('SENT without error is delivered', () => {
    expect(deriveSendOutcome('SENT', false)).toBe('delivered');
  });

  it('SENT with an error is partial — the batch reached only some recipients', () => {
    expect(deriveSendOutcome('SENT', true)).toBe('partial');
  });

  it('FAILED is failed', () => {
    expect(deriveSendOutcome('FAILED', false)).toBe('failed');
  });

  it('PENDING stays pending — unresolved is not a verdict', () => {
    expect(deriveSendOutcome('PENDING', false)).toBe('pending');
    expect(deriveSendOutcome('PENDING', true)).toBe('pending');
  });

  it('any word the vocabulary grows later keeps the benefit of the doubt', () => {
    expect(deriveSendOutcome('WEIRD', false)).toBe('pending');
    expect(deriveSendOutcome('', false)).toBe('pending');
  });
});

// ── the ONE metadata parse ──

describe('scheduleIdFromMetadata — the correlation\u2019s single parse', () => {
  it('reads the scheduleId the sender stamps', () => {
    expect(scheduleIdFromMetadata('{"scheduleId":"abc123","reportKey":"headcount"}')).toBe('abc123');
  });

  it('the honest absences: null, malformed, non-object, absent field, non-string field', () => {
    expect(scheduleIdFromMetadata(null)).toBeNull();
    expect(scheduleIdFromMetadata('')).toBeNull();
    expect(scheduleIdFromMetadata('not-json{')).toBeNull();
    expect(scheduleIdFromMetadata('["scheduleId":"abc123"]')).toBeNull();
    expect(scheduleIdFromMetadata('{"reportKey":"headcount"}')).toBeNull();
    expect(scheduleIdFromMetadata('{"scheduleId":42}')).toBeNull();
    expect(scheduleIdFromMetadata('{"scheduleId":""}')).toBeNull();
  });
});

// ── the voice's grammar (RUNTIME pins) ──

describe('scheduleHealthVoice — the ONE line', () => {
  it('speaks the parts in the delivered → partial → failed → pending order', () => {
    expect(
      scheduleHealthVoice({ delivered: 2, partial: 1, failed: 1, pending: 1 }, 5),
    ).toBe('2 delivered · 1 partial · 1 failed · 1 pending across the last 5 sends');
  });

  it('only non-zero parts speak', () => {
    expect(scheduleHealthVoice({ delivered: 0, partial: 0, failed: 3, pending: 0 }, 3)).toBe(
      '3 failed across the last 3 sends',
    );
    expect(scheduleHealthVoice({ delivered: 4, partial: 0, failed: 0, pending: 1 }, 5)).toBe(
      '4 delivered · 1 pending across the last 5 sends',
    );
  });

  it('the singular keeps its plain form', () => {
    expect(scheduleHealthVoice({ delivered: 0, partial: 0, failed: 1, pending: 0 }, 1)).toBe(
      '1 failed across the last send',
    );
    expect(scheduleHealthVoice({ delivered: 1, partial: 0, failed: 0, pending: 0 }, 1)).toBe(
      '1 delivered across the last send',
    );
  });

  it('a zero window speaks nothing', () => {
    expect(scheduleHealthVoice({ delivered: 1, partial: 0, failed: 0, pending: 0 }, 0)).toBe('');
  });

  it('all-zero counts still speak the window (the tail stands alone)', () => {
    expect(scheduleHealthVoice({ delivered: 0, partial: 0, failed: 0, pending: 0 }, 5)).toBe(
      'across the last 5 sends',
    );
  });
});

// ── the aggregation (RUNTIME pins — ordering, grouping, the honest absence) ──

describe('aggregateScheduleHealth — the card\u2019s delivery memory', () => {
  const log = (scheduleId: string, status: string, error: string | null, createdAt: string): ScheduleHealthLog => ({
    scheduleId,
    status,
    error,
    createdAt,
  });

  it('a schedule with no recorded sends aggregates to null — the face stays silent', () => {
    expect(aggregateScheduleHealth([], 's1')).toBeNull();
    expect(aggregateScheduleHealth([log('s2', 'SENT', null, '2026-10-30T02:00:00.000Z')], 's1')).toBeNull();
  });

  it('other schedules\u2019 rows never leak into the count', () => {
    const health = aggregateScheduleHealth(
      [
        log('s2', 'FAILED', 'x', '2026-10-30T02:00:00.000Z'),
        log('s1', 'SENT', null, '2026-10-30T02:00:00.000Z'),
      ],
      's1',
    );
    expect(health).not.toBeNull();
    expect(health?.delivered).toBe(1);
    expect(health?.failed).toBe(0);
    expect(health?.window).toBe(1);
    expect(health?.voice).toBe('1 delivered across the last send');
  });

  it('unsorted input sorts newest-first by the ISO string (the pure sort key)', () => {
    const health = aggregateScheduleHealth(
      [
        log('s1', 'FAILED', 'x', '2026-10-28T02:00:00.000Z'),
        log('s1', 'SENT', null, '2026-10-30T02:00:00.000Z'),
        log('s1', 'SENT', 'some', '2026-10-29T02:00:00.000Z'),
      ],
      's1',
    );
    expect(health?.entries.map((e) => e.createdAt)).toEqual([
      '2026-10-30T02:00:00.000Z',
      '2026-10-29T02:00:00.000Z',
      '2026-10-28T02:00:00.000Z',
    ]);
  });

  it('the window caps the count and keeps the NEWEST sends', () => {
    const rows = [
      log('s1', 'SENT', null, '2026-10-24T02:00:00.000Z'),
      log('s1', 'SENT', null, '2026-10-25T02:00:00.000Z'),
      log('s1', 'SENT', null, '2026-10-26T02:00:00.000Z'),
      log('s1', 'FAILED', 'x', '2026-10-27T02:00:00.000Z'),
      log('s1', 'SENT', null, '2026-10-28T02:00:00.000Z'),
      log('s1', 'SENT', 'part', '2026-10-29T02:00:00.000Z'),
      log('s1', 'SENT', null, '2026-10-30T02:00:00.000Z'),
    ];
    const health = aggregateScheduleHealth(rows, 's1', 5);
    expect(health?.window).toBe(5);
    expect(health?.delivered).toBe(3);
    expect(health?.partial).toBe(1);
    expect(health?.failed).toBe(1);
    expect(health?.pending).toBe(0);
    // the oldest two rows (Oct 24, Oct 25) fell off the window
    expect(health?.entries.at(-1)?.createdAt).toBe('2026-10-26T02:00:00.000Z');
    expect(health?.voice).toBe('3 delivered · 1 partial · 1 failed across the last 5 sends');
  });

  it('the entries carry outcome + createdAt (the dot titles\u2019 material)', () => {
    const health = aggregateScheduleHealth(
      [log('s1', 'SENT', 'part', '2026-10-30T02:00:00.000Z')],
      's1',
    );
    expect(health?.entries[0]).toEqual({ outcome: 'partial', createdAt: '2026-10-30T02:00:00.000Z' });
  });

  it('the voice rides the SAME counts the aggregation produced (one grammar)', () => {
    const health = aggregateScheduleHealth(
      [
        log('s1', 'SENT', null, '2026-10-30T02:00:00.000Z'),
        log('s1', 'FAILED', 'x', '2026-10-29T02:00:00.000Z'),
      ],
      's1',
    );
    expect(health?.voice).toBe(
      scheduleHealthVoice(
        { delivered: health?.delivered ?? 0, partial: health?.partial ?? 0, failed: health?.failed ?? 0, pending: health?.pending ?? 0 },
        health?.window ?? 0,
      ),
    );
    expect(health?.voice).toBe('1 delivered · 1 failed across the last 2 sends');
  });

  it('a non-positive window keeps the honest absence', () => {
    expect(aggregateScheduleHealth([log('s1', 'SENT', null, '2026-10-30T02:00:00.000Z')], 's1', 0)).toBeNull();
  });

  it('the partial law lives in the pipeline, not in the UI (SENT + error → partial)', () => {
    const health = aggregateScheduleHealth(
      [log('s1', 'SENT', 'Delivered to 2 of 5 recipient(s)', '2026-10-30T02:00:00.000Z')],
      's1',
    );
    expect(health?.partial).toBe(1);
    expect(health?.delivered).toBe(0);
  });
});

// ── the pure file's own laws (byte pins) ──

describe('schedule-health-voice.ts — the client-bundle law', () => {
  it('the pure voice imports nothing (the tab imports the TYPES only)', () => {
    expect(voiceSrc).not.toMatch(/from ['"]@?\//);
    expect(voiceSrc).not.toContain('require(');
    expect(voiceSrc).not.toContain('import db');
  });

  it('the derivation is the ONLY place the partial word is decided', () => {
    expect((voiceSrc.match(/'partial'/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(voiceSrc).toContain("if (status === 'SENT') return hasError ? 'partial' : 'delivered';");
  });
});

// ── the service composition (byte pins — the governed read) ──

describe('listSchedulesView — the governed read, byte-pinned', () => {
  it('the OR-of-contains correlation is scope-shaped BY CONSTRUCTION (the ids come from the actor\u2019s own list)', () => {
    expect(svcSrc).toContain('OR: rows.map((r) => ({ metadata: { contains: `"scheduleId":"${r.id}"` } }))');
  });

  it('the read is bounded by the cap and ordered newest-first', () => {
    expect(svcSrc).toContain('take: HEALTH_LOG_CAP');
    expect(svcSrc).toContain("orderBy: { createdAt: 'desc' }");
    expect(svcSrc).toContain("type: 'HR_REPORT_DIGEST'");
  });

  it('the catch-quiet law: a failing log read returns the bare list', () => {
    const catchBody = svcSrc.slice(svcSrc.indexOf('} catch {'), svcSrc.indexOf('const flattened'));
    expect(catchBody).toContain('return rows.map(toScheduleView);');
  });

  it('health attaches ONLY in the list flow — toScheduleView stays pure of the log read', () => {
    expect(svcSrc).toContain('health?: ScheduleHealth;');
    const viewFn = svcSrc.slice(svcSrc.indexOf('export function toScheduleView'), svcSrc.indexOf('export async function listSchedules'));
    expect(viewFn).not.toContain('health');
  });

  it('the metadata is parsed ONCE per row, through the pure file\u2019s ONE parse', () => {
    expect(svcSrc).toContain('scheduleIdFromMetadata(l.metadata)');
    expect(svcSrc).toContain('aggregateScheduleHealth(flattened, r.id, HEALTH_WINDOW)');
  });
});

// ── the route (byte pins) ──

describe('the schedules GET route — the list rides the view', () => {
  it('GET serves listSchedulesView directly (health included)', () => {
    expect(routeSrc).toContain('const rows = await listSchedulesView(session.organizationId);');
    expect(routeSrc).toContain('data: rows');
    expect(routeSrc).not.toContain('rows.map(toScheduleView)');
  });

  it('toScheduleView stays imported for the write flows (create/PATCH keep their shapes)', () => {
    expect(routeSrc).toContain('toScheduleView,');
  });
});

// ── the card face (byte pins — the always-on strip) ──

describe('the schedules card — the always-on strip', () => {
  it('the strip renders from s.health alone — never from the lazy history fetch', () => {
    expect(tabSrc).toContain('{s.health ? (');
    expect(tabSrc).toContain('data-testid={`schedule-health-${s.id}`}');
    expect(tabSrc).toContain('data-window={String(s.health.window)}');
  });

  it('the dots render oldest-left (the voice\u2019s newest-first entries, reversed for reading)', () => {
    expect(tabSrc).toContain('[...s.health.entries].reverse().map((entry, idx) => (');
    expect(tabSrc).toContain('data-testid={`schedule-health-dot-${s.id}-${idx}`}');
  });

  it('the colour collision retires: partial amber, pending slate, delivered emerald, failed rose', () => {
    expect(tabSrc).toContain("delivered: 'bg-emerald-500',");
    expect(tabSrc).toContain("partial: 'bg-amber-500',");
    expect(tabSrc).toContain("failed: 'bg-rose-500',");
    expect(tabSrc).toContain("pending: 'bg-slate-400 dark:bg-slate-500',");
    // the v2.25 map's shared amber is gone
    expect(tabSrc).not.toContain('bg-amber-400');
  });

  it('the v2.25 lazy dots row and its helpers retire (named evolution)', () => {
    expect(tabSrc).not.toContain('function healthDots');
    expect(tabSrc).not.toContain('function deliveryDotClass');
    expect(tabSrc).not.toContain('const DOT_STYLES');
    expect(tabSrc).not.toContain('last-10 delivery health dots');
  });

  it('the voice is spoken as real text; the dots stay aria-hidden with their titles', () => {
    expect(tabSrc).toContain('{s.health.voice}</span>');
    expect(tabSrc).toContain('title={`${entry.outcome} · ${formatDate(entry.createdAt)}`}');
    expect(tabSrc).toContain('aria-hidden');
  });

  it('the type import is type-only (the pure voice never rides the client bundle)', () => {
    expect(tabSrc).toContain("import type { ScheduleHealth } from '@/lib/hr/schedule-health-voice';");
  });

  it('the strip\u2019s invitation names the deeper surface', () => {
    expect(tabSrc).toContain('open Delivery history for the full per-recipient detail');
  });
});
