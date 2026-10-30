// v2.295.0 — the gates open their ledgers; the lock speaks its own line.
//
//   - THE GATE DRILL (feature ⑤): the Most denied gates card's rows become
//     HANDLES. Clicking a gate opens a drill panel listing exactly the
//     PERMISSION_DENIED records that named that resource — the events API's
//     additive exact-match `?resource=` filter, windowed to the card's lens
//     (GATE_WINDOW_MS), newest 8 with the honest total. The panel speaks the
//     pure gateDrillVoice() subtitle and the honest faces (gateDrillEmptyVoice,
//     the "+N earlier in this window." footer); Escape closes it via a scoped
//     window listener mounted ONLY while a drill is open (the card is not
//     inside a Radix DismissableLayer, so the drill owns its own key law).
//   - THE LOCK'S OWN LINE (feature ⑤): the 403 that TRIPS the lockout used to
//     answer in silence (warning: null by the v2.294.0 escalation law) — only
//     the durable ACCOUNT_LOCKED record + the SUPER_ADMIN notification told
//     the story. The pure lockNotice(lockedMinutes) composer gives the trip
//     response its own answer; `warning` stays null on every locked arm so
//     the v2.294.0 pins hold byte-for-byte; all five 403 call sites thread it.
//
// THE TWO-NET LAW: the runtime net pins the drill voices and the lock line BY
// VALUE on the REAL functions; the byte net pins the wiring (the route's
// resource filter, the card's handles + panel, the engine's return shape, the
// five call sites).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { gateDrillVoice, gateDrillEmptyVoice } from '@/lib/security-feed';
import { lockNotice, lockoutWarning, LOCKOUT_WARN_AT } from '@/lib/permissions';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const LIB = 'src/lib/security-feed.ts';
const TAB = 'src/app/(shell)/tabs/security-tab.tsx';
const EVENTS = 'src/app/api/security/events/route.ts';
const AUTH = 'src/lib/auth.ts';
const PERMS = 'src/lib/permissions.ts';
const TX = 'src/app/api/transactions/route.ts';
const USERS = 'src/app/api/users/route.ts';
const USERS_ID = 'src/app/api/users/[id]/route.ts';

// ---- the gate drill (runtime net) ------------------------------------------

describe('gateDrillVoice — the drill panel\u2019s subtitle (v2.295.0)', () => {
  it('speaks the gate, its count and the default window', () => {
    expect(gateDrillVoice('/api/users', 5)).toBe(
      '5 denials at /api/users in the last 24h.'
    );
  });

  it('the singular count speaks singular', () => {
    expect(gateDrillVoice('/api/leaves', 1)).toBe(
      '1 denial at /api/leaves in the last 24h.'
    );
  });

  it('the lens widens the sentence — the drill answers in the card\u2019s own window', () => {
    expect(gateDrillVoice('/api/users', 9, '7d')).toBe(
      '9 denials at /api/users in the last 7d.'
    );
    expect(gateDrillVoice('/api/users', 2, '30d')).toBe(
      '2 denials at /api/users in the last 30d.'
    );
  });

  it('the count is interpolated verbatim — zero is spoken, never guessed away', () => {
    expect(gateDrillVoice('/api/users', 0)).toBe(
      '0 denials at /api/users in the last 24h.'
    );
  });
});

describe('gateDrillEmptyVoice — the honest-empty face (v2.295.0)', () => {
  it('says the ledger moved instead of rendering a blank box', () => {
    expect(gateDrillEmptyVoice('/api/users')).toBe(
      'No denial records at /api/users right now — the ledger moved since the count.'
    );
  });
});

// ---- the lock's own line (runtime net) --------------------------------------

describe('lockNotice — the trip response\u2019s answer (v2.295.0)', () => {
  it('the default lock duration speaks the full line', () => {
    expect(lockNotice(15)).toBe(
      'Account locked for 15 minutes — too many denied attempts.'
    );
  });

  it('a one-minute lock speaks singular', () => {
    expect(lockNotice(1)).toBe(
      'Account locked for 1 minute — too many denied attempts.'
    );
  });

  it('the silence law: non-positive, fractional and non-finite durations stay null', () => {
    expect(lockNotice(0)).toBeNull();
    expect(lockNotice(-15)).toBeNull();
    expect(lockNotice(1.5)).toBeNull();
    expect(lockNotice(Number.NaN)).toBeNull();
    expect(lockNotice(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('the v2.294.0 escalation law is untouched — the warning voice holds byte-for-byte', () => {
    expect(LOCKOUT_WARN_AT).toBe(2);
    expect(lockoutWarning(2)).toBe(
      'Warning: 2 attempts remaining before a 15-minute lockout.'
    );
    expect(lockoutWarning(1)).toBe(
      'Warning: 1 attempt remaining before a 15-minute lockout.'
    );
    expect(lockoutWarning(0)).toBeNull();
    expect(lockoutWarning(3)).toBeNull();
  });
});

// ---- the byte net -----------------------------------------------------------

describe('the gate drill wiring (byte net, v2.295.0)', () => {
  it('the events route reads ?resource= and filters exact-match', () => {
    const route = readRepo(EVENTS);
    expect(route).toContain("const resource = searchParams.get('resource') || '';");
    expect(route).toContain('if (resource) where.resource = resource;');
  });

  it('the lib exports the drill voices from the one home', () => {
    const lib = readRepo(LIB);
    expect(lib).toContain('export function gateDrillVoice(');
    expect(lib).toContain('export function gateDrillEmptyVoice(');
  });

  it('the card\u2019s rows are handles: a real button with aria-expanded and the drilled face', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain('const [gateDrill, setGateDrill] = useState<string | null>(null);');
    expect(tab).toContain('aria-expanded={drilled}');
    expect(tab).toContain("aria-controls={drilled ? 'gate-drill-panel' : undefined}");
    expect(tab).toContain('bg-amber-500/[0.06]');
    expect(tab).toContain('cursor-pointer hover:bg-muted/50');
    expect(tab).toContain('focus-visible:ring-amber-500/40');
  });

  it('the drill fetch windows itself to the lens and asks exactly the card\u2019s question', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain("const GATE_WINDOW_MS: Record<GateRange, number> = {");
    expect(tab).toContain("resource,");
    expect(tab).toContain("eventType: 'PERMISSION_DENIED',");
    expect(tab).toContain("limit: '8',");
    expect(tab).toContain('GATE_WINDOW_MS[range]');
  });

  it('the drill query is keyed by gate AND lens, enabled only while open', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain("queryKey: ['security-gate-drill', gateDrill, gateRange],");
    expect(tab).toContain('enabled: !!gateDrill,');
    expect(tab).toContain('queryFn: () => fetchGateDrill(gateDrill || \'\', gateRange),');
  });

  it('the panel is a named region that speaks the drill voices and the +N footer', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain("id=\"gate-drill-panel\"");
    expect(tab).toContain('role="region"');
    expect(tab).toContain('aria-label={`Gate drill: ${gateDrill}`}');
    expect(tab).toContain('{gateDrillVoice(gateDrill, drilledCount, gateRange)}');
    expect(tab).toContain('{gateDrillEmptyVoice(gateDrill)}');
    expect(tab).toContain('+{gateDrillQuery.data.total - drillRows.length} earlier in this window.');
    expect(tab).toContain('aria-label="Close gate drill"');
  });

  it('Escape closes the drill — a scoped listener mounted only while open', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain('window.addEventListener(\'keydown\', onKey);');
    expect(tab).toContain('window.removeEventListener(\'keydown\', onKey);');
    expect(tab).toContain("if (e.key === 'Escape') setGateDrill(null);");
    // the listener is armed by the drill's own state, not mounted naked
    expect(tab).toMatch(/useEffect\(\(\) => \{\s*\n\s*if \(!gateDrill\) return;/);
  });
});

describe('the lock\u2019s own line wiring (byte net, v2.295.0)', () => {
  it('permissions.ts is the pure home; auth.ts imports it, never copies it', () => {
    const perms = readRepo(PERMS);
    expect(perms).toContain('export function lockNotice(');
    const auth = readRepo(AUTH);
    expect(auth).toMatch(/import \{[^}]*lockNotice[^}]*\} from '@\/lib\/permissions';/);
    expect(auth).not.toContain('export function lockNotice(');
  });

  it('the return shape grew lockNotice; ONLY the trip arm speaks it', () => {
    const auth = readRepo(AUTH);
    expect(auth).toContain('lockNotice: string | null;');
    expect(auth).toContain(
      'return { locked: true, attemptsRemaining: 0, warning: null, lockNotice: lockNotice(lockedMinutes) };'
    );
    // every other arm stays silent
    expect(auth).toContain(
      'return { locked: true, attemptsRemaining: 0, warning: null, lockNotice: null };'
    );
    expect(auth).toContain('lockNotice: null,');
  });

  it('all five 403 call sites thread the lockNotice spread', () => {
    const spread = '...(abuse.lockNotice ? { lockNotice: abuse.lockNotice } : {})';
    expect(readRepo(TX).split(spread).length - 1).toBe(3);
    expect(readRepo(USERS).split(spread).length - 1).toBe(1);
    expect(readRepo(USERS_ID).split(spread).length - 1).toBe(1);
  });
});
