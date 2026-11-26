import { Navigate, NavLink, useParams } from "react-router-dom";
import BillingTab from "@/components/billing/BillingTab";
import Icon from "@/components/common/Icon";
import AccountTab from "@/components/learner/settings/AccountTab";
import NotificationsTab from "@/components/learner/settings/NotificationsTab";
import ProfileTab from "@/components/learner/settings/ProfileTab";
import usePageTitle from "@/hooks/usePageTitle";
import { cn } from "@/lib/utils";
import { useProfile, useSubscription } from "@/queries/account";
import { useSessionUser } from "@/stores/authStore";

const SECTIONS = [
  { slug: "profile", label: "Profile", icon: "person" },
  { slug: "account", label: "Account", icon: "shield" },
  { slug: "notifications", label: "Notifications", icon: "notifications" },
  { slug: "billing", label: "Billing", icon: "credit_card" },
] as const;
type SectionSlug = (typeof SECTIONS)[number]["slug"];

const isSection = (tab: string): tab is SectionSlug => SECTIONS.some((s) => s.slug === tab);

const memberSince = (iso: string) =>
  `Member since ${new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })}`;

/** Avatar, name, email, plan badge and member-since line above the tabs. */
const SettingsHeader = ({ name, email }: { name: string; email: string }) => {
  const plan = useSubscription().data?.plan;
  const since = useProfile().data?.memberSince;
  return (
    <div className="mb-8 flex flex-wrap items-center gap-4.5">
      <span className="bg-grad-amber flex h-19 w-19 items-center justify-center rounded-full font-display text-[28px] font-extrabold text-cocoa shadow-[0_12px_28px_rgba(233,162,27,.3)]">
        {name[0]?.toUpperCase()}
      </span>
      <div className="flex min-w-0 flex-col gap-1.25">
        <h1 className="m-0 font-display text-[clamp(22px,3vw,30px)] font-extrabold tracking-[-0.02em] text-ink">{name}</h1>
        <span className="flex flex-wrap items-center gap-3">
          <span className="text-[13.5px] font-semibold break-all text-soft">{email}</span>
          {plan === "pro" && (
            <span className="bg-grad-brand rounded-full px-2.75 py-1 text-[11px] font-extrabold tracking-[0.06em] text-white">PRO</span>
          )}
          {plan === "free" && (
            <span className="rounded-full border border-line bg-surface2 px-2.75 py-1 text-[11px] font-extrabold tracking-[0.06em] text-muted">
              FREE
            </span>
          )}
          {since && <span className="text-[12.5px] font-bold text-soft">{memberSince(since)}</span>}
        </span>
      </div>
    </div>
  );
};

/** /settings/:tab? — profile, account, notification preferences and billing. */
const Settings = () => {
  const { tab = "profile" } = useParams();
  const section = SECTIONS.find((s) => s.slug === tab);
  usePageTitle(section ? `${section.label} settings` : "Settings");
  const user = useSessionUser();
  // behind RequireAuth, so the session is always there
  const name = user?.name ?? "";
  const email = user?.email ?? "";

  if (!isSection(tab)) return <Navigate to="/settings" replace />;

  return (
    <div className="mx-auto max-w-275 px-4 pt-10 pb-22 sm:px-6">
      <SettingsHeader name={name} email={email} />

      <div className="grid grid-cols-1 items-start gap-6 min-[1001px]:grid-cols-[230px_minmax(0,1fr)]">
        <nav
          aria-label="Settings sections"
          className="relative flex flex-row gap-1 overflow-x-auto pb-1.5 min-[1001px]:sticky min-[1001px]:top-22 min-[1001px]:flex-col min-[1001px]:pb-0"
        >
          {SECTIONS.map((s) => (
            <NavLink
              key={s.slug}
              to={s.slug === "profile" ? "/settings" : `/settings/${s.slug}`}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.75 rounded-[13px] px-4 py-3 text-sm whitespace-nowrap transition-all hover:bg-chip",
                  isActive ? "bg-chip font-extrabold text-brand" : "font-semibold text-muted"
                )
              }
            >
              <Icon name={s.icon} size={19} />
              {s.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-5">
          {tab === "profile" && <ProfileTab />}
          {tab === "account" && <AccountTab email={email} />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "billing" && <BillingTab email={email} />}
        </div>
      </div>
    </div>
  );
};

export default Settings;
