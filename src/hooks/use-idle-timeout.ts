'use client';

import { useEffect, useRef, useCallback } from 'react';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

/**
 * v2.435.0 - the OPTIONAL grace window. The till surface never passes this
 * (its v2.6.0 contract stays byte-identical: no options, no warning timer,
 * the timeout fires straight into onTimeout). The self-service watch passes
 * { warnBeforeMs, onWarning } so the portal can speak BEFORE the lock: the
 * warning fires exactly (timeoutMs - warnBeforeMs) after the last activity,
 * the same instant the countdown strip starts ticking - the two clocks
 * agree because they hang off the ONE setTimeout schedule.
 */
export interface IdleTimeoutOptions {
  /** How long BEFORE the timeout the warning fires (must be < timeoutMs). */
  warnBeforeMs?: number;
  /** Called once when the warning window opens. */
  onWarning?: () => void;
}

export function useIdleTimeout(
  onTimeout: () => void,
  timeoutMs: number = IDLE_TIMEOUT_MS,
  options?: IdleTimeoutOptions,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  // The grace options ride as VALUES (never a render-time ref write): the
  // component passes stable primitives (a module const + a useCallback'd
  // handler), so the deps below stay steady across renders. A caller that
  // passes fresh inline closures re-arms the timers — the honest cost of
  // an unstable option, and the till (no options at all) feels nothing.
  const warnBeforeMs = options?.warnBeforeMs;
  const onWarning = options?.onWarning;

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Save current state to localStorage for recovery
    try {
      localStorage.setItem('mbt_last_activity', new Date().toISOString());
    } catch { /* ignore */ }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // The grace window (optional — absent options schedule nothing, so the
    // till's timer web is untouched).
    if (onWarning && warnBeforeMs && warnBeforeMs > 0 && warnBeforeMs < timeoutMs) {
      warningTimerRef.current = setTimeout(() => {
        onWarning();
      }, timeoutMs - warnBeforeMs);
    }

    timerRef.current = setTimeout(() => {
      // Save state before timeout
      try {
        const state = {
          timestamp: new Date().toISOString(),
          reason: 'idle_timeout',
        };
        localStorage.setItem('mbt_session_state', JSON.stringify(state));
      } catch { /* ignore */ }

      onTimeout();
    }, timeoutMs);
  }, [onTimeout, timeoutMs, warnBeforeMs, onWarning]);

  useEffect(() => {
    // Check if we have a saved state to recover
    try {
      const savedState = localStorage.getItem('mbt_session_state');
      const lastActivity = localStorage.getItem('mbt_last_activity');
      if (savedState && lastActivity) {
        const parsed = JSON.parse(savedState);
        const lastTime = new Date(lastActivity).getTime();
        const elapsed = Date.now() - lastTime;

        if (elapsed < timeoutMs && parsed.reason === 'idle_timeout') {
          // Session can be recovered - clear the saved state
          localStorage.removeItem('mbt_session_state');
        }
      }
    } catch { /* ignore */ }

    resetTimer();

    const handleActivity = () => {
      resetTimer();
    };

    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer, timeoutMs]);

  // v2.435.0: the re-arm handle. The till ignores the return object (its
  // v2.6.0 contract unchanged); the self-service watch calls it from the
  // grace strip's Stay-signed-in button so ONE reset owns both timers.
  return { lastActivity: lastActivityRef, resetTimer };
}
