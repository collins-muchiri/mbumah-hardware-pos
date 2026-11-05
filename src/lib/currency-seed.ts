// MBUMAH HARDWARE POS - Branch-default currency seed (v2.408.0)
//
// THE BRANCH SPEAKS FIRST: v2.407.0 made the branch's default currency a
// REAL, persisted, API-served setting (SystemConfig `store:{id}:default_currency`
// via /api/settings/currency). This lib closes the loop on the display
// side: a session whose user has never explicitly chosen a display currency
// greets the branch's choice instead of silently staying on KES.
//
// THE SEED LAW (three honest refusals — a seed is a courtesy, never a fight):
//   1. the branch never chose (`isDefault: true`) → nothing to seed — KES
//      stays, and it stays HONEST (the platform default, not a manufactured
//      choice);
//   2. the user already chose (`currencyChosen: true` — only the switcher's
//      ONE write path plants the flag) → the human hand always wins;
//   3. the wire fails or answers junk → the seed is best-effort — KES stays,
//      no toast, no error surface (the switcher works exactly as before).
//
// THE RE-SEED HONESTY: the seed writes the code WITHOUT planting
// `currencyChosen`, so every fresh page load re-asks the wire — a branch
// default that changed overnight is honored on the next visit. The flag
// exists precisely so this courtesy can never override an explicit choice.
//
// THE ONCE-A-PAGE LAW: N switcher mounts (top bar, org console banner, the
// org desk) share ONE module-level promise — the wire is asked at most once
// per page load, whoever mounts first.

import { useAppStore } from '@/lib/stores';
import type { CurrencyCode } from '@/lib/currency-utils';

/** The wire body /api/settings/currency answers (the fields the seed reads). */
export interface BranchCurrencyWire {
  defaultCurrency: CurrencyCode;
  isDefault: boolean;
}

/** The seed's decision, pure — the one truth the runner and the tests share. */
export function resolveSeed(
  state: { activeCurrency: CurrencyCode; currencyChosen: boolean },
  wire: BranchCurrencyWire | null | undefined,
): CurrencyCode | null {
  if (!wire) return null; // the wire failed or answered nothing (refusal 3)
  if (wire.isDefault) return null; // the branch never chose (refusal 1)
  if (state.currencyChosen) return null; // the user's hand wins (refusal 2)
  if (state.activeCurrency === wire.defaultCurrency) return null; // already there
  return wire.defaultCurrency;
}

/** The wire fetch — the same bearer contract the switcher's authedFetch keeps. */
async function fetchBranchCurrency(): Promise<BranchCurrencyWire | null> {
  try {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('mbt_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch('/api/settings/currency', {
      headers,
      credentials: 'same-origin',
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: BranchCurrencyWire };
    if (!body?.data || typeof body.data.defaultCurrency !== 'string') return null;
    return body.data;
  } catch {
    return null;
  }
}

let seedPromise: Promise<void> | null = null;

/**
 * Seed the session's display currency from the branch default (once per
 * page load — N mounts share the promise). Fire-and-forget safe: every
 * refusal is a silent no-op, the store is written only when the seed
 * genuinely changes something.
 */
export function seedCurrencyFromBranch(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const wire = await fetchBranchCurrency();
      const seed = resolveSeed(useAppStore.getState(), wire);
      if (seed) {
        // NOT setActiveCurrency — planting `currencyChosen` would turn this
        // courtesy into an override of a choice nobody made.
        useAppStore.setState({ activeCurrency: seed });
      }
    })();
  }
  return seedPromise;
}

/** Test hook: forget the once-a-page guard (the suite's isolation law). */
export function resetSeedGuard(): void {
  seedPromise = null;
}
