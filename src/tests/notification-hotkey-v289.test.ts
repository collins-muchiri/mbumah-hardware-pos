// v2.289.0 — the bell learns its key.
//
//   - THE GAP: the keyboard shortcut map has carried search (⌘K), the
//     sidebar (⌘B) and the F-tab row since the redesign — but the
//     notification feed had NO shortcut on ANY shell. The
//     "Notifications alt+T" hint in the accessibility tree is Radix's
//     TOAST-VIEWPORT focus hotkey, not ours — it focuses visible toasts,
//     it never opens the feed.
//   - THE KEY: alt+N, wired on BOTH shells — the POS sidebar (which owns
//     the feed's open state) and the HR header bell (v2.288.0's island).
//     One hook, two openers, the same key.
//   - THE MATCH LAW is `e.code === 'KeyN'` (the PHYSICAL key), not
//     `e.key`: option+N on macOS produces 'ñ'/'Dead' in e.key — a
//     character match would silently die on the most keyboard-rich
//     platform. Meta/ctrl are EXCLUDED (⌘/ctrl+N is the browser's
//     new-window chord — never fight the browser); shift is ALLOWED
//     (some intl layouts need it to reach the physical N).
//   - THE HELP DIALOG announces the row (the feed was the one surface
//     the map never named).
//
// THE RUNTIME-PIN LAW (the fourth net): the predicate is a pure function
// — asserted by value with a truth table, not by bytes. The bytes pin the
// wiring (the listener, the cleanup, the two shells, the help row).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { isNotificationHotkey } from '@/hooks/use-notification-hotkey';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const HOOK = 'src/hooks/use-notification-hotkey.ts';
const SIDEBAR = 'src/components/layout/app-sidebar.tsx';
const HRBELL = 'src/components/layout/hr-shell-bell.tsx';
const HELP = 'src/components/keyboard-shortcuts-help.tsx';

const ev = (over: Partial<{ code: string; altKey: boolean; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean }> = {}) => ({
  code: 'KeyN',
  altKey: true,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  ...over,
});

// ── 1. THE MATCH LAW (runtime truth table) ─────────────────────────────────

describe('isNotificationHotkey — the pure predicate (the fourth net)', () => {
  it('alt over the physical N is the bell', () => {
    expect(isNotificationHotkey(ev())).toBe(true);
    expect(isNotificationHotkey(ev({ shiftKey: true }))).toBe(true);
  });

  it('the browser\u2019s chords are never fought (meta/ctrl excluded)', () => {
    expect(isNotificationHotkey(ev({ metaKey: true }))).toBe(false);
    expect(isNotificationHotkey(ev({ ctrlKey: true }))).toBe(false);
    expect(isNotificationHotkey(ev({ metaKey: true, ctrlKey: true }))).toBe(false);
  });

  it('alt alone over another key, or a bare N, stay silent', () => {
    expect(isNotificationHotkey(ev({ code: 'KeyM' }))).toBe(false);
    expect(isNotificationHotkey(ev({ altKey: false }))).toBe(false);
    expect(isNotificationHotkey(ev({ code: 'Digit1' }))).toBe(false);
  });

  it('the law lives on e.code, not the produced character (the mac \u00f1 trap)', () => {
    // on macOS, option+N sets e.key to 'ñ'/'Dead' while e.code stays KeyN —
    // the predicate receives the code-shaped event and still rings.
    expect(isNotificationHotkey({ code: 'KeyN', altKey: true, metaKey: false, ctrlKey: false })).toBe(true);
  });
});

// ── 2. The hook: the listener, the cleanup, the preventDefault ─────────────

describe('the hook wires one keydown listener per shell', () => {
  const src = () => readRepo(HOOK);

  it('the hook is a client island with the document listener and its teardown', () => {
    const s = src();
    expect(s.startsWith("'use client'")).toBe(true);
    expect(s).toContain("document.addEventListener('keydown', handleKeyDown)");
    expect(s).toContain("document.removeEventListener('keydown', handleKeyDown)");
    expect(s).toContain('useEffect');
  });

  it('the handler claims the key (preventDefault) before opening', () => {
    expect(src()).toContain('e.preventDefault();');
  });

  it('the handler delegates to the pure predicate (one law, tested above)', () => {
    expect(src()).toContain('if (!isNotificationHotkey(e)) return;');
  });

  it('the effect re-subscribes only when the opener identity changes', () => {
    expect(src()).toContain('[onOpen]');
  });
});

// ── 3. Both shells wire the SAME hook to their own opener ──────────────────

describe('one key, two openers, never a copy', () => {
  it('the POS sidebar wires alt+N to its bell state', () => {
    const s = readRepo(SIDEBAR);
    expect(s).toContain("import { useNotificationHotkey } from '@/hooks/use-notification-hotkey';");
    expect(s).toContain('useNotificationHotkey(useCallback(() => setNotificationOpen(true), []));');
  });

  it('the HR header bell wires alt+N to its own sheet', () => {
    const s = readRepo(HRBELL);
    expect(s).toContain("import { useNotificationHotkey } from '@/hooks/use-notification-hotkey';");
    expect(s).toContain('useNotificationHotkey(useCallback(() => setOpen(true), []));');
  });

  it('each opener is identity-stable (useCallback — the listener never churns)', () => {
    expect(readRepo(SIDEBAR)).toMatch(/useCallback\(\(\) => setNotificationOpen\(true\), \[\]\)/);
    expect(readRepo(HRBELL)).toMatch(/useCallback\(\(\) => setOpen\(true\), \[\]\)/);
  });
});

// ── 4. The help dialog announces the row ───────────────────────────────────

describe('the shortcut map speaks the bell', () => {
  const src = () => readRepo(HELP);

  it('the Alt+N row exists with the bell icon', () => {
    const s = src();
    expect(s).toContain("{ keys: 'Alt+N', description: 'Open notifications', icon: Bell }");
    expect(s).toContain('Bell,');
  });

  it('the incumbent rows survive (search, checkout, the help row)', () => {
    const s = src();
    expect(s).toContain("keys: '⌘K / Ctrl+K'");
    expect(s).toContain("keys: 'F9'");
    expect(s).toContain("keys: '? / Ctrl+/'");
  });

  it('the row sits in the F-row family, before Esc (reading order)', () => {
    const s = src();
    const bell = s.indexOf("keys: 'Alt+N'");
    const f10 = s.indexOf("keys: 'F10'");
    const esc = s.indexOf("keys: 'Esc'");
    expect(bell).toBeGreaterThan(f10);
    expect(bell).toBeLessThan(esc);
  });
});

// ── 5. The toast viewport hint is NOT ours (the honest boundary) ───────────

describe('the alt+T annotation stays Radix\u2019s, unmimicked', () => {
  it('no shell registers a toast-region hotkey of its own (alt+T is the toast viewport\u2019s)', () => {
    const s = readRepo(HOOK);
    expect(s).not.toContain("code === 'KeyT'");
    expect(s).not.toContain("'alt+T'");
  });
});
