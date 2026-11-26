import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import WishlistButton from "@/components/shop/WishlistButton";
import { courseCover, formatTaka } from "@/lib/utils";
import type { Course } from "@/types/course";
import Icon from "../common/Icon";

const Meta = ({ icon, color, children }: { icon: string; color?: string; children: ReactNode }) => (
  <span className="inline-flex items-center gap-1.5">
    <Icon name={icon} size={16} style={color ? { color } : undefined} />
    {children}
  </span>
);

/**
 * Course tile.
 * variant="featured" (home page): discount + featured badges, full meta, "View Course" button
 * variant="catalog": compact, track label + level badge, mentor and price footer
 */
const CourseCard = ({ course: c, variant = "catalog" }: { course: Course; variant?: "featured" | "catalog" }) => {
  const priceLabel = c.free ? "Free" : formatTaka(c.price);
  const priceColor = c.free ? "text-success" : "text-ink";

  if (variant === "featured") {
    const off = !c.free && c.oldPrice ? Math.round((1 - c.price / c.oldPrice) * 100) : 0;
    return (
      <div className="group relative flex">
        <Link to={`/courses/${c.id}`} className="card card-hover flex w-full flex-col overflow-hidden text-ink hover:text-ink">
          <div className="relative flex aspect-video flex-col justify-between p-3.5" style={{ background: courseCover(c) }}>
            <div className="flex items-start justify-between">
              <span
                className={`rounded-lg px-3 py-1.5 text-[11.5px] font-extrabold tracking-[0.04em] whitespace-nowrap text-white shadow-[0_4px_12px_rgba(0,0,0,.25)] ${c.free ? "bg-success" : "bg-danger"}`}
              >
                {c.free ? "FREE" : off ? `${off}% OFF` : "PRO"}
              </span>
              {c.featured && (
                <span className="bg-grad-gold rounded-lg px-3 py-1.5 text-[11.5px] font-extrabold tracking-[0.04em] text-cocoa shadow-[0_4px_12px_rgba(0,0,0,.2)]">
                  Featured
                </span>
              )}
            </div>
            {!c.img && <Icon name={c.icon} size={44} className="text-white/85" />}
          </div>
          <div className="flex flex-1 flex-col gap-2.75 p-5">
            <div className="font-display text-lg leading-tight font-bold tracking-[-0.01em]">{c.title}</div>
            <div className="text-[13.5px] leading-[1.55] text-muted">{c.blurb}</div>
            <div className="mt-0.5 flex flex-wrap gap-4 text-[12.5px] font-bold text-muted">
              <Meta icon="person" color="#1B6FD0">
                {c.mentor}
              </Meta>
              <Meta icon="signal_cellular_alt" color="#0E97B0">
                {c.level}
              </Meta>
            </div>
            <div className="flex flex-wrap gap-4 text-[12.5px] font-bold text-muted">
              <Meta icon="schedule" color="#E9A21B">
                {c.hours}
              </Meta>
              <Meta icon="menu_book" color="#3FA457">
                {c.lessons} lessons
              </Meta>
              <Meta icon="translate" color="#7A4FD0">
                {c.lang || "English"}
              </Meta>
            </div>
            <div className="mt-auto flex items-baseline gap-2.5 pt-2.5">
              <span className={`font-display text-[21px] font-extrabold ${priceColor}`}>{priceLabel}</span>
              {!c.free && c.oldPrice && <span className="text-sm font-semibold text-soft line-through">{formatTaka(c.oldPrice)}</span>}
            </div>
            <span className="flex w-full items-center justify-center rounded-xl border-[1.5px] border-line bg-surface2 px-4.5 py-3.25 text-sm font-extrabold text-ink">
              View Course
            </span>
          </div>
        </Link>
        {/* sibling of the link (a button can't sit inside a link): a 16:9 overlay the size of the cover keeps the heart on its bottom-right corner and rides the hover lift */}
        <div className="pointer-events-none absolute inset-x-0 top-0 aspect-video transition-transform group-hover:-translate-y-1.5">
          <WishlistButton courseId={c.id} title={c.title} className="pointer-events-auto absolute right-3.5 bottom-3.5" />
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex">
      <Link to={`/courses/${c.id}`} className="card card-hover flex w-full flex-col overflow-hidden text-ink hover:text-ink">
        <div className="relative flex aspect-video flex-col justify-between px-5 py-4.5" style={{ background: courseCover(c) }}>
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-extrabold tracking-[0.12em] text-white/90">{c.img ? "" : c.cat.toUpperCase()}</span>
            <span className={`pill ${c.free ? "bg-white text-brand" : "bg-white/20 text-white"}`}>
              {c.free ? "FREE" : c.level.toUpperCase()}
            </span>
          </div>
          {!c.img && <Icon name={c.icon} size={44} className="text-white/85" />}
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-5">
          <div className="font-display text-lg leading-[1.2] font-bold tracking-[-0.01em]">{c.title}</div>
          <div className="flex-1 text-[13.5px] leading-[1.55] text-muted">{c.blurb}</div>
          <div className="flex flex-wrap gap-3.5 text-xs font-bold text-soft">
            <Meta icon="signal_cellular_alt">{c.level}</Meta>
            <Meta icon="menu_book">{c.lessons} lessons</Meta>
            <Meta icon="schedule">{c.hours}</Meta>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-line pt-3.5">
            <span className="text-[13px] font-bold text-muted">{c.mentor}</span>
            <span className={`font-display text-[17px] font-extrabold ${priceColor}`}>{priceLabel}</span>
          </div>
        </div>
      </Link>
      {/* sibling of the link (a button can't sit inside a link): a 16:9 overlay the size of the cover keeps the heart on its bottom-right corner and rides the hover lift */}
      <div className="pointer-events-none absolute inset-x-0 top-0 aspect-video transition-transform group-hover:-translate-y-1.5">
        <WishlistButton courseId={c.id} title={c.title} className="pointer-events-auto absolute right-3.5 bottom-3.5" />
      </div>
    </div>
  );
};

export default CourseCard;
