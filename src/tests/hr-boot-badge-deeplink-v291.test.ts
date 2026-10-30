// v2.291.0 — the HR shell boots its session, and the badge becomes a door.
//
//   - THE HYDRATION GAP: /hr never hydrated the auth store. The POS shell
//     hydrates in (shell)/page.tsx; branch workspaces do it through the
//     gateway; NOTHING on the /hr route did. A direct load of /hr left
//     useAuthStore.user = null, so the notification center's Security tab
//     (role-gated: SUPER_ADMIN/STORE_OWNER/BRANCH_MANAGER, v2.12.7) never
//     rendered on the HR shell — even though the session's OWN localStorage
//     held the role. THE FIX is one line of wiring: the HR layout mounts the
//     shared useWorkspaceAuthBoot (the same idempotent boot the root page
//     runs), not a copy.
//   - THE BADGE DOOR: the unread badge is a BUTTON of its own. Clicking the
//     bell opens the feed on All (the general door); clicking the badge
//     deep-links the feed ONTO the unread lens — the question the pixel asks
//     ("what are those 3?") is the question the click answers. One component
//     (notification-badge-button.tsx), three call sites (expanded rail,
//     collapsed rail, HR bell). A button may not nest in a button: the badge
//     is a SIBLING in a relative wrapper.
//   - THE OPENER'S LENS LAW: every open lands on the lens its opener asked
//     for, applied on the false→true transition only. The law is PURE
//     (openerLensFilter in the lens lib) so the RUNTIME-PIN law holds: the
//     transition table is asserted by VALUE here; the render sites wire it.
//
// THE TWO-NET LAW: the runtime net pins the pure transition table; the byte
// net pins the wiring — the boot island, the shared boot import, the
// gate's role read, the badge component's contract (keyboard-first ring,
// contrast tokens, 99+ clamp, two faces), all three call sites, and the
// death of the inline span badges.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { openerLensFilter, type NotificationFilter } from '@/lib/notification-filter';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const LIB = 'src/lib/notification-filter.ts';
const CENTER = 'src/components/notification-center.tsx';
const HRBELL = 'src/components/layout/hr-shell-bell.tsx';
const SIDEBAR = 'src/components/layout/app-sidebar.tsx';
const BADGE = 'src/components/layout/notification-badge-button.tsx';
const BOOT = 'src/components/layout/hr-auth-boot.tsx';
const HRLAYOUT = 'src/app/(shell)/hr/layout.tsx';

// ---- the transition table (runtime net) ------------------------------------

describe('openerLensFilter — the opener\u2019s lens law (runtime net)', () => {
  it('an open transition with no named lens lands on ALL (the bell\u2019s door)', () => {
    expect(openerLensFilter(true, false, undefined)).toBe('all');
  });

  it('an open transition naming \u2018unread\u2019 lands ON the unread lens (the badge\u2019s door)', () => {
    expect(openerLensFilter(true, false, 'unread')).toBe('unread');
  });

  it('an explicit \u2018all\u2019 ask is honoured as an ask, not collapsed into undefined', () => {
    expect(openerLensFilter(true, false, 'all')).toBe('all');
  });

  it('any named lens rides the open transition (security spelled is security served)', () => {
    expect(openerLensFilter(true, false, 'security')).toBe('security');
    expect(openerLensFilter(true, false, 'email_failed')).toBe('email_failed');
  });

  it('a re-render while the sheet is ALREADY open is a spectator \u2014 the user\u2019s chip is never clobbered', () => {
    expect(openerLensFilter(true, true, 'unread')).toBeNull();
    expect(openerLensFilter(true, true, undefined)).toBeNull();
  });

  it('a closed state never names a lens (initial mount and the close transition)', () => {
    expect(openerLensFilter(false, false, 'unread')).toBeNull();
    expect(openerLensFilter(false, true, 'unread')).toBeNull();
  });

  it('the verdict is exactly three-valued: a lens, ALL, or the null spectator', () => {
    const lenses: NotificationFilter[] = ['all', 'unread', 'critical', 'warning', 'info', 'security', 'email_failed'];
    for (const lens of lenses) {
      expect(openerLensFilter(true, false, lens)).toBe(lens);
      expect(openerLensFilter(true, true, lens)).toBeNull();
    }
  });
});

// ---- the byte net -----------------------------------------------------------

describe('the HR shell boots its session (byte net)', () => {
  const layout = readRepo(HRLAYOUT);
  const boot = readRepo(BOOT);

  it('the HR layout mounts the boot island', () => {
    expect(layout).toContain("import { HrAuthBoot } from '@/components/layout/hr-auth-boot'");
    expect(layout).toContain('<HrAuthBoot />');
  });

  it('the island speaks the SHARED boot \u2014 never a copy of the boot sequence', () => {
    expect(boot).toContain("import { useWorkspaceAuthBoot } from '@/lib/workspace/workspace-store'");
    expect(boot).toContain('useWorkspaceAuthBoot();');
    expect(boot).toContain('return null;');
    // the island must not smuggle in its own storage reads or fetch calls
    // (prose may MENTION localStorage; only a `.usage` is a violation)
    expect(boot).not.toContain('localStorage.');
    expect(boot).not.toContain('document.cookie');
    expect(boot).not.toContain('fetch(');
  });

  it('the Security gate still reads the REAL role from the auth store', () => {
    const center = readRepo(CENTER);
    expect(center).toContain("const role = useAuthStore((s) => s.user?.role || '');");
    expect(center).toContain("const SECURITY_TAB_ROLES: readonly string[] = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER'];");
    expect(center).toContain('const canSeeSecurity = SECURITY_TAB_ROLES.includes(role);');
  });
});

describe('the badge is a door of its own (byte net)', () => {
  const badge = readRepo(BADGE);

  it('the badge component is a real button with the dialog contract', () => {
    expect(badge).toContain('<button');
    expect(badge).toContain('type="button"');
    expect(badge).toContain('aria-haspopup="dialog"');
    expect(badge).toContain('data-testid="notification-unread-badge"');
  });

  it('the aria-label names the DESTINATION, not just the count', () => {
    expect(badge).toContain('aria-label={`${count} unread — open the unread list`}');
  });

  it('the title tooltip carries the singular/plural law', () => {
    expect(badge).toContain("title={`Open the ${count} unread notification${count === 1 ? '' : 's'}`}");
  });

  it('the keyboard-first ring lands on the pill (v2.288 law: keyboard is a first-class hand)', () => {
    expect(badge).toContain('focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1');
  });

  it('the contrast tokens are load-bearing (v2.148.0 law rides in the shared component)', () => {
    expect(badge).toContain("'bg-red-600 text-white'");
    expect(badge).toContain("'bg-amber-500 text-slate-950'");
  });

  it('the 99+ clamp and the bounce-in replay live here', () => {
    expect(badge).toContain("{count > 99 ? '99+' : count}");
    expect(badge).toContain('animate-badge-bounce-in');
  });

  it('two faces: the compact pill (collapsed rail) and the default pill', () => {
    expect(badge).toContain("size?: 'default' | 'compact';");
    expect(badge).toContain("'min-w-[14px] h-3.5 text-[8px] px-0.5'");
    expect(badge).toContain("'min-w-[16px] h-4 text-[9px] px-1'");
  });

  it('the pill invites the hand: pointer affordance without stealing the focus law', () => {
    expect(badge).toContain('cursor-pointer');
    expect(badge).toContain('hover:scale-110');
    expect(badge).toContain('transition-transform');
  });
});

describe('every bell mounts the same badge (byte net)', () => {
  const hrbell = readRepo(HRBELL);
  const sidebar = readRepo(SIDEBAR);

  it('the HR bell imports the shared badge and threads its lens state', () => {
    expect(hrbell).toContain("import { NotificationBadgeButton } from '@/components/layout/notification-badge-button'");
    expect(hrbell).toContain("import type { NotificationFilter } from '@/lib/notification-filter'");
    expect(hrbell).toContain('const [openLens, setOpenLens] = useState<NotificationFilter | undefined>(undefined);');
    expect(hrbell).toContain('initialFilter={openLens}');
  });

  it('the HR bell\u2019s two doors ask different lenses \u2014 and alt+N asks the bell\u2019s', () => {
    expect(hrbell).toContain("onClick={() => { setOpenLens(undefined); setOpen(true); }}");
    expect(hrbell).toContain("onOpenUnread={() => { setOpenLens('unread'); setOpen(true); }}");
    expect(hrbell).toContain("useNotificationHotkey(useCallback(() => { setOpenLens(undefined); setOpen(true); }, []));");
  });

  it('the sidebar imports the shared badge and threads its lens state to ONE center', () => {
    expect(sidebar).toContain("import { NotificationBadgeButton } from '@/components/layout/notification-badge-button'");
    expect(sidebar).toContain("import type { NotificationFilter } from '@/lib/notification-filter'");
    expect(sidebar).toContain('const [notificationLens, setNotificationLens] = useState<NotificationFilter | undefined>(undefined);');
    expect(sidebar).toContain('initialFilter={notificationLens}');
  });

  it('BOTH sidebar rails mount the badge \u2014 compact on the collapsed rail', () => {
    expect(sidebar.match(/<NotificationBadgeButton/g)?.length).toBe(2);
    expect(sidebar).toContain('key={notifBadgeKey}');
    expect(sidebar).toContain('key={`collapsed-${notifBadgeKey}`}');
    expect(sidebar).toContain('size="compact"');
  });

  it('the sidebar\u2019s doors and hotkey ask their lenses', () => {
    expect(sidebar.match(/setNotificationLens\(undefined\); setNotificationOpen\(true\);/g)?.length).toBe(3);
    expect(sidebar.match(/setNotificationLens\('unread'\); setNotificationOpen\(true\);/g)?.length).toBe(2);
  });

  it('THE DOM LAW: a button never nests in a button \u2014 the badge is a sibling in a relative wrapper', () => {
    // the wrapper div appears once per bell mount (HR: 1, sidebar: 2; the
    // sidebar carries pre-existing relative divs elsewhere \u2014 pin the two
    // NEW wrappers by their exact faces, not by a global count)
    expect(hrbell.match(/<div className="relative shrink-0">/g)?.length).toBe(1);
    expect(sidebar).toContain('<div className="relative shrink-0">');
    expect(sidebar).toContain('<div className="relative">');
  });

  it('THE INLINE SPAN BADGES ARE DEAD \u2014 one component, zero copies', () => {
    expect(hrbell).not.toContain('data-testid="hr-shell-bell-badge"');
    expect(hrbell).not.toContain('animate-badge-bounce-in');
    expect(sidebar).not.toContain('animate-badge-bounce-in');
    expect(sidebar).not.toContain('text-[9px] font-bold px-1');
    expect(sidebar).not.toContain('text-[8px] font-bold px-0.5');
  });
});

describe('the feed lands on the opener\u2019s lens (byte net)', () => {
  const center = readRepo(CENTER);
  const lib = readRepo(LIB);
  const hrbell = readRepo(HRBELL);
  const sidebar = readRepo(SIDEBAR);

  it('the law lives in the lens lib \u2014 one vocabulary home, exported', () => {
    expect(lib).toContain('export function openerLensFilter(');
    expect(lib).toContain('NotificationFilter | null');
  });

  it('the center imports the pure law and wires it through the open ref', () => {
    expect(center).toContain("import { applyNotificationFilter, openerLensFilter, type NotificationFilter } from '@/lib/notification-filter';");
    expect(center).toContain('const openRef = useRef(false);');
    expect(center).toContain('const lens = openerLensFilter(open, wasOpen, initialFilter);');
    expect(center).toContain('if (lens) setFilter(lens);');
  });

  it('the prop is additive and optional \u2014 absent still means ALL', () => {
    expect(center).toContain('  initialFilter?: NotificationFilter;');
  });

  it('both shells still mount the SAME center (v2.288\u2019s one-implementation law continues)', () => {
    expect(hrbell).toContain('<NotificationCenter');
    expect(sidebar).toContain('<NotificationCenter');
    expect(sidebar.match(/<NotificationCenter/g)?.length).toBe(1);
  });
});
