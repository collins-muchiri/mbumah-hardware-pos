#!/usr/bin/env node
// verify-v2-296-0.mjs — the round's gate (v2.296.0 "The drill learns to walk").
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const lib = read('src/lib/security-feed.ts');
const tab = read('src/app/(shell)/tabs/security-tab.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/gate-walk-v296.test.ts');

console.log('— the release face —');
ok('pkg version = 2.296.0 (all three slots)', pkg.version === '2.296.0' && pkg.mbumah?.releaseVersion === '2.296.0' && pkg.mbumah?.baseVersion === '2.296.0');
ok('VERSION = 2.296.0', version === '2.296.0');
ok('whats-new lead = 2.296.0 with the round\u2019s title', feed.includes("version: '2.296.0',") && feed.includes('The drill learns to walk'));
const leadIdx = feed.indexOf("version: '2.296.0',");
const pairIdx = feed.indexOf("version: '2.295.0',");
ok('whats-new pair order (lead 2.296.0 before pair 2.295.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.296.0]', changelog.includes('## [2.296.0] The drill learns to walk'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-296-0'] === 'node scripts/verify-v2-296-0.mjs' && pkg.scripts['verify:v2-295-0'] === 'node scripts/verify-v2-295-0.mjs');

console.log('— the one home (lib) —');
ok('the page size is the ONE constant', lib.includes('export const GATE_DRILL_PAGE_SIZE = 8;'));
ok('GateDrillEvent lives in the lib now', lib.includes('export interface GateDrillEvent {'));
ok('the merge is exported and pure', lib.includes('export function mergeDrillRows(') && lib.includes('const seen = new Set(existing.map((e) => e.id));'));
ok('the four voices are exported', ['gateDrillEarlierVoice', 'gateDrillShowEarlierLabel', 'gateDrillExhaustedVoice', 'gateDrillErrorVoice'].every((f) => lib.includes(`export function ${f}(`)));
ok('the voices are pinned bytes in the lib', lib.includes('`${remaining} earlier ${remaining === 1 ? \'denial\' : \'denials\'} in this window.`') && lib.includes('`Show ${count} earlier ${count === 1 ? \'denial\' : \'denials\'}`') && lib.includes("'The earlier denials did not load — try again.'"));

console.log('— the walk (feature \u2464 + face \u2463) —');
ok('the fetch walks: additive page param, one limit constant, page echoed back', tab.includes('  page = 1\n') && tab.includes('limit: String(GATE_DRILL_PAGE_SIZE),') && tab.includes('page: String(page),') && tab.includes("page: typeof json?.pagination?.page === 'number' ? json.pagination.page : page,"));
ok('the walk\u2019s ledger is state (extra rows, last page, loading, error)', tab.includes('const [drillExtra, setDrillExtra] = useState<GateDrillEvent[]>([]);') && tab.includes('const [drillPage, setDrillPage] = useState(1);') && tab.includes('const [drillLoading, setDrillLoading] = useState(false);') && tab.includes('const [drillError, setDrillError] = useState(false);'));
ok('the walk resets with its question (render-reset, no effect)', tab.includes('const [walkGate, setWalkGate] = useState(gateDrill);') && tab.includes('if (walkGate !== gateDrill || walkRange !== gateRange) {') && tab.includes('setDrillExtra([]);') && tab.includes('setDrillPage(1);'));
ok('the callback fetches the NEXT page with the same question', tab.includes('const showEarlierGateRows = useCallback(async () => {') && tab.includes('const next = await fetchGateDrill(gateDrill, gateRange, drillPage + 1);') && tab.includes('setDrillExtra((prev) => mergeDrillRows(prev, next.events));') && tab.includes('setDrillPage(drillPage + 1);'));
ok('the panel\u2019s rows are page 1 PLUS the walk, deduped', tab.includes('? mergeDrillRows(gateDrillQuery.data.events, drillExtra)') && tab.includes('const pageOneCount = gateDrillQuery.data?.events.length ?? 0;'));
ok('the arithmetic is computed once, in scope', tab.includes('const walkRemaining = drillData') && tab.includes('const walkToShow = Math.min(GATE_DRILL_PAGE_SIZE, walkRemaining);') && tab.includes('!!drillData && walkRemaining === 0 && drillData.total > GATE_DRILL_PAGE_SIZE;'));
ok('the button names its promise and wears the amber family', tab.includes('onClick={showEarlierGateRows}') && tab.includes('disabled={drillLoading}') && tab.includes('aria-busy={drillLoading || undefined}') && tab.includes("{drillLoading ? 'Loading\u2026' : gateDrillShowEarlierLabel(walkToShow)}") && tab.includes('border-amber-500/30 bg-amber-500/10') && tab.includes('hover:bg-amber-500/20') && tab.includes('disabled:opacity-60 disabled:cursor-not-allowed'));
ok('the spinner rides the loading face', tab.includes('<Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />'));
ok('the remaining count is LIVE; exhausted and failure faces speak the lib\u2019s words', tab.includes('{gateDrillEarlierVoice(walkRemaining)}') && tab.includes('{gateDrillExhaustedVoice(drillData.total)}') && tab.includes('{gateDrillErrorVoice()}') && tab.includes('text-red-600" role="status"'));
ok('walked-in rows announce themselves quietly', tab.includes('i >= pageOneCount') && tab.includes('animate-in fade-in slide-in-from-bottom-1 duration-500'));
ok('the tab imports the walk — never copies it', /import \{[^}]*mergeDrillRows[^}]*\} from '@\/lib\/security-feed';/.test(tab) && !tab.includes('interface GateDrillEvent {'));

console.log('— the v2.295.0 regression faces hold —');
ok('the drill voices are still pinned bytes in the lib', lib.includes('`No denial records at ${resource} right now — the ledger moved since the count.`') && lib.includes("`${count} ${count === 1 ? 'denial' : 'denials'} at ${resource} in the last ${windowLabel}.`"));
ok('the card\u2019s rows are still handles', tab.includes('aria-expanded={drilled}') && tab.includes("aria-controls={drilled ? 'gate-drill-panel' : undefined}") && tab.includes('bg-amber-500/[0.06]'));
ok('the drill query is still keyed by gate AND lens', tab.includes("queryKey: ['security-gate-drill', gateDrill, gateRange],") && tab.includes('enabled: !!gateDrill,'));
ok('Escape still closes the drill', tab.includes("if (e.key === 'Escape') setGateDrill(null);") && tab.includes("window.addEventListener('keydown', onKey);"));

console.log('— the suite (both nets) —');
ok('the merge law is pinned by value', test.includes("expect(merged.map((e) => e.id)).toEqual(['a', 'b', 'c', 'e']);") && test.includes("expect(merged.map((e) => e.id)).toEqual(['a', 'b']);"));
ok('the walk voices are pinned by value', test.includes("'22 earlier denials in this window.'") && test.includes("'1 earlier denial in this window.'") && test.includes("'Show 8 earlier denials'") && test.includes("'All 14 denials in this window are shown.'") && test.includes("'All 1 denial in this window is shown.'"));
ok('the failure voice is pinned by value', test.includes("'The earlier denials did not load — try again.'"));
ok('the page size is pinned', test.includes('expect(GATE_DRILL_PAGE_SIZE).toBe(8);'));

console.log(`\nverify-v2-296-0: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
