// THE SHIFT'S WEEK RIDES THE ADDRESS (v2.487.0): the scheduling desk's
// week answers the bar — the deep-link family's forty-fifth word (the
// shift week, the FOURTH shell-tab desk) — and the week's own strip
// answers the word's own hue.
//
//   • THE WEEK'S WORD — the helpers' bytes (read once on the shell,
//     the ONE home's honest-day validator, write back on every turned
//     week, THE DEFAULT WEARS NO WORD), the one door.
//   • THE EIGHTEENTH BYTE — slate joins the 300 registry (the
//     conversations desk's hue one storey deeper); the loom's wardrobe
//     line; the constitution's forty-fifth row; the once-only trio
//     census; slate leaving the stranger list; the desk's own byte
//     order (never the loom's wardrobe copy).
//   • THE GROUND — the styling verse: the range label's own strip (the
//     word's tint, the desk's byte order, the dark wardrobe), the
//     count's quiet tabular strip.
//   • THE SEATS — the desk's own elder bytes hold (the week nav's own
//     handles, the weekly query still reads the week, no foreign door
//     drifts).
//   • THE FEED — the round leads the feed; the honoured probe ("The
//     queue's own word rides the address.") rides the title's chain.
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one voice.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { WHATS_NEW } from '@/lib/whats-new';
import { LANDING_CHIP_HUES, LANDING_CHIP_WARDROBES, landingChipSpeaksAt } from '@/components/landing-chip';
import { parseInitialNamedDay } from '@/lib/tab-url';

const DESK = 'src/app/(shell)/tabs/shift-scheduling-tab.tsx';
const LOOM = 'src/components/landing-chip.tsx';
const HOME = 'src/lib/tab-url.ts';
const REGISTRY = 'src/tests/transfer-status-deep-link-v2357.test.ts';
const STRESS = 'src/tests/family-registry-stress-v2370.test.ts';

const desk = readFileSync(DESK, 'utf8');
const loom = readFileSync(LOOM, 'utf8');
const home = readFileSync(HOME, 'utf8');
const registry = readFileSync(REGISTRY, 'utf8');
const stress = readFileSync(STRESS, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE WEEK'S WORD — read once, write back, the honest day
// ---------------------------------------------------------------------------

describe('the shift\u2019s week — the scheduling desk\u2019s week answers the bar', () => {
  it('the ONE home keeps the day-key law (the shape word reads through the honest validator)', () => {
    expect(home.includes('export function parseInitialNamedDay(')).toBe(true);
    expect(home.includes('return honestDayKey(toParams(search).get(param));')).toBe(true);
    // the home's own note carries the round's stamp and the word's
    // backticked name (the ONE home names every speaker)
    expect(home.includes('v2.487.0')).toBe(true);
    expect(home.includes('`shift-week`')).toBe(true);
  });

  it('the word answers the bar through the honest-day validator', () => {
    // a real calendar day lands WHOLE (the date input's own bytes)
    expect(parseInitialNamedDay('?shift-week=2026-11-02', 'shift-week')).toBe('2026-11-02');
    // a malformed shape is an unknown word, not a clever match
    expect(parseInitialNamedDay('?shift-week=week', 'shift-week')).toBe('');
    expect(parseInitialNamedDay('?shift-week=2026-11', 'shift-week')).toBe('');
    expect(parseInitialNamedDay('?shift-week=20261102', 'shift-week')).toBe('');
    // an impossible day is an unknown word too (the round-trip law:
    // V8's lenient ISO parse must re-format to the exact bytes it
    // came from)
    expect(parseInitialNamedDay('?shift-week=2026-02-30', 'shift-week')).toBe('');
    expect(parseInitialNamedDay('?shift-week=2026-13-01', 'shift-week')).toBe('');
    // the address's silence answers silence — never a stranded filter
    expect(parseInitialNamedDay('?tab=shift-scheduling', 'shift-week')).toBe('');
    // a foreign desk's prefix never answers (the desk-prefix law)
    expect(parseInitialNamedDay('?roster-week=2026-11-02', 'shift-week')).toBe('');
  });

  it('THE LANDING IS READ ONCE ON THE SHELL — a dismissed chip can never resurrect', () => {
    // a plain useState initializer (the shell tolerates the
    // default-first render — the v2.484 lesson's own exception: a
    // shell tab reads on the shell)
    expect(desk.includes('const [landedShiftWeek] = useState<string>(landedShiftWeekWord);')).toBe(true);
    expect(desk.includes('const [shiftWeekLandingLive, setShiftWeekLandingLive] = useState(true);')).toBe(true);
    expect(desk.includes('const [weekStartStr, setWeekStartStr] = useState<string>(() => landedShiftWeekWord() || todayWeekStart());')).toBe(true);
    // the reader guards the server (the address's silence answers
    // silence — never a stranded filter)
    expect(desk.includes("if (typeof window === 'undefined') return '';")).toBe(true);
  });

  it('THE WEEK WRITES BACK — every turned week rides its bytes, the resting week strips its key', () => {
    expect(desk.includes('function writeShiftWeekWord(iso: string): void {')).toBe(true);
    expect(desk.includes('if (iso === todayWeekStart()) params.delete(\'shift-week\');')).toBe(true);
    expect(desk.includes('else params.set(\'shift-week\', iso);')).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', window.location.pathname + (qs ? `?${qs}` : \'\'));')).toBe(true);
    // a blocked write is the week's silence, never a thrown desk
    expect(desk.includes('// The address never lies louder than the week')).toBe(true);
  });

  it('THE ONE DOOR — the turn and the write ride together (a fact ride, never a gate)', () => {
    expect(desk.includes('const chooseShiftWeek = (iso: string) => {')).toBe(true);
    // THE FAMILY'S ONE READING (v2.488.0 — the dated pin): the guarded
    // door — no turn, no write — and the hand's turn retires the word
    // (the chip speaks the ADDRESS BAR's landing, never the human's
    // next choice — the window's persist shape retires with it).
    expect(desk.includes('if (iso === weekStartStr) return;')).toBe(true);
    expect(desk.includes('if (iso !== landedShiftWeek) setShiftWeekLandingLive(false);')).toBe(true);
    expect(desk.includes('setWeekStartStr(iso);')).toBe(true);
    expect(desk.includes('writeShiftWeekWord(iso);')).toBe(true);
    // the week nav's presses all speak the one door
    expect(desk.includes('chooseShiftWeek(dateToDateInputValue(d));')).toBe(true);
    expect(desk.includes('chooseShiftWeek(todayWeekStart());')).toBe(true);
    // the chip's dismissal retires through the same door
    expect(desk.includes('setShiftWeekLandingLive(false); chooseShiftWeek(todayWeekStart())')).toBe(true);
  });

  it('THE DEFAULT WEARS NO WORD — a landed word that names the resting week wears no chip', () => {
    // the chip's triple condition: live, landed, NON-default (the
    // rep-type law's own reading — a landing of the default speaks
    // the shape the bare landing already answers)
    expect(desk.includes('shiftWeekLandingLive && landedShiftWeek && landedShiftWeek !== todayWeekStart()')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE EIGHTEENTH BYTE — slate joins the 300 registry
// ---------------------------------------------------------------------------

describe('the eighteenth byte — slate, the scheduling desk\u2019s roster hue', () => {
  it('the loom\u2019s registry grew the hue and the wardrobe line', () => {
    expect(loom.includes("  'slate',")).toBe(true);
    expect(loom.includes("  slate: 'border-slate-300 bg-slate-100 text-slate-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300 dark:hover:bg-slate-500/20',")).toBe(true);
    // the elder 200 line stays exactly as it was (the conversations
    // desk's own)
    expect(loom.includes('border-slate-200 bg-slate-50 text-slate-700')).toBe(true);
  });

  it('the storey line is ENFORCED — slate speaks at both its storeys now', () => {
    expect(landingChipSpeaksAt('slate', 300)).toBe(true);
    expect(landingChipSpeaksAt('slate', 200)).toBe(true);
    // v2.496.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to nineteen (the ledger's zinc).
    expect(LANDING_CHIP_HUES.length).toBe(19);
    expect(LANDING_CHIP_WARDROBES.slate).toContain('hover:bg-slate-200');
  });

  it('THE ONCE-ONLY CENSUS — the slate 300-trio lives in exactly one src file (the loom)', () => {
    const trio = 'border-slate-300 bg-slate-100 text-slate-700';
    const walk = (dir: string, acc: string[]): string[] => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name === 'node_modules' || e.name === '.next' || e.name === '.roundtrip-baseline') continue;
          walk(p, acc);
        } else if (/\.tsx$/.test(e.name) && acc.length < 4000) {
          acc.push(p);
        }
      }
      return acc;
    };
    const files = walk('src', []).filter((p) => readFileSync(p, 'utf8').includes(trio));
    expect(files.map((p) => p.replace(/\\/g, '/'))).toEqual([LOOM]);
  });

  it('the desk wears the family\u2019s own tint in its OWN byte order (never the loom\u2019s wardrobe copy)', () => {
    // the styling verse's honest form: the desk's colours, the desk's
    // byte order — the loom's exact trio stays the loom's
    expect(desk.includes('bg-slate-100 border border-slate-300 text-slate-700')).toBe(true);
    expect(desk.includes('border-slate-300 bg-slate-100')).toBe(false);
  });

  it('the collision check ran at round start — the byte is the desk\u2019s own', () => {
    // the desk-prefixed word rides NOWHERE else (checked tree-wide at
    // round open — the grep returned nothing before this word landed)
    expect(desk.includes("'shift-week'")).toBe(true);
    expect((home.match(/shift-week/g) ?? []).length).toBeGreaterThanOrEqual(1);
    // the write half touches ONLY its own word (scoped to the write
    // function's own body slice — the desk's other wires never speak
    // the address)
    const writeBody = desk.slice(desk.indexOf('function writeShiftWeekWord'), desk.indexOf('export function ShiftSchedulingTab'));
    expect((writeBody.match(/params\.set\('[^']+'/g) ?? [])).toEqual(["params.set('shift-week'"]);
    expect((writeBody.match(/params\.delete\('[^']+'/g) ?? [])).toEqual(["params.delete('shift-week'"]);
  });
});

// ---------------------------------------------------------------------------
// 3. THE GROUND — the styling verse
// ---------------------------------------------------------------------------

describe('the week gets its own dress — the styling verse', () => {
  it('the range label wears the word\u2019s own strip (the pressed week and its chip speak one voice)', () => {
    expect(desk.includes('data-testid="shift-week-range-label"')).toBe(true);
    // the slate tint, the desk's own byte order, the dark wardrobe
    expect(desk.includes('bg-slate-100 border border-slate-300 text-slate-700 tabular-nums dark:bg-slate-500/10 dark:border-slate-500/30 dark:text-slate-300')).toBe(true);
  });

  it('the count wears its quiet tabular strip (the week\u2019s answer reads as one steady word)', () => {
    expect(desk.includes('data-testid="shift-week-scheduled-count"')).toBe(true);
    expect(desk.includes('bg-muted/30 tabular-nums')).toBe(true);
  });

  it('the resting week\u2019s label stays plain (the default wears no dress)', () => {
    expect(desk.includes("'text-sm font-semibold ml-2 tabular-nums'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE SEATS — the desk's own elder bytes keep their places
// ---------------------------------------------------------------------------

describe('the seats — the round moves the week\u2019s word, the desk\u2019s elder bytes hold', () => {
  it('the write half preserves the other params (the shell\u2019s tab word composes)', () => {
    expect(desk.includes('const params = new URLSearchParams(window.location.search);')).toBe(true);
    expect(desk.includes('window.location.pathname + (qs ? `?${qs}` : \'\')')).toBe(true);
  });

  it('the week nav\u2019s own handles stay the desk\u2019s (the elder bytes hold)', () => {
    expect(desk.includes('aria-label="Previous week"')).toBe(true);
    expect(desk.includes('aria-label="Next week"')).toBe(true);
    expect(desk.includes('onClick={handleToday}')).toBe(true);
  });

  it('the weekly query still reads the week (the wire keeps its face)', () => {
    expect(desk.includes("['shift-schedules-weekly', currentStoreId, weekStartStr]")).toBe(true);
    expect(desk.includes("['shift-schedules-stats', currentStoreId, weekStartStr]")).toBe(true);
    expect(desk.includes('shiftSchedulesApi.weekly(currentStoreId, weekStartStr)')).toBe(true);
    expect(desk.includes('shiftSchedulesApi.stats(currentStoreId, weekStartStr)')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE CONSTITUTION — the shift week joins the vocabulary
// ---------------------------------------------------------------------------

describe('the constitution — forty-five words, thirty desks', () => {
  it('the shift week\u2019s row joined (the scheduling desk\u2019s slate serves it)', () => {
    expect(registry.includes("{ word: 'shift-week', desk: 'src/app/(shell)/tabs/shift-scheduling-tab.tsx', family: 'border-slate-300', suite: 'src/tests/shift-week-address-v2487.test.ts' }")).toBe(true);
    expect(registry.includes('(fifty-three words, thirty-three desks)')).toBe(true);
  });

  it('the stress walks the roll and the derived counts (44 \u2192 45, desks 29 \u2192 30, families 39 \u2192 40 — slate-300 joined, no shared family)', () => {
    expect(stress.includes("'shift-week',")).toBe(true);
    // v2.489.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-six (the dashboard's round); the
    // contains-pin rides the bytes that ARE.
    // v2.490.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-seven (the counter's round); the
    // contains-pin rides the bytes that ARE.
    // v2.491.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-eight (the catalog's round); the
    // contains-pin rides the bytes that ARE.
    // v2.492.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-nine (the analytics' round); the
    // contains-pin rides the bytes that ARE.
    // v2.493.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to fifty (the catalog's category round); the
    // contains-pin rides the bytes that ARE.
    // v2.494.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to fifty-one (the counter's category round); the
    // contains-pin rides the bytes that ARE.
    // v2.495.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to fifty-two (the inventory's category round); the
    // contains-pin rides the bytes that ARE.
    // v2.496.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to fifty-three (the ledger's order round); the
    // contains-pin rides the bytes that ARE.
    expect(stress.includes('toBe(53)')).toBe(true);
    // v2.489.0 (dated): the living desks-pin rolls — thirty-one
    // desks (the FIFTH shell-tab desk joined); the contains-pin
    // rides the bytes that ARE.
    // v2.490.0 (dated): the living desks-pin rolls — the desks grew
    // to thirty-two (the SIXTH shell-tab desk); the contains-pin rides
    // the bytes that ARE.
    // v2.492.0 (dated): the living desk-pin rolls — the stress's desk
    // census grew to thirty-three (the analytics dashboard joins as
    // the family's FIRST component desk); the contains-pin rides
    // the bytes that ARE.
    expect(stress.includes('expect(new Set(rows.map((r) => r.desk)).size).toBe(33);')).toBe(true);
    // v2.496.0 (dated): the living family-pin rolls — the families
    // grew to forty-one (zinc-300 joined); the contains-pin rides
    // the bytes that ARE.
    expect(stress.includes('expect(new Set(rows.map((r) => r.family)).size).toBe(41);')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story — the honoured probe and the new word', () => {
    // THE MUSEUM RE-KEY (the v2470 treatment, carried once at v2.488.0):
    // the round's own entry is found in the living feed — the head
    // survives every future bump (the find + the guard come together).
    const head = WHATS_NEW.find((e) => e.version === '2.487.0');
    if (!head) throw new Error('the 2.487.0 entry is gone from the feed');
    expect(head.version).toBe('2.487.0');
    expect(head.title).toContain('the queue\u2019s own word rides the address');
    expect(head.title).toContain('the shift\u2019s week rides the address');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('carry');
    expect(head.title).toContain('the paper speaks the window\u2019s word');
    expect(head.title).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?shift-week='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('forty-fifth word'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THE DEFAULT WEARS NO WORD'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('Slate joins the 300 registry'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('shade-split law'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('stranger list'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('FOURTH shell-tab desk'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('ONE home'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('unknown word'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.496.0');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.487.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.487.0]')).toBeLessThan(changelog.indexOf('[2.486.0]'));
  });
});
