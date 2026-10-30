'use client';

// v2.288.0: the HR workspace shell hears the bell. A worker parked on /hr/*
// never saw the notification center — the bell lived in the POS shell's
// sidebar (app-sidebar) and the mobile top-bar, neither of which exists in
// the HR workspace. The digest beacons (v2.286/287) only PAPER over the gap:
// they tell you a tab is waiting, but the feed itself stayed a walk away.
// This is the reach fix: ONE bell, the SAME feed, mounted in the HR header.
//
// Everything is the shared machinery, never a copy:
// • useNotificationCount — the badge hook the sidebar and top-bar use (same
//   ['notification-count', storeId] query instance → zero extra network).
// • NotificationCenter — the SAME right-side sheet (mark all read, filters,
//   dismissed drawer, security tab, retry delivery, deep-link walks). Its
//   list query is `enabled: open`, so mounting it here costs nothing until
//   the bell is rung.
// • The badge contrast law is the sidebar's own (v2.148.0): critical unread
//   = white on red-600 (4.8:1), everything else = slate-950 on amber-500
//   (8.6:1); the bounce-in replays on an INCREASE via the same
//   prev-count ref pattern.
//
// Deep links written into bell rows (`/hr/...` actionUrls) resolve with the
// NotificationCenter's own next/navigation router — they work identically
// from inside the HR workspace, which is exactly where a worker stands when
// the bell rings.

import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useAppStore } from '@/lib/stores';
import { useNotificationCount } from '@/hooks/use-notification-count';
// v2.289.0: alt+N rings the bell — the HR shell wires the same key the POS
// sidebar wires, so the feed opens with the keyboard on every shell.
import { useNotificationHotkey } from '@/hooks/use-notification-hotkey';
import { NotificationCenter } from '@/components/notification-center';
import { Button } from '@/components/ui/button';

export function HrShellBell() {
  const [open, setOpen] = useState(false);
  const currentStoreId = useAppStore((s) => s.currentStoreId);
  const notificationCount = useNotificationCount(currentStoreId);
  // v2.289.0: alt+N rings the bell (the POS shell's sidebar wires the same
  // hook to its own open state — one key, every shell).
  useNotificationHotkey(useCallback(() => setOpen(true), []));

  // Bounce the badge when the unread count RISES (the sidebar's pattern).
  const prevNotifCount = useRef(0);
  const [notifBadgeKey, setNotifBadgeKey] = useState(0);
  useEffect(() => {
    const prev = prevNotifCount.current;
    prevNotifCount.current = notificationCount.unread;
    if (notificationCount.unread > prev && prev >= 0) {
      requestAnimationFrame(() => setNotifBadgeKey((k) => k + 1));
    }
  }, [notificationCount.unread]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        onClick={() => setOpen(true)}
        aria-label={`Notifications${notificationCount.unread > 0 ? ` (${notificationCount.unread} unread)` : ''}`}
        aria-haspopup="dialog"
        data-testid="hr-shell-bell"
      >
        <Bell className="h-4 w-4" aria-hidden />
        {notificationCount.unread > 0 ? (
          <span
            key={notifBadgeKey}
            data-testid="hr-shell-bell-badge"
            className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold px-1 animate-badge-bounce-in ${
              notificationCount.critical > 0
                ? 'bg-red-600 text-white'
                : 'bg-amber-500 text-slate-950'
            }`}
          >
            {notificationCount.unread > 99 ? '99+' : notificationCount.unread}
          </span>
        ) : null}
      </Button>
      <NotificationCenter
        open={open}
        onOpenChange={setOpen}
        storeId={currentStoreId}
      />
    </>
  );
}
