#!/usr/bin/env node
// verify-v2-217-0.mjs — the v2.217.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE BRIDGE
// (per-branch Draft PO doors in the watchlist modal; the restock dialog
// POSTing to the SAME endpoint the Purchase orders tab has always used),
// THE WIRE (the kpi-summary payload carries the PO-draft kit — storeId,
// costPrice, suggestedQty via the store-level 1.5× formula, the supplier
// hint from the most recent PO line), THE FOURTH CONSUMER (the restock
// estimate's indicative strip on the same observer terms), THE ZERO LAWS
// (zero lines ship nowhere; empty drafts refused; honest disabled doors),
// and the release face: package.json / VERSION / whats-new / CHANGELOG
// all speak 2.217.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const row = read('src/components/org/kpi-row.tsx');
const dialog = read('src/components/org/restock-dialog.tsx');
const api = read('src/app/api/org/kpi-summary/route.ts');
const prims = read('src/components/org/primitives.tsx');
const chrome = read('src/components/org/chrome.tsx');
const contrast = read('scripts/contrast-math-restock-bridge-v2217.mjs');
const bridgeTest = read('src/tests/restock-bridge-v2217.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the wire —');
ok('products query resolves the store id', api.includes("store: { select: { id: true, name: true, code: true } }"));
ok('storeId rides the named items', api.includes('storeId: p.store?.id ?? null,'));
ok('costPrice rides the named items', api.includes('costPrice: toDec(p.costPrice).toNumber(),'));
ok('suggestedQty is the store-level formula', api.includes('suggestedQty: Math.max(0, Math.ceil(toDec(p.reorderLevel).mul(1.5).minus(toDec(p.quantityInStock)).toNumber())),'));
ok('supplier hint reads the newest PO lines', api.includes("orderBy: { purchaseOrder: { orderDate: 'desc' } },"));
ok('the read is bounded (take: 60)', api.includes('take: 60,'));
ok('first-hit-per-product reduction', api.includes('if (seenLowIds.has(line.productId)) continue;'));
ok('book-cost fallback when no PO line exists', api.includes('if (item.lastUnitCost == null) item.lastUnitCost = item.costPrice;'));
ok('payload type carries the kit as optional', prims.includes('lastSupplierName?: string | null'));

console.log('— the bridge doors —');
ok('branch grouping carries the store id', row.includes('if (acc[name].storeId == null && p.storeId) acc[name].storeId = p.storeId;'));
ok('the door is disabled honestly without a store', row.includes('disabled={!b.storeId}'));
ok('the door opens scoped to the branch', row.includes('setRestockStore({ id: b.storeId, name: b.name })'));
ok('the dialog consumes only its branch\u2019s rows', row.includes('p.storeId === restockStore.id'));
ok('the suggestion chip rides the named rows', row.includes('data-testid={`restock-suggest-${p.sku}`}'));
ok('the chip stays silent on the honest zero', row.includes('p.suggestedQty != null && p.suggestedQty > 0 && ('));

console.log('— the restock dialog —');
ok('it POSTs the store\u2019s existing endpoint', dialog.includes("fetch('/api/purchase-orders', {"));
ok('the draft seeds qty from the suggestion', dialog.includes('qty: Math.max(0, Math.ceil(item.suggestedQty ?? 0)),'));
ok('the draft seeds cost from the last-paid line', dialog.includes('unitCost: Math.max(0, item.lastUnitCost ?? 0),'));
ok('zero lines ship nowhere', dialog.includes('.filter((line) => line.quantity > 0);'));
ok('empty drafts are refused', dialog.includes('if (payloadItems.length === 0) return;'));
ok('the supplier default is derived, never an effect', dialog.includes('const effectiveSupplierId = useMemo('));
ok('the submit gate rides the EFFECTIVE supplier (the v2.217 QA find)', dialog.includes('disabled={submitting || !effectiveSupplierId || shippingCount === 0}'));
ok('the roster fetch is the bridge\u2019s ONE fetch', dialog.includes("queryKey: ['restock-suppliers', storeId],"));
ok('the draft reseeds on open', dialog.includes('}, [open, items]);'));
ok('the success face speaks the server\u2019s numbers', dialog.includes('Number(po.totalAmount)'));
ok('refusals surface, never swallow', dialog.includes('data-testid="restock-error"'));

console.log('— the fourth consumer —');
ok('the lens is pre-resolved on the SAME guards', row.includes("if (activeCurrency === 'KES') return null;"));
ok('the speaking-fix destructure pattern holds', /const \{ currency: activeCurrency \} = useCurrency\(\);/.test(row));
ok('all four restock strip testids present', ['restock-indicative-strip', 'restock-indicative-figure', 'restock-indicative-rate', 'restock-indicative-voice'].every((id) => dialog.includes(`"${id}"`)));
ok('the family sentence rides the strip', dialog.includes('\u2014 indicative; the ledger stays in KES.'));
ok('the estimate is VAT-exclusive, labeled as such', dialog.includes('estimate (excl. VAT)'));
ok('the watchlist modal stays count-voiced', (() => { const m = row.slice(row.indexOf('Reorder watchlist'), row.indexOf('THE REORDER BRIDGE')); return !m.includes('indicative-strip'); })());

console.log('— the cleanup + the release face —');
ok('the orphaned low-stock alert panel is gone', (() => { try { read('src/components/inventory/low-stock-alert-panel.tsx'); return false; } catch { return true; } })());
ok('the console shelf stands untouched (v2.215.0)', chrome.includes('triggerTestId="console-currency-switcher"'));
ok('contrast math present and 10/10-shaped', contrast.includes('10 pass') === false && /pass\.length|failures/.test(contrast) === true && contrast.includes('check(\u0027door white on amber-700 (light)\u0027'));
ok('source pins present', bridgeTest.includes('the reorder bridge') && bridgeTest.includes('restock-indicative-strip'));
ok('package.json speaks 2.217.0', pkg.version === '2.217.0' && pkg.mbumah.releaseVersion === '2.217.0' && pkg.mbumah.baseVersion === '2.217.0');
ok('VERSION speaks 2.217.0', version === '2.217.0');
ok('whats-new grows the entry', whatsNew.includes("version: '2.217.0',") && whatsNew.includes("title: 'The reorder bridge',"));
ok('changelog of record speaks the round', changelog.includes('## [2.217.0] The reorder bridge'));

console.log(`\n${pass} pass, ${failures} fail`);
process.exit(failures > 0 ? 1 : 0);
