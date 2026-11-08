#!/usr/bin/env node
// verify-v2-291-0.mjs — the round's gate (v2.291.0 "The HR shell boots its session; the badge opens the unread list").
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
const lib = read('src/lib/notification-filter.ts');
const center = read('src/components/notification-center.tsx');
const hrbell = read('src/components/layout/hr-shell-bell.tsx');
const sidebar = read('src/components/layout/app-sidebar.tsx');
const badge = read('src/components/layout/notification-badge-button.tsx');
const boot = read('src/components/layout/hr-auth-boot.tsx');
const hrlayout = read('src/app/(shell)/hr/layout.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/hr-boot-badge-deeplink-v291.test.ts');

console.log('— the release face —');
ok('pkg version = 2.291.0 (all three slots)', pkg.version === '2.291.0' && pkg.mbumah?.releaseVersion === '2.291.0' && pkg.mbumah?.baseVersion === '2.291.0');
ok('VERSION = 2.291.0', version === '2.291.0');
ok('whats-new lead = 2.291.0 with the round\u2019s title', feed.includes("version: '2.291.0',") && feed.includes('The HR shell boots its session; the badge opens the unread list'));
const leadIdx = feed.indexOf("version: '2.291.0',");
const pairIdx = feed.indexOf("version: '2.290.0',");
ok('whats-new pair order (lead 2.291.0 before pair 2.290.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.291.0]', changelog.includes('## [2.291.0] The HR shell boots its session; the badge opens the unread list'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-291-0'] === 'node scripts/verify-v2-291-0.mjs' && pkg.scripts['verify:v2-290-0'] === 'node scripts/verify-v2-290-0.mjs');

console.log('— the HR shell boots its session (the hydration gap closes) —');
ok('the HR layout mounts the boot island', hrlayout.includes("import { HrAuthBoot } from '@/components/layout/hr-auth-boot'") && hrlayout.includes('<HrAuthBoot />'));
ok('the island speaks the SHARED boot, never a copy', boot.includes("import { useWorkspaceAuthBoot } from '@/lib/workspace/workspace-store'") && boot.includes('useWorkspaceAuthBoot();'));
ok('the island renders null and smuggles nothing', boot.includes('return null;') && !boot.includes('localStorage.') && !boot.includes('document.cookie') && !boot.includes('fetch('));
ok('the Security gate still reads the REAL role from the auth store', center.includes("const role = useAuthStore((s) => s.user?.role || '');") && center.includes('const canSeeSecurity = SECURITY_TAB_ROLES.includes(role);'));

console.log('— the badge is a door of its own —');
ok('the badge component is a real button with the dialog contract', badge.includes('<button') && badge.includes('type="button"') && badge.includes('aria-haspopup="dialog"') && badge.includes('data-testid="notification-unread-badge"'));
ok('the aria-label names the DESTINATION', badge.includes('aria-label={`${count} unread — open the unread list`}'));
ok('the title tooltip carries the singular/plural law', badge.includes("title={`Open the ${count} unread notification${count === 1 ? '' : 's'}`}"));
ok('the keyboard-first ring lands on the pill', badge.includes('focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'));
ok('the contrast tokens are load-bearing (v2.148.0 rides in)', badge.includes("'bg-red-600 text-white'") && badge.includes("'bg-amber-500 text-slate-950'"));
ok('the 99+ clamp and the bounce-in live in one place', badge.includes("{count > 99 ? '99+' : count}") && badge.includes('animate-badge-bounce-in'));
ok('two faces: compact pill + default pill', badge.includes("'min-w-[14px] h-3.5 text-[8px] px-0.5'") && badge.includes("'min-w-[16px] h-4 text-[9px] px-1'"));

console.log('— every bell mounts the same badge —');
ok('the HR bell imports the shared badge and threads its lens', hrbell.includes("import { NotificationBadgeButton } from '@/components/layout/notification-badge-button'") && hrbell.includes('initialFilter={openLens}'));
ok('the sidebar imports the shared badge and threads its lens to ONE center', sidebar.includes("import { NotificationBadgeButton } from '@/components/layout/notification-badge-button'") && sidebar.includes('initialFilter={notificationLens}') && (sidebar.match(/<NotificationCenter/g) || []).length === 1);
ok('both sidebar rails mount the badge, compact on the collapsed rail', (sidebar.match(/<NotificationBadgeButton/g) || []).length === 2 && sidebar.includes('size="compact"'));
ok('the doors ask different lenses: bell undefined, badge unread', (sidebar.match(/setNotificationLens\(undefined\); setNotificationOpen\(true\);/g) || []).length === 3 && (sidebar.match(/setNotificationLens\('unread'\); setNotificationOpen\(true\);/g) || []).length === 2);
ok('the HR bell\u2019s doors and hotkey ask their lenses', hrbell.includes("onOpenUnread={() => { setOpenLens('unread'); setOpen(true); }}") && hrbell.includes('useNotificationHotkey(useCallback(() => { setOpenLens(undefined); setOpen(true); }, []));'));
ok('THE DOM LAW: siblings in relative wrappers, never nested buttons', (hrbell.match(/<div className="relative shrink-0">/g) || []).length === 1 && sidebar.includes('<div className="relative shrink-0">') && sidebar.includes('<div className="relative">'));
ok('THE INLINE SPAN BADGES ARE DEAD', !hrbell.includes('data-testid="hr-shell-bell-badge"') && !hrbell.includes('animate-badge-bounce-in') && !sidebar.includes('animate-badge-bounce-in') && !sidebar.includes('text-[9px] font-bold px-1'));

console.log('— the opener\u2019s lens law (pure, runtime-pinned) —');
ok('the law lives in the lens lib and returns the null spectator', lib.includes('export function openerLensFilter(') && lib.includes('NotificationFilter | null'));
ok('the center imports the law and wires it through the open ref', center.includes("import { applyNotificationFilter, openerLensFilter, type NotificationFilter } from '@/lib/notification-filter';") && center.includes('const lens = openerLensFilter(open, wasOpen, initialFilter);') && center.includes('if (lens) setFilter(lens);'));
ok('the prop is additive and optional', center.includes('  initialFilter?: NotificationFilter;'));

console.log('— the suite (both nets) —');
ok('the suite truth-tables the open transition (badge lands on unread)', test.includes("expect(openerLensFilter(true, false, 'unread')).toBe('unread');"));
ok('the suite pins the spectator rule (an open sheet is never clobbered)', test.includes("expect(openerLensFilter(true, true, 'unread')).toBeNull();"));
ok('the suite pins the boot island and the dead inline badges', test.includes("expect(boot).not.toContain('localStorage.')") && test.includes("expect(hrbell).not.toContain('data-testid=\"hr-shell-bell-badge\"')"));

console.log(`\nverify-v2-291-0: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
