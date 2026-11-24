import { Link } from "react-router-dom";
import { QueryStatus } from "@/components/common/QueryStatus";
import { Row, RowText, SettingsCard } from "@/components/learner/settings/SettingsBlocks";
import { useOrders, useSubscription } from "@/queries/account";
import type { OrderRecord } from "@/types/commerce";
import CurrentPlanCard from "./CurrentPlanCard";
import OrderHistory from "./OrderHistory";

/** The method of the latest successful payment — there is no stored card; you choose a method at checkout. */
const LastPaymentMethod = ({ orders }: { orders: OrderRecord[] }) => {
  const last = orders.find((o) => o.status === "paid" || o.status === "refund_requested" || o.status === "refunded");
  return (
    <SettingsCard title="Payment method">
      {last ? (
        <div className="rounded-[14px] border border-line p-3.75">
          <strong className="text-ink">{last.method.toUpperCase()}</strong>
          <div className="mt-4.5 text-sm font-extrabold text-ink">{last.account ? `${last.method} ${last.account}` : last.method}</div>
          <div className="text-[13px] font-semibold text-soft">Used for your last payment</div>
        </div>
      ) : (
        <p className="m-0 text-[13.5px] font-semibold text-soft">No payments yet.</p>
      )}
      <p className="m-0 text-[12.5px] leading-relaxed font-semibold text-soft">
        We don&apos;t store card or wallet details — you pick Card, bKash or Nagad each time you pay.
      </p>
    </SettingsCard>
  );
};

const BillingTab = ({ email }: { email: string }) => {
  const subscription = useSubscription();
  const orders = useOrders();
  return (
    <>
      <div className="grid grid-cols-1 gap-5 min-[801px]:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
        <QueryStatus query={subscription} className="card rounded-3xl!">
          {(sub) => <CurrentPlanCard sub={sub} />}
        </QueryStatus>
        <QueryStatus query={orders} className="card rounded-3xl!">
          {(list) => <LastPaymentMethod orders={list} />}
        </QueryStatus>
      </div>

      <QueryStatus query={orders} className="card rounded-3xl!">
        {(list) => <OrderHistory orders={list} />}
      </QueryStatus>

      <SettingsCard title="Billing contact">
        <Row>
          <RowText title="Billing email" desc={email} />
          <Link to="/settings" className="text-[13px] font-extrabold text-brand">
            Change in Profile
          </Link>
        </Row>
      </SettingsCard>
    </>
  );
};

export default BillingTab;
