import { addMonths } from "@/lib/dates";
import type { Subscription } from "@/types/account";
import type { BillingCycle } from "@/types/commerce";
import { createCollection } from "./store";

/**
 * Pro subscriptions for the mock API (localStorage `bxn-mock-subscriptions`). One record per user;
 * a user is Pro while `currentPeriodEnd` is in the future. `cancelAtPeriodEnd` = "active until…".
 * PROVISIONAL — replace with the backend's billing contract.
 */
export interface StoredSubscription {
  userEmail: string;
  plan: "pro";
  cycle: BillingCycle;
  startedAt: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

/** The demo student paid Pro monthly in July and August (see the seed orders), then let it lapse — so they start on Free. */
export const subscriptions = createCollection<StoredSubscription>("bxn-mock-subscriptions", () => [
  {
    userEmail: "hasibulx26@gmail.com",
    plan: "pro",
    cycle: "monthly",
    startedAt: "2026-07-01T10:00:00.000Z",
    currentPeriodEnd: "2026-09-01T10:00:00.000Z",
    cancelAtPeriodEnd: true,
  },
]);

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export const findSubscription = (email: string) => subscriptions.all().find((s) => same(s.userEmail, email));

/** Pro right now (including a cancelled plan that hasn't reached its end date yet). */
export const isPro = (email: string, now = new Date()) => {
  const s = findSubscription(email);
  return !!s && new Date(s.currentPeriodEnd) > now;
};

export const toSubscription = (email: string, now = new Date()): Subscription => {
  const s = findSubscription(email);
  if (!s || new Date(s.currentPeriodEnd) <= now) {
    return { plan: "free", status: "none", cycle: null, startedAt: null, currentPeriodEnd: null };
  }
  return {
    plan: "pro",
    status: s.cancelAtPeriodEnd ? "canceled" : "active",
    cycle: s.cycle,
    startedAt: s.startedAt,
    currentPeriodEnd: s.currentPeriodEnd,
  };
};

/** A paid plan order starts a fresh period (or replaces a lapsed one). */
export const startSubscription = (email: string, cycle: BillingCycle, now = new Date()) => {
  const record: StoredSubscription = {
    userEmail: email,
    plan: "pro",
    cycle,
    startedAt: now.toISOString(),
    currentPeriodEnd: addMonths(now, cycle === "yearly" ? 12 : 1).toISOString(),
    cancelAtPeriodEnd: false,
  };
  subscriptions.save([record, ...subscriptions.all().filter((s) => !same(s.userEmail, email))]);
  return record;
};

export const patchSubscription = (email: string, patch: Partial<Pick<StoredSubscription, "cycle" | "cancelAtPeriodEnd">>) =>
  subscriptions.update(
    (s) => same(s.userEmail, email),
    (s) => ({ ...s, ...patch })
  );

export const renameSubscriber = (from: string, to: string) =>
  subscriptions.update(
    (s) => same(s.userEmail, from),
    (s) => ({ ...s, userEmail: to })
  );

export const removeSubscriber = (email: string) => subscriptions.remove((s) => same(s.userEmail, email));

/** Test helper: back to the seed. */
export const resetMockBilling = () => subscriptions.reset();
