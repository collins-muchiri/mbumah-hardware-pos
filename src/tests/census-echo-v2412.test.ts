import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  censusMaintenanceVoice,
  rateCensus,
  type RateCensus,
} from '../components/currency-switcher';
import { adminCensusNudge } from '../components/admin/currency-rates-section';

/**
 * v2.412.0 — the census echoes.
 *
 * v2.411.0 taught the top-bar switcher's census strip to speak first (the
 * amber invitation when every rate is a factory figure). This round the
 * census ECHOES onto the card that door names: the Exchange Rates admin
 * card renders the same provenance census (same wire — the shared query
 * key — and the same pure voices), so the admin sees exactly what their
 * users see, right where they can act on it. The echo's maintenance voice
 * is addressed to the admin standing ON the card (the switcher names this
 * card as the door; here the door is open, so the voice names the action
 * instead), and the strip's tone follows its census — the SAME amber
 * invitation family vs the quiet neutral surface, scale-honest to a panel
 * rather than a dropdown.
 *
 * The round also closes the four faces the fresh tsc output named: the
 * credits ledger's print handler speaks the row the desk actually hands it
 * (the wire's credit WIDENED by the running balance the memo computes),
 * and the banking recon dialog's approver line — dead UI reading a field
 * the wire never carried — is gone entirely (291 → 287).
 */

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const card = readRepo('src/components/admin/currency-rates-section.tsx');
const creditsTab = readRepo('src/app/(shell)/tabs/credits-tab.tsx');
const bankingTab = readRepo('src/app/(shell)/tabs/banking-tab.tsx');

const census = (partial: Partial<RateCensus>): RateCensus => ({
  manual: 0,
  api: 0,
  builtIn: 0,
  total: 0,
  ...partial,
});

// ── 1. THE ADMIN'S OWN NUDGE (pure, behavioral) ──────────────────────────

describe('the admin census nudge (v2.412.0, pure)', () => {
  it('an all-factory census speaks the card-honest copy: the action, not the door', () => {
    // The switcher's invitation names THIS card as the door; the admin is
    // already standing on it, so the echo names the Set rate action instead.
    expect(adminCensusNudge(census({ builtIn: 4, total: 4 }))).toBe(
      'Every rate below is a factory figure — set one with the Set rate action.',
    );
  });

  it('one admin-set rate silences the echo — no nagging a maintained branch', () => {
    expect(adminCensusNudge(census({ manual: 1, builtIn: 3, total: 4 }))).toBeNull();
  });

  it('one API rate silences it too — maintained is maintained', () => {
    expect(adminCensusNudge(census({ api: 2, builtIn: 2, total: 4 }))).toBeNull();
  });

  it('an absent census says nothing — honest absence', () => {
    expect(adminCensusNudge(null)).toBeNull();
    expect(adminCensusNudge(undefined)).toBeNull();
  });

  it('the echo composes from the census the wire answers — end to end', () => {
    const wire = [
      { code: 'KES', kesToRate: 1, source: 'STATIC', updatedAt: null },
      { code: 'USD', kesToRate: 0.0077, source: 'STATIC', updatedAt: null },
      { code: 'UGX', kesToRate: 3700, source: 'STATIC', updatedAt: null },
      { code: 'TZS', kesToRate: 16.1, source: 'STATIC', updatedAt: null },
    ];
    expect(adminCensusNudge(rateCensus(wire))).toBe(
      'Every rate below is a factory figure — set one with the Set rate action.',
    );
  });

  it('the two maintenance voices stay a family — the shared silence law', () => {
    // Both voices answer the SAME census the same way: all-factory speaks,
    // maintained is silent. The words differ (the addressee differs); the
    // law does not.
    const factory = census({ builtIn: 4, total: 4 });
    const maintained = census({ manual: 2, builtIn: 2, total: 4 });
    // Both speak on factory (the null-ness agrees), both stay silent on maintained.
    expect((adminCensusNudge(factory) === null) === (censusMaintenanceVoice(factory) === null)).toBe(true);
    expect((adminCensusNudge(maintained) === null) === (censusMaintenanceVoice(maintained) === null)).toBe(true);
  });
});

// ── 2. THE ECHO STRIP (bytes: one wire, one look, card-scale) ────────────

describe('the census echo strip (v2.412.0, card bytes)', () => {
  it('the card imports the census voices from the switcher — one truth', () => {
    expect(card).toMatch(
      /import \{ ADMIN_CURRENCY_RATES_QUERY_KEY, rateCensus, wireAgeVoice, type RateCensus \} from '@\/components\/currency-switcher';/,
    );
  });

  it('the census rides the SAME wire — the shared query key, the shared cache', () => {
    expect(card).toMatch(/const census = useMemo\(\(\) => rateCensus\(ratesQuery\.data\?\.data\?\.currencies\), \[ratesQuery\.data\]\);/);
  });

  it('the age read stays out of the component body — the purity-helper law', () => {
    expect(card).toMatch(/function censusAgeMs\(dataUpdatedAt: number\): number \{/);
    expect(card).toMatch(/const ageVoice = wireAgeVoice\(censusAgeMs\(ratesQuery\.dataUpdatedAt\)\);/);
    // The impure twin answers -1 on a silent cache (the age voice's honest nothing).
    expect(card).toMatch(/return dataUpdatedAt > 0 \? Date\.now\(\) - dataUpdatedAt : -1;/);
  });

  it('the strip wears the census tone family — amber invitation vs quiet neutral', () => {
    expect(card).toMatch(/data-testid="admin-census-strip"/);
    expect(card).toMatch(
      /'border-amber-200\/70 bg-amber-50\/60 dark:border-amber-500\/25 dark:bg-amber-500\/10'/,
    );
    expect(card).toMatch(/'border-border\/60 bg-muted\/40'/);
  });

  it('the census line speaks the same provenance shape the switcher speaks', () => {
    expect(card).toMatch(/\{census\.manual\} admin-set · \{census\.api\} API · \{census\.builtIn\} built-in/);
    expect(card).toMatch(/\{ageVoice \? ` · \$\{ageVoice\.label\}` : ''\}/);
  });

  it('the echo nudge line carries its own testid and the key-line separation', () => {
    expect(card).toMatch(/data-testid="admin-census-nudge"/);
    expect(card).toMatch(/border-t border-amber-200\/60 pt-1 text-\[11px\] leading-snug text-amber-700 dark:border-amber-500\/20 dark:text-amber-300/);
  });

  it('the strip renders only where the wire answered — inside the loaded branch, above the table', () => {
    // The echo sits in the non-error, non-loading branch (the census is
    // only honest once the wire answered) and before the Table it counts.
    const stripIdx = card.indexOf('data-testid="admin-census-strip"');
    const tableIdx = card.indexOf('<Table>');
    const errorIdx = card.indexOf("ratesQuery.isError ?");
    expect(stripIdx).toBeGreaterThan(-1);
    expect(tableIdx).toBeGreaterThan(stripIdx);
    expect(errorIdx).toBeGreaterThan(-1);
    expect(errorIdx).toBeLessThan(stripIdx);
  });
});

// ── 3. THE CREDITS LEDGER'S RUNNING TRUTH (the widen-and-fix law) ────────

describe('the credits ledger row speaks its running truth (v2.412.0)', () => {
  it('the widened row type exists at module level — the wire plus the computed figure', () => {
    expect(creditsTab).toMatch(
      /type CreditLedgerRow = CustomerCreditItem & \{ runningBalance: number \};/,
    );
  });

  it('the print handler parameter is the row the desk actually hands it', () => {
    expect(creditsTab).toMatch(/async function handlePrintCredit\(entry: CreditLedgerRow\) \{/);
  });

  it('the ledger memo still computes the running balance per customer', () => {
    expect(creditsTab).toMatch(/return \{ \.\.\.c, runningBalance: running \};/);
  });

  it('the print totals still read the running balance — DR/CR honest', () => {
    expect(creditsTab).toMatch(/entry\.runningBalance < 0 \? 'DR' : 'CR'/);
  });
});

// ── 4. THE BANKING RECON'S HONEST DELETION (dead UI dies) ────────────────

describe('the banking recon dialog loses its phantom approver (v2.412.0)', () => {
  it('no approver field survives anywhere in the banking tab — the wire never carried it', () => {
    expect(bankingTab).not.toMatch(/approvedBy/);
  });

  it('the deletion speaks its reason where the branch lived', () => {
    expect(bankingTab).toMatch(/the old approver line is gone/);
    expect(bankingTab).toMatch(/no approver column/);
  });

  it('the recon status badge remains the honest approval voice', () => {
    expect(bankingTab).toMatch(/RECON_STATUS_BADGE\[reconToView\.status\]/);
  });

  it('the wire contract never grew a phantom field', () => {
    const api = readRepo('src/lib/api.ts');
    const reconBlock = api.slice(
      api.indexOf('export interface BankReconciliationItem'),
      api.indexOf('export interface MpesaReconciliationItem'),
    );
    expect(reconBlock).not.toMatch(/approvedBy/);
  });
});

// ── 5. THE TOKEN ASKS WHO IT IS (BUG 2, live-proven) ─────────────────────

describe('the token without its user blob asks the wire (v2.412.0)', () => {
  const stores = readRepo('src/lib/stores.ts');

  it('the token path backfills through the SAME self-contained ask the cookie path runs', () => {
    // A token without its user blob used to boot user:null FOREVER — every
    // role-gated surface silently rendered read-only (the Exchange Rates
    // card's Actions column was the live-proven victim). The cookie path
    // already asked /api/auth/me; the token path now runs the same ask.
    expect(stores).toMatch(/if \(!user\) void useAuthStore\.getState\(\)\.fetchUser\(\);/);
  });

  it('a present blob keeps the old shape — no ask, behavior identical', () => {
    // The healthy session (token + blob) still boots synchronously; the
    // ask fires only on the missing-blob leg.
    expect(stores).toMatch(/user = storedUser \? JSON\.parse\(storedUser\) : null;/);
  });

  it('the ask is self-contained: a 401 clears everything (no zombie session)', () => {
    // fetchUser's catch clears token+user+isAuthenticated — the same law
    // the cookie adoption has run since v2.16.0.
    expect(stores).toMatch(/set\(\{ user: null, token: null, isAuthenticated: false \}\);/);
  });
});

// ── 6. THE FAMILY ECHOES (v2.410/v2.411 still standing) ──────────────────

describe('the census family earlier voices still stand (v2.412.0 echoes)', () => {
  it('the switcher strip keeps its own testids — the echo does not replace the voice', () => {
    const switcher = readRepo('src/components/currency-switcher.tsx');
    expect(switcher).toMatch(/data-testid="currency-rate-census"/);
    expect(switcher).toMatch(/data-testid="currency-census-nudge"/);
  });

  it('the switcher maintenance voice keeps the door-naming copy', () => {
    expect(censusMaintenanceVoice(census({ builtIn: 4, total: 4 }))).toBe(
      'All 4 rates are factory figures — set yours in the Exchange Rates card (System tab).',
    );
  });
});
