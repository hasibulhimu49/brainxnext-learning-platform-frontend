import type { BillingCycle } from "@/types/commerce";

interface CycleToggleProps {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  disabled?: boolean;
}

const btn = (on: boolean) =>
  `inline-flex flex-1 items-center justify-center gap-2 rounded-full border-0 px-4 py-2.5 text-[13.5px] font-extrabold transition-all disabled:opacity-55 ${
    on ? "bg-brand text-white shadow-[0_6px_18px_rgba(27,111,208,.3)]" : "bg-transparent text-muted hover:text-brand"
  }`;

/** Monthly / Yearly segmented control (the Pricing hero toggle, on a light card). */
const CycleToggle = ({ cycle, onChange, disabled }: CycleToggleProps) => (
  <div className="flex rounded-full border border-line bg-surface2 p-1.25" role="group" aria-label="Billing cycle">
    <button
      type="button"
      aria-pressed={cycle === "monthly"}
      disabled={disabled}
      onClick={() => onChange("monthly")}
      className={btn(cycle === "monthly")}
    >
      Monthly
    </button>
    <button
      type="button"
      aria-pressed={cycle === "yearly"}
      disabled={disabled}
      onClick={() => onChange("yearly")}
      className={btn(cycle === "yearly")}
    >
      Yearly
      <span className="bg-grad-gold rounded-full px-2 py-0.75 text-[10.5px] font-extrabold text-cocoa">−25%</span>
    </button>
  </div>
);

export default CycleToggle;
