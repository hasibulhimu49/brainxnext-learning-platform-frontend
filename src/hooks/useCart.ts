import { useIsPro } from "@/queries/account";
import { useCourses } from "@/queries/courses";
import { useEnrollments } from "@/queries/learning";
import { useIsSignedIn } from "@/stores/authStore";
import { useShopStore } from "@/stores/shopStore";
import type { Course } from "@/types/course";

/**
 * The cart joined with server state (F-004): stored course ids → catalog courses, minus anything
 * that can't be bought any more (owned, free, or gone from the catalog).
 * - `items`: what checkout will charge for
 * - `unavailable`: ids still in the store that should be dropped
 * - `ready`: catalog (and, when signed in, enrolments) loaded
 */
export const useCart = () => {
  const ids = useShopStore((s) => s.cart);
  const courses = useCourses();
  const signedIn = useIsSignedIn();
  const enrollments = useEnrollments();
  const isPro = useIsPro();

  const ready = courses.isSuccess && (!signedIn || enrollments.isSuccess);
  const owned = new Set((enrollments.data ?? []).map((e) => e.courseId));
  const items: Course[] = [];
  const unavailable: string[] = [];
  if (ready) {
    for (const id of ids) {
      const c = courses.data.find((x) => x.id === id);
      if (c && !c.free && !owned.has(c.id)) items.push(c);
      else unavailable.push(id);
    }
  }

  return {
    courses,
    items,
    unavailable,
    ready,
    /** Pro already includes every course, so there is nothing to buy */
    isPro: isPro === true,
    subtotal: items.reduce((sum, c) => sum + c.price, 0),
  };
};
