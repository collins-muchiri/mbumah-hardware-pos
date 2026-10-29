// v2.218.0 — the full restock.
//
//   - THE SCOPE: the restock dialog wears an aria-pressed scope pair —
//     "Named watchlist" (composed from this answer's rows, ZERO fetch)
//     and "Full branch list" (ONE disclosed fetch of the branch's own
//     /api/products/low-stock wire, uncapped). Each open starts on the
//     named rows; switching the list reseeds the draft and says so.
//   - THE MAPPING: the wire's rows map onto the same RestockItem shape —
//     the supplier hint's last-PAID cost keeps precedence over the book
//     costPrice, the SAME suggested-reorder arithmetic rides both
//     surfaces, so every law is scope-agnostic by construction.
//   - THE RESEED LAW, HARDENED: the draft reseeds on OPEN, on SCOPE
//     flip, and on genuine row change — keyed by a CONTENT signature,
//     never by array identity (a parent re-render can never wipe the
//     user's edits mid-session).
//   - THE CAP DISCLOSURE: the watchlist modal names the window AND the
//     way out when the org shortage outruns the route's 12-row window.
//   - THE COUNT LAW HOLDS: the watchlist modal stays count-voiced — no
//     strip mounts there, scope or no scope.
//   - THE STYLING DETAILS: per-line coverage bars (the watchlist's hue
//     ladder, aria-hidden), the lines scrolling at reading height, the
//     ledger-hint chip naming whose ledger spoke, "Draft another"
//     reseeding the active scope.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const DIALOG_PATH = 'src/components/org/restock-dialog.tsx';
const ROW_PATH = 'src/components/org/kpi-row.tsx';
const WIRE_PATH = 'src/app/api/products/low-stock/route.ts';

const dialog = read(DIALOG_PATH);
const row = read(ROW_PATH);
const wire = read(WIRE_PATH);
const pkg = JSON.parse(read('package.json'));
const changelog = read('CHANGELOG.md');
const feed = read('src/lib/whats-new.ts');

// ── THE SCOPE TOGGLE ────────────────────────────────────────────────────────

describe('the restock dialog wears an honest scope pair (v2.218.0)', () => {
  it('both scopes speak, as an aria-pressed pair', () => {
    expect(dialog.includes('data-testid="restock-mode-named"')).toBe(true);
    expect(dialog.includes('data-testid="restock-mode-full"')).toBe(true);
    expect(dialog.includes("aria-pressed={mode === 'named'}")).toBe(true);
    expect(dialog.includes("aria-pressed={mode === 'full'}")).toBe(true);
  });

  it('the named scope is the ZERO-fetch story, disclosed as such', () => {
    expect(dialog.includes('composed from this answer\u2019s named rows — zero fetch.')).toBe(true);
  });

  it('the full scope is the ONE disclosed fetch, disclosed as such', () => {
    expect(dialog.includes('fetched live from the branch\u2019s low-stock wire — one fetch, uncapped.')).toBe(true);
  });

  it('switching the list clears the edits — and says so', () => {
    expect(dialog.includes('Switching the list clears the edits.')).toBe(true);
  });

  it('a fresh open returns the scope to the named rows — by remount, no reset effect', () => {
    expect(dialog.includes("useState<'named' | 'full'>('named')")).toBe(true);
    expect(row.includes("key={restockStore?.id ?? 'restock-closed'}")).toBe(true);
  });
});

// ── THE ONE FETCH + THE MAPPING ─────────────────────────────────────────────

describe('the full scope reads the branch\u2019s own wire (v2.218.0)', () => {
  it('the fetch is store-scoped to the SAME store-level route', () => {
    // v2.222.0: the near-band toggle joins the key and widens the fetch
    // (includeNear=true only when the band is on) — the route is the
    // SAME store-level wire, the band is a deliberate act on it.
    expect(dialog.includes("queryKey: ['restock-full', storeId, nearBand],")).toBe(true);
    expect(dialog.includes("enabled: open && !!storeId && mode === 'full',")).toBe(true);
    expect(dialog.includes('fetch(`/api/products/low-stock?storeId=${encodeURIComponent(storeId)}${nearBand ? \'&includeNear=true\' : \'\'}`)')).toBe(true);
  });

  it('the wire is the route of record (store-scoped, low stock)', () => {
    expect(wire.includes('export const GET = withErrorBoundary(')).toBe(true);
    expect(wire.includes('requireStoreAccess(getLowStockProductsHandler)')).toBe(true);
  });

  it('the mapping keeps the last-PAID cost over the book cost', () => {
    expect(dialog.includes('lastUnitCost: r.supplier?.lastUnitCost ?? r.costPrice,')).toBe(true);
  });

  it('the mapping rides the SAME suggested arithmetic the named wire carries', () => {
    expect(dialog.includes('suggestedQty: r.suggestedReorderQty,')).toBe(true);
    expect(wire.includes('suggestedReorderQty: Math.max(0, Math.ceil(reorder * 1.5 - stock)),')).toBe(true);
  });

  it('the mapping carries the supplier hint fields (id + name, nullable)', () => {
    expect(dialog.includes('lastSupplierId: r.supplier?.id ?? null,')).toBe(true);
    expect(dialog.includes('lastSupplierName: r.supplier?.name ?? null,')).toBe(true);
  });
});

// ── THE RESEED LAW, HARDENED ────────────────────────────────────────────────

describe('the draft reseeds by DERIVATION, never by effect (v2.218.0)', () => {
  it('an untouched row renders its seed — the edits are the only state', () => {
    expect(dialog.includes('const [lines, setLines] = useState<Record<string, { qty: number; unitCost: number }>>({});')).toBe(true);
    expect(dialog.includes('?? seededLine(item)')).toBe(true);
  });

  it('the seed is ONE pure arithmetic every consumer speaks', () => {
    expect(dialog.includes('const seededLine = (item: RestockItem) => ({')).toBe(true);
    expect(dialog.includes('qty: Math.max(0, Math.ceil(item.suggestedQty ?? 0)),')).toBe(true);
    expect(dialog.includes('unitCost: Math.max(0, item.lastUnitCost ?? 0),')).toBe(true);
  });

  it('the file mounts with ZERO useEffect — nothing can wipe the edits', () => {
    expect(dialog.includes('useEffect(')).toBe(false);
  });

  it('a fresh open is a fresh MOUNT — the parent keys the dialog per branch', () => {
    expect(row.includes("key={restockStore?.id ?? 'restock-closed'}")).toBe(true);
  });

  it('the scope flip and "Draft another" clear the edits — the seeds re-derive', () => {
    expect(dialog.includes('setLines({});')).toBe(true);
    expect(dialog.includes('Switching the list clears the edits.')).toBe(true);
  });

  it('an edit carries the row\u2019s SEED unit cost (never a silent 0)', () => {
    expect(dialog.includes('const base = prev[id] ?? (item ? seededLine(item) : { qty: 0, unitCost: 0 });')).toBe(true);
  });
});

// ── THE LAWS IN BOTH SCOPES ─────────────────────────────────────────────────

describe('every law rides the ACTIVE rows (v2.218.0)', () => {
  it('the active list is the scope\u2019s list — one shape, no forks', () => {
    expect(dialog.includes("() => (mode === 'full' ? fullItems : items),")).toBe(true);
  });

  it('the zero law: a zero line ships nowhere, in BOTH scopes', () => {
    expect(dialog.includes('.filter((line) => line.quantity > 0);')).toBe(true);
    // v2.221.0: the composition lifted into payloadLinesFor (one
    // arithmetic, the single raise and every split step share it).
    expect(dialog.includes('if (payloadLinesFor(activeItems, lines).length === 0) return;')).toBe(true);
  });

  it('the estimate reduces over the ACTIVE rows', () => {
    expect(dialog.includes('() => activeItems.reduce((acc, item) => {')).toBe(true);
  });

  it('the shipping count speaks the ACTIVE rows', () => {
    expect(dialog.includes('activeItems.filter((item) => (lines[item.id] ?? seededLine(item)).qty > 0).length')).toBe(true);
  });

  it('the supplier tally rides the ACTIVE rows (the full branch\u2019s hints lead)', () => {
    expect(dialog.includes('for (const item of activeItems) {')).toBe(true);
  });

  it('the submit gate still rides the EFFECTIVE supplier (the v2.217 lesson holds)', () => {
    expect(dialog.includes('disabled={submitting || !effectiveSupplierId || shippingCount === 0}')).toBe(true);
  });

  it('the PO notes name the scope the draft came from', () => {
    // v2.221.0: the scope phrase composes once and the split appends
    // its k-of-n suffix — one voice, N raises.
    expect(dialog.includes("const scopePhrase = mode === 'full' ? 'full branch restock list' : 'named watchlist';")).toBe(true);
    expect(dialog.includes('Raised from the org console reorder watchlist (${scopePhrase})')).toBe(true);
  });
});

// ── THE FULL-MODE HONESTY STATES ────────────────────────────────────────────

describe('the full scope\u2019s honesty states (v2.218.0)', () => {
  it('the wire\u2019s own summary speaks (total · out · below)', () => {
    expect(dialog.includes('data-testid="restock-full-meta"')).toBe(true);
    expect(dialog.includes('{fullQuery.data.summary.total} at/below level · {fullQuery.data.summary.outOfStock} out of stock · {fullQuery.data.summary.belowReorder} below level')).toBe(true);
  });

  it('loading, failure and the empty face each own a voice', () => {
    expect(dialog.includes('data-testid="restock-full-loading"')).toBe(true);
    expect(dialog.includes('data-testid="restock-full-error"')).toBe(true);
    expect(dialog.includes('switch back to the named rows to draft from this answer.')).toBe(true);
    expect(dialog.includes('data-testid="restock-full-empty"')).toBe(true);
  });
});

// ── THE LEDGER-HINT CHIP ────────────────────────────────────────────────────

describe('the ledger\u2019s hint gets its own voice (v2.218.0)', () => {
  it('the chip names whose ledger spoke — and an explicit choice silences it', () => {
    expect(dialog.includes('data-testid="restock-supplier-hint"')).toBe(true);
    expect(dialog.includes('the ledger points to {hintLed} — the draft begins where the ledger points.')).toBe(true);
    expect(dialog.includes('if (supplierId && suppliers.some((s) => s.id === supplierId)) return null;')).toBe(true);
  });
});

// ── THE STYLING DETAILS ─────────────────────────────────────────────────────

describe('the draft reads its urgency while it edits (v2.218.0)', () => {
  it('every line draws a coverage bar on the watchlist\u2019s hue ladder', () => {
    expect(dialog.includes("'bg-red-500'")).toBe(true);
    expect(dialog.includes("'bg-orange-500'")).toBe(true);
    expect(dialog.includes("'bg-amber-500'")).toBe(true);
    expect(dialog.includes("'bg-emerald-500'")).toBe(true);
  });

  it('the bar is decorative — the numbers carry the meaning', () => {
    expect(dialog.includes('<span className="mt-1 flex items-center gap-1.5" aria-hidden>')).toBe(true);
  });

  it('the lines scroll at reading height — an uncapped list fits the dialog', () => {
    expect(dialog.includes('max-h-[42vh] space-y-2 overflow-y-auto pr-1')).toBe(true);
  });

  it('the new muted voices stay in the muted family (the contrast law)', () => {
    expect(dialog.includes('text-slate-500 dark:text-slate-400')).toBe(true);
    expect(dialog.includes('text-[9px] tabular-nums text-slate-500 dark:text-slate-400')).toBe(true);
  });
});

// ── THE CAP DISCLOSURE + THE COUNT LAW ──────────────────────────────────────

describe('the watchlist modal discloses the cap and keeps the count law (v2.218.0)', () => {
  it('the cap note names the window AND the way out', () => {
    expect(row.includes('data-testid="lowstock-cap-note"')).toBe(true);
    expect(row.includes('each branch&apos;s Draft PO can switch to the full branch list to cover the rest.')).toBe(true);
  });

  it('the note renders only when the shortage outruns the window', () => {
    expect(row.includes('stockRows && k.lowStock.count > stockRows.length && (')).toBe(true);
  });

  it('the note rides the muted family (the counter\u2019s +1)', () => {
    expect(row.includes('{/* v2.218.0 THE FULL RESTOCK: the cap disclosure')).toBe(true);
  });

  it('the count law holds: no indicative strip mounts in the watchlist modal', () => {
    const watchlistModal = row.slice(row.indexOf('Reorder watchlist'), row.indexOf('THE REORDER BRIDGE'));
    expect(watchlistModal.includes('indicative-strip')).toBe(false);
  });

  it('the named rows ride the memoized derivation (stable identity)', () => {
    expect(row.includes('items={restockItems}')).toBe(true);
    expect(row.includes('const restockItems = useMemo(')).toBe(true);
  });

  it('the stock rows are memoized too (the belt to the signature\u2019s braces)', () => {
    expect(row.includes('const stockRows = useMemo(() => watchlist?.map((p) => ({ ...p, coverage: stockCoverage(p) })) ?? null, [watchlist]);')).toBe(true);
  });

  it('the memo hooks are IMPORTED (the live-QA catch: the KPI row ran before they were)', () => {
    expect(row.includes("import { useMemo, useState } from 'react';")).toBe(true);
  });
});

// ── THE VERSION METADATA ────────────────────────────────────────────────────

describe('the round of record (v2.218.0)', () => {
  it('package.json leads 2.218.0 (all three slots)', () => {
    expect(pkg.version).toBe('2.255.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.255.0');
    expect(pkg.mbumah.baseVersion).toBe('2.255.0');
  });

  it('VERSION speaks the same truth', () => {
    expect(read('VERSION').trim()).toBe('2.255.0');
  });

  it('the changelog of record speaks the round', () => {
    expect(changelog.includes('## [2.218.0] The full restock')).toBe(true);
    expect(changelog.indexOf('## [2.218.0]')).toBeLessThan(changelog.indexOf('## [2.217.0]'));
  });

  it('the changelog feed grows the entry at the head', () => {
    expect(feed.includes("version: '2.218.0',")).toBe(true);
    expect(feed.includes("title: 'The full restock',")).toBe(true);
    expect(feed.indexOf("version: '2.218.0',")).toBeLessThan(feed.indexOf("version: '2.217.0',"));
  });

  it('the verify gate is wired', () => {
    expect(pkg.scripts['verify:v2-218-0']).toBe('node scripts/verify-v2-218-0.mjs');
  });
});
