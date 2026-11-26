import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";
import { formatTaka } from "@/lib/utils";
import type { Course } from "@/types/course";

interface CourseCompleteCardProps {
  course: Course;
  /** Pro, or bought this course */
  entitled: boolean;
  /** the issued certificate, once the list has refreshed */
  certificateId?: string;
}

/** Celebration shown in the player once every lesson is complete. */
const CourseCompleteCard = ({ course, entitled, certificateId }: CourseCompleteCardProps) => (
  <section
    aria-labelledby="course-complete"
    className="relative overflow-hidden rounded-3xl border border-[rgba(111,183,255,.3)] bg-[linear-gradient(165deg,#0F2A4E,#0A1B33)] p-6 text-white shadow-[0_20px_48px_rgba(10,27,51,.3)] sm:p-7"
  >
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_260px_at_88%_0%,rgba(233,162,27,.28),transparent_65%),radial-gradient(360px_240px_at_0%_100%,rgba(27,111,208,.3),transparent_65%)]" />
    <div className="relative flex flex-wrap items-center gap-5">
      <span className="bg-grad-gold flex h-14 w-14 flex-none items-center justify-center rounded-[18px] shadow-[0_10px_24px_rgba(233,162,27,.35)]">
        <Icon name="emoji_events" size={28} className="text-cocoa" />
      </span>
      <div className="flex min-w-55 flex-1 flex-col gap-1.5">
        <span className="text-[11.5px] font-extrabold tracking-[0.12em] text-[#8FD8E8]">COURSE COMPLETE</span>
        <h2 id="course-complete" className="m-0 font-display text-[clamp(18px,2.4vw,22px)] font-extrabold tracking-[-0.01em]">
          You finished {course.title}!
        </h2>
        <p className="m-0 text-[13.5px] leading-relaxed font-medium text-[#A9BFD8]">
          {entitled
            ? "All lessons done. Your certificate is ready to view, download and share."
            : "All lessons done. Certificates and mentor review come with Pro — upgrade to get yours for this course."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {entitled && certificateId ? (
          <Link to={`/certificates/${certificateId}`} className="btn btn-gold px-5.5 py-3 text-[14px]">
            <Icon name="workspace_premium" size={18} />
            Get your certificate
          </Link>
        ) : entitled ? (
          // the card shows optimistically; the certificate id arrives once the list refreshes
          <span role="status" className="btn btn-gold px-5.5 py-3 text-[14px] opacity-70">
            <Icon name="hourglass_top" size={18} />
            Preparing your certificate…
          </span>
        ) : (
          <>
            <Link to="/checkout/plan/pro" className="btn btn-gold px-5.5 py-3 text-[14px]">
              <Icon name="bolt" size={18} />
              Go Pro
            </Link>
            {!course.free && (
              <Link
                to={`/checkout/${course.id}`}
                className="btn border border-white/25 bg-white/10 px-5.5 py-3 text-[14px] text-white hover:text-white"
              >
                Buy for {formatTaka(course.price)}
              </Link>
            )}
          </>
        )}
        {/* F-006: finishing is the best moment to ask for a review */}
        <Link
          to={`/courses/${course.id}#reviews`}
          className="btn border border-white/25 bg-white/10 px-5.5 py-3 text-[14px] text-white hover:text-white"
        >
          <Icon name="star" size={18} />
          Rate this course
        </Link>
      </div>
    </div>
  </section>
);

export default CourseCompleteCard;
