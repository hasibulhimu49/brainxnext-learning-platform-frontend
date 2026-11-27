import type { ReactNode } from "react";
import type { useWalletCheckout } from "@/hooks/useWalletCheckout";
import PaymentFailed from "./PaymentFailed";
import WalletPending from "./WalletPending";

const EXPIRED = "The payment request expired before it was approved. No money was taken.";

interface CheckoutFlowProps {
  flow: ReturnType<typeof useWalletCheckout>;
  /** "Go back" on the failed screen */
  backTo: string;
  /** the payment form (shown until an order is placed, and again after "Try again") */
  children: ReactNode;
}

/** The pending wallet approval → failed → payment form switch shared by the course, cart and plan checkouts. */
const CheckoutFlow = ({ flow, backTo, children }: CheckoutFlowProps) => {
  if (flow.phase === "pending" && flow.pendingOrder) {
    return (
      <WalletPending
        order={flow.pendingOrder}
        approving={flow.approving}
        onApprove={flow.approve}
        onCancel={() => flow.abandon()}
        onExpire={() => flow.abandon(EXPIRED)}
      />
    );
  }
  if (flow.phase === "failed") return <PaymentFailed message={flow.failure ?? ""} onRetry={flow.retry} backTo={backTo} />;
  return <>{children}</>;
};

export default CheckoutFlow;
