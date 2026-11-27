import { Link } from "react-router-dom";
import notesHero from "@/assets/images/notes-hero.webp";
import HeroBand from "@/components/common/HeroBand";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import { handbookSlug } from "@/constants/downloads";
import usePageTitle from "@/hooks/usePageTitle";
import { useHandbooks } from "@/queries/courses";

const Notes = () => {
  usePageTitle("Free handbooks");
  const handbooks = useHandbooks();
  return (
    <>
      <HeroBand
        image={notesHero}
        credit={{ name: "Ilya Pavlov", href: "https://unsplash.com/@ilyapavlov" }}
        className="pt-18 pb-16"
        innerClassName="max-w-200 items-center text-center"
      >
        <div className="eyebrow-dark">
          <Icon name="description" size={16} className="text-gold" />
          FREE FOR EVERYONE — NO ACCOUNT NEEDED
        </div>
        <h1 className="m-0 font-display text-[clamp(34px,4.6vw,56px)] leading-[1.06] font-extrabold tracking-[-0.02em]">
          Free <span className="text-grad-hero">handbooks</span>
        </h1>
        <p className="m-0 max-w-140 text-[16.5px] leading-relaxed font-semibold text-[#C3D8EF]">
          Condensed revision notes and cheat sheets for the tools our courses teach — written by our mentors, updated with every cohort.
        </p>
      </HeroBand>

      <section id="handbooks" className="bg-page px-4.5 pt-18 pb-22 sm:px-6">
        <div className="mx-auto max-w-310">
          <QueryStatus query={handbooks}>
            {(books) => (
              <div className="grid grid-cols-1 gap-5 min-[640px]:grid-cols-2 min-[1001px]:grid-cols-4">
                {books.map((b) => (
                  <div key={b.name} className="card card-hover flex flex-col items-center gap-1.5 px-6 pt-8 pb-6 text-center">
                    <span
                      className="mb-3.5 flex h-24 w-24 items-center justify-center rounded-full"
                      style={{ background: b.grad, boxShadow: `0 12px 28px ${b.glow}` }}
                    >
                      <img src={`/logos/${b.logo}.svg`} alt={`${b.name} logo`} width={48} height={48} loading="lazy" />
                    </span>
                    <div className="font-display text-lg font-bold tracking-[-0.01em] text-ink">{b.name} Handbook</div>
                    <div className="text-[13px] font-semibold text-muted">{b.meta}</div>
                    <Link to={`/support?handbook=${handbookSlug(b.name)}`} className="btn btn-primary mt-4 w-full px-4.5 py-3.25">
                      <Icon name="download" size={18} />
                      Download
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </QueryStatus>

          <div className="mt-12 flex flex-col items-center gap-3.5 text-center">
            <p className="m-0 max-w-[52ch] text-[14.5px] font-semibold text-muted">
              Want a handbook we haven&apos;t written yet? Tell us and we&apos;ll put it on the roadmap.
            </p>
            <Link to="/contact" className="btn btn-outline px-6.5 py-3.25">
              Request a handbook
              <Icon name="arrow_forward" size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Notes;
