'use client';

// v2.291.0: the unread badge becomes a BUTTON of its own. THE DEEP-LINK: the
// badge already answers "how many?", but clicking the BELL opened the feed on
// All — finding those N unread still meant tapping the Unread chip. Now the
// badge itself opens the feed WITH the Unread lens pre-selected: the question
// the pixel asks ("what are those 3?") is the question the click answers.
// The bell stays the general door (All); the badge is the unread shortcut.
//
// ONE component, every bell: the POS rail (expanded + collapsed) and the HR
// shell mount this — three call sites, one pill, one contract. The v2.148.0
// contrast law rides along: critical unread = white on red-600 (4.8:1),
// everything else = slate-950 on amber-500 (8.6:1) — the pulse stays dropped
// (the bounce-in already announces), and these tokens are load-bearing, not
// taste.
//
// DOM law: a button may not nest in a button, so the badge is a SIBLING of
// the bell inside the caller's relative wrapper — absolutely positioned over
// the bell's top-right corner, exactly where the old span sat. Keyboard is a
// first-class hand (v2.288 law): the pill is tabbable, carries the
// keyboard-first focus ring, and names its destination in the aria-label
// ("N unread — open the unread list") — two stops, two destinations, honest
// semantics. The bounce-in replays on an INCREASE via the caller's badgeKey:
// pass it as the React `key` at the call site (the sidebar's own pattern) —
// the pill remounts, the animation replays, nothing here needs to know.

export function NotificationBadgeButton({
  count,
  critical,
  size = 'default',
  onOpenUnread,
}: {
  count: number;
  critical: boolean;
  size?: 'default' | 'compact';
  onOpenUnread: () => void;
}) {
  const compact = size === 'compact';
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={`${count} unread — open the unread list`}
      title={`Open the ${count} unread notification${count === 1 ? '' : 's'}`}
      onClick={onOpenUnread}
      data-testid="notification-unread-badge"
      className={`absolute -top-0.5 -right-0.5 z-10 flex items-center justify-center rounded-full font-bold animate-badge-bounce-in cursor-pointer transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
        compact
          ? 'min-w-[14px] h-3.5 text-[8px] px-0.5'
          : 'min-w-[16px] h-4 text-[9px] px-1'
      } ${
        critical
          ? 'bg-red-600 text-white'
          : 'bg-amber-500 text-slate-950'
      }`}
    >
      {count > 99 ? '99+' : count}
    </button>
  );
}
