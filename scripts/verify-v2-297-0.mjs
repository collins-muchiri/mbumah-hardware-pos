#!/usr/bin/env node
// verify-v2-297-0.mjs — the round's gate (v2.297.0 "The drill names its deniers").
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
const test = read('src/tests/gate-actors-v297.test.ts');

console.log('— the release face —');
ok('pkg version = 2.297.0 (all three slots)', pkg.version === '2.297.0' && pkg.mbumah?.releaseVersion === '2.297.0' && pkg.mbumah?.baseVersion === '2.297.0');
ok('VERSION = 2.297.0', version === '2.297.0');
ok('whats-new lead = 2.297.0 with the round\u2019s title', feed.includes("version: '2.297.0',") && feed.includes('The drill names its deniers'));
const leadIdx = feed.indexOf("version: '2.297.0',");
const pairIdx = feed.indexOf("version: '2.296.0',");
ok('whats-new pair order (lead 2.297.0 before pair 2.296.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.297.0]', changelog.includes('## [2.297.0] The drill names its deniers'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-297-0'] === 'node scripts/verify-v2-297-0.mjs' && pkg.scripts['verify:v2-296-0'] === 'node scripts/verify-v2-296-0.mjs');

console.log('— the one home (lib) —');
ok('the anonymous word lives in the lib', lib.includes("export const DRILL_UNKNOWN_ACTOR = 'Unknown user';"));
ok('the DrillActor shape is exported', lib.includes('export interface DrillActor {') && lib.includes('email: string | null;') && lib.includes('role: string | null;') && lib.includes('permission: string | null;'));
ok('the ONE parse is exported and guarded', lib.includes('export function drillActorFromDetails(') && lib.includes('try {\n      source = JSON.parse(source);\n    } catch {\n      source = null;\n    }'));
ok('each word lands only as a non-empty string', lib.includes("typeof v === 'string' && v.trim().length > 0 ? v : null;"));
ok('the distinct count is exported', lib.includes('export function distinctActorEmails(') && lib.includes('if (actor.email) seen.add(actor.email);'));
ok('the voice is exported with the honesty law', lib.includes('export function gateDrillActorVoice(') && lib.includes('if (!Number.isFinite(actors) || actors <= 0) return null;') && lib.includes('if (shown >= total) {'));
ok('GateDrillEvent carries the details field typed unknown', lib.includes('details?: unknown;'));
ok('the lib stays import-free (the client-bundle law)', !/^import /m.test(lib));

console.log('— the actor faces (feature \u2464 + face \u2463) —');
ok('ONE parse feeds BOTH the rows and the aggregate — never two parses', tab.includes('const drillActors = drillRows.map((ev) => drillActorFromDetails(ev.details));') && tab.includes('distinctActorEmails(drillActors)') && tab.includes('const actor = drillActors[i];'));
ok('the aggregate line wears the drill\u2019s amber family with its testid', tab.includes('data-testid="gate-drill-actor-line"') && tab.includes('text-amber-700 dark:text-amber-400') && tab.includes('<Users className="h-3 w-3 shrink-0" aria-hidden="true" />'));
ok('the aggregate line is honest — spoken only when the voice has something', tab.includes('{actorVoice ? (') && tab.includes('<span className="truncate" title={actorVoice}>'));
ok('every row speaks its actor — email, role pill, permission pill', tab.includes('data-testid="gate-drill-actor-row"') && tab.includes('data-testid="gate-drill-actor-email"') && tab.includes('{actor.email || DRILL_UNKNOWN_ACTOR}') && tab.includes('{actor.role ? (') && tab.includes('{actor.permission ? ('));
ok('the pills wear the feed\u2019s own anatomy (role plain, permission mono)', tab.includes('rounded-full bg-muted text-muted-foreground shrink-0') && tab.includes('rounded-full bg-muted text-muted-foreground font-mono shrink-0'));
ok('the row\u2019s main line keeps its original faces — the actor line rides beneath', tab.includes('<div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">') && tab.includes('className="mt-0.5 flex items-center gap-1 flex-wrap min-w-0"'));
ok('the tab imports the actor pieces — never copies them', /import \{[^}]*drillActorFromDetails[^}]*DRILL_UNKNOWN_ACTOR[^}]*\} from '@\/lib\/security-feed';/s.test(tab) && !tab.includes('function drillActorFromDetails') && !tab.includes("const DRILL_UNKNOWN_ACTOR"));

console.log('— the v2.296.0 regression faces hold —');
ok('the walk\u2019s pieces are still exported', lib.includes('export const GATE_DRILL_PAGE_SIZE = 8;') && lib.includes('export function mergeDrillRows(') && lib.includes('export function gateDrillEarlierVoice('));
ok('the walk\u2019s wiring still rides the tab', tab.includes('const [drillExtra, setDrillExtra] = useState<GateDrillEvent[]>([]);') && tab.includes('setDrillExtra((prev) => mergeDrillRows(prev, next.events));') && tab.includes('{gateDrillEarlierVoice(walkRemaining)}'));
ok('the card\u2019s rows are still handles', tab.includes('aria-expanded={drilled}') && tab.includes('bg-amber-500/[0.06]'));
ok('Escape still closes the drill', tab.includes("if (e.key === 'Escape') setGateDrill(null);"));

console.log('— the suite (both nets) —');
ok('the parse\u2019s truth table is pinned by value', test.includes("email: 'cashier@mbumahhardware.co.ke',") && test.includes('drillActorFromDetails(\'{"role":\')') && test.includes('drillActorFromDetails(42)'));
ok('the distinct law is pinned by value', test.includes('expect(distinctActorEmails([actor(\'a@x.co.ke\'), actor(\'b@x.co.ke\'), actor(\'a@x.co.ke\')])).toBe(2);') && test.includes('expect(distinctActorEmails([actor(\'a@x.co.ke\'), actor(null), actor(null)])).toBe(1);'));
ok('the voice\u2019s honesty table is pinned by value', test.includes("'1 actor behind all 10 denials in this window.'") && test.includes("'3 actors behind all 10 denials in this window.'") && test.includes("'2 actors behind the first 8 of 10 denials shown.'") && test.includes('expect(gateDrillActorVoice(0, 8, 10)).toBeNull();'));
ok('the anonymous word is pinned', test.includes("DRILL_UNKNOWN_ACTOR = 'Unknown user'"));

console.log(`\nverify-v2-297-0: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
