import { beforeEach, describe, expect, it } from "vitest";
import { API_ERROR_CODES } from "@/api/envelope";
import { orders, promos } from "@/api/mock/db/commerce";
import { accountService } from "@/services/accountService";
import { authService } from "@/services/authService";
import { checkoutService } from "@/services/checkoutService";
import { learningService } from "@/services/learningService";
import { useAuthStore } from "@/stores/authStore";

const CARD = { method: "Card", cardName: "Test", cardNumber: "4242 4242 4242 4242", expiry: "12 / 30", cvc: "123" } as const;
const WALLET = { method: "bKash", walletNumber: "01712345678" } as const;

const loginStudent = async () => {
  useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
};

describe("mock API — orders (F-002 Phase 2)", () => {
  beforeEach(loginStudent);

  it("writes card orders as paid, counts the promo and serves the receipt", async () => {
    const usedBefore = promos.all().find((p) => p.code === "LEARN20")?.used ?? 0;
    const order = await checkoutService.placeOrder("applied-ml", CARD, "learn20");
    expect(order).toMatchObject({
      status: "paid",
      subtotal: 8900,
      discount: 1780,
      total: 7120,
      promoCode: "LEARN20",
      account: "•••• 4242",
    });
    expect(orders.all()[0]?.id).toBe(order.id);
    expect(promos.all().find((p) => p.code === "LEARN20")?.used).toBe(usedBefore + 1);
    await expect(accountService.order(order.id)).resolves.toMatchObject({ id: order.id });
    await expect(accountService.order("ORD-JS-8412")).rejects.toMatchObject({ code: API_ERROR_CODES.notFound });
  });

  it("ignores an expired promo and rejects it at /checkout/promo", async () => {
    await expect(checkoutService.applyPromo("WELCOME10")).rejects.toMatchObject({ code: API_ERROR_CODES.invalidPromo });
    const order = await checkoutService.placeOrder("applied-ml", CARD, "WELCOME10");
    expect(order).toMatchObject({ discount: 0, promoCode: null });
  });

  it("declines a wallet ending in 0000 and lets the learner cancel", async () => {
    const declined = await checkoutService.placeOrder("ux-research", { method: "Nagad", walletNumber: "01712340000" });
    await expect(checkoutService.confirmOrder(declined.id)).rejects.toMatchObject({ code: API_ERROR_CODES.paymentDeclined, status: 402 });
    await expect(accountService.order(declined.id)).resolves.toMatchObject({ status: "failed" });
    await expect(checkoutService.confirmOrder(declined.id)).rejects.toMatchObject({ code: API_ERROR_CODES.orderNotPending });

    const cancelled = await checkoutService.placeOrder("ux-research", WALLET);
    await expect(checkoutService.cancelOrder(cancelled.id)).resolves.toMatchObject({ status: "failed" });
    await expect(learningService.progress("ux-research")).resolves.toMatchObject({ enrolled: false });
  });

  it("requests a refund only for recent paid orders, with a reason", async () => {
    const order = await checkoutService.placeOrder("applied-ml", CARD);
    await expect(accountService.requestRefund(order.id, "short")).rejects.toMatchObject({ code: API_ERROR_CODES.validation });
    await expect(accountService.requestRefund(order.id, "Not what I expected at all")).resolves.toMatchObject({
      status: "refund_requested",
      refundReason: "Not what I expected at all",
    });
    // the seed Pro order is from August — outside the 30-day window
    await expect(accountService.requestRefund("ORD-PRO-0801", "Please refund this month")).rejects.toMatchObject({
      code: API_ERROR_CODES.refundNotAllowed,
    });
  });

  it("records anonymous donations as paid orders", async () => {
    useAuthStore.getState().clearSession();
    await expect(checkoutService.donate(99, "bKash")).resolves.toMatchObject({
      kind: "donation",
      total: 99,
      status: "paid",
      userEmail: null,
    });
    await expect(checkoutService.donate(12, "bKash")).rejects.toMatchObject({ code: API_ERROR_CODES.validation });
  });
});
