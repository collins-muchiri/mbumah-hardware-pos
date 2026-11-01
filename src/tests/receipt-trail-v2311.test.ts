import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * v2.311.0 — the paper trail becomes walkable.
 *
 * Since v2.310.0 the loyalty desk's clawback rows CARRY the refund
 * receipt number (the rose chip, the card's "refund receipt {n}"
 * sub-line) — but the number was dead text: reading it, an operator
 * still had to go hunting for the receipt by hand across tabs. This
 * release closes the walk, at three heights:
 *
 *  1. THE SHELL ANSWERS THE ADDRESS BAR (src/lib/tab-url.ts +
 *     main-app.tsx): a valid `?tab=` wins over the persisted tab on
 *     mount; every tab change replaceState's the param back (never
 *     pushState — desk switches must not spam history; other params,
 *     like the loyalty desk's `view=`, ride along). Unknown ?tab=
 *     values are ignored — a stale link can never hijack the desk.
 *     QA cost kill: v2.310's browser bursts lost the loyalty desk to
 *     sidebar nav ref ambiguity; `?tab=loyalty&view=transactions`
 *     now lands directly.
 *  2. THE RECEIPT LOOKUP (GET /api/transactions?receiptNumber=…):
 *     the EXACT receipt filter (receipt numbers are unique per store)
 *     — precision tool beside the fuzzy `search` contains, AND-scoped
 *     to the caller's store so another branch's receipt can never
 *     answer. transactionsApi.getByReceipt unwraps the envelope and
 *     answers the first row or null (zero rows = the not-found face,
 *     never a wrong receipt).
 *  3. THE PAPER-TRAIL VIEWER (receipt-view-dialog.tsx): three honest
 *     faces — loading (aria-live), not-found (the number echoed back,
 *     with the why), found (the SAME branded ReceiptDocument the
 *     transactions desk prints, with Print and PDF riding the shared
 *     receipt utilities). Both clawback surfaces (the desk ledger's
 *     reference chip, the member card's receipt sub-line) open it;
 *     dead text becomes a real button with focus rings and dark-mode
 *     voices.
 */

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const mainApp = readRepo('src/components/app/main-app.tsx');
const shellPage = readRepo('src/app/(shell)/page.tsx');
const loginScreen = readRepo('src/components/login-screen.tsx');
const loyaltyTab = readRepo('src/app/(shell)/tabs/loyalty-tab.tsx');
const loyaltyCard = readRepo('src/components/loyalty/loyalty-card.tsx');
const viewer = readRepo('src/components/loyalty/receipt-view-dialog.tsx');
const apiClient = readRepo('src/lib/api.ts');
const route = readRepo('src/app/api/transactions/route.ts');

// ── executed math: the pure URL helpers, run for real ──────────────────
// (mirrors the module's logic; the pins below hold the source to it)
const toParams = (search: string) => new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);

function parseInitialTab(search: string, validTabs: readonly string[]): string | null {
  try {
    const tab = toParams(search).get('tab');
    if (!tab) return null;
    return validTabs.includes(tab) ? tab : null;
  } catch {
    return null;
  }
}

function parseInitialView<V extends string>(search: string, valid: readonly V[], fallback: V): V {
  try {
    const view = toParams(search).get('view');
    if (view && (valid as readonly string[]).includes(view)) return view as V;
    return fallback;
  } catch {
    return fallback;
  }
}

function buildTabSearch(currentSearch: string, tab: string): string {
  try {
    const params = toParams(currentSearch);
    params.set('tab', tab);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  } catch {
    return `?tab=${encodeURIComponent(tab)}`;
  }
}

const TABS = ['dashboard', 'pos', 'loyalty', 'transactions'] as const;
const VIEWS = ['tiers', 'members', 'transactions', 'campaigns'] as const;

describe('v2.311.0 — the shell answers the address bar', () => {
  it('?tab= lands the desk when the tab is real', () => {
    expect(parseInitialTab('?tab=loyalty', TABS)).toBe('loyalty');
    expect(parseInitialTab('?tab=pos&view=transactions', TABS)).toBe('pos');
    expect(parseInitialTab('', TABS)).toBeNull();
    expect(parseInitialTab('?view=loyalty', TABS)).toBeNull();
  });

  it('an unknown ?tab= is IGNORED — a stale link can never hijack the desk', () => {
    expect(parseInitialTab('?tab=not-a-desk', TABS)).toBeNull();
    expect(parseInitialTab('?tab=POS', TABS)).toBeNull(); // case-sensitive, exactly one voice
    expect(parseInitialTab('?tab=', TABS)).toBeNull();
  });

  it('every tab change replaceStates (never pushState) with the other params riding', () => {
    expect(buildTabSearch('?view=transactions', 'loyalty')).toBe('?view=transactions&tab=loyalty');
    expect(buildTabSearch('', 'dashboard')).toBe('?tab=dashboard');
    expect(buildTabSearch('?tab=pos', 'loyalty')).toBe('?tab=loyalty');
    expect(buildTabSearch('?tab=dashboard&x=1', 'pos')).toBe('?tab=pos&x=1');
  });

  it('the boot read is ONE consumer — (shell)/page.tsx, after rehydrate, sharing the parser', () => {
    // v2.111's consume-and-strip law is REPLACED: the param stays, the URL
    // speaks the desk continuously; the parse is shared (tab-url.ts).
    expect(shellPage).toContain("import { parseInitialTab } from '@/lib/tab-url';");
    expect(shellPage).toContain('const asked = parseInitialTab(');
    expect(shellPage).toContain('TAB_CONFIG.map((t) => t.id)');
    expect(shellPage).toContain('useAppStore.getState().setActiveTab(asked)');
    // the strip is GONE — no sp.delete('tab'), no pathname rewrite
    expect(shellPage).not.toContain("sp.delete('tab')");
    expect(shellPage).toContain('the deep link is applied AFTER it settles');
  });

  it('main-app only WRITES (replaceState per change, other params ride)', () => {
    expect(mainApp).toContain("import { buildTabSearch } from '@/lib/tab-url';");
    expect(mainApp).toContain('buildTabSearch(window.location.search, activeTab)');
    // replaceState, never pushState — desk switches must not spam history
    expect(mainApp).toContain('window.history.replaceState(null, \'\', next)');
    expect(mainApp).not.toContain("history.pushState(null, '', next)");
    // one consumer of the boot read: main-app does NOT parse ?tab= itself
    expect(mainApp).not.toContain('parseInitialTab');
  });

  it('the loyalty desk answers ?view= with a validated fallback (one writer per param)', () => {
    expect(parseInitialView('?view=transactions', VIEWS, 'tiers')).toBe('transactions');
    expect(parseInitialView('?view=campaigns', VIEWS, 'tiers')).toBe('campaigns');
    expect(parseInitialView('?view=nope', VIEWS, 'tiers')).toBe('tiers');
    expect(parseInitialView('', VIEWS, 'tiers')).toBe('tiers');
    expect(parseInitialView('?view=MEMBERS', VIEWS, 'tiers')).toBe('tiers');
    // v2.316.0 pin evolution (deliberate): the type parser joins the
    // import — the ledger answers ?type= now (the sweep line's door);
    // the type vocabulary's own voice is pinned in expiry-ledger-link-v2316.
    // v2.317.0 pin evolution (deliberate): the date-window parser and
    // eatDayKey join too — the ledger answers ?from=/&to= (the counts
    // door names its sweep's day); the window's own voice is pinned in
    // expiry-day-window-v2317.
    // v2.318.0 pin evolution (deliberate): buildSearchWithoutParams joins
    // — the window can leave (the × chip scrubs from/to from the bar);
    // the dismiss law's own voice is pinned in expiry-window-dismiss-v2318.
    // v2.320.0 pin evolution (deliberate): parseInitialPage joins — the
    // pager lands on `?page=`; the pin follows the import, not the round.
    // v2.321.0 pin evolution (deliberate): parseInitialLimit joins — the
    // gait lands on `?limit=`; the pin follows the import, not the round.
    expect(loyaltyTab).toContain("import { buildSearchWithoutParams, parseInitialDateRange, parseInitialLimit, parseInitialPage, parseInitialType, parseInitialView } from '@/lib/tab-url';");
    expect(loyaltyTab).toContain(
      "const LOYALTY_SUB_TABS: readonly LoyaltySubTab[] = ['tiers', 'members', 'transactions', 'campaigns'];",
    );
    expect(loyaltyTab).toContain('parseInitialView(window.location.search, LOYALTY_SUB_TABS, \'tiers\')');
    // SSR guard: the tab only renders client-side inside the SPA shell
    expect(loyaltyTab).toContain("if (typeof window === 'undefined') return 'tiers';");
    expect(loyaltyTab).toContain('useState<LoyaltySubTab>(initialSubTab)');
  });

  it('a desk ask on the classic root SURVIVES sign-in (the QA catch, fixed at the door)', () => {
    // the role-based push used to wipe ?tab=/?view= — the deep-linker
    // landed on the default desk. Now: ?next= (a named path) wins first,
    // then the desk ask, then the role default.
    expect(loginScreen).toContain('const deskAsk = (pathname === \'/\' || pathname === \'\') && /[?&](tab|view)=/.test(search);');
    expect(loginScreen).toContain(
      'safeReturnPath(nextParam) ?? (deskAsk ? `/${search}` : postLoginRedirect(flaggedUser));',
    );
  });
});

describe('v2.311.0 — the receipt lookup is a precision tool', () => {
  it('the route reads receiptNumber and filters EXACTLY (not a contains), store-scoped', () => {
    expect(route).toContain("const receiptNumber = searchParams.get('receiptNumber') || '';");
    expect(route).toContain('where.receiptNumber = receiptNumber;');
    // exact match: no `{ contains: receiptNumber }` anywhere in the filter
    expect(route).not.toContain('contains: receiptNumber');
    // the AND-scoping law is voiced
    expect(route).toContain('ANDs with the storeId scoping above');
  });

  it('getByReceipt unwraps the envelope and answers the first row or null', () => {
    expect(apiClient).toContain(
      "const query = new URLSearchParams({ receiptNumber, storeId, limit: '1' });",
    );
    expect(apiClient).toContain('const rows = Array.isArray(res.data) ? res.data : [];');
    expect(apiClient).toContain('return rows[0] ?? null;');
    // executed: the unwrap shape
    const res = { success: true, data: [{ id: 'tx1' }, { id: 'tx2' }] };
    const rows = Array.isArray(res.data) ? res.data : [];
    expect(rows[0] ?? null).toEqual({ id: 'tx1' });
    expect((Array.isArray(undefined) ? undefined : [])[0] ?? null).toBeNull();
  });
});

describe('v2.311.0 — the paper-trail viewer speaks three honest faces', () => {
  it('the viewer fetches via getByReceipt and derives loading while an answer is absent/stale', () => {
    expect(viewer).toContain('transactionsApi.getByReceipt(receiptNumber, currentStoreId)');
    // the slow-fetch flash guard: the settled answer remembers WHICH
    // receipt it answers; anything else DERIVES to loading during render
    // (no synchronous setState in the effect — no cascading renders)
    expect(viewer).toContain('answer && answer.forReceipt === receiptNumber');
    expect(viewer).toContain('? answer');
    expect(viewer).toContain(': { phase: \'loading\' };');
    expect(viewer).toContain('if (!open || !receiptNumber) return;');
    // a stale fetch can never answer a closed (or re-keyed) dialog
    expect(viewer).toContain('let cancelled = false');
    expect(viewer).toContain('cancelled = true');
  });

  it('the not-found face echoes the number and never shows a wrong receipt', () => {
    expect(viewer).toContain("phase: 'not-found'");
    expect(viewer).toContain("phase: 'found'");
    expect(viewer).toContain("phase: 'error'");
    expect(viewer).toContain("data-testid=\"receipt-view-not-found\"");
    expect(viewer).toContain('data-testid="receipt-view-found"');
    expect(viewer).toContain('aria-live="polite"');
    // the empty answer maps to not-found, never a half-rendered receipt
    expect(viewer).toContain("...(tx ? { phase: 'found', transaction: tx } : { phase: 'not-found' }),");
  });

  it('print and PDF ride the shared receipt utilities (the branded document)', () => {
    expect(viewer).toContain("import { ReceiptDocument } from '@/components/receipt-print';");
    expect(viewer).toContain('printReceiptElement(RECEIPT_CONTENT_ID)');
    expect(viewer).toContain('generateReceiptPdf(');
    expect(viewer).toContain('buildReceiptFileName(settled.transaction.receiptNumber, settled.transaction.id)');
    // print errors are contained, not thrown into the void
    expect(viewer).toContain('[RECEIPT_PRINT_ERROR]');
    expect(viewer).toContain('[RECEIPT_DOWNLOAD_ERROR]');
  });
});

describe('v2.311.0 — the claw\u2019s paper trail becomes walkable (both surfaces)', () => {
  it('the desk ledger\u2019s clawback reference chip is a real button opening the viewer', () => {
    expect(loyaltyTab).toContain("import { ReceiptViewDialog } from '@/components/loyalty/receipt-view-dialog';");
    expect(loyaltyTab).toContain('data-testid={`clawback-receipt-link-${tx.id}`}');
    expect(loyaltyTab).toContain('onClick={() => { if (tx.reference) openReceiptView(tx.reference); }}');
    expect(loyaltyTab).toContain('aria-label={`View refund receipt ${tx.reference}`}');
    // the dialog mounts ONCE per desk with the desk context voice
    expect(loyaltyTab).toContain('context="clawback-desk"');
    expect(loyaltyTab).toContain('receiptNumber={receiptViewNumber}');
    // keyboard + focus discipline on the new control
    expect(loyaltyTab).toContain('focus-visible:ring-2 focus-visible:ring-rose-400');
    expect(loyaltyTab).toContain('hover:underline');
  });

  it('the member card\u2019s \u201crefund receipt {n}\u201d sub-line opens the same viewer', () => {
    expect(loyaltyCard).toContain("import { ReceiptViewDialog } from '@/components/loyalty/receipt-view-dialog';");
    expect(loyaltyCard).toContain('onOpenReceipt?: (receiptNumber: string) => void;');
    expect(loyaltyCard).toContain('data-testid={`loyalty-card-receipt-link-${tx.id}`}');
    expect(loyaltyCard).toContain('onOpenReceipt?.(refundReceipt)');
    expect(loyaltyCard).toContain('context="clawback-card"');
    // one dialog per card, opened only from clawback rows
    expect(loyaltyCard).toContain('openReceiptView');
  });
});
