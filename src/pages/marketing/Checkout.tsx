import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { API_ERROR_CODES, isApiError } from "@/api/envelope";
import { AuthCard, AuthHeader } from "@/components/auth/AuthCard";
import CheckoutShell, { CheckoutGrid } from "@/components/checkout/CheckoutShell";
import OrderSummary, { SummaryItem } from "@/components/checkout/OrderSummary";
import PaymentFailed from "@/components/checkout/PaymentFailed";
import PaymentForm from "@/components/checkout/PaymentForm";
import { useWalletCheckout } from "@/components/checkout/useWalletCheckout";
import WalletPending from "@/components/checkout/WalletPending";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import usePageTitle from "@/hooks/usePageTitle";
import { useApplyPromo, usePlaceOrder } from "@/queries/checkout";
import { useCourse } from "@/queries/courses";
import { useEnrollments } from "@/queries/learning";
import type { CourseDetail } from "@/types/course";

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
              meta={`${course.lessons} lessons · ${course.hours} · ${course.mentor}`}
            />
          }
          priceLabel="Course price"
          price={course.price}
          promo={promo.data}
          perks={PERKS}
        />
      }
    >
      {flow.phase === "pending" && flow.pendingOrder ? (
        <WalletPending
          order={flow.pendingOrder}
          approving={flow.approving}
          onApprove={flow.approve}
          onCancel={() => flow.abandon()}
          onExpire={() => flow.abandon("The payment request expired before it was approved. No money was taken.")}
        />
      ) : flow.phase === "failed" ? (
        <PaymentFailed message={flow.failure ?? ""} onRetry={flow.retry} backTo={`/courses/${course.id}`} />
      ) : (
        <PaymentForm
          price={course.price}
          promo={promo}
          pending={order.isPending}
          error={order.error}
          onPay={(payment, promoCode) => order.mutate({ courseId: course.id, payment, promoCode }, { onSuccess: flow.placed })}
          note="30-day money-back guarantee. Courses you buy are yours forever."
        />
      )}
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

/** Remembers ownership at first load, so paying (which enrols) doesn't flip to "already owned" before the receipt opens. */
const CheckoutContent = ({ course, owned }: { course: CourseDetail; owned: boolean }) => {
  const [ownedOnArrival] = useState(owned);
  if (course.free) return <Navigate to={`/courses/${course.id}`} replace />;
  return ownedOnArrival ? <AlreadyOwned course={course} /> : <CheckoutView course={course} />;
};

/** /checkout/:courseId — decides between the payment flow and the "already owned" state. */
const Checkout = () => {
  const { courseId = "" } = useParams();
  usePageTitle("Checkout");
  const courseQuery = useCourse(courseId);
  const enrollments = useEnrollments();
  if (isApiError(courseQuery.error) && courseQuery.error.code === API_ERROR_CODES.notFound) return <Navigate to="/404" replace />;
  return (
    <CheckoutShell>
      <QueryStatus query={enrollments}>
        {(owned) => (
          <QueryStatus query={courseQuery}>
            {(course) => <CheckoutContent course={course} owned={owned.some((e) => e.courseId === course.id)} />}
          </QueryStatus>
        )}
      </QueryStatus>
    </CheckoutShell>
  );
};

export default Checkout;
