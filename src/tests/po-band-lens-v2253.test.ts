// v2.253.0 — the ledger's lens.
//
//   - THE LEDGER'S LENS: the procurement ledger grows the band rail —
//     the window's own lens. Four houses (fresh/stale/beyond/never,
//     bandHouse's one home) + the silent absence ("no band" — a
//     hand-raised order, a read that fell honest). Each chip answers
//     with its REAL count over the rows the ledger ALREADY holds — the
//     finder's own law: the lens narrows the READING, never the fetch
//     (the rungs stay the wire's; the CSV speaks the whole window).
//     A pressed chip wears its house's pressed face; a click on the
//     pressed chip stands it down (the rungs' toggle law).
//   - THE HOUSES' PRESSED FACE: bandHouse grows the additive `pressed`
//     field — the inversion lives in the ONE home, every caller that
//     reads chip/rail/bar renders byte-identical.
//   - THE BIRTH'S BAND DOT: the ledger's birth chip wears its aisle's
//     band as the house's rail-coloured dot; a row whose read fell
//     silent keeps the plain violet.
//   - THE BIRTH'S FIFTH FACE: the supplier's PO roster wears the violet
//     birth (the branch roster's own chip + title voice), its aisle's
//     band as the same rail-coloured dot.
//   - THE LENS'S OWN EMPTY FACE: the window holds rows but the lens
//     narrowed the view to nothing — a separate face from the
//     pipe-empty words.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const band = read('src/lib/cadence-band.ts');
const ledger = read('src/components/org/po-ledger.tsx');
const suppliersTab = read('src/app/(shell)/tabs/suppliers-tab.tsx');

describe('the houses\u2019 pressed face \u2014 the inversion lives in the one home (v2.253.0)', () => {
  it('CadenceBandHouse grows the additive pressed field', () => {
    expect(band).toContain('export interface CadenceBandHouse {');
    expect(band).toContain('  pressed: string;');
  });

  it('the four houses answer the pressed face \u2014 solid house colour, the words white on it', () => {
    expect(band).toContain("pressed: 'bg-emerald-600 text-white ring-emerald-600 dark:bg-emerald-400 dark:text-emerald-950 dark:ring-emerald-400'");
    expect(band).toContain("pressed: 'bg-amber-600 text-white ring-amber-600 dark:bg-amber-400 dark:text-amber-950 dark:ring-amber-400'");
    expect(band).toContain("pressed: 'bg-orange-600 text-white ring-orange-600 dark:bg-orange-400 dark:text-orange-950 dark:ring-orange-400'");
    expect(band).toContain("pressed: 'bg-slate-600 text-white ring-slate-600 dark:bg-slate-300 dark:text-slate-900 dark:ring-slate-300'");
  });

  it('the elders\u2019 chip classes render byte-identical \u2014 additive, never a rewrite', () => {
    expect(band).toContain("chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30', rail: 'bg-emerald-500', bar: 'bg-emerald-500'");
    expect(band).toContain("chip: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30', rail: 'bg-slate-300 dark:bg-slate-600', bar: null");
  });
});

describe('the ledger\u2019s lens \u2014 the window\u2019s own rung (v2.253.0)', () => {
  it('the lens state rides the view \u2014 never the query key, never the fetch', () => {
    expect(ledger).toContain("const [bandLens, setBandLens] = useState<'ALL' | CadenceBand | 'silent'>('ALL');");
    expect(ledger).toContain("queryKey: ['org-po-ledger', statusFilter, branchId, originFilter],");
  });

  it('the row\u2019s band reads behind a membership check \u2014 a stranger string is the silence, never a guessed family', () => {
    expect(ledger).toContain("const rowBand = (r: PoLedgerRow): CadenceBand | null => {");
    expect(ledger).toContain("return b === 'fresh' || b === 'stale' || b === 'beyond' || b === 'never' ? b : null;");
  });

  it('the lens\u2019s counts are REAL numbers over the window\u2019s rows \u2014 every row lands in exactly one family', () => {
    expect(ledger).toContain('const c = { fresh: 0, stale: 0, beyond: 0, never: 0, silent: 0 };');
    expect(ledger).toContain('if (b) c[b] += 1;');
    expect(ledger).toContain('else c.silent += 1;');
  });

  it('the lens first, then the needle \u2014 both are the reading; the fetch never moves', () => {
    expect(ledger).toContain("bandLens === 'ALL'");
    expect(ledger).toContain("data.rows.filter((r) => (bandLens === 'silent' ? rowBand(r) == null : rowBand(r) === bandLens));");
    expect(ledger).toContain('r.poNumber.toLowerCase().includes(cleanNeedle)');
  });

  it('the rail wears the five families \u2014 the four houses + the silent absence', () => {
    expect(ledger).toContain('data-testid="po-ledger-band-row"');
    expect(ledger).toContain('data-testid={`po-ledger-band-${b}`}');
    expect(ledger).toContain('data-testid="po-ledger-band-silent"');
    expect(ledger).toContain("(['fresh', 'stale', 'beyond', 'never'] as const).map((b) => {");
  });

  it('a pressed chip wears its house\u2019s pressed face \u2014 a click on the pressed chip stands it down', () => {
    expect(ledger).toContain('aria-pressed={pressed}');
    expect(ledger).toContain('onClick={() => setBandLens(pressed ? \'ALL\' : b)}');
    expect(ledger).toContain('onClick={() => setBandLens(bandLens === \'silent\' ? \'ALL\' : \'silent\')}');
    expect(ledger).toContain('${pressed ? house.pressed : house.chip}');
  });

  it('the rail\u2019s dot keeps the one home \u2014 the house\u2019s own rail colour, white when pressed', () => {
    expect(ledger).toContain("${pressed ? 'bg-white/80 dark:bg-slate-950/50' : house.rail}");
  });

  it('the disclosure rides the rail \u2014 the rungs stay the wire\u2019s; the CSV speaks the whole window (v2.256.0: the ear\u2019s words joined the title)', () => {
    expect(ledger).toContain('title="the window\'s own lens — the rungs above stay the wire\'s; the CSV speaks the whole window regardless; Escape stands the lens down"');
  });

  it('the lens has its own empty face \u2014 the pipe-empty words would lie about the view', () => {
    expect(ledger).toContain('data-testid="po-ledger-lens-empty"');
    expect(ledger).toContain('the lens narrowed the window to nothing — lift a band house or clear the finder and the orders return.');
  });

  it('the export law holds \u2014 the roster\u2019s copy reads the whole window, never the lens', () => {
    expect(ledger).toContain('const csv = rosterCsv(data.rows, { costGated: data.costGated });');
  });
});

describe('the birth\u2019s band dot \u2014 the chip wears its aisle\u2019s family (v2.253.0)', () => {
  it('the ledger\u2019s birth chip wears the rail-coloured dot', () => {
    expect(ledger).toContain('data-testid="po-ledger-row-band-dot"');
    expect(ledger).toContain('${bandHouse(po.originStockTake.walkAisle.band as CadenceBand).rail}');
  });

  it('a row whose read fell silent keeps the plain violet \u2014 the honest absence, never a guessed colour', () => {
    expect(ledger).toContain('{po.originStockTake?.walkAisle?.band && (');
  });

  it('the houses + the label word ride the import \u2014 the ONE home, never a copy', () => {
    expect(ledger).toContain("import { bandHouse, chipLabel, daysVoice, type CadenceBand } from '@/lib/cadence-band';");
  });
});

describe('the birth\u2019s fifth face \u2014 the supplier\u2019s roster wears the violet (v2.253.0)', () => {
  it('the supplier\u2019s PO rows grow the birth chip \u2014 the branch roster\u2019s own face', () => {
    expect(suppliersTab).toContain('data-testid="supplier-po-birth-chip"');
    expect(suppliersTab).toContain('BORN AT A COUNT SHEET');
  });

  it('the chip wears its aisle\u2019s band as the same rail-coloured dot', () => {
    expect(suppliersTab).toContain('data-testid="supplier-po-band-dot"');
    expect(suppliersTab).toContain('${bandHouse(po.originStockTake.walkAisle.band as CadenceBand).rail}');
  });

  it('the chip\u2019s title speaks the full voice \u2014 the sheet, the aisle, the days', () => {
    expect(suppliersTab).toContain("title={`born at count sheet ${po.originStockTake.id}");
    expect(suppliersTab).toContain("daysVoice({ band: po.originStockTake.walkAisle.band as CadenceBand, daysSince: po.originStockTake.walkAisle.daysSince ?? null })");
  });

  it('a hand-raised PO renders the silent absence \u2014 the type check, never an assumption', () => {
    expect(suppliersTab).toContain('{po.originStockTake && (');
  });

  it('the houses ride the ONE home \u2014 the supplier face imports the lib, never a copy (the import grew chipLabel at v2.255.0 — the lens\u2019s own words)', () => {
    expect(suppliersTab).toContain("import { bandHouse, chipLabel, daysVoice, type CadenceBand } from '@/lib/cadence-band';");
  });
});
