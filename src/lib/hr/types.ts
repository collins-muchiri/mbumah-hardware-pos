// MBUMAH HARDWARE POS - EMS shared types (v2.18.5)
//
// Pure types shared between HR services, routes, and UI. No server imports.

import type { PlatformRole } from './roles';

/** Masked PII presentation used by every HR response. */
export const HR_PII_MASK = '[REDACTED]';

export interface HrEmployeeSummary {
  id: string;
  employeeCode: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  role: string;
  employmentType: string;
  status: string;
  hireDate: string;
  terminationDate: string | null;
  storeId: string;
  storeName?: string;
  reportingToId?: string | null;
  /** v2.113.0: present only when the list was queried with expiringWithinDays —
   * a count + a date, never document contents (spec: PII minimized). */
  expiringDocuments?: number;
  nearestExpiry?: string | null;
  /** v2.268.0: the roster's quiet bell — the linked login's presence, its role
   * and its active state. Role is not PII (the payroll tab's own picker speaks
   * it); the email and the raw relation never ride the list. portalLinked
   * false / portalRole null answers the honest silence — no linked login. */
  portalLinked?: boolean;
  portalRole?: string | null;
  /** v2.268.0: null when no login is linked; when linked, the login's active
   * state — a deactivated login keeps the chip but wears the closed voice
   * (the detail card's own words, spoken at roster distance). */
  portalActive?: boolean | null;
}

/** v2.267.0: the linked portal account, shaped for the detail wire. The
 *  relation itself never leaves the server — only this DTO does. */
export interface HrPortalUserDto {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
}

export interface HrEmployeeDetail extends HrEmployeeSummary {
  basicSalary?: number;
  houseAllowance?: number;
  transportAllowance?: number;
  medicalAllowance?: number;
  otherAllowances?: number;
  hourlyRate?: number | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  /** Present only when the caller holds hr.employee.unmask.pii. */
  nationalId?: string;
  kraPin?: string;
  nssfNumber?: string;
  nhifNumber?: string;
  payeExempt?: boolean;
  nssfExempt?: boolean;
  nhifExempt?: boolean;
  notes?: string | null;
  /** v2.267.0: the login bound to this employee (null = unlinked — the
   *  self-service portal has no door for them yet). */
  portalUser?: HrPortalUserDto | null;
}

export interface HrDocumentDto {
  id: string;
  employeeId: string;
  type: string;
  fileName: string;
  fileUrl?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  verificationStatus: string;
  notes?: string | null;
}

export interface HrApiError {
  success: false;
  error: string;
  code?: string;
}

export interface HrApiSuccess<T> {
  success: true;
  data: T;
}

export type HrApiResponse<T> = HrApiSuccess<T> | HrApiError;

export interface HrSessionContext {
  userId: string;
  role: PlatformRole | string;
  storeId: string | null;
  organizationId: string;
}
