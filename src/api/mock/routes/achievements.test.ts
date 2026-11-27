import { beforeEach, describe, expect, it } from "vitest";
import { API_ERROR_CODES } from "@/api/envelope";
import { lessonIdsOf } from "@/api/mock/db/curricula";
import { accountService } from "@/services/accountService";
import { authService } from "@/services/authService";
import { checkoutService } from "@/services/checkoutService";
import { learningService } from "@/services/learningService";
import { notificationService } from "@/services/notificationService";
import { useAuthStore } from "@/stores/authStore";

const CARD = { method: "Card", cardName: "Test", cardNumber: "4242 4242 4242 4242", expiry: "12 / 30", cvc: "123" } as const;

const loginStudent = async () => {
  useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
};

const completeCourse = async (courseId: string) => {
  for (const lessonId of lessonIdsOf(courseId)) await learningService.updateProgress(courseId, { lessonId, completed: true });
};

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
