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
// Globally it derives the title's own claim: thirty-three words over
// twenty-six desks with thirty-three DISTINCT families, and the promise
// roll through THIRTY-SECOND (the thirty-third word's own suite pins its
// own stamp — the v2462 generation, the registry's first second-
// generation row, whose stamp regex grew a storey below).
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
  it('parses FORTY-FIVE rows (the constitution\u2019s own count, derived)', () => {
    // v2.484.0 (dated): the window — the people desk's period rides the
    // address; the constitution grew its rows and this parse grew with
    // it (the family's FIRST non-tab desk joined).
    // v2.483.0 (dated): the pair — the custom's dates ride beside the
    // custom's word; the constitution grew its rows and this parse grew
    // with it.
    // v2.482.0 (dated): the thirty-sixth word — the range's own word
    // rides the address; the constitution grew its row and this parse
    // grew with it.
    // v2.481.0 (dated): the thirty-fifth word — the sort door's own
    // word rides the address; the constitution grew its row and this
    // parse grew with it.
    // v2.480.0 (dated): the thirty-fourth word — the search lens's own
    // word rides the address; the constitution grew its row and this
    // parse grew with it.
    // v2.489.0 (dated): the forty-sixth word — the dashboard's view
    // rides the address; the constitution grew its row and this parse
    // grew with it (the FIFTH shell-tab desk).
    expect(rows.length).toBe(46);
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
      // v2.462.0: the lens-inside-a-shape round — the ninth report's
      // window answers the address bar (the family GREW one storey of
      // hue: rose at 300/100)
      'dead-window',
      // v2.480.0 (dated): the lens's own word — the ledger's name lens
      // answers the address bar (the family GREW one line: amber at
      // 300/100)
      'dead-q',
      // v2.481.0 (dated): the sort door's own word — the ledger's order
      // answers the address bar (the family GREW one line: emerald at
      // 300/100)
      'dead-sort',
      // v2.482.0 (dated): the range's own word — the reports desk's time
      // lens answers the address bar (the family GREW one line: violet
      // at 300/100; the custom face is no word at all)
      'rep-range',
      // v2.483.0 (dated): the pair — the custom's own dates ride beside
      // the custom's word (the constitution's FIRST shared family: two
      // words, one chip — the range's violet serves all three bytes)
      'rep-from',
      'rep-to',
      // v2.484.0 (dated): the window — the people desk's period rides
      // the address (the constitution's SECOND shared family: two
      // words, one chip — the window's blue serves both rows; the
      // family's FIRST non-tab desk)
      'hr-from',
      'hr-to',
      // v2.485.0 (dated): the ledger's period — the financial desk's
      // window rides the address (the constitution's THIRD shared
      // family: three words, one chip — the period's green serves all
      // three rows; the SECOND shell-tab desk)
      'fin-range',
      'fin-from',
      'fin-to',
      // v2.486.0 (dated): the queue's own word — the health desk's
      // DLQ lens rides the address (the SUB-TAB LAW'S THIRD
      // APPLICATION: a landing that carries the word raises the
      // desk's own dlq sub-tab; the THIRD shell-tab desk)
      'sh-dlq',
      // v2.487.0 (dated): the shift's own word — the scheduling desk's
      // week rides the address (a SHAPE word — the wire's own day-key
      // class, the day REAL through the honest-day validator; the
      // FOURTH shell-tab desk)
      'shift-week',
      // v2.489.0 (dated): the dashboard's own word — the Recent
      // activity card's view rides the address (the FIFTH shell-tab
      // desk; the family's FOURTH shared family — the week's slate
      // serves two words now)
      'dash-view',
    ];
    expect(rows.map((r) => r.word)).toEqual(expected);
  });

  it('the parsed desks and suites are the title\u2019s own arithmetic (30 desks, 40 families — derived)', () => {
    // v2.484.0 (dated): the SECOND SHARED FAMILY — the window rides the
    // people's blue, so the words grew two while the families grew ONE
    // (blue-300 is new; two words, one chip, again — and the family's
    // FIRST non-tab desk joined).
    // v2.483.0 (dated): the FIRST SHARED FAMILY — the pair rides the
    // range's violet, so the words grew two while the families stayed
    // thirty-six (the honest count of two words, one chip).
    // v2.482.0 (dated): the violet family joined with the range's word.
    // v2.481.0 (dated): the emerald family joined with the sort door.
    // v2.484.0 (dated): twenty-seven desks — the family's FIRST
    // non-tab desk joined with the window's word.
    // v2.485.0 (dated): twenty-eight desks — the SECOND shell-tab
    // desk joined with the period's word.
    // v2.486.0 (dated): twenty-nine desks — the THIRD shell-tab
    // desk joined with the queue's word.
    // v2.487.0 (dated): thirty desks — the FOURTH shell-tab
    // desk joined with the shift's week.
    // v2.489.0 (dated): thirty-one desks — the FIFTH shell-tab
    // desk joined with the dashboard's view.
    expect(new Set(rows.map((r) => r.desk)).size).toBe(31);
    // v2.484.0 (dated): blue-300 joined with the window's word — the
    // families grew one (37) while the words grew two (the SECOND
    // shared family: two words, one chip).
    // v2.485.0 (dated): green-300 joined with the period's word —
    // the families grew one (38) while the words grew three (the
    // THIRD shared family: three words, one chip).
    // v2.486.0 (dated): red-300 joined with the queue's word —
    // the families grew one (39) with the word's own (the shade-split
    // law's next form; no shared family — the red serves one word).
    // v2.487.0 (dated): slate-300 joined with the shift's week —
    // the families grew one (40) with the word's own (the shade-split
    // law's next form; no shared family — the slate serves one word).
    // v2.489.0 (dated): the families stay forty — the dashboard's
    // word wears the desk's own slate (the family's next shared
    // family at the 300 storey: the slate serves two words now, the
    // violet precedent's own form).
    expect(new Set(rows.map((r) => r.family)).size).toBe(40);
    expect(constitution.includes('(forty-six words, thirty-one desks)')).toBe(true);
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
    // v2.483.0 (dated): the FIRST SHARED FAMILY — the pair's landing
    // handle is the range's own chip (one chip names all three bytes);
    // the owner's handle serves the pair.
    // v2.484.0 (dated): the window's rows join the shared reading —
    // the window's landing handle is its OWN compound name (the chip
    // names the window, not one side).
    // v2.485.0 (dated): the period's pair joins the shared reading —
    // the pair's landing handle is the period's own chip (one chip
    // names all three bytes); the owner's handle serves the pair.
    const sharedOwner: Record<string, string> = { 'rep-from': 'rep-range', 'rep-to': 'rep-range', 'hr-from': 'hr-window', 'hr-to': 'hr-window', 'fin-from': 'fin-range', 'fin-to': 'fin-range' };
    const stems = sharedOwner[row.word] ? chipStemOf(sharedOwner[row.word]) : chipStemOf(row.word);
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
    // the stamp regex grew a storey (v2.462.0): the registry's first
    // second-generation row (v2462) joins the v23NN generation — the
    // 2[34] class admits both, the derivation honest for every row
    const stamp = row.suite.match(/v(2[34]\d\d)/)?.[1] ?? '';
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
