// THE ARC'S FIRST WORD SUITE (v2.420.0) — the shelf remembers its supplier.
//
//   - buildSupplierGroups: THE LENS'S ONE ARITHMETIC — products group by
//     their own supplierId, the honest absence ('none') is a REAL group
//     (named "No supplier yet" at render, never a guessed name), an
//     unhydrated supplier id still groups by its key (the id is the
//     truth; the name waits for the wire), and the sums read with THE
//     DECIMAL'S GRACE (v2.419.0's law carried: a string arrival can
//     never concat — the lib coerces before any plus or times).
//   - describeSupplierCensus: the strip's own census voice ("N suppliers
//     · M products placed · K waiting" — singular honest).
//   - the wires: the products wire rides the supplier face (id + name),
//     POST and PATCH both enforce THE SAME-STORE DOOR (a cross-store
//     assignment is refused, never guessed; '' clears honestly), the
//     suppliers wire answers productCount, and the migration carries the
//     FK the shape promises.
//   - the faces: the inventory strip, the row sub-lines and the suppliers
//     desk's chip all read their testids (source pins — the house rule).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import {
  buildSupplierGroups,
  describeSupplierCensus,
  NO_SUPPLIER_KEY,
  NO_SUPPLIER_LABEL,
  type SupplierGroupProduct,
} from '@/lib/product-groups';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const productsRouteSrc = read('src/app/api/products/route.ts');
const productRouteSrc = read('src/app/api/products/[id]/route.ts');
const suppliersRouteSrc = read('src/app/api/suppliers/route.ts');
const inventorySrc = read('src/app/(shell)/tabs/inventory-tab.tsx');
const suppliersTabSrc = read('src/app/(shell)/tabs/suppliers-tab.tsx');
const libSrc = read('src/lib/product-groups.ts');
const schemaSrc = read('prisma/schema.prisma');

const product = (
  id: string,
  supplierId: string | null,
  quantityInStock: number | string,
  pricePerUnit: number | string,
  supplierName?: string,
  costPrice?: number,
): SupplierGroupProduct => ({
  id,
  name: `Product ${id}`,
  supplierId,
  supplier: supplierId && supplierName ? { id: supplierId, name: supplierName } : null,
  quantityInStock,
  pricePerUnit,
  costPrice: costPrice ?? null,
});

const SUP_A = 'sup_a';
const SUP_B = 'sup_b';

/** The honest lookup: a missing group is a THROW (the test's own words),
 *  never a non-null assertion, never a silent undefined read. */
function groupOf(groups: readonly SupplierGroup[], key: string): SupplierGroup {
  const g = groups.find((x) => x.key === key);
  if (!g) throw new Error(`group ${key} missing from the strip`);
  return g;
}

describe('buildSupplierGroups (v2.420.0) — the lens\'s one arithmetic', () => {
  it('products group by their own supplierId under the supplier\'s name', () => {
    const groups = buildSupplierGroups([
      product('p1', SUP_A, 10, 100, 'Bamburi Cement Ltd'),
      product('p2', SUP_A, 5, 200, 'Bamburi Cement Ltd'),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe(SUP_A);
    expect(groups[0].supplierName).toBe('Bamburi Cement Ltd');
    expect(groups[0].productCount).toBe(2);
    expect(groups[0].totalUnits).toBe(15);
    expect(groups[0].shelfValue).toBe(2000); // 10×100 + 5×200
  });

  it('a product with no supplierId lands in the honest absence group, named by nothing', () => {
    const groups = buildSupplierGroups([product('p1', null, 3, 500)]);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe(NO_SUPPLIER_KEY);
    expect(groups[0].supplierName).toBeNull();
    expect(groups[0].productCount).toBe(1);
    expect(NO_SUPPLIER_LABEL).toBe('No supplier yet');
  });

  it('an unhydrated supplier id still groups by its key (the id is the truth)', () => {
    const groups = buildSupplierGroups([
      product('p1', SUP_A, 2, 50), // no nested supplier face — the wire stayed silent
      product('p2', SUP_A, 4, 75, 'Hydrated Name'),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe(SUP_A);
    // the hydrated name wins; the group never guesses a different one
    expect(groups[0].supplierName).toBe('Hydrated Name');
    expect(groups[0].productCount).toBe(2);
  });

  it('THE DECIMAL\'S GRACE: string arrivals read honest numbers — never a concat', () => {
    const groups = buildSupplierGroups([
      product('p1', SUP_A, '10', '100', 'Supplier A'), // Decimals riding as strings
      product('p2', SUP_A, '5', '200', 'Supplier A'),
    ]);
    expect(groups[0].totalUnits).toBe(15); // not '105' — the concat wound's own regression pin
    expect(groups[0].shelfValue).toBe(2000);
  });

  it('garbage reads zero, null cost is skipped (the shelf never lies)', () => {
    const groups = buildSupplierGroups([
      product('p1', SUP_A, 'not-a-number' as unknown as string, '100', 'Supplier A'),
      product('p2', SUP_B, 2, 50, 'Supplier B', 20),
    ]);
    const a = groupOf(groups, SUP_A);
    const b = groupOf(groups, SUP_B);
    expect(a.totalUnits).toBe(0);
    expect(a.shelfValue).toBe(0);
    expect(a.shelfCost).toBe(0);
    expect(b.shelfCost).toBe(40); // 2 × 20
    expect(b.shelfValue).toBe(100);
  });

  it('groups sort by productCount desc, then name asc; the absence waits LAST', () => {
    const groups = buildSupplierGroups([
      product('p1', null, 1, 10),
      product('p2', SUP_B, 1, 10, 'Zed Supplies'),
      product('p3', SUP_A, 1, 10, 'Alpha Cement'),
      product('p4', SUP_A, 1, 10, 'Alpha Cement'),
    ]);
    expect(groups.map((g) => g.key)).toEqual([SUP_A, SUP_B, NO_SUPPLIER_KEY]);
  });

  it('the sums round to cents (floating dust never rides the strip)', () => {
    const groups = buildSupplierGroups([
      product('p1', SUP_A, 3, 33.335, 'Supplier A'),
    ]);
    expect(groups[0].shelfValue).toBe(100.01); // 99.999... → 100.01? 3 × 33.335 = 100.005 → 100.01
  });

  it('the same supplierId with a MISMATCHED nested face still groups by the id', () => {
    const groups = buildSupplierGroups([
      { ...product('p1', SUP_A, 1, 10), supplier: { id: 'sup_other', name: 'A Liar' } },
    ]);
    // the id is the truth; a mismatched name is not adopted
    expect(groups[0].key).toBe(SUP_A);
    expect(groups[0].supplierName).toBeNull();
  });
});

describe('describeSupplierCensus (v2.420.0) — the strip\'s census voice', () => {
  it('speaks suppliers, placed and waiting — the singular honest', () => {
    const c = describeSupplierCensus([
      { key: SUP_A, supplierName: 'A', productCount: 2, totalUnits: 0, shelfValue: 0, shelfCost: 0 },
      { key: NO_SUPPLIER_KEY, supplierName: null, productCount: 1, totalUnits: 0, shelfValue: 0, shelfCost: 0 },
    ]);
    expect(c.supplierCount).toBe(1);
    expect(c.placedCount).toBe(2);
    expect(c.waitingCount).toBe(1);
    expect(c.voice).toBe('1 supplier · 2 products placed · 1 waiting');
  });

  it('an all-placed shelf speaks no waiting leg at all', () => {
    const c = describeSupplierCensus([
      { key: SUP_A, supplierName: 'A', productCount: 1, totalUnits: 0, shelfValue: 0, shelfCost: 0 },
    ]);
    expect(c.waitingCount).toBe(0);
    expect(c.voice).toBe('1 supplier · 1 product placed');
  });
});

describe('the wires (v2.420.0) — the supplier face and the same-store door', () => {
  it('the products list wire rides the supplier face (id + name)', () => {
    expect(productsRouteSrc).toContain('supplier: { select: { id: true, name: true } }');
  });

  it('the create wire answers the born-with face too', () => {
    expect(productsRouteSrc).toContain('supplierId?: string;');
    expect(productsRouteSrc).toContain('supplierId must name a supplier of the same store.');
    expect(productsRouteSrc).toContain('supplierId: normalizedSupplierId ?? null');
  });

  it('the PATCH wire allows supplierId and enforces the SAME-STORE door', () => {
    expect(productRouteSrc).toContain("'supplierId',");
    expect(productRouteSrc).toContain('supplierId must name a supplier of the same store.');
    // '' clears the assignment (the honest absence)
    expect(productRouteSrc).toContain('updateData.supplierId = null;');
  });

  it('the suppliers wire answers productCount (the arc\'s other end)', () => {
    expect(suppliersRouteSrc).toContain('products: true,');
    expect(suppliersRouteSrc).toContain('productCount: _count.products,');
  });

  it('the schema carries the product\'s supplier (field, relation, index, backrelation)', () => {
    expect(schemaSrc).toContain('supplierId         String?');
    expect(schemaSrc).toContain('supplier           Supplier?           @relation(fields: [supplierId], references: [id])');
    expect(schemaSrc).toContain('@@index([supplierId])');
    expect(schemaSrc).toContain('products       Product[]');
  });

  it('the migration exists and carries the FK the shape promises', () => {
    const migrationPath = 'prisma/migrations/20261107070000_add_product_supplier/migration.sql';
    expect(existsSync(join(process.cwd(), migrationPath))).toBe(true);
    const migrationSrc = read(migrationPath);
    expect(migrationSrc).toContain('ALTER TABLE "products" ADD COLUMN "supplierId" TEXT;');
    expect(migrationSrc).toContain('CREATE INDEX "products_supplierId_idx" ON "products"("supplierId");');
    expect(migrationSrc).toContain('products_supplierId_fkey');
    expect(migrationSrc).toContain('REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE');
  });

  it('the grouping lib is the ONE home (no second copy of the arithmetic)', () => {
    expect(libSrc).toContain('export function buildSupplierGroups');
    expect(inventorySrc).toContain("from '@/lib/product-groups'");
  });
});

describe('the faces (v2.420.0) — the strip, the rows and the suppliers desk', () => {
  it('the inventory desk grows the supplier lens strip (testids + honest absence)', () => {
    expect(inventorySrc).toContain('data-testid="inv-supplier-lens"');
    expect(inventorySrc).toContain('inv-supplier-lens-census');
    expect(inventorySrc).toContain('inv-supplier-lens-clear');
    expect(inventorySrc).toContain("`inv-supplier-card-${g.key}`");
    expect(inventorySrc).toContain('NO_SUPPLIER_LABEL');
  });

  it('the lens filters the table through the ONE home (no local re-count)', () => {
    expect(inventorySrc).toContain('buildSupplierGroups(allProducts)');
    expect(inventorySrc).toContain('supplierFilter === NO_SUPPLIER_KEY');
  });

  it('rows name their supplier with the quiet sky sub-line (absence stays silent)', () => {
    expect(inventorySrc).toContain('data-testid="inv-row-supplier"');
    expect(inventorySrc).toContain('via {product.supplier.name}');
  });

  it('both form faces carry the supplier select (born-with + edit)', () => {
    expect(inventorySrc).toContain('data-testid="new-product-supplier-select"');
    expect(inventorySrc).toContain('data-testid="edit-product-supplier-select"');
    expect(inventorySrc).toContain("supplierId: newProduct.supplierId || undefined");
  });

  it('the suppliers desk wears the products chip (sky when placed, muted at zero)', () => {
    expect(suppliersTabSrc).toContain('data-testid="sup-products-chip"');
    expect(suppliersTabSrc).toContain('<TableHead className="text-right">Products</TableHead>');
    expect(suppliersTabSrc).toContain("'Product Count'");
  });
});
