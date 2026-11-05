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
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LOOM_PATH = 'src/components/landing-chip.tsx';
const CONSTITUTION_PATH = 'src/tests/transfer-status-deep-link-v2357.test.ts';
const CHIP_HEAD = 'group inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border ';
const CHIP_HEAD_COMPACT = 'group inline-flex items-center gap-1 h-6 px-2 rounded-full border ';
const CHIP_HEAD_QUIET = 'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border ';

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
    // the tree walk (pure node: a recursive readdir, no external tool —
    // the census must answer the same in CI as on the desk)
    const walk = (dir, acc) => {
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
    const rel = files.map((p) => p.replace(/\\/g, '/'));
    expect(rel, trio).toEqual([LOOM_PATH]);
  });
});


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
  {
    word: 'ad-severity', desk: 'src/app/(shell)/tabs/admin-tab.tsx', hue: 'neutral', variant: 'compact',
    testid: 'ad-severity-landing-word', labelVar: 'landedAdSeverity', sharedWith: 0,
    dismissBytes: ["setFilters(f => ({ ...f, severity: 'all' }));", "setAdLandingLive(false);"],
    historic: 'border-neutral-200 bg-neutral-50 text-neutral-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-500/30 dark:bg-neutral-500/10 dark:text-neutral-300 dark:hover:bg-neutral-500/20',
  },
  {
    word: 'cat-stock', desk: 'src/app/(shell)/tabs/catalog-tab.tsx', hue: 'purple', variant: 'compact',
    testid: 'cat-stock-landing-word', labelVar: 'landedCatStock', sharedWith: 0,
    dismissBytes: ["setStockFilter('all');", "setCatLandingLive(false);"],
    historic: 'border-purple-200 bg-purple-50 text-purple-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20',
  },
  {
    word: 'cv-type', desk: 'src/app/(shell)/tabs/conversations-tab.tsx', hue: 'slate', variant: 'compact',
    testid: 'cv-type-landing-word', labelVar: 'landedCvType', sharedWith: 1,
    dismissBytes: ["setTypeFilter('all');", "setCvLandingLive(false);"],
    historic: 'border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300 dark:hover:bg-slate-500/20',
  },
  {
    word: 'dp-status', desk: 'src/app/(shell)/tabs/debt-plans-tab.tsx', hue: 'zinc', variant: 'compact',
    testid: 'dp-status-landing-word', labelVar: 'landedDpStatus', sharedWith: 0,
    dismissBytes: ["setFilter('all');", "setDpLandingLive(false);"],
    historic: 'border-zinc-200 bg-zinc-50 text-zinc-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-500/30 dark:bg-zinc-500/10 dark:text-zinc-300 dark:hover:bg-zinc-500/20',
  },
  {
    word: 'sec-type', desk: 'src/app/(shell)/tabs/security-tab.tsx', hue: 'gray', variant: 'compact',
    testid: 'sec-type-landing-word', labelVar: 'landedSecType', sharedWith: 0,
    dismissBytes: ["setFilterEventType('all');", "setSecLandingLive(false);"],
    historic: 'border-gray-200 bg-gray-50 text-gray-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:border-gray-500/30 dark:bg-gray-500/10 dark:text-gray-300 dark:hover:bg-gray-500/20',
  },
  {
    word: 'cr-type', desk: 'src/app/(shell)/tabs/credits-tab.tsx', hue: 'yellow', variant: 'standard',
    testid: 'cr-type-landing-word', labelVar: 'landedCrType', sharedWith: 0,
    dismissBytes: ["setCreditTypeFilter('all');", "setCrLandingLive(false);"],
    historic: 'border-yellow-200 bg-yellow-50 text-yellow-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-yellow-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300 dark:hover:bg-yellow-500/20',
  },
  {
    word: 'dn-status', desk: 'src/app/(shell)/tabs/delivery-notes-tab.tsx', hue: 'sky', variant: 'standard',
    testid: 'dn-status-landing-word', labelVar: 'landedDnStatus', sharedWith: 3,
    dismissBytes: ["setStatusFilter('all');", "setDnLandingLive(false);"],
    historic: 'border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20',
  },
  {
    word: 'et-status', desk: 'src/app/(shell)/tabs/etims-tab.tsx', hue: 'red', variant: 'standard',
    testid: 'et-status-landing-word', labelVar: 'landedStatus', sharedWith: 1,
    dismissBytes: ["setStatusFilter('all');", "setPage(1);", "onLandRetire();"],
    historic: 'border-red-200 bg-red-50 text-red-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20',
  },
  {
    word: 'gc-status', desk: 'src/app/(shell)/tabs/gift-cards-tab.tsx', hue: 'lime', variant: 'standard',
    testid: 'gc-status-landing-word', labelVar: 'landedGcStatus', sharedWith: 0,
    dismissBytes: ["setStatusFilter('ALL');", "setGcLandingLive(false);"],
    historic: 'border-lime-200 bg-lime-50 text-lime-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-lime-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 dark:border-lime-500/30 dark:bg-lime-500/10 dark:text-lime-300 dark:hover:bg-lime-500/20',
  },
  {
    word: 'inv-status', desk: 'src/app/(shell)/tabs/invoices-tab.tsx', hue: 'teal', variant: 'standard',
    testid: 'inv-status-landing-word', labelVar: 'landedInvStatus', sharedWith: 0,
    dismissBytes: ["setStatusFilter('all');", "setInvLandingLive(false);"],
    historic: 'border-teal-200 bg-teal-50 text-teal-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300 dark:hover:bg-teal-500/20',
  },
  {
    word: 'ly-type', desk: 'src/app/(shell)/tabs/loyalty-tab.tsx', hue: 'green', variant: 'standard',
    testid: 'ly-type-landing-word', labelVar: 'landedLyType', sharedWith: 0,
    dismissBytes: ["setTxTypeFilter('all');", "setLyLandingLive(false);"],
    historic: 'border-green-200 bg-green-50 text-green-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/20',
  },
  {
    word: 'pr-status', desk: 'src/app/(shell)/tabs/payroll-tab.tsx', hue: 'stone', variant: 'standard',
    testid: 'pr-status-landing-word', labelVar: 'landedPrStatus', sharedWith: 0,
    dismissBytes: ["setStatusFilter('ALL');", "setPrLandingLive(false);"],
    historic: 'border-stone-200 bg-stone-50 text-stone-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 dark:border-stone-500/30 dark:bg-stone-500/10 dark:text-stone-300 dark:hover:bg-stone-500/20',
  },
  {
    word: 'rent-status', desk: 'src/app/(shell)/tabs/rentals-tab.tsx', hue: 'orange', variant: 'standard',
    testid: 'rent-status-landing-word', labelVar: 'landedRentStatus', sharedWith: 0,
    dismissBytes: ["setStatusFilter('all');", "setRentLandingLive(false);"],
    historic: 'border-orange-200 bg-orange-50 text-orange-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20',
  },
  {
    word: 'txn-type', desk: 'src/app/(shell)/tabs/transactions-tab.tsx', hue: 'fuchsia', variant: 'standard',
    testid: 'txn-type-landing-word', labelVar: 'landedTxnType', sharedWith: 0,
    dismissBytes: ["setTypeFilter('all');", "setTxnTypeLandingLive(false);", "// v2.372.0 THE CHIP SCRUBS ITS WORD (the loyalty desk's", "// contract, unified): a stale ?txn-type= that outlives", "// the lens it named is a lie the next refresh would", "// resurrect — the dismissal removes it from the address", "// bar, SSR-guarded like every window touch.", "if (typeof window !== 'undefined') {", "const next = buildSearchWithoutParams(window.location.search, ['txn-type']);", "window.history.replaceState(null, '', next ? next : window.location.pathname);", "}"],
    historic: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-fuchsia-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 dark:hover:bg-fuchsia-500/20',
  },
  {
    word: 'transfer-status', desk: 'src/app/(shell)/tabs/transfers-tab.tsx', hue: 'blue', variant: 'standard',
    testid: 'transfer-status-landing-word', labelVar: 'landedTransferStatus', sharedWith: 0,
    dismissBytes: ["setStatusFilter('all');", "setTransferLandingLive(false);"],
    historic: 'border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20',
  },
  {
    word: 'vc-status', desk: 'src/app/(shell)/tabs/vouchers-tab.tsx', hue: 'pink', variant: 'standard',
    testid: 'vc-status-landing-word', labelVar: 'landedVcStatus', sharedWith: 0,
    dismissBytes: ["setStatusFilter('all');", "setVcLandingLive(false);"],
    historic: 'border-pink-200 bg-pink-50 text-pink-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-pink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300 dark:hover:bg-pink-500/20',
  },
  {
    word: 'cust-debt', desk: 'src/app/(shell)/tabs/customers-tab.tsx', hue: 'rose', variant: 'quiet',
    testid: 'cust-landing-word', labelVar: 'landedCustDebtLens', sharedWith: 6,
    dismissBytes: ["setDebtFilter('all');", "setLandingLive(false);"],
    historic: 'border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20',
  },
  {
    word: 'inv-stock', desk: 'src/app/(shell)/tabs/inventory-tab.tsx', hue: 'amber', variant: 'quiet',
    testid: 'inv-landing-word', labelVar: 'landedStockLens', sharedWith: 9,
    dismissBytes: ["setStockFilter('all');", "setLandingLive(false);"],
    historic: 'border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20',
  },
  {
    word: 'po-status', desk: 'src/app/(shell)/tabs/purchase-orders-tab.tsx', hue: 'indigo', variant: 'quiet',
    testid: 'po-landing-word', labelVar: 'landedStatus', sharedWith: 2,
    dismissBytes: ["setStatusFilter('ALL');", "setPage(1);", "setLandingLive(false);"],
    historic: 'border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20',
  },
  {
    // v2.400.0: sharedWith 10 → 11 — the drift alarm registered a new
    // honest wearer: the System Health desk's support-copy button (the
    // Environment & Connection panel's Copied hand-back wears the
    // emerald family in its success state, system-health-tab.tsx). The
    // chip's own wardrobe never moved.
    word: 'sup-status', desk: 'src/app/(shell)/tabs/suppliers-tab.tsx', hue: 'emerald', variant: 'quiet',
    testid: 'sup-landing-word', labelVar: 'landedSupStatus', sharedWith: 11,
    dismissBytes: ["setFilterStatus('all');", "setLandingLive(false);"],
    historic: 'border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20',
  },
  {
    word: 'sup-po', desk: 'src/app/(shell)/tabs/suppliers-tab.tsx', hue: 'cyan', variant: 'quiet',
    testid: 'sup-po-landing-word', labelVar: 'landedSupPo', sharedWith: 0,
    dismissBytes: ["setPoFilterStatus('all');", "setPoLandingLive(false);"],
    historic: 'border-cyan-200 bg-cyan-50 text-cyan-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20',
  },
  {
    word: 'txn-pay', desk: 'src/app/(shell)/tabs/transactions-tab.tsx', hue: 'violet', variant: 'quiet',
    testid: 'txn-landing-word', labelVar: 'landedTxnPay', sharedWith: 0,
    dismissBytes: ["setPaymentFilter('all');", "setTxnLandingLive(false);", "// v2.372.0 THE CHIP SCRUBS ITS WORD (the loyalty desk's", "// contract, unified): a stale ?txn-pay= that outlives", "// the lens it named is a lie the next refresh would", "// resurrect — the dismissal removes it from the address", "// bar, SSR-guarded like every window touch.", "if (typeof window !== 'undefined') {", "const next = buildSearchWithoutParams(window.location.search, ['txn-pay']);", "window.history.replaceState(null, '', next ? next : window.location.pathname);", "}"],
    historic: 'border-violet-200 bg-violet-50 text-violet-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20',
  },
];

describe('the elder storey — one registry, three heads, zero words', () => {
  it('the 200 registry exists and its keys are exactly the elder hues', () => {
    expect(loom.includes('export const LANDING_CHIP_HUES_200')).toBe(true);
    expect(loom.includes('export const LANDING_CHIP_WARDROBES_200')).toBe(true);
    for (const t of THE_ELDER) {
      const re = new RegExp(`^  ${t.hue}: 'border-${t.hue}-200`, 'm');
      expect(re.test(loom), t.hue).toBe(true);
    }
    // twenty-two entries, one line each (the SINGLE-LINE law)
    const entryLines = loom.split('\n').filter((l) => /^  [a-z]+: 'border-[a-z]+-200 /.test(l));
    expect(entryLines.length).toBe(22);
  });

  it('each variant head composes with its registry entry into the EXACT historic bytes', () => {
    const HEADS = {
      standard: CHIP_HEAD,
      compact: CHIP_HEAD_COMPACT,
      quiet: CHIP_HEAD_QUIET,
    };
    for (const t of THE_ELDER) {
      // anchor on the 200 opening — hues shared with the 300 storey have
      // TWO single-line entries and the bare hue anchor would find the wrong one
      const m = loom.match(new RegExp('^  ' + t.hue + ": '(border-" + t.hue + "-200[^']+)',?$", 'm'));
      if (!m) throw new Error(`no 200 registry entry for ${t.hue}`);
      expect(m[1], `${t.hue}'s 200 wardrobe`).toBe(t.historic);
      expect(HEADS[t.variant] + m[1], `${t.word} composes byte-for-byte`).toBe(HEADS[t.variant] + t.historic);
    }
  });

  it('the loom’s hand speaks BOTH dismiss details (the group-hover and the quiet face)', () => {
    expect(loom.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
    expect(loom.includes("'h-3 w-3 shrink-0 opacity-60'")).toBe(true);
  });
});

describe.each(THE_ELDER)('$word — the elder loomed desk, derived against the tree', (t) => {
  const desk = readFileSync(t.desk, 'utf8');

  it('the desk imports the loom, passes the elder storey and its hue by name', () => {
    expect(desk.includes("import { LandingChip } from '@/components/landing-chip';")).toBe(true);
    expect(desk.includes('storey={200}'), t.word).toBe(true);
    expect(desk.includes(`hue="${t.hue}"`), t.hue).toBe(true);
    if (t.variant !== 'standard') {
      expect(desk.includes(`variant="${t.variant}"`), t.variant).toBe(true);
    }
  });

  it('the desk keeps its handle, label and tooltip (the props speak the word)', () => {
    expect(desk.includes(`data-testid="${t.testid}"`), t.testid).toBe(true);
    expect(desk.includes('landed ?' + t.word + '=${' + t.labelVar + '}'), t.word).toBe(true);
    expect(desk.includes('press to clear it'), t.word).toBe(true);
  });

  it('the desk keeps its own dismissal writes (the loom calls, the desk owns)', () => {
    const chipAt = desk.indexOf(`hue="${t.hue}"`);
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
    expect(desk.includes(`border-${t.hue}-200 bg-${t.hue}-50 text-${t.hue}-700`), t.hue).toBe(false);
    expect(desk.includes(`dark:border-${t.hue}-500/30 dark:bg-${t.hue}-500/10`), t.hue).toBe(false);
  });

  it('THE ELDER CENSUS — the trio’s honest face across the tree', () => {
    const trio = `border-${t.hue}-200 bg-${t.hue}-50 text-${t.hue}-700`;
    const walk = (dir, acc) => {
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
    const rel = files.map((p) => p.replace(/\\/g, '/'));
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

  it('the 22 elder rows are exactly the 200-storey registry hues (derived)', () => {
    const elderFamilies = rows
      .filter((r) => THE_ELDER.some((t) => r.desk === t.desk && r.word === t.word))
      .map((r) => r.family);
    expect(elderFamilies.length).toBe(22);
    for (const t of THE_ELDER) {
      expect(elderFamilies).toContain(`border-${t.hue}-200`);
    }
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
