'use client';

// v2.288.0: the HR shell's own navigation, lifted out of the server layout so
// the links can speak their PLACE. A ten-link nav with no active state reads
// as ten identical doors — the worker can't tell which one they walked
// through. usePathname is a client hook, and the layout must stay a server
// component (it owns `export const metadata`), so the nav is its own client
// island and the layout stays untouched in kind.
//
// THE ACTIVE LAW: a link is current when the pathname is EXACTLY the href, or
// lives one or more segments BELOW it (`/hr/performance` matches
// `/hr/performance` and `/hr/performance/reviews`, never `/hr/employees`).
// The Overview link (`/hr`) is exact-only — every desk lives below `/hr`, so
// a prefix rule there would light Overview on every page in the workspace.
// Query strings never participate: `?status=…` is a lens on the page, not a
// different page.

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const HR_NAV_ITEMS = [
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
] as const;

/**
 * Pure predicate so the law is testable without a router: exact match for the
 * workspace root, exact-or-descendant for every desk.
 */
export function isHrNavActive(href: string, pathname: string): boolean {
  if (!href) return false; // an empty href names nothing — refuse to guess
  if (href === '/hr') return pathname === '/hr';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HrShellNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="HR navigation" className="flex flex-wrap items-center justify-end gap-1">
      {HR_NAV_ITEMS.map((item) => {
        const active = isHrNavActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            data-testid={`hr-nav-${item.label.toLowerCase()}`}
            className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 sm:px-3 sm:py-1.5 sm:text-sm ${
              active
                ? 'bg-accent font-semibold text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
