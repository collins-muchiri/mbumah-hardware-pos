// v2.270.0 — the lens finds the bell.
//
//   - THE LENS'S FOURTH FACE: the roster answered WHICH hires hold portal
//     access at a glance (v2.268.0's quiet bell) and the detail card learned
//     to link one (v2.267.0's keystone) — but the filter bar could not ASK
//     for them. This round the bell answers in the filter bar: a "Portal
//     linked" toggle beside "Expiring docs", the lens pattern's fourth face,
//     deep-linkable (?linked=1) like the other three.
//   - THE CLIENT-SIDE HONESTY: the bell's wire already carries portalLinked
//     on every row, so the lens narrows what the roster already holds — no
//     second fetch, no API contract change. One law follows: every count
//     under the filter bar reads the rows standing in the table (the same
//     honesty the server-side expiring lens rides).
//   - THE COLOR NEVER MEANS TWO THINGS: the pressed face is EMERALD — the
//     roster's own vocabulary puts emerald on the linked login (the portal
//     chip) and amber on the expiring trail. The focus ring follows the face.
//   - THE HERO ANSWERS BACK: the portal home's profile hero gains the
//     linked-login voice — the session's own identity in the SAME emerald,
//     naming the login that opens the workspace and where the notices land.
//     The keystone's audit fact (only HR can link) spoken on the surface the
//     login actually opens.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const roster = read('src/app/(shell)/hr/employees/page.tsx');
const homeView = read('src/app/(selfservice)/employees/me/home-view.tsx');
const portalHome = read('src/app/(selfservice)/employees/me/page.tsx');

describe('the roster lens finds the bell (v2.270.0)', () => {
  it('the fourth lens toggle exists — aria-pressed, its own testid, the bell icon', () => {
    expect(roster).toContain('data-testid="hr-employees-linked-toggle"');
    expect(roster).toContain('aria-pressed={linkedOnly}');
    expect(roster).toContain('Portal linked');
    // the toggle block carries the bell the rows wear (the button's own icon)
    const toggleIdx = roster.indexOf('data-testid="hr-employees-linked-toggle"');
    const block = roster.slice(toggleIdx - 800, toggleIdx + 900);
    expect(block).toContain('<BellRing className="h-3.5 w-3.5" aria-hidden="true" />');
    expect(block).toContain('setLinkedOnly((v) => !v)');
  });

  it('the pressed face is EMERALD — and the expiring lens keeps its amber (a color never means two things)', () => {
    expect(roster).toContain(
      "'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'",
    );
    expect(roster).toContain('focus-visible:ring-emerald-400');
    // the amber pressed face stands untouched on the expiring lens
    expect(roster).toContain(
      "'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300'",
    );
    expect(roster).toContain('focus-visible:ring-amber-400');
    // the "from link" badge wears its own face too
    expect(roster).toContain(
      '<span className="rounded bg-emerald-100 px-1 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">',
    );
  });

  it('the lens deep-links — ?linked=1 seeds it, the URL mirrors it, clear retires it', () => {
    expect(roster).toContain("const [linkLinked] = useState(() => readParam('linked'));");
    expect(roster).toContain("useState(linkLinked === '1')");
    expect(roster).toContain("sp.set('linked', '1')");
    expect(roster).toContain("sp.delete('linked')");
    // the mirror call and its deps carry the lens
    expect(roster).toContain(
      'mirrorFiltersToUrl(debouncedQ, status, expiringOnly, linkExpiring || \'90\', linkedOnly);',
    );
    expect(roster).toContain('[debouncedQ, status, expiringOnly, linkExpiring, linkedOnly]');
    expect(roster).toContain('setLinkedOnly(false);');
    expect(roster).toContain('(expiringOnly ? 1 : 0) + (linkedOnly ? 1 : 0)');
  });

  it('the visible list narrows what the roster already holds — client-side, no second fetch', () => {
    expect(roster).toContain('const visibleRows = rows && linkedOnly ? rows.filter((r) => r.portalLinked) : rows;');
    // the fetch stays untouched — no linked param crosses the wire
    expect(roster).toContain("if (expiringOnly) params.set('expiring', linkExpiring || '90');");
    expect(roster).not.toContain("params.set('linked'");
  });

  it('the counts read the rows standing in the table — the bell and the roster count alike', () => {
    expect(roster).toContain('{(visibleRows ?? []).filter((r) => r.portalLinked).length}');
    expect(roster).toContain('of {(visibleRows ?? []).length} linked');
    expect(roster).toContain(
      '{(visibleRows ?? []).length} {(visibleRows ?? []).length === 1 ? \'employee\' : \'employees\'}',
    );
    // the bell's title tells the new truth
    expect(roster).toContain('the count reads the rows standing in the table.');
    // the consent counts keep their whole-view honesty (unchanged on purpose)
    expect(roster).toContain('Across the whole consent view — not the filtered list.');
  });

  it('the table and the cards render the visible list; the empty card speaks the lens', () => {
    expect(roster).toContain('rows && visibleRows && visibleRows.length > 0');
    expect((roster.match(/\{visibleRows\.map\(\(r\) => \(/g) || []).length).toBe(2);
    expect(roster).toContain('No employees on this roster hold a linked portal login.');
    expect(roster).toContain(
      'The portal stays closed until a login is linked \u2014 Settings \u2192 Users holds that door; the Portal column keeps its honest dash meanwhile.',
    );
    // the page's own description learned the fourth lens
    expect(roster).toContain('follow the expiring-document trail, and find the portal-linked.');
  });

  it('the ancestors stand — the quiet bell, the honest dash, the chip family', () => {
    expect(roster).toContain('data-testid="hr-employees-portal-chip"');
    expect(roster).toContain('data-testid="hr-employees-portal-silent"');
    expect(roster).toContain('data-testid="hr-employees-expiring-toggle"');
    expect(roster).toContain("title: (name, role) =>");
  });
});

describe('the hero answers back (v2.270.0)', () => {
  it('the hero gains the linked-login voice — exported voice type, optional prop', () => {
    expect(homeView).toContain('export interface LinkedLoginVoice');
    expect(homeView).toContain('linkedLogin?: LinkedLoginVoice;');
    expect(homeView).toContain("import { ArrowRight, BellRing, CalendarClock, Palmtree, Wallet, Target, UserRound, BadgeCheck, HandCoins } from 'lucide-react';");
  });

  it('the voice row wears the roster\'s emerald under a hairline, with its own testid', () => {
    expect(homeView).toContain('data-testid="selfservice-hero-linked"');
    expect(homeView).toContain(
      '"mt-3 flex items-center gap-2 border-t border-black/5 pt-2.5 dark:border-white/10"',
    );
    expect(homeView).toContain(
      'border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
    );
    expect(homeView).toContain('linked login');
  });

  it('the words land where they are true — the login named, the notices claimed', () => {
    expect(homeView).toContain('{linkedLogin.email} · {linkedLogin.role.replace(/_/g, \' \').toLowerCase()} — the login HR linked to');
    expect(homeView).toContain('this profile; leave and payroll notices land here.');
    expect(homeView).toContain("title=\"This profile is linked to your sign-in by HR \u2014 the same link the roster's Portal column shows.\"");
  });

  it('the portal home passes the session\'s own identity — nothing invented', () => {
    expect(portalHome).toContain('linkedLogin={{ email: guard.session.email, role: guard.session.role }}');
  });
});
