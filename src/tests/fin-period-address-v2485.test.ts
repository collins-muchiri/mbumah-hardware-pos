// THE LEDGER'S PERIOD RIDES THE ADDRESS (v2.485.0): the financial
// desk's window answers the bar — the deep-link family's forty-first
// word (the ledger's period) — and the desk's buttons answer the
// word's own hue.
//
//   • THE PERIOD'S WORD — the helpers' bytes (read once on the shell,
//     the desk's OWN spellings, the custom's honest share, write back
//     on every turned preset and scratched day, THE DEFAULT WEARS NO
//     WORD), the one door.
//   • THE SIXTEENTH BYTE — green joins the 300 registry (the loyalty
//     desk's hue one storey deeper); the loom's wardrobe line; the
//     constitution's forty-first + forty-second + forty-third rows;
//     the once-only trio census; green leaving the stranger list; the
//     desk's own byte order (never the loom's wardrobe copy).
//   • THE GROUND — the styling verse: the active preset's own tint,
//     the range label's quiet tabular strip, the dark picker's dress,
//     the day inputs' own handles.
//   • THE SEATS — the desk's own elder bytes hold (the shell's tab
//     word composes, the sub-tabs stay the desk's scratches, no
//     foreign word rides this desk).
//   • THE FEED — the round leads the feed; the honoured probe ("The
//     ledger's period rides the address.") rides the title's chain.
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one voice.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { WHATS_NEW } from '@/lib/whats-new';
import { LANDING_CHIP_HUES, LANDING_CHIP_WARDROBES, landingChipSpeaksAt } from '@/components/landing-chip';
import { parseInitialNamedMember, parseInitialCustomRange } from '@/lib/tab-url';

const DESK = 'src/app/(shell)/tabs/financial-tab.tsx';
const LOOM = 'src/components/landing-chip.tsx';
const HOME = 'src/lib/tab-url.ts';
const REGISTRY = 'src/tests/transfer-status-deep-link-v2357.test.ts';
const STRESS = 'src/tests/family-registry-stress-v2370.test.ts';

const desk = readFileSync(DESK, 'utf8');
const loom = readFileSync(LOOM, 'utf8');
const home = readFileSync(HOME, 'utf8');
const registry = readFileSync(REGISTRY, 'utf8');
const stress = readFileSync(STRESS, 'utf8');

const FIN_WORDS = ['today', 'week', 'month', 'quarter', 'year'] as const;

// ---------------------------------------------------------------------------
// 1. THE PERIOD'S WORD — read once, write back, the honest share speaks WHOLE
// ---------------------------------------------------------------------------

describe('the period\u2019s word — the financial desk\u2019s window answers the bar', () => {
  it('the desk keeps its OWN spellings (the tuple the parser reads)', () => {
    expect(desk.includes("const FIN_RANGE_WORDS: readonly string[] = ['today', 'week', 'month', 'quarter', 'year'];")).toBe(true);
  });

  it('the named presets answer the bar through the ONE home\u2019s generic parser', () => {
    // the whole tuple speaks
    for (const word of FIN_WORDS) {
      expect(parseInitialNamedMember(`?fin-range=${word}`, 'fin-range', [...FIN_WORDS], 'month')).toBe(word);
    }
    // a made-up range is an unknown word, not a clever match
    expect(parseInitialNamedMember('?fin-range=fortnight', 'fin-range', [...FIN_WORDS], 'month')).toBe('month');
    // a capitalized near-miss is an unknown word too
    expect(parseInitialNamedMember('?fin-range=Week', 'fin-range', [...FIN_WORDS], 'month')).toBe('month');
    // the address's silence answers silence — never a stranded filter
    expect(parseInitialNamedMember('?tab=financial', 'fin-range', [...FIN_WORDS], 'month')).toBe('month');
    // a foreign desk's prefix never answers (the desk-prefix law)
    expect(parseInitialNamedMember('?rep-range=week', 'fin-range', [...FIN_WORDS], 'month')).toBe('month');
  });

  it('THE CUSTOM\u2019S HONEST SHARE — custom lands ONLY with both its days riding', () => {
    // the whole word speaks
    expect(parseInitialCustomRange('?fin-range=custom&fin-from=2026-01-01&fin-to=2026-03-31', 'fin-range', 'custom', 'fin-from', 'fin-to')).toEqual({ from: '2026-01-01', to: '2026-03-31' });
    // a bare custom stays the honest absence (the default's silence)
    expect(parseInitialCustomRange('?fin-range=custom', 'fin-range', 'custom', 'fin-from', 'fin-to')).toBeNull();
    // one honest day is not a word (the pair speaks WHOLE or not at all)
    expect(parseInitialCustomRange('?fin-range=custom&fin-from=2026-01-01&fin-to=nope', 'fin-range', 'custom', 'fin-from', 'fin-to')).toBeNull();
    // impossible dates are unknown words (honestDayKey's round-trip proof)
    expect(parseInitialCustomRange('?fin-range=custom&fin-from=2026-02-30&fin-to=2026-03-31', 'fin-range', 'custom', 'fin-from', 'fin-to')).toBeNull();
    // a foreign desk's pair never answers
    expect(parseInitialCustomRange('?rep-range=custom&rep-from=2026-01-01&rep-to=2026-03-31', 'fin-range', 'custom', 'fin-from', 'fin-to')).toBeNull();
  });

  it('THE LANDING IS READ ONCE ON THE SHELL — a dismissed chip can never resurrect', () => {
    // the SECOND shell-tab desk: a plain useState initializer (the
    // shell tolerates the default-first render — the v2.484 lesson's
    // own exception: a shell tab reads on the shell)
    expect(desk.includes('const [landedFinRange] = useState<string>(initialFinRange);')).toBe(true);
    expect(desk.includes('const [finRangeLandingLive, setFinRangeLandingLive] = useState(true);')).toBe(true);
    expect(desk.includes('const [datePreset, setDatePreset] = useState<string>(initialFinRange);')).toBe(true);
    expect(desk.includes('const [dateRange, setDateRange] = useState<{ from: string; to: string }>(() => {')).toBe(true);
    // the honest share seeds the scratch when the custom lands whole
    expect(desk.includes('const landed = initialFinRangeDates();')).toBe(true);
    expect(desk.includes('if (landed) return landed;')).toBe(true);
    expect(desk.includes("return getDatePreset(datePreset === 'custom' ? 'month' : datePreset);")).toBe(true);
  });

  it('THE PERIOD WRITES BACK — every turned preset and scratched day rides its bytes', () => {
    expect(desk.includes('function writeFinRangeWord(preset: string): void {')).toBe(true);
    expect(desk.includes("if (preset === 'month') params.delete('fin-range');")).toBe(true);
    // THE DATES RETIRE WITH THE CUSTOM'S WORD
    expect(desk.includes("if (preset !== 'custom') {")).toBe(true);
    expect(desk.includes("params.delete('fin-from');")).toBe(true);
    expect(desk.includes("params.delete('fin-to');")).toBe(true);
    expect(desk.includes('function writeFinRangeDates(from: string, to: string): void {')).toBe(true);
    expect(desk.includes("params.set('fin-range', 'custom');")).toBe(true);
    expect(desk.includes("params.set('fin-from', from);")).toBe(true);
    expect(desk.includes("params.set('fin-to', to);")).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', window.location.pathname + (qs ? `?${qs}` : \'\'));')).toBe(true);
  });

  it('THE ONE DOOR — the turn, the scratch and the retire ride together (a fact ride, never a gate)', () => {
    expect(desk.includes('const handlePreset = (preset: string) => {')).toBe(true);
    expect(desk.includes('if (preset !== datePreset) {')).toBe(true);
    expect(desk.includes('setFinRangeLandingLive(false);')).toBe(true);
    expect(desk.includes('writeFinRangeWord(preset);')).toBe(true);
    expect(desk.includes("const chooseFinDate = (which: 'from' | 'to', value: string) => {")).toBe(true);
    expect(desk.includes('if (value === (which === \'from\' ? dateRange.from : dateRange.to)) return; // THE AGREEMENT IS NO NEWS')).toBe(true);
    expect(desk.includes("onChange={(e) => { chooseFinDate('from', e.target.value); }}")).toBe(true);
    expect(desk.includes("onChange={(e) => { chooseFinDate('to', e.target.value); }}")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE SIXTEENTH BYTE — green joins the 300 registry
// ---------------------------------------------------------------------------

describe('the sixteenth byte — green, the ledger\u2019s own tone', () => {
  it('the loom\u2019s registry grew the hue and the wardrobe line', () => {
    expect(loom.includes("  'green',")).toBe(true);
    expect(loom.includes("  green: 'border-green-300 bg-green-100 text-green-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-green-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/20',")).toBe(true);
    // the elder 200 line stays exactly as it was (the loyalty desk's own)
    expect(loom.includes('border-green-200 bg-green-50 text-green-700')).toBe(true);
  });

  it('the storey line is ENFORCED — green speaks at both its storeys now', () => {
    expect(landingChipSpeaksAt('green', 300)).toBe(true);
    expect(landingChipSpeaksAt('green', 200)).toBe(true);
    // v2.486.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to seventeen (the queue's red).
    // v2.487.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to eighteen (the shift's slate).
    expect(LANDING_CHIP_HUES.length).toBe(18);
    expect(LANDING_CHIP_WARDROBES.green).toContain('hover:bg-green-200');
  });

  it('the chip rides the desk\u2019s own preset row (the desk\u2019s first loom face)', () => {
    expect(desk.includes('hue="green"')).toBe(true);
    expect(desk.includes('landed ?fin-range=custom&fin-from&fin-to')).toBe(true);
    expect(desk.includes('data-testid="fin-range-landing-word"')).toBe(true);
    expect(desk.includes('press to clear it')).toBe(true);
  });

  it('THE ONCE-ONLY CENSUS — the green 300-trio lives in exactly one src file (the loom)', () => {
    const trio = 'border-green-300 bg-green-100 text-green-700';
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
    expect(desk.includes('bg-green-100 border-green-300 text-green-700')).toBe(true);
    expect(desk.includes('border-green-300 bg-green-100')).toBe(false);
  });

  it('the collision check ran at round start — the bytes are the desk\u2019s own', () => {
    // the desk-prefixed word rides NOWHERE else; the reports desk's
    // namespace (`rep-from`/`rep-to`) is another desk, another route,
    // never the address bar
    expect(desk.includes("'fin-range'")).toBe(true);
    expect(desk.includes("'fin-from'")).toBe(true);
    expect(desk.includes("'fin-to'")).toBe(true);
    expect((home.match(/fin-range/g) ?? []).length).toBeGreaterThanOrEqual(1);
    // the bare bytes stay untouched by this desk's writes
    expect(desk.includes("params.set('from'")).toBe(false);
    expect(desk.includes("params.set('to'")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. THE GROUND — the styling verse
// ---------------------------------------------------------------------------

describe('the ledger\u2019s period gets its own dress — the styling verse', () => {
  it('the active preset wears the word\u2019s own hue (the pressed period speaks one voice with its chip)', () => {
    expect(desk.includes("'h-7 text-xs bg-green-100 border-green-300 text-green-700 hover:bg-green-200 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-300'")).toBe(true);
  });

  it('the range label wears its quiet tabular strip', () => {
    expect(desk.includes('data-testid="fin-range-label"')).toBe(true);
    expect(desk.includes('className="font-medium tabular-nums rounded-md bg-muted/30 px-2 py-0.5 inline-block"')).toBe(true);
  });

  it('the dark picker\u2019s dress and the day inputs\u2019 own handles', () => {
    expect((desk.match(/className="w-32 text-xs h-8 tabular-nums dark:\[color-scheme:dark\]"/g) ?? []).length).toBe(2);
    expect(desk.includes('data-testid="fin-from-input"')).toBe(true);
    expect(desk.includes('data-testid="fin-to-input"')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE SEATS — the desk's own elder bytes keep their places
// ---------------------------------------------------------------------------

describe('the seats — the round moves the period, the desk\u2019s elder bytes hold', () => {
  it('the write half preserves the other params (the shell\u2019s tab word composes)', () => {
    expect(desk.includes('const params = new URLSearchParams(window.location.search);')).toBe(true);
    expect(desk.includes('window.location.pathname + (qs ? `?${qs}` : \'\')')).toBe(true);
  });

  it('the desk\u2019s own sub-tabs stay the desk\u2019s scratches (never the family\u2019s words)', () => {
    expect(desk.includes('setActiveSubTab')).toBe(true);
  });

  it('no foreign word rides this desk (the collision-note shadow law)', () => {
    expect(desk.includes("'hr-from'")).toBe(false);
    expect(desk.includes("'rep-range'")).toBe(false);
    expect(desk.includes("'dead-sort'")).toBe(false);
  });

  it('the period\u2019s wire keeps its face (the queries still read the desk\u2019s own dates)', () => {
    expect(desk.includes("queryFn: () => financialApi.listJournalEntries({ storeId: currentStoreId, dateFrom: dateRange.from, dateTo: dateRange.to, limit: 50 })")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE CONSTITUTION — the period joins the vocabulary
// ---------------------------------------------------------------------------

describe('the constitution — forty-three words, twenty-eight desks, the third shared family', () => {
  it('the period\u2019s rows joined (the ledger\u2019s green serves all three)', () => {
    expect(registry.includes("{ word: 'fin-range', desk: 'src/app/(shell)/tabs/financial-tab.tsx', family: 'border-green-300', suite: 'src/tests/fin-period-address-v2485.test.ts' }")).toBe(true);
    expect(registry.includes("{ word: 'fin-from', desk: 'src/app/(shell)/tabs/financial-tab.tsx', family: 'border-green-300', suite: 'src/tests/fin-period-address-v2485.test.ts' }")).toBe(true);
    expect(registry.includes("{ word: 'fin-to', desk: 'src/app/(shell)/tabs/financial-tab.tsx', family: 'border-green-300', suite: 'src/tests/fin-period-address-v2485.test.ts' }")).toBe(true);
    expect(registry.includes('(forty-eight words, thirty-two desks)')).toBe(true);
  });

  it('the stress walks the roll and the derived counts (40 \u2192 43, desks 27 \u2192 28, families 37 \u2192 38 — the THIRD shared family)', () => {
    expect(stress.includes("'fin-range',")).toBe(true);
    expect(stress.includes("'fin-from',")).toBe(true);
    expect(stress.includes("'fin-to',")).toBe(true);
    // v2.486.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-four (the queue's round); the
    // contains-pin rides the bytes that ARE.
    // v2.487.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-five (the shift's round); the
    // contains-pin rides the bytes that ARE.
    // v2.489.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-six (the dashboard's round); the
    // contains-pin rides the bytes that ARE.
    // v2.490.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-seven (the counter's round); the
    // contains-pin rides the bytes that ARE.
    // v2.491.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-eight (the catalog's round); the
    // contains-pin rides the bytes that ARE.
    expect(stress.includes('toBe(48)')).toBe(true);
    // v2.486.0 (dated): the living desks-pin rolls — the desks grew
    // to twenty-nine (the THIRD shell-tab desk); the contains-pin
    // rides the bytes that ARE.
    // v2.487.0 (dated): the living desks-pin rolls — the desks grew
    // to thirty (the FOURTH shell-tab desk); the contains-pin rides
    // the bytes that ARE.
    // v2.489.0 (dated): the living desks-pin rolls — thirty-one
    // desks (the FIFTH shell-tab desk joined); the contains-pin
    // rides the bytes that ARE.
    // v2.490.0 (dated): the living desks-pin rolls — the desks grew
    // to thirty-two (the SIXTH shell-tab desk); the contains-pin rides
    // the bytes that ARE.
    expect(stress.includes('expect(new Set(rows.map((r) => r.desk)).size).toBe(32);')).toBe(true);
    // v2.486.0 (dated): the living family-pin rolls — the families
    // grew to thirty-nine (red-300 joined); the contains-pin rides
    // the bytes that ARE.
    // v2.487.0 (dated): the living family-pin rolls — the families
    // grew to forty (slate-300 joined); the contains-pin rides
    // the bytes that ARE.
    expect(stress.includes('expect(new Set(rows.map((r) => r.family)).size).toBe(40);')).toBe(true);
    // the THIRD shared family: the pair rides the period's green —
    // three words, one chip
    expect(stress.includes("'fin-from': 'fin-range'")).toBe(true);
    expect(stress.includes("'fin-to': 'fin-range'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story — the honoured probe and the new word', () => {
    // v2.486.0 THE MUSEUM RE-KEY (the v2470 treatment): the round's own
    // entry is FOUND, not assumed to lead — the feed rides the living
    // head, the museum keeps the round's own word; the guard comes with
    // the find.
    const head = WHATS_NEW.find((e) => e.version === '2.485.0');
    if (!head) throw new Error('the 2.485.0 entry is gone from the feed');
    expect(head.version).toBe('2.485.0');
    expect(head.title).toContain('the people\u2019s window rides the address');
    expect(head.title).toContain('the ledger\u2019s period rides the address');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('carry');
    expect(head.title).toContain('the paper speaks the window\u2019s word');
    expect(head.title).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?fin-range='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('forty-first word'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THE DEFAULT WEARS NO WORD'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('Green joins the 300 registry'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('shade-split law'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('stranger list'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THIRD shared family'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('bg-muted/30'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('color-scheme'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('ONE home'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('NOWHERE'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.491.0');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.485.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.485.0]')).toBeLessThan(changelog.indexOf('[2.484.0]'));
  });
});
