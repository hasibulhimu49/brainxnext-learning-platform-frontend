import type { BillingCycle } from "@/types/commerce";

/** Plan prices and copy shared by Home, Pricing, plan checkout, Settings → Billing and the mock API. Whole taka, VAT included. */
export const PRO_PRICE: Record<BillingCycle, number> = { monthly: 1900, yearly: 16800 };

/** What the yearly plan works out to per month (৳16,800 / 12). */
export const PRO_YEARLY_PER_MONTH = PRO_PRICE.yearly / 12;

/** Yearly saving against twelve monthly payments, in whole percent (৳16,800 vs ৳22,800 → 26). */
export const PRO_YEARLY_SAVING_PCT = Math.round((1 - PRO_PRICE.yearly / (PRO_PRICE.monthly * 12)) * 100);

/**
 * The Pro feature list — Home, Pricing, plan checkout and Settings show the same one.
 * No course counts here: pages that know the catalog put the real number in front (see `proFeatures`).
 */
export const PRO_FEATURES = [
  "Every course, free and paid",
  "Mentor review in 48h",
  "Verifiable certificates",
  "Weekly live office hours",
] as const;

/** What a free account gets. Career roadmaps and handbooks are open to everyone, so they are not a Pro perk. */
export const FREE_FEATURES = ["All free courses, every lesson", "All handbooks & notes", "Career roadmaps", "Progress tracking"] as const;

/** What the free tier does not include (greyed out on Pricing). */
export const FREE_EXCLUDED = ["Mentor review", "Certificates"] as const;

/** Teams is priced per seat, per month (minimum seats below); yearly billing lowers the seat price. */
export const TEAMS_SEAT_PRICE: Record<BillingCycle, number> = { monthly: 1400, yearly: 1000 };
export const TEAMS_MIN_SEATS = 5;
export const TEAMS_FEATURES = [
  "Everything in Pro",
  "Cohort dashboards",
  "Assigned roadmaps",
  "SSO & invoiced billing",
  "Priority support",
] as const;

/** A single course bought outright: lifetime access, plus its certificate and mentor review. */
export const SINGLE_COURSE_PERKS = "Lifetime access, its certificate and mentor review of its project";

/** Refunds can be requested this many days after paying (the "30-day money-back guarantee"). */
export const REFUND_WINDOW_DAYS = 30;

export const parseCycle = (value: string | null): BillingCycle => (value === "yearly" ? "yearly" : "monthly");
