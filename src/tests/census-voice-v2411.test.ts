import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  censusMaintenanceVoice,
  rateCensus,
  type RateCensus,
} from '../components/currency-switcher';

/**
 * v2.411.0 — the census speaks first.
 *
 * v2.410.0 gave the currency dropdown's footer the RATE CENSUS STRIP (the
 * rows counted by provenance beside an age voice). This round the census
 * gains its honest follow-through: when EVERY row on the wire is a factory
 * figure (no admin-set, no API), the strip says so and names the door that
 * fixes it — the Exchange Rates card on the System tab. A maintained
 * census stays silent: the moment one rate is admin-set or API-backed,
 * the invitation is gone (no nagging). The voice is a PURE export pinned
 * behaviorally here, per the house law; the strip's tone follows its
 * census (the amber invitation family vs the quiet neutral surface).
 *
 * The round also closes the payroll Decimal cluster: the six engine inputs
 * (basicSalary/houseAllowance/transportAllowance/medicalAllowance/
 * otherAllowances/hourlyRate) are coerced with Number() at the BOUNDARY
 * (the widen-and-fix law — the coercion lives at the door, not inside the
 * engine), the leave allocation's `available` rides the same law, and the
 * payroll tab's terminate mutation names the envelope its TData resolves
 * (299 → 291).
 */

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const switcher = readRepo('src/components/currency-switcher.tsx');
const helpers = readRepo('src/lib/payroll-helpers.ts');
const payrollTab = readRepo('src/app/(shell)/tabs/payroll-tab.tsx');

// ── 1. THE MAINTENANCE VOICE (pure, behavioral) ───────────────────────────

describe('the census maintenance voice (v2.411.0, pure)', () => {
  const census = (partial: Partial<RateCensus>): RateCensus => ({
    manual: 0,
    api: 0,
    builtIn: 0,
    total: 0,
    ...partial,
  });

  it('an all-factory census speaks: the count, the truth, and the door', () => {
    expect(censusMaintenanceVoice(census({ builtIn: 4, total: 4 }))).toBe(
      'All 4 rates are factory figures — set yours in the Exchange Rates card (System tab).',
    );
  });

  it('one admin-set rate silences the voice — no nagging a maintained branch', () => {
    expect(censusMaintenanceVoice(census({ manual: 1, builtIn: 3, total: 4 }))).toBeNull();
  });

  it('one API rate silences it too — maintained is maintained', () => {
    expect(censusMaintenanceVoice(census({ api: 2, builtIn: 2, total: 4 }))).toBeNull();
  });

  it('an absent census says nothing — honest absence', () => {
    expect(censusMaintenanceVoice(null)).toBeNull();
    expect(censusMaintenanceVoice(undefined)).toBeNull();
  });

  it('the voice composes from the census the wire answers — end to end', () => {
    const wire = [
      { code: 'KES', kesToRate: 1, source: 'STATIC', updatedAt: null },
      { code: 'USD', kesToRate: 0.0077, source: 'STATIC', updatedAt: null },
      { code: 'UGX', kesToRate: 3700, source: 'STATIC', updatedAt: null },
      { code: 'TZS', kesToRate: 16.1, source: 'STATIC', updatedAt: null },
    ];
    expect(censusMaintenanceVoice(rateCensus(wire))).toBe(
      'All 4 rates are factory figures — set yours in the Exchange Rates card (System tab).',
    );
  });
});

// ── 2. THE NUDGE (source bytes) ───────────────────────────────────────────

describe('the census nudge renders inside the strip (v2.411.0)', () => {
  it('the nudge carries its own testid behind the honest gate', () => {
    expect(switcher).toMatch(/data-testid="currency-census-nudge"/);
    expect(switcher).toMatch(/\{maintenanceVoice && \(/);
  });

  it('the strip\u2019s tone follows its census — amber invitation vs quiet neutral', () => {
    expect(switcher).toMatch(
      /'border-amber-200\/70 bg-amber-50\/60 dark:border-amber-500\/25 dark:bg-amber-500\/10'/,
    );
    expect(switcher).toMatch(/'border-border\/60 bg-muted\/40',/);
  });

  it('the nudge line rides the amber family with a key-line separation', () => {
    expect(switcher).toMatch(
      /border-t border-amber-200\/60 pt-1 text-\[9px\] leading-snug text-amber-700 dark:border-amber-500\/20 dark:text-amber-300/,
    );
  });

  it('the voice is computed from the census, memoized on it', () => {
    expect(switcher).toMatch(
      /const maintenanceVoice = useMemo\(\n\s+\(\) => censusMaintenanceVoice\(census\),\n\s+\[census\],\n\s+\);/,
    );
  });

  it('the footer stack stays ordered: freshness line, then the census strip', () => {
    const freshnessAt = switcher.indexOf('{freshnessLabel && (');
    const censusAt = switcher.indexOf('data-testid="currency-rate-census"');
    const nudgeAt = switcher.indexOf('data-testid="currency-census-nudge"');
    expect(freshnessAt).toBeGreaterThan(-1);
    expect(censusAt).toBeGreaterThan(freshnessAt);
    expect(nudgeAt).toBeGreaterThan(censusAt);
  });
});

// ── 3. THE PAYROLL DECIMAL CLUSTER (boundary law, source bytes) ──────────

describe('the payroll Decimal boundary (v2.411.0, 299 → 291)', () => {
  it('the six engine inputs are coerced at the boundary — the widen-and-fix law', () => {
    const call = switcher_sliceCall(helpers);
    expect(call).toContain('basicSalary: Number(employee.basicSalary),');
    expect(call).toContain('houseAllowance: Number(employee.houseAllowance),');
    expect(call).toContain('transportAllowance: Number(employee.transportAllowance),');
    expect(call).toContain('medicalAllowance: Number(employee.medicalAllowance),');
    expect(call).toContain('otherAllowances: Number(employee.otherAllowances),');
    expect(call).toContain('hourlyRate: Number(employee.hourlyRate),');
  });

  it('the leave allocation\u2019s available figure rides the same law', () => {
    expect(helpers).toMatch(/available: round2\(Number\(allocated\)\),/);
  });

  it('the engine\u2019s number inputs stay numbers — the door moved, not the engine', () => {
    expect(helpers).toMatch(/basicSalary: number;/);
    expect(helpers).not.toMatch(/basicSalary: number \| Decimal;/);
  });

  it('the terminate mutation names the envelope its TData resolves', () => {
    expect(payrollTab).toMatch(
      /apiFetch<\{ message\?: string; data\?: \{ fullName\?: string \} \}>\(`\/api\/employees\/\$\{id\}`, \{ method: 'DELETE' \}\)/,
    );
  });
});

// ── 4. REGRESSION ECHOES (v2.410.0 laws untouched) ───────────────────────

describe('the mount law and the census survive the voice (v2.410.0 echoes)', () => {
  it('both wires still answer on mount', () => {
    expect((switcher.match(/enabled: true,/g) ?? []).length).toBe(2);
    expect(switcher).not.toMatch(/enabled: opened,/);
  });

  it('the census pure voice still counts provenances', () => {
    expect(switcher).toMatch(/\{census\.manual\} admin-set · \{census\.api\} API · \{census\.builtIn\} built-in/);
  });

  it('the age voice and its dot still ride the cache read time', () => {
    expect(switcher).toMatch(/const ageVoice = wireAgeVoice\(wireAgeMs\(ratesQuery\.dataUpdatedAt\)\);/);
  });

  it('the seed and greeting laws are untouched', () => {
    expect(switcher).toContain('(s) => s.seededFromBranch && !s.currencyChosen');
    expect(switcher).toMatch(/useEffect\(\(\) => \{\n    void seedCurrencyFromBranch\(\);\n  \}, \[\]\);/);
  });
});

// helper: the calculatePayForPeriod call slice (the six faces' home)
function switcher_sliceCall(src: string): string {
  const at = src.indexOf('const calcResult = calculatePayForPeriod({');
  expect(at).toBeGreaterThan(-1);
  return src.slice(at, at + 900);
}
