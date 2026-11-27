import {
  FREE_EXCLUDED,
  FREE_FEATURES,
  PRO_FEATURES,
  PRO_PRICE,
  PRO_YEARLY_PER_MONTH,
  TEAMS_FEATURES,
  TEAMS_MIN_SEATS,
  TEAMS_SEAT_PRICE,
} from "@/constants/plans";
import { formatTaka, plural } from "@/lib/utils";
import type { BillingCycle } from "@/types/commerce";
import type { PricingCardProps } from "./PricingCard";
import type { CatalogStats } from "./useCatalogStats";

interface PlanCardOptions {
  cycle: BillingCycle;
  stats: CatalogStats | null;
  /** signed-in visitors get "Go to dashboard" instead of the sign-up CTA */
  signedIn: boolean;
  /** already on Pro: the Pro card links to billing settings */
  isPro?: boolean;
  /** Pricing shows notes and the full lists; Home shows a short version */
  detailed?: boolean;
}

/** The three plan cards for Home and Pricing, built from `constants/plans` so prices and promises never drift apart. */
export const planCards = ({ cycle, stats, signedIn, isPro = false, detailed = false }: PlanCardOptions): PricingCardProps[] => {
  const yearly = cycle === "yearly";
  const freeFirst = stats ? `${plural(stats.free, "free course")}, every lesson` : FREE_FEATURES[0];
  const proFirst = stats ? `All ${plural(stats.total, "course")}, free and paid` : PRO_FEATURES[0];
  const freeFeatures = [freeFirst, ...FREE_FEATURES.slice(1)];
  const proFeatures = [proFirst, ...PRO_FEATURES.slice(1)];

  return [
    {
      name: "FREE",
      price: formatTaka(0),
      per: "forever",
      note: detailed ? "For trying real courses, not demos." : undefined,
      features: detailed ? [...freeFeatures, ...FREE_EXCLUDED.map((text) => ({ text, included: false }))] : freeFeatures.slice(0, 3),
      cta: signedIn ? "Go to dashboard" : "Start free",
      to: signedIn ? "/dashboard" : "/register",
    },
    {
      name: "PRO",
      price: formatTaka(yearly ? PRO_YEARLY_PER_MONTH : PRO_PRICE.monthly),
      per: yearly ? "/ month, billed yearly" : "/ month",
      note: detailed
        ? yearly
          ? `${formatTaka(PRO_PRICE.yearly)} billed once a year — save ${formatTaka(PRO_PRICE.monthly * 12 - PRO_PRICE.yearly)}.`
          : "For serious, self-paced learners."
        : undefined,
      features: detailed ? proFeatures : proFeatures.slice(0, 3),
      cta: isPro ? "Manage your plan" : "Go Pro",
      to: isPro ? "/settings/billing" : `/checkout/plan/pro?cycle=${cycle}`,
      popular: true,
    },
    {
      name: "TEAMS",
      price: formatTaka(TEAMS_SEAT_PRICE[cycle]),
      per: "per seat / month",
      note: detailed
        ? `For companies training ${TEAMS_MIN_SEATS}+ people. Minimum ${TEAMS_MIN_SEATS} seats${yearly ? ", billed yearly" : ""}.`
        : `Minimum ${TEAMS_MIN_SEATS} seats.`,
      features: detailed ? [...TEAMS_FEATURES] : TEAMS_FEATURES.slice(0, 3),
      cta: "Talk to us",
      to: "/contact?topic=teams",
    },
  ];
};
