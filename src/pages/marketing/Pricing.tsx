import { useState } from "react";
import HeroBand from "@/components/common/HeroBand";
import Icon from "@/components/common/Icon";
import CtaBanner from "@/components/marketing/CtaBanner";
import FaqItem from "@/components/marketing/FaqItem";
import PricingCard from "@/components/marketing/PricingCard";
import { planCards } from "@/components/marketing/planCards";
import useCatalogStats from "@/components/marketing/useCatalogStats";
import { PRO_YEARLY_SAVING_PCT, REFUND_WINDOW_DAYS } from "@/constants/plans";
import usePageTitle from "@/hooks/usePageTitle";
import { useIsPro } from "@/queries/account";
import { useSessionUser } from "@/stores/authStore";

const FAQS = [
  {
    q: "Is the free tier really free?",
    a: "Yes — every free course is complete, with every lesson, exercise file and handbook open. Career roadmaps are open to everyone too. No card, no trial timer, no paywall mid-module. You only pay for paid courses, mentor review and certificates.",
  },
  {
    q: "What happens if I cancel Pro?",
    a: "You keep access until the end of the billing period, and any course you bought outright stays yours forever. Your progress and certificates are never deleted.",
  },
  {
    q: "Can I buy a single course instead?",
    a: "Yes. Any paid course can be bought one-time with lifetime access — and it includes that course's certificate and mentor review of its project. No subscription needed; Pro is just cheaper if you take more than one course a year.",
  },
  {
    q: "How does mentor review work?",
    a: "Submit your project from the course player. A working practitioner reads your code or case study and returns written, line-level feedback within 48 hours. It comes with Pro, and with any course you bought.",
  },
  {
    q: "Do you offer refunds?",
    a: `${REFUND_WINDOW_DAYS}-day money-back guarantee on all paid plans and single-course purchases — no questions asked. Email hello@brainxnext.com and we'll process it within 2 business days.`,
  },
  {
    q: "Is there a student discount?",
    a: `Yearly billing is already ${PRO_YEARLY_SAVING_PCT}% off. Students in Bangladesh can also pay in Taka via bKash or Nagad at checkout, and we run cohort scholarships each quarter — watch the newsletter.`,
  },
];

const Pricing = () => {
  usePageTitle("Pricing");
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const stats = useCatalogStats();
  const signedIn = useSessionUser() !== null;
  const isPro = useIsPro() === true;
  const plans = planCards({ cycle: yearly ? "yearly" : "monthly", stats, signedIn, isPro, detailed: true });

  const cycleBtn = (on: boolean) =>
    `inline-flex items-center gap-2 rounded-full border-0 px-5.5 py-2.5 text-[13.5px] font-extrabold transition-all ${
      on ? "bg-white/92 text-[#13293F]" : "bg-transparent text-[#C9DAEC]"
    }`;

  return (
    <>
      <HeroBand className="pt-16 pb-35" innerClassName="max-w-180 items-center text-center">
        <div className="eyebrow-dark">
          <Icon name="payments" size={16} className="text-gold" />
          NO LOCK-IN · CANCEL ANYTIME
        </div>
        <h1 className="m-0 font-display text-[clamp(32px,4.4vw,52px)] leading-[1.06] font-extrabold tracking-[-0.02em]">
          Simple, honest <span className="text-grad-hero">pricing</span>
        </h1>
        <p className="m-0 max-w-130 text-base leading-relaxed font-semibold text-[#C3D8EF]">
          {stats ? `Start free with ${stats.free} full courses.` : "Start free with every free course."} Upgrade when you want every course,
          mentor review and certificates.
        </p>
        <div
          className="inline-flex items-center rounded-full border border-white/22 bg-white/10 p-1.25 backdrop-blur-sm"
          role="group"
          aria-label="Billing cycle"
        >
          <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)} className={cycleBtn(!yearly)}>
            Monthly
          </button>
          <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)} className={cycleBtn(yearly)}>
            Yearly
            <span className="bg-grad-gold rounded-full px-2 py-0.75 text-[10.5px] font-extrabold text-cocoa">
              −{PRO_YEARLY_SAVING_PCT}%
            </span>
          </button>
        </div>
      </HeroBand>

      <section className="bg-page px-4.5 pb-22 sm:px-6">
        <div className="relative mx-auto -mt-21 grid max-w-275 grid-cols-1 items-stretch gap-5 min-[1001px]:grid-cols-3">
          {plans.map((p) => (
            <PricingCard key={p.name} {...p} elevated className={p.popular ? "shadow-[0_28px_60px_rgba(10,27,51,.4)]!" : ""} />
          ))}
        </div>
      </section>

      <section className="bg-page px-4.5 pb-22 sm:px-6">
        <div className="mx-auto max-w-275">
          <h2 className="mt-0 mb-7 text-center font-display text-[clamp(24px,3vw,34px)] font-extrabold tracking-[-0.02em] text-ink">
            Questions, answered
          </h2>
          <div className="grid grid-cols-1 gap-3.5 min-[1001px]:grid-cols-2">
            {FAQS.map((f, i) => (
              <FaqItem key={f.q} {...f} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </section>

      {signedIn ? (
        <CtaBanner title="Ready for the next one?" highlight="Pick a course." cta="Browse courses" to="/courses" />
      ) : (
        <CtaBanner title="Still deciding?" highlight="Start with the free tier." />
      )}
    </>
  );
};

export default Pricing;
