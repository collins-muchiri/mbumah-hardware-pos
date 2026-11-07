// THE IDLE GRACE SUITE (v2.435.0) — "the watch confesses its window".
//
// THE STORY: the portal's thirty-minute lock has spoken only AFTER the
// fact since v2.162.0 — the overlay is the receipt, never a warning. This
// round the watch confesses its window BEFORE the lock: in the last sixty
// seconds a floating strip asks "Still there?" with a live countdown and
// the one Stay-signed-in action (the classic idle affordance: warn, then
// lock). The strip and the lock hang off the ONE setTimeout schedule —
// the countdown reaches 0 at the same instant the lock fires, the two
// clocks agree — and every sentence that speaks the window derives its
// number from SELF_SERVICE_IDLE_MINUTES, so the copy can never drift from
// the contract it describes.
//
// Pins:
//  1. the grace strip's rendered anatomy (role=status, aria-live=polite,
//     the tabular countdown, the Stay button) and its countdown ticking.
//  2. THE RE-ARM LAW: Stay signed in closes the strip and re-arms the
//     FULL window through the hook's own reset — one reset owns both
//     timers, the strip returns after another full window.
//  3. THE TWO CLOCKS AGREE: the lock fires the moment the countdown
//     reaches zero, and the logout POST happens EXACTLY ONCE even when
//     both clocks land on the same tick (the didTimeoutRef guard).
//  4. THE DERIVED NUMBER: SELF_SERVICE_IDLE_MINUTES is 30, the overlay
//     renders "30 minutes" with no hardcoded literal in the source, and
//     the 401 sentence derives its number the same way.
//  5. THE TILL IS UNTOUCHED: main-app keeps its bare v2.6.0 call (no
//     options object) — the grace options are the portal's own.
//  6. THE HOOK'S DEGENERATE GRACE: warnBeforeMs >= timeoutMs schedules
//     nothing — the warning never fires, the lock still does.
//  7. THE ABSENT CONTROL: v2.435.0 is not a supplier-maker word — the
//     arc stays fifteen, the idle round queries the null.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { SelfServiceIdleWatch } from '@/components/hr/self-service-idle-watch';
import { releaseArcWord } from '@/lib/release-arc';
import {
  SELF_SERVICE_IDLE_MINUTES,
  SELF_SERVICE_IDLE_MS,
} from '@/lib/session-idle';
import { useIdleTimeout } from '@/hooks/use-idle-timeout';

const MIN = 60 * 1000;
const read = (rel: string) =>
  readFileSync(join(process.cwd(), rel), 'utf8');

const watchSource = read('src/components/hr/self-service-idle-watch.tsx');
const mainAppSource = read('src/components/app/main-app.tsx');
const idleLibSource = read('src/lib/session-idle.ts');

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve()),
  );
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('the grace strip (v2.435.0)', () => {
  it('opens in the last sixty seconds with the live countdown', () => {
    render(<SelfServiceIdleWatch />);
    // Quiet until the window speaks: no strip, no overlay on a fresh mount.
    expect(screen.queryByTestId('self-idle-grace')).toBeNull();
    expect(screen.queryByTestId('self-idle-overlay')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(SELF_SERVICE_IDLE_MS - 60 * 1000);
    });
    const strip = screen.getByTestId('self-idle-grace');
    expect(strip.getAttribute('role')).toBe('status');
    expect(strip.getAttribute('aria-live')).toBe('polite');
    expect(screen.getByText(/Still there\?/)).toBeTruthy();
    expect(screen.getByTestId('self-idle-grace-seconds').textContent).toBe(
      '60s',
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('self-idle-grace-seconds').textContent).toBe(
      '59s',
    );
  });

  it('the countdown digits hold their lane (tabular, amber) and the one action is Stay signed in', () => {
    render(<SelfServiceIdleWatch />);
    act(() => {
      vi.advanceTimersByTime(SELF_SERVICE_IDLE_MS - 60 * 1000);
    });
    const digits = screen.getByTestId('self-idle-grace-seconds');
    expect(digits.className).toContain('tabular-nums');
    expect(digits.className).toContain('font-semibold');
    const stay = screen.getByTestId('self-idle-stay');
    expect(stay.textContent).toContain('Stay signed in');
    // The strip never blocks the page: the wrapper carries pointer-events-none.
    const wrapper = screen.getByTestId('self-idle-grace');
    expect(wrapper.className).toContain('pointer-events-none');
  });

  it('THE RE-ARM LAW: Stay signed in closes the strip and re-arms the full window', () => {
    render(<SelfServiceIdleWatch />);
    act(() => {
      vi.advanceTimersByTime(SELF_SERVICE_IDLE_MS - 60 * 1000);
    });
    expect(screen.getByTestId('self-idle-grace')).toBeTruthy();

    fireEvent.click(screen.getByTestId('self-idle-stay'));
    // The strip yields; the lock did NOT fire; no logout POST was sent.
    expect(screen.queryByTestId('self-idle-grace')).toBeNull();
    expect(screen.queryByTestId('self-idle-overlay')).toBeNull();
    expect(fetch).not.toHaveBeenCalled();

    // Another full window later the strip returns (the reset re-armed
    // BOTH timers — warning and lock — from the click's own instant).
    act(() => {
      vi.advanceTimersByTime(SELF_SERVICE_IDLE_MS - 60 * 1000);
    });
    expect(screen.getByTestId('self-idle-grace')).toBeTruthy();
    expect(screen.getByTestId('self-idle-grace-seconds').textContent).toBe(
      '60s',
    );
  });

  it('THE TWO CLOCKS AGREE: the lock fires at countdown zero and the POST happens exactly once', () => {
    render(<SelfServiceIdleWatch />);
    act(() => {
      vi.advanceTimersByTime(SELF_SERVICE_IDLE_MS - 60 * 1000);
    });
    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });
    // The overlay is the voice now; the strip has yielded.
    expect(screen.getByTestId('self-idle-overlay')).toBeTruthy();
    expect(screen.queryByTestId('self-idle-grace')).toBeNull();
    // Exactly ONE logout POST — the countdown never posts, and the
    // didTimeoutRef guard makes the callback idempotent.
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      keepalive: true,
    });

    // Even a second tick past the lock changes nothing.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('the overlay hint still offers the door back (the v2.163 contract rides along)', () => {
    render(<SelfServiceIdleWatch />);
    act(() => {
      vi.advanceTimersByTime(SELF_SERVICE_IDLE_MS);
    });
    expect(screen.getByTestId('self-idle-hint').textContent).toContain(
      'closes after 30 minutes of inactivity',
    );
    expect(screen.getByTestId('self-idle-return-hint').textContent).toBe(
      'Signing in brings you straight back to this page.',
    );
  });
});

describe('the derived number (the copy can never drift)', () => {
  it('SELF_SERVICE_IDLE_MINUTES is 30 — the window\u2019s human face', () => {
    expect(SELF_SERVICE_IDLE_MINUTES).toBe(30);
    expect(SELF_SERVICE_IDLE_MINUTES).toBe(SELF_SERVICE_IDLE_MS / 60_000);
    // The lib derives it — no second literal of the number lives there.
    expect(idleLibSource).toContain(
      'export const SELF_SERVICE_IDLE_MINUTES = SELF_SERVICE_IDLE_MS / 60_000;',
    );
  });

  it('the overlay hint renders the derived number with no hardcoded literal in the source', () => {
    // The source never speaks "30 minutes" as a literal in the hint —
    // the render above proved the sentence still says 30.
    expect(watchSource).toMatch(
      /closes after \{SELF_SERVICE_IDLE_MINUTES\} minutes of/,
    );
    expect(watchSource).not.toContain('closes after 30 minutes');
    // The 401 sentence derives the same way.
    expect(idleLibSource).toMatch(
      /error: `Signed out after \$\{SELF_SERVICE_IDLE_MINUTES\} minutes of inactivity/,
    );
  });
});

describe('the till is untouched (the v2.6.0 contract byte-kept)', () => {
  it('main-app keeps its bare call — no options object, no grace import', () => {
    expect(mainAppSource).toMatch(/useIdleTimeout\(handleIdleTimeout\)/);
    expect(mainAppSource).not.toContain('warnBeforeMs');
    expect(mainAppSource).not.toContain('IdleTimeoutOptions');
    expect(mainAppSource).not.toContain('SELF_SERVICE_IDLE_MS');
  });

  it('the hook schedules no warning timer when options are absent', () => {
    // A probe component riding the till's exact call shape: no third
    // argument, no warning — the lock fires straight into onTimeout.
    const calls = { warn: 0, lock: 0 };
    function TillProbe() {
      useIdleTimeout(() => {
        calls.lock += 1;
      });
      return null;
    }
    render(<TillProbe />);
    act(() => {
      vi.advanceTimersByTime(30 * MIN);
    });
    expect(calls.lock).toBe(1);
    expect(calls.warn).toBe(0);
  });

  it('the hook\u2019s degenerate grace: warnBeforeMs >= timeoutMs schedules nothing', () => {
    const calls = { warn: 0, lock: 0 };
    function DegenerateProbe() {
      useIdleTimeout(() => {
        calls.lock += 1;
      }, 5 * MIN, { warnBeforeMs: 10 * MIN, onWarning: () => (calls.warn += 1) });
      return null;
    }
    render(<DegenerateProbe />);
    act(() => {
      vi.advanceTimersByTime(5 * MIN);
    });
    expect(calls.warn).toBe(0);
    expect(calls.lock).toBe(1);
  });
});

describe('the absent control (the arc stays fifteen)', () => {
  it('v2.435.0 is not a supplier-maker word — the lookup reads the null', () => {
    expect(releaseArcWord('2.435.0')).toBeNull();
    expect(releaseArcWord('2.434.0')?.ordinal).toBe(15);
  });
});
