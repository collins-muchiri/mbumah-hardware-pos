#!/usr/bin/env node
// verify-v2-223-0.mjs — the v2.223.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE
// ASSIGNMENT LAW (one pure function — hand first while active, own
// hint second, effective supplier last; grouping memo and row render
// speak one arithmetic), THE HAND MOVES (differences-only record,
// cleared by scope flip and Draft another, derived-place reset deletes),
// THE GROWN AVAILABILITY (2+ active suppliers keep the toggle alive on
// a flattened cut; one-group split speaks its truth; multi-group notes
// verbatim), THE AFFORDANCE (split-mode only, violet chip, back-on-hint
// reset, divider census, moves note + parked note, clear-all named),
// THE WALK'S RECEIPTS (movedInGroup, "N lines moved by hand." in the
// notes), THE VOID JOINS THE CHAIN (auditTrail VOID/STOCK_TAKE, the
// zero law in the body, reason verbatim, best-effort catch), THE LINE
// FINDER (client-side needle over held lines, N-of-M honest, empty face
// names the needle, per-sheet key), and the release face: package.json /
// VERSION / whats-new / CHANGELOG all speak 2.223.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const dialog = read('src/components/org/restock-dialog.tsx');
const cancelRoute = read('src/app/api/stock-takes/[id]/cancel/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const map = read('src/components/org/variance-map.tsx');
const test = read('src/tests/restock-hand-v2223.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.223.0', pkg.mbumah.releaseVersion === '2.223.0');
ok('package.json baseVersion 2.223.0', pkg.mbumah.baseVersion === '2.223.0');
ok('package.json version 2.223.0', pkg.version === '2.223.0');
ok('VERSION 2.223.0', version === '2.223.0');
ok('whats-new entry at the head', whatsNew.includes("version: '2.223.0',") && whatsNew.indexOf("version: '2.223.0',") < whatsNew.indexOf("version: '2.222.0',"));
ok('whats-new title speaks the hand move', whatsNew.includes("title: 'The hand move',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.223.0]') >= 0 && changelog.indexOf('## [2.223.0]') < changelog.indexOf('## [2.222.0]'));

console.log('— the assignment law —');
ok('HandMoves type + the four-argument pure function', dialog.includes('type HandMoves = Record<string, string>;') && dialog.includes('function assignedSupplier(item: RestockItem, moves: HandMoves, suppliers: SupplierRow[], fallbackId: string): string {'));
ok('the HAND leads while the supplier is active (stale falls through)', dialog.includes('if (move && suppliers.some((s) => s.id === move)) return move;'));
ok('the hint follows — the v2.221 law, one home', dialog.includes('if (item.lastSupplierId && suppliers.some((s) => s.id === item.lastSupplierId)) return item.lastSupplierId;'));
ok('the effective supplier catches the hint-less', dialog.includes('return fallbackId;'));
ok('grouping memo rides the same function (no fork)', dialog.includes('const sid = assignedSupplier(item, moves, suppliers, effectiveSupplierId);'));
ok('row render rides the same function (no fork)', dialog.includes('<Select value={assignedSupplier(item, moves, suppliers, effectiveSupplierId)} onValueChange={(v) => onMoveChange(item, v)}>'));
ok('the moves state exists (differences-only record)', dialog.includes('const [moves, setMoves] = useState<HandMoves>({});'));
ok('scope flip clears the moves (a different list is a different draft)', /flipScope = \(next: 'named' \| 'full'\) => \{\s*\n\s*if \(next === mode\) return;\s*\n\s*setMode\(next\);\s*\n\s*setLines\(\{\}\);\s*\n\s*setMoves\(\{\}\);/.test(dialog));
ok('Draft another clears the moves too', /data-testid="restock-again"[\s\S]{0,900}setMoves\(\{\}\);/.test(dialog));
ok('derived-place reset DELETES the move (re-derivation, never re-write)', dialog.includes('const derived = assignedSupplier(item, {}, suppliers, effectiveSupplierId);') && dialog.includes('if (v === derived) {'));
ok('clearMove deletes by id', dialog.includes('const clearMove = (id: string) =>'));
ok('clearAllMoves empties the record', dialog.includes('const clearAllMoves = () => setMoves({});'));

console.log('— the grown availability —');
ok('the toggle shows for 2+ active suppliers on a flattened cut', dialog.includes('const splitAvailable = supplierGroups.length > 1 || suppliers.length > 1;'));
ok('splitOn stays the derived conjunction', dialog.includes('const splitOn = splitMode && splitAvailable;'));
ok('the one-group split note (split, one group)', dialog.includes("'the hints name one supplier — the rows carry the move affordance; move lines by hand to cut the draft.'"));
ok('the one-group note (at rest)', dialog.includes("'one supplier on the hints — turn the split on and move lines by hand to cut it.'"));
ok('the multi-group notes survive verbatim', dialog.includes('the ledger\u2019s hints name ${supplierGroups.length} suppliers — one draft each; your chosen supplier covers the hint-less lines.') && dialog.includes('this draft\u2019s hints span ${supplierGroups.length} suppliers — the split raises one PO each, every line where its own ledger points.'));
ok('the hand census is derived', dialog.includes('const movedCount = useMemo('));

console.log('— the affordance —');
ok('ships-via select per row, testid per SKU', dialog.includes('data-testid={`restock-move-select-${item.sku}`}'));
ok('labeled for the ear', dialog.includes('aria-label={`Supplier for ${item.name}`}'));
ok('SPLIT MODE ONLY (the one-PO promise holds)', /\{splitOn && \(\s*\n\s*\/\* v2\.223\.0: THE HAND MOVE/.test(dialog));
ok('the moved chip wears violet', dialog.includes('data-testid={`restock-moved-chip-${item.sku}`}') && /moved by hand\s*<\/span>/.test(dialog) && dialog.includes('bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30'));
ok('the way back exists, labeled', dialog.includes('data-testid={`restock-move-reset-${item.sku}`}') && dialog.includes('aria-label={`Put ${item.name} back on its ledger hint`}'));
ok('the divider owns the census', dialog.includes('data-testid={`restock-group-moved-${group.supplierId}`}') && dialog.includes('{group.movedRows} moved by hand'));
ok('the moves note discloses', dialog.includes('data-testid="restock-moves-note"') && dialog.includes('moved by hand — the cut is yours; a row’s “back on its hint” puts it where the ledger pointed.'));
ok('the parked note discloses (split off, moves kept)', dialog.includes('data-testid="restock-moves-parked"') && dialog.includes('parked — they speak again when the split returns.'));
ok('the clear-all names its count', dialog.includes('data-testid="restock-moves-clear"') && dialog.includes('clear all moves ({movedCount})'));

console.log('— the walk\u2019s receipts —');
ok('the walk counts its moved rows per group', dialog.includes('const movedInGroup = splitOn'));
ok('the notes name the hand\u2019s work', dialog.includes("moved by hand.` : ''}") && dialog.includes('${movedInGroup === 1 ? \'line\' : \'lines\'} moved by hand.'));

console.log('— the void joins the chain —');
ok('auditTrail VOID event for the sheet', cancelRoute.includes("action: 'VOID',") && cancelRoute.includes("resourceType: 'STOCK_TAKE',") && cancelRoute.includes("const { auditTrail } = await import('@/lib/audit-trail');"));
ok('the zero law rides in the event body', cancelRoute.includes("oldValues: { status: 'COUNTING' },") && cancelRoute.includes("newValues: { status: 'CANCELLED', stockMoved: 0, movements: 0 },"));
ok('the canceller + reason on the record', cancelRoute.includes('actorId: session.userId,') && cancelRoute.includes('actorRole: session.role,') && cancelRoute.includes("reason: reason ?? 'no reason given',"));
ok('best-effort by law (the chain never blocks the void)', cancelRoute.includes('} catch {\n    /* the chain must never block the void */\n  }'));
ok('the sheet select carries storeId (the event names whose floor)', cancelRoute.includes('select: { id: true, status: true, notes: true, storeId: true }'));

console.log('— the line finder —');
ok('the needle exists, labeled, placeholder honest', drill.includes('const [needle, setNeedle] = useState(\'\');') && drill.includes('data-testid="sheet-drill-finder"') && drill.includes('aria-label="Find a line by name or SKU"'));
ok('the needle filters name OR SKU, case-insensitive', drill.includes('data.lines.filter((l) => l.name.toLowerCase().includes(cleanNeedle) || l.sku.toLowerCase().includes(cleanNeedle))'));
ok('the count is honest — N of M', drill.includes('data-testid="sheet-drill-finder-count"') && drill.includes('{num(shownLines.length)} of {num(data.lines.length)}'));
ok('the empty face names the needle and the truth', drill.includes('data-testid="sheet-drill-finder-empty"') && drill.includes('no line answers “{needle.trim()}” — the sheet holds {num(data.lines.length)}'));
ok('the clear (×) exists, labeled', drill.includes('data-testid="sheet-drill-finder-clear"') && drill.includes('aria-label="Clear the line finder"'));
ok('the map keys the drill per sheet (fresh door, empty needle)', map.includes('{drill && <SheetDrill key={drill.id} target={drill} onClose={() => setDrill(null)} />}'));

console.log('— the styling details —');
ok('the violet family on the moved chip (3:1)', dialog.includes('bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30'));
ok('the move row rides a dashed hairline', dialog.includes('border-t border-dashed border-slate-200 pt-1.5 dark:border-slate-700'));
ok('the reset link: dotted underline, solid on hover', dialog.includes('underline decoration-dotted underline-offset-2') && dialog.includes('hover:decoration-solid'));
ok('the finder focus ring + the glass inside the field', drill.includes('focus:ring-1 focus:ring-amber-500/40') && drill.includes('pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2'));
ok('the clear-all wears the violet ring', dialog.includes('text-violet-700 ring-1 ring-violet-200 transition-colors hover:bg-violet-50 dark:text-violet-300 dark:ring-violet-500/30 dark:hover:bg-violet-500/10'));

console.log('— the round\u2019s test file —');
ok('the round test reads every face it pins', test.includes("const cancelRoute = read('src/app/api/stock-takes/[id]/cancel/route.ts');") && test.includes("const drill = read('src/components/org/sheet-drill.tsx');") && test.includes("const varianceMap = read('src/components/org/variance-map.tsx');"));

console.log(`\nverify-v2-223-0: ${pass} passed, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
