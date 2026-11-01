// ─────────────────────────────────────────────────────────────────────────────
// The catalog doors speak their body's shape (v2.336.0)
// ─────────────────────────────────────────────────────────────────────────────
//
// v2.335.0 walked the WIDER door class one family at a time (the financial
// family first). v2.336.0 is the SECOND pass: the CATALOG family — the
// eighteen doors that stock the shelves —
//
//   • products ×3, categories ×2, subcategories, vouchers + redeem,
//     voucher-campaigns, gift-cards ×5, etims ×3 stop reading their bodies
//     as the door's default `any` or the loose `<Record<string, unknown>>`
//     and speak the body's OWN shape;
//   • the CREATE doors name every field their handler consumes — `unknown`
//     only where the route itself coerces (sellingUnit/conversionFactor/
//     discountPercent via String()/Number()), and the zod-validated
//     gift-card fields flow through validation.data so the door only names
//     the FOUR RAW fields the schema does not own;
//   • the UPDATE doors name their directly-read fields while the
//     allowedFields loops keep the honest index signature;
//   • the two redeem doors (vouchers/redeem, gift-cards/redeem) borrow the
//     local RedeemBody/RedeemByCodeBody interfaces their handlers already
//     declared — the `as` re-casts are gone;
//   • vouchers/[id] already wore its own literal (untouched, pinned);
//   • categories/[id] and gift-cards/[id] graduated from the v2.326
//     loose-Record exemplar list (three remain);
//   • and the catalog desk's product cards grow THE SHELF METER — the
//     stock line's colour-stepped fill against twice the reorder level
//     (the styling face).
//
// RUNTIME BEHAVIOR of the tightened doors is byte-identical — types only
// (the scoped tsc round-trip proved 34=34, ZERO new, ZERO gone).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (p: string) => readFileSync(p, 'utf8');

const CATALOG_DOORS = [
  'src/app/api/products/route.ts',
  'src/app/api/products/[id]/route.ts',
  'src/app/api/products/bundles/route.ts',
  'src/app/api/categories/route.ts',
  'src/app/api/categories/[id]/route.ts',
  'src/app/api/subcategories/route.ts',
  'src/app/api/vouchers/route.ts',
  'src/app/api/vouchers/[id]/route.ts',
  'src/app/api/vouchers/redeem/route.ts',
  'src/app/api/voucher-campaigns/route.ts',
  'src/app/api/gift-cards/route.ts',
  'src/app/api/gift-cards/[id]/route.ts',
  'src/app/api/gift-cards/[id]/redeem/route.ts',
  'src/app/api/gift-cards/[id]/adjust/route.ts',
  'src/app/api/gift-cards/redeem/route.ts',
  'src/app/api/etims/register-product/route.ts',
  'src/app/api/etims/settings/route.ts',
  'src/app/api/etims/issue-invoice/route.ts',
];

describe('THE CATALOG DOORS SPEAK THEIR BODY SHAPE (v2.336.0 census)', () => {
  it('not one catalog door reads a loose Record generic any more', () => {
    const loose = CATALOG_DOORS.filter((f) =>
      read(f).includes('readJsonBody<Record<string, unknown>>(request)')
    );
    expect(loose).toEqual([]);
  });

  it('not one catalog door reads the door default any more (no bare readJsonBody(request))', () => {
    const bare = CATALOG_DOORS.filter((f) => /readJsonBody\(request\)/.test(read(f)));
    expect(bare).toEqual([]);
  });

  it('not one catalog door re-casts the body back to a named interface any more', () => {
    const recast = CATALOG_DOORS.filter((f) => /door\.body as [A-Z]/.test(read(f)));
    expect(recast).toEqual([]);
  });

  it('every catalog door marker survives the tightening', () => {
    for (const file of CATALOG_DOORS) {
      expect(read(file).includes('THE BODY DOOR: an unreadable body is a client mistake')).toBe(true);
    }
  });
});

describe('THE PER-FILE HONEST BYTES (create doors name their consumed fields)', () => {
  it('products CREATE speaks the seventeen-field wire shape (unknown only where it coerces)', () => {
    const src = read('src/app/api/products/route.ts');
    expect(src.includes('storeId?: string;')).toBe(true);
    expect(src.includes('sellingUnit?: unknown;')).toBe(true);
    expect(src.includes('conversionFactor?: unknown;')).toBe(true);
    expect(src.includes('quantityInStock?: number;')).toBe(true);
    expect(src.includes('pricePerUnit?: number;')).toBe(true);
    expect(src.includes('isRental?: boolean;')).toBe(true);
    expect(src.includes('imageUrl?: string;')).toBe(true);
  });

  it('bundles CREATE repeats the route\u2019s own map annotations (the element contract)', () => {
    const src = read('src/app/api/products/bundles/route.ts');
    expect(src.includes('items: Array<{ childProductId: string; quantityRequired: number }>;')).toBe(true);
    expect(src.includes('componentProducts: Array<{ productId: string; quantity: number }>;')).toBe(true);
    expect(src.includes('discountPercent?: unknown;')).toBe(true);
  });

  it('categories CREATE carries the null the auto-pick branch checks', () => {
    const src = read('src/app/api/categories/route.ts');
    expect(src.includes('sortOrder?: number | null;')).toBe(true);
    expect(src.includes('isActive?: boolean;')).toBe(true);
  });

  it('subcategories CREATE speaks the parent-first wire shape', () => {
    const src = read('src/app/api/subcategories/route.ts');
    expect(src.includes('categoryId?: string;')).toBe(true);
    expect(src.includes('sortOrder?: number;')).toBe(true);
  });

  it('vouchers CREATE names the fourteen fields the create handler consumes', () => {
    const src = read('src/app/api/vouchers/route.ts');
    expect(src.includes('voucherType?: string;')).toBe(true);
    expect(src.includes('maxDiscount?: number | null;')).toBe(true);
    expect(src.includes('maxUsesPerUser?: number;')).toBe(true);
    expect(src.includes('campaignId?: string;')).toBe(true);
  });

  it('voucher-campaigns CREATE speaks the campaign\u2019s own shape', () => {
    const src = read('src/app/api/voucher-campaigns/route.ts');
    expect(src.includes('campaignType?: string;')).toBe(true);
    expect(src.includes('budget?: number;')).toBe(true);
    expect(src.includes('targetAudience?: string;')).toBe(true);
  });
});

describe('THE PER-FILE HONEST BYTES (update doors name their directly-read fields)', () => {
  it('products UPDATE names sku beside barcode, the loop keeps the index signature', () => {
    const src = read('src/app/api/products/[id]/route.ts');
    expect(
      src.includes('readJsonBody<{ sku?: unknown; barcode?: string; [key: string]: unknown }>(request)')
    ).toBe(true);
  });

  it('categories UPDATE graduates from the loose Record to its six type-narrowed fields', () => {
    const src = read('src/app/api/categories/[id]/route.ts');
    expect(src.includes('name?: unknown;')).toBe(true);
    expect(src.includes('sortOrder?: unknown;')).toBe(true);
    expect(src.includes('isActive?: unknown;')).toBe(true);
    expect(src.includes('readJsonBody<Record<string, unknown>>(request)')).toBe(false);
  });

  it('gift-cards UPDATE names the toggle shortcut and the expiry clearing', () => {
    const src = read('src/app/api/gift-cards/[id]/route.ts');
    expect(
      src.includes('readJsonBody<{ toggleVisibility?: unknown; expiresAt?: unknown; [key: string]: unknown }>(request)')
    ).toBe(true);
    expect(src.includes('readJsonBody<Record<string, unknown>>(request)')).toBe(false);
  });
});

describe('THE PER-FILE HONEST BYTES (the zod split and the borrowed interfaces)', () => {
  it('gift-cards CREATE names ONLY the four raw fields the zod schema does not own', () => {
    const src = read('src/app/api/gift-cards/route.ts');
    expect(src.includes('currency?: unknown;')).toBe(true);
    expect(src.includes('issuedBy?: unknown;')).toBe(true);
    expect(src.includes('issuedTo?: unknown;')).toBe(true);
    expect(src.includes('expiresAt?: unknown;')).toBe(true);
    // the four re-casts are gone — the reads are direct
    expect(src.includes('(body as Record<string, unknown>)')).toBe(false);
  });

  it('gift-cards [id]/redeem speaks the redemption shape (amount numeric-ish, three nullable strings)', () => {
    const src = read('src/app/api/gift-cards/[id]/redeem/route.ts');
    expect(src.includes('amount?: number | string;')).toBe(true);
    expect(src.includes('transactionId?: string;')).toBe(true);
    expect(src.includes('redeemedBy?: string;')).toBe(true);
    expect(src.includes('notes?: string;')).toBe(true);
  });

  it('gift-cards [id]/adjust speaks the adjustment shape (amount nullable — the guard compares null)', () => {
    const src = read('src/app/api/gift-cards/[id]/adjust/route.ts');
    expect(src.includes('amount?: number | string | null;')).toBe(true);
    expect(src.includes('reason?: unknown }>(request)')).toBe(true);
  });

  it('the two redeem doors borrow their handlers\u2019 own interfaces, no re-cast', () => {
    expect(read('src/app/api/vouchers/redeem/route.ts').includes('readJsonBody<RedeemBody>(request)')).toBe(true);
    expect(read('src/app/api/gift-cards/redeem/route.ts').includes('readJsonBody<RedeemByCodeBody>(request)')).toBe(true);
  });

  it('the etims trio speaks its consumed fields', () => {
    expect(read('src/app/api/etims/register-product/route.ts').includes('readJsonBody<{ productId?: string }>(request)')).toBe(true);
    expect(read('src/app/api/etims/issue-invoice/route.ts').includes('readJsonBody<{ transactionId?: string }>(request)')).toBe(true);
    const settings = read('src/app/api/etims/settings/route.ts');
    expect(settings.includes('sandbox?: unknown;')).toBe(true);
    expect(settings.includes('deviceSerial?: unknown;')).toBe(true);
  });

  it('vouchers [id] already wore its own literal — untouched, pinned', () => {
    const src = read('src/app/api/vouchers/[id]/route.ts');
    expect(
      src.includes('readJsonBody<{ status?: string; value?: number; startDate?: string; endDate?: string; [key: string]: unknown }>(request)')
    ).toBe(true);
  });
});

describe('THE LEDGER GREW HONESTLY (body-door-class-v2326)', () => {
  it('the catalog pair graduated out of the loose-generic exemplar list (the customer graduate followed in v2.338.0 — the LAST two graduated in v2.339.0 and the era is over)', () => {
    const src = read('src/tests/body-door-class-v2326.test.ts');
    expect(src.includes('THE CATALOG PAIR GRADUATED')).toBe(true);
    expect(src.includes("'src/app/api/categories/[id]/route.ts',")).toBe(false);
    expect(src.includes("'src/app/api/gift-cards/[id]/route.ts',")).toBe(false);
    // v2.338.0: the customer graduate followed (see customer-doors-v2338.test.ts)
    expect(src.includes("'src/app/api/customer-credits/[id]/route.ts',")).toBe(false);
    // v2.339.0: the last exemplars graduated — the tombstone list is empty
    // (the graduation story lives in src/tests/last-exemplars-v2339.test.ts;
    // the two graduates appear in v2.326 only inside its GRADUATED list,
    // guarded by ABSENCE now)
    expect(src.includes('THE LAST EXEMPLARS GRADUATED')).toBe(true);
    expect(src.includes('EXEMPLARS: string[] = [];')).toBe(true);
  });
});

describe('THE LAW DOC CARRIES THE ROUND', () => {
  it('request-body.ts records the catalog family pass', () => {
    const home = read('src/lib/request-body.ts');
    expect(home.includes('v2.336.0 — THE CATALOG FAMILY')).toBe(true);
    expect(home.includes("the wider class's second pass")).toBe(true);
    expect(home.includes('the `as` re-casts are gone')).toBe(true);
  });
});

describe('THE STYLING FACE — the shelf meter on the catalog desk', () => {
  const desk = () => read('src/app/(shell)/tabs/catalog-tab.tsx');

  it('the product cards grow the colour-stepped shelf meter', () => {
    expect(desk().includes('THE SHELF METER (v2.336.0)')).toBe(true);
    expect(desk().includes('data-testid="product-stock-meter"')).toBe(true);
    expect(desk().includes('role="progressbar"')).toBe(true);
    expect(desk().includes('aria-valuemax={envelope}')).toBe(true);
  });

  it('the meter colour-steps through the reorder envelope (the consumption-meter family)', () => {
    expect(desk().includes("'bg-red-500 dark:bg-red-400'")).toBe(true);
    expect(desk().includes("'bg-amber-500 dark:bg-amber-400'")).toBe(true);
    expect(desk().includes("'bg-emerald-500 dark:bg-emerald-400'")).toBe(true);
  });

  it('the meter speaks in both views (grid card and list row)', () => {
    const src = desk();
    const grid = src.indexOf('<StockMeter qty={product.quantityInStock} reorder={product.reorderLevel} />');
    const list = src.indexOf('reorder={product.reorderLevel} />', grid + 1);
    expect(grid).toBeGreaterThan(-1);
    expect(list).toBeGreaterThan(grid);
  });

  it('an empty shelf stays silent (the Unavailable voice already speaks)', () => {
    expect(desk().includes('if (qty <= 0) return null;')).toBe(true);
  });
});
