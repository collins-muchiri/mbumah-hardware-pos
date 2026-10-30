import type { Metadata } from 'next';
import Link from 'next/link';
import { HrShellNav } from '@/components/layout/hr-shell-nav';
import { HrShellBell } from '@/components/layout/hr-shell-bell';
// v2.291.0: the boot island — the /hr route never hydrated the auth store,
// so a direct load of /hr left every role-gated read (the notification
// center's Security tab) staring at an empty role. One line of wiring, the
// shared boot, not a copy.
import { HrAuthBoot } from '@/components/layout/hr-auth-boot';

export const metadata: Metadata = {
  title: 'HR Workspace | Mbumah Hardware POS',
  description: 'Employee management workspace: records, documents, and statutory readiness.',
};

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <HrAuthBoot />
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        {/* v2.147.0: the header wraps instead of the page scrolling — the
            10-link nav was the only unclipped pusher past 390px, which broke
            the spec's "no horizontal scroll on supported viewports" line on
            every HR page. min-h instead of h lets the nav drop to its own
            row on phones; every link stays visible and tappable (no hidden
            overflow, no scrollbar affordance to discover). */}
        <div className="mx-auto flex min-h-14 max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            HR Workspace
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              EMS
            </span>
          </Link>
          {/* v2.288.0: the right cluster — nav, then a hairline, then the
              bell. The feed was a walk away (POS shell only); now the
              workspace it announces is the workspace it lives in. The
              cluster flex-wraps as one unit, so the v2.147.0 wrap law
              (no horizontal scroll at 390px) holds with the bell aboard. */}
          <div className="ml-auto flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-2 gap-y-1">
            <HrShellNav />
            <div
              aria-hidden="true"
              className="hidden h-6 w-px shrink-0 bg-border sm:block"
              data-testid="hr-header-divider"
            />
            <HrShellBell />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      <footer className="mt-auto border-t py-4 text-center text-xs text-muted-foreground">
        Mbumah Hardware POS HR workspace. PII is masked by default; unmasking is role-gated and audit logged.
      </footer>
    </div>
  );
}
