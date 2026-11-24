import type { OrderStatus } from "@/types/commerce";

const STYLE: Record<OrderStatus, { label: string; cls: string }> = {
  paid: { label: "PAID", cls: "bg-success/14 text-success" },
  pending: { label: "PENDING", cls: "bg-amber/16 text-amber" },
  failed: { label: "FAILED", cls: "bg-danger/12 text-danger" },
  refund_requested: { label: "REFUND REQUESTED", cls: "bg-chip text-brand" },
  refunded: { label: "REFUNDED", cls: "bg-surface2 text-muted" },
};

const OrderStatusPill = ({ status }: { status: OrderStatus }) => (
  <span className={`pill w-max px-2.25 py-1.25 text-[11px] whitespace-nowrap ${STYLE[status].cls}`}>{STYLE[status].label}</span>
);

export default OrderStatusPill;
