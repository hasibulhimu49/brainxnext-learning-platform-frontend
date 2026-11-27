import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { errorMessage } from "@/api/envelope";
import { SettingsCard } from "@/components/learner/settings/SettingsBlocks";
import { canRequestRefund } from "@/lib/billing";
import { formatShortDate } from "@/lib/dates";
import { formatTaka } from "@/lib/utils";
import { useCancelOrder } from "@/queries/checkout";
import type { OrderRecord } from "@/types/commerce";
import OrderStatusPill from "./OrderStatusPill";
import PendingPaymentDialog from "./PendingPaymentDialog";
import RefundDialog from "./RefundDialog";

const pill =
  "rounded-full border border-line bg-surface px-3.75 py-2 text-[12.5px] font-bold whitespace-nowrap text-ink transition-colors hover:bg-surface2 hover:text-ink";

/**
 * Billing history: every order with status, total, receipt link and (when eligible) a refund request.
 * A bKash / Nagad order still waiting for approval can be resumed (approve screen again) or cancelled.
 */
const OrderHistory = ({ orders }: { orders: OrderRecord[] }) => {
  const [refunding, setRefunding] = useState<OrderRecord | null>(null);
  const [resuming, setResuming] = useState<OrderRecord | null>(null);
  const cancel = useCancelOrder();
  const cancelOrder = (o: OrderRecord) =>
    cancel.mutate(o.id, {
      onSuccess: () => toast("Payment cancelled — no money was taken"),
      onError: (e) => toast.error(errorMessage(e)),
    });
  return (
    <SettingsCard title="Billing history">
      {orders.length === 0 ? (
        <p className="m-0 text-[13.5px] font-semibold text-soft">No payments yet. Orders and receipts will show up here.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3.75 last:border-b-0">
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-ink">{o.itemTitle}</div>
                <div className="mt-1 text-xs font-semibold text-soft">
                  {formatShortDate(o.createdAt)} · {o.method} · <span className="font-mono">{o.id}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <OrderStatusPill status={o.status} />
                <strong className="text-ink">{formatTaka(o.total)}</strong>
                <Link to={`/orders/${o.id}`} className={pill} aria-label={`Receipt for ${o.itemTitle}`}>
                  Receipt
                </Link>
                {o.status === "pending" && (
                  <>
                    <button type="button" onClick={() => setResuming(o)} className={pill} aria-label={`Finish paying for ${o.itemTitle}`}>
                      Resume payment
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelOrder(o)}
                      disabled={cancel.isPending && cancel.variables === o.id}
                      className={pill}
                      aria-label={`Cancel the payment for ${o.itemTitle}`}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {canRequestRefund(o) && (
                  <button type="button" onClick={() => setRefunding(o)} className={pill}>
                    Request refund
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <RefundDialog order={refunding} onClose={() => setRefunding(null)} />
      <PendingPaymentDialog order={resuming} onClose={() => setResuming(null)} />
    </SettingsCard>
  );
};

export default OrderHistory;
