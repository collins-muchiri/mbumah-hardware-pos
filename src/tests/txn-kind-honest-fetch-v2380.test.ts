// THE LENS RIDES PAST THE CAP (v2.380.0): the honest-fetch rider and the
// capped window's own voice.
//
// Two stories, one round:
//
// 1. THE HONEST-FETCH RIDER — v2.379.0 taught the server the desk's kind
//    vocabulary; this round the desk USES it. The whole-window fetch rides
//    the 200-row cap, and a capped mixed window used to answer a lens
//    with a SLICE: the newest 200 rows client-filtered — a false-empty
//    settlement lens (zero rows shown) while settlements lived beyond
//    the cap. Now the queryFn returns the rows AND the wire's
//    pagination.total (the count under the SAME where — the v2.379.0
//    shared-where law), so the truncation signal is EXACT, never a
//    length-guess. When the lens is active AND the window is capped, a
//    rider query fetches the SAME window with `kind` — the 200-row cap
//    counts LENS rows. The census stays WHOLE: it reads the unscoped
//    fetch; the scope rides only the lensed fetch.
// 2. THE CAPPED-WINDOW VOICE (the [Mandatory] styling detail) — a capped
//    window used to answer SILENTLY: the census tallies counted the
//    fetched slice while the wire's total said more. The desk now says
//    so — an amber honesty voice naming the slice and the whole, with a
//    rider-note when a lens is active, and the lens voice itself speaks
//    the rider's honest total with a spinner while the rider rides.
//
// Pins: the wire's kind serialization, the honest total read, the
// capped-window signal, the rider's key/enabled/ride bytes, the honest
// base swap, the census's untouched wholeness, the lens voice's honest
// count + spinner, and the capped-window voice's bytes. THE OD LAW:
// bytes, not memory.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const API_PATH = 'src/lib/api.ts';
const api = readFileSync(API_PATH, 'utf8');
const DESK_PATH = 'src/app/(shell)/tabs/transactions-tab.tsx';
const desk = readFileSync(DESK_PATH, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE WIRE — the kind word crosses the api boundary client-side too
// ---------------------------------------------------------------------------

describe('the wire speaks kind (v2.380.0)', () => {
  it('transactionsApi.list accepts the kind param', () => {
    expect(api).toContain('THE HONEST-FETCH RIDE');
    expect(api).toContain("paymentMethod?: string; kind?: string; dateFrom?: string; dateTo?: string");
  });

  it('the kind param serializes onto the query string', () => {
    expect(api).toContain("if (params?.kind) query.set('kind', params.kind);");
  });
});

// ---------------------------------------------------------------------------
// 2. THE HONEST WINDOW — the exact truncation signal, never a length-guess
// ---------------------------------------------------------------------------

describe('the honest window total (v2.380.0)', () => {
  it('the whole-window queryFn returns the rows AND the wire\u2019s own total', () => {
    expect(desk).toContain('THE HONEST WINDOW TOTAL');
    expect(desk).toContain(
      'return { rows, total: res.pagination?.total ?? rows.length };'
    );
  });

  it('the transactions memo reads the rows slot (the shape law)', () => {
    expect(desk).toContain('() => (transactionsData?.rows ?? []),');
  });

  it('the capped-window signal is EXACT: the wire count outranks the slice', () => {
    expect(desk).toContain('THE CAPPED-WINDOW SIGNAL');
    expect(desk).toContain('const windowTotal = transactionsData?.total ?? 0;');
    expect(desk).toContain('const windowCapped = windowTotal > transactions.length;');
  });
});

// ---------------------------------------------------------------------------
// 3. THE RIDER — the lens fetches its own scope past the cap
// ---------------------------------------------------------------------------

describe('the honest-fetch rider (v2.380.0)', () => {
  it('the rider arms only when the lens is active AND the window is capped', () => {
    expect(desk).toContain('THE HONEST-FETCH RIDER');
    expect(desk).toContain("const lensCapped = typeFilter !== 'all' && windowCapped;");
    expect(desk).toContain('enabled: lensCapped,');
  });

  it('the rider fetch carries the census keyset\u2019s word as kind', () => {
    const fn = desk.slice(desk.indexOf("queryKey: ['transactions-lens'"));
    expect(fn).toContain("kind: typeFilter,");
    expect(fn).toContain("limit: '200',");
  });

  it('the rider\u2019s queryKey owns the lens word (a per-lens cache entry)', () => {
    expect(desk).toContain(
      "queryKey: ['transactions-lens', currentStoreId, dateRange, paymentFilter, typeFilter],"
    );
  });

  it('the rider answers the same honest shape (rows + the wire total)', () => {
    const fn = desk.slice(desk.indexOf("queryKey: ['transactions-lens'"));
    expect(fn).toContain(
      'return { rows, total: res.pagination?.total ?? rows.length };'
    );
  });

  it('the honest base: the rider\u2019s rows replace the base, the census stays whole', () => {
    // the swap — the rider's rows ARE the base when in play
    expect(desk).toContain('let result = lensedRows ?? transactions;');
    // the client type filter stands down when the wire already spoke the kind
    expect(desk).toContain("if (!lensedRows && typeFilter !== 'all') {");
    // THE WHOLENESS LAW: the census reads the unscoped fetch — untouched
    expect(desk).toContain('const typeCensus = countTransactionTypes(transactions);');
  });
});

// ---------------------------------------------------------------------------
// 4. THE VOICES — the honest lens count, the spinner, the capped-window voice
// ---------------------------------------------------------------------------

describe('the capped-window voices (v2.380.0)', () => {
  it('the lens voice speaks the rider\u2019s honest total', () => {
    expect(desk).toContain(
      '<span className="tabular-nums">{lensTotal ?? typeCensus[typeFilter]} in this lens</span>'
    );
  });

  it('the lens voice spins while the rider rides', () => {
    expect(desk).toContain('{lensedRiding && (');
    expect(desk).toContain('<Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />');
  });

  it('the capped-window voice names the slice and the whole (amber honesty)', () => {
    expect(desk).toContain('THE CAPPED-WINDOW VOICE');
    expect(desk).toContain('data-testid="txn-window-cap-voice"');
    expect(desk).toContain(
      'className="flex w-full items-center gap-1.5 pl-6 text-xs font-medium text-amber-700 dark:text-amber-300"'
    );
    expect(desk).toContain('Capped window — showing the newest {transactions.length} of {windowTotal} rows');
  });

  it('the voice carries the rider-note when a lens is active', () => {
    expect(desk).toContain(
      "{typeFilter !== 'all' ? '; the active lens fetches its own scope past the cap' : ''}"
    );
  });

  it('the voice is gone when the window fits the cap (no news, no voice)', () => {
    const voice = desk.slice(desk.indexOf('THE CAPPED-WINDOW VOICE'));
    expect(voice).toContain('{windowCapped && (');
    // the rider-note lives INSIDE the capped-window conditional — the
    // capped gate is the ONLY gate (the between law)
    const cappedIdx = voice.indexOf('{windowCapped && (');
    const riderNoteIdx = voice.indexOf('the active lens fetches its own scope past the cap');
    expect(cappedIdx).toBeGreaterThanOrEqual(0);
    expect(riderNoteIdx).toBeGreaterThan(cappedIdx);
  });
});
