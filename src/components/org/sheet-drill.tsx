'use client';

// v2.222.0 THE SHEET DRILL — the org face of ONE count sheet. The
// variance map's roster rows become doors; this modal is what they
// open. READ-ONLY BY LAW: the org face watches the floor's truth — no
// count inputs, no close, no cancel (the branch sheet face keeps the
// only pens). Every status drills: COUNTING shows its progress lines,
// CLOSED its variance chips and the stored close-day cost, CANCELLED
// its void.
//
// v2.223.0 THE LINE FINDER — a big sheet's lines can outrun the fold;
// the drill grows a client-side needle (name or SKU, case-insensitive)
// over the lines it ALREADY holds — zero new fetch, the wire untouched.
// The count line says N of M (an honest arithmetic, never a hidden
// filter), the empty face names the needle and the truth ("the sheet
// holds M lines"), and a clear (×) returns the full list. The needle
// is STATE of the drill, not of the sheet: the map keys the drill per
// sheet, so a fresh door opens with an empty needle by construction.
//
// v2.224.0 THE SHEET'S COPY — the drill's lines go portable: a client-
// side CSV over the lines the drill ALREADY holds (zero new fetch, the
// wire untouched) for physical filing — the audit loop a hardware yard
// actually runs (a printed sheet in a ring binder). The law of the
// file: it speaks the WHOLE sheet (the finder narrows the reading,
// never the export); a cost-gated cell exports EMPTY (absence, never a
// hidden zero); a CANCELLED sheet exports its void truth (snapshot +
// uncounted); the button hides on a sheet that froze no lines (an
// absent control never lies).
//
// v2.227.0 THE SHEET'S PAPER — the ring binder's paper to the CSV's
// file: while a sheet drill is open the body carries the sheet-
// printing class, and the print stylesheet (globals.css) silences the
// shell and lays the open sheet on the page — header, tiles, notes,
// lines with their variance chips. The controls (close, finder, CSV/
// Print, N-of-M) stay off the paper — a control is a screen thing.
// The Print button mounts only once the sheet has loaded AND froze
// lines (the CSV sibling law: an absent control never lies);
// window.print() is the whole machinery. The twice-proven PO drill
// pattern transplanted, the amber family's turn.
//
// v2.228.0 THE CLIPBOARD — the paper becomes the floor's TOOL: a
// COUNTING sheet prints as a walk-list, not just a record. While the
// sheet still counts, its paper grows three print-only fittings (the
// base stylesheet keeps them off the screen — a screen face never
// pretends to be a pen): a floor-copy note under the header, an EMPTY
// COUNT BOX on every line (the shelf's ask — write what you see; a
// line the system already heard still gets its box, because the walk
// is the verification), and the signature rules at the foot (counted
// by / checked by / date — a walk needs its witnesses). CLOSED and
// CANCELLED sheets keep the v2.227 record face: chips, not boxes —
// the paper answers to the sheet's status, never to a toggle. The
// Print button's aria speaks the mode for the ear.
//
// v2.230.0 THE SHEET'S LENS — the category needle the finder's twin:
// a big sheet walks many shelves, so the drill grows a category lens
// over the lines it ALREADY holds (the wire grew each line's category
// — zero new fetch on the client). The law of the lens is the law of
// the finder: it narrows the READING, never the sheet — the tiles
// keep the whole sheet's arithmetic, the CSV keeps the whole sheet's
// file, and the count line stays an honest N of M. "uncategorized" is
// a real bucket (a product that never joined a category still walked);
// the lens mounts only when the sheet spans MORE THAN ONE bucket (a
// one-shelf sheet has nothing to lens — an absent control never lies);
// and like the needle it is STATE of the drill, not of the sheet: the
// map keys the drill per sheet, so a fresh door opens the lens at
// "all categories" by construction.
//
// v2.231.0 THE BRANCH LENS — the lens's twin walks the branch face.
//
// v2.232.0 THE RECOUNT — the loop closes: a CLOSED sheet's variances
// become the NEXT sheet's population. Two instruments grow:
// • the variances-only lens (the third instrument beside the finder
//   and the category lens): an aria-pressed chip that narrows the
//   reading to the lines whose counted ≠ snapshot — composing with
//   the other two needles over the SAME held lines, the honest N-of-M
//   answering all three, and the tiles keeping the whole-sheet truth;
// • the recount DOOR (an anchor, never a button — this face stays
//   READ-ONLY BY LAW: the branch face keeps the only pens): the
//   drill wire's store block grew the store's slug (one cheap
//   column, zero new fetches) and the CLOSED face links to the
//   branch's stock-take face, where the recount spawn lives.
//
// THE LAWS IT INHERITS:
// • the cost law: the wire's varianceValue and per-line varianceCost
//   arrive null past the cost gate — the face renders the honest
//   absence ("the shillings stay behind the cost gate"), never a
//   hidden zero;
// • the zero-new-fetch law does NOT apply here — the drill is a
//   deliberate act (the user OPENED a sheet), so ONE fetch is the
//   contract, disclosed by the loading face; the MAP itself still
//   composes the kpi payload alone;
// • the panel-owns-its-dark-half law: dark halves from birth; the
//   muted family (slate-500 / dark:slate-400) carries every sub-line;
//   the 3:1 contrast law on every chip.

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ArrowRight, ClipboardCheck, DoorOpen, Download, Printer, Search, X } from 'lucide-react';
import { num, timeAgo, parseSheetLineage } from './primitives';
import { bandHouse, chipLabel, daysVoice, findingsVoice } from '@/lib/cadence-band';

const fmtKes = (v: number) =>
  `KES ${v.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// v2.224.0: CSV escaping — the boring law that keeps a file honest:
// a field carrying a comma, a quote or a newline rides wrapped, its
// own quotes doubled. Pure, so the pins can read it.
export function csvCell(v: string | number | null | undefined): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function sheetLinesCsv(lines: DrillWire['data']['lines'], opts: { costGated: boolean }): string {
  const header = 'product,sku,unit,snapshot,counted,variance,variance_cost_kes';
  const rows = lines.map((l) =>
    [
      csvCell(l.name),
      csvCell(l.sku),
      csvCell(l.unitType),
      l.snapshotQty,
      l.countedQty != null ? l.countedQty : '',
      l.variance != null ? l.variance : '',
      !opts.costGated && l.varianceCost != null ? l.varianceCost : '',
    ].join(','),
  );
  // The BOM: Excel opens UTF-8 honestly (the yard's machine, not ours).
  return `\ufeff${[header, ...rows].join('\r\n')}`;
}

const statusChip = (s: string) => {
  if (s === 'COUNTING') return 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30';
  if (s === 'CLOSED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30';
  return 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30';
};

const varianceChip = (v: number) => {
  if (v === 0) return { text: 'exact', cls: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30' };
  if (v > 0) return { text: `+${num(v)}`, cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30' };
  return { text: `${num(v)}`, cls: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30' };
};

export type SheetDrillTarget = { id: string; storeName: string; status: string } | null;

interface DrillWire {
  success: boolean;
  data: {
    id: string;
    status: string;
    notes: string | null;
    // v2.239.0 THE DRILL'S BIRTH CHIP: additive + optional — the sheet's
    // own origin as the create wire stored it (the allowlist law means
    // 'walk-door' or nothing). An older cached wire renders the silent
    // absence (the face checks the value, never assumes).
    origin?: string | null;
    // v2.242.0 THE AISLE'S ECHO: additive + optional — WHERE the door
    // opened (the aisle's own name, the wire's truth). An older cached
    // wire or an aisle-less birth renders the silent absence.
    walkAisle?: string | null;
    // v2.244.0 THE AISLE'S ECHO: the aisle's own cadence band + the days
    // voice (additive + optional — null when the birth named no aisle or
    // the band read fell back; the face wears the name-only echo, never
    // a guessed house).
    walkAisleBand?: 'fresh' | 'stale' | 'beyond' | 'never' | null;
    walkAisleDaysSince?: number | null;
    // v2.246.0 THE AISLE'S TESTAMENT: the aisle's own window verdict
    // (additive + optional — null when no window walk spoke for the
    // aisle, beyond/never, or the testament read fell back; the honest
    // absence, never a hidden zero).
    walkAisleUnits?: number | null;
    walkAisleSheetUnits?: number | null;
    // v2.234.0 THE VERDICT — the lineage backwards: when a LATER sheet
    // was spawned from this one (the notes signature), the wire names
    // it and, once that child CLOSED, its variance units. Optional in
    // the type (the honest absence: null = no child, no verdict).
    recountedBy?: { id: string; status: string; closedAt: string | null; varianceUnits: number | null } | null;
    startedAt: string;
    closedAt: string | null;
    startedByName: string | null;
    closedByName: string | null;
    store: { id: string; name: string; code: string | null; slug?: string | null };
    summary: {
      totalLines: number;
      countedLines: number;
      uncountedLines: number;
      varianceUnits: number;
      varianceValue: number | null;
    };
    lines: Array<{
      id: string;
      name: string;
      sku: string;
      unitType: string;
      // v2.230.0: the shelf name the lens reads — optional in the TYPE
      // so the branch panel's own SheetLine (imported sheetLinesCsv's
      // other caller) stays assignable; the org wire always fills it.
      category?: string | null;
      snapshotQty: number;
      countedQty: number | null;
      variance: number | null;
      varianceCost: number | null;
    }>;
  };
}

export function SheetDrill({ target, onClose, onOpenSheet }: { target: SheetDrillTarget; onClose: () => void; onOpenSheet?: (next: { id: string; storeName: string; status: string }) => void }) {
  // v2.223.0: the needle — the finder's state, reset by the map's per-
  // sheet key (a fresh door is an empty needle), never an effect.
  const [needle, setNeedle] = useState('');
  // v2.230.0: the lens — the category needle, the same per-door law
  // (the map keys the drill per sheet; a fresh door reads "all").
  const [categoryNeedle, setCategoryNeedle] = useState('all');
  // v2.232.0: the variances-only lens — the third instrument, the same
  // per-door law (the map keys the drill per sheet; a fresh door reads
  // the whole sheet).
  const [variancesOnly, setVariancesOnly] = useState(false);
  const wire = useQuery<DrillWire>({
    queryKey: ['org-sheet-drill', target?.id],
    enabled: !!target?.id,
    staleTime: 15_000,
    refetchInterval: target?.status === 'COUNTING' ? 10_000 : false,
    queryFn: async () => {
      if (!target?.id) throw new Error('no sheet on this drill');
      const res = await fetch(`/api/org/stock-takes/${encodeURIComponent(target.id)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `the sheet refused to open (${res.status})`);
      }
      return res.json();
    },
  });

  // v2.227.0: THE SHEET'S PAPER's gate — while the drill is open, the
  // body carries the class the print stylesheet reads (the shell falls
  // silent, the sheet becomes the page). A mount/unmount lifecycle
  // effect: the class lives exactly as long as the door does. It rides
  // ABOVE the null guard — hooks never ride a conditional (the v2.226
  // lesson bank, applied before it could bite here too).
  useEffect(() => {
    document.body.classList.add('sheet-printing');
    return () => document.body.classList.remove('sheet-printing');
  }, []);

  if (!target) return null;
  const data = wire.data?.data;
  // v2.228.0: the clipboard gate — the paper's mode IS the sheet's
  // status (COUNTING walks, CLOSED/CANCELLED record). One derivation,
  // read by the card's attribute, the line boxes, the foot and the
  // Print button's aria — four faces, one law.
  const isClipboard = data?.status === 'COUNTING';

  // v2.224.0: the copy — a download of the WHOLE sheet's lines (the
  // finder narrows the reading, never the export). The cost cell obeys
  // the gate the SAME way the face does: absent is absent in the file.
  const costGated = data?.summary.varianceValue == null;
  const exportLines = () => {
    if (!data) return;
    const csv = sheetLinesCsv(data.lines, { costGated });
    const stamp = data.startedAt.slice(0, 10);
    const name = `count-sheet-${data.store.code ?? 'branch'}-${stamp}-${data.status.toLowerCase()}.csv`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };
  // v2.223.0: the finder's arithmetic — the needle filters the lines
  // the drill ALREADY holds (name or SKU, case-insensitive); the counts
  // stay honest (N of M), the tiles stay whole-sheet (the summary is
  // the SHEET's truth — the finder narrows the reading, never the
  // arithmetic).
  const cleanNeedle = needle.trim().toLowerCase();
  // v2.230.0: the lens's buckets — the sheet's own categories, derived
  // from the lines the drill ALREADY holds. "uncategorized" is a real
  // bucket and sorts LAST (named shelves first); the control mounts
  // only when the sheet spans MORE THAN ONE bucket — a one-shelf sheet
  // has nothing to lens (an absent control never lies).
  const categoryBuckets = data
    ? Array.from(new Set(data.lines.map((l) => l.category ?? 'uncategorized'))).sort(
        (a, b) => (a === 'uncategorized' ? 1 : 0) - (b === 'uncategorized' ? 1 : 0) || a.localeCompare(b),
      )
    : [];
  const lensActive = categoryBuckets.length > 1;
  // v2.232.0: the variance lines — the recount's raw material and the
  // variances-only lens's population, derived from the lines the drill
  // ALREADY holds (zero new fetch). A line with a count that answers
  // differently from its snapshot is a variance; the chip the line
  // already wears is this lens's vocabulary.
  const varianceLines = data ? data.lines.filter((l) => l.variance != null && l.variance !== 0) : [];
  const variancesActive = varianceLines.length > 0;
  // v2.248.0 THE RESTOCK'S RAW MATERIAL — the shrinkage lines (the count
  // found LESS than the snapshot believed): the hole the restock answers.
  // A surplus line (found more) needs no restock — the shelf held more
  // than the books said — so the door speaks only when something LEFT.
  const shrinkageLines = data ? data.lines.filter((l) => l.variance != null && l.variance < 0) : [];
  // The combined reading: the lens narrows the shelf, the needle
  // narrows the line, the variances-only chip narrows to the disputed
  // lines — all client-side over the SAME held lines, all answered by
  // the one honest N-of-M count. The tiles never hear of any of them
  // (the sheet's truth stays whole).
  const shownLines = data
    ? data.lines.filter(
        (l) =>
          (categoryNeedle === 'all' || (l.category ?? 'uncategorized') === categoryNeedle) &&
          (!cleanNeedle ||
            l.name.toLowerCase().includes(cleanNeedle) ||
            l.sku.toLowerCase().includes(cleanNeedle)) &&
          (!variancesOnly || (l.variance != null && l.variance !== 0)),
      )
    : [];

  return (
    <div
      data-testid="sheet-drill"
      data-sheet-print-overlay=""
      role="dialog"
      aria-label={`Count sheet at ${target.storeName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 dark:bg-slate-950/70"
      onClick={onClose}
    >
      <div
        data-sheet-print=""
        {...(isClipboard ? { 'data-sheet-clipboard': '' } : {})}
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <ClipboardCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span data-testid="sheet-drill-title">Count sheet</span>
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ${statusChip(target.status)}`}>
                {target.status}
              </span>
              {/* v2.239.0 THE DRILL'S BIRTH CHIP — a door-born sheet wears
                  its birth on the record face: the violet door family (the
                  coverage breakdown's chip wears the same), the DoorOpen
                  glass, the law on the title. A hand-raised sheet wears
                  nothing — the silence is the honest state, and a census
                  never grows a guess. */}
              {data?.origin === 'walk-door' && (
                <span
                  data-testid="sheet-drill-origin"
                  title="this sheet was born at a walk door — the org face pointed, the floor answered (the census counts it)"
                  className="inline-flex items-center gap-1 rounded bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30"
                >
                  <DoorOpen className="h-2.5 w-2.5" aria-hidden="true" />
                  born at a walk door
                </span>
              )}
              {/* v2.242.0 THE AISLE'S ECHO — the drill names WHERE the door
                  opened: the aisle's own name rides the wire, the chip
                  speaks it in the door's violet house (tabular-nums never
                  needed — a name, not a figure). The echo is a sibling
                  span, never a rewrite of the birth chip: the chip's law
                  ('walk-door' or nothing) stays byte-identical, and an
                  aisle-less birth wears no echo (the silence is honest). */}
              {data?.origin === 'walk-door' && data?.walkAisle && (
                <span
                  data-testid="sheet-drill-origin-aisle"
                  title="the walk order named this aisle — the census knows where the door opened"
                  className="inline-flex items-center gap-1 rounded bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30"
                >
                  <DoorOpen className="h-2.5 w-2.5" aria-hidden="true" />
                  the walk order named {data.walkAisle}
                </span>
              )}
              {/* v2.244.0 THE AISLE'S ECHO — the aisle's own cadence chip:
                  the band houses the map speaks (one home now — the lib),
                  the days voice on the title. A sibling span, never a
                  rewrite of the name chip (the v2.242.0 law); absent when
                  the wire carried no band (an aisle-less birth, an older
                  cached answer, a fallen-back read) — the silence is the
                  honest state. */}
              {data?.origin === 'walk-door' && data?.walkAisle && data?.walkAisleBand && (
                <span
                  data-testid="sheet-drill-origin-aisle-band"
                  title={`the aisle's own cadence — ${daysVoice({ band: data.walkAisleBand, daysSince: data.walkAisleDaysSince ?? null })}`}
                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 tabular-nums ${bandHouse(data.walkAisleBand).chip}`}
                >
                  {chipLabel(data.walkAisleBand)}
                </span>
              )}
              <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{target.storeName}</span>
            </h3>
            {data && (
              <p data-testid="sheet-drill-when" className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                opened {timeAgo(data.startedAt)}{data.startedByName ? ` by ${data.startedByName}` : ''}
                {data.status === 'CLOSED' && data.closedAt
                  ? ` · closed ${timeAgo(data.closedAt)}${data.closedByName ? ` by ${data.closedByName}` : ''}`
                  : ''}
                {data.status === 'CANCELLED' ? ' · a void — no adjustments, no movements' : ''}
              </p>
            )}
            {/* v2.247.0 THE WALK'S MIRROR — when this sheet's OWN walk
                found something DIFFERENT from what the aisle's latest
                window walk found, the drill says both truths: this
                walk's own verdict first (the lib's findingsVoice, the
                same three families, tabular-nums), then the aisle's
                latest beneath it (the v2.246.0 line, byte-identical).
                When they agree, the single line keeps the floor's one
                voice — a duplicate would say nothing new. Absent when
                either truth is absent (an aisle-less birth, beyond/
                never, a silent window, an older cached answer, a
                fallen-back read) — the silence is the honest state. */}
            {(() => {
              if (
                data?.origin !== 'walk-door' ||
                !data?.walkAisle ||
                data?.walkAisleSheetUnits == null ||
                data?.walkAisleUnits == null ||
                data.walkAisleSheetUnits === data.walkAisleUnits
              )
                return null;
              const fv = findingsVoice(data.walkAisleSheetUnits);
              return (
                <p
                  data-testid="sheet-drill-origin-aisle-self"
                  title="this sheet's own walk — the aisle's shelf as this paper found it"
                  className={`text-[10px] font-medium tabular-nums ${fv.cls}`}
                >
                  this walk: {fv.text}
                </p>
              );
            })()}
            {/* v2.246.0 THE AISLE'S TESTAMENT — the drill's aisle line
                says what the aisle's latest window walk FOUND there:
                the census's own three families (one home — the lib's
                findingsVoice), tabular-nums on the figure, the shelf's
                own truth on the title. A sibling line, never a rewrite
                of the chip row (the v2.242.0 law); absent when the wire
                carried no units (beyond/never, a silent window, an
                older cached answer, a fallen-back read) — the silence
                is the honest state. */}
            {(() => {
              if (data?.origin !== 'walk-door' || !data?.walkAisle || data?.walkAisleUnits == null) return null;
              const fv = findingsVoice(data.walkAisleUnits);
              return (
                <p
                  data-testid="sheet-drill-origin-aisle-verdict"
                  title="the aisle's latest walk found this — the shelf's own truth"
                  className={`text-[10px] font-medium tabular-nums ${fv.cls}`}
                >
                  {fv.text}
                </p>
              );
            })()}
          </div>
          <button
            type="button"
            data-testid="sheet-drill-close"
            data-sheet-print-off=""
            aria-label="Close the sheet drill"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {wire.isLoading && (
          <p data-testid="sheet-drill-loading" className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
            opening the sheet — one fetch of its lines…
          </p>
        )}
        {wire.isError && (
          <p data-testid="sheet-drill-error" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {wire.error instanceof Error ? wire.error.message : 'the sheet refused to open'}
          </p>
        )}

        {data && (
          <>
            {/* v2.228.0: the clipboard's floor-copy note — print-only
                (the base stylesheet keeps it off the screen), it tells
                the walk what this paper is and where the pens live. */}
            {isClipboard && (
              <p data-sheet-clipboard-note="" className="mt-3 rounded-lg border border-dashed border-amber-300 bg-amber-50/60 px-3 py-2 text-[11px] font-medium text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                floor copy — walk the shelves, write what you see; the branch app holds the pens.
              </p>
            )}
            {/* The summary tiles — units for every role, the shillings past the gate. */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-100 p-2.5 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Lines</p>
                <p data-testid="sheet-drill-lines" className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">{num(data.summary.totalLines)}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{data.summary.countedLines} counted{data.summary.uncountedLines > 0 ? ` · ${data.summary.uncountedLines} to go` : ''}</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Variance</p>
                <p data-testid="sheet-drill-units" className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {data.summary.varianceUnits > 0 ? '+' : ''}{num(data.summary.varianceUnits)}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">units, counted − snapshot</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Ledger value</p>
                <p data-testid="sheet-drill-value" className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {data.summary.varianceValue != null ? fmtKes(data.summary.varianceValue) : '—'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {data.summary.varianceValue != null
                    ? data.status === 'CLOSED' ? 'the close-day cost' : 'book-cost estimate'
                    : 'the shillings stay behind the cost gate'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Sheet</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{data.store.code ?? data.store.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{data.status === 'COUNTING' ? 'the floor is speaking' : data.status === 'CLOSED' ? 'the books heard it' : 'the void'}</p>
              </div>
            </div>

            {/* v2.233.0 THE LINEAGE — the note, read as a record. Three
                faces, one law: the note speaks verbatim, the face only
                decides HOW LOUD.
                • a recount lineage wears the amber face: the full source
                  id (the whole truth — the roster chip only whispers),
                  any remainder, and the status-voiced line (what this
                  sheet means in the loop);
                • a CANCELLED sheet's note is the branch's reason — it
                  earns the "why the void" face;
                • any other note keeps the verbatim box it always had.
                All three ride the paper (no print-off mark): a printed
                record carries its own lineage. */}
            {data.notes && (() => {
              const lineage = parseSheetLineage(data.notes);
              if (lineage?.kind === 'recount' && lineage.sourceSheetId) {
                return (
                  <div data-testid="sheet-drill-lineage" className="mt-2 rounded-lg border border-amber-200 bg-amber-50/60 px-2.5 py-1.5 text-[10px] text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                    <p className="font-semibold">
                      recount of sheet <span className="tabular-nums">{lineage.sourceSheetId}</span>
                    </p>
                    {lineage.remainder && <p className="mt-0.5">{lineage.remainder}</p>}
                    <p className="mt-0.5 text-[9px] text-amber-700 dark:text-amber-300/80">
                      {data.status === 'COUNTING'
                        ? 'the re-walk is on the floor — these lines were the last dispute.'
                        : data.status === 'CLOSED'
                          ? 'the dispute was re-walked — this sheet is the verdict.'
                          : 'the re-walk was voided before it spoke.'}
                    </p>
                  </div>
                );
              }
              if (data.status === 'CANCELLED') {
                const why = lineage ? lineage.text : data.notes;
                return (
                  <p data-testid="sheet-drill-void-why" className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] italic text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    why the void: {why}
                  </p>
                );
              }
              return (
                <p data-testid="sheet-drill-notes" className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  {data.notes}
                </p>
              );
            })()}

            {/* v2.234.0 THE VERDICT — the lineage BACKWARDS. A sheet that
                was re-walked learns it here: the child's full id, its
                status voice, and (once the child CLOSED) the units the
                re-walk found — the loop read from the parent's side.
                The child button is NAVIGATION, never a pen: it re-keys
                this drill onto the child (the map's own door law — a
                fresh door, one fetch, the instruments reset by the
                key). The same store by construction: the spawn posts to
                the branch's own wire, so the parent's storeName rides.
                The FACE rides the paper (a printed record carries its
                verdict); the open-child BUTTON is a control and stays
                off it (data-sheet-print-off — a control is a screen
                thing). */}
            {data.recountedBy && (() => {
              const child = data.recountedBy;
              const childVoice =
                child.status === 'CLOSED'
                  ? child.varianceUnits != null && child.varianceUnits === 0
                    ? 'the re-walk found the shelf true — the dispute settled at zero.'
                    : child.varianceUnits != null
                      ? `the re-walk spoke — ${num(child.varianceUnits)} units between book and shelf.`
                      : 'the re-walk closed.'
                  : child.status === 'COUNTING'
                    ? 'the re-walk is on the floor — the verdict waits.'
                    : 'the re-walk was voided before it spoke.';
              return (
                <div data-testid="sheet-drill-verdict" className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50/60 px-2.5 py-1.5 text-[10px] text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <p className="font-semibold">
                      re-walked by sheet <span className="tabular-nums">{child.id}</span>
                      {child.status === 'CLOSED' && child.varianceUnits != null ? (
                        <span className="ml-1.5 tabular-nums">· {num(child.varianceUnits)} units</span>
                      ) : null}
                    </p>
                    {onOpenSheet && (
                      <button
                        type="button"
                        data-testid="sheet-drill-verdict-open"
                        data-sheet-print-off=""
                        onClick={() => onOpenSheet({ id: child.id, storeName: target.storeName, status: child.status })}
                        className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-300 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/40 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
                        aria-label={`Open the re-walk sheet ${child.id} in this drill`}
                      >
                        <ArrowRight className="h-3 w-3" aria-hidden="true" /> open the re-walk
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-[9px] text-emerald-700 dark:text-emerald-300/80">{childVoice}</p>
                </div>
              );
            })()}

            {/* The lines — read-only. Uncounted first (the wire's order),
                then alphabetical; the variance chip carries the meaning.
                v2.223.0: the LINE FINDER rides above the list — a
                client-side needle over the lines the drill already
                holds (zero new fetch), an honest N-of-M count, and an
                empty face that names the needle and the sheet's truth. */}
            <div className="mt-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">the lines</p>
                <div className="flex items-center gap-1.5">
                  {data && data.lines.length > 0 && (
                    <>
                      {/* v2.227.0: THE SHEET'S PAPER — the print act,
                          named for the ear. The stylesheet lays the
                          sheet on the page; this button only names it.
                          Mounts beside the CSV under the SAME gate (a
                          sheet that froze no lines prints nothing but
                          silence — an absent control never lies). */}
                      <button
                        type="button"
                        data-testid="sheet-drill-print"
                        data-sheet-print-off=""
                        aria-label={isClipboard
                          ? `Print the floor's clipboard — ${data.lines.length} lines with empty count boxes`
                          : `Print all ${data.lines.length} lines of the count sheet at ${target.storeName}`}
                        title={isClipboard
                          ? 'the clipboard — the paper walks the shelves with the floor; every line gets a box to write in'
                          : "the sheet's paper — the face lays itself on the page; the controls stay off the paper"}
                        onClick={() => window.print()}
                        className="flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Printer className="h-3 w-3" aria-hidden="true" />
                        Print
                      </button>
                      {/* v2.224.0: THE SHEET'S COPY — the whole sheet, one
                          file. Absent on a line-less sheet (an absent
                          control never lies); the aria names the whole-
                          sheet law so the ear reads the same contract. */}
                      <button
                        type="button"
                        data-testid="sheet-drill-export"
                        data-sheet-print-off=""
                        aria-label={`Download all ${data.lines.length} lines as CSV`}
                        title="the whole sheet, one file — the finder narrows the reading, never the export"
                        onClick={exportLines}
                        className="flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Download className="h-3 w-3" aria-hidden="true" />
                        CSV
                      </button>
                    </>
                  )}
                  {/* v2.230.0: THE SHEET'S LENS — the category needle,
                      the finder's twin. Mounts only when the sheet
                      spans more than one bucket; narrows the reading,
                      never the sheet (the tiles keep the whole-sheet
                      arithmetic, the CSV keeps the whole file). */}
                  {lensActive && (
                    <select
                      data-testid="sheet-drill-lens"
                      data-sheet-print-off=""
                      aria-label="Filter the lines by category"
                      title="the sheet's lens — narrow the reading by shelf; the tiles keep the whole sheet's truth"
                      value={categoryNeedle}
                      onChange={(e) => setCategoryNeedle(e.target.value)}
                      className="h-6 max-w-[10rem] rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-700 transition-colors focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="all">all categories</option>
                      {categoryBuckets.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}
                  {/* v2.232.0: THE VARIANCES-ONLY LENS — the third
                      instrument: an aria-pressed chip that narrows the
                      reading to the disputed lines (counted ≠ snapshot).
                      It composes with the lens and the finder over the
                      SAME held lines; the tiles keep the whole-sheet
                      truth. Mounts only when the sheet holds at least
                      one variance — an absent control never lies. */}
                  {variancesActive && (
                    <button
                      type="button"
                      data-testid="sheet-drill-variances-only"
                      data-sheet-print-off=""
                      aria-pressed={variancesOnly}
                      title="the variances-only lens — read only the lines whose count answered differently; the tiles keep the whole sheet's truth"
                      onClick={() => setVariancesOnly((v) => !v)}
                      className={`inline-flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-semibold ring-1 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500/40 ${
                        variancesOnly
                          ? 'bg-amber-700 text-white ring-amber-700 dark:bg-amber-600 dark:ring-amber-600'
                          : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-slate-800'
                      }`}
                    >
                      variances only · {num(varianceLines.length)}
                    </button>
                  )}
                  <span className="relative" data-sheet-print-off="">
                    <Search className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                    <input
                      type="text"
                      data-testid="sheet-drill-finder"
                      aria-label="Find a line by name or SKU"
                      placeholder="find a line — name or SKU"
                      value={needle}
                      onChange={(e) => setNeedle(e.target.value)}
                      className="h-6 w-40 rounded-md border border-slate-200 bg-white pl-6 pr-5 text-[10px] text-slate-700 placeholder:text-slate-400 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
                    />
                    {needle !== '' && (
                      <button
                        type="button"
                        data-testid="sheet-drill-finder-clear"
                        aria-label="Clear the line finder"
                        onClick={() => setNeedle('')}
                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </span>
                  {data && (
                    <span data-testid="sheet-drill-finder-count" data-sheet-print-off="" className="whitespace-nowrap text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                      {num(shownLines.length)} of {num(data.lines.length)}
                    </span>
                  )}
                  {/* v2.230.0: the lens names the shelf it reads — a
                      separate span beside the honest count (the count
                      itself already answers to BOTH instruments). */}
                  {data && categoryNeedle !== 'all' && (
                    <span data-testid="sheet-drill-lens-count" data-sheet-print-off="" className="whitespace-nowrap text-[10px] font-semibold tabular-nums text-amber-700 dark:text-amber-300">
                      in {categoryNeedle}
                    </span>
                  )}
                </div>
              </div>
              {/* v2.229.0: the shared lines mark — the branch walk's
                  face wears the same vocabulary, so the print law (the
                  scroll-clamp release) reads ONE attribute on BOTH
                  faces. The testid below stays the org face's own
                  door; the print CSS keys both. */}
              <ul data-testid="sheet-drill-lines-list" data-sheet-lines="" className="mt-1.5 max-h-[40vh] space-y-1 overflow-y-auto pr-1">
                {shownLines.map((l) => {
                  const chip = l.variance != null ? varianceChip(l.variance) : null;
                  return (
                    <li key={l.id} data-testid="sheet-drill-line" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white/70 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800/60">
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-slate-700 dark:text-slate-200">{l.name}</span>
                        <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400">{l.sku}</span>
                      </span>
                      <span className="flex flex-wrap items-center gap-2">
                        {/* v2.230.0: the line's shelf whisper — each line
                            names its category while the sheet spans more
                            than one (context for the lens AND for the
                            paper: a printed walk reads its shelves). It
                            PRINTS — no print-off mark — the paper keeps
                            the shelf names. */}
                        {lensActive && (
                          <span data-testid="sheet-drill-line-category" className="text-[9px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            {l.category ?? 'uncategorized'}
                          </span>
                        )}
                        <span className="text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                          snapshot {num(l.snapshotQty)} → {l.countedQty != null ? `counted ${num(l.countedQty)}` : 'uncounted'}
                        </span>
                        {chip && (
                          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold tabular-nums ring-1 ${chip.cls}`}>
                            {chip.text}
                          </span>
                        )}
                        {l.varianceCost != null && l.varianceCost !== 0 && (
                          <span className="text-[10px] tabular-nums font-semibold text-slate-600 dark:text-slate-300">
                            {fmtKes(l.varianceCost)}
                          </span>
                        )}
                      </span>
                      {isClipboard && (
                        /* v2.228.0: THE COUNT BOX — the paper's ask. A
                            ruled write-in for the pen, one per line,
                            EVERY line (a line the system already heard
                            still walks — the walk is the verification).
                            Print-only: the base stylesheet keeps it off
                            the screen, the print stylesheet lays it on
                            the paper beside the line's snapshot. */
                        <span data-sheet-count-box="" className="flex w-full items-center gap-2 sm:w-auto">
                          <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">counted</span>
                          <span aria-hidden="true" className="h-8 min-w-[8rem] flex-1 rounded border border-dashed border-slate-300 bg-white sm:flex-none sm:w-40 dark:border-slate-600" />
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {data && (cleanNeedle !== '' || categoryNeedle !== 'all' || variancesOnly) && shownLines.length === 0 && (
                <p data-testid="sheet-drill-finder-empty" className="mt-1.5 rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                  {cleanNeedle !== ''
                    ? categoryNeedle !== 'all'
                      ? `no line in “${categoryNeedle}” answers “${needle.trim()}” — the sheet holds ${num(data.lines.length)} ${data.lines.length === 1 ? 'line' : 'lines'}.`
                      : `no line answers “${needle.trim()}” — the sheet holds ${num(data.lines.length)} ${data.lines.length === 1 ? 'line' : 'lines'}.`
                    : categoryNeedle !== 'all'
                      ? variancesOnly
                        ? `no line with a variance in “${categoryNeedle}” — the sheet holds ${num(data.lines.length)} ${data.lines.length === 1 ? 'line' : 'lines'}, ${num(varianceLines.length)} of them with a variance.`
                        : `the lens came back empty — the sheet holds ${num(data.lines.length)} ${data.lines.length === 1 ? 'line' : 'lines'}.`
                      : `no line with a variance — the sheet holds ${num(data.lines.length)} ${data.lines.length === 1 ? 'line' : 'lines'}, ${num(varianceLines.length)} of them with a variance.`}
                </p>
              )}
              {data && data.lines.length === 0 && (
                <p data-testid="sheet-drill-lines-empty" className="mt-1.5 rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                  the sheet froze no lines — nothing to count.
                </p>
              )}
              {isClipboard && (
                /* v2.228.0: the walk's witnesses — print-only signature
                    rules at the foot of the clipboard. A walk needs its
                    names on the record it produced. */
                <div data-testid="sheet-drill-signatures" data-sheet-clipboard-signatures="" className="mt-4 flex items-end gap-4">
                  <span className="flex-1">
                    <span aria-hidden="true" className="block border-b border-slate-400" />
                    <span className="mt-0.5 block text-[9px] uppercase tracking-wide text-slate-500">counted by</span>
                  </span>
                  <span className="flex-1">
                    <span aria-hidden="true" className="block border-b border-slate-400" />
                    <span className="mt-0.5 block text-[9px] uppercase tracking-wide text-slate-500">checked by</span>
                  </span>
                  <span className="w-28">
                    <span aria-hidden="true" className="block border-b border-slate-400" />
                    <span className="mt-0.5 block text-[9px] uppercase tracking-wide text-slate-500">date</span>
                  </span>
                </div>
              )}
              {data.status === 'CLOSED' && variancesActive && data.store.slug && (
                /* v2.232.0: THE RECOUNT DOOR — the CLOSED face's way
                    forward. An ANCHOR, never a button: this face stays
                    read-only by law (the branch face keeps the only
                    pens), so the org face POINTS — the door opens the
                    branch's own stock-take face, where the recount
                    spawn freezes exactly these variance products
                    against a fresh snapshot. The address is the wire's
                    OWN slug (v2.232.0's additive column) — never a
                    client-side guess. A store without a slug holds no
                    door (an absent control never lies). */
                <a
                  data-testid="sheet-drill-recount-door"
                  data-sheet-print-off=""
                  href={`/stores/${data.store.slug}/inventory`}
                  title="open the branch's stock-take face — the recount spawn lives where the pens live"
                  className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-3 py-2 text-[11px] font-semibold text-amber-800 transition-colors hover:bg-amber-100/70 focus:outline-none focus:ring-1 focus:ring-amber-500/40 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20"
                >
                  <span className="min-w-0">
                    <span className="block">
                      recount the {num(varianceLines.length)} variance line{varianceLines.length === 1 ? '' : 's'} at {data.store.name}
                    </span>
                    <span className="mt-0.5 block text-[9px] font-medium text-amber-800/70 dark:text-amber-200/70">
                      opens the branch&apos;s stock-take face — the recount freezes exactly these products against a fresh snapshot.
                    </span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </a>
              )}
              {data.status === 'CLOSED' && shrinkageLines.length > 0 && data.store.slug && (() => {
                /* v2.248.0 THE RESTOCK DOOR — the sheet's ANSWER. The
                    recount door disputes a number; this door ANSWERS one:
                    when the walk found shrinkage (lines whose count came
                    in BELOW the snapshot — something left the shelf), the
                    floor can raise the restock born at THIS sheet. The
                    door is a hard anchor into the branch's purchase-orders
                    tab (the door's landing law — the URL's segment opens
                    the tab), carrying the sheet's id; the create dialog
                    reads ?restockFrom= one time, pre-picks exactly these
                    shrinkage lines (qty = the units the shelf lost, cost =
                    the product's own cost price), and the PO wears the
                    violet birth for the rest of its life. Violet = the
                    door's family (the birth chip's own house). ANCHOR, not
                    a pen: this face stays read-only by law. Absent when
                    the sheet found no shrinkage, is not CLOSED, or the
                    store has no slug — an absent control never lies. */
                const shrinkUnits = shrinkageLines.reduce((s, l) => s + Math.abs(l.variance ?? 0), 0);
                return (
                  <a
                    data-testid="sheet-drill-restock-door"
                    data-sheet-print-off=""
                    href={`/stores/${data.store.slug}/purchase-orders?restockFrom=${encodeURIComponent(data.id)}`}
                    title="open the branch's purchase orders with this sheet attached — the restock is born wearing this sheet's name"
                    className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-dashed border-violet-300 bg-violet-50/60 px-3 py-2 text-[11px] font-semibold text-violet-800 transition-colors hover:bg-violet-100/70 focus:outline-none focus:ring-1 focus:ring-violet-500/40 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/20"
                  >
                    <span className="min-w-0">
                      <span className="block">
                        raise the restock for the {num(shrinkageLines.length)} shrinkage line{shrinkageLines.length === 1 ? '' : 's'} at {data.store.name}
                      </span>
                      <span className="mt-0.5 block text-[9px] font-medium text-violet-800/70 dark:text-violet-200/70">
                        opens the branch&apos;s purchase orders — the PO is born wearing this sheet: {num(shrinkUnits)} unit{shrinkUnits === 1 ? '' : 's'} the shelf lost, pre-picked.
                      </span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </a>
                );
              })()}
              <p data-testid="sheet-drill-read-only" className="mt-1.5 text-[9px] text-slate-500 dark:text-slate-400">
                read-only — the branch sheet keeps the pens; this face watches the floor&apos;s truth.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
