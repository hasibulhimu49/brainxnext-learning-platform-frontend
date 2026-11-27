import { useState } from "react";
import { errorMessage } from "@/api/envelope";
import { useCancelOrder, useConfirmOrder } from "@/queries/checkout";
import type { OrderRecord } from "@/types/commerce";

export type CheckoutPhase = "form" | "pending" | "failed";

/**
 * The payment flow after an order is placed. Card orders come back `paid` → `onPaid`.
 * bKash / Nagad orders come back `pending` → the "Approve on your phone" screen, which resolves
 * through confirm (paid → `onPaid`, declined → failed state) or cancel / timeout (failed state).
 * `resume`: start on the approve screen for an order that is already pending (Billing history).
 */
export const useWalletCheckout = (onPaid: (order: OrderRecord) => void, resume: OrderRecord | null = null) => {
  const confirm = useConfirmOrder();
  const cancel = useCancelOrder();
  const [pendingOrder, setPendingOrder] = useState<OrderRecord | null>(resume?.status === "pending" ? resume : null);
  const [failure, setFailure] = useState<string | null>(null);

  const placed = (order: OrderRecord) => {
    if (order.status === "pending") setPendingOrder(order);
    else onPaid(order);
  };

  const fail = (message: string) => {
    setPendingOrder(null);
    setFailure(message);
  };

  const approve = (simulateFailure = false) => {
    if (!pendingOrder) return;
    confirm.mutate(
      { id: pendingOrder.id, simulateFailure },
      { onSuccess: onPaid, onError: (e) => fail(errorMessage(e, "The payment didn't go through.")) }
    );
  };

  /** the learner cancelled, or the request timed out */
  const abandon = (message?: string) => {
    if (pendingOrder) cancel.mutate(pendingOrder.id);
    if (message) fail(message);
    else setPendingOrder(null);
  };

  const phase: CheckoutPhase = failure ? "failed" : pendingOrder ? "pending" : "form";

  return {
    phase,
    pendingOrder,
    failure,
    placed,
    approve,
    abandon,
    approving: confirm.isPending,
    retry: () => setFailure(null),
  };
};
