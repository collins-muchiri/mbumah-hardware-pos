// v2.263.0 — the lens remembered.
//
//   - THE ROSTER-MEMORY CANDIDATE, DEFINED AT LAST: queued undefined
//     since the early rounds — this round defines it AND ships it. A
//     face's narrowing instruments (the band house + the metric kind)
//     remember their press across navigation within the session. The
//     reader returns and the lens is exactly as it was left.
//   - THE NEEDLE NEVER RIDES: a needle is a moment's question, not a
//     stance — restoring a stale search would narrow rows behind the
//     reader's back. The memory holds the LENSES only.
//   - STANDING A LENS DOWN IS FORGETTING: the lifts (Escape, the clear
//     buttons, a press) write through like any other press — the
//     memory holds the lens AS LEFT, not as first pressed.
//   - THE REMEMBERED CHIP: the restoration's own notice — "remembered"
//     beside the metric rail, speaking how to lift it, visible only
//     until the reader's own hand moves an instrument.
//   - THE MEMBERSHIP LAW: the envelope carries strings, but only the
//     face knows its own members — the applying side validates against
//     the face's own houses and kinds before pressing anything.
//
// Byte pins read the SOURCE OF RECORD; the one home's guards and the
// roundtrip get RUNTIME pins (jsdom's sessionStorage is real).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, it, expect } from 'vitest';
import { readLensMemory, writeLensMemory } from '@/lib/lens-memory';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const memLib = read('src/lib/lens-memory.ts');
const ledger = read('src/components/org/po-ledger.tsx');
const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');

describe('the one home of view memory (v2.263.0)', () => {
  it('the memory\u2019s own bytes \u2014 the envelope, the guards, the swallow', () => {
    expect(memLib).toContain('export interface LensMemory {');
    expect(memLib).toContain('export function readLensMemory(key: string): LensMemory | null {');
    expect(memLib).toContain('export function writeLensMemory(key: string, memory: LensMemory): void {');
    expect(memLib).toContain('if (typeof window === \'undefined\') return null;');
    expect(memLib).toContain("if (typeof r.band !== 'string' || typeof r.metric !== 'string') return null;");
    expect(memLib).toContain('window.sessionStorage.setItem(key, JSON.stringify(memory));');
    // the needle\u2019s law is written where the reader can read it
    expect(memLib).toContain('THE NEEDLE NEVER RIDES');
  });

  it('RUNTIME \u2014 the roundtrip: a press remembered, a stranger refused', () => {
    sessionStorage.clear();
    expect(readLensMemory('roundtrip-test')).toBeNull();
    writeLensMemory('roundtrip-test', { band: 'fresh', metric: 'late' });
    expect(readLensMemory('roundtrip-test')).toEqual({ band: 'fresh', metric: 'late' });
    // a foreign envelope answers null (the shape check, never an assumption)
    sessionStorage.setItem('roundtrip-test', JSON.stringify({ band: 5, other: 'x' }));
    expect(readLensMemory('roundtrip-test')).toBeNull();
    sessionStorage.setItem('roundtrip-test', 'not json at all');
    expect(readLensMemory('roundtrip-test')).toBeNull();
    sessionStorage.setItem('roundtrip-test', '"just a string"');
    expect(readLensMemory('roundtrip-test')).toBeNull();
    sessionStorage.clear();
    expect(readLensMemory('roundtrip-test')).toBeNull();
  });

  beforeEach(() => {
    sessionStorage.clear();
  });
});

describe('the ledger remembers (v2.263.0)', () => {
  it('the face wears the one home \u2014 the import and its own key', () => {
    expect(ledger).toContain("import { readLensMemory, writeLensMemory } from '@/lib/lens-memory';");
    expect(ledger).toContain("readLensMemory('org-po-ledger')");
    expect(ledger).toContain("writeLensMemory('org-po-ledger', { band: bandLens, metric: metricLens });");
  });

  it('the membership law \u2014 only values the face can name get pressed', () => {
    expect(ledger).toContain("const BANDS = ['fresh', 'stale', 'beyond', 'never', 'silent'];");
    expect(ledger).toContain("const METRICS = ['onTime', 'late', 'open'];");
    expect(ledger).toContain('if (BANDS.includes(mem.band)) setBandLens(mem.band');
    expect(ledger).toContain('if (METRICS.includes(mem.metric)) setMetricLens(mem.metric');
  });

  it('the needle never rides \u2014 the memory holds the lenses, never the finder', () => {
    const writeCall = ledger.indexOf("writeLensMemory('org-po-ledger', { band: bandLens, metric: metricLens });");
    expect(writeCall).toBeGreaterThan(-1);
    // the write effect\u2019s deps carry the lenses + the chip\u2019s own flag
    expect(ledger).toContain('}, [bandLens, metricLens, remembered]);');
    // the needle\u2019s own state declaration is untouched and unpersisted
    expect(ledger).toContain("const [needle, setNeedle] = useState('');");
  });

  it('the remembered chip \u2014 the restoration\u2019s own notice beside the rail', () => {
    expect(ledger).toContain('data-testid="po-ledger-lens-remembered"');
    expect(ledger).toMatch(/data-testid="po-ledger-lens-remembered"[\s\S]{0,520}aria-hidden="true"/);
    expect(ledger).toContain('your last lens returned with you');
    // the mount commit writes nothing (a default-envelope write would
    // wipe the memory the read side just consumed) — the honest skip
    expect(ledger).toContain('const firstWriteRef = useRef(true);');
    expect(ledger).toContain('if (firstWriteRef.current) {');
    // it clears when the lens returns to the face\u2019s own default
    expect(ledger).toContain("if (remembered && bandLens === 'ALL' && metricLens === 'all') setRemembered(false);");
  });

  it('the ancestors untouched \u2014 the ear, the rails, the why-strip, the drills', () => {
    expect(ledger).toContain("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {");
    expect((ledger.match(/useLensEscape\(/g) || []).length).toBe(1);
    expect(ledger).toContain('data-testid="po-ledger-metric-row"');
    expect(ledger).toContain('data-testid="po-ledger-band-row"');
    expect(ledger).toContain('data-testid="po-ledger-lens-empty"');
    expect(ledger).toContain("metric: metricLens === 'all' ? undefined : metricLens,");
  });
});

describe('the branch remembers (v2.263.0)', () => {
  it('the face wears the one home \u2014 its own key, the same law', () => {
    expect(branch).toContain("import { readLensMemory, writeLensMemory } from '@/lib/lens-memory';");
    expect(branch).toContain("readLensMemory('branch-po-roster')");
    expect(branch).toContain("writeLensMemory('branch-po-roster', { band: bandLens, metric: metricLens });");
    expect(branch).toContain("const BANDS = ['fresh', 'stale', 'beyond', 'never', 'silent'];");
    expect(branch).toContain('}, [bandLens, metricLens, remembered]);');
    expect(branch).toContain('const firstWriteRef = useRef(true);');
  });

  it('the remembered chip \u2014 the branch\u2019s own address', () => {
    expect(branch).toContain('data-testid="branch-po-lens-remembered"');
    expect(branch).toContain('your last lens returned with you');
  });

  it('the ancestors untouched \u2014 the detail\u2019s answer, the chip, the rail, the ear', () => {
    expect(branch).toContain('data-testid="po-detail-metric-why"');
    expect(branch).toContain("metric={metricLens === 'all' ? undefined : metricLens}");
    expect(branch).toContain('data-testid="po-detail-esc-hint"');
    expect(branch).toContain('data-testid="branch-po-metric-rail"');
    expect(branch).toContain("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {");
    expect((branch.match(/useLensEscape\(/g) || []).length).toBe(1);
    expect(branch).not.toContain('useDrillEscape');
  });
});
