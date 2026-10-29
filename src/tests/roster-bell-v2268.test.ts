// v2.268.0 — the roster's quiet bell.
//
//   - THE GAP: v2.267.0 linked logins to employees on the detail card, but
//     the roster (the face every HR role lands on) stayed deaf — which
//     employees hold portal access was a one-detail-at-a-time question.
//   - THE BELL (additive, shaped): the list wire grows the linked login's
//     presence, role and active state — the raw relation is destructured
//     OUT of the spread (the detail wire's own shaping law); role is not
//     PII (the payroll tab's own picker speaks it), the email never rides
//     the list. portalLinked false answers the honest silence.
//   - THE CHIP: the roster wears the ConsentChip's own vocabulary law —
//     emerald open / amber closed, a color never means two things; the
//     detail card's words ride the titles; the unlinked face is the
//     silent dash, never a look-alike chip.
//   - THE COUNT: the toolbar answers "N of M linked" — a REAL number over
//     the roster's rows (the counts' own law — it reads the rows, never
//     the view).
//   - THE PICKER'S CHEVRON: the detail card's candidates select is
//     appearance-none by design — but an invisible affordance is a closed
//     door painted to look like a text field. The chevron moves in.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const service = read('src/lib/hr/employee-service.ts');
const types = read('src/lib/hr/types.ts');
const page = read('src/app/(shell)/hr/employees/page.tsx');
const detail = read('src/app/(shell)/hr/employees/[id]/page.tsx');

describe('the bell rides the wire (v2.268.0)', () => {
  it('the list include grows the login — role + active state only, never the email', () => {
    expect(service).toContain(
      'user: { select: { role: true, isActive: true } },',
    );
    // the include stays inside the list's own findMany — the detail wire's
    // richer select (id, email, name, role, isActive) is untouched upstream
    expect(service).toContain(
      'include: { user: { select: { id: true, email: true, name: true, role: true, isActive: true } } },',
    );
  });

  it('the shaping law — the raw relation never leaves, the shaped bits do', () => {
    expect(service).toContain('portalLinked: e.user != null,');
    expect(service).toContain('portalRole: e.user?.role ?? null,');
    expect(service).toContain('portalActive: e.user ? e.user.isActive : null,');
    // the shaping comment lives where the reader can read it
    expect(service).toContain("the roster's quiet bell");
  });

  it('the type answers the three fields with their honesty docs', () => {
    expect(types).toContain('portalLinked?: boolean;');
    expect(types).toContain('portalRole?: string | null;');
    expect(types).toContain('portalActive?: boolean | null;');
    expect(types).toContain("the roster's quiet bell");
  });
});

describe('the roster wears the bell (v2.268.0)', () => {
  it('the chip map — the consent vocabulary\u2019s tones, the card\u2019s words in the titles', () => {
    expect(page).toContain("const PORTAL_CHIP: Record<'linked' | 'off',");
    // emerald open — the consent chip's own emerald
    expect(page).toContain(
      "'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',",
    );
    // amber closed — the consent chip's own amber, the card's own law
    expect(page).toContain(
      "'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300',",
    );
    expect(page).toContain('leave and payroll notifications land in the app.');
    expect(page).toContain('the portal stays closed until the account is reactivated in Settings \u2192 Users.');
  });

  it('the chip component — the null guard, the testid, the bell', () => {
    expect(page).toContain('function PortalChip(');
    expect(page).toContain('if (!row.portalLinked) return null; // an unlinked row never renders a look-alike');
    expect(page).toContain('data-testid="hr-employees-portal-chip"');
    expect(page).toContain('<BellRing className="h-3 w-3" aria-hidden="true" />');
    expect(page).toContain('row.portalActive === false ? \'off\' : \'linked\'');
  });

  it('the desktop column — the head, the honest cell, the silent dash', () => {
    expect(page).toContain('data-testid="hr-employees-portal-col"');
    expect(page).toContain('{r.portalLinked ? (\n                          <PortalChip row={r} />\n                        ) : (');
    expect(page).toContain('data-testid="hr-employees-portal-silent"');
    expect(page).toContain('No linked login \u2014 the self-service portal stays behind the HR desk.');
    // the column sits between Status and the conditional consent column
    const statusIdx = page.indexOf('<TableHead>Status</TableHead>');
    const portalIdx = page.indexOf('data-testid="hr-employees-portal-col"');
    const consentIdx = page.indexOf('data-testid="hr-employees-consent-col"');
    expect(statusIdx).toBeGreaterThan(-1);
    expect(portalIdx).toBeGreaterThan(statusIdx);
    expect(consentIdx).toBeGreaterThan(portalIdx);
  });

  it('the mobile card — the compact chip beside the status badge', () => {
    expect(page).toContain('<PortalChip row={r} compact />');
  });

  it('the count answers REAL numbers over the roster\u2019s rows', () => {
    expect(page).toContain('data-testid="hr-employees-portal-count"');
    // v2.270.0 moved the bell's bytes onto the visible list — the lens's
    // fourth face narrowed the list, and the bell reads THE ROWS STANDING
    // IN THE TABLE (the same honesty this pin has always demanded; the
    // ancestor byte moved by design, not by accident).
    expect(page).toContain('(visibleRows ?? []).filter((r) => r.portalLinked).length');
    expect(page).toContain('of {(visibleRows ?? []).length} linked');
    expect(page).toContain('the count reads the rows standing in the table.');
    // the count lives in the toolbar the consent counts share
    const countIdx = page.indexOf('data-testid="hr-employees-portal-count"');
    const consentCountsIdx = page.indexOf('data-testid="hr-employees-consent-counts"');
    expect(countIdx).toBeGreaterThan(-1);
    expect(consentCountsIdx).toBeGreaterThan(countIdx);
  });

  it('the consent chip\u2019s own bytes stand untouched beside the growth', () => {
    expect(page).toContain('const CONSENT_CHIP: Record<');
    expect(page).toContain('data-testid="hr-employees-consent-chip"');
    expect(page).toContain('An active data-processing consent stands \u2014 the payroll run passes this hire.');
  });
});

describe('the picker wears its chevron (v2.268.0)', () => {
  it('the detail card\u2019s select — the import, the room, the arrow', () => {
    expect(detail).toContain(
      "import { ChevronDown, Eye, EyeOff, FilePlus2, Link2, Loader2, ShieldAlert, ShieldCheck, Unlink } from 'lucide-react';",
    );
    expect(detail).toContain('pl-3 pr-8 py-1 text-sm shadow-sm');
    expect(detail).toContain('pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400');
    expect(detail).toContain('an invisible affordance is');
  });

  it('the card\u2019s own surfaces stand byte-identical beneath the growth', () => {
    expect(detail).toContain('data-testid="portal-account-card"');
    expect(detail).toContain('data-testid="portal-link-button"');
    expect(detail).toContain('data-testid="portal-unlink-button"');
    expect(detail).toContain('data-testid="portal-candidates-select"');
    expect(detail).toContain('<ChevronDown\n                    className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"');
  });
});

describe('the ancestors untouched (v2.268.0)', () => {
  it('the service\u2019s older laws keep their bytes', () => {
    // the expiry window's annotation rides the same map
    expect(service).toContain('expiringDocuments: hit.count, nearestExpiry: toIso(hit.nearest)');
    // the detail wire's own shaping comment (v2.267.0)
    expect(service).toContain('only the shaped portalUser DTO leaves the server');
    // the org-scope store check stands
    expect(service).toContain('export async function storeInOrganization(');
  });

  it('the detail wire\u2019s portalUser DTO type keeps its shape', () => {
    expect(types).toContain('export interface HrPortalUserDto {');
    expect(types).toContain('The\n *  relation itself never leaves the server');
  });
});
