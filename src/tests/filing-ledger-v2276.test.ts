// v2.276.0 — the ledger takes the receipt.
//
//   - THE LAW COMPLETED: v2.274.0's card footer said "whether a window
//     was filed is the ledger's business" — deferring to a ledger that
//     did not exist. This round the ledger exists: the statutory_filings
//     table (one receipt per organization per obligation per payroll
//     month), the org-scoped GET/POST route, the audited write, and the
//     card's receipt chip + Mark filed door. The footer now speaks both
//     halves (the clock speaks deadlines; the ledger speaks receipts).
//   - THE RECEIPT IS AN ASSERTION, NEVER A GUESS: no surface derives a
//     filing from money moved — the journal carries the charge, the
//     ledger carries the receipt, the two never borrow each other's
//     words. The pure gate (validateFilingInput) pins the machine's half:
//     kind ∈ the calendar's four, month ∈ "YYYY-MM", filedAt never in the
//     future (one minute of clock skew tolerated), the filer's words
//     capped at source.
//   - THE ONE JOIN KEY: periodMonthForDueDate derives the payroll month
//     from the calendar's ISO due date (the 9th-of-the-following-month
//     statute read backwards, with the January→December roll) — the card's
//     chips, the monthly figures' dots, and the dialog's submit all speak
//     the same `${kind}:${periodMonth}` key, so a chip and a dot can never
//     disagree about which month a receipt covers.
//   - THE COLOR LAW, NAMED: on the filing calendar card, emerald means
//     "the ledger holds the receipt" (the good family) — it never borrows
//     the clock's rose/amber/sky; the census's emerald lives on the Portal
//     tab, a different desk. The Due cell's dot is emerald only when ALL
//     FOUR obligations are evidenced for the month; the title speaks the
//     count, and outside the read window the cell keeps quiet (no
//     coverage, no claim).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { validateFilingInput, STATUTORY_FILING_KINDS } from '@/lib/hr/statutory-filing';
import { periodMonthForDueDate } from '@/lib/hr/compliance-calendar';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const lib = read('src/lib/hr/statutory-filing.ts');
const route = read('src/app/api/hr/reports/compliance-filing/route.ts');
const schema = read('prisma/schema.prisma');
const migration = read('prisma/migrations/20261030070000_add_statutory_filings/migration.sql');
const audit = read('src/lib/hr/audit.ts');
const page = read('src/app/(shell)/hr/reports/page.tsx');

const NOW = new Date('2026-10-29T22:00:00Z');
const valid = {
  kind: 'PAYE',
  periodMonth: '2026-10',
  filedAt: '2026-10-28T10:00:00Z',
};

// ── the RUNTIME law — the gates get pins ──

describe('validateFilingInput — the receipt gate (pure)', () => {
  it('accepts a well-formed receipt and trims the filer\'s words', () => {
    const v = validateFilingInput({ ...valid, reference: '  KRA-Q-1234  ', note: '  paid via bank  ' }, NOW);
    expect(v.ok).toBe(true);
    if (!v.ok) throw new Error('unreachable');
    expect(v.value.kind).toBe('PAYE');
    expect(v.value.periodMonth).toBe('2026-10');
    expect(v.value.filedAt.toISOString()).toBe('2026-10-28T10:00:00.000Z');
    expect(v.value.reference).toBe('KRA-Q-1234');
    expect(v.value.note).toBe('paid via bank');
  });

  it('the kind gate is closed — only the calendar\'s four obligations pass', () => {
    expect(STATUTORY_FILING_KINDS).toEqual(['PAYE', 'NSSF', 'SHIF', 'AHL']);
    expect(validateFilingInput({ ...valid, kind: 'VAT' }, NOW)).toEqual({ ok: false, code: 'INVALID_KIND' });
    expect(validateFilingInput({ ...valid, kind: 'paye' }, NOW)).toEqual({ ok: false, code: 'INVALID_KIND' });
    expect(validateFilingInput({ ...valid, kind: '' }, NOW)).toEqual({ ok: false, code: 'INVALID_KIND' });
  });

  it('the month gate reads the "YYYY-MM" key the rows already speak', () => {
    expect(validateFilingInput({ ...valid, periodMonth: '2026-13' }, NOW)).toEqual({ ok: false, code: 'INVALID_MONTH' });
    expect(validateFilingInput({ ...valid, periodMonth: '2026-00' }, NOW)).toEqual({ ok: false, code: 'INVALID_MONTH' });
    expect(validateFilingInput({ ...valid, periodMonth: 'October 2026' }, NOW)).toEqual({ ok: false, code: 'INVALID_MONTH' });
    expect(validateFilingInput({ ...valid, periodMonth: '2026-10-01' }, NOW)).toEqual({ ok: false, code: 'INVALID_MONTH' });
  });

  it('a receipt dated tomorrow is a lie with a timestamp — the future gate', () => {
    expect(validateFilingInput({ ...valid, filedAt: 'bogus' }, NOW)).toEqual({ ok: false, code: 'INVALID_FILED_AT' });
    expect(validateFilingInput({ ...valid, filedAt: '' }, NOW)).toEqual({ ok: false, code: 'INVALID_FILED_AT' });
    // beyond the one-minute skew: rejected
    expect(validateFilingInput({ ...valid, filedAt: '2026-10-29T22:02:00Z' }, NOW)).toEqual({ ok: false, code: 'FILED_AT_IN_FUTURE' });
    // within the one-minute skew: a slow client's "filed now" still passes
    const slack = validateFilingInput({ ...valid, filedAt: '2026-10-29T22:00:30Z' }, NOW);
    expect(slack.ok).toBe(true);
  });

  it('the filer\'s words have caps at source — over the cap is its own code', () => {
    expect(validateFilingInput({ ...valid, reference: 'x'.repeat(121) }, NOW)).toEqual({ ok: false, code: 'REFERENCE_TOO_LONG' });
    expect(validateFilingInput({ ...valid, note: 'x'.repeat(501) }, NOW)).toEqual({ ok: false, code: 'NOTE_TOO_LONG' });
    expect(validateFilingInput({ ...valid, reference: 'x'.repeat(120) }, NOW).ok).toBe(true);
    expect(validateFilingInput({ ...valid, note: 'x'.repeat(500) }, NOW).ok).toBe(true);
  });
});

describe('periodMonthForDueDate — the ONE join key (pure)', () => {
  it('reads the statute backwards — the deadline covers the month before it', () => {
    expect(periodMonthForDueDate('2026-11-09')).toBe('2026-10');
    expect(periodMonthForDueDate('2026-12-09')).toBe('2026-11');
  });

  it('January rolls to the previous December', () => {
    expect(periodMonthForDueDate('2027-01-09')).toBe('2026-12');
  });

  it('a malformed date is an honest absence — null, never a guessed month', () => {
    expect(periodMonthForDueDate('')).toBe(null);
    expect(periodMonthForDueDate('2026-11')).toBe(null);
    expect(periodMonthForDueDate('9 November 2026')).toBe(null);
    expect(periodMonthForDueDate('not-a-date-xx-xx')).toBe(null);
  });
});

// ── the BYTE law — the surfaces speak the composition ──

describe('the ledger\'s table — the migration and the schema agree', () => {
  it('the migration creates the compound-unique receipt table', () => {
    expect(migration).toContain('CREATE TABLE "statutory_filings" (');
    expect(migration).toContain('CREATE UNIQUE INDEX "statutory_filings_organizationId_kind_periodMonth_key" ON "statutory_filings"("organizationId", "kind", "periodMonth")');
    expect(migration).toContain('CREATE INDEX "statutory_filings_organizationId_periodMonth_idx" ON "statutory_filings"("organizationId", "periodMonth")');
  });

  it('a deleted filer never strands a receipt — the SET NULL law', () => {
    expect(migration).toContain('FOREIGN KEY ("filedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE');
    expect(migration).toContain('FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE');
  });

  it('the schema model carries the same laws', () => {
    expect(schema).toContain('model StatutoryFiling {');
    expect(schema).toContain('@@unique([organizationId, kind, periodMonth])');
    expect(schema).toContain('@@map("statutory_filings")');
    expect(schema).toContain('statutoryFilings     StatutoryFiling[]');
    expect(schema).toContain('filedStatutoryFilings   StatutoryFiling[]');
    // the receipt is an assertion, never a guess — the doc says so at birth
    expect(schema).toContain('The receipt is an assertion the filer makes');
  });

  it('the audit vocabulary grew the entity — the write gets its own resource type', () => {
    expect(audit).toContain("STATUTORY_FILING: 'StatutoryFiling',");
  });
});

describe('the route — one door, both verbs guarded', () => {
  it('GET and POST ride the same drill-down guard', () => {
    const guards = route.match(/hrGuard\('hr\.report\.branch', REPORT_ROLES\)/g) ?? [];
    expect(guards.length).toBe(2);
    expect(route).toContain("const REPORT_ROLES = ['HR_MANAGER', 'STORE_OWNER', 'ACCOUNTANT', 'BRANCH_MANAGER'] as const;");
  });

  it('the write is audited — recorded vs amended are separate actions, values stay out of the trail', () => {
    expect(route).toContain("action: amended ? 'STATUTORY_FILING_AMENDED' : 'STATUTORY_FILING_RECORDED'");
    expect(route).toContain('resourceType: HrEntityType.STATUTORY_FILING');
    expect(route).toContain('metadata: { kind: filing.kind, periodMonth: filing.periodMonth, amended }');
    expect(route).not.toContain('reference: filing.reference'); // the voucher number never rides the audit trail
  });

  it('a pre-migration database speaks the precise code, never a bare 500', () => {
    expect(route).toContain('FILING_LEDGER_UNAVAILABLE');
  });

  it('the filer\'s id rides the row; the filer\'s id never rides the response', () => {
    expect(lib).toContain('filedByUserId: session.userId ?? null');
    expect(lib).toContain('filedBy: { select: { name: true } }');
    expect(lib).not.toContain('filedBy: { select: { id: true');
  });

  it('the read window is month-bounded — unbounded reads stay possible only via the builder default', () => {
    expect(lib).toContain('MONTH_KEY_SHAPE');
    expect(lib).toContain("periodMonth: 'desc'");
  });
});

describe('the card wears the receipt — the clock and the ledger, one row', () => {
  it('the receipt chip is emerald and speaks the date; AT hears what the eye sees', () => {
    expect(page).toContain('data-testid={`hr-cal-filed-${o.kind.toLowerCase()}`}');
    // v2.277.0 (deliberate evolution): the chip became the amendment DOOR —
    // the emerald face keeps its palette while gaining the door's
    // hover/focus-visible affordances, so the className byte grew.
    expect(page).toContain('border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700');
    expect(page).toContain('filed {formatDate(filed.filedAt)}');
    // v2.277.0 (deliberate evolution): the title gained the amendment's
    // voice (genuinely amended → "amended <date>") and the door's words
    // ("open to amend") — the chip's tooltip now speaks its affordance.
    expect(page).toContain('title={`Filed ${formatDate(filed.filedAt)}${filed.filedByName ? ` by ${filed.filedByName}` : \'\'}${filed.reference ? ` — ref ${filed.reference}` : \'\'}${filingWasAmended(filed) ? ` — amended ${formatDate(filed.updatedAt)}` : \'\'} — open to amend`}');
  });

  it('the write door refuses an unopened window and a filed one', () => {
    expect(page).toContain("o.status !== 'NOT_YET_OPEN' && !filingFor(o.kind, periodMonthForDueDate(o.dueDate))");
    expect(page).toContain('data-testid={`hr-cal-file-button-${o.kind.toLowerCase()}`}');
    expect(page).toContain('Mark filed');
  });

  it('the dialog is the filer\'s assertion — datetime, optional reference, optional note', () => {
    expect(page).toContain('data-testid="hr-filing-dialog"');
    expect(page).toContain('data-testid="hr-filing-filed-at"');
    expect(page).toContain('data-testid="hr-filing-ref"');
    expect(page).toContain('data-testid="hr-filing-note"');
    expect(page).toContain('data-testid="hr-filing-submit"');
    expect(page).toContain('maxLength={120}');
    expect(page).toContain('maxLength={500}');
  });

  it('the ledger rides the calendar\'s loader — no new effect, no new failure family', () => {
    // apiGet UNWRAPS the envelope — the rows ARE the payload (the E2E walk
    // caught the envelope-shaped read: it read .data off an array and filed
    // nothing; the unwrap law is now pinned in bytes)
    expect(page).toContain('const rows = await apiGet<StatutoryFilingRow[]>(`/api/hr/reports/compliance-filing?from=${from}&to=${to}`);');
    expect(page).toContain('setFilings(rows ?? []);');
    expect(page).not.toContain('res?.data ?? []');
    expect(page).toContain('setFilingFailed(true);');
    expect(page).toContain('data-testid="hr-compliance-filing-error"');
    // the clock still speaks when the receipts go quiet
    expect(page).toContain('The filing ledger could not be read — the clock still speaks, the receipts are quiet.');
  });

  it('the footer speaks both halves now — the law completed', () => {
    expect(page).toContain('The clock speaks deadlines; the ledger speaks receipts');
    expect(page).not.toContain("the ledger&apos;s business");
  });
});

describe('the Due cell learns the receipt — the month-level roll-up', () => {
  it('the receipt rides the cell as the four-dot rail (v2.278.0 evolution)', () => {
    // v2.278.0 (deliberate evolution): the single emerald check dot —
    // `data-testid="hr-due-filed-dot"`, the all-four gate monthFullyFiled —
    // grew into the four-dot RECEIPT RAIL (`hr-due-filed-rail`, one dot per
    // obligation in the calendar's order, emerald held / quiet slate not):
    // the composition left the hover-only title for an always-visible face,
    // and monthFullyFiled retired because the rail IS the composition. The
    // aria still speaks the ONE grammar the title speaks.
    expect(page).toContain('data-testid="hr-due-filed-rail"');
    expect(page).toContain('data-testid={`hr-due-filed-dot-${k.toLowerCase()}`}');
    expect(page).toContain("held ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'");
    expect(page).toContain('monthFullyFiled'); // only in the retirement comment now
    expect(page).toContain("const count = monthFiledCount(m.month);");
    // v2.277.0 (deliberate evolution): the composition's third voice — the
    // title now also counts genuinely amended receipts (the slack law's
    // monthAmendedCount), so the bare `${count} of 4` return became the
    // suffixed template.
    expect(page).toContain('return `${base} — filed: ${count} of 4 obligations${amended > 0 ? ` · ${amended} receipt${amended === 1 ? \'\' : \'s\'} amended` : \'\'}`;');
  });

  it('outside the read window the cell keeps quiet — no coverage, no claim', () => {
    expect(page).toContain('if (!monthInCoverage(m.month)) return base;');
    expect(page).toContain('return `${base} — no filing recorded`;');
  });

  it('the join key is ONE derivation — the page never re-derives the month', () => {
    // five CALL sites, one derivation: the loader's window seed, the chip's
    // lookup, the write-door gate, the dialog opener's key, and — v2.277.0
    // (deliberate evolution) — the chip's OWN onClick, which derives the
    // key to open the amend dialog on the receipt the chip wears (the
    // import speaks the name without a call, so it never enters the count)
    const uses = page.match(/periodMonthForDueDate\(/g) ?? [];
    expect(uses.length).toBe(5);
    // v2.276 build fix (deliberate): the helper lives on the PURE calendar
    // lib (no server imports) — the page's value import of a db-touching
    // module panicked Turbopack (node:async_hooks in a client graph). The
    // row type rides a TYPE-ONLY import, erased at compile time.
    // v2.277.0 (deliberate evolution): the same pure lib grew the amend
    // desk's helpers — toDatetimeLocalValue (the field's one math) and
    // filingWasAmended (the slack law) — riding the SAME import.
    expect(page).toContain("import { statutoryDueForPeriod, periodMonthForDueDate, toDatetimeLocalValue, filingWasAmended } from '@/lib/hr/compliance-calendar';");
    expect(page).toContain("import type { StatutoryFilingRow } from '@/lib/hr/statutory-filing';");
  });
});
