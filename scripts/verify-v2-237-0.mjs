#!/usr/bin/env node
// verify-v2-237-0.mjs — the v2.237.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE WALK'S
// DOOR (the org cadence's rows become anchor doors — the slug law, the
// anchor law, the zero-fetch law, the aria voices), THE BRANCH'S
// ARRIVAL (the panel's one-shot ?countSheet= consume — the gate law,
// the own-shelf law, the quiet-URL law, the whisper + its silencing
// hands, the deferred house pattern), THE WALK'S PAPER (cadenceWalkCsv
// pure — BOM + CRLF + six columns + honest absences + csvCell quoting;
// the export button + its hide-on-empty law + the whole-order aria),
// and the fossil guards (the org cadence face, the coverage tile, the
// v2.220.0 tiles, the lineage/verdict doors, the picker's older laws,
// the kpi-row muted family stays 62). Plus the release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.237.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const map = read('src/components/org/variance-map.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const kpiRow = read('src/components/org/kpi-row.tsx');
const kpi = read('src/app/api/org/kpi-summary/route.ts');

const effect = panel.slice(panel.indexOf('if (!doorParam || doorConsumed.current) return;'), panel.indexOf('const invalidateSheets'));

console.log('— the release face —');
ok('package.json releaseVersion 2.237.0', pkg.mbumah.releaseVersion === '2.237.0');
ok('package.json baseVersion 2.237.0', pkg.mbumah.baseVersion === '2.237.0');
ok('package.json version 2.237.0', pkg.version === '2.237.0');
ok('VERSION 2.237.0', version === '2.237.0');
ok('verify gate wired', pkg.scripts['verify:v2-237-0'] === 'node scripts/verify-v2-237-0.mjs');
ok('previous gate still wired', pkg.scripts['verify:v2-236-0'] === 'node scripts/verify-v2-236-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.237.0',") && whatsNew.indexOf("version: '2.237.0',") < whatsNew.indexOf("version: '2.236.0',"));
ok('whats-new title speaks the walk\u2019s door', whatsNew.includes("title: 'The walk\\u2019s door',"));
ok('changelog anchors the section above its ancestor (headers, never bare strings)', changelog.indexOf('## [2.237.0]') >= 0 && changelog.indexOf('## [2.237.0]') < changelog.indexOf('## [2.236.0]'));

console.log('— the walk\u2019s door (variance-map) —');
ok('every row derives the door from the store\u2019s OWN slug', map.includes('const doorSlug = stores.find((s) => s.id === c.storeId)?.slug ?? null;'));
ok('a slug-less store holds no door (absent control never lies)', map.includes('{doorSlug && ('));
ok('the door is an anchor with the deep link (never a button, countSheet rides the href)', map.includes('data-testid={`cadence-door-${c.categoryId}`}') && map.includes('href={`/stores/${doorSlug}/inventory?countSheet=${c.categoryId}`}') && map.slice(map.indexOf('{doorSlug && ('), map.indexOf('</a>')).includes('<a'));
ok('the door\u2019s title names the law (org face points, branch face counts)', map.includes("title={`the org face points, the branch face counts — open ${c.name}'s count sheet at ${c.storeCode ?? c.storeName}`}"));
ok('the door\u2019s aria names the aisle and the branch', map.includes("aria-label={`start the walk on ${c.name} at ${c.storeCode ?? c.storeName} — opens the branch's count sheet with this aisle picked`}"));
ok('the door rides the 9px outline family with the amber focus ring', map.slice(map.indexOf('{doorSlug && ('), map.indexOf('</a>')).includes('text-[9px] font-semibold') && map.slice(map.indexOf('{doorSlug && ('), map.indexOf('</a>')).includes('focus-visible:outline-amber-500'));
ok('the door\u2019s dark half is from birth', map.slice(map.indexOf('{doorSlug && ('), map.indexOf('</a>')).includes('dark:border-slate-700') && map.slice(map.indexOf('{doorSlug && ('), map.indexOf('</a>')).includes('dark:hover:bg-slate-800'));

console.log('— the branch\u2019s arrival (stock-take-panel) —');
ok('the panel reads ?countSheet= one time at mount', panel.includes("new URLSearchParams(window.location.search).get('countSheet')") && panel.includes('const [doorParam] = useState('));
ok('the gate law: the drawer opens on the category scope before the wire lands', effect.includes("setCreateScope('category');") && effect.includes('setCreateOpen(true);') && effect.includes('if (list) {'));
ok('the own-shelf law: the aisle is pre-picked only when THIS store owns it', effect.includes('const hit = list.find((c) => c.id === doorParam);') && effect.includes('setCreateCategoryId(hit.id);'));
ok('a foreign id discards and the face returns to its own state', effect.includes("setCreateScope('full');") && effect.includes('setCreateOpen(false);'));
ok('the arrival speaks the days voice from the wire\u2019s own cadence', effect.includes('setDoorVoice(') && effect.includes('pickDaysVoice(hit.cadence)'));
ok('the quiet-URL law: the query is stripped after the consume', panel.includes("window.history.replaceState(null, '', window.location.pathname + window.location.hash)"));
ok('the one-shot law: a ref keeps the consume single by construction', panel.includes('const doorConsumed = useRef(false);') && panel.includes('doorConsumed.current = true;'));
ok('the whisper wears its testid and names the org\u2019s walk order', panel.includes('data-testid="stocktake-door-prefill"') && panel.includes('the org&apos;s walk order sent you here — {doorVoice}.'));
ok('the user\u2019s own hand silences the whisper (scope pair + category select)', panel.includes("onClick={() => { setCreateScope('full'); setDoorVoice(null); }}") && panel.includes("onClick={() => { setCreateScope('category'); setDoorVoice(null); }}") && panel.includes('onChange={(e) => { setCreateCategoryId(e.target.value); setDoorVoice(null); }}'));
ok('the deferred law: no setState runs synchronously inside the effect (house pattern)', effect.includes('window.setTimeout(') && effect.includes('return () => window.clearTimeout(t);'));

console.log('— the walk\u2019s paper (cadenceWalkCsv) —');
ok('the pure helper is exported beside the map', map.includes('export function cadenceWalkCsv(') && map.includes("import { SheetDrill, csvCell, type SheetDrillTarget } from './sheet-drill';"));
ok('six columns with the drill\u2019s laws (BOM + CRLF)', map.includes("'aisle,store,band,days_since,last_counted_at,skus'") && map.includes('join(\'\\r\\n\')') && map.includes('\\uFEFF'));
ok('the honest absences export as EMPTY cells', map.includes("r.daysSince != null ? r.daysSince : ''") && map.includes("r.lastCountedAt ?? ''"));
ok('the store falls back to its name only when the code is absent', map.includes('r.storeCode ?? r.storeName'));
ok('the export button rides the header and hides on a shelf-less cadence', map.includes('data-testid="cadence-export"') && map.includes('{cadence.categories.length > 0 && ('));
ok('the export feeds the wire\u2019s own rows (zero new reads)', map.includes('cadenceWalkCsv(cadence.categories)'));
ok('the aria names the whole-order law', map.includes('aria-label={`Download all ${cadence.categories.length} aisles as CSV — the walk order as the wire speaks it, blind spots first`}'));
ok('the file is named for the day it speaks for', map.includes('a.download = `walk-order-${new Date().toISOString().slice(0, 10)}.csv`;'));

console.log('— the fossil guards —');
ok('the org cadence face is untouched (block, chips, rows, cap note)', map.includes('data-testid="cadence-block"') && map.includes('data-testid={`cadence-chip-${band}`}') && map.includes('data-testid="cadence-cap-note"'));
ok('the coverage tile still speaks (the fifth tile)', map.includes('data-testid="variance-map-coverage"') && map.includes('Heard \u00b7 30d'));
ok('the v2.220.0 tiles, the lineage, and the verdict still speak', map.includes('data-testid="variance-map-open"') && map.includes('testId={`variance-map-lineage-${s.id}`}') && map.includes('onOpenSheet={(next) => setDrill(next)}'));
ok('the window figures and the indicative strip still speak', map.includes('data-testid="variance-map-impact"') && map.includes('data-testid="org-variance-indicative-strip"'));
ok('the cadence wire is untouched (constants, walk order)', kpi.includes('const CADENCE_FRESH_DAYS = 7;') && kpi.includes('cadenceCategories.sort((a, b) => {'));
ok('the picker\u2019s older laws hold (scope pair, store-scoped wire, server-side resolution)', panel.includes('data-testid="stocktake-scope-full"') && panel.includes('data-testid="stocktake-scope-category"') && panel.includes('includeProductCount=true&includeCadence=true'));
ok('the kpi-row muted family stays at exactly 62 mounts', (kpiRow.match(/text-slate-500 dark:text-slate-400/g) ?? []).length === 62);
ok('the changelog speaks the added + styled faces', changelog.slice(changelog.indexOf('## [2.237.0]'), changelog.indexOf('## [2.236.0]')).includes('### Added') && changelog.slice(changelog.indexOf('## [2.237.0]'), changelog.indexOf('## [2.236.0]')).includes('### Styled'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
