import { describe, expect, it } from "vitest";
import { addStudentSchema, feedbackSchema, noteFileSchema, promoSchema, refundSchema, toPromoInput } from "./admin";

const promo = (over: Partial<Record<"code" | "percentOff" | "expiresAt" | "usageLimit", string>> = {}) =>
  promoSchema.safeParse({ code: "SPRING25", percentOff: "25", expiresAt: "", usageLimit: "", ...over });

describe("promoSchema", () => {
  it("accepts a valid code, uppercases it and converts the optional fields", () => {
    const r = promoSchema.parse({ code: " spring25 ", percentOff: "25", expiresAt: "2026-12-31", usageLimit: "100" });
    expect(r.code).toBe("SPRING25");
    expect(toPromoInput(r)).toEqual({ code: "SPRING25", percentOff: 25, expiresAt: "2026-12-31", usageLimit: 100 });
    expect(toPromoInput(promoSchema.parse({ code: "ABCD", percentOff: "5", expiresAt: "", usageLimit: "" }))).toMatchObject({
      expiresAt: null,
      usageLimit: null,
    });
  });

  it.each(["ABC", "TOOLONGPROMOCODE17", "HAS SPACE", "DASH-ED", "৳OFF"])("rejects the code %s", (code) => {
    expect(promo({ code }).success).toBe(false);
  });

  it.each(["0", "91", "100", "2.5", "-5", ""])("rejects %s %% off", (percentOff) => {
    expect(promo({ percentOff }).success).toBe(false);
  });

  it("accepts 1 and 90 % off, rejects bad dates and a zero limit", () => {
    expect(promo({ percentOff: "1" }).success).toBe(true);
    expect(promo({ percentOff: "90" }).success).toBe(true);
    expect(promo({ expiresAt: "31/12/2026" }).success).toBe(false);
    expect(promo({ usageLimit: "0" }).success).toBe(false);
    expect(promo({ usageLimit: "12" }).success).toBe(true);
  });
});

describe("feedbackSchema", () => {
  it("needs at least 20 characters after trimming", () => {
    expect(feedbackSchema.safeParse({ feedback: "Looks good!" }).success).toBe(false);
    expect(feedbackSchema.safeParse({ feedback: `   ${"x".repeat(19)}   ` }).success).toBe(false);
    expect(feedbackSchema.parse({ feedback: "  Clean code and good tests overall.  " }).feedback).toBe(
      "Clean code and good tests overall."
    );
  });
});

describe("refundSchema", () => {
  it("needs a short reason", () => {
    expect(refundSchema.safeParse({ reason: "no" }).success).toBe(false);
    expect(refundSchema.safeParse({ reason: "Duplicate charge" }).success).toBe(true);
    expect(refundSchema.safeParse({ reason: "x".repeat(301) }).success).toBe(false);
  });
});

describe("other admin schemas", () => {
  it("validates a new student and a handbook upload", () => {
    expect(addStudentSchema.safeParse({ name: "Ayan", email: "ayan@example.com", plan: "pro" }).success).toBe(true);
    expect(addStudentSchema.safeParse({ name: "Ayan", email: "not-an-email", plan: "pro" }).success).toBe(false);
    expect(noteFileSchema.safeParse({ name: "handbook.PDF", size: 1024 }).success).toBe(true);
    expect(noteFileSchema.safeParse({ name: "handbook.docx", size: 1024 }).success).toBe(false);
    expect(noteFileSchema.safeParse({ name: "big.pdf", size: 60 * 1024 * 1024 }).success).toBe(false);
  });
});
