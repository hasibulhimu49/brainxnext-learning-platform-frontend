import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import HeroBand from "@/components/common/HeroBand";
import Icon from "@/components/common/Icon";
import FaqItem from "@/components/marketing/FaqItem";
import { filterHelpQuestions, HELP_CATEGORIES, HELP_QUESTIONS, type HelpCategoryId } from "@/constants/help";
import usePageTitle from "@/hooks/usePageTitle";

type CategoryFilter = HelpCategoryId | "all";

const isCategory = (id: string): id is HelpCategoryId => HELP_CATEGORIES.some((c) => c.id === id);

/** Help centre: searchable FAQ grouped by category, with a contact CTA. */
const Help = () => {
  usePageTitle("Help");
  const { hash } = useLocation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>(() => {
    const fromHash = hash.slice(1);
    return isCategory(fromHash) ? fromHash : "all";
  });
  const [open, setOpen] = useState<string | null>(null);

  // the route is lazy-loaded, so ScrollToTop may run before this section exists
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  const results = useMemo(() => filterHelpQuestions(HELP_QUESTIONS, query, category), [query, category]);
  const groups = HELP_CATEGORIES.map((c) => ({ ...c, items: results.filter((r) => r.category === c.id) })).filter(
    (g) => g.items.length > 0
  );

  return (
    <>
      <HeroBand className="pt-16 pb-14" innerClassName="max-w-190 items-center text-center gap-4!">
        <div className="eyebrow-dark">
          <Icon name="support_agent" size={16} className="text-gold" />
          HELP CENTER
        </div>
        <h1 className="m-0 font-display text-[clamp(32px,4.4vw,52px)] leading-[1.06] font-extrabold tracking-[-0.02em]">
          How can we <span className="text-grad-hero">help?</span>
        </h1>
        <p className="m-0 max-w-130 text-base leading-relaxed font-semibold text-[#C3D8EF]">
          Answers about your account, courses, payments, certificates and mentor review.
        </p>
        <div role="search" className="relative mt-2 w-full max-w-140">
          <Icon name="search" size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-soft" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search help articles"
            placeholder="Search questions, e.g. refund"
            className="field rounded-full! border-white/20! bg-surface! py-3.75! pr-5! pl-12! text-[15px]! shadow-pop"
          />
        </div>
      </HeroBand>

      <section className="bg-page px-4.5 pt-12 pb-22 sm:px-6">
        <div className="mx-auto max-w-225">
          <div className="mb-9 flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="Category">
            {[{ id: "all" as const, label: "All topics" }, ...HELP_CATEGORIES].map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={category === c.id}
                data-active={category === c.id}
                onClick={() => setCategory(c.id)}
                className="filter-chip"
              >
                {c.label}
              </button>
            ))}
          </div>

          <p className="sr-only" role="status">
            {results.length === 1 ? "1 question found" : `${results.length} questions found`}
          </p>

          {groups.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
              <Icon name="search_off" size={34} className="text-soft" />
              <h2 className="m-0 font-display text-lg font-bold text-ink">No matching questions</h2>
              <p className="m-0 max-w-[40ch] text-sm font-medium text-muted">
                Try a different word, pick another topic, or ask us directly — we reply within 24 hours.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {groups.map((g) => (
                <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="scroll-mt-24">
                  <h2
                    id={`${g.id}-h`}
                    className="mt-0 mb-4 flex items-center gap-2.5 font-display text-[20px] font-bold tracking-[-0.01em] text-ink"
                  >
                    <Icon name={g.icon} size={22} className="text-brand" />
                    {g.label}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {g.items.map((f) => (
                      <FaqItem key={f.q} q={f.q} a={f.a} open={open === f.q} onToggle={() => setOpen(open === f.q ? null : f.q)} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <div className="card mt-12 flex flex-wrap items-center justify-between gap-5 rounded-3xl! px-6 py-7 sm:px-9">
            <div className="flex items-center gap-4">
              <span className="flex h-12.5 w-12.5 flex-none items-center justify-center rounded-[15px] bg-[linear-gradient(135deg,#1B6FD0,#0E97B0)] shadow-[0_10px_24px_rgba(27,111,208,.3)]">
                <Icon name="forum" size={24} className="text-white" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-display text-[17px] font-bold text-ink">Still stuck?</span>
                <span className="text-[13.5px] font-medium text-muted">Send us a message — a real person replies within 24 hours.</span>
              </span>
            </div>
            <Link to="/contact" className="btn btn-primary px-6.5 py-3.25">
              Contact us
              <Icon name="arrow_forward" size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Help;
