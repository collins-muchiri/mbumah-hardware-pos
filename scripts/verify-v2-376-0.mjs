#!/usr/bin/env node
// verify-v2-376-0.mjs — the round's FEATURE gate (v2.376.0 "the ask-dialog
// retires the native prompt"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// ask-dialog primitive's contract, the inline validation voices, the
// sunset census (fifteen sites / eight desks migrated, the payroll
// survivor pinned), and the desk render slots.
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const PRIM = read('src/components/send-prompt-dialog.tsx');
const SUITE = read('src/tests/send-prompt-dialog-v2376.test.tsx');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

const DESKS = {
  transactions: read('src/app/(shell)/tabs/transactions-tab.tsx'),
  customers: read('src/app/(shell)/tabs/customers-tab.tsx'),
  inventory: read('src/app/(shell)/tabs/inventory-tab.tsx'),
  delivery: read('src/app/(shell)/tabs/delivery-notes-tab.tsx'),
  invoices: read('src/app/(shell)/tabs/invoices-tab.tsx'),
  giftcards: read('src/app/(shell)/tabs/gift-cards-tab.tsx'),
  credits: read('src/app/(shell)/tabs/credits-tab.tsx'),
  vouchers: read('src/app/(shell)/tabs/vouchers-tab.tsx'),
};

console.log('— the ask-dialog primitive —');
ok('THE HOOK RETURNS THE { ask, dialog } CONTRACT',
  PRIM.includes('return { ask, dialog, open }'));
ok('THE ASK RESOLVES TRIMMED ON CONFIRM, NULL ON CANCEL',
  PRIM.includes('settle(trimmed)') && PRIM.includes('const cancel = useCallback(() => settle(null)'));
ok('THE INLINE ERROR IS THE VOICE (no toast dead-end)',
  PRIM.includes('data-testid="send-prompt-error"')
  && PRIM.includes('role="alert"')
  && PRIM.includes("if (error) setError(null)"));
ok('THE PHONE BAR IS SEVEN DIGITS, THE KENYAN SHAPES CLEAR IT',
  PRIM.includes('const PHONE_MIN_DIGITS = 7;')
  && PRIM.includes('const PHONE_SHAPE = /^\\+?[\\d\\s\\-()]*\\d[\\d\\s\\-()]*$/;'));
ok('THE EMAIL BAR CARRIES A DOMAIN',
  PRIM.includes('const EMAIL_SHAPE = /^\\S+@\\S+\\.\\S+$/;'));
ok('THE CHANNEL DRIVES THE INPUT TYPE AND THE ACCENT',
  PRIM.includes("WHATSAPP: { label: 'WhatsApp phone number', inputType: 'tel', placeholder: '+254712345678' }")
  && PRIM.includes("EMAIL: { label: 'Email address', inputType: 'email', placeholder: 'customer@example.com' }")
  && PRIM.includes("'text-green-700 bg-green-50 dark:bg-green-950/40'"));
ok('A RE-ASK SETTLES THE PENDING RESOLVER (no hung promise)',
  PRIM.includes('resolverRef.current?.(null); // a re-ask while one is pending settles the old one'));
ok('THE ERROR HEALS THE MOMENT THE VALUE CHANGES',
  PRIM.includes('aria-invalid={error ? true : undefined}'));

console.log('— the sunset census: fifteen sites / eight desks —');
for (const [name, src] of Object.entries(DESKS)) {
  ok(`${name} carries NO bare prompt( and consumes the ask-dialog`,
    !/(^|[^a-zA-Z_.])prompt\((['"`])/.test(src)
    && src.includes("from '@/components/send-prompt-dialog'")
    && src.includes('useSendPrompt()')
    && /\{\s*sendPromptDialog\s*\}/.test(src));
}
ok('the payroll void-reason prompt is the PINNED survivor',
  read('src/app/(shell)/tabs/payroll-tab.tsx').includes('window.prompt('));
ok('the voucher lambdas became named async handlers (an inline lambda cannot await an ask)',
  DESKS.vouchers.includes('async function askCampaignWhatsApp(campaign: VoucherCampaignItem)')
  && DESKS.vouchers.includes('async function askCampaignSms(campaign: VoucherCampaignItem)')
  && DESKS.vouchers.includes('async function askCampaignEmail(campaign: VoucherCampaignItem)'));
ok('the transactions callback deps carry the stable ask (no render churn)',
  DESKS.transactions.includes('[currentStoreId, askRecipient]'));

console.log('— the round\u2019s suite —');
ok('THE SUITE EXISTS AND SPEAKS THE ROUND', SUITE.includes('THE NATIVE-PROMPT SUNSET CENSUS'));
ok('THE SUITE TRUTH-TABLES THE HARNESS LIVE',
  SUITE.includes("expect(screen.getByTestId('harness-result').textContent).toBe('RESOLVED:+254712345678')"));
ok('THE SUITE PINS THE CANCEL CONTRACT',
  SUITE.includes("expect(screen.getByTestId('harness-result').textContent).toBe('CANCELLED')"));

console.log('— the release slots —');
ok('pkg version = VERSION', pkg.version === version);
ok('VERSION SPEAKS THE ROUND', version === '2.376.0');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
