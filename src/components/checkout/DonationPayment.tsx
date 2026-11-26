import { useState } from "react";
import { errorMessage } from "@/api/envelope";
import { Alert } from "@/components/common/FormFeedback";
import Icon from "@/components/common/Icon";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/utils";
import { useDonate } from "@/queries/checkout";
import { PAYMENT_METHODS } from "@/schemas/checkout";
import type { PaymentMethod } from "@/types/account";
import type { OrderRecord } from "@/types/commerce";
import MethodPicker from "./MethodPicker";

interface DonationPaymentProps {
  amount: number;
  onBack: () => void;
  onPaid: (order: OrderRecord) => void;
}

/** Support step 2: pick a method and pay the chosen amount (creates a `donation` order). */
const DonationPayment = ({ amount, onBack, onPaid }: DonationPaymentProps) => {
  const [method, setMethod] = useState<PaymentMethod>("bKash");
  const donate = useDonate();

  if (donate.isPending) {
    return (
      <div className="flex flex-col items-center gap-4 py-6" role="status" aria-live="polite">
        <Icon name="progress_activity" size={40} className="animate-spin text-brand" />
        <span className="font-display text-lg font-extrabold text-ink">Processing your {formatTaka(amount)} contribution…</span>
        <span className="text-[13px] font-semibold text-soft">Don&apos;t close this page.</span>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-5 text-left">
      <div className="flex items-baseline justify-between gap-3 rounded-[14px] border border-line bg-surface2 px-4 py-3.5">
        <span className="text-[13.5px] font-bold text-muted">Your contribution</span>
        <span className="flex flex-col items-end">
          <span className="font-display text-[24px] font-extrabold text-ink">{formatTaka(amount)}</span>
          <span className="text-[11.5px] font-bold text-soft">VAT included</span>
        </span>
      </div>
      <MethodPicker methods={PAYMENT_METHODS} value={method} onChange={setMethod} />
      {donate.isError && <Alert>{errorMessage(donate.error)}</Alert>}
      <Button
        size="none"
        shape="rounded"
        onClick={() => donate.mutate({ amount, method }, { onSuccess: onPaid })}
        className="w-full px-5 py-3.75 text-[15px]"
      >
        <Icon name="favorite" size={18} />
        Support with {formatTaka(amount)}
      </Button>
      <button type="button" onClick={onBack} className="text-center text-[13.5px] font-bold text-soft hover:text-muted">
        Choose a different amount
      </button>
    </div>
  );
};

export default DonationPayment;
