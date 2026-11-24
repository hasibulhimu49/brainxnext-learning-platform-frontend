import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { PaymentValues } from "@/schemas/checkout";
import { checkoutService } from "@/services/checkoutService";
import type { PaymentMethod } from "@/types/account";
import type { BillingCycle, OrderRecord } from "@/types/commerce";
import { queryKeys } from "./keys";
import { invalidateLearning } from "./learning";

/** A paid order enrols the buyer (course) or starts Pro (plan); either way orders and notifications change. */
export const invalidateAfterOrder = (qc: QueryClient, order: OrderRecord) => {
  qc.setQueryData(queryKeys.me.order(order.id), order);
  return Promise.all([
    qc.invalidateQueries({ queryKey: queryKeys.me.orders, exact: true }),
    qc.invalidateQueries({ queryKey: queryKeys.me.notifications }),
    order.kind === "course" ? invalidateLearning(qc, order.itemId) : null,
    order.kind === "plan" ? qc.invalidateQueries({ queryKey: queryKeys.me.subscription }) : null,
  ]);
};

export const useApplyPromo = () => useMutation({ mutationFn: checkoutService.applyPromo });

interface CourseOrderVariables {
  courseId: string;
  payment: PaymentValues;
  promoCode?: string;
}

export const usePlaceOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, payment, promoCode }: CourseOrderVariables) => checkoutService.placeOrder(courseId, payment, promoCode),
    onSuccess: (order) => invalidateAfterOrder(qc, order),
  });
};

interface PlanOrderVariables {
  cycle: BillingCycle;
  payment: PaymentValues;
  promoCode?: string;
}

export const usePlacePlanOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cycle, payment, promoCode }: PlanOrderVariables) => checkoutService.placePlanOrder(cycle, payment, promoCode),
    onSuccess: (order) => invalidateAfterOrder(qc, order),
  });
};

export const useDonate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, method }: { amount: number; method: PaymentMethod }) => checkoutService.donate(amount, method),
    onSuccess: (order) => invalidateAfterOrder(qc, order),
  });
};

/** Approve a pending wallet payment. Fails with PAYMENT_DECLINED when the wallet declines. */
export const useConfirmOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, simulateFailure }: { id: string; simulateFailure?: boolean }) => checkoutService.confirmOrder(id, simulateFailure),
    onSuccess: (order) => invalidateAfterOrder(qc, order),
    onError: () => qc.invalidateQueries({ queryKey: queryKeys.me.orders }),
  });
};

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: checkoutService.cancelOrder,
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.me.orders }),
  });
};
