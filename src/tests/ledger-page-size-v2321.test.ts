// ─────────────────────────────────────────────────────────────────────────────
// Ledger page size (v2.321.0) - "the ledger chooses its gait"
// ─────────────────────────────────────────────────────────────────────────────
//
// The ledger walked at a fixed 100 rows/page since the desk first
// spoke, and the API door parsed `page`/`limit` with a raw parseInt —
// a garbage param rode NaN straight into Prisma's skip/take and the
// route answered 500 (live-proven at round start: ?limit=abc → 500,
// ?page=abc → 500; the same bug class the v2.318 law fixed for dates).
// This round the desk chooses its gait, and the door speaks honestly.
// This file pins:
//
//   1. The LIMIT parser's truth table (src/lib/tab-url.ts
//      parseInitialLimit): the vocabulary's SIXTH word (`?limit=`,
//      collision-checked — no shell/address-bar reader of `limit`
//      exists in src/). The law is MEMBERSHIP, not shape: the desk
//      offers exactly three gaits (LEDGER_PAGE_SIZES 50/100/200), and
//      anything missing, malformed, or BETWEEN the gaits answers 100 —
//      a gait the desk cannot offer must never ride the state.
//   2. The door's honest integers (parsePositiveIntParam /
//      parseClampedIntParam): digits or fallback; the page stays
//      shape-not-existence (past-the-end honest, never clamped away);
//      the take clamps into [1, 200] — the wire never takes more than
//      the house's largest gait, and a garbage param is never a 500.
//   3. The desk (loyalty-tab.tsx): the SSR-guarded gait seed, the gait
//      in BOTH the query key and the wire's `limit` param, the
//      scope-reset law extended (the gait rides the scope key — a page
//      honest at 100/page can be past the end at 200/page — while the
//      deep-linked ?page=2&limit=50 still lands whole), and the gait
//      Select in the toolbar (a CONTROL, not a status — the pager bar
//      renders only when a second page exists, the v2.320 law).
//   4. The pin evolutions: the tab-url import gains parseInitialLimit
//      in the FIVE earlier trail files (the pin follows the import,
//      not the round).
//   5. The ancestors sweep (scripts/verify-ancestors.mjs): Task 27's
//      pin unwind, part two — the fleet of ~295 stale-by-design gates
//      runs under ONE command and its drift is classified (PASS /
//      version-tide DRIFT / SIGNAL), so stale is visible, not silent.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { LEDGER_PAGE_SIZES, parseInitialLimit, parsePositiveIntParam, parseClampedIntParam } from '@/lib/tab-url';

describe('LEDGER_PAGE_SIZES — three doors, one vocabulary', () => {
  it('the array is exactly the three gaits, in ascending order', () => {
    expect([...LEDGER_PAGE_SIZES]).toEqual([50, 100, 200]);
  });
});

describe('parseInitialLimit — the ?limit= truth table (membership, not shape)', () => {
  it('a gait the desk offers seeds the state', () => {
    expect(parseInitialLimit('?limit=50')).toBe(50);
    expect(parseInitialLimit('?limit=100')).toBe(100);
    expect(parseInitialLimit('?limit=200')).toBe(200);
    expect(parseInitialLimit('?tab=loyalty&view=transactions&limit=50')).toBe(50);
  });

  it('leading zeros are still integers that name an offered gait', () => {
    expect(parseInitialLimit('?limit=050')).toBe(50);
    expect(parseInitialLimit('?limit=0100')).toBe(100);
  });

  it('anything the desk cannot offer answers the fallback (100)', () => {
    expect(parseInitialLimit('?limit=150')).toBe(100); // BETWEEN the gaits
    expect(parseInitialLimit('?limit=250')).toBe(100); // beyond the largest
    expect(parseInitialLimit('?limit=10')).toBe(100);  // below the smallest
    expect(parseInitialLimit('?limit=0')).toBe(100);
    expect(parseInitialLimit('?limit=-50')).toBe(100);
    expect(parseInitialLimit('?limit=50.5')).toBe(100);
    expect(parseInitialLimit('?limit=abc')).toBe(100);
    expect(parseInitialLimit('?limit=')).toBe(100);
    expect(parseInitialLimit('?view=transactions')).toBe(100);
    expect(parseInitialLimit('')).toBe(100);
  });

  it('a malformed search never throws', () => {
    expect(parseInitialLimit('??=//%')).toBe(100);
  });

  it('an explicit fallback is honored', () => {
    expect(parseInitialLimit('?limit=garbage', 50)).toBe(50);
    expect(parseInitialLimit('', 200)).toBe(200);
  });
});

describe('the door — honest integers at the API (never a NaN 500 again)', () => {
  it('parsePositiveIntParam: digits and >= min, else the fallback (shape, not existence)', () => {
    expect(parsePositiveIntParam('2', 1)).toBe(2);
    expect(parsePositiveIntParam('999999', 1)).toBe(999999); // past-the-end is honest
    expect(parsePositiveIntParam('0', 1)).toBe(1);
    expect(parsePositiveIntParam('-3', 1)).toBe(1);
    expect(parsePositiveIntParam('2.5', 1)).toBe(1);
    expect(parsePositiveIntParam('abc', 1)).toBe(1);
    expect(parsePositiveIntParam('', 1)).toBe(1);
    expect(parsePositiveIntParam(null, 1)).toBe(1);
  });

  it('parseClampedIntParam: the intent is served inside [min, max]', () => {
    expect(parseClampedIntParam('50', 50, 1, 200)).toBe(50);
    expect(parseClampedIntParam('150', 50, 1, 200)).toBe(150); // the wire serves what the desk doesn't offer
    expect(parseClampedIntParam('500', 50, 1, 200)).toBe(200); // the house's largest gait bounds the take
    expect(parseClampedIntParam('0', 50, 1, 200)).toBe(1);
    expect(parseClampedIntParam('abc', 50, 1, 200)).toBe(50);
    expect(parseClampedIntParam('', 50, 1, 200)).toBe(50);
    expect(parseClampedIntParam(null, 50, 1, 200)).toBe(50);
  });
});

describe('the desk — the gait rides the toolbar, the scope, and the wire', () => {
  const tab = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');
  const route = readFileSync('src/app/api/loyalty/transactions/route.ts', 'utf8');

  it('the gait seed is SSR-guarded and reads the sixth vocabulary word', () => {
    expect(tab.includes('function initialTxLimit(): number {')).toBe(true);
    expect(tab.includes('return parseInitialLimit(window.location.search, 100);')).toBe(true);
    expect(tab.includes("if (typeof window === 'undefined') return 100;")).toBe(true);
  });

  it('the gait rides BOTH the query key and the wire (a different slice, never a constant)', () => {
    expect(tab.includes('txDateFrom, txDateTo, txPage, txLimit]')).toBe(true);
    expect(tab.includes('limit: txLimit,')).toBe(true);
    expect(tab.includes('page: txPage,')).toBe(true);
  });

  it('the scope-reset law wears the gait: a gait change re-anchors to page 1, the mount seed survives', () => {
    expect(tab.includes('const txScopeKey = `${txTypeFilter}|${txDateFrom}|${txDateTo}|${txLimit}`;')).toBe(true);
    expect(tab.includes('const txPrevScopeKey = useRef(txScopeKey);')).toBe(true);
    expect(tab.includes('setTxPage(1);')).toBe(true);
    expect(tab.includes('THE GAIT FOLLOWS THE SCOPE TOO')).toBe(true);
  });

  it('the gait Select lives in the TOOLBAR (a control, not a conditional status)', () => {
    expect(tab.includes('data-testid="tx-page-size"')).toBe(true);
    expect(tab.includes('aria-label="Rows per page"')).toBe(true);
    expect(tab.includes('onValueChange={(v) => setTxLimit(parseInt(v, 10))}')).toBe(true);
    expect(tab.includes('<SelectItem value="50">')).toBe(true);
    expect(tab.includes('<SelectItem value="100">')).toBe(true);
    expect(tab.includes('<SelectItem value="200">')).toBe(true);
    // the control sits BEFORE the conditional pager bar in the render
    expect(tab.indexOf('data-testid="tx-page-size"')).toBeLessThan(tab.indexOf('data-testid="tx-pager"'));
  });

  it('the gait digits wear tabular-nums (the v2.319 digit law)', () => {
    expect(tab.includes('<span className="tabular-nums">50 / page</span>')).toBe(true);
    expect(tab.includes('<span className="tabular-nums">200 / page</span>')).toBe(true);
  });

  it('the door reads its numbers THROUGH the honest-param laws (the v2.318 law extends)', () => {
    expect(route.includes("import { honestDayKey, parseClampedIntParam, parsePositiveIntParam } from '@/lib/tab-url';")).toBe(true);
    expect(route.includes("parsePositiveIntParam(searchParams.get('page'), 1)")).toBe(true);
    expect(route.includes("parseClampedIntParam(searchParams.get('limit'), 50, 1, 200)")).toBe(true);
    expect(route.includes("parseInt(searchParams.get('page')")).toBe(false);
    expect(route.includes("parseInt(searchParams.get('limit')")).toBe(false);
    expect(route.includes('THE DOOR IS HONEST ABOUT ITS NUMBERS')).toBe(true);
  });
});

describe('the trail — the pin follows the import, not the round', () => {
  it('the tab-url import carries the sixth word in the desk and all five trail files', () => {
    const evolved = "import { buildSearchWithoutParams, parseInitialDateRange, parseInitialLimit, parseInitialPage, parseInitialType, parseInitialView } from '@/lib/tab-url';";
    const desk = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');
    expect(desk.includes(evolved)).toBe(true);
    for (const trail of [
      'src/tests/receipt-trail-v2311.test.ts',
      'src/tests/expiry-ledger-link-v2316.test.ts',
      'src/tests/expiry-day-window-v2317.test.ts',
      'src/tests/expiry-window-dismiss-v2318.test.ts',
      'src/tests/ledger-pager-v2320.test.ts',
    ]) {
      const bytes = readFileSync(trail, 'utf8');
      expect(bytes.includes(evolved), trail).toBe(true);
      expect(bytes.includes('v2.321'), trail).toBe(true);
    }
  });
});

describe('the ancestors sweep — the pin unwind, part two (Task 27)', () => {
  const sweep = readFileSync('scripts/verify-ancestors.mjs', 'utf8');
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

  it('the sweep exists and is wired as verify:ancestors', () => {
    expect(pkg.scripts['verify:ancestors']).toBe('node scripts/verify-ancestors.mjs');
  });

  it('it enumerates the fleet from package.json (the wired truth, not a hardcoded list)', () => {
    expect(sweep.includes("name.startsWith('verify:v2-')")).toBe(true);
    expect(sweep.includes('verify-v2-')).toBe(true); // the regex token (source bytes escape the slash)
    expect(sweep.includes('spawnSync')).toBe(true);
  });

  it('it classifies drift: PASS, version-tide DRIFT, and SIGNAL — with an honest exit', () => {
    expect(sweep.includes('signals > 0 || errors > 0')).toBe(true);
    expect(sweep.includes('--strict')).toBe(true);
    expect(sweep.includes('FAIL_LINE')).toBe(true);
    expect(sweep.includes('nonVersion')).toBe(true);
  });

  it('it names the four fail-line conventions the fleet speaks across its eras', () => {
    expect(sweep.includes('x FAIL')).toBe(true);
    expect(sweep.includes('[FAIL]')).toBe(true);
    expect(sweep.includes('FAIL:')).toBe(true);
    expect(sweep.includes('FAIL[:\\s]')).toBe(true); // the v2.238–249 bare face
  });
});
