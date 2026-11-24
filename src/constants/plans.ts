import type { BillingCycle } from "@/types/commerce";

/** Plan prices and copy shared by Pricing, plan checkout, Settings → Billing and the mock API. Whole taka, VAT included. */
export const PRO_PRICE: Record<BillingCycle, number> = { monthly: 1900, yearly: 16800 };

/** What the yearly plan works out to per month (৳16,800 / 12). */
export const PRO_YEARLY_PER_MONTH = PRO_PRICE.yearly / 12;

/** The Pro feature list — Pricing and Settings must show the same one. */
export const PRO_FEATURES = [
  "All 48 courses",
  "Mentor review in 48h",
  "Guided learning paths",
  "Verifiable certificates",
  "Weekly live office hours",
  "Public portfolio page",
] as const;

/** Refunds can be requested this many days after paying (the "30-day money-back guarantee"). */
export const REFUND_WINDOW_DAYS = 30;

export const parseCycle = (value: string | null): BillingCycle => (value === "yearly" ? "yearly" : "monthly");

export const CYCLE_LABEL: Record<BillingCycle, string> = { monthly: "Monthly", yearly: "Yearly" };
