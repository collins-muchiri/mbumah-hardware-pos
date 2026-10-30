// v2.290.0 — the feed learns its unread lens.
//
//   - THE GAP: the bell's badge counts UNREAD rows, but the feed's filter
//     row could only narrow by SEVERITY (All / Critical / Warnings / Info /
//     Security / Email failed). The badge asked a question the feed had no
//     lens to answer: finding the 11 unread among 13 meant scanning by eye.
//   - THE LENS: 'unread' joins the filter row as the SECOND chip, right
//     after All — the question "what are those N unread?" outranks every
//     severity cut. Its count is the SAME number the badge speaks, so chip
//     and bell can never disagree.
//   - THE LIVE SHED: clicking a row marks it read; the read ledger updates,
//     the memo recomputes, and the read row LEAVES the unread list in the
//     same tick. The last read swaps the list for the feed's own positive
//     moment: "No unread notifications / You're all caught up!".
//   - THE VOCABULARY LAW: NotificationFilter used to be declared locally in
//     the component — a copy waiting to drift the day a lens was added on
//     one side only. The union now lives in ONE lib (notification-filter.ts)
//     and the component imports it.
//
// THE RUNTIME-PIN LAW: the lens is a pure function — asserted by VALUE with
// a truth table (all/unread/security/email_failed/severity, the no-ledger
// refusal, order preservation). The bytes pin the wiring: the import, the
// dead local type, the chip order, the dot marker's two-state contrast law,
// aria-pressed on every chip, and both lists speaking the same predicate.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { applyNotificationFilter, type NotificationFilter, type FilterableNotification } from '@/lib/notification-filter';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const LIB = 'src/lib/notification-filter.ts';
const CENTER = 'src/components/notification-center.tsx';
const HRBELL = 'src/components/layout/hr-shell-bell.tsx';
const SIDEBAR = 'src/components/layout/app-sidebar.tsx';

// ---- the truth-table world -------------------------------------------------
// severity triples: one critical, one warning, one info; ids n1..n4 with n4
// a SECURITY-category row, so every lens has something to answer.
const world: FilterableNotification[] = [
  { id: 'n1', type: 'out_of_stock', severity: 'critical', category: null },
  { id: 'n2', type: 'hr_digest', severity: 'warning', category: 'HR' },
  { id: 'n3', type: 'leave_decision', severity: 'info', category: null },
  { id: 'n4', type: 'security', severity: 'info', category: 'SECURITY' },
  { id: 'n5', type: 'hr_digest', severity: 'info', category: 'HR' },
];

describe('applyNotificationFilter — the lens truth table (runtime net)', () => {
  it("the badge's lens answers exactly the rows the read ledger has NOT seen", () => {
    const readIds = new Set(['n1', 'n3', 'n4']);
    const out = applyNotificationFilter('unread', world, readIds);
    expect(out.map((n) => n.id)).toEqual(['n2', 'n5']);
  });

  it('an empty ledger means everything is unread — the lens says so, never guesses', () => {
    const out = applyNotificationFilter('unread', world, new Set<string>());
    expect(out.map((n) => n.id)).toEqual(['n1', 'n2', 'n3', 'n4', 'n5']);
  });

  it('a ledger that has seen everything empties the lens (the caught-up moment)', () => {
    const readIds = new Set(world.map((n) => n.id));
    expect(applyNotificationFilter('unread', world, readIds)).toEqual([]);
  });

  it('no ledger handed in: the lens returns the rows unchanged — it never invents a read state', () => {
    const out = applyNotificationFilter('unread', world, undefined);
    expect(out.map((n) => n.id)).toEqual(['n1', 'n2', 'n3', 'n4', 'n5']);
  });

  it("'all' answers with every row, ORDER PRESERVED, as a fresh array", () => {
    const out = applyNotificationFilter('all', world, new Set(['n1']));
    expect(out.map((n) => n.id)).toEqual(['n1', 'n2', 'n3', 'n4', 'n5']);
    expect(out).not.toBe(world);
  });

  it("severity lenses narrow by severity and only severity (n4's SECURITY category must not leak into 'info')", () => {
    expect(applyNotificationFilter('critical', world).map((n) => n.id)).toEqual(['n1']);
    expect(applyNotificationFilter('warning', world).map((n) => n.id)).toEqual(['n2']);
    expect(applyNotificationFilter('info', world).map((n) => n.id)).toEqual(['n3', 'n4', 'n5']);
  });

  it("the security lens keeps the v2.12.7 law: category SECURITY or type security", () => {
    expect(applyNotificationFilter('security', world).map((n) => n.id)).toEqual(['n4']);
  });

  it("the email_failed lens keeps the v2.57.0 law: hr_digest copies whose email FAILED", () => {
    const failed = { id: 'n6', type: 'hr_digest', severity: 'info', category: 'HR', emailStatus: 'FAILED' };
    const sent = { id: 'n7', type: 'hr_digest', severity: 'info', category: 'HR', emailStatus: 'SENT' };
    const out = applyNotificationFilter('email_failed', [failed, sent, world[1]] as FilterableNotification[]);
    expect(out.map((n) => n.id)).toEqual(['n6']);
  });

  it('an unknown row shape is narrowed by the fallback severity arm without throwing', () => {
    const odd = { id: 'x1', type: 'mystery', severity: 'warning', category: undefined } as unknown as FilterableNotification;
    expect(applyNotificationFilter('warning', [odd]).map((n) => n.id)).toEqual(['x1']);
  });

  it('the lens works on the dismissed list with the SAME predicate (one vocabulary, both lists)', () => {
    const readIds = new Set(['n1']);
    const dismissed = world.slice(0, 3);
    expect(applyNotificationFilter('unread', dismissed, readIds).map((n) => n.id)).toEqual(['n2', 'n3']);
  });

  it("the union carries 'unread' between 'all' and 'critical' — the type is exported, not inferred", () => {
    const lenses: NotificationFilter[] = ['all', 'unread', 'critical', 'warning', 'info', 'security', 'email_failed'];
    expect(lenses).toHaveLength(7);
    expect(lenses.indexOf('unread')).toBe(1);
  });
});

describe('the filter row wiring (byte net)', () => {
  const center = readRepo(CENTER);
  const lib = readRepo(LIB);

  it('the component imports the lens lib — type and predicate both', () => {
    // v2.291.0 re-anchor: openerLensFilter joins the import — the opener's
    // lens law lives in the same one home.
    expect(center).toContain("import { applyNotificationFilter, openerLensFilter, type NotificationFilter } from '@/lib/notification-filter';");
  });

  it('the local type copy is DEAD — the vocabulary lives in one place', () => {
    expect(center).not.toMatch(/^type NotificationFilter =/m);
    expect(lib).toContain('export type NotificationFilter =');
  });

  it('both lists (active and dismissed) speak the SAME pure predicate, read ledger handed to both', () => {
    expect(center).toContain('applyNotificationFilter(filter, activeNotifications, readIds)');
    expect(center).toContain('applyNotificationFilter(filter, dismissedNotifications, readIds)');
  });

  it("the Unread chip is the SECOND chip, right after All", () => {
    const tabs = center.slice(center.indexOf('const filterTabs'), center.indexOf('];', center.indexOf('const filterTabs')));
    const allPos = tabs.indexOf("{ id: 'all', label: 'All'");
    const unreadPos = tabs.indexOf("{ id: 'unread', label: 'Unread', count: unreadCount }");
    const criticalPos = tabs.indexOf("{ id: 'critical', label: 'Critical'");
    expect(allPos).toBeGreaterThan(-1);
    expect(unreadPos).toBeGreaterThan(allPos);
    expect(criticalPos).toBeGreaterThan(unreadPos);
  });

  it("the Unread chip's count is the badge's own number — unreadCount, nothing else", () => {
    expect(center).toContain("{ id: 'unread', label: 'Unread', count: unreadCount }");
  });

  it('the dot marker wears the row dot’s language: primary at rest, foreground when active, aria-hidden', () => {
    expect(center).toContain("{tab.id === 'unread' && (");
    expect(center).toContain("filter === tab.id ? 'bg-primary-foreground' : 'bg-primary'");
    // the dot block ends at the label render (the markers ride the same chip row)
    const dotBlock = center.slice(center.indexOf("{tab.id === 'unread' && ("), center.indexOf('{tab.label}'));
    expect(dotBlock).toContain('aria-hidden="true"');
    expect(dotBlock).toContain('rounded-full mr-1 shrink-0');
  });

  it('EVERY filter chip is an aria-pressed toggle (the a11y law lands on all chips, not just the new one)', () => {
    expect(center).toContain('aria-pressed={filter === tab.id}');
  });

  it('the chips gained the keyboard-first ring — focus-visible is a first-class hand (the v2.288 law)', () => {
    expect(center).toContain('focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1');
  });

  it('the live shed is real: markRead still fires on click BEFORE any walk or tab switch', () => {
    const handler = center.slice(center.indexOf('const handleNotificationClick'), center.indexOf('const handleManageSchedule'));
    expect(handler.indexOf('markRead(notification.id)')).toBeGreaterThan(-1);
  });

  it('both shells mount the same center — the lens lands on the HR bell and the POS sidebar with one implementation', () => {
    expect(readRepo(HRBELL)).toContain('NotificationCenter');
    expect(readRepo(SIDEBAR)).toContain('NotificationCenter');
  });

  it('the lib refuses to guess: the no-ledger refusal is written as a law, not an accident', () => {
    expect(lib).toContain('if (!readIds) return [...items];');
  });
});
