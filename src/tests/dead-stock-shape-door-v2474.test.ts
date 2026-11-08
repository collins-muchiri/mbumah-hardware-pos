// THE SHAPE ANSWERS TO THE LEDGER (v2.474.0): the dead-stock capital
// chart learns its presses, proven without a database.
//
//   • THE SHAPE'S PRESSES — the pie's legend rows and the bar chart's
//     bars become real handles (the optional onPress door): one press
//     rides the segment's own word to the caller; the dead-stock desk
//     hands it to the search lens, so the shape and the lens share one
//     vocabulary. OPTIONAL by law — the callers that pass no door get
//     byte-for-byte the chart that has always rendered.
//   • ONE VOCABULARY — the ONE home's lens answers the ledger's own
//     "Uncategorised" word (the word the chart already calls the unnamed
//     shelf), so the shape's press can never draw an empty answer.
//   • THE SHAPE'S OWN LAW — the chart keeps the WHOLE ledger's capital:
//     the shape reads the canonical rows (never the lensed view); a
//     press re-words the lens, never the picture.
//   • THE PRESSED FACE — the segment whose word the lens already holds
//     wears it (aria-pressed, the muted ground, the brighter bar).
//   • THE FEED — the head wears the round's own story and the union of
//     every living pin.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { filterDeadStockRows, type DeadStockRow } from '@/lib/reports/dead-stock';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/reports-tab.tsx';
const HOME = 'src/lib/reports/dead-stock.ts';

const desk = readFileSync(DESK, 'utf8');
const home = readFileSync(HOME, 'utf8');

function row(overrides: Partial<DeadStockRow> = {}): DeadStockRow {
  return {
    productId: 'p1',
    name: 'Sleeping Bag',
    sku: 'SLP-01',
    categoryName: 'Camping',
    quantityInStock: 40,
    costPrice: 1200,
    pricePerUnit: 1800,
    reorderLevel: 10,
    unitType: 'PIECE',
    capitalTied: 48000,
    lastSoldAt: '2025-07-12T09:30:00.000Z',
    daysIdle: 120,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. ONE VOCABULARY — the lens answers the shape's own word
// ---------------------------------------------------------------------------

describe('filterDeadStockRows — the shape\u2019s word answers', () => {
  const cement = row({ productId: 'a', name: 'Cement 32N', sku: 'CEM-01', categoryName: 'Building' });
  const hammer = row({ productId: 'b', name: 'Claw Hammer', sku: 'HMR-04', categoryName: 'Tools' });
  const orphan = row({ productId: 'd', name: 'Anvil', sku: 'ANV-9', categoryName: null });

  it('the ledger\u2019s own Uncategorised word ANSWERS — the unnamed shelf speaks', () => {
    expect(filterDeadStockRows([cement, hammer, orphan], 'uncategorised').map((r) => r.productId)).toEqual(['d']);
  });

  it('the word answers in the case it is pressed and by its first syllable', () => {
    expect(filterDeadStockRows([orphan], 'Uncategorised').map((r) => r.productId)).toEqual(['d']);
    expect(filterDeadStockRows([orphan], 'UNCAT').map((r) => r.productId)).toEqual(['d']);
  });

  it('a named shelf never answers to the unnamed word', () => {
    expect(filterDeadStockRows([cement, hammer], 'uncategorised')).toEqual([]);
  });

  it('the lens still answers the words a row already carries — the growth took nothing', () => {
    expect(filterDeadStockRows([cement, hammer, orphan], 'cem').map((r) => r.productId)).toEqual(['a']);
    expect(filterDeadStockRows([cement, hammer, orphan], 'HMR').map((r) => r.productId)).toEqual(['b']);
    expect(filterDeadStockRows([cement, hammer, orphan], 'tools').map((r) => r.productId)).toEqual(['b']);
  });

  it('an empty lens still RESTS and the lens is still pure', () => {
    const input = [cement, hammer, orphan];
    const snapshot = JSON.stringify(input);
    const rested = filterDeadStockRows(input, '');
    expect(rested.map((r) => r.productId)).toEqual(['a', 'b', 'd']);
    expect(JSON.stringify(input)).toBe(snapshot);
    expect(rested).not.toBe(input);
  });

  it('the ONE home wears the shape\u2019s word in its own bytes', () => {
    expect(home.includes("(r.categoryName ?? 'Uncategorised').toLowerCase().includes(needle)")).toBe(true);
    // TWO homes for one word: the shape's label spoke it first
    // (capitalTiedByCategory's own Uncategorised ground, v2.462.0) and
    // the lens answers it now — the vocabulary was never a second
    // invention.
    expect((home.match(/categoryName \?\? '/g) ?? []).length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 2. THE SHAPE'S PRESSES — the optional door, the pressed face
// ---------------------------------------------------------------------------

describe('the shape\u2019s presses — the desk\u2019s own face', () => {
  it('the charts learned the optional door — onPress and pressedLabel in both signatures', () => {
    expect(desk.includes('function ConicPieChart({ segments, onPress, pressedLabel }: {')).toBe(true);
    expect(desk.includes('onPress?: (label: string) => void;')).toBe(true);
    expect(desk.includes('pressedLabel?: string;')).toBe(true);
    expect(desk.includes('function SVGBarChart({ data, height = 200, ariaLabel, onPress, pressedLabel }:')).toBe(true);
  });

  it('the dead-stock desk hands the charts the lens door — both calls ride the lens word', () => {
    expect((desk.match(/onPress=\{\(label\) => setDeadStockSearch\(label\)\}/g) ?? []).length).toBe(2);
    expect((desk.match(/pressedLabel=\{deadStockSearch\.trim\(\)\}/g) ?? []).length).toBe(2);
  });

  it('the pie\u2019s legend rows are real handles — the double voice, the pressed face', () => {
    expect(desk.includes('aria-pressed={pressed}')).toBe(true);
    expect(desk.includes('aria-label={`Lens the ledger to ${seg.name}`}')).toBe(true);
    expect(desk.includes("title={`Lens the ledger to ${seg.name} — the segment's own word rides the search lens`}")).toBe(true);
    expect(desk.includes('transition-colors hover:bg-muted/60')).toBe(true);
    expect(desk.includes("{pressed ? 'bg-muted' : ''}")).toBe(true);
    expect(desk.includes("{pressed ? 'font-semibold' : 'font-medium'}")).toBe(true);
  });

  it('the bar\u2019s own press — role button, keyboard-reachable, the brighter face', () => {
    expect(desk.includes("role: 'button' as const,")).toBe(true);
    expect(desk.includes('tabIndex: 0,')).toBe(true);
    expect(desk.includes("if (e.key === 'Enter' || e.key === ' ') onPress(d.label);")).toBe(true);
    expect(desk.includes("'aria-label': `Lens the ledger to ${d.label}`,",)).toBe(true);
    expect(desk.includes("'aria-pressed': pressedLabel === d.label,")).toBe(true);
    expect(desk.includes("pressedLabel === d.label ? 'brightness-125' : 'hover:brightness-110'")).toBe(true);
    expect(desk.includes("className: 'cursor-pointer',")).toBe(true);
  });

  it('THE OPTIONAL LAW — the callers without a door get the chart that always was', () => {
    expect(desk.includes('<ConicPieChart segments={pieSegments} />')).toBe(true);
    expect(desk.includes('if (!onPress) {')).toBe(true);
    expect(desk.includes('const pressProps = onPress')).toBe(true);
  });

  it('THE SHAPE\u2019S OWN LAW — the shape keeps the whole ledger\u2019s capital', () => {
    expect(desk.includes('const capitalByCategory = useMemo(() => capitalTiedByCategory(rows), [rows]);')).toBe(true);
    expect(desk.includes('const categorySegments = useMemo(')).toBe(true);
    expect((desk.match(/capitalTiedByCategory\(sortedRows\)/g) ?? []).length).toBe(0);
    expect((desk.match(/capitalTiedByCategory\(filterDeadStockRows/g) ?? []).length).toBe(0);
  });

  it('the elder faces keep their seats — the lens, the doors, the badge, the census at nine', () => {
    expect(desk.includes('data-testid="dead-stock-search"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-search-clear"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-lens-empty"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-lens-clear"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-sort-capital"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-sort-idle"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-copy-all"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-chart-pie"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-chart-bar"')).toBe(true);
    const section = desk.slice(desk.indexOf('function DeadStockSection'), desk.indexOf('// Main Reports Tab Component'));
    // v2.476.0 re-key (dated): the section grows its TENTH voice — the
    // chat door's Share all handle (the chorus's own reach-out, the
    // double voice every handle wears); the census speaks the section's
    // ten handles now, and the loom's pressed-voice law stands untouched.
    expect(section.split('aria-label=').length - 1).toBe(10);
  });

  it('the shape\u2019s voices live OUTSIDE the section slice — the shared charts keep their own bytes', () => {
    expect(desk.indexOf('function ConicPieChart')).toBeLessThan(desk.indexOf('function DeadStockSection'));
    expect(desk.indexOf('function SVGBarChart')).toBeLessThan(desk.indexOf('function DeadStockSection'));
    expect(desk.includes("aria-label={`Lens the ledger to ${seg.name}`}")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE FEED — the head wears the round's own story
// ---------------------------------------------------------------------------

describe('whats-new — the shape, pinned in the feed', () => {
  const head = WHATS_NEW.find((e) => e.version === '2.474.0');
  if (!head) throw new Error('the 2.474.0 entry is gone from the feed');

  it('the head wears the round\u2019s own story — the elder words and the new word', () => {
    expect(head.version).toBe('2.474.0');
    expect(head.title).toContain('resting ledger');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('the paper carries a scannable door');
    expect(head.title).toContain('the file sings the chorus whole');
    expect(head.title).toContain('the ledger answers to its own columns');
    expect(head.title).toContain('the ledger answers to its own name');
    expect(head.title).toContain('the shape answers to the ledger');
  });

  it('the bullets speak the shape\u2019s presses, the shared word and the family\u2019s standing set', () => {
    const text = head.bullets.join(' ');
    expect(text).toContain('shape');
    expect(text).toContain('press');
    expect(text).toContain('Uncategorised');
    expect(text).toContain('ONE home');
    expect(text).toContain('canonical rows');
    expect(text).toContain('search lens');
    expect(text).toContain('aria-pressed');
    expect(text).toContain('edit door');
    expect(text).toContain('pre-addressed');
    expect(text).toContain('clearance note');
    expect(text).toContain('chat picker');
    expect(text).toContain('share link');
    expect(text).toContain('clipboard');
    expect(text).toContain('copy all');
    expect(text).toContain('file');
    expect(text).toContain('share door');
    expect(text).toContain('wa.me');
    expect(text).toContain('clearance asks');
    expect(text).toContain('print button');
    expect(text).toContain('category');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
  });
});
