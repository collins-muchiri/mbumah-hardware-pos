// v2.216.0 — the second shelf + the third consumer.
//
//   - THE SECOND SHELF: the org desk's banner (/org/dashboard's own
//     header, workspace/org-console.tsx) mounts the shared
//     CurrencySwitcher — the v2.215.0 shelf law now holds both org
//     shells wide: the rates cache's supply lives where its consumers
//     live. The desk is its own boot (the shells full-navigate), so
//     without this mount the desk's strips would repeat the v2.214.0
//     architecture-silence the console shelf fixed.
//   - THE THIRD CONSUMER: BranchSliceModal (org/desk-doors.tsx) gains
//     the indicative strip — the kpi-row debt/revenue strips' sibling
//     from the SAME observer (enabled: false, the queryFn exists only
//     to say so — the v2.199 zero-fetch law holds three surfaces
//     wide), the SAME guards (KES pivot / missing or non-finite rate /
//     unknown code → silent), the SAME visual family (slate strip,
//     dark half from birth).
//   - THE COUNT LAW: only the money-voiced metrics (revenue, debt —
//     unit === 'money') convert; the count-voiced metrics
//     (transactions, lowStock, overdueRentals, pendingMpesa) stay
//     count-voiced BY LAW — a count converted to shillings would be
//     nonsense. The choice rides the wire's own units, not adjacency.
//   - THE HONEST TAIL: the aria sentence names the metric's own noun,
//     so "this strip does not change what the revenue is" stays exact
//     on every surface it mounts.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const DOORS_PATH = 'src/components/org/desk-doors.tsx';
const CONSOLE_PATH = 'src/components/workspace/org-console.tsx';
const SWITCHER_PATH = 'src/components/currency-switcher.tsx';
const ROW_PATH = 'src/components/org/kpi-row.tsx';

const doors = read(DOORS_PATH);
const orgConsole = read(CONSOLE_PATH);
const switcher = read(SWITCHER_PATH);
const row = read(ROW_PATH);

// ── THE SECOND SHELF ────────────────────────────────────────────────────────

describe('the switcher reaches the org desk banner (v2.216.0)', () => {
  it('org-console imports the shared switcher', () => {
    expect(orgConsole.includes("import { CurrencySwitcher } from '@/components/currency-switcher';")).toBe(true);
  });

  it('the desk banner mounts it compact with its E2E hook', () => {
    expect(orgConsole.includes('triggerTestId="org-desk-currency-switcher"')).toBe(true);
    expect(/<CurrencySwitcher\s+compact\s+triggerTestId="org-desk-currency-switcher"/.test(orgConsole)).toBe(true);
  });

  it('the trigger sits inside the desk header right group (Badge sibling)', () => {
    const mount = orgConsole.indexOf('org-desk-currency-switcher');
    const badge = orgConsole.indexOf("{user?.name || 'Signed in'} - {role}");
    expect(mount).toBeGreaterThan(-1);
    expect(badge).toBeGreaterThan(mount);
    expect(badge - mount).toBeLessThan(1200);
  });

  it('the shelf comment records the topology law', () => {
    expect(orgConsole.includes('SECOND SHELF')).toBe(true);
    expect(orgConsole.includes('supply lives where the consumers live')).toBe(true);
  });

  it('the switcher still exposes the typed triggerTestId prop', () => {
    expect(/triggerTestId\?: string;/.test(switcher)).toBe(true);
  });

  it('the console shelf (v2.215.0) stands untouched', () => {
    expect(read('src/components/org/chrome.tsx').includes('triggerTestId="console-currency-switcher"')).toBe(true);
  });
});

// ── THE THIRD CONSUMER ──────────────────────────────────────────────────────

describe('the desk slice modal gains the indicative strip (v2.216.0)', () => {
  it('desk-doors imports the shared voice map and wire body', () => {
    expect(doors.includes("import { ADMIN_CURRENCY_RATES_QUERY_KEY, RATE_SOURCE_PHRASE, type RatesWireBody } from '@/components/currency-switcher';")).toBe(true);
  });

  it('the observer is pure — enabled: false, never polled', () => {
    const block = doors.slice(doors.indexOf('const indicativeQuery = useQuery<RatesWireBody>'), doors.indexOf('});', doors.indexOf('const indicativeQuery = useQuery<RatesWireBody>')));
    expect(block.includes('enabled: false,')).toBe(true);
    expect(block.includes('refetchInterval: false,')).toBe(true);
  });

  it('the queryFn exists only to say so (the zero-fetch law, three surfaces wide)', () => {
    expect(doors.includes("throw new Error('the org desk never fetches — it observes the shared currency cache');")).toBe(true);
    expect(doors.includes('fetch(')).toBe(false);
  });

  it('the count law gates FIRST — unit !== money renders nothing', () => {
    const block = doors.slice(doors.indexOf('const deskIndicative = (() => {'), doors.indexOf('})();', doors.indexOf('const deskIndicative = (() => {')));
    expect(block.includes("if (metric.unit !== 'money') return null;")).toBe(true);
    expect(block.indexOf("metric.unit !== 'money'")).toBeLessThan(block.indexOf("activeCurrency === 'KES'"));
  });

  it('the family guards follow: KES pivot, non-finite rate, unknown code', () => {
    const block = doors.slice(doors.indexOf('const deskIndicative = (() => {'), doors.indexOf('})();', doors.indexOf('const deskIndicative = (() => {')));
    expect(block.includes("if (activeCurrency === 'KES') return null;")).toBe(true);
    expect(block.includes("if (!entry || typeof entry.kesToRate !== 'number' || !Number.isFinite(entry.kesToRate)) return null;")).toBe(true);
    expect(block.includes('if (!meta) return null;')).toBe(true);
  });

  it('the figure converts the tile total through the wire rate, provenance speaks the shared map', () => {
    const block = doors.slice(doors.indexOf('const deskIndicative = (() => {'), doors.indexOf('})();', doors.indexOf('const deskIndicative = (() => {')));
    expect(block.includes('formatCurrency(total * entry.kesToRate, activeCurrency)')).toBe(true);
    expect(block.includes("RATE_SOURCE_PHRASE[entry.source] ?? 'wire rate'")).toBe(true);
  });

  it('the hook field is read correctly (the v2.215.0 speaking-fix pattern holds)', () => {
    expect(/const \{ currency: activeCurrency \} = useCurrency\(\);/.test(doors)).toBe(true);
    expect(doors.includes('const { activeCurrency } = useCurrency();')).toBe(false);
  });

  it('all four strip testids present', () => {
    for (const id of ['org-desk-indicative-strip', 'org-desk-indicative-figure', 'org-desk-indicative-rate', 'org-desk-indicative-voice']) {
      expect(doors.includes(`"${id}"`)).toBe(true);
    }
  });

  it('dark half from birth (the family classes)', () => {
    expect(/data-testid="org-desk-indicative-strip"[\s\S]*?dark:border-slate-700[\s\S]*?dark:bg-slate-800\/60[\s\S]*?<\/p>/.test(doors)).toBe(true);
  });

  it('the honest tail names the metric noun dynamically', () => {
    expect(doors.includes('this strip does not change what the ${metric.noun} is.')).toBe(true);
    expect(doors.includes('The ledger stays in KES — this strip does not change what the')).toBe(true);
  });

  it('the strip mounts after the headline meta (inside the total block)', () => {
    const total = doors.indexOf('`org-desk-total-${metric.id}`');
    const meta = doors.indexOf('`org-desk-meta-${metric.id}`');
    const strip = doors.indexOf('"org-desk-indicative-strip"');
    expect(total).toBeGreaterThan(-1);
    expect(meta).toBeGreaterThan(total);
    expect(strip).toBeGreaterThan(meta);
  });
});

// ── THE COUNT LAW (the wire's own units) ────────────────────────────────────

describe('only money-voiced metrics convert (v2.216.0)', () => {
  it('the metrics of record: revenue and debt are money; the rest are counts', () => {
    expect(doors.includes("id: 'revenue',")).toBe(true);
    expect(doors.includes("id: 'debt',")).toBe(true);
    const moneyCount = (doors.match(/unit: 'money',/g) ?? []).length;
    const countCount = (doors.match(/unit: 'count',/g) ?? []).length;
    expect(moneyCount).toBe(2);
    expect(countCount).toBe(4);
  });

  it('no per-metric strip families leaked (one strip mount, gated by unit)', () => {
    expect((doors.match(/org-desk-indicative-strip/g) ?? []).length).toBe(1);
  });

  it('the kpi-row consumers stand untouched (debt + revenue strips)', () => {
    expect(row.includes('data-testid="debt-indicative-strip"')).toBe(true);
    expect(row.includes('data-testid="revenue-indicative-strip"')).toBe(true);
    expect(row.includes('transactions-indicative')).toBe(false);
  });
});
