#!/usr/bin/env node
// verify-v2-290-0.mjs — the round's gate (v2.290.0 "The feed learns its unread lens").
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
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/notification-unread-lens-v290.test.ts');

console.log('— the release face —');
ok('pkg version = 2.290.0 (all three slots)', pkg.version === '2.290.0' && pkg.mbumah?.releaseVersion === '2.290.0' && pkg.mbumah?.baseVersion === '2.290.0');
ok('VERSION = 2.290.0', version === '2.290.0');
ok('whats-new lead = 2.290.0 with the round\u2019s title', feed.includes("version: '2.290.0',") && feed.includes('The feed learns its unread lens'));
const leadIdx = feed.indexOf("version: '2.290.0',");
const pairIdx = feed.indexOf("version: '2.289.0',");
ok('whats-new pair order (lead 2.290.0 before pair 2.289.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.290.0]', changelog.includes('## [2.290.0] The feed learns its unread lens'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-290-0'] === 'node scripts/verify-v2-290-0.mjs' && pkg.scripts['verify:v2-289-0'] === 'node scripts/verify-v2-289-0.mjs');

console.log('— the lens lib (one vocabulary, the pure predicate) —');
ok("the union carries 'unread' between 'all' and 'critical'", lib.includes("| 'all'") && lib.indexOf("| 'unread'") > -1 && lib.indexOf("| 'unread'") < lib.indexOf("| 'critical'"));
ok('the no-ledger refusal is written, not accidental', lib.includes('if (!readIds) return [...items];'));
ok("unread answers from the caller's read ledger", lib.includes('items.filter((n) => !readIds.has(n.id))'));
ok('the security lens keeps the v2.12.7 law', lib.includes("n.category === 'SECURITY' || n.type === 'security'"));
ok('the email_failed lens rides the shared v2.57.0 predicate', lib.includes('isFailedEmailDigest') && lib.includes("from '@/lib/hr/digest-notification-view'"));

console.log('— the feed wiring (the component speaks the lib) —');
ok('the component imports the lens lib — type and predicate both', center.includes("import { applyNotificationFilter, type NotificationFilter } from '@/lib/notification-filter';"));
ok('the local type copy is dead', !/^type NotificationFilter =/m.test(center));
ok('both lists speak the SAME predicate, ledger handed to both', center.includes('applyNotificationFilter(filter, activeNotifications, readIds)') && center.includes('applyNotificationFilter(filter, dismissedNotifications, readIds)'));
ok("the Unread chip is the SECOND chip with the badge's own count", center.indexOf("{ id: 'unread', label: 'Unread', count: unreadCount }") > center.indexOf("{ id: 'all', label: 'All'") && center.indexOf("{ id: 'unread', label: 'Unread', count: unreadCount }") < center.indexOf("{ id: 'critical', label: 'Critical'"));
ok("the dot wears the row's language, contrast held when active", center.includes("filter === tab.id ? 'bg-primary-foreground' : 'bg-primary'") && center.includes("{tab.id === 'unread' && ("));
ok('EVERY chip is an aria-pressed toggle', center.includes('aria-pressed={filter === tab.id}'));
ok('the keyboard-first ring lands on the filter row', center.includes('focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1'));
ok('the live shed is real: markRead still fires on click', center.slice(center.indexOf('const handleNotificationClick'), center.indexOf('const handleManageSchedule')).includes('markRead(notification.id);'));
ok('both shells mount the same center (the lens lands everywhere)', hrbell.includes('NotificationCenter'));

console.log('— the suite (both nets) —');
ok('the suite truth-tables the unread subsets', test.includes("expect(out.map((n) => n.id)).toEqual(['n2', 'n5']);") && test.includes("expect(out.map((n) => n.id)).toEqual(['n1', 'n2', 'n3', 'n4', 'n5']);"));
ok('the suite pins the no-ledger refusal BY VALUE', test.includes('it(\'no ledger handed in: the lens returns the rows unchanged — it never invents a read state\''));
ok('the suite pins the caught-up moment (full ledger empties the lens)', test.includes('a ledger that has seen everything empties the lens'));
ok('the suite pins the chip order and the aria-pressed law', test.includes("{ id: 'unread', label: 'Unread', count: unreadCount }") && test.includes('aria-pressed={filter === tab.id}'));

console.log(`\nverify-v2-290-0: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
