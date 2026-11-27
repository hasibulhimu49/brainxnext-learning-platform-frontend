import { REFUND_WINDOW_DAYS } from "@/constants/plans";
import { canRequestRefund } from "@/lib/billing";
import { refundRequestSchema } from "@/schemas/learner";
import { API_ERROR_CODES as CODES } from "../../envelope";
import { findSubscription, isPro, patchSubscription, toSubscription } from "../db/billing";
import { orders } from "../db/commerce";
import { bodyOf, fail, ok, str, type MockRoute } from "../http";
import { invalid, requireUser, unauthorized } from "./shared";

/** Signed-in billing endpoints: subscription, order history, receipts, refund requests. PROVISIONAL. */

const ordersOf = (email: string) =>
  orders
    .all()
    .filter((o) => o.userEmail === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const billingRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/me/subscription",
    handler: (req) => {
      const user = requireUser(req);
      return user ? ok(toSubscription(user.email)) : unauthorized();
    },
  },
  {
    method: "PATCH",
    path: "/me/subscription",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      if (!isPro(user.email)) return fail(404, CODES.notFound, "You don't have an active plan.");
      const cycle = str(bodyOf(req).cycle);
      if (cycle !== "monthly" && cycle !== "yearly") return invalid([{ path: ["cycle"], message: "Choose monthly or yearly" }]);
      patchSubscription(user.email, { cycle });
      return ok(toSubscription(user.email), 200, "Billing cycle changes at your next renewal");
    },
  },
  ...(["cancel", "resume"] as const).map((action): MockRoute => ({
    method: "POST",
    path: `/me/subscription/${action}`,
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      if (!isPro(user.email) || !findSubscription(user.email)) return fail(404, CODES.notFound, "You don't have an active plan.");
      patchSubscription(user.email, { cancelAtPeriodEnd: action === "cancel" });
      return ok(toSubscription(user.email));
    },
  })),
  {
    method: "GET",
    path: "/me/orders",
    handler: (req) => {
      const user = requireUser(req);
      return user ? ok(ordersOf(user.email)) : unauthorized();
    },
  },
  {
    method: "GET",
    path: "/me/orders/:id",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      const order = ordersOf(user.email).find((o) => o.id === req.params.id);
      return order ? ok(order) : fail(404, CODES.notFound, "We couldn't find that order.");
    },
  },
  {
    method: "POST",
    path: "/me/orders/:id/refund",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      const order = ordersOf(user.email).find((o) => o.id === req.params.id);
      if (!order) return fail(404, CODES.notFound, "We couldn't find that order.");
      const parsed = refundRequestSchema.safeParse(req.body);
      if (!parsed.success) return invalid(parsed.error.issues);
      // same rule the Billing tab uses to show the button (src/lib/billing.ts)
      if (!canRequestRefund(order)) {
        return fail(
          409,
          CODES.refundNotAllowed,
          order.status !== "paid" || order.kind === "donation"
            ? "Only paid course and plan orders can be refunded."
            : `Refunds are available for ${REFUND_WINDOW_DAYS} days after purchase.`
        );
      }
      orders.update(
        (o) => o.id === order.id,
        (o) => ({ ...o, status: "refund_requested", refundReason: parsed.data.reason })
      );
      return ok(
        ordersOf(user.email).find((o) => o.id === order.id),
        200,
        "Refund requested"
      );
    },
  },
];
