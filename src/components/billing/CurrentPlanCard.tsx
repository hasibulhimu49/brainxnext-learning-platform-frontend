import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { errorMessage } from "@/api/envelope";
import { Alert } from "@/components/common/FormFeedback";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { PillBtn, SettingsCard } from "@/components/learner/settings/SettingsBlocks";
import { PRO_FEATURES, PRO_PRICE, PRO_YEARLY_PER_MONTH } from "@/constants/plans";
import { formatDate } from "@/lib/dates";
import { formatTaka } from "@/lib/utils";
import { useCancelSubscription, useChangeCycle, useResumeSubscription } from "@/queries/account";
import type { Subscription } from "@/types/account";

const FREE_FEATURES = ["12 complete courses", "All notes & handbooks", "Community Q&A", "Progress tracking"];

const box = "rounded-[18px] border border-[#CFE0F4] bg-[#F7FBFF] p-5.5 dark:border-line dark:bg-surface2";

const FreePlan = () => (
  <div className={box}>
    <div className="text-xs font-extrabold text-soft">FREE PLAN</div>
    <div className="my-2 text-[30px] font-extrabold text-ink">
      ৳0 <span className="text-[13px] text-soft">forever</span>
    </div>
    {FREE_FEATURES.map((f) => (
      <div key={f} className="my-2.5 text-[13px] font-bold text-muted">
        ✓ {f}
      </div>
    ))}
    <p className="mt-3 mb-0 text-[13px] font-semibold text-soft">Go Pro for every course, mentor review and certificates.</p>
    <div className="mt-4.5 flex flex-wrap gap-2.5">
      <Link
        to="/checkout/plan/pro?cycle=monthly"
        className="inline-flex rounded-full border border-brand bg-brand px-4.5 py-2.5 text-[13px] font-bold text-white hover:bg-[#165fb3] hover:text-white"
      >
        Go Pro — {formatTaka(PRO_PRICE.monthly)}/mo
      </Link>
      <Link
        to="/checkout/plan/pro?cycle=yearly"
        className="inline-flex rounded-full border border-line bg-surface px-4.5 py-2.5 text-[13px] font-bold text-ink hover:bg-surface2 hover:text-ink"
      >
        Yearly — {formatTaka(PRO_YEARLY_PER_MONTH)}/mo
      </Link>
    </div>
  </div>
);

type Pending = "cycle" | "cancel" | null;

const ProPlan = ({ sub }: { sub: Subscription & { cycle: NonNullable<Subscription["cycle"]>; currentPeriodEnd: string } }) => {
  const [confirming, setConfirming] = useState<Pending>(null);
  const changeCycle = useChangeCycle();
  const cancel = useCancelSubscription();
  const resume = useResumeSubscription();
  const yearly = sub.cycle === "yearly";
  const otherCycle = yearly ? "monthly" : "yearly";
  const end = formatDate(sub.currentPeriodEnd);
  const error = changeCycle.error ?? cancel.error ?? resume.error;

  return (
    <div className={box}>
      <div className="text-xs font-extrabold text-brand">PRO PLAN · {yearly ? "YEARLY" : "MONTHLY"}</div>
      <div className="my-2 text-[30px] font-extrabold text-ink">
        {formatTaka(PRO_PRICE[sub.cycle])} <span className="text-[13px] text-soft">/ {yearly ? "year" : "month"}</span>
      </div>
      <p className="mt-0 mb-3 text-[13px] font-extrabold text-ink" role="status">
        {sub.status === "canceled" ? `Cancelled — active until ${end}` : `Renews on ${end}`}
      </p>
      {PRO_FEATURES.map((f) => (
        <div key={f} className="my-2.5 text-[13px] font-bold text-muted">
          ✓ {f}
        </div>
      ))}
      <div className="mt-5.5 flex flex-wrap gap-2.5">
        {sub.status === "canceled" ? (
          <PillBtn
            primary
            disabled={resume.isPending}
            onClick={() => resume.mutate(undefined, { onSuccess: () => toast("Pro resumed — welcome back") })}
          >
            Resume Pro
          </PillBtn>
        ) : (
          <>
            <PillBtn primary onClick={() => setConfirming("cycle")}>
              Switch to {otherCycle}
            </PillBtn>
            <PillBtn onClick={() => setConfirming("cancel")}>Cancel plan</PillBtn>
          </>
        )}
      </div>
      {!!error && (
        <div className="mt-3">
          <Alert>{errorMessage(error)}</Alert>
        </div>
      )}

      <ConfirmDialog
        open={confirming === "cycle"}
        onOpenChange={(o) => !o && setConfirming(null)}
        title={`Switch to ${otherCycle} billing?`}
        description={`From your next renewal on ${end} you'll pay ${formatTaka(PRO_PRICE[otherCycle])} per ${yearly ? "month" : "year"}. Nothing changes today.`}
        confirmLabel={`Switch to ${otherCycle}`}
        pending={changeCycle.isPending}
        onConfirm={() =>
          changeCycle.mutate(otherCycle, {
            onSuccess: () => {
              setConfirming(null);
              toast(`Billing changes to ${otherCycle} on ${end}`);
            },
          })
        }
      />
      <ConfirmDialog
        open={confirming === "cancel"}
        onOpenChange={(o) => !o && setConfirming(null)}
        title="Cancel Pro?"
        description={`You keep Pro until ${end}, then your account moves to Free. Courses you bought, your progress and certificates stay.`}
        confirmLabel="Cancel plan"
        danger
        pending={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(undefined, {
            onSuccess: () => {
              setConfirming(null);
              toast(`Pro cancelled — active until ${end}`);
            },
          })
        }
      />
    </div>
  );
};

/** Settings → Billing → Current plan (from GET /me/subscription). */
const CurrentPlanCard = ({ sub }: { sub: Subscription }) => (
  <SettingsCard title="Current plan">
    {sub.plan === "pro" && sub.cycle && sub.currentPeriodEnd ? (
      <ProPlan sub={{ ...sub, cycle: sub.cycle, currentPeriodEnd: sub.currentPeriodEnd }} />
    ) : (
      <FreePlan />
    )}
  </SettingsCard>
);

export default CurrentPlanCard;
