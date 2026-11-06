import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rateCensus, wireAgeVoice } from '../components/currency-switcher';

/**
 * v2.413.0 — the census rides the org desk.
 *
 * v2.412.0 put the census on the admin card. This round it rides the org
 * desk: the Organization Console renders the same provenance census under
 * its header — no click required — spoken by the same pure voices off the
 * same shared cache (the observer law: enabled:false, the switcher's mount
 * fetch fills it; the strip never fetches). The org reader cannot set
 * rates, so the strip stays on the quiet neutral surface — the amber
 * invitation family is the ACTOR's voice, and this desk's reader is not
 * the actor.
 *
 * The round also shrinks the password-rotation guard's type to what it
 * actually reads ({ url: string } — the widen-and-fix law; a real
 * NextRequest satisfies it structurally, and so does the tests' honest
 * fake — six strict-mode faces stood down, 287 → 281).
 */

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const orgConsole = readRepo('src/components/workspace/org-console.tsx');
const authLib = readRepo('src/lib/auth.ts');

// ── 1. THE OBSERVER LAW (the strip never fetches) ────────────────────────

describe('the org census strip observes, never fetches (v2.413.0)', () => {
  it('rides the SAME shared query key the switcher fills', () => {
    expect(orgConsole).toMatch(
      /import \{ ADMIN_CURRENCY_RATES_QUERY_KEY, CurrencySwitcher, rateCensus, wireAgeVoice, type RatesWireBody \} from '@\/components\/currency-switcher';/,
    );
    expect(orgConsole).toMatch(/queryKey: ADMIN_CURRENCY_RATES_QUERY_KEY,/);
  });

  it('is an observer in the kpi-row shape — enabled:false, the same honest queryFn', () => {
    expect(orgConsole).toMatch(/enabled: false,/);
    expect(orgConsole).toMatch(/the org census never fetches — it observes the shared currency cache/);
    expect(orgConsole).toMatch(/refetchInterval: false,/);
  });

  it('the census composes from the wire the cache holds — end to end', () => {
    const wire = [
      { code: 'KES', kesToRate: 1, source: 'STATIC', updatedAt: null },
      { code: 'USD', kesToRate: 0.0077, source: 'MANUAL', updatedAt: null },
      { code: 'UGX', kesToRate: 3700, source: 'STATIC', updatedAt: null },
      { code: 'TZS', kesToRate: 16.1, source: 'STATIC', updatedAt: null },
    ];
    const census = rateCensus(wire);
    expect(census).toEqual({ manual: 1, api: 0, builtIn: 3, total: 4 });
  });

  it('the age read stays out of the component body — the purity-helper law', () => {
    expect(orgConsole).toMatch(/function orgCensusAgeMs\(dataUpdatedAt: number\): number \{/);
    expect(orgConsole).toMatch(/const ageVoice = wireAgeVoice\(orgCensusAgeMs\(censusQuery\.dataUpdatedAt\)\);/);
    expect(orgConsole).toMatch(/return dataUpdatedAt > 0 \? Date\.now\(\) - dataUpdatedAt : -1;/);
  });

  it('honest absence: no census, no strip', () => {
    expect(orgConsole).toMatch(/if \(!census\) return null;/);
    const ageVoice = wireAgeVoice(-1);
    expect(ageVoice).toBeNull();
  });
});

// ── 2. THE STRIP'S VOICE (bytes: quiet neutral, mono, glanceable) ────────

describe('the org strip speaks the family voice on the quiet surface (v2.413.0)', () => {
  it('carries its own testid under the header', () => {
    expect(orgConsole).toMatch(/data-testid="org-census-strip"/);
    const stripIdx = orgConsole.indexOf('data-testid="org-census-strip"');
    const headerIdx = orgConsole.indexOf('<OrgCensusStrip />');
    expect(stripIdx).toBeGreaterThan(-1);
    expect(headerIdx).toBeGreaterThan(-1);
  });

  it('stays on the quiet neutral surface — the amber invitation is the ACTOR voice', () => {
    expect(orgConsole).toMatch(/inline-flex items-center gap-1\.5 rounded-md border border-border\/60 bg-muted\/40 px-2 py-1/);
    // No amber on the org desk: the reader is not the actor.
    const stripBlock = orgConsole.slice(
      orgConsole.indexOf('function OrgCensusStrip'),
      orgConsole.indexOf('export function OrgConsole'),
    );
    expect(stripBlock).not.toMatch(/amber/);
  });

  it('the census line speaks the same provenance shape the other strips speak', () => {
    expect(orgConsole).toMatch(/\{census\.manual\} admin-set · \{census\.api\} API · \{census\.builtIn\} built-in/);
    expect(orgConsole).toMatch(/\{ageVoice \? ` · \$\{ageVoice\.label\}` : ''\}/);
  });

  it('the strip mounts under the header row — desk chrome, not a modal', () => {
    expect(orgConsole).toMatch(/THE CENSUS RIDES THE ORG DESK/);
    expect(orgConsole).toMatch(/<OrgCensusStrip \/>\n      <\/header>/);
  });
});

// ── 3. THE ROTATION GUARD'S HONEST TYPE (the widen-and-fix law) ──────────

describe('the password-rotation guard types what it reads (v2.413.0)', () => {
  it('the request parameter is the minimal shape the guard uses', () => {
    expect(authLib).toMatch(/export function assertPasswordRotation\(\n  request: \{ url: string \},\n  session: AuthSession,\n\): Response \| null \{/);
  });

  it('the shrink speaks its reason where the signature lives', () => {
    expect(authLib).toMatch(/the request parameter speaks the shape the guard actually READS/);
  });

  it('the guard still reads only the url — one pathname, one allowlist', () => {
    expect(authLib).toMatch(/const pathname = new URL\(request\.url\)\.pathname;/);
    expect(authLib).toMatch(/if \(isPasswordRotationExemptPath\(pathname\)\) return null;/);
  });

  it('NextRequest stays imported — the other guards still wear the full bag', () => {
    expect(authLib).toMatch(/import \{ type NextRequest \} from 'next\/server';/);
  });
});

// ── 4. THE FAMILY ECHOES (v2.410–v2.412 still standing) ──────────────────

describe('the census family earlier voices still stand (v2.413.0 echoes)', () => {
  it('the switcher keeps its dropdown footer strip; the card keeps its echo', () => {
    const switcher = readRepo('src/components/currency-switcher.tsx');
    const card = readRepo('src/components/admin/currency-rates-section.tsx');
    expect(switcher).toMatch(/data-testid="currency-rate-census"/);
    expect(card).toMatch(/data-testid="admin-census-strip"/);
    expect(card).toMatch(/data-testid="admin-census-nudge"/);
  });

  it('the org desk keeps its seeded switcher mount — the cache filler', () => {
    expect(orgConsole).toMatch(/triggerTestId="org-desk-currency-switcher"/);
  });
});
