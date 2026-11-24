import { z } from "zod";

const digits = (v: string) => v.replace(/\D/g, "");

export const cardPaymentSchema = z.object({
  method: z.literal("Card"),
  cardName: z.string().trim().min(1, "Enter the name on the card"),
  cardNumber: z.string().refine((v) => digits(v).length === 16, "Enter the 16-digit card number"),
  expiry: z.string().refine((v) => digits(v).length === 4, "Enter the expiry as MM / YY"),
  cvc: z.string().regex(/^\d{3,4}$/, "Enter the 3–4 digit CVC"),
});

export const walletPaymentSchema = z.object({
  method: z.enum(["bKash", "Nagad"]),
  walletNumber: z.string().refine((v) => digits(v).length >= 11, "Enter your 11-digit account number"),
});

export const paymentSchema = z.discriminatedUnion("method", [cardPaymentSchema, walletPaymentSchema]);
export type PaymentValues = z.infer<typeof paymentSchema>;

export const PAYMENT_METHODS = ["Card", "bKash", "Nagad"] as const;

/**
 * What the checkout form holds. Fields for every method live side by side (so switching method
 * keeps what was typed); only the selected method's fields are validated.
 */
export const checkoutFormSchema = z
  .object({
    method: z.enum(PAYMENT_METHODS),
    cardName: z.string(),
    cardNumber: z.string(),
    expiry: z.string(),
    cvc: z.string(),
    walletNumber: z.string(),
    promo: z.string(),
  })
  .superRefine((v, ctx) => {
    const result = v.method === "Card" ? cardPaymentSchema.safeParse(v) : walletPaymentSchema.safeParse(v);
    if (result.success) return;
    for (const issue of result.error.issues) ctx.addIssue({ code: "custom", message: issue.message, path: issue.path });
  });
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const defaultCheckoutValues: CheckoutFormValues = {
  method: "Card",
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
  walletNumber: "",
  promo: "",
};

/** Narrow the form values to the payload for the selected method. */
export const toPayment = (v: CheckoutFormValues): PaymentValues =>
  v.method === "Card"
    ? { method: "Card", cardName: v.cardName, cardNumber: v.cardNumber, expiry: v.expiry, cvc: v.cvc }
    : { method: v.method, walletNumber: v.walletNumber };

export const promoSchema = z.object({ code: z.string().trim().min(1, "Enter a promo code").toUpperCase() });
export type PromoValues = z.infer<typeof promoSchema>;

export const formatCardNumber = (v: string) =>
  digits(v)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();

export const formatExpiry = (v: string) => {
  const d = digits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
};

export const onlyDigits = (max: number) => (v: string) => digits(v).slice(0, max);
