// v2.262.0 — the branch's answer.
//
//   - THE SECOND SURFACE: the ledger drill answered why (v2.261.0) —
//     now the branch detail does too. The roster's pressed metric rides
//     PODetailView's door (metric?: PoMetricKind, additive + optional)
//     and the detail answers with the document's own facts: the ONE
//     home's voice (poMetricWhyVoice), the ONE family's why face
//     (poMetricFamily(metric).why) — one home, two surfaces, zero new
//     copies.
//   - THE HONEST GATE, SAME LAW: the gate is the predicate on the fresh
//     wire's own row — a document that no longer answers the pressed
//     rule keeps the strip silent; a detail opened of its own right
//     (no metric handed) answers nothing it was not asked.
//   - THE SHARED WORDS: the strip wears the SAME label and title the
//     drill's strip wears ("why this document answers" / "the one rule
//     — the Performance card, the rails and the tiles all read it") —
//     the answer is the rule's, not the surface's.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).
// The voice's arithmetic is pinned at RUNTIME in v2261 — this surface
// is pure wiring, and byte pins are the net for wiring.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const orgDrill = read('src/components/org/po-drill.tsx');
const ledger = read('src/components/org/po-ledger.tsx');
const lib = read('src/lib/po-metrics.ts');

describe('the branch\u2019s answer \u2014 the detail wears the why-strip (v2.262.0)', () => {
  it('the door grew the metric hand \u2014 additive + optional, the drill\u2019s own target shape', () => {
    expect(branch).toContain('  onOpenSheet?: (t: { id: string; storeName: string; status: string }) => void;');
    expect(branch).toContain('  metric?: PoMetricKind;');
    expect(branch).toContain('  metric,\n}: {');
  });

  it('the tab imports the why voice + the kind \u2014 one home, never a copy', () => {
    expect(branch).toContain("poMetricWhyVoice,\n  type PoMetricKind,\n  type PoMetricLens,\n} from '@/lib/po-metrics';");
  });

  it('the gate reads the FRESH wire\u2019s own row \u2014 a stale row keeps the strip silent', () => {
    expect(branch).toContain('const whyVoice = metric && detail ? poMetricWhyVoice(metric, detail) : null;');
    expect(branch).toContain('const whyFamily = metric ? poMetricFamily(metric) : null;');
    // the gate sits AFTER the null guard (the detail must exist to answer)
    const guardIdx = branch.indexOf('if (!detail) return null;');
    const gateIdx = branch.indexOf('const whyVoice = metric && detail');
    expect(guardIdx).toBeGreaterThan(-1);
    expect(gateIdx).toBeGreaterThan(guardIdx);
  });

  it('the strip\u2019s honest address \u2014 family face, rail dot, the voice\u2019s own testid', () => {
    expect(branch).toContain('data-testid="po-detail-metric-why"');
    expect(branch).toContain('data-testid="po-detail-metric-why-voice"');
    expect(branch).toContain('${whyFamily.why}');
    expect(branch).toContain('${whyFamily.rail}');
  });

  it('the SHARED words \u2014 the same label and title the drill\u2019s strip wears (the answer is the rule\u2019s, not the surface\u2019s)', () => {
    const label = 'why this document answers';
    expect(branch).toContain(label);
    expect(orgDrill).toContain(label);
    const title = "the one rule \u2014 the Performance card, the rails and the tiles all read it; this document's own facts answer it here";
    expect(branch).toContain(title);
    expect(orgDrill).toContain(title);
  });

  it('the strip lives ABOVE the birth strip, inside the loaded-document block', () => {
    const whyIdx = branch.indexOf('data-testid="po-detail-metric-why"');
    const birthIdx = branch.indexOf('data-testid="po-detail-birth-strip"');
    expect(whyIdx).toBeGreaterThan(-1);
    expect(birthIdx).toBeGreaterThan(whyIdx);
    // inside the space-y-5 body (past the skeleton's ternary)
    const bodyIdx = branch.indexOf('<div className="space-y-5">');
    expect(whyIdx).toBeGreaterThan(bodyIdx);
  });

  it('the roster hands the pressed rule \u2014 unpressed stays absent', () => {
    expect(branch).toContain("metric={metricLens === 'all' ? undefined : metricLens}");
  });
});

describe('the ancestors untouched \u2014 the growth left the family\u2019s own bytes alone', () => {
  it('the ledger drill keeps its own why-strip (one home, two surfaces, no cross-talk)', () => {
    expect(orgDrill).toContain('data-testid="po-drill-metric-why"');
    expect(orgDrill).toContain('const metricWhy = metricKind && data ? poMetricWhyVoice(metricKind, data) : null;');
    // the ledger's hand unchanged (v2.261.0)
    expect(ledger).toContain("metric: metricLens === 'all' ? undefined : metricLens,");
  });

  it('the one home\u2019s voice unchanged \u2014 both surfaces read the same gate', () => {
    expect(lib).toContain('export function poMetricWhyVoice(kind: PoMetricKind, po: PoMetricWhyShape): string | null {');
    expect(lib).toContain('if (!poMetricPredicate(kind, po)) return null;');
  });

  it('the detail\u2019s earlier growth keeps its bytes (v2.259.0 door + v2.261.0 chip)', () => {
    expect(branch).toContain('data-testid="po-detail-birth-door"');
    expect(branch).toContain('data-testid="po-detail-esc-hint"');
    expect(branch).not.toContain('useDrillEscape');
  });

  it('the tab\u2019s instruments keep their bytes (v2.259.0 rail + combined ear)', () => {
    expect(branch).toContain('data-testid="branch-po-metric-rail"');
    expect(branch).toContain("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {");
    expect((branch.match(/useLensEscape\(/g) || []).length).toBe(1);
  });
});
