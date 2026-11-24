import { Link, Navigate, useSearchParams } from "react-router-dom";
import HandbookDownload from "@/components/checkout/HandbookDownload";
import Icon from "@/components/common/Icon";
import { parseSupportAmount } from "@/constants/support";
import usePageTitle from "@/hooks/usePageTitle";
import AuthLayout from "@/layouts/AuthLayout";
import { formatTaka } from "@/lib/utils";
import { useHandbookName } from "@/queries/courses";

const primaryCls = "btn btn-primary w-full max-w-[320px] rounded-[13px] px-5 py-3.75 text-[14.5px]";

/** /thank-you?amount=&handbook= — after a donation; downloads the handbook the visitor came for. */
const ThankYou = () => {
  const [params] = useSearchParams();
  usePageTitle("Thank you");
  const amount = parseSupportAmount(params.get("amount"));
  const handbook = useHandbookName(params.get("handbook"));
  if (amount === null) return <Navigate to="/support" replace />;

  return (
    <AuthLayout
      closeTo="/notes"
      footer={<span className="text-[13px] text-soft">100% of contributions go to servers, content and keeping notes free.</span>}
    >
      <div className="flex w-full max-w-150 flex-col items-center gap-5.5 rounded-[28px] border border-line bg-surface px-5.5 py-8.5 text-center shadow-pop sm:p-11">
        <span className="flex h-18 w-18 items-center justify-center rounded-full border border-success/35 bg-success/12">
          <Icon name="volunteer_activism" size={34} className="text-success" />
        </span>
        <h1 className="m-0 font-display text-[26px] font-extrabold tracking-[-0.02em] text-ink max-[560px]:text-2xl">Thank you so much!</h1>
        <p className="m-0 max-w-[44ch] text-[15px] leading-[1.65] font-medium text-muted">
          Your {formatTaka(amount)} contribution keeps free education free.
          {handbook ? ` Your ${handbook} handbook is ready to download.` : " Head back to the handbooks to pick the one you want."}
        </p>
        {handbook ? (
          <HandbookDownload name={handbook} className={primaryCls}>
            <Icon name="download" size={18} />
            Download the {handbook} handbook
          </HandbookDownload>
        ) : (
          <Link to="/notes" className={primaryCls}>
            <Icon name="menu_book" size={18} />
            Back to handbooks
          </Link>
        )}
        {handbook && (
          <Link to="/notes" className="text-[13px] font-bold text-soft hover:text-muted">
            Back to handbooks
          </Link>
        )}
      </div>
    </AuthLayout>
  );
};

export default ThankYou;
