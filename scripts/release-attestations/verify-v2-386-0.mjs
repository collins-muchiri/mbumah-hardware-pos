#!/usr/bin/env node
// verify-v2-386-0.mjs — the round's FEATURE gate (v2.386.0 "the payload
// files itself"). The release MECHANICS live in verify-current.mjs. This
// script pins only what is NEW this round: the print face (the id, the
// button pair's order, the pipeline call), the per-line list (the
// mount-only gate, the scroll, the boundary coercions), the mapper's
// last decimal leak sealed (all four toNum reads), the fixture world's
// SaleItem block, and the release's own slots.
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/etims-tab.tsx');
const ROUTE = read('src/app/api/kra/submit/route.ts');
const SEED = read('scripts/seed-kra-fixtures.mjs');
const SUITE = read('src/tests/kra-payload-print-v2386.test.ts');
const FEED = read('src/lib/whats-new.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the print face —');
ok('THE CARD CARRIES THE ID THE PIPELINE RESOLVES',
  DESK.includes('id="kra-dryrun-payload"')
  && read('src/lib/receipt-pdf.ts').includes('document.getElementById(elementId)'));
ok('THE PRINT BUTTON SPEAKS ITS NAME AND RIDES THE PIPELINE',
  DESK.includes('aria-label="Print mapped payload"')
  && DESK.includes("printReceiptElement('kra-dryrun-payload')"));
ok('PRINT SITS BEFORE COPY (the paper leads)',
  DESK.indexOf('Print mapped payload') > -1
  && DESK.indexOf('Print mapped payload') < DESK.indexOf('Copy mapped payload as JSON'));
ok('THE COPY VOICE STAYS WHOLE (the v2.385.0 face)',
  DESK.includes("{payloadCopied ? 'Copied' : 'Copy'}"));

console.log('— the per-line list —');
ok('THE LIST MOUNTS ONLY ON ITEMS',
  DESK.includes('{dryRunPayload.items.length > 0 && (')
  && DESK.includes('data-testid="kra-dryrun-items"'));
ok('THE LIST SCROLLS INSIDE THE DIALOG',
  DESK.includes('max-h-40 overflow-y-auto'));
ok('THE QUANTITY RIDES THE BOUNDARY COERCION',
  DESK.includes('× {Number(item.quantity)}')
  && DESK.includes('{payloadMoney(item.unitPrice)}')
  && DESK.includes('{payloadMoney(item.total)}'));

console.log('— the mapper\u2019s last leak —');
ok('ALL FOUR FIELDS READ THROUGH toNum',
  ROUTE.includes('const lineTotal = toNum(item.lineTotal);')
  && ROUTE.includes('const vatRate = toNum(item.taxRate) || 16;')
  && ROUTE.includes('quantity: toNum(item.quantity),')
  && ROUTE.includes('unitPrice: toNum(item.pricePerUnit),'));
{
  const block = ROUTE.slice(ROUTE.indexOf('const items: KraInvoiceLineItem[]'), ROUTE.indexOf('  return {'));
  ok('NO RAW DECIMAL FACE REACHES THE PAYLOAD',
    !block.includes('quantity: item.quantity') && !block.includes('unitPrice: item.pricePerUnit'));
}

console.log('— the fixture world —');
ok('THE SEED GROWS IDEMPOTENT SaleItem ROWS',
  SEED.includes('transactionId: tx.id, productName: product.name')
  && SEED.includes('lineTotal: 11600'));
ok('THE SEED REFUSES AN EMPTY CATALOG',
  SEED.includes('fixture seed needs at least one product in the seeded world'));

console.log('— the release\u2019s own faces —');
ok('THE SUITE EXISTS AND PINS THE ROUND', SUITE.length > 4000 && SUITE.includes('THE PAYLOAD FILES ITSELF'));
ok('THE FEED\u2019S LEAD ENTRY IS THE ROUND',
  FEED.indexOf("version: '2.386.0'") >= 0
  && FEED.indexOf("version: '2.386.0'") < FEED.indexOf("version: '2.385.0'"));
ok('THE VERSION SLOTS SPEAK 2.386.0',
  version === '2.386.0' && pkg.version === '2.386.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
