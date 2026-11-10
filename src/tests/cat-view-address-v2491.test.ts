// THE CATALOG'S VIEW RIDES THE ADDRESS (v2.491.0): the catalog desk's
// shop floor answers the bar — the deep-link family's forty-eighth
// word (the catalog's view, the SEVENTH shell-tab desk, the desk's
// SECOND word) — born wearing the family's ONE reading (the guarded
// door, the hand's turn retires the word).
//
//   • THE VIEW'S WORD — the helpers' bytes (read once on the shell,
//     the ONE home's member tuple, write back on every turned view,
//     THE DEFAULT WEARS NO WORD), the one door, the guarded reading.
//   • THE CHIP — the landed view wears the slate landing chip (the
//     family's shared voice, the loom's wardrobe, no new hue); the
//     chip's triple condition.
//   • THE DRESS — the toggle wears the slate family's quiet ground
//     while a non-default view rides (the pressed face and its chip
//     speak one voice); the keyboard face rings.
//   • THE REGISTRY — the constitution's forty-eighth row, read from
//     the constitution file itself (the registry is the input, never a
//     copy); the census holds (forty-eight words, thirty-two desks,
//     forty families — the family's shared slate serves four words).
//   • THE FEED — the round leads the feed (found in the living feed —
//     the find + the guard come together, the museum shape from birth).
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one
//     voice.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WHATS_NEW } from '@/lib/whats-new';
import { parseInitialNamedMember, CAT_VIEW_MEMBERS } from '@/lib/tab-url';

const DESK = 'src/app/(shell)/tabs/catalog-tab.tsx';
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

describe('the catalog\u2019s view — the shop floor answers the bar', () => {
  it('the ONE home keeps the member law (the toggle\u2019s own tuple reads through the generic parser)', () => {
    expect(home.includes('export const CAT_VIEW_MEMBERS = [')).toBe(true);
    expect(home.includes(`'grid',`)).toBe(true);
    expect(home.includes(`'list'] as const`)).toBe(true);
    // the home's own note carries the round's stamp and the word's
    // backticked name (the ONE home names every speaker)
    expect(home.includes('v2.491.0')).toBe(true);
    expect(home.includes('`cat-view`')).toBe(true);
  });

  it('the word answers the bar through the honest member parser', () => {
    // a real member lands WHOLE
    expect(parseInitialNamedMember('?cat-view=list', 'cat-view', [...CAT_VIEW_MEMBERS], 'grid')).toBe('list');
    expect(parseInitialNamedMember('?cat-view=grid', 'cat-view', [...CAT_VIEW_MEMBERS], 'grid')).toBe('grid');
    // a made-up member or a wrong case is an unknown word, not a clever match
    expect(parseInitialNamedMember('?cat-view=table', 'cat-view', [...CAT_VIEW_MEMBERS], 'grid')).toBe('grid');
    expect(parseInitialNamedMember('?cat-view=GRID', 'cat-view', [...CAT_VIEW_MEMBERS], 'grid')).toBe('grid');
    // a foreign desk's prefix is silence
    expect(parseInitialNamedMember('?pos-view=list', 'cat-view', [...CAT_VIEW_MEMBERS], 'grid')).toBe('grid');
  });

  it('THE DEFAULT WEARS NO WORD (the write half strips the resting key)', () => {
    expect(desk.includes(`if (view === 'grid') params.delete('cat-view');`)).toBe(true);
    expect(desk.includes(`else params.set('cat-view', view);`)).toBe(true);
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
    expect(desk.includes('const chooseViewMode = (mode: ViewMode) => {')).toBe(true);
    expect(desk.includes('if (mode === viewMode) return;')).toBe(true);
    expect(desk.includes('setViewMode(mode);')).toBe(true);
    expect(desk.includes('if (mode !== landedCatView) setCatViewLandingLive(false);')).toBe(true);
    expect(desk.includes('writeCatViewWord(mode);')).toBe(true);
  });
  it('the toggle\u2019s presses speak the one door (the members\u2019 handles)', () => {
    expect(desk.includes('onClick={() => chooseViewMode(\'grid\')}')).toBe(true);
    expect(desk.includes('onClick={() => chooseViewMode(\'list\')}')).toBe(true);
    expect(desk.includes('data-testid="cat-view-member-grid"')).toBe(true);
    expect(desk.includes('data-testid="cat-view-member-list"')).toBe(true);
    // the landing reads once on the shell (the SEVENTH shell-tab desk)
    expect(desk.includes('const [landedCatView] = useState<ViewMode>(initialCatView);')).toBe(true);
    expect(desk.includes('const [catViewLandingLive, setCatViewLandingLive] = useState(true);')).toBe(true);
    expect(desk.includes('if (typeof window === \'undefined\') return \'grid\';')).toBe(true);
  });
  it('the chip\u2019s dismissal retires through the same door (the triple condition)', () => {
    expect(desk.includes("catViewLandingLive && landedCatView && landedCatView !== 'grid' && (")).toBe(true);
    expect(desk.includes("setCatViewLandingLive(false); chooseViewMode('grid');")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE CHIP + THE DRESS — the family's shared voice, no new hue
// ---------------------------------------------------------------------------

describe('the landed view wears the slate landing chip and the toggle wears its ground', () => {
  it('the chip speaks the family\u2019s shared slate through the loom', () => {
    expect(desk.includes('hue="slate"')).toBe(true);
    expect(desk.includes('label={`landed ?cat-view=${landedCatView}`}')).toBe(true);
    expect(desk.includes('data-testid="cat-view-landing-word"')).toBe(true);
    // the loom's slate line exists (no new wardrobe line — the census holds)
    expect(loom.includes(`slate: 'border-slate-300 bg-slate-100 text-slate-700`)).toBe(true);
  });
  it('THE DRESS — the pressed face and its chip speak one voice (the desk\u2019s own byte order)', () => {
    // the toggle wears the slate family's quiet ground while a
    // non-default view rides, easing as it arrives
    expect(desk.includes('transition-colors ${viewMode !== \'grid\' ? \'bg-slate-100\' : \'bg-background\'}')).toBe(true);
    // the keyboard face rings (the desk's own focus ring)
    expect(desk.includes('focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1')).toBe(true);
    // the members speak their state through the tab shape
    expect(desk.includes('aria-selected={viewMode === \'grid\'}')).toBe(true);
    expect(desk.includes('aria-selected={viewMode === \'list\'}')).toBe(true);
    // the axe shape: role=tab never carries aria-pressed
    expect(desk.includes('aria-pressed')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. THE REGISTRY — the constitution's forty-eighth row
// ---------------------------------------------------------------------------

describe('the constitution walks the forty-eighth word', () => {
  it('the row is the registry\u2019s own (the self-reference, read from the constitution file)', () => {
    expect(constitution.includes("{ word: 'cat-view', desk: 'src/app/(shell)/tabs/catalog-tab.tsx', family: 'border-slate-300', suite: 'src/tests/cat-view-address-v2491.test.ts' }")).toBe(true);
    expect(constitution.includes('(fifty words, thirty-three desks)')).toBe(true);
    // the admission line carries the word it admits (the sorted place)
    expect(constitution.includes('cat-stock < cat-view < cr-type')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE FEED — the round announces itself (the museum shape from birth)
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story — the honoured chain and the new word', () => {
    const head = WHATS_NEW.find((e) => e.version === '2.491.0');
    if (!head) throw new Error('the 2.491.0 entry is gone from the feed');
    expect(head.version).toBe('2.491.0');
    expect(head.title).toContain('the hand\u2019s turn retires the word');
    expect(head.title).toContain('the window wears the same reading');
    expect(head.title).toContain('the counter\u2019s view rides the address');
    expect(head.title).toContain('the catalog\u2019s view rides the address');
    expect(head.title).toContain('one breath');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?cat-view='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('SEVENTH shell-tab desk'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('guarded door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THE DEFAULT WEARS NO WORD'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('forty-eight words, thirty-two desks, forty families'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.493.0');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.491.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.491.0]')).toBeLessThan(changelog.indexOf('[2.490.0]'));
  });
});
