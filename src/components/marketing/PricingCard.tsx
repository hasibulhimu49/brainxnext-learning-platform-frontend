import { Link } from "react-router-dom";
import Icon from "../common/Icon";

/**
 * Plan card. `popular` renders the dark navy highlighted version.
 * features: array of strings, or { text, included: false } for greyed-out rows.
 */
export type PlanFeature = string | { text: string; included: boolean };

export interface PricingCardProps {
  name: string;
  price: string;
  per: string;
  note?: string;
  features: PlanFeature[];
  cta: string;
  to: string;
  popular?: boolean;
  elevated?: boolean;
  className?: string;
}

const PricingCard = ({
  name,
  price,
  per,
  note,
  features,
  cta,
  to,
  popular = false,
  elevated = false,
  className = "",
}: PricingCardProps) => {
  const shell = popular
    ? "relative border border-[rgba(111,183,255,.35)] bg-[linear-gradient(165deg,#0F2A4E,#0A1B33)] text-white shadow-[0_24px_54px_rgba(10,27,51,.35)]"
    : `border border-line bg-surface ${elevated ? "shadow-card-lg" : "shadow-card"}`;

  return (
    <div className={`flex flex-col gap-4.5 rounded-3xl px-7 py-8 ${shell} ${className}`}>
      {popular && (
        <span className="bg-grad-gold absolute -top-3.25 left-7 rounded-full px-3.5 py-1.25 text-[11px] font-extrabold tracking-[0.08em] text-cocoa">
          MOST POPULAR
        </span>
      )}
      <div className={`text-xs font-extrabold tracking-[0.12em] ${popular ? "text-[#8FD8E8]" : "text-soft"}`}>{name}</div>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-display text-[42px] font-extrabold ${popular ? "" : "text-ink"}`}>{price}</span>
        <span className={`text-sm font-bold ${popular ? "text-[#A9BFD8]" : "text-soft"}`}>{per}</span>
      </div>
      {note && <p className={`m-0 text-[13.5px] leading-[1.55] font-semibold ${popular ? "text-[#A9BFD8]" : "text-muted"}`}>{note}</p>}
      <ul className={`m-0 flex list-none flex-col gap-2.75 p-0 text-sm leading-normal ${popular ? "text-[#C9DAEC]" : "text-muted"}`}>
        {features.map((f) => {
          const item = typeof f === "string" ? { text: f, included: true } : f;
          return (
            <li key={item.text} className={`flex items-center gap-2.25 ${item.included ? "" : "text-soft"}`}>
              <Icon
                name={item.included ? "check_circle" : "remove"}
                size={17}
                className={item.included ? (popular ? "text-gold" : "text-success") : ""}
              />
              {item.text}
            </li>
          );
        })}
      </ul>
      <Link to={to} className={`btn mt-auto px-5 ${popular ? "btn-primary py-3.75" : "btn-outline bg-transparent! py-3.5"}`}>
        {cta}
      </Link>
    </div>
  );
};

export default PricingCard;
