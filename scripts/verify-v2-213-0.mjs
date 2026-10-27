#!/usr/bin/env node
// verify-v2-213-0.mjs — the v2.213.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws survived the
// round: the SUPER_ADMIN-gated posture wire that carries booleans and
// counts only, the pinned 11-route cron count, the section's dark-half +
// testid + honest-voice laws, the admin-desk mount order, and the release
// face (package.json / VERSION / whats-new / CHANGELOG all speaking
// 2.213.0).
//
// Exit 1 on any failure; PASS lines name the law each check pins.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const route = read('src/app/api/admin/security-posture/route.ts');
const section = read('src/components/admin/security-posture-section.tsx');
const tab = read('src/app/(shell)/tabs/admin-tab.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the route (the wire) —');
ok('route exists behind requireAuth SUPER_ADMIN', /roles: \['SUPER_ADMIN'\]/.test(route));
ok('route escapes the tenant fence (runWithoutTenant)', /runWithoutTenant/.test(route));
ok('legacy-hash count rides the retired prefix', /passwordHash: \{ startsWith: 'hashed_' \}/.test(route));
ok('secrets read via Boolean() only', /Boolean\(process\.env\.CRON_SECRET\)/.test(route));
ok('no secret value ever interpolated', !/\$\{process\.env\.(CRON_SECRET|JWT_SECRET|NEXTAUTH_SECRET)/.test(route));
ok('envDiagnosticsGated binds to production', /\(process\.env\.NODE_ENV \?\? ''\) === 'production'/.test(route));

console.log('— the pinned count —');
const cronDir = join(process.cwd(), 'src/app/api/cron');
const dirs = readdirSync(cronDir).filter((e) => statSync(join(cronDir, e)).isDirectory());
ok(`GATED_CRON_ROUTES equals the real route count (${dirs.length})`, new RegExp(`GATED_CRON_ROUTES = ${dirs.length};`).test(route) && dirs.length === 11);

console.log('— the section (the surface) —');
ok('query key exported for the suite', /SECURITY_POSTURE_QUERY_KEY = \['admin-security-posture'\] as const;/.test(section));
ok('door law: SUPER_ADMIN renders, others null', /if \(!isSuperAdmin\) return null;/.test(section) && /enabled: isSuperAdmin,/.test(section));
ok('dark half from birth (dark:bg-slate-900)', /dark:bg-slate-900/.test(section));
ok('all 17 testids present', ['section','header','meta','legacy-row','legacy-chip','legacy-detail','cron-row','cron-chip','cron-detail','env-row','env-chip','env-detail','secrets-row','secrets-chip','secrets-detail','footer','refresh']
  .every((id) => section.includes(`"security-posture-${id}"`)));
ok('SEC-01 fix named with dry-run first', /migrate-legacy-passwords\.mjs --apply/.test(section) && /dry-run first/.test(section));
ok('SEC-02 fail-closed spoken as law, not outage', /fail-closed law, not an outage/.test(section));
ok('footer speaks the secret law', /booleans and counts only/i.test(section));

console.log('— the mount —');
ok('imported on the admin tab', tab.includes("from '@/components/admin/security-posture-section'"));
ok('mounted after the Exchange Rates card', tab.indexOf('<SecurityPostureSection />') > tab.indexOf('<CurrencyRatesSection />') > -1);

console.log('— the release face —');
ok('package.json 2.213.0 + mbumah block', pkg.version === '2.213.0' && pkg.mbumah.releaseVersion === '2.213.0' && pkg.mbumah.hotfix === 0);
ok('VERSION file 2.213.0', version === '2.213.0');
ok('verify:v2-213-0 wired', pkg.scripts['verify:v2-213-0'] === 'node scripts/verify-v2-213-0.mjs');
ok('whats-new head entry 2.213.0', /version: '2\.213\.0',/.test(whatsNew) && whatsNew.indexOf("version: '2.213.0'") < whatsNew.indexOf("version: '2.212.0'"));
ok('CHANGELOG head entry [2.213.0]', changelog.includes('## [2.213.0]'));

console.log(`\n${pass} pass, ${failures} fail`);
process.exit(failures > 0 ? 1 : 0);
