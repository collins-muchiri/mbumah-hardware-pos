// ─────────────────────────────────────────────────────────────────────────────
// Expiry ledger deep-link (v2.316.0) - "the sweep's counts walk to the ledger"
// ─────────────────────────────────────────────────────────────────────────────
//
// The org console's sweep line no longer dead-ends: both of its voices
// (the amber counts AND the healthy zero) deep-link
// `/?tab=loyalty&view=transactions&type=EXPIRE`, and the loyalty desk's
// type filter answers `?type=` on mount. This file pins:
//
//   1. The parser's truth table (src/lib/tab-url.ts parseInitialType): a
//      valid uppercase type rides; lowercase, unknown, missing, and
//      malformed searches answer the fallback — the param can never
//      strand the ledger in a filter its own Select does not offer.
//   2. The desk seeding (loyalty-tab.tsx): the five-type register (the
//      SAME types the Select offers), the SSR guard, and the lazy
//      useState seed.
//   3. The card face (org-console.tsx): both voices are <Link>s to the
//      one door, the amber survives, the focus ring is the Expiry
//      desk's own amber, and the both-mounts law still holds.
//   4. The housekeeping: package.json carries NO stale top-level
//      releaseVersion/baseVersion keys (2.267.0 dead weight, deleted) —
//      the live keys live under `mbumah.` where the deploy scripts read.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseInitialType, parseInitialView } from '@/lib/tab-url';

const TYPES = ['EARN', 'REDEEM', 'BONUS', 'EXPIRE', 'ADJUST'] as const;

describe('parseInitialType — the ?type= truth table (never strands the ledger)', () => {
  it('a valid uppercase type rides (the deep-link door: EXPIRE)', () => {
    expect(parseInitialType('?tab=loyalty&view=transactions&type=EXPIRE', TYPES, 'all')).toBe('EXPIRE');
    expect(parseInitialType('?type=EARN', TYPES, 'all')).toBe('EARN');
    expect(parseInitialType('?type=REDEEM', TYPES, 'all')).toBe('REDEEM');
    expect(parseInitialType('?type=BONUS', TYPES, 'all')).toBe('BONUS');
    expect(parseInitialType('?type=ADJUST', TYPES, 'all')).toBe('ADJUST');
  });

  it('lowercase is an unknown value, not a clever match (case-sensitive BY LAW)', () => {
    expect(parseInitialType('?type=expire', TYPES, 'all')).toBe('all');
    expect(parseInitialType('?type=Expire', TYPES, 'all')).toBe('all');
  });

  it('unknown, missing, and empty values answer the fallback', () => {
    expect(parseInitialType('?type=FOO', TYPES, 'all')).toBe('all');
    expect(parseInitialType('?type=', TYPES, 'all')).toBe('all');
    expect(parseInitialType('?tab=loyalty&view=transactions', TYPES, 'all')).toBe('all');
    expect(parseInitialType('', TYPES, 'all')).toBe('all');
  });

  it('a malformed search string answers the fallback, never throws', () => {
    expect(parseInitialType('??=//%', TYPES, 'all')).toBe('all');
  });

  it('the view vocabulary rides the same search untouched (both params, one door)', () => {
    const search = '?tab=loyalty&view=transactions&type=EXPIRE';
    expect(parseInitialView(search, ['tiers', 'members', 'transactions', 'campaigns'], 'tiers')).toBe('transactions');
    expect(parseInitialType(search, TYPES, 'all')).toBe('EXPIRE');
  });
});

describe('the desk seeds its filter from the address bar (loyalty-tab.tsx)', () => {
  const tab = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');

  it('imports the type parser alongside the view parser', () => {
    // v2.317.0 pin evolution (deliberate): the date-window parser joins
    // the import — the ledger answers ?from=/&to= now (the counts door
    // names its sweep's day); the window vocabulary's own voice is
    // pinned in expiry-day-window-v2317. (eatDayKey is the CARD's
    // builder and rides only org-console's import.)
    // v2.318.0 pin evolution (deliberate): buildSearchWithoutParams
    // joins — the window can leave (the × chip); the dismiss law's own
    // voice is pinned in expiry-window-dismiss-v2318.
    // v2.320.0 pin evolution (deliberate): parseInitialPage joins — the
    // pager lands on `?page=`; the pin follows the import, not the round.
    // v2.321.0 pin evolution (deliberate): parseInitialLimit joins — the
    // gait lands on `?limit=`; the pin follows the import, not the round.
    expect(tab.includes("import { buildSearchWithoutParams, parseInitialDateRange, parseInitialLimit, parseInitialPage, parseInitialType, parseInitialView } from '@/lib/tab-url';")).toBe(true);
  });

  it('the register is the SAME five types the ledger Select offers', () => {
    expect(tab.includes("const LOYALTY_TX_TYPES: readonly string[] = ['EARN', 'REDEEM', 'BONUS', 'EXPIRE', 'ADJUST'];")).toBe(true);
    // the Select's own options, for the record
    expect(tab.includes('<SelectItem value="EXPIRE">Expire</SelectItem>')).toBe(true);
    expect(tab.includes('<SelectItem value="EARN">Earn</SelectItem>')).toBe(true);
    expect(tab.includes('<SelectItem value="REDEEM">Redeem</SelectItem>')).toBe(true);
    expect(tab.includes('<SelectItem value="BONUS">Bonus</SelectItem>')).toBe(true);
    expect(tab.includes('<SelectItem value="ADJUST">Adjust</SelectItem>')).toBe(true);
  });

  it('the SSR guard answers "all" (no window, no filter)', () => {
    expect(tab.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
  });

  it('the filter state seeds lazily from the parser (one reader, no clobber)', () => {
    expect(tab.includes('useState<string>(initialTxTypeFilter)')).toBe(true);
    expect(tab.includes('function initialTxTypeFilter(): string {')).toBe(true);
    expect(tab.includes('parseInitialType(window.location.search, LOYALTY_TX_TYPES, \'all\')')).toBe(true);
  });
});

describe('the card face — both voices walk (org-console.tsx)', () => {
  const card = readFileSync('src/components/workspace/org-console.tsx', 'utf8');

  it('ONE door for both voices — the EXPIRE-filtered ledger deep-link', () => {
    expect(card.includes("const EXPIRY_LEDGER_HREF = '/?tab=loyalty&view=transactions&type=EXPIRE';")).toBe(true);
    // v2.317.0 pin evolution (deliberate): the counts door now rides its
    // sweep's EAT day (a computed href built FROM the constant — const,
    // the counts template, the garbage-stamp fallback, and the zero's
    // own mount = 4 mentions); the day-window voice is pinned in
    // expiry-day-window-v2317.
    expect(card.split('EXPIRY_LEDGER_HREF').length - 1).toBe(4);
  });

  it('both voices are hard-navigation anchors (the racy <Link> transition is retired)', () => {
    // the browser burst caught the client-side transition eating the ask:
    // HomePage's v2.313 capture reads the bar before Next's history update,
    // so the persisted desk won. A cross-console ask loads the shell fresh.
    expect(card.includes('<a\n              href={countsHref}\n              data-testid="automation-expiry-run-counts"')).toBe(true);
    expect(card.includes('<a\n              href={EXPIRY_LEDGER_HREF}\n              data-testid="automation-expiry-run-clean"')).toBe(true);
    expect(card.includes('THE HARD-NAVIGATION LAW')).toBe(true);
    // the v2.315 amber survives the link wardrobe
    expect(card.includes('tabular-nums text-amber-700 dark:text-amber-400')).toBe(true);
    expect(card.includes('text-amber-700 dark:text-amber-400')).toBe(true);
  });

  it('the link affordance is real: underline, hover deepen, focus ring in amber', () => {
    expect(card.includes('underline decoration-amber-600/40 underline-offset-2')).toBe(true);
    expect(card.includes('hover:decoration-amber-600')).toBe(true);
    expect(card.includes('focus-visible:ring-amber-400/70')).toBe(true);
    expect(card.includes('hover:text-amber-800 dark:hover:text-amber-300')).toBe(true);
    expect(card.includes('title="Open the loyalty ledger, filtered on Expire rows"')).toBe(true);
  });

  it('the both-mounts law still holds (one render function, two doors)', () => {
    expect(card.split('function expiryRunLine(').length - 1).toBe(1);
    expect(card.split('expiryRunLine(automation.lastExpiryRun)').length - 1).toBe(2);
  });

  it('the healthy zero keeps its voice', () => {
    expect(card.includes('nothing to expire')).toBe(true);
  });
});

describe('the housekeeping — the 2.267.0 dead weight is gone', () => {
  it('package.json has NO top-level releaseVersion/baseVersion keys', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as Record<string, unknown>;
    expect('releaseVersion' in pkg).toBe(false);
    expect('baseVersion' in pkg).toBe(false);
  });

  it('the LIVE keys live under mbumah. where the deploy scripts read them', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      mbumah?: { releaseVersion?: string; baseVersion?: string };
    };
    expect(typeof pkg.mbumah?.releaseVersion).toBe('string');
    expect(typeof pkg.mbumah?.baseVersion).toBe('string');
    expect(pkg.mbumah?.releaseVersion).toBe('2.340.0');
    expect(pkg.mbumah?.baseVersion).toBe('2.340.0');
  });

  it('the docs register carries the deep-link note', () => {
    const docs = readFileSync('docs/cron-operations.md', 'utf8');
    expect(docs.includes("**v2.316.0**: the sweep line's voices deep-link to the ledger")).toBe(true);
    expect(docs.includes('/?tab=loyalty&view=transactions&type=EXPIRE')).toBe(true);
  });
});
