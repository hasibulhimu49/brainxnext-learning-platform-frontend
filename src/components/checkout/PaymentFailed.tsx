import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";
import { Button } from "@/components/ui/button";

/** The wallet declined, the learner cancelled or the request timed out. Nothing was charged. */
const PaymentFailed = ({ message, onRetry, backTo }: { message: string; onRetry: () => void; backTo: string }) => (
  <div className="flex flex-col items-center gap-4.5 py-2 text-center" role="alert">
    <span className="flex h-18 w-18 items-center justify-center rounded-full border border-danger/35 bg-danger/8">
      <Icon name="error" size={34} className="text-danger" />
    </span>
    <h1 className="m-0 font-display text-2xl font-extrabold tracking-[-0.02em] text-ink">Payment failed</h1>
    <p className="m-0 max-w-[40ch] text-[14.5px] leading-relaxed font-medium text-muted">{message}</p>
    <Button size="none" shape="rounded" onClick={onRetry} className="w-full max-w-[320px] px-5 py-3.75 text-[14.5px]">
      <Icon name="refresh" size={18} />
      Try again
    </Button>
    <Link to={backTo} className="text-[13.5px] font-extrabold text-brand">
      Go back
    </Link>
  </div>
);

export default PaymentFailed;
