#!/usr/bin/env node
// verify-v2-214-0.mjs — the v2.214.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: the indicative
// strip reads the shared cache (never its own wire), stays lazy, renders
// nothing on silence, never replaces the KES-canonical total, speaks the
// shared provenance map, and owns its dark half from birth. Release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.214.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const row = read('src/components/org/kpi-row.tsx');
const switcher = read('src/components/currency-switcher.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the one-cache law —');
ok('row imports the shared key + provenance map', /import \{ ADMIN_CURRENCY_RATES_QUERY_KEY, RATE_SOURCE_PHRASE, type RatesWireBody \} from '@\/components\/currency-switcher';/.test(row));
ok('no inline key literal in the row', !/queryKey: \['admin-currency-rates'\]/.test(row));
ok('pure observer (enabled: false — never fetches)', /enabled: false,/.test(row));
ok('zero-fetch law: no fetch( in the row', !row.includes('fetch('));
ok('observer says why (the never-fetch queryFn)', /the debt ledger never fetches/.test(row));
ok('never polled (refetchInterval: false)', /refetchInterval: false,/.test(row));
ok('wire body type exported from the switcher', /export interface RatesWireBody/.test(switcher));

console.log('— the silence law —');
ok('KES pivot guards first', /if \(activeCurrency === 'KES'\) return null;/.test(row));
ok('non-finite rate renders nothing', /!Number\.isFinite\(entry\.kesToRate\)\) return null;/.test(row));
ok('unknown currency code renders nothing', /if \(!meta\) return null;/.test(row));
ok('strip JSX gated on the computed indicative', /\{indicative && \(/.test(row));

console.log('— the canonical law —');
ok('total keeps its literal + testid', /data-testid="debt-ledger-total"[^>]*>\{kes\(k\.debt\.total\)\}/.test(row));
ok('closing voice names the limit', /— indicative; the ledger stays in KES\./.test(row));
ok('aria-label speaks the full sentence', /this strip does not change what the debt is\./.test(row));

console.log('— the provenance law —');
ok('RATE_SOURCE_PHRASE exported with three phrases', /export const RATE_SOURCE_PHRASE: Record<string, string> = \{/.test(switcher) && /MANUAL: 'admin-set rate',/.test(switcher) && /API: 'API rate',/.test(switcher) && /STATIC: 'built-in rate',/.test(switcher));
ok('strip speaks the shared map', /RATE_SOURCE_PHRASE\[entry\.source\] \?\? 'wire rate'/.test(row));
ok('switcher usages moved to the export (no stale internal name)', !/(?<!RATE_)SOURCE_PHRASE\[/.test(switcher.replace(/RATE_SOURCE_PHRASE\[/g, '')));

console.log('— the surface —');
ok('all four testids present', ['debt-indicative-strip', 'debt-indicative-figure', 'debt-indicative-rate', 'debt-indicative-voice'].every((id) => row.includes(`"${id}"`)));
ok('dark half from birth', /dark:bg-slate-800\/60/.test(row) && /dark:text-slate-300/.test(row));

console.log('— the release face —');
ok('package.json 2.214.0 + mbumah block', pkg.version === '2.214.0' && pkg.mbumah.releaseVersion === '2.214.0' && pkg.mbumah.hotfix === 0);
ok('VERSION file 2.214.0', version === '2.214.0');
ok('verify:v2-214-0 wired', pkg.scripts['verify:v2-214-0'] === 'node scripts/verify-v2-214-0.mjs');
ok('whats-new head entry 2.214.0', whatsNew.indexOf("version: '2.214.0'") > -1 && whatsNew.indexOf("version: '2.214.0'") < whatsNew.indexOf("version: '2.213.0'"));
ok('CHANGELOG head entry [2.214.0]', changelog.includes('## [2.214.0]'));

console.log(`\n${pass} pass, ${failures} fail`);
process.exit(failures > 0 ? 1 : 0);
