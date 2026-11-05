#!/usr/bin/env node
/**
 * gen-loom-suite-v2397.mjs — generates the v2.397.0 ELDER block for the
 * landing-chip loom suite and splices it into
 * src/tests/landing-chip-loom-v2394.test.ts:
 *   - THE_ELDER const (22 entries: word/desk/hue/variant/testid/labelVar/
 *     dismissBytes/historic tail + the shared-hue census data)
 *   - the two extra head consts
 *   - the 200-registry keys + composition tests
 *   - the elder describe.each (import/storey/hue, handle/label/tooltip,
 *     dismissal window, masquerade, the HONEST census — 15 unique trios
 *     answer once-only, 7 shared badge wardrobes answer loom + pinned
 *     external count)
 *   - the constitution-holds elder-rows test
 * Idempotence guard: refuses to run if THE_ELDER already exists.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SUITE = new URL('../src/tests/landing-chip-loom-v2394.test.ts', import.meta.url).pathname;
const OUT = '/tmp/loom-elder-out.txt';

const raw = readFileSync(OUT, 'utf8');
const j = raw.slice(raw.indexOf('=== SPECS JSON'));
const specs = JSON.parse(j.slice(j.indexOf('[')));
if (specs.length !== 22) { console.error('expected 22 specs, got ' + specs.length); process.exit(1); }

// the shared badge wardrobes: trios that predate the loom and are spoken
// by honest badge/card wearers beside it (post-swap external counts,
// measured 2026-11-05 — the drift alarm)
const SHARED = {
  slate: 1, sky: 3, red: 1, rose: 6, amber: 9, indigo: 2, emerald: 10,
};

const HEADS = {
  compact: 'group inline-flex items-center gap-1 h-6 px-2 rounded-full border ',
  standard: 'group inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border ',
  quiet: 'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border ',
};

const rows = specs.map((s) => {
  // THE WORD MAP: five elder testids stem differently from their
  // constitution words (the short quiet desks' words carry their noun) —
  // the census's own pairing, not a guess
  const WORD_OF_STEM = { cust: 'cust-debt', inv: 'inv-stock', po: 'po-status', sup: 'sup-status', txn: 'txn-pay' };
  const stem = s.testid.replace(/-landing-word$/, '');
  const word = WORD_OF_STEM[stem] ?? stem;
  const head = HEADS[s.variant];
  if (!s.historic.startsWith(head)) {
    console.error(`head mismatch for ${word}: historic does not start with the ${s.variant} head`);
    process.exit(1);
  }
  const tail = s.historic.slice(head.length);
  return {
    word,
    desk: s.desk,
    hue: s.hue,
    variant: s.variant,
    testid: s.testid,
    labelVar: s.labelExpr,
    dismissBytes: s.dismissLines,
    tail,
    sharedWith: SHARED[s.hue] ?? 0,
  };
});

const elderConst = rows.map((r) => {
  const dismiss = r.dismissBytes.map((b) => JSON.stringify(b)).join(', ');
  return `  {
    word: '${r.word}', desk: '${r.desk}', hue: '${r.hue}', variant: '${r.variant}',
    testid: '${r.testid}', labelVar: '${r.labelVar}', sharedWith: ${r.sharedWith},
    dismissBytes: [${dismiss}],
    historic: '${r.tail}',
  },`;
}).join('\n');

const elderBlock = `
// ---------------------------------------------------------------------------
// 2b. THE ELDER TWENTY-TWO (v2.397.0) — the 200/50 storey joins the loom
// ---------------------------------------------------------------------------

// the census's 22 loomable elder faces: three heads (5 compact, 11
// standard, 6 quiet), one parametric 200/50 tail. THE EXCLUDED ONE: the
// loyalty window chip's amber-600/30 + amber-950 face is an off-union
// row and stays hand-rolled in its desk (the exports PAYROLL carry's
// sibling). THE SHARED WARDROBES: seven of the elder hues predate the
// loom and are spoken by honest badge/card wearers beside it — their
// census answers the loom PLUS the pinned external count (the drift
// alarm), never a false once-only.
const THE_ELDER = [
${elderConst}
];

describe('the elder storey — one registry, three heads, zero words', () => {
  it('the 200 registry exists and its keys are exactly the elder hues', () => {
    expect(loom.includes('export const LANDING_CHIP_HUES_200')).toBe(true);
    expect(loom.includes('export const LANDING_CHIP_WARDROBES_200')).toBe(true);
    for (const t of THE_ELDER) {
      const re = new RegExp(\`^  \${t.hue}: 'border-\${t.hue}-200\`, 'm');
      expect(re.test(loom), t.hue).toBe(true);
    }
    // twenty-two entries, one line each (the SINGLE-LINE law)
    const entryLines = loom.split('\\n').filter((l) => /^  [a-z]+: 'border-[a-z]+-200 /.test(l));
    expect(entryLines.length).toBe(22);
  });

  it('each variant head composes with its registry entry into the EXACT historic bytes', () => {
    const HEADS = {
      standard: CHIP_HEAD,
      compact: 'group inline-flex items-center gap-1 h-6 px-2 rounded-full border ',
      quiet: 'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border ',
    };
    for (const t of THE_ELDER) {
      // anchor on the 200 opening — hues shared with the 300 storey have
      // TWO single-line entries and the bare hue anchor would find the wrong one
      const m = loom.match(new RegExp('^  ' + t.hue + ": '(border-" + t.hue + "-200[^']+)',?$", 'm'));
      if (!m) throw new Error(\`no 200 registry entry for \${t.hue}\`);
      expect(m[1], \`\${t.hue}'s 200 wardrobe\`).toBe(t.historic);
      expect(HEADS[t.variant] + m[1], \`\${t.word} composes byte-for-byte\`).toBe(HEADS[t.variant] + t.historic);
    }
  });

  it('the loom\u2019s hand speaks BOTH dismiss details (the group-hover and the quiet face)', () => {
    expect(loom.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
    expect(loom.includes("'h-3 w-3 shrink-0 opacity-60'")).toBe(true);
  });
});

describe.each(THE_ELDER)('$word — the elder loomed desk, derived against the tree', (t) => {
  const desk = readFileSync(t.desk, 'utf8');

  it('the desk imports the loom, passes the elder storey and its hue by name', () => {
    expect(desk.includes("import { LandingChip } from '@/components/landing-chip';")).toBe(true);
    expect(desk.includes('storey={200}'), t.word).toBe(true);
    expect(desk.includes(\`hue="\${t.hue}"\`), t.hue).toBe(true);
    if (t.variant !== 'standard') {
      expect(desk.includes(\`variant="\${t.variant}"\`), t.variant).toBe(true);
    }
  });

  it('the desk keeps its handle, label and tooltip (the props speak the word)', () => {
    expect(desk.includes(\`data-testid="\${t.testid}"\`), t.testid).toBe(true);
    expect(desk.includes('landed ?' + t.word + '=\${' + t.labelVar + '}'), t.word).toBe(true);
    expect(desk.includes('press to clear it'), t.word).toBe(true);
  });

  it('the desk keeps its own dismissal writes (the loom calls, the desk owns)', () => {
    const chipAt = desk.indexOf(\`hue="\${t.hue}"\`);
    expect(chipAt, t.hue).toBeGreaterThan(-1);
    // the elder window is 1100: the v2.372 scrub bodies run deeper than
    // the 300 storey's 700 (the honest window, measured — the two
    // transactions chips' scrubs span ~990)
    const win = desk.slice(chipAt, chipAt + 1100);
    for (const b of t.dismissBytes) {
      expect(win.includes(b), b).toBe(true);
    }
  });

  it('THE MASQUERADE LAW, ELDER FORM — the desk speaks no chip wardrobe', () => {
    // the elder hues predate the masquerade law and honest badge/card
    // wearers speak single bytes beside the chip — the wardrobe (the full
    // light trio + the full dark trio) is the chip's own face, and THAT
    // is what the desk must never speak again
    expect(desk.includes(\`border-\${t.hue}-200 bg-\${t.hue}-50 text-\${t.hue}-700\`), t.hue).toBe(false);
    expect(desk.includes(\`dark:border-\${t.hue}-500/30 dark:bg-\${t.hue}-500/10\`), t.hue).toBe(false);
  });

  it('THE ELDER CENSUS — the trio\u2019s honest face across the tree', () => {
    const trio = \`border-\${t.hue}-200 bg-\${t.hue}-50 text-\${t.hue}-700\`;
    const walk = (dir, acc) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name === 'node_modules' || e.name === '.next' || e.name === '.roundtrip-baseline') continue;
          walk(p, acc);
        } else if (/\\.tsx$/.test(e.name) && acc.length < 4000) {
          acc.push(p);
        }
      }
      return acc;
    };
    const files = walk('src', []).filter((p) => readFileSync(p, 'utf8').includes(trio));
    const rel = files.map((p) => p.replace(/\\\\/g, '/'));
    if (t.sharedWith === 0) {
      expect(rel, trio).toEqual([LOOM_PATH]);
    } else {
      // the shared badge wardrobe: honest wearers beside the loom, the
      // chip's desk retired, the external count pinned (the drift alarm)
      expect(rel, trio).toContain(LOOM_PATH);
      expect(rel, t.desk).not.toContain(t.desk);
      expect(rel.length, trio).toBe(t.sharedWith + 1);
    }
  });
});
`;

let suite = readFileSync(SUITE, 'utf8');
if (suite.includes('THE_ELDER')) { console.error('THE_ELDER already present — refusing'); process.exit(1); }

// 1. the head consts
const headAnchor = "const CHIP_HEAD = 'group inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border ';";
if (!suite.includes(headAnchor)) { console.error('head anchor missing'); process.exit(1); }
suite = suite.replace(
  headAnchor,
  headAnchor +
    "\nconst CHIP_HEAD_COMPACT = 'group inline-flex items-center gap-1 h-6 px-2 rounded-full border ';\nconst CHIP_HEAD_QUIET = 'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border ';"
);

// 2. the elder describe blocks — inserted before section 3
const sec3 = '// ---------------------------------------------------------------------------\n// 3. THE CONSTITUTION HOLDS';
if (!suite.includes(sec3)) { console.error('section 3 anchor missing'); process.exit(1); }
suite = suite.replace(sec3, elderBlock.trimEnd() + '\n\n' + sec3);

// 3. the constitution-holds elder-rows test — appended inside the last describe
const lastAnchor = `  it('the ten loomed rows are exactly the ten registry hues (the family set, derived)', () => {`;
if (!suite.includes(lastAnchor)) { console.error('constitution anchor missing'); process.exit(1); }
suite = suite.replace(lastAnchor, `  it('the 22 elder rows are exactly the 200-storey registry hues (derived)', () => {
    const elderFamilies = rows
      .filter((r) => THE_ELDER.some((t) => r.desk === t.desk && r.word === t.word))
      .map((r) => r.family);
    expect(elderFamilies.length).toBe(22);
    for (const t of THE_ELDER) {
      expect(elderFamilies).toContain(\`border-\${t.hue}-200\`);
    }
  });

` + lastAnchor);

writeFileSync(SUITE, suite);
console.log('loom suite extended: THE_ELDER (22) written');
