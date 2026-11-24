import { useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AuthCard, AuthHeader } from "@/components/auth/AuthCard";
import CheckoutShell, { CheckoutGrid } from "@/components/checkout/CheckoutShell";
import CycleToggle from "@/components/checkout/CycleToggle";
import OrderSummary, { SummaryItem } from "@/components/checkout/OrderSummary";
import PaymentFailed from "@/components/checkout/PaymentFailed";
import PaymentForm from "@/components/checkout/PaymentForm";
import { useWalletCheckout } from "@/components/checkout/useWalletCheckout";
import WalletPending from "@/components/checkout/WalletPending";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import { PRO_FEATURES, PRO_PRICE, PRO_YEARLY_PER_MONTH, parseCycle } from "@/constants/plans";
import usePageTitle from "@/hooks/usePageTitle";
import { formatDate } from "@/lib/dates";
import { formatTaka } from "@/lib/utils";
import { useSubscription } from "@/queries/account";
import { useApplyPromo, usePlacePlanOrder } from "@/queries/checkout";
import type { Subscription } from "@/types/account";
import type { BillingCycle } from "@/types/commerce";

const linkBtn = "btn w-full rounded-[13px] px-5 py-3.75 text-[14.5px]";

const AlreadyPro = ({ sub }: { sub: Subscription }) => (
  <AuthCard>
    <AuthHeader icon="workspace_premium" title="You're already on Pro">
      {sub.status === "canceled" && sub.currentPeriodEnd
        ? `Your plan is cancelled but stays active until ${formatDate(sub.currentPeriodEnd)}. Resume it from Billing to keep Pro.`
        : `Every course, mentor review and certificates are unlocked${sub.currentPeriodEnd ? ` — next renewal ${formatDate(sub.currentPeriodEnd)}` : ""}.`}
    </AuthHeader>
    <Link to="/settings/billing" className={`${linkBtn} btn-primary`}>
      <Icon name="credit_card" size={18} />
      Manage billing
    </Link>
    <Link to="/courses" className="text-center text-[13.5px] font-extrabold text-brand">
      Browse courses
    </Link>
  </AuthCard>
);

const TeamsPlan = () => (
  <AuthCard>
    <AuthHeader icon="groups" title="Teams is set up with us">
      Teams plans start at 5 seats with invoiced billing and SSO. Tell us about your team and we&apos;ll get back within one business day.
    </AuthHeader>
    <Link to="/contact?topic=teams" className={`${linkBtn} btn-primary`}>
      <Icon name="mail" size={18} />
      Talk to us
    </Link>
    <Link to="/pricing" className="text-center text-[13.5px] font-extrabold text-brand">
      Back to pricing
    </Link>
  </AuthCard>
);

const ProCheckout = ({ cycle, onCycle }: { cycle: BillingCycle; onCycle: (c: BillingCycle) => void }) => {
  const navigate = useNavigate();
  const promo = useApplyPromo();
  const order = usePlacePlanOrder();
  const flow = useWalletCheckout((paid) => navigate(`/orders/${paid.id}`));
  const price = PRO_PRICE[cycle];

  return (
    <CheckoutGrid
      summary={
        <OrderSummary
          item={
            <SummaryItem
              icon="workspace_premium"
              grad="linear-gradient(165deg,#0F2A4E,#1B6FD0)"
              title={`Pro plan · ${cycle === "yearly" ? "Yearly" : "Monthly"}`}
              meta={
                cycle === "yearly"
                  ? `${formatTaka(PRO_YEARLY_PER_MONTH)} / month, billed yearly`
                  : `${formatTaka(PRO_PRICE.monthly)} / month · cancel anytime`
              }
            />
          }
          priceLabel={cycle === "yearly" ? "Pro, 12 months" : "Pro, 1 month"}
          price={price}
          promo={promo.data}
          perks={PRO_FEATURES}
        />
      }
    >
      {flow.phase === "pending" && flow.pendingOrder ? (
        <WalletPending
          order={flow.pendingOrder}
          approving={flow.approving}
          onApprove={flow.approve}
          onCancel={() => flow.abandon()}
          onExpire={() => flow.abandon("The payment request expired before it was approved. No money was taken.")}
        />
      ) : flow.phase === "failed" ? (
        <PaymentFailed message={flow.failure ?? ""} onRetry={flow.retry} backTo="/pricing" />
      ) : (
        <>
          <CycleToggle cycle={cycle} onChange={onCycle} disabled={order.isPending} />
          <PaymentForm
            price={price}
            promo={promo}
            pending={order.isPending}
            error={order.error}
            onPay={(payment, promoCode) => order.mutate({ cycle, payment, promoCode }, { onSuccess: flow.placed })}
            note="Cancel anytime from Settings → Billing. 30-day money-back guarantee."
          />
        </>
      )}
    </CheckoutGrid>
  );
};

/** Decided at first load, so a successful payment (which makes the user Pro) doesn't flash "already on Pro" before the receipt. */
const ProContent = ({ sub, cycle, onCycle }: { sub: Subscription; cycle: BillingCycle; onCycle: (c: BillingCycle) => void }) => {
  const [proOnArrival] = useState(sub.plan === "pro");
  return proOnArrival ? <AlreadyPro sub={sub} /> : <ProCheckout cycle={cycle} onCycle={onCycle} />;
};

/** /checkout/plan/:plan?cycle=monthly|yearly — Pro checkout; Teams goes to the contact form. */
const PlanCheckout = () => {
  const { plan = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const cycle = parseCycle(params.get("cycle"));
  usePageTitle(plan === "teams" ? "Teams plan" : "Go Pro");
  const subscription = useSubscription();

  if (plan !== "pro" && plan !== "teams") return <Navigate to="/pricing" replace />;

  return (
    <CheckoutShell closeTo="/pricing">
      {plan === "teams" ? (
        <TeamsPlan />
      ) : (
        <QueryStatus query={subscription}>
          {(sub) => <ProContent sub={sub} cycle={cycle} onCycle={(c) => setParams({ cycle: c }, { replace: true })} />}
        </QueryStatus>
      )}
    </CheckoutShell>
  );
};

export default PlanCheckout;
