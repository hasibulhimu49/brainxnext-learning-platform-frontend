import type { ReactNode } from "react";
import Icon from "@/components/common/Icon";
import { discountFor, formatTaka } from "@/lib/utils";
import type { PromoResult } from "@/types/account";

interface OrderSummaryProps {
  /** the item row (cover + title + meta) */
  item: ReactNode;
  priceLabel: string;
  price: number;
  promo?: PromoResult;
  perks: readonly string[];
}

/** "Order summary" aside next to the payment form: item, price, promo line, total (VAT included), perks. */
const OrderSummary = ({ item, priceLabel, price, promo, perks }: OrderSummaryProps) => {
  const discount = discountFor(price, promo?.percentOff ?? 0);
  return (
    <aside className="order-1 overflow-hidden rounded-[26px] border border-line bg-surface shadow-card min-[961px]:sticky min-[961px]:top-5 min-[961px]:order-2">
      <div className="border-b border-line px-6.5 py-5.5">
        <h2 className="m-0 font-display text-[17px] font-extrabold text-ink">Order summary</h2>
      </div>
      <div className="flex flex-col gap-4.5 px-6.5 py-5.5">
        {item}
        <div className="flex flex-col gap-2.5 border-t border-line pt-4 text-[13.5px] font-semibold text-muted">
          <span className="flex justify-between gap-3">
            <span>{priceLabel}</span>
            <span className="font-extrabold text-ink">{formatTaka(price)}</span>
          </span>
          {discount > 0 && promo && (
            <span className="flex justify-between gap-3 text-success">
              <span className="font-bold">
                Promo {promo.code} (−{promo.percentOff}%)
              </span>
              <span className="font-extrabold">−{formatTaka(discount)}</span>
            </span>
          )}
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-4">
          <span className="text-sm font-extrabold text-ink">Total</span>
          <span className="flex flex-col items-end">
            <span className="font-display text-[26px] font-extrabold text-ink">{formatTaka(price - discount)}</span>
            <span className="text-[11.5px] font-bold text-soft">VAT included</span>
          </span>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2.25 rounded-[14px] border border-line bg-surface2 px-4 py-3.75 text-[12.5px] font-semibold text-muted">
          {perks.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <Icon name="check" size={16} className="text-success" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

/** Gradient tile + title + meta line used as the summary's item row. */
export const SummaryItem = ({ icon, grad, title, meta }: { icon: string; grad: string; title: string; meta: string }) => (
  <div className="flex items-center gap-3.5">
    <span className="flex h-13 w-19 flex-none items-center justify-center rounded-xl" style={{ background: grad }}>
      <Icon name={icon} size={22} className="text-white" />
    </span>
    <span className="flex min-w-0 flex-col gap-1">
      <span className="font-display text-[14.5px] font-bold text-ink">{title}</span>
      <span className="text-xs font-semibold text-soft">{meta}</span>
    </span>
  </div>
);

export default OrderSummary;
