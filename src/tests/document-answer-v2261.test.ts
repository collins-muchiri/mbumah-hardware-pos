// v2.261.0 — the document's answer.
//
//   - THE ARC'S COMPLETION: the tile answers with a count (v2.258.0),
//     the rail answers with rows (v2.259.0 + v2.260.0), and now the
//     DOCUMENT answers with its own facts. When the ledger opens a
//     row's drill under a pressed metric, the drill speaks WHY — the
//     ONE rule's own arithmetic, read from the fields the document's
//     wire ALREADY carries (status + createdAt + expectedDate — zero
//     new fetch, never a second copy of the rule).
//   - THE HONEST GATE: the voice gates on the predicate ITSELF. A
//     document that does not answer the pressed rule (a stale lens, a
//     row that moved between list and drill) answers null, and the
//     strip stays absent — a why that cannot be spoken is never
//     guessed. A drill opened of its own right (no metric handed)
//     answers nothing it was not asked.
//   - THE FAMILY'S FOURTH FACE: the strip wears the metric's own
//     family — an informational face (border + ground + text, the rail
//     dot for the pressed chip's colour), never the pressed shout,
//     never a new palette, never a hover (an answer is information,
//     not a control).
//   - THE DRILLS' WORDS, NOT A NEW RUNG: the branch detail wears the
//     esc chip the drills wear — but NO useDrillEscape. The detail's
//     Escape is Radix's own: the topmost layer answers first, the
//     ladder's silence law holds by the platform's own stack. The
//     words, never a second listener.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) —
// and the WHY voice, being pure arithmetic, is additionally pinned at
// RUNTIME (the days math is the one place a byte-pin could lie).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { poMetricFamily, poMetricWhyVoice } from '@/lib/po-metrics';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const lib = read('src/lib/po-metrics.ts');
const drill = read('src/components/org/po-drill.tsx');
const ledger = read('src/components/org/po-ledger.tsx');
const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');

describe('the one home grows the why voice (v2.261.0)', () => {
  it('the shape and the voice are exported beside the rule — one home, never a copy', () => {
    expect(lib).toContain('export interface PoMetricWhyShape {');
    expect(lib).toContain('export function poMetricWhyVoice(kind: PoMetricKind, po: PoMetricWhyShape): string | null {');
    // the gate IS the rule — the same predicate the tiles, the rails and
    // the card read
    expect(lib).toContain('if (!poMetricPredicate(kind, po)) return null;');
  });

  it('the voice speaks the rule\u2019s own arithmetic \u2014 the document\u2019s words, never new semantics', () => {
    expect(lib).toContain(
      "return 'in flight \u2014 neither received nor cancelled; the order still owes the pipeline its ending.';"
    );
    expect(lib).toContain("? 'on time \u2014 raised on the day the supplier named.'");
    expect(lib).toContain("no day was named; the benefit of the doubt stands.");
    expect(lib).toContain('before the day the supplier named.`');
    expect(lib).toContain('after the day the supplier named.`');
    // the day the supplier named — the Expected tile's own voice, reused
    expect(lib).toContain('the day the supplier named');
  });

  it('the family grew its fourth face \u2014 the strip\u2019s colours ride the SAME three families', () => {
    expect(lib).toContain('why: string;');
    expect(lib).toContain(
      "why: 'border-green-200 bg-green-50/60 text-green-800 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-200',"
    );
    expect(lib).toContain(
      "why: 'border-rose-200 bg-rose-50/60 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200',"
    );
    expect(lib).toContain(
      "why: 'border-blue-200 bg-blue-50/60 text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200',"
    );
  });

  it('RUNTIME \u2014 the gate is the predicate: a document that does not answer stays silent', () => {
    // open asks for a RECEIVED document — silence
    expect(poMetricWhyVoice('open', { status: 'RECEIVED', createdAt: '2026-10-01', expectedDate: '2026-10-05' })).toBeNull();
    // late asks for received-after-expectation — an on-time document is silent
    expect(poMetricWhyVoice('late', { status: 'RECEIVED', createdAt: '2026-10-01T00:00:00Z', expectedDate: '2026-10-05' })).toBeNull();
    // onTime asks for received-not-after — a late document is silent
    expect(poMetricWhyVoice('onTime', { status: 'RECEIVED', createdAt: '2026-10-07T00:00:00Z', expectedDate: '2026-10-05' })).toBeNull();
    // a CANCELLED document answers nothing (the predicate's own law)
    expect(poMetricWhyVoice('late', { status: 'CANCELLED', createdAt: '2026-10-07T00:00:00Z', expectedDate: '2026-10-05' })).toBeNull();
  });

  it('RUNTIME \u2014 the days arithmetic: before, on, and after the day the supplier named', () => {
    // late: the CALENDAR gap — created on the 4th, named the 1st: three days after
    expect(
      poMetricWhyVoice('late', { status: 'RECEIVED', createdAt: '2026-10-04T10:00:00Z', expectedDate: '2026-10-01T00:00:00Z' })
    ).toBe('arrived late \u2014 raised 3 days after the day the supplier named.');
    // late, singular day: twenty-five hours past the named midnight is ONE day, never two
    expect(
      poMetricWhyVoice('late', { status: 'RECEIVED', createdAt: '2026-10-02T01:00:00Z', expectedDate: '2026-10-01T00:00:00Z' })
    ).toBe('arrived late \u2014 raised 1 day after the day the supplier named.');
    // late, the same day: raised later in the day the supplier named
    expect(
      poMetricWhyVoice('late', { status: 'RECEIVED', createdAt: '2026-10-01T05:00:00Z', expectedDate: '2026-10-01T00:00:00Z' })
    ).toBe('arrived late \u2014 raised later in the day the supplier named.');
    // on time: created 4 days before the expectation (floor)
    expect(
      poMetricWhyVoice('onTime', { status: 'RECEIVED', createdAt: '2026-10-01T00:00:00Z', expectedDate: '2026-10-05T00:00:00Z' })
    ).toBe('on time \u2014 raised 4 days before the day the supplier named.');
    // on time, the same day: raised at the named day's own midnight —
    // the only same-day shape the rule calls on time (any later hour is
    // the late rule's, and the late voice speaks it)
    expect(
      poMetricWhyVoice('onTime', { status: 'RECEIVED', createdAt: '2026-10-05T00:00:00Z', expectedDate: '2026-10-05T00:00:00Z' })
    ).toBe('on time \u2014 raised on the day the supplier named.');
    // on time with no expectation: the benefit of the doubt stands
    expect(poMetricWhyVoice('onTime', { status: 'RECEIVED', createdAt: '2026-10-05T09:00:00Z', expectedDate: null })).toBe(
      'on time \u2014 no day was named; the benefit of the doubt stands.'
    );
    // open: the in-flight voice
    expect(poMetricWhyVoice('open', { status: 'APPROVED', createdAt: '2026-10-05', expectedDate: null })).toBe(
      'in flight \u2014 neither received nor cancelled; the order still owes the pipeline its ending.'
    );
  });

  it('RUNTIME \u2014 the family\u2019s why face exists on all three kinds, the ancestors byte-identical', () => {
    for (const k of ['onTime', 'late', 'open'] as const) {
      const f = poMetricFamily(k);
      expect(f.why).toBeTruthy();
      expect(f.chip).toBeTruthy();
      expect(f.pressed).toBeTruthy();
      expect(f.rail).toBeTruthy();
    }
    expect(poMetricFamily('onTime').rail).toBe('bg-green-500');
    expect(poMetricFamily('late').rail).toBe('bg-rose-500');
    expect(poMetricFamily('open').rail).toBe('bg-blue-500');
  });
});

describe('the drill wears the document\u2019s answer (v2.261.0)', () => {
  it('the target grew the metric hand \u2014 additive + optional, the old shape\u2019s fields verbatim', () => {
    expect(drill).toContain('export type PoDrillTarget = {');
    expect(drill).toContain('  id: string;\n  poNumber: string;\n  status: string;');
    expect(drill).toContain('  metric?: PoMetricKind;');
  });

  it('the drill imports the one home \u2014 the gate, the voice and the family, never a copy', () => {
    expect(drill).toContain("import { poMetricFamily, poMetricWhyVoice, type PoMetricKind } from '@/lib/po-metrics';");
  });

  it('the gate reads the FRESH wire\u2019s own row \u2014 a stale row keeps the strip silent', () => {
    expect(drill).toContain('const metricKind = target.metric ?? null;');
    expect(drill).toContain('const whyFamily = metricKind ? poMetricFamily(metricKind) : null;');
    expect(drill).toContain('const metricWhy = metricKind && data ? poMetricWhyVoice(metricKind, data) : null;');
  });

  it('the strip\u2019s honest address \u2014 family face, rail dot, the voice\u2019s own testid', () => {
    expect(drill).toContain('data-testid="po-drill-metric-why"');
    expect(drill).toContain('data-testid="po-drill-metric-why-voice"');
    expect(drill).toContain('${whyFamily.why}');
    expect(drill).toContain('${whyFamily.rail}');
    expect(drill).toContain('why this document answers');
    // the one rule's own title — the words name where the rule lives
    expect(drill).toContain('the Performance card, the rails and the tiles all read it');
  });

  it('the strip lives INSIDE the loaded-document block \u2014 no document, no answer', () => {
    const dataIdx = drill.indexOf('{data && (');
    const stripIdx = drill.indexOf('data-testid="po-drill-metric-why"');
    expect(dataIdx).toBeGreaterThan(-1);
    expect(stripIdx).toBeGreaterThan(dataIdx);
  });

  it('the ancestors untouched \u2014 the rungs and the chips keep their bytes (v2.257.0)', () => {
    expect(drill).toContain('useDrillEscape(onClose);');
    expect(drill).toContain('data-testid="po-drill-esc-hint"');
    expect(drill).toMatch(/data-testid="po-drill-esc-hint"[\s\S]{0,120}aria-hidden="true"/);
    expect(drill).toContain('title="Escape closes this drill"');
    // the birth strip's own bytes — the why-strip joined ABOVE it, never
    // inside it
    expect(drill).toContain('data-testid="po-drill-birth-strip"');
    expect(drill).toContain('data-testid="po-drill-birth-door"');
  });
});

describe('the ledger hands the pressed rule through the door (v2.261.0)', () => {
  it('the row door carries the metric \u2014 pressed rides, unpressed stays absent', () => {
    expect(ledger).toContain('id: po.id,\n                        poNumber: po.poNumber,\n                        status: po.status,');
    expect(ledger).toContain("metric: metricLens === 'all' ? undefined : metricLens,");
  });

  it('the ancestors untouched \u2014 the ear, the rails and the empty face keep their bytes (v2.256.0\u2013v2.260.0)', () => {
    expect(ledger).toContain("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {");
    expect(ledger.match(/useLensEscape\(/g)?.length).toBe(1);
    expect(ledger).toContain('data-testid="po-ledger-band-row"');
    expect(ledger).toContain('data-testid="po-ledger-metric-row"');
    expect(ledger).toContain('data-testid="po-ledger-lens-empty"');
    expect(ledger).toContain('<PoDrill');
    expect(ledger).toContain('<SheetDrill');
  });
});

describe('the branch detail wears the drills\u2019 words \u2014 the chip, never a new rung (v2.261.0)', () => {
  it('the esc chip rides the detail\u2019s title \u2014 hidden on small screens, honest to ears', () => {
    expect(branch).toContain('data-testid="po-detail-esc-hint"');
    expect(branch).toMatch(/data-testid="po-detail-esc-hint"[\s\S]{0,200}aria-hidden="true"/);
    expect(branch).toMatch(/data-testid="po-detail-esc-hint"[\s\S]{0,240}hidden items-center rounded border bg-muted\/40[\s\S]{0,80}sm:inline-flex/);
  });

  it('NO second listener \u2014 the detail\u2019s Escape is Radix\u2019s own, the words are the growth', () => {
    expect(branch).not.toContain('useDrillEscape');
    // the platform's own stack: the detail renders inside Radix's
    // DialogContent (the topmost layer answers Escape first)
    expect(branch).toContain('DialogContent');
  });

  it('the ancestors untouched \u2014 the detail\u2019s door and the tab\u2019s ear keep their bytes (v2.259.0 + v2.256.0)', () => {
    expect(branch).toContain('data-testid="po-detail-birth-door"');
    expect(branch).toContain("import { useLensEscape } from '@/lib/use-lens-escape';");
  });
});
