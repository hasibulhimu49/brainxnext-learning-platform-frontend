import { describe, expect, it } from "vitest";
import { coursePublishSchema, defaultCourseDraft } from "./course";

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
