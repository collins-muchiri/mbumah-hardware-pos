import { ApiRequestError } from '@/lib/error-handler';

/**
 * v2.403.0 — THE FAILURE'S NAME. A refund failure that arrives as an
 * ApiRequestError carries the typed RefundErrorCode in its parsed body
 * ({ success: false, code }) plus the server's human-readable line; the
 * desk speaks BOTH — the code badge names the failure's exact word, the
 * line speaks what it means. Anything else (network noise, a plain
 * Error, an unparseable body) answers null and the caller keeps its
 * generic fallback — an honest voice never invents a name the wire did
 * not speak. Exported for the kind suite's live truth table.
 */
export function refundFailureVoice(err: unknown): { code: string; line: string } | null {
  if (!(err instanceof ApiRequestError)) return null;
  const code = err.body?.code;
  const line = err.serverMessage?.trim();
  if (typeof code !== 'string' || code === '' || !line) return null;
  return { code, line };
}
