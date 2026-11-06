#!/usr/bin/env node
// story-handover-v2426.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// thirty-second application; the archive-door copy stays claimed inside
// the codemod — fourteen surfaces, one home), applied by WRITE (fresh
// per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.425.0 leads the feed`
// blocks re-key to the v2.426.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the receipt's own words
// ('via {supplier}', 'call chip dials', 'goods are on the shelf').
//
// The archive-door suite carries its own block shape (the comment counts
// the stories' positions down the feed) — re-keyed here too, so the next
// round's codemod finds BOTH shapes in ONE home.
//
// THE ORDER LAW: the walk's version web re-keys the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape.
import { readFileSync, writeFileSync } from 'node:fs';

const SUITES = [
  'src/tests/bank-type-deep-link-v2387.test.ts',
  'src/tests/bank-mpesa-deep-link-v2388.test.ts',
  'src/tests/debt-status-deep-link-v2389.test.ts',
  'src/tests/debt-channel-deep-link-v2390.test.ts',
  'src/tests/exp-status-deep-link-v2391.test.ts',
  'src/tests/exp-type-deep-link-v2392.test.ts',
  'src/tests/msg-template-deep-link-v2393.test.ts',
  'src/tests/rep-type-deep-link-v2384.test.ts',
];

const OLD_BLOCK = [
  "describe('whats-new — v2.425.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.426.0');",
  "    // the lead's story hand-over (v2.425.0, the Task 111 law's",
  "    // thirty-first application): the head story is the hand-over's",
  "    // voice — the carried row knows its maker: the purchase-order",
  "    // desk's rows grew the per-row maker (OrderHandoffPoItem's own",
  "    // supplierName — the pocket's seed shape now ONE home for the",
  "    // dialog's state and the restock-sheet's picks too), the map",
  "    // reads it from the LIVE shelf's link (the envelope's names never",
  "    // feed it — a stale pocket cannot name a live order, the pre-pick's",
  "    // own law now per-row), the hand-built rows read the same link,",
  "    // and the sub-line wears the sky census family the strip's chip",
  "    // taught (po-row-supplier, the Truck icon, 'via {name}' —",
  "    // conditional: an unnamed row stays silent, never a fake via).",
  "    // The pre-pick's whole-order law is unchanged: every row the same",
  "    // maker and the pen still dresses itself; two makers and the rows",
  "    // simply speak their own names while the pen stays yours.",
  "    // The debt's story exits the head this round; the",
  "    // row's own maker carries the eye.",
  "    expect(head.title).toContain('maker');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('via {supplier}'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('stale pocket cannot name a live order'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('two makers'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.426.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.426.0');",
  "    // the lead's story hand-over (v2.426.0, the Task 111 law's",
  "    // thirty-second application): the head story is the hand-over's",
  "    // voice — the receipt names its maker: the receive dialog grew",
  "    // the maker chip (receive-supplier-chip, the sky census family",
  "    // the rows taught, the Truck icon, 'via {name}' — conditional:",
  "    // a wire without the maker stays silent, never a fake via) and",
  "    // the call door (receive-supplier-call — the tel: door gated on",
  "    // the maker's own phone, so a short delivery has its number",
  "    // exactly where the shortfall shows; the day's contact speaks",
  "    // through the title), the success toast names the day",
  "    // (receiveSuccessVoice's two faces — 'Items received and stock",
  "    // updated — {maker}'s goods are on the shelf', the old byte when",
  "    // the read found nothing), and the day's honest read lives in",
  "    // the receive's ONE home (receiveMaker: a trimmed non-empty name",
  "    // makes the maker, the whitespace and non-string arrivals read",
  "    // the absence — never a crash, never a dead dial).",
  "    // THE DOM'S LAW rode the same round: the detail's description",
  "    // stays phrasing content (the div-in-p hydration wound the",
  "    // opening burst caught is healed).",
  "    // The row-maker's story exits the head this round; the",
  "    // receipt's own maker carries the eye.",
  "    expect(head.title).toContain('receipt');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('via {supplier}'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('call chip dials'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('goods are on the shelf'))).toBe(true);",
  '  });',
  '});',
].join('\n');

// ── the archive-door suite's own shape (the fourteenth copy, still claimed) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARCHIVE_OLD = [
  '    // v2.425.0 hand-over: the lead tells the row-maker\u2019s story now; the',
  '    // debt\u2019s story lives one entry down, the shelf-door two, the',
  '    // supplier-rides three, the order-blocks four, the supplier-lens',
  '    // five, the drill-mirror six, the expected-day seven, the receive',
  '    // eight, the order-handover nine, the order-file ten, the',
  '    // order-list eleven, the org-desk twelve, the census-echoes',
  '    // thirteen, the census-speaks fourteen, the wire-answers fifteen,',
  '    // the desk-remembers sixteen, the branch-voice seventeen, the',
  '    // ghost-routes eighteen, the jump-door nineteen, the shares\u2019',
  '    // twenty, the archive-door story twenty-one — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.426.0');",
  "    expect(lead.title).toContain('maker');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('via {supplier}'))).toBe(true);",
].join('\n');
const ARCHIVE_NEW = [
  '    // v2.426.0 hand-over: the lead tells the receipt\u2019s story now; the',
  '    // row-maker\u2019s story lives one entry down, the debt\u2019s two, the',
  '    // shelf-door three, the supplier-rides four, the order-blocks',
  '    // five, the supplier-lens six, the drill-mirror seven, the',
  '    // expected-day eight, the receive nine, the order-handover ten,',
  '    // the order-file eleven, the order-list twelve, the org-desk',
  '    // thirteen, the census-echoes fourteen, the census-speaks',
  '    // fifteen, the wire-answers sixteen, the desk-remembers',
  '    // seventeen, the branch-voice eighteen, the ghost-routes',
  '    // nineteen, the jump-door twenty, the shares\u2019 twenty-one, the',
  '    // archive-door story twenty-two — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.426.0');",
  "    expect(lead.title).toContain('receipt');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('via {supplier}'))).toBe(true);",
].join('\n');

let files = 0, edits = 0;
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_BLOCK)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${suite} carries neither the v2.425.0 block nor the v2.426.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}

// the archive door's fourteenth copy (claimed inside the codemod — Task 117's law (d))
{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARCHIVE_NEW)) {
    console.log(`${ARCHIVE}: already handed over (idempotent no-op)`);
  } else if (!src.includes(ARCHIVE_OLD)) {
    console.error(`FAIL: ${ARCHIVE} carries neither the v2.425.0 block nor the v2.426.0 block`);
    process.exit(1);
  } else {
    src = src.split(ARCHIVE_OLD).join(ARCHIVE_NEW);
    writeFileSync(ARCHIVE, src);
    files++;
    edits++;
    console.log(`${ARCHIVE}: hand-over written (the fourteenth copy, claimed)`);
  }
}

console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
