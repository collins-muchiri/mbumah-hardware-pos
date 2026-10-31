'use client';

/**
 * FloatingHomeButton - a floating action button (FAB) that appears when the
 * user is authenticated and is NOT already on the dashboard tab. Clicking it
 * navigates to the dashboard (the app's "home").
 *
 * Positioned bottom-right, above the footer, with a subtle pulse + tooltip.
 * Hidden on the login screen (parent conditionally renders it).
 * v2.12.1: also hidden on the POS tab - the fixed bottom-right FAB sat on
 * top of the checkout/summary controls on short viewports ("No FAB overlap").
 * v2.301.0: THE YIELD LAW — the per-tab hide was whack-a-mole. The QA audit
 * caught the FAB sitting PERSISTENTLY on the payroll run door (a 1280×577
 * viewport put the Actions column directly beneath it — a click on
 * "Manage" actuated the FAB and navigated away), and its pulse ring was
 * caught stealing clicks mid-animation. A FAB is convenience; the control
 * under it is the user's actual target. So the FAB now watches the point
 * it occupies: whenever an interactive element (button, link, input, or
 * anything with an interactive role) sits beneath its footprint, the FAB
 * yields — it fades out, drops pointer-events, and leaves the tab order —
 * until the way is clear again. The decision itself is the pure
 * `fabYieldDecision`, exported so tests can pin its law.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Home } from 'lucide-react';
import { useAppStore } from '@/lib/stores';

const INTERACTIVE_TAGS = new Set(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL', 'SUMMARY']);
const INTERACTIVE_ROLES = new Set(['button', 'link', 'tab', 'menuitem', 'checkbox', 'radio', 'switch', 'option']);

function isInteractive(el: Element): boolean {
  if (INTERACTIVE_TAGS.has(el.tagName)) return true;
  const role = el.getAttribute('role');
  return role ? INTERACTIVE_ROLES.has(role) : false;
}

/**
 * The yield decision, PURE: does any element stacked under the FAB's
 * footprint demand the click more than the FAB does?
 *
 * - elements inside the FAB (its own icon, ring, tooltip) never count;
 * - the FAB's own ancestors never count (they contain it);
 * - any OTHER interactive element anywhere in the stack means the FAB
 *   covers something a user may be trying to hit → yield.
 */
export function fabYieldDecision(hits: Element[], fab: Element): boolean {
  return hits.some((el) => {
    if (el === fab || fab.contains(el) || el.contains(fab)) return false;
    return isInteractive(el);
  });
}

/** Sample points across the FAB's rect (center + an inset cross), PURE:
 * returns viewport coordinates to probe with elementsFromPoint. Inset by 6px
 * so rounded corners don't probe empty air. */
export function fabProbePoints(r: { left: number; top: number; right: number; bottom: number; width: number; height: number }): Array<[number, number]> {
  if (r.width === 0 || r.height === 0) return [];
  const inset = 6;
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  return [
    [cx, cy],
    [r.left + inset, r.top + inset],
    [r.right - inset, r.top + inset],
    [r.left + inset, r.bottom - inset],
    [r.right - inset, r.bottom - inset],
  ];
}

export function FloatingHomeButton() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const fabRef = useRef<HTMLButtonElement>(null);
  const [yielded, setYielded] = useState(false);

  // THE YIELD WATCH: scroll (captured — inner containers scroll too),
  // resize, and DOM changes all move controls under the FAB's footprint.
  // Probes are rAF-throttled for scroll/resize and clock-throttled (150ms)
  // for mutations — with a TRAILING call, because the QA walk caught the
  // abandon bug: a table render's last mutation lands inside the throttle
  // window and without a trailing probe the FAB never re-checks the final
  // layout (the door sat uncovered-by-decision forever).
  useEffect(() => {
    const probe = () => {
      const fab = fabRef.current;
      if (!fab) return;
      const r = fab.getBoundingClientRect();
      const points = fabProbePoints(r);
      if (points.length === 0) return;
      const hits = points.flatMap(([x, y]) => Array.from(document.elementsFromPoint(x, y)));
      setYielded(fabYieldDecision(hits, fab));
    };
    let raf = 0;
    let lastMutationProbe = 0;
    let trailingTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduled = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        probe();
      });
    };
    const onMutate = () => {
      const now = Date.now();
      if (now - lastMutationProbe < 150) {
        // Leading probe already spent (or spent within the window): arm a
        // TRAILING probe so the FINAL layout is always measured — the last
        // mutation is the one that decides what the FAB stands on.
        if (!trailingTimer) {
          trailingTimer = setTimeout(() => {
            trailingTimer = null;
            lastMutationProbe = Date.now();
            scheduled();
          }, 150 - (now - lastMutationProbe));
        }
        return;
      }
      lastMutationProbe = now;
      scheduled();
    };
    scheduled();
    window.addEventListener('scroll', scheduled, { passive: true, capture: true });
    window.addEventListener('resize', scheduled, { passive: true });
    const mo = new MutationObserver(onMutate);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener('scroll', scheduled, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', scheduled);
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (trailingTimer) clearTimeout(trailingTimer);
    };
  }, []);

  // Hide when already on dashboard - no need to show a "go home" button on home.
  // Hide on POS too - the FAB overlaps the checkout area (v2.12.1 hotfix).
  if (activeTab === 'dashboard' || activeTab === 'pos') return null;

  return (
    <button
      ref={fabRef}
      onClick={() => setActiveTab('dashboard')}
      aria-label="Go to Dashboard"
      aria-hidden={yielded || undefined}
      tabIndex={yielded ? -1 : 0}
      title="Back to Dashboard (Home)"
      className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4 duration-300 ${yielded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Pulse ring - pointer-events-none: the 2x ping keyframe sweeps past
          the button's own bounds and was caught stealing clicks from
          right-edge controls (the payroll run door, the shortcuts button).
          Decorative animation never intercepts pointers (v2.301.0). */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-primary/40 animate-ping opacity-30" />
      <Home className="h-6 w-6 relative z-10 transition-transform group-hover:scale-110" />
      {/* Tooltip */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Dashboard
      </span>
    </button>
  );
}
