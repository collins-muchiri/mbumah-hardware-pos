#!/usr/bin/env node
// verify-v2-269-0.mjs — the round's gate (v2.269.0 "the portal hears the release").
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
const layout = read('src/app/(selfservice)/employees/me/layout.tsx');
const groupLayout = read('src/app/(selfservice)/layout.tsx');
const tabs = read('src/app/(selfservice)/employees/me/self-service-tabs.tsx');
const dialog = read('src/components/whats-new-dialog.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const shell = read('src/components/app/main-app.tsx');
const consolePage = read('src/app/(shell)/console/page.tsx');

console.log('— the release face —');
ok('pkg version = 2.269.0', pkg.version === '2.269.0');
ok('pkg releaseVersion = 2.269.0', pkg.mbumah?.releaseVersion === '2.269.0');
ok('pkg baseVersion = 2.269.0', pkg.mbumah?.baseVersion === '2.269.0');
ok('VERSION = 2.269.0', version === '2.269.0');
ok('whats-new lead = 2.269.0 with the round\u2019s title', feed.includes("version: '2.269.0',") && feed.includes('The portal hears the release'));
const leadIdx = feed.indexOf("version: '2.269.0',");
const pairIdx = feed.indexOf("version: '2.268.0',");
ok('whats-new pair order (lead 2.269.0 before pair 2.268.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.269.0]', changelog.includes("## [2.269.0] The portal hears the release"));

console.log('— the portal hears the release —');
ok('the bare mount (one home, zero props, third surface)', layout.includes("import { WhatsNewDialog } from '@/components/whats-new-dialog';") && layout.includes('<WhatsNewDialog />') && (layout.match(/<WhatsNewDialog/g) || []).length === 1);
ok('the slim law holds (group layout is the provider boundary; no heavy runtime in the me-layout)', groupLayout.includes("import { SelfServiceProviders } from '@/lib/providers-selfservice';") && !layout.includes('useQuery') && !layout.includes("from '@/lib/stores'"));
ok('the shared seen-flag law untouched', dialog.includes("localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION);") && dialog.includes("localStorage.getItem(SEEN_VERSION_KEY) !== APP_VERSION"));
ok('the shell\u2019s bare mount + the console\u2019s hand stand byte-identical', shell.includes('<WhatsNewDialog />') && (shell.match(/<WhatsNewDialog/g) || []).length === 1 && consolePage.includes('<WhatsNewDialog onOpenChangelog={() => { setReleaseJump(APP_VERSION); setChangelogOpen(true); }} />'));

console.log('— the wayfinding one home —');
ok('the client component owns both navs', tabs.includes("'use client';") && tabs.includes("import { usePathname } from 'next/navigation';") && (tabs.match(/TABS\.map/g) || []).length === 2);
ok('the six destinations', ['/employees/me', '/employees/me/payslips', '/employees/me/attendance', '/employees/me/leave', '/employees/me/goals', '/employees/me/documents'].every((h) => tabs.includes(`href: '${h}'`)));
ok('the home answers exact, the leaves answer their subtree', tabs.includes("if (href === '/employees/me') return pathname === '/employees/me';") && tabs.includes("return pathname === href || pathname.startsWith(href + '/');"));
ok('aria-current on both navs', (tabs.match(/aria-current=\{active \? 'page' : undefined\}/g) || []).length === 2);
ok('the amber brand faces (mobile bar + desktop pill)', tabs.includes('bg-gradient-to-r from-amber-400 to-orange-500') && tabs.includes('bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 ring-1 ring-amber-200 dark:from-amber-950/40 dark:to-orange-950/40 dark:text-amber-200 dark:ring-amber-900'));
ok('the slim shell\u2019s own classes byte-kept', tabs.includes('fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden') && tabs.includes('sticky bottom-0 z-30 hidden justify-center gap-1 border-t bg-card/95 py-2 backdrop-blur md:flex'));
ok('the tab testids answer both navs', tabs.includes('data-testid={`selfservice-tab-${tab.label.toLowerCase()}`}') && tabs.includes('data-testid={`selfservice-tab-desktop-${tab.label.toLowerCase()}`}') && tabs.includes('data-testid="selfservice-tab-indicator"'));
ok('the layout retires the stateless navs', layout.includes('<SelfServiceTabs />') && !layout.includes('const TABS') && !layout.includes('aria-label="Self-service navigation"'));

console.log('— the ancestors —');
ok('the header/footer bytes stand', layout.includes('My Workspace | Mbumah Hardware') && layout.includes('Private to you') && layout.includes('Payslip figures stay available offline on this device once loaded.'));
ok('the v2.268.0 bell bytes stand', read('src/app/(shell)/hr/employees/page.tsx').includes('data-testid="hr-employees-portal-chip"'));
ok('the v2.267.0 portal testids stand', read('src/app/(shell)/hr/employees/[id]/page.tsx').includes('data-testid="portal-account-card"'));

console.log(`\nverify v2.269.0: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
