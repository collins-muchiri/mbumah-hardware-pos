// v2.293.0 — the dashboard speaks the feed's language.
//
//   - THE ONE VOCABULARY COMPLETES: the security dashboard tab (the
//     /api/security/dashboard consumer) carried its OWN copy of
//     EVENT_TYPE_LABELS (12 entries) and SEVERITY_BG (5 faces) — the same
//     drift-waiting-to-happen the feed had before v2.292.0. The lib's map
//     grows to the dashboard's twelve; the tab's local copies die; both
//     surfaces import one home.
//   - THE TONE LAW LEARNS CRITICAL: severity CRITICAL joins ERROR in the
//     red family — the wire's loudest severity can never land on a quiet
//     slate row. The feed's rows never carried it; the dashboard's
//     recent-critical table does, and now both wear the same
//     securityRowTone verdict through the same SECURITY_TONE_CLASSES.
//   - THE GATE-HEAT REPORT: the denial ledger (v2.292.0) made every refusal
//     land on the record; the dashboard now reads it back. deniedGateReport
//     voices the aggregate — top gates by count, the unnamed-denials
//     honesty gap, a subtitle that always adds up. The route groups the
//     PERMISSION_DENIED rows by resource; the pure lib does the math; the
//     card renders bars, never re-counts.
//
// THE TWO-NET LAW: the runtime net pins the tone table, the label map, the
// badge faces and the report arithmetic BY VALUE on the REAL functions; the
// byte net pins the wiring (the lib imports, the dead local copies, the
// route's groupBy, the card's face).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  ABUSE_EVENT_TYPES,
  EVENT_TYPE_LABELS,
  SECURITY_SEVERITY_BADGE_CLASSES,
  SECURITY_TONE_CLASSES,
  deniedGateReport,
  securityRowTone,
  type DeniedGate,
} from '@/lib/security-feed';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const LIB = 'src/lib/security-feed.ts';
const TAB = 'src/app/(shell)/tabs/security-tab.tsx';
const ROUTE = 'src/app/api/security/dashboard/route.ts';

// ---- the tone law learns CRITICAL (runtime net) -----------------------------

describe('securityRowTone — CRITICAL joins the red family (v2.293.0)', () => {
  it('CRITICAL severity is red — the loudest wire truth can never sit quiet', () => {
    expect(securityRowTone('UNKNOWN_TYPE', 'CRITICAL')).toBe('error');
    expect(securityRowTone('SOMETHING_NEW', 'CRITICAL')).toBe('error');
    expect(securityRowTone('MANAGER_AUTHORIZED', 'CRITICAL')).toBe('error');
  });

  it('the incumbents hold: ERROR red, WARN amber, severity leads type', () => {
    expect(securityRowTone('PERMISSION_DENIED', 'ERROR')).toBe('error');
    expect(securityRowTone('PERMISSION_DENIED', 'WARN')).toBe('warn');
    expect(securityRowTone('PERMISSION_DENIED', 'INFO')).toBe('warn');
  });

  it('the type-fills and quiet arms survive unchanged', () => {
    expect(securityRowTone('ACCOUNT_LOCKED')).toBe('error');
    expect(securityRowTone('BRUTE_FORCE')).toBe('error');
    expect(securityRowTone('SOMETHING_NEW')).toBe('info');
    expect(securityRowTone('SOMETHING_NEW', 'DEBUG')).toBe('info');
  });

  it('the verdict stays exactly three-valued', () => {
    const verdicts = new Set([
      securityRowTone('ACCOUNT_LOCKED', 'CRITICAL'),
      securityRowTone('PERMISSION_DENIED', 'WARN'),
      securityRowTone('INVALID_INPUT', 'INFO'),
      securityRowTone('WHATEVER'),
    ]);
    expect([...verdicts].sort()).toEqual(['error', 'info', 'warn']);
  });
});

// ---- the one vocabulary (runtime net) ---------------------------------------

describe('EVENT_TYPE_LABELS — the dashboard twelve, one home', () => {
  it('carries exactly the twelve keys both surfaces speak', () => {
    expect(Object.keys(EVENT_TYPE_LABELS).sort()).toEqual(
      [
        'ACCOUNT_LOCKED',
        'BRUTE_FORCE',
        'CSRF_FAILED',
        'HIGH_RISK_ATTEMPT',
        'INVALID_INPUT',
        'MANAGER_AUTHORIZED',
        'PERMISSION_DENIED',
        'PRIVILEGE_ABUSE_PATTERN',
        'RATE_LIMITED',
        'SESSION_HIJACK_ATTEMPT',
        'SUSPICIOUS_ACTIVITY',
        'UNAUTHORIZED_ACCESS',
      ].sort()
    );
  });

  it('every abuse type has a shop-floor label', () => {
    for (const t of ABUSE_EVENT_TYPES) {
      expect(EVENT_TYPE_LABELS[t], `${t} must be labeled`).toBeTruthy();
    }
  });

  it('the dashboard tab\u2019s former local set is fully covered by the lib map', () => {
    // The twelve keys the tab used to carry locally — none may fall back to
    // a raw eventType on either surface.
    const formerLocalKeys = [
      'RATE_LIMITED', 'BRUTE_FORCE', 'CSRF_FAILED', 'INVALID_INPUT',
      'SUSPICIOUS_ACTIVITY', 'ACCOUNT_LOCKED', 'SESSION_HIJACK_ATTEMPT',
      'UNAUTHORIZED_ACCESS', 'PERMISSION_DENIED', 'HIGH_RISK_ATTEMPT',
      'PRIVILEGE_ABUSE_PATTERN', 'MANAGER_AUTHORIZED',
    ];
    for (const k of formerLocalKeys) {
      expect(EVENT_TYPE_LABELS[k], `${k} labeled`).toBeTruthy();
    }
  });

  it('spot values — the words themselves', () => {
    expect(EVENT_TYPE_LABELS['SESSION_HIJACK_ATTEMPT']).toBe('Session Hijack');
    expect(EVENT_TYPE_LABELS['CSRF_FAILED']).toBe('CSRF Failed');
    expect(EVENT_TYPE_LABELS['PERMISSION_DENIED']).toBe('Permission Denied');
  });
});

// ---- the severity badge faces (runtime net) ---------------------------------

describe('SECURITY_SEVERITY_BADGE_CLASSES — the closed five', () => {
  it('exactly the LogSeverity vocabulary, closed set', () => {
    expect(Object.keys(SECURITY_SEVERITY_BADGE_CLASSES).sort()).toEqual(
      ['CRITICAL', 'DEBUG', 'ERROR', 'INFO', 'WARN'].sort()
    );
  });

  it('every face is an outline-badge triad (bg + text + border tokens)', () => {
    for (const [sev, classes] of Object.entries(SECURITY_SEVERITY_BADGE_CLASSES)) {
      expect(classes, `${sev} bg`).toContain('bg-');
      expect(classes, `${sev} text`).toContain('text-');
      expect(classes, `${sev} border`).toContain('border-');
    }
  });

  it('the families: CRITICAL/ERROR the warm reds, WARN amber, INFO blue, DEBUG quiet', () => {
    expect(SECURITY_SEVERITY_BADGE_CLASSES.CRITICAL).toContain('red-500');
    expect(SECURITY_SEVERITY_BADGE_CLASSES.ERROR).toContain('orange-500');
    expect(SECURITY_SEVERITY_BADGE_CLASSES.WARN).toContain('yellow-500');
    expect(SECURITY_SEVERITY_BADGE_CLASSES.INFO).toContain('blue-500');
    expect(SECURITY_SEVERITY_BADGE_CLASSES.DEBUG).toContain('gray-400');
  });
});

// ---- the gate-heat report (runtime net) --------------------------------------

describe('deniedGateReport — which gates say no most', () => {
  const g = (resource: string, count: number): DeniedGate => ({ resource, count });

  it('sorts by count desc, ties broken by path for determinism', () => {
    const r = deniedGateReport(6, [g('/api/b', 2), g('/api/a', 2), g('/api/c', 3)]);
    expect(r.top.map((x) => x.resource)).toEqual(['/api/c', '/api/a', '/api/b']);
  });

  it('keeps only the top limit (default 5)', () => {
    const r = deniedGateReport(10, [
      g('/a', 1), g('/b', 2), g('/c', 3), g('/d', 4),
      g('/e', 5), g('/f', 6), g('/g', 7),
    ]);
    expect(r.top).toHaveLength(5);
    expect(r.top.map((x) => x.resource)).toEqual(['/g', '/f', '/e', '/d', '/c']);
    expect(r.maxCount).toBe(7);
  });

  it('the honesty arithmetic: named + unnamed = total, never silently vanished', () => {
    const r = deniedGateReport(9, [g('/api/users', 5), g('/api/leaves', 2)]);
    expect(r.namedDenials).toBe(7);
    expect(r.unnamedDenials).toBe(2);
    expect(r.namedDenials + r.unnamedDenials).toBe(9);
  });

  it('the voice adds up: all named reads so', () => {
    expect(deniedGateReport(5, [g('/api/users', 5)]).voice).toBe(
      '5 denials in the last 24h, every one named its gate.'
    );
  });

  it('the voice names the unnamed gap', () => {
    expect(deniedGateReport(6, [g('/api/users', 5)]).voice).toBe(
      '6 denials in the last 24h — 1 never named their gate.'
    );
  });

  it('singular denial reads in shop-floor singular', () => {
    expect(deniedGateReport(1, [g('/api/users', 1)]).voice).toBe('1 denial in the last 24h.');
  });

  it('empty input is honest zero — no NaN, no fake bars', () => {
    const r = deniedGateReport(0, []);
    expect(r.top).toEqual([]);
    expect(r.maxCount).toBe(0);
    expect(r.namedDenials).toBe(0);
    expect(r.unnamedDenials).toBe(0);
    expect(r.voice).toBe('0 denials in the last 24h, every one named its gate.');
  });

  it('maxCount feeds the bar math (the render site never re-counts)', () => {
    const r = deniedGateReport(8, [g('/a', 8), g('/b', 4), g('/c', 2)]);
    expect(r.maxCount).toBe(8);
    // bar widths the face will compute: 100%, 50%, 25%
    const widths = r.top.map((x) => Math.round((x.count / r.maxCount) * 100));
    expect(widths).toEqual([100, 50, 25]);
  });
});

// ---- the byte net: the tab imports, never copies -----------------------------

describe('the dashboard tab — one vocabulary, tone-wearing rows (byte net)', () => {
  const tab = readRepo(TAB);

  it('imports the lib\u2019s vocabulary, tone law, badge faces and report', () => {
    expect(tab).toContain("from '@/lib/security-feed'");
    for (const name of [
      'EVENT_TYPE_LABELS',
      'SECURITY_TONE_CLASSES',
      'SECURITY_SEVERITY_BADGE_CLASSES',
      'securityRowTone',
      'deniedGateReport',
    ]) {
      expect(tab).toContain(name);
    }
  });

  it('the local copies are DEAD — no const EVENT_TYPE_LABELS, no const SEVERITY_BG', () => {
    expect(tab).not.toMatch(/const EVENT_TYPE_LABELS\s*:/);
    expect(tab).not.toMatch(/const SEVERITY_BG\s*:/);
  });

  it('SeverityBadge wears the lib\u2019s closed set', () => {
    expect(tab).toMatch(/SECURITY_SEVERITY_BADGE_CLASSES\[severity\]/);
  });

  it('the recent-critical rows wear the tone law (same function as the feed)', () => {
    expect(tab).toMatch(/SECURITY_TONE_CLASSES\[securityRowTone\(event\.eventType, event\.severity\)\]\.row/);
  });

  it('the Most denied gates card exists with its honest faces', () => {
    expect(tab).toContain('Most denied gates');
    // v2.294.0 re-anchor: the honest-empty face learned the window — the
    // same voice, now interpolated with the card's live lens.
    expect(tab).toContain('No denials in the last {gateRange} — every gate said yes.');
    expect(tab).toMatch(/bg-amber-600/);
    expect(tab).toMatch(/deniedGates\.voice/);
    expect(tab).toMatch(/deniedGates\.maxCount/);
  });

  it('fetchDashboard maps the wire\u2019s deniedGates aggregate', () => {
    expect(tab).toMatch(/deniedGates: data\?\.deniedGates \?\?/);
  });

  it('the chart fills stay local — a different surface, its own v2.204.0 palette', () => {
    expect(tab).toMatch(/const SEVERITY_COLORS: Record<string, string>/);
    expect(tab).toMatch(/const EVENT_TYPE_COLORS: Record<string, string>/);
  });
});

// ---- the byte net: the route groups, the lib voices ---------------------------

describe('the dashboard route — the gate-heat query (byte net)', () => {
  const route = readRepo(ROUTE);

  it('imports the pure report from the lib', () => {
    expect(route).toContain("import { deniedGateReport } from '@/lib/security-feed'");
  });

  it('groups PERMISSION_DENIED rows by the recorded resource, top-10 take', () => {
    expect(route).toMatch(/eventType: 'PERMISSION_DENIED'/);
    expect(route).toMatch(/by: \['resource'\]/);
    expect(route).toMatch(/resource: \{ not: null \}/);
    expect(route).toMatch(/take: 10/);
  });

  it('counts the 24h denial total so the voice can name the unnamed gap', () => {
    expect(route).toMatch(/totalDenied24h/);
  });

  it('the response wires deniedGateReport over the grouped rows', () => {
    // v2.294.0 re-anchor: the report is spread into a windowed shape —
    // same lib voice, plus the route naming the window it answered for.
    expect(route).toMatch(/deniedGates: \{\s*\.\.\.deniedGateReport\(/);
  });
});

// ---- the byte net: the lib carries the report ---------------------------------

describe('the lib — the report lives beside the vocabulary (byte net)', () => {
  const lib = readRepo(LIB);

  it('exports the report function and its row shape', () => {
    expect(lib).toContain('export function deniedGateReport(');
    expect(lib).toContain('export interface DeniedGate');
  });

  it('the tone law\u2019s CRITICAL arm is documented on the function', () => {
    expect(lib).toMatch(/CRITICAL joins ERROR in the red family/);
  });

  it('the tone classes keep their shape — row + icon per tone', () => {
    for (const tone of ['error', 'warn', 'info'] as const) {
      expect(SECURITY_TONE_CLASSES[tone].row).toBeTruthy();
      expect(SECURITY_TONE_CLASSES[tone].icon).toBeTruthy();
    }
  });
});
