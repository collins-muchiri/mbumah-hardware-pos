/**
 * chip-loom-v2455.test.ts — v2.455.0 THE ELDER LOOM'S FIRST WEAVE: the
 * muted/50 family wears one component.
 *
 * The landing chips loomed in v2.394.0; the ELDER lens chips — the pill
 * filters that predate the deep-link era — stayed hand-rolled, and the
 * carry has stood since v2.397.0. This round weaves the FIRST family:
 * the desks whose chip heads read `px-3 py-1.5 rounded-full text-xs
 * font-medium border transition-all` with the primary active face and
 * the muted/50 idle face. Five faces in two desks migrate to ONE
 * component (src/components/filter-chip.tsx):
 *
 *   • transactions-tab: the date presets, the payment-method quick chips,
 *     the type census, the amount toggle
 *   • reports-tab: the date presets
 *
 * THE BYTE-FIDELITY LAW: composing the loom's wardrobe with a desk's
 * extras reproduces the historic className — with TWO named, deliberate
 * improvements this weave: `aria-pressed` (the pressed voice — the
 * debt-plans desk already spoke it) and the family's zinc keyboard ring
 * on the faces that never wore one. The payment face keeps its OWN named
 * ring voice (the v2.333 violet) via focusRing="none" — two ring colours
 * in one class list would resolve in the stylesheet's order, not the
 * attribute's, and the loom refuses that coin flip.
 *
 * THE MASQUERADE LAW, LOOM FORM: a loomed desk speaks NO wardrobe byte —
 * the active and idle faces live in exactly ONE src file (the loom).
 *
 * THE LEDGER (round one's walking map — the carry's remaining faces, so
 * the next weave never re-census by hand): inventory-tab's scale dialect,
 * customers-tab's emerald dialect, the POS gradient chips, the HR goal
 * chips (pinned by their own suite), and the registry-driven color
 * dialects (exports history, debt plans — which already wear
 * aria-pressed).
 *
 * THE WALK-SAFETY LAW: every pin below is a SEALED byte of this round's
 * own edits or an elder seat — no living version literal.
 * THE WORD-FREE LAW: this file names no address-bar token.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const loom = readRepo('src/components/filter-chip.tsx');
const transactions = readRepo('src/app/(shell)/tabs/transactions-tab.tsx');
const reports = readRepo('src/app/(shell)/tabs/reports-tab.tsx');

const HEAD = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-all';
const HEAD_COMPACT = 'px-3 py-1 rounded-full text-xs font-medium border transition-all';
const RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1';
const ACTIVE = 'bg-primary text-primary-foreground border-primary shadow-sm';
const IDLE = 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground';

const walkSrc = (dir: string, acc: string[]): string[] => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      // the census walks CODE only — the suites' own pins must never
      // answer the once-only census (the loom's census walks src, not src/tests)
      if (p === 'src/tests') continue;
      walkSrc(p, acc);
    } else if (/\.tsx?$/.test(e.name)) acc.push(p);
  }
  return acc;
};

describe('v2.455.0 — the loom component, one wardrobe', () => {
  it('the loom owns the two heads, the two faces and the zinc ring as named constants', () => {
    expect(loom.includes(`const CHIP_HEAD = '${HEAD}';`)).toBe(true);
    expect(loom.includes(`const CHIP_HEAD_COMPACT = '${HEAD_COMPACT}';`)).toBe(true);
    expect(loom.includes(`const CHIP_ACTIVE = '${ACTIVE}';`)).toBe(true);
    expect(loom.includes(`const CHIP_IDLE =\n  '${IDLE}';`)).toBe(true);
    expect(loom.includes(`const CHIP_RING_ZINC =\n  ' ${RING}'`)).toBe(true);
  });

  it('the loom speaks the pressed voice (aria-pressed rides the active state)', () => {
    expect(loom.includes('aria-pressed={active}')).toBe(true);
  });

  it("the loom's ring is opt-out (focusRing=\"none\" — a desk's named ring voice must never compete)", () => {
    expect(loom.includes(`focusRing = 'zinc'`)).toBe(true);
    expect(loom.includes(`focusRing === 'none' ? '' : CHIP_RING_ZINC`)).toBe(true);
  });

  it('the loom is a client component and speaks no address-bar token', () => {
    expect(loom.startsWith("'use client';")).toBe(true);
    // the tokens are ASSEMBLED from fragments — this file must never carry
    // the literal bytes it forbids (the census counts FILES, and a suite
    // that quotes a token becomes a file the census must admit).
    const stems = ['cust', 'txn', 'txn', 'rep', 'dp', 'debt', 'debt'];
    const tails = ['debt', 'type', 'pay', 'type', 'status', 'status', 'channel'];
    const tokens = stems.map((s, i) => `${s}-${tails[i]}`);
    for (const token of tokens) {
      expect(loom.includes(token), token).toBe(false);
    }
  });

  it('the masquerade law, loom form — the active face lives in exactly ONE src file', () => {
    const files = walkSrc('src', []);
    const homes = (needle: string) =>
      files.filter((f) => {
        try {
          return readFileSync(f, 'utf8').includes(`'${needle}'`);
        } catch {
          return false;
        }
      });
    expect(homes(ACTIVE), homes(ACTIVE).join(',')).toEqual(['src/components/filter-chip.tsx']);
    // the IDLE face has ONE named rider until the POS weave joins: the
    // gradient chips' inactive face reuses the muted/50 string. The ledger
    // names the rider so the next weave's census expects it.
    expect(homes(IDLE).sort(), homes(IDLE).join(',')).toEqual([
      'src/components/filter-chip.tsx',
      'src/components/pos/category-chips.tsx',
    ]);
  });
});

describe('v2.455.0 — the transactions desk, four faces loomed', () => {
  it('the desk imports the loom (beside its landing-chip import)', () => {
    expect(transactions.includes("import { FilterChip } from '@/components/filter-chip';")).toBe(true);
    expect(transactions.includes("import { LandingChip } from '@/components/landing-chip';")).toBe(true);
  });

  it('the date presets ride the loom (the round name in the desk)', () => {
    expect(transactions.includes('{DATE_PRESETS.map((preset) => (')).toBe(true);
    expect(transactions.includes("active={datePreset === preset.id}")).toBe(true);
    expect(transactions.includes("THE ELDER LOOM'S FIRST WEAVE (v2.455.0)")).toBe(true);
  });

  it('the payment face keeps its violet ring voice (focusRing="none", the v2.333 byte intact)', () => {
    expect(transactions.includes('focusRing="none"')).toBe(true);
    expect(
      transactions.includes(
        'className="flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1"',
      ),
    ).toBe(true);
    expect(transactions.includes("onClick={() => chooseTxnPay(method)}")).toBe(true);
  });

  it('the type census rides the loom with its count span (the census row keeps its handle)', () => {
    // the handle byte is ASSEMBLED — the file must never carry the token
    // the census owns (the testid's spelling contains it).
    const censusHandle = `data-testid="txn-${['type', 'census'].join('-')}"`;
    expect(transactions.includes(censusHandle)).toBe(true);
    expect(transactions.includes("onClick={() => chooseTxnType(type)}")).toBe(true);
    expect(transactions.includes('<span className="tabular-nums opacity-70">· {typeCensus[type]}</span>')).toBe(true);
    expect(transactions.includes('className="flex items-center gap-1"')).toBe(true);
  });

  it('the amount toggle rides the loom with its compound active state (the !! coercion)', () => {
    expect(transactions.includes('active={showAmountFilter || !!amountFilterMin || !!amountFilterMax}')).toBe(true);
    const at = transactions.indexOf('showAmountFilter || !!amountFilterMin');
    expect(transactions.slice(at, at + 200).includes('Amount Range')).toBe(true);
  });

  it('the desk speaks no wardrobe byte of its own (the palettes are the loom\u2019s)', () => {
    expect(transactions.includes(`'${ACTIVE}'`)).toBe(false);
    expect(transactions.includes(`'${IDLE}'`)).toBe(false);
  });
});

describe('v2.455.0 — the reports desk, its faces loomed', () => {
  it('the desk imports the loom and its date presets ride it', () => {
    expect(reports.includes("import { FilterChip } from '@/components/filter-chip';")).toBe(true);
    expect(reports.includes("active={datePreset === preset.id}")).toBe(true);
  });

  it('the chart-type face rides the COMPACT wardrobe (py-1, its historic size)', () => {
    expect(reports.includes('compact')).toBe(true);
    expect(reports.includes('active={chartType === ct}')).toBe(true);
    expect(reports.includes("onClick={() => setChartType(ct)}")).toBe(true);
  });

  it('the desk speaks no wardrobe byte of its own', () => {
    expect(reports.includes(`'${ACTIVE}'`)).toBe(false);
    expect(reports.includes(`'${IDLE}'`)).toBe(false);
  });
});

describe('v2.455.0 — the ledger: the carry\u2019s remaining faces, named for the next weave', () => {
  // v2.456.0 RE-KEY (dated): the registry color dialects JOINED the loom
  // in the second weave — the exports history's status lens and the
  // debt-plans status lens ride CHIP_TONE_ACTIVE / CHIP_TONE_IDLE now;
  // their sealed bytes live in chip-tones-v2456.test.ts. The ledger
  // names the four remaining dialects.
  const LEDGER = [
    // [file, the head byte that names its dialect, the dialect's word]
    ['src/app/(shell)/tabs/inventory-tab.tsx', 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105', 'the scale dialect (no border, hover grows)'],
    ['src/app/(shell)/tabs/customers-tab.tsx', 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border', 'the emerald dialect (with its count badge)'],
    ['src/components/pos/category-chips.tsx', 'chip-active', 'the gradient dialect (CSS class)'],
    ['src/app/(shell)/hr/performance/page.tsx', "ALL: 'bg-primary text-primary-foreground border-primary'", 'the HR goal chips (pinned by their own suite)'],
  ] as const;

  it.each(LEDGER)('%s — %s', (file, byte, word) => {
    const src = readRepo(file);
    expect(src.includes(byte), `${file} lost ${word}`).toBe(true);
  });

  // v2.456.0 RE-KEY (dated): the debt-plans desk's hand-rolled pressed
  // voice moved INTO the loom (aria-pressed={active} lives in
  // filter-chip.tsx now; the desk rides it) — the precedent became the
  // family's law, and the byte left the desk.
  it('the pressed voice lives in the loom and the status lenses ride it', () => {
    const loomSrc = readRepo('src/components/filter-chip.tsx');
    expect(loomSrc.includes('aria-pressed={active}')).toBe(true);
    const debt = readRepo('src/app/(shell)/tabs/debt-plans-tab.tsx');
    expect(debt.includes('<FilterChip')).toBe(true);
    expect(debt.includes('aria-pressed')).toBe(false);
  });

  it('the elder violet pin rides untouched (door-tightening\u2019s ring face)', () => {
    const pin = readRepo('src/tests/door-tightening-v2334.test.ts');
    expect(pin.includes('focus-visible:ring-violet-400')).toBe(true);
  });
});
