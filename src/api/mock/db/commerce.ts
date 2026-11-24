import type { OrderRecord, Promo, Submission, Ticket } from "@/types/commerce";
import { createCollection } from "./store";

/**
 * Shared mock records used by both the learner screens (F-002 Phase 2) and the admin screens (Phase 3):
 *  - orders      learner checkout / donations create them; admin views and refunds them
 *  - submissions learner submits projects; admin reviews them
 *  - promos      admin manages them; checkout validates against them
 *  - tickets     the contact form creates them; admin replies in the inbox
 * Change the shapes in src/types/commerce.ts, not here.
 */

const STUDENT = { email: "hasibulx26@gmail.com", name: "Mohammad Hasibul Hasan" };

export const orders = createCollection<OrderRecord>("bxn-mock-orders", () => [
  {
    id: "ORD-PRO-0801",
    userEmail: STUDENT.email,
    userName: STUDENT.name,
    kind: "plan",
    itemId: "pro",
    itemTitle: "Pro plan",
    cycle: "monthly",
    method: "bKash",
    subtotal: 1900,
    discount: 0,
    total: 1900,
    promoCode: null,
    status: "paid",
    createdAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "ORD-PRO-0701",
    userEmail: STUDENT.email,
    userName: STUDENT.name,
    kind: "plan",
    itemId: "pro",
    itemTitle: "Pro plan",
    cycle: "monthly",
    method: "bKash",
    subtotal: 1900,
    discount: 0,
    total: 1900,
    promoCode: null,
    status: "paid",
    createdAt: "2026-07-01T10:00:00.000Z",
  },
  {
    id: "ORD-JS-8412",
    userEmail: "mahin.k@outlook.com",
    userName: "Mahin Khan",
    kind: "course",
    itemId: "modern-javascript",
    itemTitle: "Modern JavaScript, Properly",
    method: "bKash",
    subtotal: 4900,
    discount: 0,
    total: 4900,
    promoCode: null,
    status: "paid",
    createdAt: "2026-11-20T08:20:00.000Z",
  },
  {
    id: "ORD-UX-8342",
    userEmail: "sabbir.i@gmail.com",
    userName: "Sabbir Islam",
    kind: "course",
    itemId: "ux-research",
    itemTitle: "UX Research in Five Days",
    method: "Card",
    subtotal: 3900,
    discount: 0,
    total: 3900,
    promoCode: null,
    status: "refund_requested",
    createdAt: "2026-11-18T14:05:00.000Z",
    refundReason: "The course level was too basic for me.",
  },
  {
    id: "ORD-DON-8395",
    userEmail: null,
    userName: "Anonymous",
    kind: "donation",
    itemId: "donation",
    itemTitle: "Support / fund contribution",
    method: "Nagad",
    subtotal: 499,
    discount: 0,
    total: 499,
    promoCode: null,
    status: "paid",
    createdAt: "2026-11-19T03:44:00.000Z",
  },
]);

export const promos = createCollection<Promo>("bxn-mock-promos", () => [
  { code: "LEARN20", percentOff: 20, expiresAt: null, usageLimit: null, used: 128, active: true },
  { code: "WELCOME10", percentOff: 10, expiresAt: "2026-10-31", usageLimit: 500, used: 412, active: true },
]);

/** Valid = active, not expired, under its usage limit. */
export const findValidPromo = (code: string, today = new Date()): Promo | undefined => {
  const p = promos.all().find((x) => x.code === code.trim().toUpperCase());
  if (!p || !p.active) return undefined;
  if (p.expiresAt && new Date(`${p.expiresAt}T23:59:59`) < today) return undefined;
  if (p.usageLimit !== null && p.used >= p.usageLimit) return undefined;
  return p;
};

export const submissions = createCollection<Submission>("bxn-mock-submissions", () => [
  {
    id: "SUB-1001",
    userEmail: "sumaiya.a@gmail.com",
    userName: "Sumaiya Akter",
    courseId: "java-generics",
    courseTitle: "Generics in Java — Basics to Advanced",
    moduleTitle: "Module 2 · Bounded Types",
    title: "Bounded container practice",
    repoUrl: "https://github.com/sumaiya/bounded-container",
    notes: "I used multiple bounds for the comparator — not sure the wildcard on line 42 is right.",
    submittedAt: "2026-11-24T09:36:00.000Z",
    status: "pending",
    feedback: null,
    reviewer: null,
    reviewedAt: null,
  },
  {
    id: "SUB-1002",
    userEmail: "rifat.h@gmail.com",
    userName: "Rifat Hossain",
    courseId: "java-generics",
    courseTitle: "Generics in Java — Basics to Advanced",
    moduleTitle: "Module 4 · Advanced & Real World",
    title: "Typed cache final project",
    repoUrl: "https://github.com/rifat/typed-cache",
    notes: "Final project. Eviction uses LRU.",
    submittedAt: "2026-11-23T10:00:00.000Z",
    status: "pending",
    feedback: null,
    reviewer: null,
    reviewedAt: null,
  },
  {
    id: "SUB-0990",
    userEmail: STUDENT.email,
    userName: STUDENT.name,
    courseId: "sql-query-to-model",
    courseTitle: "SQL From Query to Model",
    moduleTitle: "Final project",
    title: "Sales analytics model",
    repoUrl: "https://github.com/hasibul/sales-model",
    notes: "Star schema with window functions for the monthly report.",
    submittedAt: "2026-06-10T12:00:00.000Z",
    status: "approved",
    feedback: "Clean model and well-chosen indexes. Consider a date dimension instead of extracting months in every query.",
    reviewer: "Ayesha Rahman",
    reviewedAt: "2026-06-11T16:30:00.000Z",
  },
]);

export const tickets = createCollection<Ticket>("bxn-mock-tickets", () => [
  {
    id: "TCK-2041",
    name: "Nusrat Jahan",
    email: "nusrat.j@yahoo.com",
    topic: "Teams",
    message: "We want to train 8 analysts on SQL and Python. Can we get invoiced billing?",
    createdAt: "2026-11-23T05:10:00.000Z",
    status: "open",
    replies: [],
  },
  {
    id: "TCK-2037",
    name: "Rahim Hasan",
    email: "rahim@email.com",
    topic: "Billing",
    message: "I was charged twice for Modern JavaScript.",
    createdAt: "2026-11-21T11:00:00.000Z",
    status: "replied",
    replies: [{ from: "admin", message: "Sorry about that — the duplicate charge has been refunded.", at: "2026-11-21T13:20:00.000Z" }],
  },
]);

/** Test helper: back to the seed data. */
export const resetMockCommerce = () => {
  orders.reset();
  promos.reset();
  submissions.reset();
  tickets.reset();
};
