// v2.287.0 — the desk wears its unread bells.
//
//   - THE BEACON FAMILY'S NEWEST MEMBER: a digest bell lands on a tab of
//     the reports desk; while the visitor sits on a DIFFERENT tab, that
//     landing tab's trigger wears the amber dot. The desk whispers where
//     the unread walk goes, visible from across the desk. A bell is
//     waiting for a reader, so its dot PULSES (animate-pulse) — the
//     performance desk's v2.286.0 filter beacons sit still, and the two
//     meanings stay distinguishable at a glance.
//   - THE ONE SEAM: the schedule vocabulary's client-safe half (the report
//     keys, the tab landings, the URL overrides) moved to
//     report-desk-links.ts — pure, no server imports, because a client
//     component can never import report-schedule-service (it pulls db).
//     The service RE-EXPORTS everything it owned before: one vocabulary,
//     never a copy, and every existing importer keeps its exact path.
//   - THE SHARED READ STATE: the beacons read the same external store the
//     notification center writes (mbt_read_notifications /
//     mbt_dismissed_notifications), so a bell read in the feed goes dark
//     on the desk in the same tick. The feed itself is the BADGE'S OWN
//     query (same cache key) — no extra network.
//   - THE WALK PARSES, IT NEVER GUESSES: a walk lights a tab only when
//     the pathname is exactly /hr/reports and a non-empty ?tab= names it.
//     Performance-pool bells walk /hr/performance — not this desk, never
//     this desk's beacons. A bare /hr/reports (no tab word) lights
//     nothing: the desk's default face is the page's knowledge, the lib
//     refuses to guess it. A drifted tab word is returned verbatim and
//     the PAGE intersects it with its own known tabs — an unknown word
//     lights nothing.
//
// THE RUNTIME-PIN LAW (the fourth net): the walk parser and the beacon
// set-builder are real functions — asserted by value with truth tables,
// not by bytes. The bytes pin the wiring (the seam, the dots, the pulse).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  HR_SCHEDULE_REPORTS,
  REPORT_KEY_TO_TAB,
  REPORT_KEY_TO_URL,
} from '@/lib/hr/report-schedule-service';
import type { HrScheduleReportKey } from '@/lib/hr/report-schedule-service';
import {
  REPORTS_DESK_PATH,
  digestWalkTab,
  digestBeaconTabs,
} from '@/lib/hr/report-desk-links';
import {
  HR_SCHEDULE_REPORTS as LINK_REPORTS,
  REPORT_KEY_TO_TAB as LINK_TABS,
  REPORT_KEY_TO_URL as LINK_URLS,
} from '@/lib/hr/report-desk-links';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const svcSrc = read('src/lib/hr/report-schedule-service.ts');
const deskSrc = read('src/app/(shell)/hr/reports/page.tsx');
const libSrc = read('src/lib/hr/report-desk-links.ts');
const hookSrc = read('src/hooks/use-notification-count.ts');

// ── the seam (RUNTIME pins — one vocabulary, never a copy) ──

describe('the client-safe seam — one vocabulary, re-exported', () => {
  it('the service re-exports the lib\u2019s OWN objects (identity, not a copy)', () => {
    expect(REPORT_KEY_TO_TAB).toBe(LINK_TABS);
    expect(REPORT_KEY_TO_URL).toBe(LINK_URLS);
    expect(HR_SCHEDULE_REPORTS).toBe(LINK_REPORTS);
  });

  it('the tab map keeps every landing the builder ever wrote', () => {
    expect([...LINK_REPORTS]).toEqual([
      'headcount', 'employment-cost', 'absence', 'turnover', 'time-to-hire',
      'statutory-liability', 'leave-utilisation', 'goal-attainment', 'review-cycles',
    ]);
    expect(LINK_TABS['headcount']).toBe('headcount');
    expect(LINK_TABS['employment-cost']).toBe('cost');
    expect(LINK_TABS['time-to-hire']).toBe('tth');
    expect(LINK_TABS['leave-utilisation']).toBe('leave');
    // the two performance pools land on the PERFORMANCE desk (URL override
    // wins), so their TAB values never light a reports-desk beacon — the
    // walk parser reads the URL, and the URL names /hr/performance.
    expect(LINK_TABS['review-cycles']).toBe('reviews');
    expect(LINK_TABS['goal-attainment']).toBe('goals');
    expect(LINK_URLS['review-cycles']).toBe('/hr/performance?tab=reviews');
    expect(LINK_URLS['goal-attainment']).toBe('/hr/performance?tab=goals');
  });

  it('the lib is PURE — no server imports, no client directive', () => {
    expect(libSrc).not.toContain("'use client'");
    expect(libSrc).not.toContain("@/lib/db");
    expect(libSrc).not.toContain('prisma');
  });

  it('the service pulls the seam from the lib and re-exports it at the ONE path', () => {
    expect(svcSrc).toContain("} from './report-desk-links';");
    expect(svcSrc).toContain("export { HR_SCHEDULE_REPORTS, REPORT_KEY_TO_TAB, REPORT_KEY_TO_URL } from './report-desk-links';");
    expect(svcSrc).toContain("export type { HrScheduleReportKey } from './report-desk-links';");
  });

  it('the type is still the lib\u2019s own key union', () => {
    const probe = (k: HrScheduleReportKey) => k;
    expect(probe('headcount')).toBe('headcount');
    expect(probe('review-cycles')).toBe('review-cycles');
  });
});

// ── the walk parser (RUNTIME truth table — the fourth net) ──

describe('digestWalkTab — the walk parses, it never guesses', () => {
  it('a reports-desk walk names its tab', () => {
    expect(digestWalkTab('/hr/reports?tab=headcount')).toBe('headcount');
    expect(digestWalkTab('/hr/reports?tab=cost&storeId=store_juja_main')).toBe('cost');
    expect(digestWalkTab('https://mbumah.example/hr/reports?tab=statutory')).toBe('statutory');
  });

  it('the performance pools\u2019 walks never light this desk', () => {
    expect(digestWalkTab('/hr/performance?tab=reviews&status=DRAFT')).toBeNull();
    expect(digestWalkTab('/hr/performance?tab=goals')).toBeNull();
  });

  it('a bare /hr/reports names no tab (the page\u2019s default is the page\u2019s knowledge)', () => {
    expect(digestWalkTab('/hr/reports')).toBeNull();
    expect(digestWalkTab('/hr/reports?storeId=store_juja_main')).toBeNull();
  });

  it('silence for everything that is not a walk', () => {
    expect(digestWalkTab(null)).toBeNull();
    expect(digestWalkTab(undefined)).toBeNull();
    expect(digestWalkTab('')).toBeNull();
    expect(digestWalkTab('not a url')).toBeNull();
    expect(digestWalkTab('/hr/performance')).toBeNull();
    // the path is compared EXACTLY — a lookalike prefix is not the desk
    expect(digestWalkTab('/hr/reports-archive?tab=headcount')).toBeNull();
    // an empty tab word is no word at all
    expect(digestWalkTab('/hr/reports?tab=')).toBeNull();
  });

  it('the desk path is the constant the page also speaks', () => {
    expect(REPORTS_DESK_PATH).toBe('/hr/reports');
  });
});

// ── the beacon set-builder (RUNTIME truth table — the fourth net) ──

describe('digestBeaconTabs — unread bells light their landing tabs', () => {
  const readIds = new Set<string>(['read-1']);
  const dismissedIds = new Set<string>(['gone-1']);

  it('an unread, undismissed bell lights its landing tab', () => {
    const lit = digestBeaconTabs(
      [{ id: 'hr-1', actionUrl: '/hr/reports?tab=headcount' }],
      readIds,
      dismissedIds,
    );
    expect(lit.has('headcount')).toBe(true);
    expect(lit.size).toBe(1);
  });

  it('a read bell goes dark — the dot answers where, never whether', () => {
    const lit = digestBeaconTabs(
      [{ id: 'read-1', actionUrl: '/hr/reports?tab=headcount' }],
      readIds,
      dismissedIds,
    );
    expect(lit.size).toBe(0);
  });

  it('a dismissed bell goes dark the same way', () => {
    const lit = digestBeaconTabs(
      [{ id: 'gone-1', actionUrl: '/hr/reports?tab=headcount' }],
      readIds,
      dismissedIds,
    );
    expect(lit.size).toBe(0);
  });

  it('bells from other desks light nothing here', () => {
    const lit = digestBeaconTabs(
      [
        { id: 'hr-2', actionUrl: '/hr/performance?tab=reviews&status=DRAFT' },
        { id: 'hr-3', actionUrl: undefined },
        { id: 'hr-4' },
        null,
        undefined,
      ],
      readIds,
      dismissedIds,
    );
    expect(lit.size).toBe(0);
  });

  it('two unread bells on one tab collapse into one entry (the Set law)', () => {
    const lit = digestBeaconTabs(
      [
        { id: 'hr-5', actionUrl: '/hr/reports?tab=cost' },
        { id: 'hr-6', actionUrl: '/hr/reports?tab=cost&storeId=store_juja_main' },
        { id: 'hr-7', actionUrl: '/hr/reports?tab=absence' },
      ],
      readIds,
      dismissedIds,
    );
    expect([...lit].sort()).toEqual(['absence', 'cost']);
  });

  it('a drifted tab word is carried verbatim (the page intersects it with its known tabs)', () => {
    const lit = digestBeaconTabs(
      [{ id: 'hr-8', actionUrl: '/hr/reports?tab=banana' }],
      readIds,
      dismissedIds,
    );
    expect(lit.has('banana')).toBe(true);
  });

  it('no feed, no bells, no light', () => {
    expect(digestBeaconTabs(null, readIds, dismissedIds).size).toBe(0);
    expect(digestBeaconTabs(undefined, readIds, dismissedIds).size).toBe(0);
    expect(digestBeaconTabs([], readIds, dismissedIds).size).toBe(0);
  });
});

// ── the desk wiring (the bytes net — the dots, the pulse, the law) ──

describe('the reports desk wears its unread bells (source pins)', () => {
  it('every digest-carrying trigger carries its beacon dot', () => {
    expect(deskSrc).toContain('data-testid={`${tab}-tab-beacon`}');
    for (const t of ['headcount', 'cost', 'absence', 'leave', 'turnover', 'tth', 'statutory', 'schedules']) {
      expect(deskSrc).toContain(`tab="${t}"`);
    }
  });

  it('the p10/portal/privacy faces carry no digest, so no beacon', () => {
    expect(deskSrc).not.toContain('p10-tab-beacon');
    expect(deskSrc).not.toContain('portal-tab-beacon');
    expect(deskSrc).not.toContain('privacy-tab-beacon');
  });

  it('the dot is aria-hidden and PULSES (an unread bell waits for a reader)', () => {
    const at = deskSrc.indexOf('function TabBeacon');
    const block = deskSrc.slice(at, at + 700);
    expect(block).toContain('aria-hidden');
    expect(block).toContain('animate-pulse');
    expect(block).toContain('bg-amber-500 dark:bg-amber-400');
  });

  it('the beacon never speaks on the tab you are already reading', () => {
    expect(deskSrc).toContain("lit={tab !== 'headcount' && digestBeacons.has('headcount')}");
    expect(deskSrc).toContain("lit={tab !== 'schedules' && (highlightScheduleId !== null || digestBeacons.has('schedules'))}");
  });

  it('the walk\u2019s raw words are intersected with the desk\u2019s own known tabs', () => {
    const at = deskSrc.indexOf('const digestBeacons = useMemo');
    const block = deskSrc.slice(at, at + 400);
    expect(block).toContain('(REPORT_TAB_KEYS as readonly string[]).includes(t)');
  });

  it('the desk reads the shared read-state store and the badge\u2019s feed hook', () => {
    expect(deskSrc).toContain("import { useNotificationCount } from '@/hooks/use-notification-count';");
    expect(deskSrc).toContain("import { useNotificationReadState } from '@/lib/notification-read-state';");
    expect(deskSrc).toContain("import { digestBeaconTabs } from '@/lib/hr/report-desk-links';");
    expect(deskSrc).toContain('const { activeItems } = useNotificationCount(currentStoreId);');
    expect(deskSrc).toContain('const { readIds, dismissedIds } = useNotificationReadState();');
  });

  it('the hook hands the active items to the desk (additive, badge untouched)', () => {
    expect(hookSrc).toContain('activeItems: active,');
    expect(hookSrc).toContain('refetchInterval: 60000,');
  });
});
