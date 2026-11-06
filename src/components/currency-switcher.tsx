'use client';

// MBUMAH HARDWARE POS - CurrencySwitcher
//
// A dropdown button that lets the cashier switch the POS display currency
// between KES, USD, UGX, and TZS for cross-border East African trade.
//
// • Trigger button shows the active currency's flag + code.
// • Each menu item shows flag, code, name, and the KES exchange rate.
// • Since v2.210.0 the rows carry their rate's HONEST SOURCE: the first
//   open reads /api/currency/rates (the wire the CurrencyRate model backs)
//   and overlays any admin-managed (MANUAL) or API-fetched (API) rows on
//   the static list; each row names its source with a measured chip
//   (emerald admin-set / blue API / muted built-in). If the wire is
//   unreachable the rows render exactly as before — no chip, no invented
//   provenance — and the footer's "indicative" sentence stays the truth.
// • Since v2.212.0 the read shares the ADMIN CARD's query cache (the SAME
//   ['admin-currency-rates'] key) — one key, one cached wire body, so a
//   rate the admin card writes (or resets) re-renders the chips and
//   figures HERE without a remount. One wire, two surfaces, one truth.
// • Since v2.410.0 THE WIRE ANSWERS ON MOUNT: the v2.212.0 laziness law
//   ("nothing fetched until the first open") failed live on the console
//   and org desks — the open-state race left the dropdown's `enabled:
//   opened` queries permanently silent there (browser-proven: the menu
//   visibly open, zero requests at resource-timing level, static fallback
//   rows). The queries now ride the same mount-fetch path every other
//   panel uses (the seed already asked the branch-default wire on every
//   page load, so the laziness "savings" were already spent). The open is
//   pure display again — no query state behind it.
// • The footer speaks the read's freshness (the timestamp the cache
//   recorded) only when the wire actually answered; silence stays silence.
// • Since v2.410.0 the footer carries THE RATE CENSUS STRIP: when the wire
//   answered, one mono line counts the rows by provenance (N admin-set ·
//   N API · N built-in) beside an age voice (fresh/aging/stale dot) — the
//   owner sees at a glance whether the branch's rates are maintained or
//   factory. Honest absence: before the wire answers the strip is not
//   rendered at all.
// • Since v2.411.0 the census speaks first: an all-factory census (no
//   admin-set, no API rows) gains the MAINTENANCE VOICE — a quiet amber
//   invitation naming the door that fixes it (the Exchange Rates card on
//   the System tab). A maintained census stays silent — no nagging; the
//   strip's tone follows its census (amber invitation vs quiet neutral).
// • Selecting an item calls `switchCurrency()` from `useCurrency()`, which
//   updates the persisted `activeCurrency` in `useAppStore` - every
//   component that calls `useCurrency().format()` re-renders automatically.
// • Since v2.408.0 the branch speaks first: a user who never explicitly
//   chose greets the branch's own default (the v2.407.0 SystemConfig
//   setting, seeded once per page load — currency-seed.ts), and a row the
//   branch actually picked wears the mono "branch default" chip when the
//   dropdown opens (never the factory default — isDefault renders none).
//
// This is a DISPLAY-ONLY conversion. The canonical accounting currency
// remains KES; only the rendered strings change.

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrency } from '@/hooks/use-currency';
import {
  SUPPORTED_CURRENCIES,
  formatCurrency,
  type CurrencyMeta,
} from '@/lib/currency-utils';
import type { CurrencyCode } from '@/lib/money';
import { seedCurrencyFromBranch, type BranchCurrencyWire } from '@/lib/currency-seed';
import { useAppStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

export interface CurrencySwitcherProps {
  /** Optional compact variant - shows only flag + code, no "Currency" label. */
  compact?: boolean;
  /** Additional Tailwind classes for the trigger button. */
  className?: string;
  /** Optional callback fired when the user picks a currency. */
  onChange?: (currency: CurrencyCode) => void;
  /** Optional testid for the trigger button (the E2E hooks the shelf by it).
   * v2.215.0: the console banner's mount passes console-currency-switcher. */
  triggerTestId?: string;
}

/** Per-row provenance + the DB-backed KES rate, when the wire answered. */
interface RowRate {
  /** 1 KES equals this many units of the row's currency. */
  kesToRate: number;
  source: string;
  updatedAt: string | null;
}

/**
 * THE ONE-WIRE KEY (v2.212.0): the query-cache contract shared by the
 * currency switcher (top-bar, every page) and the admin desk's Exchange
 * Rates card. One key, one cached wire body — a rate the card writes or
 * resets invalidates THIS key and both surfaces re-read the same truth.
 * The single literal lives here; the card imports it (the one-writer law
 * applied to the cache contract itself).
 */
export const ADMIN_CURRENCY_RATES_QUERY_KEY = ['admin-currency-rates'] as const;

/** What one /api/currency/rates entry teaches this component. */
interface RateWireEntry {
  code: string;
  /** How many units of this currency one KES equals (already rounded). */
  kesToRate: number;
  /** STATIC | MANUAL | API — the wire's own provenance. */
  source: string;
  updatedAt: string | null;
}

/** What the GET answers — the SAME body shape the admin card reads. */
export interface RatesWireBody {
  data?: {
    currencies?: RateWireEntry[];
  };
}

/** Authenticated fetch — the SAME contract the admin card's helper keeps
 * (bearer from the persisted session when present, cookies same-origin). */
async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mbt_token') : null;
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers, credentials: 'same-origin' });
}

/**
 * The ONE provenance voice map (v2.214.0 export): every surface that shows
 * a wire-sourced figure speaks the SAME three phrases — the switcher's
 * rows, the trigger's tooltip, the Exchange Rates card's chips, and the
 * debt ledger's indicative strip (the wire's first consumer).
 */
export const RATE_SOURCE_PHRASE: Record<string, string> = {
  MANUAL: 'admin-set rate',
  API: 'API rate',
  STATIC: 'built-in rate',
};

/**
 * THE RATE CENSUS (v2.410.0, pure): count the wire's rows by provenance —
 * the one truth the footer's census strip renders. `null` on an empty
 * wire (honest absence — no strip, no invented zeros).
 */
export interface RateCensus {
  manual: number;
  api: number;
  builtIn: number;
  total: number;
}

export function rateCensus(entries: RateWireEntry[] | undefined | null): RateCensus | null {
  let manual = 0;
  let api = 0;
  let builtIn = 0;
  for (const entry of entries ?? []) {
    if (!entry || typeof entry?.code !== 'string') continue;
    if (entry.source === 'MANUAL') manual += 1;
    else if (entry.source === 'API') api += 1;
    else builtIn += 1;
  }
  const total = manual + api + builtIn;
  return total > 0 ? { manual, api, builtIn, total } : null;
}

/**
 * THE AGE READ (v2.410.0): the wire's age in ms at NOW. The one impure
 * clock read behind the age voice, kept OUT of the component body (the
 * react-hooks purity law) — the render only reads the result. A silent
 * cache (dataUpdatedAt 0) answers -1, which the age voice renders as
 * nothing.
 */
function wireAgeMs(dataUpdatedAt: number): number {
  return dataUpdatedAt > 0 ? Date.now() - dataUpdatedAt : -1;
}

/**
 * THE AGE VOICE (v2.410.0, pure): how stale the wire's answer is, as one
 * dot + word — fresh (under 45 s, emerald), aging (under 5 min, amber),
 * stale (red). `null` for a non-positive age (an impossible clock answer
 * renders nothing, never a wrong word).
 */
export function wireAgeVoice(ageMs: number): { label: string; dot: string } | null {
  if (!Number.isFinite(ageMs) || ageMs < 0) return null;
  if (ageMs < 45_000) return { label: 'fresh', dot: 'bg-emerald-500 dark:bg-emerald-400' };
  if (ageMs < 5 * 60_000) return { label: 'aging', dot: 'bg-amber-500 dark:bg-amber-400' };
  return { label: 'stale', dot: 'bg-red-500 dark:bg-red-400' };
}

/**
 * THE MAINTENANCE VOICE (v2.411.0, pure): when every row on the wire is a
 * factory figure (no admin-set, no API), the census says so and names the
 * door that fixes it — a maintained census stays silent (no nagging: the
 * moment one rate is admin-set or API-backed, the invitation is gone).
 * `null` on an absent census (honest absence — no strip, no voice).
 */
export function censusMaintenanceVoice(census: RateCensus | null | undefined): string | null {
  if (!census) return null;
  if (census.manual > 0 || census.api > 0) return null;
  return `All ${census.builtIn} rates are factory figures — set yours in the Exchange Rates card (System tab).`;
}

/**
 * Render a single currency row in the dropdown. Extracted so the parent
 * component stays declarative and the row's aria-label is consistent.
 */
function CurrencyRow({
  meta,
  active,
  onSelect,
  dbRate,
  isBranchDefault,
}: {
  meta: CurrencyMeta;
  active: boolean;
  onSelect: (code: CurrencyCode) => void;
  /** Present only when the rates wire answered for this row. */
  dbRate?: RowRate;
  /** True when the branch's own default currency setting names this row
   *  (v2.408.0 — the wire's answer, never the factory default). */
  isBranchDefault?: boolean;
}) {
  // Show "1 KES = N {symbol}" for non-KES currencies; for KES show "Base".
  // A DB-backed row (admin-set or API) speaks its own figure; the static
  // constant is only the fallback, never a claim about the wire.
  const rateLabel =
    meta.code === 'KES'
      ? 'Base currency'
      : `1 KES = ${formatCurrency(dbRate ? dbRate.kesToRate : 1 / meta.exchangeRateToKES, meta.code)}`;

  const sourcePhrase = dbRate ? RATE_SOURCE_PHRASE[dbRate.source] : undefined;

  return (
    <DropdownMenuItem
      // `onSelect` fires on click/Enter/Space - Radix handles a11y.
      onSelect={(e) => {
        // Prevent the dropdown from closing before our handler runs in
        // some edge cases (defensive - Radix usually handles this).
        e.preventDefault();
        onSelect(meta.code);
      }}
      className={cn(
        'relative flex items-center gap-2.5 px-2.5 py-2 cursor-pointer',
        'focus:bg-accent focus:text-accent-foreground',
        // v2.410.0: the active row wears a soft tint and an emerald rail
        // (the same family the branch-default chip speaks) so the current
        // choice reads at a glance even beside the Check mark.
        active && 'bg-accent/50',
        active &&
          'before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-full before:bg-emerald-500/80 dark:before:bg-emerald-400/80',
      )}
      aria-label={`Switch display currency to ${meta.name} (${meta.code})${sourcePhrase ? ` — ${sourcePhrase}` : ''}`}
      role="menuitemradio"
      aria-checked={active}
    >
      <span className="text-base leading-none shrink-0" aria-hidden>
        {meta.flag}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold">{meta.code}</span>
          <span className="text-xs text-muted-foreground truncate">
            · {meta.name}
          </span>
          {isBranchDefault && (
            <span
              title="Your branch picked this as its default display currency"
              className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-px font-mono text-[9px] font-medium leading-tight text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              branch default
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="font-mono text-[10px] text-muted-foreground tabular-nums truncate">
            {rateLabel}
          </p>
          {dbRate && sourcePhrase && (
            <span
              title={dbRate.updatedAt ? `Rate updated ${dbRate.updatedAt}` : undefined}
              className={cn(
                'shrink-0 rounded-full px-1.5 py-px text-[10px] font-medium leading-tight',
                dbRate.source === 'MANUAL' &&
                  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
                dbRate.source === 'API' &&
                  'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
                dbRate.source === 'STATIC' && 'text-muted-foreground',
              )}
            >
              {dbRate.source === 'MANUAL' ? 'admin-set' : dbRate.source === 'API' ? 'API' : 'built-in'}
            </span>
          )}
        </div>
      </div>
      {active && (
        <Check className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
      )}
    </DropdownMenuItem>
  );
}

export function CurrencySwitcher({
  compact = false,
  className,
  onChange,
  triggerTestId,
}: CurrencySwitcherProps) {
  const { currency, switchCurrency, meta } = useCurrency();

  // THE WIRE ANSWERS ON MOUNT (v2.410.0): both queries are enabled from the
  // first render — the same mount-fetch path every other panel on these
  // desks uses. The v2.212.0 laziness law (`enabled: opened`, set by the
  // dropdown's own onOpenChange) failed live on the console and org desks:
  // the open-state race left the queries PERMANENTLY silent there (browser
  // evidence: menu visibly open, zero requests at resource-timing level,
  // static fallback rows, no chip, no freshness). A dropdown that may never
  // open no longer buys silence with honesty — and the seed already asked
  // the branch-default wire on every page load anyway. refetchInterval
  // stays false (no polling): the wire arrives on mount and on
  // invalidation, never on a timer.

  // v2.408.0 — THE BRANCH SPEAKS FIRST: a user who never explicitly chose a
  // display currency greets the branch's own default (the v2.407.0 setting
  // — SystemConfig shelf, /api/settings/currency). The seed is once-per-page
  // (the lib's module guard), best-effort, and never overrides an explicit
  // choice (`currencyChosen`). N mounts (top bar, org console, the org desk)
  // share the one promise — this effect is safe everywhere.
  useEffect(() => {
    void seedCurrencyFromBranch();
  }, []);

  // The branch-default chip's wire: answered on mount, the SAME cache law
  // the rates query keeps. isDefault:true (never set) renders
  // no chip — the factory default is never presented as a branch choice.
  const branchDefaultQuery = useQuery({
    queryKey: ['branch-default-currency'],
    queryFn: async (): Promise<BranchCurrencyWire | null> => {
      const res = await authedFetch('/api/settings/currency');
      if (!res.ok) return null;
      const body = (await res.json()) as { data?: BranchCurrencyWire };
      return body?.data ?? null;
    },
    enabled: true,
    staleTime: 30_000,
    refetchInterval: false,
  });
  const branchDefault =
    branchDefaultQuery.data && !branchDefaultQuery.data.isDefault
      ? branchDefaultQuery.data.defaultCurrency
      : null;

  const ratesQuery = useQuery({
    queryKey: ADMIN_CURRENCY_RATES_QUERY_KEY,
    queryFn: async (): Promise<RatesWireBody> => {
      const res = await authedFetch('/api/currency/rates');
      if (!res.ok) throw new Error(`The rates wire answered ${res.status}`);
      return (await res.json()) as RatesWireBody;
    },
    enabled: true,
    staleTime: 30_000,
    refetchInterval: false,
  });

  const rates = useMemo(() => {
    const map = new Map<string, RowRate>();
    for (const entry of ratesQuery.data?.data?.currencies ?? []) {
      if (typeof entry?.code !== 'string') continue;
      map.set(entry.code, {
        kesToRate: entry.kesToRate,
        source: entry.source,
        updatedAt: entry.updatedAt ?? null,
      });
    }
    return map.size > 0 ? map : null;
  }, [ratesQuery.data]);

  // THE RATE CENSUS STRIP (v2.410.0): one pure voice, rendered only when
  // the wire answered. The age rides the cache's own recorded read time.
  // v2.411.0: an all-factory census gains the MAINTENANCE VOICE — a quiet
  // amber invitation naming the door that fixes it; a maintained census
  // stays silent.
  const census = useMemo(() => rateCensus(ratesQuery.data?.data?.currencies), [ratesQuery.data]);
  const ageVoice = wireAgeVoice(wireAgeMs(ratesQuery.dataUpdatedAt));
  const maintenanceVoice = useMemo(
    () => censusMaintenanceVoice(census),
    [census],
  );

  const handleSelect = (code: CurrencyCode) => {
    switchCurrency(code);
    onChange?.(code);
  };

  // THE TRIGGER'S HOVER TRUTH (v2.212.0): once the wire has answered, the
  // trigger's tooltip speaks the ACTIVE currency's own figure and source —
  // the same voice the rows use, so hover teaches what the menu will say.
  // Silence stays silence: before the wire answers the trigger claims
  // nothing (the static constant is never presented as wire truth).
  const activeRow = currency !== 'KES' ? rates?.get(currency) : undefined;
  const triggerTitle = activeRow
    ? `1 KES = ${formatCurrency(activeRow.kesToRate, currency)} · ${RATE_SOURCE_PHRASE[activeRow.source] ?? 'wire rate'}`
    : undefined;

  // THE FRESHNESS VOICE (v2.212.0): the footer speaks WHEN the wire
  // answered (the cache's own recorded read time) — honest recency, not a
  // pretend "live". Before the first answer the footer stays exactly the
  // three sentences it has always had.
  const readAt = rates && ratesQuery.dataUpdatedAt > 0 ? new Date(ratesQuery.dataUpdatedAt) : null;
  const freshnessLabel = readAt
    ? `Wire read at ${readAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    : null;
  const freshnessTitle = readAt ? readAt.toLocaleString() : undefined;

  // THE GREETING WEARS ITS SOURCE (v2.409.0): while the CURRENT display
  // currency arrived through the branch's greeting (the seed's transient
  // provenance stamp) and no human hand has chosen yet, the trigger wears a
  // quiet emerald dot — the same family the dropdown's "branch default"
  // chip speaks. Pure store truth (the seed's own stamp), no wire, no
  // guess: an explicit pick ends the greeting (the flag plants, the dot
  // goes), a factory KES never had one, and a pre-flag choice wears none
  // (the stamp only exists where the seed actually wrote).
  const greetedFromBranch = useAppStore(
    (s) => s.seededFromBranch && !s.currencyChosen,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={compact ? 'sm' : 'default'}
          className={cn(
            'gap-1.5 font-semibold tabular-nums',
            'h-9 px-2.5',
            // v2.410.0: the trigger echoes the open (a soft accent lift) so
            // the pressed state reads even when the menu renders beside —
            // surfaces that pass their own data-[state=open] voice (the
            // console's dark banner) still win via the cn merge.
            'data-[state=open]:bg-accent/60',
            className,
          )}
          aria-label={`Display currency: ${meta.name}. Click to change.`}
          aria-haspopup="menu"
          title={triggerTitle}
          {...(triggerTestId ? { 'data-testid': triggerTestId } : {})}
        >
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          <span className="text-base leading-none" aria-hidden>
            {meta.flag}
          </span>
          <span className="text-xs">{currency}</span>
          {greetedFromBranch && (
            <span
              aria-hidden
              title="Greeted by your branch's default display currency — switch once to make it yours"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 dark:bg-emerald-400"
            />
          )}
          {!compact && (
            <ChevronDown className="h-3 w-3 text-muted-foreground" aria-hidden />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64"
        // Constrain height + custom scrollbar so it never overflows the
        // viewport on small screens.
        // (4 currencies fit without scroll, but the style is forward-looking.)
      >
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Display Currency
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div
          className="max-h-80 overflow-y-auto scrollbar-thin"
          role="group"
          aria-label="Supported currencies"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <CurrencyRow
              key={c.code}
              meta={c}
              active={c.code === currency}
              onSelect={handleSelect}
              dbRate={rates?.get(c.code)}
              isBranchDefault={branchDefault === c.code}
            />
          ))}
        </div>
        <DropdownMenuSeparator />
        <div className="px-2.5 py-1.5 text-[10px] text-muted-foreground leading-tight">
          Rates are indicative (display only).
          <br />
          Accounting currency remains KES.
          <br />
          Each chip names its source: admin-set, API, or built-in.
          {freshnessLabel && (
            <>
              <br />
              <span
                title={freshnessTitle}
                className="tabular-nums"
              >
                {freshnessLabel}
              </span>
            </>
          )}
          {census && (
            <div
              data-testid="currency-rate-census"
              className={cn(
                'mt-1.5 rounded-md border px-1.5 py-1',
                // v2.411.0: the strip's tone follows its census — a
                // factory-only census wears the amber invitation family,
                // a maintained one stays on the quiet neutral surface.
                maintenanceVoice
                  ? 'border-amber-200/70 bg-amber-50/60 dark:border-amber-500/25 dark:bg-amber-500/10'
                  : 'border-border/60 bg-muted/40',
              )}
            >
              <div className="flex items-center gap-1.5">
                {ageVoice && (
                  <span
                    aria-hidden
                    title="How long ago the wire answered this census"
                    className={cn('h-1.5 w-1.5 shrink-0 rounded-full', ageVoice.dot)}
                  />
                )}
                <span className="font-mono text-[9px] tabular-nums leading-tight text-muted-foreground">
                  {census.manual} admin-set · {census.api} API · {census.builtIn} built-in
                  {ageVoice ? ` · ${ageVoice.label}` : ''}
                </span>
              </div>
              {maintenanceVoice && (
                <p
                  data-testid="currency-census-nudge"
                  className="mt-1 border-t border-amber-200/60 pt-1 text-[9px] leading-snug text-amber-700 dark:border-amber-500/20 dark:text-amber-300"
                >
                  {maintenanceVoice}
                </p>
              )}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default CurrencySwitcher;
