#!/usr/bin/env node
// verify-v2-311-0.mjs — the round's FEATURE gate (v2.311.0 "The paper trail becomes walkable").
// The release MECHANICS (slots, VERSION, lead placement, CHANGELOG ordering,
// walk marks) live in verify-current.mjs now — the pin unwind (Task 27's
// standing item). This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const tabUrl = read('src/lib/tab-url.ts');
const shellPage = read('src/app/(shell)/page.tsx');
const mainApp = read('src/components/app/main-app.tsx');
const loginScreen = read('src/components/login-screen.tsx');
const route = read('src/app/api/transactions/route.ts');
const api = read('src/lib/api.ts');
const viewer = read('src/components/loyalty/receipt-view-dialog.tsx');
const desk = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const card = read('src/components/loyalty/loyalty-card.tsx');
const faceTest = read('src/tests/receipt-trail-v2311.test.ts');

console.log('— the URL grammar (tab-url.ts, pure and tested) —');
ok('the parser module exists with the three laws', tabUrl.includes('export function parseInitialTab(') && tabUrl.includes('export function parseInitialView<') && tabUrl.includes('export function buildTabSearch('));
ok('an unknown ?tab= never hijacks the desk (validated against the real list)', tabUrl.includes('(validTabs as readonly string[]).includes(tab)') && tabUrl.includes('? (tab as AppTab) : null'));
ok('the parse never throws (malformed search answers null / fallback)', tabUrl.includes('} catch {') && tabUrl.includes('return fallback;'));

console.log('— the boot read is ONE consumer (page.tsx, after rehydrate) —');
ok('consumeDeepLink shares the tested parser and validates against TAB_CONFIG', shellPage.includes("import { parseInitialTab } from '@/lib/tab-url';") && shellPage.includes('TAB_CONFIG.map((t) => t.id)'));
ok('the v2.111 consume-and-strip law is REPLACED (the param stays)', !shellPage.includes("sp.delete('tab')") && shellPage.includes('NO LONGER consumed-and-stripped'));
ok('order law voiced: the deep link lands AFTER rehydrate settles', shellPage.includes('the deep link is applied AFTER it settles'));

console.log('— the shell keeps the address bar speaking the desk —');
ok('main-app writes replaceState per tab change (never pushState)', mainApp.includes('buildTabSearch(window.location.search, activeTab)') && mainApp.includes("window.history.replaceState(null, '', next)"));
ok('main-app does NOT parse ?tab= itself (one consumer, not two)', !mainApp.includes('parseInitialTab'));
ok('the writer merges around other params (view= rides along)', tabUrl.includes('params.set(\'tab\', tab);'));

console.log('— the desk ask survives sign-in (the live QA catch) —');
ok('the login screen reads pathname + search at event time', loginScreen.includes("const search = typeof window !== 'undefined' ? window.location.search : '';") && loginScreen.includes("const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';"));
ok('the desk ask is rooted to the classic shell and wins like ?next=', loginScreen.includes("(pathname === '/' || pathname === '') && /[?&](tab|view)=/.test(search)") && loginScreen.includes('safeReturnPath(nextParam) ?? (deskAsk ? `/${search}` : postLoginRedirect(flaggedUser));'));

console.log('— the exact receipt lookup (route + client) —');
ok('the route reads receiptNumber and filters EXACTLY, store-scoped', route.includes("const receiptNumber = searchParams.get('receiptNumber') || '';") && route.includes('where.receiptNumber = receiptNumber;') && !route.includes('contains: receiptNumber'));
ok('the scoping law is voiced in the source', route.includes('ANDs with the storeId scoping above'));
ok('getByReceipt unwraps the envelope: first row or null, never a wrong receipt', api.includes("const query = new URLSearchParams({ receiptNumber, storeId, limit: '1' });") && api.includes('const rows = Array.isArray(res.data) ? res.data : [];') && api.includes('return rows[0] ?? null;'));

console.log('— the paper-trail viewer (three honest faces) —');
ok('the viewer component exists, branded and self-contained', viewer.includes('export function ReceiptViewDialog(') && viewer.includes("import { ReceiptDocument } from '@/components/receipt-print';"));
ok('fetches via getByReceipt, store-scoped from the app store', viewer.includes('transactionsApi.getByReceipt(receiptNumber, currentStoreId)') && viewer.includes('useAppStore((s) => s.currentStoreId)'));
ok('the stale-answer guard: the answer remembers WHICH receipt it answers', viewer.includes('answer && answer.forReceipt === receiptNumber') && viewer.includes('let cancelled = false'));
ok('loading face: aria-live + skeleton, derived not setState-in-effect', viewer.includes('aria-live="polite"') && viewer.includes(': { phase: \'loading\' };') && !viewer.includes('setState({ phase: \'loading\' })'));
ok('not-found face echoes the number with the why', viewer.includes('data-testid="receipt-view-not-found"') && viewer.includes('The receipt may predate refunds'));
ok('print + PDF ride the shared receipt utilities with contained errors', viewer.includes('printReceiptElement(RECEIPT_CONTENT_ID)') && viewer.includes('generateReceiptPdf(') && viewer.includes('[RECEIPT_PRINT_ERROR]'));

console.log('— both clawback surfaces speak (dead text becomes a button) —');
ok('the ledger\u2019s clawback reference chip is a real button (rose, focus ring)', desk.includes('data-testid={`clawback-receipt-link-${tx.id}`}') && desk.includes('focus-visible:ring-2 focus-visible:ring-rose-400'));
ok('the desk mounts ONE viewer with the desk context voice', desk.includes('context="clawback-desk"') && desk.includes('receiptNumber={receiptViewNumber}'));
ok('the card\u2019s receipt sub-line is a button threaded through onOpenReceipt', card.includes('onOpenReceipt?: (receiptNumber: string) => void;') && card.includes('data-testid={`loyalty-card-receipt-link-${tx.id}`}'));
ok('the card mounts the viewer with the card context voice', card.includes('context="clawback-card"'));
ok('the loyalty desk answers ?view= (validated, one writer per param)', desk.includes("parseInitialView(window.location.search, LOYALTY_SUB_TABS, 'tiers')") && desk.includes("if (typeof window === 'undefined') return 'tiers';"));

console.log('— the face test (the pins that hold this all) —');
ok('the v2.311 face test exists and covers the six faces', faceTest.includes("describe('v2.311.0 — the shell answers the address bar'") && faceTest.includes("describe('v2.311.0 — the receipt lookup is a precision tool'") && faceTest.includes("describe('v2.311.0 — the paper-trail viewer speaks three honest faces'") && faceTest.includes('both surfaces'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
