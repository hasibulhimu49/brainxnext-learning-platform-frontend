import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { API_ERROR_CODES, isApiError } from "@/api/envelope";
import { AuthCard, AuthHeader } from "@/components/auth/AuthCard";
import CheckoutShell, { CheckoutGrid } from "@/components/checkout/CheckoutShell";
import OrderSummary, { SummaryItem } from "@/components/checkout/OrderSummary";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";
import IncludedInPro from "@/components/checkout/IncludedInPro";
import PaymentForm from "@/components/checkout/PaymentForm";
import { useWalletCheckout } from "@/hooks/useWalletCheckout";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import usePageTitle from "@/hooks/usePageTitle";
import { useSubscription } from "@/queries/account";
import { useApplyPromo, usePlaceOrder } from "@/queries/checkout";
import { useCourse } from "@/queries/courses";
import { useEnrollments } from "@/queries/learning";
import type { CourseDetail } from "@/types/course";
import { plural } from "@/lib/utils";

const PERKS = ["Lifetime access", "Certificate on completion", "Mentor review included", "30-day money-back guarantee"];

const CheckoutView = ({ course }: { course: CourseDetail }) => {
  const navigate = useNavigate();
  const promo = useApplyPromo();
  const order = usePlaceOrder();
  const flow = useWalletCheckout((paid) => navigate(`/orders/${paid.id}`));

  return (
    <CheckoutGrid
      summary={
        <OrderSummary
          item={
            <SummaryItem
              icon={course.icon}
              grad={course.grad}
              title={course.title}
              meta={`${plural(course.lessons, "lesson")} · ${course.hours} · ${course.mentor}`}
            />
          }
          priceLabel="Course price"
          price={course.price}
          promo={promo.data}
          perks={PERKS}
        />
      }
    >
      <CheckoutFlow flow={flow} backTo={`/courses/${course.id}`}>
        <PaymentForm
          price={course.price}
          promo={promo}
          pending={order.isPending}
          error={order.error}
          onPay={(payment, promoCode) => order.mutate({ courseId: course.id, payment, promoCode }, { onSuccess: flow.placed })}
          note="30-day money-back guarantee. Courses you buy are yours forever."
        />
      </CheckoutFlow>
    </CheckoutGrid>
  );
};

/** The signed-in user already has this course (bought or enrolled before). */
const AlreadyOwned = ({ course }: { course: CourseDetail }) => (
  <AuthCard>
    <AuthHeader icon="verified" title="You already own this course">
      <span className="font-extrabold text-ink">{course.title}</span> is in your library — no need to pay again.
    </AuthHeader>
    <Link to={`/learn/${course.id}`} className="btn btn-primary w-full rounded-[13px] px-5 py-3.75 text-[14.5px]">
      <Icon name="play_arrow" size={18} />
      Go to course
    </Link>
    <Link to="/dashboard" className="text-center text-[13.5px] font-extrabold text-brand">
      Go to dashboard
    </Link>
  </AuthCard>
);

/** Remembers ownership (and Pro) at first load, so paying (which enrols) doesn't flip to "already owned" before the receipt opens. */
const CheckoutContent = ({ course, owned, isPro }: { course: CourseDetail; owned: boolean; isPro: boolean }) => {
  const [onArrival] = useState({ owned, isPro });
  if (course.free) return <Navigate to={`/courses/${course.id}`} replace />;
  if (onArrival.owned) return <AlreadyOwned course={course} />;
  if (onArrival.isPro) {
    return (
      <IncludedInPro title="Included in your Pro plan" to={`/learn/${course.id}`} label="Start learning" icon="play_arrow">
        <span className="font-extrabold text-ink">{course.title}</span> is part of Pro, so there&apos;s nothing to pay.
      </IncludedInPro>
    );
  }
  return <CheckoutView course={course} />;
};

/** /checkout/:courseId — decides between the payment flow and the "already owned" state. */
const Checkout = () => {
  const { courseId = "" } = useParams();
  usePageTitle("Checkout");
  const courseQuery = useCourse(courseId);
  const enrollments = useEnrollments();
  // Pro includes every course: wait for the plan before offering to take payment
  const subscription = useSubscription();
  if (isApiError(courseQuery.error) && courseQuery.error.code === API_ERROR_CODES.notFound) return <Navigate to="/404" replace />;
  return (
    <CheckoutShell closeTo={`/courses/${courseId}`}>
      <QueryStatus query={enrollments}>
        {(owned) => (
          <QueryStatus query={subscription}>
            {(sub) => (
              <QueryStatus query={courseQuery}>
                {(course) => (
                  <CheckoutContent course={course} owned={owned.some((e) => e.courseId === course.id)} isPro={sub.plan === "pro"} />
                )}
              </QueryStatus>
            )}
          </QueryStatus>
        )}
      </QueryStatus>
    </CheckoutShell>
  );
};

export default Checkout;
