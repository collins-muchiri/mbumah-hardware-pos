#!/usr/bin/env node
// verify-v2-289-0.mjs — the round's gate (v2.289.0 "The bell learns its key").
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
const hook = read('src/hooks/use-notification-hotkey.ts');
const sidebar = read('src/components/layout/app-sidebar.tsx');
const hrbell = read('src/components/layout/hr-shell-bell.tsx');
const help = read('src/components/keyboard-shortcuts-help.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/notification-hotkey-v289.test.ts');

console.log('— the release face —');
ok('pkg version = 2.289.0 (all three slots)', pkg.version === '2.289.0' && pkg.mbumah?.releaseVersion === '2.289.0' && pkg.mbumah?.baseVersion === '2.289.0');
ok('VERSION = 2.289.0', version === '2.289.0');
ok('whats-new lead = 2.289.0 with the round\u2019s title', feed.includes("version: '2.289.0',") && feed.includes('The bell learns its key'));
const leadIdx = feed.indexOf("version: '2.289.0',");
const pairIdx = feed.indexOf("version: '2.288.0',");
ok('whats-new pair order (lead 2.289.0 before pair 2.288.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.289.0]', changelog.includes('## [2.289.0] The bell learns its key'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-289-0'] === 'node scripts/verify-v2-289-0.mjs' && pkg.scripts['verify:v2-288-0'] === 'node scripts/verify-v2-288-0.mjs');

console.log('— the match law (physical N, browser chords excluded) —');
ok('the law lives on e.code (the mac \u00f1 trap refused)', hook.includes("e.code === 'KeyN'") && !hook.includes("e.key === 'n'"));
ok('meta and ctrl are excluded (never fight the browser)', hook.includes('!e.metaKey && !e.ctrlKey'));
ok('the hook claims the key before opening', hook.includes('e.preventDefault();'));
ok('the listener has its teardown', hook.includes("document.addEventListener('keydown', handleKeyDown)") && hook.includes("document.removeEventListener('keydown', handleKeyDown)"));
ok('the handler delegates to the pure predicate', hook.includes('if (!isNotificationHotkey(e)) return;'));
ok('the effect re-subscribes only on opener change', hook.includes('[onOpen]'));

console.log('— one key, two openers, never a copy —');
ok('the POS sidebar wires alt+N to its bell state', sidebar.includes("import { useNotificationHotkey } from '@/hooks/use-notification-hotkey';") && sidebar.includes('useNotificationHotkey(useCallback(() => setNotificationOpen(true), []));'));
ok('the HR header bell wires the SAME hook', hrbell.includes("import { useNotificationHotkey } from '@/hooks/use-notification-hotkey';") && hrbell.includes('useNotificationHotkey(useCallback(() => setOpen(true), []));'));
ok('no shell registers a toast-region chord of its own', !hook.includes("code === 'KeyT'"));

console.log('— the help row —');
ok('the Alt+N row exists with the bell icon', help.includes("{ keys: 'Alt+N', description: 'Open notifications', icon: Bell }"));
ok('the incumbent rows survive', help.includes("keys: '⌘K / Ctrl+K'") && help.includes("keys: 'F9'") && help.includes("keys: '? / Ctrl+/'"));
const bellIdx = help.indexOf("keys: 'Alt+N'");
ok('the row sits between the F-rows and Esc', bellIdx > help.indexOf("keys: 'F10'") && bellIdx < help.indexOf("keys: 'Esc'"));

console.log('— the suite (both nets) —');
ok('the round\u2019s suite truth-tables the predicate', test.includes("expect(isNotificationHotkey(ev({ metaKey: true }))).toBe(false);") && test.includes("expect(isNotificationHotkey(ev({ altKey: false }))).toBe(false);"));
ok('the suite pins the mac trap by pin', test.includes('code: \'KeyN\', altKey: true, metaKey: false, ctrlKey: false'));
ok('the suite pins both shell wirings', test.includes('useNotificationHotkey(useCallback(() => setNotificationOpen(true), []));') && test.includes('useNotificationHotkey(useCallback(() => setOpen(true), []));'));

console.log(`\nverify-v2-289-0: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
