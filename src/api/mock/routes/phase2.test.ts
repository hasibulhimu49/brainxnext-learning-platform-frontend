import { beforeEach, describe, expect, it } from "vitest";
import { API_ERROR_CODES } from "@/api/envelope";
import { orders, promos } from "@/api/mock/db/commerce";
import { LESSON_IDS } from "@/api/mock/db/learning";
import { accountService } from "@/services/accountService";
import { authService } from "@/services/authService";
import { checkoutService } from "@/services/checkoutService";
import { learningService } from "@/services/learningService";
import { notificationService } from "@/services/notificationService";
import { useAuthStore } from "@/stores/authStore";

const CARD = { method: "Card", cardName: "Test", cardNumber: "4242 4242 4242 4242", expiry: "12 / 30", cvc: "123" } as const;
const WALLET = { method: "bKash", walletNumber: "01712345678" } as const;

const loginStudent = async () => {
  useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
};

const completeCourse = async (courseId: string) => {
  for (const lessonId of LESSON_IDS) await learningService.updateProgress(courseId, { lessonId, completed: true });
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

describe("mock API — certificates, submissions, notifications", () => {
  beforeEach(loginStudent);

  it("lists the seeded certificates and verifies them publicly", async () => {
    const certs = await accountService.certificates();
    expect(certs.map((c) => c.id)).toEqual(["BXN-2026-SQ-08412", "BXN-2026-GI-04127"]);
    useAuthStore.getState().clearSession();
    await expect(accountService.verifyCertificate("bxn-2026-sq-08412")).resolves.toMatchObject({ holder: "Mohammad Hasibul Hasan" });
    await expect(accountService.verifyCertificate("BXN-0000-XX-00000")).rejects.toMatchObject({ code: API_ERROR_CODES.notFound });
  });

  it("issues a certificate only when an entitled learner completes a course", async () => {
    await learningService.enroll("product-analytics");
    await completeCourse("product-analytics");
    // a free account finishing a free course: no certificate
    expect((await accountService.certificates()).some((c) => c.courseId === "product-analytics")).toBe(false);

    await checkoutService.placePlanOrder("monthly", CARD);
    const certs = await accountService.certificates();
    const issued = certs.find((c) => c.courseId === "product-analytics");
    expect(issued?.id).toMatch(/^BXN-\d{4}-PR-\d{5}$/);
    await expect(accountService.certificate(issued?.id ?? "")).resolves.toMatchObject({ course: "Product Analytics Foundations" });
    const notes = await notificationService.list();
    expect(notes.some((n) => n.id === `cert-${issued?.id ?? ""}` && !n.read)).toBe(true);
  });

  it("accepts project submissions only from entitled learners", async () => {
    const values = { title: "Funnel analysis", repoUrl: "https://github.com/me/funnel", notes: "" };
    await expect(learningService.submitProject("java-generics", values)).rejects.toMatchObject({ code: API_ERROR_CODES.upgradeRequired });
    await checkoutService.placePlanOrder("monthly", CARD);
    await expect(learningService.submitProject("java-generics", { ...values, repoUrl: "nope" })).rejects.toMatchObject({
      code: API_ERROR_CODES.validation,
    });
    await expect(learningService.submitProject("java-generics", values)).resolves.toMatchObject({ status: "pending" });
    const mine = await learningService.submissions();
    expect(mine.map((s) => s.title)).toEqual(["Funnel analysis", "Sales analytics model"]);
  });

  it("marks notifications read and remembers it", async () => {
    const before = await notificationService.list();
    expect(before.some((n) => !n.read)).toBe(true);
    const first = before[0]?.id ?? "";
    expect((await notificationService.markRead([first])).find((n) => n.id === first)?.read).toBe(true);
    expect((await notificationService.markRead()).every((n) => n.read)).toBe(true);
    expect((await notificationService.list()).every((n) => n.read)).toBe(true);
  });
});

describe("mock API — account settings", () => {
  beforeEach(loginStudent);

  it("saves notification preferences", async () => {
    await expect(accountService.preferences()).resolves.toMatchObject({ digest: "Weekly", community: true });
    await expect(accountService.updatePreferences({ digest: "Never", community: false })).resolves.toMatchObject({
      digest: "Never",
      community: false,
    });
    await expect(accountService.preferences()).resolves.toMatchObject({ digest: "Never", courseUpdates: true });
  });

  it("changes the email only after the password and the code", async () => {
    await expect(accountService.startEmailChange({ newEmail: "new@me.com", password: "wrong" })).rejects.toMatchObject({
      code: API_ERROR_CODES.wrongPassword,
    });
    await expect(accountService.startEmailChange({ newEmail: "admin@brainxnext.com", password: "12345678" })).rejects.toMatchObject({
      code: API_ERROR_CODES.emailTaken,
    });
    await accountService.startEmailChange({ newEmail: "new@me.com", password: "12345678" });
    await expect(accountService.confirmEmailChange("000000")).rejects.toMatchObject({ code: API_ERROR_CODES.invalidCode });
    const session = await accountService.confirmEmailChange("123456");
    expect(session.user.email).toBe("new@me.com");
    useAuthStore.getState().setSession(session);
    // records moved with the account
    expect((await accountService.certificates()).length).toBe(2);
    expect((await learningService.enrollments()).length).toBe(5);
  });

  it("deletes the account after typing DELETE", async () => {
    await expect(accountService.deleteAccount("delete")).rejects.toMatchObject({ code: API_ERROR_CODES.validation });
    await expect(accountService.deleteAccount("DELETE")).resolves.toEqual({ deleted: true });
    await expect(authService.login("hasibulx26@gmail.com", "12345678")).rejects.toMatchObject({ code: API_ERROR_CODES.userNotFound });
  });
});
