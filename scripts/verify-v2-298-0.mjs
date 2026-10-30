#!/usr/bin/env node
// verify-v2-298-0.mjs — the round's gate (v2.298.0 "The drill files its ledger").
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
const filing = read('src/lib/gate-drill-csv.ts');
const feedLib = read('src/lib/security-feed.ts');
const tab = read('src/app/(shell)/tabs/security-tab.tsx');
const center = read('src/components/notification-center.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/gate-drill-csv-v298.test.ts');

console.log('— the release face —');
ok('pkg version = 2.298.0 (all three slots)', pkg.version === '2.298.0' && pkg.mbumah?.releaseVersion === '2.298.0' && pkg.mbumah?.baseVersion === '2.298.0');
ok('VERSION = 2.298.0', version === '2.298.0');
ok('whats-new lead = 2.298.0 with the round\u2019s title', feed.includes("version: '2.298.0',") && feed.includes('The drill files its ledger'));
const leadIdx = feed.indexOf("version: '2.298.0',");
const prevIdx = feed.indexOf("version: '2.297.0',");
ok('whats-new pair order (lead 2.298.0 before pair 2.297.0)', leadIdx > -1 && prevIdx > leadIdx);
ok('CHANGELOG wears [2.298.0]', changelog.includes('## [2.298.0] The drill files its ledger'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-298-0'] === 'node scripts/verify-v2-298-0.mjs' && pkg.scripts['verify:v2-297-0'] === 'node scripts/verify-v2-297-0.mjs');

console.log('— the one filing home (lib) —');
ok('the filing lib is its own module (the drill\u2019s ONE filing home)', filing.includes('export function gateDrillToCsv(') && filing.includes('export function gateDrillCsvFilename(') && filing.includes('export interface GateDrillCsvMeta {'));
ok('it imports the ONE escaper — never a second home for the guard', filing.includes("import { csvCell } from '@/lib/hr/digest-csv';") && !filing.includes('function csvCell'));
ok('it parses actors through the ONE door', filing.includes("import {\n  drillActorFromDetails,\n  DRILL_UNKNOWN_ACTOR,\n  type GateDrillEvent,\n} from '@/lib/security-feed';") && filing.includes('drillActorFromDetails(ev.details)'));
ok('the preamble speaks Report/Gate/Window/Rows/Generated', filing.includes("row(['Report', GATE_DRILL_CSV_REPORT_VOICE]);") && filing.includes("row(['Gate', meta.resource]);") && filing.includes("row(['Window', meta.windowLabel]);") && filing.includes("row(['Rows', rowsLine]);") && filing.includes("row(['Generated (UTC)', generatedAt.toISOString()]);"));
ok('the honesty line: complete reads "all N shown", unfinished names the slice', filing.includes('rows.length >= meta.total ? `all ${meta.total} shown` : `${rows.length} of ${meta.total} shown`'));
ok('RFC-4180: CRLF records, trailing CRLF', filing.includes("return lines.join('\\r\\n') + '\\r\\n';"));
ok('the name law: gate slug + window + UTC wall-date, never anonymous', filing.includes("return `mbumah-denials-${slug}-${windowLabel}-${stamp}.csv`;") && filing.includes("|| 'gate';"));

console.log('— the faces (feature \u2465 + style \u2463) —');
ok('the tab imports the ONE filing home', tab.includes("import { gateDrillToCsv, gateDrillCsvFilename } from '@/lib/gate-drill-csv';"));
ok('the button files the SAME rows the panel shows', tab.includes('const rows = mergeDrillRows(gateDrillQuery.data.events, drillExtra);') && tab.includes('const csv = gateDrillToCsv(rows, {') && tab.includes("total: gateDrillQuery.data.total,"));
ok('the button wears the drill\u2019s amber family and its testid, honest when empty', tab.includes('data-testid="gate-drill-csv"') && tab.includes('disabled={drillRows.length === 0}') && tab.includes('border-amber-500/30 bg-amber-500/10'));
ok('the Blob moves through the established download law', tab.includes("new Blob([csv], { type: 'text/csv; charset=utf-8' })") && tab.includes('anchor.download = gateDrillCsvFilename(gateDrill, gateRange);'));
ok('the drill row speaks the outcome in the feed\u2019s EXACT badge face', tab.includes('text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 uppercase tracking-wide') && center.includes('text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 uppercase tracking-wide'));

console.log('— one word, one home —');
ok('the feed\u2019s inline copy is gone — it imports the lib\u2019s word', center.includes('DRILL_UNKNOWN_ACTOR') && !center.includes("'Unknown user'") && !center.includes('"Unknown user"'));
ok('the lib owns the word (value + comment names both faces)', feedLib.includes("export const DRILL_UNKNOWN_ACTOR = 'Unknown user';") && feedLib.includes('v2.298.0 everywhere'));
ok('security-feed.ts stays import-free (the client-bundle law)', !/^import /m.test(feedLib));

console.log('— the suite (both nets) —');
ok('the preamble is pinned by value', test.includes("expect(lines[1]).toBe('Gate,/api/users');") && test.includes("expect(lines[3]).toBe('Rows,1 of 10 shown');"));
ok('the honesty table is pinned', test.includes("expect(csv).toContain('Rows,3 of 10 shown');") && test.includes("toContain('Rows,all 2 shown')"));
ok('the ledger order is pinned (never re-sorted)', test.includes("toEqual(['WARN', 'ERROR', 'INFO'])"));
ok('the anonymous + guard laws ride the file', test.includes('WARN,PERMISSION_DENIED,${DRILL_UNKNOWN_ACTOR},,,10.0.0.7,yes,') && test.includes("expect(csv).toContain(\"'=cmd|\");"));
ok('the filename is pinned', test.includes("mbumah-denials-api-users-24h-2026-10-31.csv") && test.includes("mbumah-denials-gate-24h-2026-10-31.csv"));

console.log(`\nverify-v2-298-0: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
