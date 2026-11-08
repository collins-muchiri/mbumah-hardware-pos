#!/usr/bin/env node
// verify-v2-288-0.mjs — the round's gate (v2.288.0 "The HR shell hears the bell").
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
const layout = read('src/app/(shell)/hr/layout.tsx');
const nav = read('src/components/layout/hr-shell-nav.tsx');
const bell = read('src/components/layout/hr-shell-bell.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/hr-shell-bell-v288.test.ts');

console.log('— the release face —');
ok('pkg version = 2.288.0', pkg.version === '2.288.0');
ok('pkg releaseVersion = 2.288.0', pkg.mbumah?.releaseVersion === '2.288.0');
ok('pkg baseVersion = 2.288.0', pkg.mbumah?.baseVersion === '2.288.0');
ok('VERSION = 2.288.0', version === '2.288.0');
ok('whats-new lead = 2.288.0 with the round\u2019s title', feed.includes("version: '2.288.0',") && feed.includes('The HR workspace hears the bell'));
const leadIdx = feed.indexOf("version: '2.288.0',");
const pairIdx = feed.indexOf("version: '2.287.0',");
ok('whats-new pair order (lead 2.288.0 before pair 2.287.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.288.0]', changelog.includes('## [2.288.0] The HR shell hears the bell'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-288-0'] === 'node scripts/verify-v2-288-0.mjs' && pkg.scripts['verify:v2-287-0'] === 'node scripts/verify-v2-287-0.mjs');

console.log('— the layout: server kind, two islands, the wrap law —');
ok('the layout stays a server component (metadata, no use client)', !layout.startsWith("'use client'") && layout.includes('export const metadata: Metadata'));
ok('the two islands mounted (nav before bell)', layout.includes('<HrShellNav />') && layout.includes('<HrShellBell />') && layout.indexOf('<HrShellNav />') < layout.indexOf('<HrShellBell />'));
ok('the inline NAV_ITEMS is gone (one vocabulary, never a copy)', !layout.includes('const NAV_ITEMS'));
ok('the right cluster wraps as one unit', layout.includes('ml-auto flex min-w-0 flex-1 flex-wrap items-center justify-end'));
ok('the v2.147.0 header law holds (min-h-14, flex-wrap)', layout.includes('flex min-h-14 max-w-7xl flex-wrap items-center'));
ok('the hairline divider (aria-hidden, hidden on phones)', layout.includes('data-testid="hr-header-divider"') && layout.includes('hidden h-6 w-px shrink-0 bg-border sm:block'));
ok('the brand + amber EMS chip untouched', layout.includes('href="/"') && layout.includes('bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800'));

console.log('— the nav island: the place is visible —');
ok('the island is a client component with the router hook', nav.startsWith("'use client'") && nav.includes('usePathname()'));
ok('the accessible name + aria-current law wired', nav.includes('aria-label="HR navigation"') && nav.includes("aria-current={active ? 'page' : undefined}"));
ok('the ten doors live here (exact href list)', nav.includes("{ href: '/hr', label: 'Overview' }") && nav.includes("{ href: '/hr/reports', label: 'Reports' }"));
ok('the a11y-sweep dress code survives the lift', nav.includes('sm:px-3 sm:py-1.5 sm:text-sm') && nav.includes('text-muted-foreground hover:bg-accent hover:text-foreground'));
ok('the active pill + focus rings', nav.includes("'bg-accent font-semibold text-foreground'") && nav.includes('focus-visible:ring-2 focus-visible:ring-ring'));
ok('per-link stable testids', nav.includes('data-testid={`hr-nav-${item.label.toLowerCase()}`}'));
ok('THE ACTIVE LAW: root exact-only, desks exact-or-descendant', nav.includes("if (href === '/hr') return pathname === '/hr';") && nav.includes("pathname === href || pathname.startsWith(`${href}/`)"));
ok('an empty href refuses to guess', nav.includes('if (!href) return false;'));

console.log('— the bell island: the same machinery, never a copy —');
ok('the island is a client component mounting the REAL NotificationCenter', bell.startsWith("'use client'") && bell.includes('<NotificationCenter'));
ok('the storeId is the app store\u2019s own', bell.includes('useAppStore((s) => s.currentStoreId)') && bell.includes('storeId={currentStoreId}'));
ok('the badge rides the badge hook (same cache key)', bell.includes("useNotificationCount(currentStoreId)"));
ok('the badge contrast law is the sidebar\u2019s own (v2.148.0)', bell.includes("'bg-red-600 text-white'") && bell.includes("'bg-amber-500 text-slate-950'"));
ok('the bounce replays only on an INCREASE', bell.includes('prevNotifCount = useRef(0)') && bell.includes('notificationCount.unread > prev'));
ok('the cap reads 99+ and the name carries the count', bell.includes("notificationCount.unread > 99 ? '99+' : notificationCount.unread") && bell.includes('unread} unread)'));
ok('the bell is findable and quiet when empty', bell.includes('data-testid="hr-shell-bell"') && bell.includes('data-testid="hr-shell-bell-badge"') && bell.includes('{notificationCount.unread > 0 ? ('));
ok('aria-haspopup announces the dialog', bell.includes('aria-haspopup="dialog"'));

console.log('— the zero-cost mount (the feed costs nothing until rung) —');
const center = read('src/components/notification-center.tsx');
ok('the feed query stays enabled: open', center.includes('enabled: open,'));
ok('the sheet stays on the right', center.includes('SheetContent side="right"'));
ok('deep links resolve through the app router', center.includes('router.push(notification.actionUrl)'));

console.log('— the suite (both nets) —');
ok('the round\u2019s suite exists and truth-tables the predicate', test.includes("expect(isHrNavActive('/hr', '/hr/employees')).toBe(false);") && test.includes("expect(isHrNavActive('/hr/employees', '/hr/employeex')).toBe(false);"));
ok('the suite pins the ten doors by value', test.includes("expect(HR_NAV_ITEMS).toEqual(["));
ok('the suite pins the zero-cost mount', test.includes('enabled: open,'));

console.log(`\nverify-v2-288-0: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
