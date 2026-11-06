// THE EYE'S OWN ARC SUITE (v2.429.0) — THE ARC'S TENTH WORD: the pill
// answers the toast's point.
//
//   - the echo read (receiveShortfallEcho): the callback word exists
//     only when the LAST receipt this session was SHORT — the null for
//     a full receipt, a zero, or a number that is not one (the
//     pointer's own grace mirrored — never a fake echo, never a
//     crash). The words speak NO units: the pill's own words already
//     carry them, recomputed from the fresh wire; a second count could
//     only disagree with the first.
//   - the faces: the callback crosses the close (onShortSubmit rides
//     the dialog's success — the pointer's own truth, the honest null
//     on a full submit), the drill holds the echo (the state + the
//     close's reset — a reopened drill starts honest), the pill's
//     paint deepens when the echo lives (the bolder ring, the census
//     ring when not), and the echo line speaks under the pill.
//   - THE HONEST SILENCES: the echo line renders CONDITIONALLY (no
//     short receipt, no echo, never a run-on of nothing), and the echo
//     lives inside the door's own block — a card without a door never
//     wears an echo.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) —
// the house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { receiveShortfallEcho } from '@/lib/po-receive';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const LIB = 'src/lib/po-receive.ts';
const TAB = 'src/app/(shell)/tabs/purchase-orders-tab.tsx';
const libSrc = read(LIB);
const tabSrc = read(TAB);

describe('the echo\u2019s read (v2.429.0) \u2014 the pill\u2019s own answer', () => {
  it('the short receipt speaks the echo \u2014 named by the last receipt', () => {
    expect(receiveShortfallEcho(10)).toBe('named by the last receipt');
  });

  it('the singular law does not visit the echo \u2014 one unit is still the echo\u2019s own words', () => {
    // the echo speaks NO units (the pill's words carry them) — the
    // singular/plural law stays the pointer's alone
    expect(receiveShortfallEcho(1)).toBe('named by the last receipt');
    expect(receiveShortfallEcho(1)).not.toContain('unit');
  });

  it('THE HONEST SILENCE \u2014 a full receipt (zero) reads the null', () => {
    expect(receiveShortfallEcho(0)).toBeNull();
  });

  it('the honest absences \u2014 no short submit and the reopened drill both read the null', () => {
    expect(receiveShortfallEcho(null)).toBeNull();
    expect(receiveShortfallEcho(undefined)).toBeNull();
  });

  it('THE GRACE \u2014 a number that is not one reads the null, never a crash', () => {
    expect(receiveShortfallEcho(Number.NaN)).toBeNull();
    expect(receiveShortfallEcho(Number.POSITIVE_INFINITY)).toBeNull();
    expect(receiveShortfallEcho(Number.NEGATIVE_INFINITY)).toBeNull();
    expect(receiveShortfallEcho(-4)).toBeNull();
  });
});

describe('the faces (v2.429.0) \u2014 the callback crosses the close, pinned to the source', () => {
  it('the lib\u2019s one home \u2014 the echo read lives in po-receive', () => {
    expect(libSrc).toContain("THE EYE'S OWN ARC");
    expect(libSrc).toContain('export function receiveShortfallEcho(');
    expect(libSrc).toContain("return 'named by the last receipt';");
  });

  it('the drill reads the ONE home \u2014 the widened import', () => {
    expect(tabSrc).toContain(
      "import { buildReceiveInitials, receiveRowState, describeReceivePlan, drillLineState, describeDrillProgress, receiveMaker, receiveSuccessVoice, receiveShortfallPointer, receiveShortfallEcho, drillFollowUpDoor } from '@/lib/po-receive';"
    );
  });

  it('THE CALLBACK CROSSES THE CLOSE \u2014 the dialog\u2019s success rides the pointer\u2019s own truth', () => {
    expect(tabSrc).toContain('onShortSubmit?.(pointer ? submitPlan.shortUnits : null);');
    expect(tabSrc).toContain('onShortSubmit?: (shortUnits: number | null) => void;');
  });

  it('the drill holds the echo \u2014 the state, the close\u2019s own wrapper, the one-home read', () => {
    expect(tabSrc).toContain('const [shortfallEcho, setShortfallEcho] = useState<number | null>(null);');
    // the close ends the arc by the close's OWN event (the wrapped
    // onOpenChange — never a setState-in-effect, the lint zero's law)
    expect(tabSrc).toContain('const closeDrill = useCallback(');
    expect(tabSrc).toContain('if (!v) setShortfallEcho(null);');
    expect(tabSrc).toContain('onOpenChange={closeDrill}');
    expect(tabSrc).toContain('closeDrill(false);');
    expect(tabSrc).toContain('const followUpEcho = receiveShortfallEcho(shortfallEcho);');
    expect(tabSrc).toContain('onShortSubmit={setShortfallEcho}');
  });

  it('the pill\u2019s paint deepens \u2014 the bolder ring when the echo lives, the census ring when not', () => {
    expect(tabSrc).toContain(
      "'ring-2 ring-inset ring-sky-400 dark:ring-sky-400/70'"
    );
    expect(tabSrc).toContain(
      "'ring-1 ring-inset ring-sky-300 dark:ring-sky-500/40'"
    );
  });

  it('the echo line speaks \u2014 CONDITIONALLY, under the pill, the door\u2019s own sky', () => {
    expect(tabSrc).toContain('data-testid="po-drill-followup-echo"');
    expect(tabSrc).toContain('{followUpEcho && (');
    expect(tabSrc).toContain(
      'className="mt-1 text-[10px] font-medium text-sky-700 dark:text-sky-400"'
    );
  });

  it('THE HONEST SILENCES \u2014 the echo lives inside the door\u2019s own block, never on a doorless card', () => {
    const pill = tabSrc.indexOf('{drillFollowUp && (');
    const echo = tabSrc.indexOf('data-testid="po-drill-followup-echo"');
    const blockEnd = tabSrc.indexOf(')}', echo);
    expect(pill).toBeGreaterThanOrEqual(0);
    expect(echo).toBeGreaterThan(pill);
    expect(blockEnd).toBeGreaterThan(echo);
  });
});
