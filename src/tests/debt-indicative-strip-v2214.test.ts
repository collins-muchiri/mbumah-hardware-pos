// v2.214.0 — the currency wire's first consumer.
//
//   - THE CONSUMER LAW: the v2.212 honest-scope note ("a tracked pair is
//     stored and shown until a consumer exists") is now CLOSED — the debt
//     ledger's indicative strip is the first surface that READS the active
//     display currency and converts against the wire's KES→quote figure.
//   - THE CANONICAL LAW: KES stays the ledger's truth. The strip NEVER
//     replaces the total (kes(k.debt.total) keeps its testid and its
//     literal), never mutates the card's figure, and says what it is:
//     "indicative; the ledger stays in KES."
//   - THE SILENCE LAW: no active switch (activeCurrency === 'KES'), no
//     wire answer, no finite rate → NO strip. An indicative figure must
//     never be born from a fallback constant.
//   - THE ONE-CACHE LAW: the strip reads the SAME query key the switcher
//     and the Exchange Rates card share — no second wire, no inline
//     literal, lazy (enabled: debtOpen), never polled.
//   - THE PROVENANCE LAW: the source voice is the SAME three phrases the
//     switcher's rows speak (RATE_SOURCE_PHRASE, now exported) — never a
//     privately re-worded copy.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const ROW_PATH = 'src/components/org/kpi-row.tsx';
const SWITCHER_PATH = 'src/components/currency-switcher.tsx';

const row = read(ROW_PATH);
const switcher = read(SWITCHER_PATH);

// ── THE ONE-CACHE LAW ───────────────────────────────────────────────────────

describe('the indicative wire (v2.214.0)', () => {
  it('rides the shared cache key — no inline literal in the row', () => {
    expect(row).toMatch(/import \{ ADMIN_CURRENCY_RATES_QUERY_KEY, RATE_SOURCE_PHRASE, type RatesWireBody \} from '@\/components\/currency-switcher';/);
    expect(row).toContain("queryKey: ADMIN_CURRENCY_RATES_QUERY_KEY,");
    expect(row).not.toMatch(/queryKey: \['admin-currency-rates'\]/);
  });

  it('is a pure observer — enabled:false, the zero-fetch law (v2.199) holds', () => {
    expect(row).toMatch(/enabled: false,/);
    expect(row).toMatch(/refetchInterval: false,/);
    expect(row).toMatch(/the debt ledger never fetches — it observes the shared currency cache/);
  });

  it('the row contains no fetch call at all — the drill-down composes, it never invents', () => {
    expect(row).not.toContain('fetch(');
  });

  it('the wire body type is the switcher\'s own exported shape', () => {
    expect(switcher).toMatch(/export interface RatesWireBody/);
    expect(row).toMatch(/type RatesWireBody \} from '@\/components\/currency-switcher'/);
    expect(row).toMatch(/useQuery<RatesWireBody>\(/);
  });
});

// ── THE SILENCE LAW ─────────────────────────────────────────────────────────

describe('silence stays silence', () => {
  it('KES pivot renders nothing — the guard comes first', () => {
    const block = row.slice(row.indexOf('const indicative = (() => {'), row.indexOf('})();', row.indexOf('const indicative = (() => {')));
    expect(block).toMatch(/if \(activeCurrency === 'KES'\) return null;/);
  });

  it('a non-finite or missing rate renders nothing — never a fallback constant', () => {
    const block = row.slice(row.indexOf('const indicative = (() => {'), row.indexOf('})();', row.indexOf('const indicative = (() => {')));
    expect(block).toMatch(/if \(!entry \|\| typeof entry\.kesToRate !== 'number' \|\| !Number\.isFinite\(entry\.kesToRate\)\) return null;/);
    expect(block).toMatch(/if \(!meta\) return null;/);
  });

  it('the strip JSX is gated on the computed indicative — never on a truthy total', () => {
    expect(row).toMatch(/\{indicative && \(/);
  });
});

// ── THE CANONICAL LAW ───────────────────────────────────────────────────────

describe('KES stays canonical', () => {
  it('the total keeps its literal and its testid — the strip never replaces it', () => {
    expect(row).toMatch(/data-testid="debt-ledger-total" className="text-2xl font-bold text-red-600 dark:text-red-400">\{kes\(k\.debt\.total\)\}<\/span>/);
  });

  it('the closing voice says what the strip is NOT', () => {
    expect(row).toMatch(/— indicative; the ledger stays in KES\./);
  });

  it('the aria-label speaks the full honest sentence', () => {
    expect(row).toMatch(/The ledger stays in KES — this strip does not change what the debt is\./);
  });
});

// ── THE PROVENANCE LAW ──────────────────────────────────────────────────────

describe('one provenance voice', () => {
  it('RATE_SOURCE_PHRASE is exported from the switcher with the three phrases', () => {
    expect(switcher).toMatch(/export const RATE_SOURCE_PHRASE: Record<string, string> = \{/);
    expect(switcher).toMatch(/MANUAL: 'admin-set rate',/);
    expect(switcher).toMatch(/API: 'API rate',/);
    expect(switcher).toMatch(/STATIC: 'built-in rate',/);
  });

  it('the strip speaks the shared map — never a private re-wording', () => {
    expect(row).toMatch(/RATE_SOURCE_PHRASE\[entry\.source\] \?\? 'wire rate'/);
  });
});

// ── THE SURFACE ─────────────────────────────────────────────────────────────

describe('the strip surface', () => {
  it('carries its testids for the E2E', () => {
    for (const id of ['debt-indicative-strip', 'debt-indicative-figure', 'debt-indicative-rate', 'debt-indicative-voice']) {
      expect(row).toContain(`"${id}"`);
    }
  });

  it('owns its dark half from birth (the seven-panel law)', () => {
    const strip = row.slice(row.indexOf('data-testid="debt-indicative-strip"'), row.indexOf('</p>', row.indexOf('data-testid="debt-indicative-strip"')));
    expect(strip).toMatch(/dark:border-slate-700/);
    expect(strip).toMatch(/dark:bg-slate-800\/60/);
    expect(strip).toMatch(/dark:text-slate-400/);
    expect(strip).toMatch(/dark:text-slate-300/);
  });

  it('figures ride tabular-nums like every money voice in the product', () => {
    const strip = row.slice(row.indexOf('data-testid="debt-indicative-strip"'), row.indexOf('</p>', row.indexOf('data-testid="debt-indicative-strip"')));
    expect(strip.match(/tabular-nums/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
