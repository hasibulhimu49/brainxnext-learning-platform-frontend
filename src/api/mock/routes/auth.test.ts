import { describe, expect, it } from "vitest";
import { API_ERROR_CODES } from "@/api/envelope";
import { authService } from "@/services/authService";

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
