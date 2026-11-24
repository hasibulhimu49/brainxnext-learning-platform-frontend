import { describe, expect, it } from "vitest";
import { loginSchema, passwordStrength, registerSchema, resetPasswordSchema } from "./auth";
import { checkoutFormSchema, defaultCheckoutValues, formatCardNumber, formatExpiry, toPayment } from "./checkout";
import { coursePublishSchema, defaultCourseDraft } from "./course";

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

describe("checkout schema", () => {
  it("only validates the selected payment method", () => {
    const wallet = { ...defaultCheckoutValues, method: "bKash" as const, walletNumber: "01712345678" };
    expect(checkoutFormSchema.safeParse(wallet).success).toBe(true);
    expect(toPayment(wallet)).toEqual({ method: "bKash", walletNumber: "01712345678" });

    const card = {
      ...defaultCheckoutValues,
      cardName: "T A",
      cardNumber: formatCardNumber("4242424242424242"),
      expiry: formatExpiry("0828"),
      cvc: "123",
    };
    expect(card.cardNumber).toBe("4242 4242 4242 4242");
    expect(card.expiry).toBe("08 / 28");
    expect(checkoutFormSchema.safeParse(card).success).toBe(true);
    expect(checkoutFormSchema.safeParse({ ...card, cvc: "1" }).success).toBe(false);
  });
});

describe("course publish schema", () => {
  it("rejects an empty draft and accepts a complete course", () => {
    expect(coursePublishSchema.safeParse(defaultCourseDraft).success).toBe(false);
    const complete = { ...defaultCourseDraft, title: "T", blurb: "B", modules: [{ title: "M", lessons: [{ title: "L", dur: "10:00" }] }] };
    expect(coursePublishSchema.safeParse(complete).success).toBe(true);
    expect(coursePublishSchema.safeParse({ ...complete, pricing: "paid", price: "" }).success).toBe(false);
    // whole BDT, up to 6 digits
    expect(defaultCourseDraft.price).toBe("4900");
    expect(coursePublishSchema.safeParse({ ...complete, pricing: "paid", price: "999999" }).success).toBe(true);
    expect(coursePublishSchema.safeParse({ ...complete, pricing: "paid", price: "1000000" }).success).toBe(false);
  });
});
