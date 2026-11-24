import { useMemo, useState } from "react";
import HeroBand from "@/components/common/HeroBand";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import CourseCard from "@/components/course/CourseCard";
import { CATEGORY_FILTERS, LEVEL_FILTERS, type CategoryFilter, type LevelFilter } from "@/constants/catalog";
import { useCourses } from "@/queries/courses";
import usePageTitle from "@/hooks/usePageTitle";

const Catalog = () => {
  usePageTitle("Courses");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CategoryFilter>("All");
  const [level, setLevel] = useState<LevelFilter>("All levels");
  const coursesQuery = useCourses();
  const [freeOnly, setFreeOnly] = useState(false);

  const q = query.trim().toLowerCase();
  const filtersOn = Boolean(q) || cat !== "All" || level !== "All levels" || freeOnly;

  const shown = useMemo(
    () =>
      (coursesQuery.data ?? []).filter(
        (c) =>
          (cat === "All" || c.cat === cat) &&
          (level === "All levels" || c.level === level) &&
          (!freeOnly || c.free) &&
          (!q || `${c.title} ${c.blurb} ${c.cat} ${c.mentor}`.toLowerCase().includes(q))
      ),
    [coursesQuery.data, q, cat, level, freeOnly]
  );

  const clearAll = () => {
    setQuery("");
    setCat("All");
    setLevel("All levels");
    setFreeOnly(false);
  };

  return (
    <>
      <HeroBand className="pt-14 pb-12">
        <h1 className="m-0 font-display text-[clamp(30px,4.2vw,48px)] leading-[1.06] font-extrabold tracking-[-0.02em]">
          Explore all <span className="text-grad-hero">courses</span>
        </h1>
        <p className="m-0 max-w-120 text-[15.5px] leading-relaxed font-semibold text-[#C3D8EF]">
          Search by name, topic or mentor — or filter by track and level.
        </p>
        <div className="flex w-full max-w-140 items-center gap-2.5 rounded-full border border-white/24 bg-white/10 py-1.5 pr-1.5 pl-5.5 backdrop-blur-sm">
          <Icon name="search" size={20} className="text-[#8FD8E8]" />
          <input
            type="text"
            aria-label="Search courses"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, e.g. java, sql, design…"
            className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-[15px] font-semibold text-white outline-none placeholder:text-[#8AA0B8]"
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-white/14 text-white"
            >
              <Icon name="close" size={18} />
            </button>
          )}
        </div>
      </HeroBand>

      <section className="bg-page px-4.5 pt-9 pb-22 sm:px-6">
        <div className="mx-auto flex max-w-310 flex-col gap-5.5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORY_FILTERS.map((label) => (
                <button key={label} type="button" data-active={cat === label} onClick={() => setCat(label)} className="filter-chip">
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {LEVEL_FILTERS.map((label) => (
                <button
                  key={label}
                  type="button"
                  data-active={level === label}
                  onClick={() => setLevel(label)}
                  className="filter-chip filter-chip-soft px-4 py-2.25 text-[12.5px]"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                data-active={freeOnly}
                onClick={() => setFreeOnly((f) => !f)}
                className="filter-chip inline-flex items-center gap-2 px-4.25 py-2.25 text-[12.5px] font-extrabold data-[active=true]:bg-[linear-gradient(135deg,#3FA457,#5DBE74)]!"
              >
                <Icon name={freeOnly ? "check_circle" : "radio_button_unchecked"} size={16} />
                Free only
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3.5">
            <span className="text-[13.5px] font-bold text-soft">
              {shown.length} course{shown.length === 1 ? "" : "s"}
              {filtersOn ? " found" : " — all tracks"}
            </span>
            {filtersOn && (
              <button type="button" onClick={clearAll} className="border-0 bg-transparent p-0 text-[13px] font-extrabold text-brand">
                Clear all filters
              </button>
            )}
          </div>

          {coursesQuery.isPending || coursesQuery.isError ? (
            <QueryStatus query={coursesQuery}>{() => null}</QueryStatus>
          ) : shown.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 min-[1001px]:grid-cols-3 sm:grid-cols-2">
              {shown.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-[22px] border-[1.5px] border-dashed border-line bg-surface px-6 py-13 text-center">
              <Icon name="search_off" size={38} className="text-soft" />
              <div className="font-display text-lg font-bold text-ink">
                {q ? `No courses match "${query}"` : "No courses match these filters"}
              </div>
              <div className="text-[13.5px] font-semibold text-soft">Try a different keyword, or clear the filters.</div>
              <button type="button" onClick={clearAll} className="btn btn-primary mt-1.5 px-6 py-3">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Catalog;
