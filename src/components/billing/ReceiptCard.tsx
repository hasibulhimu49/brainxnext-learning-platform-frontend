import LogoMark from "@/components/common/LogoMark";
import { formatDate } from "@/lib/dates";
import { formatTaka } from "@/lib/utils";
import type { OrderRecord } from "@/types/commerce";
import OrderStatusPill from "./OrderStatusPill";

const KIND_LABEL: Record<OrderRecord["kind"], string> = {
  course: "Course",
  plan: "Subscription",
  donation: "Contribution",
  cart: "Courses",
};

/** The printable receipt: who, what, how it was paid, and the totals (whole taka, VAT included). */
const ReceiptCard = ({ order }: { order: OrderRecord }) => {
  const meta = [
    { label: "ORDER ID", value: order.id, mono: true },
    { label: "DATE", value: formatDate(order.createdAt) },
    { label: "PAID WITH", value: order.account ? `${order.method} ${order.account}` : order.method },
    { label: "BILLED TO", value: order.userName },
  ];
  return (
    <article className="receipt overflow-hidden rounded-[26px] border border-line bg-surface shadow-pop">
      <div className="h-2 bg-[linear-gradient(90deg,#1B6FD0,#0E97B0_55%,#F7C948)]" />
      <div className="flex flex-col gap-5.5 px-5.5 py-7 sm:px-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2.5">
            <LogoMark size={36} className="shadow-none!" />
            <span className="font-display text-base font-extrabold text-ink">BrainXNext</span>
          </span>
          <OrderStatusPill status={order.status} />
        </div>

        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
          {meta.map((m) => (
            <span key={m.label} className="flex min-w-0 flex-col gap-1">
              <span className="text-[10.5px] font-extrabold tracking-widest text-soft">{m.label}</span>
              <span className={`truncate text-[13.5px] font-extrabold ${m.mono ? "font-mono text-brand" : "text-ink"}`}>{m.value}</span>
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2.5 border-t border-line pt-4 text-[13.5px] font-semibold text-muted">
          <span className="flex justify-between gap-3">
            <span className="flex min-w-0 flex-col">
              <span className="font-extrabold text-ink">{order.itemTitle}</span>
              <span className="text-xs text-soft">{KIND_LABEL[order.kind]}</span>
            </span>
            <span className="font-extrabold text-ink">{formatTaka(order.subtotal)}</span>
          </span>
          {order.items && order.items.length > 1 && (
            <ul className="m-0 flex list-none flex-col gap-1.5 rounded-[13px] border border-line bg-surface2 px-4 py-3 text-[12.5px]">
              {order.items.map((i) => (
                <li key={i.courseId} className="flex justify-between gap-3">
                  <span className="min-w-0">{i.title}</span>
                  <span className="font-bold text-ink">{formatTaka(i.price)}</span>
                </li>
              ))}
            </ul>
          )}
          {order.discount > 0 && (
            <span className="flex justify-between gap-3 text-success">
              <span className="font-bold">Promo {order.promoCode}</span>
              <span className="font-extrabold">−{formatTaka(order.discount)}</span>
            </span>
          )}
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-4">
          <span className="text-sm font-extrabold text-ink">Total</span>
          <span className="flex flex-col items-end">
            <span className="font-display text-[26px] font-extrabold text-ink">{formatTaka(order.total)}</span>
            <span className="text-[11.5px] font-bold text-soft">VAT included</span>
          </span>
        </div>
        {order.refundReason && (
          <p className="m-0 rounded-[13px] border border-line bg-surface2 px-4 py-3 text-[12.5px] leading-relaxed font-semibold text-muted">
            Refund reason: {order.refundReason}
          </p>
        )}
      </div>
    </article>
  );
};

export default ReceiptCard;
