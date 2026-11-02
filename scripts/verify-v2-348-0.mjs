#!/usr/bin/env node
// verify-v2-348-0.mjs — the round's FEATURE gate (v2.348.0 "the field-level
// casts census, three doors speak the wire"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
// Run BEFORE the walk; the walk-dependent pins sit in their own tail
// section (green after walk-v2348).
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

/** The field-level cast tokens the census dissolved. `as const` is NOT one. */
const castTokens = (src) =>
  ['as string', 'as number', 'as {'].filter((t) =>
    src
      .split('\n')
      .filter((l) => !l.includes('as const'))
      .join('\n')
      .includes(t)
  );

const products = read('src/app/api/products/[id]/route.ts');
const disburse = read('src/app/api/payroll/runs/[id]/disburse-mpesa/route.ts');
const callback = read('src/app/api/payments/mpesa/callback/route.ts');
const modal = read('src/components/rbac/manager-authorization-modal.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const test = read('src/tests/field-casts-v2348.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the three doors speak the wire —');
ok('THE PRODUCTS DOOR SPEAKS THE OVERRIDE: the generic names managerOverride',
  products.includes('managerOverride?: {')
  && products.includes('[key: string]: unknown;')
  && products.includes('? body.managerOverride'));
ok('THE PRODUCTS TOMBSTONE: zero field-level cast tokens',
  castTokens(products).length === 0);
ok('THE DISBURSE DOOR KEEPS THE RECORD: readJson + the honest narrowing',
  disburse.includes('const body = await readJson(request);')
  && disburse.includes("(await readJson(request)) as") === false
  && disburse.includes("body.mode === 'retry-failed' || body.mode === 'refresh-stuck' ? body.mode : 'all'"));
ok('THE RAW LIST IS unknown[] with the undefined preservation',
  disburse.includes('const rawDetailIds: unknown[] = Array.isArray(body.detailIds) ? body.detailIds : [];')
  && disburse.includes('.slice(0, 50)'));
ok('THE flatMap VOICE: one expression owns the narrowing',
  disburse.includes('.flatMap((r) =>')
  && disburse.includes("? [{ detailId: r.detailId, receipt: r.receipt ?? null }]"));
ok('THE DISBURSE TOMBSTONE: zero field-level cast tokens',
  castTokens(disburse).length === 0);
ok('THE CALLBACK BAG IS TYPED: the union the interface declared',
  callback.includes('const metadata: Record<string, string | number> = {};')
  && callback.includes('if (item.Value !== undefined) metadata[item.Name] = item.Value;'));
ok('THE FOUR READS ASK typeof + the finite amount',
  callback.includes("typeof metadata.MpesaReceiptNumber === 'string' ? metadata.MpesaReceiptNumber : ''")
  && callback.includes("typeof metadata.Amount === 'number' && Number.isFinite(metadata.Amount)"));
ok('THE CALLBACK TOMBSTONE: zero field-level cast tokens',
  castTokens(callback).length === 0);
ok('THE MODAL SPEAKS ITS CONTRACT: the wipe voice, the audit voice, the counter',
  modal.includes('data-testid="manager-auth-password-voice"')
  && modal.includes('data-testid="manager-auth-audit-voice"')
  && modal.includes('data-testid="manager-auth-reason-count"')
  && modal.includes('{reasonText.length}/500'));
ok('THE MODAL WEARS THE DARK WARDROBE',
  modal.includes('dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300')
  && modal.includes('dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'));
ok('the era test carries the census (11 pins, the OD law)',
  test.includes('THE CALLBACK BAG IS TYPED') && test.includes('THE flatMap VOICE')
  && test.includes('THE CENSUS IS HONEST ABOUT ITS SCOPE'));

console.log('— the release mechanics —');
ok('VERSION + package.json slots at 2.348.0',
  read('VERSION').trim() === '2.348.0'
  && pkg.version === '2.348.0'
  && pkg.mbumah.releaseVersion === '2.348.0'
  && pkg.mbumah.baseVersion === '2.348.0');
ok('the whats-new entry rides the feed',
  whatsNew.includes("version: '2.348.0',")
  && whatsNew.includes("title: 'The field-level casts census, three doors speak the wire',"));
ok('the changelog leads with the round',
  changelog.startsWith('## [2.348.0] The field-level casts census, three doors speak the wire\n'));
ok('verify:v2-348-0 is wired',
  (pkg.scripts['verify:v2-348-0'] || '').includes('verify-v2-348-0.mjs'));

console.log('— the walk-dependent pins (green after walk-v2348) —');
ok('the unread-counter cascade landed (239/240/241/272)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(239)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(240)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(241)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(272)"));
ok('the history line rides the cascade block',
  changelogTest.includes('v2.348.0: the casts-census entry joins the feed'));

console.log(`\nverify-v2-348-0: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
