import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { WhatsNewDialog } from '@/components/whats-new-dialog';
import { SelfServiceTabs } from './self-service-tabs';

export const metadata: Metadata = {
  title: 'My Workspace | Mbumah Hardware',
  description: 'Your payslips, leave, attendance, goals, and documents — private to you.',
};

export default function EmployeeSelfServiceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-background to-background dark:from-slate-950">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/employees/me" className="flex items-center gap-2 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white shadow-sm">
              M
            </span>
            My Workspace
          </Link>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
            Private to you
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-4 sm:pt-6 md:pb-10">{children}</main>

      {/* v2.269.0: the wayfinding one home — both tab bars render through the
          SAME client component (the same array, the same pathname, the same
          aria-current law). The stateless navs (every tab looked alike, no
          active face) retired whole. */}
      <SelfServiceTabs />

      {/* v2.269.0: the portal hears the release — the shared dialog (one
          home, the same seen-flag law, the same SSR gate) mounts BARE, the
          shell's own zero-props law, now three surfaces wide. The slim
          layout's honesty holds: the dialog is Radix + pure data — no React
          Query, no auth store crosses the slim boundary. */}
      <WhatsNewDialog />

      <footer className="hidden border-t py-3 text-center text-xs text-muted-foreground md:block">
        Your data is scoped to your own profile. Payslip figures stay available offline on this device once loaded.
      </footer>
    </div>
  );
}
