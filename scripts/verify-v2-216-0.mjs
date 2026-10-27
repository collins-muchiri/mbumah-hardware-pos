#!/usr/bin/env node
// verify-v2-216-0.mjs — the v2.216.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: the SECOND
// SHELF (the org desk banner mounts the shared switcher — the v2.215.0
// shelf law now both org shells wide), the THIRD CONSUMER (the desk
// slice modal's indicative strip — same observer, same guards, same
// family), the COUNT LAW (only money-voiced metrics convert), the
// zero-fetch law (three surfaces wide), and the release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.216.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const doors = read('src/components/org/desk-doors.tsx');
const orgConsole = read('src/components/workspace/org-console.tsx');
const chrome = read('src/components/org/chrome.tsx');
const row = read('src/components/org/kpi-row.tsx');
const switcher = read('src/components/currency-switcher.tsx');
const contrast = read('scripts/contrast-math-desk-strip-v2216.mjs');
const deskTest = read('src/tests/desk-strip-v2216.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the second shelf —');
ok('org-console imports the shared switcher', orgConsole.includes("import { CurrencySwitcher } from '@/components/currency-switcher';"));
ok('desk banner mounts it compact with the E2E hook', orgConsole.includes('triggerTestId="org-desk-currency-switcher"') && /<CurrencySwitcher\s+compact\s+triggerTestId="org-desk-currency-switcher"/.test(orgConsole));
ok('the shelf comment records the topology law', orgConsole.includes('SECOND SHELF') && orgConsole.includes('supply lives where the consumers live'));
ok('light-banner voices (no dark overrides needed on bg-background)', /<CurrencySwitcher[\s\S]*?className="h-8 px-2 text-\[11px\]"/.test(orgConsole));
ok('the console shelf stands untouched (v2.215.0)', chrome.includes('triggerTestId="console-currency-switcher"'));
ok('switcher still exposes the typed prop', /triggerTestId\?: string;/.test(switcher));

console.log('— the third consumer —');
ok('desk-doors imports the shared voice map + wire body', doors.includes("import { ADMIN_CURRENCY_RATES_QUERY_KEY, RATE_SOURCE_PHRASE, type RatesWireBody } from '@/components/currency-switcher';"));
ok('the observer is pure (enabled: false, never polled)', /const indicativeQuery = useQuery<RatesWireBody>([\s\S]*?)enabled: false,[\s\S]*?refetchInterval: false,/.test(doors));
ok('the queryFn exists only to say so', doors.includes("throw new Error('the org desk never fetches — it observes the shared currency cache');"));
ok('the desk never fetches (zero-fetch, three surfaces wide)', !doors.includes('fetch('));
const block = doors.slice(doors.indexOf('const deskIndicative = (() => {'), doors.indexOf('})();', doors.indexOf('const deskIndicative = (() => {')));
ok('count law gates FIRST', block.includes("if (metric.unit !== 'money') return null;") && block.indexOf("metric.unit !== 'money'") < block.indexOf("activeCurrency === 'KES'"));
ok('KES pivot guard', block.includes("if (activeCurrency === 'KES') return null;"));
ok('non-finite rate renders nothing', block.includes("if (!entry || typeof entry.kesToRate !== 'number' || !Number.isFinite(entry.kesToRate)) return null;"));
ok('unknown code renders nothing', block.includes('if (!meta) return null;'));
ok('figure = tile total × wire rate', block.includes('formatCurrency(total * entry.kesToRate, activeCurrency)'));
ok('provenance speaks the shared map', block.includes("RATE_SOURCE_PHRASE[entry.source] ?? 'wire rate'"));
ok('the speaking-fix destructure pattern holds', /const \{ currency: activeCurrency \} = useCurrency\(\);/.test(doors));
ok('all four strip testids present', ['org-desk-indicative-strip', 'org-desk-indicative-figure', 'org-desk-indicative-rate', 'org-desk-indicative-voice'].every((id) => doors.includes(`"${id}"`)));
ok('dark half from birth', /data-testid="org-desk-indicative-strip"[\s\S]*?dark:border-slate-700[\s\S]*?dark:bg-slate-800\/60/.test(doors));
ok('the honest tail names the metric noun', doors.includes('this strip does not change what the ${metric.noun} is.'));
ok('strip mounts after the headline meta', doors.indexOf('"org-desk-indicative-strip"') > doors.indexOf('`org-desk-meta-${metric.id}`'));

console.log('— the count law —');
ok('exactly two money-voiced metrics (revenue, debt)', (doors.match(/unit: 'money',/g) ?? []).length === 2);
ok('exactly four count-voiced metrics', (doors.match(/unit: 'count',/g) ?? []).length === 4);
ok('one strip mount (gated by unit, not per-metric families)', (doors.match(/org-desk-indicative-strip/g) ?? []).length === 1);
ok('kpi-row consumers stand untouched', row.includes('data-testid="debt-indicative-strip"') && row.includes('data-testid="revenue-indicative-strip"') && !row.includes('transactions-indicative'));

console.log('— the gates of record —');
ok('contrast script pins the desk grounds (white body, slate-900)', contrast.includes('composited over the modal') && contrast.includes('own WHITE body') && contrast.includes('SLATE900'));
ok('source-pin suite exists and pins the count law', deskTest.includes("unit: 'money'") && deskTest.includes('count-voiced'));

console.log('— the release face —');
ok('package.json 2.216.0 + mbumah block', pkg.version === '2.216.0' && pkg.mbumah.releaseVersion === '2.216.0' && pkg.mbumah.hotfix === 0);
ok('VERSION file 2.216.0', version === '2.216.0');
ok('verify:v2-216-0 wired', pkg.scripts['verify:v2-216-0'] === 'node scripts/verify-v2-216-0.mjs');
ok('whats-new head entry 2.216.0', whatsNew.indexOf("version: '2.216.0'") > -1 && whatsNew.indexOf("version: '2.216.0'") < whatsNew.indexOf("version: '2.215.0'"));
ok('CHANGELOG head entry [2.216.0]', changelog.includes('## [2.216.0]'));

console.log(`\n${pass} pass, ${failures} fail`);
process.exit(failures > 0 ? 1 : 0);
