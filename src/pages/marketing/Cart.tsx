import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Alert } from "@/components/auth/AuthCard";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import LearnerPage, { EmptyCard } from "@/components/learner/LearnerPage";
import { useCart } from "@/hooks/useCart";
import usePageTitle from "@/hooks/usePageTitle";
import { errorMessage } from "@/api/envelope";
import { courseCover, discountFor, formatTaka, plural } from "@/lib/utils";
import { useApplyPromo } from "@/queries/checkout";
import { useShopStore } from "@/stores/shopStore";
import type { Course } from "@/types/course";

const CartRow = ({ course }: { course: Course }) => {
  const remove = useShopStore((s) => s.removeFromCart);
  const wishlist = useShopStore((s) => s.wishlist);
  const toggleWishlist = useShopStore((s) => s.toggleWishlist);
  const saveForLater = () => {
    if (!wishlist.includes(course.id)) toggleWishlist(course.id);
    remove(course.id);
    toast("Moved to your wishlist", { description: course.title });
  };
  return (
    <li className="flex items-start gap-3.5 border-b border-line py-4.5 last:border-b-0 sm:gap-4">
      <Link
        to={`/courses/${course.id}`}
        className="flex aspect-video w-20 flex-none items-center justify-center rounded-xl sm:w-28"
        style={{ background: courseCover(course) }}
        aria-label={course.title}
      >
        {!course.img && <Icon name={course.icon} size={24} className="text-white/90" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link to={`/courses/${course.id}`} className="font-display text-[15.5px] leading-tight font-bold text-ink hover:text-brand">
          {course.title}
        </Link>
        <span className="text-[12.5px] font-semibold text-soft">
          {course.mentor} · {course.lessons} lessons · {course.hours}
        </span>
        <span className="mt-1.5 flex flex-wrap items-end gap-x-4 gap-y-1.5 text-[12.5px] font-bold">
          <button type="button" onClick={saveForLater} className="border-0 bg-transparent p-0 text-brand hover:underline">
            Save for later
          </button>
          <button
            type="button"
            onClick={() => remove(course.id)}
            aria-label={`Remove ${course.title} from cart`}
            className="border-0 bg-transparent p-0 text-danger hover:underline"
          >
            Remove
          </button>
          <span className="ml-auto flex items-baseline gap-2">
            {course.oldPrice && <span className="text-[12.5px] font-semibold text-soft line-through">{formatTaka(course.oldPrice)}</span>}
            <span className="font-display text-[17px] font-extrabold text-ink">{formatTaka(course.price)}</span>
          </span>
        </span>
      </div>
    </li>
  );
};

/**
 * Summary like Udemy/Coursera carts: original price, the courses' own discounts, an optional promo
 * code (checked now, re-checked and charged at checkout via ?promo=) and the total.
 */
const CartSummary = ({ items, subtotal, isPro }: { items: Course[]; subtotal: number; isPro: boolean }) => {
  const promo = useApplyPromo();
  const [code, setCode] = useState("");
  const original = items.reduce((sum, c) => sum + (c.oldPrice ?? c.price), 0);
  const courseSavings = original - subtotal;
  const promoOff = discountFor(subtotal, promo.data?.percentOff ?? 0);
  const total = subtotal - promoOff;
  const saved = courseSavings + promoOff;
  const checkoutTo = promo.data ? `/checkout/cart?promo=${encodeURIComponent(promo.data.code)}` : "/checkout/cart";

  return (
    <aside className="flex flex-col gap-4 rounded-3xl border border-line bg-surface px-6 py-5.5 shadow-card min-[961px]:sticky min-[961px]:top-24">
      <h2 className="m-0 font-display text-[17px] font-extrabold text-ink">Summary</h2>
      <div className="flex flex-col gap-2.5 text-[13.5px] font-semibold text-muted">
        <span className="flex justify-between gap-3">
          <span>Original price ({plural(items.length, "course")})</span>
          <span className={courseSavings > 0 ? "text-soft line-through" : "font-extrabold text-ink"}>{formatTaka(original)}</span>
        </span>
        {courseSavings > 0 && (
          <span className="flex justify-between gap-3 text-success">
            <span className="font-bold">Course discounts</span>
            <span className="font-extrabold">−{formatTaka(courseSavings)}</span>
          </span>
        )}
        {promo.data && promoOff > 0 && (
          <span className="flex justify-between gap-3 text-success">
            <span className="font-bold">
              Promo {promo.data.code} (−{promo.data.percentOff}%)
            </span>
            <span className="font-extrabold">−{formatTaka(promoOff)}</span>
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between border-t border-line pt-4">
        <span className="text-sm font-extrabold text-ink">Total</span>
        <span className="flex flex-col items-end">
          <span className="font-display text-[26px] font-extrabold text-ink">{formatTaka(total)}</span>
          <span className="text-[11.5px] font-bold text-soft">VAT included</span>
        </span>
      </div>
      {saved > 0 && (
        <p className="m-0 rounded-[11px] bg-success/10 px-3.5 py-2 text-center text-[12.5px] font-extrabold text-success">
          You save {formatTaka(saved)}
        </p>
      )}

      {!isPro && (
        <div className="flex flex-col gap-2">
          <label htmlFor="cart-promo" className="text-[12px] font-extrabold tracking-[0.06em] text-soft">
            PROMO CODE
          </label>
          {promo.data ? (
            <span className="flex items-center justify-between gap-3 rounded-[13px] border border-success/40 bg-success/5 px-3.5 py-2.5 text-[13px] font-bold text-success">
              <span>
                ✓ {promo.data.code} applied — {promo.data.percentOff}% off
              </span>
              <button
                type="button"
                onClick={() => {
                  promo.reset();
                  setCode("");
                }}
                className="border-0 bg-transparent p-0 text-[12.5px] font-extrabold text-muted hover:text-danger"
              >
                Remove
              </button>
            </span>
          ) : (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim()) promo.mutate(code.trim());
              }}
            >
              <input
                id="cart-promo"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  promo.reset();
                }}
                placeholder="e.g. LEARN20"
                aria-invalid={promo.isError || undefined}
                className="field min-w-0 flex-1 font-bold uppercase"
              />
              <button
                type="submit"
                disabled={promo.isPending}
                className="rounded-[13px] border-[1.5px] border-line bg-surface px-4.5 text-[13.5px] font-extrabold text-ink transition-all hover:border-brand hover:text-brand"
              >
                Apply
              </button>
            </form>
          )}
          {promo.isError && <span className="text-[12.5px] font-bold text-danger">{errorMessage(promo.error)}</span>}
        </div>
      )}

      {isPro ? (
        <Alert tone="info">
          Every course is already included in your Pro plan — no need to buy them.{" "}
          <Link to="/dashboard/courses" className="font-extrabold underline">
            Go to my courses
          </Link>
        </Alert>
      ) : (
        <Link to={checkoutTo} className="btn btn-primary w-full rounded-[13px] px-5 py-3.75 text-[15px]">
          <Icon name="lock" size={17} />
          Checkout
        </Link>
      )}
      <p className="m-0 text-center text-[12px] font-semibold text-soft">
        One payment for every course · 30-day money-back guarantee · yours forever
      </p>
    </aside>
  );
};

const CartView = () => {
  const { items, unavailable, ready, isPro, subtotal } = useCart();
  const removeMany = useShopStore((s) => s.removeManyFromCart);

  // owned, free or retired courses can't be bought — drop them and say so
  useEffect(() => {
    if (!ready || unavailable.length === 0) return;
    removeMany(unavailable);
    toast(`Removed ${plural(unavailable.length, "course")} you already have access to`);
  }, [ready, unavailable, removeMany]);

  if (!ready) return null;
  if (items.length === 0) {
    return (
      <EmptyCard
        icon="shopping_cart"
        title="Your cart is empty"
        action={
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link to="/courses" className="btn btn-primary px-6.5 py-3.5 text-[14.5px]">
              <Icon name="search" size={18} />
              Browse courses
            </Link>
            <Link to="/wishlist" className="btn btn-outline px-6.5 py-3.5 text-[14.5px]">
              <Icon name="favorite" size={18} />
              Your wishlist
            </Link>
          </div>
        }
      >
        Add paid courses from their course page, then pay for all of them at once.
      </EmptyCard>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 min-[961px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-line bg-surface px-5 py-2 shadow-card sm:px-6.5">
        <ul className="m-0 list-none p-0">
          {items.map((c) => (
            <CartRow key={c.id} course={c} />
          ))}
        </ul>
      </div>

      <CartSummary items={items} subtotal={subtotal} isPro={isPro} />
    </div>
  );
};

/** /cart — paid courses to buy together (F-004). Public; checkout asks guests to log in. */
const Cart = () => {
  usePageTitle("Cart");
  const { courses } = useCart();
  const count = useShopStore((s) => s.cart.length);
  return (
    <LearnerPage
      title="My cart"
      back={{ to: "/courses", label: "Courses" }}
      subtitle={plural(count, "course")}
      actions={
        <Link to="/wishlist" className="btn btn-outline px-5 py-3 text-[13.5px]">
          <Icon name="favorite" size={17} />
          Wishlist
        </Link>
      }
    >
      <QueryStatus query={courses}>{() => <CartView />}</QueryStatus>
    </LearnerPage>
  );
};

export default Cart;
