// v2.215.0 — the strip reaches its shelf + the second consumer + the
// EXPERTS chip sweep.
//
//   - THE SHELF LAW: the v2.214.0 honest-scope contingency ("if the
//     cache-per-boot reality makes the strip unreachable in real flows,
//     honestly reconsider the design") RESOLVED by topology, not by a
//     law amendment: the org console gains its own CurrencySwitcher —
//     the shared rates cache's supply moves into the SAME shell as the
//     strip-bearing modals, one first-open fills the cache, the strip
//     speaks. The zero-fetch law is untouched: the strip still fetches
//     nothing; the SWITCHER's own first-open remains the sanctioned
//     supply.
//   - THE UNREACHABILITY PROOF: the shells full-navigate between each
//     other by design (goHomeToPos window.location.assign('/')) — the
//     react-query cache could never cross the hop. The chrome comment
//     records the finding; this file pins it.
//   - THE SECOND CONSUMER: the revenue modal's indicative strip — the
//     SAME observer, the SAME guards, the SAME voice family as the debt
//     strip; the figure follows the ACTIVE LENS (gross weekTotal / net
//     netWeekTotal). A count-voiced modal (transactions) never gains a
//     currency strip — the sibling choice was made on the wire's units.
//   - THE CHIP SWEEP: the EXPERTS surface's last red-600/amber-700
//     stragglers join the armored family (red-700 / amber-800) — a
//     CONSISTENCY re-voice with the installed palette (the pre-fix
//     states measure above the bar; scripts/contrast-math-experts-chips-
//     v2215.mjs records the numbers and the red-50 ghost that fled).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const CHROME_PATH = 'src/components/org/chrome.tsx';
const ROW_PATH = 'src/components/org/kpi-row.tsx';
const SWITCHER_PATH = 'src/components/currency-switcher.tsx';
const EXPERTS_PATH = 'src/components/org/experts.tsx';
const DAEMON_PATH = 'scripts/ems-daemon-3200.cjs';

const chrome = read(CHROME_PATH);
const row = read(ROW_PATH);
const switcher = read(SWITCHER_PATH);
const experts = read(EXPERTS_PATH);
const daemon = read(DAEMON_PATH);

// ── THE SHELF LAW ───────────────────────────────────────────────────────────

describe('the switcher reaches the console banner (v2.215.0)', () => {
  it('the console header mounts the shared switcher — one import, one mount', () => {
    expect(chrome).toMatch(/import \{ CurrencySwitcher \} from '@\/components\/currency-switcher';/);
    expect(chrome).toContain('<CurrencySwitcher');
    expect(chrome).toContain('triggerTestId="console-currency-switcher"');
  });

  it('the trigger wears the banner\'s own dark voices — a sibling of Stores/palette', () => {
    const mount = chrome.slice(chrome.indexOf('<CurrencySwitcher'), chrome.indexOf('/>', chrome.indexOf('<CurrencySwitcher')));
    expect(mount).toContain('compact');
    expect(mount).toContain('border-white/15');
    expect(mount).toContain('text-slate-200');
    expect(mount).toContain('hover:bg-white/10');
  });

  it('the chrome comment records the SHELF LAW topology finding', () => {
    expect(chrome).toContain('THE SHELF LAW');
    expect(chrome).toMatch(/goHomeToPos assigns a location/);
    expect(chrome).toMatch(/architecturally silent/);
  });

  it('the switcher exports a typed triggerTestId — no untyped data-* passthrough', () => {
    expect(switcher).toMatch(/triggerTestId\?: string;/);
    expect(switcher).toMatch(/\{\.\.\.\(triggerTestId \? \{ 'data-testid': triggerTestId \} : \{\}\)\}/);
  });

  it('the shells still full-navigate between each other — the finding stays true', () => {
    const unified = read('src/components/console/unified-console.tsx');
    expect(unified).toMatch(/window\.location\.assign\('\/'\)/);
  });
});

// ── THE SPEAKING FIX (found live in the QA drive) ───────────────────────────

describe('the strip can actually SPEAK — the destructure names the hook\'s field (v2.215.0)', () => {
  // THE BUG THIS PIN BURIES: use-currency.ts returns { currency: activeCurrency, … }
  // — the FIELD is `currency`. kpi-row.tsx destructured a bare `activeCurrency`
  // (not a field of UseCurrencyReturn), so the strips' pivot guard compared
  // UNDEFINED against 'KES' and the pair lookup searched code === undefined:
  // the strip was architecturally silent — cache full, USD active, still no
  // figure. Found LIVE: the switcher's trigger hover-truth spoke while the
  // open debt modal stayed mute. The v2.214 "silence verified live" had
  // passed for the wrong reason.
  it('kpi-row renames the hook\'s `currency` field at the destructuring site', () => {
    expect(row).toMatch(/const \{ currency: activeCurrency \} = useCurrency\(\);/);
    expect(row).not.toMatch(/const \{ activeCurrency \} = useCurrency\(\);/);
  });

  it('the hook itself still returns the field AS `currency` (the one voice every consumer shares)', () => {
    const hook = read('src/hooks/use-currency.ts');
    expect(hook).toMatch(/return \{ currency: activeCurrency, format, convert, switchCurrency, meta \};/);
  });

  it('the strips still read the active currency through the renamed binding', () => {
    expect(row).toMatch(/if \(activeCurrency === 'KES'\) return null;/);
    expect(row).toMatch(/currencies\.find\(\(c\) => c\.code === activeCurrency\)/);
  });
});

// ── THE SECOND CONSUMER ─────────────────────────────────────────────────────

describe('the revenue modal\'s indicative strip (v2.215.0)', () => {
  it('rides the SAME observer guards as the debt strip — KES pivot first, no fallback constants', () => {
    const block = row.slice(row.indexOf('const revenueIndicative = (() => {'), row.indexOf('})();', row.indexOf('const revenueIndicative = (() => {')));
    expect(block).toMatch(/if \(activeCurrency === 'KES'\) return null;/);
    expect(block).toMatch(/if \(!entry \|\| typeof entry\.kesToRate !== 'number' \|\| !Number\.isFinite\(entry\.kesToRate\)\) return null;/);
    expect(block).toMatch(/if \(!meta\) return null;/);
  });

  it('the figure follows the ACTIVE LENS — gross weekTotal or the net face\'s own aggregate', () => {
    const block = row.slice(row.indexOf('const revenueIndicative = (() => {'), row.indexOf('})();', row.indexOf('const revenueIndicative = (() => {')));
    expect(block).toMatch(/lens === 'gross'/);
    expect(block).toMatch(/k\.revenue\.netWeekTotal \?\? k\.revenue\.weekTotal - \(k\.revenue\.taxWeekTotal \?\? 0\)/);
  });

  it('speaks the shared provenance map — never a private re-wording', () => {
    const block = row.slice(row.indexOf('const revenueIndicative = (() => {'), row.indexOf('})();', row.indexOf('const revenueIndicative = (() => {')));
    expect(block).toMatch(/RATE_SOURCE_PHRASE\[entry\.source\] \?\? 'wire rate'/);
  });

  it('carries its testids for the E2E', () => {
    for (const id of ['revenue-indicative-strip', 'revenue-indicative-figure', 'revenue-indicative-rate', 'revenue-indicative-voice']) {
      expect(row).toContain(`"${id}"`);
    }
  });

  it('owns its dark half from birth (the seven-panel law) — the debt strip\'s exact visual family', () => {
    const strip = row.slice(row.indexOf('data-testid="revenue-indicative-strip"'), row.indexOf('</p>', row.indexOf('data-testid="revenue-indicative-strip"')));
    expect(strip).toMatch(/dark:border-slate-700/);
    expect(strip).toMatch(/dark:bg-slate-800\/60/);
    expect(strip).toMatch(/dark:text-slate-400/);
    expect(strip).toMatch(/dark:text-slate-300/);
    expect(strip.match(/tabular-nums/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('the aria tail keeps the family sentence — what the strip is NOT', () => {
    expect(row).toMatch(/The ledger stays in KES — this strip does not change what the revenue is\./);
  });

  it('the count-voiced modal stays count-voiced — transactions never gains a currency strip', () => {
    expect(row).toContain('transactions-wow-strip');
    expect(row).not.toContain('transactions-indicative');
  });
});

// ── THE ZERO-FETCH LAW (unchanged by the shelf) ─────────────────────────────

describe('the strip still never fetches (the v2.199/v2.214 law holds)', () => {
  it('the row contains no fetch call at all — the shelf moved, the law did not', () => {
    expect(row).not.toContain('fetch(');
  });

  it('the debt strip\'s v2.214 pins stand untouched', () => {
    expect(row).toMatch(/const indicative = \(\(\) => \{/);
    expect(row).toMatch(/\{indicative && \(/);
    expect(row).toContain('data-testid="debt-indicative-strip"');
  });
});

// ── THE CHIP SWEEP ──────────────────────────────────────────────────────────

describe('the EXPERTS chip sweep (v2.215.0)', () => {
  it('the severity badges speak the armored family', () => {
    expect(experts).toContain("'border-red-200 text-red-700'");
    expect(experts).toContain("'border-amber-200 text-amber-800'");
    expect(experts).not.toContain("'text-red-600'");
  });

  it('every straggler joins — bucket, OVERDUE, mpesa, pctColor', () => {
    expect(experts).toContain("c.bucket === 'DAYS_90_PLUS' ? 'border-red-200 text-red-700'");
    expect(experts).toContain("c.status === 'OVERDUE' ? 'border-red-200 text-red-700'");
    expect(experts).toContain("? 'border-amber-200 text-amber-800' : 'border-red-200 text-red-700'");
    expect(experts).toContain("'text-emerald-700' : v >= 70 ? 'text-amber-700' : 'text-red-700'");
  });

  it('the contrast script of record exists and pins the honest numbers', () => {
    const script = read('scripts/contrast-math-experts-chips-v2215.mjs');
    expect(script).toContain('CONSISTENCY re-voice');
    expect(script).toContain('check(\'ERROR badge: red-700 on white (fixed)\', token(\'red-700\'), WHITE);');
  });
});

// ── THE OPS TIDY ────────────────────────────────────────────────────────────

describe('the daemon launcher probes before spawning (v2.215.0)', () => {
  it('never races a healthy listener — the v2.214.0 EADDRINUSE note closes', () => {
    expect(daemon).toContain('daemon already healthy on :3200');
    expect(daemon).toMatch(/probeOnce/);
    expect(daemon).toMatch(/for \(let i = 0; i < 3; i \+= 1\)/);
  });
});
