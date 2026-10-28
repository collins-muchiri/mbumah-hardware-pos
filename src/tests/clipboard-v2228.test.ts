// v2.228.0 — the clipboard.
//
//   - THE CLIPBOARD: a COUNTING sheet's paper is the floor's TOOL, not
//     just its record. While the sheet still counts, its print face
//     grows three print-only fittings — a floor-copy note under the
//     header, an EMPTY COUNT BOX on every line (a line the system
//     already heard still gets its box: the walk is the verification),
//     and the signature rules at the foot (counted by / checked by /
//     date). The base stylesheet keeps all three off the screen (a
//     screen face never pretends to be a pen); the print stylesheet
//     lays them on the paper; a line never splits across pages.
//     CLOSED and CANCELLED keep the v2.227 record face — the paper's
//     mode IS the sheet's status, never a toggle. The Print button's
//     aria speaks the mode.
//   - THE WHISPER SPEAKS ITS NAMES: the watchlist stitch's hint now
//     carries its first THREE speakers beside the count (name +
//     stock/level — the branch's own numbers, one cheap column on the
//     candidates query, zero new queries). The amber chip becomes a
//     door of its own — a Radix popover trigger OUTSIDE the drill
//     button (a door inside a door is a lie the DOM refuses) — opening
//     a read-only popover over the SAME wire response (zero new
//     fetch): the speakers, the "+K more" cap disclosure, the
//     supplier-of-record law. Zero stays silent — no hints, no trigger.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const ledger = read('src/components/org/po-ledger.tsx');
const sheetDrill = read('src/components/org/sheet-drill.tsx');
const globals = read('src/app/globals.css');
const wire = read('src/app/api/org/purchase-orders/route.ts');
const pkg = JSON.parse(read('package.json'));
const changelog = read('CHANGELOG.md');
const feed = read('src/lib/whats-new.ts');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.228.0)', () => {
  it('package.json leads 2.228.0 (all three slots)', () => {
    expect(version).toBe('2.241.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.241.0');
    expect(pkg.mbumah.baseVersion).toBe('2.241.0');
  });

  it('the changelog anchors the section ABOVE its ancestor (the structural pin — headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.228.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.228.0]')).toBeLessThan(changelog.indexOf('## [2.227.0]'));
  });

  it('the whats-new feed leads the clipboard entry (order pin: header-anchored, never a bare version string)', () => {
    expect(feed.includes("version: '2.228.0',")).toBe(true);
    expect(feed.indexOf("version: '2.228.0',")).toBeLessThan(feed.indexOf("version: '2.227.0',"));
  });

  it('the clipboard entry speaks the floor, the names and the record face', () => {
    const entry = feed.split("version: '2.228.0',")[1].split("version: '2.227.0',")[0];
    expect(entry).toContain('The clipboard');
    expect(entry).toContain('empty count box');
    expect(entry).toContain('signature rules');
    expect(entry).toContain('speaks its names');
    expect(entry).toContain('chips, not boxes');
  });
});

// ── THE CLIPBOARD (the sheet's print face grows its tool) ────────────────

describe('the clipboard gate (sheet-drill.tsx)', () => {
  it('the mode IS the sheet status — one derivation, four faces', () => {
    expect(sheetDrill).toContain("const isClipboard = data?.status === 'COUNTING';");
  });

  it('the card carries the clipboard attribute only while counting (a conditional spread, never a hardcoded mark)', () => {
    expect(sheetDrill).toContain("{...(isClipboard ? { 'data-sheet-clipboard': '' } : {})}");
  });

  it('the floor-copy note exists and speaks the walk and the pens', () => {
    expect(sheetDrill).toContain('data-sheet-clipboard-note=""');
    expect(sheetDrill).toContain('floor copy — walk the shelves, write what you see; the branch app holds the pens.');
  });

  it('every line gets its count box, and the box is EMPTY (the shelf\u2019s ask, not the system\u2019s echo)', () => {
    expect(sheetDrill).toContain('data-sheet-count-box=""');
    expect(sheetDrill.split('data-sheet-count-box=""').length - 1).toBe(1);
    const box = sheetDrill.split('data-sheet-count-box=""')[1].split('</span>\n                      )}')[0];
    expect(box).toContain('counted');
    expect(box).toContain('aria-hidden="true"');
    expect(box).not.toMatch(/\{num\(/); // no number rides inside the box
  });

  it('the box mounts inside the line map (every line walks, counted or not)', () => {
    const list = sheetDrill.split('data-testid="sheet-drill-lines-list"')[1].split('</ul>')[0];
    expect(list).toContain('data-sheet-count-box=""');
    expect(list).toContain('isClipboard &&');
  });

  it('the walk\u2019s witnesses: signature rules at the foot (counted by / checked by / date)', () => {
    expect(sheetDrill).toContain('data-testid="sheet-drill-signatures"');
    expect(sheetDrill).toContain('data-sheet-clipboard-signatures=""');
    const sig = sheetDrill.split('data-testid="sheet-drill-signatures"')[1].split('sheet-drill-read-only')[0];
    expect(sig).toContain('counted by');
    expect(sig).toContain('checked by');
    expect(sig).toContain('date');
  });

  it('the Print button\u2019s aria speaks the mode for the ear', () => {
    expect(sheetDrill).toContain("`Print the floor's clipboard — ${data.lines.length} lines with empty count boxes`");
    expect(sheetDrill).toContain('the clipboard — the paper walks the shelves with the floor; every line gets a box to write in');
    expect(sheetDrill).toContain('`Print all ${data.lines.length} lines of the count sheet at ${target.storeName}`');
  });

  it('the record face stands untouched: the v2.227 paper machinery and its off-marks stay', () => {
    expect(sheetDrill).toContain("document.body.classList.add('sheet-printing');");
    expect(sheetDrill).toContain('data-sheet-print-overlay=""');
    expect(sheetDrill).toContain('data-sheet-print=""');
    expect(sheetDrill).toContain('data-sheet-print-off=""');
  });
});

describe('the clipboard stylesheet (globals.css)', () => {
  it('the screen never shows the fittings (the base hide rule — a screen face never pretends to be a pen)', () => {
    expect(globals).toContain('[data-sheet-clipboard] [data-sheet-count-box],');
    expect(globals).toContain('[data-sheet-clipboard] [data-sheet-clipboard-note],');
    expect(globals).toContain('[data-sheet-clipboard] [data-sheet-clipboard-signatures] { display: none; }');
  });

  it('the paper shows them (the print block flips the display back)', () => {
    expect(globals).toContain('body.sheet-printing [data-sheet-clipboard] [data-sheet-clipboard-note] {\n    display: block !important;');
    expect(globals).toContain('body.sheet-printing [data-sheet-clipboard] [data-sheet-count-box] {\n    display: flex !important;');
    expect(globals).toContain('body.sheet-printing [data-sheet-clipboard] [data-sheet-clipboard-signatures] {\n    display: flex !important;');
  });

  it('the write-in spans the line on paper (a pen needs room)', () => {
    expect(globals).toContain('body.sheet-printing [data-sheet-clipboard] [data-sheet-count-box] > span:last-child {');
    const span = globals.split('[data-sheet-count-box] > span:last-child {')[1].split('}')[0];
    expect(span).toContain('flex: 1 1 auto !important;');
    expect(span).toContain('dashed');
  });

  it('paper hygiene: a line and its box never split across pages', () => {
    expect(globals).toContain('break-inside: avoid;');
    expect(globals).toContain('page-break-inside: avoid;');
    expect(globals).toContain('body.sheet-printing [data-sheet-print] [data-testid="sheet-drill-lines-list"] > li {');
  });

  it('the v2.226 PO paper and the v2.227 sheet paper stand untouched (three print faces, mutually exclusive by construction)', () => {
    expect(globals).toContain('body.po-printing * { visibility: hidden; }');
    expect(globals).toContain('body.sheet-printing * { visibility: hidden; }');
    expect(globals).toContain('body.po-printing [data-po-print-off] { display: none !important; }');
    expect(globals).toContain('body.sheet-printing [data-sheet-print-off] { display: none !important; }');
  });
});

// ── THE WHISPER SPEAKS ITS NAMES (wire + ledger) ─────────────────────────

describe('the whisper\u2019s wire (org/purchase-orders/route.ts)', () => {
  it('the cap is a named law of the wire (three — disclosed)', () => {
    expect(wire).toContain('const WATCHLIST_NAMES_CAP = 3;');
    expect(wire).toContain('entry.rows.length < WATCHLIST_NAMES_CAP');
  });

  it('the candidates query grew ONE cheap column (name) — catalog-bounded, not history-bounded', () => {
    expect(wire).toContain("select: { id: true, storeId: true, name: true, quantityInStock: true, reorderLevel: true },");
  });

  it('the hint carries speakers with the branch\u2019s own numbers (stock/level), never a second derivation', () => {
    expect(wire).toContain('entry.rows.push({');
    expect(wire).toContain('stock: Number(p?.quantityInStock ?? 0),');
    expect(wire).toContain('level: Number(p?.reorderLevel ?? 0),');
  });

  it('the response carries the count AND the speakers (zero answers an empty array — absence stays absent)', () => {
    expect(wire).toContain('watchlistHints: result.hints.get(`${po.store.id}:${po.supplier.id}`)?.count ?? 0,');
    expect(wire).toContain('watchlist: result.hints.get(`${po.store.id}:${po.supplier.id}`)?.rows ?? [],');
  });

  it('the stitch still rides inside runWithoutTenant (the v2.57.0 leak class never shrinks an org read)', () => {
    expect(wire).toContain('const result = await runWithoutTenant(async () => {');
    expect(wire.indexOf('runWithoutTenant')).toBeLessThan(wire.indexOf('rawDb.product.findMany'));
  });
});

describe('the whisper\u2019s door (po-ledger.tsx)', () => {
  it('the trigger lives OUTSIDE the drill button (a door inside a door is a lie the DOM refuses)', () => {
    const rowBlock = ledger.split('data-testid="po-ledger-row"')[1].split('data-testid="po-ledger-cap-note"')[0];
    const openDoor = rowBlock.indexOf('data-testid={`po-ledger-open-${po.id}`}');
    const openDoorClose = rowBlock.indexOf('</button>', openDoor);
    const whisper = rowBlock.indexOf('data-testid="po-ledger-watchlist-hint"');
    expect(openDoor).toBeGreaterThanOrEqual(0);
    expect(whisper).toBeGreaterThan(openDoorClose);
  });

  it('the whisper is a Radix popover (portal to the body — the scroll list never clips it)', () => {
    expect(ledger).toContain('import { Popover, PopoverContent, PopoverTrigger } from \'@/components/ui/popover\';');
    expect(ledger).toContain('<Popover>');
    expect(ledger).toContain('<PopoverTrigger');
    expect(ledger).toContain('<PopoverContent');
  });

  it('zero stays silent: no hints, no trigger (absence stays absent, never a padded chip)', () => {
    expect(ledger).toContain('{po.watchlistHints > 0 && (');
    const whisperBlock = ledger.split('{po.watchlistHints > 0 && (')[1].split(')}\n                </li>')[0];
    expect(whisperBlock).toContain('<Popover>');
  });

  it('the popover lists the speakers with the branch\u2019s numbers, read-only', () => {
    expect(ledger).toContain('data-testid="po-ledger-watchlist-popover"');
    expect(ledger).toContain('data-testid="po-ledger-watchlist-speaker"');
    expect(ledger).toContain('{num(w.stock)} on shelf / {num(w.level)} floor');
    expect(ledger).toContain('role="dialog"');
  });

  it('the cap is disclosed (the whisper names three, the branch holds the rest)', () => {
    expect(ledger).toContain('{po.watchlistHints > po.watchlist.length && (');
    expect(ledger).toContain("more on the branch&apos;s own watchlist face — the whisper names three.");
  });

  it('the law rides the footer (supplier of record = the most recent PO that carried the row)', () => {
    expect(ledger).toContain('supplier of record = the most recent PO that carried the row — the branch&apos;s own derivation, read from up here.');
  });

  it('the amber family on the door and the card (3:1 both halves, dark halves from birth)', () => {
    const trigger = ledger.split('<PopoverTrigger')[1].split('</PopoverTrigger>')[0];
    expect(trigger).toContain('bg-amber-50');
    expect(trigger).toContain('text-amber-700');
    expect(trigger).toContain('dark:bg-amber-500/10');
    expect(trigger).toContain('dark:text-amber-300');
    expect(trigger).toContain('focus:ring-amber-500/40');
    const card = ledger.split('<PopoverContent')[1].split('</PopoverContent>')[0];
    expect(card).toContain('border-amber-200');
    expect(card).toContain('bg-amber-50');
    expect(card).toContain('dark:bg-slate-900');
    expect(card).toContain('dark:text-amber-200');
  });

  it('the roster CSV keeps its seven columns (the whisper is a live chip, not a row of the file)', () => {
    expect(ledger).toContain("const header = 'po_number,status,supplier,branch,lines,ordered_day,total_kes';");
  });

  it('the door button keeps its testid and its drill (the row\u2019s only navigation)', () => {
    expect(ledger).toContain('data-testid={`po-ledger-open-${po.id}`}');
    expect(ledger).toContain('setDrill({ id: po.id, poNumber: po.poNumber, status: po.status })');
  });
});
