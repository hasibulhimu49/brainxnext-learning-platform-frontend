import { useState } from "react";
import HeroBand from "@/components/common/HeroBand";
import Icon from "@/components/common/Icon";
import CtaBanner from "@/components/marketing/CtaBanner";
import FaqItem from "@/components/marketing/FaqItem";
import PricingCard, { type PricingCardProps } from "@/components/marketing/PricingCard";
import { PRO_FEATURES, PRO_PRICE, PRO_YEARLY_PER_MONTH } from "@/constants/plans";
import { formatTaka } from "@/lib/utils";
import usePageTitle from "@/hooks/usePageTitle";

const FAQS = [
  {
    q: "Is the free tier really free?",
    a: "Yes — 12 complete courses with every lesson, exercise file and handbook open. No card, no trial timer, no paywall mid-module. You only pay for mentor review, certificates and guided paths.",
  },
  {
    q: "What happens if I cancel Pro?",
    a: "You keep access until the end of the billing period, and any course you bought outright stays yours forever. Your progress and certificates are never deleted.",
  },
  {
    q: "Can I buy a single course instead?",
    a: "Yes. Paid courses can be bought one-time (৳3,900–৳8,900) with lifetime access — no subscription needed. Pro is just cheaper if you take more than one course a year.",
  },
  {
    q: "How does mentor review work?",
    a: "Submit your project from the course player. A working practitioner reads your code or case study and returns written, line-level feedback within 48 hours.",
  },
  {
    q: "Do you offer refunds?",
    a: "30-day money-back guarantee on all paid plans and single-course purchases — no questions asked. Email hello@brainxnext.com and we'll process it within 2 business days.",
  },
  {
    q: "Is there a student discount?",
    a: "Yearly billing is already 25% off. Students in Bangladesh can also pay in Taka via bKash or Nagad at checkout, and we run cohort scholarships each quarter — watch the newsletter.",
  },
];

const Pricing = () => {
  usePageTitle("Pricing");
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const plans: PricingCardProps[] = [
    {
      name: "FREE",
      price: "৳0",
      per: "forever",
      note: "For trying real courses, not demos.",
      features: [
        "12 complete courses",
        "All notes & handbooks",
        "Community Q&A",
        "Progress tracking",
        { text: "Mentor review", included: false },
        { text: "Certificates", included: false },
      ],
      cta: "Start free",
      to: "/register",
    },
    {
      name: "PRO",
      price: formatTaka(yearly ? PRO_YEARLY_PER_MONTH : PRO_PRICE.monthly),
      per: yearly ? "/ month, billed yearly" : "/ month",
      note: yearly
        ? `${formatTaka(PRO_PRICE.yearly)} billed once a year — save ${formatTaka(PRO_PRICE.monthly * 12 - PRO_PRICE.yearly)}.`
        : "For serious, self-paced learners.",
      features: [...PRO_FEATURES],
      cta: "Go Pro",
      to: `/checkout/plan/pro?cycle=${yearly ? "yearly" : "monthly"}`,
      popular: true,
      className: "shadow-[0_28px_60px_rgba(10,27,51,.4)]!",
    },
    {
      name: "TEAMS",
      price: yearly ? "৳1,000" : "৳1,400",
      per: yearly ? "/ seat / mo, yearly" : "/ seat · min 5",
      note: "For companies training 5+ people.",
      features: ["Everything in Pro", "Cohort dashboards", "Assigned learning plans", "SSO & invoiced billing", "Priority support"],
      cta: "Talk to us",
      to: "/contact?topic=teams",
    },
  ];

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
          Start free with 12 full courses. Upgrade when you want mentor review, certificates and guided paths.
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
            <span className="bg-grad-gold rounded-full px-2 py-0.75 text-[10.5px] font-extrabold text-cocoa">−25%</span>
          </button>
        </div>
      </HeroBand>

      <section className="bg-page px-4.5 pb-22 sm:px-6">
        <div className="relative mx-auto -mt-21 grid max-w-275 grid-cols-1 items-stretch gap-5 min-[1001px]:grid-cols-3">
          {plans.map((p) => (
            <PricingCard key={p.name} {...p} elevated />
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

      <CtaBanner title="Still deciding?" highlight="Start with the free tier." />
    </>
  );
};

export default Pricing;
