#!/usr/bin/env node
// verify-v2-218-0.mjs — the v2.218.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE SCOPE
// (the restock dialog's honest aria-pressed pair — named rows at zero
// fetch, the branch's own low-stock wire at one disclosed fetch),
// THE MAPPING (the wire's rows onto the same RestockItem shape, the
// last-PAID cost over the book cost), THE RESEED LAW (content signature,
// never array identity), THE FULL-MODE HONESTY STATES, THE CAP
// DISCLOSURE (the modal names the window AND the way out), THE COUNT
// LAW HOLDING (no strip in the watchlist modal), and the release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.218.0.

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
const wire = read('src/app/api/products/low-stock/route.ts');
const fullTest = read('src/tests/restock-full-v2218.test.ts');
const bridgeTest = read('src/tests/restock-bridge-v2217.test.ts');
const vatTest = read('src/tests/vat-spark-v2194.test.ts');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the scope toggle —');
ok('named scope testid', dialog.includes('data-testid="restock-mode-named"'));
ok('full scope testid', dialog.includes('data-testid="restock-mode-full"'));
ok('aria-pressed pair', dialog.includes("aria-pressed={mode === 'named'}") && dialog.includes("aria-pressed={mode === 'full'}"));
ok('named note says zero fetch', dialog.includes('composed from this answer\u2019s named rows — zero fetch.'));
ok('full note says one fetch, uncapped', dialog.includes('fetched live from the branch\u2019s low-stock wire — one fetch, uncapped.'));
ok('the reseed disclosure', dialog.includes('Switching the list clears the edits.'));
ok('a fresh open is a fresh mount', row.includes("key={restockStore?.id ?? 'restock-closed'}"));

console.log('— the one fetch + the mapping —');
ok('full query keyed per branch', dialog.includes("queryKey: ['restock-full', storeId],"));
ok('full query enabled only in full scope', dialog.includes("enabled: open && !!storeId && mode === 'full',"));
ok('the store-level route of record', dialog.includes("fetch(`/api/products/low-stock?storeId=${encodeURIComponent(storeId)}`)"));
ok('the route is store-scoped server-side', wire.includes('requireStoreAccess(getLowStockProductsHandler)'));
ok('last-PAID cost over book cost', dialog.includes('lastUnitCost: r.supplier?.lastUnitCost ?? r.costPrice,'));
ok('the SAME suggested arithmetic', dialog.includes('suggestedQty: r.suggestedReorderQty,') && wire.includes('suggestedReorderQty: Math.max(0, Math.ceil(reorder * 1.5 - stock)),'));
ok('supplier hint fields ride the mapping', dialog.includes('lastSupplierId: r.supplier?.id ?? null,') && dialog.includes('lastSupplierName: r.supplier?.name ?? null,'));

console.log('— the reseed law (by derivation) —');
ok('the edits are the only state', dialog.includes('const [lines, setLines] = useState<Record<string, { qty: number; unitCost: number }>>({});'));
ok('an untouched row renders its seed', dialog.includes('?? seededLine(item)'));
ok('ONE pure seed arithmetic', dialog.includes('const seededLine = (item: RestockItem) => ({'));
ok('the file mounts with ZERO useEffect', !dialog.includes('useEffect('));
ok('the scope flip clears the edits', dialog.includes('setLines({});'));
ok('an edit carries the seed unit cost', dialog.includes('const base = prev[id] ?? (item ? seededLine(item) : { qty: 0, unitCost: 0 });'));

console.log('— the laws in both scopes —');
ok('one active list, no forks', dialog.includes("() => (mode === 'full' ? fullItems : items),"));
ok('zero lines ship nowhere', dialog.includes('.filter((line) => line.quantity > 0);'));
ok('empty drafts refused', dialog.includes('if (payloadItems.length === 0) return;'));
ok('estimate reduces over active rows', dialog.includes('() => activeItems.reduce((acc, item) => {'));
ok('shipping count over active rows', dialog.includes('activeItems.filter((item) => (lines[item.id] ?? seededLine(item)).qty > 0).length'));
ok('supplier tally over active rows', dialog.includes('for (const item of activeItems) {'));
ok('submit gate rides the EFFECTIVE supplier', dialog.includes('disabled={submitting || !effectiveSupplierId || shippingCount === 0}'));
ok('scope-named PO notes (full)', dialog.includes("'Raised from the org console reorder watchlist (full branch restock list).'"));
ok('scope-named PO notes (named)', dialog.includes("'Raised from the org console reorder watchlist (named watchlist).'"));

console.log('— the full-mode honesty states —');
ok('the wire summary voice', dialog.includes('data-testid="restock-full-meta"'));
ok('loading voice', dialog.includes('data-testid="restock-full-loading"'));
ok('failure voice names the way back', dialog.includes('switch back to the named rows to draft from this answer.'));
ok('the truthful empty face', dialog.includes('data-testid="restock-full-empty"'));

console.log('— the ledger-hint chip —');
ok('the chip exists', dialog.includes('data-testid="restock-supplier-hint"'));
ok('it names whose ledger spoke', dialog.includes('the ledger points to {hintLed} — the draft begins where the ledger points.'));
ok('an explicit choice silences it', dialog.includes('if (supplierId && suppliers.some((s) => s.id === supplierId)) return null;'));

console.log('— the styling details —');
ok('the hue ladder (red/orange/amber/emerald)', ["'bg-red-500'", "'bg-orange-500'", "'bg-amber-500'", "'bg-emerald-500'"].every((h) => dialog.includes(h)));
ok('the bar is decorative', dialog.includes('<span className="mt-1 flex items-center gap-1.5" aria-hidden>'));
ok('the lines scroll at reading height', dialog.includes('max-h-[42vh] space-y-2 overflow-y-auto pr-1'));
ok('muted family on the new voices', dialog.includes('text-slate-500 dark:text-slate-400'));

console.log('— the cap disclosure + the count law —');
ok('the cap note exists', row.includes('data-testid="lowstock-cap-note"'));
ok('it names the way out', row.includes('each branch&apos;s Draft PO can switch to the full branch list to cover the rest.'));
ok('it gates on the window', row.includes('stockRows && k.lowStock.count > stockRows.length && ('));
ok('the count law holds (no strip in the modal)', (() => {
  const modal = row.slice(row.indexOf('Reorder watchlist'), row.indexOf('THE REORDER BRIDGE'));
  return !modal.includes('indicative-strip');
})());
ok('the named rows ride the memoized derivation', row.includes('items={restockItems}') && row.includes('const restockItems = useMemo('));
ok('stock rows memoized', row.includes('const stockRows = useMemo(() => watchlist?.map((p) => ({ ...p, coverage: stockCoverage(p) })) ?? null, [watchlist]);'));
ok('the memo hooks are imported (the live-QA catch)', row.includes("import { useMemo, useState } from 'react';"));

console.log('— the test + counter anchors —');
ok('the v2218 test file speaks the scope', fullTest.includes('the restock dialog wears an honest scope pair (v2.218.0)'));
ok('the bridge pins read the evolved law', bridgeTest.includes("expect(dialog.includes('?? seededLine(item)')).toBe(true);"));
ok('the muted counter re-anchored 62', vatTest.includes('expect(kpi.match(/text-slate-500 dark:text-slate-400/g)?.length).toBe(62);'));
ok('the changelog anchors re-anchored 142', changelogTest.includes("expect(whatsNewUnreadCount('2.77.0')).toBe(142);"));

console.log('— the release face —');
ok('package.json version 2.218.0', pkg.version === '2.218.0');
ok('package.json releaseVersion 2.218.0', pkg.mbumah?.releaseVersion === '2.218.0');
ok('package.json baseVersion 2.218.0', pkg.mbumah?.baseVersion === '2.218.0');
ok('VERSION 2.218.0', version === '2.218.0');
ok('whats-new entry at the head', whatsNew.includes("version: '2.218.0',") && whatsNew.includes("title: 'The full restock',"));
ok('changelog entry leads', changelog.includes('## [2.218.0] The full restock') && changelog.indexOf('2.218.0') < changelog.indexOf('2.217.0'));
ok('verify gate wired', pkg.scripts['verify:v2-218-0'] === 'node scripts/verify-v2-218-0.mjs');

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
