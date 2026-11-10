// THE ANALYTICS' PERIOD RIDES THE ADDRESS (v2.492.0): the analytics
// dashboard's lens answers the bar — the deep-link family's forty-ninth
// word (the analytics' period, the family's FIRST component desk — the
// word lives where the state lives) — born wearing the family's ONE
// reading (the guarded door, the hand's turn retires the word).
//
//   • THE LENS'S WORD — the helpers' bytes (read once on the shell,
//     the ONE home's member tuple, write back on every turned period,
//     THE DEFAULT WEARS NO WORD), the one door, the guarded reading.
//   • THE CHIP — the landed period wears the slate landing chip (the
//     family's shared voice, the loom's wardrobe, no new hue); the
//     chip's triple condition.
//   • THE DRESS — the lens wears the slate family's quiet ground while
//     a non-default period rides (the pressed face and its chip speak
//     one voice); the door's drill-down rides the same bytes.
//   • THE REGISTRY — the constitution's forty-ninth row, read from
//     the constitution file itself (the registry is the input, never a
//     copy); the census rolls (forty-nine words, thirty-three desks,
//     forty families — the family's shared slate serves five words).
//   • THE FEED — the round leads the feed (found in the living feed —
//     the find + the guard come together, the museum shape from birth).
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one
//     voice.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WHATS_NEW } from '@/lib/whats-new';
import { parseInitialNamedMember, AN_PERIOD_MEMBERS } from '@/lib/tab-url';

const DESK = 'src/components/analytics/analytics-dashboard.tsx';
const HOME = 'src/lib/tab-url.ts';
const LOOM = 'src/components/landing-chip.tsx';
const CONSTITUTION = 'src/tests/transfer-status-deep-link-v2357.test.ts';

const desk = readFileSync(DESK, 'utf8');
const home = readFileSync(HOME, 'utf8');
const loom = readFileSync(LOOM, 'utf8');
const constitution = readFileSync(CONSTITUTION, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE LENS'S WORD — read once, write back, the honest member
// ---------------------------------------------------------------------------

describe('the analytics\u2019 period — the lens answers the bar', () => {
  it('the ONE home keeps the member law (the lens\u2019s own tuple reads through the generic parser)', () => {
    expect(home.includes('export const AN_PERIOD_MEMBERS = [')).toBe(true);
    expect(home.includes(`'today',`)).toBe(true);
    expect(home.includes(`'year'] as const`)).toBe(true);
    // the home's own note carries the round's stamp and the word's
    // backticked name (the ONE home names every speaker)
    expect(home.includes('v2.492.0')).toBe(true);
    expect(home.includes('`an-period`')).toBe(true);
  });

  it('the word answers the bar through the honest member parser', () => {
    // a real member lands WHOLE
    expect(parseInitialNamedMember('?an-period=today', 'an-period', [...AN_PERIOD_MEMBERS], 'week')).toBe('today');
    expect(parseInitialNamedMember('?an-period=month', 'an-period', [...AN_PERIOD_MEMBERS], 'week')).toBe('month');
    // a made-up member or a wrong case is an unknown word, not a clever match
    expect(parseInitialNamedMember('?an-period=quarter', 'an-period', [...AN_PERIOD_MEMBERS], 'week')).toBe('week');
    expect(parseInitialNamedMember('?an-period=WEEK', 'an-period', [...AN_PERIOD_MEMBERS], 'week')).toBe('week');
    // a foreign desk's prefix is silence
    expect(parseInitialNamedMember('?pos-view=list', 'an-period', [...AN_PERIOD_MEMBERS], 'week')).toBe('week');
  });

  it('THE DEFAULT WEARS NO WORD (the write half strips the resting key)', () => {
    expect(desk.includes(`if (next === 'week') params.delete('an-period');`)).toBe(true);
    expect(desk.includes(`else params.set('an-period', next);`)).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', window.location.pathname + (qs ? `?${qs}` : \'\'));')).toBe(true);
    // a blocked write is the lens's silence, never a thrown desk
    expect(desk.includes('// The address never lies louder than the lens')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE ONE DOOR — born guarded (the family's ONE reading)
// ---------------------------------------------------------------------------

describe('the lens\u2019s ONE door — the turn and the retire ride together', () => {
  it('the guarded door from birth (no turn, no write; the hand retires the word)', () => {
    expect(desk.includes('const choosePeriod = (next: AnalyticsPeriod) => {')).toBe(true);
    expect(desk.includes('if (next === period) return;')).toBe(true);
    expect(desk.includes('setPeriod(next);')).toBe(true);
    expect(desk.includes('if (next !== landedAnPeriod) setAnPeriodLandingLive(false);')).toBe(true);
    expect(desk.includes('writeAnPeriodWord(next);')).toBe(true);
  });
  it('the lens\u2019s presses speak the one door (the Select and the drill-down\u2019s own handles)', () => {
    expect(desk.includes('onValueChange={(v) => choosePeriod(v as AnalyticsPeriod)}')).toBe(true);
    expect(desk.includes('onPeriodChange={choosePeriod}')).toBe(true);
    // the landing reads once on the shell (the family's FIRST component desk)
    expect(desk.includes('const [landedAnPeriod] = useState<AnalyticsPeriod>(initialAnPeriod);')).toBe(true);
    expect(desk.includes('const [anPeriodLandingLive, setAnPeriodLandingLive] = useState(true);')).toBe(true);
    expect(desk.includes('if (typeof window === \'undefined\') return \'week\';')).toBe(true);
  });
  it('the chip\u2019s dismissal retires through the same door (the triple condition)', () => {
    expect(desk.includes("anPeriodLandingLive && landedAnPeriod && landedAnPeriod !== 'week' && (")).toBe(true);
    expect(desk.includes("setAnPeriodLandingLive(false); choosePeriod('week');")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE CHIP + THE DRESS — the family's shared voice, no new hue
// ---------------------------------------------------------------------------

describe('the landed period wears the slate landing chip and the lens wears its ground', () => {
  it('the chip speaks the family\u2019s shared slate through the loom', () => {
    expect(desk.includes('hue="slate"')).toBe(true);
    expect(desk.includes('label={`landed ?an-period=${landedAnPeriod}`}')).toBe(true);
    expect(desk.includes('data-testid="an-period-landing-word"')).toBe(true);
    // the loom's slate line exists (no new wardrobe line — the census holds)
    expect(loom.includes(`slate: 'border-slate-300 bg-slate-100 text-slate-700`)).toBe(true);
  });
  it('THE DRESS — the pressed face and its chip speak one voice (the desk\u2019s own byte order)', () => {
    // the lens wears the slate family's quiet ground while a
    // non-default period rides, easing as it arrives
    expect(desk.includes(`'h-8 w-[140px] text-xs transition-colors',`)).toBe(true);
    expect(desk.includes(`period !== 'week' ? 'bg-slate-100' : 'bg-background',`)).toBe(true);
    // the axe shape: the desk never presses a muted aria-pressed
    expect(desk.includes('aria-pressed')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. THE REGISTRY — the constitution's forty-ninth row
// ---------------------------------------------------------------------------

describe('the constitution walks the forty-ninth word', () => {
  it('the row is the registry\u2019s own (the self-reference, read from the constitution file)', () => {
    expect(constitution.includes("{ word: 'an-period', desk: 'src/components/analytics/analytics-dashboard.tsx', family: 'border-slate-300', suite: 'src/tests/an-period-address-v2492.test.ts' }")).toBe(true);
    expect(constitution.includes('(fifty-three words, thirty-three desks)')).toBe(true);
    // the admission line carries the word it admits (the sorted place)
    expect(constitution.includes('ad-severity < an-period < bank-mpesa')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE FEED — the round announces itself (the museum shape from birth)
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story — the honoured chain and the new word', () => {
    const head = WHATS_NEW.find((e) => e.version === '2.492.0');
    if (!head) throw new Error('the 2.492.0 entry is gone from the feed');
    expect(head.version).toBe('2.492.0');
    expect(head.title).toContain('the hand\u2019s turn retires the word');
    expect(head.title).toContain('the counter\u2019s view rides the address');
    expect(head.title).toContain('the catalog\u2019s view rides the address');
    expect(head.title).toContain('the analytics\u2019 period rides the address');
    expect(head.title).toContain('one breath');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?an-period='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('FIRST component desk'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('guarded door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THE DEFAULT WEARS NO WORD'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('forty-nine words, thirty-three desks, forty families'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.498.0');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    expect(readFileSync('VERSION', 'utf8').trim()).toBe('2.498.0');
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.492.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.492.0]')).toBeLessThan(changelog.indexOf('[2.491.0]'));
  });
});
