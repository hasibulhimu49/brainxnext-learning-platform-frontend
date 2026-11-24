import { Link } from "react-router-dom";
import HeroBand from "../common/HeroBand";
import Icon from "../common/Icon";
import { LEGAL_LAST_UPDATED, type LegalDoc } from "@/constants/legal";
import usePageTitle from "@/hooks/usePageTitle";

const RELATED = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/refunds", label: "Refund Policy" },
];

const TocLinks = ({ doc }: { doc: LegalDoc }) => (
  <ol className="m-0 flex list-none flex-col gap-0.5 p-0">
    {doc.sections.map((s) => (
      <li key={s.id}>
        <a
          href={`#${s.id}`}
          className="block rounded-[10px] px-3 py-1.75 text-[13px] font-semibold text-muted transition-colors hover:bg-surface2 hover:text-brand"
        >
          {s.heading}
        </a>
      </li>
    ))}
  </ol>
);

/**
 * Shared layout for /privacy, /terms and /refunds: HeroBand header, an "On this page" list
 * (sticky on desktop, collapsible on mobile) and one prose card.
 */
const LegalPage = ({ doc }: { doc: LegalDoc }) => {
  usePageTitle(doc.title);
  return (
    <>
      <HeroBand className="pt-16 pb-14" innerClassName="max-w-190 items-center text-center gap-4!">
        <div className="eyebrow-dark">
          <Icon name={doc.icon} size={16} className="text-gold" />
          {doc.eyebrow}
        </div>
        <h1 className="m-0 font-display text-[clamp(32px,4.4vw,52px)] leading-[1.06] font-extrabold tracking-[-0.02em]">{doc.title}</h1>
        <p className="m-0 max-w-140 text-base leading-relaxed font-semibold text-[#C3D8EF]">{doc.subtitle}</p>
      </HeroBand>

      <section className="bg-page px-4.5 pt-14 pb-22 sm:px-6">
        <div className="mx-auto grid max-w-260 grid-cols-1 items-start gap-6 min-[1001px]:grid-cols-[240px_minmax(0,760px)]">
          <nav aria-label="On this page" className="min-[1001px]:sticky min-[1001px]:top-24">
            <details className="card group rounded-[18px]! p-2 min-[1001px]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-[13px] font-extrabold tracking-[0.08em] text-ink [&::-webkit-details-marker]:hidden">
                ON THIS PAGE
                <Icon name="expand_more" size={20} className="text-soft transition-transform group-open:rotate-180" />
              </summary>
              <div className="pt-1">
                <TocLinks doc={doc} />
              </div>
            </details>
            <div className="card hidden rounded-[18px]! p-3 min-[1001px]:block">
              <div className="px-3 pt-1.5 pb-2 text-[11px] font-extrabold tracking-[0.14em] text-soft">ON THIS PAGE</div>
              <TocLinks doc={doc} />
            </div>
          </nav>

          <article className="card rounded-3xl! px-5.5 py-8 sm:px-10 sm:py-10">
            <p className="mt-0 mb-8 inline-flex flex-wrap items-center gap-2 text-[12.5px] font-bold text-soft">
              <Icon name="edit_calendar" size={16} />
              Last updated: {LEGAL_LAST_UPDATED} · <span className="pill bg-chip text-brand">DRAFT</span>
            </p>
            <div className="flex flex-col gap-9">
              {doc.sections.map((s) => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24">
                  <h2 id={`${s.id}-h`} className="mt-0 mb-3 font-display text-[20px] font-bold tracking-[-0.01em] text-ink">
                    {s.heading}
                  </h2>
                  {s.paragraphs.map((p) => (
                    <p key={p} className="mt-0 mb-3 text-[15px] leading-[1.7] font-medium text-muted last:mb-0">
                      {p}
                    </p>
                  ))}
                  {s.list && (
                    <ul className="m-0 flex flex-col gap-2 pl-5 text-[15px] leading-[1.65] font-medium text-muted marker:text-brand">
                      {s.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-6 text-[13.5px] font-semibold">
              <span className="text-soft">Related:</span>
              {RELATED.filter((r) => r.label !== doc.title).map((r) => (
                <Link key={r.to} to={r.to} className="font-bold text-brand hover:underline">
                  {r.label}
                </Link>
              ))}
              <Link to="/help" className="font-bold text-brand hover:underline">
                Help center
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
};

export default LegalPage;
