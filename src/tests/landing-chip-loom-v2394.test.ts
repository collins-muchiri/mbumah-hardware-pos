// THE LANDING CHIP LOOM SUITE (v2.394.0): the ten full-wardrobe chips share
// one component. Every deep-link round since v2.382.0 hand-rolled the same
// button — byte-identical but for the hue — and by v2.393.0 the family had
// ten copies across nine desks. This round looms them: ONE component
// (src/components/landing-chip.tsx), ONE wardrobe registry (ten hues, one
// greppable string each), ONE anatomy (Link2 + tabular-nums + X, the
// group-hover dismiss detail, the focus ring, the 500/10 dark face). The
// desks keep their own words, handles, labels, tooltips and dismissal
// writes ride props; the loom never learns which desk is speaking.
//
// THE WORD-FREE LAW: the loom speaks NO lens word — no collision ledger
// ever has to admit the component file. This suite derives the 32-word
// vocabulary from the constitution itself and proves the loom silent.
//
// THE BYTE-FIDELITY LAW: composing the shared head with a registry entry
// must reproduce the EXACT historic className that desk wore before the
// loom — the ten historic strings are pinned here, independent copies.
//
// THE MASQUERADE LAW, LOOM FORM: a loomed desk speaks NO wardrobe byte —
// each of the ten `border-{hue}-300 bg-{hue}-100` trios lives in exactly
// ONE src file (the loom), and the desk proves its family by hue.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const LOOM_PATH = 'src/components/landing-chip.tsx';
const CONSTITUTION_PATH = 'src/tests/transfer-status-deep-link-v2357.test.ts';
const CHIP_HEAD = 'group inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border ';

const loom = readFileSync(LOOM_PATH, 'utf8');
const constitution = readFileSync(CONSTITUTION_PATH, 'utf8');

// the constitution's own row regex (the stress's parse — the vocabulary
// is the input, never a copy)
const ROW_RE =
  /\{ word: '([a-z-]+)', desk: '([^']+)', family: '(border-[a-z]+-(?:200|300))', suite: '([^']+)' \}/g;
const rows = [...constitution.matchAll(ROW_RE)].map((m) => ({
  word: m[1], desk: m[2], family: m[3], suite: m[4],
}));

// THE TEN — the full-wardrobe family, the loom's own registry keys, each
// the byte-fidelity law's independent copies; HEAD-anchored single-line
// registry entries so a grep for `{hue}: 'border-{hue}-300` finds the
// whole wardrobe.
const THE_TEN = [
  {
    word: 'bank-type', desk: 'src/app/(shell)/tabs/banking-tab.tsx', hue: 'sky',
    testid: 'bank-type-landing-word', labelVar: 'landedBankType',
    dismissBytes: ['setTxFilterType(\'all\');', 'setBankLandingLive(false);'],
    historic: 'border-sky-300 bg-sky-100 text-sky-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20',
  },
  {
    word: 'bank-mpesa', desk: 'src/app/(shell)/tabs/banking-tab.tsx', hue: 'purple',
    testid: 'bank-mpesa-landing-word', labelVar: 'landedMpesaStatus',
    dismissBytes: ['setMpesaFilterStatus(\'all\');', 'setMpesaLandingLive(false);'],
    historic: 'border-purple-300 bg-purple-100 text-purple-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-purple-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20',
  },
  {
    word: 'debt-status', desk: 'src/app/(shell)/tabs/debt-management-tab.tsx', hue: 'cyan',
    testid: 'debt-status-landing-word', labelVar: 'landedDebtStatus',
    dismissBytes: ['setStatusFilter(\'all\');', 'setDebtLandingLive(false);', 'setPage(1);'],
    historic: 'border-cyan-300 bg-cyan-100 text-cyan-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20',
  },
  {
    word: 'debt-channel', desk: 'src/app/(shell)/tabs/debt-management-tab.tsx', hue: 'fuchsia',
    testid: 'debt-channel-landing-word', labelVar: 'landedDebtChannel',
    dismissBytes: ['setTypeFilter(\'all\');', 'setDebtChannelLandingLive(false);', 'setPage(1);'],
    historic: 'border-fuchsia-300 bg-fuchsia-100 text-fuchsia-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-fuchsia-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 dark:hover:bg-fuchsia-500/20',
  },
  {
    word: 'exp-status', desk: 'src/app/(shell)/tabs/data-exports-tab.tsx', hue: 'indigo',
    testid: 'exp-status-landing-word', labelVar: 'landedExpStatus',
    dismissBytes: ['setExpStatusFilter(\'all\');', 'setExpLandingLive(false);'],
    historic: 'border-indigo-300 bg-indigo-100 text-indigo-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20',
  },
  {
    word: 'exp-type', desk: 'src/app/(shell)/tabs/data-exports-tab.tsx', hue: 'pink',
    testid: 'exp-type-landing-word', labelVar: 'landedExpType',
    dismissBytes: ['setExpTypeFilter(\'all\');', 'setExpTypeLandingLive(false);'],
    historic: 'border-pink-300 bg-pink-100 text-pink-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-pink-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300 dark:hover:bg-pink-500/20',
  },
  {
    word: 'tax-type', desk: 'src/app/(shell)/tabs/tax-tab.tsx', hue: 'orange',
    testid: 'tax-type-landing-word', labelVar: 'landedTaxType',
    dismissBytes: ['setFilingTypeFilter(\'all\');', 'setTaxLandingLive(false);'],
    historic: 'border-orange-300 bg-orange-100 text-orange-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20',
  },
  {
    word: 'tax-period', desk: 'src/app/(shell)/tabs/tax-tab.tsx', hue: 'teal',
    testid: 'tax-period-landing-word', labelVar: 'landedTaxPeriod',
    dismissBytes: ['setFilingPeriodFilter(\'\');', 'setTaxPeriodLandingLive(false);'],
    historic: 'border-teal-300 bg-teal-100 text-teal-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300 dark:hover:bg-teal-500/20',
  },
  {
    word: 'rep-type', desk: 'src/app/(shell)/tabs/reports-tab.tsx', hue: 'lime',
    testid: 'rep-type-landing-word', labelVar: 'landedRepType',
    dismissBytes: ['setRepLandingLive(false)'],
    historic: 'border-lime-300 bg-lime-100 text-lime-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-lime-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 dark:border-lime-500/30 dark:bg-lime-500/10 dark:text-lime-300 dark:hover:bg-lime-500/20',
  },
  {
    word: 'msg-template', desk: 'src/app/(shell)/tabs/messaging-tab.tsx', hue: 'yellow',
    testid: 'msg-template-landing-word', labelVar: 'landedMsgTemplate',
    dismissBytes: ['setMsgTemplateFilter(\'all\');', 'setMsgTemplateLandingLive(false);'],
    historic: 'border-yellow-300 bg-yellow-100 text-yellow-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300 dark:hover:bg-yellow-500/20',
  },
];

// ---------------------------------------------------------------------------
// 1. THE LOOM EXISTS AND STAYS WORD-FREE
// ---------------------------------------------------------------------------

describe('the loom — one component, ten hues, zero words', () => {
  it('the loom file exists, is a client component, exports the registry', () => {
    expect(loom.includes("'use client';")).toBe(true);
    expect(loom.includes('export const LANDING_CHIP_HUES')).toBe(true);
    expect(loom.includes('export const LANDING_CHIP_WARDROBES')).toBe(true);
    expect(loom.includes('export function LandingChip')).toBe(true);
    expect(loom.includes("from 'lucide-react'")).toBe(true);
  });

  it('THE WORD-FREE LAW — the loom speaks none of the constitution\u2019s 32 words', () => {
    expect(rows.length).toBe(32);
    for (const row of rows) {
      expect(loom.includes(row.word), row.word).toBe(false);
    }
  });

  it('the registry keys are exactly the ten hues (the 300 storey, ten families)', () => {
    for (const t of THE_TEN) {
      expect(loom.includes(`  ${t.hue}: `), t.hue).toBe(true);
    }
    // ten registry entries: each hue string opens exactly one entry line
    for (const t of THE_TEN) {
      const re = new RegExp(`^  ${t.hue}: 'border-${t.hue}-300`, 'm');
      expect(re.test(loom), t.hue).toBe(true);
    }
  });

  it('the shared head composes with each registry entry into the EXACT historic bytes', () => {
    for (const t of THE_TEN) {
      const m = loom.match(new RegExp(`^  ${t.hue}: '([^']+)',?$`, 'm'));
      if (!m) throw new Error(`no registry entry for ${t.hue}`);
      // the registry entry IS the historic tail — byte for byte
      expect(m[1], `${t.hue}'s wardrobe composes byte-for-byte`).toBe(t.historic);
      expect(CHIP_HEAD + m[1], t.hue).toBe(CHIP_HEAD + t.historic);
    }
  });

  it('the loom\u2019s hand carries the shared anatomy (Link2, tabular-nums, the group-hover X)', () => {
    expect(loom.includes('<Link2 className="h-3 w-3 shrink-0" aria-hidden="true" />')).toBe(true);
    expect(loom.includes('<span className="tabular-nums">{label}</span>')).toBe(true);
    expect(loom.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
    expect(loom.includes('type="button"')).toBe(true);
    expect(loom.includes('onClick={onDismiss}')).toBe(true);
    expect(loom.includes('title={title}')).toBe(true);
    expect(loom.includes('{...rest}')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE TEN DESKS — hue by name, handle by spread, wardrobe NEVER
// ---------------------------------------------------------------------------

describe.each(THE_TEN)('$word — the loomed desk, derived against the tree', (t) => {
  const desk = readFileSync(t.desk, 'utf8');

  it('the desk imports the loom and passes its hue by name', () => {
    expect(desk.includes("import { LandingChip } from '@/components/landing-chip';")).toBe(true);
    expect(desk.includes(`hue="${t.hue}"`), t.hue).toBe(true);
  });

  it('the desk keeps its handle, label and tooltip (the props speak the word)', () => {
    expect(desk.includes(`data-testid="${t.testid}"`), t.testid).toBe(true);
    expect(desk.includes('landed ?' + t.word + '=${' + t.labelVar + '}'), t.word).toBe(true);
    expect(desk.includes('press to clear it'), t.word).toBe(true);
  });

  it('the desk keeps its own dismissal writes (the loom calls, the desk owns)', () => {
    const chipAt = desk.indexOf(`hue="${t.hue}"`);
    expect(chipAt, t.hue).toBeGreaterThan(-1);
    const window = desk.slice(chipAt, chipAt + 700);
    for (const b of t.dismissBytes) {
      expect(window.includes(b), b).toBe(true);
    }
  });

  it('THE MASQUERADE LAW, LOOM FORM — the desk speaks no wardrobe byte', () => {
    expect(desk.includes(`border-${t.hue}-300`), t.hue).toBe(false);
    expect(desk.includes(`bg-${t.hue}-100 text-${t.hue}-700`), t.hue).toBe(false);
    expect(desk.includes(`dark:bg-${t.hue}-500/10`), t.hue).toBe(false);
  });

  it('THE ONCE-ONLY CENSUS — the trio lives in exactly one src file (the loom)', () => {
    const trio = `border-${t.hue}-300 bg-${t.hue}-100 text-${t.hue}-700`;
    // the tree walk (rg, the desk-lens suites' own tool)
    let out = '';
    try {
      out = execFileSync('rg', ['-l', '--glob', '*.tsx', trio, 'src/'], { encoding: 'utf8' });
    } catch {
      out = '';
    }
    const files = out.split('\n').filter(Boolean);
    expect(files, trio).toEqual([LOOM_PATH]);
  });
});

// ---------------------------------------------------------------------------
// 3. THE CONSTITUTION HOLDS — the rows never moved, the stress grew a face
// ---------------------------------------------------------------------------

describe('the constitution under the loom', () => {
  it('the 32 rows still parse; 26 desks; 32 distinct families (nothing moved)', () => {
    expect(rows.length).toBe(32);
    expect(new Set(rows.map((r) => r.desk)).size).toBe(26);
    expect(new Set(rows.map((r) => r.family)).size).toBe(32);
  });

  it('the stress grew its LOOM FACE (the derivation admits the hue+registry path)', () => {
    const stress = readFileSync('src/tests/family-registry-stress-v2370.test.ts', 'utf8');
    expect(stress.includes('THE LOOM FACE')).toBe(true);
    expect(stress.includes('hue="${hue}"')).toBe(true);
    expect(stress.includes(LOOM_PATH)).toBe(true);
  });

  it('the ten loomed rows are exactly the ten registry hues (the family set, derived)', () => {
    const loomedFamilies = new Set(
      rows
        .filter((r) => THE_TEN.some((t) => r.desk === t.desk && r.word === t.word))
        .map((r) => r.family),
    );
    expect(loomedFamilies.size).toBe(10);
    for (const t of THE_TEN) {
      expect(loomedFamilies.has(`border-${t.hue}-300`), t.hue).toBe(true);
    }
  });
});
