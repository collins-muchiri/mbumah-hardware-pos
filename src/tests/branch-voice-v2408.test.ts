import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveSeed } from '../lib/currency-seed';

/**
 * v2.408.0 — the branch speaks first.
 *
 * v2.407.0 made the branch's default currency a REAL setting (SystemConfig
 * `store:{id}:default_currency` via /api/settings/currency); it was honest
 * but unheard. This round the display side closes the loop: a session whose
 * user never explicitly chose greets the branch's choice (the seed law's
 * three honest refusals — never a fight), and the dropdown names the row
 * the branch picked with a mono chip (never the factory default).
 *
 * The wire's own types stop lying too: hrPerStore grows the portal fields
 * the wire always carried (six strict-mode faces), the exports generator
 * finally RECEIVES the includeSensitivePii flag the route passes and
 * audit-logs (the log lied about the file — every employee export rendered
 * masked while claiming unmasked identifiers), and kpi-row's three strips
 * read the wire's optional answer with `?.`.
 */

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const seedLib = readRepo('src/lib/currency-seed.ts');
const stores = readRepo('src/lib/stores.ts');
const switcher = readRepo('src/components/currency-switcher.tsx');
const primitives = readRepo('src/components/org/primitives.tsx');
const reports = readRepo('src/lib/hr/reports.ts');
const exportUtils = readRepo('src/lib/data-export-utils.ts');
const exportRoute = readRepo('src/app/api/data-exports/route.ts');
const kpiRow = readRepo('src/components/org/kpi-row.tsx');

// ── 1. the seed law (runtime, pure) ────────────────────────────────────────

describe('resolveSeed answers the three honest refusals', () => {
  const fresh = { activeCurrency: 'KES' as const, currencyChosen: false };

  it('the branch never chose (isDefault) → no seed — KES stays honest', () => {
    expect(resolveSeed(fresh, { defaultCurrency: 'USD', isDefault: true })).toBeNull();
  });

  it('the user already chose → the human hand wins', () => {
    expect(
      resolveSeed(
        { activeCurrency: 'KES', currencyChosen: true },
        { defaultCurrency: 'USD', isDefault: false },
      ),
    ).toBeNull();
  });

  it('the wire failed or answered junk → best-effort silence', () => {
    expect(resolveSeed(fresh, null)).toBeNull();
    expect(resolveSeed(fresh, undefined)).toBeNull();
  });

  it('the branch chose and differs → the seed speaks', () => {
    expect(
      resolveSeed(fresh, { defaultCurrency: 'USD', isDefault: false }),
    ).toBe('USD');
  });

  it('the branch chose the same code → already there, no write', () => {
    expect(
      resolveSeed(fresh, { defaultCurrency: 'KES', isDefault: false }),
    ).toBeNull();
  });
});

// ── 2. the store slice carries the seed law's flag ─────────────────────────

describe('the display-currency slice grows currencyChosen', () => {
  it('the flag rides the type, the initial state and the ONE write path', () => {
    expect(stores).toContain('currencyChosen: boolean;');
    expect(stores).toContain("activeCurrency: 'KES',\n      currencyChosen: false,");
    expect(stores).toContain(
      'setActiveCurrency: (currency) => set({ activeCurrency: currency, currencyChosen: true }),',
    );
  });

  it('the flag persists with the app preferences (partialize)', () => {
    const partialize = stores.slice(stores.indexOf('partialize:'));
    expect(partialize).toContain('activeCurrency: state.activeCurrency,');
    expect(partialize).toContain('currencyChosen: state.currencyChosen,');
  });
});

// ── 3. the seed lib's shape ────────────────────────────────────────────────

describe('the seed lib writes as a courtesy, never an override', () => {
  it('the seed writes via setState — planting currencyChosen would turn the courtesy into a choice', () => {
    expect(seedLib).toContain('useAppStore.setState({ activeCurrency: seed })');
    expect(seedLib).not.toContain('seedPromise = (async () => {\n      const wire = await fetchBranchCurrency();\n      const seed = resolveSeed(useAppStore.getState(), wire);\n      if (seed) {\n        setActiveCurrency');
    expect(seedLib).toContain('// NOT setActiveCurrency');
  });

  it('once per page: N mounts share one module-level promise, tests get the reset hook', () => {
    expect(seedLib).toContain('let seedPromise: Promise<void> | null = null;');
    expect(seedLib).toContain('export function resetSeedGuard(): void');
  });

  it('the wire rides the bearer contract and fails silent (no toast, no throw)', () => {
    expect(seedLib).toContain("localStorage.getItem('mbt_token')");
    expect(seedLib).toContain('credentials: \'same-origin\'');
    expect(seedLib).toContain('if (!res.ok) return null;');
  });
});

// ── 4. the switcher greets the branch ──────────────────────────────────────

describe('the switcher mounts the seed and names the branch row', () => {
  it('the seed effect fires on mount (fire-and-forget)', () => {
    expect(switcher).toContain('useEffect(() => {\n    void seedCurrencyFromBranch();\n  }, []);');
  });

  it('the chip wire is lazy (enabled: opened) and gates the factory default away', () => {
    expect(switcher).toContain("queryKey: ['branch-default-currency']");
    expect(switcher).toContain("authedFetch('/api/settings/currency')");
    expect(switcher).toContain('branchDefaultQuery.data && !branchDefaultQuery.data.isDefault');
  });

  it('the mono chip wears the emerald family and says what it means', () => {
    expect(switcher).toContain('isBranchDefault={branchDefault === c.code}');
    expect(switcher).toContain('branch default');
    expect(switcher).toContain('border-emerald-200 bg-emerald-50 px-1.5 py-px font-mono text-[9px] font-medium leading-tight text-emerald-700');
  });
});

// ── 5. the wire's types stop lying ─────────────────────────────────────────

describe('hrPerStore carries the portal fields the wire always had', () => {
  it('the type grows portalLinked/portalTotal (six faces stand down)', () => {
    expect(primitives).toContain('portalLinked: number;');
    expect(primitives).toContain('portalTotal: number;');
  });

  it('the wire really computes them (reports.ts owns the truth)', () => {
    expect(reports).toContain('portalLinked: number;');
    expect(reports).toContain('portalTotal: number;');
  });
});

describe('the exports generator receives the PII flag the route passes', () => {
  it('the 6th param exists and the EMPLOYEES case threads it (the log stops lying)', () => {
    expect(exportUtils).toContain('options?: { includeSensitivePii?: boolean },');
    expect(exportUtils).toContain('return generateEmployeesCsv(storeId, options);');
  });

  it('the route still passes the bag (the caller keeps its shape)', () => {
    expect(exportRoute).toContain('{ includeSensitivePii },');
  });

  it('the masking contract stays documented at the generator door', () => {
    expect(exportUtils).toContain('options?: { includeSensitivePii?: boolean },\n): Promise<GenerateResult> {');
  });
});

describe("kpi-row's three strips read the wire's optional answer", () => {
  it('every currencies read rides ?. (the honest-optional law)', () => {
    expect(kpiRow).not.toContain('.currencies.find(');
    expect(kpiRow.match(/currencies\?\.find\(/g)?.length).toBe(3);
  });

  it('the supplier hints guard the null watchlist (the ?? [] law)', () => {
    expect(kpiRow).toContain('(stockRows?.filter((p) => p.store === b.name && (p.lastSupplierName != null)) ?? []).length > 0');
    expect(kpiRow).toContain('stockRows?.filter((p) => p.store === b.name && p.lastSupplierName).map((p) => p.lastSupplierName) ?? []');
  });
});
