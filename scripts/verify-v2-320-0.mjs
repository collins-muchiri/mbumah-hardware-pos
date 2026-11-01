#!/usr/bin/env node
// verify-v2-320-0.mjs — the round's FEATURE gate (v2.320.0 "the ledger turns the page").
// The release MECHANICS (slots, VERSION, lead placement, CHANGELOG ordering,
// walk marks) live in verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const tabUrl = read('src/lib/tab-url.ts');
const loyaltyTab = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const pkg = JSON.parse(read('package.json'));
const docs = read('docs/cron-operations.md');
const test = read('src/tests/ledger-pager-v2320.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const trail2311 = read('src/tests/receipt-trail-v2311.test.ts');
const trail2316 = read('src/tests/expiry-ledger-link-v2316.test.ts');
const trail2317 = read('src/tests/expiry-day-window-v2317.test.ts');
const trail2318 = read('src/tests/expiry-window-dismiss-v2318.test.ts');

console.log('— the page vocabulary (tab-url.ts) —');
ok('parseInitialPage is exported with the shape law (digits only, >= 1)', tabUrl.includes('export function parseInitialPage(search: string, fallback = 1): number {') && tabUrl.includes('!/^\\d+$/.test(raw)'));
ok('the doc pins shape-not-existence and the collision check', tabUrl.includes('is SHAPE, not existence') && tabUrl.includes('fifth word after'));
ok('the never-strand fallback answers on garbage and on a malformed search', tabUrl.includes('return fallback;'));

console.log('— the desk (loyalty-tab.tsx) —');
ok('the seed is SSR-guarded and reads ?page=', loyaltyTab.includes('function initialTxPage(): number {') && loyaltyTab.includes("if (typeof window === 'undefined') return 1;") && loyaltyTab.includes('return parseInitialPage(window.location.search, 1);'));
ok('the page rides BOTH the query key and the wire', loyaltyTab.includes('txDateFrom, txDateTo, txPage]') && loyaltyTab.includes('page: txPage,'));
ok('the scope-reset law holds the FIRST scope (a deep-linked page survives the landing)', loyaltyTab.includes('const txScopeKey = `${txTypeFilter}|${txDateFrom}|${txDateTo}`;') && loyaltyTab.includes('const txPrevScopeKey = useRef(txScopeKey);') && loyaltyTab.includes('setTxPage(1);'));
ok('the census + status speak the WIRE voice', loyaltyTab.includes('data-testid="tx-census"') && loyaltyTab.includes('data-testid="pager-status"') && loyaltyTab.includes('Page {txData.pagination.page} of {txData.pagination.totalPages}'));
ok('the pager renders only when a second page exists', loyaltyTab.includes('txData.pagination.totalPages > 1'));
ok('the buttons carry aria-labels, testids, and honest disabled bounds', loyaltyTab.includes('data-testid="pager-prev"') && loyaltyTab.includes('data-testid="pager-next"') && loyaltyTab.includes('aria-label="Previous page"') && loyaltyTab.includes('aria-label="Next page"') && loyaltyTab.includes('disabled={txData.pagination.page <= 1}') && loyaltyTab.includes('disabled={txData.pagination.page >= txData.pagination.totalPages}'));
ok('the past-the-end empty is honest and offers the way back', loyaltyTab.includes('data-testid="pager-past-end"') && loyaltyTab.includes('data-testid="pager-back-to-one"') && loyaltyTab.includes('is past the end of this ledger'));
ok('the imports carry the fifth word, the chevrons, and the hooks', loyaltyTab.includes("import { buildSearchWithoutParams, parseInitialDateRange, parseInitialPage, parseInitialType, parseInitialView } from '@/lib/tab-url';") && loyaltyTab.includes('ChevronLeft, ChevronRight,') && loyaltyTab.includes("import React, { useEffect, useRef, useState } from 'react';"));

console.log('— the trail (the pin follows the import, not the round) —');
const evolved = "parseInitialDateRange, parseInitialPage, parseInitialType";
ok('the four earlier trail files wear the evolved import pin', trail2311.includes(evolved) && trail2316.includes(evolved) && trail2317.includes(evolved) && trail2318.includes(evolved));
ok('every evolution carries its trail note', trail2311.includes('v2.320.0 pin evolution') && trail2316.includes('v2.320.0 pin evolution') && trail2317.includes('v2.320 trail') && trail2318.includes('v2.320.0 pin evolution'));

console.log('— the housekeeping + release voice —');
ok('the docs register carries the pager note', docs.includes('**v2.320.0**: the ledger turns the page') && docs.includes('parseInitialPage'));
ok('the manifest answers 2.320.0 in all three slots', pkg.version === '2.320.0' && pkg.mbumah?.releaseVersion === '2.320.0' && pkg.mbumah?.baseVersion === '2.320.0');
ok('the test file pins the truth table (shape law, desk pager, honest empty, trails)', test.includes("parseInitialPage('?page=2')") && test.includes("parseInitialPage('?page=0')") && test.includes("parseInitialPage('?page=999999')") && test.includes('data-testid="pager-back-to-one"'));
ok('whats-new leads with the round\u2019s story', whatsNew.includes("version: '2.320.0',") && whatsNew.includes('The ledger turns the page'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
