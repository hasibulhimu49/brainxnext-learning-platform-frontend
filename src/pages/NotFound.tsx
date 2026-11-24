import { Link } from "react-router-dom";
import ErrorCode from "@/components/common/ErrorCode";
import Icon from "@/components/common/Icon";
import AuthLayout from "@/layouts/AuthLayout";
import usePageTitle from "@/hooks/usePageTitle";

const QUICK_LINKS = [
  { to: "/notes", icon: "description", grad: "linear-gradient(135deg,#E9A21B,#F2BC4B)", title: "Free notes", sub: "Handbooks & sheets" },
  {
    to: "/dashboard",
    icon: "space_dashboard",
    grad: "linear-gradient(135deg,#1B6FD0,#3E92E8)",
    title: "My dashboard",
    sub: "Continue learning",
  },
  { to: "/contact", icon: "forum", grad: "linear-gradient(135deg,#0E97B0,#2FB8CF)", title: "Contact us", sub: "We reply in 24h" },
];

const NotFound = () => {
  usePageTitle("Page not found");
  return (
    <AuthLayout
      mainClassName="items-center pt-6 pb-16"
      footer={<span className="text-[12.5px] text-soft">Error code: 404 · Page not found</span>}
    >
      <div className="flex w-full flex-col items-center gap-6.5 text-center">
        <ErrorCode code="404" topIcon="help" bottomIcon="search_off" />

        <div className="flex max-w-120 flex-col gap-3">
          <h1 className="m-0 font-display text-[clamp(22px,3.4vw,30px)] font-extrabold tracking-[-0.02em] text-ink">
            This page skipped class.
          </h1>
          <p className="m-0 text-[15px] leading-[1.65] font-medium text-muted">
            The page you&apos;re looking for was moved, renamed, or never enrolled. Let&apos;s get you back to learning.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn btn-primary px-7 py-3.75 text-[14.5px]">
            <Icon name="home" size={18} />
            Back home
          </Link>
          <Link to="/courses" className="btn btn-outline px-6.5 py-3.5 text-[14.5px]">
            <Icon name="search" size={18} />
            Browse courses
          </Link>
        </div>

        <div className="mt-2.5 grid w-full max-w-160 grid-cols-1 gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="card card-hover flex items-center gap-2.75 rounded-2xl! px-4.25 py-3.75 text-ink">
              <span className="flex h-9.5 w-9.5 flex-none items-center justify-center rounded-xl" style={{ background: l.grad }}>
                <Icon name={l.icon} size={19} className="text-white" />
              </span>
              <span className="flex flex-col text-left">
                <span className="text-[13px] font-extrabold">{l.title}</span>
                <span className="text-[11.5px] font-semibold text-soft">{l.sub}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
};

export default NotFound;
