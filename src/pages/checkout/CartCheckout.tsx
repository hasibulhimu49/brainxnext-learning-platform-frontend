import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";
import CheckoutShell, { CheckoutGrid } from "@/components/checkout/CheckoutShell";
import IncludedInPro from "@/components/checkout/IncludedInPro";
import OrderSummary, { SummaryItem } from "@/components/checkout/OrderSummary";
import PaymentForm from "@/components/checkout/PaymentForm";
import { useWalletCheckout } from "@/hooks/useWalletCheckout";
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
                <SummaryItem key={c.id} icon={c.icon} grad={c.grad} title={c.title} meta={`${plural(c.lessons, "lesson")} · ${c.mentor}`} />
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
      <CheckoutFlow flow={flow} backTo="/cart">
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
      </CheckoutFlow>
    </CheckoutGrid>
  );
};

/** Freezes the cart at first load, so paying (which enrols, and empties the cart) doesn't re-render an empty checkout. */
const CartCheckoutContent = ({ items, isPro }: { items: Course[]; isPro: boolean }) => {
  const [snapshot] = useState(items);
  if (isPro) {
    return (
      <IncludedInPro title="Already included in Pro" to="/dashboard/courses" label="Go to my courses">
        Your Pro plan unlocks every course, so there&apos;s nothing to pay for.
      </IncludedInPro>
    );
  }
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
