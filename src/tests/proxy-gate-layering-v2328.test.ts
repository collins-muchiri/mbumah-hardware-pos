// THE GATE LEDGER (v2.328.0): the edge's layered pre-gates under guard.
//
// The proxy file's own header speaks the layer order — Rate limiting →
// Request size → CSRF → Content-Type → Auth → Response headers — but an
// order that lives only in a comment is an order a future edit can
// silently reorder. The Task 46/48 handovers named the layered-gate law
// (413 → 403 → 415 → 401/403 → 400-door) as the honest reading of every
// door probe: this file pins the three exported validators' verdict
// tables AND the source order itself, so the pre-gates stay both honest
// and sequenced.
//
// The validators are EXPORTED as of v2.328.0 (a read-only widening —
// zero behavior change, the edge law untouched). A plain-object request
// cast `as unknown as NextRequest` is the store-guard house pattern:
// each validator reads only method/headers/cookies.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import {
  isCSRFValid,
  isRequestSizeValid,
  validateContentType,
} from '@/proxy';
import type { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// the fake-request helper (the store-guard house pattern)
// ---------------------------------------------------------------------------

interface FakeReqInit {
  method?: string;
  headers?: Record<string, string>;
  csrfCookie?: string;
  origin?: string;
  referer?: string;
  host?: string;
}

function fakeReq(init: FakeReqInit = {}): NextRequest {
  const headers = new Headers(init.headers ?? {});
  if (init.origin !== undefined) headers.set('Origin', init.origin);
  if (init.referer !== undefined) headers.set('Referer', init.referer);
  if (init.host !== undefined) headers.set('Host', init.host);
  const req = {
    method: init.method ?? 'POST',
    headers,
    cookies: {
      get: (name: string) =>
        init.csrfCookie !== undefined && name === 'csrf_token'
          ? { value: init.csrfCookie }
          : undefined,
    },
  };
  return req as unknown as NextRequest;
}

// ---------------------------------------------------------------------------
// 1. THE CONTENT-TYPE GATE (415) — the verdict table
// ---------------------------------------------------------------------------

describe('validateContentType — the 415 gate', () => {
  it('a POST without a Content-Type is refused (the header-less write)', () => {
    expect(validateContentType(fakeReq({ method: 'POST' }))).toBe(false);
  });

  it('application/json passes; charset params and case ride along', () => {
    expect(validateContentType(fakeReq({ headers: { 'Content-Type': 'application/json' } }))).toBe(true);
    expect(
      validateContentType(fakeReq({ headers: { 'Content-Type': 'application/json; charset=utf-8' } }))
    ).toBe(true);
    expect(validateContentType(fakeReq({ headers: { 'Content-Type': 'APPLICATION/JSON' } }))).toBe(true);
  });

  it('non-JSON bodies are refused', () => {
    expect(validateContentType(fakeReq({ headers: { 'Content-Type': 'text/plain' } }))).toBe(false);
    expect(validateContentType(fakeReq({ headers: { 'Content-Type': 'multipart/form-data' } }))).toBe(false);
    expect(validateContentType(fakeReq({ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }))).toBe(
      false
    );
  });

  it('GET and DELETE pass untouched (no body law)', () => {
    expect(validateContentType(fakeReq({ method: 'GET' }))).toBe(true);
    expect(validateContentType(fakeReq({ method: 'DELETE' }))).toBe(true);
    expect(validateContentType(fakeReq({ method: 'get' }))).toBe(true);
  });

  it('PATCH and PUT are state-changing and gated', () => {
    expect(validateContentType(fakeReq({ method: 'PATCH' }))).toBe(false);
    expect(validateContentType(fakeReq({ method: 'PUT' }))).toBe(false);
    expect(validateContentType(fakeReq({ method: 'PATCH', headers: { 'Content-Type': 'application/json' } }))).toBe(
      true
    );
  });
});

// ---------------------------------------------------------------------------
// 2. THE SIZE GATE (413) — the verdict table
// ---------------------------------------------------------------------------

describe('isRequestSizeValid — the 413 gate', () => {
  const MAX = 1_048_576; // the 1MB ceiling the proxy speaks

  it('a bodyless write (no Content-Length) passes — the 415 gate owns it next', () => {
    expect(isRequestSizeValid(fakeReq({}), MAX)).toBe(true);
  });

  it('the boundary is inclusive: exactly 1MB passes, one byte more is refused', () => {
    expect(isRequestSizeValid(fakeReq({ headers: { 'Content-Length': String(MAX) } }), MAX)).toBe(true);
    expect(isRequestSizeValid(fakeReq({ headers: { 'Content-Length': String(MAX + 1) } }), MAX)).toBe(false);
  });

  it('a garbage Content-Length fails OPEN at this layer (the 415 gate is behind it)', () => {
    expect(isRequestSizeValid(fakeReq({ headers: { 'Content-Length': 'not-a-number' } }), MAX)).toBe(true);
  });

  it('small payloads pass', () => {
    expect(isRequestSizeValid(fakeReq({ headers: { 'Content-Length': '0' } }), MAX)).toBe(true);
    expect(isRequestSizeValid(fakeReq({ headers: { 'Content-Length': '1024' } }), MAX)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE CSRF GATE (403) — the verdict table
// ---------------------------------------------------------------------------

describe('isCSRFValid — the 403 gate', () => {
  it('safe methods bypass (GET/HEAD/OPTIONS)', () => {
    expect(isCSRFValid(fakeReq({ method: 'GET' }))).toBe(true);
    expect(isCSRFValid(fakeReq({ method: 'HEAD' }))).toBe(true);
    expect(isCSRFValid(fakeReq({ method: 'OPTIONS' }))).toBe(true);
  });

  it('a matching X-CSRF-Token header and csrf_token cookie passes', () => {
    expect(
      isCSRFValid(
        fakeReq({ headers: { 'X-CSRF-Token': 'tok-123' }, csrfCookie: 'tok-123' })
      )
    ).toBe(true);
  });

  it('a mismatching header and cookie falls through (no origin/referer → refused in tests)', () => {
    // NODE_ENV is `test` under vitest — the development bypass does not apply.
    expect(
      isCSRFValid(
        fakeReq({ headers: { 'X-CSRF-Token': 'tok-123' }, csrfCookie: 'other-token' })
      )
    ).toBe(false);
  });

  it('no header, no cookie, no origin/referer is refused in the test environment', () => {
    expect(isCSRFValid(fakeReq({}))).toBe(false);
  });

  it('the F9-6 exact-host law: same-host Origin passes, a lookalike does not', () => {
    expect(
      isCSRFValid(fakeReq({ origin: 'https://shop.example.co.ke', host: 'shop.example.co.ke' }))
    ).toBe(true);
    // the audit's own attack: origin CONTAINS the host but is not it
    expect(
      isCSRFValid(fakeReq({ origin: 'https://shop.example.co.ke.evil.io', host: 'shop.example.co.ke' }))
    ).toBe(false);
    // an unparseable Origin fails closed
    expect(isCSRFValid(fakeReq({ origin: 'not-a-url', host: 'shop.example.co.ke' }))).toBe(false);
  });

  it('a same-host Referer passes when no header/cookie spoke', () => {
    expect(
      isCSRFValid(fakeReq({ referer: 'https://shop.example.co.ke/console', host: 'shop.example.co.ke' }))
    ).toBe(true);
    expect(
      isCSRFValid(fakeReq({ referer: 'https://evil.io/console', host: 'shop.example.co.ke' }))
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. THE ORDER ITSELF — the layer sequence is under guard
// ---------------------------------------------------------------------------

describe('THE LAYER ORDER — the pre-gates stay sequenced', () => {
  const src = readFileSync('src/proxy.ts', 'utf8');

  it('the header comment names all six layers in order', () => {
    expect(
      src.includes('Layers: Rate limiting → Request size → CSRF → Content-Type → Auth → Response headers')
    ).toBe(true);
  });

  it('size (413) precedes CSRF (403) precedes content-type (415) precedes auth', () => {
    const size = src.indexOf('// Layer 2: Request Size Validation');
    const csrf = src.indexOf('// Layer 3: CSRF Protection');
    const ctype = src.indexOf('// Layer 4: Content-Type Validation');
    const auth = src.indexOf('// Layer 5: Authentication');
    expect(size).toBeGreaterThan(-1);
    expect(csrf).toBeGreaterThan(size);
    expect(ctype).toBeGreaterThan(csrf);
    expect(auth).toBeGreaterThan(ctype);
  });

  it('each gate answers its own status byte, in sequence (413 → 403 → 415 → 401)', () => {
    // anchors are UNIQUE gate voices: the host guard also speaks a 403
    // (`new Response('Invalid host.', …)`), so the CSRF gate is anchored
    // by its error text, not by a shared status byte.
    const s413 = src.indexOf('{ status: 413 }');
    const csrfText = src.indexOf('CSRF validation failed');
    const s415 = src.indexOf('{ status: 415 }');
    const s401 = src.indexOf('{ status: 401 }');
    expect(s413).toBeGreaterThan(-1);
    expect(csrfText).toBeGreaterThan(s413);
    expect(s415).toBeGreaterThan(csrfText);
    expect(s401).toBeGreaterThan(s415);
    // and the CSRF block's own answer is the 403 byte
    const csrfBlock = src.slice(csrfText, s415);
    expect(csrfBlock.includes('{ status: 403 }')).toBe(true);
  });

  it('the three validators are exported from the one home', () => {
    expect(src.includes('export function isCSRFValid')).toBe(true);
    expect(src.includes('export function isRequestSizeValid')).toBe(true);
    expect(src.includes('export function validateContentType')).toBe(true);
    // and the widening is annotated as read-only (the edge law untouched)
    expect(src.includes('THE GATE LEDGER')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE WORD'S OWN HOME — `po-status` lives where the collision law says
// ---------------------------------------------------------------------------

describe('the collision ledger — desk-prefixed words stay rare', () => {
  it('`po-status` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const p = `${dir}/${entry.name}`;
        if (entry.isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(entry.name)) {
          if (readFileSync(p, 'utf8').includes('po-status')) collected.push(p);
        }
      }
    };
    walk('src');
    expect(collected.sort()).toEqual(
      [
        'src/app/(shell)/tabs/purchase-orders-tab.tsx',
        'src/lib/tab-url.ts',
        'src/lib/whats-new.ts',
        'src/tests/po-status-deep-link-v2328.test.ts',
        'src/tests/proxy-gate-layering-v2328.test.ts',
      ].sort()
    );
  });

  it('the bare `?status=` word stays owned by the /hr/performance route', () => {
    // the v2.85.0 deep link lives on a DIFFERENT URL space; the shell's
    // roster never hears it (the desk-prefix law).
    const hrDesk = readFileSync('src/app/(shell)/hr/performance/page.tsx', 'utf8');
    expect(hrDesk.includes("get('status')?.toUpperCase()")).toBe(true);
    const poDesk = readFileSync('src/app/(shell)/tabs/purchase-orders-tab.tsx', 'utf8');
    expect(poDesk.includes("get('status')")).toBe(false);
  });
});
