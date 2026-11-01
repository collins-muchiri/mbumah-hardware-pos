#!/usr/bin/env node
// verify-v2-336-0.mjs — the round's FEATURE gate (v2.336.0 "the catalog
// doors speak their body's shape"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD
// LAW. Pin law (Task 43-56): pins must match the SOURCE bytes (the
// raw-escape law included — the whats-new title stores \u2019 raw).
// Run BEFORE the walk; the last two pins pass only AFTER walk-v2336.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DOORS = [
  'src/app/api/products/route.ts', 'src/app/api/products/[id]/route.ts', 'src/app/api/products/bundles/route.ts',
  'src/app/api/categories/route.ts', 'src/app/api/categories/[id]/route.ts', 'src/app/api/subcategories/route.ts',
  'src/app/api/vouchers/route.ts', 'src/app/api/vouchers/[id]/route.ts', 'src/app/api/vouchers/redeem/route.ts',
  'src/app/api/voucher-campaigns/route.ts',
  'src/app/api/gift-cards/route.ts', 'src/app/api/gift-cards/[id]/route.ts',
  'src/app/api/gift-cards/[id]/redeem/route.ts', 'src/app/api/gift-cards/[id]/adjust/route.ts',
  'src/app/api/gift-cards/redeem/route.ts',
  'src/app/api/etims/register-product/route.ts', 'src/app/api/etims/settings/route.ts',
  'src/app/api/etims/issue-invoice/route.ts',
];
const doors = DOORS.map(read);
const helper = read('src/lib/request-body.ts');
const test = read('src/tests/catalog-doors-v2336.test.ts');
const ledger = read('src/tests/body-door-class-v2326.test.ts');
const finTest = read('src/tests/financial-doors-v2335.test.ts');
const desk = read('src/app/(shell)/tabs/catalog-tab.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the zero-loose-generic census (the catalog family) —');
ok('not one catalog door still speaks the loose Record generic',
  !doors.some((s) => s.includes('readJsonBody<Record<string, unknown>>')));
ok('not one catalog door still calls the door bare (the `any` law)',
  !doors.some((s) => /readJsonBody\(request\)/.test(s)));
ok('not one catalog door re-casts the body to a named interface',
  !doors.some((s) => /door\.body as [A-Z]/.test(s)));
ok('all eighteen still door with the marker + both helpers',
  doors.every((s) => s.includes('readJsonBody') && s.includes('bodyDoorRejected') &&
    s.includes('THE BODY DOOR: an unreadable body is a client mistake')));

console.log('— the create doors speak the body\u2019s own shape —');
ok('products CREATE speaks the seventeen-field wire shape (unknown only where it coerces)',
  read('src/app/api/products/route.ts').includes('sellingUnit?: unknown;') &&
  read('src/app/api/products/route.ts').includes('quantityInStock?: number;'));
ok('bundles CREATE repeats the route\u2019s own map annotations',
  read('src/app/api/products/bundles/route.ts')
    .includes('items: Array<{ childProductId: string; quantityRequired: number }>;') &&
  read('src/app/api/products/bundles/route.ts')
    .includes('componentProducts: Array<{ productId: string; quantity: number }>;'));
ok('categories CREATE carries the null the auto-pick branch checks',
  read('src/app/api/categories/route.ts').includes('sortOrder?: number | null;'));
ok('vouchers CREATE names the fourteen consumed fields',
  read('src/app/api/vouchers/route.ts').includes('maxUsesPerUser?: number;') &&
  read('src/app/api/vouchers/route.ts').includes('campaignId?: string;'));
ok('voucher-campaigns CREATE speaks the campaign shape',
  read('src/app/api/voucher-campaigns/route.ts').includes('budget?: number;'));

console.log('— the update doors, the zod split, the borrowed interfaces —');
ok('products UPDATE names sku beside barcode (the loop keeps the index signature)',
  read('src/app/api/products/[id]/route.ts')
    .includes('readJsonBody<{ sku?: unknown; barcode?: string; [key: string]: unknown }>(request)'));
ok('categories UPDATE graduated from the loose Record to its six type-narrowed fields',
  read('src/app/api/categories/[id]/route.ts').includes('name?: unknown;') &&
  !read('src/app/api/categories/[id]/route.ts').includes('readJsonBody<Record<string, unknown>>'));
ok('gift-cards UPDATE names the toggle shortcut and the expiry clearing',
  read('src/app/api/gift-cards/[id]/route.ts')
    .includes('readJsonBody<{ toggleVisibility?: unknown; expiresAt?: unknown; [key: string]: unknown }>(request)'));
ok('gift-cards CREATE names ONLY the four raw fields (the re-casts are gone)',
  read('src/app/api/gift-cards/route.ts').includes('currency?: unknown;') &&
  !read('src/app/api/gift-cards/route.ts').includes('(body as Record<string, unknown>)'));
ok('gift-cards adjust speaks the nullable amount the guard compares',
  read('src/app/api/gift-cards/[id]/adjust/route.ts')
    .includes('readJsonBody<{ amount?: number | string | null; reason?: unknown }>(request)'));
ok('the two redeem doors borrow their handlers\u2019 own interfaces',
  read('src/app/api/vouchers/redeem/route.ts').includes('readJsonBody<RedeemBody>(request)') &&
  read('src/app/api/gift-cards/redeem/route.ts').includes('readJsonBody<RedeemByCodeBody>(request)'));
ok('the etims trio speaks its consumed fields',
  read('src/app/api/etims/register-product/route.ts').includes('readJsonBody<{ productId?: string }>(request)') &&
  read('src/app/api/etims/issue-invoice/route.ts').includes('readJsonBody<{ transactionId?: string }>(request)') &&
  read('src/app/api/etims/settings/route.ts').includes('deviceSerial?: unknown;'));
ok('vouchers [id] already wore its own literal — untouched',
  read('src/app/api/vouchers/[id]/route.ts')
    .includes('readJsonBody<{ status?: string; value?: number; startDate?: string; endDate?: string; [key: string]: unknown }>(request)'));

console.log('— the ledger grew honestly —');
ok('the catalog pair graduated out of the v2.326 exemplar list (three remain)',
  ledger.includes('THE CATALOG PAIR GRADUATED') &&
  ledger.includes("'src/app/api/customer-credits/[id]/route.ts',") &&
  !ledger.includes("'src/app/api/categories/[id]/route.ts',") &&
  !ledger.includes("'src/app/api/gift-cards/[id]/route.ts',"));
ok('the financial-doors ledger pin grew with the graduation (the pin-growth law)',
  finTest.includes('the catalog pair graduated too') &&
  finTest.includes("EXEMPLARS: string[] = [\\n  'src/app/api/customer-credits/[id]/route.ts',\\n  'src/app/api/expenses/[id]/route.ts',\\n  'src/app/api/suppliers/[id]/route.ts',\\n];"));
ok('the law doc records the second pass',
  helper.includes('v2.336.0 — THE CATALOG FAMILY') &&
  helper.includes("the wider class's second pass"));

console.log('— the styling face (the shelf meter) —');
ok('the product cards grow the colour-stepped shelf meter',
  desk.includes('THE SHELF METER (v2.336.0)') &&
  desk.includes('data-testid="product-stock-meter"') &&
  desk.includes('role="progressbar"'));
ok('the meter colour-steps through the reorder envelope (the consumption-meter family)',
  desk.includes("'bg-red-500 dark:bg-red-400'") &&
  desk.includes("'bg-amber-500 dark:bg-amber-400'") &&
  desk.includes("'bg-emerald-500 dark:bg-emerald-400'"));
ok('an empty shelf stays silent (the Unavailable voice already speaks)',
  desk.includes('if (qty <= 0) return null;'));

console.log('— the release voice —');
ok('the tightening ledger exists and pins the census + bytes + meter',
  test.includes('THE CATALOG DOORS SPEAK THEIR BODY SHAPE') &&
  test.includes('THE PER-FILE HONEST BYTES') &&
  test.includes('product-stock-meter'));
ok("whats-new leads with the round\u2019s story",
  whatsNew.includes("version: '2.336.0',") &&
  whatsNew.includes('The catalog doors speak their body\\u2019s shape'));
ok('the CHANGELOG carries the round (Added + Styling + Tests)',
  changelog.includes("## [2.336.0] The catalog doors speak their body's shape") &&
  changelog.includes('THE CATALOG DOORS TIGHTENED (18 doors / 18 files)') &&
  changelog.includes('THE SHELF METER'));
ok('the manifest answers 2.336.0 in all three slots',
  pkg.version === '2.336.0' && pkg.mbumah?.releaseVersion === '2.336.0' && pkg.mbumah?.baseVersion === '2.336.0');
ok('the verify gate itself is wired into the manifest',
  typeof pkg.scripts['verify:v2-336-0'] === 'string');

console.log('— the walk\u2019s anchors (green AFTER walk-v2336) —');
ok('the walk\u2019s history line landed (the cascade speaks 227/228/229/260)',
  changelogTest.includes('// v2.336.0:') && changelogTest.includes('entry joins the feed') &&
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(227)"));
ok('no stale anchor behind (the old counts are gone)',
  !changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(226)"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
