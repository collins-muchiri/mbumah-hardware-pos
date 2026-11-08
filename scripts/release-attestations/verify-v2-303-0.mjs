#!/usr/bin/env node
// verify-v2-303-0.mjs — the round's gate (v2.303.0 "The tables get their keeper").
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
const viewLib = read('src/lib/hr/rate-table-view.ts');
const service = read('src/lib/hr/rate-table-service.ts');
const route = read('src/app/api/hr/rate-tables/route.ts');
const idRoute = read('src/app/api/hr/rate-tables/[id]/route.ts');
const page = read('src/app/(shell)/hr/rate-tables/page.tsx');
const hrPage = read('src/app/(shell)/hr/page.tsx');
const voiceLib = read('src/lib/hr/payroll/error-voice.ts');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/rate-table-keeper-v303.test.ts');

console.log('— the release face —');
ok('pkg version = 2.303.0 (all three slots)', pkg.version === '2.303.0' && pkg.mbumah?.releaseVersion === '2.303.0' && pkg.mbumah?.baseVersion === '2.303.0');
ok('VERSION = 2.303.0', version === '2.303.0');
ok('whats-new lead = 2.303.0 with the round\u2019s title', feed.includes("version: '2.303.0',") && feed.includes('The tables get their keeper'));
const leadIdx = feed.indexOf("version: '2.303.0',");
const prevIdx = feed.indexOf("version: '2.302.0',");
ok('whats-new pair order (lead 2.303.0 before pair 2.302.0)', leadIdx > -1 && prevIdx > leadIdx);
ok('CHANGELOG wears [2.303.0]', changelog.includes('## [2.303.0] The tables get their keeper'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-303-0'] === 'node scripts/verify-v2-303-0.mjs' && pkg.scripts['verify:v2-302-0'] === 'node scripts/verify-v2-302-0.mjs');

console.log('— the keeper (feature \u2465) —');
ok('the view lib carries the engine\u2019s window law', viewLib.includes('export function rateTableWindowCovers') && viewLib.includes('SAME window law on the client'));
ok('the known types include the engine\u2019s six', ['PAYE', 'PERSONAL_RELIEF', 'NSSF_TIER1', 'NSSF_TIER2', 'SHIF', 'HOUSING_LEVY'].every((t) => viewLib.includes(`'${t}'`)));
ok('the service owns BOTH mutations', service.includes('export async function createRateTable') && service.includes('export async function closeRateTable'));
ok('the insert guard runs the overlap law at WRITE time', service.includes('THE OVERLAP GUARD (engine parity, write-time)') && service.includes('rateTableWindowsIntersect(candidate, s)'));
ok('the close only shrinks a window', service.includes('a close cannot extend a window') && service.includes('The close date falls before the table began') && !service.includes('.delete('));
ok('every mutation audits (spec rule 15)', service.includes("action: 'RATE_TABLE_CREATED'") && service.includes("action: 'RATE_TABLE_CLOSED'") && service.includes('HrEntityType.RATE_TABLE'));
ok('the routes never touch Prisma for the mutations', [route, idRoute].every((r) => r.includes('rate-table-service') && !r.includes('db.rateTable.create') && !r.includes('db.rateTable.update')));
ok('the write routes gate hr.rate-table.manage', route.includes("export const POST = hrGuard('hr.rate-table.manage')") && idRoute.includes("export const PATCH = hrGuard('hr.rate-table.manage')"));
ok('GET answers ?scope=all (default untouched)', route.includes("url.searchParams.get('scope') === 'all'") && route.includes("hrGuard('hr.employee.read.own_branch', READ_ROLES)"));

console.log('— the management desk (style \u2463) —');
ok('the desk runs the SAME pure law (no second implementation)', page.includes("from '@/lib/hr/rate-table-view'") && page.includes('rateTableOverlapMap(tables ?? [])') && page.includes('rateTableStatus(t, now)'));
ok('the status faces name the word beside the color', page.includes('data-testid="rate-table-status"') && page.includes('Active') && page.includes('Scheduled') && page.includes('Closed'));
ok('the overlap badge carries the sibling count', page.includes('data-testid="rate-table-overlap"') && page.includes('Overlaps {tableOverlaps.length}'));
ok('write affordances gate on the reported role', page.includes("fetch('/api/auth/me'") && page.includes("role === 'SUPER_ADMIN'"));
ok('the create dialog edits full rows', page.includes('data-testid="rate-row-editor"') && page.includes('rateBps') && page.includes('relief') && page.includes('employerMatchBps'));
ok('the close dialog suggests the minimal shrink', page.includes('minimal shrink that clears'));
ok('the refusals speak verbatim (role=alert)', page.includes('j?.error ||') && page.includes('role="alert"'));
ok('the /hr tile carries its Manage door', hrPage.includes('data-testid="hr-rate-tables-door"') && hrPage.includes('href="/hr/rate-tables"'));

console.log('— the doors promoted —');
ok('the door map walks the promoted pair to the keeper', voiceLib.includes("RATE_TABLE_DESK_HREF = '/hr/rate-tables'") && voiceLib.includes("case 'RATE_TABLE_MISSING':") && voiceLib.includes("case 'OVERLAPPING_RATE_TABLES':"));
ok('the honest-null law names its promotion story', voiceLib.includes('PROMOTED to doors in v2.303.0') && voiceLib.includes('a null is a'));
ok('the three remaining nulls stay named', ['UNRESOLVED_DEPENDENCY', 'IMMUTABLE_STATUS', 'DUPLICATE_IDEMPOTENCY_KEY'].every((c) => voiceLib.includes(c)));
ok('the door lib stays PURE (one relative import)', (voiceLib.match(/^import /gm) || []).length === 1 && voiceLib.includes("from './types'"));

console.log('— the suite (both nets) —');
ok('the value net pins the touching-window engine parity', test.includes('BOTH answer for the boundary date'));
ok('the value net pins the legal back-to-back seam', test.includes('the legal versioning seam'));
ok('the byte net pins the custody chain', test.includes('the service owns BOTH mutations') && test.includes('the routes never touch Prisma'));
ok('the byte net pins the promoted doors', test.includes('the promoted doors walk to the keeper'));

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILED'}: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
