// THE COUNTER'S CATEGORY RIDES THE ADDRESS (v2.494.0): the POS desk's
// category chips answer the bar — the deep-link family's fifty-first
// word (the counter's category, the desk's SECOND word, the SLUG-SHAPE
// LAW's second wearer — the store's own rows named by their derived
// slugs, the catalog's wire having led the law) — born wearing the
// family's ONE reading (the guarded door, the hand's turn retires the
// word).
//
//   • THE SHELVES' WORD — the helpers' bytes (read once on the shell,
//     the SLUG-SHAPE LAW's slug reader, write back on every pressed
//     shelf, THE DEFAULT WEARS NO WORD), the one door, the guarded
//     reading, the landing's resolve.
//   • THE CHIP — the landed category wears the slate landing chip (the
//     family's shared voice, the loom's wardrobe, no new hue); the
//     chip's triple condition (resolved slugs only).
//   • THE DRESS — the lens row wears the slate family's quiet ground
//     while a non-default shelf rides, the fade gradients following
//     the ground (the pressed face and its chip speak one voice); the
//     chip row's presses ride the one door.
//   • THE REGISTRY — the constitution's fifty-first row, read from
//     the constitution file itself (the registry is the input, never a
//     copy); the census holds (fifty-one words, thirty-three desks,
//     forty families — the family's shared slate serves seven words).
//     sorted place: msg- < pos- < pr- (the ledger's own order).
//   • THE FEED — the round leads the feed (found in the living feed —
//     the find + the guard come together, the museum shape from birth).
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one
//     voice.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WHATS_NEW } from '@/lib/whats-new';
import { categorySlug, parseInitialNamedSlug } from '@/lib/tab-url';

const DESK = 'src/app/(shell)/tabs/pos-tab.tsx';
const HOME = 'src/lib/tab-url.ts';
const LOOM = 'src/components/landing-chip.tsx';
const CHIPS = 'src/components/pos/category-chips.tsx';
const CONSTITUTION = 'src/tests/transfer-status-deep-link-v2357.test.ts';

const desk = readFileSync(DESK, 'utf8');
const home = readFileSync(HOME, 'utf8');
const loom = readFileSync(LOOM, 'utf8');
const chips = readFileSync(CHIPS, 'utf8');
const constitution = readFileSync(CONSTITUTION, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE SHELVES' WORD — read once, resolve on the rows, write back
// ---------------------------------------------------------------------------

describe('the counter\u2019s category — the shelves answer the bar by name', () => {
  it('the ONE home keeps the SLUG-SHAPE LAW (the slug is derived, never stored)', () => {
    expect(home.includes('THE SLUG-SHAPE LAW (v2.493.0)')).toBe(true);
    expect(home.includes('export function categorySlug(name: string): string {')).toBe(true);
    expect(home.includes('export function parseInitialNamedSlug(search: string, key: string): string | null {')).toBe(true);
    // the shape's SECOND wearer is named in the law's own home
    expect(home.includes("shape's SECOND wearer: `?pos-category=<slug>` (v2.494.0")).toBe(true);
    // the home's own note carries the round's stamp and the word's
    // backticked name (the ONE home names every speaker)
    expect(home.includes('v2.494.0')).toBe(true);
    expect(home.includes('`pos-category`')).toBe(true);
    expect(home.includes("THE FAMILY'S FIFTY-FIRST WORD")).toBe(true);
  });

  it('the slug law wears the ledger\u2019s own names (derived, stable, lowercase)', () => {
    expect(categorySlug('Nails & Screws')).toBe('nails-screws');
    expect(categorySlug('Iron Bars')).toBe('iron-bars');
    expect(categorySlug('Timber & Wood')).toBe('timber-wood');
    expect(categorySlug('Cement')).toBe('cement');
    expect(categorySlug('  Paints  ')).toBe('paints');
  });

  it('the word answers the bar through the honest slug reader (never case-gamed)', () => {
    // a real slug lands WHOLE
    expect(parseInitialNamedSlug('?pos-category=nails-screws', 'pos-category')).toBe('nails-screws');
    expect(parseInitialNamedSlug('?tab=pos&pos-category=iron-bars', 'pos-category')).toBe('iron-bars');
    // an absent or empty value is silence
    expect(parseInitialNamedSlug('?tab=pos', 'pos-category')).toBe(null);
    expect(parseInitialNamedSlug('?pos-category=', 'pos-category')).toBe(null);
    // a foreign desk's prefix is silence
    expect(parseInitialNamedSlug('?pos-view=list', 'pos-category')).toBe(null);
  });

  it('THE DEFAULT WEARS NO WORD (the write half strips the resting key)', () => {
    expect(desk.includes(`if (!slug) params.delete('pos-category');`)).toBe(true);
    expect(desk.includes(`else params.set('pos-category', slug);`)).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', window.location.pathname + (qs ? `?${qs}` : \'\'));')).toBe(true);
    // a blocked write is the shelves' silence, never a thrown desk
    expect(desk.includes('// The address never lies louder than the shelves')).toBe(true);
    // the landing reads once on the shell (the counter desk's SECOND word)
    expect(desk.includes('function initialPosCategory(): string | null {')).toBe(true);
    expect(desk.includes('if (typeof window === \'undefined\') return null;')).toBe(true);
    expect(desk.includes("return parseInitialNamedSlug(window.location.search, 'pos-category');")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE ONE DOOR — born guarded (the family's ONE reading)
// ---------------------------------------------------------------------------

describe('the shelves\u2019 ONE door — the press and the retire ride together', () => {
  it('the guarded door from birth (no turn, no write; the hand retires the word)', () => {
    expect(desk.includes('const choosePosCategory = (next: string) => {')).toBe(true);
    expect(desk.includes('if (next === selectedCategory) return;')).toBe(true);
    expect(desk.includes('setSelectedCategory(next);')).toBe(true);
    expect(desk.includes('if (next !== landedPosCategoryId) setPosCategoryLandingLive(false);')).toBe(true);
    expect(desk.includes('writePosCategorySlug(hit ? categorySlug(hit.name) : null);')).toBe(true);
  });
  it('the chip row\u2019s presses and the dismissal ride the one door (the landing resolves on the rows)', () => {
    // the chip row rides the door
    expect(desk.includes('onSelect={choosePosCategory}')).toBe(true);
    // the landing's resolve: the rows arrive and the slug finds its row
    // (the render-adjust shape — a guarded derivation seeding state
    // during render, no effect, no cascade)
    expect(desk.includes('if (landedPosCategory && !landedPosCategoryId && !categoriesLoading && categories.length > 0) {')).toBe(true);
    expect(desk.includes('const hit = categories.find((c) => categorySlug(c.name) === landedPosCategory);')).toBe(true);
    // the landing states (read once on the shell — a dismissed chip can
    // never resurrect)
    expect(desk.includes('const [landedPosCategory, setLandedPosCategory] = useState<string | null>(initialPosCategory);')).toBe(true);
    expect(desk.includes('const [posCategoryLandingLive, setPosCategoryLandingLive] = useState(true);')).toBe(true);
    expect(desk.includes('const [landedPosCategoryId, setLandedPosCategoryId] = useState<string | null>(null);')).toBe(true);
  });
  it('the chip\u2019s dismissal retires through the same door (resolved slugs only)', () => {
    expect(desk.includes('posCategoryLandingLive && landedPosCategory && landedPosCategoryId && (')).toBe(true);
    expect(desk.includes("setPosCategoryLandingLive(false); choosePosCategory('all');")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE CHIP + THE DRESS — the family's shared voice, no new hue
// ---------------------------------------------------------------------------

describe('the landed category wears the slate landing chip and the lens row wears its ground', () => {
  it('the chip speaks the family\u2019s shared slate through the loom', () => {
    expect(desk.includes('hue="slate"')).toBe(true);
    expect(desk.includes('label={`landed ?pos-category=${landedPosCategory}`}')).toBe(true);
    expect(desk.includes('data-testid="pos-category-landing-word"')).toBe(true);
    // the loom's slate line exists (no new wardrobe line — the census holds)
    expect(loom.includes(`slate: 'border-slate-300 bg-slate-100 text-slate-700`)).toBe(true);
  });
  it('THE DRESS — the lens row wears the quiet ground while a non-default shelf rides', () => {
    // the chips row wears the slate family's quiet ground (the
    // component file — the dress lives where the row lives), easing as
    // it arrives
    expect(chips.includes(`selected !== 'all' ? 'bg-slate-100' : 'bg-background'`)).toBe(true);
    expect(chips.includes('transition-colors rounded-lg')).toBe(true);
    // the fade gradients follow the ground (the edges stay one voice)
    expect(chips.includes(`selected !== 'all' ? 'from-slate-100' : 'from-background'`)).toBe(true);
    // the pressed face keeps the family's honest grammar (the
    // per-row data colors ride the tribe's own law)
    expect(chips.includes('aria-pressed={selected === \'all\'}')).toBe(true);
    expect(chips.includes('aria-pressed={isActive}')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE REGISTRY — the constitution's fifty-first row
// ---------------------------------------------------------------------------

describe('the constitution walks the fifty-first word', () => {
  it('the row is the registry\u2019s own (the self-reference, read from the constitution file)', () => {
    expect(constitution.includes("{ word: 'pos-category', desk: 'src/app/(shell)/tabs/pos-tab.tsx', family: 'border-slate-300', suite: 'src/tests/pos-category-address-v2494.test.ts' }")).toBe(true);
    expect(constitution.includes('(fifty-two words, thirty-three desks)')).toBe(true);
    // the admission line carries the word it admits (the ledger's own order)
    expect(constitution.includes("the counter's category word's own ledger — admitted")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE FEED — the round announces itself (the museum shape from birth)
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story — the honoured chain and the new word', () => {
    const head = WHATS_NEW.find((e) => e.version === '2.494.0');
    if (!head) throw new Error('the 2.494.0 entry is gone from the feed');
    expect(head.version).toBe('2.494.0');
    expect(head.title).toContain('the hand\u2019s turn retires the word');
    expect(head.title).toContain('the catalog\u2019s category rides the address');
    expect(head.title).toContain('the counter\u2019s category rides the address');
    expect(head.title).toContain('one breath');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?pos-category='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('SLUG-SHAPE LAW'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('SECOND word'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('guarded door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THE DEFAULT WEARS NO WORD'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('fifty-one words, thirty-three desks, forty families'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.495.0');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    expect(readFileSync('VERSION', 'utf8').trim()).toBe('2.495.0');
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.494.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.494.0]')).toBeLessThan(changelog.indexOf('[2.493.0]'));
  });
});
