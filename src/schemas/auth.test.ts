import { describe, expect, it } from "vitest";
import { loginSchema, passwordStrength, registerSchema, resetPasswordSchema } from "./auth";

describe("auth schemas", () => {
  it("requires a valid email and a password to log in", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x", remember: true }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x", remember: true }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "", remember: true }).success).toBe(false);
  });

  it("needs 8+ character passwords to register", () => {
    expect(registerSchema.safeParse({ name: "A", email: "a@b.co", password: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ name: "A", email: "a@b.co", password: "longenough" }).success).toBe(true);
  });

  it("reports a mismatch on the confirm field", () => {
    const result = resetPasswordSchema.safeParse({ password: "password123", confirm: "password124" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirm"]);
  });

  it("scores password strength 0–3", () => {
    expect(passwordStrength("abc")).toBe(0);
    expect(passwordStrength("abcdefgh")).toBe(1);
    expect(passwordStrength("Abcdefg1")).toBe(2);
    expect(passwordStrength("Abcdefghij1!")).toBe(3);
  });
});
