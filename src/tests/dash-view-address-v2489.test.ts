// THE DASHBOARD'S VIEW RIDES THE ADDRESS (v2.489.0): the Recent
// activity card's view answers the bar — the deep-link family's
// forty-sixth word (the dashboard's view, the FIFTH shell-tab desk) —
// born wearing the family's ONE reading (the guarded door, the hand's
// turn retires the word).
//
//   • THE VIEW'S WORD — the helpers' bytes (read once on the shell,
//     the ONE home's member tuple, write back on every turned view,
//     THE DEFAULT WEARS NO WORD), the one door, the guarded reading.
//   • THE CHIP — the landed view wears the slate landing chip (the
//     desk's own voice, the loom's wardrobe, no new hue); the chip's
//     triple condition.
//   • THE REGISTRY — the constitution's forty-sixth row, read from the
//     constitution file itself (the registry is the input, never a
//     copy); the census holds (forty-six words, thirty-one desks, forty
//     families — the family's FOURTH shared family).
//   • THE FEED — the round leads the feed (found in the living feed —
//     the find + the guard come together, the museum shape from birth).
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one
//     voice.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WHATS_NEW } from '@/lib/whats-new';
import { parseInitialNamedMember, DASH_VIEW_MEMBERS } from '@/lib/tab-url';

const DESK = 'src/app/(shell)/tabs/dashboard-tab.tsx';
const HOME = 'src/lib/tab-url.ts';
const LOOM = 'src/components/landing-chip.tsx';
const CONSTITUTION = 'src/tests/transfer-status-deep-link-v2357.test.ts';

const desk = readFileSync(DESK, 'utf8');
const home = readFileSync(HOME, 'utf8');
const loom = readFileSync(LOOM, 'utf8');
const constitution = readFileSync(CONSTITUTION, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE VIEW'S WORD — read once, write back, the honest member
// ---------------------------------------------------------------------------

describe('the dashboard\u2019s view — the Recent activity card answers the bar', () => {
  it('the ONE home keeps the member law (the card\u2019s own tuple reads through the generic parser)', () => {
    expect(home.includes('export const DASH_VIEW_MEMBERS = [')).toBe(true);
    expect(home.includes(`'sales',`)).toBe(true);
    expect(home.includes(`'system'] as const`)).toBe(true);
    // the home's own note carries the round's stamp and the word's
    // backticked name (the ONE home names every speaker)
    expect(home.includes('v2.489.0')).toBe(true);
    expect(home.includes('`dash-view`')).toBe(true);
  });

  it('the word answers the bar through the honest member parser', () => {
    // a real member lands WHOLE
    expect(parseInitialNamedMember('?dash-view=system', 'dash-view', [...DASH_VIEW_MEMBERS], 'sales')).toBe('system');
    expect(parseInitialNamedMember('?dash-view=sales', 'dash-view', [...DASH_VIEW_MEMBERS], 'sales')).toBe('sales');
    // a made-up member or a wrong case is an unknown word, not a clever match
    expect(parseInitialNamedMember('?dash-view=inventory', 'dash-view', [...DASH_VIEW_MEMBERS], 'sales')).toBe('sales');
    expect(parseInitialNamedMember('?dash-view=SALES', 'dash-view', [...DASH_VIEW_MEMBERS], 'sales')).toBe('sales');
    // a foreign desk's prefix is silence
    expect(parseInitialNamedMember('?sh-dlq=DEAD', 'dash-view', [...DASH_VIEW_MEMBERS], 'sales')).toBe('sales');
  });

  it('THE DEFAULT WEARS NO WORD (the write half strips the resting key)', () => {
    expect(desk.includes(`if (view === 'sales') params.delete('dash-view');`)).toBe(true);
    expect(desk.includes(`else params.set('dash-view', view);`)).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', window.location.pathname + (qs ? `?${qs}` : \'\'));')).toBe(true);
    // a blocked write is the view's silence, never a thrown desk
    expect(desk.includes('// The address never lies louder than the view')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE ONE DOOR — born guarded (the family's ONE reading)
// ---------------------------------------------------------------------------

describe('the view\u2019s ONE door — the turn and the retire ride together', () => {
  it('the guarded door from birth (no turn, no write; the hand retires the word)', () => {
    expect(desk.includes('const chooseDashView = (member: string) => {')).toBe(true);
    expect(desk.includes('if (member === view) return;')).toBe(true);
    expect(desk.includes('setView(member);')).toBe(true);
    expect(desk.includes('if (member !== landedDashView) setDashViewLandingLive(false);')).toBe(true);
    expect(desk.includes('writeDashViewWord(member);')).toBe(true);
  });
  it('the toggle\u2019s presses speak the one door (the members\u2019 handles)', () => {
    expect(desk.includes('onClick={() => chooseDashView(v)}')).toBe(true);
    expect(desk.includes('data-testid={`dash-view-member-${v}`}')).toBe(true);
    // the landing reads once on the shell (the FIFTH shell-tab desk)
    expect(desk.includes('const [landedDashView] = useState<string>(initialDashView);')).toBe(true);
    expect(desk.includes('const [dashViewLandingLive, setDashViewLandingLive] = useState(true);')).toBe(true);
    expect(desk.includes('if (typeof window === \'undefined\') return \'sales\';')).toBe(true);
  });
  it('the chip\u2019s dismissal retires through the same door (the triple condition)', () => {
    expect(desk.includes("dashViewLandingLive && landedDashView && landedDashView !== 'sales' && (")).toBe(true);
    expect(desk.includes("setDashViewLandingLive(false); chooseDashView('sales');")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE CHIP — the desk's own voice, no new hue
// ---------------------------------------------------------------------------

describe('the landed view wears the slate landing chip', () => {
  it('the chip speaks the desk\u2019s own family through the loom', () => {
    expect(desk.includes('hue="slate"')).toBe(true);
    expect(desk.includes('label={`landed ?dash-view=${landedDashView}`}')).toBe(true);
    expect(desk.includes('data-testid="dash-view-landing-word"')).toBe(true);
    // the loom's slate line exists (no new wardrobe line — the census holds)
    expect(loom.includes(`slate: 'border-slate-300 bg-slate-100 text-slate-700`)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE REGISTRY — the constitution's forty-sixth row
// ---------------------------------------------------------------------------

describe('the constitution walks the forty-sixth word', () => {
  it('the row is the registry\u2019s own (the self-reference, read from the constitution file)', () => {
    expect(constitution.includes("{ word: 'dash-view', desk: 'src/app/(shell)/tabs/dashboard-tab.tsx', family: 'border-slate-300', suite: 'src/tests/dash-view-address-v2489.test.ts' }")).toBe(true);
    expect(constitution.includes('(fifty-one words, thirty-three desks)')).toBe(true);
    // the admission line carries the word it admits (the sorted place)
    expect(constitution.includes('cv- < dash- < dead-')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE FEED — the round announces itself (the museum shape from birth)
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story — the honoured probe and the new word', () => {
    const head = WHATS_NEW.find((e) => e.version === '2.489.0');
    if (!head) throw new Error('the 2.489.0 entry is gone from the feed');
    expect(head.version).toBe('2.489.0');
    expect(head.title).toContain('the shift\u2019s week rides the address');
    expect(head.title).toContain('the hand\u2019s turn retires the word');
    expect(head.title).toContain('the window wears the same reading');
    expect(head.title).toContain('one breath');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?dash-view='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('FIFTH shell-tab desk'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('guarded door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THE DEFAULT WEARS NO WORD'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('forty-six words, thirty-one desks, forty families'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.494.0');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.489.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.489.0]')).toBeLessThan(changelog.indexOf('[2.488.0]'));
  });
});
