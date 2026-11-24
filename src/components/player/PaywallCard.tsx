import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";
import { formatTaka } from "@/lib/utils";

/** Over the video when a paid lesson is opened without owning the course. */
const PaywallCard = ({ courseId, price }: { courseId: string; price: number }) => (
  <div className="relative z-2 mx-4 flex max-w-105 flex-col items-center gap-3.5 rounded-[22px] border border-white/15 bg-[rgba(10,27,51,.88)] px-6 py-7 text-center text-white shadow-[0_20px_48px_rgba(0,0,0,.45)] backdrop-blur-sm">
    <span className="bg-grad-gold flex h-12 w-12 items-center justify-center rounded-2xl">
      <Icon name="lock" size={24} className="text-cocoa" />
    </span>
    <h2 className="m-0 font-display text-lg font-extrabold">This class is part of the full course</h2>
    <p className="m-0 text-[13.5px] leading-relaxed font-medium text-[#C3D8EF]">
      Preview classes are free. Buy the course once to unlock every class, the source code and your certificate.
    </p>
    <div className="flex flex-wrap justify-center gap-2.5">
      <Link to={`/checkout/${courseId}`} className="btn btn-gold px-5.5 py-3 text-[14px]">
        Buy for {formatTaka(price)}
      </Link>
      <Link to="/pricing" className="btn border border-white/25 bg-white/10 px-5.5 py-3 text-[14px] text-white hover:text-white">
        See Pro
      </Link>
    </div>
  </div>
);

export default PaywallCard;
