#!/usr/bin/env node
// verify-v2-344-0.mjs — the round's FEATURE gate (v2.344.0 "the bare class
// ends, the last eight doors speak their shapes"). The release MECHANICS
// live in verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
// Run BEFORE the walk; the last two pins pass only AFTER walk-v2344.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

function walkApi(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkApi(full));
    else if (name.endsWith('.ts')) out.push(full);
  }
  return out;
}

const API_FILES = walkApi('src/app/api');
const BARE = API_FILES.filter((f) => /readJsonBody\(request\)/.test(read(f)));
const login = read('src/app/api/auth/login/route.ts');
const branches = read('src/app/api/branches/route.ts');
const dn = read('src/app/api/delivery-notes/route.ts');
const expenses = read('src/app/api/expenses/route.ts');
const invoices = read('src/app/api/invoices/route.ts');
const transfers = read('src/app/api/store-transfers/route.ts');
const suppliers = read('src/app/api/suppliers/route.ts');
const users = read('src/app/api/users/route.ts');
const helper = read('src/lib/request-body.ts');
const desk = read('src/app/(shell)/tabs/invoices-tab.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const test = read('src/tests/bare-class-final-v2344.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the bare class ends: 8 → 0 —');
ok('THE TOMBSTONE: zero bare `readJsonBody(request)` calls remain',
  BARE.length === 0);
ok('all eight doors carry their generics',
  [login, branches, dn, expenses, invoices, transfers, suppliers, users].every((s) => s.includes('readJsonBody<{')));
ok('the loose-Record era stays over (no regressions)',
  !API_FILES.some((f) => read(f).includes('readJsonBody<Record<string, unknown>>')));
ok('the re-cast class stays gone',
  !API_FILES.some((f) => /door\.body as [A-Z]/.test(read(f))));
ok('THE DE-FACTO RE-CAST TOMBSTONE: zero `} = body as {` matches in src/app/api',
  !API_FILES.some((f) => /} = body as \{/.test(read(f))));
ok('the door default itself is untouched (the any law, documented, lint-clean)',
  helper.includes('export async function readJsonBody<T = any>(') &&
  helper.includes('eslint-disable-next-line @typescript-eslint/no-explicit-any'));

console.log('— the zod trio names its fields (the gift-card precedent) —');
ok('auth/login: the two schema fields ride unknowns',
  login.includes('readJsonBody<{ email?: unknown; password?: unknown }>(request)') &&
  login.includes('validateInput(loginSchema, body)') &&
  !/readJsonBody\(request\)/.test(login));
ok('expenses: the seven schema fields ride unknowns',
  expenses.includes('storeId?: unknown;') && expenses.includes('description?: unknown;') &&
  expenses.includes('amount?: unknown;') && expenses.includes('category?: unknown;') &&
  expenses.includes('paidBy?: unknown;') && expenses.includes('paymentMethod?: unknown;') &&
  expenses.includes('notes?: unknown;') && expenses.includes('validateInput(createExpenseSchema, body)') &&
  !/readJsonBody\(request\)/.test(expenses));
ok('users: the eight schema fields ride unknowns',
  users.includes('name?: unknown;') && users.includes('email?: unknown;') &&
  users.includes('role?: unknown;') && users.includes('phone?: unknown;') &&
  users.includes('storeId?: unknown;') && users.includes('organizationId?: unknown;') &&
  users.includes('password?: unknown;') && users.includes('mustChangePassword?: unknown;') &&
  users.includes('validateInput(createUserSchema, body)') &&
  !/readJsonBody\(request\)/.test(users));

console.log('— the five raw doors speak —');
ok('branches: the pair REQUIRED, the columns ride their defaults',
  branches.includes('organizationId: string;') && branches.includes('name: string;') &&
  branches.includes('code?: string;') && branches.includes('status?: string;') &&
  branches.includes('normalizeBranchCode(body.code)') &&
  branches.includes('name and organizationId are required.') &&
  !/readJsonBody\(request\)/.test(branches));
ok('delivery-notes: the items ride the element shape, the map re-cast dissolves',
  dn.includes('customerName: string;') && dn.includes('items: Array<{') &&
  dn.includes('productName: string;') && dn.includes('quantity: number;') &&
  dn.includes('scheduledDate?: string;') &&
  dn.includes('items.map((item) => ({') &&
  !dn.includes('(item: { productId?: string; productName: string; quantity: number; unitType?: string; notes?: string })') &&
  dn.includes('At least one delivery item is required.') &&
  !/readJsonBody\(request\)/.test(dn));
ok('invoices: the discount rides number, the cast dissolves, taxRate is not named',
  invoices.includes('customerName: string;') && invoices.includes('discountAmount?: number;') &&
  invoices.includes('pricePerUnit: number;') && invoices.includes('discountPercent?: number;') &&
  !invoices.includes('taxRate?: number;') &&
  invoices.includes('items.map((item) => {') &&
  invoices.includes('max0(toDec(discountAmount))') && !invoices.includes('(discountAmount as') &&
  invoices.includes('storeId and customerName are required.') &&
  !/readJsonBody\(request\)/.test(invoices));
ok('store-transfers: the store pair REQUIRED, the map re-cast dissolves',
  transfers.includes('fromStoreId: string;') && transfers.includes('toStoreId: string;') &&
  transfers.includes('productId: string;') &&
  transfers.includes('parseFloat(String(item.quantity))') &&
  transfers.includes('items.map((item) => ({') &&
  !transfers.includes('(item: { productId: string; quantity: number; unitType?: string; notes?: string })') &&
  transfers.includes('fromStoreId, toStoreId, and items (non-empty array) are required.') &&
  !/readJsonBody\(request\)/.test(transfers));
ok('suppliers: the typed columns ride the types the create data feeds',
  suppliers.includes('storeId: string;') && suppliers.includes('name: string;') &&
  suppliers.includes('paymentTerms?: string;') && suppliers.includes('rating?: number;') &&
  suppliers.includes('isActive?: boolean;') &&
  suppliers.includes('storeId and name are required.') &&
  !/readJsonBody\(request\)/.test(suppliers));

console.log('— the law doc carries the round —');
ok('request-body.ts records the bare class end (history keeps the 8/16/20/25)',
  helper.includes('v2.344.0 — THE BARE CLASS ENDS') &&
  helper.includes('matches ZERO API files') &&
  helper.includes('gift-card precedent') &&
  helper.includes('the wire field is never read') &&
  helper.includes('TENTH desk') &&
  helper.includes('falls to 8 doors') &&
  helper.includes('falls to 16 doors') &&
  helper.includes('falls to 20 doors') &&
  helper.includes('falls to 25 doors'));

console.log('— the styling face: the discount-cap meter (the tenth desk) —');
ok('the composer draws the cap before the invoice is filed (the honest aria voice)',
  desk.includes('data-testid="invoice-discount-meter"') &&
  desk.includes('role="progressbar"') &&
  desk.includes('aria-valuemin={0}') &&
  desk.includes('aria-valuemax={100}') &&
  desk.includes('aria-valuenow={discountCapPct}'));
ok('the meter runs the route\u2019s own cap chain (one chain, spoken twice)',
  desk.includes('const discountCapped = Math.min(max0(toDec(discountAmount)).toNumber(), subtotal);') &&
  desk.includes("import { formatQtyWithUnit, toDec, max0 } from '@/lib/utils/financialMath';") &&
  invoices.includes('max0(toDec(discountAmount)).toNumber(),'));
ok('the trim voice speaks before the trim happens (the amber wardrobe)',
  desk.includes('data-testid="invoice-discount-cap-value"') &&
  desk.includes('data-testid="invoice-discount-cap-voice"') &&
  desk.includes('The create door caps the document discount at the pre-tax subtotal') &&
  desk.includes('bg-amber-500') &&
  desk.includes('const discountTrimmed = subtotal > 0 && discountNum > subtotal;'));

console.log('— the family ledgers grew the tombstone honestly —');
const GROWTH = 'the bare class is closed — zero bare doors remain (the v2.344.0 tombstone)';
ok('the four family ledgers carry the tombstone it (the pin-growth law)',
  read('src/tests/hr-doors-v2340.test.ts').includes(GROWTH) &&
  read('src/tests/loyalty-tax-doors-v2341.test.ts').includes(GROWTH) &&
  read('src/tests/messaging-doors-v2342.test.ts').includes(GROWTH) &&
  read('src/tests/recast-rental-doors-v2343.test.ts').includes(GROWTH));
ok('the round\u2019s own test file speaks the tombstone',
  test.includes('THE TOMBSTONE: zero bare `readJsonBody(request)` calls remain in src/app/api') &&
  test.includes("expect(BARE.length).toBe(0);"));

console.log('— the release mechanics —');
ok('whats-new carries 2.344.0 (the raw-escape bytes)',
  whatsNew.includes("version: '2.344.0'") &&
  whatsNew.includes('the last eight doors speak their shapes') &&
  whatsNew.includes('route\\u2019s own cap math'));
ok('CHANGELOG carries the 2.344.0 head', changelog.includes('## [2.344.0] The bare class ends, the last eight doors speak their shapes'));
ok('VERSION and package.json speak 2.344.0 in all three slots',
  read('VERSION').trim() === '2.344.0' &&
  pkg.version === '2.344.0' &&
  pkg.mbumah.releaseVersion === '2.344.0' &&
  pkg.mbumah.baseVersion === '2.344.0');
ok('the verify gate is wired', read('package.json').includes('"verify:v2-344-0": "node scripts/verify-v2-344-0.mjs"'));

console.log('— the walk-dependent pins (green after walk-v2344) —');
ok('the unread-counter cascade landed (235/236/237/268)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(235)") &&
  changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(236)") &&
  changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(237)") &&
  changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(268)"));
ok('the history line rides the cascade block',
  changelogTest.includes('v2.344.0: the bare-class-final entry joins the feed'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
