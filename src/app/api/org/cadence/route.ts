// GET/PUT /api/org/cadence — v2.241.0 THE WALK'S LAW
//
// The cadence thresholds become governable. GET returns the stored law
// (the pair the org map's cadence block and the branch picker's teeth
// both speak); PUT writes it as ONE pair from the owner's hand.
//
// THE WRITER LAW: only SUPER_ADMIN / STORE_OWNER put the law — a branch
// manager walks the floor, the owner writes the law. THE PAIR LAW: the
// body must be a coherent pair (both integers inside their bands,
// freshDays < windowDays) — half a law is rejected whole. THE AUDIT LAW:
// every write lands in the tamper-evident trail (CONFIG_CHANGE, the old
// pair and the new pair hashed) — the law changes on the record, or not
// at all. THE FALLBACK LAW (src/lib/cadence-law.ts): an unreadable or
// incoherent stored pair reads as the defaults 7/30 — yesterday's truth
// is the floor, never a thrown request.

import { type NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { withErrorBoundary, systemLog } from '@/lib/logger';
import { LogSeverity, LogComponent } from '@/lib/types';
import { withSessionAuth, MANAGER_PLUS_ROLES, OWNER_ROLES, type AuthSession } from '@/lib/auth';
import {
  CADENCE_LAW_KEYS,
  CADENCE_LAW_BOUNDS,
  CADENCE_LAW_DEFAULTS,
  isValidCadenceLaw,
  readCadenceLaw,
  type CadenceLaw,
} from '@/lib/cadence-law';

export const dynamic = 'force-dynamic';

async function upsertLawKey(key: string, value: string): Promise<void> {
  await db.systemConfig.upsert({
    where: { key },
    create: { key, value, description: 'The walk\'s law — the cadence thresholds the org map and the branch teeth speak (v2.241.0).' },
    update: { value },
  });
}

async function getHandler(..._args: unknown[]): Promise<Response> {
  const law = await readCadenceLaw(db);
  return Response.json({
    success: true,
    data: {
      ...law,
      bounds: CADENCE_LAW_BOUNDS,
      defaults: CADENCE_LAW_DEFAULTS,
    },
  });
}

async function putHandler(...args: unknown[]): Promise<Response> {
  const request = args[0] as NextRequest;
  const session = args[1] as AuthSession;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
  }
  const candidate = (body as Record<string, unknown>)?.law ?? body;
  // THE PAIR LAW: both integers inside their bands, freshDays strictly
  // below windowDays — the whole pair or nothing.
  if (!isValidCadenceLaw(candidate)) {
    return Response.json(
      {
        success: false,
        error: `The law must be a coherent pair: freshDays ${CADENCE_LAW_BOUNDS.freshDays.min}–${CADENCE_LAW_BOUNDS.freshDays.max}, windowDays ${CADENCE_LAW_BOUNDS.windowDays.min}–${CADENCE_LAW_BOUNDS.windowDays.max}, freshDays < windowDays.`,
      },
      { status: 400 },
    );
  }
  const law = candidate as CadenceLaw;
  const previous = await readCadenceLaw(db);

  await upsertLawKey(CADENCE_LAW_KEYS.freshDays, String(law.freshDays));
  await upsertLawKey(CADENCE_LAW_KEYS.windowDays, String(law.windowDays));

  // THE AUDIT LAW: the law changes on the record — old pair and new pair
  // hashed into the tamper-evident trail (best-effort: a trail outage
  // never un-writes a law the owner already spoke).
  try {
    const { auditTrail } = await import('@/lib/audit-trail');
    await auditTrail.log({
      action: 'CONFIG_CHANGE',
      resourceType: 'SystemConfig',
      resourceId: 'cadence',
      actorId: session.userId,
      oldValues: { freshDays: previous.freshDays, windowDays: previous.windowDays },
      newValues: { freshDays: law.freshDays, windowDays: law.windowDays },
    });
  } catch (error) {
    systemLog({
      action: 'CADENCE_LAW_AUDIT_FAILED',
      component: LogComponent.SYSTEM,
      severity: LogSeverity.WARN,
      message: `cadence law audit log failed: ${error instanceof Error ? error.message : 'unknown'}`,
      userId: session.userId,
    });
  }
  systemLog({
    action: 'CADENCE_LAW_UPDATE',
    component: LogComponent.SYSTEM,
    severity: LogSeverity.INFO,
    message: `cadence law updated: fresh ${previous.freshDays}→${law.freshDays}, window ${previous.windowDays}→${law.windowDays} by ${session.email}`,
    userId: session.userId,
  });

  return Response.json({ success: true, data: { ...law, bounds: CADENCE_LAW_BOUNDS } });
}

export const GET = withErrorBoundary(
  withSessionAuth(getHandler, MANAGER_PLUS_ROLES),
  'ORG_CADENCE_LAW',
);
export const PUT = withErrorBoundary(
  withSessionAuth(putHandler, OWNER_ROLES),
  'ORG_CADENCE_LAW',
);
