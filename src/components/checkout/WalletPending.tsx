import { useEffect, useState } from "react";
import { USE_MOCK_API } from "@/api/config";
import Icon from "@/components/common/Icon";
import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/utils";
import type { OrderRecord } from "@/types/commerce";
import { METHOD_STYLE } from "@/constants/payments";

/** How long the learner has to approve the wallet request. */
export const APPROVAL_SECONDS = 120;

interface WalletPendingProps {
  order: OrderRecord;
  approving: boolean;
  onApprove: (simulateFailure?: boolean) => void;
  onCancel: () => void;
  onExpire: () => void;
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** "Approve on your phone" — shown while a bKash / Nagad order is pending. */
const WalletPending = ({ order, approving, onApprove, onCancel, onExpire }: WalletPendingProps) => {
  const [left, setLeft] = useState(APPROVAL_SECONDS);

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (left === 0) onExpire();
  }, [left, onExpire]);

  const style = METHOD_STYLE[order.method];

  return (
    <div className="flex flex-col items-center gap-4.5 py-2 text-center" aria-live="polite">
      <span className="relative flex h-21 w-21 items-center justify-center rounded-full border border-line bg-surface2">
        <Icon name="progress_activity" size={84} className="absolute animate-spin text-brand/35" />
        <Icon name={style.icon} size={34} style={{ color: style.color }} />
      </span>
      <h1 className="m-0 font-display text-2xl font-extrabold tracking-[-0.02em] text-ink">Approve on your phone</h1>
      <p className="m-0 max-w-[40ch] text-[14.5px] leading-relaxed font-medium text-muted">
        We sent a {order.method} payment request for <span className="font-extrabold text-ink">{formatTaka(order.total)}</span> to{" "}
        <span className="font-extrabold text-ink">{order.account}</span>. Open the {order.method} app and confirm with your PIN.
      </p>
      <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface2 px-4 py-2 text-[13px] font-extrabold text-ink">
        <Icon name="timer" size={17} className="text-amber" />
        <span role="timer" aria-label="Time left to approve">
          {mmss(left)}
        </span>
        <span className="font-semibold text-soft">left</span>
      </span>
      <Button
        size="none"
        shape="rounded"
        disabled={approving}
        aria-busy={approving || undefined}
        onClick={() => onApprove()}
        className="w-full max-w-[320px] px-5 py-3.75 text-[14.5px]"
      >
        <Icon name="check_circle" size={18} />
        I&apos;ve approved
      </Button>
      <Button
        variant="outline"
        size="none"
        shape="rounded"
        disabled={approving}
        onClick={onCancel}
        className="w-full max-w-[320px] px-5 py-3"
      >
        Cancel payment
      </Button>
      {USE_MOCK_API && (
        <button
          type="button"
          disabled={approving}
          onClick={() => onApprove(true)}
          className="text-[12.5px] font-bold text-soft underline underline-offset-[3px] hover:text-muted"
        >
          Demo: simulate a declined payment
        </button>
      )}
    </div>
  );
};

export default WalletPending;
