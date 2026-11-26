import { Link } from "react-router-dom";
import { toast } from "sonner";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import CourseCard from "@/components/course/CourseCard";
import LearnerPage, { EmptyCard } from "@/components/learner/LearnerPage";
import usePageTitle from "@/hooks/usePageTitle";
import { plural } from "@/lib/utils";
import { useCourses } from "@/queries/courses";
import { useEnrollments } from "@/queries/learning";
import { useShopStore } from "@/stores/shopStore";
import type { Course } from "@/types/course";

const WishlistView = ({ saved }: { saved: Course[] }) => {
  const cart = useShopStore((s) => s.cart);
  const addToCart = useShopStore((s) => s.addToCart);
  const owned = new Set((useEnrollments().data ?? []).map((e) => e.courseId));
  const buyable = saved.filter((c) => !c.free && !owned.has(c.id) && !cart.includes(c.id));

  if (saved.length === 0) {
    return (
      <EmptyCard
        icon="favorite"
        title="Your wishlist is empty"
        action={
          <Link to="/courses" className="btn btn-primary px-6.5 py-3.5 text-[14.5px]">
            <Icon name="search" size={18} />
            Browse courses
          </Link>
        }
      >
        Tap the heart on any course to save it here for later.
      </EmptyCard>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {buyable.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-line bg-surface px-5 py-4 shadow-card">
          <span className="text-[14px] font-semibold text-muted">
            {plural(buyable.length, "paid course")} on your list {buyable.length === 1 ? "isn't" : "aren't"} in your cart yet.
          </span>
          <button
            type="button"
            onClick={() => {
              buyable.forEach((c) => addToCart(c.id));
              toast(`Added ${plural(buyable.length, "course")} to your cart`);
            }}
            className="btn btn-primary px-5 py-3 text-[13.5px]"
          >
            <Icon name="add_shopping_cart" size={17} />
            Add all to cart
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[1001px]:grid-cols-3 min-[1240px]:grid-cols-4">
        {saved.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </div>
  );
};

/** /wishlist — courses saved with the heart (F-004). Public: guests keep theirs in the browser too. */
const Wishlist = () => {
  usePageTitle("Wishlist");
  const ids = useShopStore((s) => s.wishlist);
  const courses = useCourses();
  return (
    <LearnerPage
      title="My wishlist"
      back={{ to: "/courses", label: "Courses" }}
      subtitle={plural(ids.length, "saved course")}
      actions={
        <Link to="/cart" className="btn btn-outline px-5 py-3 text-[13.5px]">
          <Icon name="shopping_cart" size={17} />
          View cart
        </Link>
      }
    >
      <QueryStatus query={courses}>
        {(all) => <WishlistView saved={ids.map((id) => all.find((c) => c.id === id)).filter((c): c is Course => !!c)} />}
      </QueryStatus>
    </LearnerPage>
  );
};

export default Wishlist;
