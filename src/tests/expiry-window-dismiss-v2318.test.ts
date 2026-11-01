// ─────────────────────────────────────────────────────────────────────────────
// Expiry window dismiss + echo (v2.318.0) - "the window answers back"
// ─────────────────────────────────────────────────────────────────────────────
//
// The v2.317 window opened on the address bar's word alone; this round the
// window can LEAVE and the wire ANSWERS. This file pins:
//
//   1. The dismiss law (src/lib/tab-url.ts buildSearchWithoutParams):
//      ONLY the named params are removed — tab/view/type ride untouched
//      (the mirror of buildTabSearch's preserve law); unknown names are a
//      no-op; an empty result answers ''; a malformed search never throws.
//   2. The honest-day law goes PUBLIC (honestDayKey exported): shape must
//      be YYYY-MM-DD and the day must be REAL (the V8 round-trip law —
//      2026-02-30 parses through to 2026-03-02, so the re-format must
//      match the exact bytes).
//   3. The API door (api/loyalty/transactions/route.ts): the query's date
//      params are read THROUGH the law (a garbage param used to mint an
//      Invalid Date → Prisma validation error → 500; now dropped), and
//      the wire echoes the window it actually applied.
//   4. The envelope (src/lib/api.ts): the additive `window` field rides
//      ApiResponse (same law as costGated — every other wire answers
//      undefined).
//   5. The desk (loyalty-tab.tsx): the × chip (present only while a
//      window is active, the amber wardrobe, the tooltip) scrubs ONLY
//      from/to from the address bar; the stamp renders the WIRE's echo
//      (never the inputs) with the total matching rows.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildSearchWithoutParams, honestDayKey } from '@/lib/tab-url';

describe('buildSearchWithoutParams — the dismiss law (remove ONLY the named voices)', () => {
  it('from/to are scrubbed; tab, view and type ride untouched, in order', () => {
    expect(
      buildSearchWithoutParams(
        '?tab=loyalty&view=transactions&type=EXPIRE&from=2026-10-31&to=2026-10-31',
        ['from', 'to'],
      ),
    ).toBe('?tab=loyalty&view=transactions&type=EXPIRE');
  });

  it('unknown names are a no-op (the search keeps every voice it had)', () => {
    expect(buildSearchWithoutParams('?tab=loyalty&view=transactions', ['from', 'to'])).toBe(
      '?tab=loyalty&view=transactions',
    );
  });

  it('an empty result answers empty (no dangling ?)', () => {
    expect(buildSearchWithoutParams('?from=2026-10-31', ['from'])).toBe('');
  });

  it('a malformed search never throws, and the named voices are still gone', () => {
    const out = buildSearchWithoutParams('??=//%&from=2026-10-31', ['from']);
    expect(out.includes('from=')).toBe(false);
  });
});

describe('honestDayKey goes public — the one law at both day-key doors', () => {
  it('a real calendar day passes through unchanged', () => {
    expect(honestDayKey('2026-10-31')).toBe('2026-10-31');
    expect(honestDayKey('2026-02-28')).toBe('2026-02-28'); // a leap-adjacent Feb day
  });

  it('a non-calendar day answers empty (the V8 round-trip law)', () => {
    // V8 parses 2026-02-30 THROUGH to 2026-03-02 — only the re-format
    // catching the byte mismatch keeps the law honest.
    expect(honestDayKey('2026-02-30')).toBe('');
    expect(honestDayKey('2026-13-01')).toBe('');
  });

  it('the wrong shape answers empty', () => {
    expect(honestDayKey('31/10/2026')).toBe('');
    expect(honestDayKey('2026-10-31T00:00:00Z')).toBe('');
    expect(honestDayKey('')).toBe('');
    expect(honestDayKey(null)).toBe('');
  });
});

describe('the API door — the window is honest at /api/loyalty/transactions too', () => {
  const route = readFileSync('src/app/api/loyalty/transactions/route.ts', 'utf8');

  it('the route reads the query THROUGH the honest-day law (no raw new Date())', () => {
    expect(route.includes("import { honestDayKey } from '@/lib/tab-url';")).toBe(true);
    expect(route.includes("honestDayKey(searchParams.get('dateFrom'))")).toBe(true);
    expect(route.includes("honestDayKey(searchParams.get('dateTo'))")).toBe(true);
  });

  it('the 500 law is written where the next reader meets it', () => {
    expect(route.includes('THE WINDOW IS HONEST AT THE API DOOR TOO')).toBe(true);
  });

  it('the wire echoes the window it actually applied (post-validation)', () => {
    expect(route.includes('window: {')).toBe(true);
    expect(route.includes('from: dateFrom || null,')).toBe(true);
    expect(route.includes('to: dateTo || null,')).toBe(true);
  });
});

describe('the envelope — the additive window echo (src/lib/api.ts)', () => {
  const api = readFileSync('src/lib/api.ts', 'utf8');

  it('ApiResponse carries the optional window (same law as costGated)', () => {
    expect(api.includes('window?: {')).toBe(true);
    expect(api.includes('from: string | null;')).toBe(true);
    expect(api.includes('to: string | null;')).toBe(true);
    expect(api.includes('THE HONEST WINDOW ECHO')).toBe(true);
  });
});

describe('the desk — the window can leave, and the echo is worn (loyalty-tab.tsx)', () => {
  const tab = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');

  it('the tab-url import now carries the dismiss builder too (v2.318 evolution)', () => {
    expect(
      tab.includes(
        "import { buildSearchWithoutParams, parseInitialDateRange, parseInitialType, parseInitialView } from '@/lib/tab-url';",
      ),
    ).toBe(true);
  });

  it('the chip scrubs ONLY from/to, preserving tab/view/type (the one deliberate write)', () => {
    expect(tab.includes("buildSearchWithoutParams(window.location.search, ['from', 'to'])")).toBe(true);
    expect(tab.includes('window.history.replaceState(null')).toBe(true);
    expect(tab.includes('typeof window !== \'undefined\'')).toBe(true); // SSR guard on the write
  });

  it('the × chip exists: amber wardrobe, testid, aria-label, honest tooltip', () => {
    expect(tab.includes('dateWindowActive && (')).toBe(true);
    expect(tab.includes('data-testid="clear-date-window"')).toBe(true);
    expect(tab.includes('aria-label="Clear date window"')).toBe(true);
    expect(tab.includes('>Clear the date window</TooltipContent>')).toBe(true);
    expect(tab.includes('focus-visible:ring-amber-400')).toBe(true); // the Expiry desk's voice
  });

  it('the stamp wears the WIRE echo, never the inputs (and counts the rows)', () => {
    expect(tab.includes('data-testid="applied-window-stamp"')).toBe(true);
    expect(tab.includes('txData?.window && (txData.window.from || txData.window.to)')).toBe(true);
    expect(tab.includes("Window {txData.window.from || 'beginning'} → {txData.window.to || 'now'}")).toBe(true);
    expect(tab.includes('txData.pagination?.total')).toBe(true);
  });
});
