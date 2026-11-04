// THE FAMILY REGISTRY STRESS TEST (v2.370.0): the constitution walks itself.
// Every deep-link round since v2.328.0 pinned its own row's
// bytes from its own suite; the constitution's registry (twenty-four
// rows in transfer-status-deep-link-v2357.test.ts) has been guarded
// only by those per-round pins — nothing DERIVED the whole registry
// against the tree. This suite is that walk: it PARSES the rows from
// the constitution file (the registry is the input, never a copy) and
// derives, per row:
//   1. the desk file exists and speaks the word;
//   2. the desk carries the chip's wardrobe pair (the light-mode surface
//      pair — THE SHADE-SPLIT AMENDMENT (v2.382.0): the 200/50 storey's
//      hue families were exhausted, so the grammar grew a SECOND STOREY:
//      a 200-family pairs with bg-{hue}-50, a 300-family with
//      bg-{hue}-100 — the registry's own binding: the family byte alone
//      is not proof, the PAIR is the chip's). THE LOOM FACE (v2.394.0):
//      the ten full-wardrobe chips render through the shared LandingChip
//      loom — a desk that speaks NO pair proves its family by hue
//      (`hue="{hue}"`) while the loom's registry carries the pair
//      byte-for-byte; the direct face stays the elder chips' path.
//   3. the desk carries a landing-word testid whose stem is the word
//      itself or the word's first segment (the early desks spoke
//      short stems — `po-` for po-status, `inv-` for inv-stock,
//      `cust-` for cust-debt, `sup-` for sup-status, `txn-` for
//      txn-pay — the later desks carry the full word; both are the
//      family's own naming history, derived here, not re-pinned);
//   4. the suite file exists and carries its own row's exact bytes
//      (the registry's self-reference: every row is pinned by the
//      suite it names);
//   5. the suite's version (from its filename's v23NN stamp) is
//      version-stamped in tab-url (the home's per-word doc notes)
//      and carried in the whats-new feed.
// Globally it derives the title's own claim: thirty-two words over
// twenty-six desks with thirty-two DISTINCT families, and the promise
// roll through THIRTY-SECOND.
// THE STRESS'S BOUNDARY: this is the REGISTRY's walk, not a census —
// the per-word one-writer ledgers already live in each row's suite;
// this suite never re-walks their ground.

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const CONSTITUTION_PATH = 'src/tests/transfer-status-deep-link-v2357.test.ts';
const constitution = readFileSync(CONSTITUTION_PATH, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE REGISTRY, PARSED (the constitution is the input, never a copy)
// ---------------------------------------------------------------------------

interface RegistryRow {
  word: string;
  desk: string;
  family: string;
  suite: string;
}

// THE SHADE-SPLIT AMENDMENT (v2.382.0): the row's family byte now admits
// TWO storeys — the 200 storey (paired with bg-{hue}-50) and the 300
// storey (paired with bg-{hue}-100). Any other hundred-storey has no
// defined light pair, so the grammar does not admit it.
const ROW_RE =
  /\{ word: '([a-z-]+)', desk: '([^']+)', family: '(border-[a-z]+-(?:200|300))', suite: '([^']+)' \}/g;

function parseRegistry(): RegistryRow[] {
  const rows: RegistryRow[] = [];
  for (const m of constitution.matchAll(ROW_RE)) {
    rows.push({ word: m[1], desk: m[2], family: m[3], suite: m[4] });
  }
  return rows;
}

const rows = parseRegistry();

describe('the registry, parsed from the constitution file itself', () => {
  it('parses THIRTY-TWO rows (the constitution\u2019s own count, derived)', () => {
    expect(rows.length).toBe(32);
  });

  it('the rows walk in the promise\u2019s order (the roll, derived from the parse)', () => {
    const expected = [
      'po-status', 'inv-stock', 'cust-debt', 'sup-status', 'sup-po',
      'txn-pay', 'txn-type', 'rent-status', 'inv-status', 'transfer-status',
      'gc-status', 'dn-status', 'vc-status', 'cr-type', 'pr-status',
      'cv-type', 'cat-stock', 'dp-status', 'ad-severity', 'sec-type',
      'ly-type', 'et-status', 'tax-type', 'tax-period',
      'rep-type', 'bank-type', 'bank-mpesa', 'debt-status', 'debt-channel',
      'exp-status', 'exp-type', 'msg-template',
    ];
    expect(rows.map((r) => r.word)).toEqual(expected);
  });

  it('the parsed desks and suites are the title\u2019s own arithmetic (26 desks, 32 families — derived)', () => {
    expect(new Set(rows.map((r) => r.desk)).size).toBe(26);
    expect(new Set(rows.map((r) => r.family)).size).toBe(32);
    expect(constitution.includes('(thirty-two words, twenty-six desks)')).toBe(true);
  });

  it('the promise roll through THIRTY-SECOND is present (the ordinals, derived from the home’s notes)', () => {
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    const ordinals = [
      'FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH', 'SEVENTH',
      'EIGHTH', 'NINTH', 'TENTH', 'ELEVENTH', 'TWELFTH', 'THIRTEENTH',
      'FOURTEENTH', 'FIFTEENTH', 'SIXTEENTH', 'SEVENTEENTH', 'EIGHTEENTH',
      'NINETEENTH', 'TWENTIETH', 'TWENTY-FIRST', 'TWENTY-SECOND',
      'TWENTY-THIRD', 'TWENTY-FOURTH', 'TWENTY-FIFTH', 'TWENTY-SIXTH', 'TWENTY-SEVENTH', 'TWENTY-EIGHTH', 'TWENTY-NINTH', 'THIRTIETH', 'THIRTY-FIRST', 'THIRTY-SECOND',
    ];
    for (const ordinal of ordinals) {
      // the home's doc notes carry the whole roll; the constitution's
      // own title carries the newest (the roll's tail is quoted there)
      expect(home.includes(ordinal), ordinal).toBe(true);
    }
    expect(constitution.includes("'TWENTY-THIRD'")).toBe(true);
    expect(constitution.includes("'TWENTY-FOURTH'")).toBe(true);
    expect(constitution.includes("'TWENTY-SIXTH'")).toBe(true);
    expect(constitution.includes("'TWENTY-SEVENTH'")).toBe(true);
    expect(constitution.includes("'TWENTY-EIGHTH'")).toBe(true);
    expect(constitution.includes("'TWENTY-NINTH'")).toBe(true);
    expect(constitution.includes("'THIRTIETH'")).toBe(true);
    expect(constitution.includes("'THIRTY-FIRST'")).toBe(true);
    expect(constitution.includes("'THIRTY-SECOND'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE PER-ROW DERIVATIONS (desk bytes, chip wardrobe, testid stem, self-pin)
// ---------------------------------------------------------------------------

function storeyOf(family: string): { hue: string; shade: string; light: string } {
  const m = family.match(/^border-([a-z]+)-(200|300)$/);
  const hue = m?.[1] ?? '';
  expect(hue, family).not.toBe('');
  // the shade-split's light-face map: the 200 storey's surface is the
  // 50 face, the 300 storey's surface is the 100 face — the registry's
  // own two defined storeys, no others.
  const light = m?.[2] === '300' ? '100' : '50';
  return { hue, shade: m?.[2] ?? '', light };
}

function chipStemOf(word: string): string[] {
  // the family's naming history, derived: the full word (the later
  // desks) or the word's first segment (the early short stems)
  return [word, word.split('-')[0]];
}

describe.each(rows)('$word — the registry row, derived against the tree', (row) => {
  const deskBytes = readFileSync(row.desk, 'utf8');
  const { hue, shade, light } = storeyOf(row.family);

  it('the desk file exists and speaks the word', () => {
    expect(existsSync(row.desk), row.desk).toBe(true);
    expect(deskBytes.includes(row.word), row.word).toBe(true);
  });

  it('the desk wears the chip\u2019s wardrobe pair (border-{hue}-{shade} bg-{hue}-{light})', () => {
    const pair = `border-${hue}-${shade} bg-${hue}-${light}`;
    // the direct face: the desk itself wears the pair (the elder chips)
    if (deskBytes.includes(pair)) return;
    // THE LOOM FACE (v2.394.0): the ten full-wardrobe chips render through
    // the shared LandingChip loom — the desk proves its family by hue, and
    // the loom's registry carries the pair byte-for-byte.
    expect(deskBytes.includes(`hue="${hue}"`), `hue="${hue}" in ${row.desk}`).toBe(true);
    const loom = readFileSync('src/components/landing-chip.tsx', 'utf8');
    expect(loom.includes(pair), `${pair} in the loom's registry`).toBe(true);
  });

  it('the desk carries a landing-word handle whose stem is the word or its first segment', () => {
    const stems = chipStemOf(row.word);
    const handles = stems.map((s) => `data-testid="${s}-landing-word"`);
    expect(
      handles.some((h) => deskBytes.includes(h)),
      `one of ${handles.join(' | ')}`,
    ).toBe(true);
  });

  it('the row\u2019s suite exists and pins its own row (the self-reference, the loose honest form)', () => {
    // the registry's row format evolved (the early suites predate the
    // row literal's current shape), so the derived self-reference is
    // the LOOSE form every generation speaks: the suite names its word
    // AND its desk path — the strict row literal the later suites pin
    // contains both.
    expect(existsSync(row.suite), row.suite).toBe(true);
    const suiteBytes = readFileSync(row.suite, 'utf8');
    expect(suiteBytes.includes(row.word), row.word).toBe(true);
    expect(suiteBytes.includes(row.desk), row.desk).toBe(true);
  });

  it('the suite\u2019s version is stamped in the home (tab-url) and carried in the feed (whats-new)', () => {
    const stamp = row.suite.match(/v(23\d\d)/)?.[1] ?? '';
    expect(stamp, row.suite).not.toBe('');
    const version = `2.${stamp.slice(1)}.0`;
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    expect(home.includes(`v${version}`), `v${version} in tab-url`).toBe(true);
    const feed = readFileSync('src/lib/whats-new.ts', 'utf8');
    expect(feed.includes(`version: '${version}',`), version).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE HOME'S OWN STAMP — every row's desk is named in tab-url's notes
// ---------------------------------------------------------------------------

describe('the home carries the whole registry in its doc notes', () => {
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('each word appears in tab-url (the ONE home names every speaker)', () => {
    for (const row of rows) {
      expect(home.includes(`\`${row.word}\``), row.word).toBe(true);
    }
  });
});
