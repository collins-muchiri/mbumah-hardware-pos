// v2.223.0 — the hand move.
//
//   - THE ASSIGNMENT LAW: one pure function (assignedSupplier) reads a
//     row's shipping destination — the HAND's move first (while that
//     supplier sits on the branch's active roster; a stale move falls
//     through, never lies), the row's OWN ledger hint second (the
//     v2.221 law, one new home), the draft's effective supplier last.
//     The grouping memo and every row render speak ONE arithmetic.
//   - THE HAND MOVES: productId → supplierId for THIS draft only — the
//     derivation law's newest citizen (the record holds ONLY the
//     hand's differences; clearing it IS the reset). A scope flip and
//     "Draft another" clear the moves; setting a row back onto its
//     DERIVED place deletes the move (re-derivation, never re-write).
//   - THE GROWN AVAILABILITY LAW: the split toggle shows when MORE
//     than one group exists OR the branch's active roster names 2+
//     suppliers — the hint-flattened cut (one big PO flattening every
//     hint, seen LIVE in the v2.221 E2E) is no longer a dead end. A
//     single-supplier branch still hides the toggle (nowhere to move
//     a line TO — an absent control never lies).
//   - THE AFFORDANCE SPEAKS ONLY IN SPLIT MODE: a one-PO draft has one
//     destination; a per-row picker there would promise a power the
//     raise would not honor. In split mode every row carries the
//     "ships via" select; a moved row wears the violet "moved by
//     hand" chip and the "back on its hint" reset.
//   - THE CUT READS ITS STORY: a group holding moved rows wears the
//     "N moved by hand" chip; the moves note names the count; the
//     clear-all sits beside the toggle; parked moves (split off) are
//     disclosed, never silent.
//   - THE WALK'S RECEIPTS: a split PO raised from moved rows carries
//     "N lines moved by hand." in its notes — the document remembers
//     the hand that shaped it.
//   - THE VOID JOINS THE CHAIN: the cancel route writes a best-effort
//     tamper-evident auditTrail event — action VOID, resourceType
//     STOCK_TAKE, the zero law in the event's own body (stockMoved: 0,
//     movements: 0), the reason verbatim — and the chain must never
//     block the void (the shift-closeout pattern).
//   - THE LINE FINDER: the sheet drill grows a client-side needle
//     (name or SKU, case-insensitive) over the lines it ALREADY holds
//     — zero new fetch; an honest N-of-M count; an empty face that
//     names the needle and the sheet's truth; the summary tiles stay
//     whole-sheet (the finder narrows the reading, never the
//     arithmetic); the map keys the drill per sheet so a fresh door
//     opens with an empty needle by construction.
//   - THE STYLING DETAILS: the violet family (the hand's color —
//     distinct from the amber split and the emerald success) at 3:1
//     contrast on every chip; the move row rides a dashed hairline;
//     dotted-underline reset links; tabular-nums on every figure;
//     focus rings on the finder; dark halves from birth; the muted
//     family (slate-500 / dark:slate-400) carries every sub-line.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const DIALOG_PATH = 'src/components/org/restock-dialog.tsx';
const dialog = read(DIALOG_PATH);
const cancelRoute = read('src/app/api/stock-takes/[id]/cancel/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const varianceMap = read('src/components/org/variance-map.tsx');
const pkg = JSON.parse(read('package.json'));
const changelog = read('CHANGELOG.md');
const feed = read('src/lib/whats-new.ts');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.223.0)', () => {
  it('package.json leads 2.223.0 (all three slots)', () => {
    expect(version).toBe('2.319.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.319.0');
    expect(pkg.mbumah.baseVersion).toBe('2.319.0');
  });

  it('the changelog anchors the section ABOVE its ancestor (the structural pin — headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.223.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.223.0]')).toBeLessThan(changelog.indexOf('## [2.222.0]'));
  });

  it('the feed carries the hand move (the dialog picks it up automatically)', () => {
    expect(feed.includes("version: '2.223.0',")).toBe(true);
    expect(feed.includes('The hand move')).toBe(true);
  });
});

// ── THE ASSIGNMENT LAW ───────────────────────────────────────────────────

describe('the assignment law is one pure function (v2.223.0)', () => {
  it('the function exists with the four-argument shape', () => {
    expect(dialog.includes('type HandMoves = Record<string, string>;')).toBe(true);
    expect(dialog.includes('function assignedSupplier(item: RestockItem, moves: HandMoves, suppliers: SupplierRow[], fallbackId: string): string {')).toBe(true);
  });

  it('the HAND leads — while the supplier sits on the active roster (a stale move falls through, never lies)', () => {
    expect(dialog.includes('const move = moves[item.id];')).toBe(true);
    expect(dialog.includes('if (move && suppliers.some((s) => s.id === move)) return move;')).toBe(true);
  });

  it('the hint follows, the effective supplier catches the hint-less — the v2.221 law, one home', () => {
    expect(dialog.includes('if (item.lastSupplierId && suppliers.some((s) => s.id === item.lastSupplierId)) return item.lastSupplierId;')).toBe(true);
    expect(dialog.includes('return fallbackId;')).toBe(true);
  });

  it('the grouping memo and the row render speak ONE arithmetic (no fork)', () => {
    expect(dialog.includes('const sid = assignedSupplier(item, moves, suppliers, effectiveSupplierId);')).toBe(true);
    expect(dialog.includes('<Select value={assignedSupplier(item, moves, suppliers, effectiveSupplierId)} onValueChange={(v) => onMoveChange(item, v)}>')).toBe(true);
  });

  it('the hand move state rides the derivation law — differences only, cleared by scope flip and Draft another', () => {
    expect(dialog.includes('const [moves, setMoves] = useState<HandMoves>({});')).toBe(true);
    expect(dialog.includes('setMoves({});')).toBe(true);
    expect(dialog.includes('const clearAllMoves = () => setMoves({});')).toBe(true);
  });

  it('writing a move back onto the DERIVED place DELETES it (re-derivation, never re-write)', () => {
    expect(dialog.includes('const derived = assignedSupplier(item, {}, suppliers, effectiveSupplierId);')).toBe(true);
    expect(dialog.includes('if (v === derived) {')).toBe(true);
    expect(dialog.includes('const { [item.id]: _drop, ...rest } = prev;')).toBe(true);
  });
});

// ── THE GROWN AVAILABILITY ───────────────────────────────────────────────

describe('the split availability law grows (v2.223.0)', () => {
  it('the toggle shows for 2+ active suppliers even when the hints flattened to one group', () => {
    expect(dialog.includes('const splitAvailable = supplierGroups.length > 1 || suppliers.length > 1;')).toBe(true);
  });

  it('the one-group split speaks its single-group truth (the hand door, disclosed)', () => {
    expect(dialog.includes("'the hints name one supplier — the rows carry the move affordance; move lines by hand to cut the draft.'")).toBe(true);
    expect(dialog.includes("'one supplier on the hints — turn the split on and move lines by hand to cut it.'")).toBe(true);
  });

  it('the multi-group notes survive verbatim (the v2.221 story untouched where it was true)', () => {
    expect(dialog.includes('the ledger\u2019s hints name ${supplierGroups.length} suppliers — one draft each; your chosen supplier covers the hint-less lines.')).toBe(true);
    expect(dialog.includes('this draft\u2019s hints span ${supplierGroups.length} suppliers — the split raises one PO each, every line where its own ledger points.')).toBe(true);
  });
});

// ── THE AFFORDANCE ───────────────────────────────────────────────────────

describe('the ships-via affordance is split-mode only and honest (v2.223.0)', () => {
  it('the row picker exists, testid per SKU, labeled', () => {
    expect(dialog.includes('data-testid={`restock-move-select-${item.sku}`}')).toBe(true);
    expect(dialog.includes('aria-label={`Supplier for ${item.name}`}')).toBe(true);
    expect(dialog.includes('>ships via</span>')).toBe(true);
  });

  it('SPLIT MODE ONLY — a one-PO draft has one destination (the picker would promise a power the raise would not honor)', () => {
    expect(dialog.includes('{splitOn && (\n              /* v2.223.0: THE HAND MOVE — the row\'s "ships via" select.')).toBe(true);
  });

  it('a moved row wears the violet chip and the way back', () => {
    expect(dialog.includes('data-testid={`restock-moved-chip-${item.sku}`}')).toBe(true);
    expect(/moved by hand\s*<\/span>/.test(dialog)).toBe(true);
    expect(dialog.includes('data-testid={`restock-move-reset-${item.sku}`}')).toBe(true);
    expect(dialog.includes('aria-label={`Put ${item.name} back on its ledger hint`}')).toBe(true);
    expect(dialog.includes('back on its hint')).toBe(true);
  });

  it('a group holding moved rows says how many (the divider owns the story)', () => {
    expect(dialog.includes('movedRows: rows.filter((item) => {')).toBe(true);
    expect(dialog.includes('data-testid={`restock-group-moved-${group.supplierId}`}')).toBe(true);
    expect(dialog.includes('{group.movedRows} moved by hand')).toBe(true);
  });

  it('the moves note and the parked note disclose the hand (never silent)', () => {
    expect(dialog.includes('data-testid="restock-moves-note"')).toBe(true);
    expect(dialog.includes('moved by hand — the cut is yours; a row’s “back on its hint” puts it where the ledger pointed.')).toBe(true);
    expect(dialog.includes('data-testid="restock-moves-parked"')).toBe(true);
    expect(dialog.includes('parked — they speak again when the split returns.')).toBe(true);
  });

  it('the clear-all sits beside the toggle and names its count', () => {
    expect(dialog.includes('data-testid="restock-moves-clear"')).toBe(true);
    expect(dialog.includes('clear all moves ({movedCount})')).toBe(true);
  });

  it('the hand census is derived, never an effect', () => {
    expect(dialog.includes('const movedCount = useMemo(')).toBe(true);
  });
});

// ── THE WALK'S RECEIPTS ──────────────────────────────────────────────────

describe('the raised PO remembers the hand (v2.223.0)', () => {
  it('the split walk counts its moved rows per group', () => {
    expect(dialog.includes('const movedInGroup = splitOn')).toBe(true);
  });

  it('the notes name the work — "N lines moved by hand."', () => {
    expect(dialog.includes('${movedInGroup > 0 ? ` ${movedInGroup} ${movedInGroup === 1 ? \'line\' : \'lines\'} moved by hand.` : \'\'}')).toBe(true);
  });
});

// ── THE VOID JOINS THE CHAIN ─────────────────────────────────────────────

describe('the audit chain names the void (v2.223.0)', () => {
  it('the cancel route writes a tamper-evident VOID event for the sheet', () => {
    expect(cancelRoute.includes("action: 'VOID',")).toBe(true);
    expect(cancelRoute.includes("resourceType: 'STOCK_TAKE',")).toBe(true);
    expect(cancelRoute.includes('const { auditTrail } = await import(\'@/lib/audit-trail\');')).toBe(true);
  });

  it('the zero law rides IN the event body — a void is a void, on the record', () => {
    expect(cancelRoute.includes("oldValues: { status: 'COUNTING' },")).toBe(true);
    expect(cancelRoute.includes("newValues: { status: 'CANCELLED', stockMoved: 0, movements: 0 },")).toBe(true);
  });

  it('the canceller and the reason are on the record, verbatim', () => {
    expect(cancelRoute.includes('actorId: session.userId,')).toBe(true);
    expect(cancelRoute.includes('actorRole: session.role,')).toBe(true);
    expect(cancelRoute.includes("reason: reason ?? 'no reason given',")).toBe(true);
  });

  it('BEST-EFFORT BY LAW — the chain must never block the void (the shift-closeout pattern)', () => {
    expect(cancelRoute.includes('} catch {\n    /* the chain must never block the void */\n  }')).toBe(true);
  });
});

// ── THE LINE FINDER ──────────────────────────────────────────────────────

describe('the drill grows a line finder (v2.223.0)', () => {
  it('the needle is client-side over the lines the drill already holds (zero new fetch)', () => {
    expect(drill.includes('const [needle, setNeedle] = useState(\'\');')).toBe(true);
    expect(drill.includes('data-testid="sheet-drill-finder"')).toBe(true);
    expect(drill.includes('aria-label="Find a line by name or SKU"')).toBe(true);
    expect(drill.includes('placeholder="find a line — name or SKU"')).toBe(true);
  });

  it('the needle filters name OR SKU, case-insensitive (now composed with the lens AND the variances-only chip over the SAME held lines)', () => {
    // v2.232.0: the variances-only chip joined the composed clause —
    // the sku arm now hands to the variance arm, not the filter's
    // close. Re-pinned to the GROWN clause; the guarded law survives:
    // one filter answers to every needle over the SAME held lines.
    expect(drill.includes('data.lines.filter(')).toBe(true);
    expect(drill.includes('l.name.toLowerCase().includes(cleanNeedle) ||')).toBe(true);
    expect(drill.includes('l.sku.toLowerCase().includes(cleanNeedle)) &&')).toBe(true);
    expect(drill.includes('(!variancesOnly || (l.variance != null && l.variance !== 0)),')).toBe(true);
  });

  it('the count is honest — N of M, and the summary tiles stay whole-sheet', () => {
    expect(drill.includes('data-testid="sheet-drill-finder-count"')).toBe(true);
    expect(drill.includes('{num(shownLines.length)} of {num(data.lines.length)}')).toBe(true);
  });

  it('the empty face names the needle and the sheet\'s truth', () => {
    expect(drill.includes('data-testid="sheet-drill-finder-empty"')).toBe(true);
    expect(drill.includes('no line answers “${needle.trim()}” — the sheet holds ${num(data.lines.length)}')).toBe(true);
  });

  it('the finder carries a clear (×) that returns the full list', () => {
    expect(drill.includes('data-testid="sheet-drill-finder-clear"')).toBe(true);
    expect(drill.includes('aria-label="Clear the line finder"')).toBe(true);
  });

  it('a fresh door is an empty needle — the map keys the drill per sheet (no effect ever resets it)', () => {
    expect(varianceMap.includes('key={drill.id}')).toBe(true);
    expect(varianceMap.includes('onOpenSheet={(next) => setDrill(next)}')).toBe(true); // v2.234.0 re-pin: the mount grew the verdict door (the re-key law)
  });
});

// ── THE STYLING DETAILS ──────────────────────────────────────────────────

describe('the styling details (v2.223.0)', () => {
  it('the violet family carries the hand — distinct from the amber split and the emerald success, 3:1 on every chip', () => {
    expect(dialog.includes('bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30')).toBe(true);
  });

  it('the move row rides a dashed hairline (a boundary, not a new card)', () => {
    expect(dialog.includes('border-t border-dashed border-slate-200 pt-1.5 dark:border-slate-700')).toBe(true);
  });

  it('the reset link is a dotted underline that solidifies on hover', () => {
    expect(dialog.includes('underline decoration-dotted underline-offset-2')).toBe(true);
    expect(dialog.includes('hover:decoration-solid')).toBe(true);
  });

  it('the finder has its focus ring and the search glass sits inside the field', () => {
    expect(drill.includes('focus:ring-1 focus:ring-amber-500/40')).toBe(true);
    expect(drill.includes('pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2')).toBe(true);
  });

  it('the clear-all wears the violet ring (the hand\'s family, consistent)', () => {
    expect(dialog.includes('text-violet-700 ring-1 ring-violet-200 transition-colors hover:bg-violet-50 dark:text-violet-300 dark:ring-violet-500/30 dark:hover:bg-violet-500/10')).toBe(true);
  });
});
