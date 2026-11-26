import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AuthCard, AuthHeader } from "@/components/auth/AuthCard";
import CheckoutShell, { CheckoutGrid } from "@/components/checkout/CheckoutShell";
import OrderSummary, { SummaryItem } from "@/components/checkout/OrderSummary";
import PaymentFailed from "@/components/checkout/PaymentFailed";
import PaymentForm from "@/components/checkout/PaymentForm";
import { useWalletCheckout } from "@/hooks/useWalletCheckout";
import WalletPending from "@/components/checkout/WalletPending";
import Icon from "@/components/common/Icon";
import { useCart } from "@/hooks/useCart";
import usePageTitle from "@/hooks/usePageTitle";
import { plural } from "@/lib/utils";
import { useApplyPromo, usePlaceCartOrder } from "@/queries/checkout";
import { useShopStore } from "@/stores/shopStore";
import type { Course } from "@/types/course";

const PERKS = ["Lifetime access to every course", "Certificates on completion", "Mentor review included", "30-day money-back guarantee"];

const CartCheckoutView = ({ items }: { items: Course[] }) => {
  const navigate = useNavigate();
  const promo = useApplyPromo();
  // a code applied in the cart comes along as ?promo= and is re-checked here
  const [params] = useSearchParams();
  const cartPromo = (params.get("promo") ?? "").trim().toUpperCase();
  const { mutate: applyPromo } = promo;
  useEffect(() => {
    if (cartPromo) applyPromo(cartPromo);
  }, [cartPromo, applyPromo]);
  const order = usePlaceCartOrder();
  const removeMany = useShopStore((s) => s.removeManyFromCart);
  const flow = useWalletCheckout((paid) => {
    removeMany((paid.items ?? []).map((i) => i.courseId));
    navigate(`/orders/${paid.id}`);
  });
  const subtotal = items.reduce((sum, c) => sum + c.price, 0);

  return (
    <CheckoutGrid
      summary={
        <OrderSummary
          item={
            <div className="flex flex-col gap-3.5">
              {items.map((c) => (
                <SummaryItem key={c.id} icon={c.icon} grad={c.grad} title={c.title} meta={`${c.lessons} lessons · ${c.mentor}`} />
              ))}
            </div>
          }
          priceLabel={`Subtotal (${plural(items.length, "course")})`}
          price={subtotal}
          promo={promo.data}
          perks={PERKS}
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
        <PaymentFailed message={flow.failure ?? ""} onRetry={flow.retry} backTo="/cart" />
      ) : (
        <PaymentForm
          price={subtotal}
          promo={promo}
          pending={order.isPending}
          error={order.error}
          onPay={(payment, promoCode) =>
            order.mutate({ courseIds: items.map((c) => c.id), payment, promoCode }, { onSuccess: flow.placed })
          }
          note="One payment for every course in your cart. 30-day money-back guarantee."
          initialPromo={cartPromo}
        />
      )}
    </CheckoutGrid>
  );
};

const IncludedInPro = () => (
  <AuthCard>
    <AuthHeader icon="workspace_premium" title="Already included in Pro">
      Your Pro plan unlocks every course, so there&apos;s nothing to pay for.
    </AuthHeader>
    <Link to="/dashboard/courses" className="btn btn-primary w-full rounded-[13px] px-5 py-3.75 text-[14.5px]">
      <Icon name="school" size={18} />
      Go to my courses
    </Link>
  </AuthCard>
);

/** Freezes the cart at first load, so paying (which enrols, and empties the cart) doesn't re-render an empty checkout. */
const CartCheckoutContent = ({ items, isPro }: { items: Course[]; isPro: boolean }) => {
  const [snapshot] = useState(items);
  if (isPro) return <IncludedInPro />;
  if (snapshot.length === 0) return <Navigate to="/cart" replace />;
  return <CartCheckoutView items={snapshot} />;
};

/** /checkout/cart — pay once for every course in the cart (F-004, sign-in required). */
const CartCheckout = () => {
  usePageTitle("Checkout");
  const { items, ready, isPro } = useCart();
  return <CheckoutShell closeTo="/cart">{ready ? <CartCheckoutContent items={items} isPro={isPro} /> : null}</CheckoutShell>;
};

export default CartCheckout;
