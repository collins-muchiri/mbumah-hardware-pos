#!/usr/bin/env node
// verify-v2-299-0.mjs — the round's gate (v2.299.0 "The drill groups its actors").
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
const feedLib = read('src/lib/security-feed.ts');
const tab = read('src/app/(shell)/tabs/security-tab.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/gate-groups-v299.test.ts');

console.log('— the release face —');
ok('pkg version = 2.299.0 (all three slots)', pkg.version === '2.299.0' && pkg.mbumah?.releaseVersion === '2.299.0' && pkg.mbumah?.baseVersion === '2.299.0');
ok('VERSION = 2.299.0', version === '2.299.0');
ok('whats-new lead = 2.299.0 with the round\u2019s title', feed.includes("version: '2.299.0',") && feed.includes('The drill groups its actors'));
const leadIdx = feed.indexOf("version: '2.299.0',");
const prevIdx = feed.indexOf("version: '2.298.0',");
ok('whats-new pair order (lead 2.299.0 before pair 2.298.0)', leadIdx > -1 && prevIdx > leadIdx);
ok('CHANGELOG wears [2.299.0]', changelog.includes('## [2.299.0] The drill groups its actors'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-299-0'] === 'node scripts/verify-v2-299-0.mjs' && pkg.scripts['verify:v2-298-0'] === 'node scripts/verify-v2-298-0.mjs');

console.log('— the one home (lib) —');
ok('the grouping lens is exported with its shape', feedLib.includes('export function groupDrillRowsByActor(') && feedLib.includes('export interface GateDrillActorGroup {') && feedLib.includes('rows: number[];'));
ok('first-appearance order: named sections ride the insertion-order map', feedLib.includes('const named = new Map<string, { roles: string[]; rows: number[] }>();') && feedLib.includes('g.rows.push(i);'));
ok('the anonymous bucket is ONE bucket and walks LAST', feedLib.includes('if (unknownRows.length > 0) {') && feedLib.indexOf('const groups: GateDrillActorGroup[] = [...named.entries()].map(') < feedLib.indexOf('groups.push({'));
ok('the bucket speaks the vocabulary\u2019s one word, never an identity', feedLib.includes('key: DRILL_UNKNOWN_ACTOR,') && feedLib.includes('isUnknown: true,'));
ok('role words are distinct and first-seen-first', feedLib.includes('if (actor.role && !g.roles.includes(actor.role)) g.roles.push(actor.role);') && feedLib.includes('if (actor.role && !unknownRoles.includes(actor.role)) unknownRoles.push(actor.role);'));
ok('the lib stays import-free (the client-bundle law)', !/^import /m.test(feedLib));

console.log('— the faces (feature \u2465 + style \u2463) —');
ok('the tab imports the lens, never copies it', tab.includes('groupDrillRowsByActor,') && !tab.includes('function groupDrillRowsByActor'));
ok('the ONE parse still has exactly ONE call site', (tab.match(/drillActorFromDetails\(/g) || []).length === 1 && tab.includes('const drillGroups = groupDrillRowsByActor(drillActors);'));
ok('one row face, two lenses', tab.includes('const renderDrillRow = (ev: GateDrillEvent, i: number, showActor: boolean) => {') && tab.includes('{drillRows.map((ev, i) => renderDrillRow(ev, i, true))}') && tab.includes('{g.rows.map((idx) => renderDrillRow(drillRows[idx], idx, false))}'));
ok('grouped rows drop the actor line (the section speaks for them)', tab.includes('{showActor ? ('));
ok('the toggle is pressed-state honest and hides when there is nothing to group', tab.includes('data-testid="gate-drill-group-toggle"') && tab.includes('aria-pressed={drillGrouped}') && tab.includes('{drillRows.length > 0 ? ('));
ok('the toggle wears the amber family with the pressed fill', tab.includes("'bg-amber-500/20 text-amber-800 dark:text-amber-300'") && tab.includes("'bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20'"));
ok('the grouped section wears its spine and its amber count chip', tab.includes('data-testid="gate-drill-groups"') && tab.includes('border-l-2 border-amber-500/20') && tab.includes('bg-amber-500/10 text-amber-700 border-amber-500/20'));
ok('the anonymous header speaks in the muted voice', tab.includes("g.isUnknown ? 'text-muted-foreground' : 'text-foreground/80'"));
ok('the lens is view-only: the filing still consumes the LEDGER', tab.includes('const rows = mergeDrillRows(gateDrillQuery.data.events, drillExtra);') && !tab.includes('gateDrillToCsv(drillGroups') && (tab.match(/gateDrillToCsv\(/g) || []).length === 1);

console.log('— the suite (both nets) —');
ok('the order laws are pinned by value', test.includes("toEqual(['b@x.co.ke', 'a@x.co.ke'])") && test.includes('expect(groups[0].rows).toEqual([0, 2]);') && test.includes("toEqual(['a@x.co.ke', DRILL_UNKNOWN_ACTOR])"));
ok('the bucket + label + role laws are pinned', test.includes('expect(groups[0].roles).toEqual([\'CASHIER\', \'MANAGER\']);') && test.includes('expect(groups[0].label).toBe(groups[0].key);'));
ok('the byte wiring is pinned', test.includes('groupDrillRowsByActor,') && test.includes('const renderDrillRow = (ev: GateDrillEvent, i: number, showActor: boolean) => {') && test.includes('aria-pressed={drillGrouped}'));

console.log(`\nverify-v2-299-0: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
