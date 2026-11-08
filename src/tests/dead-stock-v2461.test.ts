/**
 * dead-stock-v2461.test.ts — the v2.461.0 gates.
 *
 * THE ROUND IN ONE LINE: the reports desk gains its NINTH report — Dead
 * Stock: every product HOLDING stock with no sale in the idle window
 * (30 | 60 | 90 days), its capital tied priced at cost, its share of the
 * whole inventory value spoken, and the grid completes its three-by-three.
 *
 * The laws this suite pins:
 * 1. THE MEANING LIVES IN ONE HOME — src/lib/reports/dead-stock.ts owns
 *    the definition (pure, deterministic); the route only gathers facts.
 *    An empty shelf is NOT dead stock (no capital rests in it); a null
 *    last-sold speaks "never", never a fabricated zero.
 * 2. NAMING AS CONTRACT (the v2.206.0 law, honored again) — the wire's
 *    array rides `rows`, outside the request() normalizer's unwrap list,
 *    so the summary survives the trip. `products`/`items`/`data` payload
 *    array keys are BANNED at source.
 * 3. THE WINDOW IS A TUPLE — only the lens's own three words are legal;
 *    anything else is a 400 (a made-up window would be a made-up report).
 * 4. THE LENS RIDES THE LOOM — the window chips are FilterChips (amber
 *    tint), so aria-pressed and the zinc keyboard ring come with the
 *    family; the loom itself speaks no address-bar token (word-free law).
 * 5. THE FILE IS THE SECTION'S OWN — dead stock exports client-side; the
 *    server export door ('sales' | 'inventory') is never borrowed for a
 *    report it cannot speak.
 *
 * WALK-SAFETY: this suite pins NO living version literal — the classifier
 * math, the route/tab/api bytes and the vocabulary are sealed by their own
 * words, and the version webs walk untouched over them.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { classifyDeadStock, DEAD_STOCK_WINDOWS } from '@/lib/reports/dead-stock';
import { parseInitialNamedMember, REP_TYPE_FILTERS } from '@/lib/tab-url';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const TAB = read('src/app/(shell)/tabs/reports-tab.tsx');
const API = read('src/lib/api.ts');
const ROUTE = read('src/app/api/reports/dead-stock/route.ts');
const CLASSIFIER = read('src/lib/reports/dead-stock.ts');
const HOME = read('src/lib/tab-url.ts');
const LOOM = read('src/components/filter-chip.tsx');

/** CODE-only scan (comments stripped — historical notes name ghosts and
 *  must never trip a ban; the v2.204.0 lesson). */
const codeOnly = (src: string) =>
  src
    .replace(/^\s*\/\*[\s\S]*?\*\/\s*$/gm, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

const routeCode = codeOnly(ROUTE);
const tabCode = codeOnly(TAB);
const apiCode = codeOnly(API);

// ---------------------------------------------------------------------------
// 1. THE CLASSIFIER'S TRUTH — the meaning, proven without a database
// ---------------------------------------------------------------------------

const NOW = new Date('2026-11-08T12:00:00.000Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

const product = (over: Partial<Parameters<typeof classifyDeadStock>[0][number]> = {}) => ({
  id: 'p1',
  name: 'Cement Bag',
  sku: 'CEM-001',
  quantityInStock: 10,
  costPrice: 700,
  pricePerUnit: 900,
  reorderLevel: 5,
  unitType: 'BAG',
  categoryName: 'Building Materials',
  ...over,
});

describe('classifyDeadStock — the one home of the meaning', () => {
  it('a product that never sold and holds stock is dead — daysIdle is a NULL voice, capital is qty × cost', () => {
    const { rows, summary } = classifyDeadStock([product()], new Map([['p1', null]]), NOW, 90);
    expect(rows).toHaveLength(1);
    expect(rows[0].lastSoldAt).toBeNull();
    expect(rows[0].daysIdle).toBeNull();
    expect(rows[0].capitalTied).toBe(7000); // 10 × 700
    expect(summary.deadCount).toBe(1);
  });

  it('a last sale older than the window is dead — the idle days are whole days (floored)', () => {
    const { rows } = classifyDeadStock(
      [product()],
      new Map([['p1', daysAgo(45.9)]]),
      NOW,
      30,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].daysIdle).toBe(45); // floor, never a ceiling
  });

  it('a sale inside the window keeps the product alive', () => {
    const { rows, summary } = classifyDeadStock(
      [product()],
      new Map([['p1', daysAgo(12)]]),
      NOW,
      30,
    );
    expect(rows).toHaveLength(0);
    expect(summary.deadCount).toBe(0);
  });

  it('an empty shelf is NOT dead stock — no capital rests in it (the low-stock alert owns that story)', () => {
    const { rows, summary } = classifyDeadStock(
      [product({ quantityInStock: 0 })],
      new Map([['p1', null]]),
      NOW,
      90,
    );
    expect(rows).toHaveLength(0);
    expect(summary.deadCount).toBe(0);
    // the empty shelf's zero still counts toward the inventory value total
    expect(summary.totalStockValue).toBe(0);
  });

  it('the window turns and the world re-answers — 30 and 90 disagree on the 45-day product', () => {
    const world = [product()];
    const sold = new Map([['p1', daysAgo(45)]]);
    expect(classifyDeadStock(world, sold, NOW, 30).rows).toHaveLength(1);
    expect(classifyDeadStock(world, sold, NOW, 90).rows).toHaveLength(0);
  });

  it('the ledger sorts by capital tied DESC — the loudest debt first — and ties speak name ASC', () => {
    const world = [
      product({ id: 'a', name: 'Alpha Hammer', quantityInStock: 1, costPrice: 500 }),
      product({ id: 'b', name: 'Zed Paint', quantityInStock: 2, costPrice: 5000 }), // 10,000
      product({ id: 'c', name: 'Beta Brush', quantityInStock: 1, costPrice: 500 }), // tie with a
    ];
    const { rows } = classifyDeadStock(world, new Map(), NOW, 90);
    expect(rows.map((r) => r.productId)).toEqual(['b', 'a', 'c']);
  });

  it('the share is honest — a zero total shares ZERO, never NaN (the v2.205.0 law)', () => {
    const { summary } = classifyDeadStock(
      [product({ quantityInStock: 0 })],
      new Map(),
      NOW,
      90,
    );
    expect(summary.deadSharePct).toBe(0);
    expect(Number.isNaN(summary.deadSharePct)).toBe(false);
  });

  it('the share math speaks the whole shelf — dead capital over ALL active inventory value', () => {
    // dead: 10 × 700 = 7,000; alive: 3 × 10,000 = 30,000 → total 37,000 → 18.9%
    const world = [
      product({ id: 'dead', quantityInStock: 10, costPrice: 700 }),
      product({ id: 'alive', quantityInStock: 3, costPrice: 10000 }),
    ];
    const { summary } = classifyDeadStock(
      world,
      new Map([['alive', daysAgo(1)]]),
      NOW,
      90,
    );
    expect(summary.totalCapitalTied).toBe(7000);
    expect(summary.totalStockValue).toBe(37000);
    expect(summary.deadSharePct).toBe(18.9);
  });
});

// ---------------------------------------------------------------------------
// 2. THE WIRE'S SHAPE — the route gathers facts, the contract rides `rows`
// ---------------------------------------------------------------------------

describe('the dead-stock route — facts in, one meaning out', () => {
  it('storeId is required — a storeless call is a 400, never an all-stores sweep', () => {
    expect(routeCode).toContain("storeId is required.");
  });

  it('the window is the lens\u2019s own tuple — 30 | 60 | 90; a made-up window is a 400', () => {
    expect(routeCode).toContain('DEAD_STOCK_WINDOWS');
    expect(routeCode).toContain('days must be one of');
    expect(CLASSIFIER).toContain('export const DEAD_STOCK_WINDOWS = [30, 60, 90] as const;');
  });

  it('the default window is 90 — the widest honest window rides when the call is bare', () => {
    expect(routeCode).toContain('DEFAULT_DAYS = 90');
  });

  it('NAMING AS CONTRACT: the payload rides `rows` — the normalizer\u2019s banned array keys never appear at source', () => {
    expect(routeCode).toMatch(/^\s*rows,$/gm); // the payload's shorthand line
    expect(routeCode).not.toMatch(/^\s*products:\s/gm);
    expect(routeCode).not.toMatch(/^\s*items:\s/gm);
    expect(routeCode).toMatch(/summary,/);
  });

  it('the sale vocabulary matches the fast-moving wire — SALE / COMPLETED / PARTIAL; drafts and quotes are not sales', () => {
    expect(routeCode).toContain("transactionType: 'SALE'");
    expect(routeCode).toContain("paymentStatus: { in: ['COMPLETED', 'PARTIAL'] }");
  });

  it('the meaning is imported from the ONE home — the route never re-derives the definition', () => {
    expect(routeCode).toContain("from '@/lib/reports/dead-stock'");
    expect(routeCode).toContain('classifyDeadStock(');
  });

  it('the wire is session-validated like every reports door', () => {
    expect(routeCode).toContain('withSessionAuth(');
    expect(routeCode).toContain("'DEAD_STOCK_REPORT'");
  });
});

// ---------------------------------------------------------------------------
// 3. THE CLIENT'S WIRE — api.ts speaks the same words
// ---------------------------------------------------------------------------

describe('the api client — the dead-stock wire\u2019s client face', () => {
  it('getDeadStockReport rides the route\u2019s address and carries the days word', () => {
    expect(apiCode).toContain('`/reports/dead-stock?${params.toString()}`');
    expect(apiCode).toContain("params.set('days', String(filter.days))");
  });

  it('DeadStockReportData carries rows AND summary — the shape the desk reads', () => {
    expect(apiCode).toContain('export interface DeadStockReportData');
    expect(apiCode).toContain('totalCapitalTied: number');
    expect(apiCode).toContain('deadSharePct: number');
    expect(apiCode).toContain('generatedAt: string');
  });
});

// ---------------------------------------------------------------------------
// 4. THE DESK'S FACE — the ninth card, the loom's lens, the honest ledger
// ---------------------------------------------------------------------------

describe('the reports desk — the ninth card and its faces', () => {
  it('the ninth ReportTypeCard rides the grid — Dead Stock speaks and completes the three-by-three', () => {
    expect(tabCode).toContain('title="Dead Stock"');
    expect(tabCode).toContain("onClick={() => chooseReportType('dead_stock')}");
    expect(tabCode).toContain('isActive={reportType === \'dead_stock\'}');
    expect(TAB).toContain('THE NINTH CARD');
    expect(tabCode).toContain('<Hourglass className="h-5 w-5" />');
  });

  it('the query is the desk\u2019s own — enabled only for dead_stock, the window rides the queryKey', () => {
    expect(tabCode).toContain("enabled: reportType === 'dead_stock'");
    expect(tabCode).toContain("queryKey: ['dead-stock-report', currentStoreId, deadStockDays]");
    expect(tabCode).toContain('reportsApi.getDeadStockReport');
  });

  it('the window lens rides the FILTER-CHIP LOOM (amber tint) — never a hand-rolled chip', () => {
    expect(tabCode).toContain('tone="amber"');
    expect(tabCode).toContain('variant="tint"');
    expect(tabCode).toContain('testId={`dead-stock-window-${d}`}');
    expect(tabCode).toContain('DEAD_STOCK_WINDOWS.map');
    // the loom speaks the pressed voice — the desk adds none by hand.
    // v2.463.0 re-anchor: the section now carries the TWO row-action
    // handles (the Ask and the share), each with its own double voice —
    // the handle law, not a lens face; the loom's pressed-voice law is
    // untouched, and the TWO aria-labels are the two handles' own.
    // v2.465.0 re-key (dated): the section grows its THIRD voice — the
    // Copy all handle in the ledger's header (the chorus's own double
    // voice); the census speaks the section's three handles now, and the
    // loom's pressed-voice law stands untouched.
    // v2.468.0 re-key (dated): the section grows its FOURTH voice — the
    // picker chip's edit door (the unaddressed face learned its press,
    // the double voice every handle wears); the census speaks the
    // section's four handles now, and the loom's pressed-voice law
    // stands untouched.
    const section = TAB.slice(TAB.indexOf('function DeadStockSection'), TAB.indexOf('// Main Reports Tab Component'));
    expect(section).not.toContain('aria-pressed');
    // v2.472.0 re-key (dated): the section grows its FIFTH and SIXTH
    // voices — the sort door's two headers (the Capital tied and Days
    // idle handles, the double voice every handle wears); the census
    // speaks the section's six handles now, and the loom's
    // pressed-voice law stands untouched.
    expect(section.split('aria-label=').length - 1).toBe(6);
    expect(section).toContain('aria-label={`Copy clearance note for ${r.name}`}');
  });

  it('the summary speaks three honest faces — capital, count, share — each with its own handle', () => {
    expect(tabCode).toContain('data-testid="dead-stock-capital"');
    expect(tabCode).toContain('data-testid="dead-stock-count"');
    expect(tabCode).toContain('data-testid="dead-stock-share"');
    expect(tabCode).toContain('data-testid="dead-stock-section"');
    expect(tabCode).toContain('data-testid="dead-stock-table"');
    expect(tabCode).toContain('data-testid="dead-stock-empty"');
  });

  it('the ledger\u2019s idle voice is aged — rose past half a year, amber below, the never-sold cell keeps quiet', () => {
    expect(TAB).toContain('r.daysIdle >= 180');
    expect(TAB).toContain("'text-rose-700 dark:text-rose-400 font-semibold'");
    expect(TAB).toContain("'text-amber-700 dark:text-amber-400'");
    expect(TAB).toContain('{r.daysIdle ?? \'—\'}');
    expect(TAB).toContain('>never sold</Badge>');
    expect(TAB).toContain("'dead-stock-never-badge'");
  });

  it('the CSV file carries the section\u2019s own rows — and "never" is a word, never a fabricated zero', () => {
    // v2.464.0 re-key (dated): the file's header grew the Clearance note
    // column (the word rides the file — one voice, three doors); the
    // header byte below speaks the grown file, the note's composer still
    // lives in the ONE home.
    // v2.465.0 re-key (dated): the header grew the Share link column
    // beside the note (the file rides the share link — one voice, four
    // doors); the column's own bytes live in the v2465 chorus suite.
    expect(TAB).toContain("'Product,SKU,Category,Qty on hand,Unit cost,Capital tied,Last sold,Days idle,Clearance note,Share link\\n'");
    expect(TAB).toContain("r.lastSoldAt ?? 'never'");
    expect(TAB).toContain("r.daysIdle ?? 'never'");
    expect(TAB).toContain('Dead share of stock value');
  });

  it('the server export door is NOT borrowed — dead stock exports client-side by its own branch', () => {
    expect(tabCode).toContain("if (reportType === 'dead_stock') {");
    expect(tabCode).toContain('handleCSVExport();');
  });

  it('the print header\u2019s report map grew the ninth word', () => {
    expect(TAB).toContain("reportType === 'dead_stock' ? 'Dead Stock' :");
  });

  it('the card is ONE control — the Generate pill is a span, never a nested button (the HTML law, the burst catch)', () => {
    // the live burst caught the desk hydrating with a console error: a
    // <button> (the Generate affordance) inside the ReportTypeCard's own
    // <button>. asChild demotes the pill to a span wearing the Button's
    // face — same look, same bubble-to-card behavior, no nested
    // interactive control announcing the same action twice.
    expect(TAB).toContain('<Button\n          asChild');
    expect(TAB).toContain('<span aria-hidden="true">');
    expect(tabCode).not.toContain('e.stopPropagation(); onClick();');
  });
});

// ---------------------------------------------------------------------------
// 5. THE WORD — the ninth member lands and the loom stays word-free
// ---------------------------------------------------------------------------

describe('the vocabulary — the ninth word at its one home', () => {
  it('?rep-type=dead_stock lands the ninth report through the ONE home', () => {
    expect(REP_TYPE_FILTERS[REP_TYPE_FILTERS.length - 1]).toBe('dead_stock');
    expect(parseInitialNamedMember('?tab=reports&rep-type=dead_stock', 'rep-type', REP_TYPE_FILTERS, 'sales')).toBe('dead_stock');
    // case-sensitivity is the law: a capitalized word is an unknown word
    expect(parseInitialNamedMember('?tab=reports&rep-type=DEAD_STOCK', 'rep-type', REP_TYPE_FILTERS, 'sales')).toBe('sales');
  });

  it('the home\u2019s dated note speaks the ninth word; the array is the living law', () => {
    expect(HOME).toContain("'dead_stock',");
    expect(HOME).toContain('v2.461.0: the ninth word joins');
  });

  it('the loom stays word-free — the elder wardrobe never learns an address-bar token', () => {
    expect(LOOM).not.toContain('dead_stock');
    expect(LOOM).not.toContain('rep-type');
  });

  it('the window tuple and the lens agree — three chips, three words, one home', () => {
    expect([...DEAD_STOCK_WINDOWS]).toEqual([30, 60, 90]);
    expect(TAB).toContain('testId={`dead-stock-window-${d}`}');
  });
});
