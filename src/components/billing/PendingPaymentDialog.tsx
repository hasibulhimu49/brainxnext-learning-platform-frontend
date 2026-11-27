import { useNavigate } from "react-router-dom";
import PaymentFailed from "@/components/checkout/PaymentFailed";
import WalletPending from "@/components/checkout/WalletPending";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useWalletCheckout } from "@/hooks/useWalletCheckout";
import type { OrderRecord } from "@/types/commerce";

const EXPIRED = "The payment request expired before it was approved. No money was taken.";

/** The approve screen for one pending order; mounted only while the dialog is open. */
const ResumeFlow = ({ order, onClose }: { order: OrderRecord; onClose: () => void }) => {
  const navigate = useNavigate();
  const flow = useWalletCheckout((paid) => {
    onClose();
    navigate(`/orders/${paid.id}`);
  }, order);

  if (flow.phase === "failed") return <PaymentFailed message={flow.failure ?? ""} onRetry={onClose} backTo="/settings/billing" />;
  if (!flow.pendingOrder) return null;
  return (
    <WalletPending
      order={flow.pendingOrder}
      approving={flow.approving}
      onApprove={flow.approve}
      onCancel={() => {
        flow.abandon();
        onClose();
      }}
      onExpire={() => flow.abandon(EXPIRED)}
    />
  );
};

/** Billing history → "Resume": re-opens "Approve on your phone" for a bKash / Nagad order still waiting. */
const PendingPaymentDialog = ({ order, onClose }: { order: OrderRecord | null; onClose: () => void }) => (
  <Dialog open={order !== null} onOpenChange={(open) => !open && onClose()}>
    <DialogContent>
      <DialogTitle className="sr-only">Finish your payment</DialogTitle>
      <DialogDescription className="sr-only">Approve the {order?.method} request on your phone, or cancel it.</DialogDescription>
      {order && <ResumeFlow order={order} onClose={onClose} />}
    </DialogContent>
  </Dialog>
);

export default PendingPaymentDialog;
