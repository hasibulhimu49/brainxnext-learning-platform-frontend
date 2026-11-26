import { describe, expect, it } from "vitest";
import { authService } from "@/services/authService";
import { courseService } from "@/services/courseService";
import { accountService } from "@/services/accountService";
import { useAuthStore } from "@/stores/authStore";
import { api } from "./client";
import { API_ERROR_CODES, ApiError } from "./envelope";

describe("API client (against the mock adapter)", () => {
  it("unwraps the envelope and returns typed data", async () => {
    const courses = await courseService.list();
    expect(courses.length).toBeGreaterThan(0);
    expect(courses[0]).toHaveProperty("id");
  });

  it("logs in the demo user", async () => {
    const session = await authService.login("hasibulx26@gmail.com", "12345678");
    expect(session.user).toEqual({ name: "Mohammad Hasibul Hasan", email: "hasibulx26@gmail.com", role: "student" });
    expect(session.token).toMatch(/^mock\./);
  });

  it("turns failure envelopes into ApiError", async () => {
    await expect(authService.login("hasibulx26@gmail.com", "nope")).rejects.toMatchObject({
      name: "ApiError",
      code: API_ERROR_CODES.wrongPassword,
      status: 401,
    });
    await expect(authService.login("ghost@email.com", "whatever")).rejects.toBeInstanceOf(ApiError);
  });

  it("returns 404 envelopes for unknown routes", async () => {
    await expect(api.get("/does-not-exist")).rejects.toMatchObject({ code: API_ERROR_CODES.notFound, status: 404 });
  });

  it("sends the bearer token and clears the session on 401", async () => {
    const session = await authService.login("hasibulx26@gmail.com", "12345678");
    useAuthStore.getState().setSession(session);
    await expect(accountService.profile()).resolves.toMatchObject({ email: "hasibulx26@gmail.com" });

    useAuthStore.getState().setSession({ ...session, token: "mock.expired" });
    await expect(accountService.profile()).rejects.toMatchObject({ status: 401 });
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().sessionExpired).toBe(true);
  });

  it("registers, then rejects a duplicate email", async () => {
    await expect(authService.register("New Person", "new@email.com", "password123")).resolves.toEqual({ email: "new@email.com" });
    await expect(authService.register("New Person", "new@email.com", "password123")).rejects.toMatchObject({
      code: API_ERROR_CODES.emailTaken,
      status: 409,
    });
  });
});
