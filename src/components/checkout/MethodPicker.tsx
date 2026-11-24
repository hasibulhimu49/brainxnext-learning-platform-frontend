import Icon from "@/components/common/Icon";
import { METHOD_STYLE } from "@/constants/payments";
import type { PaymentMethod } from "@/types/account";

interface MethodPickerProps {
  methods: readonly PaymentMethod[];
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

/** "PAY WITH" — Card · bKash · Nagad tiles. */
const MethodPicker = ({ methods, value, onChange }: MethodPickerProps) => (
  <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
    <legend className="mb-2.5 text-[12.5px] font-extrabold tracking-[0.06em] text-soft">PAY WITH</legend>
    <div className="flex flex-wrap gap-2.5">
      {methods.map((m) => {
        const on = value === m;
        return (
          <button
            key={m}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(m)}
            className={`flex min-w-24 flex-1 flex-col items-center gap-2 rounded-2xl border-[1.5px] px-3.5 py-4 text-ink transition-all hover:border-brand ${
              on ? "border-brand bg-chip" : "border-line bg-surface2"
            }`}
          >
            <Icon name={METHOD_STYLE[m].icon} size={24} style={{ color: on ? METHOD_STYLE[m].color : "var(--soft)" }} />
            <span className="text-[13px] font-extrabold">{m}</span>
          </button>
        );
      })}
    </div>
  </fieldset>
);

export default MethodPicker;
