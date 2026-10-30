// v2.297.0 — the drill names its deniers.
//
//   - THE ACTOR ON EVERY ROW (feature ⑤): the drill listed 10 anonymous
//     denials — severity, label, IP, time — while the feed's Security tab
//     (v2.292.0) already spoke WHO stood behind each record and WHICH gate
//     key refused them. The recorder writes `details: { role, permission,
//     email }` (auth.ts recordPermissionDenied); the events API spreads the
//     row with that field parsed; the drill's face simply never named it.
//     Now every drill row carries the actor line — the email, the role pill,
//     the permission pill — the feed's own contract, and an anonymous row
//     says the vocabulary's one word ('Unknown user') instead of a guessed
//     name.
//   - THE DISTINCT COUNT (feature ⑤): the drill's subtitle grows an
//     aggregate line — how many DIFFERENT accounts stand behind the denials
//     on screen. "One misconfigured device or ten accounts hammering the
//     gate" is the first question a triager asks; the count answers it.
//     THE HONESTY LAWS: an anonymous row never inflates the count (a null
//     email is an unknown, not a third actor); an all-anonymous ledger
//     stays silent (null, not "0 actors"); an UNFINISHED walk never claims
//     the unseen rows — it names the slice actually shown ("the first 8 of
//     10 denials shown").
//   - THE ONE PARSE (the codebase's own law): drillActorFromDetails is the
//     single guarded parse — a string gets one JSON.parse attempt, garbage
//     dies quietly, each of the three words lands ONLY when it is a
//     non-empty string. ONE parse per shown row feeds BOTH the row faces
//     and the aggregate count (drillActors[i] is the row's identity; the
//     count consumes the same array — never two parses).
//
// THE TWO-NET LAW: the runtime net pins the parse, the count and the voice
// BY VALUE on the REAL functions; the byte net pins the wiring (the lib's
// exports, the tab's single-parse compute, the row's actor faces, the
// aggregate line, the interface field).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  DRILL_UNKNOWN_ACTOR,
  drillActorFromDetails,
  distinctActorEmails,
  gateDrillActorVoice,
} from '@/lib/security-feed';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const LIB = 'src/lib/security-feed.ts';
const TAB = 'src/app/(shell)/tabs/security-tab.tsx';

// ---- the ONE parse (runtime net) ---------------------------------------------

describe('drillActorFromDetails — the ONE parse (v2.297.0)', () => {
  it('the recorder\u2019s own payload parses to the full identity', () => {
    expect(
      drillActorFromDetails({ role: 'CASHIER', permission: 'roles:HR_MANAGER|STORE_OWNER', email: 'cashier@mbumahhardware.co.ke' })
    ).toEqual({
      email: 'cashier@mbumahhardware.co.ke',
      role: 'CASHIER',
      permission: 'roles:HR_MANAGER|STORE_OWNER',
    });
  });

  it('a raw JSON string (an older wire) gets its one guarded parse', () => {
    expect(
      drillActorFromDetails('{"role":"CASHIER","permission":"pos.void","email":"g@x.co.ke"}')
    ).toEqual({ email: 'g@x.co.ke', role: 'CASHIER', permission: 'pos.void' });
  });

  it('garbage strings and broken JSON die quietly — nulls, never a throw', () => {
    expect(drillActorFromDetails('not json at all')).toEqual({
      email: null,
      role: null,
      permission: null,
    });
    expect(drillActorFromDetails('{"role":')).toEqual({ email: null, role: null, permission: null });
  });

  it('null, undefined and foreign payloads stay anonymous', () => {
    expect(drillActorFromDetails(null)).toEqual({ email: null, role: null, permission: null });
    expect(drillActorFromDetails(undefined)).toEqual({ email: null, role: null, permission: null });
    expect(drillActorFromDetails(42)).toEqual({ email: null, role: null, permission: null });
    expect(drillActorFromDetails(['CASHIER'])).toEqual({ email: null, role: null, permission: null });
    expect(drillActorFromDetails({ count: 3 })).toEqual({ email: null, role: null, permission: null });
  });

  it('each word lands only when it is a non-empty string — partial identities are honest', () => {
    expect(drillActorFromDetails({ email: 'a@b.c' })).toEqual({
      email: 'a@b.c',
      role: null,
      permission: null,
    });
    expect(drillActorFromDetails({ role: '', email: '   ', permission: null })).toEqual({
      email: null,
      role: null,
      permission: null,
    });
    expect(drillActorFromDetails({ email: 123, role: true })).toEqual({
      email: null,
      role: null,
      permission: null,
    });
  });

  it('the parse never throws on the hostile shapes', () => {
    expect(() => drillActorFromDetails('{"role":')).not.toThrow();
    expect(() => drillActorFromDetails(NaN)).not.toThrow();
    expect(() => drillActorFromDetails({ email: { nested: true } })).not.toThrow();
  });
});

// ---- the distinct count (runtime net) ----------------------------------------

describe('distinctActorEmails — the count never lies (v2.297.0)', () => {
  const actor = (email: string | null) => ({ email, role: null, permission: null });

  it('counts distinct non-null emails', () => {
    expect(distinctActorEmails([actor('a@x.co.ke'), actor('b@x.co.ke'), actor('a@x.co.ke')])).toBe(2);
  });

  it('an anonymous row is an unknown, not a third actor', () => {
    expect(distinctActorEmails([actor('a@x.co.ke'), actor(null), actor(null)])).toBe(1);
  });

  it('an all-anonymous ledger counts zero — and the voice stays silent', () => {
    expect(distinctActorEmails([actor(null), actor(null)])).toBe(0);
  });

  it('the empty ledger counts zero', () => {
    expect(distinctActorEmails([])).toBe(0);
  });
});

// ---- the actor voice (runtime net) --------------------------------------------

describe('gateDrillActorVoice — the honest aggregate (v2.297.0)', () => {
  it('zero actors speaks NOTHING — the panel never dresses an anonymous ledger', () => {
    expect(gateDrillActorVoice(0, 8, 10)).toBeNull();
  });

  it('the complete window names itself — all the denials, singular grammar exact', () => {
    expect(gateDrillActorVoice(1, 10, 10)).toBe('1 actor behind all 10 denials in this window.');
    expect(gateDrillActorVoice(3, 10, 10)).toBe('3 actors behind all 10 denials in this window.');
  });

  it('the single-denial complete window speaks the singular denial', () => {
    expect(gateDrillActorVoice(1, 1, 1)).toBe('1 actor behind all 1 denial in this window.');
  });

  it('an unfinished walk NEVER claims the unseen — it names the slice shown', () => {
    expect(gateDrillActorVoice(2, 8, 10)).toBe('2 actors behind the first 8 of 10 denials shown.');
    expect(gateDrillActorVoice(1, 8, 10)).toBe('1 actor behind the first 8 of 10 denials shown.');
  });

  it('shown >= total is complete (a shrunken ledger too), never "first N of fewer"', () => {
    expect(gateDrillActorVoice(2, 12, 10)).toBe('2 actors behind all 10 denials in this window.');
  });

  it('non-finite actors stay silent — a broken count invents nothing', () => {
    expect(gateDrillActorVoice(NaN, 8, 10)).toBeNull();
    expect(gateDrillActorVoice(-1, 8, 10)).toBeNull();
  });
});

// ---- the anonymous word (runtime net) -----------------------------------------

describe('DRILL_UNKNOWN_ACTOR — the anonymous word (v2.297.0)', () => {
  it('is the vocabulary\u2019s own word — the one the feed\u2019s Security tab already speaks', () => {
    expect(DRILL_UNKNOWN_ACTOR).toBe('Unknown user');
  });
});

// ---- the byte net -------------------------------------------------------------

describe('the actor wiring (byte net, v2.297.0)', () => {
  it('the lib is the one home — the parse, the count, the voice and the word all live there', () => {
    const lib = readRepo(LIB);
    expect(lib).toContain("export const DRILL_UNKNOWN_ACTOR = 'Unknown user';");
    expect(lib).toContain('export interface DrillActor {');
    expect(lib).toContain('export function drillActorFromDetails(');
    expect(lib).toContain('export function distinctActorEmails(');
    expect(lib).toContain('export function gateDrillActorVoice(');
  });

  it('the drill row carries the details field — typed unknown, the parse is the ONE door', () => {
    const lib = readRepo(LIB);
    expect(lib).toMatch(/export interface GateDrillEvent \{[\s\S]*?details\?: unknown;[\s\S]*?\}/);
  });

  it('the tab imports the actor pieces from the lib, never copies them', () => {
    const tab = readRepo(TAB);
    expect(tab).toMatch(
      /import \{[^}]*drillActorFromDetails[^}]*distinctActorEmails[^}]*gateDrillActorVoice[^}]*DRILL_UNKNOWN_ACTOR[^}]*\} from '@\/lib\/security-feed';/s
    );
    expect(tab).not.toContain('function drillActorFromDetails');
    expect(tab).not.toContain("const DRILL_UNKNOWN_ACTOR");
  });

  it('ONE parse feeds BOTH the row faces and the aggregate — never two parses', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain('const drillActors = drillRows.map((ev) => drillActorFromDetails(ev.details));');
    expect(tab).toMatch(
      /const actorVoice = gateDrillActorVoice\(\s*\n\s*distinctActorEmails\(drillActors\),\s*\n\s*drillRows\.length,\s*\n\s*drillData\?\.total \?\? 0\s*\n\s*\);/
    );
    // the row consumes the SAME parsed array — no second drillActorFromDetails call in the row loop
    const rowLoop = tab.slice(tab.indexOf('drillRows.map((ev, i) => {'));
    expect(rowLoop).not.toContain('drillActorFromDetails(');
    expect(rowLoop).toContain('const actor = drillActors[i];');
  });

  it('the aggregate line rides the drill\u2019s own amber family with its testid', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain('data-testid="gate-drill-actor-line"');
    expect(tab).toMatch(/\{actorVoice \? \(\s*\n\s*<p\s*\n\s*data-testid="gate-drill-actor-line"/);
    expect(tab).toContain('text-amber-700 dark:text-amber-400');
    expect(tab).toContain('<Users className="h-3 w-3 shrink-0" aria-hidden="true" />');
    expect(tab).toContain('<span className="truncate" title={actorVoice}>');
  });

  it('every row speaks its actor — email, role pill, permission pill, the anonymous word', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain('data-testid="gate-drill-actor-row"');
    expect(tab).toContain('data-testid="gate-drill-actor-email"');
    expect(tab).toContain('{actor.email || DRILL_UNKNOWN_ACTOR}');
    expect(tab).toContain('title={actor.email || DRILL_UNKNOWN_ACTOR}');
    expect(tab).toContain('{actor.role ? (');
    expect(tab).toContain('{actor.permission ? (');
    // the pills wear the feed\u2019s own anatomy
    expect(tab).toContain('rounded-full bg-muted text-muted-foreground shrink-0');
    expect(tab).toContain('rounded-full bg-muted text-muted-foreground font-mono shrink-0');
  });

  it('the row\u2019s main line keeps its original faces — the actor line rides BENEATH', () => {
    const tab = readRepo(TAB);
    expect(tab).toMatch(/<div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">\s*\n\s*<Badge/);
    expect(tab).toMatch(/className="mt-0\.5 flex items-center gap-1 flex-wrap min-w-0"/);
  });
});
