// ─────────────────────────────────────────────────────────────────────────────
// Expiry day window (v2.317.0) - "the ledger answers the day"
// ─────────────────────────────────────────────────────────────────────────────
//
// The v2.316 counts door landed on ALL Expire rows; this round the
// ledger's date window speaks `?from=`/`?to=` and the counts door names
// its own sweep's EAT day, so the window opens on exactly the rows that
// sweep wrote. This file pins:
//
//   1. The window parser's truth table (src/lib/tab-url.ts
//      parseInitialDateRange): each param validates INDEPENDENTLY — a
//      real from with a garbage to keeps the from; malformed shapes and
//      non-calendar days (2026-02-30) answer ''; a malformed search
//      never throws.
//   2. The EAT day key (eatDayKey): UTC+3 (the formatEatStamp
//      convention), midnight-straddling timestamps land on the right
//      day, garbage answers ''.
//   3. The desk seeding (loyalty-tab.tsx): both date inputs seed lazily
//      from the parser with SSR guards.
//   4. The card face (org-console.tsx): the counts door computes its
//      day-window href FROM the type-only constant (garbage falls back
//      to the type-only door), the zero keeps the trail door, the
//      titles tell the two doors apart.
//   5. The housekeeping: scripts/qa-diag-* joins the gitignored QA home
//      (the two stale v2315 diag scripts vanish from git status).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { eatDayKey, parseInitialDateRange } from '@/lib/tab-url';

describe('parseInitialDateRange — the ?from=/&to= truth table (never strands)', () => {
  it('a real window rides both params', () => {
    expect(
      parseInitialDateRange('?tab=loyalty&view=transactions&type=EXPIRE&from=2026-10-31&to=2026-10-31'),
    ).toEqual({ from: '2026-10-31', to: '2026-10-31' });
  });

  it('each param validates INDEPENDENTLY (a garbage to never poisons the from)', () => {
    expect(parseInitialDateRange('?from=2026-10-31&to=nonsense')).toEqual({ from: '2026-10-31', to: '' });
    expect(parseInitialDateRange('?from=nonsense&to=2026-10-31')).toEqual({ from: '', to: '2026-10-31' });
  });

  it('malformed shapes and non-calendar days answer empty', () => {
    expect(parseInitialDateRange('?from=31/10/2026')).toEqual({ from: '', to: '' });
    expect(parseInitialDateRange('?from=2026-02-30')).toEqual({ from: '', to: '' }); // not a day
    expect(parseInitialDateRange('?from=2026-13-01')).toEqual({ from: '', to: '' }); // not a month
    expect(parseInitialDateRange('?from=')).toEqual({ from: '', to: '' });
    expect(parseInitialDateRange('')).toEqual({ from: '', to: '' });
  });

  it('a malformed search answers the empty window, never throws', () => {
    expect(parseInitialDateRange('??=//%')).toEqual({ from: '', to: '' });
  });
});

describe('eatDayKey — the sweep\'s EAT day (UTC+3, the formatEatStamp convention)', () => {
  it('maps a UTC timestamp to its EAT calendar day', () => {
    // 2026-10-31T20:00:00Z is 2026-10-31 23:00 EAT — the same day
    expect(eatDayKey('2026-10-31T20:00:00.000Z')).toBe('2026-10-31');
    // 2026-10-31T21:00:00Z is 2026-11-01 00:00 EAT — the day rolls over
    expect(eatDayKey('2026-10-31T21:00:00.000Z')).toBe('2026-11-01');
    // a midday sweep stays put
    expect(eatDayKey('2026-06-15T09:00:00.000Z')).toBe('2026-06-15');
  });

  it('a garbage timestamp answers empty (the caller falls back, never a broken link)', () => {
    expect(eatDayKey('not a date')).toBe('');
    expect(eatDayKey('')).toBe('');
  });
});

describe('the desk seeds its date window from the address bar (loyalty-tab.tsx)', () => {
  const tab = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');

  it('the window parser rides the tab-url import', () => {
    // the desk reads the window; eatDayKey is the CARD's builder (the
    // counts door) and lives only in org-console's import — the lint law
    // carries only what each file uses.
    // v2.318 trail: the import gains buildSearchWithoutParams (the
    // dismiss builder) — the pin follows the import, not the round.
    expect(tab.includes("import { buildSearchWithoutParams, parseInitialDateRange, parseInitialType, parseInitialView } from '@/lib/tab-url';")).toBe(true);
  });

  it('both date inputs seed lazily with SSR guards (empty input, never a stranded filter)', () => {
    expect(tab.includes('function initialDateFrom(): string {')).toBe(true);
    expect(tab.includes('function initialDateTo(): string {')).toBe(true);
    expect(tab.split("if (typeof window === 'undefined') return '';").length - 1).toBe(2);
    expect(tab.includes('useState<string>(initialDateFrom)')).toBe(true);
    expect(tab.includes('useState<string>(initialDateTo)')).toBe(true);
  });

  it('the one-writer-per-param law is written where the next reader meets it', () => {
    expect(tab.includes("v2.317.0: the ledger's DATE WINDOW answers the address bar too")).toBe(true);
  });
});

describe('the card face — the counts door names the day (org-console.tsx)', () => {
  const card = readFileSync('src/components/workspace/org-console.tsx', 'utf8');

  it('the counts href is computed FROM the type-only constant (one source, one build)', () => {
    expect(card.includes('const sweepDay = eatDayKey(run.at);')).toBe(true);
    expect(card.includes('`${EXPIRY_LEDGER_HREF}&from=${sweepDay}&to=${sweepDay}`')).toBe(true);
    expect(card.includes(': EXPIRY_LEDGER_HREF;')).toBe(true); // the garbage-stamp fallback
  });

  it('the two doors tell themselves apart in the tooltips', () => {
    expect(card.includes('title="Open the loyalty ledger, filtered on Expire rows from this sweep\'s day"')).toBe(true);
    expect(card.includes('title="Open the loyalty ledger, filtered on Expire rows"')).toBe(true);
  });

  it('the day-key import rides the card (tab-url is client-safe)', () => {
    expect(card.includes("import { eatDayKey } from '@/lib/tab-url';")).toBe(true);
  });

  it('the both-mounts law still holds (one render function, two doors)', () => {
    expect(card.split('function expiryRunLine(').length - 1).toBe(1);
    expect(card.split('expiryRunLine(automation.lastExpiryRun)').length - 1).toBe(2);
  });
});

describe('the housekeeping — the qa-diag scripts join the gitignored home', () => {
  it('the gitignore rule exists (the two stale v2315 diag scripts vanish from status)', () => {
    const gitignore = readFileSync('.gitignore', 'utf8');
    expect(gitignore.includes('scripts/qa-diag-*')).toBe(true);
  });
});
