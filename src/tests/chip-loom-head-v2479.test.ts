// THE HEAD LEAVES HOME (v2.479.0, the loom's sixth weave): the pill head
// every lens chip speaks joins the ring and the faces as an export — the
// v2.460.0 arc completed — and the last head hand-copies retire.
//
//   • THE HEAD LEAVES HOME — CHIP_HEAD exported, byte-exact, ONE src file.
//   • THE ALL CHIP RIDES THE LOOM — the inventory ledger's All chip rides
//     <FilterChip> proper; the desk's CHIP_ACTIVE hand import retires.
//   • THE TRIBE'S HEADS RIDE THE IMPORT — the inventory data-colored
//     category chips and the POS scroll row import CHIP_HEAD.
//   • THE CENSUS PILLS LEARN THE RING AND THE DARK WARDROBE — the M-Pesa
//     census's four idle faces gain the dark voices; the M-Pesa census
//     and the security gate-range pills wear the zinc ring.
//   • NO VERSION PINS — this suite pins sealed bytes only; the treadmill
//     never finds a pin of its own to move (the walk-safety law).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LOOM = 'src/components/filter-chip.tsx';
const INVENTORY = 'src/app/(shell)/tabs/inventory-tab.tsx';
const POS = 'src/components/pos/category-chips.tsx';
const BANKING = 'src/app/(shell)/tabs/banking-tab.tsx';
const SECURITY = 'src/app/(shell)/tabs/security-tab.tsx';

const loom = readFileSync(LOOM, 'utf8');
const inventory = readFileSync(INVENTORY, 'utf8');
const pos = readFileSync(POS, 'utf8');
const banking = readFileSync(BANKING, 'utf8');
const security = readFileSync(SECURITY, 'utf8');

const HEAD_BYTE = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-all';

// ---------------------------------------------------------------------------
// 1. THE HEAD LEAVES HOME — the export, the ONE src file
// ---------------------------------------------------------------------------

describe('the head leaves home — the loom\u2019s sixth weave', () => {
  it('CHIP_HEAD is exported, byte-exact, beside the compact and slim faces', () => {
    expect(loom.includes(`export const CHIP_HEAD = '${HEAD_BYTE}';`)).toBe(true);
    expect(loom.includes("const CHIP_HEAD_COMPACT = 'px-3 py-1 rounded-full text-xs font-medium border transition-all';")).toBe(true);
    expect(loom.includes("const CHIP_HEAD_SLIM = 'px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors';")).toBe(true);
  });

  it('the head wardrobe lives in exactly ONE src file — the masquerade walk', () => {
    // THE WORD-FREE LAW'S TEETH: the walk is a SRC walk — a suite that
    // names a token admits itself into the census (the elder loom suites
    // pin the head byte in src/tests), so the tests dir stands outside
    // the walk; the wardrobe itself must live in exactly ONE src file.
    const listSrc = (dir: string): string[] => {
      const acc: string[] = [];
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.name === 'tests') continue;
        if (e.isDirectory()) acc.push(...listSrc(join(dir, e.name)));
        else if (/\.(ts|tsx|css)$/.test(e.name)) acc.push(join(dir, e.name));
      }
      return acc;
    };
    const riders = listSrc('src').filter((f) => readFileSync(f, 'utf8').includes(HEAD_BYTE));
    expect(riders).toEqual(['src/components/filter-chip.tsx']);
  });

  it('the family fallback keeps its seat — the loom still picks the faces', () => {
    expect(loom.includes('CHIP_TONE_ACTIVE[tone] ?? CHIP_ACTIVE')).toBe(true);
    expect(loom.includes('CHIP_TINT_ACTIVE[tone ?? \'\'] ?? CHIP_ACTIVE')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE ALL CHIP RIDES THE LOOM — the desk's hand import retires
// ---------------------------------------------------------------------------

describe('the inventory All chip rides <FilterChip> proper', () => {
  it('the desk imports the loom\u2019s component and head — never a hand head again', () => {
    expect(inventory.includes("import { FilterChip, CHIP_HEAD, CHIP_IDLE, CHIP_RING_ZINC } from '@/components/filter-chip';")).toBe(true);
    expect(inventory.includes(HEAD_BYTE)).toBe(false);
  });

  it('the All chip rides the component — the loom picks the faces', () => {
    expect(inventory.includes('<FilterChip')).toBe(true);
    expect(inventory.includes('className="inline-flex items-center gap-1.5"')).toBe(true);
    // the hand import retired: the loom import speaks FilterChip, CHIP_HEAD,
    // CHIP_IDLE, CHIP_RING_ZINC — never CHIP_ACTIVE (the prose comments may
    // speak the retirement's history; the import and the ternary may not).
    expect(inventory.includes("import { FilterChip, CHIP_HEAD, CHIP_IDLE, CHIP_RING_ZINC } from '@/components/filter-chip';")).toBe(true);
    expect(inventory.includes('? CHIP_ACTIVE')).toBe(false);
  });

  it('the data-colored category chips keep the tribe\u2019s grammar — data color inline, idle from the registry', () => {
    expect(inventory.includes('`inline-flex items-center gap-1.5 ${CHIP_HEAD}${CHIP_RING_ZINC} ${')).toBe(true);
    expect(inventory.includes("'text-white shadow-sm'")).toBe(true);
    expect(inventory.includes('backgroundColor: color, borderColor: color')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE TRIBE'S HEADS RIDE THE IMPORT — the POS scroll row
// ---------------------------------------------------------------------------

describe('the POS scroll row\u2019s head hand-copies retire', () => {
  it('the tribe imports the head beside the ring and the idle face', () => {
    expect(pos.includes("import { CHIP_HEAD, CHIP_IDLE, CHIP_RING_ZINC } from '@/components/filter-chip';")).toBe(true);
    expect(pos.includes(HEAD_BYTE)).toBe(false);
  });

  it('both chips (All + per-category) ride the import — exactly two seats', () => {
    expect((pos.match(/shrink-0 \$\{CHIP_HEAD\} whitespace-nowrap flex items-center gap-1\.5 min-w-fit chip-hover-lift\$\{CHIP_RING_ZINC\}/g) ?? []).length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CENSUS PILLS LEARN THE RING AND THE DARK WARDROBE
// ---------------------------------------------------------------------------

describe('the census pills learn the family\u2019s voices', () => {
  it('the M-Pesa census wears the zinc ring — the family\u2019s one keyboard voice', () => {
    expect(banking.includes("import { CHIP_RING_ZINC } from '@/components/filter-chip';")).toBe(true);
    expect(banking.includes('tabular-nums transition-colors${CHIP_RING_ZINC} ${')).toBe(true);
  });

  it('the four idle faces gain the dark wardrobe — the elder ledger\u2019s named debt', () => {
    expect(banking.includes("'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', 'bg-emerald-600 text-white', 'Matched'")).toBe(true);
    expect(banking.includes("'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', 'bg-amber-600 text-white', 'Pending'")).toBe(true);
    expect(banking.includes("'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300', 'bg-red-600 text-white', 'Unmatched'")).toBe(true);
    expect(banking.includes("'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300', 'bg-orange-600 text-white', 'Disputed'")).toBe(true);
  });

  it('the active faces keep their solid voice — the census\u2019s own word', () => {
    expect((banking.match(/'bg-emerald-600 text-white'/g) ?? []).length).toBe(1);
  });

  it('the security gate-range pills wear the ring and the amber dark word', () => {
    expect(security.includes("import { CHIP_RING_ZINC } from '@/components/filter-chip';")).toBe(true);
    expect(security.includes('text-xs transition-colors${CHIP_RING_ZINC} ${')).toBe(true);
    expect(security.includes("'bg-amber-500/10 text-amber-700 border-amber-500/30 font-medium dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'")).toBe(true);
    expect(security.includes("'bg-transparent text-muted-foreground border-border hover:bg-muted/60'")).toBe(true);
  });

  it('the pressed voice stays — every census pill still speaks aria-pressed', () => {
    expect(banking.includes('aria-pressed={mpesaFilterStatus === word}')).toBe(true);
    expect(security.includes('aria-pressed={pressed}')).toBe(true);
  });
});
