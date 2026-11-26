import type { PaymentMethod } from "./account";

/**
 * Records shared by the learner side (buy, submit, contact) and the admin side (refund, review, reply).
 * Provisional shapes for the mock API — replace with the backend contract when it is documented.
 */

export type OrderKind = "course" | "plan" | "donation" | "cart";

/** One course line of a cart order (F-004). */
export interface OrderItem {
  courseId: string;
  title: string;
  /** whole taka, before the order-level promo */
  price: number;
}
export type OrderStatus = "paid" | "pending" | "failed" | "refund_requested" | "refunded";
export type BillingCycle = "monthly" | "yearly";

export interface OrderRecord {
  id: string;
  /** null for anonymous donations */
  userEmail: string | null;
  userName: string;
  kind: OrderKind;
  /** course id, plan id ("pro" | "teams"), "donation" or "cart" */
  itemId: string;
  itemTitle: string;
  cycle?: BillingCycle;
  method: PaymentMethod;
  /** whole taka */
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string | null;
  status: OrderStatus;
  createdAt: string;
  refundReason?: string;
  /** masked payer account, e.g. "•••• 4242" (card) or "•••• 5678" (wallet) — added by F-002 Phase 2 */
  account?: string;
  /** cart orders only: every course bought (F-004) */
  items?: OrderItem[];
}

export interface Promo {
  code: string;
  percentOff: number;
  /** ISO date; null = never expires */
  expiresAt: string | null;
  /** null = unlimited */
  usageLimit: number | null;
  used: number;
  active: boolean;
}

export type SubmissionStatus = "pending" | "approved" | "changes_requested";

export interface Submission {
  id: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  moduleTitle: string;
  title: string;
  repoUrl: string;
  notes: string;
  submittedAt: string;
  status: SubmissionStatus;
  feedback: string | null;
  reviewer: string | null;
  reviewedAt: string | null;
}

export type TicketStatus = "open" | "replied" | "closed";

export interface TicketReply {
  from: "admin" | "user";
  message: string;
  at: string;
}

export interface Ticket {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  createdAt: string;
  status: TicketStatus;
  replies: TicketReply[];
}
