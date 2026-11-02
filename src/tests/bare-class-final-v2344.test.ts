import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'path';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// v2.344.0 — THE BARE CLASS ENDS (the final pass).
//
// The last eight bare doors speak their bodies' own shapes — auth/login,
// branches, delivery-notes, expenses, invoices, store-transfers, suppliers,
// users — and the tombstone census pins the class closed: the bare
// `readJsonBody(request)` call, a door with NO generic, now matches ZERO
// API files. Every door behind the body door speaks its shape.
//
//   • THE ZOD TRIO (auth/login, expenses, users) names the fields its
//     schemas read as unknowns — the zod validation owns the shapes, the
//     door only names what the body is expected to carry (the gift-card
//     precedent);
//   • THE FIVE RAW DOORS ride the shapes their handlers consume: the
//     truthiness-guarded fields stay REQUIRED strings (the route's own
//     guard is the validator and Prisma's where/data consume them), the
//     columns ride the optionals their `|| null` / `|| 'ACTIVE'` /
//     `|| 'NET_30'` / `?? 3` / `?? true` defaults own, and the item arrays
//     ride the element shapes the routes' own loops validate;
//   • THE THREE DE-FACTO MAP RE-CASTS dissolve: the `(item: { ... })`
//     annotations on the invoices, delivery-notes and store-transfers
//     create maps ride the generics now (the v2.343 purchase-orders
//     precedent), and invoices' own `as number | undefined` discount cast
//     dissolves — toDec's Numeric already owns the absence. taxRate is
//     deliberately NOT named on the invoice element: the admin-controlled
//     VAT rate is authoritative for new invoices, the wire field is never
//     read.
//
// The styling face is the DISCOUNT-CAP METER (the meter precedent, tenth
// desk): the invoices composer draws the create door's own cap chain —
// Math.min(max0(toDec(discountAmount)), subtotal) — BEFORE the invoice is
// filed, with the honest trim voice when the typed discount exceeds the
// pre-tax gross subtotal.
//
// THE OD LAW: every pin reads SOURCE bytes.
// ---------------------------------------------------------------------------

const read = (p: string) => readFileSync(p, 'utf8');

function walkApi(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkApi(full));
    else if (name.endsWith('.ts')) out.push(full);
  }
  return out;
}

const API_FILES = walkApi('src/app/api');
const BARE = API_FILES.filter((f) => /readJsonBody\(request\)/.test(read(f)));

const THE_EIGHT = [
  'src/app/api/auth/login/route.ts',
  'src/app/api/branches/route.ts',
  'src/app/api/delivery-notes/route.ts',
  'src/app/api/expenses/route.ts',
  'src/app/api/invoices/route.ts',
  'src/app/api/store-transfers/route.ts',
  'src/app/api/suppliers/route.ts',
  'src/app/api/users/route.ts',
];

describe('THE BARE CLASS ENDS (v2.344.0)', () => {
  it('THE TOMBSTONE: zero bare `readJsonBody(request)` calls remain in src/app/api', () => {
    expect(BARE.length).toBe(0);
  });

  it('all eight doors now carry their generics (the census that closes the class)', () => {
    for (const door of THE_EIGHT) {
      expect(read(door).includes('readJsonBody<{')).toBe(true);
    }
  });

  it('the door default itself is untouched (the any law, documented, lint-clean)', () => {
    const helper = read('src/lib/request-body.ts');
    expect(helper.includes('export async function readJsonBody<T = any>(')).toBe(true);
    expect(helper.includes('eslint-disable-next-line @typescript-eslint/no-explicit-any')).toBe(true);
  });

  it('the law doc records the ending (history keeps every earlier count)', () => {
    const helper = read('src/lib/request-body.ts');
    expect(helper.includes("v2.344.0 — THE BARE CLASS ENDS")).toBe(true);
    expect(helper.includes('matches ZERO API files')).toBe(true);
    expect(helper.includes('TENTH desk')).toBe(true);
    // the earlier falls keep their counts (release history never rewrites)
    expect(helper.includes('falls to 8 doors')).toBe(true);
    expect(helper.includes('falls to 16 doors')).toBe(true);
    expect(helper.includes('falls to 20 doors')).toBe(true);
    expect(helper.includes('falls to 25 doors')).toBe(true);
  });

  it('the four family ledgers grew the tombstone honestly (the pin-growth law)', () => {
    const growth = 'the bare class is closed — zero bare doors remain (the v2.344.0 tombstone)';
    expect(read('src/tests/hr-doors-v2340.test.ts').includes(growth)).toBe(true);
    expect(read('src/tests/loyalty-tax-doors-v2341.test.ts').includes(growth)).toBe(true);
    expect(read('src/tests/messaging-doors-v2342.test.ts').includes(growth)).toBe(true);
    expect(read('src/tests/recast-rental-doors-v2343.test.ts').includes(growth)).toBe(true);
  });
});

describe('THE ZOD TRIO NAMES ITS FIELDS (the gift-card precedent)', () => {
  it('auth/login: the door names the two fields the login schema reads', () => {
    const src = read('src/app/api/auth/login/route.ts');
    expect(src.includes('readJsonBody<{ email?: unknown; password?: unknown }>(request)')).toBe(true);
    expect(src.includes('validateInput(loginSchema, body)')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
  });

  it('expenses: the door names the seven fields the expense schema reads', () => {
    const src = read('src/app/api/expenses/route.ts');
    expect(src.includes('storeId?: unknown;')).toBe(true);
    expect(src.includes('description?: unknown;')).toBe(true);
    expect(src.includes('amount?: unknown;')).toBe(true);
    expect(src.includes('category?: unknown;')).toBe(true);
    expect(src.includes('paidBy?: unknown;')).toBe(true);
    expect(src.includes('paymentMethod?: unknown;')).toBe(true);
    expect(src.includes('notes?: unknown;')).toBe(true);
    expect(src.includes('validateInput(createExpenseSchema, body)')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
  });

  it('users: the door names the eight fields the user schema reads', () => {
    const src = read('src/app/api/users/route.ts');
    expect(src.includes('name?: unknown;')).toBe(true);
    expect(src.includes('email?: unknown;')).toBe(true);
    expect(src.includes('role?: unknown;')).toBe(true);
    expect(src.includes('phone?: unknown;')).toBe(true);
    expect(src.includes('storeId?: unknown;')).toBe(true);
    expect(src.includes('organizationId?: unknown;')).toBe(true);
    expect(src.includes('password?: unknown;')).toBe(true);
    expect(src.includes('mustChangePassword?: unknown;')).toBe(true);
    expect(src.includes('validateInput(createUserSchema, body)')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
  });
});

describe('THE FIVE RAW DOORS SPEAK THEIR SHAPES', () => {
  it('branches: the pair rides REQUIRED, the columns ride their defaults, code rides normalizeBranchCode', () => {
    const src = read('src/app/api/branches/route.ts');
    expect(src.includes('organizationId: string;')).toBe(true);
    expect(src.includes('name: string;')).toBe(true);
    expect(src.includes('code?: string;')).toBe(true);
    expect(src.includes('status?: string;')).toBe(true);
    expect(src.includes('normalizeBranchCode(body.code)')).toBe(true);
    expect(src.includes('name and organizationId are required.')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
  });

  it('delivery-notes: the items ride the element shape and the map re-cast dissolves', () => {
    const src = read('src/app/api/delivery-notes/route.ts');
    expect(src.includes('customerName: string;')).toBe(true);
    expect(src.includes('items: Array<{')).toBe(true);
    expect(src.includes('productName: string;')).toBe(true);
    expect(src.includes('quantity: number;')).toBe(true);
    expect(src.includes('scheduledDate?: string;')).toBe(true);
    expect(src.includes('items.map((item) => ({')).toBe(true);
    expect(src.includes('(item: { productId?: string; productName: string; quantity: number; unitType?: string; notes?: string })')).toBe(false);
    expect(src.includes('At least one delivery item is required.')).toBe(true);
    expect(src.includes('Each item must have productName and a positive quantity.')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
  });

  it('invoices: the element speaks, the map re-cast AND the discount cast dissolve, taxRate is not named', () => {
    const src = read('src/app/api/invoices/route.ts');
    expect(src.includes('customerName: string;')).toBe(true);
    expect(src.includes('discountAmount?: number;')).toBe(true);
    expect(src.includes('pricePerUnit: number;')).toBe(true);
    expect(src.includes('discountPercent?: number;')).toBe(true);
    expect(src.includes('taxRate?: number;')).toBe(false);
    expect(src.includes('items.map((item) => {')).toBe(true);
    expect(src.includes('max0(toDec(discountAmount))')).toBe(true);
    expect(src.includes('(discountAmount as')).toBe(false);
    expect(src.includes('storeId and customerName are required.')).toBe(true);
    expect(src.includes('At least one invoice item is required.')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
  });

  it('store-transfers: the store pair rides REQUIRED and the map re-cast dissolves', () => {
    const src = read('src/app/api/store-transfers/route.ts');
    expect(src.includes('fromStoreId: string;')).toBe(true);
    expect(src.includes('toStoreId: string;')).toBe(true);
    expect(src.includes('productId: string;')).toBe(true);
    expect(src.includes('parseFloat(String(item.quantity))')).toBe(true);
    expect(src.includes('items.map((item) => ({')).toBe(true);
    expect(src.includes('(item: { productId: string; quantity: number; unitType?: string; notes?: string })')).toBe(false);
    expect(src.includes('fromStoreId, toStoreId, and items (non-empty array) are required.')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
  });

  it('suppliers: the typed columns ride the types the create data feeds', () => {
    const src = read('src/app/api/suppliers/route.ts');
    expect(src.includes('storeId: string;')).toBe(true);
    expect(src.includes('name: string;')).toBe(true);
    expect(src.includes('paymentTerms?: string;')).toBe(true);
    expect(src.includes('rating?: number;')).toBe(true);
    expect(src.includes('isActive?: boolean;')).toBe(true);
    expect(src.includes('storeId and name are required.')).toBe(true);
    expect(/readJsonBody\(request\)/.test(src)).toBe(false);
  });
});

describe('THE STYLING FACE — the discount-cap meter (the tenth desk)', () => {
  const desk = () => read('src/app/(shell)/tabs/invoices-tab.tsx');

  it('the composer draws the cap before the invoice is filed (the honest aria voice)', () => {
    const src = desk();
    expect(src.includes('data-testid="invoice-discount-meter"')).toBe(true);
    expect(src.includes('role="progressbar"')).toBe(true);
    expect(src.includes('aria-valuemin={0}')).toBe(true);
    expect(src.includes('aria-valuemax={100}')).toBe(true);
    expect(src.includes('aria-valuenow={discountCapPct}')).toBe(true);
  });

  it('the meter runs the route\u2019s own cap chain — the same toDec/max0 the create door uses', () => {
    const deskSrc = desk();
    const routeSrc = read('src/app/api/invoices/route.ts');
    expect(deskSrc.includes('const discountCapped = Math.min(max0(toDec(discountAmount)).toNumber(), subtotal);')).toBe(true);
    expect(deskSrc.includes("import { formatQtyWithUnit, toDec, max0 } from '@/lib/utils/financialMath';")).toBe(true);
    // the door side of the same chain
    expect(routeSrc.includes('max0(toDec(discountAmount)).toNumber(),')).toBe(true);
  });

  it('the trim voice speaks before the trim happens (the amber wardrobe)', () => {
    const src = desk();
    expect(src.includes('data-testid="invoice-discount-cap-value"')).toBe(true);
    expect(src.includes('data-testid="invoice-discount-cap-voice"')).toBe(true);
    expect(src.includes('The create door caps the document discount at the pre-tax subtotal')).toBe(true);
    expect(src.includes('bg-amber-500')).toBe(true);
    expect(src.includes('const discountTrimmed = subtotal > 0 && discountNum > subtotal;')).toBe(true);
  });
});
