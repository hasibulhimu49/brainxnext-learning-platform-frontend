import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingState } from "@/components/common/QueryStatus";
import PublicLayout from "@/layouts/PublicLayout";
import Home from "@/pages/Home";
import { GuestOnly, RequireAuth, RequireRole } from "./guards";

/*
 * Home and the public layout ship in the main bundle; every other page (and the admin shell) is
 * split into its own chunk. Grouped in the same order as the routes below.
 */

/* Public pages */
const Catalog = lazy(() => import("@/pages/courses/Catalog"));
const CourseDetail = lazy(() => import("@/pages/courses/CourseDetail"));
const Notes = lazy(() => import("@/pages/marketing/Notes"));
const Pricing = lazy(() => import("@/pages/marketing/Pricing"));
const About = lazy(() => import("@/pages/marketing/About"));
const Contact = lazy(() => import("@/pages/marketing/Contact"));
const Help = lazy(() => import("@/pages/marketing/Help"));
const Privacy = lazy(() => import("@/pages/legal/Privacy"));
const Terms = lazy(() => import("@/pages/legal/Terms"));
const Refunds = lazy(() => import("@/pages/legal/Refunds"));
const VerifyCertificate = lazy(() => import("@/pages/certificates/VerifyCertificate"));
const Wishlist = lazy(() => import("@/pages/shop/Wishlist"));
const Cart = lazy(() => import("@/pages/shop/Cart"));
const Paths = lazy(() => import("@/pages/paths/Paths"));
const PathDetail = lazy(() => import("@/pages/paths/PathDetail"));

/* Signed-in area */
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const MyCourses = lazy(() => import("@/pages/dashboard/MyCourses"));
const MyReviews = lazy(() => import("@/pages/dashboard/MyReviews"));
const Certificates = lazy(() => import("@/pages/certificates/Certificates"));
const Settings = lazy(() => import("@/pages/account/Settings"));
const LearnIndex = lazy(() => import("@/pages/courses/LearnIndex"));
const ProjectSubmission = lazy(() => import("@/pages/courses/ProjectSubmission"));
const ModuleQuiz = lazy(() => import("@/pages/courses/ModuleQuiz"));
const Player = lazy(() => import("@/pages/courses/Player"));
const Certificate = lazy(() => import("@/pages/certificates/Certificate"));
const OrderReceipt = lazy(() => import("@/pages/billing/OrderReceipt"));
const PlanCheckout = lazy(() => import("@/pages/checkout/PlanCheckout"));
const CartCheckout = lazy(() => import("@/pages/checkout/CartCheckout"));
const Checkout = lazy(() => import("@/pages/checkout/Checkout"));

/* Guest-only and single-card screens */
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const VerifyOtp = lazy(() => import("@/pages/auth/VerifyOtp"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const Support = lazy(() => import("@/pages/support/Support"));
const ThankYou = lazy(() => import("@/pages/support/ThankYou"));

/* Admin */
const AdminLayout = lazy(() => import("@/layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminCourseDetail = lazy(() => import("@/pages/admin/AdminCourseDetail"));
const AdminStudentDetail = lazy(() => import("@/pages/admin/AdminStudentDetail"));
const AdminPaymentDetail = lazy(() => import("@/pages/admin/AdminPaymentDetail"));
const AdminSubmissions = lazy(() => import("@/pages/admin/AdminSubmissions"));
const AdminSubmissionDetail = lazy(() => import("@/pages/admin/AdminSubmissionDetail"));
const AdminPromos = lazy(() => import("@/pages/admin/AdminPromos"));
const AdminInbox = lazy(() => import("@/pages/admin/AdminInbox"));
const AdminInboxDetail = lazy(() => import("@/pages/admin/AdminInboxDetail"));
const AdminNewCourse = lazy(() => import("@/pages/admin/AdminNewCourse"));

/* Errors */
const Forbidden = lazy(() => import("@/pages/errors/Forbidden"));
const NotFound = lazy(() => import("@/pages/errors/NotFound"));

/** Each guest screen gets its own guard, so it re-checks the session whenever it opens. */
const guest = (page: ReactNode) => <GuestOnly>{page}</GuestOnly>;

const AppRoutes = () => (
  <Suspense fallback={<LoadingState className="min-h-[60vh]" />}>
    <Routes>
      {/* Marketing — public navbar */}
      <Route element={<PublicLayout footer="full" />}>
        <Route index element={<Home />} />
      </Route>
      <Route element={<PublicLayout />}>
        <Route path="courses" element={<Catalog />} />
        <Route path="courses/:courseId" element={<CourseDetail />} />
        <Route path="notes" element={<Notes />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="help" element={<Help />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="refunds" element={<Refunds />} />
        <Route path="verify" element={<VerifyCertificate />} />
        <Route path="verify/:certId" element={<VerifyCertificate />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="cart" element={<Cart />} />
        <Route path="paths" element={<Paths />} />
        <Route path="paths/:pathId" element={<PathDetail />} />
      </Route>

      {/* Signed-in area — guests are sent to /login?next=… */}
      <Route element={<RequireAuth />}>
        <Route element={<PublicLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/courses" element={<MyCourses />} />
          <Route path="dashboard/reviews" element={<MyReviews />} />
          <Route path="certificates" element={<Certificates />} />
        </Route>
        <Route element={<PublicLayout footer={false} />}>
          <Route path="settings" element={<Settings />} />
          <Route path="settings/:tab" element={<Settings />} />
        </Route>
        <Route path="learn" element={<LearnIndex />} />
        <Route path="learn/:courseId/project" element={<ProjectSubmission />} />
        <Route path="learn/:courseId/quiz/:module" element={<ModuleQuiz />} />
        <Route path="learn/:courseId/:lessonId?" element={<Player />} />
        <Route path="certificates/:certId" element={<Certificate />} />
        <Route path="certificate" element={<Navigate to="/certificates" replace />} />
        <Route path="orders/:orderId" element={<OrderReceipt />} />
        <Route path="checkout/plan/:plan" element={<PlanCheckout />} />
        {/* before checkout/:courseId, so "cart" isn't read as a course id */}
        <Route path="checkout/cart" element={<CartCheckout />} />
        <Route path="checkout/:courseId" element={<Checkout />} />
      </Route>
      <Route path="checkout" element={<Navigate to="/pricing" replace />} />

      {/* Guest-only single-card screens — signed-in users go to ?next= or their home */}
      <Route path="login" element={guest(<Login />)} />
      <Route path="register" element={guest(<Register />)} />
      <Route path="verify-otp" element={guest(<VerifyOtp />)} />
      <Route path="forgot-password" element={guest(<ForgotPassword />)} />
      {/* token-based, so it stays open */}
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="support" element={<Support />} />
      <Route path="thank-you" element={<ThankYou />} />

      {/* Admin — guests → login, students → 403 */}
      <Route element={<RequireRole role="admin" />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="courses/:courseId" element={<AdminCourseDetail />} />
          <Route path="students/:studentId" element={<AdminStudentDetail />} />
          <Route path="payments/:paymentId" element={<AdminPaymentDetail />} />
          <Route path="submissions" element={<AdminSubmissions />} />
          <Route path="submissions/:submissionId" element={<AdminSubmissionDetail />} />
          <Route path="promos" element={<AdminPromos />} />
          <Route path="inbox" element={<AdminInbox />} />
          <Route path="inbox/:ticketId" element={<AdminInboxDetail />} />
          <Route path=":section" element={<AdminDashboard />} />
        </Route>
        <Route path="admin/courses/new" element={<AdminNewCourse />} />
        <Route path="admin/courses/:courseId/edit" element={<AdminNewCourse />} />
      </Route>

      <Route path="403" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
