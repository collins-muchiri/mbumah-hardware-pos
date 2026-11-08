#!/usr/bin/env node
// verify-v2-215-0.mjs — the v2.215.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: the SHELF
// LAW (the console banner mounts the shared switcher — the rates cache's
// supply lives where its consumers live), the SECOND CONSUMER (the
// revenue modal's indicative strip — same guards, same family, lens-
// aware figure), the zero-fetch law (untouched by the shelf), the CHIP
// SWEEP (the EXPERTS surface's last red-600 stragglers join the armored
// family), and the daemon probe-before-spawn tidy. Release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.215.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const chrome = read('src/components/org/chrome.tsx');
const row = read('src/components/org/kpi-row.tsx');
const switcher = read('src/components/currency-switcher.tsx');
const experts = read('src/components/org/experts.tsx');
const daemon = read('scripts/ems-daemon-3200.cjs');
const contrast = read('scripts/contrast-math-experts-chips-v2215.mjs');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the shelf law —');
ok('console header imports the shared switcher', chrome.includes("import { CurrencySwitcher } from '@/components/currency-switcher';"));
ok('console header mounts it (compact, banner voices)', /<CurrencySwitcher\s+compact\s+triggerTestId="console-currency-switcher"/.test(chrome));
ok('trigger carries its E2E hook', chrome.includes('triggerTestId="console-currency-switcher"'));
ok('dark voices on the trigger (border-white/15 + slate-200 + hover)', chrome.includes('border-white/15') && /<CurrencySwitcher[\s\S]*?text-slate-200[\s\S]*?\/>/.test(chrome));
ok('the chrome comment records the SHELF LAW finding', chrome.includes('THE SHELF LAW') && chrome.includes('architecturally silent'));
ok('switcher exposes a typed triggerTestId prop', /triggerTestId\?: string;/.test(switcher));
ok('testid lands on the trigger button (typed spread)', /\{\.\.\.\(triggerTestId \? \{ 'data-testid': triggerTestId \} : \{\}\)\}/.test(switcher));
ok('shells still full-navigate (the finding stays true)', read('src/components/console/unified-console.tsx').includes("window.location.assign('/')"));

console.log('— the second consumer —');
const revBlock = row.slice(row.indexOf('const revenueIndicative = (() => {'), row.indexOf('})();', row.indexOf('const revenueIndicative = (() => {')));
ok('revenue strip computed exists', revBlock.length > 0);
ok('KES pivot guards first', revBlock.includes("if (activeCurrency === 'KES') return null;"));
ok('non-finite rate renders nothing', revBlock.includes("if (!entry || typeof entry.kesToRate !== 'number' || !Number.isFinite(entry.kesToRate)) return null;"));
ok('unknown currency code renders nothing', revBlock.includes('if (!meta) return null;'));
ok('figure follows the active lens (gross weekTotal)', revBlock.includes("lens === 'gross'") && revBlock.includes('k.revenue.weekTotal'));
ok('net face uses the grid\'s own ?? guard', revBlock.includes('k.revenue.netWeekTotal ?? k.revenue.weekTotal - (k.revenue.taxWeekTotal ?? 0)'));
ok('provenance speaks the shared map', revBlock.includes("RATE_SOURCE_PHRASE[entry.source] ?? 'wire rate'"));
ok('all four revenue testids present', ['revenue-indicative-strip', 'revenue-indicative-figure', 'revenue-indicative-rate', 'revenue-indicative-voice'].every((id) => row.includes(`"${id}"`)));
ok('dark half from birth (the family classes)', /data-testid="revenue-indicative-strip"[\s\S]*?dark:border-slate-700[\s\S]*?dark:bg-slate-800\/60[\s\S]*?<\/p>/.test(row));
ok('the family aria tail', row.includes('The ledger stays in KES — this strip does not change what the revenue is.'));
ok('count-voiced modal stays count-voiced', !row.includes('transactions-indicative'));

console.log('— the zero-fetch law (untouched by the shelf) —');
ok('the row still contains no fetch call', !row.includes('fetch('));
ok('the debt strip stands untouched', row.includes('const indicative = (() => {') && row.includes('{indicative && (') && row.includes('data-testid="debt-indicative-strip"'));
ok('the observer stays pure (enabled: false, never polled)', row.includes('enabled: false,') && row.includes('refetchInterval: false,'));

console.log('— the speaking fix (found live in the QA drive) —');
ok('kpi-row renames the hook currency field at the destructuring site', /const \{ currency: activeCurrency \} = useCurrency\(\);/.test(row));
ok('the bare mis-destructure is gone', !row.includes('const { activeCurrency } = useCurrency();'));
ok('the hook still returns the field as currency', read('src/hooks/use-currency.ts').includes('return { currency: activeCurrency, format, convert, switchCurrency, meta };'));

console.log('— the chip sweep —');
ok('severity badges speak the armored family', experts.includes("'border-red-200 text-red-700'") && experts.includes("'border-amber-200 text-amber-800'"));
ok("the quoted 'text-red-600' is gone from the EXPERTS surface", !experts.includes("'text-red-600'"));
ok('bucket badge re-voiced', experts.includes("c.bucket === 'DAYS_90_PLUS' ? 'border-red-200 text-red-700'"));
ok('OVERDUE badge re-voiced', experts.includes("c.status === 'OVERDUE' ? 'border-red-200 text-red-700'"));
ok('mpesa badge re-voiced', experts.includes("? 'border-amber-200 text-amber-800' : 'border-red-200 text-red-700'"));
ok('pctColor re-voiced', experts.includes("'text-emerald-700' : v >= 70 ? 'text-amber-700' : 'text-red-700'"));
ok('health triad unchanged', experts.includes("'text-emerald-700' : checks[key]?.status === 'warning' ? 'text-amber-700' : 'text-red-700'"));
ok('env badge voices unchanged', experts.includes("value.status === 'ok' ? 'text-emerald-700' : 'text-red-700'"));
ok('the contrast script of record pins the honest numbers', contrast.includes('CONSISTENCY re-voice') && contrast.includes("check('ERROR badge: red-700 on white (fixed)', token('red-700'), WHITE);"));

console.log('— the daemon tidy —');
ok('probes before spawning', daemon.includes('probeOnce') && daemon.includes('daemon already healthy on :3200'));
ok('three probes over the boot window', daemon.includes('for (let i = 0; i < 3; i += 1)'));
ok('still detached + unref (the sandbox survival law)', daemon.includes('detached: true') && daemon.includes('child.unref()'));

console.log('— the release face —');
ok('package.json 2.215.0 + mbumah block', pkg.version === '2.215.0' && pkg.mbumah.releaseVersion === '2.215.0' && pkg.mbumah.hotfix === 0);
ok('VERSION file 2.215.0', version === '2.215.0');
ok('verify:v2-215-0 wired', pkg.scripts['verify:v2-215-0'] === 'node scripts/verify-v2-215-0.mjs');
ok('whats-new head entry 2.215.0', whatsNew.indexOf("version: '2.215.0'") > -1 && whatsNew.indexOf("version: '2.215.0'") < whatsNew.indexOf("version: '2.214.0'"));
ok('CHANGELOG head entry [2.215.0]', changelog.includes('## [2.215.0]'));

console.log(`\n${pass} pass, ${failures} fail`);
process.exit(failures > 0 ? 1 : 0);
