#!/usr/bin/env node
// verify-v2-323-0.mjs — the round's FEATURE gate (v2.323.0 "the roster joins the truth").
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

const route = read('src/app/api/purchase-orders/route.ts');
const tab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const loyalty = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const test = read('src/tests/po-census-truth-v2323.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const docs = read('docs/cron-operations.md');

console.log('— the door (api/purchase-orders/route.ts) —');
ok('page reads through parsePositiveIntParam, limit through parseClampedIntParam',
  route.includes("parsePositiveIntParam(searchParams.get('page'), 1)") && route.includes("parseClampedIntParam(searchParams.get('limit'), 50, 1, 200)"));
ok('the raw parseInt door is GONE (code lines)', !route.includes('const page = parseInt(') && !route.includes('const limit = parseInt('));
ok('the 500 proof is written where the next reader meets it', route.includes('THE DOOR IS HONEST ABOUT ITS NUMBERS') && route.includes('?page=abc'));
ok('the take stays bounded in the query', route.includes('take: limit,'));

console.log('— the census never lies (purchase-orders-tab.tsx) —');
ok('the truth-conditional exists: page > totalPages renders the empty census',
  tab.includes('page > pagination.totalPages') && tab.includes('data-testid="po-census-empty"'));
ok('the honest line speaks the roster\u2019s own total', tab.includes('No rows on this page — the ledger ends at'));
ok('the empty census wears the desk voice (muted, tabular digits)',
  tab.includes('text-xs text-muted-foreground tabular-nums" data-testid="po-census-empty"'));
ok('the numeric census still speaks on valid pages (end-guard intact)',
  tab.includes('data-testid="po-census"') && tab.includes('Math.min(page * limit, pagination.total)'));
ok('the lie is structurally gone: "Showing" lives only in the page-valid arm',
  !tab.slice(tab.indexOf('data-testid="po-census-empty"'), tab.indexOf('data-testid="po-census"')).includes('Showing'));

console.log('— the honest empty (the v2.320 law, ported) —');
ok('the past-the-end face says where the orders went', tab.includes('data-testid="po-past-end"') && tab.includes('is past the end of this ledger'));
ok('the way back is one press', tab.includes('data-testid="po-back-to-one"') && tab.includes('onClick={() => setPage(1)}'));
ok('the face guards on the wire truth (total > 0 AND page outruns totalPages)',
  tab.includes('pagination && pagination.total > 0 && page > pagination.totalPages'));
ok('the generic empty keeps its own voices',
  tab.includes('No purchase orders found') && tab.includes('Try adjusting your filters or search terms') && tab.includes('Create your first purchase order to get started'));

console.log('— the a11y voice —');
ok('the pager buttons carry aria-labels and testids',
  tab.includes('aria-label="Previous page"') && tab.includes('aria-label="Next page"') && tab.includes('data-testid="po-pager-prev"') && tab.includes('data-testid="po-pager-next"') && tab.includes('data-testid="po-pager-status"'));
ok('the Next chevron is real — the rotate-180 hack is gone', tab.includes('<ChevronRight className="h-4 w-4" />') && !tab.includes('rotate-180'));
ok('the digits are tabular', tab.includes('text-sm px-2 tabular-nums"'));

console.log('— the house law: two desks speak the census truth —');
ok('loyalty spoke first (v2.322), the roster joins (v2.323)',
  loyalty.includes('THE CENSUS NEVER LIES') && tab.includes('THE CENSUS NEVER LIES'));

console.log('— the round\u2019s own test file —');
ok('the test file pins the door, the census, the face, the a11y, the house law',
  test.includes('parseClampedIntParam(\'5000\', 50, 1, 200)') && test.includes('data-testid="po-census-empty"') && test.includes('data-testid="po-past-end"') && test.includes('aria-label="Next page"') && test.includes('THE CENSUS NEVER LIES'));

console.log('— the release voice —');
ok('whats-new leads with the round\u2019s story', whatsNew.includes("version: '2.323.0',") && whatsNew.includes('The roster joins the truth') && whatsNew.includes('past the end of this ledger'));
ok('the CHANGELOG carries the round (Fixed + Styling + Tests)', changelog.includes('## [2.323.0] The roster joins the truth') && changelog.includes('THE DOOR IS HONEST ABOUT ITS NUMBERS') && changelog.includes('THE HONEST EMPTY'));
ok('the manifest answers 2.323.0 in all three slots', pkg.version === '2.323.0' && pkg.mbumah?.releaseVersion === '2.323.0' && pkg.mbumah?.baseVersion === '2.323.0');
ok('the docs register carries the roster note', docs.includes('**v2.323.0**') && docs.includes('the roster joins the truth'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
