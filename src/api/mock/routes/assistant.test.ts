import { describe, expect, it } from "vitest";
import { API_ERROR_CODES } from "@/api/envelope";
import { assistantService } from "@/services/assistantService";
import { answer } from "./assistant";

describe("Next AI demo answers (F-005)", () => {
  it("recommends courses for a topic, free first", () => {
    const r = answer("I want to learn Java");
    expect(r.courses?.[0]).toMatchObject({ id: "java-generics", free: true });
    expect(r.links?.some((l) => l.to === "/courses")).toBe(true);
  });

  it("knows the Pro price, the promo code and refunds", () => {
    expect(answer("How much is Pro?").text).toContain("৳1,900");
    expect(answer("any discount code?").text).toContain("LEARN20");
    expect(answer("Can I get a refund?").text).toMatch(/30-day money-back/);
  });

  it("uses the open lesson when the learner is stuck", () => {
    const r = answer("I'm stuck on this lesson", { courseId: "java-generics", lessonId: "1-1" });
    expect(r.text).toContain("Generics in Java");
    expect(r.links?.[0]?.to).toBe("/learn/java-generics/1-1");
  });

  it("falls back to Help and Contact when it has no answer", () => {
    expect(answer("zzz qqq").links?.map((l) => l.to)).toEqual(["/help", "/contact"]);
  });

  it("answers through the API and rejects an empty message", async () => {
    await expect(assistantService.ask("hello", { path: "/" })).resolves.toHaveProperty("text");
    await expect(assistantService.ask("   ", { path: "/" })).rejects.toMatchObject({ code: API_ERROR_CODES.validation });
  });
});
