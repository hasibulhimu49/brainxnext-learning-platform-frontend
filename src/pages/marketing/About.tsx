import type { ReactNode } from "react";
import aboutImg from "@/assets/images/about-team.webp";
import HeroBand from "@/components/common/HeroBand";
import Icon from "@/components/common/Icon";
import CtaBanner from "@/components/marketing/CtaBanner";
import useCatalogStats, { type CatalogStats } from "@/components/marketing/useCatalogStats";
import usePageTitle from "@/hooks/usePageTitle";
import { plural } from "@/lib/utils";

/** The course figure comes from the catalog so it always matches /courses. */
const aboutStats = (stats: CatalogStats | null) => [
  { key: "youtube", value: "31k", color: "#1B6FD0", label: "YouTube subscribers" },
  { key: "learners", value: "8,400+", color: "#0E97B0", label: "Active learners" },
  { key: "courses", value: stats ? String(stats.total) : "–", color: "#E9A21B", label: stats ? `Courses, ${stats.free} free` : "Courses" },
  { key: "finish", value: "96%", color: "#3FA457", label: "Roadmap finish rate" },
];

const VALUES = [
  {
    icon: "construction",
    grad: "linear-gradient(135deg,#1B6FD0,#3E92E8)",
    glow: "rgba(27,111,208,.3)",
    title: "Building beats watching",
    text: "You haven't learned it until you've built with it. Every module ends in something you made, not something you watched.",
  },
  {
    icon: "translate",
    grad: "linear-gradient(135deg,#0E97B0,#2FB8CF)",
    glow: "rgba(14,151,176,.3)",
    title: "Your language matters",
    text: "Hard ideas land best in your mother tongue. We teach in Bangla first, with code and terms kept industry-standard.",
  },
  {
    icon: "favorite",
    grad: "linear-gradient(135deg,#E9A21B,#F2BC4B)",
    glow: "rgba(233,162,27,.3)",
    title: "Access before profit",
    text: "No ads, no fake discounts, a free tier that's actually free. We charge for feedback and structure — never for knowledge.",
  },
];

const MENTORS = [
  {
    name: "BrainXNext",
    grad: "linear-gradient(135deg,#1B6FD0,#0E97B0)",
    role: "Founder · Java & Backend",
    bio: "Started the channel with Java classes in Bangla. Records the core Java track and reviews backend submissions.",
    rating: "4.9",
  },
  {
    name: "Ayesha Rahman",
    grad: "linear-gradient(135deg,#1B6FD0,#3E92E8)",
    role: "Data Engineer · Grameenphone",
    bio: "Builds data pipelines for 80M subscribers by day. Teaches the Python and SQL tracks with real, messy datasets.",
    rating: "4.9",
  },
  {
    name: "Tanvir Hasan",
    grad: "linear-gradient(135deg,#0E97B0,#2FB8CF)",
    role: "Staff Frontend Eng · Shopify",
    bio: "Ten years of JavaScript in production. Teaches the JS and React tracks and reviews frontend architecture work.",
    rating: "4.8",
  },
  {
    name: "Nadia Karim",
    grad: "linear-gradient(135deg,#E9A21B,#F2BC4B)",
    role: "Product Designer · Figma",
    bio: "Designs design tools for designers. Teaches design systems and UX research with portfolio-grade briefs.",
    rating: "4.9",
  },
  {
    name: "Dr. Imran Chowdhury",
    initial: "I",
    grad: "linear-gradient(135deg,#7A4FD0,#9B6FE8)",
    role: "ML Lead · bKash",
    bio: "PhD in ML, ships fraud-detection models daily. Teaches the AI track and the LLM engineering course.",
    rating: "4.8",
  },
  {
    name: "Meher Afroz",
    grad: "linear-gradient(135deg,#D0491B,#E9744B)",
    role: "Product Analyst · Pathao",
    bio: "Turns ride-share data into product decisions. Teaches analytics and the business track's metrics courses.",
    rating: "4.7",
  },
];

const Eyebrow = ({ icon, children }: { icon: string; children: ReactNode }) => (
  <div className="eyebrow">
    <Icon name={icon} size={16} />
    {children}
  </div>
);

const About = () => {
  usePageTitle("About");
  const stats = useCatalogStats();
  return (
    <>
      <HeroBand className="pt-18 pb-16">
        <div className="eyebrow-dark">
          <Icon name="flag" size={16} className="text-gold" />
          OUR MISSION
        </div>
        <h1 className="m-0 font-display text-[clamp(32px,4.4vw,52px)] leading-[1.08] font-extrabold tracking-[-0.02em]">
          Free where it counts,
          <br />
          <span className="text-grad-hero">paid where it&apos;s worth it.</span>
        </h1>
        <p className="m-0 max-w-145 text-base leading-[1.65] font-semibold text-[#C3D8EF]">
          BrainXNext started as a YouTube channel teaching Java in Bangla. Today it&apos;s a structured learning platform — because a
          playlist can teach you syntax, but only structure, projects and honest feedback make you hireable.
        </p>
      </HeroBand>

      <section className="bg-page px-4.5 sm:px-6">
        <div className="relative mx-auto -mt-9 grid max-w-275 grid-cols-2 gap-4 min-[1001px]:grid-cols-4">
          {aboutStats(stats).map((s) => (
            <div key={s.key} className="rounded-[20px] border border-line bg-surface p-6 text-center shadow-card-lg">
              <div className="font-display text-[28px] leading-none font-extrabold" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="mt-1.5 text-[12.5px] font-bold text-soft">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-page px-4.5 py-18 sm:px-6">
        <div className="mx-auto grid max-w-275 grid-cols-1 items-center gap-11 min-[1001px]:grid-cols-2">
          <div className="relative aspect-4/3 overflow-hidden rounded-[26px] shadow-card-lg">
            <img src={aboutImg} alt="Students learning together at a workshop" className="absolute inset-0 h-full w-full object-cover" />
            <a
              href="https://unsplash.com/@nesabymakers"
              target="_blank"
              rel="noreferrer"
              className="absolute right-3 bottom-2 text-[10.5px] font-semibold text-white/70 hover:text-white"
            >
              Photo by NESA by Makers on Unsplash
            </a>
          </div>
          <div className="flex flex-col gap-4.5">
            <Eyebrow icon="history_edu">OUR STORY</Eyebrow>
            <h2 className="m-0 font-display text-[clamp(26px,3.2vw,38px)] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">
              From a channel
              <br />
              to a classroom.
            </h2>
            <p className="m-0 text-[15px] leading-[1.7] font-medium text-muted">
              We uploaded our first Java class in Bangla because good explanations in our language were nowhere to be found. Thousands of
              learners later, the pattern was obvious: people didn&apos;t quit because content was scarce — they quit because nobody
              structured it, reviewed their work, or told them what to do next.
            </p>
            <p className="m-0 text-[15px] leading-[1.7] font-medium text-muted">
              So we built BrainXNext around three promises: every course is a fixed ladder with a build at the end, every submission gets
              human feedback, and a real free tier stays free — because the student we care most about is the one who can&apos;t pay yet.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-page px-4.5 pb-18 sm:px-6">
        <div className="mx-auto max-w-275">
          <div className="mx-auto mb-9 flex max-w-155 flex-col items-center text-center">
            <Eyebrow icon="diversity_3">VALUES WE TEACH BY</Eyebrow>
            <h2 className="mt-4 mb-0 font-display text-[clamp(26px,3.2vw,38px)] font-extrabold tracking-[-0.02em] text-ink">
              What we believe
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4.5 min-[640px]:grid-cols-2 min-[1001px]:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="card px-6 py-7">
                <span
                  className="flex h-12.5 w-12.5 items-center justify-center rounded-[15px]"
                  style={{ background: v.grad, boxShadow: `0 10px 24px ${v.glow}` }}
                >
                  <Icon name={v.icon} size={25} className="text-white" />
                </span>
                <div className="mt-4 mb-2 font-display text-[17px] font-bold text-ink">{v.title}</div>
                <div className="text-sm leading-relaxed text-muted">{v.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="mentors" className="bg-surface2 px-4.5 pt-18 pb-20 sm:px-6">
        <div className="mx-auto max-w-275">
          <div className="mx-auto mb-9 flex max-w-155 flex-col items-center text-center">
            <Eyebrow icon="school">THE MENTORS</Eyebrow>
            <h2 className="mt-4 mb-2.5 font-display text-[clamp(26px,3.2vw,38px)] font-extrabold tracking-[-0.02em] text-ink">
              Taught by people still doing the work
            </h2>
            <p className="m-0 text-[15px] leading-relaxed font-medium text-muted">
              Every mentor holds a current practitioner role — they record the classes, review your submissions and hold one live office
              hour a week.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4.5 min-[640px]:grid-cols-2 min-[1001px]:grid-cols-3">
            {MENTORS.map((m) => (
              <div
                key={m.name}
                className="card flex flex-col gap-3.5 px-6 py-6.5 transition-all duration-300 hover:-translate-y-1.25 hover:shadow-card-lg"
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className="flex h-14 w-14 flex-none items-center justify-center rounded-full font-display text-[19px] font-extrabold text-white shadow-[0_8px_20px_rgba(16,42,80,.18)]"
                    style={{ background: m.grad }}
                  >
                    {m.initial ?? m.name[0]}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.75">
                    <span className="font-display text-base font-bold text-ink">{m.name}</span>
                    <span className="text-[12.5px] font-semibold text-soft">{m.role}</span>
                  </span>
                </div>
                <p className="m-0 text-[13.5px] leading-relaxed font-medium text-muted">{m.bio}</p>
                <div className="flex items-center justify-between border-t border-line pt-3.25">
                  <span className="text-xs font-extrabold text-brand">{stats ? plural(stats.byMentor[m.name] ?? 0, "course") : " "}</span>
                  <span className="inline-flex items-center gap-1.25 text-xs font-bold text-soft">
                    <Icon name="star" size={15} className="text-amber" />
                    {m.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        className="pt-18 pb-22"
        title="Still doing the work?"
        highlight="Teach with us."
        text="We pay per course and per review, and handle production. You bring the experience."
        cta="Apply as a mentor"
        to="/contact?topic=teach"
      />
    </>
  );
};

export default About;
