// v2.294.0 — the gates learn their window; the engine counts aloud.
//
//   - THE RANGE LENS (feature ⑤): the Most denied gates card breathes over
//     time. deniedGateReport takes an additive `windowLabel` (default '24h'
//     keeps every v2.293.0 pin green byte-for-byte); the route whitelists
//     `?range=24h|7d|30d` and windows BOTH the groupBy and the total count
//     through one `deniedGatesSince`; the response names its window; the
//     card renders a segmented chip lens and refetches per window.
//   - THE ENGINE COUNTS ALOUD (feature ⑤): the lockout's sliding window
//     used to be silent until the lock landed. noteDeniedAndMaybeLock now
//     returns the honest `attemptsRemaining` and the pure `lockoutWarning()`
//     line; the five 403 call sites thread both into the denial body so the
//     user hears "Warning: 2 attempts remaining…" BEFORE the 15-minute lock.
//     The composer lives in the pure permissions.ts home (client-importable,
//     pinned by value); auth.ts imports it, never copies it.
//
// THE TWO-NET LAW: the runtime net pins the windowed voice and the warning
// copy BY VALUE on the REAL functions; the byte net pins the wiring (the
// route's whitelist + windowed queries, the card's lens, the engine's
// return shape, the five call sites).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { deniedGateReport, type DeniedGate } from '@/lib/security-feed';
import { lockoutWarning, LOCKOUT_WARN_AT } from '@/lib/permissions';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const LIB = 'src/lib/security-feed.ts';
const TAB = 'src/app/(shell)/tabs/security-tab.tsx';
const ROUTE = 'src/app/api/security/dashboard/route.ts';
const AUTH = 'src/lib/auth.ts';
const PERMS = 'src/lib/permissions.ts';
const TX = 'src/app/api/transactions/route.ts';
const USERS = 'src/app/api/users/route.ts';
const USERS_ID = 'src/app/api/users/[id]/route.ts';

const g = (resource: string, count: number): DeniedGate => ({ resource, count });

// ---- the range lens (runtime net) ------------------------------------------

describe('deniedGateReport — the windowed voice (v2.294.0)', () => {
  it("the default window stays '24h' — every v2.293.0 pin holds byte-for-byte", () => {
    expect(deniedGateReport(5, [g('/api/users', 5)]).voice).toBe(
      '5 denials in the last 24h, every one named its gate.'
    );
    expect(deniedGateReport(1, [g('/api/users', 1)]).voice).toBe('1 denial in the last 24h.');
  });

  it("the lens widens the sentence: '7d' reads the same arithmetic over a longer window", () => {
    const r = deniedGateReport(9, [g('/api/users', 5), g('/api/leaves', 2)], 5, '7d');
    expect(r.voice).toBe('9 denials in the last 7d — 2 never named their gate.');
    expect(r.namedDenials).toBe(7);
    expect(r.unnamedDenials).toBe(2);
    expect(r.namedDenials + r.unnamedDenials).toBe(9);
    expect(r.top[0].resource).toBe('/api/users');
  });

  it("the singular voice windows too: '1 denial in the last 7d.'", () => {
    expect(deniedGateReport(1, [g('/api/users', 1)], 5, '7d').voice).toBe(
      '1 denial in the last 7d.'
    );
  });

  it("'30d' names the unnamed gap over the widest window", () => {
    const r = deniedGateReport(6, [g('/api/users', 4)], 5, '30d');
    expect(r.voice).toBe('6 denials in the last 30d — 2 never named their gate.');
    expect(r.unnamedDenials).toBe(2);
  });

  it('the window label is interpolated verbatim — the lib never guesses a window', () => {
    // the route owns the whitelist; a bare call with a label just speaks it
    // (all three denials arrived unnamed — the gap is named, never dropped)
    expect(deniedGateReport(3, [], 5, '7d').voice).toBe('3 denials in the last 7d — 3 never named their gate.');
    // the default argument keeps the original surface untouched
    expect(deniedGateReport(0, []).voice).toBe('0 denials in the last 24h, every one named its gate.');
  });
});

// ---- the engine counts aloud (runtime net) ---------------------------------

describe('lockoutWarning — the failed-attempt voice (v2.294.0)', () => {
  it('warns from the third denial: two attempts remaining', () => {
    expect(LOCKOUT_WARN_AT).toBe(2);
    expect(lockoutWarning(2)).toBe('Warning: 2 attempts remaining before a 15-minute lockout.');
  });

  it('the last chance speaks singular', () => {
    expect(lockoutWarning(1)).toBe('Warning: 1 attempt remaining before a 15-minute lockout.');
  });

  it('stays silent when the window is cold, full, or already locked', () => {
    expect(lockoutWarning(0)).toBeNull(); // locked / window full
    expect(lockoutWarning(3)).toBeNull(); // window too cold to shout
    expect(lockoutWarning(4)).toBeNull();
    expect(lockoutWarning(5)).toBeNull();
    expect(lockoutWarning(-1)).toBeNull();
    expect(lockoutWarning(Number.NaN)).toBeNull();
    expect(lockoutWarning(1.5)).toBeNull(); // never a fraction of an attempt
  });
});

// ---- the byte net: the wiring ----------------------------------------------

describe('the range lens wiring (byte net)', () => {
  const lib = readRepo(LIB);
  const route = readRepo(ROUTE);
  const tab = readRepo(TAB);

  it('the lib takes the additive windowLabel with the 24h default', () => {
    expect(lib).toContain('windowLabel = \'24h\'');
    expect(lib).toContain('`1 denial in the last ${windowLabel}.`');
    expect(lib).toContain('`${namedDenials + unnamedDenials} denials in the last ${windowLabel}${');
  });

  it('the route whitelists the three named ranges', () => {
    expect(route).toContain("const DENIED_GATES_RANGES = ['24h', '7d', '30d'] as const;");
    expect(route).toContain("searchParams.get('range')");
    expect(route).toContain(": '24h';");
  });

  it('the route windows BOTH the groupBy and the total through one since', () => {
    expect(route).toContain('const deniedGatesSince =');
    expect(route).toContain('createdAt: { gte: deniedGatesSince }');
    expect(route).toMatch(/createdAt: \{ gte: deniedGatesSince \}/g);
  });

  it('the response voices the windowed report and names its window', () => {
    expect(route).toContain('deniedGateReport(');
    expect(route).toContain('window: deniedGatesRange,');
    expect(route).toContain('deniedGatesRange\n        ),');
  });

  it('the card carries the three-chip lens with pressed state', () => {
    expect(tab).toContain('type GateRange = \'24h\' | \'7d\' | \'30d\';');
    expect(tab).toContain("value: '7d', label: '7 days'");
    expect(tab).toContain('aria-pressed={pressed}');
    expect(tab).toContain('aria-label="Denied gates time window"');
    expect(tab).toContain("'bg-amber-500/10 text-amber-700 border-amber-500/30 font-medium'");
    expect(tab).toContain('transition-colors');
  });

  it('the lens actually refetches: the query and the wire carry the range', () => {
    expect(tab).toContain("queryKey: ['security-dashboard', gateRange]");
    expect(tab).toContain('queryFn: () => fetchDashboard(gateRange)');
    expect(tab).toContain('/api/security/dashboard?range=${gateRange}');
  });

  it('the honest-empty face windows too', () => {
    expect(tab).toContain('No denials in the last {gateRange} — every gate said yes.');
  });

  it('the bars ease between windows (the ④ face)', () => {
    expect(tab).toContain('bg-amber-600 transition-all duration-500');
  });
});

describe('the spoken warning wiring (byte net)', () => {
  const perms = readRepo(PERMS);
  const auth = readRepo(AUTH);
  const tx = readRepo(TX);
  const users = readRepo(USERS);
  const usersId = readRepo(USERS_ID);

  it('the composer lives in the pure home, exact lines pinned', () => {
    expect(perms).toContain('export const LOCKOUT_WARN_AT = 2;');
    expect(perms).toContain('export function lockoutWarning(attemptsRemaining: number): string | null {');
    expect(perms).toContain("'Warning: 1 attempt remaining before a 15-minute lockout.'");
    expect(perms).toContain('`Warning: ${attemptsRemaining} attempts remaining before a 15-minute lockout.`');
  });

  it('auth.ts imports the composer — no local copy', () => {
    expect(auth).toContain('lockoutWarning,');
    expect(auth).not.toMatch(/(?:const|function)\s+lockoutWarning/);
  });

  it('the engine returns the honest count and the warning on every arm', () => {
    // v2.295.0 re-anchor (same law, new bytes): the return shape GREW the
    // lock's own line (`lockNotice`) — the trip arm speaks it, the early
    // arms stay null, and `warning` keeps the v2.294.0 escalation semantics
    // (null on locked arms, the pure line on the warm window).
    expect(auth).toContain('warning: string | null;');
    expect(auth).toContain('lockNotice: string | null;');
    expect(auth).toContain(
      'return { locked: true, attemptsRemaining: 0, warning: null, lockNotice: null };'
    );
    expect(auth).toContain('warning: lockoutWarning(attemptsRemaining),');
    expect(auth).toContain('lockNotice: null,');
    expect(auth).toContain(
      'lockNotice: lockNotice(lockedMinutes) };'
    );
  });

  it('all five call sites thread the warning into their 403 bodies', () => {
    for (const [name, src] of [
      ['transactions gt10', tx],
      ['transactions gt5', tx],
      ['transactions high_risk', tx],
      ['users create', users],
      ['users role change', usersId],
    ] as const) {
      expect(src, name).toContain('const abuse = await noteDeniedAndMaybeLock(');
      expect(src, name).toContain('warning: abuse.warning');
      expect(src, name).toContain('attemptsRemaining: abuse.attemptsRemaining');
    }
    expect(tx.match(/const abuse = await noteDeniedAndMaybeLock\(/g)?.length).toBe(3);
  });
});
