// Core Security Module
// Input sanitization, CSRF validation, IP extraction, sensitive data masking,
// content-type validation, security event logging, request size validation

import { type NextRequest } from 'next/server';
import { systemLog } from './logger';
import { LogSeverity, LogComponent } from './types';

// a) sanitizeInput - hygiene-only string cleanup (SECURITY AUDIT FIX SEC-04)
//
// This function previously stripped SQL keywords (SELECT/INSERT/DROP/OR/AND
// patterns), HTML tags and event-handler fragments from every value, then
// HTML-entity-encoded the rest. That was both WRONG and UNSAFE:
//   • WRONG: it corrupted legitimate data - a product named "3M Drill AND
//     Bit" silently became "3M Drill  Bit", notes containing "drop" or an
//     apostrophe were mangled, and double-encoding (& -> &amp;) leaked into
//     stored strings rendered by React (which already escapes on output).
//   • UNSAFE as a defense: SQL injection is prevented by Prisma's
//     parameterized queries, XSS by React's output escaping + CSP. A
//     denylist regex adds no real protection while creating integrity bugs.
// NEW POLICY: keep only non-printable control-character removal (never
// legitimate POS text) and trim. Validation belongs in Zod schemas
// (src/lib/validations.ts); encoding belongs at the render boundary.

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  let sanitized = input;

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters (except newline, carriage return, tab)
  sanitized = sanitized.replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

// b) sanitizeObject - recursively sanitize all string values in an object

// Fields that should NOT be sanitized (passwords, tokens, hashes)
const SKIP_FIELDS = new Set(['password', 'passwordHash', 'token']);

export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeInput(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SKIP_FIELDS.has(key)) {
        result[key] = value;
      } else {
        result[key] = sanitizeObject(value);
      }
    }
    return result as T;
  }

  // Primitives (number, boolean, etc.) pass through
  return obj;
}

// c) isCSRFValid - validate CSRF token or Origin header

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.APP_URL,
].filter(Boolean);

export function isCSRFValid(request: NextRequest): boolean {
  const method = request.method.toUpperCase();

  // Safe methods - no CSRF check needed
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true;
  }

  // Check custom header X-CSRF-Token matching cookie csrf_token
  const csrfHeader = request.headers.get('X-CSRF-Token');
  const csrfCookie = request.cookies.get('csrf_token')?.value;

  if (csrfHeader && csrfCookie && csrfHeader === csrfCookie) {
    return true;
  }

  // Check Origin header
  const origin = request.headers.get('Origin');
  if (origin && ALLOWED_ORIGINS.length > 0 && ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // If no allowed origins configured, allow same-origin requests via Origin check
  const host = request.headers.get('Host');
  if (origin && host && origin.includes(host)) {
    return true;
  }

  // Fallback: check Referer header (some older browsers don't send Origin for same-origin)
  const referer = request.headers.get('Referer');
  if (referer && host) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host === host) {
        return true;
      }
    } catch {
      // Invalid URL - skip
    }
  }

  // Allow requests without Origin/Referer in development mode
  if (process.env.NODE_ENV === 'development' && !origin && !referer) {
    return true;
  }

  return false;
}

// d) getClientIp - extract client IP from request headers

export function getClientIp(request: NextRequest): string {
  // x-forwarded-for may contain multiple IPs; the first is the client
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'unknown';
}

// e) maskSensitiveData - mask sensitive data for logging / display

export function maskSensitiveData(data: string, type: 'email' | 'phone' | 'card' | 'token'): string {
  if (!data || typeof data !== 'string') return '***';

  switch (type) {
    case 'email': {
      const atIndex = data.indexOf('@');
      if (atIndex <= 0) return '***@***.***';
      const localPart = data.slice(0, atIndex);
      const domain = data.slice(atIndex);
      const maskedLocal = localPart.length > 1
        ? localPart[0] + '***'
        : '***';
      return maskedLocal + domain;
    }

    case 'phone': {
      const digits = data.replace(/\D/g, '');
      if (digits.length < 4) return '****';
      return '***' + digits.slice(-4);
    }

    case 'card': {
      const digits = data.replace(/\D/g, '');
      if (digits.length < 4) return '****';
      return '****' + digits.slice(-4);
    }

    case 'token': {
      if (data.length <= 4) return '****';
      return data.slice(0, 4) + '***';
    }

    default:
      return '***';
  }
}

// f) validateContentType - enforce application/json for write methods

export function validateContentType(request: NextRequest): boolean {
  const method = request.method.toUpperCase();

  // These methods don't require a body content-type check
  if (method === 'GET' || method === 'DELETE') {
    return true;
  }

  const contentType = request.headers.get('Content-Type');
  if (!contentType) return false;

  // Accept application/json (with optional charset etc.)
  return contentType.toLowerCase().includes('application/json');
}

// g) SecurityEvent enum and logSecurityEvent function

export enum SecurityEvent {
  RATE_LIMITED = 'RATE_LIMITED',
  CSRF_FAILED = 'CSRF_FAILED',
  BRUTE_FORCE = 'BRUTE_FORCE',
  INVALID_INPUT = 'INVALID_INPUT',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  SESSION_HIJACK_ATTEMPT = 'SESSION_HIJACK_ATTEMPT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
}

// Map security events to log severity
const EVENT_SEVERITY: Record<SecurityEvent, string> = {
  [SecurityEvent.RATE_LIMITED]: LogSeverity.WARN,
  [SecurityEvent.CSRF_FAILED]: LogSeverity.WARN,
  [SecurityEvent.BRUTE_FORCE]: LogSeverity.CRITICAL,
  [SecurityEvent.INVALID_INPUT]: LogSeverity.WARN,
  [SecurityEvent.SUSPICIOUS_ACTIVITY]: LogSeverity.ERROR,
  [SecurityEvent.ACCOUNT_LOCKED]: LogSeverity.ERROR,
  [SecurityEvent.SESSION_HIJACK_ATTEMPT]: LogSeverity.CRITICAL,
  [SecurityEvent.UNAUTHORIZED_ACCESS]: LogSeverity.WARN,
};

interface SecurityEventLogOptions {
  event: SecurityEvent;
  message: string;
  ipAddress?: string;
  userId?: string;
  storeId?: string;
  metadata?: Record<string, unknown>;
}

export async function logSecurityEvent(options: SecurityEventLogOptions): Promise<void> {
  try {
    await systemLog({
      action: options.event,
      component: LogComponent.AUTH,
      severity: EVENT_SEVERITY[options.event] || LogSeverity.WARN,
      message: options.message,
      ipAddress: options.ipAddress,
      userId: options.userId,
      storeId: options.storeId,
      metadata: options.metadata,
    });
  } catch {
    // Fallback to console if DB logging fails
    console.error('[SECURITY_EVENT_LOG_FAILURE]', options);
  }
}

// h) isRequestSizeValid - check Content-Length against a maximum

export function isRequestSizeValid(request: NextRequest, maxBytes: number = 1048576): boolean {
  const contentLength = request.headers.get('Content-Length');

  if (!contentLength) return true; // No Content-Length header - allow

  const length = parseInt(contentLength, 10);
  if (isNaN(length)) return true; // Unparseable - allow

  return length <= maxBytes;
}
