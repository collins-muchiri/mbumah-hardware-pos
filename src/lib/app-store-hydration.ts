// MBUMAH HARDWARE POS - App-store hydration boot (v2.409.0)
//
// THE DESK REMEMBERS: the app store persists with `skipHydration: true` —
// a surface must ASK for its persisted state back. Only the tabs SPA's boot
// ((shell)/page.tsx) ever asked; every OTHER surface that mounts the app
// store (the org desk's /console banner, the org console's own switcher)
// silently ran on FACTORY state. For the sidebar that was a cosmetic quirk;
// once v2.408.0's branch-default seed started READING the store to decide,
// factory state became a lie with teeth: the seed saw `currencyChosen:
// false` on the org desk, a branch default steamrolled an explicit choice
// that sat unread in localStorage, and the seed's write-back then destroyed
// that choice in storage (LIVE-PROVEN: KES/true → reload → USD/false).
//
// THE ORDERING LAW (why the seed must never call rehydrate itself): on the
// tabs SPA the boot chains consumeDeepLink AFTER its rehydrate settles
// ("rehydrate() resolves async and would overwrite a synchronous
// setActiveTab"). A SECOND rehydrate fired by the seed could resolve after
// the deep link was consumed and clobber the asked tab. So surfaces own
// their boot, and the seed only WAITS for it (currency-seed.ts).
//
// THE ONCE-A-PAGE LAW: N mounts share one module-level promise — the same
// guard shape the seed itself keeps.

import { useEffect } from 'react';

import { useAppStore } from '@/lib/stores';

let hydrationPromise: Promise<void> | null = null;

/**
 * Rehydrate the persisted app store exactly once per page load. Idempotent
 * and best-effort: a surface whose storage fails boots on factory state,
 * exactly as before this lib existed.
 */
export function ensureAppStoreHydration(): Promise<void> {
  if (!hydrationPromise) {
    hydrationPromise = (async () => {
      try {
        await Promise.resolve(useAppStore.persist.rehydrate());
      } catch {
        // best-effort: the boot is a courtesy, never a fight
      }
    })();
  }
  return hydrationPromise;
}

/**
 * Mount-once boot for any surface that reads the persisted app store
 * (the org desk's console page, the org console). Effects run after
 * first paint; the seed's awaited read happens on the NEXT microtask
 * beat, so the decision always sees the visitor's TRUE state.
 */
export function useAppStoreHydration(): void {
  useEffect(() => {
    void ensureAppStoreHydration();
  }, []);
}
