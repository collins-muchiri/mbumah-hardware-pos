// v2.269.0 — the portal hears the release.
//
//   - THE LIVE-PROVEN GAP 1 (the voice): the shared WhatsNewDialog mounts on
//     every surface whose shell wears MainApp (v2.265.0 console, v2.266.0
//     desk) — but the SELF-SERVICE PORTAL (/employees/me, the surface the
//     v2.267.0 keystone's linked logins open) is a SLIM layout outside
//     MainApp, and it never heard the voice. Proven live: with the seen
//     flag fresh, /employees/me mounted with NO announcement while the same
//     browser had just been announced on the POS workspace.
//   - THE ONE HOME, WORN BARE: the slim layout mounts the SAME dialog with
//     ZERO props (the shell's own law, now three surfaces wide). The slim
//     law holds: the dialog is Radix + pure data — no React Query, no auth
//     store crosses the slim boundary.
//   - THE LIVE-PROVEN GAP 2 (the wayfinding): both tab bars rendered plain
//     Links — no usePathname, no aria-current, no active face. All twelve
//     links answered aria-current: null on every page; the reader could not
//     see where they were, and a screen reader heard six identical
//     destinations.
//   - THE WAYFINDING ONE HOME: SelfServiceTabs renders BOTH navs from the
//     SAME array against the SAME pathname. The active tab wears
//     aria-current="page" and the portal's own brand face — the amber
//     gradient the profile hero wears (a color never means two things: the
//     emerald stays the private chip's, the teal stays the payslip
//     notice's). The home tab answers EXACT (it is the root, not a prefix
//     ruler); the other five answer their leaf or a nested path beneath.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { APP_VERSION } from '@/lib/version';
import { WHATS_NEW } from '@/lib/whats-new';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const layout = read('src/app/(selfservice)/employees/me/layout.tsx');
const groupLayout = read('src/app/(selfservice)/layout.tsx');
const tabs = read('src/app/(selfservice)/employees/me/self-service-tabs.tsx');
const dialog = read('src/components/whats-new-dialog.tsx');
const shell = read('src/components/app/main-app.tsx');
const consolePage = read('src/app/(shell)/console/page.tsx');

describe('the portal hears the release (v2.269.0)', () => {
  it('the slim layout imports and mounts the shared dialog — bare, zero props', () => {
    expect(layout).toContain("import { WhatsNewDialog } from '@/components/whats-new-dialog';");
    expect(layout).toContain('<WhatsNewDialog />');
    expect((layout.match(/<WhatsNewDialog/g) || []).length).toBe(1);
    // the mount comment lives where the reader can read it
    expect(layout).toContain('the portal hears the release');
  });

  it('the slim law holds — the group layout stays the only provider boundary, no heavy runtime crosses', () => {
    // the slim provider wrapper lives on the GROUP layout; the me-layout adds only the voice + the one home
    expect(groupLayout).toContain("import { SelfServiceProviders } from '@/lib/providers-selfservice';");
    expect(layout).not.toContain('react-query');
    expect(layout).not.toContain('useQuery');
    expect(layout).not.toContain("from '@/lib/stores'");
  });

  it('the shared seen-flag law is untouched beneath the third mount', () => {
    expect(dialog).toContain("localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION);");
    expect(dialog).toContain("localStorage.getItem(SEEN_VERSION_KEY) !== APP_VERSION");
    expect(dialog).toContain('const mounted = useSyncExternalStore(');
  });

  it('RUNTIME — the announcement names a release the feed knows, on every surface', () => {
    expect(WHATS_NEW.length).toBeGreaterThan(0);
    expect(WHATS_NEW[0].version).toBe(APP_VERSION);
  });
});

describe('the tabs learn where they are (v2.269.0)', () => {
  it('one home — the client component owns both navs and the same array', () => {
    expect(tabs).toContain("'use client';");
    expect(tabs).toContain('import { usePathname } from \'next/navigation\';');
    expect((tabs.match(/TABS\.map/g) || []).length).toBe(2);
    // the two JSX occurrences + the law's own words in the header comment
    expect((tabs.match(/aria-current=\{active/g) || []).length).toBe(2);
    expect((tabs.match(/aria-current=/g) || []).length).toBe(3);
  });

  it('the array keeps the portal\u2019s own six destinations', () => {
    for (const href of ['/employees/me', '/employees/me/payslips', '/employees/me/attendance', '/employees/me/leave', '/employees/me/goals', '/employees/me/documents']) {
      expect(tabs).toContain(`href: '${href}'`);
    }
  });

  it('the wayfinding law — the home answers exact, the leaves answer their subtree', () => {
    expect(tabs).toContain("if (href === '/employees/me') return pathname === '/employees/me';");
    expect(tabs).toContain("return pathname === href || pathname.startsWith(href + '/');");
    expect(tabs).toContain('not a prefix ruler');
  });

  it('the active faces — the amber brand gradient, never a new palette', () => {
    expect(tabs).toContain('bg-gradient-to-r from-amber-400 to-orange-500');
    expect(tabs).toContain('bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 ring-1 ring-amber-200 dark:from-amber-950/40 dark:to-orange-950/40 dark:text-amber-200 dark:ring-amber-900');
    expect(tabs).toContain("'text-foreground' : 'text-muted-foreground active:text-foreground'");
  });

  it('the mobile bar keeps the slim shell\u2019s own classes — fixed, safe-area, blur', () => {
    expect(tabs).toContain('fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden');
    expect(tabs).toContain('grid grid-cols-6');
  });

  it('the desktop rail keeps its sticky face and grows the active pill', () => {
    expect(tabs).toContain('sticky bottom-0 z-30 hidden justify-center gap-1 border-t bg-card/95 py-2 backdrop-blur md:flex');
    expect(tabs).toContain('hover:bg-accent hover:text-foreground');
  });

  it('the tab testids answer both navs', () => {
    expect(tabs).toContain('data-testid={`selfservice-tab-${tab.label.toLowerCase()}`}');
    expect(tabs).toContain('data-testid={`selfservice-tab-desktop-${tab.label.toLowerCase()}`}');
    expect(tabs).toContain('data-testid="selfservice-tab-indicator"');
  });
});

describe('the layout retires the stateless navs (v2.269.0)', () => {
  it('the layout renders the one home and no longer carries its own TABS array', () => {
    expect(layout).toContain('<SelfServiceTabs />');
    expect(layout).toContain("import { SelfServiceTabs } from './self-service-tabs';");
    expect(layout).not.toContain('const TABS');
    expect(layout).not.toContain("aria-label=\"Self-service navigation\"");
  });

  it('the ancestors\u2019 bytes — the header, the private chip, the footer', () => {
    expect(layout).toContain('My Workspace | Mbumah Hardware');
    expect(layout).toContain('Private to you');
    expect(layout).toContain('Payslip figures stay available offline on this device once loaded.');
    expect(layout).toContain('bg-gradient-to-b from-slate-50 via-background to-background dark:from-slate-950');
  });

  it('the other release-voice surfaces stand byte-identical', () => {
    // the shell stays bare (v2.265.0's zero-props law)
    expect(shell).toContain('<WhatsNewDialog />');
    expect((shell.match(/<WhatsNewDialog/g) || []).length).toBe(1);
    // the console keeps its hand (v2.265.0)
    expect(consolePage).toContain('<WhatsNewDialog onOpenChangelog={() => { setReleaseJump(APP_VERSION); setChangelogOpen(true); }} />');
  });
});
