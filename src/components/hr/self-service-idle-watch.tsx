'use client';

// MBUMAH HARDWARE POS - self-service idle watch (v2.162.0)
//
// The CLIENT half of the portal's thirty-minute contract. The till surface
// has protected unattended screens since v2.6.0 with useIdleTimeout (30 min
// → clear tokens → login screen); the spec's follow-up question (843.6 /
// 1068.7) asks whether the self-service portal REUSES that mechanism
// safely. This component is the literal answer: it imports the SAME hook
// with the SAME default window, and on timeout it
//   1. POSTs /api/auth/logout so the SERVER session row is deleted too
//      (matching the server-side enforcement in selfServiceGuard /
//      loadSelfPortal — client and server agree, the cookie cannot
//      outlive the row), then
//   2. renders an alertdialog overlay explaining the sign-out, whose only
//      action is Sign in (a security affordance, not a dismissible toast).
//
// The overlay is the safety net for the client path; the server-side idle
// check remains the real enforcement (a script or a re-opened tab cannot
// dodge it). Offline: the logout POST may fail — the overlay still renders
// and the expired server session is dead on the next request anyway.
//
// v2.435.0 - THE GRACE STRIP ("the watch confesses its window"): the lock
// no longer arrives without warning. In the last GRACE_MS of the window a
// floating strip asks "Still there?" with a live countdown and a Stay
// signed in button (the classic idle-timeout affordance: warn, then lock).
// The strip and the hook's timeout hang off the ONE setTimeout schedule —
// the strip reaches 0 at the same instant the lock fires, the two clocks
// agree. Staying signed in re-arms the FULL window through the hook's own
// reset (one reset owns both timers); the server's sliding window re-stamps
// lastActiveAt on the next portal request, so no extra network call is
// needed. Every sentence that speaks the window derives its number from
// SELF_SERVICE_IDLE_MINUTES — the copy can never drift from the constant.
// The logout POST is guarded by didTimeoutRef, so the lock fires at most
// once even if both clocks reach zero on the same tick.

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Clock, LogIn } from 'lucide-react';
import { useIdleTimeout } from '@/hooks/use-idle-timeout';
import {
  buildPortalReturnHref,
  SELF_SERVICE_IDLE_MINUTES,
  SELF_SERVICE_IDLE_MS,
} from '@/lib/session-idle';

/** The grace strip's window: the LAST 60 seconds of the idle timeout. */
const GRACE_MS = 60 * 1000;
const GRACE_SECONDS = GRACE_MS / 1000;

export function SelfServiceIdleWatch() {
  const [timedOut, setTimedOut] = useState(false);
  const [returnPath, setReturnPath] = useState<string | null>(null);
  const [graceOpen, setGraceOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const headingRef = useRef<HTMLParagraphElement | null>(null);
  // The logout POST fires at most once — the strip's zero and the hook's
  // timeout land on the same tick, and only the first caller may speak.
  const didTimeoutRef = useRef(false);

  const handleIdleTimeout = useCallback(() => {
    if (didTimeoutRef.current) return;
    didTimeoutRef.current = true;
    // The strip yields to the lock — the overlay is the only voice now.
    setGraceOpen(false);
    setSecondsLeft(null);
    // Kill the server session (row + cookie) — the same endpoint the
    // portal's future explicit sign-out uses. Fire-and-forget: the overlay
    // must render even if the network is gone.
    fetch('/api/auth/logout', { method: 'POST', keepalive: true }).catch(
      () => {},
    );
    // v2.163.0: remember WHERE the colleague was reading so the sign-in
    // link can carry it as ?next= (the door swings back). Safe: this only
    // ever runs from a client timer, never during SSR/hydration.
    if (typeof window !== 'undefined') {
      setReturnPath(window.location.pathname);
    }
    setTimedOut(true);
  }, []);

  // v2.435.0: the grace strip's opening — the hook fires it exactly
  // GRACE_MS before the lock (the same setTimeout schedule, the two
  // clocks agree).
  const handleGraceWarning = useCallback(() => {
    setSecondsLeft(GRACE_SECONDS);
    setGraceOpen(true);
  }, []);

  // LITERAL REUSE of the till's idle hook (spec 1068.7: "Can self-service
  // reuse auth and idle timeout safely?") — the SAME 30-minute window,
  // passed from the portal's own contract constant (never a second copy of
  // the number), plus the grace strip's optional warning (the till passes
  // no options: byte-identical).
  const { resetTimer } = useIdleTimeout(
    handleIdleTimeout,
    SELF_SERVICE_IDLE_MS,
    { warnBeforeMs: GRACE_MS, onWarning: handleGraceWarning },
  );

  // The strip's countdown: one tick per second while the strip is open.
  // It DISPLAYS only — the hook's own timer is the enforcer; both reach
  // zero together (the two clocks agree), and the countdown never posts.
  useEffect(() => {
    if (!graceOpen || timedOut) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s === null ? null : Math.max(0, s - 1)));
    }, 1000);
    return () => clearInterval(id);
  }, [graceOpen, timedOut]);

  const handleStaySignedIn = useCallback(() => {
    setGraceOpen(false);
    setSecondsLeft(null);
    // Re-arm the FULL window through the hook's own reset — one reset owns
    // both the warning timer and the lock timer. The server's sliding
    // window re-stamps lastActiveAt on the next portal request; no extra
    // network call here.
    resetTimer();
  }, [resetTimer]);

  // Move focus into the dialog when it opens (alertdialog contract).
  useEffect(() => {
    if (timedOut) headingRef.current?.focus();
  }, [timedOut]);

  // THE GRACE STRIP (v2.435.0) — the quiet pre-lock face. A floating pill,
  // amber (the watch's own family), the countdown holding its lane in
  // tabular digits, Stay signed in the one action. It must never block the
  // page (pointer-events-none on the wrapper) and never steal focus — this
  // is a question, not a lock.
  if (!timedOut && graceOpen) {
    return (
      <div
        data-testid="self-idle-grace"
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[55] flex justify-center px-4"
      >
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-amber-500/40 bg-card/95 py-2 pl-3 pr-2 shadow-lg backdrop-blur-sm">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400"
            aria-hidden
          >
            <Clock className="h-4 w-4" />
          </span>
          <p className="text-sm text-foreground">
            Still there? Signing out in{' '}
            <span
              data-testid="self-idle-grace-seconds"
              className="font-semibold tabular-nums text-amber-700 dark:text-amber-400"
            >
              {secondsLeft ?? GRACE_SECONDS}s
            </span>
          </p>
          <button
            type="button"
            data-testid="self-idle-stay"
            onClick={handleStaySignedIn}
            className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Stay signed in
          </button>
        </div>
      </div>
    );
  }

  if (!timedOut) return null;

  return (
    <div
      data-testid="self-idle-overlay"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="self-idle-title"
        aria-describedby="self-idle-hint"
        data-testid="self-idle-dialog"
        className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-card p-6 text-center shadow-2xl"
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400">
          <Clock className="h-6 w-6" aria-hidden />
        </div>
        <p
          id="self-idle-title"
          ref={headingRef}
          tabIndex={-1}
          data-testid="self-idle-title"
          className="text-base font-semibold text-foreground outline-none"
        >
          Signed out for your safety
        </p>
        <p
          id="self-idle-hint"
          data-testid="self-idle-hint"
          className="mt-2 text-sm leading-relaxed text-muted-foreground"
        >
          This portal closes after {SELF_SERVICE_IDLE_MINUTES} minutes of
          inactivity. Your payslips, leave and goals stay private — sign in
          again to continue.
        </p>
        <Link
          href={buildPortalReturnHref(returnPath)}
          data-testid="self-idle-signin"
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <LogIn className="h-4 w-4" aria-hidden /> Sign in
        </Link>
        <p
          data-testid="self-idle-return-hint"
          className="mt-2.5 text-xs leading-relaxed text-muted-foreground"
        >
          Signing in brings you straight back to this page.
        </p>
      </div>
    </div>
  );
}
