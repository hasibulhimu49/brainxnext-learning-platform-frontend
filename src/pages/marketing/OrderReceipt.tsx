import { Link, useParams } from "react-router-dom";
import { API_ERROR_CODES, isApiError } from "@/api/envelope";
import { AuthCard, AuthHeader } from "@/components/auth/AuthCard";
import ReceiptCard from "@/components/billing/ReceiptCard";
import Icon from "@/components/common/Icon";
import { ErrorState, LoadingState } from "@/components/common/QueryStatus";
import { Button } from "@/components/ui/button";
import usePageTitle from "@/hooks/usePageTitle";
import AuthLayout from "@/layouts/AuthLayout";
import { useOrder } from "@/queries/account";
import type { OrderRecord } from "@/types/commerce";

const HEADLINE: Record<OrderRecord["status"], { icon: string; title: string; tone: string }> = {
  paid: { icon: "check_circle", title: "Payment successful!", tone: "border-success/35 bg-success/12 text-success" },
  pending: { icon: "hourglass_top", title: "Waiting for payment", tone: "border-amber/35 bg-amber/12 text-amber" },
  failed: { icon: "error", title: "Payment failed", tone: "border-danger/35 bg-danger/8 text-danger" },
  refund_requested: { icon: "currency_exchange", title: "Refund requested", tone: "border-brand/30 bg-chip text-brand" },
  refunded: { icon: "currency_exchange", title: "Order refunded", tone: "border-line bg-surface2 text-muted" },
};

const subline = (o: OrderRecord) => {
  if (o.status !== "paid") return "Your receipt is below.";
  if (o.kind === "course") return `You're enrolled in ${o.itemTitle}. Start whenever you're ready.`;
  if (o.kind === "plan") return "Pro is active — every course, mentor review and certificates are unlocked.";
  return "Thank you for keeping free education free.";
};

const ReceiptView = ({ order }: { order: OrderRecord }) => {
  const head = HEADLINE[order.status];
  const primary =
    order.kind === "course"
      ? { to: `/learn/${order.itemId}`, icon: "play_arrow", label: "Start learning now" }
      : order.kind === "plan"
        ? { to: "/courses", icon: "search", label: "Explore all courses" }
        : { to: "/notes", icon: "menu_book", label: "Back to handbooks" };

  return (
    <div className="flex w-full max-w-140 flex-col gap-5.5">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className={`flex h-17 w-17 items-center justify-center rounded-full border ${head.tone}`}>
          <Icon name={head.icon} size={32} />
        </span>
        <h1 className="m-0 font-display text-[clamp(22px,3vw,26px)] font-extrabold tracking-[-0.02em] text-ink">{head.title}</h1>
        <p className="m-0 max-w-[44ch] text-[14.5px] leading-relaxed font-medium text-muted">{subline(order)}</p>
      </div>

      <ReceiptCard order={order} />

      <div className="flex flex-col gap-2.5 min-[561px]:flex-row print:hidden">
        {order.status === "paid" && (
          <Link to={primary.to} className="btn btn-primary flex-1 rounded-[13px] px-5 py-3.75 text-[14.5px]">
            <Icon name={primary.icon} size={18} />
            {primary.label}
          </Link>
        )}
        <Button variant="outline" size="none" shape="rounded" onClick={() => window.print()} className="flex-1 px-5 py-3.5">
          <Icon name="print" size={18} />
          Print / download receipt
        </Button>
      </div>
      <div className="flex flex-wrap justify-center gap-5 text-[13.5px] font-extrabold print:hidden">
        <Link to="/dashboard" className="text-brand">
          Go to dashboard
        </Link>
        <Link to="/settings/billing" className="text-brand">
          Billing history
        </Link>
      </div>
    </div>
  );
};

const OrderNotFound = () => (
  <AuthCard>
    <AuthHeader icon="receipt_long" title="Order not found">
      This order doesn&apos;t exist or belongs to another account.
    </AuthHeader>
    <Link to="/settings/billing" className="btn btn-primary w-full rounded-[13px] px-5 py-3.75 text-[14.5px]">
      See your orders
    </Link>
  </AuthCard>
);

/** /orders/:orderId — receipt for one of the signed-in user's orders. */
const OrderReceipt = () => {
  const { orderId = "" } = useParams();
  usePageTitle("Receipt");
  const order = useOrder(orderId);
  const notFound = isApiError(order.error) && order.error.code === API_ERROR_CODES.notFound;

  return (
    <AuthLayout closeTo="/dashboard" mainClassName="items-start pt-5 pb-16">
      {order.isPending ? (
        <LoadingState />
      ) : notFound ? (
        <OrderNotFound />
      ) : order.isError ? (
        <ErrorState error={order.error} onRetry={() => void order.refetch()} />
      ) : (
        <ReceiptView order={order.data} />
      )}
    </AuthLayout>
  );
};

export default OrderReceipt;
