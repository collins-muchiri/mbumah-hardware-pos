// v2.288.0 — the HR shell hears the bell.
//
//   - THE REACH FIX: a worker parked on /hr/* never saw the notification
//     center — the bell lived in the POS shell's sidebar and top-bar, and
//     neither exists in the HR workspace. The digest beacons (v2.286/287)
//     paper over the gap, but the feed itself stayed a walk away. The HR
//     header now carries ONE bell that opens the SAME NotificationCenter
//     sheet (filters, dismissed drawer, security tab, retry delivery,
//     deep-link walks) with the SAME storeId from the SAME app store.
//   - ZERO-COST MOUNT: the feed query inside NotificationCenter is
//     `enabled: open` — mounting it in the HR header fetches nothing until
//     the bell is rung. The badge rides the badge hook the sidebar already
//     uses (same ['notification-count', storeId] cache key — no extra
//     network beyond the one poll the badge always paid).
//   - THE BADGE SPEAKS THE SIDEBAR'S LAW (v2.148.0): critical unread =
//     white on red-600, everything else = slate-950 on amber-500, the
//     bounce-in replays on an INCREASE via the same prev-count ref, and
//     the cap reads 99+.
//   - THE NAV SPEAKS ITS PLACE: the ten links lift into a client island so
//     the CURRENT desk is visible (aria-current="page" + the accent pill).
//     The active law is a pure predicate: exact match for the workspace
//     root (/hr), exact-or-descendant for every desk. Query strings never
//     participate — ?status= is a lens on the page, not a different page.
//   - THE LAYOUT STAYS A SERVER COMPONENT: it owns `export const
//     metadata`; the two islands (nav, bell) are client children. The
//     v2.147.0 wrap law (min-h-14, flex-wrap, no horizontal scroll at
//     390px) holds with the bell aboard — the right cluster flex-wraps as
//     one unit.
//
// THE RUNTIME-PIN LAW (the fourth net): HR_NAV_ITEMS is asserted by value
// (the ten doors, in order, no copies) and isHrNavActive gets a truth
// table. The bytes pin the wiring (the mount, the badge law, the cluster).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { HR_NAV_ITEMS, isHrNavActive } from '@/components/layout/hr-shell-nav';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const LAYOUT = 'src/app/(shell)/hr/layout.tsx';
const NAV = 'src/components/layout/hr-shell-nav.tsx';
const BELL = 'src/components/layout/hr-shell-bell.tsx';
const CENTER = 'src/components/notification-center.tsx';

// ── 1. The layout stays a server component with two client islands ─────────

describe('the HR layout keeps its kind and gains its islands', () => {
  const src = () => readRepo(LAYOUT);

  it('the layout is still a server component (metadata law, no use client)', () => {
    expect(src().startsWith("'use client'")).toBe(false);
    expect(src()).toContain("export const metadata: Metadata = {");
    expect(src()).toContain("title: 'HR Workspace | Mbumah Hardware POS'");
  });

  it('the two islands are imported and mounted (nav first, bell last)', () => {
    const s = src();
    expect(s).toContain("import { HrShellNav } from '@/components/layout/hr-shell-nav';");
    expect(s).toContain("import { HrShellBell } from '@/components/layout/hr-shell-bell';");
    expect(s).toContain('<HrShellNav />');
    expect(s).toContain('<HrShellBell />');
    expect(s.indexOf('<HrShellNav />')).toBeLessThan(s.indexOf('<HrShellBell />'));
  });

  it('the old inline NAV_ITEMS is gone (one vocabulary, never a copy)', () => {
    expect(src()).not.toContain('const NAV_ITEMS');
  });

  it('the right cluster wraps as one unit (the v2.147.0 law with the bell aboard)', () => {
    const s = src();
    expect(s).toContain('flex min-h-14 max-w-7xl flex-wrap items-center');
    expect(s).toContain('ml-auto flex min-w-0 flex-1 flex-wrap items-center justify-end');
  });

  it('the hairline divider sits between nav and bell (hidden on phones, quiet to AT)', () => {
    const s = src();
    expect(s).toContain('data-testid="hr-header-divider"');
    expect(s).toContain('hidden h-6 w-px shrink-0 bg-border sm:block');
    // the divider is decoration — the divider's element carries aria-hidden
    expect(s).toMatch(/aria-hidden="true"\s*\n\s*className="hidden h-6 w-px/);
  });

  it('the brand link and the amber EMS chip are untouched', () => {
    const s = src();
    expect(s).toContain('href="/"');
    expect(s).toContain('bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800');
  });
});

// ── 2. The nav island: the place is visible ─────────────────────────────────

describe('the nav island speaks its place', () => {
  const src = () => readRepo(NAV);

  it('the island is a client component with the router hook', () => {
    const s = src();
    expect(s.startsWith("'use client'")).toBe(true);
    expect(s).toContain('usePathname()');
  });

  it('the accessible name and the aria-current law are wired', () => {
    const s = src();
    expect(s).toContain('aria-label="HR navigation"');
    expect(s).toContain("aria-current={active ? 'page' : undefined}");
  });

  it('the dress codes: muted at rest, accent pill when current, ring on focus', () => {
    const s = src();
    expect(s).toContain("'bg-accent font-semibold text-foreground'");
    expect(s).toContain("'text-muted-foreground hover:bg-accent hover:text-foreground'");
    expect(s).toContain('font-medium');
    // the phone/desktop dress code survives the lift unchanged (a11y-sweep law)
    expect(s).toContain('px-2.5 py-1 text-[13px]');
    expect(s).toContain('sm:px-3 sm:py-1.5 sm:text-sm');
    expect(s).toContain('focus-visible:ring-2 focus-visible:ring-ring');
  });

  it('every link carries a stable testid derived from its label', () => {
    expect(src()).toContain('data-testid={`hr-nav-${item.label.toLowerCase()}`}');
  });
});

// ── 3. THE ACTIVE LAW (runtime truth table) ────────────────────────────────

describe('isHrNavActive — the pure predicate (the fourth net)', () => {
  it('the workspace root is EXACT-only (every desk lives below /hr)', () => {
    expect(isHrNavActive('/hr', '/hr')).toBe(true);
    expect(isHrNavActive('/hr', '/hr/employees')).toBe(false);
    expect(isHrNavActive('/hr', '/hr/reports')).toBe(false);
  });

  it('a desk matches itself and its descendants, never a sibling', () => {
    expect(isHrNavActive('/hr/performance', '/hr/performance')).toBe(true);
    expect(isHrNavActive('/hr/performance', '/hr/performance/reviews')).toBe(true);
    expect(isHrNavActive('/hr/performance', '/hr/employees')).toBe(false);
    expect(isHrNavActive('/hr/reports', '/hr/reports/schedules')).toBe(true);
  });

  it('the segment law: a longer word that merely STARTS WITH the href is not the desk', () => {
    // /hr/employeex is a different word from /hr/employees — the prefix must
    // end at a segment boundary.
    expect(isHrNavActive('/hr/employees', '/hr/employeex')).toBe(false);
    expect(isHrNavActive('/hr/payroll', '/hr/payrollrun')).toBe(false);
  });

  it('garbage and case drift stay silent', () => {
    expect(isHrNavActive('/hr', '')).toBe(false);
    expect(isHrNavActive('/hr/payroll', '/HR/PAYROLL')).toBe(false);
    expect(isHrNavActive('', '/hr')).toBe(false);
  });
});

describe('HR_NAV_ITEMS — the ten doors, by value (the fourth net)', () => {
  it('ten doors, exact hrefs and labels, in the order the desk grew', () => {
    expect(HR_NAV_ITEMS).toEqual([
      { href: '/hr', label: 'Overview' },
      { href: '/hr/employees', label: 'Employees' },
      { href: '/hr/recruitment', label: 'Recruitment' },
      { href: '/hr/onboarding', label: 'Onboarding' },
      { href: '/hr/payroll', label: 'Payroll' },
      { href: '/hr/timesheets', label: 'Timesheets' },
      { href: '/hr/performance', label: 'Performance' },
      { href: '/hr/assets', label: 'Assets' },
      { href: '/hr/discipline', label: 'Discipline' },
      { href: '/hr/reports', label: 'Reports' },
    ]);
  });

  it('the timesheet adjacency law survives the lift (payroll < timesheets < performance)', () => {
    const hrefs = HR_NAV_ITEMS.map((i) => i.href);
    expect(hrefs.indexOf('/hr/timesheets')).toBeGreaterThan(hrefs.indexOf('/hr/payroll'));
    expect(hrefs.indexOf('/hr/timesheets')).toBeLessThan(hrefs.indexOf('/hr/performance'));
  });

  it('no duplicate hrefs, no duplicate labels', () => {
    expect(new Set(HR_NAV_ITEMS.map((i) => i.href)).size).toBe(HR_NAV_ITEMS.length);
    expect(new Set(HR_NAV_ITEMS.map((i) => i.label)).size).toBe(HR_NAV_ITEMS.length);
  });
});

// ── 4. The bell island: the same machinery, never a copy ───────────────────

describe('the bell island reuses the shared machinery', () => {
  const src = () => readRepo(BELL);

  it('the island is a client component mounting the REAL NotificationCenter', () => {
    const s = src();
    expect(s.startsWith("'use client'")).toBe(true);
    expect(s).toContain("import { NotificationCenter } from '@/components/notification-center';");
    expect(s).toContain('<NotificationCenter');
  });

  it('the storeId is the app store\u2019s own (the same scope everywhere)', () => {
    const s = src();
    expect(s).toContain("useAppStore((s) => s.currentStoreId)");
    expect(s).toContain('storeId={currentStoreId}');
  });

  it('the badge rides the badge hook (same cache key the sidebar pays for)', () => {
    expect(src()).toContain("import { useNotificationCount } from '@/hooks/use-notification-count';");
    expect(src()).toContain('useNotificationCount(currentStoreId)');
  });

  it('the badge contrast law is the sidebar\u2019s own (v2.148.0)', () => {
    const s = src();
    expect(s).toContain("'bg-red-600 text-white'");
    expect(s).toContain("'bg-amber-500 text-slate-950'");
    expect(s).toContain('animate-badge-bounce-in');
  });

  it('the bounce replays only on an INCREASE (the prev-count ref pattern)', () => {
    const s = src();
    expect(s).toContain('prevNotifCount = useRef(0)');
    expect(s).toContain('notificationCount.unread > prev');
  });

  it('the cap reads 99+ and the accessible name carries the unread count', () => {
    const s = src();
    expect(s).toContain("notificationCount.unread > 99 ? '99+' : notificationCount.unread");
    expect(s).toContain('aria-label={`Notifications${notificationCount.unread > 0 ? ` (${notificationCount.unread} unread)` : \'\'}`}');
    expect(s).toContain('aria-haspopup="dialog"');
  });

  it('the bell is findable by test, and quiet when the feed is empty', () => {
    const s = src();
    expect(s).toContain('data-testid="hr-shell-bell"');
    expect(s).toContain('data-testid="hr-shell-bell-badge"');
    // badge only renders when there is something to say
    expect(s).toContain('{notificationCount.unread > 0 ? (');
  });
});

// ── 5. The zero-cost mount and the unchanged sheet ──────────────────────────

describe('the feed costs nothing until the bell is rung', () => {
  const src = () => readRepo(CENTER);

  it('the NotificationCenter\u2019s list query stays `enabled: open` (no fetch while closed)', () => {
    expect(src()).toMatch(/enabled: open,/);
  });

  it('the sheet stays on the right (the same surface the POS shell opens)', () => {
    expect(src()).toContain('SheetContent side="right"');
  });

  it('deep links resolve through the app router (identical from inside /hr)', () => {
    expect(src()).toContain('router.push(notification.actionUrl)');
  });
});
