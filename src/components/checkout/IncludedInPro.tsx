import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AuthCard, AuthHeader } from "@/components/auth/AuthCard";
import Icon from "@/components/common/Icon";

interface IncludedInProProps {
  title: string;
  children: ReactNode;
  to: string;
  label: string;
  icon?: string;
}

/** Checkout for something a Pro member already has: nothing to pay, one link onward. */
const IncludedInPro = ({ title, children, to, label, icon = "school" }: IncludedInProProps) => (
  <AuthCard>
    <AuthHeader icon="workspace_premium" title={title}>
      {children}
    </AuthHeader>
    <Link to={to} className="btn btn-primary w-full rounded-[13px] px-5 py-3.75 text-[14.5px]">
      <Icon name={icon} size={18} />
      {label}
    </Link>
  </AuthCard>
);

export default IncludedInPro;
