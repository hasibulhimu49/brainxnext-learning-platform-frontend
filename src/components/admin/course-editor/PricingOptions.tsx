import Icon from "@/components/common/Icon";
import type { CourseDraftValues } from "@/schemas/course";

type Pricing = CourseDraftValues["pricing"];

const OPTIONS = [
  {
    key: "free",
    icon: "volunteer_activism",
    color: "text-success",
    title: "Free course",
    sub: "Open to everyone, forever",
  },
  { key: "paid", icon: "paid", color: "text-amber", title: "Paid course", sub: "One-time purchase + Pro access" },
] as const;

/** Free / paid toggle cards. */
const PricingOptions = ({ value, onChange }: { value: Pricing; onChange: (v: Pricing) => void }) => (
  <div className="flex flex-wrap gap-2.5">
    {OPTIONS.map((o) => {
      const on = value === o.key;
      return (
        <button
          key={o.key}
          type="button"
          aria-pressed={on}
          onClick={() => onChange(o.key)}
          className={`flex min-w-37.5 flex-1 flex-col gap-1.25 rounded-2xl border-[1.5px] px-4.5 py-4 text-left text-ink transition-all hover:border-brand ${
            on ? "border-brand bg-chip" : "border-line bg-surface2"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-extrabold">
            <Icon name={o.icon} size={18} className={o.color} />
            {o.title}
          </span>
          <span className="text-xs font-semibold text-soft">{o.sub}</span>
        </button>
      );
    })}
  </div>
);

export default PricingOptions;
