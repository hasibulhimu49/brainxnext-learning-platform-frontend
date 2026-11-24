import { describe, expect, it } from "vitest";
import { discountFor, formatTaka } from "./utils";

describe("formatTaka", () => {
  it("formats whole Taka with the ৳ sign and no decimals", () => {
    expect(formatTaka(0)).toBe("৳0");
    expect(formatTaka(999)).toBe("৳999");
    expect(formatTaka(4900)).toBe("৳4,900");
  });

  it("uses South-Asian (lakh) grouping", () => {
    expect(formatTaka(124000)).toBe("৳1,24,000");
    expect(formatTaka(16800)).toBe("৳16,800");
  });

  it("rounds to the nearest Taka", () => {
    expect(formatTaka(3919.6)).toBe("৳3,920");
    expect(formatTaka(3919.4)).toBe("৳3,919");
  });
});

describe("discountFor", () => {
  it("returns the promo discount in whole Taka", () => {
    expect(discountFor(4900, 20)).toBe(980);
    expect(discountFor(5900, 0)).toBe(0);
    expect(discountFor(3950, 15)).toBe(593);
  });
});
