import { Link } from "react-router-dom";
import ErrorCode from "@/components/common/ErrorCode";
import Icon from "@/components/common/Icon";
import AuthLayout from "@/layouts/AuthLayout";
import usePageTitle from "@/hooks/usePageTitle";

/** 403 — a signed-in user opened a page their role can't use (e.g. a student on /admin). */
const Forbidden = () => {
  usePageTitle("Access denied");
  return (
    <AuthLayout
      mainClassName="items-center pt-6 pb-16"
      footer={<span className="text-[12.5px] text-soft">Error code: 403 · Access denied</span>}
    >
      <div className="flex w-full flex-col items-center gap-6.5 text-center">
        <ErrorCode code="403" topIcon="lock" bottomIcon="shield" />

        <div className="flex max-w-120 flex-col gap-3">
          <h1 className="m-0 font-display text-[clamp(22px,3.4vw,30px)] font-extrabold tracking-[-0.02em] text-ink">
            This area is for admins
          </h1>
          <p className="m-0 text-[15px] leading-[1.65] font-medium text-muted">
            Your account doesn&apos;t have access to this page. If you think it should, contact us and we&apos;ll sort it out.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/dashboard" className="btn btn-primary px-7 py-3.75 text-[14.5px]">
            <Icon name="space_dashboard" size={18} />
            Back to dashboard
          </Link>
          <Link to="/contact" className="btn btn-outline px-6.5 py-3.5 text-[14.5px]">
            <Icon name="forum" size={18} />
            Contact us
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Forbidden;
