'use client';

// v2.289.0: the bell learns its key. The keyboard shortcut map has carried
// search (⌘K), the sidebar (⌘B) and the F-tab row since the redesign — but
// the notification feed, the surface the morning digests land in, had NO
// shortcut on ANY shell (the "Notifications alt+T" hint in the accessibility
// tree is Radix's TOAST-VIEWPORT focus hotkey, not ours). alt+N closes that
// gap on BOTH shells: the POS shell wires it to the sidebar's bell state,
// the HR workspace wires it to the header bell's sheet — one hook, two
// openers, the same key.
//
// THE MATCH LAW is `e.code === 'KeyN'` (the PHYSICAL key), not `e.key`:
// option+N on macOS produces 'ñ'/'Dead' in e.key, so a character match
// would silently die on the most keyboard-rich platform. Alt-combos are
// layout-robust only through e.code. Meta/ctrl are EXCLUDED (⌘/ctrl+N is
// the browser's new-window chord — never fight the browser); shift is
// ALLOWED (some intl layouts need it to reach the physical N).
//
// The hook never opens over an open dialog's back — the opener decides
// (each shell's own setState); Radix's focus management does the rest.

import { useEffect } from 'react';

/**
 * Pure predicate so the law is testable without a DOM: alt (no meta/ctrl)
 * over the physical N. Shift is allowed; anything else refuses.
 */
export function isNotificationHotkey(e: {
  code: string;
  altKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
}): boolean {
  return e.code === 'KeyN' && e.altKey && !e.metaKey && !e.ctrlKey;
}

export function useNotificationHotkey(onOpen: () => void): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isNotificationHotkey(e)) return;
      e.preventDefault();
      onOpen();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpen]);
}
