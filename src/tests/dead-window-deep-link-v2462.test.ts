// THE DEAD WINDOW'S OWN WORD (v2.462.0): the reports desk's ninth report
// answers the address bar with its lens — the family's THIRTY-THIRD
// wearing. `?dead-window=30|60|90` lands the Dead Stock report's idle
// window pre-turned to the shared word — the desk's daily question
// ("how far back does resting begin?") becomes a bookmark, and a turned
// lens writes itself back so the next share carries the same truth.
//
// v2.384.0 gave the reports desk its SHAPE word (`?rep-type=`), and the
// ninth report's window is the family's first lens that lives INSIDE a
// shape: the chip wears the ROSE byte at 300/100 — the shade-split law's
// next form — because the TWO-STOREY CENSUS WAS FULL: every hue in the
// loom's registry had spoken at both storeys, so the family grew one
// line (rose joins LANDING_CHIP_HUES) rather than masquerade. Rose last
// spoke at the 200/50 storey (the customers desk's word); a hue may
// speak twice only through a DIFFERENT storey — a family byte the
// 200-storey can never equal. The word's voice is the WINDOW TUPLE'S OWN
// spellings (DEAD_STOCK_WINDOWS, the ONE home in the classifier, read as
// words through the generic parser) and the DEFAULT WEARS NO CHIP: a
// landing of ?dead-window=90 speaks the shape the bare landing already
// answers (the rep-type law's own reading). The chip lives in the
// SECTION (the lens is inside the dead_stock stage — the banking desk's
// sub-tab law's shape: it hides with the pane and returns when the pane
// reopens), and only a hand-driven WINDOW turn retires it — a
// hand-driven REPORT change is navigation, never a lens change. THE
// LENS WRITES BACK: a hand-driven turn replaceState's the word into the
// address (the transactions desk's own write shape), so a turned lens
// is a shareable address, never a dead end.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';
import { DEAD_STOCK_WINDOWS } from '@/lib/reports/dead-stock';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/reports-tab.tsx';
const LOOM = 'src/components/landing-chip.tsx';
const CONSTITUTION = 'src/tests/transfer-status-deep-link-v2357.test.ts';
const STRESS = 'src/tests/family-registry-stress-v2370.test.ts';

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, the window tuple's words)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — ?dead-window= speaks the window tuple\u2019s own words', () => {
  const WORDS = DEAD_STOCK_WINDOWS.map(String);

  it('the bridge is honest: the words ARE the tuple (the ONE home, derived)', () => {
    expect(DEAD_STOCK_WINDOWS).toEqual([30, 60, 90]);
    expect(WORDS).toEqual(['30', '60', '90']);
  });

  it('every member of the tuple answers itself (case-sensitive by the parser\u2019s own law)', () => {
    for (const member of WORDS) {
      expect(parseInitialNamedMember(`?tab=reports&dead-window=${member}`, 'dead-window', WORDS, '90')).toBe(member);
    }
  });

  it('a made-up window is an unknown word, not a clever match — the fallback answers', () => {
    expect(parseInitialNamedMember('?tab=reports&dead-window=45', 'dead-window', WORDS, '90')).toBe('90');
    expect(parseInitialNamedMember('?tab=reports&dead-window=030', 'dead-window', WORDS, '90')).toBe('90');
    expect(parseInitialNamedMember('?tab=reports&dead-window=thirty', 'dead-window', WORDS, '90')).toBe('90');
    expect(parseInitialNamedMember('?tab=reports&dead-window=30 ', 'dead-window', WORDS, '90')).toBe('90');
    expect(parseInitialNamedMember('?tab=reports&dead-window=DEAD', 'dead-window', WORDS, '90')).toBe('90');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'dead-window', WORDS, '90')).toBe('90');
    expect(parseInitialNamedMember('?tab=reports', 'dead-window', WORDS, '90')).toBe('90');
    expect(parseInitialNamedMember('?tab=reports&dead-window=', 'dead-window', WORDS, '90')).toBe('90');
    expect(parseInitialNamedMember('dead-window=60', 'dead-window', WORDS, '90')).toBe('60');
    expect(parseInitialNamedMember('?????', 'dead-window', WORDS, '90')).toBe('90');
  });

  it('the word rides BESIDE the desk\u2019s shape word without stealing it', () => {
    expect(
      parseInitialNamedMember('?tab=reports&rep-type=dead_stock&dead-window=30', 'dead-window', WORDS, '90')
    ).toBe('30');
    expect(
      parseInitialNamedMember('?tab=reports&rep-type=dead_stock&dead-window=60', 'dead-window', WORDS, '90')
    ).toBe('60');
    // the shape word is untouched by the lens word's presence
    expect(
      parseInitialNamedMember('?tab=reports&rep-type=dead_stock&dead-window=30', 'rep-type', ['sales', 'dead_stock'] as const, 'sales')
    ).toBe('dead_stock');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — the write-once door, the bridge, the lens's own word
// ---------------------------------------------------------------------------

describe('the reports desk — ?dead-window= lands as visible state', () => {
  const desk = readFileSync(DESK, 'utf8');

  it('the seed reads the word through the generic parser and the tuple\u2019s ONE home', () => {
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'dead-window', DEAD_STOCK_WINDOWS.map(String), '90')")
    ).toBe(true);
    expect(desk.includes("from '@/lib/reports/dead-stock'")).toBe(true);
  });

  it('the seed is the write-once initializer of the landing (the read-once law)', () => {
    expect(desk.includes('function initialDeadWindow(): 30 | 60 | 90 {')).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 90;")).toBe(true);
    expect(desk.includes('const [landedDeadWindow] = useState<30 | 60 | 90>(initialDeadWindow);')).toBe(true);
    expect(desk.includes('const [deadWindowLandingLive, setDeadWindowLandingLive] = useState(true);')).toBe(true);
  });

  it('the bridge is the dated cast — string words to a number lens, riding only the membership-verified word', () => {
    // the windows are NUMBERS in the ONE home (the route validates
    // numbers); the parser speaks words. The bridge is two lines, dated,
    // and the cast rides a word the parser has already narrowed to the
    // tuple — never a guess.
    expect(desk.includes('const word = parseInitialNamedMember(window.location.search, \'dead-window\', DEAD_STOCK_WINDOWS.map(String), \'90\');')).toBe(true);
    expect(desk.includes('return Number(word) as 30 | 60 | 90;')).toBe(true);
  });

  it('the lens state is declared beside its door (the closure reads a met binding)', () => {
    expect(desk.includes('const [deadStockDays, setDeadStockDays] = useState<30 | 60 | 90>(initialDeadWindow);')).toBe(true);
    expect(desk.indexOf('const [deadStockDays, setDeadStockDays]')).toBeLessThan(desk.indexOf('const chooseDeadWindow = useCallback'));
  });

  it('THE DOOR — every turn rides one callback: retire on a real move, write the word back, the updater stays pure', () => {
    expect(desk.includes('const chooseDeadWindow = useCallback((value: 30 | 60 | 90) => {')).toBe(true);
    expect(desk.includes('setDeadWindowLandingLive(false);')).toBe(true);
    expect(desk.includes('writeDeadWindowWord(value);')).toBe(true);
    // the React law: the updater is pure — the retire and the write live
    // OUTSIDE the setState (StrictMode double-invokes updaters)
    expect(desk.includes('setDeadStockDays((prev) =>')).toBe(false);
    // agreement is no news: the same word pressed again neither retires
    // nor writes
    expect(desk.includes('if (deadStockDays === value) {')).toBe(true);
  });

  it('NAVIGATION IS NOT A LENS CHANGE — the shape door never retires the window chip', () => {
    const chooseShape = desk.slice(desk.indexOf('const chooseReportType = useCallback'), desk.indexOf('const chooseDeadWindow = useCallback'));
    expect(chooseShape).not.toBe('');
    expect(chooseShape.includes('setDeadWindowLandingLive')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. THE WRITE HALF — the lens's own replaceState, the preserve law
// ---------------------------------------------------------------------------

describe('the write half — a turned lens is a shareable address', () => {
  const desk = readFileSync(DESK, 'utf8');

  it('the word is SET, the other params ride untouched (the preserve law)', () => {
    expect(desk.includes("params.set('dead-window', String(days));")).toBe(true);
    expect(desk.includes('new URLSearchParams(window.location.search)')).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', window.location.pathname + (qs ? `?${qs}` : \'\'));')).toBe(true);
  });

  it('the write is guarded and honest — a blocked write is the lens\u2019s silence, never a thrown desk', () => {
    expect(desk.includes('if (typeof window === \'undefined\') return;')).toBe(true);
    const writeHalf = desk.slice(desk.indexOf('function writeDeadWindowWord'), desk.indexOf('interface GrowingProduct'));
    expect(writeHalf).not.toBe('');
    expect(writeHalf.includes('try {')).toBe(true);
    expect(writeHalf.includes('} catch {')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE LANDING CHIP — the rose byte, the default's silence, the section's face
// ---------------------------------------------------------------------------

describe('the landing chip — the family\u2019s eleventh 300-storey byte', () => {
  const desk = readFileSync(DESK, 'utf8');
  const loom = readFileSync(LOOM, 'utf8');

  it('rose joins the 300 registry — one line, the single-line law', () => {
    expect(loom.includes("'rose',")).toBe(true);
    expect(loom.includes("rose: 'border-rose-300 bg-rose-100 text-rose-700")).toBe(true);
    // the shade-split law's dated note: rose spoke at the 200 storey
    expect(loom.includes('v2.462.0: rose joins the 300 storey')).toBe(true);
    expect(loom.includes('DIFFERENT storey')).toBe(true);
  });

  it('the chip lives in the SECTION (the lens is inside the dead_stock stage)', () => {
    expect(desk.includes('data-testid="dead-window-landing-word"')).toBe(true);
    expect(desk.includes('hue="rose"')).toBe(true);
    expect(desk.includes('label={`landed ?dead-window=${landedDeadWindow}`}')).toBe(true);
    expect(desk.includes('title="The idle window landed with this word from the address bar — press to clear it"')).toBe(true);
  });

  it('THE DEFAULT WEARS NO CHIP — a landing of the default word speaks no landing', () => {
    expect(desk.includes('deadWindowLandingLive && landedDeadWindow !== 90 && (')).toBe(true);
  });

  it('the dismissal is the desk\u2019s own write (the chip retires, never resurrects)', () => {
    expect(desk.includes('onDismissDeadWindowLanding={() => setDeadWindowLandingLive(false)}')).toBe(true);
    expect(desk.includes('onDismiss={onDismissDeadWindowLanding}')).toBe(true);
  });

  it('the loom stays word-free — rose\u2019s line speaks no lens word', () => {
    expect(loom.includes('dead-window')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. THE CONSTITUTION — the thirty-third row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the thirty-third row (cross-suite pins)', () => {
  const constitution = readFileSync(CONSTITUTION, 'utf8');
  const stress = readFileSync(STRESS, 'utf8');

  it('the constitution walks the row (the rose byte, the census-full growth)', () => {
    // v2.480.0 (dated): the constitution grew its thirty-fourth row (the
    // lens's own word rides the address) — the title's count rolls with
    // it; the rose row keeps its exact bytes.
    expect(constitution.includes("(thirty-four words, twenty-six desks)")).toBe(true);
    expect(constitution.includes("{ word: 'dead-window', desk: 'src/app/(shell)/tabs/reports-tab.tsx', family: 'border-rose-300', suite: 'src/tests/dead-window-deep-link-v2462.test.ts' }")).toBe(true);
  });

  it('the stress walk grew with the registry (34 rows, the stamp\u2019s second storey)', () => {
    expect(stress.includes('toBe(34)')).toBe(true);
    expect(stress.includes("'dead-window',")).toBe(true);
    // the version stamp reads the v24NN generation too (the suite's own
    // stamp — v2462 — is the stress's first second-generation row)
    expect(stress.includes('v(2[34]\\d\\d)')).toBe(true);
  });

  it('the loom\u2019s word-free law grew with the registry (34 words, none spoken)', () => {
    const loomSuite = readFileSync('src/tests/landing-chip-loom-v2394.test.ts', 'utf8');
    // v2.480.0 (dated): the thirty-fourth word — the count's roll grew
    // with the constitution (33 → 34).
    expect(loomSuite.includes('toBe(34)')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. THE COLLISION LEDGER — which files may speak the word at all
// ---------------------------------------------------------------------------

function walkSrc(dir: string, collected: string[]): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      walkSrc(p, collected);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      if (readFileSync(p, 'utf8').includes('dead-window')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`dead-window` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/reports-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the walk's own history line — admitted (the cascade's
      // seventy-third generation speaks the new lens word by name —
      // the story of the word names the word)
      'src/tests/console-changelog.test.ts',
      // this suite (the word's own ledger — an honest speaker)
      'src/tests/dead-window-deep-link-v2462.test.ts',
      // the registry walk's derived roll — admitted (the stress's
      // expected order names the thirty-third word)
      'src/tests/family-registry-stress-v2370.test.ts',
      // the constitution (the vocabulary's registry — the thirty-third
      // row)
      'src/tests/transfer-status-deep-link-v2357.test.ts',
    ]);
  });
});

// ---------------------------------------------------------------------------
// 7. THE WHAT'S NEW FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — v2.480.0 leads the feed', () => {
  it('the entry exists, first, with the round\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.480.0');
    // the lead's story hand-over (v2.480.0, the Task 111 law's
    // eighty-sixth application): the head story is the hand-over's
    // voice — the carrying round: THE LENS'S WORD RIDES THE
    // ADDRESS — the dead-stock search lens answers the address
    // bar (the maker's own word rides ?dead-q into the URL, read as
    // typed — trimmed and capped, never case-gamed, the ONE
    // home's filter lowercases its own side; the landing read once
    // on the shell, a dismissed chip can never resurrect; every
    // hand-driven lens change replaceState's its word back — a
    // pressed lens is a shareable address, never a dead end — and
    // an emptied lens strips its key, the address never carries a
    // silence), the landed word wearing the amber landing chip
    // beside the window's own — amber joins the 300 registry (the
    // shade-split law's next form, the lens family's own tone, the
    // constitution's thirty-fourth word); and the patience draws its
    // own bar (the Days idle cell wears the capital bar's own
    // dialect — the muted track, the fill in the number's own
    // word: amber below half a year, rose past it — the
    // never-sold row's cell keeping quiet, its badge already
    // speaks); the census keeps its ten voices (a chip and a bar
    // never carry a handle's voice), and the desk never spells the
    // host's word.
    // The lens's word rides the address.
    expect(head.title).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('pre-addressed'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('chat picker'))).toBe(true);
  });
});
