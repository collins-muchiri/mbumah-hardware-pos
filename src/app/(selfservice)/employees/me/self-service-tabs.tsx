'use client';

// v2.269.0: the portal's tabs learn where they are.
//
// THE LIVE-PROVEN GAP: both tab bars (the mobile bottom bar and the desktop
// rail) rendered plain Links with only press/hover faces — no usePathname,
// no aria-current, no active face. The reader could not see which tab they
// were on; a screen reader heard six identical destinations. Proven live:
// all twelve links answered aria-current: null on every page of the portal.
//
// THE WAYFINDING LAW (one home): both navs render HERE, from the SAME array,
// against the SAME pathname — they can never disagree about where the reader
// is. The active tab wears aria-current="page" (the screen reader's own
// words) and the portal's own brand face — the amber gradient the profile
// hero wears; a color never means two things (the emerald chip stays the
// "private to you" chip's, the teal stays the payslip notice's).
//
// THE SLIM-LAW HONESTY: this is the portal layout's only client addition
// beside the release voice — usePathname is a navigation hook, not a store;
// no React Query, no auth store crosses the slim boundary.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarClock, FileText, Home, Palmtree, Target, Wallet } from 'lucide-react';

const TABS = [
  { href: '/employees/me', label: 'Home', icon: Home },
  { href: '/employees/me/payslips', label: 'Payslips', icon: Wallet },
  { href: '/employees/me/attendance', label: 'Attendance', icon: CalendarClock },
  { href: '/employees/me/leave', label: 'Leave', icon: Palmtree },
  { href: '/employees/me/goals', label: 'Goals', icon: Target },
  { href: '/employees/me/documents', label: 'Docs', icon: FileText },
];

// The home tab answers EXACT — every other tab answers its own leaf or a
// nested path beneath it (/employees/me/leave/new keeps Leave lit). The home
// must not swallow the whole portal: it is the root, not a prefix ruler.
function isTabActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/employees/me') return pathname === '/employees/me';
  return pathname === href || pathname.startsWith(href + '/');
}

export function SelfServiceTabs() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom tab bar (self-service is mobile-first per spec) */}
      <nav
        aria-label="Self-service navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="grid grid-cols-6">
          {TABS.map((tab) => {
            const active = isTabActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                data-testid={`selfservice-tab-${tab.label.toLowerCase()}`}
                className={`relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                  active ? 'text-foreground' : 'text-muted-foreground active:text-foreground'
                }`}
              >
                <tab.icon className={`h-5 w-5 ${active ? 'text-amber-600 dark:text-amber-400' : ''}`} aria-hidden />
                {tab.label}
                {active ? (
                  <span
                    aria-hidden
                    data-testid="selfservice-tab-indicator"
                    className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop inline nav (mirrors the mobile tabs) */}
      <nav
        aria-label="Self-service navigation desktop"
        className="sticky bottom-0 z-30 hidden justify-center gap-1 border-t bg-card/95 py-2 backdrop-blur md:flex"
      >
        {TABS.map((tab) => {
          const active = isTabActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              data-testid={`selfservice-tab-desktop-${tab.label.toLowerCase()}`}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 ring-1 ring-amber-200 dark:from-amber-950/40 dark:to-orange-950/40 dark:text-amber-200 dark:ring-amber-900'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <tab.icon className={`h-4 w-4 ${active ? 'text-amber-600 dark:text-amber-400' : ''}`} aria-hidden />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
