import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/images/hero-study.jpg";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import SectionHeading from "@/components/common/SectionHeading";
import CourseCard from "@/components/course/CourseCard";
import PricingCard, { type PricingCardProps } from "@/components/marketing/PricingCard";
import { CATEGORY_FILTERS, HOME_COURSE_LIMIT, type CategoryFilter } from "@/constants/catalog";
import { useCourses, useNoteHighlights } from "@/queries/courses";
import usePageTitle from "@/hooks/usePageTitle";

const STATS = [
  { value: "48", color: "#6FB7FF", label: ["Courses across", "6 tracks"] },
  { value: "12", color: "#F7C948", label: ["Free forever", "courses"] },
  { value: "31", color: "#4FD0E0", label: ["Working", "mentors"] },
  { value: "96%", color: "#7ED694", label: ["Path finish", "rate"] },
];

const FEATURES = [
  {
    icon: "stairs",
    grad: "linear-gradient(135deg,#1B6FD0,#3E92E8)",
    glow: "rgba(27,111,208,.3)",
    title: "Structured lessons",
    text: "Two-week blocks, five lessons each, one build at the end of every block.",
  },
  {
    icon: "rate_review",
    grad: "linear-gradient(135deg,#0E97B0,#2FB8CF)",
    glow: "rgba(14,151,176,.3)",
    title: "Mentor review",
    text: "Submit your project and get written, line-level feedback within 48 hours.",
  },
  {
    icon: "workspace_premium",
    grad: "linear-gradient(135deg,#E9A21B,#F2BC4B)",
    glow: "rgba(233,162,27,.3)",
    title: "Real certificates",
    text: "Verifiable certificates linked to the projects you actually shipped.",
  },
  {
    icon: "volunteer_activism",
    grad: "linear-gradient(135deg,#3FA457,#5DBE74)",
    glow: "rgba(63,164,87,.3)",
    title: "Free that's free",
    text: "Twelve complete courses with every lesson open — no paywall mid-module.",
  },
];

const PLANS: PricingCardProps[] = [
  {
    name: "FREE",
    price: "৳0",
    per: "forever",
    features: ["12 complete courses", "All notes & cheat sheets", "Community Q&A"],
    cta: "Start free",
    to: "/courses",
  },
  {
    name: "PRO",
    price: "৳1,900",
    per: "/ month",
    features: ["All 48 courses", "Mentor review in 48h", "Guided learning paths", "Verifiable certificates"],
    cta: "Go Pro",
    to: "/checkout/plan/pro?cycle=monthly",
    popular: true,
  },
  {
    name: "TEAMS",
    price: "৳1,400",
    per: "/ seat · min 5",
    features: ["Everything in Pro", "Cohort dashboards", "SSO & invoiced billing"],
    cta: "Talk to us",
    to: "/contact?topic=teams",
  },
];

const Home = () => {
  usePageTitle();
  const [cat, setCat] = useState<CategoryFilter>("All");
  const [freeOnly, setFreeOnly] = useState(false);
  const coursesQuery = useCourses();
  const notesQuery = useNoteHighlights();

  const shown = useMemo(
    () => (coursesQuery.data ?? []).slice(0, HOME_COURSE_LIMIT).filter((c) => (cat === "All" || c.cat === cat) && (!freeOnly || c.free)),
    [coursesQuery.data, cat, freeOnly]
  );

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section id="home" className="hero-band px-4.5 pt-24 pb-21 sm:px-6">
        <div className="absolute -inset-6 z-0 scale-[1.04] blur-[7px]">
          <img src={heroImg} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(8,21,39,.9)_0%,rgba(10,27,51,.78)_55%,rgba(10,27,51,.93)_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(700px_420px_at_80%_14%,rgba(233,162,27,.24),transparent_65%),radial-gradient(640px_420px_at_12%_80%,rgba(14,151,176,.3),transparent_65%),radial-gradient(560px_360px_at_50%_0%,rgba(27,111,208,.36),transparent_65%)]" />
        <div className="pointer-events-none absolute top-[16%] right-[10%] h-27.5 w-27.5 animate-[bx-pulse-glow_5s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(255,214,120,.85),rgba(233,162,27,.22)_60%,transparent_72%)] blur-[2px]" />
        <div className="pointer-events-none absolute top-[32%] left-[7%] h-3.25 w-3.25 animate-[bx-float-sm_6s_ease-in-out_infinite] rounded-full bg-[#8FD8E8] opacity-80 max-sm:hidden" />
        <div className="pointer-events-none absolute top-[62%] right-[22%] h-2.25 w-2.25 animate-[bx-float-sm_7s_ease-in-out_infinite] rounded-full bg-gold opacity-80 max-sm:hidden" />
        <a
          href="https://unsplash.com/@brookecagle"
          target="_blank"
          rel="noreferrer"
          className="absolute right-3.5 bottom-2.5 z-2 text-[10.5px] font-semibold text-white/55 hover:text-white/85"
        >
          Photo by Brooke Cagle on Unsplash
        </a>

        <div className="relative z-2 mx-auto flex max-w-225 flex-col items-center gap-7.5 text-center">
          <div className="eyebrow-dark">
            <Icon name="auto_awesome" size={16} className="text-gold" />
            12 COURSES FREE FOREVER — NO CARD NEEDED
          </div>
          <h1 className="m-0 font-display text-[clamp(42px,6vw,74px)] leading-[1.05] font-extrabold tracking-[-0.02em] max-[640px]:text-[38px]!">
            Learn skills that
            <br />
            <span className="text-grad-hero">unlock your next.</span>
          </h1>
          <p className="m-0 max-w-170 text-lg leading-relaxed font-semibold text-pretty text-[#C3D8EF]">
            BrainXNext is a structured learning platform for engineers, designers and analysts — project-based courses, mentor review, and a
            free tier that&apos;s actually free.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5">
            <Link to="/courses" className="btn btn-gold px-7.5 py-4 text-base">
              <Icon name="school" size={20} />
              Browse Courses
            </Link>
            <Link to="/courses/java-generics" className="btn btn-primary px-7 py-4 text-base">
              <Icon name="play_circle" size={20} />
              Start a Free Course
            </Link>
          </div>
          <div className="flex flex-wrap items-stretch justify-center rounded-[22px] border border-white/18 bg-[rgba(8,24,48,.5)] px-2.5 py-3.5 backdrop-blur-md">
            {STATS.map((s, i) => (
              <div key={s.value} className="flex">
                {i > 0 && <div className="my-1 hidden w-px bg-white/18 sm:block" />}
                <div className="px-7 py-1 text-center">
                  <div className="font-display text-[28px] leading-none font-extrabold" style={{ color: s.color }}>
                    {s.value}
                  </div>
                  <div className="mt-1.25 text-xs font-bold text-[#C9DAEC]">
                    {s.label[0]}
                    <br />
                    {s.label[1]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Why ---------------- */}
      <section className="bg-surface2 px-4.5 py-14 sm:px-6 sm:py-22">
        <div className="mx-auto max-w-310">
          <SectionHeading
            icon="route"
            eyebrow="WHY BRAINXNEXT"
            title="Built different,"
            highlight="on purpose."
            lead="No 40-hour video dumps. Every course is a fixed ladder of lessons ending in something you built."
            className="mb-11"
          />
          <div className="grid grid-cols-1 gap-4.5 min-[1001px]:grid-cols-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="card card-hover px-6 py-7">
                <span
                  className="flex h-13 w-13 items-center justify-center rounded-[15px]"
                  style={{ background: f.grad, boxShadow: `0 10px 24px ${f.glow}` }}
                >
                  <Icon name={f.icon} size={26} className="text-white" />
                </span>
                <div className="mt-4 mb-2 font-display text-lg font-bold text-ink">{f.title}</div>
                <div className="text-sm leading-relaxed text-muted">{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Courses ---------------- */}
      <section id="courses" className="bg-page px-4.5 py-14 sm:px-6 sm:py-22">
        <div className="mx-auto max-w-310">
          <div className="mb-7.5 flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              icon="school"
              eyebrow="COURSE CATALOG"
              title="Pick a track."
              highlight="Start today."
              align="left"
              className="[&_h2]:mt-4 [&_h2]:mb-0"
            />
            <button
              type="button"
              onClick={() => setFreeOnly((f) => !f)}
              data-active={freeOnly}
              className="filter-chip inline-flex items-center gap-2.5 px-5.5 py-3 text-sm font-extrabold data-[active=true]:border-transparent! data-[active=true]:bg-[linear-gradient(135deg,#3FA457,#5DBE74)]! data-[active=true]:text-white!"
            >
              <Icon name={freeOnly ? "check_circle" : "radio_button_unchecked"} size={18} />
              Free courses only
            </button>
          </div>

          <div className="mb-7 flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((label) => (
              <button
                key={label}
                type="button"
                data-active={cat === label}
                onClick={() => setCat(label)}
                className="filter-chip px-5 text-[13.5px]"
              >
                {label}
              </button>
            ))}
          </div>

          {coursesQuery.isPending || coursesQuery.isError ? (
            <QueryStatus query={coursesQuery}>{() => null}</QueryStatus>
          ) : shown.length > 0 ? (
            // phones show the first four; the full list is one tap away in the catalog
            <div className="grid grid-cols-1 gap-5 min-[1001px]:grid-cols-3 sm:grid-cols-2 max-sm:[&>*:nth-child(n+5)]:hidden">
              {shown.map((c) => (
                <CourseCard key={c.id} course={c} variant="featured" />
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border-[1.5px] border-dashed border-line bg-surface px-6 py-11 text-center">
              <div className="mb-2 font-display text-lg font-bold text-ink">No free courses in this track yet</div>
              <button
                type="button"
                className="btn btn-primary px-5.5 py-2.75"
                onClick={() => {
                  setCat("All");
                  setFreeOnly(false);
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <div className="text-[13.5px] font-bold text-soft">
              Showing <span className="sm:hidden">{Math.min(4, shown.length)}</span>
              <span className="max-sm:hidden">{shown.length}</span> of 48 courses
            </div>
            <Link to="/courses" className="btn btn-outline px-6.5 py-3.25">
              See full catalog
              <Icon name="arrow_forward" size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Notes ---------------- */}
      <section id="notes" className="hero-band px-4.5 py-14 sm:px-6 sm:py-22">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_400px_at_88%_10%,rgba(27,111,208,.3),transparent_65%),radial-gradient(520px_360px_at_8%_90%,rgba(233,162,27,.16),transparent_65%)]" />
        <div className="relative mx-auto grid max-w-310 grid-cols-1 items-start gap-13 min-[1001px]:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
          <div className="flex flex-col gap-5">
            <div className="eyebrow-dark px-4! text-xs! font-extrabold! tracking-widest! text-[#CFE0F2]!">
              <Icon name="description" size={16} className="text-gold" />
              FREE NOTES
            </div>
            <h2 className="m-0 font-display text-[clamp(30px,4vw,46px)] leading-[1.1] font-extrabold tracking-[-0.02em]">
              Notes worth
              <br />
              <span className="text-grad-hero">more than slides.</span>
            </h2>
            <p className="m-0 max-w-[44ch] text-base leading-relaxed text-[#B9CCE2]">
              Every course ships condensed revision notes and cheat sheets — free to download, even without an account.
            </p>
            <Link to="/notes" className="btn btn-gold w-max px-6.5 py-3.5 text-[15px]">
              Browse all notes
              <Icon name="arrow_forward" size={18} />
            </Link>
          </div>
          <QueryStatus query={notesQuery} className="text-[#A9BFD8]">
            {(notes) => (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {notes.map((n) => (
                  <Link
                    key={n.title}
                    to="/notes"
                    className="flex flex-col gap-3 rounded-[18px] border border-white/13 bg-white/6 p-5 text-white backdrop-blur-sm transition-all duration-250 hover:-translate-y-1 hover:bg-white/11 hover:text-white"
                  >
                    <span className="flex h-10.5 w-10.5 items-center justify-center rounded-xl" style={{ background: n.grad }}>
                      <Icon name={n.icon} size={21} className="text-white" />
                    </span>
                    <span className="font-display text-[15.5px] leading-tight font-bold">{n.title}</span>
                    <span className="flex items-center justify-between text-xs font-bold text-[#A9BFD8]">
                      <span>{n.meta}</span>
                      <span className="inline-flex items-center gap-1.25 text-[#8FD8E8]">
                        <Icon name="download" size={15} />
                        PDF
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </QueryStatus>
        </div>
      </section>

      {/* ---------------- Pricing ---------------- */}
      <section id="pricing" className="bg-surface2 px-4.5 py-14 sm:px-6 sm:py-22">
        <div className="mx-auto max-w-275">
          <SectionHeading
            icon="payments"
            eyebrow="PRICING"
            title="Three ways in."
            lead="Cancel anytime — courses you bought stay yours forever."
            className="mb-11 max-w-160"
          />
          <div className="grid grid-cols-1 items-stretch gap-5 min-[1001px]:grid-cols-3 sm:grid-cols-2">
            {PLANS.map((p) => (
              <PricingCard key={p.name} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section id="contact" className="bg-page px-4.5 py-14 sm:px-6 sm:py-22">
        <div className="relative mx-auto max-w-275 overflow-hidden rounded-4xl bg-navy bg-[radial-gradient(700px_440px_at_85%_0%,rgba(27,111,208,.42),transparent_65%),radial-gradient(560px_380px_at_10%_100%,rgba(233,162,27,.24),transparent_65%)] px-6 py-14 text-white shadow-[0_30px_70px_rgba(10,27,51,.28)] sm:px-12">
          <div className="grid grid-cols-1 items-center gap-11 min-[1001px]:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
            <div className="flex flex-col gap-4.5">
              <h2 className="m-0 font-display text-[clamp(28px,3.6vw,42px)] leading-[1.1] font-extrabold tracking-[-0.02em]">
                One free course is
                <br />
                <span className="text-grad-hero">enough to find out.</span>
              </h2>
              <p className="m-0 max-w-[44ch] text-base leading-relaxed text-[#C9DAEC]">
                Questions about courses, teams or teaching with us? Drop your email — we reply within a day.
              </p>
            </div>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <div className="flex rounded-full border border-white/20 bg-white/8 py-1.5 pr-1.5 pl-5 backdrop-blur-sm">
                <input
                  type="email"
                  aria-label="Email address"
                  placeholder="you@email.com"
                  className="min-w-0 flex-1 border-0 bg-transparent text-[14.5px] font-semibold text-white outline-none placeholder:text-[#8AA0B8]"
                />
                <button type="submit" className="btn btn-gold px-6 py-3.25 shadow-none!">
                  Get started
                </button>
              </div>
              <span className="pl-5 text-[12.5px] font-semibold text-[#8AA0B8]">
                No spam. One email a month with new courses and notes.
              </span>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
