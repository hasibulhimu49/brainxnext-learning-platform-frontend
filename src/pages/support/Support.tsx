import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import DonationPayment from "@/components/checkout/DonationPayment";
import HandbookDownload from "@/components/checkout/HandbookDownload";
import Icon from "@/components/common/Icon";
import { SUPPORT_AMOUNTS } from "@/constants/support";
import usePageTitle from "@/hooks/usePageTitle";
import AuthLayout from "@/layouts/AuthLayout";
import { formatTaka } from "@/lib/utils";
import { useHandbookName } from "@/queries/courses";

const skipCls = "text-[13.5px] font-semibold text-soft underline underline-offset-[3px] hover:text-muted";

/**
 * /support?handbook=<slug> — "Support our platform" before a free handbook download:
 * pick an amount → pay (method + processing, creates a donation order) → /thank-you, which downloads the handbook.
 * Continuing without supporting downloads it straight away.
 */
const Support = () => {
  usePageTitle("Support us");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const handbook = params.get("handbook");
  const handbookName = useHandbookName(handbook);
  const [amount, setAmount] = useState<number | null>(null);

  const thankYou = (n: number) => navigate(`/thank-you?amount=${n}${handbook ? `&handbook=${encodeURIComponent(handbook)}` : ""}`);

  return (
    <AuthLayout
      closeTo="/notes"
      footer={<span className="text-[13px] text-soft">100% of contributions go to servers, content and keeping notes free.</span>}
    >
      <div className="flex w-full max-w-150 flex-col items-center gap-5 rounded-[28px] border border-line bg-surface px-5.5 py-8 text-center shadow-pop min-[561px]:p-11">
        <span className="flex h-18 w-18 animate-pulse-soft items-center justify-center rounded-full border border-line bg-surface2">
          <Icon name="favorite" size={34} className="text-brand" />
        </span>
        <h1 className="m-0 font-display text-[clamp(24px,3.4vw,30px)] font-extrabold tracking-[-0.02em] text-ink">Support Our Platform</h1>

        {amount === null ? (
          <>
            <p className="m-0 max-w-[52ch] text-[15px] leading-[1.65] font-medium text-muted">
              We removed ads and made all our notes and resources completely free to keep education accessible for everyone.
            </p>
            <p className="m-0 max-w-[52ch] text-[15px] leading-[1.65] font-medium text-muted">
              Your contribution helps us maintain the servers, create new content, and keep this platform running for thousands of students
              like you.
            </p>
            <p className="m-0 text-sm font-bold text-ink">Higher amounts help us provide free education to more students!</p>

            <div className="grid w-full grid-cols-1 gap-3 min-[561px]:grid-cols-2">
              {SUPPORT_AMOUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAmount(n)}
                  className="btn btn-primary rounded-[13px] px-4.5 py-3.75 text-[15.5px]"
                >
                  <Icon name="favorite" size={18} />
                  {formatTaka(n)}
                </button>
              ))}
            </div>

            {handbookName ? (
              <HandbookDownload name={handbookName} className={skipCls}>
                No thanks, just download
              </HandbookDownload>
            ) : (
              <Link to="/notes" className={skipCls}>
                No thanks, back to handbooks
              </Link>
            )}
          </>
        ) : (
          <DonationPayment amount={amount} onBack={() => setAmount(null)} onPaid={() => thankYou(amount)} />
        )}
      </div>
    </AuthLayout>
  );
};

export default Support;
