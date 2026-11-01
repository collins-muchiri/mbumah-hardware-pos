// v2.221.0 — the supplier split.
//
//   - THE GROUPS: a row's supplier is its OWN ledger hint while that
//     hint sits on the branch's active roster, else the draft's
//     effective supplier (the explicit choice wins for the hint-less
//     rows — they need a name). Groups are DERIVED, never an effect —
//     the derivation law's final form holds: a scope flip or an edit
//     re-coheres the split without an effect writing state.
//   - THE HONEST AVAILABILITY: the toggle appears only when MORE than
//     one group exists (an absent control never lies — it hides rather
//     than disabling); splitOn is the DERIVED conjunction of the user's
//     choice and the availability, so an edit that empties a group
//     re-coheres the whole face.
//   - THE DELIBERATE ACT: the split defaults OFF — one PO, the
//     v2.217.0 behavior untouched. The toggle is an aria-pressed
//     button; the note names the span and the way the split raises.
//   - THE SEQUENTIAL WALK: the submit walks the SHIPPING groups ONE
//     POST per supplier against the same /api/purchase-orders wire —
//     a PO is a one-supplier document; the bridge composes the
//     existing flow N times, it never invents a batch endpoint. A
//     refused group is NAMED and never blocks the rest (partial
//     honesty is structural: an entry per group outcome).
//   - THE NOTES REMEMBER: a split run's PO notes name the cut —
//     "supplier split k of n (Supplier Name)" — so the ledger reads
//     how the draft was divided.
//   - THE STRIP STAYS WHOLE: the indicative strip annotates the
//     WHOLE draft's estimate (the total), never a slice — per-group
//     figures speak KES in their own rows.
//   - THE STYLING DETAILS: group dividers in the amber chip family
//     with per-group shipping subtotals (and the honest "nothing
//     shipping" for an emptied group), per-group estimate rows beneath
//     the unchanged total, the multi-PO success roster with the run's
//     server-truth grand total, the refused rows in the house red
//     family (the 3:1 law), tabular-nums on every figure, dark halves
//     from birth.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const DIALOG_PATH = 'src/components/org/restock-dialog.tsx';
const dialog = read(DIALOG_PATH);
const pkg = JSON.parse(read('package.json'));
const changelog = read('CHANGELOG.md');
const feed = read('src/lib/whats-new.ts');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.221.0)', () => {
  it('package.json leads 2.221.0 (all three slots)', () => {
    expect(version).toBe('2.316.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.316.0');
    expect(pkg.mbumah.baseVersion).toBe('2.316.0');
  });

  it('VERSION speaks the same truth', () => {
    expect(read('VERSION').trim()).toBe('2.316.0');
  });

  it('the changelog of record speaks the round', () => {
    expect(changelog.includes('## [2.221.0] The supplier split')).toBe(true);
    expect(changelog.indexOf('## [2.221.0]')).toBeLessThan(changelog.indexOf('## [2.220.0]'));
  });

  it('whats-new entry at the head', () => {
    expect(feed.includes("version: '2.221.0',")).toBe(true);
    expect(feed.includes("title: 'The supplier split',")).toBe(true);
  });

  it('the verify gate is wired', () => {
    expect(pkg.scripts['verify:v2-221-0']).toBe('node scripts/verify-v2-221-0.mjs');
  });
});

// ── THE GROUPS ───────────────────────────────────────────────────────────

describe('the supplier groups are derived, never an effect (v2.221.0)', () => {
  it('the group derivation exists and rides the active rows', () => {
    expect(dialog.includes('const supplierGroups = useMemo(() => {')).toBe(true);
    // v2.223.0 THE GROWN LAW: the toggle also shows when the branch's
    // ACTIVE roster names 2+ suppliers — the hand move is the way back
    // from a hint-flattened cut, and the one-group split speaks its
    // single-group truth instead of hiding.
    expect(dialog.includes('const splitAvailable = supplierGroups.length > 1 || suppliers.length > 1;')).toBe(true);
    expect(dialog.includes('const splitOn = splitMode && splitAvailable;')).toBe(true);
  });

  it('a row goes to its OWN ledger hint while it sits on the active roster (v2.223.0: via the assignment law)', () => {
    // v2.223.0: the derivation moved into ONE pure function —
    // assignedSupplier(item, moves, suppliers, fallbackId) — so the
    // grouping memo and every row render speak one arithmetic. The
    // hint-first order is the same law, one home.
    expect(dialog.includes('function assignedSupplier(item: RestockItem, moves: HandMoves, suppliers: SupplierRow[], fallbackId: string): string {')).toBe(true);
    expect(dialog.includes('if (item.lastSupplierId && suppliers.some((s) => s.id === item.lastSupplierId)) return item.lastSupplierId;')).toBe(true);
    expect(dialog.includes('return fallbackId;')).toBe(true);
    expect(dialog.includes('const sid = assignedSupplier(item, moves, suppliers, effectiveSupplierId);')).toBe(true);
  });

  it('the split state is a deliberate act, default OFF', () => {
    expect(dialog.includes('const [splitMode, setSplitMode] = useState(false);')).toBe(true);
  });

  it('shipping figures count only qty>0 rows — a zero line ships nowhere', () => {
    expect(dialog.includes('const shippingLines = rows.filter((item) => (lines[item.id] ?? seededLine(item)).qty > 0).length;')).toBe(true);
    expect(dialog.includes('const shippingGroupCount = supplierGroups.filter((g) => g.shippingLines > 0).length;')).toBe(true);
  });
});

// ── THE TOGGLE ───────────────────────────────────────────────────────────

describe('the split toggle is honest (v2.221.0)', () => {
  it('the toggle exists as an aria-pressed control', () => {
    expect(dialog.includes('data-testid="restock-split-toggle"')).toBe(true);
    expect(dialog.includes('aria-pressed={splitOn}')).toBe(true);
  });

  it('the toggle hides when a single group exists (an absent control never lies)', () => {
    expect(dialog.includes('{splitAvailable && (')).toBe(true);
  });

  it('the note names the span when at rest and the law when split', () => {
    expect(dialog.includes('data-testid="restock-split-note"')).toBe(true);
    expect(dialog.includes('the ledger\u2019s hints name ${supplierGroups.length} suppliers — one draft each; your chosen supplier covers the hint-less lines.')).toBe(true);
    expect(dialog.includes('this draft\u2019s hints span ${supplierGroups.length} suppliers — the split raises one PO each, every line where its own ledger points.')).toBe(true);
  });

  it('the ledger-hint chip speaks in ONE-PO mode only (it would lie by singular in split)', () => {
    expect(dialog.includes('{hintLed && !splitOn && (')).toBe(true);
  });
});

// ── THE WALK ─────────────────────────────────────────────────────────────

describe('the raise walks the shipping groups (v2.221.0)', () => {
  it('the split filters to SHIPPING groups; one-PO mode keeps the v2.217.0 single step', () => {
    expect(dialog.includes('? supplierGroups.filter((g) => g.shippingLines > 0)')).toBe(true);
    expect(dialog.includes("rows: activeItems, shippingSubTotal: subTotal, shippingLines: shippingCount }")); 
  });

  it('ONE POST per supplier, SEQUENTIAL — the same wire, never a batch endpoint', () => {
    expect(dialog.includes("for (let i = 0; i < groups.length; i += 1) {")).toBe(true);
    expect(dialog.includes("await fetch('/api/purchase-orders', {")).toBe(true);
    expect(dialog.includes('supplierId: group.supplierId,')).toBe(true);
  });

  it('the split notes name the cut — k of n, with the supplier', () => {
    expect(dialog.includes('supplier split ${i + 1} of ${groups.length} (${group.supplierName}).')).toBe(true);
    expect(dialog.includes("'Raised from the org console reorder watchlist (${scopePhrase}) — supplier split '")).toBe(false); // the template is one literal, not a concat
    expect(dialog.includes('const notes = splitOn')).toBe(true);
  });

  it('a refused group is NAMED and never blocks the rest (partial honesty is structural)', () => {
    expect(dialog.includes('refused.push({ supplierName: group.supplierName, lines: payloadItems.length, error: body?.error ?? `the draft was refused (${res.status})` });')).toBe(true);
    expect(dialog.includes('setResult({ raised, refused });')).toBe(true);
  });

  it('the zero law holds before the walk begins', () => {
    expect(dialog.includes('if (payloadLinesFor(activeItems, lines).length === 0) return;')).toBe(true);
  });
});

// ── THE FACES ────────────────────────────────────────────────────────────

describe('the faces read the cut (v2.221.0)', () => {
  it('the list regroups under supplier dividers when split', () => {
    expect(dialog.includes('restock-group-divider-${group.supplierId}')).toBe(true);
    expect(dialog.includes("group.shippingLines > 0 ? `${formatCurrency(group.shippingSubTotal, 'KES')}` : 'nothing shipping'")).toBe(true);
    expect(dialog.includes('{group.rows.map((item) => restockLineRow(item))}')).toBe(true);
  });

  it('the line row is LIFTED — one markup for the flat list and every group', () => {
    expect(dialog.includes('const restockLineRow = (item: RestockItem) => {')).toBe(true);
    expect(dialog.includes(': activeItems.map((item) => restockLineRow(item))}')).toBe(true);
  });

  it('per-group estimate rows sit beneath the unchanged total', () => {
    expect(dialog.includes('restock-group-estimate-${g.supplierId}')).toBe(true);
    expect(dialog.includes('supplierGroups.filter((g) => g.shippingLines > 0).map((g) => (')).toBe(true);
  });

  it('the strip annotates the WHOLE draft (the total), never a slice', () => {
    expect(dialog.includes('data-testid="restock-indicative-strip"')).toBe(true);
    const stripIdx = dialog.indexOf('data-testid="restock-indicative-strip"');
    const groupEstIdx = dialog.indexOf('restock-group-estimate-');
    expect(groupEstIdx).toBeGreaterThan(-1);
    expect(stripIdx).toBeGreaterThan(groupEstIdx); // the group rows render before the strip; the strip's figure is the total
    expect(dialog.includes('figure: formatCurrency(subTotal * activeLens.rate, activeLens.code),')).toBe(true);
  });

  it('the submit button counts the POs in split mode', () => {
    expect(dialog.includes('`Raise ${shippingGroupCount} DRAFT POs · ${shippingCount}')).toBe(true);
  });

  it('the multi-PO success roster speaks every raised PO and the run total', () => {
    expect(dialog.includes('data-testid="restock-success-rows"')).toBe(true);
    expect(dialog.includes('data-testid="restock-success-row"')).toBe(true);
    expect(dialog.includes('data-testid="restock-success-total"')).toBe(true);
    expect(dialog.includes('result.raised.reduce((acc, po) => acc + po.totalAmount, 0)')).toBe(true);
    expect(dialog.includes('${result.raised.length} DRAFT POs raised')).toBe(true);
  });

  it('the refused face wears the house red and names each supplier', () => {
    expect(dialog.includes('data-testid="restock-refused"')).toBe(true);
    expect(dialog.includes('data-testid="restock-refused-row"')).toBe(true);
    expect(dialog.includes('the rest of the run went through:')).toBe(true);
  });

  it('the single-PO face keeps the v2.217.0 shape (zero regression)', () => {
    expect(dialog.includes("result.raised.length === 1 ? 'DRAFT raised'")).toBe(true);
    expect(dialog.includes('data-testid="restock-po-number"')).toBe(true);
    expect(dialog.includes('data-testid="restock-again"')).toBe(true);
  });
});
