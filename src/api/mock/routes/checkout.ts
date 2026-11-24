import { PRO_PRICE } from "@/constants/plans";
import { SUPPORT_AMOUNTS } from "@/constants/support";
import { discountFor } from "@/lib/utils";
import { PAYMENT_METHODS, paymentSchema, type PaymentValues } from "@/schemas/checkout";
import type { PromoResult } from "@/types/account";
import type { OrderRecord } from "@/types/commerce";
import { API_ERROR_CODES as CODES } from "../../envelope";
import { findSubscription, isPro, startSubscription } from "../db/billing";
import { findValidPromo, orders, promos } from "../db/commerce";
import { enroll, findEnrollment } from "../db/learning";
import { newId } from "../db/store";
import { bodyOf, fail, ok, str, type MockRequest, type MockRoute } from "../http";
import { findCourse } from "./catalog";
import { invalid, requireUser, unauthorized } from "./shared";

/*
 * Checkout (PROVISIONAL). Every order lands in the shared `orders` collection, which the admin
 * screens read. Card payments are paid at once; bKash / Nagad orders start `pending` until the
 * learner approves on their phone (POST /checkout/orders/:id/confirm). A wallet number ending in
 * 0000 is declined, to demo the failure state. Donations are paid at once.
 */

const last4 = (p: PaymentValues) => `•••• ${(p.method === "Card" ? p.cardNumber : p.walletNumber).replace(/\D/g, "").slice(-4)}`;

const DECLINED_ACCOUNT = "•••• 0000";

/** A paid order grants what it sold and counts its promo code. */
const fulfil = (order: OrderRecord) => {
  if (order.userEmail && order.kind === "course") enroll(order.userEmail, order.itemId, "purchase");
  if (order.userEmail && order.kind === "plan") startSubscription(order.userEmail, order.cycle ?? "monthly");
  if (order.promoCode) {
    promos.update(
      (p) => p.code === order.promoCode,
      (p) => ({ ...p, used: p.used + 1 })
    );
  }
};

const priced = (subtotal: number, code: string) => {
  const promo = code ? findValidPromo(code) : undefined;
  const discount = promo ? discountFor(subtotal, promo.percentOff) : 0;
  return { subtotal, discount, total: subtotal - discount, promoCode: promo?.code ?? null };
};

const createPaidOrPending = (order: OrderRecord) => {
  orders.add(order);
  if (order.status === "paid") fulfil(order);
  return ok(order, 201);
};

const placeOrder = (req: MockRequest) => {
  const b = bodyOf(req);
  const kind = str(b.kind) || "course";
  const user = requireUser(req);
  const base = { id: newId("ORD"), createdAt: new Date().toISOString() };

  if (kind === "donation") {
    const amount = typeof b.amount === "number" ? b.amount : Number.NaN;
    if (!(SUPPORT_AMOUNTS as readonly number[]).includes(amount))
      return invalid([{ path: ["amount"], message: "Pick one of the amounts" }]);
    const pay = b.payment && typeof b.payment === "object" ? (b.payment as Record<string, unknown>) : {};
    const method = PAYMENT_METHODS.find((m) => m === pay.method);
    if (!method) return invalid([{ path: ["payment", "method"], message: "Pick a payment method" }]);
    return createPaidOrPending({
      ...base,
      userEmail: user?.email ?? null,
      userName: user?.name ?? "Anonymous",
      kind: "donation",
      itemId: "donation",
      itemTitle: "Support / fund contribution",
      method,
      subtotal: amount,
      discount: 0,
      total: amount,
      promoCode: null,
      status: "paid",
    });
  }

  if (!user) return unauthorized();
  const payment = paymentSchema.safeParse(b.payment);
  if (!payment.success) return invalid(payment.error.issues);
  const status = payment.data.method === "Card" ? "paid" : "pending";
  const who = { userEmail: user.email, userName: user.name, method: payment.data.method, account: last4(payment.data), status } as const;
  const code = str(b.promoCode);

  if (kind === "plan") {
    if (str(b.plan) !== "pro") return fail(400, CODES.validation, "Only the Pro plan can be bought online. Contact us for Teams.");
    const cycle = str(b.cycle) === "yearly" ? "yearly" : "monthly";
    if (isPro(user.email)) {
      const sub = findSubscription(user.email);
      return fail(
        409,
        CODES.alreadySubscribed,
        sub?.cancelAtPeriodEnd ? "Your Pro plan is still active — resume it from Billing." : "You're already on Pro."
      );
    }
    return createPaidOrPending({
      ...base,
      ...who,
      kind: "plan",
      itemId: "pro",
      itemTitle: cycle === "yearly" ? "Pro plan (yearly)" : "Pro plan (monthly)",
      cycle,
      ...priced(PRO_PRICE[cycle], code),
    });
  }

  const course = findCourse(str(b.courseId));
  if (!course) return fail(404, CODES.notFound, "That course doesn't exist.");
  if (course.free) return fail(400, CODES.validation, "This course is free — enrol from the course page.");
  if (findEnrollment(user.email, course.id)) return fail(409, CODES.alreadyEnrolled, "You already own this course.");
  return createPaidOrPending({
    ...base,
    ...who,
    kind: "course",
    itemId: course.id,
    itemTitle: course.title,
    ...priced(course.price, code),
  });
};

/** The pending order the caller owns, or the error response. */
const ownPendingOrder = (req: MockRequest) => {
  const order = orders.all().find((o) => o.id === req.params.id);
  const user = requireUser(req);
  if (!order || (order.userEmail && order.userEmail !== user?.email)) {
    return { error: fail(404, CODES.notFound, "We couldn't find that order.") };
  }
  if (order.status !== "pending") return { error: fail(409, CODES.orderNotPending, "This payment is no longer waiting for approval.") };
  return { order };
};

const setStatus = (id: string, status: OrderRecord["status"]) => {
  orders.update(
    (o) => o.id === id,
    (o) => ({ ...o, status })
  );
  return orders.all().find((o) => o.id === id) as OrderRecord;
};

export const checkoutRoutes: MockRoute[] = [
  {
    method: "POST",
    path: "/checkout/promo",
    handler: (req) => {
      const promo = findValidPromo(str(bodyOf(req).code));
      return promo
        ? ok<PromoResult>({ code: promo.code, percentOff: promo.percentOff })
        : fail(400, CODES.invalidPromo, "That code isn't valid or has expired");
    },
  },
  { method: "POST", path: "/checkout/orders", handler: placeOrder },
  {
    method: "POST",
    path: "/checkout/orders/:id/confirm",
    handler: (req) => {
      const { order, error } = ownPendingOrder(req);
      if (!order) return error;
      if (bodyOf(req).simulateFailure === true || order.account === DECLINED_ACCOUNT) {
        setStatus(order.id, "failed");
        return fail(402, CODES.paymentDeclined, `${order.method} declined the payment. No money was taken.`);
      }
      const paid = setStatus(order.id, "paid");
      fulfil(paid);
      return ok(paid);
    },
  },
  {
    method: "POST",
    path: "/checkout/orders/:id/cancel",
    handler: (req) => {
      const { order, error } = ownPendingOrder(req);
      return order ? ok(setStatus(order.id, "failed")) : error;
    },
  },
];
