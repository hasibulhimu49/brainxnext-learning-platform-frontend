import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Alert } from "@/components/common/FormFeedback";
import Icon from "@/components/common/Icon";
import { courseCover, formatTaka, handbookPath } from "@/lib/utils";
import { useInCart, useShopStore } from "@/stores/shopStore";
import type { CourseDetail } from "@/types/course";
import WishlistButton from "@/components/shop/WishlistButton";

const INCLUDES: { icon: string; color: string; text?: string }[] = [
  { icon: "smart_display", color: "#1B6FD0" },
  { icon: "code", color: "#0E97B0", text: "Source code for every class" },
  { icon: "quiz", color: "#E9A21B", text: "Practice problems per module" },
  { icon: "all_inclusive", color: "#3FA457", text: "Lifetime access" },
  { icon: "smartphone", color: "#7A4FD0", text: "Watch on any device" },
];

interface BuyCardProps {
  course: CourseDetail;
  enrolled: boolean;
  /** signed-in Pro member: a paid course is included, so the action enrols */
  includedInPro?: boolean;
  pending: boolean;
  error?: string;
  onPrimary: () => void;
  onPreview: () => void;
}

/** Course detail sticky card: cover with preview button, price, enrol / buy / go-to-course action. */
const BuyCard = ({ course, enrolled, includedInPro = false, pending, error, onPrimary, onPreview }: BuyCardProps) => {
  const label = enrolled ? "Go to course" : course.free ? "Enroll for free" : includedInPro ? "Enroll with Pro" : "Buy this course";
  // cart (F-004): only paid courses the learner doesn't already have access to
  const canCart = !course.free && !enrolled && !includedInPro;
  const inCart = useInCart(course.id);
  const addToCart = useShopStore((s) => s.addToCart);

  // phones/tablets: once the main button scrolls out of view, a slim bar keeps price + action on screen
  const primaryRef = useRef<HTMLButtonElement>(null);
  const [primaryHidden, setPrimaryHidden] = useState(false);
  useEffect(() => {
    const el = primaryRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) =>
      setPrimaryHidden(entry ? !entry.isIntersecting && entry.boundingClientRect.top < 0 : false)
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // keep the footer's last row reachable while the bar is showing (mobile only)
  useEffect(() => {
    if (!primaryHidden || window.matchMedia("(min-width: 1001px)").matches) return;
    document.body.style.paddingBottom = "76px";
    // lifts the Next AI circle above the bar
    document.body.style.setProperty("--bx-bottom-bar", "76px");
    return () => {
      document.body.style.paddingBottom = "";
      document.body.style.removeProperty("--bx-bottom-bar");
    };
  }, [primaryHidden]);

  return (
    <>
      <aside className="overflow-hidden rounded-3xl border border-line bg-surface text-ink shadow-[0_24px_60px_rgba(0,0,0,.35)] min-[1001px]:sticky min-[1001px]:top-22">
        <div className="relative aspect-video" style={{ background: courseCover(course) }}>
          <span className="absolute inset-0 flex items-center justify-center bg-[rgba(8,21,39,.35)]">
            <button
              type="button"
              aria-label="Play preview"
              onClick={onPreview}
              className="flex h-15.5 w-15.5 items-center justify-center rounded-full border-0 bg-white/92 shadow-[0_10px_30px_rgba(0,0,0,.4)] transition-transform hover:scale-[1.08]"
            >
              <Icon name="play_arrow" size={32} className="text-brand" />
            </button>
          </span>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-baseline gap-2.5">
            <span className={`font-display text-[30px] font-extrabold ${course.free ? "text-success" : "text-ink"}`}>
              {course.free ? "Free" : formatTaka(course.price)}
            </span>
            <span className="text-[13px] font-bold text-soft">
              {course.free
                ? "forever · no card needed"
                : includedInPro
                  ? "included in your Pro plan"
                  : course.oldPrice
                    ? `was ${formatTaka(course.oldPrice)}`
                    : "one-time"}
            </span>
          </div>
          <button
            ref={primaryRef}
            type="button"
            onClick={onPrimary}
            disabled={pending}
            aria-busy={pending || undefined}
            className={`btn rounded-[13px] px-5 py-3.75 text-[15px] ${enrolled ? "bg-success text-white hover:-translate-y-0.5" : "btn-primary"}`}
          >
            {enrolled && <Icon name="play_arrow" size={18} />}
            {label}
          </button>
          {error && <Alert>{error}</Alert>}
          {!enrolled && (
            <div className="flex flex-wrap gap-2.5">
              {canCart &&
                (inCart ? (
                  <Link to="/cart" className="btn btn-outline min-w-0 flex-1 rounded-[13px] bg-transparent! px-4.5 py-3">
                    <Icon name="shopping_cart_checkout" size={17} />
                    In cart — view cart
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(course.id);
                      toast("Added to your cart", { description: course.title });
                    }}
                    className="btn btn-outline min-w-0 flex-1 rounded-[13px] bg-transparent! px-4.5 py-3"
                  >
                    <Icon name="add_shopping_cart" size={17} />
                    Add to cart
                  </button>
                ))}
              <WishlistButton courseId={course.id} title={course.title} variant="full" className="min-w-0 flex-1" />
            </div>
          )}
          <Link to={handbookPath(course)} className="btn btn-outline rounded-[13px] bg-transparent! px-4.5 py-3.25">
            <Icon name="download" size={17} />
            Download the handbook
          </Link>
          <ul className="m-0 flex list-none flex-col gap-2.5 border-t border-line p-0 pt-4 text-[13.5px] font-semibold text-muted">
            {INCLUDES.map((i) => (
              <li key={i.icon} className="flex items-center gap-2.25">
                <Icon name={i.icon} size={17} style={{ color: i.color }} />
                {i.text ?? `${course.lessons} video classes · ${course.hours}`}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      {primaryHidden && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] text-ink shadow-[0_-10px_30px_rgba(10,27,51,.12)] backdrop-blur-md min-[1001px]:hidden">
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-[12.5px] font-bold text-soft">{course.title}</span>
            <span className={`font-display text-lg font-extrabold ${course.free ? "text-success" : "text-ink"}`}>
              {course.free ? "Free" : includedInPro ? "In your Pro plan" : formatTaka(course.price)}
            </span>
          </span>
          <button
            type="button"
            onClick={onPrimary}
            disabled={pending}
            className={`btn flex-none rounded-[13px] px-5 py-3 text-[14px] ${enrolled ? "bg-success text-white" : "btn-primary"}`}
          >
            {label}
          </button>
        </div>
      )}
    </>
  );
};

export default BuyCard;
