import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AuthCard, AuthHeader } from "@/components/auth/AuthCard";
import Icon from "@/components/common/Icon";
import { formatTaka } from "@/lib/utils";
import type { Course } from "@/types/course";

/**
 * "This needs Pro" card: certificates and mentor review come with Pro, or with buying that course.
 * Paid courses also get a "Buy this course" option.
 */
const UpgradeCard = ({ title, children, course }: { title: string; children: ReactNode; course: Course }) => (
  <AuthCard width={460}>
    <AuthHeader icon="workspace_premium" title={title}>
      {children}
    </AuthHeader>
    <Link to="/checkout/plan/pro" className="btn btn-primary w-full rounded-[13px] px-5 py-3.75 text-[14.5px]">
      <Icon name="bolt" size={18} />
      Go Pro
    </Link>
    {!course.free && (
      <Link to={`/checkout/${course.id}`} className="btn btn-outline w-full rounded-[13px] px-5 py-3.5">
        Buy this course for {formatTaka(course.price)}
      </Link>
    )}
    <Link to={`/learn/${course.id}`} className="text-center text-[13.5px] font-extrabold text-brand">
      Back to the course
    </Link>
  </AuthCard>
);

export default UpgradeCard;
