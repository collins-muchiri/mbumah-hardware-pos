#!/usr/bin/env node
// verify-v2-316-0.mjs — the round's FEATURE gate (v2.316.0 "the sweep's counts walk to the ledger").
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
const card = read('src/components/workspace/org-console.tsx');
const pkg = JSON.parse(read('package.json'));
const docs = read('docs/cron-operations.md');
const test = read('src/tests/expiry-ledger-link-v2316.test.ts');
const whatsNew = read('src/lib/whats-new.ts');

console.log('— the ?type= vocabulary (tab-url.ts) —');
ok('parseInitialType exists with the validated-fallback signature', tabUrl.includes('export function parseInitialType<V extends string>(') && tabUrl.includes('validTypes: readonly V[],') && tabUrl.includes('fallback: V,'));
ok('it reads the type param and answers the fallback on unknown/missing', tabUrl.includes("const type = toParams(search).get('type');") && tabUrl.includes('return fallback;'));
ok('the module doc names the deep-link contract', tabUrl.includes("since v2.316.0 the ledger's type filter") && tabUrl.includes('?type=EXPIRE'));

console.log('— the desk seeds its filter (loyalty-tab.tsx) —');
ok('the type parser joins the view parser\u2019s import', loyaltyTab.includes("import { parseInitialType, parseInitialView } from '@/lib/tab-url';"));
ok('the register is the SAME five types the Select offers', loyaltyTab.includes("['EARN', 'REDEEM', 'BONUS', 'EXPIRE', 'ADJUST']") && loyaltyTab.includes('<SelectItem value="EXPIRE">Expire</SelectItem>'));
ok('the SSR guard answers "all" (no window, no filter)', loyaltyTab.includes("if (typeof window === 'undefined') return 'all';"));
ok('the filter state seeds lazily from the address bar', loyaltyTab.includes('useState<string>(initialTxTypeFilter)') && loyaltyTab.includes("parseInitialType(window.location.search, LOYALTY_TX_TYPES, 'all')"));
ok('the one-writer-per-param law is written where the next reader meets it', loyaltyTab.includes('one-writer-per-param law as') && loyaltyTab.includes('v2.316.0'));

console.log('— the card face (org-console.tsx) —');
ok('ONE door: the EXPIRE-filtered ledger deep-link constant', card.includes("const EXPIRY_LEDGER_HREF = '/?tab=loyalty&view=transactions&type=EXPIRE';") && (card.split('EXPIRY_LEDGER_HREF').length - 1) === 3);
ok('both voices are hard-navigation anchors (the racy transition retired)', card.includes('<a\n              href={EXPIRY_LEDGER_HREF}\n              data-testid="automation-expiry-run-counts"') && card.includes('<a\n              href={EXPIRY_LEDGER_HREF}\n              data-testid="automation-expiry-run-clean"') && card.includes('THE HARD-NAVIGATION LAW'));
ok('the v2.315 amber survives the link wardrobe', card.includes('font-medium tabular-nums text-amber-700 dark:text-amber-400') && card.includes('h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-400'));
ok('the healthy zero keeps its voice', card.includes('nothing to expire'));
ok('the link affordance: amber underline + hover deepen', card.includes('underline decoration-amber-600/40 underline-offset-2') && card.includes('hover:decoration-amber-600') && card.includes('hover:text-amber-800 dark:hover:text-amber-300'));
ok('the keyboard focus ring is the Expiry desk\u2019s own amber', card.includes('focus-visible:outline-none focus-visible:ring-2') && card.includes('focus-visible:ring-amber-400/70'));
ok('the link says where it goes (tooltip)', (card.match(/title="Open the loyalty ledger, filtered on Expire rows"/g) || []).length === 2);
ok('the both-mounts law still holds (one render function, two doors)', (card.split('function expiryRunLine(').length - 1) === 1 && (card.split('expiryRunLine(automation.lastExpiryRun)').length - 1) === 2);

console.log('— the housekeeping —');
ok('the stale top-level 2.267.0 keys are GONE', !('releaseVersion' in pkg) && !('baseVersion' in pkg));
ok('the LIVE keys live under mbumah. and answer 2.316.0', pkg.mbumah?.releaseVersion === '2.316.0' && pkg.mbumah?.baseVersion === '2.316.0');
ok('the docs register carries the deep-link note', docs.includes("**v2.316.0**: the sweep line's voices deep-link to the ledger") && docs.includes('/?tab=loyalty&view=transactions&type=EXPIRE'));

console.log('— the truth table + release voice —');
ok('the test file pins the truth table (lowercase, unknown, malformed, view-rides)', test.includes("parseInitialType('?type=expire', TYPES, 'all')") && test.includes("parseInitialType('??=//%', TYPES, 'all')") && test.includes("expect(parseInitialView(search, ['tiers', 'members', 'transactions', 'campaigns'], 'tiers')).toBe('transactions');"));
ok('whats-new leads with the round\u2019s story', whatsNew.includes("version: '2.316.0',") && whatsNew.includes('The sweep\\u2019s counts walk to the ledger'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
