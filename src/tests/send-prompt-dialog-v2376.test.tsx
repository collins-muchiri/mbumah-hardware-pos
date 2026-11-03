// THE ASK-DIALOG SUITE (v2.376.0): the native window.prompt retires from
// every send flow.
//
// THE DISEASE: fifteen send flows across eight desks asked for the
// recipient through the browser-native prompt(). In embedded webviews
// (in-app browsers, the QA harness) prompt() returns null without ever
// showing a face — the button LOOKED dead, and the only failure voice was
// either silence (`if (!phone) return;`) or a toast after the fact.
//
// THE FIX: src/components/send-prompt-dialog.tsx — useSendPrompt() hands
// every desk { ask, dialog }; ask() resolves with the trimmed value on
// confirm, null on cancel/Escape; validation is INLINE (no toast
// dead-ends); the channel drives icon, input type and accent.
//
// This suite pins (1) the validation voices, (2) the dialog's real
// behavior in a rendered harness (confirm / cancel / inline error /
// prefill / Enter-submit), and (3) THE NATIVE-PROMPT SUNSET CENSUS — the
// eight migrated desks carry no bare prompt(). (The payroll void-reason
// survivor PIN of the original census retired in v2.377.0: the multiline
// sibling askText() landed, the survivor migrated, and the tree census
// now answers ZERO — the living census rides ask-text-dialog-v2377.)

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React, { useState } from 'react';
import { useSendPrompt, validateSendRecipient } from '@/components/send-prompt-dialog';

// Walk src/**/*.{ts,tsx} in pure Node (the DISPLAY-ARTIFACT law: never
// trust a shell-census read when a byte-exact file read will do).
function walkSources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walkSources(full));
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. THE VALIDATION VOICES (pure, no render)
// ---------------------------------------------------------------------------

describe('validateSendRecipient', () => {
  it('refuses an empty phone with the honest voice', () => {
    expect(validateSendRecipient('WHATSAPP', '   ')).toMatch(/cannot stay empty/);
    expect(validateSendRecipient('SMS', '')).toMatch(/cannot stay empty/);
  });

  it('refuses an empty email with its own voice', () => {
    expect(validateSendRecipient('EMAIL', '')).toMatch(/Enter an email address/);
  });

  it('refuses letters in a phone number', () => {
    expect(validateSendRecipient('WHATSAPP', '0712callme')).toMatch(/digits only/);
  });

  it('refuses a phone too short to be real', () => {
    expect(validateSendRecipient('SMS', '12345')).toMatch(/too short/);
    expect(validateSendRecipient('WHATSAPP', '+25471')).toMatch(/too short/);
  });

  it('accepts the Kenyan shapes', () => {
    expect(validateSendRecipient('WHATSAPP', '+254712345678')).toBeNull();
    expect(validateSendRecipient('SMS', '0712345678')).toBeNull();
    expect(validateSendRecipient('WHATSAPP', '+254 712 345 678')).toBeNull();
    expect(validateSendRecipient('SMS', '+254-712-345-678')).toBeNull();
  });

  it('refuses a malformed email and accepts a real one', () => {
    expect(validateSendRecipient('EMAIL', 'not-an-email')).toMatch(/does not look like an email/);
    expect(validateSendRecipient('EMAIL', 'a@b')).toMatch(/does not look like an email/);
    expect(validateSendRecipient('EMAIL', 'customer@example.com')).toBeNull();
  });

  it('trims surrounding whitespace before judging', () => {
    expect(validateSendRecipient('WHATSAPP', '  +254712345678  ')).toBeNull();
    expect(validateSendRecipient('EMAIL', '  customer@example.com ')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 2. THE DIALOG BEHAVIOR (rendered harness)
// ---------------------------------------------------------------------------

// A minimal harness: one button opens the ask, the resolution lands in
// state and speaks on the page — the exact contract every desk consumes.
function SendPromptHarness({
  channel,
  prefill,
  title = 'Send test document',
}: {
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL';
  prefill?: string;
  title?: string;
}) {
  const { ask, dialog } = useSendPrompt();
  const [result, setResult] = useState<string>('PENDING');
  return (
    <div>
      <button onClick={() => ask({ channel, title, prefill }).then((v) => setResult(v === null ? 'CANCELLED' : `RESOLVED:${v}`))}>
        open-ask
      </button>
      <span data-testid="harness-result">{result}</span>
      {dialog}
    </div>
  );
}

async function openAsk(): Promise<void> {
  await act(async () => {
    fireEvent.click(screen.getByText('open-ask'));
  });
}

describe('useSendPrompt dialog behavior', () => {
  it('resolves with the trimmed value on confirm', async () => {
    render(<SendPromptHarness channel="WHATSAPP" title="Send receipt via WhatsApp" />);
    await openAsk();
    const input = screen.getByTestId('send-prompt-input') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: '  +254712345678  ' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('send-prompt-confirm'));
    });
    expect(screen.getByTestId('harness-result').textContent).toBe('RESOLVED:+254712345678');
    // the dialog closes after settling
    expect(screen.queryByTestId('send-prompt-dialog')).toBeNull();
  });

  it('resolves null on cancel — the desk stays silent, as the user chose', async () => {
    render(<SendPromptHarness channel="SMS" />);
    await openAsk();
    await act(async () => {
      fireEvent.click(screen.getByTestId('send-prompt-cancel'));
    });
    expect(screen.getByTestId('harness-result').textContent).toBe('CANCELLED');
    expect(screen.queryByTestId('send-prompt-dialog')).toBeNull();
  });

  it('keeps the dialog open with the inline error on an empty confirm', async () => {
    render(<SendPromptHarness channel="WHATSAPP" />);
    await openAsk();
    await act(async () => {
      fireEvent.click(screen.getByTestId('send-prompt-confirm'));
    });
    const err = screen.getByTestId('send-prompt-error');
    expect(err.textContent).toMatch(/cannot stay empty/);
    // still open — the error is the voice, the dialog is the door
    expect(screen.getByTestId('send-prompt-dialog')).toBeTruthy();
    expect(screen.getByTestId('harness-result').textContent).toBe('PENDING');
  });

  it('heals the error as soon as the value changes', async () => {
    render(<SendPromptHarness channel="EMAIL" />);
    await openAsk();
    await act(async () => {
      fireEvent.click(screen.getByTestId('send-prompt-confirm'));
    });
    expect(screen.getByTestId('send-prompt-error')).toBeTruthy();
    const input = screen.getByTestId('send-prompt-input') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'customer@example.com' } });
    });
    expect(screen.queryByTestId('send-prompt-error')).toBeNull();
    await act(async () => {
      fireEvent.click(screen.getByTestId('send-prompt-confirm'));
    });
    expect(screen.getByTestId('harness-result').textContent).toBe('RESOLVED:customer@example.com');
  });

  it('prefills the recipient and submits through Enter (the form)', async () => {
    render(<SendPromptHarness channel="WHATSAPP" prefill="0712345678" />);
    await openAsk();
    const input = screen.getByTestId('send-prompt-input') as HTMLInputElement;
    expect(input.value).toBe('0712345678');
    const form = input.closest('form');
    expect(form).toBeTruthy();
    await act(async () => {
      fireEvent.submit(form as HTMLFormElement);
    });
    expect(screen.getByTestId('harness-result').textContent).toBe('RESOLVED:0712345678');
  });

  it('speaks the WHATSAPP voice: tel input and the WhatsApp caption', async () => {
    render(<SendPromptHarness channel="WHATSAPP" />);
    await openAsk();
    expect((screen.getByTestId('send-prompt-input') as HTMLInputElement).type).toBe('tel');
    expect(screen.getByTestId('send-prompt-confirm').textContent).toMatch(/Send via WhatsApp/);
  });

  it('speaks the SMS voice: tel input and the SMS caption', async () => {
    render(<SendPromptHarness channel="SMS" />);
    await openAsk();
    expect((screen.getByTestId('send-prompt-input') as HTMLInputElement).type).toBe('tel');
    expect(screen.getByTestId('send-prompt-confirm').textContent).toMatch(/Send via SMS/);
  });

  it('speaks the EMAIL voice: email input and the Email caption', async () => {
    render(<SendPromptHarness channel="EMAIL" />);
    await openAsk();
    expect((screen.getByTestId('send-prompt-input') as HTMLInputElement).type).toBe('email');
    expect(screen.getByTestId('send-prompt-confirm').textContent).toMatch(/Send via Email/);
  });

  it('a re-ask while one is pending settles the old ask as null', async () => {
    // two harnesses would be two dialogs; within one harness a second ask
    // replaces the pending resolver — the OLD promise must not hang.
    let captured: string | null = null;
    function DoubleAskHarness() {
      const { ask, dialog } = useSendPrompt();
      return (
        <div>
          <button onClick={() => { void ask({ channel: 'SMS', title: 'first' }).then((v) => { captured = v; }); }}>
            ask-one
          </button>
          <button onClick={() => { void ask({ channel: 'SMS', title: 'second' }); }}>
            ask-two
          </button>
          {dialog}
        </div>
      );
    }
    render(<DoubleAskHarness />);
    await act(async () => { fireEvent.click(screen.getByText('ask-one')); });
    await act(async () => { fireEvent.click(screen.getByText('ask-two')); });
    expect(captured).toBeNull();
    // the dialog now belongs to the SECOND ask; confirm resolves it and
    // closes — the old ask already settled null, the new one completes.
    const input = screen.getByTestId('send-prompt-input') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: '+254700000111' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('send-prompt-confirm'));
    });
    expect(screen.queryByTestId('send-prompt-dialog')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 3. THE NATIVE-PROMPT SUNSET CENSUS (source, the swallow-census precedent)
// ---------------------------------------------------------------------------

// The eight desks whose send flows asked through the native prompt. Each
// must (a) carry NO bare prompt( call any more and (b) consume the
// ask-dialog hook.
const MIGRATED_DESKS: string[] = [
  'src/app/(shell)/tabs/transactions-tab.tsx',
  'src/app/(shell)/tabs/customers-tab.tsx',
  'src/app/(shell)/tabs/inventory-tab.tsx',
  'src/app/(shell)/tabs/delivery-notes-tab.tsx',
  'src/app/(shell)/tabs/invoices-tab.tsx',
  'src/app/(shell)/tabs/gift-cards-tab.tsx',
  'src/app/(shell)/tabs/credits-tab.tsx',
  'src/app/(shell)/tabs/vouchers-tab.tsx',
];

describe('the native-prompt sunset census', () => {
  it.each(MIGRATED_DESKS)('%s carries no bare prompt() and consumes the ask-dialog', (file) => {
    const src = readFileSync(file, 'utf8');
    // the bare call form (prompt('...') / prompt(`...`)) — the disease.
    expect(src).not.toMatch(/(^|[^a-zA-Z_.])prompt\((['"`])/);
    // the hook is imported and mounted
    expect(src).toContain("from '@/components/send-prompt-dialog'");
    expect(src).toContain('useSendPrompt()');
    // the dialog element is rendered, not just created
    expect(src).toMatch(/\{\s*sendPromptDialog\s*\}/);
  });

  it('the payroll desk consumes the ask-text dialog (the survivor retired in v2.377.0)', () => {
    // The void-reason ask was the LAST native prompt in the product tree;
    // the multiline sibling (useAskText) migrated it. Pinned here so the
    // desk never regresses to the swallowed native modal.
    const src = readFileSync('src/app/(shell)/tabs/payroll-tab.tsx', 'utf8');
    expect(src).toContain("from '@/components/send-prompt-dialog'");
    expect(src).toContain('useAskText()');
    expect(src).toMatch(/\{\s*askTextDialog\s*\}/);
    expect(src).not.toContain('window.prompt(');
  });

  it('the whole src tree answers to exactly ZERO window.prompt call sites', () => {
    // The v2.376 census counted ONE survivor (payroll's void-reason ask);
    // v2.377.0's ask-text migration retired it. The census walks the
    // PRODUCT tree (src/app + src/components + src/lib) — the tests' own
    // prose mentions do not count as callers.
    const srcRoot = join(process.cwd(), 'src');
    const callers = ['app', 'components', 'lib']
      .flatMap((sub) => walkSources(join(srcRoot, sub)))
      .filter((f) => /window\.prompt\(/.test(readFileSync(f, 'utf8')));
    expect(callers).toHaveLength(0);
  });
});
