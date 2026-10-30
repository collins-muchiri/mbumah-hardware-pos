// v2.277.0 — the chip takes its correction (the amendment door).
//
//   - THE DOOR LAW: the clock governs the FIRST record (v2.276.0's law
//     holds — a window that has not opened has nothing to file, and the
//     Mark-filed door stays gated by the window). The LEDGER governs
//     corrections: a receipt that exists can be amended whenever the
//     filer needs, so the CHIP ITSELF is the amendment door — clicking a
//     filed chip opens the dialog in amend mode, prefilled from the
//     receipt the ledger already holds. A correction never starts from a
//     blank.
//   - THE SLACK LAW: the receipt's createdAt/updatedAt are the row's own
//     history. Same-write timestamps (equal, or jitter within one
//     second) are the receipt's BIRTH, never a correction — only a
//     genuinely later update reads as amended (filingWasAmended, pure,
//     RUNTIME-pinned). A row that cannot speak its history is not
//     claimed as corrected (honest absence).
//   - THE ONE FIELD MATH: toDatetimeLocalValue is the datetime-local
//     value's ONE home — the record mode's "now" default and the amend
//     mode's prefill speak the same local-offset, minute-precision
//     math, so a prefill can never disagree with a default about what
//     an instant looks like in a field. Pure (the client-bundle law —
//     the page may only value-import from pure modules).
//   - THE SILENT DIFFERENCE GETS ITS WORDS: a NEW receipt announces
//     itself (the chip appears); an AMENDED one changes nothing the eye
//     can see — the card's amended note speaks it, the chip's title
//     says "amended <date>", and the Due cell's composition counts
//     corrections the same way it counts receipts. The dialog's amend
//     strip speaks the original recording (who, when) so a correction
//     always knows what it corrects; the route's AMENDED audit rides
//     unchanged from v2.276.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { toDatetimeLocalValue, filingWasAmended } from '@/lib/hr/compliance-calendar';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const cal = read('src/lib/hr/compliance-calendar.ts');
const lib = read('src/lib/hr/statutory-filing.ts');
const page = read('src/app/(shell)/hr/reports/page.tsx');
const route = read('src/app/api/hr/reports/compliance-filing/route.ts');
const schema = read('prisma/schema.prisma');
const ancestor = read('src/tests/filing-ledger-v2276.test.ts');

// ── THE ONE FIELD MATH (RUNTIME pins — the pure function's arithmetic) ──

describe('toDatetimeLocalValue — the datetime-local field speaks one math', () => {
  it('the value is minute-precision local ("YYYY-MM-DDTHH:mm") and round-trips to the instant', () => {
    const instants = [
      '2026-10-29T09:30:00.000Z',
      '2026-01-01T00:07:30.000Z',
      '2026-12-31T23:59:00.000Z',
      '2025-06-15T12:00:00.000Z',
    ];
    for (const iso of instants) {
      const value = toDatetimeLocalValue(iso);
      expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
      // the field's value, read back, is the SAME instant to the minute —
      // never a day off, never a flipped month (the local-offset math)
      expect(Math.abs(new Date(value).getTime() - new Date(iso).getTime())).toBeLessThan(60_000);
    }
  });

  it('Date inputs and string inputs speak the same value — one math, two doors', () => {
    const iso = '2026-10-29T09:30:00.000Z';
    expect(toDatetimeLocalValue(new Date(iso))).toBe(toDatetimeLocalValue(iso));
  });

  it('a non-finite instant speaks the field\'s own empty — never a guessed 1970', () => {
    expect(toDatetimeLocalValue('not-a-date')).toBe('');
    expect(toDatetimeLocalValue(new Date('nope'))).toBe('');
    expect(toDatetimeLocalValue('')).toBe('');
  });
});

// ── THE SLACK LAW (RUNTIME pins — what counts as a correction) ──

describe('filingWasAmended — the receipt\'s own history, read honestly', () => {
  it('same-write timestamps are the receipt\'s BIRTH, never a correction', () => {
    const t = '2026-10-29T09:00:00.000Z';
    expect(filingWasAmended({ createdAt: t, updatedAt: t })).toBe(false);
  });

  it('sub-second jitter is still the birth — only >1s reads as amended', () => {
    const created = '2026-10-29T09:00:00.000Z';
    expect(filingWasAmended({ createdAt: created, updatedAt: '2026-10-29T09:00:00.400Z' })).toBe(false);
    expect(filingWasAmended({ createdAt: created, updatedAt: '2026-10-29T09:00:02.000Z' })).toBe(true);
    expect(filingWasAmended({ createdAt: created, updatedAt: '2026-11-05T17:12:00.000Z' })).toBe(true);
  });

  it('a row that cannot speak its history is not claimed as corrected', () => {
    expect(filingWasAmended({})).toBe(false);
    expect(filingWasAmended({ createdAt: null, updatedAt: null })).toBe(false);
    expect(filingWasAmended({ createdAt: '2026-10-29T09:00:00.000Z', updatedAt: undefined })).toBe(false);
    expect(filingWasAmended({ createdAt: 'garbage', updatedAt: '2026-10-29T09:00:00.000Z' })).toBe(false);
    expect(filingWasAmended(null as unknown as { createdAt: string })).toBe(false);
  });
});

// ── the row carries its history ──

describe('the ledger row speaks createdAt/updatedAt', () => {
  it('the wire type carries the history', () => {
    expect(lib).toContain('createdAt: string;');
    expect(lib).toContain('updatedAt: string;');
  });

  it('the read selects and maps both stamps (ISO on the wire)', () => {
    // both selects (fetch + upsert) carry the stamps
    expect((lib.match(/createdAt: true/g) ?? []).length).toBe(2);
    expect((lib.match(/updatedAt: true/g) ?? []).length).toBe(2);
    expect((lib.match(/createdAt: r\.createdAt\.toISOString\(\)/g) ?? []).length).toBe(1);
    expect((lib.match(/updatedAt: r\.updatedAt\.toISOString\(\)/g) ?? []).length).toBe(1);
    expect((lib.match(/createdAt: row\.createdAt\.toISOString\(\)/g) ?? []).length).toBe(1);
    expect((lib.match(/updatedAt: row\.updatedAt\.toISOString\(\)/g) ?? []).length).toBe(1);
  });

  it('the schema model already carried the stamps — no migration this round', () => {
    expect(schema).toContain('createdAt      DateTime @default(now())');
    expect(schema).toContain('updatedAt      DateTime @updatedAt');
  });
});

// ── the chip is the amendment door ──

describe('the chip takes its correction — the door, the voice, the strip', () => {
  it('the filed chip is a BUTTON with the dialog affordance — the ledger governs corrections', () => {
    expect(page).toContain('data-testid={`hr-cal-filed-${o.kind.toLowerCase()}`}');
    expect(page).toContain('aria-haspopup="dialog"');
    // the door's onClick derives the join key and opens WITH the receipt —
    // a correction starts from the truth it corrects, never from a blank
    expect(page).toContain('if (pm) openFilingDialog(o, pm, filed);');
  });

  it('the chip\'s hover/focus affordance rides the emerald face (the color law holds)', () => {
    expect(page).toContain('hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800');
    expect(page).toContain('focus-visible:ring-emerald-400');
    // the palette stays the good family — never the clock's rose/amber/sky
    expect(page).toContain('border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700');
  });

  it('the title speaks the amendment and the door\'s words', () => {
    expect(page).toContain('${filingWasAmended(filed) ? ` — amended ${formatDate(filed.updatedAt)}` : \'\'} — open to amend');
  });

  it('the amend prefill rides the ONE field math (no second nowLocal math)', () => {
    expect(page).toContain('setFilingFiledAt(existing ? toDatetimeLocalValue(existing.filedAt) : toDatetimeLocalValue(new Date()));');
    expect(page).toContain("setFilingRef(existing?.reference ?? '');");
    expect(page).toContain("setFilingNote(existing?.note ?? '');");
    // the old inline offset math is gone — one home, one math
    expect(page).not.toContain('nowLocal.setMinutes');
    expect(page).not.toContain('getTimezoneOffset()');
  });

  it('the dialog has two modes — record (the window\'s door) and amend (the chip\'s door)', () => {
    expect(page).toContain("{filingTarget?.amend ? 'Amend' : 'Record'} the {filingTarget?.label} filing — {filingTarget?.periodLabel}");
    expect(page).toContain("filingTarget?.amend ? 'Update filing' : 'Record filing'");
    // the strip speaks the original recording so a correction knows what it corrects
    expect(page).toContain('data-testid="hr-filing-amend-strip"');
    expect(page).toContain('This receipt was recorded {formatDate(filingTarget.original.filedAt)}');
    expect(page).toContain('corrects the ledger&apos;s one truth; the audit trail remembers the correction.');
    // the amend submit wears the pen, the record submit wears the stamp
    expect(page).toContain("filingTarget?.amend ? <PenLine className=\"h-3.5 w-3.5\" aria-hidden /> : <Stamp className=\"h-3.5 w-3.5\" aria-hidden />");
  });

  it('the target state carries its mode and the original recording', () => {
    expect(page).toContain('amend: Boolean(existing)');
    expect(page).toContain('original: existing ? { filedAt: existing.filedAt, filedByName: existing.filedByName } : null');
  });

  it('the silent difference gets its words — the card\'s amended note', () => {
    expect(page).toContain('data-testid="hr-filing-amended-note"');
    expect(page).toContain('receipt was amended — the ledger keeps one truth, and the audit trail remembers the correction.');
    // the note rides the response's own amended flag — never guessed
    expect(page).toContain('const res = await apiSend<{ filing: { kind: string }; amended: boolean }>');
    expect(page).toContain('if (res?.amended) {');
  });

  it('the Due cell counts corrections the way it counts receipts', () => {
    expect(page).toContain('const monthAmendedCount = (periodMonth: string): number =>');
    expect(page).toContain('const amended = monthAmendedCount(m.month);');
    expect(page).toContain('${amended > 0 ? ` · ${amended} receipt${amended === 1 ? \'\' : \'s\'} amended` : \'\'}');
  });

  it('the write door\'s window law holds unchanged — the clock still governs the FIRST record', () => {
    expect(page).toContain("o.status !== 'NOT_YET_OPEN' && !filingFor(o.kind, periodMonthForDueDate(o.dueDate))");
    expect(page).toContain('data-testid={`hr-cal-file-button-${o.kind.toLowerCase()}`}');
  });
});

// ── the route and the audit ride unchanged ──

describe('the audited door remembers the correction', () => {
  it('the route\'s AMENDED audit rides unchanged from v2.276.0', () => {
    expect(route).toContain("action: amended ? 'STATUTORY_FILING_AMENDED' : 'STATUTORY_FILING_RECORDED'");
    expect(route).toContain('metadata: { kind: filing.kind, periodMonth: filing.periodMonth, amended }');
  });

  it('the pure helpers live on the PURE lib (the client-bundle law)', () => {
    expect(cal).toContain('export function toDatetimeLocalValue(instant: string | Date): string {');
    expect(cal).toContain('export function filingWasAmended(row: { createdAt?: string | null; updatedAt?: string | null }): boolean {');
    // the calendar lib stays import-free (no server graph in the client bundle)
    expect(cal).not.toMatch(/^import /m);
  });
});

// ── the ancestor's evolutions are named, not silent ──

describe('the ancestor pins evolved deliberately', () => {
  it('v2.276\'s suite names its v2.277 evolutions', () => {
    expect(ancestor.match(/v2\.277\.0 \(deliberate evolution\)/g)?.length).toBe(4);
    // the join-key count grew with the chip's door (4 → 5), named
    expect(ancestor).toContain('expect(uses.length).toBe(5);');
  });
});
