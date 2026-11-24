import { Link } from "react-router-dom";
import Icon from "../common/Icon";

/** Rounded navy call-to-action panel: heading (+ optional text) on the left, gold button on the right. */
interface CtaBannerProps {
  title: string;
  highlight: string;
  text?: string;
  cta?: string;
  to?: string;
  className?: string;
}

const CtaBanner = ({ title, highlight, text, cta = "Create a free account", to = "/register", className = "pb-22" }: CtaBannerProps) => (
  <section className={`bg-page px-4.5 sm:px-6 ${className}`}>
    <div className="relative mx-auto flex max-w-275 flex-wrap items-center justify-between gap-7 overflow-hidden rounded-4xl bg-navy bg-[radial-gradient(700px_440px_at_85%_0%,rgba(27,111,208,.42),transparent_65%),radial-gradient(560px_380px_at_10%_100%,rgba(233,162,27,.24),transparent_65%)] px-6 py-13 text-white shadow-[0_30px_70px_rgba(10,27,51,.28)] sm:px-12">
      <div className="flex flex-col gap-2.5">
        <h2 className="m-0 font-display text-[clamp(24px,3.2vw,36px)] leading-[1.15] font-extrabold tracking-[-0.02em]">
          {title}
          <br />
          <span className="text-grad-hero">{highlight}</span>
        </h2>
        {text && <p className="m-0 max-w-[46ch] text-[14.5px] font-semibold text-[#C9DAEC]">{text}</p>}
      </div>
      <Link to={to} className="btn btn-gold px-7 py-4 text-[15px]">
        {cta}
        <Icon name="arrow_forward" size={18} />
      </Link>
    </div>
  </section>
);

export default CtaBanner;
