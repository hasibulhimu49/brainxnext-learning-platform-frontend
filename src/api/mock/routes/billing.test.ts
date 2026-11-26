import { beforeEach, describe, expect, it } from "vitest";
import { API_ERROR_CODES } from "@/api/envelope";
import { accountService } from "@/services/accountService";
import { authService } from "@/services/authService";
import { checkoutService } from "@/services/checkoutService";
import { learningService } from "@/services/learningService";
import { useAuthStore } from "@/stores/authStore";

const CARD = { method: "Card", cardName: "Test", cardNumber: "4242 4242 4242 4242", expiry: "12 / 30", cvc: "123" } as const;

const loginStudent = async () => {
  useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
};

describe("mock API — Pro subscription", () => {
  beforeEach(loginStudent);

  it("starts Free, goes Pro after a plan order, then cancels and resumes", async () => {
    await expect(accountService.subscription()).resolves.toMatchObject({ plan: "free", status: "none" });
    const order = await checkoutService.placePlanOrder("yearly", CARD);
    expect(order).toMatchObject({ kind: "plan", total: 16800, cycle: "yearly", status: "paid" });
    await expect(accountService.subscription()).resolves.toMatchObject({ plan: "pro", status: "active", cycle: "yearly" });
    await expect(checkoutService.placePlanOrder("monthly", CARD)).rejects.toMatchObject({ code: API_ERROR_CODES.alreadySubscribed });

    await expect(accountService.cancelSubscription()).resolves.toMatchObject({ plan: "pro", status: "canceled" });
    await expect(accountService.resumeSubscription()).resolves.toMatchObject({ status: "active" });
    await expect(accountService.changeCycle("monthly")).resolves.toMatchObject({ cycle: "monthly" });
  });

  it("lets Pro members enrol in paid courses", async () => {
    await expect(learningService.enroll("applied-ml")).rejects.toMatchObject({ code: API_ERROR_CODES.paymentRequired });
    await checkoutService.placePlanOrder("monthly", CARD);
    await expect(learningService.enroll("applied-ml")).resolves.toMatchObject({ source: "pro" });
  });
});
