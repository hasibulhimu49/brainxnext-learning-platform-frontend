import type { BillingCycle } from "./commerce";

/*
 * Account, billing and learner-record shapes. PROVISIONAL: they come from the mock API until the
 * backend docs arrive — see docs/project/api-guidelines.md.
 */

export interface Profile {
  name: string;
  email: string;
  bio: string;
  portfolio: string;
  goal: string;
  /** ISO timestamp the account was created (null for older records) */
  memberSince: string | null;
}

/** GET /certificates/:id (public verify) and GET /me/certificates items */
export interface CertificateRecord {
  id: string;
  holder: string;
  courseId: string;
  course: string;
  /** ISO timestamp */
  issuedAt: string;
  mentor: string;
  /** lessons in the completed course */
  lessons: number;
}

export type PaymentMethod = "Card" | "bKash" | "Nagad";

export interface PromoResult {
  code: string;
  percentOff: number;
}

export type PlanId = "free" | "pro";

/**
 * GET /me/subscription. `plan: "free"` with `status: "none"` when there is no active Pro period.
 * `canceled` = Pro until `currentPeriodEnd`, then back to Free (can still be resumed).
 */
export interface Subscription {
  plan: PlanId;
  status: "none" | "active" | "canceled";
  cycle: BillingCycle | null;
  /** ISO timestamps; null on Free */
  startedAt: string | null;
  currentPeriodEnd: string | null;
}

export type NotificationKind = "submission" | "certificate" | "order";

/** GET /me/notifications item — derived from the user's submissions, certificates and orders */
export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** ISO timestamp */
  at: string;
  /** in-app link */
  to: string;
  read: boolean;
}

export const DIGEST_OPTIONS = ["Weekly", "Daily", "Never"] as const;
export type DigestFrequency = (typeof DIGEST_OPTIONS)[number];

/** GET|PATCH /me/preferences */
export interface NotificationPreferences {
  courseUpdates: boolean;
  assignments: boolean;
  recommendations: boolean;
  community: boolean;
  digest: DigestFrequency;
  desktop: boolean;
}
