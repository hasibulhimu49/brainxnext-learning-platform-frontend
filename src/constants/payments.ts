import type { PaymentMethod } from "@/types/account";

/** Icon + brand colour per payment method (checkout tiles, wallet pending screen). */
export const METHOD_STYLE: Record<PaymentMethod, { icon: string; color: string }> = {
  Card: { icon: "credit_card", color: "#1B6FD0" },
  bKash: { icon: "smartphone", color: "#D0491B" },
  Nagad: { icon: "send_to_mobile", color: "#E9A21B" },
};
