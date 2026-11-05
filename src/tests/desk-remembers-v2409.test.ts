import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveSeed } from '../lib/currency-seed';
import { useAppStore } from '../lib/stores';
import {
  ensureAppStoreHydration,
  // the hook is exercised by the byte-pins below (a jsdom render of the
  // console page would drag the whole shell in — the store contract is the
  // round's truth, the mounts are the byte-pins' business)
} from '../lib/app-store-hydration';
import {
  seedCurrencyFromBranch,
  resetSeedGuard,
} from '../lib/currency-seed';

/**
 * v2.409.0 — the desk remembers.
 *
 * The opening QA burst LIVE-PROVED an honesty-law violation the moment the
 * org desk entered the seed's reach: the app store persists with
 * `skipHydration: true` and only the tabs SPA's boot ever asked for the
 * persisted state back — on the org desk the branch-default seed read the
 * FACTORY state (`currencyChosen: false`), a branch default STEAMROLLED an
 * explicit choice sitting unread in localStorage (KES/true → reload →
 * USD/false, browser-verified), and the write-back then DESTROYED that
 * choice in storage. This round: surfaces ask (app-store-hydration.ts),
 * the seed waits for the answer (never initiating a rehydrate — the SPA's
 * deep-link ordering law owns that), the greeting wears its exact
 * provenance (the transient `seededFromBranch` stamp feeds the trigger's
 * emerald dot), and the audit desk's lens persists across visits
 * (`consoleDeskFilter`). The debt pool's biggest single file stood down
 * with it: db.ts's twenty-four immutability faces via the guard factory
 * typed by each model's REAL Prisma mutation bags, the tenant `where`'s
 * AND finally typed, and the payroll engine re-exports the four names its
 * callers always addressed through it (331 → 299).
 */

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const storesLib = readRepo('src/lib/stores.ts');
const seedLib = readRepo('src/lib/currency-seed.ts');
const hydrationLib = readRepo('src/lib/app-store-hydration.ts');
const switcher = readRepo('src/components/currency-switcher.tsx');
const consolePage = readRepo('src/app/(shell)/console/page.tsx');
const orgConsole = readRepo('src/components/workspace/org-console.tsx');
const engine = readRepo('src/lib/hr/payroll/engine.ts');
const dbLib = readRepo('src/lib/db.ts');

// ── 0. the round's pure law re-pinned (the refusal table is one truth) ────

describe('the seed law holds (resolveSeed, one truth)', () => {
  it('an explicit choice refuses the branch default — the law that was broken live', () => {
    expect(
      resolveSeed(
        { activeCurrency: 'KES', currencyChosen: true },
        { defaultCurrency: 'USD', isDefault: false },
      ),
    ).toBeNull();
  });
});

// ── 1. THE DESK REMEMBERS (runtime — the steamroll regression) ────────────

const FACTORY = {
  activeCurrency: 'KES' as const,
  currencyChosen: false,
  seededFromBranch: false,
  consoleDeskFilter: { reviewer: null, branch: null },
};

afterEach(() => {
  resetSeedGuard();
  vi.unstubAllGlobals();
  useAppStore.setState({ ...FACTORY });
  localStorage.clear();
});

describe('the seed decides on the visitor’s TRUE state, never the factory one', () => {
  it('a persisted explicit choice survives a concurrent boot + seed (KES/true stays)', async () => {
    // The org desk's real order: storage holds the choice, the page mounts,
    // the boot effect and the switcher's seed effect fire in the same beat.
    localStorage.setItem(
      'mbt_app_store',
      JSON.stringify({
        state: { ...FACTORY, activeCurrency: 'KES', currencyChosen: true },
        version: 0,
      }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ data: { defaultCurrency: 'USD', isDefault: false } })),
      ),
    );
    await Promise.all([ensureAppStoreHydration(), seedCurrencyFromBranch()]);
    const s = useAppStore.getState();
    expect(s.activeCurrency).toBe('KES');
    expect(s.currencyChosen).toBe(true);
    expect(s.seededFromBranch).toBe(false);
  });

  it('a fresh session still greets the branch default — and stamps the provenance', async () => {
    localStorage.setItem(
      'mbt_app_store',
      JSON.stringify({ state: { ...FACTORY }, version: 0 }),
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ data: { defaultCurrency: 'USD', isDefault: false } })),
      ),
    );
    await Promise.all([ensureAppStoreHydration(), seedCurrencyFromBranch()]);
    const s = useAppStore.getState();
    expect(s.activeCurrency).toBe('USD');
    expect(s.currencyChosen).toBe(false); // the re-seed honesty: no flag planted
    expect(s.seededFromBranch).toBe(true); // the greeting's provenance, exact
  });

  it('the seed never initiates the rehydrate it waits for (the ordering law)', () => {
    // The body must AWAIT hydration, not fire a second rehydrate beside the
    // SPA boot's own (a late rehydrate could clobber a consumed deep link).
    expect(seedLib).toContain('awaitHydratedState()');
    expect(seedLib).not.toContain('persist.rehydrate()');
    expect(seedLib).toContain('onFinishHydration');
    expect(seedLib).toContain('setTimeout(release');
  });

  it('the boot is once-per-page and best-effort', () => {
    expect(hydrationLib).toContain('if (!hydrationPromise)');
    expect(hydrationLib).toContain('catch {');
  });
});

// ── 2. the greeting wears its source (the dot's provenance) ───────────────

describe('the greeting dot reads exact provenance', () => {
  it('the stamp is transient — absent from partialize, re-stamped per seed', () => {
    const partializeBlock = storesLib.slice(
      storesLib.lastIndexOf('partialize: (state) => ({'),
      storesLib.indexOf('consoleDeskFilter: state.consoleDeskFilter'),
    );
    expect(partializeBlock).not.toContain('seededFromBranch');
    expect(seedLib).toContain("setState({ activeCurrency: seed, seededFromBranch: true })");
  });

  it('the trigger renders the dot only while the greeting is unchosen', () => {
    expect(switcher).toContain('(s) => s.seededFromBranch && !s.currencyChosen');
    expect(switcher).toContain("title=\"Greeted by your branch's default display currency");
    expect(switcher).toContain('bg-emerald-500 dark:bg-emerald-400');
  });

  it('a human hand ends the greeting: the write path plants the flag, never the stamp', () => {
    expect(storesLib).toContain(
      'setActiveCurrency: (currency) => set({ activeCurrency: currency, currencyChosen: true })',
    );
    // the switcher's ONE write path never touches the stamp
    expect(switcher).not.toContain('seededFromBranch: true');
  });
});

// ── 3. the audit desk's lens (persisted drill-down) ───────────────────────

describe('the audit desk remembers its lens', () => {
  it('the factory lens is the honest org view (null pair)', () => {
    expect(useAppStore.getState().consoleDeskFilter).toEqual({
      reviewer: null,
      branch: null,
    });
  });

  it('the setter normalizes undefined legs to null and writes through', () => {
    useAppStore
      .getState()
      .setConsoleDeskFilter({ reviewer: 'Grace Wanjiru', branch: undefined as unknown as null });
    expect(useAppStore.getState().consoleDeskFilter).toEqual({
      reviewer: 'Grace Wanjiru',
      branch: null,
    });
  });

  it('the lens rides the persisted blob (partialize) and old blobs answer the factory', () => {
    expect(storesLib).toContain('consoleDeskFilter: state.consoleDeskFilter');
    // the round's own regression: hydration restored a PERSISTED lens. The
    // boot lib is once-per-page by design — this test asks the store's own
    // API directly (the same call the boot wraps).
    localStorage.setItem(
      'mbt_app_store',
      JSON.stringify({
        state: {
          ...FACTORY,
          consoleDeskFilter: { reviewer: 'Grace Wanjiru', branch: 'store_juja_main' },
        },
        version: 0,
      }),
    );
    return Promise.resolve(useAppStore.persist.rehydrate()).then(() => {
      expect(useAppStore.getState().consoleDeskFilter).toEqual({
        reviewer: 'Grace Wanjiru',
        branch: 'store_juja_main',
      });
    });
  });

  it('the console page drives the panel FROM the store (one source of truth)', () => {
    expect(consolePage).toContain('useAppStore((s) => s.consoleDeskFilter)');
    expect(consolePage).toContain('useAppStore((s) => s.setConsoleDeskFilter)');
    expect(consolePage).toContain('useAppStoreHydration()');
    expect(orgConsole).toContain('useAppStoreHydration()');
  });
});

// ── 4. the debt that stood down with the round (299) ──────────────────────

describe('the ORM guard speaks its models’ real types', () => {
  it('the immutability guard is ONE factory typed per model — no loose bag left', () => {
    expect(dbLib).toContain('function immutabilityGuard<');
    expect(dbLib.match(/immutabilityGuard</g)?.length).toBe(7); // 1 def + 6 call sites
    expect(dbLib).toContain('Prisma.JournalEntryUpdateArgs,');
    expect(dbLib).toContain('Prisma.TrialBalanceSnapshotDeleteManyArgs');
    // the six factory call sites each carry ALL FOUR real mutation bags
    for (const model of [
      'JournalEntry',
      'JournalEntryLine',
      'SystemLog',
      'PayrollDetail',
      'AuditLog',
      'TrialBalanceSnapshot',
    ]) {
      expect(dbLib).toContain(`Prisma.${model}UpdateArgs,`);
      expect(dbLib).toContain(`Prisma.${model}UpdateManyArgs,`);
      expect(dbLib).toContain(`Prisma.${model}DeleteArgs,`);
      expect(dbLib).toContain(`Prisma.${model}DeleteManyArgs`);
    }
  });

  it('the tenant where finally types the AND it preserves', () => {
    expect(dbLib).toContain('AND?: unknown;');
    expect(dbLib).toContain('const existingAnd = Array.isArray(where.AND)');
  });

  it('the payroll engine is the door for its own four names', () => {
    expect(engine).toContain("export { PayrollGuardrailError } from './types';");
    expect(engine).toContain('export type {');
    expect(engine).toContain('PayslipInputEmployee,');
    expect(engine).toContain('ResolvedRateTable,');
  });
});
