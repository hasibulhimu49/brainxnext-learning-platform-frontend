import { beforeEach, describe, expect, it } from "vitest";
import { API_ERROR_CODES } from "@/api/envelope";
import { accountService } from "@/services/accountService";
import { adminService } from "@/services/adminService";
import { authService } from "@/services/authService";
import { checkoutService } from "@/services/checkoutService";
import { learningService } from "@/services/learningService";
import { useAuthStore } from "@/stores/authStore";

const loginAs = async (email: string, password: string) => {
  const session = await authService.login(email, password);
  useAuthStore.getState().setSession(session);
  return session;
};

describe("mock API — enrolment and progress", () => {
  beforeEach(async () => {
    await loginAs("hasibulx26@gmail.com", "password123");
  });

  it("seeds the demo student with the dashboard courses", async () => {
    const enrollments = await learningService.enrollments();
    expect(enrollments.map((e) => e.courseId)).toEqual([
      "java-generics",
      "python-data-analysis",
      "code-smells",
      "sql-query-to-model",
      "git-collaboration",
    ]);
    const java = await learningService.progress("java-generics");
    expect(java.completed).toHaveLength(10);
    expect(java.lastLessonId).toBe("3-3");
    const dashboard = await accountService.dashboard();
    expect(dashboard.continueLearning).toMatchObject({ courseId: "java-generics", lessonId: "3-3", lessonNumber: 11 });
  });

  it("enrols in a free course, then saves and toggles progress", async () => {
    await expect(learningService.progress("product-analytics")).resolves.toMatchObject({ enrolled: false, completed: [] });
    await expect(learningService.enroll("product-analytics")).resolves.toMatchObject({ courseId: "product-analytics", pct: 0 });

    await learningService.updateProgress("product-analytics", { lessonId: "1-2", completed: true });
    await expect(learningService.progress("product-analytics")).resolves.toEqual({
      courseId: "product-analytics",
      enrolled: true,
      completed: ["1-2"],
      lastLessonId: "1-2",
    });
    await learningService.updateProgress("product-analytics", { lessonId: "1-2", completed: false });
    await expect(learningService.progress("product-analytics")).resolves.toMatchObject({ completed: [] });
    expect((await learningService.enrollments())[0]?.courseId).toBe("product-analytics");
  });

  it("refuses to enrol in a paid course without paying, and rejects bad progress", async () => {
    await expect(learningService.enroll("applied-ml")).rejects.toMatchObject({ code: API_ERROR_CODES.paymentRequired, status: 402 });
    await expect(learningService.updateProgress("applied-ml", { lessonId: "1-1" })).rejects.toMatchObject({
      code: API_ERROR_CODES.notEnrolled,
    });
    await expect(learningService.updateProgress("java-generics", { lessonId: "9-9" })).rejects.toMatchObject({
      code: API_ERROR_CODES.validation,
    });
  });

  it("enrols the buyer after a successful order (whole-taka promo total)", async () => {
    const order = await checkoutService.placeOrder("modern-javascript", { method: "bKash", walletNumber: "01712345678" }, "LEARN20");
    expect(order.total).toBe(3920);
    // wallet payments wait for approval on the phone (F-002 Phase 2)
    expect(order.status).toBe("pending");
    await expect(learningService.progress("modern-javascript")).resolves.toMatchObject({ enrolled: false });
    await expect(checkoutService.confirmOrder(order.id)).resolves.toMatchObject({ status: "paid" });
    await expect(learningService.progress("modern-javascript")).resolves.toMatchObject({ enrolled: true });
    await expect(checkoutService.placeOrder("modern-javascript", { method: "bKash", walletNumber: "01712345678" })).rejects.toMatchObject({
      code: API_ERROR_CODES.alreadyEnrolled,
    });
  });
});

describe("mock API — access control", () => {
  it("requires a session for the dashboard and orders", async () => {
    await expect(accountService.dashboard()).rejects.toMatchObject({ status: 401 });
    await expect(checkoutService.placeOrder("modern-javascript", { method: "bKash", walletNumber: "01712345678" })).rejects.toMatchObject({
      status: 401,
    });
  });

  it("gives a brand-new user an empty dashboard", async () => {
    await authService.register("Fresh Learner", "fresh@email.com", "password123");
    useAuthStore.getState().setSession(await authService.verifyOtp("fresh@email.com", "123456"));
    const dashboard = await accountService.dashboard();
    expect(dashboard.myCourses).toEqual([]);
    expect(dashboard.continueLearning).toBeNull();
  });

  it("keeps admin endpoints for admins (401 guest, 403 student)", async () => {
    await expect(adminService.overview()).rejects.toMatchObject({ status: 401 });
    await loginAs("hasibulx26@gmail.com", "password123");
    await expect(adminService.overview()).rejects.toMatchObject({ status: 403, code: API_ERROR_CODES.forbidden });
    await loginAs("admin@brainxnext.com", "admin12345");
    await expect(adminService.overview()).resolves.toHaveProperty("kpis");
  });
});

describe("mock API — sign-up and password reset", () => {
  it("blocks login until the email is verified, and only verifies pending sign-ups", async () => {
    await authService.register("New Person", "new@email.com", "password123");
    await expect(authService.login("new@email.com", "password123")).rejects.toMatchObject({
      code: API_ERROR_CODES.emailNotVerified,
      status: 403,
    });
    await expect(authService.verifyOtp("hasibulx26@gmail.com", "123456")).rejects.toMatchObject({ code: API_ERROR_CODES.noPendingSignup });
    await expect(authService.verifyOtp("new@email.com", "123456")).resolves.toHaveProperty("token");
    await expect(authService.login("new@email.com", "password123")).resolves.toHaveProperty("token");
  });

  it("resets a password only with a valid, single-use token", async () => {
    await expect(authService.forgotPassword("ghost@email.com")).resolves.toEqual({ sentTo: "ghost@email.com" });
    const { devResetLink } = await authService.forgotPassword("hasibulx26@gmail.com");
    const token = new URL(devResetLink ?? "", "http://x").searchParams.get("token") ?? "";
    expect(token).not.toBe("");

    await expect(authService.resetPassword("not-a-token", "newpassword1")).rejects.toMatchObject({
      code: API_ERROR_CODES.invalidResetToken,
    });
    await expect(authService.resetPassword(token, "newpassword1")).resolves.toEqual({ reset: true });
    await expect(authService.resetPassword(token, "another-one1")).rejects.toMatchObject({ code: API_ERROR_CODES.invalidResetToken });
    await expect(authService.login("hasibulx26@gmail.com", "newpassword1")).resolves.toHaveProperty("token");
  });
});
