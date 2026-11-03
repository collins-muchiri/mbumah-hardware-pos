'use client';

// SendPromptDialog — the app's own ask-dialog (v2.376.0): the native
// window.prompt retires from every send flow.
//
// THE DISEASE: fifteen send flows across eight desks asked for the
// recipient phone (or email) through the browser-native window.prompt().
// A native prompt (a) is swallowed outright in embedded webviews — several
// merchants run this POS inside an in-app browser where prompt() returns
// null without ever showing a face; (b) returns null silently on the QA
// harness, so the button LOOKS dead; (c) cannot be validated, styled, or
// dark-mode themed; (d) gives zero inline feedback — the only failure
// voice was either silence (`if (!phone) return;`) or a toast after the
// fact.
//
// THE SHAPE: useSendPrompt() returns { ask, dialog }. `ask(opts)` opens
// the dialog and resolves with the TRIMMED value on confirm, or null on
// cancel/Escape — the exact contract of the old prompt() call, so every
// migration is a one-line swap plus one `{ask.dialog}` render. The dialog
// validates INLINE (no toast dead-ends): a phone must carry at least seven
// digits, an email must carry a domain. The channel drives the icon, the
// input type and the accent, matching the send buttons already on each
// desk (WhatsApp green, SMS blue, Email orange).

import { useCallback, useRef, useState } from 'react';
import { AlertCircle, Mail, MessageCircle, MessageSquare, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type SendPromptChannel = 'WHATSAPP' | 'SMS' | 'EMAIL';

export interface SendPromptOptions {
  /** The delivery channel — drives icon, input type and accent. */
  channel: SendPromptChannel;
  /** The dialog title; each desk speaks its own document voice. */
  title: string;
  /** Optional helper line under the title (muted, honest). */
  description?: string;
  /** The label above the input. Defaults to the channel's noun. */
  label?: string;
  /** Pre-filled recipient (the customer's known phone/email). */
  prefill?: string;
  /** Confirm-button caption. Defaults to `Send via <Channel>`. */
  confirmLabel?: string;
}

const CHANNEL_META: Record<
  SendPromptChannel,
  { label: string; inputType: 'tel' | 'email'; placeholder: string }
> = {
  WHATSAPP: { label: 'WhatsApp phone number', inputType: 'tel', placeholder: '+254712345678' },
  SMS: { label: 'SMS phone number', inputType: 'tel', placeholder: '+254712345678' },
  EMAIL: { label: 'Email address', inputType: 'email', placeholder: 'customer@example.com' },
};

// Lenient on purpose: +2547…, 07…, spaces and dashes all pass; the bar is
// "seven or more digits", which the Kenyan shapes (+2547XXXXXXXX, 07XXXXXXXX)
// clear and a stray keystroke does not.
const PHONE_SHAPE = /^\+?[\d\s\-()]*\d[\d\s\-()]*$/;
const PHONE_MIN_DIGITS = 7;
const EMAIL_SHAPE = /^\S+@\S+\.\S+$/;

export function validateSendRecipient(channel: SendPromptChannel, raw: string): string | null {
  const value = raw.trim();
  if (!value) {
    return channel === 'EMAIL'
      ? 'Enter an email address — the field cannot stay empty.'
      : 'Enter a phone number — the field cannot stay empty.';
  }
  if (channel === 'EMAIL') {
    if (!EMAIL_SHAPE.test(value)) return 'That does not look like an email address (expected name@domain).';
    return null;
  }
  if (!PHONE_SHAPE.test(value)) return 'A phone number carries digits only — no letters.';
  const digits = value.replace(/\D/g, '');
  if (digits.length < PHONE_MIN_DIGITS) {
    return `That number is too short — at least ${PHONE_MIN_DIGITS} digits (e.g. +254712345678).`;
  }
  return null;
}

export function useSendPrompt() {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<SendPromptOptions | null>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const resolverRef = useRef<((v: string | null) => void) | null>(null);

  const ask = useCallback((next: SendPromptOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      resolverRef.current?.(null); // a re-ask while one is pending settles the old one
      resolverRef.current = resolve;
      setOpts(next);
      setValue(next.prefill || '');
      setError(null);
      setOpen(true);
    });
  }, []);

  const settle = useCallback((result: string | null) => {
    setOpen(false);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(result);
  }, []);

  const cancel = useCallback(() => settle(null), [settle]);

  const confirm = useCallback(() => {
    if (!opts) return;
    const trimmed = value.trim();
    const invalid = validateSendRecipient(opts.channel, trimmed);
    if (invalid) {
      setError(invalid);
      return;
    }
    settle(trimmed);
  }, [opts, value, settle]);

  const meta = opts ? CHANNEL_META[opts.channel] : CHANNEL_META.WHATSAPP;
  const channelLabel = opts ? CHANNEL_META[opts.channel].label : '';
  const confirmCaption = opts?.confirmLabel || (opts ? `Send via ${opts.channel === 'WHATSAPP' ? 'WhatsApp' : opts.channel === 'SMS' ? 'SMS' : 'Email'}` : 'Send');
  const Icon = opts?.channel === 'EMAIL' ? Mail : opts?.channel === 'SMS' ? MessageSquare : MessageCircle;
  const iconTone =
    opts?.channel === 'EMAIL'
      ? 'text-orange-600 bg-orange-50 dark:bg-orange-950/40'
      : opts?.channel === 'SMS'
        ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40'
        : 'text-green-700 bg-green-50 dark:bg-green-950/40';

  const dialog = (
    <Dialog open={open} onOpenChange={(next) => { if (!next) cancel(); }}>
      <DialogContent className="sm:max-w-sm" data-testid="send-prompt-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {opts ? (
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${iconTone}`} aria-hidden="true">
                <Icon className="h-4 w-4" />
              </span>
            ) : null}
            {opts?.title || ''}
          </DialogTitle>
          {opts?.description ? (
            <DialogDescription className="text-xs leading-relaxed">{opts.description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); confirm(); }}
          className="space-y-2"
        >
          <Label htmlFor="send-prompt-input" className="text-xs font-medium">
            {opts?.label || channelLabel}
          </Label>
          <Input
            id="send-prompt-input"
            data-testid="send-prompt-input"
            type={meta.inputType}
            inputMode={meta.inputType === 'tel' ? 'tel' : 'email'}
            placeholder={meta.placeholder}
            value={value}
            onChange={(e) => { setValue(e.target.value); if (error) setError(null); }}
            autoFocus
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'send-prompt-error' : undefined}
            className="h-9"
          />
          {error ? (
            <p
              id="send-prompt-error"
              data-testid="send-prompt-error"
              role="alert"
              className="flex items-start gap-1.5 text-xs text-destructive"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : null}
          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              data-testid="send-prompt-cancel"
              onClick={cancel}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-8" data-testid="send-prompt-confirm">
              <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              {confirmCaption}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return { ask, dialog, open };
}
