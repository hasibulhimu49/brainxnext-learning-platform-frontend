import type { ReactNode } from "react";
import Icon from "@/components/common/Icon";
import AuthLayout from "@/layouts/AuthLayout";

/** AuthLayout with the "Secure checkout" badge and trust footer, shared by course and plan checkout. */
const CheckoutShell = ({ children, closeTo }: { children: ReactNode; closeTo?: string }) => (
  <AuthLayout
    closeTo={closeTo}
    mainClassName="items-start pt-5 pb-16"
    headerExtra={
      <span className="inline-flex items-center gap-1.75 rounded-full border border-line bg-surface px-4 py-2.25 text-[12.5px] font-bold text-muted max-[400px]:hidden">
        <Icon name="lock" size={16} className="text-success" />
        Secure checkout
      </span>
    }
    footer={
      <span className="flex flex-wrap justify-center gap-4.5 text-[13px] text-soft">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="lock" size={15} />
          256-bit SSL
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="verified_user" size={15} />
          PCI-DSS compliant
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="currency_exchange" size={15} />
          30-day refunds
        </span>
      </span>
    }
  >
    {children}
  </AuthLayout>
);

/** Two-column checkout grid: payment card (left) + summary (right); stacks below 961px with the summary first. */
export const CheckoutGrid = ({ children, summary }: { children: ReactNode; summary: ReactNode }) => (
  <div className="grid w-full max-w-240 grid-cols-1 items-start gap-5.5 min-[961px]:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
    <div className="order-2 flex flex-col gap-5.5 rounded-[26px] border border-line bg-surface px-5 py-6.5 shadow-pop min-[561px]:p-8.5 min-[961px]:order-1">
      {children}
    </div>
    {summary}
  </div>
);

export default CheckoutShell;
