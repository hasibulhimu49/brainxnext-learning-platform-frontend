import { beforeEach, describe, expect, it } from "vitest";
import { API_ERROR_CODES } from "@/api/envelope";
import { orders } from "@/api/mock/db/commerce";
import { authService } from "@/services/authService";
import { checkoutService } from "@/services/checkoutService";
import { learningService } from "@/services/learningService";
import { useAuthStore } from "@/stores/authStore";

const CARD = { method: "Card", cardName: "Test", cardNumber: "4242 4242 4242 4242", expiry: "12 / 30", cvc: "123" } as const;
const WALLET = { method: "bKash", walletNumber: "01712345678" } as const;
const owns = async (id: string) => (await learningService.enrollments()).some((e) => e.courseId === id);

describe("mock API — cart orders (F-004)", () => {
  beforeEach(async () => {
    useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
  });

  it("charges every course once with the promo on the subtotal and enrols them all", async () => {
    const order = await checkoutService.placeCartOrder(["modern-javascript", "ux-research"], CARD, "LEARN20");
    expect(order).toMatchObject({
      kind: "cart",
      status: "paid",
      itemTitle: "2 courses",
      subtotal: 8800,
      discount: 1760,
      total: 7040,
      promoCode: "LEARN20",
    });
    expect(order.items?.map((i) => i.courseId)).toEqual(["modern-javascript", "ux-research"]);
    expect(orders.all()[0]?.id).toBe(order.id);
    expect(await owns("modern-javascript")).toBe(true);
    expect(await owns("ux-research")).toBe(true);
  });

  it("enrols only after a wallet payment is approved", async () => {
    const order = await checkoutService.placeCartOrder(["applied-ml", "motion-design"], WALLET);
    expect(order.status).toBe("pending");
    expect(await owns("applied-ml")).toBe(false);
    await checkoutService.confirmOrder(order.id);
    expect(await owns("applied-ml")).toBe(true);
    expect(await owns("motion-design")).toBe(true);
  });

  it("rejects an empty cart, free courses and courses already owned", async () => {
    await expect(checkoutService.placeCartOrder([], CARD)).rejects.toMatchObject({ code: API_ERROR_CODES.validation });
    await expect(checkoutService.placeCartOrder(["java-generics"], CARD)).rejects.toMatchObject({ code: API_ERROR_CODES.validation });
    await checkoutService.placeOrder("modern-javascript", CARD);
    await expect(checkoutService.placeCartOrder(["modern-javascript", "ux-research"], CARD)).rejects.toMatchObject({
      code: API_ERROR_CODES.alreadyEnrolled,
    });
  });

  it("needs a signed-in buyer", async () => {
    useAuthStore.getState().clearSession();
    await expect(checkoutService.placeCartOrder(["ux-research"], CARD)).rejects.toMatchObject({ status: 401 });
  });
});
