#!/usr/bin/env node
// verify-v2-270-0.mjs — the round's gate (v2.270.0 "the lens finds the bell").
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const roster = read('src/app/(shell)/hr/employees/page.tsx');
const homeView = read('src/app/(selfservice)/employees/me/home-view.tsx');
const portalHome = read('src/app/(selfservice)/employees/me/page.tsx');
const tabs = read('src/app/(selfservice)/employees/me/self-service-tabs.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('pkg version = 2.270.0', pkg.version === '2.270.0');
ok('pkg releaseVersion = 2.270.0', pkg.mbumah?.releaseVersion === '2.270.0');
ok('pkg baseVersion = 2.270.0', pkg.mbumah?.baseVersion === '2.270.0');
ok('VERSION = 2.270.0', version === '2.270.0');
ok('whats-new lead = 2.270.0 with the round\u2019s title', feed.includes("version: '2.270.0',") && feed.includes('The lens finds the bell'));
const leadIdx = feed.indexOf("version: '2.270.0',");
const pairIdx = feed.indexOf("version: '2.269.0',");
ok('whats-new pair order (lead 2.270.0 before pair 2.269.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.270.0]', changelog.includes('## [2.270.0] The lens finds the bell'));

console.log('— the lens finds the bell (roster, fourth face) —');
ok('the toggle exists — testid + aria-pressed + label', roster.includes('data-testid="hr-employees-linked-toggle"') && roster.includes('aria-pressed={linkedOnly}') && roster.includes('Portal linked'));
ok('the pressed face is emerald + the ring follows', roster.includes("'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'") && roster.includes('focus-visible:ring-emerald-400'));
ok('the expiring lens keeps its amber (one color, one meaning)', roster.includes("'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300'") && roster.includes('focus-visible:ring-amber-400'));
ok('the seed + the mirror + the clear + the count', roster.includes("useState(linkLinked === '1')") && roster.includes("sp.set('linked', '1')") && roster.includes('setLinkedOnly(false);') && roster.includes('(expiringOnly ? 1 : 0) + (linkedOnly ? 1 : 0)'));
ok('the visible list narrows what the roster holds — client-side', roster.includes('const visibleRows = rows && linkedOnly ? rows.filter((r) => r.portalLinked) : rows;') && !roster.includes("params.set('linked'"));
ok('the bell reads the rows standing in the table', roster.includes('{(visibleRows ?? []).filter((r) => r.portalLinked).length}') && roster.includes('of {(visibleRows ?? []).length} linked') && roster.includes('the count reads the rows standing in the table.'));
ok('the roster count reads the visible list', roster.includes("{(visibleRows ?? []).length} {(visibleRows ?? []).length === 1 ? 'employee' : 'employees'}"));
ok('the table + the cards render the visible list (exactly two maps)', (roster.match(/\{visibleRows\.map\(\(r\) => \(/g) || []).length === 2 && roster.includes('rows && visibleRows && visibleRows.length > 0'));
ok('the empty card speaks the lens honestly', roster.includes('No employees on this roster hold a linked portal login.') && roster.includes('Settings \u2192 Users holds that door; the Portal column keeps its honest dash meanwhile.'));
ok('the page description learned the fourth lens', roster.includes('follow the expiring-document trail, and find the portal-linked.'));

console.log('— the hero answers back (portal home) —');
ok('the voice type + the optional prop', homeView.includes('export interface LinkedLoginVoice') && homeView.includes('linkedLogin?: LinkedLoginVoice;'));
ok('the voice row — testid + hairline + the roster\u2019s emerald', homeView.includes('data-testid="selfservice-hero-linked"') && homeView.includes('"mt-3 flex items-center gap-2 border-t border-black/5 pt-2.5 dark:border-white/10"') && homeView.includes('border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'));
ok('the words land where they are true', homeView.includes('linked login') && homeView.includes('\u2014 the login HR linked to') && homeView.includes('this profile; leave and payroll notices land here.'));
ok('the portal home passes the session\u2019s own identity', portalHome.includes('linkedLogin={{ email: guard.session.email, role: guard.session.role }}'));

console.log('— the ancestors —');
ok('the v2.269.0 wayfinding bytes stand', tabs.includes('aria-current={active ? \'page\' : undefined}') && (tabs.match(/aria-current=\{active \? 'page' : undefined\}/g) || []).length === 2);
ok('the v2.268.0 bell bytes stand', roster.includes('data-testid="hr-employees-portal-chip"') && roster.includes('data-testid="hr-employees-portal-silent"'));
ok('the v2.267.0 keystone testids stand', read('src/app/(shell)/hr/employees/[id]/page.tsx').includes('data-testid="portal-account-card"'));

console.log(`\nverify v2.270.0: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
