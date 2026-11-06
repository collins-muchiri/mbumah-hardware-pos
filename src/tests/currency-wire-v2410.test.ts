import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rateCensus, wireAgeVoice, type RatesWireBody } from '../components/currency-switcher';

/**
 * v2.410.0 — the wire answers on mount.
 *
 * BUG 1 (carried since Task 125, CLOSED this round): on /console and the
 * org desk the switcher's two queries (`enabled: opened` — the v2.212.0
 * laziness law) NEVER fetched: the dropdown visibly opened while zero
 * requests left the browser (resource-timing empty, dev log silent, the
 * in-page fetch logger caught nothing), the rows rendered static
 * fallbacks, no branch-default chip, no freshness line. Four instrumented
 * agent-browser bursts split the mystery: a mid-boot open fired the
 * queries (chip rendered), a settled open never did, one run even showed
 * the whole switcher REMOUNT (trigger data-state open → gone → closed,
 * `opened` reset, the fetch never called). The open-gated laziness bought
 * silence with honesty. THE FIX: both queries answer on mount — the same
 * reliable path every other panel on these desks uses (the seed already
 * asked the branch-default wire on every page load, so the laziness
 * "savings" were already spent); the open is pure display again.
 *
 * THE ROUND ALSO ADDS THE RATE CENSUS STRIP: when the wire answered, the
 * footer counts its rows by provenance (N admin-set · N API · N built-in)
 * beside an age voice (fresh/aging/stale dot) — one glance tells the owner
 * whether the branch's rates are maintained or factory. Both voices are
 * PURE functions pinned here behaviorally, per the house law.
 */

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const switcher = readRepo('src/components/currency-switcher.tsx');
const section = readRepo('src/components/admin/currency-rates-section.tsx');

// ── 1. THE MOUNT LAW ──────────────────────────────────────────────────────

describe('the wire answers on mount (v2.410.0)', () => {
  it('both queries are enabled from the first render — exactly two enabled: true legs', () => {
    expect((switcher.match(/enabled: true,/g) ?? []).length).toBe(2);
  });

  it('the open-gated laziness is gone from the component — state, handler, and prop', () => {
    // the trailing-comma byte is the CODE form; the prose comments that
    // narrate the retirement may keep the phrase, the code may not
    expect(switcher).not.toMatch(/enabled: opened,/);
    expect(switcher).not.toMatch(/const \[opened, setOpened\]/);
    expect(switcher).not.toMatch(/handleOpenChange/);
    expect(switcher).not.toMatch(/<DropdownMenu onOpenChange=/);
  });

  it('the DropdownMenu is pure display — no query state behind the open', () => {
    expect(switcher).toMatch(/<DropdownMenu>/);
    expect(switcher).toMatch(/useEffect\(\(\) => \{\n    void seedCurrencyFromBranch\(\);\n  \}, \[\]\);/);
  });

  it('the no-polling half of the v2.212.0 law survives — both legs stay refetchInterval: false', () => {
    expect((switcher.match(/refetchInterval: false,/g) ?? []).length).toBe(2);
  });

  it('the one-wire cache law still binds both surfaces (v2.212.0 echo)', () => {
    expect(switcher).toMatch(/queryKey: ADMIN_CURRENCY_RATES_QUERY_KEY,/);
    expect(section).toMatch(/queryKey: ADMIN_CURRENCY_RATES_QUERY_KEY,/);
    expect(switcher).toMatch(/staleTime: 30_000,/);
  });
});

// ── 2. THE RATE CENSUS (pure, behavioral) ─────────────────────────────────

describe('the rate census (v2.410.0, pure)', () => {
  const entry = (code: string, source: string) => ({
    code,
    kesToRate: 1,
    source,
    updatedAt: null,
  });

  it('counts the wire rows by provenance — MANUAL, API, built-in', () => {
    const wire: RatesWireBody['data'] = {
      currencies: [
        entry('KES', 'STATIC'),
        entry('USD', 'MANUAL'),
        entry('UGX', 'API'),
        entry('TZS', 'STATIC'),
      ],
    };
    expect(rateCensus(wire?.currencies)).toEqual({
      manual: 1,
      api: 1,
      builtIn: 2,
      total: 4,
    });
  });

  it('is null on an empty or missing wire — honest absence, no invented zeros', () => {
    expect(rateCensus(undefined)).toBeNull();
    expect(rateCensus(null)).toBeNull();
    expect(rateCensus([])).toBeNull();
  });

  it('skips junk rows — a codeless entry is not a row to count', () => {
    const wire: RatesWireBody['data'] = {
      currencies: [
        entry('USD', 'MANUAL'),
        { code: undefined, kesToRate: 1, source: 'MANUAL', updatedAt: null } as never,
      ],
    };
    const census = rateCensus(wire?.currencies);
    expect(census).toEqual({ manual: 1, api: 0, builtIn: 0, total: 1 });
  });

  it('every non-MANUAL non-API source lands in builtIn — an unknown chip is a built-in row, never a lie about the count', () => {
    const wire: RatesWireBody['data'] = {
      currencies: [entry('USD', 'MANUAL'), entry('UGX', 'SOMETHING_NEW')],
    };
    expect(rateCensus(wire?.currencies)).toEqual({
      manual: 1,
      api: 0,
      builtIn: 1,
      total: 2,
    });
  });
});

// ── 3. THE AGE VOICE (pure, behavioral) ───────────────────────────────────

describe('the wire age voice (v2.410.0, pure)', () => {
  it('under 45 s answers fresh — the emerald dot', () => {
    expect(wireAgeVoice(0)).toEqual({
      label: 'fresh',
      dot: 'bg-emerald-500 dark:bg-emerald-400',
    });
    expect(wireAgeVoice(44_999)?.label).toBe('fresh');
  });

  it('45 s to 5 min answers aging — the amber dot', () => {
    expect(wireAgeVoice(45_000)).toEqual({
      label: 'aging',
      dot: 'bg-amber-500 dark:bg-amber-400',
    });
    expect(wireAgeVoice(4 * 60_000)?.label).toBe('aging');
  });

  it('5 min and beyond answers stale — the red dot', () => {
    expect(wireAgeVoice(5 * 60_000)).toEqual({
      label: 'stale',
      dot: 'bg-red-500 dark:bg-red-400',
    });
    expect(wireAgeVoice(60 * 60_000)?.label).toBe('stale');
  });

  it('an impossible clock answer renders nothing — never a wrong word', () => {
    expect(wireAgeVoice(-1)).toBeNull();
    expect(wireAgeVoice(Number.NaN)).toBeNull();
    expect(wireAgeVoice(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

// ── 4. THE STRIP (source bytes) ───────────────────────────────────────────

describe('the rate census strip renders after the freshness line (v2.410.0)', () => {
  it('the strip carries its own testid and an honest-absence gate', () => {
    expect(switcher).toMatch(/data-testid="currency-rate-census"/);
    expect(switcher).toMatch(/\{census && \(/);
    expect(switcher).toMatch(/\{ageVoice && \(/);
  });

  it('the census line speaks the three provenances with the age voice', () => {
    expect(switcher).toMatch(
      /\{census\.manual\} admin-set · \{census\.api\} API · \{census\.builtIn\} built-in/,
    );
    expect(switcher).toMatch(/\{ageVoice \? ` · \$\{ageVoice\.label\}` : ''\}/);
  });

  it('the strip sits BELOW the freshness line in the footer (the census is the read\u2019s summary)', () => {
    const freshnessAt = switcher.indexOf('{freshnessLabel && (');
    const censusAt = switcher.indexOf('data-testid="currency-rate-census"');
    expect(freshnessAt).toBeGreaterThan(-1);
    expect(censusAt).toBeGreaterThan(freshnessAt);
  });

  it('the strip rides the mono tabular voice — figures align, provenance reads', () => {
    expect(switcher).toMatch(
      /font-mono text-\[9px\] tabular-nums leading-tight text-muted-foreground/,
    );
    expect(switcher).toMatch(/bg-muted\/40 px-1\.5 py-1/);
  });

  it('the age dot is decorative only — the word beside it carries the meaning', () => {
    expect(switcher).toMatch(/aria-hidden\n\s+title="How long ago the wire answered this census"/);
  });
});

// ── 5. THE STYLING ROUND (source bytes) ───────────────────────────────────

describe('the dropdown\u2019s styling round (v2.410.0)', () => {
  it('the rows\u2019 rate figures ride the mono voice — aligned digits beside the chips', () => {
    expect(switcher).toMatch(/font-mono text-\[10px\] text-muted-foreground tabular-nums truncate/);
  });

  it('the active row wears a soft tint and an emerald rail (the branch-default chip\u2019s family)', () => {
    expect(switcher).toMatch(/active && 'bg-accent\/50',/);
    expect(switcher).toMatch(
      /before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0\.5 before:rounded-full before:bg-emerald-500\/80 dark:before:bg-emerald-400\/80/,
    );
  });

  it('the trigger echoes the open with a soft accent lift — surfaces with their own open voice still win', () => {
    expect(switcher).toMatch(/'data-\[state=open\]:bg-accent\/60',/);
    // the passed className stays LAST in the cn merge (the caller's voice wins)
    expect(switcher.indexOf("'data-[state=open]:bg-accent/60',")).toBeLessThan(
      switcher.indexOf('className,\n          )}'),
    );
  });
});

// ── 6. REGRESSION ECHOES (the v2.408/v2.409 laws untouched) ──────────────

describe('the seed and greeting laws survive the mount law (v2.408.0/v2.409.0 echoes)', () => {
  it('the branch-default chip keeps its gate and its emerald mono wardrobe', () => {
    expect(switcher).toContain("queryKey: ['branch-default-currency']");
    expect(switcher).toContain('branchDefaultQuery.data && !branchDefaultQuery.data.isDefault');
    expect(switcher).toContain(
      'border-emerald-200 bg-emerald-50 px-1.5 py-px font-mono text-[9px] font-medium leading-tight text-emerald-700',
    );
  });

  it('the greeting dot keeps its exact provenance feed', () => {
    expect(switcher).toContain('(s) => s.seededFromBranch && !s.currencyChosen');
    expect(switcher).toContain('bg-emerald-500 dark:bg-emerald-400');
  });

  it('the freshness voice keeps its v2.212.0 bytes (the census joins, nothing rewrites)', () => {
    expect(switcher).toMatch(
      /ratesQuery\.dataUpdatedAt > 0 \? new Date\(ratesQuery\.dataUpdatedAt\) : null/,
    );
    expect(switcher).toMatch(/`Wire read at \$\{readAt\.toLocaleTimeString/);
    expect(switcher).toMatch(/title=\{freshnessTitle\}\n\s+className="tabular-nums"/);
    expect(switcher).toMatch(/Rates are indicative \(display only\)\./);
    expect(switcher).toMatch(/Accounting currency remains KES\./);
    expect(switcher).toMatch(/Each chip names its source: admin-set, API, or built-in\./);
  });

  it('the trigger\u2019s hover truth keeps its adjacency (v2.212.0)', () => {
    expect(switcher).toMatch(/aria-haspopup="menu"\n\s+title=\{triggerTitle\}/);
  });
});
