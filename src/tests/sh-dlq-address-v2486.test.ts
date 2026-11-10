// THE QUEUE'S OWN WORD RIDES THE ADDRESS (v2.486.0): the system-health
// desk's DLQ lens answers the bar — the deep-link family's forty-fourth
// word (the queue) — and the queue's buttons answer the word's own hue.
//
//   • THE QUEUE'S WORD — the helpers' bytes (read once on the shell,
//     the desk's OWN spellings in the ONE home, write back on every
//     turned member, THE DEFAULT WEARS NO WORD), the one door.
//   • THE SUB-TAB RAISE — the law's third application: a landing that
//     carries the word raises the desk's own dlq sub-tab (the pane's
//     seed reads the same landed word; switching afterwards is the
//     human's own navigation).
//   • THE SEVENTEENTH BYTE — red joins the 300 registry (the etims
//     desk's hue one storey deeper); the loom's wardrobe line; the
//     constitution's forty-fourth row; the once-only trio census; red
//     leaving the stranger list; the desk's own byte order (never the
//     loom's wardrobe copy).
//   • THE GROUND — the styling verse: the active member's own tint,
//     the six members' own handles, the dark wardrobe.
//   • THE SEATS — the desk's own elder bytes hold (the breaker's own
//     scratch stays, no foreign word rides this desk, the DLQ query
//     still reads the lens).
//   • THE FEED — the round leads the feed; the honoured probe ("The
//     ledger's period rides the address.") rides the title's chain.
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one voice.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { WHATS_NEW } from '@/lib/whats-new';
import { LANDING_CHIP_HUES, LANDING_CHIP_WARDROBES, landingChipSpeaksAt } from '@/components/landing-chip';
import { parseInitialNamedMember, SH_DLQ_FILTERS } from '@/lib/tab-url';

const DESK = 'src/app/(shell)/tabs/system-health-tab.tsx';
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
// 1. THE QUEUE'S WORD — read once, write back, the honest members
// ---------------------------------------------------------------------------

describe('the queue\u2019s word — the health desk\u2019s DLQ lens answers the bar', () => {
  it('the ONE home keeps the desk\u2019s OWN spellings (the tuple the parser reads)', () => {
    expect(home.includes("export const SH_DLQ_FILTERS = [")).toBe(true);
    expect(home.includes("  'all',")).toBe(true);
    expect(home.includes("  'PENDING',")).toBe(true);
    expect(home.includes("  'RETRYING',")).toBe(true);
    expect(home.includes("  'DEAD',")).toBe(true);
    expect(home.includes("  'COMPLETED',")).toBe(true);
    expect(home.includes("  'CANCELLED',")).toBe(true);
    // the desk and the suite speak the ONE array (the same home
    // BANK_TYPE_FILTERS keeps for the banking desk's shape word)
    expect([...SH_DLQ_FILTERS]).toEqual(['all', 'PENDING', 'RETRYING', 'DEAD', 'COMPLETED', 'CANCELLED']);
  });

  it('the members answer the bar through the ONE home\u2019s generic parser', () => {
    // the whole tuple speaks (the lowercase neutral, the five
    // UPPERCASE status words — the wire's own voice)
    for (const word of SH_DLQ_FILTERS) {
      expect(parseInitialNamedMember(`?sh-dlq=${word}`, 'sh-dlq', [...SH_DLQ_FILTERS], 'all')).toBe(word);
    }
    // a made-up member is an unknown word, not a clever match
    expect(parseInitialNamedMember('?sh-dlq=STUCK', 'sh-dlq', [...SH_DLQ_FILTERS], 'all')).toBe('all');
    // a wrong case is an unknown word too (the payment word's voice)
    expect(parseInitialNamedMember('?sh-dlq=pending', 'sh-dlq', [...SH_DLQ_FILTERS], 'all')).toBe('all');
    expect(parseInitialNamedMember('?sh-dlq=Pending', 'sh-dlq', [...SH_DLQ_FILTERS], 'all')).toBe('all');
    // the address's silence answers silence — never a stranded filter
    expect(parseInitialNamedMember('?tab=system-health', 'sh-dlq', [...SH_DLQ_FILTERS], 'all')).toBe('all');
    // a foreign desk's prefix never answers (the desk-prefix law)
    expect(parseInitialNamedMember('?bank-type=PENDING', 'sh-dlq', [...SH_DLQ_FILTERS], 'all')).toBe('all');
  });

  it('THE LANDING IS READ ONCE ON THE SHELL — a dismissed chip can never resurrect', () => {
    // a plain useState initializer (the shell tolerates the
    // default-first render — the v2.484 lesson's own exception: a
    // shell tab reads on the shell)
    expect(desk.includes('const [landedDlq] = useState<string>(initialDlqFilter);')).toBe(true);
    expect(desk.includes('const [dlqFilterLandingLive, setDlqFilterLandingLive] = useState(true);')).toBe(true);
    expect(desk.includes('const [dlqFilter, setDlqFilter] = useState<string>(initialDlqFilter);')).toBe(true);
    // the reader guards the server (the address's silence answers
    // silence — never a stranded filter)
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
  });

  it('THE LENS WRITES BACK — every turned member rides its bytes', () => {
    expect(desk.includes('function writeShDlqWord(filter: string): void {')).toBe(true);
    expect(desk.includes("if (filter === 'all') params.delete('sh-dlq');")).toBe(true);
    expect(desk.includes("else params.set('sh-dlq', filter);")).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', window.location.pathname + (qs ? `?${qs}` : \'\'));')).toBe(true);
    // a blocked write is the lens's silence, never a thrown desk
    expect(desk.includes('// The address never lies louder than the lens')).toBe(true);
  });

  it('THE ONE DOOR — the turn and the retire ride together (a fact ride, never a gate)', () => {
    expect(desk.includes('const chooseDlqFilter = (filter: string) => {')).toBe(true);
    expect(desk.includes('setDlqFilter(filter);')).toBe(true);
    expect(desk.includes('writeShDlqWord(filter);')).toBe(true);
    // the toggle's presses all speak the one door
    expect(desk.includes('onClick={() => chooseDlqFilter(filter)}')).toBe(true);
    // the chip's dismissal retires through the same door
    expect(desk.includes('setDlqFilterLandingLive(false); chooseDlqFilter(\'all\')')).toBe(true);
    // THE FAMILY'S ONE READING (v2.488.0 — the dated pin): the guarded
    // door — no turn, no write — and the hand's turn retires the word
    // (the chip speaks the ADDRESS BAR's landing, never the human's
    // next choice).
    expect(desk.includes('if (filter === dlqFilter) return;')).toBe(true);
    expect(desk.includes('if (filter !== landedDlq) setDlqFilterLandingLive(false);')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE SUB-TAB RAISE — the law's third application
// ---------------------------------------------------------------------------

describe('the sub-tab raise — a landing that carries the word raises the pane it lands into', () => {
  it('the Tabs grow controlled (the pane\u2019s seed reads the same landed word)', () => {
    // the banking desk's own amendment (v2.387.0), its third
    // application: the seed reads the landed word — a landing that
    // carries a member opens the desk on the dlq pane, a landing
    // without the word opens the desk's default face
    expect(desk.includes("const [healthTab, setHealthTab] = useState<string>(() => (initialDlqFilter() !== 'all' ? 'dlq' : 'overview'));")).toBe(true);
    expect(desk.includes('<Tabs value={healthTab} onValueChange={setHealthTab} className="space-y-4">')).toBe(true);
    expect(desk.includes('defaultValue="overview"')).toBe(false);
  });

  it('the chip lives in the pane it raises (visible on landing, honest remount after)', () => {
    // the chip sits inside the dlq pane's own card header — beside the
    // lens it names; switching sub-tabs afterwards is the human's own
    // navigation (the chip hides with the pane and returns when it
    // reopens — the same honest remount semantics every desk speaks)
    expect(desk.includes('hue="red"')).toBe(true);
    expect(desk.includes('landed ?sh-dlq=${landedDlq}')).toBe(true);
    expect(desk.includes('data-testid="sh-dlq-landing-word"')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE SEVENTEENTH BYTE — red joins the 300 registry
// ---------------------------------------------------------------------------

describe('the seventeenth byte — red, the health desk\u2019s own alert tone', () => {
  it('the loom\u2019s registry grew the hue and the wardrobe line', () => {
    expect(loom.includes("  'red',")).toBe(true);
    expect(loom.includes("  red: 'border-red-300 bg-red-100 text-red-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20',")).toBe(true);
    // the elder 200 line stays exactly as it was (the etims desk's own)
    expect(loom.includes('border-red-200 bg-red-50 text-red-700')).toBe(true);
  });

  it('the storey line is ENFORCED — red speaks at both its storeys now', () => {
    expect(landingChipSpeaksAt('red', 300)).toBe(true);
    expect(landingChipSpeaksAt('red', 200)).toBe(true);
    // v2.487.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to eighteen (the shift's slate).
    expect(LANDING_CHIP_HUES.length).toBe(18);
    expect(LANDING_CHIP_WARDROBES.red).toContain('hover:bg-red-200');
  });

  it('THE ONCE-ONLY CENSUS — the red 300-trio lives in exactly one src file (the loom)', () => {
    const trio = 'border-red-300 bg-red-100 text-red-700';
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
    expect(desk.includes('bg-red-100 border-red-300 text-red-700')).toBe(true);
    expect(desk.includes('border-red-300 bg-red-100')).toBe(false);
  });

  it('the collision check ran at round start — the byte is the desk\u2019s own', () => {
    // the desk-prefixed word rides NOWHERE else (checked tree-wide at
    // round open — the grep returned nothing before this word landed)
    expect(desk.includes("'sh-dlq'")).toBe(true);
    expect((home.match(/sh-dlq/g) ?? []).length).toBeGreaterThanOrEqual(1);
    // the write half touches ONLY its own word (the DLQ query's
    // `status` wire param is the API's own, never the address's)
    const writeBody = desk.slice(desk.indexOf('function writeShDlqWord'), desk.indexOf('// Main Component'));
    expect((writeBody.match(/params\.set\('[^']+'/g) ?? [])).toEqual(["params.set('sh-dlq'"]);
    expect((writeBody.match(/params\.delete\('[^']+'/g) ?? [])).toEqual(["params.delete('sh-dlq'"]);
  });
});

// ---------------------------------------------------------------------------
// 4. THE GROUND — the styling verse
// ---------------------------------------------------------------------------

describe('the queue gets its own dress — the styling verse', () => {
  it('the active member wears the word\u2019s own hue (the pressed member speaks one voice with its chip)', () => {
    expect(desk.includes("'text-[10px] h-7 px-2 transition-colors bg-red-100 border-red-300 text-red-700 hover:bg-red-200 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300'")).toBe(true);
  });

  it('the six members speak their own handles (the double voice, aria-pressed)', () => {
    expect(desk.includes('data-testid={`sh-dlq-filter-${filter.toLowerCase()}`}')).toBe(true);
    expect(desk.includes('aria-pressed={dlqFilter === filter}')).toBe(true);
    expect(desk.includes("['all', 'PENDING', 'RETRYING', 'DEAD', 'COMPLETED', 'CANCELLED'].map((filter) => (")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE SEATS — the desk's own elder bytes keep their places
// ---------------------------------------------------------------------------

describe('the seats — the round moves the queue\u2019s word, the desk\u2019s elder bytes hold', () => {
  it('the write half preserves the other params (the shell\u2019s tab word composes)', () => {
    expect(desk.includes('const params = new URLSearchParams(window.location.search);')).toBe(true);
    expect(desk.includes('window.location.pathname + (qs ? `?${qs}` : \'\')')).toBe(true);
  });

  it('the breaker\u2019s own scratch stays the desk\u2019s (never the family\u2019s words)', () => {
    expect(desk.includes('const [selectedBreaker, setSelectedBreaker] = useState<string | null>(null);')).toBe(true);
  });

  it('no foreign word rides this desk (the collision-note shadow law)', () => {
    expect(desk.includes("'hr-from'")).toBe(false);
    expect(desk.includes("'rep-range'")).toBe(false);
    expect(desk.includes("'fin-range'")).toBe(false);
    expect(desk.includes("'dead-sort'")).toBe(false);
    expect(desk.includes("'bank-type'")).toBe(false);
  });

  it('the DLQ query still reads the lens (the wire keeps its face)', () => {
    expect(desk.includes("queryKey: ['dlq-items', dlqFilter]")).toBe(true);
    expect(desk.includes("if (dlqFilter !== 'all') params.set('status', dlqFilter);")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. THE CONSTITUTION — the queue joins the vocabulary
// ---------------------------------------------------------------------------

describe('the constitution — forty-four words, twenty-nine desks', () => {
  it('the queue\u2019s row joined (the health desk\u2019s red serves it)', () => {
    expect(registry.includes("{ word: 'sh-dlq', desk: 'src/app/(shell)/tabs/system-health-tab.tsx', family: 'border-red-300', suite: 'src/tests/sh-dlq-address-v2486.test.ts' }")).toBe(true);
    expect(registry.includes('(fifty-two words, thirty-three desks)')).toBe(true);
  });

  it('the stress walks the roll and the derived counts (43 \u2192 44, desks 28 \u2192 29, families 38 \u2192 39 — red-300 joined, no shared family)', () => {
    expect(stress.includes("'sh-dlq',")).toBe(true);
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
    expect(stress.includes('toBe(52)')).toBe(true);
    // v2.487.0 (dated): the living desks-pin rolls — the desks grew
    // to thirty (the FOURTH shell-tab desk); the contains-pin rides
    // the bytes that ARE.
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
    // v2.487.0 (dated): the living family-pin rolls — the families
    // grew to forty (slate-300 joined); the contains-pin rides
    // the bytes that ARE.
    expect(stress.includes('expect(new Set(rows.map((r) => r.family)).size).toBe(40);')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story — the honoured probe and the new word', () => {
    // v2.487.0 THE MUSEUM RE-KEY (the v2470 treatment): the round's own
    // entry is FOUND, not assumed to lead — the feed rides the living
    // head, the museum keeps the round's own word; the guard comes with
    // the find.
    const head = WHATS_NEW.find((e) => e.version === '2.486.0');
    if (!head) throw new Error('the 2.486.0 entry is gone from the feed');
    expect(head.version).toBe('2.486.0');
    expect(head.title).toContain('the ledger\u2019s period rides the address');
    expect(head.title).toContain('the queue\u2019s own word rides the address');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('carry');
    expect(head.title).toContain('the paper speaks the window\u2019s word');
    expect(head.title).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?sh-dlq='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('forty-fourth word'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THE DEFAULT WEARS NO WORD'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('Red joins the 300 registry'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('shade-split law'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('stranger list'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THIRD APPLICATION'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('ONE home'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('unknown word'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.495.0');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.486.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.486.0]')).toBeLessThan(changelog.indexOf('[2.485.0]'));
  });
});
