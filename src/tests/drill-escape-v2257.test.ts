// v2.257.0 — the escape ladder.
//
//   - THE DRILLS' RUNG: the PO drill and the sheet drill had no Escape
//     law of their own (overlay click + close button only) — a user
//     pressing Escape on an open drill got nothing, because the ear's
//     guard correctly hands the key to "the dialog", and the drill WAS
//     the dialog. useDrillEscape gives both drills their own rung from
//     the ONE home (use-lens-escape): the drill closes when it is the
//     tree's ONLY dialog; when another dialog rides above it, the drill
//     stays silent (the topmost dialog's own law speaks first). The
//     guard reads the live tree at the moment of the keypress — the
//     ear's law mirrored, never a copy.
//   - THE LADDER: the rungs stack — a drill over a pressed lens gives
//     Escape → the drill closes (the drill's rung), Escape again → the
//     lens stands down (the ear's rung). One press pops the topmost
//     layer; the ear's dialog guard is UNCHANGED bytes (it must stay
//     silent while any dialog is up).
//   - THE HINT: each drill's header wears the discoverability detail —
//     a quiet `esc` kbd chip beside the close button, the close button
//     speaks the words in its title, and the close ring joins the
//     focus-visible law (violet for the PO drill's family, amber for
//     the sheet's).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const ear = read('src/lib/use-lens-escape.ts');
const drill = read('src/components/org/po-drill.tsx');
const sheet = read('src/components/org/sheet-drill.tsx');

describe('the drills\u2019 rung \u2014 useDrillEscape lives in the one home (v2.257.0)', () => {
  it('the one home grew the drill rung \u2014 exported beside the ear, never a second file', () => {
    expect(ear).toContain('export function useDrillEscape(onClose: () => void): void {');
    // the ear's own law is untouched in the same file (one home, two rungs)
    expect(ear).toContain('export function useLensEscape(pressed: boolean, onClear: () => void): void {');
  });

  it('the drill rung\u2019s law \u2014 Escape only, the only-dialog guard, the live tree at keypress', () => {
    expect(ear).toContain("if (e.key !== 'Escape') return;");
    expect(ear).toContain("if (document.querySelectorAll('[role=\"dialog\"]').length > 1) return;");
    expect(ear).toContain('onClose();');
  });

  it('the drill rung disarms with the drill \u2014 the listener\u2019s lifetime is the mount\u2019s', () => {
    expect(ear).toContain("window.addEventListener('keydown', onKey);");
    expect(ear).toContain("return () => window.removeEventListener('keydown', onKey);");
  });
});

describe('the rungs are wired \u2014 both drills call the one home (v2.257.0)', () => {
  it('the PO drill wears its rung \u2014 the import and the call, one home', () => {
    expect(drill).toContain("import { useDrillEscape } from '@/lib/use-lens-escape';");
    expect(drill).toContain('useDrillEscape(onClose);');
  });

  it('the sheet drill wears its rung \u2014 the import and the call, one home', () => {
    expect(sheet).toContain("import { useDrillEscape } from '@/lib/use-lens-escape';");
    expect(sheet).toContain('useDrillEscape(onClose);');
  });

  it('the ear\u2019s three faces keep their own import bytes \u2014 the ladder adds, never rewrites', () => {
    const ledger = read('src/components/org/po-ledger.tsx');
    const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
    const suppliers = read('src/app/(shell)/tabs/suppliers-tab.tsx');
    expect(ledger).toContain("import { useLensEscape } from '@/lib/use-lens-escape';");
    expect(branch).toContain("import { useLensEscape } from '@/lib/use-lens-escape';");
    expect(suppliers).toContain("import { useLensEscape } from '@/lib/use-lens-escape';");
  });
});

describe('the hint \u2014 the esc chip, the close words, the focus rings (v2.257.0)', () => {
  it('the PO drill\u2019s header carries the chip, the words, and the violet ring', () => {
    expect(drill).toContain('data-testid="po-drill-esc-hint"');
    expect(drill).toContain('title="Escape closes this drill"');
    expect(drill).toContain('focus-visible:ring-2 focus-visible:ring-violet-500/60');
  });

  it('the sheet drill\u2019s header carries the chip, the words, and the amber ring', () => {
    expect(sheet).toContain('data-testid="sheet-drill-esc-hint"');
    expect(sheet).toContain('title="Escape closes this drill"');
    expect(sheet).toContain('focus-visible:ring-2 focus-visible:ring-amber-500/60');
  });

  it('the chips are honest \u2014 aria-hidden (the close button\u2019s own label speaks the law)', () => {
    expect(drill).toMatch(/data-testid="po-drill-esc-hint"[\s\S]{0,120}aria-hidden="true"/);
    expect(sheet).toMatch(/data-testid="sheet-drill-esc-hint"[\s\S]{0,120}aria-hidden="true"/);
  });
});
