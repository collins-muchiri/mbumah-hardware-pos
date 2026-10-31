// MBUMAH HARDWARE POS - the engine reads the override (v2.305.0)
//
// BOTH NETS, per the runtime-pin law:
//   • the VALUE net pins the resolution truth: resolveComponentCents is THE
//     component arithmetic — the assignment's override flat amount first,
//     else the catalog's; otherwise the override percent, else the catalog's
//     — including the KES-rounding path (basic × bps / 10_000, rounded AS
//     KES then ×100) where a naive cents path diverges on fractional basics,
//     and assignmentValueWords speaking the resolved value with the catalog
//     words it beat.
//   • the BYTE net pins the custody chain: the RUN SERVICE resolves through
//     the shared law passing the assignment (the inline arithmetic line is
//     gone — one arithmetic, both mouths), the service validates the
//     override entries (dedupe, basis, cents, bps) and writes the override
//     fields + the audit overrideCount, the desk renders the override
//     inputs/badges and estimates through the same law with the assignment,
//     and the view lib stays pure.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  assignmentValueWords,
  estimateComponentCents,
  resolveComponentCents,
} from '@/lib/hr/salary-structure-view';

const ROOT = process.cwd();
const VIEW_LIB = 'src/lib/hr/salary-structure-view.ts';
const RUN_SERVICE = 'src/lib/hr/payroll/run-service.ts';
const SERVICE = 'src/lib/hr/salary-structure-service.ts';
const PAGE = 'src/app/(shell)/hr/salary-structures/page.tsx';
const FEED = 'src/lib/whats-new.ts';
const CHANGELOG = 'CHANGELOG.md';

const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

const FLAT = { amountCents: 400_000, percentBps: null } as const;
const PCT = { amountCents: null, percentBps: 500 } as const;

describe('the component resolution law (value net)', () => {
  it('catalog passthrough: a flat component pays its own amount, override or not', () => {
    expect(resolveComponentCents(FLAT, 50_000)).toBe(400_000);
    expect(resolveComponentCents(FLAT, 50_000, null)).toBe(400_000);
    expect(
      resolveComponentCents(FLAT, 50_000, { overrideAmountCents: null, overridePercentBps: null }),
    ).toBe(400_000);
  });

  it('catalog passthrough: a percent component runs the KES-rounding path', () => {
    // 50,000 KES × 500 bps = 2,500 KES exactly.
    expect(resolveComponentCents(PCT, 50_000)).toBe(250_000);
    // Fractional basic: 123,456.789 KES × 5% — the engine rounds AS KES
    // (6,172.83945 → 6,173) then ×100 = 617,300; a naive cents path would
    // give 617,284 (16 cents less). The engine's number is the law.
    expect(resolveComponentCents(PCT, 123_456.789)).toBe(617_300);
    expect(estimateComponentCents(PCT, 123_456.789)).toBe(617_300);
  });

  it('a flat override answers first on its own basis', () => {
    expect(resolveComponentCents(FLAT, 50_000, { overrideAmountCents: 600_000 })).toBe(600_000);
  });

  it('a percent override answers on the percent basis, same rounding path', () => {
    // 50,000 × 750 bps = 3,750 KES exactly.
    expect(resolveComponentCents(PCT, 50_000, { overridePercentBps: 750 })).toBe(375_000);
    // 50,000 × 333 bps = 1,665 KES exactly.
    expect(resolveComponentCents(PCT, 50_000, { overridePercentBps: 333 })).toBe(166_500);
  });

  it('an amount override turns a percent component flat (law reads data; the write guard keeps basis)', () => {
    expect(resolveComponentCents(PCT, 50_000, { overrideAmountCents: 300_000 })).toBe(300_000);
  });

  it('a zero override is a VALUE (0 pays), not an absence', () => {
    expect(resolveComponentCents(FLAT, 50_000, { overrideAmountCents: 0 })).toBe(0);
    expect(resolveComponentCents(PCT, 50_000, { overridePercentBps: 0 })).toBe(0);
  });

  it('null overrides agree with absent overrides (the recorded-but-empty row)', () => {
    expect(
      resolveComponentCents(PCT, 123_456.789, { overrideAmountCents: null, overridePercentBps: null }),
    ).toBe(resolveComponentCents(PCT, 123_456.789));
  });

  it('the catalog-only estimate is the two-argument special case of the law', () => {
    expect(estimateComponentCents(FLAT, 50_000)).toBe(resolveComponentCents(FLAT, 50_000));
    expect(estimateComponentCents(PCT, 123_456.789)).toBe(resolveComponentCents(PCT, 123_456.789));
  });
});

describe('the override words law (value net)', () => {
  it('an overridden flat badge speaks the override and names the catalog default', () => {
    const w = assignmentValueWords(FLAT, { overrideAmountCents: 600_000 });
    expect(w.words).toBe('KES 6,000');
    expect(w.overridden).toBe(true);
    expect(w.catalogWords).toBe('KES 4,000');
  });

  it('an overridden percent badge speaks the override percent', () => {
    const w = assignmentValueWords(PCT, { overridePercentBps: 750 });
    expect(w.words).toBe('7.5% of basic');
    expect(w.overridden).toBe(true);
    expect(w.catalogWords).toBe('5% of basic');
  });

  it('a catalog passthrough badge is not overridden', () => {
    expect(assignmentValueWords(FLAT).overridden).toBe(false);
    expect(assignmentValueWords(FLAT).words).toBe('KES 4,000');
    expect(assignmentValueWords(PCT).words).toBe('5% of basic');
  });

  it('a valueless component speaks "no value" honestly', () => {
    const w = assignmentValueWords({ amountCents: null, percentBps: null });
    expect(w.words).toBe('no value');
    expect(w.overridden).toBe(false);
    expect(w.catalogWords).toBe('no value');
  });
});

describe('the custody chain (byte net)', () => {
  const runService = read(RUN_SERVICE);
  const service = read(SERVICE);
  const page = read(PAGE);
  const viewLib = read(VIEW_LIB);
  const feed = read(FEED);
  const changelog = read(CHANGELOG);

  it('the run service resolves through the SHARED law, passing the assignment', () => {
    expect(runService).toContain("import { resolveComponentCents } from '../salary-structure-view';");
    expect(runService).toContain('resolveComponentCents(comp, Number(employee.basicSalary), assignment)');
  });

  it('the inline arithmetic line is GONE from the engine (one arithmetic, both mouths)', () => {
    expect(runService).not.toContain('comp.amountCents ?? Math.round');
  });

  it('the service writes the override fields on the created assignments', () => {
    expect(service).toContain('overrideAmountCents: e.overrideAmountCents');
    expect(service).toContain('overridePercentBps: e.overridePercentBps');
  });

  it('the service validates the override entries: dedupe, basis, cents, bps', () => {
    expect(service).toContain("'DUPLICATE_COMPONENT'");
    expect(service).toContain("'BAD_OVERRIDE_BASIS'");
    expect(service).toContain("'BAD_OVERRIDE_AMOUNT'");
    expect(service).toContain("'BAD_OVERRIDE_PERCENT'");
  });

  it('the basis guard names its law: an override changes the amount, never the kind of value that pays', () => {
    expect((service.match(/never the kind of value that pays/g) || []).length >= 2).toBe(true);
  });

  it('the audit row records overrideCount beside componentCount', () => {
    expect(service).toContain('overrideCount:');
    expect(service).toContain('componentCount: entries.length');
  });

  it('the desk renders override inputs on BOTH bases (flat KES, percent bps)', () => {
    expect(page).toContain('data-override-basis="flat"');
    expect(page).toContain('data-override-basis="percent"');
    expect(page).toContain('data-testid="ss-override-input"');
  });

  it('the desk refuses a typed-but-invalid override client-side (never silently dropped)', () => {
    expect(page).toContain('must be a non-negative amount (KES)');
    expect(page).toContain('between 0 and 10,000');
  });

  it('the desk submits the components[] form (the legacy componentIds double-attach would be refused)', () => {
    expect(page).toContain('components: componentEntries');
    expect(page).not.toContain('componentIds: picked');
  });

  it('the desk badges speak the resolved value with the amber override chip', () => {
    expect(page).toContain('assignmentValueWords(a.salaryComponent, a)');
    expect(page).toContain('data-testid="salary-override-badge"');
    expect(page).toContain('OVERRIDE_CHIP');
  });

  it('the desk estimate passes the ASSIGNMENT to the shared law (overrides in force)', () => {
    expect(page).toContain('resolveComponentCents(a.salaryComponent, basicKes, a)');
  });

  it('the view lib stays PURE (zero imports)', () => {
    expect((viewLib.match(/^import /gm) || []).length).toBe(0);
  });

  it('the release face: whats-new leads with 2.305.0 and the CHANGELOG carries it above 2.304.0', () => {
    const leadIdx = feed.indexOf("version: '2.305.0',");
    expect(leadIdx).toBeGreaterThanOrEqual(0);
    expect(feed.indexOf('The engine reads the override')).toBeGreaterThan(0);
    expect(changelog.indexOf('[2.305.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('[2.305.0]')).toBeLessThan(changelog.indexOf('[2.304.0]'));
  });
});
