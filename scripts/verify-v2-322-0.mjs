#!/usr/bin/env node
// verify-v2-322-0.mjs — the round's FEATURE gate (v2.322.0 "the census never lies").
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

const loyaltyTab = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const test = read('src/tests/ledger-census-truth-v2322.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const docs = read('docs/cron-operations.md');

console.log('— the census never lies (loyalty-tab.tsx) —');
ok('the truth-conditional exists: page > totalPages renders the empty census',
  loyaltyTab.includes('txData.pagination.page > txData.pagination.totalPages') && loyaltyTab.includes('data-testid="tx-census-empty"'));
ok('the honest line speaks the ledger\u2019s own total', loyaltyTab.includes('No rows on this page — the ledger ends at'));
ok('the empty census wears the desk voice (muted, tabular digits)',
  loyaltyTab.includes('text-xs text-muted-foreground tabular-nums" data-testid="tx-census-empty"'));
ok('the numeric census still speaks on valid pages (testid + start arithmetic intact)',
  loyaltyTab.includes('data-testid="tx-census"') && loyaltyTab.includes('Showing rows {((txData.pagination.page - 1) * txData.pagination.limit) + 1}'));
ok('the numeric census\u2019s end-guard is intact (Math.min with total)',
  loyaltyTab.includes('Math.min(txData.pagination.page * txData.pagination.limit, txData.pagination.total)'));
ok('the lie is structurally gone: "Showing rows" lives only in the page-valid arm',
  loyaltyTab.indexOf('data-testid="tx-census-empty"') < loyaltyTab.indexOf('data-testid="tx-census"')
  && loyaltyTab.slice(loyaltyTab.indexOf('data-testid="tx-census-empty"'), loyaltyTab.indexOf('data-testid="tx-census"')).includes('No rows on this page')
  && !loyaltyTab.slice(loyaltyTab.indexOf('data-testid="tx-census-empty"'), loyaltyTab.indexOf('data-testid="tx-census"')).includes('Showing rows'));
ok('the census note is written where the next reader meets it (801\u2013126 named)',
  loyaltyTab.includes('THE CENSUS NEVER LIES') && loyaltyTab.includes('801\u2013126'));

console.log('— the FAB band (geometry, not a race) —');
ok('the runway renders below the pager (aria-hidden, h-16 sm:h-14)',
  loyaltyTab.includes('<div aria-hidden className="h-16 sm:h-14" />'));
ok('the band note names the law and the Task 42 measurement',
  loyaltyTab.includes('THE FAB BAND') && loyaltyTab.includes('geometry, not a race'));
ok('the band follows the bar in source order',
  loyaltyTab.indexOf('data-testid="tx-pager"') > -1
  && loyaltyTab.indexOf('THE FAB BAND') > loyaltyTab.indexOf('data-testid="tx-pager"'));

console.log('— the neighbors keep their voice (v2.320/321 pins still stand) —');
ok('the past-the-end face is untouched', loyaltyTab.includes('data-testid="pager-past-end"') && loyaltyTab.includes('data-testid="pager-back-to-one"'));
ok('the wire-voice status is untouched', loyaltyTab.includes('Page {txData.pagination.page} of {txData.pagination.totalPages}'));
ok('the bounds and aria-labels are untouched', loyaltyTab.includes('disabled={txData.pagination.page <= 1}') && loyaltyTab.includes('disabled={txData.pagination.page >= txData.pagination.totalPages}') && loyaltyTab.includes('aria-label="Previous page"') && loyaltyTab.includes('aria-label="Next page"'));
ok('the scope-reset law and gait keys are untouched', loyaltyTab.includes('const txScopeKey = `${txTypeFilter}|${txDateFrom}|${txDateTo}|${txLimit}`;') && loyaltyTab.includes('txPrevScopeKey.current !== txScopeKey'));
ok('the pager still renders only when a second page exists', loyaltyTab.includes('txData.pagination.totalPages > 1'));

console.log('— the round\u2019s own test file —');
ok('the test file pins the truth-conditional and the honest text', test.includes('data-testid="tx-census-empty"') && test.includes('No rows on this page — the ledger ends at'));
ok('the test file pins the lie-is-gone structural arm', test.includes("censusArm.includes('Showing rows')") && test.includes("censusArm.includes('No rows on this page')"));
ok('the test file pins the FAB band placement', test.includes('THE FAB BAND') && test.includes('h-16 sm:h-14'));
ok('the test file re-pins the v2.320/321 neighbors', test.includes('aria-label="Next page"') && test.includes('const txScopeKey = `${txTypeFilter}|${txDateFrom}|${txDateTo}|${txLimit}`;'));

console.log('— the release voice —');
ok('whats-new leads with the round\u2019s story', whatsNew.includes("version: '2.322.0',") && whatsNew.includes('The census never lies') && whatsNew.includes('801\\u2013126'));
ok('the CHANGELOG carries the round (Fixed + Styling + Tests)', changelog.includes('## [2.322.0] The census never lies') && changelog.includes('THE CENSUS NEVER LIES') && changelog.includes('THE FAB BAND'));
ok('the manifest answers 2.322.0 in all three slots', pkg.version === '2.322.0' && pkg.mbumah?.releaseVersion === '2.322.0' && pkg.mbumah?.baseVersion === '2.322.0');
ok('the docs register carries the census note', docs.includes('**v2.322.0**') && docs.includes('census'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
