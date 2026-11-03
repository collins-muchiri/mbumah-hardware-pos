// THE ASK-TEXT SUITE (v2.377.0): the multiline sibling lands and the LAST
// native prompt retires.
//
// THE STORY: v2.376.0 retired the native prompt from the fifteen SEND
// flows; the payroll desk's void-reason ask was the PINNED survivor — a
// multi-line audit reason squeezed through a single-line native modal.
// This round the ask-dialog family grows its multiline sibling:
// useAskText() — the same resolver contract (trimmed string on confirm,
// null on cancel/Escape), a TEXTAREA face, the destructive tone for the
// actions whose weight is real, an optional required-voice, and the empty
// confirm riding the caller's own fallback byte-for-byte ('Voided by
// admin').
//
// This suite pins (1) the multiline behavior in a rendered harness
// (confirm / cancel / required / prefill / destructive / Enter-submit),
// and (2) THE ZERO-SURVIVOR CENSUS — the whole product tree carries no
// window.prompt call anywhere (the census the v2.376 suite handed over).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React, { useState } from 'react';
import { useAskText } from '@/components/send-prompt-dialog';

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
// 1. THE MULTILINE BEHAVIOR (rendered harness)
// ---------------------------------------------------------------------------

// A minimal harness: one button opens the ask, the resolution lands in
// state and speaks on the page — the exact contract every desk consumes.
function AskTextHarness({
  title = 'Void the pay run?',
  description,
  prefill,
  confirmLabel,
  destructive,
  required,
  requiredMessage,
}: {
  title?: string;
  description?: string;
  prefill?: string;
  confirmLabel?: string;
  destructive?: boolean;
  required?: boolean;
  requiredMessage?: string;
}) {
  const { ask, dialog } = useAskText();
  const [result, setResult] = useState<string>('PENDING');
  return (
    <div>
      <button
        onClick={() =>
          ask({ title, description, prefill, confirmLabel, destructive, required, requiredMessage })
            .then((v) => setResult(v === null ? 'CANCELLED' : `RESOLVED:${v}`))
        }
      >
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

describe('useAskText dialog behavior', () => {
  it('renders a TEXTAREA (the multiline audit voice) and resolves the trimmed value on confirm', async () => {
    render(<AskTextHarness prefill="  Deductions booked without earnings - superseded by corrected run  " />);
    await openAsk();
    const input = screen.getByTestId('ask-text-input');
    expect(input.tagName).toBe('TEXTAREA');
    await act(async () => {
      fireEvent.click(screen.getByTestId('ask-text-confirm'));
    });
    expect(screen.getByTestId('harness-result').textContent).toBe(
      'RESOLVED:Deductions booked without earnings - superseded by corrected run',
    );
    expect(screen.queryByTestId('ask-text-dialog')).toBeNull();
  });

  it('resolves null on cancel — the desk stays silent, as the user chose', async () => {
    render(<AskTextHarness />);
    await openAsk();
    await act(async () => {
      fireEvent.click(screen.getByTestId('ask-text-cancel'));
    });
    expect(screen.getByTestId('harness-result').textContent).toBe('CANCELLED');
    expect(screen.queryByTestId('ask-text-dialog')).toBeNull();
  });

  it('an EMPTY confirm rides the caller fallback (no required gate, no error) — the old prompt contract', async () => {
    render(<AskTextHarness prefill="" />);
    await openAsk();
    await act(async () => {
      fireEvent.click(screen.getByTestId('ask-text-confirm'));
    });
    expect(screen.getByTestId('harness-result').textContent).toBe('RESOLVED:');
    expect(screen.queryByTestId('ask-text-error')).toBeNull();
  });

  it('the required voice refuses an empty confirm with the inline error and the dialog STAYS', async () => {
    render(<AskTextHarness required prefill="   " />);
    await openAsk();
    await act(async () => {
      fireEvent.click(screen.getByTestId('ask-text-confirm'));
    });
    expect(screen.getByTestId('ask-text-error').textContent).toMatch(/cannot stay empty/);
    expect(screen.getByTestId('ask-text-dialog')).toBeTruthy();
    expect(screen.getByTestId('harness-result').textContent).toBe('PENDING');
    // a real line heals the error and resolves
    const input = screen.getByTestId('ask-text-input') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Superseded by the corrected run' } });
    });
    expect(screen.queryByTestId('ask-text-error')).toBeNull();
    await act(async () => {
      fireEvent.click(screen.getByTestId('ask-text-confirm'));
    });
    expect(screen.getByTestId('harness-result').textContent).toBe('RESOLVED:Superseded by the corrected run');
  });

  it('the required voice can speak its own message', async () => {
    render(<AskTextHarness required requiredMessage="The auditor reads this line." prefill="" />);
    await openAsk();
    await act(async () => {
      fireEvent.click(screen.getByTestId('ask-text-confirm'));
    });
    expect(screen.getByTestId('ask-text-error').textContent).toBe('The auditor reads this line.');
  });

  it('submits through Enter (the form) with the prefill honored', async () => {
    render(<AskTextHarness prefill="Deductions booked without earnings" />);
    await openAsk();
    const input = screen.getByTestId('ask-text-input') as HTMLTextAreaElement;
    expect(input.value).toBe('Deductions booked without earnings');
    const form = input.closest('form');
    expect(form).toBeTruthy();
    await act(async () => {
      fireEvent.submit(form as HTMLFormElement);
    });
    expect(screen.getByTestId('harness-result').textContent).toBe('RESOLVED:Deductions booked without earnings');
  });

  it('the destructive tone dresses the confirm and the caption speaks the action', async () => {
    render(
      <AskTextHarness
        destructive
        confirmLabel="Void pay run"
        description="Totals stay visible for audit; status becomes VOIDED."
      />,
    );
    await openAsk();
    const confirm = screen.getByTestId('ask-text-confirm');
    expect(confirm.textContent).toContain('Void pay run');
    expect(confirm.className).toMatch(/destructive/);
    // the description rides the dialog (the multiline prose voice)
    expect(screen.getByTestId('ask-text-dialog').textContent).toContain('status becomes VOIDED');
  });

  it('a re-ask while one is pending settles the old ask as null', async () => {
    let captured: string | null = 'SENTINEL-NOT-CALLED';
    function DoubleAskHarness() {
      const { ask, dialog } = useAskText();
      return (
        <div>
          <button onClick={() => { void ask({ title: 'first' }).then((v) => { captured = v; }); }}>
            ask-one
          </button>
          <button onClick={() => { void ask({ title: 'second' }); }}>
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
    // the dialog now belongs to the SECOND ask; confirm resolves it and closes
    const input = screen.getByTestId('ask-text-input') as HTMLTextAreaElement;
    await act(async () => {
      fireEvent.change(input, { target: { value: 'the second reason' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('ask-text-confirm'));
    });
    expect(screen.queryByTestId('ask-text-dialog')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 2. THE ZERO-SURVIVOR CENSUS (source, the living census handed over)
// ---------------------------------------------------------------------------

describe('the zero-survivor census', () => {
  it('the payroll desk carries no window.prompt call and consumes the ask-text dialog', () => {
    const src = readFileSync('src/app/(shell)/tabs/payroll-tab.tsx', 'utf8');
    expect(src).not.toMatch(/window\.prompt\(/);
    expect(src).toContain("from '@/components/send-prompt-dialog'");
    expect(src).toContain('useAskText()');
    // the void's own facts ride the ask (title speaks the run + period)
    expect(src).toContain('`Void the ${run.runType} pay run for ${run.periodName}?`');
    // the empty-confirm fallback is byte-identical (the mutation voice)
    expect(src).toContain("reason: reason.trim() || 'Voided by admin'");
  });

  it('the whole product tree carries ZERO window.prompt call sites (the retirement is complete)', () => {
    const srcRoot = join(process.cwd(), 'src');
    const callers = ['app', 'components', 'lib']
      .flatMap((sub) => walkSources(join(srcRoot, sub)))
      .filter((f) => /window\.prompt\(/.test(readFileSync(f, 'utf8')));
    expect(callers).toHaveLength(0);
  });

  it('the primitive speaks both siblings in one home', () => {
    const src = readFileSync('src/components/send-prompt-dialog.tsx', 'utf8');
    expect(src).toContain('export function useSendPrompt()');
    expect(src).toContain('export function useAskText()');
  });
});
