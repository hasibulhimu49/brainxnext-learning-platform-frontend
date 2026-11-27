import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo";
import { SocialLinks } from "./SocialIcons";
import { OPEN_ADMIN } from "@/api/config";

const LEGAL_LINKS = [
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/refunds", label: "Refunds" },
  // demo mode only: the admin panel is open to everyone until the backend exists
  ...(OPEN_ADMIN ? [{ to: "/admin", label: "Admin panel" }] : []),
];

const COLUMNS = [
  {
    title: "LEARN",
    links: [
      { to: "/courses", label: "Courses" },
      { to: "/paths", label: "Career roadmaps" },
      { to: "/notes", label: "Free notes" },
      { to: "/pricing", label: "Pricing" },
      { to: "/verify", label: "Verify a certificate" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact?topic=teams", label: "Teams" },
      { to: "/help", label: "Help" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "LEGAL",
    links: LEGAL_LINKS,
  },
];

/** The same main links on every simple footer, so Pricing/About/Help are reachable everywhere. */
const SIMPLE_LINKS = [
  { to: "/courses", label: "Courses" },
  { to: "/notes", label: "Notes" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/help", label: "Help" },
  { to: "/contact", label: "Contact" },
];

const footerLink = "text-[13.5px] font-semibold text-[#A9BFD8] transition-colors hover:text-brand-light aria-[current=page]:text-white";
const legalLink = "font-semibold text-[#6F88A2] transition-colors hover:text-brand-light aria-[current=page]:text-[#A9BFD8]";

/**
 * variant="full" (home) — four-column footer; variant="simple" — link row + legal row.
 * Both end with pb-24 so the fixed Next AI circle (bottom-right, ~80px tall) never covers the last row.
 */
const Footer = ({ variant = "simple" }: { variant?: "full" | "simple" }) => {
  if (variant === "full") {
    return (
      <footer className="bg-navy-deep px-6 pt-14 pb-24 text-[#A9BFD8]">
        <div className="mx-auto max-w-310">
          <div className="grid grid-cols-1 gap-8 border-b border-white/10 pb-9 min-[640px]:grid-cols-2 min-[1001px]:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
            <div className="flex flex-col gap-3.5">
              <Logo size="footer" onDark />
              <p className="m-0 max-w-[34ch] text-[13.5px] leading-relaxed">
                A structured learning platform for engineers, designers and analysts. Free where it counts, paid where it&apos;s worth it.
              </p>
              <SocialLinks />
            </div>
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title.toLowerCase()} className="flex flex-col gap-2.5">
                <div className="text-[11px] font-extrabold tracking-[0.14em] text-[#6F88A2]">{col.title}</div>
                {col.links.map((l) => (
                  <Link key={l.label} to={l.to} className={footerLink}>
                    {l.label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
          <div className="flex flex-wrap justify-between gap-4 pt-5.5 text-[12.5px] font-semibold text-[#6F88A2]">
            <span>© 2026 BrainXNext</span>
            <span>Made for learners everywhere</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-navy-deep px-6 pt-11 pb-24 text-[#A9BFD8]">
      <div className="mx-auto flex max-w-310 flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-6">
        <span className="flex items-center gap-5">
          <Logo size="sm" onDark />
          <SocialLinks />
        </span>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2.5">
          {SIMPLE_LINKS.map((l) => (
            <NavLink key={l.label} to={l.to} className={footerLink}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mx-auto flex max-w-310 flex-wrap items-center justify-between gap-4 pt-5 text-[12.5px] font-semibold text-[#6F88A2]">
        <span>© 2026 BrainXNext</span>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
          {LEGAL_LINKS.map((l) => (
            <NavLink key={l.label} to={l.to} className={legalLink}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
