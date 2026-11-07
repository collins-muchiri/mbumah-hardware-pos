// THE CENSUS'S DOOR SUITE (v2.430.0) — THE ARC'S ELEVENTH WORD: the
// blocks answer the shelf, maker by maker.
//
//   - the blocks read (orderSupplierBlocks): the census's own grouping,
//     pure — rows group by their trimmed maker, sorted by name, the
//     units summed over the gaps; an unnamed row never invents a block
//     (the honest absence — the whole-order send already carries it),
//     and a block whose whole ask is zero is refused (the
//     nothing-to-order law, per block).
//   - the census agreement: the door's blocks and the chip's number
//     can never disagree (every counted supplier has at least one
//     asking row — the two reads share the same rows).
//   - the faces: the census chip becomes the door (the trigger wears
//     the v2.421 census bytes + the chevron), one item per block (the
//     per-block census in the item's tail), each press folding ONLY
//     that maker's rows into the same pocket (buildOrderHandoff over
//     block.rows, the one-way write, the walk, the receipt naming the
//     maker), and the whole-order Send keeps its own face beside the
//     door.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) —
// the house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { orderSupplierBlocks } from '@/lib/order-handoff';
import { restockSupplierCount } from '@/lib/stock-order';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const LIB = 'src/lib/order-handoff.ts';
const TAB = 'src/app/(shell)/tabs/inventory-tab.tsx';
const libSrc = read(LIB);
const tabSrc = read(TAB);

const ROW = (over: Partial<{ sku: string; name: string; onHand: number; reorderLevel: number; supplierName: string | null }> = {}) => ({
  sku: 'SKU-1',
  name: 'Cement',
  onHand: 2,
  reorderLevel: 12,
  supplierName: 'Alpha Cement' as string | null | undefined,
  ...over,
});

describe('the blocks\u2019 read (v2.430.0) \u2014 the census\u2019s own grouping', () => {
  it('the mixed world groups by maker \u2014 sorted by name, units summed over the gaps', () => {
    const blocks = orderSupplierBlocks([
      ROW({ sku: 'S1', supplierName: 'Zed Supplies', onHand: 0, reorderLevel: 10 }),
      ROW({ sku: 'S2', supplierName: 'Alpha Cement', onHand: 2, reorderLevel: 12 }),
      ROW({ sku: 'S3', supplierName: 'Alpha Cement', onHand: 5, reorderLevel: 9 }),
      ROW({ sku: 'S4', supplierName: 'Zed Supplies', onHand: 1, reorderLevel: 6 }),
    ]);
    expect(blocks.map((b) => b.name)).toEqual(['Alpha Cement', 'Zed Supplies']);
    expect(blocks[0].lines).toBe(2);
    expect(blocks[0].units).toBe(14);
    expect(blocks[1].lines).toBe(2);
    expect(blocks[1].units).toBe(15);
  });

  it('THE HONEST ABSENCE \u2014 an unnamed row never invents a block', () => {
    const blocks = orderSupplierBlocks([
      ROW({ sku: 'S1', supplierName: null }),
      ROW({ sku: 'S2', supplierName: undefined }),
      ROW({ sku: 'S3', supplierName: '' }),
    ]);
    expect(blocks).toEqual([]);
  });

  it('THE TRIM LAW \u2014 a whitespace name is no name, a padded name groups by its trimmed word', () => {
    const blocks = orderSupplierBlocks([
      ROW({ sku: 'S1', supplierName: '   ' }),
      ROW({ sku: 'S2', supplierName: '  Alpha Cement  ' }),
      ROW({ sku: 'S3', supplierName: 'Alpha Cement' }),
    ]);
    expect(blocks.length).toBe(1);
    expect(blocks[0].name).toBe('Alpha Cement');
    expect(blocks[0].lines).toBe(2);
  });

  it('THE NOTHING-TO-ORDER LAW, PER BLOCK \u2014 a block whose whole ask is zero is refused', () => {
    const blocks = orderSupplierBlocks([
      ROW({ sku: 'S1', supplierName: 'Full Shelf', onHand: 10, reorderLevel: 10 }),
      ROW({ sku: 'S2', supplierName: 'Full Shelf', onHand: 20, reorderLevel: 15 }),
      ROW({ sku: 'S3', supplierName: 'Alpha Cement' }),
    ]);
    expect(blocks.map((b) => b.name)).toEqual(['Alpha Cement']);
  });

  it('THE CENSUS AGREEMENT \u2014 the door\u2019s blocks and the chip\u2019s number can never disagree', () => {
    const rows = [
      ROW({ sku: 'S1', supplierName: 'Zed Supplies', onHand: 0, reorderLevel: 10 }),
      ROW({ sku: 'S2', supplierName: 'Alpha Cement', onHand: 2, reorderLevel: 12 }),
      ROW({ sku: 'S3', supplierName: null }),
    ];
    expect(orderSupplierBlocks(rows).length).toBe(restockSupplierCount(rows));
  });
});

describe('the faces (v2.430.0) \u2014 the chip opens, pinned to the source', () => {
  it('the lib\u2019s one home \u2014 the blocks read lives in order-handoff', () => {
    expect(libSrc).toContain("THE CENSUS'S DOOR");
    expect(libSrc).toContain('export interface OrderSupplierBlock {');
    expect(libSrc).toContain('export function orderSupplierBlocks(');
    expect(libSrc).toContain('.filter((b) => b.units > 0);');
  });

  it('the tab reads the ONE home \u2014 the widened import and the blocks computation', () => {
    expect(tabSrc).toContain(
      "import { buildOrderHandoff, orderHandoffSupplier, orderSupplierBlocks, writeOrderHandoff, type OrderSupplierBlock } from '@/lib/order-handoff';"
    );
    expect(tabSrc).toContain('const supplierBlocks = orderSupplierBlocks(orderRows);');
  });

  it('the trigger wears the census\u2019s own bytes \u2014 the v2.421 words, the chevron the door\u2019s one new word', () => {
    expect(tabSrc).toContain('data-testid="inv-order-suppliers"');
    expect(tabSrc).toContain("via {orderSupplierCount} supplier{orderSupplierCount === 1 ? '' : 's'}");
    expect(tabSrc).toContain('<ChevronDown className="h-2.5 w-2.5" aria-hidden="true" />');
    expect(tabSrc).toContain('restockSupplierCount(orderRows)');
  });

  it('the item speaks the block \u2014 the maker, the per-block census in the tail', () => {
    expect(tabSrc).toContain('data-testid="inv-order-supplier-block"');
    expect(tabSrc).toContain("{block.lines} line{block.lines === 1 ? '' : 's'} · {block.units} unit{block.units === 1 ? '' : 's'}");
  });

  it('THE BLOCK\u2019S OWN FOLD \u2014 only that maker\u2019s rows ride, the same pocket, the same walk, the receipt naming the maker', () => {
    expect(tabSrc).toContain('buildOrderHandoff(currentStoreId, orderStoreName, new Date(), block.rows)');
    expect(tabSrc).toContain('writeOrderHandoff(payload);');
    expect(tabSrc).toContain("setActiveTab('purchase-orders');");
    expect(tabSrc).toContain('carried for ${block.name}.`);');
  });

  it('THE HONEST PAIR \u2014 the whole-order Send keeps its own face beside the door', () => {
    expect(tabSrc).toContain('data-testid="inv-order-send"');
  });

  it('the door is Radix\u2019s own \u2014 the dropdown imports ride (the trigger reads the pointerdown)', () => {
    expect(tabSrc).toContain(
      "import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';"
    );
  });
});
