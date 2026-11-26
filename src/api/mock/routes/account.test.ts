import { beforeEach, describe, expect, it } from "vitest";
import { API_ERROR_CODES } from "@/api/envelope";
import { accountService } from "@/services/accountService";
import { authService } from "@/services/authService";
import { learningService } from "@/services/learningService";
import { useAuthStore } from "@/stores/authStore";

const loginStudent = async () => {
  useAuthStore.getState().setSession(await authService.login("hasibulx26@gmail.com", "12345678"));
};

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
