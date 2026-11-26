import { describe, expect, it } from "vitest";
import { checkoutFormSchema, defaultCheckoutValues, formatCardNumber, formatExpiry, toPayment } from "./checkout";

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
