import { api } from "@/api/client";
import type { PaymentValues } from "@/schemas/checkout";
import type { PaymentMethod, PromoResult } from "@/types/account";
import type { BillingCycle, OrderRecord } from "@/types/commerce";

/** Checkout. PROVISIONAL endpoints (mock only until the backend docs arrive). */
export const checkoutService = {
  applyPromo: (code: string) => api.post<PromoResult>("/checkout/promo", { code }),
  /** Card → `paid`; bKash / Nagad → `pending` until confirmed. */
  placeOrder: (courseId: string, payment: PaymentValues, promoCode?: string) =>
    api.post<OrderRecord>("/checkout/orders", { kind: "course", courseId, payment, promoCode }),
  /** F-004: several paid courses in one order (provisional endpoint shape) */
  placeCartOrder: (courseIds: string[], payment: PaymentValues, promoCode?: string) =>
    api.post<OrderRecord>("/checkout/orders", { kind: "cart", courseIds, payment, promoCode }),
  placePlanOrder: (cycle: BillingCycle, payment: PaymentValues, promoCode?: string) =>
    api.post<OrderRecord>("/checkout/orders", { kind: "plan", plan: "pro", cycle, payment, promoCode }),
  donate: (amount: number, method: PaymentMethod) =>
    api.post<OrderRecord>("/checkout/orders", { kind: "donation", amount, payment: { method } }),
  /** The learner approved the wallet request on their phone. `simulateFailure` is a demo-only switch. */
  confirmOrder: (id: string, simulateFailure = false) =>
    api.post<OrderRecord>(`/checkout/orders/${encodeURIComponent(id)}/confirm`, simulateFailure ? { simulateFailure } : {}),
  cancelOrder: (id: string) => api.post<OrderRecord>(`/checkout/orders/${encodeURIComponent(id)}/cancel`),
};
